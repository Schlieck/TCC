import { describe, expect, it } from 'vitest';
import {
  changePasswordFormSchema,
  newProfileSchema,
  profileSchema,
  profileFormSchema,
  toProfileChanges,
  toProfileFormValues,
} from './validation';

describe('profile form', () => {
  it('shows the stored profile formatted and sends it back normalized', () => {
    const values = toProfileFormValues({
      name: 'Ana Souza',
      email: 'ana@example.com',
      phone: '49999990000',
      birthDate: '1998-04-12',
    });

    expect(values).toEqual({
      name: 'Ana Souza',
      email: 'ana@example.com',
      phone: '(49) 99999-0000',
      birthDate: '12/04/1998',
      currentPassword: '',
    });
    expect(toProfileChanges(values)).toEqual({
      name: 'Ana Souza',
      email: 'ana@example.com',
      phone: '49999990000',
      birthDate: '1998-04-12',
    });
  });
});

describe('e-mail change', () => {
  const values = {
    name: 'Ana Souza',
    phone: '(49) 99999-0000',
    birthDate: '12/04/1998',
    currentPassword: '',
  };
  const schema = profileFormSchema('ana@example.com');

  it('asks for the current password only when the e-mail changes', () => {
    expect(schema.safeParse({ ...values, email: ' Ana@Example.com' }).success).toBe(true);

    const changed = schema.safeParse({ ...values, email: 'ana.lima@example.com' });
    expect(changed.success ? [] : changed.error.issues.map((issue) => issue.path[0])).toEqual([
      'currentPassword',
    ]);

    const withPassword = { ...values, email: 'ana.lima@example.com', currentPassword: 'x' };
    expect(schema.safeParse(withPassword).success).toBe(true);
    expect(toProfileChanges(withPassword)).toMatchObject({ currentPassword: 'x' });
  });
});

describe('change password form', () => {
  it('requires the confirmation to match the new password', () => {
    const result = changePasswordFormSchema.safeParse({
      currentPassword: 'segredo123',
      newPassword: 'novasenha1',
      confirmPassword: 'novasenha2',
    });

    expect(result.success ? [] : result.error.issues.map((issue) => issue.path[0])).toEqual([
      'confirmPassword',
    ]);
  });
});

describe('stored profile', () => {
  const profile = { name: '  Ana   Souza ', phone: '49999990000', birthDate: '1998-04-12' };

  it('collapses spaces in the name', () => {
    expect(profileSchema.parse(profile).name).toBe('Ana Souza');
  });

  it('rejects a formatted phone and a birth date that is not in the past', () => {
    expect(profileSchema.safeParse({ ...profile, phone: '(49) 99999-0000' }).success).toBe(false);
    expect(profileSchema.safeParse({ ...profile, birthDate: '2999-01-01' }).success).toBe(false);
    expect(profileSchema.safeParse({ ...profile, birthDate: '1899-12-31' }).success).toBe(false);
  });

  it('requires the privacy consent for a new profile', () => {
    expect(newProfileSchema.safeParse({ ...profile, acceptedPrivacyTerms: false }).success).toBe(
      false,
    );
    expect(newProfileSchema.safeParse({ ...profile, acceptedPrivacyTerms: true }).success).toBe(
      true,
    );
  });
});
