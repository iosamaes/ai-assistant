import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/app/settings.tsx'),
  'utf8',
);

describe('Settings account-switch fencing policy', () => {
  test('synchronizes the active-user fence in a React-safe effect', () => {
    expect(source).toContain('const activeUserRef = useRef(userId);');
    expect(source).toMatch(/useEffect\(\(\) => \{[\s\S]*?activeUserRef\.current = userId;[\s\S]*?\}, \[userId\]\);/);
  });

  test('clears account-owned transient UI state when the active account changes', () => {
    expect(source).toContain('setBusy(false);');
    expect(source).toContain('setMessage(null);');
    expect(source).toMatch(/useEffect\(\(\) => \{[\s\S]*?setBusy\(false\);[\s\S]*?setMessage\(null\);[\s\S]*?\}, \[userId\]\);/);
  });

  test('guards async settings completions against an account that became inactive', () => {
    expect(source).toContain('const targetUserId = userId;');
    expect(source).toContain('if (activeUserRef.current !== targetUserId) return;');
    expect(source).toContain('if (activeUserRef.current && activeUserRef.current !== targetUserId) return;');
  });
});
