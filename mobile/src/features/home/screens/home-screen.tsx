import { router } from 'expo-router';
import { MenuScreen } from '@/shared/ui/menu-screen';

export function HomeScreen() {
  return (
    <MenuScreen
      title="Olá! Como você tem se sentido hoje?"
      items={[
        {
          label: 'Registrar pensamento',
          onPress: () => {
            router.navigate('/thought-records/new');
          },
        },
        {
          label: 'Cartões de enfrentamento',
          onPress: () => {
            router.navigate('/coping-cards');
          },
        },
        {
          label: 'Verificar o seu humor esse mês',
          onPress: () => {
            router.navigate('/reports');
          },
        },
      ]}
    />
  );
}
