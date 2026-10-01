import { NotFoundError } from '../shared/errors.js';
import { parseRequiredText } from '../shared/text.js';
import type { UserId } from '../user/user.js';
import type { CopingCardGroupId } from './coping-card-group.js';

export type CopingCardId = number;

export interface CopingCard {
  readonly id: CopingCardId;
  readonly userId: UserId;
  readonly groupId: CopingCardGroupId;
  readonly name: string;
  readonly description: string;
  readonly updatedAt: Date;
}

export type CopingCardContent = Pick<CopingCard, 'groupId' | 'name' | 'description'>;

export const CARD_NAME_MAX_LENGTH = 100;
export const CARD_DESCRIPTION_MAX_LENGTH = 1000;

export function parseCardContent(raw: {
  groupId: CopingCardGroupId;
  name: string;
  description: string;
}): CopingCardContent {
  return {
    groupId: raw.groupId,
    name: parseRequiredText(raw.name, {
      field: 'name',
      code: 'INVALID_CARD_NAME',
      max: CARD_NAME_MAX_LENGTH,
    }),
    description: parseRequiredText(raw.description, {
      field: 'description',
      code: 'INVALID_CARD_DESCRIPTION',
      max: CARD_DESCRIPTION_MAX_LENGTH,
    }),
  };
}

export function copingCardNotFound(): NotFoundError {
  return new NotFoundError('COPING_CARD_NOT_FOUND', 'Coping card not found');
}
