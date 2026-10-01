import { beforeEach, describe, expect, it } from 'vitest';
import { AuthenticateRequest } from '../../../../src/application/use-cases/auth/authenticate-request.js';
import { RegisterUser } from '../../../../src/application/use-cases/auth/register-user.js';
import { AuthenticationError } from '../../../../src/domain/shared/errors.js';
import { registrationInput } from '../../../support/builders.js';
import { FakePasswordHasher, FakeTokenService, FixedClock } from '../../../support/fakes.js';
import { InMemoryUserRepository } from '../../../support/in-memory/in-memory-user-repository.js';

describe('AuthenticateRequest', () => {
  let users: InMemoryUserRepository;
  let authenticate: AuthenticateRequest;
  let token: string;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    const tokens = new FakeTokenService();
    const session = await new RegisterUser(
      users,
      new FakePasswordHasher(),
      tokens,
      new FixedClock(),
    ).execute(registrationInput());
    token = session.token;
    authenticate = new AuthenticateRequest(tokens, users);
  });

  it('identifies the user of a valid token', async () => {
    await expect(authenticate.execute(token)).resolves.toEqual({ userId: 1 });
  });

  it('rejects a malformed token', async () => {
    await expect(authenticate.execute('not-a-token')).rejects.toThrow(AuthenticationError);
  });

  it('rejects the token of a deleted account', async () => {
    users.users.clear();

    await expect(authenticate.execute(token)).rejects.toThrow(AuthenticationError);
  });

  it('rejects a token issued before the password changed', async () => {
    const user = users.users.get(1);
    if (!user) throw new Error('user not created');
    users.users.set(1, { ...user, tokenVersion: 1 });

    await expect(authenticate.execute(token)).rejects.toThrow(AuthenticationError);
  });
});
