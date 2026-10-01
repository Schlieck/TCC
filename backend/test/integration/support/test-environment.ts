import type { Express } from 'express';
import type { Knex } from 'knex';
import { pino } from 'pino';
import { createDatabase } from '../../../src/adapters/outbound/postgres/connection.js';
import { loadConfig, type Config } from '../../../src/main/config/env.js';
import { createHttpApp } from '../../../src/main/container.js';

export function loadTestConfig(): Config {
  const config = loadConfig();
  return {
    ...config,
    environment: 'test',
    database: { ...config.database, database: config.testDatabaseName },
    auth: { ...config.auth, bcryptCost: 4 },
  };
}

export interface TestEnvironment {
  app: Express;
  db: Knex;
}

export function createTestEnvironment(): TestEnvironment {
  const config = loadTestConfig();
  const db = createDatabase(config.database);
  const app = createHttpApp({ config, logger: pino({ level: 'silent' }), db });
  return { app, db };
}
