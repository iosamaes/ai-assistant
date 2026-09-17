import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Locale, TranslationKey, translations } from '@/i18n';
import {
  consumeAuthRedirectUrl,
  getCurrentSession,
  subscribeToAuthSession,
} from '@/infrastructure/supabase/auth';
import {
  loadDomainPreferences,
  loadProfile,
  upsertDomainPreferences,
  upsertProfile,
} from '@/infrastructure/supabase/data-access';

export type DomainId = 'recovery' | 'connection' | 'work' | 'margin';
export type SessionStatus = 'loading' | 'signed-in' | 'signed-out' | 'not-configured' | 'error';

const domainOrder: readonly DomainId[] = ['recovery', 'connection', 'work', 'margin'];
const defaultDomains: readonly DomainId[] = ['recovery', 'connection', 'work'];

function currentTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

interface AppStateValue {
  locale: Locale;
  isRtl: boolean;
  onboardingCompleted: boolean;
  enabledDomains: readonly DomainId[];
  sessionStatus: SessionStatus;
  userId: string | null;
  setLocale: (locale: Locale) => void;
  toggleDomain: (domainId: DomainId) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  refreshSession: () => Promise<void>;
  t: (key: TranslationKey) => string;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>('ar');
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [enabledDomains, setEnabledDomains] = useState<readonly DomainId[]>(defaultDomains);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const persistenceQueue = useRef<Promise<void>>(Promise.resolve());

  const hydrateSession = useCallback(async (session: Session | null) => {
    if (!session) {
      setUserId(null);
      setSessionStatus('signed-out');
      return;
    }

    const nextUserId = session.user.id;
    setUserId(nextUserId);
    setSessionStatus('loading');

    const [profileResult, preferenceResult] = await Promise.all([
      loadProfile(nextUserId),
      loadDomainPreferences(nextUserId),
    ]);

    if (profileResult.ok && profileResult.value) {
      setLocaleState(profileResult.value.locale);
      setOnboardingCompleted(profileResult.value.onboarding_completed);
    }

    if (preferenceResult.ok && preferenceResult.value.length > 0) {
      const enabled = domainOrder.filter((domainId) =>
        preferenceResult.value.some((preference) => preference.domain_id === domainId && preference.enabled),
      );
      if (enabled.length > 0) setEnabledDomains(enabled);
    }

    setSessionStatus('signed-in');
  }, []);

  const refreshSession = useCallback(async () => {
    setSessionStatus('loading');
    const result = await getCurrentSession();
    if (!result.ok) {
      setUserId(null);
      setSessionStatus(result.error.kind === 'not-configured' ? 'not-configured' : 'error');
      return;
    }
    await hydrateSession(result.value);
  }, [hydrateSession]);

  useEffect(() => {
    void refreshSession();

    const unsubscribeAuth = subscribeToAuthSession((_event, session) => {
      void hydrateSession(session);
    });

    const consumeUrl = async (url: string | null) => {
      if (!url) return;
      const result = await consumeAuthRedirectUrl(url);
      if (result.ok && result.value) await hydrateSession(result.value);
    };

    void Linking.getInitialURL().then(consumeUrl);
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      void consumeUrl(url);
    });

    return () => {
      unsubscribeAuth();
      linkingSubscription.remove();
    };
  }, [hydrateSession, refreshSession]);

  const persistSnapshot = useCallback(
    (nextLocale: Locale, nextOnboardingCompleted: boolean, nextDomains: readonly DomainId[]) => {
      if (!userId || sessionStatus !== 'signed-in') return Promise.resolve();

      const persist = async () => {
        await Promise.all([
          upsertProfile(userId, {
            locale: nextLocale,
            timezone: currentTimezone(),
            onboarding_completed: nextOnboardingCompleted,
          }),
          upsertDomainPreferences(
            userId,
            domainOrder.map((domainId, index) => ({
              domain_id: domainId,
              enabled: nextDomains.includes(domainId),
              priority_weight: Math.max(0.25, 1 - index * 0.15),
              custom_label: null,
            })),
          ),
        ]);
      };

      persistenceQueue.current = persistenceQueue.current.then(persist, persist);
      return persistenceQueue.current;
    },
    [sessionStatus, userId],
  );

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      void persistSnapshot(nextLocale, onboardingCompleted, enabledDomains);
    },
    [enabledDomains, onboardingCompleted, persistSnapshot],
  );

  const toggleDomain = useCallback(
    (domainId: DomainId) => {
      setEnabledDomains((current) => {
        const next = current.includes(domainId)
          ? current.filter((id) => id !== domainId)
          : [...current, domainId];
        if (next.length === 0) return current;
        void persistSnapshot(locale, onboardingCompleted, next);
        return next;
      });
    },
    [locale, onboardingCompleted, persistSnapshot],
  );

  const completeOnboarding = useCallback(async () => {
    setOnboardingCompleted(true);
    await persistSnapshot(locale, true, enabledDomains);
  }, [enabledDomains, locale, persistSnapshot]);

  const resetOnboarding = useCallback(async () => {
    setOnboardingCompleted(false);
    await persistSnapshot(locale, false, enabledDomains);
  }, [enabledDomains, locale, persistSnapshot]);

  const value = useMemo<AppStateValue>(
    () => ({
      locale,
      isRtl: locale === 'ar',
      onboardingCompleted,
      enabledDomains,
      sessionStatus,
      userId,
      setLocale,
      toggleDomain,
      completeOnboarding,
      resetOnboarding,
      refreshSession,
      t: (key) => translations[locale][key],
    }),
    [
      completeOnboarding,
      enabledDomains,
      locale,
      onboardingCompleted,
      refreshSession,
      resetOnboarding,
      sessionStatus,
      setLocale,
      toggleDomain,
      userId,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
