import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { toTime, todayIso } from '@/shared/dates';
import { spacing } from '@/shared/theme';
import { Screen } from '@/shared/ui/screen';
import { ScreenTitle } from '@/shared/ui/screen-title';
import { ThoughtRecordForm } from '../components/thought-record-form';
import type { ThoughtRecordFormValues } from '../validation';

export function NewThoughtRecordScreen() {
  const [initialValues] = useState<ThoughtRecordFormValues>(() => ({
    title: '',
    date: todayIso(),
    time: toTime(new Date()),
    description: '',
    emotions: [],
  }));

  return (
    <Screen scroll edges={[]} style={styles.container}>
      <ScreenTitle title="Novo registro" back />
      <ThoughtRecordForm
        initialValues={initialValues}
        onSaved={() => {
          // Volta para a lista se ela já está na pilha, em vez de empilhar outra cópia.
          router.dismissTo('/thought-records/list');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
});
