import { Redirect } from 'expo-router';

import { useAppState } from '@/state/app-state';

export default function EntryScreen() {
  const { onboardingCompleted } = useAppState();
  return <Redirect href={onboardingCompleted ? '/today' : '/onboarding'} />;
}
