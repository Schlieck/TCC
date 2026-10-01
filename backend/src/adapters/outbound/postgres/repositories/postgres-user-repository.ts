import type { Knex } from 'knex';
import type { UserRepository } from '../../../../application/ports/user-repository.js';
import { parseCalendarDate } from '../../../../domain/shared/calendar-date.js';
import { ConflictError } from '../../../../domain/shared/errors.js';
import { parseEmail, type Email } from '../../../../domain/user/email.js';
import { parsePhone } from '../../../../domain/user/phone.js';
import type { NewUser, User, UserId } from '../../../../domain/user/user.js';
import { isUniqueViolation } from '../postgres-errors.js';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  phone: string;
  birth_date: string;
  token_version: number;
  privacy_consent_at: Date;
  created_at: Date;
  updated_at: Date;
}

type InsertUserRow = Omit<UserRow, 'id' | 'token_version' | 'created_at' | 'updated_at'>;

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly db: Knex) {}

  async create(user: NewUser): Promise<User> {
    const row: InsertUserRow = {
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      phone: user.phone,
      birth_date: user.birthDate,
      privacy_consent_at: user.privacyConsentAt,
    };

    try {
      const [inserted] = await this.users().insert(row).returning('*');
      if (!inserted) {
        throw new Error('Insert into users returned no row');
      }
      return toUser(inserted);
    } catch (error) {
      if (isUniqueViolation(error, 'users_email_unique')) {
        throw new ConflictError('EMAIL_ALREADY_IN_USE', 'E-mail already registered');
      }
      throw error;
    }
  }

  async findById(id: UserId): Promise<User | null> {
    const row = await this.users().where({ id }).first();
    return row ? toUser(row) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.users().where({ email }).first();
    return row ? toUser(row) : null;
  }

  private users() {
    return this.db<UserRow>('users');
  }
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: parseEmail(row.email),
    phone: parsePhone(row.phone),
    birthDate: parseCalendarDate(row.birth_date),
    passwordHash: row.password_hash,
    tokenVersion: row.token_version,
    privacyConsentAt: row.privacy_consent_at,
  };
}
