import {
  copingCardGroupNotFound,
  type CopingCardGroupId,
} from '../../../domain/coping-card/coping-card-group.js';
import { ConflictError } from '../../../domain/shared/errors.js';
import type { UserId } from '../../../domain/user/user.js';
import type { CopingCardGroupRepository } from '../../ports/coping-card-group-repository.js';

export interface DeleteCopingCardGroupInput {
  userId: UserId;
  groupId: CopingCardGroupId;
}

export class DeleteCopingCardGroup {
  constructor(private readonly groups: CopingCardGroupRepository) {}

  async execute({ userId, groupId }: DeleteCopingCardGroupInput): Promise<void> {
    if (!(await this.groups.findById(userId, groupId))) {
      throw copingCardGroupNotFound();
    }
    if ((await this.groups.countCards(userId, groupId)) > 0) {
      throw new ConflictError('GROUP_NOT_EMPTY', 'Group still has coping cards');
    }
    await this.groups.delete(userId, groupId);
  }
}
