import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { applyFormError } from '@/shared/forms/apply-form-error';
import { FormTextField } from '@/shared/forms/form-text-field';
import { colors, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/form-error';
import { LinkButton } from '@/shared/ui/link-button';
import { Screen } from '@/shared/ui/screen';
import { requestPasswordReset } from '../api';
import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from '../validation';

export function ForgotPasswordScreen() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' },
  });

  const submit = handleSubmit(async ({ email }) => {
    setFormError(null);
    setSentTo(null);
    try {
      await requestPasswordReset(email);
      setSentTo(email);
    } catch (error) {
      setFormError(applyFormError(error, setError, ['email']));
    }
  });

  return (
    <Screen scroll style={styles.container}>
      <AppText variant="title" accessibilityRole="header">
        Esqueci a senha
      </AppText>
      <AppText>
        Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.
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
      {sentTo ? (
        <AppText color={colors.success} accessibilityLiveRegion="polite">
          Se existir uma conta com {sentTo}, enviamos um link para criar uma nova senha. Confira
          também a caixa de spam. Depois de trocar a senha, entre com ela.
        </AppText>
      ) : null}
      <Button
        label={sentTo ? 'Enviar de novo' : 'Enviar link'}
        onPress={() => void submit()}
        loading={formState.isSubmitting}
      />
      <LinkButton
        label="Voltar para o login"
        onPress={() => {
          router.back();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
});
