import { Pressable, StyleSheet, View } from 'react-native';
import { formatDate } from '@/shared/dates';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import type { Emotion, ThoughtRecord } from '../api';
import { EmotionBadge } from './emotion-badge';

interface ThoughtRecordItemProps {
  record: ThoughtRecord;
  emotionsById: Map<number, Emotion>;
  onPress: () => void;
}

export function ThoughtRecordItem({ record, emotionsById, onPress }: ThoughtRecordItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Abre o registro completo"
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <AppText variant="subtitle" style={styles.title} numberOfLines={1}>
          {record.title}
        </AppText>
        <AppText variant="caption">
          {formatDate(record.date)} · {record.time}
        </AppText>
      </View>
      <AppText numberOfLines={2}>{record.description}</AppText>
      <View style={styles.badges}>
        {record.emotions.map((entry) => (
          <EmotionBadge
            key={entry.emotionId}
            emotion={emotionsById.get(entry.emotionId)}
            intensity={entry.intensity}
          />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    gap: 2,
  },
  title: {
    flexShrink: 1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
