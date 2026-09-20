export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export type SupabaseConfigResult =
  | { ok: true; value: SupabasePublicConfig }
  | { ok: false; reason: 'missing' | 'invalid-url' | 'invalid-key' };

const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function decodeBase64UrlAscii(value: string): string | null {
  if (!value || /[^A-Za-z0-9_-]/.test(value)) return null;

  let buffer = 0;
  let bufferedBits = 0;
  let output = '';

  for (const char of value) {
    const digit = BASE64URL_ALPHABET.indexOf(char);
    if (digit < 0) return null;

    buffer = (buffer << 6) | digit;
    bufferedBits += 6;

    while (bufferedBits >= 8) {
      bufferedBits -= 8;
      output += String.fromCharCode((buffer >> bufferedBits) & 0xff);
      buffer &= (1 << bufferedBits) - 1;
    }
  }

  return output;
}

function isAllowedPublicSupabaseKey(key: string): boolean {
  if (key.startsWith('sb_publishable_')) return true;

  const parts = key.split('.');
  if (parts.length !== 3 || !key.startsWith('eyJ')) return false;

  const decodedPayload = decodeBase64UrlAscii(parts[1]);
  if (!decodedPayload) return false;

  try {
    const payload = JSON.parse(decodedPayload) as { role?: unknown };
    return payload.role === 'anon';
  } catch {
    return false;
  }
}

export function readSupabasePublicConfig(): SupabaseConfigResult {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    return { ok: false, reason: 'missing' };
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return { ok: false, reason: 'invalid-url' };
    }
  } catch {
    return { ok: false, reason: 'invalid-url' };
  }

  if (!isAllowedPublicSupabaseKey(publishableKey)) {
    return { ok: false, reason: 'invalid-key' };
  }

  return { ok: true, value: { url, publishableKey } };
}
