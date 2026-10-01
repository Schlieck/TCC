import type { Knex } from 'knex';
import type { ThoughtRecordRepository } from '../../../../application/ports/thought-record-repository.js';
import { parseCalendarDate } from '../../../../domain/shared/calendar-date.js';
import type { DateRange } from '../../../../domain/shared/date-range.js';
import { parseTimeOfDay } from '../../../../domain/shared/time-of-day.js';
import type {
  EmotionIntensity,
  ThoughtRecord,
  ThoughtRecordContent,
  ThoughtRecordId,
} from '../../../../domain/thought-record/thought-record.js';
import type { UserId } from '../../../../domain/user/user.js';

interface RecordRow {
  id: number;
  user_id: number;
  title: string;
  occurred_on: string;
  occurred_time: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

interface RecordEmotionRow {
  thought_record_id: number;
  emotion_id: number;
  intensity: number;
}

export class PostgresThoughtRecordRepository implements ThoughtRecordRepository {
  constructor(private readonly db: Knex) {}

  async listByUser(userId: UserId, period?: DateRange): Promise<ThoughtRecord[]> {
    const query = this.db<RecordRow>('thought_records').where({ user_id: userId });
    if (period) {
      void query.whereBetween('occurred_on', [period.from, period.to]);
    }
    const rows = await query.orderBy([
      { column: 'occurred_on', order: 'desc' },
      { column: 'occurred_time', order: 'desc' },
      { column: 'id', order: 'desc' },
    ]);
    return this.withEmotions(rows);
  }

  async findById(userId: UserId, id: ThoughtRecordId): Promise<ThoughtRecord | null> {
    const row = await this.db<RecordRow>('thought_records').where({ id, user_id: userId }).first();
    if (!row) {
      return null;
    }
    const [record] = await this.withEmotions([row]);
    return record ?? null;
  }

  create(userId: UserId, content: ThoughtRecordContent): Promise<ThoughtRecord> {
    return this.db.transaction(async (trx) => {
      const [row] = await trx<RecordRow>('thought_records')
        .insert({ user_id: userId, ...toRecordColumns(content) })
        .returning('*');
      if (!row) {
        throw new Error('Insert into thought_records returned no row');
      }
      await insertEmotions(trx, row.id, content.emotions);
      return toRecord(row, content.emotions);
    });
  }

  update(
    userId: UserId,
    id: ThoughtRecordId,
    content: ThoughtRecordContent,
  ): Promise<ThoughtRecord | null> {
    return this.db.transaction(async (trx) => {
      const [row] = await trx<RecordRow>('thought_records')
        .where({ id, user_id: userId })
        .update(toRecordColumns(content))
        .returning('*');
      if (!row) {
        return null;
      }
      await trx('thought_record_emotions').where({ thought_record_id: id }).delete();
      await insertEmotions(trx, id, content.emotions);
      return toRecord(row, content.emotions);
    });
  }

  async delete(userId: UserId, id: ThoughtRecordId): Promise<boolean> {
    const deleted = await this.db('thought_records').where({ id, user_id: userId }).delete();
    return deleted > 0;
  }

  private async withEmotions(rows: RecordRow[]): Promise<ThoughtRecord[]> {
    if (rows.length === 0) {
      return [];
    }
    const emotionRows = await this.db<RecordEmotionRow>('thought_record_emotions')
      .whereIn(
        'thought_record_id',
        rows.map((row) => row.id),
      )
      .orderBy([
        { column: 'intensity', order: 'desc' },
        { column: 'emotion_id', order: 'asc' },
      ]);

    const byRecord = new Map<number, EmotionIntensity[]>();
    for (const { thought_record_id, emotion_id, intensity } of emotionRows) {
      const list = byRecord.get(thought_record_id) ?? [];
      list.push({ emotionId: emotion_id, intensity });
      byRecord.set(thought_record_id, list);
    }
    return rows.map((row) => toRecord(row, byRecord.get(row.id) ?? []));
  }
}

function toRecordColumns(
  content: ThoughtRecordContent,
): Pick<RecordRow, 'title' | 'occurred_on' | 'occurred_time' | 'description'> {
  return {
    title: content.title,
    occurred_on: content.date,
    occurred_time: content.time,
    description: content.description,
  };
}

async function insertEmotions(
  trx: Knex.Transaction,
  recordId: number,
  emotions: readonly EmotionIntensity[],
): Promise<void> {
  await trx<RecordEmotionRow>('thought_record_emotions').insert(
    emotions.map(({ emotionId, intensity }) => ({
      thought_record_id: recordId,
      emotion_id: emotionId,
      intensity,
    })),
  );
}

function toRecord(row: RecordRow, emotions: readonly EmotionIntensity[]): ThoughtRecord {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    date: parseCalendarDate(row.occurred_on),
    // O Postgres devolve TIME como HH:MM:SS; o domínio trabalha com HH:MM.
    time: parseTimeOfDay(row.occurred_time.slice(0, 5)),
    description: row.description,
    emotions,
    updatedAt: row.updated_at,
  };
}
