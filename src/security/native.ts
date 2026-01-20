import { Capacitor, registerPlugin } from "@capacitor/core";

export interface SecureStorePlugin {
  get(options: { key: string }): Promise<{ value: string | null }>;
  set(options: { key: string; value: string }): Promise<void>;
  remove(options: { key: string }): Promise<void>;
}

export interface BiometricAuthPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  verify(options: { title: string; subtitle?: string }): Promise<{ success: boolean }>;
}

const SecureStore = registerPlugin<SecureStorePlugin>("SecureStore");
const BiometricAuth = registerPlugin<BiometricAuthPlugin>("BiometricAuth");

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export async function secureGet(key: string): Promise<string | null> {
  if (!isNativePlatform()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  try {
    const result = await SecureStore.get({ key });
    return result.value;
  } catch {
    return null;
  }
}

export async function secureSet(key: string, value: string): Promise<void> {
  if (!isNativePlatform()) {
    localStorage.setItem(key, value);
    return;
  }

  try {
    await SecureStore.set({ key, value });
  } catch {
    // Fallback if plugin isn't registered/available for some reason.
    localStorage.setItem(key, value);
  }
}

export async function secureRemove(key: string): Promise<void> {
  if (!isNativePlatform()) {
    localStorage.removeItem(key);
    return;
  }

  try {
    await SecureStore.remove({ key });
  } catch {
    localStorage.removeItem(key);
  }
}

export async function biometricIsAvailable(): Promise<boolean> {
  if (!isNativePlatform()) return false;

  try {
    const { available } = await BiometricAuth.isAvailable();
    return available;
  } catch {
    return false;
  }
}

export async function biometricVerify(title: string, subtitle?: string): Promise<boolean> {
  if (!isNativePlatform()) return false;

  try {
    const result = await BiometricAuth.verify({ title, subtitle });
    return result.success;
  } catch {
    return false;
  }
}
