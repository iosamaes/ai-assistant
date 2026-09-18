import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from './client';
import { upsertPluginSetting, type DataResult, type PluginSettingInput } from './data-access';

export type PluginSetting = {
  user_id: string;
  plugin_id: string;
  enabled: boolean;
  consented_at: string | null;
  settings: Record<string, unknown>;
};

function pluginFailure(error: PostgrestError): DataResult<never> {
  const message = error.message.toLowerCase();

  if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.code === 'PGRST303') {
    return { ok: false, error: { kind: 'session-expired', code: error.code } };
  }
  if (error.code === '42501') {
    return { ok: false, error: { kind: 'unauthorized', code: error.code } };
  }
  if (
    error.code.startsWith('08') ||
    error.code === 'PGRST000' ||
    error.code === 'PGRST001' ||
    error.code === 'PGRST002' ||
    message.includes('failed to fetch') ||
    message.includes('network')
  ) {
    return { ok: false, error: { kind: 'unavailable', code: error.code } };
  }
  return { ok: false, error: { kind: 'unknown', code: error.code } };
}

export async function loadPluginSetting(
  userId: string,
  pluginId: string,
): Promise<DataResult<PluginSetting | null>> {
  if (!supabase) return { ok: false, error: { kind: 'not-configured' } };

  const { data, error } = await supabase
    .from('plugin_settings')
    .select('user_id,plugin_id,enabled,consented_at,settings')
    .eq('user_id', userId)
    .eq('plugin_id', pluginId)
    .maybeSingle();

  if (error) return pluginFailure(error);
  return { ok: true, value: (data as PluginSetting | null) ?? null };
}

export async function savePluginSetting(
  userId: string,
  input: PluginSettingInput,
): Promise<DataResult<null>> {
  return upsertPluginSetting(userId, input);
}
