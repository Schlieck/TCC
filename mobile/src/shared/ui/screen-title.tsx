import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/shared/theme';
import { AppText } from './app-text';

interface ScreenTitleProps {
  title: string;
  /** Mostra a seta de voltar (telas internas de uma aba). */
  back?: boolean;
  /** Ações à direita do título, como "+ Novo". */
  actions?: ReactNode;
}

export function ScreenTitle({ title, back = false, actions }: ScreenTitleProps) {
  return (
    <View style={styles.row}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={spacing.sm}
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
      ) : null}
      <AppText variant="title" accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
      {actions}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
});
