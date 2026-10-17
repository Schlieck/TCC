import { Router, type RequestHandler } from 'express';
import type { ThoughtRecordController } from '../controllers/thought-record-controller.js';

export function thoughtRecordRoutes(
  controller: ThoughtRecordController,
  auth: RequestHandler,
): Router {
  const router = Router();
  router.use(['/emotions', '/thought-records'], auth);

  router.get('/emotions', controller.emotions);

  router.get('/thought-records', controller.list);
  router.post('/thought-records', controller.create);
  router.get('/thought-records/:id', controller.show);
  router.put('/thought-records/:id', controller.update);
  router.delete('/thought-records/:id', controller.remove);

  return router;
}
