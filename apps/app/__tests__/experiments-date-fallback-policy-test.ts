import fs from 'node:fs';
import path from 'node:path';

describe('Experiments date fallback policy', () => {
  test('experiment history never exposes raw ISO storage dates when locale formatting fails', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'app', 'experiments.tsx'), 'utf8');

    expect(source).toContain("return date.toLocaleDateString(locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en-QA-u-nu-latn');");
    expect(source).not.toContain('return date.toISOString().slice(0, 10);');
    expect(source).toMatch(/catch\s*\{\s*return '—';\s*\}/u);
  });
});
