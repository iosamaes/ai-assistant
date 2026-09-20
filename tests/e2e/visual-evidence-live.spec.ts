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
  signInEnglishCompletedAccount,
} from './live-account';

const visualEvidenceEnabled = process.env.MIZAN_E2E_VISUAL_EVIDENCE === '1';
const liveReason = 'Requires live Supabase configuration plus a completed account whose persisted MIZAN locale is English.';
const arabicLiveReason = 'Requires live Supabase configuration plus a completed account whose persisted MIZAN locale is Arabic.';
const evidenceReason = 'Set MIZAN_E2E_VISUAL_EVIDENCE=1 only when intentionally capturing CP9 runtime visual evidence.';

type VisualEvidenceLocale = 'en' | 'ar';
type LocalizedPattern = Readonly<Record<VisualEvidenceLocale, RegExp>>;

type RepresentativeSurface = {
  name: string;
  path: '/today' | '/life-map' | '/why' | '/check-in';
  readyText: LocalizedPattern;
  loadingText?: LocalizedPattern;
  errorText?: LocalizedPattern;
  prepareInteraction?: (page: Page, locale: VisualEvidenceLocale) => Promise<void>;
};

async function prepareCheckInInteraction(page: Page, locale: VisualEvidenceLocale) {
  const energyThree = page.getByRole('button', {
    name: locale === 'ar' ? 'الطاقة: 3' : 'Energy: 3',
    exact: true,
  });
  await energyThree.click();
  await expect(energyThree).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: locale === 'ar' ? 'حفظ التسجيل' : 'Save check-in', exact: true })).toBeEnabled();
}

const representativeSurfaces: readonly RepresentativeSurface[] = [
  {
    name: 'today',
    path: '/today',
    readyText: {
      en: /^Your calm space for today$/,
      ar: /^مساحتك الهادئة لليوم$/,
    },
    loadingText: {
      en: /^Loading your state…$/,
      ar: /^جارٍ تحميل حالتك…$/,
    },
    errorText: {
      en: /^Your current state could not be loaded right now\.$/,
      ar: /^تعذر تحميل صورتك الحالية الآن\.$/,
    },
  },
  {
    name: 'life-map',
    path: '/life-map',
    readyText: {
      en: /^Life map$/,
      ar: /^خريطة الحياة$/,
    },
    loadingText: {
      en: /^Reading your history…$/,
      ar: /^جاري قراءة تاريخك…$/,
    },
    errorText: {
      en: /^The life map could not be loaded right now\. Missing data was not replaced with estimates\.$/,
      ar: /^تعذر تحميل خريطة الحياة الآن\. لم يتم استبدال البيانات الناقصة بتقديرات\.$/,
    },
  },
  {
    name: 'why',
    path: '/why',
    readyText: {
      en: /^Why might I feel off\?$/,
      ar: /^لماذا قد أشعر أنني لست على ما يرام؟$/,
    },
    loadingText: {
      en: /^Reviewing available evidence…$/,
      ar: /^جاري فحص الأدلة المتاحة…$/,
    },
    errorText: {
      en: /^The evidence could not be read right now\. MIZAN did not generate a substitute explanation or fill in missing data\.$/,
      ar: /^تعذر قراءة الأدلة الآن\. لم يتم إنشاء تفسير بديل أو افتراض بيانات مفقودة\.$/,
    },
  },
  {
    name: 'check-in',
    path: '/check-in',
    readyText: {
      en: /^Quick check-in$/,
      ar: /^تسجيل سريع$/,
    },
    prepareInteraction: prepareCheckInInteraction,
  },
];

async function waitForStableVisualSurface(page: Page, surface: RepresentativeSurface, locale: VisualEvidenceLocale) {
  await expect(page.getByText(surface.readyText[locale], { exact: true }).first()).toBeVisible();

  if (surface.loadingText) {
    await expect(page.getByText(surface.loadingText[locale], { exact: true })).toHaveCount(0);
  }

  if (surface.errorText) {
    await expect(page.getByText(surface.errorText[locale], { exact: true })).toHaveCount(0);
  }

  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function captureRepresentativeSurfaces(page: Page, testInfo: TestInfo, locale: VisualEvidenceLocale) {
  const diagnostics = collectCriticalBrowserDiagnostics(page);

  for (const surface of representativeSurfaces) {
    await page.goto(surface.path);
    await expect(page).toHaveURL(new RegExp(`${surface.path.replace('/', '\\/')}$`));
    await expect(page.getByRole('tablist')).toBeVisible();
    await waitForStableVisualSurface(page, surface, locale);
    if (surface.prepareInteraction) await surface.prepareInteraction(page, locale);
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
    await signInEnglishCompletedAccount(page);
    await captureRepresentativeSurfaces(page, testInfo, 'en');
  });

  test('Arabic representative surfaces are captured across the configured responsive and appearance matrix', async ({ page }, testInfo) => {
    test.skip(!arabicCompletedAccountConfigured, arabicLiveReason);
    await signInArabicCompletedAccount(page);
    await captureRepresentativeSurfaces(page, testInfo, 'ar');
  });
});
