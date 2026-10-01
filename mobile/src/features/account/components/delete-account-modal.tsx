import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useAuth } from '@/features/auth/auth-context';
import { errorMessage } from '@/shared/api/errors';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { notify } from '@/shared/ui/confirm';
import { LinkButton } from '@/shared/ui/link-button';
import { TextField } from '@/shared/ui/text-field';
import { useConfirmAccountDeletion, useRequestAccountDeletion } from '../hooks/use-profile';
import { deletionCodeSchema } from '../validation';

type Step = 'warning' | 'code';

interface DeleteAccountModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
}

/** RF004: aviso de exclusão permanente → código enviado por e-mail → exclusão definitiva. */
export function DeleteAccountModal({ visible, email, onClose }: DeleteAccountModalProps) {
  const { signOut } = useAuth();
  const requestDeletion = useRequestAccountDeletion();
  const confirmDeletion = useConfirmAccountDeletion();
  const [step, setStep] = useState<Step>('warning');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep('warning');
    setCode('');
    setError(null);
  }

  function close() {
    reset();
    onClose();
  }

  async function sendCode() {
    setError(null);
    try {
      await requestDeletion.mutateAsync();
      setStep('code');
    } catch (sendError) {
      setError(errorMessage(sendError));
    }
  }

  async function deleteAccount() {
    const parsed = deletionCodeSchema.safeParse(code.trim());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Código inválido.');
      return;
    }
    setError(null);
    try {
      await confirmDeletion.mutateAsync(parsed.data);
      close();
      await signOut();
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

          {step === 'warning' ? (
            <>
              <AppText>
                Sua conta e todos os seus dados no Shifty (registros de pensamento, cartões de
                enfrentamento e relatórios) serão apagados de forma permanente e não poderão ser
                recuperados.
              </AppText>
              <AppText variant="caption">
                Para confirmar, vamos enviar um código para {email}.
              </AppText>
              {error ? <AppText color={colors.dangerText}>{error}</AppText> : null}
              <Button
                label="Confirmar a exclusão"
                variant="danger"
                loading={requestDeletion.isPending}
                onPress={() => void sendCode()}
              />
            </>
          ) : (
            <>
              <AppText>
                Enviamos um código de 6 números para {email}. Ele vale por 15 minutos.
              </AppText>
              <TextField
                label="Código de confirmação"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                error={error ?? undefined}
                autoFocus
              />
              <Button
                label="Excluir definitivamente"
                variant="danger"
                loading={confirmDeletion.isPending}
                onPress={() => void deleteAccount()}
              />
              <LinkButton label="Reenviar código" onPress={() => void sendCode()} />
            </>
          )}

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
