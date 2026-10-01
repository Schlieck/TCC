import { StyleSheet, Text } from 'react-native';
import { colors, fontSize, spacing } from '@/shared/theme';
import { Screen } from './screen';

export function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Configuração incompleta</Text>
      <Text style={styles.message}>{message}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    color: colors.primary,
    fontSize: fontSize.title,
    fontWeight: '700',
  },
  message: {
    color: colors.text,
    fontSize: fontSize.body,
  },
});
