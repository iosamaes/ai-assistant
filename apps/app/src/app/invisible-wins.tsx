import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadInvisibleWins,
  saveInvisibleWin,
  type InvisibleWinCategory,
  type StoredInvisibleWin,
} from '@/application/reflections';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import {
  Card,
  ChoiceChip,
  MizanText,
  MizanTextInput,
  PrimaryButton,
  SecondaryButton,
} from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

const categories: InvisibleWinCategory[] = ['rest', 'boundary', 'family', 'repair', 'disconnect', 'health', 'other'];
type HistoryFilter = 'all' | InvisibleWinCategory;

function categoryIcon(category: InvisibleWinCategory): AppIconName {
  if (category === 'rest') return 'recovery';
  if (category === 'boundary') return 'margin';
  if (category === 'family' || category === 'repair') return 'connection';
  if (category === 'disconnect') return 'mentalLoad';
  if (category === 'health') return 'energy';
  return 'hypothesis';
}

function formatReflectionDate(value: string, locale: 'ar' | 'en'): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '—';
  const date = new Date(timestamp);
  try {
    return date.toLocaleDateString(locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en-QA-u-nu-latn');
  } catch {
    return '—';
  }
}

const copy = {
  ar: {
    eyebrow: 'تأملاتك',
    title: 'المكاسب غير المرئية',
    body: 'سجّل شيئًا كان مهمًا لك حتى لو لم يكن إنجازًا إنتاجيًا. الراحة، قول لا، وقت العائلة، الاعتذار، الانفصال عن الشاشات، أو حماية صحتك كلها قد تكون مكاسب حقيقية.',
    privacy: 'هذه التأملات منفصلة عن درجات الإنتاجية ولا تمنح نقاطًا أو سلاسل استمرار.',
    prompt: 'ما الذي يستحق أن تتذكره اليوم؟',
    promptBody: 'اختر نوع اللحظة ثم اكتب ما يكفي لتتذكر لماذا كانت مهمة. لا تحتاج إلى تحويلها إلى هدف أو إنجاز.',
    capture: 'التقط لحظة مهمة',
    placeholder: 'مثال: أغلقت العمل مبكرًا وجلست مع عائلتي بدون هاتف.',
    save: 'حفظ التأمل',
    saving: 'جارٍ الحفظ…',
    saved: 'تم حفظ التأمل.',
    queued: 'تم حفظ التأمل على هذا الجهاز وسيتم مزامنته عند عودة الاتصال.',
    saveError: 'تعذر حفظ التأمل الآن. سيبقى النص هنا حتى تعيد المحاولة.',
    loading: 'جارٍ تحميل التأملات…',
    loadError: 'تعذر تحميل تأملاتك الآن.',
    recent: 'تأملات حديثة',
    recentBody: 'سجل شخصي هادئ لما اخترت أنت اعتباره مهمًا، بدون ترتيب أو نقاط.',
    filter: 'تصفية السجل',
    all: 'الكل',
    empty: 'لا توجد تأملات بعد. لا يلزم تسجيل شيء إلا عندما يكون له معنى بالنسبة لك.',
    emptyFiltered: 'لا توجد تأملات في هذه الفئة بعد. يمكنك تغيير الفلتر أو تسجيل لحظة جديدة عندما يكون لها معنى.',
    back: 'العودة إلى الإعدادات',
    categories: {
      rest: 'راحة',
      boundary: 'حدود صحية',
      family: 'عائلة',
      repair: 'إصلاح علاقة',
      disconnect: 'انفصال عن الشاشات',
      health: 'حماية الصحة',
      other: 'شيء آخر',
    },
  },
  en: {
    eyebrow: 'Your reflections',
    title: 'Invisible Wins',
    body: 'Record something that mattered even when it was not a productivity output. Resting, saying no, family time, apologizing, disconnecting, or protecting your health can all be real wins.',
    privacy: 'These reflections stay separate from productivity scoring and never create points or streaks.',
    prompt: 'What is worth remembering today?',
    promptBody: 'Choose the kind of moment, then write just enough to remember why it mattered. It never needs to become a goal or achievement.',
    capture: 'Capture a meaningful moment',
    placeholder: 'Example: I stopped work early and spent phone-free time with my family.',
    save: 'Save reflection',
    saving: 'Saving…',
    saved: 'Reflection saved.',
    queued: 'Reflection saved on this device. MIZAN will sync it when connection returns.',
    saveError: 'MIZAN could not preserve this reflection yet. Your text will stay here so you can retry.',
    loading: 'Loading reflections…',
    loadError: 'MIZAN could not load your reflections right now.',
    recent: 'Recent reflections',
    recentBody: 'A quiet personal record of what you chose to recognize, without ranking or points.',
    filter: 'Filter history',
    all: 'All',
    empty: 'No reflections yet. You never need to log something unless it feels meaningful to you.',
    emptyFiltered: 'There are no reflections in this category yet. Change the filter or capture a new moment when it feels meaningful.',
    back: 'Back to settings',
    categories: {
      rest: 'Rest',
      boundary: 'Healthy boundary',
      family: 'Family',
      repair: 'Relationship repair',
      disconnect: 'Disconnect',
      health: 'Protect health',
      other: 'Something else',
    },
  },
} as const;

export default function InvisibleWinsScreen() {
  const { isRtl, locale, userId } = useAppState();
  const labels = copy[locale];
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const activeUserRef = useRef(userId);
  const draftUserRef = useRef(userId);
  const [category, setCategory] = useState<InvisibleWinCategory>('rest');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<StoredInvisibleWin[]>([]);
  const [itemsOwnerId, setItemsOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (draftUserRef.current !== userId) {
    draftUserRef.current = userId;
    setCategory('rest');
    setHistoryFilter('all');
    setNote('');
    setLoadError(null);
    setSaving(false);
    setMessage(null);
  }
  activeUserRef.current = userId;

  const visibleItems = itemsOwnerId === userId ? items : [];
  const filteredItems = historyFilter === 'all'
    ? visibleItems
    : visibleItems.filter((item) => item.category === historyFilter);

  useEffect(() => {
    let cancelled = false;
    const requestedUserId = userId;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      setItems([]);
      setItemsOwnerId(null);
      setLoadError(null);
      setLoading(Boolean(requestedUserId));

      if (!requestedUserId) return;
      const result = await loadInvisibleWins(requestedUserId);
      if (cancelled || activeUserRef.current !== requestedUserId) return;
      if (result.ok) {
        setItems(result.value);
        setItemsOwnerId(requestedUserId);
        setLoadError(null);
      } else {
        setLoadError(labels.loadError);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [labels.loadError, userId]);

  const save = async () => {
    const trimmed = note.trim();
    const savingUserId = userId;
    if (!savingUserId || !trimmed || saving) return;
    setSaving(true);
    setMessage(null);
    const result = await saveInvisibleWin(savingUserId, { category, note: trimmed });
    if (activeUserRef.current !== savingUserId) return;
    if (result.ok) {
      setItems((current) => [result.value.item, ...(itemsOwnerId === savingUserId ? current : [])]);
      setItemsOwnerId(savingUserId);
      setNote('');
      setMessage(result.value.delivery === 'queued' ? labels.queued : labels.saved);
    } else {
      setMessage(labels.saveError);
    }
    setSaving(false);
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
          <View style={[styles.heroIcon, { backgroundColor: palette.surface }]}>
            <AppIcon name="evidence" color={palette.accent} size={25} />
          </View>
          <MizanText variant="title" style={styles.flexibleText}>{labels.title}</MizanText>
        </View>
        <MizanText>{labels.body}</MizanText>
        <MizanText variant="caption" muted>{labels.privacy}</MizanText>
      </Card>

      <Card style={[styles.composerCard, { borderColor: palette.accent }]}>
        <View style={[styles.iconTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.captureIcon, { backgroundColor: palette.accentSoft }]}>
            <AppIcon name={categoryIcon(category)} color={palette.accent} size={22} />
          </View>
          <View style={styles.flexibleText}>
            <MizanText variant="label" muted>{labels.capture}</MizanText>
            <MizanText variant="title">{labels.prompt}</MizanText>
          </View>
        </View>
        <MizanText muted>{labels.promptBody}</MizanText>
        <View style={[styles.chips, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {categories.map((item) => (
            <ChoiceChip
              key={item}
              label={labels.categories[item]}
              selected={category === item}
              onPress={() => setCategory(item)}
              disabled={saving}
            />
          ))}
        </View>
        <MizanTextInput
          accessibilityLabel={labels.prompt}
          editable={!saving}
          multiline
          maxLength={1000}
          placeholder={labels.placeholder}
          value={note}
          onChangeText={setNote}
          style={[styles.input, { writingDirection: isRtl ? 'rtl' : 'ltr' }]}
        />
        <PrimaryButton
          label={saving ? labels.saving : labels.save}
          onPress={() => void save()}
          disabled={saving || note.trim().length === 0 || !userId}
        />
        {message ? (
          <View style={[styles.messagePanel, { backgroundColor: palette.surfaceMuted }]}>
            <MizanText accessibilityLiveRegion="polite" muted>{message}</MizanText>
          </View>
        ) : null}
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MizanText variant="title">{labels.recent}</MizanText>
          <MizanText muted>{labels.recentBody}</MizanText>
        </View>

        {!loading && !loadError && visibleItems.length > 0 ? (
          <View style={styles.filterGroup}>
            <MizanText variant="label" muted>{labels.filter}</MizanText>
            <View style={[styles.chips, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <ChoiceChip label={labels.all} selected={historyFilter === 'all'} onPress={() => setHistoryFilter('all')} />
              {categories.map((item) => (
                <ChoiceChip
                  key={item}
                  label={labels.categories[item]}
                  selected={historyFilter === item}
                  onPress={() => setHistoryFilter(item)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {loading ? (
          <Card style={{ backgroundColor: palette.surfaceMuted }}>
            <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText>
          </Card>
        ) : null}
        {!loading && loadError ? (
          <Card style={{ backgroundColor: palette.surfaceMuted }}>
            <MizanText accessibilityLiveRegion="polite" muted>{loadError}</MizanText>
          </Card>
        ) : null}
        {!loading && !loadError && visibleItems.length === 0 ? (
          <Card style={{ backgroundColor: palette.surfaceMuted }}>
            <MizanText accessibilityLiveRegion="polite" muted>{labels.empty}</MizanText>
          </Card>
        ) : null}
        {!loading && !loadError && visibleItems.length > 0 && filteredItems.length === 0 ? (
          <Card style={{ backgroundColor: palette.surfaceMuted }}>
            <MizanText accessibilityLiveRegion="polite" muted>{labels.emptyFiltered}</MizanText>
          </Card>
        ) : null}
        <View style={[styles.reflectionGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {filteredItems.map((item) => (
            <Card key={item.id} style={[styles.reflectionCard, { borderColor: palette.border }]}> 
              <View style={[styles.reflectionHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.categoryIcon, { backgroundColor: palette.accentSoft }]}>
                  <AppIcon name={categoryIcon(item.category)} color={palette.accent} size={19} />
                </View>
                <View style={[styles.categoryPill, { backgroundColor: palette.accentSoft }]}>
                  <MizanText variant="caption">{labels.categories[item.category]}</MizanText>
                </View>
              </View>
              <MizanText>{item.note}</MizanText>
              <MizanText variant="caption" muted>{formatReflectionDate(item.occurred_at, locale)}</MizanText>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  flexibleText: { flex: 1, minWidth: 0 },
  heroCard: { gap: Spacing.md },
  iconTitleRow: { alignItems: 'center', gap: Spacing.md },
  heroIcon: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  captureIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  composerCard: { gap: Spacing.xl },
  section: { gap: Spacing.lg },
  sectionHeader: { gap: Spacing.sm },
  filterGroup: { gap: Spacing.sm },
  chips: { flexWrap: 'wrap', gap: Spacing.sm },
  input: { minHeight: 140, textAlignVertical: 'top' },
  messagePanel: { borderRadius: Radius.md, padding: Spacing.md },
  reflectionGrid: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  reflectionCard: { flexGrow: 1, flexShrink: 1, flexBasis: 320, gap: Spacing.md },
  reflectionHeader: { alignItems: 'center', gap: Spacing.sm },
  categoryIcon: { width: 34, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  categoryPill: { maxWidth: '100%', borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
});