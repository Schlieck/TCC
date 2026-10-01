import { ValidationError } from './errors.js';

/** Data de calendário sem fuso horário, no formato ISO `YYYY-MM-DD`. */
export type CalendarDate = string & { readonly __brand: 'CalendarDate' };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseCalendarDate(raw: string, field = 'date'): CalendarDate {
  const match = ISO_DATE.exec(raw);
  if (!match || !isExistingDay(Number(match[1]), Number(match[2]), Number(match[3]))) {
    throw new ValidationError('INVALID_DATE', `Invalid calendar date: ${raw}`, field);
  }
  return raw as CalendarDate;
}

export function calendarDateOf(date: Date): CalendarDate {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` as CalendarDate;
}

function isExistingDay(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

const DAY_IN_MS = 86_400_000;

export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromUtcMidnight(toUtcMidnight(date) + days * DAY_IN_MS);
}

/** Quantos dias faltam de `from` até `to` (0 se forem o mesmo dia). */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return Math.round((toUtcMidnight(to) - toUtcMidnight(from)) / DAY_IN_MS);
}

export function lastDayOfMonth(date: CalendarDate): CalendarDate {
  const day = new Date(toUtcMidnight(date));
  return fromUtcMidnight(Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 0));
}

export function earliest(a: CalendarDate, b: CalendarDate): CalendarDate {
  return a <= b ? a : b;
}

function toUtcMidnight(date: CalendarDate): number {
  const [year = '', month = '', day = ''] = date.split('-');
  return Date.UTC(Number(year), Number(month) - 1, Number(day));
}

function fromUtcMidnight(milliseconds: number): CalendarDate {
  return new Date(milliseconds).toISOString().slice(0, 10) as CalendarDate;
}
