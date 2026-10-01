import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { errorMessage } from '@/shared/api/errors';
import { apiConfig } from '@/shared/config/api-config';
import { colors, fontSize, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { useApiHealth } from '../hooks/use-api-health';

export function ConnectionCheckScreen() {
  const health = useApiHealth();

  return (
    <Screen style={styles.container}>
      <Text style={styles.brand}>Shifty</Text>
      <Text style={styles.label}>{apiConfig.ok ? apiConfig.apiUrl : ''}</Text>

      <View style={styles.status}>
        {health.isPending ? (
          <ActivityIndicator color={colors.primary} />
        ) : health.isError ? (
          <Text style={styles.error}>{errorMessage(health.error)}</Text>
        ) : (
          <>
            <Text style={styles.ok}>API conectada</Text>
            <Text style={health.data.database === 'up' ? styles.ok : styles.error}>
              {health.data.database === 'up'
                ? 'Banco de dados conectado'
                : 'A API está no ar, mas sem acesso ao banco de dados'}
            </Text>
          </>
        )}
      </View>

      <Button
        label="Testar novamente"
        onPress={() => void health.refetch()}
        loading={health.isFetching}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
  brand: {
    color: colors.primary,
    fontSize: fontSize.display,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.caption,
    textAlign: 'center',
  },
  status: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ok: {
    color: colors.success,
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.body,
    textAlign: 'center',
  },
});
