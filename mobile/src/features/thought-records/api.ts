import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase, writeTransaction } from '@/shared/db/database';
import { AppError } from '@/shared/errors';
import { requireUid } from '@/shared/firebase/app';
import { parseInput } from '@/shared/parse-input';
import { thoughtRecordFormSchema } from './validation';

/** Emoção da lista pré-definida; `name` é o rótulo exibido. */
export interface Emotion {
  id: number;
  slug: string;
  name: string;
}

/** Intensidade estimada do sentimento, em porcentagem (seção 2.4.3 do TCC). */
export interface EmotionIntensity {
  emotionId: number;
  intensity: number;
}

export interface ThoughtRecordInput {
  title: string;
  date: string;
  time: string;
  description: string;
  emotions: EmotionIntensity[];
}

export interface ThoughtRecord extends ThoughtRecordInput {
  id: number;
}

export interface Period {
  from: string;
  to: string;
}

interface RecordRow {
  id: number;
  title: string;
  occurred_on: string;
  occurred_time: string;
  description: string;
}

interface RecordEmotionRow {
  thought_record_id: number;
  emotion_id: number;
  intensity: number;
}

export async function listEmotions(): Promise<Emotion[]> {
  const db = await getDatabase();
  return db.getAllAsync<Emotion>('SELECT id, slug, name FROM emotions ORDER BY id');
}

export async function listRecords(period?: Period): Promise<ThoughtRecord[]> {
  const uid = requireUid();
  return period
    ? queryRecords('r.user_id = ? AND r.occurred_on BETWEEN ? AND ?', [uid, period.from, period.to])
    : queryRecords('r.user_id = ?', [uid]);
}

export async function getRecord(id: number): Promise<ThoughtRecord> {
  const [record] = await queryRecords('r.id = ? AND r.user_id = ?', [id, requireUid()]);
  if (!record) {
    throw recordNotFound();
  }
  return record;
}

export async function createRecord(input: ThoughtRecordInput): Promise<ThoughtRecord> {
  const content = await parseRecord(input);
  const uid = requireUid();
  const id = await writeTransaction(async (db) => {
    const { lastInsertRowId } = await db.runAsync(
      `INSERT INTO thought_records (user_id, title, occurred_on, occurred_time, description)
       VALUES (?, ?, ?, ?, ?)`,
      uid,
      content.title,
      content.date,
      content.time,
      content.description,
    );
    await insertEmotions(db, lastInsertRowId, content.emotions);
    return lastInsertRowId;
  });
  return { id, ...content };
}

export async function updateRecord(id: number, input: ThoughtRecordInput): Promise<ThoughtRecord> {
  const content = await parseRecord(input);
  const uid = requireUid();
  await writeTransaction(async (db) => {
    const { changes } = await db.runAsync(
      `UPDATE thought_records SET title = ?, occurred_on = ?, occurred_time = ?, description = ?
       WHERE id = ? AND user_id = ?`,
      content.title,
      content.date,
      content.time,
      content.description,
      id,
      uid,
    );
    if (changes === 0) {
      throw recordNotFound();
    }
    await db.runAsync('DELETE FROM thought_record_emotions WHERE thought_record_id = ?', id);
    await insertEmotions(db, id, content.emotions);
  });
  return { id, ...content };
}

export async function deleteRecord(id: number): Promise<void> {
  const uid = requireUid();
  await writeTransaction(async (db) => {
    const { changes } = await db.runAsync(
      'DELETE FROM thought_records WHERE id = ? AND user_id = ?',
      id,
      uid,
    );
    if (changes === 0) {
      throw recordNotFound();
    }
  });
}

/** Valida o conteúdo e confere se todas as emoções existem na lista pré-definida. */
async function parseRecord(input: ThoughtRecordInput): Promise<ThoughtRecordInput> {
  const content = parseInput(thoughtRecordFormSchema, input);
  const knownIds = new Set((await listEmotions()).map((emotion) => emotion.id));
  if (content.emotions.some((emotion) => !knownIds.has(emotion.emotionId))) {
    throw new AppError('Sentimento desconhecido.', 'emotions');
  }
  return content;
}

async function insertEmotions(
  db: SQLiteDatabase,
  recordId: number,
  emotions: readonly EmotionIntensity[],
): Promise<void> {
  for (const { emotionId, intensity } of emotions) {
    await db.runAsync(
      `INSERT INTO thought_record_emotions (thought_record_id, emotion_id, intensity)
       VALUES (?, ?, ?)`,
      recordId,
      emotionId,
      intensity,
    );
  }
}

/** `where` sempre filtra por `r.user_id`; as emoções vêm pelos mesmos registros. */
async function queryRecords(where: string, params: (string | number)[]): Promise<ThoughtRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecordRow>(
    `SELECT r.id, r.title, r.occurred_on, r.occurred_time, r.description
     FROM thought_records r WHERE ${where}
     ORDER BY r.occurred_on DESC, r.occurred_time DESC, r.id DESC`,
    params,
  );
  const emotionRows = await db.getAllAsync<RecordEmotionRow>(
    `SELECT e.thought_record_id, e.emotion_id, e.intensity
     FROM thought_record_emotions e JOIN thought_records r ON r.id = e.thought_record_id
     WHERE ${where}
     ORDER BY e.intensity DESC, e.emotion_id ASC`,
    params,
  );

  const byRecord = new Map<number, EmotionIntensity[]>();
  for (const { thought_record_id, emotion_id, intensity } of emotionRows) {
    const list = byRecord.get(thought_record_id) ?? [];
    list.push({ emotionId: emotion_id, intensity });
    byRecord.set(thought_record_id, list);
  }
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    date: row.occurred_on,
    time: row.occurred_time,
    description: row.description,
    emotions: byRecord.get(row.id) ?? [],
  }));
}

function recordNotFound(): AppError {
  return new AppError('Registro não encontrado.');
}
