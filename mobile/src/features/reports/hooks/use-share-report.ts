import { useMutation } from '@tanstack/react-query';
import { useProfile } from '@/features/account/hooks/use-profile';
import { errorMessage } from '@/shared/api/errors';
import { todayIso } from '@/shared/dates';
import { notify } from '@/shared/ui/confirm';
import type { EmotionTrend } from '../api';
import { shareReportPdf } from '../pdf/share-report-pdf';

/** Gera o PDF do relatório na tela, com o nome do paciente, para levar à consulta. */
export function useShareReport() {
  const profile = useProfile();
  return useMutation({
    mutationFn: ({ trend, periodLabel }: { trend: EmotionTrend; periodLabel: string }) =>
      shareReportPdf({
        trend,
        periodLabel,
        patientName: profile.data?.name,
        generatedOn: todayIso(),
      }),
    onError: (error) => {
      notify('Não foi possível gerar o PDF', errorMessage(error));
    },
  });
}
