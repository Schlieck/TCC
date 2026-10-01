import { describe, expect, it } from 'vitest';
import { EDUCATION_TOPICS, findTopic } from './content';

describe('education content', () => {
  it('has the six topics of Figure 10, in order', () => {
    expect(EDUCATION_TOPICS.map((topic) => topic.slug)).toEqual([
      'socratic-questioning',
      'beliefs',
      'core-belief-categories',
      'coping-cards',
      'judith-beck',
      'thought-records',
    ]);
  });

  it('gives every topic some text', () => {
    for (const topic of EDUCATION_TOPICS) {
      expect(topic.blocks.length, topic.slug).toBeGreaterThan(0);
    }
  });

  it('finds topics by slug, including the ones linked from other tabs', () => {
    expect(findTopic('coping-cards')?.title).toBe('Cartões de enfrentamento');
    expect(findTopic('thought-records')?.title).toBe('A importância do registro de pensamentos');
    expect(findTopic('unknown')).toBeUndefined();
  });
});
