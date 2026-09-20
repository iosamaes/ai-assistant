import fs from 'node:fs';
import path from 'node:path';

describe('Auth signup locale continuity policy', () => {
  test('selected signed-out locale is carried through signup metadata and restored before a profile exists', () => {
    const appRoot = path.resolve(__dirname, '..');
    const authScreen = fs.readFileSync(path.join(appRoot, 'src', 'app', 'auth.tsx'), 'utf8');
    const authBoundary = fs.readFileSync(
      path.join(appRoot, 'src', 'infrastructure', 'supabase', 'auth.ts'),
      'utf8',
    );
    const appState = fs.readFileSync(path.join(appRoot, 'src', 'state', 'app-state.tsx'), 'utf8');

    expect(authScreen).toContain('signUpWithPassword(email, password, locale)');
    expect(authBoundary).toContain("locale: 'ar' | 'en'");
    expect(authBoundary).toContain('data: { locale }');
    expect(appState).toContain('localeFromSessionMetadata(session)');
    expect(appState).toContain('if (metadataLocale) setLocaleState(metadataLocale)');
  });
});
