import { AppError } from '@/shared/errors';

const WRONG_CREDENTIALS = new Set([
  'auth/invalid-credential',
  'auth/wrong-password',
  'auth/user-not-found',
]);

const MESSAGES: Record<string, { message: string; field?: string }> = {
  'auth/email-already-in-use': { message: 'Este e-mail já está cadastrado.', field: 'email' },
  'auth/invalid-email': { message: 'Informe um e-mail válido.', field: 'email' },
  'auth/missing-password': { message: 'Informe a senha.' },
  'auth/weak-password': {
    message: 'A senha precisa ter pelo menos 8 caracteres, com letras e números.',
  },
  'auth/network-request-failed': {
    message: 'Sem conexão com a internet. Verifique sua conexão e tente novamente.',
  },
  'auth/too-many-requests': {
    message: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.',
  },
  'auth/requires-recent-login': {
    message: 'Por segurança, saia da conta, entre de novo e repita a operação.',
  },
  'auth/user-token-expired': { message: 'Sua sessão expirou. Faça login novamente.' },
  'auth/user-disabled': { message: 'Esta conta foi desativada.' },
  'auth/invalid-api-key': { message: 'A chave do Firebase configurada no app é inválida.' },
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': {
    message: 'A chave do Firebase configurada no app é inválida.',
  },
};

interface TranslateOptions {
  /** Campo da senha atual, quando o erro vem de uma reautenticação. */
  currentPasswordField?: string;
}

/** Converte um erro do Firebase Auth em mensagem para o paciente, em pt-BR. */
export function translateAuthError(error: unknown, options: TranslateOptions = {}): AppError {
  if (error instanceof AppError) {
    return error;
  }
  const code = errorCode(error);
  if (code !== null && WRONG_CREDENTIALS.has(code)) {
    return options.currentPasswordField
      ? new AppError('A senha atual não confere.', options.currentPasswordField)
      : new AppError('E-mail ou senha incorretos.');
  }
  const known = code === null ? undefined : MESSAGES[code];
  return known
    ? new AppError(known.message, known.field)
    : new AppError('Algo deu errado. Tente novamente.');
}

export function errorCode(error: unknown): string | null {
  return typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
    ? error.code
    : null;
}
