import { z } from 'zod';
import { httpClient } from '@/shared/api/http-client';

const groupSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const groupSummarySchema = groupSchema.extend({
  cardCount: z.number(),
});

const cardSchema = z.object({
  id: z.number(),
  groupId: z.number(),
  name: z.string(),
  description: z.string(),
  updatedAt: z.string(),
});

export type CopingCardGroup = z.infer<typeof groupSchema>;
export type CopingCardGroupSummary = z.infer<typeof groupSummarySchema>;
export type CopingCard = z.infer<typeof cardSchema>;

export interface CopingCardInput {
  groupId: number;
  name: string;
  description: string;
}

export function listGroups(): Promise<CopingCardGroupSummary[]> {
  return httpClient.request('/coping-card-groups', z.array(groupSummarySchema));
}

export function createGroup(name: string): Promise<CopingCardGroup> {
  return httpClient.request('/coping-card-groups', groupSchema, {
    method: 'POST',
    body: { name },
  });
}

export function renameGroup(id: number, name: string): Promise<CopingCardGroup> {
  return httpClient.request(`/coping-card-groups/${id}`, groupSchema, {
    method: 'PATCH',
    body: { name },
  });
}

export function deleteGroup(id: number): Promise<void> {
  return httpClient.execute(`/coping-card-groups/${id}`, { method: 'DELETE' });
}

export function listCards(groupId?: number): Promise<CopingCard[]> {
  return httpClient.request('/coping-cards', z.array(cardSchema), { query: { groupId } });
}

export function getCard(id: number): Promise<CopingCard> {
  return httpClient.request(`/coping-cards/${id}`, cardSchema);
}

export function createCard(input: CopingCardInput): Promise<CopingCard> {
  return httpClient.request('/coping-cards', cardSchema, { method: 'POST', body: input });
}

export function updateCard(id: number, input: CopingCardInput): Promise<CopingCard> {
  return httpClient.request(`/coping-cards/${id}`, cardSchema, { method: 'PUT', body: input });
}

export function deleteCard(id: number): Promise<void> {
  return httpClient.execute(`/coping-cards/${id}`, { method: 'DELETE' });
}
