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

  test('onboarding mutation uses a disposable fixture and the mutation command cannot silently skip it', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    const onboardingSpec = fs.readFileSync(path.join(repoRoot, 'tests', 'e2e', 'onboarding-live.spec.ts'), 'utf8');
    const liveAccount = fs.readFileSync(path.join(repoRoot, 'tests', 'e2e', 'live-account.ts'), 'utf8');
    const mutationRunner = fs.readFileSync(path.join(repoRoot, 'scripts', 'run-e2e-mutations.mjs'), 'utf8');
    const baselineRunner = fs.readFileSync(path.join(repoRoot, 'scripts', 'run-release-baseline.mjs'), 'utf8');

    expect(packageJson.scripts?.['test:e2e:mutations']).toBe('node scripts/run-e2e-mutations.mjs');
    expect(liveAccount).toContain('MIZAN_E2E_ONBOARDING_MUTATION_EMAIL');
    expect(liveAccount).toContain('MIZAN_E2E_ONBOARDING_MUTATION_PASSWORD');
    expect(onboardingSpec).toContain('signInOnboardingMutationAccount');
    expect(onboardingSpec).toContain('mutationEmail === readOnlyEmail');
    expect(onboardingSpec).toContain(
      'MIZAN_E2E_ONBOARDING_MUTATION_EMAIL must be separate from the reusable MIZAN_E2E_ONBOARDING_EMAIL fixture.',
    );
    expect(mutationRunner).toContain("MIZAN_E2E_MUTATIONS: '1'");
    expect(mutationRunner).toContain("'MIZAN_E2E_ONBOARDING_MUTATION_EMAIL'");
    expect(mutationRunner).toContain("'MIZAN_E2E_ONBOARDING_MUTATION_PASSWORD'");
    expect(mutationRunner).toContain("'MIZAN_E2E_COMPLETED_EMAIL'");
    expect(mutationRunner).toContain("'MIZAN_E2E_COMPLETED_PASSWORD'");
    expect(mutationRunner).toContain("'MIZAN_E2E_DELETE_EMAIL'");
    expect(mutationRunner).toContain('missingVariables.length > 0');
    expect(mutationRunner).toContain('protectedFixtureEmailVariables');
    expect(mutationRunner).toContain('reusedFixtureVariables.length > 0');
    expect(mutationRunner).toContain("'tests/e2e/onboarding-live.spec.ts'");
    expect(mutationRunner).toContain("'--project=desktop-light'");
    expect(baselineRunner).not.toContain("'MIZAN_E2E_ONBOARDING_MUTATION_EMAIL'");
    expect(baselineRunner).not.toContain("'MIZAN_E2E_ONBOARDING_MUTATION_PASSWORD'");
  });

  test('key plugin mutation proves persistence and restoration across document reload', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const productSpec = fs.readFileSync(path.join(repoRoot, 'tests', 'e2e', 'product-live.spec.ts'), 'utf8');

    expect(productSpec).toContain(
      'optional Spiritual Grounding preference persists across reload and restores on a dedicated live account',
    );
    expect(productSpec).toContain("testInfo.project.name !== 'desktop-light'");
    expect(productSpec).toContain('test.skip(!mutationsEnabled');
    expect(productSpec).toContain(
      "await page.reload();\n    await expect(settingsTitle).toBeVisible();\n    await expect(target).toHaveAttribute('aria-selected', 'true');",
    );
    expect(productSpec).toContain(
      "await page.reload();\n    await expect(settingsTitle).toBeVisible();\n    await expect(original).toHaveAttribute('aria-selected', 'true');",
    );
  });

  test('irreversible deletion remains isolated, explicitly opted in, dedicated-fixture only, and contract-confirming', () => {
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
    expect(deletionSpec).toContain('expect(deletionResponse.status()).toBe(200)');
    expect(deletionSpec).toContain("expect(await deletionResponse.json()).toMatchObject({ ok: true })");
    expect(deletionSpec).toContain('expect(reauthentication.status()).toBe(400)');
  });

  test('development and production matrices keep export evidence isolated and target only the authorized Supabase project with public client credentials', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const defaultConfig = fs.readFileSync(path.join(repoRoot, 'playwright.config.ts'), 'utf8');
    const productionConfig = fs.readFileSync(path.join(repoRoot, 'playwright.production.config.ts'), 'utf8');
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };

    expect(defaultConfig).toContain("testIgnore: ['**/production-web.spec.ts', '**/production-performance.spec.ts']");
    for (const config of [defaultConfig, productionConfig]) {
      expect(config).toContain("const authorizedSupabaseProjectRef = 'olfhjnropdrnujgpidfi'");
      expect(config).toContain('assertAuthorizedLiveSupabaseUrl(liveSupabaseUrl)');
      expect(config).toContain("configuredUrl.protocol !== 'https:'");
      expect(config).toContain('configuredProjectRef !== authorizedSupabaseProjectRef');
      expect(config).toContain('assertUnprivilegedSupabaseClientKey(liveSupabasePublishableKey)');
      expect(config).toContain("key.startsWith('sb_secret_')");
      expect(config).toContain("payload.role === 'service_role'");
    }
    expect(packageJson.scripts?.['test:e2e:production']).toContain('production-web.spec.ts');
    expect(packageJson.scripts?.['test:e2e:production']).toContain('--config=playwright.production.config.ts');
    expect(packageJson.scripts?.['test:e2e:production:performance']).toBe(
      'node scripts/run-e2e-production-performance.mjs',
    );
  });

  test('aggregate release baseline is fail-closed for opt-in modes, live fixtures, and Supabase authority', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    const runner = fs.readFileSync(path.join(repoRoot, 'scripts', 'run-release-baseline.mjs'), 'utf8');

    expect(packageJson.scripts?.['check:release:baseline']).toBe('node scripts/run-release-baseline.mjs');
    expect(runner).toContain("const isWindows = process.platform === 'win32'");
    expect(runner).toContain("const npmCommand = isWindows ? 'npm.cmd' : 'npm'");
    expect(runner).toContain('shell: isWindows');
    expect(runner).toContain("const authorizedSupabaseProjectRef = 'olfhjnropdrnujgpidfi'");
    expect(runner).toContain("const hostedSuffix = '.supabase.co'");
    expect(runner).toContain("configuredUrl.protocol !== 'https:'");
    expect(runner).toContain('configuredUrl.hostname.endsWith(hostedSuffix)');
    expect(runner).toContain('configuredProjectRef !== authorizedSupabaseProjectRef');
    expect(runner).toContain('Release baseline is authorized only for Supabase project');
    expect(runner).toContain('usesPrivilegedSupabaseKey(env.MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY)');
    expect(runner).toContain("key.startsWith('sb_secret_')");
    expect(runner).toContain("payload?.role === 'service_role'");
    expect(runner).toContain('Secret and service-role keys are rejected');
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
