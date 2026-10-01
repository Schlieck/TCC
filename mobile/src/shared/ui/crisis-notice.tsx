import { Linking, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radius, spacing } from '@/shared/theme';

function call(number: string) {
  void Linking.openURL(`tel:${number}`);
}

/** Aviso fixo: o app não substitui atendimento profissional. */
export function CrisisNotice() {
  return (
    <View style={styles.box} accessibilityRole="text">
      <Text style={styles.text}>
        O Shifty não substitui atendimento profissional. Em crise, ligue para o{' '}
        <Text
          style={styles.link}
          accessibilityRole="link"
          accessibilityHint="Liga para o Centro de Valorização da Vida"
          onPress={() => {
            call('188');
          }}
        >
          CVV (188)
        </Text>{' '}
        ou para o{' '}
        <Text
          style={styles.link}
          accessibilityRole="link"
          accessibilityHint="Liga para o SAMU"
          onPress={() => {
            call('192');
          }}
        >
          SAMU (192)
        </Text>
        .
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: fontSize.caption,
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    fontFamily: fonts.bold,
    textDecorationLine: 'underline',
  },
});
