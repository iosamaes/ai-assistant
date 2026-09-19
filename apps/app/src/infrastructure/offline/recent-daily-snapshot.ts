import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_PREFIX = 'mizan.recent-daily-snapshot.v1.';
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type PersistedDailySnapshot = {
  version: 1;
  cachedAt: string;
  payload: unknown;
};

export type RecentDailySnapshot = {
  cachedAt: string;
  payload: unknown;
};

export type RecentDailySnapshotStorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: 'storage-unavailable' };

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

function webStorage() {
  return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parsePersistedDailySnapshot(value: unknown): PersistedDailySnapshot | null {
  if (!isRecord(value) || value.version !== 1 || typeof value.cachedAt !== 'string' || !('payload' in value)) {
    return null;
  }
  return { version: 1, cachedAt: value.cachedAt, payload: value.payload };
}

export async function readRecentDailySnapshot(
  userId: string,
  now = Date.now(),
): Promise<RecentDailySnapshotStorageResult<RecentDailySnapshot | null>> {
  try {
    const key = storageKey(userId);
    const raw = await readRaw(key);
    if (!raw) return { ok: true, value: null };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      await writeRaw(key, null);
      return { ok: true, value: null };
    }

    const record = parsePersistedDailySnapshot(parsed);
    const cachedAt = record ? Date.parse(record.cachedAt) : Number.NaN;
    if (!record || !Number.isFinite(cachedAt) || now - cachedAt > MAX_CACHE_AGE_MS || cachedAt > now + 60_000) {
      await writeRaw(key, null);
      return { ok: true, value: null };
    }

    return { ok: true, value: { cachedAt: record.cachedAt, payload: record.payload } };
  } catch {
    return { ok: false, error: 'storage-unavailable' };
  }
}

export async function writeRecentDailySnapshot(
  userId: string,
  payload: unknown,
  cachedAt = new Date().toISOString(),
): Promise<RecentDailySnapshotStorageResult<null>> {
  try {
    const value: PersistedDailySnapshot = { version: 1, cachedAt, payload };
    await writeRaw(storageKey(userId), JSON.stringify(value));
    return { ok: true, value: null };
  } catch {
    return { ok: false, error: 'storage-unavailable' };
  }
}

export async function clearRecentDailySnapshot(
  userId: string,
): Promise<RecentDailySnapshotStorageResult<null>> {
  try {
    await writeRaw(storageKey(userId), null);
    return { ok: true, value: null };
  } catch {
    return { ok: false, error: 'storage-unavailable' };
  }
}
