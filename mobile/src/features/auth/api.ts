import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth';
import { createProfile, type NewProfileInput } from '@/features/account/api';
import { newProfileSchema } from '@/features/account/validation';
import { errorCode, translateAuthError } from '@/shared/firebase/auth-errors';
import { reauthenticate, requireAuth, requireUser } from '@/shared/firebase/app';
import { parseInput } from '@/shared/parse-input';

export interface LogInRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends NewProfileInput {
  email: string;
  password: string;
}

export async function logIn({ email, password }: LogInRequest): Promise<void> {
  try {
    await signInWithEmailAndPassword(requireAuth(), email, password);
  } catch (error) {
    throw translateAuthError(error);
  }
}

/** Cria a conta no Firebase e o perfil local (com o consentimento) e envia a verificação. */
export async function register({ email, password, ...profile }: RegisterRequest): Promise<void> {
  // Antes de criar a conta, para não deixar conta sem perfil por um dado inválido.
  parseInput(newProfileSchema, profile);
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(requireAuth(), email, password);
  } catch (error) {
    throw translateAuthError(error);
  }
  // Se o perfil falhar aqui, a tela "Complete seu cadastro" pede os dados de novo.
  await createProfile(credential.user.uid, profile);
  // Se o envio falhar, a tela de confirmação tem "Reenviar e-mail".
  await sendEmailVerification(credential.user).catch(() => undefined);
}

export async function resendVerification(): Promise<void> {
  try {
    await sendEmailVerification(requireUser());
  } catch (error) {
    throw translateAuthError(error);
  }
}

/** Responde igual exista ou não uma conta com o e-mail. */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(requireAuth(), email);
  } catch (error) {
    if (errorCode(error) !== 'auth/user-not-found') {
      throw translateAuthError(error);
    }
  }
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword({
  currentPassword,
  newPassword,
}: ChangePasswordRequest): Promise<void> {
  const user = await reauthenticate(currentPassword);
  try {
    await updatePassword(user, newPassword);
  } catch (error) {
    throw translateAuthError(error);
  }
}
