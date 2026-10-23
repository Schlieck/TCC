import { z } from 'zod';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export type FirebaseConfigResult =
  { ok: true; config: FirebaseConfig } | { ok: false; message: string };

export type RawFirebaseEnv = Record<keyof FirebaseConfig, string | undefined>;

const ENV_NAMES: Record<keyof FirebaseConfig, string> = {
  apiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'EXPO_PUBLIC_FIREBASE_APP_ID',
};

const filled = z.string().trim().min(1);

const firebaseConfigSchema = z.object({
  apiKey: filled,
  authDomain: filled,
  projectId: filled,
  storageBucket: filled,
  messagingSenderId: filled,
  appId: filled,
});

export function parseFirebaseConfig(raw: RawFirebaseEnv): FirebaseConfigResult {
  const parsed = firebaseConfigSchema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, config: parsed.data };
  }
  const missing = parsed.error.issues.map(
    (issue) => ENV_NAMES[issue.path[0] as keyof FirebaseConfig],
  );
  return {
    ok: false,
    message: `Defina ${missing.join(', ')} no arquivo mobile/.env (veja mobile/.env.example).`,
  };
}
