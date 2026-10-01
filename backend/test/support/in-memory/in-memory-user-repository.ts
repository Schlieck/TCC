import type { UserRepository } from '../../../src/application/ports/user-repository.js';
import { ConflictError } from '../../../src/domain/shared/errors.js';
import type { Email } from '../../../src/domain/user/email.js';
import type { NewUser, User, UserId } from '../../../src/domain/user/user.js';

export class InMemoryUserRepository implements UserRepository {
  readonly users = new Map<UserId, User>();
  private nextId = 1;

  create(user: NewUser): Promise<User> {
    if ([...this.users.values()].some((existing) => existing.email === user.email)) {
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
}
