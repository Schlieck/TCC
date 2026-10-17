import type { Email } from '../../domain/user/email.js';
import type {
  PendingRegistration,
  PendingRegistrationId,
} from '../../domain/user/pending-registration.js';

export type NewPendingRegistration = Omit<PendingRegistration, 'id' | 'failedAttempts'>;

export interface PendingRegistrationRepository {
  /** Grava o cadastro pendente, substituindo o anterior do mesmo e-mail (e o código dele). */
  save(registration: NewPendingRegistration): Promise<void>;
  findByEmail(email: Email): Promise<PendingRegistration | null>;
  registerFailedAttempt(id: PendingRegistrationId): Promise<void>;
  delete(id: PendingRegistrationId): Promise<void>;
}
