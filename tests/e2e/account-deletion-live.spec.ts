import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import {
  collectCriticalBrowserDiagnostics,
  expectNoCriticalBrowserDiagnostics,
  expectNoHorizontalOverflow,
} from './browser-assertions';
import {
  liveSupabaseConfigured,
  signInWithCredentials,
} from './live-account';

const deletionAccountConfigured = Boolean(
  liveSupabaseConfigured &&
    process.env.MIZAN_E2E_DELETE_EMAIL &&
    process.env.MIZAN_E2E_DELETE_PASSWORD,
);
const destructiveDeletionEnabled = process.env.MIZAN_E2E_DESTRUCTIVE === '1';
const liveReason =
  'Requires live Supabase configuration, a dedicated completed deletion account, and MIZAN_E2E_DESTRUCTIVE=1.';
const destructiveProject = 'desktop-light';
const mismatchedUserId = '00000000-0000-0000-0000-000000000000';

test.describe('destructive account deletion', () => {
  test.skip(!(deletionAccountConfigured && destructiveDeletionEnabled), liveReason);

  test('deletes only the dedicated account and clears its app-owned Web caches', async ({ page, request }, testInfo) => {
    test.skip(
      testInfo.project.name !== destructiveProject,
      `Destructive deletion runs once in ${destructiveProject} so the disposable account is not reused across responsive projects.`,
    );

    const email = process.env.MIZAN_E2E_DELETE_EMAIL;
    const password = process.env.MIZAN_E2E_DELETE_PASSWORD;
    const supabaseUrl = process.env.MIZAN_E2E_SUPABASE_URL;
    const publishableKey = process.env.MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY;
    if (!email || !password || !supabaseUrl || !publishableKey) {
      throw new Error('Destructive deletion E2E configuration is incomplete.');
    }
    const baseUrl = supabaseUrl.replace(/\/$/, '');
    const passwordGrantUrl = `${baseUrl}/auth/v1/token?grant_type=password`;

    const diagnostics = collectCriticalBrowserDiagnostics(page);
    const dialogs: string[] = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    await signInWithCredentials(page, email, password);
    await expect(page).toHaveURL(/\/today$/);
    await page.goto('/privacy');
    await expect(page.getByText(/Privacy & data|الخصوصية والبيانات/, { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Create JSON file|إنشاء ملف JSON/, exact: true }).click();
    const download = await downloadPromise;
    const downloadedPath = await download.path();
    if (!downloadedPath) throw new Error('Portable export did not expose a readable download path.');
    const exported = JSON.parse(await readFile(downloadedPath, 'utf8')) as { user_id?: unknown };
    expect(typeof exported.user_id).toBe('string');
    const userId = exported.user_id as string;

    const preDeletionAuthentication = await request.post(passwordGrantUrl, {
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
      },
      data: { email, password },
    });
    expect(preDeletionAuthentication.ok()).toBe(true);
    const authPayload = (await preDeletionAuthentication.json()) as {
      access_token?: unknown;
      user?: { id?: unknown };
    };
    expect(typeof authPayload.access_token).toBe('string');
    expect(authPayload.user?.id).toBe(userId);

    const mismatchDeletion = await request.post(`${baseUrl}/functions/v1/delete-account`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${authPayload.access_token as string}`,
        'Content-Type': 'application/json',
      },
      data: {
        confirmation: 'DELETE',
        expected_user_id: mismatchedUserId,
      },
    });
    expect(mismatchDeletion.status()).toBe(409);
    expect(await mismatchDeletion.json()).toMatchObject({ error: 'account_changed' });

    const authenticationAfterMismatch = await request.post(passwordGrantUrl, {
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
      },
      data: { email, password },
    });
    expect(authenticationAfterMismatch.ok()).toBe(true);

    await page.evaluate(({ activeUserId }) => {
      const createdAt = new Date().toISOString();
      localStorage.setItem(
        `mizan.pending-user-mutations.v2.${activeUserId}.0`,
        JSON.stringify({
          id: 'e2e-delete-sentinel',
          userId: activeUserId,
          kind: 'check-in',
          createdAt,
          observations: [],
        }),
      );
      localStorage.setItem(
        `mizan.recent-daily-snapshot.v1.${activeUserId}`,
        JSON.stringify({ version: 1, cachedAt: createdAt, payload: { e2eDeletionSentinel: true } }),
      );
    }, { activeUserId: userId });

    await page.getByRole('button', { name: /Start account deletion|بدء حذف الحساب/, exact: true }).click();
    await expect(page.getByText(/Confirm permanent deletion|تأكيد الحذف النهائي/, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Delete permanently|حذف نهائي/, exact: true }).click();
    await page.waitForURL(/\/auth$/);

    const cacheState = await page.evaluate(({ deletedUserId }) => ({
      pending: localStorage.getItem(`mizan.pending-user-mutations.v2.${deletedUserId}.0`),
      snapshot: localStorage.getItem(`mizan.recent-daily-snapshot.v1.${deletedUserId}`),
    }), { deletedUserId: userId });
    expect(cacheState).toEqual({ pending: null, snapshot: null });
    expect(dialogs).toEqual([]);

    const reauthentication = await request.post(passwordGrantUrl, {
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
      },
      data: { email, password },
    });
    expect(reauthentication.status()).toBe(400);

    expectNoCriticalBrowserDiagnostics(diagnostics);
  });
});
