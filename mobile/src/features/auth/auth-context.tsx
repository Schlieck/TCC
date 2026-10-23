import { useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged, reload, signOut as firebaseSignOut, type User } from 'firebase/auth';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { hasProfile } from '@/features/account/api';
import { auth, requireAuth } from '@/shared/firebase/app';
import { translateAuthError } from '@/shared/firebase/auth-errors';

/**
 * `unverified`: falta clicar no link do e-mail. `needsProfile`: a conta existe, mas este aparelho
 * ainda não tem o perfil local (reinstalação, outro celular).
 */
export type AuthStatus = 'loading' | 'signedOut' | 'unverified' | 'needsProfile' | 'signedIn';

interface AuthContextValue {
  status: AuthStatus;
  email: string | null;
  /** Relê o usuário no Firebase (e-mail confirmado?) e o perfil local. */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function statusOf(user: User | null): Promise<AuthStatus> {
  if (!user) {
    return 'signedOut';
  }
  if (!user.emailVerified) {
    return 'unverified';
  }
  return (await hasProfile(user.uid)) ? 'signedIn' : 'needsProfile';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>(auth ? 'loading' : 'signedOut');
  const [email, setEmail] = useState<string | null>(null);
  const uidRef = useRef<string | null>(null);
  // Descarta resultados atrasados quando o usuário muda no meio da leitura do perfil.
  const generationRef = useRef(0);

  const apply = useCallback(
    async (user: User | null) => {
      const generation = ++generationRef.current;
      if ((user?.uid ?? null) !== uidRef.current) {
        uidRef.current = user?.uid ?? null;
        queryClient.clear();
      }
      const next = await statusOf(user).catch((): AuthStatus => 'signedOut');
      if (generation === generationRef.current) {
        setEmail(user?.email ?? null);
        setStatus(next);
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (!auth) {
      return;
    }
    return onAuthStateChanged(auth, (user) => {
      void apply(user);
    });
  }, [apply]);

  const refresh = useCallback(async () => {
    const user = requireAuth().currentUser;
    if (user) {
      try {
        await reload(user);
      } catch (error) {
        throw translateAuthError(error);
      }
    }
    await apply(requireAuth().currentUser);
  }, [apply]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(requireAuth());
  }, []);

  const value = useMemo(
    () => ({ status, email, refresh, signOut }),
    [status, email, refresh, signOut],
  );
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  }
  return context;
}
