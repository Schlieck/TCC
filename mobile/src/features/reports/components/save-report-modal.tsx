import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/shared/errors';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { notify } from '@/shared/ui/confirm';
import { LinkButton } from '@/shared/ui/link-button';
import { TextField } from '@/shared/ui/text-field';
import { useCreateSavedReport } from '../hooks/use-reports';
import type { ReportPeriod } from '../report-period';
import { REPORT_NAME_MAX_LENGTH, reportNameSchema } from '../validation';

interface SaveReportModalProps {
  visible: boolean;
  period: ReportPeriod;
  suggestedName: string;
  onClose: () => void;
}

export function SaveReportModal({ visible, period, suggestedName, onClose }: SaveReportModalProps) {
  const createReport = useCreateSavedReport();
  const [name, setName] = useState(suggestedName);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const parsed = reportNameSchema.safeParse(name);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dê um nome ao relatório.');
      return;
    }
    try {
      await createReport.mutateAsync({ name: parsed.data, period });
      onClose();
      notify('Relatório salvo', 'Você encontra seus relatórios em "Verificar relatórios gerados".');
    } catch (saveError) {
      setError(errorMessage(saveError));
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => {
        setName(suggestedName);
        setError(null);
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <AppText variant="subtitle">Salvar relatório</AppText>
          <AppText variant="caption">
            Só o nome e o período ficam salvos; o gráfico é sempre recalculado com seus registros.
          </AppText>
          <TextField
            label="Nome do relatório"
            value={name}
            onChangeText={setName}
            maxLength={REPORT_NAME_MAX_LENGTH}
            error={error ?? undefined}
            autoFocus
          />
          <Button label="Salvar" onPress={() => void save()} loading={createReport.isPending} />
          <LinkButton label="Cancelar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.overlay,
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
