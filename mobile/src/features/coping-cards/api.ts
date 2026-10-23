import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase, writeTransaction } from '@/shared/db/database';
import { AppError } from '@/shared/errors';
import { requireUid } from '@/shared/firebase/app';
import { parseInput } from '@/shared/parse-input';
import { copingCardFormSchema, groupNameSchema } from './validation';

export interface CopingCardGroup {
  id: number;
  name: string;
}

export interface CopingCardGroupSummary extends CopingCardGroup {
  cardCount: number;
}

export interface CopingCardInput {
  groupId: number;
  name: string;
  description: string;
}

export interface CopingCard extends CopingCardInput {
  id: number;
}

interface CardRow {
  id: number;
  group_id: number;
  name: string;
  description: string;
}

const CARD_COLUMNS = 'id, group_id, name, description';

export async function listGroups(): Promise<CopingCardGroupSummary[]> {
  const db = await getDatabase();
  const groups = await db.getAllAsync<CopingCardGroupSummary>(
    `SELECT g.id, g.name, count(c.id) AS cardCount
     FROM coping_card_groups g LEFT JOIN coping_cards c ON c.group_id = g.id
     WHERE g.user_id = ?
     GROUP BY g.id`,
    requireUid(),
  );
  return groups.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
}

export async function createGroup(rawName: string): Promise<CopingCardGroup> {
  const name = parseInput(groupNameSchema, rawName);
  const uid = requireUid();
  return writeTransaction(async (db) => {
    await assertGroupNameFree(db, uid, name);
    const { lastInsertRowId } = await db.runAsync(
      'INSERT INTO coping_card_groups (user_id, name) VALUES (?, ?)',
      uid,
      name,
    );
    return { id: lastInsertRowId, name };
  });
}

export async function renameGroup(id: number, rawName: string): Promise<CopingCardGroup> {
  const name = parseInput(groupNameSchema, rawName);
  const uid = requireUid();
  return writeTransaction(async (db) => {
    await assertGroupNameFree(db, uid, name, id);
    const { changes } = await db.runAsync(
      'UPDATE coping_card_groups SET name = ? WHERE id = ? AND user_id = ?',
      name,
      id,
      uid,
    );
    if (changes === 0) {
      throw groupNotFound();
    }
    return { id, name };
  });
}

export async function deleteGroup(id: number): Promise<void> {
  const uid = requireUid();
  await writeTransaction(async (db) => {
    await assertOwnGroup(db, uid, id, groupNotFound);
    const cards = await db.getFirstAsync<{ total: number }>(
      'SELECT count(*) AS total FROM coping_cards WHERE group_id = ? AND user_id = ?',
      id,
      uid,
    );
    if ((cards?.total ?? 0) > 0) {
      throw new AppError(
        'Este grupo ainda tem cartões. Mova ou exclua os cartões antes de excluir o grupo.',
      );
    }
    await db.runAsync('DELETE FROM coping_card_groups WHERE id = ? AND user_id = ?', id, uid);
  });
}

export async function listCards(groupId?: number): Promise<CopingCard[]> {
  const db = await getDatabase();
  const uid = requireUid();
  const rows =
    groupId === undefined
      ? await db.getAllAsync<CardRow>(
          `SELECT ${CARD_COLUMNS} FROM coping_cards WHERE user_id = ?
           ORDER BY updated_at DESC, id DESC`,
          uid,
        )
      : await db.getAllAsync<CardRow>(
          `SELECT ${CARD_COLUMNS} FROM coping_cards WHERE user_id = ? AND group_id = ?
           ORDER BY updated_at DESC, id DESC`,
          uid,
          groupId,
        );
  return rows.map(toCard);
}

export async function getCard(id: number): Promise<CopingCard> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CardRow>(
    `SELECT ${CARD_COLUMNS} FROM coping_cards WHERE id = ? AND user_id = ?`,
    id,
    requireUid(),
  );
  if (!row) {
    throw cardNotFound();
  }
  return toCard(row);
}

export async function createCard(input: CopingCardInput): Promise<CopingCard> {
  const content = parseCard(input);
  const uid = requireUid();
  return writeTransaction(async (db) => {
    await assertOwnGroup(db, uid, content.groupId, invalidGroup);
    const { lastInsertRowId } = await db.runAsync(
      'INSERT INTO coping_cards (user_id, group_id, name, description) VALUES (?, ?, ?, ?)',
      uid,
      content.groupId,
      content.name,
      content.description,
    );
    return { id: lastInsertRowId, ...content };
  });
}

export async function updateCard(id: number, input: CopingCardInput): Promise<CopingCard> {
  const content = parseCard(input);
  const uid = requireUid();
  return writeTransaction(async (db) => {
    await assertOwnGroup(db, uid, content.groupId, invalidGroup);
    const { changes } = await db.runAsync(
      `UPDATE coping_cards SET group_id = ?, name = ?, description = ?
       WHERE id = ? AND user_id = ?`,
      content.groupId,
      content.name,
      content.description,
      id,
      uid,
    );
    if (changes === 0) {
      throw cardNotFound();
    }
    return { id, ...content };
  });
}

export async function deleteCard(id: number): Promise<void> {
  const uid = requireUid();
  await writeTransaction(async (db) => {
    const { changes } = await db.runAsync(
      'DELETE FROM coping_cards WHERE id = ? AND user_id = ?',
      id,
      uid,
    );
    if (changes === 0) {
      throw cardNotFound();
    }
  });
}

function parseCard(input: CopingCardInput): CopingCardInput {
  const { name, description } = parseInput(copingCardFormSchema, input);
  return { groupId: input.groupId, name, description };
}

/** Nome único por usuário sem diferenciar maiúsculas, também fora do ASCII ("Ação" = "AÇÃO"). */
async function assertGroupNameFree(
  db: SQLiteDatabase,
  uid: string,
  name: string,
  exceptId?: number,
): Promise<void> {
  const groups = await db.getAllAsync<CopingCardGroup>(
    'SELECT id, name FROM coping_card_groups WHERE user_id = ?',
    uid,
  );
  const key = name.toLocaleLowerCase('pt-BR');
  if (
    groups.some((group) => group.id !== exceptId && group.name.toLocaleLowerCase('pt-BR') === key)
  ) {
    throw new AppError('Você já tem um grupo com esse nome.', 'name');
  }
}

/** Um cartão só pode usar um grupo do mesmo usuário. */
async function assertOwnGroup(
  db: SQLiteDatabase,
  uid: string,
  groupId: number,
  error: () => AppError,
): Promise<void> {
  const group = await db.getFirstAsync(
    'SELECT 1 FROM coping_card_groups WHERE id = ? AND user_id = ?',
    groupId,
    uid,
  );
  if (!group) {
    throw error();
  }
}

function toCard(row: CardRow): CopingCard {
  return { id: row.id, groupId: row.group_id, name: row.name, description: row.description };
}

function groupNotFound(): AppError {
  return new AppError('Grupo não encontrado.');
}

function invalidGroup(): AppError {
  return new AppError('Escolha um grupo válido.', 'groupId');
}

function cardNotFound(): AppError {
  return new AppError('Cartão não encontrado.');
}
