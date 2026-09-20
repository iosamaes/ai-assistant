import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const playwrightCommand = isWindows ? 'playwright.cmd' : 'playwright';
const requiredVariables = [
  'MIZAN_E2E_SUPABASE_URL',
  'MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY',
  'MIZAN_E2E_COMPLETED_EMAIL',
  'MIZAN_E2E_ARABIC_EMAIL',
  'MIZAN_E2E_ONBOARDING_EMAIL',
  'MIZAN_E2E_COMPLETED_MUTATION_EMAIL',
  'MIZAN_E2E_COMPLETED_MUTATION_PASSWORD',
  'MIZAN_E2E_ONBOARDING_MUTATION_EMAIL',
  'MIZAN_E2E_ONBOARDING_MUTATION_PASSWORD',
];
const protectedFixtureEmailVariables = [
  'MIZAN_E2E_COMPLETED_EMAIL',
  'MIZAN_E2E_ARABIC_EMAIL',
  'MIZAN_E2E_ONBOARDING_EMAIL',
  'MIZAN_E2E_DELETE_EMAIL',
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
    `Mutation E2E cannot provide the required live evidence and fixture-separation proof. Missing environment variables: ${missingVariables.join(', ')}`,
  );
  process.exit(1);
}

const completedMutationEmail = env.MIZAN_E2E_COMPLETED_MUTATION_EMAIL.trim().toLowerCase();
const onboardingMutationEmail = env.MIZAN_E2E_ONBOARDING_MUTATION_EMAIL.trim().toLowerCase();

if (completedMutationEmail === onboardingMutationEmail) {
  console.error(
    'Mutation E2E requires separate completed-account and onboarding-completion mutation fixtures.',
  );
  process.exit(1);
}

for (const [mutationVariable, mutationEmail] of [
  ['MIZAN_E2E_COMPLETED_MUTATION_EMAIL', completedMutationEmail],
  ['MIZAN_E2E_ONBOARDING_MUTATION_EMAIL', onboardingMutationEmail],
]) {
  const reusedFixtureVariables = protectedFixtureEmailVariables.filter(
    (name) => env[name]?.trim().toLowerCase() === mutationEmail,
  );
  if (reusedFixtureVariables.length > 0) {
    console.error(
      `${mutationVariable} must be a dedicated mutation account. It matches protected fixture variables: ${reusedFixtureVariables.join(', ')}`,
    );
    process.exit(1);
  }
}

console.log(
  'Mutation E2E is fail-closed: reusable fixture role emails are present for collision checks, mutation mode is enabled by this runner, completed-account writes use a dedicated mutation fixture, and onboarding completion uses a separate disposable fixture.',
);
const result = spawnSync(playwrightCommand, ['test', ...mutationSpecs], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
  shell: isWindows,
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

console.log(
  'Mutation E2E completed. Reusable read-only completed, Arabic, and onboarding fixtures plus any configured dedicated deletion fixture were kept outside mutation writes.',
);
