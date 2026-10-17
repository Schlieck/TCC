import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Chip } from '@/shared/ui/chip';
import { ErrorState } from '@/shared/ui/states';
import type { EmotionIntensity } from '../api';
import { useEmotions } from '../hooks/use-emotions';
import { EmotionSliderRow } from './emotion-slider-row';

const DEFAULT_INTENSITY = 50;

interface EmotionIntensityEditorProps {
  value: EmotionIntensity[];
  onChange: (value: EmotionIntensity[]) => void;
  error?: string;
}

/** Uma escala de 0 a 100% para cada sentimento presente no evento (RF002). */
export function EmotionIntensityEditor({ value, onChange, error }: EmotionIntensityEditorProps) {
  const emotions = useEmotions();
  const byId = new Map(emotions.data?.map((emotion) => [emotion.id, emotion]));
  const selected = new Set(value.map((entry) => entry.emotionId));
  const available = emotions.data?.filter((emotion) => !selected.has(emotion.id)) ?? [];

  function updateIntensity(emotionId: number, intensity: number) {
    onChange(
      value.map((entry) => (entry.emotionId === emotionId ? { emotionId, intensity } : entry)),
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant="label">Sentimentos</AppText>
      <AppText variant="caption">
        Toque nos sentimentos que você teve e indique a intensidade de cada um, de 0 a 100%.
      </AppText>

      {value.map((entry) => (
        <EmotionSliderRow
          key={entry.emotionId}
          emotion={byId.get(entry.emotionId)}
          intensity={entry.intensity}
          onChange={(intensity) => {
            updateIntensity(entry.emotionId, intensity);
          }}
          onRemove={() => {
            onChange(value.filter((other) => other.emotionId !== entry.emotionId));
          }}
        />
      ))}

      {emotions.isPending ? (
        <ActivityIndicator color={colors.primary} />
      ) : emotions.isError ? (
        <ErrorState error={emotions.error} onRetry={() => void emotions.refetch()} />
      ) : (
        <View style={styles.chips}>
          {available.map((emotion) => (
            <Chip
              key={emotion.id}
              label={`+ ${emotion.name}`}
              onPress={() => {
                onChange([...value, { emotionId: emotion.id, intensity: DEFAULT_INTENSITY }]);
              }}
            />
          ))}
        </View>
      )}

      {error ? (
        <AppText variant="caption" color={colors.dangerText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
