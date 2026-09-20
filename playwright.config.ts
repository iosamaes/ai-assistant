import { defineConfig, devices } from '@playwright/test';

const liveSupabaseUrl = process.env.MIZAN_E2E_SUPABASE_URL ?? '';
const liveSupabasePublishableKey = process.env.MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY ?? '';

const responsiveViewports = [
  { name: 'narrow-phone', viewport: { width: 320, height: 568 } },
  { name: 'phone', viewport: { width: 390, height: 844 } },
  { name: 'tablet-portrait', viewport: { width: 834, height: 1194 } },
  { name: 'tablet-landscape', viewport: { width: 1194, height: 834 } },
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
] as const;

const colorSchemes = ['light', 'dark'] as const;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8091',
    trace: 'retain-on-failure',
  },
  projects: responsiveViewports.flatMap(({ name, viewport }) =>
    colorSchemes.map((colorScheme) => ({
      name: `${name}-${colorScheme}`,
      use: { ...devices['Desktop Chrome'], viewport, colorScheme },
    })),
  ),
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
