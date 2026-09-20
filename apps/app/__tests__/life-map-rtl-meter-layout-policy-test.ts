import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/app/life-map.tsx'),
  'utf8',
);

describe('Life Map RTL quantitative-meter layout policy', () => {
  test('fills known domain meters from the semantic RTL reading edge', () => {
    expect(source).toContain("alignSelf: isRtl ? 'flex-end' : 'flex-start'");
    expect(source).toContain("width: `${Math.max(0, Math.min(100, domainScore))}%`");
    expect(source).toContain("function DomainCard({ domain, locale, isRtl }");
  });
});
