import { Redirect } from 'expo-router';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { Card, MizanText } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

const entryCopy = {
  ar: {
    eyebrow: 'ميزان',
    title: 'نرتب الصورة قبل أن نطلب منك أي قرار',
    body: 'نستعيد جلستك وتفضيلاتك بهدوء حتى تبدأ من آخر حالة موثوقة، من دون اختراع بيانات ناقصة.',
  },
  en: {
    eyebrow: 'MIZAN',
    title: 'Restoring context before asking you to decide',
    body: 'MIZAN is restoring your session and preferences so you begin from the latest trusted state without inventing missing data.',
  },
} as const;

export default function EntryScreen() {
  const { locale, onboardingCompleted, sessionStatus, t, userId } = useAppState();
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const copy = entryCopy[locale];

  if (sessionStatus === 'loading') {
    return (
      <Screen>
        <View style={styles.stage}>
          <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
            <MizanText variant="label" muted>{copy.eyebrow}</MizanText>
            <MizanText variant="display">{copy.title}</MizanText>
            <MizanText>{copy.body}</MizanText>
            <View style={styles.statusBlock} accessibilityLiveRegion="polite">
              <MizanText variant="label">{t('loading')}</MizanText>
            </View>
          </Card>
        </View>
      </Screen>
    );
  }

  const hasUsableSession =
    sessionStatus === 'signed-in' || (sessionStatus === 'offline' && Boolean(userId));

  if (!hasUsableSession) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href={onboardingCompleted ? '/today' : '/onboarding'} />;
}

const styles = StyleSheet.create({
  stage: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  heroCard: {
    gap: Spacing.lg,
  },
  statusBlock: {
    paddingTop: Spacing.sm,
  },
});
