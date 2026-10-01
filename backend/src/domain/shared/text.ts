import { ValidationError, type DomainErrorCode } from './errors.js';

interface TextRule {
  field: string;
  code: DomainErrorCode;
  max: number;
}

/** Texto obrigatório: sem espaços nas pontas, com 1 a `max` caracteres. */
export function parseRequiredText(raw: string, { field, code, max }: TextRule): string {
  const text = raw.trim();
  if (text.length === 0 || text.length > max) {
    throw new ValidationError(code, `${field} must have 1 to ${max} characters`, field);
  }
  return text;
}
