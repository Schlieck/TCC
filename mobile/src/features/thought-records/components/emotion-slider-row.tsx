import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, emotionColor, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import type { Emotion } from '../api';

interface EmotionSliderRowProps {
  emotion?: Emotion;
  intensity: number;
  onChange: (intensity: number) => void;
  onRemove: () => void;
}

export function EmotionSliderRow({
  emotion,
  intensity,
  onChange,
  onRemove,
}: EmotionSliderRowProps) {
  // Valor local enquanto arrasta; o formulário só recebe o valor final.
  const [displayed, setDisplayed] = useState(intensity);
  const name = emotion?.name ?? 'Sentimento';
  const color = emotionColor(emotion?.slug);

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <AppText variant="label" color={colors.text} style={styles.name}>
          {name}
        </AppText>
        <AppText variant="label">{displayed}%</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover ${name}`}
          hitSlop={spacing.sm}
          onPress={onRemove}
        >
          <Ionicons name="close-circle" size={22} color={colors.textMuted} />
        </Pressable>
      </View>
      <Slider
        accessibilityLabel={`Intensidade de ${name}`}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={intensity}
        onValueChange={(value) => {
          setDisplayed(Math.round(value));
        }}
        onSlidingComplete={(value) => {
          onChange(Math.round(value));
        }}
        minimumTrackTintColor={color}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    flex: 1,
  },
});
