import { Router } from 'express';
import type { AuthController } from '../controllers/auth-controller.js';
import type { RateLimiters } from '../middlewares/rate-limit.js';

export function authRoutes(controller: AuthController, limits: RateLimiters): Router {
  const router = Router();
  router.post('/auth/register', limits.register, controller.register);
  router.post('/auth/register/confirm', limits.codeConfirm, controller.confirmRegistration);
  router.post('/auth/login', limits.login, controller.login);
  router.post('/auth/password-reset/request', limits.codeRequest, controller.requestPasswordReset);
  router.post('/auth/password-reset/confirm', limits.codeConfirm, controller.resetPassword);
  return router;
}
