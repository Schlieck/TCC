import type { CalendarDate } from '../../domain/shared/calendar-date.js';

export interface Clock {
  now(): Date;
  today(): CalendarDate;
}
