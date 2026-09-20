import fs from 'node:fs';
import path from 'node:path';

import {
  formatLocalizedNumber,
  normalizeLocalizedNumberInput,
} from '@/i18n/number-input';

const PRODUCTION_ROOTS = [
  ['apps', 'app', 'src'],
  ['packages', 'core', 'src'],
  ['packages', 'plugins', 'src'],
  ['supabase', 'functions'],
] as const;
const INPUT_NORMALIZATION_SOURCE = 'apps/app/src/i18n/number-input.ts';
const SOURCE_EXTENSION = /\.(?:ts|tsx|js|jsx)$/;
const NON_WESTERN_DIGIT = /[٠-٩۰-۹]/g;

function listSourceFiles(root: string): string[] {
  if (!fs.existsSync(root)) return [];

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return listSourceFiles(absolute);
    return entry.isFile() && SOURCE_EXTENSION.test(entry.name) ? [absolute] : [];
  });
}

describe('localized number policy', () => {
  test('renders Western digits in both Arabic and English UI locales', () => {
    expect(formatLocalizedNumber(1234.5, 'ar', 1)).toBe('1234.5');
    expect(formatLocalizedNumber(1234.5, 'en', 1)).toBe('1234.5');
    expect(formatLocalizedNumber(1234, 'ar', 0)).toBe('1234');
    expect(formatLocalizedNumber(1234, 'en', 0)).toBe('1234');
  });

  test('accepts Arabic-Indic and Eastern Arabic numeric input but normalizes stored text to Western digits', () => {
    expect(normalizeLocalizedNumberInput('١٢٣٫٤')).toBe('123.4');
    expect(normalizeLocalizedNumberInput('۱۲۳٫۴')).toBe('123.4');
  });

  test('production source does not ship Arabic-Indic or Eastern Arabic output digits', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const violations: string[] = [];

    for (const segments of PRODUCTION_ROOTS) {
      const root = path.join(repoRoot, ...segments);
      for (const file of listSourceFiles(root)) {
        const relative = path.relative(repoRoot, file).split(path.sep).join('/');
        if (relative === INPUT_NORMALIZATION_SOURCE) continue;

        const source = fs.readFileSync(file, 'utf8');
        if (NON_WESTERN_DIGIT.test(source)) violations.push(relative);
        NON_WESTERN_DIGIT.lastIndex = 0;
      }
    }

    expect(violations).toEqual([]);
  });
});
