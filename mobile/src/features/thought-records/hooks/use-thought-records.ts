import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  updateRecord,
  type Period,
  type ThoughtRecordInput,
} from '../api';

export const thoughtRecordKeys = {
  all: ['thought-records'] as const,
  list: (period?: Period) =>
    [...thoughtRecordKeys.all, 'list', period?.from ?? '', period?.to ?? ''] as const,
  detail: (id: number) => [...thoughtRecordKeys.all, 'detail', id] as const,
};

/** Registros alimentam os relatórios: qualquer mudança invalida os dois. */
function useInvalidateRecords() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: thoughtRecordKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['reports'] }),
    ]);
}

export function useThoughtRecords(period?: Period) {
  return useQuery({
    queryKey: thoughtRecordKeys.list(period),
    queryFn: () => listRecords(period),
  });
}

export function useThoughtRecord(id: number) {
  return useQuery({ queryKey: thoughtRecordKeys.detail(id), queryFn: () => getRecord(id) });
}

export function useSaveThoughtRecord(recordId?: number) {
  const invalidate = useInvalidateRecords();
  return useMutation({
    mutationFn: (input: ThoughtRecordInput) =>
      recordId === undefined ? createRecord(input) : updateRecord(recordId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteThoughtRecord() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateRecords();
  return useMutation({
    mutationFn: deleteRecord,
    // Recarregar o detalhe excluído daria "não encontrado" e desmontaria a tela antes de ela voltar.
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: thoughtRecordKeys.detail(id) });
      return invalidate();
    },
  });
}
