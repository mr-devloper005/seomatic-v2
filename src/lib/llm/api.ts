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



// import { GoogleGenerativeAI } from "@google/generative-ai";

// const GEMINI_API_KEYS: string[] = [
//   "AIzaSyAiuEsxN0T5okxCpWE4mTQ5eReyX5512uA",
//   "AIzaSyCRgUqkiWpfxkU5z21npnNvlqAK5ZyxQfo"
// ];
// if (!GEMINI_API_KEYS.length) throw new Error("❌ No Gemini API keys set (src/lib/llm/api.ts).");

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
//         maxOutputTokens: 2000,
//       }
//     }),
//   });
//   const json = await res.json().catch(() => ({}));
//   const parts = json?.candidates?.[0]?.content?.parts;
//   const text = Array.isArray(parts) ? parts.map((p: any) => p?.text ?? "").join("") : "";
//   return String(text || "").trim();
// }

// /** Accepts the full instruction string built elsewhere (single source of truth). */
// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
// }: {
//   keywords: string | string[];
//   instructions: string; // REQUIRED: built by prompt-engine
// }): Promise<{ title: string; html: string }> {
//   const kwArr = Array.isArray(keywords) ? keywords.filter(Boolean) : [keywords].filter(Boolean);
//   if (!kwArr.length) throw new Error("No keywords provided");
//   if (!instructions || !instructions.trim()) throw new Error("No instructions provided to LLM.");

//   let lastErr: unknown;
//   for (const modelName of MODEL_CANDIDATES) {
//     const key = pickRandomKey();

//     if (!FORCE_REST) {
//       try {
//         const client = new GoogleGenerativeAI(key);
//         const model = client.getGenerativeModel({ model: modelName as string });
//         const result = await model.generateContent(instructions);
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
//       const text = await restGenerate(modelName, instructions, key);
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
//     html: `<h1>Why This Matters</h1><p>${(Array.isArray(keywords) ? keywords : [keywords]).map(k => `[ANCHOR:${k}]`).join(" ")} — draft.</p>`,
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


// // src/lib/llm/api.ts
// import { GoogleGenerativeAI } from "@google/generative-ai";

// /** ───────────────────────────────────────────────────────────────────
//  *  CONFIG (tweak safely)
//  *  ─────────────────────────────────────────────────────────────────── */
// const GEMINI_API_KEYS: string[] = [

//   // process.env.NEXT_PUBLIC_GEMINI_KEYS?.split(",").map(s=>s.trim()).filter(Boolean) ?? []
//   "AIzaSyAiuEsxN0T5okxCpWE4mTQ5eReyX5512uA",
//   "AIzaSyCRgUqkiWpfxkU5z21npnNvlqAK5ZyxQfo"
// ];
// if (!GEMINI_API_KEYS.length) throw new Error("❌ No Gemini API keys set.");

// type ModelName = "gemini-2.5-flash-lite" | "gemini-2.5-flash" | "gemini-2.5-pro";
// const MODEL_PLAN: ModelName[] = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"];

// const REQUEST_TIMEOUT_MS = 25_000;
// const BASE_KEY_COOLDOWN_MS = 60_000;          // base cool-down after 429
// const MAX_RETRIES = 5;
// const MAX_IN_FLIGHT_PER_KEY = 5;              // HARD cap: 1 request per key at a time
// const ENABLE_HEDGING = false;                 // keep OFF; hedging can amplify 429s

// // token budget to lower model work a bit (helps quota)
// const MAX_OUTPUT_TOKENS = 2000;
// const TEMPERATURE = 0.62;
// const TOP_P = 0.9;
// const TOP_K = 50;

// /** ───────────────────────────────────────────────────────────────────
//  *  INTERNAL STATE
//  *  ─────────────────────────────────────────────────────────────────── */
// let rrIndex = Math.floor(Math.random() * GEMINI_API_KEYS.length);
// const keyState = new Map<string, {
//   cooldownUntil: number;
//   inFlight: number;
//   penaltyMs: number;      // grows with 429, decays over time
// }>();
// for (const k of GEMINI_API_KEYS) keyState.set(k, { cooldownUntil: 0, inFlight: 0, penaltyMs: 0 });

// let globalPenaltyMs = 0;   // grows if we keep hitting 429 across keys

// /** Utils */
// const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// function now() { return Date.now(); }

// function nextUsableKey(): string | null {
//   const n = GEMINI_API_KEYS.length;
//   const t = now();
//   for (let i = 0; i < n; i++) {
//     const idx = (rrIndex++ % n + n) % n;
//     const k = GEMINI_API_KEYS[idx];
//     const st = keyState.get(k)!;
//     if (st.cooldownUntil <= t && st.inFlight < MAX_IN_FLIGHT_PER_KEY) return k;
//   }
//   // none immediately usable
//   return null;
// }

// function acquireKey(key: string) {
//   const st = keyState.get(key)!;
//   st.inFlight++;
// }
// function releaseKey(key: string) {
//   const st = keyState.get(key)!;
//   st.inFlight = Math.max(0, st.inFlight - 1);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const st = keyState.get(key)!;
//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + st.penaltyMs;
//   st.cooldownUntil = Math.max(st.cooldownUntil, now() + extra);
//   // ramp penalties (cap ~5 min)
//   st.penaltyMs = Math.min((st.penaltyMs || 0) * 2 + 1000, 300_000);
//   // global penalty too
//   globalPenaltyMs = Math.min(globalPenaltyMs * 2 + 500, 10_000);
// }

// function decayPenalties() {
//   // called on successful request
//   for (const st of keyState.values()) st.penaltyMs = Math.max(0, st.penaltyMs - 400);
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 250);
// }

// function normaliseTitle(t: string, fb: string) {
//   const s = (t || "").trim().replace(/\s+/g, " ");
//   return s && s.length <= 70 ? s : (s || fb).slice(0, 70).replace(/\s+\S*$/, "").trim();
// }

// function parseJsonStrict(s: string): any | null {
//   if (!s) return null;
//   const clean = s.replace(/```json|```/g, "").trim();
//   try { return JSON.parse(clean); } catch {}
//   const i = clean.indexOf("{"), j = clean.lastIndexOf("}");
//   if (i >= 0 && j > i) { try { return JSON.parse(clean.slice(i, j + 1)); } catch {} }
//   return null;
// }

// async function fetchJsonWithTimeout(url: string, body: any, timeoutMs: number) {
//   const ctrl = new AbortController();
//   const t = setTimeout(() => ctrl.abort(), timeoutMs);
//   try {
//     const res = await fetch(url, {
//       method: "POST",
//       signal: ctrl.signal,
//       headers: { "Content-Type": "application/json; charset=UTF-8" },
//       body: JSON.stringify(body),
//     });
//     const json = await res.json().catch(() => ({}));
//     return { status: res.status, headers: res.headers, json };
//   } finally {
//     clearTimeout(t);
//   }
// }

// function buildPayload(prompt: string) {
//   return {
//     contents: [{ role: "user", parts: [{ text: prompt }] }],
//     generationConfig: {
//       temperature: TEMPERATURE,
//       topP: TOP_P,
//       topK: TOP_K,
//       maxOutputTokens: MAX_OUTPUT_TOKENS,
//     },
//   };
// }

// function parseRetryAfterMs(h: Headers): number | null {
//   const ra = h.get("retry-after");
//   if (!ra) return null;
//   // either seconds or HTTP-date
//   const sec = Number(ra);
//   if (!Number.isNaN(sec) && sec >= 0) return Math.max(0, Math.floor(sec * 1000));
//   const t = Date.parse(ra);
//   if (!Number.isNaN(t)) return Math.max(0, t - now());
//   return null;
// }

// async function tryREST(model: ModelName, key: string, prompt: string) {
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

//   acquireKey(key);
//   try {
//     // wait global/key penalties before firing to reduce 429s
//     const st = keyState.get(key)!;
//     const waitMs = Math.max(0, st.penaltyMs, globalPenaltyMs, st.cooldownUntil - now());
//     if (waitMs > 0) await sleep(waitMs);

//     const { status, headers, json } = await fetchJsonWithTimeout(url, buildPayload(prompt), REQUEST_TIMEOUT_MS);

//     if (status === 429 || json?.error?.code === 429) {
//       const retryMs = parseRetryAfterMs(headers);
//       markCooldown(key, retryMs);
//       const err: any = new Error("Rate limited");
//       err.code = 429;
//       err.retryAfterMs = retryMs ?? BASE_KEY_COOLDOWN_MS;
//       throw err;
//     }
//     if (status >= 500) throw new Error(`Gemini server error ${status}${json?.error?.message ? `: ${json.error.message}` : ""}`);
//     if (json?.error) throw new Error(json.error.message || "Gemini error");

//     const text =
//       json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ??
//       json?.candidates?.[0]?.content?.parts?.[0]?.text ??
//       "";
//     const obj = parseJsonStrict(String(text || "").trim());
//     if (!obj || !obj.html) throw new Error("Non-JSON or missing html");

//     decayPenalties();
//     return obj as { title?: string; html: string };
//   } finally {
//     releaseKey(key);
//   }
// }

// async function attemptOnce(model: ModelName, prompt: string) {
//   // pick a usable key (or wait a bit and retry pick)
//   let key = nextUsableKey();
//   if (!key) {
//     // no key free: take the earliest to be free
//     const soonest = Array.from(keyState.entries()).reduce((a, b) =>
//       a[1].cooldownUntil <= b[1].cooldownUntil ? a : b
//     );
//     const wait = Math.max(0, soonest[1].cooldownUntil - now(), 250);
//     await sleep(wait);
//     key = nextUsableKey(); // try again
//   }
//   if (!key) key = GEMINI_API_KEYS[0]; // last resort
// console.log(prompt)
//   // Do not hedge if disabled or we have too few keys
//   return tryREST(model, key, prompt);
// }

// /** Single-source: returns { title, html } */
// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
// }: {
//   keywords: string | string[];
//   instructions: string;
// }): Promise<{ title: string; html: string }> {
//   const kwArr = Array.isArray(keywords) ? keywords.filter(Boolean) : [keywords].filter(Boolean);
//   if (!kwArr.length) throw new Error("No keywords provided");
//   if (!instructions?.trim()) throw new Error("No instructions provided to LLM.");

//   let lastErr: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     const model = MODEL_PLAN[Math.min(attempt, MODEL_PLAN.length - 1)];

//     try {
//       // small global backoff before each attempt if we're hot
//       if (globalPenaltyMs > 0) await sleep(Math.min(globalPenaltyMs, 1500));

//       const obj = await attemptOnce(model, instructions);
//       const title = normaliseTitle(obj.title ?? kwArr[0], kwArr[0]);
//       const html = String(obj.html ?? "");
//       if (!html) throw new Error("Empty html");
//       return { title, html };
//     } catch (e: any) {
//       lastErr = e;
//       if (e?.code === 429) {
//         // respect server advice if any
//         const wait = Math.min(Math.max(800, e.retryAfterMs ?? BASE_KEY_COOLDOWN_MS), 120_000);
//         await sleep(wait + Math.floor(Math.random() * 400));
//       } else {
//         // generic exponential backoff with jitter
//         const wait = Math.min(2000 * (attempt + 1) + Math.random() * 500, 6000);
//         await sleep(wait);
//       }
//     }
//   }

//   console.warn("[LLM] Falling back after retries:", lastErr?.message || lastErr);
//   return {
//     title: normaliseTitle(`${kwArr[0] || "Untitled"} — practical notes`, kwArr[0] || "Untitled"),
//     html: `<h1>Why This Matters</h1><p>${kwArr.map(k => `[ANCHOR:${k}]`).join(" ")} — draft.</p>`,
//   };
// }

// export function applyAnchorTokens(html: string, anchors: Array<{ keyword: string; url?: string }>) {
//   let out = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const rep = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     out = out.replace(token, rep);
//   }
//   return out;
// }



// // src/lib/llm/api.ts
// import { GoogleGenerativeAI } from "@google/generative-ai";

// /** ───────────────────────────────────────────────────────────────────
//  *  CONFIG - SPEED OPTIMIZED
//  *  ─────────────────────────────────────────────────────────────────── */
// const GEMINI_API_KEYS: string[] = [
//   "AIzaSyAiuEsxN0T5okxCpWE4mTQ5eReyX5512uA",
//   "AIzaSyDJzsTMXS53918qwV6Y3RBOXbJ9uPQ6NUY",
//   "AIzaSyALWTZHYpIEb5INMnICR0VzEEV8Nhv0SVA",
//   "AIzaSyCsYwyhhDMs8v90Mfbb_BosautLkf61urQ",
//   "AIzaSyBY_vj98oCUP72rgPAIIE3OdiaEVbYSXAY",
//   "AIzaSyAUEqlBExrhs9hvnGkpF_5t7J-Jkli19b8",
//   "AIzaSyAvcKxsTin_o1gtKflkLlU50-xdnEphkuk"

  

// ];
// if (!GEMINI_API_KEYS.length) throw new Error("❌ No Gemini API keys set.");

// type ModelName =  "gemini-2.5-flash" | "gemini-2.5-flash-lite" | "gemini-2.5-pro";
// const MODEL_PLAN: ModelName[] = [ "gemini-2.5-flash"]; // Removed pro for speed

// const REQUEST_TIMEOUT_MS = 20_000; // Reduced from 25s
// const BASE_KEY_COOLDOWN_MS = 45_000; // Reduced from 60s
// const MAX_RETRIES = 5; // Reduced from 5 for speed
// const MAX_IN_FLIGHT_PER_KEY = 10; // Increased from 5
// const ENABLE_HEDGING = false;

// // Optimized for speed + quality balance
// const MAX_OUTPUT_TOKENS = 2500; // Increased for better content
// const TEMPERATURE = 0.95; // Higher for more creativity/humanization
// const TOP_P = 0.92;
// const TOP_K = 60;

// /** ───────────────────────────────────────────────────────────────────
//  *  INTERNAL STATE
//  *  ─────────────────────────────────────────────────────────────────── */
// let rrIndex = Math.floor(Math.random() * GEMINI_API_KEYS.length);
// const keyState = new Map<string, {
//   cooldownUntil: number;
//   inFlight: number;
//   penaltyMs: number;
// }>();
// for (const k of GEMINI_API_KEYS) keyState.set(k, { cooldownUntil: 0, inFlight: 0, penaltyMs: 0 });

// let globalPenaltyMs = 0;

// const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
// function now() { return Date.now(); }

// function nextUsableKey(): string | null {
//   const n = GEMINI_API_KEYS.length;
//   const t = now();
//   for (let i = 0; i < n; i++) {
//     const idx = (rrIndex++ % n + n) % n;
//     const k = GEMINI_API_KEYS[idx];
//     const st = keyState.get(k)!;
//     if (st.cooldownUntil <= t && st.inFlight < MAX_IN_FLIGHT_PER_KEY) return k;
//   }
//   return null;
// }

// function acquireKey(key: string) {
//   keyState.get(key)!.inFlight++;
// }

// function releaseKey(key: string) {
//   const st = keyState.get(key)!;
//   st.inFlight = Math.max(0, st.inFlight - 1);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const st = keyState.get(key)!;
//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + st.penaltyMs;
//   st.cooldownUntil = Math.max(st.cooldownUntil, now() + extra);
//   st.penaltyMs = Math.min((st.penaltyMs || 0) * 1.8 + 800, 200_000); // Faster recovery
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.5 + 300, 6_000);
// }

// function decayPenalties() {
//   for (const st of keyState.values()) st.penaltyMs = Math.max(0, st.penaltyMs - 600);
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// function normaliseTitle(t: string, fb: string) {
//   const s = (t || "").trim().replace(/\s+/g, " ");
//   return s && s.length <= 70 ? s : (s || fb).slice(0, 70).replace(/\s+\S*$/, "").trim();
// }

// function parseJsonStrict(s: string): any | null {
//   if (!s) return null;
//   const clean = s.replace(/```json|```/g, "").trim();
//   try { return JSON.parse(clean); } catch {}
//   const i = clean.indexOf("{"), j = clean.lastIndexOf("}");
//   if (i >= 0 && j > i) { try { return JSON.parse(clean.slice(i, j + 1)); } catch {} }
//   return null;
// }

// async function fetchJsonWithTimeout(url: string, body: any, timeoutMs: number) {
//   const ctrl = new AbortController();
//   const t = setTimeout(() => ctrl.abort(), timeoutMs);
//   try {
//     const res = await fetch(url, {
//       method: "POST",
//       signal: ctrl.signal,
//       headers: { "Content-Type": "application/json; charset=UTF-8" },
//       body: JSON.stringify(body),
//     });
//     const json = await res.json().catch(() => ({}));
//     return { status: res.status, headers: res.headers, json };
//   } finally {
//     clearTimeout(t);
//   }
// }

// function buildPayload(prompt: string) {
//   return {
//     contents: [{ role: "user", parts: [{ text: prompt }] }],
//     generationConfig: {
//       temperature: TEMPERATURE,
//       topP: TOP_P,
//       topK: TOP_K,
//       maxOutputTokens: MAX_OUTPUT_TOKENS,
//     },
//   };
// }

// function parseRetryAfterMs(h: Headers): number | null {
//   const ra = h.get("retry-after");
//   if (!ra) return null;
//   const sec = Number(ra);
//   if (!Number.isNaN(sec) && sec >= 0) return Math.max(0, Math.floor(sec * 1000));
//   const t = Date.parse(ra);
//   if (!Number.isNaN(t)) return Math.max(0, t - now());
//   return null;
// }

// async function tryREST(model: ModelName, key: string, prompt: string) {
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

//   acquireKey(key);
//   try {
//     const st = keyState.get(key)!;
//     const waitMs = Math.max(0, st.penaltyMs, globalPenaltyMs, st.cooldownUntil - now());
//     if (waitMs > 0) await sleep(Math.min(waitMs, 3000)); // Cap wait time

//     const { status, headers, json } = await fetchJsonWithTimeout(url, buildPayload(prompt), REQUEST_TIMEOUT_MS);

//     if (status === 429 || json?.error?.code === 429) {
//       const retryMs = parseRetryAfterMs(headers);
//       markCooldown(key, retryMs);
//       const err: any = new Error("Rate limited");
//       err.code = 429;
//       err.retryAfterMs = retryMs ?? BASE_KEY_COOLDOWN_MS;
//       throw err;
//     }
//     if (status >= 500) throw new Error(`Gemini server error ${status}`);
//     if (json?.error) throw new Error(json.error.message || "Gemini error");

//     const text =
//       json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ??
//       json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
//     const obj = parseJsonStrict(String(text || "").trim());
//     if (!obj || !obj.html) throw new Error("Non-JSON or missing html");

//     decayPenalties();
//     return obj as { title?: string; html: string };
//   } finally {
//     releaseKey(key);
//   }
// }

// async function attemptOnce(model: ModelName, prompt: string) {
//   let key = nextUsableKey();
//   if (!key) {
//     const soonest = Array.from(keyState.entries()).reduce((a, b) =>
//       a[1].cooldownUntil <= b[1].cooldownUntil ? a : b
//     );
//     const wait = Math.max(0, soonest[1].cooldownUntil - now(), 150); // Reduced wait
//     await sleep(wait);
//     key = nextUsableKey();
//   }
//   if (!key) key = GEMINI_API_KEYS[0];

//   return tryREST(model, key, prompt);
// }

// /** Single-source: returns { title, html } - SPEED OPTIMIZED */
// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
// }: {
//   keywords: string | string[];
//   instructions: string;
// }): Promise<{ title: string; html: string }> {
//   const kwArr = Array.isArray(keywords) ? keywords.filter(Boolean) : [keywords].filter(Boolean);
//   if (!kwArr.length) throw new Error("No keywords provided");
//   if (!instructions?.trim()) throw new Error("No instructions provided to LLM.");

//   let lastErr: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     const model = MODEL_PLAN[Math.min(attempt, MODEL_PLAN.length - 1)];

//     try {
//       if (globalPenaltyMs > 0) await sleep(Math.min(globalPenaltyMs, 1000)); // Reduced max wait

//       const obj = await attemptOnce(model, instructions);
//       const title = normaliseTitle(obj.title ?? kwArr[0], kwArr[0]);
//       const html = String(obj.html ?? "");
//       if (!html) throw new Error("Empty html");
//       return { title, html };
//     } catch (e: any) {
//       lastErr = e;
//       if (e?.code === 429) {
//         const wait = Math.min(Math.max(500, e.retryAfterMs ?? BASE_KEY_COOLDOWN_MS), 60_000); // Faster retry
//         await sleep(wait + Math.floor(Math.random() * 300));
//       } else {
//         const wait = Math.min(1500 * (attempt + 1) + Math.random() * 400, 4500); // Faster backoff
//         await sleep(wait);
//       }
//     }
//   }

//   console.warn("[LLM] Falling back after retries:", lastErr?.message || lastErr);
//   return {
//     title: normaliseTitle(`${kwArr[0] || "Untitled"} — practical notes`, kwArr[0] || "Untitled"),
//     html: `<h1>Why This Matters</h1><p>${kwArr.map(k => `[ANCHOR:${k}]`).join(" ")} — draft.</p>`,
//   };
// }

// export function applyAnchorTokens(html: string, anchors: Array<{ keyword: string; url?: string }>) {
//   let out = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const rep = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     out = out.replace(token, rep);
//   }
//   return out;
// }

// src/lib/llm/api.ts

// /** ───────────────────────────────────────────────────────────────────
//  *  SPEED + QUALITY (Hedged across 3 approved models)
//  *  Models: gemini-2.5-flash, gemini-2.0-flash, gemini-2.0-exp
//  *  - Cancel-on-qualified-win (tiny staggers)
//  *  - Per-key cooldowns and global penalties
//  *  - Per-model timeouts
//  *  - JSON-only contract: { title?, html }
//  *  ─────────────────────────────────────────────────────────────────── */

// const GEMINI_API_KEYS: string[] = [
//   "AIzaSyAiuEsxN0T5okxCpWE4mTQ5eReyX5512uA",
//   "AIzaSyDJzsTMXS53918qwV6Y3RBOXbJ9uPQ6NUY",
//   "AIzaSyALWTZHYpIEb5INMnICR0VzEEV8Nhv0SVA",
//   "AIzaSyCsYwyhhDMs8v90Mfbb_BosautLkf61urQ",
//   "AIzaSyBY_vj98oCUP72rgPAIIE3OdiaEVbYSXAY",
//   "AIzaSyAUEqlBExrhs9hvnGkpF_5t7J-Jkli19b8",
//   "AIzaSyAvcKxsTin_o1gtKflkLlU50-xdnEphkuk"
// ];
// if (!GEMINI_API_KEYS.length) throw new Error("❌ No Gemini API keys set.");

// type ModelName =
//   | "gemini-2.5-flash"
//   | "gemini-2.0-flash"
//   | "gemini-2.0-exp";

// const MODEL_POOL: ModelName[] = [
//   "gemini-2.5-flash", // fast + good
//   "gemini-2.0-flash", // fast
//   "gemini-2.0-exp",   // slower but often higher quality
// ];

// const REQUEST_TIMEOUT_MS = 20_000;
// const BASE_KEY_COOLDOWN_MS = 45_000;
// const MAX_RETRIES = 5;
// const MAX_IN_FLIGHT_PER_KEY = 6;   // curb 429 storms
// const ENABLE_HEDGING = true;

// const MAX_OUTPUT_TOKENS = 2500;
// const TEMPERATURE = 0.9;  // slightly steadier across models
// const TOP_P = 0.92;
// const TOP_K = 60;

// // Per-model timeouts (ms)
// const TIMEOUT_BY_MODEL: Record<ModelName, number> = {
//   "gemini-2.5-flash": 20_000,
//   "gemini-2.0-flash": 22_000,
//   "gemini-2.0-exp":   26_000,
// };

// /** ───────────────────────────────────────────────────────────────────
//  *  INTERNAL STATE
//  *  ─────────────────────────────────────────────────────────────────── */
// let rrIndex = Math.floor(Math.random() * GEMINI_API_KEYS.length);
// const keyState = new Map<string, {
//   cooldownUntil: number;
//   inFlight: number;
//   penaltyMs: number;
// }>();
// for (const k of GEMINI_API_KEYS) keyState.set(k, { cooldownUntil: 0, inFlight: 0, penaltyMs: 0 });

// let globalPenaltyMs = 0;

// const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
// const now = () => Date.now();

// function nextUsableKey(): string | null {
//   const n = GEMINI_API_KEYS.length;
//   const t = now();
//   for (let i = 0; i < n; i++) {
//     const idx = (rrIndex++ % n + n) % n;
//     const k = GEMINI_API_KEYS[idx];
//     const st = keyState.get(k)!;
//     if (st.cooldownUntil <= t && st.inFlight < MAX_IN_FLIGHT_PER_KEY) return k;
//   }
//   return null;
// }

// function acquireKey(key: string) {
//   keyState.get(key)!.inFlight++;
// }
// function releaseKey(key: string) {
//   const st = keyState.get(key)!;
//   st.inFlight = Math.max(0, st.inFlight - 1);
// }
// function markCooldown(key: string, retryAfterMs: number | null) {
//   const st = keyState.get(key)!;
//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + st.penaltyMs;
//   st.cooldownUntil = Math.max(st.cooldownUntil, now() + extra);
//   st.penaltyMs = Math.min((st.penaltyMs || 0) * 1.8 + 800, 200_000);
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.5 + 300, 6_000);
// }
// function decayPenalties() {
//   for (const st of keyState.values()) st.penaltyMs = Math.max(0, st.penaltyMs - 600);
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// /** ───────────────────────────────────────────────────────────────────
//  *  UTILS
//  *  ─────────────────────────────────────────────────────────────────── */
// function normaliseTitle(t: string, fb: string) {
//   const s = (t || "").trim().replace(/\s+/g, " ");
//   return s && s.length <= 70 ? s : (s || fb).slice(0, 70).replace(/\s+\S*$/, "").trim();
// }
// function parseJsonStrict(s: string): any | null {
//   if (!s) return null;
//   const clean = s.replace(/```json|```/g, "").trim();
//   try { return JSON.parse(clean); } catch {}
//   const i = clean.indexOf("{"), j = clean.lastIndexOf("}");
//   if (i >= 0 && j > i) { try { return JSON.parse(clean.slice(i, j + 1)); } catch {} }
//   return null;
// }

// async function fetchJsonWithTimeout(
//   url: string,
//   body: any,
//   timeoutMs: number,
//   externalSignal?: AbortSignal
// ) {
//   const ctrl = new AbortController();
//   const onAbort = () => ctrl.abort();
//   if (externalSignal) externalSignal.addEventListener("abort", onAbort, { once: true });

//   const t = setTimeout(() => ctrl.abort(), timeoutMs);
//   try {
//     const res = await fetch(url, {
//       method: "POST",
//       signal: ctrl.signal,
//       headers: { "Content-Type": "application/json; charset=UTF-8" },
//       body: JSON.stringify(body),
//     });
//     const json = await res.json().catch(() => ({}));
//     return { status: res.status, headers: res.headers, json };
//   } finally {
//     clearTimeout(t);
//     if (externalSignal) externalSignal.removeEventListener("abort", onAbort);
//   }
// }

// function buildPayload(prompt: string) {
//   return {
//     contents: [{ role: "user", parts: [{ text: prompt }] }],
//     generationConfig: {
//       temperature: TEMPERATURE,
//       topP: TOP_P,
//       topK: TOP_K,
//       maxOutputTokens: MAX_OUTPUT_TOKENS,
//     },
//   };
// }

// function parseRetryAfterMs(h: Headers): number | null {
//   const ra = h.get("retry-after");
//   if (!ra) return null;
//   const sec = Number(ra);
//   if (!Number.isNaN(sec) && sec >= 0) return Math.max(0, Math.floor(sec * 1000));
//   const t = Date.parse(ra);
//   if (!Number.isNaN(t)) return Math.max(0, t - now());
//   return null;
// }

// /** ───────────────────────────────────────────────────────────────────
//  *  SINGLE CALL (one model, one key) — supports external abort
//  *  ─────────────────────────────────────────────────────────────────── */
// async function tryREST(model: ModelName, key: string, prompt: string, signal?: AbortSignal) {
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

//   acquireKey(key);
//   try {
//     const st = keyState.get(key)!;
//     const waitMs = Math.max(0, st.penaltyMs, globalPenaltyMs, st.cooldownUntil - now());
//     if (waitMs > 0) await sleep(Math.min(waitMs, 3000));

//     const timeout = TIMEOUT_BY_MODEL[model] ?? REQUEST_TIMEOUT_MS;
//     const { status, headers, json } = await fetchJsonWithTimeout(url, buildPayload(prompt), timeout, signal);

//     if (status === 429 || json?.error?.code === 429) {
//       const retryMs = parseRetryAfterMs(headers);
//       markCooldown(key, retryMs);
//       const err: any = new Error("Rate limited");
//       err.code = 429;
//       err.retryAfterMs = retryMs ?? BASE_KEY_COOLDOWN_MS;
//       throw err;
//     }
//     if (status >= 500) throw new Error(`Gemini server error ${status}`);
//     if (json?.error) throw new Error(json.error.message || "Gemini error");

//     const text =
//       json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ??
//       json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
//     const obj = parseJsonStrict(String(text || "").trim());
//     if (!obj || !obj.html) throw new Error("Non-JSON or missing html");

//     decayPenalties();
//     return obj as { title?: string; html: string };
//   } finally {
//     releaseKey(key);
//   }
// }

// /** ───────────────────────────────────────────────────────────────────
//  *  ATTEMPT-ONCE (no hedging): pick a usable key and call model
//  *  ─────────────────────────────────────────────────────────────────── */
// async function attemptOnce(model: ModelName, prompt: string) {
//   let key = nextUsableKey();
//   if (!key) {
//     const soonest = Array.from(keyState.entries()).reduce((a, b) =>
//       a[1].cooldownUntil <= b[1].cooldownUntil ? a : b
//     );
//     const wait = Math.max(0, soonest[1].cooldownUntil - now(), 150);
//     await sleep(wait);
//     key = nextUsableKey();
//   }
//   if (!key) key = GEMINI_API_KEYS[0];

//   return tryREST(model, key, prompt);
// }

// /** ───────────────────────────────────────────────────────────────────
//  *  QUALITY GATE for cancel-on-qualified-win
//  *  ─────────────────────────────────────────────────────────────────── */
// function isQualified(obj: any): boolean {
//   if (!obj || typeof obj.html !== "string") return false;
//   const html = obj.html;
//   const h1s = (html.match(/<h1>/gi) || []).length;
//   if (h1s < 2) return false;
//   const wc = html
//     .replace(/\[ANCHOR:[^\]]+\]/g, " ")
//     .replace(/<[^>]+>/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(/\s+/).filter(Boolean).length;
//   return wc >= 120; // adjust if needed
// }

// /** ───────────────────────────────────────────────────────────────────
//  *  HEDGED ATTEMPT (3 models, tiny staggers, cancel losers)
//  *  ─────────────────────────────────────────────────────────────────── */
// async function hedgedAttempt(prompt: string): Promise<{ title?: string; html: string }> {
//   const controllers = MODEL_POOL.map(() => new AbortController());
//   const staggers = [0, 120, 240]; // ms

//   return new Promise((resolve, reject) => {
//     let remaining = MODEL_POOL.length;
//     const errors: any[] = [];
//     let resolved = false;

//     MODEL_POOL.forEach((model, i) => {
//       const start = async () => {
//         let key = nextUsableKey();
//         if (!key) {
//           const soonest = Array.from(keyState.entries()).reduce((a, b) =>
//             a[1].cooldownUntil <= b[1].cooldownUntil ? a : b
//           );
//           const wait = Math.max(0, soonest[1].cooldownUntil - now(), 150);
//           await sleep(wait);
//           key = nextUsableKey() || GEMINI_API_KEYS[0];
//         }

//         try {
//           const obj = await tryREST(model, key!, prompt, controllers[i].signal);
//           if (!resolved && isQualified(obj)) {
//             resolved = true;
//             controllers.forEach((c, j) => { if (j !== i) c.abort(); });
//             resolve(obj);
//           } else {
//             errors[i] = new Error("Unqualified result");
//           }
//         } catch (e) {
//           errors[i] = e;
//         } finally {
//           remaining -= 1;
//           if (!resolved && remaining === 0) {
//             const err = new Error(
//               "All hedged attempts failed or were unqualified: " +
//               errors.map((e, idx) => `${MODEL_POOL[idx]}: ${e?.message || e}`).join(" | ")
//             );
//             reject(err);
//           }
//         }
//       };

//       setTimeout(start, staggers[i]);
//     });
//   });
// }

// /** ───────────────────────────────────────────────────────────────────
//  *  PUBLIC: Single-source API (returns { title, html })
//  *  ─────────────────────────────────────────────────────────────────── */
// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
// }: {
//   keywords: string | string[];
//   instructions: string;
// }): Promise<{ title: string; html: string }> {
//   const kwArr = Array.isArray(keywords) ? keywords.filter(Boolean) : [keywords].filter(Boolean);
//   if (!kwArr.length) throw new Error("No keywords provided");
//   if (!instructions?.trim()) throw new Error("No instructions provided to LLM.");

//   let lastErr: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       if (globalPenaltyMs > 0) await sleep(Math.min(globalPenaltyMs, 1_000));

//       const obj = ENABLE_HEDGING
//         ? await hedgedAttempt(instructions)
//         : await attemptOnce(MODEL_POOL[Math.min(attempt, MODEL_POOL.length - 1)], instructions);

//       const title = normaliseTitle(obj.title ?? kwArr[0], kwArr[0]);
//       const html = String(obj.html || "");
//       if (!html) throw new Error("Empty html");
//       return { title, html };
//     } catch (e: any) {
//       lastErr = e;
//       if (e?.code === 429) {
//         const wait = Math.min(Math.max(500, e.retryAfterMs ?? BASE_KEY_COOLDOWN_MS), 60_000);
//         await sleep(wait + Math.floor(Math.random() * 300));
//       } else {
//         const wait = Math.min(1500 * (attempt + 1) + Math.random() * 400, 4500);
//         await sleep(wait);
//       }
//     }
//   }

//   console.warn("[LLM] Falling back after retries:", lastErr?.message || lastErr);
//   return {
//     title: normaliseTitle(`${kwArr[0] || "Untitled"} — practical notes`, kwArr[0] || "Untitled"),
//     html: `<h1>Why This Matters</h1><p>${kwArr.map(k => `[ANCHOR:${k}]`).join(" ")} — draft.</p>`,
//   };
// }

// /** ───────────────────────────────────────────────────────────────────
//  *  HTML utility for anchor replacement
//  *  ─────────────────────────────────────────────────────────────────── */
// export function applyAnchorTokens(html: string, anchors: Array<{ keyword: string; url?: string }>) {
//   let out = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const rep = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     out = out.replace(token, rep);
//   }
//   return out;
// }



/** ───────────────────────────────────────────────────────────────────
 *  SPEED + QUALITY (Hedged across 3 approved models)
 *  Models: gemini-2.5-flash, gemini-2.0-flash, gemini-2.0-exp
 *  - Cancel-on-qualified-win (tiny staggers)
 *  - Per-key cooldowns and global penalties
 *  - Per-model timeouts
 *  - JSON-only contract: { title?, html }
 *  - Randomized / weighted-random key selection per request
 *  - Distinct keys per hedged branch (avoids hammering one key)
 *  ─────────────────────────────────────────────────────────────────── */

const GEMINI_API_KEYS: string[] = [
  "AIzaSyAiuEsxN0T5okxCpWE4mTQ5eReyX5512uA",
  "AIzaSyDJzsTMXS53918qwV6Y3RBOXbJ9uPQ6NUY",
  "AIzaSyALWTZHYpIEb5INMnICR0VzEEV8Nhv0SVA",
  "AIzaSyCsYwyhhDMs8v90Mfbb_BosautLkf61urQ",
  "AIzaSyBY_vj98oCUP72rgPAIIE3OdiaEVbYSXAY",
  "AIzaSyAUEqlBExrhs9hvnGkpF_5t7J-Jkli19b8",
  "AIzaSyAvcKxsTin_o1gtKflkLlU50-xdnEphkuk"
];
if (!GEMINI_API_KEYS.length) throw new Error("❌ No Gemini API keys set.");

export type ModelName =
  | "gemini-2.5-flash"
  | "gemini-2.0-flash"
  | "gemini-2.0-exp";

const MODEL_POOL: ModelName[] = [
  "gemini-2.5-flash", // fast + good
  "gemini-2.0-flash", // fast
  // "gemini-2.0-exp",   // slower but often higher quality
];

const REQUEST_TIMEOUT_MS = 20_000;
const BASE_KEY_COOLDOWN_MS = 45_000;
const MAX_RETRIES = 5;
const MAX_IN_FLIGHT_PER_KEY = 6;   // curb 429 storms
const ENABLE_HEDGING = true;

const MAX_OUTPUT_TOKENS = 2500;
const TEMPERATURE = 0.9;  // slightly steadier across models
const TOP_P = 0.92;
const TOP_K = 60;

// Per-model timeouts (ms)
const TIMEOUT_BY_MODEL: Record<ModelName, number> = {
  "gemini-2.5-flash": 20_000,
  "gemini-2.0-flash": 22_000,
  "gemini-2.0-exp":   26_000,
};

/** ───────────────────────────────────────────────────────────────────
 *  KEY SELECTION STRATEGY
 *  ─────────────────────────────────────────────────────────────────── */
type KeySelectionMode = "round_robin" | "random" | "random_weighted";
const KEY_SELECTION_MODE: KeySelectionMode = "random_weighted"; // switchable
const PER_REQUEST_DISTINCT_KEYS = true; // ensure hedged attempts avoid same key

/** ───────────────────────────────────────────────────────────────────
 *  INTERNAL STATE
 *  ─────────────────────────────────────────────────────────────────── */
let rrIndex = Math.floor(Math.random() * GEMINI_API_KEYS.length);
const keyState = new Map<string, {
  cooldownUntil: number;
  inFlight: number;
  penaltyMs: number;
}>();
for (const k of GEMINI_API_KEYS) keyState.set(k, { cooldownUntil: 0, inFlight: 0, penaltyMs: 0 });

let globalPenaltyMs = 0;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const now = () => Date.now();

function nextUsableKey(exclude?: Set<string> | null): string | null {
  const t = now();

  // gather usable candidates
  const candidates = GEMINI_API_KEYS.filter(k => {
    if (exclude?.has(k)) return false;
    const st = keyState.get(k)!;
    return st.cooldownUntil <= t && st.inFlight < MAX_IN_FLIGHT_PER_KEY;
  });

  if (candidates.length === 0) return null;

  if (KEY_SELECTION_MODE === "random") {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  if (KEY_SELECTION_MODE === "random_weighted") {
    // Weight by available capacity & inverse of penalty
    const weights = candidates.map(k => {
      const st = keyState.get(k)!;
      const capacity = Math.max(1, MAX_IN_FLIGHT_PER_KEY - st.inFlight); // 1..N
      const penalty = 1 + st.penaltyMs / 1000;                           // >=1
      return capacity / penalty; // higher is better
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < candidates.length; i++) {
      r -= weights[i];
      if (r <= 0) return candidates[i];
    }
    return candidates[candidates.length - 1];
  }

  // fallback: round-robin start point randomized via rrIndex
  const n = GEMINI_API_KEYS.length;
  const start = (rrIndex++ % n + n) % n;
  for (let i = 0; i < n; i++) {
    const k = GEMINI_API_KEYS[(start + i) % n];
    if (exclude?.has(k)) continue;
    const st = keyState.get(k)!;
    if (st.cooldownUntil <= t && st.inFlight < MAX_IN_FLIGHT_PER_KEY) return k;
  }
  return null;
}

function acquireKey(key: string) {
  keyState.get(key)!.inFlight++;
}
function releaseKey(key: string) {
  const st = keyState.get(key)!;
  st.inFlight = Math.max(0, st.inFlight - 1);
}
function markCooldown(key: string, retryAfterMs: number | null) {
  const st = keyState.get(key)!;
  const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + st.penaltyMs;
  st.cooldownUntil = Math.max(st.cooldownUntil, now() + extra);
  st.penaltyMs = Math.min((st.penaltyMs || 0) * 1.8 + 800, 200_000);
  globalPenaltyMs = Math.min(globalPenaltyMs * 1.5 + 300, 6_000);
}
function decayPenalties() {
  for (const st of keyState.values()) st.penaltyMs = Math.max(0, st.penaltyMs - 600);
  globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
}

/** ───────────────────────────────────────────────────────────────────
 *  UTILS
 *  ─────────────────────────────────────────────────────────────────── */
function normaliseTitle(t: string | undefined, fb: string) {
  const s = (t || "").trim().replace(/\s+/g, " ");
  return s && s.length <= 70 ? s : (s || fb).slice(0, 70).replace(/\s+\S*$/, "").trim();
}
function parseJsonStrict(s: string): any | null {
  if (!s) return null;
  const clean = s.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const i = clean.indexOf("{"), j = clean.lastIndexOf("}");
  if (i >= 0 && j > i) { try { return JSON.parse(clean.slice(i, j + 1)); } catch {} }
  return null;
}

async function fetchJsonWithTimeout(
  url: string,
  body: any,
  timeoutMs: number,
  externalSignal?: AbortSignal
) {
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  if (externalSignal) externalSignal.addEventListener("abort", onAbort, { once: true });

  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, headers: res.headers, json };
  } finally {
    clearTimeout(t);
    if (externalSignal) externalSignal.removeEventListener("abort", onAbort);
  }
}

function buildPayload(prompt: string) {
  return {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: TEMPERATURE,
      topP: TOP_P,
      topK: TOP_K,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  };
}

function parseRetryAfterMs(h: Headers): number | null {
  const ra = h.get("retry-after");
  if (!ra) return null;
  const sec = Number(ra);
  if (!Number.isNaN(sec) && sec >= 0) return Math.max(0, Math.floor(sec * 1000));
  const t = Date.parse(ra);
  if (!Number.isNaN(t)) return Math.max(0, t - now());
  return null;
}

/** ───────────────────────────────────────────────────────────────────
 *  SINGLE CALL (one model, one key) — supports external abort
 *  ─────────────────────────────────────────────────────────────────── */
async function tryREST(model: ModelName, key: string, prompt: string, signal?: AbortSignal) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  acquireKey(key);
  try {
    const st = keyState.get(key)!;
    const waitMs = Math.max(0, st.penaltyMs, globalPenaltyMs, st.cooldownUntil - now());
    if (waitMs > 0) await sleep(Math.min(waitMs, 3000));

    const timeout = TIMEOUT_BY_MODEL[model] ?? REQUEST_TIMEOUT_MS;
    const { status, headers, json } = await fetchJsonWithTimeout(url, buildPayload(prompt), timeout, signal);

    if (status === 429 || json?.error?.code === 429) {
      const retryMs = parseRetryAfterMs(headers);
      markCooldown(key, retryMs);
      const err: any = new Error("Rate limited");
      err.code = 429;
      err.retryAfterMs = retryMs ?? BASE_KEY_COOLDOWN_MS;
      throw err;
    }
    if (status >= 500) throw new Error(`Gemini server error ${status}`);
    if (json?.error) throw new Error(json.error.message || "Gemini error");

    const text =
      json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ??
      json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const obj = parseJsonStrict(String(text || "").trim());
    if (!obj || !obj.html) throw new Error("Non-JSON or missing html");

    decayPenalties();
    return obj as { title?: string; html: string };
  } finally {
    releaseKey(key);
  }
}

/** ───────────────────────────────────────────────────────────────────
 *  ATTEMPT-ONCE (no hedging): pick a usable key and call model
 *  ─────────────────────────────────────────────────────────────────── */
async function attemptOnce(model: ModelName, prompt: string) {
  let key = nextUsableKey(null);
  if (!key) {
    const soonest = Array.from(keyState.entries()).reduce((a, b) =>
      a[1].cooldownUntil <= b[1].cooldownUntil ? a : b
    );
    const wait = Math.max(0, soonest[1].cooldownUntil - now(), 150);
    await sleep(wait);
    key = nextUsableKey(null) || GEMINI_API_KEYS[0];
  }
  return tryREST(model, key, prompt);
}

/** ───────────────────────────────────────────────────────────────────
 *  QUALITY GATE for cancel-on-qualified-win
 *  ─────────────────────────────────────────────────────────────────── */
function isQualified(obj: any): boolean {
  if (!obj || typeof obj.html !== "string") return false;
  const html = obj.html;
  const h1s = (html.match(/<h1>/gi) || []).length;
  if (h1s < 2) return false;
  const wc = html
    .replace(/\[ANCHOR:[^\]]+\]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/).filter(Boolean).length;
  return wc >= 120; // adjust if needed
}

/** ───────────────────────────────────────────────────────────────────
 *  HEDGED ATTEMPT (3 models, tiny staggers, cancel losers)
 *  - Uses distinct keys per branch when possible
 *  - If nothing qualifies, returns the best valid JSON we got
 *  ─────────────────────────────────────────────────────────────────── */
async function hedgedAttempt(prompt: string): Promise<{ title?: string; html: string }> {
  const controllers = MODEL_POOL.map(() => new AbortController());
  const staggers = [0, 120, 240]; // ms
  const usedKeys = PER_REQUEST_DISTINCT_KEYS ? new Set<string>() : null;

  return new Promise((resolve, reject) => {
    let remaining = MODEL_POOL.length;
    const errors: any[] = [];
    let resolved = false;
    let lastGood: { title?: string; html: string } | null = null;

    MODEL_POOL.forEach((model, i) => {
      const start = async () => {
        // pick a key with exclusion awareness
        let key = nextUsableKey(usedKeys);
        if (!key) {
          const soonest = Array.from(keyState.entries()).reduce((a, b) =>
            a[1].cooldownUntil <= b[1].cooldownUntil ? a : b
          );
          const wait = Math.max(0, soonest[1].cooldownUntil - now(), 150);
          await sleep(wait);
          key = nextUsableKey(usedKeys) || nextUsableKey(null) || GEMINI_API_KEYS[0];
        }
        if (usedKeys) usedKeys.add(key);

        try {
          const obj = await tryREST(model, key!, prompt, controllers[i].signal);
          // record last good (valid JSON) even if not qualified
          if (obj?.html) lastGood = obj;

          if (!resolved && isQualified(obj)) {
            resolved = true;
            controllers.forEach((c, j) => { if (j !== i) c.abort(); });
            resolve(obj);
          } else {
            errors[i] = new Error("Unqualified result");
          }
        } catch (e) {
          errors[i] = e;
        } finally {
          remaining -= 1;
          if (!resolved && remaining === 0) {
            if (lastGood) {
              // fallback to the best valid JSON we saw
              resolved = true;
              resolve(lastGood);
              return;
            }
            const err = new Error(
              "All hedged attempts failed or were unqualified: " +
              errors.map((e, idx) => `${MODEL_POOL[idx]}: ${e?.message || e}`).join(" | ")
            );
            reject(err);
          }
        }
      };

      setTimeout(start, staggers[i]);
    });
  });
}

/** ───────────────────────────────────────────────────────────────────
 *  PUBLIC: Single-source API (returns { title, html })
 *  ─────────────────────────────────────────────────────────────────── */
export async function generateJSONTitleHtml({
  keywords,
  instructions,
}: {
  keywords: string | string[];
  instructions: string;
}): Promise<{ title: string; html: string }> {
  const kwArr = Array.isArray(keywords) ? keywords.filter(Boolean) : [keywords].filter(Boolean);
  if (!kwArr.length) throw new Error("No keywords provided");
  if (!instructions?.trim()) throw new Error("No instructions provided to LLM.");

  let lastErr: any = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (globalPenaltyMs > 0) await sleep(Math.min(globalPenaltyMs, 1_000));

      const obj = ENABLE_HEDGING
        ? await hedgedAttempt(instructions)
        : await attemptOnce(MODEL_POOL[Math.min(attempt, MODEL_POOL.length - 1)], instructions);

      const title = normaliseTitle(obj.title ?? kwArr[0], kwArr[0]);
      const html = String(obj.html || "");
      if (!html) throw new Error("Empty html");
      return { title, html };
    } catch (e: any) {
      lastErr = e;
      if (e?.code === 429) {
        const wait = Math.min(Math.max(500, e.retryAfterMs ?? BASE_KEY_COOLDOWN_MS), 60_000);
        await sleep(wait + Math.floor(Math.random() * 300));
      } else {
        const wait = Math.min(1500 * (attempt + 1) + Math.random() * 400, 4500);
        await sleep(wait);
      }
    }
  }

  console.warn("[LLM] Falling back after retries:", lastErr?.message || lastErr);
  return {
    title: normaliseTitle(`${kwArr[0] || "Untitled"} — practical notes`, kwArr[0] || "Untitled"),
    html: `<h1>Why This Matters</h1><p>${kwArr.map(k => `[ANCHOR:${k}]`).join(" ")} — draft.</p>`,
  };
}

/** ───────────────────────────────────────────────────────────────────
 *  HTML utility for anchor replacement
 *  ─────────────────────────────────────────────────────────────────── */
export function applyAnchorTokens(html: string, anchors: Array<{ keyword: string; url?: string }>) {
  let out = html || "";
  for (const { keyword, url } of anchors) {
    const token = `[ANCHOR:${keyword}]`;
    const rep = url
      ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
      : `<strong>${keyword}</strong>`;
    out = out.replace(token, rep);
  }
  return out;
}
