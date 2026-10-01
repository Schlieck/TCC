import type { Emotion } from '../../domain/thought-record/emotion.js';

export interface EmotionRepository {
  listAll(): Promise<Emotion[]>;
}
