import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('coping_card_groups', (table) => {
    table.specificType('id', 'integer GENERATED ALWAYS AS IDENTITY').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 60).notNullable();
    table.timestamps(true, true);

    // Alvo da FK composta de coping_cards: garante que o grupo é do mesmo usuário do cartão.
    table.unique(['id', 'user_id'], { indexName: 'coping_card_groups_id_user_unique' });
  });
  await knex.raw(`
    CREATE UNIQUE INDEX coping_card_groups_user_name_unique
    ON coping_card_groups (user_id, lower(name))
  `);
  await knex.raw(`
    CREATE TRIGGER coping_card_groups_set_updated_at
    BEFORE UPDATE ON coping_card_groups
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);

  await knex.schema.createTable('coping_cards', (table) => {
    table.specificType('id', 'integer GENERATED ALWAYS AS IDENTITY').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('group_id').notNullable();
    table.string('name', 100).notNullable();
    table.string('description', 1000).notNullable();
    table.timestamps(true, true);

    // NO ACTION (e não RESTRICT): a exclusão da conta apaga grupos e cartões na mesma instrução.
    table
      .foreign(['group_id', 'user_id'], 'coping_cards_group_same_user_fk')
      .references(['id', 'user_id'])
      .inTable('coping_card_groups');
    table.index(['user_id', 'group_id'], 'coping_cards_user_group_index');
  });
  await knex.raw(`
    CREATE TRIGGER coping_cards_set_updated_at
    BEFORE UPDATE ON coping_cards
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('coping_cards');
  await knex.schema.dropTable('coping_card_groups');
}
