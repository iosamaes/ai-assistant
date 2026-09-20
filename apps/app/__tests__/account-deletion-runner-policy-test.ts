import fs from 'node:fs';
import path from 'node:path';

describe('destructive account-deletion runner policy', () => {
  test('the public command is fail-closed before Playwright and protects every reusable mutation fixture', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    const runner = fs.readFileSync(path.join(repoRoot, 'scripts', 'run-e2e-delete-account.mjs'), 'utf8');
    const deletionSpec = fs.readFileSync(
      path.join(repoRoot, 'tests', 'e2e', 'account-deletion-live.spec.ts'),
      'utf8',
    );

    expect(packageJson.scripts?.['test:e2e:delete-account']).toBe('node scripts/run-e2e-delete-account.mjs');
    expect(runner).toContain("'MIZAN_E2E_SUPABASE_URL'");
    expect(runner).toContain("'MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY'");
    expect(runner).toContain("'MIZAN_E2E_DELETE_EMAIL'");
    expect(runner).toContain("'MIZAN_E2E_DELETE_PASSWORD'");
    expect(runner).toContain('missingVariables.length > 0');
    expect(runner).toContain("env.MIZAN_E2E_DESTRUCTIVE !== '1'");
    expect(runner).toContain("'MIZAN_E2E_COMPLETED_EMAIL'");
    expect(runner).toContain("'MIZAN_E2E_ARABIC_EMAIL'");
    expect(runner).toContain("'MIZAN_E2E_ONBOARDING_EMAIL'");
    expect(runner).toContain("'MIZAN_E2E_ONBOARDING_MUTATION_EMAIL'");
    expect(runner).toContain('reusedFixtureVariables.length > 0');
    expect(runner).toContain("'tests/e2e/account-deletion-live.spec.ts'");
    expect(runner).toContain("'--project=desktop-light'");

    expect(deletionSpec).toContain('process.env.MIZAN_E2E_ONBOARDING_MUTATION_EMAIL');
    expect(deletionSpec).toContain('protectedFixtureEmails.includes');
    expect(deletionSpec).toContain('onboarding-mutation fixture');
  });
});
