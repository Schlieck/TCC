import type { Clock } from '../../application/ports/clock.js';
import { calendarDateOf, type CalendarDate } from '../../domain/shared/calendar-date.js';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }

  today(): CalendarDate {
    return calendarDateOf(new Date());
  }
}
