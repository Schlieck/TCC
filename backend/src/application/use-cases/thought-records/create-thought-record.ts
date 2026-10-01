import type { RawThoughtRecordContent } from '../../../domain/thought-record/thought-record.js';
import type { UserId } from '../../../domain/user/user.js';
import type { Clock } from '../../ports/clock.js';
import type { EmotionRepository } from '../../ports/emotion-repository.js';
import type { ThoughtRecordRepository } from '../../ports/thought-record-repository.js';
import { parseRecordContent } from './parse-record-content.js';
import { toThoughtRecordOutput, type ThoughtRecordOutput } from './thought-record-output.js';

export interface CreateThoughtRecordInput extends RawThoughtRecordContent {
  userId: UserId;
}

export class CreateThoughtRecord {
  constructor(
    private readonly records: ThoughtRecordRepository,
    private readonly emotions: EmotionRepository,
    private readonly clock: Clock,
  ) {}

  async execute({ userId, ...raw }: CreateThoughtRecordInput): Promise<ThoughtRecordOutput> {
    const content = await parseRecordContent(raw, this.emotions, this.clock);
    return toThoughtRecordOutput(await this.records.create(userId, content));
  }
}
