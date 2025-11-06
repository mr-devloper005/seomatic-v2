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


// import { useEffect, useState } from "react";
// import { useLocalStorage } from "@/hooks/use-local-storage";

// /** === Types === */
// export type KeywordMode = 1 | 2 | 4;
// export type TargetWords = 200 | 500 | 700 | 900; // kept for backward-compat (not critical now)

// export type ContentMood =
//   | "Entertaining"
//   | "Informative"
//   | "Inspirational"
//   | "Humorous"
//   | "Emotional"
//   | "Educational";

// export type ParagraphWordTarget = 80 | 100 | 120 | 150;
// export type SectionCount = 4 | 5 | 6;

// export interface ContentPreferences {
//   /** Existing / legacy */
//   keywordMode: KeywordMode;           // 1, 2, 4
//   targetWords: TargetWords;           // legacy, safe to keep
//   extraInstructions: string;          // highest priority override

//   /** New dynamic prompt controls */
//   mood: ContentMood;                  // tone/mood of content
//   paragraphWords: ParagraphWordTarget;// words/paragraph target
//   sectionCount: SectionCount;         // number of body sections (excludes Conclusion)
//   includeConclusion: boolean;         // include Conclusion at end
//   customModeEnabled: boolean;         // generate N articles even if not enough keywords
//   articleCount: number;               // 1..200
//   language: string;                   // human readable language label (e.g., "English (UK)")
// }

// export const DEFAULT_PREFS: ContentPreferences = {
//   keywordMode: 1,
//   targetWords: 500,
//   extraInstructions: "",

//   mood: "Informative",
//   paragraphWords: 100,
//   sectionCount: 5,
//   includeConclusion: true,
//   customModeEnabled: false,
//   articleCount: 1,
//   language: "English (UK)",
// };

// export const PREFS_KEY = "content-preferences_v3";

// /** Draft + Save model so changes only apply when user clicks Save. */
// export function useContentPreferences() {
//   const [savedPrefs, setSavedPrefs] = useLocalStorage<ContentPreferences>(PREFS_KEY, DEFAULT_PREFS);
//   const [prefs, setDraft] = useState<ContentPreferences>(savedPrefs);

//   // Keep draft in sync if saved changes (e.g., Reset from another tab)
//   useEffect(() => { setDraft(savedPrefs); }, [savedPrefs]);

//   /** Setters */
//   const setKeywordMode = (mode: KeywordMode) => setDraft({ ...prefs, keywordMode: mode });
//   const setTargetWords = (words: TargetWords) => setDraft({ ...prefs, targetWords: words });
//   const setExtraInstructions = (s: string) => setDraft({ ...prefs, extraInstructions: s });

//   const setMood = (m: ContentMood) => setDraft({ ...prefs, mood: m });
//   const setParagraphWords = (w: ParagraphWordTarget) => setDraft({ ...prefs, paragraphWords: w });
//   const setSectionCount = (n: SectionCount) => setDraft({ ...prefs, sectionCount: n });
//   const setIncludeConclusion = (v: boolean) => setDraft({ ...prefs, includeConclusion: v });
//   const setCustomModeEnabled = (v: boolean) => setDraft({ ...prefs, customModeEnabled: v });
//   const setArticleCount = (n: number) => {
//     const clamped = Math.max(1, Math.min(200, Math.floor(Number(n) || 1)));
//     setDraft({ ...prefs, articleCount: clamped });
//   };
//   const setLanguage = (lang: string) => setDraft({ ...prefs, language: lang });

//   /** Save/Reset */
//   const save = () => setSavedPrefs(prefs);
//   const reset = () => { setDraft(DEFAULT_PREFS); setSavedPrefs(DEFAULT_PREFS); };

//   return {
//     prefs, savedPrefs,
//     setKeywordMode, setTargetWords, setExtraInstructions,
//     setMood, setParagraphWords, setSectionCount, setIncludeConclusion,
//     setCustomModeEnabled, setArticleCount, setLanguage,
//     save, reset
//   };
// }



// // src/hooks/use-preferences.ts
// import { useEffect, useState } from "react";
// import { useLocalStorage } from "@/hooks/use-local-storage";

// /** === Types === */
// export type KeywordMode = 1 | 2 | 4;
// export type TargetWords = 200 | 500 | 700 | 900; // legacy

// export type ContentMood =
//   | "Entertaining"
//   | "Informative"
//   | "Inspirational"
//   | "Humorous"
//   | "Emotional"
//   | "Educational";

// export type ParagraphWordTarget = 80 | 100 | 120 | 150;
// export type SectionCount = 4 | 5 | 6;
// export type TotalContentWords = 200 | 500 | 800 | 1000 | 1200 | 1500;
// export type TitleLength = 70 | 100 | 130 | 150;

// export interface ContentPreferences {
//   keywordMode: KeywordMode;
//   targetWords: TargetWords;
//   extraInstructions: string;

//   mood: ContentMood;
//   paragraphWords: ParagraphWordTarget;
//   sectionCount: SectionCount;
//   includeConclusion: boolean;
//   customModeEnabled: boolean;
//   articleCount: number;
//   language: string;

//   // New fields
//   totalContentWords: TotalContentWords;
//   titleLength: TitleLength;
//   includeBulletPoints: boolean;
//   includeTables: boolean;
//   includeEmojis: boolean;
//   includeBoxesQuotesHighlights: boolean;
//   includeQandA: boolean;
// }

// export const DEFAULT_PREFS: ContentPreferences = {
//   keywordMode: 1,
//   targetWords: 500,
//   extraInstructions: "",

//   mood: "Informative",
//   paragraphWords: 100,
//   sectionCount: 5,
//   includeConclusion: true,
//   customModeEnabled: false,
//   articleCount: 1,
//   language: "English (UK)",

//   // New defaults
//   totalContentWords: 800,
//   titleLength: 100,
//   includeBulletPoints: false,
//   includeTables: false,
//   includeEmojis: false,
//   includeBoxesQuotesHighlights: false,
//   includeQandA: false,
// };

// export const PREFS_KEY = "content-preferences_v3";




// /** Draft + Save model so changes only apply when user clicks Save. */
// export function useContentPreferences() {
//   const [savedPrefs, setSavedPrefs] = useLocalStorage<ContentPreferences>(PREFS_KEY, DEFAULT_PREFS);
//   const [prefs, setDraft] = useState<ContentPreferences>(savedPrefs);

//   // Keep draft in sync if saved changes (e.g., Reset from another tab)
//   useEffect(() => { setDraft(savedPrefs); }, [savedPrefs]);

//   /** Setters */
//   const setKeywordMode = (mode: KeywordMode) => setDraft({ ...prefs, keywordMode: mode });
//   const setTargetWords = (words: TargetWords) => setDraft({ ...prefs, targetWords: words });
//   const setExtraInstructions = (s: string) => setDraft({ ...prefs, extraInstructions: s });

//   const setMood = (m: ContentMood) => setDraft({ ...prefs, mood: m });
//   const setParagraphWords = (w: ParagraphWordTarget) => setDraft({ ...prefs, paragraphWords: w });
//   const setSectionCount = (n: SectionCount) => setDraft({ ...prefs, sectionCount: n });
//   const setIncludeConclusion = (v: boolean) => setDraft({ ...prefs, includeConclusion: v });
//   const setCustomModeEnabled = (v: boolean) => setDraft({ ...prefs, customModeEnabled: v });
//   const setArticleCount = (n: number) => {
//     const clamped = Math.max(1, Math.min(200, Math.floor(Number(n) || 1)));
//     setDraft({ ...prefs, articleCount: clamped });
//   };
//   const setLanguage = (lang: string) => setDraft({ ...prefs, language: lang });

//   // New setters
//   const setTotalContentWords = (w: TotalContentWords) => setDraft({ ...prefs, totalContentWords: w });
//   const setTitleLength = (l: TitleLength) => setDraft({ ...prefs, titleLength: l });
//   const setIncludeBulletPoints = (v: boolean) => setDraft({ ...prefs, includeBulletPoints: v });
//   const setIncludeTables = (v: boolean) => setDraft({ ...prefs, includeTables: v });
//   const setIncludeEmojis = (v: boolean) => setDraft({ ...prefs, includeEmojis: v });
//   const setIncludeBoxesQuotesHighlights = (v: boolean) => setDraft({ ...prefs, includeBoxesQuotesHighlights: v });
//   const setIncludeQandA = (v: boolean) => setDraft({ ...prefs, includeQandA: v });

//   /** Save/Reset */
//   const save = () => setSavedPrefs(prefs);
//   const reset = () => { setDraft(DEFAULT_PREFS); setSavedPrefs(DEFAULT_PREFS); };

//   return {
//     prefs, savedPrefs,
//     setKeywordMode, setTargetWords, setExtraInstructions,
//     setMood, setParagraphWords, setSectionCount, setIncludeConclusion,
//     setCustomModeEnabled, setArticleCount, setLanguage,
//     setTotalContentWords, setTitleLength,
//     setIncludeBulletPoints, setIncludeTables, setIncludeEmojis,
//     setIncludeBoxesQuotesHighlights, setIncludeQandA,
//     save, reset
//   };
// }

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

/** === Types === */
export type KeywordMode = 1 | 2 | 4;
export type TargetWords = 200 | 500 | 700 | 900; // legacy, kept for compatibility

export type ContentMood =
  | "Entertaining"
  | "Informative"
  | "Inspirational"
  | "Humorous"
  | "Emotional"
  | "Educational";

export type ParagraphWordTarget = 80 | 100 | 120 | 150;
export type TotalContentWords = 200 | 500 | 800 | 1000 | 1200 | 1500;
export type TitleLength = 70 | 100 | 130 | 150;

export interface ContentPreferences {
  keywordMode: KeywordMode;
  targetWords: TargetWords;
  extraInstructions: string;

  mood: ContentMood;
  paragraphWords: ParagraphWordTarget;
  includeConclusion: boolean;
  customModeEnabled: boolean;
  articleCount: number;
  language: string;

  totalContentWords: TotalContentWords;
  titleLength: TitleLength;
  includeBulletPoints: boolean;
  includeTables: boolean;
  includeEmojis: boolean;
  includeBoxesQuotesHighlights: boolean;
  includeQandA: boolean;

  // Brand / domain mention
  brandDomainEnabled: boolean;
  brandDomain: string;
}

export const DEFAULT_PREFS: ContentPreferences = {
  keywordMode: 1,
  targetWords: 500,
  extraInstructions: "",

  mood: "Informative",
  paragraphWords: 100,
  includeConclusion: true,
  customModeEnabled: false,
  articleCount: 1,
  language: "English (UK)",

  totalContentWords: 800,
  titleLength: 100,
  includeBulletPoints: false,
  includeTables: false,
  includeEmojis: false,
  includeBoxesQuotesHighlights: false,
  includeQandA: false,

  brandDomainEnabled: false,
  brandDomain: "",
};

export const PREFS_KEY = "content-preferences_v3";

/** Draft + Save model */
export function useContentPreferences() {
  const [savedPrefs, setSavedPrefs] = useLocalStorage<ContentPreferences>(
    PREFS_KEY,
    DEFAULT_PREFS
  );
  const [prefs, setDraft] = useState<ContentPreferences>(savedPrefs);

  useEffect(() => {
    setDraft(savedPrefs);
  }, [savedPrefs]);

  /** Setters */
  const setKeywordMode = (mode: KeywordMode) =>
    setDraft({ ...prefs, keywordMode: mode });

  const setTargetWords = (words: TargetWords) =>
    setDraft({ ...prefs, targetWords: words });

  const setExtraInstructions = (s: string) =>
    setDraft({ ...prefs, extraInstructions: s });

  const setMood = (m: ContentMood) =>
    setDraft({ ...prefs, mood: m });

  const setParagraphWords = (w: ParagraphWordTarget) =>
    setDraft({ ...prefs, paragraphWords: w });

  const setIncludeConclusion = (v: boolean) =>
    setDraft({ ...prefs, includeConclusion: !!v });

  const setCustomModeEnabled = (v: boolean) =>
    setDraft({ ...prefs, customModeEnabled: !!v });

  const setArticleCount = (n: number) => {
    const clamped = Math.max(1, Math.min(200, Math.floor(Number(n) || 1)));
    setDraft({ ...prefs, articleCount: clamped });
  };

  const setLanguage = (lang: string) =>
    setDraft({ ...prefs, language: lang });

  const setTotalContentWords = (w: TotalContentWords) =>
    setDraft({ ...prefs, totalContentWords: w });

  const setTitleLength = (l: TitleLength) =>
    setDraft({ ...prefs, titleLength: l });

  const setIncludeBulletPoints = (v: boolean) =>
    setDraft({ ...prefs, includeBulletPoints: !!v });

  const setIncludeTables = (v: boolean) =>
    setDraft({ ...prefs, includeTables: !!v });

  const setIncludeEmojis = (v: boolean) =>
    setDraft({ ...prefs, includeEmojis: !!v });

  const setIncludeBoxesQuotesHighlights = (v: boolean) =>
    setDraft({ ...prefs, includeBoxesQuotesHighlights: !!v });

  const setIncludeQandA = (v: boolean) =>
    setDraft({ ...prefs, includeQandA: !!v });

  const setBrandDomainEnabled = (v: boolean) =>
    setDraft({ ...prefs, brandDomainEnabled: !!v });

  const setBrandDomain = (value: string) =>
    setDraft({ ...prefs, brandDomain: value });

  /** Save/Reset */
  const save = () => setSavedPrefs(prefs);

  const reset = () => {
    setDraft(DEFAULT_PREFS);
    setSavedPrefs(DEFAULT_PREFS);
  };

  return {
    prefs,
    savedPrefs,
    setKeywordMode,
    setTargetWords,
    setExtraInstructions,
    setMood,
    setParagraphWords,
    setIncludeConclusion,
    setCustomModeEnabled,
    setArticleCount,
    setLanguage,
    setTotalContentWords,
    setTitleLength,
    setIncludeBulletPoints,
    setIncludeTables,
    setIncludeEmojis,
    setIncludeBoxesQuotesHighlights,
    setIncludeQandA,
    setBrandDomainEnabled,
    setBrandDomain,
    save,
    reset,
  };
}
