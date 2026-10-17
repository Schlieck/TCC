import type { RequestRegistrationInput } from '../../src/application/use-cases/auth/request-registration.js';
import { parseCalendarDate } from '../../src/domain/shared/calendar-date.js';
import { parseEmail } from '../../src/domain/user/email.js';
import { parsePhone } from '../../src/domain/user/phone.js';
import type { NewUser } from '../../src/domain/user/user.js';

export function registrationInput(
  overrides: Partial<RequestRegistrationInput> = {},
): RequestRegistrationInput {
  return {
    name: 'Ana Souza',
    email: 'ana@example.com',
    password: 'segredo123',
    phone: '49999990000',
    birthDate: '1998-04-12',
    acceptedPrivacyTerms: true,
    ...overrides,
  };
}

/** Conta já confirmada, com a senha `segredo123` no formato do FakePasswordHasher. */
export function newUser(email = 'ana@example.com'): NewUser {
  return {
    name: 'Ana Souza',
    email: parseEmail(email),
    phone: parsePhone('49999990000'),
    birthDate: parseCalendarDate('1998-04-12'),
    passwordHash: 'hashed:segredo123',
    privacyConsentAt: new Date('2026-10-01T12:00:00Z'),
  };
}
