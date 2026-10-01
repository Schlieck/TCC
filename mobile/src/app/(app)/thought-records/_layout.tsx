import { Stack } from 'expo-router';
import { colors } from '@/shared/theme';

// Ao abrir uma tela interna direto (atalho da tela inicial), o menu fica embaixo na pilha.
export const unstable_settings = { initialRouteName: 'index' };

export default function TabStackLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    />
  );
}
