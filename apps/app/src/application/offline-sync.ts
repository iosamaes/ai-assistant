import {
  readPendingUserMutations,
  replacePendingUserMutations,
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

  const retained: PendingUserMutation[] = [];
  let syncedCount = 0;
  let blockedBy: PendingMutationFlushResult['blockedBy'] = null;

  for (let index = 0; index < queued.value.length; index += 1) {
    const mutation = queued.value[index];
    try {
      const result = await executePendingMutation(mutation);
      if (result.ok) {
        syncedCount += 1;
        continue;
      }

      retained.push(mutation);
      blockedBy ??= result.error.kind;
      if (stopsRetryPass(result.error.kind)) {
        retained.push(...queued.value.slice(index + 1));
        break;
      }
    } catch {
      retained.push(mutation, ...queued.value.slice(index + 1));
      blockedBy = 'unavailable';
      break;
    }
  }

  const stored = await replacePendingUserMutations(userId, retained);
  if (!stored.ok) {
    return {
      syncedCount,
      pendingCount: retained.length,
      blockedBy: 'storage-unavailable',
    };
  }

  return {
    syncedCount,
    pendingCount: stored.value,
    blockedBy,
  };
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
