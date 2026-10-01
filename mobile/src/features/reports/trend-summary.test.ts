import { describe, expect, it } from 'vitest';
import type { EmotionTrend } from './api';
import { averageOf, describeTrend, formatPercent, sortSeries } from './trend-summary';

const trend: EmotionTrend = {
  period: { from: '2026-09-01', to: '2026-09-30' },
  granularity: 'week',
  buckets: [
    { start: '2026-09-01', end: '2026-09-07' },
    { start: '2026-09-08', end: '2026-09-14' },
  ],
  series: [
    { emotion: { id: 7, slug: 'joy', name: 'Alegria' }, values: [20, 41] },
    { emotion: { id: 1, slug: 'anxiety', name: 'Ansiedade' }, values: [80, null] },
  ],
};

describe('trend summary', () => {
  it('keeps the fixed color order regardless of the API order', () => {
    expect(sortSeries(trend.series).map((series) => series.emotion.slug)).toEqual([
      'anxiety',
      'joy',
    ]);
  });

  it('averages only the buckets that have data', () => {
    expect(averageOf([80, null, 60])).toBe(70);
    expect(averageOf([null, null])).toBeNull();
  });

  it('formats percentages and gaps', () => {
    expect(formatPercent(33.7)).toBe('34%');
    expect(formatPercent(null)).toBe('—');
  });

  it('describes the chart for screen readers', () => {
    expect(describeTrend(trend)).toBe(
      'Gráfico de linhas da intensidade das emoções. Ansiedade, média de 80%; Alegria, média de 31%.',
    );
  });
});
