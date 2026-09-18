import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSpiritualGroundingPreference } from '@/application/spiritual-grounding';
import { ChoiceChip, MizanText, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { signOut } from '@/infrastructure/supabase/auth';
import { useAppState } from '@/state/app-state';

const spiritualCopy = {
  ar: {
    title: 'السكينة والمعنى',
    body: 'مساحة اختيارية بالكامل. يمكنك تفعيلها أو إيقافها في أي وقت، ولا ينتج عنها أي تقييم للإيمان أو القيمة.',
    enable: 'مفعّلة',
    disable: 'متوقفة',
    error: 'تعذر حفظ هذا الاختيار الآن.',
  },
  en: {
    title: 'Spiritual Grounding',
    body: 'Entirely optional. You can enable or remove it at any time, and it never produces a faith or worth score.',
    enable: 'Enabled',
    disable: 'Off',
    error: 'MIZAN could not save this preference right now.',
  },
} as const;

const insightCopy = {
  ar: {
    lifeMapTitle: 'خريطة الحياة',
    lifeMapBody: 'راجع تاريخ المجالات والأدلة المتاحة بدون تحويل البيانات الناقصة إلى درجات.',
    lifeMapOpen: 'فتح خريطة الحياة',
    whyTitle: 'لماذا قد أشعر أنني لست على ما يرام؟',
    whyBody: 'راجع العوامل المحتملة المدعومة بأدلتك الحالية مع توضيح الثقة، من دون ادعاء السببية أو التشخيص.',
    whyOpen: 'فتح WHY',
    insightsTitle: 'الرؤى والأنماط',
    insightsBody: 'راجع الارتباطات الشخصية التي تكررت في ملاحظاتك المقترنة، مع عدد العينات والثقة ونافذة الأدلة.',
    insightsOpen: 'فتح الرؤى',
    learningTitle: 'التعلّم الشخصي',
    learningBody: 'راجع كيف تتغير تقديرات فائدة الخطوات من تقييمات الأثر التي سجلتها أنت، مع عدد العينات وحداثتها والثقة.',
    learningOpen: 'فتح سجل التعلّم',
    personalizationTitle: 'نضج التخصيص',
    personalizationBody: 'اعرف هل ميزان ما زال في بداية التعلّم، أم يتعلّم نمطك، أم يملك أدلة كافية لتخصيص أكثر نضجًا.',
    personalizationOpen: 'عرض حالة التخصيص',
    alignmentTitle: 'القيم والهوية',
    alignmentBody: 'راجع فقط الأدلة المرتبطة بالقيم التي اخترتها أنت، مع إبقاء القيم التي لا تملك إشارة مباشرة في حالة غير معروفة.',
    alignmentOpen: 'عرض محاذاة القيم',
    invisibleWinsTitle: 'المكاسب غير المرئية',
    invisibleWinsBody: 'سجّل لحظات مهمة مثل الراحة أو قول لا أو وقت العائلة بدون تحويلها إلى نقاط أو درجات إنتاجية.',
    invisibleWinsOpen: 'فتح التأملات',
    whatIfTitle: 'ماذا لو؟',
    whatIfBody: 'استكشف قرارات صغيرة قابلة للعكس كنطاقات احتمالية واضحة الافتراضات، من دون تقديمها كتنبؤات مؤكدة.',
    whatIfOpen: 'فتح ماذا لو؟',
    experimentsTitle: 'التجارب الشخصية',
    experimentsBody: 'اختبر فرضية صغيرة طوعًا ولمدة محددة، ثم سجّل أثرها وراجع مقارنة شخصية تحفظ حدود الأدلة.',
    experimentsOpen: 'فتح التجارب',
    recoveryTitle: 'أنقذ يومي',
    recoveryBody: 'ادخل وضع استعادة منخفض الحمل يعتمد فقط على إشارات حالتك المدعومة بالأدلة، مع إمكانية التخطي أو التوقف بلا عقوبة.',
    recoveryOpen: 'فتح وضع الاستعادة',
    costOfYesTitle: 'تكلفة قول نعم',
    costOfYesBody: 'قارن وقت التزام جديد بهامش الوقت الذي تعرف أنك تملكه، من دون اختراع جدول أو ادعاء معرفة ما الذي سيتزاحم.',
    costOfYesOpen: 'فتح تكلفة قول نعم',
    humanROITitle: 'العائد الإنساني',
    humanROIBody: 'راجع الفائدة والجهد والوقت الذين تصفهم أنت، أو اترك ما تعتبره مقدسًا أو غير قابل للتحسين خارج المقارنة تمامًا.',
    humanROIOpen: 'فتح العائد الإنساني',
    lifeSeasonsTitle: 'مواسم الحياة',
    lifeSeasonsBody: 'غيّر الموسم وأهدافه المستدامة، وراجع سجل المواسم السابقة بحيث يُحسب التوازن مقابل ما اخترته لهذه المرحلة.',
    lifeSeasonsOpen: 'فتح مواسم الحياة',
    capacityTitle: 'الهامش وديون الحياة',
    capacityBody: 'راجع هامش السعة والهشاشة والاحتياج المتراكم واتجاه التعافي فقط عندما توجد أدلة كافية، بدون أي حكم على الأداء أو القيمة.',
    capacityOpen: 'فتح قراءة السعة',
  },
  en: {
    lifeMapTitle: 'Life map',
    lifeMapBody: 'Review domain history and available evidence without turning missing data into scores.',
    lifeMapOpen: 'Open Life map',
    whyTitle: 'Why might I feel off?',
    whyBody: 'Review candidate factors supported by your current evidence with confidence, without causal or diagnostic claims.',
    whyOpen: 'Open WHY',
    insightsTitle: 'Insights and patterns',
    insightsBody: 'Review recurring personal associations from paired observations with sample count, confidence, and evidence window.',
    insightsOpen: 'Open insights',
    learningTitle: 'Personal learning',
    learningBody: 'Inspect how action-usefulness estimates change from outcome ratings you explicitly recorded, with sample count, recency, and confidence.',
    learningOpen: 'Open learning history',
    personalizationTitle: 'Personalization maturity',
    personalizationBody: 'See whether MIZAN is just starting, learning your pattern, or has enough evidence for more mature personalization.',
    personalizationOpen: 'View personalization status',
    alignmentTitle: 'Values & identity',
    alignmentBody: 'Review only evidence linked to values you selected, while values without a direct signal remain explicitly unknown.',
    alignmentOpen: 'View value alignment',
    invisibleWinsTitle: 'Invisible Wins',
    invisibleWinsBody: 'Record meaningful moments such as rest, saying no, or family time without turning them into points or productivity scores.',
    invisibleWinsOpen: 'Open reflections',
    whatIfTitle: 'What If',
    whatIfBody: 'Explore small reversible choices as explicit assumption-based ranges without presenting them as guaranteed forecasts.',
    whatIfOpen: 'Open What If',
    experimentsTitle: 'Personal experiments',
    experimentsBody: 'Voluntarily test one small time-bounded hypothesis, record its impact, and review a personal comparison with explicit evidence limits.',
    experimentsOpen: 'Open experiments',
    recoveryTitle: 'Save My Day',
    recoveryBody: 'Enter a low-load recovery mode based only on supported current-state signals, with skipping and stopping carrying no penalty.',
    recoveryOpen: 'Open recovery mode',
    costOfYesTitle: 'Cost of Yes',
    costOfYesBody: 'Compare a new commitment with time margin you actually know you have, without inventing a schedule or claiming what gets displaced.',
    costOfYesOpen: 'Open Cost of Yes',
    humanROITitle: 'Human ROI',
    humanROIBody: 'Review benefit, effort, and time you explicitly describe, or keep anything you consider sacred or unsuitable for optimization completely outside comparison.',
    humanROIOpen: 'Open Human ROI',
    lifeSeasonsTitle: 'Life Seasons',
    lifeSeasonsBody: 'Change a season and its sustainable targets, then review prior seasons so Balance is measured against what you chose for this phase.',
    lifeSeasonsOpen: 'Open Life Seasons',
    capacityTitle: 'Life Buffer & Life Debt',
    capacityBody: 'Review spare capacity, fragility, accumulated need, and recovery direction only when evidence supports them, without judging performance or worth.',
    capacityOpen: 'Open capacity view',
  },
} as const;

export default function SettingsScreen() {
  const {
    enabledDomains,
    isRtl,
    locale,
    refreshSession,
    resetOnboarding,
    setLocale,
    syncStatus,
    t,
    userId,
  } = useAppState();
  const {
    choice: spiritualGroundingEnabled,
    persistChoice: persistSpiritualGroundingChoice,
    status: spiritualStatus,
  } = useSpiritualGroundingPreference(userId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const syncMessage = syncStatus === 'offline' ? t('syncOffline') : syncStatus === 'error' ? t('syncError') : null;
  const spiritualLabels = spiritualCopy[locale];
  const insightLabels = insightCopy[locale];

  const editPriorities = async () => {
    if (busy) return;
    setBusy(true);
    await resetOnboarding();
    setBusy(false);
    router.replace('/onboarding');
  };

  const changeSpiritualGrounding = async (next: boolean) => {
    if (busy || spiritualStatus === 'loading' || spiritualStatus === 'saving') return;
    setMessage(null);
    const saved = await persistSpiritualGroundingChoice(next);
    if (!saved) setMessage(spiritualLabels.error);
  };

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const result = await signOut();
    if (!result.ok) {
      setMessage(t('authErrorGeneric'));
      setBusy(false);
      return;
    }
    await refreshSession();
    setBusy(false);
    router.replace('/auth');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{t('appName')}</MizanText>
        <MizanText variant="display">{t('settingsTitle')}</MizanText>
        <MizanText muted>{t('settingsBody')}</MizanText>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{t('language')}</MizanText>
        <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <ChoiceChip label={t('arabic')} selected={locale === 'ar'} onPress={() => setLocale('ar')} />
          <ChoiceChip label={t('english')} selected={locale === 'en'} onPress={() => setLocale('en')} />
        </View>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{t('priorities')}</MizanText>
        <MizanText muted>{enabledDomains.map((domainId) => t(domainId)).join(' · ')}</MizanText>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.lifeMapTitle}</MizanText>
        <MizanText muted>{insightLabels.lifeMapBody}</MizanText>
        <PrimaryButton label={insightLabels.lifeMapOpen} onPress={() => router.push('/life-map')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.whyTitle}</MizanText>
        <MizanText muted>{insightLabels.whyBody}</MizanText>
        <PrimaryButton label={insightLabels.whyOpen} onPress={() => router.push('/why')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.insightsTitle}</MizanText>
        <MizanText muted>{insightLabels.insightsBody}</MizanText>
        <PrimaryButton label={insightLabels.insightsOpen} onPress={() => router.push('/insights')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.learningTitle}</MizanText>
        <MizanText muted>{insightLabels.learningBody}</MizanText>
        <PrimaryButton label={insightLabels.learningOpen} onPress={() => router.push('/personal-learning')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.personalizationTitle}</MizanText>
        <MizanText muted>{insightLabels.personalizationBody}</MizanText>
        <PrimaryButton label={insightLabels.personalizationOpen} onPress={() => router.push('/personalization')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.alignmentTitle}</MizanText>
        <MizanText muted>{insightLabels.alignmentBody}</MizanText>
        <PrimaryButton label={insightLabels.alignmentOpen} onPress={() => router.push('/value-alignment')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.invisibleWinsTitle}</MizanText>
        <MizanText muted>{insightLabels.invisibleWinsBody}</MizanText>
        <PrimaryButton label={insightLabels.invisibleWinsOpen} onPress={() => router.push('/invisible-wins')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.whatIfTitle}</MizanText>
        <MizanText muted>{insightLabels.whatIfBody}</MizanText>
        <PrimaryButton label={insightLabels.whatIfOpen} onPress={() => router.push('/what-if')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.experimentsTitle}</MizanText>
        <MizanText muted>{insightLabels.experimentsBody}</MizanText>
        <PrimaryButton label={insightLabels.experimentsOpen} onPress={() => router.push('/experiments')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.recoveryTitle}</MizanText>
        <MizanText muted>{insightLabels.recoveryBody}</MizanText>
        <PrimaryButton label={insightLabels.recoveryOpen} onPress={() => router.push('/recovery')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.costOfYesTitle}</MizanText>
        <MizanText muted>{insightLabels.costOfYesBody}</MizanText>
        <PrimaryButton label={insightLabels.costOfYesOpen} onPress={() => router.push('/cost-of-yes')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.humanROITitle}</MizanText>
        <MizanText muted>{insightLabels.humanROIBody}</MizanText>
        <PrimaryButton label={insightLabels.humanROIOpen} onPress={() => router.push('/human-roi')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.lifeSeasonsTitle}</MizanText>
        <MizanText muted>{insightLabels.lifeSeasonsBody}</MizanText>
        <PrimaryButton label={insightLabels.lifeSeasonsOpen} onPress={() => router.push('/life-seasons')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.capacityTitle}</MizanText>
        <MizanText muted>{insightLabels.capacityBody}</MizanText>
        <PrimaryButton label={insightLabels.capacityOpen} onPress={() => router.push('/capacity')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{spiritualLabels.title}</MizanText>
        <MizanText muted>{spiritualLabels.body}</MizanText>
        <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <ChoiceChip
            label={spiritualLabels.enable}
            selected={spiritualGroundingEnabled === true}
            onPress={() => void changeSpiritualGrounding(true)}
          />
          <ChoiceChip
            label={spiritualLabels.disable}
            selected={spiritualGroundingEnabled === false}
            onPress={() => void changeSpiritualGrounding(false)}
          />
        </View>
      </View>

      {syncMessage ? <MizanText muted>{syncMessage}</MizanText> : null}
      {message ? <MizanText muted>{message}</MizanText> : null}

      <View style={styles.actions}>
        <PrimaryButton label={busy ? t('saving') : t('resetOnboarding')} onPress={() => void editPriorities()} disabled={busy} />
        <PrimaryButton label={t('signOut')} onPress={() => void logout()} disabled={busy} />
        <MizanText
          variant="label"
          style={styles.backLink}
          onPress={() => router.replace('/today')}>
          {t('backToday')}
        </MizanText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  section: { gap: Spacing.lg },
  row: { flexWrap: 'wrap', gap: Spacing.sm },
  actions: { marginTop: 'auto', gap: Spacing.lg, paddingTop: Spacing.xl },
  backLink: { textAlign: 'center', paddingVertical: Spacing.md },
});