import fs from 'node:fs';
import path from 'node:path';

describe('opt-in release evidence runner policy', () => {
  test('visual and performance commands fail closed before Playwright can silently skip required evidence', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    const visualRunner = fs.readFileSync(path.join(repoRoot, 'scripts', 'run-e2e-visual.mjs'), 'utf8');
    const performanceRunner = fs.readFileSync(path.join(repoRoot, 'scripts', 'run-e2e-performance.mjs'), 'utf8');
    const productionPerformanceRunner = fs.readFileSync(
      path.join(repoRoot, 'scripts', 'run-e2e-production-performance.mjs'),
      'utf8',
    );

    expect(packageJson.scripts?.['test:e2e:visual']).toBe('node scripts/run-e2e-visual.mjs');
    expect(packageJson.scripts?.['test:e2e:performance']).toBe('node scripts/run-e2e-performance.mjs');
    expect(packageJson.scripts?.['test:e2e:production:performance']).toBe(
      'node scripts/run-e2e-production-performance.mjs',
    );

    for (const runner of [visualRunner, performanceRunner, productionPerformanceRunner]) {
      expect(runner).toContain("'MIZAN_E2E_SUPABASE_URL'");
      expect(runner).toContain("'MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY'");
      expect(runner).toContain("'MIZAN_E2E_COMPLETED_EMAIL'");
      expect(runner).toContain("'MIZAN_E2E_COMPLETED_PASSWORD'");
      expect(runner).toContain('missingVariables.length > 0');
    }

    expect(visualRunner).toContain("'MIZAN_E2E_ARABIC_EMAIL'");
    expect(visualRunner).toContain("'MIZAN_E2E_ARABIC_PASSWORD'");
    expect(visualRunner).toContain("env.MIZAN_E2E_VISUAL_EVIDENCE !== '1'");
    expect(visualRunner).toContain('englishEmail === arabicEmail');
    expect(visualRunner).toContain("'tests/e2e/visual-evidence-live.spec.ts'");

    for (const runner of [performanceRunner, productionPerformanceRunner]) {
      expect(runner).toContain("env.MIZAN_E2E_PERFORMANCE !== '1'");
    }
    expect(performanceRunner).toContain("'tests/e2e/performance-live.spec.ts'");
    expect(performanceRunner).toContain("'--project=desktop-light'");
    expect(productionPerformanceRunner).toContain("'tests/e2e/production-performance.spec.ts'");
    expect(productionPerformanceRunner).toContain("'--config=playwright.production.config.ts'");
    expect(productionPerformanceRunner).toContain("'--project=production-desktop-dark'");
  });
});
