import { addDays, differenceInCalendarDays, endOfMonth } from 'date-fns';
import { fromIsoDate, isIsoDate, toIsoDate } from '@/shared/dates';
import { AppError } from '@/shared/errors';
import type { Emotion } from '@/features/thought-records/api';
import type { Bucket, Granularity, ReportPeriod } from './report-period';

/** Uma intensidade registrada em um dia (uma emoção de um registro de pensamento). */
export interface EmotionEntry {
  date: string;
  emotionId: number;
  intensity: number;
}

export interface EmotionTrendSeries {
  emotion: Emotion;
  /** Média da intensidade em cada intervalo; `null` quando não houve registro. */
  values: (number | null)[];
}

export interface EmotionTrend {
  period: ReportPeriod;
  granularity: Granularity;
  buckets: Bucket[];
  series: EmotionTrendSeries[];
}

/** Cinco anos: o suficiente para o acompanhamento e com custo de cálculo previsível. */
export const MAX_REPORT_DAYS = 5 * 366;

const DAILY_UP_TO_DAYS = 14;
const WEEKLY_UP_TO_DAYS = 92;
const DAYS_PER_WEEK = 7;

export function parseReportPeriod(from: string, to: string): ReportPeriod {
  if (!isIsoDate(from) || !isIsoDate(to)) {
    throw new AppError('Informe uma data válida.');
  }
  if (from > to) {
    throw new AppError('O início do período não pode ser depois do fim.');
  }
  if (lengthInDays({ from, to }) > MAX_REPORT_DAYS) {
    throw new AppError('Escolha um período de até 5 anos.');
  }
  return { from, to };
}

/** Semana → por dia; mês → por semana; ano → por mês (vale também para intervalos livres). */
export function granularityFor(period: ReportPeriod): Granularity {
  const days = lengthInDays(period);
  if (days <= DAILY_UP_TO_DAYS) {
    return 'day';
  }
  return days <= WEEKLY_UP_TO_DAYS ? 'week' : 'month';
}

/**
 * Divide o período em intervalos consecutivos. Semanas são blocos de 7 dias a partir do
 * início do período; meses seguem o calendário. O último intervalo é cortado no fim do período.
 */
export function bucketsFor(period: ReportPeriod, granularity: Granularity): Bucket[] {
  const buckets: Bucket[] = [];
  let start = period.from;
  while (start <= period.to) {
    const naturalEnd = naturalEndOf(start, granularity);
    const end = naturalEnd < period.to ? naturalEnd : period.to;
    buckets.push({ start, end });
    start = shiftDays(end, 1);
  }
  return buckets;
}

export function buildEmotionTrend(
  period: ReportPeriod,
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

function lengthInDays(period: ReportPeriod): number {
  return differenceInCalendarDays(fromIsoDate(period.to), fromIsoDate(period.from)) + 1;
}

function shiftDays(date: string, days: number): string {
  return toIsoDate(addDays(fromIsoDate(date), days));
}

function naturalEndOf(start: string, granularity: Granularity): string {
  switch (granularity) {
    case 'day':
      return start;
    case 'week':
      return shiftDays(start, DAYS_PER_WEEK - 1);
    case 'month':
      return toIsoDate(endOfMonth(fromIsoDate(start)));
  }
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(mean * 10) / 10;
}
