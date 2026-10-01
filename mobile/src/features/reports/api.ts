import { z } from 'zod';
import { httpClient } from '@/shared/api/http-client';
import type { ReportPeriod } from './report-period';

const periodSchema = z.object({ from: z.string(), to: z.string() });

const emotionTrendSchema = z.object({
  period: periodSchema,
  granularity: z.enum(['day', 'week', 'month']),
  buckets: z.array(z.object({ start: z.string(), end: z.string() })),
  series: z.array(
    z.object({
      emotion: z.object({ id: z.number(), slug: z.string(), name: z.string() }),
      values: z.array(z.number().nullable()),
    }),
  ),
});

const savedReportSchema = z.object({
  id: z.number(),
  name: z.string(),
  period: periodSchema,
  createdAt: z.string(),
});

export type EmotionTrend = z.infer<typeof emotionTrendSchema>;
export type EmotionTrendSeries = EmotionTrend['series'][number];
export type SavedReport = z.infer<typeof savedReportSchema>;

export function fetchEmotionTrend(period: ReportPeriod): Promise<EmotionTrend> {
  return httpClient.request('/reports/emotion-trend', emotionTrendSchema, { query: { ...period } });
}

export function listSavedReports(): Promise<SavedReport[]> {
  return httpClient.request('/saved-reports', z.array(savedReportSchema));
}

export function createSavedReport(name: string, period: ReportPeriod): Promise<SavedReport> {
  return httpClient.request('/saved-reports', savedReportSchema, {
    method: 'POST',
    body: { name, ...period },
  });
}

export function deleteSavedReport(id: number): Promise<void> {
  return httpClient.execute(`/saved-reports/${id}`, { method: 'DELETE' });
}
