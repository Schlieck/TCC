import { describe, expect, it } from 'vitest';
import { parseCalendarDate } from '../../../src/domain/shared/calendar-date.js';
import { ValidationError } from '../../../src/domain/shared/errors.js';
import { parseEmail } from '../../../src/domain/user/email.js';
import { assertStrongPassword } from '../../../src/domain/user/password-policy.js';
import { parsePhone } from '../../../src/domain/user/phone.js';
import { assertValidBirthDate, parsePersonName } from '../../../src/domain/user/user.js';

describe('parseEmail', () => {
  it('normalizes case and surrounding spaces', () => {
    expect(parseEmail('  Ana.Souza@Example.COM ')).toBe('ana.souza@example.com');
  });

  it.each(['ana', 'ana@', 'ana@example', 'a na@example.com'])('rejects "%s"', (raw) => {
    expect(() => parseEmail(raw)).toThrow(ValidationError);
  });
});

describe('parsePhone', () => {
  it('keeps only the digits of a formatted number', () => {
    expect(parsePhone('(49) 99999-0000')).toBe('49999990000');
  });

  it('accepts a 10-digit landline', () => {
    expect(parsePhone('4933334444')).toBe('4933334444');
  });

  it.each(['999990000', '499999900001', '49 9999-ABCD'])('rejects "%s"', (raw) => {
    expect(() => parsePhone(raw)).toThrow(ValidationError);
  });
});

describe('assertStrongPassword', () => {
  it('accepts letters and numbers with at least 8 characters', () => {
    expect(() => {
      assertStrongPassword('senhaboa1');
    }).not.toThrow();
  });

  it.each(['curta1', 'somenteletras', '12345678', 'a1'.repeat(37)])('rejects "%s"', (plain) => {
    expect(() => {
      assertStrongPassword(plain);
    }).toThrow(ValidationError);
  });
});

describe('parsePersonName', () => {
  it('trims and collapses inner spaces', () => {
    expect(parsePersonName('  Ana   Souza ')).toBe('Ana Souza');
  });

  it('rejects a one-letter name', () => {
    expect(() => parsePersonName(' A ')).toThrow(ValidationError);
  });
});

describe('parseCalendarDate', () => {
  it('accepts an existing day', () => {
    expect(parseCalendarDate('2024-02-29')).toBe('2024-02-29');
  });

  it.each(['2023-02-29', '2026-13-01', '01/10/2026', '2026-1-1'])('rejects "%s"', (raw) => {
    expect(() => parseCalendarDate(raw)).toThrow(ValidationError);
  });
});

describe('assertValidBirthDate', () => {
  const today = parseCalendarDate('2026-10-01');

  it('accepts a date in the past', () => {
    expect(() => {
      assertValidBirthDate(parseCalendarDate('1998-04-12'), today);
    }).not.toThrow();
  });

  it.each(['2026-10-01', '2030-01-01', '1899-12-31'])('rejects %s', (raw) => {
    expect(() => {
      assertValidBirthDate(parseCalendarDate(raw), today);
    }).toThrow(ValidationError);
  });
});
