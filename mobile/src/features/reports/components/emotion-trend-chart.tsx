import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { chart, colors, emotionColor, fonts, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import type { EmotionTrend } from '../api';
import { bucketDescription, bucketLabel } from '../report-period';
import { describeTrend, formatPercent, sortSeries } from '../trend-summary';

const CHART_HEIGHT = 200;
const Y_AXIS_WIDTH = 40;
const EDGE_SPACING = 14;
const MAX_X_LABELS = 7;
const MAX_DIRECT_LABELS = 4;
/** Margens da tela e do cartão que envolvem o gráfico. */
const HORIZONTAL_CHROME = spacing.md * 4;

interface PointerProps {
  pointerIndex: number;
  pointerX: number;
}

export function EmotionTrendChart({ trend }: { trend: EmotionTrend }) {
  const { width: windowWidth } = useWindowDimensions();
  const [selection, setSelection] = useState<{ trend: EmotionTrend; index: number } | null>(null);
  const series = useMemo(() => sortSeries(trend.series), [trend]);
  const labels = useMemo(() => {
    const spansYears = trend.period.from.slice(0, 4) !== trend.period.to.slice(0, 4);
    return trend.buckets.map((bucket) => bucketLabel(trend.granularity, bucket, spansYears));
  }, [trend]);
  const plotWidth = windowWidth - HORIZONTAL_CHROME - Y_AXIS_WIDTH;
  const step =
    labels.length > 1 ? (plotWidth - EDGE_SPACING * 2) / (labels.length - 1) : plotWidth / 2;

  // Memoizado: o gráfico recebe dados novos a cada render e perderia o ponteiro selecionado.
  const dataSet = useMemo(() => {
    const labelEvery = Math.max(1, Math.ceil(labels.length / MAX_X_LABELS));
    const showDirectLabels = series.length <= MAX_DIRECT_LABELS;
    return series.map((entry) => {
      const color = emotionColor(entry.emotion.slug);
      const lastIndex = entry.values.findLastIndex((value) => value !== null);
      return {
        color,
        thickness: 2,
        dataPointsColor: color,
        dataPointsRadius: 4,
        data: entry.values.map((value, index) => ({
          value: value ?? undefined,
          // A opção global da biblioteca não esconde o ponto quando o valor ausente vira NaN.
          hidePointer: value === null,
          label: index % labelEvery === 0 ? labels[index] : '',
          ...(showDirectLabels && index === lastIndex
            ? {
                dataPointText: entry.emotion.name,
                textColor: chart.text,
                textFontSize: 10,
                textShiftY: -8,
                textShiftX: -12,
              }
            : {}),
        })),
      };
    });
  }, [series, labels]);

  const pointerConfig = useMemo(
    () => ({
      pointerStripColor: chart.axis,
      pointerStripWidth: 1,
      pointerColorsForDataSet: series.map((entry) => emotionColor(entry.emotion.slug)),
      radius: 5,
      persistPointer: true,
    }),
    [series],
  );

  const selectedIndex = selection?.trend === trend ? selection.index : null;
  const selectedBucket = selectedIndex === null ? undefined : trend.buckets[selectedIndex];

  return (
    <View>
      <View accessible accessibilityRole="image" accessibilityLabel={describeTrend(trend)}>
        <LineChart
          // Remonta ao trocar de período para o ponteiro não ficar num intervalo de outro gráfico.
          key={`${trend.granularity}:${trend.period.from}:${trend.period.to}`}
          dataSet={dataSet}
          height={CHART_HEIGHT}
          width={plotWidth}
          spacing={step}
          initialSpacing={EDGE_SPACING}
          endSpacing={EDGE_SPACING}
          maxValue={100}
          noOfSections={4}
          yAxisLabelSuffix="%"
          yAxisLabelWidth={Y_AXIS_WIDTH}
          yAxisThickness={0}
          xAxisColor={chart.axis}
          rulesColor={chart.grid}
          rulesType="solid"
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          backgroundColor={chart.surface}
          interpolateMissingValues
          extrapolateMissingValues={false}
          showDataPointsForMissingValues={false}
          disableScroll
          pointerConfig={pointerConfig}
          getPointerProps={({ pointerIndex, pointerX }: PointerProps) => {
            setSelection(pointerX > 0 && pointerIndex >= 0 ? { trend, index: pointerIndex } : null);
          }}
        />
      </View>
      {/* Fora do gráfico: com muitas emoções, um balão sobre o gráfico seria cortado. */}
      <View style={styles.details}>
        {selectedBucket && selectedIndex !== null ? (
          <>
            <AppText variant="caption" color={colors.text}>
              {bucketDescription(trend.granularity, selectedBucket)}
            </AppText>
            <View style={styles.detailsGrid}>
              {series.map((entry) => (
                <View key={entry.emotion.id} style={styles.detailsItem}>
                  <View
                    style={[styles.swatch, { backgroundColor: emotionColor(entry.emotion.slug) }]}
                  />
                  <AppText variant="caption" color={colors.text} style={styles.detailsName}>
                    {entry.emotion.name}
                  </AppText>
                  <AppText variant="caption" color={colors.text} style={styles.detailsValue}>
                    {formatPercent(entry.values[selectedIndex] ?? null)}
                  </AppText>
                </View>
              ))}
            </View>
          </>
        ) : (
          <AppText variant="caption">Toque no gráfico para ver os valores de cada período.</AppText>
        )}
      </View>
    </View>
  );
}

export function TrendLegend({ trend }: { trend: EmotionTrend }) {
  return (
    <View style={styles.legend}>
      {sortSeries(trend.series).map((entry) => (
        <View key={entry.emotion.id} style={styles.legendItem}>
          <View
            style={[styles.legendLine, { backgroundColor: emotionColor(entry.emotion.slug) }]}
          />
          <AppText variant="caption" color={colors.text}>
            {entry.emotion.name}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  axisText: {
    color: chart.text,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  details: {
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 2,
    columnGap: spacing.md,
  },
  detailsItem: {
    width: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailsName: {
    flex: 1,
  },
  detailsValue: {
    fontVariant: ['tabular-nums'],
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendLine: {
    width: 16,
    height: 3,
    borderRadius: 2,
  },
});
