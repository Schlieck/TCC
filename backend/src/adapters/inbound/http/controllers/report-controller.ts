import type { Request, Response } from 'express';
import type { CreateSavedReport } from '../../../../application/use-cases/reports/create-saved-report.js';
import type { DeleteSavedReport } from '../../../../application/use-cases/reports/delete-saved-report.js';
import type { GetEmotionTrend } from '../../../../application/use-cases/reports/get-emotion-trend.js';
import type { GetSavedReport } from '../../../../application/use-cases/reports/get-saved-report.js';
import type { ListSavedReports } from '../../../../application/use-cases/reports/list-saved-reports.js';
import { currentUserId } from '../middlewares/authenticate.js';
import { idParamsSchema } from '../schemas/common-schemas.js';
import { savedReportBodySchema, trendQuerySchema } from '../schemas/report-schemas.js';
import { parseRequest } from '../validation.js';

export interface ReportUseCases {
  getEmotionTrend: GetEmotionTrend;
  listSavedReports: ListSavedReports;
  getSavedReport: GetSavedReport;
  createSavedReport: CreateSavedReport;
  deleteSavedReport: DeleteSavedReport;
}

export class ReportController {
  constructor(private readonly useCases: ReportUseCases) {}

  trend = async (request: Request, response: Response): Promise<void> => {
    const period = parseRequest(trendQuerySchema, request.query);
    response.json(
      await this.useCases.getEmotionTrend.execute({ userId: currentUserId(response), ...period }),
    );
  };

  listSaved = async (_request: Request, response: Response): Promise<void> => {
    response.json(await this.useCases.listSavedReports.execute(currentUserId(response)));
  };

  showSaved = async (request: Request, response: Response): Promise<void> => {
    const { id } = parseRequest(idParamsSchema, request.params);
    response.json(
      await this.useCases.getSavedReport.execute({ userId: currentUserId(response), reportId: id }),
    );
  };

  createSaved = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(savedReportBodySchema, request.body);
    const report = await this.useCases.createSavedReport.execute({
      userId: currentUserId(response),
      ...body,
    });
    response.status(201).json(report);
  };

  removeSaved = async (request: Request, response: Response): Promise<void> => {
    const { id } = parseRequest(idParamsSchema, request.params);
    await this.useCases.deleteSavedReport.execute({
      userId: currentUserId(response),
      reportId: id,
    });
    response.status(204).end();
  };
}
