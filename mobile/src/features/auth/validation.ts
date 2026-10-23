import { z } from 'zod';
import type { NewProfileInput } from '@/features/account/api';
import {
  birthDateField,
  emailField,
  nameField,
  newPasswordField,
  phoneField,
  privacyConsentField,
} from '@/shared/forms/fields';
import { brDateToIso, onlyDigits } from '@/shared/forms/masks';
import type { RegisterRequest } from './api';

export const logInFormSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Informe a senha.'),
});

export type LogInFormValues = z.infer<typeof logInFormSchema>;

export const completeProfileFormSchema = z.object({
  name: nameField,
  phone: phoneField,
  birthDate: birthDateField,
  acceptedPrivacyTerms: privacyConsentField,
});

export type CompleteProfileFormValues = z.infer<typeof completeProfileFormSchema>;

export const registerFormSchema = completeProfileFormSchema
  .extend({
    email: emailField,
    password: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function toNewProfileInput(values: CompleteProfileFormValues): NewProfileInput {
  return {
    name: values.name,
    phone: onlyDigits(values.phone),
    birthDate: brDateToIso(values.birthDate) ?? '',
    acceptedPrivacyTerms: values.acceptedPrivacyTerms,
  };
}

export function toRegisterRequest(values: RegisterFormValues): RegisterRequest {
  return { ...toNewProfileInput(values), email: values.email, password: values.password };
}

export const forgotPasswordFormSchema = z.object({
  email: emailField,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
