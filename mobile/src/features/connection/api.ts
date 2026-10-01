import { z } from 'zod';
import { ApiError } from '@/shared/api/errors';
import { httpClient } from '@/shared/api/http-client';

const healthSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  database: z.enum(['up', 'down']),
});

export type ApiHealth = z.infer<typeof healthSchema>;

const SERVICE_UNAVAILABLE = 503;

export async function fetchApiHealth(): Promise<ApiHealth> {
  try {
    return await httpClient.request('/health', healthSchema);
  } catch (error) {
    if (error instanceof ApiError && error.status === SERVICE_UNAVAILABLE) {
      return { status: 'degraded', database: 'down' };
    }
    throw error;
  }
}
