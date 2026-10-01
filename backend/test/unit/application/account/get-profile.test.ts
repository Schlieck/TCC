import { describe, expect, it } from 'vitest';
import { GetProfile } from '../../../../src/application/use-cases/account/get-profile.js';
import { RegisterUser } from '../../../../src/application/use-cases/auth/register-user.js';
import { NotFoundError } from '../../../../src/domain/shared/errors.js';
import { registrationInput } from '../../../support/builders.js';
import { FakePasswordHasher, FakeTokenService, FixedClock } from '../../../support/fakes.js';
import { InMemoryUserRepository } from '../../../support/in-memory/in-memory-user-repository.js';

describe('GetProfile', () => {
  it('returns the profile without any credential', async () => {
    const users = new InMemoryUserRepository();
    await new RegisterUser(
      users,
      new FakePasswordHasher(),
      new FakeTokenService(),
      new FixedClock(),
    ).execute(registrationInput());

    const profile = await new GetProfile(users).execute(1);

    expect(profile).toEqual({
      id: 1,
      name: 'Ana Souza',
      email: 'ana@example.com',
      phone: '49999990000',
      birthDate: '1998-04-12',
    });
  });

  it('fails for an unknown user', async () => {
    await expect(new GetProfile(new InMemoryUserRepository()).execute(99)).rejects.toThrow(
      NotFoundError,
    );
  });
});
