import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatLongDate,
  fromIsoDate,
  fromTime,
  isIsoDate,
  toIsoDate,
  toTime,
} from './dates';

describe('calendar dates', () => {
  it('round-trips an ISO date without shifting the day', () => {
    expect(toIsoDate(fromIsoDate('2026-03-01'))).toBe('2026-03-01');
  });

  it('accepts only existing days in ISO format', () => {
    expect(isIsoDate('2024-02-29')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-2-3')).toBe(false);
    expect(isIsoDate('28/09/2026')).toBe(false);
  });

  it('formats dates for display in Portuguese', () => {
    expect(formatDate('2026-09-28')).toBe('28/09/2026');
    expect(formatLongDate('2026-09-28')).toBe('segunda, 28 de set de 2026');
  });
});

describe('times', () => {
  it('round-trips HH:mm', () => {
    expect(toTime(fromTime('07:05'))).toBe('07:05');
  });
});
