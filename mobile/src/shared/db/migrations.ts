/**
 * Esquema do banco local, uma entrada por versão (`PRAGMA user_version`). Nunca altere uma
 * versão já publicada: acrescente outra, para quem já tem dados no aparelho não perdê-los.
 */
const NOW = `(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

const timestamps = `
  created_at TEXT NOT NULL DEFAULT ${NOW},
  updated_at TEXT NOT NULL DEFAULT ${NOW}`;

const setUpdatedAt = (table: string) => `
  CREATE TRIGGER ${table}_set_updated_at AFTER UPDATE ON ${table} FOR EACH ROW
  BEGIN
    UPDATE ${table} SET updated_at = ${NOW} WHERE rowid = NEW.rowid;
  END;`;

const V1 = `
  CREATE TABLE profiles (
    uid TEXT PRIMARY KEY,
    name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
    phone TEXT NOT NULL CHECK (length(phone) BETWEEN 10 AND 11 AND phone NOT GLOB '*[^0-9]*'),
    birth_date TEXT NOT NULL CHECK (birth_date >= '1900-01-01'),
    privacy_consent_at TEXT NOT NULL,
    ${timestamps}
  );
  ${setUpdatedAt('profiles')}

  CREATE TABLE emotions (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    ${timestamps}
  );
  ${setUpdatedAt('emotions')}
  INSERT INTO emotions (id, slug, name) VALUES
    (1, 'anxiety', 'Ansiedade'),
    (2, 'sadness', 'Tristeza'),
    (3, 'anger', 'Raiva'),
    (4, 'fear', 'Medo'),
    (5, 'guilt', 'Culpa'),
    (6, 'shame', 'Vergonha'),
    (7, 'joy', 'Alegria'),
    (8, 'relief', 'Alívio');

  CREATE TABLE coping_card_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES profiles (uid) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
    ${timestamps},
    -- Alvo da FK composta de coping_cards: o grupo é do mesmo usuário do cartão.
    UNIQUE (id, user_id)
  );
  CREATE INDEX coping_card_groups_user_index ON coping_card_groups (user_id);
  ${setUpdatedAt('coping_card_groups')}

  CREATE TABLE coping_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES profiles (uid) ON DELETE CASCADE,
    group_id INTEGER NOT NULL,
    name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
    description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 1000),
    ${timestamps},
    FOREIGN KEY (group_id, user_id) REFERENCES coping_card_groups (id, user_id)
  );
  CREATE INDEX coping_cards_user_group_index ON coping_cards (user_id, group_id);
  ${setUpdatedAt('coping_cards')}

  CREATE TABLE thought_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES profiles (uid) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
    occurred_on TEXT NOT NULL,
    occurred_time TEXT NOT NULL,
    description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 5000),
    ${timestamps}
  );
  CREATE INDEX thought_records_user_date_index ON thought_records (user_id, occurred_on);
  ${setUpdatedAt('thought_records')}

  -- Sem user_id: pertence ao usuário por meio do registro, e some junto com ele (cascata).
  CREATE TABLE thought_record_emotions (
    thought_record_id INTEGER NOT NULL REFERENCES thought_records (id) ON DELETE CASCADE,
    emotion_id INTEGER NOT NULL REFERENCES emotions (id) ON DELETE RESTRICT,
    intensity INTEGER NOT NULL CHECK (intensity BETWEEN 0 AND 100),
    ${timestamps},
    PRIMARY KEY (thought_record_id, emotion_id)
  );
  ${setUpdatedAt('thought_record_emotions')}

  -- Só nome e período: os dados do gráfico são recalculados a partir dos registros.
  CREATE TABLE saved_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES profiles (uid) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    ${timestamps},
    CHECK (end_date >= start_date)
  );
  CREATE INDEX saved_reports_user_index ON saved_reports (user_id);
  ${setUpdatedAt('saved_reports')}
`;

export const MIGRATIONS: readonly string[] = [V1];
