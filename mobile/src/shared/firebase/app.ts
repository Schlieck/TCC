import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
  EmailAuthProvider,
  getReactNativePersistence,
  initializeAuth,
  reauthenticateWithCredential,
  type Auth,
  type User,
} from 'firebase/auth';
import { firebaseConfig } from '@/shared/config/firebase-config';
import { AppError } from '@/shared/errors';
import { translateAuthError } from './auth-errors';

function createAuth(): Auth | null {
  if (!firebaseConfig.ok) {
    return null;
  }
  const auth = initializeAuth(initializeApp(firebaseConfig.config), {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  // E-mails de verificação e de redefinição de senha em português.
  auth.languageCode = 'pt-BR';
  return auth;
}

/** `null` só quando falta configuração; o layout raiz mostra a tela de erro antes de usar. */
export const auth = createAuth();

export function requireAuth(): Auth {
  if (!auth) {
    throw new AppError('O Firebase não está configurado.');
  }
  return auth;
}

export function requireUser(): User {
  const user = requireAuth().currentUser;
  if (!user) {
    throw new AppError('Sua sessão expirou. Faça login novamente.');
  }
  return user;
}

/** uid do usuário logado: toda consulta ao banco local filtra por ele. */
export function requireUid(): string {
  return requireUser().uid;
}

/** Operações sensíveis (senha, e-mail, exclusão) pedem a senha atual de novo. */
export async function reauthenticate(currentPassword: string): Promise<User> {
  const user = requireUser();
  try {
    await reauthenticateWithCredential(
      user,
      EmailAuthProvider.credential(user.email ?? '', currentPassword),
    );
  } catch (error) {
    throw translateAuthError(error, { currentPasswordField: 'currentPassword' });
  }
  return user;
}
