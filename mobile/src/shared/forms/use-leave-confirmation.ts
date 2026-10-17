import { useNavigation } from 'expo-router';
import { useEffect, useRef } from 'react';
import { confirm } from '@/shared/ui/confirm';

interface LeaveConfirmationText {
  title: string;
  message: string;
}

/**
 * Pede confirmação antes de sair de um formulário com alterações não salvas, venha a saída
 * do voltar do Android, da seta da tela ou de um botão "Descartar" que chama `router.back()`.
 * Chame `allowLeave()` logo antes de navegar depois de salvar.
 */
export function useLeaveConfirmation(dirty: boolean, { title, message }: LeaveConfirmationText) {
  const navigation = useNavigation();
  const allowed = useRef(false);

  useEffect(() => {
    if (!dirty) {
      return undefined;
    }
    return navigation.addListener('beforeRemove', (event) => {
      if (allowed.current) {
        return;
      }
      event.preventDefault();
      void confirm({ title, message, confirmLabel: 'Descartar', destructive: true }).then(
        (leave) => {
          if (leave) {
            navigation.dispatch(event.data.action);
          }
        },
      );
    });
  }, [navigation, dirty, title, message]);

  return {
    allowLeave: () => {
      allowed.current = true;
    },
  };
}
