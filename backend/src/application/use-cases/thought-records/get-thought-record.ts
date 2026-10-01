import {
  thoughtRecordNotFound,
  type ThoughtRecordId,
} from '../../../domain/thought-record/thought-record.js';
import type { UserId } from '../../../domain/user/user.js';
import type { ThoughtRecordRepository } from '../../ports/thought-record-repository.js';
import { toThoughtRecordOutput, type ThoughtRecordOutput } from './thought-record-output.js';

export interface GetThoughtRecordInput {
  userId: UserId;
  recordId: ThoughtRecordId;
}

export class GetThoughtRecord {
  constructor(private readonly records: ThoughtRecordRepository) {}

  async execute({ userId, recordId }: GetThoughtRecordInput): Promise<ThoughtRecordOutput> {
    const record = await this.records.findById(userId, recordId);
    if (!record) {
      throw thoughtRecordNotFound();
    }
    return toThoughtRecordOutput(record);
  }
}
