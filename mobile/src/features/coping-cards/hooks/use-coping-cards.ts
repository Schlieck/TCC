import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCard,
  createGroup,
  deleteCard,
  deleteGroup,
  getCard,
  listCards,
  listGroups,
  renameGroup,
  updateCard,
  type CopingCardInput,
} from '../api';

const keys = {
  groups: ['coping-card-groups'] as const,
  cards: ['coping-cards'] as const,
  list: (groupId?: number) => [...keys.cards, 'list', groupId ?? 'all'] as const,
  detail: (id: number) => [...keys.cards, 'detail', id] as const,
};

/** Cartões e grupos mudam juntos (contagem por grupo), então invalidamos os dois. */
function useInvalidateCopingCards() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: keys.cards }),
      queryClient.invalidateQueries({ queryKey: keys.groups }),
    ]);
}

export function useGroups() {
  return useQuery({ queryKey: keys.groups, queryFn: listGroups });
}

export function useCards(groupId?: number) {
  return useQuery({ queryKey: keys.list(groupId), queryFn: () => listCards(groupId) });
}

export function useCard(id: number) {
  return useQuery({ queryKey: keys.detail(id), queryFn: () => getCard(id) });
}

export function useCreateGroup() {
  const invalidate = useInvalidateCopingCards();
  return useMutation({ mutationFn: createGroup, onSuccess: invalidate });
}

export function useRenameGroup() {
  const invalidate = useInvalidateCopingCards();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => renameGroup(id, name),
    onSuccess: invalidate,
  });
}

export function useDeleteGroup() {
  const invalidate = useInvalidateCopingCards();
  return useMutation({ mutationFn: deleteGroup, onSuccess: invalidate });
}

export function useSaveCard(cardId?: number) {
  const invalidate = useInvalidateCopingCards();
  return useMutation({
    mutationFn: (input: CopingCardInput) =>
      cardId === undefined ? createCard(input) : updateCard(cardId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCard() {
  const invalidate = useInvalidateCopingCards();
  return useMutation({ mutationFn: deleteCard, onSuccess: invalidate });
}
