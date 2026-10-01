import {
  ValidationError,
  type DomainError,
  type DomainErrorCode,
  type DomainErrorKind,
} from '../../../domain/shared/errors.js';
import { HttpError } from './http-error.js';

const STATUS_BY_KIND: Record<DomainErrorKind, number> = {
  validation: 400,
  unauthenticated: 401,
  not_found: 404,
  conflict: 409,
};

const MESSAGES: Record<DomainErrorCode, string> = {
  INVALID_NAME: 'Informe um nome entre 2 e 100 caracteres.',
  INVALID_EMAIL: 'Informe um e-mail válido.',
  INVALID_PHONE: 'Informe o telefone com DDD (10 ou 11 dígitos).',
  INVALID_DATE: 'Informe uma data válida.',
  INVALID_BIRTH_DATE: 'Informe uma data de nascimento válida.',
  WEAK_PASSWORD: 'A senha precisa ter pelo menos 8 caracteres, com letras e números.',
  PRIVACY_CONSENT_REQUIRED: 'É preciso aceitar o tratamento dos dados para criar a conta.',
  EMAIL_ALREADY_IN_USE: 'Este e-mail já está cadastrado.',
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
  INVALID_TOKEN: 'Sua sessão expirou. Faça login novamente.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
};

export function fromDomainError(error: DomainError): HttpError {
  const message = MESSAGES[error.code];
  const details =
    error instanceof ValidationError && error.field ? [{ field: error.field, message }] : undefined;
  return new HttpError(STATUS_BY_KIND[error.kind], error.code, message, details);
}
