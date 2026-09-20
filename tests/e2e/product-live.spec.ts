import { expect, test, type Page } from '@playwright/test';

import {
  collectCriticalBrowserDiagnostics,
  expectNoCriticalBrowserDiagnostics,
  expectNoHorizontalOverflow,
  tabTo,
} from './browser-assertions';
import {
  arabicCompletedAccountConfigured,
  completedAccountConfigured,
  mutationsEnabled,
  signInArabicCompletedAccount,
  signInCompletedAccount,
} from './live-account';

const liveReason = 'Requires MIZAN_E2E_SUPABASE_URL, MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY, and completed-account credentials.';
const arabicLiveReason = 'Requires the live Supabase client configuration plus a completed account whose saved MIZAN locale is Arabic.';
const mutationProjectReason = 'Live mutation E2E runs once in desktop-light to avoid concurrent writes against one shared account.';

const premiumReferenceSurfaces = [
  {
    path: '/why',
    title: /Why might I feel off\?|لماذا قد أشعر أنني لست على ما يرام؟/,
  },
  {
    path: '/personal-learning',
    title: /What has MIZAN learned from your experience\?|ما الذي تعلّمناه من تجربتك؟/,
  },
  {
    path: '/experiments',
    title: /Test one small hypothesis in your own life|اختبر فرضية صغيرة على حياتك/,
  },
  {
    path: '/integrations',
    title: /External sources|المصادر الخارجية/,
  },
] as const;

async function expectPremiumReferenceSurfaces(page: Page) {
  for (const surface of premiumReferenceSurfaces) {
    await page.goto(surface.path);
    await expect(page).toHaveURL(new RegExp(`${surface.path.replace('/', '\\/')}$`));
    await expect(page.getByText(surface.title, { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
}

async function recordLowEnergyCheckIn(page: Page) {
  await page.goto('/check-in');
  await page.getByRole('button', { name: /Energy: 1|الطاقة: 1/, exact: true }).click();
  const save = page.getByRole('button', { name: /Save check-in|حفظ التسجيل/, exact: true });
  await expect(save).toBeEnabled();
  await save.click();
  await page.waitForURL(/\/today$/);
}

test.describe('live completed-account product journeys', () => {
  test.skip(!completedAccountConfigured, liveReason);

  test('primary navigation shell reaches the owner-reference destinations without overflow', async ({ page }) => {
    const diagnostics = collectCriticalBrowserDiagnostics(page);
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
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });

  test('primary navigation shell is keyboard reachable and activates routes without pointer input', async ({ page }) => {
    const diagnostics = collectCriticalBrowserDiagnostics(page);
    await signInCompletedAccount(page);

    const lifeMap = page.getByRole('tab', { name: /Life Map|خريطة الحياة/ });
    await tabTo(page, lifeMap);
    await expect(lifeMap).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/life-map$/);

    const more = page.getByRole('tab', { name: /More|المزيد/ });
    await tabTo(page, more);
    await expect(more).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/settings$/);
    await expectNoHorizontalOverflow(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });

  test('premium-reference evidence surfaces render read-only across the responsive matrix', async ({ page }) => {
    const diagnostics = collectCriticalBrowserDiagnostics(page);
    await signInCompletedAccount(page);

    await expectPremiumReferenceSurfaces(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });

  test('recovery and scenario interactions remain usable while privacy export stays non-destructive', async ({ page }) => {
    const diagnostics = collectCriticalBrowserDiagnostics(page);
    await signInCompletedAccount(page);

    await page.goto('/recovery');
    await expect(page.getByText(/Save My Day|أنقذ يومي/, { exact: true })).toBeVisible();
    const nextRecoveryStep = page.getByRole('button', { name: /Next tiny step|الخطوة التالية/, exact: true });
    await expect(nextRecoveryStep).toBeVisible();
    await nextRecoveryStep.click();
    await expectNoHorizontalOverflow(page);

    await page.goto('/what-if');
    await expect(page.getByText(/Explore a choice without treating it as a prediction|جرّب قرارًا قبل أن تتعامل معه كتوقع/, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Short calm walk|مشي هادئ قصير/, exact: true }).click();
    await expect(page.getByText(/Take an easy walk for about 20 minutes|مشي مريح لمدة نحو 20 دقيقة/, { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/settings');
    await expect(page.getByText(/Shape MIZAN around your life|اضبط ميزان على حياتك، لا العكس/, { exact: true })).toBeVisible();
    await expect(page.getByText(/Notifications & reminders|الإشعارات والتذكيرات/, { exact: true })).toBeVisible();
    await expect(page.getByText(/Device notification delivery is not configured in this build yet|إرسال إشعارات الجهاز غير مهيأ في هذه النسخة بعد/)).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/privacy');
    await expect(page.getByText(/Privacy & data|الخصوصية والبيانات/, { exact: true })).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Create JSON file|إنشاء ملف JSON/, exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^mizan-data-\d{4}-\d{2}-\d{2}\.json$/);
    await expect(page.getByText(/Your data copy is ready\.|تم إعداد نسخة بياناتك\./, { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });

  test('daily check-in writes through the live account only when mutations are explicitly enabled', async ({ page }, testInfo) => {
    test.skip(!mutationsEnabled, 'Set MIZAN_E2E_MUTATIONS=1 only for a disposable or dedicated E2E account.');
    test.skip(testInfo.project.name !== 'desktop-light', mutationProjectReason);
    const diagnostics = collectCriticalBrowserDiagnostics(page);
    await signInCompletedAccount(page);

    await recordLowEnergyCheckIn(page);
    await expectNoHorizontalOverflow(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });

  test('explicit outcome feedback reaches Personal Learning through the live daily loop', async ({ page }, testInfo) => {
    test.skip(!mutationsEnabled, 'Set MIZAN_E2E_MUTATIONS=1 only for a disposable or dedicated E2E account.');
    test.skip(testInfo.project.name !== 'desktop-light', mutationProjectReason);
    const diagnostics = collectCriticalBrowserDiagnostics(page);
    await signInCompletedAccount(page);

    for (let index = 0; index < 3; index += 1) await recordLowEnergyCheckIn(page);

    await page.goto('/one-move');
    const accept = page.getByRole('button', { name: /I will do this|سأفعلها/, exact: true });
    await expect(accept).toBeVisible();
    await accept.click();
    await expect(page.getByText(/Accepted\. Completion alone will not be treated as evidence that it helped\.|تم تسجيل القبول\. لن نعتبر التنفيذ وحده دليلًا على الفائدة\./)).toBeVisible();

    await page.goto('/today');
    await expect(page.getByText(/Did the move help\?|هل ساعدتك الخطوة؟/, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Usefulness: 4 \/ 5|درجة الفائدة: 4 \/ 5/, exact: true }).click();
    const saveFeedback = page.getByRole('button', { name: /Save feedback|حفظ التقييم/, exact: true });
    await expect(saveFeedback).toBeEnabled();
    await saveFeedback.click();
    await expect(page.getByText(/Saved as explicit personal evidence|تم حفظ تقييمك كدليل شخصي صريح/)).toBeVisible();

    await page.goto('/personal-learning');
    await expect(page.getByText(/What has MIZAN learned from your experience\?|ما الذي تعلّمناه من تجربتك؟/, { exact: true })).toBeVisible();
    await expect(page.getByText(/Reported usefulness: 4\/5|الفائدة المسجلة: 4\/5/).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });

  test('optional Spiritual Grounding preference can toggle and restore on a dedicated live account', async ({ page }, testInfo) => {
    test.skip(!mutationsEnabled, 'Set MIZAN_E2E_MUTATIONS=1 only for a disposable or dedicated E2E account.');
    test.skip(testInfo.project.name !== 'desktop-light', mutationProjectReason);
    const diagnostics = collectCriticalBrowserDiagnostics(page);
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
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });
});

test.describe('live Arabic completed-account read-only journeys', () => {
  test.skip(!arabicCompletedAccountConfigured, arabicLiveReason);

  test('Arabic primary shell remains localized and overflow-free across the responsive matrix', async ({ page }) => {
    const diagnostics = collectCriticalBrowserDiagnostics(page);
    await signInArabicCompletedAccount(page);

    const navigation = page.getByRole('tablist');
    await expect(navigation).toBeVisible();
    await expect(page.getByRole('tab', { name: 'الرئيسية', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'خريطة الحياة', exact: true }).click();
    await expect(page).toHaveURL(/\/life-map$/);
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'خطوتي', exact: true }).click();
    await expect(page).toHaveURL(/\/one-move$/);
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'الرؤى', exact: true }).click();
    await expect(page).toHaveURL(/\/insights$/);
    await expectNoHorizontalOverflow(page);

    await page.getByRole('tab', { name: 'المزيد', exact: true }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByText('اضبط ميزان على حياتك، لا العكس', { exact: true })).toBeVisible();
    await expect(page.getByText('الإشعارات والتذكيرات', { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });

  test('Arabic premium-reference evidence surfaces stay localized and overflow-free', async ({ page }) => {
    const diagnostics = collectCriticalBrowserDiagnostics(page);
    await signInArabicCompletedAccount(page);

    await expectPremiumReferenceSurfaces(page);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });
});
