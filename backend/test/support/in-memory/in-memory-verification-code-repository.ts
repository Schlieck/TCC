import type {
  NewVerificationCode,
  VerificationCodeRepository,
} from '../../../src/application/ports/verification-code-repository.js';
import type { UserId } from '../../../src/domain/user/user.js';
import type {
  VerificationCode,
  VerificationCodeId,
  VerificationPurpose,
} from '../../../src/domain/verification/verification-code.js';

export class InMemoryVerificationCodeRepository implements VerificationCodeRepository {
  readonly codes = new Map<VerificationCodeId, VerificationCode>();
  private nextId = 1;

  replace(code: NewVerificationCode, now: Date): Promise<void> {
    for (const existing of this.codes.values()) {
      if (
        existing.userId === code.userId &&
        existing.purpose === code.purpose &&
        existing.consumedAt === null
      ) {
        this.codes.set(existing.id, { ...existing, consumedAt: now });
      }
    }
    const id = this.nextId++;
    this.codes.set(id, { id, ...code, failedAttempts: 0, consumedAt: null });
    return Promise.resolve();
  }

  findLatestUnconsumed(
    userId: UserId,
    purpose: VerificationPurpose,
  ): Promise<VerificationCode | null> {
    const latest = [...this.codes.values()]
      .filter((code) => code.userId === userId && code.purpose === purpose && !code.consumedAt)
      .at(-1);
    return Promise.resolve(latest ?? null);
  }

  registerFailedAttempt(id: VerificationCodeId): Promise<void> {
    const code = this.codes.get(id);
    if (code) {
      this.codes.set(id, { ...code, failedAttempts: code.failedAttempts + 1 });
    }
    return Promise.resolve();
  }

  consume(id: VerificationCodeId, now: Date): Promise<void> {
    const code = this.codes.get(id);
    if (code) {
      this.codes.set(id, { ...code, consumedAt: now });
    }
    return Promise.resolve();
  }
}
