import type { Knex } from 'knex';
import type { DatabaseHealth } from '../../../application/ports/database-health.js';

export class PostgresDatabaseHealth implements DatabaseHealth {
  constructor(private readonly db: Knex) {}

  async isReachable(): Promise<boolean> {
    try {
      await this.db.raw('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
