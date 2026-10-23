import { describe, expect, it } from 'vitest';
import { AppError } from '@/shared/errors';
import { translateAuthError } from './auth-errors';

const firebaseError = (code: string) => Object.assign(new Error(`Firebase: (${code})`), { code });

describe('translateAuthError', () => {
  it('hides whether the e-mail or the password was wrong on login', () => {
    for (const code of ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found']) {
      expect(translateAuthError(firebaseError(code))).toEqual(
        new AppError('E-mail ou senha incorretos.'),
      );
    }
  });

  it('points a failed reauthentication to the current password field', () => {
    const error = translateAuthError(firebaseError('auth/invalid-credential'), {
      currentPasswordField: 'currentPassword',
    });

    expect(error.message).toBe('A senha atual não confere.');
    expect(error.field).toBe('currentPassword');
  });

  it.each([
    ['auth/email-already-in-use', 'Este e-mail já está cadastrado.', 'email'],
    ['auth/invalid-email', 'Informe um e-mail válido.', 'email'],
    ['auth/network-request-failed', 'Sem conexão com a internet.', undefined],
    ['auth/too-many-requests', 'Muitas tentativas seguidas.', undefined],
    ['auth/requires-recent-login', 'Por segurança, saia da conta', undefined],
    ['auth/weak-password', 'pelo menos 8 caracteres', undefined],
  ])('translates %s', (code, message, field) => {
    const error = translateAuthError(firebaseError(code));

    expect(error.message).toContain(message);
    expect(error.field).toBe(field);
  });

  it('falls back to a generic message without exposing the original one', () => {
    expect(translateAuthError(firebaseError('auth/internal-error')).message).toBe(
      'Algo deu errado. Tente novamente.',
    );
    expect(translateAuthError(new Error('boom')).message).toBe('Algo deu errado. Tente novamente.');
  });

  it('keeps errors that are already translated', () => {
    const error = new AppError('Já traduzido.', 'name');

    expect(translateAuthError(error)).toBe(error);
  });
});
