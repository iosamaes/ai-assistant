import { expect, test, type Locator } from '@playwright/test';

import {
  collectPageErrors,
  expectNoHorizontalOverflow,
  mutationsEnabled,
  onboardingAccountConfigured,
  signInOnboardingAccount,
} from './live-account';

const liveReason = 'Requires MIZAN_E2E_SUPABASE_URL, MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY, and a dedicated incomplete-onboarding account.';

async function ensureSelected(control: Locator) {
  if ((await control.getAttribute('aria-selected')) !== 'true') await control.click();
  await expect(control).toHaveAttribute('aria-selected', 'true');
}

test.describe('live onboarding journey', () => {
  test.skip(!onboardingAccountConfigured, liveReason);

  test('incomplete account reaches the branded onboarding surface without product chrome', async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    await signInOnboardingAccount(page);

    await expect(page.getByText(/Build a MIZAN that starts with your priorities|ابنِ ميزانًا يبدأ من أولوياتك أنت/, { exact: true })).toBeVisible();
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    expect(pageErrors).toEqual([]);
  });

  test('dedicated onboarding account can complete the essential setup when mutations are explicitly enabled', async ({ page }) => {
    test.skip(!mutationsEnabled, 'Set MIZAN_E2E_MUTATIONS=1 only for a disposable or dedicated onboarding E2E account.');
    const pageErrors = collectPageErrors(page);
    await signInOnboardingAccount(page);

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
    expect(pageErrors).toEqual([]);
  });
});
