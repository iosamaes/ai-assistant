import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  loadInvisibleWins,
  saveInvisibleWin,
  type InvisibleWinCategory,
  type StoredInvisibleWin,
} from '@/application/reflections';
import {
  Card,
  ChoiceChip,
  MizanText,
  MizanTextInput,
  PrimaryButton,
  SecondaryButton,
} from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

const categories: InvisibleWinCategory[] = ['rest', 'boundary', 'family', 'repair', 'disconnect', 'health', 'other'];

const copy = {
  ar: {
    eyebrow: 'تأملاتك',
    title: 'المكاسب غير المرئية',
    body: 'سجّل شيئًا كان مهمًا لك حتى لو لم يكن إنجازًا إنتاجيًا. الراحة، قول لا، وقت العائلة، الاعتذار، الانفصال عن الشاشات، أو حماية صحتك كلها قد تكون مكاسب حقيقية.',
    privacy: 'هذه التأملات منفصلة عن درجات الإنتاجية ولا تمنح نقاطًا أو سلاسل استمرار.',
    prompt: 'ما الذي يستحق أن تتذكره اليوم؟',
    placeholder: 'مثال: أغلقت العمل مبكرًا وجلست مع عائلتي بدون هاتف.',
    save: 'حفظ التأمل',
    saving: 'جارٍ الحفظ…',
    saved: 'تم حفظ التأمل.',
    queued: 'تم حفظ التأمل على هذا الجهاز وسيتم مزامنته عند عودة الاتصال.',
    saveError: 'تعذر حفظ التأمل الآن. سيبقى النص هنا حتى تعيد المحاولة.',
    loading: 'جارٍ تحميل التأملات…',
    loadError: 'تعذر تحميل تأملاتك الآن.',
    recent: 'تأملات حديثة',
    empty: 'لا توجد تأملات بعد. لا يلزم تسجيل شيء إلا عندما يكون له معنى بالنسبة لك.',
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
    placeholder: 'Example: I stopped work early and spent phone-free time with my family.',
    save: 'Save reflection',
    saving: 'Saving…',
    saved: 'Reflection saved.',
    queued: 'Reflection saved on this device. MIZAN will sync it when connection returns.',
    saveError: 'MIZAN could not preserve this reflection yet. Your text will stay here so you can retry.',
    loading: 'Loading reflections…',
    loadError: 'MIZAN could not load your reflections right now.',
    recent: 'Recent reflections',
    empty: 'No reflections yet. You never need to log something unless it feels meaningful to you.',
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
  const [category, setCategory] = useState<InvisibleWinCategory>('rest');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<StoredInvisibleWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!userId) {
        if (!cancelled) setLoading(false);
        return;
      }
      const result = await loadInvisibleWins(userId);
      if (cancelled) return;
      if (result.ok) setItems(result.value);
      else setMessage(labels.loadError);
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [labels.loadError, userId]);

  const save = async () => {
    const trimmed = note.trim();
    if (!userId || !trimmed || saving) return;
    setSaving(true);
    setMessage(null);
    const result = await saveInvisibleWin(userId, { category, note: trimmed });
    if (result.ok) {
      setItems((current) => [result.value.item, ...current]);
      setNote('');
      setMessage(result.value.delivery === 'queued' ? labels.queued : labels.saved);
    } else {
      setMessage(labels.saveError);
    }
    setSaving(false);
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
        <MizanText variant="caption" muted>{labels.privacy}</MizanText>
      </View>

      <Card>
        <MizanText variant="title">{labels.prompt}</MizanText>
        <View style={[styles.chips, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {categories.map((item) => (
            <ChoiceChip
              key={item}
              label={labels.categories[item]}
              selected={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </View>
        <MizanTextInput
          accessibilityLabel={labels.prompt}
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
        {message ? <MizanText accessibilityLiveRegion="polite" muted>{message}</MizanText> : null}
      </Card>

      <View style={styles.section}>
        <MizanText variant="title">{labels.recent}</MizanText>
        {loading ? <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText> : null}
        {!loading && items.length === 0 ? (
          <MizanText accessibilityLiveRegion="polite" muted>{labels.empty}</MizanText>
        ) : null}
        {items.map((item) => (
          <Card key={item.id}>
            <MizanText variant="label">{labels.categories[item.category]}</MizanText>
            <MizanText>{item.note}</MizanText>
            <MizanText variant="caption" muted>
              {new Date(item.occurred_at).toLocaleDateString(locale === 'ar' ? 'ar-QA' : 'en-QA')}
            </MizanText>
          </Card>
        ))}
      </View>

      <SecondaryButton compact label={labels.back} onPress={() => router.replace('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md },
  section: { gap: Spacing.lg },
  chips: { flexWrap: 'wrap', gap: Spacing.sm },
  input: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
