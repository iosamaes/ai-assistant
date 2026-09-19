import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { ObservationInput } from '@/infrastructure/supabase/data-access';
import type { InvisibleWinCategory } from '@/infrastructure/supabase/reflections';

const STORAGE_PREFIX = 'mizan.pending-user-mutations.v2.';
const MAX_PENDING_MUTATIONS = 16;
const invisibleWinCategories: readonly InvisibleWinCategory[] = [
  'rest',
  'boundary',
  'family',
  'repair',
  'disconnect',
  'health',
  'other',
];

export type PendingCheckInMutation = {
  id: string;
  userId: string;
  kind: 'check-in';
  createdAt: string;
  observations: ObservationInput[];
};

export type PendingInvisibleWinMutation = {
  id: string;
  userId: string;
  kind: 'invisible-win';
  createdAt: string;
  category: InvisibleWinCategory;
  note: string;
  occurredAt: string;
};

export type PendingUserMutation = PendingCheckInMutation | PendingInvisibleWinMutation;

export type PendingMutationStorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: 'storage-unavailable' | 'queue-full' };

type PendingSlot = {
  index: number;
  mutation: PendingUserMutation | null;
};

function storageKey(userId: string, index: number) {
  return `${STORAGE_PREFIX}${userId}.${index}`;
}

function webStorage() {
  return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPendingMutation(value: unknown, userId: string): value is PendingUserMutation {
  if (!isRecord(value)) return false;
  if (
    typeof value.id !== 'string' ||
    value.userId !== userId ||
    typeof value.createdAt !== 'string'
  ) {
    return false;
  }

  if (value.kind === 'check-in') {
    return Array.isArray(value.observations);
  }

  return (
    value.kind === 'invisible-win' &&
    typeof value.category === 'string' &&
    invisibleWinCategories.includes(value.category as InvisibleWinCategory) &&
    typeof value.note === 'string' &&
    typeof value.occurredAt === 'string'
  );
}

async function readRaw(key: string): Promise<string | null> {
  if (Platform.OS !== 'web') return SecureStore.getItemAsync(key);
  const storage = webStorage();
  if (!storage) throw new Error('durable web storage unavailable');
  return storage.getItem(key);
}

async function writeRaw(key: string, value: string | null): Promise<void> {
  if (Platform.OS !== 'web') {
    if (value === null) await SecureStore.deleteItemAsync(key);
    else await SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK });
    return;
  }

  const storage = webStorage();
  if (!storage) throw new Error('durable web storage unavailable');
  if (value === null) storage.removeItem(key);
  else storage.setItem(key, value);
}

async function readSlots(userId: string): Promise<PendingMutationStorageResult<PendingSlot[]>> {
  try {
    const slots = await Promise.all(
      Array.from({ length: MAX_PENDING_MUTATIONS }, async (_, index) => {
        const raw = await readRaw(storageKey(userId, index));
        if (!raw) return { index, mutation: null } satisfies PendingSlot;
        try {
          const parsed: unknown = JSON.parse(raw);
          return {
            index,
            mutation: isPendingMutation(parsed, userId) ? parsed : null,
          } satisfies PendingSlot;
        } catch {
          return { index, mutation: null } satisfies PendingSlot;
        }
      }),
    );
    return { ok: true, value: slots };
  } catch {
    return { ok: false, error: 'storage-unavailable' };
  }
}

export function createClientMutationId() {
  const randomPart = () => Math.random().toString(36).slice(2, 12);
  return `${Date.now().toString(36)}-${randomPart()}-${randomPart()}`;
}

export async function readPendingUserMutations(
  userId: string,
): Promise<PendingMutationStorageResult<PendingUserMutation[]>> {
  const slots = await readSlots(userId);
  if (!slots.ok) return slots;
  return {
    ok: true,
    value: slots.value
      .flatMap((slot) => (slot.mutation ? [slot.mutation] : []))
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
  };
}

export async function enqueuePendingUserMutation(
  mutation: PendingUserMutation,
): Promise<PendingMutationStorageResult<number>> {
  const slots = await readSlots(mutation.userId);
  if (!slots.ok) return slots;

  const target =
    slots.value.find((slot) => slot.mutation?.id === mutation.id) ??
    slots.value.find((slot) => slot.mutation === null);
  if (!target) return { ok: false, error: 'queue-full' };

  try {
    await writeRaw(storageKey(mutation.userId, target.index), JSON.stringify(mutation));
    const count = slots.value.filter((slot) => slot.mutation !== null && slot.index !== target.index).length + 1;
    return { ok: true, value: count };
  } catch {
    return { ok: false, error: 'storage-unavailable' };
  }
}

export async function removePendingUserMutation(
  userId: string,
  mutationId: string,
): Promise<PendingMutationStorageResult<boolean>> {
  const slots = await readSlots(userId);
  if (!slots.ok) return slots;
  const target = slots.value.find((slot) => slot.mutation?.id === mutationId);
  if (!target) return { ok: true, value: false };

  try {
    await writeRaw(storageKey(userId, target.index), null);
    return { ok: true, value: true };
  } catch {
    return { ok: false, error: 'storage-unavailable' };
  }
}

export async function clearPendingUserMutations(
  userId: string,
): Promise<PendingMutationStorageResult<null>> {
  try {
    await Promise.all(
      Array.from({ length: MAX_PENDING_MUTATIONS }, (_, index) =>
        writeRaw(storageKey(userId, index), null),
      ),
    );
    return { ok: true, value: null };
  } catch {
    return { ok: false, error: 'storage-unavailable' };
  }
}
