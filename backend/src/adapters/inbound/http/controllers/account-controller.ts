import type { Request, Response } from 'express';
import type { GetProfile } from '../../../../application/use-cases/account/get-profile.js';
import { currentUserId } from '../middlewares/authenticate.js';

export class AccountController {
  constructor(private readonly getProfile: GetProfile) {}

  show = async (_request: Request, response: Response): Promise<void> => {
    response.json(await this.getProfile.execute(currentUserId(response)));
  };
}
