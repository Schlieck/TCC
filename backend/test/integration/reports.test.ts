import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { asUser } from './support/as-user.js';
import { createTestEnvironment, resetDatabase, signUp } from './support/test-environment.js';

const { app, db } = createTestEnvironment();
const as = (token: string) => asUser(app, token);

let ana: string;
let bia: string;
let emotionIds: Record<string, number>;

async function record(token: string, date: string, emotions: [string, number][]) {
  await as(token)
    .post('/api/thought-records', {
      title: 'Registro',
      date,
      time: '09:00',
      description: 'Descrição do evento.',
      emotions: emotions.map(([slug, intensity]) => ({ emotionId: emotionIds[slug], intensity })),
    })
    .expect(201);
}

beforeEach(async () => {
  await resetDatabase(db);
  ana = await signUp(app, { email: 'ana@example.com' });
  bia = await signUp(app, { email: 'bia@example.com' });
  const emotions = await as(ana).get('/api/emotions');
  emotionIds = Object.fromEntries(
    emotions.body.map((emotion: { slug: string; id: number }) => [emotion.slug, emotion.id]),
  );
});

afterAll(async () => {
  await db.destroy();
});

describe('GET /api/reports/emotion-trend', () => {
  it('averages a month by 7-day blocks with one series per emotion', async () => {
    await record(ana, '2026-09-02', [
      ['anxiety', 80],
      ['joy', 10],
    ]);
    await record(ana, '2026-09-04', [['anxiety', 60]]);
    await record(ana, '2026-09-29', [['joy', 70]]);
    await record(bia, '2026-09-02', [['anxiety', 0]]);

    const response = await as(ana)
      .get('/api/reports/emotion-trend?from=2026-09-01&to=2026-09-30')
      .expect(200);

    expect(response.body.granularity).toBe('week');
    expect(response.body.buckets).toHaveLength(5);
    expect(response.body.series).toEqual([
      {
        emotion: { id: emotionIds.anxiety, slug: 'anxiety', name: 'Ansiedade' },
        values: [70, null, null, null, null],
      },
      {
        emotion: { id: emotionIds.joy, slug: 'joy', name: 'Alegria' },
        values: [10, null, null, null, 70],
      },
    ]);
  });

  it('requires both ends of the period', async () => {
    const response = await as(ana).get('/api/reports/emotion-trend?from=2026-09-01');

    expect(response.status).toBe(400);
    expect(response.body.error.details[0].field).toBe('to');
  });
});

describe('saved reports', () => {
  it('saves, lists, reopens and deletes', async () => {
    const created = await as(ana)
      .post('/api/saved-reports', { name: 'Setembro', from: '2026-09-01', to: '2026-09-30' })
      .expect(201);

    const list = await as(ana).get('/api/saved-reports').expect(200);
    expect(list.body).toEqual([
      {
        id: created.body.id,
        name: 'Setembro',
        period: { from: '2026-09-01', to: '2026-09-30' },
        createdAt: expect.any(String),
      },
    ]);

    await as(ana).get(`/api/saved-reports/${created.body.id}`).expect(200);
    await as(bia).get(`/api/saved-reports/${created.body.id}`).expect(404);
    await as(bia).delete(`/api/saved-reports/${created.body.id}`).expect(404);

    await as(ana).delete(`/api/saved-reports/${created.body.id}`).expect(204);
    expect((await as(ana).get('/api/saved-reports')).body).toEqual([]);
  });

  it('rejects an inverted period, also in the database', async () => {
    const response = await as(ana).post('/api/saved-reports', {
      name: 'Errado',
      from: '2026-09-30',
      to: '2026-09-01',
    });
    expect(response.body.error.code).toBe('INVALID_PERIOD');

    const anaId = (await db('users').where({ email: 'ana@example.com' }).first<{ id: number }>())
      .id;
    await expect(
      db('saved_reports').insert({
        user_id: anaId,
        name: 'x',
        start_date: '2026-09-30',
        end_date: '2026-09-01',
      }),
    ).rejects.toThrow(/saved_reports_period_order/);
  });
});
