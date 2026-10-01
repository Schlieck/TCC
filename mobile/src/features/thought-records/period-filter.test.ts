import { describe, expect, it } from 'vitest';
import { periodForPreset } from './period-filter';

const custom = { from: '2026-09-01', to: '2026-09-15' };

describe('periodForPreset', () => {
  it('does not filter for "all"', () => {
    expect(periodForPreset('all', '2026-10-01', custom)).toBeUndefined();
  });

  it('counts today as one of the last 7 or 30 days', () => {
    expect(periodForPreset('last7', '2026-10-01', custom)).toEqual({
      from: '2026-09-25',
      to: '2026-10-01',
    });
    expect(periodForPreset('last30', '2026-10-01', custom)).toEqual({
      from: '2026-09-02',
      to: '2026-10-01',
    });
  });

  it('uses the custom dates, swapping them if they are inverted', () => {
    expect(periodForPreset('custom', '2026-10-01', custom)).toEqual(custom);
    expect(
      periodForPreset('custom', '2026-10-01', { from: '2026-09-15', to: '2026-09-01' }),
    ).toEqual(custom);
  });
});
