import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const playwrightCommand = isWindows ? 'playwright.cmd' : 'playwright';
const requiredVariables = [
  'MIZAN_E2E_SUPABASE_URL',
  'MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY',
  'MIZAN_E2E_COMPLETED_EMAIL',
  'MIZAN_E2E_COMPLETED_PASSWORD',
];

const env = { ...process.env };
const missingVariables = requiredVariables.filter((name) => !env[name]?.trim());
if (missingVariables.length > 0) {
  console.error(
    `Production-export performance E2E cannot provide the required evidence. Missing environment variables: ${missingVariables.join(', ')}`,
  );
  process.exit(1);
}

if (env.MIZAN_E2E_PERFORMANCE !== '1') {
  console.error('Production-export performance E2E requires the explicit opt-in MIZAN_E2E_PERFORMANCE=1.');
  process.exit(1);
}

console.log(
  'Production-export performance E2E is fail-closed: required live configuration is present and performance sampling is explicitly enabled.',
);
const result = spawnSync(
  playwrightCommand,
  [
    'test',
    'tests/e2e/production-performance.spec.ts',
    '--config=playwright.production.config.ts',
    '--project=production-desktop-dark',
  ],
  {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
    shell: isWindows,
  },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

console.log('Production-export performance E2E completed. Review the attached production-performance-sanity.json report.');
