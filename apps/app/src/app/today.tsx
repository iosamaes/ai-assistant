import { Link } from 'expo-router';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { Card, MizanText } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { DomainId, useAppState } from '@/state/app-state';

export default function TodayScreen() {
  const { enabledDomains, isRtl, syncStatus, t } = useAppState();
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const syncMessage = syncStatus === 'offline' ? t('syncOffline') : syncStatus === 'error' ? t('syncError') : null;

  return (
    <Screen>
      <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={styles.heading}>
          <MizanText variant="label" muted>{t('appName')}</MizanText>
          <MizanText variant="display">{t('todayTitle')}</MizanText>
        </View>
        <Link href="/settings" asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.settingsButton,
              { borderColor: palette.border, backgroundColor: palette.surface, opacity: pressed ? 0.72 : 1 },
            ]}>
            <MizanText variant="label">{t('settings')}</MizanText>
          </Pressable>
        </Link>
      </View>

      {syncMessage ? <MizanText muted>{syncMessage}</MizanText> : null}

      <Card>
        <View style={[styles.statusRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.dot, { backgroundColor: palette.accent }]} />
          <MizanText variant="label" muted>{t('learningState')}</MizanText>
        </View>
        <MizanText variant="title">{t('learningState')}</MizanText>
        <MizanText muted>{t('learningBody')}</MizanText>
      </Card>

      <View style={styles.section}>
        <MizanText variant="title">{t('priorities')}</MizanText>
        <View style={styles.grid}>
          {enabledDomains.map((domainId: DomainId) => (
            <Card key={domainId} style={styles.domainCard}>
              <MizanText variant="label">{t(domainId)}</MizanText>
              <MizanText variant="caption" muted>{t('learningState')}</MizanText>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg },
  heading: { flex: 1, gap: Spacing.xs },
  settingsButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.lg, borderWidth: 1, borderRadius: Radius.pill },
  statusRow: { alignItems: 'center', gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  section: { gap: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  domainCard: { minWidth: 220, flexGrow: 1, flexBasis: 240 },
});
