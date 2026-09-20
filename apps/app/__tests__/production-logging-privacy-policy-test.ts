import fs from 'node:fs';
import path from 'node:path';

const PRODUCTION_ROOTS = [
  ['apps', 'app', 'src'],
  ['packages', 'core', 'src'],
  ['packages', 'plugins', 'src'],
  ['supabase', 'functions'],
] as const;

const ALLOWED_CONSOLE_ERROR = 'apps/app/src/components/app-error-boundary.tsx';
const SOURCE_EXTENSION = /\.(?:ts|tsx|js|jsx)$/;
const CONSOLE_CALL = /\bconsole\.(log|warn|info|debug|trace|error)\s*\(/g;

function listSourceFiles(root: string): string[] {
  if (!fs.existsSync(root)) return [];

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return listSourceFiles(absolute);
    return entry.isFile() && SOURCE_EXTENSION.test(entry.name) ? [absolute] : [];
  });
}

describe('production logging privacy policy', () => {
  test('production source has no ad-hoc console sinks outside the sanitized render boundary', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const violations: string[] = [];

    for (const segments of PRODUCTION_ROOTS) {
      const root = path.join(repoRoot, ...segments);
      for (const file of listSourceFiles(root)) {
        const relative = path.relative(repoRoot, file).split(path.sep).join('/');
        const source = fs.readFileSync(file, 'utf8');
        const calls = [...source.matchAll(CONSOLE_CALL)];

        for (const call of calls) {
          const method = call[1];
          if (relative === ALLOWED_CONSOLE_ERROR && method === 'error') continue;
          violations.push(`${relative}: console.${method}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test('the single allowed render diagnostic remains development-only and payload-minimal', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const source = fs.readFileSync(path.join(repoRoot, ALLOWED_CONSOLE_ERROR), 'utf8');

    expect(source).toContain('if (__DEV__)');
    expect(source).toContain("console.error('MIZAN render error'");
    expect(source).toContain('componentStack: info.componentStack');
    expect(source).not.toContain('message: _error.message');
    expect(source).not.toContain('name: _error.name');
    expect(source).not.toContain('stack: _error.stack');
  });
});
