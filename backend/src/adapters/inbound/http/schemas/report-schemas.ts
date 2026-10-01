import { z } from 'zod';

const isoDate = z.iso.date('Use o formato AAAA-MM-DD.');

export const trendQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
});

export const savedReportBodySchema = z.object({
  name: z.string().max(80, 'Use no máximo 80 caracteres.'),
  from: isoDate,
  to: isoDate,
});
