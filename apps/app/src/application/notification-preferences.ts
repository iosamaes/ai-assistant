import { useCallback, useEffect, useRef, useState } from 'react';

import { loadPluginSetting, savePluginSetting } from '@/infrastructure/supabase/plugin-settings';

export const NOTIFICATION_PREFERENCES_PLUGIN_ID = 'notification-preferences';

export type NotificationPreferenceStatus = 'idle' | 'loading' | 'saving' | 'ready' | 'error';

export type NotificationPreferences = {
  dailyCheckIn: boolean;
  experimentReminders: boolean;
  recoveryPrompts: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  dailyCheckIn: false,
  experimentReminders: false,
  recoveryPrompts: false,
};

function parseBoolean(value: unknown): boolean {
  return value === true;
}

function preferencesFromSetting(settings: Record<string, unknown> | null | undefined): NotificationPreferences {
  return {
    dailyCheckIn: parseBoolean(settings?.daily_check_in),
    experimentReminders: parseBoolean(settings?.experiment_reminders),
    recoveryPrompts: parseBoolean(settings?.recovery_prompts),
  };
}

function preferencesEnabled(preferences: NotificationPreferences) {
  return preferences.dailyCheckIn || preferences.experimentReminders || preferences.recoveryPrompts;
}

export function useNotificationPreferences(userId: string | null) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [status, setStatus] = useState<NotificationPreferenceStatus>('idle');
  const activeUserRef = useRef(userId);
  const preferenceUserRef = useRef(userId);
  activeUserRef.current = userId;

  if (preferenceUserRef.current !== userId) {
    preferenceUserRef.current = userId;
    setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    setStatus('idle');
  }

  useEffect(() => {
    let active = true;
    const requestedUserId = userId;

    void (async () => {
      await Promise.resolve();
      if (!active || activeUserRef.current !== requestedUserId) return;
      setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      if (!requestedUserId) {
        setStatus('idle');
        return;
      }

      setStatus('loading');
      const result = await loadPluginSetting(requestedUserId, NOTIFICATION_PREFERENCES_PLUGIN_ID);
      if (!active || activeUserRef.current !== requestedUserId) return;
      if (!result.ok) {
        setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
        setStatus('error');
        return;
      }

      setPreferences(preferencesFromSetting(result.value?.settings));
      setStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const persistPreferences = useCallback(
    async (next: NotificationPreferences) => {
      if (!userId || activeUserRef.current !== userId) {
        setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
        setStatus('error');
        return false;
      }

      const requestedUserId = userId;
      const previous = preferences;
      setPreferences(next);
      setStatus('saving');
      const enabled = preferencesEnabled(next);
      const result = await savePluginSetting(requestedUserId, {
        plugin_id: NOTIFICATION_PREFERENCES_PLUGIN_ID,
        enabled,
        consented_at: enabled ? new Date().toISOString() : null,
        settings: {
          daily_check_in: next.dailyCheckIn,
          experiment_reminders: next.experimentReminders,
          recovery_prompts: next.recoveryPrompts,
        },
      });

      if (activeUserRef.current !== requestedUserId) return false;
      if (!result.ok) {
        setPreferences(previous);
        setStatus('error');
        return false;
      }

      setStatus('ready');
      return true;
    },
    [preferences, userId],
  );

  return {
    persistPreferences,
    preferences,
    status,
  };
}
