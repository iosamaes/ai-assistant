const mockGetSession = jest.fn();
const mockRpc = jest.fn();
const mockInvoke = jest.fn();
const mockSignOut = jest.fn();
const mockClearPendingUserMutations = jest.fn();
const mockClearRecentDailySnapshot = jest.fn();

jest.mock('@/infrastructure/offline/pending-mutations', () => ({
  clearPendingUserMutations: mockClearPendingUserMutations,
}));

jest.mock('@/infrastructure/offline/recent-daily-snapshot', () => ({
  clearRecentDailySnapshot: mockClearRecentDailySnapshot,
}));

jest.mock('@/infrastructure/supabase/client', () => ({
  supabase: {
    rpc: mockRpc,
    functions: { invoke: mockInvoke },
    auth: {
      getSession: mockGetSession,
      signOut: mockSignOut,
    },
  },
}));

import { deleteMyAccount, exportMyData } from '@/infrastructure/supabase/privacy';

function sessionResult(userId: string, email = `${userId}@example.com`) {
  return {
    data: {
      session: {
        user: {
          id: userId,
          email,
          created_at: '2026-09-19T00:00:00.000Z',
        },
      },
    },
    error: null,
  };
}

beforeEach(() => {
  mockGetSession.mockReset();
  mockRpc.mockReset();
  mockInvoke.mockReset();
  mockSignOut.mockReset();
  mockClearPendingUserMutations.mockReset();
  mockClearRecentDailySnapshot.mockReset();
  mockClearPendingUserMutations.mockResolvedValue({ ok: true, value: null });
  mockClearRecentDailySnapshot.mockResolvedValue({ ok: true, value: null });
});

describe('privacy session fencing', () => {
  test('exports data only when the same expected user owns the session before and after the RPC', async () => {
    mockGetSession
      .mockResolvedValueOnce(sessionResult('user-a'))
      .mockResolvedValueOnce(sessionResult('user-a'));
    mockRpc.mockResolvedValue({ data: { profiles: [{ locale: 'ar' }] }, error: null });

    const result = await exportMyData('user-a');

    expect(mockRpc).toHaveBeenCalledWith('export_my_data');
    expect(result).toEqual({
      ok: true,
      value: {
        profiles: [{ locale: 'ar' }],
        account: {
          email: 'user-a@example.com',
          created_at: '2026-09-19T00:00:00.000Z',
        },
      },
    });
  });

  test('discards an export if the active session changes while the RPC is in flight', async () => {
    mockGetSession
      .mockResolvedValueOnce(sessionResult('user-a'))
      .mockResolvedValueOnce(sessionResult('user-b'));
    mockRpc.mockResolvedValue({ data: { profiles: [{ private: 'user-a-data' }] }, error: null });

    await expect(exportMyData('user-a')).resolves.toEqual({
      ok: false,
      error: { kind: 'export-failed' },
    });
  });

  test('does not start export when the expected user is not the active session', async () => {
    mockGetSession.mockResolvedValueOnce(sessionResult('user-b'));

    await expect(exportMyData('user-a')).resolves.toEqual({
      ok: false,
      error: { kind: 'export-failed' },
    });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  test('returns a coarse export error without exposing backend error content', async () => {
    mockGetSession.mockResolvedValueOnce(sessionResult('user-a'));
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'sensitive backend detail', code: '42501' },
    });

    await expect(exportMyData('user-a')).resolves.toEqual({
      ok: false,
      error: { kind: 'export-failed' },
    });
  });

  test('does not start deletion when the expected user is not the active session', async () => {
    mockGetSession.mockResolvedValueOnce(sessionResult('user-b'));

    await expect(deleteMyAccount('user-a')).resolves.toEqual({
      ok: false,
      error: { kind: 'delete-failed' },
    });
    expect(mockInvoke).not.toHaveBeenCalled();
    expect(mockClearPendingUserMutations).not.toHaveBeenCalled();
    expect(mockClearRecentDailySnapshot).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  test('returns a coarse deletion error and leaves local account data untouched on function failure', async () => {
    mockGetSession.mockResolvedValueOnce(sessionResult('user-a'));
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'sensitive edge-function detail', context: { token: 'do-not-surface' } },
    });

    await expect(deleteMyAccount('user-a')).resolves.toEqual({
      ok: false,
      error: { kind: 'delete-failed' },
    });
    expect(mockClearPendingUserMutations).not.toHaveBeenCalled();
    expect(mockClearRecentDailySnapshot).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  test('purges the deleted user local cache even if another user becomes active in flight', async () => {
    mockGetSession
      .mockResolvedValueOnce(sessionResult('user-a'))
      .mockResolvedValueOnce(sessionResult('user-b'));
    mockInvoke.mockResolvedValue({ data: null, error: null });

    await expect(deleteMyAccount('user-a')).resolves.toEqual({
      ok: true,
      value: { localDataCleared: true },
    });
    expect(mockInvoke).toHaveBeenCalledWith('delete-account', {
      body: { confirmation: 'DELETE' },
    });
    expect(mockClearPendingUserMutations).toHaveBeenCalledWith('user-a');
    expect(mockClearRecentDailySnapshot).toHaveBeenCalledWith('user-a');
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  test('clears local user caches and session when the deleted user is still active', async () => {
    mockGetSession
      .mockResolvedValueOnce(sessionResult('user-a'))
      .mockResolvedValueOnce(sessionResult('user-a'));
    mockInvoke.mockResolvedValue({ data: null, error: null });
    mockSignOut.mockResolvedValue({ error: null });

    await expect(deleteMyAccount('user-a')).resolves.toEqual({
      ok: true,
      value: { localDataCleared: true },
    });
    expect(mockClearPendingUserMutations).toHaveBeenCalledWith('user-a');
    expect(mockClearRecentDailySnapshot).toHaveBeenCalledWith('user-a');
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  test('reports incomplete local cleanup separately from confirmed server deletion', async () => {
    mockGetSession
      .mockResolvedValueOnce(sessionResult('user-a'))
      .mockResolvedValueOnce(sessionResult('user-a'));
    mockInvoke.mockResolvedValue({ data: null, error: null });
    mockClearPendingUserMutations.mockResolvedValue({ ok: false, error: 'storage-unavailable' });
    mockSignOut.mockResolvedValue({ error: null });

    await expect(deleteMyAccount('user-a')).resolves.toEqual({
      ok: true,
      value: { localDataCleared: false },
    });
    expect(mockClearPendingUserMutations).toHaveBeenCalledWith('user-a');
    expect(mockClearRecentDailySnapshot).toHaveBeenCalledWith('user-a');
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
  });
});
