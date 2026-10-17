import { describe, expect, it } from 'vitest';
import { GetProfile } from '../../../../src/application/use-cases/account/get-profile.js';
import { NotFoundError } from '../../../../src/domain/shared/errors.js';
import { newUser } from '../../../support/builders.js';
import { InMemoryUserRepository } from '../../../support/in-memory/in-memory-user-repository.js';

describe('GetProfile', () => {
  it('returns the profile without any credential', async () => {
    const users = new InMemoryUserRepository();
    await users.create(newUser());

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
