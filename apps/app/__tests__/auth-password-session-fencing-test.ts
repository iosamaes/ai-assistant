const mockSharedGetSession = jest.fn();
const mockCreateClient = jest.fn();
const mockIsolatedSetSession = jest.fn();
const mockIsolatedUpdateUser = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

jest.mock('@/infrastructure/supabase/client', () => ({
  supabaseConfig: {
    ok: true,
    value: {
      url: 'https://example.supabase.co',
      publishableKey: 'public-key',
    },
  },
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockSharedGetSession(...args),
    },
  },
}));

import { updatePassword } from '@/infrastructure/supabase/auth';

function sessionResult(userId: string) {
  return {
    data: {
      session: {
        access_token: `access-${userId}`,
        refresh_token: `refresh-${userId}`,
        user: { id: userId },
      },
    },
    error: null,
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  mockIsolatedSetSession.mockResolvedValue(sessionResult('user-a'));
  mockIsolatedUpdateUser.mockResolvedValue({ data: { user: { id: 'user-a' } }, error: null });
  mockCreateClient.mockReturnValue({
    auth: {
      setSession: (...args: unknown[]) => mockIsolatedSetSession(...args),
      updateUser: (...args: unknown[]) => mockIsolatedUpdateUser(...args),
    },
  });
});

describe('password update session fencing', () => {
  test('rejects before mutation when the active session does not match the expected user', async () => {
    mockSharedGetSession.mockResolvedValue(sessionResult('user-b'));

    await expect(updatePassword('strong-password', 'user-a')).resolves.toEqual({
      ok: false,
      error: { kind: 'unknown', code: 'account_changed' },
    });
    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(mockIsolatedUpdateUser).not.toHaveBeenCalled();
  });

  test('updates through an isolated client bound to the initiating session tokens', async () => {
    mockSharedGetSession.mockResolvedValue(sessionResult('user-a'));

    await expect(updatePassword('strong-password', 'user-a')).resolves.toEqual({
      ok: true,
      value: null,
    });

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'public-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
    expect(mockIsolatedSetSession).toHaveBeenCalledWith({
      access_token: 'access-user-a',
      refresh_token: 'refresh-user-a',
    });
    expect(mockIsolatedUpdateUser).toHaveBeenCalledWith({ password: 'strong-password' });
  });

  test('refuses the mutation if isolated session binding resolves to another user', async () => {
    mockSharedGetSession.mockResolvedValue(sessionResult('user-a'));
    mockIsolatedSetSession.mockResolvedValue(sessionResult('user-b'));

    await expect(updatePassword('strong-password', 'user-a')).resolves.toEqual({
      ok: false,
      error: { kind: 'unknown', code: 'account_changed' },
    });
    expect(mockIsolatedUpdateUser).not.toHaveBeenCalled();
  });
});
