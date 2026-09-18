import {
  readPendingUserMutations,
  removePendingUserMutation,
  type PendingUserMutation,
} from '@/infrastructure/offline/pending-mutations';
import {
  insertObservations,
  type DataFailureKind,
  type DataResult,
} from '@/infrastructure/supabase/data-access';
import { insertInvisibleWin } from '@/infrastructure/supabase/reflections';

export type PendingMutationFlushResult = {
  syncedCount: number;
  pendingCount: number;
  blockedBy: DataFailureKind | 'storage-unavailable' | null;
};

const flushLocks = new Map<string, Promise<PendingMutationFlushResult>>();

function stopsRetryPass(kind: DataFailureKind) {
  return (
    kind === 'not-configured' ||
    kind === 'session-expired' ||
    kind === 'unauthorized' ||
    kind === 'unavailable'
  );
}

async function executePendingMutation(mutation: PendingUserMutation): Promise<DataResult<unknown>> {
  if (mutation.kind === 'check-in') {
    return insertObservations(mutation.userId, mutation.observations);
  }

  return insertInvisibleWin(mutation.userId, {
    category: mutation.category,
    note: mutation.note,
    occurred_at: mutation.occurredAt,
    client_mutation_id: mutation.id,
  });
}

async function runFlush(userId: string): Promise<PendingMutationFlushResult> {
  const queued = await readPendingUserMutations(userId);
  if (!queued.ok) {
    return { syncedCount: 0, pendingCount: 0, blockedBy: 'storage-unavailable' };
  }

  if (queued.value.length === 0) {
    return { syncedCount: 0, pendingCount: 0, blockedBy: null };
  }

  let syncedCount = 0;
  let pendingCount = queued.value.length;
  let blockedBy: PendingMutationFlushResult['blockedBy'] = null;

  for (const mutation of queued.value) {
    try {
      const result = await executePendingMutation(mutation);
      if (result.ok) {
        const removed = await removePendingUserMutation(userId, mutation.id);
        if (!removed.ok) {
          return { syncedCount, pendingCount, blockedBy: 'storage-unavailable' };
        }
        syncedCount += 1;
        pendingCount = Math.max(0, pendingCount - 1);
        continue;
      }

      blockedBy ??= result.error.kind;
      if (stopsRetryPass(result.error.kind)) break;
    } catch {
      blockedBy = 'unavailable';
      break;
    }
  }

  return { syncedCount, pendingCount, blockedBy };
}

export function flushPendingUserMutations(userId: string): Promise<PendingMutationFlushResult> {
  const existing = flushLocks.get(userId);
  if (existing) return existing;

  const run = runFlush(userId).finally(() => {
    if (flushLocks.get(userId) === run) flushLocks.delete(userId);
  });
  flushLocks.set(userId, run);
  return run;
}
