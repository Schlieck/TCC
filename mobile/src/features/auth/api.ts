import { z } from 'zod';
import { userProfileSchema } from '@/features/account/api';
import { httpClient } from '@/shared/api/http-client';

const authSessionSchema = z.object({
  token: z.string(),
  user: userProfileSchema,
});

export type AuthSession = z.infer<typeof authSessionSchema>;

export interface LogInRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  birthDate: string;
  acceptedPrivacyTerms: boolean;
}

export function logIn(body: LogInRequest): Promise<AuthSession> {
  return httpClient.request('/auth/login', authSessionSchema, { method: 'POST', body });
}

/** Envia o código de confirmação; responde igual mesmo que o e-mail já tenha conta. */
export function register(body: RegisterRequest): Promise<void> {
  return httpClient.execute('/auth/register', { method: 'POST', body });
}

export interface ConfirmRegistrationRequest {
  email: string;
  code: string;
}

export function confirmRegistration(body: ConfirmRegistrationRequest): Promise<AuthSession> {
  return httpClient.request('/auth/register/confirm', authSessionSchema, {
    method: 'POST',
    body,
  });
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** A API devolve uma sessão nova: o token antigo deixa de valer. */
export function changePassword(body: ChangePasswordRequest): Promise<AuthSession> {
  return httpClient.request('/me/password', authSessionSchema, { method: 'PUT', body });
}

/** Sempre responde igual, exista ou não uma conta com o e-mail. */
export function requestPasswordReset(email: string): Promise<void> {
  return httpClient.execute('/auth/password-reset/request', { method: 'POST', body: { email } });
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export function resetPassword(body: ResetPasswordRequest): Promise<AuthSession> {
  return httpClient.request('/auth/password-reset/confirm', authSessionSchema, {
    method: 'POST',
    body,
  });
}
