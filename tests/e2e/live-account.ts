import { expect, type Page } from '@playwright/test';

export const liveSupabaseConfigured = Boolean(
  process.env.MIZAN_E2E_SUPABASE_URL && process.env.MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY,
);

export const completedAccountConfigured = Boolean(
  liveSupabaseConfigured &&
    process.env.MIZAN_E2E_COMPLETED_EMAIL &&
    process.env.MIZAN_E2E_COMPLETED_PASSWORD,
);

export const arabicCompletedAccountConfigured = Boolean(
  liveSupabaseConfigured &&
    process.env.MIZAN_E2E_ARABIC_EMAIL &&
    process.env.MIZAN_E2E_ARABIC_PASSWORD,
);

export const onboardingAccountConfigured = Boolean(
  liveSupabaseConfigured &&
    process.env.MIZAN_E2E_ONBOARDING_EMAIL &&
    process.env.MIZAN_E2E_ONBOARDING_PASSWORD,
);

export const mutationsEnabled = process.env.MIZAN_E2E_MUTATIONS === '1';

async function switchAuthToEnglish(page: Page) {
  const english = page.getByRole('button', { name: 'English', exact: true });
  if (await english.isVisible()) await english.click();
  await expect(page.getByText('Enter your personal space')).toBeVisible();
}

export async function signInWithCredentials(page: Page, email: string, password: string) {
  await page.goto('/auth');
  await switchAuthToEnglish(page);
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await page.waitForURL(/\/(today|onboarding)$/);
}

export async function signInCompletedAccount(page: Page) {
  const email = process.env.MIZAN_E2E_COMPLETED_EMAIL;
  const password = process.env.MIZAN_E2E_COMPLETED_PASSWORD;
  if (!email || !password) throw new Error('Completed-account E2E credentials are not configured.');
  await signInWithCredentials(page, email, password);
  await expect(page).toHaveURL(/\/today$/);
}

export async function signInEnglishCompletedAccount(page: Page) {
  await signInCompletedAccount(page);
  await expect(
    page.getByRole('tab', { name: 'Home', exact: true }),
    'The default completed-account fixture must have persisted English locale for English visual evidence.',
  ).toBeVisible();
}

export async function signInArabicCompletedAccount(page: Page) {
  const email = process.env.MIZAN_E2E_ARABIC_EMAIL;
  const password = process.env.MIZAN_E2E_ARABIC_PASSWORD;
  if (!email || !password) throw new Error('Arabic completed-account E2E credentials are not configured.');
  await signInWithCredentials(page, email, password);
  await expect(page).toHaveURL(/\/today$/);
  await expect(page.getByRole('tab', { name: 'الرئيسية', exact: true })).toBeVisible();
}

export async function signInOnboardingAccount(page: Page) {
  const email = process.env.MIZAN_E2E_ONBOARDING_EMAIL;
  const password = process.env.MIZAN_E2E_ONBOARDING_PASSWORD;
  if (!email || !password) throw new Error('Onboarding-account E2E credentials are not configured.');
  await signInWithCredentials(page, email, password);
  await expect(page).toHaveURL(/\/onboarding$/);
}
