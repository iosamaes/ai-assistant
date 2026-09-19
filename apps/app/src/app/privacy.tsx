import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Platform, Share, StyleSheet, View } from 'react-native';

import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { deleteMyAccount, exportMyData } from '@/infrastructure/supabase/privacy';
import { useAppState } from '@/state/app-state';

const privacyCopy = {
  ar: {
    title: 'الخصوصية والبيانات',
    body: 'تحكّم في نسخة بياناتك أو احذف حساب ميزان وبياناته المملوكة للتطبيق من مكان واحد.',
    exportTitle: 'تصدير بياناتي',
    exportBody: 'ينشئ ميزان ملف JSON مقروءًا وقابلًا للنقل يضم بيانات حسابك التي يملكها التطبيق حاليًا.',
    exportAction: 'إنشاء ملف JSON',
    exportWorking: 'جارٍ إعداد النسخة…',
    exportSuccess: 'تم إعداد نسخة بياناتك.',
    exportError: 'تعذر إعداد نسخة بياناتك الآن. حاول مرة أخرى لاحقًا.',
    deleteTitle: 'حذف الحساب',
    deleteBody: 'الحذف نهائي ويزيل حساب ميزان وجميع البيانات المملوكة للتطبيق المرتبطة به. لا يمكن التراجع بعد التأكيد.',
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
    title: 'Privacy & data',
    body: 'Export a copy of your data or delete your MIZAN account and app-owned data from one place.',
    exportTitle: 'Export my data',
    exportBody: 'MIZAN creates a readable, portable JSON file containing the account data currently owned by the app.',
    exportAction: 'Create JSON file',
    exportWorking: 'Preparing your copy…',
    exportSuccess: 'Your data copy is ready.',
    exportError: 'Your data copy could not be prepared right now. Try again later.',
    deleteTitle: 'Delete account',
    deleteBody: 'Deletion is permanent and removes your MIZAN account plus all app-owned data linked to it. It cannot be undone after confirmation.',
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
  const { locale, refreshSession, userId } = useAppState();
  const copy = privacyCopy[locale];
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
      <View style={styles.hero}>
        <MizanText variant="label" muted>{locale === 'ar' ? 'ميزان' : 'MIZAN'}</MizanText>
        <MizanText variant="display">{copy.title}</MizanText>
        <MizanText muted>{copy.body}</MizanText>
      </View>

      <Card style={styles.section}>
        <MizanText variant="title">{copy.exportTitle}</MizanText>
        <MizanText muted>{copy.exportBody}</MizanText>
        <PrimaryButton
          label={busy === 'export' ? copy.exportWorking : copy.exportAction}
          onPress={() => void handleExport()}
          disabled={busy !== null || !userId}
        />
      </Card>

      <Card style={styles.section}>
        <MizanText variant="title">{copy.deleteTitle}</MizanText>
        <MizanText muted>{copy.deleteBody}</MizanText>
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
          <View style={styles.confirmation} accessibilityLiveRegion="polite">
            <MizanText variant="label">{copy.deleteConfirmTitle}</MizanText>
            <MizanText muted>{copy.deleteConfirmBody}</MizanText>
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

      {message ? <MizanText accessibilityLiveRegion="polite" muted>{message}</MizanText> : null}

      <SecondaryButton
        compact
        label={copy.backSettings}
        onPress={() => router.replace('/settings')}
        disabled={busy !== null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  section: { gap: Spacing.md },
  confirmation: { gap: Spacing.md },
});
