import type { Knex } from 'knex';
import type {
  CopingCardGroupRepository,
  CopingCardGroupSummary,
} from '../../../../application/ports/coping-card-group-repository.js';
import type {
  CopingCardGroup,
  CopingCardGroupId,
} from '../../../../domain/coping-card/coping-card-group.js';
import { ConflictError } from '../../../../domain/shared/errors.js';
import type { UserId } from '../../../../domain/user/user.js';
import { isUniqueViolation } from '../postgres-errors.js';

interface GroupRow {
  id: number;
  user_id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

type GroupSummaryRow = Pick<GroupRow, 'id' | 'user_id' | 'name'> & { card_count: number };

const NAME_UNIQUE_INDEX = 'coping_card_groups_user_name_unique';

export class PostgresCopingCardGroupRepository implements CopingCardGroupRepository {
  constructor(private readonly db: Knex) {}

  async listByUser(userId: UserId): Promise<CopingCardGroupSummary[]> {
    const rows = await this.db('coping_card_groups as g')
      .leftJoin('coping_cards as c', 'c.group_id', 'g.id')
      .where('g.user_id', userId)
      .groupBy('g.id')
      .orderByRaw('lower(g.name)')
      .select<GroupSummaryRow[]>(
        'g.id',
        'g.user_id',
        'g.name',
        this.db.raw('count(c.id)::int as card_count'),
      );
    return rows.map((row) => ({ ...toGroup(row), cardCount: row.card_count }));
  }

  async findById(userId: UserId, id: CopingCardGroupId): Promise<CopingCardGroup | null> {
    const row = await this.groups().where({ id, user_id: userId }).first();
    return row ? toGroup(row) : null;
  }

  async create(userId: UserId, name: string): Promise<CopingCardGroup> {
    const [row] = await this.withNameConflict(() =>
      this.groups().insert({ user_id: userId, name }).returning('*'),
    );
    if (!row) {
      throw new Error('Insert into coping_card_groups returned no row');
    }
    return toGroup(row);
  }

  async rename(
    userId: UserId,
    id: CopingCardGroupId,
    name: string,
  ): Promise<CopingCardGroup | null> {
    const [row] = await this.withNameConflict(() =>
      this.groups().where({ id, user_id: userId }).update({ name }).returning('*'),
    );
    return row ? toGroup(row) : null;
  }

  async countCards(userId: UserId, id: CopingCardGroupId): Promise<number> {
    const result = await this.db('coping_cards')
      .where({ user_id: userId, group_id: id })
      .count<{ total: string }>('* as total')
      .first();
    return Number(result?.total ?? 0);
  }

  async delete(userId: UserId, id: CopingCardGroupId): Promise<void> {
    await this.groups().where({ id, user_id: userId }).delete();
  }

  private groups() {
    return this.db<GroupRow>('coping_card_groups');
  }

  private async withNameConflict<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (isUniqueViolation(error, NAME_UNIQUE_INDEX)) {
        throw new ConflictError('GROUP_NAME_TAKEN', 'A group with this name already exists');
      }
      throw error;
    }
  }
}

function toGroup(row: Pick<GroupRow, 'id' | 'user_id' | 'name'>): CopingCardGroup {
  return { id: row.id, userId: row.user_id, name: row.name };
}
