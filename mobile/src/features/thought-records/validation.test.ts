import { addDays } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { toIsoDate, todayIso } from '@/shared/dates';
import { thoughtRecordFormSchema, type ThoughtRecordFormValues } from './validation';

const valid: ThoughtRecordFormValues = {
  title: ' Prova ',
  date: todayIso(),
  time: '08:30',
  description: 'Achei que ia mal.',
  emotions: [{ emotionId: 1, intensity: 80 }],
};

function firstError(values: ThoughtRecordFormValues): string | undefined {
  const result = thoughtRecordFormSchema.safeParse(values);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('thoughtRecordFormSchema', () => {
  it('accepts today and trims the texts', () => {
    const result = thoughtRecordFormSchema.safeParse(valid);

    expect(result.success && result.data.title).toBe('Prova');
  });

  it('rejects a future or nonexistent date', () => {
    expect(firstError({ ...valid, date: toIsoDate(addDays(new Date(), 1)) })).toBe(
      'A data não pode estar no futuro.',
    );
    expect(firstError({ ...valid, date: '2026-02-30' })).toBe('Informe uma data válida.');
  });

  it('enforces the length limits', () => {
    expect(firstError({ ...valid, title: 'a'.repeat(121) })).toBe('Use no máximo 120 caracteres.');
    expect(firstError({ ...valid, description: '   ' })).toBe(
      'Descreva o que aconteceu e o que você pensou.',
    );
    expect(firstError({ ...valid, description: 'a'.repeat(5001) })).toBe(
      'Use no máximo 5000 caracteres.',
    );
  });

  it('requires distinct emotions with an integer intensity from 0 to 100', () => {
    expect(firstError({ ...valid, emotions: [] })).toBe('Adicione pelo menos um sentimento.');
    expect(
      firstError({
        ...valid,
        emotions: [
          { emotionId: 1, intensity: 10 },
          { emotionId: 1, intensity: 20 },
        ],
      }),
    ).toBe('Cada sentimento só pode aparecer uma vez.');
    for (const intensity of [-1, 101, 50.5]) {
      expect(firstError({ ...valid, emotions: [{ emotionId: 1, intensity }] })).toBe(
        'A intensidade vai de 0 a 100%.',
      );
    }
  });
});
