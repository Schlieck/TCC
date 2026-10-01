import { formatDate } from '@/shared/dates';
import { emotionPrintColors, fallbackEmotionColor, print } from '@/shared/theme';
import type { EmotionTrend, EmotionTrendSeries } from '../api';
import { bucketDescription, bucketLabel } from '../report-period';
import { averageOf, formatPercent, sortSeries } from '../trend-summary';

export interface ReportDocument {
  trend: EmotionTrend;
  periodLabel: string;
  patientName?: string;
  /** yyyy-MM-dd */
  generatedOn: string;
}

const CHART = { width: 640, height: 260, left: 44, right: 16, top: 12, bottom: 36 };
const Y_TICKS = [0, 25, 50, 75, 100];
const MAX_X_LABELS = 8;

/**
 * HTML do relatório para o expo-print. Leva só dados agregados (médias por intervalo),
 * nunca o texto dos registros de pensamento.
 */
export function buildReportHtml({
  trend,
  periodLabel,
  patientName,
  generatedOn,
}: ReportDocument): string {
  const series = sortSeries(trend.series);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Relatório Shifty — ${escapeHtml(periodLabel)}</title>
<style>${STYLES}</style>
</head>
<body>
<header>
  <h1>Shifty · Evolução das emoções</h1>
  <p class="meta">${patientName ? `${escapeHtml(patientName)} · ` : ''}${escapeHtml(periodLabel)}</p>
</header>
${series.length === 0 ? '<p>Nenhum registro de pensamento neste período.</p>' : renderBody(trend, series)}
<footer>
  Gerado pelo Shifty em ${formatDate(generatedOn)}. Os valores são médias da intensidade (0 a 100%)
  que o próprio paciente informou nos registros de pensamento. Este relatório apoia a conversa com o
  profissional e não é um diagnóstico.
</footer>
</body>
</html>`;
}

function renderBody(trend: EmotionTrend, series: EmotionTrendSeries[]): string {
  return `
<section>
  ${renderChart(trend, series)}
  <ul class="legend">${series
    .map(
      (entry) =>
        `<li><span class="swatch" style="background:${printColor(entry.emotion.slug)}"></span>${escapeHtml(entry.emotion.name)}</li>`,
    )
    .join('')}</ul>
</section>
<section>
  <h2>Intensidade média por ${granularityName(trend.granularity)}</h2>
  ${renderTable(trend, series)}
</section>`;
}

function renderChart(trend: EmotionTrend, series: EmotionTrendSeries[]): string {
  const count = trend.buckets.length;
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const x = (index: number) =>
    CHART.left + (count === 1 ? plotWidth / 2 : (index * plotWidth) / (count - 1));
  const y = (value: number) => CHART.top + plotHeight * (1 - value / 100);
  const spansYears = trend.period.from.slice(0, 4) !== trend.period.to.slice(0, 4);
  const labelEvery = Math.max(1, Math.ceil(count / MAX_X_LABELS));

  const grid = Y_TICKS.map(
    (tick) =>
      `<line x1="${CHART.left}" x2="${CHART.width - CHART.right}" y1="${y(tick)}" y2="${y(tick)}" stroke="${tick === 0 ? print.axis : print.grid}" stroke-width="1" />` +
      `<text x="${CHART.left - 6}" y="${y(tick) + 4}" text-anchor="end" class="tick">${tick}%</text>`,
  ).join('');

  const xLabels = trend.buckets
    .map((bucket, index) =>
      index % labelEvery === 0
        ? `<text x="${x(index)}" y="${CHART.height - CHART.bottom + 18}" text-anchor="middle" class="tick">${escapeHtml(bucketLabel(trend.granularity, bucket, spansYears))}</text>`
        : '',
    )
    .join('');

  const lines = series
    .map((entry) => {
      const color = printColor(entry.emotion.slug);
      const segments = segmentsOf(entry.values)
        .filter((segment) => segment.length > 1)
        .map(
          (segment) =>
            `<polyline fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" points="${segment
              .map(([index, value]) => `${x(index)},${y(value)}`)
              .join(' ')}" />`,
        )
        .join('');
      const points = entry.values
        .map((value, index) =>
          value === null
            ? ''
            : `<circle cx="${x(index)}" cy="${y(value)}" r="3.5" fill="${color}" stroke="${print.surface}" stroke-width="1.5" />`,
        )
        .join('');
      return segments + points;
    })
    .join('');

  return `<svg viewBox="0 0 ${CHART.width} ${CHART.height}" role="img" aria-label="Gráfico de linhas da intensidade média de cada emoção">${grid}${xLabels}${lines}</svg>`;
}

function renderTable(trend: EmotionTrend, series: EmotionTrendSeries[]): string {
  const header = `<tr><th>Período</th>${series
    .map((entry) => `<th>${escapeHtml(entry.emotion.name)}</th>`)
    .join('')}</tr>`;
  const rows = trend.buckets
    .map(
      (bucket, index) =>
        `<tr><td>${escapeHtml(bucketDescription(trend.granularity, bucket))}</td>${series
          .map((entry) => `<td class="value">${formatPercent(entry.values[index] ?? null)}</td>`)
          .join('')}</tr>`,
    )
    .join('');
  const averages = `<tr class="total"><td>Média no período</td>${series
    .map((entry) => `<td class="value">${formatPercent(averageOf(entry.values))}</td>`)
    .join('')}</tr>`;
  return `<table><thead>${header}</thead><tbody>${rows}${averages}</tbody></table>`;
}

/** Trechos com valores consecutivos: a linha não atravessa intervalos sem registro. */
function segmentsOf(values: readonly (number | null)[]): [number, number][][] {
  const segments: [number, number][][] = [];
  let current: [number, number][] = [];
  values.forEach((value, index) => {
    if (value === null) {
      if (current.length > 0) {
        segments.push(current);
      }
      current = [];
    } else {
      current.push([index, value]);
    }
  });
  if (current.length > 0) {
    segments.push(current);
  }
  return segments;
}

function granularityName(granularity: EmotionTrend['granularity']): string {
  switch (granularity) {
    case 'day':
      return 'dia';
    case 'week':
      return 'semana';
    case 'month':
      return 'mês';
  }
}

function printColor(slug: string): string {
  return emotionPrintColors[slug] ?? fallbackEmotionColor;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const STYLES = `
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: ${print.ink};
         background: ${print.surface}; margin: 32px; font-size: 12px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 24px 0 8px; }
  .meta { color: ${print.secondaryInk}; margin: 0 0 16px; }
  svg { width: 100%; height: auto; }
  .tick { font-size: 10px; fill: ${print.secondaryInk}; }
  .legend { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-wrap: wrap; gap: 16px; }
  .legend li { display: flex; align-items: center; gap: 6px; }
  .swatch { display: inline-block; width: 16px; height: 3px; border-radius: 2px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { padding: 4px 6px; border-bottom: 1px solid ${print.grid}; text-align: left; }
  th { border-bottom-color: ${print.axis}; }
  .value { text-align: right; font-variant-numeric: tabular-nums; }
  .total td { font-weight: 700; }
  footer { margin-top: 24px; color: ${print.secondaryInk}; font-size: 10px; line-height: 1.5; }
`;
