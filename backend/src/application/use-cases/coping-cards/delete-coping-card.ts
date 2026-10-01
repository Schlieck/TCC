import { copingCardNotFound, type CopingCardId } from '../../../domain/coping-card/coping-card.js';
import type { UserId } from '../../../domain/user/user.js';
import type { CopingCardRepository } from '../../ports/coping-card-repository.js';

export interface DeleteCopingCardInput {
  userId: UserId;
  cardId: CopingCardId;
}

export class DeleteCopingCard {
  constructor(private readonly cards: CopingCardRepository) {}

  async execute({ userId, cardId }: DeleteCopingCardInput): Promise<void> {
    if (!(await this.cards.delete(userId, cardId))) {
      throw copingCardNotFound();
    }
  }
}
