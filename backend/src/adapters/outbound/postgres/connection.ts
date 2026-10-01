import knex, { type Knex } from 'knex';
import pg from 'pg';

// Datas de calendário (DATE) chegam como 'YYYY-MM-DD', sem conversão para fuso horário.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

export interface PostgresSettings {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function createDatabase(settings: PostgresSettings): Knex {
  return knex({
    client: 'pg',
    connection: settings,
    pool: { min: 0, max: 10 },
  });
}
