import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { TextField } from '@/shared/ui/text-field';

interface FormTextFieldProps<Values extends FieldValues> extends Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onBlur'
> {
  control: Control<Values>;
  name: Path<Values>;
  label?: string;
  /** Máscara aplicada a cada digitação (telefone, data). */
  format?: (text: string) => string;
}

export function FormTextField<Values extends FieldValues>({
  control,
  name,
  label,
  format,
  ...inputProps
}: FormTextFieldProps<Values>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          ref={field.ref}
          label={label}
          value={typeof field.value === 'string' ? field.value : ''}
          onChangeText={(text) => {
            field.onChange(format ? format(text) : text);
          }}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          {...inputProps}
        />
      )}
    />
  );
}
