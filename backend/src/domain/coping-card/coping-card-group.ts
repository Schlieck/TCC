import { NotFoundError } from '../shared/errors.js';
import { parseRequiredText } from '../shared/text.js';
import type { UserId } from '../user/user.js';

export type CopingCardGroupId = number;

export interface CopingCardGroup {
  readonly id: CopingCardGroupId;
  readonly userId: UserId;
  readonly name: string;
}

export const GROUP_NAME_MAX_LENGTH = 60;

export function parseGroupName(raw: string): string {
  return parseRequiredText(raw, {
    field: 'name',
    code: 'INVALID_GROUP_NAME',
    max: GROUP_NAME_MAX_LENGTH,
  });
}

export function copingCardGroupNotFound(): NotFoundError {
  return new NotFoundError('COPING_CARD_GROUP_NOT_FOUND', 'Coping card group not found');
}
