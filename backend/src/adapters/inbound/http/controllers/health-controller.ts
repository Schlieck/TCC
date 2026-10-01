import type { Request, Response } from 'express';
import type { CheckHealth } from '../../../../application/use-cases/health/check-health.js';

export class HealthController {
  constructor(private readonly checkHealth: CheckHealth) {}

  show = async (_request: Request, response: Response): Promise<void> => {
    const health = await this.checkHealth.execute();
    response.status(health.status === 'ok' ? 200 : 503).json(health);
  };
}
