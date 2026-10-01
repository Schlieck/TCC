import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/shared/theme';
import { AppText } from './app-text';

/** Cabeçalho fixo das abas: tocar em "Shifty" volta para a tela inicial. */
export function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Shifty"
        accessibilityHint="Volta para a tela inicial"
        hitSlop={spacing.md}
        onPress={() => {
          router.navigate('/');
        }}
      >
        <AppText variant="subtitle">Shifty</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
});
