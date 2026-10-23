import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { createProfile } from '@/features/account/api';
import { requireUid } from '@/shared/firebase/app';
import { applyFormError } from '@/shared/forms/apply-form-error';
import { FormTextField } from '@/shared/forms/form-text-field';
import { formatDateInput, formatPhone } from '@/shared/forms/masks';
import { spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/form-error';
import { LinkButton } from '@/shared/ui/link-button';
import { Screen } from '@/shared/ui/screen';
import { useAuth } from '../auth-context';
import { PrivacyConsentField } from '../components/privacy-consent-field';
import {
  completeProfileFormSchema,
  toNewProfileInput,
  type CompleteProfileFormValues,
} from '../validation';

const FIELDS = ['name', 'phone', 'birthDate', 'acceptedPrivacyTerms'] as const;

/** A conta já existe, mas o perfil fica só no aparelho: em outro celular é preciso refazê-lo. */
export function CompleteProfileScreen() {
  const { email, refresh, signOut } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileFormSchema),
    defaultValues: { name: '', phone: '', birthDate: '', acceptedPrivacyTerms: false },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createProfile(requireUid(), toNewProfileInput(values));
      await refresh();
    } catch (error) {
      setFormError(applyFormError(error, setError, FIELDS));
    }
  });

  return (
    <Screen scroll style={styles.container}>
      <AppText variant="title" accessibilityRole="header">
        Complete seu cadastro
      </AppText>
      <AppText>
        Você entrou como {email}. Seus dados e registros ficam só no aparelho em que foram criados;
        para usar o Shifty neste aparelho, preencha seus dados.
      </AppText>
      <FormTextField control={control} name="name" label="Nome" autoComplete="name" />
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
        <Button label="Continuar" onPress={() => void submit()} loading={formState.isSubmitting} />
      </View>
      <LinkButton label="Sair" onPress={() => void signOut()} />
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
