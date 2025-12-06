



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
// // ⚠️ CLIENT-SIDE (INSECURE) VERSION — use only for testing
// const OPENAI_API_KEY =
//   readEnv("VITE_OPENAI_API_KEY") ||
//   readEnv("NEXT_PUBLIC_OPENAI_API_KEY") ||
//   "";



// const OPENAI_BASE_URL =
//   readEnv("NEXT_PUBLIC_OPENAI_BASE_URL") ||
//   readEnv("VITE_OPENAI_BASE_URL") ||
//   "https://api.openai.com/v1";

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

//     // after: const json = await res.json().catch(() => ({} as any));
// console.log("[LLM DEBUG] request model:", OPENAI_MODEL);
// console.log("[LLM DEBUG] status:", res.status, "ok:", res.ok);
// console.log("[LLM DEBUG] raw response (first 2000 chars):", JSON.stringify(json).slice(0, 2000));


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
//     "Promote user engagement and readability.",
//     "Add uniqueness and value beyond common knowledge.",
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
//     "DETAILED INSTRUCTIONS (user/site prefs):",

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
//  * - [ANCHOR:kw] → <a>/<strong>
//  * - For URL: real <a href=...>
//  * - For no URL: <strong>
//  * - Ensure at least one correct link per keyword
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
//         const plainRe = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
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
//         const plainRe = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
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

//   try {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(
//       `<div id="__anchor_wrap__">${html}</div>`,
//       "text/html"
//     );
//     const container = doc.getElementById("__anchor_wrap__");
//     if (!container) return applyTextFallback(html);

//     const forbiddenParents = new Set(["script", "style", "button", "svg"]);

//     // STEP 1: Replace [ANCHOR:kw] tokens
//     for (const { keyword, url } of ordered) {
//       const token = `[ANCHOR:${keyword}]`;
//       if (!keyword) continue;

//       const walker = doc.createTreeWalker(
//         container,
//         NodeFilter.SHOW_TEXT
//       );

//       while (walker.nextNode()) {
//         const node = walker.currentNode as Text;
//         const text = node.nodeValue || "";
//         const idx = text.indexOf(token);
//         if (idx === -1) continue;

//         const parent = node.parentElement;
//         const tag = parent?.tagName.toLowerCase();
//         if (tag && forbiddenParents.has(tag)) continue;

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

//     // STEP 1b: Upgrade <strong> → <a> when URL exists & no correct link yet
//     for (const { keyword, url } of ordered) {
//       if (!url) continue;
//       const kwLower = keyword.toLowerCase();

//       let hasCorrect = false;
//       const links = container.querySelectorAll("a");
//       for (const el of Array.from(links)) {
//         const text = (el.textContent || "").trim().toLowerCase();
//         const href = (el.getAttribute("href") || "").trim();
//         if (
//           text === kwLower &&
//           href.replace(/\/+$/, "") === url.replace(/\/+$/, "")
//         ) {
//           hasCorrect = true;
//           break;
//         }
//       }
//       if (hasCorrect) continue;

//       const strongs = container.querySelectorAll("strong");
//       for (const el of Array.from(strongs)) {
//         const text = (el.textContent || "").trim().toLowerCase();
//         if (text === kwLower) {
//           const a = doc.createElement("a");
//           a.setAttribute("href", url);
//           a.setAttribute("target", "_blank");
//           a.setAttribute("rel", "noopener noreferrer");
//           a.textContent = el.textContent || keyword;
//           el.parentNode?.replaceChild(a, el);
//           hasCorrect = true;
//           break;
//         }
//       }
//     }

//     // Helper: ensure for each kw we have correct link/strong
//     const hasLinked = (kw: string, url?: string): boolean => {
//       const kwLower = kw.toLowerCase();
//       const links = container.querySelectorAll("a");

//       for (const el of Array.from(links)) {
//         const text = (el.textContent || "").trim().toLowerCase();
//         const href = (el.getAttribute("href") || "").trim();
//         if (!url) {
//           if (text === kwLower) return true;
//         } else {
//           if (
//             text === kwLower &&
//             href.replace(/\/+$/, "") === url.replace(/\/+$/, "")
//           ) {
//             return true;
//           }
//         }
//       }

//       if (!url) {
//         const els = container.querySelectorAll("a, strong");
//         for (const el of Array.from(els)) {
//           const text = (el.textContent || "").trim().toLowerCase();
//           if (text === kwLower) return true;
//         }
//       }

//       return false;
//     };

//     // STEP 2: If still missing, link first safe occurrence
//     for (const { keyword, url } of ordered) {
//       if (!keyword) continue;
//       if (hasLinked(keyword, url)) continue;

//       const re = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");

//       const walker = doc.createTreeWalker(
//         container,
//         NodeFilter.SHOW_TEXT,
//         {
//           acceptNode(node: Node) {
//             const text = node.nodeValue || "";
//             if (!text.trim()) return NodeFilter.FILTER_REJECT;

//             const parent = (node as Text).parentElement;
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





// /* LLM orchestration + generateJSONTitleHtml + applyAnchorTokens
//    NOTE: This file is the LLM client/orchestration. Changes:
//    - Removed fallback/draft behavior when LLM fails.
//    - If LLM doesn't return valid JSON or returns empty html, this function throws.
// */

// export type ModelName = "gemini-2.5-flash" | "gemini-2.0-flash";

// /* Configuration and keys (keep your real keys in env) */
// const ENV_KEYS = (import.meta.env.VITE_GEMINI_API_KEYS as string | undefined)
//   ?.split(",")
//   .map((key) => key.trim())
//   .filter(Boolean);

// const GEMINI_API_KEYS: string[] = ENV_KEYS?.length
//   ? ENV_KEYS
//   : [
//       // ⛔ Replace with your own keys or use ENV. Don't commit real keys.
//       "AIzaSyAczysookd8P7UtRQ5EOT5hsgmw6jQdBxk",
//       "AIzaSyAiuEsxN0T5okxCpWE4mTQ5eReyX5512uA",
//       "AIzaSyDJzsTMXS53918qwV6Y3RBOXbJ9uPQ6NUY",
//       "AIzaSyALWTZHYpIEb5INMnICR0VzEEV8Nhv0SVA",
//       "AIzaSyAl36qsa2XvdCLtPf3vHDV4Po4o14mKllY",
//       "AIzaSyCsYwyhhDMs8v90Mfbb_BosautLkf61urQ",
//       "AIzaSyBY_vj98oCUP72rgPAIIE3OdiaEVbYSXAY",
//       "AIzaSyAmD2KhxCUVg3HrSZ-bfkGW6tRLTiSVQso",
//       "AIzaSyBJO7HKv5ItDVJU4X-D3Ie9k_rj3Bh2AiA",
//       "AIzaSyC7_u03_UyEQCwxJQnQa5Ns0WjH0K72RtQ",
//       "AIzaSyCl00SzUYIrOwfQpOyAnairqPrTXBAMBR4",
//       "AIzaSyBMy6qGhOO52OhCNctqTO_b5ioskAuM_xA",
//       "AIzaSyCwmIFaDMH1Snsjrukidb1RyuH0ghbDBhg",
//       "AIzaSyBX1DkPAsE8Ml-m77wg9OZWGwEYzNiqO3w",
//         "AIzaSyAUEqlBExrhs9hvnGkpF_5t7J-Jkli19b8",
//       "AIzaSyAvcKxsTin_o1gtKflkLlU50-xdnEphkuk",
//       "AIzaSyBafUHccMUZ0V1FF1mN23RP2qeNqXIEvYg",
//       "AIzaSyB-wHr42L5f3tWr9bGA6vaK2diy_AVYPU4",
//       "AIzaSyDqNRDM8ezkZPaEJ4PWqmwr_06A5tvUQqg",
//       "AIzaSyAjcBQyJDPqzerUAFaa3f01HbPPk321eHw",
// "AIzaSyA58HmYWxGlRLcg8SPXQOreLUuWpaVQVRk",
//       "AIzaSyDMLKj8FWf0O3bbp33LV8bYXKsLbCCkky0",
//       "AIzaSyBEf6ycxvycOyPfVRBikYoIFLv_liuprlU",
//       "AIzaSyBCf6NEWEPJh1o_IvRScxMw-MMwCHmUCKQ",
//       "AIzaSyDcNps3CExbptn6K5he8-1uTwqIcaMtKTI",
      
      
//     ];

// if (!GEMINI_API_KEYS.length) {
//   throw new Error(
//     "❌ No Gemini API keys configured. Set VITE_GEMINI_API_KEYS or update src/lib/llm/api.ts"
//   );
// }

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

//   // NO fallback/draft allowed — propagate failure
//   const errMsg =
//     lastError?.message || "LLM failed to produce valid output after retries";
//   throw new Error(errMsg);
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




// src/lib/llm/api.ts
/**
 * Gemini LLM client / orchestration (drop-in)
 *
 * Features:
 * - Hedged requests across gemini models (gemini-2.5-flash, gemini-2.0-flash)
 * - Key management, cooldowns, penalties
 * - Strict JSON-only parsing: { title, html } (no fallback/drafts)
 * - Cancellation API: generateJSONTitleHtmlWithRequestId / cancelRequest / cancelAllRequests
 * - Debug helpers: getRequestIds, getKeyStateSnapshot
 * - Full DOM-aware applyAnchorTokens with text fallback
 *
 * IMPORTANT: store real keys in env (VITE_GEMINI_API_KEYS). The default list below is placeholder and for dev only.
 */

/* -------------------------
 * Runtime Env helper
 * ------------------------- */
export function readEnv(key: string): string | undefined {
  try {
    if (typeof process !== "undefined" && (process as any).env && (process as any).env[key]) {
      return (process as any).env[key];
    }
  } catch {}
  try {
    if (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  try {
    if (typeof window !== "undefined" && (window as any)[key]) return (window as any)[key];
  } catch {}
  return undefined;
}

/* -------------------------
 * Types
 * ------------------------- */
export type ModelName = "gemini-2.5-flash" | "gemini-2.0-flash";

export interface GenerateJSONTitleHtmlArgs {
  keywords: string | string[];
  instructions: string;
  titleLength?: number;
}

/* -------------------------
 * Request cancellation registry
 * ------------------------- */
const REQUEST_CONTROLLERS = new Map<string, AbortController>();

export function getRequestIds(): string[] {
  return Array.from(REQUEST_CONTROLLERS.keys());
}

export function cancelRequest(requestId: string): boolean {
  const c = REQUEST_CONTROLLERS.get(requestId);
  if (!c) return false;
  try {
    c.abort();
  } catch {}
  REQUEST_CONTROLLERS.delete(requestId);
  return true;
}

export function cancelAllRequests(): void {
  for (const [id, c] of Array.from(REQUEST_CONTROLLERS.entries())) {
    try {
      c.abort();
    } catch {}
    REQUEST_CONTROLLERS.delete(id);
  }
}

/* -------------------------
 * Configuration + keys
 * ------------------------- */
const ENV_KEYS = (readEnv("VITE_GEMINI_API_KEYS") as string | undefined)
  ?.split(",")
  .map((k) => k.trim())
  .filter(Boolean);

const GEMINI_API_KEYS: string[] = ENV_KEYS?.length
  ? ENV_KEYS
  : [
      // placeholder keys — replace with env in production
      "AIzaSyAczysookd8P7UtRQ5EOT5hsgmw6jQdBxk",
      "AIzaSyAiuEsxN0T5okxCpWE4mTQ5eReyX5512uA",
    ];

if (!GEMINI_API_KEYS.length) {
  throw new Error(
    "❌ No Gemini API keys configured. Set VITE_GEMINI_API_KEYS or update src/lib/llm/api.ts"
  );
}

/* -------------------------
 * Control constants
 * ------------------------- */
const MODEL_POOL: ModelName[] = ["gemini-2.5-flash", "gemini-2.0-flash"];
const DEFAULT_STAGGERS_MS = [0, 140, 280] as const;
const KEY_SELECTION_MODE: "round_robin" | "random" | "random_weighted" = "random_weighted";
const PER_REQUEST_DISTINCT_KEYS = true;

const REQUEST_TIMEOUT_MS = 22_000;
const MAX_RETRIES = 5;
const MAX_OUTPUT_TOKENS = 2_500;
const TEMPERATURE = 0.9;
const TOP_P = 0.92;
const TOP_K = 60;
const BASE_KEY_COOLDOWN_MS = 45_000;
const MAX_IN_FLIGHT_PER_KEY = 4;
const FORCE_JSON_MIMETYPE = true;

const TIMEOUT_BY_MODEL: Record<ModelName, number> = {
  "gemini-2.5-flash": 22_000,
  "gemini-2.0-flash": 24_000,
};

/* -------------------------
 * Key state
 * ------------------------- */
let rrIndex = Math.floor(Math.random() * GEMINI_API_KEYS.length);
const keyState = new Map<string, { cooldownUntil: number; inFlight: number; penaltyMs: number }>();
for (const key of GEMINI_API_KEYS) {
  keyState.set(key, { cooldownUntil: 0, inFlight: 0, penaltyMs: 0 });
}

export function getKeyStateSnapshot() {
  const out: Record<string, { cooldownUntil: number; inFlight: number; penaltyMs: number }> = {};
  for (const [k, v] of keyState.entries()) out[k] = { ...v };
  return out;
}

/* -------------------------
 * Global scheduling helpers
 * ------------------------- */
let globalPenaltyMs = 0;
let globalInFlight = 0;
const globalWaiters: Array<() => void> = [];
const modelCooldownUntil = new Map<ModelName, number>(MODEL_POOL.map((m) => [m, 0]));
type HardCode = 429 | 503 | 500;
const hardEvents: Array<{ t: number; code: HardCode }> = [];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const now = () => Date.now();

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function recordHard(code: HardCode) {
  hardEvents.push({ t: now(), code });
  if (hardEvents.length > 60) hardEvents.shift();
}
function isUnstable() {
  const cutoff = now() - 20_000;
  return hardEvents.filter((evt) => evt.t >= cutoff).length >= 6;
}

async function acquireGlobal() {
  if (globalInFlight < GEMINI_API_KEYS.length * MAX_IN_FLIGHT_PER_KEY) {
    globalInFlight++;
    return;
  }
  await new Promise<void>((resolve) => globalWaiters.push(() => { globalInFlight++; resolve(); }));
}
function releaseGlobal() {
  globalInFlight = Math.max(0, globalInFlight - 1);
  const next = globalWaiters.shift();
  if (next) next();
}

/* -------------------------
 * Key selection / accounting
 * ------------------------- */
function nextUsableKey(exclude?: Set<string>): string | null {
  const t = now();
  const candidates = GEMINI_API_KEYS.filter((key) => {
    if (exclude?.has(key)) return false;
    const state = keyState.get(key)!;
    return state.cooldownUntil <= t && state.inFlight < MAX_IN_FLIGHT_PER_KEY;
  });
  if (!candidates.length) return null;

  if (KEY_SELECTION_MODE === "random") {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  if (KEY_SELECTION_MODE === "random_weighted") {
    const weights = candidates.map((key) => {
      const state = keyState.get(key)!;
      const capacity = Math.max(1, MAX_IN_FLIGHT_PER_KEY - state.inFlight);
      const penalty = 1 + state.penaltyMs / 1000;
      return capacity / penalty;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < candidates.length; i++) {
      r -= weights[i];
      if (r <= 0) return candidates[i];
    }
    return candidates[candidates.length - 1];
  }

  const n = GEMINI_API_KEYS.length;
  const start = ((rrIndex++ % n) + n) % n;
  for (let i = 0; i < n; i++) {
    const key = GEMINI_API_KEYS[(start + i) % n];
    if (exclude?.has(key)) continue;
    const state = keyState.get(key)!;
    if (state.cooldownUntil <= t && state.inFlight < MAX_IN_FLIGHT_PER_KEY) return key;
  }
  return null;
}
function acquireKey(key: string) { keyState.get(key)!.inFlight++; }
function releaseKey(key: string) { const s = keyState.get(key)!; s.inFlight = Math.max(0, s.inFlight - 1); }
function markCooldown(key: string, retryAfterMs: number | null) {
  const state = keyState.get(key)!;
  const extra = retryAfterMs ?? BASE_KEY_COOLDOWN_MS + state.penaltyMs;
  state.cooldownUntil = Math.max(state.cooldownUntil, now() + extra);
  state.penaltyMs = Math.min(state.penaltyMs * 1.5 + 800, 180_000);
  globalPenaltyMs = Math.min(globalPenaltyMs * 1.4 + 300, 8_000);
}
function markModelCooldown(model: ModelName, ms: number) {
  const until = Math.max(modelCooldownUntil.get(model) ?? 0, now() + ms);
  modelCooldownUntil.set(model, until);
}
function decayPenalties() {
  for (const s of keyState.values()) s.penaltyMs = Math.max(0, s.penaltyMs - 600);
  globalPenaltyMs = Math.max(0, globalPenaltyMs - 400);
}

/* -------------------------
 * HTTP helpers
 * ------------------------- */
function parseRetryAfterMs(headers: Headers): number | null {
  const value = headers.get("retry-after");
  if (!value) return null;
  const asSeconds = Number(value);
  if (!Number.isNaN(asSeconds) && asSeconds >= 0) return Math.max(0, Math.floor(asSeconds * 1000));
  const asDate = Date.parse(value);
  if (!Number.isNaN(asDate)) return Math.max(0, asDate - now());
  return null;
}

async function fetchJsonWithTimeout(url: string, body: unknown, timeoutMs: number, externalSignal?: AbortSignal) {
  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  if (externalSignal) externalSignal.addEventListener("abort", forwardAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(body),
    });
    const json = await response.json().catch(() => ({}));
    return { status: response.status, headers: response.headers, json };
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener("abort", forwardAbort);
  }
}

/* -------------------------
 * Prompt + payload
 * ------------------------- */
function buildPayload(prompt: string) {
  const generationConfig: Record<string, unknown> = {
    temperature: TEMPERATURE,
    topP: TOP_P,
    topK: TOP_K,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  };
  if (FORCE_JSON_MIMETYPE) generationConfig.responseMimeType = "application/json";
  return {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig,
  };
}

function extractTextFromResponse(payload: any): string {
  if (!payload) return "";
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
  if (candidates.length) {
    const parts = candidates[0]?.content?.parts ?? [];
    const merged = parts.map((part: any) => (typeof part?.text === "string" ? part.text : "")).filter(Boolean).join("\n").trim();
    if (merged) return merged;
    if (typeof candidates[0]?.output_text === "string") return candidates[0].output_text;
  }
  if (typeof payload?.output_text === "string") return payload.output_text;
  if (typeof payload?.text === "string") return payload.text;
  return "";
}

/* -------------------------
 * REST wrapper per model/key
 * ------------------------- */
async function tryREST(model: ModelName, key: string, prompt: string, signal?: AbortSignal) {
  const cooldownUntil = modelCooldownUntil.get(model) ?? 0;
  if (cooldownUntil > now()) await sleep(Math.min(cooldownUntil - now(), 1500));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const timeout = TIMEOUT_BY_MODEL[model] ?? REQUEST_TIMEOUT_MS;
  const { status, headers, json } = await fetchJsonWithTimeout(url, buildPayload(prompt), timeout, signal);

  if (status >= 200 && status < 300) return { text: extractTextFromResponse(json), raw: json };

  const error: any = new Error(json?.error?.message || `Gemini REST error ${status}`);
  error.code = status;
  error.retryAfterMs = parseRetryAfterMs(headers);
  error.raw = json;
  throw error;
}

/* -------------------------
 * Attempt / hedgedAttempt
 * ------------------------- */
interface AttemptSuccess { model: ModelName; key: string; text: string; raw: unknown; }

async function attemptOnce(model: ModelName, prompt: string, externalSignal?: AbortSignal): Promise<AttemptSuccess> {
  await acquireGlobal();
  try {
    const usedKeys = new Set<string>();
    let lastError: any = null;
    const maxAttempts = Math.max(GEMINI_API_KEYS.length * 2, 4);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const key = nextUsableKey(PER_REQUEST_DISTINCT_KEYS ? usedKeys : undefined);
      if (!key) {
        await sleep(120 + Math.random() * 240);
        continue;
      }
      if (PER_REQUEST_DISTINCT_KEYS) usedKeys.add(key);
      acquireKey(key);

      try {
        const { text, raw } = await tryREST(model, key, prompt, externalSignal);
        if (!text.trim()) throw Object.assign(new Error("Empty LLM response"), { code: 204 });
        decayPenalties();
        return { model, key, text, raw };
      } catch (error: any) {
        lastError = error;
        if (isAbortError(error)) throw error;
        const code = Number(error?.code) as HardCode | number;
        if (code === 429 || code === 503) {
          recordHard(code as HardCode);
          markCooldown(key, error?.retryAfterMs ?? null);
          if (code === 503) markModelCooldown(model, 3500 + Math.random() * 1500);
        } else if (code === 500) {
          recordHard(500);
          markCooldown(key, BASE_KEY_COOLDOWN_MS);
        }
      } finally {
        releaseKey(key);
      }
    }
    throw lastError ?? new Error("All Gemini keys are throttled");
  } finally {
    releaseGlobal();
  }
}

async function hedgedAttempt(prompt: string, externalSignal?: AbortSignal): Promise<AttemptSuccess> {
  if (MODEL_POOL.length === 1) return attemptOnce(MODEL_POOL[0], prompt, externalSignal);

  const abortController = new AbortController();
  const forwardAbort = () => abortController.abort();
  if (externalSignal) {
    if (externalSignal.aborted) abortController.abort();
    else externalSignal.addEventListener("abort", forwardAbort, { once: true });
  }

  return new Promise<AttemptSuccess>((resolve, reject) => {
    const errors: any[] = [];
    let pending = MODEL_POOL.length;
    let settled = false;

    const finalize = () => {
      if (externalSignal) externalSignal.removeEventListener("abort", forwardAbort);
    };

    MODEL_POOL.forEach((model, index) => {
      const delay = DEFAULT_STAGGERS_MS[index] ?? DEFAULT_STAGGERS_MS[DEFAULT_STAGGERS_MS.length - 1] ?? 0;
      (async () => {
        try {
          if (delay > 0) await sleep(delay);
          if (settled) return;
          const result = await attemptOnce(model, prompt, abortController.signal);
          if (settled) return;
          settled = true;
          abortController.abort();
          finalize();
          resolve(result);
        } catch (error) {
          if (settled) return;
          errors.push(error);
          if (--pending === 0) {
            settled = true;
            abortController.abort();
            finalize();
            reject(errors[errors.length - 1] ?? error);
          }
        }
      })();
    });
  });
}

/* -------------------------
 * JSON parsing helpers
 * ------------------------- */
function parseJsonStrict(payload: string): any | null {
  if (!payload) return null;
  const clean = payload.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const first = clean.indexOf("{");
  const last = clean.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try { return JSON.parse(clean.slice(first, last + 1)); } catch {}
  }
  return null;
}

/* -------------------------
 * Prompt builder
 * ------------------------- */
function buildPrompt(keywords: string[], instructions: string, titleLength?: number): string {
  const keywordList = keywords.map((kw, i) => `${i + 1}. ${kw}`).join("\n");
  const maxTitle = typeof titleLength === "number" && titleLength > 0 && titleLength <= 140 ? titleLength : 70;
  return [
    "You are an expert SEO copywriter tasked with producing conversion-focused content.",
    `Return ONLY valid JSON with the exact structure { "title": string, "html": string } (no markdown fences).`,
    "Constraints:",
    `- Title must be unique, enticing, <= ${maxTitle} characters, and include at least one keyword.`,
    "- html must be semantic markup using headings, lists, paragraphs, and optional blockquotes.",
    "- Include placeholder tokens [ANCHOR:keyword] in the html for each keyword listed below.",
    "- Do not include explanations or any extra JSON properties.",
    `Primary keywords:\n${keywordList}`,
    "Detailed brief:",
    instructions.trim(),
  ].join("\n\n");
}

/* -------------------------
 * Public: generateJSONTitleHtml
 * - returns { title, html }
 * - If caller wants cancellation: pass externalSignal or use generateJSONTitleHtmlWithRequestId
 * - No fallback/draft: throws when LLM output invalid or empty
 * ------------------------- */
export async function generateJSONTitleHtml(
  args: GenerateJSONTitleHtmlArgs,
  externalSignal?: AbortSignal
): Promise<{ title: string; html: string }> {
  const { keywords, instructions, titleLength } = args;
  const keywordArray = Array.isArray(keywords)
    ? keywords.filter((kw): kw is string => typeof kw === "string" && kw.trim().length > 0)
    : [keywords].filter((kw): kw is string => typeof kw === "string" && kw.trim().length > 0);

  if (!keywordArray.length) throw new Error("No keywords provided");
  if (!instructions?.trim()) throw new Error("No instructions provided to LLM.");

  const prompt = buildPrompt(keywordArray, instructions, titleLength);
  let lastError: any = null;
  const maxTitle = typeof titleLength === "number" && titleLength > 0 && titleLength <= 140 ? titleLength : 70;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (globalPenaltyMs > 0) await sleep(Math.min(globalPenaltyMs, 1500));
      const result = await hedgedAttempt(prompt, externalSignal);
      const parsed = parseJsonStrict(result.text);
      if (!parsed || typeof parsed !== "object") throw new Error("LLM did not return JSON payload");

      const rawTitle = typeof parsed.title === "string" ? parsed.title : keywordArray[0];
      const title = (rawTitle || keywordArray[0]).trim().slice(0, maxTitle);

      const html = String(parsed.html ?? "").trim();
      if (!html) throw new Error("LLM returned empty html");

      return { title, html };
    } catch (error) {
      lastError = error;
      if (isAbortError(error)) throw error;
      const backoff = isUnstable() ? 1200 : 600;
      await sleep(backoff + Math.random() * 400 * (attempt + 1));
    }
  }

  const errMsg = lastError?.message || "LLM failed to produce valid output after retries";
  throw new Error(errMsg);
}

/**
 * generateJSONTitleHtmlWithRequestId
 * - Convenience wrapper that creates a controller and registers it so caller can cancel via requestId.
 * - Returns { requestId, promise } ; caller should await promise (promise rejects on abort).
 */
export function generateJSONTitleHtmlWithRequestId(args: GenerateJSONTitleHtmlArgs): { requestId: string; promise: Promise<{ title: string; html: string }> } {
  const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const controller = new AbortController();
  REQUEST_CONTROLLERS.set(requestId, controller);
  const promise = generateJSONTitleHtml(args, controller.signal).finally(() => {
    REQUEST_CONTROLLERS.delete(requestId);
  });
  return { requestId, promise };
}

/* -------------------------
 * applyAnchorTokens (full DOM-aware version + text fallback)
 * - Replaces [ANCHOR:keyword] tokens.
 * - Ensures at least one link/strong per keyword (prefers URL -> <a>, otherwise <strong>).
 * - Tries DOM approach when available; falls back to text replacements in other runtimes.
 * ------------------------- */

// export function applyAnchorTokens(html: string, anchors: Array<{ keyword: string; url?: string }>): string {
//   if (!html || !anchors?.length) return html;

//   // Normalize + dedupe
//   const normalized: Array<{ keyword: string; url?: string }> = [];
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

//   const ordered = [...normalized].sort((a, b) => b.keyword.length - a.keyword.length);

//   const applyTextFallback = (inputHtml: string): string => {
//     let out = inputHtml;

//     // 1) Replace explicit [ANCHOR:kw]
//     for (const { keyword, url } of ordered) {
//       const safeKw = escapeRegExp(keyword);
//       const tokenRe = new RegExp(`(\\s*)\\[ANCHOR:${safeKw}\\](\\s*)`, "gi");

//       const replacement = url
//         ? `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(keyword)}</a>`
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

//       const hasAnchor = new RegExp(`<a[^>]*>\\s*${safeLower}\\s*<\\/a>`, "i").test(out);
//       const hasStrong = new RegExp(`<strong[^>]*>\\s*${safeLower}\\s*<\\/strong>`, "i").test(out);

//       if (url) {
//         if (hasAnchor) continue;
//         if (hasStrong) {
//           const strongRe = new RegExp(`<strong[^>]*>\\s*${safeLower}\\s*<\\/strong>`, "i");
//           out = out.replace(strongRe, `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(keyword)}</a>`);
//           continue;
//         }
//         const plainRe = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
//         let replaced = false;
//         out = out.replace(plainRe, (m) => {
//           if (replaced) return m;
//           replaced = true;
//           return `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(m)}</a>`;
//         });
//       } else {
//         if (hasAnchor || hasStrong) continue;
//         const plainRe = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
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

//   // If DOMParser not available (e.g., Node without DOM), fallback to text logic
//   if (typeof DOMParser === "undefined" || typeof document === "undefined") {
//     return applyTextFallback(html);
//   }

//   try {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(`<div id="__anchor_wrap__">${html}</div>`, "text/html");
//     const container = doc.getElementById("__anchor_wrap__");
//     if (!container) return applyTextFallback(html);

//     const forbiddenParents = new Set(["script", "style", "button", "svg"]);

//     // STEP 1: Replace [ANCHOR:kw] tokens in text nodes
//     for (const { keyword, url } of ordered) {
//       const token = `[ANCHOR:${keyword}]`;
//       if (!keyword) continue;

//       const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT);

//       while (walker.nextNode()) {
//         const node = walker.currentNode as Text;
//         const text = node.nodeValue || "";
//         const idx = text.indexOf(token);
//         if (idx === -1) continue;

//         const parent = node.parentElement;
//         const tag = parent?.tagName.toLowerCase();
//         if (tag && forbiddenParents.has(tag)) continue;

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

//     // STEP 1b: Upgrade <strong> → <a> when URL exists & no correct link yet
//     for (const { keyword, url } of ordered) {
//       if (!url) continue;
//       const kwLower = keyword.toLowerCase();

//       let hasCorrect = false;
//       const links = container.querySelectorAll("a");
//       for (const el of Array.from(links)) {
//         const text = (el.textContent || "").trim().toLowerCase();
//         const href = (el.getAttribute("href") || "").trim();
//         if (text === kwLower && href.replace(/\/+$/, "") === url.replace(/\/+$/, "")) {
//           hasCorrect = true;
//           break;
//         }
//       }
//       if (hasCorrect) continue;

//       const strongs = container.querySelectorAll("strong");
//       for (const el of Array.from(strongs)) {
//         const text = (el.textContent || "").trim().toLowerCase();
//         if (text === kwLower) {
//           const a = doc.createElement("a");
//           a.setAttribute("href", url);
//           a.setAttribute("target", "_blank");
//           a.setAttribute("rel", "noopener noreferrer");
//           a.textContent = el.textContent || keyword;
//           el.parentNode?.replaceChild(a, el);
//           hasCorrect = true;
//           break;
//         }
//       }
//     }

//     // Helper: ensure for each kw we have correct link/strong
//     const hasLinked = (kw: string, url?: string): boolean => {
//       const kwLower = kw.toLowerCase();
//       const links = container.querySelectorAll("a");

//       for (const el of Array.from(links)) {
//         const text = (el.textContent || "").trim().toLowerCase();
//         const href = (el.getAttribute("href") || "").trim();
//         if (!url) {
//           if (text === kwLower) return true;
//         } else {
//           if (text === kwLower && href.replace(/\/+$/, "") === url.replace(/\/+$/, "")) return true;
//         }
//       }

//       if (!url) {
//         const els = container.querySelectorAll("a, strong");
//         for (const el of Array.from(els)) {
//           const text = (el.textContent || "").trim().toLowerCase();
//           if (text === kwLower) return true;
//         }
//       }

//       return false;
//     };

//     // STEP 2: If still missing, link first safe occurrence
//     for (const { keyword, url } of ordered) {
//       if (!keyword) continue;
//       if (hasLinked(keyword, url)) continue;

//       const re = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");

//       const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
//         acceptNode(node: Node) {
//           const text = node.nodeValue || "";
//           if (!text.trim()) return NodeFilter.FILTER_REJECT;
//           const parent = (node as Text).parentElement;
//           if (!parent) return NodeFilter.FILTER_ACCEPT;
//           const tag = parent.tagName.toLowerCase();
//           if (
//             tag === "a" ||
//             tag === "strong" ||
//             tag === "script" ||
//             tag === "style" ||
//             tag === "ul" ||
//             tag === "ol" ||
//             tag === "li" ||
//             tag === "table" ||
//             tag === "thead" ||
//             tag === "tbody" ||
//             tag === "tfoot" ||
//             tag === "tr" ||
//             tag === "td" ||
//             tag === "th"
//           ) {
//             return NodeFilter.FILTER_REJECT;
//           }
//           return NodeFilter.FILTER_ACCEPT;
//         },
//       } as any);

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

/**
 * Improved applyAnchorTokens (drop-in).
 * - Uses <a class="llm-anchor"> for links, <b class="llm-anchor"> for no-url.
 * - Logs counts of replacements to console for debugging.
 * - Uses DOM path where available, falls back to robust text path in SSR.
 */
export function applyAnchorTokens(
  html: string,
  anchors: Array<{ keyword: string; url?: string }>
) {
  if (!html || !anchors?.length) return html;

  // Normalize + dedupe anchors (preserve first URL if provided)
  const normalized: Array<{ keyword: string; url?: string }> = [];
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

  // Sort by length desc to avoid partial-matches ("car" vs "car insurance")
  const ordered = [...normalized].sort((a, b) => b.keyword.length - a.keyword.length);

  let totalReplaced = 0;
  const replacementLog: Array<{ keyword: string; replaced: boolean; via: string }> = [];

  const applyTextFallback = (inputHtml: string) => {
    let out = inputHtml;

    // 1) Replace explicit [ANCHOR:keyword] tokens first (exact match)
    for (const { keyword, url } of ordered) {
      const tokenRe = new RegExp(`\\[ANCHOR:${escapeRegExp(keyword)}\\]`, "g");
      const replacement = url
        ? `<a class="llm-anchor" href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(keyword)}</a>`
        : `<b class="llm-anchor">${escapeHtml(keyword)}</b>`;
      const before = out;
      out = out.replace(tokenRe, replacement);
      const changed = before !== out;
      if (changed) {
        totalReplaced++;
        replacementLog.push({ keyword, replaced: true, via: "token" });
      } else {
        replacementLog.push({ keyword, replaced: false, via: "token" });
      }
    }

    // 2) For each keyword ensure at least one wrapped occurrence exists
    for (const { keyword, url } of ordered) {
      const kwLower = keyword.toLowerCase();
      const hasAnchor = new RegExp(`<a[^>]*>\\s*${escapeRegExp(kwLower)}\\s*<\\/a>`, "i").test(out);
      const hasBold = new RegExp(`<b[^>]*>\\s*${escapeRegExp(kwLower)}\\s*<\\/b>`, "i").test(out)
        || new RegExp(`<strong[^>]*>\\s*${escapeRegExp(kwLower)}\\s*<\\/strong>`, "i").test(out);

      if (hasAnchor || hasBold) {
        // already present
        if (!(replacementLog.find((r) => r.keyword === keyword && r.replaced))) {
          replacementLog.push({ keyword, replaced: true, via: "already" });
        }
        continue;
      }

      // Replace the first plain occurrence (word-boundary)
      const plainRe = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
      let replaced = false;
      out = out.replace(plainRe, (m) => {
        if (replaced) return m;
        replaced = true;
        totalReplaced++;
        replacementLog.push({ keyword, replaced: true, via: "text-fallback" });
        return url
          ? `<a class="llm-anchor" href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(m)}</a>`
          : `<b class="llm-anchor">${escapeHtml(m)}</b>`;
      });

      if (!replaced) {
        replacementLog.push({ keyword, replaced: false, via: "text-fallback" });
      }
    }

    // Clean leftover tokens
    out = out.replace(/\[ANCHOR:[^\]]+]/g, "");
    return out;
  };

  // If DOMParser or document not present, use text fallback
  if (typeof DOMParser === "undefined" || typeof document === "undefined") {
    const res = applyTextFallback(html);
    console.info("[applyAnchorTokens] replaced (SSR fallback):", totalReplaced, replacementLog);
    return res;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="__anchor_wrap__">${html}</div>`, "text/html");
    const container = doc.getElementById("__anchor_wrap__");
    if (!container) {
      const res = applyTextFallback(html);
      console.info("[applyAnchorTokens] container missing, used fallback:", totalReplaced, replacementLog);
      return res;
    }

    const forbiddenParents = new Set([
      "script",
      "style",
      "button",
      "svg",
      "textarea",
      "code",
      "pre",
    ]);

    // STEP 1: Replace explicit tokens in text nodes
    for (const { keyword, url } of ordered) {
      const token = `[ANCHOR:${keyword}]`;
      const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let replacedInNode = false;
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const text = node.nodeValue || "";
        const idx = text.indexOf(token);
        if (idx === -1) continue;

        const parent = node.parentElement;
        if (!parent) continue;
        const tag = parent.tagName.toLowerCase();
        if (forbiddenParents.has(tag)) continue;

        const beforeText = text.slice(0, idx);
        const afterText = text.slice(idx + token.length);

        const frag = doc.createDocumentFragment();
        if (beforeText) frag.appendChild(doc.createTextNode(beforeText));

        if (url) {
          const a = doc.createElement("a");
          a.className = "llm-anchor";
          a.setAttribute("href", url);
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
          a.textContent = keyword;
          frag.appendChild(a);
        } else {
          const b = doc.createElement("b");
          b.className = "llm-anchor";
          b.textContent = keyword;
          frag.appendChild(b);
        }

        if (afterText) frag.appendChild(doc.createTextNode(afterText));
        node.parentNode?.replaceChild(frag, node);
        replacedInNode = true;
        totalReplaced++;
      }
      replacementLog.push({ keyword, replaced: replacedInNode, via: "token-dom" });
    }

    // STEP 2: Upgrade <b>/<strong> -> <a> when URL exists and no correct link present
    for (const { keyword, url } of ordered) {
      if (!url) continue;
      const kwLower = keyword.toLowerCase();
      let hasCorrect = false;
      const links = container.querySelectorAll("a");
      for (const el of Array.from(links)) {
        const text = (el.textContent || "").trim().toLowerCase();
        const href = (el.getAttribute("href") || "").trim();
        if (text === kwLower && href.replace(/\/+$/, "") === url.replace(/\/+$/, "")) {
          hasCorrect = true;
          break;
        }
      }
      if (hasCorrect) continue;

      const bolds = container.querySelectorAll("b, strong");
      for (const el of Array.from(bolds)) {
        const text = (el.textContent || "").trim().toLowerCase();
        if (text === kwLower) {
          const a = doc.createElement("a");
          a.className = "llm-anchor";
          a.setAttribute("href", url);
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
          a.textContent = el.textContent || keyword;
          el.parentNode?.replaceChild(a, el);
          totalReplaced++;
          break;
        }
      }
    }

    // Helper to check if keyword already linked / bolded
    const hasLinked = (kw: string, url?: string) => {
      const kwLower = kw.toLowerCase();
      if (url) {
        const links = container.querySelectorAll("a");
        for (const el of Array.from(links)) {
          const text = (el.textContent || "").trim().toLowerCase();
          const href = (el.getAttribute("href") || "").trim();
          if (text === kwLower && href.replace(/\/+$/, "") === (url || "").replace(/\/+$/, "")) return true;
        }
        return false;
      } else {
        const els = container.querySelectorAll("a, b, strong");
        for (const el of Array.from(els)) {
          if ((el.textContent || "").trim().toLowerCase() === kwLower) return true;
        }
        return false;
      }
    };

    // STEP 3: Find first safe text occurrence for each keyword and wrap it
    for (const { keyword, url } of ordered) {
      if (!keyword) continue;
      if (hasLinked(keyword, url)) {
        replacementLog.push({ keyword, replaced: true, via: "already-dom" });
        continue;
      }

      // Unicode-aware word boundary attempt; fallback regex for most browsers
      const safePattern = `(^|[^\\p{L}\\p{N}_-])(${escapeRegExp(keyword)})(?=$|[^\\p{L}\\p{N}_-])`;
      const re = (() => {
        try {
          return new RegExp(safePattern, "iu");
        } catch {
          return new RegExp(`(^|\\W)(${escapeRegExp(keyword)})(?=$|\\W)`, "i");
        }
      })();

      const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(node: Node) {
          const text = node.nodeValue || "";
          if (!text.trim()) return NodeFilter.FILTER_REJECT;
          const parent = (node as Text).parentElement;
          if (!parent) return NodeFilter.FILTER_ACCEPT;
          const tag = parent.tagName.toLowerCase();
          if (
            tag === "a" ||
            tag === "script" ||
            tag === "style" ||
            tag === "textarea" ||
            tag === "code" ||
            tag === "pre" ||
            tag === "button" ||
            tag === "svg" ||
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
        }
      } as any);

      let replaced = false;
      while (!replaced && walker.nextNode()) {
        const node = walker.currentNode as Text;
        const text = node.nodeValue || "";
        const m = re.exec(text);
        if (!m) continue;

        // index of the keyword may be m.index + prefix length (m[1])
        let matchIndex = m.index ?? text.indexOf(m[2]);
        if (m[1]) matchIndex += m[1].length;
        const before = text.slice(0, matchIndex);
        const matched = text.slice(matchIndex, matchIndex + m[2].length);
        const after = text.slice(matchIndex + matched.length);

        const frag = doc.createDocumentFragment();
        if (before) frag.appendChild(doc.createTextNode(before));

        if (url) {
          const a = doc.createElement("a");
          a.className = "llm-anchor";
          a.setAttribute("href", url);
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
          a.textContent = matched;
          frag.appendChild(a);
        } else {
          const b = doc.createElement("b");
          b.className = "llm-anchor";
          b.textContent = matched;
          frag.appendChild(b);
        }

        if (after) frag.appendChild(doc.createTextNode(after));
        node.parentNode?.replaceChild(frag, node);
        replaced = true;
        totalReplaced++;
        replacementLog.push({ keyword, replaced: true, via: "dom-first-occurrence" });
      }

      if (!replaced) {
        // didn't find via DOM; mark as not replaced
        replacementLog.push({ keyword, replaced: false, via: "dom-no-match" });
      }
    }

    const out = container.innerHTML.replace(/\[ANCHOR:[^\]]+]/g, "");
    console.info("[applyAnchorTokens] totalReplaced:", totalReplaced, replacementLog);
    return out;
  } catch (err) {
    console.error("[applyAnchorTokens] DOM path failed:", err);
    const res = applyTextFallback(html);
    console.info("[applyAnchorTokens] fallback used after error:", totalReplaced, replacementLog);
    return res;
  }
}

/* small helpers */
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function escapeHtmlAttr(s: string) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHtml(s: string) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}


// /* -------------------------
//  * Small helpers
//  * ------------------------- */
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
