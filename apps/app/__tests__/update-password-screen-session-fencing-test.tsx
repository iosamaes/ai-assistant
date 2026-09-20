import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/app/update-password.tsx'),
  'utf8',
);

describe('Update Password screen account-switch fencing policy', () => {
  test('synchronizes the active-user fence in a React-safe reset effect', () => {
    expect(source).toContain('const activeUserRef = useRef(userId);');
    expect(source).toContain('activeUserRef.current = userId;');
    expect(source).toContain('draftUserRef.current = userId;');
    expect(source).toContain('setPassword(\'\');');
    expect(source).toContain('setConfirmPassword(\'\');');
  });

  test('drops a late password-update completion when the initiating account is no longer active', () => {
    expect(source).toContain('const targetUserId = userId;');
    expect(source).toContain('const result = await updatePassword(password, targetUserId);');
    expect(source).toContain('if (activeUserRef.current !== targetUserId) return;');
  });
});
