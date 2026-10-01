import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmAccountDeletion,
  fetchProfile,
  requestAccountDeletion,
  updateProfile,
} from '../api';

export const profileQueryKey = ['profile'] as const;

export function useProfile() {
  return useQuery({ queryKey: profileQueryKey, queryFn: fetchProfile });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey, profile);
    },
  });
}

export function useRequestAccountDeletion() {
  return useMutation({ mutationFn: requestAccountDeletion });
}

export function useConfirmAccountDeletion() {
  return useMutation({ mutationFn: confirmAccountDeletion });
}
