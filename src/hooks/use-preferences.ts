// src/hooks/use-preferences.ts
import { useEffect, useState } from "react";

export type KeywordMode = 1 | 2 | 4;

export interface ContentPreferences {
  keywordMode: KeywordMode;         // 1, 2, or 4
  extraInstructions: string;        // textarea content
  lastUpdatedISO: string;
}

const LS_KEY = "content-preferences-v1";

const DEFAULT_PREFS: ContentPreferences = {
  keywordMode: 1,
  extraInstructions: "",
  lastUpdatedISO: new Date().toISOString(),
};

export function useContentPreferences() {
  const [prefs, setPrefs] = useState<ContentPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ContentPreferences;
        setPrefs({ ...DEFAULT_PREFS, ...parsed });
      }
    } catch {}
  }, []);

  const save = (next: Partial<ContentPreferences>) => {
    const merged: ContentPreferences = {
      ...prefs,
      ...next,
      lastUpdatedISO: new Date().toISOString(),
    };
    setPrefs(merged);
    try { localStorage.setItem(LS_KEY, JSON.stringify(merged)); } catch {}
  };

  const reset = () => {
    setPrefs(DEFAULT_PREFS);
    try { localStorage.setItem(LS_KEY, JSON.stringify(DEFAULT_PREFS)); } catch {}
  };

  return { prefs, save, reset };
}
