import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAppLock } from "@/security/useAppLock";

type Props = {
  children: React.ReactNode;
};

export function AppLockGate({ children }: Props) {
  const {
    enabled,
    isReady,
    isLocked,
    needsSetup,
    biometricAllowed,
    setupStep,
    unlockWithBiometric,
    unlockWithPin,
    setupCreatePin,
    setupConfirmPin,
  } = useAppLock();

  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => {
    if (needsSetup) return setupStep === "create" ? "Create PIN" : "Confirm PIN";
    return "Unlock";
  }, [needsSetup, setupStep]);

  useEffect(() => {
    setPin("");
    setError(null);
    setSubmitting(false);
  }, [needsSetup, setupStep, isLocked]);

  const handleComplete = async (value: string) => {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      if (needsSetup) {
        const result = setupStep === "create" ? await setupCreatePin(value) : await setupConfirmPin(value);
        if (!result.ok) {
          setError(result.error);
          setPin("");
        }
        return;
      }

      const ok = await unlockWithPin(value);
      if (!ok) {
        setError("Incorrect PIN");
        setPin("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const showOverlay = enabled && (!isReady || isLocked);

  return (
    <>
      {children}

      {showOverlay && (
        <div className="fixed inset-0 z-[100] bg-background">
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isReady ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <>
                    {error && (
                      <Alert variant="destructive">
                        <AlertTitle>Action required</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {needsSetup ? (
                      <div className="text-sm text-muted-foreground">
                        {setupStep === "create"
                          ? "Set a 4-digit PIN to protect your data."
                          : "Re-enter your PIN to confirm."}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Verify with biometrics or enter your 4-digit PIN.
                      </div>
                    )}

                    {!needsSetup && biometricAllowed && (
                      <Button
                        type="button"
                        className="w-full"
                        variant="secondary"
                        onClick={async () => {
                          setSubmitting(true);
                          setError(null);
                          try {
                            const ok = await unlockWithBiometric();
                            if (!ok) setError("Biometric verification failed");
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        disabled={submitting}
                      >
                        Use biometrics
                      </Button>
                    )}

                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={4}
                        value={pin}
                        onChange={(v) => setPin(v)}
                        onComplete={(v) => void handleComplete(v)}
                        disabled={submitting}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                      {needsSetup
                        ? "Your PIN is stored securely on this device."
                        : "Locked on every resume (mandatory)."}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
