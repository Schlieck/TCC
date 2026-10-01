import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Chip } from '@/shared/ui/chip';
import { DateTimeField } from '@/shared/ui/date-time-field';
import { PERIOD_KIND_LABELS, type PeriodKind, type ReportPeriod } from '../report-period';

const KINDS: PeriodKind[] = ['week', 'month', 'year', 'custom'];

interface PeriodSelectorProps {
  kind: PeriodKind;
  label: string;
  custom: ReportPeriod;
  canGoNext: boolean;
  onKindChange: (kind: PeriodKind) => void;
  onShift: (steps: number) => void;
  onCustomChange: (period: ReportPeriod) => void;
}

export function PeriodSelector({
  kind,
  label,
  custom,
  canGoNext,
  onKindChange,
  onShift,
  onCustomChange,
}: PeriodSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.kinds}>
        {KINDS.map((option) => (
          <Chip
            key={option}
            label={PERIOD_KIND_LABELS[option]}
            selected={option === kind}
            onPress={() => {
              onKindChange(option);
            }}
          />
        ))}
      </View>

      {kind === 'custom' ? (
        <View style={styles.customRow}>
          <View style={styles.half}>
            <DateTimeField
              mode="date"
              label="De"
              value={custom.from}
              onChange={(from) => {
                onCustomChange({ ...custom, from });
              }}
            />
          </View>
          <View style={styles.half}>
            <DateTimeField
              mode="date"
              label="Até"
              value={custom.to}
              onChange={(to) => {
                onCustomChange({ ...custom, to });
              }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.navigator}>
          <ArrowButton
            icon="chevron-back"
            label="Período anterior"
            onPress={() => {
              onShift(-1);
            }}
          />
          <AppText variant="label" style={styles.label} accessibilityLiveRegion="polite">
            {label}
          </AppText>
          <ArrowButton
            icon="chevron-forward"
            label="Próximo período"
            disabled={!canGoNext}
            onPress={() => {
              onShift(1);
            }}
          />
        </View>
      )}
    </View>
  );
}

interface ArrowButtonProps {
  icon: 'chevron-back' | 'chevron-forward';
  label: string;
  disabled?: boolean;
  onPress: () => void;
}

function ArrowButton({ icon, label, disabled = false, onPress }: ArrowButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={spacing.sm}
      onPress={onPress}
      style={disabled ? styles.disabled : null}
    >
      <Ionicons name={icon} size={28} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  kinds: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  navigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
  customRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
});
