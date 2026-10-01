import {
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatDate, fromIsoDate, toIsoDate } from '@/shared/dates';

export type PeriodKind = 'week' | 'month' | 'year' | 'custom';
export type Granularity = 'day' | 'week' | 'month';

export interface ReportPeriod {
  from: string;
  to: string;
}

export interface Bucket {
  start: string;
  end: string;
}

export const PERIOD_KIND_LABELS: Record<PeriodKind, string> = {
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
  custom: 'Personalizado',
};

const WEEK_STARTS_ON_MONDAY = { weekStartsOn: 1 } as const;

/** Semana (segunda a domingo), mês ou ano de calendário que contém `anchor`. */
export function periodAround(kind: Exclude<PeriodKind, 'custom'>, anchor: Date): ReportPeriod {
  switch (kind) {
    case 'week':
      return toPeriod(
        startOfWeek(anchor, WEEK_STARTS_ON_MONDAY),
        endOfWeek(anchor, WEEK_STARTS_ON_MONDAY),
      );
    case 'month':
      return toPeriod(startOfMonth(anchor), endOfMonth(anchor));
    case 'year':
      return toPeriod(startOfYear(anchor), endOfYear(anchor));
  }
}

export function shiftAnchor(
  kind: Exclude<PeriodKind, 'custom'>,
  anchor: Date,
  steps: number,
): Date {
  switch (kind) {
    case 'week':
      return addWeeks(anchor, steps);
    case 'month':
      return addMonths(anchor, steps);
    case 'year':
      return addYears(anchor, steps);
  }
}

/** Ex.: "28/09 a 04/10/2026", "Setembro de 2026", "2026", "01/09/2026 a 15/09/2026". */
export function periodLabel(kind: PeriodKind, period: ReportPeriod): string {
  const from = fromIsoDate(period.from);
  switch (kind) {
    case 'week':
      return `${format(from, 'dd/MM')} a ${formatDate(period.to)}`;
    case 'month':
      return capitalize(format(from, "MMMM 'de' yyyy", { locale: ptBR }));
    case 'year':
      return format(from, 'yyyy');
    case 'custom':
      return `${formatDate(period.from)} a ${formatDate(period.to)}`;
  }
}

/** Rótulo curto do eixo X para cada intervalo do gráfico. */
export function bucketLabel(granularity: Granularity, bucket: Bucket, spansYears: boolean): string {
  const start = fromIsoDate(bucket.start);
  return granularity === 'month'
    ? format(start, spansYears ? 'MMM/yy' : 'MMM', { locale: ptBR })
    : format(start, 'dd/MM');
}

/** Descrição completa do intervalo, para o tooltip e a tabela. */
export function bucketDescription(granularity: Granularity, bucket: Bucket): string {
  if (granularity === 'day') {
    return format(fromIsoDate(bucket.start), 'EEEE, dd/MM/yyyy', { locale: ptBR });
  }
  if (granularity === 'month' && bucket.start.endsWith('-01')) {
    return capitalize(format(fromIsoDate(bucket.start), "MMMM 'de' yyyy", { locale: ptBR }));
  }
  return `${formatDate(bucket.start)} a ${formatDate(bucket.end)}`;
}

function toPeriod(from: Date, to: Date): ReportPeriod {
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
