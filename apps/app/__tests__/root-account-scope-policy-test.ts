import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'app', '_layout.tsx'),
  'utf8',
);

describe('root account scope policy', () => {
  test('remounts the screen stack when the active account changes', () => {
    expect(source).toContain("key={userId ?? 'anonymous'}");
    expect(source).toContain('const { isRtl, onboardingCompleted, sessionStatus, userId } = useAppState();');
  });
});
