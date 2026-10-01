import type { Knex } from 'knex';
import type { SavedReportRepository } from '../../../../application/ports/saved-report-repository.js';
import type { SavedReport, SavedReportId } from '../../../../domain/report/saved-report.js';
import { parseCalendarDate } from '../../../../domain/shared/calendar-date.js';
import type { DateRange } from '../../../../domain/shared/date-range.js';
import type { UserId } from '../../../../domain/user/user.js';

interface SavedReportRow {
  id: number;
  user_id: number;
  name: string;
  start_date: string;
  end_date: string;
  created_at: Date;
  updated_at: Date;
}

export class PostgresSavedReportRepository implements SavedReportRepository {
  constructor(private readonly db: Knex) {}

  async listByUser(userId: UserId): Promise<SavedReport[]> {
    const rows = await this.reports()
      .where({ user_id: userId })
      .orderBy([
        { column: 'created_at', order: 'desc' },
        { column: 'id', order: 'desc' },
      ]);
    return rows.map(toSavedReport);
  }

  async findById(userId: UserId, id: SavedReportId): Promise<SavedReport | null> {
    const row = await this.reports().where({ id, user_id: userId }).first();
    return row ? toSavedReport(row) : null;
  }

  async create(userId: UserId, name: string, period: DateRange): Promise<SavedReport> {
    const [row] = await this.reports()
      .insert({ user_id: userId, name, start_date: period.from, end_date: period.to })
      .returning('*');
    if (!row) {
      throw new Error('Insert into saved_reports returned no row');
    }
    return toSavedReport(row);
  }

  async delete(userId: UserId, id: SavedReportId): Promise<boolean> {
    const deleted = await this.reports().where({ id, user_id: userId }).delete();
    return deleted > 0;
  }

  private reports() {
    return this.db<SavedReportRow>('saved_reports');
  }
}

function toSavedReport(row: SavedReportRow): SavedReport {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    period: { from: parseCalendarDate(row.start_date), to: parseCalendarDate(row.end_date) },
    createdAt: row.created_at,
  };
}
