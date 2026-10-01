import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { spacing } from '@/shared/theme';
import { Screen } from '@/shared/ui/screen';
import { ScreenTitle } from '@/shared/ui/screen-title';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { CopingCardForm } from '../components/coping-card-form';
import { useCard } from '../hooks/use-coping-cards';

export function EditCopingCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = useCard(Number(id));

  return (
    <Screen scroll edges={[]} style={styles.container}>
      <ScreenTitle title="Editar cartão" back />
      {card.isPending ? (
        <LoadingState />
      ) : card.isError ? (
        <ErrorState error={card.error} onRetry={() => void card.refetch()} />
      ) : (
        <CopingCardForm
          cardId={card.data.id}
          initialValues={{
            name: card.data.name,
            description: card.data.description,
            groupId: card.data.groupId,
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
