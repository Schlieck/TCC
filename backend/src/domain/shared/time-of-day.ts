import { ValidationError } from './errors.js';

/** Horário do dia no formato `HH:MM` (24 horas). */
export type TimeOfDay = string & { readonly __brand: 'TimeOfDay' };

const HOURS_AND_MINUTES = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseTimeOfDay(raw: string, field = 'time'): TimeOfDay {
  if (!HOURS_AND_MINUTES.test(raw)) {
    throw new ValidationError('INVALID_TIME', `Invalid time of day: ${raw}`, field);
  }
  return raw as TimeOfDay;
}
