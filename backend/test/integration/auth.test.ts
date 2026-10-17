import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { registrationInput } from '../support/builders.js';
import { createTestEnvironment, resetDatabase, signUp } from './support/test-environment.js';

const env = createTestEnvironment();
const { app, db, emails } = env;

beforeEach(async () => {
  await resetDatabase(db);
  emails.sent.length = 0;
  emails.notices.length = 0;
});

afterAll(async () => {
  await db.destroy();
});

describe('POST /api/auth/register', () => {
  it('creates the account only after the e-mailed code is confirmed', async () => {
    await request(app)
      .post('/api/auth/register')
      .send(registrationInput({ email: 'Ana@Example.com', phone: '(49) 99999-0000' }))
      .expect(202);
    expect(await db('users')).toHaveLength(0);
    expect(emails.sent).toMatchObject([{ to: 'ana@example.com', purpose: 'registration' }]);

    const response = await request(app)
      .post('/api/auth/register/confirm')
      .send({ email: 'ana@example.com', code: emails.lastCode() });

    expect(response.status).toBe(201);
    expect(typeof response.body.token).toBe('string');
    expect(response.body.user).toEqual({
      id: expect.any(Number),
      name: 'Ana Souza',
      email: 'ana@example.com',
      phone: '49999990000',
      birthDate: '1998-04-12',
    });
    expect(await db('pending_registrations')).toHaveLength(0);
  });

  it('refuses a wrong code', async () => {
    await request(app).post('/api/auth/register').send(registrationInput()).expect(202);
    const wrong = emails.lastCode() === '000000' ? '111111' : '000000';

    const response = await request(app)
      .post('/api/auth/register/confirm')
      .send({ email: 'ana@example.com', code: wrong });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_VERIFICATION_CODE');
    expect(await db('users')).toHaveLength(0);
  });

  it('stores a bcrypt hash, never the password', async () => {
    await signUp(env);

    const [row] = await db('users')
      .where({ email: 'ana@example.com' })
      .select<{ password_hash: string }[]>('password_hash');
    expect(row?.password_hash).toMatch(/^\$2[aby]\$/);
    expect(row?.password_hash).not.toContain('segredo123');
  });

  it('replaces the code of a repeated request and drops expired registrations', async () => {
    await request(app).post('/api/auth/register').send(registrationInput()).expect(202);
    const firstCode = emails.lastCode();
    await db('pending_registrations').insert({
      email: 'velho@example.com',
      name: 'Cadastro Velho',
      phone: '49999990000',
      birth_date: '1990-01-01',
      password_hash: 'x',
      privacy_consent_at: new Date(),
      code_hash: 'x',
      expires_at: new Date(Date.now() - 60_000),
    });

    await request(app).post('/api/auth/register').send(registrationInput()).expect(202);

    expect(await db('pending_registrations').pluck('email')).toEqual(['ana@example.com']);
    if (firstCode !== emails.lastCode()) {
      await request(app)
        .post('/api/auth/register/confirm')
        .send({ email: 'ana@example.com', code: firstCode })
        .expect(400);
    }
    await request(app)
      .post('/api/auth/register/confirm')
      .send({ email: 'ana@example.com', code: emails.lastCode() })
      .expect(201);
  });

  it('does not reveal that an e-mail already has an account', async () => {
    await signUp(env);
    emails.sent.length = 0;

    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationInput({ email: 'ANA@example.com', password: 'outrasenha1' }));

    expect(response.status).toBe(202);
    expect(emails.sent).toEqual([]);
    expect(emails.notices).toEqual([{ to: 'ana@example.com', name: 'Ana Souza' }]);
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'segredo123' })
      .expect(200);
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
    await signUp(env);
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
    const token = await signUp(env);

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
    const token = await signUp(env);

    const response = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${token.slice(0, -2)}xx`);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_TOKEN');
  });

  it('rejects the token of an account that no longer exists', async () => {
    const token = await signUp(env);
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
