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
