import { ValidationError } from '../../../domain/shared/errors.js';
import { assertStrongPassword } from '../../../domain/user/password-policy.js';
import { userNotFound, type UserId } from '../../../domain/user/user.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { TokenService } from '../../ports/token-service.js';
import type { UserRepository } from '../../ports/user-repository.js';
import { startSession, type AuthSession } from '../auth/auth-session.js';

export interface ChangePasswordInput {
  userId: UserId;
  currentPassword: string;
  newPassword: string;
}

/** Exige a senha atual; as sessões antigas deixam de valer e uma nova é devolvida. */
export class ChangePassword {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
  }: ChangePasswordInput): Promise<AuthSession> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw userNotFound();
    }
    if (!(await this.hasher.verify(currentPassword, user.passwordHash))) {
      throw new ValidationError(
        'WRONG_CURRENT_PASSWORD',
        'Current password does not match',
        'currentPassword',
      );
    }
    assertStrongPassword(newPassword, 'newPassword');

    const updated = await this.users.updatePassword(userId, await this.hasher.hash(newPassword));
    if (!updated) {
      throw userNotFound();
    }
    return startSession(updated, this.tokens);
  }
}
