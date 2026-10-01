import type { Logger } from 'pino';
import type { EmailSender, VerificationEmail } from '../../../application/ports/email-sender.js';

/**
 * Só para desenvolvimento: em vez de enviar, mostra o código no log do servidor.
 * É a única exceção à regra de nunca registrar códigos em log.
 */
export class ConsoleEmailSender implements EmailSender {
  constructor(private readonly logger: Logger) {}

  sendVerificationCode(email: VerificationEmail): Promise<void> {
    this.logger.info(
      `[e-mail simulado] Código ${email.code} (${email.purpose}) para ${email.to}, válido por ${email.expiresInMinutes} min`,
    );
    return Promise.resolve();
  }
}
