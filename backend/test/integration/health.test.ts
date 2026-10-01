import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { createTestEnvironment } from './support/test-environment.js';

const { app, db } = createTestEnvironment();

afterAll(async () => {
  await db.destroy();
});

describe('GET /api/health', () => {
  it('reports the API and the database as up', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'up' });
  });

  it('answers unknown routes with a JSON 404', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: 'ROUTE_NOT_FOUND', message: 'Rota não encontrada.' },
    });
  });
});
