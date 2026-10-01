import { Router } from 'express';
import type { AccountController } from '../controllers/account-controller.js';

export function accountRoutes(controller: AccountController): Router {
  const router = Router();
  router.get('/me', controller.show);
  return router;
}
