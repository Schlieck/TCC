import { z } from 'zod';

export const periodQuerySchema = z.object({
  from: z.iso.date('Use o formato AAAA-MM-DD.').optional(),
  to: z.iso.date('Use o formato AAAA-MM-DD.').optional(),
});

export const thoughtRecordBodySchema = z.object({
  title: z.string().max(120, 'Use no máximo 120 caracteres.'),
  date: z.iso.date('Use o formato AAAA-MM-DD.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Use o formato HH:MM.'),
  description: z.string().max(5000, 'Use no máximo 5000 caracteres.'),
  emotions: z
    .array(
      z.object({
        emotionId: z.number().int().positive(),
        intensity: z.number().int().min(0).max(100),
      }),
    )
    .max(20),
});
