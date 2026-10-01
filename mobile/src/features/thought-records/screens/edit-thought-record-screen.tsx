import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { spacing } from '@/shared/theme';
import { Screen } from '@/shared/ui/screen';
import { ScreenTitle } from '@/shared/ui/screen-title';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { ThoughtRecordForm } from '../components/thought-record-form';
import { useThoughtRecord } from '../hooks/use-thought-records';

export function EditThoughtRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const record = useThoughtRecord(Number(id));

  return (
    <Screen scroll edges={[]} style={styles.container}>
      <ScreenTitle title="Editar registro" back />
      {record.isPending ? (
        <LoadingState />
      ) : record.isError ? (
        <ErrorState error={record.error} onRetry={() => void record.refetch()} />
      ) : (
        <ThoughtRecordForm
          recordId={record.data.id}
          initialValues={{
            title: record.data.title,
            date: record.data.date,
            time: record.data.time,
            description: record.data.description,
            emotions: record.data.emotions,
          }}
          onSaved={() => {
            router.back();
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
});
