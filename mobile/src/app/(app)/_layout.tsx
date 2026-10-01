import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { colors, fonts } from '@/shared/theme';
import { AppHeader } from '@/shared/ui/app-header';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(outline: IconName, filled: IconName) {
  return function TabIcon({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: ColorValue;
    size: number;
  }) {
    return <Ionicons name={focused ? filled : outline} color={color} size={size} />;
  };
}

/** Abas fixas na ordem dos mockups; a tela inicial fica fora da barra e abre pelo "Shifty". */
export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.primary, borderTopWidth: 0 },
        tabBarActiveBackgroundColor: colors.activeTab,
        tabBarActiveTintColor: colors.onPrimary,
        tabBarInactiveTintColor: colors.onPrimary,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null, title: 'Início' }} />
      <Tabs.Screen
        name="education"
        options={{ title: 'Aprender', tabBarIcon: tabIcon('book-outline', 'book') }}
      />
      <Tabs.Screen
        name="coping-cards"
        options={{ title: 'Cartões', tabBarIcon: tabIcon('albums-outline', 'albums') }}
      />
      <Tabs.Screen
        name="thought-records"
        options={{
          title: 'Registros',
          tabBarIcon: tabIcon('chatbubble-ellipses-outline', 'chatbubble-ellipses'),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: 'Relatórios', tabBarIcon: tabIcon('stats-chart-outline', 'stats-chart') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Ajustes', tabBarIcon: tabIcon('settings-outline', 'settings') }}
      />
    </Tabs>
  );
}
