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

  test('aggregate release baseline is fail-closed for opt-in modes and required live fixtures', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    const runner = fs.readFileSync(path.join(repoRoot, 'scripts', 'run-release-baseline.mjs'), 'utf8');

    expect(packageJson.scripts?.['check:release:baseline']).toBe('node scripts/run-release-baseline.mjs');
    expect(runner).toContain("const isWindows = process.platform === 'win32'");
    expect(runner).toContain("const npmCommand = isWindows ? 'npm.cmd' : 'npm'");
    expect(runner).toContain('shell: isWindows');
    expect(runner).toContain("'MIZAN_E2E_MUTATIONS'");
    expect(runner).toContain("'MIZAN_E2E_DESTRUCTIVE'");
    expect(runner).toContain("'MIZAN_E2E_VISUAL_EVIDENCE'");
    expect(runner).toContain("'MIZAN_E2E_PERFORMANCE'");
    expect(runner).toContain('delete env[flag]');
    expect(runner).toContain("'MIZAN_E2E_SUPABASE_URL'");
    expect(runner).toContain("'MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY'");
    expect(runner).toContain("'MIZAN_E2E_COMPLETED_EMAIL'");
    expect(runner).toContain("'MIZAN_E2E_COMPLETED_PASSWORD'");
    expect(runner).toContain("'MIZAN_E2E_ARABIC_EMAIL'");
    expect(runner).toContain("'MIZAN_E2E_ARABIC_PASSWORD'");
    expect(runner).toContain("'MIZAN_E2E_ONBOARDING_EMAIL'");
    expect(runner).toContain("'MIZAN_E2E_ONBOARDING_PASSWORD'");
    expect(runner).toContain('missingBaselineVariables.length > 0');
    expect(runner).toContain('Release baseline cannot provide required live E2E evidence');
    expect(runner).toContain('const distinctBaselineFixtureEmailVariables');
    expect(runner).toContain('fixtureVariableByNormalizedEmail');
    expect(runner).toContain('.trim().toLowerCase()');
    expect(runner).toContain('duplicateFixtureVariablePairs.length > 0');
    expect(runner).toContain('Release baseline requires distinct completed-English, completed-Arabic, and incomplete-onboarding accounts');
    expect(runner).toContain("const scripts = ['check', 'test:db', 'lint:db', 'test:e2e', 'test:e2e:production'];");
    expect(runner).not.toContain('test:e2e:mutations');
    expect(runner).not.toContain('test:e2e:delete-account');
  });
});
