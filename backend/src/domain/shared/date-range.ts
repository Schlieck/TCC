import type { CalendarDate } from './calendar-date.js';
import { ValidationError } from './errors.js';

/** Intervalo fechado de datas: inclui o primeiro e o último dia. */
export interface DateRange {
  readonly from: CalendarDate;
  readonly to: CalendarDate;
}

export function createDateRange(from: CalendarDate, to: CalendarDate): DateRange {
  if (from > to) {
    throw new ValidationError('INVALID_PERIOD', 'Period start must not be after its end', 'from');
  }
  return { from, to };
}
