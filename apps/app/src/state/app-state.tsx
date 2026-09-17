import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { Locale, TranslationKey, translations } from '@/i18n';

export type DomainId = 'recovery' | 'connection' | 'work' | 'margin';

const defaultDomains: readonly DomainId[] = ['recovery', 'connection', 'work'];

interface AppStateValue {
  locale: Locale;
  isRtl: boolean;
  onboardingCompleted: boolean;
  enabledDomains: readonly DomainId[];
  setLocale: (locale: Locale) => void;
  toggleDomain: (domainId: DomainId) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  t: (key: TranslationKey) => string;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<Locale>('ar');
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [enabledDomains, setEnabledDomains] = useState<readonly DomainId[]>(defaultDomains);

  const value = useMemo<AppStateValue>(() => {
    const toggleDomain = (domainId: DomainId) => {
      setEnabledDomains((current) => {
        if (current.includes(domainId)) {
          const next = current.filter((id) => id !== domainId);
          return next.length > 0 ? next : current;
        }
        return [...current, domainId];
      });
    };

    return {
      locale,
      isRtl: locale === 'ar',
      onboardingCompleted,
      enabledDomains,
      setLocale,
      toggleDomain,
      completeOnboarding: () => setOnboardingCompleted(true),
      resetOnboarding: () => setOnboardingCompleted(false),
      t: (key) => translations[locale][key],
    };
  }, [enabledDomains, locale, onboardingCompleted]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return value;
}
