import { flushPendingUserMutations } from '@/application/offline-sync';
import {
  createClientMutationId,
  enqueuePendingUserMutation,
  readPendingUserMutations,
} from '@/infrastructure/offline/pending-mutations';
import type { DataResult } from '@/infrastructure/supabase/data-access';
import {
  insertInvisibleWin,
  loadInvisibleWins as loadStoredInvisibleWins,
  type InvisibleWinCategory,
  type InvisibleWinInput,
  type StoredInvisibleWin,
} from '@/infrastructure/supabase/reflections';

export type { InvisibleWinCategory, StoredInvisibleWin };

export type SaveInvisibleWinValue = {
  delivery: 'saved' | 'queued';
  item: StoredInvisibleWin;
  mutationId: string;
};

function canQueue(kind: string) {
  return kind === 'unavailable' || kind === 'not-configured' || kind === 'session-expired';
}

function pendingReflectionToStored(
  userId: string,
  mutation: Extract<
    Awaited<ReturnType<typeof readPendingUserMutations>> extends { ok: true; value: infer T }
      ? T extends Array<infer U>
        ? U
        : never
      : never,
    { kind: 'invisible-win' }
  >,
): StoredInvisibleWin {
  return {
    id: `pending:${mutation.id}`,
    user_id: userId,
    category: mutation.category,
    note: mutation.note,
    occurred_at: mutation.occurredAt,
    created_at: mutation.createdAt,
  };
}

export async function loadInvisibleWins(
  userId: string,
  limit = 20,
): Promise<DataResult<StoredInvisibleWin[]>> {
  await flushPendingUserMutations(userId);

  const [remote, pending] = await Promise.all([
    loadStoredInvisibleWins(userId, limit),
    readPendingUserMutations(userId),
  ]);
  const pendingItems = pending.ok
    ? pending.value
        .filter((item): item is Extract<typeof item, { kind: 'invisible-win' }> => item.kind === 'invisible-win')
        .map((item) => pendingReflectionToStored(userId, item))
    : [];

  if (remote.ok) {
    return {
      ok: true,
      value: [...pendingItems, ...remote.value]
        .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at))
        .slice(0, Math.max(1, Math.min(limit, 100))),
    };
  }

  if (pendingItems.length > 0) return { ok: true, value: pendingItems };
  return remote;
}

export async function saveInvisibleWin(
  userId: string,
  input: InvisibleWinInput,
): Promise<DataResult<SaveInvisibleWinValue>> {
  const note = input.note.trim();
  if (!note) return { ok: false, error: { kind: 'invalid' } };

  await flushPendingUserMutations(userId);

  const mutationId = createClientMutationId();
  const createdAt = new Date().toISOString();
  const occurredAt = input.occurred_at ?? createdAt;
  const normalizedInput = {
    category: input.category,
    note,
    occurred_at: occurredAt,
    client_mutation_id: mutationId,
  } satisfies InvisibleWinInput;

  const result = await insertInvisibleWin(userId, normalizedInput);
  if (result.ok) {
    return {
      ok: true,
      value: { delivery: 'saved', item: result.value, mutationId },
    };
  }

  if (canQueue(result.error.kind)) {
    const queued = await enqueuePendingUserMutation({
      id: mutationId,
      userId,
      kind: 'invisible-win',
      createdAt,
      category: input.category,
      note,
      occurredAt,
    });
    if (queued.ok) {
      return {
        ok: true,
        value: {
          delivery: 'queued',
          mutationId,
          item: {
            id: `pending:${mutationId}`,
            user_id: userId,
            category: input.category,
            note,
            occurred_at: occurredAt,
            created_at: createdAt,
          },
        },
      };
    }
  }

  return { ok: false, error: result.error };
}
