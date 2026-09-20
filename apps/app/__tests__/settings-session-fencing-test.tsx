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

  test('clears account-owned transient UI state during render on account switch', () => {
    const transientRef = source.indexOf('const transientUserRef = useRef(userId);');
    const accountGuard = source.indexOf('if (transientUserRef.current !== userId)', transientRef);
    const clearBusy = source.indexOf('setBusy(false);', accountGuard);
    const clearMessage = source.indexOf('setMessage(null);', accountGuard);
    const resetEffect = source.indexOf('useEffect(() => {', accountGuard);

    expect(transientRef).toBeGreaterThanOrEqual(0);
    expect(accountGuard).toBeGreaterThan(transientRef);
    expect(clearBusy).toBeGreaterThan(accountGuard);
    expect(clearMessage).toBeGreaterThan(accountGuard);
    expect(clearBusy).toBeLessThan(resetEffect);
    expect(clearMessage).toBeLessThan(resetEffect);
  });

  test('guards async settings completions against an account that became inactive', () => {
    expect(source).toContain('const targetUserId = userId;');
    expect(source).toContain('if (activeUserRef.current !== targetUserId) return;');
    expect(source).toContain('if (activeUserRef.current && activeUserRef.current !== targetUserId) return;');
  });
});
