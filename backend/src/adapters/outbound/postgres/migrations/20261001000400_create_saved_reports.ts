import type { Knex } from 'knex';

// Guarda só nome e período: os dados do gráfico são recalculados a partir dos registros.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('saved_reports', (table) => {
    table.specificType('id', 'integer GENERATED ALWAYS AS IDENTITY').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 80).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.timestamps(true, true);

    table.check('end_date >= start_date', [], 'saved_reports_period_order');
    table.index(['user_id'], 'saved_reports_user_index');
  });
  await knex.raw(`
    CREATE TRIGGER saved_reports_set_updated_at
    BEFORE UPDATE ON saved_reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('saved_reports');
}
