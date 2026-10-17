import type { Knex } from 'knex';
import type {
  NewPendingRegistration,
  PendingRegistrationRepository,
} from '../../../../application/ports/pending-registration-repository.js';
import { parseCalendarDate } from '../../../../domain/shared/calendar-date.js';
import { parseEmail, type Email } from '../../../../domain/user/email.js';
import type {
  PendingRegistration,
  PendingRegistrationId,
} from '../../../../domain/user/pending-registration.js';
import { parsePhone } from '../../../../domain/user/phone.js';

interface PendingRegistrationRow {
  id: number;
  email: string;
  name: string;
  phone: string;
  birth_date: string;
  password_hash: string;
  privacy_consent_at: Date;
  code_hash: string;
  expires_at: Date;
  failed_attempts: number;
  created_at: Date;
  updated_at: Date;
}

export class PostgresPendingRegistrationRepository implements PendingRegistrationRepository {
  constructor(private readonly db: Knex) {}

  async save(registration: NewPendingRegistration): Promise<void> {
    await this.db.transaction(async (trx) => {
      // Dados de quem não confirmou o cadastro não ficam guardados depois que o código expira.
      await trx<PendingRegistrationRow>('pending_registrations')
        .where('expires_at', '<', trx.fn.now())
        .delete();
      await trx<PendingRegistrationRow>('pending_registrations')
        .insert({
          email: registration.email,
          name: registration.name,
          phone: registration.phone,
          birth_date: registration.birthDate,
          password_hash: registration.passwordHash,
          privacy_consent_at: registration.privacyConsentAt,
          code_hash: registration.codeHash,
          expires_at: registration.expiresAt,
          failed_attempts: 0,
        })
        .onConflict('email')
        .merge();
    });
  }

  async findByEmail(email: Email): Promise<PendingRegistration | null> {
    const row = await this.registrations().where({ email }).first();
    return row ? toPendingRegistration(row) : null;
  }

  async registerFailedAttempt(id: PendingRegistrationId): Promise<void> {
    await this.registrations().where({ id }).increment('failed_attempts', 1);
  }

  async delete(id: PendingRegistrationId): Promise<void> {
    await this.registrations().where({ id }).delete();
  }

  private registrations() {
    return this.db<PendingRegistrationRow>('pending_registrations');
  }
}

function toPendingRegistration(row: PendingRegistrationRow): PendingRegistration {
  return {
    id: row.id,
    name: row.name,
    email: parseEmail(row.email),
    phone: parsePhone(row.phone),
    birthDate: parseCalendarDate(row.birth_date),
    passwordHash: row.password_hash,
    privacyConsentAt: row.privacy_consent_at,
    codeHash: row.code_hash,
    expiresAt: row.expires_at,
    failedAttempts: row.failed_attempts,
  };
}
