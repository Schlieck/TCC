import { Router } from 'express';
import type { AccountController } from '../controllers/account-controller.js';
import type { RateLimiters } from '../middlewares/rate-limit.js';

export function accountRoutes(controller: AccountController, limits: RateLimiters): Router {
  const router = Router();
  router.get('/me', controller.show);
  router.patch('/me', controller.update);
  router.put('/me/password', limits.passwordChange, controller.changePassword);
  router.post('/me/deletion-request', limits.codeRequest, controller.requestDeletion);
  router.post('/me/deletion', limits.codeConfirm, controller.confirmDeletion);
  return router;
}
