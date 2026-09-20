import { Palette } from '@/constants/theme';

function linearize(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue);
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

const normalTextPairs = [
  ['text', 'background'],
  ['text', 'surface'],
  ['text', 'surfaceMuted'],
  ['text', 'accentSoft'],
  ['textMuted', 'background'],
  ['textMuted', 'surface'],
  ['textMuted', 'surfaceMuted'],
  ['textMuted', 'accentSoft'],
  ['accent', 'background'],
  ['accent', 'surface'],
  ['accent', 'surfaceMuted'],
  ['accent', 'accentSoft'],
  ['danger', 'background'],
  ['danger', 'surface'],
  ['onAccent', 'accent'],
  ['onDanger', 'danger'],
] as const;

describe('semantic palette contrast', () => {
  test('normal-size text tokens keep at least a 4.5:1 contrast ratio on shipped surfaces', () => {
    for (const scheme of ['light', 'dark'] as const) {
      const palette = Palette[scheme];
      for (const [foregroundKey, backgroundKey] of normalTextPairs) {
        const ratio = contrastRatio(palette[foregroundKey], palette[backgroundKey]);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
