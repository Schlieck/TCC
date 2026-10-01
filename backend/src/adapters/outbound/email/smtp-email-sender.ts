import nodemailer, { type Transporter } from 'nodemailer';
import type { EmailSender, VerificationEmail } from '../../../application/ports/email-sender.js';
import { verificationEmailContent } from './verification-email-content.js';

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

export class SmtpEmailSender implements EmailSender {
  private readonly transporter: Transporter;

  constructor(private readonly settings: SmtpSettings) {
    this.transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: { user: settings.user, pass: settings.password },
    });
  }

  async sendVerificationCode(email: VerificationEmail): Promise<void> {
    const { subject, text } = verificationEmailContent(email);
    await this.transporter.sendMail({ from: this.settings.from, to: email.to, subject, text });
  }
}
