import { TabStack } from '@/shared/ui/tab-stack';

// Ao abrir um tópico a partir de outra aba, a grade de tópicos fica embaixo na pilha.
export const unstable_settings = { initialRouteName: 'index' };

export default function EducationLayout() {
  return <TabStack />;
}
