



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
    "Promote user engagement and readability.",
    "Add uniqueness and value beyond common knowledge.",
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
    "DETAILED INSTRUCTIONS (user/site prefs):",

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
