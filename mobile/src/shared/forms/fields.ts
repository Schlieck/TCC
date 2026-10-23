import { z } from 'zod';
import { todayIso } from '@/shared/dates';
import { brDateToIso, onlyDigits } from './masks';

/** Campos de cadastro reaproveitados no cadastro e nas configurações, com mensagens em pt-BR. */
export const nameField = z
  .string()
  .trim()
  .min(2, 'Informe seu nome.')
  .max(100, 'Use no máximo 100 caracteres.');

export const emailField = z.string().trim().pipe(z.email('Informe um e-mail válido.'));

export const phoneField = z
  .string()
  .refine((value) => /^\d{10,11}$/.test(onlyDigits(value)), 'Informe o telefone com DDD.');

/** Data digitada como DD/MM/AAAA, no passado. */
export const birthDateField = z
  .string()
  .refine(isPastDate, 'Informe uma data válida no formato DD/MM/AAAA.');

export const privacyConsentField = z
  .boolean()
  .refine((accepted) => accepted, 'É preciso aceitar para criar a conta.');

export const newPasswordField = z
  .string()
  .min(8, 'Use pelo menos 8 caracteres.')
  .max(72, 'Use no máximo 72 caracteres.')
  .regex(/\p{L}/u, 'Use pelo menos uma letra.')
  .regex(/\d/, 'Use pelo menos um número.');

function isPastDate(value: string): boolean {
  const iso = brDateToIso(value);
  return iso !== null && iso >= '1900-01-01' && iso < todayIso();
}
