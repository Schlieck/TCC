import { z } from 'zod';

export type ApiUrlResult = { ok: true; apiUrl: string } | { ok: false; message: string };

const httpUrl = z.url({ protocol: /^https?$/ });
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function parseApiUrl(raw: string | undefined): ApiUrlResult {
  if (!raw) {
    return {
      ok: false,
      message: 'Defina EXPO_PUBLIC_API_URL no arquivo mobile/.env (veja mobile/.env.example).',
    };
  }

  const parsed = httpUrl.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: `EXPO_PUBLIC_API_URL não é uma URL http válida: "${raw}".` };
  }

  if (LOOPBACK_HOSTS.has(new URL(parsed.data).hostname)) {
    return {
      ok: false,
      message:
        'EXPO_PUBLIC_API_URL aponta para localhost, que no celular é o próprio celular. Use o IP da sua máquina na rede local.',
    };
  }

  return { ok: true, apiUrl: parsed.data.replace(/\/+$/, '') };
}
