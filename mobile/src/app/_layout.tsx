import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { apiConfig } from '@/shared/config/api-config';
import { colors } from '@/shared/theme';
import { ConfigErrorScreen } from '@/shared/ui/config-error-screen';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  if (!apiConfig.ok) {
    return <ConfigErrorScreen message={apiConfig.message} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </QueryClientProvider>
  );
}
