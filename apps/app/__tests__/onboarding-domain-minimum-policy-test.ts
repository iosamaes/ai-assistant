import fs from 'node:fs';
import path from 'node:path';

const onboardingSource = fs.readFileSync(
  path.resolve(__dirname, '../src/app/onboarding.tsx'),
  'utf8',
);

describe('Onboarding minimum-domain interaction policy', () => {
  test('does not expose a dead tap when the final enabled domain cannot be removed', () => {
    expect(onboardingSource).toContain(
      'const isLastEnabled = selected && enabledDomains.length === 1;',
    );
    expect(onboardingSource).toContain('disabled={saving || isLastEnabled}');
    expect(onboardingSource).toContain('labels.domainMinimum');
    expect(onboardingSource).toContain(
      'accessibilityLabel={isLastEnabled ? `${t(domainId)}. ${labels.domainMinimum}` : t(domainId)}',
    );
  });
});
