import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { asUser } from './support/as-user.js';
import { createTestEnvironment, resetDatabase, signUp } from './support/test-environment.js';

const env = createTestEnvironment();
const { app, db } = env;
const as = (token: string) => asUser(app, token);

let ana: string;
let bia: string;
let emotionIds: Record<string, number>;

function recordBody(overrides: object = {}) {
  return {
    title: 'Reunião no trabalho',
    date: '2026-09-28',
    time: '14:30',
    description: 'Achei que todos iam perceber que eu não sabia a resposta.',
    emotions: [
      { emotionId: emotionIds.anxiety, intensity: 80 },
      { emotionId: emotionIds.joy, intensity: 10 },
    ],
    ...overrides,
  };
}

async function createRecord(token: string, overrides: object = {}): Promise<number> {
  const response = await as(token).post('/api/thought-records', recordBody(overrides)).expect(201);
  return response.body.id;
}

beforeEach(async () => {
  await resetDatabase(db);
  ana = await signUp(env, { email: 'ana@example.com' });
  bia = await signUp(env, { email: 'bia@example.com' });
  const emotions = await as(ana).get('/api/emotions').expect(200);
  emotionIds = Object.fromEntries(
    emotions.body.map((emotion: { slug: string; id: number }) => [emotion.slug, emotion.id]),
  );
});

afterAll(async () => {
  await db.destroy();
});

describe('GET /api/emotions', () => {
  it('lists the eight predefined emotions in Portuguese', async () => {
    const response = await as(ana).get('/api/emotions').expect(200);

    expect(response.body.map((emotion: { name: string }) => emotion.name)).toEqual([
      'Ansiedade',
      'Tristeza',
      'Raiva',
      'Medo',
      'Culpa',
      'Vergonha',
      'Alegria',
      'Alívio',
    ]);
  });
});

describe('thought records', () => {
  it('runs the full CRUD, replacing emotions on update', async () => {
    const id = await createRecord(ana);

    const shown = await as(ana).get(`/api/thought-records/${id}`).expect(200);
    expect(shown.body).toMatchObject({
      title: 'Reunião no trabalho',
      date: '2026-09-28',
      time: '14:30',
      emotions: [
        { emotionId: emotionIds.anxiety, intensity: 80 },
        { emotionId: emotionIds.joy, intensity: 10 },
      ],
    });

    const updated = await as(ana)
      .put(
        `/api/thought-records/${id}`,
        recordBody({ emotions: [{ emotionId: emotionIds.relief, intensity: 70 }] }),
      )
      .expect(200);
    expect(updated.body.emotions).toEqual([{ emotionId: emotionIds.relief, intensity: 70 }]);

    await as(ana).delete(`/api/thought-records/${id}`).expect(204);
    await as(ana).get(`/api/thought-records/${id}`).expect(404);
    expect(await db('thought_record_emotions').where({ thought_record_id: id })).toEqual([]);
  });

  it('filters the list by period, newest first', async () => {
    await createRecord(ana, { title: 'Agosto', date: '2026-08-20' });
    await createRecord(ana, { title: 'Setembro cedo', date: '2026-09-05', time: '08:00' });
    await createRecord(ana, { title: 'Setembro tarde', date: '2026-09-05', time: '21:15' });

    const september = await as(ana)
      .get('/api/thought-records?from=2026-09-01&to=2026-09-30')
      .expect(200);

    expect(september.body.map((record: { title: string }) => record.title)).toEqual([
      'Setembro tarde',
      'Setembro cedo',
    ]);
  });

  it('rejects an inverted period', async () => {
    const response = await as(ana).get('/api/thought-records?from=2026-09-30&to=2026-09-01');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_PERIOD');
  });

  it('validates emotions and intensities', async () => {
    const empty = await as(ana).post('/api/thought-records', recordBody({ emotions: [] }));
    const outOfRange = await as(ana).post(
      '/api/thought-records',
      recordBody({ emotions: [{ emotionId: emotionIds.anxiety, intensity: 150 }] }),
    );

    expect(empty.body.error.code).toBe('EMOTIONS_REQUIRED');
    expect(outOfRange.status).toBe(400);
  });

  it("keeps each user's records private", async () => {
    const id = await createRecord(ana);

    expect((await as(bia).get('/api/thought-records')).body).toEqual([]);
    await as(bia).get(`/api/thought-records/${id}`).expect(404);
    await as(bia).put(`/api/thought-records/${id}`, recordBody()).expect(404);
    await as(bia).delete(`/api/thought-records/${id}`).expect(404);
  });

  it('enforces the intensity range in the database too', async () => {
    const id = await createRecord(ana);

    await expect(
      db('thought_record_emotions')
        .where({ thought_record_id: id, emotion_id: emotionIds.anxiety })
        .update({ intensity: 101 }),
    ).rejects.toThrow(/thought_record_emotions_intensity_range/);
  });

  it('removes records and their emotions when the user is deleted', async () => {
    await createRecord(ana);

    await db('users').where({ email: 'ana@example.com' }).delete();

    expect(await db('thought_records')).toEqual([]);
    expect(await db('thought_record_emotions')).toEqual([]);
  });
});
