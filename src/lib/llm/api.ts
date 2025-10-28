// // src/lib/llm/api.ts
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const GEMINI_API_KEYS: string[] = [
//   "AIzaSyDMLKj8FWf0O3bbp33LV8bYXKsLbCCkky0"
// ];
// if (!GEMINI_API_KEYS.length) {
//   throw new Error("❌ No Gemini API keys set in src/lib/llm/api.ts → GEMINI_API_KEYS[]");
// }

// const MODEL_CANDIDATES = [
//   "gemini-2.5-flash",
//   "gemini-2.5-flash-lite",
//   "gemini-2.5-pro",
// ] as const;

// const FORCE_REST = true;

// function pickRandomKey(): string {
//   const idx = Math.floor(Math.random() * GEMINI_API_KEYS.length);
//   return GEMINI_API_KEYS[idx];
// }

// function safeParseJson(maybe: string): any | null {
//   if (!maybe) return null;
//   const s = maybe.trim().replace(/^```json\s*|\s*```$/g, "");
//   try { return JSON.parse(s); } catch {}
//   const i = s.indexOf("{"), j = s.lastIndexOf("}");
//   if (i >= 0 && j > i) { try { return JSON.parse(s.slice(i, j + 1)); } catch {} }
//   return null;
// }
// function normaliseTitle(t: string, fb: string) {
//   const s = (t || "").trim().replace(/\s+/g, " ");
//   return s && s.length <= 70 ? s : (s || fb).slice(0, 70).replace(/\s+\S*$/, "").trim();
// }

// async function restGenerate(modelName: string, prompt: string, key: string) {
//   // (Optional) Remove this log if you don’t want the full prompt in console:
//   console.log(prompt);

//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(key)}`;
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json; charset=UTF-8" },
//     body: JSON.stringify({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//       generationConfig: {
//         temperature: 0.7,
//         topP: 0.9,
//         topK: 40,
//         maxOutputTokens: 1600, // enough for ~5x110w + conclusion
//       }
//     }),
//   });
//   const json = await res.json().catch(() => ({}));
//   const parts = json?.candidates?.[0]?.content?.parts;
//   const text = Array.isArray(parts) ? parts.map((p: any) => p?.text ?? "").join("") : "";
//   return String(text || "").trim();
// }

// /** Simple JSON fetcher — post-processing enforces headings & paragraphs. */
// export async function generateJSONTitleHtml({
//   keywords,
//   instructions = "",
// }: {
//   keywords: string | string[];
//   instructions?: string;
// }): Promise<{ title: string; html: string }> {
//   const kwArr = Array.isArray(keywords) ? keywords.filter(Boolean) : [keywords].filter(Boolean);
//   if (!kwArr.length) throw new Error("No keywords provided");

//   const guard = [
//     `Return ONLY JSON with keys "title" and "html".`,
//     `DO NOT copy any guideline/instruction text into "html".`,
//     `No markdown fences.`,
//   ].join("\n");

//   const prompt = [
//     guard,
//     instructions ? `\n${instructions}` : "",
//   ].join("\n");

//   let lastErr: unknown;
//   for (const modelName of MODEL_CANDIDATES) {
//     const key = pickRandomKey();

//     if (!FORCE_REST) {
//       try {
//         const client = new GoogleGenerativeAI(key);
//         const model = client.getGenerativeModel({ model: modelName as string });
//         const result = await model.generateContent(prompt);
//         console.log(result)
//         const text = result?.response?.text?.() ?? "";
//         const obj = safeParseJson(text);
//         if (!obj) throw new Error("SDK returned non-JSON");
//         const title = normaliseTitle(obj.title ?? kwArr[0], kwArr[0]);
//         const html = String(obj.html ?? "");
//         if (!html) throw new Error("SDK JSON missing html");
//         return { title, html };
//       } catch (e) {
//         lastErr = e;
//         console.warn("[LLM][SDK] failed:", (e as any)?.message || e);
//       }
//     }

//     try {
//       const text = await restGenerate(modelName, prompt, key);
//       const obj = safeParseJson(text);
//       if (!obj) throw new Error("REST returned non-JSON");
//       const title = normaliseTitle(obj.title ?? kwArr[0], kwArr[0]);
//       const html = String(obj.html ?? "");
//       if (!html) throw new Error("REST JSON missing html");
//       return { title, html };
//     } catch (e) {
//       lastErr = e;
//       console.warn("[LLM][REST] failed:", (e as any)?.message || e);
//     }
//   }

//   console.error("[LLM] All models failed. Fallback.", lastErr);
//   return {
//     title: normaliseTitle(`${(Array.isArray(keywords) ? keywords[0] : keywords) || "Untitled"} — practical notes`, String(Array.isArray(keywords) ? keywords[0] : keywords || "Untitled")),
//     html: `<h3><strong>Why This Matters</strong></h3><p>${(Array.isArray(keywords) ? keywords : [keywords]).map(k => `[ANCHOR:${k}]`).join(" ")} — draft.</p>`,
//   };
// }

// export function applyAnchorTokens(html: string, anchors: Array<{ keyword: string; url?: string }>) {
//   let out = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const rep = url ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>` : `<strong>${keyword}</strong>`;
//     out = out.replace(token, rep);
//   }
//   return out;
// }

// declare global { interface Window { __llmProbe?: (k: string|string[]) => Promise<void> } }
// if (typeof window !== "undefined") {
//   (window as any).__llmProbe = async (kws: string | string[]) => {
//     try {
//       const r = await generateJSONTitleHtml({ keywords: kws });
//       console.log("[LLM] PROBE ok:", r);
//     } catch (e) {
//       console.error("[LLM] PROBE err:", e);
//     }
//   };
// }



import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEYS: string[] = [
  "AIzaSyDMLKj8FWf0O3bbp33LV8bYXKsLbCCkky0"
];
if (!GEMINI_API_KEYS.length) throw new Error("❌ No Gemini API keys set (src/lib/llm/api.ts).");

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
] as const;

const FORCE_REST = true;

function pickRandomKey(): string {
  const idx = Math.floor(Math.random() * GEMINI_API_KEYS.length);
  return GEMINI_API_KEYS[idx];
}

function safeParseJson(maybe: string): any | null {
  if (!maybe) return null;
  const s = maybe.trim().replace(/^```json\s*|\s*```$/g, "");
  try { return JSON.parse(s); } catch {}
  const i = s.indexOf("{"), j = s.lastIndexOf("}");
  if (i >= 0 && j > i) { try { return JSON.parse(s.slice(i, j + 1)); } catch {} }
  return null;
}
function normaliseTitle(t: string, fb: string) {
  const s = (t || "").trim().replace(/\s+/g, " ");
  return s && s.length <= 70 ? s : (s || fb).slice(0, 70).replace(/\s+\S*$/, "").trim();
}

async function restGenerate(modelName: string, prompt: string, key: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2000,
      }
    }),
  });
  const json = await res.json().catch(() => ({}));
  const parts = json?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts) ? parts.map((p: any) => p?.text ?? "").join("") : "";
  return String(text || "").trim();
}

/** Accepts the full instruction string built elsewhere (single source of truth). */
export async function generateJSONTitleHtml({
  keywords,
  instructions,
}: {
  keywords: string | string[];
  instructions: string; // REQUIRED: built by prompt-engine
}): Promise<{ title: string; html: string }> {
  const kwArr = Array.isArray(keywords) ? keywords.filter(Boolean) : [keywords].filter(Boolean);
  if (!kwArr.length) throw new Error("No keywords provided");
  if (!instructions || !instructions.trim()) throw new Error("No instructions provided to LLM.");

  let lastErr: unknown;
  for (const modelName of MODEL_CANDIDATES) {
    const key = pickRandomKey();

    if (!FORCE_REST) {
      try {
        const client = new GoogleGenerativeAI(key);
        const model = client.getGenerativeModel({ model: modelName as string });
        const result = await model.generateContent(instructions);
        const text = result?.response?.text?.() ?? "";
        const obj = safeParseJson(text);
        if (!obj) throw new Error("SDK returned non-JSON");
        const title = normaliseTitle(obj.title ?? kwArr[0], kwArr[0]);
        const html = String(obj.html ?? "");
        if (!html) throw new Error("SDK JSON missing html");
        return { title, html };
      } catch (e) {
        lastErr = e;
        console.warn("[LLM][SDK] failed:", (e as any)?.message || e);
      }
    }

    try {
      const text = await restGenerate(modelName, instructions, key);
      const obj = safeParseJson(text);
      if (!obj) throw new Error("REST returned non-JSON");
      const title = normaliseTitle(obj.title ?? kwArr[0], kwArr[0]);
      const html = String(obj.html ?? "");
      if (!html) throw new Error("REST JSON missing html");
      return { title, html };
    } catch (e) {
      lastErr = e;
      console.warn("[LLM][REST] failed:", (e as any)?.message || e);
    }
  }

  console.error("[LLM] All models failed. Fallback.", lastErr);
  return {
    title: normaliseTitle(`${(Array.isArray(keywords) ? keywords[0] : keywords) || "Untitled"} — practical notes`, String(Array.isArray(keywords) ? keywords[0] : keywords || "Untitled")),
    html: `<h1>Why This Matters</h1><p>${(Array.isArray(keywords) ? keywords : [keywords]).map(k => `[ANCHOR:${k}]`).join(" ")} — draft.</p>`,
  };
}

export function applyAnchorTokens(html: string, anchors: Array<{ keyword: string; url?: string }>) {
  let out = html || "";
  for (const { keyword, url } of anchors) {
    const token = `[ANCHOR:${keyword}]`;
    const rep = url ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>` : `<strong>${keyword}</strong>`;
    out = out.replace(token, rep);
  }
  return out;
}
