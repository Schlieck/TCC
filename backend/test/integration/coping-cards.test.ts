import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { asUser } from './support/as-user.js';
import { createTestEnvironment, resetDatabase, signUp } from './support/test-environment.js';

const { app, db } = createTestEnvironment();
const as = (token: string) => asUser(app, token);

let ana: string;
let bia: string;

async function createGroup(token: string, name: string): Promise<number> {
  const response = await as(token).post('/api/coping-card-groups', { name }).expect(201);
  return response.body.id;
}

async function createCard(token: string, groupId: number, name = 'Respire'): Promise<number> {
  const response = await as(token)
    .post('/api/coping-cards', { groupId, name, description: 'Inspire contando até 4.' })
    .expect(201);
  return response.body.id;
}

beforeEach(async () => {
  await resetDatabase(db);
  ana = await signUp(app, { email: 'ana@example.com' });
  bia = await signUp(app, { email: 'bia@example.com' });
});

afterAll(async () => {
  await db.destroy();
});

describe('coping card groups', () => {
  it('creates, lists with card counts, renames and deletes', async () => {
    const groupId = await createGroup(ana, 'Ansiedade');
    await createCard(ana, groupId);

    const listed = await as(ana).get('/api/coping-card-groups').expect(200);
    expect(listed.body).toEqual([{ id: groupId, name: 'Ansiedade', cardCount: 1 }]);

    const renamed = await as(ana)
      .patch(`/api/coping-card-groups/${groupId}`, { name: 'Crises' })
      .expect(200);
    expect(renamed.body.name).toBe('Crises');

    const blocked = await as(ana).delete(`/api/coping-card-groups/${groupId}`);
    expect(blocked.status).toBe(409);
    expect(blocked.body.error.code).toBe('GROUP_NOT_EMPTY');
  });

  it('refuses a duplicated name ignoring case', async () => {
    await createGroup(ana, 'Ansiedade');

    const response = await as(ana).post('/api/coping-card-groups', { name: 'ANSIEDADE' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('GROUP_NAME_TAKEN');
  });

  it('keeps each user groups private', async () => {
    const groupId = await createGroup(ana, 'Ansiedade');

    expect((await as(bia).get('/api/coping-card-groups')).body).toEqual([]);
    expect((await as(bia).delete(`/api/coping-card-groups/${groupId}`)).status).toBe(404);
  });
});

describe('coping cards', () => {
  it('runs the full CRUD', async () => {
    const groupId = await createGroup(ana, 'Ansiedade');
    const cardId = await createCard(ana, groupId);

    const shown = await as(ana).get(`/api/coping-cards/${cardId}`).expect(200);
    expect(shown.body).toMatchObject({ id: cardId, groupId, name: 'Respire' });

    const updated = await as(ana)
      .put(`/api/coping-cards/${cardId}`, { groupId, name: 'Pare', description: 'Observe.' })
      .expect(200);
    expect(updated.body).toMatchObject({ name: 'Pare', description: 'Observe.' });

    await as(ana).delete(`/api/coping-cards/${cardId}`).expect(204);
    await as(ana).get(`/api/coping-cards/${cardId}`).expect(404);
  });

  it('filters the list by group', async () => {
    const anxiety = await createGroup(ana, 'Ansiedade');
    const work = await createGroup(ana, 'Trabalho');
    await createCard(ana, anxiety, 'A');
    await createCard(ana, work, 'B');

    const all = await as(ana).get('/api/coping-cards').expect(200);
    const filtered = await as(ana).get(`/api/coping-cards?groupId=${work}`).expect(200);

    expect(all.body).toHaveLength(2);
    expect(filtered.body.map((card: { name: string }) => card.name)).toEqual(['B']);
  });

  it("returns 404 for another user's card", async () => {
    const cardId = await createCard(ana, await createGroup(ana, 'Ansiedade'));

    await as(bia).get(`/api/coping-cards/${cardId}`).expect(404);
    await as(bia)
      .put(`/api/coping-cards/${cardId}`, {
        groupId: await createGroup(bia, 'Sono'),
        name: 'x',
        description: 'y',
      })
      .expect(404);
    await as(bia).delete(`/api/coping-cards/${cardId}`).expect(404);
  });

  it("refuses to file a card under another user's group", async () => {
    const anaGroup = await createGroup(ana, 'Ansiedade');

    const response = await as(bia).post('/api/coping-cards', {
      groupId: anaGroup,
      name: 'Intruso',
      description: 'Não deveria entrar.',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_CARD_GROUP');
  });

  it('enforces the same-user group in the database too', async () => {
    const anaGroup = await createGroup(ana, 'Ansiedade');
    const biaId = (await db('users').where({ email: 'bia@example.com' }).first<{ id: number }>())
      .id;

    await expect(
      db('coping_cards').insert({
        user_id: biaId,
        group_id: anaGroup,
        name: 'x',
        description: 'y',
      }),
    ).rejects.toThrow(/coping_cards_group_same_user_fk/);
  });

  it('validates the body', async () => {
    const response = await as(ana).post('/api/coping-cards', { name: 'Sem grupo' });

    expect(response.status).toBe(400);
    expect(response.body.error.details.map((d: { field: string }) => d.field)).toEqual(
      expect.arrayContaining(['groupId', 'description']),
    );
  });
});

describe('account deletion cascade', () => {
  it('removes groups and cards with the user', async () => {
    await createCard(ana, await createGroup(ana, 'Ansiedade'));

    await db('users').where({ email: 'ana@example.com' }).delete();

    expect(await db('coping_cards').count<{ count: string }[]>('* as count')).toEqual([
      { count: '0' },
    ]);
    expect(await db('coping_card_groups').count<{ count: string }[]>('* as count')).toEqual([
      { count: '0' },
    ]);
  });
});
