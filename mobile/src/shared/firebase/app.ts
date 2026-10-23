import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { firebaseConfig } from '@/shared/config/firebase-config';
import { AppError } from '@/shared/errors';

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

/** uid do usuário logado: toda consulta ao banco local filtra por ele. */
export function requireUid(): string {
  const user = requireAuth().currentUser;
  if (!user) {
    throw new AppError('Sua sessão expirou. Faça login novamente.');
  }
  return user.uid;
}
