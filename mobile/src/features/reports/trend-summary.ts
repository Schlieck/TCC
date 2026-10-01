import { emotionRank } from '@/shared/theme';
import type { EmotionTrend, EmotionTrendSeries } from './api';

/** Séries na ordem fixa das cores (a cor acompanha a emoção, não a posição). */
export function sortSeries(series: readonly EmotionTrendSeries[]): EmotionTrendSeries[] {
  return [...series].sort((a, b) => emotionRank(a.emotion.slug) - emotionRank(b.emotion.slug));
}

export function averageOf(values: readonly (number | null)[]): number | null {
  const present = values.filter((value): value is number => value !== null);
  if (present.length === 0) {
    return null;
  }
  return Math.round(present.reduce((sum, value) => sum + value, 0) / present.length);
}

export function formatPercent(value: number | null): string {
  return value === null ? '—' : `${Math.round(value)}%`;
}

/** Texto para leitores de tela: a média de cada emoção no período. */
export function describeTrend(trend: EmotionTrend): string {
  if (trend.series.length === 0) {
    return 'Nenhum registro no período.';
  }
  const parts = sortSeries(trend.series).map(
    (series) => `${series.emotion.name}, média de ${formatPercent(averageOf(series.values))}`,
  );
  return `Gráfico de linhas da intensidade das emoções. ${parts.join('; ')}.`;
}
