import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/app/personalization.tsx'),
  'utf8',
);

describe('Personalization account-switch fencing policy', () => {
  test('synchronizes the active account during render and owns loaded state by user', () => {
    expect(source).toContain('const activeUserRef = useRef(userId);');
    expect(source).toContain('activeUserRef.current = userId;');
    expect(source).toContain('const [stateUserId, setStateUserId] = useState<string | null>(null);');
    expect(source).toContain('userId !== null && stateUserId === userId ? state : null');
  });

  test('drops stale async human-state completions after an account switch', () => {
    expect(source).toContain('const requestedUserId = userId;');
    expect(source).toContain('const requestIsCurrent = () => active && activeUserRef.current === requestedUserId;');
    expect(source).toContain('const result = await loadCurrentHumanState(requestedUserId);');
    expect(source).toContain('if (!requestIsCurrent()) return;');
  });
});
