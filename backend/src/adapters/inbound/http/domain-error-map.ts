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
  too_many_attempts: 429,
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
  INVALID_GROUP_NAME: 'Dê um nome ao grupo (até 60 caracteres).',
  GROUP_NAME_TAKEN: 'Você já tem um grupo com esse nome.',
  GROUP_NOT_EMPTY:
    'Este grupo ainda tem cartões. Mova ou exclua os cartões antes de excluir o grupo.',
  COPING_CARD_GROUP_NOT_FOUND: 'Grupo não encontrado.',
  INVALID_CARD_NAME: 'Dê um nome ao cartão (até 100 caracteres).',
  INVALID_CARD_DESCRIPTION: 'Escreva a descrição do cartão (até 1000 caracteres).',
  INVALID_CARD_GROUP: 'Escolha um grupo válido.',
  COPING_CARD_NOT_FOUND: 'Cartão não encontrado.',
  INVALID_TIME: 'Informe um horário válido (HH:MM).',
  INVALID_PERIOD: 'O início do período não pode ser depois do fim.',
  INVALID_RECORD_TITLE: 'Dê um título ao registro (até 120 caracteres).',
  INVALID_RECORD_DESCRIPTION: 'Descreva o que aconteceu (até 5000 caracteres).',
  FUTURE_RECORD_DATE: 'A data do registro não pode estar no futuro.',
  EMOTIONS_REQUIRED: 'Adicione pelo menos um sentimento.',
  DUPLICATED_EMOTION: 'Cada sentimento só pode aparecer uma vez.',
  INVALID_INTENSITY: 'A intensidade vai de 0 a 100%.',
  UNKNOWN_EMOTION: 'Sentimento desconhecido.',
  THOUGHT_RECORD_NOT_FOUND: 'Registro não encontrado.',
  PERIOD_TOO_LONG: 'Escolha um período de até 5 anos.',
  INVALID_REPORT_NAME: 'Dê um nome ao relatório (até 80 caracteres).',
  SAVED_REPORT_NOT_FOUND: 'Relatório não encontrado.',
  WRONG_CURRENT_PASSWORD: 'A senha atual não confere.',
  INVALID_VERIFICATION_CODE:
    'Código inválido ou expirado. Confira o e-mail ou peça um novo código.',
  TOO_MANY_CODE_ATTEMPTS: 'Muitas tentativas erradas. Peça um novo código.',
};

export function fromDomainError(error: DomainError): HttpError {
  const message = MESSAGES[error.code];
  const details =
    error instanceof ValidationError && error.field ? [{ field: error.field, message }] : undefined;
  return new HttpError(STATUS_BY_KIND[error.kind], error.code, message, details);
}
