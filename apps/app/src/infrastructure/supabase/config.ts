export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export type SupabaseConfigResult =
  | { ok: true; value: SupabasePublicConfig }
  | { ok: false; reason: 'missing' | 'invalid-url' | 'invalid-key' };

export function readSupabasePublicConfig(): SupabaseConfigResult {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    return { ok: false, reason: 'missing' };
  }

  try {
    new URL(url);
  } catch {
    return { ok: false, reason: 'invalid-url' };
  }

  if (!publishableKey.startsWith('sb_publishable_') && !publishableKey.startsWith('eyJ')) {
    return { ok: false, reason: 'invalid-key' };
  }

  return { ok: true, value: { url, publishableKey } };
}
