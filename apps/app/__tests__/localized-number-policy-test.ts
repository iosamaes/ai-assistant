import {
  formatLocalizedNumber,
  normalizeLocalizedNumberInput,
} from '@/i18n/number-input';

describe('localized number policy', () => {
  test('renders Western digits in both Arabic and English UI locales', () => {
    expect(formatLocalizedNumber(1234.5, 'ar', 1)).toBe('1234.5');
    expect(formatLocalizedNumber(1234.5, 'en', 1)).toBe('1234.5');
    expect(formatLocalizedNumber(1234, 'ar', 0)).toBe('1234');
    expect(formatLocalizedNumber(1234, 'en', 0)).toBe('1234');
  });

  test('accepts Arabic-Indic and Eastern Arabic numeric input but normalizes stored text to Western digits', () => {
    expect(normalizeLocalizedNumberInput('١٢٣٫٤')).toBe('123.4');
    expect(normalizeLocalizedNumberInput('۱۲۳٫۴')).toBe('123.4');
  });
});
