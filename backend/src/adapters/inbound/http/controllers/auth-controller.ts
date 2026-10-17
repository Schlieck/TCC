import type { Request, Response } from 'express';
import type { ConfirmRegistration } from '../../../../application/use-cases/auth/confirm-registration.js';
import type { LogIn } from '../../../../application/use-cases/auth/log-in.js';
import type { RequestPasswordReset } from '../../../../application/use-cases/auth/request-password-reset.js';
import type { RequestRegistration } from '../../../../application/use-cases/auth/request-registration.js';
import type { ResetPassword } from '../../../../application/use-cases/auth/reset-password.js';
import {
  logInBodySchema,
  passwordResetConfirmBodySchema,
  passwordResetRequestBodySchema,
  registerBodySchema,
  registrationConfirmBodySchema,
} from '../schemas/auth-schemas.js';
import { parseRequest } from '../validation.js';

export interface AuthUseCases {
  requestRegistration: RequestRegistration;
  confirmRegistration: ConfirmRegistration;
  logIn: LogIn;
  requestPasswordReset: RequestPasswordReset;
  resetPassword: ResetPassword;
}

export class AuthController {
  constructor(private readonly useCases: AuthUseCases) {}

  register = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(registerBodySchema, request.body);
    await this.useCases.requestRegistration.execute(body);
    response.status(202).end();
  };

  confirmRegistration = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(registrationConfirmBodySchema, request.body);
    response.status(201).json(await this.useCases.confirmRegistration.execute(body));
  };

  login = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(logInBodySchema, request.body);
    response.json(await this.useCases.logIn.execute(body));
  };

  requestPasswordReset = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(passwordResetRequestBodySchema, request.body);
    await this.useCases.requestPasswordReset.execute(body);
    response.status(202).end();
  };

  resetPassword = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(passwordResetConfirmBodySchema, request.body);
    response.json(await this.useCases.resetPassword.execute(body));
  };
}
