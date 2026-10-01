import { parseReportPeriod } from '../../../domain/report/report-period.js';
import { parseReportName } from '../../../domain/report/saved-report.js';
import type { UserId } from '../../../domain/user/user.js';
import type { SavedReportRepository } from '../../ports/saved-report-repository.js';
import { toSavedReportOutput, type SavedReportOutput } from './report-output.js';

export interface CreateSavedReportInput {
  userId: UserId;
  name: string;
  from: string;
  to: string;
}

export class CreateSavedReport {
  constructor(private readonly reports: SavedReportRepository) {}

  async execute({ userId, name, from, to }: CreateSavedReportInput): Promise<SavedReportOutput> {
    const report = await this.reports.create(
      userId,
      parseReportName(name),
      parseReportPeriod(from, to),
    );
    return toSavedReportOutput(report);
  }
}
