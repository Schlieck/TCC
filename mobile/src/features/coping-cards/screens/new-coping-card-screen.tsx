import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { spacing } from '@/shared/theme';
import { Screen } from '@/shared/ui/screen';
import { ScreenTitle } from '@/shared/ui/screen-title';
import { CopingCardForm } from '../components/coping-card-form';

export function NewCopingCardScreen() {
  return (
    <Screen scroll edges={[]} style={styles.container}>
      <ScreenTitle title="Novo cartão" back />
      <CopingCardForm
        initialValues={{ name: '', description: '', groupId: null }}
        onSaved={() => {
          // Volta para a lista se ela já está na pilha, em vez de empilhar outra cópia.
          router.dismissTo('/coping-cards/list');
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
