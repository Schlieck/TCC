import { StyleSheet, View } from 'react-native';
import { spacing } from '@/shared/theme';
import { AppText } from './app-text';
import { Button } from './button';
import { Screen } from './screen';

export interface MenuItem {
  label: string;
  onPress: () => void;
}

/** Menu de uma funcionalidade (Figuras 11 e 12): título e botões empilhados. */
export function MenuScreen({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <Screen edges={[]} style={styles.container}>
      <AppText variant="title" accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.items}>
        {items.map((item) => (
          <Button key={item.label} label={item.label} onPress={item.onPress} style={styles.item} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    maxWidth: 260,
  },
  items: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  item: {
    minWidth: 220,
    alignItems: 'flex-start',
  },
});
