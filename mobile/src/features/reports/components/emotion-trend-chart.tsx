import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { chart, colors, emotionColor, fonts, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import type { EmotionTrend } from '../emotion-trend';
import { LABEL_FONT_SIZE, LABEL_SHIFT_X, placeDirectLabels } from '../direct-labels';
import { bucketDescription, bucketLabel } from '../report-period';
import { describeTrend, formatPercent, sortSeries } from '../trend-summary';

const CHART_HEIGHT = 200;
const Y_AXIS_WIDTH = 40;
const EDGE_SPACING = 14;
const MAX_X_LABELS = 7;
const MAX_DIRECT_LABELS = 4;
const X_LABEL_WIDTH = 52;
/** Margens da tela e do cartão que envolvem o gráfico. */
const HORIZONTAL_CHROME = spacing.md * 4;

// A biblioteca passa a mostrar casas decimais ("100.0") quando alguma média é fracionária.
function formatYLabel(label: string): string {
  return String(Math.round(Number(label)));
}

/** Com uma emoção em destaque, as outras linhas ficam em cinza. */
function lineColor(emotion: { id: number; slug: string }, emphasis: number | null): string {
  return emphasis === null || emotion.id === emphasis ? emotionColor(emotion.slug) : chart.dimmed;
}

/**
 * A biblioteca limita cada rótulo do eixo X ao espaço entre dois pontos; em períodos longos o
 * texto virava "...". Como só um ponto a cada vários leva rótulo, ele pode ser mais largo.
 */
function XAxisLabel({ text, spacing }: { text: string; spacing: number }) {
  return (
    <Text
      numberOfLines={1}
      style={[styles.axisText, styles.xAxisLabel, { marginLeft: (spacing - X_LABEL_WIDTH) / 2 }]}
    >
      {text}
    </Text>
  );
}

interface PointerProps {
  pointerIndex: number;
  pointerX: number;
}

interface EmotionTrendChartProps {
  trend: EmotionTrend;
  /** Emoção destacada na legenda; as outras linhas ficam em cinza. */
  highlighted: number | null;
}

export function EmotionTrendChart({ trend, highlighted }: EmotionTrendChartProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [selection, setSelection] = useState<{ trend: EmotionTrend; index: number } | null>(null);
  const series = useMemo(() => sortSeries(trend.series), [trend]);
  // Com oito emoções há cores parecidas; destacar uma resolve a leitura sem trocar a paleta.
  const emphasis = series.some((entry) => entry.emotion.id === highlighted) ? highlighted : null;
  const drawOrder = useMemo(
    () =>
      emphasis === null
        ? series
        : [
            ...series.filter((entry) => entry.emotion.id !== emphasis),
            ...series.filter((entry) => entry.emotion.id === emphasis),
          ],
    [series, emphasis],
  );
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
    // Em destaque, só a emoção escolhida leva rótulo: os das linhas em cinza se sobreporiam.
    const labeled =
      series.length > MAX_DIRECT_LABELS
        ? []
        : series.filter((entry) => emphasis === null || entry.emotion.id === emphasis);
    const labelShifts = placeDirectLabels(
      labeled.map((entry) => {
        const lastIndex = entry.values.findLastIndex((value) => value !== null);
        return {
          id: entry.emotion.id,
          x: EDGE_SPACING + lastIndex * step,
          y: (1 - (entry.values[lastIndex] ?? 0) / 100) * CHART_HEIGHT,
          text: entry.emotion.name,
        };
      }),
    );
    return drawOrder.map((entry) => {
      const color = lineColor(entry.emotion, emphasis);
      const lastIndex = entry.values.findLastIndex((value) => value !== null);
      const labelShift = labelShifts.get(entry.emotion.id);
      return {
        color,
        thickness: entry.emotion.id === emphasis ? 3 : 2,
        dataPointsColor: color,
        dataPointsRadius: 4,
        data: entry.values.map((value, index) => ({
          value: value ?? undefined,
          // A opção global da biblioteca não esconde o ponto quando o valor ausente vira NaN.
          hidePointer: value === null,
          ...(index % labelEvery === 0
            ? { labelComponent: () => <XAxisLabel text={labels[index] ?? ''} spacing={step} /> }
            : {}),
          ...(labelShift !== undefined && index === lastIndex
            ? {
                dataPointText: entry.emotion.name,
                textColor: chart.text,
                textFontSize: LABEL_FONT_SIZE,
                textShiftY: labelShift,
                textShiftX: LABEL_SHIFT_X,
              }
            : {}),
        })),
      };
    });
  }, [drawOrder, series, labels, emphasis, step]);

  const pointerConfig = useMemo(
    () => ({
      pointerStripColor: chart.axis,
      pointerStripWidth: 1,
      pointerColorsForDataSet: drawOrder.map((entry) => lineColor(entry.emotion, emphasis)),
      radius: 5,
      persistPointer: true,
    }),
    [drawOrder, emphasis],
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
          formatYLabel={formatYLabel}
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

interface TrendLegendProps {
  trend: EmotionTrend;
  highlighted: number | null;
  onToggle: (emotionId: number) => void;
}

export function TrendLegend({ trend, highlighted, onToggle }: TrendLegendProps) {
  const series = sortSeries(trend.series);
  const emphasis = series.some((entry) => entry.emotion.id === highlighted) ? highlighted : null;

  return (
    <View style={styles.legendBlock}>
      <View style={styles.legend}>
        {series.map((entry) => (
          <Pressable
            key={entry.emotion.id}
            accessibilityRole="button"
            accessibilityState={{ selected: entry.emotion.id === emphasis }}
            accessibilityHint="Destaca esta emoção no gráfico"
            onPress={() => {
              onToggle(entry.emotion.id);
            }}
            style={styles.legendItem}
          >
            <View
              style={[styles.legendLine, { backgroundColor: lineColor(entry.emotion, emphasis) }]}
            />
            <AppText
              variant="caption"
              color={emphasis === null || entry.emotion.id === emphasis ? colors.text : chart.text}
              style={entry.emotion.id === emphasis ? styles.legendSelected : undefined}
            >
              {entry.emotion.name}
            </AppText>
          </Pressable>
        ))}
      </View>
      {series.length > 1 ? (
        <AppText variant="caption">
          {emphasis === null
            ? 'Toque numa emoção da legenda para destacá-la.'
            : 'Toque de novo na emoção para ver todas.'}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  axisText: {
    color: chart.text,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  xAxisLabel: {
    width: X_LABEL_WIDTH,
    textAlign: 'center',
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
  legendBlock: {
    gap: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.md,
  },
  // Altura mínima de alvo de toque: cada item da legenda é um botão.
  legendItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendLine: {
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  legendSelected: {
    fontFamily: fonts.bold,
  },
});
