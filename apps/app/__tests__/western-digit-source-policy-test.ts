import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_DIGITS = /[\u0660-\u0669\u06f0-\u06f9]/u;

function collectSourceFiles(target: string): string[] {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];

  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(child);
    return /\.(ts|tsx)$/.test(entry.name) ? [child] : [];
  });
}

describe('Western-digit production source policy', () => {
  test('shipped presentation copy does not contain Arabic-Indic or Eastern Arabic digits', () => {
    const appRoot = path.resolve(__dirname, '..');
    const files = [
      ...collectSourceFiles(path.join(appRoot, 'src', 'app')),
      ...collectSourceFiles(path.join(appRoot, 'src', 'components')),
      path.join(appRoot, 'src', 'i18n', 'index.ts'),
    ];

    const violations = files.flatMap((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return FORBIDDEN_DIGITS.test(content) ? [path.relative(appRoot, file)] : [];
    });

    expect(violations).toEqual([]);
  });
});
