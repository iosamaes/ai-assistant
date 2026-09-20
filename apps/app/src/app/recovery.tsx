import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { loadRecoveryPlan } from '@/application/recovery';
import { BrandedIllustration } from '@/components/branded-illustration';
import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';
import type { RecoveryPlan, RecoveryReasonKey, RecoveryStepId } from '@mizan/core';

const copy = {
  ar: {
    eyebrow: 'وضع الاستعادة',
    title: 'أنقذ يومي',
    body: 'مسار قصير عندما تكون الطاقة أو المساحة الذهنية منخفضة. لا نقاط، لا عقوبة، ويمكنك التوقف في أي لحظة.',
    loading: 'جارٍ قراءة حالتك الحالية…',
    loadError: 'تعذر قراءة حالتك الآن. يمكنك المحاولة لاحقًا أو العودة لليوم.',
    confidence: 'الثقة',
    evidence: 'الأدلة',
    reasons: 'لماذا ظهر هذا المسار؟',
    insufficient: 'لا توجد أدلة كافية لتشغيل هذا الوضع تلقائيًا، لكنه يظل متاحًا لك طوعًا.',
    available: 'هذا المسار متاح كإعادة ضبط خفيفة.',
    suggested: 'هناك أكثر من إشارة تدعم أخذ إعادة ضبط قصيرة.',
    strongly_suggested: 'الإشارات الحالية تدعم بقوة تقليل الحمل وأخذ استعادة قصيرة.',
    planLabel: 'قراءة اليوم',
    resetLabel: 'إعادة ضبط هادئة',
    step: 'الخطوة',
    of: 'من',
    next: 'الخطوة التالية',
    done: 'انتهيت الآن',
    skip: 'تخطي هذه الخطوة بدون عقوبة',
    back: 'العودة لليوم',
    caveatTitle: 'مهم',
    caveat: 'هذا دعم يومي غير طبي، وليس تشخيصًا أو علاجًا. إذا كانت الأدلة ناقصة سيقول ميزان ذلك بوضوح.',
    confidenceLevels: {
      insufficient: 'دليل غير كافٍ',
      possible: 'ممكن',
      likely: 'مرجّح',
      known: 'قوي',
    },
    reason: {
      high_overload: 'احتمال حمل زائد مرتفع',
      high_mental_load: 'ضغط ذهني مرتفع',
      low_energy: 'طاقة منخفضة',
      low_recovery: 'تعافٍ منخفض',
    },
    steps: {
      pause_inputs: {
        title: 'دقيقتان بدون مدخلات',
        body: 'اترك الشاشة والإشعارات جانبًا، اجلس أو قف بهدوء، ولا تحاول حل شيء الآن.',
      },
      restore_body: {
        title: 'خمس دقائق للجسم',
        body: 'اشرب ماءً إن كان مناسبًا لك، غيّر وضعية جسمك، وخذ تنفسًا هادئًا بدون هدف للأداء.',
      },
      reduce_load: {
        title: 'احمِ العشر دقائق القادمة',
        body: 'اختر شيئًا غير ضروري لتأجيله الآن، واحتفظ بمهمة واحدة صغيرة فقط أو استمر في الراحة.',
      },
    },
  },
  en: {
    eyebrow: 'Recovery mode',
    title: 'Save My Day',
    body: 'A short low-load path for days when energy or mental space is limited. No points, no penalty, and you can stop at any time.',
    loading: 'Reading your current state…',
    loadError: 'MIZAN could not read your current state right now. You can try later or return to Today.',
    confidence: 'Confidence',
    evidence: 'Evidence',
    reasons: 'Why did this appear?',
    insufficient: 'There is not enough evidence to trigger this mode automatically, but you can still use it voluntarily.',
    available: 'This path is available as a gentle reset.',
    suggested: 'More than one signal supports taking a short reset.',
    strongly_suggested: 'Current signals strongly support reducing load and taking a short recovery reset.',
    planLabel: 'Today’s reading',
    resetLabel: 'Gentle reset',
    step: 'Step',
    of: 'of',
    next: 'Next tiny step',
    done: 'I am done for now',
    skip: 'Skip this step without penalty',
    back: 'Back to Today',
    caveatTitle: 'Important',
    caveat: 'This is non-medical daily support, not diagnosis or treatment. When evidence is limited, MIZAN says so explicitly.',
    confidenceLevels: {
      insufficient: 'Insufficient evidence',
      possible: 'Possible',
      likely: 'Likely',
      known: 'Strong',
    },
    reason: {
      high_overload: 'Higher overload risk',
      high_mental_load: 'Higher mental load',
      low_energy: 'Lower energy',
      low_recovery: 'Lower recovery',
    },
    steps: {
      pause_inputs: {
        title: 'Two minutes with fewer inputs',
        body: 'Put the screen and notifications aside. Sit or stand quietly and do not try to solve anything yet.',
      },
      restore_body: {
        title: 'Five minutes for the body',
        body: 'Have some water if appropriate for you, change posture, and take a few calm breaths without a performance goal.',
      },
      reduce_load: {
        title: 'Protect the next ten minutes',
        body: 'Choose one nonessential thing to postpone. Keep only one small next action, or continue resting.',
      },
    },
  },
} as const;

export default function RecoveryScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const labels = copy[locale];
  const [plan, setPlan] = useState<RecoveryPlan | null>(null);
  const [planUserId, setPlanUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const activeUserRef = useRef(userId);
  const loadRequestRef = useRef(0);
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];

  const load = useCallback(async () => {
    const requestedUserId = userId;
    const requestId = ++loadRequestRef.current;
    const requestIsCurrent = () =>
      loadRequestRef.current === requestId && activeUserRef.current === requestedUserId;

    if (!requestedUserId) {
      if (!requestIsCurrent()) return;
      setPlan(null);
      setPlanUserId(null);
      setMessage(null);
      setStepIndex(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage(null);
    setPlan(null);
    setPlanUserId(null);
    setStepIndex(0);

    const result = await loadRecoveryPlan(requestedUserId);
    if (!requestIsCurrent()) return;

    if (!result.ok) {
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (!requestIsCurrent()) return;
      }
      setMessage(labels.loadError);
      setPlan(null);
      setPlanUserId(null);
    } else {
      setPlan(result.value);
      setPlanUserId(requestedUserId);
      setStepIndex(0);
    }
    setLoading(false);
  }, [labels.loadError, refreshSession, userId]);

  useEffect(() => {
    activeUserRef.current = userId;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return load();
      return undefined;
    });
    return () => {
      active = false;
      loadRequestRef.current += 1;
    };
  }, [load, userId]);

  const visiblePlan = planUserId === userId ? plan : null;
  const currentStep = visiblePlan?.steps[stepIndex] ?? null;
  const needText = visiblePlan
    ? visiblePlan.need === 'insufficient_evidence'
      ? labels.insufficient
      : labels[visiblePlan.need]
    : null;
  const reasonLabels = useMemo(
    () => visiblePlan?.reasons.map((reason) => labels.reason[reason.key as RecoveryReasonKey]) ?? [],
    [labels.reason, visiblePlan],
  );

  const advance = () => {
    if (!visiblePlan) return;
    if (stepIndex >= visiblePlan.steps.length - 1) {
      router.replace('/today');
      return;
    }
    setStepIndex((current) => current + 1);
  };

  return (
    <Screen>
      <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={styles.heading}>
          <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
          <MizanText variant="display">{labels.title}</MizanText>
        </View>
        <SecondaryButton compact label={labels.back} onPress={() => router.replace('/today')} />
      </View>

      <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <View style={[styles.heroLayout, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={styles.heroCopy}>
            <MizanText variant="title">{labels.resetLabel}</MizanText>
            <MizanText muted>{labels.body}</MizanText>
          </View>
          <View style={styles.heroVisual}>
            <BrandedIllustration variant="recovery" size={150} />
          </View>
        </View>
      </Card>

      {loading ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText>
        </Card>
      ) : null}
      {message ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{message}</MizanText>
        </Card>
      ) : null}

      {visiblePlan ? (
        <>
          <Card style={styles.planCard}>
            <View style={[styles.planHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={styles.flexibleText}>
                <MizanText variant="label" muted>{labels.planLabel}</MizanText>
                <MizanText variant="title">{needText}</MizanText>
              </View>
              <View style={[styles.confidencePill, { backgroundColor: palette.accentSoft }]}>
                <MizanText variant="caption">
                  {labels.confidence}: {labels.confidenceLevels[visiblePlan.confidence.level]}
                </MizanText>
              </View>
            </View>

            <View
              style={[
                styles.planStats,
                { borderTopColor: palette.border, flexDirection: isRtl ? 'row-reverse' : 'row' },
              ]}>
              <View style={styles.statBlock}>
                <MizanText variant="caption" muted>{labels.evidence}</MizanText>
                <MizanText variant="title">{formatLocalizedNumber(visiblePlan.confidence.evidenceCount, locale, 0)}</MizanText>
              </View>
              <View style={styles.statBlock}>
                <MizanText variant="caption" muted>{labels.confidence}</MizanText>
                <MizanText variant="label">{labels.confidenceLevels[visiblePlan.confidence.level]}</MizanText>
              </View>
            </View>

            {reasonLabels.length > 0 ? (
              <View style={[styles.reasonGroup, { borderTopColor: palette.border }]}>
                <MizanText variant="label">{labels.reasons}</MizanText>
                {reasonLabels.map((reason) => (
                  <View key={reason} style={[styles.reasonRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.reasonDot, { backgroundColor: palette.accent }]} />
                    <MizanText muted style={styles.flexibleText}>{reason}</MizanText>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>

          {currentStep ? (
            <Card style={[styles.stepCard, { borderColor: palette.accent }]}>
              <View style={styles.progressGroup}>
                <View style={[styles.stepMetaRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <MizanText accessibilityLiveRegion="polite" variant="label" muted>
                    {labels.step} {formatLocalizedNumber(stepIndex + 1, locale, 0)} {labels.of} {formatLocalizedNumber(visiblePlan.steps.length, locale, 0)}
                  </MizanText>
                  <MizanText variant="caption" muted>{labels.resetLabel}</MizanText>
                </View>
                <View
                  style={[styles.progressTrack, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants">
                  {visiblePlan.steps.map((step, index) => (
                    <View
                      key={step.id}
                      style={[
                        styles.progressSegment,
                        { backgroundColor: index <= stepIndex ? palette.accent : palette.border },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.stepCopy}>
                <MizanText variant="title">{labels.steps[currentStep.id as RecoveryStepId].title}</MizanText>
                <MizanText>{labels.steps[currentStep.id as RecoveryStepId].body}</MizanText>
              </View>

              <View style={styles.actions}>
                <PrimaryButton
                  label={stepIndex >= visiblePlan.steps.length - 1 ? labels.done : labels.next}
                  onPress={advance}
                />
                <SecondaryButton label={labels.skip} onPress={advance} />
              </View>
            </Card>
          ) : null}

          <Card style={[styles.caveatCard, { backgroundColor: palette.surfaceMuted }]}>
            <MizanText variant="label">{labels.caveatTitle}</MizanText>
            <MizanText variant="caption" muted>{labels.caveat}</MizanText>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    flexWrap: 'wrap',
  },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  flexibleText: { flex: 1, minWidth: 0 },
  heroCard: { gap: Spacing.md },
  heroLayout: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  heroCopy: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 300,
    minWidth: 0,
    gap: Spacing.md,
  },
  heroVisual: {
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCard: { gap: Spacing.lg },
  planHeader: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  confidencePill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  planStats: {
    borderTopWidth: Controls.borderWidth,
    paddingTop: Spacing.lg,
    flexWrap: 'wrap',
    gap: Spacing.xl,
  },
  statBlock: { minWidth: 120, gap: Spacing.xs },
  reasonGroup: {
    borderTopWidth: Controls.borderWidth,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  reasonRow: { alignItems: 'flex-start', gap: Spacing.sm },
  reasonDot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Radius.pill,
    marginTop: Spacing.sm,
  },
  stepCard: { gap: Spacing.xl },
  progressGroup: { gap: Spacing.md },
  stepMetaRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  progressTrack: { gap: Spacing.sm },
  progressSegment: { flex: 1, height: Spacing.xs, borderRadius: Radius.pill },
  stepCopy: { gap: Spacing.md },
  actions: { gap: Spacing.md },
  caveatCard: { gap: Spacing.sm },
});
