import { z } from 'zod';
import {
  birthDateField,
  emailField,
  nameField,
  newPasswordField,
  phoneField,
} from '@/shared/forms/fields';
import { brDateToIso, formatPhone, isoToBrDate, onlyDigits } from '@/shared/forms/masks';
import type { ProfileChanges, UserProfile } from './api';

export const profileFormSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  birthDate: birthDateField,
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function toProfileFormValues(profile: UserProfile): ProfileFormValues {
  return {
    name: profile.name,
    email: profile.email,
    phone: formatPhone(profile.phone),
    birthDate: isoToBrDate(profile.birthDate),
  };
}

export function toProfileChanges(values: ProfileFormValues): ProfileChanges {
  return {
    name: values.name,
    email: values.email,
    phone: onlyDigits(values.phone),
    birthDate: brDateToIso(values.birthDate) ?? '',
  };
}

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual.'),
    newPassword: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export const deletionCodeSchema = z.string().regex(/^\d{6}$/, 'Digite os 6 números do código.');
