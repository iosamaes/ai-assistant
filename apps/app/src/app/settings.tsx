import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { useSpiritualGroundingPreference } from '@/application/spiritual-grounding';
import { Card, ChoiceChip, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Spacing } from '@/constants/theme';
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

const settingsCopy = {
  ar: {
    heroTitle: 'اضبط ميزان على حياتك، لا العكس',
    heroBody: 'لغتك وأولوياتك ومساحاتك الاختيارية تحت تحكمك. أدوات الفهم والقرار مجمّعة هنا بهدوء بدل قائمة إعدادات تقنية طويلة.',
    preferencesTitle: 'تفضيلاتك الأساسية',
    preferencesBody: 'اختيارات تؤثر مباشرة في طريقة عرض ميزان وما تعتبره مهمًا الآن.',
    prioritiesEmpty: 'لم تُحدد أولويات بعد.',
    intelligenceTitle: 'أدوات الفهم والقرار',
    intelligenceBody: 'ادخل إلى الأدلة والأنماط والسيناريوهات وأدوات التعافي من مساحة واحدة.',
    dataTitle: 'البيانات والاتصالات',
    dataBody: 'راجع التكاملات الخارجية وتحكم في التصدير والحذف من طبقة واضحة منفصلة عن أدوات التحليل.',
    accountTitle: 'الحساب وإعادة الضبط',
    accountBody: 'يمكنك إعادة زيارة الإعداد الأولي أو تسجيل الخروج من دون تغيير بياناتك بصمت.',
  },
  en: {
    heroTitle: 'Shape MIZAN around your life',
    heroBody: 'Your language, priorities, and optional spaces stay under your control. Understanding and decision tools are grouped here instead of buried in a long technical settings list.',
    preferencesTitle: 'Core preferences',
    preferencesBody: 'Choices that directly shape how MIZAN presents itself and what matters to you right now.',
    prioritiesEmpty: 'No priorities selected yet.',
    intelligenceTitle: 'Understanding & decision tools',
    intelligenceBody: 'Reach evidence, patterns, scenarios, and recovery tools from one calm workspace.',
    dataTitle: 'Data & connections',
    dataBody: 'Review external integrations and control export or deletion from a clear layer separate from analysis tools.',
    accountTitle: 'Account & reset',
    accountBody: 'Revisit onboarding or sign out without silently changing your stored data.',
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
    integrationsTitle: 'التكاملات الخارجية',
    integrationsBody: 'راجع حالة أي مزود متصل وصلاحياته وآخر مزامنة، وأوقف الاتصال من مكان واحد بدون ربط الواجهة بمزود بعينه.',
    integrationsOpen: 'فتح التكاملات',
    privacyTitle: 'الخصوصية والبيانات',
    privacyBody: 'صدّر نسخة مقروءة من بياناتك أو احذف حساب ميزان وبياناته المملوكة للتطبيق بتحكم واضح ومباشر.',
    privacyOpen: 'فتح أدوات الخصوصية',
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
    integrationsTitle: 'External integrations',
    integrationsBody: 'Review connected-provider lifecycle, permissions, and last sync in one place, and disable a connection without coupling the UI to a vendor.',
    integrationsOpen: 'Open integrations',
    privacyTitle: 'Privacy & data',
    privacyBody: 'Export a readable copy of your data or delete your MIZAN account and app-owned data through explicit user controls.',
    privacyOpen: 'Open privacy controls',
  },
} as const;

interface SettingsLinkCardProps {
  title: string;
  body: string;
  action: string;
  onPress: () => void;
}

function SettingsLinkCard({ title, body, action, onPress }: SettingsLinkCardProps) {
  return (
    <Card style={styles.linkCard}>
      <View style={styles.linkCardCopy}>
        <MizanText variant="title">{title}</MizanText>
        <MizanText muted>{body}</MizanText>
      </View>
      <SecondaryButton compact label={action} onPress={onPress} />
    </Card>
  );
}

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
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const syncMessage = syncStatus === 'offline' ? t('syncOffline') : syncStatus === 'error' ? t('syncError') : null;
  const spiritualLabels = spiritualCopy[locale];
  const labels = settingsCopy[locale];
  const insightLabels = insightCopy[locale];
  const spiritualControlsDisabled = busy || spiritualStatus === 'loading' || spiritualStatus === 'saving';
  const priorities = enabledDomains.map((domainId) => t(domainId)).join(' · ');

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
      <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={styles.heading}>
          <MizanText variant="label" muted>{t('appName')}</MizanText>
          <MizanText variant="display">{t('settingsTitle')}</MizanText>
        </View>
        <SecondaryButton compact label={t('backToday')} onPress={() => router.replace('/today')} />
      </View>

      <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <MizanText variant="title">{labels.heroTitle}</MizanText>
        <MizanText>{t('settingsBody')}</MizanText>
        <MizanText variant="caption" muted>{labels.heroBody}</MizanText>
      </Card>

      <View style={styles.sectionHeading}>
        <MizanText variant="label" muted>{labels.preferencesTitle}</MizanText>
        <MizanText variant="title">{labels.preferencesBody}</MizanText>
      </View>

      <View style={[styles.cardGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <Card style={styles.preferenceCard}>
          <MizanText variant="label" muted>{t('language')}</MizanText>
          <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <ChoiceChip label={t('arabic')} selected={locale === 'ar'} onPress={() => setLocale('ar')} />
            <ChoiceChip label={t('english')} selected={locale === 'en'} onPress={() => setLocale('en')} />
          </View>
        </Card>

        <Card style={styles.preferenceCard}>
          <MizanText variant="label" muted>{t('priorities')}</MizanText>
          <MizanText variant="title">{priorities || labels.prioritiesEmpty}</MizanText>
        </Card>

        <Card style={styles.preferenceCard}>
          <View style={styles.linkCardCopy}>
            <MizanText variant="title">{spiritualLabels.title}</MizanText>
            <MizanText muted>{spiritualLabels.body}</MizanText>
          </View>
          <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <ChoiceChip
              label={spiritualLabels.enable}
              selected={spiritualGroundingEnabled === true}
              onPress={() => void changeSpiritualGrounding(true)}
              disabled={spiritualControlsDisabled}
            />
            <ChoiceChip
              label={spiritualLabels.disable}
              selected={spiritualGroundingEnabled === false}
              onPress={() => void changeSpiritualGrounding(false)}
              disabled={spiritualControlsDisabled}
            />
          </View>
        </Card>
      </View>

      <View style={styles.sectionHeading}>
        <MizanText variant="label" muted>{labels.intelligenceTitle}</MizanText>
        <MizanText variant="title">{labels.intelligenceBody}</MizanText>
      </View>

      <View style={[styles.cardGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <SettingsLinkCard title={insightLabels.lifeMapTitle} body={insightLabels.lifeMapBody} action={insightLabels.lifeMapOpen} onPress={() => router.push('/life-map')} />
        <SettingsLinkCard title={insightLabels.whyTitle} body={insightLabels.whyBody} action={insightLabels.whyOpen} onPress={() => router.push('/why')} />
        <SettingsLinkCard title={insightLabels.insightsTitle} body={insightLabels.insightsBody} action={insightLabels.insightsOpen} onPress={() => router.push('/insights')} />
        <SettingsLinkCard title={insightLabels.learningTitle} body={insightLabels.learningBody} action={insightLabels.learningOpen} onPress={() => router.push('/personal-learning')} />
        <SettingsLinkCard title={insightLabels.personalizationTitle} body={insightLabels.personalizationBody} action={insightLabels.personalizationOpen} onPress={() => router.push('/personalization')} />
        <SettingsLinkCard title={insightLabels.alignmentTitle} body={insightLabels.alignmentBody} action={insightLabels.alignmentOpen} onPress={() => router.push('/value-alignment')} />
        <SettingsLinkCard title={insightLabels.invisibleWinsTitle} body={insightLabels.invisibleWinsBody} action={insightLabels.invisibleWinsOpen} onPress={() => router.push('/invisible-wins')} />
        <SettingsLinkCard title={insightLabels.whatIfTitle} body={insightLabels.whatIfBody} action={insightLabels.whatIfOpen} onPress={() => router.push('/what-if')} />
        <SettingsLinkCard title={insightLabels.experimentsTitle} body={insightLabels.experimentsBody} action={insightLabels.experimentsOpen} onPress={() => router.push('/experiments')} />
        <SettingsLinkCard title={insightLabels.recoveryTitle} body={insightLabels.recoveryBody} action={insightLabels.recoveryOpen} onPress={() => router.push('/recovery')} />
        <SettingsLinkCard title={insightLabels.costOfYesTitle} body={insightLabels.costOfYesBody} action={insightLabels.costOfYesOpen} onPress={() => router.push('/cost-of-yes')} />
        <SettingsLinkCard title={insightLabels.humanROITitle} body={insightLabels.humanROIBody} action={insightLabels.humanROIOpen} onPress={() => router.push('/human-roi')} />
        <SettingsLinkCard title={insightLabels.lifeSeasonsTitle} body={insightLabels.lifeSeasonsBody} action={insightLabels.lifeSeasonsOpen} onPress={() => router.push('/life-seasons')} />
        <SettingsLinkCard title={insightLabels.capacityTitle} body={insightLabels.capacityBody} action={insightLabels.capacityOpen} onPress={() => router.push('/capacity')} />
      </View>

      <View style={styles.sectionHeading}>
        <MizanText variant="label" muted>{labels.dataTitle}</MizanText>
        <MizanText variant="title">{labels.dataBody}</MizanText>
      </View>

      <View style={[styles.cardGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <SettingsLinkCard title={insightLabels.integrationsTitle} body={insightLabels.integrationsBody} action={insightLabels.integrationsOpen} onPress={() => router.push('/integrations')} />
        <SettingsLinkCard title={insightLabels.privacyTitle} body={insightLabels.privacyBody} action={insightLabels.privacyOpen} onPress={() => router.push('/privacy')} />
      </View>

      {syncMessage || message ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          {syncMessage ? <MizanText accessibilityLiveRegion="polite">{syncMessage}</MizanText> : null}
          {message ? <MizanText accessibilityLiveRegion="polite">{message}</MizanText> : null}
        </Card>
      ) : null}

      <Card style={styles.accountCard}>
        <View style={styles.linkCardCopy}>
          <MizanText variant="label" muted>{labels.accountTitle}</MizanText>
          <MizanText variant="title">{labels.accountBody}</MizanText>
        </View>
        <View style={styles.accountActions}>
          <PrimaryButton label={busy ? t('saving') : t('resetOnboarding')} onPress={() => void editPriorities()} disabled={busy} />
          <SecondaryButton label={t('signOut')} onPress={() => void logout()} disabled={busy} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  heading: { flexGrow: 1, flexShrink: 1, minWidth: 0, gap: Spacing.xs },
  heroCard: { gap: Spacing.md },
  sectionHeading: { gap: Spacing.xs, paddingTop: Spacing.sm },
  cardGrid: {
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: Spacing.lg,
  },
  preferenceCard: { flexGrow: 1, flexBasis: 260, minWidth: 0 },
  linkCard: { flexGrow: 1, flexBasis: 300, minWidth: 0, justifyContent: 'space-between' },
  linkCardCopy: { gap: Spacing.sm },
  row: { flexWrap: 'wrap', gap: Spacing.sm },
  accountCard: { marginTop: Spacing.sm },
  accountActions: { gap: Spacing.md },
});