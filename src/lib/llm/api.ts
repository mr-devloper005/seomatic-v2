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
//   // (Optional) Remove this log if you don't want the full prompt in console:
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

// function nextUsableKey(exclude?: Set<string> | null): string | null {
//   const t = now();

//   // gather usable candidates
//   const candidates = GEMINI_API_KEYS.filter(k => {
//     if (exclude?.has(k)) return false;
//     const st = keyState.get(k)!;
//     return st.cooldownUntil <= t && st.inFlight < MAX_IN_FLIGHT_PER_KEY;
//   });

//   if (candidates.length === 0) return null;

//   if (KEY_SELECTION_MODE === "random") {
//     return candidates[Math.floor(Math.random() * candidates.length)];
//   }

//   if (KEY_SELECTION_MODE === "random_weighted") {
//     // Weight by available capacity & inverse of penalty
//     const weights = candidates.map(k => {
//       const st = keyState.get(k)!;
//       const capacity = Math.max(1, MAX_IN_FLIGHT_PER_KEY - st.inFlight); // 1..N
//       const penalty = 1 + st.penaltyMs / 1000;                           // >=1
//       return capacity / penalty; // higher is better
//     });
//     const total = weights.reduce((a, b) => a + b, 0);
//     let r = Math.random() * total;
//     for (let i = 0; i < candidates.length; i++) {
//       r -= weights[i];
//       if (r <= 0) return candidates[i];
//     }
//     return candidates[candidates.length - 1];
//   }

//   // fallback: round-robin start point randomized via rrIndex
//   const n = GEMINI_API_KEYS.length;
//   const start = (rrIndex++ % n + n) % n;
//   for (let i = 0; i < n; i++) {
//     const k = GEMINI_API_KEYS[(start + i) % n];
//     if (exclude?.has(k)) continue;
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
// function normaliseTitle(t: string | undefined, fb: string) {
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
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
//     const timeout = TIMEOUT_BY_MODEL[model] ?? REQUEST_TIMEOUT_MS;
//   const { status, headers, json } = await fetchJsonWithTimeout(
//     url,
//     buildPayload(prompt),
//     timeout,
//     signal
//   );

//   if (status >= 200 && status < 300) {
//     const text = extractTextFromResponse(json);
//     return { text, raw: json };
//   }

//   const error: any = new Error(json?.error?.message || `Gemini REST error ${status}`);
//   error.code = status;
//   error.retryAfterMs = parseRetryAfterMs(headers);
//   error.raw = json;
//   throw error;
// }

// /** ───────────────────────────────────────────────────────────────────
//  *  ATTEMPT-ONCE (no hedging): pick a usable key and call model
//  *  ─────────────────────────────────────────────────────────────────── */
// async function attemptOnce(model: ModelName, prompt: string) {
//   let key = nextUsableKey(null);
//   if (!key) {
//     const soonest = Array.from(keyState.entries()).reduce((a, b) =>
//       a[1].cooldownUntil <= b[1].cooldownUntil ? a : b
//     );
//     const wait = Math.max(0, soonest[1].cooldownUntil - now(), 150);
//     await sleep(wait);
//     key = nextUsableKey(null) || GEMINI_API_KEYS[0];
//   }
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
//   const usedKeys = PER_REQUEST_DISTINCT_KEYS ? new Set<string>() : null;

//   return new Promise((resolve, reject) => {
//     let remaining = MODEL_POOL.length;
//     const errors: any[] = [];
//     let resolved = false;
//     let lastGood: { title?: string; html: string } | null = null;

//     MODEL_POOL.forEach((model, i) => {
//       const start = async () => {
//         // pick a key with exclusion awareness
//         let key = nextUsableKey(usedKeys);
//         if (!key) {
//           const soonest = Array.from(keyState.entries()).reduce((a, b) =>
//             a[1].cooldownUntil <= b[1].cooldownUntil ? a : b
//           );
//           const wait = Math.max(0, soonest[1].cooldownUntil - now(), 150);
//           await sleep(wait);
//           key = nextUsableKey(usedKeys) || nextUsableKey(null) || GEMINI_API_KEYS[0];
//         }
//         if (usedKeys) usedKeys.add(key);

//         try {
//           const obj = await tryREST(model, key!, prompt, controllers[i].signal);
//           // record last good (valid JSON) even if not qualified
//           if (obj?.html) lastGood = obj;

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
//             if (lastGood) {
//               // fallback to the best valid JSON we saw
//               resolved = true;
//               resolve(lastGood);
//               return;
//             }
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
//         // Respect Retry-After if provided earlier; otherwise default base cooldown.
//         const wait = Math.min(Math.max(500, e.retryAfterMs ?? BASE_KEY_COOLDOWN_MS), 60_000);
//         await sleep(wait + Math.floor(Math.random() * 300));
//       } else if (e?.code === 503) {
//         // Shorter wait on 503; model-level cooldown already applied
//         await sleep(1200 + Math.floor(Math.random() * 400));
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






// /** ───────────────────────────────────────────────────────────────────
//  *  SPEED + QUALITY (Hedged across 3 approved models)
//  *  Models: gemini-2.5-flash, gemini-2.0-flash, gemini-2.0-exp
//  *  - Cancel-on-qualified-win (tiny staggers)
//  *  - Per-key cooldowns and global penalties
//  *  - Per-model cooldowns (for 5xx/503 storms)
//  *  - JSON-only contract: { title?, html }  (with optional responseMimeType hint)
//  *  - Randomized / weighted-random key selection per request
//  *  - Distinct keys per hedged branch (avoids hammering one key)
//  *  ─────────────────────────────────────────────────────────────────── */

// const ENV_KEYS = (import.meta.env.VITE_GEMINI_API_KEYS as string | undefined)
//   ?.split(",")
//   .map((key) => key.trim())
//   .filter(Boolean);

// const GEMINI_API_KEYS: string[] = ENV_KEYS?.length
//   ? ENV_KEYS
//   : [
//       "AIzaSyAiuEsxN0T5okxCpWE4mTQ5eReyX5512uA",
//       "AIzaSyDJzsTMXS53918qwV6Y3RBOXbJ9uPQ6NUY",
//       "AIzaSyALWTZHYpIEb5INMnICR0VzEEV8Nhv0SVA",
//       "AIzaSyCsYwyhhDMs8v90Mfbb_BosautLkf61urQ",
//       "AIzaSyBY_vj98oCUP72rgPAIIE3OdiaEVbYSXAY",
//       "AIzaSyAUEqlBExrhs9hvnGkpF_5t7J-Jkli19b8",
//       "AIzaSyAvcKxsTin_o1gtKflkLlU50-xdnEphkuk",
//       "AIzaSyBafUHccMUZ0V1FF1mN23RP2qeNqXIEvYg",
//       "AIzaSyB-wHr42L5f3tWr9bGA6vaK2diy_AVYPU4",
// "AIzaSyA58HmYWxGlRLcg8SPXQOreLUuWpaVQVRk",
//       "AIzaSyDMLKj8FWf0O3bbp33LV8bYXKsLbCCkky0",
//       "AIzaSyBEf6ycxvycOyPfVRBikYoIFLv_liuprlU",
//       "AIzaSyBCf6NEWEPJh1o_IvRScxMw-MMwCHmUCKQ",
//       "AIzaSyAmD2KhxCUVg3HrSZ-bfkGW6tRLTiSVQso",
//       "AIzaSyBJO7HKv5ItDVJU4X-D3Ie9k_rj3Bh2AiA",
//       "AIzaSyC7_u03_UyEQCwxJQnQa5Ns0WjH0K72RtQ",
//       "AIzaSyCl00SzUYIrOwfQpOyAnairqPrTXBAMBR4",
//       "AIzaSyBMy6qGhOO52OhCNctqTO_b5ioskAuM_xA",
//       "AIzaSyCwmIFaDMH1Snsjrukidb1RyuH0ghbDBhg"
//     ];

// if (!GEMINI_API_KEYS.length) {
//   throw new Error("❌ No Gemini API keys configured. Set VITE_GEMINI_API_KEYS or update src/lib/llm/api.ts");
// }

// export type ModelName = "gemini-2.5-flash" | "gemini-2.0-flash";

// const MODEL_POOL: ModelName[] = ["gemini-2.5-flash", "gemini-2.0-flash"];
// const DEFAULT_STAGGERS_MS = [0, 140, 280] as const;
// const KEY_SELECTION_MODE: "round_robin" | "random" | "random_weighted" = "random_weighted";
// const PER_REQUEST_DISTINCT_KEYS = true;

// const REQUEST_TIMEOUT_MS = 22_000;
// const MAX_RETRIES = 5;
// const MAX_OUTPUT_TOKENS = 2_500;
// const TEMPERATURE = 0.9;
// const TOP_P = 0.92;
// const TOP_K = 60;
// const BASE_KEY_COOLDOWN_MS = 45_000;
// const MAX_IN_FLIGHT_PER_KEY = 4;
// const FORCE_JSON_MIMETYPE = true;

// const TIMEOUT_BY_MODEL: Record<ModelName, number> = {
//   "gemini-2.5-flash": 22_000,
//   "gemini-2.0-flash": 24_000,
// };

// let rrIndex = Math.floor(Math.random() * GEMINI_API_KEYS.length);
// const keyState = new Map<string, { cooldownUntil: number; inFlight: number; penaltyMs: number }>();
// for (const key of GEMINI_API_KEYS) {
//   keyState.set(key, { cooldownUntil: 0, inFlight: 0, penaltyMs: 0 });
// }

// let globalPenaltyMs = 0;
// let globalInFlight = 0;
// const globalWaiters: Array<() => void> = [];

// const modelCooldownUntil = new Map<ModelName, number>(MODEL_POOL.map((model) => [model, 0]));

// type HardCode = 429 | 503 | 500;
// const hardEvents: Array<{ t: number; code: HardCode }> = [];

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// const now = () => Date.now();

// function isAbortError(error: unknown): boolean {
//   return error instanceof DOMException && error.name === "AbortError";
// }

// function recordHard(code: HardCode) {
//   hardEvents.push({ t: now(), code });
//   if (hardEvents.length > 60) hardEvents.shift();
// }

// function isUnstable(): boolean {
//   const cutoff = now() - 20_000;
//   return hardEvents.filter((evt) => evt.t >= cutoff).length >= 6;
// }

// async function acquireGlobal() {
//   if (globalInFlight < GEMINI_API_KEYS.length * MAX_IN_FLIGHT_PER_KEY) {
//     globalInFlight++;
//     return;
//   }

//   await new Promise<void>((resolve) => globalWaiters.push(() => {
//     globalInFlight++;
//     resolve();
//   }));
// }

// function releaseGlobal() {
//   globalInFlight = Math.max(0, globalInFlight - 1);
//   const next = globalWaiters.shift();
//   if (next) next();
// }

// function nextUsableKey(exclude?: Set<string>): string | null {
//   const t = now();
//   const candidates = GEMINI_API_KEYS.filter((key) => {
//     if (exclude?.has(key)) return false;
//     const state = keyState.get(key)!;
//     return state.cooldownUntil <= t && state.inFlight < MAX_IN_FLIGHT_PER_KEY;
//   });

//   if (!candidates.length) return null;

//   if (KEY_SELECTION_MODE === "random") {
//     return candidates[Math.floor(Math.random() * candidates.length)];
//   }

//   if (KEY_SELECTION_MODE === "random_weighted") {
//     const weights = candidates.map((key) => {
//       const state = keyState.get(key)!;
//       const capacity = Math.max(1, MAX_IN_FLIGHT_PER_KEY - state.inFlight);
//       const penalty = 1 + state.penaltyMs / 1_000;
//       return capacity / penalty;
//     });
//     const total = weights.reduce((a, b) => a + b, 0);
//     let r = Math.random() * total;
//     for (let i = 0; i < candidates.length; i++) {
//       r -= weights[i];
//       if (r <= 0) return candidates[i];
//     }
//     return candidates[candidates.length - 1];
//   }

//   const n = GEMINI_API_KEYS.length;
//   const start = (rrIndex++ % n + n) % n;
//   for (let i = 0; i < n; i++) {
//     const key = GEMINI_API_KEYS[(start + i) % n];
//     if (exclude?.has(key)) continue;
//     const state = keyState.get(key)!;
//     if (state.cooldownUntil <= t && state.inFlight < MAX_IN_FLIGHT_PER_KEY) return key;
//   }
//   return null;
// }

// function acquireKey(key: string) {
//   keyState.get(key)!.inFlight++;
// }

// function releaseKey(key: string) {
//   const state = keyState.get(key)!;
//   state.inFlight = Math.max(0, state.inFlight - 1);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const state = keyState.get(key)!;
//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + state.penaltyMs;
//   state.cooldownUntil = Math.max(state.cooldownUntil, now() + extra);
//   state.penaltyMs = Math.min(state.penaltyMs * 1.5 + 800, 180_000);
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.4 + 300, 8_000);
// }

// function markModelCooldown(model: ModelName, ms: number) {
//   const until = Math.max(modelCooldownUntil.get(model) ?? 0, now() + ms);
//   modelCooldownUntil.set(model, until);
// }

// function decayPenalties() {
//   for (const state of keyState.values()) {
//     state.penaltyMs = Math.max(0, state.penaltyMs - 600);
//   }
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// function parseJsonStrict(payload: string): any | null {
//   if (!payload) return null;
//   const clean = payload.replace(/```json|```/g, "").trim();
//   try {
//     return JSON.parse(clean);
//   } catch {}
//   const first = clean.indexOf("{");
//   const last = clean.lastIndexOf("}");
//   if (first >= 0 && last > first) {
//     try {
//       return JSON.parse(clean.slice(first, last + 1));
//     } catch {}
//   }
//   return null;
// }

// function parseRetryAfterMs(headers: Headers): number | null {
//   const value = headers.get("retry-after");
//   if (!value) return null;
//   const asSeconds = Number(value);
//   if (!Number.isNaN(asSeconds) && asSeconds >= 0) {
//     return Math.max(0, Math.floor(asSeconds * 1_000));
//   }
//   const asDate = Date.parse(value);
//   if (!Number.isNaN(asDate)) {
//     return Math.max(0, asDate - now());
//   }
//   return null;
// }

// async function fetchJsonWithTimeout(
//   url: string,
//   body: unknown,
//   timeoutMs: number,
//   externalSignal?: AbortSignal
// ) {
//   const controller = new AbortController();
//   const forwardAbort = () => controller.abort();
//   if (externalSignal) externalSignal.addEventListener("abort", forwardAbort, { once: true });

//   const timer = setTimeout(() => controller.abort(), timeoutMs);
//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       signal: controller.signal,
//       headers: { "Content-Type": "application/json; charset=UTF-8" },
//       body: JSON.stringify(body),
//     });
//     const json = await response.json().catch(() => ({}));
//     return { status: response.status, headers: response.headers, json };
//   } finally {
//     clearTimeout(timer);
//     if (externalSignal) externalSignal.removeEventListener("abort", forwardAbort);
//   }
// }

// function buildPayload(prompt: string) {
//   const generationConfig: Record<string, unknown> = {
//     temperature: TEMPERATURE,
//     topP: TOP_P,
//     topK: TOP_K,
//     maxOutputTokens: MAX_OUTPUT_TOKENS,
//   };
//   if (FORCE_JSON_MIMETYPE) {
//     generationConfig.responseMimeType = "application/json";
//   }
//   return {
//     contents: [{ role: "user", parts: [{ text: prompt }] }],
//     generationConfig,
//   };
// }

// function extractTextFromResponse(payload: any): string {
//   if (!payload) return "";
//   const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
//   if (candidates.length) {
//     const parts = candidates[0]?.content?.parts ?? [];
//     const merged = parts
//       .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
//       .filter(Boolean)
//       .join("\n")
//       .trim();
//     if (merged) return merged;
//     if (typeof candidates[0]?.output_text === "string") return candidates[0].output_text;
//   }
//   if (typeof payload?.output_text === "string") return payload.output_text;
//   if (typeof payload?.text === "string") return payload.text;
//   return "";
// }

// interface AttemptSuccess {
//   model: ModelName;
//   key: string;
//   text: string;
//   raw: unknown;
// }

// async function tryREST(model: ModelName, key: string, prompt: string, signal?: AbortSignal) {
//   const cooldownUntil = modelCooldownUntil.get(model) ?? 0;
//   if (cooldownUntil > now()) {
//     await sleep(Math.min(cooldownUntil - now(), 1_500));
//   }

//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
//   const timeout = TIMEOUT_BY_MODEL[model] ?? REQUEST_TIMEOUT_MS;
//   const { status, headers, json } = await fetchJsonWithTimeout(url, buildPayload(prompt), timeout, signal);

//   if (status >= 200 && status < 300) {
//     return { text: extractTextFromResponse(json), raw: json };
//   }

//   const error: any = new Error(json?.error?.message || `Gemini REST error ${status}`);
//   error.code = status;
//   error.retryAfterMs = parseRetryAfterMs(headers);
//   error.raw = json;
//   throw error;
// }

// async function attemptOnce(model: ModelName, prompt: string, externalSignal?: AbortSignal): Promise<AttemptSuccess> {
//   await acquireGlobal();

//   try {
//     const usedKeys = new Set<string>();
//     let lastError: any = null;
//     const maxAttempts = Math.max(GEMINI_API_KEYS.length * 2, 4);

//     for (let attempt = 0; attempt < maxAttempts; attempt++) {
//       const key = nextUsableKey(PER_REQUEST_DISTINCT_KEYS ? usedKeys : undefined);
//       if (!key) {
//         await sleep(120 + Math.random() * 240);
//         continue;
//       }

//       if (PER_REQUEST_DISTINCT_KEYS) usedKeys.add(key);
//       acquireKey(key);

//       try {
//         const { text, raw } = await tryREST(model, key, prompt, externalSignal);
//         if (!text.trim()) throw Object.assign(new Error("Empty LLM response"), { code: 204 });
//         decayPenalties();
//         return { model, key, text, raw };
//       } catch (error: any) {
//         lastError = error;
//         if (isAbortError(error)) throw error;

//         const code = Number(error?.code) as HardCode | number;
//         if (code === 429 || code === 503) {
//           recordHard(code as HardCode);
//           markCooldown(key, error?.retryAfterMs ?? null);
//           if (code === 503) {
//             markModelCooldown(model, 3_500 + Math.random() * 1_500);
//           }
//         } else if (code === 500) {
//           recordHard(500);
//           markCooldown(key, BASE_KEY_COOLDOWN_MS);
//         }
//       } finally {
//         releaseKey(key);
//       }
//     }

//     throw lastError ?? new Error("All Gemini keys are throttled");
//   } finally {
//     releaseGlobal();
//   }
// }

// async function hedgedAttempt(prompt: string, externalSignal?: AbortSignal): Promise<AttemptSuccess> {
//   if (MODEL_POOL.length === 1) {
//     return attemptOnce(MODEL_POOL[0], prompt, externalSignal);
//   }

//   const abortController = new AbortController();
//   const forwardAbort = () => abortController.abort();
//   if (externalSignal) {
//     if (externalSignal.aborted) {
//       abortController.abort();
//     } else {
//       externalSignal.addEventListener("abort", forwardAbort, { once: true });
//     }
//   }

//   return new Promise<AttemptSuccess>((resolve, reject) => {
//     const errors: any[] = [];
//     let pending = MODEL_POOL.length;
//     let settled = false;

//     const finalize = () => {
//       if (externalSignal) externalSignal.removeEventListener("abort", forwardAbort);
//     };

//     MODEL_POOL.forEach((model, index) => {
//       const delay = DEFAULT_STAGGERS_MS[index] ?? DEFAULT_STAGGERS_MS[DEFAULT_STAGGERS_MS.length - 1] ?? 0;
//       (async () => {
//         try {
//           if (delay > 0) await sleep(delay);
//           if (settled) return;
//           const result = await attemptOnce(model, prompt, abortController.signal);
//           if (settled) return;
//           settled = true;
//           abortController.abort();
//           finalize();
//           resolve(result);
//         } catch (error) {
//           if (settled) return;
//           errors.push(error);
//           if (--pending === 0) {
//             settled = true;
//             abortController.abort();
//             finalize();
//             reject(errors[errors.length - 1] ?? error);
//           }
//         }
//       })();
//     });
//   });
// }

// function buildPrompt(keywords: string[], instructions: string): string {
//   const keywordList = keywords.map((kw, index) => `${index + 1}. ${kw}`).join("\n");
//   return [
//     "You are an expert SEO copywriter tasked with producing conversion-focused content.",
//     "Return ONLY valid JSON with the exact structure { \"title\": string, \"html\": string }.",
//     "Constraints:",
//     "- Title must be unique, enticing, <= 70 characters, and include at least one keyword.",
//     "- html must be semantic markup using headings, lists, paragraphs, and optional blockquotes.",
//     "- Include placeholder tokens [ANCHOR:keyword] in the html for each keyword listed below.",
//     "- Do not include markdown fences, explanations, or additional JSON properties.",
//     `Primary keywords:\n${keywordList}`,
//     "Detailed brief:",
//     instructions.trim(),
//   ].join("\n\n");
// }

// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
// }: {
//   keywords: string | string[];
//   instructions: string;
// }): Promise<{ title: string; html: string }> {
//   const keywordArray = Array.isArray(keywords)
//     ? keywords.filter((kw): kw is string => typeof kw === "string" && kw.trim().length > 0)
//     : [keywords].filter((kw): kw is string => typeof kw === "string" && kw.trim().length > 0);

//   if (!keywordArray.length) throw new Error("No keywords provided");
//   if (!instructions?.trim()) throw new Error("No instructions provided to LLM.");

//   const prompt = buildPrompt(keywordArray, instructions);
//   let lastError: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       if (globalPenaltyMs > 0) {
//         await sleep(Math.min(globalPenaltyMs, 1_500));
//       }

//       const result = await hedgedAttempt(prompt);
//       const parsed = parseJsonStrict(result.text);
//       if (!parsed || typeof parsed !== "object") {
//         throw new Error("LLM did not return JSON payload");
//       }

//       const rawTitle = typeof parsed.title === "string" ? parsed.title : keywordArray[0];
//       const title = (rawTitle || keywordArray[0]).trim().slice(0, 70);
//       const html = String(parsed.html ?? "").trim();
//       if (!html) throw new Error("LLM returned empty html");

//       return { title, html };
//     } catch (error) {
//       lastError = error;
//       if (isAbortError(error)) throw error;
//       const backoff = isUnstable() ? 1_200 : 600;
//       await sleep(backoff + Math.random() * 400 * (attempt + 1));
//     }
//   }

//   console.warn("[LLM] Falling back after retries:", lastError?.message || lastError);
//   const fallbackTitle = `${keywordArray[0] || "Untitled"} — draft`.slice(0, 70);
//   const fallbackHtml = `<h1>${fallbackTitle}</h1><p>${instructions.trim().slice(0, 220)}...</p>` +
//     `<ul>${keywordArray.map((kw) => `<li>[ANCHOR:${kw}]</li>`).join("")}</ul>`;

//   return { title: fallbackTitle, html: fallbackHtml };
// }

// export function applyAnchorTokens(
//   html: string,
//   anchors: Array<{ keyword: string; url?: string }>
// ) {
//   let output = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const replacement = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     output = output.replace(token, replacement);
//   }
//   return output;
// }




// /** ───────────────────────────────────────────────────────────────────
//  *  SPEED + QUALITY (Hedged across 2 approved models)
//  *  Models: gemini-2.5-flash, gemini-2.0-flash
//  *  - Cancel-on-qualified-win (tiny staggers)
//  *  - Per-key cooldowns and global penalties
//  *  - Per-model cooldowns (for 5xx/503 storms)
//  *  - JSON-only contract: { title, html }
//  *  - Randomized / weighted-random key selection
//  *  - Distinct keys per hedged branch
//  * ─────────────────────────────────────────────────────────────────── */

// const ENV_KEYS = (import.meta.env.VITE_GEMINI_API_KEYS as string | undefined)
//   ?.split(",")
//   .map((key) => key.trim())
//   .filter(Boolean);

// const GEMINI_API_KEYS: string[] = ENV_KEYS?.length
//   ? ENV_KEYS
//   : [
//       // ⛔ Replace with your own keys or use ENV. Don't commit real keys.
//       "AIzaSyAiuEsxN0T5okxCpWE4mTQ5eReyX5512uA",
//       "AIzaSyDJzsTMXS53918qwV6Y3RBOXbJ9uPQ6NUY",
//       "AIzaSyALWTZHYpIEb5INMnICR0VzEEV8Nhv0SVA",
//       "AIzaSyCsYwyhhDMs8v90Mfbb_BosautLkf61urQ",
//       "AIzaSyBY_vj98oCUP72rgPAIIE3OdiaEVbYSXAY",
//       "AIzaSyAUEqlBExrhs9hvnGkpF_5t7J-Jkli19b8",
//       "AIzaSyAvcKxsTin_o1gtKflkLlU50-xdnEphkuk",
//       "AIzaSyBafUHccMUZ0V1FF1mN23RP2qeNqXIEvYg",
//       "AIzaSyB-wHr42L5f3tWr9bGA6vaK2diy_AVYPU4",
// "AIzaSyA58HmYWxGlRLcg8SPXQOreLUuWpaVQVRk",
//       "AIzaSyDMLKj8FWf0O3bbp33LV8bYXKsLbCCkky0",
//       "AIzaSyBEf6ycxvycOyPfVRBikYoIFLv_liuprlU",
//       "AIzaSyBCf6NEWEPJh1o_IvRScxMw-MMwCHmUCKQ",
//       "AIzaSyAmD2KhxCUVg3HrSZ-bfkGW6tRLTiSVQso",
//       "AIzaSyBJO7HKv5ItDVJU4X-D3Ie9k_rj3Bh2AiA",
//       "AIzaSyC7_u03_UyEQCwxJQnQa5Ns0WjH0K72RtQ",
//       "AIzaSyCl00SzUYIrOwfQpOyAnairqPrTXBAMBR4",
//       "AIzaSyBMy6qGhOO52OhCNctqTO_b5ioskAuM_xA",
//       "AIzaSyCwmIFaDMH1Snsjrukidb1RyuH0ghbDBhg"
//     ];

// if (!GEMINI_API_KEYS.length) {
//   throw new Error(
//     "❌ No Gemini API keys configured. Set VITE_GEMINI_API_KEYS or update src/lib/llm/api.ts"
//   );
// }

// export type ModelName = "gemini-2.5-flash" | "gemini-2.0-flash";

// const MODEL_POOL: ModelName[] = ["gemini-2.5-flash", "gemini-2.0-flash"];
// const DEFAULT_STAGGERS_MS = [0, 140, 280] as const;
// const KEY_SELECTION_MODE: "round_robin" | "random" | "random_weighted" =
//   "random_weighted";
// const PER_REQUEST_DISTINCT_KEYS = true;

// const REQUEST_TIMEOUT_MS = 22_000;
// const MAX_RETRIES = 5;
// const MAX_OUTPUT_TOKENS = 2_500;
// const TEMPERATURE = 0.9;
// const TOP_P = 0.92;
// const TOP_K = 60;
// const BASE_KEY_COOLDOWN_MS = 45_000;
// const MAX_IN_FLIGHT_PER_KEY = 4;
// const FORCE_JSON_MIMETYPE = true;

// const TIMEOUT_BY_MODEL: Record<ModelName, number> = {
//   "gemini-2.5-flash": 22_000,
//   "gemini-2.0-flash": 24_000,
// };

// let rrIndex = Math.floor(Math.random() * GEMINI_API_KEYS.length);
// const keyState = new Map<
//   string,
//   { cooldownUntil: number; inFlight: number; penaltyMs: number }
// >();
// for (const key of GEMINI_API_KEYS) {
//   keyState.set(key, { cooldownUntil: 0, inFlight: 0, penaltyMs: 0 });
// }

// let globalPenaltyMs = 0;
// let globalInFlight = 0;
// const globalWaiters: Array<() => void> = [];

// const modelCooldownUntil = new Map<ModelName, number>(
//   MODEL_POOL.map((model) => [model, 0])
// );

// type HardCode = 429 | 503 | 500;
// const hardEvents: Array<{ t: number; code: HardCode }> = [];

// const sleep = (ms: number) =>
//   new Promise<void>((resolve) => setTimeout(resolve, ms));
// const now = () => Date.now();

// function isAbortError(error: unknown): boolean {
//   return error instanceof DOMException && error.name === "AbortError";
// }

// function recordHard(code: HardCode) {
//   hardEvents.push({ t: now(), code });
//   if (hardEvents.length > 60) hardEvents.shift();
// }

// function isUnstable(): boolean {
//   const cutoff = now() - 20_000;
//   return hardEvents.filter((evt) => evt.t >= cutoff).length >= 6;
// }

// async function acquireGlobal() {
//   if (globalInFlight < GEMINI_API_KEYS.length * MAX_IN_FLIGHT_PER_KEY) {
//     globalInFlight++;
//     return;
//   }

//   await new Promise<void>((resolve) =>
//     globalWaiters.push(() => {
//       globalInFlight++;
//       resolve();
//     })
//   );
// }

// function releaseGlobal() {
//   globalInFlight = Math.max(0, globalInFlight - 1);
//   const next = globalWaiters.shift();
//   if (next) next();
// }

// function nextUsableKey(exclude?: Set<string>): string | null {
//   const t = now();
//   const candidates = GEMINI_API_KEYS.filter((key) => {
//     if (exclude?.has(key)) return false;
//     const state = keyState.get(key)!;
//     return (
//       state.cooldownUntil <= t && state.inFlight < MAX_IN_FLIGHT_PER_KEY
//     );
//   });

//   if (!candidates.length) return null;

//   if (KEY_SELECTION_MODE === "random") {
//     return candidates[Math.floor(Math.random() * candidates.length)];
//   }

//   if (KEY_SELECTION_MODE === "random_weighted") {
//     const weights = candidates.map((key) => {
//       const state = keyState.get(key)!;
//       const capacity = Math.max(1, MAX_IN_FLIGHT_PER_KEY - state.inFlight);
//       const penalty = 1 + state.penaltyMs / 1_000;
//       return capacity / penalty;
//     });
//     const total = weights.reduce((a, b) => a + b, 0);
//     let r = Math.random() * total;
//     for (let i = 0; i < candidates.length; i++) {
//       r -= weights[i];
//       if (r <= 0) return candidates[i];
//     }
//     return candidates[candidates.length - 1];
//   }

//   const n = GEMINI_API_KEYS.length;
//   const start = ((rrIndex++ % n) + n) % n;
//   for (let i = 0; i < n; i++) {
//     const key = GEMINI_API_KEYS[(start + i) % n];
//     if (exclude?.has(key)) continue;
//     const state = keyState.get(key)!;
//     if (
//       state.cooldownUntil <= t &&
//       state.inFlight < MAX_IN_FLIGHT_PER_KEY
//     )
//       return key;
//   }
//   return null;
// }

// function acquireKey(key: string) {
//   keyState.get(key)!.inFlight++;
// }

// function releaseKey(key: string) {
//   const state = keyState.get(key)!;
//   state.inFlight = Math.max(0, state.inFlight - 1);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const state = keyState.get(key)!;
//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + state.penaltyMs;
//   state.cooldownUntil = Math.max(state.cooldownUntil, now() + extra);
//   state.penaltyMs = Math.min(state.penaltyMs * 1.5 + 800, 180_000);
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.4 + 300, 8_000);
// }

// function markModelCooldown(model: ModelName, ms: number) {
//   const until = Math.max(
//     modelCooldownUntil.get(model) ?? 0,
//     now() + ms
//   );
//   modelCooldownUntil.set(model, until);
// }

// function decayPenalties() {
//   for (const state of keyState.values()) {
//     state.penaltyMs = Math.max(0, state.penaltyMs - 600);
//   }
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// function parseJsonStrict(payload: string): any | null {
//   if (!payload) return null;
//   const clean = payload.replace(/```json|```/g, "").trim();
//   try {
//     return JSON.parse(clean);
//   } catch {}
//   const first = clean.indexOf("{");
//   const last = clean.lastIndexOf("}");
//   if (first >= 0 && last > first) {
//     try {
//       return JSON.parse(clean.slice(first, last + 1));
//     } catch {}
//   }
//   return null;
// }

// function parseRetryAfterMs(headers: Headers): number | null {
//   const value = headers.get("retry-after");
//   if (!value) return null;
//   const asSeconds = Number(value);
//   if (!Number.isNaN(asSeconds) && asSeconds >= 0) {
//     return Math.max(0, Math.floor(asSeconds * 1_000));
//   }
//   const asDate = Date.parse(value);
//   if (!Number.isNaN(asDate)) {
//     return Math.max(0, asDate - now());
//   }
//   return null;
// }

// async function fetchJsonWithTimeout(
//   url: string,
//   body: unknown,
//   timeoutMs: number,
//   externalSignal?: AbortSignal
// ) {
//   const controller = new AbortController();
//   const forwardAbort = () => controller.abort();
//   if (externalSignal)
//     externalSignal.addEventListener("abort", forwardAbort, {
//       once: true,
//     });

//   const timer = setTimeout(() => controller.abort(), timeoutMs);
//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       signal: controller.signal,
//       headers: { "Content-Type": "application/json; charset=UTF-8" },
//       body: JSON.stringify(body),
//     });
//     const json = await response.json().catch(() => ({}));
//     return { status: response.status, headers: response.headers, json };
//   } finally {
//     clearTimeout(timer);
//     if (externalSignal)
//       externalSignal.removeEventListener("abort", forwardAbort);
//   }
// }

// function buildPayload(prompt: string) {
//   const generationConfig: Record<string, unknown> = {
//     temperature: TEMPERATURE,
//     topP: TOP_P,
//     topK: TOP_K,
//     maxOutputTokens: MAX_OUTPUT_TOKENS,
//   };
//   if (FORCE_JSON_MIMETYPE) {
//     generationConfig.responseMimeType = "application/json";
//   }
//   return {
//     contents: [{ role: "user", parts: [{ text: prompt }] }],
//     generationConfig,
//   };
// }

// function extractTextFromResponse(payload: any): string {
//   if (!payload) return "";
//   const candidates = Array.isArray(payload?.candidates)
//     ? payload.candidates
//     : [];
//   if (candidates.length) {
//     const parts = candidates[0]?.content?.parts ?? [];
//     const merged = parts
//       .map((part: any) =>
//         typeof part?.text === "string" ? part.text : ""
//       )
//       .filter(Boolean)
//       .join("\n")
//       .trim();
//     if (merged) return merged;
//     if (typeof candidates[0]?.output_text === "string")
//       return candidates[0].output_text;
//   }
//   if (typeof payload?.output_text === "string")
//     return payload.output_text;
//   if (typeof payload?.text === "string") return payload.text;
//   return "";
// }

// interface AttemptSuccess {
//   model: ModelName;
//   key: string;
//   text: string;
//   raw: unknown;
// }

// async function tryREST(
//   model: ModelName,
//   key: string,
//   prompt: string,
//   signal?: AbortSignal
// ) {
//   const cooldownUntil = modelCooldownUntil.get(model) ?? 0;
//   if (cooldownUntil > now()) {
//     await sleep(Math.min(cooldownUntil - now(), 1_500));
//   }

//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
//   const timeout = TIMEOUT_BY_MODEL[model] ?? REQUEST_TIMEOUT_MS;
//   const { status, headers, json } = await fetchJsonWithTimeout(
//     url,
//     buildPayload(prompt),
//     timeout,
//     signal
//   );

//   if (status >= 200 && status < 300) {
//     return { text: extractTextFromResponse(json), raw: json };
//   }

//   const error: any = new Error(
//     json?.error?.message || `Gemini REST error ${status}`
//   );
//   error.code = status;
//   error.retryAfterMs = parseRetryAfterMs(headers);
//   error.raw = json;
//   throw error;
// }

// async function attemptOnce(
//   model: ModelName,
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   await acquireGlobal();

//   try {
//     const usedKeys = new Set<string>();
//     let lastError: any = null;
//     const maxAttempts = Math.max(GEMINI_API_KEYS.length * 2, 4);

//     for (let attempt = 0; attempt < maxAttempts; attempt++) {
//       const key = nextUsableKey(
//         PER_REQUEST_DISTINCT_KEYS ? usedKeys : undefined
//       );
//       if (!key) {
//         await sleep(120 + Math.random() * 240);
//         continue;
//       }

//       if (PER_REQUEST_DISTINCT_KEYS) usedKeys.add(key);
//       acquireKey(key);

//       try {
//         const { text, raw } = await tryREST(
//           model,
//           key,
//           prompt,
//           externalSignal
//         );
//         if (!text.trim())
//           throw Object.assign(new Error("Empty LLM response"), {
//             code: 204,
//           });
//         decayPenalties();
//         return { model, key, text, raw };
//       } catch (error: any) {
//         lastError = error;
//         if (isAbortError(error)) throw error;

//         const code = Number(error?.code) as HardCode | number;
//         if (code === 429 || code === 503) {
//           recordHard(code as HardCode);
//           markCooldown(key, error?.retryAfterMs ?? null);
//           if (code === 503) {
//             markModelCooldown(
//               model,
//               3_500 + Math.random() * 1_500
//             );
//           }
//         } else if (code === 500) {
//           recordHard(500);
//           markCooldown(key, BASE_KEY_COOLDOWN_MS);
//         }
//       } finally {
//         releaseKey(key);
//       }
//     }

//     throw lastError ?? new Error("All Gemini keys are throttled");
//   } finally {
//     releaseGlobal();
//   }
// }

// async function hedgedAttempt(
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   if (MODEL_POOL.length === 1) {
//     return attemptOnce(MODEL_POOL[0], prompt, externalSignal);
//   }

//   const abortController = new AbortController();
//   const forwardAbort = () => abortController.abort();
//   if (externalSignal) {
//     if (externalSignal.aborted) {
//       abortController.abort();
//     } else {
//       externalSignal.addEventListener("abort", forwardAbort, {
//         once: true,
//       });
//     }
//   }

//   return new Promise<AttemptSuccess>((resolve, reject) => {
//     const errors: any[] = [];
//     let pending = MODEL_POOL.length;
//     let settled = false;

//     const finalize = () => {
//       if (externalSignal)
//         externalSignal.removeEventListener("abort", forwardAbort);
//     };

//     MODEL_POOL.forEach((model, index) => {
//       const delay =
//         DEFAULT_STAGGERS_MS[index] ??
//         DEFAULT_STAGGERS_MS[DEFAULT_STAGGERS_MS.length - 1] ??
//         0;
//       (async () => {
//         try {
//           if (delay > 0) await sleep(delay);
//           if (settled) return;
//           const result = await attemptOnce(
//             model,
//             prompt,
//             abortController.signal
//           );
//           if (settled) return;
//           settled = true;
//           abortController.abort();
//           finalize();
//           resolve(result);
//         } catch (error) {
//           if (settled) return;
//           errors.push(error);
//           if (--pending === 0) {
//             settled = true;
//             abortController.abort();
//             finalize();
//             reject(
//               errors[errors.length - 1] ?? error
//             );
//           }
//         }
//       })();
//     });
//   });
// }

// /** Build base JSON-only prompt; titleLength is optional override */
// function buildPrompt(
//   keywords: string[],
//   instructions: string,
//   titleLength?: number
// ): string {
//   const keywordList = keywords
//     .map((kw, index) => `${index + 1}. ${kw}`)
//     .join("\n");
//   const maxTitle =
//     typeof titleLength === "number" &&
//     titleLength > 0 &&
//     titleLength <= 140
//       ? titleLength
//       : 70;

//   return [
//     "You are an expert SEO copywriter tasked with producing conversion-focused content.",
//     `Return ONLY valid JSON with the exact structure { "title": string, "html": string } (no markdown fences).`,
//     "Constraints:",
//     `- Title must be unique, enticing, <= ${maxTitle} characters, and include at least one keyword.`,
//     "- html must be semantic markup using headings, lists, paragraphs, and optional blockquotes.",
//     "- Include placeholder tokens [ANCHOR:keyword] in the html for each keyword listed below.",
//     "- Do not include explanations or any extra JSON properties.",
//     `Primary keywords:\n${keywordList}`,
//     "Detailed brief:",
//     instructions.trim(),
//   ].join("\n\n");
// }

// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string | string[];
//   instructions: string;
//   /** Optional: clamp title length per prefs */
//   titleLength?: number;
// }

// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
//   titleLength,
// }: GenerateJSONTitleHtmlArgs): Promise<{ title: string; html: string }> {
//   const keywordArray = Array.isArray(keywords)
//     ? keywords.filter(
//         (kw): kw is string =>
//           typeof kw === "string" && kw.trim().length > 0
//       )
//     : [keywords].filter(
//         (kw): kw is string =>
//           typeof kw === "string" && kw.trim().length > 0
//       );

//   if (!keywordArray.length) throw new Error("No keywords provided");
//   if (!instructions?.trim())
//     throw new Error("No instructions provided to LLM.");

//   const prompt = buildPrompt(keywordArray, instructions, titleLength);
//   let lastError: any = null;
//   const maxTitle =
//     typeof titleLength === "number" &&
//     titleLength > 0 &&
//     titleLength <= 140
//       ? titleLength
//       : 70;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       if (globalPenaltyMs > 0) {
//         await sleep(Math.min(globalPenaltyMs, 1_500));
//       }

//       const result = await hedgedAttempt(prompt);
//       const parsed = parseJsonStrict(result.text);
//       if (!parsed || typeof parsed !== "object") {
//         throw new Error("LLM did not return JSON payload");
//       }

//       const rawTitle =
//         typeof parsed.title === "string"
//           ? parsed.title
//           : keywordArray[0];
//       const title = (rawTitle || keywordArray[0])
//         .trim()
//         .slice(0, maxTitle);

//       const html = String(parsed.html ?? "").trim();
//       if (!html) throw new Error("LLM returned empty html");

//       return { title, html };
//     } catch (error) {
//       lastError = error;
//       if (isAbortError(error)) throw error;
//       const backoff = isUnstable() ? 1_200 : 600;
//       await sleep(
//         backoff + Math.random() * 400 * (attempt + 1)
//       );
//     }
//   }

//   console.warn(
//     "[LLM] Falling back after retries:",
//     lastError?.message || lastError
//   );
//   const fallbackTitle = `${keywordArray[0] || "Untitled"} — draft`
//     .slice(0, maxTitle);
//   const fallbackHtml =
//     `<h1>${fallbackTitle}</h1><p>${instructions
//       .trim()
//       .slice(0, 220)}...</p>` +
//     `<ul>${keywordArray
//       .map((kw) => `<li>[ANCHOR:${kw}]</li>`)
//       .join("")}</ul>`;

//   return { title: fallbackTitle, html: fallbackHtml };
// }

// export function applyAnchorTokens(
//   html: string,
//   anchors: Array<{ keyword: string; url?: string }>
// ) {
//   let output = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const replacement = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     output = output.replace(token, replacement);
//   }
//   return output;
// }





// // src/lib/llm/api.ts
// /** ------------------------------------------------------------------
//  *  OPENAI GPT-5 MINI CLIENT
//  *  - Replaces Gemini scheduler
//  *  - Keeps same public contract:
//  *      generateJSONTitleHtml({ keywords, instructions, titleLength })
//  *      -> Promise<{ title: string; html: string }>
//  *  - Uses /v1/responses with GPT-5 mini + Structured Outputs
//  *  - Supports multiple API keys with smart cooldowns.
//  *  - Designed for low cost + high quality.
//  * ------------------------------------------------------------------- */

// export type ModelName = "gpt-5-mini";

// const MODEL_NAME: ModelName = "gpt-5-mini";
// const OPENAI_API_URL = "https://api.openai.com/v1/responses";

// /**
//  * HOW TO CONFIGURE KEYS
//  * - Preferred:
//  *      VITE_OPENAI_API_KEYS="sk-xxx,sk-yyy"
//  *   or VITE_OPENAI_API_KEY="sk-xxx"
//  * - You MAY hardcode in OPENAI_API_KEYS (placeholders only here).
//  */

// const ENV_KEYS = (
//   (import.meta as any).env?.VITE_OPENAI_API_KEYS as string | undefined
// )
//   ?.split(",")
//   .map((k) => k.trim())
//   .filter(Boolean);

// const SINGLE_KEY =
//   ((import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined)?.trim() ||
//   "";

// const OPENAI_API_KEYS: string[] =
//   (ENV_KEYS && ENV_KEYS.length > 0
//     ? ENV_KEYS
//     : SINGLE_KEY
//     ? [SINGLE_KEY]
//     : []
//   ).filter(Boolean);

// // ❗ If you insist on inline keys (NOT recommended), uncomment & edit:
// // const OPENAI_API_KEYS: string[] = [
// //   "sk-REPLACE_ME",
// // ];

// if (!OPENAI_API_KEYS.length) {
//   throw new Error(
//     "❌ No OpenAI API keys configured. Set VITE_OPENAI_API_KEYS / VITE_OPENAI_API_KEY or inline OPENAI_API_KEYS."
//   );
// }

// /** ------------------------------------------------------------------
//  *  Tunables (quality-first, cost-aware)
//  * ------------------------------------------------------------------- */

// const REQUEST_TIMEOUT_MS = 30_000;
// const MAX_RETRIES = 4;

// // GPT-5 mini pricing approx (see OpenAI docs):
// // Input ~$0.25/M, Output ~$2.00/M tokens.
// // These limits keep you cheap but allow rich articles.
// const MAX_OUTPUT_TOKENS = 2_400;
// const TEMPERATURE = 0.65;
// const TOP_P = 0.9;

// // Concurrency & rate limiting (multi-key aware)
// const MAX_IN_FLIGHT_PER_KEY = 3;
// const BASE_KEY_COOLDOWN_MS = 35_000;
// const GLOBAL_MAX_MULTIPLIER = 1.0;

// type HardCode = 429 | 500 | 503;

// interface KeyState {
//   inFlight: number;
//   cooldownUntil: number;
//   penaltyMs: number;
// }

// const keyState = new Map<string, KeyState>();
// for (const key of OPENAI_API_KEYS) {
//   keyState.set(key, {
//     inFlight: 0,
//     cooldownUntil: 0,
//     penaltyMs: 0,
//   });
// }

// let globalInFlight = 0;
// let globalPenaltyMs = 0;
// const globalWaiters: Array<() => void> = [];
// const hardEvents: Array<{ t: number; code: HardCode }> = [];

// const sleep = (ms: number) =>
//   new Promise<void>((resolve) => setTimeout(resolve, ms));
// const now = () => Date.now();

// /* ------------------------------------------------------------------ */

// function isAbortError(err: unknown): boolean {
//   return err instanceof DOMException && err.name === "AbortError";
// }

// function recordHard(code: HardCode) {
//   hardEvents.push({ t: now(), code });
//   if (hardEvents.length > 60) hardEvents.shift();
// }

// function isUnstable(): boolean {
//   const cutoff = now() - 20_000;
//   return hardEvents.filter((e) => e.t >= cutoff).length >= 6;
// }

// async function acquireGlobal() {
//   const limit =
//     Math.max(
//       1,
//       OPENAI_API_KEYS.length * MAX_IN_FLIGHT_PER_KEY * GLOBAL_MAX_MULTIPLIER
//     ) | 0;

//   if (globalInFlight < limit) {
//     globalInFlight++;
//     return;
//   }

//   await new Promise<void>((resolve) => {
//     globalWaiters.push(() => {
//       globalInFlight++;
//       resolve();
//     });
//   });
// }

// function releaseGlobal() {
//   globalInFlight = Math.max(0, globalInFlight - 1);
//   const next = globalWaiters.shift();
//   if (next) next();
// }

// function nextUsableKey(): string | null {
//   const t = now();
//   const candidates: string[] = [];

//   for (const [key, state] of keyState.entries()) {
//     if (state.cooldownUntil <= t && state.inFlight < MAX_IN_FLIGHT_PER_KEY) {
//       candidates.push(key);
//     }
//   }

//   if (!candidates.length) return null;

//   // Weighted random: prefer keys with more free capacity & lower penalty
//   const weights = candidates.map((key) => {
//     const s = keyState.get(key)!;
//     const capacity = Math.max(1, MAX_IN_FLIGHT_PER_KEY - s.inFlight);
//     const penalty = 1 + s.penaltyMs / 1000;
//     return capacity / penalty;
//   });

//   const total = weights.reduce((a, b) => a + b, 0);
//   let r = Math.random() * total;
//   for (let i = 0; i < candidates.length; i++) {
//     r -= weights[i];
//     if (r <= 0) return candidates[i];
//   }
//   return candidates[candidates.length - 1];
// }

// function acquireKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) throw new Error("Unknown key");
//   s.inFlight++;
// }

// function releaseKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) return;
//   s.inFlight = Math.max(0, s.inFlight - 1);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const s = keyState.get(key);
//   if (!s) return;
//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + s.penaltyMs;
//   s.cooldownUntil = Math.max(s.cooldownUntil, now() + extra);
//   s.penaltyMs = Math.min(s.penaltyMs * 1.4 + 800, 180_000);
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.3 + 250, 8_000);
// }

// function decayPenalties() {
//   for (const s of keyState.values()) {
//     s.penaltyMs = Math.max(0, s.penaltyMs - 600);
//   }
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// function parseRetryAfterMs(headers: Headers): number | null {
//   const value = headers.get("retry-after");
//   if (!value) return null;
//   const asSeconds = Number(value);
//   if (!Number.isNaN(asSeconds) && asSeconds >= 0) {
//     return Math.max(0, Math.floor(asSeconds * 1000));
//   }
//   const asDate = Date.parse(value);
//   if (!Number.isNaN(asDate)) {
//     return Math.max(0, asDate - now());
//   }
//   return null;
// }

// /** ------------------------------------------------------------------
//  *  JSON helpers
//  * ------------------------------------------------------------------- */

// function parseJsonStrict(payload: string): any | null {
//   if (!payload) return null;
//   const clean = payload.replace(/```json|```/g, "").trim();
//   try {
//     return JSON.parse(clean);
//   } catch {
//     const first = clean.indexOf("{");
//     const last = clean.lastIndexOf("}");
//     if (first >= 0 && last > first) {
//       try {
//         return JSON.parse(clean.slice(first, last + 1));
//       } catch {
//         return null;
//       }
//     }
//     return null;
//   }
// }

// /**
//  * Supports:
//  * - Structured Outputs: output[*].content[*].output (type = "output_struct")
//  * - JSON text in output_text or content[*].text
//  * - Old choices-style fallback if ever returned
//  */
// function extractJsonFromOpenAIResponse(payload: any): any | null {
//   if (!payload) return null;

//   if (Array.isArray(payload.output)) {
//     for (const msg of payload.output) {
//       if (!msg?.content) continue;
//       for (const part of msg.content) {
//         if (part?.type === "output_struct" && part.output) {
//           return part.output;
//         }
//         if (part?.type === "output_text" && typeof part.text === "string") {
//           const parsed = parseJsonStrict(part.text);
//           if (parsed && typeof parsed === "object") return parsed;
//         }
//       }
//     }
//   }

//   if (typeof payload.output_text === "string") {
//     const parsed = parseJsonStrict(payload.output_text);
//     if (parsed && typeof parsed === "object") return parsed;
//   }

//   if (Array.isArray(payload.choices)) {
//     for (const c of payload.choices) {
//       const txt: string | undefined =
//         c?.message?.content ||
//         c?.text ||
//         c?.message?.tool_calls?.[0]?.function?.arguments;
//       if (typeof txt === "string") {
//         const parsed = parseJsonStrict(txt);
//         if (parsed && typeof parsed === "object") return parsed;
//       }
//     }
//   }

//   return null;
// }

// /** ------------------------------------------------------------------
//  *  HTTP helper
//  * ------------------------------------------------------------------- */

// async function fetchJsonWithTimeout(
//   key: string,
//   body: unknown,
//   timeoutMs: number,
//   externalSignal?: AbortSignal
// ) {
//   const controller = new AbortController();
//   const forwardAbort = () => controller.abort();

//   if (externalSignal) {
//     if (externalSignal.aborted) {
//       controller.abort();
//     } else {
//       externalSignal.addEventListener("abort", forwardAbort, { once: true });
//     }
//   }

//   const timer = setTimeout(() => controller.abort(), timeoutMs);

//   try {
//     const res = await fetch(OPENAI_API_URL, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${key}`,
//       },
//       body: JSON.stringify(body),
//     });

//     const json = await res.json().catch(() => ({}));
//     return { status: res.status, headers: res.headers, json };
//   } finally {
//     clearTimeout(timer);
//     if (externalSignal) {
//       externalSignal.removeEventListener("abort", forwardAbort);
//     }
//   }
// }

// /** ------------------------------------------------------------------
//  *  Prompt + payload builder
//  * ------------------------------------------------------------------- */

// function buildPrompt(
//   keywords: string[],
//   instructions: string,
//   titleLength?: number
// ): string {
//   const keywordList = keywords
//     .map((kw, index) => `${index + 1}. ${kw}`)
//     .join("\n");

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   return [
//     "You are generating long-form SEO content for a production content tool.",
//     'You MUST return ONLY one valid JSON object: { "title": string, "html": string }.',
//     `- Title must be unique, enticing, <= ${maxTitle} characters.`,
//     "- html must be semantic markup (headings, paragraphs, lists, tables, blockquotes).",
//     "- Include [ANCHOR:keyword] placeholders where appropriate; they will be replaced later.",
//     "",
//     "PRIMARY KEYWORDS:",
//     keywordList,
//     "",
//     "FULL INSTRUCTIONS (highest priority):",
//     instructions.trim(),
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// function buildPayload(prompt: string) {
//   return {
//     model: MODEL_NAME,
//     input: [
//       {
//         role: "system",
//         content: [
//           {
//             type: "text",
//             text:
//               "You are a senior SEO & editorial writer. " +
//               "Follow all style & formatting instructions exactly. " +
//               'You MUST return only the JSON object { \"title\": string, \"html\": string }.',
//           },
//         ],
//       },
//       {
//         role: "user",
//         content: [{ type: "text", text: prompt }],
//       },
//     ],
//     temperature: TEMPERATURE,
//     top_p: TOP_P,
//     max_output_tokens: MAX_OUTPUT_TOKENS,
//     response_format: {
//       type: "json_schema",
//       json_schema: {
//         name: "TitleHtml",
//         strict: true,
//         schema: {
//           type: "object",
//           additionalProperties: false,
//           properties: {
//             title: { type: "string" },
//             html: { type: "string" },
//           },
//           required: ["title", "html"],
//         },
//       },
//     },
//     store: false,
//   };
// }

// /** ------------------------------------------------------------------
//  *  Single attempt (multi-key)
//  * ------------------------------------------------------------------- */

// interface AttemptSuccess {
//   model: ModelName;
//   key: string;
//   textJson: any;
//   raw: any;
// }

// async function attemptOnce(
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   await acquireGlobal();

//   try {
//     let lastError: any = null;

//     for (let tries = 0; tries < OPENAI_API_KEYS.length * 2 || tries < 2; tries++) {
//       const key = nextUsableKey();
//       if (!key) {
//         await sleep(120 + Math.random() * 240);
//         continue;
//       }

//       acquireKey(key);
//       try {
//         const { status, headers, json } = await fetchJsonWithTimeout(
//           key,
//           buildPayload(prompt),
//           REQUEST_TIMEOUT_MS,
//           externalSignal
//         );

//         if (status >= 200 && status < 300) {
//           const parsed = extractJsonFromOpenAIResponse(json);
//           if (!parsed || typeof parsed !== "object") {
//             throw Object.assign(
//               new Error("LLM did not return valid JSON matching schema"),
//               { code: 422, raw: json }
//             );
//           }
//           decayPenalties();
//           return { model: MODEL_NAME, key, textJson: parsed, raw: json };
//         }

//         const err: any = new Error(
//           json?.error?.message || `OpenAI error ${status}`
//         );
//         err.code = status;
//         err.retryAfterMs = parseRetryAfterMs(headers);
//         err.raw = json;
//         lastError = err;

//         const code = Number(err.code) as HardCode | number;
//         if (code === 429 || code === 503 || code === 500) {
//           recordHard(code as HardCode);
//           markCooldown(key, err.retryAfterMs ?? null);
//         }
//       } catch (err: any) {
//         lastError = err;
//         if (isAbortError(err)) throw err;
//       } finally {
//         releaseKey(key);
//       }
//     }

//     throw lastError ?? new Error("All OpenAI keys are throttled or failing");
//   } finally {
//     releaseGlobal();
//   }
// }

// /** ------------------------------------------------------------------
//  *  PUBLIC: generateJSONTitleHtml (same contract)
//  * ------------------------------------------------------------------- */

// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string | string[];
//   instructions: string;
//   titleLength?: number;
// }

// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
//   titleLength,
// }: GenerateJSONTitleHtmlArgs): Promise<{ title: string; html: string }> {
//   const keywordArray = Array.isArray(keywords)
//     ? keywords.filter(
//         (kw): kw is string => typeof kw === "string" && kw.trim().length > 0
//       )
//     : [keywords].filter(
//         (kw): kw is string => typeof kw === "string" && kw.trim().length > 0
//       );

//   if (!keywordArray.length) throw new Error("No keywords provided");
//   if (!instructions?.trim()) throw new Error("No instructions provided to LLM.");

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   let lastError: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       if (globalPenaltyMs > 0) {
//         await sleep(Math.min(globalPenaltyMs, 1_500));
//       }

//       const finalPrompt = buildPrompt(keywordArray, instructions, titleLength);
//       const { textJson } = await attemptOnce(finalPrompt);

//       const rawTitle =
//         typeof textJson.title === "string" && textJson.title.trim().length
//           ? textJson.title
//           : keywordArray[0];

//       const title = (rawTitle || keywordArray[0]).trim().slice(0, maxTitle);

//       const html =
//         typeof textJson.html === "string" && textJson.html.trim().length
//           ? textJson.html.trim()
//           : "";

//       if (!html) throw new Error("LLM returned empty html");

//       return { title, html };
//     } catch (error: any) {
//       lastError = error;
//       if (isAbortError(error)) throw error;

//       const backoffBase = isUnstable() ? 1_200 : 600;
//       await sleep(backoffBase + Math.random() * 400 * (attempt + 1));
//     }
//   }

//   console.warn("[LLM] Falling back after retries:", lastError?.message || lastError);

//   const fallbackTitle = `${keywordArray[0] || "Untitled"} — draft`.slice(0, maxTitle);
//   const fallbackHtml =
//     `<h1>${fallbackTitle}</h1>` +
//     `<p>${instructions.trim().slice(0, 220)}...</p>` +
//     `<ul>${keywordArray.map((kw) => `<li>${kw}</li>`).join("")}</ul>`;

//   return { title: fallbackTitle, html: fallbackHtml };
// }

// /** ------------------------------------------------------------------
//  *  Anchor helper (same as before)
//  * ------------------------------------------------------------------- */

// export function applyAnchorTokens(
//   html: string,
//   anchors: Array<{ keyword: string; url?: string }>
// ) {
//   let output = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const replacement = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     output = output.replace(token, replacement);
//   }
//   return output;
// }





// // src/lib/llm/api.ts
// /** ------------------------------------------------------------------
//  *  OPENAI GPT-5 + GPT-5 MINI CLIENT (Responses API)
//  *
//  *  - Uses /v1/responses with correct input_text + text.format json_schema.
//  *  - Supports multiple models: gpt-5-mini, gpt-5.
//  *  - Public API:
//  *      generateJSONTitleHtml({ keywords, instructions, titleLength })
//  *      -> Promise<{ title: string; html: string }>
//  * ------------------------------------------------------------------- */

// export type ModelName = "gpt-5-mini" | "gpt-5";

// const OPENAI_API_URL = "https://api.openai.com/v1/responses";

// /** ------------------------------------------------------------------
//  *  MODEL PRIORITY (EDIT HERE)
//  * -------------------------------------------------------------------
//  *  Order = preference:
//  *    ["gpt-5-mini", "gpt-5"]  -> pehle mini (cheap), phir gpt-5
//  *    ["gpt-5"]                -> sirf gpt-5
//  *    ["gpt-5-mini"]           -> sirf mini
//  * ------------------------------------------------------------------- */
// const ENABLED_MODELS: ModelName[] = ["gpt-5-mini", "gpt-5"];

// /** ------------------------------------------------------------------
//  *  API KEYS (.env)
//  * -------------------------------------------------------------------
//  *  .env.local:
//  *    VITE_OPENAI_API_KEY=sk-proj-xxxx
//  *    # ya:
//  *    # VITE_OPENAI_API_KEYS=sk-proj-xxx,sk-proj-yyy
//  * ------------------------------------------------------------------- */

// const ENV_KEYS = (
//   (import.meta as any).env?.VITE_OPENAI_API_KEYS as string | undefined
// )
//   ?.split(",")
//   .map((k) => k.trim())
//   .filter(Boolean);

// const SINGLE_KEY =
//   ((import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined)?.trim() ||
//   "";

// const OPENAI_API_KEYS: string[] =
//   (ENV_KEYS && ENV_KEYS.length > 0
//     ? ENV_KEYS
//     : SINGLE_KEY
//     ? [SINGLE_KEY]
//     : []
//   ).filter(Boolean);

// // Agar env sahi hai to isko mat use karo:
// // const OPENAI_API_KEYS: string[] = ["sk-proj-REPLACE_ME"];

// if (!OPENAI_API_KEYS.length) {
//   throw new Error(
//     "❌ No OpenAI API keys configured. Set VITE_OPENAI_API_KEYS / VITE_OPENAI_API_KEY or inline OPENAI_API_KEYS."
//   );
// }

// /** ------------------------------------------------------------------
//  *  Tunables (quality + cost)
//  * ------------------------------------------------------------------- */

// const REQUEST_TIMEOUT_MS = 30_000;
// const MAX_RETRIES = 4;

// const MAX_OUTPUT_TOKENS = 2_400; // ~1.5-2k words
// const TEMPERATURE = 0.65;
// const TOP_P = 0.9;

// const MAX_IN_FLIGHT_PER_KEY = 3;
// const BASE_KEY_COOLDOWN_MS = 35_000;
// const GLOBAL_MAX_MULTIPLIER = 1.0;

// type HardCode = 429 | 500 | 503;

// interface KeyState {
//   inFlight: number;
//   cooldownUntil: number;
//   penaltyMs: number;
// }

// const keyState = new Map<string, KeyState>();
// for (const key of OPENAI_API_KEYS) {
//   keyState.set(key, {
//     inFlight: 0,
//     cooldownUntil: 0,
//     penaltyMs: 0,
//   });
// }

// let globalInFlight = 0;
// let globalPenaltyMs = 0;
// const globalWaiters: Array<() => void> = [];
// const hardEvents: Array<{ t: number; code: HardCode }> = [];

// const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// const now = () => Date.now();

// /* ------------------------------------------------------------------ */

// function isAbortError(err: unknown): boolean {
//   return err instanceof DOMException && err.name === "AbortError";
// }

// function recordHard(code: HardCode) {
//   hardEvents.push({ t: now(), code });
//   if (hardEvents.length > 60) hardEvents.shift();
// }

// function isUnstable(): boolean {
//   const cutoff = now() - 20_000;
//   return hardEvents.filter((e) => e.t >= cutoff).length >= 6;
// }

// async function acquireGlobal() {
//   const limit =
//     Math.max(
//       1,
//       OPENAI_API_KEYS.length * MAX_IN_FLIGHT_PER_KEY * GLOBAL_MAX_MULTIPLIER
//     ) | 0;

//   if (globalInFlight < limit) {
//     globalInFlight++;
//     return;
//   }

//   await new Promise<void>((resolve) => {
//     globalWaiters.push(() => {
//       globalInFlight++;
//       resolve();
//     });
//   });
// }

// function releaseGlobal() {
//   globalInFlight = Math.max(0, globalInFlight - 1);
//   const next = globalWaiters.shift();
//   if (next) next();
// }

// function nextUsableKey(): string | null {
//   const t = now();
//   const candidates: string[] = [];

//   for (const [key, s] of keyState.entries()) {
//     if (s.cooldownUntil <= t && s.inFlight < MAX_IN_FLIGHT_PER_KEY) {
//       candidates.push(key);
//     }
//   }

//   if (!candidates.length) return null;

//   const weights = candidates.map((key) => {
//     const s = keyState.get(key)!;
//     const cap = Math.max(1, MAX_IN_FLIGHT_PER_KEY - s.inFlight);
//     const pen = 1 + s.penaltyMs / 1000;
//     return cap / pen;
//   });

//   const total = weights.reduce((a, b) => a + b, 0);
//   let r = Math.random() * total;
//   for (let i = 0; i < candidates.length; i++) {
//     r -= weights[i];
//     if (r <= 0) return candidates[i];
//   }
//   return candidates[candidates.length - 1];
// }

// function acquireKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) throw new Error("Unknown key");
//   s.inFlight++;
// }

// function releaseKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) return;
//   s.inFlight = Math.max(0, s.inFlight - 1);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const s = keyState.get(key);
//   if (!s) return;
//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + s.penaltyMs;
//   s.cooldownUntil = Math.max(s.cooldownUntil, now() + extra);
//   s.penaltyMs = Math.min(s.penaltyMs * 1.4 + 800, 180_000);
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.3 + 250, 8_000);
// }

// function decayPenalties() {
//   for (const s of keyState.values()) {
//     s.penaltyMs = Math.max(0, s.penaltyMs - 600);
//   }
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// function parseRetryAfterMs(headers: Headers): number | null {
//   const value = headers.get("retry-after");
//   if (!value) return null;
//   const asSeconds = Number(value);
//   if (!Number.isNaN(asSeconds) && asSeconds >= 0) {
//     return Math.max(0, Math.floor(asSeconds * 1000));
//   }
//   const asDate = Date.parse(value);
//   if (!Number.isNaN(asDate)) {
//     return Math.max(0, asDate - now());
//   }
//   return null;
// }

// /** ------------------------------------------------------------------
//  *  JSON helpers
//  * ------------------------------------------------------------------- */

// function parseJsonStrict(payload: string): any | null {
//   if (!payload) return null;
//   const clean = payload.replace(/```json|```/g, "").trim();
//   try {
//     return JSON.parse(clean);
//   } catch {
//     const first = clean.indexOf("{");
//     const last = clean.lastIndexOf("}");
//     if (first >= 0 && last > first) {
//       try {
//         return JSON.parse(clean.slice(first, last + 1));
//       } catch {
//         return null;
//       }
//     }
//     return null;
//   }
// }

// /**
//  * Parse Responses API structured outputs:
//  * - output[].content[].output (output_struct)
//  * - output[].content[].text (JSON text)
//  * - fallback: choices[*].message/text if ever present
//  */
// function extractJsonFromOpenAIResponse(payload: any): any | null {
//   if (!payload) return null;

//   if (Array.isArray(payload.output)) {
//     for (const msg of payload.output) {
//       if (!msg?.content) continue;
//       for (const part of msg.content) {
//         if (part?.type === "output_struct" && part.output) {
//           return part.output;
//         }
//         if (part?.type === "output_text" && typeof part.text === "string") {
//           const parsed = parseJsonStrict(part.text);
//           if (parsed && typeof parsed === "object") return parsed;
//         }
//       }
//     }
//   }

//   if (typeof payload.output_text === "string") {
//     const parsed = parseJsonStrict(payload.output_text);
//     if (parsed && typeof parsed === "object") return parsed;
//   }

//   if (Array.isArray(payload.choices)) {
//     for (const c of payload.choices) {
//       const txt: string | undefined =
//         c?.message?.content ||
//         c?.text ||
//         c?.message?.tool_calls?.[0]?.function?.arguments;
//       if (typeof txt === "string") {
//         const parsed = parseJsonStrict(txt);
//         if (parsed && typeof parsed === "object") return parsed;
//       }
//     }
//   }

//   return null;
// }

// /** ------------------------------------------------------------------
//  *  HTTP helper
//  * ------------------------------------------------------------------- */

// async function fetchJsonWithTimeout(
//   key: string,
//   body: unknown,
//   timeoutMs: number,
//   externalSignal?: AbortSignal
// ) {
//   const controller = new AbortController();
//   const forwardAbort = () => controller.abort();

//   if (externalSignal) {
//     if (externalSignal.aborted) {
//       controller.abort();
//     } else {
//       externalSignal.addEventListener("abort", forwardAbort, { once: true });
//     }
//   }

//   const timer = setTimeout(() => controller.abort(), timeoutMs);

//   try {
//     const res = await fetch(OPENAI_API_URL, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${key}`,
//       },
//       body: JSON.stringify(body),
//     });

//     const json = await res.json().catch(() => ({}));
//     return { status: res.status, headers: res.headers, json };
//   } finally {
//     clearTimeout(timer);
//     if (externalSignal) {
//       externalSignal.removeEventListener("abort", forwardAbort);
//     }
//   }
// }

// /** ------------------------------------------------------------------
//  *  Prompt + payload (correct structured outputs)
//  * ------------------------------------------------------------------- */

// function buildPrompt(
//   keywords: string[],
//   instructions: string,
//   titleLength?: number
// ): string {
//   const keywordList = keywords.map((kw, i) => `${i + 1}. ${kw}`).join("\n");

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   return [
//     "You are generating long-form SEO content for a production content tool.",
//     'Return ONLY one valid JSON object: { \"title\": string, \"html\": string }.',
//     `- Title: unique, human, <= ${maxTitle} characters.`,
//     "- html: semantic HTML (h2/h3, p, ul/ol, li, table, blockquote, etc.).",
//     "- Include [ANCHOR:keyword] placeholders where required; no markdown fences, no extra commentary.",
//     "",
//     "PRIMARY KEYWORDS:",
//     keywordList,
//     "",
//     "FULL INSTRUCTIONS (highest priority):",
//     instructions.trim(),
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// /**
//  * Responses API structured outputs:
//  * - Inputs: content[*].type = "input_text"
//  * - Outputs: via text.format.json_schema
//  */
// function buildPayload(prompt: string, model: ModelName) {
//   return {
//     model,
//     input: [
//       {
//         role: "system",
//         content: [
//           {
//             type: "input_text",
//             text:
//               "You are a senior human SEO & editorial writer. " +
//               "Write original, deeply-informed, plagiarism-free content. " +
//               "Follow ALL instructions exactly. " +
//               'Return ONLY one JSON object: { "title": string, "html": string }.',
//           },
//         ],
//       },
//       {
//         role: "user",
//         content: [
//           {
//             type: "input_text",
//             text: prompt,
//           },
//         ],
//       },
//     ],
//     max_output_tokens: MAX_OUTPUT_TOKENS,
//     temperature: TEMPERATURE,
//     top_p: TOP_P,
//     // ✅ Correct structured output config
//     text: {
//       format: {
//         type: "json_schema",
//         name: "TitleHtml",
//         strict: true,
//         schema: {
//           type: "object",
//           additionalProperties: false,
//           properties: {
//             title: { type: "string" },
//             html: { type: "string" },
//           },
//           required: ["title", "html"],
//         },
//       },
//     },
//     store: false,
//   };
// }

// /** ------------------------------------------------------------------
//  *  Per-model attempt
//  * ------------------------------------------------------------------- */

// interface AttemptSuccess {
//   model: ModelName;
//   key: string;
//   textJson: any;
//   raw: any;
// }

// async function attemptForModel(
//   model: ModelName,
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   let lastError: any = null;
//   const maxKeyAttempts = Math.max(2, OPENAI_API_KEYS.length * 2);

//   for (let i = 0; i < maxKeyAttempts; i++) {
//     const key = nextUsableKey();
//     if (!key) {
//       await sleep(120 + Math.random() * 240);
//       continue;
//     }

//     acquireKey(key);
//     try {
//       const { status, headers, json } = await fetchJsonWithTimeout(
//         key,
//         buildPayload(prompt, model),
//         REQUEST_TIMEOUT_MS,
//         externalSignal
//       );

//       if (status >= 200 && status < 300) {
//         const parsed = extractJsonFromOpenAIResponse(json);
//         if (!parsed || typeof parsed !== "object") {
//           const err: any = new Error(
//             `Model ${model} did not return valid JSON schema`
//           );
//           err.code = 422;
//           err.raw = json;
//           lastError = err;
//         } else {
//           decayPenalties();
//           return { model, key, textJson: parsed, raw: json };
//         }
//       } else {
//         const err: any = new Error(
//           json?.error?.message || `OpenAI error ${status} on ${model}`
//         );
//         err.code = status;
//         err.retryAfterMs = parseRetryAfterMs(headers);
//         err.raw = json;
//         lastError = err;

//         const code = Number(err.code) as HardCode | number;
//         if (code === 429 || code === 503 || code === 500) {
//           recordHard(code as HardCode);
//           markCooldown(key, err.retryAfterMs ?? null);
//         }
//       }
//     } catch (err: any) {
//       lastError = err;
//       if (isAbortError(err)) throw err;
//     } finally {
//       releaseKey(key);
//     }
//   }

//   throw lastError ?? new Error(`All keys failed for model ${model}`);
// }

// /** ------------------------------------------------------------------
//  *  attemptOnce: models in ENABLED_MODELS order
//  * ------------------------------------------------------------------- */

// async function attemptOnce(
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   await acquireGlobal();
//   try {
//     let lastError: any = null;
//     for (const model of ENABLED_MODELS) {
//       try {
//         return await attemptForModel(model, prompt, externalSignal);
//       } catch (err) {
//         lastError = err;
//       }
//     }
//     throw lastError ?? new Error("All enabled models failed");
//   } finally {
//     releaseGlobal();
//   }
// }

// /** ------------------------------------------------------------------
//  *  PUBLIC: generateJSONTitleHtml
//  * ------------------------------------------------------------------- */

// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string | string[];
//   instructions: string;
//   titleLength?: number;
// }

// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
//   titleLength,
// }: GenerateJSONTitleHtmlArgs): Promise<{ title: string; html: string }> {
//   const keywordArray = Array.isArray(keywords)
//     ? keywords.filter(
//         (kw): kw is string => typeof kw === "string" && kw.trim().length > 0
//       )
//     : [keywords].filter(
//         (kw): kw is string => typeof kw === "string" && kw.trim().length > 0
//       );

//   if (!keywordArray.length) throw new Error("No keywords provided");
//   if (!instructions?.trim()) throw new Error("No instructions provided to LLM.");

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   let lastError: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       if (globalPenaltyMs > 0) {
//         await sleep(Math.min(globalPenaltyMs, 1_500));
//       }

//       const finalPrompt = buildPrompt(keywordArray, instructions, titleLength);
//       const { textJson } = await attemptOnce(finalPrompt);

//       const rawTitle =
//         typeof textJson.title === "string" && textJson.title.trim().length
//           ? textJson.title
//           : keywordArray[0];

//       const title = (rawTitle || keywordArray[0]).trim().slice(0, maxTitle);

//       const html =
//         typeof textJson.html === "string" && textJson.html.trim().length
//           ? textJson.html.trim()
//           : "";

//       if (!html) throw new Error("LLM returned empty html");

//       return { title, html };
//     } catch (err: any) {
//       lastError = err;
//       if (isAbortError(err)) throw err;

//       const backoffBase = isUnstable() ? 1_200 : 600;
//       await sleep(backoffBase + Math.random() * 400 * (attempt + 1));
//     }
//   }

//   console.warn("[LLM] Falling back after retries:", lastError?.message || lastError);

//   const fallbackTitle = `${keywordArray[0] || "Untitled"} — draft`.slice(0, maxTitle);
//   const fallbackHtml =
//     `<h1>${fallbackTitle}</h1>` +
//     `<p>${instructions.trim().slice(0, 220)}...</p>` +
//     `<ul>${keywordArray.map((kw) => `<li>${kw}</li>`).join("")}</ul>`;

//   return { title: fallbackTitle, html: fallbackHtml };
// }

// /** ------------------------------------------------------------------
//  *  Anchor helper
//  * ------------------------------------------------------------------- */

// export function applyAnchorTokens(
//   html: string,
//   anchors: Array<{ keyword: string; url?: string }>
// ) {
//   let output = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const replacement = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     output = output.replace(token, replacement);
//   }
//   return output;
// }



// // src/lib/llm/api.ts

// /**
//  * OPENAI Responses API Client for:
//  *  - gpt-5
//  *  - gpt-5-mini
//  *
//  * Exposes:
//  *  - generateJSONTitleHtml({ keywords, instructions, titleLength })
//  *      -> Promise<{ title: string; html: string }>
//  *  - applyAnchorTokens(html, anchors)
//  *
//  * Uses:
//  *  - POST https://api.openai.com/v1/responses
//  *  - Structured outputs via text.format.json_schema
//  */

// export type ModelName = "gpt-5-mini" | "gpt-5";

// const OPENAI_API_URL = "https://api.openai.com/v1/responses";

// /** ------------------------------------------------------------------
//  *  MODEL PRIORITY
//  * ------------------------------------------------------------------- */

// const ENABLED_MODELS: ModelName[] = ["gpt-5-mini", "gpt-5"];

// /** ------------------------------------------------------------------
//  *  API KEYS
//  * ------------------------------------------------------------------- */

// const ENV_KEYS = (
//   (import.meta as any).env?.VITE_OPENAI_API_KEYS as string | undefined
// )
//   ?.split(",")
//   .map((k) => k.trim())
//   .filter(Boolean);

// const SINGLE_KEY =
//   ((import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined)?.trim() ||
//   "";

// const OPENAI_API_KEYS: string[] = (
//   ENV_KEYS && ENV_KEYS.length > 0
//     ? ENV_KEYS
//     : SINGLE_KEY
//     ? [SINGLE_KEY]
//     : []
// ).filter(Boolean);

// if (!OPENAI_API_KEYS.length) {
//   throw new Error(
//     "❌ No OpenAI API keys configured. Set VITE_OPENAI_API_KEYS / VITE_OPENAI_API_KEY."
//   );
// }

// /** ------------------------------------------------------------------
//  *  Tunables
//  * ------------------------------------------------------------------- */

// const REQUEST_TIMEOUT_MS = 30_000;
// const MAX_RETRIES = 4;

// const MAX_OUTPUT_TOKENS = 2_400; // ~1.5–2k words

// // NOTE:
// // gpt-5 / gpt-5-mini (reasoning-style) currently reject temperature/top_p.
// // We gate them below so they are NOT sent for these models.
// const TEMPERATURE = 0.65;
// const TOP_P = 0.9;

// const MAX_IN_FLIGHT_PER_KEY = 3;
// const BASE_KEY_COOLDOWN_MS = 35_000;
// const GLOBAL_MAX_MULTIPLIER = 1.0;

// type HardCode = 429 | 500 | 503;

// interface KeyState {
//   inFlight: number;
//   cooldownUntil: number;
//   penaltyMs: number;
// }

// const keyState = new Map<string, KeyState>();
// for (const key of OPENAI_API_KEYS) {
//   keyState.set(key, {
//     inFlight: 0,
//     cooldownUntil: 0,
//     penaltyMs: 0,
//   });
// }

// let globalInFlight = 0;
// let globalPenaltyMs = 0;
// const globalWaiters: Array<() => void> = [];
// const hardEvents: Array<{ t: number; code: HardCode }> = [];

// const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// const now = () => Date.now();

// /** ------------------------------------------------------------------
//  *  Helpers
//  * ------------------------------------------------------------------- */

// function isAbortError(err: unknown): boolean {
//   return err instanceof DOMException && err.name === "AbortError";
// }

// function recordHard(code: HardCode) {
//   hardEvents.push({ t: now(), code });
//   if (hardEvents.length > 60) hardEvents.shift();
// }

// function isUnstable(): boolean {
//   const cutoff = now() - 20_000;
//   return hardEvents.filter((e) => e.t >= cutoff).length >= 6;
// }

// async function acquireGlobal() {
//   const limit =
//     Math.max(
//       1,
//       OPENAI_API_KEYS.length * MAX_IN_FLIGHT_PER_KEY * GLOBAL_MAX_MULTIPLIER
//     ) | 0;

//   if (globalInFlight < limit) {
//     globalInFlight++;
//     return;
//   }

//   await new Promise<void>((resolve) => {
//     globalWaiters.push(() => {
//       globalInFlight++;
//       resolve();
//     });
//   });
// }

// function releaseGlobal() {
//   globalInFlight = Math.max(0, globalInFlight - 1);
//   const next = globalWaiters.shift();
//   if (next) next();
// }

// function nextUsableKey(): string | null {
//   const t = now();
//   const candidates: string[] = [];

//   for (const [key, s] of keyState.entries()) {
//     if (s.cooldownUntil <= t && s.inFlight < MAX_IN_FLIGHT_PER_KEY) {
//       candidates.push(key);
//     }
//   }

//   if (!candidates.length) return null;

//   const weights = candidates.map((key) => {
//     const s = keyState.get(key)!;
//     const cap = Math.max(1, MAX_IN_FLIGHT_PER_KEY - s.inFlight);
//     const pen = 1 + s.penaltyMs / 1000;
//     return cap / pen;
//   });

//   const total = weights.reduce((a, b) => a + b, 0);
//   let r = Math.random() * total;
//   for (let i = 0; i < candidates.length; i++) {
//     r -= weights[i];
//     if (r <= 0) return candidates[i];
//   }
//   return candidates[candidates.length - 1];
// }

// function acquireKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) throw new Error("Unknown key");
//   s.inFlight++;
// }

// function releaseKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) return;
//   s.inFlight = Math.max(0, s.inFlight - 1);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const s = keyState.get(key);
//   if (!s) return;
//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + s.penaltyMs;
//   s.cooldownUntil = Math.max(s.cooldownUntil, now() + extra);
//   s.penaltyMs = Math.min(s.penaltyMs * 1.4 + 800, 180_000);
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.3 + 250, 8_000);
// }

// function decayPenalties() {
//   for (const s of keyState.values()) {
//     s.penaltyMs = Math.max(0, s.penaltyMs - 600);
//   }
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// function parseRetryAfterMs(headers: Headers): number | null {
//   const value = headers.get("retry-after");
//   if (!value) return null;

//   const asSeconds = Number(value);
//   if (!Number.isNaN(asSeconds) && asSeconds >= 0) {
//     return Math.max(0, Math.floor(asSeconds * 1000));
//   }

//   const asDate = Date.parse(value);
//   if (!Number.isNaN(asDate)) {
//     return Math.max(0, asDate - now());
//   }

//   return null;
// }

// /** ------------------------------------------------------------------
//  *  JSON helpers
//  * ------------------------------------------------------------------- */

// function parseJsonStrict(payload: string): any | null {
//   if (!payload) return null;
//   const clean = payload.replace(/```json|```/g, "").trim();
//   try {
//     return JSON.parse(clean);
//   } catch {
//     const first = clean.indexOf("{");
//     const last = clean.lastIndexOf("}");
//     if (first >= 0 && last > first) {
//       try {
//         return JSON.parse(clean.slice(first, last + 1));
//       } catch {
//         return null;
//       }
//     }
//     return null;
//   }
// }

// /**
//  * Extract JSON from Responses API payload:
//  * - Prefer output[].content[].output (output_struct)
//  * - Then parse JSON from output[].content[].text (output_text)
//  * - Fallback: old-style choices[*].message/text if present.
//  */
// function extractJsonFromOpenAIResponse(payload: any): any | null {
//   if (!payload) return null;

//   // New Responses API: output -> message -> content
//   if (Array.isArray(payload.output)) {
//     for (const msg of payload.output) {
//       if (!msg?.content) continue;
//       for (const part of msg.content) {
//         // Structured output object
//         if (part?.type === "output_struct" && part.output) {
//           return part.output;
//         }
//         // Text that might contain JSON
//         if (part?.type === "output_text" && typeof part.text === "string") {
//           const parsed = parseJsonStrict(part.text);
//           if (parsed && typeof parsed === "object") return parsed;
//         }
//       }
//     }
//   }

//   // Some libs expose flat output_text
//   if (typeof payload.output_text === "string") {
//     const parsed = parseJsonStrict(payload.output_text);
//     if (parsed && typeof parsed === "object") return parsed;
//   }

//   // Backwards-compat: chat/completions-style
//   if (Array.isArray(payload.choices)) {
//     for (const c of payload.choices) {
//       const txt: string | undefined =
//         c?.message?.content ||
//         c?.text ||
//         c?.message?.tool_calls?.[0]?.function?.arguments;
//       if (typeof txt === "string") {
//         const parsed = parseJsonStrict(txt);
//         if (parsed && typeof parsed === "object") return parsed;
//       }
//     }
//   }

//   return null;
// }

// /** ------------------------------------------------------------------
//  *  HTTP helper
//  * ------------------------------------------------------------------- */

// async function fetchJsonWithTimeout(
//   key: string,
//   body: unknown,
//   timeoutMs: number,
//   externalSignal?: AbortSignal
// ) {
//   const controller = new AbortController();
//   const forwardAbort = () => controller.abort();

//   if (externalSignal) {
//     if (externalSignal.aborted) {
//       controller.abort();
//     } else {
//       externalSignal.addEventListener("abort", forwardAbort, { once: true });
//     }
//   }

//   const timer = setTimeout(() => controller.abort(), timeoutMs);

//   try {
//     const res = await fetch(OPENAI_API_URL, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${key}`,
//       },
//       body: JSON.stringify(body),
//     });

//     const json = await res.json().catch(() => ({}));
//     return { status: res.status, headers: res.headers, json };
//   } finally {
//     clearTimeout(timer);
//     if (externalSignal) {
//       externalSignal.removeEventListener("abort", forwardAbort);
//     }
//   }
// }

// /** ------------------------------------------------------------------
//  *  Prompt + payload
//  * ------------------------------------------------------------------- */

// function buildPrompt(
//   keywords: string[],
//   instructions: string,
//   titleLength?: number
// ): string {
//   const keywordList = keywords.map((kw, i) => `${i + 1}. ${kw}`).join("\n");

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   return [
//     "You are generating long-form SEO content for a production content tool.",
//     'Return ONLY one valid JSON object: { "title": string, "html": string }.',
//     `- Title: unique, human, <= ${maxTitle} characters.`,
//     "- html: semantic HTML (h2/h3, p, ul/ol, li, table, blockquote, etc.).",
//     "- Include [ANCHOR:keyword] placeholders where required; no markdown fences, no extra commentary.",
//     "",
//     "PRIMARY KEYWORDS:",
//     keywordList,
//     "",
//     "FULL INSTRUCTIONS (highest priority):",
//     instructions.trim(),
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// /**
//  * Whether this model supports sampling params like temperature/top_p.
//  * gpt-5 / gpt-5-mini (reasoning) currently DO NOT.
//  */
// function modelSupportsSampling(model: ModelName): boolean {
//   // Adjust list if you add other non-reasoning models later.
//   return !(model === "gpt-5" || model === "gpt-5-mini");
// }

// /**
//  * Build Responses API payload with structured outputs via text.format.json_schema.
//  */
// function buildPayload(prompt: string, model: ModelName) {
//   const payload: any = {
//     model,
//     input: [
//       {
//         role: "system",
//         content: [
//           {
//             type: "input_text",
//             text:
//               "You are a senior human SEO & editorial writer. " +
//               "Write original, deeply-informed, plagiarism-free content. " +
//               "Follow ALL instructions exactly. " +
//               'Return ONLY one JSON object: { "title": string, "html": string }. ' +
//               "Do NOT include backticks, markdown fences, or extra commentary.",
//           },
//         ],
//       },
//       {
//         role: "user",
//         content: [
//           {
//             type: "input_text",
//             text: prompt,
//           },
//         ],
//       },
//     ],
//     max_output_tokens: MAX_OUTPUT_TOKENS,
//     // Structured output configuration (new Responses API style)
//     text: {
//       format: {
//         type: "json_schema",
//         name: "TitleHtml",
//         strict: true,
//         schema: {
//           type: "object",
//           additionalProperties: false,
//           properties: {
//             title: { type: "string" },
//             html: { type: "string" },
//           },
//           required: ["title", "html"],
//         },
//       },
//     },
//     store: false,
//   };

//   // Only attach temperature/top_p for models that support it
//   if (modelSupportsSampling(model)) {
//     payload.temperature = TEMPERATURE;
//     payload.top_p = TOP_P;
//   }

//   return payload;
// }

// /** ------------------------------------------------------------------
//  *  Per-model attempt
//  * ------------------------------------------------------------------- */

// interface AttemptSuccess {
//   model: ModelName;
//   key: string;
//   textJson: any;
//   raw: any;
// }

// async function attemptForModel(
//   model: ModelName,
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   let lastError: any = null;
//   const maxKeyAttempts = Math.max(2, OPENAI_API_KEYS.length * 2);

//   for (let i = 0; i < maxKeyAttempts; i++) {
//     const key = nextUsableKey();
//     if (!key) {
//       await sleep(120 + Math.random() * 240);
//       continue;
//     }

//     acquireKey(key);
//     try {
//       const { status, headers, json } = await fetchJsonWithTimeout(
//         key,
//         buildPayload(prompt, model),
//         REQUEST_TIMEOUT_MS,
//         externalSignal
//       );

//       if (status >= 200 && status < 300) {
//         const parsed = extractJsonFromOpenAIResponse(json);
//         if (!parsed || typeof parsed !== "object") {
//           const err: any = new Error(
//             `Model ${model} did not return valid JSON schema object`
//           );
//           err.code = 422;
//           err.raw = json;
//           lastError = err;
//         } else {
//           decayPenalties();
//           return { model, key, textJson: parsed, raw: json };
//         }
//       } else {
//         const message =
//           json?.error?.message || `OpenAI error ${status} on ${model}`;
//         const err: any = new Error(message);
//         err.code = status;
//         err.retryAfterMs = parseRetryAfterMs(headers);
//         err.raw = json;
//         lastError = err;

//         const code = Number(err.code) as HardCode | number;
//         if (code === 429 || code === 503 || code === 500) {
//           recordHard(code as HardCode);
//           markCooldown(key, err.retryAfterMs ?? null);
//         }
//       }
//     } catch (err: any) {
//       lastError = err;
//       if (isAbortError(err)) throw err;
//     } finally {
//       releaseKey(key);
//     }
//   }

//   throw lastError ?? new Error(`All keys failed for model ${model}`);
// }

// /** ------------------------------------------------------------------
//  *  attemptOnce: iterate ENABLED_MODELS
//  * ------------------------------------------------------------------- */

// async function attemptOnce(
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   await acquireGlobal();
//   try {
//     let lastError: any = null;
//     for (const model of ENABLED_MODELS) {
//       try {
//         return await attemptForModel(model, prompt, externalSignal);
//       } catch (err) {
//         lastError = err;
//       }
//     }
//     throw lastError ?? new Error("All enabled models failed");
//   } finally {
//     releaseGlobal();
//   }
// }

// /** ------------------------------------------------------------------
//  *  PUBLIC: generateJSONTitleHtml
//  * ------------------------------------------------------------------- */

// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string | string[];
//   instructions: string;
//   titleLength?: number;
// }

// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
//   titleLength,
// }: GenerateJSONTitleHtmlArgs): Promise<{ title: string; html: string }> {
//   const keywordArray = Array.isArray(keywords)
//     ? keywords.filter(
//         (kw): kw is string => typeof kw === "string" && kw.trim().length > 0
//       )
//     : [keywords].filter(
//         (kw): kw is string => typeof kw === "string" && kw.trim().length > 0
//       );

//   if (!keywordArray.length) {
//     throw new Error("No keywords provided");
//   }
//   if (!instructions?.trim()) {
//     throw new Error("No instructions provided to LLM.");
//   }

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   let lastError: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       if (globalPenaltyMs > 0) {
//         await sleep(Math.min(globalPenaltyMs, 1_500));
//       }

//       const finalPrompt = buildPrompt(keywordArray, instructions, titleLength);
//       const { textJson } = await attemptOnce(finalPrompt);

//       const rawTitle =
//         typeof textJson.title === "string" && textJson.title.trim().length
//           ? textJson.title
//           : keywordArray[0];

//       const title = (rawTitle || keywordArray[0]).trim().slice(0, maxTitle);

//       const html =
//         typeof textJson.html === "string" && textJson.html.trim().length
//           ? textJson.html.trim()
//           : "";

//       if (!html) throw new Error("LLM returned empty html");

//       return { title, html };
//     } catch (err: any) {
//       lastError = err;
//       if (isAbortError(err)) throw err;

//       const backoffBase = isUnstable() ? 1_200 : 600;
//       await sleep(backoffBase + Math.random() * 400 * (attempt + 1));
//     }
//   }

//   console.warn(
//     "[LLM] Falling back after retries:",
//     lastError?.message || lastError
//   );

//   const fallbackTitle = `${keywordArray[0] || "Untitled"} — draft`.slice(
//     0,
//     maxTitle
//   );
//   const fallbackHtml =
//     `<h1>${fallbackTitle}</h1>` +
//     `<p>${instructions.trim().slice(0, 220)}...</p>` +
//     `<ul>${keywordArray.map((kw) => `<li>${kw}</li>`).join("")}</ul>`;

//   return { title: fallbackTitle, html: fallbackHtml };
// }

// /** ------------------------------------------------------------------
//  *  Anchor helper
//  * ------------------------------------------------------------------- */

// export function applyAnchorTokens(
//   html: string,
//   anchors: Array<{ keyword: string; url?: string }>
// ) {
//   let output = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const replacement = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     output = output.replace(token, replacement);
//   }
//   return output;
// }

// // src/lib/llm/api.ts
// // Responses API client for gpt-5 / gpt-5-mini
// // - Uses /v1/responses
// // - Structured JSON output: { "title": string, "html": string }

// export type ModelName = "gpt-5-mini" | "gpt-5";

// const OPENAI_API_URL = "https://api.openai.com/v1/responses";

// /** ------------------------------------------------------------------
//  *  API KEYS FROM ENV
//  * ------------------------------------------------------------------- */

// const ENV = (import.meta as any).env || {};

// const ENV_KEYS = (ENV.VITE_OPENAI_API_KEYS as string | undefined)
//   ?.split(",")
//   .map((k: string) => k.trim())
//   .filter(Boolean);

// const SINGLE_KEY = (ENV.VITE_OPENAI_API_KEY as string | undefined)?.trim() || "";

// const OPENAI_API_KEYS: string[] = (
//   ENV_KEYS && ENV_KEYS.length > 0
//     ? ENV_KEYS
//     : SINGLE_KEY
//     ? [SINGLE_KEY]
//     : []
// ).filter(Boolean);

// if (!OPENAI_API_KEYS.length) {
//   throw new Error(
//     "❌ No OpenAI API keys configured. Set VITE_OPENAI_API_KEYS or VITE_OPENAI_API_KEY."
//   );
// }

// /** ------------------------------------------------------------------
//  *  Tunables (keep conservative)
//  * ------------------------------------------------------------------- */

// const REQUEST_TIMEOUT_MS = 40_000; // per call timeout
// const MAX_RETRIES = 3;

// const MAX_OUTPUT_TOKENS = 2400;

// // IMPORTANT: As of now, gpt-5 / gpt-5-mini on /v1/responses
// // do NOT accept temperature/top_p → don't send them.
// const MODEL_SUPPORTS_SAMPLING: Record<ModelName, boolean> = {
//   "gpt-5-mini": false,
//   "gpt-5": false,
// };

// const ENABLED_MODELS: ModelName[] = ["gpt-5-mini", "gpt-5"];

// const MAX_IN_FLIGHT_PER_KEY = 2;

// type HardCode = 429 | 500 | 503;

// interface KeyState {
//   inFlight: number;
//   cooldownUntil: number;
//   penaltyMs: number;
// }

// const keyState = new Map<string, KeyState>();
// for (const key of OPENAI_API_KEYS) {
//   keyState.set(key, {
//     inFlight: 0,
//     cooldownUntil: 0,
//     penaltyMs: 0,
//   });
// }

// let globalInFlight = 0;
// let globalPenaltyMs = 0;
// const globalWaiters: Array<() => void> = [];
// const hardEvents: Array<{ t: number; code: HardCode }> = [];

// const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// const now = () => Date.now();

// /* ------------------------------------------------------------------ */

// function recordHard(code: HardCode) {
//   hardEvents.push({ t: now(), code });
//   if (hardEvents.length > 60) hardEvents.shift();
// }

// function isUnstable(): boolean {
//   const cutoff = now() - 20_000;
//   return hardEvents.filter((e) => e.t >= cutoff).length >= 6;
// }

// async function acquireGlobal() {
//   const limit = Math.max(1, OPENAI_API_KEYS.length * MAX_IN_FLIGHT_PER_KEY) | 0;

//   if (globalInFlight < limit) {
//     globalInFlight++;
//     return;
//   }

//   await new Promise<void>((resolve) => {
//     globalWaiters.push(() => {
//       globalInFlight++;
//       resolve();
//     });
//   });
// }

// function releaseGlobal() {
//   globalInFlight = Math.max(0, globalInFlight - 1);
//   const next = globalWaiters.shift();
//   if (next) next();
// }

// function nextUsableKey(): string | null {
//   const t = now();
//   const candidates: string[] = [];

//   for (const [key, s] of keyState.entries()) {
//     if (s.cooldownUntil <= t && s.inFlight < MAX_IN_FLIGHT_PER_KEY) {
//       candidates.push(key);
//     }
//   }

//   if (!candidates.length) return null;

//   const weights = candidates.map((key) => {
//     const s = keyState.get(key)!;
//     const cap = Math.max(1, MAX_IN_FLIGHT_PER_KEY - s.inFlight);
//     const pen = 1 + s.penaltyMs / 1000;
//     return cap / pen;
//   });

//   const total = weights.reduce((a, b) => a + b, 0);
//   let r = Math.random() * total;
//   for (let i = 0; i < candidates.length; i++) {
//     r -= weights[i];
//     if (r <= 0) return candidates[i];
//   }
//   return candidates[candidates.length - 1];
// }

// function acquireKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) throw new Error("Unknown key");
//   s.inFlight++;
// }

// function releaseKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) return;
//   s.inFlight = Math.max(0, s.inFlight - 1);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const s = keyState.get(key);
//   if (!s) return;
//   const extra = retryAfterMs ?? 15_000 + s.penaltyMs;
//   s.cooldownUntil = Math.max(s.cooldownUntil, now() + extra);
//   s.penaltyMs = Math.min(s.penaltyMs * 1.4 + 800, 180_000);
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.3 + 250, 8_000);
// }

// function decayPenalties() {
//   for (const s of keyState.values()) {
//     s.penaltyMs = Math.max(0, s.penaltyMs - 600);
//   }
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// function parseRetryAfterMs(headers: Headers): number | null {
//   const value = headers.get("retry-after");
//   if (!value) return null;
//   const asSeconds = Number(value);
//   if (!Number.isNaN(asSeconds) && asSeconds >= 0) {
//     return Math.max(0, Math.floor(asSeconds * 1000));
//   }
//   const asDate = Date.parse(value);
//   if (!Number.isNaN(asDate)) {
//     return Math.max(0, asDate - now());
//   }
//   return null;
// }

// /** ------------------------------------------------------------------
//  *  JSON helpers
//  * ------------------------------------------------------------------- */

// function parseJsonStrict(payload: string): any | null {
//   if (!payload) return null;
//   const clean = payload.replace(/```json|```/g, "").trim();
//   try {
//     return JSON.parse(clean);
//   } catch {
//     const first = clean.indexOf("{");
//     const last = clean.lastIndexOf("}");
//     if (first >= 0 && last > first) {
//       try {
//         return JSON.parse(clean.slice(first, last + 1));
//       } catch {
//         return null;
//       }
//     }
//     return null;
//   }
// }

// /**
//  * Extract structured output from Responses API response.
//  */
// function extractJsonFromOpenAIResponse(payload: any): any | null {
//   if (!payload) return null;

//   // Primary: responses API structure
//   if (Array.isArray(payload.output)) {
//     for (const msg of payload.output) {
//       if (!msg?.content) continue;
//       for (const part of msg.content) {
//         if (part?.type === "output_struct" && part.output) {
//           return part.output;
//         }
//         if (part?.type === "output_text" && typeof part.text === "string") {
//           const parsed = parseJsonStrict(part.text);
//           if (parsed && typeof parsed === "object") return parsed;
//         }
//       }
//     }
//   }

//   // Sometimes providers expose a flattened output_text
//   if (typeof payload.output_text === "string") {
//     const parsed = parseJsonStrict(payload.output_text);
//     if (parsed && typeof parsed === "object") return parsed;
//   }

//   // Fallback for any legacy-like shape
//   if (Array.isArray(payload.choices)) {
//     for (const c of payload.choices) {
//       const txt: string | undefined =
//         c?.message?.content ||
//         c?.text ||
//         c?.message?.tool_calls?.[0]?.function?.arguments;
//       if (typeof txt === "string") {
//         const parsed = parseJsonStrict(txt);
//         if (parsed && typeof parsed === "object") return parsed;
//       }
//     }
//   }

//   return null;
// }

// /** ------------------------------------------------------------------
//  *  HTTP helper
//  * ------------------------------------------------------------------- */

// async function fetchJsonWithTimeout(
//   key: string,
//   body: unknown,
//   timeoutMs: number
// ) {
//   const controller = new AbortController();
//   const timer = setTimeout(() => controller.abort(), timeoutMs);

//   try {
//     const res = await fetch(OPENAI_API_URL, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${key}`,
//       },
//       body: JSON.stringify(body),
//     });

//     const json = await res.json().catch(() => ({}));
//     return { status: res.status, headers: res.headers, json };
//   } finally {
//     clearTimeout(timer);
//   }
// }

// /** ------------------------------------------------------------------
//  *  Prompt + payload
//  * ------------------------------------------------------------------- */

// function buildPrompt(
//   keywords: string[],
//   instructions: string,
//   titleLength?: number
// ): string {
//   const keywordList = keywords.map((kw, i) => `${i + 1}. ${kw}`).join("\n");

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   return [
//     "You are generating long-form SEO content for a production content tool.",
//     'Return ONLY one valid JSON object: { "title": string, "html": string }.',
//     `- Title: unique, human, <= ${maxTitle} characters.`,
//     "- html: semantic HTML only (h2/h3, p, ul/ol, li, table, blockquote, etc.).",
//     "- No markdown fences. No extra commentary.",
//     "",
//     "PRIMARY KEYWORDS:",
//     keywordList,
//     "",
//     "FULL INSTRUCTIONS (highest priority):",
//     instructions.trim(),
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// function buildPayload(prompt: string, model: ModelName) {
//   const base: any = {
//     model,
//     input: [
//       {
//         role: "system",
//         content: [
//           {
//             type: "input_text",
//             text:
//               "You are a senior human SEO & editorial writer. " +
//               "Write original, deeply-informed, plagiarism-free content. " +
//               "Follow ALL instructions exactly. " +
//               'Return ONLY one JSON object: { "title": string, "html": string }.',
//           },
//         ],
//       },
//       {
//         role: "user",
//         content: [
//           {
//             type: "input_text",
//             text: prompt,
//           },
//         ],
//       },
//     ],
//     max_output_tokens: MAX_OUTPUT_TOKENS,
//     text: {
//       format: {
//         type: "json_schema",
//         name: "TitleHtml",
//         strict: true,
//         schema: {
//           type: "object",
//           additionalProperties: false,
//           properties: {
//             title: { type: "string" },
//             html: { type: "string" },
//           },
//           required: ["title", "html"],
//         },
//       },
//     },
//     store: false,
//   };

//   if (MODEL_SUPPORTS_SAMPLING[model]) {
//     // currently false for gpt-5 / gpt-5-mini; enable here if that changes
//     base.temperature = 0.65;
//     base.top_p = 0.9;
//   }

//   return base;
// }

// /** ------------------------------------------------------------------
//  *  Per-model attempt
//  * ------------------------------------------------------------------- */

// interface AttemptSuccess {
//   model: ModelName;
//   key: string;
//   textJson: any;
//   raw: any;
// }

// async function attemptForModel(
//   model: ModelName,
//   prompt: string
// ): Promise<AttemptSuccess> {
//   let lastError: any = null;
//   const maxKeyAttempts = Math.max(2, OPENAI_API_KEYS.length * 2);

//   for (let i = 0; i < maxKeyAttempts; i++) {
//     const key = nextUsableKey();
//     if (!key) {
//       await sleep(80 + Math.random() * 120);
//       continue;
//     }

//     acquireKey(key);
//     try {
//       const { status, headers, json } = await fetchJsonWithTimeout(
//         key,
//         buildPayload(prompt, model),
//         REQUEST_TIMEOUT_MS
//       );

//       if (status >= 200 && status < 300) {
//         const parsed = extractJsonFromOpenAIResponse(json);
//         if (!parsed || typeof parsed !== "object") {
//           lastError = new Error(
//             `Model ${model} did not return valid JSON {title,html}`
//           );
//         } else {
//           decayPenalties();
//           return { model, key, textJson: parsed, raw: json };
//         }
//       } else {
//         const err: any = new Error(
//           json?.error?.message || `OpenAI error ${status} on ${model}`
//         );
//         err.code = status;
//         err.retryAfterMs = parseRetryAfterMs(headers);
//         err.raw = json;
//         lastError = err;

//         const code = Number(err.code) as HardCode | number;
//         if (code === 429 || code === 503 || code === 500) {
//           recordHard(code as HardCode);
//           markCooldown(key, err.retryAfterMs ?? null);
//         }
//       }
//     } catch (err: any) {
//       // Network / Abort / etc. -> remember and try another key/model
//       lastError = err;
//     } finally {
//       releaseKey(key);
//     }
//   }

//   throw lastError ?? new Error(`All keys failed for model ${model}`);
// }

// /** ------------------------------------------------------------------
//  *  attemptOnce: models in ENABLED_MODELS order
//  * ------------------------------------------------------------------- */

// async function attemptOnce(prompt: string): Promise<AttemptSuccess> {
//   await acquireGlobal();
//   try {
//     let lastError: any = null;
//     for (const model of ENABLED_MODELS) {
//       try {
//         return await attemptForModel(model, prompt);
//       } catch (err) {
//         lastError = err;
//       }
//     }
//     throw lastError ?? new Error("All enabled models failed");
//   } finally {
//     releaseGlobal();
//   }
// }

// /** ------------------------------------------------------------------
//  *  PUBLIC: generateJSONTitleHtml
//  * ------------------------------------------------------------------- */

// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string | string[];
//   instructions: string;
//   titleLength?: number;
// }

// /**
//  * Always tries a few times; if all fail, returns a small fallback
//  * instead of hanging your UI forever.
//  */
// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
//   titleLength,
// }: GenerateJSONTitleHtmlArgs): Promise<{ title: string; html: string }> {
//   const keywordArray = Array.isArray(keywords)
//     ? keywords
//         .map((k) => (typeof k === "string" ? k.trim() : ""))
//         .filter((k) => k.length > 0)
//     : typeof keywords === "string"
//     ? [keywords.trim()].filter((k) => k.length > 0)
//     : [];

//   if (!keywordArray.length) {
//     throw new Error("No keywords provided");
//   }
//   if (!instructions?.trim()) {
//     throw new Error("No instructions provided to LLM.");
//   }

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   let lastError: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       if (globalPenaltyMs > 0) {
//         await sleep(Math.min(globalPenaltyMs, 1500));
//       }

//       const finalPrompt = buildPrompt(keywordArray, instructions, titleLength);
//       const { textJson } = await attemptOnce(finalPrompt);

//       const rawTitle =
//         typeof textJson.title === "string" && textJson.title.trim().length
//           ? textJson.title
//           : keywordArray[0];

//       const title = (rawTitle || keywordArray[0]).trim().slice(0, maxTitle);

//       const html =
//         typeof textJson.html === "string" && textJson.html.trim().length
//           ? textJson.html.trim()
//           : "";

//       if (!html) {
//         throw new Error("LLM returned empty html");
//       }

//       return { title, html };
//     } catch (err: any) {
//       lastError = err;

//       // IMPORTANT:
//       // Do NOT rethrow AbortError here.
//       // Treat all errors as "try again or fallback", so your UI never hangs.
//       const base = isUnstable() ? 1200 : 600;
//       await sleep(base + Math.random() * 400 * (attempt + 1));
//     }
//   }

//   console.warn(
//     "[LLM] Falling back after retries:",
//     lastError?.message || lastError
//   );

//   const fallbackTitle = `${keywordArray[0] || "Untitled"} — draft`.slice(
//     0,
//     maxTitle
//   );
//   const fallbackHtml =
//     `<h1>${fallbackTitle}</h1>` +
//     `<p>${instructions.trim().slice(0, 220)}...</p>` +
//     `<ul>${keywordArray.map((kw) => `<li>${kw}</li>`).join("")}</ul>`;

//   return { title: fallbackTitle, html: fallbackHtml };
// }

// /** ------------------------------------------------------------------
//  *  Anchor helper
//  * ------------------------------------------------------------------- */

// export function applyAnchorTokens(
//   html: string,
//   anchors: Array<{ keyword: string; url?: string }>
// ) {
//   let output = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const replacement = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     output = output.replace(token, replacement);
//   }
//   return output;
// }




// // src/lib/llm/api.ts
// /**
//  * OpenAI Responses API client for GPT-5 / GPT-5-mini
//  *
//  * - Uses /v1/responses with `input_text` parts.
//  * - Uses `text.format.json_schema` for strict JSON: { title, html }.
//  * - Handles multiple API keys + soft rate limiting.
//  * - On repeated failure, returns a local fallback (never leaves you hanging).
//  */

// export type ModelName = "gpt-5-mini" | "gpt-5";

// const OPENAI_API_URL = "https://api.openai.com/v1/responses";

// /* ------------------------------------------------------------------ */
// /* ENV: API KEYS */
// /* ------------------------------------------------------------------ */

// const ENV_KEYS = (
//   (import.meta as any).env?.VITE_OPENAI_API_KEYS as string | undefined
// )
//   ?.split(",")
//   .map((k) => k.trim())
//   .filter(Boolean);

// const SINGLE_KEY =
//   ((import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined)?.trim() ||
//   "";

// const OPENAI_API_KEYS: string[] = (
//   ENV_KEYS && ENV_KEYS.length > 0
//     ? ENV_KEYS
//     : SINGLE_KEY
//     ? [SINGLE_KEY]
//     : []
// ).filter(Boolean);

// if (!OPENAI_API_KEYS.length) {
//   throw new Error(
//     "❌ No OpenAI API keys configured. Set VITE_OPENAI_API_KEYS / VITE_OPENAI_API_KEY."
//   );
// }

// /* ------------------------------------------------------------------ */
// /* Tunables */
// /* ------------------------------------------------------------------ */

// const REQUEST_TIMEOUT_MS = 120_000; // 2 min per request
// const MAX_RETRIES = 2;

// const MAX_OUTPUT_TOKENS = 2_400; // ~1.5–2k words

// // key / concurrency control
// const MAX_IN_FLIGHT_PER_KEY = 3;
// const BASE_KEY_COOLDOWN_MS = 35_000;
// const GLOBAL_MAX_MULTIPLIER = 1.0;

// type HardCode = 429 | 500 | 503;

// interface KeyState {
//   inFlight: number;
//   cooldownUntil: number;
//   penaltyMs: number;
// }

// const keyState = new Map<string, KeyState>();
// for (const key of OPENAI_API_KEYS) {
//   keyState.set(key, {
//     inFlight: 0,
//     cooldownUntil: 0,
//     penaltyMs: 0,
//   });
// }

// let globalInFlight = 0;
// let globalPenaltyMs = 0;
// const globalWaiters: Array<() => void> = [];
// const hardEvents: Array<{ t: number; code: HardCode }> = [];

// const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// const now = () => Date.now();

// /* ------------------------------------------------------------------ */
// /* Helpers */
// /* ------------------------------------------------------------------ */

// function isAbortError(err: unknown): boolean {
//   return err instanceof DOMException && err.name === "AbortError";
// }

// function recordHard(code: HardCode) {
//   hardEvents.push({ t: now(), code });
//   if (hardEvents.length > 60) hardEvents.shift();
// }

// function isUnstable(): boolean {
//   const cutoff = now() - 20_000;
//   return hardEvents.filter((e) => e.t >= cutoff).length >= 6;
// }

// async function acquireGlobal() {
//   const limit =
//     Math.max(
//       1,
//       OPENAI_API_KEYS.length * MAX_IN_FLIGHT_PER_KEY * GLOBAL_MAX_MULTIPLIER
//     ) | 0;

//   if (globalInFlight < limit) {
//     globalInFlight++;
//     return;
//   }

//   await new Promise<void>((resolve) => {
//     globalWaiters.push(() => {
//       globalInFlight++;
//       resolve();
//     });
//   });
// }

// function releaseGlobal() {
//   globalInFlight = Math.max(0, globalInFlight - 1);
//   const next = globalWaiters.shift();
//   if (next) next();
// }

// function nextUsableKey(): string | null {
//   const t = now();
//   const candidates: string[] = [];

//   for (const [key, s] of keyState.entries()) {
//     if (s.cooldownUntil <= t && s.inFlight < MAX_IN_FLIGHT_PER_KEY) {
//       candidates.push(key);
//     }
//   }

//   if (!candidates.length) return null;

//   const weights = candidates.map((key) => {
//     const s = keyState.get(key)!;
//     const cap = Math.max(1, MAX_IN_FLIGHT_PER_KEY - s.inFlight);
//     const pen = 1 + s.penaltyMs / 1000;
//     return cap / pen;
//   });

//   const total = weights.reduce((a, b) => a + b, 0);
//   let r = Math.random() * total;
//   for (let i = 0; i < candidates.length; i++) {
//     r -= weights[i];
//     if (r <= 0) return candidates[i];
//   }
//   return candidates[candidates.length - 1];
// }

// function acquireKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) throw new Error("Unknown key");
//   s.inFlight++;
// }

// function releaseKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) return;
//   s.inFlight = Math.max(0, s.inFlight - 1);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const s = keyState.get(key);
//   if (!s) return;
//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + s.penaltyMs;
//   s.cooldownUntil = Math.max(s.cooldownUntil, now() + extra);
//   s.penaltyMs = Math.min(s.penaltyMs * 1.4 + 800, 180_000);
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.3 + 250, 8_000);
// }

// function decayPenalties() {
//   for (const s of keyState.values()) {
//     s.penaltyMs = Math.max(0, s.penaltyMs - 600);
//   }
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// function parseRetryAfterMs(headers: Headers): number | null {
//   const value = headers.get("retry-after");
//   if (!value) return null;
//   const asSeconds = Number(value);
//   if (!Number.isNaN(asSeconds) && asSeconds >= 0) {
//     return Math.max(0, Math.floor(asSeconds * 1000));
//   }
//   const asDate = Date.parse(value);
//   if (!Number.isNaN(asDate)) {
//     return Math.max(0, asDate - now());
//   }
//   return null;
// }

// /* ------------------------------------------------------------------ */
// /* JSON helpers */
// /* ------------------------------------------------------------------ */

// function parseJsonStrict(payload: string): any | null {
//   if (!payload) return null;
//   const clean = payload.replace(/```json|```/g, "").trim();
//   try {
//     return JSON.parse(clean);
//   } catch {
//     const first = clean.indexOf("{");
//     const last = clean.lastIndexOf("}");
//     if (first >= 0 && last > first) {
//       try {
//         return JSON.parse(clean.slice(first, last + 1));
//       } catch {
//         return null;
//       }
//     }
//     return null;
//   }
// }

// /**
//  * Extract {title, html} from Responses API payload.
//  * Handles:
//  * - output_struct
//  * - output_text containing JSON
//  * - legacy .choices fallbacks (defensive)
//  */
// function extractJsonFromOpenAIResponse(payload: any): any | null {
//   if (!payload) return null;

//   // New Responses API: output[]
//   if (Array.isArray(payload.output)) {
//     for (const msg of payload.output) {
//       // Direct structured output
//       if (msg?.type === "output_struct" && msg.output && typeof msg.output === "object") {
//         return msg.output;
//       }

//       // Some variants may put JSON as string content
//       if (msg?.type === "output_text" && typeof msg.content === "string") {
//         const parsed = parseJsonStrict(msg.content);
//         if (parsed && typeof parsed === "object") return parsed;
//       }

//       // Multi-part content
//       if (Array.isArray(msg.content)) {
//         for (const part of msg.content) {
//           if (part?.type === "output_struct" && part.output && typeof part.output === "object") {
//             return part.output;
//           }
//           if (part?.type === "output_text" && typeof part.text === "string") {
//             const parsed = parseJsonStrict(part.text);
//             if (parsed && typeof parsed === "object") return parsed;
//           }
//         }
//       }
//     }
//   }

//   // Fallbacks for any older / compat shapes
//   if (typeof payload.output_text === "string") {
//     const parsed = parseJsonStrict(payload.output_text);
//     if (parsed && typeof parsed === "object") return parsed;
//   }

//   if (Array.isArray(payload.choices)) {
//     for (const c of payload.choices) {
//       const txt: string | undefined =
//         c?.message?.content ||
//         c?.text ||
//         c?.message?.tool_calls?.[0]?.function?.arguments;
//       if (typeof txt === "string") {
//         const parsed = parseJsonStrict(txt);
//         if (parsed && typeof parsed === "object") return parsed;
//       }
//     }
//   }

//   return null;
// }

// /* ------------------------------------------------------------------ */
// /* HTTP helper */
// /* ------------------------------------------------------------------ */

// async function fetchJsonWithTimeout(
//   key: string,
//   body: unknown,
//   timeoutMs: number,
//   externalSignal?: AbortSignal
// ) {
//   const controller = new AbortController();
//   const forwardAbort = () => controller.abort();

//   if (externalSignal) {
//     if (externalSignal.aborted) {
//       controller.abort();
//     } else {
//       externalSignal.addEventListener("abort", forwardAbort, { once: true });
//     }
//   }

//   const timer = setTimeout(() => controller.abort(), timeoutMs);

//   try {
//     const res = await fetch(OPENAI_API_URL, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${key}`,
//       },
//       body: JSON.stringify(body),
//     });

//     const json = await res.json().catch(() => ({}));
//     return { status: res.status, headers: res.headers, json };
//   } finally {
//     clearTimeout(timer);
//     if (externalSignal) {
//       externalSignal.removeEventListener("abort", forwardAbort);
//     }
//   }
// }

// /* ------------------------------------------------------------------ */
// /* Prompt + Payload */
// /* ------------------------------------------------------------------ */

// function buildPrompt(
//   keywords: string[],
//   instructions: string,
//   titleLength?: number
// ): string {
//   const keywordList = keywords.map((kw, i) => `${i + 1}. ${kw}`).join("\n");

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   return [
//     "You are generating long-form SEO content for a production content tool.",
//     'Return ONLY one valid JSON object: { "title": string, "html": string }.',
//     `- Title: unique, human, <= ${maxTitle} characters.`,
//     "- html: semantic HTML (h2/h3, p, ul/ol, li, table, blockquote, etc.).",
//     "- Include [ANCHOR:keyword] placeholders where required; no markdown fences, no extra commentary.",
//     "",
//     "PRIMARY KEYWORDS:",
//     keywordList,
//     "",
//     "FULL INSTRUCTIONS (highest priority):",
//     instructions.trim(),
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// /**
//  * Build Responses API payload.
//  *
//  * NOTE:
//  * - We DO NOT send `temperature` or `top_p` here to avoid
//  *   “Unsupported parameter: 'temperature'” style errors on some models.
//  */
// function buildPayload(prompt: string, model: ModelName) {
//   return {
//     model,
//     input: [
//       {
//         role: "system",
//         content: [
//           {
//             type: "input_text",
//             text:
//               "You are a senior human SEO & editorial writer. " +
//               "Write original, deeply-informed, plagiarism-free content. " +
//               "Follow ALL instructions exactly. " +
//               'Return ONLY one JSON object: { "title": string, "html": string }.',
//           },
//         ],
//       },
//       {
//         role: "user",
//         content: [
//           {
//             type: "input_text",
//             text: prompt,
//           },
//         ],
//       },
//     ],
//     max_output_tokens: MAX_OUTPUT_TOKENS,
//     text: {
//       format: {
//         type: "json_schema",
//         name: "TitleHtml",
//         strict: true,
//         schema: {
//           type: "object",
//           additionalProperties: false,
//           properties: {
//             title: { type: "string" },
//             html: { type: "string" },
//           },
//           required: ["title", "html"],
//         },
//       },
//     },
//     store: false,
//   };
// }

// /* ------------------------------------------------------------------ */
// /* Per-model attempt */
// /* ------------------------------------------------------------------ */

// interface AttemptSuccess {
//   model: ModelName;
//   key: string;
//   textJson: any;
//   raw: any;
// }

// async function attemptForModel(
//   model: ModelName,
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   let lastError: any = null;
//   const maxKeyAttempts = Math.max(2, OPENAI_API_KEYS.length * 2);

//   for (let i = 0; i < maxKeyAttempts; i++) {
//     const key = nextUsableKey();
//     if (!key) {
//       await sleep(120 + Math.random() * 240);
//       continue;
//     }

//     acquireKey(key);
//     try {
//       const { status, headers, json } = await fetchJsonWithTimeout(
//         key,
//         buildPayload(prompt, model),
//         REQUEST_TIMEOUT_MS,
//         externalSignal
//       );

//       if (status >= 200 && status < 300) {
//         const parsed = extractJsonFromOpenAIResponse(json);
//         if (!parsed || typeof parsed !== "object") {
//           const err: any = new Error(
//             `Model ${model} did not return valid JSON schema`
//           );
//           err.code = 422;
//           err.raw = json;
//           lastError = err;
//         } else {
//           decayPenalties();
//           return { model, key, textJson: parsed, raw: json };
//         }
//       } else {
//         const message =
//           json?.error?.message || `OpenAI error ${status} on ${model}`;
//         const err: any = new Error(message);
//         err.code = status;
//         err.retryAfterMs = parseRetryAfterMs(headers);
//         err.raw = json;
//         lastError = err;

//         const codeNum = Number(status);
//         if (codeNum === 429 || codeNum === 500 || codeNum === 503) {
//           recordHard(codeNum as HardCode);
//           markCooldown(key, err.retryAfterMs ?? null);
//         }
//       }
//     } catch (err: any) {
//       // Timeouts/AbortError/etc → just remember & try other keys / models / fallback
//       lastError = err;
//       if (!isAbortError(err)) {
//         // non-abort errors already handled via retries/fallbacks
//       }
//     } finally {
//       releaseKey(key);
//     }
//   }

//   throw lastError ?? new Error(`All keys failed for model ${model}`);
// }

// /* ------------------------------------------------------------------ */
// /* attemptOnce: try models in ENABLED_MODELS order */
// /* ------------------------------------------------------------------ */

// const ENABLED_MODELS: ModelName[] = ["gpt-5-mini", "gpt-5"];

// async function attemptOnce(
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   await acquireGlobal();
//   try {
//     let lastError: any = null;
//     for (const model of ENABLED_MODELS) {
//       try {
//         return await attemptForModel(model, prompt, externalSignal);
//       } catch (err) {
//         lastError = err;
//       }
//     }
//     throw lastError ?? new Error("All enabled models failed");
//   } finally {
//     releaseGlobal();
//   }
// }

// /* ------------------------------------------------------------------ */
// /* PUBLIC: generateJSONTitleHtml */
// /* ------------------------------------------------------------------ */

// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string | string[];
//   instructions: string;
//   titleLength?: number;
// }

// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
//   titleLength,
// }: GenerateJSONTitleHtmlArgs): Promise<{ title: string; html: string }> {
//   const keywordArray = Array.isArray(keywords)
//     ? keywords.filter(
//         (kw): kw is string => typeof kw === "string" && kw.trim().length > 0
//       )
//     : [keywords].filter(
//         (kw): kw is string => typeof kw === "string" && kw.trim().length > 0
//       );

//   if (!keywordArray.length) throw new Error("No keywords provided");
//   if (!instructions?.trim()) throw new Error("No instructions provided to LLM.");

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   let lastError: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       if (globalPenaltyMs > 0) {
//         await sleep(Math.min(globalPenaltyMs, 1_500));
//       }

//       const finalPrompt = buildPrompt(keywordArray, instructions, titleLength);
//       const { textJson } = await attemptOnce(finalPrompt);

//       const rawTitle =
//         typeof textJson.title === "string" && textJson.title.trim().length
//           ? textJson.title
//           : keywordArray[0];

//       const title = (rawTitle || keywordArray[0]).trim().slice(0, maxTitle);

//       const html =
//         typeof textJson.html === "string" && textJson.html.trim().length
//           ? textJson.html.trim()
//           : "";

//       if (!html) throw new Error("LLM returned empty html");

//       return { title, html };
//     } catch (err: any) {
//       lastError = err;
//       const backoffBase = isUnstable() ? 1_200 : 600;
//       await sleep(backoffBase + Math.random() * 400 * (attempt + 1));
//     }
//   }

//   console.warn(
//     "[LLM] Falling back after retries:",
//     lastError?.message || lastError
//   );

//   const fallbackTitle = `${keywordArray[0] || "Untitled"} — draft`.slice(
//     0,
//     maxTitle
//   );
//   const fallbackHtml =
//     `<h1>${fallbackTitle}</h1>` +
//     `<p>${instructions.trim().slice(0, 220)}...</p>` +
//     `<ul>${keywordArray.map((kw) => `<li>${kw}</li>`).join("")}</ul>`;

//   return { title: fallbackTitle, html: fallbackHtml };
// }

// /* ------------------------------------------------------------------ */
// /* Anchor helper */
// /* ------------------------------------------------------------------ */

// export function applyAnchorTokens(
//   html: string,
//   anchors: Array<{ keyword: string; url?: string }>
// ) {
//   let output = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const replacement = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     output = output.replace(token, replacement);
//   }
//   return output;
// }



// // src/lib/llm/api.ts
// /** ------------------------------------------------------------------
//  *  OPENAI GPT-5 + GPT-5 MINI CLIENT (Responses API)
//  *
//  *  - Uses /v1/responses with correct response_format.json_schema.
//  *  - Supports multiple models: gpt-5-mini, gpt-5.
//  *  - Public API:
//  *      generateJSONTitleHtml({ keywords, instructions, titleLength })
//  *      -> Promise<{ title: string; html: string }>
//  * ------------------------------------------------------------------- */

// export type ModelName = "gpt-5-mini" | "gpt-5";

// const OPENAI_API_URL = "https://api.openai.com/v1/responses";

// /** ------------------------------------------------------------------
//  *  MODEL PRIORITY (EDIT HERE)
//  * ------------------------------------------------------------------- */
// const ENABLED_MODELS: ModelName[] = ["gpt-5-mini", "gpt-5"];

// /** ------------------------------------------------------------------
//  *  API KEYS (.env)
//  * ------------------------------------------------------------------- */

// const ENV_KEYS = (
//   (import.meta as any).env?.VITE_OPENAI_API_KEYS as string | undefined
// )?.split(",")
//   .map((k) => k.trim())
//   .filter(Boolean);

// const SINGLE_KEY =
//   ((import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined)?.trim() ||
//   "";

// const OPENAI_API_KEYS: string[] = (ENV_KEYS && ENV_KEYS.length > 0
//   ? ENV_KEYS
//   : SINGLE_KEY
//   ? [SINGLE_KEY]
//   : []
// ).filter(Boolean);

// if (!OPENAI_API_KEYS.length) {
//   throw new Error(
//     "❌ No OpenAI API keys configured. Set VITE_OPENAI_API_KEYS / VITE_OPENAI_API_KEY."
//   );
// }

// /** ------------------------------------------------------------------
//  *  Tunables (quality + cost)
//  * ------------------------------------------------------------------- */

// const REQUEST_TIMEOUT_MS = 30_000;
// const MAX_RETRIES = 4;

// const MAX_OUTPUT_TOKENS = 2_400; // ~1.5-2k words
// const TEMPERATURE = 0.65;
// const TOP_P = 0.9;

// const MAX_IN_FLIGHT_PER_KEY = 3;
// const BASE_KEY_COOLDOWN_MS = 35_000;
// const GLOBAL_MAX_MULTIPLIER = 1.0;

// type HardCode = 429 | 500 | 503;

// interface KeyState {
//   inFlight: number;
//   cooldownUntil: number;
//   penaltyMs: number;
// }

// const keyState = new Map<string, KeyState>();
// for (const key of OPENAI_API_KEYS) {
//   keyState.set(key, { inFlight: 0, cooldownUntil: 0, penaltyMs: 0 });
// }

// let globalInFlight = 0;
// let globalPenaltyMs = 0;
// const globalWaiters: Array<() => void> = [];
// const hardEvents: Array<{ t: number; code: HardCode }> = [];

// const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// const now = () => Date.now();

// /** ------------------------------------------------------------------
//  *  Logging helpers
//  * ------------------------------------------------------------------- */

// type LogLevel = "debug" | "warn" | "error";
// const LOG_PREFIX = "[LLM]";
// const LOG_LEVEL: LogLevel = (import.meta as any).env?.VITE_LLM_LOG_LEVEL ?? "debug";

// const shouldDebug = () => LOG_LEVEL === "debug";
// const dlog = (...args: any[]) => shouldDebug() && console.log(LOG_PREFIX, ...args);
// const dwarn = (...args: any[]) => console.warn(LOG_PREFIX, ...args);
// const derror = (...args: any[]) => console.error(LOG_PREFIX, ...args);

// const redactKey = (k?: string | null) =>
//   !k ? "" : `${k.slice(0, 3)}***${k.slice(-4)}`;

// const errMessage = (e: unknown): string =>
//   typeof e === "object" && e && "message" in e
//     ? String((e as any).message)
//     : String(e);

// /* ------------------------------------------------------------------ */

// function isAbortError(err: unknown): boolean {
//   return err instanceof DOMException && err.name === "AbortError";
// }

// function recordHard(code: HardCode) {
//   hardEvents.push({ t: now(), code });
//   if (hardEvents.length > 60) hardEvents.shift();
// }

// function isUnstable(): boolean {
//   const cutoff = now() - 20_000;
//   return hardEvents.filter((e) => e.t >= cutoff).length >= 6;
// }

// async function acquireGlobal() {
//   const limit =
//     Math.max(1, OPENAI_API_KEYS.length * MAX_IN_FLIGHT_PER_KEY * GLOBAL_MAX_MULTIPLIER) | 0;

//   if (globalInFlight < limit) {
//     globalInFlight++;
//     dlog("Global slot acquired. InFlight:", globalInFlight, "Limit:", limit);
//     return;
//   }

//   await new Promise<void>((resolve) => {
//     globalWaiters.push(() => {
//       globalInFlight++;
//       dlog("Global slot awakened waiter. InFlight:", globalInFlight);
//       resolve();
//     });
//   });
// }

// function releaseGlobal() {
//   globalInFlight = Math.max(0, globalInFlight - 1);
//   dlog("Global slot released. InFlight:", globalInFlight);
//   const next = globalWaiters.shift();
//   if (next) next();
// }

// function nextUsableKey(): string | null {
//   const t = now();
//   const candidates: string[] = [];

//   for (const [key, s] of keyState.entries()) {
//     if (s.cooldownUntil <= t && s.inFlight < MAX_IN_FLIGHT_PER_KEY) {
//       candidates.push(key);
//     }
//   }
//   if (!candidates.length) return null;

//   const weights = candidates.map((key) => {
//     const s = keyState.get(key)!;
//     const cap = Math.max(1, MAX_IN_FLIGHT_PER_KEY - s.inFlight);
//     const pen = 1 + s.penaltyMs / 1000;
//     return cap / pen;
//   });

//   const total = weights.reduce((a, b) => a + b, 0);
//   let r = Math.random() * total;
//   for (let i = 0; i < candidates.length; i++) {
//     r -= weights[i];
//     if (r <= 0) return candidates[i];
//   }
//   return candidates[candidates.length - 1];
// }

// function acquireKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) throw new Error("Unknown key");
//   s.inFlight++;
//   dlog("Key acquired:", redactKey(key), "inFlight:", s.inFlight);
// }

// function releaseKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) return;
//   s.inFlight = Math.max(0, s.inFlight - 1);
//   dlog("Key released:", redactKey(key), "inFlight:", s.inFlight);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const s = keyState.get(key);
//   if (!s) return;
//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + s.penaltyMs;
//   s.cooldownUntil = Math.max(s.cooldownUntil, now() + extra);
//   s.penaltyMs = Math.min(s.penaltyMs * 1.4 + 800, 180_000);
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.3 + 250, 8_000);
//   dwarn("Cooldown applied to key:", redactKey(key), {
//     retryAfterMs: extra,
//     newPenalty: s.penaltyMs,
//   });
// }

// function decayPenalties() {
//   for (const s of keyState.values()) s.penaltyMs = Math.max(0, s.penaltyMs - 600);
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// function parseRetryAfterMs(headers: Headers): number | null {
//   const value = headers.get("retry-after");
//   if (!value) return null;
//   const asSeconds = Number(value);
//   if (!Number.isNaN(asSeconds) && asSeconds >= 0) return Math.max(0, Math.floor(asSeconds * 1000));
//   const asDate = Date.parse(value);
//   if (!Number.isNaN(asDate)) return Math.max(0, asDate - now());
//   return null;
// }

// /** ------------------------------------------------------------------
//  *  JSON helpers
//  * ------------------------------------------------------------------- */

// function parseJsonStrict(payload: string): any | null {
//   if (!payload) return null;
//   const clean = payload.replace(/```json|```/g, "").trim();
//   try {
//     return JSON.parse(clean);
//   } catch {
//     const first = clean.indexOf("{");
//     const last = clean.lastIndexOf("}");
//     if (first >= 0 && last > first) {
//       try {
//         return JSON.parse(clean.slice(first, last + 1));
//       } catch {
//         return null;
//       }
//     }
//     return null;
//   }
// }

// /**
//  * Extract JSON from Responses API
//  */
// function extractJsonFromOpenAIResponse(payload: any): any | null {
//   if (!payload) return null;

//   // New Responses API pattern
//   if (Array.isArray(payload.output)) {
//     for (const msg of payload.output) {
//       if (!msg?.content) continue;
//       for (const part of msg.content) {
//         if (part?.type === "output_struct" && part.output) {
//           return part.output;
//         }
//         if (part?.type === "output_text" && typeof part.text === "string") {
//           const parsed = parseJsonStrict(part.text);
//           if (parsed && typeof parsed === "object") return parsed;
//         }
//       }
//     }
//   }

//   // Fallbacks
//   if (typeof payload.output_text === "string") {
//     const parsed = parseJsonStrict(payload.output_text);
//     if (parsed && typeof parsed === "object") return parsed;
//   }

//   if (Array.isArray(payload.choices)) {
//     for (const c of payload.choices) {
//       const txt: string | undefined =
//         c?.message?.content ||
//         c?.text ||
//         c?.message?.tool_calls?.[0]?.function?.arguments;
//       if (typeof txt === "string") {
//         const parsed = parseJsonStrict(txt);
//         if (parsed && typeof parsed === "object") return parsed;
//       }
//     }
//   }

//   return null;
// }

// /** ------------------------------------------------------------------
//  *  HTTP helper
//  * ------------------------------------------------------------------- */

// async function fetchJsonWithTimeout(
//   key: string,
//   body: unknown,
//   timeoutMs: number,
//   externalSignal?: AbortSignal
// ) {
//   const controller = new AbortController();
//   const forwardAbort = () => controller.abort();

//   if (externalSignal) {
//     if (externalSignal.aborted) controller.abort();
//     else externalSignal.addEventListener("abort", forwardAbort, { once: true });
//   }

//   const timer = setTimeout(() => controller.abort(), timeoutMs);

//   try {
//     dlog("→ [REQUEST]", {
//       url: OPENAI_API_URL,
//       model: (body as any)?.model,
//       key: redactKey(key),
//       hasResponseFormat: Boolean((body as any)?.response_format),
//       max_output_tokens: (body as any)?.max_output_tokens,
//       temperature: (body as any)?.temperature,
//       top_p: (body as any)?.top_p,
//     });

//     const res = await fetch(OPENAI_API_URL, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${key}`,
//       },
//       body: JSON.stringify(body),
//     });

//     let json: any = {};
//     try {
//       json = await res.json();
//     } catch {
//       // ignore
//     }

//     dlog("← [RESPONSE]", {
//       model: (body as any)?.model,
//       status: res.status,
//       ok: res.ok,
//       key: redactKey(key),
//       jsonPreview:
//         typeof json === "object" ? JSON.stringify(json).slice(0, 180) + "…" : String(json),
//     });

//     return { status: res.status, headers: res.headers, json };
//   } finally {
//     clearTimeout(timer);
//     if (externalSignal) externalSignal.removeEventListener("abort", forwardAbort);
//   }
// }

// /** ------------------------------------------------------------------
//  *  Prompt + payload (correct structured outputs)
//  * ------------------------------------------------------------------- */

// function buildPrompt(keywords: string[], instructions: string, titleLength?: number): string {
//   const keywordList = keywords.map((kw, i) => `${i + 1}. ${kw}`).join("\n");
//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140 ? titleLength : 70;

//   return [
//     "You are generating long-form SEO content for a production content tool.",
//     'Return ONLY one valid JSON object: { "title": string, "html": string }.',
//     `- Title: unique, human, <= ${maxTitle} characters.`,
//     "- html: semantic HTML (h2/h3, p, ul/ol, li, table, blockquote, etc.).",
//     "- Include [ANCHOR:keyword] placeholders where required; no markdown fences, no extra commentary.",
//     "",
//     "PRIMARY KEYWORDS:",
//     keywordList,
//     "",
//     "FULL INSTRUCTIONS (highest priority):",
//     instructions.trim(),
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// /**
//  * ✅ Use `response_format` as per current Responses API.
//  */
// function buildPayload(prompt: string, model: ModelName) {
//   const payload = {
//     model,
//     input: [
//       {
//         role: "system",
//         content: [{ type: "text", text: "You are a senior human SEO & editorial writer. Write original, deeply-informed, plagiarism-free content. Follow ALL instructions exactly. Return ONLY one JSON object: { \"title\": string, \"html\": string }." }],
//       },
//       {
//         role: "user",
//         content: [{ type: "text", text: prompt }],
//       },
//     ],
//     max_output_tokens: MAX_OUTPUT_TOKENS,
//     temperature: TEMPERATURE,
//     top_p: TOP_P,

//     // ⬇️ Correct structured output config
//     response_format: {
//       type: "json_schema",
//       json_schema: {
//         name: "TitleHtml",
//         strict: true,
//         schema: {
//           type: "object",
//           additionalProperties: false,
//           properties: {
//             title: { type: "string" },
//             html: { type: "string" },
//           },
//           required: ["title", "html"],
//         },
//       },
//     },

//     // Nice-to-have hints
//     modalities: ["text"] as const,
//     store: false,
//   };

//   dlog("Built payload", {
//     model,
//     hasResponseFormat: true,
//     max_output_tokens: MAX_OUTPUT_TOKENS,
//   });

//   return payload;
// }

// /** ------------------------------------------------------------------
//  *  Per-model attempt
//  * ------------------------------------------------------------------- */

// interface AttemptSuccess {
//   model: ModelName;
//   key: string;
//   textJson: any;
//   raw: any;
// }

// async function attemptForModel(
//   model: ModelName,
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   dlog("Starting attempts for model=" + model, ", maxKeyAttempts=" + Math.max(2, OPENAI_API_KEYS.length * 2));
//   let lastError: any = null;
//   const maxKeyAttempts = Math.max(2, OPENAI_API_KEYS.length * 2);

//   for (let i = 0; i < maxKeyAttempts; i++) {
//     const key = nextUsableKey();
//     if (!key) {
//       await sleep(120 + Math.random() * 240);
//       continue;
//     }

//     const state = keyState.get(key)!;
//     dlog("Selected API key", redactKey(key), "state:", { inFlight: state.inFlight, cooldownUntil: state.cooldownUntil, penaltyMs: state.penaltyMs });
//     acquireKey(key);

//     try {
//       const body = buildPayload(prompt, model);
//       const { status, headers, json } = await fetchJsonWithTimeout(key, body, REQUEST_TIMEOUT_MS, externalSignal);

//       if (status >= 200 && status < 300) {
//         const parsed = extractJsonFromOpenAIResponse(json);
//         if (!parsed || typeof parsed !== "object") {
//           const err: any = new Error(`Model ${model} did not return valid JSON schema`);
//           err.code = 422;
//           err.raw = json;
//           lastError = err;
//           derror("Invalid JSON from model:", model, { preview: JSON.stringify(json).slice(0, 240) + "…" });
//         } else {
//           decayPenalties();
//           return { model, key, textJson: parsed, raw: json };
//         }
//       } else {
//         const msg =
//           (json?.error?.message as string | undefined) ||
//           `OpenAI error ${status} on ${model}`;
//         const err: any = new Error(msg);
//         err.code = status;
//         err.retryAfterMs = parseRetryAfterMs(headers);
//         err.raw = json;
//         lastError = err;

//         derror("HTTP error from OpenAI", {
//           model,
//           status,
//           message: msg,
//           retryAfterMs: err.retryAfterMs,
//           body: json,
//         });

//         const code = Number(err.code) as HardCode | number;
//         if (code === 429 || code === 503 || code === 500) {
//           recordHard(code as HardCode);
//           markCooldown(key, err.retryAfterMs ?? null);
//         }
//       }
//     } catch (err: any) {
//       lastError = err;
//       if (isAbortError(err)) {
//         dwarn("Fetch aborted for model:", model);
//         throw err;
//       }
//       derror("Unexpected error calling OpenAI:", errMessage(err));
//     } finally {
//       releaseKey(key);
//     }
//   }

//   derror("All key attempts failed for model", model, "lastError:", lastError instanceof Error ? lastError : errMessage(lastError));
//   throw lastError ?? new Error(`All keys failed for model ${model}`);
// }

// /** ------------------------------------------------------------------
//  *  attemptOnce: models in ENABLED_MODELS order
//  * ------------------------------------------------------------------- */

// async function attemptOnce(prompt: string, externalSignal?: AbortSignal): Promise<AttemptSuccess> {
//   await acquireGlobal();
//   try {
//     let lastError: any = null;
//     dlog("attemptOnce starting. Models:", ENABLED_MODELS);

//     for (const model of ENABLED_MODELS) {
//       try {
//         const res = await attemptForModel(model, prompt, externalSignal);
//         dlog("attemptOnce success with model:", model);
//         return res;
//       } catch (err) {
//         lastError = err;
//         dwarn("Model failed, trying next if available:", { model, error: errMessage(err) });
//       }
//     }

//     derror("All enabled models failed in attemptOnce.", lastError);
//     throw lastError ?? new Error("All enabled models failed");
//   } finally {
//     releaseGlobal();
//   }
// }

// /** ------------------------------------------------------------------
//  *  PUBLIC: generateJSONTitleHtml
//  * ------------------------------------------------------------------- */

// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string | string[];
//   instructions: string;
//   titleLength?: number;
// }

// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
//   titleLength,
// }: GenerateJSONTitleHtmlArgs): Promise<{ title: string; html: string }> {
//   const keywordArray = Array.isArray(keywords)
//     ? keywords.filter((kw): kw is string => typeof kw === "string" && kw.trim().length > 0)
//     : [keywords].filter((kw): kw is string => typeof kw === "string" && kw.trim().length > 0);

//   if (!keywordArray.length) throw new Error("No keywords provided");
//   if (!instructions?.trim()) throw new Error("No instructions provided to LLM.");

//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140 ? titleLength : 70;

//   let lastError: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       if (globalPenaltyMs > 0) {
//         await sleep(Math.min(globalPenaltyMs, 1_500));
//       }

//       const finalPrompt = buildPrompt(keywordArray, instructions, titleLength);
//       const { textJson } = await attemptOnce(finalPrompt);

//       const rawTitle =
//         typeof textJson.title === "string" && textJson.title.trim().length
//           ? textJson.title
//           : keywordArray[0];

//       const title = (rawTitle || keywordArray[0]).trim().slice(0, maxTitle);

//       const html =
//         typeof textJson.html === "string" && textJson.html.trim().length ? textJson.html.trim() : "";

//       if (!html) throw new Error("LLM returned empty html");

//       return { title, html };
//     } catch (err: any) {
//       lastError = err;
//       if (isAbortError(err)) throw err;

//       const msg = errMessage(err);
//       dwarn(`Attempt ${attempt + 1} failed; will retry if attempts left. ${msg}`);
//       const backoffBase = isUnstable() ? 1_200 : 600;
//       await sleep(backoffBase + Math.random() * 400 * (attempt + 1));
//     }
//   }

//   derror("[LLM] Falling back after retries:", lastError?.message || lastError);

//   const fallbackTitle = `${keywordArray[0] || "Untitled"} — draft`.slice(0, maxTitle);
//   const fallbackHtml =
//     `<h1>${fallbackTitle}</h1>` +
//     `<p>${instructions.trim().slice(0, 220)}...</p>` +
//     `<ul>${keywordArray.map((kw) => `<li>${kw}</li>`).join("")}</ul>`;

//   return { title: fallbackTitle, html: fallbackHtml };
// }

// /** ------------------------------------------------------------------
//  *  Anchor helper
//  * ------------------------------------------------------------------- */

// export function applyAnchorTokens(
//   html: string,
//   anchors: Array<{ keyword: string; url?: string }>
// ) {
//   let output = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const replacement = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     output = output.replace(token, replacement);
//   }
//   return output;
// }




// // src/lib/llm/api.ts
// /**
//  * OPENAI GPT-5 / GPT-5-MINI CLIENT (Responses API, JSON Schema)
//  *
//  * Exposes:
//  *   generateJSONTitleHtml({ keywords, instructions, titleLength })
//  *     -> Promise<{ title: string; html: string }>
//  *
//  * - Uses /v1/responses (NOT chat.completions)
//  * - Uses new `text.format` style structured outputs (no `response_format` at top-level)
//  * - JSON contract:
//  *      {
//  *        "title": string,
//  *        "html": string
//  *      }
//  */

// export type ModelName = "gpt-5-mini" | "gpt-5";

// const OPENAI_API_URL = "https://api.openai.com/v1/responses";

// /** ------------------------------------------------------------------ */
// /** Model priority                                                      */
// /** ------------------------------------------------------------------ */

// const ENABLED_MODELS: ModelName[] = ["gpt-5-mini", "gpt-5"];

// /** ------------------------------------------------------------------ */
// /** API keys                                                           */
// /** ------------------------------------------------------------------ */

// const ENV_KEYS = (
//   (import.meta as any).env?.VITE_OPENAI_API_KEYS as string | undefined
// )
//   ?.split(",")
//   .map((k) => k.trim())
//   .filter(Boolean);

// const SINGLE_KEY =
//   ((import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined)?.trim() ||
//   "";

// // Optional: hardcoded keys fallback for local debugging (leave [] in prod)
// const HARDCODED_KEYS: string[] = [
//   // "sk-....",
// ];

// export const OPENAI_API_KEYS: string[] = (
//   ENV_KEYS && ENV_KEYS.length > 0
//     ? ENV_KEYS
//     : SINGLE_KEY
//     ? [SINGLE_KEY]
//     : HARDCODED_KEYS
// ).filter(Boolean);

// if (!OPENAI_API_KEYS.length) {
//   // Hard throw so misconfig is obvious in dev/prod
//   throw new Error(
//     "❌ No OpenAI API keys configured. Set VITE_OPENAI_API_KEY or VITE_OPENAI_API_KEYS."
//   );
// }

// /** ------------------------------------------------------------------ */
// /** Tunables (quality + cost + rate safety)                            */
// /** ------------------------------------------------------------------ */

// const REQUEST_TIMEOUT_MS = 30_000;
// const MAX_RETRIES = 4;

// const MAX_OUTPUT_TOKENS = 2_400; // ~1.5–2k words
// const TEMPERATURE = 0.65;
// const TOP_P = 0.9;

// const MAX_IN_FLIGHT_PER_KEY = 3;
// const BASE_KEY_COOLDOWN_MS = 35_000;
// const GLOBAL_MAX_MULTIPLIER = 1.0;

// type HardCode = 429 | 500 | 503;

// /** ------------------------------------------------------------------ */
// /** Key + global state                                                 */
// /** ------------------------------------------------------------------ */

// interface KeyState {
//   inFlight: number;
//   cooldownUntil: number;
//   penaltyMs: number;
// }

// const keyState = new Map<string, KeyState>();
// for (const key of OPENAI_API_KEYS) {
//   keyState.set(key, { inFlight: 0, cooldownUntil: 0, penaltyMs: 0 });
// }

// let globalInFlight = 0;
// let globalPenaltyMs = 0;
// const globalWaiters: Array<() => void> = [];
// const hardEvents: Array<{ t: number; code: HardCode }> = [];

// const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// const now = () => Date.now();

// /** ------------------------------------------------------------------ */
// /** Logging helpers                                                    */
// /** ------------------------------------------------------------------ */

// type LogLevel = "debug" | "warn" | "error";
// const LOG_PREFIX = "[LLM]";
// const LOG_LEVEL: LogLevel =
//   ((import.meta as any).env?.VITE_LLM_LOG_LEVEL as LogLevel) || "debug";

// const shouldDebug = () => LOG_LEVEL === "debug";
// const dlog = (...args: any[]) => shouldDebug() && console.log(LOG_PREFIX, ...args);
// const dwarn = (...args: any[]) => console.warn(LOG_PREFIX, ...args);
// const derror = (...args: any[]) => console.error(LOG_PREFIX, ...args);

// const redactKey = (k?: string | null) =>
//   !k ? "" : `${k.slice(0, 3)}***${k.slice(-4)}`;

// const errMessage = (e: unknown): string =>
//   typeof e === "object" && e && "message" in e
//     ? String((e as any).message)
//     : String(e);

// /** ------------------------------------------------------------------ */

// function isAbortError(err: unknown): boolean {
//   return err instanceof DOMException && err.name === "AbortError";
// }

// function recordHard(code: HardCode) {
//   hardEvents.push({ t: now(), code });
//   if (hardEvents.length > 60) hardEvents.shift();
// }

// function isUnstable(): boolean {
//   const cutoff = now() - 20_000;
//   return hardEvents.filter((e) => e.t >= cutoff).length >= 6;
// }

// async function acquireGlobal() {
//   const limit =
//     Math.max(
//       1,
//       OPENAI_API_KEYS.length * MAX_IN_FLIGHT_PER_KEY * GLOBAL_MAX_MULTIPLIER
//     ) | 0;

//   if (globalInFlight < limit) {
//     globalInFlight++;
//     dlog("Global slot acquired. InFlight:", globalInFlight, "Limit:", limit);
//     return;
//   }

//   await new Promise<void>((resolve) => {
//     globalWaiters.push(() => {
//       globalInFlight++;
//       dlog("Global slot awakened waiter. InFlight:", globalInFlight);
//       resolve();
//     });
//   });
// }

// function releaseGlobal() {
//   globalInFlight = Math.max(0, globalInFlight - 1);
//   dlog("Global slot released. InFlight:", globalInFlight);
//   const next = globalWaiters.shift();
//   if (next) next();
// }

// function nextUsableKey(): string | null {
//   const t = now();
//   const candidates: string[] = [];

//   for (const [key, s] of keyState.entries()) {
//     if (s.cooldownUntil <= t && s.inFlight < MAX_IN_FLIGHT_PER_KEY) {
//       candidates.push(key);
//     }
//   }
//   if (!candidates.length) return null;

//   const weights = candidates.map((key) => {
//     const s = keyState.get(key)!;
//     const cap = Math.max(1, MAX_IN_FLIGHT_PER_KEY - s.inFlight);
//     const pen = 1 + s.penaltyMs / 1000;
//     return cap / pen;
//   });

//   const total = weights.reduce((a, b) => a + b, 0);
//   let r = Math.random() * total;
//   for (let i = 0; i < candidates.length; i++) {
//     r -= weights[i];
//     if (r <= 0) return candidates[i];
//   }
//   return candidates[candidates.length - 1];
// }

// function acquireKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) throw new Error("Unknown key");
//   s.inFlight++;
//   dlog("Key acquired:", redactKey(key), "inFlight:", s.inFlight);
// }

// function releaseKey(key: string) {
//   const s = keyState.get(key);
//   if (!s) return;
//   s.inFlight = Math.max(0, s.inFlight - 1);
//   dlog("Key released:", redactKey(key), "inFlight:", s.inFlight);
// }

// function markCooldown(key: string, retryAfterMs: number | null) {
//   const s = keyState.get(key);
//   if (!s) return;

//   const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + s.penaltyMs;
//   s.cooldownUntil = Math.max(s.cooldownUntil, now() + extra);
//   s.penaltyMs = Math.min(s.penaltyMs * 1.4 + 800, 180_000);
//   globalPenaltyMs = Math.min(globalPenaltyMs * 1.3 + 250, 8_000);

//   dwarn("Cooldown applied to key:", redactKey(key), {
//     retryAfterMs: extra,
//     newPenalty: s.penaltyMs,
//   });
// }

// function decayPenalties() {
//   for (const s of keyState.values()) {
//     s.penaltyMs = Math.max(0, s.penaltyMs - 600);
//   }
//   globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
// }

// function parseRetryAfterMs(headers: Headers): number | null {
//   const value = headers.get("retry-after");
//   if (!value) return null;

//   const asSeconds = Number(value);
//   if (!Number.isNaN(asSeconds) && asSeconds >= 0) {
//     return Math.max(0, Math.floor(asSeconds * 1000));
//   }

//   const asDate = Date.parse(value);
//   if (!Number.isNaN(asDate)) return Math.max(0, asDate - now());

//   return null;
// }

// /** ------------------------------------------------------------------ */
// /** JSON helpers                                                       */
// /** ------------------------------------------------------------------ */

// function parseJsonStrict(payload: string): any | null {
//   if (!payload) return null;
//   const clean = payload.replace(/```json|```/g, "").trim();

//   try {
//     return JSON.parse(clean);
//   } catch {
//     const first = clean.indexOf("{");
//     const last = clean.lastIndexOf("}");
//     if (first >= 0 && last > first) {
//       try {
//         return JSON.parse(clean.slice(first, last + 1));
//       } catch {
//         return null;
//       }
//     }
//     return null;
//   }
// }

// /**
//  * Extract TitleHtml JSON from Responses API payload.
//  * Supports both the new `text.format` structured outputs
//  * and some legacy / fallback shapes.
//  */
// function extractJsonFromOpenAIResponse(payload: any): any | null {
//   if (!payload) return null;

//   // Primary: Responses API `output` array.
//   if (Array.isArray(payload.output)) {
//     for (const item of payload.output) {
//       const parts = item?.content;
//       if (!Array.isArray(parts)) continue;

//       for (const part of parts) {
//         // New structured-output style
//         if (part?.type === "output_text") {
//           if (part.json && typeof part.json === "object") {
//             return part.json;
//           }
//           if (part.parsed && typeof part.parsed === "object") {
//             return part.parsed;
//           }
//           if (typeof part.text === "string") {
//             const parsed = parseJsonStrict(part.text);
//             if (parsed && typeof parsed === "object") return parsed;
//           }
//         }

//         // Older beta variants
//         if (part?.type === "output_struct" && part.output) {
//           if (typeof part.output === "object") return part.output;
//           const parsed = parseJsonStrict(String(part.output));
//           if (parsed && typeof parsed === "object") return parsed;
//         }
//       }
//     }
//   }

//   // Fallbacks: if any helper fields exist
//   if (typeof payload.output_text === "string") {
//     const parsed = parseJsonStrict(payload.output_text);
//     if (parsed && typeof parsed === "object") return parsed;
//   }

//   if (Array.isArray(payload.choices)) {
//     for (const c of payload.choices) {
//       const txt: string | undefined =
//         c?.message?.content ||
//         c?.text ||
//         c?.message?.tool_calls?.[0]?.function?.arguments;
//       if (typeof txt === "string") {
//         const parsed = parseJsonStrict(txt);
//         if (parsed && typeof parsed === "object") return parsed;
//       }
//     }
//   }

//   return null;
// }

// /** ------------------------------------------------------------------ */
// /** HTTP helper                                                        */
// /** ------------------------------------------------------------------ */

// async function fetchJsonWithTimeout(
//   key: string,
//   body: unknown,
//   timeoutMs: number,
//   externalSignal?: AbortSignal
// ) {
//   const controller = new AbortController();
//   const forwardAbort = () => controller.abort();

//   if (externalSignal) {
//     if (externalSignal.aborted) {
//       controller.abort();
//     } else {
//       externalSignal.addEventListener("abort", forwardAbort, { once: true });
//     }
//   }

//   const timer = setTimeout(() => controller.abort(), timeoutMs);

//   try {
//     dlog("→ [REQUEST]", {
//       url: OPENAI_API_URL,
//       model: (body as any)?.model,
//       key: redactKey(key),
//       max_output_tokens: (body as any)?.max_output_tokens,
//       temperature: (body as any)?.temperature,
//       top_p: (body as any)?.top_p,
//     });

//     const res = await fetch(OPENAI_API_URL, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${key}`,
//       },
//       body: JSON.stringify(body),
//     });

//     let json: any = {};
//     try {
//       json = await res.json();
//     } catch {
//       // ignore parse error
//     }

//     dlog("← [RESPONSE]", {
//       model: (body as any)?.model,
//       status: res.status,
//       ok: res.ok,
//       key: redactKey(key),
//       jsonPreview:
//         typeof json === "object"
//           ? JSON.stringify(json).slice(0, 200) + "…"
//           : String(json),
//     });

//     return { status: res.status, headers: res.headers, json };
//   } finally {
//     clearTimeout(timer);
//     if (externalSignal) {
//       externalSignal.removeEventListener("abort", forwardAbort);
//     }
//   }
// }

// /** ------------------------------------------------------------------ */
// /** Prompt + payload                                                   */
// /** ------------------------------------------------------------------ */

// function buildPrompt(
//   keywords: string[],
//   instructions: string,
//   titleLength?: number
// ): string {
//   const keywordList = keywords.map((kw, i) => `${i + 1}. ${kw}`).join("\n");
//   const maxTitle =
//     typeof titleLength === "number" && titleLength > 0 && titleLength <= 140
//       ? titleLength
//       : 70;

//   return [
//     "You are generating long-form SEO content for a production content tool.",
//     'Return ONLY one valid JSON object: { "title": string, "html": string }.',
//     `- Title: unique, human, <= ${maxTitle} characters.`,
//     "- html: full semantic HTML (h2/h3, p, ul/ol, li, table, blockquote, etc.).",
//     "- Insert [ANCHOR:keyword] placeholders where anchor links should go; no markdown fences, no commentary.",
//     "",
//     "PRIMARY KEYWORDS:",
//     keywordList,
//     "",
//     "FULL INSTRUCTIONS (highest priority):",
//     instructions.trim(),
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// /**
//  * Build Responses API payload using new `text.format` for JSON schema.
//  */
// function buildPayload(prompt: string, model: ModelName) {
//   const schema = {
//     type: "object",
//     additionalProperties: false,
//     properties: {
//       title: { type: "string" },
//       html: { type: "string" },
//     },
//     required: ["title", "html"],
//   };

//   const payload: any = {
//     model,
//     input: [
//       {
//         role: "system",
//         content: [
//           {
//             type: "input_text",
//             text:
//               "You are a senior human SEO & editorial writer. Follow all instructions and return ONLY a valid JSON object {\"title\": string, \"html\": string}.",
//           },
//         ],
//       },
//       {
//         role: "user",
//         content: [
//           {
//             type: "input_text",
//             text: {
//               format: {
//                 type: "json_schema",
//                 json_schema: {
//                   name: "TitleHtml",
//                   strict: true,
//                   schema,
//                 },
//               },
//               value: prompt,
//             },
//           },
//         ],
//       },
//     ],
//     max_output_tokens: MAX_OUTPUT_TOKENS,
//     temperature: TEMPERATURE,
//     top_p: TOP_P,
//     store: false,
//   };

//   dlog("Built payload", {
//     model,
//     hasTextFormat: true,
//     max_output_tokens: MAX_OUTPUT_TOKENS,
//   });

//   return payload;
// }

// /** ------------------------------------------------------------------ */
// /** Per-model attempt                                                  */
// /** ------------------------------------------------------------------ */

// interface AttemptSuccess {
//   model: ModelName;
//   key: string;
//   textJson: any;
//   raw: any;
// }

// async function attemptForModel(
//   model: ModelName,
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   dlog(
//     "Starting attempts for model=" + model,
//     ", maxKeyAttempts=" + Math.max(2, OPENAI_API_KEYS.length * 2)
//   );

//   let lastError: any = null;
//   const maxKeyAttempts = Math.max(2, OPENAI_API_KEYS.length * 2);

//   for (let i = 0; i < maxKeyAttempts; i++) {
//     const key = nextUsableKey();
//     if (!key) {
//       await sleep(120 + Math.random() * 240);
//       continue;
//     }

//     const state = keyState.get(key)!;
//     dlog("Selected API key", redactKey(key), "state:", {
//       inFlight: state.inFlight,
//       cooldownUntil: state.cooldownUntil,
//       penaltyMs: state.penaltyMs,
//     });

//     acquireKey(key);

//     try {
//       const body = buildPayload(prompt, model);
//       const { status, headers, json } = await fetchJsonWithTimeout(
//         key,
//         body,
//         REQUEST_TIMEOUT_MS,
//         externalSignal
//       );

//       if (status >= 200 && status < 300) {
//         const parsed = extractJsonFromOpenAIResponse(json);
//         if (!parsed || typeof parsed !== "object") {
//           const err: any = new Error(
//             `Model ${model} did not return valid TitleHtml JSON`
//           );
//           err.code = 422;
//           err.raw = json;
//           lastError = err;
//           derror("Invalid JSON from model:", model, {
//             preview: JSON.stringify(json).slice(0, 240) + "…",
//           });
//         } else {
//           decayPenalties();
//           return { model, key, textJson: parsed, raw: json };
//         }
//       } else {
//         const msg =
//           (json?.error?.message as string | undefined) ||
//           `OpenAI error ${status} on ${model}`;
//         const err: any = new Error(msg);
//         err.code = status;
//         err.retryAfterMs = parseRetryAfterMs(headers);
//         err.raw = json;
//         lastError = err;

//         derror("HTTP error from OpenAI", {
//           model,
//           status,
//           message: msg,
//           retryAfterMs: err.retryAfterMs,
//           body: json,
//         });

//         const code = Number(err.code) as HardCode | number;
//         if (code === 429 || code === 503 || code === 500) {
//           recordHard(code as HardCode);
//           markCooldown(key, err.retryAfterMs ?? null);
//         }
//       }
//     } catch (err: any) {
//       lastError = err;
//       if (isAbortError(err)) {
//         dwarn("Fetch aborted for model:", model);
//         throw err;
//       }
//       derror("Unexpected error calling OpenAI:", errMessage(err));
//     } finally {
//       releaseKey(key);
//     }
//   }

//   derror(
//     "All key attempts failed for model",
//     model,
//     "lastError:",
//     lastError instanceof Error ? lastError : errMessage(lastError)
//   );
//   throw lastError ?? new Error(`All keys failed for model ${model}`);
// }

// /** ------------------------------------------------------------------ */
// /** attemptOnce: models in ENABLED_MODELS order                        */
// /** ------------------------------------------------------------------ */

// async function attemptOnce(
//   prompt: string,
//   externalSignal?: AbortSignal
// ): Promise<AttemptSuccess> {
//   await acquireGlobal();
//   try {
//     let lastError: any = null;
//     dlog("attemptOnce starting. Models:", ENABLED_MODELS);

//     for (const model of ENABLED_MODELS) {
//       try {
//         const res = await attemptForModel(model, prompt, externalSignal);
//         dlog("attemptOnce success with model:", model);
//         return res;
//       } catch (err) {
//         lastError = err;
//         dwarn("Model failed, trying next if available:", {
//           model,
//           error: errMessage(err),
//         });
//       }
//     }

//     derror("All enabled models failed in attemptOnce.", lastError);
//     throw lastError ?? new Error("All enabled models failed");
//   } finally {
//     releaseGlobal();
//   }
// }

// /** ------------------------------------------------------------------ */
// /** PUBLIC: generateJSONTitleHtml                                      */
// /** ------------------------------------------------------------------ */

// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string | string[];
//   instructions: string;
//   titleLength?: number;
// }

// export async function generateJSONTitleHtml({
//   keywords,
//   instructions,
//   titleLength,
// }: GenerateJSONTitleHtmlArgs): Promise<{ title: string; html: string }> {
//   const keywordArray = Array.isArray(keywords)
//     ? keywords.filter(
//         (kw): kw is string => typeof kw === "string" && kw.trim().length > 0
//       )
//     : [keywords].filter(
//         (kw): kw is string => typeof kw === "string" && kw.trim().length > 0
//       );

//   if (!keywordArray.length) {
//     throw new Error("No keywords provided");
//   }
//   if (!instructions?.trim()) {
//     throw new Error("No instructions provided to LLM.");
//   }

//   const maxTitle =
//     typeof titleLength === "number" &&
//     titleLength > 0 &&
//     titleLength <= 140
//       ? titleLength
//       : 70;

//   let lastError: any = null;

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       if (globalPenaltyMs > 0) {
//         await sleep(Math.min(globalPenaltyMs, 1_500));
//       }

//       const finalPrompt = buildPrompt(
//         keywordArray,
//         instructions,
//         titleLength
//       );
//       const { textJson } = await attemptOnce(finalPrompt);

//       const rawTitle =
//         typeof textJson.title === "string" && textJson.title.trim().length
//           ? textJson.title
//           : keywordArray[0];

//       const title = (rawTitle || keywordArray[0]).trim().slice(0, maxTitle);

//       const html =
//         typeof textJson.html === "string" && textJson.html.trim().length
//           ? textJson.html.trim()
//           : "";

//       if (!html) {
//         throw new Error("LLM returned empty html");
//       }

//       return { title, html };
//     } catch (err: any) {
//       lastError = err;
//       if (isAbortError(err)) throw err;

//       const msg = errMessage(err);
//       dwarn(
//         `Attempt ${attempt + 1} failed; will retry if attempts left. ${msg}`
//       );

//       const backoffBase = isUnstable() ? 1_200 : 600;
//       await sleep(
//         backoffBase + Math.random() * 400 * (attempt + 1)
//       );
//     }
//   }

//   derror(
//     "[LLM] Falling back after retries:",
//     lastError?.message || lastError
//   );

//   // Safe fallback so UI still has something
//   const fallbackTitle = `${keywordArray[0] || "Untitled"} — draft`.slice(
//     0,
//     maxTitle
//   );
//   const fallbackHtml =
//     `<h1>${fallbackTitle}</h1>` +
//     `<p>${instructions.trim().slice(0, 220)}...</p>` +
//     `<ul>${keywordArray.map((kw) => `<li>${kw}</li>`).join("")}</ul>`;

//   return { title: fallbackTitle, html: fallbackHtml };
// }

// /** ------------------------------------------------------------------ */
// /** Anchor helper                                                      */
// /** ------------------------------------------------------------------ */

// export function applyAnchorTokens(
//   html: string,
//   anchors: Array<{ keyword: string; url?: string }>
// ) {
//   let output = html || "";
//   for (const { keyword, url } of anchors) {
//     const token = `[ANCHOR:${keyword}]`;
//     const replacement = url
//       ? `<a href="${url}" target="_blank" rel="nofollow noopener"><strong>${keyword}</strong></a>`
//       : `<strong>${keyword}</strong>`;
//     output = output.replace(token, replacement);
//   }
//   return output;
// }



//           // src/lib/llm/api.ts

// /* ─────────────────────────────────────────────────────────────
//  * Environment + Config (browser + node safe)
//  * ──────────────────────────────────────────────────────────── */

// const isBrowser = typeof window !== "undefined";
// const hasProcess = typeof process !== "undefined";

// function readEnv(key: string): string | undefined {
//   try {
//     if (hasProcess && (process as any).env && (process as any).env[key]) {
//       return (process as any).env[key];
//     }
//   } catch {
//     // ignore
//   }

//   try {
//     if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
//       return (import.meta as any).env[key];
//     }
//   } catch {
//     // ignore
//   }

//   try {
//     if (isBrowser && (window as any)[key]) {
//       return (window as any)[key];
//     }
//   } catch {
//     // ignore
//   }

//   return undefined;
// }

// // IMPORTANT: front-end ke liye PUBLIC key use karo
// const OPENAI_API_KEY =
//   readEnv("NEXT_PUBLIC_OPENAI_API_KEY") ||
//   readEnv("VITE_OPENAI_API_KEY") ||
//   readEnv("OPENAI_API_KEY") || // server-side ke liye
//   "";

// const OPENAI_BASE_URL =
//   readEnv("NEXT_PUBLIC_OPENAI_BASE_URL") ||
//   readEnv("VITE_OPENAI_BASE_URL") ||
//   "https://api.openai.com/v1";

// // Normalize model name - convert any gpt-5.x-mini variants to gpt-5-mini
// function normalizeModelName(model: string | undefined): string {
//   if (!model) return "gpt-5-mini";
//   // Convert gpt-5.0-mini, gpt-5.1-mini, etc. to gpt-5-mini
//   const normalized = model.replace(/^gpt-5\.\d+-mini$/i, "gpt-5-mini");
//   return normalized || "gpt-5-mini";
// }

// const OPENAI_MODEL = normalizeModelName(
//   readEnv("NEXT_PUBLIC_OPENAI_MODEL") ||
//   readEnv("VITE_OPENAI_MODEL") ||
//   "gpt-5-mini"
// ); // Using GPT-5 mini for better quality and AI-free content

// // Debug log to help identify model issues
// if (typeof window !== "undefined") {
//   console.log("[LLM] Using OpenAI model:", OPENAI_MODEL);
// }

// const LLM_API_URL = `${OPENAI_BASE_URL.replace(/\/+$/, "")}/responses`;
// // Increased timeout for GPT-5 models which can take longer, especially with higher token limits
// const TIMEOUT_MS = 120_000; // 2 minutes

// /* ─────────────────────────────────────────────────────────────
//  * Types
//  * ──────────────────────────────────────────────────────────── */

// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string[];       // primary + secondary
//   instructions: string;     // buildPlanFromPrefs se aane wala prompt
//   titleLength: number;      // max title length (chars)
// }

// export interface JSONTitleHtmlResult {
//   title: string;
//   html: string;
// }

// export interface AnchorConfig {
//   keyword: string;
//   url?: string;
// }

// /* ─────────────────────────────────────────────────────────────
//  * Core OpenAI caller (Responses API)
//  * ──────────────────────────────────────────────────────────── */

// async function callOpenAIOnce(body: any): Promise<any> {
//   if (!OPENAI_API_KEY) {
//     throw new Error(
//       "Missing OpenAI API key. Set NEXT_PUBLIC_OPENAI_API_KEY or VITE_OPENAI_API_KEY or OPENAI_API_KEY."
//     );
//   }

//   const controller = new AbortController();
//   const timeout = setTimeout(() => {
//     controller.abort();
//   }, TIMEOUT_MS);

//   try {
//     const res = await fetch(LLM_API_URL, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify(body),
//     });

//     const json = await res.json().catch(() => ({} as any));

//     if (!res.ok) {
//       const msg =
//         json?.error?.message ||
//         json?.message ||
//         `OpenAI API error (status ${res.status})`;
//       throw new Error(msg);
//     }

//     return json;
//   } catch (error: any) {
//     // Handle abort errors with better messaging
//     if (error.name === "AbortError" || error.message?.includes("aborted")) {
//       throw new Error(
//         `Request timeout: The API call took longer than ${TIMEOUT_MS / 1000} seconds. This may happen with longer content. Consider reducing content length or increasing timeout.`
//       );
//     }
//     throw error;
//   } finally {
//     clearTimeout(timeout);
//   }
// }

// /* ─────────────────────────────────────────────────────────────
//  * Helper: extract JSON { title, html } from Responses API
//  * ──────────────────────────────────────────────────────────── */

// function extractTitleHtmlFromResponse(json: any): JSONTitleHtmlResult {
//   if (!json) {
//     throw new Error("Empty response from OpenAI.");
//   }

//   // Log the response structure for debugging
//   if (typeof window !== "undefined") {
//     console.log("[LLM] Response structure:", JSON.stringify(json, null, 2).substring(0, 500));
//   }

//   // Responses API typical shape:
//   // {
//   //   id: "...",
//   //   output: [
//   //     {
//   //       role: "assistant",
//   //       content: [
//   //         { type: "output_text", text: "{ \"title\": \"...\", \"html\": \"...\" }" }
//   //         OR
//   //         { type: "output_struct", output: { title: "...", html: "..." } }
//   //       ]
//   //     }
//   //   ]
//   // }
//   //
//   // Fallbacks for older shapes / compatibility included.

//   let text: string | undefined;
//   let parsed: any = null;

//   // 1) New Responses API: Find message type in output array (not reasoning)
//   if (Array.isArray(json.output) && json.output.length > 0) {
//     // Find the message output (skip reasoning type)
//     const messageOutput = json.output.find((item: any) => item.type === "message");
//     const first = messageOutput || json.output[0]; // Fallback to first if no message found
    
//     const content = first?.content || first?.message?.content || [];

//     if (Array.isArray(content)) {
//       // Check for structured output first (output_struct)
//       const structPart = content.find(
//         (c: any) => c?.type === "output_struct" && c?.output
//       );
      
//       if (structPart && structPart.output) {
//         parsed = structPart.output;
//       } else {
//         // Check for text output
//         const textPart =
//           content.find(
//             (c: any) =>
//               c?.type === "output_text" && typeof c?.text === "string"
//           ) ||
//           content.find((c: any) => typeof c?.text === "string");

//         if (textPart) {
//           text = textPart.text;
//         }
//       }
//     }

//     // Fallback: direct output_text property
//     if (!text && !parsed && typeof first?.output_text === "string") {
//       text = first.output_text;
//     }
//     // Fallback: direct text property
//     if (!text && !parsed && typeof first?.text === "string") {
//       text = first.text;
//     }
//     // Fallback: direct output object (structured)
//     if (!parsed && first?.output && typeof first.output === "object") {
//       parsed = first.output;
//     }
//   }

//   // 2) Fallback: chat/completions style
//   if (!text && !parsed && Array.isArray(json.choices) && json.choices.length > 0) {
//     const ch = json.choices[0];
//     const c = ch.message?.content ?? ch.text;
//     if (typeof c === "string") {
//       text = c;
//     } else if (Array.isArray(c)) {
//       const part = c.find((p: any) => typeof p?.text === "string");
//       if (part) text = part.text;
//     }
//   }

//   // 3) Direct structured output at root level
//   if (!parsed && json.output && typeof json.output === "object" && !Array.isArray(json.output)) {
//     parsed = json.output;
//   }

//   // If we have parsed structured output, use it directly
//   if (parsed && typeof parsed === "object") {
//     let title = String(parsed.title ?? "").trim();
//     let html = String(parsed.html ?? "").trim();

//     if (!title || !html) {
//       throw new Error("Model JSON must contain non-empty 'title' and 'html'.");
//     }

//     // Enforce title length if titleLength was provided in args
//     // Note: titleLength is passed through generateJSONTitleHtml but we need to access it
//     // For now, we'll handle it in the calling function after extraction
    
//     return { title, html };
//   }

//   // Check if response is incomplete
//   if (json.status === "incomplete" && json.incomplete_details?.reason === "max_output_tokens") {
//     console.warn("[LLM] Response incomplete due to max_output_tokens limit. JSON may be truncated.");
//     // Try to extract partial JSON if possible
//     if (text && typeof text === "string") {
//       // Try to fix truncated JSON by finding the last complete object
//       const cleaned = text
//         .trim()
//         .replace(/^```json/i, "")
//         .replace(/^```/, "")
//         .replace(/```$/, "")
//         .trim();
      
//       // Try to find complete JSON object even if truncated
//       let parsedJson: any = null;
//       try {
//         parsedJson = JSON.parse(cleaned);
//       } catch (parseError) {
//         // Try to extract partial JSON by finding last complete brace
//         const lastBrace = cleaned.lastIndexOf("}");
//         if (lastBrace > 0) {
//           const partialJson = cleaned.substring(0, lastBrace + 1);
//           try {
//             parsedJson = JSON.parse(partialJson);
//             console.warn("[LLM] Extracted partial JSON from incomplete response");
//           } catch {
//             // If still fails, throw error about incomplete response
//             throw new Error(
//               `Response incomplete: max_output_tokens limit reached. Increase max_output_tokens or reduce content length. Partial text: ${cleaned.substring(0, 200)}...`
//             );
//           }
//         } else {
//           throw new Error(
//             `Response incomplete: max_output_tokens limit reached. Could not extract valid JSON. Increase max_output_tokens.`
//           );
//         }
//       }
      
//       if (parsedJson && typeof parsedJson === "object") {
//         const title = String(parsedJson.title ?? "").trim();
//         const html = String(parsedJson.html ?? "").trim();
        
//         if (title && html) {
//           return { title, html };
//         }
//       }
//     }
    
//     throw new Error(
//       `Response incomplete: max_output_tokens limit reached. Increase max_output_tokens to allow longer content.`
//     );
//   }

//   // Otherwise, parse from text
//   if (!text || typeof text !== "string") {
//     console.error("[LLM] Full response:", JSON.stringify(json, null, 2));
//     throw new Error("Model response missing textual JSON payload. Check console for response structure.");
//   }

//   // Strip possible code fences
//   const cleaned = text
//     .trim()
//     .replace(/^```json/i, "")
//     .replace(/^```/, "")
//     .replace(/```$/, "")
//     .trim();

//   let parsedJson: any;
//   try {
//     parsedJson = JSON.parse(cleaned);
//   } catch (parseError) {
//     console.error("[LLM] JSON parse error:", parseError);
//     console.error("[LLM] Text that failed to parse:", cleaned.substring(0, 500));
//     throw new Error(
//       `Failed to parse model output as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}. Text preview: ${cleaned.substring(0, 200)}...`
//     );
//   }

//   if (!parsedJson || typeof parsedJson !== "object") {
//     throw new Error("Model JSON output is not an object.");
//   }

//   const title = String(parsedJson.title ?? "").trim();
//   const html = String(parsedJson.html ?? "").trim();

//   if (!title || !html) {
//     throw new Error("Model JSON must contain non-empty 'title' and 'html'.");
//   }

//   return { title, html };
// }

// /* ─────────────────────────────────────────────────────────────
//  * Public: generateJSONTitleHtml
//  * (used by use-content-generation.ts)
//  * ──────────────────────────────────────────────────────────── */

// export async function generateJSONTitleHtml(
//   args: GenerateJSONTitleHtmlArgs
// ): Promise<JSONTitleHtmlResult> {
//   const { keywords, instructions, titleLength } = args;

//   if (!keywords || !keywords.length) {
//     throw new Error("At least one keyword is required.");
//   }

//   const primary = keywords[0];

//   const systemPrompt = [
//     "You are an expert human SEO content writer with years of experience writing engaging, original articles.",
//     "Write content that sounds completely natural and human-written - avoid any AI-like patterns, repetitive phrases, or formulaic structures.",
//     "Use varied sentence lengths, natural transitions, and authentic voice. Write as if you're sharing personal insights and expertise.",
//     'You MUST return ONLY one valid JSON object: { "title": string, "html": string }.',
//     "No markdown, no extra commentary, no code fences.",
//     "The `html` must be well-structured, semantic, properly formatted with correct spacing, and ready to publish.",
//     "Avoid placeholders, lorem ipsum, stub content, or any generic filler text.",
//     "Ensure proper paragraph spacing, readable formatting, and natural word flow throughout."
//   ].join(" ");

//   // Check if instructions contain custom user instructions (from extraInstructions)
//   const hasCustomInstructions = instructions && instructions.includes("CUSTOM USER INSTRUCTIONS - HIGHEST PRIORITY");
  
//   const userPrompt = [
//     `Primary keyword: ${primary}`,
//     keywords.length > 1
//       ? `Secondary keywords: ${keywords.slice(1).join(", ")}`
//       : "",
//     "",
//   ];

//   // If custom instructions are present, add a reminder at the top
//   if (hasCustomInstructions) {
//     userPrompt.push(
//       "⚠️ IMPORTANT: Custom user instructions are included in the prompt below.",
//       "These custom instructions have HIGHEST PRIORITY and should override any conflicting rules.",
//       "",
//     );
//   }

//   userPrompt.push(
//     "CRITICAL REQUIREMENTS FOR HUMAN-LIKE, AI-FREE CONTENT:",
//     `- Write a compelling, natural-sounding SEO title (max ${titleLength} characters) that a real person would write.`,
//     "- Generate a comprehensive HTML article with proper structure (<h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, etc.).",
//     "- Do NOT include <html>, <head>, or <body> wrappers.",
//     "- Write in a natural, conversational style with varied sentence structures - mix short and long sentences.",
//     "- Use natural transitions between paragraphs - avoid formulaic connectors like 'Furthermore', 'Moreover', 'In conclusion'.",
//     "- Include specific examples, real-world scenarios, and practical insights - avoid generic statements.",
//     "- Maintain proper spacing between paragraphs and sections for readability.",
//     "- Use active voice where possible, but vary with passive voice naturally.",
//     "- Write as if you have deep personal knowledge and experience with this topic.",
//     "- Avoid repetitive patterns, overly formal language, or AI-typical phrasing.",
//     "- Ensure every sentence adds value - no filler content.",
//     "- The content must be original, specific, detailed, and genuinely helpful to readers.",
//     "",
//     "FORMATTING REQUIREMENTS:",
//     "- Proper spacing between paragraphs (use <p> tags with natural spacing).",
//     "- Well-structured headings with appropriate hierarchy.",
//     "- Clean, readable HTML with proper indentation in your output.",
//     "",
//     "═══════════════════════════════════════════════════════════════",
//     "DETAILED INSTRUCTIONS (includes custom user preferences if provided):",
//     "═══════════════════════════════════════════════════════════════",
//     instructions || "(none)"
//   );

//   const userPromptText = userPrompt.join("\n");

//   const body = {
//     model: OPENAI_MODEL,
//     input: [
//       {
//         role: "system",
//         content: [
//           {
//             type: "input_text",
//             text: systemPrompt,
//           },
//         ],
//       },
//       {
//         role: "user",
//         content: [
//           {
//             type: "input_text",
//             text: userPromptText,
//           },
//         ],
//       },
//     ],
//     // New Responses API structured output format:
//     text: {
//       format: {
//         type: "json_schema",
//         name: "title_html",
//         schema: {
//           type: "object",
//           properties: {
//             title: { type: "string" },
//             html: { type: "string" },
//           },
//           required: ["title", "html"],
//           additionalProperties: false,
//         },
//       },
//     },
//     max_output_tokens: 8000, // Increased significantly to handle longer content and avoid truncation
//     // GPT-5 mini and GPT-5 models don't support temperature parameter
//     // Only include temperature for models that support it
//     ...(OPENAI_MODEL.startsWith("gpt-5") ? {} : { temperature: 0.65 }),
//   };

//   const json = await callOpenAIOnce(body);
//   const result = extractTitleHtmlFromResponse(json);
  
//   // Enforce title length strictly
//   if (titleLength && result.title.length > titleLength) {
//     result.title = result.title.substring(0, titleLength).trim();
//     // Try to cut at a word boundary if possible
//     const lastSpace = result.title.lastIndexOf(' ');
//     if (lastSpace > titleLength * 0.8) {
//       result.title = result.title.substring(0, lastSpace);
//     }
//   }
  
//   return result;
// }

// /* ─────────────────────────────────────────────────────────────
//  * applyAnchorTokens
//  * Replaces [ANCHOR:keyword] + first occurrences with links
//  * ──────────────────────────────────────────────────────────── */

// export function applyAnchorTokens(html: string, anchors: AnchorConfig[]): string {
//   if (!html || !anchors?.length) return html;

//   let out = html;

//   // 1) Replace explicit [ANCHOR:keyword] markers with proper spacing
//   for (const { keyword, url } of anchors) {
//     if (!keyword) continue;
//     const safeKw = escapeRegExp(keyword);
//     // Match token with optional whitespace around it - capture spaces separately
//     const tokenRe = new RegExp(`(\\s*)\\[ANCHOR:${safeKw}\\](\\s*)`, "g");
    
//     // Check if URL exists, if not use strong tag
//     const replacement = url
//       ? `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(keyword)}</a>`
//       : `<strong>${escapeHtml(keyword)}</strong>`;
    
//     // Replace token, preserving the captured spaces
//     out = out.replace(tokenRe, (_match, spaceBefore, spaceAfter) => {
//       // Preserve the spaces that were around the token
//       // If no space was captured but we're in the middle of text, add a space
//       const before = spaceBefore || ' ';
//       const after = spaceAfter || ' ';
//       return before + replacement + after;
//     });
//   }

//   // 2) Replace first plain-text occurrence if no explicit token used (with proper spacing)
//   for (const { keyword, url } of anchors) {
//     if (!keyword) continue;

//     const kw = keyword.trim();
//     if (!kw) continue;

//     // Skip if already replaced as anchor/strong
//     if (out.includes(`<a href`) && out.includes(escapeHtml(kw)) && out.includes(`</a>`)) {
//       continue;
//     }
//     if (out.includes(`<strong>${escapeHtml(kw)}</strong>`)) {
//       continue;
//     }

//     const replacement = url
//       ? `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(kw)}</a>`
//       : `<strong>${escapeHtml(kw)}</strong>`;

//     // Match keyword with word boundaries to ensure proper spacing
//     const re = new RegExp(`(\\s|^)(${escapeRegExp(kw)})(\\s|$|[.,!?;:])`, "i");
//     let replaced = false;

//     out = out.replace(re, (match, before, _kwMatch, after) => {
//       if (replaced) return match;
//       replaced = true;
//       // Preserve the before/after spacing
//       return before + replacement + (after || ' ');
//     });
//   }

//   return out;
// }

// /* ─────────────────────────────────────────────────────────────
//  * Small helpers
//  * ──────────────────────────────────────────────────────────── */

// function escapeRegExp(s: string): string {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// function escapeHtmlAttr(s: string): string {
//   return String(s)
//     .replace(/&/g, "&amp;")
//     .replace(/"/g, "&quot;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;");
// }

// function escapeHtml(s: string): string {
//   return String(s)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;");
// }



// // src/lib/llm/api.ts

// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string[];
//   instructions: string;
//   titleLength: number;
// }

// export interface JSONTitleHtmlResult {
//   title: string;
//   html: string;
// }

// export interface AnchorConfig {
//   keyword: string;
//   url?: string;
// }

// /* ─────────────────────────────────────────────────────────────
//  * Env helpers
//  * ──────────────────────────────────────────────────────────── */

// const isBrowser = typeof window !== "undefined";
// const hasProcess = typeof process !== "undefined";

// function readEnv(key: string): string | undefined {
//   try {
//     if (hasProcess && (process as any).env && (process as any).env[key]) {
//       return (process as any).env[key];
//     }
//   } catch {
//     // ignore
//   }

//   try {
//     if (
//       typeof import.meta !== "undefined" &&
//       (import.meta as any).env &&
//       (import.meta as any).env[key]
//     ) {
//       return (import.meta as any).env[key];
//     }
//   } catch {
//     // ignore
//   }

//   try {
//     if (isBrowser && (window as any)[key]) {
//       return (window as any)[key];
//     }
//   } catch {
//     // ignore
//   }

//   return undefined;
// }

// const OPENAI_API_KEY =
//   readEnv("NEXT_PUBLIC_OPENAI_API_KEY") ||
//   readEnv("VITE_OPENAI_API_KEY") ||
//   readEnv("OPENAI_API_KEY") ||
//   "";

// const OPENAI_BASE_URL =
//   readEnv("NEXT_PUBLIC_OPENAI_BASE_URL") ||
//   readEnv("VITE_OPENAI_BASE_URL") ||
//   "https://api.openai.com/v1";

// // Normalize model name
// function normalizeModelName(model: string | undefined): string {
//   if (!model) return "gpt-5-mini";
//   const normalized = model.replace(/^gpt-5\.\d+-mini$/i, "gpt-5-mini");
//   return normalized || "gpt-5-mini";
// }

// const OPENAI_MODEL = normalizeModelName(
//   readEnv("NEXT_PUBLIC_OPENAI_MODEL") ||
//     readEnv("VITE_OPENAI_MODEL") ||
//     "gpt-5-mini"
// );

// if (typeof window !== "undefined") {
//   console.log("[LLM] Using OpenAI model:", OPENAI_MODEL);
// }

// const LLM_API_URL = `${OPENAI_BASE_URL.replace(/\/+$/, "")}/responses`;
// const TIMEOUT_MS = 120_000;

// /* ─────────────────────────────────────────────────────────────
//  * Core caller
//  * ──────────────────────────────────────────────────────────── */

// async function callOpenAIOnce(body: any): Promise<any> {
//   if (!OPENAI_API_KEY) {
//     throw new Error(
//       "Missing OpenAI API key. Set NEXT_PUBLIC_OPENAI_API_KEY or VITE_OPENAI_API_KEY or OPENAI_API_KEY."
//     );
//   }

//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

//   try {
//     const res = await fetch(LLM_API_URL, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify(body),
//     });

//     const json = await res.json().catch(() => ({} as any));

//     if (!res.ok) {
//       const msg =
//         json?.error?.message ||
//         json?.message ||
//         `OpenAI API error (status ${res.status})`;
//       throw new Error(msg);
//     }

//     return json;
//   } catch (error: any) {
//     if (error?.name === "AbortError" || error?.message?.includes("aborted")) {
//       throw new Error(
//         `Request timeout: The API call took longer than ${
//           TIMEOUT_MS / 1000
//         } seconds.`
//       );
//     }
//     throw error;
//   } finally {
//     clearTimeout(timeout);
//   }
// }

// /* ─────────────────────────────────────────────────────────────
//  * Extract {title, html}
//  * ──────────────────────────────────────────────────────────── */

// function extractTitleHtmlFromResponse(json: any): JSONTitleHtmlResult {
//   if (!json) throw new Error("Empty response from OpenAI.");

//   let text: string | undefined;
//   let parsed: any = null;

//   // New Responses API style
//   if (Array.isArray(json.output) && json.output.length > 0) {
//     const messageOutput =
//       json.output.find((item: any) => item.type === "message") ||
//       json.output[0];

//     const content =
//       messageOutput?.content ||
//       messageOutput?.message?.content ||
//       [];

//     if (Array.isArray(content)) {
//       const structPart = content.find(
//         (c: any) => c?.type === "output_struct" && c?.output
//       );
//       if (structPart?.output) {
//         parsed = structPart.output;
//       } else {
//         const textPart =
//           content.find(
//             (c: any) =>
//               c?.type === "output_text" && typeof c?.text === "string"
//           ) ||
//           content.find((c: any) => typeof c?.text === "string");
//         if (textPart) {
//           text = textPart.text;
//         }
//       }
//     }

//     if (!text && !parsed && typeof messageOutput?.output_text === "string") {
//       text = messageOutput.output_text;
//     }
//     if (!text && !parsed && typeof messageOutput?.text === "string") {
//       text = messageOutput.text;
//     }
//     if (!parsed && messageOutput?.output && typeof messageOutput.output === "object") {
//       parsed = messageOutput.output;
//     }
//   }

//   // Chat/completions fallback
//   if (!text && !parsed && Array.isArray(json.choices) && json.choices.length) {
//     const ch = json.choices[0];
//     const c = ch.message?.content ?? ch.text;
//     if (typeof c === "string") {
//       text = c;
//     } else if (Array.isArray(c)) {
//       const part = c.find((p: any) => typeof p?.text === "string");
//       if (part) text = part.text;
//     }
//   }

//   // Direct structured
//   if (!parsed && json.output && typeof json.output === "object" && !Array.isArray(json.output)) {
//     parsed = json.output;
//   }

//   if (parsed && typeof parsed === "object") {
//     const title = String(parsed.title ?? "").trim();
//     const html = String(parsed.html ?? "").trim();
//     if (!title || !html) {
//       throw new Error("Model JSON must contain non-empty 'title' and 'html'.");
//     }
//     return { title, html };
//   }

//   if (!text || typeof text !== "string") {
//     console.error("[LLM] Unexpected response:", json);
//     throw new Error("Model response missing textual JSON payload.");
//   }

//   const cleaned = text
//     .trim()
//     .replace(/^```json/i, "")
//     .replace(/^```/, "")
//     .replace(/```$/, "")
//     .trim();

//   let parsedJson: any;
//   try {
//     parsedJson = JSON.parse(cleaned);
//   } catch (err) {
//     console.error("[LLM] JSON parse error:", err);
//     console.error("[LLM] Raw text:", cleaned.slice(0, 400));
//     throw new Error("Failed to parse model output as JSON.");
//   }

//   if (!parsedJson || typeof parsedJson !== "object") {
//     throw new Error("Model JSON output is not an object.");
//   }

//   const title = String(parsedJson.title ?? "").trim();
//   const html = String(parsedJson.html ?? "").trim();
//   if (!title || !html) {
//     throw new Error("Model JSON must contain non-empty 'title' and 'html'.");
//   }

//   return { title, html };
// }

// /* ─────────────────────────────────────────────────────────────
//  * generateJSONTitleHtml
//  * ──────────────────────────────────────────────────────────── */

// export async function generateJSONTitleHtml(
//   args: GenerateJSONTitleHtmlArgs
// ): Promise<JSONTitleHtmlResult> {
//   const { keywords, instructions, titleLength } = args;

//   if (!keywords || !keywords.length) {
//     throw new Error("At least one keyword is required.");
//   }

//   const primary = keywords[0];

//   const systemPrompt = [
//     "You are an expert human SEO content writer with years of experience.",
//     "Write content that sounds completely natural and human-written.",
//     "Avoid AI-like patterns, templates, and repetitive phrasing.",
//     'You MUST return ONLY one valid JSON object: { "title": string, "html": string }.',
//     "No markdown, no commentary, no code fences.",
//     "The `html` must be semantic, clean, and ready-to-publish.",
//   ].join(" ");

//   const userLines: string[] = [];

//   userLines.push(`Primary keyword: ${primary}`);
//   if (keywords.length > 1) {
//     userLines.push(`Secondary keywords: ${keywords.slice(1).join(", ")}`);
//   }

//   userLines.push(
//     "",
//     "CRITICAL REQUIREMENTS:",
//     `- Title: human, compelling, max ${titleLength} characters.`,
//     "- HTML only (no <html>/<body> wrapper).",
//     "- Natural sentence rhythm; avoid 'In conclusion', 'Moreover', etc.",
//     "- Use concrete, specific detail. No fluff.",
//     "- All instructions below MUST be followed strictly.",
//     "",
//     "═══════════════════════════════════════════════════════════════",
//     "DETAILED INSTRUCTIONS (user/site prefs):",
//     "═══════════════════════════════════════════════════════════════",
//     instructions || "(none)"
//   );

//   const body = {
//     model: OPENAI_MODEL,
//     input: [
//       {
//         role: "system",
//         content: [
//           {
//             type: "input_text",
//             text: systemPrompt,
//           },
//         ],
//       },
//       {
//         role: "user",
//         content: [
//           {
//             type: "input_text",
//             text: userLines.join("\n"),
//           },
//         ],
//       },
//     ],
//     text: {
//       format: {
//         type: "json_schema",
//         name: "title_html",
//         schema: {
//           type: "object",
//           properties: {
//             title: { type: "string" },
//             html: { type: "string" },
//           },
//           required: ["title", "html"],
//           additionalProperties: false,
//         },
//       },
//     },
//     max_output_tokens: 8000,
//     ...(OPENAI_MODEL.startsWith("gpt-5") ? {} : { temperature: 0.65 }),
//   };

//   const json = await callOpenAIOnce(body);
//   const result = extractTitleHtmlFromResponse(json);

//   if (titleLength && result.title.length > titleLength) {
//     let t = result.title.slice(0, titleLength).trim();
//     const lastSpace = t.lastIndexOf(" ");
//     if (lastSpace > titleLength * 0.6) {
//       t = t.slice(0, lastSpace);
//     }
//     result.title = t;
//   }

//   return result;
// }

// /* ─────────────────────────────────────────────────────────────
//  * applyAnchorTokens
//  * ──────────────────────────────────────────────────────────── */

// export function applyAnchorTokens(html: string, anchors: AnchorConfig[]): string {
//   if (!html || !anchors?.length) return html;

//   let out = html;

//   // 1) Replace explicit [ANCHOR:keyword] markers
//   for (const { keyword, url } of anchors) {
//     if (!keyword) continue;
//     const safeKw = escapeRegExp(keyword);
//     const tokenRe = new RegExp(`(\\s*)\\[ANCHOR:${safeKw}\\](\\s*)`, "g");

//     const replacement = url
//       ? `<a href="${escapeHtmlAttr(
//           url
//         )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
//           keyword
//         )}</a>`
//       : `<strong>${escapeHtml(keyword)}</strong>`;

//     out = out.replace(tokenRe, (_m, before, after) => {
//       const b = typeof before === "string" ? before : " ";
//       const a = typeof after === "string" ? after : " ";
//       return `${b}${replacement}${a}`;
//     });
//   }

//   // 2) For each keyword, if not already linked/strong, link first plain occurrence
//   for (const { keyword, url } of anchors) {
//     if (!keyword) continue;
//     const kw = keyword.trim();
//     if (!kw) continue;

//     const kwEsc = escapeHtml(kw);

//     // Check if this exact keyword already hyper/strong
//     const hasAnchorForKw = new RegExp(
//       `<a[^>]*>\\s*${kwEsc}\\s*<\\/a>`,
//       "i"
//     ).test(out);
//     const hasStrongForKw = new RegExp(
//       `<strong>\\s*${kwEsc}\\s*<\\/strong>`,
//       "i"
//     ).test(out);

//     // ✅ Fix: only skip if THIS keyword already wrapped
//     if (hasAnchorForKw || hasStrongForKw) {
//       continue;
//     }

//     const replacement = url
//       ? `<a href="${escapeHtmlAttr(
//           url
//         )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
//           kw
//         )}</a>`
//       : `<strong>${escapeHtml(kw)}</strong>`;

//     const re = new RegExp(`\\b${escapeRegExp(kw)}\\b`);
//     let replaced = false;

//     out = out.replace(re, (match) => {
//       if (replaced) return match;
//       replaced = true;
//       return replacement;
//     });
//   }

//   return out;
// }

// /* ─────────────────────────────────────────────────────────────
//  * Helpers
//  * ──────────────────────────────────────────────────────────── */

// function escapeRegExp(s: string): string {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// function escapeHtmlAttr(s: string): string {
//   return String(s)
//     .replace(/&/g, "&amp;")
//     .replace(/"/g, "&quot;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;");
// }

// function escapeHtml(s: string): string {
//   return String(s)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;");
// }


// export interface GenerateJSONTitleHtmlArgs {
//   keywords: string[];
//   instructions: string;
//   titleLength: number;
// }

// export interface JSONTitleHtmlResult {
//   title: string;
//   html: string;
// }

// export interface AnchorConfig {
//   keyword: string;
//   url?: string;
// }

// /* ─────────────────────────────────────────────────────────────
//  * Env helpers
//  * ──────────────────────────────────────────────────────────── */

// const isBrowser = typeof window !== "undefined";
// const hasProcess = typeof process !== "undefined";

// function readEnv(key: string): string | undefined {
//   try {
//     if (hasProcess && (process as any).env && (process as any).env[key]) {
//       return (process as any).env[key];
//     }
//   } catch {
//     // ignore
//   }

//   try {
//     if (
//       typeof import.meta !== "undefined" &&
//       (import.meta as any).env &&
//       (import.meta as any).env[key]
//     ) {
//       return (import.meta as any).env[key];
//     }
//   } catch {
//     // ignore
//   }

//   try {
//     if (isBrowser && (window as any)[key]) {
//       return (window as any)[key];
//     }
//   } catch {
//     // ignore
//   }

//   return undefined;
// }

// const OPENAI_API_KEY =
//   readEnv("NEXT_PUBLIC_OPENAI_API_KEY") ||
//   readEnv("VITE_OPENAI_API_KEY") ||
//   readEnv("OPENAI_API_KEY") ||
//   "";

// const OPENAI_BASE_URL =
//   readEnv("NEXT_PUBLIC_OPENAI_BASE_URL") ||
//   readEnv("VITE_OPENAI_BASE_URL") ||
//   "https://api.openai.com/v1";

// // Normalize model name
// function normalizeModelName(model: string | undefined): string {
//   if (!model) return "gpt-5-mini";
//   const normalized = model.replace(/^gpt-5\.\d+-mini$/i, "gpt-5-mini");
//   return normalized || "gpt-5-mini";
// }

// const OPENAI_MODEL = normalizeModelName(
//   readEnv("NEXT_PUBLIC_OPENAI_MODEL") ||
//     readEnv("VITE_OPENAI_MODEL") ||
//     "gpt-5-mini"
// );

// if (typeof window !== "undefined") {
//   console.log("[LLM] Using OpenAI model:", OPENAI_MODEL);
// }

// const LLM_API_URL = `${OPENAI_BASE_URL.replace(/\/+$/, "")}/responses`;
// const TIMEOUT_MS = 120_000;

// /* ─────────────────────────────────────────────────────────────
//  * Core caller
//  * ──────────────────────────────────────────────────────────── */

// async function callOpenAIOnce(body: any): Promise<any> {
//   if (!OPENAI_API_KEY) {
//     throw new Error(
//       "Missing OpenAI API key. Set NEXT_PUBLIC_OPENAI_API_KEY or VITE_OPENAI_API_KEY or OPENAI_API_KEY."
//     );
//   }

//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

//   try {
//     const res = await fetch(LLM_API_URL, {
//       method: "POST",
//       signal: controller.signal,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify(body),
//     });

//     const json = await res.json().catch(() => ({} as any));

//     if (!res.ok) {
//       const msg =
//         json?.error?.message ||
//         json?.message ||
//         `OpenAI API error (status ${res.status})`;
//       throw new Error(msg);
//     }

//     return json;
//   } catch (error: any) {
//     if (error?.name === "AbortError" || error?.message?.includes("aborted")) {
//       throw new Error(
//         `Request timeout: The API call took longer than ${
//           TIMEOUT_MS / 1000
//         } seconds.`
//       );
//     }
//     throw error;
//   } finally {
//     clearTimeout(timeout);
//   }
// }

// /* ─────────────────────────────────────────────────────────────
//  * Extract {title, html}
//  * ──────────────────────────────────────────────────────────── */

// function extractTitleHtmlFromResponse(json: any): JSONTitleHtmlResult {
//   if (!json) throw new Error("Empty response from OpenAI.");

//   let text: string | undefined;
//   let parsed: any = null;

//   // New Responses API style
//   if (Array.isArray(json.output) && json.output.length > 0) {
//     const messageOutput =
//       json.output.find((item: any) => item.type === "message") ||
//       json.output[0];

//     const content =
//       messageOutput?.content ||
//       messageOutput?.message?.content ||
//       [];

//     if (Array.isArray(content)) {
//       const structPart = content.find(
//         (c: any) => c?.type === "output_struct" && c?.output
//       );
//       if (structPart?.output) {
//         parsed = structPart.output;
//       } else {
//         const textPart =
//           content.find(
//             (c: any) =>
//               c?.type === "output_text" && typeof c?.text === "string"
//           ) ||
//           content.find((c: any) => typeof c?.text === "string");
//         if (textPart) {
//           text = textPart.text;
//         }
//       }
//     }

//     if (!text && !parsed && typeof messageOutput?.output_text === "string") {
//       text = messageOutput.output_text;
//     }
//     if (!text && !parsed && typeof messageOutput?.text === "string") {
//       text = messageOutput.text;
//     }
//     if (
//       !parsed &&
//       messageOutput?.output &&
//       typeof messageOutput.output === "object"
//     ) {
//       parsed = messageOutput.output;
//     }
//   }

//   // Chat/completions fallback
//   if (!text && !parsed && Array.isArray(json.choices) && json.choices.length) {
//     const ch = json.choices[0];
//     const c = ch.message?.content ?? ch.text;
//     if (typeof c === "string") {
//       text = c;
//     } else if (Array.isArray(c)) {
//       const part = c.find((p: any) => typeof p?.text === "string");
//       if (part) text = part.text;
//     }
//   }

//   // Direct structured
//   if (!parsed && json.output && typeof json.output === "object" && !Array.isArray(json.output)) {
//     parsed = json.output;
//   }

//   if (parsed && typeof parsed === "object") {
//     const title = String(parsed.title ?? "").trim();
//     const html = String(parsed.html ?? "").trim();
//     if (!title || !html) {
//       throw new Error("Model JSON must contain non-empty 'title' and 'html'.");
//     }
//     return { title, html };
//   }

//   if (!text || typeof text !== "string") {
//     console.error("[LLM] Unexpected response:", json);
//     throw new Error("Model response missing textual JSON payload.");
//   }

//   const cleaned = text
//     .trim()
//     .replace(/^```json/i, "")
//     .replace(/^```/, "")
//     .replace(/```$/, "")
//     .trim();

//   let parsedJson: any;
//   try {
//     parsedJson = JSON.parse(cleaned);
//   } catch (err) {
//     console.error("[LLM] JSON parse error:", err);
//     console.error("[LLM] Raw text:", cleaned.slice(0, 400));
//     throw new Error("Failed to parse model output as JSON.");
//   }

//   if (!parsedJson || typeof parsedJson !== "object") {
//     throw new Error("Model JSON output is not an object.");
//   }

//   const title = String(parsedJson.title ?? "").trim();
//   const html = String(parsedJson.html ?? "").trim();
//   if (!title || !html) {
//     throw new Error("Model JSON must contain non-empty 'title' and 'html'.");
//   }

//   return { title, html };
// }

// /* ─────────────────────────────────────────────────────────────
//  * generateJSONTitleHtml
//  * ──────────────────────────────────────────────────────────── */

// export async function generateJSONTitleHtml(
//   args: GenerateJSONTitleHtmlArgs
// ): Promise<JSONTitleHtmlResult> {
//   const { keywords, instructions, titleLength } = args;

//   if (!keywords || !keywords.length) {
//     throw new Error("At least one keyword is required.");
//   }

//   const primary = keywords[0];

//   const systemPrompt = [
//     "You are an expert human SEO content writer with years of experience.",
//     "Write content that sounds completely natural and human-written.",
//     "Avoid AI-like patterns, templates, and repetitive phrasing.",
//     'You MUST return ONLY one valid JSON object: { "title": string, "html": string }.',
//     "No markdown, no commentary, no code fences.",
//     "The `html` must be semantic, clean, and ready-to-publish.",
//   ].join(" ");

//   const userLines: string[] = [];

//   userLines.push(`Primary keyword: ${primary}`);
//   if (keywords.length > 1) {
//     userLines.push(`Secondary keywords: ${keywords.slice(1).join(", ")}`);
//   }

//   userLines.push(
//     "",
//     "CRITICAL REQUIREMENTS:",
//     `- Title: human, compelling, max ${titleLength} characters.`,
//     "- HTML only (no <html>/<body> wrapper).",
//     "- Natural sentence rhythm; avoid 'In conclusion', 'Moreover', etc.",
//     "- Use concrete, specific detail. No fluff.",
//     "- All instructions below MUST be followed strictly.",
//     "",
//     "═══════════════════════════════════════════════════════════════",
//     "DETAILED INSTRUCTIONS (user/site prefs):",
//     "═══════════════════════════════════════════════════════════════",
//     instructions || "(none)"
//   );

//   const body = {
//     model: OPENAI_MODEL,
//     input: [
//       {
//         role: "system",
//         content: [
//           {
//             type: "input_text",
//             text: systemPrompt,
//           },
//         ],
//       },
//       {
//         role: "user",
//         content: [
//           {
//             type: "input_text",
//             text: userLines.join("\n"),
//           },
//         ],
//       },
//     ],
//     text: {
//       format: {
//         type: "json_schema",
//         name: "title_html",
//         schema: {
//           type: "object",
//           properties: {
//             title: { type: "string" },
//             html: { type: "string" },
//           },
//           required: ["title", "html"],
//           additionalProperties: false,
//         },
//       },
//     },
//     max_output_tokens: 8000,
//     ...(OPENAI_MODEL.startsWith("gpt-5") ? {} : { temperature: 0.65 }),
//   };

//   const json = await callOpenAIOnce(body);
//   const result = extractTitleHtmlFromResponse(json);

//   if (titleLength && result.title.length > titleLength) {
//     let t = result.title.slice(0, titleLength).trim();
//     const lastSpace = t.lastIndexOf(" ");
//     if (lastSpace > titleLength * 0.6) {
//       t = t.slice(0, lastSpace);
//     }
//     result.title = t;
//   }

//   return result;
// }

// /* ─────────────────────────────────────────────────────────────
//  * applyAnchorTokens (FINAL)
//  * - [ANCHOR:kw] → <a>/<strong> (SSR + browser)
//  * - For URL: must create real <a>, <strong> alone is NOT enough
//  * - For no URL: create <strong>
//  * - Skips auto-linking in obviously bad containers in browser path
//  * ──────────────────────────────────────────────────────────── */

// export function applyAnchorTokens(html: string, anchors: AnchorConfig[]): string {
//   if (!html || !anchors?.length) return html;

//   // Normalize + dedupe
//   const normalized: AnchorConfig[] = [];
//   const seen = new Set<string>();
//   for (const a of anchors) {
//     if (!a || !a.keyword) continue;
//     const kw = String(a.keyword).trim();
//     if (!kw) continue;
//     const key = kw.toLowerCase();
//     if (seen.has(key)) continue;
//     seen.add(key);
//     normalized.push({ keyword: kw, url: a.url || undefined });
//   }
//   if (!normalized.length) return html;

//   const ordered = [...normalized].sort(
//     (a, b) => b.keyword.length - a.keyword.length
//   );

//   // ── Text-only fallback (SSR / no DOM) ──────────────────────
//   const applyTextFallback = (inputHtml: string): string => {
//     let out = inputHtml;

//     // 1) Replace explicit [ANCHOR:kw]
//     for (const { keyword, url } of ordered) {
//       const safeKw = escapeRegExp(keyword);
//       const tokenRe = new RegExp(`(\\s*)\\[ANCHOR:${safeKw}\\](\\s*)`, "gi");

//       const replacement = url
//         ? `<a href="${escapeHtmlAttr(
//             url
//           )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
//             keyword
//           )}</a>`
//         : `<strong>${escapeHtml(keyword)}</strong>`;

//       out = out.replace(tokenRe, (_m, before, after) => {
//         const b = typeof before === "string" ? before : " ";
//         const a = typeof after === "string" ? after : " ";
//         return `${b}${replacement}${a}`;
//       });
//     }

//     // 2) Ensure each keyword gets at least one link/strong
//     for (const { keyword, url } of ordered) {
//       const kwLower = keyword.toLowerCase();
//       const safeLower = escapeRegExp(kwLower);

//       const hasAnchor = new RegExp(
//         `<a[^>]*>\\s*${safeLower}\\s*<\\/a>`,
//         "i"
//       ).test(out);
//       const hasStrong = new RegExp(
//         `<strong[^>]*>\\s*${safeLower}\\s*<\\/strong>`,
//         "i"
//       ).test(out);

//       if (url) {
//         if (hasAnchor) continue;

//         if (hasStrong) {
//           const strongRe = new RegExp(
//             `<strong[^>]*>\\s*${safeLower}\\s*<\\/strong>`,
//             "i"
//           );
//           out = out.replace(
//             strongRe,
//             `<a href="${escapeHtmlAttr(
//               url
//             )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
//               keyword
//             )}</a>`
//           );
//           continue;
//         }

//         const plainRe = new RegExp(
//           `\\b${escapeRegExp(keyword)}\\b`,
//           "i"
//         );
//         let replaced = false;
//         out = out.replace(plainRe, (m) => {
//           if (replaced) return m;
//           replaced = true;
//           return `<a href="${escapeHtmlAttr(
//             url
//           )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
//             m
//           )}</a>`;
//         });
//       } else {
//         if (hasAnchor || hasStrong) continue;

//         const plainRe = new RegExp(
//           `\\b${escapeRegExp(keyword)}\\b`,
//           "i"
//         );
//         let replaced = false;
//         out = out.replace(plainRe, (m) => {
//           if (replaced) return m;
//           replaced = true;
//           return `<strong>${escapeHtml(m)}</strong>`;
//         });
//       }
//     }

//     return out.replace(/\[ANCHOR:[^\]]+]/g, "");
//   };

//   if (typeof DOMParser === "undefined" || typeof document === "undefined") {
//     return applyTextFallback(html);
//   }

//   // ── Browser DOM-aware implementation ───────────────────────
//   try {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(
//       `<div id="__anchor_wrap__">${html}</div>`,
//       "text/html"
//     );
//     const container = doc.getElementById("__anchor_wrap__");
//     if (!container) return applyTextFallback(html);

//     const forbiddenParents = new Set([
//       "script",
//       "style",
//       "button",
//       "label",
//       "svg",
//     ]);

//     // STEP 1: Replace [ANCHOR:kw] tokens
//     for (const { keyword, url } of ordered) {
//       const token = `[ANCHOR:${keyword}]`;
//       if (!keyword) continue;

//       const walker = doc.createTreeWalker(
//         container,
//         NodeFilter.SHOW_TEXT,
//         null
//       );

//       while (walker.nextNode()) {
//         const node = walker.currentNode as Text;
//         const text = node.nodeValue || "";
//         const idx = text.indexOf(token);
//         if (idx === -1) continue;

//         const parent = node.parentElement;
//         const tag = parent?.tagName.toLowerCase();
//         if (tag && (tag === "script" || tag === "style")) continue;

//         const before = text.slice(0, idx);
//         const after = text.slice(idx + token.length);

//         const frag = doc.createDocumentFragment();
//         if (before) frag.appendChild(doc.createTextNode(before));

//         if (url) {
//           const a = doc.createElement("a");
//           a.setAttribute("href", url);
//           a.setAttribute("target", "_blank");
//           a.setAttribute("rel", "noopener noreferrer");
//           a.textContent = keyword;
//           frag.appendChild(a);
//         } else {
//           const strong = doc.createElement("strong");
//           strong.textContent = keyword;
//           frag.appendChild(strong);
//         }

//         if (after) frag.appendChild(doc.createTextNode(after));
//         node.parentNode?.replaceChild(frag, node);
//       }
//     }

//     // STEP 1b: Upgrade <strong> → <a> when URL exists but no link yet
//     for (const { keyword, url } of ordered) {
//       if (!url) continue;
//       const kwLower = keyword.toLowerCase();

//       let hasAnchor = false;
//       const links = container.querySelectorAll("a");
//       for (const el of Array.from(links)) {
//         if ((el.textContent || "").trim().toLowerCase() === kwLower) {
//           hasAnchor = true;
//           break;
//         }
//       }
//       if (hasAnchor) continue;

//       const strongs = container.querySelectorAll("strong");
//       for (const el of Array.from(strongs)) {
//         if ((el.textContent || "").trim().toLowerCase() === kwLower) {
//           const a = doc.createElement("a");
//           a.setAttribute("href", url);
//           a.setAttribute("target", "_blank");
//           a.setAttribute("rel", "noopener noreferrer");
//           a.textContent = el.textContent || keyword;
//           el.parentNode?.replaceChild(a, el);
//           hasAnchor = true;
//           break;
//         }
//       }
//     }

//     // Helper: does this keyword already have what it needs?
//     const hasLinked = (kw: string, url?: string): boolean => {
//       const kwLower = kw.toLowerCase();
//       if (url) {
//         const links = container.querySelectorAll("a");
//         for (const el of Array.from(links)) {
//           if ((el.textContent || "").trim().toLowerCase() === kwLower) {
//             return true;
//           }
//         }
//         return false;
//       } else {
//         const els = container.querySelectorAll("a, strong");
//         for (const el of Array.from(els)) {
//           if ((el.textContent || "").trim().toLowerCase() === kwLower) {
//             return true;
//           }
//         }
//         return false;
//       }
//     };

//     // STEP 2: If still not linked, link first safe plain occurrence
//     for (const { keyword, url } of ordered) {
//       if (!keyword) continue;
//       if (hasLinked(keyword, url)) continue;

//       const kw = keyword;
//       const re = new RegExp(
//         `\\b${escapeRegExp(kw)}\\b`,
//         "i"
//       );

//       const walker = doc.createTreeWalker(
//         container,
//         NodeFilter.SHOW_TEXT,
//         {
//           acceptNode(node: Node) {
//             const text = node.nodeValue || "";
//             if (!text.trim()) return NodeFilter.FILTER_REJECT;

//             const parent = node.parentElement;
//             if (!parent) return NodeFilter.FILTER_ACCEPT;

//             const tag = parent.tagName.toLowerCase();
//             if (
//               tag === "a" ||
//               tag === "strong" ||
//               tag === "script" ||
//               tag === "style" ||
//               tag === "ul" ||
//               tag === "ol" ||
//               tag === "li" ||
//               tag === "table" ||
//               tag === "thead" ||
//               tag === "tbody" ||
//               tag === "tfoot" ||
//               tag === "tr" ||
//               tag === "td" ||
//               tag === "th"
//             ) {
//               return NodeFilter.FILTER_REJECT;
//             }

//             return NodeFilter.FILTER_ACCEPT;
//           },
//         } as any
//       );

//       let replaced = false;

//       while (!replaced && walker.nextNode()) {
//         const node = walker.currentNode as Text;
//         const text = node.nodeValue || "";
//         const m = re.exec(text);
//         if (!m || m.index === undefined) continue;

//         const matchIndex = m.index;
//         const before = text.slice(0, matchIndex);
//         const matched = m[0];
//         const after = text.slice(matchIndex + matched.length);

//         const frag = doc.createDocumentFragment();
//         if (before) frag.appendChild(doc.createTextNode(before));

//         if (url) {
//           const a = doc.createElement("a");
//           a.setAttribute("href", url);
//           a.setAttribute("target", "_blank");
//           a.setAttribute("rel", "noopener noreferrer");
//           a.textContent = matched;
//           frag.appendChild(a);
//         } else {
//           const strong = doc.createElement("strong");
//           strong.textContent = matched;
//           frag.appendChild(strong);
//         }

//         if (after) frag.appendChild(doc.createTextNode(after));
//         node.parentNode?.replaceChild(frag, node);
//         replaced = true;
//       }
//     }

//     const out = container.innerHTML.replace(/\[ANCHOR:[^\]]+]/g, "");
//     return out;
//   } catch (err) {
//     console.error("[applyAnchorTokens] DOM path failed:", err);
//     return applyTextFallback(html);
//   }
// }

// /* ─────────────────────────────────────────────────────────────
//  * Helpers
//  * ──────────────────────────────────────────────────────────── */

// function escapeRegExp(s: string): string {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// function escapeHtmlAttr(s: string): string {
//   return String(s)
//     .replace(/&/g, "&amp;")
//     .replace(/"/g, "&quot;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;");
// }

// function escapeHtml(s: string): string {
//   return String(s)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;");
// }





// src/lib/llm/api.ts

export interface GenerateJSONTitleHtmlArgs {
  keywords: string[];
  instructions: string;
  titleLength: number;
}

export interface JSONTitleHtmlResult {
  title: string;
  html: string;
}

export interface AnchorConfig {
  keyword: string;
  url?: string;
}

/* ─────────────────────────────────────────────────────────────
 * Env helpers
 * ──────────────────────────────────────────────────────────── */

const isBrowser = typeof window !== "undefined";
const hasProcess = typeof process !== "undefined";

function readEnv(key: string): string | undefined {
  try {
    if (hasProcess && (process as any).env && (process as any).env[key]) {
      return (process as any).env[key];
    }
  } catch {
    // ignore
  }

  try {
    if (
      typeof import.meta !== "undefined" &&
      (import.meta as any).env &&
      (import.meta as any).env[key]
    ) {
      return (import.meta as any).env[key];
    }
  } catch {
    // ignore
  }

  try {
    if (isBrowser && (window as any)[key]) {
      return (window as any)[key];
    }
  } catch {
    // ignore
  }

  return undefined;
}
// ⚠️ CLIENT-SIDE (INSECURE) VERSION — use only for testing
const OPENAI_API_KEY =
  readEnv("VITE_OPENAI_API_KEY") ||
  readEnv("NEXT_PUBLIC_OPENAI_API_KEY") ||
  "";



const OPENAI_BASE_URL =
  readEnv("NEXT_PUBLIC_OPENAI_BASE_URL") ||
  readEnv("VITE_OPENAI_BASE_URL") ||
  "https://api.openai.com/v1";

function normalizeModelName(model: string | undefined): string {
  if (!model) return "gpt-5-mini";
  const normalized = model.replace(/^gpt-5\.\d+-mini$/i, "gpt-5-mini");
  return normalized || "gpt-5-mini";
}

const OPENAI_MODEL = normalizeModelName(
  readEnv("NEXT_PUBLIC_OPENAI_MODEL") ||
    readEnv("VITE_OPENAI_MODEL") ||
    "gpt-5-mini"
);

if (typeof window !== "undefined") {
  console.log("[LLM] Using OpenAI model:", OPENAI_MODEL);
}

const LLM_API_URL = `${OPENAI_BASE_URL.replace(/\/+$/, "")}/responses`;
const TIMEOUT_MS = 120_000;

/* ─────────────────────────────────────────────────────────────
 * Core caller
 * ──────────────────────────────────────────────────────────── */

async function callOpenAIOnce(body: any): Promise<any> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "Missing OpenAI API key. Set NEXT_PUBLIC_OPENAI_API_KEY or VITE_OPENAI_API_KEY or OPENAI_API_KEY."
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(LLM_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      const msg =
        json?.error?.message ||
        json?.message ||
        `OpenAI API error (status ${res.status})`;
      throw new Error(msg);
    }

    return json;
  } catch (error: any) {
    if (error?.name === "AbortError" || error?.message?.includes("aborted")) {
      throw new Error(
        `Request timeout: The API call took longer than ${
          TIMEOUT_MS / 1000
        } seconds.`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/* ─────────────────────────────────────────────────────────────
 * Extract {title, html}
 * ──────────────────────────────────────────────────────────── */

function extractTitleHtmlFromResponse(json: any): JSONTitleHtmlResult {
  if (!json) throw new Error("Empty response from OpenAI.");

  let text: string | undefined;
  let parsed: any = null;

  // New Responses API style
  if (Array.isArray(json.output) && json.output.length > 0) {
    const messageOutput =
      json.output.find((item: any) => item.type === "message") ||
      json.output[0];

    const content =
      messageOutput?.content ||
      messageOutput?.message?.content ||
      [];

    if (Array.isArray(content)) {
      const structPart = content.find(
        (c: any) => c?.type === "output_struct" && c?.output
      );
      if (structPart?.output) {
        parsed = structPart.output;
      } else {
        const textPart =
          content.find(
            (c: any) =>
              c?.type === "output_text" && typeof c?.text === "string"
          ) ||
          content.find((c: any) => typeof c?.text === "string");
        if (textPart) {
          text = textPart.text;
        }
      }
    }

    if (!text && !parsed && typeof messageOutput?.output_text === "string") {
      text = messageOutput.output_text;
    }
    if (!text && !parsed && typeof messageOutput?.text === "string") {
      text = messageOutput.text;
    }
    if (
      !parsed &&
      messageOutput?.output &&
      typeof messageOutput.output === "object"
    ) {
      parsed = messageOutput.output;
    }
  }

  // Chat/completions fallback
  if (!text && !parsed && Array.isArray(json.choices) && json.choices.length) {
    const ch = json.choices[0];
    const c = ch.message?.content ?? ch.text;
    if (typeof c === "string") {
      text = c;
    } else if (Array.isArray(c)) {
      const part = c.find((p: any) => typeof p?.text === "string");
      if (part) text = part.text;
    }
  }

  // Direct structured
  if (!parsed && json.output && typeof json.output === "object" && !Array.isArray(json.output)) {
    parsed = json.output;
  }

  if (parsed && typeof parsed === "object") {
    const title = String(parsed.title ?? "").trim();
    const html = String(parsed.html ?? "").trim();
    if (!title || !html) {
      throw new Error("Model JSON must contain non-empty 'title' and 'html'.");
    }
    return { title, html };
  }

  if (!text || typeof text !== "string") {
    console.error("[LLM] Unexpected response:", json);
    throw new Error("Model response missing textual JSON payload.");
  }

  const cleaned = text
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch (err) {
    console.error("[LLM] JSON parse error:", err);
    console.error("[LLM] Raw text:", cleaned.slice(0, 400));
    throw new Error("Failed to parse model output as JSON.");
  }

  if (!parsedJson || typeof parsedJson !== "object") {
    throw new Error("Model JSON output is not an object.");
  }

  const title = String(parsedJson.title ?? "").trim();
  const html = String(parsedJson.html ?? "").trim();
  if (!title || !html) {
    throw new Error("Model JSON must contain non-empty 'title' and 'html'.");
  }

  return { title, html };
}

/* ─────────────────────────────────────────────────────────────
 * generateJSONTitleHtml
 * ──────────────────────────────────────────────────────────── */

export async function generateJSONTitleHtml(
  args: GenerateJSONTitleHtmlArgs
): Promise<JSONTitleHtmlResult> {
  const { keywords, instructions, titleLength } = args;

  if (!keywords || !keywords.length) {
    throw new Error("At least one keyword is required.");
  }

  const primary = keywords[0];

  const systemPrompt = [
    "You are an expert human SEO content writer with years of experience.",
    "Write content that sounds completely natural and human-written.",
    "Avoid AI-like patterns, templates, and repetitive phrasing.",
    'You MUST return ONLY one valid JSON object: { "title": string, "html": string }.',
    "No markdown, no commentary, no code fences.",
    "The `html` must be semantic, clean, and ready-to-publish.",
  ].join(" ");

  const userLines: string[] = [];

  userLines.push(`Primary keyword: ${primary}`);
  if (keywords.length > 1) {
    userLines.push(`Secondary keywords: ${keywords.slice(1).join(", ")}`);
  }

  userLines.push(
    "",
    "CRITICAL REQUIREMENTS:",
    `- Title: human, compelling, max ${titleLength} characters.`,
    "- HTML only (no <html>/<body> wrapper).",
    "- Natural sentence rhythm; avoid 'In conclusion', 'Moreover', etc.",
    "- Use concrete, specific detail. No fluff.",
    "- All instructions below MUST be followed strictly.",
    "",
    "═══════════════════════════════════════════════════════════════",
    "DETAILED INSTRUCTIONS (user/site prefs):",
    "═══════════════════════════════════════════════════════════════",
    instructions || "(none)"
  );

  const body = {
    model: OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: systemPrompt,
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: userLines.join("\n"),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "title_html",
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            html: { type: "string" },
          },
          required: ["title", "html"],
          additionalProperties: false,
        },
      },
    },
    max_output_tokens: 8000,
    ...(OPENAI_MODEL.startsWith("gpt-5") ? {} : { temperature: 0.65 }),
  };

  const json = await callOpenAIOnce(body);
  const result = extractTitleHtmlFromResponse(json);

  if (titleLength && result.title.length > titleLength) {
    let t = result.title.slice(0, titleLength).trim();
    const lastSpace = t.lastIndexOf(" ");
    if (lastSpace > titleLength * 0.6) {
      t = t.slice(0, lastSpace);
    }
    result.title = t;
  }

  return result;
}

/* ─────────────────────────────────────────────────────────────
 * applyAnchorTokens
 * - [ANCHOR:kw] → <a>/<strong>
 * - For URL: real <a href=...>
 * - For no URL: <strong>
 * - Ensure at least one correct link per keyword
 * ──────────────────────────────────────────────────────────── */

export function applyAnchorTokens(html: string, anchors: AnchorConfig[]): string {
  if (!html || !anchors?.length) return html;

  // Normalize + dedupe
  const normalized: AnchorConfig[] = [];
  const seen = new Set<string>();
  for (const a of anchors) {
    if (!a || !a.keyword) continue;
    const kw = String(a.keyword).trim();
    if (!kw) continue;
    const key = kw.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({ keyword: kw, url: a.url || undefined });
  }
  if (!normalized.length) return html;

  const ordered = [...normalized].sort(
    (a, b) => b.keyword.length - a.keyword.length
  );

  const applyTextFallback = (inputHtml: string): string => {
    let out = inputHtml;

    // 1) Replace explicit [ANCHOR:kw]
    for (const { keyword, url } of ordered) {
      const safeKw = escapeRegExp(keyword);
      const tokenRe = new RegExp(`(\\s*)\\[ANCHOR:${safeKw}\\](\\s*)`, "gi");

      const replacement = url
        ? `<a href="${escapeHtmlAttr(
            url
          )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
            keyword
          )}</a>`
        : `<strong>${escapeHtml(keyword)}</strong>`;

      out = out.replace(tokenRe, (_m, before, after) => {
        const b = typeof before === "string" ? before : " ";
        const a = typeof after === "string" ? after : " ";
        return `${b}${replacement}${a}`;
      });
    }

    // 2) Ensure each keyword gets at least one link/strong
    for (const { keyword, url } of ordered) {
      const kwLower = keyword.toLowerCase();
      const safeLower = escapeRegExp(kwLower);

      const hasAnchor = new RegExp(
        `<a[^>]*>\\s*${safeLower}\\s*<\\/a>`,
        "i"
      ).test(out);
      const hasStrong = new RegExp(
        `<strong[^>]*>\\s*${safeLower}\\s*<\\/strong>`,
        "i"
      ).test(out);

      if (url) {
        if (hasAnchor) continue;
        if (hasStrong) {
          const strongRe = new RegExp(
            `<strong[^>]*>\\s*${safeLower}\\s*<\\/strong>`,
            "i"
          );
          out = out.replace(
            strongRe,
            `<a href="${escapeHtmlAttr(
              url
            )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
              keyword
            )}</a>`
          );
          continue;
        }
        const plainRe = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
        let replaced = false;
        out = out.replace(plainRe, (m) => {
          if (replaced) return m;
          replaced = true;
          return `<a href="${escapeHtmlAttr(
            url
          )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
            m
          )}</a>`;
        });
      } else {
        if (hasAnchor || hasStrong) continue;
        const plainRe = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
        let replaced = false;
        out = out.replace(plainRe, (m) => {
          if (replaced) return m;
          replaced = true;
          return `<strong>${escapeHtml(m)}</strong>`;
        });
      }
    }

    return out.replace(/\[ANCHOR:[^\]]+]/g, "");
  };

  if (typeof DOMParser === "undefined" || typeof document === "undefined") {
    return applyTextFallback(html);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<div id="__anchor_wrap__">${html}</div>`,
      "text/html"
    );
    const container = doc.getElementById("__anchor_wrap__");
    if (!container) return applyTextFallback(html);

    const forbiddenParents = new Set(["script", "style", "button", "svg"]);

    // STEP 1: Replace [ANCHOR:kw] tokens
    for (const { keyword, url } of ordered) {
      const token = `[ANCHOR:${keyword}]`;
      if (!keyword) continue;

      const walker = doc.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT
      );

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const text = node.nodeValue || "";
        const idx = text.indexOf(token);
        if (idx === -1) continue;

        const parent = node.parentElement;
        const tag = parent?.tagName.toLowerCase();
        if (tag && forbiddenParents.has(tag)) continue;

        const before = text.slice(0, idx);
        const after = text.slice(idx + token.length);

        const frag = doc.createDocumentFragment();
        if (before) frag.appendChild(doc.createTextNode(before));

        if (url) {
          const a = doc.createElement("a");
          a.setAttribute("href", url);
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
          a.textContent = keyword;
          frag.appendChild(a);
        } else {
          const strong = doc.createElement("strong");
          strong.textContent = keyword;
          frag.appendChild(strong);
        }

        if (after) frag.appendChild(doc.createTextNode(after));
        node.parentNode?.replaceChild(frag, node);
      }
    }

    // STEP 1b: Upgrade <strong> → <a> when URL exists & no correct link yet
    for (const { keyword, url } of ordered) {
      if (!url) continue;
      const kwLower = keyword.toLowerCase();

      let hasCorrect = false;
      const links = container.querySelectorAll("a");
      for (const el of Array.from(links)) {
        const text = (el.textContent || "").trim().toLowerCase();
        const href = (el.getAttribute("href") || "").trim();
        if (
          text === kwLower &&
          href.replace(/\/+$/, "") === url.replace(/\/+$/, "")
        ) {
          hasCorrect = true;
          break;
        }
      }
      if (hasCorrect) continue;

      const strongs = container.querySelectorAll("strong");
      for (const el of Array.from(strongs)) {
        const text = (el.textContent || "").trim().toLowerCase();
        if (text === kwLower) {
          const a = doc.createElement("a");
          a.setAttribute("href", url);
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
          a.textContent = el.textContent || keyword;
          el.parentNode?.replaceChild(a, el);
          hasCorrect = true;
          break;
        }
      }
    }

    // Helper: ensure for each kw we have correct link/strong
    const hasLinked = (kw: string, url?: string): boolean => {
      const kwLower = kw.toLowerCase();
      const links = container.querySelectorAll("a");

      for (const el of Array.from(links)) {
        const text = (el.textContent || "").trim().toLowerCase();
        const href = (el.getAttribute("href") || "").trim();
        if (!url) {
          if (text === kwLower) return true;
        } else {
          if (
            text === kwLower &&
            href.replace(/\/+$/, "") === url.replace(/\/+$/, "")
          ) {
            return true;
          }
        }
      }

      if (!url) {
        const els = container.querySelectorAll("a, strong");
        for (const el of Array.from(els)) {
          const text = (el.textContent || "").trim().toLowerCase();
          if (text === kwLower) return true;
        }
      }

      return false;
    };

    // STEP 2: If still missing, link first safe occurrence
    for (const { keyword, url } of ordered) {
      if (!keyword) continue;
      if (hasLinked(keyword, url)) continue;

      const re = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");

      const walker = doc.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node: Node) {
            const text = node.nodeValue || "";
            if (!text.trim()) return NodeFilter.FILTER_REJECT;

            const parent = (node as Text).parentElement;
            if (!parent) return NodeFilter.FILTER_ACCEPT;

            const tag = parent.tagName.toLowerCase();
            if (
              tag === "a" ||
              tag === "strong" ||
              tag === "script" ||
              tag === "style" ||
              tag === "ul" ||
              tag === "ol" ||
              tag === "li" ||
              tag === "table" ||
              tag === "thead" ||
              tag === "tbody" ||
              tag === "tfoot" ||
              tag === "tr" ||
              tag === "td" ||
              tag === "th"
            ) {
              return NodeFilter.FILTER_REJECT;
            }

            return NodeFilter.FILTER_ACCEPT;
          },
        } as any
      );

      let replaced = false;

      while (!replaced && walker.nextNode()) {
        const node = walker.currentNode as Text;
        const text = node.nodeValue || "";
        const m = re.exec(text);
        if (!m || m.index === undefined) continue;

        const matchIndex = m.index;
        const before = text.slice(0, matchIndex);
        const matched = m[0];
        const after = text.slice(matchIndex + matched.length);

        const frag = doc.createDocumentFragment();
        if (before) frag.appendChild(doc.createTextNode(before));

        if (url) {
          const a = doc.createElement("a");
          a.setAttribute("href", url);
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
          a.textContent = matched;
          frag.appendChild(a);
        } else {
          const strong = doc.createElement("strong");
          strong.textContent = matched;
          frag.appendChild(strong);
        }

        if (after) frag.appendChild(doc.createTextNode(after));
        node.parentNode?.replaceChild(frag, node);
        replaced = true;
      }
    }

    const out = container.innerHTML.replace(/\[ANCHOR:[^\]]+]/g, "");
    return out;
  } catch (err) {
    console.error("[applyAnchorTokens] DOM path failed:", err);
    return applyTextFallback(html);
  }
}

/* ─────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtmlAttr(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
