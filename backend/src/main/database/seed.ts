import { createDatabase } from '../../adapters/outbound/postgres/connection.js';
import { runSeeds } from '../../adapters/outbound/postgres/migrator.js';
import { loadConfigOrExit } from '../load-config-or-exit.js';
import { createLogger } from '../logger.js';

const config = loadConfigOrExit();
const logger = createLogger(config);

if (config.environment === 'production') {
  logger.error('O seed de desenvolvimento não roda com NODE_ENV=production.');
  process.exit(1);
}

const db = createDatabase(config.database);

try {
  const executed = await runSeeds(db);
  logger.info(`Seeds executados: ${executed.length > 0 ? executed.join(', ') : 'nenhum'}`);
} catch (error) {
  logger.error(error instanceof Error ? error.message : 'Falha ao executar os seeds');
  process.exitCode = 1;
} finally {
  await db.destroy();
}
