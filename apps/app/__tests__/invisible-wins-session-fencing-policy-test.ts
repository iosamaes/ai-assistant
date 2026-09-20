import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../src/app/invisible-wins.tsx'),
  'utf8',
);

describe('Invisible Wins account-switch draft fencing policy', () => {
  test('clears reflection drafts synchronously when the active account changes', () => {
    expect(source).toContain('const draftUserRef = useRef(userId);');
    expect(source).toContain('if (draftUserRef.current !== userId) {');
    expect(source).toContain("setCategory('rest');");
    expect(source).toContain("setHistoryFilter('all');");
    expect(source).toContain("setNote('');");
    expect(source).toContain('setSaving(false);');
    expect(source).toContain('setMessage(null);');
    expect(source).toContain('activeUserRef.current = userId;');
  });

  test('keeps loaded reflections scoped to the active account', () => {
    expect(source).toContain('const visibleItems = itemsOwnerId === userId ? items : [];');
  });
});
