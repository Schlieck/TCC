import type { z } from 'zod';
import { AppError } from './errors';

/**
 * Valida o que vai para o banco local com o mesmo schema do formulário. O primeiro problema
 * vira um `AppError` ligado ao campo, para o formulário mostrar a mensagem no lugar certo.
 */
export function parseInput<Schema extends z.ZodType>(
  schema: Schema,
  input: z.input<Schema>,
): z.output<Schema> {
  const parsed = schema.safeParse(input);
  if (parsed.success) {
    return parsed.data;
  }
  const issue = parsed.error.issues[0];
  const field = issue?.path[0];
  throw new AppError(
    issue?.message ?? 'Confira os dados e tente novamente.',
    typeof field === 'string' ? field : undefined,
  );
}
