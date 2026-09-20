import fs from 'node:fs';
import path from 'node:path';

function readAppSource(relativePath: string) {
  return fs.readFileSync(path.resolve(__dirname, '..', 'src', relativePath), 'utf8');
}

describe('keyboard focus visual policy', () => {
  test('shared interactive primitives keep an explicit visible Web focus treatment', () => {
    const source = readAppSource('components/mizan-ui.tsx');

    expect(source).toContain('export function focusRingStyle');
    expect(source).toContain("Platform.OS !== 'web'");
    expect(source).toContain('boxShadow: `0 0 0 3px ${color}`');
    expect(source).toContain('focusRingStyle(palette.accent, focused && !disabled)');

    const focusHandlers = source.match(/onFocus=/g) ?? [];
    const blurHandlers = source.match(/onBlur=/g) ?? [];
    expect(focusHandlers.length).toBeGreaterThanOrEqual(4);
    expect(blurHandlers.length).toBeGreaterThanOrEqual(4);
  });

  test('primary navigation tabs use the same focus treatment', () => {
    const source = readAppSource('components/app-navigation.tsx');

    expect(source).toContain("import { focusRingStyle, MizanText } from '@/components/mizan-ui';");
    expect(source).toContain('onFocus={() => setFocusedDestination(destination.id)}');
    expect(source).toContain('focusRingStyle(palette.accent, focusedDestination === destination.id)');
  });

  test('Today direct Pressables keep visible focus for settings, feedback ratings, and check-in', () => {
    const source = readAppSource('app/today.tsx');

    expect(source).toContain('focusRingStyle(palette.accent, focusedControl === \'settings\')');
    expect(source).toContain('onFocus={() => setFocusedControl(focusKey)}');
    expect(source).toContain('focusRingStyle(palette.accent, focusedControl === focusKey && !disabled)');
    expect(source).toContain("onFocus={() => setFocusedControl('check-in')}");
    expect(source).toContain("focusRingStyle(palette.accent, focusedControl === 'check-in')");
  });

  test('experiment template radios keep visible focus while enabled', () => {
    const source = readAppSource('app/experiments.tsx');

    expect(source).toContain('const [focusedTemplate, setFocusedTemplate]');
    expect(source).toContain('onFocus={() => setFocusedTemplate(id)}');
    expect(source).toContain('focusRingStyle(palette.accent, focusedTemplate === id && !disabled)');
  });

  test('personalization domain switches keep visible focus while enabled', () => {
    const source = readAppSource('app/personalization.tsx');

    expect(source).toContain('const [focusedDomain, setFocusedDomain]');
    expect(source).toContain('onBlur={() => setFocusedDomain(null)}');
    expect(source).toContain('onFocus={() => setFocusedDomain(domainId)}');
    expect(source).toContain(
      'focusRingStyle(palette.accent, focusedDomain === domainId && !isLastEnabled)',
    );
  });
});
