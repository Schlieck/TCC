import { Stack } from 'expo-router';
import { colors } from '@/shared/theme';

/** Pilha de telas dentro de uma aba; cada tela desenha o próprio título. */
export function TabStack() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    />
  );
}
