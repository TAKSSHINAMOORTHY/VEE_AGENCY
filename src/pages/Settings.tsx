import { useEffect, useMemo, useRef, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Capacitor } from "@capacitor/core";
import { biometricIsAvailable, secureGet, secureRemove, secureSet } from "@/security/native";
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

async function exportBackup(): Promise<void> {
  const keys = [
    STORAGE_KEYS.bills,
    STORAGE_KEYS.expenses,
    STORAGE_KEYS.appLockSettings,
    STORAGE_KEYS.appLockPin,
  ];

  const data: Record<string, string | null> = {};
  for (const key of keys) {
    data[key] = await secureGet(key);
  }

  const payload: BackupPayloadV1 = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };

  downloadJson(`expense-compass-backup-${nowStamp()}.json`, payload);
}

async function restoreBackup(fileText: string): Promise<void> {
  let parsed: BackupPayloadV1;
  try {
    parsed = JSON.parse(fileText) as BackupPayloadV1;
  } catch {
    throw new Error("Invalid JSON file");
  }

  if (parsed.version !== 1 || !parsed.data || typeof parsed.data !== "object") {
    throw new Error("Unsupported backup format");
  }

  const keys = [
    STORAGE_KEYS.bills,
    STORAGE_KEYS.expenses,
    STORAGE_KEYS.appLockSettings,
    STORAGE_KEYS.appLockPin,
  ];

  for (const key of keys) {
    const value = Object.prototype.hasOwnProperty.call(parsed.data, key) ? parsed.data[key] : null;
    if (value === null || value === undefined) {
      await secureRemove(key);
    } else {
      await secureSet(key, value);
    }
  }
}

export default function Settings() {
  const isNative = useMemo(() => Capacitor.isNativePlatform(), []);

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [settings, setSettings] = useState<AppLockSettingsV1>({
    version: 1,
    fingerprintEnabled: true,
    faceEnabled: true,
  });

  const [pinPayload, setPinPayload] = useState<PinPayloadV1 | null>(null);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  const [busyBackup, setBusyBackup] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [pendingRestoreText, setPendingRestoreText] = useState<string | null>(null);
  const [pendingRestoreName, setPendingRestoreName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isNative) {
        setBiometricAvailable(false);
        setPinPayload(null);
        return;
      }

      const [avail, s, p] = await Promise.all([
        biometricIsAvailable(),
        getAppLockSettings(),
        getStoredPinPayload(),
      ]);

      setBiometricAvailable(avail);
      setSettings(s);
      setPinPayload(p);
    };

    void load();
  }, [isNative]);

  const canUseBiometrics = biometricAvailable;

  const setSetting = async (next: AppLockSettingsV1) => {
    setSettings(next);
    await setAppLockSettings(next);
    toast({ title: "Settings saved" });
  };

  const handleChangePin = async () => {
    if (!isNative) {
      toast({ title: "Unavailable", description: "PIN is enforced on Android only." });
      return;
    }

    if (!pinPayload) {
      toast({ title: "No PIN set", description: "Open the app to create a PIN first." });
      return;
    }

    if (!isValidPin(currentPin) || !isValidPin(newPin) || !isValidPin(confirmPin)) {
      toast({ title: "Invalid PIN", description: "PIN must be 4 digits." });
      return;
    }

    if (newPin !== confirmPin) {
      toast({ title: "PIN mismatch", description: "New PIN entries do not match." });
      return;
    }

    setSavingPin(true);
    try {
      const ok = await verifyPinPayload(currentPin, pinPayload);
      if (!ok) {
        toast({ title: "Incorrect PIN", description: "Current PIN is wrong." });
        setCurrentPin("");
        return;
      }

      const nextPayload = await createPinPayload(newPin);
      await setStoredPinPayload(nextPayload);
      setPinPayload(nextPayload);

      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");

      toast({ title: "PIN updated" });
    } finally {
      setSavingPin(false);
    }
  };

  const handleExport = async () => {
    setBusyBackup(true);
    try {
      await exportBackup();
      toast({ title: "Backup exported" });
    } finally {
      setBusyBackup(false);
    }
  };

  const handleRestoreClick = () => {
    if (!fileRef.current) return;
    fileRef.current.value = "";
    fileRef.current.click();
  };

  const handleRestoreFile = async (file: File | null) => {
    if (!file) return;

    setBusyBackup(true);
    try {
      const text = await file.text();
      // Ask for confirmation before overwriting current data.
      setPendingRestoreText(text);
      setPendingRestoreName(file.name);
      setRestoreDialogOpen(true);
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

  const confirmRestore = async () => {
    if (!pendingRestoreText) {
      setRestoreDialogOpen(false);
      return;
    }

    setBusyBackup(true);
    try {
      await restoreBackup(pendingRestoreText);
      toast({ title: "Backup restored", description: "Reloading…" });
      window.location.reload();
    } catch (e) {
      toast({
        title: "Restore failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
      setRestoreDialogOpen(false);
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

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">New PIN</div>
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
                  <div className="text-xs text-muted-foreground">Confirm new PIN</div>
                  <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin} disabled={!isNative || savingPin}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button className="w-full" onClick={() => void handleChangePin()} disabled={!isNative || savingPin}>
                  Change PIN
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
                    {canUseBiometrics ? "Use device biometrics to unlock" : "Not available on this device"}
                  </div>
                </div>
                <Switch
                  checked={settings.fingerprintEnabled}
                  onCheckedChange={(checked) => void setSetting({ ...settings, fingerprintEnabled: checked })}
                  disabled={!isNative || !canUseBiometrics}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-foreground">Face unlock</div>
                  <div className="text-xs text-muted-foreground">
                    {canUseBiometrics ? "Use device biometrics to unlock" : "Not available on this device"}
                  </div>
                </div>
                <Switch
                  checked={settings.faceEnabled}
                  onCheckedChange={(checked) => void setSetting({ ...settings, faceEnabled: checked })}
                  disabled={!isNative || !canUseBiometrics}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Note: Android biometrics covers fingerprint and face depending on your device.
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
              <Button className="sm:flex-1" onClick={() => void handleExport()} disabled={busyBackup}>
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

        <AlertDialog
          open={restoreDialogOpen}
          onOpenChange={(open) => {
            setRestoreDialogOpen(open);
            if (!open) {
              setPendingRestoreText(null);
              setPendingRestoreName(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restore backup?</AlertDialogTitle>
              <AlertDialogDescription>
                This will overwrite your current bills, expenses, and security settings.
                {pendingRestoreName ? ` File: ${pendingRestoreName}` : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={busyBackup}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void confirmRestore()} disabled={busyBackup}>
                Restore
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
}
