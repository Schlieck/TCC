import { Router } from 'express';
import type { ReportController } from '../controllers/report-controller.js';

export function reportRoutes(controller: ReportController): Router {
  const router = Router();

  router.get('/reports/emotion-trend', controller.trend);

  router.get('/saved-reports', controller.listSaved);
  router.post('/saved-reports', controller.createSaved);
  router.get('/saved-reports/:id', controller.showSaved);
  router.delete('/saved-reports/:id', controller.removeSaved);

  return router;
}
