import { z } from 'zod';
import { httpClient } from '@/shared/api/http-client';

const emotionSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
});

const emotionIntensitySchema = z.object({
  emotionId: z.number(),
  intensity: z.number(),
});

const thoughtRecordSchema = z.object({
  id: z.number(),
  title: z.string(),
  date: z.string(),
  time: z.string(),
  description: z.string(),
  emotions: z.array(emotionIntensitySchema),
  updatedAt: z.string(),
});

export type Emotion = z.infer<typeof emotionSchema>;
export type EmotionIntensity = z.infer<typeof emotionIntensitySchema>;
export type ThoughtRecord = z.infer<typeof thoughtRecordSchema>;

export interface ThoughtRecordInput {
  title: string;
  date: string;
  time: string;
  description: string;
  emotions: EmotionIntensity[];
}

export interface Period {
  from: string;
  to: string;
}

export function listEmotions(): Promise<Emotion[]> {
  return httpClient.request('/emotions', z.array(emotionSchema));
}

export function listRecords(period?: Period): Promise<ThoughtRecord[]> {
  return httpClient.request('/thought-records', z.array(thoughtRecordSchema), {
    query: { from: period?.from, to: period?.to },
  });
}

export function getRecord(id: number): Promise<ThoughtRecord> {
  return httpClient.request(`/thought-records/${id}`, thoughtRecordSchema);
}

export function createRecord(input: ThoughtRecordInput): Promise<ThoughtRecord> {
  return httpClient.request('/thought-records', thoughtRecordSchema, {
    method: 'POST',
    body: input,
  });
}

export function updateRecord(id: number, input: ThoughtRecordInput): Promise<ThoughtRecord> {
  return httpClient.request(`/thought-records/${id}`, thoughtRecordSchema, {
    method: 'PUT',
    body: input,
  });
}

export function deleteRecord(id: number): Promise<void> {
  return httpClient.execute(`/thought-records/${id}`, { method: 'DELETE' });
}
