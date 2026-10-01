import type {
  CopingCardFilter,
  CopingCardRepository,
} from '../../../src/application/ports/coping-card-repository.js';
import type {
  CopingCard,
  CopingCardContent,
  CopingCardId,
} from '../../../src/domain/coping-card/coping-card.js';
import type { UserId } from '../../../src/domain/user/user.js';

export class InMemoryCopingCardRepository implements CopingCardRepository {
  readonly cards = new Map<CopingCardId, CopingCard>();
  private nextId = 1;

  listByUser(userId: UserId, filter: CopingCardFilter): Promise<CopingCard[]> {
    return Promise.resolve(
      [...this.cards.values()]
        .filter((card) => card.userId === userId)
        .filter((card) => filter.groupId === undefined || card.groupId === filter.groupId)
        .reverse(),
    );
  }

  findById(userId: UserId, id: CopingCardId): Promise<CopingCard | null> {
    const card = this.cards.get(id);
    return Promise.resolve(card?.userId === userId ? card : null);
  }

  create(userId: UserId, content: CopingCardContent): Promise<CopingCard> {
    const card: CopingCard = { id: this.nextId++, userId, ...content, updatedAt: new Date() };
    this.cards.set(card.id, card);
    return Promise.resolve(card);
  }

  async update(
    userId: UserId,
    id: CopingCardId,
    content: CopingCardContent,
  ): Promise<CopingCard | null> {
    const existing = await this.findById(userId, id);
    if (!existing) {
      return null;
    }
    const updated: CopingCard = { ...existing, ...content, updatedAt: new Date() };
    this.cards.set(id, updated);
    return updated;
  }

  async delete(userId: UserId, id: CopingCardId): Promise<boolean> {
    return (await this.findById(userId, id)) ? this.cards.delete(id) : false;
  }

  countByGroup(userId: UserId, groupId: number): number {
    return [...this.cards.values()].filter(
      (card) => card.userId === userId && card.groupId === groupId,
    ).length;
  }
}
