import { describe, expect, it } from 'vitest';
import { brDateToIso, formatDateInput, formatPhone, isoToBrDate, onlyDigits } from './masks';

describe('formatPhone', () => {
  it.each([
    ['', ''],
    ['4', '(4'],
    ['499', '(49) 9'],
    ['49999990000', '(49) 99999-0000'],
    ['4933334444', '(49) 3333-4444'],
    ['(49) 99999-00001', '(49) 99999-0000'],
  ])('formats "%s" as "%s"', (input, expected) => {
    expect(formatPhone(input)).toBe(expected);
  });
});

describe('formatDateInput', () => {
  it.each([
    ['1', '1'],
    ['1204', '12/04'],
    ['12041998', '12/04/1998'],
    ['12/04/19989', '12/04/1998'],
  ])('formats "%s" as "%s"', (input, expected) => {
    expect(formatDateInput(input)).toBe(expected);
  });
});

describe('brDateToIso', () => {
  it('converts an existing day', () => {
    expect(brDateToIso('29/02/2024')).toBe('2024-02-29');
  });

  it.each(['29/02/2023', '31/04/2020', '1/1/2020', '2020-01-01'])('rejects "%s"', (input) => {
    expect(brDateToIso(input)).toBeNull();
  });
});

describe('isoToBrDate and onlyDigits', () => {
  it('formats an ISO date for display', () => {
    expect(isoToBrDate('1998-04-12')).toBe('12/04/1998');
  });

  it('strips formatting characters', () => {
    expect(onlyDigits('(49) 99999-0000')).toBe('49999990000');
  });
});
