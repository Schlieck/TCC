import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { formatDate, fromIsoDate, fromTime, toIsoDate, toTime } from '@/shared/dates';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from './app-text';
import { LinkButton } from './link-button';

interface DateTimeFieldProps {
  mode: 'date' | 'time';
  /** `yyyy-MM-dd` para datas, `HH:mm` para horários. */
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  maximumDate?: Date;
}

export function DateTimeField({
  mode,
  value,
  onChange,
  label,
  error,
  maximumDate,
}: DateTimeFieldProps) {
  const [showInline, setShowInline] = useState(false);
  const current = mode === 'date' ? fromIsoDate(value) : fromTime(value);
  const display = mode === 'date' ? formatDate(value) : value;

  function emit(date: Date) {
    onChange(mode === 'date' ? toIsoDate(date) : toTime(date));
  }

  function open() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode,
        is24Hour: true,
        maximumDate,
        onValueChange: (_event, date) => {
          emit(date);
        },
      });
    } else {
      setShowInline(true);
    }
  }

  return (
    <View style={styles.container}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label ?? ''} ${display}`.trim()}
        accessibilityHint={mode === 'date' ? 'Abre o calendário' : 'Abre o relógio'}
        onPress={open}
        style={[styles.field, error ? styles.fieldWithError : null]}
      >
        <AppText color={colors.onPrimary} style={styles.value}>
          {display}
        </AppText>
      </Pressable>
      {showInline ? (
        <View>
          <DateTimePicker
            value={current}
            mode={mode}
            display="spinner"
            is24Hour
            maximumDate={maximumDate}
            textColor={colors.text}
            onValueChange={(_event, date) => {
              emit(date);
            }}
          />
          <LinkButton
            label="Concluir"
            onPress={() => {
              setShowInline(false);
            }}
          />
        </View>
      ) : null}
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
    gap: spacing.xs,
  },
  field: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  fieldWithError: {
    borderColor: colors.danger,
  },
  value: {
    fontWeight: '600',
  },
});
