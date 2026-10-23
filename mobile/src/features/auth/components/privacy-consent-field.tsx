import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { AppText } from '@/shared/ui/app-text';
import { Checkbox } from '@/shared/ui/checkbox';
import { PRIVACY_CONSENT_TEXT } from '../privacy-consent';

interface PrivacyConsentFieldProps<Values extends FieldValues> {
  control: Control<Values>;
  name: Path<Values>;
}

export function PrivacyConsentField<Values extends FieldValues>({
  control,
  name,
}: PrivacyConsentFieldProps<Values>) {
  return (
    <Controller
      control={control}
      name={name}
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
  );
}
