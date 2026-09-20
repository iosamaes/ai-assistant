import { expect, type Page } from '@playwright/test';

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
