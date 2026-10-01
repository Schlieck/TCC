import type { Express } from 'express';
import request from 'supertest';

/** Atalho para requisições autenticadas com o token de um usuário. */
export function asUser(app: Express, token: string) {
  const auth = `Bearer ${token}`;
  return {
    get: (path: string) => request(app).get(path).set('Authorization', auth),
    post: (path: string, body: object) =>
      request(app).post(path).set('Authorization', auth).send(body),
    put: (path: string, body: object) =>
      request(app).put(path).set('Authorization', auth).send(body),
    patch: (path: string, body: object) =>
      request(app).patch(path).set('Authorization', auth).send(body),
    delete: (path: string, body?: object) =>
      request(app)
        .delete(path)
        .set('Authorization', auth)
        .send(body ?? {}),
  };
}
