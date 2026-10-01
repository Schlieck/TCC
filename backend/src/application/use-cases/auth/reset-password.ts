import { ValidationError } from '../../../domain/shared/errors.js';
import { parseEmail } from '../../../domain/user/email.js';
import { assertStrongPassword } from '../../../domain/user/password-policy.js';
import { userNotFound } from '../../../domain/user/user.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { TokenService } from '../../ports/token-service.js';
import type { UserRepository } from '../../ports/user-repository.js';
import type { VerificationCodes } from '../verification/verification-codes.js';
import { startSession, type AuthSession } from './auth-session.js';

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

/**
 * "Esqueci a senha", passo 2: com o código certo, troca a senha, derruba as sessões
 * antigas e já devolve uma sessão nova.
 */
export class ResetPassword {
  constructor(
    private readonly users: UserRepository,
    private readonly verificationCodes: VerificationCodes,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute({ email, code, newPassword }: ResetPasswordInput): Promise<AuthSession> {
    // A senha é validada antes para que uma senha fraca não gaste o código.
    assertStrongPassword(newPassword, 'newPassword');

    const user = await this.users.findByEmail(parseEmail(email));
    if (!user) {
      throw new ValidationError('INVALID_VERIFICATION_CODE', 'Invalid or expired code', 'code');
    }
    await this.verificationCodes.consume(user, 'password_reset', code);

    const updated = await this.users.updatePassword(user.id, await this.hasher.hash(newPassword));
    if (!updated) {
      throw userNotFound();
    }
    return startSession(updated, this.tokens);
  }
}
