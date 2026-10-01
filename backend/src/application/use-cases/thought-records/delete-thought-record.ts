import {
  thoughtRecordNotFound,
  type ThoughtRecordId,
} from '../../../domain/thought-record/thought-record.js';
import type { UserId } from '../../../domain/user/user.js';
import type { ThoughtRecordRepository } from '../../ports/thought-record-repository.js';

export interface DeleteThoughtRecordInput {
  userId: UserId;
  recordId: ThoughtRecordId;
}

export class DeleteThoughtRecord {
  constructor(private readonly records: ThoughtRecordRepository) {}

  async execute({ userId, recordId }: DeleteThoughtRecordInput): Promise<void> {
    if (!(await this.records.delete(userId, recordId))) {
      throw thoughtRecordNotFound();
    }
  }
}
