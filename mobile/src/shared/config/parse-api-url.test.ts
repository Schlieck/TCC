import { describe, expect, it } from 'vitest';
import { parseApiUrl } from './parse-api-url';

describe('parseApiUrl', () => {
  it('accepts a LAN address and drops the trailing slash', () => {
    expect(parseApiUrl('http://192.168.1.10:3333/api/')).toEqual({
      ok: true,
      apiUrl: 'http://192.168.1.10:3333/api',
    });
  });

  it('rejects a missing value', () => {
    expect(parseApiUrl(undefined).ok).toBe(false);
  });

  it('rejects something that is not an http URL', () => {
    expect(parseApiUrl('ftp://192.168.1.10/api').ok).toBe(false);
    expect(parseApiUrl('192.168.1.10:3333').ok).toBe(false);
  });

  it('rejects localhost because the phone cannot reach the computer through it', () => {
    const result = parseApiUrl('http://localhost:3333/api');

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.message).toContain('localhost');
  });
});
