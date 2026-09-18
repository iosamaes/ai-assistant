import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { assessExplicitHumanROI } from '@/application/human-roi';
import { Card, ChoiceChip, MizanText, MizanTextInput, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

const RATINGS = [1, 2, 3, 4, 5] as const;

const copy = {
  ar: {
    eyebrow: 'أداة قرار',
    title: 'العائد الإنساني',
    body: 'قارن فقط ما صرّحت أنت بأنه فائدة وما صرّحت بأنه جهد ووقت. لا توجد درجة قيمة للإنسان، ولا يحوّل ميزان العلاقات أو العبادة أو اللحظات المقدسة إلى معادلة إجبارية.',
    mode: 'كيف تريد التعامل مع هذا الشيء؟',
    compare: 'مقارنة أدلة صريحة',
    protect: 'أبقِه خارج التحسين',
    protectedTitle: 'محمي من المقارنة',
    protectedBody: 'اخترت إبقاء هذا النشاط أو المعنى خارج المقارنة الكمية. ميزان يحترم ذلك ولا يحسب له عائدًا رقميًا.',
    benefit: 'الفائدة التي شعرت بها',
    benefitHint: '1 = قليلة جدًا · 5 = عالية جدًا',
    effort: 'الجهد الذي شعرت به',
    effortHint: '1 = خفيف جدًا · 5 = مرتفع جدًا',
    time: 'الوقت الأسبوعي الفعلي أو المتوقع',
    timePlaceholder: 'مثال: 3',
    hoursPerWeek: 'ساعة / أسبوع',
    assessment: 'القراءة الحالية',
    insufficient: 'الأدلة غير مكتملة',
    missingBenefit: 'اختر تقييم الفائدة الذي عبّرت عنه أنت.',
    missingEffort: 'اختر تقييم الجهد الذي عبّرت عنه أنت.',
    missingTime: 'أدخل الوقت الأسبوعي الذي تعرفه. لا يخمّن ميزان وقتًا غير مسجّل.',
    benefitHeavier: 'الفائدة المبلّغ عنها أعلى بوضوح من الجهد',
    benefitHeavierBody: 'هذه قراءة وصفية من مدخلاتك فقط، وليست حكمًا بأن النشاط يجب أن يستمر.',
    mixed: 'الفائدة والجهد متقاربان',
    mixedBody: 'لا توجد إشارة قوية في اتجاه واحد من تقييماتك الحالية. الوقت يظهر كسياق فقط وليس كمعامل سري في درجة.',
    costHeavier: 'الجهد المبلّغ عنه أعلى بوضوح من الفائدة',
    costHeavierBody: 'هذه إشارة للمراجعة وليست أمرًا بالتوقف؛ قد تكون هناك قيمة أو التزامات لا تختزلها هذه المقارنة.',
    benefitMetric: 'الفائدة',
    effortMetric: 'الجهد',
    timeMetric: 'الوقت',
    evidence: 'أدلة مباشرة',
    confidence: 'الثقة',
    confidenceLevels: {
      insufficient: 'غير كافية',
      possible: 'ممكنة',
      likely: 'مرجحة',
      known: 'قوية',
    },
    caveat: 'لا ينتج ميزان رقم ROI موحدًا هنا؛ ذلك سيخلق دقة زائفة بين مقاييس مختلفة. النتيجة تحافظ على التقييمات الأصلية والوقت كسياق قابل للفحص.',
    back: 'العودة للإعدادات',
  },
  en: {
    eyebrow: 'Decision tool',
    title: 'Human ROI',
    body: 'Compare only benefit, effort, and time you explicitly report. There is no human-worth score, and MIZAN does not force relationships, worship, or sacred moments into an optimization equation.',
    mode: 'How should this be treated?',
    compare: 'Compare explicit evidence',
    protect: 'Keep outside optimization',
    protectedTitle: 'Protected from comparison',
    protectedBody: 'You chose to keep this activity or meaning outside quantitative comparison. MIZAN respects that and does not calculate a numeric return.',
    benefit: 'Benefit you experienced',
    benefitHint: '1 = very low · 5 = very high',
    effort: 'Effort you experienced',
    effortHint: '1 = very light · 5 = very high',
    time: 'Actual or expected weekly time',
    timePlaceholder: 'Example: 3',
    hoursPerWeek: 'hours / week',
    assessment: 'Current assessment',
    insufficient: 'Incomplete evidence',
    missingBenefit: 'Choose the benefit rating you explicitly report.',
    missingEffort: 'Choose the effort rating you explicitly report.',
    missingTime: 'Enter weekly time you actually know. MIZAN does not guess unrecorded time.',
    benefitHeavier: 'Reported benefit clearly exceeds reported effort',
    benefitHeavierBody: 'This is a description of your inputs only, not a verdict that the activity should continue.',
    mixed: 'Benefit and effort are close',
    mixedBody: 'Your current ratings do not give a strong signal in either direction. Time remains visible context, not a hidden coefficient in a score.',
    costHeavier: 'Reported effort clearly exceeds reported benefit',
    costHeavierBody: 'This is a review signal, not an instruction to stop; there may be meaning or obligations this comparison does not capture.',
    benefitMetric: 'Benefit',
    effortMetric: 'Effort',
    timeMetric: 'Time',
    evidence: 'Direct evidence',
    confidence: 'Confidence',
    confidenceLevels: {
      insufficient: 'Insufficient',
      possible: 'Possible',
      likely: 'Likely',
      known: 'Strong',
    },
    caveat: 'MIZAN does not create one scalar ROI number here because combining unlike scales would imply false precision. The result preserves your original ratings and time as inspectable context.',
    back: 'Back to settings',
  },
} as const;

function parseHours(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (normalized.length === 0) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 168 ? parsed : null;
}

function formatHours(minutes: number | null): string {
  if (minutes === null) return '—';
  const hours = Math.round((minutes / 60) * 10) / 10;
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export default function HumanROIScreen() {
  const { isRtl, locale } = useAppState();
  const labels = copy[locale];
  const [protectedMeaning, setProtectedMeaning] = useState(false);
  const [benefitRating, setBenefitRating] = useState<number | null>(null);
  const [effortRating, setEffortRating] = useState<number | null>(null);
  const [timeText, setTimeText] = useState('');
  const observedAt = useMemo(() => new Date().toISOString(), []);

  const assessment = useMemo(
    () =>
      assessExplicitHumanROI({
        benefitRating,
        effortRating,
        timeHoursPerWeek: parseHours(timeText),
        protectedMeaning,
        observedAt,
      }),
    [benefitRating, effortRating, observedAt, protectedMeaning, timeText],
  );

  const statusTitle =
    assessment.status === 'protected'
      ? labels.protectedTitle
      : assessment.status === 'benefit_heavier'
        ? labels.benefitHeavier
        : assessment.status === 'mixed'
          ? labels.mixed
          : assessment.status === 'cost_heavier'
            ? labels.costHeavier
            : labels.insufficient;

  const statusBody =
    assessment.status === 'protected'
      ? labels.protectedBody
      : assessment.reason === 'missing_benefit'
        ? labels.missingBenefit
        : assessment.reason === 'missing_effort'
          ? labels.missingEffort
          : assessment.reason === 'missing_time'
            ? labels.missingTime
            : assessment.status === 'benefit_heavier'
              ? labels.benefitHeavierBody
              : assessment.status === 'mixed'
                ? labels.mixedBody
                : labels.costHeavierBody;

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
      </View>

      <Card>
        <MizanText variant="title">{labels.mode}</MizanText>
        <View style={[styles.choiceRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <ChoiceChip label={labels.compare} selected={!protectedMeaning} onPress={() => setProtectedMeaning(false)} />
          <ChoiceChip label={labels.protect} selected={protectedMeaning} onPress={() => setProtectedMeaning(true)} />
        </View>
      </Card>

      {!protectedMeaning ? (
        <Card>
          <View style={styles.field}>
            <MizanText variant="label">{labels.benefit}</MizanText>
            <MizanText variant="caption" muted>{labels.benefitHint}</MizanText>
            <View style={[styles.choiceRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              {RATINGS.map((rating) => (
                <ChoiceChip
                  key={`benefit-${rating}`}
                  label={String(rating)}
                  selected={benefitRating === rating}
                  onPress={() => setBenefitRating(rating)}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <MizanText variant="label">{labels.effort}</MizanText>
            <MizanText variant="caption" muted>{labels.effortHint}</MizanText>
            <View style={[styles.choiceRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              {RATINGS.map((rating) => (
                <ChoiceChip
                  key={`effort-${rating}`}
                  label={String(rating)}
                  selected={effortRating === rating}
                  onPress={() => setEffortRating(rating)}
                />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <MizanText variant="label">{labels.time}</MizanText>
            <MizanTextInput
              accessibilityLabel={labels.time}
              keyboardType="decimal-pad"
              onChangeText={setTimeText}
              placeholder={labels.timePlaceholder}
              selectTextOnFocus
              value={timeText}
            />
            <MizanText variant="caption" muted>{labels.hoursPerWeek}</MizanText>
          </View>
        </Card>
      ) : null}

      <Card>
        <MizanText variant="label" muted>{labels.assessment}</MizanText>
        <MizanText variant="title">{statusTitle}</MizanText>
        <MizanText>{statusBody}</MizanText>

        {assessment.status !== 'protected' && assessment.status !== 'insufficient' ? (
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <MizanText variant="caption" muted>{labels.benefitMetric}</MizanText>
              <MizanText variant="title">{assessment.benefitRating ?? '—'} / 5</MizanText>
            </View>
            <View style={styles.metric}>
              <MizanText variant="caption" muted>{labels.effortMetric}</MizanText>
              <MizanText variant="title">{assessment.effortRating ?? '—'} / 5</MizanText>
            </View>
            <View style={styles.metric}>
              <MizanText variant="caption" muted>{labels.timeMetric}</MizanText>
              <MizanText variant="title">{formatHours(assessment.timeMinutesPerWeek)}</MizanText>
              <MizanText variant="caption" muted>{labels.hoursPerWeek}</MizanText>
            </View>
          </View>
        ) : null}

        <MizanText variant="caption" muted>
          {labels.confidence}: {labels.confidenceLevels[assessment.confidence.level]} · {labels.evidence}: {assessment.confidence.evidenceCount}
        </MizanText>
      </Card>

      <MizanText variant="caption" muted>{labels.caveat}</MizanText>
      <SecondaryButton compact label={labels.back} onPress={() => router.replace('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  field: { gap: Spacing.sm },
  choiceRow: { flexWrap: 'wrap', gap: Spacing.sm },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  metric: { flexGrow: 1, flexBasis: 140, minWidth: 120, gap: Spacing.xs },
});
