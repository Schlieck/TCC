import { createDatabase } from '../../adapters/outbound/postgres/connection.js';
import { migrateToLatest, rollbackLastBatch } from '../../adapters/outbound/postgres/migrator.js';
import { loadConfigOrExit } from '../load-config-or-exit.js';
import { createLogger } from '../logger.js';

const [command = 'latest', ...flags] = process.argv.slice(2);
const useTestDatabase = flags.includes('--test');

const config = loadConfigOrExit();
const logger = createLogger(config);
const database = useTestDatabase ? config.testDatabaseName : config.database.database;
const db = createDatabase({ ...config.database, database });

try {
  if (command === 'latest') {
    const applied = await migrateToLatest(db);
    logger.info(
      `[${database}] migrations aplicadas: ${applied.length > 0 ? applied.join(', ') : 'nenhuma, já está atualizado'}`,
    );
  } else if (command === 'rollback') {
    const reverted = await rollbackLastBatch(db);
    logger.info(`[${database}] migrations revertidas: ${reverted.join(', ') || 'nenhuma'}`);
  } else {
    logger.error(`Comando desconhecido "${command}". Use "latest" ou "rollback".`);
    process.exitCode = 1;
  }
} catch (error) {
  logger.error(error instanceof Error ? error.message : 'Falha ao executar as migrations');
  process.exitCode = 1;
} finally {
  await db.destroy();
}
