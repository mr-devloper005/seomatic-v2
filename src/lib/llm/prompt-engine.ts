// // src/lib/llm/prompt.ts (or wherever you keep it)
// export function buildPromptInstructions({
//   keywords,
//   targetWords,
//   extraInstructions,
// }: {
//   keywords: string[];
//   targetWords: 200 | 500 | 700 | 900;
//   extraInstructions?: string;
// }) {
//   const kwTokens = keywords.map((k) => `[ANCHOR:${k}]`).join(" ");

//   let placement = "Place tokens in section 1 only.";
//   if (keywords.length === 2) placement = "Place tokens in section 1 and section 3 (one per section).";
//   else if (keywords.length >= 4) placement = "Place tokens in sections 1, 2, 3, and 4 respectively (one per section).";

//   // EXACT structure requirement → prevents “undefined” sections and missing headings.
//   // Also, we *forbid* echoing prompt lines into HTML.
//   return [
//     `Return ONLY JSON with keys "title" and "html". No markdown fences.`,
//     `Language: British English unless explicitly overridden in "Extra".`,
//     `Title: 60–70 characters, natural (not just the keyword).`,

//     // ***** HARD HTML SHAPE *******
//     `HTML must contain EXACTLY 5 content sections followed by one Conclusion.`,
//     `Every content section must be:
// <h3><strong>Section Heading</strong></h3>
// <p>One paragraph of 100–120 words. No lists, no sub-headings, no images.</p>`,
//     `Conclusion must be:
// <h3><strong>Conclusion</strong></h3>
// <p>One short paragraph (60–80 words). No tokens in the Conclusion.</p>`,

//     // ***** TOKENS *******
//     `Insert each machine-visible token exactly once, inside body sections only (never in Conclusion): ${kwTokens}`,
//     placement,

//     // ***** DO-NOT-ECHO *****
//     `NEVER copy or paraphrase instruction or meta text into "html". Do not include lines such as "Be specific and concrete", "Focus on clarity", "Return ONLY JSON", etc.`,
//     `No placeholder text such as "undefined". If unsure, still write a full, readable paragraph.`,

//     // ***** Output rules *****
//     `Output clean HTML only inside "html"; no code blocks; no markdown fences.`,
//     `Extra (highest priority from user): ${extraInstructions || "(none)"}`,
//   ].join("\n");
// }



// import type { ContentPreferences, ParagraphWordTarget, SectionCount } from "@/hooks/use-preferences";

// function tokenPlacementGuide(keywords: string[]) {
//   if (keywords.length === 1) return "Place token in Section 1 only.";
//   if (keywords.length === 2) return "Place the first token in Section 1 and the second token in Section 3.";
//   return "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
// }

// function moodDirectives(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":
//       return "Tone: lively, story-driven, light wit; avoid slapstick. Use concrete examples and vivid, human details.";
//     case "Informative":
//       return "Tone: clear, practical, straight to the point. Prioritise accuracy, steps, and tiny numbers where useful.";
//     case "Inspirational":
//       return "Tone: warm, encouraging, realistic optimism. Avoid clichés; ground claims with specific, small actions.";
//     case "Humorous":
//       return "Tone: gentle humour, subtle asides. Never overdo jokes; clarity first.";
//     case "Emotional":
//       return "Tone: empathetic, candid, human. Name trade-offs; use sensory details sparingly.";
//     case "Educational":
//       return "Tone: structured, didactic, learner-friendly. Define terms briefly and build from simple to specific.";
//   }
// }

// function bounds(target: ParagraphWordTarget): { min: number; max: number } {
//   // ±10% window gives the model some tolerance; post-processing will clamp anyway
//   const min = Math.floor(target * 0.92);
//   const max = Math.ceil(target * 1.10);
//   return { min, max };
// }
// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }) {
//   const { keywords, prefs, variationId } = params;

//   // ✅ now used
//   const { min, max } = bounds(prefs.paragraphWords);

//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
//   const placement = tokenPlacementGuide(keywords);

//   const langLine =
//     prefs.language && prefs.language.trim().length > 0
//       ? `Language: Write entirely in ${prefs.language}.`
//       : `Language: English.`;

//   const conclusionLines = prefs.includeConclusion
//     ? [
//         `End with exactly one Conclusion section:`,
//         `<h1>Conclusion</h1>`,
//         // ✅ use min/max so the range is explicit
//         `<p>One paragraph (target ${prefs.paragraphWords} words; acceptable ${min}–${max} words). No tokens inside the Conclusion.</p>`,
//       ]
//     : [
//         `Do NOT include any Conclusion section.`,
//       ];

//   // ✅ use min/max here too
//   const sectionsLine =
//     `Write exactly ${prefs.sectionCount} content sections. ` +
//     `Each section MUST be: <h1>Section Title</h1> immediately followed by one <p> paragraph (target ${prefs.paragraphWords} words; acceptable ${min}–${max} words).`;

//   const plan = [
//     `Return ONLY JSON with keys "title" and "html". No Markdown fences or code blocks.`,
//     langLine,
//     `Title: 60–70 characters, natural (not just the keyword).`,
//     `Style: ${moodDirectives(prefs.mood)} Keep it human and concrete (tiny numbers like ±0.3 mm, ~500 KB, 15–20 min where helpful). Avoid meta-instructions.`,
//     sectionsLine,
//     ...conclusionLines,
//     `Insert these machine-visible tokens exactly once each (never inside the Conclusion): ${tokens}`,
//     placement,
//     `Subtle variation hint: Use a distinct micro-scenario and angle for Variation #${variationId}.`,
//     `NEVER copy or paraphrase any of these instructions into "html".`,
//     `Extra (highest priority from user): ${prefs.extraInstructions || "(none)"}`,
//   ].join("\n");

//   return plan;
// }


import type { ContentPreferences } from "@/hooks/use-preferences";

type LangCode = "en" | "hi" | "ru";

function langCode(s?: string): LangCode {
  const t = (s || "").toLowerCase().trim();
  if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
  if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
  return "en";
}

function conclusionHeading(lc: LangCode): string {
  switch (lc) {
    case "hi": return "निष्कर्ष";
    case "ru": return "Заключение";
    default:   return "Conclusion";
  }
}

function languageDirectives(lc: LangCode) {
  if (lc === "ru") {
    return [
      `Language: Russian only (Cyrillic script).`,
      `Do NOT mix English or transliterations. Keep all headings and body in Russian (Cyrillic).`,
    ].join(" ");
  }
  if (lc === "hi") {
    return [
      `Language: Hindi only (Devanagari script).`,
      `Do NOT mix English or transliterations. Keep all headings and body in Hindi (Devanagari).`,
    ].join(" ");
  }
  return `Language: English only. Do NOT mix other languages.`;
}

function moodDirectives(mood: ContentPreferences["mood"]) {
  switch (mood) {
    case "Entertaining":  return "Tone: lively, story-driven, light wit; avoid slapstick. Use vivid, human details.";
    case "Informative":   return "Tone: clear, practical, straight to the point. Prioritise accuracy and small, concrete numbers.";
    case "Inspirational": return "Tone: warm, encouraging, realistic optimism. Avoid clichés; prefer specific actions.";
    case "Humorous":      return "Tone: gentle humour, subtle asides. Clarity first; jokes sparingly.";
    case "Emotional":     return "Tone: empathetic, candid, sensory details used sparingly.";
    case "Educational":   return "Tone: structured, didactic, learner-friendly. Define terms briefly and build up.";
  }
}

function bounds(target?: number): { min: number; max: number; target: number } {
  const t = Math.max(40, Number(target || 100));
  const min = Math.floor(t * 0.92);
  const max = Math.ceil(t * 1.10);
  return { min, max, target: t };
}

function tokenPlacementGuide(keywords: string[]) {
  if (keywords.length === 1) return "Place token in Section 1 only.";
  if (keywords.length === 2) return "Place the first token in Section 1 and the second token in Section 3.";
  return "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
}

export function buildPlanFromPrefs(params: {
  keywords: string[];
  prefs: ContentPreferences;
  variationId: number;
}) {
  const { keywords, prefs, variationId } = params;
  const lc = langCode(prefs.language);
  const { min, max, target } = bounds(prefs.paragraphWords);

  const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
  const placement = tokenPlacementGuide(keywords);
  const conclH = conclusionHeading(lc);

  // Localised section-count line (model must produce headings in the same language)
  const sectionsLine =
    `Write exactly ${prefs.sectionCount} content sections. ` +
    `Each section MUST be: <h1>Section Title</h1> immediately followed by one <p> paragraph (target ${target} words; acceptable ${min}–${max} words).`;

  const conclusionLines = prefs.includeConclusion
    ? [
        `End with exactly one conclusion section, in the chosen language:`,
        `<h1>${conclH}</h1>`,
        `<p>One paragraph (target ${target} words; acceptable ${min}–${max} words). No tokens inside the conclusion.</p>`,
      ]
    : [`Do NOT include any conclusion section.`];

  const variationSalt = `${variationId}-${Date.now() % 100000}-${Math.floor(Math.random() * 100000)}`;

  const plan = [
    `Return ONLY JSON with keys "title" and "html". No Markdown fences or code blocks.`,
    languageDirectives(lc),
    `Title: 60–70 characters, natural (not just the keyword).`,
    `Style: ${moodDirectives(prefs.mood)} Keep it human and concrete (tiny numbers like ±0.3 mm, ~500 KB, 15–20 min where helpful). Avoid meta-instructions.`,
    sectionsLine,
    ...conclusionLines,
    `Insert these machine-visible tokens exactly once each (never inside the conclusion): ${tokens}`,
    placement,
    // Strong uniqueness recipe
    `Variation control (high): Use a distinct micro-scenario for Variation #${variationId} (seed ${variationSalt}). Change persona, location/city, time context, constraints, and at least 3 numeric specifics. Reorder points and vary headings’ wording. Do NOT reuse sentences or phrasing from other variations.`,
    `NEVER copy or paraphrase any of these instructions into "html".`,
    `Extra (highest priority from user): ${prefs.extraInstructions || "(none)"}`,
  ].join("\n");

  return plan;
}
