import { beforeEach, describe, expect, it } from 'vitest';
import { CreateThoughtRecord } from '../../../../src/application/use-cases/thought-records/create-thought-record.js';
import { DeleteThoughtRecord } from '../../../../src/application/use-cases/thought-records/delete-thought-record.js';
import { GetThoughtRecord } from '../../../../src/application/use-cases/thought-records/get-thought-record.js';
import { ListEmotions } from '../../../../src/application/use-cases/thought-records/list-emotions.js';
import { ListThoughtRecords } from '../../../../src/application/use-cases/thought-records/list-thought-records.js';
import { UpdateThoughtRecord } from '../../../../src/application/use-cases/thought-records/update-thought-record.js';
import { NotFoundError, ValidationError } from '../../../../src/domain/shared/errors.js';
import { FixedClock } from '../../../support/fakes.js';
import { InMemoryEmotionRepository } from '../../../support/in-memory/in-memory-emotion-repository.js';
import { InMemoryThoughtRecordRepository } from '../../../support/in-memory/in-memory-thought-record-repository.js';

const ANA = 1;
const BIA = 2;
const ANXIETY = 1;
const JOY = 7;

function recordInput(overrides: Partial<Parameters<CreateThoughtRecord['execute']>[0]> = {}) {
  return {
    userId: ANA,
    title: 'Reunião no trabalho',
    date: '2026-09-28',
    time: '14:30',
    description: 'Achei que todos iam perceber que eu não sabia a resposta.',
    emotions: [
      { emotionId: ANXIETY, intensity: 80 },
      { emotionId: JOY, intensity: 10 },
    ],
    ...overrides,
  };
}

describe('thought records', () => {
  let records: InMemoryThoughtRecordRepository;
  let createRecord: CreateThoughtRecord;

  beforeEach(() => {
    records = new InMemoryThoughtRecordRepository();
    createRecord = new CreateThoughtRecord(
      records,
      new InMemoryEmotionRepository(),
      new FixedClock(new Date('2026-10-01T12:00:00Z')),
    );
  });

  it('lists the predefined emotions', async () => {
    const emotions = await new ListEmotions(new InMemoryEmotionRepository()).execute();

    expect(emotions.map((emotion) => emotion.name)).toEqual([
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

  it('creates a record with several emotions and their intensities', async () => {
    const record = await createRecord.execute(recordInput({ title: '  Reunião  ' }));

    expect(record).toMatchObject({
      id: 1,
      title: 'Reunião',
      date: '2026-09-28',
      time: '14:30',
      emotions: [
        { emotionId: ANXIETY, intensity: 80 },
        { emotionId: JOY, intensity: 10 },
      ],
    });
  });

  it.each([
    ['EMOTIONS_REQUIRED', { emotions: [] }],
    [
      'DUPLICATED_EMOTION',
      {
        emotions: [
          { emotionId: ANXIETY, intensity: 10 },
          { emotionId: ANXIETY, intensity: 20 },
        ],
      },
    ],
    ['INVALID_INTENSITY', { emotions: [{ emotionId: ANXIETY, intensity: 101 }] }],
    ['INVALID_INTENSITY', { emotions: [{ emotionId: ANXIETY, intensity: 12.5 }] }],
    ['UNKNOWN_EMOTION', { emotions: [{ emotionId: 99, intensity: 50 }] }],
    ['FUTURE_RECORD_DATE', { date: '2026-10-03' }],
    ['INVALID_TIME', { time: '24:00' }],
    ['INVALID_RECORD_TITLE', { title: ' ' }],
    ['INVALID_RECORD_DESCRIPTION', { description: '' }],
  ])('rejects invalid content with %s', async (code, overrides) => {
    const attempt = createRecord.execute(recordInput(overrides));

    await expect(attempt).rejects.toThrow(ValidationError);
    await expect(attempt).rejects.toMatchObject({ code });
  });

  it('accepts a record dated today, or tomorrow for a patient in a time zone ahead', async () => {
    await expect(createRecord.execute(recordInput({ date: '2026-10-01' }))).resolves.toBeDefined();
    await expect(createRecord.execute(recordInput({ date: '2026-10-02' }))).resolves.toBeDefined();
  });

  it('lists the newest records first, filtered by period', async () => {
    await createRecord.execute(recordInput({ title: 'A', date: '2026-08-15' }));
    await createRecord.execute(recordInput({ title: 'B', date: '2026-09-10' }));
    await createRecord.execute(recordInput({ title: 'C', date: '2026-09-10', time: '20:00' }));
    await createRecord.execute(recordInput({ title: 'D', userId: BIA }));
    const list = new ListThoughtRecords(records);

    const all = await list.execute({ userId: ANA });
    const september = await list.execute({ userId: ANA, from: '2026-09-01', to: '2026-09-30' });

    expect(all.map((record) => record.title)).toEqual(['C', 'B', 'A']);
    expect(september.map((record) => record.title)).toEqual(['C', 'B']);
  });

  it.each([[{ from: '2026-09-30', to: '2026-09-01' }], [{ from: '2026-09-01' }]])(
    'rejects an invalid period %o',
    async (period) => {
      await expect(
        new ListThoughtRecords(records).execute({ userId: ANA, ...period }),
      ).rejects.toMatchObject({ code: 'INVALID_PERIOD' });
    },
  );

  it('replaces the emotions when updating', async () => {
    const created = await createRecord.execute(recordInput());
    const update = new UpdateThoughtRecord(
      records,
      new InMemoryEmotionRepository(),
      new FixedClock(new Date('2026-10-01T12:00:00Z')),
    );

    const updated = await update.execute({
      ...recordInput({ emotions: [{ emotionId: JOY, intensity: 60 }] }),
      recordId: created.id,
    });

    expect(updated.emotions).toEqual([{ emotionId: JOY, intensity: 60 }]);
  });

  it("hides another user's record", async () => {
    const created = await createRecord.execute(recordInput());

    await expect(
      new GetThoughtRecord(records).execute({ userId: BIA, recordId: created.id }),
    ).rejects.toThrow(NotFoundError);
    await expect(
      new DeleteThoughtRecord(records).execute({ userId: BIA, recordId: created.id }),
    ).rejects.toThrow(NotFoundError);
    expect(records.records.size).toBe(1);
  });

  it('deletes a record', async () => {
    const created = await createRecord.execute(recordInput());

    await new DeleteThoughtRecord(records).execute({ userId: ANA, recordId: created.id });

    expect(records.records.size).toBe(0);
  });
});
