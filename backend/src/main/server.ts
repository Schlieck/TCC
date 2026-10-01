import { networkInterfaces } from 'node:os';
import { createDatabase } from '../adapters/outbound/postgres/connection.js';
import { createHttpApp } from './container.js';
import { loadConfigOrExit } from './load-config-or-exit.js';
import { createLogger } from './logger.js';

const config = loadConfigOrExit();
const logger = createLogger(config);
const db = createDatabase(config.database);
const app = createHttpApp({ config, logger, db });

const server = app.listen(config.server.port, config.server.host, () => {
  logger.info(`API ouvindo em http://${config.server.host}:${config.server.port}/api`);
  for (const address of localNetworkAddresses()) {
    logger.info(`Na rede local: EXPO_PUBLIC_API_URL=http://${address}:${config.server.port}/api`);
  }
});

function localNetworkAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flatMap((addresses) => addresses ?? [])
    .filter((address) => address.family === 'IPv4' && !address.internal)
    .map((address) => address.address);
}

function shutdown(signal: string): void {
  logger.info(`${signal} recebido, encerrando`);
  server.close(() => {
    void db.destroy().finally(() => process.exit(0));
  });
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
