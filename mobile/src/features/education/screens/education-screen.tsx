import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';
import { AppText } from '@/shared/ui/app-text';
import { CrisisNotice } from '@/shared/ui/crisis-notice';
import { Screen } from '@/shared/ui/screen';
import { EDUCATION_INTRO, EDUCATION_TOPICS } from '../content';

export function EducationScreen() {
  return (
    <Screen scroll edges={[]} style={styles.container}>
      <View style={styles.intro}>
        <AppText variant="title" accessibilityRole="header" style={styles.centered}>
          Aprenda!
        </AppText>
        <AppText variant="caption" color={colors.primary} style={styles.centered}>
          {EDUCATION_INTRO}
        </AppText>
      </View>

      <View style={styles.grid}>
        {EDUCATION_TOPICS.map((topic) => (
          <Pressable
            key={topic.slug}
            accessibilityRole="button"
            onPress={() => {
              router.push({ pathname: '/education/[topic]', params: { topic: topic.slug } });
            }}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <AppText variant="label" color={colors.onPrimary} style={styles.centered}>
              {topic.title}
            </AppText>
          </Pressable>
        ))}
      </View>

      <CrisisNotice />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  intro: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  centered: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.lg,
  },
  tile: {
    width: '46%',
    aspectRatio: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 4,
  },
  pressed: {
    opacity: 0.8,
  },
});
