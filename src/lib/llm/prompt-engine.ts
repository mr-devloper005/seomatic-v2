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










// src/lib/llm/prompt-engine/prompt.ts
import type { ContentPreferences } from "@/hooks/use-preferences";

/** ────────────────────────────────────────────────────────────
 * Language helpers (generic — label based)
 * We don't force BCP47 here; we just push the model HARD to obey the exact label.
 * ──────────────────────────────────────────────────────────── */
function languageDirective(label?: string) {
  const L = (label || "English (US)").trim();
  return [
    `LANGUAGE HARD RULES:`,
    `- Write ONLY in "${L}" — use its native script.`,
    `- Do NOT include a single word from any other language.`,
    `- No transliterations. No bilingual phrases. No English fillers.`,
    `- If "${L}" has regional variants, keep the style consistent.`,
  ].join("\n");
}

/** Tone */
function moodDirectives(mood: ContentPreferences["mood"]) {
  switch (mood) {
    case "Entertaining":  return "Tone: lively, story-driven, conversational.";
    case "Informative":   return "Tone: clear, friendly, straight to the point.";
    case "Inspirational": return "Tone: warm and encouraging, grounded in real hints.";
    case "Humorous":      return "Tone: light and playful; never slapstick or forced.";
    case "Emotional":     return "Tone: honest and personal (but not melodramatic).";
    case "Educational":   return "Tone: helpful teacher vibe; simple explanations.";
    default:              return "Tone: natural conversation with useful specifics.";
  }
}

/** Paragraph length bounds */
function bounds(target?: number) {
  const t = Math.max(60, Number(target || 100));
  const min = Math.floor(t * 0.88);
  const max = Math.ceil(t * 1.15);
  return { min, max, target: t };
}

/** Where to place tokens (keywords) */
function tokenPlacementGuide(keywords: string[]) {
  if (keywords.length === 1) return "Place the single token in Section 1 only.";
  if (keywords.length === 2) return "Place token#1 in Section 1 and token#2 in Section 3 only.";
  return "Place the first four tokens in Sections 1, 2, 3, and 4 respectively (one per section). Do not place any token elsewhere.";
}

/** Build the prompt plan (JSON-only output) */
export function buildPlanFromPrefs(params: {
  keywords: string[];
  prefs: ContentPreferences;
  variationId: number;
}) {
  const { keywords, prefs, variationId } = params;
  const { min, max, target } = bounds(prefs.paragraphWords);

  const tokens = keywords.slice(0, 4).map((k) => `[ANCHOR:${k}]`).join(" ");
  const placement = tokenPlacementGuide(keywords);

  // Sections config
  const sectionsLine =
  `Title must be 60-70 characters long must be 60+ `+
    `Write exactly ${prefs.sectionCount} content sections. ` +
    `Each section is EXACTLY: <h1>Conversational Title</h1><p>ONE paragraph only.</p> ` +
    `Target ~${target} words per paragraph (acceptable ${min}–${max}). ` +
    `Vary paragraph lengths; never identical.`

  // Hard constraints for keywords
  const keywordHardRules = [
    `KEYWORD HARD RULES:`,
    `- You will receive machine-visible tokens: ${tokens}`,
    `- ${placement}`,
    `- Exactly ONE keyword token per paragraph.`,
    `- Do NOT repeat a keyword in the same paragraph.`,
    `- Do NOT include any other keyword (token or raw text) in that paragraph.`,
    `- Do NOT add keyword at the end of a paragraph or line`,
    `- NEVER place a token/keyword at the END of a paragraph; keep at least 3 words AFTER it.`,
  ].join("\n");

  // Enhanced Humanization for AI-free content (more directives)
  const humanize = [
    `HUMAN NATURALITY (AI-FREE RULES - STRICTLY FOLLOW):`,
    `- Write like a real person sharing knowledge.`,
    `- Vary sentence length and starters; avoid robotic cadence.`,
    `- Content must be brutally human-like and AI-free: use only simple words and phrases, tweak some sentences to be slightly imperfect.`,
    `- Occasional first-person is okay if natural (e.g., "I've found that...").`,
    `- Specifics over fluff; avoid academic clichés.`,
    `- Keep it casual, like explaining to a friend over coffee.`,
    `- Avoid over-formal or AI-like phrases (no "in conclusion", no "delve into").`,
    `- No lists, no bullet points, no numbered steps.`,
    `- No repetitive sentence structures (mix short/long sentences).`,
    `- Use contractions naturally (don't, isn't, it's).`,
    `- Add slight imperfections: humans aren't perfect, so include minor digressions or asides.`,
    `- Avoid overly polished or "too perfect" writing; make it feel lived-in.`,
    `- Make it feel like a genuine human voice, not generated.`,
    `- Use natural transitions and asides (e.g., "by the way", "honestly").`,
    `- Include small opinions or observations where relevant (e.g., "it's surprising how often...").`,
    `- Avoid sounding like a template or formula; vary phrasing uniquely.`,
    `- Keep the flow engaging and relatable, like a personal blog post.`,
    `- Write in a way that feels spontaneous, not overly planned or structured.`,
    `- Use everyday language; avoid jargon unless explained casually.`,
    `- Make sure it reads like a human wrote it in one sitting, with natural flow.`,
    `- Introduce subtle variations in vocabulary to avoid repetition.`,
    `- Occasionally use rhetorical questions or direct address (e.g., "you might wonder...").`,
    `- Ensure no AI hallmarks: no symmetric structures, no over-optimization.`,
  ].join("\n");

  const plan = [
    `Return ONLY JSON: {"title": "...", "html": "..."}. No markdown/code fences.`,
    ``,
    languageDirective(prefs.language),
    moodDirectives(prefs.mood),
    humanize,
    ``,
    sectionsLine,
    ``,
    keywordHardRules,
    ``,
    `Additional user instructions (highest priority): ${prefs.extraInstructions || "(none)"}`,
    ``,
    `Do NOT copy these instructions into the html. Write ORIGINAL html only.`,
  ].join("\n");

  return plan;
}