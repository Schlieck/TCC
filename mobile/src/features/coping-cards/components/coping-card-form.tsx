import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { applyApiError } from '@/shared/forms/apply-api-error';
import { FormTextField } from '@/shared/forms/form-text-field';
import { useLeaveConfirmation } from '@/shared/forms/use-leave-confirmation';
import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/form-error';
import { LinkButton } from '@/shared/ui/link-button';
import { useSaveCard } from '../hooks/use-coping-cards';
import { copingCardFormSchema, type CopingCardFormValues } from '../validation';
import { GroupPicker } from './group-picker';

interface CopingCardFormProps {
  cardId?: number;
  initialValues: CopingCardFormValues;
  onSaved: () => void;
}

export function CopingCardForm({ cardId, initialValues, onSaved }: CopingCardFormProps) {
  const saveCard = useSaveCard(cardId);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<CopingCardFormValues>({
    resolver: zodResolver(copingCardFormSchema),
    defaultValues: initialValues,
  });
  // Lido durante a renderização: o react-hook-form só atualiza isDirty quando ele é assinado.
  const { isDirty, isSubmitting } = formState;
  const { allowLeave } = useLeaveConfirmation(isDirty, {
    title: 'Descartar cartão?',
    message: 'O que você escreveu não será salvo.',
  });

  const submit = handleSubmit(async ({ name, description, groupId }) => {
    if (groupId === null) {
      return;
    }
    setFormError(null);
    try {
      await saveCard.mutateAsync({ name, description, groupId });
      allowLeave();
      onSaved();
    } catch (error) {
      setFormError(applyApiError(error, setError, ['name', 'description', 'groupId']));
    }
  });

  return (
    <View style={styles.form}>
      <FormTextField control={control} name="name" label="Nome do cartão" maxLength={100} />
      <FormTextField
        control={control}
        name="description"
        label="Descrição do cartão"
        placeholder="Ex.: Você não é seu pensamento. Quais são as evidências dessa crença?"
        multiline
        maxLength={1000}
        style={styles.description}
      />
      <Controller
        control={control}
        name="groupId"
        render={({ field, fieldState }) => (
          <GroupPicker
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      {formError ? <FormError message={formError} /> : null}
      <Button label="Salvar" onPress={() => void submit()} loading={isSubmitting} />
      <LinkButton
        label="Descartar"
        onPress={() => {
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  description: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
