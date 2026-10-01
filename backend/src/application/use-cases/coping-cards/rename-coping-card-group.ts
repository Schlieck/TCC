import {
  copingCardGroupNotFound,
  parseGroupName,
  type CopingCardGroupId,
} from '../../../domain/coping-card/coping-card-group.js';
import type { UserId } from '../../../domain/user/user.js';
import type { CopingCardGroupRepository } from '../../ports/coping-card-group-repository.js';
import { toGroupOutput, type CopingCardGroupOutput } from './coping-card-output.js';

export interface RenameCopingCardGroupInput {
  userId: UserId;
  groupId: CopingCardGroupId;
  name: string;
}

export class RenameCopingCardGroup {
  constructor(private readonly groups: CopingCardGroupRepository) {}

  async execute({
    userId,
    groupId,
    name,
  }: RenameCopingCardGroupInput): Promise<CopingCardGroupOutput> {
    const renamed = await this.groups.rename(userId, groupId, parseGroupName(name));
    if (!renamed) {
      throw copingCardGroupNotFound();
    }
    return toGroupOutput(renamed);
  }
}
