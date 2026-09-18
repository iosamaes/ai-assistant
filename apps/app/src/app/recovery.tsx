import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { loadRecoveryPlan } from '@/application/recovery';
import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
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
    step: 'الخطوة',
    of: 'من',
    next: 'الخطوة التالية',
    done: 'انتهيت الآن',
    skip: 'تخطي هذه الخطوة بدون عقوبة',
    back: 'العودة لليوم',
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
    step: 'Step',
    of: 'of',
    next: 'Next tiny step',
    done: 'I am done for now',
    skip: 'Skip this step without penalty',
    back: 'Back to Today',
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
  const { locale, refreshSession, userId } = useAppState();
  const labels = copy[locale];
  const [plan, setPlan] = useState<RecoveryPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await loadRecoveryPlan(userId);
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setMessage(labels.loadError);
      setPlan(null);
    } else {
      setPlan(result.value);
      setStepIndex(0);
    }
    setLoading(false);
  }, [labels.loadError, refreshSession, userId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return load();
      return undefined;
    });
    return () => {
      active = false;
    };
  }, [load]);

  const currentStep = plan?.steps[stepIndex] ?? null;
  const needText = plan
    ? plan.need === 'insufficient_evidence'
      ? labels.insufficient
      : labels[plan.need]
    : null;
  const reasonLabels = useMemo(
    () => plan?.reasons.map((reason) => labels.reason[reason.key as RecoveryReasonKey]) ?? [],
    [labels.reason, plan],
  );

  const advance = () => {
    if (!plan) return;
    if (stepIndex >= plan.steps.length - 1) {
      router.replace('/today');
      return;
    }
    setStepIndex((current) => current + 1);
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
      </View>

      {loading ? <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText> : null}
      {message ? <MizanText accessibilityLiveRegion="polite" muted>{message}</MizanText> : null}

      {plan ? (
        <>
          <Card>
            <MizanText variant="title">{needText}</MizanText>
            <MizanText variant="caption" muted>
              {labels.confidence}: {labels.confidenceLevels[plan.confidence.level]} · {labels.evidence}: {plan.confidence.evidenceCount}
            </MizanText>
            {reasonLabels.length > 0 ? (
              <View style={styles.reasonGroup}>
                <MizanText variant="label">{labels.reasons}</MizanText>
                {reasonLabels.map((reason) => <MizanText key={reason} muted>• {reason}</MizanText>)}
              </View>
            ) : null}
          </Card>

          {currentStep ? (
            <Card>
              <MizanText accessibilityLiveRegion="polite" variant="label" muted>
                {labels.step} {stepIndex + 1} {labels.of} {plan.steps.length}
              </MizanText>
              <MizanText variant="title">{labels.steps[currentStep.id as RecoveryStepId].title}</MizanText>
              <MizanText>{labels.steps[currentStep.id as RecoveryStepId].body}</MizanText>
              <PrimaryButton
                label={stepIndex >= plan.steps.length - 1 ? labels.done : labels.next}
                onPress={advance}
              />
              <SecondaryButton label={labels.skip} onPress={advance} />
            </Card>
          ) : null}

          <MizanText variant="caption" muted>{labels.caveat}</MizanText>
        </>
      ) : null}

      <SecondaryButton compact label={labels.back} onPress={() => router.replace('/today')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  reasonGroup: { gap: Spacing.sm, paddingTop: Spacing.sm },
});
