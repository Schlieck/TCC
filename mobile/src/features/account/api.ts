import { z } from 'zod';
import { httpClient } from '@/shared/api/http-client';

export const userProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  birthDate: z.string(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export function fetchProfile(): Promise<UserProfile> {
  return httpClient.request('/me', userProfileSchema);
}

export interface ProfileChanges {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
}

export function updateProfile(changes: ProfileChanges): Promise<UserProfile> {
  return httpClient.request('/me', userProfileSchema, { method: 'PATCH', body: changes });
}

/** Envia o código de confirmação para o e-mail cadastrado. */
export function requestAccountDeletion(): Promise<void> {
  return httpClient.execute('/me/deletion-request', { method: 'POST', body: {} });
}

export function confirmAccountDeletion(code: string): Promise<void> {
  return httpClient.execute('/me/deletion', { method: 'POST', body: { code } });
}
