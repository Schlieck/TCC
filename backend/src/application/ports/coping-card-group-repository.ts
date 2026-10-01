import type {
  CopingCardGroup,
  CopingCardGroupId,
} from '../../domain/coping-card/coping-card-group.js';
import type { UserId } from '../../domain/user/user.js';

export interface CopingCardGroupSummary extends CopingCardGroup {
  cardCount: number;
}

/** Todas as operações são restritas aos grupos do próprio usuário. */
export interface CopingCardGroupRepository {
  listByUser(userId: UserId): Promise<CopingCardGroupSummary[]>;
  findById(userId: UserId, id: CopingCardGroupId): Promise<CopingCardGroup | null>;
  /** Lança ConflictError('GROUP_NAME_TAKEN') se o usuário já tiver um grupo com esse nome. */
  create(userId: UserId, name: string): Promise<CopingCardGroup>;
  /** Lança ConflictError('GROUP_NAME_TAKEN') se o usuário já tiver um grupo com esse nome. */
  rename(userId: UserId, id: CopingCardGroupId, name: string): Promise<CopingCardGroup | null>;
  countCards(userId: UserId, id: CopingCardGroupId): Promise<number>;
  delete(userId: UserId, id: CopingCardGroupId): Promise<void>;
}
