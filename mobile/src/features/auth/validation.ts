import { z } from 'zod';
import {
  birthDateField,
  emailField,
  nameField,
  newPasswordField,
  phoneField,
} from '@/shared/forms/fields';
import { brDateToIso, onlyDigits } from '@/shared/forms/masks';
import type { RegisterRequest } from './api';

export const logInFormSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Informe a senha.'),
});

export type LogInFormValues = z.infer<typeof logInFormSchema>;

export const registerFormSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: newPasswordField,
    confirmPassword: z.string(),
    phone: phoneField,
    birthDate: birthDateField,
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
