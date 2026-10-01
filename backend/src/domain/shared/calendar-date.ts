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
