import { STORAGE_KEYS } from "@/lib/storageKeys";
import { secureGet, secureSet } from "@/security/native";

export type AppLockSettingsV1 = {
  version: 1;
  fingerprintEnabled: boolean;
};

const DEFAULT_SETTINGS: AppLockSettingsV1 = {
  version: 1,
  fingerprintEnabled: true,
};

export async function getAppLockSettings(): Promise<AppLockSettingsV1> {
  const raw = await secureGet(STORAGE_KEYS.appLockSettings);
  if (!raw) return DEFAULT_SETTINGS;

  try {
    const parsed = JSON.parse(raw) as Partial<AppLockSettingsV1>;
    if (parsed.version !== 1) return DEFAULT_SETTINGS;

    return {
      version: 1,
      fingerprintEnabled: parsed.fingerprintEnabled ?? DEFAULT_SETTINGS.fingerprintEnabled,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setAppLockSettings(settings: AppLockSettingsV1): Promise<void> {
  await secureSet(STORAGE_KEYS.appLockSettings, JSON.stringify(settings));
}
