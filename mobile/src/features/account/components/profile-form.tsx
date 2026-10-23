import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { applyFormError } from '@/shared/forms/apply-form-error';
import { FormTextField } from '@/shared/forms/form-text-field';
import { formatDateInput, formatPhone } from '@/shared/forms/masks';
import { colors, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/form-error';
import type { UserProfile } from '../api';
import { useUpdateProfile } from '../hooks/use-profile';
import {
  emailChanged,
  profileFormSchema,
  toProfileChanges,
  toProfileFormValues,
  type ProfileFormValues,
} from '../validation';

const FIELDS = ['name', 'email', 'phone', 'birthDate', 'currentPassword'] as const;

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const updateProfile = useUpdateProfile();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { control, handleSubmit, setError, reset, formState } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema(profile.email)),
    defaultValues: toProfileFormValues(profile),
  });
  const email = useWatch({ control, name: 'email' });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    setSaved(false);
    setPendingEmail(null);
    try {
      const updated = await updateProfile.mutateAsync(toProfileChanges(values));
      reset(toProfileFormValues(updated.profile));
      setSaved(true);
      setPendingEmail(updated.pendingEmail);
    } catch (error) {
      setFormError(applyFormError(error, setError, FIELDS));
    }
  });

  return (
    <View style={styles.form}>
      <FormTextField control={control} name="name" label="Nome:" autoComplete="name" />
      <FormTextField
        control={control}
        name="email"
        label="E-mail:"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      {emailChanged(email, profile.email) ? (
        <FormTextField
          control={control}
          name="currentPassword"
          label="Senha atual (para trocar o e-mail):"
          secureTextEntry
          autoComplete="current-password"
        />
      ) : null}
      <FormTextField
        control={control}
        name="phone"
        label="Telefone:"
        keyboardType="phone-pad"
        format={formatPhone}
      />
      <FormTextField
        control={control}
        name="birthDate"
        label="Data de nascimento:"
        keyboardType="number-pad"
        placeholder="DD/MM/AAAA"
        format={formatDateInput}
      />

      {formError ? <FormError message={formError} /> : null}
      {saved && !formState.isDirty ? (
        <AppText variant="caption" color={colors.success} accessibilityLiveRegion="polite">
          Alterações salvas.
        </AppText>
      ) : null}
      {pendingEmail && !formState.isDirty ? (
        <AppText variant="caption" color={colors.success} accessibilityLiveRegion="polite">
          Enviamos um link de confirmação para {pendingEmail}. O e-mail da conta só muda depois que
          você tocar nesse link; até lá, continue entrando com {profile.email}. Depois da troca, o
          app pede para você entrar de novo, já com o novo e-mail.
        </AppText>
      ) : null}
      <Button
        label="Salvar alterações"
        style={styles.submit}
        disabled={!formState.isDirty}
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
