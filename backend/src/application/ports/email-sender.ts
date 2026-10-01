import type { VerificationPurpose } from '../../domain/verification/verification-code.js';

export interface VerificationEmail {
  to: string;
  name: string;
  code: string;
  purpose: VerificationPurpose;
  expiresInMinutes: number;
}

export interface EmailSender {
  sendVerificationCode(email: VerificationEmail): Promise<void>;
}
