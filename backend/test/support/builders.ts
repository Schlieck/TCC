import type { RegisterUserInput } from '../../src/application/use-cases/auth/register-user.js';

export function registrationInput(overrides: Partial<RegisterUserInput> = {}): RegisterUserInput {
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
