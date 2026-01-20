import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { biometricIsAvailable, biometricVerify } from "@/security/native";
import { createPinPayload, isValidPin, verifyPinPayload, type PinPayloadV1 } from "@/security/pin";
import { getStoredPinPayload, setStoredPinPayload } from "@/security/appLockStore";
import { getAppLockSettings, type AppLockSettingsV1 } from "@/security/appLockSettingsStore";

type SetupStep = "create" | "confirm";

export function useAppLock() {
  const enabled = useMemo(() => Capacitor.isNativePlatform(), []);
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const [storedPayload, setStoredPayload] = useState<PinPayloadV1 | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [settings, setSettings] = useState<AppLockSettingsV1 | null>(null);

  const [setupStep, setSetupStep] = useState<SetupStep>("create");
  const firstPinRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setStoredPayload(null);
      setBiometricAvailable(false);
      setSettings(null);
      setIsReady(true);
      setIsLocked(false);
      return;
    }

    const appLockSettings = await getAppLockSettings();
    setSettings(appLockSettings);

    const payload = await getStoredPinPayload();
    setStoredPayload(payload);

    const available = await biometricIsAvailable();
    setBiometricAvailable(available);

    setIsReady(true);

    // Mandatory lock on resume. Only force setup if no PIN exists.
    setIsLocked(true);
    if (!payload) {
      setSetupStep("create");
      firstPinRef.current = null;
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    // Lock on every resume/activate.
    const lockNow = () => {
      try {
        const skipOnce = sessionStorage.getItem("appLockSkipOnce");
        if (skipOnce === "1") {
          sessionStorage.removeItem("appLockSkipOnce");
          return;
        }
      } catch {
        // ignore storage errors
      }
      setIsLocked(true);
    };

    if (enabled) {
      const remove = App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) lockNow();
      });

      return () => {
        void remove.then((h) => h.remove());
      };
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") lockNow();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [enabled]);

  const needsSetup = useMemo(() => storedPayload === null, [storedPayload]);

  const biometricsEnabled = useMemo(() => {
    if (!settings) return true;
    return settings.fingerprintEnabled;
  }, [settings]);

  const biometricAllowed = useMemo(() => biometricAvailable && biometricsEnabled, [biometricAvailable, biometricsEnabled]);

  const autoPromptedRef = useRef(false);

  const unlockWithBiometric = useCallback(async () => {
    if (!biometricAllowed) return false;
    const ok = await biometricVerify("Unlock Expense Compass", "Verify to continue");
    if (ok) setIsLocked(false);
    return ok;
  }, [biometricAllowed]);

  useEffect(() => {
    if (!enabled || !isReady || !isLocked || needsSetup || !biometricAllowed) {
      autoPromptedRef.current = false;
      return;
    }

    if (autoPromptedRef.current) return;
    autoPromptedRef.current = true;

    void unlockWithBiometric();
  }, [enabled, isReady, isLocked, needsSetup, biometricAllowed, unlockWithBiometric]);

  const unlockWithPin = useCallback(
    async (pin: string) => {
      if (!storedPayload) return false;
      const ok = await verifyPinPayload(pin, storedPayload);
      if (ok) setIsLocked(false);
      return ok;
    },
    [storedPayload],
  );

  const setupCreatePin = useCallback(async (pin: string) => {
    if (!isValidPin(pin)) return { ok: false as const, error: "PIN must be 4 digits" };

    firstPinRef.current = pin;
    setSetupStep("confirm");
    return { ok: true as const };
  }, []);

  const setupConfirmPin = useCallback(async (pin: string) => {
    if (!isValidPin(pin)) return { ok: false as const, error: "PIN must be 4 digits" };

    if (firstPinRef.current !== pin) {
      return { ok: false as const, error: "PINs do not match" };
    }

    const payload = await createPinPayload(pin);
    await setStoredPinPayload(payload);
    setStoredPayload(payload);
    firstPinRef.current = null;
    setSetupStep("create");
    setIsLocked(false);
    return { ok: true as const };
  }, []);

  return {
    enabled,
    isReady,
    isLocked,
    needsSetup,
    biometricAvailable,
    biometricAllowed,
    setupStep,
    unlockWithBiometric,
    unlockWithPin,
    setupCreatePin,
    setupConfirmPin,
  };
}
