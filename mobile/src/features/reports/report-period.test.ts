import { describe, expect, it } from 'vitest';
import { fromIsoDate } from '@/shared/dates';
import {
  bucketDescription,
  bucketLabel,
  periodAround,
  periodLabel,
  shiftAnchor,
} from './report-period';

const wednesday = fromIsoDate('2026-09-30');

describe('periodAround', () => {
  it('covers Monday to Sunday for a week', () => {
    expect(periodAround('week', wednesday)).toEqual({ from: '2026-09-28', to: '2026-10-04' });
  });

  it('covers the calendar month and year', () => {
    expect(periodAround('month', wednesday)).toEqual({ from: '2026-09-01', to: '2026-09-30' });
    expect(periodAround('year', wednesday)).toEqual({ from: '2026-01-01', to: '2026-12-31' });
  });
});

describe('shiftAnchor', () => {
  it('moves the anchor by whole weeks, months or years', () => {
    expect(periodAround('week', shiftAnchor('week', wednesday, -1))).toEqual({
      from: '2026-09-21',
      to: '2026-09-27',
    });
    expect(periodAround('month', shiftAnchor('month', wednesday, 1)).from).toBe('2026-10-01');
    expect(periodAround('year', shiftAnchor('year', wednesday, -1)).from).toBe('2025-01-01');
  });
});

describe('labels', () => {
  it('names each kind of period in Portuguese', () => {
    expect(periodLabel('week', { from: '2026-09-28', to: '2026-10-04' })).toBe(
      '28/09 a 04/10/2026',
    );
    expect(periodLabel('month', { from: '2026-09-01', to: '2026-09-30' })).toBe('Setembro de 2026');
    expect(periodLabel('year', { from: '2026-01-01', to: '2026-12-31' })).toBe('2026');
    expect(periodLabel('custom', { from: '2026-09-01', to: '2026-09-15' })).toBe(
      '01/09/2026 a 15/09/2026',
    );
  });

  it('labels the x axis by granularity', () => {
    const bucket = { start: '2026-03-01', end: '2026-03-31' };

    expect(bucketLabel('day', bucket, false)).toBe('01/03');
    expect(bucketLabel('month', bucket, false)).toBe('mar');
    expect(bucketLabel('month', bucket, true)).toBe('mar/26');
  });

  it('describes a bucket fully for the tooltip', () => {
    expect(bucketDescription('week', { start: '2026-09-01', end: '2026-09-07' })).toBe(
      '01/09/2026 a 07/09/2026',
    );
    expect(bucketDescription('month', { start: '2026-03-01', end: '2026-03-31' })).toBe(
      'Março de 2026',
    );
  });
});
