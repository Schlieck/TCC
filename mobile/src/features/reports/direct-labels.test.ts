import { describe, expect, it } from 'vitest';
import { placeDirectLabels } from './direct-labels';

describe('placeDirectLabels', () => {
  it('keeps every label just above its point when they are far apart', () => {
    const shifts = placeDirectLabels([
      { id: 1, x: 100, y: 50, text: 'Ansiedade' },
      { id: 2, x: 100, y: 150, text: 'Alegria' },
      { id: 3, x: 300, y: 52, text: 'Medo' },
    ]);

    expect([...shifts.values()]).toEqual([-8, -8, -8]);
  });

  it('moves labels of lines that end on the same point apart', () => {
    const labels = [
      { id: 1, x: 100, y: 100, text: 'Ansiedade' },
      { id: 2, x: 100, y: 100, text: 'Alegria' },
      { id: 3, x: 110, y: 104, text: 'Raiva' },
    ];
    const shifts = placeDirectLabels(labels);

    const baselines = labels.map((label) => label.y + (shifts.get(label.id) ?? 0));
    const sorted = [...baselines].sort((a, b) => a - b);
    sorted.slice(1).forEach((baseline, index) => {
      expect(baseline - (sorted[index] ?? 0)).toBeGreaterThanOrEqual(14);
    });
  });
});
