import { DatabaseSync } from 'node:sqlite';
import { beforeEach, describe, expect, it } from 'vitest';
import { MIGRATIONS } from './migrations';

// O node:sqlite roda o mesmo SQL do expo-sqlite, o que permite testar o esquema sem aparelho.
let db: DatabaseSync;

function count(table: string): number {
  const row = db.prepare(`SELECT count(*) AS total FROM ${table}`).get() as { total: number };
  return row.total;
}

function addProfile(uid: string): void {
  db.prepare(
    `INSERT INTO profiles (uid, name, phone, birth_date, privacy_consent_at)
     VALUES (?, 'Ana', '49999990000', '1990-01-01', '2026-10-01T00:00:00.000Z')`,
  ).run(uid);
}

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  for (const sql of MIGRATIONS) {
    db.exec(sql);
  }
  addProfile('ana');
  addProfile('bia');
});

describe('local schema', () => {
  it('ships the fixed list of 8 emotions', () => {
    expect(count('emotions')).toBe(8);
  });

  it('deletes every row of a user, and only of that user, with the profile', () => {
    for (const uid of ['ana', 'bia']) {
      const group = db
        .prepare('INSERT INTO coping_card_groups (user_id, name) VALUES (?, ?)')
        .run(uid, 'Casa');
      db.prepare(
        'INSERT INTO coping_cards (user_id, group_id, name, description) VALUES (?, ?, ?, ?)',
      ).run(uid, group.lastInsertRowid, 'Respirar', 'Contar até dez');
      const record = db
        .prepare(
          `INSERT INTO thought_records (user_id, title, occurred_on, occurred_time, description)
           VALUES (?, 'Prova', '2026-10-01', '10:00', 'Pensei que ia mal')`,
        )
        .run(uid);
      db.prepare(
        'INSERT INTO thought_record_emotions (thought_record_id, emotion_id, intensity) VALUES (?, 1, 80)',
      ).run(record.lastInsertRowid);
      db.prepare(
        `INSERT INTO saved_reports (user_id, name, start_date, end_date)
         VALUES (?, 'Outubro', '2026-10-01', '2026-10-31')`,
      ).run(uid);
    }

    db.prepare('DELETE FROM profiles WHERE uid = ?').run('ana');

    for (const table of [
      'coping_card_groups',
      'coping_cards',
      'thought_records',
      'thought_record_emotions',
      'saved_reports',
    ]) {
      expect(count(table)).toBe(1);
    }
  });

  it('refuses a card in a group of another user', () => {
    const group = db
      .prepare('INSERT INTO coping_card_groups (user_id, name) VALUES (?, ?)')
      .run('bia', 'Casa');

    expect(() =>
      db
        .prepare(
          'INSERT INTO coping_cards (user_id, group_id, name, description) VALUES (?, ?, ?, ?)',
        )
        .run('ana', group.lastInsertRowid, 'Respirar', 'Contar até dez'),
    ).toThrow(/FOREIGN KEY/);
  });

  it('enforces intensity, period order and phone digits', () => {
    const record = db
      .prepare(
        `INSERT INTO thought_records (user_id, title, occurred_on, occurred_time, description)
         VALUES ('ana', 'Prova', '2026-10-01', '10:00', 'Pensei que ia mal')`,
      )
      .run();

    expect(() =>
      db
        .prepare(
          'INSERT INTO thought_record_emotions (thought_record_id, emotion_id, intensity) VALUES (?, 1, 101)',
        )
        .run(record.lastInsertRowid),
    ).toThrow(/CHECK/);
    expect(() =>
      db
        .prepare(
          `INSERT INTO saved_reports (user_id, name, start_date, end_date)
           VALUES ('ana', 'Invertido', '2026-10-31', '2026-10-01')`,
        )
        .run(),
    ).toThrow(/CHECK/);
    expect(() =>
      db
        .prepare(
          `INSERT INTO profiles (uid, name, phone, birth_date, privacy_consent_at)
           VALUES ('caio', 'Caio', '(49)9999-000', '1990-01-01', '2026-10-01')`,
        )
        .run(),
    ).toThrow(/CHECK/);
  });

  it('refreshes updated_at on update', () => {
    db.prepare(`UPDATE profiles SET updated_at = '2000-01-01' WHERE uid = 'ana'`).run();
    db.prepare(`UPDATE profiles SET name = 'Ana Paula' WHERE uid = 'ana'`).run();

    const row = db.prepare(`SELECT updated_at FROM profiles WHERE uid = 'ana'`).get() as {
      updated_at: string;
    };
    expect(row.updated_at > '2026').toBe(true);
  });
});
