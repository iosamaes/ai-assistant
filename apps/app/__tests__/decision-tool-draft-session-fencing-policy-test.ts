import fs from 'node:fs';
import path from 'node:path';

function sourceFor(route: string) {
  return fs.readFileSync(path.resolve(__dirname, `../src/app/${route}.tsx`), 'utf8');
}

describe('Local decision-tool account draft fencing policy', () => {
  test('Cost of Yes clears account-owned numeric drafts when the active account changes', () => {
    const source = sourceFor('cost-of-yes');

    expect(source).toContain('const { isRtl, locale, userId } = useAppState();');
    expect(source).toContain('const draftUserRef = useRef(userId);');
    expect(source).toContain('draftUserRef.current = userId;');
    expect(source).toContain("setCommitmentText('');");
    expect(source).toContain("setMarginText('');");
  });

  test('Human ROI clears account-owned protected-mode, rating, and time drafts on account switch', () => {
    const source = sourceFor('human-roi');

    expect(source).toContain('const { isRtl, locale, userId } = useAppState();');
    expect(source).toContain('const draftUserRef = useRef(userId);');
    expect(source).toContain('draftUserRef.current = userId;');
    expect(source).toContain('setProtectedMeaning(false);');
    expect(source).toContain('setBenefitRating(null);');
    expect(source).toContain('setEffortRating(null);');
    expect(source).toContain("setTimeText('');");
  });
});
