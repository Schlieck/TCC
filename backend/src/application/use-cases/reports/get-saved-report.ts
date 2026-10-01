import { savedReportNotFound, type SavedReportId } from '../../../domain/report/saved-report.js';
import type { UserId } from '../../../domain/user/user.js';
import type { SavedReportRepository } from '../../ports/saved-report-repository.js';
import { toSavedReportOutput, type SavedReportOutput } from './report-output.js';

export interface GetSavedReportInput {
  userId: UserId;
  reportId: SavedReportId;
}

export class GetSavedReport {
  constructor(private readonly reports: SavedReportRepository) {}

  async execute({ userId, reportId }: GetSavedReportInput): Promise<SavedReportOutput> {
    const report = await this.reports.findById(userId, reportId);
    if (!report) {
      throw savedReportNotFound();
    }
    return toSavedReportOutput(report);
  }
}
