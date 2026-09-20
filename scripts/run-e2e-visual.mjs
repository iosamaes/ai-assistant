import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const playwrightCommand = isWindows ? 'playwright.cmd' : 'playwright';
const requiredVariables = [
  'MIZAN_E2E_SUPABASE_URL',
  'MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY',
  'MIZAN_E2E_COMPLETED_EMAIL',
  'MIZAN_E2E_COMPLETED_PASSWORD',
  'MIZAN_E2E_ARABIC_EMAIL',
  'MIZAN_E2E_ARABIC_PASSWORD',
];

const env = { ...process.env };
const missingVariables = requiredVariables.filter((name) => !env[name]?.trim());
if (missingVariables.length > 0) {
  console.error(
    `CP9 visual-evidence E2E cannot provide the required bilingual matrix. Missing environment variables: ${missingVariables.join(', ')}`,
  );
  process.exit(1);
}

if (env.MIZAN_E2E_VISUAL_EVIDENCE !== '1') {
  console.error('CP9 visual-evidence E2E requires the explicit opt-in MIZAN_E2E_VISUAL_EVIDENCE=1.');
  process.exit(1);
}

const englishEmail = env.MIZAN_E2E_COMPLETED_EMAIL.trim().toLowerCase();
const arabicEmail = env.MIZAN_E2E_ARABIC_EMAIL.trim().toLowerCase();
if (englishEmail === arabicEmail) {
  console.error('CP9 visual evidence requires separate persisted-English and persisted-Arabic completed accounts.');
  process.exit(1);
}

console.log(
  'CP9 visual-evidence E2E is fail-closed: both locale fixtures are present, distinct, and screenshot capture is explicitly enabled.',
);
const result = spawnSync(
  playwrightCommand,
  ['test', 'tests/e2e/visual-evidence-live.spec.ts'],
  {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
    shell: isWindows,
  },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

console.log('CP9 visual-evidence E2E completed for both persisted locales across the configured matrix.');
