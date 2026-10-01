import { parseCalendarDate } from '../../../domain/shared/calendar-date.js';
import { ConflictError, ValidationError } from '../../../domain/shared/errors.js';
import { parseEmail } from '../../../domain/user/email.js';
import { assertStrongPassword } from '../../../domain/user/password-policy.js';
import { parsePhone } from '../../../domain/user/phone.js';
import { assertValidBirthDate, parsePersonName } from '../../../domain/user/user.js';
import type { Clock } from '../../ports/clock.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { TokenService } from '../../ports/token-service.js';
import type { UserRepository } from '../../ports/user-repository.js';
import { startSession, type AuthSession } from './auth-session.js';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  birthDate: string;
  acceptedPrivacyTerms: boolean;
}

export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly clock: Clock,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthSession> {
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

    if (await this.users.findByEmail(email)) {
      throw new ConflictError('EMAIL_ALREADY_IN_USE', 'E-mail already registered');
    }

    const user = await this.users.create({
      name: parsePersonName(input.name),
      email,
      phone: parsePhone(input.phone),
      birthDate,
      passwordHash: await this.hasher.hash(input.password),
      privacyConsentAt: this.clock.now(),
    });

    return startSession(user, this.tokens);
  }
}
