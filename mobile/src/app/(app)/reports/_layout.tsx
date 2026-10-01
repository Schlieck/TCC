import { TabStack } from '@/shared/ui/tab-stack';

// Ao abrir uma tela interna direto (atalho da tela inicial), o menu fica embaixo na pilha.
export const unstable_settings = { initialRouteName: 'index' };

export default function TabStackLayout() {
  return <TabStack />;
}
