import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { spacing } from '@/shared/theme';
import { CrisisNotice } from '@/shared/ui/crisis-notice';
import { Screen } from '@/shared/ui/screen';
import { ScreenTitle } from '@/shared/ui/screen-title';
import { EmptyState } from '@/shared/ui/states';
import { ContentBlocks } from '../components/content-blocks';
import { findTopic } from '../content';

export function TopicScreen() {
  const { topic: slug } = useLocalSearchParams<{ topic: string }>();
  const topic = findTopic(slug);

  return (
    <Screen scroll edges={[]} style={styles.container}>
      <ScreenTitle title={topic?.title ?? 'Aprenda!'} back />
      {topic ? (
        <ContentBlocks blocks={topic.blocks} />
      ) : (
        <EmptyState message="Conteúdo não encontrado." />
      )}
      <CrisisNotice />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
});
