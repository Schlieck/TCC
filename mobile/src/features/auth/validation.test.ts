import { describe, expect, it } from 'vitest';
import { registerFormSchema, toRegisterRequest, type RegisterFormValues } from './validation';

const validForm: RegisterFormValues = {
  name: 'Ana Souza',
  email: 'ana@example.com',
  password: 'segredo123',
  confirmPassword: 'segredo123',
  phone: '(49) 99999-0000',
  birthDate: '12/04/1998',
  acceptedPrivacyTerms: true,
};

function errorsOf(values: RegisterFormValues): Record<string, string> {
  const result = registerFormSchema.safeParse(values);
  if (result.success) {
    return {};
  }
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
  );
}

describe('registerFormSchema', () => {
  it('accepts a complete form', () => {
    expect(errorsOf(validForm)).toEqual({});
  });

  it('points out mismatched passwords on the confirmation field', () => {
    expect(errorsOf({ ...validForm, confirmPassword: 'outra123' })).toEqual({
      confirmPassword: 'As senhas não conferem.',
    });
  });

  it('requires consent, a full phone and a past birth date', () => {
    const errors = errorsOf({
      ...validForm,
      acceptedPrivacyTerms: false,
      phone: '(49) 9999',
      birthDate: '31/12/2999',
    });

    expect(Object.keys(errors).sort()).toEqual(['acceptedPrivacyTerms', 'birthDate', 'phone']);
  });

  it('requires letters and numbers in the password', () => {
    expect(
      errorsOf({ ...validForm, password: 'somenteletras', confirmPassword: 'somenteletras' }),
    ).toEqual({ password: 'Use pelo menos um número.' });
  });
});

describe('toRegisterRequest', () => {
  it('sends only digits for the phone and an ISO birth date', () => {
    expect(toRegisterRequest(validForm)).toEqual({
      name: 'Ana Souza',
      email: 'ana@example.com',
      password: 'segredo123',
      phone: '49999990000',
      birthDate: '1998-04-12',
      acceptedPrivacyTerms: true,
    });
  });
});
