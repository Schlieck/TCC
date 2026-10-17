import type { Knex } from 'knex';

// Cadastros à espera do código enviado ao e-mail. A conta só entra em `users` depois que o
// código confere, assim o cadastro não precisa revelar se um e-mail já tem conta.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('pending_registrations', (table) => {
    table.specificType('id', 'integer GENERATED ALWAYS AS IDENTITY').primary();
    table
      .string('email', 254)
      .notNullable()
      .unique({ indexName: 'pending_registrations_email_unique' });
    table.string('name', 100).notNullable();
    table.string('phone', 11).notNullable();
    table.date('birth_date').notNullable();
    table.string('password_hash', 100).notNullable();
    table.timestamp('privacy_consent_at', { useTz: true }).notNullable();
    table.string('code_hash', 100).notNullable();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.smallint('failed_attempts').notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
  await knex.raw(`
    CREATE TRIGGER pending_registrations_set_updated_at
    BEFORE UPDATE ON pending_registrations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('pending_registrations');
}
