import { expect, test, type Page, type TestInfo } from '@playwright/test';

import {
  collectCriticalBrowserDiagnostics,
  expectNoCriticalBrowserDiagnostics,
  expectNoHorizontalOverflow,
} from './browser-assertions';
import {
  arabicCompletedAccountConfigured,
  completedAccountConfigured,
  signInArabicCompletedAccount,
  signInCompletedAccount,
} from './live-account';

const visualEvidenceEnabled = process.env.MIZAN_E2E_VISUAL_EVIDENCE === '1';
const liveReason = 'Requires live Supabase configuration plus completed-account credentials.';
const arabicLiveReason = 'Requires live Supabase configuration plus a completed account whose persisted MIZAN locale is Arabic.';
const evidenceReason = 'Set MIZAN_E2E_VISUAL_EVIDENCE=1 only when intentionally capturing CP9 runtime visual evidence.';

const representativeSurfaces = [
  { name: 'today', path: '/today' },
  { name: 'life-map', path: '/life-map' },
  { name: 'why', path: '/why' },
  { name: 'check-in', path: '/check-in' },
] as const;

async function captureRepresentativeSurfaces(page: Page, testInfo: TestInfo, locale: 'en' | 'ar') {
  const diagnostics = collectCriticalBrowserDiagnostics(page);

  for (const surface of representativeSurfaces) {
    await page.goto(surface.path);
    await expect(page).toHaveURL(new RegExp(`${surface.path.replace('/', '\\/')}$`));
    await expect(page.getByRole('tablist')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const attachmentName = `cp9-${locale}-${testInfo.project.name}-${surface.name}`;
    const screenshotPath = testInfo.outputPath(`${attachmentName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
    await testInfo.attach(attachmentName, { path: screenshotPath, contentType: 'image/png' });
  }

  expectNoCriticalBrowserDiagnostics(diagnostics);
}

test.describe('CP9 runtime visual evidence capture', () => {
  test.skip(!visualEvidenceEnabled, evidenceReason);

  test('English representative surfaces are captured across the configured responsive and appearance matrix', async ({ page }, testInfo) => {
    test.skip(!completedAccountConfigured, liveReason);
    await signInCompletedAccount(page);
    await captureRepresentativeSurfaces(page, testInfo, 'en');
  });

  test('Arabic representative surfaces are captured across the configured responsive and appearance matrix', async ({ page }, testInfo) => {
    test.skip(!arabicCompletedAccountConfigured, arabicLiveReason);
    await signInArabicCompletedAccount(page);
    await captureRepresentativeSurfaces(page, testInfo, 'ar');
  });
});
