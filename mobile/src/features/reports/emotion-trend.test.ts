import { describe, expect, it } from 'vitest';
import type { Emotion } from '@/features/thought-records/api';
import { AppError } from '@/shared/errors';
import {
  bucketsFor,
  buildEmotionTrend,
  granularityFor,
  parseReportPeriod,
  type EmotionEntry,
} from './emotion-trend';

const anxiety: Emotion = { id: 1, slug: 'anxiety', name: 'Ansiedade' };
const joy: Emotion = { id: 7, slug: 'joy', name: 'Alegria' };
const sadness: Emotion = { id: 2, slug: 'sadness', name: 'Tristeza' };

function entry(date: string, emotionId: number, intensity: number): EmotionEntry {
  return { date, emotionId, intensity };
}

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

  it('covers a full year with 12 months, across leap days', () => {
    expect(bucketsFor(parseReportPeriod('2026-01-01', '2026-12-31'), 'month')).toHaveLength(12);
    expect(bucketsFor(parseReportPeriod('2024-02-01', '2024-04-30'), 'month')[0]).toEqual({
      start: '2024-02-01',
      end: '2024-02-29',
    });
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
  it('rejects an inverted, too long or invalid period', () => {
    expect(() => parseReportPeriod('2026-09-30', '2026-09-01')).toThrow(AppError);
    expect(() => parseReportPeriod('2020-01-01', '2026-12-31')).toThrow(AppError);
    expect(() => parseReportPeriod('2026-02-30', '2026-03-01')).toThrow(AppError);
  });

  it('accepts a five-year period', () => {
    expect(parseReportPeriod('2022-01-01', '2026-12-31')).toEqual({
      from: '2022-01-01',
      to: '2026-12-31',
    });
  });
});
