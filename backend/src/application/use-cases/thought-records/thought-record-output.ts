import type { ThoughtRecord } from '../../../domain/thought-record/thought-record.js';

export interface ThoughtRecordOutput {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  emotions: { emotionId: number; intensity: number }[];
  updatedAt: string;
}

export function toThoughtRecordOutput(record: ThoughtRecord): ThoughtRecordOutput {
  return {
    id: record.id,
    title: record.title,
    date: record.date,
    time: record.time,
    description: record.description,
    emotions: record.emotions.map(({ emotionId, intensity }) => ({ emotionId, intensity })),
    updatedAt: record.updatedAt.toISOString(),
  };
}
