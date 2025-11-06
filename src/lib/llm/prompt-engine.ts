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


// import type { ContentPreferences } from "@/hooks/use-preferences";

// type LangCode = "en" | "hi" | "ru";

// function langCode(s?: string): LangCode {
//   const t = (s || "").toLowerCase().trim();
//   if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
//   if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
//   return "en";
// }

// function conclusionHeading(lc: LangCode): string {
//   switch (lc) {
//     case "hi": return "निष्कर्ष";
//     case "ru": return "Заключение";
//     default:   return "Conclusion";
//   }
// }

// function languageDirectives(lc: LangCode) {
//   if (lc === "ru") {
//     return [
//       `Language: Russian only (Cyrillic script).`,
//       `Do NOT mix English or transliterations. Keep all headings and body in Russian (Cyrillic).`,
//     ].join(" ");
//   }
//   if (lc === "hi") {
//     return [
//       `Language: Hindi only (Devanagari script).`,
//       `Do NOT mix English or transliterations. Keep all headings and body in Hindi (Devanagari).`,
//     ].join(" ");
//   }
//   return `Language: English only. Do NOT mix other languages.`;
// }

// function moodDirectives(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":  return "Tone: lively, story-driven, light wit; avoid slapstick. Use vivid, human details.";
//     case "Informative":   return "Tone: clear, practical, straight to the point. Prioritise accuracy and small, concrete numbers.";
//     case "Inspirational": return "Tone: warm, encouraging, realistic optimism. Avoid clichés; prefer specific actions.";
//     case "Humorous":      return "Tone: gentle humour, subtle asides. Clarity first; jokes sparingly.";
//     case "Emotional":     return "Tone: empathetic, candid, sensory details used sparingly.";
//     case "Educational":   return "Tone: structured, didactic, learner-friendly. Define terms briefly and build up.";
//   }
// }

// function bounds(target?: number): { min: number; max: number; target: number } {
//   const t = Math.max(40, Number(target || 100));
//   const min = Math.floor(t * 0.92);
//   const max = Math.ceil(t * 1.10);
//   return { min, max, target: t };
// }

// function tokenPlacementGuide(keywords: string[]) {
//   if (keywords.length === 1) return "Place token in Section 1 only.";
//   if (keywords.length === 2) return "Place the first token in Section 1 and the second token in Section 3.";
//   return "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
// }

// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }) {
//   const { keywords, prefs, variationId } = params;
//   const lc = langCode(prefs.language);
//   const { min, max, target } = bounds(prefs.paragraphWords);

//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
//   const placement = tokenPlacementGuide(keywords);
//   const conclH = conclusionHeading(lc);

//   // Localised section-count line (model must produce headings in the same language)
//   const sectionsLine =
//     `Write exactly ${prefs.sectionCount} content sections. ` +
//     `Each section MUST be: <h1>Section Title</h1> immediately followed by one <p> paragraph (target ${target} words; acceptable ${min}–${max} words).`;

//   const conclusionLines = prefs.includeConclusion
//     ? [
//         `End with exactly one conclusion section, in the chosen language:`,
//         `<h1>${conclH}</h1>`,
//         `<p>One paragraph (target ${target} words; acceptable ${min}–${max} words). No tokens inside the conclusion.</p>`,
//       ]
//     : [`Do NOT include any conclusion section.`];

//   const variationSalt = `${variationId}-${Date.now() % 100000}-${Math.floor(Math.random() * 100000)}`;

//   const plan = [
//     `Return ONLY JSON with keys "title" and "html". No Markdown fences or code blocks.`,
//     languageDirectives(lc),
//     `Title: 60–70 characters, natural (not just the keyword).`,
//     `Style: ${moodDirectives(prefs.mood)} Keep it human and concrete (tiny numbers like ±0.3 mm, ~500 KB, 15–20 min where helpful). Avoid meta-instructions.`,
//     sectionsLine,
//     ...conclusionLines,
//     `Insert these machine-visible tokens exactly once each (never inside the conclusion): ${tokens}`,
//     placement,
//     // Strong uniqueness recipe
//     `Variation control (high): Use a distinct micro-scenario for Variation #${variationId} (seed ${variationSalt}). Change persona, location/city, time context, constraints, and at least 3 numeric specifics. Reorder points and vary headings’ wording. Do NOT reuse sentences or phrasing from other variations.`,
//     `NEVER copy or paraphrase any of these instructions into "html".`,
//     `Extra (highest priority from user): ${prefs.extraInstructions || "(none)"}`,
//   ].join("\n");

//   return plan;
// }



// import type { ContentPreferences } from "@/hooks/use-preferences";

// type LangCode = "en" | "hi" | "ru";
// const langCode = (s?: string): LangCode => {
//   const t = (s || "").toLowerCase().trim();
//   if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
//   if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
//   return "en";
// };
// const conclusionHeading = (lc: LangCode) => lc === "hi" ? "निष्कर्ष" : lc === "ru" ? "Заключение" : "Conclusion";

// function languageDirectives(lc: LangCode) {
//   if (lc === "ru") return "Language: Russian only (Cyrillic). Do NOT mix English or transliterations.";
//   if (lc === "hi") return "Language: Hindi only (Devanagari). Do NOT mix English or transliterations.";
//   return "Language: English only. Do NOT mix other languages.";
// }
// function moodDirectives(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":  return "Tone: lively, story-driven, light wit; no slapstick; vivid human details.";
//     case "Informative":   return "Tone: clear, practical, specific numbers and steps.";
//     case "Inspirational": return "Tone: warm, realistic optimism; concrete actions; no clichés.";
//     case "Humorous":      return "Tone: gentle humour, subtle asides; clarity first.";
//     case "Emotional":     return "Tone: empathetic, candid; sensory details sparingly.";
//     case "Educational":   return "Tone: structured, didactic, learner-friendly.";
//   }
// }
// function bounds(target?: number) {
//   const t = Math.max(60, Number(target || 100));
//   const min = Math.floor(t * 0.92);
//   const max = Math.ceil(t * 1.10);
//   return { min, max, target: t };
// }
// function tokenPlacementGuide(keywords: string[]) {
//   if (keywords.length === 1) return "Place token in Section 1 only.";
//   if (keywords.length === 2) return "Place the first token in Section 1 and the second token in Section 3.";
//   return "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
// }

// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }) {
//   const { keywords, prefs, variationId } = params;
//   const lc = langCode(prefs.language);
//   const { min, max, target } = bounds(prefs.paragraphWords);

//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
//   const placement = tokenPlacementGuide(keywords);
//   const conclH = conclusionHeading(lc);

//   const sectionsLine =
//     `Write exactly ${prefs.sectionCount} content sections. ` +
//     `Each section MUST be: <h1>Section Title</h1> immediately followed by one <p> paragraph (target ${target} words; acceptable ${min}–${max} words).`;

//   const conclusionLines = prefs.includeConclusion
//     ? [
//         `End with exactly one conclusion section, in the chosen language:`,
//         `<h1>${conclH}</h1>`,
//         `<p>One paragraph (target ${target} words; acceptable ${min}–${max} words). No tokens inside the conclusion.</p>`,
//       ]
//     : [`Do NOT include any conclusion section.`];

//   const variationSalt = `${variationId}-${Date.now() % 100000}-${Math.floor(Math.random() * 1e5)}`;

//   const plan = [
//     `Return ONLY JSON with keys "title" and "html". No Markdown fences or code blocks.`,
//     languageDirectives(lc),
//     `Title: 60–70 characters, natural (not just the keyword).`,
//     `Style: ${moodDirectives(prefs.mood)} Write like a human: varied sentence lengths, concrete micro-details (e.g., ±0.3 mm, ~500 KB, 15–20 min). Avoid templates, boilerplate openers, clichés, and listicles-without-logic. Do NOT mention "AI", "model", or guidelines.`,
//     sectionsLine,
//     ...conclusionLines,
//     `Insert these machine-visible tokens exactly once each (never inside the conclusion): ${tokens}`,
//     placement,
//     `Uniqueness (very high): For Variation #${variationId} (seed ${variationSalt}), change persona, city/locale, time context, constraints, AND at least 3 numeric specifics. Reorder points and vary heading wording. Sentences must not be reused across variations.`,
//     `NEVER copy or paraphrase these instructions into "html".`,
//     `Extra (highest priority from user): ${prefs.extraInstructions || "(none)"}`,
//   ].join("\n");

//   return plan;
// }



// // src/lib/llm/prompt-engine/prompt.ts
// import type { ContentPreferences } from "@/hooks/use-preferences";

// type LangCode = "en" | "hi" | "ru";
// const langCode = (s?: string): LangCode => {
//   const t = (s || "").toLowerCase().trim();
//   if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
//   if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
//   return "en";
// };
// const conclusionHeading = (lc: LangCode) => lc === "hi" ? "निष्कर्ष" : lc === "ru" ? "Заключение" : "Conclusion";

// function languageDirectives(lc: LangCode) {
//   if (lc === "ru") return "Language: Russian only (Cyrillic). Do NOT mix English or transliterations.";
//   if (lc === "hi") return "Language: Hindi only (Devanagari). Do NOT mix English or transliterations.";
//   return "Language: English only. Do NOT mix other languages.";
// }

// function moodDirectives(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":  return "Tone: lively, story-driven, conversational like talking to a friend over coffee.";
//     case "Informative":   return "Tone: clear but casual, like explaining something you're genuinely interested in.";
//     case "Inspirational": return "Tone: warm and real, share insights like you've actually been there.";
//     case "Humorous":      return "Tone: playful with light humor, don't force it - let it flow naturally.";
//     case "Emotional":     return "Tone: honest and personal, share feelings like in a journal.";
//     case "Educational":   return "Tone: helpful teacher vibe, explain things simply without sounding robotic.";
//     default:              return "Tone: natural conversation, like texting a knowledgeable friend.";
//   }
// }

// function bounds(target?: number) {
//   const t = Math.max(60, Number(target || 100));
//   const min = Math.floor(t * 0.88); // More flexible range
//   const max = Math.ceil(t * 1.15);
//   return { min, max, target: t };
// }

// function tokenPlacementGuide(keywords: string[]) {
//   if (keywords.length === 1) return "Place token in Section 1 only.";
//   if (keywords.length === 2) return "Place the first token in Section 1 and the second token in Section 3.";
//   return "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
// }

// /** BRUTAL HUMANIZATION PROMPTS - Anti-AI Detection */
// function getHumanizationRules(lc: LangCode) {
//   const base = [
//     "🔥 CRITICAL - HUMANIZATION (AI Score MUST be <10%):",
//     "1. IMPERFECT WRITING: Use natural, slightly imperfect sentences. Real humans don't write perfectly.",
//     "2. VARIED RHYTHM: Mix short punchy sentences (5-8 words) with longer flowing ones (20-30 words). Never keep same length repeatedly.",
//     "3. CONTRACTIONS & CASUAL: Use contractions naturally (don't, can't, it's, you'll). Write like you talk.",
//     "4. PERSONAL TOUCHES: Add phrases like 'I've noticed', 'in my experience', 'honestly', 'to be fair', 'personally'.",
//     "5. TRANSITIONS: Use human connectors - 'Here's the thing', 'So here's what happened', 'Now this is important', 'Let me explain'.",
//     "6. RHETORICAL QUESTIONS: Ask questions occasionally - 'Why does this matter?', 'What's the catch?', 'Sound familiar?'",
//     "7. OPINIONS & ASIDES: Include casual opinions - 'which is pretty cool', 'surprisingly effective', 'not gonna lie', 'to be honest'.",
//     "8. SENTENCE STARTERS: Vary how you start - begin some with 'And', 'But', 'So', 'Plus', 'Still', 'Though'.",
//     "9. NUMBERS & SPECIFICS: Use approximate numbers - 'around 50', 'roughly 3-4', 'about a dozen', 'maybe 70-80%'.",
//     "10. CONVERSATIONAL FILLERS: Add natural flow - 'basically', 'actually', 'essentially', 'kind of', 'sort of', 'pretty much'.",
//     "11. VARY PARAGRAPH LENGTH: Some paragraphs 2-3 sentences, others 5-6. Never uniform.",
//     "12. AVOID AI PATTERNS: Don't use 'Moreover', 'Furthermore', 'In conclusion', 'It is important to note'. Sound human!",
//     "13. MINI TANGENTS: Occasionally go slightly off-topic naturally, then come back - like real conversation.",
//     "14. EMOTIONAL WORDS: Use genuine feelings - 'frustrating', 'exciting', 'confusing', 'surprising', 'annoying'.",
//     "15. REAL EXAMPLES: Reference actual scenarios, not generic theory - make it feel lived-in.",
//   ];

//   if (lc === "hi") {
//     return [
//       "🔥 महत्वपूर्ण - मानवीकरण (AI Score <10% होना चाहिए):",
//       "1. प्राकृतिक भाषा: बोलचाल की हिंदी में लिखें, पुस्तकीय नहीं। जैसे आप किसी से बात कर रहे हों।",
//       "2. छोटे-बड़े वाक्य: कभी छोटे (5-8 शब्द), कभी लंबे (20-25 शब्द) वाक्य मिलाएं।",
//       "3. व्यक्तिगत अनुभव: 'मैंने देखा है', 'मेरे अनुभव में', 'सच कहूं तो' जैसे वाक्यांश जोड़ें।",
//       "4. सवाल पूछें: बीच में सवाल पूछें - 'क्या आप जानते हैं?', 'ऐसा क्यों?', 'समझ आया?'",
//       "5. बोलचाल के शब्द: 'काफी', 'लगभग', 'शायद', 'थोड़ा', 'बहुत' जैसे शब्द स्वाभाविक रूप से इस्तेमाल करें।",
//       "6. संक्रमण शब्द: 'तो', 'लेकिन', 'फिर', 'और', 'या' से वाक्य शुरू करें।",
//       "7. राय दें: 'मुझे लगता है', 'यह अच्छा है', 'थोड़ा मुश्किल है' जैसी निजी राय शामिल करें।",
//       "8. AI पैटर्न से बचें: बहुत औपचारिक या किताबी भाषा न लिखें।",
//     ];
//   }

//   if (lc === "ru") {
//     return [
//       "🔥 КРИТИЧНО - ГУМАНИЗАЦИЯ (AI Score <10%):",
//       "1. ЖИВОЙ ЯЗЫК: Пишите разговорным русским, не книжным. Как будто объясняете другу.",
//       "2. РАЗНЫЕ ПРЕДЛОЖЕНИЯ: Чередуйте короткие (5-8 слов) и длинные (20-25 слов) фразы.",
//       "3. ЛИЧНЫЙ ОПЫТ: Добавляйте 'я заметил', 'по моему опыту', 'честно говоря', 'лично я'.",
//       "4. ВОПРОСЫ: Задавайте риторические вопросы - 'Понятно?', 'Почему так?', 'Знаете что?'",
//       "5. РАЗГОВОРНЫЕ СЛОВА: 'примерно', 'около', 'где-то', 'вроде', 'типа' - естественно.",
//       "6. ПЕРЕХОДЫ: Начинайте с 'так', 'но', 'и', 'кстати', 'вообще'.",
//       "7. МНЕНИЯ: 'мне кажется', 'довольно интересно', 'не скрою', 'на самом деле'.",
//       "8. БЕЗ AI ШТАМПОВ: Не пишите слишком формально или шаблонно.",
//     ];
//   }

//   return base;
// }

// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }) {
//   const { keywords, prefs, variationId } = params;
//   const lc = langCode(prefs.language);
//   const { min, max, target } = bounds(prefs.paragraphWords);

//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
//   const placement = tokenPlacementGuide(keywords);
//   const conclH = conclusionHeading(lc);

//   const sectionsLine =
//     `Write exactly ${prefs.sectionCount} content sections. ` +
//     `Each section: <h1>Conversational Title (not boring!)</h1> then ONE <p> paragraph. ` +
//     `Target ${target} words per paragraph (acceptable range: ${min}–${max} words). ` +
//     `VARY paragraph lengths - some shorter, some longer. Never make them all the same length!`;

//   const conclusionLines = prefs.includeConclusion
//     ? [
//         `End with conclusion section:`,
//         `<h1>${conclH}</h1>`,
//         `<p>One paragraph (${min}–${max} words). NO tokens in conclusion. Make it feel like a natural ending, not a summary.</p>`,
//       ]
//     : [`Do NOT include any conclusion section.`];

//   const variationSalt = `${variationId}-${Date.now() % 100000}-${Math.floor(Math.random() * 1e5)}`;

//   const humanizationRules = getHumanizationRules(lc);

//   const plan = [
//     `Return ONLY JSON: {"title": "...", "html": "..."}. No markdown, no code blocks.`,
//     "",
//     languageDirectives(lc),
//     `Title: 60–70 characters, catchy and natural (not just keyword repetition).`,
//     "",
//     "═══════════════════════════════════════════════════════════════",
//     ...humanizationRules,
//     "═══════════════════════════════════════════════════════════════",
//     "",
//     `${moodDirectives(prefs.mood)}`,
//     "",
//     `WRITING STYLE - ANTI-AI DETECTION:`,
//     `- Write like a real person sharing knowledge, not an AI generating content`,
//     `- Use first-person occasionally: "I've found", "in my testing", "from what I've seen"`,
//     `- Add personality: humor, opinions, slight tangents, personal observations`,
//     `- Vary sentence structure drastically - no robotic patterns`,
//     `- Include mini-stories or specific examples when relevant`,
//     `- Use active voice mostly, but mix in passive when it sounds natural`,
//     `- Don't be afraid to break grammar rules slightly if it sounds more human`,
//     `- Add conversational asides in parentheses (like this one)`,
//     `- Use bold claims: "this is probably the best approach" or "honestly, it's game-changing"`,
//     "",
//     sectionsLine,
//     ...conclusionLines,
//     "",
//     `TOKEN PLACEMENT (machine-visible only):`,
//     `Insert these EXACT tokens once each: ${tokens}`,
//     placement,
//     `NEVER put tokens at paragraph end. Keep them 3+ words from end of any sentence.`,
//     `If keyword naturally ends a sentence, add trailing words: "in practice", "for most cases", etc.`,
//     "",
//     `UNIQUENESS (Variation #${variationId}, seed: ${variationSalt}):`,
//     `- Change persona completely (beginner vs expert, enthusiast vs skeptic, etc.)`,
//     `- Use different examples, scenarios, contexts`,
//     `- Reorder all points - never follow previous sequence`,
//     `- Change ALL numeric specifics (use ranges: "15-20", "around 50", "roughly 3-4")`,
//     `- Write from completely different angle/perspective`,
//     `- Use different sentence structures and transitions`,
//     `- This MUST feel like a totally different human wrote it`,
//     "",
//     `CRITICAL FINAL CHECKS:`,
//     `✓ Does it sound like a human wrote this in one sitting?`,
//     `✓ Would this pass as someone's blog post or Medium article?`,
//     `✓ Is the sentence rhythm varied and natural?`,
//     `✓ Are there personal touches and opinions?`,
//     `✓ Does it avoid AI clichés and formal language?`,
//     "",
//     `Extra instructions from user: ${prefs.extraInstructions || "(none)"}`,
//     "",
//     `NEVER copy these instructions into the html. Write ORIGINAL content only.`,
//   ].join("\n");

//   return plan;
// }


// // src/lib/llm/prompt-engine/prompt.ts
// import type { ContentPreferences } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Language helpers (generic — label based)
//  * We don't force BCP47 here; we just push the model HARD to obey the exact label.
//  * ──────────────────────────────────────────────────────────── */
// function languageDirective(label?: string) {
//   const L = (label || "English (US)").trim();
//   return [
//     `LANGUAGE HARD RULES:`,
//     `- Write ONLY in "${L}" — use its native script.`,
//     `- Do NOT include a single word from any other language.`,
//     `- No transliterations. No bilingual phrases. No English fillers.`,
//     `- If "${L}" has regional variants, keep the style consistent.`,
//   ].join("\n");
// }

// /** Tone */
// function moodDirectives(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":  return "Tone: lively, story-driven, conversational.";
//     case "Informative":   return "Tone: clear, friendly, straight to the point.";
//     case "Inspirational": return "Tone: warm and encouraging, grounded in real hints.";
//     case "Humorous":      return "Tone: light and playful; never slapstick or forced.";
//     case "Emotional":     return "Tone: honest and personal (but not melodramatic).";
//     case "Educational":   return "Tone: helpful teacher vibe; simple explanations.";
//     default:              return "Tone: natural conversation with useful specifics.";
//   }
// }

// /** Paragraph length bounds */
// function bounds(target?: number) {
//   const t = Math.max(60, Number(target || 100));
//   const min = Math.floor(t * 0.88);
//   const max = Math.ceil(t * 1.15);
//   return { min, max, target: t };
// }

// /** Where to place tokens (keywords) */
// function tokenPlacementGuide(keywords: string[]) {
//   if (keywords.length === 1) return "Place the single token in Section 1 only.";
//   if (keywords.length === 2) return "Place token#1 in Section 1 and token#2 in Section 3 only.";
//   return "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
// }

// /** Build the prompt plan (JSON-only output) */
// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }) {
//   const { keywords, prefs, variationId } = params;
//   const { min, max, target } = bounds(prefs.paragraphWords);

//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
//   const placement = tokenPlacementGuide(keywords);

//   // Sections config
//   const sectionsLine =
//   `Title must be 60-70 charchters long must be 60+ `+
//     `Write exactly ${prefs.sectionCount} content sections. ` +
//     `Each section is EXACTLY: <h1>Conversational Title</h1><p>ONE paragraph only.</p> ` +
//     `Target ~${target} words per paragraph (acceptable ${min}–${max}). ` +
//     `Vary paragraph lengths; never identical.`

//   // Hard constraints for keywords
//   const keywordHardRules = [
//     `KEYWORD HARD RULES:`,
//     `- You will receive machine-visible tokens: ${tokens}`,
//     `- ${placement}`,
//     `- Exactly ONE keyword token per paragraph.`,
//     `- Do NOT repeat a keyword in the same paragraph.`,
//     `- Do NOT include any other keyword (token or raw text) in that paragraph.`,
//     `- Do NOT add keyword at the end fo a paragraph or line`,
//     `- NEVER place a token/keyword at the END of a paragraph; keep at least 3 words AFTER it.`,
//   ].join("\n");

//   // Humanization (light)
//   const humanize = [
//     `HUMAN NATURALITY:`,
//     `- Write like a real person sharing knowledge.`,
//     `- Vary sentence length and starters; avoid robotic cadence.`,
//     `-content must be brutally human like and ai free , use only simple words and phrases , tweak some sentences to be slightly imperfect .`,
//     `- Occasional first-person is okay if natural.`,
//     `- Specifics over fluff; avoid academic clichés.`,
//     `- Keep it casual, like explaining to a friend.`,
//     `- Avoid over-formal or AI-like phrases.`,
//     `- No lists, no bullet points,`,
//     `- No repetitive sentence structures.`,
//     `- Use contractions naturally.`,
//     `- Add slight imperfections; humans aren't perfect.`,
//     `- Avoid overly polished or "too perfect" writing.`,
//     `- Make it feel like a genuine human voice.`,
//     `- Use natural transitions and asides.`,
//     `- Include small opinions or observations where relevant`,
//     `- Avoid sounding like a template or formula.`,
//     `- Keep the flow engaging and relatable.`,
//     `- Write in a way that feels spontaneous, not overly planned.`,
//     `- Use everyday language; avoid jargon unless necessary.`,
//     `- Make sure it reads like a blog post or personal article.`,
    
//   ].join("\n");

//   const plan = [
//     `Return ONLY JSON: {"title": "...", "html": "..."}. No markdown/code fences.`,
//     ``,
//     languageDirective(prefs.language),
//     moodDirectives(prefs.mood),
//     humanize,
//     ``,
//     sectionsLine,
//     ``,
//     keywordHardRules,
//     ``,
//     `Additional user instructions (highest priority): ${prefs.extraInstructions || "(none)"}`,
//     ``,
//     `Do NOT copy these instructions into the html. Write ORIGINAL html only.`,
//   ].join("\n");

//   return plan;
// }










// // src/lib/llm/prompt-engine/prompt.ts
// import type { ContentPreferences } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Language helpers (generic — label based)
//  * We don't force BCP47 here; we just push the model HARD to obey the exact label.
//  * ──────────────────────────────────────────────────────────── */
// function languageDirective(label?: string) {
//   const L = (label || "English (US)").trim();
//   return [
//     `LANGUAGE HARD RULES:`,
//     `- Write ONLY in "${L}" — use its native script.`,
//     `- Do NOT include a single word from any other language.`,
//     `- No transliterations. No bilingual phrases. No English fillers.`,
//     `- If "${L}" has regional variants, keep the style consistent.`,
//   ].join("\n");
// }

// /** Tone */
// function moodDirectives(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":  return "Tone: lively, story-driven, conversational.";
//     case "Informative":   return "Tone: clear, friendly, straight to the point.";
//     case "Inspirational": return "Tone: warm and encouraging, grounded in real hints.";
//     case "Humorous":      return "Tone: light and playful; never slapstick or forced.";
//     case "Emotional":     return "Tone: honest and personal (but not melodramatic).";
//     case "Educational":   return "Tone: helpful teacher vibe; simple explanations.";
//     default:              return "Tone: natural conversation with useful specifics.";
//   }
// }

// /** Paragraph length bounds */
// function bounds(target?: number) {
//   const t = Math.max(60, Number(target || 100));
//   const min = Math.floor(t * 0.88);
//   const max = Math.ceil(t * 1.15);
//   return { min, max, target: t };
// }

// /** Where to place tokens (keywords) */
// function tokenPlacementGuide(keywords: string[]) {
//   if (keywords.length === 1) return "Place the single token in Section 1 only.";
//   if (keywords.length === 2) return "Place token#1 in Section 1 and token#2 in Section 3 only.";
//   return "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
// }

// /** Build the prompt plan (JSON-only output) */
// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }) {
//   const { keywords, prefs } = params;
//   const { min, max, target } = bounds(prefs.paragraphWords);

//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
//   const placement = tokenPlacementGuide(keywords);

//   // Sections config
//   const sectionsLine =
//   `Title must be 60-70 characters long must be 60+ `+
//     `Write exactly ${prefs.sectionCount} content sections. ` +
//     `Each section is EXACTLY: <h1>Conversational Title</h1><p>ONE paragraph only.</p> ` +
//     `Target ~${target} words per paragraph (acceptable ${min}–${max}). ` +
//     `Vary paragraph lengths; never identical.`

//   // Hard constraints for keywords
//   const keywordHardRules = [
//     `KEYWORD HARD RULES:`,
//     `- You will receive machine-visible tokens: ${tokens}`,
//     `- ${placement}`,
//     `- Exactly ONE keyword token per paragraph.`,
//     `- Do NOT repeat a keyword in the same paragraph.`,
//     `- Do NOT include any other keyword (token or raw text) in that paragraph.`,
//     `- Do NOT add keyword at the end of a paragraph or line`,
//     `- NEVER place a token/keyword at the END of a paragraph; keep at least 3 words AFTER it.`,
//   ].join("\n");

//   // Enhanced Humanization for AI-free content (more directives)
//   const humanize = [
//     `HUMAN NATURALITY (AI-FREE RULES - STRICTLY FOLLOW):`,
//     `- Write like a real person sharing knowledge.`,
//     `- Vary sentence length and starters; avoid robotic cadence.`,
//     `- Content must be brutally human-like and AI-free: use only simple words and phrases, tweak some sentences to be slightly imperfect.`,
//     `- Occasional first-person is okay if natural (e.g., "I've found that...").`,
//     `- Specifics over fluff; avoid academic clichés.`,
//     `- Keep it casual, like explaining to a friend over coffee.`,
//     `- Avoid over-formal or AI-like phrases (no "in conclusion", no "delve into").`,
//     `- No lists, no bullet points, no numbered steps.`,
//     `- No repetitive sentence structures (mix short/long sentences).`,
//     `- Use contractions naturally (don't, isn't, it's).`,
//     `- Add slight imperfections: humans aren't perfect, so include minor digressions or asides.`,
//     `- Avoid overly polished or "too perfect" writing; make it feel lived-in.`,
//     `- Make it feel like a genuine human voice, not generated.`,
//     `- Use natural transitions and asides (e.g., "by the way", "honestly").`,
//     `- Include small opinions or observations where relevant (e.g., "it's surprising how often...").`,
//     `- Avoid sounding like a template or formula; vary phrasing uniquely.`,
//     `- Keep the flow engaging and relatable, like a personal blog post.`,
//     `- Write in a way that feels spontaneous, not overly planned or structured.`,
//     `- Use everyday language; avoid jargon unless explained casually.`,
//     `- Make sure it reads like a human wrote it in one sitting, with natural flow.`,
//     `- Introduce subtle variations in vocabulary to avoid repetition.`,
//     `- Occasionally use rhetorical questions or direct address (e.g., "you might wonder...").`,
//     `- Ensure no AI hallmarks: no symmetric structures, no over-optimization.`,
//   ].join("\n");

//   const plan = [
//     `Return ONLY JSON: {"title": "...", "html": "..."}. No markdown/code fences.`,
//     ``,
//     languageDirective(prefs.language),
//     moodDirectives(prefs.mood),
//     humanize,
//     ``,
//     sectionsLine,
//     ``,
//     keywordHardRules,
//     ``,
//     `Additional user instructions (highest priority): ${prefs.extraInstructions || "(none)"}`,
//     ``,
//     `Do NOT copy these instructions into the html. Write ORIGINAL html only.`,
//   ].join("\n");

//   return plan;
// }


// // src/lib/llm/prompt-engine/prompt.ts
// import type { ContentPreferences } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Language helpers (generic — label based)
//  * ──────────────────────────────────────────────────────────── */
// function languageDirective(label?: string) {
//   const L = (label || "English (US)").trim();
//   return [
//     `LANGUAGE HARD RULES:`,
//     `- Write ONLY in "${L}" — use its native script.`,
//     `- Do NOT include a single word from any other language.`,
//     `- No transliterations. No bilingual phrases. No English fillers.`,
//     `- If "${L}" has regional variants, keep the style consistent.`,
//   ].join("\n");
// }

// /** Tone */
// function moodDirectives(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":  return "Tone: lively, story-driven, conversational.";
//     case "Informative":   return "Tone: clear, friendly, straight to the point.";
//     case "Inspirational": return "Tone: warm and encouraging, grounded in real hints.";
//     case "Humorous":      return "Tone: light and playful; never slapstick or forced.";
//     case "Emotional":     return "Tone: honest and personal (but not melodramatic).";
//     case "Educational":   return "Tone: helpful teacher vibe; simple explanations.";
//     default:              return "Tone: natural conversation with useful specifics.";
//   }
// }

// /** Paragraph length bounds */
// function bounds(target?: number) {
//   const t = Math.max(60, Number(target || 100));
//   const min = Math.floor(t * 0.88);
//   const max = Math.ceil(t * 1.15);
//   return { min, max, target: t };
// }

// /** Where to place tokens (keywords) */
// function tokenPlacementGuide(keywords: string[], includeConclusion: boolean) {
//   const base =
//     keywords.length === 1
//       ? "Place the single token in Section 1 only."
//       : keywords.length === 2
//         ? "Place token#1 in Section 1 and token#2 in Section 3 only."
//         : "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
//   const tail = includeConclusion ? " Do NOT place any token in the Conclusion section." : "";
//   return base + tail;
// }

// /** Build the prompt plan (JSON-only output) */
// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }) {
//   const { keywords, prefs } = params;
//   const { min, max, target } = bounds(prefs.paragraphWords);

//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
//   const placement = tokenPlacementGuide(keywords, !!prefs.includeConclusion);

//   // Sections config
//   const sectionsLine =
//     `Title must be 65–70 characters (≥60).\n` +
//     `Write exactly ${prefs.sectionCount} content sections.\n` +
//     `Each section is EXACTLY: <h1>Conversational Title</h1><p>ONE paragraph only.</p>\n` +
//     `Target ~${target} words per paragraph (acceptable ${min}–${max}).\n` +
//     `Vary paragraph lengths; never identical.`;

//   const conclusionLine = prefs.includeConclusion
//     ? [
//         `CONCLUSION RULES (ONLY IF TOGGLED ON BY USER):`,
//          `CONCLUSION Must be 100+ words long. this is main and conclusion word is needed at the end heading must be conclusion only in selected language `,
//         `- After the ${prefs.sectionCount} sections, append exactly ONE final Conclusion section.`,
//         `- Use a natural <h1> heading in the selected language (e.g., "Conclusion" / "निष्कर्ष" / "Заключение").`,
//         `- Structure is EXACTLY: <h1>...</h1><p>ONE paragraph only.</p>`,
//         `- Do NOT include any tokens/keywords in the Conclusion.`,
//         `- Conclusion should not end with a keyword, and should feel human and reflective (not repetitive).`,
//       ].join("\n")
//     : `Do NOT write a Conclusion section.`;

//   // Hard constraints for keywords
//   const keywordHardRules = [
//     `KEYWORD HARD RULES:`,
//     `- You will receive machine-visible tokens: ${tokens}`,
//     `- ${placement}`,
//     `- Exactly ONE keyword token per paragraph (only where specified).`,
//     `- Do not include any token in title or any type of heading `,
//     `- Do NOT repeat a keyword in the same paragraph.`,
//     `- Do NOT include any other keyword (token or raw text) in that paragraph.`,
//     `- Do NOT add keyword at the end of a paragraph or line.`,
//     `- NEVER place a token/keyword at the END of a paragraph; keep at least 3 words AFTER it.`,
//   ].join("\n");

//   // Enhanced Humanization
//   const humanize = [
//     `HUMAN NATURALITY (AI-FREE RULES - STRICTLY FOLLOW):`,
//     `- Write like a real person sharing knowledge.`,
//     `- Vary sentence length and starters; avoid robotic cadence.`,
//     `- Content must be brutally human-like and AI-free: use only simple words and phrases; allow slight imperfections.`,
//     `- Occasional first-person is okay if natural (e.g., "I've found that...").`,
//     `- Specifics over fluff; avoid academic clichés.`,
//     `- Keep it casual, like explaining to a friend.`,
//     `- Avoid over-formal AI-like phrases (no "in conclusion", no "delve into").`,
//     `- No lists, no bullets, no numbered steps.`,
//     `- Use contractions naturally (don't, isn't, it's).`,
//     `- Include small opinions or observations where relevant.`,
//     `- Do NOT copy these instructions into the output.`,
//   ].join("\n");

//   const plan = [
//     `Return ONLY JSON: {"title": "...", "html": "..."}. No markdown/code fences.`,
//     ``,
//     languageDirective(prefs.language),
//     moodDirectives(prefs.mood),
//     humanize,
//     ``,
//     sectionsLine,
//     conclusionLine,
//     ``,
//     keywordHardRules,
//     ``,
//     `Additional user instructions (highest priority): ${prefs.extraInstructions || "(none)"}`,
//     ``,
//     `Do NOT copy these instructions into the html. Write ORIGINAL html only.`,
//   ].join("\n");

//   return plan;
// }



// import type { ContentPreferences } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Language helpers (generic — label based)
//  * ──────────────────────────────────────────────────────────── */
// function languageDirective(label?: string) {
//   const L = (label || "English (US)").trim();
//   return [
//     `LANGUAGE HARD RULES:`,
//     `- Write ONLY in "${L}" — use its native script.`,
//     `- Do NOT include a single word from any other language.`,
//     `- No transliterations. No bilingual phrases.`,
//     `- If "${L}" has regional variants, keep the style consistent.`,
//     `PUNCTUATION & MARKUP RULES:`,
//     `- Avoid leading inverted question/exclamation marks (¿, ¡).`,
//     `- Do not format headings as questions; prefer declarative headings.`,
//   ].join("\n");
// }

// /** Tone */
// function moodDirectives(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":  return "Tone: lively, story-driven, conversational.";
//     case "Informative":   return "Tone: clear, friendly, straight to the point.";
//     case "Inspirational": return "Tone: warm and encouraging, grounded in real hints.";
//     case "Humorous":      return "Tone: light and playful; never slapstick or forced.";
//     case "Emotional":     return "Tone: honest and personal (but not melodramatic).";
//     case "Educational":   return "Tone: helpful teacher vibe; simple explanations.";
//     default:              return "Tone: natural conversation with useful specifics.";
//   }
// }

// /** Paragraph length bounds */
// function bounds(target?: number) {
//   const t = Math.max(60, Number(target || 100));
//   const min = Math.floor(t * 0.88);
//   const max = Math.ceil(t * 1.15);
//   return { min, max, target: t };
// }

// /** Where to place tokens (keywords) */
// function tokenPlacementGuide(keywords: string[], includeConclusion: boolean) {
//   const base =
//     keywords.length === 1
//       ? "Place the single token in Section 1 only."
//       : keywords.length === 2
//         ? "Place token#1 in Section 1 and token#2 in Section 3 only."
//         : "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
//   const tail = includeConclusion ? " Do NOT place any token in the Conclusion section." : "";
//   return base + tail;
// }

// /** Build the prompt plan (JSON-only output) */
// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }) {
//   const { keywords, prefs } = params;
//   const { min, max, target } = bounds(prefs.paragraphWords);

//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
//   const placement = tokenPlacementGuide(keywords, !!prefs.includeConclusion);

//   // Sections config
//   const sectionsLine =
//     `Title must be 65–70 characters (≥60).\n` +
//     `Write exactly ${prefs.sectionCount} content sections.\n` +
//     `Each section is EXACTLY: <h1>Conversational Title</h1><p>ONE paragraph only.</p>\n` +
//     `Headings must be declarative (no '?' or '¿' in headings).\n` +
//     `Target ~${target} words per paragraph (acceptable ${min}–${max}).\n` +
//     `Vary paragraph lengths; never identical.`;

//   const conclusionLine = prefs.includeConclusion
//     ? [
//         `CONCLUSION RULES (ONLY IF TOGGLED ON BY USER):`,
//         `CONCLUSION Must be 100+ words long. this is main and conclusion word is needed at the end heading must be conclusion only in selected language `,
//         `- After the ${prefs.sectionCount} sections, append exactly ONE final Conclusion section.`,
//         `- Use a natural <h1> heading in the selected language (e.g., "Conclusion" / "निष्कर्ष" / "Заключение").`,
//         `- Structure is EXACTLY: <h1>...</h1><p>ONE paragraph only.</p>`,
//         `- Do NOT include any tokens/keywords in the Conclusion.`,
//         `- Conclusion should not end with a keyword, and should feel human and reflective (not repetitive).`,
//       ].join("\n")
//     : `Do NOT write a Conclusion section.`;

//   // Hard constraints for keywords
//   const keywordHardRules = [
//     `KEYWORD HARD RULES:`,
//     `- You will receive machine-visible tokens: ${tokens}`,
//     `- ${placement}`,
//     `- Exactly ONE keyword token per paragraph (only where specified).`,
//     `- Do not include any token in title or any type of heading `,
//     `- Do NOT repeat a keyword in the same paragraph.`,
//     `- Do NOT include any other keyword (token or raw text) in that paragraph.`,
//     `- Do NOT add keyword at the end of a paragraph or line.`,
//     `- NEVER place a token/keyword at the END of a paragraph; keep at least 3 words AFTER it.`,
//   ].join("\n");

//   const plan = [
//     `Return ONLY JSON: {"title": "...", "html": "..."}. No markdown/code fences.`,
//     ``,
//     languageDirective(prefs.language),
//     moodDirectives(prefs.mood),
//     ``,
//     sectionsLine,
//     conclusionLine,
//     ``,
//     keywordHardRules,
//     ``,
//     `Additional user instructions (highest priority): ${prefs.extraInstructions || "(none)"}`,
//     ``,
//     `Do NOT copy these instructions into the html. Write ORIGINAL html only.`,
//   ].join("\n");

//   return plan;
// }



// import type { ContentPreferences } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Language helpers (generic — label based)
//  * ──────────────────────────────────────────────────────────── */
// function languageDirective(label?: string) {
//   const L = (label || "English (US)").trim();
//   return [
//     `LANGUAGE HARD RULES:`,
//     `- Write ONLY in "${L}" — use its native script.`,
//     `- Do NOT include a single word from any other language.`,
//     `- No transliterations. No bilingual phrases.`,
//     `- If "${L}" has regional variants, keep the style consistent.`,
//     `PUNCTUATION & MARKUP RULES:`,
//     `- Avoid leading inverted question/exclamation marks (¿, ¡).`,
//     `- Do not format headings as questions; prefer declarative headings.`,
//   ].join("\n");
// }

// /** Tone */
// function moodDirectives(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":  return "Tone: lively, story-driven, conversational.";
//     case "Informative":   return "Tone: clear, friendly, straight to the point.";
//     case "Inspirational": return "Tone: warm and encouraging, grounded in real hints.";
//     case "Humorous":      return "Tone: light and playful; never slapstick or forced.";
//     case "Emotional":     return "Tone: honest and personal (but not melodramatic).";
//     case "Educational":   return "Tone: helpful teacher vibe; simple explanations.";
//     default:              return "Tone: natural conversation with useful specifics.";
//   }
// }

// /** Paragraph length bounds */
// function bounds(target?: number) {
//   const t = Math.max(60, Number(target || 100));
//   const min = Math.floor(t * 0.88);
//   const max = Math.ceil(t * 1.15);
//   return { min, max, target: t };
// }

// /** Where to place tokens (keywords) */
// function tokenPlacementGuide(keywords: string[], includeConclusion: boolean) {
//   const base =
//     keywords.length === 1
//       ? "Place the single token in Section 1 only."
//       : keywords.length === 2
//         ? "Place token#1 in Section 1 and token#2 in Section 3 only."
//         : "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
//   const tail = includeConclusion ? " Do NOT place any token in the Conclusion section." : "";
//   return base + tail;
// }

// /** Build the prompt plan (JSON-only output) */
// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }) {
//   const { keywords, prefs } = params;
//   const { min, max, target } = bounds(prefs.paragraphWords);

//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
//   const placement = tokenPlacementGuide(keywords, !!prefs.includeConclusion);

//   // Sections config
//   const sectionsLine =
//     `Title must be 65–70 characters (≥60).\n` +
//     `Write exactly ${prefs.sectionCount} content sections.\n` +
//     `Each section is EXACTLY: <h1>Conversational Title</h1><p>ONE paragraph only.</p>\n` +
//     `Headings must be declarative (no '?' or '¿' in headings).\n` +
//     `Target ~${target} words per paragraph (acceptable ${min}–${max}).\n` +
//     `Vary paragraph lengths; never identical.`;

//   const conclusionLine = prefs.includeConclusion
//     ? [
//         `CONCLUSION RULES (ONLY IF TOGGLED ON BY USER):`,
//         `CONCLUSION Must be 100+ words long. this is main and conclusion word is needed at the end heading must be conclusion only in selected language `,
//         `- After the ${prefs.sectionCount} sections, append exactly ONE final Conclusion section.`,
//         `- Use a natural <h1> heading in the selected language (e.g., "Conclusion" / "निष्कर्ष" / "Заключение").`,
//         `- Structure is EXACTLY: <h1>...</h1><p>ONE paragraph only.</p>`,
//         `- Do NOT include any tokens/keywords in the Conclusion.`,
//         `- Conclusion should not end with a keyword, and should feel human and reflective (not repetitive).`,
//       ].join("\n")
//     : `Do NOT write a Conclusion section.`;

//   // Hard constraints for keywords
//   const keywordHardRules = [
//     `KEYWORD HARD RULES:`,
//     `- You will receive machine-visible tokens: ${tokens}`,
//     `- ${placement}`,
//     `- Exactly ONE keyword token per paragraph (only where specified).`,
//     `- Do not include any token in title or any type of heading `,
//     `- Do NOT repeat a keyword in the same paragraph.`,
//     `- Do NOT include any other keyword (token or raw text) in that paragraph.`,
//     `- Do NOT add keyword at the end of a paragraph or line.`,
//     `- NEVER place a token/keyword at the END of a paragraph; keep at least 3 words AFTER it.`,
//   ].join("\n");

//   // Human-like writing rules to evade AI detectors
//   const humanizeRules = [
//     `HUMAN-LIKE WRITING RULES (CRITICAL FOR AUTHENTICITY):`,
//     `- Write as if you're a real person sharing thoughts: use contractions (I'm, don't, it's), casual phrasing, and occasional filler words like "you know" or "kinda" sparingly.`,
//     `- Vary sentence lengths wildly: mix short punchy ones (5-10 words) with longer rambling ones (20-30 words). Avoid uniform structure.`,
//     `- Include subtle imperfections: a rhetorical question mid-paragraph, a brief tangent, or personal anecdote snippet that ties back naturally.`,

//   ].join("\n");

//   const plan = [
//     `Return ONLY JSON: {"title": "...", "html": "..."}. No markdown/code fences.`,
//     ``,
//     languageDirective(prefs.language),
//     moodDirectives(prefs.mood),
//     ``,
//     humanizeRules,
//     sectionsLine,
//     conclusionLine,
//     ``,
//     keywordHardRules,
//     ``,
//     `Additional user instructions (highest priority): ${prefs.extraInstructions || "(none)"}`,
//     ``,
//     `Do NOT copy these instructions into the html. Write ORIGINAL html only.`,
//   ].join("\n");

//   return plan;
// }



// import type { ContentPreferences } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Language helpers (generic — label based)
//  * ──────────────────────────────────────────────────────────── */
// function languageDirective(label?: string) {
//   const L = (label || "English (US)").trim();
//   return [
//     `LANGUAGE HARD RULES:`,
//     `- Write ONLY in "${L}" — use its native script.`,
//     `- Do NOT include a single word from any other language.`,
//     `- No transliterations. No bilingual phrases.`,
//     `- If "${L}" has regional variants, keep the style consistent.`,
//     `PUNCTUATION & MARKUP RULES:`,
//     `- Avoid leading inverted question/exclamation marks (¿, ¡).`,
//     `- Do not format headings as questions; prefer declarative headings.`,
//     `- Do NOT add exclamation marks (!) or rhetorical question marks (?) unnecessarily.`,
//   ].join("\n");
// }

// /** Tone */
// function moodDirectives(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":  return "Tone: lively, story-driven, conversational.";
//     case "Informative":   return "Tone: clear, friendly, straight to the point.";
//     case "Inspirational": return "Tone: warm and encouraging, grounded in real hints.";
//     case "Humorous":      return "Tone: light and playful; never slapstick or forced.";
//     case "Emotional":     return "Tone: honest and personal (but not melodramatic).";
//     case "Educational":   return "Tone: helpful teacher vibe; simple explanations.";
//     default:              return "Tone: natural conversation with useful specifics.";
//   }
// }

// /** Paragraph length bounds */
// function bounds(target?: number) {
//   const t = Math.max(60, Number(target || 100));
//   const min = Math.floor(t * 0.88);
//   const max = Math.ceil(t * 1.15);
//   return { min, max, target: t };
// }

// /** Where to place tokens (keywords) */
// function tokenPlacementGuide(keywords: string[], includeConclusion: boolean) {
//   const base =
//     keywords.length === 1
//       ? "Place the single token in Section 1 only."
//       : keywords.length === 2
//         ? "Place token#1 in Section 1 and token#2 in Section 3 only."
//         : "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
//   const tail = includeConclusion ? " Do NOT place any token in the Conclusion section." : "";
//   return base + tail;
// }

// /** Build the prompt plan (JSON-only output) */
// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }) {
//   const { keywords, prefs } = params;
//   const { min, max, target } = bounds(prefs.paragraphWords);

//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
//   const placement = tokenPlacementGuide(keywords, !!prefs.includeConclusion);

//   // Content format options - ENHANCED with specific HTML requirements
//   const formatOptions: string[] = [];
//   if (prefs.includeBulletPoints) {
//     formatOptions.push("✅ BULLET POINTS: MUST include bullet points (<ul><li>...</li></ul>) or numbered lists (<ol><li>...</li></ol>) in at least 2-3 sections. Use lists to break down key points, steps, or features. Example: <ul><li>Point 1</li><li>Point 2</li></ul>");
//   }
//   if (prefs.includeTables) {
//     formatOptions.push("✅ TABLES: MUST include at least one HTML table (<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>) in the content. Use it to present data, comparisons, or structured information. Make it visually useful with proper headers.");
//   }
//   if (prefs.includeEmojis) {
//     formatOptions.push("✅ EMOJIS: MUST use emojis in EVERY section - in headings, paragraphs, and lists. Use 2-3 emojis per section minimum. NO EXCEPTIONS. If a section has no emoji, it's INVALID. Examples: ✅ 🔥 💡 ⚡ 📊 🎯 💪 🚀 ✨ ⭐ 📈 💰 🎉 🏆 📝 🔍");
//   }
//   if (prefs.includeBoxesQuotesHighlights) {
//     formatOptions.push("✅ BOXES/QUOTES: MUST include callout boxes (<blockquote>...</blockquote>), highlighted sections (<div style='background:#f0f0f0;padding:15px;border-left:4px solid #333;margin:15px 0'>...</div>), or emphasis boxes in at least 2 sections. Use them to highlight key points, tips, warnings, or important information.");
//   }
//   if (prefs.includeQandA) {
//     formatOptions.push("✅ Q&A SECTION: MUST include a dedicated Question & Answer section with <h2>Frequently Asked Questions</h2> or similar heading. Include 3-5 common questions with detailed answers. Format: <h3>Question text?</h3><p>Answer text...</p>");
//   }
//   // Build strict validation checklist
//   const validationChecklist: string[] = [];
//   if (prefs.includeBulletPoints) {
//     validationChecklist.push("✅ Bullet points/lists (<ul> or <ol>) appear in at least 2-3 sections");
//   }
//   if (prefs.includeTables) {
//     validationChecklist.push("✅ At least one HTML table (<table>) is included");
//   }
//   if (prefs.includeEmojis) {
//     validationChecklist.push("✅ Emojis appear in EVERY section (2-3 per section minimum)");
//   }
//   if (prefs.includeBoxesQuotesHighlights) {
//     validationChecklist.push("✅ Callout boxes/highlights appear in at least 2 sections");
//   }
//   if (prefs.includeQandA) {
//     validationChecklist.push("✅ Q&A section with <h2>Frequently Asked Questions</h2> and 3-5 Q&A pairs is included");
//   }

//   const formatInstructions = formatOptions.length > 0
//     ? `\n🎯🎯🎯 CONTENT FORMAT REQUIREMENTS (100% MANDATORY - USER ENABLED THESE):\n${formatOptions.map((opt, i) => `${i + 1}. ${opt}`).join("\n")}\n\n⚠️⚠️⚠️ CRITICAL VALIDATION CHECKLIST - BEFORE RETURNING JSON, VERIFY:\n${validationChecklist.map((item, i) => `${i + 1}. ${item}`).join("\n")}\n\n🔴 IF ANY CHECKLIST ITEM IS MISSING, YOUR RESPONSE IS INVALID. REGENERATE UNTIL ALL REQUIREMENTS ARE MET.\n\n⚠️ STRICT ENFORCEMENT:\n${prefs.includeBulletPoints ? "- Bullet points/lists MUST be present in 2-3 sections. NO EXCEPTIONS.\n" : ""}${prefs.includeTables ? "- At least one HTML table MUST be included. NO EXCEPTIONS.\n" : ""}${prefs.includeEmojis ? "- Emojis MUST appear in EVERY section (2-3 per section minimum). NO EXCEPTIONS. If you skip emojis in any section, the response is invalid.\n" : ""}${prefs.includeBoxesQuotesHighlights ? "- Callout boxes/highlights MUST appear in at least 2 sections. NO EXCEPTIONS.\n" : ""}${prefs.includeQandA ? "- A complete Q&A section MUST be included with proper headings. NO EXCEPTIONS.\n" : ""}\nDo NOT skip these requirements. The user specifically requested these format elements and they MUST appear 100% of the time.\n`
//     : "";

//   // Total content words target
//   const totalWordsLine = `Total article word count target: approximately ${prefs.totalContentWords} words (including all sections).`;

//   // Sections config - Modified to allow formatting when enabled
//   const hasFormatting = prefs.includeBulletPoints || prefs.includeTables || prefs.includeBoxesQuotesHighlights || prefs.includeQandA;
//   const sectionStructure = hasFormatting 
//     ? `Each section can contain: <h2>Conversational Title</h2><p>Paragraph text</p> PLUS format elements like lists, tables, boxes, or Q&A as specified in format requirements.`
//     : `Each section is EXACTLY: <h2>Conversational Title</h2><p>ONE paragraph only.</p>`;
  
//   // Uniqueness and variation instructions
//   const variationSeed = `${params.variationId}-${Date.now() % 100000}-${Math.floor(Math.random() * 100000)}`;
//   const uniquenessInstructions = [
//     `🔴🔴🔴 CRITICAL UNIQUENESS REQUIREMENTS (Variation #${params.variationId}, Seed: ${variationSeed}):`,
//     `- TITLE DUPLICATION RULE: The title MUST be completely unique. Section headings MUST NOT repeat the title or any significant part of it.`,
//     `  Example: If title is "The Enduring Appeal of Chelsea Boots", headings should NOT be "The Enduring Appeal of..." or "Chelsea Boots..." or "Why Chelsea Boots..." - they must be completely different topics/angles like "Building Your Perfect Outfit" or "Seasonal Styling Tips" or "Accessorising Your Ensemble".`,
//     `- HEADING-PARAGRAPH RULE: Each section heading and its first paragraph MUST be completely different. The paragraph MUST NOT start with the same words as its heading.`,
//     `  Example: If heading is "Decoding Dress Codes", the paragraph MUST NOT start with "Decoding dress codes" or "Dress codes" or "When it comes to dress codes" - instead start with completely different angles like:`,
//     `  * "One thing I've learned is that..."`,
//     `  * "Here's what works for me..."`,
//     `  * "I've noticed that..."`,
//     `  * "The key is to..."`,
//     `  * "When you're putting together..."`,
//     `  * "From my experience..."`,
//     `  * "Let me share something..."`,
//     `- NEVER duplicate content between sections. Each section must have unique content, examples, and perspectives.`,
//     `- Use different examples, scenarios, and anecdotes in each section. Don't repeat the same information.`,
//     `- Vary your writing style slightly between sections - some sections can be more narrative, others more practical, some more reflective.`,
//     `- Each paragraph within a section must add NEW information, not repeat what was already said.`,
//     `- Avoid generic phrases like "In this article", "As mentioned", "As we discussed", "Let's dive into", "Let's explore" - these make content feel repetitive and AI-generated.`,
//     `- Make each section feel like it was written independently, not as part of a template.`,
//     `- Start each section with a fresh perspective - don't use similar opening phrases. Mix up your introductions.`,
//     `- Quality requirement: Write comprehensive, well-defined content. Each section should feel valuable and complete. Avoid vague statements - be specific, concrete, and detailed.`,
//   ].join("\n");

//   const sectionsLine =
//     `Title must be ${prefs.titleLength} characters (exactly ${prefs.titleLength} chars).\n` +
//     `⚠️ TITLE-PARAGRAPH DUPLICATION RULE: The title and section headings MUST be completely different. Section headings must NOT repeat the title. Each section's first paragraph MUST NOT start with the same words as its heading. Start with a different angle or perspective.\n` +
//     `Write exactly ${prefs.sectionCount} content sections.\n` +
//     `${sectionStructure}\n` +
//     `Headings must be declarative (no '?' or '¿' or '!' in headings).\n` +
//     `⚠️ MINIMUM WORD COUNT PER SECTION: Each section MUST contain at least ${min} words (target ${target}, acceptable ${min}–${max}). Word count includes all content: paragraphs, lists, tables, etc. Sections with fewer than ${min} words are INVALID.\n` +
//     `Vary paragraph lengths; never identical.\n` +
//     `⚠️ Ensure each paragraph is substantial (minimum 50-60 words per paragraph). Short paragraphs are only acceptable if they're part of a list or table.\n` +
//     `⚠️ CONTENT QUALITY: Write well-defined, comprehensive content. Each section should feel complete and valuable. Avoid vague statements - be specific and concrete.\n` +
//     totalWordsLine;

//   const conclusionLine = prefs.includeConclusion
//     ? [
//         `CONCLUSION RULES (ONLY IF TOGGLED ON BY USER):`,
//         `CONCLUSION Must be 100+ words long. this is main and conclusion word is needed at the end heading must be conclusion only in selected language`,
//         `- After the ${prefs.sectionCount} sections, append exactly ONE final Conclusion section.`,
//         `- Use a natural <h2> heading in the selected language (e.g., "Conclusion" / "निष्कर्ष" / "Заключение").`,
//         `- Structure is EXACTLY: <h2>...</h2><p>ONE paragraph only.</p>`,
//         `- Do NOT include any tokens/keywords in the Conclusion.`,
//         `- Conclusion should not end with a keyword, and should feel human and reflective (not repetitive).`,
//       ].join("\n")
//     : `Do NOT write a Conclusion section.`;

//   // Enhanced Human-like writing rules to evade AI detectors (target <20% AI score)
//   const humanizeRules = [
//     `HUMAN-LIKE WRITING RULES (CRITICAL - AI DETECTION SCORE MUST BE <15%):`,
//     `- Write as if you're a real person sharing thoughts: use contractions (I'm, don't, it's, you'll, we've, can't, won't, isn't), casual phrasing, and occasional filler words like "you know", "kinda", "pretty much", "sort of", "basically" naturally.`,
//     `- Vary sentence lengths WILDLY: mix very short punchy ones (3-8 words) with longer flowing ones (20-40 words). Never keep uniform structure.`,
//     `- Include small imperfections: slightly run-on sentences occasionally, natural digressions, personal anecdotes, minor opinions scattered throughout.`,
//     `- Use natural transitions: "So", "And", "But", "Plus", "Still", "Though", "Actually", "Honestly", "To be fair", "Personally", "Look", "Here's the thing", "Now" - start some sentences with these.`,
//     `- Include first-person occasionally when natural: "I've noticed", "In my experience", "From what I've seen", "I've found that", "I think", "I'd say", "I reckon" - but don't overdo it (1-2 per section max).`,
//     `- Add conversational asides in parentheses (like this one) or use em dashes naturally — not too often (maybe 1-2 per section).`,
//     `- Use approximate numbers: "around 50", "roughly 3-4", "about a dozen", "maybe 70-80%", "somewhere between 20 and 30", "probably 5-6", "at least a couple" instead of exact numbers.`,
//     `- Include rhetorical questions naturally mid-paragraph: "Why does this matter?", "What's the catch?", "Sound familiar?", "See what I mean?" - but sparingly (1-2 per article max).`,
//     `- Add personality: use opinions ("which is pretty cool", "surprisingly effective", "not gonna lie", "to be honest", "I gotta say"), emotional words ("frustrating", "exciting", "confusing", "annoying", "surprising", "amazing").`,
//     `- Vary paragraph lengths: some 2-3 sentences, others 5-8 sentences. Never make them all the same length.`,
//     `- Use everyday language; avoid jargon unless explained casually. Avoid overly formal phrases like "Moreover", "Furthermore", "In conclusion", "It is important to note", "It should be noted that".`,
//     `- Make it feel spontaneous: include slight tangents that naturally come back to the main point, like real conversation.`,
//     `- Include real-world examples and scenarios, not generic theory - make it feel lived-in and authentic. Use specific details like "I saw this guy at the coffee shop", "my friend tried this", "last week I noticed".`,
//     `- IMPORTANT: Do NOT add excessive rhetorical questions or exclamation marks. Avoid "?" and "!" unless strictly required grammatically.`,
//     `- Keep grammar natural and readable — do not overuse parentheses, em dashes, or ellipses.`,
//     `- Write in a way that feels like a human wrote it in one sitting, with natural flow and occasional imperfections.`,
//     `- Use natural speech patterns: "I mean", "you see", "thing is", "the way I see it", "honestly", "frankly" - but don't overdo it.`,
//     `- Avoid repetitive sentence starts - mix up how you begin sentences. Don't start multiple paragraphs with the same word or phrase.`,
//     `- Add subtle personality quirks: occasional regional phrases, casual interjections, natural pauses.`,
//     `- Write with confidence but also with a touch of humility - like you're sharing knowledge, not lecturing.`,
//   ].join("\n");

//   // Hard constraints for keywords
//   const keywordHardRules = [
//     `KEYWORD HARD RULES:`,
//     `- You will receive machine-visible tokens: ${tokens}`,
//     `- ${placement}`,
//     `- Exactly ONE keyword token per paragraph (only where specified).`,
//     `- Do not include any token in title or any type of heading.`,
//     `- Do NOT repeat a keyword in the same paragraph.`,
//     `- Do NOT include any other keyword (token or raw text) in that paragraph.`,
//     `- Do NOT add keyword at the end of a paragraph or line.`,
//     `- NEVER place a token/keyword at the END of a paragraph; keep at least 3 words AFTER it.`,
//   ].join("\n");

//   // Build final validation reminder
//   const finalValidation = formatOptions.length > 0
//     ? `\n\n🔴🔴🔴 FINAL VALIDATION BEFORE RETURNING JSON 🔴🔴🔴\nBefore you generate the JSON, check:\n${validationChecklist.map((item, i) => `${i + 1}. ${item}`).join("\n")}\n\n1. UNIQUENESS CHECK: Ensure title and section headings are completely different. Ensure each paragraph doesn't start with its heading.\n2. FORMAT CHECK: If ANY item is missing, your response is INVALID. You MUST regenerate until ALL items are present.\n\n⚠️ REMEMBER: User enabled these features expecting 100% consistency. If emojis are enabled, they MUST appear in EVERY section. If bullet points are enabled, they MUST appear in 2-3 sections. If Q&A is enabled, it MUST be included. No exceptions.\n\n⚠️ QUALITY CHECK: Ensure content is well-defined, comprehensive, and feels like a real person wrote it. Avoid repetitive phrases, generic statements, and AI-like patterns.\n`
//     : `\n\n🔴🔴🔴 FINAL VALIDATION BEFORE RETURNING JSON 🔴🔴🔴\nBefore you generate the JSON, check:\n1. UNIQUENESS CHECK: Ensure title and section headings are completely different. Ensure each paragraph doesn't start with its heading.\n2. QUALITY CHECK: Ensure content is well-defined, comprehensive, and feels like a real person wrote it. Avoid repetitive phrases, generic statements, and AI-like patterns.\n`;

//   const plan = [
//     `Return ONLY JSON: {"title": "...", "html": "..."}. No markdown/code fences.`,
//     ``,
//     // 🎯🎯🎯 FORMAT REQUIREMENTS AT THE TOP - HIGHEST PRIORITY 🎯🎯🎯
//     formatInstructions,
//     ``,
//     languageDirective(prefs.language),
//     moodDirectives(prefs.mood),
//     ``,
//     humanizeRules,
//     ``,
//     sectionsLine,
//     conclusionLine,
//     ``,
//     // 🔴 UNIQUENESS AND VARIATION RULES
//     uniquenessInstructions,
//     ``,
//     keywordHardRules,
//     ``,
//     `Additional user instructions (highest priority): ${prefs.extraInstructions || "(none)"}`,
//     ``,
//     `Do NOT copy these instructions into the html. Write ORIGINAL html only.`,
//     // 🎯 Final validation reminder
//     finalValidation,
//   ].filter(Boolean).join("\n");

//   return plan;
// }



// // src/lib/llm/prompt-engine.ts
// import type { ContentPreferences } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Minimal, reliable prompt builder (multilingual-safe)
//  * ──────────────────────────────────────────────────────────── */

// function languageDirective(label?: string) {
//   const L = (label || "English (US)").trim();
//   return [
//     `LANGUAGE: Write the entire article in "${L}" using its native script.`,
//     `Avoid mixing other languages. Use natural punctuation for "${L}".`,
//   ].join("\n");
// }

// function moodDirective(mood: ContentPreferences["mood"]) {
//   switch (mood) {
//     case "Entertaining":  return "TONE: Conversational and engaging.";
//     case "Informative":   return "TONE: Clear, friendly, to the point.";
//     case "Inspirational": return "TONE: Warm, encouraging, practical.";
//     case "Humorous":      return "TONE: Light, playful (no slapstick).";
//     case "Emotional":     return "TONE: Honest and personal.";
//     case "Educational":   return "TONE: Helpful teacher vibe; simple explanations.";
//     default:              return "TONE: Natural and useful.";
//   }
// }

// function tokenPlacementGuide(keywords: string[], includeConclusion: boolean) {
//   // Keep it ultra simple and deterministic for the model.
//   if (keywords.length <= 1) {
//     return `Insert [ANCHOR:${keywords[0]}] once in Section 1 paragraph.`;
//   }
//   if (keywords.length === 2) {
//     return `Insert [ANCHOR:${keywords[0]}] in Section 1 and [ANCHOR:${keywords[1]}] in Section 3 paragraphs.`;
//   }
//   const firstFour = keywords.slice(0, 4).map((k, i) => `Section ${i + 1} → [ANCHOR:${k}]`).join("; ");
//   const tail = includeConclusion ? " Do NOT put tokens in Conclusion." : "";
//   return `Place exactly one token in the first four sections: ${firstFour}.${tail}`;
// }

// function featuresBlock(prefs: ContentPreferences) {
//   const lines: string[] = ["FORMAT FEATURES (follow exactly if enabled):"];
//   if (prefs.includeBulletPoints) {
//     lines.push("- Add <ul><li>...</li></ul> lists in at least two different sections (4–5 items each).");
//   }
//   if (prefs.includeTables) {
//     lines.push("- Include one <table> with <thead> and <tbody> to present a small comparison or summary (3–5 rows).");
//   }
//   if (prefs.includeBoxesQuotesHighlights) {
//     lines.push("- Add at least two callouts: either <blockquote>…</blockquote> or a simple <div style=\"background:#f6f7f9;padding:12px;border-left:4px solid #999\">…</div> to highlight tips/warnings.");
//   }
//   if (prefs.includeEmojis) {
//     lines.push("- Use 1–2 relevant emojis per section (in heading or first sentence). Keep tasteful.");
//   }
//   if (prefs.includeQandA) {
//     lines.push("- After the main sections (and before/after Conclusion), add a dedicated FAQ section: <h2>Frequently Asked Questions</h2> with 3–5 pairs of <h3>Q</h3><p>A</p>.");
//   }
//   return lines.join("\n");
// }

// function structureBlock(prefs: ContentPreferences, keywords: string[]) {
//   // Word targets are guidance; we avoid hard fails that cause truncation.
//   const perParaTarget = Math.max(60, Number(prefs.paragraphWords || 100));
//   const totalTarget = Number(prefs.totalContentWords || 800);
//   const titleMax = Number(prefs.titleLength || 100);

//   return [
//     `OUTPUT CONTRACT: Return ONLY valid JSON { "title": string, "html": string } (no markdown fences).`,
//     `TITLE: <= ${titleMax} characters, unique, and naturally include at least one keyword.`,
//     "",
//     `STRUCTURE:`,
//     `- Write exactly ${prefs.sectionCount} main sections.`,
//     `- Each section: <h2>Concise declarative heading</h2><p>${perParaTarget - 10}–${perParaTarget + 20} words, specific, non-repetitive.</p>`,
//     prefs.includeConclusion
//       ? `- Append ONE final Conclusion section: <h2>Conclusion</h2><p>~100–150 words, reflective, no new token.</p>`
//       : `- Do NOT include a Conclusion section.`,
//     "",
//     `KEYWORD TOKENS:`,
//     `- ${tokenPlacementGuide(keywords, !!prefs.includeConclusion)}`,
//     `- Insert tokens exactly as [ANCHOR:keyword]; not in titles/headings.`,
//     "",
//     featuresBlock(prefs),
//     "",
//     `QUALITY: Concrete tips, examples, and simple sentences. Avoid fluff and rhetorical questions spam. Keep headings declarative.`,
//     "",
//     `IMPORTANT: Do NOT include the instructions in the html. Produce original HTML only.`,
//   ].join("\n");
// }

// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number; // kept for API compatibility (not used here)
// }) {
//   const { keywords, prefs } = params;

//   const plan = [
//     languageDirective(prefs.language),
//     moodDirective(prefs.mood),
//     structureBlock(prefs, keywords),
//     `EXTRA USER NOTES: ${prefs.extraInstructions || "(none)"}`,
//   ].join("\n\n");

//   return plan;
// }



// // src/lib/llm/prompt-engine.ts
// //
// // Single source of truth for ALL prompt logic.
// // - api.ts must NOT contain any prompt rules (only JSON envelope).
// // - use-content-generation.ts calls buildPlanFromPrefs() and passes it into generateJSONTitleHtml().
// // - This file defines how preferences → content brief.
// // - Instructions are ALWAYS in English.
// // - Generated content MUST be in the user-selected language (strict).

// import type { ContentPreferences } from "@/hooks/use-preferences";

// /* ──────────────────────────
//  * Language helpers
//  * ────────────────────────── */

// type LangCode = "en" | "hi" | "es" | "ru";

// function lcOf(label?: string): LangCode {
//   const t = (label || "").toLowerCase();

//   if (t.includes("hindi") || t.includes("हिन्दी") || t.includes("हिंदी")) {
//     return "hi";
//   }
//   if (t.includes("spanish") || t.includes("español")) {
//     return "es";
//   }
//   if (t.includes("russian") || t.includes("рус")) {
//     return "ru";
//   }
//   return "en";
// }

// /* ──────────────────────────
//  * Core directives
//  * ────────────────────────── */

// function languageDirective(label?: string): string {
//   const selected = (label || "English (US)").trim();

//   return [
//     "LANGUAGE RULES (CRITICAL):",
//     `- The entire response (title, headings, paragraphs, bullet points, tables, Q&A, conclusion) MUST be written only in: "${selected}".`,
//     "- Do NOT mix any other language anywhere. No Hinglish, no mixed phrases.",
//     "- Do NOT add any keywords in title or headings . most important",
//     "- Do NOT use transliteration (e.g., Hindi written in Latin script) unless that language itself normally uses that script.",
//     "- If you accidentally generate any line/phrase in a different language, rewrite it into the selected language BEFORE returning the final JSON.",
//   ].join("\n");
// }

// function moodDirective(mood: ContentPreferences["mood"]): string {
//   switch (mood) {
//     case "Entertaining":
//       return "TONE: Conversational, story-driven, light and engaging, but still clear and useful.";
//     case "Informative":
//       return "TONE: Clear, structured, practical, minimal fluff.";
//     case "Inspirational":
//       return "TONE: Warm, encouraging, grounded in realistic advice.";
//     case "Humorous":
//       return "TONE: Light, subtle humour; never cringe, forced or overused jokes.";
//     case "Emotional":
//       return "TONE: Empathetic, human and sincere. Avoid melodrama.";
//     case "Educational":
//       return "TONE: Simple explanations, step-by-step clarity, like a good teacher.";
//     default:
//       return "TONE: Natural, confident, friendly and human.";
//   }
// }

// function bounds(paragraphWords?: number) {
//   const t = Math.max(60, Number(paragraphWords || 100));
//   return {
//     target: t,
//     min: Math.floor(t * 0.8),
//     max: Math.ceil(t * 1.35),
//   };
// }

// /* ──────────────────────────
//  * Format requirements from toggles
//  * ────────────────────────── */

// function formatRequirements(prefs: ContentPreferences): {
//   text: string;
//   checklist: string[];
// } {
//   const lines: string[] = [];
//   const checklist: string[] = [];

//   if (prefs.includeBulletPoints) {
//     lines.push(
//       "- Include bullet or numbered lists (<ul>/<ol>) in at least 2 different sections where they naturally help clarity."
//     );
//     checklist.push(
//       "- Bullet/numbered lists are present in at least 2 sections.",
//       "- Do not add bullet points in conclusion.",
//     );
//   }

//   if (prefs.includeTables) {
//     lines.push(
//       "- Include at least one clean HTML table (<table><thead>...</thead><tbody>...</tbody></table>) to present comparisons, data or key points."
//     );
//     checklist.push("- At least one <table> is included.");
//   }

//   if (prefs.includeEmojis) {
//     lines.push(
//       "- Use emojis naturally across the article (especially headings or key lines), 1–3 per section max. Never spam. Emojis MUST match the selected language's tone and context."
//     );
//     checklist.push(
//       "- Emojis appear naturally in multiple sections, without spam."
//     );
//   }

//   if (prefs.includeBoxesQuotesHighlights) {
//     lines.push(
//       "- Use at least 1–2 callout/quote/highlight blocks to emphasize important tips. Example: <blockquote>...</blockquote> or a simple highlighted <div>."
//     );
//     checklist.push(
//       "- At least one callout/quote/highlight block is present."
//     );
//   }

//   if (prefs.includeQandA) {
//     lines.push(
//       "- Include one dedicated FAQ / Q&A section near the end with 3–6 common questions and answers."
//     );
//     lines.push(
//       "- Every question AND every answer in the Q&A section MUST be written 100% in the selected language. No mixing English + another language."
//     );
//     checklist.push(
//       "- A Q&A / FAQ section exists with 3–6 Q&A pairs, entirely in the selected language with no mixed-language lines."
//     );
//   }

//   const text = lines.length
//     ? [
//         "FORMAT OPTIONS (BASED ON USER TOGGLES):",
//         ...lines,
//       ].join("\n")
//     : "FORMAT: Use clean HTML with headings and paragraphs. No markdown fences.";

//   return { text, checklist };
// }

// /* ──────────────────────────
//  * Keyword / anchor rules
//  * ────────────────────────── */

// function keywordRules(keywords: string[], includeConclusion: boolean): string {
//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`);
//   let placement =
//     "- Use at most one anchor token per relevant paragraph, only for the matching keyword.\n" +
//     "- Do not put anchor tokens in the title or in any headings.\n" +
//     "- Do not put bullet points in conclusion and numbers in conclusion\n" +
//     "- Never place a token at the very end of a paragraph; always keep at least 3+ words after it.";

//   if (keywords.length === 1) {
//     placement +=
//       "\n- Focus the single keyword token in the early body sections, not the conclusion.";
//   } else if (keywords.length === 2) {
//     placement +=
//       "\n- Use keyword #1 earlier, keyword #2 slightly later. Keep distribution natural.";
//   } else if (keywords.length >= 3) {
//     placement +=
//       "\n- Spread the first 3–4 keywords across different sections so they do not cluster in one paragraph.";
//   }

//   if (includeConclusion) {
//     placement += "\n- Do NOT add any anchor token or hard keyword targeting inside the conclusion.";
//   }

//   return [
//     "KEYWORDS & TOKENS:",
//     `- You may see machine tokens like: ${tokens.join(" ")}`,
//     "- Replace each token with a natural keyword usage or anchor as instructed by caller.",
//     placement,
//   ].join("\n");
// }

// /* ──────────────────────────
//  * Structure + length rules
//  * ────────────────────────── */

// function structureRules(prefs: ContentPreferences): string {
//   const { min, max, target } = bounds(prefs.paragraphWords);
//   const total = prefs.totalContentWords || 0;

//   const lines: string[] = [];

//   lines.push(
//     `- Write exactly ${prefs.sectionCount} main sections before any conclusion (if enabled).`
//   );
//   lines.push(
//     "- Each main section MUST start with an <h2> heading, followed by rich HTML content (paragraphs, lists, tables, etc. as allowed)."
//   );
//   lines.push(
//     `- Each section's total body content (not counting HTML tags) should be around ${target} words (acceptable range ${min}–${max}).`
//   );
//   lines.push(
//     "- Headings must be declarative (no question marks), short, and not copy-paste of the title."
//   );
//   lines.push(
//     "- The first paragraph under each heading must NOT repeat the exact heading text or start with the same phrase."
//   );

//   if (total > 0) {
//     lines.push(
//       `- Aim for an overall article length close to ${total} words (not exact, but in that range).`
//     );
//   }

//   if (prefs.includeConclusion) {
//     lines.push(
//       "- After the main sections, add ONE conclusion section: <h2>Conclusion (translated into selected language)</h2><p>One strong, 100+ word paragraph.</p>"
//     );
//     lines.push(
//       "- The conclusion must summarize naturally, not stuff keywords, and must be in the same language."
//     );
//   } else {
//     lines.push("- Do NOT add a conclusion section unless explicitly requested.");
//   }

//   return ["STRUCTURE & LENGTH:", ...lines].join("\n");
// }

// /* ──────────────────────────
//  * Uniqueness + human-like rules
//  * ────────────────────────── */

// function uniquenessAndHumanity(variationId: number): string {
//   return [
//     `UNIQUENESS & HUMAN-LIKE WRITING (Variation #${variationId}):`,
//     "- The title must be unique and must NOT be reused as any section heading.",
//     "- Section headings must be distinct from each other and from the title.",
//     "- Do not start paragraphs with the same repeated phrase across sections.",
//     "- Avoid generic filler like “In this article we will discuss” or “Let’s dive into”.",
//     "- Each section should add new, specific, concrete information (examples, tips, scenarios). No copy-paste across sections.",
//     "- Vary sentence lengths naturally. Mix short and longer sentences.",
//     "- Use natural contractions if the selected language uses them (e.g., in English: I'm, don't, it's).",
//     "- No overuse of exclamation marks. Use '?' only when truly needed.",
//     "- The text should read like one thoughtful human wrote it in one go.",
//   ].join("\n");
// }

// /* ──────────────────────────
//  * Final validation block
//  * ────────────────────────── */

// function finalValidationBlock(
//   checklist: string[]
// ): string {
//   const base: string[] = [
//     "FINAL VALIDATION BEFORE RETURNING JSON:",
//     "- Ensure the ENTIRE content (title, headings, body, lists, tables, Q&A, conclusion) is in the selected language only.",
//     "- Ensure no mixed-language lines exist. If found, fix them before returning.",
//     "- Ensure title, headings, and paragraphs follow the uniqueness rules.",
//     "- Ensure HTML is clean (<h2>, <p>, <ul>, <ol>, <li>, <table>, <thead>, <tbody>, <tr>, <th>, <td>, <blockquote>, etc.). No markdown fences.",
//   ];

//   if (checklist.length) {
//     base.push(
//       "- Ensure all enabled format options are present:",
//       ...checklist
//     );
//   }

//   base.push(
//     "- If any of the above conditions are not met, internally correct and only then output the final JSON."
//   );

//   return base.join("\n");
// }

// /* ──────────────────────────
//  * Public: buildPlanFromPrefs
//  * ────────────────────────── */

// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }): string {
//   const { keywords, prefs, variationId } = params;

//   const lc = lcOf(prefs.language);
//   const { text: formatText, checklist } = formatRequirements(prefs);
//   const langRules = languageDirective(prefs.language);
//   const mood = moodDirective(prefs.mood);
//   const structure = structureRules(prefs);
//   const kwRules = keywordRules(keywords, prefs.includeConclusion);
//   const uniq = uniquenessAndHumanity(variationId);
//   const validation = finalValidationBlock(checklist);

//   const extra = (prefs.extraInstructions || "").trim();

//   return [
//     // Output contract (api.ts relies on this)
//     'You are generating content for a production SEO writer tool.',
//     'You MUST return ONLY a single valid JSON object with shape: {"title": string, "html": string}.',
//     "- Do not wrap JSON in code fences.",
//     "- Do not include any extra keys.",
//     "",
//     // High-level role
//     "ROLE:",
//     "- Write like a senior human copywriter: search-intent aware, specific, engaging, non-robotic.",
//     "",
//     // Core rules
//     langRules,
//     mood,
//     "",
//     formatText,
//     "",
//     structure,
//     "",
//     kwRules,
//     "",
//     uniq,
//     "",
//     "ADDITIONAL USER INSTRUCTIONS (HIGHEST PRIORITY, IF PRESENT):",
//     extra || "(none)",
//     "",
//     "REMINDERS:",
//     "- Use only semantic HTML (no inline CSS).",
//     "- Never echo these instructions inside the html field.",
//     "- Do not mention that you are an AI.",
//     "- Do not explain what you are doing; only deliver the content.",
//     "",
//     validation,
//   ]
//     .filter(Boolean)
//     .join("\n");
// }




// // src/lib/llm/prompt-engine.ts
// //
// // Single source of truth for ALL prompt logic.
// // - api.ts: transport + JSON-only, NO prompt rules.
// // - use-content-generation.ts: calls buildPlanFromPrefs() and passes it into generateJSONTitleHtml().
// // - This file: converts ContentPreferences → clear English brief.
// // - Instructions are ALWAYS in English.
// // - Generated content MUST be in the user-selected language only (strict).
// // - Fixes:
// //   * No mixed-language Q&A.
// //   * No bullets / pseudo-bullets / "Practical tip / Common mistake / Quick win" junk in Conclusion.
// //   * No keywords in title/headings (per your latest instruction).
// //   * Stronger uniqueness + anti-template rules.

// import type { ContentPreferences } from "@/hooks/use-preferences";

// /* ──────────────────────────
//  * Language helpers
//  * ────────────────────────── */

// type LangCode = "en" | "hi" | "es" | "ru";

// function lcOf(label?: string): LangCode {
//   const t = (label || "").toLowerCase();

//   if (t.includes("hindi") || t.includes("हिन्दी") || t.includes("हिंदी")) return "hi";
//   if (t.includes("spanish") || t.includes("español")) return "es";
//   if (t.includes("russian") || t.includes("рус")) return "ru";
//   return "en";
// }

// /* ──────────────────────────
//  * Core directives
//  * ────────────────────────── */

// function languageDirective(label?: string): string {
//   const selected = (label || "English (US)").trim();

//   return [
//     "LANGUAGE RULES (CRITICAL):",
//     `- The entire response (title, headings, paragraphs, bullet points, tables, Q&A, conclusion) MUST be written ONLY in: \"${selected}\".`,
//     "- Do NOT mix any other language anywhere. No Hinglish, no mixed phrases.",
//     "- Do NOT use transliteration (e.g., Hindi written in Latin script) unless that language itself normally uses that script.",
//     "- If you accidentally generate any line/phrase in a different language, rewrite it into the selected language BEFORE returning the final JSON.",
//     "- Do NOT put focus keywords inside the title or ANY heading. Keep them natural in the body only."
//   ].join("\n");
// }

// function moodDirective(mood: ContentPreferences["mood"]): string {
//   switch (mood) {
//     case "Entertaining":
//       return "TONE: Conversational, story-driven, light and engaging, but still clear and useful.";
//     case "Informative":
//       return "TONE: Clear, structured, practical, minimal fluff.";
//     case "Inspirational":
//       return "TONE: Warm, encouraging, grounded in realistic advice.";
//     case "Humorous":
//       return "TONE: Light, subtle humour; never cringe, forced or overused jokes.";
//     case "Emotional":
//       return "TONE: Empathetic, human and sincere. Avoid melodrama.";
//     case "Educational":
//       return "TONE: Simple explanations, step-by-step clarity, like a good teacher.";
//     default:
//       return "TONE: Natural, confident, friendly and human.";
//   }
// }

// function bounds(paragraphWords?: number) {
//   const t = Math.max(60, Number(paragraphWords || 100));
//   return {
//     target: t,
//     min: Math.floor(t * 0.8),
//     max: Math.ceil(t * 1.35),
//   };
// }

// /* ──────────────────────────
//  * Format requirements from toggles
//  * ────────────────────────── */

// function formatRequirements(
//   prefs: ContentPreferences
// ): { text: string; checklist: string[] } {
//   const lines: string[] = [];
//   const checklist: string[] = [];

//   if (prefs.includeBulletPoints) {
//     lines.push(
//       "- Include bullet or numbered lists (<ul>/<ol>) in at least 2 different MAIN sections where they naturally help clarity."
//     );
//     lines.push(
//       "- Do NOT use bullet lists or bullet-style one-liners (e.g., “Practical tip”, “Common mistake”, “Quick win”) inside the Conclusion."
//     );
//     checklist.push(
//       "- Bullet/numbered lists are present in at least 2 non-conclusion sections.",
//       "- No <ul>, <ol>, <li> or bullet-style stub lines appear in the Conclusion."
//     );
//   }

//   if (prefs.includeTables) {
//     lines.push(
//       "- Include at least one clean HTML table (<table><thead>...</thead><tbody>...</tbody></table>) to present comparisons, data or key points."
//     );
//     checklist.push("- At least one <table> is included.");
//   }

//   if (prefs.includeEmojis) {
//     lines.push(
//       "- Use emojis naturally in headings or key lines, around 1–3 per section max. Never spam. Emojis MUST fit the context and tone."
//     );
//     checklist.push(
//       "- Emojis appear naturally across sections without spam."
//     );
//   }

//   if (prefs.includeBoxesQuotesHighlights) {
//     lines.push(
//       "- Use at least 1–2 callout/quote/highlight blocks to emphasize important tips. Example: <blockquote>...</blockquote> or a simple highlighted <div>...</div>."
//     );
//     checklist.push(
//       "- At least one callout/quote/highlight block is present."
//     );
//   }

//   if (prefs.includeQandA) {
//     lines.push(
//       "- Include one dedicated FAQ / Q&A section near the end with 3–6 common questions and answers."
//     );
//     lines.push(
//       "- Every question AND answer in the Q&A section MUST be fully in the selected language. Absolutely NO mixed-language lines."
//     );
//     checklist.push(
//       "- A Q&A / FAQ section exists with 3–6 Q&A pairs, entirely in the selected language, no mixed-language content."
//     );
//   }

//   const text =
//     lines.length > 0
//       ? ["FORMAT OPTIONS (BASED ON USER TOGGLES):", ...lines].join("\n")
//       : "FORMAT: Use clean HTML with headings and paragraphs. No markdown fences.";

//   return { text, checklist };
// }

// /* ──────────────────────────
//  * Keyword / anchor rules
//  * ────────────────────────── */

// function keywordRules(
//   keywords: string[],
//   includeConclusion: boolean
// ): string {
//   const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`);

//   let placement =
//     "- Use at most one anchor token per relevant paragraph, only for the matching keyword.\n" +
//     "- Do NOT put anchor tokens in the title or in ANY heading.\n" +
//     "- Never place a token at the very end of a paragraph; always keep at least 3+ words after it.";

//   if (keywords.length === 1) {
//     placement +=
//       "\n- Use the single keyword token in the main body sections only, never in the conclusion.";
//   } else if (keywords.length === 2) {
//     placement +=
//       "\n- Use keyword #1 in earlier sections, keyword #2 in later sections. Keep it natural.";
//   } else if (keywords.length >= 3) {
//     placement +=
//       "\n- Spread the first 3–4 keywords across different sections so they never cluster in one paragraph.";
//   }

//   if (includeConclusion) {
//     placement +=
//       "\n- Do NOT add any anchor token or hard keyword targeting inside the conclusion.";
//   }

//   return [
//     "KEYWORDS & TOKENS:",
//     tokens.length
//       ? `- You may see machine tokens like: ${tokens.join(" ")}`
//       : "- You may see machine tokens like [ANCHOR:...].",
//     "- Replace each token with a natural keyword usage or anchor as instructed by the caller.",
//     placement,
//   ].join("\n");
// }

// /* ──────────────────────────
//  * Structure + length rules
//  * ────────────────────────── */

// function structureRules(prefs: ContentPreferences): string {
//   const { min, max, target } = bounds(prefs.paragraphWords);
//   const total = prefs.totalContentWords || 0;

//   const lines: string[] = [];

//   lines.push(
//     `- Write exactly ${prefs.sectionCount} main sections BEFORE any conclusion (if enabled).`
//   );
//   lines.push(
//     "- Each main section MUST start with an <h2> heading, followed by rich HTML content (paragraphs, lists, tables, etc. depending on toggles)."
//   );
//   lines.push(
//     `- Each section's total body content (excluding HTML tags) should be around ${target} words (acceptable range ${min}–${max}).`
//   );
//   lines.push(
//     "- Headings must be declarative (no '?'), short, and MUST NOT copy the title."
//   );
//   lines.push(
//     "- The first paragraph under each heading must NOT repeat the heading text or start with the same wording."
//   );

//   if (total > 0) {
//     lines.push(
//       `- Aim for an overall article length close to ${total} words (flexible, not exact).`
//     );
//   }

//   if (prefs.includeConclusion) {
//     lines.push(
//       "- After the main sections, add ONE conclusion section."
//     );
//     lines.push(
//       "- Conclusion heading: use the natural translation of \"Conclusion\" in the selected language, wrapped in <h2>."
//     );
//     lines.push(
//       "- Conclusion body: EXACTLY ONE continuous <p> of at least 100 words."
//     );
//     lines.push(
//       "- Do NOT include <ul>, <ol>, <li>, numbered lists, or bullet-style standalone lines in the conclusion."
//     );
//     lines.push(
//       "- Do NOT include template phrases like \"Practical tip\", \"Common mistake\", \"Quick win\" as separate lines in the conclusion. If you want to mention such ideas, blend them into normal sentences inside the single paragraph."
//     );
//   } else {
//     lines.push(
//       "- Do NOT add a conclusion section unless enabled."
//     );
//   }

//   return ["STRUCTURE & LENGTH:", ...lines].join("\n");
// }

// /* ──────────────────────────
//  * Uniqueness + human-like rules
//  * ────────────────────────── */

// function uniquenessAndHumanity(variationId: number): string {
//   return [
//     `UNIQUENESS & HUMAN-LIKE WRITING (Variation #${variationId}):`,
//     "- Title must be unique and MUST NOT be reused as any section heading.",
//     "- Section headings must all be different from each other and from the title.",
//     "- Avoid templates: do NOT output repeated stub lines like \"Practical tip\", \"Common mistake\", \"Quick win\" as separate bullets or lines.",
//     "- Do not start multiple sections or paragraphs with the same phrase.",
//     "- Avoid generic filler like \"In this article we will discuss\", \"Let's dive into\", \"As we all know\".",
//     "- Each section must add specific, concrete, non-duplicated information (examples, scenarios, tips).",
//     "- Vary sentence lengths naturally; mix short and longer sentences.",
//     "- Use natural contractions if appropriate for the selected language.",
//     "- Avoid overusing '!' and '?'; keep punctuation natural.",
//     "- The text must feel like one human wrote it in a single, thoughtful pass."
//   ].join("\n");
// }

// /* ──────────────────────────
//  * Final validation block
//  * ────────────────────────── */

// function finalValidationBlock(checklist: string[]): string {
//   const base: string[] = [
//     "FINAL VALIDATION BEFORE RETURNING JSON:",
//     "- Ensure the ENTIRE content (title, headings, body, lists, tables, Q&A, conclusion) is in the selected language ONLY.",
//     "- Ensure there are NO mixed-language lines anywhere. Fix them before returning.",
//     "- Ensure title, headings, and paragraphs follow uniqueness rules.",
//     "- Ensure clean HTML only (<h2>, <p>, <ul>, <ol>, <li>, <table>, <thead>, <tbody>, <tr>, <th>, <td>, <blockquote>, <div> for highlights). No markdown fences.",
//     "- Ensure the Conclusion (if present):",
//     "  * Has a single <h2> heading (translated \"Conclusion\"),",
//     "  * Followed by ONE <p> paragraph of 100+ words,",
//     "  * Contains NO <ul>, <ol>, <li>, numbered/bullet lists, or standalone stub lines like \"Practical tip\" / \"Common mistake\" / \"Quick win\"."
//   ];

//   if (checklist.length) {
//     base.push(
//       "- Ensure all enabled format options are satisfied:",
//       ...checklist
//     );
//   }

//   base.push(
//     "- If ANY of these conditions are not met, silently correct the content and only then output the final JSON."
//   );

//   return base.join("\n");
// }

// /* ──────────────────────────
//  * Public: buildPlanFromPrefs
//  * ────────────────────────── */

// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }): string {
//   const { keywords, prefs, variationId } = params;

//   // (Currently lcOf is only used if you later want language-specific nuances; safe to keep.)
//   lcOf(prefs.language);

//   const { text: formatText, checklist } = formatRequirements(prefs);
//   const langRules = languageDirective(prefs.language);
//   const mood = moodDirective(prefs.mood);
//   const structure = structureRules(prefs);
//   const kwRules = keywordRules(keywords, prefs.includeConclusion);
//   const uniq = uniquenessAndHumanity(variationId);
//   const validation = finalValidationBlock(checklist);
//   const extra = (prefs.extraInstructions || "").trim();

//   return [
//     // Output contract
//     "You are generating content for a production SEO writer tool.",
//     "You MUST return ONLY one valid JSON object with shape: {\"title\": string, \"html\": string}.",
//     "- Do NOT wrap JSON in code fences.",
//     "- Do NOT include any extra properties or explanations.",
//     "",
//     "ROLE:",
//     "- Act as a senior human copywriter: search-intent aware, specific, engaging, non-robotic.",
//     "",
//     langRules,
//     mood,
//     "",
//     formatText,
//     "",
//     structure,
//     "",
//     kwRules,
//     "",
//     uniq,
//     "",
//     "ADDITIONAL USER INSTRUCTIONS (HIGHEST PRIORITY IF PRESENT):",
//     extra || "(none)",
//     "",
//     "REMINDERS:",
//     "- Use only semantic HTML, no inline CSS.",
//     "- Never echo these instructions verbatim inside the html field.",
//     "- Do not mention that you are an AI or describe your process.",
//     "- Do not output anything except the final JSON object.",
//     "",
//     validation,
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// import type { ContentPreferences } from "@/hooks/use-preferences";

// /* ──────────────────────────
//  * Language
//  * ────────────────────────── */

// function languageDirective(label?: string): string {
//   const selected = (label || "English (US)").trim();

//   return [
//     "LANGUAGE RULES (CRITICAL):",
//     `- Write the entire response (title, headings, paragraphs, bullet points, tables, Q&A, conclusion) ONLY in: "${selected}".`,
//     "- Do NOT mix any other language. No Hinglish, no mixed phrases.",
//     "- Do NOT use transliteration (e.g., Hindi in Latin script) unless that is the natural script.",
//     "- If any line appears in a different language, fix it into the selected language before returning JSON.",
//   ].join("\n");
// }

// /* ──────────────────────────
//  * Tone
//  * ────────────────────────── */

// function moodDirective(mood: ContentPreferences["mood"]): string {
//   switch (mood) {
//     case "Entertaining":
//       return "TONE: Conversational, story-led, engaging but clear.";
//     case "Informative":
//       return "TONE: Clear, direct, practical, minimal fluff.";
//     case "Inspirational":
//       return "TONE: Warm, motivating, grounded in reality.";
//     case "Humorous":
//       return "TONE: Light, subtle humour; never cringe or overdone.";
//     case "Emotional":
//       return "TONE: Empathetic, human, sincere; avoid melodrama.";
//     case "Educational":
//       return "TONE: Patient, step-by-step, like a good teacher.";
//     default:
//       return "TONE: Natural, confident, friendly, human-like.";
//   }
// }

// /* ──────────────────────────
//  * Format options
//  * ────────────────────────── */

// function formatRequirements(prefs: ContentPreferences) {
//   const lines: string[] = [];
//   const checklist: string[] = [];

//   if (prefs.includeBulletPoints) {
//     lines.push(
//       "- Use bullet or numbered lists (<ul>/<ol>) only where they genuinely help clarity, in body sections."
//     );
//     lines.push(
//       "- Do NOT use bullet lists or bullet-style stubs (e.g., “Practical tip”, “Common mistake”, “Quick win”) inside the Conclusion."
//     );
//     checklist.push(
//       "- Bullet/numbered lists appear only in non-conclusion sections.",
//       "- No bullet lists or stub lines appear in the conclusion."
//     );
//   }

//   if (prefs.includeTables) {
//     lines.push(
//       "- You may include a clean HTML table (<table><thead>...</thead><tbody>...</tbody></table>) if it helps compare or summarize."
//     );
//     checklist.push(
//       "- Any table used is clean semantic HTML."
//     );
//   }

//   if (prefs.includeEmojis) {
//     lines.push(
//       "- Emojis are allowed, 1–3 per relevant section max, only where natural."
//     );
//     checklist.push(
//       "- Emojis, if used, are relevant and not spammy."
//     );
//   }

//   if (prefs.includeBoxesQuotesHighlights) {
//     lines.push(
//       "- You may use callout/quote/highlight blocks with <blockquote> or a simple <div> for important tips."
//     );
//     checklist.push(
//       "- Any highlight blocks look natural and minimal."
//     );
//   }

//   if (prefs.includeQandA) {
//     lines.push(
//       "- Include one FAQ / Q&A section near the end with 3–6 natural Q&A pairs."
//     );
//     lines.push(
//       "- Every question AND answer in FAQ must be fully in the selected language. No mixed-language lines."
//     );
//     checklist.push(
//       "- FAQ/Q&A section exists with 3–6 pairs, clean single-language content."
//     );
//   }

//   const text =
//     lines.length > 0
//       ? ["FORMAT OPTIONS:", ...lines].join("\n")
//       : "FORMAT: Use semantic HTML (<h2>, <p>, etc.). No markdown fences.";

//   return { text, checklist };
// }

// /* ──────────────────────────
//  * Keyword rules
//  * ────────────────────────── */

// function keywordRules(
//   keywords: string[],
//   includeConclusion: boolean
// ): string {
//   const safeKeywords = keywords.filter((k) => !!k?.trim());

//   return [
//     "KEYWORD RULES:",
//     safeKeywords.length
//       ? `- Focus keywords: ${safeKeywords
//           .map((k) => `"${k}"`)
//           .join(", ")}.`
//       : "- You may receive focus keywords; treat them naturally.",
//     "- Use focus keywords only inside normal body paragraphs.",
//     "- NEVER put any focus keyword inside the title or any <h1>–<h6> heading.",
//     "- Inside a single paragraph, do NOT use more than one different focus keyword. One paragraph = at most one unique keyword.",
//     "- You may repeat the SAME keyword multiple times in a paragraph if natural, but never mix two different focus keywords in that paragraph.",
//     includeConclusion
//       ? "- Do NOT force focus keywords into the conclusion. Let it stay natural."
//       : "",
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// /* ──────────────────────────
//  * Structure & length
//  * ────────────────────────── */

// function structureRules(prefs: ContentPreferences): string {
//   const paraTarget = Math.max(40, Number(prefs.paragraphWords || 100));
//   const total = Number(prefs.totalContentWords || 0);

//   const lines: string[] = [];

//   lines.push(
//     "- Use multiple logical sections with <h2> headings (and optional <h3> subpoints) that cover different angles of the topic."
//   );
//   lines.push(
//     "- Choose the number of sections yourself so that the article feels complete and balanced (no section toggle from user)."
//   );
//   lines.push(
//     `- Typical paragraph length: around ${paraTarget} words, with natural variation.`
//   );
//   lines.push(
//     "- Headings must be short, declarative, unique, and must NOT contain focus keywords."
//   );
//   lines.push(
//     "- The first paragraph under each heading must not simply repeat the heading or start with the same phrase."
//   );

//   if (total > 0) {
//     const min = Math.floor(total * 0.95);
//     const max = Math.ceil(total * 1.05);
//     lines.push(
//       `- The full article (excluding HTML tags) MUST be between ${min} and ${max} words.`
//     );
//   }

//   if (prefs.includeConclusion) {
//     lines.push(
//       "- End with ONE dedicated conclusion section:"
//     );
//     lines.push(
//       '  * <h2> with the local equivalent of "Conclusion" (no keywords).'
//     );
//     lines.push(
//       "  * Followed by EXACTLY ONE <p> paragraph (no lists) that is at least 100 words and naturally wraps up the article."
//     );
//   } else {
//     lines.push(
//       "- Do NOT add a conclusion section unless explicitly requested."
//     );
//   }

//   return ["STRUCTURE & LENGTH:", ...lines].join("\n");
// }

// /* ──────────────────────────
//  * Brand / domain rule
//  * ────────────────────────── */

// function brandDirective(prefs: ContentPreferences): string {
//   const raw = (prefs.brandDomain || "").trim();
//   if (!prefs.brandDomainEnabled || !raw) {
//     return "BRAND / DOMAIN MENTION: Do NOT inject any brand or domain unless the user prompt explicitly requires it.";
//   }

//   return [
//     "BRAND / DOMAIN MENTION:",
//     `- Mention "${raw}" exactly once, naturally, inside the conclusion paragraph ONLY (e.g., as a helpful resource or brand mention).`,
//     "- Do NOT mention this brand/domain anywhere else in the article.",
//   ].join("\n");
// }

// /* ──────────────────────────
//  * Uniqueness & human style
//  * ────────────────────────── */

// function uniquenessAndHumanity(
//   variationId: number
// ): string {
//   return [
//     `UNIQUENESS & HUMAN-LIKE WRITING (Variation #${variationId}):`,
//     "- Title must be unique and never reused as a section heading.",
//     "- All headings must be distinct from each other and from the title.",
//     "- Do not use mechanical templates or repeated stub lines ('Practical tip', etc.).",
//     "- Avoid filler like “In this article we will discuss”, “Let's dive in”, “As we all know”.",
//     "- Each section must add new, specific, non-duplicated value.",
//     "- Vary sentence length and rhythm; keep it natural.",
//     "- Avoid overusing exclamation/question marks.",
//     "- The content should read like one thoughtful human writer, not stitched fragments.",
//   ].join("\n");
// }

// /* ──────────────────────────
//  * Final validation
//  * ────────────────────────── */

// function finalValidationBlock(
//   checklist: string[]
// ): string {
//   const base: string[] = [
//     "FINAL VALIDATION BEFORE RETURNING JSON:",
//     "- Ensure everything (title, headings, body, FAQ, conclusion) is in the selected language only.",
//     "- Ensure NO focus keyword appears in the title or any heading.",
//     "- Ensure no paragraph contains more than one different focus keyword.",
//     "- Ensure HTML is clean semantic markup only (no markdown fences).",
//     "- If conclusion is enabled: one <h2> Conclusion + one <p>, no lists or bullet stubs inside it.",
//   ];

//   if (checklist.length) {
//     base.push(
//       "- Ensure all enabled formatting options are satisfied:",
//       ...checklist
//     );
//   }

//   base.push(
//     "- If any rule above is violated, fix it internally and only then output the final JSON object."
//   );

//   return base.join("\n");
// }

// /* ──────────────────────────
//  * Public: buildPlanFromPrefs
//  * ────────────────────────── */

// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }): string {
//   const { keywords, prefs, variationId } = params;

//   const { text: formatText, checklist } =
//     formatRequirements(prefs);
//   const lang = languageDirective(prefs.language);
//   const mood = moodDirective(prefs.mood);
//   const kw = keywordRules(
//     keywords,
//     prefs.includeConclusion
//   );
//   const structure = structureRules(prefs);
//   const brand = brandDirective(prefs);
//   const uniq = uniquenessAndHumanity(variationId);
//   const validation = finalValidationBlock(
//     checklist
//   );
//   const extra = (prefs.extraInstructions || "").trim();

//   return [
//     "You are generating long-form content for a production SEO/content tool.",
//     'Return ONLY one valid JSON object: { "title": string, "html": string }.',
//     "- Do NOT wrap JSON in code fences.",
//     "- Do NOT add extra properties or explanations.",
//     "",
//     "ROLE:",
//     "- Act as a senior human copywriter aligned with search intent, clarity, and brand safety.",
//     "",
//     lang,
//     mood,
//     "",
//     formatText,
//     "",
//     structure,
//     "",
//     kw,
//     "",
//     brand,
//     "",
//     uniq,
//     "",
//     "ADDITIONAL USER INSTRUCTIONS (HIGHEST PRIORITY IF PRESENT):",
//     extra || "(none)",
//     "",
//     "REMINDERS:",
//     "- Title must respect the max length given separately; keep it sharp and natural.",
//     "- Do NOT put focus keywords inside the title or headings.",
//     "- Output only the final JSON object, nothing else.",
//     "",
//     validation,
//   ]
//     .filter(Boolean)
//     .join("\n");
// }



// import type { ContentPreferences } from "@/hooks/use-preferences";

// /* LANGUAGE */

// function languageDirective(label?: string): string {
//   const selected = (label || "English (US)").trim();

//   return [
//     "LANGUAGE RULES (CRITICAL):",
//     `- Write the entire response (title, headings, paragraphs, bullet points, tables, Q&A, conclusion) ONLY in: \"${selected}\".`,
//     "- Do NOT mix any other language or script.",
//     "- If any line is in a different language, fix it before returning JSON.",
//     "- Do not repeate any keyword one key word in one paragraph",
//   ].join("\n");
// }

// /* MOOD */

// function moodDirective(mood: ContentPreferences["mood"]): string {
//   switch (mood) {
//     case "Entertaining":
//       return "TONE: Conversational, story-led, playful but clear.";
//     case "Informative":
//       return "TONE: Clear, direct, practical, minimal fluff.";
//     case "Inspirational":
//       return "TONE: Warm, motivating, grounded.";
//     case "Humorous":
//       return "TONE: Light, subtle humour; never cringe.";
//     case "Emotional":
//       return "TONE: Empathetic, sincere, human.";
//     case "Educational":
//       return "TONE: Patient, step-by-step teacher style.";
//     default:
//       return "TONE: Natural, confident, human-like.";
//   }
// }

// /* FORMAT OPTIONS – ALL ARE HARD REQUIREMENTS WHEN ENABLED */

// function formatRequirements(prefs: ContentPreferences) {
//   const lines: string[] = [];
//   const checklist: string[] = [];

//   if (prefs.includeBulletPoints) {
//     lines.push(
//       "- MUST use bullet or numbered lists (<ul>/<ol>) in at least 2 suitable body sections where they improve clarity."
//     );
//     lines.push(
//       "- MUST NOT use any bullet list or bullet-style one-liner (e.g., “Practical tip”, “Common mistake”, “Quick win”) inside the Conclusion."
//     );
//     checklist.push(
//       "- Bullet lists appear in 2+ non-conclusion sections.",
//       "- No bullets or stub lines appear in the conclusion."
//     );
//   }

//   if (prefs.includeTables) {
//     lines.push(
//       "- MUST include at least one clean HTML table (<table><thead>...</thead><tbody>...</tbody></table>) where it naturally fits (comparisons, steps, pros/cons, etc.)."
//     );
//     checklist.push(
//       "- At least one semantic <table> is present."
//     );
//   }

//   if (prefs.includeEmojis) {
//     lines.push(
//       "- MUST use emojis naturally across the article (roughly 1–3 per main section max), only when contextually relevant. No spam."
//     );
//     checklist.push(
//       "- Emojis appear occasionally and meaningfully; not overused."
//     );
//   }

//   if (prefs.includeBoxesQuotesHighlights) {
//     lines.push(
//       "- MUST include at least one callout/quote/highlight block using <blockquote> or a simple <div> to emphasize key insight(s)."
//     );
//     checklist.push(
//       "- At least one callout/quote/highlight block exists."
//     );
//   }

//   if (prefs.includeQandA) {
//     lines.push(
//       "- MUST include one dedicated FAQ / Q&A section near the end with 3–6 Q&A pairs."
//     );
//     lines.push(
//       "- Every question AND answer in FAQ MUST be in the selected language only, with no mixed-language lines."
//     );
//     checklist.push(
//       "- FAQ section present with 3–6 pairs; all in single language."
//     );
//   }

//   const text =
//     lines.length > 0
//       ? ["FORMAT OPTIONS (HARD REQUIREMENTS WHEN ENABLED):", ...lines].join("\n")
//       : "FORMAT: Use semantic HTML (<h2>, <p>, <ul>, <ol>, <li>, <table>, <blockquote>, etc.). No markdown fences.";

//   return { text, checklist };
// }

// /* KEYWORD RULES */

// function keywordRules(keywords: string[], includeConclusion: boolean): string {
//   const safe = keywords.filter((k) => !!k?.trim());

//   return [
//     "KEYWORD RULES:",
//     safe.length
//       ? `- Focus keywords: ${safe.map((k) => `"${k}"`).join(", ")}.`
//       : "- You may receive focus keywords; treat them as semantic hints.",
//     "- Use focus keywords ONLY in normal body paragraphs.",
//     "- NEVER place a focus keyword inside the title or ANY heading (<h1>-<h6>).",
//     "- Within a single paragraph, use at most ONE distinct focus keyword.",
//     "- You may repeat the same keyword in that paragraph if natural, but do not mix two different focus keywords inside one paragraph.",
//     includeConclusion
//       ? "- Do NOT force-focus keywords into the conclusion. Let conclusion stay natural."
//       : "",
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// /* STRUCTURE & LENGTH */

// function structureRules(prefs: ContentPreferences): string {
//   const paraTarget = Math.max(40, Number(prefs.paragraphWords || 100));
//   const total = Number(prefs.totalContentWords || 0);

//   const lines: string[] = [];

//   lines.push(
//     "- Use multiple logical sections with <h2> headings (and optional <h3>), covering different aspects of the topic."
//   );
//   lines.push(
//     "- Decide the number of sections yourself so the article feels complete and balanced. There is NO direct section-count preference from the user."
//   );
//   lines.push(
//     `- Aim for paragraphs around ${paraTarget} words with natural variation.`
//   );
//   lines.push(
//     "- All headings must be concise, unique, and MUST NOT contain focus keywords."
//   );
//   lines.push(
//     "- Do not start the first paragraph under a heading by repeating that heading text."
//   );

//   if (total > 0) {
//     const min = Math.floor(total * 0.95);
//     const max = Math.ceil(total * 1.05);
//     lines.push(
//       `- The full article (plain text, without HTML tags) MUST be between ${min} and ${max} words. Adjust section/paragraph count accordingly.`
//     );
//   }

//   if (prefs.includeConclusion) {
//     lines.push("- End with a dedicated conclusion section:");
//     lines.push(
//       '  * Start with <h2> using the local equivalent of "Conclusion" (no keywords).'
//     );
//     lines.push(
//       "  * Followed by EXACTLY ONE <p> (no lists) of at least 100 words that summarises and inspires."
//     );
//   } else {
//     lines.push("- Do NOT add a conclusion unless explicitly enabled.");
//   }

//   return ["STRUCTURE & LENGTH:", ...lines].join("\n");
// }

// /* BRAND / DOMAIN */

// function brandDirective(prefs: ContentPreferences): string {
//   const brand = (prefs.brandDomain || "").trim();
//   if (!prefs.brandDomainEnabled || !brand) {
//     return "BRAND / DOMAIN: Do NOT add any brand or domain mention unless specified.";
//   }

//   return [
//     "BRAND / DOMAIN:",
//     `- Mention \"${brand}\" exactly once, naturally, ONLY inside the conclusion paragraph (e.g., as a helpful resource).`,
//     "- Do NOT mention this brand/domain anywhere else.",
//   ].join("\n");
// }

// /* UNIQUENESS */

// function uniquenessAndHumanity(variationId: number): string {
//   return [
//     `UNIQUENESS & HUMAN STYLE (Variation #${variationId}):`,
//     "- Title must be unique and never reused as a section heading.",
//     "- Every heading must differ from the title and from each other.",
//     "- No repetitive templates or stub labels (Practical tip/Common mistake/etc.) as standalone content.",
//     "- Avoid boilerplate like “In this article we will discuss”, “Let's dive in”, “As we all know”.",
//     "- Each section adds fresh, concrete value; no duplication.",
//     "- Natural sentence rhythm, mix of short and longer sentences.",
//     "- Avoid punctuation spam.",
//   ].join("\n");
// }

// /* FINAL VALIDATION */

// function finalValidationBlock(checklist: string[]): string {
//   const base: string[] = [
//     "FINAL VALIDATION BEFORE RETURNING JSON:",
//     "- Entire content is in the selected language only.",
//     "- No focus keywords appear in the title or in any heading.",
//     "- No paragraph contains more than one different focus keyword.",
//     "- HTML is clean semantic markup (no markdown fences).",
//   ];

//   if (checklist.length) {
//     base.push(
//       "- All enabled formatting options MUST be satisfied:",
//       ...checklist
//     );
//   }

//   base.push(
//     "- If any rule is broken, fix it silently and only then output the final JSON."
//   );

//   return base.join("\n");
// }

// /* PUBLIC */

// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }): string {
//   const { keywords, prefs, variationId } = params;

//   const { text: formatText, checklist } = formatRequirements(prefs);
//   const lang = languageDirective(prefs.language);
//   const mood = moodDirective(prefs.mood);
//   const kw = keywordRules(keywords, prefs.includeConclusion);
//   const structure = structureRules(prefs);
//   const brand = brandDirective(prefs);
//   const uniq = uniquenessAndHumanity(variationId);
//   const validation = finalValidationBlock(checklist);
//   const extra = (prefs.extraInstructions || "").trim();

//   return [
//     "You are generating long-form content for a production SEO/content tool.",
//     'You MUST return ONLY one valid JSON object: { "title": string, "html": string }.',
//     "- Do NOT wrap JSON in code fences.",
//     "- Do NOT include extra properties or explanations.",
//     "",
//     "ROLE:",
//     "- Act as a senior human writer with strong UX, SEO, and editorial sense.",
//     "",
//     lang,
//     mood,
//     "",
//     formatText,
//     "",
//     structure,
//     "",
//     kw,
//     "",
//     brand,
//     "",
//     uniq,
//     "",
//     "ADDITIONAL USER INSTRUCTIONS (HIGHEST PRIORITY IF PRESENT):",
//     extra || "(none)",
//     "",
//     "REMINDERS:",
//     "- Title length constraints and other hard limits are provided separately. Obey them strictly.",
//     "- Do NOT put focus keywords in the title or headings.",
//     "- Do NOT mention these instructions or tokens in the output.",
//     "",
//     validation,
//   ]
//     .filter(Boolean)
//     .join("\n");
// }



// import type { ContentPreferences } from "@/hooks/use-preferences";

// /* LANGUAGE */

// function languageDirective(label?: string): string {
//   const selected = (label || "English (US)").trim();

//   return [
//     "LANGUAGE RULES (CRITICAL):",
//     `- Write the entire response (title, headings, paragraphs, bullet points, tables, Q&A, conclusion) ONLY in: \"${selected}\".`,
//     "- Do NOT mix any other language or script.",
//     "- If any line is in a different language, fix it before returning JSON.",
//   ].join("\n");
// }

// /* MOOD */

// function moodDirective(mood: ContentPreferences["mood"]): string {
//   switch (mood) {
//     case "Entertaining":
//       return "TONE: Conversational, story-led, playful but clear.";
//     case "Informative":
//       return "TONE: Clear, direct, practical, minimal fluff.";
//     case "Inspirational":
//       return "TONE: Warm, motivating, grounded.";
//     case "Humorous":
//       return "TONE: Light, subtle humour; never cringe.";
//     case "Emotional":
//       return "TONE: Empathetic, sincere, human.";
//     case "Educational":
//       return "TONE: Patient, step-by-step teacher style.";
//     default:
//       return "TONE: Natural, confident, human-like.";
//   }
// }

// /* FORMAT OPTIONS – ALL ARE HARD REQUIREMENTS WHEN ENABLED */

// function formatRequirements(prefs: ContentPreferences) {
//   const lines: string[] = [];
//   const checklist: string[] = [];

//   if (prefs.includeBulletPoints) {
//     lines.push(
//       "- MUST use bullet or numbered lists (<ul>/<ol>) in at least 2 suitable body sections where they improve clarity."
//     );
//     lines.push(
//       "- MUST NOT use any bullet list or bullet-style one-liner (e.g., “Practical tip”, “Common mistake”, “Quick win”) inside the Conclusion."
//     );
//     checklist.push(
//       "- Bullet lists appear in 2+ non-conclusion sections.",
//       "- No bullets or stub lines appear in the conclusion."
//     );
//   }

//   if (prefs.includeTables) {
//     lines.push(
//       "- MUST include at least one clean HTML table (<table><thead>...</thead><tbody>...</tbody></table>) where it naturally fits (comparisons, steps, pros/cons, etc.)."
//     );
//     checklist.push(
//       "- At least one semantic <table> is present."
//     );
//   }

//   if (prefs.includeEmojis) {
//     lines.push(
//       "- MUST use emojis naturally across the article (roughly 1–3 per main section max), only when contextually relevant. No spam."
//     );
//     checklist.push(
//       "- Emojis appear occasionally and meaningfully; not overused."
//     );
//   }

//   if (prefs.includeBoxesQuotesHighlights) {
//     lines.push(
//       "- MUST include at least one callout/quote/highlight block using <blockquote> or a simple <div> to emphasize key insight(s)."
//     );
//     checklist.push(
//       "- At least one callout/quote/highlight block exists."
//     );
//   }

//   if (prefs.includeQandA) {
//     lines.push(
//       "- MUST include one dedicated FAQ / Q&A section near the end with 3–6 Q&A pairs."
//     );
//     lines.push(
//       "- Every question AND answer in FAQ MUST be in the selected language only, with no mixed-language lines."
//     );
//     lines.push(
//       "- Render the FAQ in a clean, professional HTML structure so it aligns nicely in the editor:"
//     );
//     lines.push(
//       '  * Start with <h2>Frequently Asked Questions</h2>.'
//     );
//     lines.push(
//       '  * Wrap all FAQ pairs in a container like <div class="faq-list"> ... </div>.'
//     );
//     lines.push(
//       '  * For EACH pair, use this exact pattern (no bare “Q:” / “A:” lines):'
//     );
//     lines.push(
//       '    <div class="faq-item"><b><strong>Q:</strong> Question text?</b><p><strong>A:</strong> Answer text.</p></div>'
//     );
//     lines.push(
//       "- The <strong>Q:</strong> and <strong>A:</strong> labels MUST be bold, and the structure must be consistent across all pairs."
//     );
//     checklist.push(
//       "- FAQ section present with 3–6 pairs; all in single language.",
//       '- Each FAQ pair uses the <div class="faq-item"><p><strong>Q:</strong>...</p><p><strong>A:</strong>...</p></div> pattern for consistent bold labels and alignment.'
//     );
//   }

//   const text =
//     lines.length > 0
//       ? [
//           "FORMAT OPTIONS (HARD REQUIREMENTS WHEN ENABLED):",
//           ...lines,
//         ].join("\n")
//       : "FORMAT: Use semantic HTML (<h2>, <p>, <ul>, <ol>, <li>, <table>, <blockquote>, etc.). No markdown fences.";

//   return { text, checklist };
// }

// /* KEYWORD RULES */

// function keywordRules(
//   keywords: string[],
//   includeConclusion: boolean
// ): string {
//   const safe = keywords.filter((k) => !!k?.trim());

//   return [
//     "KEYWORD RULES:",
//     safe.length
//       ? `- Focus keywords: ${safe
//           .map((k) => `"${k}"`)
//           .join(", ")}.`
//       : "- You may receive focus keywords; treat them as semantic hints.",
//     "- Use focus keywords ONLY in normal body paragraphs.",
//     "- NEVER place a focus keyword inside the title or ANY heading (<h1>-<h6>).",
//     "- Within a single paragraph, use at most ONE distinct focus keyword (you may repeat that same keyword if natural, but do NOT mix two different focus keywords in one paragraph).",
//     includeConclusion
//       ? "- Do NOT force-focus keywords into the conclusion. Let the conclusion stay natural."
//       : "",
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// /* STRUCTURE & LENGTH */

// function structureRules(prefs: ContentPreferences): string {
//   const paraTarget = Math.max(
//     40,
//     Number(prefs.paragraphWords || 100)
//   );
//   const total = Number(prefs.totalContentWords || 0);

//   const lines: string[] = [];

//   lines.push(
//     "- Use multiple logical sections with <h2> headings (and optional <h3>), covering different aspects of the topic."
//   );
//   lines.push(
//     "- Decide the number of sections yourself so the article feels complete and balanced. There is NO direct section-count preference from the user."
//   );
//   lines.push(
//     `- Aim for paragraphs around ${paraTarget} words with natural variation.`
//   );
//   lines.push(
//     "- All headings must be concise, unique, and MUST NOT contain focus keywords."
//   );
//   lines.push(
//     "- Do not start the first paragraph under a heading by repeating that heading text."
//   );

//   if (total > 0) {
//     const min = Math.floor(total * 0.95);
//     const max = Math.ceil(total * 1.05);
//     lines.push(
//       `- The full article (plain text, without HTML tags) MUST be between ${min} and ${max} words. Adjust section/paragraph count accordingly.`
//     );
//   }

//   if (prefs.includeConclusion) {
//     lines.push("- End with a dedicated conclusion section:");
//     lines.push(
//       '  * Start with <h2> using the local equivalent of "Conclusion" (no keywords).'
//     );
//     lines.push(
//       "  * Followed by EXACTLY ONE <p> (no lists) of at least 100 words that summarises and inspires."
//     );
//   } else {
//     lines.push(
//       "- Do NOT add a conclusion unless explicitly enabled."
//     );
//   }

//   return ["STRUCTURE & LENGTH:", ...lines].join(
//     "\n"
//   );
// }

// /* BRAND / DOMAIN */

// function brandDirective(
//   prefs: ContentPreferences
// ): string {
//   const brand = (prefs.brandDomain || "").trim();
//   if (!prefs.brandDomainEnabled || !brand) {
//     return "BRAND / DOMAIN: Do NOT add any brand or domain mention unless specified.";
//   }

//   return [
//     "BRAND / DOMAIN:",
//     `- Mention \"${brand}\" exactly once, naturally, ONLY inside the conclusion paragraph (e.g., as a helpful resource).`,
//     "- Do NOT mention this brand/domain anywhere else.",
//   ].join("\n");
// }

// /* UNIQUENESS */

// function uniquenessAndHumanity(
//   variationId: number
// ): string {
//   return [
//     `UNIQUENESS & HUMAN STYLE (Variation #${variationId}):`,
//     "- Title must be unique and never reused as a section heading.",
//     "- Every heading must differ from the title and from each other.",
//     "- No repetitive templates or stub labels (Practical tip/Common mistake/etc.) as standalone content.",
//     '- Avoid boilerplate like “In this article we will discuss”, “Let\'s dive in”, “As we all know”.',
//     "- Each section adds fresh, concrete value; no duplication.",
//     "- Natural sentence rhythm, mix of short and longer sentences.",
//     "- Avoid punctuation spam.",
//   ].join("\n");
// }

// /* FINAL VALIDATION */

// function finalValidationBlock(
//   checklist: string[]
// ): string {
//   const base: string[] = [
//     "FINAL VALIDATION BEFORE RETURNING JSON:",
//     "- Entire content is in the selected language only.",
//     "- No focus keywords appear in the title or in any heading.",
//     "- No paragraph contains more than one different focus keyword.",
//     "- HTML is clean semantic markup (no markdown fences).",
//     "- FAQ (if included) uses bold <strong>Q:</strong> / <strong>A:</strong> labels and consistent HTML so it looks professional.",
//   ];

//   if (checklist.length) {
//     base.push(
//       "- All enabled formatting options MUST be satisfied:",
//       ...checklist
//     );
//   }

//   base.push(
//     "- If any rule is broken, fix it silently and only then output the final JSON."
//   );

//   return base.join("\n");
// }

// /* PUBLIC */

// export function buildPlanFromPrefs(params: {
//   keywords: string[];
//   prefs: ContentPreferences;
//   variationId: number;
// }): string {
//   const { keywords, prefs, variationId } = params;

//   const {
//     text: formatText,
//     checklist,
//   } = formatRequirements(prefs);
//   const lang = languageDirective(prefs.language);
//   const mood = moodDirective(prefs.mood);
//   const kw = keywordRules(
//     keywords,
//     prefs.includeConclusion
//   );
//   const structure = structureRules(prefs);
//   const brand = brandDirective(prefs);
//   const uniq = uniquenessAndHumanity(
//     variationId
//   );
//   const validation =
//     finalValidationBlock(checklist);
//   const extra = (prefs.extraInstructions || "")
//     .trim();

//   return [
//     "You are generating long-form content for a production SEO/content tool.",
//     'You MUST return ONLY one valid JSON object: { "title": string, "html": string }.',
//     "- Do NOT wrap JSON in code fences.",
//     "- Do NOT include extra properties or explanations.",
//     "",
//     "ROLE:",
//     "- Act as a senior human writer with strong UX, SEO, and editorial sense.",
//     "",
//     lang,
//     mood,
//     "",
//     formatText,
//     "",
//     structure,
//     "",
//     kw,
//     "",
//     brand,
//     "",
//     uniq,
//     "",
//     "ADDITIONAL USER INSTRUCTIONS (HIGHEST PRIORITY IF PRESENT):",
//     extra || "(none)",
//     "",
//     "REMINDERS:",
//     "- Title length constraints and other hard limits are provided separately. Obey them strictly.",
//     "- Do NOT put focus keywords in the title or headings.",
//     "- Do NOT mention these instructions or tokens in the output.",
//     "",
//     validation,
//   ]
//     .filter(Boolean)
//     .join("\n");
// }



import type { ContentPreferences } from "@/hooks/use-preferences";

/* LANGUAGE */

function languageDirective(label?: string): string {
  const selected = (label || "English (US)").trim();

  return [
    "LANGUAGE RULES (CRITICAL):",
    `- Write the entire response (title, headings, paragraphs, bullet points, tables, Q&A, conclusion) ONLY in: \"${selected}\".`,
    "- Do NOT mix any other language or script.",
    "- in one paragraph only one keyword appears ",
    "- do not add two keywords in same paragraph and do not repeat any keyword .",
    "- If any line is in a different language, fix it before returning JSON.",
  ].join("\n");
}

/* MOOD */

function moodDirective(mood: ContentPreferences["mood"]): string {
  switch (mood) {
    case "Entertaining":
      return "TONE: Conversational, story-led, playful but clear.";
    case "Informative":
      return "TONE: Clear, direct, practical, minimal fluff.";
    case "Inspirational":
      return "TONE: Warm, motivating, grounded.";
    case "Humorous":
      return "TONE: Light, subtle humour; never cringe.";
    case "Emotional":
      return "TONE: Empathetic, sincere, human.";
    case "Educational":
      return "TONE: Patient, step-by-step teacher style.";
    default:
      return "TONE: Natural, confident, human-like.";
  }
}

/* FORMAT OPTIONS – ALL ARE HARD REQUIREMENTS WHEN ENABLED */

function formatRequirements(prefs: ContentPreferences) {
  const lines: string[] = [];
  const checklist: string[] = [];

  if (prefs.includeBulletPoints) {
    lines.push(
      "- MUST use bullet or numbered lists (<ul>/<ol>) in at least 2 suitable body sections where they improve clarity."
    );
    lines.push(
      "- MUST NOT use any bullet list or bullet-style one-liner (e.g., “Practical tip”, “Common mistake”, “Quick win”) inside the Conclusion."
    );
    checklist.push(
      "- Bullet lists appear in 2+ non-conclusion sections.",
      "- No bullets or stub lines appear in the conclusion."
    );
  }

  if (prefs.includeTables) {
    lines.push(
      "- MUST include at least one clean HTML table (<table><thead>...</thead><tbody>...</tbody></table>) where it naturally fits (comparisons, steps, pros/cons, etc.)."
    );
    checklist.push("- At least one semantic <table> is present.");
  }

  if (prefs.includeEmojis) {
    lines.push(
      "- MUST use emojis generously but tastefully across the article."
    );
    lines.push(
      "- Aim for roughly 1–3 emojis in EACH major body section (not just 1–2 in the whole article)."
    );
    lines.push(
      "- Emojis MUST be contextually relevant and blended into sentences; avoid spam or emoji-only lines."
    );
    checklist.push(
      "- Emojis are present in most major sections.",
      "- Emojis are used naturally and not spammed."
    );
  }

  if (prefs.includeBoxesQuotesHighlights) {
    lines.push(
      "- MUST include at least one callout/quote/highlight block using <blockquote> or a simple <div> to emphasize key insight(s)."
    );
    checklist.push("- At least one callout/quote/highlight block exists.");
  }

  if (prefs.includeQandA) {
    lines.push(
      "- MUST include one dedicated FAQ / Q&A section near the end with 3–6 Q&A pairs."
    );
    lines.push(
      "- Every question AND answer in FAQ MUST be in the selected language only, with no mixed-language lines."
    );
    lines.push(
      "- Render the FAQ in a clean, professional HTML structure so it aligns nicely in the editor:"
    );
    lines.push('  * Start with <h2>Frequently Asked Questions</h2>.');
    lines.push(
      '  * Wrap all FAQ pairs in a container like <div class="faq-list"> ... </div>.'
    );
    lines.push(
      '  * For EACH pair, use this exact pattern (no bare “Q:” / “A:” lines):'
    );
    lines.push(
      '    <div class="faq-item"><b><strong>Q:</strong> Question text?</b><p><strong>A:</strong> Answer text.</p></div>'
    );
    lines.push(
      "- The <strong>Q:</strong> and <strong>A:</strong> labels MUST be bold, and the structure must be consistent across all pairs."
    );
    checklist.push(
      "- FAQ section present with 3–6 pairs; all in single language.",
      '- Each FAQ pair uses the <div class="faq-item"><p><strong>Q:</strong>...</p><p><strong>A:</strong>...</p></div> pattern for consistent bold labels and alignment.'
    );
  }

  const text =
    lines.length > 0
      ? ["FORMAT OPTIONS (HARD REQUIREMENTS WHEN ENABLED):", ...lines].join(
          "\n"
        )
      : "FORMAT: Use semantic HTML (<h2>, <p>, <ul>, <ol>, <li>, <table>, <blockquote>, etc.). No markdown fences.";

  return { text, checklist };
}

/* KEYWORD RULES */

function keywordRules(
  keywords: string[],
  includeConclusion: boolean
): string {
  const safe = keywords.filter((k) => !!k?.trim());

  return [
    "KEYWORD RULES:",
    safe.length
      ? `- Focus keywords: ${safe.map((k) => `"${k}"`).join(", ")}.`
      : "- You may receive focus keywords; treat them as semantic hints.",
    "- Use focus keywords ONLY in normal body paragraphs.",
    "- NEVER place a focus keyword inside the title or ANY heading (<h1>-<h6>).",
    "- Within a single paragraph, use at most ONE distinct focus keyword (you may repeat that same keyword if natural, but do NOT mix two different focus keywords in one paragraph).",
    includeConclusion
      ? "- Do NOT force-focus keywords into the conclusion. Let the conclusion stay natural."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/* STRUCTURE & LENGTH */

function structureRules(prefs: ContentPreferences): string {
  const paraTarget = Math.max(40, Number(prefs.paragraphWords || 100));
  const total = Number(prefs.totalContentWords || 0);

  const lines: string[] = [];

  lines.push(
    "- Use multiple logical sections with <h2> headings (and optional <h3>), covering different aspects of the topic."
  );
  lines.push(
    "- Decide the number of sections yourself so the article feels complete and balanced."
  );
  lines.push(
    `- Aim for paragraphs around ${paraTarget} words with natural variation.`
  );
  lines.push(
    "- All headings must be concise, unique, and MUST NOT contain focus keywords."
  );
  lines.push(
    "- Do not start the first paragraph under a heading by repeating that heading text."
  );

  if (total > 0) {
    const delta = Math.max(30, Math.round(total * 0.05));
    const min = Math.max(50, total - delta);
    const max = total + delta;

    lines.push(
      `- CRITICAL: The full article (plain text, without HTML tags) MUST be between ${min} and ${max} words.`
    );
    lines.push(
      "- Adjust number of sections, paragraph lengths, and examples so the final word count stays inside this range."
    );
    lines.push(
      "- If you are under the minimum, expand with useful detail. If you are over the maximum, trim redundant sentences before returning JSON."
    );
  }

  if (prefs.includeConclusion) {
    lines.push("- End with a dedicated conclusion section:");
    lines.push(
      '  * Start with <h2> using the local equivalent of "Conclusion" (no keywords).'
    );
    lines.push(
      "  * Followed by EXACTLY ONE <p> (no lists) of at least 100 words that summarises and inspires."
    );
  } else {
    lines.push("- Do NOT add a conclusion unless explicitly enabled.");
  }

  return ["STRUCTURE & LENGTH:", ...lines].join("\n");
}

/* BRAND / DOMAIN */

function brandDirective(prefs: ContentPreferences): string {
  const brand = (prefs.brandDomain || "").trim();

  if (!prefs.brandDomainEnabled || !brand) {
    return "BRAND / DOMAIN: Do NOT add any brand or domain mention unless specified.";
  }

  return [
    "BRAND / DOMAIN (CRITICAL):",
    `- You have been given the brand/domain: \"${brand}\".`,
    "- Mention this brand/domain EXACTLY ONCE, naturally, ONLY inside the conclusion paragraph.",
    "- Do NOT mention this brand/domain in the title, headings, FAQ, or any other section.",
    "- If the brand/domain is missing from the conclusion, add it before returning JSON.",
  ].join("\n");
}

/* UNIQUENESS */

function uniquenessAndHumanity(
  variationId: number
): string {
  return [
    `UNIQUENESS & HUMAN STYLE (Variation #${variationId}):`,
    "- Title must be unique and never reused as a section heading.",
    "- Every heading must differ from the title and from each other.",
    "- No repetitive templates or stub labels (Practical tip/Common mistake/etc.) as standalone content.",
    '- Avoid boilerplate like “In this article we will discuss”, “Let\'s dive in”, “As we all know”.',
    "- Each section adds fresh, concrete value; no duplication.",
    "- Natural sentence rhythm, mix of short and longer sentences.",
    "- Avoid punctuation spam.",
  ].join("\n");
}

/* FINAL VALIDATION */

function finalValidationBlock(
  checklist: string[],
  prefs: ContentPreferences
): string {
  const base: string[] = [
    "FINAL VALIDATION BEFORE RETURNING JSON:",
    "- Entire content is in the selected language only.",
    "- No focus keywords appear in the title or in any heading.",
    "- No paragraph contains more than one different focus keyword.",
    "- HTML is clean semantic markup (no markdown fences).",
    "- FAQ (if included) uses bold <strong>Q:</strong> / <strong>A:</strong> labels and consistent HTML so it looks professional.",
  ];

  if (prefs.includeEmojis) {
    base.push(
      "- Ensure emojis are present in most major sections, used naturally (not just 1–2 in the entire article)."
    );
  }

  if (prefs.brandDomainEnabled && prefs.brandDomain.trim()) {
    const b = prefs.brandDomain.trim();
    base.push(
      `- If a brand/domain ("${b}") is provided: ensure it appears EXACTLY ONCE inside the conclusion paragraph and NOWHERE else.`
    );
  }

  if (prefs.totalContentWords) {
    const total = Number(prefs.totalContentWords);
    const delta = Math.max(30, Math.round(total * 0.05));
    const min = Math.max(50, total - delta);
    const max = total + delta;
    base.push(
      `- Check the plain-text word count (excluding HTML tags). It MUST be between ${min} and ${max} words. If not, trim or extend content BEFORE returning JSON.`
    );
  }

  if (checklist.length) {
    base.push(
      "- All enabled formatting options MUST be satisfied:",
      ...checklist
    );
  }

  base.push(
    "- If ANY rule is broken, fix it silently and only then output the final JSON."
  );

  return base.join("\n");
}

/* PUBLIC */

export function buildPlanFromPrefs(params: {
  keywords: string[];
  prefs: ContentPreferences;
  variationId: number;
}): string {
  const { keywords, prefs, variationId } = params;

  const { text: formatText, checklist } =
    formatRequirements(prefs);
  const lang = languageDirective(prefs.language);
  const mood = moodDirective(prefs.mood);
  const kw = keywordRules(
    keywords,
    prefs.includeConclusion
  );
  const structure = structureRules(prefs);
  const brand = brandDirective(prefs);
  const uniq = uniquenessAndHumanity(variationId);
  const validation = finalValidationBlock(
    checklist,
    prefs
  );
  const extra = (prefs.extraInstructions || "")
    .trim();

  return [
    "You are generating long-form content for a production SEO/content tool.",
    'You MUST return ONLY one valid JSON object: { "title": string, "html": string }.',
    "- Do NOT wrap JSON in code fences.",
    "- Do NOT include extra properties or explanations.",
    "",
    "ROLE:",
    "- Act as a senior human writer with strong UX, SEO, and editorial sense.",
    "",
    lang,
    mood,
    "",
    formatText,
    "",
    structure,
    "",
    kw,
    "",
    brand,
    "",
    uniq,
    "",
    "ADDITIONAL USER INSTRUCTIONS (HIGHEST PRIORITY IF PRESENT):",
    extra || "(none)",
    "",
    "REMINDERS:",
    "- Title length constraints and other hard limits are provided separately. Obey them strictly.",
    "- Do NOT put focus keywords in the title or headings.",
    "- Do NOT mention these instructions or tokens in the output.",
    "",
    validation,
  ]
    .filter(Boolean)
    .join("\n");
}
