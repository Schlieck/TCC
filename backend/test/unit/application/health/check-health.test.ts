import { describe, expect, it } from 'vitest';
import type { DatabaseHealth } from '../../../../src/application/ports/database-health.js';
import { CheckHealth } from '../../../../src/application/use-cases/health/check-health.js';

function databaseThatIs(reachable: boolean): DatabaseHealth {
  return { isReachable: () => Promise.resolve(reachable) };
}

describe('CheckHealth', () => {
  it('reports ok when the database is reachable', async () => {
    const health = await new CheckHealth(databaseThatIs(true)).execute();

    expect(health).toEqual({ status: 'ok', database: 'up' });
  });

  it('reports degraded when the database is unreachable', async () => {
    const health = await new CheckHealth(databaseThatIs(false)).execute();

    expect(health).toEqual({ status: 'degraded', database: 'down' });
  });
});
