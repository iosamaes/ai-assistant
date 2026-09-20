import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const playwrightCommand = isWindows ? 'playwright.cmd' : 'playwright';
const requiredVariables = [
  'MIZAN_E2E_SUPABASE_URL',
  'MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY',
  'MIZAN_E2E_DELETE_EMAIL',
  'MIZAN_E2E_DELETE_PASSWORD',
];
const protectedFixtureEmailVariables = [
  'MIZAN_E2E_COMPLETED_EMAIL',
  'MIZAN_E2E_COMPLETED_MUTATION_EMAIL',
  'MIZAN_E2E_ARABIC_EMAIL',
  'MIZAN_E2E_ONBOARDING_EMAIL',
  'MIZAN_E2E_ONBOARDING_MUTATION_EMAIL',
];

const env = { ...process.env };
const missingVariables = requiredVariables.filter((name) => !env[name]?.trim());
if (missingVariables.length > 0) {
  console.error(
    `Destructive account-deletion E2E cannot provide the required evidence. Missing environment variables: ${missingVariables.join(', ')}`,
  );
  process.exit(1);
}

if (env.MIZAN_E2E_DESTRUCTIVE !== '1') {
  console.error('Destructive account-deletion E2E requires the explicit opt-in MIZAN_E2E_DESTRUCTIVE=1.');
  process.exit(1);
}

const deletionEmail = env.MIZAN_E2E_DELETE_EMAIL.trim().toLowerCase();
const reusedFixtureVariables = protectedFixtureEmailVariables.filter(
  (name) => env[name]?.trim().toLowerCase() === deletionEmail,
);
if (reusedFixtureVariables.length > 0) {
  console.error(
    `MIZAN_E2E_DELETE_EMAIL must be a dedicated disposable account. It matches protected fixture variables: ${reusedFixtureVariables.join(', ')}`,
  );
  process.exit(1);
}

console.log(
  'Destructive account-deletion E2E is fail-closed: required configuration is present, explicit destructive opt-in is enabled, and the deletion account is not a protected fixture.',
);
const result = spawnSync(
  playwrightCommand,
  ['test', 'tests/e2e/account-deletion-live.spec.ts', '--project=desktop-light'],
  {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
    shell: isWindows,
  },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

console.log('Destructive account-deletion E2E completed for the dedicated disposable fixture.');
