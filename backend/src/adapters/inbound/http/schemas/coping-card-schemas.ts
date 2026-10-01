import { z } from 'zod';

export const groupBodySchema = z.object({
  name: z.string().max(60, 'Use no máximo 60 caracteres.'),
});

export const cardBodySchema = z.object({
  groupId: z.number('Escolha um grupo.').int().positive(),
  name: z.string().max(100, 'Use no máximo 100 caracteres.'),
  description: z.string().max(1000, 'Use no máximo 1000 caracteres.'),
});

export const cardListQuerySchema = z.object({
  groupId: z.coerce.number().int().positive().optional(),
});
