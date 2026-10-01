import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import type { GetProfile } from '../../../application/use-cases/account/get-profile.js';
import type { AuthenticateRequest } from '../../../application/use-cases/auth/authenticate-request.js';
import type { LogIn } from '../../../application/use-cases/auth/log-in.js';
import type { RegisterUser } from '../../../application/use-cases/auth/register-user.js';
import type { CheckHealth } from '../../../application/use-cases/health/check-health.js';
import { AccountController } from './controllers/account-controller.js';
import { AuthController } from './controllers/auth-controller.js';
import {
  CopingCardController,
  type CopingCardUseCases,
} from './controllers/coping-card-controller.js';
import {
  CopingCardGroupController,
  type CopingCardGroupUseCases,
} from './controllers/coping-card-group-controller.js';
import { HealthController } from './controllers/health-controller.js';
import { authenticate } from './middlewares/authenticate.js';
import { errorHandler, routeNotFoundHandler } from './middlewares/error-handler.js';
import { createRateLimiters } from './middlewares/rate-limit.js';
import { accountRoutes } from './routes/account-routes.js';
import { authRoutes } from './routes/auth-routes.js';
import { copingCardRoutes } from './routes/coping-card-routes.js';
import { healthRoutes } from './routes/health-routes.js';

export interface HttpUseCases extends CopingCardGroupUseCases, CopingCardUseCases {
  checkHealth: CheckHealth;
  registerUser: RegisterUser;
  logIn: LogIn;
  authenticateRequest: AuthenticateRequest;
  getProfile: GetProfile;
}

export interface HttpAppOptions {
  logger: Logger;
  corsOrigins: string[];
  rateLimitEnabled: boolean;
  useCases: HttpUseCases;
}

export function createApp({
  logger,
  corsOrigins,
  rateLimitEnabled,
  useCases,
}: HttpAppOptions): Express {
  const app = express();
  const limits = createRateLimiters(rateLimitEnabled);

  app.use(helmet());
  app.use(cors({ origin: corsOrigins.length > 0 ? corsOrigins : false }));
  app.use(express.json({ limit: '100kb' }));
  app.use(requestLogger(logger));

  app.use('/api', healthRoutes(new HealthController(useCases.checkHealth)));
  app.use('/api', authRoutes(new AuthController(useCases.registerUser, useCases.logIn), limits));

  app.use('/api', authenticate(useCases.authenticateRequest));
  app.use('/api', accountRoutes(new AccountController(useCases.getProfile)));
  app.use(
    '/api',
    copingCardRoutes(new CopingCardGroupController(useCases), new CopingCardController(useCases)),
  );

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
