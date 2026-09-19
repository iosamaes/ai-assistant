import { defineConfig, devices } from '@playwright/test';

const liveSupabaseUrl = process.env.MIZAN_E2E_SUPABASE_URL ?? '';
const liveSupabasePublishableKey = process.env.MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY ?? '';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8091',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm --workspace @mizan/app run web:e2e',
    url: 'http://127.0.0.1:8091/auth',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      EXPO_NO_DOTENV: '1',
      EXPO_PUBLIC_SUPABASE_URL: liveSupabaseUrl,
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: liveSupabasePublishableKey,
    },
  },
});
