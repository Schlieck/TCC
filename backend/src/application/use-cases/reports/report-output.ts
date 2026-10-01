import type { EmotionTrend, Granularity } from '../../../domain/report/emotion-trend.js';
import type { SavedReport } from '../../../domain/report/saved-report.js';

export interface PeriodOutput {
  from: string;
  to: string;
}

export interface EmotionTrendOutput {
  period: PeriodOutput;
  granularity: Granularity;
  buckets: { start: string; end: string }[];
  series: {
    emotion: { id: number; slug: string; name: string };
    values: (number | null)[];
  }[];
}

export interface SavedReportOutput {
  id: number;
  name: string;
  period: PeriodOutput;
  createdAt: string;
}

export function toEmotionTrendOutput(trend: EmotionTrend): EmotionTrendOutput {
  return {
    period: { from: trend.period.from, to: trend.period.to },
    granularity: trend.granularity,
    buckets: trend.buckets.map(({ start, end }) => ({ start, end })),
    series: trend.series.map(({ emotion, values }) => ({
      emotion: { id: emotion.id, slug: emotion.slug, name: emotion.name },
      values: [...values],
    })),
  };
}

export function toSavedReportOutput(report: SavedReport): SavedReportOutput {
  return {
    id: report.id,
    name: report.name,
    period: { from: report.period.from, to: report.period.to },
    createdAt: report.createdAt.toISOString(),
  };
}
