import type {
  CopingCardGroupRepository,
  CopingCardGroupSummary,
} from '../../../src/application/ports/coping-card-group-repository.js';
import type {
  CopingCardGroup,
  CopingCardGroupId,
} from '../../../src/domain/coping-card/coping-card-group.js';
import { ConflictError } from '../../../src/domain/shared/errors.js';
import type { UserId } from '../../../src/domain/user/user.js';
import type { InMemoryCopingCardRepository } from './in-memory-coping-card-repository.js';

export class InMemoryCopingCardGroupRepository implements CopingCardGroupRepository {
  readonly groups = new Map<CopingCardGroupId, CopingCardGroup>();
  private nextId = 1;

  constructor(private readonly cards: InMemoryCopingCardRepository) {}

  listByUser(userId: UserId): Promise<CopingCardGroupSummary[]> {
    return Promise.resolve(
      this.ownedBy(userId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((group) => ({ ...group, cardCount: this.cards.countByGroup(userId, group.id) })),
    );
  }

  findById(userId: UserId, id: CopingCardGroupId): Promise<CopingCardGroup | null> {
    const group = this.groups.get(id);
    return Promise.resolve(group?.userId === userId ? group : null);
  }

  create(userId: UserId, name: string): Promise<CopingCardGroup> {
    this.assertNameAvailable(userId, name);
    const group: CopingCardGroup = { id: this.nextId++, userId, name };
    this.groups.set(group.id, group);
    return Promise.resolve(group);
  }

  async rename(
    userId: UserId,
    id: CopingCardGroupId,
    name: string,
  ): Promise<CopingCardGroup | null> {
    const existing = await this.findById(userId, id);
    if (!existing) {
      return null;
    }
    this.assertNameAvailable(userId, name, id);
    const renamed = { ...existing, name };
    this.groups.set(id, renamed);
    return renamed;
  }

  countCards(userId: UserId, id: CopingCardGroupId): Promise<number> {
    return Promise.resolve(this.cards.countByGroup(userId, id));
  }

  async delete(userId: UserId, id: CopingCardGroupId): Promise<void> {
    if (await this.findById(userId, id)) {
      this.groups.delete(id);
    }
  }

  private ownedBy(userId: UserId): CopingCardGroup[] {
    return [...this.groups.values()].filter((group) => group.userId === userId);
  }

  private assertNameAvailable(userId: UserId, name: string, exceptId?: CopingCardGroupId): void {
    const taken = this.ownedBy(userId).some(
      (group) => group.id !== exceptId && group.name.toLowerCase() === name.toLowerCase(),
    );
    if (taken) {
      throw new ConflictError('GROUP_NAME_TAKEN', 'A group with this name already exists');
    }
  }
}
