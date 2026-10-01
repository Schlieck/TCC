import type { UserId } from '../../../domain/user/user.js';
import type { CopingCardGroupRepository } from '../../ports/coping-card-group-repository.js';
import { toGroupSummaryOutput, type CopingCardGroupSummaryOutput } from './coping-card-output.js';

export class ListCopingCardGroups {
  constructor(private readonly groups: CopingCardGroupRepository) {}

  async execute(userId: UserId): Promise<CopingCardGroupSummaryOutput[]> {
    const groups = await this.groups.listByUser(userId);
    return groups.map(toGroupSummaryOutput);
  }
}
