import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const scripts = ['check', 'test:db', 'lint:db', 'test:e2e', 'test:e2e:production'];
const optInFlags = [
  'MIZAN_E2E_MUTATIONS',
  'MIZAN_E2E_DESTRUCTIVE',
  'MIZAN_E2E_VISUAL_EVIDENCE',
  'MIZAN_E2E_PERFORMANCE',
];

const env = { ...process.env };
for (const flag of optInFlags) delete env[flag];

console.log(`Release baseline is fail-closed: ${optInFlags.join(', ')} are disabled for this run.`);

for (const script of scripts) {
  console.log(`\n> release baseline: npm run ${script}`);
  const result = spawnSync(npmCommand, ['run', script], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('\nRelease baseline completed. Opt-in mutation, visual, performance, destructive, and native gates remain separate.');
