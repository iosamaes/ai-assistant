import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { ObservationInput } from '@/infrastructure/supabase/data-access';
import type { InvisibleWinCategory } from '@/infrastructure/supabase/reflections';

const STORAGE_PREFIX = 'mizan.pending-user-mutations.v1.';
const MAX_PENDING_MUTATIONS = 24;

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

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
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

export function createClientMutationId() {
  const randomPart = () => Math.random().toString(36).slice(2, 12);
  return `${Date.now().toString(36)}-${randomPart()}-${randomPart()}`;
}

export async function readPendingUserMutations(
  userId: string,
): Promise<PendingMutationStorageResult<PendingUserMutation[]>> {
  try {
    const raw = await readRaw(storageKey(userId));
    if (!raw) return { ok: true, value: [] };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { ok: true, value: [] };
    return {
      ok: true,
      value: parsed.filter((item) => isPendingMutation(item, userId)).slice(-MAX_PENDING_MUTATIONS),
    };
  } catch {
    return { ok: false, error: 'storage-unavailable' };
  }
}

export async function replacePendingUserMutations(
  userId: string,
  mutations: readonly PendingUserMutation[],
): Promise<PendingMutationStorageResult<number>> {
  if (mutations.length > MAX_PENDING_MUTATIONS) {
    return { ok: false, error: 'queue-full' };
  }

  try {
    await writeRaw(storageKey(userId), mutations.length > 0 ? JSON.stringify(mutations) : null);
    return { ok: true, value: mutations.length };
  } catch {
    return { ok: false, error: 'storage-unavailable' };
  }
}

export async function enqueuePendingUserMutation(
  mutation: PendingUserMutation,
): Promise<PendingMutationStorageResult<number>> {
  const current = await readPendingUserMutations(mutation.userId);
  if (!current.ok) return current;

  const withoutDuplicate = current.value.filter((item) => item.id !== mutation.id);
  if (withoutDuplicate.length >= MAX_PENDING_MUTATIONS) {
    return { ok: false, error: 'queue-full' };
  }

  return replacePendingUserMutations(mutation.userId, [...withoutDuplicate, mutation]);
}
