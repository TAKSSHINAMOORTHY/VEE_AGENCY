import { STORAGE_KEYS } from "@/lib/storageKeys";
import { secureGet, secureRemove, secureSet } from "@/security/native";
import type { PinPayloadV1 } from "@/security/pin";

export async function getStoredPinPayload(): Promise<PinPayloadV1 | null> {
  const raw = await secureGet(STORAGE_KEYS.appLockPin);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PinPayloadV1;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setStoredPinPayload(payload: PinPayloadV1): Promise<void> {
  await secureSet(STORAGE_KEYS.appLockPin, JSON.stringify(payload));
}

export async function clearStoredPinPayload(): Promise<void> {
  await secureRemove(STORAGE_KEYS.appLockPin);
}
