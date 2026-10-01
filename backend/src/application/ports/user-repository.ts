import type { Email } from '../../domain/user/email.js';
import type { NewUser, User, UserId } from '../../domain/user/user.js';

export interface UserRepository {
  /** Lança ConflictError('EMAIL_ALREADY_IN_USE') se o e-mail já estiver cadastrado. */
  create(user: NewUser): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}
