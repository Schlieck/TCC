import type { ThoughtRecordRepository } from '../../../src/application/ports/thought-record-repository.js';
import type { DateRange } from '../../../src/domain/shared/date-range.js';
import type {
  ThoughtRecord,
  ThoughtRecordContent,
  ThoughtRecordId,
} from '../../../src/domain/thought-record/thought-record.js';
import type { UserId } from '../../../src/domain/user/user.js';

export class InMemoryThoughtRecordRepository implements ThoughtRecordRepository {
  readonly records = new Map<ThoughtRecordId, ThoughtRecord>();
  private nextId = 1;

  listByUser(userId: UserId, period?: DateRange): Promise<ThoughtRecord[]> {
    return Promise.resolve(
      [...this.records.values()]
        .filter((record) => record.userId === userId)
        .filter((record) => !period || (record.date >= period.from && record.date <= period.to))
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
    );
  }

  findById(userId: UserId, id: ThoughtRecordId): Promise<ThoughtRecord | null> {
    const record = this.records.get(id);
    return Promise.resolve(record?.userId === userId ? record : null);
  }

  create(userId: UserId, content: ThoughtRecordContent): Promise<ThoughtRecord> {
    const record: ThoughtRecord = { id: this.nextId++, userId, ...content, updatedAt: new Date() };
    this.records.set(record.id, record);
    return Promise.resolve(record);
  }

  async update(
    userId: UserId,
    id: ThoughtRecordId,
    content: ThoughtRecordContent,
  ): Promise<ThoughtRecord | null> {
    const existing = await this.findById(userId, id);
    if (!existing) {
      return null;
    }
    const updated: ThoughtRecord = { ...existing, ...content, updatedAt: new Date() };
    this.records.set(id, updated);
    return updated;
  }

  async delete(userId: UserId, id: ThoughtRecordId): Promise<boolean> {
    return (await this.findById(userId, id)) ? this.records.delete(id) : false;
  }
}
