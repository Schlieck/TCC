import { format, isValid, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ISO_DATE = 'yyyy-MM-dd';
const TIME = 'HH:mm';

/** Datas de calendário trafegam como `yyyy-MM-dd` (sem fuso), como na API. */
export function toIsoDate(date: Date): string {
  return format(date, ISO_DATE);
}

export function fromIsoDate(value: string): Date {
  return parse(value, ISO_DATE, new Date());
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
