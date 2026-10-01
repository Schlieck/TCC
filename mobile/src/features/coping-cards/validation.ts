import { z } from 'zod';

export const groupNameSchema = z
  .string()
  .trim()
  .min(1, 'Dê um nome ao grupo.')
  .max(60, 'Use no máximo 60 caracteres.');

export const copingCardFormSchema = z.object({
  name: z.string().trim().min(1, 'Dê um nome ao cartão.').max(100, 'Use no máximo 100 caracteres.'),
  description: z
    .string()
    .trim()
    .min(1, 'Escreva o que o cartão deve lembrar você.')
    .max(1000, 'Use no máximo 1000 caracteres.'),
  groupId: z
    .number({ error: 'Escolha um grupo.' })
    .nullable()
    .refine((id) => id !== null, {
      message: 'Escolha ou crie um grupo.',
    }),
});

export type CopingCardFormValues = z.input<typeof copingCardFormSchema>;
