import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { errorMessage } from '@/shared/errors';
import { formatLongDate } from '@/shared/dates';
import { colors, emotionColor, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { confirm, notify } from '@/shared/ui/confirm';
import { Screen } from '@/shared/ui/screen';
import { ScreenTitle } from '@/shared/ui/screen-title';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import type { ThoughtRecord } from '../api';
import { useEmotionsById } from '../hooks/use-emotions';
import { useDeleteThoughtRecord, useThoughtRecord } from '../hooks/use-thought-records';

export function ThoughtRecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const record = useThoughtRecord(Number(id));

  return (
    <Screen scroll edges={[]} style={styles.container}>
      <ScreenTitle title="Registro" back />
      {record.isPending ? (
        <LoadingState />
      ) : record.isError ? (
        <ErrorState error={record.error} onRetry={() => void record.refetch()} />
      ) : (
        <RecordDetail record={record.data} />
      )}
    </Screen>
  );
}

function RecordDetail({ record }: { record: ThoughtRecord }) {
  const emotionsById = useEmotionsById();
  const deleteRecord = useDeleteThoughtRecord();

  async function remove() {
    const confirmed = await confirm({
      title: 'Excluir registro?',
      message: 'Este registro será excluído permanentemente.',
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (confirmed) {
      deleteRecord.mutate(record.id, {
        onSuccess: () => {
          router.back();
        },
        onError: (error) => {
          notify('Não foi possível excluir', errorMessage(error));
        },
      });
    }
  }

  return (
    <View style={styles.detail}>
      <View style={styles.header}>
        <AppText variant="subtitle">{record.title}</AppText>
        <AppText variant="caption">
          {formatLongDate(record.date)} às {record.time}
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="label">Sentimentos</AppText>
        {record.emotions.map((entry) => {
          const emotion = emotionsById.get(entry.emotionId);
          return (
            <View
              key={entry.emotionId}
              style={styles.emotion}
              accessible
              accessibilityLabel={`${emotion?.name ?? 'Sentimento'}: ${entry.intensity}%`}
            >
              <AppText style={styles.emotionName}>{emotion?.name ?? 'Sentimento'}</AppText>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${entry.intensity}%`,
                      backgroundColor: emotionColor(emotion?.slug),
                    },
                  ]}
                />
              </View>
              <AppText variant="label" style={styles.percent}>
                {entry.intensity}%
              </AppText>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <AppText variant="label">Descrição</AppText>
        <AppText>{record.description}</AppText>
      </View>

      <View style={styles.actions}>
        <Button
          label="Editar"
          onPress={() => {
            router.push({
              pathname: '/thought-records/[id]/edit',
              params: { id: String(record.id) },
            });
          }}
        />
        <Button
          label="Excluir"
          variant="danger"
          loading={deleteRecord.isPending}
          onPress={() => void remove()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  detail: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  emotion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emotionName: {
    width: 90,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: radius.sm,
  },
  percent: {
    width: 48,
    textAlign: 'right',
  },
  actions: {
    gap: spacing.md,
  },
});
