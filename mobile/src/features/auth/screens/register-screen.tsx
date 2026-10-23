import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { applyFormError } from '@/shared/forms/apply-form-error';
import { FormTextField } from '@/shared/forms/form-text-field';
import { formatDateInput, formatPhone } from '@/shared/forms/masks';
import { spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/form-error';
import { LinkButton } from '@/shared/ui/link-button';
import { Screen } from '@/shared/ui/screen';
import { register } from '../api';
import { PrivacyConsentField } from '../components/privacy-consent-field';
import { registerFormSchema, toRegisterRequest, type RegisterFormValues } from '../validation';

const FIELDS = ['name', 'email', 'password', 'phone', 'birthDate', 'acceptedPrivacyTerms'] as const;

/** RF001. Depois de criar a conta, o app mostra a tela de confirmação do e-mail. */
export function RegisterScreen() {
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
      await register(toRegisterRequest(values));
    } catch (error) {
      setFormError(applyFormError(error, setError, FIELDS));
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
      <PrivacyConsentField control={control} name="acceptedPrivacyTerms" />

      <View style={styles.actions}>
        {formError ? <FormError message={formError} /> : null}
        <Button
          label="Criar conta"
          onPress={() => void submit()}
          loading={formState.isSubmitting}
        />
      </View>
      <LinkButton
        label="Já tenho conta. Entrar"
        onPress={() => {
          router.back();
        }}
      />
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
