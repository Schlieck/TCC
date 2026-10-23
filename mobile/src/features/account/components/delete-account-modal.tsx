import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/shared/errors';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { notify } from '@/shared/ui/confirm';
import { LinkButton } from '@/shared/ui/link-button';
import { TextField } from '@/shared/ui/text-field';
import { useDeleteAccount } from '../hooks/use-profile';
import { currentPasswordField } from '../validation';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

/** RF004: aviso de exclusão permanente e confirmação com a senha atual. */
export function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
  const deleteAccount = useDeleteAccount();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function close() {
    setPassword('');
    setError(null);
    onClose();
  }

  async function confirmDeletion() {
    const parsed = currentPasswordField.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Informe a senha atual.');
      return;
    }
    setError(null);
    try {
      // Ao excluir a conta, o Firebase encerra a sessão e o app volta para o login.
      await deleteAccount.mutateAsync(parsed.data);
      close();
      notify('Conta excluída', 'Sua conta e todos os seus registros foram apagados.');
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <AppText variant="subtitle" color={colors.dangerText}>
            Encerrar uso do aplicativo
          </AppText>
          <AppText>
            Sua conta e todos os seus dados no Shifty (registros de pensamento, cartões de
            enfrentamento e relatórios) serão apagados de forma permanente e não poderão ser
            recuperados.
          </AppText>
          <AppText variant="caption">Para confirmar, digite sua senha atual.</AppText>
          <TextField
            label="Senha atual"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            error={error ?? undefined}
          />
          <Button
            label="Excluir definitivamente"
            variant="danger"
            loading={deleteAccount.isPending}
            onPress={() => void confirmDeletion()}
          />
          <LinkButton label="Mudei de ideia" onPress={close} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.overlay,
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.danger,
  },
});
