import type {
  AccountExistsEmail,
  CodePurpose,
  VerificationEmail,
} from '../../../application/ports/email-sender.js';

const ACTIONS: Record<CodePurpose, string> = {
  account_deletion: 'confirmar a exclusão da sua conta',
  password_reset: 'redefinir a sua senha',
  registration: 'confirmar o seu cadastro',
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

export function accountExistsEmailContent(email: AccountExistsEmail): EmailContent {
  return {
    subject: 'Você já tem uma conta no Shifty',
    text: [
      `Olá, ${email.name}!`,
      '',
      'Alguém tentou criar uma conta no Shifty com este e-mail, mas ele já está cadastrado.',
      'Se foi você, entre com a sua senha ou use "Esqueci a senha" na tela de login.',
      '',
      'Se não foi você, ignore este e-mail: nada foi alterado na sua conta.',
    ].join('\n'),
  };
}
