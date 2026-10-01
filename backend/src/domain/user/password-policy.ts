import { ValidationError } from '../shared/errors.js';

const MIN_LENGTH = 8;
// O bcrypt ignora o que passa de 72 bytes.
const MAX_BYTES = 72;

export function assertStrongPassword(plain: string, field = 'password'): void {
  const strong =
    plain.length >= MIN_LENGTH &&
    new TextEncoder().encode(plain).length <= MAX_BYTES &&
    /\p{L}/u.test(plain) &&
    /\d/.test(plain);

  if (!strong) {
    throw new ValidationError(
      'WEAK_PASSWORD',
      'Password must have 8 to 72 bytes with letters and numbers',
      field,
    );
  }
}
