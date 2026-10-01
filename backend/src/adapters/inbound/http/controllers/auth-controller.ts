import type { Request, Response } from 'express';
import type { LogIn } from '../../../../application/use-cases/auth/log-in.js';
import type { RegisterUser } from '../../../../application/use-cases/auth/register-user.js';
import { logInBodySchema, registerBodySchema } from '../schemas/auth-schemas.js';
import { parseRequest } from '../validation.js';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly logIn: LogIn,
  ) {}

  register = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(registerBodySchema, request.body);
    response.status(201).json(await this.registerUser.execute(body));
  };

  login = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(logInBodySchema, request.body);
    response.json(await this.logIn.execute(body));
  };
}
