import type { Knex } from 'knex';
import type {
  CopingCardFilter,
  CopingCardRepository,
} from '../../../../application/ports/coping-card-repository.js';
import type {
  CopingCard,
  CopingCardContent,
  CopingCardId,
} from '../../../../domain/coping-card/coping-card.js';
import type { UserId } from '../../../../domain/user/user.js';

interface CardRow {
  id: number;
  user_id: number;
  group_id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export class PostgresCopingCardRepository implements CopingCardRepository {
  constructor(private readonly db: Knex) {}

  async listByUser(userId: UserId, filter: CopingCardFilter): Promise<CopingCard[]> {
    const query = this.cards().where({ user_id: userId });
    if (filter.groupId !== undefined) {
      void query.andWhere({ group_id: filter.groupId });
    }
    const rows = await query.orderBy([
      { column: 'updated_at', order: 'desc' },
      { column: 'id', order: 'desc' },
    ]);
    return rows.map(toCard);
  }

  async findById(userId: UserId, id: CopingCardId): Promise<CopingCard | null> {
    const row = await this.cards().where({ id, user_id: userId }).first();
    return row ? toCard(row) : null;
  }

  async create(userId: UserId, content: CopingCardContent): Promise<CopingCard> {
    const [row] = await this.cards()
      .insert({ user_id: userId, ...toContentRow(content) })
      .returning('*');
    if (!row) {
      throw new Error('Insert into coping_cards returned no row');
    }
    return toCard(row);
  }

  async update(
    userId: UserId,
    id: CopingCardId,
    content: CopingCardContent,
  ): Promise<CopingCard | null> {
    const [row] = await this.cards()
      .where({ id, user_id: userId })
      .update(toContentRow(content))
      .returning('*');
    return row ? toCard(row) : null;
  }

  async delete(userId: UserId, id: CopingCardId): Promise<boolean> {
    const deleted = await this.cards().where({ id, user_id: userId }).delete();
    return deleted > 0;
  }

  private cards() {
    return this.db<CardRow>('coping_cards');
  }
}

function toContentRow(
  content: CopingCardContent,
): Pick<CardRow, 'group_id' | 'name' | 'description'> {
  return { group_id: content.groupId, name: content.name, description: content.description };
}

function toCard(row: CardRow): CopingCard {
  return {
    id: row.id,
    userId: row.user_id,
    groupId: row.group_id,
    name: row.name,
    description: row.description,
    updatedAt: row.updated_at,
  };
}
