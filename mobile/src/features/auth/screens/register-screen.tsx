import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { applyApiError } from '@/shared/forms/apply-api-error';
import { FormTextField } from '@/shared/forms/form-text-field';
import { formatDateInput, formatPhone } from '@/shared/forms/masks';
import { spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { FormError } from '@/shared/ui/form-error';
import { LinkButton } from '@/shared/ui/link-button';
import { Screen } from '@/shared/ui/screen';
import { register } from '../api';
import { useAuth } from '../auth-context';
import { PRIVACY_CONSENT_TEXT } from '../privacy-consent';
import { registerFormSchema, toRegisterRequest, type RegisterFormValues } from '../validation';

const API_FIELDS = [
  'name',
  'email',
  'password',
  'phone',
  'birthDate',
  'acceptedPrivacyTerms',
] as const;

export function RegisterScreen() {
  const { signIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      birthDate: '',
      acceptedPrivacyTerms: false,
    },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signIn(await register(toRegisterRequest(values)));
    } catch (error) {
      setFormError(applyApiError(error, setError, API_FIELDS));
    }
  });

  return (
    <Screen scroll style={styles.container}>
      <AppText variant="title" accessibilityRole="header">
        Criar conta
      </AppText>

      <FormTextField control={control} name="name" label="Nome" autoComplete="name" />
      <FormTextField
        control={control}
        name="email"
        label="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <FormTextField
        control={control}
        name="password"
        label="Senha"
        secureTextEntry
        autoComplete="new-password"
        placeholder="Mínimo de 8 caracteres, com letras e números"
      />
      <FormTextField
        control={control}
        name="confirmPassword"
        label="Confirme a senha"
        secureTextEntry
        autoComplete="new-password"
      />
      <FormTextField
        control={control}
        name="phone"
        label="Telefone"
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="(49) 99999-0000"
        format={formatPhone}
      />
      <FormTextField
        control={control}
        name="birthDate"
        label="Data de nascimento"
        keyboardType="number-pad"
        placeholder="DD/MM/AAAA"
        format={formatDateInput}
      />

      <Controller
        control={control}
        name="acceptedPrivacyTerms"
        render={({ field, fieldState }) => (
          <Checkbox
            checked={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          >
            <AppText variant="caption">{PRIVACY_CONSENT_TEXT}</AppText>
          </Checkbox>
        )}
      />

      <View style={styles.actions}>
        {formError ? <FormError message={formError} /> : null}
        <Button
          label="Criar conta"
          onPress={() => void submit()}
          loading={formState.isSubmitting}
        />
        <LinkButton
          label="Já tenho conta. Entrar"
          onPress={() => {
            router.back();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
