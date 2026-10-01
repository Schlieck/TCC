import type { UserId } from '../../domain/user/user.js';
import type {
  VerificationCode,
  VerificationCodeId,
  VerificationPurpose,
} from '../../domain/verification/verification-code.js';

export interface NewVerificationCode {
  userId: UserId;
  purpose: VerificationPurpose;
  codeHash: string;
  expiresAt: Date;
}

export interface VerificationCodeRepository {
  /** Grava o novo código e invalida os anteriores ainda não usados do mesmo propósito. */
  replace(code: NewVerificationCode, now: Date): Promise<void>;
  /** O código mais recente ainda não usado do propósito, mesmo que já tenha expirado. */
  findLatestUnconsumed(
    userId: UserId,
    purpose: VerificationPurpose,
  ): Promise<VerificationCode | null>;
  registerFailedAttempt(id: VerificationCodeId): Promise<void>;
  consume(id: VerificationCodeId, now: Date): Promise<void>;
}
