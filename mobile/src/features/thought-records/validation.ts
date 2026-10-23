import { z } from 'zod';
import { isIsoDate, todayIso } from '@/shared/dates';

/** Vale para o formulário e para o que é gravado no banco local. */
export const thoughtRecordFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Dê um título ao registro.')
    .max(120, 'Use no máximo 120 caracteres.'),
  date: z
    .string()
    .refine(isIsoDate, 'Informe uma data válida.')
    .refine((date) => date <= todayIso(), 'A data não pode estar no futuro.'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe um horário válido.'),
  description: z
    .string()
    .trim()
    .min(1, 'Descreva o que aconteceu e o que você pensou.')
    .max(5000, 'Use no máximo 5000 caracteres.'),
  emotions: z
    .array(
      z.object({
        emotionId: z.number().int(),
        intensity: z
          .number()
          .int('A intensidade vai de 0 a 100%.')
          .min(0, 'A intensidade vai de 0 a 100%.')
          .max(100, 'A intensidade vai de 0 a 100%.'),
      }),
    )
    .min(1, 'Adicione pelo menos um sentimento.')
    .refine(
      (emotions) => new Set(emotions.map((emotion) => emotion.emotionId)).size === emotions.length,
      'Cada sentimento só pode aparecer uma vez.',
    ),
});

export type ThoughtRecordFormValues = z.infer<typeof thoughtRecordFormSchema>;
