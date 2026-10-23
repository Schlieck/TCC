import { z } from 'zod';

export const REPORT_NAME_MAX_LENGTH = 80;

export const reportNameSchema = z
  .string()
  .trim()
  .min(1, 'Dê um nome ao relatório.')
  .max(REPORT_NAME_MAX_LENGTH, `Use no máximo ${REPORT_NAME_MAX_LENGTH} caracteres.`);
