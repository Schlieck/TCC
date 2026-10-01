import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { asUser } from './support/as-user.js';
import { createTestEnvironment, resetDatabase, signUp } from './support/test-environment.js';

const { app, db, emails } = createTestEnvironment();
const as = (token: string) => asUser(app, token);

let ana: string;

beforeEach(async () => {
  await resetDatabase(db);
  emails.sent.length = 0;
  ana = await signUp(app, { email: 'ana@example.com' });
  await signUp(app, { email: 'bia@example.com' });
});

afterAll(async () => {
  await db.destroy();
});

describe('PATCH /api/me', () => {
  it('updates the profile', async () => {
    const response = await as(ana)
      .patch('/api/me', { name: 'Ana Lima', phone: '(49) 98888-7777', birthDate: '1997-01-20' })
      .expect(200);

    expect(response.body).toMatchObject({
      name: 'Ana Lima',
      phone: '49988887777',
      birthDate: '1997-01-20',
    });
  });

  it("refuses another account's e-mail", async () => {
    const response = await as(ana).patch('/api/me', { email: 'bia@example.com' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_IN_USE');
  });
});

describe('PUT /api/me/password', () => {
  it('returns a new token and revokes the old one', async () => {
    const response = await as(ana)
      .put('/api/me/password', { currentPassword: 'segredo123', newPassword: 'novasenha1' })
      .expect(200);

    await as(ana).get('/api/me').expect(401);
    await as(response.body.token).get('/api/me').expect(200);
  });

  it('points to the current password field when it is wrong', async () => {
    const response = await as(ana).put('/api/me/password', {
      currentPassword: 'errada123',
      newPassword: 'novasenha1',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.details).toEqual([
      { field: 'currentPassword', message: 'A senha atual não confere.' },
    ]);
  });
});

describe('account deletion', () => {
  async function seedUserData() {
    const group = await as(ana).post('/api/coping-card-groups', { name: 'Ansiedade' });
    await as(ana).post('/api/coping-cards', {
      groupId: group.body.id,
      name: 'Respire',
      description: 'Conte até 4.',
    });
    const emotions = await as(ana).get('/api/emotions');
    await as(ana).post('/api/thought-records', {
      title: 'Registro',
      date: '2026-09-28',
      time: '10:00',
      description: 'Descrição.',
      emotions: [{ emotionId: emotions.body[0].id, intensity: 50 }],
    });
    await as(ana).post('/api/saved-reports', {
      name: 'Setembro',
      from: '2026-09-01',
      to: '2026-09-30',
    });
  }

  it('deletes the account and every piece of user data with the e-mailed code', async () => {
    await seedUserData();

    await as(ana).post('/api/me/deletion-request', {}).expect(202);
    const code = emails.lastCode();
    expect(emails.sent[0]).toMatchObject({ to: 'ana@example.com', purpose: 'account_deletion' });

    const [stored] = await db('verification_codes').select<{ code_hash: string }[]>('code_hash');
    expect(stored?.code_hash).toMatch(/^\$2[aby]\$/);
    expect(stored?.code_hash).not.toContain(code);

    await as(ana).post('/api/me/deletion', { code }).expect(204);

    await as(ana).get('/api/me').expect(401);
    for (const table of [
      'coping_cards',
      'coping_card_groups',
      'thought_records',
      'thought_record_emotions',
      'saved_reports',
      'verification_codes',
    ]) {
      expect(await db(table), table).toEqual([]);
    }
    expect(await db('users').where({ email: 'bia@example.com' })).toHaveLength(1);
  });

  it('keeps the account when the code is wrong', async () => {
    await as(ana).post('/api/me/deletion-request', {}).expect(202);

    const response = await as(ana).post('/api/me/deletion', { code: '000000' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_VERIFICATION_CODE');
    await as(ana).get('/api/me').expect(200);
  });

  it('answers 429 once the code is locked by wrong attempts', async () => {
    await as(ana).post('/api/me/deletion-request', {}).expect(202);

    for (let attempt = 1; attempt < 5; attempt++) {
      await as(ana).post('/api/me/deletion', { code: '000000' }).expect(400);
    }
    const locked = await as(ana).post('/api/me/deletion', { code: '000000' });

    expect(locked.status).toBe(429);
    expect(locked.body.error.code).toBe('TOO_MANY_CODE_ATTEMPTS');
  });

  it('validates the code format', async () => {
    const response = await as(ana).post('/api/me/deletion', { code: '12ab' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
