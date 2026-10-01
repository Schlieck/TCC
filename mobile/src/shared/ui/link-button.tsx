import { Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '@/shared/theme';
import { AppText } from './app-text';

interface LinkButtonProps {
  label: string;
  onPress: () => void;
}

export function LinkButton({ label, onPress }: LinkButtonProps) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      hitSlop={spacing.sm}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <AppText variant="body" color={colors.primary} style={styles.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    textAlign: 'center',
  },
});
