import type { DateRange } from '../../domain/shared/date-range.js';
import type {
  ThoughtRecord,
  ThoughtRecordContent,
  ThoughtRecordId,
} from '../../domain/thought-record/thought-record.js';
import type { UserId } from '../../domain/user/user.js';

/** Todas as operações são restritas aos registros do próprio usuário. */
export interface ThoughtRecordRepository {
  /** Mais recentes primeiro; sem período, devolve todos. */
  listByUser(userId: UserId, period?: DateRange): Promise<ThoughtRecord[]>;
  findById(userId: UserId, id: ThoughtRecordId): Promise<ThoughtRecord | null>;
  create(userId: UserId, content: ThoughtRecordContent): Promise<ThoughtRecord>;
  /** Substitui também a lista de emoções do registro. */
  update(
    userId: UserId,
    id: ThoughtRecordId,
    content: ThoughtRecordContent,
  ): Promise<ThoughtRecord | null>;
  /** Devolve `false` se o registro não existir para esse usuário. */
  delete(userId: UserId, id: ThoughtRecordId): Promise<boolean>;
}
