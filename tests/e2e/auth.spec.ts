import { expect, test, type Page } from '@playwright/test';

import {
  collectCriticalBrowserDiagnostics,
  expectNoCriticalBrowserDiagnostics,
  expectNoHorizontalOverflow,
} from './browser-assertions';

function actionButton(page: Page, name: string) {
  return page.getByRole('button', { name, exact: true }).last();
}

test('signed-out routes are guarded back to auth without runtime exceptions', async ({ page }) => {
  const diagnostics = collectCriticalBrowserDiagnostics(page);

  await page.goto('/today');
  await page.waitForURL('**/auth');
  await expect(page.getByText('ادخل إلى مساحتك الشخصية')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'البريد الإلكتروني', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'كلمة المرور', exact: true })).toBeVisible();
  expectNoCriticalBrowserDiagnostics(diagnostics);
});

test('auth layout remains usable at the project viewport and switches locale', async ({ page }) => {
  const diagnostics = collectCriticalBrowserDiagnostics(page);
  await page.goto('/auth');
  await expect(actionButton(page, 'تسجيل الدخول')).toBeDisabled();
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByText('Enter your personal space')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('person@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('123456');
  await expect(actionButton(page, 'Sign in')).toBeEnabled();
  expectNoCriticalBrowserDiagnostics(diagnostics);
});

test('password-reset mode changes the form without navigation or overflow', async ({ page }) => {
  const diagnostics = collectCriticalBrowserDiagnostics(page);
  await page.goto('/auth');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByText('Enter your personal space')).toBeVisible();
  await page.getByRole('button', { name: 'Forgot password', exact: true }).click();

  await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveCount(0);
  await expect(actionButton(page, 'Send recovery link')).toBeDisabled();
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('person@example.com');
  await expect(actionButton(page, 'Send recovery link')).toBeEnabled();
  await expectNoHorizontalOverflow(page);
  expectNoCriticalBrowserDiagnostics(diagnostics);
});
