import {
  assessCostOfYesWithTimeContext,
  assessExplicitCostOfYes,
} from '@/application/cost-of-yes';
import { assessExplicitHumanROI } from '@/application/human-roi';
import { formatLocalizedNumber, parseLocalizedDecimalInput } from '@/i18n/number-input';
import { createTimeContextProvider } from '@/integrations/provider-registry';

const observedAt = '2026-09-18T12:00:00.000Z';

describe('advanced decision-tool application boundaries', () => {
  test('Arabic decimal input normalizes supported numeral forms conservatively', () => {
    expect(parseLocalizedDecimalInput('٤٫٥')).toBe(4.5);
    expect(parseLocalizedDecimalInput('۴,۵')).toBe(4.5);
    expect(parseLocalizedDecimalInput('3.25')).toBe(3.25);
    expect(parseLocalizedDecimalInput('٤٫٥٫٦')).toBeNull();
  });

  test('decision-tool numbers render in the selected locale', () => {
    expect(formatLocalizedNumber(4.5, 'ar', 1)).toBe('4.5');
    expect(formatLocalizedNumber(5, 'ar', 0)).toBe('5');
    expect(formatLocalizedNumber(4.5, 'en', 1)).toBe('4.5');
  });

  test('Cost of Yes exposes displacement from explicit weekly margin', () => {
    const result = assessExplicitCostOfYes({
      commitmentHoursPerWeek: 8,
      availableMarginHoursPerWeek: 4,
      observedAt,
    });

    expect(result.status).toBe('displacing');
    expect(result.commitmentMinutesPerWeek).toBe(480);
    expect(result.availableMarginMinutesPerWeek).toBe(240);
    expect(result.displacedMinutesPerWeek).toBe(240);
    expect(result.confidence.level).toBe('known');
  });

  test('Cost of Yes keeps incomplete inputs explicitly insufficient', () => {
    const result = assessExplicitCostOfYes({
      commitmentHoursPerWeek: 2,
      availableMarginHoursPerWeek: null,
      observedAt,
    });

    expect(result.status).toBe('insufficient');
    expect(result.reason).toBe('missing_margin');
    expect(result.confidence.level).toBe('insufficient');
  });

  test('Human ROI protects user-declared meaning from optimization math', () => {
    const result = assessExplicitHumanROI({
      benefitRating: 1,
      effortRating: 5,
      timeHoursPerWeek: 20,
      protectedMeaning: true,
      observedAt,
    });

    expect(result.status).toBe('protected');
    expect(result.reason).toBe('protected_meaning');
    expect(result.benefitRating).toBeNull();
    expect(result.effortRating).toBeNull();
  });

  test('Human ROI converts explicit time and preserves the benefit/effort comparison', () => {
    const result = assessExplicitHumanROI({
      benefitRating: 5,
      effortRating: 2,
      timeHoursPerWeek: 3,
      protectedMeaning: false,
      observedAt,
    });

    expect(result.status).toBe('benefit_heavier');
    expect(result.timeMinutesPerWeek).toBe(180);
    expect(result.confidence.level).toBe('known');
  });

  test('Cost of Yes can swap to the typed time-context provider boundary', async () => {
    const provider = createTimeContextProvider('deterministic-primary');
    const result = await assessCostOfYesWithTimeContext(2, provider, observedAt);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.source).toBe('calendar');
    expect(result.value.commitmentMinutesPerWeek).toBe(120);
    expect(result.value.availableMarginMinutesPerWeek).toBe(420);
    expect(result.value.evidence).toHaveLength(2);
  });
});
