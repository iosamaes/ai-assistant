import { expect, test, type Locator } from '@playwright/test';

import {
  collectCriticalBrowserDiagnostics,
  expectNoCriticalBrowserDiagnostics,
  expectNoHorizontalOverflow,
} from './browser-assertions';
import {
  mutationsEnabled,
  onboardingAccountConfigured,
  onboardingMutationAccountConfigured,
  signInOnboardingAccount,
  signInOnboardingMutationAccount,
} from './live-account';

const liveReason = 'Requires MIZAN_E2E_SUPABASE_URL, MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY, and a dedicated incomplete read-only onboarding account.';
const mutationLiveReason = 'Requires the live Supabase client configuration plus a separate disposable incomplete onboarding mutation account.';
const mutationProjectReason = 'Live onboarding mutation runs once in desktop-light so its disposable account is not consumed concurrently by the responsive matrix.';

async function ensureSelected(control: Locator) {
  if ((await control.getAttribute('aria-selected')) !== 'true') await control.click();
  await expect(control).toHaveAttribute('aria-selected', 'true');
}

test.describe('live onboarding read-only journey', () => {
  test.skip(!onboardingAccountConfigured, liveReason);

  test('incomplete account reaches the branded onboarding surface without product chrome', async ({ page }) => {
    test.skip(mutationsEnabled, 'Read-only onboarding matrix is skipped in mutation mode; its reusable incomplete fixture is never consumed by mutation coverage.');
    const diagnostics = collectCriticalBrowserDiagnostics(page);
    await signInOnboardingAccount(page);

    await expect(page.getByText(/Build a MIZAN that starts with your priorities|ابنِ ميزانًا يبدأ من أولوياتك أنت/, { exact: true })).toBeVisible();
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });
});

test.describe('live onboarding mutation journey', () => {
  test.skip(!onboardingMutationAccountConfigured, mutationLiveReason);

  test('separate disposable onboarding account can complete the essential setup when mutations are explicitly enabled', async ({ page }, testInfo) => {
    test.skip(!mutationsEnabled, 'Set MIZAN_E2E_MUTATIONS=1 only with the separate disposable onboarding mutation account configured.');
    test.skip(testInfo.project.name !== 'desktop-light', mutationProjectReason);

    const mutationEmail = process.env.MIZAN_E2E_ONBOARDING_MUTATION_EMAIL?.trim().toLowerCase();
    const readOnlyEmail = process.env.MIZAN_E2E_ONBOARDING_EMAIL?.trim().toLowerCase();
    if (mutationEmail && readOnlyEmail && mutationEmail === readOnlyEmail) {
      throw new Error(
        'MIZAN_E2E_ONBOARDING_MUTATION_EMAIL must be separate from the reusable MIZAN_E2E_ONBOARDING_EMAIL fixture.',
      );
    }

    const diagnostics = collectCriticalBrowserDiagnostics(page);
    await signInOnboardingMutationAccount(page);

    const english = page.getByRole('button', { name: 'English', exact: true });
    await ensureSelected(english);

    const recoveryChoices = page.getByRole('button', { name: 'Recovery & energy', exact: true });
    const recoveryDomainToggle = recoveryChoices.first();
    await ensureSelected(recoveryDomainToggle);
    await expect(recoveryChoices).toHaveCount(2);
    await ensureSelected(recoveryChoices.last());

    await ensureSelected(page.getByRole('button', { name: 'Balanced season', exact: true }));
    await ensureSelected(page.getByRole('button', { name: 'Stability', exact: true }));
    await ensureSelected(page.getByRole('button', { name: 'Minimal — only what I explicitly choose', exact: true }));
    await ensureSelected(page.getByRole('button', { name: 'Not now', exact: true }));

    const finish = page.getByRole('button', { name: 'Continue', exact: true });
    await expect(finish).toBeEnabled();
    await finish.click();
    await page.waitForURL(/\/today$/);
    await expect(page.getByRole('tablist')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });
});
