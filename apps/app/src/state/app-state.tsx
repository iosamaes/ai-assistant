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
  type DataFailureKind,
} from '@/infrastructure/supabase/data-access';
import {
  loadOnboardingContext,
  upsertOnboardingContext,
} from '@/infrastructure/supabase/onboarding-context';

export type DomainId = 'recovery' | 'connection' | 'work' | 'margin';
export type LifeSeason = 'balanced' | 'build' | 'recovery' | 'parenting' | 'study' | 'travel';
export type PersonalValue = 'stability' | 'family' | 'growth' | 'meaning';
export type PrivacyMode = 'minimal' | 'balanced';
export type SessionStatus =
  | 'loading'
  | 'signed-in'
  | 'signed-out'
  | 'offline'
  | 'expired'
  | 'not-configured'
  | 'error';
export type SyncStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'expired' | 'error';

const domainOrder: readonly DomainId[] = ['recovery', 'connection', 'work', 'margin'];
const defaultDomains: readonly DomainId[] = ['recovery', 'connection', 'work'];
const personalValueOrder: readonly PersonalValue[] = ['stability', 'family', 'growth', 'meaning'];

function currentTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function collectFailures(...failures: (DataFailureKind | null)[]) {
  return failures.filter((failure): failure is DataFailureKind => failure !== null);
}

function isPersonalValue(value: string): value is PersonalValue {
  return personalValueOrder.includes(value as PersonalValue);
}

interface AppStateValue {
  locale: Locale;
  isRtl: boolean;
  onboardingCompleted: boolean;
  enabledDomains: readonly DomainId[];
  lifeSeason: LifeSeason | null;
  focusDomain: DomainId | null;
  personalValues: readonly PersonalValue[];
  privacyMode: PrivacyMode | null;
  sessionStatus: SessionStatus;
  syncStatus: SyncStatus;
  userId: string | null;
  setLocale: (locale: Locale) => void;
  toggleDomain: (domainId: DomainId) => void;
  setLifeSeason: (season: LifeSeason) => void;
  setFocusDomain: (domainId: DomainId) => void;
  togglePersonalValue: (value: PersonalValue) => void;
  setPrivacyMode: (mode: PrivacyMode) => void;
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
  const [lifeSeason, setLifeSeasonState] = useState<LifeSeason | null>(null);
  const [focusDomain, setFocusDomainState] = useState<DomainId | null>(null);
  const [personalValues, setPersonalValues] = useState<readonly PersonalValue[]>([]);
  const [privacyMode, setPrivacyModeState] = useState<PrivacyMode | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('loading');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [userId, setUserId] = useState<string | null>(null);
  const activeUserRef = useRef<string | null>(null);
  const persistenceQueue = useRef<Promise<void>>(Promise.resolve());

  const resetUserState = useCallback(() => {
    setLocaleState('ar');
    setOnboardingCompleted(false);
    setEnabledDomains(defaultDomains);
    setLifeSeasonState(null);
    setFocusDomainState(null);
    setPersonalValues([]);
    setPrivacyModeState(null);
  }, []);

  const hydrateSession = useCallback(
    async (session: Session | null) => {
      if (!session) {
        activeUserRef.current = null;
        setUserId(null);
        resetUserState();
        setSyncStatus('idle');
        setSessionStatus('signed-out');
        return;
      }

      const nextUserId = session.user.id;
      const isNewUser = activeUserRef.current !== nextUserId;
      activeUserRef.current = nextUserId;
      setUserId(nextUserId);
      setSessionStatus('loading');

      if (isNewUser) {
        resetUserState();
        setSyncStatus('idle');
      }

      const [profileResult, preferenceResult, contextResult] = await Promise.all([
        loadProfile(nextUserId),
        loadDomainPreferences(nextUserId),
        loadOnboardingContext(nextUserId),
      ]);
      if (activeUserRef.current !== nextUserId) return;

      const failures = collectFailures(
        profileResult.ok ? null : profileResult.error.kind,
        preferenceResult.ok ? null : preferenceResult.error.kind,
        contextResult.ok ? null : contextResult.error.kind,
      );

      if (failures.includes('session-expired')) {
        activeUserRef.current = null;
        setUserId(null);
        setSyncStatus('expired');
        setSessionStatus('expired');
        return;
      }

      const profile = profileResult.ok ? profileResult.value : null;
      const onboardingContext = contextResult.ok ? contextResult.value : null;
      if (profileResult.ok) {
        if (profile) {
          setLocaleState(profile.locale);
          setOnboardingCompleted(profile.onboarding_completed);
        } else {
          resetUserState();
        }
      }

      if (contextResult.ok) {
        setLifeSeasonState(onboardingContext?.life_season ?? null);
        setPersonalValues((onboardingContext?.self_values ?? []).filter(isPersonalValue));
        setPrivacyModeState(onboardingContext?.privacy_mode ?? null);
      }

      if (preferenceResult.ok) {
        const enabled = domainOrder.filter((domainId) =>
          preferenceResult.value.some((preference) => preference.domain_id === domainId && preference.enabled),
        );
        const nextEnabled = enabled.length > 0 ? enabled : defaultDomains;
        setEnabledDomains(nextEnabled);

        if (onboardingContext?.life_season) {
          const focus = preferenceResult.value
            .filter((preference) => preference.enabled && domainOrder.includes(preference.domain_id as DomainId))
            .sort((left, right) => right.priority_weight - left.priority_weight)[0];
          setFocusDomainState((focus?.domain_id as DomainId | undefined) ?? null);
        } else {
          setFocusDomainState(null);
        }
      }

      if (failures.includes('unavailable')) {
        setSyncStatus('offline');
        setSessionStatus('offline');
        return;
      }

      if (failures.length > 0) {
        setSyncStatus('error');
        setSessionStatus('signed-in');
        return;
      }

      setSyncStatus('saved');
      setSessionStatus('signed-in');
    },
    [resetUserState],
  );

  const refreshSession = useCallback(async () => {
    setSessionStatus('loading');
    const result = await getCurrentSession();
    if (!result.ok) {
      if (result.error.kind === 'network' && activeUserRef.current) {
        setSyncStatus('offline');
        setSessionStatus('offline');
        return;
      }
      activeUserRef.current = null;
      setUserId(null);
      setSessionStatus(result.error.kind === 'not-configured' ? 'not-configured' : 'error');
      return;
    }
    await hydrateSession(result.value);
  }, [hydrateSession]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return refreshSession();
      return undefined;
    });

    const unsubscribeAuth = subscribeToAuthSession((_event, session) => {
      setTimeout(() => {
        void hydrateSession(session);
      }, 0);
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
      active = false;
      unsubscribeAuth();
      linkingSubscription.remove();
    };
  }, [hydrateSession, refreshSession]);

  const persistSnapshot = useCallback(
    (
      nextLocale: Locale,
      nextOnboardingCompleted: boolean,
      nextDomains: readonly DomainId[],
      nextLifeSeason: LifeSeason | null,
      nextFocusDomain: DomainId | null,
      nextValues: readonly PersonalValue[],
      nextPrivacyMode: PrivacyMode | null,
    ) => {
      if (!userId) return Promise.resolve();
      const targetUserId = userId;

      const persist = async () => {
        setSyncStatus('saving');
        const [profileResult, preferenceResult] = await Promise.all([
          upsertProfile(targetUserId, {
            locale: nextLocale,
            timezone: currentTimezone(),
            onboarding_completed: nextOnboardingCompleted,
          }),
          upsertDomainPreferences(
            targetUserId,
            domainOrder.map((domainId) => ({
              domain_id: domainId,
              enabled: nextDomains.includes(domainId),
              priority_weight:
                nextOnboardingCompleted && domainId === nextFocusDomain
                  ? 1
                  : nextDomains.includes(domainId)
                    ? nextOnboardingCompleted
                      ? 0.6
                      : 0.5
                    : 0.25,
              custom_label: null,
            })),
          ),
        ]);
        const contextResult = nextOnboardingCompleted
          ? await upsertOnboardingContext(targetUserId, {
              life_season: nextLifeSeason,
              self_values: [...nextValues],
              privacy_mode: nextPrivacyMode,
            })
          : { ok: true as const, value: null };

        if (activeUserRef.current !== targetUserId) return;

        const failures = collectFailures(
          profileResult.ok ? null : profileResult.error.kind,
          preferenceResult.ok ? null : preferenceResult.error.kind,
          contextResult.ok ? null : contextResult.error.kind,
        );

        if (failures.includes('session-expired')) {
          activeUserRef.current = null;
          setUserId(null);
          setSyncStatus('expired');
          setSessionStatus('expired');
          return;
        }

        if (failures.includes('unavailable')) {
          setSyncStatus('offline');
          setSessionStatus('offline');
          return;
        }

        if (failures.length > 0) {
          setSyncStatus('error');
          return;
        }

        setSyncStatus('saved');
        setSessionStatus('signed-in');
      };

      persistenceQueue.current = persistenceQueue.current.then(persist, persist);
      return persistenceQueue.current;
    },
    [userId],
  );

  const persistCurrent = useCallback(
    (
      next: Partial<{
        locale: Locale;
        onboardingCompleted: boolean;
        enabledDomains: readonly DomainId[];
        lifeSeason: LifeSeason | null;
        focusDomain: DomainId | null;
        personalValues: readonly PersonalValue[];
        privacyMode: PrivacyMode | null;
      }>,
    ) =>
      persistSnapshot(
        next.locale ?? locale,
        next.onboardingCompleted ?? onboardingCompleted,
        next.enabledDomains ?? enabledDomains,
        next.lifeSeason !== undefined ? next.lifeSeason : lifeSeason,
        next.focusDomain !== undefined ? next.focusDomain : focusDomain,
        next.personalValues ?? personalValues,
        next.privacyMode !== undefined ? next.privacyMode : privacyMode,
      ),
    [
      enabledDomains,
      focusDomain,
      lifeSeason,
      locale,
      onboardingCompleted,
      persistSnapshot,
      personalValues,
      privacyMode,
    ],
  );

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      void persistCurrent({ locale: nextLocale });
    },
    [persistCurrent],
  );

  const toggleDomain = useCallback(
    (domainId: DomainId) => {
      setEnabledDomains((current) => {
        const next = current.includes(domainId)
          ? current.filter((id) => id !== domainId)
          : [...current, domainId];
        if (next.length === 0) return current;
        const nextFocus = focusDomain === domainId && !next.includes(domainId) ? null : focusDomain;
        if (nextFocus !== focusDomain) setFocusDomainState(nextFocus);
        void persistCurrent({ enabledDomains: next, focusDomain: nextFocus });
        return next;
      });
    },
    [focusDomain, persistCurrent],
  );

  const setLifeSeason = useCallback((season: LifeSeason) => {
    setLifeSeasonState(season);
  }, []);

  const setFocusDomain = useCallback(
    (domainId: DomainId) => {
      if (!enabledDomains.includes(domainId)) return;
      setFocusDomainState(domainId);
    },
    [enabledDomains],
  );

  const togglePersonalValue = useCallback((value: PersonalValue) => {
    setPersonalValues((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }, []);

  const setPrivacyMode = useCallback((mode: PrivacyMode) => {
    setPrivacyModeState(mode);
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboardingCompleted(true);
    await persistCurrent({ onboardingCompleted: true });
  }, [persistCurrent]);

  const resetOnboarding = useCallback(async () => {
    setOnboardingCompleted(false);
    await persistCurrent({ onboardingCompleted: false });
  }, [persistCurrent]);

  const value = useMemo<AppStateValue>(
    () => ({
      locale,
      isRtl: locale === 'ar',
      onboardingCompleted,
      enabledDomains,
      lifeSeason,
      focusDomain,
      personalValues,
      privacyMode,
      sessionStatus,
      syncStatus,
      userId,
      setLocale,
      toggleDomain,
      setLifeSeason,
      setFocusDomain,
      togglePersonalValue,
      setPrivacyMode,
      completeOnboarding,
      resetOnboarding,
      refreshSession,
      t: (key) => translations[locale][key],
    }),
    [
      completeOnboarding,
      enabledDomains,
      focusDomain,
      lifeSeason,
      locale,
      onboardingCompleted,
      personalValues,
      privacyMode,
      refreshSession,
      resetOnboarding,
      sessionStatus,
      setFocusDomain,
      setLifeSeason,
      setLocale,
      setPrivacyMode,
      syncStatus,
      toggleDomain,
      togglePersonalValue,
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