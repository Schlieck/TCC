import type { DatabaseHealth } from '../../ports/database-health.js';

export interface CheckHealthOutput {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
}

export class CheckHealth {
  constructor(private readonly databaseHealth: DatabaseHealth) {}

  async execute(): Promise<CheckHealthOutput> {
    const databaseIsUp = await this.databaseHealth.isReachable();
    return {
      status: databaseIsUp ? 'ok' : 'degraded',
      database: databaseIsUp ? 'up' : 'down',
    };
  }
}
