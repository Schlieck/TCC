import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';

const runningFromSource = import.meta.url.endsWith('.ts');
const sourceExtension = runningFromSource ? '.ts' : '.js';

const migrationConfig: Knex.MigratorConfig = {
  directory: fileURLToPath(new URL('./migrations', import.meta.url)),
  loadExtensions: [sourceExtension],
  tableName: 'knex_migrations',
};

const seedConfig: Knex.SeederConfig = {
  directory: fileURLToPath(new URL('./seeds', import.meta.url)),
  loadExtensions: [sourceExtension],
};

export async function migrateToLatest(db: Knex): Promise<string[]> {
  const [, applied] = (await db.migrate.latest(migrationConfig)) as [number, string[]];
  return applied;
}

export async function rollbackLastBatch(db: Knex): Promise<string[]> {
  const [, reverted] = (await db.migrate.rollback(migrationConfig)) as [number, string[]];
  return reverted;
}

export async function runSeeds(db: Knex): Promise<string[]> {
  const [executed] = await db.seed.run(seedConfig);
  return executed;
}
