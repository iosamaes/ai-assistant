import type { HumanStateVector, PersonalizationMaturity } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { loadCurrentHumanState } from '@/application/daily-intelligence';
import { Card, MizanText } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const stageOrder: readonly PersonalizationMaturity[] = ['cold_start', 'learning', 'personalized'];

const copy = {
  ar: {
    eyebrow: 'التخصيص',
    title: 'إلى أي مدى تعلّم ميزان عن نمطك؟',
    body: 'هذه ليست درجة لك. إنها توضح فقط مدى نضج الأدلة الشخصية التي يعتمد عليها ميزان، وقد تتراجع المرحلة إذا أصبحت البيانات قديمة أو قليلة.',
    loading: 'جارٍ قراءة حالة التخصيص…',
    error: 'تعذر قراءة حالة التخصيص الآن.',
    empty: 'لا توجد حالة تخصيص متاحة بعد. ابدأ بتسجيل فحص سريع ليبدأ ميزان في التعلّم.',
    current: 'المرحلة الحالية',
    progression: 'مراحل التعلّم',
    coldStartTitle: 'بداية التعلّم',
    coldStartBody: 'الأدلة ما زالت محدودة، لذلك يتجنب ميزان ادعاء أن لديه خط أساس شخصيًا ثابتًا.',
    learningTitle: 'يتعلّم نمطك',
    learningBody: 'بدأت تظهر إشارات متكررة، لكن ميزان ما زال يعامل التخصيص على أنه غير ناضج ويعرض الثقة بوضوح.',
    personalizedTitle: 'تخصيص ناضج',
    personalizedBody: 'توجد أدلة حديثة كافية لاستخدام تقديرات شخصية أكثر، مع بقاء الثقة والبيانات الناقصة ظاهرة بدل إخفائها.',
    note: 'كل استنتاج يظل مقيدًا بحداثة الأدلة وجودتها؛ الوصول إلى مرحلة التخصيص لا يعني اليقين ولا يحول البيانات الناقصة إلى أرقام.',
    back: 'العودة للإعدادات',
  },
  en: {
    eyebrow: 'Personalization',
    title: 'How much has MIZAN learned about your pattern?',
    body: 'This is not a score for you. It only describes how mature the personal evidence is, and the stage can move backward when evidence becomes old or sparse.',
    loading: 'Reading personalization maturity…',
    error: 'Personalization maturity could not be loaded right now.',
    empty: 'No personalization state is available yet. Start with a quick check-in so MIZAN can begin learning.',
    current: 'Current stage',
    progression: 'Learning stages',
    coldStartTitle: 'Starting to learn',
    coldStartBody: 'Evidence is still limited, so MIZAN avoids pretending it has a stable personal baseline.',
    learningTitle: 'Learning your pattern',
    learningBody: 'Repeated signals are beginning to form, but MIZAN still treats personalization as immature and keeps confidence explicit.',
    personalizedTitle: 'Mature personalization',
    personalizedBody: 'There is enough recent evidence to use more personal estimates, while confidence and missing data remain visible rather than hidden.',
    note: 'Every inference still depends on evidence freshness and quality; reaching the personalized stage is not certainty and never turns missing data into numbers.',
    back: 'Back to settings',
  },
} as const;

function stageTitle(stage: PersonalizationMaturity, locale: 'ar' | 'en'): string {
  const labels = copy[locale];
  if (stage === 'cold_start') return labels.coldStartTitle;
  if (stage === 'learning') return labels.learningTitle;
  return labels.personalizedTitle;
}

function stageBody(stage: PersonalizationMaturity, locale: 'ar' | 'en'): string {
  const labels = copy[locale];
  if (stage === 'cold_start') return labels.coldStartBody;
  if (stage === 'learning') return labels.learningBody;
  return labels.personalizedBody;
}

export default function PersonalizationScreen() {
  const { locale, refreshSession, userId } = useAppState();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [state, setState] = useState<HumanStateVector | null>(null);
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const labels = copy[locale];

  useEffect(() => {
    let active = true;
    if (!userId) {
      setState(null);
      setStatus('ready');
      return () => {
        active = false;
      };
    }

    setStatus('loading');
    void loadCurrentHumanState(userId).then(async (result) => {
      if (!active) return;
      if (!result.ok) {
        if (result.error.kind === 'session-expired') await refreshSession();
        if (active) setStatus('error');
        return;
      }
      setState(result.value);
      setStatus('ready');
    });

    return () => {
      active = false;
    };
  }, [refreshSession, userId]);

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
      </View>

      {status === 'loading' ? <MizanText muted>{labels.loading}</MizanText> : null}
      {status === 'error' ? <MizanText muted>{labels.error}</MizanText> : null}
      {status === 'ready' && !state ? (
        <Card>
          <MizanText muted>{labels.empty}</MizanText>
        </Card>
      ) : null}

      {state ? (
        <>
          <Card>
            <MizanText variant="label" muted>{labels.current}</MizanText>
            <MizanText variant="title">{stageTitle(state.maturity, locale)}</MizanText>
            <MizanText muted>{stageBody(state.maturity, locale)}</MizanText>
          </Card>

          <View style={styles.progression}>
            <MizanText variant="title">{labels.progression}</MizanText>
            {stageOrder.map((stage) => {
              const active = stage === state.maturity;
              return (
                <View
                  key={stage}
                  style={[
                    styles.stage,
                    {
                      borderColor: active ? palette.accent : palette.border,
                      backgroundColor: palette.surface,
                    },
                  ]}>
                  <MizanText variant="label">{stageTitle(stage, locale)}</MizanText>
                  <MizanText variant="caption" muted>{stageBody(stage, locale)}</MizanText>
                </View>
              );
            })}
          </View>

          <MizanText variant="caption" muted>{labels.note}</MizanText>
        </>
      ) : null}

      <Pressable accessibilityRole="button" onPress={() => router.replace('/settings')} style={styles.back}>
        <MizanText variant="label">{labels.back}</MizanText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md },
  progression: { gap: Spacing.sm },
  stage: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.sm,
    gap: Spacing.xs,
    padding: Spacing.md,
  },
  back: { alignSelf: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
});
