import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/shared/errors';
import { colors, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { confirm, notify } from '@/shared/ui/confirm';
import { LinkButton } from '@/shared/ui/link-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenTitle } from '@/shared/ui/screen-title';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states';
import type { CopingCard } from '../api';
import { CopingCardItem } from '../components/coping-card-item';
import { useCards, useDeleteCard, useGroups } from '../hooks/use-coping-cards';

export function CopingCardListScreen() {
  const [groupId, setGroupId] = useState<number | undefined>();
  const groups = useGroups();
  const cards = useCards(groupId);
  const deleteCard = useDeleteCard();

  const groupNames = useMemo(
    () => new Map(groups.data?.map((group) => [group.id, group.name])),
    [groups.data],
  );

  async function remove(card: CopingCard) {
    const confirmed = await confirm({
      title: 'Excluir cartão?',
      message: `"${card.name}" será excluído permanentemente.`,
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (confirmed) {
      deleteCard.mutate(card.id, {
        onError: (error) => {
          notify('Não foi possível excluir', errorMessage(error));
        },
      });
    }
  }

  function goToNewCard() {
    router.push('/coping-cards/new');
  }

  return (
    <Screen edges={[]} style={styles.container}>
      <ScreenTitle title="Seus cartões" back />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        <View style={styles.chips}>
          <Chip
            label="Todos"
            selected={groupId === undefined}
            onPress={() => {
              setGroupId(undefined);
            }}
          />
          {groups.data?.map((group) => (
            <Chip
              key={group.id}
              label={group.name}
              selected={group.id === groupId}
              onPress={() => {
                setGroupId(group.id);
              }}
            />
          ))}
        </View>
      </ScrollView>
      <View style={styles.links}>
        <LinkButton
          label="Gerenciar grupos"
          onPress={() => {
            router.push('/coping-cards/groups');
          }}
        />
        <LinkButton label="+ Novo cartão" onPress={goToNewCard} />
      </View>

      {cards.isPending ? (
        <LoadingState />
      ) : cards.isError ? (
        <ErrorState error={cards.error} onRetry={() => void cards.refetch()} />
      ) : (
        <FlatList
          data={cards.data}
          keyExtractor={(card) => String(card.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={cards.isRefetching}
              onRefresh={() => void cards.refetch()}
              tintColor={colors.primary}
              colors={[colors.onPrimary]}
              progressBackgroundColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <CopingCardItem
              card={item}
              groupName={groupNames.get(item.groupId)}
              onEdit={() => {
                router.push({ pathname: '/coping-cards/[id]', params: { id: String(item.id) } });
              }}
              onDelete={() => void remove(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              message={
                groupId === undefined
                  ? 'Você ainda não criou cartões de enfrentamento.'
                  : 'Nenhum cartão neste grupo.'
              }
              action={<Button label="Criar novo cartão" onPress={goToNewCard} />}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  // Sem flexShrink a lista longa espreme a faixa de filtros e corta os chips.
  filters: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
