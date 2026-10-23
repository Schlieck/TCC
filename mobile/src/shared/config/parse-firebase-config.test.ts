import { describe, expect, it } from 'vitest';
import { parseFirebaseConfig, type RawFirebaseEnv } from './parse-firebase-config';

const complete: RawFirebaseEnv = {
  apiKey: 'key',
  authDomain: 'shifty.firebaseapp.com',
  projectId: 'shifty',
  storageBucket: 'shifty.firebasestorage.app',
  messagingSenderId: '123',
  appId: '1:123:web:abc',
};

describe('parseFirebaseConfig', () => {
  it('accepts a complete configuration', () => {
    expect(parseFirebaseConfig(complete)).toEqual({ ok: true, config: complete });
  });

  it('names every missing or blank variable', () => {
    const result = parseFirebaseConfig({ ...complete, apiKey: undefined, appId: '  ' });

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.message).toContain('EXPO_PUBLIC_FIREBASE_API_KEY');
    expect(result.ok ? '' : result.message).toContain('EXPO_PUBLIC_FIREBASE_APP_ID');
    expect(result.ok ? '' : result.message).not.toContain('PROJECT_ID');
  });
});
