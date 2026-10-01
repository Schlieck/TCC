import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { SmallButton } from '@/shared/ui/small-button';
import type { CopingCard } from '../api';

interface CopingCardItemProps {
  card: CopingCard;
  groupName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function CopingCardItem({ card, groupName, onEdit, onDelete }: CopingCardItemProps) {
  return (
    <View style={styles.card}>
      {groupName ? (
        <AppText variant="caption" color={colors.onPrimary} style={styles.group}>
          {groupName}
        </AppText>
      ) : null}
      <AppText variant="subtitle" color={colors.onPrimary}>
        {card.name}
      </AppText>
      <AppText color={colors.onPrimary}>{card.description}</AppText>
      <View style={styles.actions}>
        <SmallButton
          label="Editar cartão"
          accessibilityLabel={`Editar cartão ${card.name}`}
          onPress={onEdit}
        />
        <SmallButton
          label="Excluir cartão"
          variant="danger"
          accessibilityLabel={`Excluir cartão ${card.name}`}
          onPress={onDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 4,
  },
  group: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
