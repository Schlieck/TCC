import { z } from 'zod';

export const updateProfileBodySchema = z
  .object({
    name: z.string().max(100, 'Use no máximo 100 caracteres.'),
    email: z.string().trim().max(254).pipe(z.email('Informe um e-mail válido.')),
    phone: z.string().trim().max(20),
    birthDate: z.iso.date('Use o formato AAAA-MM-DD.'),
  })
  .partial();

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual.').max(200),
  newPassword: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.').max(72),
});

export const verificationCodeBodySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'O código tem 6 números.'),
});
