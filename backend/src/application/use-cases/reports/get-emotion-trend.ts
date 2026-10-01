import { buildEmotionTrend } from '../../../domain/report/emotion-trend.js';
import { parseReportPeriod } from '../../../domain/report/report-period.js';
import type { UserId } from '../../../domain/user/user.js';
import type { EmotionHistory } from '../../ports/emotion-history.js';
import type { EmotionRepository } from '../../ports/emotion-repository.js';
import { toEmotionTrendOutput, type EmotionTrendOutput } from './report-output.js';

export interface GetEmotionTrendInput {
  userId: UserId;
  from: string;
  to: string;
}

/** RF003: intensidade média de cada emoção ao longo do período escolhido. */
export class GetEmotionTrend {
  constructor(
    private readonly history: EmotionHistory,
    private readonly emotions: EmotionRepository,
  ) {}

  async execute({ userId, from, to }: GetEmotionTrendInput): Promise<EmotionTrendOutput> {
    const period = parseReportPeriod(from, to);
    const [emotions, entries] = await Promise.all([
      this.emotions.listAll(),
      this.history.entriesBetween(userId, period),
    ]);
    return toEmotionTrendOutput(buildEmotionTrend(period, emotions, entries));
  }
}
