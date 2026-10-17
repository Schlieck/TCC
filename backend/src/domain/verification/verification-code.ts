import { TooManyAttemptsError, ValidationError } from '../shared/errors.js';
import type { UserId } from '../user/user.js';

export type VerificationPurpose = 'account_deletion' | 'password_reset';

export type VerificationCodeId = number;

/** Código de uso único enviado por e-mail. Só o hash é guardado. */
export interface VerificationCode {
  readonly id: VerificationCodeId;
  readonly userId: UserId;
  readonly purpose: VerificationPurpose;
  readonly codeHash: string;
  readonly expiresAt: Date;
  readonly failedAttempts: number;
  readonly consumedAt: Date | null;
}

export const CODE_TTL_MINUTES = 15;
export const MAX_FAILED_ATTEMPTS = 5;

/** O que é preciso saber de um código para dizer se ele ainda pode ser usado. */
export interface CodeState {
  readonly expiresAt: Date;
  readonly failedAttempts: number;
  readonly consumedAt?: Date | null;
}

export function expirationFrom(now: Date): Date {
  return new Date(now.getTime() + CODE_TTL_MINUTES * 60_000);
}

export function isUsable(code: CodeState, now: Date): boolean {
  return (
    !code.consumedAt &&
    code.expiresAt.getTime() > now.getTime() &&
    code.failedAttempts < MAX_FAILED_ATTEMPTS
  );
}

export function invalidCode(): ValidationError {
  return new ValidationError('INVALID_VERIFICATION_CODE', 'Invalid or expired code', 'code');
}

/** Erro para uma tentativa errada: na última permitida, o código deixa de valer. */
export function wrongCodeError(code: CodeState): ValidationError | TooManyAttemptsError {
  return code.failedAttempts + 1 >= MAX_FAILED_ATTEMPTS
    ? new TooManyAttemptsError(
        'TOO_MANY_CODE_ATTEMPTS',
        'Too many wrong attempts; request a new code',
      )
    : invalidCode();
}
