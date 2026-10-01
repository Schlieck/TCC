import type { UserId } from '../../../domain/user/user.js';
import type { SavedReportRepository } from '../../ports/saved-report-repository.js';
import { toSavedReportOutput, type SavedReportOutput } from './report-output.js';

export class ListSavedReports {
  constructor(private readonly reports: SavedReportRepository) {}

  async execute(userId: UserId): Promise<SavedReportOutput[]> {
    const reports = await this.reports.listByUser(userId);
    return reports.map(toSavedReportOutput);
  }
}
