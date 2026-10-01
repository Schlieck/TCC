import { daysBetween, parseCalendarDate } from '../shared/calendar-date.js';
import { createDateRange, type DateRange } from '../shared/date-range.js';
import { ValidationError } from '../shared/errors.js';

/** Cinco anos: o suficiente para o acompanhamento e com custo de cálculo previsível. */
export const MAX_REPORT_DAYS = 5 * 366;

export function parseReportPeriod(from: string, to: string): DateRange {
  const period = createDateRange(parseCalendarDate(from, 'from'), parseCalendarDate(to, 'to'));
  if (daysBetween(period.from, period.to) + 1 > MAX_REPORT_DAYS) {
    throw new ValidationError('PERIOD_TOO_LONG', 'Report period is too long', 'to');
  }
  return period;
}
