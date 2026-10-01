import type {
  CopingCard,
  CopingCardContent,
  CopingCardId,
} from '../../domain/coping-card/coping-card.js';
import type { CopingCardGroupId } from '../../domain/coping-card/coping-card-group.js';
import type { UserId } from '../../domain/user/user.js';

export interface CopingCardFilter {
  groupId?: CopingCardGroupId;
}

/** Todas as operações são restritas aos cartões do próprio usuário. */
export interface CopingCardRepository {
  listByUser(userId: UserId, filter: CopingCardFilter): Promise<CopingCard[]>;
  findById(userId: UserId, id: CopingCardId): Promise<CopingCard | null>;
  create(userId: UserId, content: CopingCardContent): Promise<CopingCard>;
  update(userId: UserId, id: CopingCardId, content: CopingCardContent): Promise<CopingCard | null>;
  /** Devolve `false` se o cartão não existir para esse usuário. */
  delete(userId: UserId, id: CopingCardId): Promise<boolean>;
}
