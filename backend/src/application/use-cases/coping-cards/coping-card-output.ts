import type { CopingCard } from '../../../domain/coping-card/coping-card.js';
import type { CopingCardGroup } from '../../../domain/coping-card/coping-card-group.js';
import type { CopingCardGroupSummary } from '../../ports/coping-card-group-repository.js';

export interface CopingCardOutput {
  id: number;
  groupId: number;
  name: string;
  description: string;
  updatedAt: string;
}

export interface CopingCardGroupOutput {
  id: number;
  name: string;
}

export interface CopingCardGroupSummaryOutput extends CopingCardGroupOutput {
  cardCount: number;
}

export function toCopingCardOutput(card: CopingCard): CopingCardOutput {
  return {
    id: card.id,
    groupId: card.groupId,
    name: card.name,
    description: card.description,
    updatedAt: card.updatedAt.toISOString(),
  };
}

export function toGroupOutput(group: CopingCardGroup): CopingCardGroupOutput {
  return { id: group.id, name: group.name };
}

export function toGroupSummaryOutput(group: CopingCardGroupSummary): CopingCardGroupSummaryOutput {
  return { ...toGroupOutput(group), cardCount: group.cardCount };
}
