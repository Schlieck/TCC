import { StyleSheet } from 'react-native';
import { spacing } from '@/shared/theme';
import { AppText } from './app-text';
import { Screen } from './screen';

export function ComingSoon({ title }: { title: string }) {
  return (
    <Screen edges={[]} style={styles.container}>
      <AppText variant="title">{title}</AppText>
      <AppText>Esta área chega na próxima etapa do desenvolvimento.</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: spacing.md,
  },
});
