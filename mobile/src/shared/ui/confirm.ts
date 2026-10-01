import { Alert } from 'react-native';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
}

export function confirm({
  title,
  message,
  confirmLabel,
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            resolve(false);
          },
        },
        {
          text: confirmLabel,
          style: destructive ? 'destructive' : 'default',
          onPress: () => {
            resolve(true);
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          resolve(false);
        },
      },
    );
  });
}

export function notify(title: string, message: string): void {
  Alert.alert(title, message);
}
