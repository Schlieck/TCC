import { TabStack } from '@/shared/ui/tab-stack';

// Ao abrir um tópico de outra aba com `withAnchor: true`, a grade de tópicos fica embaixo na pilha.
export const unstable_settings = { initialRouteName: 'index' };

export default function EducationLayout() {
  return <TabStack />;
}
