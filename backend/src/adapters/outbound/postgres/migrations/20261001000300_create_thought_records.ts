import type { Knex } from 'knex';

// Lista fechada de emoções. Fica na migration porque o app, os testes e a produção dependem dela.
const EMOTIONS = [
  { slug: 'anxiety', name: 'Ansiedade' },
  { slug: 'sadness', name: 'Tristeza' },
  { slug: 'anger', name: 'Raiva' },
  { slug: 'fear', name: 'Medo' },
  { slug: 'guilt', name: 'Culpa' },
  { slug: 'shame', name: 'Vergonha' },
  { slug: 'joy', name: 'Alegria' },
  { slug: 'relief', name: 'Alívio' },
];

async function addUpdatedAtTrigger(knex: Knex, table: string): Promise<void> {
  await knex.raw(`
    CREATE TRIGGER ${table}_set_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);
}

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('emotions', (table) => {
    table.specificType('id', 'integer GENERATED ALWAYS AS IDENTITY').primary();
    table.string('slug', 30).notNullable().unique({ indexName: 'emotions_slug_unique' });
    table.string('name', 40).notNullable();
    table.timestamps(true, true);
  });
  await addUpdatedAtTrigger(knex, 'emotions');
  await knex('emotions').insert(EMOTIONS);

  await knex.schema.createTable('thought_records', (table) => {
    table.specificType('id', 'integer GENERATED ALWAYS AS IDENTITY').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 120).notNullable();
    table.date('occurred_on').notNullable();
    table.time('occurred_time').notNullable();
    table.text('description').notNullable();
    table.timestamps(true, true);

    table.check('char_length(description) <= 5000', [], 'thought_records_description_length');
    table.index(['user_id', 'occurred_on'], 'thought_records_user_date_index');
  });
  await addUpdatedAtTrigger(knex, 'thought_records');

  // Sem user_id: pertence ao usuário por meio do registro, e some junto com ele (cascata).
  await knex.schema.createTable('thought_record_emotions', (table) => {
    table
      .integer('thought_record_id')
      .notNullable()
      .references('id')
      .inTable('thought_records')
      .onDelete('CASCADE');
    table
      .integer('emotion_id')
      .notNullable()
      .references('id')
      .inTable('emotions')
      .onDelete('RESTRICT');
    table.smallint('intensity').notNullable();
    table.timestamps(true, true);

    table.primary(['thought_record_id', 'emotion_id']);
    table.check('intensity BETWEEN 0 AND 100', [], 'thought_record_emotions_intensity_range');
  });
  await addUpdatedAtTrigger(knex, 'thought_record_emotions');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('thought_record_emotions');
  await knex.schema.dropTable('thought_records');
  await knex.schema.dropTable('emotions');
}
