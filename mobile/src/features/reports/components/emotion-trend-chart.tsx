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

export function EmotionTrendChart({ trend }: { trend: EmotionTrend }) {
  const { width: windowWidth } = useWindowDimensions();
  const series = sortSeries(trend.series);
  const spansYears = trend.period.from.slice(0, 4) !== trend.period.to.slice(0, 4);
  const labels = trend.buckets.map((bucket) => bucketLabel(trend.granularity, bucket, spansYears));
  const labelEvery = Math.max(1, Math.ceil(labels.length / MAX_X_LABELS));
  const plotWidth = windowWidth - HORIZONTAL_CHROME - Y_AXIS_WIDTH;
  const step =
    labels.length > 1 ? (plotWidth - EDGE_SPACING * 2) / (labels.length - 1) : plotWidth / 2;
  const showDirectLabels = series.length <= MAX_DIRECT_LABELS;

  const dataSet = series.map((entry) => {
    const color = emotionColor(entry.emotion.slug);
    const lastIndex = entry.values.findLastIndex((value) => value !== null);
    return {
      color,
      thickness: 2,
      dataPointsColor: color,
      dataPointsRadius: 4,
      data: entry.values.map((value, index) => ({
        value: value ?? undefined,
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

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={describeTrend(trend)}>
      <LineChart
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
        pointerConfig={{
          pointerStripColor: chart.axis,
          pointerStripWidth: 1,
          pointerColorsForDataSet: series.map((entry) => emotionColor(entry.emotion.slug)),
          radius: 5,
          autoAdjustPointerLabelPosition: true,
          pointerLabelWidth: 170,
          pointerLabelHeight: 36 + 20 * series.length,
          hidePointerForMissingValues: true,
          pointerLabelComponent: (_items: unknown, _secondary: unknown, index: number) => {
            const bucket = trend.buckets[index];
            return bucket ? (
              <View style={styles.tooltip}>
                <AppText variant="caption" color={colors.text}>
                  {bucketDescription(trend.granularity, bucket)}
                </AppText>
                {series.map((entry) => (
                  <View key={entry.emotion.id} style={styles.tooltipRow}>
                    <View
                      style={[styles.swatch, { backgroundColor: emotionColor(entry.emotion.slug) }]}
                    />
                    <AppText variant="caption" color={colors.text} style={styles.tooltipName}>
                      {entry.emotion.name}
                    </AppText>
                    <AppText variant="caption" color={colors.text}>
                      {formatPercent(entry.values[index] ?? null)}
                    </AppText>
                  </View>
                ))}
              </View>
            ) : null;
          },
        }}
      />
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
  tooltip: {
    gap: 2,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: chart.axis,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tooltipName: {
    flex: 1,
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
