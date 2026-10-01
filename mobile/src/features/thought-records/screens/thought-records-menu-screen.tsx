import { router } from 'expo-router';
import { MenuScreen } from '@/shared/ui/menu-screen';

export function ThoughtRecordsMenuScreen() {
  return (
    <MenuScreen
      title="Registro de pensamento"
      items={[
        {
          label: 'O que é e pra que serve?',
          onPress: () => {
            router.navigate({
              pathname: '/education/[topic]',
              params: { topic: 'thought-records' },
            });
          },
        },
        {
          label: 'Fazer novo registro',
          onPress: () => {
            router.push('/thought-records/new');
          },
        },
        {
          label: 'Verificar seus registros',
          onPress: () => {
            router.push('/thought-records/list');
          },
        },
      ]}
    />
  );
}
