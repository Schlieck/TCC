import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { asUser } from './support/as-user.js';
import { createTestEnvironment, resetDatabase, signUp } from './support/test-environment.js';

const env = createTestEnvironment();
const { app, db, emails } = env;

let oldToken: string;

beforeEach(async () => {
  await resetDatabase(db);
  oldToken = await signUp(env, { email: 'ana@example.com' });
  emails.sent.length = 0;
});

afterAll(async () => {
  await db.destroy();
});

describe('password reset', () => {
  it('answers 202 whether or not the e-mail has an account', async () => {
    await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'naoexiste@example.com' })
      .expect(202);
    expect(emails.sent).toEqual([]);

    await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'ana@example.com' })
      .expect(202);
    expect(emails.sent).toHaveLength(1);
  });

  it('changes the password with the e-mailed code and revokes old sessions', async () => {
    await request(app).post('/api/auth/password-reset/request').send({ email: 'ana@example.com' });

    const reset = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({ email: 'ana@example.com', code: emails.lastCode(), newPassword: 'novasenha1' })
      .expect(200);

    await asUser(app, reset.body.token).get('/api/me').expect(200);
    await asUser(app, oldToken).get('/api/me').expect(401);
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'novasenha1' })
      .expect(200);
  });

  it('refuses a wrong code', async () => {
    await request(app).post('/api/auth/password-reset/request').send({ email: 'ana@example.com' });

    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({ email: 'ana@example.com', code: '000000', newPassword: 'novasenha1' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_VERIFICATION_CODE');
  });
});
