import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { assessExplicitCostOfYes } from '@/application/cost-of-yes';
import { Card, MizanText, MizanTextInput, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

const copy = {
  ar: {
    eyebrow: 'أداة قرار',
    title: 'تكلفة قول نعم',
    body: 'قارن الوقت الأسبوعي الذي يحتاجه الالتزام بهامش الوقت الذي تعرف أنك تملكه. إذا كانت بيانات الوقت ناقصة فلن يخمّن ميزان ما الذي سيتزاحم.',
    commitmentLabel: 'وقت الالتزام المتوقع أسبوعيًا',
    commitmentPlaceholder: 'مثال: 4',
    marginLabel: 'هامش الوقت المتاح الذي تعرفه أسبوعيًا',
    marginPlaceholder: 'مثال: 7',
    hoursPerWeek: 'ساعة / أسبوع',
    contextNote: 'استخدم فقط تقديرًا تعرفه فعلًا. ربط التقويم أو مصادر الوقت مستقبلًا يمكنه توفير سياق أدق، لكن هذه الأداة لا تفترضه الآن.',
    assessment: 'القراءة الحالية',
    insufficient: 'الأدلة غير كافية',
    missingCommitment: 'أدخل الوقت المتوقع للالتزام حتى يمكن إجراء المقارنة.',
    missingMargin: 'لا نعرف هامش وقتك المتاح. أدخل تقديرًا تعرفه، وإلا سيظل الأثر غير معروف بدل اختراع وقت مزاح.',
    manageable: 'داخل الهامش المعروف',
    manageableBody: 'الالتزام يستخدم نصف الهامش المعروف أو أقل وفق الأرقام التي أدخلتها.',
    tight: 'الهامش سيصبح ضيقًا',
    tightBody: 'الالتزام يستخدم أكثر من نصف هامشك المعروف، لكنه لا يتجاوزه وفق الأرقام الحالية.',
    displacing: 'يتجاوز الهامش المعروف',
    displacingBody: 'الوقت المطلوب أكبر من الهامش الذي أدخلته. هذا يعني أن بعض الوقت لا بد أن يأتي من مكان آخر، لكن ميزان لا يدّعي معرفة أي نشاط سيتأثر بدون بيانات إضافية.',
    commitment: 'وقت الالتزام',
    knownMargin: 'الهامش المعروف',
    remaining: 'الهامش المتبقي',
    displaced: 'الحد الأدنى للوقت المزاح',
    marginUsed: 'من الهامش المستخدم',
    evidence: 'أدلة مباشرة',
    confidence: 'الثقة',
    confidenceLevels: {
      insufficient: 'غير كافية',
      possible: 'ممكنة',
      likely: 'مرجحة',
      known: 'قوية',
    },
    caveat: 'هذه مقارنة تخطيطية وليست تنبؤًا. لا تحدد تلقائيًا ما الذي يجب التضحية به، ولا تحول العلاقات أو العبادة أو الراحة إلى موارد يجب تحسينها قسرًا.',
    back: 'العودة للإعدادات',
  },
  en: {
    eyebrow: 'Decision tool',
    title: 'Cost of Yes',
    body: 'Compare the weekly time a commitment needs with time margin you actually know you have. When time context is missing, MIZAN will not guess what gets displaced.',
    commitmentLabel: 'Expected commitment time each week',
    commitmentPlaceholder: 'Example: 4',
    marginLabel: 'Available time margin you know you have each week',
    marginPlaceholder: 'Example: 7',
    hoursPerWeek: 'hours / week',
    contextNote: 'Use only a margin estimate you genuinely know. A future calendar or time source can provide stronger context, but this tool does not assume one now.',
    assessment: 'Current assessment',
    insufficient: 'Insufficient evidence',
    missingCommitment: 'Enter the expected commitment time before MIZAN can compare it with your margin.',
    missingMargin: 'Your available time margin is unknown. Enter an estimate you actually know, otherwise displacement stays unknown instead of being invented.',
    manageable: 'Within known margin',
    manageableBody: 'The commitment uses half or less of the time margin you provided.',
    tight: 'Margin becomes tight',
    tightBody: 'The commitment uses more than half of your known margin, but does not exceed it with the current inputs.',
    displacing: 'Exceeds known margin',
    displacingBody: 'The required time is greater than the margin you provided. Some time must come from elsewhere, but MIZAN does not claim which activity would be affected without more context.',
    commitment: 'Commitment time',
    knownMargin: 'Known margin',
    remaining: 'Remaining margin',
    displaced: 'Minimum displaced time',
    marginUsed: 'of margin used',
    evidence: 'Direct evidence',
    confidence: 'Confidence',
    confidenceLevels: {
      insufficient: 'Insufficient',
      possible: 'Possible',
      likely: 'Likely',
      known: 'Strong',
    },
    caveat: 'This is a planning comparison, not a forecast. It does not decide what you should sacrifice and never treats relationships, worship, or rest as resources that must be optimized.',
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

export default function CostOfYesScreen() {
  const { locale } = useAppState();
  const labels = copy[locale];
  const [commitmentText, setCommitmentText] = useState('');
  const [marginText, setMarginText] = useState('');
  const observedAt = useMemo(() => new Date().toISOString(), []);

  const assessment = useMemo(
    () =>
      assessExplicitCostOfYes({
        commitmentHoursPerWeek: parseHours(commitmentText),
        availableMarginHoursPerWeek: parseHours(marginText),
        observedAt,
      }),
    [commitmentText, marginText, observedAt],
  );

  const statusTitle =
    assessment.status === 'manageable'
      ? labels.manageable
      : assessment.status === 'tight'
        ? labels.tight
        : assessment.status === 'displacing'
          ? labels.displacing
          : labels.insufficient;

  const statusBody =
    assessment.reason === 'missing_commitment'
      ? labels.missingCommitment
      : assessment.reason === 'missing_margin'
        ? labels.missingMargin
        : assessment.status === 'manageable'
          ? labels.manageableBody
          : assessment.status === 'tight'
            ? labels.tightBody
            : labels.displacingBody;

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
      </View>

      <Card>
        <View style={styles.field}>
          <MizanText variant="label">{labels.commitmentLabel}</MizanText>
          <MizanTextInput
            accessibilityLabel={labels.commitmentLabel}
            keyboardType="decimal-pad"
            onChangeText={setCommitmentText}
            placeholder={labels.commitmentPlaceholder}
            selectTextOnFocus
            value={commitmentText}
          />
          <MizanText variant="caption" muted>{labels.hoursPerWeek}</MizanText>
        </View>

        <View style={styles.field}>
          <MizanText variant="label">{labels.marginLabel}</MizanText>
          <MizanTextInput
            accessibilityLabel={labels.marginLabel}
            keyboardType="decimal-pad"
            onChangeText={setMarginText}
            placeholder={labels.marginPlaceholder}
            selectTextOnFocus
            value={marginText}
          />
          <MizanText variant="caption" muted>{labels.hoursPerWeek}</MizanText>
        </View>

        <MizanText variant="caption" muted>{labels.contextNote}</MizanText>
      </Card>

      <Card>
        <MizanText variant="label" muted>{labels.assessment}</MizanText>
        <MizanText variant="title">{statusTitle}</MizanText>
        <MizanText>{statusBody}</MizanText>

        {assessment.status !== 'insufficient' ? (
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <MizanText variant="caption" muted>{labels.commitment}</MizanText>
              <MizanText variant="title">{formatHours(assessment.commitmentMinutesPerWeek)}</MizanText>
              <MizanText variant="caption" muted>{labels.hoursPerWeek}</MizanText>
            </View>
            <View style={styles.metric}>
              <MizanText variant="caption" muted>{labels.knownMargin}</MizanText>
              <MizanText variant="title">{formatHours(assessment.availableMarginMinutesPerWeek)}</MizanText>
              <MizanText variant="caption" muted>{labels.hoursPerWeek}</MizanText>
            </View>
            <View style={styles.metric}>
              <MizanText variant="caption" muted>{labels.remaining}</MizanText>
              <MizanText variant="title">{formatHours(assessment.remainingMarginMinutesPerWeek)}</MizanText>
              <MizanText variant="caption" muted>{labels.hoursPerWeek}</MizanText>
            </View>
            {assessment.displacedMinutesPerWeek !== null && assessment.displacedMinutesPerWeek > 0 ? (
              <View style={styles.metric}>
                <MizanText variant="caption" muted>{labels.displaced}</MizanText>
                <MizanText variant="title">{formatHours(assessment.displacedMinutesPerWeek)}</MizanText>
                <MizanText variant="caption" muted>{labels.hoursPerWeek}</MizanText>
              </View>
            ) : null}
          </View>
        ) : null}

        {assessment.marginUsedPercent !== null ? (
          <MizanText variant="label">
            {assessment.marginUsedPercent}% {labels.marginUsed}
          </MizanText>
        ) : null}
        <MizanText variant="caption" muted>
          {labels.confidence}: {labels.confidenceLevels[assessment.confidence.level]} · {labels.evidence}: {assessment.confidence.evidenceCount}
        </MizanText>
      </Card>

      <MizanText variant="caption" muted>{labels.caveat}</MizanText>
      <SecondaryButton label={labels.back} onPress={() => router.replace('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  field: { gap: Spacing.sm },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  metric: { flexGrow: 1, flexBasis: 140, minWidth: 120, gap: Spacing.xs },
});
