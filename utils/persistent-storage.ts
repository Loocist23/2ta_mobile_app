import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const STORAGE_FILE_NAME = '2ta-auth-store.json';

type StorageMap = Record<string, string>;

const isWeb = Platform.OS === 'web';

async function readNativeStore(): Promise<StorageMap> {
  if (!FileSystem.documentDirectory) {
    return {};
  }

  const path = `${FileSystem.documentDirectory}${STORAGE_FILE_NAME}`;

  try {
    const content = await FileSystem.readAsStringAsync(path);
    return JSON.parse(content) as StorageMap;
  } catch (error) {
    // File does not exist yet or contains invalid data.
    return {};
  }
}

async function writeNativeStore(map: StorageMap) {
  if (!FileSystem.documentDirectory) {
    return;
  }

  const path = `${FileSystem.documentDirectory}${STORAGE_FILE_NAME}`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(map));
}

async function getNativeItem(key: string) {
  const map = await readNativeStore();
  return map[key] ?? null;
}

async function setNativeItem(key: string, value: string) {
  const map = await readNativeStore();
  map[key] = value;
  await writeNativeStore(map);
}

async function removeNativeItem(key: string) {
  const map = await readNativeStore();
  if (key in map) {
    delete map[key];
    await writeNativeStore(map);
  }
}

export async function getItem(key: string) {
  if (isWeb) {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(key);
  }
  return getNativeItem(key);
}

export async function setItem(key: string, value: string) {
  if (isWeb) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
    return;
  }
  await setNativeItem(key, value);
}

export async function removeItem(key: string) {
  if (isWeb) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    return;
  }
  await removeNativeItem(key);
}
