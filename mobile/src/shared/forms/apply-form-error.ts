import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { AppError, errorMessage } from '../errors';

/**
 * Leva um erro ligado a um campo para o campo do formulário.
 * Devolve a mensagem geral a exibir, ou `null` se o erro coube num campo.
 */
export function applyFormError<Values extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<Values>,
  fields: readonly Path<Values>[],
): string | null {
  const field =
    error instanceof AppError ? fields.find((candidate) => candidate === error.field) : undefined;
  if (!field) {
    return errorMessage(error);
  }
  setError(field, { type: 'server', message: errorMessage(error) });
  return null;
}
