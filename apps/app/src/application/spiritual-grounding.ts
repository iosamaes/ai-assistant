import { useCallback, useEffect, useState } from 'react';

import { loadPluginSetting, savePluginSetting } from '@/infrastructure/supabase/plugin-settings';

export const SPIRITUAL_GROUNDING_PLUGIN_ID = 'spiritual-grounding';

export type SpiritualGroundingStatus = 'idle' | 'loading' | 'saving' | 'ready' | 'error';

export function useSpiritualGroundingPreference(userId: string | null) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const [status, setStatus] = useState<SpiritualGroundingStatus>('idle');

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;

      if (!userId) {
      setChoice(null);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    void loadPluginSetting(userId, SPIRITUAL_GROUNDING_PLUGIN_ID).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setStatus('error');
        return;
      }
      setChoice(result.value ? result.value.enabled : null);
      setStatus('ready');
    });
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const persistChoice = useCallback(
    async (next: boolean) => {
      if (!userId) {
        setStatus('error');
        return false;
      }

      setChoice(next);
      setStatus('saving');
      const result = await savePluginSetting(userId, {
        plugin_id: SPIRITUAL_GROUNDING_PLUGIN_ID,
        enabled: next,
        consented_at: next ? new Date().toISOString() : null,
        settings: {},
      });

      if (!result.ok) {
        setStatus('error');
        return false;
      }

      setStatus('ready');
      return true;
    },
    [userId],
  );

  return {
    choice,
    setChoice,
    persistChoice,
    status,
  };
}
