import type { Request, Response } from 'express';
import type { CreateCopingCardGroup } from '../../../../application/use-cases/coping-cards/create-coping-card-group.js';
import type { DeleteCopingCardGroup } from '../../../../application/use-cases/coping-cards/delete-coping-card-group.js';
import type { ListCopingCardGroups } from '../../../../application/use-cases/coping-cards/list-coping-card-groups.js';
import type { RenameCopingCardGroup } from '../../../../application/use-cases/coping-cards/rename-coping-card-group.js';
import { currentUserId } from '../middlewares/authenticate.js';
import { idParamsSchema } from '../schemas/common-schemas.js';
import { groupBodySchema } from '../schemas/coping-card-schemas.js';
import { parseRequest } from '../validation.js';

export interface CopingCardGroupUseCases {
  listGroups: ListCopingCardGroups;
  createGroup: CreateCopingCardGroup;
  renameGroup: RenameCopingCardGroup;
  deleteGroup: DeleteCopingCardGroup;
}

export class CopingCardGroupController {
  constructor(private readonly useCases: CopingCardGroupUseCases) {}

  list = async (_request: Request, response: Response): Promise<void> => {
    response.json(await this.useCases.listGroups.execute(currentUserId(response)));
  };

  create = async (request: Request, response: Response): Promise<void> => {
    const { name } = parseRequest(groupBodySchema, request.body);
    const group = await this.useCases.createGroup.execute({
      userId: currentUserId(response),
      name,
    });
    response.status(201).json(group);
  };

  rename = async (request: Request, response: Response): Promise<void> => {
    const { id } = parseRequest(idParamsSchema, request.params);
    const { name } = parseRequest(groupBodySchema, request.body);
    response.json(
      await this.useCases.renameGroup.execute({
        userId: currentUserId(response),
        groupId: id,
        name,
      }),
    );
  };

  remove = async (request: Request, response: Response): Promise<void> => {
    const { id } = parseRequest(idParamsSchema, request.params);
    await this.useCases.deleteGroup.execute({ userId: currentUserId(response), groupId: id });
    response.status(204).end();
  };
}
