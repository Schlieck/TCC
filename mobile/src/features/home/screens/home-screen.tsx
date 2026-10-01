import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';

export function HomeScreen() {
  return (
    <Screen edges={[]} style={styles.container}>
      <AppText variant="title" accessibilityRole="header" style={styles.greeting}>
        Olá! Como você tem se sentido hoje?
      </AppText>

      <View style={styles.shortcuts}>
        <Button
          label="Registrar pensamento"
          style={styles.shortcut}
          onPress={() => {
            router.navigate('/thought-records');
          }}
        />
        <Button
          label="Cartões de enfrentamento"
          style={styles.shortcut}
          onPress={() => {
            router.navigate('/coping-cards');
          }}
        />
        <Button
          label="Verificar o seu humor esse mês"
          style={styles.shortcut}
          onPress={() => {
            router.navigate('/reports');
          }}
        />
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
  greeting: {
    maxWidth: 280,
  },
  shortcuts: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  shortcut: {
    minWidth: 220,
    alignItems: 'flex-start',
  },
});
