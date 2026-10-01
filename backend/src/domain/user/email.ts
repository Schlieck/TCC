import { ValidationError } from '../shared/errors.js';

export type Email = string & { readonly __brand: 'Email' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = 254;

export function parseEmail(raw: string): Email {
  const normalized = raw.trim().toLowerCase();
  if (normalized.length > MAX_LENGTH || !EMAIL_PATTERN.test(normalized)) {
    throw new ValidationError('INVALID_EMAIL', 'Invalid e-mail address', 'email');
  }
  return normalized as Email;
}
