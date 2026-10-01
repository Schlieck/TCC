import type { EmotionHistory } from '../../../src/application/ports/emotion-history.js';
import type { SavedReportRepository } from '../../../src/application/ports/saved-report-repository.js';
import type { EmotionEntry } from '../../../src/domain/report/emotion-trend.js';
import type { SavedReport, SavedReportId } from '../../../src/domain/report/saved-report.js';
import type { DateRange } from '../../../src/domain/shared/date-range.js';
import type { UserId } from '../../../src/domain/user/user.js';
import type { InMemoryThoughtRecordRepository } from './in-memory-thought-record-repository.js';

export class InMemoryEmotionHistory implements EmotionHistory {
  constructor(private readonly records: InMemoryThoughtRecordRepository) {}

  async entriesBetween(userId: UserId, period: DateRange): Promise<EmotionEntry[]> {
    const records = await this.records.listByUser(userId, period);
    return records.flatMap((record) =>
      record.emotions.map(({ emotionId, intensity }) => ({
        date: record.date,
        emotionId,
        intensity,
      })),
    );
  }
}

export class InMemorySavedReportRepository implements SavedReportRepository {
  readonly reports = new Map<SavedReportId, SavedReport>();
  private nextId = 1;

  listByUser(userId: UserId): Promise<SavedReport[]> {
    return Promise.resolve(
      [...this.reports.values()].filter((report) => report.userId === userId).reverse(),
    );
  }

  findById(userId: UserId, id: SavedReportId): Promise<SavedReport | null> {
    const report = this.reports.get(id);
    return Promise.resolve(report?.userId === userId ? report : null);
  }

  create(userId: UserId, name: string, period: DateRange): Promise<SavedReport> {
    const report: SavedReport = { id: this.nextId++, userId, name, period, createdAt: new Date() };
    this.reports.set(report.id, report);
    return Promise.resolve(report);
  }

  async delete(userId: UserId, id: SavedReportId): Promise<boolean> {
    return (await this.findById(userId, id)) ? this.reports.delete(id) : false;
  }
}
