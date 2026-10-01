import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { errorMessage } from '@/shared/api/errors';
import { applyApiError } from '@/shared/forms/apply-api-error';
import { FormTextField } from '@/shared/forms/form-text-field';
import { spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/form-error';
import { LinkButton } from '@/shared/ui/link-button';
import { Screen } from '@/shared/ui/screen';
import { requestPasswordReset, resetPassword } from '../api';
import { useAuth } from '../auth-context';
import {
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
} from '../validation';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <Screen scroll style={styles.container}>
      <AppText variant="title" accessibilityRole="header">
        Esqueci a senha
      </AppText>
      {email === null ? (
        <EmailStep onCodeSent={setEmail} />
      ) : (
        <ResetStep
          email={email}
          onChangeEmail={() => {
            setEmail(null);
          }}
        />
      )}
      <LinkButton
        label="Voltar para o login"
        onPress={() => {
          router.back();
        }}
      />
    </Screen>
  );
}

function EmailStep({ onCodeSent }: { onCodeSent: (email: string) => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' },
  });

  const submit = handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      await requestPasswordReset(email);
      onCodeSent(email);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <View style={styles.step}>
      <AppText>
        Informe o e-mail da sua conta. Vamos enviar um código para criar uma nova senha.
      </AppText>
      <FormTextField
        control={control}
        name="email"
        label="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      {formError ? <FormError message={formError} /> : null}
      <Button
        label="Enviar código"
        onPress={() => void submit()}
        loading={formState.isSubmitting}
      />
    </View>
  );
}

function ResetStep({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const { signIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const { control, handleSubmit, setError, formState } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { code: '', newPassword: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async ({ code, newPassword }) => {
    setFormError(null);
    try {
      await signIn(await resetPassword({ email, code, newPassword }));
    } catch (error) {
      setFormError(applyApiError(error, setError, ['code', 'newPassword']));
    }
  });

  async function resend() {
    setFormError(null);
    try {
      await requestPasswordReset(email);
      setResent(true);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  return (
    <View style={styles.step}>
      <AppText>
        Se existir uma conta com {email}, enviamos um código de 6 números. Ele vale por 15 minutos.
      </AppText>
      <FormTextField
        control={control}
        name="code"
        label="Código"
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
      />
      <FormTextField
        control={control}
        name="newPassword"
        label="Nova senha"
        secureTextEntry
        autoComplete="new-password"
        placeholder="Mínimo de 8 caracteres, com letras e números"
      />
      <FormTextField
        control={control}
        name="confirmPassword"
        label="Confirme a nova senha"
        secureTextEntry
        autoComplete="new-password"
      />
      {formError ? <FormError message={formError} /> : null}
      {resent ? <AppText variant="caption">Enviamos um novo código.</AppText> : null}
      <Button
        label="Criar nova senha"
        onPress={() => void submit()}
        loading={formState.isSubmitting}
      />
      <View style={styles.links}>
        <LinkButton label="Reenviar código" onPress={() => void resend()} />
        <LinkButton label="Usar outro e-mail" onPress={onChangeEmail} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
  step: {
    gap: spacing.md,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
