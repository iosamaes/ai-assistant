import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadLifeSeasonsState,
  saveLifeSeason,
  type LifeSeasonsState,
} from '@/application/life-seasons';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { Card, ChoiceChip, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import type { DomainId, LifeSeason } from '@/state/app-state';
import { useAppState } from '@/state/app-state';

type Rating = 1 | 2 | 3 | 4 | 5;
type TargetDraft = Partial<Record<string, Rating>>;
type LoadStatus = 'loading' | 'ready' | 'error';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const SEASONS: readonly LifeSeason[] = ['balanced', 'build', 'recovery', 'parenting', 'study', 'travel'];
const RATINGS: readonly Rating[] = [1, 2, 3, 4, 5];
const DOMAIN_IDS: readonly DomainId[] = ['recovery', 'connection', 'work', 'margin'];
const DOMAIN_ICONS: Record<DomainId, AppIconName> = {
  recovery: 'recovery',
  connection: 'connection',
  work: 'work',
  margin: 'margin',
};

const copy = {
  ar: {
    eyebrow: 'البوصلة',
    title: 'مواسم الحياة',
    body: 'غيّر الموسم عندما تتغيّر أولوياتك المؤقتة، وعدّل المستوى المستدام الذي تريد حمايته لكل مجال. التوازن يُعاد حسابه مقابل هذه الأهداف التي اخترتها أنت، وليس مقابل توزيع مثالي ثابت.',
    seasonTitle: 'الموسم الحالي',
    seasonBody: 'الموسم يغيّر ما يعتبره ميزان توازنًا مناسبًا لك الآن، ولا يغيّر قيمة أي مجال أو يحكم على اختياراتك.',
    targetTitle: 'أهداف هذا الموسم',
    targetBody: 'اختياري. استخدم 1–5 للمستوى الذي تعتبره كافيًا ومستدامًا في هذا الموسم. ترك المجال بلا هدف يبقيه مجهول الهدف.',
    unset: 'غير محدد',
    save: 'حفظ الموسم والأهداف',
    saving: 'جارٍ الحفظ…',
    saved: 'تم حفظ الموسم. سيستخدم ميزان الأهداف الجديدة عند حساب التوازن القادم.',
    loading: 'جارٍ تحميل مواسمك…',
    loadError: 'تعذر تحميل مواسمك الآن.',
    saveError: 'تعذر حفظ الموسم الآن. لم يتم اعتبار التغيير مكتملًا.',
    historyTitle: 'سجل المواسم',
    historyBody: 'السجل يحفظ السياق الذي كنت تستخدمه وقتها حتى تظل المقارنات اللاحقة قابلة للفهم.',
    historyEmpty: 'لا يوجد سجل سابق بعد. يبدأ السجل من أول موسم محفوظ بعد تفعيل هذه الميزة.',
    current: 'الحالي',
    ended: 'انتهى',
    targets: 'الأهداف المسجلة',
    none: 'لا أهداف رقمية مسجلة',
    unknownDomain: 'مجال آخر',
    back: 'العودة للإعدادات',
    seasons: {
      balanced: 'مرحلة متوازنة',
      build: 'بناء أو مشروع مكثف',
      recovery: 'تعافٍ واستعادة',
      parenting: 'تربية وأسرة',
      study: 'دراسة أو اختبارات',
      travel: 'سفر أو انتقال',
    },
  },
  en: {
    eyebrow: 'Compass',
    title: 'Life Seasons',
    body: 'Change season when temporary priorities change, and adjust the sustainable level you want to protect in each area. Balance is recalculated against targets you chose, not a fixed ideal allocation.',
    seasonTitle: 'Current season',
    seasonBody: 'Your season changes what balance means for you right now; it does not change the value of any area or judge your choices.',
    targetTitle: 'Targets for this season',
    targetBody: 'Optional. Use 1–5 for the level you consider sustainably good enough in this season. Leaving an area unset keeps its target unknown.',
    unset: 'Not set',
    save: 'Save season & targets',
    saving: 'Saving…',
    saved: 'Season saved. MIZAN will use the new targets in the next Balance calculation.',
    loading: 'Loading your Life Seasons…',
    loadError: 'MIZAN could not load your Life Seasons right now.',
    saveError: 'MIZAN could not save the season. The change was not treated as complete.',
    historyTitle: 'Season history',
    historyBody: 'History preserves the context you were using at the time so later comparisons remain understandable.',
    historyEmpty: 'No prior history yet. History starts with the first season saved after this feature is enabled.',
    current: 'Current',
    ended: 'Ended',
    targets: 'Recorded targets',
    none: 'No numeric targets recorded',
    unknownDomain: 'Another area',
    back: 'Back to settings',
    seasons: {
      balanced: 'Balanced season',
      build: 'Building or intense work',
      recovery: 'Recovery',
      parenting: 'Parenting & family',
      study: 'Study or exams',
      travel: 'Travel or transition',
    },
  },
} as const;

function formatDate(value: string, locale: 'ar' | 'en'): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
}

function isDomainId(value: string): value is DomainId {
  return DOMAIN_IDS.includes(value as DomainId);
}

export default function LifeSeasonsScreen() {
  const {
    enabledDomains,
    isRtl,
    lifeSeason,
    locale,
    refreshSession,
    setLifeSeason,
    t,
    userId,
  } = useAppState();
  const labels = copy[locale];
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const [selectedSeason, setSelectedSeason] = useState<LifeSeason>(lifeSeason ?? 'balanced');
  const [selectedSeasonUserId, setSelectedSeasonUserId] = useState<string | null>(userId);
  const [targets, setTargets] = useState<TargetDraft>({});
  const [state, setState] = useState<LifeSeasonsState | null>(null);
  const [stateUserId, setStateUserId] = useState<string | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const activeUserRef = useRef(userId);
  activeUserRef.current = userId;
  const loadRequestRef = useRef(0);
  const saveRequestRef = useRef(0);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        setSelectedSeason(lifeSeason ?? 'balanced');
        setSelectedSeasonUserId(userId);
      }
    });
    return () => {
      active = false;
    };
  }, [lifeSeason, userId]);

  useEffect(() => {
    saveRequestRef.current += 1;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setSaveStatus('idle');
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const reload = useCallback(async () => {
    const requestedUserId = userId;
    const requestId = ++loadRequestRef.current;
    const requestIsCurrent = () =>
      loadRequestRef.current === requestId && activeUserRef.current === requestedUserId;

    setState(null);
    setStateUserId(null);
    setTargets({});

    if (!requestedUserId) {
      if (requestIsCurrent()) setLoadStatus('ready');
      return;
    }

    setLoadStatus('loading');
    const result = await loadLifeSeasonsState(requestedUserId);
    if (!requestIsCurrent()) return;

    if (!result.ok) {
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (!requestIsCurrent()) return;
      }
      setLoadStatus('error');
      return;
    }

    setState(result.value);
    setStateUserId(requestedUserId);
    setTargets(result.value.targets as TargetDraft);
    setLoadStatus('ready');
  }, [refreshSession, userId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return reload();
      return undefined;
    });
    return () => {
      active = false;
      loadRequestRef.current += 1;
    };
  }, [reload]);

  const enabledSet = useMemo(() => new Set(enabledDomains), [enabledDomains]);
  const visibleState = stateUserId === userId ? state : null;
  const visibleTargets = stateUserId === userId ? targets : {};
  const visibleSelectedSeason = selectedSeasonUserId === userId ? selectedSeason : (lifeSeason ?? 'balanced');
  const draftReadyForActiveUser = Boolean(userId) && stateUserId === userId && selectedSeasonUserId === userId;
  const history = visibleState?.history ?? [];
  const rangeArrow = isRtl ? '←' : '→';
  const controlsDisabled = !draftReadyForActiveUser || loadStatus === 'loading' || saveStatus === 'saving';

  const setTarget = (domainId: DomainId, rating: Rating | null) => {
    if (controlsDisabled) return;
    setTargets((current) => {
      const next = { ...current };
      if (rating === null) delete next[domainId];
      else next[domainId] = rating;
      return next;
    });
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  const handleSave = async () => {
    const requestedUserId = userId;
    if (
      !requestedUserId ||
      saveStatus === 'saving' ||
      stateUserId !== requestedUserId ||
      selectedSeasonUserId !== requestedUserId
    ) return;

    const requestId = ++saveRequestRef.current;
    const requestIsCurrent = () =>
      saveRequestRef.current === requestId && activeUserRef.current === requestedUserId;
    const seasonToSave = visibleSelectedSeason;

    setSaveStatus('saving');
    const filteredTargets: TargetDraft = {};
    for (const [domainId, rating] of Object.entries(visibleTargets)) {
      if (enabledSet.has(domainId as DomainId) && RATINGS.includes(rating as Rating)) {
        filteredTargets[domainId] = rating as Rating;
      }
    }

    const result = await saveLifeSeason(requestedUserId, seasonToSave, filteredTargets);
    if (!requestIsCurrent()) return;

    if (!result.ok) {
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (!requestIsCurrent()) return;
      }
      setSaveStatus('error');
      return;
    }

    setLifeSeason(seasonToSave);
    setSaveStatus('saved');
    await reload();
  };

  return (
    <Screen>
      <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={styles.heading}>
          <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
          <MizanText variant="display">{labels.title}</MizanText>
        </View>
        <SecondaryButton compact label={labels.back} onPress={() => router.replace('/settings')} />
      </View>

      <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <View style={[styles.iconTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.iconWell, { backgroundColor: palette.surface }]}>
            <AppIcon name="season" color={palette.accent} size={22} />
          </View>
          <MizanText variant="title" style={styles.flexibleText}>{labels.seasonTitle}</MizanText>
        </View>
        <MizanText>{labels.body}</MizanText>
        <MizanText variant="caption" muted>{labels.seasonBody}</MizanText>
        <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {SEASONS.map((season) => (
            <ChoiceChip
              key={season}
              label={labels.seasons[season]}
              selected={visibleSelectedSeason === season}
              disabled={controlsDisabled}
              onPress={() => {
                if (controlsDisabled) return;
                setSelectedSeason(season);
                setSelectedSeasonUserId(userId);
                if (saveStatus !== 'idle') setSaveStatus('idle');
              }}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.targetCard}>
        <View style={styles.sectionHeader}>
          <MizanText variant="title">{labels.targetTitle}</MizanText>
          <MizanText muted>{labels.targetBody}</MizanText>
        </View>
        <View style={[styles.targetGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {enabledDomains.map((domainId) => (
            <View
              key={domainId}
              style={[styles.targetPanel, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
              <View style={[styles.iconTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.iconWell, { backgroundColor: palette.accentSoft }]}>
                  <AppIcon name={DOMAIN_ICONS[domainId]} color={palette.accent} size={20} />
                </View>
                <MizanText variant="label" style={styles.flexibleText}>{t(domainId)}</MizanText>
              </View>
              <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <ChoiceChip
                  accessibilityLabel={`${t(domainId)}: ${labels.unset}`}
                  label={labels.unset}
                  selected={visibleTargets[domainId] === undefined}
                  disabled={controlsDisabled}
                  onPress={() => setTarget(domainId, null)}
                />
                {RATINGS.map((rating) => {
                  const localizedRating = formatLocalizedNumber(rating, locale, 0);
                  return (
                    <ChoiceChip
                      key={`${domainId}-${rating}`}
                      accessibilityLabel={`${t(domainId)}: ${localizedRating}`}
                      label={localizedRating}
                      selected={visibleTargets[domainId] === rating}
                      disabled={controlsDisabled}
                      onPress={() => setTarget(domainId, rating)}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <PrimaryButton
          label={saveStatus === 'saving' ? labels.saving : labels.save}
          disabled={controlsDisabled}
          onPress={() => void handleSave()}
        />

        {saveStatus === 'saved' || saveStatus === 'error' || loadStatus === 'error' ? (
          <View style={[styles.statusPanel, { backgroundColor: palette.surfaceMuted }]}>
            {saveStatus === 'saved' ? (
              <MizanText accessibilityLiveRegion="polite" muted>{labels.saved}</MizanText>
            ) : null}
            {saveStatus === 'error' ? (
              <MizanText accessibilityLiveRegion="polite" muted>{labels.saveError}</MizanText>
            ) : null}
            {loadStatus === 'error' ? (
              <MizanText accessibilityLiveRegion="polite" muted>{labels.loadError}</MizanText>
            ) : null}
          </View>
        ) : null}
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MizanText variant="title">{labels.historyTitle}</MizanText>
          <MizanText muted>{labels.historyBody}</MizanText>
        </View>
        {loadStatus === 'loading' ? (
          <Card style={{ backgroundColor: palette.surfaceMuted }}>
            <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText>
          </Card>
        ) : null}
        {loadStatus === 'ready' && history.length === 0 ? (
          <Card style={{ backgroundColor: palette.surfaceMuted }}>
            <MizanText accessibilityLiveRegion="polite" muted>{labels.historyEmpty}</MizanText>
          </Card>
        ) : null}
        <View style={[styles.historyGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {history.map((entry) => {
            const recordedTargets = Object.entries(entry.target_snapshot)
              .map(([domainId, rating]) => `${isDomainId(domainId) ? t(domainId) : labels.unknownDomain}: ${formatLocalizedNumber(Number(rating), locale, 0)}`)
              .join(' · ');
            return (
              <Card key={entry.id} style={styles.historyCard}>
                <View style={[styles.historyHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.iconTitleRow, styles.historyTitleGroup, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.iconWell, { backgroundColor: palette.accentSoft }]}>
                      <AppIcon name="season" color={palette.accent} size={20} />
                    </View>
                    <MizanText variant="title" style={styles.flexibleText}>{labels.seasons[entry.season]}</MizanText>
                  </View>
                  <View style={[styles.historyPill, { backgroundColor: palette.accentSoft }]}>
                    <MizanText variant="caption">{entry.ended_at ? labels.ended : labels.current}</MizanText>
                  </View>
                </View>
                <MizanText muted>
                  {formatDate(entry.started_at, locale)}{entry.ended_at ? ` ${rangeArrow} ${formatDate(entry.ended_at, locale)}` : ''}
                </MizanText>
                <View style={[styles.recordedTargets, { borderTopColor: palette.border }]}> 
                  <MizanText variant="caption" muted>{labels.targets}</MizanText>
                  <MizanText>{recordedTargets || labels.none}</MizanText>
                </View>
              </Card>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  heroCard: { gap: Spacing.lg },
  targetCard: { gap: Spacing.xl },
  section: { gap: Spacing.lg },
  sectionHeader: { gap: Spacing.sm },
  iconTitleRow: { alignItems: 'center', gap: Spacing.md },
  iconWell: {
    width: Controls.minimumTouchHeight,
    height: Controls.minimumTouchHeight,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  wrap: { flexWrap: 'wrap', gap: Spacing.sm },
  targetGrid: { flexWrap: 'wrap', gap: Spacing.md },
  targetPanel: {
    flexGrow: 1,
    flexBasis: 280,
    minWidth: 0,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statusPanel: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  historyGrid: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  historyCard: { flexGrow: 1, flexShrink: 1, flexBasis: 360 },
  historyHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  historyTitleGroup: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
  flexibleText: { flexShrink: 1 },
  historyPill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', borderRadius: Radius.pill, paddingHorizontal: Spacing.md },
  recordedTargets: { borderTopWidth: Controls.borderWidth, paddingTop: Spacing.md, gap: Spacing.sm },
});