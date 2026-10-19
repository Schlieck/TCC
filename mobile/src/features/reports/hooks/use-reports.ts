import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSavedReport, deleteSavedReport, fetchEmotionTrend, listSavedReports } from '../api';
import type { ReportPeriod } from '../report-period';

const keys = {
  all: ['reports'] as const,
  trend: (period: ReportPeriod) => [...keys.all, 'trend', period.from, period.to] as const,
  saved: ['reports', 'saved'] as const,
};

export function useEmotionTrend(period: ReportPeriod) {
  // Sem placeholder: o gráfico de outro período nunca aparece com o título do período novo.
  return useQuery({ queryKey: keys.trend(period), queryFn: () => fetchEmotionTrend(period) });
}

export function useSavedReports() {
  return useQuery({ queryKey: keys.saved, queryFn: listSavedReports });
}

export function useCreateSavedReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, period }: { name: string; period: ReportPeriod }) =>
      createSavedReport(name, period),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.saved }),
  });
}

export function useDeleteSavedReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.saved }),
  });
}
