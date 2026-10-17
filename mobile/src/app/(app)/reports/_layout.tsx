import { TabStack } from '@/shared/ui/tab-stack';

// Ao abrir uma tela interna de outra aba com `withAnchor: true`, o menu fica embaixo na pilha.
export const unstable_settings = { initialRouteName: 'index' };

export default function TabStackLayout() {
  return <TabStack />;
}
