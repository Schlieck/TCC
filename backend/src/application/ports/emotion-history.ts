import type { EmotionEntry } from '../../domain/report/emotion-trend.js';
import type { DateRange } from '../../domain/shared/date-range.js';
import type { UserId } from '../../domain/user/user.js';

/** Intensidades registradas pelo usuário no período, lidas dos registros de pensamento. */
export interface EmotionHistory {
  entriesBetween(userId: UserId, period: DateRange): Promise<EmotionEntry[]>;
}
