import type { Knex } from 'knex';
import type { EmotionHistory } from '../../../../application/ports/emotion-history.js';
import type { EmotionEntry } from '../../../../domain/report/emotion-trend.js';
import { parseCalendarDate } from '../../../../domain/shared/calendar-date.js';
import type { DateRange } from '../../../../domain/shared/date-range.js';
import type { UserId } from '../../../../domain/user/user.js';

interface EntryRow {
  occurred_on: string;
  emotion_id: number;
  intensity: number;
}

export class PostgresEmotionHistory implements EmotionHistory {
  constructor(private readonly db: Knex) {}

  async entriesBetween(userId: UserId, period: DateRange): Promise<EmotionEntry[]> {
    const rows = await this.db('thought_record_emotions as e')
      .join('thought_records as r', 'r.id', 'e.thought_record_id')
      .where('r.user_id', userId)
      .whereBetween('r.occurred_on', [period.from, period.to])
      .select<EntryRow[]>('r.occurred_on', 'e.emotion_id', 'e.intensity');

    return rows.map((row) => ({
      date: parseCalendarDate(row.occurred_on),
      emotionId: row.emotion_id,
      intensity: row.intensity,
    }));
  }
}
