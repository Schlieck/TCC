import type {
  NewPendingRegistration,
  PendingRegistrationRepository,
} from '../../../src/application/ports/pending-registration-repository.js';
import type { Email } from '../../../src/domain/user/email.js';
import type {
  PendingRegistration,
  PendingRegistrationId,
} from '../../../src/domain/user/pending-registration.js';

export class InMemoryPendingRegistrationRepository implements PendingRegistrationRepository {
  readonly registrations = new Map<Email, PendingRegistration>();
  private nextId = 1;

  save(registration: NewPendingRegistration): Promise<void> {
    this.registrations.set(registration.email, {
      ...registration,
      id: this.nextId++,
      failedAttempts: 0,
    });
    return Promise.resolve();
  }

  findByEmail(email: Email): Promise<PendingRegistration | null> {
    return Promise.resolve(this.registrations.get(email) ?? null);
  }

  registerFailedAttempt(id: PendingRegistrationId): Promise<void> {
    const registration = this.byId(id);
    if (registration) {
      this.registrations.set(registration.email, {
        ...registration,
        failedAttempts: registration.failedAttempts + 1,
      });
    }
    return Promise.resolve();
  }

  delete(id: PendingRegistrationId): Promise<void> {
    const registration = this.byId(id);
    if (registration) {
      this.registrations.delete(registration.email);
    }
    return Promise.resolve();
  }

  private byId(id: PendingRegistrationId): PendingRegistration | undefined {
    return [...this.registrations.values()].find((registration) => registration.id === id);
  }
}
