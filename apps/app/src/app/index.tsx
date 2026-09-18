import { Redirect } from 'expo-router';

import { MizanText } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { useAppState } from '@/state/app-state';

export default function EntryScreen() {
  const { onboardingCompleted, sessionStatus, t } = useAppState();

  if (sessionStatus === 'loading') {
    return (
      <Screen>
        <MizanText accessibilityLiveRegion="polite" muted>{t('loading')}</MizanText>
      </Screen>
    );
  }

  if (sessionStatus !== 'signed-in') {
    return <Redirect href="/auth" />;
  }

  return <Redirect href={onboardingCompleted ? '/today' : '/onboarding'} />;
}
