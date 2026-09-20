import fs from 'node:fs';
import path from 'node:path';

describe('Playwright live-mutation isolation policy', () => {
  test('stateful shared-account journeys execute only in desktop-light', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const productSpec = fs.readFileSync(path.join(repoRoot, 'tests', 'e2e', 'product-live.spec.ts'), 'utf8');
    const onboardingSpec = fs.readFileSync(path.join(repoRoot, 'tests', 'e2e', 'onboarding-live.spec.ts'), 'utf8');

    const productGuards = productSpec.match(/testInfo\.project\.name !== 'desktop-light'/g) ?? [];
    expect(productGuards).toHaveLength(3);
    expect(onboardingSpec).toContain("testInfo.project.name !== 'desktop-light'");
    expect(onboardingSpec).toContain('test.skip(mutationsEnabled');
  });
});
