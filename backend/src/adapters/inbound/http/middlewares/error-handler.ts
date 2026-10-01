import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { Logger } from 'pino';
import { DomainError } from '../../../../domain/shared/errors.js';
import { fromDomainError } from '../domain-error-map.js';
import { HttpError, type HttpErrorDetail } from '../http-error.js';

interface ErrorBody {
  code: string;
  message: string;
  details?: HttpErrorDetail[];
}

interface ErrorResponse {
  status: number;
  body: ErrorBody;
}

const INTERNAL_ERROR: ErrorResponse = {
  status: 500,
  body: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro inesperado. Tente novamente.' },
};

export const routeNotFoundHandler: RequestHandler = () => {
  throw new HttpError(404, 'ROUTE_NOT_FOUND', 'Rota não encontrada.');
};

export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, _request, response, _next) => {
    const { status, body } = toErrorResponse(error);
    if (status >= 500) {
      logger.error(describeError(error), 'Erro não tratado');
    }
    response.status(status).json({ error: body });
  };
}

function toErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof DomainError) {
    return fromHttpError(fromDomainError(error));
  }
  if (error instanceof HttpError) {
    return fromHttpError(error);
  }
  return fromBodyParserError(error) ?? INTERNAL_ERROR;
}

function fromHttpError(error: HttpError): ErrorResponse {
  return {
    status: error.status,
    body: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  };
}

function fromBodyParserError(error: unknown): ErrorResponse | undefined {
  const type = isObject(error) ? error.type : undefined;
  if (type === 'entity.parse.failed') {
    return {
      status: 400,
      body: { code: 'INVALID_JSON', message: 'O corpo da requisição não é um JSON válido.' },
    };
  }
  if (type === 'entity.too.large') {
    return {
      status: 413,
      body: { code: 'PAYLOAD_TOO_LARGE', message: 'O conteúdo enviado é grande demais.' },
    };
  }
  return undefined;
}

// Só nome, mensagem e pilha: detalhes de erros do banco podem conter dados do usuário.
function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { errorName: error.name, errorMessage: error.message, stack: error.stack };
  }
  return { errorName: typeof error };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
