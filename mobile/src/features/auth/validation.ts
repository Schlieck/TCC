import { format } from 'date-fns';
import { z } from 'zod';
import { brDateToIso, onlyDigits } from '@/shared/forms/masks';
import type { RegisterRequest } from './api';

const email = z.string().trim().pipe(z.email('Informe um e-mail válido.'));

export const logInFormSchema = z.object({
  email,
  password: z.string().min(1, 'Informe a senha.'),
});

export type LogInFormValues = z.infer<typeof logInFormSchema>;

export const passwordSchema = z
  .string()
  .min(8, 'Use pelo menos 8 caracteres.')
  .max(72, 'Use no máximo 72 caracteres.')
  .regex(/\p{L}/u, 'Use pelo menos uma letra.')
  .regex(/\d/, 'Use pelo menos um número.');

export const registerFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe seu nome.').max(100, 'Use no máximo 100 caracteres.'),
    email,
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: z
      .string()
      .refine((value) => /^\d{10,11}$/.test(onlyDigits(value)), 'Informe o telefone com DDD.'),
    birthDate: z.string().refine(isPastDate, 'Informe uma data válida no formato DD/MM/AAAA.'),
    acceptedPrivacyTerms: z
      .boolean()
      .refine((accepted) => accepted, 'É preciso aceitar para criar a conta.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function toRegisterRequest(values: RegisterFormValues): RegisterRequest {
  return {
    name: values.name,
    email: values.email,
    password: values.password,
    phone: onlyDigits(values.phone),
    birthDate: brDateToIso(values.birthDate) ?? '',
    acceptedPrivacyTerms: values.acceptedPrivacyTerms,
  };
}

function isPastDate(value: string): boolean {
  const iso = brDateToIso(value);
  return iso !== null && iso >= '1900-01-01' && iso < format(new Date(), 'yyyy-MM-dd');
}
