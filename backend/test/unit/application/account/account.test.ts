import { beforeEach, describe, expect, it } from 'vitest';
import { ChangePassword } from '../../../../src/application/use-cases/account/change-password.js';
import { ConfirmAccountDeletion } from '../../../../src/application/use-cases/account/confirm-account-deletion.js';
import { RequestAccountDeletion } from '../../../../src/application/use-cases/account/request-account-deletion.js';
import { UpdateProfile } from '../../../../src/application/use-cases/account/update-profile.js';
import { RegisterUser } from '../../../../src/application/use-cases/auth/register-user.js';
import { VerificationCodes } from '../../../../src/application/use-cases/verification/verification-codes.js';
import {
  ConflictError,
  TooManyAttemptsError,
  ValidationError,
} from '../../../../src/domain/shared/errors.js';
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

describe('account management', () => {
  let users: InMemoryUserRepository;
  let codes: InMemoryVerificationCodeRepository;
  let emails: CapturingEmailSender;
  let clock: FixedClock;
  let verificationCodes: VerificationCodes;
  const hasher = new FakePasswordHasher();
  const tokens = new FakeTokenService();

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    codes = new InMemoryVerificationCodeRepository();
    emails = new CapturingEmailSender();
    clock = new FixedClock();
    verificationCodes = new VerificationCodes(
      codes,
      new SequentialCodeGenerator(),
      hasher,
      emails,
      clock,
    );
    const register = new RegisterUser(users, hasher, tokens, clock);
    await register.execute(registrationInput());
    await register.execute(registrationInput({ email: 'bia@example.com' }));
  });

  describe('UpdateProfile', () => {
    it('updates only the given fields, normalized', async () => {
      const profile = await new UpdateProfile(users, clock).execute({
        userId: 1,
        name: ' Ana  Lima ',
        phone: '(49) 3333-4444',
      });

      expect(profile).toMatchObject({
        name: 'Ana Lima',
        phone: '4933334444',
        email: 'ana@example.com',
      });
    });

    it("refuses another account's e-mail but accepts its own", async () => {
      const update = new UpdateProfile(users, clock);

      await expect(update.execute({ userId: 1, email: 'BIA@example.com' })).rejects.toThrow(
        ConflictError,
      );
      await expect(update.execute({ userId: 1, email: 'ana@example.com' })).resolves.toBeDefined();
    });

    it('validates the birth date', async () => {
      await expect(
        new UpdateProfile(users, clock).execute({ userId: 1, birthDate: '2030-01-01' }),
      ).rejects.toMatchObject({ code: 'INVALID_BIRTH_DATE' });
    });
  });

  describe('ChangePassword', () => {
    it('requires the current password', async () => {
      await expect(
        new ChangePassword(users, hasher, tokens).execute({
          userId: 1,
          currentPassword: 'errada123',
          newPassword: 'novasenha1',
        }),
      ).rejects.toMatchObject({ code: 'WRONG_CURRENT_PASSWORD', field: 'currentPassword' });
    });

    it('stores the new hash and issues a session with a new token version', async () => {
      const session = await new ChangePassword(users, hasher, tokens).execute({
        userId: 1,
        currentPassword: 'segredo123',
        newPassword: 'novasenha1',
      });

      expect(session.token).toBe('token:1:1');
      expect(users.users.get(1)?.passwordHash).toBe('hashed:novasenha1');
    });

    it('applies the password policy to the new password', async () => {
      await expect(
        new ChangePassword(users, hasher, tokens).execute({
          userId: 1,
          currentPassword: 'segredo123',
          newPassword: 'curta',
        }),
      ).rejects.toMatchObject({ code: 'WEAK_PASSWORD', field: 'newPassword' });
    });
  });

  describe('account deletion', () => {
    it('e-mails a code, stores only its hash and deletes the account with it', async () => {
      await new RequestAccountDeletion(users, verificationCodes).execute(1);

      expect(emails.sent).toEqual([
        {
          to: 'ana@example.com',
          name: 'Ana Souza',
          code: '123456',
          purpose: 'account_deletion',
          expiresInMinutes: 15,
        },
      ]);
      expect([...codes.codes.values()][0]?.codeHash).toBe('hashed:123456');

      await new ConfirmAccountDeletion(users, verificationCodes).execute({
        userId: 1,
        code: '123456',
      });
      expect(users.users.has(1)).toBe(false);
    });

    it('accepts each code only once', async () => {
      await new RequestAccountDeletion(users, verificationCodes).execute(2);
      await verificationCodes.consume(await requireUser(2), 'account_deletion', '123456');

      await expect(
        verificationCodes.consume(await requireUser(2), 'account_deletion', '123456'),
      ).rejects.toMatchObject({ code: 'INVALID_VERIFICATION_CODE' });
    });

    it('rejects a code after 15 minutes', async () => {
      await new RequestAccountDeletion(users, verificationCodes).execute(1);
      clock.advanceMinutes(15);

      await expect(
        new ConfirmAccountDeletion(users, verificationCodes).execute({ userId: 1, code: '123456' }),
      ).rejects.toThrow(ValidationError);
      expect(users.users.has(1)).toBe(true);
    });

    it('invalidates the previous code when a new one is requested', async () => {
      const request = new RequestAccountDeletion(users, verificationCodes);
      await request.execute(1);
      await request.execute(1);

      await expect(
        new ConfirmAccountDeletion(users, verificationCodes).execute({ userId: 1, code: '123456' }),
      ).rejects.toMatchObject({ code: 'INVALID_VERIFICATION_CODE' });
      await new ConfirmAccountDeletion(users, verificationCodes).execute({
        userId: 1,
        code: '123457',
      });
    });

    it('locks the code after 5 wrong attempts', async () => {
      await new RequestAccountDeletion(users, verificationCodes).execute(1);
      const confirm = new ConfirmAccountDeletion(users, verificationCodes);

      for (let attempt = 1; attempt < 5; attempt++) {
        await expect(confirm.execute({ userId: 1, code: '000000' })).rejects.toThrow(
          ValidationError,
        );
      }
      await expect(confirm.execute({ userId: 1, code: '000000' })).rejects.toThrow(
        TooManyAttemptsError,
      );
      await expect(confirm.execute({ userId: 1, code: '123456' })).rejects.toMatchObject({
        code: 'INVALID_VERIFICATION_CODE',
      });
    });
  });

  async function requireUser(id: number) {
    const user = await users.findById(id);
    if (!user) {
      throw new Error(`user ${id} not found`);
    }
    return user;
  }
});
