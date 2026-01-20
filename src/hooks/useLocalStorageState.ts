import { useCallback, useEffect, useMemo, useState, type SetStateAction } from "react";

function safeJsonParse<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function readLocalStorage<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    return safeJsonParse<T>(raw);
  } catch {
    return undefined;
  }
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const initialValueMemo = useMemo(() => initialValue, [initialValue]);

  const [state, setState] = useState<T>(() => {
    const stored = readLocalStorage<T>(key);
    return stored ?? initialValueMemo;
  });

  const setAndStore = useCallback(
    (value: SetStateAction<T>) => {
      setState((prev) => {
        const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore write errors (quota, privacy mode)
        }
        return next;
      });
    },
    [key],
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== key) return;
      if (event.newValue == null) {
        setState(initialValueMemo);
        return;
      }
      const parsed = safeJsonParse<T>(event.newValue);
      if (parsed !== undefined) setState(parsed);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [initialValueMemo, key]);

  return [state, setAndStore] as const;
}
