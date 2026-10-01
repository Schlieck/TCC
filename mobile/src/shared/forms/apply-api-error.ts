import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError, errorMessage } from '../api/errors';

/**
 * Leva os erros de campo devolvidos pela API para os campos do formulário.
 * Devolve a mensagem geral a exibir, ou `null` se todos os erros couberem em campos.
 */
export function applyApiError<Values extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<Values>,
  fields: readonly Path<Values>[],
): string | null {
  if (!(error instanceof ApiError) || error.details.length === 0) {
    return errorMessage(error);
  }

  let hasUnmatchedDetail = false;
  for (const detail of error.details) {
    const field = fields.find((candidate) => candidate === detail.field);
    if (field) {
      setError(field, { type: 'server', message: detail.message });
    } else {
      hasUnmatchedDetail = true;
    }
  }
  return hasUnmatchedDetail ? error.message : null;
}
