import type { RequestHandler, Response } from 'express';
import type { AuthenticateRequest } from '../../../../application/use-cases/auth/authenticate-request.js';
import type { UserId } from '../../../../domain/user/user.js';
import { HttpError } from '../http-error.js';

const BEARER = /^Bearer (.+)$/;

export function authenticate(authenticateRequest: AuthenticateRequest): RequestHandler {
  return async (request, response, next) => {
    const token = BEARER.exec(request.headers.authorization ?? '')?.[1];
    if (!token) {
      throw new HttpError(401, 'MISSING_TOKEN', 'Faça login para continuar.');
    }
    const { userId } = await authenticateRequest.execute(token);
    response.locals.userId = userId;
    next();
  };
}

export function currentUserId(response: Response): UserId {
  const userId: unknown = response.locals.userId;
  if (typeof userId !== 'number') {
    throw new Error('Rota protegida sem o middleware authenticate');
  }
  return userId;
}
