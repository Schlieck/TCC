import { beforeEach, describe, expect, it } from 'vitest';
import { LogIn } from '../../../../src/application/use-cases/auth/log-in.js';
import { newUser } from '../../../support/builders.js';
import { FakePasswordHasher, FakeTokenService } from '../../../support/fakes.js';
import { InMemoryUserRepository } from '../../../support/in-memory/in-memory-user-repository.js';

describe('LogIn', () => {
  let logIn: LogIn;

  beforeEach(async () => {
    const users = new InMemoryUserRepository();
    const hasher = new FakePasswordHasher();
    const tokens = new FakeTokenService();
    await users.create(newUser());
    logIn = new LogIn(users, hasher, tokens);
  });

  it('starts a session with the right credentials, ignoring e-mail case', async () => {
    const session = await logIn.execute({ email: 'ANA@example.com ', password: 'segredo123' });

    expect(session.token).toBe('token:1:0');
    expect(session.user.email).toBe('ana@example.com');
  });

  it.each([
    ['wrong password', { email: 'ana@example.com', password: 'outrasenha1' }],
    ['unknown e-mail', { email: 'bia@example.com', password: 'segredo123' }],
    ['malformed e-mail', { email: 'ana', password: 'segredo123' }],
  ])('gives the same answer for %s', async (_case, credentials) => {
    await expect(logIn.execute(credentials)).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });
});
