import type { Knex } from 'knex';
import type { EmotionRepository } from '../../../../application/ports/emotion-repository.js';
import type { Emotion } from '../../../../domain/thought-record/emotion.js';

interface EmotionRow {
  id: number;
  slug: string;
  name: string;
}

export class PostgresEmotionRepository implements EmotionRepository {
  constructor(private readonly db: Knex) {}

  async listAll(): Promise<Emotion[]> {
    const rows = await this.db<EmotionRow>('emotions').select('id', 'slug', 'name').orderBy('id');
    return rows.map(({ id, slug, name }) => ({ id, slug, name }));
  }
}
