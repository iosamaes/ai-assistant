const ARABIC_INDIC_ZERO = '٠'.charCodeAt(0);
const EASTERN_ARABIC_ZERO = '۰'.charCodeAt(0);

export function parseLocalizedDecimalInput(value: string): number | null {
  const normalized = value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - ARABIC_INDIC_ZERO))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - EASTERN_ARABIC_ZERO))
    .replace(/[٫,]/g, '.');

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatLocalizedNumber(
  value: number,
  locale: 'ar' | 'en',
  maximumFractionDigits = 1,
): string {
  if (!Number.isFinite(value)) return '—';
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-QA' : 'en', {
      maximumFractionDigits,
      minimumFractionDigits: 0,
      useGrouping: false,
    }).format(value);
  } catch {
    const factor = 10 ** maximumFractionDigits;
    return String(Math.round(value * factor) / factor);
  }
}
