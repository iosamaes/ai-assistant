import fs from 'node:fs';
import path from 'node:path';

describe('Playwright live-mutation isolation policy', () => {
  test('stateful shared-account journeys execute only in desktop-light', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const productSpec = fs.readFileSync(path.join(repoRoot, 'tests', 'e2e', 'product-live.spec.ts'), 'utf8');
    const onboardingSpec = fs.readFileSync(path.join(repoRoot, 'tests', 'e2e', 'onboarding-live.spec.ts'), 'utf8');
    const notificationSpec = fs.readFileSync(
      path.join(repoRoot, 'tests', 'e2e', 'notification-preferences-live.spec.ts'),
      'utf8',
    );

    const productGuards = productSpec.match(/testInfo\.project\.name !== 'desktop-light'/g) ?? [];
    expect(productGuards).toHaveLength(3);
    expect(onboardingSpec).toContain("testInfo.project.name !== 'desktop-light'");
    expect(onboardingSpec).toContain('test.skip(mutationsEnabled');
    expect(notificationSpec).toContain("testInfo.project.name !== 'desktop-light'");
    expect(notificationSpec).toContain('test.skip(!mutationsEnabled');
  });

  test('irreversible deletion remains isolated, explicitly opted in, and dedicated-fixture only', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const deletionSpec = fs.readFileSync(
      path.join(repoRoot, 'tests', 'e2e', 'account-deletion-live.spec.ts'),
      'utf8',
    );

    expect(deletionSpec).toContain("const destructiveProject = 'desktop-light'");
    expect(deletionSpec).toContain("process.env.MIZAN_E2E_DESTRUCTIVE === '1'");
    expect(deletionSpec).toContain('protectedFixtureEmails.includes');
    expect(deletionSpec).toContain('MIZAN_E2E_DELETE_EMAIL must be a dedicated disposable account');
    expect(deletionSpec).toContain('expect(mismatchDeletion.status()).toBe(409)');
    expect(deletionSpec).toContain("toMatchObject({ error: 'account_changed' })");
    expect(deletionSpec).toContain('expect(reauthentication.status()).toBe(400)');
  });
});
