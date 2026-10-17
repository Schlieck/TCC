import type { NewUser } from './user.js';

export type PendingRegistrationId = number;

/**
 * Cadastro à espera do código enviado ao e-mail. Guarda os dados já validados e o hash da
 * senha; a conta só é criada quando o código confere.
 */
export interface PendingRegistration extends NewUser {
  readonly id: PendingRegistrationId;
  readonly codeHash: string;
  readonly expiresAt: Date;
  readonly failedAttempts: number;
}
