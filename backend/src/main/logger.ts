import { pino, type Logger } from 'pino';
import type { Config } from './config/env.js';

export function createLogger(config: Pick<Config, 'environment' | 'logLevel'>): Logger {
  const prettyPrint = config.environment === 'development';
  return pino({
    level: config.logLevel,
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    ...(prettyPrint
      ? {
          transport: {
            target: 'pino-pretty',
            options: { translateTime: 'SYS:HH:MM:ss', singleLine: true },
          },
        }
      : {}),
  });
}
