// import { useEffect, useState } from "react";
// import { useLocalStorage } from "@/hooks/use-local-storage";

// export type KeywordMode = 1 | 2 | 4;
// export type TargetWords = 200 | 500 | 700 | 900;

// export interface ContentPreferences {
//   keywordMode: KeywordMode;        // 1, 2, 4
//   targetWords: TargetWords;        // 200/500/700/900
//   extraInstructions: string;       // highest priority (language etc.)
// }

// export const DEFAULT_PREFS: ContentPreferences = {
//   keywordMode: 1,
//   targetWords: 500,
//   extraInstructions: "",
// };

// export const PREFS_KEY = "content-preferences_v2";

// /**
//  * Draft + Save model so changes only apply when user clicks Save.
//  * generateContent reads the latest saved prefs directly from localStorage (see hook).
//  */
// export function useContentPreferences() {
//   const [savedPrefs, setSavedPrefs] = useLocalStorage<ContentPreferences>(PREFS_KEY, DEFAULT_PREFS);
//   const [prefs, setDraft] = useState<ContentPreferences>(savedPrefs);

//   // Keep draft in sync if saved changes (e.g., from Reset)
//   useEffect(() => { setDraft(savedPrefs); }, [savedPrefs]);

//   const setKeywordMode = (mode: KeywordMode) => setDraft({ ...prefs, keywordMode: mode });
//   const setTargetWords = (words: TargetWords) => setDraft({ ...prefs, targetWords: words });
//   const setExtraInstructions = (s: string) => setDraft({ ...prefs, extraInstructions: s });

//   const save = () => setSavedPrefs(prefs);
//   const reset = () => { setDraft(DEFAULT_PREFS); setSavedPrefs(DEFAULT_PREFS); };

//   return { prefs, savedPrefs, setKeywordMode, setTargetWords, setExtraInstructions, save, reset };
// }


import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

/** === Types === */
export type KeywordMode = 1 | 2 | 4;
export type TargetWords = 200 | 500 | 700 | 900; // kept for backward-compat (not critical now)

export type ContentMood =
  | "Entertaining"
  | "Informative"
  | "Inspirational"
  | "Humorous"
  | "Emotional"
  | "Educational";

export type ParagraphWordTarget = 80 | 100 | 120 | 150;
export type SectionCount = 4 | 5 | 6;

export interface ContentPreferences {
  /** Existing / legacy */
  keywordMode: KeywordMode;           // 1, 2, 4
  targetWords: TargetWords;           // legacy, safe to keep
  extraInstructions: string;          // highest priority override

  /** New dynamic prompt controls */
  mood: ContentMood;                  // tone/mood of content
  paragraphWords: ParagraphWordTarget;// words/paragraph target
  sectionCount: SectionCount;         // number of body sections (excludes Conclusion)
  includeConclusion: boolean;         // include Conclusion at end
  customModeEnabled: boolean;         // generate N articles even if not enough keywords
  articleCount: number;               // 1..200
  language: string;                   // human readable language label (e.g., "English (UK)")
}

export const DEFAULT_PREFS: ContentPreferences = {
  keywordMode: 1,
  targetWords: 500,
  extraInstructions: "",

  mood: "Informative",
  paragraphWords: 100,
  sectionCount: 5,
  includeConclusion: true,
  customModeEnabled: false,
  articleCount: 1,
  language: "English (UK)",
};

export const PREFS_KEY = "content-preferences_v3";

/** Draft + Save model so changes only apply when user clicks Save. */
export function useContentPreferences() {
  const [savedPrefs, setSavedPrefs] = useLocalStorage<ContentPreferences>(PREFS_KEY, DEFAULT_PREFS);
  const [prefs, setDraft] = useState<ContentPreferences>(savedPrefs);

  // Keep draft in sync if saved changes (e.g., Reset from another tab)
  useEffect(() => { setDraft(savedPrefs); }, [savedPrefs]);

  /** Setters */
  const setKeywordMode = (mode: KeywordMode) => setDraft({ ...prefs, keywordMode: mode });
  const setTargetWords = (words: TargetWords) => setDraft({ ...prefs, targetWords: words });
  const setExtraInstructions = (s: string) => setDraft({ ...prefs, extraInstructions: s });

  const setMood = (m: ContentMood) => setDraft({ ...prefs, mood: m });
  const setParagraphWords = (w: ParagraphWordTarget) => setDraft({ ...prefs, paragraphWords: w });
  const setSectionCount = (n: SectionCount) => setDraft({ ...prefs, sectionCount: n });
  const setIncludeConclusion = (v: boolean) => setDraft({ ...prefs, includeConclusion: v });
  const setCustomModeEnabled = (v: boolean) => setDraft({ ...prefs, customModeEnabled: v });
  const setArticleCount = (n: number) => {
    const clamped = Math.max(1, Math.min(200, Math.floor(Number(n) || 1)));
    setDraft({ ...prefs, articleCount: clamped });
  };
  const setLanguage = (lang: string) => setDraft({ ...prefs, language: lang });

  /** Save/Reset */
  const save = () => setSavedPrefs(prefs);
  const reset = () => { setDraft(DEFAULT_PREFS); setSavedPrefs(DEFAULT_PREFS); };

  return {
    prefs, savedPrefs,
    setKeywordMode, setTargetWords, setExtraInstructions,
    setMood, setParagraphWords, setSectionCount, setIncludeConclusion,
    setCustomModeEnabled, setArticleCount, setLanguage,
    save, reset
  };
}
