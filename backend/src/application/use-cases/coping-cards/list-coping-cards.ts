import type { CopingCardGroupId } from '../../../domain/coping-card/coping-card-group.js';
import type { UserId } from '../../../domain/user/user.js';
import type { CopingCardRepository } from '../../ports/coping-card-repository.js';
import { toCopingCardOutput, type CopingCardOutput } from './coping-card-output.js';

export interface ListCopingCardsInput {
  userId: UserId;
  groupId?: CopingCardGroupId;
}

export class ListCopingCards {
  constructor(private readonly cards: CopingCardRepository) {}

  async execute({ userId, groupId }: ListCopingCardsInput): Promise<CopingCardOutput[]> {
    const cards = await this.cards.listByUser(userId, groupId === undefined ? {} : { groupId });
    return cards.map(toCopingCardOutput);
  }
}
