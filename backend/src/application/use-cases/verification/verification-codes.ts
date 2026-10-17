import type { User } from '../../../domain/user/user.js';
import {
  CODE_TTL_MINUTES,
  expirationFrom,
  invalidCode,
  isUsable,
  wrongCodeError,
  type VerificationPurpose,
} from '../../../domain/verification/verification-code.js';
import type { Clock } from '../../ports/clock.js';
import type { CodeGenerator } from '../../ports/code-generator.js';
import type { EmailSender } from '../../ports/email-sender.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { VerificationCodeRepository } from '../../ports/verification-code-repository.js';

/**
 * Mecanismo comum aos fluxos que pedem confirmação por e-mail (exclusão de conta e
 * redefinição de senha): código de uso único, guardado como hash, que expira em 15 minutos
 * e é invalidado depois de 5 tentativas erradas.
 */
export class VerificationCodes {
  constructor(
    private readonly codes: VerificationCodeRepository,
    private readonly generator: CodeGenerator,
    private readonly hasher: PasswordHasher,
    private readonly emails: EmailSender,
    private readonly clock: Clock,
  ) {}

  async send(user: User, purpose: VerificationPurpose): Promise<void> {
    const code = this.generator.generate();
    const now = this.clock.now();
    await this.codes.replace(
      {
        userId: user.id,
        purpose,
        codeHash: await this.hasher.hash(code),
        expiresAt: expirationFrom(now),
      },
      now,
    );
    await this.emails.sendVerificationCode({
      to: user.email,
      name: user.name,
      code,
      purpose,
      expiresInMinutes: CODE_TTL_MINUTES,
    });
  }

  /** Confere o código e o consome; lança erro se estiver errado, expirado ou já usado. */
  async consume(user: User, purpose: VerificationPurpose, code: string): Promise<void> {
    const now = this.clock.now();
    const stored = await this.codes.findLatestUnconsumed(user.id, purpose);
    if (!stored || !isUsable(stored, now)) {
      throw invalidCode();
    }

    if (!(await this.hasher.verify(code, stored.codeHash))) {
      await this.codes.registerFailedAttempt(stored.id);
      throw wrongCodeError(stored);
    }

    await this.codes.consume(stored.id, now);
  }
}
