import { ValidationError } from '../../../domain/shared/errors.js';
import {
  parseThoughtRecordContent,
  type RawThoughtRecordContent,
  type ThoughtRecordContent,
} from '../../../domain/thought-record/thought-record.js';
import type { Clock } from '../../ports/clock.js';
import type { EmotionRepository } from '../../ports/emotion-repository.js';

/** Valida o conteúdo e confere se todas as emoções existem na lista pré-definida. */
export async function parseRecordContent(
  raw: RawThoughtRecordContent,
  emotions: EmotionRepository,
  clock: Clock,
): Promise<ThoughtRecordContent> {
  const content = parseThoughtRecordContent(raw, clock.today());
  const knownIds = new Set((await emotions.listAll()).map((emotion) => emotion.id));
  if (content.emotions.some((emotion) => !knownIds.has(emotion.emotionId))) {
    throw new ValidationError('UNKNOWN_EMOTION', 'Unknown emotion', 'emotions');
  }
  return content;
}
