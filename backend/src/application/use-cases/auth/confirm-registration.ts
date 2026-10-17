import { parseEmail } from '../../../domain/user/email.js';
import {
  invalidCode,
  isUsable,
  wrongCodeError,
} from '../../../domain/verification/verification-code.js';
import type { Clock } from '../../ports/clock.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { PendingRegistrationRepository } from '../../ports/pending-registration-repository.js';
import type { TokenService } from '../../ports/token-service.js';
import type { UserRepository } from '../../ports/user-repository.js';
import { startSession, type AuthSession } from './auth-session.js';

export interface ConfirmRegistrationInput {
  email: string;
  code: string;
}

/** RF001, passo 2: com o código certo, cria a conta e já devolve uma sessão. */
export class ConfirmRegistration {
  constructor(
    private readonly users: UserRepository,
    private readonly pending: PendingRegistrationRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly clock: Clock,
  ) {}

  async execute({ email, code }: ConfirmRegistrationInput): Promise<AuthSession> {
    const registration = await this.pending.findByEmail(parseEmail(email));
    if (!registration || !isUsable(registration, this.clock.now())) {
      throw invalidCode();
    }
    if (!(await this.hasher.verify(code, registration.codeHash))) {
      await this.pending.registerFailedAttempt(registration.id);
      throw wrongCodeError(registration);
    }

    await this.pending.delete(registration.id);
    const user = await this.users.create({
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      birthDate: registration.birthDate,
      passwordHash: registration.passwordHash,
      privacyConsentAt: registration.privacyConsentAt,
    });
    return startSession(user, this.tokens);
  }
}
