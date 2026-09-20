import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/app/integrations.tsx'),
  'utf8',
);

describe('Integrations user-facing language policy', () => {
  test('keeps implementation jargon out of visible English provider copy', () => {
    expect(source).toContain("'deterministic-time-primary': 'Sample time context — primary'");
    expect(source).toContain("'deterministic-health-data': 'Sample health data'");
    expect(source).toContain("'deterministic-location-context': 'Sample location context'");
    expect(source).not.toContain("'Deterministic time — primary'");
    expect(source).not.toContain("'Deterministic health data'");
    expect(source).not.toContain("'Deterministic location context'");
    expect(source).not.toContain('MIZAN’s deterministic core');
  });
});
