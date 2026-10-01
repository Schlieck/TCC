export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** (49) 99999-0000 para celular, (49) 3333-4444 para fixo. */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  const splitAt = digits.length === 11 ? 5 : 4;
  if (number.length <= splitAt) {
    return `(${areaCode}) ${number}`;
  }
  return `(${areaCode}) ${number.slice(0, splitAt)}-${number.slice(splitAt)}`;
}

/** Vai inserindo as barras enquanto a pessoa digita: 12041998 → 12/04/1998. */
export function formatDateInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
    .filter((part) => part.length > 0)
    .join('/');
}

/** DD/MM/AAAA → AAAA-MM-DD, ou `null` se não for um dia que existe. */
export function brDateToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }
  const [, day = '', month = '', year = ''] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const exists =
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day);
  return exists ? `${year}-${month}-${day}` : null;
}

/** AAAA-MM-DD → DD/MM/AAAA. */
export function isoToBrDate(value: string): string {
  const [year = '', month = '', day = ''] = value.split('-');
  return `${day}/${month}/${year}`;
}
