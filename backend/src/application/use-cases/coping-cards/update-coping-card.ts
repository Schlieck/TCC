import {
  copingCardNotFound,
  parseCardContent,
  type CopingCardId,
} from '../../../domain/coping-card/coping-card.js';
import type { CopingCardGroupId } from '../../../domain/coping-card/coping-card-group.js';
import type { UserId } from '../../../domain/user/user.js';
import type { CopingCardGroupRepository } from '../../ports/coping-card-group-repository.js';
import type { CopingCardRepository } from '../../ports/coping-card-repository.js';
import { assertOwnGroup } from './assert-own-group.js';
import { toCopingCardOutput, type CopingCardOutput } from './coping-card-output.js';

export interface UpdateCopingCardInput {
  userId: UserId;
  cardId: CopingCardId;
  groupId: CopingCardGroupId;
  name: string;
  description: string;
}

export class UpdateCopingCard {
  constructor(
    private readonly cards: CopingCardRepository,
    private readonly groups: CopingCardGroupRepository,
  ) {}

  async execute({ userId, cardId, ...raw }: UpdateCopingCardInput): Promise<CopingCardOutput> {
    const content = parseCardContent(raw);
    if (!(await this.cards.findById(userId, cardId))) {
      throw copingCardNotFound();
    }
    await assertOwnGroup(this.groups, userId, content.groupId);

    const updated = await this.cards.update(userId, cardId, content);
    if (!updated) {
      throw copingCardNotFound();
    }
    return toCopingCardOutput(updated);
  }
}
