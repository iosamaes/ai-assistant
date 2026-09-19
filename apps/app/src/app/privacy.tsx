import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Platform, Share, StyleSheet, useColorScheme, View } from 'react-native';

import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { deleteMyAccount, exportMyData } from '@/infrastructure/supabase/privacy';
import { useAppState } from '@/state/app-state';

const privacyCopy = {
  ar: {
    eyebrow: 'الخصوصية',
    title: 'الخصوصية والبيانات',
    body: 'تحكّم في نسخة بياناتك أو احذف حساب ميزان وبياناته المملوكة للتطبيق من مكان واحد.',
    heroTitle: 'بياناتك تحت سيطرتك',
    heroBody: 'التصدير والحذف عمليتان واضحتان ومنفصلتان. لا يبدأ أي حذف من هذه الصفحة قبل تأكيدك الصريح.',
    exportEyebrow: 'نسخة محمولة',
    exportTitle: 'تصدير بياناتي',
    exportBody: 'ينشئ ميزان ملف JSON مقروءًا وقابلًا للنقل يضم بيانات حسابك التي يملكها التطبيق حاليًا.',
    exportNote: 'يتم إنشاء النسخة لحسابك الحالي فقط، ولا يغيّر التصدير أي بيانات محفوظة.',
    exportAction: 'إنشاء ملف JSON',
    exportWorking: 'جارٍ إعداد النسخة…',
    exportSuccess: 'تم إعداد نسخة بياناتك.',
    exportError: 'تعذر إعداد نسخة بياناتك الآن. حاول مرة أخرى لاحقًا.',
    deleteEyebrow: 'إجراء نهائي',
    deleteTitle: 'حذف الحساب',
    deleteBody: 'الحذف نهائي ويزيل حساب ميزان وجميع البيانات المملوكة للتطبيق المرتبطة به. لا يمكن التراجع بعد التأكيد.',
    deleteNote: 'فتح خطوة التأكيد لا يحذف شيئًا. يبدأ الحذف فقط بعد الضغط على زر الحذف النهائي.',
    deleteStart: 'بدء حذف الحساب',
    deleteConfirmTitle: 'تأكيد الحذف النهائي',
    deleteConfirmBody: 'سيُحذف حساب ميزان وبياناته المخزنة لدينا. أي بيانات أصلية يحتفظ بها مزود خارجي في حسابك لديه لا يديرها ميزان ولن يحذفها من ذلك المزود.',
    deleteConfirm: 'حذف نهائي',
    deleteWorking: 'جارٍ حذف الحساب…',
    deleteCancel: 'إلغاء',
    deleteError: 'تعذر حذف الحساب الآن. لم يتم تأكيد نجاح الحذف؛ حاول مرة أخرى لاحقًا.',
    cleanupWarningTitle: 'تم حذف الحساب — يلزم تنظيف محلي',
    cleanupWarningBody: 'تم تأكيد حذف حساب ميزان من الخادم، لكن تعذر التأكد من إزالة كل البيانات المؤقتة من هذا الجهاز أو المتصفح. قبل مشاركة الجهاز، امسح بيانات التطبيق أو بيانات الموقع المحلية.',
    backSettings: 'العودة للإعدادات',
  },
  en: {
    eyebrow: 'Privacy',
    title: 'Privacy & data',
    body: 'Export a copy of your data or delete your MIZAN account and app-owned data from one place.',
    heroTitle: 'Your data stays under your control',
    heroBody: 'Export and deletion are clear, separate actions. Nothing is deleted from this screen until you explicitly confirm it.',
    exportEyebrow: 'Portable copy',
    exportTitle: 'Export my data',
    exportBody: 'MIZAN creates a readable, portable JSON file containing the account data currently owned by the app.',
    exportNote: 'The copy is created only for your current account, and exporting does not change stored data.',
    exportAction: 'Create JSON file',
    exportWorking: 'Preparing your copy…',
    exportSuccess: 'Your data copy is ready.',
    exportError: 'Your data copy could not be prepared right now. Try again later.',
    deleteEyebrow: 'Permanent action',
    deleteTitle: 'Delete account',
    deleteBody: 'Deletion is permanent and removes your MIZAN account plus all app-owned data linked to it. It cannot be undone after confirmation.',
    deleteNote: 'Opening the confirmation step does not delete anything. Deletion begins only after you press the final delete button.',
    deleteStart: 'Start account deletion',
    deleteConfirmTitle: 'Confirm permanent deletion',
    deleteConfirmBody: 'Your MIZAN account and data stored by us will be deleted. Original data held by an external provider in your account with that provider is outside MIZAN and is not deleted from that provider.',
    deleteConfirm: 'Delete permanently',
    deleteWorking: 'Deleting account…',
    deleteCancel: 'Cancel',
    deleteError: 'The account could not be deleted right now. Deletion was not confirmed; try again later.',
    cleanupWarningTitle: 'Account deleted — local cleanup needed',
    cleanupWarningBody: 'Your MIZAN account was confirmed deleted on the server, but this device or browser could not confirm removal of every local cached item. Before sharing this device, clear the app or site local data.',
    backSettings: 'Back to Settings',
  },
} as const;

type BusyAction = 'export' | 'delete' | null;

async function deliverJsonExport(payload: Record<string, unknown>) {
  const json = JSON.stringify(payload, null, 2);
  const filename = `mizan-data-${new Date().toISOString().slice(0, 10)}.json`;

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return;
  }

  await Share.share({ message: json, title: filename });
}

function showLocalCleanupWarning(title: string, body: string) {
  if (Platform.OS === 'web' && typeof globalThis.alert === 'function') {
    globalThis.alert(`${title}\n\n${body}`);
    return;
  }
  Alert.alert(title, body);
}

export default function PrivacyScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const copy = privacyCopy[locale];
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const [busy, setBusy] = useState<BusyAction>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const activeUserRef = useRef(userId);
  activeUserRef.current = userId;

  const handleExport = async () => {
    if (busy || !userId) return;
    const targetUserId = userId;
    setBusy('export');
    setMessage(null);
    const result = await exportMyData(targetUserId);
    if (activeUserRef.current !== targetUserId) {
      setBusy(null);
      return;
    }
    if (!result.ok) {
      setMessage(copy.exportError);
      setBusy(null);
      return;
    }

    try {
      await deliverJsonExport(result.value);
      if (activeUserRef.current === targetUserId) setMessage(copy.exportSuccess);
    } catch {
      if (activeUserRef.current === targetUserId) setMessage(copy.exportError);
    }
    setBusy(null);
  };

  const handleDelete = async () => {
    if (busy || !userId) return;
    const targetUserId = userId;
    setBusy('delete');
    setMessage(null);
    const result = await deleteMyAccount(targetUserId);

    if (!result.ok) {
      if (activeUserRef.current !== targetUserId) {
        setBusy(null);
        return;
      }
      setMessage(copy.deleteError);
      setBusy(null);
      return;
    }

    // A null active user is expected after deleting/signing out the target.
    // A different non-null user means an account switch happened in flight;
    // never refresh or redirect that newly active account.
    if (activeUserRef.current && activeUserRef.current !== targetUserId) {
      setBusy(null);
      return;
    }

    if (!result.value.localDataCleared) {
      showLocalCleanupWarning(copy.cleanupWarningTitle, copy.cleanupWarningBody);
    }

    await refreshSession();
    setBusy(null);
    router.replace('/auth');
  };

  return (
    <Screen>
      <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={styles.heading}>
          <MizanText variant="label" muted>{copy.eyebrow}</MizanText>
          <MizanText variant="display">{copy.title}</MizanText>
        </View>
        <SecondaryButton
          compact
          label={copy.backSettings}
          onPress={() => router.replace('/settings')}
          disabled={busy !== null}
        />
      </View>

      <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <MizanText variant="title">{copy.heroTitle}</MizanText>
        <MizanText>{copy.body}</MizanText>
        <MizanText variant="caption" muted>{copy.heroBody}</MizanText>
      </Card>

      <View style={styles.actionGrid}>
        <Card style={styles.actionCard}>
          <View style={styles.cardCopy}>
            <MizanText variant="label" muted>{copy.exportEyebrow}</MizanText>
            <MizanText variant="title">{copy.exportTitle}</MizanText>
            <MizanText muted>{copy.exportBody}</MizanText>
          </View>
          <View style={[styles.notePanel, { backgroundColor: palette.surfaceMuted }]}>
            <MizanText variant="caption" muted>{copy.exportNote}</MizanText>
          </View>
          <PrimaryButton
            label={busy === 'export' ? copy.exportWorking : copy.exportAction}
            onPress={() => void handleExport()}
            disabled={busy !== null || !userId}
          />
        </Card>

        <Card style={[styles.actionCard, { borderColor: palette.danger }]}>
          <View style={styles.cardCopy}>
            <MizanText variant="label" style={{ color: palette.danger }}>{copy.deleteEyebrow}</MizanText>
            <MizanText variant="title">{copy.deleteTitle}</MizanText>
            <MizanText muted>{copy.deleteBody}</MizanText>
          </View>
          <View style={[styles.notePanel, { backgroundColor: palette.surfaceMuted }]}>
            <MizanText variant="caption" muted>{copy.deleteNote}</MizanText>
          </View>
          {!confirmingDelete ? (
            <SecondaryButton
              label={copy.deleteStart}
              onPress={() => {
                setMessage(null);
                setConfirmingDelete(true);
              }}
              disabled={busy !== null || !userId}
            />
          ) : (
            <View
              style={[styles.confirmation, { backgroundColor: palette.surfaceMuted, borderColor: palette.danger }]}
              accessibilityLiveRegion="polite">
              <MizanText variant="label" style={{ color: palette.danger }}>{copy.deleteConfirmTitle}</MizanText>
              <MizanText>{copy.deleteConfirmBody}</MizanText>
              <PrimaryButton
                label={busy === 'delete' ? copy.deleteWorking : copy.deleteConfirm}
                onPress={() => void handleDelete()}
                disabled={busy !== null || !userId}
              />
              <SecondaryButton
                label={copy.deleteCancel}
                onPress={() => setConfirmingDelete(false)}
                disabled={busy !== null}
              />
            </View>
          )}
        </Card>
      </View>

      {message ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite">{message}</MizanText>
        </Card>
      ) : null}
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: Spacing.lg,
  },
  actionCard: { flexGrow: 1, flexBasis: 320, minWidth: 0 },
  cardCopy: { gap: Spacing.sm },
  notePanel: { borderRadius: Radius.md, padding: Spacing.md },
  confirmation: {
    gap: Spacing.md,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
});
