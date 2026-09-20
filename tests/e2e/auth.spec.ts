import { expect, test, type Page } from '@playwright/test';

import {
  collectCriticalBrowserDiagnostics,
  expectNoCriticalBrowserDiagnostics,
  expectNoHorizontalOverflow,
  tabTo,
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
  await expect(page.getByLabel('كلمة المرور', { exact: true })).toBeVisible();
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
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('person@example.com');
  await page.getByLabel('Password', { exact: true }).fill('123456');
  await expect(actionButton(page, 'Sign in')).toBeEnabled();
  expectNoCriticalBrowserDiagnostics(diagnostics);
});

test('primary auth controls are reachable and operable with keyboard navigation', async ({ page }) => {
  const diagnostics = collectCriticalBrowserDiagnostics(page);
  await page.goto('/auth');

  const english = page.getByRole('button', { name: 'English', exact: true });
  await tabTo(page, english);
  await expect(english).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Enter your personal space')).toBeVisible();

  const email = page.getByRole('textbox', { name: 'Email', exact: true });
  await tabTo(page, email);
  await expect(email).toBeFocused();
  await page.keyboard.type('keyboard@example.com');

  const password = page.getByLabel('Password', { exact: true });
  await tabTo(page, password);
  await expect(password).toBeFocused();
  await page.keyboard.type('123456');

  const submit = actionButton(page, 'Sign in');
  await expect(submit).toBeEnabled();
  await tabTo(page, submit);
  await expect(submit).toBeFocused();
  await expectNoHorizontalOverflow(page);
  expectNoCriticalBrowserDiagnostics(diagnostics);
});

test('password-reset mode changes the form without navigation or overflow', async ({ page }) => {
  const diagnostics = collectCriticalBrowserDiagnostics(page);
  await page.goto('/auth');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByText('Enter your personal space')).toBeVisible();
  await page.getByRole('button', { name: 'Forgot password', exact: true }).click();

  await expect(page.getByLabel('Password', { exact: true })).toHaveCount(0);
  await expect(actionButton(page, 'Send recovery link')).toBeDisabled();
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('person@example.com');
  await expect(actionButton(page, 'Send recovery link')).toBeEnabled();
  await expectNoHorizontalOverflow(page);
  expectNoCriticalBrowserDiagnostics(diagnostics);
});
