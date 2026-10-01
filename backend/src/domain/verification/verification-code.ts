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

export function expirationFrom(now: Date): Date {
  return new Date(now.getTime() + CODE_TTL_MINUTES * 60_000);
}

export function isUsable(code: VerificationCode, now: Date): boolean {
  return (
    code.consumedAt === null &&
    code.expiresAt.getTime() > now.getTime() &&
    code.failedAttempts < MAX_FAILED_ATTEMPTS
  );
}
