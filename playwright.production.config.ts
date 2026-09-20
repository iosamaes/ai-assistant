import { defineConfig, devices } from '@playwright/test';
import { Buffer } from 'node:buffer';

const authorizedSupabaseProjectRef = 'olfhjnropdrnujgpidfi';
const liveSupabaseUrl = process.env.MIZAN_E2E_SUPABASE_URL ?? '';
const liveSupabasePublishableKey = process.env.MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY ?? '';

function assertAuthorizedLiveSupabaseUrl(rawUrl: string) {
  if (!rawUrl) return;

  let configuredUrl: URL;
  try {
    configuredUrl = new URL(rawUrl);
  } catch {
    throw new Error('MIZAN_E2E_SUPABASE_URL must be a valid hosted Supabase URL.');
  }

  const hostedSuffix = '.supabase.co';
  if (configuredUrl.protocol !== 'https:' || !configuredUrl.hostname.endsWith(hostedSuffix)) {
    throw new Error('MIZAN_E2E_SUPABASE_URL must be a hosted Supabase HTTPS URL.');
  }

  const configuredProjectRef = configuredUrl.hostname.slice(0, -hostedSuffix.length);
  if (configuredProjectRef !== authorizedSupabaseProjectRef) {
    throw new Error(`Production E2E is authorized only for Supabase project ${authorizedSupabaseProjectRef}.`);
  }
}

function assertUnprivilegedSupabaseClientKey(rawKey: string) {
  const key = rawKey.trim();
  if (!key) return;
  if (key.startsWith('sb_publishable_')) return;
  if (key.startsWith('sb_secret_')) {
    throw new Error('MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY must not be a Supabase secret key.');
  }

  const parts = key.split('.');
  if (parts.length !== 3 || !key.startsWith('eyJ')) {
    throw new Error('MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key or legacy anon JWT.');
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { role?: unknown };
    if (payload.role === 'anon') return;
    if (payload.role === 'service_role') {
      throw new Error('MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY must not be a Supabase service-role key.');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('must not be a Supabase service-role key')) throw error;
    throw new Error('MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key or legacy anon JWT.');
  }

  throw new Error('MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key or legacy anon JWT.');
}

assertAuthorizedLiveSupabaseUrl(liveSupabaseUrl);
assertUnprivilegedSupabaseClientKey(liveSupabasePublishableKey);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8092',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'production-phone-light',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        colorScheme: 'light',
      },
    },
    {
      name: 'production-desktop-dark',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        colorScheme: 'dark',
      },
    },
  ],
  webServer: {
    command: 'npm run export:web && npm run report:web-size && node scripts/serve-expo-static.mjs apps/app/dist 8092',
    url: 'http://127.0.0.1:8092/auth',
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      EXPO_NO_DOTENV: '1',
      EXPO_PUBLIC_SUPABASE_URL: liveSupabaseUrl,
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: liveSupabasePublishableKey,
    },
  },
});
