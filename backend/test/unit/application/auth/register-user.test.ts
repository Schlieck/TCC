import { beforeEach, describe, expect, it } from 'vitest';
import { RegisterUser } from '../../../../src/application/use-cases/auth/register-user.js';
import { ConflictError, ValidationError } from '../../../../src/domain/shared/errors.js';
import { registrationInput } from '../../../support/builders.js';
import { FakePasswordHasher, FakeTokenService, FixedClock } from '../../../support/fakes.js';
import { InMemoryUserRepository } from '../../../support/in-memory/in-memory-user-repository.js';

describe('RegisterUser', () => {
  let users: InMemoryUserRepository;
  let clock: FixedClock;
  let registerUser: RegisterUser;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    clock = new FixedClock();
    registerUser = new RegisterUser(users, new FakePasswordHasher(), new FakeTokenService(), clock);
  });

  it('creates the user and starts a session', async () => {
    const session = await registerUser.execute(
      registrationInput({ email: ' Ana@Example.com', phone: '(49) 99999-0000' }),
    );

    expect(session.token).toBe('token:1:0');
    expect(session.user).toEqual({
      id: 1,
      name: 'Ana Souza',
      email: 'ana@example.com',
      phone: '49999990000',
      birthDate: '1998-04-12',
    });
  });

  it('stores only the password hash and the consent time', async () => {
    await registerUser.execute(registrationInput());

    const stored = users.users.get(1);
    expect(stored?.passwordHash).toBe('hashed:segredo123');
    expect(stored?.privacyConsentAt).toEqual(clock.now());
  });

  it('refuses an e-mail that is already registered', async () => {
    await registerUser.execute(registrationInput());

    await expect(
      registerUser.execute(registrationInput({ email: 'ANA@example.com' })),
    ).rejects.toThrow(ConflictError);
  });

  it('requires consent to the privacy terms', async () => {
    await expect(
      registerUser.execute(registrationInput({ acceptedPrivacyTerms: false })),
    ).rejects.toMatchObject({ code: 'PRIVACY_CONSENT_REQUIRED' });
    expect(users.users.size).toBe(0);
  });

  it.each([
    ['WEAK_PASSWORD', { password: 'abcdefgh' }],
    ['INVALID_PHONE', { phone: '12345' }],
    ['INVALID_BIRTH_DATE', { birthDate: '2027-01-01' }],
    ['INVALID_NAME', { name: 'A' }],
  ])('rejects invalid data with %s', async (code, overrides) => {
    const attempt = registerUser.execute(registrationInput(overrides));

    await expect(attempt).rejects.toThrow(ValidationError);
    await expect(attempt).rejects.toMatchObject({ code });
  });
});
