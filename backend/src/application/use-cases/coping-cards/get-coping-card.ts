import { copingCardNotFound, type CopingCardId } from '../../../domain/coping-card/coping-card.js';
import type { UserId } from '../../../domain/user/user.js';
import type { CopingCardRepository } from '../../ports/coping-card-repository.js';
import { toCopingCardOutput, type CopingCardOutput } from './coping-card-output.js';

export interface GetCopingCardInput {
  userId: UserId;
  cardId: CopingCardId;
}

export class GetCopingCard {
  constructor(private readonly cards: CopingCardRepository) {}

  async execute({ userId, cardId }: GetCopingCardInput): Promise<CopingCardOutput> {
    const card = await this.cards.findById(userId, cardId);
    if (!card) {
      throw copingCardNotFound();
    }
    return toCopingCardOutput(card);
  }
}
