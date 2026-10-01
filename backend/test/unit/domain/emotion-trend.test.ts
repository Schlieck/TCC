import { describe, expect, it } from 'vitest';
import {
  bucketsFor,
  buildEmotionTrend,
  granularityFor,
  type EmotionEntry,
} from '../../../src/domain/report/emotion-trend.js';
import { parseReportPeriod } from '../../../src/domain/report/report-period.js';
import {
  addDays,
  daysBetween,
  lastDayOfMonth,
  parseCalendarDate,
} from '../../../src/domain/shared/calendar-date.js';
import { ValidationError } from '../../../src/domain/shared/errors.js';
import type { Emotion } from '../../../src/domain/thought-record/emotion.js';

const date = (raw: string) => parseCalendarDate(raw);
const anxiety: Emotion = { id: 1, slug: 'anxiety', name: 'Ansiedade' };
const joy: Emotion = { id: 7, slug: 'joy', name: 'Alegria' };
const sadness: Emotion = { id: 2, slug: 'sadness', name: 'Tristeza' };

function entry(day: string, emotionId: number, intensity: number): EmotionEntry {
  return { date: date(day), emotionId, intensity };
}

describe('calendar arithmetic', () => {
  it('adds days across months and leap years', () => {
    expect(addDays(date('2024-02-28'), 1)).toBe('2024-02-29');
    expect(addDays(date('2026-12-31'), 1)).toBe('2027-01-01');
    expect(addDays(date('2026-03-01'), -1)).toBe('2026-02-28');
  });

  it('counts days between dates and finds the end of the month', () => {
    expect(daysBetween(date('2026-09-01'), date('2026-09-30'))).toBe(29);
    expect(lastDayOfMonth(date('2024-02-10'))).toBe('2024-02-29');
  });
});

describe('granularityFor', () => {
  it.each([
    ['2026-09-28', '2026-10-04', 'day'],
    ['2026-09-01', '2026-09-14', 'day'],
    ['2026-09-01', '2026-09-15', 'week'],
    ['2026-09-01', '2026-09-30', 'week'],
    ['2026-07-01', '2026-09-30', 'week'],
    ['2026-01-01', '2026-12-31', 'month'],
  ])('%s → %s groups by %s', (from, to, expected) => {
    expect(granularityFor(parseReportPeriod(from, to))).toBe(expected);
  });
});

describe('bucketsFor', () => {
  it('splits a week into days', () => {
    const buckets = bucketsFor(parseReportPeriod('2026-09-28', '2026-10-04'), 'day');

    expect(buckets).toHaveLength(7);
    expect(buckets[0]).toEqual({ start: '2026-09-28', end: '2026-09-28' });
  });

  it('splits a month into 7-day blocks, clipping the last one', () => {
    expect(bucketsFor(parseReportPeriod('2026-09-01', '2026-09-30'), 'week')).toEqual([
      { start: '2026-09-01', end: '2026-09-07' },
      { start: '2026-09-08', end: '2026-09-14' },
      { start: '2026-09-15', end: '2026-09-21' },
      { start: '2026-09-22', end: '2026-09-28' },
      { start: '2026-09-29', end: '2026-09-30' },
    ]);
  });

  it('splits a free interval into calendar months, clipping both ends', () => {
    expect(bucketsFor(parseReportPeriod('2026-03-15', '2026-05-10'), 'month')).toEqual([
      { start: '2026-03-15', end: '2026-03-31' },
      { start: '2026-04-01', end: '2026-04-30' },
      { start: '2026-05-01', end: '2026-05-10' },
    ]);
  });

  it('covers a full year with 12 months', () => {
    expect(bucketsFor(parseReportPeriod('2026-01-01', '2026-12-31'), 'month')).toHaveLength(12);
  });
});

describe('buildEmotionTrend', () => {
  const september = parseReportPeriod('2026-09-01', '2026-09-30');

  it('averages each emotion per bucket and leaves gaps as null', () => {
    const trend = buildEmotionTrend(
      september,
      [anxiety, sadness, joy],
      [
        entry('2026-09-02', anxiety.id, 80),
        entry('2026-09-05', anxiety.id, 65),
        entry('2026-09-30', anxiety.id, 30),
        entry('2026-09-16', joy.id, 33),
        entry('2026-09-17', joy.id, 34),
        entry('2026-09-18', joy.id, 34),
      ],
    );

    expect(trend.granularity).toBe('week');
    expect(trend.series).toEqual([
      { emotion: anxiety, values: [72.5, null, null, null, 30] },
      { emotion: joy, values: [null, null, 33.7, null, null] },
    ]);
  });

  it('ignores entries outside the period', () => {
    const trend = buildEmotionTrend(september, [anxiety], [entry('2026-10-01', anxiety.id, 90)]);

    expect(trend.series).toEqual([]);
    expect(trend.buckets).toHaveLength(5);
  });
});

describe('parseReportPeriod', () => {
  it('rejects an inverted or too long period', () => {
    expect(() => parseReportPeriod('2026-09-30', '2026-09-01')).toThrow(ValidationError);
    expect(() => parseReportPeriod('2020-01-01', '2026-12-31')).toThrow(ValidationError);
  });
});
