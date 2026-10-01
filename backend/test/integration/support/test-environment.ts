import type { Express } from 'express';
import type { Knex } from 'knex';
import { pino } from 'pino';
import request from 'supertest';
import { createDatabase } from '../../../src/adapters/outbound/postgres/connection.js';
import { loadConfig, type Config } from '../../../src/main/config/env.js';
import { createHttpApp } from '../../../src/main/container.js';
import { registrationInput } from '../../support/builders.js';
import { CapturingEmailSender } from '../../support/fakes.js';

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
  emails: CapturingEmailSender;
}

export function createTestEnvironment(overrides: Partial<Config> = {}): TestEnvironment {
  const config = { ...loadTestConfig(), ...overrides };
  const db = createDatabase(config.database);
  const emails = new CapturingEmailSender();
  const app = createHttpApp({ config, logger: pino({ level: 'silent' }), db, emailSender: emails });
  return { app, db, emails };
}

/** Apaga os dados de todos os usuários (e, em cascata, tudo que pertence a eles). */
export async function resetDatabase(db: Knex): Promise<void> {
  await db.raw('TRUNCATE users RESTART IDENTITY CASCADE');
}

export async function signUp(
  app: Express,
  overrides: Parameters<typeof registrationInput>[0] = {},
): Promise<string> {
  const response = await request(app)
    .post('/api/auth/register')
    .send(registrationInput(overrides))
    .expect(201);
  const token: unknown = response.body.token;
  if (typeof token !== 'string') {
    throw new Error('Register did not return a token');
  }
  return token;
}
