import { format, isValid, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ISO_DATE = 'yyyy-MM-dd';
const TIME = 'HH:mm';

/** Datas de calendário são guardadas como `yyyy-MM-dd` (sem fuso). */
export function toIsoDate(date: Date): string {
  return format(date, ISO_DATE);
}

export function fromIsoDate(value: string): Date {
  return parse(value, ISO_DATE, new Date());
}

/** `yyyy-MM-dd` de um dia que existe no calendário (recusa, por exemplo, 30 de fevereiro). */
export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(fromIsoDate(value));
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function toTime(date: Date): string {
  return format(date, TIME);
}

export function fromTime(value: string): Date {
  const parsed = parse(value, TIME, new Date());
  return isValid(parsed) ? parsed : new Date();
}

export function formatDate(value: string): string {
  return format(fromIsoDate(value), 'dd/MM/yyyy');
}

/** Ex.: "segunda, 28 de set de 2026". */
export function formatLongDate(value: string): string {
  return format(fromIsoDate(value), "EEE, d 'de' MMM 'de' yyyy", { locale: ptBR });
}
