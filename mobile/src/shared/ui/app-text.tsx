import type { ReactNode } from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { colors, fonts, fontSize } from '@/shared/theme';

export type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'label' | 'caption';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  children: ReactNode;
}

export function AppText({ variant = 'body', color, style, children, ...props }: AppTextProps) {
  return (
    <Text style={[variants[variant], color ? { color } : null, style]} {...props}>
      {children}
    </Text>
  );
}

const variants = StyleSheet.create<Record<TextVariant, TextStyle>>({
  display: {
    color: colors.primary,
    fontFamily: fonts.extrabold,
    fontSize: fontSize.display,
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.extrabold,
    fontSize: fontSize.title,
  },
  subtitle: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: fontSize.subtitle,
  },
  body: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  label: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: fontSize.body,
  },
  caption: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: fontSize.caption,
  },
});
