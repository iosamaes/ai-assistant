import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  disableIntegrationConnection,
  loadIntegrationSettings,
} from '@/application/integrations';
import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import type { StoredIntegrationConnection } from '@/infrastructure/supabase/integrations';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const copy = {
  ar: {
    eyebrow: 'التكاملات',
    title: 'المصادر الخارجية',
    body: 'يعرض ميزان هنا فقط التكاملات التي تم ربطها فعليًا. غياب أي مزود لا يمنع المحرك الأساسي من العمل، ولا يتم تخزين مفاتيح أو أسرار المزود في هذه الحالة.',
    loading: 'جارٍ تحميل التكاملات…',
    loadError: 'تعذر تحميل حالة التكاملات الآن.',
    emptyTitle: 'لا توجد تكاملات متصلة',
    emptyBody: 'لا يوجد مزود خارجي مفعّل لهذا الحساب حاليًا. سيظل ميزان يعمل بالبيانات المباشرة التي تختار تسجيلها.',
    provider: 'المزود',
    capability: 'القدرة',
    status: 'الحالة',
    scopes: 'الصلاحيات',
    lastSync: 'آخر مزامنة',
    consent: 'الموافقة',
    disconnect: 'إيقاف هذا التكامل',
    disconnecting: 'جارٍ الإيقاف…',
    disconnectError: 'تعذر إيقاف التكامل الآن.',
    configured: 'مُعد',
    connected: 'متصل',
    disabled: 'متوقف',
    error: 'خطأ',
    never: 'لا يوجد',
    capabilityLabels: {
      health_data: 'بيانات الصحة والساعات',
      time_context: 'سياق الوقت والتقويم',
      location_context: 'سياق الموقع التقريبي',
    },
    privacy: 'عند إيقاف التكامل تتوقف حالة الاتصال المستقبلية من داخل ميزان. حذف البيانات المستوردة وضوابط التصدير/الحذف الشاملة تُراجع ضمن طبقة الخصوصية الخاصة بالحساب.',
    back: 'العودة للإعدادات',
  },
  en: {
    eyebrow: 'Integrations',
    title: 'External sources',
    body: 'MIZAN shows only integrations that were actually connected. The deterministic core keeps working without any provider, and provider secrets are never stored in this lifecycle state.',
    loading: 'Loading integrations…',
    loadError: 'Integration state could not be loaded right now.',
    emptyTitle: 'No integrations connected',
    emptyBody: 'No external provider is enabled for this account. MIZAN continues to work from the direct evidence you choose to record.',
    provider: 'Provider',
    capability: 'Capability',
    status: 'Status',
    scopes: 'Permissions',
    lastSync: 'Last sync',
    consent: 'Consent',
    disconnect: 'Disable this integration',
    disconnecting: 'Disabling…',
    disconnectError: 'The integration could not be disabled right now.',
    configured: 'Configured',
    connected: 'Connected',
    disabled: 'Disabled',
    error: 'Error',
    never: 'None',
    capabilityLabels: {
      health_data: 'Health & wearable data',
      time_context: 'Time & calendar context',
      location_context: 'Approximate location context',
    },
    privacy: 'Disabling an integration stops its connected lifecycle state inside MIZAN. Imported-data deletion and full export/delete controls are handled by the account privacy layer.',
    back: 'Back to settings',
  },
} as const;

const providerLabels: Record<'ar' | 'en', Record<string, string>> = {
  ar: {
    'unavailable-time-context': 'سياق الوقت غير مهيأ',
    'deterministic-time-primary': 'سياق وقت تجريبي — أساسي',
    'deterministic-time-alternate': 'سياق وقت تجريبي — بديل',
    'deterministic-time-context': 'سياق وقت تجريبي',
    'unavailable-health-data': 'بيانات الصحة غير مهيأة',
    'deterministic-health-data': 'بيانات صحة تجريبية',
    'unavailable-location-context': 'سياق الموقع غير مهيأ',
    'deterministic-location-context': 'سياق موقع تجريبي',
  },
  en: {
    'unavailable-time-context': 'Time context unavailable',
    'deterministic-time-primary': 'Deterministic time — primary',
    'deterministic-time-alternate': 'Deterministic time — alternate',
    'deterministic-time-context': 'Deterministic time context',
    'unavailable-health-data': 'Health data unavailable',
    'deterministic-health-data': 'Deterministic health data',
    'unavailable-location-context': 'Location context unavailable',
    'deterministic-location-context': 'Deterministic location context',
  },
};

const scopeLabels: Record<'ar' | 'en', Record<string, string>> = {
  ar: {
    read_busy_time: 'قراءة الوقت المشغول',
    read_activity: 'قراءة بيانات النشاط',
    read_recovery: 'قراءة بيانات التعافي',
    read_approximate_context: 'قراءة سياق الموقع التقريبي',
  },
  en: {
    read_busy_time: 'Read busy time',
    read_activity: 'Read activity data',
    read_recovery: 'Read recovery data',
    read_approximate_context: 'Read approximate location context',
  },
};

function providerLabel(providerId: string, locale: 'ar' | 'en'): string {
  return providerLabels[locale][providerId] ?? providerId;
}

function scopeLabel(scope: string, locale: 'ar' | 'en'): string {
  return scopeLabels[locale][scope] ?? scope;
}

function formatDate(value: string | null, locale: 'ar' | 'en'): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-QA' : 'en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export default function IntegrationsScreen() {
  const { locale, refreshSession, userId } = useAppState();
  const labels = copy[locale];
  const [connections, setConnections] = useState<StoredIntegrationConnection[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setConnections([]);
      setStatus('ready');
      return;
    }
    setStatus('loading');
    const result = await loadIntegrationSettings(userId);
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setConnections([]);
      setStatus('error');
      return;
    }
    setConnections(result.value);
    setStatus('ready');
  }, [refreshSession, userId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return reload();
      return undefined;
    });
    return () => {
      active = false;
    };
  }, [reload]);

  const disable = async (connection: StoredIntegrationConnection) => {
    if (!userId || busyId) return;
    setBusyId(connection.id);
    setMessage(null);
    const result = await disableIntegrationConnection(userId, connection.capability, connection.providerId);
    if (!result.ok) {
      setMessage(labels.disconnectError);
      setBusyId(null);
      return;
    }
    await reload();
    setBusyId(null);
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
      </View>

      {status === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText> : null}
      {status === 'error' ? <Card><MizanText accessibilityLiveRegion="polite" muted>{labels.loadError}</MizanText></Card> : null}

      {status === 'ready' && connections.length === 0 ? (
        <Card>
          <MizanText accessibilityLiveRegion="polite" variant="title">{labels.emptyTitle}</MizanText>
          <MizanText muted>{labels.emptyBody}</MizanText>
        </Card>
      ) : null}

      {status === 'ready' ? connections.map((connection) => {
        const statusLabel =
          connection.status === 'connected'
            ? labels.connected
            : connection.status === 'configured'
              ? labels.configured
              : connection.status === 'disabled'
                ? labels.disabled
                : labels.error;
        const permissionLabels = connection.scopes.map((scope) => scopeLabel(scope, locale));
        return (
          <Card key={connection.id}>
            <MizanText variant="title">
              {labels.capabilityLabels[connection.capability] ?? connection.capability}
            </MizanText>
            <View style={styles.details}>
              <MizanText>{labels.provider}: {providerLabel(connection.providerId, locale)}</MizanText>
              <MizanText>{labels.status}: {statusLabel}</MizanText>
              <MizanText>{labels.scopes}: {permissionLabels.join(' · ') || labels.never}</MizanText>
              <MizanText>{labels.lastSync}: {connection.lastSyncedAt ? formatDate(connection.lastSyncedAt, locale) : labels.never}</MizanText>
              <MizanText>{labels.consent}: {connection.consentedAt ? formatDate(connection.consentedAt, locale) : labels.never}</MizanText>
            </View>
            {connection.status !== 'disabled' ? (
              <PrimaryButton
                label={busyId === connection.id ? labels.disconnecting : labels.disconnect}
                disabled={Boolean(busyId)}
                onPress={() => void disable(connection)}
              />
            ) : null}
          </Card>
        );
      }) : null}

      {message ? <MizanText accessibilityLiveRegion="polite" muted>{message}</MizanText> : null}
      <MizanText variant="caption" muted>{labels.privacy}</MizanText>
      <SecondaryButton compact label={labels.back} onPress={() => router.replace('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  details: { gap: Spacing.sm },
});
