// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { useContentPreferences } from "@/hooks/use-preferences";
// import type { TargetWords } from "@/hooks/use-preferences";

// const wordOptions: TargetWords[] = [200, 500, 700, 900];

// export function PreferencesPanel() {
//   const { prefs, savedPrefs, setKeywordMode, setTargetWords, setExtraInstructions, save, reset } = useContentPreferences();

//   const dirty =
//     prefs.keywordMode !== savedPrefs.keywordMode ||
//     prefs.targetWords !== savedPrefs.targetWords ||
//     (prefs.extraInstructions || "") !== (savedPrefs.extraInstructions || "");

//   return (
//     <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl">
//       <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/30 via-fuchsia-200/30 to-indigo-200/30" />
//       <CardHeader className="relative">
//         <CardTitle className="text-xl font-bold tracking-tight">Content Preferences</CardTitle>
//       </CardHeader>

//       <CardContent className="relative grid gap-6 sm:grid-cols-3">
//         {/* Keyword mode */}
//         <div className="space-y-3">
//           <div className="text-sm font-semibold">Keyword Mode</div>
//           <div className="flex flex-wrap gap-2">
//             {[1, 2, 4].map((m) => (
//               <Button
//                 key={m}
//                 variant={prefs.keywordMode === (m as 1 | 2 | 4) ? "default" : "outline"}
//                 onClick={() => setKeywordMode(m as 1 | 2 | 4)}
//                 className="rounded-2xl transition-all"
//               >
//                 {m} keyword{m > 1 ? "s" : ""}
//               </Button>
//             ))}
//           </div>
//           <p className="text-xs text-muted-foreground">
//             Rows will be grouped by {prefs.keywordMode} and anchors placed distinctly.
//           </p>
//         </div>

//         {/* Target words */}
//         <div className="space-y-3">
//           <div className="text-sm font-semibold">Target Word Count</div>
//           <div className="flex flex-wrap gap-2">
//             {wordOptions.map((w) => (
//               <Button
//                 key={w}
//                 variant={prefs.targetWords === w ? "default" : "outline"}
//                 onClick={() => setTargetWords(w)}
//                 className="rounded-2xl transition-all"
//               >
//                 {w} words
//               </Button>
//             ))}
//           </div>
//           <p className="text-xs text-muted-foreground">We aim for 100–120 words per paragraph overall.</p>
//         </div>

//         {/* Extra instructions */}
//         <div className="space-y-3 sm:col-span-1 sm:row-span-2">
//           <div className="text-sm font-semibold">Your instruction (highest priority)</div>
//           <Textarea
//             value={prefs.extraInstructions}
//             onChange={(e) => setExtraInstructions(e.target.value)}
//             placeholder="Language or tone (e.g., 'Hindi'), audience, must-have points, etc."
//             className="min-h-[140px]"
//           />

//           <div className="flex gap-2">
//             <Button onClick={save} disabled={!dirty} className="rounded-2xl">
//               Save
//             </Button>
//             <Button variant="outline" onClick={reset} className="rounded-2xl">
//               Reset
//             </Button>
//           </div>

//           <p className="text-xs text-muted-foreground">
//             “Save” applies these settings for the next generations.
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }




import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useContentPreferences,
  type ParagraphWordTarget,
  type SectionCount,
  type ContentMood,
  type KeywordMode
} from "@/hooks/use-preferences";

const MOODS: ContentMood[] = ["Entertaining","Informative","Inspirational","Humorous","Emotional","Educational"];
const PARA_OPTS: ParagraphWordTarget[] = [80, 100, 120, 150];
const SEC_OPTS: SectionCount[] = [4, 5, 6];
const KW_OPTS: KeywordMode[] = [1, 2, 4];

// ~100 language options (abbrev list trimmed for readability; add/remove as you like)
const LANGS = [
  "English (UK)", "English (US)", "Hindi", "Spanish (ES)", "Spanish (LA)", "French", "German", "Italian",
  "Portuguese (BR)", "Portuguese (PT)", "Russian", "Arabic", "Bengali", "Punjabi", "Urdu", "Gujarati",
  "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Odia", "Assamese", "Maithili", "Nepali",
  "Sinhala", "Thai", "Vietnamese", "Indonesian", "Malay", "Filipino", "Turkish", "Persian", "Hebrew",
  "Ukrainian", "Polish", "Czech", "Slovak", "Hungarian", "Romanian", "Bulgarian", "Serbian", "Croatian",
  "Greek", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Estonian", "Lithuanian", "Latvian",
  "Chinese (Simplified)", "Chinese (Traditional)", "Japanese", "Korean",
  "Afrikaans", "Swahili", "Zulu", "Xhosa", "Amharic", "Hausa", "Yoruba", "Igbo",
  "Irish", "Scottish Gaelic", "Welsh", "Basque", "Catalan", "Galician",
  "Slovenian", "Albanian", "Armenian", "Azerbaijani", "Georgian", "Kazakh", "Kyrgyz", "Uzbek", "Tajik",
  "Mongolian", "Khmer", "Lao", "Burmese", "Pashto", "Kurdish", "Somali", "Tigrinya", "Haitian Creole",
  "Luxembourgish", "Icelandic", "Macedonian", "Bosnian", "Belarusian", "Malayalam (Manglish)",
  "Sindhi", "Konkani", "Bodo", "Dogri", "Santali", "Kashmiri"
];

export function PreferencesPanel() {
  const {
    prefs, savedPrefs,
    setKeywordMode, setExtraInstructions,
    setMood, setParagraphWords, setSectionCount, setIncludeConclusion,
    setCustomModeEnabled, setArticleCount, setLanguage,
    save, reset
  } = useContentPreferences();

  const [langQuery, setLangQuery] = useState("");
  const langList = useMemo(
    () => LANGS.filter(l => l.toLowerCase().includes(langQuery.toLowerCase())).slice(0, 20),
    [langQuery]
  );

  const dirty = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/30 via-fuchsia-200/30 to-indigo-200/30" />
      <CardHeader className="relative">
        <CardTitle className="text-xl font-bold tracking-tight">Content Preferences</CardTitle>
      </CardHeader>

      <CardContent className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Keyword grouping */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">Keyword Mode</div>
          <div className="flex flex-wrap gap-2">
            {KW_OPTS.map((m) => (
              <Button key={m}
                variant={prefs.keywordMode === m ? "default" : "outline"}
                onClick={() => setKeywordMode(m)}
                className="rounded-2xl">
                {m} keyword{m > 1 ? "s" : ""} / article
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Groups per article; anchors placed deterministically.</p>
        </div>

        {/* Mood */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">Content Mood</div>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <Button key={m}
                variant={prefs.mood === m ? "default" : "outline"}
                onClick={() => setMood(m)}
                className="rounded-2xl">
                {m}
              </Button>
            ))}
          </div>
        </div>

        {/* Paragraph length */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">Per-Paragraph Length</div>
          <div className="flex flex-wrap gap-2">
            {PARA_OPTS.map((w) => (
              <Button key={w}
                variant={prefs.paragraphWords === w ? "default" : "outline"}
                onClick={() => setParagraphWords(w)}
                className="rounded-2xl">
                {w} words
              </Button>
            ))}
          </div>
        </div>

        {/* Sections & Conclusion */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">Sections per Article</div>
          <div className="flex flex-wrap gap-2">
            {SEC_OPTS.map((n) => (
              <Button key={n}
                variant={prefs.sectionCount === n ? "default" : "outline"}
                onClick={() => setSectionCount(n)}
                className="rounded-2xl">
                {n} sections
              </Button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={prefs.includeConclusion}
              onChange={(e) => setIncludeConclusion(e.target.checked)}
            />
            Include a <strong className="ml-1">Conclusion</strong> section
          </label>
        </div>

        {/* Custom generation */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">Custom Article Count</div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={prefs.customModeEnabled}
              onChange={(e) => setCustomModeEnabled(e.target.checked)}
            />
            Enable custom count (reuse/mix keywords randomly)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={200}
              value={prefs.articleCount}
              onChange={(e) => setArticleCount(Number(e.target.value))}
              className="w-28 rounded-md border px-2 py-1 text-sm"
            />
            <span className="text-xs text-muted-foreground">1–200 articles in one run.</span>
          </div>
        </div>

        {/* Language picker with search */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">Language</div>
          <input
            type="text"
            value={langQuery}
            onChange={(e) => setLangQuery(e.target.value)}
            placeholder="Search language…"
            className="w-full rounded-md border px-2 py-1 text-sm"
          />
          <div className="max-h-40 overflow-auto rounded-md border">
            {langList.map((l) => (
              <button
                key={l}
                onClick={() => { setLanguage(l); setLangQuery(""); }}
                className={`block w-full text-left px-3 py-2 text-sm hover:bg-accent ${prefs.language === l ? "bg-accent" : ""}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">Selected: <strong>{prefs.language}</strong></div>
        </div>

        {/* Extra instructions + Save/Reset */}
        <div className="space-y-3 xl:col-span-1">
          <div className="text-sm font-semibold">Your instruction (highest priority)</div>
          <Textarea
            value={prefs.extraInstructions}
            onChange={(e) => setExtraInstructions(e.target.value)}
            placeholder="Audience, must-include topics, formatting notes, etc."
            className="min-h-[140px]"
          />
          <div className="flex gap-2">
            <Button onClick={save} disabled={!dirty} className="rounded-2xl">Save</Button>
            <Button variant="outline" onClick={reset} className="rounded-2xl">Reset</Button>
          </div>
          <p className="text-xs text-muted-foreground">“Save” applies these settings for the next generations.</p>
        </div>
      </CardContent>
    </Card>
  );
}
