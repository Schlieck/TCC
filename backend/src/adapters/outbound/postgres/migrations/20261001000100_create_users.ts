import type { Knex } from 'knex';

// Migrations são autocontidas: não importam código do projeto, que pode mudar depois.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.specificType('id', 'integer GENERATED ALWAYS AS IDENTITY').primary();
    table.string('name', 100).notNullable();
    table.string('email', 254).notNullable().unique({ indexName: 'users_email_unique' });
    table.string('password_hash', 100).notNullable();
    table.string('phone', 11).notNullable();
    table.date('birth_date').notNullable();
    table.integer('token_version').notNullable().defaultTo(0);
    table.timestamp('privacy_consent_at', { useTz: true }).notNullable();
    table.timestamps(true, true);

    table.check('email = lower(email)', [], 'users_email_lowercase');
    table.check(`phone ~ '^[0-9]{10,11}$'`, [], 'users_phone_digits');
    table.check(`birth_date >= '1900-01-01'`, [], 'users_birth_date_range');
  });
  await knex.raw(`
    CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
