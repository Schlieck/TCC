import { Router } from 'express';
import type { ThoughtRecordController } from '../controllers/thought-record-controller.js';

export function thoughtRecordRoutes(controller: ThoughtRecordController): Router {
  const router = Router();

  router.get('/emotions', controller.emotions);

  router.get('/thought-records', controller.list);
  router.post('/thought-records', controller.create);
  router.get('/thought-records/:id', controller.show);
  router.put('/thought-records/:id', controller.update);
  router.delete('/thought-records/:id', controller.remove);

  return router;
}
