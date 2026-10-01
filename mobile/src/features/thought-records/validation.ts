import { z } from 'zod';
import { todayIso } from '@/shared/dates';

export const thoughtRecordFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Dê um título ao registro.')
    .max(120, 'Use no máximo 120 caracteres.'),
  date: z.string().refine((date) => date <= todayIso(), 'A data não pode estar no futuro.'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe um horário válido.'),
  description: z
    .string()
    .trim()
    .min(1, 'Descreva o que aconteceu e o que você pensou.')
    .max(5000, 'Use no máximo 5000 caracteres.'),
  emotions: z
    .array(
      z.object({
        emotionId: z.number(),
        intensity: z.number().int().min(0).max(100),
      }),
    )
    .min(1, 'Adicione pelo menos um sentimento.'),
});

export type ThoughtRecordFormValues = z.infer<typeof thoughtRecordFormSchema>;
