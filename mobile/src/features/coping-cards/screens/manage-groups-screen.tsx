import { FlatList, StyleSheet } from 'react-native';
import { spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Screen } from '@/shared/ui/screen';
import { ScreenTitle } from '@/shared/ui/screen-title';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states';
import { GroupRow } from '../components/group-row';
import { useGroups } from '../hooks/use-coping-cards';

export function ManageGroupsScreen() {
  const groups = useGroups();

  return (
    <Screen edges={[]} style={styles.container}>
      <ScreenTitle title="Grupos" back />
      <AppText variant="caption">
        Novos grupos são criados ao salvar um cartão. Só é possível excluir grupos vazios.
      </AppText>

      {groups.isPending ? (
        <LoadingState />
      ) : groups.isError ? (
        <ErrorState error={groups.error} onRetry={() => void groups.refetch()} />
      ) : (
        <FlatList
          data={groups.data}
          keyExtractor={(group) => String(group.id)}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <GroupRow group={item} />}
          ListEmptyComponent={<EmptyState message="Você ainda não tem grupos." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  list: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
