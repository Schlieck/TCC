import { ValidationError } from '../shared/errors.js';

/** Telefone brasileiro com DDD, só dígitos: 10 (fixo) ou 11 (celular). */
export type Phone = string & { readonly __brand: 'Phone' };

const FORMATTING = /[\s().-]/g;
const PHONE_DIGITS = /^\d{10,11}$/;

export function parsePhone(raw: string): Phone {
  const digits = raw.replace(FORMATTING, '');
  if (!PHONE_DIGITS.test(digits)) {
    throw new ValidationError('INVALID_PHONE', 'Phone must have 10 or 11 digits', 'phone');
  }
  return digits as Phone;
}
