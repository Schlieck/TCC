import { subDays } from 'date-fns';
import { fromIsoDate, toIsoDate } from '@/shared/dates';
import type { Period } from './api';

export type PeriodPreset = 'all' | 'last7' | 'last30' | 'custom';

export const PERIOD_PRESET_LABELS: Record<PeriodPreset, string> = {
  all: 'Todos',
  last7: 'Últimos 7 dias',
  last30: 'Últimos 30 dias',
  custom: 'Escolher datas',
};

/** Período a buscar no banco local; `undefined` significa "sem filtro". */
export function periodForPreset(
  preset: PeriodPreset,
  today: string,
  custom: Period,
): Period | undefined {
  switch (preset) {
    case 'all':
      return undefined;
    case 'last7':
      return { from: daysBefore(today, 6), to: today };
    case 'last30':
      return { from: daysBefore(today, 29), to: today };
    case 'custom':
      return custom.from <= custom.to ? custom : { from: custom.to, to: custom.from };
  }
}

function daysBefore(isoDate: string, days: number): string {
  return toIsoDate(subDays(fromIsoDate(isoDate), days));
}
