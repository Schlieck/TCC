import { subDays } from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { todayIso, toIsoDate } from '@/shared/dates';
import { colors, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { DateTimeField } from '@/shared/ui/date-time-field';
import { LinkButton } from '@/shared/ui/link-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenTitle } from '@/shared/ui/screen-title';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states';
import type { Period } from '../api';
import { ThoughtRecordItem } from '../components/thought-record-item';
import { useEmotionsById } from '../hooks/use-emotions';
import { useThoughtRecords } from '../hooks/use-thought-records';
import { PERIOD_PRESET_LABELS, periodForPreset, type PeriodPreset } from '../period-filter';

const PRESETS: PeriodPreset[] = ['all', 'last7', 'last30', 'custom'];

export function ThoughtRecordListScreen() {
  const [preset, setPreset] = useState<PeriodPreset>('all');
  const [custom, setCustom] = useState<Period>(() => ({
    from: toIsoDate(subDays(new Date(), 30)),
    to: todayIso(),
  }));
  const records = useThoughtRecords(periodForPreset(preset, todayIso(), custom));
  const emotionsById = useEmotionsById();

  function goToNewRecord() {
    router.push('/thought-records/new');
  }

  return (
    <Screen edges={[]} style={styles.container}>
      <ScreenTitle title="Seus registros" back />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        <View style={styles.chips}>
          {PRESETS.map((option) => (
            <Chip
              key={option}
              label={PERIOD_PRESET_LABELS[option]}
              selected={option === preset}
              onPress={() => {
                setPreset(option);
              }}
            />
          ))}
        </View>
      </ScrollView>

      {preset === 'custom' ? (
        <View style={styles.customPeriod}>
          <View style={styles.half}>
            <DateTimeField
              mode="date"
              label="De"
              value={custom.from}
              maximumDate={new Date()}
              onChange={(from) => {
                setCustom((current) => ({ ...current, from }));
              }}
            />
          </View>
          <View style={styles.half}>
            <DateTimeField
              mode="date"
              label="Até"
              value={custom.to}
              maximumDate={new Date()}
              onChange={(to) => {
                setCustom((current) => ({ ...current, to }));
              }}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.links}>
        <LinkButton label="+ Novo registro" onPress={goToNewRecord} />
      </View>

      {records.isPending ? (
        <LoadingState />
      ) : records.isError ? (
        <ErrorState error={records.error} onRetry={() => void records.refetch()} />
      ) : (
        <FlatList
          data={records.data}
          keyExtractor={(record) => String(record.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={records.isRefetching}
              onRefresh={() => void records.refetch()}
              tintColor={colors.primary}
              colors={[colors.onPrimary]}
              progressBackgroundColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ThoughtRecordItem
              record={item}
              emotionsById={emotionsById}
              onPress={() => {
                router.push({ pathname: '/thought-records/[id]', params: { id: String(item.id) } });
              }}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              message={
                preset === 'all'
                  ? 'Você ainda não fez registros de pensamento.'
                  : 'Nenhum registro neste período.'
              }
              action={<Button label="Fazer novo registro" onPress={goToNewRecord} />}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  // Sem flexShrink a lista longa espreme a faixa de filtros e corta os chips.
  filters: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  customPeriod: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  links: {
    alignItems: 'flex-end',
  },
  list: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
