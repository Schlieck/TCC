import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '@/features/auth/auth-context';
import { errorMessage } from '@/shared/api/errors';
import { colors, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { useProfile } from '../hooks/use-profile';

export function SettingsScreen() {
  const { signOut } = useAuth();
  const profile = useProfile();

  return (
    <Screen edges={[]} style={styles.container}>
      <AppText variant="title" accessibilityRole="header">
        Configurações
      </AppText>

      <View style={styles.profile}>
        {profile.isPending ? (
          <ActivityIndicator color={colors.primary} />
        ) : profile.isError ? (
          <AppText color={colors.dangerText}>{errorMessage(profile.error)}</AppText>
        ) : (
          <>
            <AppText variant="label">{profile.data.name}</AppText>
            <AppText variant="caption">{profile.data.email}</AppText>
          </>
        )}
      </View>

      <Button label="Sair da conta" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  profile: {
    gap: spacing.xs,
  },
});
