import type { Express } from 'express';
import type { Knex } from 'knex';
import type { Logger } from 'pino';
import { createApp } from '../adapters/inbound/http/create-app.js';
import { PostgresDatabaseHealth } from '../adapters/outbound/postgres/postgres-database-health.js';
import { PostgresCopingCardGroupRepository } from '../adapters/outbound/postgres/repositories/postgres-coping-card-group-repository.js';
import { PostgresCopingCardRepository } from '../adapters/outbound/postgres/repositories/postgres-coping-card-repository.js';
import { PostgresEmotionHistory } from '../adapters/outbound/postgres/repositories/postgres-emotion-history.js';
import { PostgresEmotionRepository } from '../adapters/outbound/postgres/repositories/postgres-emotion-repository.js';
import { PostgresSavedReportRepository } from '../adapters/outbound/postgres/repositories/postgres-saved-report-repository.js';
import { PostgresThoughtRecordRepository } from '../adapters/outbound/postgres/repositories/postgres-thought-record-repository.js';
import { PostgresUserRepository } from '../adapters/outbound/postgres/repositories/postgres-user-repository.js';
import { BcryptPasswordHasher } from '../adapters/outbound/security/bcrypt-password-hasher.js';
import { JoseTokenService } from '../adapters/outbound/security/jose-token-service.js';
import { SystemClock } from '../adapters/outbound/system-clock.js';
import { GetProfile } from '../application/use-cases/account/get-profile.js';
import { AuthenticateRequest } from '../application/use-cases/auth/authenticate-request.js';
import { LogIn } from '../application/use-cases/auth/log-in.js';
import { RegisterUser } from '../application/use-cases/auth/register-user.js';
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
import type { Config } from './config/env.js';

export interface ContainerOptions {
  config: Config;
  logger: Logger;
  db: Knex;
}

export function createHttpApp({ config, logger, db }: ContainerOptions): Express {
  const clock = new SystemClock();
  const hasher = new BcryptPasswordHasher(config.auth.bcryptCost);
  const tokens = new JoseTokenService(config.auth.jwtSecret, config.auth.jwtExpiresIn);
  const users = new PostgresUserRepository(db);
  const groups = new PostgresCopingCardGroupRepository(db);
  const cards = new PostgresCopingCardRepository(db);
  const emotions = new PostgresEmotionRepository(db);
  const records = new PostgresThoughtRecordRepository(db);
  const savedReports = new PostgresSavedReportRepository(db);

  return createApp({
    logger,
    corsOrigins: config.corsOrigins,
    rateLimitEnabled: config.environment !== 'test',
    useCases: {
      checkHealth: new CheckHealth(new PostgresDatabaseHealth(db)),
      registerUser: new RegisterUser(users, hasher, tokens, clock),
      logIn: new LogIn(users, hasher, tokens),
      authenticateRequest: new AuthenticateRequest(tokens, users),
      getProfile: new GetProfile(users),
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
