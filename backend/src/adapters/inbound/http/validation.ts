import { z } from 'zod';
import { HttpError } from './http-error.js';

z.config(z.locales.ptBR());

export function parseRequest<Schema extends z.ZodType>(
  schema: Schema,
  data: unknown,
): z.infer<Schema> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'Alguns campos estão inválidos.',
      result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    );
  }
  return result.data;
}
