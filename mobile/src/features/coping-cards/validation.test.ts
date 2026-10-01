import { describe, expect, it } from 'vitest';
import { copingCardFormSchema, groupNameSchema } from './validation';

describe('copingCardFormSchema', () => {
  it('accepts a card with name, description and group', () => {
    const result = copingCardFormSchema.safeParse({
      name: ' Respire ',
      description: 'Inspire contando até 4.',
      groupId: 3,
    });

    expect(result.success && result.data).toEqual({
      name: 'Respire',
      description: 'Inspire contando até 4.',
      groupId: 3,
    });
  });

  it('asks for a group when none was chosen', () => {
    const result = copingCardFormSchema.safeParse({
      name: 'Respire',
      description: 'Inspire.',
      groupId: null,
    });

    expect(result.success ? [] : result.error.issues.map((issue) => issue.message)).toEqual([
      'Escolha ou crie um grupo.',
    ]);
  });

  it('rejects blank text', () => {
    const result = copingCardFormSchema.safeParse({ name: '  ', description: '', groupId: 1 });

    expect(result.success ? [] : result.error.issues.map((issue) => issue.path[0])).toEqual([
      'name',
      'description',
    ]);
  });
});

describe('groupNameSchema', () => {
  it('trims and limits the group name', () => {
    expect(groupNameSchema.parse('  Ansiedade ')).toBe('Ansiedade');
    expect(groupNameSchema.safeParse('x'.repeat(61)).success).toBe(false);
  });
});
