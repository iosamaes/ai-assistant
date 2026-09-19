import { expect, test } from '@playwright/test';

import {
  collectPageErrors,
  completedAccountConfigured,
  expectNoHorizontalOverflow,
  mutationsEnabled,
  signInCompletedAccount,
} from './live-account';

const liveReason = 'Requires MIZAN_E2E_SUPABASE_URL, MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY, and completed-account credentials.';

test.describe('live completed-account product journeys', () => {
  test.skip(!completedAccountConfigured, liveReason);

  test('primary navigation shell reaches the owner-reference destinations without overflow', async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    await signInCompletedAccount(page);

    const navigation = page.getByRole('tablist');
    await expect(navigation).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const lifeMap = page.getByRole('tab', { name: /Life Map|خريطة الحياة/ });
    const oneMove = page.getByRole('tab', { name: /One Move|خطوتي/ });
    const insights = page.getByRole('tab', { name: /Insights|الرؤى/ });
    const more = page.getByRole('tab', { name: /More|المزيد/ });

    await lifeMap.click();
    await expect(page).toHaveURL(/\/life-map$/);
    await expectNoHorizontalOverflow(page);

    await oneMove.click();
    await expect(page).toHaveURL(/\/one-move$/);
    await expectNoHorizontalOverflow(page);

    await insights.click();
    await expect(page).toHaveURL(/\/insights$/);
    await expectNoHorizontalOverflow(page);

    await more.click();
    await expect(page).toHaveURL(/\/settings$/);
    await expectNoHorizontalOverflow(page);
    expect(pageErrors).toEqual([]);
  });

  test('recovery, scenario, settings, and privacy surfaces remain reachable and bounded', async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    await signInCompletedAccount(page);

    await page.goto('/recovery');
    await expect(page.getByText(/Save My Day|أنقذ يومي/, { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/what-if');
    await expect(page.getByText(/Explore a choice without treating it as a prediction|جرّب قرارًا قبل أن تتعامل معه كتوقع/, { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/settings');
    await expect(page.getByText(/Shape MIZAN around your life|اضبط ميزان على حياتك، لا العكس/, { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/privacy');
    await expect(page.getByText(/Privacy & data|الخصوصية والبيانات/, { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(pageErrors).toEqual([]);
  });

  test('daily check-in writes through the live account only when mutations are explicitly enabled', async ({ page }) => {
    test.skip(!mutationsEnabled, 'Set MIZAN_E2E_MUTATIONS=1 only for a disposable or dedicated E2E account.');
    const pageErrors = collectPageErrors(page);
    await signInCompletedAccount(page);

    await page.goto('/check-in');
    await page.getByRole('button', { name: /Energy: 1|الطاقة: 1/, exact: true }).click();
    const save = page.getByRole('button', { name: /Save check-in|حفظ التسجيل/, exact: true });
    await expect(save).toBeEnabled();
    await save.click();
    await page.waitForURL(/\/today$/);
    await expectNoHorizontalOverflow(page);
    expect(pageErrors).toEqual([]);
  });

  test('optional Spiritual Grounding preference can toggle and restore on a dedicated live account', async ({ page }) => {
    test.skip(!mutationsEnabled, 'Set MIZAN_E2E_MUTATIONS=1 only for a disposable or dedicated E2E account.');
    const pageErrors = collectPageErrors(page);
    await signInCompletedAccount(page);
    await page.goto('/settings');

    const enabled = page.getByRole('button', { name: /Enabled|مفعّلة/, exact: true });
    const disabled = page.getByRole('button', { name: /Off|متوقفة/, exact: true });
    await expect(enabled).toBeVisible();
    await expect(disabled).toBeVisible();
    await expect.poll(async () =>
      (await enabled.getAttribute('aria-selected')) === 'true' ||
      (await disabled.getAttribute('aria-selected')) === 'true',
    ).toBe(true);

    const initiallyEnabled = (await enabled.getAttribute('aria-selected')) === 'true';
    const original = initiallyEnabled ? enabled : disabled;
    const target = initiallyEnabled ? disabled : enabled;

    await target.click();
    await expect(target).toHaveAttribute('aria-selected', 'true');
    await expect(target).toBeEnabled();
    await original.click();
    await expect(original).toHaveAttribute('aria-selected', 'true');
    await expect(original).toBeEnabled();
    await expectNoHorizontalOverflow(page);
    expect(pageErrors).toEqual([]);
  });
});
