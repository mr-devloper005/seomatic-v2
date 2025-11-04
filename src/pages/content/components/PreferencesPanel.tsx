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

// import { useMemo, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   useContentPreferences,
//   type ParagraphWordTarget,
//   type SectionCount,
//   type ContentMood,
//   type KeywordMode
// } from "@/hooks/use-preferences";

// const MOODS: ContentMood[] = ["Entertaining","Informative","Inspirational","Humorous","Emotional","Educational"];
// const PARA_OPTS: ParagraphWordTarget[] = [80, 100, 120, 150];
// const SEC_OPTS: SectionCount[] = [4, 5, 6];
// const KW_OPTS: KeywordMode[] = [1, 2, 4];

// // ~100 language options (abbrev list trimmed for readability; add/remove as you like)
// const LANGS = [
//   "English (UK)", "English (US)", "Hindi", "Spanish (ES)", "Spanish (LA)", "French", "German", "Italian",
//   "Portuguese (BR)", "Portuguese (PT)", "Russian", "Arabic", "Bengali", "Punjabi", "Urdu", "Gujarati",
//   "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Odia", "Assamese", "Maithili", "Nepali",
//   "Sinhala", "Thai", "Vietnamese", "Indonesian", "Malay", "Filipino", "Turkish", "Persian", "Hebrew",
//   "Ukrainian", "Polish", "Czech", "Slovak", "Hungarian", "Romanian", "Bulgarian", "Serbian", "Croatian",
//   "Greek", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Estonian", "Lithuanian", "Latvian",
//   "Chinese (Simplified)", "Chinese (Traditional)", "Japanese", "Korean",
//   "Afrikaans", "Swahili", "Zulu", "Xhosa", "Amharic", "Hausa", "Yoruba", "Igbo",
//   "Irish", "Scottish Gaelic", "Welsh", "Basque", "Catalan", "Galician",
//   "Slovenian", "Albanian", "Armenian", "Azerbaijani", "Georgian", "Kazakh", "Kyrgyz", "Uzbek", "Tajik",
//   "Mongolian", "Khmer", "Lao", "Burmese", "Pashto", "Kurdish", "Somali", "Tigrinya", "Haitian Creole",
//   "Luxembourgish", "Icelandic", "Macedonian", "Bosnian", "Belarusian", "Malayalam (Manglish)",
//   "Sindhi", "Konkani", "Bodo", "Dogri", "Santali", "Kashmiri"
// ];

// export function PreferencesPanel() {
//   const {
//     prefs, savedPrefs,
//     setKeywordMode, setExtraInstructions,
//     setMood, setParagraphWords, setSectionCount, setIncludeConclusion,
//     setCustomModeEnabled, setArticleCount, setLanguage,
//     save, reset
//   } = useContentPreferences();

//   const [langQuery, setLangQuery] = useState("");
//   const langList = useMemo(
//     () => LANGS.filter(l => l.toLowerCase().includes(langQuery.toLowerCase())).slice(0, 20),
//     [langQuery]
//   );

//   const dirty = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

//   return (
//     <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl">
//       <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/30 via-fuchsia-200/30 to-indigo-200/30" />
//       <CardHeader className="relative">
//         <CardTitle className="text-xl font-bold tracking-tight">Content Preferences</CardTitle>
//       </CardHeader>

//       <CardContent className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-3">
//         {/* Keyword grouping */}
//         <div className="space-y-3">
//           <div className="text-sm font-semibold">Keyword Mode</div>
//           <div className="flex flex-wrap gap-2">
//             {KW_OPTS.map((m) => (
//               <Button key={m}
//                 variant={prefs.keywordMode === m ? "default" : "outline"}
//                 onClick={() => setKeywordMode(m)}
//                 className="rounded-2xl">
//                 {m} keyword{m > 1 ? "s" : ""} / article
//               </Button>
//             ))}
//           </div>
//           <p className="text-xs text-muted-foreground">Groups per article; anchors placed deterministically.</p>
//         </div>

//         {/* Mood */}
//         <div className="space-y-3">
//           <div className="text-sm font-semibold">Content Mood</div>
//           <div className="flex flex-wrap gap-2">
//             {MOODS.map((m) => (
//               <Button key={m}
//                 variant={prefs.mood === m ? "default" : "outline"}
//                 onClick={() => setMood(m)}
//                 className="rounded-2xl">
//                 {m}
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Paragraph length */}
//         <div className="space-y-3">
//           <div className="text-sm font-semibold">Per-Paragraph Length</div>
//           <div className="flex flex-wrap gap-2">
//             {PARA_OPTS.map((w) => (
//               <Button key={w}
//                 variant={prefs.paragraphWords === w ? "default" : "outline"}
//                 onClick={() => setParagraphWords(w)}
//                 className="rounded-2xl">
//                 {w} words
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Sections & Conclusion */}
//         <div className="space-y-3">
//           <div className="text-sm font-semibold">Sections per Article</div>
//           <div className="flex flex-wrap gap-2">
//             {SEC_OPTS.map((n) => (
//               <Button key={n}
//                 variant={prefs.sectionCount === n ? "default" : "outline"}
//                 onClick={() => setSectionCount(n)}
//                 className="rounded-2xl">
//                 {n} sections
//               </Button>
//             ))}
//           </div>
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={prefs.includeConclusion}
//               onChange={(e) => setIncludeConclusion(e.target.checked)}
//             />
//             Include a <strong className="ml-1">Conclusion</strong> section
//           </label>
//         </div>

//         {/* Custom generation */}
//         <div className="space-y-3">
//           <div className="text-sm font-semibold">Custom Article Count</div>
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={prefs.customModeEnabled}
//               onChange={(e) => setCustomModeEnabled(e.target.checked)}
//             />
//             Enable custom count (reuse/mix keywords randomly)
//           </label>
//           <div className="flex items-center gap-2">
//             <input
//               type="number"
//               min={1}
//               max={200}
//               value={prefs.articleCount}
//               onChange={(e) => setArticleCount(Number(e.target.value))}
//               className="w-28 rounded-md border px-2 py-1 text-sm"
//             />
//             <span className="text-xs text-muted-foreground">1–200 articles in one run.</span>
//           </div>
//         </div>

//         {/* Language picker with search */}
//         <div className="space-y-3">
//           <div className="text-sm font-semibold">Language</div>
//           <input
//             type="text"
//             value={langQuery}
//             onChange={(e) => setLangQuery(e.target.value)}
//             placeholder="Search language…"
//             className="w-full rounded-md border px-2 py-1 text-sm"
//           />
//           <div className="max-h-40 overflow-auto rounded-md border">
//             {langList.map((l) => (
//               <button
//                 key={l}
//                 onClick={() => { setLanguage(l); setLangQuery(""); }}
//                 className={`block w-full text-left px-3 py-2 text-sm hover:bg-accent ${prefs.language === l ? "bg-accent" : ""}`}
//               >
//                 {l}
//               </button>
//             ))}
//           </div>
//           <div className="text-xs text-muted-foreground">Selected: <strong>{prefs.language}</strong></div>
//         </div>

//         {/* Extra instructions + Save/Reset */}
//         <div className="space-y-3 xl:col-span-1">
//           <div className="text-sm font-semibold">Your instruction (highest priority)</div>
//           <Textarea
//             value={prefs.extraInstructions}
//             onChange={(e) => setExtraInstructions(e.target.value)}
//             placeholder="Audience, must-include topics, formatting notes, etc."
//             className="min-h-[140px]"
//           />
//           <div className="flex gap-2">
//             <Button onClick={save} disabled={!dirty} className="rounded-2xl">Save</Button>
//             <Button variant="outline" onClick={reset} className="rounded-2xl">Reset</Button>
//           </div>
//           <p className="text-xs text-muted-foreground">“Save” applies these settings for the next generations.</p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// import React, { useMemo, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Slider } from "@/components/ui/slider";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";
// import {
//   useContentPreferences,
//   type ParagraphWordTarget,
//   type SectionCount,
//   type ContentMood,
//   type KeywordMode,
// } from "@/hooks/use-preferences";
// import { Check, ChevronDown, Globe2, Sparkles, Wand2 } from "lucide-react";

// /**
//  * Premium revamp goals
//  * - "even" grid with equal visual weight, consistent padding, and breathing room
//  * - subtle glassmorphism + gradient accents (premium but not loud)
//  * - segmented controls for one-tap selection
//  * - clearer affordances for advanced/custom options
//  */

// const MOODS: ContentMood[] = [
//   "Entertaining",
//   "Informative",
//   "Inspirational",
//   "Humorous",
//   "Emotional",
//   "Educational",
// ];
// const PARA_OPTS: ParagraphWordTarget[] = [80, 100, 120, 150];
// const SEC_OPTS: SectionCount[] = [4, 5, 6];
// const KW_OPTS: KeywordMode[] = [1, 2, 4];

// // ~100 language options (abbrev list trimmed for readability; add/remove as you like)
// const LANGS = [
//   "English (UK)",
//   "English (US)",
//   "Hindi",
//   "Spanish (ES)",
//   "Spanish (LA)",
//   "French",
//   "German",
//   "Italian",
//   "Portuguese (BR)",
//   "Portuguese (PT)",
//   "Russian",
//   "Arabic",
//   "Bengali",
//   "Punjabi",
//   "Urdu",
//   "Gujarati",
//   "Marathi",
//   "Tamil",
//   "Telugu",
//   "Kannada",
//   "Malayalam",
//   "Odia",
//   "Assamese",
//   "Maithili",
//   "Nepali",
//   "Sinhala",
//   "Thai",
//   "Vietnamese",
//   "Indonesian",
//   "Malay",
//   "Filipino",
//   "Turkish",
//   "Persian",
//   "Hebrew",
//   "Ukrainian",
//   "Polish",
//   "Czech",
//   "Slovak",
//   "Hungarian",
//   "Romanian",
//   "Bulgarian",
//   "Serbian",
//   "Croatian",
//   "Greek",
//   "Dutch",
//   "Swedish",
//   "Norwegian",
//   "Danish",
//   "Finnish",
//   "Estonian",
//   "Lithuanian",
//   "Latvian",
//   "Chinese (Simplified)",
//   "Chinese (Traditional)",
//   "Japanese",
//   "Korean",
//   "Afrikaans",
//   "Swahili",
//   "Zulu",
//   "Xhosa",
//   "Amharic",
//   "Hausa",
//   "Yoruba",
//   "Igbo",
//   "Irish",
//   "Scottish Gaelic",
//   "Welsh",
//   "Basque",
//   "Catalan",
//   "Galician",
//   "Slovenian",
//   "Albanian",
//   "Armenian",
//   "Azerbaijani",
//   "Georgian",
//   "Kazakh",
//   "Kyrgyz",
//   "Uzbek",
//   "Tajik",
//   "Mongolian",
//   "Khmer",
//   "Lao",
//   "Burmese",
//   "Pashto",
//   "Kurdish",
//   "Somali",
//   "Tigrinya",
//   "Haitian Creole",
//   "Luxembourgish",
//   "Icelandic",
//   "Macedonian",
//   "Bosnian",
//   "Belarusian",
//   "Malayalam (Manglish)",
//   "Sindhi",
//   "Konkani",
//   "Bodo",
//   "Dogri",
//   "Santali",
//   "Kashmiri",
// ];

// /** Segmented button helper */
// function Segmented<T extends string | number>({
//   value,
//   onChange,
//   items,
//   render,
//   className,
// }: {
//   value: T;
//   onChange: (v: T) => void;
//   items: T[];
//   render?: (v: T) => React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <div
//       className={cn(
//         "inline-flex w-full flex-wrap gap-2 rounded-2xl border bg-background/60 p-1 backdrop-blur",
//         "[--ring:rgba(56,189,248,0.35)] focus-within:ring-2 focus-within:ring-[--ring]",
//         className
//       )}
//     >
//       {items.map((it) => {
//         const active = it === value;
//         return (
//           <Button
//             key={String(it)}
//             type="button"
//             size="sm"
//             variant={active ? "default" : "ghost"}
//             onClick={() => onChange(it)}
//             className={cn(
//               "rounded-xl px-3 py-1.5",
//               active
//                 ? "shadow-[0_0_0_1px_hsl(var(--border))_inset,0_10px_30px_-10px]"
//                 : "border"
//             )}
//           >
//             {render ? render(it) : String(it)}
//           </Button>
//         );
//       })}
//     </div>
//   );
// }

// /** Gradient frame wrapper */
// function GradientFrame({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative rounded-3xl p-[1px]">
//       <div className="absolute -inset-[1px] rounded-3xl bg-[conic-gradient(at_10%_10%,#34d399_0deg,#8b5cf6_120deg,#06b6d4_240deg,#34d399_360deg)] opacity-40 blur-[6px]" />
//       <div className="relative rounded-3xl bg-gradient-to-b from-background/70 to-background/40">
//         {children}
//       </div>
//     </div>
//   );
// }

// export function PreferencesPanel() {
//   const {
//     prefs,
//     savedPrefs,
//     setKeywordMode,
//     setExtraInstructions,
//     setMood,
//     setParagraphWords,
//     setSectionCount,
//     setIncludeConclusion,
//     setCustomModeEnabled,
//     setArticleCount,
//     setLanguage,
//     save,
//     reset,
//   } = useContentPreferences();

//   const [langQuery, setLangQuery] = useState("");
//   const langList = useMemo(
//     () => LANGS.filter((l) => l.toLowerCase().includes(langQuery.toLowerCase())).slice(0, 20),
//     [langQuery]
//   );

//   const dirty = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

//   return (
//     <GradientFrame>
//       <Card className={cn(
//         "relative overflow-hidden border-0 shadow-2xl rounded-3xl",
//         "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(60%_40%_at_20%_0%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(50%_35%_at_80%_0%,rgba(16,185,129,0.18),transparent_55%)]"
//       )}>
//         <CardHeader className="relative pb-2">
//           <div className="flex items-center justify-between gap-3">
//             <div>
//               <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
//                 <Sparkles className="h-5 w-5" /> Content Preferences
//               </CardTitle>
//               <p className="mt-1 text-sm text-muted-foreground">Tune the generator once; reuse everywhere. Clean, even layout · premium styling.</p>
//             </div>
//             <Badge variant={dirty ? "default" : "outline"} className="rounded-full px-3 py-1 text-xs">
//               {dirty ? "Unsaved changes" : "Up to date"}
//             </Badge>
//           </div>
//         </CardHeader>

//         <CardContent className="relative">
//           <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
//             {/* Keyword mode */}
//             <section className="space-y-3">
//               <Label className="text-sm font-semibold">Keyword Mode</Label>
//               <Segmented
//                 value={prefs.keywordMode}
//                 onChange={(m) => setKeywordMode(m as KeywordMode)}
//                 items={KW_OPTS}
//                 render={(m) => (
//                   <span>
//                     {m} keyword{Number(m) > 1 ? "s" : ""} / article
//                   </span>
//                 )}
//               />
//               <p className="text-xs text-muted-foreground">Groups per article; anchors placed deterministically.</p>
//             </section>

//             {/* Mood */}
//             <section className="space-y-3">
//               <Label className="text-sm font-semibold">Content Mood</Label>
//               <Segmented value={prefs.mood} onChange={(m) => setMood(m as ContentMood)} items={MOODS} />
//             </section>

//             {/* Per-paragraph length */}
//             <section className="space-y-3">
//               <Label className="text-sm font-semibold">Per‑Paragraph Length</Label>
//               <Segmented
//                 value={prefs.paragraphWords}
//                 onChange={(w) => setParagraphWords(w as ParagraphWordTarget)}
//                 items={PARA_OPTS}
//                 render={(w) => <span>{w} words</span>}
//               />
//             </section>

//             {/* Sections & conclusion */}
//             <section className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label className="text-sm font-semibold">Sections per Article</Label>
//                 <div className="text-xs text-muted-foreground">Structure</div>
//               </div>
//               <Segmented
//                 value={prefs.sectionCount}
//                 onChange={(n) => setSectionCount(n as SectionCount)}
//                 items={SEC_OPTS}
//                 render={(n) => <span>{n} sections</span>}
//               />
//               <div className="flex items-center justify-between rounded-2xl border px-3 py-2">
//                 <div className="flex items-center gap-2">
//                   <Switch
//                     checked={prefs.includeConclusion}
//                     onCheckedChange={(v: boolean) => setIncludeConclusion(!!v)}
//                     id="include-conclusion"
//                   />
//                   <Label htmlFor="include-conclusion">Include a <strong className="ml-1">Conclusion</strong> section</Label>
//                 </div>
//               </div>
//             </section>

//             {/* Custom generation */}
//             <section className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label className="text-sm font-semibold">Custom Article Count</Label>
//                 <Wand2 className="h-4 w-4 opacity-70" />
//               </div>
//               <div className="rounded-2xl border p-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <Switch
//                       checked={prefs.customModeEnabled}
//                       onCheckedChange={(v: boolean) => setCustomModeEnabled(!!v)}
//                       id="custom-mode"
//                     />
//                     <Label htmlFor="custom-mode">Enable custom count (random reuse/mix)</Label>
//                   </div>
//                   {prefs.customModeEnabled && <Badge variant="secondary">Active</Badge>}
//                 </div>
//                 <Separator className="my-3" />
//                 <div className="grid grid-cols-[1fr_auto] items-center gap-3">
//                   <div>
//                     <Slider
//                       value={[prefs.articleCount]}
//                       min={1}
//                       max={200}
//                       step={1}
//                       onValueChange={([v]: [number]) => setArticleCount(v)}
//                       className="w-full"
//                     />
//                   </div>
//                   <Input
//                     type="number"
//                     min={1}
//                     max={200}
//                     value={prefs.articleCount}
//                     onChange={(e) => setArticleCount(Number(e.target.value))}
//                     className="w-24 text-center"
//                   />
//                 </div>
//                 <p className="mt-2 text-xs text-muted-foreground">Generate between 1–200 articles in one run.</p>
//               </div>
//             </section>

//             {/* Language picker */}
//             <section className="space-y-3">
//               <Label className="text-sm font-semibold flex items-center gap-2"><Globe2 className="h-4 w-4" /> Language</Label>
//               <div className="rounded-2xl border p-3">
//                 <div className="flex items-center gap-2">
//                   <Input
//                     value={langQuery}
//                     onChange={(e) => setLangQuery(e.target.value)}
//                     placeholder="Search language…"
//                     className="flex-1"
//                   />
//                   <Button variant="outline" size="sm" className="rounded-xl">
//                     <ChevronDown className="mr-1 h-4 w-4" />
//                     Browse
//                   </Button>
//                 </div>
//                 <div className="mt-3 max-h-44 overflow-auto rounded-xl border">
//                   {langList.map((l) => {
//                     const active = prefs.language === l;
//                     return (
//                       <button
//                         key={l}
//                         onClick={() => {
//                           setLanguage(l);
//                           setLangQuery("");
//                         }}
//                         className={cn(
//                           "group flex w-full items-center justify-between px-3 py-2 text-left text-sm",
//                           active ? "bg-accent/60" : "hover:bg-accent/40"
//                         )}
//                       >
//                         <span>{l}</span>
//                         {active && <Check className="h-4 w-4 opacity-80" />}
//                       </button>
//                     );
//                   })}
//                 </div>
//                 <div className="mt-2 text-xs text-muted-foreground">
//                   Selected: <strong>{prefs.language}</strong>
//                 </div>
//               </div>
//             </section>

//             {/* Extra instructions */}
//             <section className="space-y-3 xl:col-span-1">
//               <Label className="text-sm font-semibold">Your instruction (highest priority)</Label>
//               <Textarea
//                 value={prefs.extraInstructions}
//                 onChange={(e) => setExtraInstructions(e.target.value)}
//                 placeholder="Audience, must‑include topics, formatting notes, etc."
//                 className="min-h-[160px] rounded-2xl"
//               />
//               <div className="flex gap-2">
//                 <Button onClick={save} disabled={!dirty} className="rounded-2xl">
//                   Save
//                 </Button>
//                 <Button variant="outline" onClick={reset} className="rounded-2xl">
//                   Reset
//                 </Button>
//               </div>
//               <p className="text-xs text-muted-foreground">“Save” applies these settings to your next generations.</p>
//             </section>
//           </div>

//           {/* Footer bar */}
//           <div className="mt-8 rounded-2xl border bg-background/60 p-4 backdrop-blur">
//             <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//               <div className="text-sm text-muted-foreground">
//                 Tip: Combine a <em>mood</em> with <em>paragraph length</em> to shift cadence without losing structure.
//               </div>
//               <div className="flex items-center gap-2">
//                 <Badge variant="outline" className="rounded-full">Even layout</Badge>
//                 <Badge variant="outline" className="rounded-full">Premium theme</Badge>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </GradientFrame>
//   );
// }

// export default PreferencesPanel;

// import React, { useMemo, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Slider } from "@/components/ui/slider";
// import { Badge } from "@/components/ui/badge";
// // import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";
// import {
//   useContentPreferences,
//   type ParagraphWordTarget,
//   type SectionCount,
//   type ContentMood,
//   type KeywordMode,
// } from "@/hooks/use-preferences";
// import { Check,  Globe2, Sparkles, Wand2 } from "lucide-react";

// const MOODS: ContentMood[] = [
//   "Entertaining",
//   "Informative",
//   "Inspirational",
//   "Humorous",
//   "Emotional",
//   "Educational",
// ];
// const PARA_OPTS: ParagraphWordTarget[] = [80, 100, 120, 150];
// const SEC_OPTS: SectionCount[] = [4, 5, 6];
// const KW_OPTS: KeywordMode[] = [1, 2, 4];
// const LANGS = [
//   "English (US)",
//   "English (UK)",
//   "Hindi",
//   "Spanish",
//   "French",
//   "German",
//   "Italian",
//   "Portuguese",
//   "Russian",
//   "Arabic",
//   "Japanese",
// ];

// /** Compact segmented buttons */
// function Segmented<T extends string | number>({
//   value,
//   onChange,
//   items,
//   render,
//   className,
// }: {
//   value: T;
//   onChange: (v: T) => void;
//   items: T[];
//   render?: (v: T) => React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <div
//       className={cn(
//         "inline-flex w-full flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm",
//         "hover:shadow-md transition-all duration-200",
//         className
//       )}
//     >
//       {items.map((it) => {
//         const active = it === value;
//         return (
//           <Button
//             key={String(it)}
//             size="sm"
//             variant={active ? "default" : "ghost"}
//             onClick={() => onChange(it)}
//             className={cn(
//               "rounded-lg px-3 py-1.5 text-sm transition-all",
//               active
//                 ? "bg-gradient-to-r from-blue-500 to-green-400 text-white shadow-sm"
//                 : "border border-transparent text-gray-700 hover:text-blue-600 hover:bg-orange-50"
//             )}
//           >
//             {render ? render(it) : String(it)}
//           </Button>
//         );
//       })}
//     </div>
//   );
// }

// /** Subtle gradient border frame */
// function GradientFrame({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-gray-400 via-green-300/30 to-orange-300/40">
//       <div className="relative rounded-3xl bg-gradient-to-b from-gray-400 to-green-400 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
//         {children}
//       </div>
//     </div>
//   );
// }

// export function PreferencesPanel() {
//   const {
//     prefs,
//     savedPrefs,
//     setKeywordMode,
//     setExtraInstructions,
//     setMood,
//     setParagraphWords,
//     setSectionCount,
//     setIncludeConclusion,
//     setCustomModeEnabled,
//     setArticleCount,
//     setLanguage,

//     reset,
//   } = useContentPreferences();

//   const [langQuery, setLangQuery] = useState("");
//   const langList = useMemo(
//     () => LANGS.filter((l) => l.toLowerCase().includes(langQuery.toLowerCase())),
//     [langQuery]
//   );
//   const dirty = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

//   return (
//     <GradientFrame>
//       <Card className="relative border-0 shadow-xl rounded-3xl">
//         {/* Header */}
//         <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-400 bg-gradient-to-r from-blue-200 to-green-100 rounded-t-3xl">
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <div>
//               <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2 text-blue-700">
//                 <Sparkles className="h-5 w-5 text-green-500" /> Content Preferences
//               </CardTitle>
//               <p className="mt-1 text-sm text-gray-500">
//                 Fine-tune how your articles should feel, read, and look.
//               </p>
//             </div>
//             <Badge
//               variant={dirty ? "default" : "outline"}
//               className={cn(
//                 "rounded-full px-3 py-1 text-xs",
//                 dirty
//                   ? "bg-green-500 text-white"
//                   : "border border-gray-300 text-gray-500 bg-white"
//               )}
//             >
//               {dirty ? "Unsaved Changes" : "Up to Date"}
//             </Badge>
//           </div>
//         </CardHeader>

//         {/* Main Content */}
//         <CardContent className="px-6 py-8">
//           <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-2">
//             {/* Keyword Mode */}
//             <section>
//               <Label className="text-sm font-semibold text-gray-800 mb-2 block">
//                 Keyword Mode
//               </Label>
//               <Segmented
//                 value={prefs.keywordMode}
//                 onChange={(m) => setKeywordMode(m as KeywordMode)}
//                 items={KW_OPTS}
//                 render={(m) => (
//                   <span>
//                     {m} keyword{Number(m) > 1 ? "s" : ""} / article
//                   </span>
//                 )}
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 Defines how many keyword sets per generated article.
//               </p>
//             </section>

//             {/* Mood */}
//             <section>
//               <Label className="text-sm font-semibold text-gray-800 mb-2 block">
//                 Content Mood
//               </Label>
//               <Segmented
//                 value={prefs.mood}
//                 onChange={(m) => setMood(m as ContentMood)}
//                 items={MOODS}
//               />
//             </section>

//             {/* Paragraph Words */}
//             <section>
//               <Label className="text-sm font-semibold text-gray-800 mb-2 block">
//                 Paragraph Length
//               </Label>
//               <Segmented
//                 value={prefs.paragraphWords}
//                 onChange={(w) => setParagraphWords(w as ParagraphWordTarget)}
//                 items={PARA_OPTS}
//                 render={(w) => <span>{w} words</span>}
//               />
//             </section>

//             {/* Structure */}
//             <section>
//               <Label className="text-sm font-semibold text-gray-800 mb-2 block">
//                 Structure & Sections
//               </Label>
//               <Segmented
//                 value={prefs.sectionCount}
//                 onChange={(n) => setSectionCount(n as SectionCount)}
//                 items={SEC_OPTS}
//                 render={(n) => <span>{n} sections</span>}
//               />
//               <div className="mt-3 flex items-center gap-3 border border-gray-200 rounded-2xl p-3 bg-gray-50 hover:border-blue-300 transition">
//                 <Switch
//                   checked={prefs.includeConclusion}
//                   onCheckedChange={(v: boolean) => setIncludeConclusion(!!v)}
//                   id="include-conclusion"
//                 />
//                 <Label
//                   htmlFor="include-conclusion"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Include Conclusion
//                 </Label>
//               </div>
//             </section>

//             {/* Custom Count */}
//             <section>
//               <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
//                 <Wand2 className="h-4 w-4 text-green-500" /> Custom Article Count
//               </Label>
//               <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-inner">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <Switch
//                       checked={prefs.customModeEnabled}
//                       onCheckedChange={(v: boolean) => setCustomModeEnabled(!!v)}
//                     />
//                     <span className="text-sm text-gray-700">Enable random reuse</span>
//                   </div>
//                   {prefs.customModeEnabled && (
//                     <Badge className="bg-green-500 text-white">Active</Badge>
//                   )}
//                 </div>
//                 <Slider
//                   value={[prefs.articleCount]}
//                   min={1}
//                   max={200}
//                   step={1}
//                   onValueChange={([v]: [number]) => setArticleCount(v)}
//                   className="mb-3"
//                 />
//                 <Input
//                   type="number"
//                   min={1}
//                   max={200}
//                   value={prefs.articleCount}
//                   onChange={(e) => setArticleCount(Number(e.target.value))}
//                   className="w-24 text-center border-gray-300"
//                 />
//               </div>
//             </section>

//             {/* Language */}
//             <section>
//               <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
//                 <Globe2 className="h-4 w-4 text-blue-500" /> Language
//               </Label>
//               <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-sm">
//                 <Input
//                   value={langQuery}
//                   onChange={(e) => setLangQuery(e.target.value)}
//                   placeholder="Search language..."
//                   className="mb-2 border-gray-300"
//                 />
//                 <div className="max-h-44 overflow-auto rounded-lg border border-gray-200">
//                   {langList.map((l) => {
//                     const active = prefs.language === l;
//                     return (
//                       <button
//                         key={l}
//                         onClick={() => {
//                           setLanguage(l);
//                           setLangQuery("");
//                         }}
//                         className={cn(
//                           "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition",
//                           active
//                             ? "bg-gradient-to-r from-green-400/30 to-blue-400/30 text-gray-900 font-medium"
//                             : "hover:bg-orange-50"
//                         )}
//                       >
//                         <span>{l}</span>
//                         {active && <Check className="h-4 w-4 text-green-600" />}
//                       </button>
//                     );
//                   })}
//                 </div>
//                 <p className="mt-2 text-xs text-gray-500">
//                   Selected: <strong>{prefs.language}</strong>
//                 </p>
//               </div>
//             </section>

//             {/* Instructions */}
//             <section className="xl:col-span-2">
//               <Label className="text-sm font-semibold text-gray-800 mb-2 block">
//                 Additional Instructions
//               </Label>
//               <Textarea
//                 value={prefs.extraInstructions}
//                 onChange={(e) => setExtraInstructions(e.target.value)}
//                 placeholder="Describe tone, structure, audience, or must-include ideas..."
//                 className="min-h-[140px] border-gray-300 rounded-2xl bg-white shadow-sm border-4 hover:shadow-md transition-all"
//               />
//               <div className="flex gap-2 mt-3">
//                 <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-green-400 text-white hover:from-blue-600 hover:to-orange-400 transition-all">
//                   Save
//                 </Button>
//                 <Button
//                   variant="outline"
//                   onClick={reset}
//                   className="rounded-2xl border-gray-300 text-gray-700 hover:bg-orange-50"
//                 >
//                   Reset
//                 </Button>
//               </div>
//             </section>
//           </div>

//           {/* Footer */}
//           <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm flex flex-wrap items-center justify-between shadow-sm">
//             <span className="text-gray-600">
//               💡 Combine <b>mood</b> and <b>length</b> to produce natural, human-like rhythm.
//             </span>

//           </div>
//         </CardContent>
//       </Card>
//     </GradientFrame>
//   );
// }

// src/components/PreferencesPanel.tsx
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useContentPreferences,
  type ParagraphWordTarget,
  type SectionCount,
  type ContentMood,
  type KeywordMode,
} from "@/hooks/use-preferences";
import { Check, Globe2, Sparkles, Wand2 } from "lucide-react";

const MOODS: ContentMood[] = [
  "Entertaining",
  "Informative",
  "Inspirational",
  "Humorous",
  "Emotional",
  "Educational",
];
const PARA_OPTS: ParagraphWordTarget[] = [80, 100, 120, 150];
const SEC_OPTS: SectionCount[] = [4, 5, 6];
const KW_OPTS: KeywordMode[] = [1, 2, 4];
const LANGS = [
  "English (UK)",
  "English (US)",
  "Hindi",
  "Spanish (ES)",
  "Spanish (LA)",
  "French",
  "German",
  "Italian",
  "Portuguese (BR)",
  "Portuguese (PT)",
  "Russian",
  "Arabic",
  "Bengali",
  "Punjabi",
  "Urdu",
  "Gujarati",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Odia",
  "Assamese",
  "Maithili",
  "Nepali",
  "Sinhala",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
  "Filipino",
  "Turkish",
  "Persian",
  "Hebrew",
  "Ukrainian",
  "Polish",
  "Czech",
  "Slovak",
  "Hungarian",
  "Romanian",
  "Bulgarian",
  "Serbian",
  "Croatian",
  "Greek",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Estonian",
  "Lithuanian",
  "Latvian",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Japanese",
  "Korean",
  "Afrikaans",
  "Swahili",
  "Zulu",
  "Xhosa",
  "Amharic",
  "Hausa",
  "Yoruba",
  "Igbo",
  "Irish",
  "Scottish Gaelic",
  "Welsh",
  "Basque",
  "Catalan",
  "Galician",
  "Slovenian",
  "Albanian",
  "Armenian",
  "Azerbaijani",
  "Georgian",
  "Kazakh",
  "Kyrgyz",
  "Uzbek",
  "Tajik",
  "Mongolian",
  "Khmer",
  "Lao",
  "Burmese",
  "Pashto",
  "Kurdish",
  "Somali",
  "Tigrinya",
  "Haitian Creole",
  "Luxembourgish",
  "Icelandic",
  "Macedonian",
  "Bosnian",
  "Belarusian",
  "Malayalam (Manglish)",
  "Sindhi",
  "Konkani",
  "Bodo",
  "Dogri",
  "Santali",
  "Kashmiri",
];

/** Compact segmented buttons */
function Segmented<T extends string | number>({
  value,
  onChange,
  items,
  render,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  items: T[];
  render?: (v: T) => React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex w-full flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm",
        "hover:shadow-md transition-all duration-200",
        className
      )}>
      {items.map((it) => {
        const active = it === value;
        return (
          <Button
            key={String(it)}
            size="sm"
            variant={active ? "default" : "ghost"}
            onClick={() => onChange(it)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm transition-all",
              active
                ? "bg-gradient-to-r from-blue-500 to-green-400 text-white shadow-sm"
                : "border border-transparent text-gray-700 hover:text-blue-600 hover:bg-orange-50"
            )}>
            {render ? render(it) : String(it)}
          </Button>
        );
      })}
    </div>
  );
}

/** Subtle gradient border frame */
function GradientFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-gray-200 via-green-200/40 to-orange-200/40">
      <div className="relative rounded-3xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        {children}
      </div>
    </div>
  );
}

export function PreferencesPanel() {
  const {
    prefs,
    savedPrefs,
    setKeywordMode,
    setExtraInstructions,
    setMood,
    setParagraphWords,
    setSectionCount,
    setIncludeConclusion,
    setCustomModeEnabled,
    setArticleCount,
    setLanguage,
    save, // ✅ now used
    reset,
  } = useContentPreferences();

  const [langQuery, setLangQuery] = useState("");
  const langList = useMemo(
    () =>
      LANGS.filter((l) => l.toLowerCase().includes(langQuery.toLowerCase())),
    [langQuery]
  );
  const dirty = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

  const handleSave = () => {
    save();
    toast.success("Preferences saved");
  };

  return (
    <GradientFrame>
      <Card className="relative border-0 shadow-xl rounded-3xl">
        {/* Header */}
        <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 rounded-t-3xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2 text-blue-700">
                <Sparkles className="h-5 w-5 text-green-500" /> Content
                Preferences
              </CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Fine-tune how your articles should feel, read, and look.
              </p>
            </div>
            <Badge
              variant={dirty ? "default" : "outline"}
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                dirty
                  ? "bg-green-500 text-white"
                  : "border border-gray-300 text-gray-600 bg-white"
              )}>
              {dirty ? "Unsaved Changes" : "Up to Date"}
            </Badge>
          </div>
        </CardHeader>

        {/* Main Content */}
        <CardContent className="px-6 py-8">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-2">
            {/* Keyword Mode */}
            <section>
              <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                Keyword Mode
              </Label>
              <Segmented
                value={prefs.keywordMode}
                onChange={(m) => setKeywordMode(m as KeywordMode)}
                items={KW_OPTS}
                render={(m) => (
                  <span>
                    {m} keyword{Number(m) > 1 ? "s" : ""} / article
                  </span>
                )}
              />
              <p className="text-xs text-gray-500 mt-2">
                Defines how many keyword sets per generated article.
              </p>
            </section>

            {/* Mood */}
            <section>
              <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                Content Mood
              </Label>
              <Segmented
                value={prefs.mood}
                onChange={(m) => setMood(m as ContentMood)}
                items={MOODS}
              />
            </section>

            {/* Paragraph Words */}
            <section>
              <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                Paragraph Length
              </Label>
              <Segmented
                value={prefs.paragraphWords}
                onChange={(w) => setParagraphWords(w as ParagraphWordTarget)}
                items={PARA_OPTS}
                render={(w) => <span>{w} words</span>}
              />
            </section>

            {/* Structure */}
            <section>
              <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                Structure & Sections
              </Label>
              <Segmented
                value={prefs.sectionCount}
                onChange={(n) => setSectionCount(n as SectionCount)}
                items={SEC_OPTS}
                render={(n) => <span>{n} sections</span>}
              />
              <div className="mt-3 flex items-center gap-3 border border-gray-200 rounded-2xl p-3 bg-gray-50 hover:border-blue-300 transition">
                <Switch
                  checked={prefs.includeConclusion}
                  onCheckedChange={(v: boolean) => setIncludeConclusion(!!v)}
                  id="include-conclusion"
                />
                <Label
                  htmlFor="include-conclusion"
                  className="text-sm font-medium text-gray-700">
                  Include Conclusion
                </Label>
              </div>
            </section>

            {/* Custom Count */}
            <section>
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <Wand2 className="h-4 w-4 text-green-500" /> Custom Article
                Count
              </Label>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={prefs.customModeEnabled}
                      onCheckedChange={(v: boolean) =>
                        setCustomModeEnabled(!!v)
                      }
                    />
                    <span className="text-sm text-gray-700">
                      Enable random reuse
                    </span>
                  </div>
                  {prefs.customModeEnabled && (
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  )}
                </div>
                <Slider
                  value={[prefs.articleCount]}
                  min={1}
                  max={200}
                  step={1}
                  onValueChange={([v]: [number]) => setArticleCount(v)}
                  className="mb-3"
                />
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={prefs.articleCount}
                  onChange={(e) => setArticleCount(Number(e.target.value))}
                  className="w-24 text-center border-gray-300"
                />
              </div>
            </section>

            {/* Language */}
            <section>
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <Globe2 className="h-4 w-4 text-blue-500" /> Language
              </Label>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-sm">
                <Input
                  value={langQuery}
                  onChange={(e) => setLangQuery(e.target.value)}
                  placeholder="Search language..."
                  className="mb-2 border-gray-300"
                />
                <div className="max-h-44 overflow-auto rounded-lg border border-gray-200">
                  {langList.map((l) => {
                    const active = prefs.language === l;
                    return (
                      <button
                        key={l}
                        onClick={() => {
                          setLanguage(l);
                          setLangQuery("");
                        }}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition",
                          active
                            ? "bg-gradient-to-r from-green-400/20 to-blue-400/20 text-gray-900 font-medium"
                            : "hover:bg-orange-50"
                        )}>
                        <span>{l}</span>
                        {active && <Check className="h-4 w-4 text-green-600" />}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  Selected: <strong>{prefs.language}</strong>
                </p>
              </div>
            </section>

            {/* Instructions */}
            <section className="xl:col-span-2">
              <Label className="text-sm font-semibold text-gray-800 mb-2 block">
                Additional Instructions
              </Label>
              <Textarea
                value={prefs.extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                placeholder="Describe tone, structure, audience, or must-include ideas..."
                className="min-h-[140px] border-gray-300 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
              />
              <div className="flex gap-2 mt-3">
                <Button
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-green-400 text-white hover:from-blue-600 hover:to-orange-400 transition-all"
                  onClick={handleSave}
                  disabled={!dirty}>
                  {dirty ? "Save" : "Saved"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    reset();
                    toast.info("Preferences reset");
                  }}
                  className="rounded-2xl border-gray-300 text-gray-700 hover:bg-orange-50">
                  Reset
                </Button>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm flex flex-wrap items-center justify-between shadow-sm">
            <span className="text-gray-600">
              💡 Combine <b>mood</b> and <b>length</b> to produce natural,
              human-like rhythm.
            </span>
          </div>
        </CardContent>
      </Card>
    </GradientFrame>
  );
}
