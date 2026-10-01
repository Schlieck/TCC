import { parseCalendarDate } from '../../../domain/shared/calendar-date.js';
import { createDateRange, type DateRange } from '../../../domain/shared/date-range.js';
import { ValidationError } from '../../../domain/shared/errors.js';
import type { UserId } from '../../../domain/user/user.js';
import type { ThoughtRecordRepository } from '../../ports/thought-record-repository.js';
import { toThoughtRecordOutput, type ThoughtRecordOutput } from './thought-record-output.js';

export interface ListThoughtRecordsInput {
  userId: UserId;
  from?: string;
  to?: string;
}

export class ListThoughtRecords {
  constructor(private readonly records: ThoughtRecordRepository) {}

  async execute({ userId, from, to }: ListThoughtRecordsInput): Promise<ThoughtRecordOutput[]> {
    const records = await this.records.listByUser(userId, toPeriod(from, to));
    return records.map(toThoughtRecordOutput);
  }
}

function toPeriod(from?: string, to?: string): DateRange | undefined {
  if (from === undefined && to === undefined) {
    return undefined;
  }
  if (from === undefined || to === undefined) {
    throw new ValidationError('INVALID_PERIOD', 'Both period ends are required', 'from');
  }
  return createDateRange(parseCalendarDate(from, 'from'), parseCalendarDate(to, 'to'));
}
