import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { changePassword } from '@/features/auth/api';
import { applyFormError } from '@/shared/forms/apply-form-error';
import { FormTextField } from '@/shared/forms/form-text-field';
import { colors, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/form-error';
import { changePasswordFormSchema, type ChangePasswordFormValues } from '../validation';

const EMPTY: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function ChangePasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);
  const { control, handleSubmit, setError, reset, formState } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: EMPTY,
  });

  const submit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setFormError(null);
    setChanged(false);
    try {
      await changePassword({ currentPassword, newPassword });
      reset(EMPTY);
      setChanged(true);
    } catch (error) {
      setFormError(applyFormError(error, setError, ['currentPassword', 'newPassword']));
    }
  });

  return (
    <View style={styles.form}>
      <AppText variant="subtitle">Alterar senha</AppText>
      <FormTextField
        control={control}
        name="currentPassword"
        label="Senha atual:"
        secureTextEntry
        autoComplete="current-password"
      />
      <FormTextField
        control={control}
        name="newPassword"
        label="Nova senha:"
        secureTextEntry
        autoComplete="new-password"
        placeholder="Mínimo de 8 caracteres, com letras e números"
      />
      <FormTextField
        control={control}
        name="confirmPassword"
        label="Confirme a nova senha:"
        secureTextEntry
        autoComplete="new-password"
      />

      {formError ? <FormError message={formError} /> : null}
      {changed ? (
        <AppText variant="caption" color={colors.success} accessibilityLiveRegion="polite">
          Senha alterada. Outros aparelhos conectados precisarão entrar de novo.
        </AppText>
      ) : null}
      <Button
        label="Alterar senha"
        style={styles.submit}
        loading={formState.isSubmitting}
        onPress={() => void submit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  submit: {
    alignSelf: 'flex-end',
  },
});
