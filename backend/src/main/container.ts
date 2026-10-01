import type { Express } from 'express';
import type { Knex } from 'knex';
import type { Logger } from 'pino';
import { createApp } from '../adapters/inbound/http/create-app.js';
import { PostgresDatabaseHealth } from '../adapters/outbound/postgres/postgres-database-health.js';
import { CheckHealth } from '../application/use-cases/health/check-health.js';
import type { Config } from './config/env.js';

export interface ContainerOptions {
  config: Config;
  logger: Logger;
  db: Knex;
}

export function createHttpApp({ config, logger, db }: ContainerOptions): Express {
  const databaseHealth = new PostgresDatabaseHealth(db);

  return createApp({
    logger,
    corsOrigins: config.corsOrigins,
    useCases: {
      checkHealth: new CheckHealth(databaseHealth),
    },
  });
}
