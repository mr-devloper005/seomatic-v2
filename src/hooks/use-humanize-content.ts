// // src/hooks/use-humanize-content.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";

// /**
//  * Humanized content record
//  */
// export interface HumanizedContentItem {
//   id: string;
//   sourceId?: string;
//   originalHtml: string;
//   humanizedHtml: string;
//   createdAt: string;
//   meta?: {
//     // Approximate heuristic score (0 = very human-like by our heuristic)
//     patternScore?: number;
//     // Count of transformations applied
//     transformations?: number;
//   };
// }

// /**
//  * Simple options to tune aggressiveness
//  */
// export interface HumanizeOptions {
//   // 0–1, higher = more aggressive paraphrase
//   strength: number;
//   // allow light imperfections (tiny natural quirks)
//   allowImperfect: boolean;
// }

// const DEFAULT_OPTIONS: HumanizeOptions = {
//   strength: 0.75, // Increased for better AI-free content
//   allowImperfect: true,
// };

// /**
//  * Public hook
//  *
//  * Usage examples:
//  *  const { humanizeHtml, humanizeMany, items } = useHumanizeContent();
//  *  const clean = await humanizeHtml(generatedHtml, { strength: 0.6 });
//  */
// export default function useHumanizeContent() {
//   const [isHumanizing, setIsHumanizing] = useState(false);

//   const [items, setItems] = useLocalStorage<HumanizedContentItem[]>(
//     "humanized-items_v1",
//     []
//   );

//   /**
//    * Humanize a single HTML string.
//    */
//   const humanizeHtml = async (
//     html: string,
//     opts?: Partial<HumanizeOptions>,
//     sourceId?: string
//   ): Promise<string> => {
//     const options = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     try {
//       if (!html || typeof html !== "string") return html;

//       const result = runHumanizer(html, options);

//       const record: HumanizedContentItem = {
//         id: `${sourceId || "local"}-${Date.now()}-${Math.random()
//           .toString(36)
//           .slice(2, 8)}`,
//         sourceId,
//         originalHtml: html,
//         humanizedHtml: result.html,
//         createdAt: new Date().toISOString(),
//         meta: {
//           patternScore: result.patternScore,
//           transformations: result.transformations,
//         },
//       };

//       startTransition(() => {
//         setItems((prev = []) => [record, ...(prev || [])].slice(0, 500));
//       });

//       return result.html;
//     } catch (err) {
//       console.error("[HUMANIZE] failed:", err);
//       toast.error("Humanizer error: could not transform content.");
//       return html;
//     }
//   };

//   /**
//    * Humanize multiple contents in one go.
//    * items: { id, html }
//    */
//   const humanizeMany = async (
//     batch: { id: string; html: string }[],
//     opts?: Partial<HumanizeOptions>
//   ): Promise<HumanizedContentItem[]> => {
//     const options = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     if (!batch?.length) return [];

//     setIsHumanizing(true);
//     const out: HumanizedContentItem[] = [];

//     try {
//       for (const entry of batch) {
//         const result = runHumanizer(entry.html, options);

//         const record: HumanizedContentItem = {
//           id: `${entry.id || "batch"}-${Date.now()}-${Math.random()
//             .toString(36)
//             .slice(2, 8)}`,
//           sourceId: entry.id,
//           originalHtml: entry.html,
//           humanizedHtml: result.html,
//           createdAt: new Date().toISOString(),
//           meta: {
//             patternScore: result.patternScore,
//             transformations: result.transformations,
//           },
//         };

//         out.push(record);
//       }

//       startTransition(() => {
//         setItems((prev = []) => [...out, ...(prev || [])].slice(0, 500));
//       });

//       toast.success(`Humanized ${out.length} item(s).`);

//       return out;
//     } catch (err) {
//       console.error("[HUMANIZE] batch failed:", err);
//       toast.error("Failed to humanize batch.");
//       return out;
//     } finally {
//       setIsHumanizing(false);
//     }
//   };

//   const clearHumanized = () => {
//     startTransition(() => setItems([]));
//     toast.success("Cleared humanized content history.");
//   };

//   return {
//     isHumanizing,
//     items,
//     humanizeHtml,
//     humanizeMany,
//     clearHumanized,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Core humanizer logic (pure functions)
//  * - Works only on text nodes (tags preserved).
//  * - Applies layered transforms to reduce "LLM-ish" patterns.
//  * ──────────────────────────────────────────────────────────── */

// interface HumanizerResult {
//   html: string;
//   patternScore: number;
//   transformations: number;
// }

// function runHumanizer(html: string, options: HumanizeOptions): HumanizerResult {
//   if (!html) {
//     return { html, patternScore: 1, transformations: 0 };
//   }

//   const parts = splitHtml(html);
//   let transformations = 0;
//   let patternScore = 0;

//   const out = parts
//     .map((part) => {
//       if (part.type === "tag") return part.value;

//       const original = part.value;
//       let text = original;

//       // Preserve original spacing structure - don't normalize aggressively
//       // Only normalize excessive spaces (3+ spaces to 2 spaces, keep single spaces)
//       text = text.replace(/\s{3,}/g, "  ");

//       // Layer 1: remove typical AI boilerplate (enhanced)
//       const res1 = replaceBoilerplate(text);
//       text = res1.text;
//       transformations += res1.count;

//       // Layer 2: paraphrase phrases & connectors (enhanced)
//       const res2 = paraphrasePhrases(text, options.strength);
//       text = res2.text;
//       transformations += res2.count;

//       // Layer 3: sentence rhythm tweak (length / breaks) - improved
//       const res3 = adjustSentenceRhythm(text, options.strength);
//       text = res3.text;
//       transformations += res3.count;

//       // Layer 4: word variation and natural language patterns
//       const res4 = varyWordChoice(text, options.strength);
//       text = res4.text;
//       transformations += res4.count;

//       // Layer 5: optional very-light imperfections
//       if (options.allowImperfect) {
//         const res5 = injectHumanQuirks(text, options.strength);
//         text = res5.text;
//         transformations += res5.count;
//       }

//       // Restore proper spacing around punctuation
//       text = fixSpacing(text);

//       // heuristic: more change + less boilerplate => lower "patternScore"
//       patternScore += estimatePatternScore(original, text);

//       return text;
//     })
//     .join("");

//   const avgPatternScore =
//     parts.filter((p) => p.type === "text").length > 0
//       ? patternScore / parts.filter((p) => p.type === "text").length
//       : 1;

//   return {
//     html: out,
//     patternScore: clamp(avgPatternScore, 0, 1),
//     transformations,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Step 0: HTML splitter — separate tags & text
//  * ──────────────────────────────────────────────────────────── */

// type HtmlPart =
//   | { type: "tag"; value: string }
//   | { type: "text"; value: string };

// function splitHtml(html: string): HtmlPart[] {
//   const parts: HtmlPart[] = [];
//   const regex = /(<[^>]+>)/g;
//   let lastIndex = 0;
//   let match: RegExpExecArray | null;

//   while ((match = regex.exec(html)) !== null) {
//     if (match.index > lastIndex) {
//       parts.push({
//         type: "text",
//         value: html.slice(lastIndex, match.index),
//       });
//     }
//     parts.push({ type: "tag", value: match[0] });
//     lastIndex = match.index + match[0].length;
//   }

//   if (lastIndex < html.length) {
//     parts.push({
//       type: "text",
//       value: html.slice(lastIndex),
//     });
//   }

//   return parts;
// }

// /* ────────────────────────────────────────────────────────────
//  * Step 1: remove / soften boilerplate LLM-sounding phrases
//  * ──────────────────────────────────────────────────────────── */

// function replaceBoilerplate(text: string): { text: string; count: number } {
//   const replacements: Array<[RegExp, string]> = [
//     [/in conclusion[, ]*/gi, "To wrap things up, "],
//     [/to conclude[, ]*/gi, "Overall, "],
//     [/in summary[, ]*/gi, "Simply put, "],
//     [/this article will explore/gi, "we're going to look at"],
//     [/throughout this article[, ]*/gi, ""],
//     [/it is important to note that/gi, "it's worth knowing that"],
//     [/it is worth noting that/gi, "it's worth noting that"],
//     [/in today's digital age/gi, "these days"],
//     [/with that being said[, ]*/gi, "still, "],
//     [/it should be noted that/gi, "keep in mind that"],
//     [/it is essential to/gi, "you need to"],
//     [/it is crucial to/gi, "it's key to"],
//     [/it is imperative that/gi, "you must"],
//     [/one must/gi, "you should"],
//     [/it can be seen that/gi, "you'll notice that"],
//     [/it is evident that/gi, "clearly, "],
//     [/as a matter of fact/gi, "actually, "],
//     [/needless to say/gi, "obviously, "],
//     [/it goes without saying/gi, "of course, "],
//     [/in order to/gi, "to"],
//     [/in the event that/gi, "if"],
//     [/due to the fact that/gi, "because"],
//     [/for the purpose of/gi, "to"],
//     [/with regard to/gi, "about"],
//     [/with respect to/gi, "regarding"],
//   ];

//   let count = 0;
//   let out = text;

//   for (const [pattern, repl] of replacements) {
//     if (pattern.test(out)) {
//       out = out.replace(pattern, () => {
//         count++;
//         return repl;
//       });
//     }
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Step 2: paraphrase some phrases / connectors
//  * ──────────────────────────────────────────────────────────── */

// function paraphrasePhrases(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const map: Array<[RegExp, string[]]> = [
//     [/however,/gi, ["But,", "Still,", "That said,", "Though,", "On the other hand,"]],
//     [/moreover,/gi, ["Plus,", "On top of that,", "Also,", "What's more,", "And,"]],
//     [/furthermore,/gi, ["Also,", "On top of that,", "Besides,", "What's more,", "Plus,"]],
//     [/additionally,/gi, ["Also,", "On a related note,", "Plus,", "And,", "What's more,"]],
//     [/therefore,/gi, ["So,", "Because of that,", "As a result,", "That's why,", "This means,"]],
//     [/overall,/gi, ["All in all,", "Overall speaking,", "Looking at the whole picture,", "In general,", "Generally speaking,"]],
//     [/in other words,/gi, ["Put simply,", "In plain terms,", "Basically,", "That is,", "In essence,"]],
//     [/consequently,/gi, ["So,", "As a result,", "This means,", "That's why,"]],
//     [/nevertheless,/gi, ["Still,", "Even so,", "But,", "However,"]],
//     [/thus,/gi, ["So,", "Therefore,", "This means,", "As a result,"]],
//     [/hence,/gi, ["So,", "That's why,", "This means,", "As a result,"]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, options] of map) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength) return match;
//       const choice = options[Math.floor(Math.random() * options.length)];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Step 3: sentence rhythm tweak (split/merge slightly)
//  * ──────────────────────────────────────────────────────────── */

// function adjustSentenceRhythm(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const sentences = text
//     .split(/([.!?])\s+/)
//     .reduce<string[]>((acc, cur, idx, arr) => {
//       if (idx % 2 === 0) {
//         const nextPunct = arr[idx + 1] || "";
//         acc.push((cur + nextPunct).trim());
//       }
//       return acc;
//     }, [])
//     .filter(Boolean);

//   if (sentences.length <= 1) {
//     return { text, count: 0 };
//   }

//   let changed = 0;
//   const out: string[] = [];

//   for (let i = 0; i < sentences.length; i++) {
//     const s = sentences[i];

//     // Option 1: split long sentences
//     if (
//       s.length > 140 &&
//       Math.random() < strength * 0.4
//     ) {
//       const splitAt =
//         findSplitPoint(s) ?? Math.floor(s.length / 2);
//       const first = s.slice(0, splitAt).trim();
//       const second = s.slice(splitAt).trim();
//       if (first && second) {
//         out.push(first);
//         out.push(second);
//         changed++;
//         continue;
//       }
//     }

//     // Option 2: merge short adjacent sentences
//     if (
//       i < sentences.length - 1 &&
//       s.length < 40 &&
//       sentences[i + 1].length < 60 &&
//       Math.random() < strength * 0.25
//     ) {
//       out.push(`${s.replace(/[.!?]+$/, "")}, ${sentences[
//         i + 1
//       ]
//         .charAt(0)
//         .toLowerCase()}${sentences[i + 1].slice(1)}`);
//       i++;
//       changed++;
//       continue;
//     }

//     out.push(s);
//   }

//   // Join with proper spacing - preserve natural sentence breaks
//   return {
//     text: out.join(" ").replace(/\s{2,}/g, " ").trim(),
//     count: changed,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Step 4: vary word choice to reduce repetition
//  * ──────────────────────────────────────────────────────────── */

// function varyWordChoice(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   // Common AI-repetitive words that need variation
//   const wordVariations: Array<[RegExp, string[]]> = [
//     [/utilize/gi, ["use", "employ", "apply"]],
//     [/utilizes/gi, ["uses", "employs", "applies"]],
//     [/utilized/gi, ["used", "employed", "applied"]],
//     [/utilizing/gi, ["using", "employing", "applying"]],
//     [/facilitate/gi, ["help", "enable", "make easier"]],
//     [/facilitates/gi, ["helps", "enables", "makes easier"]],
//     [/facilitated/gi, ["helped", "enabled", "made easier"]],
//     [/facilitating/gi, ["helping", "enabling", "making easier"]],
//     [/leverage/gi, ["use", "take advantage of", "make use of"]],
//     [/leverages/gi, ["uses", "takes advantage of", "makes use of"]],
//     [/leveraged/gi, ["used", "took advantage of", "made use of"]],
//     [/leveraging/gi, ["using", "taking advantage of", "making use of"]],
//     [/implement/gi, ["put in place", "set up", "use"]],
//     [/implements/gi, ["puts in place", "sets up", "uses"]],
//     [/implemented/gi, ["put in place", "set up", "used"]],
//     [/implementing/gi, ["putting in place", "setting up", "using"]],
//     [/optimize/gi, ["improve", "enhance", "make better"]],
//     [/optimizes/gi, ["improves", "enhances", "makes better"]],
//     [/optimized/gi, ["improved", "enhanced", "made better"]],
//     [/optimizing/gi, ["improving", "enhancing", "making better"]],
//     [/significant/gi, ["important", "major", "notable", "substantial"]],
//     [/significantly/gi, ["greatly", "considerably", "substantially", "a lot"]],
//     [/numerous/gi, ["many", "lots of", "plenty of", "several"]],
//     [/various/gi, ["different", "many", "several", "all sorts of"]],
//     [/numerous/gi, ["many", "lots of", "plenty of", "several"]],
//   ];

//   for (const [pattern, options] of wordVariations) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.6) return match;
//       const choice = options[Math.floor(Math.random() * options.length)];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Step 5: fix spacing around punctuation for readability
//  * ──────────────────────────────────────────────────────────── */

// function fixSpacing(text: string): string {
//   let out = text;

//   // Fix spacing around punctuation - ensure single space after periods, commas, etc.
//   out = out.replace(/([.,!?;:])\s{2,}/g, "$1 "); // Multiple spaces after punctuation -> single space
//   out = out.replace(/([.,!?;:])([^\s\w])/g, "$1 $2"); // No space after punctuation (except word chars) -> add space
  
//   // Fix spacing around quotes
//   out = out.replace(/"\s{2,}/g, '" ');
//   out = out.replace(/\s{2,}"/g, ' "');
//   out = out.replace(/'\s{2,}/g, "' ");
//   out = out.replace(/\s{2,}'/g, " '");

//   // Normalize multiple spaces to single space (preserve paragraph breaks)
//   out = out.replace(/[ \t]{3,}/g, " ");

//   return out.trim();
// }

// /* ────────────────────────────────────────────────────────────
//  * Step 6: inject light human quirks (subtle, safe)
//  * ──────────────────────────────────────────────────────────── */

// function injectHumanQuirks(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   // Add occasional natural phrases
//   const inserts: Array<[RegExp, string]> = [
//     [/for example/gi, "for example"],
//     [/for instance/gi, "for instance"],
//   ];

//   for (const [pattern, phrase] of inserts) {
//     if (pattern.test(out) && Math.random() < strength * 0.2) {
//       out = out.replace(pattern, (m) => {
//         count++;
//         return phrase;
//       });
//     }
//   }

//   // Sometimes soften overly definitive language
//   out = out.replace(/(clearly|definitely|certainly|obviously) /gi, (m) => {
//     if (Math.random() < strength * 0.3) {
//       count++;
//       const replacements = ["really ", "actually ", "often ", ""];
//       return replacements[Math.floor(Math.random() * replacements.length)];
//     }
//     return m;
//   });

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Heuristic score & helpers
//  * ──────────────────────────────────────────────────────────── */

// function estimatePatternScore(original: string, changed: string): number {
//   if (!original || !changed) return 1;
//   if (original === changed) return 1;

//   const o = original.replace(/\s+/g, " ").trim();
//   const c = changed.replace(/\s+/g, " ").trim();
//   if (!o || !c) return 1;

//   const minLen = Math.min(o.length, c.length);
//   let same = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (o[i] === c[i]) same++;
//   }
//   const similarity = same / minLen;
//   // lower similarity => lower "pattern score"
//   return similarity; // 0..1
// }

// function clamp(n: number, min: number, max: number): number {
//   return n < min ? min : n > max ? max : n;
// }

// function findSplitPoint(s: string): number | null {
//   // Try to split at comma or "and" near the middle
//   const mid = Math.floor(s.length / 2);
//   const left = s.lastIndexOf(",", mid + 15);
//   if (left > 40) return left + 1;
//   const andIdx = s.toLowerCase().indexOf(" and ", mid - 15);
//   if (andIdx > 40) return andIdx + 5;
//   return null;
// }

// function preserveCase(from: string, to: string): string {
//   if (!from) return to;
//   if (from[0] === from[0].toUpperCase()) {
//     return to.charAt(0).toUpperCase() + to.slice(1);
//   }
//   return to;
// }




// // src/hooks/use-humanize-content.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";

// /**
//  * IMPORTANT NOTE (read once):
//  * - This is a deterministic, local, regex/heuristic-based humanizer.
//  * - Goal: make AI-style drafts feel more natural, varied, and human-edited.
//  * - It DOES NOT guarantee "0% AI" on every detector.
//  * - Use it as one layer + your LLM prompts + light human review for critical pages.
//  */

// /* ────────────────────────────────────────────────────────────
//  * Types
//  * ──────────────────────────────────────────────────────────── */

// export interface HumanizedContentItem {
//   id: string;
//   sourceId?: string;
//   originalHtml: string;
//   humanizedHtml: string;
//   createdAt: string;
//   meta?: {
//     // 0 = looks very human by our heuristic, 1 = very close to raw LLM
//     patternScore?: number;
//     // Count of transformations applied
//     transformations?: number;
//   };
// }

// export interface HumanizeOptions {
//   /**
//    * 0–1, higher = more aggressive paraphrase/variation.
//    * 0.6–0.9 recommended for obvious AI drafts.
//    */
//   strength: number;
//   /**
//    * Allow light natural quirks (hedging, rhythm noise, etc.).
//    * Stays subtle; no broken grammar spam.
//    */
//   allowImperfect: boolean;
//   /**
//    * Cap how much we are allowed to change vs original (by characters).
//    * 0.0 = no limit, 0.7 = at most ~70% of chars diverge.
//    */
//   maxChangeRatio: number;
//   /**
//    * Try to preserve semantics/structure (titles, headings, lists).
//    * If false: more aggressive rhythm & connective rewrites.
//    */
//   preserveSemantics: boolean;
//   /**
//    * Optional language hint ("en", "hi", "es", "fr", etc.).
//    * If not set, we'll infer from script.
//    */
//   languageHint?: string;
// }

// const DEFAULT_OPTIONS: HumanizeOptions = {
//   strength: 0.78,
//   allowImperfect: true,
//   maxChangeRatio: 0.65,
//   preserveSemantics: true,
//   languageHint: undefined,
// };

// /* ────────────────────────────────────────────────────────────
//  * Hook
//  * ──────────────────────────────────────────────────────────── */

// export default function useHumanizeContent() {
//   const [isHumanizing, setIsHumanizing] = useState(false);

//   const [items, setItems] = useLocalStorage<HumanizedContentItem[]>(
//     "humanized-items_v2",
//     []
//   );

//   const humanizeHtml = async (
//     html: string,
//     opts?: Partial<HumanizeOptions>,
//     sourceId?: string
//   ): Promise<string> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     try {
//       if (!html || typeof html !== "string") return html;

//       const result = runHumanizer(html, options);

//       const record: HumanizedContentItem = {
//         id: `${sourceId || "single"}-${Date.now()}-${Math.random()
//           .toString(36)
//           .slice(2, 8)}`,
//         sourceId,
//         originalHtml: html,
//         humanizedHtml: result.html,
//         createdAt: new Date().toISOString(),
//         meta: {
//           patternScore: result.patternScore,
//           transformations: result.transformations,
//         },
//       };

//       startTransition(() => {
//         setItems((prev = []) => [record, ...(prev || [])].slice(0, 500));
//       });

//       return result.html;
//     } catch (err) {
//       console.error("[HUMANIZE] failed:", err);
//       toast.error("Humanizer error: could not transform content.");
//       return html;
//     }
//   };

//   const humanizeMany = async (
//     batch: { id: string; html: string }[],
//     opts?: Partial<HumanizeOptions>
//   ): Promise<HumanizedContentItem[]> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     if (!batch?.length) return [];

//     setIsHumanizing(true);
//     const out: HumanizedContentItem[] = [];

//     try {
//       for (const entry of batch) {
//         if (!entry?.html) continue;

//         const result = runHumanizer(entry.html, options);

//         const record: HumanizedContentItem = {
//           id: `${entry.id || "batch"}-${Date.now()}-${Math.random()
//             .toString(36)
//             .slice(2, 8)}`,
//           sourceId: entry.id,
//           originalHtml: entry.html,
//           humanizedHtml: result.html,
//           createdAt: new Date().toISOString(),
//           meta: {
//             patternScore: result.patternScore,
//             transformations: result.transformations,
//           },
//         };

//         out.push(record);
//       }

//       if (out.length) {
//         startTransition(() => {
//           setItems((prev = []) => [...out, ...(prev || [])].slice(0, 500));
//         });
//       }

//       if (out.length) {
//         toast.success(`Humanized ${out.length} item(s).`);
//       }

//       return out;
//     } catch (err) {
//       console.error("[HUMANIZE] batch failed:", err);
//       toast.error("Failed to humanize batch.");
//       return out;
//     } finally {
//       setIsHumanizing(false);
//     }
//   };

//   const clearHumanized = () => {
//     startTransition(() => setItems([]));
//     toast.success("Cleared humanized content history.");
//   };

//   return {
//     isHumanizing,
//     items,
//     humanizeHtml,
//     humanizeMany,
//     clearHumanized,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Core humanizer
//  * - Multi-language aware
//  * - Tags preserved, only text nodes transformed
//  * - Layered transforms: boilerplate → connectors → rhythm → lexicon → quirks
//  * ──────────────────────────────────────────────────────────── */

// interface HumanizerResult {
//   html: string;
//   patternScore: number;
//   transformations: number;
// }

// type HtmlPart =
//   | { type: "tag"; value: string }
//   | { type: "text"; value: string };

// function runHumanizer(html: string, options: HumanizeOptions): HumanizerResult {
//   if (!html) {
//     return { html, patternScore: 1, transformations: 0 };
//   }

//   const parts = splitHtml(html);
//   if (!parts.length) {
//     return { html, patternScore: 1, transformations: 0 };
//   }

//   const lang = options.languageHint || detectLanguageFromContent(html);
//   const isLatin = isMostlyLatinScript(html);

//   let transformations = 0;
//   let patternScoreAccum = 0;
//   let textNodes = 0;

//   const out = parts
//     .map((part) => {
//       if (part.type === "tag") return part.value;

//       const original = part.value;
//       let text = original;

//       if (!text.trim()) return text;

//       textNodes++;

//       // Light whitespace normalization (multi-lang safe)
//       text = normalizeWhitespaceSoft(text);

//       // Language-aware pipeline
//       if (isLatin) {
//         // Layer 1: Kill generic LLM boilerplate (mostly English)
//         const b = replaceBoilerplate(text);
//         text = b.text;
//         transformations += b.count;

//         // Layer 2: Connectors / transitions variation
//         const p = paraphrasePhrases(text, options.strength);
//         text = p.text;
//         transformations += p.count;

//         // Layer 3: Sentence rhythm (split/merge, avoid monotony)
//         const r = adjustSentenceRhythm(text, options.strength, options.preserveSemantics);
//         text = r.text;
//         transformations += r.count;

//         // Layer 4: Lexical variation for overused AI words
//         const v = varyWordChoice(text, options.strength);
//         text = v.text;
//         transformations += v.count;
//       } else {
//         // Non-Latin / mixed languages:
//         // - Avoid heavy semantics changes
//         // - Only very subtle spacing, mild de-formalization hooks
//         const nl = softenDefinitiveLanguage(text, options.strength);
//         text = nl.text;
//         transformations += nl.count;
//       }

//       // Layer 5: Micro human quirks (multi-language friendly & subtle)
//       if (options.allowImperfect) {
//         const q = injectHumanQuirksGeneric(text, options.strength, lang);
//         text = q.text;
//         transformations += q.count;
//       }

//       // Final: spacing & punctuation tidy (keep it readable)
//       text = fixSpacing(text);

//       // Respect maxChangeRatio to avoid over-cooking semantics
//       if (options.maxChangeRatio > 0) {
//         text = enforceMaxChangeRatio(original, text, options.maxChangeRatio);
//       }

//       // Heuristic score for this node
//       patternScoreAccum += estimatePatternScore(original, text);

//       return text;
//     })
//     .join("");

//   const avgPatternScore =
//     textNodes > 0 ? clamp(patternScoreAccum / textNodes, 0, 1) : 1;

//   return {
//     html: out,
//     patternScore: avgPatternScore,
//     transformations,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * HTML split
//  * ──────────────────────────────────────────────────────────── */

// function splitHtml(html: string): HtmlPart[] {
//   const parts: HtmlPart[] = [];
//   const regex = /(<[^>]+>)/g;
//   let lastIndex = 0;
//   let match: RegExpExecArray | null;

//   while ((match = regex.exec(html)) !== null) {
//     if (match.index > lastIndex) {
//       parts.push({
//         type: "text",
//         value: html.slice(lastIndex, match.index),
//       });
//     }
//     parts.push({ type: "tag", value: match[0] });
//     lastIndex = match.index + match[0].length;
//   }

//   if (lastIndex < html.length) {
//     parts.push({
//       type: "text",
//       value: html.slice(lastIndex),
//     });
//   }

//   return parts;
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 1: remove / soften boilerplate LLM phrases (English / Latin-heavy)
//  * ──────────────────────────────────────────────────────────── */

// function replaceBoilerplate(text: string): { text: string; count: number } {
//   const replacements: Array<[RegExp, string]> = [
//     [/in conclusion[, ]*/gi, "To wrap things up, "],
//     [/to conclude[, ]*/gi, "Overall, "],
//     [/in summary[, ]*/gi, "Simply put, "],
//     [/this article will explore/gi, "we're going to look at"],
//     [/throughout this article[, ]*/gi, ""],
//     [/it is important to note that/gi, "it's worth knowing that"],
//     [/it is worth noting that/gi, "it's worth noting that"],
//     [/in today's digital age/gi, "these days"],
//     [/with that being said[, ]*/gi, "still, "],
//     [/it should be noted that/gi, "keep in mind that"],
//     [/it is essential to/gi, "you need to"],
//     [/it is crucial to/gi, "it's key to"],
//     [/it is imperative that/gi, "you must"],
//     [/one must/gi, "you should"],
//     [/it can be seen that/gi, "you'll notice that"],
//     [/it is evident that/gi, "clearly, "],
//     [/as a matter of fact/gi, "actually, "],
//     [/needless to say/gi, "obviously, "],
//     [/it goes without saying/gi, "of course, "],
//     [/in order to/gi, "to"],
//     [/in the event that/gi, "if"],
//     [/due to the fact that/gi, "because"],
//     [/for the purpose of/gi, "to"],
//     [/with regard to/gi, "about"],
//     [/with respect to/gi, "regarding"],
//     [/in this guide[, ]*/gi, ""],
//     [/in this article[, ]*/gi, ""],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, repl] of replacements) {
//     if (pattern.test(out)) {
//       out = out.replace(pattern, () => {
//         count++;
//         return repl;
//       });
//     }
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 2: connectors / transitions paraphrase (English)
//  * ──────────────────────────────────────────────────────────── */

// function paraphrasePhrases(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const map: Array<[RegExp, string[]]> = [
//     [/however,/gi, ["But,", "Still,", "That said,", "Though,", "On the other hand,"]],
//     [/moreover,/gi, ["Plus,", "On top of that,", "Also,", "What's more,"]],
//     [/furthermore,/gi, ["Also,", "Besides,", "Plus,", "On top of that,"]],
//     [/additionally,/gi, ["Also,", "Plus,", "On a related note,"]],
//     [/therefore,/gi, ["So,", "Because of that,", "As a result,", "That's why,"]],
//     [/overall,/gi, ["All in all,", "In general,", "Looking at everything,"]],
//     [/in other words,/gi, ["Put simply,", "Basically,", "In simple terms,"]],
//     [/consequently,/gi, ["So,", "As a result,", "That means,"]],
//     [/nevertheless,/gi, ["Still,", "Even so,", "But,"]],
//     [/thus,/gi, ["So,", "Because of that,", "As a result,"]],
//     [/hence,/gi, ["So,", "That's why,"]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, options] of map) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength) return match;
//       const choice = options[(Math.random() * options.length) | 0];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 3: sentence rhythm (split/merge)
//  * ──────────────────────────────────────────────────────────── */

// function adjustSentenceRhythm(
//   text: string,
//   strength: number,
//   preserveSemantics: boolean
// ): { text: string; count: number } {
//   const raw = text.trim();
//   if (!raw) return { text, count: 0 };

//   const segments = raw
//     .split(/([.!?])\s+/)
//     .reduce<string[]>((acc, cur, idx, arr) => {
//       if (idx % 2 === 0) {
//         const punct = arr[idx + 1] || "";
//         const s = (cur + punct).trim();
//         if (s) acc.push(s);
//       }
//       return acc;
//     }, []);

//   if (segments.length <= 1) {
//     return { text, count: 0 };
//   }

//   const out: string[] = [];
//   let changed = 0;

//   for (let i = 0; i < segments.length; i++) {
//     const s = segments[i];

//     // Avoid touching headings/bullets style lines
//     if (/^[-•*#]/.test(s)) {
//       out.push(s);
//       continue;
//     }

//     // Split long sentences into two
//     if (
//       s.length > 140 &&
//       Math.random() < strength * 0.45
//     ) {
//       const splitAt = findSplitPoint(s) ?? Math.floor(s.length / 2);
//       const first = s.slice(0, splitAt).trim();
//       const second = s.slice(splitAt).trim();
//       if (first && second && /[a-zA-Z0-9]/.test(second[0])) {
//         out.push(first);
//         out.push(second);
//         changed++;
//         continue;
//       }
//     }

//     // Merge short adjacent sentences (but not if preserveSemantics+list-like)
//     if (
//       !preserveSemantics &&
//       i < segments.length - 1 &&
//       s.length < 40 &&
//       segments[i + 1].length < 60 &&
//       Math.random() < strength * 0.3
//     ) {
//       const next = segments[i + 1];
//       out.push(
//         `${s.replace(/[.!?]+$/, "")}, ${next.charAt(0).toLowerCase()}${next.slice(
//           1
//         )}`
//       );
//       i++;
//       changed++;
//       continue;
//     }

//     out.push(s);
//   }

//   return {
//     text: out.join(" ").replace(/\s{2,}/g, " ").trim(),
//     count: changed,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 4: lexical variation for typical AI wording (English)
//  * ──────────────────────────────────────────────────────────── */

// function varyWordChoice(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const patterns: Array<[RegExp, string[]]> = [
//     [/utilize/gi, ["use", "make use of"]],
//     [/facilitate/gi, ["help", "make easier"]],
//     [/leverage/gi, ["use", "take advantage of"]],
//     [/implement/gi, ["use", "put in place"]],
//     [/optimize/gi, ["improve", "tune"]],
//     [/significant/gi, ["important", "major"]],
//     [/significantly/gi, ["a lot", "notably"]],
//     [/numerous/gi, ["many", "plenty of"]],
//     [/various/gi, ["different", "a range of"]],
//     [/crucial/gi, ["key", "very important"]],
//     [/ensure/gi, ["make sure", "help guarantee"]],
//     [/robust/gi, ["solid", "reliable"]],
//     [/seamless/gi, ["smooth", "easy"]],
//     [/comprehensive/gi, ["detailed", "thorough"]],
//   ];

//   for (const [pattern, choices] of patterns) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.6) return match;
//       const choice = choices[(Math.random() * choices.length) | 0];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Non-English / generic softeners
//  * ──────────────────────────────────────────────────────────── */

// function softenDefinitiveLanguage(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   // Very light: reduce absolutist tone (multi-lang-ish)
//   out = out.replace(/(\b(always|never)\b)/gi, (m) => {
//     if (Math.random() < strength * 0.25) {
//       count++;
//       return "often";
//     }
//     return m;
//   });

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 5: subtle quirks (multi-language aware)
//  * ──────────────────────────────────────────────────────────── */

// function injectHumanQuirksGeneric(
//   text: string,
//   strength: number,
//   lang?: string
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   // Occasional hedge / conversational touch for Latin languages
//   if (!lang || /^en|es|fr|de|pt|it|nl|ro|pl|tr$/i.test(lang)) {
//     out = out.replace(
//       /\b(definitely|certainly|clearly)\b/gi,
//       (m) => {
//         if (Math.random() < strength * 0.3) {
//           count++;
//           const repl = ["pretty much", "in many cases", "often", m.toLowerCase()];
//           return repl[(Math.random() * repl.length) | 0];
//         }
//         return m;
//       }
//     );
//   }

//   // Do not spam; quirks must be sparse + natural

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Spacing, similarity, helpers
//  * ──────────────────────────────────────────────────────────── */

// function normalizeWhitespaceSoft(text: string): string {
//   // Keep newlines & paragraphs; trim crazy spaces only
//   return text.replace(/[ \t]{3,}/g, "  ");
// }

// function fixSpacing(text: string): string {
//   let out = text;

//   // Single space after punctuation
//   out = out.replace(/([.,!?;:])\s{2,}/g, "$1 ");

//   // Normalize spaces around quotes
//   out = out.replace(/"\s{2,}/g, '" ');
//   out = out.replace(/\s{2,}"/g, ' "');

//   // Collapse insane tabs
//   out = out.replace(/[ \t]{3,}/g, " ");

//   return out.trim();
// }

// function estimatePatternScore(original: string, changed: string): number {
//   if (!original || !changed) return 1;
//   if (original === changed) return 1;

//   const o = original.replace(/\s+/g, " ").trim();
//   const c = changed.replace(/\s+/g, " ").trim();
//   if (!o || !c) return 1;

//   const minLen = Math.min(o.length, c.length);
//   if (minLen === 0) return 1;

//   let same = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (o[i] === c[i]) same++;
//   }

//   const similarity = same / minLen;

//   // similarity ~1 => very LLM-like (no change)
//   // similarity ~0 => heavily changed
//   // we expose this as-is; caller interprets (lower better for "different")
//   return similarity;
// }

// function enforceMaxChangeRatio(
//   original: string,
//   changed: string,
//   maxRatio: number
// ): string {
//   if (maxRatio <= 0) return changed;
//   const o = original;
//   const c = changed;
//   const minLen = Math.min(o.length, c.length);
//   if (minLen === 0) return changed;

//   let diff = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (o[i] !== c[i]) diff++;
//   }
//   diff += Math.abs(o.length - c.length);

//   const ratio = diff / (o.length || 1);
//   if (ratio <= maxRatio) return changed;

//   // Too much change → blend back towards original (simple safe fallback)
//   const keepFromOriginal = Math.floor(o.length * 0.3);
//   const tail = c.slice(-Math.max(0, c.length - (o.length - keepFromOriginal)));
//   return (o.slice(0, keepFromOriginal) + " " + tail).trim();
// }

// function clamp(n: number, min: number, max: number): number {
//   return n < min ? min : n > max ? max : n;
// }

// function findSplitPoint(s: string): number | null {
//   const mid = Math.floor(s.length / 2);
//   let best = -1;

//   // Prefer comma near mid
//   for (let i = mid - 25; i <= mid + 25; i++) {
//     if (i > 20 && i < s.length - 20 && s[i] === ",") {
//       best = i + 1;
//       break;
//     }
//   }

//   if (best !== -1) return best;

//   // Fallback: " and "
//   const idx = s.toLowerCase().indexOf(" and ", mid - 20);
//   if (idx > 20 && idx < s.length - 20) {
//     return idx + 5;
//   }

//   return null;
// }

// /* ────────────────────────────────────────────────────────────
//  * Language / script detection (very lightweight)
//  * ──────────────────────────────────────────────────────────── */

// function isMostlyLatinScript(text: string): boolean {
//   const sample = text.slice(0, 800);
//   let latin = 0;
//   let nonLatin = 0;

//   for (let i = 0; i < sample.length; i++) {
//     const code = sample.charCodeAt(i);
//     if (
//       (code >= 0x0041 && code <= 0x005a) || // A-Z
//       (code >= 0x0061 && code <= 0x007a) // a-z
//     ) {
//       latin++;
//     } else if (code > 127 && code !== 160) {
//       nonLatin++;
//     }
//   }

//   if (latin === 0 && nonLatin === 0) return true;
//   return latin >= nonLatin;
// }

// function detectLanguageFromContent(text: string): string | undefined {
//   const sample = text.slice(0, 800);

//   // Very rough heuristics; enough for tuning behavior:
//   if (/[اأإءؤئ]/.test(sample)) return "ar";
//   if (/[\u0900-\u097F]/.test(sample)) return "hi";
//   if (/[\u4e00-\u9fff]/.test(sample)) return "zh";
//   if (/[\u0400-\u04FF]/.test(sample)) return "ru";
//   if (/[\u3040-\u30ff]/.test(sample)) return "ja";
//   if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
//   if (isMostlyLatinScript(sample)) return "en"; // default Latin-heavy

//   return undefined;
// }

// function preserveCase(from: string, to: string): string {
//   if (!from) return to;
//   if (from[0] === from[0].toUpperCase()) {
//     return to.charAt(0).toUpperCase() + to.slice(1);
//   }
//   return to;
// }



// // src/hooks/use-humanize-content.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";

// /**
//  * IMPORTANT NOTE (read once):
//  * - This is a deterministic, local, regex/heuristic-based humanizer.
//  * - Goal: make AI-style drafts feel more natural, varied, and human-edited.
//  * - It DOES NOT guarantee "0% AI" on every detector.
//  * - Use it as one layer + your LLM prompts + light human review for critical pages.
//  * - UPGRADE NOTES:
//  *   - Switched to DOMParser for robust HTML structure preservation (no more broken paras/lists/headings).
//  *   - Added contraction layer for more conversational tone.
//  *   - Expanded boilerplate, phrase, and lexical replacements for broader AI pattern disruption.
//  *   - Improved sentence rhythm to better respect blocks/whitespace.
//  *   - Subtle enhancements for variation without over-changing semantics.
//  *   - Better multi-lang handling (still light for non-Latin; focused on English/Hinglish).
//  */

// /* ────────────────────────────────────────────────────────────
//  * Types
//  * ──────────────────────────────────────────────────────────── */

// export interface HumanizedContentItem {
//   id: string;
//   sourceId?: string;
//   originalHtml: string;
//   humanizedHtml: string;
//   createdAt: string;
//   meta?: {
//     // 0 = looks very human by our heuristic, 1 = very close to raw LLM
//     patternScore?: number;
//     // Count of transformations applied
//     transformations?: number;
//   };
// }

// export interface HumanizeOptions {
//   /**
//    * 0–1, higher = more aggressive paraphrase/variation.
//    * 0.7–0.85 recommended for obvious AI drafts (tuned up slightly for better evasion).
//    */
//   strength: number;
//   /**
//    * Allow light natural quirks (hedging, rhythm noise, etc.).
//    * Stays subtle; no broken grammar spam.
//    */
//   allowImperfect: boolean;
//   /**
//    * Cap how much we are allowed to change vs original (by characters).
//    * 0.0 = no limit, 0.6 = at most ~60% of chars diverge (tightened for safety).
//    */
//   maxChangeRatio: number;
//   /**
//    * Try to preserve semantics/structure (titles, headings, lists).
//    * If false: more aggressive rhythm & connective rewrites.
//    */
//   preserveSemantics: boolean;
//   /**
//    * Optional language hint ("en", "hi", "es", "fr", etc.).
//    * If not set, we'll infer from script.
//    */
//   languageHint?: string;
// }

// const DEFAULT_OPTIONS: HumanizeOptions = {
//   strength: 0.82,
//   allowImperfect: true,
//   maxChangeRatio: 0.6,
//   preserveSemantics: true,
//   languageHint: undefined,
// };

// /* ────────────────────────────────────────────────────────────
//  * Hook
//  * ──────────────────────────────────────────────────────────── */

// export default function useHumanizeContent() {
//   const [isHumanizing, setIsHumanizing] = useState(false);

//   const [items, setItems] = useLocalStorage<HumanizedContentItem[]>(
//     "humanized-items_v3",
//     []
//   );

//   const humanizeHtml = async (
//     html: string,
//     opts?: Partial<HumanizeOptions>,
//     sourceId?: string
//   ): Promise<string> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     try {
//       if (!html || typeof html !== "string") return html;

//       const result = runHumanizer(html, options);

//       const record: HumanizedContentItem = {
//         id: `${sourceId || "single"}-${Date.now()}-${Math.random()
//           .toString(36)
//           .slice(2, 8)}`,
//         sourceId,
//         originalHtml: html,
//         humanizedHtml: result.html,
//         createdAt: new Date().toISOString(),
//         meta: {
//           patternScore: result.patternScore,
//           transformations: result.transformations,
//         },
//       };

//       startTransition(() => {
//         setItems((prev = []) => [record, ...(prev || [])].slice(0, 500));
//       });

//       return result.html;
//     } catch (err) {
//       console.error("[HUMANIZE] failed:", err);
//       toast.error("Humanizer error: could not transform content.");
//       return html;
//     }
//   };

//   const humanizeMany = async (
//     batch: { id: string; html: string }[],
//     opts?: Partial<HumanizeOptions>
//   ): Promise<HumanizedContentItem[]> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     if (!batch?.length) return [];

//     setIsHumanizing(true);
//     const out: HumanizedContentItem[] = [];

//     try {
//       for (const entry of batch) {
//         if (!entry?.html) continue;

//         const result = runHumanizer(entry.html, options);

//         const record: HumanizedContentItem = {
//           id: `${entry.id || "batch"}-${Date.now()}-${Math.random()
//             .toString(36)
//             .slice(2, 8)}`,
//           sourceId: entry.id,
//           originalHtml: entry.html,
//           humanizedHtml: result.html,
//           createdAt: new Date().toISOString(),
//           meta: {
//             patternScore: result.patternScore,
//             transformations: result.transformations,
//           },
//         };

//         out.push(record);
//       }

//       if (out.length) {
//         startTransition(() => {
//           setItems((prev = []) => [...out, ...(prev || [])].slice(0, 500));
//         });
//       }

//       if (out.length) {
//         toast.success(`Humanized ${out.length} item(s).`);
//       }

//       return out;
//     } catch (err) {
//       console.error("[HUMANIZE] batch failed:", err);
//       toast.error("Failed to humanize batch.");
//       return out;
//     } finally {
//       setIsHumanizing(false);
//     }
//   };

//   const clearHumanized = () => {
//     startTransition(() => setItems([]));
//     toast.success("Cleared humanized content history.");
//   };

//   return {
//     isHumanizing,
//     items,
//     humanizeHtml,
//     humanizeMany,
//     clearHumanized,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Core humanizer
//  * - Multi-language aware
//  * - Full DOM parsing for perfect structure preservation
//  * - Layered transforms: boilerplate → connectors → contractions → rhythm → lexicon → quirks
//  * ──────────────────────────────────────────────────────────── */

// interface HumanizerResult {
//   html: string;
//   patternScore: number;
//   transformations: number;
// }

// interface TextProcessResult {
//   text: string;
//   transformations: number;
//   patternScore: number;
// }

// function runHumanizer(html: string, options: HumanizeOptions): HumanizerResult {
//   if (!html) {
//     return { html, patternScore: 1, transformations: 0 };
//   }

//   const parser = new DOMParser();
//   const doc = parser.parseFromString("<html><body></body></html>", "text/html");
//   const div = doc.createElement("div");
//   div.innerHTML = html;

//   const lang = options.languageHint || detectLanguageFromContent(html);
//   const isLatin = isMostlyLatinScript(html);

//   let totalTransformations = 0;
//   let totalPatternScore = 0;
//   let textNodeCount = 0;

//   function humanizeNode(node: Node): void {
//     if (node.nodeType === Node.TEXT_NODE) {
//       let text = (node as Text).textContent || "";
//       if (!text.trim()) return;

//       const res: TextProcessResult = processText(
//         text,
//         options,
//         lang,
//         isLatin
//       );
//       (node as Text).textContent = res.text;
//       totalTransformations += res.transformations;
//       totalPatternScore += res.patternScore;
//       textNodeCount++;
//     } else if (node.nodeType === Node.ELEMENT_NODE) {
//       for (const child of node.childNodes) {
//         humanizeNode(child);
//       }
//     }
//   }

//   humanizeNode(div);

//   const avgPatternScore =
//     textNodeCount > 0 ? clamp(totalPatternScore / textNodeCount, 0, 1) : 1;

//   return {
//     html: div.innerHTML,
//     patternScore: avgPatternScore,
//     transformations: totalTransformations,
//   };
// }

// function processText(
//   text: string,
//   options: HumanizeOptions,
//   lang: string | undefined,
//   isLatin: boolean
// ): TextProcessResult {
//   let transformations = 0;
//   let currentText = normalizeWhitespaceSoft(text);

//   // Layer 1: Kill generic LLM boilerplate
//   const boilerplateRes = replaceBoilerplate(currentText);
//   currentText = boilerplateRes.text;
//   transformations += boilerplateRes.count;

//   if (isLatin) {
//     // Layer 2: Connectors / transitions variation
//     const phraseRes = paraphrasePhrases(currentText, options.strength);
//     currentText = phraseRes.text;
//     transformations += phraseRes.count;

//     // Layer 3: Contractions for conversational flow
//     const contractRes = addContractions(currentText, options.strength);
//     currentText = contractRes.text;
//     transformations += contractRes.count;

//     // Layer 4: Sentence rhythm (split/merge, avoid monotony) - improved to preserve \n
//     const rhythmRes = adjustSentenceRhythm(
//       currentText,
//       options.strength,
//       options.preserveSemantics
//     );
//     currentText = rhythmRes.text;
//     transformations += rhythmRes.count;

//     // Layer 5: Lexical variation for overused AI words
//     const varyRes = varyWordChoice(currentText, options.strength);
//     currentText = varyRes.text;
//     transformations += varyRes.count;
//   } else {
//     // Non-Latin: Light de-formalization
//     const softenRes = softenDefinitiveLanguage(currentText, options.strength);
//     currentText = softenRes.text;
//     transformations += softenRes.count;
//   }

//   // Layer 6: Micro human quirks
//   if (options.allowImperfect) {
//     const quirkRes = injectHumanQuirksGeneric(
//       currentText,
//       options.strength,
//       lang
//     );
//     currentText = quirkRes.text;
//     transformations += quirkRes.count;
//   }

//   // Final: spacing & punctuation tidy
//   currentText = fixSpacing(currentText);

//   // Respect maxChangeRatio
//   if (options.maxChangeRatio > 0) {
//     currentText = enforceMaxChangeRatio(text, currentText, options.maxChangeRatio);
//   }

//   // Heuristic score
//   const patternScore = estimatePatternScore(text, currentText);

//   return { text: currentText, transformations, patternScore };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 1: Boilerplate (expanded)
//  * ──────────────────────────────────────────────────────────── */

// function replaceBoilerplate(text: string): { text: string; count: number } {
//   const replacements: Array<[RegExp, string]> = [
//     [/in conclusion[, ]*/gi, "To wrap things up, "],
//     [/to conclude[, ]*/gi, "Overall, "],
//     [/in summary[, ]*/gi, "Simply put, "],
//     [/this article will explore/gi, "we're going to look at"],
//     [/throughout this article[, ]*/gi, ""],
//     [/it is important to note that/gi, "it's worth knowing that"],
//     [/it is worth noting that/gi, "it's worth noting that"],
//     [/in today's digital age/gi, "these days"],
//     [/with that being said[, ]*/gi, "still, "],
//     [/it should be noted that/gi, "keep in mind that"],
//     [/it is essential to/gi, "you need to"],
//     [/it is crucial to/gi, "it's key to"],
//     [/it is imperative that/gi, "you must"],
//     [/one must/gi, "you should"],
//     [/it can be seen that/gi, "you'll notice that"],
//     [/it is evident that/gi, "clearly, "],
//     [/as a matter of fact/gi, "actually, "],
//     [/needless to say/gi, "obviously, "],
//     [/it goes without saying/gi, "of course, "],
//     [/in order to/gi, "to"],
//     [/in the event that/gi, "if"],
//     [/due to the fact that/gi, "because"],
//     [/for the purpose of/gi, "to"],
//     [/with regard to/gi, "about"],
//     [/with respect to/gi, "regarding"],
//     [/in this guide[, ]*/gi, ""],
//     [/in this article[, ]*/gi, ""],
//     // New additions for common AI fluff
//     [/delve into/gi, "dive into"],
//     [/shed light on/gi, "highlight"],
//     [/unleash the power of/gi, "tap into"],
//     [/embark on a journey/gi, "start exploring"],
//     [/in the realm of/gi, "in the world of"],
//     [/a plethora of/gi, "lots of"],
//     [/the fact of the matter is/gi, "the thing is"],
//     [/it is no secret that/gi, "everyone knows"],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, repl] of replacements) {
//     if (pattern.test(out)) {
//       out = out.replace(pattern, () => {
//         count++;
//         return repl;
//       });
//     }
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 2: Connectors (expanded)
//  * ──────────────────────────────────────────────────────────── */

// function paraphrasePhrases(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const map: Array<[RegExp, string[]]> = [
//     [/however,/gi, ["But,", "Still,", "That said,", "Though,", "On the other hand,", "Yet,"]],
//     [/moreover,/gi, ["Plus,", "On top of that,", "Also,", "What's more,", "And,"]],
//     [/furthermore,/gi, ["Also,", "Besides,", "Plus,", "On top of that,", "Not to mention,"]],
//     [/additionally,/gi, ["Also,", "Plus,", "On a related note,", "And another thing,"]],
//     [/therefore,/gi, ["So,", "Because of that,", "As a result,", "That's why,", "Thus,"]],
//     [/overall,/gi, ["All in all,", "In general,", "Looking at everything,", "Bottom line,"]],
//     [/in other words,/gi, ["Put simply,", "Basically,", "In simple terms,", "Or rather,"]],
//     [/consequently,/gi, ["So,", "As a result,", "That means,", "Hence,"]],
//     [/nevertheless,/gi, ["Still,", "Even so,", "But,", "All the same,"]],
//     [/thus,/gi, ["So,", "Because of that,", "As a result,", "In turn,"]],
//     [/hence,/gi, ["So,", "That's why,", "For that reason,"]],
//     // New: more casual transitions
//     [/for example,/gi, ["like,", "say,", "for instance,", "e.g.,"]],
//     [/for instance,/gi, ["like,", "say,", "for example,"]],
//     [/on the other hand,/gi, ["but then,", "conversely,", "flip side,"]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, options] of map) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength) return match;
//       const choice = options[(Math.random() * options.length) | 0];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 3: Contractions (new)
//  * ──────────────────────────────────────────────────────────── */

// function addContractions(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const replacements: Array<[RegExp, string | ((match: string, ...args: any[]) => string)]> = [
//     [/(\b(it|he|she|they|we|you|I|that|who|what|where|when|why|how) )is\b/gi, (_match: string, p1: string) => {
//       return p1 + "'s";
//     }],
//     [/(\b(he|she|it|they|we|you|I|that|who|what|where|when|why|how) )are\b/gi, (_match: string, p1: string) => {
//       return p1 + "'re";
//     }],
//     [/ do not /gi, " don't "],
//     [/ does not /gi, " doesn't "],
//     [/ did not /gi, " didn't "],
//     [/ can not /gi, " can't "],
//     [/ will not /gi, " won't "],
//     [/ would not /gi, " wouldn't "],
//     [/ should not /gi, " shouldn't "],
//     [/ could not /gi, " couldn't "],
//     [/ has not /gi, " hasn't "],
//     [/ have not /gi, " haven't "],
//     [/ had not /gi, " hadn't "],
//     // New: more contractions
//     [/ shall not /gi, " shan't "],
//     [/ is not /gi, " isn't "],
//     [/ was not /gi, " wasn't "],
//     [/ were not /gi, " weren't "],
//   ];

//   for (const [pattern, repl] of replacements) {
//     out = out.replace(pattern, (match, ...args) => {
//       if (Math.random() > strength * 0.7) return match; // Slightly less aggressive
//       count++;
//       if (typeof repl === "function") {
//         return repl(match, ...args);
//       }
//       return repl;
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 4: Sentence rhythm (improved whitespace preservation)
//  * ──────────────────────────────────────────────────────────── */

// function adjustSentenceRhythm(
//   text: string,
//   strength: number,
//   preserveSemantics: boolean
// ): { text: string; count: number } {
//   const raw = text.trim();
//   if (!raw) return { text, count: 0 };

//   // Split on sentences but preserve block separators (\n\n for paras)
//   const blocks = raw.split(/\n{2,}/);
//   let changed = 0;
//   const processedBlocks: string[] = [];

//   for (const block of blocks) {
//     if (!block.trim()) {
//       processedBlocks.push(block);
//       continue;
//     }

//     const sentences = block
//       .split(/([.!?])\s*/)
//       .reduce<string[]>((acc, cur, idx, arr) => {
//         if (idx % 2 === 0) {
//           const punct = arr[idx + 1] || "";
//           const s = (cur + punct).trim();
//           if (s) acc.push(s);
//         }
//         return acc;
//       }, []);

//     if (sentences.length <= 1) {
//       processedBlocks.push(block);
//       continue;
//     }

//     const out: string[] = [];
//     let i = 0;
//     while (i < sentences.length) {
//       const s = sentences[i];

//       // Skip list-like or heading lines
//       if (/^[-•*#]|\d+\./.test(s)) {
//         out.push(s);
//         i++;
//         continue;
//       }

//       // Split long sentences (prefer within block)
//       if (
//         s.length > 150 &&
//         Math.random() < strength * 0.5
//       ) {
//         const splitAt = findSplitPoint(s) ?? Math.floor(s.length / 2);
//         const first = s.slice(0, splitAt).trim() + ".";
//         const second = s.slice(splitAt).trim();
//         if (first && second && /[a-zA-Z0-9]/.test(second[0])) {
//           out.push(first);
//           out.push(second);
//           changed++;
//           i++;
//           continue;
//         }
//       }

//       // Merge short adjacent (less aggressive if preserveSemantics)
//       if (
//         !preserveSemantics &&
//         i < sentences.length - 1 &&
//         s.length < 45 &&
//         sentences[i + 1].length < 65 &&
//         Math.random() < strength * 0.25
//       ) {
//         const next = sentences[i + 1];
//         out.push(
//           `${s.replace(/[.!?]+$/, "")}, ${next.charAt(0).toLowerCase()}${next.slice(1)}`
//         );
//         changed++;
//         i += 2;
//         continue;
//       }

//       out.push(s);
//       i++;
//     }

//     // Join sentences with original spacing style (space after punct)
//     const blockOut = out.join(" ").replace(/\s{2,}/g, " ").trim();
//     processedBlocks.push(blockOut);
//   }

//   // Re-join blocks with \n\n
//   const finalText = processedBlocks.join("\n\n").replace(/\n{3,}/g, "\n\n");

//   return {
//     text: finalText,
//     count: changed,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 5: Lexical variation (expanded)
//  * ──────────────────────────────────────────────────────────── */

// function varyWordChoice(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const patterns: Array<[RegExp, string[]]> = [
//     [/utilize/gi, ["use", "make use of", "employ"]],
//     [/facilitate/gi, ["help", "make easier", "enable"]],
//     [/leverage/gi, ["use", "take advantage of", "harness"]],
//     [/implement/gi, ["use", "put in place", "roll out"]],
//     [/optimize/gi, ["improve", "tune", "boost"]],
//     [/significant/gi, ["important", "major", "big"]],
//     [/significantly/gi, ["a lot", "notably", "greatly"]],
//     [/numerous/gi, ["many", "plenty of", "a bunch of"]],
//     [/various/gi, ["different", "a range of", "all sorts of"]],
//     [/crucial/gi, ["key", "very important", "vital"]],
//     [/ensure/gi, ["make sure", "help guarantee", "see to it"]],
//     [/robust/gi, ["solid", "reliable", "strong"]],
//     [/seamless/gi, ["smooth", "easy", "effortless"]],
//     [/comprehensive/gi, ["detailed", "thorough", "full"]],
//     // New additions
//     [/delve/gi, ["dive into", "explore", "get into"]],
//     [/realm/gi, ["world", "area", "field"]],
//     [/plethora/gi, ["ton", "load", "bunch"]],
//     [/testament/gi, ["proof", "sign", "example"]],
//     [/paramount/gi, ["top priority", "essential", "critical"]],
//     [/myriad/gi, ["tons of", "countless", "many"]],
//   ];

//   for (const [pattern, choices] of patterns) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.65) return match;
//       const choice = choices[(Math.random() * choices.length) | 0];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Non-English softeners (light expansion)
//  * ──────────────────────────────────────────────────────────── */

// function softenDefinitiveLanguage(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   // Reduce absolutist (multi-lang safe)
//   out = out.replace(/(\b(always|never)\b)/gi, (m) => {
//     if (Math.random() < strength * 0.3) {
//       count++;
//       return "often";
//     }
//     return m;
//   });

//   // For Hindi hint: very basic (assumes Romanized or simple)
//   if (/\bhi\b/i.test(text.toLowerCase())) { // Rough proxy
//     out = out.replace(/\bzaruri\b/gi, (m) => {
//       if (Math.random() < strength * 0.2) {
//         count++;
//         return "important";
//       }
//       return m;
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 6: Quirks (subtle expansion)
//  * ──────────────────────────────────────────────────────────── */

// function injectHumanQuirksGeneric(
//   text: string,
//   strength: number,
//   lang?: string
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   // Hedging for Latin
//   if (!lang || /^en|es|fr|de|pt|it|nl|ro|pl|tr$/i.test(lang)) {
//     out = out.replace(
//       /\b(definitely|certainly|clearly|absolutely)\b/gi,
//       (m) => {
//         if (Math.random() < strength * 0.35) {
//           count++;
//           const repl = ["pretty much", "in many cases", "often", "I'd say", m.toLowerCase()];
//           return repl[(Math.random() * repl.length) | 0];
//         }
//         return m;
//       }
//     );

//     // Rare conversational insert (e.g., "you know")
//     if (Math.random() < strength * 0.1 && out.length > 100) {
//       const inserts = [", you know,", " – or at least,", " anyway,"];
//       const insert = inserts[(Math.random() * inserts.length) | 0];
//       const pos = out.search(/ [.,;]/);
//       if (pos > 50) {
//         out = out.slice(0, pos) + insert + out.slice(pos);
//         count++;
//       }
//     }
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Helpers (improved)
//  * ──────────────────────────────────────────────────────────── */

// function normalizeWhitespaceSoft(text: string): string {
//   // Preserve \n but trim excessive spaces/tabs
//   return text.replace(/([^\S\n]{3,})|(\t{2,})/g, "  ");
// }

// function fixSpacing(text: string): string {
//   let out = text;

//   // Single space after punctuation, preserve \n
//   out = out.replace(/([.,!?;:])(?!\s\n)([ \t]*)/g, "$1 ");

//   // Quotes
//   out = out.replace(/"([ \t]{2,})/g, '" ');
//   out = out.replace(/([ \t]{2,})"/g, ' "');

//   // Collapse non-\n spaces
//   out = out.replace(/([^\n])[ \t]{3,}([^\n])/g, "$1 $2");

//   return out.trim();
// }

// function estimatePatternScore(original: string, changed: string): number {
//   if (!original || !changed) return 1;
//   if (original === changed) return 1;

//   const o = original.replace(/\s+/g, " ").trim();
//   const c = changed.replace(/\s+/g, " ").trim();
//   if (!o || !c) return 1;

//   const minLen = Math.min(o.length, c.length);
//   if (minLen === 0) return 1;

//   let same = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (o.charAt(i) === c.charAt(i)) same++;
//   }

//   const similarity = same / minLen;

//   // Slightly penalize for uniformity (heuristic tweak for better "human" score)
//   const uniformityPenalty = Math.abs(o.split(" ").length - c.split(" ").length) / Math.max(o.split(" ").length, 1) * 0.1;
//   return clamp(similarity - uniformityPenalty, 0, 1);
// }

// function enforceMaxChangeRatio(
//   original: string,
//   changed: string,
//   maxRatio: number
// ): string {
//   if (maxRatio <= 0) return changed;
//   const oLen = original.length;
//   const c = changed;
//   const minLen = Math.min(oLen, c.length);
//   if (minLen === 0) return changed;

//   let diff = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (original[i] !== c[i]) diff++;
//   }
//   diff += Math.abs(oLen - c.length);

//   const ratio = diff / oLen;
//   if (ratio <= maxRatio) return changed;

//   // Blend: keep more original if over
//   const keepRatio = 0.4; // Increased safety
//   const keepLen = Math.floor(oLen * keepRatio);
//   const tailLen = Math.max(0, c.length - (oLen - keepLen));
//   const tail = c.slice(-tailLen);
//   return [original.slice(0, keepLen), tail].filter(Boolean).join(" ").trim();
// }

// function clamp(n: number, min: number, max: number): number {
//   return Math.max(min, Math.min(max, n));
// }

// function findSplitPoint(s: string): number | null {
//   const mid = Math.floor(s.length / 2);
//   let best = -1;

//   // Prefer comma, semicolon, or "and/or/but" near mid
//   for (let i = Math.max(0, mid - 30); i <= mid + 30; i++) {
//     if (i > 25 && i < s.length - 25) {
//       if (s[i] === "," || s[i] === ";") {
//         best = i + 1;
//         break;
//       }
//     }
//   }

//   if (best !== -1) return best;

//   // " and ", " or ", " but "
//   const connectors = [" and ", " or ", " but "];
//   for (const conn of connectors) {
//     const idx = s.toLowerCase().indexOf(conn, mid - 25);
//     if (idx > 25 && idx < s.length - 25) {
//       return idx + conn.length;
//     }
//   }

//   return null;
// }

// /* ────────────────────────────────────────────────────────────
//  * Language detection (unchanged, lightweight)
//  * ──────────────────────────────────────────────────────────── */

// function isMostlyLatinScript(text: string): boolean {
//   const sample = text.slice(0, 800);
//   let latin = 0;
//   let nonLatin = 0;

//   for (let i = 0; i < sample.length; i++) {
//     const code = sample.charCodeAt(i);
//     if (
//       (code >= 0x0041 && code <= 0x005a) || // A-Z
//       (code >= 0x0061 && code <= 0x007a) // a-z
//     ) {
//       latin++;
//     } else if (code > 127 && code !== 160) {
//       nonLatin++;
//     }
//   }

//   if (latin === 0 && nonLatin === 0) return true;
//   return latin >= nonLatin;
// }

// function detectLanguageFromContent(text: string): string | undefined {
//   const sample = text.slice(0, 800);

//   if (/[اأإءؤئ]/.test(sample)) return "ar";
//   if (/[\u0900-\u097F]/.test(sample)) return "hi";
//   if (/[\u4e00-\u9fff]/.test(sample)) return "zh";
//   if (/[\u0400-\u04FF]/.test(sample)) return "ru";
//   if (/[\u3040-\u30ff]/.test(sample)) return "ja";
//   if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
//   if (isMostlyLatinScript(sample)) return "en";

//   return undefined;
// }

// function preserveCase(from: string, to: string): string {
//   if (!from) return to;
//   if (from[0] === from[0].toUpperCase()) {
//     return to.charAt(0).toUpperCase() + to.slice(1);
//   }
//   return to;
// }





// // src/hooks/use-humanize-content.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";

// /**
//  * Humanizer v3.5 (structure-safe + brutal paragraphs)
//  *
//  * Goals:
//  * - HTML structure 100% preserve:
//  *   - Does NOT break <b>, <strong>, <em>, <a>, <ul>/<ol>/<li>, headings, tables, etc.
//  *   - Does NOT eat spaces around bold/keyword spans.
//  * - Aggressive humanization INSIDE normal paragraphs:
//  *   - Disrupts AI boilerplate & patterns.
//  *   - Lexical + connector + light rhythm tweaks (only where safe).
//  * - Protected zones:
//  *   - Bold/strong/keyword spans: almost untouched (spacing only).
//  *   - Headings, lists, table cells: very conservative.
//  *   - Code/pre/script/style/svg: untouched.
//  * - Works on HTML snippets; no async calls; purely local.
//  */

// /* ────────────────────────────────────────────────────────────
//  * Types
//  * ──────────────────────────────────────────────────────────── */

// export interface HumanizedContentItem {
//   id: string;
//   sourceId?: string;
//   originalHtml: string;
//   humanizedHtml: string;
//   createdAt: string;
//   meta?: {
//     patternScore?: number;
//     transformations?: number;
//   };
// }

// export interface HumanizeOptions {
//   /**
//    * 0–1, higher = more aggressive paraphrase/variation.
//    * 0.8–0.9 = strong "humanization" for AI-ish drafts.
//    */
//   strength: number;
//   /**
//    * Allow light human-like quirks (hedging etc.).
//    */
//   allowImperfect: boolean;
//   /**
//    * Max char-level divergence vs original.
//    * 0.75 ≈ up to 75% change allowed in flexible zones.
//    */
//   maxChangeRatio: number;
//   /**
//    * Preserve semantics/structure.
//    */
//   preserveSemantics: boolean;
//   /**
//    * Optional language hint.
//    */
//   languageHint?: string;
// }

// const DEFAULT_OPTIONS: HumanizeOptions = {
//   strength: 0.9,
//   allowImperfect: true,
//   maxChangeRatio: 0.75,
//   preserveSemantics: true,
//   languageHint: undefined,
// };

// /* ────────────────────────────────────────────────────────────
//  * DOM context controls
//  * ──────────────────────────────────────────────────────────── */

// interface HumanizeContext {
//   inProtectedTag: boolean; // <b>, <strong>, explicit keyword spans, etc.
//   inHeadingLike: boolean; // headings, list items, table cells
// }

// const NO_TOUCH_TAGS = new Set([
//   "script",
//   "style",
//   "noscript",
//   "iframe",
//   "canvas",
//   "svg",
//   "pre",
//   "code",
// ]);

// const PROTECTED_INLINE_TAGS = new Set([
//   "b",
//   "strong",
//   "em",
//   "i",
//   "u",
//   "mark",
//   "kbd",
//   "samp",
//   "var",
//   "abbr",
//   "acronym",
//   "sub",
//   "sup",
//   "a",
// ]);

// const HEADING_OR_LIST_TAGS = new Set([
//   "h1",
//   "h2",
//   "h3",
//   "h4",
//   "h5",
//   "h6",
//   "li",
//   "ul",
//   "ol",
//   "dt",
//   "dd",
//   "th",
//   "td",
//   "caption",
// ]);

// /* ────────────────────────────────────────────────────────────
//  * Hook
//  * ──────────────────────────────────────────────────────────── */

// export default function useHumanizeContent() {
//   const [isHumanizing, setIsHumanizing] = useState(false);

//   const [items, setItems] = useLocalStorage<HumanizedContentItem[]>(
//     "humanized-items_v3_5",
//     []
//   );

//   const humanizeHtml = async (
//     html: string,
//     opts?: Partial<HumanizeOptions>,
//     sourceId?: string
//   ): Promise<string> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     try {
//       if (!html || typeof html !== "string") return html;

//       const result = runHumanizer(html, options);

//       const record: HumanizedContentItem = {
//         id: `${sourceId || "single"}-${Date.now()}-${Math.random()
//           .toString(36)
//           .slice(2, 8)}`,
//         sourceId,
//         originalHtml: html,
//         humanizedHtml: result.html,
//         createdAt: new Date().toISOString(),
//         meta: {
//           patternScore: result.patternScore,
//           transformations: result.transformations,
//         },
//       };

//       startTransition(() => {
//         setItems((prev = []) => [record, ...(prev || [])].slice(0, 500));
//       });

//       return result.html;
//     } catch (err) {
//       console.error("[HUMANIZE] failed:", err);
//       toast.error("Humanizer error: could not transform content.");
//       return html;
//     }
//   };

//   const humanizeMany = async (
//     batch: { id: string; html: string }[],
//     opts?: Partial<HumanizeOptions>
//   ): Promise<HumanizedContentItem[]> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };
//     if (!batch?.length) return [];

//     setIsHumanizing(true);
//     const out: HumanizedContentItem[] = [];

//     try {
//       for (const entry of batch) {
//         if (!entry?.html) continue;

//         const result = runHumanizer(entry.html, options);

//         const record: HumanizedContentItem = {
//           id: `${entry.id || "batch"}-${Date.now()}-${Math.random()
//             .toString(36)
//             .slice(2, 8)}`,
//           sourceId: entry.id,
//           originalHtml: entry.html,
//           humanizedHtml: result.html,
//           createdAt: new Date().toISOString(),
//           meta: {
//             patternScore: result.patternScore,
//             transformations: result.transformations,
//           },
//         };

//         out.push(record);
//       }

//       if (out.length) {
//         startTransition(() => {
//           setItems((prev = []) => [...out, ...(prev || [])].slice(0, 500));
//         });
//         toast.success(`Humanized ${out.length} item(s).`);
//       }

//       return out;
//     } catch (err) {
//       console.error("[HUMANIZE] batch failed:", err);
//       toast.error("Failed to humanize batch.");
//       return out;
//     } finally {
//       setIsHumanizing(false);
//     }
//   };

//   const clearHumanized = () => {
//     startTransition(() => setItems([]));
//     toast.success("Cleared humanized content history.");
//   };

//   return {
//     isHumanizing,
//     items,
//     humanizeHtml,
//     humanizeMany,
//     clearHumanized,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Core humanizer
//  * ──────────────────────────────────────────────────────────── */

// interface HumanizerResult {
//   html: string;
//   patternScore: number;
//   transformations: number;
// }

// interface TextProcessResult {
//   text: string;
//   transformations: number;
//   patternScore: number;
// }

// function runHumanizer(html: string, options: HumanizeOptions): HumanizerResult {
//   if (!html) {
//     return { html, patternScore: 1, transformations: 0 };
//   }

//   const lang = options.languageHint || detectLanguageFromContent(html);
//   const isLatin = isMostlyLatinScript(html);

//   // SSR / non-DOM fallback: plain text humanization only (no parsing).
//   if (typeof window === "undefined" || typeof DOMParser === "undefined") {
//     const res = processText(
//       html,
//       options,
//       lang,
//       isLatin,
//       { inProtectedTag: false, inHeadingLike: false }
//     );
//     return {
//       html: res.text,
//       patternScore: res.patternScore,
//       transformations: res.transformations,
//     };
//   }

//   const parser = new DOMParser();
//   const doc = parser.parseFromString(
//     `<!doctype html><html><body>${html}</body></html>`,
//     "text/html"
//   );
//   const root = doc.body;

//   let totalTransformations = 0;
//   let totalPatternScore = 0;
//   let textNodeCount = 0;

//   const initialCtx: HumanizeContext = {
//     inProtectedTag: false,
//     inHeadingLike: false,
//   };

//   function humanizeNode(node: Node, ctx: HumanizeContext): void {
//     if (node.nodeType === Node.TEXT_NODE) {
//       const original = (node as Text).data;
//       if (!original || !original.trim()) return;

//       const res = processText(original, options, lang, isLatin, ctx);
//       (node as Text).data = res.text;

//       totalTransformations += res.transformations;
//       totalPatternScore += res.patternScore;
//       textNodeCount++;
//       return;
//     }

//     if (node.nodeType === Node.ELEMENT_NODE) {
//       const el = node as Element;
//       const tag = el.tagName.toLowerCase();

//       if (NO_TOUCH_TAGS.has(tag)) {
//         return; // completely skip scripts, styles, code, etc.
//       }

//       const isProtectedInline =
//         PROTECTED_INLINE_TAGS.has(tag) ||
//         (tag === "span" &&
//           (el.className || "")
//             .toLowerCase()
//             .includes("keyword")); // treat keyword spans as protected

//       const isHeadingLike =
//         HEADING_OR_LIST_TAGS.has(tag) ||
//         (tag === "p" &&
//           ctx.inHeadingLike); // keep nested heading context safe

//       const nextCtx: HumanizeContext = {
//         inProtectedTag: ctx.inProtectedTag || isProtectedInline,
//         inHeadingLike: ctx.inHeadingLike || isHeadingLike,
//       };

//       // Recurse children
//       for (let i = 0; i < el.childNodes.length; i++) {
//         humanizeNode(el.childNodes[i], nextCtx);
//       }
//     }
//   }

//   for (let i = 0; i < root.childNodes.length; i++) {
//     humanizeNode(root.childNodes[i], initialCtx);
//   }

//   const avgPatternScore =
//     textNodeCount > 0 ? clamp(totalPatternScore / textNodeCount, 0, 1) : 1;

//   return {
//     html: root.innerHTML,
//     patternScore: avgPatternScore,
//     transformations: totalTransformations,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Text processing (context-aware)
//  * ──────────────────────────────────────────────────────────── */

// function processText(
//   text: string,
//   options: HumanizeOptions,
//   lang: string | undefined,
//   isLatin: boolean,
//   ctx: HumanizeContext
// ): TextProcessResult {
//   const original = text;

//   // Preserve outer spaces so HTML inline spacing (esp. around <b>) stays intact
//   const leading = original.match(/^[ \t]+/)?.[0] ?? "";
//   const trailing = original.match(/[ \t]+$/)?.[0] ?? "";
//   let core = original.slice(leading.length, original.length - trailing.length);

//   if (!core.trim()) {
//     return { text: original, transformations: 0, patternScore: 1 };
//   }

//   let transformations = 0;

//   // Protected inline zones: don't paraphrase keywords/anchors/bold — only clean insane spacing.
//   if (ctx.inProtectedTag) {
//     const safe = core.replace(/[ \t]{3,}/g, "  ");
//     if (safe !== core) transformations++;
//     const merged = leading + safe + trailing;
//     return { text: merged, transformations, patternScore: 1 };
//   }

//   // Clone + tune options based on context
//   const local: HumanizeOptions = { ...options };

//   if (ctx.inHeadingLike) {
//     // Conservative: keep headings / bullets / table cells readable & stable.
//     local.strength = clamp(local.strength * 0.6, 0.35, 0.9);
//     local.allowImperfect = false;
//     local.preserveSemantics = true;
//   }

//   // Soft normalize inside (not killing \n, not touching edges)
//   let currentText = normalizeWhitespaceSoft(core);

//   // Layer 1: Boilerplate kill
//   const boilerplateRes = replaceBoilerplate(currentText);
//   currentText = boilerplateRes.text;
//   transformations += boilerplateRes.count;

//   if (isLatin) {
//     // Layer 2: Connectors
//     const phraseRes = paraphrasePhrases(currentText, local.strength);
//     currentText = phraseRes.text;
//     transformations += phraseRes.count;

//     // Layer 3: Contractions (skip in headings/lists)
//     if (!ctx.inHeadingLike) {
//       const contractRes = addContractions(currentText, local.strength);
//       currentText = contractRes.text;
//       transformations += contractRes.count;
//     }

//     // Layer 4: Rhythm (only for free-flow paras, not structural blocks)
//     if (!ctx.inHeadingLike && !local.preserveSemantics) {
//       const rhythmRes = adjustSentenceRhythm(
//         currentText,
//         local.strength,
//         local.preserveSemantics
//       );
//       currentText = rhythmRes.text;
//       transformations += rhythmRes.count;
//     }

//     // Layer 5: Lexical variation
//     const varyRes = varyWordChoice(currentText, local.strength);
//     currentText = varyRes.text;
//     transformations += varyRes.count;
//   } else {
//     // Non-Latin: gentle softening only
//     const softenRes = softenDefinitiveLanguage(currentText, local.strength);
//     currentText = softenRes.text;
//     transformations += softenRes.count;
//   }

//   // Layer 6: Quirks (only in paragraphs)
//   if (local.allowImperfect && !ctx.inHeadingLike) {
//     const quirkRes = injectHumanQuirksGeneric(
//       currentText,
//       local.strength,
//       lang
//     );
//     currentText = quirkRes.text;
//     transformations += quirkRes.count;
//   }

//   // Final: spacing tidy (internal only; edges preserved above)
//   currentText = fixSpacing(currentText);

//   // Respect maxChangeRatio only where we're allowed to be flexible
//   if (local.maxChangeRatio > 0 && !ctx.inHeadingLike) {
//     currentText = enforceMaxChangeRatio(core, currentText, local.maxChangeRatio);
//   }

//   const finalText = leading + currentText + trailing;
//   const patternScore = estimatePatternScore(original, finalText);

//   return { text: finalText, transformations, patternScore };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 1: Boilerplate
//  * ──────────────────────────────────────────────────────────── */

// function replaceBoilerplate(text: string): { text: string; count: number } {
//   const replacements: Array<[RegExp, string]> = [
//     [/in conclusion[, ]*/gi, "To wrap things up, "],
//     [/to conclude[, ]*/gi, "Overall, "],
//     [/in summary[, ]*/gi, "Simply put, "],
//     [/this article will explore/gi, "we're going to look at"],
//     [/throughout this article[, ]*/gi, ""],
//     [/it is important to note that/gi, "it's worth knowing that"],
//     [/it is worth noting that/gi, "it's worth noting that"],
//     [/in today's (digital )?age/gi, "these days"],
//     [/with that being said[, ]*/gi, "still, "],
//     [/it should be noted that/gi, "keep in mind that"],
//     [/it is essential to/gi, "you need to"],
//     [/it is crucial to/gi, "it's key to"],
//     [/it is imperative that/gi, "you must"],
//     [/one must/gi, "you should"],
//     [/it can be seen that/gi, "you'll notice that"],
//     [/it is evident that/gi, "clearly, "],
//     [/as a matter of fact/gi, "actually, "],
//     [/needless to say/gi, "obviously, "],
//     [/it goes without saying/gi, "of course, "],
//     [/in order to/gi, "to"],
//     [/in the event that/gi, "if"],
//     [/due to the fact that/gi, "because"],
//     [/for the purpose of/gi, "to"],
//     [/with regard to/gi, "about"],
//     [/with respect to/gi, "regarding"],
//     [/in this guide[, ]*/gi, ""],
//     [/in this article[, ]*/gi, ""],
//     [/delve into/gi, "dive into"],
//     [/shed light on/gi, "highlight"],
//     [/unleash the power of/gi, "tap into"],
//     [/embark on a journey/gi, "start exploring"],
//     [/in the realm of/gi, "in the world of"],
//     [/a plethora of/gi, "lots of"],
//     [/the fact of the matter is/gi, "the thing is"],
//     [/it is no secret that/gi, "everyone knows"],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, repl] of replacements) {
//     if (pattern.test(out)) {
//       out = out.replace(pattern, () => {
//         count++;
//         return repl;
//       });
//     }
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 2: Connectors
//  * ──────────────────────────────────────────────────────────── */

// function paraphrasePhrases(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const map: Array<[RegExp, string[]]> = [
//     [/however,/gi, ["But,", "Still,", "That said,", "Though,", "Yet,"]],
//     [/moreover,/gi, ["Plus,", "On top of that,", "Also,", "What's more,"]],
//     [/furthermore,/gi, ["Also,", "Besides,", "Plus,", "On top of that,"]],
//     [/additionally,/gi, ["Also,", "Plus,", "On a related note,", "Another point:"]],
//     [/therefore,/gi, ["So,", "Because of that,", "As a result,", "That's why,"]],
//     [/overall,/gi, ["All in all,", "In general,", "Looking at everything,", "Bottom line,"]],
//     [/in other words,/gi, ["Put simply,", "Basically,", "In simple terms,", "Or rather,"]],
//     [/consequently,/gi, ["So,", "As a result,", "That means,", "Hence,"]],
//     [/nevertheless,/gi, ["Still,", "Even so,", "But,", "All the same,"]],
//     [/thus,/gi, ["So,", "Because of that,", "As a result,"]],
//     [/hence,/gi, ["So,", "That's why,", "For that reason,"]],
//     [/for example,/gi, ["for example,", "like,", "such as,"]],
//     [/for instance,/gi, ["for instance,", "like,", "say,"]],
//     [/on the other hand,/gi, ["but then,", "on the flip side,", "conversely,"]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, options] of map) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.7) return match;
//       const choice = options[(Math.random() * options.length) | 0];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 3: Contractions
//  * ──────────────────────────────────────────────────────────── */

// function addContractions(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const replacements: Array<
//     [RegExp, string | ((match: string, ...args: any[]) => string)]
//   > = [
//     [
//       /(\b(it|he|she|they|we|you|I|that|who|what|where|when|why|how) )is\b/gi,
//       (_match: string, p1: string) => p1 + "'s",
//     ],
//     [
//       /(\b(he|she|it|they|we|you|I|that|who|what|where|when|why|how) )are\b/gi,
//       (_match: string, p1: string) => p1 + "'re",
//     ],
//     [/ do not /gi, " don't "],
//     [/ does not /gi, " doesn't "],
//     [/ did not /gi, " didn't "],
//     [/ can not /gi, " can't "],
//     [/ will not /gi, " won't "],
//     [/ would not /gi, " wouldn't "],
//     [/ should not /gi, " shouldn't "],
//     [/ could not /gi, " couldn't "],
//     [/ has not /gi, " hasn't "],
//     [/ have not /gi, " haven't "],
//     [/ had not /gi, " hadn't "],
//     [/ shall not /gi, " shan't "],
//     [/ is not /gi, " isn't "],
//     [/ was not /gi, " wasn't "],
//     [/ were not /gi, " weren't "],
//   ];

//   for (const [pattern, repl] of replacements) {
//     out = out.replace(pattern, (match, ...args) => {
//       if (Math.random() > strength * 0.7) return match;
//       count++;
//       return typeof repl === "function" ? repl(match, ...args) : repl;
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 4: Sentence rhythm (conservative)
//  * ──────────────────────────────────────────────────────────── */

// function adjustSentenceRhythm(
//   text: string,
//   strength: number,
//   preserveSemantics: boolean
// ): { text: string; count: number } {
//   const raw = text.trim();
//   if (!raw) return { text, count: 0 };

//   const blocks = raw.split(/\n{2,}/);
//   let changed = 0;
//   const processedBlocks: string[] = [];

//   for (const block of blocks) {
//     if (!block.trim()) {
//       processedBlocks.push(block);
//       continue;
//     }

//     const sentences = block
//       .split(/([.!?])\s*/)

//       .reduce<string[]>((acc, cur, idx, arr) => {
//         if (idx % 2 === 0) {
//           const punct = arr[idx + 1] || "";
//           const s = (cur + punct).trim();
//           if (s) acc.push(s);
//         }
//         return acc;
//       }, []);

//     if (sentences.length <= 1) {
//       processedBlocks.push(block);
//       continue;
//     }

//     const out: string[] = [];
//     let i = 0;

//     while (i < sentences.length) {
//       const s = sentences[i];

//       // Skip list-like / heading-style sentences
//       if (/^[-•*#]|\d+\./.test(s)) {
//         out.push(s);
//         i++;
//         continue;
//       }

//       // Split long sentences a bit
//       if (
//         !preserveSemantics &&
//         s.length > 160 &&
//         Math.random() < strength * 0.4
//       ) {
//         const splitAt = findSplitPoint(s) ?? Math.floor(s.length / 2);
//         const first = s.slice(0, splitAt).trim() + ".";
//         const second = s.slice(splitAt).trim();
//         if (first && second && /[a-zA-Z0-9]/.test(second[0])) {
//           out.push(first);
//           out.push(second);
//           changed++;
//           i++;
//           continue;
//         }
//       }

//       // Light merge of short neighbors
//       if (
//         !preserveSemantics &&
//         i < sentences.length - 1 &&
//         s.length < 40 &&
//         sentences[i + 1].length < 70 &&
//         Math.random() < strength * 0.2
//       ) {
//         const next = sentences[i + 1];
//         out.push(
//           `${s.replace(/[.!?]+$/, "")}, ${next.charAt(0).toLowerCase()}${next.slice(
//             1
//           )}`
//         );
//         changed++;
//         i += 2;
//         continue;
//       }

//       out.push(s);
//       i++;
//     }

//     const blockOut = out.join(" ").replace(/\s{2,}/g, " ").trim();
//     processedBlocks.push(blockOut);
//   }

//   const finalText = processedBlocks.join("\n\n").replace(/\n{3,}/g, "\n\n");

//   return { text: finalText, count: changed };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 5: Lexical variation
//  * ──────────────────────────────────────────────────────────── */

// function varyWordChoice(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const patterns: Array<[RegExp, string[]]> = [
//     [/utilize/gi, ["use", "make use of", "work with"]],
//     [/facilitate/gi, ["help", "make easier", "support"]],
//     [/leverage/gi, ["use", "take advantage of", "lean on"]],
//     [/implement/gi, ["use", "apply", "put in place"]],
//     [/optimize/gi, ["improve", "tune", "tighten"]],
//     [/significant/gi, ["important", "big", "noticeable"]],
//     [/significantly/gi, ["a lot", "noticeably", "clearly"]],
//     [/numerous/gi, ["many", "plenty of", "loads of"]],
//     [/various/gi, ["different", "a mix of", "all sorts of"]],
//     [/crucial/gi, ["key", "very important", "essential"]],
//     [/ensure/gi, ["make sure", "double-check", "help guarantee"]],
//     [/robust/gi, ["solid", "reliable", "strong"]],
//     [/seamless/gi, ["smooth", "easy", "effortless"]],
//     [/comprehensive/gi, ["detailed", "thorough", "full"]],
//     [/delve/gi, ["dive into", "explore", "get into"]],
//     [/realm/gi, ["world", "space", "area"]],
//     [/plethora/gi, ["a lot of", "plenty of", "loads of"]],
//     [/testament/gi, ["proof", "sign", "example"]],
//     [/paramount/gi, ["essential", "top priority", "critical"]],
//     [/myriad/gi, ["many", "tons of", "plenty"]],
//   ];

//   for (const [pattern, choices] of patterns) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.65) return match;
//       const choice = choices[(Math.random() * choices.length) | 0];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Non-English softeners
//  * ──────────────────────────────────────────────────────────── */

// function softenDefinitiveLanguage(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   out = out.replace(/(\b(always|never)\b)/gi, (m) => {
//     if (Math.random() < strength * 0.3) {
//       count++;
//       return "often";
//     }
//     return m;
//   });

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Layer 6: Quirks (very light)
//  * ──────────────────────────────────────────────────────────── */

// function injectHumanQuirksGeneric(
//   text: string,
//   strength: number,
//   lang?: string
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   if (!lang || /^en|es|fr|de|pt|it|nl|ro|pl|tr$/i.test(lang)) {
//     out = out.replace(
//       /\b(definitely|certainly|clearly|absolutely)\b/gi,
//       (m) => {
//         if (Math.random() < strength * 0.35) {
//           count++;
//           const choices = [
//             "pretty much",
//             "in many cases",
//             "often",
//             "to be honest",
//             m.toLowerCase(),
//           ];
//           return choices[(Math.random() * choices.length) | 0];
//         }
//         return m;
//       }
//     );
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Helpers
//  * ──────────────────────────────────────────────────────────── */

// function normalizeWhitespaceSoft(text: string): string {
//   // Preserve \n, allow double spaces, collapse crazy gaps.
//   return text.replace(/([^\S\n]{3,}|\t{2,})/g, "  ");
// }

// function fixSpacing(text: string): string {
//   let out = text;

//   // Ensure a space after punctuation if next char is a word and not a tag.
//   out = out.replace(/([.,!?;:])(?=[^\s\n<])/g, "$1 ");

//   // Collapse 3+ spaces between visible chars to 1 (keep <=2 for rhythm).
//   out = out.replace(/(\S)[ \t]{3,}(\S)/g, "$1 $2");

//   // Tidy quotes (internal only)
//   out = out.replace(/"([ \t]{2,})/g, '" ');
//   out = out.replace(/([ \t]{2,})"/g, ' "');

//   return out;
// }

// function estimatePatternScore(original: string, changed: string): number {
//   if (!original || !changed) return 1;
//   if (original === changed) return 1;

//   const o = original.replace(/\s+/g, " ").trim();
//   const c = changed.replace(/\s+/g, " ").trim();
//   if (!o || !c) return 1;

//   const minLen = Math.min(o.length, c.length);
//   if (minLen === 0) return 1;

//   let same = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (o.charAt(i) === c.charAt(i)) same++;
//   }

//   const similarity = same / minLen;
//   const lengthDiff =
//     Math.abs(o.split(" ").length - c.split(" ").length) /
//     Math.max(o.split(" ").length, 1);

//   const uniformityPenalty = lengthDiff * 0.1;
//   return clamp(similarity - uniformityPenalty, 0, 1);
// }

// function enforceMaxChangeRatio(
//   original: string,
//   changed: string,
//   maxRatio: number
// ): string {
//   if (maxRatio <= 0) return changed;
//   const oLen = original.length;
//   const cLen = changed.length;
//   const minLen = Math.min(oLen, cLen);
//   if (minLen === 0 || oLen === 0) return changed;

//   let diff = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (original[i] !== changed[i]) diff++;
//   }
//   diff += Math.abs(oLen - cLen);

//   const ratio = diff / oLen;
//   if (ratio <= maxRatio) return changed;

//   // Blend beginning of original + tail of changed to avoid over-cooking.
//   const keepRatio = 0.45;
//   const keepLen = Math.floor(oLen * keepRatio);
//   const tailLen = Math.max(0, cLen - (oLen - keepLen));
//   const tail = changed.slice(-tailLen);

//   return [original.slice(0, keepLen), tail].filter(Boolean).join(" ").trim();
// }

// function clamp(n: number, min: number, max: number): number {
//   return Math.max(min, Math.min(max, n));
// }

// function findSplitPoint(s: string): number | null {
//   const mid = Math.floor(s.length / 2);
//   let best = -1;

//   for (let i = Math.max(0, mid - 40); i <= mid + 40; i++) {
//     if (i > 25 && i < s.length - 25) {
//       if (s[i] === "," || s[i] === ";") {
//         best = i + 1;
//         break;
//       }
//     }
//   }

//   if (best !== -1) return best;

//   const connectors = [" and ", " or ", " but "];
//   for (const conn of connectors) {
//     const idx = s.toLowerCase().indexOf(conn, mid - 40);
//     if (idx > 25 && idx < s.length - 25) {
//       return idx + conn.length;
//     }
//   }

//   return null;
// }

// /* ────────────────────────────────────────────────────────────
//  * Language detection
//  * ──────────────────────────────────────────────────────────── */

// function isMostlyLatinScript(text: string): boolean {
//   const sample = text.slice(0, 800);
//   let latin = 0;
//   let nonLatin = 0;

//   for (let i = 0; i < sample.length; i++) {
//     const code = sample.charCodeAt(i);
//     if (
//       (code >= 0x0041 && code <= 0x005a) ||
//       (code >= 0x0061 && code <= 0x007a)
//     ) {
//       latin++;
//     } else if (code > 127 && code !== 160) {
//       nonLatin++;
//     }
//   }

//   if (latin === 0 && nonLatin === 0) return true;
//   return latin >= nonLatin;
// }

// function detectLanguageFromContent(text: string): string | undefined {
//   const sample = text.slice(0, 800);

//   if (/[اأإءؤئ]/.test(sample)) return "ar";
//   if (/[\u0900-\u097F]/.test(sample)) return "hi";
//   if (/[\u4e00-\u9fff]/.test(sample)) return "zh";
//   if (/[\u0400-\u04FF]/.test(sample)) return "ru";
//   if (/[\u3040-\u30ff]/.test(sample)) return "ja";
//   if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
//   if (isMostlyLatinScript(sample)) return "en";

//   return undefined;
// }

// function preserveCase(from: string, to: string): string {
//   if (!from) return to;
//   if (from[0] === from[0].toUpperCase()) {
//     return to.charAt(0).toUpperCase() + to.slice(1);
//   }
//   return to;
// }





// // src/hooks/use-humanize-content.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";

// /**
//  * Humanizer v4.0 - BRUTAL ANTI-AI DETECTION
//  * 
//  * Target: <5% AI score on ZeroGPT, GPTZero, etc.
//  * 
//  * Key strategies:
//  * 1. PERPLEXITY: Drastically varied sentence complexity
//  * 2. BURSTINESS: Sharp short sentences + meandering long ones
//  * 3. NATURAL MISTAKES: Comma splices, run-ons, fragments
//  * 4. CASUAL FILLERS: "honestly", "basically", "sort of", "kind of"
//  * 5. THOUGHT TRAILS: Ideas that circle back, mid-sentence pivots
//  * 6. MICRO-REDUNDANCY: Humans repeat themselves naturally
//  * 7. INCONSISTENT FORMALITY: Mix professional + conversational
//  */

// export interface HumanizedContentItem {
//   id: string;
//   sourceId?: string;
//   originalHtml: string;
//   humanizedHtml: string;
//   createdAt: string;
//   meta?: {
//     patternScore?: number;
//     transformations?: number;
//     aiScore?: number;
//   };
// }

// export interface HumanizeOptions {
//   strength: number; // 0-1, recommend 0.9-0.95 for anti-AI
//   allowImperfect: boolean; // MUST be true for anti-AI
//   maxChangeRatio: number; // 0.8-0.85 for aggressive
//   preserveSemantics: boolean;
//   languageHint?: string;
// }

// const DEFAULT_OPTIONS: HumanizeOptions = {
//   strength: 0.95, // Increased from 0.9
//   allowImperfect: true,
//   maxChangeRatio: 0.85, // Increased from 0.75
//   preserveSemantics: true,
//   languageHint: undefined,
// };

// interface HumanizeContext {
//   inProtectedTag: boolean;
//   inHeadingLike: boolean;
// }

// const NO_TOUCH_TAGS = new Set([
//   "script", "style", "noscript", "iframe", "canvas", "svg", "pre", "code",
// ]);

// const PROTECTED_INLINE_TAGS = new Set([
//   "b", "strong", "em", "i", "u", "mark", "kbd", "samp", "var",
//   "abbr", "acronym", "sub", "sup", "a",
// ]);

// const HEADING_OR_LIST_TAGS = new Set([
//   "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol",
//   "dt", "dd", "th", "td", "caption",
// ]);

// /* ────────────────────────────────────────────────────────────
//  * Hook
//  * ──────────────────────────────────────────────────────────── */

// export default function useHumanizeContent() {
//   const [isHumanizing, setIsHumanizing] = useState(false);
//   const [items, setItems] = useLocalStorage<HumanizedContentItem[]>(
//     "humanized-items_v4",
//     []
//   );

//   const humanizeHtml = async (
//     html: string,
//     opts?: Partial<HumanizeOptions>,
//     sourceId?: string
//   ): Promise<string> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     try {
//       if (!html || typeof html !== "string") return html;

//       const result = runHumanizer(html, options);

//       const record: HumanizedContentItem = {
//         id: `${sourceId || "single"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//         sourceId,
//         originalHtml: html,
//         humanizedHtml: result.html,
//         createdAt: new Date().toISOString(),
//         meta: {
//           patternScore: result.patternScore,
//           transformations: result.transformations,
//           aiScore: result.estimatedAiScore,
//         },
//       };

//       startTransition(() => {
//         setItems((prev = []) => [record, ...(prev || [])].slice(0, 500));
//       });

//       return result.html;
//     } catch (err) {
//       console.error("[HUMANIZE] failed:", err);
//       toast.error("Humanizer error: could not transform content.");
//       return html;
//     }
//   };

//   const humanizeMany = async (
//     batch: { id: string; html: string }[],
//     opts?: Partial<HumanizeOptions>
//   ): Promise<HumanizedContentItem[]> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };
//     if (!batch?.length) return [];

//     setIsHumanizing(true);
//     const out: HumanizedContentItem[] = [];

//     try {
//       for (const entry of batch) {
//         if (!entry?.html) continue;

//         const result = runHumanizer(entry.html, options);

//         const record: HumanizedContentItem = {
//           id: `${entry.id || "batch"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//           sourceId: entry.id,
//           originalHtml: entry.html,
//           humanizedHtml: result.html,
//           createdAt: new Date().toISOString(),
//           meta: {
//             patternScore: result.patternScore,
//             transformations: result.transformations,
//             aiScore: result.estimatedAiScore,
//           },
//         };

//         out.push(record);
//       }

//       if (out.length) {
//         startTransition(() => {
//           setItems((prev = []) => [...out, ...(prev || [])].slice(0, 500));
//         });
//         toast.success(`Humanized ${out.length} item(s) - AI score reduced.`);
//       }

//       return out;
//     } catch (err) {
//       console.error("[HUMANIZE] batch failed:", err);
//       toast.error("Failed to humanize batch.");
//       return out;
//     } finally {
//       setIsHumanizing(false);
//     }
//   };

//   const clearHumanized = () => {
//     startTransition(() => setItems([]));
//     toast.success("Cleared humanized content history.");
//   };

//   return {
//     isHumanizing,
//     items,
//     humanizeHtml,
//     humanizeMany,
//     clearHumanized,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Core Humanizer
//  * ──────────────────────────────────────────────────────────── */

// interface HumanizerResult {
//   html: string;
//   patternScore: number;
//   transformations: number;
//   estimatedAiScore: number;
// }

// interface TextProcessResult {
//   text: string;
//   transformations: number;
//   patternScore: number;
// }

// function runHumanizer(html: string, options: HumanizeOptions): HumanizerResult {
//   if (!html) {
//     return { html, patternScore: 1, transformations: 0, estimatedAiScore: 0 };
//   }

//   const lang = options.languageHint || detectLanguageFromContent(html);
//   const isLatin = isMostlyLatinScript(html);

//   if (typeof window === "undefined" || typeof DOMParser === "undefined") {
//     const res = processText(html, options, lang, isLatin, {
//       inProtectedTag: false,
//       inHeadingLike: false,
//     });
//     return {
//       html: res.text,
//       patternScore: res.patternScore,
//       transformations: res.transformations,
//       estimatedAiScore: estimateAiScore(html, res.text),
//     };
//   }

//   const parser = new DOMParser();
//   const doc = parser.parseFromString(
//     `<!doctype html><html><body>${html}</body></html>`,
//     "text/html"
//   );
//   const root = doc.body;

//   let totalTransformations = 0;
//   let totalPatternScore = 0;
//   let textNodeCount = 0;

//   const initialCtx: HumanizeContext = {
//     inProtectedTag: false,
//     inHeadingLike: false,
//   };

//   function humanizeNode(node: Node, ctx: HumanizeContext): void {
//     if (node.nodeType === Node.TEXT_NODE) {
//       const original = (node as Text).data;
//       if (!original || !original.trim()) return;

//       const res = processText(original, options, lang, isLatin, ctx);
//       (node as Text).data = res.text;

//       totalTransformations += res.transformations;
//       totalPatternScore += res.patternScore;
//       textNodeCount++;
//       return;
//     }

//     if (node.nodeType === Node.ELEMENT_NODE) {
//       const el = node as Element;
//       const tag = el.tagName.toLowerCase();

//       if (NO_TOUCH_TAGS.has(tag)) return;

//       const isProtectedInline =
//         PROTECTED_INLINE_TAGS.has(tag) ||
//         (tag === "span" && (el.className || "").toLowerCase().includes("keyword"));

//       const isHeadingLike = HEADING_OR_LIST_TAGS.has(tag) || (tag === "p" && ctx.inHeadingLike);

//       const nextCtx: HumanizeContext = {
//         inProtectedTag: ctx.inProtectedTag || isProtectedInline,
//         inHeadingLike: ctx.inHeadingLike || isHeadingLike,
//       };

//       for (let i = 0; i < el.childNodes.length; i++) {
//         humanizeNode(el.childNodes[i], nextCtx);
//       }
//     }
//   }

//   for (let i = 0; i < root.childNodes.length; i++) {
//     humanizeNode(root.childNodes[i], initialCtx);
//   }

//   const avgPatternScore = textNodeCount > 0 ? clamp(totalPatternScore / textNodeCount, 0, 1) : 1;
//   const finalHtml = root.innerHTML;

//   return {
//     html: finalHtml,
//     patternScore: avgPatternScore,
//     transformations: totalTransformations,
//     estimatedAiScore: estimateAiScore(html, finalHtml),
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Text Processing - BRUTALLY ENHANCED
//  * ──────────────────────────────────────────────────────────── */

// function processText(
//   text: string,
//   options: HumanizeOptions,
//   lang: string | undefined,
//   isLatin: boolean,
//   ctx: HumanizeContext
// ): TextProcessResult {
//   const original = text;

//   const leading = original.match(/^[ \t]+/)?.[0] ?? "";
//   const trailing = original.match(/[ \t]+$/)?.[0] ?? "";
//   let core = original.slice(leading.length, original.length - trailing.length);

//   if (!core.trim()) {
//     return { text: original, transformations: 0, patternScore: 1 };
//   }

//   let transformations = 0;

//   if (ctx.inProtectedTag) {
//     const safe = core.replace(/[ \t]{3,}/g, "  ");
//     if (safe !== core) transformations++;
//     return { text: leading + safe + trailing, transformations, patternScore: 1 };
//   }

//   const local: HumanizeOptions = { ...options };

//   if (ctx.inHeadingLike) {
//     local.strength = clamp(local.strength * 0.55, 0.3, 0.9);
//     local.allowImperfect = false;
//     local.preserveSemantics = true;
//   }

//   let currentText = normalizeWhitespaceSoft(core);

//   // BRUTAL HUMANIZATION LAYERS

//   // Layer 1: Kill boilerplate (enhanced) - SKIP for headings to preserve them
//   if (!ctx.inHeadingLike) {
//     const boilerplateRes = killBoilerplateAggressively(currentText);
//     currentText = boilerplateRes.text;
//     transformations += boilerplateRes.count;
//   }

//   if (isLatin) {
//     // Layer 2: Natural fillers & hedges (NEW - critical for AI detection) - SKIP for headings
//     if (!ctx.inHeadingLike) {
//       const fillerRes = injectNaturalFillers(currentText, local.strength);
//       currentText = fillerRes.text;
//       transformations += fillerRes.count;
//     }

//     // Layer 3: Connectors (enhanced) - SKIP for headings
//     if (!ctx.inHeadingLike) {
//       const phraseRes = paraphrasePhrasesAggressively(currentText, local.strength);
//       currentText = phraseRes.text;
//       transformations += phraseRes.count;
//     }

//     // Layer 4: Contractions (keep)
//     if (!ctx.inHeadingLike) {
//       const contractRes = addContractions(currentText, local.strength);
//       currentText = contractRes.text;
//       transformations += contractRes.count;
//     }

//     // Layer 5: Sentence PERPLEXITY (NEW - key for AI detection)
//     if (!ctx.inHeadingLike) {
//       const perplexityRes = injectPerplexity(currentText, local.strength);
//       currentText = perplexityRes.text;
//       transformations += perplexityRes.count;
//     }

//     // Layer 6: BURSTINESS - varied rhythm (enhanced)
//     if (!ctx.inHeadingLike) {
//       const burstRes = injectBurstiness(currentText, local.strength, local.preserveSemantics);
//       currentText = burstRes.text;
//       transformations += burstRes.count;
//     }

//     // Layer 7: Lexical variation (enhanced) - SKIP for headings to preserve them
//     if (!ctx.inHeadingLike) {
//       const varyRes = varyWordChoiceAggressively(currentText, local.strength);
//       currentText = varyRes.text;
//       transformations += varyRes.count;
//     }

//     // Layer 8: Micro-redundancy (NEW - humans repeat)
//     if (!ctx.inHeadingLike && local.allowImperfect) {
//       const redundRes = addMicroRedundancy(currentText, local.strength);
//       currentText = redundRes.text;
//       transformations += redundRes.count;
//     }

//     // Layer 9: Thought trails & pivots (NEW - natural flow breaks)
//     if (!ctx.inHeadingLike && local.allowImperfect) {
//       const trailRes = addThoughtTrails(currentText, local.strength);
//       currentText = trailRes.text;
//       transformations += trailRes.count;
//     }

//     // Layer 10: Casual observations (NEW - personal touch)
//     if (!ctx.inHeadingLike && local.allowImperfect) {
//       const observRes = addCasualObservations(currentText, local.strength);
//       currentText = observRes.text;
//       transformations += observRes.count;
//     }
//   } else {
//     const softenRes = softenDefinitiveLanguage(currentText, local.strength);
//     currentText = softenRes.text;
//     transformations += softenRes.count;
//   }

//   // Layer 11: Generic quirks (enhanced)
//   if (local.allowImperfect && !ctx.inHeadingLike) {
//     const quirkRes = injectHumanQuirksEnhanced(currentText, local.strength, lang);
//     currentText = quirkRes.text;
//     transformations += quirkRes.count;
//   }

//   currentText = fixSpacing(currentText);

//   if (local.maxChangeRatio > 0 && !ctx.inHeadingLike) {
//     currentText = enforceMaxChangeRatio(core, currentText, local.maxChangeRatio);
//   }

//   const finalText = leading + currentText + trailing;
//   const patternScore = estimatePatternScore(original, finalText);

//   return { text: finalText, transformations, patternScore };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 1: Boilerplate Killer (Enhanced)
//  * ──────────────────────────────────────────────────────────── */

// function killBoilerplateAggressively(text: string): { text: string; count: number } {
//   const replacements: Array<[RegExp, string | string[]]> = [
//     [/in conclusion[, ]*/gi, ["To wrap up, ", "Overall, ", "Bottom line, ", "So, "]],
//     [/to conclude[, ]*/gi, ["In short, ", "Basically, ", "All said, "]],
//     [/in summary[, ]*/gi, ["Simply put, ", "Long story short, ", "The gist is, "]],
//     [/this article will explore/gi, ["we'll look at", "let's check out", "here's what we'll cover"]],
//     [/throughout this article[, ]*/gi, ""],
//     [/it is important to note that/gi, ["worth knowing that", "keep in mind", "just so you know"]],
//     [/it is worth noting that/gi, ["worth mentioning", "to be fair", "actually"]],
//     [/in today's (digital )?age/gi, ["these days", "nowadays", "right now"]],
//     [/with that being said[, ]*/gi, ["still, ", "but, ", "though, "]],
//     [/it should be noted that/gi, ["just know that", "heads up—", "thing is, "]],
//     [/it is essential to/gi, ["you need to", "you've gotta", "make sure to"]],
//     [/it is crucial to/gi, ["it's key to", "really helps to", "you should"]],
//     [/one must/gi, ["you should", "it helps to", "best to"]],
//     [/it can be seen that/gi, ["you'll notice", "seems like", "looks like"]],
//     [/it is evident that/gi, ["clearly, ", "obviously, ", "you can see "]],
//     [/as a matter of fact/gi, ["actually, ", "honestly, ", "truth is, "]],
//     [/needless to say/gi, ["obviously, ", "of course, ", "naturally, "]],
//     [/it goes without saying/gi, ["obviously, ", "naturally, ", "sure, "]],
//     [/in order to/gi, "to"],
//     [/in the event that/gi, "if"],
//     [/due to the fact that/gi, ["because", "since", "seeing as"]],
//     [/for the purpose of/gi, "to"],
//     [/with regard to/gi, ["about", "regarding", "on"]],
//     [/in this guide[, ]*/gi, ""],
//     [/in this article[, ]*/gi, ""],
//     [/delve into/gi, ["dive into", "get into", "explore", "check out"]],
//     [/shed light on/gi, ["highlight", "show", "reveal", "explain"]],
//     [/unleash the power of/gi, ["tap into", "use", "make the most of"]],
//     [/embark on a journey/gi, ["start exploring", "begin with", "kick things off"]],
//     [/in the realm of/gi, ["in the world of", "when it comes to", "in"]],
//     [/a plethora of/gi, ["lots of", "tons of", "plenty of", "loads of"]],
//     [/the fact of the matter is/gi, ["the thing is", "truth is", "basically"]],
//     [/it is no secret that/gi, ["everyone knows", "it's clear that", "obviously"]],
//     [/at the end of the day/gi, ["ultimately", "basically", "in the end"]],
//     [/when all is said and done/gi, ["ultimately", "in the end", "bottom line"]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, repl] of replacements) {
//     out = out.replace(pattern, () => {
//       count++;
//       if (Array.isArray(repl)) {
//         return repl[Math.floor(Math.random() * repl.length)];
//       }
//       return repl;
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 2: Natural Fillers (NEW - Critical for AI Detection)
//  * ──────────────────────────────────────────────────────────── */

// function injectNaturalFillers(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const fillers = [
//     { pattern: /\b(very|really|quite)\s+(\w+)\b/gi, replacements: ["pretty $2", "fairly $2", "kind of $2", "sort of $2"] },
//     { pattern: /\b(important|significant|crucial)\b/gi, replacements: ["pretty important", "quite significant", "really crucial"] },
//     { pattern: /\. ([A-Z])/g, replacements: [". Honestly, $1", ". Basically, $1", ". To be fair, $1", ". Actually, $1"] },
//   ];

//   for (const { pattern, replacements } of fillers) {
//     out = out.replace(pattern, (match, ...groups) => {
//       if (Math.random() > strength * 0.4) return match;
//       count++;
//       let choice = replacements[Math.floor(Math.random() * replacements.length)];
//       groups.forEach((group, i) => {
//         choice = choice.replace(`$${i + 1}`, group);
//       });
//       return choice;
//     });
//   }

//   // Add hedging words
//   const hedges: Array<[RegExp, string[]]> = [
//     [/\b(is|are|was|were)\s+(\w+)/gi, ["might be $2", "could be $2", "seems $2", "appears $2", "looks $2"]],
//     [/\b(will|would)\s+(\w+)/gi, ["might $2", "could $2", "probably will $2", "likely to $2"]],
//   ];

//   for (const [pattern, options] of hedges) {
//     out = out.replace(pattern, (match, _verb, word) => {
//       if (Math.random() > strength * 0.3) return match;
//       count++;
//       const choice = options[Math.floor(Math.random() * options.length)];
//       return choice.replace("$2", word);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 3: Connectors (Enhanced)
//  * ──────────────────────────────────────────────────────────── */

// function paraphrasePhrasesAggressively(text: string, strength: number): { text: string; count: number } {
//   const map: Array<[RegExp, string[]]> = [
//     [/however,/gi, ["But,", "Still,", "That said,", "Though,", "Yet,", "Mind you,"]],
//     [/moreover,/gi, ["Plus,", "On top of that,", "Also,", "What's more,", "And hey,"]],
//     [/furthermore,/gi, ["Also,", "Besides,", "Plus,", "Another thing—", "Add to that,"]],
//     [/additionally,/gi, ["Also,", "Plus,", "Then again,", "Worth noting:", "Oh, and"]],
//     [/therefore,/gi, ["So,", "Because of that,", "As a result,", "That's why,", "Which means"]],
//     [/overall,/gi, ["All in all,", "In general,", "Bottom line,", "Basically,", "Looking at it,"]],
//     [/in other words,/gi, ["Put simply,", "Basically,", "Or to put it another way,", "Meaning,"]],
//     [/consequently,/gi, ["So,", "As a result,", "That means,", "Which is why,"]],
//     [/nevertheless,/gi, ["Still,", "Even so,", "But,", "All the same,", "That being said,"]],
//     [/thus,/gi, ["So,", "Therefore,", "As a result,", "Which is why"]],
//     [/hence,/gi, ["So,", "That's why,", "For that reason,", "Because of this"]],
//     [/for example,/gi, ["for example,", "like,", "such as,", "say,", "take"]],
//     [/for instance,/gi, ["for instance,", "like,", "say,", "think"]],
//     [/on the other hand,/gi, ["but then,", "on the flip side,", "conversely,", "flip side:", "though,"]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, options] of map) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.75) return match; // More aggressive
//       const choice = options[Math.floor(Math.random() * options.length)];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 4: Contractions (Keep from original)
//  * ──────────────────────────────────────────────────────────── */

// function addContractions(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const replacements: Array<[RegExp, string | ((match: string, ...args: any[]) => string)]> = [
//     [/(\b(it|he|she|they|we|you|I|that|who|what|where|when|why|how) )is\b/gi, (_m: string, p1: string) => p1 + "'s"],
//     [/(\b(he|she|it|they|we|you|I|that|who|what|where|when|why|how) )are\b/gi, (_m: string, p1: string) => p1 + "'re"],
//     [/ do not /gi, " don't "],
//     [/ does not /gi, " doesn't "],
//     [/ did not /gi, " didn't "],
//     [/ can not /gi, " can't "],
//     [/ will not /gi, " won't "],
//     [/ would not /gi, " wouldn't "],
//     [/ should not /gi, " shouldn't "],
//     [/ could not /gi, " couldn't "],
//     [/ has not /gi, " hasn't "],
//     [/ have not /gi, " haven't "],
//     [/ had not /gi, " hadn't "],
//     [/ is not /gi, " isn't "],
//     [/ was not /gi, " wasn't "],
//     [/ were not /gi, " weren't "],
//   ];

//   for (const [pattern, repl] of replacements) {
//     out = out.replace(pattern, (match, ...args) => {
//       if (Math.random() > strength * 0.8) return match;
//       count++;
//       return typeof repl === "function" ? repl(match, ...args) : repl;
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 5: PERPLEXITY Injection (NEW - Key for AI Detection)
//  * Varies sentence complexity drastically
//  * ──────────────────────────────────────────────────────────── */

// function injectPerplexity(text: string, strength: number): { text: string; count: number } {
//   let sentences = text.split(/([.!?])\s+/).filter(s => s.trim());
//   let count = 0;

//   for (let i = 0; i < sentences.length; i += 2) {
//     const sentence = sentences[i];
//     const punct = sentences[i + 1] || ".";

//     if (!sentence || sentence.length < 30) continue;

//     // Strategy 1: Add parenthetical thoughts (like this one)
//     if (Math.random() < strength * 0.2) {
//       const words = sentence.split(" ");
//       const midPoint = Math.floor(words.length / 2);
//       const parens = ["(at least in my view)", "(though that's debatable)", "(or so it seems)", "(from what I've seen)"];
//       const paren = parens[Math.floor(Math.random() * parens.length)];
//       words.splice(midPoint, 0, paren);
//       sentences[i] = words.join(" ");
//       count++;
//     }

//     // Strategy 2: Add dashes for emphasis—like this
//     if (Math.random() < strength * 0.25) {
//       const words = sentence.split(" ");
//       const dashPoint = Math.floor(words.length * 0.6);
//       words[dashPoint] = "—" + words[dashPoint];
//       sentences[i] = words.join(" ");
//       count++;
//     }

//     // Strategy 3: Break into fragment + continuation
//     if (Math.random() < strength * 0.15 && sentence.length > 80) {
//       const breakPoint = sentence.indexOf(",");
//       if (breakPoint > 20 && breakPoint < sentence.length - 20) {
//         sentences[i] = sentence.slice(0, breakPoint) + ".";
//         sentences.splice(i + 2, 0, sentence.slice(breakPoint + 1).trim().charAt(0).toUpperCase() + sentence.slice(breakPoint + 2), punct);
//         count++;
//       }
//     }
//   }

//   return { text: sentences.join(" "), count };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 6: BURSTINESS (Enhanced - Critical for AI Detection)
//  * Creates sharp contrasts: short + long sentences
//  * ──────────────────────────────────────────────────────────── */

// function injectBurstiness(text: string, strength: number, preserveSemantics: boolean): { text: string; count: number } {
//   const raw = text.trim();
//   if (!raw) return { text, count: 0 };

//   const sentences = raw.split(/([.!?])\s*/).reduce<string[]>((acc, cur, idx, arr) => {
//     if (idx % 2 === 0) {
//       const punct = arr[idx + 1] || "";
//       const s = (cur + punct).trim();
//       if (s) acc.push(s);
//     }
//     return acc;
//   }, []);

//   if (sentences.length <= 1) return { text, count: 0 };

//   let changed = 0;
//   const out: string[] = [];
//   let i = 0;

//   while (i < sentences.length) {
//     const s = sentences[i];

//     // Create BURST: Chop long sentence into 2-3 short ones
//     if (!preserveSemantics && s.length > 120 && Math.random() < strength * 0.5) {
//       const parts = s.split(/,\s+/);
//       if (parts.length >= 3) {
//         out.push(parts[0] + ".");
//         out.push(parts[1].charAt(0).toUpperCase() + parts[1].slice(1) + ".");
//         out.push(parts.slice(2).join(", "));
//         changed++;
//         i++;
//         continue;
//       }
//     }

//     // Create CONTRAST: Merge 2-3 short sentences into one long flowing one
//     if (!preserveSemantics && s.length < 50 && i < sentences.length - 2 && Math.random() < strength * 0.4) {
//       const next1 = sentences[i + 1];
//       const next2 = sentences[i + 2];
//       if (next1 && next1.length < 60 && next2 && next2.length < 60) {
//         const merged = `${s.replace(/[.!?]+$/, "")}, ${next1.charAt(0).toLowerCase()}${next1.slice(1).replace(/[.!?]+$/, "")}, and ${next2.charAt(0).toLowerCase()}${next2.slice(1)}`;
//         out.push(merged);
//         changed++;
//         i += 3;
//         continue;
//       }
//     }

//     // Add sudden emphasis! Short declaration.
//     if (s.length > 60 && Math.random() < strength * 0.2) {
//       const emphases = ["Simple as that.", "Pretty straightforward.", "Makes sense.", "Fair enough.", "No question."];
//       out.push(s);
//       out.push(emphases[Math.floor(Math.random() * emphases.length)]);
//       changed++;
//       i++;
//       continue;
//     }

//     out.push(s);
//     i++;
//   }

//   return { text: out.join(" "), count: changed };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 7: Lexical Variation (Enhanced)
//  * ──────────────────────────────────────────────────────────── */

// function varyWordChoiceAggressively(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const patterns: Array<[RegExp, string[]]> = [
//     [/utilize/gi, ["use", "work with", "lean on", "go with"]],
//     [/facilitate/gi, ["help", "make easier", "enable", "smooth out"]],
//     [/leverage/gi, ["use", "tap into", "make use of", "work with"]],
//     [/implement/gi, ["use", "apply", "put in place", "roll out"]],
//     [/optimize/gi, ["improve", "tune up", "tighten", "refine"]],
//     [/significant/gi, ["important", "big", "major", "noticeable"]],
//     [/significantly/gi, ["a lot", "noticeably", "clearly", "quite a bit"]],
//     [/numerous/gi, ["many", "plenty of", "loads of", "tons of"]],
//     [/various/gi, ["different", "a mix of", "all sorts of", "diverse"]],
//     [/crucial/gi, ["key", "vital", "super important", "essential"]],
//     [/ensure/gi, ["make sure", "guarantee", "see to it", "confirm"]],
//     [/robust/gi, ["solid", "reliable", "strong", "well-built"]],
//     [/seamless/gi, ["smooth", "easy", "hassle-free", "effortless"]],
//     [/comprehensive/gi, ["detailed", "thorough", "complete", "in-depth"]],
//     [/delve/gi, ["dive into", "dig into", "explore", "look into"]],
//     [/realm/gi, ["world", "space", "area", "domain"]],
//     [/plethora/gi, ["lots of", "plenty of", "loads of", "tons of"]],
//     [/paramount/gi, ["essential", "critical", "top priority", "vital"]],
//     [/myriad/gi, ["many", "countless", "numerous", "plenty"]],
//     [/enhance/gi, ["improve", "boost", "upgrade", "beef up"]],
//     [/demonstrate/gi, ["show", "prove", "illustrate", "make clear"]],
//     [/acquire/gi, ["get", "obtain", "pick up", "grab"]],
//     [/innovative/gi, ["new", "fresh", "creative", "novel"]],
//     [/fundamental/gi, ["basic", "core", "essential", "key"]],
//   ];

//   for (const [pattern, choices] of patterns) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.7) return match;
//       const choice = choices[Math.floor(Math.random() * choices.length)];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 8: Micro-Redundancy (NEW - Humans naturally repeat)
//  * ──────────────────────────────────────────────────────────── */

// function addMicroRedundancy(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const redundancies: Array<[RegExp, string]> = [
//     [/\b(important|crucial|vital)\b/gi, "$1—really $1"],
//     [/\b(simple|easy|straightforward)\b/gi, "$1, honestly quite $1"],
//     [/\b(useful|helpful|beneficial)\b/gi, "$1, genuinely $1"],
//   ];

//   for (const [pattern, repl] of redundancies) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.15) return match;
//       count++;
//       return repl.replace("$1", match);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 9: Thought Trails (NEW - Natural flow interruptions)
//  * ──────────────────────────────────────────────────────────── */

// function addThoughtTrails(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const trails = [
//     "—at least that's how it seems",
//     "—or so I'd argue",
//     ", though your mileage may vary",
//     " (but that's another story)",
//     ", not that it's a dealbreaker",
//   ];

//   const sentences = out.split(/\.\s+/);
//   for (let i = 0; i < sentences.length; i++) {
//     if (sentences[i].length > 50 && Math.random() < strength * 0.15) {
//       const trail = trails[Math.floor(Math.random() * trails.length)];
//       sentences[i] += trail;
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 10: Casual Observations (NEW - Personal touch)
//  * ──────────────────────────────────────────────────────────── */

// function addCasualObservations(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const observations = [
//     { pattern: /\. This is/gi, replacement: ". Seems like this is" },
//     { pattern: /\. (The|A|An) (\w+) is/gi, replacement: ". Looks like the $2 is" },
//     { pattern: /\. (They|It) (can|could|will|would)/gi, replacement: ". Feels like $1 $2" },
//   ];

//   for (const { pattern, replacement } of observations) {
//     out = out.replace(pattern, (match, ...groups) => {
//       if (Math.random() > strength * 0.25) return match;
//       count++;
//       let result = replacement;
//       groups.forEach((g, i) => {
//         result = result.replace(`$${i + 1}`, g);
//       });
//       return result;
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * LAYER 11: Generic Quirks (Enhanced)
//  * ──────────────────────────────────────────────────────────── */

// function injectHumanQuirksEnhanced(text: string, strength: number, lang?: string): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   if (!lang || /^en|es|fr|de|pt|it|nl|ro|pl|tr$/i.test(lang)) {
//     // Soften absolutes more aggressively
//     out = out.replace(/\b(definitely|certainly|clearly|absolutely|always|never)\b/gi, (m) => {
//       if (Math.random() < strength * 0.45) {
//         count++;
//         const choices = ["pretty much", "in most cases", "generally", "often", "usually", "tends to be", m.toLowerCase()];
//         return choices[Math.floor(Math.random() * choices.length)];
//       }
//       return m;
//     });

//     // Add conversational starters
//     const sentences = out.split(/\.\s+/);
//     for (let i = 0; i < sentences.length; i++) {
//       if (Math.random() < strength * 0.1) {
//         const starters = ["Look, ", "Listen, ", "Thing is, ", "Real talk: ", "To be honest, "];
//         sentences[i] = starters[Math.floor(Math.random() * starters.length)] + sentences[i];
//         count++;
//       }
//     }
//     out = sentences.join(". ");
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Softeners (Keep from original)
//  * ──────────────────────────────────────────────────────────── */

// function softenDefinitiveLanguage(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   out = out.replace(/(\b(always|never)\b)/gi, (m) => {
//     if (Math.random() < strength * 0.35) {
//       count++;
//       return Math.random() < 0.5 ? "often" : "usually";
//     }
//     return m;
//   });

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Helpers
//  * ──────────────────────────────────────────────────────────── */

// function normalizeWhitespaceSoft(text: string): string {
//   return text.replace(/([^\S\n]{3,}|\t{2,})/g, "  ");
// }

// function fixSpacing(text: string): string {
//   let out = text;
//   out = out.replace(/([.,!?;:])(?=[^\s\n<])/g, "$1 ");
//   out = out.replace(/(\S)[ \t]{3,}(\S)/g, "$1 $2");
//   out = out.replace(/"([ \t]{2,})/g, '" ');
//   out = out.replace(/([ \t]{2,})"/g, ' "');
//   return out;
// }

// function estimatePatternScore(original: string, changed: string): number {
//   if (!original || !changed) return 1;
//   if (original === changed) return 1;

//   const o = original.replace(/\s+/g, " ").trim();
//   const c = changed.replace(/\s+/g, " ").trim();
//   if (!o || !c) return 1;

//   const minLen = Math.min(o.length, c.length);
//   if (minLen === 0) return 1;

//   let same = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (o.charAt(i) === c.charAt(i)) same++;
//   }

//   const similarity = same / minLen;
//   const lengthDiff = Math.abs(o.split(" ").length - c.split(" ").length) / Math.max(o.split(" ").length, 1);
//   const uniformityPenalty = lengthDiff * 0.15;

//   return clamp(similarity - uniformityPenalty, 0, 1);
// }

// function enforceMaxChangeRatio(original: string, changed: string, maxRatio: number): string {
//   if (maxRatio <= 0) return changed;
//   const oLen = original.length;
//   const cLen = changed.length;
//   const minLen = Math.min(oLen, cLen);
//   if (minLen === 0 || oLen === 0) return changed;

//   let diff = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (original[i] !== changed[i]) diff++;
//   }
//   diff += Math.abs(oLen - cLen);

//   const ratio = diff / oLen;
//   if (ratio <= maxRatio) return changed;

//   const keepRatio = 0.4;
//   const keepLen = Math.floor(oLen * keepRatio);
//   const tailLen = Math.max(0, cLen - (oLen - keepLen));
//   const tail = changed.slice(-tailLen);

//   return [original.slice(0, keepLen), tail].filter(Boolean).join(" ").trim();
// }

// /* ────────────────────────────────────────────────────────────
//  * AI Score Estimator (NEW)
//  * ──────────────────────────────────────────────────────────── */

// function estimateAiScore(original: string, humanized: string): number {
//   // Simple heuristic: more changes = lower AI score
//   const similarity = estimatePatternScore(original, humanized);
  
//   // Count markers of human writing
//   let humanMarkers = 0;
  
//   // Contractions
//   humanMarkers += (humanized.match(/\b(don't|won't|can't|it's|that's)\b/gi) || []).length;
  
//   // Casual phrases
//   const casualPhrases = /(honestly|basically|pretty much|sort of|kind of|to be fair|actually)/gi;
//   humanMarkers += (humanized.match(casualPhrases) || []).length;
  
//   // Dashes and parentheticals
//   humanMarkers += (humanized.match(/—|[[(]/g) || []).length;
  
//   // Sentence length variation (burstiness indicator)
//   const sentences = humanized.split(/[.!?]\s+/);
//   const lengths = sentences.map(s => s.length);
//   const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
//   const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / lengths.length;
//   const burstiness = Math.sqrt(variance) / avgLen;
  
//   // Higher burstiness and more human markers = lower AI score
//   const baseScore = similarity * 100;
//   const humanReduction = Math.min(humanMarkers * 2, 40);
//   const burstReduction = Math.min(burstiness * 20, 30);
  
//   return Math.max(0, Math.min(100, baseScore - humanReduction - burstReduction));
// }

// function clamp(n: number, min: number, max: number): number {
//   return Math.max(min, Math.min(max, n));
// }

// /* ────────────────────────────────────────────────────────────
//  * Language Detection (Keep from original)
//  * ──────────────────────────────────────────────────────────── */

// function isMostlyLatinScript(text: string): boolean {
//   const sample = text.slice(0, 800);
//   let latin = 0;
//   let nonLatin = 0;

//   for (let i = 0; i < sample.length; i++) {
//     const code = sample.charCodeAt(i);
//     if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
//       latin++;
//     } else if (code > 127 && code !== 160) {
//       nonLatin++;
//     }
//   }

//   if (latin === 0 && nonLatin === 0) return true;
//   return latin >= nonLatin;
// }

// function detectLanguageFromContent(text: string): string | undefined {
//   const sample = text.slice(0, 800);

//   if (/[اأإءؤئ]/.test(sample)) return "ar";
//   if (/[\u0900-\u097F]/.test(sample)) return "hi";
//   if (/[\u4e00-\u9fff]/.test(sample)) return "zh";
//   if (/[\u0400-\u04FF]/.test(sample)) return "ru";
//   if (/[\u3040-\u30ff]/.test(sample)) return "ja";
//   if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
//   if (isMostlyLatinScript(sample)) return "en";

//   return undefined;
// }

// function preserveCase(from: string, to: string): string {
//   if (!from) return to;
//   if (from[0] === from[0].toUpperCase()) {
//     return to.charAt(0).toUpperCase() + to.slice(1);
//   }
//   return to;
// }





// // src/hooks/use-humanize-content.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";

// /**
//  * Humanizer v5.0 - ULTIMATE ANTI-AI DETECTION
//  * 
//  * Target: <5% AI score on ALL detectors (GPTZero, Stealth Writer, ZeroGPT, Quillbot)
//  * 
//  * NEW GPTZero/Stealth Writer Defeating Strategies:
//  * 1. NATURAL ERRORS: Typos, grammar mistakes (then subtle fix)
//  * 2. VOCABULARY INCONSISTENCY: Mix sophisticated + casual words unnaturally
//  * 3. PUNCTUATION CHAOS: Inconsistent comma use, occasional missing periods
//  * 4. THOUGHT FRAGMENTS: Incomplete ideas, self-corrections
//  * 5. CONVERSATIONAL MEANDERING: Topic drift, tangential thoughts
//  * 6. PERSONAL INTERJECTIONS: First-person observations
//  * 7. INFORMAL TRANSITIONS: "Anyway," "So yeah," "Right,"
//  * 8. SENTENCE RHYTHM BREAKS: Awkward pauses, unnatural flow
//  */

// export interface HumanizedContentItem {
//   id: string;
//   sourceId?: string;
//   originalHtml: string;
//   humanizedHtml: string;
//   createdAt: string;
//   meta?: {
//     patternScore?: number;
//     transformations?: number;
//     aiScore?: number;
//   };
// }

// export interface HumanizeOptions {
//   strength: number;
//   allowImperfect: boolean;
//   maxChangeRatio: number;
//   preserveSemantics: boolean;
//   languageHint?: string;
//   aggressiveMode?: boolean; // NEW: For maximum anti-detection
// }

// const DEFAULT_OPTIONS: HumanizeOptions = {
//   strength: 0.98, // Increased for GPTZero
//   allowImperfect: true,
//   maxChangeRatio: 0.9, // Increased for more changes
//   preserveSemantics: false, // Changed to allow more natural chaos
//   languageHint: undefined,
//   aggressiveMode: true, // NEW: Enable all anti-detection features
// };

// interface HumanizeContext {
//   inProtectedTag: boolean;
//   inHeadingLike: boolean;
// }

// const NO_TOUCH_TAGS = new Set([
//   "script", "style", "noscript", "iframe", "canvas", "svg", "pre", "code",
// ]);

// const PROTECTED_INLINE_TAGS = new Set([
//   "b", "strong", "em", "i", "u", "mark", "kbd", "samp", "var",
//   "abbr", "acronym", "sub", "sup", "a",
// ]);

// const HEADING_OR_LIST_TAGS = new Set([
//   "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol",
//   "dt", "dd", "th", "td", "caption",
// ]);

// /* ────────────────────────────────────────────────────────────
//  * Hook
//  * ──────────────────────────────────────────────────────────── */

// export default function useHumanizeContent() {
//   const [isHumanizing, setIsHumanizing] = useState(false);
//   const [items, setItems] = useLocalStorage<HumanizedContentItem[]>(
//     "humanized-items_v5",
//     []
//   );

//   const humanizeHtml = async (
//     html: string,
//     opts?: Partial<HumanizeOptions>,
//     sourceId?: string
//   ): Promise<string> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     try {
//       if (!html || typeof html !== "string") return html;

//       const result = runHumanizer(html, options);

//       const record: HumanizedContentItem = {
//         id: `${sourceId || "single"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//         sourceId,
//         originalHtml: html,
//         humanizedHtml: result.html,
//         createdAt: new Date().toISOString(),
//         meta: {
//           patternScore: result.patternScore,
//           transformations: result.transformations,
//           aiScore: result.estimatedAiScore,
//         },
//       };

//       startTransition(() => {
//         setItems((prev = []) => [record, ...(prev || [])].slice(0, 500));
//       });

//       return result.html;
//     } catch (err) {
//       console.error("[HUMANIZE] failed:", err);
//       toast.error("Humanizer error: could not transform content.");
//       return html;
//     }
//   };

//   const humanizeMany = async (
//     batch: { id: string; html: string }[],
//     opts?: Partial<HumanizeOptions>
//   ): Promise<HumanizedContentItem[]> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };
//     if (!batch?.length) return [];

//     setIsHumanizing(true);
//     const out: HumanizedContentItem[] = [];

//     try {
//       for (const entry of batch) {
//         if (!entry?.html) continue;

//         const result = runHumanizer(entry.html, options);

//         const record: HumanizedContentItem = {
//           id: `${entry.id || "batch"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//           sourceId: entry.id,
//           originalHtml: entry.html,
//           humanizedHtml: result.html,
//           createdAt: new Date().toISOString(),
//           meta: {
//             patternScore: result.patternScore,
//             transformations: result.transformations,
//             aiScore: result.estimatedAiScore,
//           },
//         };

//         out.push(record);
//       }

//       if (out.length) {
//         startTransition(() => {
//           setItems((prev = []) => [...out, ...(prev || [])].slice(0, 500));
//         });
//         toast.success(`Humanized ${out.length} item(s) - AI detection bypassed.`);
//       }

//       return out;
//     } catch (err) {
//       console.error("[HUMANIZE] batch failed:", err);
//       toast.error("Failed to humanize batch.");
//       return out;
//     } finally {
//       setIsHumanizing(false);
//     }
//   };

//   const clearHumanized = () => {
//     startTransition(() => setItems([]));
//     toast.success("Cleared humanized content history.");
//   };

//   return {
//     isHumanizing,
//     items,
//     humanizeHtml,
//     humanizeMany,
//     clearHumanized,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Core Humanizer
//  * ──────────────────────────────────────────────────────────── */

// interface HumanizerResult {
//   html: string;
//   patternScore: number;
//   transformations: number;
//   estimatedAiScore: number;
// }

// interface TextProcessResult {
//   text: string;
//   transformations: number;
//   patternScore: number;
// }

// function runHumanizer(html: string, options: HumanizeOptions): HumanizerResult {
//   if (!html) {
//     return { html, patternScore: 1, transformations: 0, estimatedAiScore: 0 };
//   }

//   const lang = options.languageHint || detectLanguageFromContent(html);
//   const isLatin = isMostlyLatinScript(html);

//   if (typeof window === "undefined" || typeof DOMParser === "undefined") {
//     const res = processText(html, options, lang, isLatin, {
//       inProtectedTag: false,
//       inHeadingLike: false,
//     });
//     return {
//       html: res.text,
//       patternScore: res.patternScore,
//       transformations: res.transformations,
//       estimatedAiScore: estimateAiScore(html, res.text),
//     };
//   }

//   const parser = new DOMParser();
//   const doc = parser.parseFromString(
//     `<!doctype html><html><body>${html}</body></html>`,
//     "text/html"
//   );
//   const root = doc.body;

//   let totalTransformations = 0;
//   let totalPatternScore = 0;
//   let textNodeCount = 0;

//   const initialCtx: HumanizeContext = {
//     inProtectedTag: false,
//     inHeadingLike: false,
//   };

//   function humanizeNode(node: Node, ctx: HumanizeContext): void {
//     if (node.nodeType === Node.TEXT_NODE) {
//       const original = (node as Text).data;
//       if (!original || !original.trim()) return;

//       const res = processText(original, options, lang, isLatin, ctx);
//       (node as Text).data = res.text;

//       totalTransformations += res.transformations;
//       totalPatternScore += res.patternScore;
//       textNodeCount++;
//       return;
//     }

//     if (node.nodeType === Node.ELEMENT_NODE) {
//       const el = node as Element;
//       const tag = el.tagName.toLowerCase();

//       if (NO_TOUCH_TAGS.has(tag)) return;

//       const isProtectedInline =
//         PROTECTED_INLINE_TAGS.has(tag) ||
//         (tag === "span" && (el.className || "").toLowerCase().includes("keyword"));

//       const isHeadingLike = HEADING_OR_LIST_TAGS.has(tag) || (tag === "p" && ctx.inHeadingLike);

//       const nextCtx: HumanizeContext = {
//         inProtectedTag: ctx.inProtectedTag || isProtectedInline,
//         inHeadingLike: ctx.inHeadingLike || isHeadingLike,
//       };

//       for (let i = 0; i < el.childNodes.length; i++) {
//         humanizeNode(el.childNodes[i], nextCtx);
//       }
//     }
//   }

//   for (let i = 0; i < root.childNodes.length; i++) {
//     humanizeNode(root.childNodes[i], initialCtx);
//   }

//   const avgPatternScore = textNodeCount > 0 ? clamp(totalPatternScore / textNodeCount, 0, 1) : 1;
//   const finalHtml = root.innerHTML;

//   return {
//     html: finalHtml,
//     patternScore: avgPatternScore,
//     transformations: totalTransformations,
//     estimatedAiScore: estimateAiScore(html, finalHtml),
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Text Processing - ULTIMATE ANTI-DETECTION
//  * ──────────────────────────────────────────────────────────── */

// function processText(
//   text: string,
//   options: HumanizeOptions,
//   lang: string | undefined,
//   isLatin: boolean,
//   ctx: HumanizeContext
// ): TextProcessResult {
//   const original = text;

//   const leading = original.match(/^[ \t]+/)?.[0] ?? "";
//   const trailing = original.match(/[ \t]+$/)?.[0] ?? "";
//   let core = original.slice(leading.length, original.length - trailing.length);

//   if (!core.trim()) {
//     return { text: original, transformations: 0, patternScore: 1 };
//   }

//   let transformations = 0;

//   if (ctx.inProtectedTag) {
//     const safe = core.replace(/[ \t]{3,}/g, "  ");
//     if (safe !== core) transformations++;
//     return { text: leading + safe + trailing, transformations, patternScore: 1 };
//   }

//   const local: HumanizeOptions = { ...options };

//   if (ctx.inHeadingLike) {
//     local.strength = clamp(local.strength * 0.5, 0.3, 0.9);
//     local.allowImperfect = false;
//     local.preserveSemantics = true;
//     local.aggressiveMode = false;
//   }

//   let currentText = normalizeWhitespaceSoft(core);

//   // EXISTING LAYERS (optimized)
//   if (!ctx.inHeadingLike) {
//     const boilerplateRes = killBoilerplateAggressively(currentText);
//     currentText = boilerplateRes.text;
//     transformations += boilerplateRes.count;
//   }

//   if (isLatin) {
//     if (!ctx.inHeadingLike) {
//       const fillerRes = injectNaturalFillers(currentText, local.strength);
//       currentText = fillerRes.text;
//       transformations += fillerRes.count;
//     }

//     if (!ctx.inHeadingLike) {
//       const phraseRes = paraphrasePhrasesAggressively(currentText, local.strength);
//       currentText = phraseRes.text;
//       transformations += phraseRes.count;
//     }

//     if (!ctx.inHeadingLike) {
//       const contractRes = addContractions(currentText, local.strength);
//       currentText = contractRes.text;
//       transformations += contractRes.count;
//     }

//     if (!ctx.inHeadingLike) {
//       const perplexityRes = injectPerplexity(currentText, local.strength);
//       currentText = perplexityRes.text;
//       transformations += perplexityRes.count;
//     }

//     if (!ctx.inHeadingLike) {
//       const burstRes = injectBurstiness(currentText, local.strength, local.preserveSemantics);
//       currentText = burstRes.text;
//       transformations += burstRes.count;
//     }

//     if (!ctx.inHeadingLike) {
//       const varyRes = varyWordChoiceAggressively(currentText, local.strength);
//       currentText = varyRes.text;
//       transformations += varyRes.count;
//     }

//     if (!ctx.inHeadingLike && local.allowImperfect) {
//       const redundRes = addMicroRedundancy(currentText, local.strength);
//       currentText = redundRes.text;
//       transformations += redundRes.count;
//     }

//     if (!ctx.inHeadingLike && local.allowImperfect) {
//       const trailRes = addThoughtTrails(currentText, local.strength);
//       currentText = trailRes.text;
//       transformations += trailRes.count;
//     }

//     if (!ctx.inHeadingLike && local.allowImperfect) {
//       const observRes = addCasualObservations(currentText, local.strength);
//       currentText = observRes.text;
//       transformations += observRes.count;
//     }

//     // NEW GPTZERO/STEALTH WRITER DEFEATING LAYERS
//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const informalRes = addInformalTransitions(currentText, local.strength);
//       currentText = informalRes.text;
//       transformations += informalRes.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const fragmentRes = addThoughtFragments(currentText, local.strength);
//       currentText = fragmentRes.text;
//       transformations += fragmentRes.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const selfCorrRes = addSelfCorrections(currentText, local.strength);
//       currentText = selfCorrRes.text;
//       transformations += selfCorrRes.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const meanderRes = addConversationalMeandering(currentText, local.strength);
//       currentText = meanderRes.text;
//       transformations += meanderRes.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const personalRes = addPersonalInterjections(currentText, local.strength);
//       currentText = personalRes.text;
//       transformations += personalRes.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const vocabRes = addVocabularyInconsistency(currentText, local.strength);
//       currentText = vocabRes.text;
//       transformations += vocabRes.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const punctRes = addPunctuationChaos(currentText, local.strength);
//       currentText = punctRes.text;
//       transformations += punctRes.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const rhythmRes = breakSentenceRhythm(currentText, local.strength);
//       currentText = rhythmRes.text;
//       transformations += rhythmRes.count;
//     }

//   } else {
//     const softenRes = softenDefinitiveLanguage(currentText, local.strength);
//     currentText = softenRes.text;
//     transformations += softenRes.count;
//   }

//   if (local.allowImperfect && !ctx.inHeadingLike) {
//     const quirkRes = injectHumanQuirksEnhanced(currentText, local.strength, lang);
//     currentText = quirkRes.text;
//     transformations += quirkRes.count;
//   }

//   currentText = fixSpacing(currentText);

//   if (local.maxChangeRatio > 0 && !ctx.inHeadingLike) {
//     currentText = enforceMaxChangeRatio(core, currentText, local.maxChangeRatio);
//   }

//   const finalText = leading + currentText + trailing;
//   const patternScore = estimatePatternScore(original, finalText);

//   return { text: finalText, transformations, patternScore };
// }

// /* ────────────────────────────────────────────────────────────
//  * NEW LAYER 12: Informal Transitions (GPTZero Killer)
//  * ──────────────────────────────────────────────────────────── */

// function addInformalTransitions(text: string, strength: number): { text: string; count: number } {
//   let sentences = text.split(/\.\s+/);
//   let count = 0;

//   const transitions = [
//     "Anyway,",
//     "So yeah,",
//     "Right,",
//     "Like,",
//     "I mean,",
//     "You know what,",
//     "Now,",
//     "Alright,",
//     "Look,",
//     "Listen,"
//   ];

//   for (let i = 1; i < sentences.length; i++) {
//     if (Math.random() < strength * 0.2) {
//       const trans = transitions[Math.floor(Math.random() * transitions.length)];
//       sentences[i] = trans + " " + sentences[i];
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// /* ────────────────────────────────────────────────────────────
//  * NEW LAYER 13: Thought Fragments (Critical for Stealth Writer)
//  * ──────────────────────────────────────────────────────────── */

// function addThoughtFragments(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const fragments = [
//     "Which is interesting.",
//     "Not sure why.",
//     "Just my take.",
//     "Could be wrong though.",
//     "Depends on how you see it.",
//     "Makes you think.",
//     "Fair point.",
//     "Debatable, but yeah."
//   ];

//   const sentences = out.split(/\.\s+/);
//   for (let i = 0; i < sentences.length; i++) {
//     if (sentences[i].length > 60 && Math.random() < strength * 0.15) {
//       const frag = fragments[Math.floor(Math.random() * fragments.length)];
//       sentences[i] = sentences[i] + ". " + frag;
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// /* ────────────────────────────────────────────────────────────
//  * NEW LAYER 14: Self-Corrections (Human Mistake Pattern)
//  * ──────────────────────────────────────────────────────────── */

// function addSelfCorrections(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const corrections: Array<[RegExp, string[]]> = [
//     [/\b(is|are|was|were) (\w+)/gi, ["$1 $2—well, $1 actually $2", "$1 $2, or rather $1 $2"]],
//     [/\b(can|could|will|would) (\w+)/gi, ["$1 $2—no wait, $1 $2", "$1 $2, scratch that, $1 $2"]],
//   ];

//   for (const [pattern, templates] of corrections) {
//     out = out.replace(pattern, (match, verb, word) => {
//       if (Math.random() > strength * 0.1) return match;
//       count++;
//       const template = templates[Math.floor(Math.random() * templates.length)];
//       return template.replace(/\$1/g, verb).replace(/\$2/g, word);
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * NEW LAYER 15: Conversational Meandering
//  * ──────────────────────────────────────────────────────────── */

// function addConversationalMeandering(text: string, strength: number): { text: string; count: number } {
//   let sentences = text.split(/\.\s+/);
//   let count = 0;

//   const meanders = [
//     ", but that's beside the point",
//     ", though I'm getting off track here",
//     "—anyway, back to the main thing",
//     ", not that it matters much",
//     ", random tangent but",
//   ];

//   for (let i = 0; i < sentences.length; i++) {
//     if (sentences[i].length > 70 && Math.random() < strength * 0.12) {
//       const meander = meanders[Math.floor(Math.random() * meanders.length)];
//       const mid = Math.floor(sentences[i].length / 2);
//       sentences[i] = sentences[i].slice(0, mid) + meander + sentences[i].slice(mid);
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// /* ────────────────────────────────────────────────────────────
//  * NEW LAYER 16: Personal Interjections
//  * ──────────────────────────────────────────────────────────── */

// function addPersonalInterjections(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const interjections = [
//     "if you ask me",
//     "in my experience",
//     "from what I've seen",
//     "personally speaking",
//     "the way I see it",
//     "at least in my view",
//   ];

//   const sentences = out.split(/\.\s+/);
//   for (let i = 0; i < sentences.length; i++) {
//     if (Math.random() < strength * 0.15) {
//       const interj = interjections[Math.floor(Math.random() * interjections.length)];
//       sentences[i] = sentences[i] + ", " + interj;
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// /* ────────────────────────────────────────────────────────────
//  * NEW LAYER 17: Vocabulary Inconsistency (GPTZero Detection)
//  * Mix formal + casual inappropriately
//  * ──────────────────────────────────────────────────────────── */

// function addVocabularyInconsistency(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const mixPatterns: Array<[RegExp, string[]]> = [
//     [/\bimportant\b/gi, ["important", "key", "big deal", "crucial", "matters a lot"]],
//     [/\bdifficult\b/gi, ["difficult", "hard", "tough", "challenging", "tricky af"]],
//     [/\binteresting\b/gi, ["interesting", "fascinating", "cool", "intriguing", "neat"]],
//     [/\bunderstand\b/gi, ["understand", "get", "comprehend", "grasp", "figure out"]],
//   ];

//   for (const [pattern, options] of mixPatterns) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.25) return match;
//       count++;
//       return options[Math.floor(Math.random() * options.length)];
//     });
//   }

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * NEW LAYER 18: Punctuation Chaos (Stealth Writer Killer)
//  * ──────────────────────────────────────────────────────────── */

// function addPunctuationChaos(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   // Random comma additions (sometimes wrong)
//   out = out.replace(/(\w+)\s+(\w+)/g, (match, w1, w2) => {
//     if (Math.random() < strength * 0.08) {
//       count++;
//       return w1 + ", " + w2;
//     }
//     return match;
//   });

//   // Occasional ellipsis instead of period
//   out = out.replace(/\.\s+([A-Z])/g, (match, letter) => {
//     if (Math.random() < strength * 0.1) {
//       count++;
//       return "... " + letter;
//     }
//     return match;
//   });

//   // Double spaces (human error)
//   out = out.replace(/\s+/g, (match) => {
//     if (match.length === 1 && Math.random() < strength * 0.05) {
//       count++;
//       return "  ";
//     }
//     return match;
//   });

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * NEW LAYER 19: Break Sentence Rhythm
//  * ──────────────────────────────────────────────────────────── */

// function breakSentenceRhythm(text: string, strength: number): { text: string; count: number } {
//   let sentences = text.split(/\.\s+/);
//   let count = 0;

//   for (let i = 0; i < sentences.length - 1; i++) {
//     // Add awkward pauses
//     if (Math.random() < strength * 0.12) {
//       sentences[i] = sentences[i] + "...";
//       count++;
//     }

//     // Merge inappropriately
//     if (sentences[i].length < 40 && sentences[i + 1] && Math.random() < strength * 0.1) {
//       sentences[i] = sentences[i] + " " + sentences[i + 1].toLowerCase();
//       sentences.splice(i + 1, 1);
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// /* ────────────────────────────────────────────────────────────
//  * EXISTING LAYERS (Kept from original with minor tweaks)
//  * ──────────────────────────────────────────────────────────── */

// function killBoilerplateAggressively(text: string): { text: string; count: number } {
//   const replacements: Array<[RegExp, string | string[]]> = [
//     [/in conclusion[, ]*/gi, ["To wrap up, ", "Overall, ", "Bottom line, ", "So, "]],
//     [/to conclude[, ]*/gi, ["In short, ", "Basically, ", "All said, "]],
//     [/in summary[, ]*/gi, ["Simply put, ", "Long story short, ", "The gist is, "]],
//     [/this article will explore/gi, ["we'll look at", "let's check out", "here's what we'll cover"]],
//     [/throughout this article[, ]*/gi, ""],
//     [/it is important to note that/gi, ["worth knowing that", "keep in mind", "just so you know"]],
//     [/it is worth noting that/gi, ["worth mentioning", "to be fair", "actually"]],
//     [/in today's (digital )?age/gi, ["these days", "nowadays", "right now"]],
//     [/with that being said[, ]*/gi, ["still, ", "but, ", "though, "]],
//     [/it should be noted that/gi, ["just know that", "heads up—", "thing is, "]],
//     [/it is essential to/gi, ["you need to", "you've gotta", "make sure to"]],
//     [/it is crucial to/gi, ["it's key to", "really helps to", "you should"]],
//     [/one must/gi, ["you should", "it helps to", "best to"]],
//     [/it can be seen that/gi, ["you'll notice", "seems like", "looks like"]],
//     [/it is evident that/gi, ["clearly, ", "obviously, ", "you can see "]],
//     [/as a matter of fact/gi, ["actually, ", "honestly, ", "truth is, "]],
//     [/needless to say/gi, ["obviously, ", "of course, ", "naturally, "]],
//     [/it goes without saying/gi, ["obviously, ", "naturally, ", "sure, "]],
//     [/in order to/gi, "to"],
//     [/in the event that/gi, "if"],
//     [/due to the fact that/gi, ["because", "since", "seeing as"]],
//     [/for the purpose of/gi, "to"],
//     [/with regard to/gi, ["about", "regarding", "on"]],
//     [/in this guide[, ]*/gi, ""],
//     [/in this article[, ]*/gi, ""],
//     [/delve into/gi, ["dive into", "get into", "explore", "check out"]],
//     [/shed light on/gi, ["highlight", "show", "reveal", "explain"]],
//     [/unleash the power of/gi, ["tap into", "use", "make the most of"]],
//     [/embark on a journey/gi, ["start exploring", "begin with", "kick things off"]],
//     [/in the realm of/gi, ["in the world of", "when it comes to", "in"]],
//     [/a plethora of/gi, ["lots of", "tons of", "plenty of", "loads of"]],
//     [/the fact of the matter is/gi, ["the thing is", "truth is", "basically"]],
//     [/it is no secret that/gi, ["everyone knows", "it's clear that", "obviously"]],
//     [/at the end of the day/gi, ["ultimately", "basically", "in the end"]],
//     [/when all is said and done/gi, ["ultimately", "in the end", "bottom line"]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, repl] of replacements) {
//     out = out.replace(pattern, () => {
//       count++;
//       if (Array.isArray(repl)) {
//         return repl[Math.floor(Math.random() * repl.length)];
//       }
//       return repl;
//     });
//   }

//   return { text: out, count };
// }

// function injectNaturalFillers(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const fillers = [
//     { pattern: /\b(very|really|quite)\s+(\w+)\b/gi, replacements: ["pretty $2", "fairly $2", "kind of $2", "sort of $2"] },
//     { pattern: /\b(important|significant|crucial)\b/gi, replacements: ["pretty important", "quite significant", "really crucial"] },
//     { pattern: /\. ([A-Z])/g, replacements: [". Honestly, $1", ". Basically, $1", ". To be fair, $1", ". Actually, $1"] },
//   ];

//   for (const { pattern, replacements } of fillers) {
//     out = out.replace(pattern, (match, ...groups) => {
//       if (Math.random() > strength * 0.4) return match;
//       count++;
//       let choice = replacements[Math.floor(Math.random() * replacements.length)];
//       groups.forEach((group, i) => {
//         choice = choice.replace(`${i + 1}`, group);
//       });
//       return choice;
//     });
//   }

//   const hedges: Array<[RegExp, string[]]> = [
//     [/\b(is|are|was|were)\s+(\w+)/gi, ["might be $2", "could be $2", "seems $2", "appears $2", "looks $2"]],
//     [/\b(will|would)\s+(\w+)/gi, ["might $2", "could $2", "probably will $2", "likely to $2"]],
//   ];

//   for (const [pattern, options] of hedges) {
//     out = out.replace(pattern, (match, _verb, word) => {
//       if (Math.random() > strength * 0.3) return match;
//       count++;
//       const choice = options[Math.floor(Math.random() * options.length)];
//       return choice.replace("$2", word);
//     });
//   }

//   return { text: out, count };
// }

// function paraphrasePhrasesAggressively(text: string, strength: number): { text: string; count: number } {
//   const map: Array<[RegExp, string[]]> = [
//     [/however,/gi, ["But,", "Still,", "That said,", "Though,", "Yet,", "Mind you,"]],
//     [/moreover,/gi, ["Plus,", "On top of that,", "Also,", "What's more,", "And hey,"]],
//     [/furthermore,/gi, ["Also,", "Besides,", "Plus,", "Another thing—", "Add to that,"]],
//     [/additionally,/gi, ["Also,", "Plus,", "Then again,", "Worth noting:", "Oh, and"]],
//     [/therefore,/gi, ["So,", "Because of that,", "As a result,", "That's why,", "Which means"]],
//     [/overall,/gi, ["All in all,", "In general,", "Bottom line,", "Basically,", "Looking at it,"]],
//     [/in other words,/gi, ["Put simply,", "Basically,", "Or to put it another way,", "Meaning,"]],
//     [/consequently,/gi, ["So,", "As a result,", "That means,", "Which is why,"]],
//     [/nevertheless,/gi, ["Still,", "Even so,", "But,", "All the same,", "That being said,"]],
//     [/thus,/gi, ["So,", "Therefore,", "As a result,", "Which is why"]],
//     [/hence,/gi, ["So,", "That's why,", "For that reason,", "Because of this"]],
//     [/for example,/gi, ["for example,", "like,", "such as,", "say,", "take"]],
//     [/for instance,/gi, ["for instance,", "like,", "say,", "think"]],
//     [/on the other hand,/gi, ["but then,", "on the flip side,", "conversely,", "flip side:", "though,"]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, options] of map) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.75) return match;
//       const choice = options[Math.floor(Math.random() * options.length)];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// function addContractions(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const replacements: Array<[RegExp, string | ((match: string, ...args: any[]) => string)]> = [
//     [/(\b(it|he|she|they|we|you|I|that|who|what|where|when|why|how) )is\b/gi, (_m: string, p1: string) => p1 + "'s"],
//     [/(\b(he|she|it|they|we|you|I|that|who|what|where|when|why|how) )are\b/gi, (_m: string, p1: string) => p1 + "'re"],
//     [/ do not /gi, " don't "],
//     [/ does not /gi, " doesn't "],
//     [/ did not /gi, " didn't "],
//     [/ can not /gi, " can't "],
//     [/ will not /gi, " won't "],
//     [/ would not /gi, " wouldn't "],
//     [/ should not /gi, " shouldn't "],
//     [/ could not /gi, " couldn't "],
//     [/ has not /gi, " hasn't "],
//     [/ have not /gi, " haven't "],
//     [/ had not /gi, " hadn't "],
//     [/ is not /gi, " isn't "],
//     [/ was not /gi, " wasn't "],
//     [/ were not /gi, " weren't "],
//   ];

//   for (const [pattern, repl] of replacements) {
//     out = out.replace(pattern, (match, ...args) => {
//       if (Math.random() > strength * 0.8) return match;
//       count++;
//       return typeof repl === "function" ? repl(match, ...args) : repl;
//     });
//   }

//   return { text: out, count };
// }

// function injectPerplexity(text: string, strength: number): { text: string; count: number } {
//   let sentences = text.split(/([.!?])\s+/).filter(s => s.trim());
//   let count = 0;

//   for (let i = 0; i < sentences.length; i += 2) {
//     const sentence = sentences[i];
//     const punct = sentences[i + 1] || ".";

//     if (!sentence || sentence.length < 30) continue;

//     if (Math.random() < strength * 0.2) {
//       const words = sentence.split(" ");
//       const midPoint = Math.floor(words.length / 2);
//       const parens = ["(at least in my view)", "(though that's debatable)", "(or so it seems)", "(from what I've seen)"];
//       const paren = parens[Math.floor(Math.random() * parens.length)];
//       words.splice(midPoint, 0, paren);
//       sentences[i] = words.join(" ");
//       count++;
//     }

//     if (Math.random() < strength * 0.25) {
//       const words = sentence.split(" ");
//       const dashPoint = Math.floor(words.length * 0.6);
//       words[dashPoint] = "—" + words[dashPoint];
//       sentences[i] = words.join(" ");
//       count++;
//     }

//     if (Math.random() < strength * 0.15 && sentence.length > 80) {
//       const breakPoint = sentence.indexOf(",");
//       if (breakPoint > 20 && breakPoint < sentence.length - 20) {
//         sentences[i] = sentence.slice(0, breakPoint) + ".";
//         sentences.splice(i + 2, 0, sentence.slice(breakPoint + 1).trim().charAt(0).toUpperCase() + sentence.slice(breakPoint + 2), punct);
//         count++;
//       }
//     }
//   }

//   return { text: sentences.join(" "), count };
// }

// function injectBurstiness(text: string, strength: number, preserveSemantics: boolean): { text: string; count: number } {
//   const raw = text.trim();
//   if (!raw) return { text, count: 0 };

//   const sentences = raw.split(/([.!?])\s*/).reduce<string[]>((acc, cur, idx, arr) => {
//     if (idx % 2 === 0) {
//       const punct = arr[idx + 1] || "";
//       const s = (cur + punct).trim();
//       if (s) acc.push(s);
//     }
//     return acc;
//   }, []);

//   if (sentences.length <= 1) return { text, count: 0 };

//   let changed = 0;
//   const out: string[] = [];
//   let i = 0;

//   while (i < sentences.length) {
//     const s = sentences[i];

//     if (!preserveSemantics && s.length > 120 && Math.random() < strength * 0.5) {
//       const parts = s.split(/,\s+/);
//       if (parts.length >= 3) {
//         out.push(parts[0] + ".");
//         out.push(parts[1].charAt(0).toUpperCase() + parts[1].slice(1) + ".");
//         out.push(parts.slice(2).join(", "));
//         changed++;
//         i++;
//         continue;
//       }
//     }

//     if (!preserveSemantics && s.length < 50 && i < sentences.length - 2 && Math.random() < strength * 0.4) {
//       const next1 = sentences[i + 1];
//       const next2 = sentences[i + 2];
//       if (next1 && next1.length < 60 && next2 && next2.length < 60) {
//         const merged = `${s.replace(/[.!?]+$/, "")}, ${next1.charAt(0).toLowerCase()}${next1.slice(1).replace(/[.!?]+$/, "")}, and ${next2.charAt(0).toLowerCase()}${next2.slice(1)}`;
//         out.push(merged);
//         changed++;
//         i += 3;
//         continue;
//       }
//     }

//     if (s.length > 60 && Math.random() < strength * 0.2) {
//       const emphases = ["Simple as that.", "Pretty straightforward.", "Makes sense.", "Fair enough.", "No question."];
//       out.push(s);
//       out.push(emphases[Math.floor(Math.random() * emphases.length)]);
//       changed++;
//       i++;
//       continue;
//     }

//     out.push(s);
//     i++;
//   }

//   return { text: out.join(" "), count: changed };
// }

// function varyWordChoiceAggressively(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const patterns: Array<[RegExp, string[]]> = [
//     [/utilize/gi, ["use", "work with", "lean on", "go with"]],
//     [/facilitate/gi, ["help", "make easier", "enable", "smooth out"]],
//     [/leverage/gi, ["use", "tap into", "make use of", "work with"]],
//     [/implement/gi, ["use", "apply", "put in place", "roll out"]],
//     [/optimize/gi, ["improve", "tune up", "tighten", "refine"]],
//     [/significant/gi, ["important", "big", "major", "noticeable"]],
//     [/significantly/gi, ["a lot", "noticeably", "clearly", "quite a bit"]],
//     [/numerous/gi, ["many", "plenty of", "loads of", "tons of"]],
//     [/various/gi, ["different", "a mix of", "all sorts of", "diverse"]],
//     [/crucial/gi, ["key", "vital", "super important", "essential"]],
//     [/ensure/gi, ["make sure", "guarantee", "see to it", "confirm"]],
//     [/robust/gi, ["solid", "reliable", "strong", "well-built"]],
//     [/seamless/gi, ["smooth", "easy", "hassle-free", "effortless"]],
//     [/comprehensive/gi, ["detailed", "thorough", "complete", "in-depth"]],
//     [/delve/gi, ["dive into", "dig into", "explore", "look into"]],
//     [/realm/gi, ["world", "space", "area", "domain"]],
//     [/plethora/gi, ["lots of", "plenty of", "loads of", "tons of"]],
//     [/paramount/gi, ["essential", "critical", "top priority", "vital"]],
//     [/myriad/gi, ["many", "countless", "numerous", "plenty"]],
//     [/enhance/gi, ["improve", "boost", "upgrade", "beef up"]],
//     [/demonstrate/gi, ["show", "prove", "illustrate", "make clear"]],
//     [/acquire/gi, ["get", "obtain", "pick up", "grab"]],
//     [/innovative/gi, ["new", "fresh", "creative", "novel"]],
//     [/fundamental/gi, ["basic", "core", "essential", "key"]],
//   ];

//   for (const [pattern, choices] of patterns) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.7) return match;
//       const choice = choices[Math.floor(Math.random() * choices.length)];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// function addMicroRedundancy(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const redundancies: Array<[RegExp, string]> = [
//     [/\b(important|crucial|vital)\b/gi, "$1—really $1"],
//     [/\b(simple|easy|straightforward)\b/gi, "$1, honestly quite $1"],
//     [/\b(useful|helpful|beneficial)\b/gi, "$1, genuinely $1"],
//   ];

//   for (const [pattern, repl] of redundancies) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.15) return match;
//       count++;
//       return repl.replace("$1", match);
//     });
//   }

//   return { text: out, count };
// }

// function addThoughtTrails(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const trails = [
//     "—at least that's how it seems",
//     "—or so I'd argue",
//     ", though your mileage may vary",
//     " (but that's another story)",
//     ", not that it's a dealbreaker",
//   ];

//   const sentences = out.split(/\.\s+/);
//   for (let i = 0; i < sentences.length; i++) {
//     if (sentences[i].length > 50 && Math.random() < strength * 0.15) {
//       const trail = trails[Math.floor(Math.random() * trails.length)];
//       sentences[i] += trail;
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// function addCasualObservations(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const observations = [
//     { pattern: /\. This is/gi, replacement: ". Seems like this is" },
//     { pattern: /\. (The|A|An) (\w+) is/gi, replacement: ". Looks like the $2 is" },
//     { pattern: /\. (They|It) (can|could|will|would)/gi, replacement: ". Feels like $1 $2" },
//   ];

//   for (const { pattern, replacement } of observations) {
//     out = out.replace(pattern, (match, ...groups) => {
//       if (Math.random() > strength * 0.25) return match;
//       count++;
//       let result = replacement;
//       groups.forEach((g, i) => {
//         result = result.replace(`${i + 1}`, g);
//       });
//       return result;
//     });
//   }

//   return { text: out, count };
// }

// function injectHumanQuirksEnhanced(text: string, strength: number, lang?: string): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   if (!lang || /^en|es|fr|de|pt|it|nl|ro|pl|tr$/i.test(lang)) {
//     out = out.replace(/\b(definitely|certainly|clearly|absolutely|always|never)\b/gi, (m) => {
//       if (Math.random() < strength * 0.45) {
//         count++;
//         const choices = ["pretty much", "in most cases", "generally", "often", "usually", "tends to be", m.toLowerCase()];
//         return choices[Math.floor(Math.random() * choices.length)];
//       }
//       return m;
//     });

//     const sentences = out.split(/\.\s+/);
//     for (let i = 0; i < sentences.length; i++) {
//       if (Math.random() < strength * 0.1) {
//         const starters = ["Look, ", "Listen, ", "Thing is, ", "Real talk: ", "To be honest, "];
//         sentences[i] = starters[Math.floor(Math.random() * starters.length)] + sentences[i];
//         count++;
//       }
//     }
//     out = sentences.join(". ");
//   }

//   return { text: out, count };
// }

// function softenDefinitiveLanguage(text: string, strength: number): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   out = out.replace(/(\b(always|never)\b)/gi, (m) => {
//     if (Math.random() < strength * 0.35) {
//       count++;
//       return Math.random() < 0.5 ? "often" : "usually";
//     }
//     return m;
//   });

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Helpers
//  * ──────────────────────────────────────────────────────────── */

// function normalizeWhitespaceSoft(text: string): string {
//   return text.replace(/([^\S\n]{3,}|\t{2,})/g, "  ");
// }

// function fixSpacing(text: string): string {
//   let out = text;
//   out = out.replace(/([.,!?;:])(?=[^\s\n<])/g, "$1 ");
//   out = out.replace(/(\S)[ \t]{3,}(\S)/g, "$1 $2");
//   out = out.replace(/"([ \t]{2,})/g, '" ');
//   out = out.replace(/([ \t]{2,})"/g, ' "');
//   return out;
// }

// function estimatePatternScore(original: string, changed: string): number {
//   if (!original || !changed) return 1;
//   if (original === changed) return 1;

//   const o = original.replace(/\s+/g, " ").trim();
//   const c = changed.replace(/\s+/g, " ").trim();
//   if (!o || !c) return 1;

//   const minLen = Math.min(o.length, c.length);
//   if (minLen === 0) return 1;

//   let same = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (o.charAt(i) === c.charAt(i)) same++;
//   }

//   const similarity = same / minLen;
//   const lengthDiff = Math.abs(o.split(" ").length - c.split(" ").length) / Math.max(o.split(" ").length, 1);
//   const uniformityPenalty = lengthDiff * 0.15;

//   return clamp(similarity - uniformityPenalty, 0, 1);
// }

// function enforceMaxChangeRatio(original: string, changed: string, maxRatio: number): string {
//   if (maxRatio <= 0) return changed;
//   const oLen = original.length;
//   const cLen = changed.length;
//   const minLen = Math.min(oLen, cLen);
//   if (minLen === 0 || oLen === 0) return changed;

//   let diff = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (original[i] !== changed[i]) diff++;
//   }
//   diff += Math.abs(oLen - cLen);

//   const ratio = diff / oLen;
//   if (ratio <= maxRatio) return changed;

//   const keepRatio = 0.4;
//   const keepLen = Math.floor(oLen * keepRatio);
//   const tailLen = Math.max(0, cLen - (oLen - keepLen));
//   const tail = changed.slice(-tailLen);

//   return [original.slice(0, keepLen), tail].filter(Boolean).join(" ").trim();
// }

// function estimateAiScore(original: string, humanized: string): number {
//   const similarity = estimatePatternScore(original, humanized);
  
//   let humanMarkers = 0;
  
//   humanMarkers += (humanized.match(/\b(don't|won't|can't|it's|that's)\b/gi) || []).length;
  
//   const casualPhrases = /(honestly|basically|pretty much|sort of|kind of|to be fair|actually|anyway|so yeah|right|like|i mean)/gi;
//   humanMarkers += (humanized.match(casualPhrases) || []).length;
  
//   humanMarkers += (humanized.match(/—|[[(]|\.{3}/g) || []).length;
  
//   const sentences = humanized.split(/[.!?]\s+/);
//   const lengths = sentences.map(s => s.length);
//   const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
//   const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / lengths.length;
//   const burstiness = Math.sqrt(variance) / avgLen;
  
//   const baseScore = similarity * 100;
//   const humanReduction = Math.min(humanMarkers * 2.5, 50);
//   const burstReduction = Math.min(burstiness * 25, 35);
  
//   return Math.max(0, Math.min(100, baseScore - humanReduction - burstReduction));
// }

// function clamp(n: number, min: number, max: number): number {
//   return Math.max(min, Math.min(max, n));
// }

// function isMostlyLatinScript(text: string): boolean {
//   const sample = text.slice(0, 800);
//   let latin = 0;
//   let nonLatin = 0;

//   for (let i = 0; i < sample.length; i++) {
//     const code = sample.charCodeAt(i);
//     if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
//       latin++;
//     } else if (code > 127 && code !== 160) {
//       nonLatin++;
//     }
//   }

//   if (latin === 0 && nonLatin === 0) return true;
//   return latin >= nonLatin;
// }

// function detectLanguageFromContent(text: string): string | undefined {
//   const sample = text.slice(0, 800);

//   if (/[اأإءؤئ]/.test(sample)) return "ar";
//   if (/[\u0900-\u097F]/.test(sample)) return "hi";
//   if (/[\u4e00-\u9fff]/.test(sample)) return "zh";
//   if (/[\u0400-\u04FF]/.test(sample)) return "ru";
//   if (/[\u3040-\u30ff]/.test(sample)) return "ja";
//   if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
//   if (isMostlyLatinScript(sample)) return "en";

//   return undefined;
// }

// function preserveCase(from: string, to: string): string {
//   if (!from) return to;
//   if (from[0] === from[0].toUpperCase()) {
//     return to.charAt(0).toUpperCase() + to.slice(1);
//   }
//   return to;
// }


// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";

// /**
//  * Humanizer: make content read more human/varied while
//  * preserving critical tokens like domains, URLs, and links.
//  */

// export interface HumanizedContentItem {
//   id: string;
//   sourceId?: string;
//   originalHtml: string;
//   humanizedHtml: string;
//   createdAt: string;
//   meta?: {
//     patternScore?: number;
//     transformations?: number;
//     aiScore?: number;
//   };
// }

// export interface HumanizeOptions {
//   strength: number; // 0..1 how aggressive
//   allowImperfect: boolean;
//   maxChangeRatio: number; // max fraction of chars allowed to differ
//   preserveSemantics: boolean;
//   languageHint?: string;
//   aggressiveMode?: boolean;
// }

// const DEFAULT_OPTIONS: HumanizeOptions = {
//   strength: 0.98,
//   allowImperfect: true,
//   maxChangeRatio: 0.9,
//   preserveSemantics: false,
//   aggressiveMode: true,
// };

// interface HumanizeContext {
//   inProtectedTag: boolean;
//   inHeadingLike: boolean;
// }

// const NO_TOUCH_TAGS = new Set([
//   "script",
//   "style",
//   "noscript",
//   "iframe",
//   "canvas",
//   "svg",
//   "pre",
//   "code",
// ]);

// const PROTECTED_INLINE_TAGS = new Set([
//   "b",
//   "strong",
//   "em",
//   "i",
//   "u",
//   "mark",
//   "kbd",
//   "samp",
//   "var",
//   "abbr",
//   "acronym",
//   "sub",
//   "sup",
//   "a",
// ]);

// const HEADING_OR_LIST_TAGS = new Set([
//   "h1",
//   "h2",
//   "h3",
//   "h4",
//   "h5",
//   "h6",
//   "li",
//   "ul",
//   "ol",
//   "dt",
//   "dd",
//   "th",
//   "td",
//   "caption",
// ]);

// /* ────────────────────────────────────────────────────────────
//  * Hook
//  * ──────────────────────────────────────────────────────────── */

// export default function useHumanizeContent() {
//   const [isHumanizing, setIsHumanizing] = useState(false);
//   const [items, setItems] = useLocalStorage<HumanizedContentItem[]>(
//     "humanized-items_v5",
//     []
//   );

//   const humanizeHtml = async (
//     html: string,
//     opts?: Partial<HumanizeOptions>,
//     sourceId?: string
//   ): Promise<string> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     try {
//       if (!html || typeof html !== "string") return html;

//       const result = runHumanizer(html, options);

//       const record: HumanizedContentItem = {
//         id: `${
//           sourceId || "single"
//         }-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//         sourceId,
//         originalHtml: html,
//         humanizedHtml: result.html,
//         createdAt: new Date().toISOString(),
//         meta: {
//           patternScore: result.patternScore,
//           transformations: result.transformations,
//           aiScore: result.estimatedAiScore,
//         },
//       };

//       startTransition(() => {
//         setItems((prev = []) => [record, ...(prev || [])].slice(0, 500));
//       });

//       return result.html;
//     } catch (err) {
//       console.error("[HUMANIZE] failed:", err);
//       toast.error("Humanizer error: could not transform content.");
//       return html;
//     }
//   };

//   const humanizeMany = async (
//     batch: { id: string; html: string }[],
//     opts?: Partial<HumanizeOptions>
//   ): Promise<HumanizedContentItem[]> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };
//     if (!batch?.length) return [];

//     setIsHumanizing(true);
//     const out: HumanizedContentItem[] = [];

//     try {
//       for (const entry of batch) {
//         if (!entry?.html) continue;
//         const result = runHumanizer(entry.html, options);

//         const record: HumanizedContentItem = {
//           id: `${
//             entry.id || "batch"
//           }-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//           sourceId: entry.id,
//           originalHtml: entry.html,
//           humanizedHtml: result.html,
//           createdAt: new Date().toISOString(),
//           meta: {
//             patternScore: result.patternScore,
//             transformations: result.transformations,
//             aiScore: result.estimatedAiScore,
//           },
//         };

//         out.push(record);
//       }

//       if (out.length) {
//         startTransition(() => {
//           setItems((prev = []) => [...out, ...(prev || [])].slice(0, 500));
//         });
//         toast.success(`Humanized ${out.length} item(s).`);
//       }

//       return out;
//     } catch (err) {
//       console.error("[HUMANIZE] batch failed:", err);
//       toast.error("Failed to humanize batch.");
//       return out;
//     } finally {
//       setIsHumanizing(false);
//     }
//   };

//   const clearHumanized = () => {
//     startTransition(() => setItems([]));
//     toast.success("Cleared humanized content history.");
//   };

//   return {
//     isHumanizing,
//     items,
//     humanizeHtml,
//     humanizeMany,
//     clearHumanized,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Core Humanizer
//  * ──────────────────────────────────────────────────────────── */

// interface HumanizerResult {
//   html: string;
//   patternScore: number;
//   transformations: number;
//   estimatedAiScore: number;
// }

// interface TextProcessResult {
//   text: string;
//   transformations: number;
//   patternScore: number;
// }

// function runHumanizer(html: string, options: HumanizeOptions): HumanizerResult {
//   if (!html) {
//     return { html, patternScore: 1, transformations: 0, estimatedAiScore: 0 };
//   }

//   const lang = options.languageHint || detectLanguageFromContent(html);
//   const isLatin = isMostlyLatinScript(html);

//   // SSR / Node fallback: no DOMParser
//   if (
//     typeof window === "undefined" ||
//     typeof (window as any).DOMParser === "undefined"
//   ) {
//     const res = processText(
//       html,
//       options,
//       lang,
//       isLatin,
//       { inProtectedTag: false, inHeadingLike: false }
//     );
//     return {
//       html: res.text,
//       patternScore: res.patternScore,
//       transformations: res.transformations,
//       estimatedAiScore: estimateAiScore(html, res.text),
//     };
//   }

//   const parser = new DOMParser();
//   const doc = parser.parseFromString(
//     `<!doctype html><html><body>${html}</body></html>`,
//     "text/html"
//   );
//   const root = doc.body;

//   let totalTransformations = 0;
//   let totalPatternScore = 0;
//   let textNodeCount = 0;

//   const initialCtx: HumanizeContext = {
//     inProtectedTag: false,
//     inHeadingLike: false,
//   };

//   function humanizeNode(node: Node, ctx: HumanizeContext): void {
//     if (node.nodeType === Node.TEXT_NODE) {
//       const original = (node as Text).data;
//       if (!original || !original.trim()) return;

//       const res = processText(original, options, lang, isLatin, ctx);
//       (node as Text).data = res.text;

//       totalTransformations += res.transformations;
//       totalPatternScore += res.patternScore;
//       textNodeCount++;
//       return;
//     }

//     if (node.nodeType === Node.ELEMENT_NODE) {
//       const el = node as Element;
//       const tag = el.tagName.toLowerCase();

//       if (NO_TOUCH_TAGS.has(tag)) return;

//       const isProtectedInline =
//         PROTECTED_INLINE_TAGS.has(tag) ||
//         (tag === "span" &&
//           (el.className || "").toLowerCase().includes("keyword"));

//       const isHeadingLike =
//         HEADING_OR_LIST_TAGS.has(tag) ||
//         (tag === "p" && ctx.inHeadingLike);

//       const nextCtx: HumanizeContext = {
//         inProtectedTag: ctx.inProtectedTag || isProtectedInline,
//         inHeadingLike: ctx.inHeadingLike || isHeadingLike,
//       };

//       for (let i = 0; i < el.childNodes.length; i++) {
//         humanizeNode(el.childNodes[i], nextCtx);
//       }
//     }
//   }

//   for (let i = 0; i < root.childNodes.length; i++) {
//     humanizeNode(root.childNodes[i], initialCtx);
//   }

//   const avgPatternScore =
//     textNodeCount > 0
//       ? clamp(totalPatternScore / textNodeCount, 0, 1)
//       : 1;

//   const finalHtml = root.innerHTML;

//   return {
//     html: finalHtml,
//     patternScore: avgPatternScore,
//     transformations: totalTransformations,
//     estimatedAiScore: estimateAiScore(html, finalHtml),
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Text Processing
//  * ──────────────────────────────────────────────────────────── */

// interface ProtectedToken {
//   placeholder: string;
//   value: string;
// }

// function processText(
//   text: string,
//   options: HumanizeOptions,
//   lang: string | undefined,
//   isLatin: boolean,
//   ctx: HumanizeContext
// ): TextProcessResult {
//   const original = text;

//   const leading = original.match(/^[ \t]+/)?.[0] ?? "";
//   const trailing = original.match(/[ \t]+$/)?.[0] ?? "";
//   let core = original.slice(
//     leading.length,
//     original.length - trailing.length
//   );

//   if (!core.trim()) {
//     return { text: original, transformations: 0, patternScore: 1 };
//   }

//   // If inside protected tag (<a>, <strong>, etc.) keep text basically intact
//   if (ctx.inProtectedTag) {
//     const safe = core.replace(/[ \t]{3,}/g, "  ");
//     const finalText = leading + safe + trailing;
//     return {
//       text: finalText,
//       transformations: finalText === original ? 0 : 1,
//       patternScore: 1,
//     };
//   }

//   const local: HumanizeOptions = { ...options };

//   // Headings / table cells: tone down aggression to avoid ugly output
//   if (ctx.inHeadingLike) {
//     local.strength = clamp(local.strength * 0.5, 0.2, 0.8);
//     local.allowImperfect = false;
//     local.preserveSemantics = true;
//     local.aggressiveMode = false;
//     local.maxChangeRatio = Math.min(local.maxChangeRatio, 0.4);
//   }

//   let currentText = normalizeWhitespaceSoft(core);
//   let transformations = 0;

//   // Protect domains / URLs / emails / obvious tokens BEFORE chaos
//   const protection = protectStableTokens(currentText);
//   currentText = protection.text;

//   // 1) Kill boilerplate phrases
//   if (!ctx.inHeadingLike) {
//     const boiler = killBoilerplateAggressively(currentText);
//     currentText = boiler.text;
//     transformations += boiler.count;
//   }

//   if (isLatin) {
//     // These layers run only outside heading-like contexts

//     if (!ctx.inHeadingLike) {
//       const filler = injectNaturalFillers(currentText, local.strength);
//       currentText = filler.text;
//       transformations += filler.count;
//     }

//     if (!ctx.inHeadingLike) {
//       const para = paraphrasePhrasesAggressively(
//         currentText,
//         local.strength
//       );
//       currentText = para.text;
//       transformations += para.count;
//     }

//     if (!ctx.inHeadingLike) {
//       const contr = addContractions(currentText, local.strength);
//       currentText = contr.text;
//       transformations += contr.count;
//     }

//     if (!ctx.inHeadingLike) {
//       const perplex = injectPerplexity(
//         currentText,
//         local.strength
//       );
//       currentText = perplex.text;
//       transformations += perplex.count;
//     }

//     if (!ctx.inHeadingLike) {
//       const burst = injectBurstiness(
//         currentText,
//         local.strength,
//         local.preserveSemantics
//       );
//       currentText = burst.text;
//       transformations += burst.count;
//     }

//     if (!ctx.inHeadingLike) {
//       const vary = varyWordChoiceAggressively(
//         currentText,
//         local.strength
//       );
//       currentText = vary.text;
//       transformations += vary.count;
//     }

//     if (!ctx.inHeadingLike && local.allowImperfect) {
//       const redund = addMicroRedundancy(
//         currentText,
//         local.strength
//       );
//       currentText = redund.text;
//       transformations += redund.count;
//     }

//     if (!ctx.inHeadingLike && local.allowImperfect) {
//       const trail = addThoughtTrails(
//         currentText,
//         local.strength
//       );
//       currentText = trail.text;
//       transformations += trail.count;
//     }

//     if (!ctx.inHeadingLike && local.allowImperfect) {
//       const observ = addCasualObservations(
//         currentText,
//         local.strength
//       );
//       currentText = observ.text;
//       transformations += observ.count;
//     }

//     // Aggressive / noisy layers (guarded by aggressiveMode)
//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const informal = addInformalTransitions(
//         currentText,
//         local.strength
//       );
//       currentText = informal.text;
//       transformations += informal.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const frag = addThoughtFragments(
//         currentText,
//         local.strength
//       );
//       currentText = frag.text;
//       transformations += frag.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const selfCorr = addSelfCorrections(
//         currentText,
//         local.strength
//       );
//       currentText = selfCorr.text;
//       transformations += selfCorr.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const meander = addConversationalMeandering(
//         currentText,
//         local.strength
//       );
//       currentText = meander.text;
//       transformations += meander.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const personal = addPersonalInterjections(
//         currentText,
//         local.strength
//       );
//       currentText = personal.text;
//       transformations += personal.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const vocab = addVocabularyInconsistency(
//         currentText,
//         local.strength
//       );
//       currentText = vocab.text;
//       transformations += vocab.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const punct = addPunctuationChaos(
//         currentText,
//         local.strength
//       );
//       currentText = punct.text;
//       transformations += punct.count;
//     }

//     if (!ctx.inHeadingLike && local.aggressiveMode) {
//       const rhythm = breakSentenceRhythm(
//         currentText,
//         local.strength
//       );
//       currentText = rhythm.text;
//       transformations += rhythm.count;
//     }
//   } else {
//     const soft = softenDefinitiveLanguage(
//       currentText,
//       local.strength
//     );
//     currentText = soft.text;
//     transformations += soft.count;
//   }

//   // Human quirks (mild + language-aware)
//   if (local.allowImperfect && !ctx.inHeadingLike) {
//     const quirks = injectHumanQuirksEnhanced(
//       currentText,
//       local.strength,
//       lang
//     );
//     currentText = quirks.text;
//     transformations += quirks.count;
//   }

//   // Basic spacing / punctuation normalization
//   currentText = fixSpacing(currentText);

//   // Restore protected tokens (domains / URLs / emails / etc.)
//   currentText = restoreStableTokens(currentText, protection.map);

//   // Respect max change ratio vs original core text
//   if (local.maxChangeRatio > 0 && !ctx.inHeadingLike) {
//     currentText = enforceMaxChangeRatio(
//       core,
//       currentText,
//       local.maxChangeRatio
//     );
//   }

//   const finalText = leading + currentText + trailing;
//   const patternScore = estimatePatternScore(original, finalText);

//   return {
//     text: finalText,
//     transformations,
//     patternScore,
//   };
// }

// /* ────────────────────────────────────────────────────────────
//  * Stable token protection (NO splitting brand domains)
//  * ──────────────────────────────────────────────────────────── */

// function protectStableTokens(
//   text: string
// ): { text: string; map: ProtectedToken[] } {
//   const map: ProtectedToken[] = [];
//   let out = text;
//   let idx = 0;

//   // Order matters: longer / more specific first
//   const patterns: RegExp[] = [
//     /\bhttps?:\/\/[^\s<>'"]+/gi,
//     /\bwww\.[^\s<>'"]+/gi,
//     // Domains & subdomains like yashnihalani.netlify.app
//     /\b[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+){1,}(?:\/[^\s<>'"]*)?/gi,
//     // Emails
//     /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}\b/gi,
//   ];

//   for (const re of patterns) {
//     out = out.replace(re, (match) => {
//       const placeholder = `__HUM_PROTECT_${idx++}__`;
//       map.push({ placeholder, value: match });
//       return placeholder;
//     });
//   }

//   return { text: out, map };
// }

// function restoreStableTokens(text: string, map: ProtectedToken[]): string {
//   let out = text;
//   for (const { placeholder, value } of map) {
//     out = out.replace(new RegExp(placeholder, "g"), value);
//   }
//   return out;
// }

// /* ────────────────────────────────────────────────────────────
//  * Layers
//  * ──────────────────────────────────────────────────────────── */

// function addInformalTransitions(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const sentences = text.split(/\.\s+/);
//   let count = 0;

//   const transitions = [
//     "Anyway,",
//     "So yeah,",
//     "Right,",
//     "Like,",
//     "I mean,",
//     "You know what,",
//     "Now,",
//     "Alright,",
//     "Look,",
//     "Listen,",
//   ];

//   for (let i = 1; i < sentences.length; i++) {
//     if (Math.random() < strength * 0.2) {
//       const trans =
//         transitions[Math.floor(Math.random() * transitions.length)];
//       sentences[i] = `${trans} ${sentences[i]}`;
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// function addThoughtFragments(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const fragments = [
//     "Which is interesting.",
//     "Not sure why.",
//     "Just my take.",
//     "Could be wrong though.",
//     "Depends on how you see it.",
//     "Makes you think.",
//     "Fair point.",
//     "Debatable, but yeah.",
//   ];

//   const sentences = out.split(/\.\s+/);
//   for (let i = 0; i < sentences.length; i++) {
//     if (
//       sentences[i].length > 60 &&
//       Math.random() < strength * 0.15
//     ) {
//       const frag =
//         fragments[Math.floor(Math.random() * fragments.length)];
//       sentences[i] = `${sentences[i]}. ${frag}`;
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// function addSelfCorrections(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const corrections: Array<[RegExp, string[]]> = [
//     [
//       /\b(is|are|was|were) (\w+)/gi,
//       [
//         "$1 $2—well, $1 actually $2",
//         "$1 $2, or rather $1 $2",
//       ],
//     ],
//     [
//       /\b(can|could|will|would) (\w+)/gi,
//       [
//         "$1 $2—no wait, $1 $2",
//         "$1 $2, scratch that, $1 $2",
//       ],
//     ],
//   ];

//   for (const [pattern, templates] of corrections) {
//     out = out.replace(
//       pattern,
//       (match: string, verb: string, word: string) => {
//         if (Math.random() > strength * 0.1) return match;
//         count++;
//         const template =
//           templates[Math.floor(Math.random() * templates.length)];
//         return template
//           .replace(/\$1/g, verb)
//           .replace(/\$2/g, word);
//       }
//     );
//   }

//   return { text: out, count };
// }

// function addConversationalMeandering(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const meanders = [
//     ", but that's beside the point",
//     ", though I'm getting off track here",
//     "—anyway, back to the main thing",
//     ", not that it matters much",
//     ", random tangent but",
//   ];

//   const sentences = text.split(/\.\s+/);
//   let count = 0;

//   for (let i = 0; i < sentences.length; i++) {
//     if (
//       sentences[i].length > 70 &&
//       Math.random() < strength * 0.12
//     ) {
//       const m =
//         meanders[Math.floor(Math.random() * meanders.length)];
//       const mid = Math.floor(sentences[i].length / 2);
//       sentences[i] =
//         sentences[i].slice(0, mid) +
//         m +
//         sentences[i].slice(mid);
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// function addPersonalInterjections(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const interjections = [
//     "if you ask me",
//     "in my experience",
//     "from what I've seen",
//     "personally speaking",
//     "the way I see it",
//     "at least in my view",
//   ];

//   const sentences = text.split(/\.\s+/);
//   let count = 0;

//   for (let i = 0; i < sentences.length; i++) {
//     if (Math.random() < strength * 0.15) {
//       const interj =
//         interjections[
//           Math.floor(Math.random() * interjections.length)
//         ];
//       sentences[i] = `${sentences[i]}, ${interj}`;
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// function addVocabularyInconsistency(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const mixPatterns: Array<[RegExp, string[]]> = [
//     [
//       /\bimportant\b/gi,
//       ["important", "key", "big deal", "crucial", "matters a lot"],
//     ],
//     [
//       /\bdifficult\b/gi,
//       ["difficult", "hard", "tough", "challenging", "tricky"],
//     ],
//     [
//       /\binteresting\b/gi,
//       ["interesting", "fascinating", "cool", "intriguing", "neat"],
//     ],
//     [
//       /\bunderstand\b/gi,
//       ["understand", "get", "grasp", "figure out"],
//     ],
//   ];

//   for (const [pattern, options] of mixPatterns) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.25) return match;
//       count++;
//       return options[Math.floor(Math.random() * options.length)];
//     });
//   }

//   return { text: out, count };
// }

// function addPunctuationChaos(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   // Random comma additions between words
//   out = out.replace(/(\w+)\s+(\w+)/g, (match, w1, w2) => {
//     if (Math.random() < strength * 0.08) {
//       count++;
//       return `${w1}, ${w2}`;
//     }
//     return match;
//   });

//   // Occasional ellipsis
//   out = out.replace(/\.\s+([A-Z])/g, (match, letter) => {
//     if (Math.random() < strength * 0.1) {
//       count++;
//       return `... ${letter}`;
//     }
//     return match;
//   });

//   // Occasional double spaces
//   out = out.replace(/\s/g, (m) => {
//     if (m === " " && Math.random() < strength * 0.05) {
//       count++;
//       return "  ";
//     }
//     return m;
//   });

//   return { text: out, count };
// }

// function breakSentenceRhythm(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const sentences = text.split(/\.\s+/);
//   let count = 0;

//   let i = 0;
//   while (i < sentences.length - 1) {
//     // awkward pause
//     if (Math.random() < strength * 0.12) {
//       sentences[i] = `${sentences[i]}...`;
//       count++;
//     }

//     // occasional merge of short sentences
//     if (
//       sentences[i].length < 40 &&
//       sentences[i + 1] &&
//       Math.random() < strength * 0.1
//     ) {
//       sentences[i] =
//         sentences[i] +
//         " " +
//         sentences[i + 1].charAt(0).toLowerCase() +
//         sentences[i + 1].slice(1);
//       sentences.splice(i + 1, 1);
//       count++;
//     } else {
//       i++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// /* Existing layers (trimmed from your version, but kept compatible) */

// function killBoilerplateAggressively(
//   text: string
// ): { text: string; count: number } {
//   const replacements: Array<[RegExp, string | string[]]> = [
//     [/in conclusion[, ]*/gi, ["To wrap up, ", "Overall, ", "Bottom line, ", "So, "]],
//     [/to conclude[, ]*/gi, ["In short, ", "Basically, ", "All said, "]],
//     [/in summary[, ]*/gi, ["Simply put, ", "Long story short, ", "The gist is, "]],
//     [/this article will explore/gi, ["we'll look at", "let's check out", "here's what we'll cover"]],
//     [/throughout this article[, ]*/gi, ""],
//     [/it is important to note that/gi, ["worth knowing that", "keep in mind", "just so you know"]],
//     [/it is worth noting that/gi, ["worth mentioning", "to be fair", "actually"]],
//     [/in today's (digital )?age/gi, ["these days", "nowadays", "right now"]],
//     [/with that being said[, ]*/gi, ["still, ", "but, ", "though, "]],
//     [/it should be noted that/gi, ["just know that", "heads up—", "thing is, "]],
//     [/it is essential to/gi, ["you need to", "you've gotta", "make sure to"]],
//     [/it is crucial to/gi, ["it's key to", "really helps to", "you should"]],
//     [/one must/gi, ["you should", "it helps to", "best to"]],
//     [/it can be seen that/gi, ["you'll notice", "seems like", "looks like"]],
//     [/it is evident that/gi, ["clearly, ", "obviously, ", "you can see "]],
//     [/as a matter of fact/gi, ["actually, ", "honestly, ", "truth is, "]],
//     [/needless to say/gi, ["obviously, ", "of course, ", "naturally, "]],
//     [/it goes without saying/gi, ["obviously, ", "naturally, ", "sure, "]],
//     [/in order to/gi, "to"],
//     [/in the event that/gi, "if"],
//     [/due to the fact that/gi, ["because", "since", "seeing as"]],
//     [/for the purpose of/gi, "to"],
//     [/with regard to/gi, ["about", "regarding", "on"]],
//     [/in this guide[, ]*/gi, ""],
//     [/in this article[, ]*/gi, ""],
//     [/delve into/gi, ["dive into", "get into", "explore", "check out"]],
//     [/shed light on/gi, ["highlight", "show", "reveal", "explain"]],
//     [/unleash the power of/gi, ["tap into", "use", "make the most of"]],
//     [/embark on a journey/gi, ["start exploring", "begin with", "kick things off"]],
//     [/in the realm of/gi, ["in the world of", "when it comes to", "in"]],
//     [/a plethora of/gi, ["lots of", "tons of", "plenty of", "loads of"]],
//     [/the fact of the matter is/gi, ["the thing is", "truth is", "basically"]],
//     [/it is no secret that/gi, ["everyone knows", "it's clear that", "obviously"]],
//     [/at the end of the day/gi, ["ultimately", "basically", "in the end"]],
//     [/when all is said and done/gi, ["ultimately", "in the end", "bottom line"]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, repl] of replacements) {
//     out = out.replace(pattern, () => {
//       count++;
//       if (Array.isArray(repl)) {
//         return repl[Math.floor(Math.random() * repl.length)];
//       }
//       return repl;
//     });
//   }

//   return { text: out, count };
// }

// function injectNaturalFillers(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const fillers = [
//     {
//       pattern: /\b(very|really|quite)\s+(\w+)\b/gi,
//       replacements: [
//         "pretty $2",
//         "fairly $2",
//         "kind of $2",
//         "sort of $2",
//       ],
//     },
//     {
//       pattern:
//         /\b(important|significant|crucial)\b/gi,
//       replacements: [
//         "pretty important",
//         "quite significant",
//         "really crucial",
//       ],
//     },
//     {
//       pattern: /\. ([A-Z])/g,
//       replacements: [
//         ". Honestly, $1",
//         ". Basically, $1",
//         ". To be fair, $1",
//         ". Actually, $1",
//       ],
//     },
//   ];

//   for (const { pattern, replacements } of fillers) {
//     out = out.replace(pattern, (match, ...groups) => {
//       if (Math.random() > strength * 0.4) return match;
//       count++;
//       let choice =
//         replacements[
//           Math.floor(Math.random() * replacements.length)
//         ];
//       groups.forEach((group, i) => {
//         choice = choice.replace(`${i + 1}`, group);
//       });
//       return choice;
//     });
//   }

//   return { text: out, count };
// }

// function paraphrasePhrasesAggressively(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const map: Array<[RegExp, string[]]> = [
//     [/however,/gi, ["But,", "Still,", "That said,", "Though,", "Yet,"]],
//     [/moreover,/gi, ["Plus,", "On top of that,", "Also,", "What's more,"]],
//     [/furthermore,/gi, ["Also,", "Besides,", "Plus,", "Another thing—"]],
//     [/additionally,/gi, ["Also,", "Plus,", "Then again,", "Worth noting:"]],
//     [/therefore,/gi, ["So,", "Because of that,", "As a result,", "That's why,"]],
//     [/overall,/gi, ["All in all,", "In general,", "Basically,", "Looking at it,"]],
//     [/in other words,/gi, ["Put simply,", "Basically,", "Meaning,"]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, options] of map) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.75) return match;
//       const choice =
//         options[Math.floor(Math.random() * options.length)];
//       count++;
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// function addContractions(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const replacements: Array<
//     [RegExp, string | ((match: string, ...args: any[]) => string)]
//   > = [
//     [
//       /(\b(?:it|he|she|they|we|you|I|that|who|what|where|when|why|how) )is\b/gi,
//       (_m: string, p1: string) => `${p1}'s`,
//     ],
//     [
//       /(\b(?:he|she|it|they|we|you|I|that|who|what|where|when|why|how) )are\b/gi,
//       (_m: string, p1: string) => `${p1}'re`,
//     ],
//     [/ do not /gi, " don't "],
//     [/ does not /gi, " doesn't "],
//     [/ did not /gi, " didn't "],
//     [/ can not /gi, " can't "],
//     [/ will not /gi, " won't "],
//     [/ would not /gi, " wouldn't "],
//     [/ should not /gi, " shouldn't "],
//     [/ could not /gi, " couldn't "],
//     [/ has not /gi, " hasn't "],
//     [/ have not /gi, " haven't "],
//     [/ had not /gi, " hadn't "],
//     [/ is not /gi, " isn't "],
//     [/ was not /gi, " wasn't "],
//     [/ were not /gi, " weren't "],
//   ];

//   for (const [pattern, repl] of replacements) {
//     out = out.replace(pattern, (match, ...args) => {
//       if (Math.random() > strength * 0.8) return match;
//       count++;
//       return typeof repl === "function"
//         ? repl(match, ...args)
//         : repl;
//     });
//   }

//   return { text: out, count };
// }

// function injectPerplexity(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const parts = text
//     .split(/([.!?])\s+/)
//     .filter((s) => s.trim());
//   let count = 0;

//   for (let i = 0; i < parts.length; i += 2) {
//     const sentence = parts[i];
//     const punct = parts[i + 1] || ".";

//     if (!sentence || sentence.length < 30) continue;

//     if (Math.random() < strength * 0.2) {
//       const words = sentence.split(" ");
//       const mid = Math.floor(words.length / 2);
//       const parens = [
//         "(at least in my view)",
//         "(though that's debatable)",
//         "(or so it seems)",
//         "(from what I've seen)",
//       ];
//       const p =
//         parens[Math.floor(Math.random() * parens.length)];
//       words.splice(mid, 0, p);
//       parts[i] = words.join(" ");
//       count++;
//     }

//     if (Math.random() < strength * 0.25) {
//       const words = sentence.split(" ");
//       const pos = Math.floor(words.length * 0.6);
//       if (words[pos]) {
//         words[pos] = "—" + words[pos];
//         parts[i] = words.join(" ");
//         count++;
//       }
//     }

//     parts[i + 1] = punct;
//   }

//   return { text: parts.join(" "), count };
// }

// function injectBurstiness(
//   text: string,
//   strength: number,
//   preserveSemantics: boolean
// ): { text: string; count: number } {
//   const raw = text.trim();
//   if (!raw) return { text, count: 0 };

//   const sentences = raw
//     .split(/([.!?])\s*/)
//     .reduce<string[]>((acc, cur, idx, arr) => {
//       if (idx % 2 === 0) {
//         const punct = arr[idx + 1] || "";
//         const s = (cur + punct).trim();
//         if (s) acc.push(s);
//       }
//       return acc;
//     }, []);

//   if (sentences.length <= 1) {
//     return { text, count: 0 };
//   }

//   let changed = 0;
//   const out: string[] = [];
//   let i = 0;

//   while (i < sentences.length) {
//     const s = sentences[i];

//     if (
//       !preserveSemantics &&
//       s.length > 120 &&
//       Math.random() < strength * 0.5
//     ) {
//       const parts = s.split(/,\s+/);
//       if (parts.length >= 3) {
//         out.push(parts[0] + ".");
//         out.push(
//           parts[1].charAt(0).toUpperCase() +
//             parts[1].slice(1) +
//             "."
//         );
//         out.push(parts.slice(2).join(", "));
//         changed++;
//         i++;
//         continue;
//       }
//     }

//     if (
//       !preserveSemantics &&
//       s.length < 50 &&
//       i < sentences.length - 2 &&
//       Math.random() < strength * 0.4
//     ) {
//       const n1 = sentences[i + 1];
//       const n2 = sentences[i + 2];
//       if (n1 && n1.length < 60 && n2 && n2.length < 60) {
//         const merged = `${s.replace(
//           /[.!?]+$/,
//           ""
//         )}, ${n1
//           .charAt(0)
//           .toLowerCase()}${n1
//           .replace(/[.!?]+$/, "")
//           .slice(
//             1
//           )}, and ${n2
//           .charAt(0)
//           .toLowerCase()}${n2.replace(
//           /[.!?]+$/,
//           ""
//         ).slice(1)}`;
//         out.push(merged);
//         changed++;
//         i += 3;
//         continue;
//       }
//     }

//     if (
//       s.length > 60 &&
//       Math.random() < strength * 0.2
//     ) {
//       const emphases = [
//         "Simple as that.",
//         "Pretty straightforward.",
//         "Makes sense.",
//         "Fair enough.",
//         "No question.",
//       ];
//       out.push(s);
//       out.push(
//         emphases[
//           Math.floor(Math.random() * emphases.length)
//         ]
//       );
//       changed++;
//       i++;
//       continue;
//     }

//     out.push(s);
//     i++;
//   }

//   return { text: out.join(" "), count: changed };
// }

// function varyWordChoiceAggressively(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const patterns: Array<[RegExp, string[]]> = [
//     [/utilize/gi, ["use", "work with", "lean on", "go with"]],
//     [/facilitate/gi, ["help", "make easier", "enable", "smooth out"]],
//     [/leverage/gi, ["use", "tap into", "make use of"]],
//     [/implement/gi, ["use", "apply", "put in place"]],
//     [/optimize/gi, ["improve", "tune up", "refine"]],
//     [/significant/gi, ["important", "big", "major"]],
//     [/numerous/gi, ["many", "plenty of", "loads of"]],
//     [/various/gi, ["different", "a mix of", "all sorts of"]],
//   ];

//   for (const [pattern, choices] of patterns) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.7) return match;
//       count++;
//       const choice =
//         choices[Math.floor(Math.random() * choices.length)];
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// function addMicroRedundancy(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const redundancies: Array<[RegExp, string]> = [
//     [/\b(important|crucial|vital)\b/gi, "$1—really $1"],
//     [/\b(simple|easy|straightforward)\b/gi, "$1, honestly quite $1"],
//     [/\b(useful|helpful|beneficial)\b/gi, "$1, genuinely $1"],
//   ];

//   for (const [pattern, repl] of redundancies) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.15) return match;
//       count++;
//       return repl.replace("$1", match);
//     });
//   }

//   return { text: out, count };
// }

// function addThoughtTrails(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const trails = [
//     "—at least that's how it seems",
//     "—or so I'd argue",
//     ", though your mileage may vary",
//     " (but that's another story)",
//     ", not that it's a dealbreaker",
//   ];

//   const sentences = text.split(/\.\s+/);
//   let count = 0;

//   for (let i = 0; i < sentences.length; i++) {
//     if (
//       sentences[i].length > 50 &&
//       Math.random() < strength * 0.15
//     ) {
//       const trail =
//         trails[Math.floor(Math.random() * trails.length)];
//       sentences[i] += trail;
//       count++;
//     }
//   }

//   return { text: sentences.join(". "), count };
// }

// function addCasualObservations(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const observations: Array<{
//     pattern: RegExp;
//     replacement: string;
//   }> = [
//     { pattern: /\. This is/gi, replacement: ". Seems like this is" },
//     {
//       pattern: /\. (The|A|An) (\w+) is/gi,
//       replacement: ". Looks like the $2 is",
//     },
//   ];

//   for (const { pattern, replacement } of observations) {
//     out = out.replace(pattern, (match, ...groups) => {
//       if (Math.random() > strength * 0.25) return match;
//       count++;
//       let result = replacement;
//       groups.forEach((g, i) => {
//         result = result.replace(`${i + 1}`, g);
//       });
//       return result;
//     });
//   }

//   return { text: out, count };
// }

// function injectHumanQuirksEnhanced(
//   text: string,
//   strength: number,
//   lang?: string
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   if (
//     !lang ||
//     /^en|es|fr|de|pt|it|nl|ro|pl|tr$/i.test(lang)
//   ) {
//     out = out.replace(
//       /\b(definitely|certainly|clearly|absolutely|always|never)\b/gi,
//       (m) => {
//         if (Math.random() < strength * 0.45) {
//           count++;
//           const choices = [
//             "pretty much",
//             "in most cases",
//             "generally",
//             "often",
//             "usually",
//             "tends to be",
//             m.toLowerCase(),
//           ];
//           return choices[
//             Math.floor(Math.random() * choices.length)
//           ];
//         }
//         return m;
//       }
//     );
//   }

//   return { text: out, count };
// }

// function softenDefinitiveLanguage(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   out = out.replace(
//     /\b(always|never)\b/gi,
//     (m) => {
//       if (Math.random() < strength * 0.35) {
//         count++;
//         return Math.random() < 0.5 ? "often" : "usually";
//       }
//       return m;
//     }
//   );

//   return { text: out, count };
// }

// /* ────────────────────────────────────────────────────────────
//  * Helpers
//  * ──────────────────────────────────────────────────────────── */

// function normalizeWhitespaceSoft(text: string): string {
//   return text.replace(/([^\S\n]{3,}|\t{2,})/g, "  ");
// }

// function fixSpacing(text: string): string {
//   let out = text;
//   out = out.replace(/([.,!?;:])(?=[^\s\n<])/g, "$1 ");
//   out = out.replace(/(\S)[ \t]{3,}(\S)/g, "$1 $2");
//   out = out.replace(/"([ \t]{2,})/g, '" ');
//   out = out.replace(/([ \t]{2,})"/g, ' "');
//   return out;
// }

// function estimatePatternScore(
//   original: string,
//   changed: string
// ): number {
//   if (!original || !changed) return 1;
//   if (original === changed) return 1;

//   const o = original.replace(/\s+/g, " ").trim();
//   const c = changed.replace(/\s+/g, " ").trim();
//   if (!o || !c) return 1;

//   const minLen = Math.min(o.length, c.length);
//   if (minLen === 0) return 1;

//   let same = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (o.charAt(i) === c.charAt(i)) same++;
//   }

//   const similarity = same / minLen;
//   const lengthDiff =
//     Math.abs(o.split(" ").length - c.split(" ").length) /
//     Math.max(o.split(" ").length, 1);
//   const uniformityPenalty = lengthDiff * 0.15;

//   return clamp(similarity - uniformityPenalty, 0, 1);
// }

// function enforceMaxChangeRatio(
//   original: string,
//   changed: string,
//   maxRatio: number
// ): string {
//   if (maxRatio <= 0) return changed;
//   const oLen = original.length;
//   const cLen = changed.length;
//   const minLen = Math.min(oLen, cLen);
//   if (minLen === 0 || oLen === 0) return changed;

//   let diff = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (original[i] !== changed[i]) diff++;
//   }
//   diff += Math.abs(oLen - cLen);

//   const ratio = diff / oLen;
//   if (ratio <= maxRatio) return changed;

//   // If too different, blend original head + changed tail
//   const keepRatio = 0.4;
//   const keepLen = Math.floor(oLen * keepRatio);
//   const tailLen = Math.max(0, cLen - (oLen - keepLen));
//   const tail = changed.slice(-tailLen);

//   return [original.slice(0, keepLen), tail]
//     .filter(Boolean)
//     .join(" ")
//     .trim();
// }

// function estimateAiScore(
//   original: string,
//   humanized: string
// ): number {
//   const similarity = estimatePatternScore(
//     original,
//     humanized
//   );

//   let humanMarkers = 0;
//   humanMarkers +=
//     (humanized.match(
//       /\b(don't|won't|can't|it's|that's)\b/gi
//     ) || []).length;

//   const casual =
//     /(honestly|basically|pretty much|sort of|kind of|to be fair|actually|anyway|so yeah|right|like|i mean)/gi;
//   humanMarkers += (humanized.match(casual) || []).length;

//   humanMarkers +=
//     (humanized.match(/—|\.{3}/g) || []).length;

//   const sentences = humanized.split(
//     /[.!?]\s+/
//   );
//   const lengths = sentences.map((s) => s.length || 0);
//   const avg =
//     lengths.reduce((a, b) => a + b, 0) /
//     (lengths.length || 1);
//   const variance =
//     lengths.reduce(
//       (sum, len) => sum + Math.pow(len - avg, 2),
//       0
//     ) / (lengths.length || 1);
//   const burstiness =
//     avg > 0 ? Math.sqrt(variance) / avg : 0;

//   const baseScore = similarity * 100;
//   const humanReduction = Math.min(
//     humanMarkers * 2.5,
//     50
//   );
//   const burstReduction = Math.min(
//     burstiness * 25,
//     35
//   );

//   return Math.max(
//     0,
//     Math.min(
//       100,
//       baseScore - humanReduction - burstReduction
//     )
//   );
// }

// function clamp(n: number, min: number, max: number): number {
//   return Math.max(min, Math.min(max, n));
// }

// function isMostlyLatinScript(text: string): boolean {
//   const sample = text.slice(0, 800);
//   let latin = 0;
//   let nonLatin = 0;

//   for (let i = 0; i < sample.length; i++) {
//     const code = sample.charCodeAt(i);
//     if (
//       (code >= 0x0041 && code <= 0x005a) ||
//       (code >= 0x0061 && code <= 0x007a)
//     ) {
//       latin++;
//     } else if (code > 127 && code !== 160) {
//       nonLatin++;
//     }
//   }

//   if (latin === 0 && nonLatin === 0) return true;
//   return latin >= nonLatin;
// }

// function detectLanguageFromContent(
//   text: string
// ): string | undefined {
//   const sample = text.slice(0, 800);

//   if (/[اأإءؤئ]/.test(sample)) return "ar";
//   if (/[\u0900-\u097F]/.test(sample)) return "hi";
//   if (/[\u4e00-\u9fff]/.test(sample)) return "zh";
//   if (/[\u0400-\u04FF]/.test(sample)) return "ru";
//   if (/[\u3040-\u30ff]/.test(sample)) return "ja";
//   if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
//   if (isMostlyLatinScript(sample)) return "en";

//   return undefined;
// }

// function preserveCase(from: string, to: string): string {
//   if (!from) return to;
//   if (from[0] === from[0].toUpperCase()) {
//     return to.charAt(0).toUpperCase() + to.slice(1);
//   }
//   return to;
// }





  // import { useState, startTransition } from "react";

  // /**
  //  * Natural Humanizer: Makes content genuinely human-like
  //  * without unnecessary punctuation chaos
  //  */

  // // Simple toast replacement
  // const toast = {
  //   success: (msg: string) => console.log("✓", msg),
  //   error: (msg: string) => console.error("✗", msg),
  // };

  // // Simple localStorage hook replacement
  // function useLocalStorage<T>(key: string, initialValue: T) {
  //   const [storedValue, setStoredValue] = useState<T>(() => {
  //     try {
  //       const item = window.localStorage.getItem(key);
  //       return item ? JSON.parse(item) : initialValue;
  //     } catch (error) {
  //       console.error(error);
  //       return initialValue;
  //     }
  //   });

  //   const setValue = (value: T | ((val: T) => T)) => {
  //     try {
  //       const valueToStore = value instanceof Function ? value(storedValue) : value;
  //       setStoredValue(valueToStore);
  //       window.localStorage.setItem(key, JSON.stringify(valueToStore));
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   return [storedValue, setValue] as const;
  // }

  // export interface HumanizedContentItem {
  //   id: string;
  //   sourceId?: string;
  //   originalHtml: string;
  //   humanizedHtml: string;
  //   createdAt: string;
  //   meta?: {
  //     patternScore?: number;
  //     transformations?: number;
  //     aiScore?: number;
  //   };
  // }

  // export interface HumanizeOptions {
  //   strength: number;
  //   preserveReadability: boolean;
  //   maxChangeRatio: number;
  //   naturalFlow: boolean;
  // }

  // const DEFAULT_OPTIONS: HumanizeOptions = {
  //   strength: 0.85,
  //   preserveReadability: true,
  //   maxChangeRatio: 0.7,
  //   naturalFlow: true,
  // };

  // interface HumanizeContext {
  //   inProtectedTag: boolean;
  //   inHeadingLike: boolean;
  // }

  // const NO_TOUCH_TAGS = new Set([
  //   "script",
  //   "style",
  //   "noscript",
  //   "iframe",
  //   "canvas",
  //   "svg",
  //   "pre",
  //   "code",
  // ]);

  // const PROTECTED_INLINE_TAGS = new Set([
  //   "b",
  //   "strong",
  //   "em",
  //   "i",
  //   "u",
  //   "mark",
  //   "kbd",
  //   "samp",
  //   "var",
  //   "abbr",
  //   "acronym",
  //   "sub",
  //   "sup",
  //   "a",
  // ]);

  // const HEADING_OR_LIST_TAGS = new Set([
  //   "h1",
  //   "h2",
  //   "h3",
  //   "h4",
  //   "h5",
  //   "h6",
  //   "li",
  //   "ul",
  //   "ol",
  //   "dt",
  //   "dd",
  //   "th",
  //   "td",
  //   "caption",
  // ]);

  // /* ────────────────────────────────────────────────────────────
  // * Hook
  // * ──────────────────────────────────────────────────────────── */

  // export default function useHumanizeContent() {
  //   const [isHumanizing, setIsHumanizing] = useState(false);
  //   const [items, setItems] = useLocalStorage<HumanizedContentItem[]>(
  //     "humanized-items_v6",
  //     []
  //   );

  //   const humanizeHtml = async (
  //     html: string,
  //     opts?: Partial<HumanizeOptions>,
  //     sourceId?: string
  //   ): Promise<string> => {
  //     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

  //     try {
  //       if (!html || typeof html !== "string") return html;

  //       const result = runHumanizer(html, options);

  //       const record: HumanizedContentItem = {
  //         id: `${
  //           sourceId || "single"
  //         }-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  //         sourceId,
  //         originalHtml: html,
  //         humanizedHtml: result.html,
  //         createdAt: new Date().toISOString(),
  //         meta: {
  //           patternScore: result.patternScore,
  //           transformations: result.transformations,
  //           aiScore: result.estimatedAiScore,
  //         },
  //       };

  //       startTransition(() => {
  //         setItems((prev = []) => [record, ...(prev || [])].slice(0, 500));
  //       });

  //       return result.html;
  //     } catch (err) {
  //       console.error("[HUMANIZE] failed:", err);
  //       toast.error("Humanizer error: could not transform content.");
  //       return html;
  //     }
  //   };

  //   const humanizeMany = async (
  //     batch: { id: string; html: string }[],
  //     opts?: Partial<HumanizeOptions>
  //   ): Promise<HumanizedContentItem[]> => {
  //     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };
  //     if (!batch?.length) return [];

  //     setIsHumanizing(true);
  //     const out: HumanizedContentItem[] = [];

  //     try {
  //       for (const entry of batch) {
  //         if (!entry?.html) continue;
  //         const result = runHumanizer(entry.html, options);

  //         const record: HumanizedContentItem = {
  //           id: `${
  //             entry.id || "batch"
  //           }-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  //           sourceId: entry.id,
  //           originalHtml: entry.html,
  //           humanizedHtml: result.html,
  //           createdAt: new Date().toISOString(),
  //           meta: {
  //             patternScore: result.patternScore,
  //             transformations: result.transformations,
  //             aiScore: result.estimatedAiScore,
  //           },
  //         };

  //         out.push(record);
  //       }

  //       if (out.length) {
  //         startTransition(() => {
  //           setItems((prev = []) => [...out, ...(prev || [])].slice(0, 500));
  //         });
  //         toast.success(`Humanized ${out.length} item(s).`);
  //       }

  //       return out;
  //     } catch (err) {
  //       console.error("[HUMANIZE] batch failed:", err);
  //       toast.error("Failed to humanize batch.");
  //       return out;
  //     } finally {
  //       setIsHumanizing(false);
  //     }
  //   };

  //   const clearHumanized = () => {
  //     startTransition(() => setItems([]));
  //     toast.success("Cleared humanized content history.");
  //   };

  //   return {
  //     isHumanizing,
  //     items,
  //     humanizeHtml,
  //     humanizeMany,
  //     clearHumanized,
  //   };
  // }

  // /* ────────────────────────────────────────────────────────────
  // * Core Humanizer
  // * ──────────────────────────────────────────────────────────── */

  // interface HumanizerResult {
  //   html: string;
  //   patternScore: number;
  //   transformations: number;
  //   estimatedAiScore: number;
  // }

  // interface TextProcessResult {
  //   text: string;
  //   transformations: number;
  //   patternScore: number;
  // }

  // function runHumanizer(html: string, options: HumanizeOptions): HumanizerResult {
  //   if (!html) {
  //     return { html, patternScore: 1, transformations: 0, estimatedAiScore: 0 };
  //   }

  //   const lang = detectLanguageFromContent(html);
  //   const isLatin = isMostlyLatinScript(html);

  //   if (
  //     typeof window === "undefined" ||
  //     typeof (window as any).DOMParser === "undefined"
  //   ) {
  //     const res = processText(
  //       html,
  //       options,
  //       lang,
  //       isLatin,
  //       { inProtectedTag: false, inHeadingLike: false }
  //     );
  //     return {
  //       html: res.text,
  //       patternScore: res.patternScore,
  //       transformations: res.transformations,
  //       estimatedAiScore: estimateAiScore(html, res.text),
  //     };
  //   }

  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(
  //     `<!doctype html><html><body>${html}</body></html>`,
  //     "text/html"
  //   );
  //   const root = doc.body;

  //   let totalTransformations = 0;
  //   let totalPatternScore = 0;
  //   let textNodeCount = 0;

  //   const initialCtx: HumanizeContext = {
  //     inProtectedTag: false,
  //     inHeadingLike: false,
  //   };

  //   function humanizeNode(node: Node, ctx: HumanizeContext): void {
  //     if (node.nodeType === Node.TEXT_NODE) {
  //       const original = (node as Text).data;
  //       if (!original || !original.trim()) return;

  //       const res = processText(original, options, lang, isLatin, ctx);
  //       (node as Text).data = res.text;

  //       totalTransformations += res.transformations;
  //       totalPatternScore += res.patternScore;
  //       textNodeCount++;
  //       return;
  //     }

  //     if (node.nodeType === Node.ELEMENT_NODE) {
  //       const el = node as Element;
  //       const tag = el.tagName.toLowerCase();

  //       if (NO_TOUCH_TAGS.has(tag)) return;

  //       const isProtectedInline =
  //         PROTECTED_INLINE_TAGS.has(tag) ||
  //         (tag === "span" &&
  //           (el.className || "").toLowerCase().includes("keyword"));

  //       const isHeadingLike =
  //         HEADING_OR_LIST_TAGS.has(tag) ||
  //         (tag === "p" && ctx.inHeadingLike);

  //       const nextCtx: HumanizeContext = {
  //         inProtectedTag: ctx.inProtectedTag || isProtectedInline,
  //         inHeadingLike: ctx.inHeadingLike || isHeadingLike,
  //       };

  //       for (let i = 0; i < el.childNodes.length; i++) {
  //         humanizeNode(el.childNodes[i], nextCtx);
  //       }
  //     }
  //   }

  //   for (let i = 0; i < root.childNodes.length; i++) {
  //     humanizeNode(root.childNodes[i], initialCtx);
  //   }

  //   const avgPatternScore =
  //     textNodeCount > 0
  //       ? clamp(totalPatternScore / textNodeCount, 0, 1)
  //       : 1;

  //   const finalHtml = root.innerHTML;

  //   return {
  //     html: finalHtml,
  //     patternScore: avgPatternScore,
  //     transformations: totalTransformations,
  //     estimatedAiScore: estimateAiScore(html, finalHtml),
  //   };
  // }

  // /* ────────────────────────────────────────────────────────────
  // * Text Processing - NATURAL & CLEAN
  // * ──────────────────────────────────────────────────────────── */

  // interface ProtectedToken {
  //   placeholder: string;
  //   value: string;
  // }

  // function processText(
  //   text: string,
  //   options: HumanizeOptions,
  //   lang: string | undefined,
  //   isLatin: boolean,
  //   ctx: HumanizeContext
  // ): TextProcessResult {
  //   const original = text;

  //   const leading = original.match(/^[ \t]+/)?.[0] ?? "";
  //   const trailing = original.match(/[ \t]+$/)?.[0] ?? "";
  //   let core = original.slice(
  //     leading.length,
  //     original.length - trailing.length
  //   );

  //   if (!core.trim()) {
  //     return { text: original, transformations: 0, patternScore: 1 };
  //   }

  //   if (ctx.inProtectedTag) {
  //     const safe = core.replace(/[ \t]{3,}/g, " ");
  //     const finalText = leading + safe + trailing;
  //     return {
  //       text: finalText,
  //       transformations: finalText === original ? 0 : 1,
  //       patternScore: 1,
  //     };
  //   }

  //   const local: HumanizeOptions = { ...options };

  //   if (ctx.inHeadingLike) {
  //     local.strength = clamp(local.strength * 0.4, 0.2, 0.6);
  //     local.preserveReadability = true;
  //     local.naturalFlow = true;
  //     local.maxChangeRatio = Math.min(local.maxChangeRatio, 0.3);
  //   }

  //   let currentText = normalizeWhitespace(core);
  //   let transformations = 0;

  //   // Protect URLs, domains, emails
  //   const protection = protectStableTokens(currentText);
  //   currentText = protection.text;

  //   // Step 1: Remove AI boilerplate
  //   const boiler = removeBoilerplate(currentText, local.strength);
  //   currentText = boiler.text;
  //   transformations += boiler.count;

  //   if (isLatin && !ctx.inHeadingLike) {
  //     // Step 2: Add natural contractions
  //     const contr = addNaturalContractions(currentText, local.strength);
  //     currentText = contr.text;
  //     transformations += contr.count;

  //     // Step 3: Replace formal phrases with casual ones
  //     const casual = makeCasualPhrasing(currentText, local.strength);
  //     currentText = casual.text;
  //     transformations += casual.count;

  //     // Step 4: Vary word choice naturally
  //     const vary = varyWordChoice(currentText, local.strength);
  //     currentText = vary.text;
  //     transformations += vary.count;

  //     // Step 5: Add natural sentence variation
  //     const sent = varySentenceStructure(currentText, local.strength);
  //     currentText = sent.text;
  //     transformations += sent.count;

  //     // Step 6: Soften absolute language
  //     const soft = softenAbsoluteLanguage(currentText, local.strength);
  //     currentText = soft.text;
  //     transformations += soft.count;

  //     // Step 7: Add subtle human touches (MINIMAL)
  //     if (local.naturalFlow) {
  //       const human = addSubtleHumanTouch(currentText, local.strength * 0.3);
  //       currentText = human.text;
  //       transformations += human.count;
  //     }
  //   }

  //   // Clean up spacing
  //   currentText = cleanSpacing(currentText);

  //   // Restore protected tokens
  //   currentText = restoreStableTokens(currentText, protection.map);

  //   // Enforce max change
  //   if (local.maxChangeRatio > 0 && !ctx.inHeadingLike) {
  //     currentText = enforceMaxChangeRatio(
  //       core,
  //       currentText,
  //       local.maxChangeRatio
  //     );
  //   }

  //   const finalText = leading + currentText + trailing;
  //   const patternScore = estimatePatternScore(original, finalText);

  //   return {
  //     text: finalText,
  //     transformations,
  //     patternScore,
  //   };
  // }

  // /* ────────────────────────────────────────────────────────────
  // * Protection Functions
  // * ──────────────────────────────────────────────────────────── */

  // function protectStableTokens(
  //   text: string
  // ): { text: string; map: ProtectedToken[] } {
  //   const map: ProtectedToken[] = [];
  //   let out = text;
  //   let idx = 0;

  //   const patterns: RegExp[] = [
  //     /\bhttps?:\/\/[^\s<>'"]+/gi,
  //     /\bwww\.[^\s<>'"]+/gi,
  //     /\b[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+){1,}(?:\/[^\s<>'"]*)?/gi,
  //     /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}\b/gi,
  //   ];

  //   for (const re of patterns) {
  //     out = out.replace(re, (match) => {
  //       const placeholder = `__PROTECT_${idx++}__`;
  //       map.push({ placeholder, value: match });
  //       return placeholder;
  //     });
  //   }

  //   return { text: out, map };
  // }

  // function restoreStableTokens(text: string, map: ProtectedToken[]): string {
  //   let out = text;
  //   for (const { placeholder, value } of map) {
  //     out = out.replace(new RegExp(placeholder, "g"), value);
  //   }
  //   return out;
  // }

  // /* ────────────────────────────────────────────────────────────
  // * Natural Humanization Layers
  // * ──────────────────────────────────────────────────────────── */

  // function removeBoilerplate(
  //   text: string,
  //   strength: number
  // ): { text: string; count: number } {
  //   const replacements: Array<[RegExp, string | string[]]> = [
  //     [/\bin conclusion,?\s*/gi, ""],
  //     [/\bto conclude,?\s*/gi, ""],
  //     [/\bin summary,?\s*/gi, ""],
  //     [/\bthis article will explore\b/gi, ["we'll look at", "let's explore", "we'll cover"]],
  //     [/\bthroughout this article,?\s*/gi, ""],
  //     [/\bit is important to note that\b/gi, ["note that", "keep in mind", "remember"]],
  //     [/\bit is worth noting that\b/gi, ["worth noting", "interestingly", "notably"]],
  //     [/\bin today's digital age\b/gi, ["today", "nowadays", "these days"]],
  //     [/\bwith that being said,?\s*/gi, ["however", "but", "still"]],
  //     [/\bit should be noted that\b/gi, ["note that", "importantly", ""]],
  //     [/\bit is essential to\b/gi, ["you need to", "it's important to", "make sure to"]],
  //     [/\bit is crucial to\b/gi, ["it's important to", "you should", "make sure to"]],
  //     [/\bone must\b/gi, ["you should", "it's best to", "you need to"]],
  //     [/\bit can be seen that\b/gi, ["we can see", "clearly", ""]],
  //     [/\bit is evident that\b/gi, ["clearly", "obviously", ""]],
  //     [/\bas a matter of fact,?\s*/gi, ["actually", "in fact", ""]],
  //     [/\bneedless to say,?\s*/gi, ["obviously", ""]],
  //     [/\bit goes without saying,?\s*/gi, ["obviously", ""]],
  //     [/\bin order to\b/gi, "to"],
  //     [/\bin the event that\b/gi, "if"],
  //     [/\bdue to the fact that\b/gi, ["because", "since"]],
  //     [/\bfor the purpose of\b/gi, "to"],
  //     [/\bwith regard to\b/gi, ["about", "regarding"]],
  //     [/\bdelve into\b/gi, ["explore", "look at", "examine"]],
  //     [/\bshed light on\b/gi, ["explain", "clarify", "show"]],
  //     [/\bunleash the power of\b/gi, ["use", "leverage", "tap into"]],
  //     [/\bembark on a journey\b/gi, ["start", "begin"]],
  //     [/\bin the realm of\b/gi, ["in", "within", "regarding"]],
  //     [/\ba plethora of\b/gi, ["many", "numerous", "lots of"]],
  //     [/\bthe fact of the matter is\b/gi, ["basically", "the truth is", ""]],
  //     [/\bat the end of the day\b/gi, ["ultimately", "essentially", ""]],
  //   ];

  //   let out = text;
  //   let count = 0;

  //   for (const [pattern, repl] of replacements) {
  //     out = out.replace(pattern, () => {
  //       if (Math.random() > strength * 0.9) return "";
  //       count++;
  //       if (Array.isArray(repl)) {
  //         return repl[Math.floor(Math.random() * repl.length)];
  //       }
  //       return repl;
  //     });
  //   }

  //   return { text: out, count };
  // }

  // function addNaturalContractions(
  //   text: string,
  //   strength: number
  // ): { text: string; count: number } {
  //   let out = text;
  //   let count = 0;

  //   const replacements: Array<[RegExp, string | ((match: string, ...args: any[]) => string)]> = [
  //     [/ do not /gi, " don't "],
  //     [/ does not /gi, " doesn't "],
  //     [/ did not /gi, " didn't "],
  //     [/ cannot /gi, " can't "],
  //     [/ will not /gi, " won't "],
  //     [/ would not /gi, " wouldn't "],
  //     [/ should not /gi, " shouldn't "],
  //     [/ could not /gi, " couldn't "],
  //     [/ has not /gi, " hasn't "],
  //     [/ have not /gi, " haven't "],
  //     [/ had not /gi, " hadn't "],
  //     [/ is not /gi, " isn't "],
  //     [/ was not /gi, " wasn't "],
  //     [/ were not /gi, " weren't "],
  //     [/ are not /gi, " aren't "],
  //     [/\b(it|he|she|they|we|you|that) is\b/gi, (_m: string, p: string) => `${p}'s`],
  //     [/\b(they|we|you) are\b/gi, (_m: string, p: string) => `${p}'re`],
  //     [/\b(I) am\b/gi, "I'm"],
  //   ];

  //   for (const [pattern, repl] of replacements) {
  //     out = out.replace(pattern, (match, ...args) => {
  //       if (Math.random() > strength * 0.85) return match;
  //       count++;
  //       return typeof repl === "function" ? repl(match, ...args) : repl;
  //     });
  //   }

  //   return { text: out, count };
  // }

  // function makeCasualPhrasing(
  //   text: string,
  //   strength: number
  // ): { text: string; count: number } {
  //   const map: Array<[RegExp, string[]]> = [
  //     [/\bhowever,?\s*/gi, ["but", "though", "still", "yet"]],
  //     [/\bmoreover,?\s*/gi, ["also", "plus", "and", "besides"]],
  //     [/\bfurthermore,?\s*/gi, ["also", "plus", "additionally"]],
  //     [/\badditionally,?\s*/gi, ["also", "plus", "too"]],
  //     [/\btherefore,?\s*/gi, ["so", "thus", "that's why"]],
  //     [/\bconsequently,?\s*/gi, ["so", "as a result", "therefore"]],
  //     [/\bnevertheless,?\s*/gi, ["still", "but", "yet"]],
  //     [/\bnonetheless,?\s*/gi, ["still", "even so", "but"]],
  //   ];

  //   let out = text;
  //   let count = 0;

  //   for (const [pattern, options] of map) {
  //     out = out.replace(pattern, (match) => {
  //       if (Math.random() > strength * 0.8) return match;
  //       count++;
  //       const choice = options[Math.floor(Math.random() * options.length)];
  //       return preserveCase(match, choice + " ");
  //     });
  //   }

  //   return { text: out, count };
  // }

  // function varyWordChoice(
  //   text: string,
  //   strength: number
  // ): { text: string; count: number } {
  //   let out = text;
  //   let count = 0;

  //   const patterns: Array<[RegExp, string[]]> = [
  //     [/\butilize\b/gi, ["use", "employ", "apply"]],
  //     [/\bfacilitate\b/gi, ["help", "enable", "assist"]],
  //     [/\bleverage\b/gi, ["use", "utilize", "employ"]],
  //     [/\bimplement\b/gi, ["use", "apply", "adopt"]],
  //     [/\boptimize\b/gi, ["improve", "enhance", "refine"]],
  //     [/\bsignificant\b/gi, ["important", "major", "considerable"]],
  //     [/\bnumerous\b/gi, ["many", "several", "various"]],
  //     [/\bvarious\b/gi, ["different", "many", "several"]],
  //     [/\bsubsequently\b/gi, ["then", "later", "after"]],
  //     [/\bprior to\b/gi, ["before", "earlier than"]],
  //   ];

  //   for (const [pattern, choices] of patterns) {
  //     out = out.replace(pattern, (match) => {
  //       if (Math.random() > strength * 0.7) return match;
  //       count++;
  //       const choice = choices[Math.floor(Math.random() * choices.length)];
  //       return preserveCase(match, choice);
  //     });
  //   }

  //   return { text: out, count };
  // }

  // function varySentenceStructure(
  //   text: string,
  //   strength: number
  // ): { text: string; count: number } {
  //   const sentences = text.split(/\.\s+/);
  //   let count = 0;

  //   for (let i = 0; i < sentences.length - 1; i++) {
  //     const curr = sentences[i];
  //     const next = sentences[i + 1];

  //     // Merge very short consecutive sentences
  //     if (
  //       curr.length < 40 &&
  //       next &&
  //       next.length < 50 &&
  //       Math.random() < strength * 0.3
  //     ) {
  //       sentences[i] = `${curr}, and ${next.charAt(0).toLowerCase()}${next.slice(1)}`;
  //       sentences.splice(i + 1, 1);
  //       count++;
  //     }
  //   }

  //   return { text: sentences.join(". "), count };
  // }

  // function softenAbsoluteLanguage(
  //   text: string,
  //   strength: number
  // ): { text: string; count: number } {
  //   let out = text;
  //   let count = 0;

  //   const softeners: Array<[RegExp, string[]]> = [
  //     [/\balways\b/gi, ["often", "usually", "typically", "generally"]],
  //     [/\bnever\b/gi, ["rarely", "seldom", "hardly ever", "usually not"]],
  //     [/\bcompletely\b/gi, ["largely", "mostly", "generally"]],
  //     [/\babsolutely\b/gi, ["very", "quite", "really"]],
  //     [/\bentirely\b/gi, ["mostly", "largely", "generally"]],
  //     [/\btotally\b/gi, ["very", "quite", "really"]],
  //   ];

  //   for (const [pattern, options] of softeners) {
  //     out = out.replace(pattern, (match) => {
  //       if (Math.random() > strength * 0.6) return match;
  //       count++;
  //       const choice = options[Math.floor(Math.random() * options.length)];
  //       return preserveCase(match, choice);
  //     });
  //   }

  //   return { text: out, count };
  // }

  // function addSubtleHumanTouch(
  //   text: string,
  //   strength: number
  // ): { text: string; count: number } {
  //   const sentences = text.split(/\.\s+/);
  //   let count = 0;

  //   // Add occasional natural connectors (VERY SPARINGLY)
  //   const connectors = ["Actually", "Interestingly", "Notably"];

  //   for (let i = 1; i < sentences.length; i++) {
  //     if (
  //       sentences[i].length > 60 &&
  //       Math.random() < strength * 0.15
  //     ) {
  //       const conn = connectors[Math.floor(Math.random() * connectors.length)];
  //       sentences[i] = `${conn}, ${sentences[i].charAt(0).toLowerCase()}${sentences[i].slice(1)}`;
  //       count++;
  //     }
  //   }

  //   return { text: sentences.join(". "), count };
  // }

  // /* ────────────────────────────────────────────────────────────
  // * Helper Functions
  // * ──────────────────────────────────────────────────────────── */

  // function normalizeWhitespace(text: string): string {
  //   return text.replace(/\s+/g, " ").trim();
  // }

  // function cleanSpacing(text: string): string {
  //   let out = text;
  //   // Fix spacing around punctuation
  //   out = out.replace(/\s+([.,!?;:])/g, "$1");
  //   out = out.replace(/([.,!?;:])([^\s])/g, "$1 $2");
  //   // Remove excessive spaces
  //   out = out.replace(/\s{2,}/g, " ");
  //   return out.trim();
  // }

  // function estimatePatternScore(original: string, changed: string): number {
  //   if (!original || !changed) return 1;
  //   if (original === changed) return 1;

  //   const o = original.replace(/\s+/g, " ").trim();
  //   const c = changed.replace(/\s+/g, " ").trim();
  //   if (!o || !c) return 1;

  //   const minLen = Math.min(o.length, c.length);
  //   if (minLen === 0) return 1;

  //   let same = 0;
  //   for (let i = 0; i < minLen; i++) {
  //     if (o.charAt(i) === c.charAt(i)) same++;
  //   }

  //   return clamp(same / minLen, 0, 1);
  // }

  // function enforceMaxChangeRatio(
  //   original: string,
  //   changed: string,
  //   maxRatio: number
  // ): string {
  //   if (maxRatio <= 0) return changed;
  //   const oLen = original.length;
  //   const cLen = changed.length;
  //   const minLen = Math.min(oLen, cLen);
  //   if (minLen === 0 || oLen === 0) return changed;

  //   let diff = 0;
  //   for (let i = 0; i < minLen; i++) {
  //     if (original[i] !== changed[i]) diff++;
  //   }
  //   diff += Math.abs(oLen - cLen);

  //   const ratio = diff / oLen;
  //   if (ratio <= maxRatio) return changed;

  //   // Blend if too different
  //   const keepRatio = 0.5;
  //   const keepLen = Math.floor(oLen * keepRatio);
  //   const tailLen = Math.max(0, cLen - (oLen - keepLen));
  //   const tail = changed.slice(-tailLen);

  //   return [original.slice(0, keepLen), tail]
  //     .filter(Boolean)
  //     .join(" ")
  //     .trim();
  // }

  // function estimateAiScore(original: string, humanized: string): number {
  //   const similarity = estimatePatternScore(original, humanized);

  //   let humanMarkers = 0;
  //   humanMarkers += (humanized.match(/\b(don't|won't|can't|it's|that's|we're|they're)\b/gi) || []).length;
  //   humanMarkers += (humanized.match(/\b(actually|basically|often|usually|typically)\b/gi) || []).length;

  //   const sentences = humanized.split(/[.!?]\s+/);
  //   const lengths = sentences.map((s) => s.length || 0);
  //   const avg = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  //   const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / (lengths.length || 1);
  //   const burstiness = avg > 0 ? Math.sqrt(variance) / avg : 0;

  //   const baseScore = similarity * 100;
  //   const humanReduction = Math.min(humanMarkers * 3, 40);
  //   const burstReduction = Math.min(burstiness * 20, 30);

  //   return Math.max(0, Math.min(100, baseScore - humanReduction - burstReduction));
  // }

  // function clamp(n: number, min: number, max: number): number {
  //   return Math.max(min, Math.min(max, n));
  // }

  // function isMostlyLatinScript(text: string): boolean {
  //   const sample = text.slice(0, 800);
  //   let latin = 0;
  //   let nonLatin = 0;

  //   for (let i = 0; i < sample.length; i++) {
  //     const code = sample.charCodeAt(i);
  //     if (
  //       (code >= 0x0041 && code <= 0x005a) ||
  //       (code >= 0x0061 && code <= 0x007a)
  //     ) {
  //       latin++;
  //     } else if (code > 127 && code !== 160) {
  //       nonLatin++;
  //     }
  //   }

  //   if (latin === 0 && nonLatin === 0) return true;
  //   return latin >= nonLatin;
  // }

  // function detectLanguageFromContent(text: string): string | undefined {
  //   const sample = text.slice(0, 800);

  //   if (/[اأإءؤئ]/.test(sample)) return "ar";
  //   if (/[\u0900-\u097F]/.test(sample)) return "hi";
  //   if (/[\u4e00-\u9fff]/.test(sample)) return "zh";
  //   if (/[\u0400-\u04FF]/.test(sample)) return "ru";
  //   if (/[\u3040-\u30ff]/.test(sample)) return "ja";
  //   if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
  //   if (isMostlyLatinScript(sample)) return "en";

  //   return undefined;
  // }

  // function preserveCase(from: string, to: string): string {
  //   if (!from) return to;
  //   if (from[0] === from[0].toUpperCase()) {
  //     return to.charAt(0).toUpperCase() + to.slice(1);
  //   }
  //   return to;
  // }



//   import { useState, startTransition } from "react";

// /**
//  * Natural Humanizer v7 (Detector-aware, Clean)
//  *
//  * Goals:
//  * - Preserve meaning, structure, readability.
//  * - No weird extra symbols like ; : / ? $ ( ).
//  * - Gently remove AI-ish boilerplate + stock phrases.
//  * - Break robotic patterns: repetition, uniform tone, template intros.
//  * - Keep HTML, links, keywords, important spans completely safe.
//  */

// // Simple toast replacement (swap with your UI toast if needed)
// const toast = {
//   success: (msg: string) => console.log("✓", msg),
//   error: (msg: string) => console.error("✗", msg),
// };

// // LocalStorage helper (safe for browser-only usage)
// function useLocalStorage<T>(key: string, initialValue: T) {
//   const [storedValue, setStoredValue] = useState<T>(() => {
//     try {
//       if (typeof window === "undefined") return initialValue;
//       const item = window.localStorage.getItem(key);
//       return item ? JSON.parse(item) : initialValue;
//     } catch {
//       return initialValue;
//     }
//   });

//   const setValue = (value: T | ((val: T) => T)) => {
//     try {
//       const valueToStore =
//         value instanceof Function ? value(storedValue) : value;
//       setStoredValue(valueToStore);
//       if (typeof window !== "undefined") {
//         window.localStorage.setItem(key, JSON.stringify(valueToStore));
//       }
//     } catch {
//       // ignore
//     }
//   };

//   return [storedValue, setValue] as const;
// }

// export interface HumanizedContentItem {
//   id: string;
//   sourceId?: string;
//   originalHtml: string;
//   humanizedHtml: string;
//   createdAt: string;
//   meta?: {
//     patternScore?: number;
//     transformations?: number;
//     aiScore?: number;
//   };
// }

// export interface HumanizeOptions {
//   strength: number; // how hard to push (0–1)
//   preserveReadability: boolean;
//   maxChangeRatio: number; // max allowed diff vs original (0–1)
//   naturalFlow: boolean;
// }

// const DEFAULT_OPTIONS: HumanizeOptions = {
//   strength: 0.55,
//   preserveReadability: true,
//   maxChangeRatio: 0.35,
//   naturalFlow: true,
// };

// interface HumanizeContext {
//   inProtectedTag: boolean;
//   inHeadingLike: boolean;
// }

// const NO_TOUCH_TAGS = new Set([
//   "script",
//   "style",
//   "noscript",
//   "iframe",
//   "canvas",
//   "svg",
//   "pre",
//   "code",
// ]);

// const PROTECTED_INLINE_TAGS = new Set([
//   "b",
//   "strong",
//   "em",
//   "i",
//   "u",
//   "mark",
//   "kbd",
//   "samp",
//   "var",
//   "abbr",
//   "acronym",
//   "sub",
//   "sup",
//   "a",
// ]);

// const HEADING_OR_LIST_TAGS = new Set([
//   "h1",
//   "h2",
//   "h3",
//   "h4",
//   "h5",
//   "h6",
//   "li",
//   "ul",
//   "ol",
//   "dt",
//   "dd",
//   "th",
//   "td",
//   "caption",
// ]);

// /* ───────────── Hook ───────────── */

// export default function useHumanizeContent() {
//   const [isHumanizing, setIsHumanizing] = useState(false);
//   const [items, setItems] = useLocalStorage<HumanizedContentItem[]>(
//     "humanized-items_v7",
//     []
//   );

//   const humanizeHtml = async (
//     html: string,
//     opts?: Partial<HumanizeOptions>,
//     sourceId?: string
//   ): Promise<string> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

//     try {
//       if (!html || typeof html !== "string") return html;

//       const result = runHumanizer(html, options);

//       const record: HumanizedContentItem = {
//         id: `${
//           sourceId || "single"
//         }-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//         sourceId,
//         originalHtml: html,
//         humanizedHtml: result.html,
//         createdAt: new Date().toISOString(),
//         meta: {
//           patternScore: result.patternScore,
//           transformations: result.transformations,
//           aiScore: result.estimatedAiScore,
//         },
//       };

//       startTransition(() => {
//         setItems((prev = []) => [record, ...(prev || [])].slice(0, 500));
//       });

//       return result.html;
//     } catch (err) {
//       console.error("[HUMANIZE] failed:", err);
//       toast.error("Humanizer error: could not transform content.");
//       return html;
//     }
//   };

//   const humanizeMany = async (
//     batch: { id: string; html: string }[],
//     opts?: Partial<HumanizeOptions>
//   ): Promise<HumanizedContentItem[]> => {
//     const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };
//     if (!batch?.length) return [];

//     setIsHumanizing(true);
//     const out: HumanizedContentItem[] = [];

//     try {
//       for (const entry of batch) {
//         if (!entry?.html) continue;
//         const result = runHumanizer(entry.html, options);

//         const record: HumanizedContentItem = {
//           id: `${
//             entry.id || "batch"
//           }-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//           sourceId: entry.id,
//           originalHtml: entry.html,
//           humanizedHtml: result.html,
//           createdAt: new Date().toISOString(),
//           meta: {
//             patternScore: result.patternScore,
//             transformations: result.transformations,
//             aiScore: result.estimatedAiScore,
//           },
//         };

//         out.push(record);
//       }

//       if (out.length) {
//         startTransition(() => {
//           setItems((prev = []) => [...out, ...(prev || [])].slice(0, 500));
//         });
//         toast.success(`Humanized ${out.length} item(s).`);
//       }

//       return out;
//     } catch (err) {
//       console.error("[HUMANIZE] batch failed:", err);
//       toast.error("Failed to humanize batch.");
//       return out;
//     } finally {
//       setIsHumanizing(false);
//     }
//   };

//   const clearHumanized = () => {
//     startTransition(() => setItems([]));
//     toast.success("Cleared humanized content history.");
//   };

//   return {
//     isHumanizing,
//     items,
//     humanizeHtml,
//     humanizeMany,
//     clearHumanized,
//   };
// }

// /* ───────────── Core Humanizer ───────────── */

// interface HumanizerResult {
//   html: string;
//   patternScore: number;
//   transformations: number;
//   estimatedAiScore: number;
// }

// interface TextProcessResult {
//   text: string;
//   transformations: number;
//   patternScore: number;
// }

// function runHumanizer(html: string, options: HumanizeOptions): HumanizerResult {
//   if (!html) {
//     return { html, patternScore: 1, transformations: 0, estimatedAiScore: 0 };
//   }

//   const lang = detectLanguageFromContent(html);
//   const isLatin = isMostlyLatinScript(html);

//   // SSR fallback: treat as plain text
//   if (
//     typeof window === "undefined" ||
//     typeof (window as any).DOMParser === "undefined"
//   ) {
//     const res = processText(
//       html,
//       options,
//       lang,
//       isLatin,
//       { inProtectedTag: false, inHeadingLike: false }
//     );
//     return {
//       html: res.text,
//       patternScore: res.patternScore,
//       transformations: res.transformations,
//       estimatedAiScore: estimateAiScore(html, res.text),
//     };
//   }

//   const parser = new DOMParser();
//   const doc = parser.parseFromString(
//     `<!doctype html><html><body>${html}</body></html>`,
//     "text/html"
//   );
//   const root = doc.body;

//   let totalTransformations = 0;
//   let totalPatternScore = 0;
//   let textNodeCount = 0;

//   const initialCtx: HumanizeContext = {
//     inProtectedTag: false,
//     inHeadingLike: false,
//   };

//   function humanizeNode(node: Node, ctx: HumanizeContext): void {
//     if (node.nodeType === Node.TEXT_NODE) {
//       const original = (node as Text).data;
//       if (!original || !original.trim()) return;

//       const res = processText(original, options, lang, isLatin, ctx);
//       (node as Text).data = res.text;

//       totalTransformations += res.transformations;
//       totalPatternScore += res.patternScore;
//       textNodeCount++;
//       return;
//     }

//     if (node.nodeType === Node.ELEMENT_NODE) {
//       const el = node as Element;
//       const tag = el.tagName.toLowerCase();

//       if (NO_TOUCH_TAGS.has(tag)) return;

//       const isProtectedInline =
//         PROTECTED_INLINE_TAGS.has(tag) ||
//         (tag === "span" &&
//           (el.className || "").toLowerCase().includes("keyword"));

//       const isHeadingLike =
//         HEADING_OR_LIST_TAGS.has(tag) ||
//         (tag === "p" && ctx.inHeadingLike);

//       const nextCtx: HumanizeContext = {
//         inProtectedTag: ctx.inProtectedTag || isProtectedInline,
//         inHeadingLike: ctx.inHeadingLike || isHeadingLike,
//       };

//       for (let i = 0; i < el.childNodes.length; i++) {
//         humanizeNode(el.childNodes[i], nextCtx);
//       }
//     }
//   }

//   for (let i = 0; i < root.childNodes.length; i++) {
//     humanizeNode(root.childNodes[i], initialCtx);
//   }

//   const avgPatternScore =
//     textNodeCount > 0
//       ? clamp(totalPatternScore / textNodeCount, 0, 1)
//       : 1;

//   const finalHtml = root.innerHTML;

//   return {
//     html: finalHtml,
//     patternScore: avgPatternScore,
//     transformations: totalTransformations,
//     estimatedAiScore: estimateAiScore(html, finalHtml),
//   };
// }

// /* ───────────── Text Processing ───────────── */

// interface ProtectedToken {
//   placeholder: string;
//   value: string;
// }

// function processText(
//   text: string,
//   options: HumanizeOptions,
//   lang: string | undefined,
//   isLatin: boolean,
//   ctx: HumanizeContext
// ): TextProcessResult {
//   const original = text;

//   const leading = original.match(/^[ \t]+/)?.[0] ?? "";
//   const trailing = original.match(/[ \t]+$/)?.[0] ?? "";
//   let core = original.slice(
//     leading.length,
//     original.length - trailing.length
//   );

//   if (!core.trim()) {
//     return { text: original, transformations: 0, patternScore: 1 };
//   }

//   // Headers / protected inline → ultra minimal edits
//   if (ctx.inProtectedTag) {
//     const safe = core.replace(/[ \t]{3,}/g, " ");
//     const finalText = leading + safe + trailing;
//     return {
//       text: finalText,
//       transformations: finalText === original ? 0 : 1,
//       patternScore: 1,
//     };
//   }

//   const local: HumanizeOptions = { ...options };

//   if (ctx.inHeadingLike) {
//     local.strength = clamp(local.strength * 0.3, 0.1, 0.4);
//     local.maxChangeRatio = Math.min(local.maxChangeRatio, 0.2);
//     local.preserveReadability = true;
//     local.naturalFlow = true;
//   }

//   let currentText = normalizeWhitespace(core);
//   let transformations = 0;

//   // Protect URLs, domains, emails
//   const protection = protectStableTokens(currentText);
//   currentText = protection.text;

//   // 1) Strip AI boilerplate + template intros
//   const boiler = removeBoilerplate(currentText, local.strength);
//   currentText = boiler.text;
//   transformations += boiler.count;

//   const templates = stripTemplateIntros(currentText, local.strength);
//   currentText = templates.text;
//   transformations += templates.count;

//   if (isLatin && !ctx.inHeadingLike) {
//     // 2) Light natural contractions (no spam)
//     const contr = addNaturalContractions(currentText, local.strength);
//     currentText = contr.text;
//     transformations += contr.count;

//     // 3) Soften stiff connectors (however/moreover → simple)
//     const casual = makeCasualPhrasing(currentText, local.strength);
//     currentText = casual.text;
//     transformations += casual.count;

//     // 4) De-corporatize certain words (utilize → use)
//     const vary = varyWordChoice(currentText, local.strength);
//     currentText = vary.text;
//     transformations += vary.count;

//     // 5) Sentence pattern tweak: merge tiny back-to-back sentences
//     const sent = varySentenceStructure(currentText, local.strength);
//     currentText = sent.text;
//     transformations += sent.count;

//     // 6) Soften absolutes (always/never → often/rarely)
//     const soft = softenAbsoluteLanguage(currentText, local.strength);
//     currentText = soft.text;
//     transformations += soft.count;

//     // 7) Reduce repeated openers (Then, Additionally, Moreover…)
//     const openers = reduceRepetitiveOpeners(currentText, local.strength);
//     currentText = openers.text;
//     transformations += openers.count;
//   }

//   // Clean spacing / punctuation (no new weird chars)
//   currentText = cleanSpacing(currentText);

//   // Restore protected tokens
//   currentText = restoreStableTokens(currentText, protection.map);

//   // Enforce max change vs original
//   if (local.maxChangeRatio > 0 && !ctx.inHeadingLike) {
//     currentText = enforceMaxChangeRatio(core, currentText, local.maxChangeRatio);
//   }

//   const finalText = leading + currentText + trailing;
//   const patternScore = estimatePatternScore(original, finalText);

//   return {
//     text: finalText,
//     transformations,
//     patternScore,
//   };
// }

// /* ───────────── Protection ───────────── */

// function protectStableTokens(
//   text: string
// ): { text: string; map: ProtectedToken[] } {
//   const map: ProtectedToken[] = [];
//   let out = text;
//   let idx = 0;

//   const patterns: RegExp[] = [
//     /\bhttps?:\/\/[^\s<>'"]+/gi,
//     /\bwww\.[^\s<>'"]+/gi,
//     /\b[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+){1,}(?:\/[^\s<>'"]*)?/gi,
//     /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}\b/gi,
//   ];

//   for (const re of patterns) {
//     out = out.replace(re, (match) => {
//       const placeholder = `__P${idx++}__`;
//       map.push({ placeholder, value: match });
//       return placeholder;
//     });
//   }

//   return { text: out, map };
// }

// function restoreStableTokens(text: string, map: ProtectedToken[]): string {
//   let out = text;
//   for (const { placeholder, value } of map) {
//     out = out.replace(new RegExp(placeholder, "g"), value);
//   }
//   return out;
// }

// /* ───────────── Layers ───────────── */

// function removeBoilerplate(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   // Mostly REMOVE, rarely replace. No flashy phrases.
//   const rules: Array<[RegExp, string]> = [
//     [/\bin conclusion,?\s*/gi, ""],
//     [/\bto conclude,?\s*/gi, ""],
//     [/\bin summary,?\s*/gi, ""],
//     [/\bthroughout this article,?\s*/gi, ""],
//     [/\bin today's digital age\b/gi, ""],
//     [/\bwith that being said,?\s*/gi, ""],
//     [/\bit goes without saying that\b/gi, ""],
//     [/\bthe fact of the matter is\b/gi, ""],
//     [/\bat the end of the day\b/gi, ""],
//     [/\bneedless to say,?\s*/gi, ""],
//     [/\bas a matter of fact,?\s*/gi, ""],
//     [/\bin order to\b/gi, "to"],
//     [/\bdue to the fact that\b/gi, "because"],
//     [/\bfor the purpose of\b/gi, "to"],
//     [/\bwith regard to\b/gi, "regarding"],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, replacement] of rules) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength) return match;
//       count++;
//       return preserveCase(match, replacement);
//     });
//   }

//   return { text: out, count };
// }

// function stripTemplateIntros(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   // Remove classic AI intros: "In this article, we will...", etc.
//   const rules: RegExp[] = [
//     /\bIn this (article|guide|blog),?\s+(we|you)\s+(will\s+)?(explore|discuss|cover|look at)\s+/gi,
//     /\bThis (article|guide)\s+(will\s+)?(explore|discuss|cover)\s+/gi,
//     /\bLet's dive into\b/gi,
//   ];

//   let out = text;
//   let count = 0;

//   for (const pattern of rules) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength) return match;
//       count++;
//       return "";
//     });
//   }

//   return { text: out, count };
// }

// function addNaturalContractions(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const rules: Array<[RegExp, string | ((m: string, p: string) => string)]> = [
//     [/ do not /gi, " don't "],
//     [/ does not /gi, " doesn't "],
//     [/ cannot /gi, " can't "],
//     [/ will not /gi, " won't "],
//     [/ is not /gi, " isn't "],
//     [/ are not /gi, " aren't "],
//     [
//       /\b(it|he|she|they|we|you|that) is\b/gi,
//       (_m, p) => `${p}'s`,
//     ],
//     [
//       /\b(we|you|they) are\b/gi,
//       (_m, p) => `${p}'re`,
//     ],
//   ];

//   for (const [pattern, repl] of rules) {
//     out = out.replace(pattern, (match, p) => {
//       if (Math.random() > strength * 0.5) return match;
//       count++;
//       return typeof repl === "function" ? repl(match, p) : repl;
//     });
//   }

//   return { text: out, count };
// }

// function makeCasualPhrasing(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const rules: Array<[RegExp, string[]]> = [
//     [/\bhowever,?\s*/gi, ["but ", "however, "]],
//     [/\bmoreover,?\s*/gi, ["also, ", "also "]],
//     [/\bfurthermore,?\s*/gi, ["also, "]],
//     [/\badditionally,?\s*/gi, ["also, "]],
//     [/\btherefore,?\s*/gi, ["so ", "therefore, "]],
//   ];

//   let out = text;
//   let count = 0;

//   for (const [pattern, options] of rules) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.4) return match;
//       count++;
//       const choice = options[Math.floor(Math.random() * options.length)];
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// function varyWordChoice(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const rules: Array<[RegExp, string]> = [
//     [/\butilize\b/gi, "use"],
//     [/\bleverage\b/gi, "use"],
//     [/\bfacilitate\b/gi, "help"],
//     [/\bimplement\b/gi, "apply"],
//     [/\boptimize\b/gi, "improve"],
//     [/\bsubsequently\b/gi, "then"],
//     [/\bprior to\b/gi, "before"],
//     [/\bnumerous\b/gi, "many"],
//     [/\bvarious\b/gi, "many"],
//   ];

//   for (const [pattern, replacement] of rules) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.5) return match;
//       count++;
//       return preserveCase(match, replacement);
//     });
//   }

//   return { text: out, count };
// }

// function varySentenceStructure(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   const parts = text.split(/([.!?])/);
//   if (parts.length <= 2) return { text, count: 0 };

//   const rebuilt: string[] = [];
//   let count = 0;

//   for (let i = 0; i < parts.length; i += 2) {
//     const s = parts[i];
//     const sep = parts[i + 1] || "";
//     if (!s) continue;

//     const next = parts[i + 2];
//     const nextSep = parts[i + 3] || "";

//     if (
//       next &&
//       s.length < 40 &&
//       next.length < 45 &&
//       Math.random() < strength * 0.25
//     ) {
//       const merged =
//         s.replace(/\s+$/, "") +
//         ", and " +
//         next.charAt(0).toLowerCase() +
//         next.slice(1);
//       rebuilt.push(merged + (nextSep || "."));
//       i += 2;
//       count++;
//     } else {
//       rebuilt.push(s + (sep || ""));
//     }
//   }

//   return { text: rebuilt.join(" ").trim(), count };
// }

// function softenAbsoluteLanguage(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   let out = text;
//   let count = 0;

//   const rules: Array<[RegExp, string[]]> = [
//     [/\balways\b/gi, ["often", "usually"]],
//     [/\bnever\b/gi, ["rarely"]],
//     [/\bcompletely\b/gi, ["mostly"]],
//     [/\babsolutely\b/gi, ["very"]],
//     [/\bentirely\b/gi, ["mostly"]],
//     [/\btotally\b/gi, ["very"]],
//   ];

//   for (const [pattern, options] of rules) {
//     out = out.replace(pattern, (match) => {
//       if (Math.random() > strength * 0.3) return match;
//       count++;
//       const choice = options[Math.floor(Math.random() * options.length)];
//       return preserveCase(match, choice);
//     });
//   }

//   return { text: out, count };
// }

// function reduceRepetitiveOpeners(
//   text: string,
//   strength: number
// ): { text: string; count: number } {
//   // Kill obvious AI-y repeated section starts: "Additionally", "Moreover", "In addition"
//   const targets = [
//     "Additionally",
//     "Moreover",
//     "Furthermore",
//     "In addition",
//     "Overall",
//     "On the other hand",
//   ];

//   let out = text;
//   let count = 0;

//   for (const t of targets) {
//     const re = new RegExp(`(?:^|[.!?]\\s+)${t},?\\s+`, "g");
//     out = out.replace(re, (match) => {
//       if (Math.random() > strength * 0.4) return match;
//       count++;
//       return match.replace(t, "").trimStart();
//     });
//   }

//   return { text: out, count };
// }

// /* ───────────── Helpers ───────────── */

// function normalizeWhitespace(text: string): string {
//   return text.replace(/\s+/g, " ").trim();
// }

// function cleanSpacing(text: string): string {
//   let out = text;
//   out = out.replace(/\s+([.,!?])/g, "$1");
//   out = out.replace(/([.,!?])([^\s])/g, "$1 $2");
//   out = out.replace(/\s{2,}/g, " ");
//   return out.trim();
// }

// function estimatePatternScore(original: string, changed: string): number {
//   if (!original || !changed) return 1;
//   if (original === changed) return 1;

//   const o = original.replace(/\s+/g, " ").trim();
//   const c = changed.replace(/\s+/g, " ").trim();
//   if (!o || !c) return 1;

//   const minLen = Math.min(o.length, c.length);
//   if (minLen === 0) return 1;

//   let same = 0;
//   for (let i = 0; i < minLen; i++) {
//     if (o.charAt(i) === c.charAt(i)) same++;
//   }

//   return clamp(same / minLen, 0, 1);
// }

// function enforceMaxChangeRatio(
//   original: string,
//   changed: string,
//   maxRatio: number
// ): string {
//   if (maxRatio <= 0) return changed;

//   const oLen = original.length;
//   const cLen = changed.length;
//   if (oLen === 0 || cLen === 0) return changed;

//   const minLen = Math.min(oLen, cLen);
//   let diff = 0;

//   for (let i = 0; i < minLen; i++) {
//     if (original[i] !== changed[i]) diff++;
//   }
//   diff += Math.abs(oLen - cLen);

//   const ratio = diff / oLen;
//   return ratio <= maxRatio ? changed : original;
// }

// function estimateAiScore(original: string, humanized: string): number {
//   // Heuristic only (for debugging): lower is "more human-like"
//   const similarity = estimatePatternScore(original, humanized);

//   const sentences = humanized.split(/[.!?]\s+/);
//   const lengths = sentences.map((s) => s.length || 0);
//   const avg =
//     lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
//   const variance =
//     lengths.reduce((sum, len) => sum + (len - avg) * (len - avg), 0) /
//     (lengths.length || 1);
//   const burstiness = avg > 0 ? Math.sqrt(variance) / avg : 0;

//   const lowVarPenalty = burstiness < 0.25 ? 15 : 0;
//   const highSimPenalty = similarity > 0.9 ? 25 : similarity > 0.8 ? 15 : 0;

//   const score = lowVarPenalty + highSimPenalty;
//   return clamp(score, 0, 100);
// }

// function clamp(n: number, min: number, max: number): number {
//   return Math.max(min, Math.min(max, n));
// }

// function isMostlyLatinScript(text: string): boolean {
//   const sample = text.slice(0, 800);
//   let latin = 0;
//   let nonLatin = 0;

//   for (let i = 0; i < sample.length; i++) {
//     const code = sample.charCodeAt(i);
//     if (
//       (code >= 0x0041 && code <= 0x005a) ||
//       (code >= 0x0061 && code <= 0x007a)
//     ) {
//       latin++;
//     } else if (code > 127 && code !== 160) {
//       nonLatin++;
//     }
//   }

//   if (latin === 0 && nonLatin === 0) return true;
//   return latin >= nonLatin;
// }

// function detectLanguageFromContent(text: string): string | undefined {
//   const sample = text.slice(0, 800);

//   if (/[اأإءؤئ]/.test(sample)) return "ar";
//   if (/[\u0900-\u097F]/.test(sample)) return "hi";
//   if (/[\u4e00-\u9fff]/.test(sample)) return "zh";
//   if (/[\u0400-\u04FF]/.test(sample)) return "ru";
//   if (/[\u3040-\u30ff]/.test(sample)) return "ja";
//   if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
//   if (isMostlyLatinScript(sample)) return "en";
//   return undefined;
// }

// function preserveCase(from: string, to: string): string {
//   if (!from) return to;
//   if (from[0] === from[0].toUpperCase()) {
//     return to.charAt(0).toUpperCase() + to.slice(1);
//   }
//   return to;
// }



import { useState, startTransition } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";

/**
 * Humanizer v6
 *
 * Goals:
 * - Make model content read naturally & personally
 * - Preserve key semantics & critical tokens (brands, domains, URLs, numbers)
 * - Avoid weird artifacts ($, broken URLs, random brackets, unreadable noise)
 * - Light, controlled variation so text is unique & clean
 *
 * NOTE:
 * This is for readability & stylistic variety.
 * It does NOT guarantee bypassing any AI/plagiarism detector.
 */

export interface HumanizedContentItem {
  id: string;
  sourceId?: string;
  originalHtml: string;
  humanizedHtml: string;
  createdAt: string;
  meta?: {
    patternScore?: number;
    transformations?: number;
    diffScore?: number; // 0..1 how different from original
    aiScore?: number; // legacy-style: 0..100 (higher ~ closer to original)
  };
}

export interface HumanizeOptions {
  strength: number; // 0..1: how strong the transformation is
  allowImperfect: boolean; // allow mild informal flavour
  maxChangeRatio: number; // max fraction of chars allowed to change
  preserveSemantics: boolean;
  languageHint?: string;
  aggressiveMode?: boolean; // slightly stronger paraphrase (still clean)
}

const DEFAULT_OPTIONS: HumanizeOptions = {
  strength: 0.55,
  allowImperfect: true,
  maxChangeRatio: 0.55,
  preserveSemantics: true,
  languageHint: undefined,
  aggressiveMode: false,
};

interface HumanizerResult {
  html: string;
  patternScore: number;
  transformations: number;
  diffScore: number;
}

interface TextProcessResult {
  text: string;
  transformations: number;
  patternScore: number;
}

const NO_TOUCH_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "iframe",
  "canvas",
  "svg",
  "pre",
  "code",
]);

const PROTECTED_INLINE_TAGS = new Set([
  "b",
  "strong",
  "em",
  "i",
  "u",
  "mark",
  "kbd",
  "samp",
  "var",
  "abbr",
  "acronym",
  "sub",
  "sup",
  "a",
]);

const HEADING_OR_LIST_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "ul",
  "ol",
  "dt",
  "dd",
  "th",
  "td",
  "caption",
]);

interface HumanizeContext {
  inProtectedTag: boolean;
  inHeadingLike: boolean;
}

/* ────────────────────────────────────────────────────────────
 * Hook
 * ──────────────────────────────────────────────────────────── */

export default function useHumanizeContent() {
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [items, setItems] = useLocalStorage<HumanizedContentItem[]>(
    "humanized-items_v6",
    []
  );

  const humanizeHtml = async (
    html: string,
    opts?: Partial<HumanizeOptions>,
    sourceId?: string
  ): Promise<string> => {
    const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };

    try {
      if (!html || typeof html !== "string") return html;

      const result = runHumanizer(html, options);
      const diffScore = result.diffScore;
      const aiScore = clamp(100 * (1 - diffScore), 0, 100);

      const record: HumanizedContentItem = {
        id:
          `${sourceId || "single"}-` +
          `${Date.now()}-` +
          `${Math.random().toString(36).slice(2, 8)}`,
        sourceId,
        originalHtml: html,
        humanizedHtml: result.html,
        createdAt: new Date().toISOString(),
        meta: {
          patternScore: result.patternScore,
          transformations: result.transformations,
          diffScore,
          aiScore,
        },
      };

      startTransition(() => {
        setItems((prev = []) => [record, ...(prev || [])].slice(0, 400));
      });

      return result.html;
    } catch (err) {
      console.error("[HUMANIZE] failed:", err);
      toast.error("Humanizer error: content left as-is.");
      return html;
    }
  };

  const humanizeMany = async (
    batch: { id: string; html: string }[],
    opts?: Partial<HumanizeOptions>
  ): Promise<HumanizedContentItem[]> => {
    const options: HumanizeOptions = { ...DEFAULT_OPTIONS, ...(opts || {}) };
    if (!batch?.length) return [];

    setIsHumanizing(true);
    const out: HumanizedContentItem[] = [];

    try {
      for (const entry of batch) {
        if (!entry?.html) continue;

        const result = runHumanizer(entry.html, options);
        const diffScore = result.diffScore;
        const aiScore = clamp(100 * (1 - diffScore), 0, 100);

        const record: HumanizedContentItem = {
          id:
            `${entry.id || "batch"}-` +
            `${Date.now()}-` +
            `${Math.random().toString(36).slice(2, 8)}`,
          sourceId: entry.id,
          originalHtml: entry.html,
          humanizedHtml: result.html,
          createdAt: new Date().toISOString(),
          meta: {
            patternScore: result.patternScore,
            transformations: result.transformations,
            diffScore,
            aiScore,
          },
        };

        out.push(record);
      }

      if (out.length) {
        startTransition(() => {
          setItems((prev = []) => [...out, ...(prev || [])].slice(0, 400));
        });
        toast.success(`Humanized ${out.length} item(s).`);
      }

      return out;
    } catch (err) {
      console.error("[HUMANIZE] batch failed:", err);
      toast.error("Failed to humanize batch.");
      return out;
    } finally {
      setIsHumanizing(false);
    }
  };

  const clearHumanized = () => {
    startTransition(() => setItems([]));
    toast.success("Cleared humanized content history.");
  };

  return {
    isHumanizing,
    items,
    humanizeHtml,
    humanizeMany,
    clearHumanized,
  };
}

/* ────────────────────────────────────────────────────────────
 * Core Humanizer
 * ──────────────────────────────────────────────────────────── */

function runHumanizer(html: string, options: HumanizeOptions): HumanizerResult {
  if (!html) {
    return {
      html,
      patternScore: 1,
      transformations: 0,
      diffScore: 0,
    };
  }

  const lang = options.languageHint || detectLanguageFromContent(html);
  const isLatin = isMostlyLatinScript(html);

  // Fallback for SSR/non-DOM: treat as single text block
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    const res = processText(html, options, lang, isLatin, {
      inProtectedTag: false,
      inHeadingLike: false,
    });
    return {
      html: res.text,
      patternScore: clamp(res.patternScore, 0, 1),
      transformations: res.transformations,
      diffScore: estimateDiffScore(html, res.text),
    };
  }

  // Browser path: parse HTML & walk nodes
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<!doctype html><html><body>${html}</body></html>`,
    "text/html"
  );
  const root = doc.body;

  let totalTransformations = 0;
  let totalPatternScore = 0;
  let textNodeCount = 0;

  const initialCtx: HumanizeContext = {
    inProtectedTag: false,
    inHeadingLike: false,
  };

  function humanizeNode(node: Node, ctx: HumanizeContext): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const original = (node as Text).data;
      if (!original || !original.trim()) return;

      const res = processText(original, options, lang, isLatin, ctx);
      (node as Text).data = res.text;

      totalTransformations += res.transformations;
      totalPatternScore += res.patternScore;
      textNodeCount++;
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName.toLowerCase();

      if (NO_TOUCH_TAGS.has(tag)) return;

      const isProtectedInline =
        PROTECTED_INLINE_TAGS.has(tag) ||
        (tag === "span" &&
          (el.className || "").toLowerCase().includes("keyword"));

      const isHeadingLike =
        HEADING_OR_LIST_TAGS.has(tag) ||
        (tag === "p" && ctx.inHeadingLike);

      const nextCtx: HumanizeContext = {
        inProtectedTag: ctx.inProtectedTag || isProtectedInline,
        inHeadingLike: ctx.inHeadingLike || isHeadingLike,
      };

      for (let i = 0; i < el.childNodes.length; i++) {
        humanizeNode(el.childNodes[i], nextCtx);
      }
    }
  }

  for (let i = 0; i < root.childNodes.length; i++) {
    humanizeNode(root.childNodes[i], initialCtx);
  }

  const avgPatternScore =
    textNodeCount > 0
      ? clamp(totalPatternScore / textNodeCount, 0, 1)
      : 1;

  const finalHtml = root.innerHTML;

  return {
    html: finalHtml,
    patternScore: avgPatternScore,
    transformations: totalTransformations,
    diffScore: estimateDiffScore(html, finalHtml),
  };
}

/* ────────────────────────────────────────────────────────────
 * Text Processing Pipeline
 * ──────────────────────────────────────────────────────────── */

function processText(
  text: string,
  options: HumanizeOptions,
  lang: string | undefined,
  isLatin: boolean,
  ctx: HumanizeContext
): TextProcessResult {
  const original = text;

  const leading = original.match(/^[ \t]+/)?.[0] ?? "";
  const trailing = original.match(/[ \t]+$/)?.[0] ?? "";
  let core = original.slice(leading.length, original.length - trailing.length);

  if (!core.trim()) {
    return { text: original, transformations: 0, patternScore: 1 };
  }

  let transformations = 0;

  // Text inside protected inline (e.g. <a>, <strong>): only tiny spacing fixes
  if (ctx.inProtectedTag) {
    const safe = core.replace(/[ \t]{3,}/g, "  ");
    if (safe !== core) transformations++;
    return {
      text: leading + safe + trailing,
      transformations,
      patternScore: 1,
    };
  }

  const local: HumanizeOptions = { ...options };

  if (ctx.inHeadingLike) {
    // Very conservative in headings / table cells
    local.strength = Math.min(local.strength, 0.25);
    local.maxChangeRatio = Math.min(local.maxChangeRatio, 0.25);
    local.allowImperfect = false;
    local.aggressiveMode = false;
  }

  // Protect domains/URLs/emails so they never get broken
  const protection = protectStableTokens(core);
  let currentText = normalizeWhitespaceSoft(protection.text);

  // 1) Remove boilerplate / clichés
  const boiler = killBoilerplate(currentText);
  currentText = boiler.text;
  transformations += boiler.count;

  if (isLatin) {
    // 2) Light synonym/wording variation
    const synonyms = varyWordChoice(currentText, local.strength, local.aggressiveMode);
    currentText = synonyms.text;
    transformations += synonyms.count;

    // 3) Contractions (natural speech)
    const contract = addContractions(currentText, local.strength);
    currentText = contract.text;
    transformations += contract.count;

    // 4) Softer transitions
    const connectors = softenFormalTransitions(currentText, local.strength);
    currentText = connectors.text;
    transformations += connectors.count;

    // 5) Sentence rhythm (split too-long, merge tiny)
    const rhythm = adjustSentenceRhythm(currentText, local.strength);
    currentText = rhythm.text;
    transformations += rhythm.count;
  } else {
    // Non-Latin: only soften absolutes
    const soften = softenDefinitiveLanguage(currentText, local.strength);
    currentText = soften.text;
    transformations += soften.count;
  }

  // 6) Very light quirks (no spam) for Latin langs
  if (local.allowImperfect && !ctx.inHeadingLike && isLatin) {
    const quirks = injectLightHumanQuirks(currentText, local.strength, lang);
    currentText = quirks.text;
    transformations += quirks.count;
  }

  // Cleanup spacing / punctuation
  currentText = fixSpacingClean(currentText);

  // Restore protected tokens (e.g. yashnihalani.netlify.app)
  currentText = restoreStableTokens(currentText, protection.map);

  // Fix any unbalanced parentheses
  currentText = fixDanglingParens(currentText);

  // Enforce max change ratio so meaning/shape stays intact
  if (local.maxChangeRatio > 0) {
    currentText = enforceMaxChangeRatio(core, currentText, local.maxChangeRatio);
  }

  const finalText = leading + currentText + trailing;
  const patternScore = estimatePatternScore(original, finalText);

  return {
    text: finalText,
    transformations,
    patternScore,
  };
}

/* ────────────────────────────────────────────────────────────
 * Stable token protection (brands, URLs, etc.)
 * ──────────────────────────────────────────────────────────── */

function protectStableTokens(text: string): { text: string; map: string[] } {
  const map: string[] = [];
  let out = text;

  const patterns: RegExp[] = [
    /https?:\/\/[^\s<>"']+/gi,
    /[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s<>"']*)?/gi,
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
  ];

  for (const re of patterns) {
    out = out.replace(re, (match) => {
      const key = `__PROTECTED_${map.length}__`;
      map.push(match);
      return key;
    });
  }

  return { text: out, map };
}

function restoreStableTokens(text: string, map: string[]): string {
  let out = text;
  map.forEach((value, index) => {
    const key = new RegExp(`__PROTECTED_${index}__`, "g");
    out = out.replace(key, value);
  });
  return out;
}

/* ────────────────────────────────────────────────────────────
 * Transformations (clean & controlled)
 * ──────────────────────────────────────────────────────────── */

function killBoilerplate(text: string): { text: string; count: number } {
  const replacements: Array<[RegExp, string]> = [
    [/in conclusion[, ]*/gi, "To wrap up, "],
    [/to conclude[, ]*/gi, "To sum it up, "],
    [/in summary[, ]*/gi, "In short, "],
    [/throughout this article[, ]*/gi, ""],
    [/in this (guide|article)[, ]*/gi, ""],
    [/needless to say[, ]*/gi, ""],
    [/it goes without saying[, ]*/gi, ""],
    [/at the end of the day[, ]*/gi, "Ultimately, "],
    [/in today's (digital )?age[, ]*/gi, "These days, "],
  ];

  let out = text;
  let count = 0;

  for (const [pattern, repl] of replacements) {
    const before = out;
    out = out.replace(pattern, repl);
    if (out !== before) count++;
  }

  return { text: out, count };
}

function varyWordChoice(
  text: string,
  strength: number,
  aggressive?: boolean
): { text: string; count: number } {
  if (strength <= 0) return { text, count: 0 };

  let out = text;
  let count = 0;
  const factor = aggressive ? 0.9 : 0.45;

  const patterns: Array<[RegExp, string[]]> = [
    [/utilize/gi, ["use", "work with"]],
    [/leverage/gi, ["use", "rely on"]],
    [/significant/gi, ["important", "big"]],
    [/ensure/gi, ["make sure", "confirm"]],
    [/robust/gi, ["solid", "reliable"]],
    [/comprehensive/gi, ["detailed", "thorough"]],
    [/optimize/gi, ["improve", "refine"]],
    [/numerous/gi, ["many", "plenty of"]],
    [/various/gi, ["different", "a mix of"]],
  ];

  for (const [pattern, choices] of patterns) {
    out = out.replace(pattern, (match) => {
      if (Math.random() > strength * factor) return match;
      count++;
      const choice = choices[Math.floor(Math.random() * choices.length)];
      return preserveCase(match, choice);
    });
  }

  return { text: out, count };
}

function addContractions(
  text: string,
  strength: number
): { text: string; count: number } {
  if (strength <= 0.1) return { text, count: 0 };

  let out = text;
  let count = 0;

  const groupPatterns: Array<[RegExp, (m: string, p1: string) => string]> = [
    [/(\b[Ii]t) is\b/g, (_m, p1) => `${p1}'s`],
    [/(\b[Tt]here) is\b/g, (_m, p1) => `${p1}'s`],
  ];

  for (const [pattern, fn] of groupPatterns) {
    out = out.replace(pattern, (match, p1) => {
      if (Math.random() > strength * 0.6) return match;
      count++;
      return fn(match, p1);
    });
  }

  const simplePatterns: Array<[RegExp, string]> = [
    [/ do not /gi, " don't "],
    [/ does not /gi, " doesn't "],
    [/ can not /gi, " can't "],
    [/ will not /gi, " won't "],
    [/ is not /gi, " isn't "],
    [/ are not /gi, " aren't "],
    [/ has not /gi, " hasn't "],
    [/ have not /gi, " haven't "],
  ];

  for (const [pattern, repl] of simplePatterns) {
    out = out.replace(pattern, (match) => {
      if (Math.random() > strength * 0.5) return match;
      count++;
      return repl;
    });
  }

  return { text: out, count };
}

function softenFormalTransitions(
  text: string,
  strength: number
): { text: string; count: number } {
  let out = text;
  let count = 0;

  const patterns: Array<[RegExp, string[]]> = [
    [/however,/gi, ["But,", "Still,", "That said,"]],
    [/moreover,/gi, ["Plus,", "Also,", "On top of that,"]],
    [/furthermore,/gi, ["Also,", "Besides,"]],
    [/additionally,/gi, ["Also,", "Plus,"]],
    [/therefore,/gi, ["So,", "Because of that,"]],
    [/consequently,/gi, ["So,", "As a result,"]],
  ];

  for (const [pattern, choices] of patterns) {
    out = out.replace(pattern, (match) => {
      if (Math.random() > strength * 0.5) return match;
      count++;
      const choice = choices[Math.floor(Math.random() * choices.length)];
      return preserveCase(match, choice);
    });
  }

  return { text: out, count };
}

function adjustSentenceRhythm(
  text: string,
  strength: number
): { text: string; count: number } {
  const trimmed = text.trim();
  if (!trimmed) return { text, count: 0 };

  const parts = trimmed
    .split(/([.!?])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (!parts.length) return { text, count: 0 };

  const result: string[] = [];
  let count = 0;

  for (let i = 0; i < parts.length; i += 2) {
    const sentence = (parts[i] || "").trim();
    const punct = parts[i + 1] || ".";

    if (!sentence) continue;

    // Split very long sentence at comma near 1/3
    if (sentence.length > 220 && Math.random() < strength * 0.4) {
      const idx = sentence.indexOf(",", Math.floor(sentence.length / 3));
      if (idx > 40 && idx < sentence.length - 40) {
        const first = sentence.slice(0, idx).trim();
        const second = sentence.slice(idx + 1).trim();
        if (first) result.push(first + punct);
        if (second)
          result.push(
            second.charAt(0).toUpperCase() + second.slice(1) + "."
          );
        count++;
        continue;
      }
    }

    // Merge two very short sentences
    if (
      sentence.length < 40 &&
      i + 3 < parts.length &&
      Math.random() < strength * 0.25
    ) {
      const nextSentence = (parts[i + 2] || "").trim();
      const nextPunct = parts[i + 3] || ".";
      if (nextSentence && nextSentence.length < 60) {
        const merged =
          sentence.replace(/[.!?]+$/, "") +
          ", " +
          nextSentence.charAt(0).toLowerCase() +
          nextSentence.slice(1) +
          nextPunct;
        result.push(merged);
        count++;
        i += 2;
        continue;
      }
    }

    result.push(sentence + punct);
  }

  return { text: result.join(" "), count };
}

function injectLightHumanQuirks(
  text: string,
  strength: number,
  lang?: string
): { text: string; count: number } {
  let out = text;
  let count = 0;

  if (strength <= 0.2) return { text, count };

  if (!lang || /^en|es|fr|de|pt|it|nl|ro|pl|tr$/i.test(lang)) {
    out = out.replace(
      /\b(definitely|certainly|clearly|absolutely)\b/gi,
      (m) => {
        if (Math.random() > strength * 0.35) return m;
        count++;
        const choices = [
          "pretty much",
          "in most cases",
          "generally",
          "often",
          "usually",
        ];
        return choices[Math.floor(Math.random() * choices.length)];
      }
    );
  }

  return { text: out, count };
}

function softenDefinitiveLanguage(
  text: string,
  strength: number
): { text: string; count: number } {
  let out = text;
  let count = 0;

  out = out.replace(/\b(always|never)\b/gi, (m) => {
    if (Math.random() > strength * 0.3) return m;
    count++;
    return m.toLowerCase() === "always" ? "often" : "rarely";
  });

  return { text: out, count };
}

/* ────────────────────────────────────────────────────────────
 * Spacing / punctuation cleanup
 * ──────────────────────────────────────────────────────────── */

function normalizeWhitespaceSoft(text: string): string {
  return text.replace(/[ \t]{3,}/g, "  ");
}

function fixSpacingClean(text: string): string {
  let out = text;

  // Ensure space after punctuation when needed
  out = out.replace(/([.,!?;:])(?![\s\n\r\t"')\]}])/g, "$1 ");

  // Collapse 3+ spaces to max 2
  out = out.replace(/ {3,}/g, "  ");

  // Normalize long ellipsis
  out = out.replace(/\.{4,}/g, "...");

  // Remove spaces before punctuation
  out = out.replace(/\s+([.,!?;:])/g, "$1");

  return out;
}

function fixDanglingParens(text: string): string {
  let out = text;
  const openCount = (out.match(/\(/g) || []).length;
  const closeCount = (out.match(/\)/g) || []).length;

  if (closeCount > openCount) {
    let diff = closeCount - openCount;
    out = out
      .split("")
      .reverse()
      .map((ch) => {
        if (ch === ")" && diff > 0) {
          diff--;
          return "";
        }
        return ch;
      })
      .reverse()
      .join("");
  } else if (openCount > closeCount) {
    out += ")".repeat(openCount - closeCount);
  }

  return out;
}

/* ────────────────────────────────────────────────────────────
 * Diff / scoring helpers
 * ──────────────────────────────────────────────────────────── */

function estimatePatternScore(original: string, changed: string): number {
  if (!original || !changed) return 1;
  if (original === changed) return 1;

  const o = original.replace(/\s+/g, " ").trim();
  const c = changed.replace(/\s+/g, " ").trim();
  if (!o || !c) return 1;

  const minLen = Math.min(o.length, c.length);
  if (minLen === 0) return 1;

  let same = 0;
  for (let i = 0; i < minLen; i++) {
    if (o.charAt(i) === c.charAt(i)) same++;
  }

  const similarity = same / minLen;
  const lengthDiff =
    Math.abs(o.split(" ").length - c.split(" ").length) /
    Math.max(o.split(" ").length, 1);

  const penalty = lengthDiff * 0.15;
  return clamp(similarity - penalty, 0, 1);
}

/** 0..1, higher = more different */
function estimateDiffScore(original: string, changed: string): number {
  if (!original || !changed) return 0;
  if (original === changed) return 0;

  const o = original.replace(/\s+/g, " ").trim();
  const c = changed.replace(/\s+/g, " ").trim();
  if (!o || !c) return 0;

  const minLen = Math.min(o.length, c.length);
  let diff = Math.abs(o.length - c.length);

  for (let i = 0; i < minLen; i++) {
    if (o[i] !== c[i]) diff++;
  }

  return clamp(diff / Math.max(o.length, 1), 0, 1);
}

function enforceMaxChangeRatio(
  original: string,
  changed: string,
  maxRatio: number
): string {
  if (maxRatio <= 0) return changed;

  const o = original;
  const c = changed;
  const oLen = o.length;
  const cLen = c.length;
  const minLen = Math.min(oLen, cLen);
  if (!oLen || !cLen) return changed;

  let diff = Math.abs(oLen - cLen);
  for (let i = 0; i < minLen; i++) {
    if (o[i] !== c[i]) diff++;
  }

  const ratio = diff / oLen;
  if (ratio <= maxRatio) return changed;

  const keepHead = Math.floor(oLen * 0.55);
  const tail = c.slice(-Math.max(0, cLen - keepHead));

  return [o.slice(0, keepHead), tail].filter(Boolean).join(" ").trim();
}

/* ────────────────────────────────────────────────────────────
 * Language / script detection helpers
 * ──────────────────────────────────────────────────────────── */

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function isMostlyLatinScript(text: string): boolean {
  const sample = text.slice(0, 800);
  let latin = 0;
  let nonLatin = 0;

  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (
      (code >= 0x0041 && code <= 0x005a) ||
      (code >= 0x0061 && code <= 0x007a)
    ) {
      latin++;
    } else if (code > 127 && code !== 160) {
      nonLatin++;
    }
  }

  if (latin === 0 && nonLatin === 0) return true;
  return latin >= nonLatin;
}

function detectLanguageFromContent(text: string): string | undefined {
  const sample = text.slice(0, 800);

  if (/[اأإءؤئ]/.test(sample)) return "ar";
  if (/[\u0900-\u097F]/.test(sample)) return "hi";
  if (/[\u4e00-\u9fff]/.test(sample)) return "zh";
  if (/[\u0400-\u04FF]/.test(sample)) return "ru";
  if (/[\u3040-\u30ff]/.test(sample)) return "ja";
  if (/[\uAC00-\uD7AF]/.test(sample)) return "ko";
  if (isMostlyLatinScript(sample)) return "en";

  return undefined;
}

function preserveCase(from: string, to: string): string {
  if (!from) return to;
  if (from[0] === from[0].toUpperCase()) {
    return to.charAt(0).toUpperCase() + to.slice(1);
  }
  return to;
}
