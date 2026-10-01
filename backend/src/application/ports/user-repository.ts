import type { Email } from '../../domain/user/email.js';
import type { NewUser, User, UserId } from '../../domain/user/user.js';

export type ProfileChanges = Partial<Pick<User, 'name' | 'email' | 'phone' | 'birthDate'>>;

export interface UserRepository {
  /** Lança ConflictError('EMAIL_ALREADY_IN_USE') se o e-mail já estiver cadastrado. */
  create(user: NewUser): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  /** Lança ConflictError('EMAIL_ALREADY_IN_USE') se o novo e-mail já for de outra conta. */
  updateProfile(id: UserId, changes: ProfileChanges): Promise<User | null>;
  /** Troca o hash da senha e incrementa token_version, invalidando as sessões anteriores. */
  updatePassword(id: UserId, passwordHash: string): Promise<User | null>;
  /** Apaga a conta; o banco remove em cascata todos os dados do usuário. */
  delete(id: UserId): Promise<boolean>;
}
