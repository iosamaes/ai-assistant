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

export type BrowserDiagnostics = {
  pageErrors: string[];
  consoleErrors: string[];
  failedRequests: string[];
  serverErrors: string[];
};

export function collectCriticalBrowserDiagnostics(page: Page): BrowserDiagnostics {
  const diagnostics: BrowserDiagnostics = {
    pageErrors: [],
    consoleErrors: [],
    failedRequests: [],
    serverErrors: [],
  };

  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText ?? 'unknown network failure';
    // Route changes can cancel in-flight browser requests by design. Keep the
    // CP11 guard focused on actual runtime/network failures rather than navigation aborts.
    if (failure === 'net::ERR_ABORTED') return;
    diagnostics.failedRequests.push(`${request.method()} ${request.url()} :: ${failure}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 500) diagnostics.serverErrors.push(`${response.status()} ${response.url()}`);
  });

  return diagnostics;
}

export function expectNoCriticalBrowserDiagnostics(diagnostics: BrowserDiagnostics) {
  expect(diagnostics.pageErrors, 'uncaught page errors').toEqual([]);
  expect(diagnostics.consoleErrors, 'browser console errors').toEqual([]);
  expect(diagnostics.failedRequests, 'failed browser requests').toEqual([]);
  expect(diagnostics.serverErrors, 'HTTP 5xx responses').toEqual([]);
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.viewport + 1);
}

export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function switchAuthToEnglish(page: Page) {
  const english = page.getByRole('button', { name: 'English', exact: true });
  if (await english.isVisible()) await english.click();
  await expect(page.getByText('Enter your personal space')).toBeVisible();
}

export async function signInWithCredentials(page: Page, email: string, password: string) {
  await page.goto('/auth');
  await switchAuthToEnglish(page);
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(email);
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
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
