import type {
  ProfileChanges,
  UserRepository,
} from '../../../src/application/ports/user-repository.js';
import { ConflictError } from '../../../src/domain/shared/errors.js';
import type { Email } from '../../../src/domain/user/email.js';
import type { NewUser, User, UserId } from '../../../src/domain/user/user.js';

export class InMemoryUserRepository implements UserRepository {
  readonly users = new Map<UserId, User>();
  private nextId = 1;

  create(user: NewUser): Promise<User> {
    if (this.emailTaken(user.email)) {
      return Promise.reject(new ConflictError('EMAIL_ALREADY_IN_USE', 'E-mail already registered'));
    }
    const created: User = { ...user, id: this.nextId++, tokenVersion: 0 };
    this.users.set(created.id, created);
    return Promise.resolve(created);
  }

  findById(id: UserId): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByEmail(email: Email): Promise<User | null> {
    const user = [...this.users.values()].find((candidate) => candidate.email === email);
    return Promise.resolve(user ?? null);
  }

  updateProfile(id: UserId, changes: ProfileChanges): Promise<User | null> {
    if (changes.email !== undefined && this.emailTaken(changes.email, id)) {
      return Promise.reject(new ConflictError('EMAIL_ALREADY_IN_USE', 'E-mail already registered'));
    }
    return Promise.resolve(this.patch(id, changes));
  }

  updatePassword(id: UserId, passwordHash: string): Promise<User | null> {
    const user = this.users.get(id);
    return Promise.resolve(
      user ? this.patch(id, { passwordHash, tokenVersion: user.tokenVersion + 1 }) : null,
    );
  }

  delete(id: UserId): Promise<boolean> {
    return Promise.resolve(this.users.delete(id));
  }

  private patch(id: UserId, changes: Partial<User>): User | null {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    const updated = { ...user, ...changes };
    this.users.set(id, updated);
    return updated;
  }

  private emailTaken(email: Email, exceptId?: UserId): boolean {
    return [...this.users.values()].some((user) => user.email === email && user.id !== exceptId);
  }
}
