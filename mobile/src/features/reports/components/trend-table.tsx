import { ScrollView, StyleSheet, View } from 'react-native';
import { chart, colors, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import type { EmotionTrend } from '../emotion-trend';
import { bucketDescription } from '../report-period';
import { formatPercent, sortSeries } from '../trend-summary';

const PERIOD_COLUMN_WIDTH = 150;
const VALUE_COLUMN_WIDTH = 84;

/** Os mesmos números do gráfico em forma de tabela, para leitura sem depender de cor. */
export function TrendTable({ trend }: { trend: EmotionTrend }) {
  const series = sortSeries(trend.series);

  return (
    <ScrollView horizontal style={styles.scroll}>
      <View>
        <View style={[styles.row, styles.header]}>
          <AppText variant="caption" color={colors.text} style={styles.periodCell}>
            Período
          </AppText>
          {series.map((entry) => (
            <AppText
              key={entry.emotion.id}
              variant="caption"
              color={colors.text}
              style={styles.valueCell}
            >
              {entry.emotion.name}
            </AppText>
          ))}
        </View>
        {trend.buckets.map((bucket, index) => (
          <View key={bucket.start} style={styles.row}>
            <AppText variant="caption" style={styles.periodCell}>
              {bucketDescription(trend.granularity, bucket)}
            </AppText>
            {series.map((entry) => (
              <AppText
                key={entry.emotion.id}
                variant="caption"
                color={colors.text}
                style={styles.valueCell}
              >
                {formatPercent(entry.values[index] ?? null)}
              </AppText>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    borderRadius: radius.sm,
    backgroundColor: chart.surface,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: chart.grid,
  },
  header: {
    borderBottomColor: chart.axis,
  },
  periodCell: {
    width: PERIOD_COLUMN_WIDTH,
  },
  valueCell: {
    width: VALUE_COLUMN_WIDTH,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
