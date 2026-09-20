import fs from 'node:fs';
import path from 'node:path';

const experimentsSource = fs.readFileSync(
  path.resolve(__dirname, '../src/app/experiments.tsx'),
  'utf8',
);

describe('Experiments account-switch fencing policy', () => {
  test('clears account-owned experiment drafts in the account-scoped effect', () => {
    expect(experimentsSource).toContain('const draftUserRef = useRef(userId);');
    expect(experimentsSource).toContain('draftUserRef.current = userId;');
    expect(experimentsSource).toContain("setSelected('earlier-bedtime');");
    expect(experimentsSource).toContain("setHypothesis(labels.templates['earlier-bedtime'].hypothesis);");
    expect(experimentsSource).toContain('mutationRequestRef.current += 1;');
  });

  test('keeps loaded experiment history scoped to the active account', () => {
    expect(experimentsSource).toContain('historyOwnerId === userId ? history : []');
  });
});
