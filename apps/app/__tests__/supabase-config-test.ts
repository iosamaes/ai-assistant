import { readSupabasePublicConfig } from '@/infrastructure/supabase/config';

const originalUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const originalKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterEach(() => {
  restoreEnv('EXPO_PUBLIC_SUPABASE_URL', originalUrl);
  restoreEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', originalKey);
});

describe('Supabase public config', () => {
  test('reports missing configuration without throwing', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(readSupabasePublicConfig()).toEqual({ ok: false, reason: 'missing' });
  });

  test('rejects malformed URLs before client construction', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'not-a-url';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';

    expect(readSupabasePublicConfig()).toEqual({ ok: false, reason: 'invalid-url' });
  });

  test('rejects keys that are not publishable or JWT-shaped', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'secret-looking-value';

    expect(readSupabasePublicConfig()).toEqual({ ok: false, reason: 'invalid-key' });
  });

  test('accepts a valid public configuration', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';

    expect(readSupabasePublicConfig()).toEqual({
      ok: true,
      value: {
        url: 'https://example.supabase.co',
        publishableKey: 'sb_publishable_test',
      },
    });
  });
});
