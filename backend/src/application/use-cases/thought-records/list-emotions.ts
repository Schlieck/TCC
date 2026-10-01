import type { Emotion } from '../../../domain/thought-record/emotion.js';
import type { EmotionRepository } from '../../ports/emotion-repository.js';

export type EmotionOutput = Emotion;

export class ListEmotions {
  constructor(private readonly emotions: EmotionRepository) {}

  async execute(): Promise<EmotionOutput[]> {
    const emotions = await this.emotions.listAll();
    return emotions.map(({ id, slug, name }) => ({ id, slug, name }));
  }
}
