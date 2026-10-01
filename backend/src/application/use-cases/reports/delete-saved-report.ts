import { savedReportNotFound, type SavedReportId } from '../../../domain/report/saved-report.js';
import type { UserId } from '../../../domain/user/user.js';
import type { SavedReportRepository } from '../../ports/saved-report-repository.js';

export interface DeleteSavedReportInput {
  userId: UserId;
  reportId: SavedReportId;
}

export class DeleteSavedReport {
  constructor(private readonly reports: SavedReportRepository) {}

  async execute({ userId, reportId }: DeleteSavedReportInput): Promise<void> {
    if (!(await this.reports.delete(userId, reportId))) {
      throw savedReportNotFound();
    }
  }
}
