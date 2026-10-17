import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/shared/api/errors';
import { colors, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { LinkButton } from '@/shared/ui/link-button';
import { TextField } from '@/shared/ui/text-field';
import { useCreateGroup, useGroups } from '../hooks/use-coping-cards';
import { groupNameSchema } from '../validation';

interface GroupPickerProps {
  value: number | null;
  onChange: (groupId: number) => void;
  error?: string;
}

/** Escolhe um grupo existente ou cria um novo ali mesmo (RF001). */
export function GroupPicker({ value, onChange, error }: GroupPickerProps) {
  const groups = useGroups();
  const createGroup = useCreateGroup();
  const [draft, setDraft] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  function closeDraft() {
    setDraft(null);
    setDraftError(null);
  }

  async function saveDraft() {
    const parsed = groupNameSchema.safeParse(draft ?? '');
    if (!parsed.success) {
      setDraftError(parsed.error.issues[0]?.message ?? 'Nome inválido.');
      return;
    }
    try {
      const group = await createGroup.mutateAsync(parsed.data);
      onChange(group.id);
      closeDraft();
    } catch (creationError) {
      setDraftError(errorMessage(creationError));
    }
  }

  return (
    <View style={styles.container}>
      <AppText variant="label">Grupo</AppText>

      {groups.isPending ? (
        <ActivityIndicator color={colors.primary} />
      ) : groups.isError ? (
        <AppText color={colors.dangerText}>{errorMessage(groups.error)}</AppText>
      ) : (
        <View style={styles.chips}>
          {groups.data.map((group) => (
            <Chip
              key={group.id}
              label={group.name}
              selected={group.id === value}
              onPress={() => {
                onChange(group.id);
              }}
            />
          ))}
          {draft === null ? (
            <Chip
              label="+ Novo grupo"
              onPress={() => {
                setDraft('');
              }}
            />
          ) : null}
        </View>
      )}

      {draft !== null ? (
        <View style={styles.draft}>
          {/* Botão ao lado do campo: com o teclado aberto, ele continua visível. */}
          <View style={styles.draftRow}>
            <View style={styles.draftInput}>
              <TextField
                value={draft}
                onChangeText={setDraft}
                placeholder="Nome do novo grupo"
                error={draftError ?? undefined}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => void saveDraft()}
              />
            </View>
            <Button
              label="Criar grupo"
              onPress={() => void saveDraft()}
              loading={createGroup.isPending}
            />
          </View>
          <LinkButton label="Cancelar" onPress={closeDraft} />
        </View>
      ) : null}

      {error ? (
        <AppText variant="caption" color={colors.dangerText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  draft: {
    gap: spacing.sm,
  },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  draftInput: {
    flex: 1,
  },
});
