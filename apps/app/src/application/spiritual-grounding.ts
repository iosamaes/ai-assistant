import { useCallback, useEffect, useRef, useState } from 'react';

import { loadPluginSetting, savePluginSetting } from '@/infrastructure/supabase/plugin-settings';

export const SPIRITUAL_GROUNDING_PLUGIN_ID = 'spiritual-grounding';

export type SpiritualGroundingStatus = 'idle' | 'loading' | 'saving' | 'ready' | 'error';

export function useSpiritualGroundingPreference(userId: string | null) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const [status, setStatus] = useState<SpiritualGroundingStatus>('idle');
  const activeUserRef = useRef(userId);

  useEffect(() => {
    let active = true;
    const requestedUserId = userId;
    activeUserRef.current = requestedUserId;

    void (async () => {
      await Promise.resolve();
      if (!active || activeUserRef.current !== requestedUserId) return;
      setChoice(null);
      if (!requestedUserId) {
        setStatus('idle');
        return;
      }

      setStatus('loading');
      const result = await loadPluginSetting(requestedUserId, SPIRITUAL_GROUNDING_PLUGIN_ID);
      if (!active || activeUserRef.current !== requestedUserId) return;
      if (!result.ok) {
        setChoice(null);
        setStatus('error');
        return;
      }
      setChoice(result.value ? result.value.enabled : null);
      setStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const persistChoice = useCallback(
    async (next: boolean) => {
      if (!userId || activeUserRef.current !== userId) {
        setChoice(null);
        setStatus('error');
        return false;
      }

      const requestedUserId = userId;
      const previousChoice = choice;
      setChoice(next);
      setStatus('saving');
      const result = await savePluginSetting(requestedUserId, {
        plugin_id: SPIRITUAL_GROUNDING_PLUGIN_ID,
        enabled: next,
        consented_at: next ? new Date().toISOString() : null,
        settings: {},
      });

      if (activeUserRef.current !== requestedUserId) return false;
      if (!result.ok) {
        setChoice(previousChoice);
        setStatus('error');
        return false;
      }

      setStatus('ready');
      return true;
    },
    [choice, userId],
  );

  return {
    choice,
    setChoice,
    persistChoice,
    status,
  };
}
