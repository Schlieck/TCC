import type { DateRange } from '../shared/date-range.js';
import { NotFoundError } from '../shared/errors.js';
import { parseRequiredText } from '../shared/text.js';
import type { UserId } from '../user/user.js';

export type SavedReportId = number;

/** Só nome e período: os dados do gráfico são sempre recalculados a partir dos registros. */
export interface SavedReport {
  readonly id: SavedReportId;
  readonly userId: UserId;
  readonly name: string;
  readonly period: DateRange;
  readonly createdAt: Date;
}

export const REPORT_NAME_MAX_LENGTH = 80;

export function parseReportName(raw: string): string {
  return parseRequiredText(raw, {
    field: 'name',
    code: 'INVALID_REPORT_NAME',
    max: REPORT_NAME_MAX_LENGTH,
  });
}

export function savedReportNotFound(): NotFoundError {
  return new NotFoundError('SAVED_REPORT_NOT_FOUND', 'Saved report not found');
}
