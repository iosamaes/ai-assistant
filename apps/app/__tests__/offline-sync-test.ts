jest.mock('@/infrastructure/offline/pending-mutations', () => ({
  readPendingUserMutations: jest.fn(),
  removePendingUserMutation: jest.fn(),
}));
jest.mock('@/infrastructure/supabase/data-access', () => ({
  insertObservations: jest.fn(),
}));
jest.mock('@/infrastructure/supabase/reflections', () => ({
  insertInvisibleWin: jest.fn(),
}));

import { flushPendingUserMutations } from '@/application/offline-sync';
import {
  readPendingUserMutations,
  removePendingUserMutation,
  type PendingCheckInMutation,
} from '@/infrastructure/offline/pending-mutations';
import { insertObservations } from '@/infrastructure/supabase/data-access';
const readPending = jest.mocked(readPendingUserMutations);
const removePending = jest.mocked(removePendingUserMutation);
const insertQueuedObservations = jest.mocked(insertObservations);

const mutation: PendingCheckInMutation = {
  id: 'm1',
  userId: 'user-1',
  kind: 'check-in',
  createdAt: '2026-09-18T10:00:00.000Z',
  observations: [{
    source: 'user',
    metric: 'energy',
    observed_at: '2026-09-18T10:00:00.000Z',
    value_number: 70,
    client_mutation_id: 'm1',
  }],
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('offline mutation replay', () => {
  test('removes a queued mutation only after confirmed persistence', async () => {
    readPending.mockResolvedValue({ ok: true, value: [mutation] });
    insertQueuedObservations.mockResolvedValue({ ok: true, value: ['obs-1'] });
    removePending.mockResolvedValue({ ok: true, value: true });

    await expect(flushPendingUserMutations('user-1')).resolves.toEqual({
      syncedCount: 1,
      pendingCount: 0,
      blockedBy: null,
    });
    expect(removePending).toHaveBeenCalledWith('user-1', 'm1');
  });

  test('stops the retry pass on service unavailability and keeps the item queued', async () => {
    readPending.mockResolvedValue({ ok: true, value: [mutation, { ...mutation, id: 'm2' }] });
    insertQueuedObservations.mockResolvedValue({ ok: false, error: { kind: 'unavailable' } });

    await expect(flushPendingUserMutations('user-1')).resolves.toEqual({
      syncedCount: 0,
      pendingCount: 2,
      blockedBy: 'unavailable',
    });
    expect(insertQueuedObservations).toHaveBeenCalledTimes(1);
    expect(removePending).not.toHaveBeenCalled();
  });

  test('reports durable-storage failure without attempting network replay', async () => {
    readPending.mockResolvedValue({ ok: false, error: 'storage-unavailable' });

    await expect(flushPendingUserMutations('user-1')).resolves.toEqual({
      syncedCount: 0,
      pendingCount: 0,
      blockedBy: 'storage-unavailable',
    });
    expect(insertQueuedObservations).not.toHaveBeenCalled();
  });
});
