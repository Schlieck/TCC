import type { VerificationPurpose } from '../../domain/verification/verification-code.js';

/** Para que serve o código: os de `verification_codes` e a confirmação do cadastro. */
export type CodePurpose = VerificationPurpose | 'registration';

export interface VerificationEmail {
  to: string;
  name: string;
  code: string;
  purpose: CodePurpose;
  expiresInMinutes: number;
}

export interface AccountExistsEmail {
  to: string;
  name: string;
}

export interface EmailSender {
  sendVerificationCode(email: VerificationEmail): Promise<void>;
  /** Avisa o dono de um e-mail já cadastrado que alguém tentou criar outra conta com ele. */
  sendAccountExistsNotice(email: AccountExistsEmail): Promise<void>;
}
