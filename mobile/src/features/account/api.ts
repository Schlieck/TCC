import { deleteUser, reload, verifyBeforeUpdateEmail } from 'firebase/auth';
import { getDatabase, writeTransaction } from '@/shared/db/database';
import { reauthenticate, requireUser } from '@/shared/firebase/app';
import { translateAuthError } from '@/shared/firebase/auth-errors';
import { parseInput } from '@/shared/parse-input';
import { newProfileSchema, profileSchema } from './validation';

/** Perfil local; o e-mail vem sempre do Firebase, sem cópia no aparelho. */
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
}

export interface ProfileInput {
  name: string;
  phone: string;
  birthDate: string;
}

export interface NewProfileInput extends ProfileInput {
  acceptedPrivacyTerms: boolean;
}

export interface ProfileChanges extends ProfileInput {
  email: string;
  /** Obrigatória só para trocar o e-mail. */
  currentPassword?: string;
}

export interface ProfileUpdate {
  profile: UserProfile;
  /** Novo e-mail à espera do clique no link de confirmação. */
  pendingEmail: string | null;
}

interface ProfileRow {
  name: string;
  phone: string;
  birth_date: string;
}

export async function hasProfile(uid: string): Promise<boolean> {
  const db = await getDatabase();
  return (await db.getFirstAsync('SELECT 1 FROM profiles WHERE uid = ?', uid)) !== null;
}

export async function createProfile(uid: string, input: NewProfileInput): Promise<void> {
  const profile = parseInput(newProfileSchema, input);
  await writeTransaction((db) =>
    db.runAsync(
      `INSERT INTO profiles (uid, name, phone, birth_date, privacy_consent_at)
       VALUES (?, ?, ?, ?, ?)`,
      uid,
      profile.name,
      profile.phone,
      profile.birthDate,
      new Date().toISOString(),
    ),
  );
}

export async function fetchProfile(): Promise<UserProfile> {
  const user = requireUser();
  // Atualiza o e-mail depois de uma troca confirmada. Sem rede, segue com o e-mail em cache; se a
  // sessão foi revogada, o Firebase encerra a sessão e o AuthProvider volta para o login.
  await reload(user).catch(() => undefined);
  const db = await getDatabase();
  const row = await db.getFirstAsync<ProfileRow>(
    'SELECT name, phone, birth_date FROM profiles WHERE uid = ?',
    user.uid,
  );
  if (!row) {
    throw new Error('Profile not found');
  }
  return { name: row.name, email: user.email ?? '', phone: row.phone, birthDate: row.birth_date };
}

export async function updateProfile({
  email,
  currentPassword,
  ...input
}: ProfileChanges): Promise<ProfileUpdate> {
  const profile = parseInput(profileSchema, input);
  const user = requireUser();
  const newEmail = email.trim().toLowerCase();
  const pendingEmail = newEmail === user.email ? null : newEmail;

  if (pendingEmail !== null) {
    await reauthenticate(currentPassword ?? '');
    try {
      await verifyBeforeUpdateEmail(user, pendingEmail);
    } catch (error) {
      throw translateAuthError(error);
    }
  }

  await writeTransaction((db) =>
    db.runAsync(
      'UPDATE profiles SET name = ?, phone = ?, birth_date = ? WHERE uid = ?',
      profile.name,
      profile.phone,
      profile.birthDate,
      user.uid,
    ),
  );
  return { profile: { ...profile, email: user.email ?? '' }, pendingEmail };
}

/**
 * Apaga os dados locais e a conta do Firebase juntos: se a exclusão no Firebase falhar (sem rede,
 * por exemplo), a transação desfaz o apagamento local e nada se perde.
 */
export async function deleteAccount(currentPassword: string): Promise<void> {
  const user = await reauthenticate(currentPassword);
  await writeTransaction(async (db) => {
    // As demais tabelas apagam as linhas do usuário em cascata.
    await db.runAsync('DELETE FROM profiles WHERE uid = ?', user.uid);
    try {
      await deleteUser(user);
    } catch (error) {
      throw translateAuthError(error);
    }
  });
}
