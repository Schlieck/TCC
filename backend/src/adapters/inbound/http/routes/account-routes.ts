import { Router, type RequestHandler } from 'express';
import type { AccountController } from '../controllers/account-controller.js';
import type { RateLimiters } from '../middlewares/rate-limit.js';

export function accountRoutes(
  controller: AccountController,
  limits: RateLimiters,
  auth: RequestHandler,
): Router {
  const router = Router();
  router.use('/me', auth);
  router.get('/me', controller.show);
  router.patch('/me', limits.passwordCheck, controller.update);
  router.put('/me/password', limits.passwordCheck, controller.changePassword);
  router.post('/me/deletion-request', limits.codeRequest, controller.requestDeletion);
  router.post('/me/deletion', limits.codeConfirm, controller.confirmDeletion);
  return router;
}
