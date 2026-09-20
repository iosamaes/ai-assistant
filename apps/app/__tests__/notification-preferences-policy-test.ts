import fs from 'node:fs';
import path from 'node:path';

function sourceFor(relativePath: string) {
  return fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');
}

describe('Notification preferences policy', () => {
  test('notification consent defaults off and is account-fenced before persistence', () => {
    const source = sourceFor('src/application/notification-preferences.ts');

    expect(source).toContain("export const NOTIFICATION_PREFERENCES_PLUGIN_ID = 'notification-preferences';");
    expect(source).toContain('dailyCheckIn: false');
    expect(source).toContain('experimentReminders: false');
    expect(source).toContain('recoveryPrompts: false');
    expect(source).toContain('activeUserRef.current = requestedUserId;');
    expect(source).toContain('const requestedUserId = userId;');
    expect(source).toContain('if (activeUserRef.current !== requestedUserId) return false;');
    expect(source).toContain('result.value?.enabled');
    expect(source).toContain(': DEFAULT_NOTIFICATION_PREFERENCES');
    expect(source).toContain('consented_at: enabled ? new Date().toISOString() : null');
    expect(source).toContain('daily_check_in: next.dailyCheckIn');
    expect(source).toContain('experiment_reminders: next.experimentReminders');
    expect(source).toContain('recovery_prompts: next.recoveryPrompts');
  });

  test('Settings exposes respectful categories, contextual accessibility labels, and truthful delivery disclosure', () => {
    const source = sourceFor('src/app/settings.tsx');

    expect(source).toContain('useNotificationPreferences(userId)');
    expect(source).toContain('notificationLabels.deliveryUnavailable');
    expect(source).toContain('notificationPreferences.dailyCheckIn');
    expect(source).toContain('notificationPreferences.experimentReminders');
    expect(source).toContain('notificationPreferences.recoveryPrompts');
    expect(source).toContain('<AppIcon name="notification"');
    expect(source).toContain('accessibilityLabel={`${notificationLabels.dailyTitle}: ${notificationLabels.allow}`}');
    expect(source).toContain('accessibilityLabel={`${notificationLabels.experimentTitle}: ${notificationLabels.allow}`}');
    expect(source).toContain('accessibilityLabel={`${notificationLabels.recoveryTitle}: ${notificationLabels.allow}`}');
    expect(source).toContain('never use urgency, streaks, or fear of losing progress');
    expect(source).toContain('لا نستخدم الاستعجال أو السلاسل أو الخوف من فقدان التقدم');
  });
});
