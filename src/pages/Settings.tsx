import { useEffect, useMemo, useRef, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import {
  biometricAvailabilityDetails,
  biometricIsAvailable,
  openFileWithPicker,
  saveFileWithPicker,
  secureGet,
  secureRemove,
  secureSet,
} from "@/security/native";
import { getAppLockSettings, setAppLockSettings, type AppLockSettingsV1 } from "@/security/appLockSettingsStore";
import { createPinPayload, isValidPin, verifyPinPayload, type PinPayloadV1 } from "@/security/pin";
import { getStoredPinPayload, setStoredPinPayload } from "@/security/appLockStore";
import { STORAGE_KEYS } from "@/lib/storageKeys";

type BackupPayloadV1 = {
  version: 1;
  exportedAt: string;
  data: Record<string, string | null>;
};

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function downloadJson(filename: string, obj: unknown) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function exportBackup(isNative: boolean): Promise<string | null> {
  const data: Record<string, string | null> = {};
  try {
    data[STORAGE_KEYS.bills] = localStorage.getItem(STORAGE_KEYS.bills);
  } catch {
    data[STORAGE_KEYS.bills] = null;
  }

  try {
    data[STORAGE_KEYS.expenses] = localStorage.getItem(STORAGE_KEYS.expenses);
  } catch {
    data[STORAGE_KEYS.expenses] = null;
  }

  data[STORAGE_KEYS.appLockSettings] = await secureGet(STORAGE_KEYS.appLockSettings);
  data[STORAGE_KEYS.appLockPin] = await secureGet(STORAGE_KEYS.appLockPin);

  const payload: BackupPayloadV1 = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
  const filename = `expense-compass-backup-${nowStamp()}.json`;

  if (!isNative) {
    downloadJson(filename, payload);
    return null;
  }
  const json = JSON.stringify(payload, null, 2);

  // Save to user-selected location via file manager.
  const selectedUri = await saveFileWithPicker({
    filename,
    mimeType: "application/json",
    data: json,
  });

  // Also write a cache copy to support sharing.
  const cachePath = `ExpenseCompass/${filename}`;
  try {
    await Filesystem.mkdir({
      path: "ExpenseCompass",
      directory: Directory.Cache,
      recursive: true,
    });
  } catch {
    // ignore if already exists
  }
  await Filesystem.writeFile({
    path: cachePath,
    data: json,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });

  const cacheUri = await Filesystem.getUri({
    path: cachePath,
    directory: Directory.Cache,
  });

  try {
    const { value } = await Share.canShare();
    if (value) {
      await Share.share({
        title: "Expense Compass Backup",
        text: "Share your backup",
        files: [cacheUri.uri],
        dialogTitle: "Share backup",
      });
    }
  } catch {
    // ignore share errors
  }

  return selectedUri;
}

async function restoreBackup(fileText: string): Promise<void> {
  let parsed: BackupPayloadV1;
  try {
    parsed = JSON.parse(fileText) as BackupPayloadV1;
  } catch {
    throw new Error("Invalid JSON file");
  }

  if (!parsed || typeof parsed !== "object" || typeof parsed.version !== "number") {
    throw new Error("Unsupported backup format");
  }

  if (parsed.version !== 1) {
    throw new Error("Unsupported backup format");
  }

  const data = parsed.data;

  const billsValue = Object.prototype.hasOwnProperty.call(data, STORAGE_KEYS.bills)
    ? data[STORAGE_KEYS.bills]
    : null;
  try {
    if (billsValue === null || billsValue === undefined) {
      localStorage.removeItem(STORAGE_KEYS.bills);
    } else {
      localStorage.setItem(STORAGE_KEYS.bills, billsValue);
    }
  } catch {
    // ignore local storage errors
  }

  const expensesValue = Object.prototype.hasOwnProperty.call(data, STORAGE_KEYS.expenses)
    ? data[STORAGE_KEYS.expenses]
    : null;
  try {
    if (expensesValue === null || expensesValue === undefined) {
      localStorage.removeItem(STORAGE_KEYS.expenses);
    } else {
      localStorage.setItem(STORAGE_KEYS.expenses, expensesValue);
    }
  } catch {
    // ignore local storage errors
  }

  const lockSettingsValue = Object.prototype.hasOwnProperty.call(data, STORAGE_KEYS.appLockSettings)
    ? data[STORAGE_KEYS.appLockSettings]
    : null;
  if (lockSettingsValue === null || lockSettingsValue === undefined) {
    await secureRemove(STORAGE_KEYS.appLockSettings);
  } else {
    await secureSet(STORAGE_KEYS.appLockSettings, lockSettingsValue);
  }

  const lockPinValue = Object.prototype.hasOwnProperty.call(data, STORAGE_KEYS.appLockPin)
    ? data[STORAGE_KEYS.appLockPin]
    : null;
  if (lockPinValue === null || lockPinValue === undefined) {
    await secureRemove(STORAGE_KEYS.appLockPin);
  } else {
    await secureSet(STORAGE_KEYS.appLockPin, lockPinValue);
  }
}

export default function Settings() {
  const isNative = useMemo(() => Capacitor.isNativePlatform(), []);

  const reloadAfterRestore = () => {
    setTimeout(() => window.location.reload(), 800);
  };

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricReason, setBiometricReason] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppLockSettingsV1>({
    version: 1,
    fingerprintEnabled: true,
  });

  const [pinPayload, setPinPayload] = useState<PinPayloadV1 | null>(null);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  const [busyBackup, setBusyBackup] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isNative) {
        setBiometricAvailable(false);
        setPinPayload(null);
        return;
      }

      const [availDetails, s, p] = await Promise.all([
        biometricAvailabilityDetails(),
        getAppLockSettings(),
        getStoredPinPayload(),
      ]);

      setBiometricAvailable(availDetails.available);
      setBiometricReason(availDetails.error ?? null);
      setSettings(s);
      setPinPayload(p);
    };

    void load();
  }, [isNative]);

  const canUseBiometrics = biometricAvailable && Boolean(pinPayload);

  const setSetting = async (next: AppLockSettingsV1) => {
    setSettings(next);
    await setAppLockSettings(next);
    toast({ title: "Settings saved" });
  };

  const handleSavePin = async () => {
    if (!isNative) {
      toast({ title: "Unavailable", description: "PIN is enforced on Android only." });
      return;
    }

    if (!isValidPin(newPin) || !isValidPin(confirmPin)) {
      toast({ title: "Invalid PIN", description: "PIN must be 4 digits." });
      return;
    }

    if (newPin !== confirmPin) {
      toast({ title: "PIN mismatch", description: "New PIN entries do not match." });
      return;
    }

    setSavingPin(true);
    try {
      if (pinPayload) {
        const ok = await verifyPinPayload(currentPin, pinPayload);
        if (!ok) {
          toast({ title: "Incorrect PIN", description: "Current PIN is wrong." });
          setCurrentPin("");
          return;
        }
      }

      const nextPayload = await createPinPayload(newPin);
      await setStoredPinPayload(nextPayload);
      setPinPayload(nextPayload);

      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");

      toast({ title: pinPayload ? "PIN updated" : "PIN created" });
    } finally {
      setSavingPin(false);
    }
  };

  const handleExport = async () => {
    setBusyBackup(true);
    try {
      const savedPath = await exportBackup(isNative);
      toast({
        title: "Backup exported",
        description: savedPath ? "Saved to the selected location." : "Backup exported.",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Export failed", description: message, variant: "destructive" });
    } finally {
      setBusyBackup(false);
    }
  };

  const handleRestoreClick = async () => {
    if (isNative) {
      try {
        sessionStorage.setItem("appLockSkipOnce", "1");
      } catch {
        // ignore storage errors
      }

      setBusyBackup(true);
      try {
        const picked = await openFileWithPicker({ mimeType: "application/json" });
        await restoreBackup(picked.data);
        toast({ title: "Backup restored", description: "Reloading…" });
        reloadAfterRestore();
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unable to open file";
        toast({ title: "Restore failed", description: message, variant: "destructive" });
      } finally {
        setBusyBackup(false);
      }
      return;
    }

    if (!fileRef.current) return;
    fileRef.current.value = "";
    fileRef.current.click();
  };

  const handleRestoreFile = async (file: File | null) => {
    if (!file) return;

    setBusyBackup(true);
    try {
      let text = await file.text();
      if (isNative && (!text || !text.trim())) {
        const fallbackPath = `ExpenseCompass/${file.name}`;
        const read = await Filesystem.readFile({
          path: fallbackPath,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        text = read.data;
      }
      await restoreBackup(text);
      toast({ title: "Backup restored", description: "Reloading…" });
      reloadAfterRestore();
    } catch (e) {
      toast({
        title: "Restore failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusyBackup(false);
    }
  };


  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Security and backups</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground">Change PIN</div>
              <div className="grid gap-4">
                {pinPayload && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Current PIN</div>
                    <InputOTP maxLength={4} value={currentPin} onChange={setCurrentPin} disabled={!isNative || savingPin}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">{pinPayload ? "New PIN" : "Create PIN"}</div>
                  <InputOTP maxLength={4} value={newPin} onChange={setNewPin} disabled={!isNative || savingPin}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Confirm PIN</div>
                  <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin} disabled={!isNative || savingPin}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button className="w-full" onClick={() => void handleSavePin()} disabled={!isNative || savingPin}>
                  {pinPayload ? "Change PIN" : "Create PIN"}
                </Button>

                {!isNative && (
                  <div className="text-xs text-muted-foreground">
                    Security lock is enabled on Android only.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground">Biometrics</div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-foreground">Fingerprint unlock</div>
                  <div className="text-xs text-muted-foreground">
                    {canUseBiometrics
                      ? "Use device biometrics to unlock"
                      : biometricReason
                        ? `Not available: ${biometricReason}`
                        : "Not available on this device"}
                  </div>
                </div>
                <Switch
                  checked={settings.fingerprintEnabled}
                  onCheckedChange={(checked) => void setSetting({ ...settings, fingerprintEnabled: checked })}
                  disabled={!isNative || !canUseBiometrics}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Export or restore your data (bills, expenses, and security settings).
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="sm:flex-1" onClick={handleExport} disabled={busyBackup}>
                Export backup
              </Button>
              <Button
                className="sm:flex-1"
                variant="secondary"
                onClick={handleRestoreClick}
                disabled={busyBackup}
              >
                Restore backup
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => void handleRestoreFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Restoring overwrites current data.
            </div>
          </CardContent>
        </Card>

      </div>
    </PageLayout>
  );
}
