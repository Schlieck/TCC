import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { errorMessage } from '@/shared/errors';
import { colors, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/form-error';
import { LinkButton } from '@/shared/ui/link-button';
import { Screen } from '@/shared/ui/screen';
import { resendVerification } from '../api';
import { useAuth } from '../auth-context';

type Busy = 'checking' | 'resending' | null;

/** Enquanto o e-mail não for confirmado, esta é a única tela disponível. */
export function VerifyEmailScreen() {
  const { email, refresh, signOut } = useAuth();
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(kind: Exclude<Busy, null>, task: () => Promise<void>) {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      await task();
    } catch (taskError) {
      setError(errorMessage(taskError));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen scroll style={styles.container}>
      <AppText variant="title" accessibilityRole="header">
        Confirme seu e-mail
      </AppText>
      <AppText>
        Enviamos um link de confirmação para {email}. Abra o e-mail, toque no link e depois volte
        aqui e toque em &quot;Já confirmei&quot;.
      </AppText>
      <AppText variant="caption">Não chegou? Confira a caixa de spam ou peça outro e-mail.</AppText>

      {error ? <FormError message={error} /> : null}
      {notice ? (
        <AppText color={colors.success} accessibilityLiveRegion="polite">
          {notice}
        </AppText>
      ) : null}

      <Button
        label="Já confirmei"
        loading={busy === 'checking'}
        onPress={() =>
          void run('checking', async () => {
            await refresh();
            // Se a confirmação valeu, esta tela some; se continua aqui, o link ainda não foi aberto.
            setNotice(
              'Ainda não recebemos a confirmação. Toque no link do e-mail e tente de novo.',
            );
          })
        }
      />
      <Button
        label="Reenviar e-mail"
        loading={busy === 'resending'}
        onPress={() =>
          void run('resending', async () => {
            await resendVerification();
            setNotice(`Enviamos um novo link para ${email ?? 'o seu e-mail'}.`);
          })
        }
      />
      <LinkButton label="Sair" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
});
