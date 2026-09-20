import { expect, test, type Page } from '@playwright/test';

import {
  collectCriticalBrowserDiagnostics,
  expectNoCriticalBrowserDiagnostics,
  expectNoHorizontalOverflow,
} from './browser-assertions';
import { completedAccountConfigured, signInEnglishCompletedAccount } from './live-account';

const performanceEnabled = process.env.MIZAN_E2E_PERFORMANCE === '1';
const liveReason =
  'Requires MIZAN_E2E_PERFORMANCE=1 plus live Supabase client configuration and the persisted-English completed account.';
const projectReason =
  'Production performance sanity runs once in production-desktop-dark to avoid multiplying timing noise across smoke projects.';

// Deliberately broad release tripwires, not product SLOs. They are intended to expose
// obviously blocked startup/navigation in the actual Expo static export before release.
const AUTH_READY_BUDGET_MS = 15_000;
const ROUTE_READY_BUDGET_MS = 5_000;
const LONG_TASK_BUDGET_MS = 1_000;

type TimingSample = {
  label: string;
  durationMs: number;
};

type BrowserPerformanceSnapshot = {
  navigation: {
    domContentLoadedMs: number | null;
    loadMs: number | null;
  };
  resources: {
    count: number;
    transferBytes: number;
    encodedBytes: number;
    largestEncodedBytes: number;
  };
  longTasksMs: number[];
};

async function installLongTaskObserver(page: Page) {
  await page.addInitScript(() => {
    const performanceWindow = window as typeof window & { __mizanLongTasksMs?: number[] };
    performanceWindow.__mizanLongTasksMs = [];

    if (
      typeof PerformanceObserver !== 'undefined' &&
      PerformanceObserver.supportedEntryTypes?.includes('longtask')
    ) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) performanceWindow.__mizanLongTasksMs?.push(entry.duration);
      });
      observer.observe({ entryTypes: ['longtask'] });
    }
  });
}

async function measure(label: string, action: () => Promise<void>): Promise<TimingSample> {
  const startedAt = Date.now();
  await action();
  return { label, durationMs: Date.now() - startedAt };
}

async function readBrowserPerformanceSnapshot(page: Page): Promise<BrowserPerformanceSnapshot> {
  return page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const performanceWindow = window as typeof window & { __mizanLongTasksMs?: number[] };

    return {
      navigation: {
        domContentLoadedMs: navigation ? Math.round(navigation.domContentLoadedEventEnd) : null,
        loadMs: navigation ? Math.round(navigation.loadEventEnd) : null,
      },
      resources: {
        count: resources.length,
        transferBytes: Math.round(resources.reduce((sum, entry) => sum + entry.transferSize, 0)),
        encodedBytes: Math.round(resources.reduce((sum, entry) => sum + entry.encodedBodySize, 0)),
        largestEncodedBytes: Math.round(resources.reduce((largest, entry) => Math.max(largest, entry.encodedBodySize), 0)),
      },
      longTasksMs: (performanceWindow.__mizanLongTasksMs ?? []).map((duration) => Math.round(duration)),
    };
  });
}

test.describe('production static-export performance sanity', () => {
  test.skip(!performanceEnabled || !completedAccountConfigured, liveReason);

  test('records authenticated startup and primary-route responsiveness from exported files', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'production-desktop-dark', projectReason);

    await installLongTaskObserver(page);
    const diagnostics = collectCriticalBrowserDiagnostics(page);
    const samples: TimingSample[] = [];

    samples.push(
      await measure('production-auth-to-English-Home-ready', async () => {
        await signInEnglishCompletedAccount(page);
        await expect(page.getByRole('tablist')).toBeVisible();
      }),
    );
    await expectNoHorizontalOverflow(page);

    const routeCases = [
      { label: 'production-Home-to-Life-Map', tab: 'Life Map', path: /\/life-map$/ },
      { label: 'production-Life-Map-to-One-Move', tab: 'One Move', path: /\/one-move$/ },
      { label: 'production-One-Move-to-Insights', tab: 'Insights', path: /\/insights$/ },
      { label: 'production-Insights-to-More', tab: 'More', path: /\/settings$/ },
    ] as const;

    for (const route of routeCases) {
      const target = page.getByRole('tab', { name: route.tab, exact: true });
      samples.push(
        await measure(route.label, async () => {
          await target.click();
          await expect(page).toHaveURL(route.path);
          await expect(target).toHaveAttribute('aria-selected', 'true');
        }),
      );
      await expectNoHorizontalOverflow(page);
    }

    const browser = await readBrowserPerformanceSnapshot(page);
    const report = {
      runtime: 'expo-static-export',
      project: testInfo.project.name,
      budgets: {
        authReadyMs: AUTH_READY_BUDGET_MS,
        routeReadyMs: ROUTE_READY_BUDGET_MS,
        maxLongTaskMs: LONG_TASK_BUDGET_MS,
      },
      samples,
      browser,
    };

    await testInfo.attach('production-performance-sanity.json', {
      body: JSON.stringify(report, null, 2),
      contentType: 'application/json',
    });

    expect(samples[0]?.durationMs, 'production authenticated Home readiness exceeded the broad sanity budget').toBeLessThanOrEqual(
      AUTH_READY_BUDGET_MS,
    );
    for (const sample of samples.slice(1)) {
      expect(sample.durationMs, `${sample.label} exceeded the broad production route sanity budget`).toBeLessThanOrEqual(
        ROUTE_READY_BUDGET_MS,
      );
    }
    expect(
      Math.max(0, ...browser.longTasksMs),
      'a production-export browser long task exceeded the broad main-thread sanity budget',
    ).toBeLessThanOrEqual(LONG_TASK_BUDGET_MS);
    expectNoCriticalBrowserDiagnostics(diagnostics);
  });
});
