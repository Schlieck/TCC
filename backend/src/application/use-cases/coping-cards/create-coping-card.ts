import { parseCardContent } from '../../../domain/coping-card/coping-card.js';
import type { CopingCardGroupId } from '../../../domain/coping-card/coping-card-group.js';
import type { UserId } from '../../../domain/user/user.js';
import type { CopingCardGroupRepository } from '../../ports/coping-card-group-repository.js';
import type { CopingCardRepository } from '../../ports/coping-card-repository.js';
import { assertOwnGroup } from './assert-own-group.js';
import { toCopingCardOutput, type CopingCardOutput } from './coping-card-output.js';

export interface CreateCopingCardInput {
  userId: UserId;
  groupId: CopingCardGroupId;
  name: string;
  description: string;
}

export class CreateCopingCard {
  constructor(
    private readonly cards: CopingCardRepository,
    private readonly groups: CopingCardGroupRepository,
  ) {}

  async execute({ userId, ...raw }: CreateCopingCardInput): Promise<CopingCardOutput> {
    const content = parseCardContent(raw);
    await assertOwnGroup(this.groups, userId, content.groupId);
    return toCopingCardOutput(await this.cards.create(userId, content));
  }
}
