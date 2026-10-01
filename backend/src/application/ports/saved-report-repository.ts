import type { SavedReport, SavedReportId } from '../../domain/report/saved-report.js';
import type { DateRange } from '../../domain/shared/date-range.js';
import type { UserId } from '../../domain/user/user.js';

/** Todas as operações são restritas aos relatórios do próprio usuário. */
export interface SavedReportRepository {
  /** Mais recentes primeiro. */
  listByUser(userId: UserId): Promise<SavedReport[]>;
  findById(userId: UserId, id: SavedReportId): Promise<SavedReport | null>;
  create(userId: UserId, name: string, period: DateRange): Promise<SavedReport>;
  /** Devolve `false` se o relatório não existir para esse usuário. */
  delete(userId: UserId, id: SavedReportId): Promise<boolean>;
}
