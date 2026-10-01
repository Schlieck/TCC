import { ValidationError } from '../../../domain/shared/errors.js';
import { parseEmail } from '../../../domain/user/email.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { UserRepository } from '../../ports/user-repository.js';
import type { VerificationCodes } from '../verification/verification-codes.js';

export interface RequestPasswordResetInput {
  email: string;
}

/**
 * "Esqueci a senha", passo 1: envia um código ao e-mail, se ele estiver cadastrado.
 * A resposta é a mesma nos dois casos, para não revelar quais e-mails têm conta.
 */
export class RequestPasswordReset {
  constructor(
    private readonly users: UserRepository,
    private readonly verificationCodes: VerificationCodes,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute({ email }: RequestPasswordResetInput): Promise<void> {
    const user = await this.findUser(email);
    if (user) {
      await this.verificationCodes.send(user, 'password_reset');
    } else {
      // Gasta o mesmo tempo de um envio para o tempo de resposta não denunciar a conta.
      await this.hasher.hash(email);
    }
  }

  private async findUser(rawEmail: string) {
    try {
      return await this.users.findByEmail(parseEmail(rawEmail));
    } catch (error) {
      if (error instanceof ValidationError) {
        return null;
      }
      throw error;
    }
  }
}
