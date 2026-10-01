import { describe, expect, it } from 'vitest';
import {
  changePasswordFormSchema,
  deletionCodeSchema,
  toProfileChanges,
  toProfileFormValues,
} from './validation';

describe('profile form', () => {
  it('shows the stored profile formatted and sends it back normalized', () => {
    const values = toProfileFormValues({
      id: 1,
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
    });
    expect(toProfileChanges(values)).toEqual({
      name: 'Ana Souza',
      email: 'ana@example.com',
      phone: '49999990000',
      birthDate: '1998-04-12',
    });
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

describe('deletion code', () => {
  it('accepts exactly six digits', () => {
    expect(deletionCodeSchema.safeParse('123456').success).toBe(true);
    expect(deletionCodeSchema.safeParse('12345').success).toBe(false);
    expect(deletionCodeSchema.safeParse('12a456').success).toBe(false);
  });
});
