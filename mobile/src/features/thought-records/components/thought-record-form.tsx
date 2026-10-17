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
import { DateTimeField } from '@/shared/ui/date-time-field';
import { FormError } from '@/shared/ui/form-error';
import { LinkButton } from '@/shared/ui/link-button';
import { useSaveThoughtRecord } from '../hooks/use-thought-records';
import { thoughtRecordFormSchema, type ThoughtRecordFormValues } from '../validation';
import { EmotionIntensityEditor } from './emotion-intensity-editor';

const API_FIELDS = ['title', 'date', 'time', 'description', 'emotions'] as const;

interface ThoughtRecordFormProps {
  recordId?: number;
  initialValues: ThoughtRecordFormValues;
  onSaved: () => void;
}

export function ThoughtRecordForm({ recordId, initialValues, onSaved }: ThoughtRecordFormProps) {
  const saveRecord = useSaveThoughtRecord(recordId);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm<ThoughtRecordFormValues>({
    resolver: zodResolver(thoughtRecordFormSchema),
    defaultValues: initialValues,
  });
  // Lido durante a renderização: o react-hook-form só atualiza isDirty quando ele é assinado.
  const { isDirty, isSubmitting } = formState;
  const { allowLeave } = useLeaveConfirmation(isDirty, {
    title: 'Descartar registro?',
    message: 'O que você escreveu não será salvo.',
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await saveRecord.mutateAsync(values);
      allowLeave();
      onSaved();
    } catch (error) {
      setFormError(applyApiError(error, setError, API_FIELDS));
    }
  });

  return (
    <View style={styles.form}>
      <FormTextField
        control={control}
        name="title"
        label="Título do registro"
        placeholder="Ex.: Reunião no trabalho"
        maxLength={120}
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <Controller
            control={control}
            name="date"
            render={({ field, fieldState }) => (
              <DateTimeField
                mode="date"
                label="Data"
                value={field.value}
                onChange={field.onChange}
                maximumDate={new Date()}
                error={fieldState.error?.message}
              />
            )}
          />
        </View>
        <View style={styles.half}>
          <Controller
            control={control}
            name="time"
            render={({ field, fieldState }) => (
              <DateTimeField
                mode="time"
                label="Horário"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </View>
      </View>
      <FormTextField
        control={control}
        name="description"
        label="Descrição"
        placeholder="O que aconteceu? O que passou pela sua cabeça? O que você fez?"
        multiline
        maxLength={5000}
        style={styles.description}
      />
      <Controller
        control={control}
        name="emotions"
        render={({ field, fieldState }) => (
          <EmotionIntensityEditor
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message ?? fieldState.error?.root?.message}
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  description: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
});
