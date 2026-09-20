import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/app/update-password.tsx'),
  'utf8',
);

describe('Update Password screen account-switch fencing policy', () => {
  test('synchronizes the active-user fence during render before passive reset effects', () => {
    const refDeclaration = source.indexOf('const activeUserRef = useRef(userId);');
    const renderSync = source.indexOf('activeUserRef.current = userId;');
    const resetEffect = source.indexOf('useEffect(() => {', renderSync);

    expect(refDeclaration).toBeGreaterThanOrEqual(0);
    expect(renderSync).toBeGreaterThan(refDeclaration);
    expect(resetEffect).toBeGreaterThan(renderSync);
  });

  test('drops a late password-update completion when the initiating account is no longer active', () => {
    expect(source).toContain('const targetUserId = userId;');
    expect(source).toContain('const result = await updatePassword(password, targetUserId);');
    expect(source).toContain('if (activeUserRef.current !== targetUserId) return;');
  });
});
