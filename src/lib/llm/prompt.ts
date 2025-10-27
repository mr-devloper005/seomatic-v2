// src/lib/llm/prompt.ts

export type PromptInput = {
  keywords: string[];              // 1, 2 or 4
  extraInstructions?: string;      // user textarea
  domainFocus?: string;
  brandName?: string;
};

function esc(s: string) {
  return String(s).replace(/"/g, '\\"');
}

export function buildPrompt({ keywords, extraInstructions, domainFocus, brandName }: PromptInput) {
  const uniq = Array.from(new Set(keywords.filter(Boolean).map(k => k.trim()))).slice(0, 4);
  const anchorTokens = uniq.map(k => `[ANCHOR:${k}]`).join(", ");
  const kwsHuman = uniq.join(", ");

  const extra = (extraInstructions || "").trim();
  const extraBlock = extra ? `\n- **STRICTLY FOLLOW USER NOTES:** ${esc(extra)}` : "";

  return `
You are a seasoned British editor. Natural, specific, not salesy. British spelling.

TASK
Return STRICT JSON only (no prose) with exactly this shape:
{
  "title": "<60-70 characters headline>",
  "html": "<well-structured HTML article>"
}

CONSTRAINTS
- "title": 60–70 characters. No quotes inside the title text itself.
- "html":
  - Start with a short vivid micro-scene (≤40 words).
  - Then a one-paragraph “why this matters”.
  - Then 5–7 uneven sections using <h2> and <h3>.
  - Include ≥4 concrete micro-details with real numbers/units (e.g., “±0.3 mm”, “190–220 gsm”, “20-minute cure”, “~500 KB”).
  - Include one small anecdote (1–3 sentences).
  - Include one counter-intuitive, useful tip.
  - End with a <h2>Conclusion</h2> section (do NOT start it with “In conclusion,”).
- Use British English and a clear, human tone (15–20yo vibe but practical).
- IMPORTANT: Insert **exactly one** anchor marker token for EACH provided keyword, using these exact tokens (one time each, anywhere it reads naturally): ${anchorTokens}.
  Do not write the visible keyword text yourself; we will swap these tokens with links later.
- Do not include ANY other square-bracket markers.
- No meta talk about prompts/AI or banned clichés (“look no further”, “step into”, etc.).${extraBlock}

INPUT
keywords: ${esc(kwsHuman)}
domain_focus: ${esc(domainFocus || "")}
brand_name: ${esc(brandName || "")}
`;
}
