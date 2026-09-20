import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/app/settings.tsx'),
  'utf8',
);

describe('Settings account-switch fencing policy', () => {
  test('synchronizes the active-user fence during render before passive reset effects', () => {
    const refDeclaration = source.indexOf('const activeUserRef = useRef(userId);');
    const renderSync = source.indexOf('activeUserRef.current = userId;');
    const resetEffect = source.indexOf('useEffect(() => {', renderSync);

    expect(refDeclaration).toBeGreaterThanOrEqual(0);
    expect(renderSync).toBeGreaterThan(refDeclaration);
    expect(resetEffect).toBeGreaterThan(renderSync);
  });

  test('guards async settings completions against an account that became inactive', () => {
    expect(source).toContain('const targetUserId = userId;');
    expect(source).toContain('if (activeUserRef.current !== targetUserId) return;');
    expect(source).toContain('if (activeUserRef.current && activeUserRef.current !== targetUserId) return;');
  });
});
