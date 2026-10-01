import { StyleSheet, View } from 'react-native';
import { colors, emotionColor, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import type { Emotion } from '../api';

export function EmotionBadge({ emotion, intensity }: { emotion?: Emotion; intensity: number }) {
  const color = emotionColor(emotion?.slug);

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="caption" color={colors.text}>
        {emotion?.name ?? 'Sentimento'} {intensity}%
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
