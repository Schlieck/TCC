import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { createTestEnvironment } from './support/test-environment.js';

const { app, db } = createTestEnvironment();

afterAll(async () => {
  await db.destroy();
});

describe('GET /api/health', () => {
  it('reports the API and the database as up without authentication', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'up' });
  });

  it('answers unknown routes with a JSON 404', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: 'ROUTE_NOT_FOUND', message: 'Rota não encontrada.' },
    });
  });

  it('rejects malformed JSON bodies', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });
});
