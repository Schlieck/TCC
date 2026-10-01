import type { EmotionRepository } from '../../../src/application/ports/emotion-repository.js';
import type { Emotion } from '../../../src/domain/thought-record/emotion.js';

/** Mesma lista e ids da migration de emoções. */
export const EMOTIONS: Emotion[] = [
  { id: 1, slug: 'anxiety', name: 'Ansiedade' },
  { id: 2, slug: 'sadness', name: 'Tristeza' },
  { id: 3, slug: 'anger', name: 'Raiva' },
  { id: 4, slug: 'fear', name: 'Medo' },
  { id: 5, slug: 'guilt', name: 'Culpa' },
  { id: 6, slug: 'shame', name: 'Vergonha' },
  { id: 7, slug: 'joy', name: 'Alegria' },
  { id: 8, slug: 'relief', name: 'Alívio' },
];

export class InMemoryEmotionRepository implements EmotionRepository {
  listAll(): Promise<Emotion[]> {
    return Promise.resolve(EMOTIONS);
  }
}
