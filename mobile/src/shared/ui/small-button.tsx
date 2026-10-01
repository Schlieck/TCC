import { Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from './app-text';

type SmallButtonVariant = 'outline' | 'danger';

interface SmallButtonProps {
  label: string;
  onPress: () => void;
  variant?: SmallButtonVariant;
  accessibilityLabel?: string;
}

/** Botão compacto para usar sobre superfícies amarelas (cartões, itens de lista). */
export function SmallButton({
  label,
  onPress,
  variant = 'outline',
  accessibilityLabel,
}: SmallButtonProps) {
  const color = variant === 'danger' ? colors.dangerOnPrimary : colors.onPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={spacing.xs}
      style={({ pressed }) => [styles.button, { borderColor: color }, pressed && styles.pressed]}
    >
      <AppText variant="caption" color={color} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontWeight: '700',
  },
});
