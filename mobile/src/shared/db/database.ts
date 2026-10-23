import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { MIGRATIONS } from './migrations';

let database: Promise<SQLiteDatabase> | null = null;
let writes: Promise<unknown> = Promise.resolve();

export function getDatabase(): Promise<SQLiteDatabase> {
  database ??= open().catch((error: unknown) => {
    database = null;
    throw error;
  });
  return database;
}

/**
 * Escritas em transação, uma de cada vez. Não usamos `withExclusiveTransactionAsync` porque ele
 * abre outra conexão, sem `PRAGMA foreign_keys`, e as exclusões em cascata deixariam de valer.
 */
export function writeTransaction<T>(task: (db: SQLiteDatabase) => Promise<T>): Promise<T> {
  const run = writes.then(async () => {
    const db = await getDatabase();
    await db.execAsync('BEGIN');
    try {
      const result = await task(db);
      await db.execAsync('COMMIT');
      return result;
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
  });
  writes = run.catch(() => undefined);
  return run;
}

async function open(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync('shifty.db');
  // Fora de transação: dentro de uma, o SQLite ignora este PRAGMA.
  await db.execAsync('PRAGMA foreign_keys = ON');
  await migrate(db);
  return db;
}

async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (const [index, sql] of MIGRATIONS.entries()) {
    const version = index + 1;
    if (version > current) {
      await db.withTransactionAsync(async () => {
        await db.execAsync(sql);
        await db.execAsync(`PRAGMA user_version = ${version}`);
      });
    }
  }
}
