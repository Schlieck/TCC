import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../http-error.js';

const MINUTE = 60_000;

interface Policy {
  windowMs: number;
  limit: number;
}

export interface RateLimiters {
  login: RequestHandler;
  register: RequestHandler;
  passwordChange: RequestHandler;
  /** Pedidos de envio de código por e-mail. */
  codeRequest: RequestHandler;
  /** Tentativas de confirmar um código. */
  codeConfirm: RequestHandler;
}

export function createRateLimiters(enabled: boolean): RateLimiters {
  const limiter = (policy: Policy) => createLimiter(policy, enabled);
  return {
    login: limiter({ windowMs: 15 * MINUTE, limit: 10 }),
    register: limiter({ windowMs: 60 * MINUTE, limit: 5 }),
    passwordChange: limiter({ windowMs: 15 * MINUTE, limit: 10 }),
    codeRequest: limiter({ windowMs: 60 * MINUTE, limit: 5 }),
    codeConfirm: limiter({ windowMs: 15 * MINUTE, limit: 10 }),
  };
}

function createLimiter(policy: Policy, enabled: boolean): RequestHandler {
  return rateLimit({
    ...policy,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => !enabled,
    handler: (_request, _response, next) => {
      next(
        new HttpError(
          429,
          'TOO_MANY_REQUESTS',
          'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.',
        ),
      );
    },
  });
}
