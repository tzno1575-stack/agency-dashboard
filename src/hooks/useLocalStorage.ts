"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Safari-safe: test localStorage availability once
  const [storageAvailable] = useState(() => {
    try {
      const test = "__ls_test__";
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  });

  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!storageAvailable) {
      setLoaded(true);
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (e) {
      console.error("localStorage read error:", e);
    }
    setLoaded(true);
  }, [key, storageAvailable]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    if (storageAvailable) {
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (e) {
        console.error("localStorage write error:", e);
      }
    }
  }, [key, storageAvailable, storedValue]);

  return [storedValue, setValue, loaded] as const;
}
