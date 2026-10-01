import type { Request, Response } from 'express';
import type { ChangePassword } from '../../../../application/use-cases/account/change-password.js';
import type { ConfirmAccountDeletion } from '../../../../application/use-cases/account/confirm-account-deletion.js';
import type { GetProfile } from '../../../../application/use-cases/account/get-profile.js';
import type { RequestAccountDeletion } from '../../../../application/use-cases/account/request-account-deletion.js';
import type { UpdateProfile } from '../../../../application/use-cases/account/update-profile.js';
import { currentUserId } from '../middlewares/authenticate.js';
import {
  changePasswordBodySchema,
  updateProfileBodySchema,
  verificationCodeBodySchema,
} from '../schemas/account-schemas.js';
import { parseRequest } from '../validation.js';

export interface AccountUseCases {
  getProfile: GetProfile;
  updateProfile: UpdateProfile;
  changePassword: ChangePassword;
  requestAccountDeletion: RequestAccountDeletion;
  confirmAccountDeletion: ConfirmAccountDeletion;
}

export class AccountController {
  constructor(private readonly useCases: AccountUseCases) {}

  show = async (_request: Request, response: Response): Promise<void> => {
    response.json(await this.useCases.getProfile.execute(currentUserId(response)));
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const changes = parseRequest(updateProfileBodySchema, request.body);
    response.json(
      await this.useCases.updateProfile.execute({ userId: currentUserId(response), ...changes }),
    );
  };

  changePassword = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(changePasswordBodySchema, request.body);
    response.json(
      await this.useCases.changePassword.execute({ userId: currentUserId(response), ...body }),
    );
  };

  requestDeletion = async (_request: Request, response: Response): Promise<void> => {
    await this.useCases.requestAccountDeletion.execute(currentUserId(response));
    response.status(202).end();
  };

  confirmDeletion = async (request: Request, response: Response): Promise<void> => {
    const { code } = parseRequest(verificationCodeBodySchema, request.body);
    await this.useCases.confirmAccountDeletion.execute({ userId: currentUserId(response), code });
    response.status(204).end();
  };
}
