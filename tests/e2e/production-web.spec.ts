import { expect, test, type Page } from '@playwright/test';

import {
  collectCriticalBrowserDiagnostics,
  expectNoCriticalBrowserDiagnostics,
  expectNoHorizontalOverflow,
} from './browser-assertions';
import { completedAccountConfigured, signInEnglishCompletedAccount } from './live-account';

const liveReason =
  'Requires MIZAN_E2E_SUPABASE_URL, MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY, and persisted-English completed-account credentials.';

function actionButton(page: Page, name: string) {
  return page.getByRole('button', { name, exact: true }).last();
}

test('production static export serves direct signed-out routes and hydrates the auth shell', async ({ page }) => {
  const diagnostics = collectCriticalBrowserDiagnostics(page);

  // This direct request exercises the exported route file itself rather than relying on
  // client-side navigation from /. A signed-out visitor must still be fenced back to auth.
  await page.goto('/today');
  await page.waitForURL('**/auth');
  await expect(page.getByText('ادخل إلى مساحتك الشخصية')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'البريد الإلكتروني', exact: true })).toBeVisible();
  await expect(page.getByLabel('كلمة المرور', { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByText('Enter your personal space')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  await expect(actionButton(page, 'Sign in')).toBeDisabled();
  await expectNoHorizontalOverflow(page);
  expectNoCriticalBrowserDiagnostics(diagnostics);
});

test.describe('production static export with completed account', () => {
  test.skip(!completedAccountConfigured, liveReason);

  test('hydrates authenticated direct routes and the primary shell from exported files', async ({ page }) => {
    const diagnostics = collectCriticalBrowserDiagnostics(page);
    await signInEnglishCompletedAccount(page);

    await expect(page.getByRole('tablist')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Home', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expectNoHorizontalOverflow(page);

    // Reload through the static server on representative exported route files. Session
    // persistence must survive the document navigation and the correct tab must re-hydrate.
    await page.goto('/life-map');
    await expect(page).toHaveURL(/\/life-map$/);
    const lifeMap = page.getByRole('tab', { name: 'Life Map', exact: true });
    await expect(lifeMap).toHaveAttribute('aria-selected', 'true');
    await expectNoHorizontalOverflow(page);

    const oneMove = page.getByRole('tab', { name: 'One Move', exact: true });
    await oneMove.click();
    await expect(page).toHaveURL(/\/one-move$/);
    await expect(oneMove).toHaveAttribute('aria-selected', 'true');
    await expectNoHorizontalOverflow(page);

    const insights = page.getByRole('tab', { name: 'Insights', exact: true });
    await insights.click();
    await expect(page).toHaveURL(/\/insights$/);
    await expect(insights).toHaveAttribute('aria-selected', 'true');
    await expectNoHorizontalOverflow(page);

    const more = page.getByRole('tab', { name: 'More', exact: true });
    await more.click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(more).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Shape MIZAN around your life', { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/why');
    await expect(page).toHaveURL(/\/why$/);
    await expect(page.getByText('Why might I feel off?', { exact: true })).toBeVisible();
    await expect(page.getByRole('tablist')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });
});
