import type { Request, Response } from 'express';
import type { LogIn } from '../../../../application/use-cases/auth/log-in.js';
import type { RegisterUser } from '../../../../application/use-cases/auth/register-user.js';
import type { RequestPasswordReset } from '../../../../application/use-cases/auth/request-password-reset.js';
import type { ResetPassword } from '../../../../application/use-cases/auth/reset-password.js';
import {
  logInBodySchema,
  passwordResetConfirmBodySchema,
  passwordResetRequestBodySchema,
  registerBodySchema,
} from '../schemas/auth-schemas.js';
import { parseRequest } from '../validation.js';

export interface AuthUseCases {
  registerUser: RegisterUser;
  logIn: LogIn;
  requestPasswordReset: RequestPasswordReset;
  resetPassword: ResetPassword;
}

export class AuthController {
  constructor(private readonly useCases: AuthUseCases) {}

  register = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(registerBodySchema, request.body);
    response.status(201).json(await this.useCases.registerUser.execute(body));
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
