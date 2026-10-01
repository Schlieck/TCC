import { userNotFound, type UserId } from '../../../domain/user/user.js';
import type { UserRepository } from '../../ports/user-repository.js';
import type { VerificationCodes } from '../verification/verification-codes.js';

/** RF004, passo 1: envia para o e-mail cadastrado o código que confirma a exclusão. */
export class RequestAccountDeletion {
  constructor(
    private readonly users: UserRepository,
    private readonly verificationCodes: VerificationCodes,
  ) {}

  async execute(userId: UserId): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw userNotFound();
    }
    await this.verificationCodes.send(user, 'account_deletion');
  }
}
