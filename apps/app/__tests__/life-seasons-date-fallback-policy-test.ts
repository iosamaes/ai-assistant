import fs from 'node:fs';
import path from 'node:path';

describe('Life Seasons date fallback policy', () => {
  test('season history never exposes raw ISO storage dates when locale formatting fails', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'app', 'life-seasons.tsx'), 'utf8');

    expect(source).toContain('new Intl.DateTimeFormat');
    expect(source).not.toContain('return date.toISOString().slice(0, 10);');
    expect(source).toMatch(/catch\s*\{\s*return '—';\s*\}/u);
  });
});
