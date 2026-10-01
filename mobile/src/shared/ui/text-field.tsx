import type { Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, fontSize, radius, spacing } from '@/shared/theme';
import { AppText } from './app-text';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  ref?: Ref<TextInput>;
}

export function TextField({ label, error, style, ref, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <TextInput
        ref={ref}
        accessibilityLabel={label ?? inputProps.placeholder}
        placeholderTextColor={colors.placeholder}
        style={[styles.input, error ? styles.inputWithError : null, style]}
        {...inputProps}
      />
      {error ? (
        <AppText variant="caption" color={colors.dangerText} accessibilityLiveRegion="polite">
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
  input: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
  },
  inputWithError: {
    borderColor: colors.danger,
  },
});
