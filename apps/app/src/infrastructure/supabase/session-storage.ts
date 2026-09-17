import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memoryStorage = new Map<string, string>();

function webStorage() {
  return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
}

export const sessionStorage = {
  async getItem(key: string) {
    if (Platform.OS !== 'web') return SecureStore.getItemAsync(key);
    return webStorage()?.getItem(key) ?? memoryStorage.get(key) ?? null;
  },
  async setItem(key: string, value: string) {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK });
      return;
    }
    const storage = webStorage();
    if (storage) storage.setItem(key, value);
    else memoryStorage.set(key, value);
  },
  async removeItem(key: string) {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    webStorage()?.removeItem(key);
    memoryStorage.delete(key);
  },
};
