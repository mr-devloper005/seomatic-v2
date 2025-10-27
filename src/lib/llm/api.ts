// src/lib/llm/api.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEYS: string[] = [
"AIzaSyDMLKj8FWf0O3bbp33LV8bYXKsLbCCkky0"

];
if (!GEMINI_API_KEYS.length) {
  throw new Error("❌ No Gemini API keys set in src/lib/llm/api.ts → GEMINI_API_KEYS[]");
}

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",

] as const;

// 🔥 TEST MODE: REST ko force karo taaki Network tab me requests pakki dekho
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
  console.log("[LLM][REST] →", modelName, url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
  });
  console.log("[LLM][REST] ←", res.status, res.statusText);
  const json = await res.json().catch(() => ({}));
  const parts = json?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts) ? parts.map((p: any) => p?.text ?? "").join("") : "";
  return String(text || "").trim();
}

export async function generateJSONTitleHtml({
  keywords,
  instructions = "",
}: {
  keywords: string | string[];
  instructions?: string;
}): Promise<{ title: string; html: string }> {
  const kwArr = Array.isArray(keywords) ? keywords.filter(Boolean) : [keywords].filter(Boolean);
  if (!kwArr.length) throw new Error("No keywords provided");

  const prompt = `
Return STRICT JSON only with keys: "title" and "html".
- British English, human tone.
- "title" ≤ 70 chars.
- "html": 2 short paragraphs, one <h2>, short conclusion.
- Add tokens: ${kwArr.map(k => `[ANCHOR:${k}]`).join(" ")}.
- Extra: ${instructions || "None"}.
`.trim();

  let lastErr: unknown;
  for (const modelName of MODEL_CANDIDATES) {
    const key = pickRandomKey();

    if (!FORCE_REST) {
      // SDK path (optional): we keep it but currently disabled by FORCE_REST
      try {
        console.log("[LLM][SDK] try:", modelName);
        const client = new GoogleGenerativeAI(key);
        const model = client.getGenerativeModel({ model: modelName as string });
        const result = await model.generateContent(prompt);
        const text = result?.response?.text?.() ?? "";
        console.log("[LLM][SDK] textLen:", text.length);
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
      const text = await restGenerate(modelName, prompt, key);
      console.log("[LLM][REST] textLen:", text.length);
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
  return { title: normaliseTitle(`${(Array.isArray(keywords) ? keywords[0] : keywords) || "Untitled"} — practical notes`, String(Array.isArray(keywords) ? keywords[0] : keywords || "Untitled")), html: `<p>${(Array.isArray(keywords) ? keywords : [keywords]).map(k => `[ANCHOR:${k}]`).join(" ")}</p>` };
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

declare global { interface Window { __llmProbe?: (k: string|string[]) => Promise<void> } }
if (typeof window !== "undefined") {
  console.log("[LLM] api.ts ready (FORCE_REST =", FORCE_REST, ")");
  (window as any).__llmProbe = async (kws: string | string[]) => {
    try {
      console.log("[LLM] PROBE start:", kws);
      const r = await generateJSONTitleHtml({ keywords: kws });
      console.log("[LLM] PROBE ok:", r);
    } catch (e) {
      console.error("[LLM] PROBE err:", e);
    }
  };
}
