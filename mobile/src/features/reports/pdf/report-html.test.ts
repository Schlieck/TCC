import { describe, expect, it } from 'vitest';
import type { EmotionTrend } from '../emotion-trend';
import { buildReportHtml, escapeHtml } from './report-html';

const trend: EmotionTrend = {
  period: { from: '2026-09-01', to: '2026-09-30' },
  granularity: 'week',
  buckets: [
    { start: '2026-09-01', end: '2026-09-07' },
    { start: '2026-09-08', end: '2026-09-14' },
    { start: '2026-09-15', end: '2026-09-21' },
    { start: '2026-09-22', end: '2026-09-28' },
    { start: '2026-09-29', end: '2026-09-30' },
  ],
  series: [
    { emotion: { id: 7, slug: 'joy', name: 'Alegria' }, values: [20, null, 40, 45, null] },
    { emotion: { id: 1, slug: 'anxiety', name: 'Ansiedade' }, values: [80, 70, 60, 50, 40] },
  ],
};

function html(overrides: Partial<Parameters<typeof buildReportHtml>[0]> = {}) {
  return buildReportHtml({
    trend,
    periodLabel: 'Setembro de 2026',
    patientName: 'Ana Souza',
    generatedOn: '2026-10-01',
    ...overrides,
  });
}

describe('buildReportHtml', () => {
  it('identifies the patient, the period and the generation date', () => {
    const document = html();

    expect(document).toContain('Ana Souza · Setembro de 2026');
    expect(document).toContain('Gerado pelo Shifty em 01/10/2026');
  });

  it('draws one line per emotion and breaks it where a week has no records', () => {
    const document = html();

    // Ansiedade: um trecho contínuo; Alegria: só o trecho 15–28/09 tem dois pontos seguidos.
    expect(document.match(/<polyline/g)).toHaveLength(2);
    expect(document.match(/<circle/g)).toHaveLength(8);
  });

  it('tabulates the averages per bucket and for the whole period', () => {
    const document = html();

    expect(document).toContain('<th class="value">Ansiedade</th><th class="value">Alegria</th>');
    expect(document).toContain('<td>01/09/2026 a 07/09/2026</td><td class="value">80%</td>');
    expect(document).toContain('<td>Média no período</td><td class="value">60%</td>');
  });

  it('escapes user-provided text', () => {
    expect(html({ patientName: '<b>Ana</b>' })).toContain('&lt;b&gt;Ana&lt;/b&gt;');
    expect(escapeHtml(`"O'Neil" & cia`)).toBe('&quot;O&#39;Neil&quot; &amp; cia');
  });

  it('explains when the period has no records', () => {
    expect(html({ trend: { ...trend, series: [] } })).toContain(
      'Nenhum registro de pensamento neste período.',
    );
  });
});
