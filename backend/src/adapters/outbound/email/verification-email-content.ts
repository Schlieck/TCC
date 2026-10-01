import type { VerificationEmail } from '../../../application/ports/email-sender.js';
import type { VerificationPurpose } from '../../../domain/verification/verification-code.js';

const ACTIONS: Record<VerificationPurpose, string> = {
  account_deletion: 'confirmar a exclusão da sua conta',
  password_reset: 'redefinir a sua senha',
};

export interface EmailContent {
  subject: string;
  text: string;
}

export function verificationEmailContent(email: VerificationEmail): EmailContent {
  return {
    subject: `Seu código do Shifty: ${email.code}`,
    text: [
      `Olá, ${email.name}!`,
      '',
      `Use o código ${email.code} para ${ACTIONS[email.purpose]} no Shifty.`,
      `Ele vale por ${email.expiresInMinutes} minutos e só pode ser usado uma vez.`,
      '',
      'Se não foi você quem pediu, ignore este e-mail: nada será alterado.',
    ].join('\n'),
  };
}
