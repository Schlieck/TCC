import {
  thoughtRecordNotFound,
  type RawThoughtRecordContent,
  type ThoughtRecordId,
} from '../../../domain/thought-record/thought-record.js';
import type { UserId } from '../../../domain/user/user.js';
import type { Clock } from '../../ports/clock.js';
import type { EmotionRepository } from '../../ports/emotion-repository.js';
import type { ThoughtRecordRepository } from '../../ports/thought-record-repository.js';
import { parseRecordContent } from './parse-record-content.js';
import { toThoughtRecordOutput, type ThoughtRecordOutput } from './thought-record-output.js';

export interface UpdateThoughtRecordInput extends RawThoughtRecordContent {
  userId: UserId;
  recordId: ThoughtRecordId;
}

export class UpdateThoughtRecord {
  constructor(
    private readonly records: ThoughtRecordRepository,
    private readonly emotions: EmotionRepository,
    private readonly clock: Clock,
  ) {}

  async execute({
    userId,
    recordId,
    ...raw
  }: UpdateThoughtRecordInput): Promise<ThoughtRecordOutput> {
    const content = await parseRecordContent(raw, this.emotions, this.clock);
    const updated = await this.records.update(userId, recordId, content);
    if (!updated) {
      throw thoughtRecordNotFound();
    }
    return toThoughtRecordOutput(updated);
  }
}
