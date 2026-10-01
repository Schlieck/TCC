import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { registrationInput } from '../support/builders.js';
import { createTestEnvironment, resetDatabase, signUp } from './support/test-environment.js';

const { app, db } = createTestEnvironment();

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await db.destroy();
});

describe('POST /api/auth/register', () => {
  it('creates the account and returns a session', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationInput({ email: 'Ana@Example.com', phone: '(49) 99999-0000' }));

    expect(response.status).toBe(201);
    expect(typeof response.body.token).toBe('string');
    expect(response.body.user).toEqual({
      id: expect.any(Number),
      name: 'Ana Souza',
      email: 'ana@example.com',
      phone: '49999990000',
      birthDate: '1998-04-12',
    });
  });

  it('stores a bcrypt hash, never the password', async () => {
    await signUp(app);

    const [row] = await db('users')
      .where({ email: 'ana@example.com' })
      .select<{ password_hash: string }[]>('password_hash');
    expect(row?.password_hash).toMatch(/^\$2[aby]\$/);
    expect(row?.password_hash).not.toContain('segredo123');
  });

  it('refuses a duplicated e-mail with 409', async () => {
    await signUp(app);

    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationInput({ email: 'ANA@example.com' }));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_IN_USE');
  });

  it('lists invalid fields in Portuguese', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...registrationInput(), email: 'not-an-email', birthDate: '12/04/1998' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        { field: 'email', message: 'Informe um e-mail válido.' },
        { field: 'birthDate', message: 'Use o formato AAAA-MM-DD.' },
      ]),
    );
  });

  it('applies the domain password policy', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationInput({ password: 'semnumeros' }));

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: 'WEAK_PASSWORD',
      details: [{ field: 'password' }],
    });
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await signUp(app);
  });

  it('returns a session for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'segredo123' });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('ana@example.com');
  });

  it('answers 401 for a wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'errada123' });

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'E-mail ou senha incorretos.',
    });
  });
});

describe('GET /api/me', () => {
  it('returns the profile of the authenticated user', async () => {
    const token = await signUp(app);

    const response = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('ana@example.com');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('requires a token', async () => {
    const response = await request(app).get('/api/me');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('MISSING_TOKEN');
  });

  it('rejects a tampered token', async () => {
    const token = await signUp(app);

    const response = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${token.slice(0, -2)}xx`);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_TOKEN');
  });

  it('rejects the token of an account that no longer exists', async () => {
    const token = await signUp(app);
    await resetDatabase(db);

    const response = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });
});

describe('rate limiting', () => {
  it('blocks repeated login attempts with 429', async () => {
    const limited = createTestEnvironment({ environment: 'development' });
    try {
      const attempt = () =>
        request(limited.app)
          .post('/api/auth/login')
          .send({ email: 'ana@example.com', password: 'errada123' });

      for (let i = 0; i < 10; i++) {
        expect((await attempt()).status).toBe(401);
      }
      const blocked = await attempt();

      expect(blocked.status).toBe(429);
      expect(blocked.body.error.code).toBe('TOO_MANY_REQUESTS');
    } finally {
      await limited.db.destroy();
    }
  });
});
