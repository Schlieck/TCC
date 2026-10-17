import { parseCalendarDate } from '../../../domain/shared/calendar-date.js';
import { ValidationError } from '../../../domain/shared/errors.js';
import { parseEmail } from '../../../domain/user/email.js';
import { assertStrongPassword } from '../../../domain/user/password-policy.js';
import { parsePhone } from '../../../domain/user/phone.js';
import { assertValidBirthDate, parsePersonName } from '../../../domain/user/user.js';
import {
  CODE_TTL_MINUTES,
  expirationFrom,
} from '../../../domain/verification/verification-code.js';
import type { Clock } from '../../ports/clock.js';
import type { CodeGenerator } from '../../ports/code-generator.js';
import type { EmailSender } from '../../ports/email-sender.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { PendingRegistrationRepository } from '../../ports/pending-registration-repository.js';
import type { UserRepository } from '../../ports/user-repository.js';

export interface RequestRegistrationInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  birthDate: string;
  acceptedPrivacyTerms: boolean;
}

/**
 * RF001, passo 1: valida os dados e envia ao e-mail o código que confirma o cadastro.
 * A resposta é a mesma quando o e-mail já tem conta (o dono recebe um aviso), para o
 * cadastro não revelar quais e-mails estão cadastrados.
 */
export class RequestRegistration {
  constructor(
    private readonly users: UserRepository,
    private readonly pending: PendingRegistrationRepository,
    private readonly generator: CodeGenerator,
    private readonly hasher: PasswordHasher,
    private readonly emails: EmailSender,
    private readonly clock: Clock,
  ) {}

  async execute(input: RequestRegistrationInput): Promise<void> {
    if (!input.acceptedPrivacyTerms) {
      throw new ValidationError(
        'PRIVACY_CONSENT_REQUIRED',
        'The privacy terms must be accepted',
        'acceptedPrivacyTerms',
      );
    }

    const email = parseEmail(input.email);
    const birthDate = parseCalendarDate(input.birthDate, 'birthDate');
    assertValidBirthDate(birthDate, this.clock.today());
    assertStrongPassword(input.password);
    const name = parsePersonName(input.name);
    const phone = parsePhone(input.phone);

    // Os dois hashes são calculados em qualquer caso, para o tempo de resposta não denunciar a conta.
    const code = this.generator.generate();
    const [passwordHash, codeHash] = await Promise.all([
      this.hasher.hash(input.password),
      this.hasher.hash(code),
    ]);

    const owner = await this.users.findByEmail(email);
    if (owner) {
      await this.emails.sendAccountExistsNotice({ to: owner.email, name: owner.name });
      return;
    }

    const now = this.clock.now();
    await this.pending.save({
      name,
      email,
      phone,
      birthDate,
      passwordHash,
      privacyConsentAt: now,
      codeHash,
      expiresAt: expirationFrom(now),
    });
    await this.emails.sendVerificationCode({
      to: email,
      name,
      code,
      purpose: 'registration',
      expiresInMinutes: CODE_TTL_MINUTES,
    });
  }
}
