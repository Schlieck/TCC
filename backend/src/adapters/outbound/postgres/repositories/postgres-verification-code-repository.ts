import type { Knex } from 'knex';
import type {
  NewVerificationCode,
  VerificationCodeRepository,
} from '../../../../application/ports/verification-code-repository.js';
import type { UserId } from '../../../../domain/user/user.js';
import type {
  VerificationCode,
  VerificationCodeId,
  VerificationPurpose,
} from '../../../../domain/verification/verification-code.js';

interface CodeRow {
  id: number;
  user_id: number;
  purpose: VerificationPurpose;
  code_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
  failed_attempts: number;
  created_at: Date;
  updated_at: Date;
}

export class PostgresVerificationCodeRepository implements VerificationCodeRepository {
  constructor(private readonly db: Knex) {}

  replace(code: NewVerificationCode, now: Date): Promise<void> {
    return this.db.transaction(async (trx) => {
      await trx<CodeRow>('verification_codes')
        .where({ user_id: code.userId, purpose: code.purpose, consumed_at: null })
        .update({ consumed_at: now });
      await trx<CodeRow>('verification_codes').insert({
        user_id: code.userId,
        purpose: code.purpose,
        code_hash: code.codeHash,
        expires_at: code.expiresAt,
      });
    });
  }

  async findLatestUnconsumed(
    userId: UserId,
    purpose: VerificationPurpose,
  ): Promise<VerificationCode | null> {
    const row = await this.codes()
      .where({ user_id: userId, purpose, consumed_at: null })
      .orderBy('id', 'desc')
      .first();
    return row ? toVerificationCode(row) : null;
  }

  async registerFailedAttempt(id: VerificationCodeId): Promise<void> {
    await this.codes().where({ id }).increment('failed_attempts', 1);
  }

  async consume(id: VerificationCodeId, now: Date): Promise<void> {
    await this.codes().where({ id }).update({ consumed_at: now });
  }

  private codes() {
    return this.db<CodeRow>('verification_codes');
  }
}

function toVerificationCode(row: CodeRow): VerificationCode {
  return {
    id: row.id,
    userId: row.user_id,
    purpose: row.purpose,
    codeHash: row.code_hash,
    expiresAt: row.expires_at,
    failedAttempts: row.failed_attempts,
    consumedAt: row.consumed_at,
  };
}
