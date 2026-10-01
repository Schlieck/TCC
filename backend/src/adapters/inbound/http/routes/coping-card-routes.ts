import { Router } from 'express';
import type { CopingCardController } from '../controllers/coping-card-controller.js';
import type { CopingCardGroupController } from '../controllers/coping-card-group-controller.js';

export function copingCardRoutes(
  groups: CopingCardGroupController,
  cards: CopingCardController,
): Router {
  const router = Router();

  router.get('/coping-card-groups', groups.list);
  router.post('/coping-card-groups', groups.create);
  router.patch('/coping-card-groups/:id', groups.rename);
  router.delete('/coping-card-groups/:id', groups.remove);

  router.get('/coping-cards', cards.list);
  router.post('/coping-cards', cards.create);
  router.get('/coping-cards/:id', cards.show);
  router.put('/coping-cards/:id', cards.update);
  router.delete('/coping-cards/:id', cards.remove);

  return router;
}
