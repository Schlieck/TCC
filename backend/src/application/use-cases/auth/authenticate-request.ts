import { AuthenticationError } from '../../../domain/shared/errors.js';
import type { UserId } from '../../../domain/user/user.js';
import type { TokenService } from '../../ports/token-service.js';
import type { UserRepository } from '../../ports/user-repository.js';

export interface AuthenticatedUser {
  userId: UserId;
}

export class AuthenticateRequest {
  constructor(
    private readonly tokens: TokenService,
    private readonly users: UserRepository,
  ) {}

  async execute(token: string): Promise<AuthenticatedUser> {
    const claims = await this.tokens.verify(token);
    if (!claims) {
      throw invalidSession();
    }

    // Conta excluída ou senha trocada depois da emissão do token: a sessão não vale mais.
    const user = await this.users.findById(claims.userId);
    if (user?.tokenVersion !== claims.tokenVersion) {
      throw invalidSession();
    }
    return { userId: claims.userId };
  }
}

function invalidSession(): AuthenticationError {
  return new AuthenticationError('INVALID_TOKEN', 'Invalid or expired session');
}
