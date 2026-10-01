import { userNotFound, type UserId } from '../../../domain/user/user.js';
import type { UserRepository } from '../../ports/user-repository.js';
import type { VerificationCodes } from '../verification/verification-codes.js';

export interface ConfirmAccountDeletionInput {
  userId: UserId;
  code: string;
}

/** RF004, passo 2: com o código certo, apaga a conta e todos os dados (em cascata). */
export class ConfirmAccountDeletion {
  constructor(
    private readonly users: UserRepository,
    private readonly verificationCodes: VerificationCodes,
  ) {}

  async execute({ userId, code }: ConfirmAccountDeletionInput): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw userNotFound();
    }
    await this.verificationCodes.consume(user, 'account_deletion', code);
    await this.users.delete(userId);
  }
}
