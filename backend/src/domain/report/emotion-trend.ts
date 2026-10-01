import {
  addDays,
  daysBetween,
  earliest,
  lastDayOfMonth,
  type CalendarDate,
} from '../shared/calendar-date.js';
import type { DateRange } from '../shared/date-range.js';
import type { Emotion, EmotionId } from '../thought-record/emotion.js';

export type Granularity = 'day' | 'week' | 'month';

export interface TrendBucket {
  readonly start: CalendarDate;
  readonly end: CalendarDate;
}

/** Uma intensidade registrada em um dia (uma emoção de um registro de pensamento). */
export interface EmotionEntry {
  readonly date: CalendarDate;
  readonly emotionId: EmotionId;
  readonly intensity: number;
}

export interface EmotionSeries {
  readonly emotion: Emotion;
  /** Média da intensidade em cada intervalo; `null` quando não houve registro. */
  readonly values: readonly (number | null)[];
}

export interface EmotionTrend {
  readonly period: DateRange;
  readonly granularity: Granularity;
  readonly buckets: readonly TrendBucket[];
  readonly series: readonly EmotionSeries[];
}

const DAILY_UP_TO_DAYS = 14;
const WEEKLY_UP_TO_DAYS = 92;
const DAYS_PER_WEEK = 7;

/** Semana → por dia; mês → por semana; ano → por mês (vale também para intervalos livres). */
export function granularityFor(period: DateRange): Granularity {
  const days = daysBetween(period.from, period.to) + 1;
  if (days <= DAILY_UP_TO_DAYS) {
    return 'day';
  }
  return days <= WEEKLY_UP_TO_DAYS ? 'week' : 'month';
}

/**
 * Divide o período em intervalos consecutivos. Semanas são blocos de 7 dias a partir do
 * início do período; meses seguem o calendário. O último intervalo é cortado no fim do período.
 */
export function bucketsFor(period: DateRange, granularity: Granularity): TrendBucket[] {
  const buckets: TrendBucket[] = [];
  let start = period.from;
  while (start <= period.to) {
    const end = earliest(naturalEnd(start, granularity), period.to);
    buckets.push({ start, end });
    start = addDays(end, 1);
  }
  return buckets;
}

export function buildEmotionTrend(
  period: DateRange,
  emotions: readonly Emotion[],
  entries: readonly EmotionEntry[],
): EmotionTrend {
  const granularity = granularityFor(period);
  const buckets = bucketsFor(period, granularity);

  const series = emotions
    .map((emotion) => ({
      emotion,
      values: buckets.map((bucket) =>
        average(
          entries
            .filter(
              (entry) =>
                entry.emotionId === emotion.id &&
                entry.date >= bucket.start &&
                entry.date <= bucket.end,
            )
            .map((entry) => entry.intensity),
        ),
      ),
    }))
    .filter((emotionSeries) => emotionSeries.values.some((value) => value !== null));

  return { period, granularity, buckets, series };
}

function naturalEnd(start: CalendarDate, granularity: Granularity): CalendarDate {
  switch (granularity) {
    case 'day':
      return start;
    case 'week':
      return addDays(start, DAYS_PER_WEEK - 1);
    case 'month':
      return lastDayOfMonth(start);
  }
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(mean * 10) / 10;
}
