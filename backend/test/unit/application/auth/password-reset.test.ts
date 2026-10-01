import { beforeEach, describe, expect, it } from 'vitest';
import { LogIn } from '../../../../src/application/use-cases/auth/log-in.js';
import { RegisterUser } from '../../../../src/application/use-cases/auth/register-user.js';
import { RequestPasswordReset } from '../../../../src/application/use-cases/auth/request-password-reset.js';
import { ResetPassword } from '../../../../src/application/use-cases/auth/reset-password.js';
import { VerificationCodes } from '../../../../src/application/use-cases/verification/verification-codes.js';
import { registrationInput } from '../../../support/builders.js';
import {
  CapturingEmailSender,
  FakePasswordHasher,
  FakeTokenService,
  FixedClock,
  SequentialCodeGenerator,
} from '../../../support/fakes.js';
import { InMemoryUserRepository } from '../../../support/in-memory/in-memory-user-repository.js';
import { InMemoryVerificationCodeRepository } from '../../../support/in-memory/in-memory-verification-code-repository.js';

describe('password reset', () => {
  const hasher = new FakePasswordHasher();
  const tokens = new FakeTokenService();
  let users: InMemoryUserRepository;
  let emails: CapturingEmailSender;
  let requestReset: RequestPasswordReset;
  let resetPassword: ResetPassword;
  let verificationCodes: VerificationCodes;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    emails = new CapturingEmailSender();
    const clock = new FixedClock();
    verificationCodes = new VerificationCodes(
      new InMemoryVerificationCodeRepository(),
      new SequentialCodeGenerator(),
      hasher,
      emails,
      clock,
    );
    await new RegisterUser(users, hasher, tokens, clock).execute(registrationInput());
    requestReset = new RequestPasswordReset(users, verificationCodes, hasher);
    resetPassword = new ResetPassword(users, verificationCodes, hasher, tokens);
  });

  it('sends a code only when the e-mail has an account, without telling the difference', async () => {
    await expect(requestReset.execute({ email: 'naoexiste@example.com' })).resolves.toBeUndefined();
    await expect(requestReset.execute({ email: 'invalido' })).resolves.toBeUndefined();
    expect(emails.sent).toEqual([]);

    await requestReset.execute({ email: 'ANA@example.com' });
    expect(emails.sent).toMatchObject([{ to: 'ana@example.com', purpose: 'password_reset' }]);
  });

  it('sets the new password with the code and starts a fresh session', async () => {
    await requestReset.execute({ email: 'ana@example.com' });

    const session = await resetPassword.execute({
      email: 'ana@example.com',
      code: emails.lastCode(),
      newPassword: 'novasenha1',
    });

    expect(session.token).toBe('token:1:1');
    await expect(
      new LogIn(users, hasher, tokens).execute({
        email: 'ana@example.com',
        password: 'novasenha1',
      }),
    ).resolves.toBeDefined();
  });

  it('does not spend the code on a weak password', async () => {
    await requestReset.execute({ email: 'ana@example.com' });
    const code = emails.lastCode();

    await expect(
      resetPassword.execute({ email: 'ana@example.com', code, newPassword: 'fraca' }),
    ).rejects.toMatchObject({ code: 'WEAK_PASSWORD' });
    await expect(
      resetPassword.execute({ email: 'ana@example.com', code, newPassword: 'novasenha1' }),
    ).resolves.toBeDefined();
  });

  it('rejects a wrong code or an unknown e-mail with the same error', async () => {
    await requestReset.execute({ email: 'ana@example.com' });

    await expect(
      resetPassword.execute({
        email: 'ana@example.com',
        code: '000000',
        newPassword: 'novasenha1',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_VERIFICATION_CODE' });
    await expect(
      resetPassword.execute({
        email: 'bia@example.com',
        code: '123456',
        newPassword: 'novasenha1',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_VERIFICATION_CODE' });
  });

  it('keeps reset and deletion codes apart', async () => {
    await requestReset.execute({ email: 'ana@example.com' });
    const user = await users.findById(1);
    if (!user) throw new Error('user not created');

    await expect(
      verificationCodes.consume(user, 'account_deletion', emails.lastCode()),
    ).rejects.toMatchObject({ code: 'INVALID_VERIFICATION_CODE' });
  });
});
