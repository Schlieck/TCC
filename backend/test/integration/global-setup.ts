import { createDatabase } from '../../src/adapters/outbound/postgres/connection.js';
import { migrateToLatest } from '../../src/adapters/outbound/postgres/migrator.js';
import { loadTestConfig } from './support/test-environment.js';

export default async function setup(): Promise<void> {
  const db = createDatabase(loadTestConfig().database);
  try {
    await migrateToLatest(db);
  } finally {
    await db.destroy();
  }
}
