import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { errorMessage } from '@/shared/api/errors';
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
import { confirmRegistration, register } from '../api';
import { useAuth } from '../auth-context';
import { PRIVACY_CONSENT_TEXT } from '../privacy-consent';
import {
  registerFormSchema,
  registrationCodeFormSchema,
  toRegisterRequest,
  type RegisterFormValues,
  type RegistrationCodeFormValues,
} from '../validation';

const API_FIELDS = [
  'name',
  'email',
  'password',
  'phone',
  'birthDate',
  'acceptedPrivacyTerms',
] as const;

const EMPTY_FORM: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  birthDate: '',
  acceptedPrivacyTerms: false,
};

/** RF001 em dois passos: os dados e, depois, o código enviado ao e-mail. */
export function RegisterScreen() {
  const [values, setValues] = useState(EMPTY_FORM);
  const [codeSent, setCodeSent] = useState(false);

  return (
    <Screen scroll style={styles.container}>
      <AppText variant="title" accessibilityRole="header">
        Criar conta
      </AppText>
      {codeSent ? (
        <CodeStep
          values={values}
          onEdit={() => {
            setCodeSent(false);
          }}
        />
      ) : (
        <DataStep
          initialValues={values}
          onCodeSent={(sent) => {
            setValues(sent);
            setCodeSent(true);
          }}
        />
      )}
      <LinkButton
        label="Já tenho conta. Entrar"
        onPress={() => {
          router.back();
        }}
      />
    </Screen>
  );
}

interface DataStepProps {
  initialValues: RegisterFormValues;
  onCodeSent: (values: RegisterFormValues) => void;
}

function DataStep({ initialValues, onCodeSent }: DataStepProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: initialValues,
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await register(toRegisterRequest(values));
      onCodeSent(values);
    } catch (error) {
      setFormError(applyApiError(error, setError, API_FIELDS));
    }
  });

  return (
    <View style={styles.step}>
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
      </View>
    </View>
  );
}

function CodeStep({ values, onEdit }: { values: RegisterFormValues; onEdit: () => void }) {
  const { signIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const { control, handleSubmit, setError, formState } = useForm<RegistrationCodeFormValues>({
    resolver: zodResolver(registrationCodeFormSchema),
    defaultValues: { code: '' },
  });

  const submit = handleSubmit(async ({ code }) => {
    setFormError(null);
    try {
      await signIn(await confirmRegistration({ email: values.email, code }));
    } catch (error) {
      setFormError(applyApiError(error, setError, ['code']));
    }
  });

  async function resend() {
    setFormError(null);
    try {
      await register(toRegisterRequest(values));
      setResent(true);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  return (
    <View style={styles.step}>
      <AppText>
        Enviamos um código de 6 números para {values.email}. Digite o código para criar a sua conta.
        Ele vale por 15 minutos.
      </AppText>
      <AppText variant="caption">
        Se esse e-mail já tiver uma conta, você vai receber um aviso em vez do código: entre com a
        sua senha ou use &quot;Esqueci a senha&quot;.
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
      {formError ? <FormError message={formError} /> : null}
      {resent ? <AppText variant="caption">Enviamos um novo código.</AppText> : null}
      <Button
        label="Confirmar cadastro"
        onPress={() => void submit()}
        loading={formState.isSubmitting}
      />
      <View style={styles.links}>
        <LinkButton label="Reenviar código" onPress={() => void resend()} />
        <LinkButton label="Corrigir dados" onPress={onEdit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  step: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
