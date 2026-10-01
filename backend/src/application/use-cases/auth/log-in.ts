import { AuthenticationError, ValidationError } from '../../../domain/shared/errors.js';
import { parseEmail, type Email } from '../../../domain/user/email.js';
import type { User } from '../../../domain/user/user.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { TokenService } from '../../ports/token-service.js';
import type { UserRepository } from '../../ports/user-repository.js';
import { startSession, type AuthSession } from './auth-session.js';

export interface LogInInput {
  email: string;
  password: string;
}

export class LogIn {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LogInInput): Promise<AuthSession> {
    const user = await this.findUser(input.email);
    const passwordMatches = await this.hasher.verify(input.password, user?.passwordHash ?? null);

    if (!user || !passwordMatches) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid e-mail or password');
    }
    return startSession(user, this.tokens);
  }

  private async findUser(rawEmail: string): Promise<User | null> {
    const email = tryParseEmail(rawEmail);
    return email ? this.users.findByEmail(email) : null;
  }
}

function tryParseEmail(raw: string): Email | null {
  try {
    return parseEmail(raw);
  } catch (error) {
    if (error instanceof ValidationError) {
      return null;
    }
    throw error;
  }
}
