import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AppError } from './errors';
import { parseInput } from './parse-input';

const schema = z.object({ name: z.string().trim().min(1, 'Dê um nome.') });

describe('parseInput', () => {
  it('returns the parsed value', () => {
    expect(parseInput(schema, { name: ' Casa ' })).toEqual({ name: 'Casa' });
  });

  it('throws the first message tied to its field', () => {
    expect(() => parseInput(schema, { name: ' ' })).toThrow(new AppError('Dê um nome.', 'name'));
  });

  it('leaves the field empty when the value itself is invalid', () => {
    try {
      parseInput(z.string().min(1, 'Vazio.'), '');
    } catch (error) {
      expect(error).toEqual(new AppError('Vazio.'));
      expect((error as AppError).field).toBeUndefined();
    }
  });
});
