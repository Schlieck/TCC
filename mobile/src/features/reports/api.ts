import { listEmotions } from '@/features/thought-records/api';
import { getDatabase, writeTransaction } from '@/shared/db/database';
import { AppError } from '@/shared/errors';
import { requireUid } from '@/shared/firebase/app';
import { parseInput } from '@/shared/parse-input';
import {
  buildEmotionTrend,
  parseReportPeriod,
  type EmotionEntry,
  type EmotionTrend,
} from './emotion-trend';
import type { ReportPeriod } from './report-period';
import { reportNameSchema } from './validation';

/** Só nome e período: o gráfico é sempre recalculado a partir dos registros. */
export interface SavedReport {
  id: number;
  name: string;
  period: ReportPeriod;
}

interface EntryRow {
  occurred_on: string;
  emotion_id: number;
  intensity: number;
}

interface SavedReportRow {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

/** RF003: intensidade média de cada emoção ao longo do período escolhido. */
export async function fetchEmotionTrend({ from, to }: ReportPeriod): Promise<EmotionTrend> {
  const period = parseReportPeriod(from, to);
  const db = await getDatabase();
  const [emotions, rows] = await Promise.all([
    listEmotions(),
    db.getAllAsync<EntryRow>(
      `SELECT r.occurred_on, e.emotion_id, e.intensity
       FROM thought_record_emotions e JOIN thought_records r ON r.id = e.thought_record_id
       WHERE r.user_id = ? AND r.occurred_on BETWEEN ? AND ?`,
      requireUid(),
      period.from,
      period.to,
    ),
  ]);
  const entries: EmotionEntry[] = rows.map((row) => ({
    date: row.occurred_on,
    emotionId: row.emotion_id,
    intensity: row.intensity,
  }));
  return buildEmotionTrend(period, emotions, entries);
}

export async function listSavedReports(): Promise<SavedReport[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SavedReportRow>(
    `SELECT id, name, start_date, end_date FROM saved_reports WHERE user_id = ?
     ORDER BY created_at DESC, id DESC`,
    requireUid(),
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    period: { from: row.start_date, to: row.end_date },
  }));
}

export async function createSavedReport(
  rawName: string,
  { from, to }: ReportPeriod,
): Promise<SavedReport> {
  const name = parseInput(reportNameSchema, rawName);
  const period = parseReportPeriod(from, to);
  const uid = requireUid();
  return writeTransaction(async (db) => {
    const { lastInsertRowId } = await db.runAsync(
      'INSERT INTO saved_reports (user_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
      uid,
      name,
      period.from,
      period.to,
    );
    return { id: lastInsertRowId, name, period };
  });
}

export async function deleteSavedReport(id: number): Promise<void> {
  const uid = requireUid();
  await writeTransaction(async (db) => {
    const { changes } = await db.runAsync(
      'DELETE FROM saved_reports WHERE id = ? AND user_id = ?',
      id,
      uid,
    );
    if (changes === 0) {
      throw new AppError('Relatório não encontrado.');
    }
  });
}
