import { parseGroupName } from '../../../domain/coping-card/coping-card-group.js';
import type { UserId } from '../../../domain/user/user.js';
import type { CopingCardGroupRepository } from '../../ports/coping-card-group-repository.js';
import { toGroupOutput, type CopingCardGroupOutput } from './coping-card-output.js';

export interface CreateCopingCardGroupInput {
  userId: UserId;
  name: string;
}

export class CreateCopingCardGroup {
  constructor(private readonly groups: CopingCardGroupRepository) {}

  async execute({ userId, name }: CreateCopingCardGroupInput): Promise<CopingCardGroupOutput> {
    return toGroupOutput(await this.groups.create(userId, parseGroupName(name)));
  }
}
