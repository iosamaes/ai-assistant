import { expect, test } from '@playwright/test';

import {
  collectCriticalBrowserDiagnostics,
  expectNoCriticalBrowserDiagnostics,
  expectNoHorizontalOverflow,
} from './browser-assertions';
import {
  completedMutationAccountConfigured,
  mutationsEnabled,
  signInCompletedMutationAccount,
} from './live-account';

const liveReason =
  'Requires MIZAN_E2E_SUPABASE_URL, MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY, and dedicated completed-account mutation credentials.';
const mutationReason =
  'Notification persistence mutation runs only through the explicit mutation runner.';
const mutationProjectReason =
  'Live mutation E2E runs once in desktop-light to avoid concurrent writes against one shared account.';

const allowedName = /One-minute check-in: Allowed|تسجيل يومي سريع: مسموح/;
const offName = /One-minute check-in: Off|تسجيل يومي سريع: متوقف/;

test.describe('live notification-preference persistence', () => {
  test.skip(!completedMutationAccountConfigured, liveReason);
  test.skip(!mutationsEnabled, mutationReason);

  test('one notification preference persists through reload and is restored', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-light', mutationProjectReason);
    const diagnostics = collectCriticalBrowserDiagnostics(page);

    await signInCompletedMutationAccount(page);
    await page.goto('/settings');

    const allowed = page.getByRole('button', { name: allowedName, exact: true });
    const off = page.getByRole('button', { name: offName, exact: true });
    await expect(allowed).toBeVisible();
    await expect(off).toBeVisible();
    await expect.poll(async () =>
      (await allowed.getAttribute('aria-selected')) === 'true' ||
      (await off.getAttribute('aria-selected')) === 'true',
    ).toBe(true);

    const initiallyAllowed = (await allowed.getAttribute('aria-selected')) === 'true';
    const original = initiallyAllowed ? allowed : off;
    const target = initiallyAllowed ? off : allowed;

    await target.click();
    await expect(target).toHaveAttribute('aria-selected', 'true');
    await expect(target).toBeEnabled();

    await page.reload();
    await expect(page.getByText(/Notifications & reminders|الإشعارات والتذكيرات/, { exact: true })).toBeVisible();
    await expect(target).toHaveAttribute('aria-selected', 'true');

    await original.click();
    await expect(original).toHaveAttribute('aria-selected', 'true');
    await expect(original).toBeEnabled();

    await page.reload();
    await expect(page.getByText(/Notifications & reminders|الإشعارات والتذكيرات/, { exact: true })).toBeVisible();
    await expect(original).toHaveAttribute('aria-selected', 'true');
    await expectNoHorizontalOverflow(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });
});
