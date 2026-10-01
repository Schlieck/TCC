import { router } from 'expo-router';
import { MenuScreen } from '@/shared/ui/menu-screen';

export function CopingCardsMenuScreen() {
  return (
    <MenuScreen
      title="Cartões de enfrentamento"
      items={[
        {
          label: 'O que são?',
          onPress: () => {
            router.navigate('/education');
          },
        },
        {
          label: 'Criar novo cartão',
          onPress: () => {
            router.push('/coping-cards/new');
          },
        },
        {
          label: 'Ver seus cartões salvos',
          onPress: () => {
            router.push('/coping-cards/list');
          },
        },
      ]}
    />
  );
}
