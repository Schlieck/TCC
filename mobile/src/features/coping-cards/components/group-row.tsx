import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { errorMessage } from '@/shared/errors';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { confirm, notify } from '@/shared/ui/confirm';
import { SmallButton } from '@/shared/ui/small-button';
import { TextField } from '@/shared/ui/text-field';
import type { CopingCardGroupSummary } from '../api';
import { useDeleteGroup, useRenameGroup } from '../hooks/use-coping-cards';
import { groupNameSchema } from '../validation';

export function GroupRow({ group }: { group: CopingCardGroupSummary }) {
  const renameGroup = useRenameGroup();
  const deleteGroup = useDeleteGroup();
  const [draft, setDraft] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  async function saveName() {
    const parsed = groupNameSchema.safeParse(draft ?? '');
    if (!parsed.success) {
      setDraftError(parsed.error.issues[0]?.message ?? 'Nome inválido.');
      return;
    }
    try {
      await renameGroup.mutateAsync({ id: group.id, name: parsed.data });
      setDraft(null);
      setDraftError(null);
    } catch (error) {
      setDraftError(errorMessage(error));
    }
  }

  async function remove() {
    const confirmed = await confirm({
      title: 'Excluir grupo?',
      message: `O grupo "${group.name}" será excluído.`,
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (confirmed) {
      deleteGroup.mutate(group.id, {
        onError: (error) => {
          notify('Não foi possível excluir', errorMessage(error));
        },
      });
    }
  }

  const cardCountLabel = group.cardCount === 1 ? '1 cartão' : `${group.cardCount} cartões`;

  return (
    <View style={styles.row}>
      {draft === null ? (
        <View style={styles.summary}>
          <AppText variant="subtitle" color={colors.onPrimary}>
            {group.name}
          </AppText>
          <AppText variant="caption" color={colors.onPrimary}>
            {cardCountLabel}
          </AppText>
        </View>
      ) : (
        <TextField
          value={draft}
          onChangeText={setDraft}
          error={draftError ?? undefined}
          autoFocus
          accessibilityLabel={`Novo nome para ${group.name}`}
          style={styles.input}
        />
      )}
      <View style={styles.actions}>
        {draft === null ? (
          <>
            <SmallButton
              label="Renomear"
              onPress={() => {
                setDraft(group.name);
              }}
            />
            <SmallButton label="Excluir" variant="danger" onPress={() => void remove()} />
          </>
        ) : (
          <>
            <SmallButton label="Salvar" onPress={() => void saveName()} />
            <SmallButton
              label="Cancelar"
              onPress={() => {
                setDraft(null);
                setDraftError(null);
              }}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  summary: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.text,
    borderColor: colors.onPrimary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
