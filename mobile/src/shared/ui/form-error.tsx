import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from './app-text';

export function FormError({ message }: { message: string }) {
  return (
    <View style={styles.box} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <AppText color={colors.dangerText}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
});
