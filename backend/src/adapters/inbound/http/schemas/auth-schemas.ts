import { z } from 'zod';

export const registerBodySchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(100),
  email: z.string().trim().max(254).pipe(z.email('Informe um e-mail válido.')),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.').max(72),
  phone: z.string().trim().max(20),
  birthDate: z.iso.date('Use o formato AAAA-MM-DD.'),
  acceptedPrivacyTerms: z.boolean(),
});

export const logInBodySchema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail.').max(254),
  password: z.string().min(1, 'Informe a senha.').max(200),
});
