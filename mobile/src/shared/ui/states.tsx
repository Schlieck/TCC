import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/shared/api/errors';
import { colors, spacing } from '@/shared/theme';
import { AppText } from './app-text';
import { Button } from './button';

export function LoadingState() {
  return (
    <View style={styles.center} accessibilityLabel="Carregando">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <AppText color={colors.dangerText} style={styles.text}>
        {errorMessage(error)}
      </AppText>
      <Button label="Tentar novamente" onPress={onRetry} />
    </View>
  );
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <View style={styles.center}>
      <AppText style={styles.text}>{message}</AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  text: {
    textAlign: 'center',
  },
});
