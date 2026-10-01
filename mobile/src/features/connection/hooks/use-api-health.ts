import { useQuery } from '@tanstack/react-query';
import { fetchApiHealth } from '../api';

export function useApiHealth() {
  return useQuery({ queryKey: ['health'], queryFn: fetchApiHealth, retry: false });
}
