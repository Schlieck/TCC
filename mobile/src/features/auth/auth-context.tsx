import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { profileQueryKey } from '@/features/account/hooks/use-profile';
import { authSession } from '@/shared/api/auth-session';
import { tokenStorage } from '@/shared/storage/token-storage';
import type { AuthSession } from './api';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthContextValue {
  status: AuthStatus;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');

  const signIn = useCallback(
    async ({ token, user }: AuthSession) => {
      await tokenStorage.save(token);
      authSession.setToken(token);
      queryClient.setQueryData(profileQueryKey, user);
      setStatus('signedIn');
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    authSession.setToken(null);
    queryClient.clear();
    setStatus('signedOut');
    await tokenStorage.clear();
  }, [queryClient]);

  // Token expirado ou revogado: a primeira resposta 401 da API encerra a sessão.
  useEffect(() => {
    authSession.onUnauthorized(() => {
      void signOut();
    });
    return () => {
      authSession.onUnauthorized(null);
    };
  }, [signOut]);

  useEffect(() => {
    let active = true;
    tokenStorage
      .read()
      .then((token) => {
        if (active) {
          authSession.setToken(token);
          setStatus(token ? 'signedIn' : 'signedOut');
        }
      })
      .catch(() => {
        if (active) {
          setStatus('signedOut');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ status, signIn, signOut }), [status, signIn, signOut]);
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  }
  return context;
}
