import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { chart, colors, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { LinkButton } from '@/shared/ui/link-button';
import { Screen } from '@/shared/ui/screen';
import { EmptyState, ErrorState } from '@/shared/ui/states';
import { EmotionTrendChart, TrendLegend } from '../components/emotion-trend-chart';
import { PeriodSelector } from '../components/period-selector';
import { SaveReportModal } from '../components/save-report-modal';
import { TrendTable } from '../components/trend-table';
import { useReportPeriod } from '../hooks/use-report-period';
import { useEmotionTrend } from '../hooks/use-reports';

export function ReportsScreen() {
  const selection = useReportPeriod();
  const trend = useEmotionTrend(selection.period);
  const [showTable, setShowTable] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasData = (trend.data?.series.length ?? 0) > 0;

  return (
    <Screen scroll edges={[]} style={styles.container}>
      <View style={styles.intro}>
        <AppText variant="title" accessibilityRole="header">
          Como anda o seu tratamento?
        </AppText>
        <AppText variant="caption">
          Filtre os intervalos de tempo em que você quer verificar suas mudanças de humor e leve
          seus relatórios para as consultas. Comunicação e confiança são essenciais!
        </AppText>
      </View>

      <Button
        label="Verificar relatórios gerados"
        style={styles.savedButton}
        onPress={() => {
          router.push('/reports/saved');
        }}
      />

      <PeriodSelector
        kind={selection.kind}
        label={selection.label}
        custom={selection.custom}
        canGoNext={selection.canGoNext}
        onKindChange={selection.changeKind}
        onShift={selection.shift}
        onCustomChange={selection.setCustom}
      />

      <View style={styles.card}>
        {trend.isPending ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} />
        ) : trend.isError ? (
          <ErrorState error={trend.error} onRetry={() => void trend.refetch()} />
        ) : !hasData ? (
          <EmptyState
            message="Nenhum registro de pensamento neste período."
            action={
              <Button
                label="Fazer novo registro"
                onPress={() => {
                  router.navigate('/thought-records/new');
                }}
              />
            }
          />
        ) : (
          <>
            <AppText variant="caption" color={chart.text}>
              Intensidade média de cada sentimento ({granularityLabel(trend.data.granularity)})
            </AppText>
            <EmotionTrendChart trend={trend.data} />
            <TrendLegend trend={trend.data} />
            <LinkButton
              label={showTable ? 'Ocultar tabela' : 'Ver os números em tabela'}
              onPress={() => {
                setShowTable((visible) => !visible);
              }}
            />
            {showTable ? <TrendTable trend={trend.data} /> : null}
          </>
        )}
        {trend.isFetching && !trend.isPending ? (
          <ActivityIndicator color={colors.primary} style={styles.refreshing} />
        ) : null}
      </View>

      {hasData ? (
        <Button
          label="Salvar relatório"
          onPress={() => {
            setSaving(true);
          }}
        />
      ) : null}

      <SaveReportModal
        visible={saving}
        period={selection.period}
        suggestedName={selection.label}
        onClose={() => {
          setSaving(false);
        }}
      />
    </Screen>
  );
}

function granularityLabel(granularity: 'day' | 'week' | 'month'): string {
  switch (granularity) {
    case 'day':
      return 'por dia';
    case 'week':
      return 'por semana';
    case 'month':
      return 'por mês';
  }
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  intro: {
    gap: spacing.xs,
  },
  savedButton: {
    alignSelf: 'center',
  },
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: chart.surface,
    minHeight: 120,
  },
  loading: {
    paddingVertical: spacing.xl,
  },
  refreshing: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
});
