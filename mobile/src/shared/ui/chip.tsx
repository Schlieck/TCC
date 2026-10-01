import { Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from './app-text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.idle,
        pressed && styles.pressed,
      ]}
    >
      <AppText variant="label" color={selected ? colors.onPrimary : colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  idle: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.7,
  },
});
