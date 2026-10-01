import { Stack } from 'expo-router';
import { colors } from '@/shared/theme';

export default function CopingCardsLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    />
  );
}
