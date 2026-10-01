import { StyleSheet, View } from 'react-native';
import { spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import type { ContentBlock } from '../content';

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <View style={styles.blocks}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case 'heading':
            return (
              <AppText key={key} variant="subtitle" accessibilityRole="header">
                {block.text}
              </AppText>
            );
          case 'paragraph':
            return <AppText key={key}>{block.text}</AppText>;
          case 'list':
            return (
              <View key={key} style={styles.list}>
                {block.items.map((item) => (
                  <View key={item} style={styles.item}>
                    <AppText>•</AppText>
                    <AppText style={styles.itemText}>{item}</AppText>
                  </View>
                ))}
              </View>
            );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  blocks: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemText: {
    flex: 1,
  },
});
