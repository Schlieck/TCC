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

export function register(body: RegisterRequest): Promise<AuthSession> {
  return httpClient.request('/auth/register', authSessionSchema, { method: 'POST', body });
}
