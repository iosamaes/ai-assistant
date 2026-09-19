import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  disableIntegrationConnection,
  loadIntegrationSettings,
} from '@/application/integrations';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { Card, MizanText, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import type { StoredIntegrationConnection } from '@/infrastructure/supabase/integrations';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const copy = {
  ar: {
    eyebrow: 'التكاملات',
    title: 'المصادر الخارجية',
    body: 'يعرض ميزان هنا فقط التكاملات التي تم ربطها فعليًا. غياب أي مزود لا يمنع المحرك الأساسي من العمل، ولا يتم تخزين مفاتيح أو أسرار المزود في هذه الحالة.',
    heroTitle: 'مصادرك تحت سيطرتك',
    heroBody: 'كل اتصال اختياري، ويمكن إيقافه دون تعطيل وظائف ميزان الأساسية.',
    loading: 'جارٍ تحميل التكاملات…',
    loadError: 'تعذر تحميل حالة التكاملات الآن.',
    emptyTitle: 'لا توجد تكاملات متصلة',
    emptyBody: 'لا يوجد مزود خارجي مفعّل لهذا الحساب حاليًا. سيظل ميزان يعمل بالبيانات المباشرة التي تختار تسجيلها.',
    sourceDetails: 'تفاصيل المصدر',
    provider: 'المزود',
    capability: 'القدرة',
    status: 'الحالة',
    scopes: 'الصلاحيات',
    permissions: 'الصلاحيات الممنوحة',
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
    unknownProvider: 'مزود خارجي',
    unknownCapability: 'قدرة خارجية',
    unknownPermission: 'صلاحية إضافية',
    capabilityLabels: {
      health_data: 'بيانات الصحة والساعات',
      time_context: 'سياق الوقت والتقويم',
      location_context: 'سياق الموقع التقريبي',
    },
    privacyTitle: 'الخصوصية أولًا',
    privacy: 'عند إيقاف التكامل تتوقف حالة الاتصال المستقبلية من داخل ميزان. حذف البيانات المستوردة وضوابط التصدير/الحذف الشاملة تُراجع ضمن طبقة الخصوصية الخاصة بالحساب.',
    back: 'العودة للإعدادات',
  },
  en: {
    eyebrow: 'Integrations',
    title: 'External sources',
    body: 'MIZAN shows only integrations that were actually connected. The deterministic core keeps working without any provider, and provider secrets are never stored in this lifecycle state.',
    heroTitle: 'Your sources stay under your control',
    heroBody: 'Every connection is optional and can be disabled without breaking MIZAN’s deterministic core.',
    loading: 'Loading integrations…',
    loadError: 'Integration state could not be loaded right now.',
    emptyTitle: 'No integrations connected',
    emptyBody: 'No external provider is enabled for this account. MIZAN continues to work from the direct evidence you choose to record.',
    sourceDetails: 'Source details',
    provider: 'Provider',
    capability: 'Capability',
    status: 'Status',
    scopes: 'Permissions',
    permissions: 'Granted permissions',
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
    unknownProvider: 'External provider',
    unknownCapability: 'External capability',
    unknownPermission: 'Additional permission',
    capabilityLabels: {
      health_data: 'Health & wearable data',
      time_context: 'Time & calendar context',
      location_context: 'Approximate location context',
    },
    privacyTitle: 'Privacy first',
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
  return providerLabels[locale][providerId] ?? copy[locale].unknownProvider;
}

function scopeLabel(scope: string, locale: 'ar' | 'en'): string {
  return scopeLabels[locale][scope] ?? copy[locale].unknownPermission;
}

function capabilityIconName(capability: StoredIntegrationConnection['capability']): AppIconName {
  if (capability === 'health_data') return 'recovery';
  if (capability === 'time_context') return 'margin';
  return 'lifeMap';
}

function formatDate(value: string | null, locale: 'ar' | 'en'): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en-QA-u-nu-latn', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
}

export default function IntegrationsScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const labels = copy[locale];
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const [connections, setConnections] = useState<StoredIntegrationConnection[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const activeUserRef = useRef(userId);
  const loadRequestRef = useRef(0);

  useEffect(() => {
    activeUserRef.current = userId;
  }, [userId]);

  const reload = useCallback(async () => {
    const requestedUserId = userId;
    const requestId = ++loadRequestRef.current;
    const requestIsCurrent = () =>
      loadRequestRef.current === requestId && activeUserRef.current === requestedUserId;

    if (!requestedUserId) {
      if (!requestIsCurrent()) return;
      setConnections([]);
      setStatus('ready');
      return;
    }

    if (requestIsCurrent()) setStatus('loading');
    const result = await loadIntegrationSettings(requestedUserId);
    if (!requestIsCurrent()) return;

    if (!result.ok) {
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (!requestIsCurrent()) return;
      }
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
      if (!active) return;
      setBusyId(null);
      setMessage(null);
      return reload();
    });
    return () => {
      active = false;
      loadRequestRef.current += 1;
    };
  }, [reload]);

  const disable = async (connection: StoredIntegrationConnection) => {
    if (!userId || busyId) return;
    const requestedUserId = userId;
    setBusyId(connection.id);
    setMessage(null);
    const result = await disableIntegrationConnection(
      requestedUserId,
      connection.capability,
      connection.providerId,
    );
    if (activeUserRef.current !== requestedUserId) return;

    if (!result.ok) {
      setMessage(labels.disconnectError);
      setBusyId(null);
      return;
    }

    await reload();
    if (activeUserRef.current === requestedUserId) setBusyId(null);
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
        <View style={[styles.heroHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.heroIcon, { backgroundColor: palette.surface }]}>
            <AppIcon name="integration" color={palette.accent} size={24} />
          </View>
          <MizanText variant="title" style={styles.flexibleText}>{labels.heroTitle}</MizanText>
        </View>
        <MizanText>{labels.body}</MizanText>
        <MizanText variant="caption" muted>{labels.heroBody}</MizanText>
      </Card>

      {status === 'loading' ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText>
        </Card>
      ) : null}

      {status === 'error' ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" variant="title">{labels.loadError}</MizanText>
        </Card>
      ) : null}

      {status === 'ready' && connections.length === 0 ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" variant="title">{labels.emptyTitle}</MizanText>
          <MizanText muted>{labels.emptyBody}</MizanText>
        </Card>
      ) : null}

      {status === 'ready'
        ? connections.map((connection) => {
            const statusLabel =
              connection.status === 'connected'
                ? labels.connected
                : connection.status === 'configured'
                  ? labels.configured
                  : connection.status === 'disabled'
                    ? labels.disabled
                    : labels.error;
            const permissionLabels = connection.scopes.map((scope) => scopeLabel(scope, locale));
            const capabilityLabel =
              labels.capabilityLabels[connection.capability] ?? labels.unknownCapability;
            const isConnected =
              connection.status === 'connected' || connection.status === 'configured';

            return (
              <Card
                key={connection.id}
                style={isConnected ? { borderColor: palette.accent } : undefined}>
                <View style={[styles.connectionHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.capabilityHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.capabilityIcon, { backgroundColor: palette.accentSoft }]}>
                      <AppIcon name={capabilityIconName(connection.capability)} color={palette.accent} size={22} />
                    </View>
                    <View style={styles.flexibleText}>
                      <MizanText variant="label" muted>{labels.capability}</MizanText>
                      <MizanText variant="title">{capabilityLabel}</MizanText>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: isConnected ? palette.accentSoft : palette.surfaceMuted },
                    ]}>
                    <MizanText variant="caption">{statusLabel}</MizanText>
                  </View>
                </View>

                <View style={[styles.providerPanel, { backgroundColor: palette.surfaceMuted }]}>
                  <View style={[styles.detailHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <AppIcon name="integration" color={palette.accent} size={18} />
                    <MizanText variant="caption" muted>{labels.provider}</MizanText>
                  </View>
                  <MizanText variant="title">{providerLabel(connection.providerId, locale)}</MizanText>
                </View>

                <MizanText variant="label">{labels.sourceDetails}</MizanText>
                <View style={[styles.detailsGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={styles.detailBlock}>
                    <View style={[styles.detailHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <AppIcon name="evidence" color={palette.accent} size={18} />
                      <MizanText variant="caption" muted>{labels.lastSync}</MizanText>
                    </View>
                    <MizanText variant="label">
                      {connection.lastSyncedAt ? formatDate(connection.lastSyncedAt, locale) : labels.never}
                    </MizanText>
                  </View>
                  <View style={styles.detailBlock}>
                    <View style={[styles.detailHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <AppIcon name="privacy" color={palette.accent} size={18} />
                      <MizanText variant="caption" muted>{labels.consent}</MizanText>
                    </View>
                    <MizanText variant="label">
                      {connection.consentedAt ? formatDate(connection.consentedAt, locale) : labels.never}
                    </MizanText>
                  </View>
                </View>

                <View style={[styles.permissionsGroup, { borderTopColor: palette.border }]}>
                  <View style={[styles.detailHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <AppIcon name="privacy" color={palette.accent} size={18} />
                    <MizanText variant="label">{labels.permissions}</MizanText>
                  </View>
                  {permissionLabels.length > 0 ? (
                    <View style={[styles.permissionPills, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      {permissionLabels.map((permission, index) => (
                        <View
                          key={`${connection.id}-${connection.scopes[index] ?? index}`}
                          style={[
                            styles.permissionPill,
                            { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
                          ]}>
                          <MizanText variant="caption">{permission}</MizanText>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <MizanText variant="caption" muted>{labels.never}</MizanText>
                  )}
                </View>

                {connection.status !== 'disabled' ? (
                  <SecondaryButton
                    label={busyId === connection.id ? labels.disconnecting : labels.disconnect}
                    disabled={Boolean(busyId)}
                    onPress={() => void disable(connection)}
                  />
                ) : null}
              </Card>
            );
          })
        : null}

      {message ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{message}</MizanText>
        </Card>
      ) : null}

      <Card style={[styles.privacyCard, { backgroundColor: palette.surfaceMuted }]}>
        <View style={[styles.privacyHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <AppIcon name="privacy" color={palette.accent} size={22} />
          <MizanText variant="label" style={styles.flexibleText}>{labels.privacyTitle}</MizanText>
        </View>
        <MizanText variant="caption" muted>{labels.privacy}</MizanText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    flexWrap: 'wrap',
  },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  flexibleText: { flex: 1, minWidth: 0 },
  heroCard: { gap: Spacing.md },
  heroHeading: { alignItems: 'center', gap: Spacing.md },
  heroIcon: {
    width: Controls.standardHeight,
    height: Controls.standardHeight,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  connectionHeader: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  capabilityHeading: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 260,
    minWidth: 0,
    alignItems: 'center',
    gap: Spacing.md,
  },
  capabilityIcon: {
    width: Controls.minimumTouchHeight,
    height: Controls.minimumTouchHeight,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  providerPanel: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  detailsGrid: {
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  detailBlock: {
    flexGrow: 1,
    flexBasis: 220,
    gap: Spacing.xs,
  },
  detailHeading: { alignItems: 'center', gap: Spacing.xs },
  permissionsGroup: {
    borderTopWidth: Controls.borderWidth,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  permissionPills: {
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  permissionPill: {
    minHeight: 36,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
  },
  privacyCard: { gap: Spacing.sm },
  privacyHeading: { alignItems: 'center', gap: Spacing.sm },
});
