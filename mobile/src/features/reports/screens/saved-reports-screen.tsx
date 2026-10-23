import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/shared/errors';
import { navigationStamp } from '@/shared/navigation';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { confirm, notify } from '@/shared/ui/confirm';
import { Screen } from '@/shared/ui/screen';
import { ScreenTitle } from '@/shared/ui/screen-title';
import { SmallButton } from '@/shared/ui/small-button';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states';
import type { SavedReport } from '../api';
import { useDeleteSavedReport, useSavedReports } from '../hooks/use-reports';
import { periodLabel } from '../report-period';

export function SavedReportsScreen() {
  const reports = useSavedReports();
  const deleteReport = useDeleteSavedReport();

  function open(report: SavedReport) {
    router.navigate({
      pathname: '/reports',
      params: { from: report.period.from, to: report.period.to, at: navigationStamp() },
    });
  }

  async function remove(report: SavedReport) {
    const confirmed = await confirm({
      title: 'Excluir relatório?',
      message: `"${report.name}" será excluído. Seus registros continuam guardados.`,
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (confirmed) {
      deleteReport.mutate(report.id, {
        onError: (error) => {
          notify('Não foi possível excluir', errorMessage(error));
        },
      });
    }
  }

  return (
    <Screen edges={[]} style={styles.container}>
      <ScreenTitle title="Relatórios gerados" back />
      {reports.isPending ? (
        <LoadingState />
      ) : reports.isError ? (
        <ErrorState error={reports.error} onRetry={() => void reports.refetch()} />
      ) : (
        <FlatList
          data={reports.data}
          keyExtractor={(report) => String(report.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityHint="Abre o gráfico deste relatório"
              onPress={() => {
                open(item);
              }}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <View style={styles.itemText}>
                <AppText variant="subtitle" color={colors.onPrimary}>
                  {item.name}
                </AppText>
                <AppText variant="caption" color={colors.onPrimary}>
                  {periodLabel('custom', item.period)}
                </AppText>
              </View>
              <SmallButton
                label="Excluir"
                variant="danger"
                accessibilityLabel={`Excluir relatório ${item.name}`}
                onPress={() => void remove(item)}
              />
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState message='Nenhum relatório salvo ainda. Use "Salvar relatório" na tela de relatórios.' />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  list: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  itemText: {
    flex: 1,
    gap: spacing.xs,
  },
});
