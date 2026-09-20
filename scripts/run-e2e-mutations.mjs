import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const playwrightCommand = isWindows ? 'playwright.cmd' : 'playwright';
const requiredVariables = [
  'MIZAN_E2E_SUPABASE_URL',
  'MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY',
  'MIZAN_E2E_COMPLETED_EMAIL',
  'MIZAN_E2E_COMPLETED_PASSWORD',
  'MIZAN_E2E_ONBOARDING_MUTATION_EMAIL',
  'MIZAN_E2E_ONBOARDING_MUTATION_PASSWORD',
];
const protectedReusableEmailVariables = [
  'MIZAN_E2E_COMPLETED_EMAIL',
  'MIZAN_E2E_ARABIC_EMAIL',
  'MIZAN_E2E_ONBOARDING_EMAIL',
];
const mutationSpecs = [
  'tests/e2e/product-live.spec.ts',
  'tests/e2e/onboarding-live.spec.ts',
  'tests/e2e/notification-preferences-live.spec.ts',
  '--project=desktop-light',
];

const env = { ...process.env, MIZAN_E2E_MUTATIONS: '1' };
const missingVariables = requiredVariables.filter((name) => !env[name]?.trim());
if (missingVariables.length > 0) {
  console.error(
    `Mutation E2E cannot provide the required live evidence. Missing environment variables: ${missingVariables.join(', ')}`,
  );
  process.exit(1);
}

const onboardingMutationEmail = env.MIZAN_E2E_ONBOARDING_MUTATION_EMAIL.trim().toLowerCase();
const reusedFixtureVariables = protectedReusableEmailVariables.filter(
  (name) => env[name]?.trim().toLowerCase() === onboardingMutationEmail,
);
if (reusedFixtureVariables.length > 0) {
  console.error(
    `MIZAN_E2E_ONBOARDING_MUTATION_EMAIL must be a separate disposable account. It matches protected reusable fixture variables: ${reusedFixtureVariables.join(', ')}`,
  );
  process.exit(1);
}

console.log('Mutation E2E is fail-closed: mutation mode is enabled by this runner and onboarding completion uses a separate disposable fixture.');
const result = spawnSync(playwrightCommand, ['test', ...mutationSpecs], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
  shell: isWindows,
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

console.log('Mutation E2E completed. The reusable read-only onboarding fixture was not consumed by onboarding completion.');
