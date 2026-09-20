import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const scripts = ['check', 'test:db', 'lint:db', 'test:e2e', 'test:e2e:production'];
const authorizedSupabaseProjectRef = 'olfhjnropdrnujgpidfi';
const optInFlags = [
  'MIZAN_E2E_MUTATIONS',
  'MIZAN_E2E_DESTRUCTIVE',
  'MIZAN_E2E_VISUAL_EVIDENCE',
  'MIZAN_E2E_PERFORMANCE',
];
const requiredBaselineVariables = [
  'MIZAN_E2E_SUPABASE_URL',
  'MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY',
  'MIZAN_E2E_COMPLETED_EMAIL',
  'MIZAN_E2E_COMPLETED_PASSWORD',
  'MIZAN_E2E_ARABIC_EMAIL',
  'MIZAN_E2E_ARABIC_PASSWORD',
  'MIZAN_E2E_ONBOARDING_EMAIL',
  'MIZAN_E2E_ONBOARDING_PASSWORD',
];
const distinctBaselineFixtureEmailVariables = [
  'MIZAN_E2E_COMPLETED_EMAIL',
  'MIZAN_E2E_ARABIC_EMAIL',
  'MIZAN_E2E_ONBOARDING_EMAIL',
];

const env = { ...process.env };
for (const flag of optInFlags) delete env[flag];

const missingBaselineVariables = requiredBaselineVariables.filter((name) => !env[name]?.trim());
if (missingBaselineVariables.length > 0) {
  console.error(
    `Release baseline cannot provide required live E2E evidence. Missing environment variables: ${missingBaselineVariables.join(', ')}`,
  );
  process.exit(1);
}

let configuredProjectRef;
try {
  const configuredUrl = new URL(env.MIZAN_E2E_SUPABASE_URL);
  const hostedSuffix = '.supabase.co';
  if (configuredUrl.protocol !== 'https:' || !configuredUrl.hostname.endsWith(hostedSuffix)) {
    throw new Error('not a hosted Supabase HTTPS URL');
  }
  configuredProjectRef = configuredUrl.hostname.slice(0, -hostedSuffix.length);
} catch {
  console.error(
    'Release baseline requires MIZAN_E2E_SUPABASE_URL to be the authorized hosted Supabase project URL.',
  );
  process.exit(1);
}

if (configuredProjectRef !== authorizedSupabaseProjectRef) {
  console.error(
    `Release baseline is authorized only for Supabase project ${authorizedSupabaseProjectRef}. Check MIZAN_E2E_SUPABASE_URL before running live E2E.`,
  );
  process.exit(1);
}

const fixtureVariableByNormalizedEmail = new Map();
const duplicateFixtureVariablePairs = [];
for (const variableName of distinctBaselineFixtureEmailVariables) {
  const normalizedEmail = env[variableName].trim().toLowerCase();
  const previousVariableName = fixtureVariableByNormalizedEmail.get(normalizedEmail);
  if (previousVariableName) {
    duplicateFixtureVariablePairs.push(`${previousVariableName} + ${variableName}`);
  } else {
    fixtureVariableByNormalizedEmail.set(normalizedEmail, variableName);
  }
}

if (duplicateFixtureVariablePairs.length > 0) {
  console.error(
    `Release baseline requires distinct completed-English, completed-Arabic, and incomplete-onboarding accounts. Reused fixture variables: ${duplicateFixtureVariablePairs.join(', ')}`,
  );
  process.exit(1);
}

console.log(`Release baseline is fail-closed: ${optInFlags.join(', ')} are disabled for this run.`);

for (const script of scripts) {
  console.log(`\n> release baseline: npm run ${script}`);
  const result = spawnSync(npmCommand, ['run', script], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
    shell: isWindows,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('\nRelease baseline completed. Opt-in mutation, visual, performance, destructive, and native gates remain separate.');
