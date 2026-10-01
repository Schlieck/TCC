import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import type { CheckHealth } from '../../../application/use-cases/health/check-health.js';
import { HealthController } from './controllers/health-controller.js';
import { errorHandler, routeNotFoundHandler } from './middlewares/error-handler.js';
import { healthRoutes } from './routes/health-routes.js';

export interface HttpUseCases {
  checkHealth: CheckHealth;
}

export interface HttpAppOptions {
  logger: Logger;
  corsOrigins: string[];
  useCases: HttpUseCases;
}

export function createApp({ logger, corsOrigins, useCases }: HttpAppOptions): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: corsOrigins.length > 0 ? corsOrigins : false }));
  app.use(express.json({ limit: '100kb' }));
  app.use(requestLogger(logger));

  app.use('/api', healthRoutes(new HealthController(useCases.checkHealth)));

  app.use(routeNotFoundHandler);
  app.use(errorHandler(logger));
  return app;
}

// Registra só método, rota e status: corpo e cabeçalhos podem conter dados sensíveis.
function requestLogger(logger: Logger) {
  return pinoHttp({
    logger,
    serializers: {
      req: (request: { method: string; url: string }) => ({
        method: request.method,
        url: request.url,
      }),
      res: (response: { statusCode: number }) => ({ statusCode: response.statusCode }),
    },
  });
}
