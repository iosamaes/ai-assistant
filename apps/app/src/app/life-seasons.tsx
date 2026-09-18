import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  loadLifeSeasonsState,
  saveLifeSeason,
  type LifeSeasonsState,
} from '@/application/life-seasons';
import { Card, ChoiceChip, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import type { DomainId, LifeSeason } from '@/state/app-state';
import { useAppState } from '@/state/app-state';

type Rating = 1 | 2 | 3 | 4 | 5;
type TargetDraft = Partial<Record<string, Rating>>;
type LoadStatus = 'loading' | 'ready' | 'error';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const SEASONS: readonly LifeSeason[] = ['balanced', 'build', 'recovery', 'parenting', 'study', 'travel'];
const RATINGS: readonly Rating[] = [1, 2, 3, 4, 5];
const DOMAIN_IDS: readonly DomainId[] = ['recovery', 'connection', 'work', 'margin'];

const copy = {
  ar: {
    eyebrow: 'البوصلة',
    title: 'مواسم الحياة',
    body: 'غيّر الموسم عندما تتغيّر أولوياتك المؤقتة، وعدّل المستوى المستدام الذي تريد حمايته لكل مجال. التوازن يُعاد حسابه مقابل هذه الأهداف التي اخترتها أنت، وليس مقابل توزيع مثالي ثابت.',
    seasonTitle: 'الموسم الحالي',
    targetTitle: 'أهداف هذا الموسم',
    targetBody: 'اختياري. استخدم 1–5 للمستوى الذي تعتبره كافيًا ومستدامًا في هذا الموسم. ترك المجال بلا هدف يبقيه مجهول الهدف.',
    unset: 'غير محدد',
    save: 'حفظ الموسم والأهداف',
    saving: 'جارٍ الحفظ…',
    saved: 'تم حفظ الموسم. سيستخدم ميزان الأهداف الجديدة عند حساب التوازن القادم.',
    loadError: 'تعذر تحميل مواسمك الآن.',
    saveError: 'تعذر حفظ الموسم الآن. لم يتم اعتبار التغيير مكتملًا.',
    historyTitle: 'سجل المواسم',
    historyEmpty: 'لا يوجد سجل سابق بعد. يبدأ السجل من أول موسم محفوظ بعد تفعيل هذه الميزة.',
    current: 'الحالي',
    ended: 'انتهى',
    targets: 'الأهداف المسجلة',
    none: 'لا أهداف رقمية مسجلة',
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
    targetTitle: 'Targets for this season',
    targetBody: 'Optional. Use 1–5 for the level you consider sustainably good enough in this season. Leaving an area unset keeps its target unknown.',
    unset: 'Not set',
    save: 'Save season & targets',
    saving: 'Saving…',
    saved: 'Season saved. MIZAN will use the new targets in the next Balance calculation.',
    loadError: 'MIZAN could not load your Life Seasons right now.',
    saveError: 'MIZAN could not save the season. The change was not treated as complete.',
    historyTitle: 'Season history',
    historyEmpty: 'No prior history yet. History starts with the first season saved after this feature is enabled.',
    current: 'Current',
    ended: 'Ended',
    targets: 'Recorded targets',
    none: 'No numeric targets recorded',
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
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-QA' : 'en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
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
  const [selectedSeason, setSelectedSeason] = useState<LifeSeason>(lifeSeason ?? 'balanced');
  const [targets, setTargets] = useState<TargetDraft>({});
  const [state, setState] = useState<LifeSeasonsState | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setSelectedSeason(lifeSeason ?? 'balanced');
    });
    return () => {
      active = false;
    };
  }, [lifeSeason]);

  const reload = useCallback(async () => {
    if (!userId) {
      setState(null);
      setTargets({});
      setLoadStatus('ready');
      return;
    }
    setLoadStatus('loading');
    const result = await loadLifeSeasonsState(userId);
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setLoadStatus('error');
      return;
    }
    setState(result.value);
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
    };
  }, [reload]);

  const enabledSet = useMemo(() => new Set(enabledDomains), [enabledDomains]);
  const history = state?.history ?? [];
  const rangeArrow = isRtl ? '←' : '→';

  const setTarget = (domainId: DomainId, rating: Rating | null) => {
    setTargets((current) => {
      const next = { ...current };
      if (rating === null) delete next[domainId];
      else next[domainId] = rating;
      return next;
    });
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!userId || saveStatus === 'saving') return;
    setSaveStatus('saving');
    const filteredTargets: TargetDraft = {};
    for (const [domainId, rating] of Object.entries(targets)) {
      if (enabledSet.has(domainId as DomainId) && RATINGS.includes(rating as Rating)) {
        filteredTargets[domainId] = rating as Rating;
      }
    }

    const result = await saveLifeSeason(selectedSeason, filteredTargets);
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setSaveStatus('error');
      return;
    }

    setLifeSeason(selectedSeason);
    setSaveStatus('saved');
    await reload();
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
      </View>

      <Card>
        <MizanText variant="title">{labels.seasonTitle}</MizanText>
        <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {SEASONS.map((season) => (
            <ChoiceChip
              key={season}
              label={labels.seasons[season]}
              selected={selectedSeason === season}
              onPress={() => {
                setSelectedSeason(season);
                if (saveStatus !== 'idle') setSaveStatus('idle');
              }}
            />
          ))}
        </View>
      </Card>

      <Card>
        <MizanText variant="title">{labels.targetTitle}</MizanText>
        <MizanText muted>{labels.targetBody}</MizanText>
        {enabledDomains.map((domainId) => (
          <View key={domainId} style={styles.targetRow}>
            <MizanText variant="label">{t(domainId)}</MizanText>
            <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <ChoiceChip
                label={labels.unset}
                selected={targets[domainId] === undefined}
                onPress={() => setTarget(domainId, null)}
              />
              {RATINGS.map((rating) => (
                <ChoiceChip
                  key={`${domainId}-${rating}`}
                  label={String(rating)}
                  selected={targets[domainId] === rating}
                  onPress={() => setTarget(domainId, rating)}
                />
              ))}
            </View>
          </View>
        ))}

        <PrimaryButton
          label={saveStatus === 'saving' ? labels.saving : labels.save}
          disabled={saveStatus === 'saving' || loadStatus === 'loading'}
          onPress={() => void handleSave()}
        />
        {saveStatus === 'saved' ? (
          <MizanText accessibilityLiveRegion="polite" muted>{labels.saved}</MizanText>
        ) : null}
        {saveStatus === 'error' ? (
          <MizanText accessibilityLiveRegion="polite" muted>{labels.saveError}</MizanText>
        ) : null}
        {loadStatus === 'error' ? (
          <MizanText accessibilityLiveRegion="polite" muted>{labels.loadError}</MizanText>
        ) : null}
      </Card>

      <View style={styles.section}>
        <MizanText variant="title">{labels.historyTitle}</MizanText>
        {loadStatus === 'ready' && history.length === 0 ? <MizanText muted>{labels.historyEmpty}</MizanText> : null}
        {history.map((entry) => {
          const recordedTargets = Object.entries(entry.target_snapshot)
            .map(([domainId, rating]) => `${isDomainId(domainId) ? t(domainId) : domainId}: ${rating}`)
            .join(' · ');
          return (
            <Card key={entry.id}>
              <View style={[styles.historyHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <MizanText variant="title">{labels.seasons[entry.season]}</MizanText>
                <MizanText variant="label" muted>{entry.ended_at ? labels.ended : labels.current}</MizanText>
              </View>
              <MizanText muted>
                {formatDate(entry.started_at, locale)}{entry.ended_at ? ` ${rangeArrow} ${formatDate(entry.ended_at, locale)}` : ''}
              </MizanText>
              <MizanText variant="caption" muted>{labels.targets}</MizanText>
              <MizanText>{recordedTargets || labels.none}</MizanText>
            </Card>
          );
        })}
      </View>

      <SecondaryButton compact label={labels.back} onPress={() => router.replace('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  section: { gap: Spacing.lg },
  wrap: { flexWrap: 'wrap', gap: Spacing.sm },
  targetRow: { gap: Spacing.sm },
  historyHeader: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
});
