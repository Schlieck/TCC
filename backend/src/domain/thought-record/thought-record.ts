import { parseCalendarDate, type CalendarDate } from '../shared/calendar-date.js';
import { NotFoundError, ValidationError } from '../shared/errors.js';
import { parseRequiredText } from '../shared/text.js';
import { parseTimeOfDay, type TimeOfDay } from '../shared/time-of-day.js';
import type { UserId } from '../user/user.js';
import type { EmotionId } from './emotion.js';

export type ThoughtRecordId = number;

/** Intensidade estimada do sentimento, em porcentagem (seção 2.4.3 do TCC). */
export interface EmotionIntensity {
  readonly emotionId: EmotionId;
  readonly intensity: number;
}

export interface ThoughtRecord {
  readonly id: ThoughtRecordId;
  readonly userId: UserId;
  readonly title: string;
  readonly date: CalendarDate;
  readonly time: TimeOfDay;
  readonly description: string;
  readonly emotions: readonly EmotionIntensity[];
  readonly updatedAt: Date;
}

export type ThoughtRecordContent = Pick<
  ThoughtRecord,
  'title' | 'date' | 'time' | 'description' | 'emotions'
>;

export interface RawThoughtRecordContent {
  title: string;
  date: string;
  time: string;
  description: string;
  emotions: readonly EmotionIntensity[];
}

export const RECORD_TITLE_MAX_LENGTH = 120;
export const RECORD_DESCRIPTION_MAX_LENGTH = 5000;

export function parseThoughtRecordContent(
  raw: RawThoughtRecordContent,
  today: CalendarDate,
): ThoughtRecordContent {
  const date = parseCalendarDate(raw.date);
  if (date > today) {
    throw new ValidationError('FUTURE_RECORD_DATE', 'Record date is in the future', 'date');
  }
  return {
    title: parseRequiredText(raw.title, {
      field: 'title',
      code: 'INVALID_RECORD_TITLE',
      max: RECORD_TITLE_MAX_LENGTH,
    }),
    date,
    time: parseTimeOfDay(raw.time),
    description: parseRequiredText(raw.description, {
      field: 'description',
      code: 'INVALID_RECORD_DESCRIPTION',
      max: RECORD_DESCRIPTION_MAX_LENGTH,
    }),
    emotions: parseEmotionIntensities(raw.emotions),
  };
}

function parseEmotionIntensities(
  emotions: readonly EmotionIntensity[],
): readonly EmotionIntensity[] {
  if (emotions.length === 0) {
    throw new ValidationError('EMOTIONS_REQUIRED', 'At least one emotion is required', 'emotions');
  }
  const ids = new Set(emotions.map((emotion) => emotion.emotionId));
  if (ids.size !== emotions.length) {
    throw new ValidationError('DUPLICATED_EMOTION', 'Each emotion can appear once', 'emotions');
  }
  if (
    emotions.some(
      ({ intensity }) => !Number.isInteger(intensity) || intensity < 0 || intensity > 100,
    )
  ) {
    throw new ValidationError('INVALID_INTENSITY', 'Intensity must be 0 to 100', 'emotions');
  }
  return emotions.map(({ emotionId, intensity }) => ({ emotionId, intensity }));
}

export function thoughtRecordNotFound(): NotFoundError {
  return new NotFoundError('THOUGHT_RECORD_NOT_FOUND', 'Thought record not found');
}
