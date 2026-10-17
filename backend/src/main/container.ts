import type { Express } from 'express';
import type { Knex } from 'knex';
import type { Logger } from 'pino';
import { createApp } from '../adapters/inbound/http/create-app.js';
import { ConsoleEmailSender } from '../adapters/outbound/email/console-email-sender.js';
import { SmtpEmailSender } from '../adapters/outbound/email/smtp-email-sender.js';
import { PostgresDatabaseHealth } from '../adapters/outbound/postgres/postgres-database-health.js';
import { PostgresCopingCardGroupRepository } from '../adapters/outbound/postgres/repositories/postgres-coping-card-group-repository.js';
import { PostgresCopingCardRepository } from '../adapters/outbound/postgres/repositories/postgres-coping-card-repository.js';
import { PostgresEmotionHistory } from '../adapters/outbound/postgres/repositories/postgres-emotion-history.js';
import { PostgresEmotionRepository } from '../adapters/outbound/postgres/repositories/postgres-emotion-repository.js';
import { PostgresPendingRegistrationRepository } from '../adapters/outbound/postgres/repositories/postgres-pending-registration-repository.js';
import { PostgresSavedReportRepository } from '../adapters/outbound/postgres/repositories/postgres-saved-report-repository.js';
import { PostgresThoughtRecordRepository } from '../adapters/outbound/postgres/repositories/postgres-thought-record-repository.js';
import { PostgresUserRepository } from '../adapters/outbound/postgres/repositories/postgres-user-repository.js';
import { PostgresVerificationCodeRepository } from '../adapters/outbound/postgres/repositories/postgres-verification-code-repository.js';
import { BcryptPasswordHasher } from '../adapters/outbound/security/bcrypt-password-hasher.js';
import { CryptoCodeGenerator } from '../adapters/outbound/security/crypto-code-generator.js';
import { JoseTokenService } from '../adapters/outbound/security/jose-token-service.js';
import { SystemClock } from '../adapters/outbound/system-clock.js';
import type { EmailSender } from '../application/ports/email-sender.js';
import { ChangePassword } from '../application/use-cases/account/change-password.js';
import { ConfirmAccountDeletion } from '../application/use-cases/account/confirm-account-deletion.js';
import { GetProfile } from '../application/use-cases/account/get-profile.js';
import { RequestAccountDeletion } from '../application/use-cases/account/request-account-deletion.js';
import { UpdateProfile } from '../application/use-cases/account/update-profile.js';
import { AuthenticateRequest } from '../application/use-cases/auth/authenticate-request.js';
import { ConfirmRegistration } from '../application/use-cases/auth/confirm-registration.js';
import { LogIn } from '../application/use-cases/auth/log-in.js';
import { RequestPasswordReset } from '../application/use-cases/auth/request-password-reset.js';
import { RequestRegistration } from '../application/use-cases/auth/request-registration.js';
import { ResetPassword } from '../application/use-cases/auth/reset-password.js';
import { CreateCopingCard } from '../application/use-cases/coping-cards/create-coping-card.js';
import { CreateCopingCardGroup } from '../application/use-cases/coping-cards/create-coping-card-group.js';
import { DeleteCopingCard } from '../application/use-cases/coping-cards/delete-coping-card.js';
import { DeleteCopingCardGroup } from '../application/use-cases/coping-cards/delete-coping-card-group.js';
import { GetCopingCard } from '../application/use-cases/coping-cards/get-coping-card.js';
import { ListCopingCardGroups } from '../application/use-cases/coping-cards/list-coping-card-groups.js';
import { ListCopingCards } from '../application/use-cases/coping-cards/list-coping-cards.js';
import { RenameCopingCardGroup } from '../application/use-cases/coping-cards/rename-coping-card-group.js';
import { UpdateCopingCard } from '../application/use-cases/coping-cards/update-coping-card.js';
import { CheckHealth } from '../application/use-cases/health/check-health.js';
import { CreateSavedReport } from '../application/use-cases/reports/create-saved-report.js';
import { DeleteSavedReport } from '../application/use-cases/reports/delete-saved-report.js';
import { GetEmotionTrend } from '../application/use-cases/reports/get-emotion-trend.js';
import { GetSavedReport } from '../application/use-cases/reports/get-saved-report.js';
import { ListSavedReports } from '../application/use-cases/reports/list-saved-reports.js';
import { CreateThoughtRecord } from '../application/use-cases/thought-records/create-thought-record.js';
import { DeleteThoughtRecord } from '../application/use-cases/thought-records/delete-thought-record.js';
import { GetThoughtRecord } from '../application/use-cases/thought-records/get-thought-record.js';
import { ListEmotions } from '../application/use-cases/thought-records/list-emotions.js';
import { ListThoughtRecords } from '../application/use-cases/thought-records/list-thought-records.js';
import { UpdateThoughtRecord } from '../application/use-cases/thought-records/update-thought-record.js';
import { VerificationCodes } from '../application/use-cases/verification/verification-codes.js';
import type { Config } from './config/env.js';

export interface ContainerOptions {
  config: Config;
  logger: Logger;
  db: Knex;
  /** Permite aos testes capturar os e-mails em vez de enviá-los. */
  emailSender?: EmailSender;
}

export function createHttpApp({ config, logger, db, emailSender }: ContainerOptions): Express {
  const clock = new SystemClock();
  const hasher = new BcryptPasswordHasher(config.auth.bcryptCost);
  const tokens = new JoseTokenService(config.auth.jwtSecret, config.auth.jwtExpiresIn);
  const users = new PostgresUserRepository(db);
  const groups = new PostgresCopingCardGroupRepository(db);
  const cards = new PostgresCopingCardRepository(db);
  const emotions = new PostgresEmotionRepository(db);
  const records = new PostgresThoughtRecordRepository(db);
  const savedReports = new PostgresSavedReportRepository(db);
  const pendingRegistrations = new PostgresPendingRegistrationRepository(db);
  const codeGenerator = new CryptoCodeGenerator();
  const emails = emailSender ?? createEmailSender(config, logger);
  const verificationCodes = new VerificationCodes(
    new PostgresVerificationCodeRepository(db),
    codeGenerator,
    hasher,
    emails,
    clock,
  );

  return createApp({
    logger,
    corsOrigins: config.corsOrigins,
    rateLimitEnabled: config.environment !== 'test',
    useCases: {
      checkHealth: new CheckHealth(new PostgresDatabaseHealth(db)),
      requestRegistration: new RequestRegistration(
        users,
        pendingRegistrations,
        codeGenerator,
        hasher,
        emails,
        clock,
      ),
      confirmRegistration: new ConfirmRegistration(
        users,
        pendingRegistrations,
        hasher,
        tokens,
        clock,
      ),
      logIn: new LogIn(users, hasher, tokens),
      requestPasswordReset: new RequestPasswordReset(users, verificationCodes, hasher),
      resetPassword: new ResetPassword(users, verificationCodes, hasher, tokens),
      authenticateRequest: new AuthenticateRequest(tokens, users),
      getProfile: new GetProfile(users),
      updateProfile: new UpdateProfile(users, hasher, clock),
      changePassword: new ChangePassword(users, hasher, tokens),
      requestAccountDeletion: new RequestAccountDeletion(users, verificationCodes),
      confirmAccountDeletion: new ConfirmAccountDeletion(users, verificationCodes),
      listGroups: new ListCopingCardGroups(groups),
      createGroup: new CreateCopingCardGroup(groups),
      renameGroup: new RenameCopingCardGroup(groups),
      deleteGroup: new DeleteCopingCardGroup(groups),
      listCards: new ListCopingCards(cards),
      getCard: new GetCopingCard(cards),
      createCard: new CreateCopingCard(cards, groups),
      updateCard: new UpdateCopingCard(cards, groups),
      deleteCard: new DeleteCopingCard(cards),
      listEmotions: new ListEmotions(emotions),
      listRecords: new ListThoughtRecords(records),
      getRecord: new GetThoughtRecord(records),
      createRecord: new CreateThoughtRecord(records, emotions, clock),
      updateRecord: new UpdateThoughtRecord(records, emotions, clock),
      deleteRecord: new DeleteThoughtRecord(records),
      getEmotionTrend: new GetEmotionTrend(new PostgresEmotionHistory(db), emotions),
      listSavedReports: new ListSavedReports(savedReports),
      getSavedReport: new GetSavedReport(savedReports),
      createSavedReport: new CreateSavedReport(savedReports),
      deleteSavedReport: new DeleteSavedReport(savedReports),
    },
  });
}

function createEmailSender(config: Config, logger: Logger): EmailSender {
  return config.email.driver === 'smtp'
    ? new SmtpEmailSender(config.email)
    : new ConsoleEmailSender(logger);
}
