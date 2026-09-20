import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_CLIENT_SECRET_MARKERS = [
  { label: 'service-role environment variable', pattern: /SUPABASE_SERVICE_ROLE_KEY/u },
  { label: 'current Supabase secret-key prefix', pattern: /\bsb_secret_[A-Za-z0-9_-]*/u },
  { label: 'legacy service-role marker', pattern: /\bservice_role\b/u },
] as const;

function collectSourceFiles(target: string): string[] {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];

  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(child);
    return /\.(ts|tsx)$/.test(entry.name) ? [child] : [];
  });
}

describe('client secret source policy', () => {
  test('all client-bundled production source and Expo config contain no Supabase service-role or secret-key markers', () => {
    const appRoot = path.resolve(__dirname, '..');
    const repoRoot = path.resolve(appRoot, '..', '..');
    const clientSourceRoots = [
      path.join(appRoot, 'src'),
      path.join(repoRoot, 'packages', 'core', 'src'),
      path.join(repoRoot, 'packages', 'plugins', 'src'),
    ];
    const expoConfigCandidates = [
      path.join(appRoot, 'app.json'),
      path.join(appRoot, 'app.config.ts'),
      path.join(appRoot, 'app.config.js'),
      path.join(appRoot, 'app.config.cjs'),
      path.join(appRoot, 'app.config.mjs'),
    ].filter((candidate) => fs.existsSync(candidate));
    const files = [...clientSourceRoots.flatMap(collectSourceFiles), ...expoConfigCandidates];

    const violations = files.flatMap((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return FORBIDDEN_CLIENT_SECRET_MARKERS.flatMap(({ label, pattern }) =>
        pattern.test(content) ? [`${path.relative(repoRoot, file)}: ${label}`] : [],
      );
    });

    expect(violations).toEqual([]);
  });
});
