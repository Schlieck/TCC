import { beforeEach, describe, expect, it } from 'vitest';
import { ConfirmRegistration } from '../../../../src/application/use-cases/auth/confirm-registration.js';
import { RequestRegistration } from '../../../../src/application/use-cases/auth/request-registration.js';
import { TooManyAttemptsError, ValidationError } from '../../../../src/domain/shared/errors.js';
import { newUser, registrationInput } from '../../../support/builders.js';
import {
  CapturingEmailSender,
  FakePasswordHasher,
  FakeTokenService,
  FixedClock,
  SequentialCodeGenerator,
} from '../../../support/fakes.js';
import { InMemoryPendingRegistrationRepository } from '../../../support/in-memory/in-memory-pending-registration-repository.js';
import { InMemoryUserRepository } from '../../../support/in-memory/in-memory-user-repository.js';

describe('registration', () => {
  let users: InMemoryUserRepository;
  let pending: InMemoryPendingRegistrationRepository;
  let emails: CapturingEmailSender;
  let clock: FixedClock;
  let request: RequestRegistration;
  let confirm: ConfirmRegistration;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    pending = new InMemoryPendingRegistrationRepository();
    emails = new CapturingEmailSender();
    clock = new FixedClock();
    const hasher = new FakePasswordHasher();
    request = new RequestRegistration(
      users,
      pending,
      new SequentialCodeGenerator(),
      hasher,
      emails,
      clock,
    );
    confirm = new ConfirmRegistration(users, pending, hasher, new FakeTokenService(), clock);
  });

  it('creates the account only after the e-mailed code is confirmed', async () => {
    await request.execute(
      registrationInput({ email: ' Ana@Example.com', phone: '(49) 99999-0000' }),
    );

    expect(users.users.size).toBe(0);
    expect(emails.sent).toMatchObject([
      { to: 'ana@example.com', purpose: 'registration', code: '123456' },
    ]);

    const session = await confirm.execute({ email: 'ana@example.com', code: '123456' });

    expect(session.token).toBe('token:1:0');
    expect(session.user).toEqual({
      id: 1,
      name: 'Ana Souza',
      email: 'ana@example.com',
      phone: '49999990000',
      birthDate: '1998-04-12',
    });
    expect(users.users.get(1)).toMatchObject({
      passwordHash: 'hashed:segredo123',
      privacyConsentAt: clock.now(),
    });
    expect(pending.registrations.size).toBe(0);
  });

  it('answers the same for an e-mail that already has an account and warns its owner', async () => {
    await users.create(newUser());

    await expect(
      request.execute(registrationInput({ email: 'ANA@example.com' })),
    ).resolves.toBeUndefined();

    expect(emails.sent).toEqual([]);
    expect(emails.notices).toEqual([{ to: 'ana@example.com', name: 'Ana Souza' }]);
    expect(pending.registrations.size).toBe(0);
  });

  it('keeps only the latest code of a repeated request', async () => {
    await request.execute(registrationInput());
    await request.execute(registrationInput({ name: 'Ana Lima' }));

    await expect(confirm.execute({ email: 'ana@example.com', code: '123456' })).rejects.toThrow(
      ValidationError,
    );
    const session = await confirm.execute({ email: 'ana@example.com', code: '123457' });
    expect(session.user.name).toBe('Ana Lima');
  });

  it('refuses an expired code', async () => {
    await request.execute(registrationInput());
    clock.advanceMinutes(16);

    await expect(
      confirm.execute({ email: 'ana@example.com', code: '123456' }),
    ).rejects.toMatchObject({ code: 'INVALID_VERIFICATION_CODE' });
    expect(users.users.size).toBe(0);
  });

  it('invalidates the code after five wrong attempts', async () => {
    await request.execute(registrationInput());
    for (let attempt = 1; attempt < 5; attempt++) {
      await expect(
        confirm.execute({ email: 'ana@example.com', code: '000000' }),
      ).rejects.toMatchObject({ code: 'INVALID_VERIFICATION_CODE' });
    }

    await expect(confirm.execute({ email: 'ana@example.com', code: '000000' })).rejects.toThrow(
      TooManyAttemptsError,
    );
    await expect(
      confirm.execute({ email: 'ana@example.com', code: '123456' }),
    ).rejects.toMatchObject({ code: 'INVALID_VERIFICATION_CODE' });
  });

  it('refuses a code for an e-mail without a pending registration', async () => {
    await expect(
      confirm.execute({ email: 'bia@example.com', code: '123456' }),
    ).rejects.toMatchObject({ code: 'INVALID_VERIFICATION_CODE' });
  });

  it('requires consent to the privacy terms', async () => {
    await expect(
      request.execute(registrationInput({ acceptedPrivacyTerms: false })),
    ).rejects.toMatchObject({ code: 'PRIVACY_CONSENT_REQUIRED' });
    expect(emails.sent).toEqual([]);
  });

  it.each([
    ['WEAK_PASSWORD', { password: 'abcdefgh' }],
    ['INVALID_PHONE', { phone: '12345' }],
    ['INVALID_BIRTH_DATE', { birthDate: '2027-01-01' }],
    ['INVALID_NAME', { name: 'A' }],
  ])('rejects invalid data with %s', async (code, overrides) => {
    const attempt = request.execute(registrationInput(overrides));

    await expect(attempt).rejects.toThrow(ValidationError);
    await expect(attempt).rejects.toMatchObject({ code });
    expect(emails.sent).toEqual([]);
  });
});
