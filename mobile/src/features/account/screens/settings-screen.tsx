import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/features/auth/auth-context';
import { colors, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { CrisisNotice } from '@/shared/ui/crisis-notice';
import { Screen } from '@/shared/ui/screen';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { ChangePasswordForm } from '../components/change-password-form';
import { DeleteAccountModal } from '../components/delete-account-modal';
import { ProfileForm } from '../components/profile-form';
import { useProfile } from '../hooks/use-profile';

export function SettingsScreen() {
  const { signOut } = useAuth();
  const profile = useProfile();
  const [deleting, setDeleting] = useState(false);

  return (
    <Screen scroll edges={[]} style={styles.container}>
      <AppText variant="title" accessibilityRole="header" style={styles.title}>
        Configurações
      </AppText>

      {profile.isPending ? (
        <LoadingState />
      ) : profile.isError ? (
        <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />
      ) : (
        <>
          <ProfileForm profile={profile.data} />
          <View style={styles.divider} />
          <ChangePasswordForm />
          <View style={styles.divider} />
          <Button label="Sair da conta" onPress={() => void signOut()} style={styles.centered} />
          <Button
            label="Encerrar uso do aplicativo"
            variant="danger"
            style={styles.centered}
            onPress={() => {
              setDeleting(true);
            }}
          />
          <DeleteAccountModal
            visible={deleting}
            onClose={() => {
              setDeleting(false);
            }}
          />
        </>
      )}

      <CrisisNotice />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  centered: {
    alignSelf: 'center',
  },
});
