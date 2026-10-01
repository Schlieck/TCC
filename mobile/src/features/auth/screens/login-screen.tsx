import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { applyApiError } from '@/shared/forms/apply-api-error';
import { FormTextField } from '@/shared/forms/form-text-field';
import { spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/form-error';
import { LinkButton } from '@/shared/ui/link-button';
import { Screen } from '@/shared/ui/screen';
import { logIn } from '../api';
import { useAuth } from '../auth-context';
import { logInFormSchema, type LogInFormValues } from '../validation';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<LogInFormValues>({
    resolver: zodResolver(logInFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signIn(await logIn(values));
    } catch (error) {
      setFormError(applyApiError(error, setError, ['email', 'password']));
    }
  });

  return (
    <Screen scroll style={styles.container}>
      <AppText variant="display" style={styles.brand} accessibilityRole="header">
        Shifty
      </AppText>

      <View style={styles.form}>
        <FormTextField
          control={control}
          name="email"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <FormTextField
          control={control}
          name="password"
          placeholder="Senha"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => void submit()}
        />
        {formError ? <FormError message={formError} /> : null}
        <Button label="Entrar" onPress={() => void submit()} loading={formState.isSubmitting} />
      </View>

      <View style={styles.links}>
        <LinkButton
          label="Não possui login? Cadastre-se"
          onPress={() => {
            router.push('/register');
          }}
        />
        <LinkButton
          label="Esqueci a senha :("
          onPress={() => {
            router.push('/forgot-password');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
  brand: {
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  links: {
    gap: spacing.xs,
  },
});
