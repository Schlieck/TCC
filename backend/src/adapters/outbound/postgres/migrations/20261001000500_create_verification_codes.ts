import type { Knex } from 'knex';

// Códigos de confirmação por e-mail (exclusão de conta e redefinição de senha).
// Só o hash do código é guardado; o código vale 15 minutos e uma única vez.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('verification_codes', (table) => {
    table.specificType('id', 'integer GENERATED ALWAYS AS IDENTITY').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('purpose', 30).notNullable();
    table.string('code_hash', 100).notNullable();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.timestamp('consumed_at', { useTz: true }).nullable();
    table.smallint('failed_attempts').notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.check(
      "purpose IN ('account_deletion', 'password_reset')",
      [],
      'verification_codes_purpose',
    );
    table.index(['user_id', 'purpose'], 'verification_codes_user_purpose_index');
  });
  await knex.raw(`
    CREATE TRIGGER verification_codes_set_updated_at
    BEFORE UPDATE ON verification_codes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('verification_codes');
}
