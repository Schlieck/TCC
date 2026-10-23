import { z } from 'zod';
import { isIsoDate, todayIso } from '@/shared/dates';
import {
  birthDateField,
  emailField,
  nameField,
  newPasswordField,
  phoneField,
  privacyConsentField,
} from '@/shared/forms/fields';
import { brDateToIso, formatPhone, isoToBrDate, onlyDigits } from '@/shared/forms/masks';
import type { ProfileChanges, UserProfile } from './api';

/** O que é gravado no perfil local (data ISO, telefone só com dígitos). */
export const profileSchema = z.object({
  name: nameField.transform((name) => name.replace(/\s+/g, ' ')),
  phone: z.string().regex(/^\d{10,11}$/, 'Informe o telefone com DDD.'),
  birthDate: z
    .string()
    .refine(
      (date) => isIsoDate(date) && date >= '1900-01-01' && date < todayIso(),
      'Informe uma data de nascimento válida.',
    ),
});

export const newProfileSchema = profileSchema.extend({ acceptedPrivacyTerms: privacyConsentField });

/** Trocar o e-mail exige a senha atual, porque é o e-mail que recupera a conta. */
export function profileFormSchema(currentEmail: string) {
  return z
    .object({
      name: nameField,
      email: emailField,
      phone: phoneField,
      birthDate: birthDateField,
      currentPassword: z.string(),
    })
    .refine(
      (values) => !emailChanged(values.email, currentEmail) || values.currentPassword.length > 0,
      { path: ['currentPassword'], message: 'Informe sua senha atual para trocar o e-mail.' },
    );
}

export type ProfileFormValues = z.infer<ReturnType<typeof profileFormSchema>>;

export function emailChanged(email: string, currentEmail: string): boolean {
  return email.trim().toLowerCase() !== currentEmail;
}

export function toProfileFormValues(profile: UserProfile): ProfileFormValues {
  return {
    name: profile.name,
    email: profile.email,
    phone: formatPhone(profile.phone),
    birthDate: isoToBrDate(profile.birthDate),
    currentPassword: '',
  };
}

export function toProfileChanges(values: ProfileFormValues): ProfileChanges {
  return {
    name: values.name,
    email: values.email,
    phone: onlyDigits(values.phone),
    birthDate: brDateToIso(values.birthDate) ?? '',
    ...(values.currentPassword ? { currentPassword: values.currentPassword } : {}),
  };
}

export const currentPasswordField = z.string().min(1, 'Informe a senha atual.');

export const changePasswordFormSchema = z
  .object({
    currentPassword: currentPasswordField,
    newPassword: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
