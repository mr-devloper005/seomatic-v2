


// import { useState, useRef, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";
// import useHumanizeContent from "@/hooks/use-humanize-content";

// /** Logging */
// const GL = "[GEN]";
// const glog = (...a: any[]) => console.log(GL, ...a);
// const gwarn = (...a: any[]) => console.warn(GL, ...a);
// const gerr = (...a: any[]) => console.error(GL, ...a);

// /** Types */
// export interface ContentItem {
//   id: string;
//   keyword: string;
//   keywordsUsed?: string[];
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string;
//   title?: string;
//   targetUrl?: string | null;
//   urlMap?: Record<string, string | null>;
//   status?: "success" | "failed";
//   prefsSnapshot?: Partial<ContentPreferences>;
// }

// export interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (progress: number) => void;

// interface KeywordRow {
//   keyword: string;
//   url?: string | null;
// }

// /** Editor session helper */
// const SESSION_KEY = "open-content-item_v1";

// export function openContentEditor(item: ContentItem) {
//   try {
//     try {
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
//     } catch {
//       localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item));
//     }
//     const win = window.open("/content/editor", "_blank");
//     if (!win) {
//       toast.error("Popup blocked — allow popups to open the editor in a new tab.");
//     }
//   } catch {
//     try {
//       window.location.href = "/content/editor";
//     } catch {
//       // ignore
//     }
//   }
// }

// /** Small helpers */
// const norm = (s: unknown) =>
//   String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();

// function isLikelyUrlOrDomain(s?: string | null) {
//   if (!s) return false;
//   const t = String(s).trim();
//   if (!t) return false;
//   if (/^https?:\/\//i.test(t)) return true;
//   if (/^www\./i.test(t)) return true;
//   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(t) && !/\s/.test(t)) return true;
//   return false;
// }

// function sanitizeKeyword(raw: unknown): string {
//   if (raw == null) return "";
//   let v = String(raw).replace(/\u00A0/g, " ").trim();
//   if (!v) return "";
//   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim();
//   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
//   if (/^[\d\.,\s]+$/.test(v)) return "";
//   if (isLikelyUrlOrDomain(v)) return "";
//   if ((v.match(/[\p{L}\p{N}]/gu) || []).length < 2) return "";
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2 || v.length > 180) return "";
//   return v;
// }

// /** Excel parsing */
// const KW_HEADERS = new Set([
//   "keyword",
//   "keywords",
//   "focus keyword",
//   "search term",
//   "term",
//   "query",
//   "topic",
//   "title",
//   "key word",
// ]);

// const URL_HEADERS = new Set([
//   "url",
//   "link",
//   "target url",
//   "target",
//   "target page",
//   "landing page",
//   "page url",
//   "destination",
//   "href",
//   "target link",
// ]);

// function detectHeaderRowAndColumns(rows: unknown[][]) {
//   let headerRowIndex = -1;
//   const maxCheck = Math.min(rows.length, 6);

//   for (let i = 0; i < maxCheck; i++) {
//     const r = rows[i];
//     if (!Array.isArray(r)) continue;
//     const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
//     if (nonEmpty.length >= 2) {
//       headerRowIndex = i;
//       break;
//     }
//   }
//   if (headerRowIndex === -1) headerRowIndex = 0;

//   const headers = (rows[headerRowIndex] as unknown[]).map(norm);

//   let keywordCol: number | null = null;
//   let urlCol: number | null = null;

//   headers.forEach((h, idx) => {
//     if (keywordCol == null && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol == null && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol == null) {
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//     let bestCol: number | null = null;
//     let bestScore = 0;

//     for (let c = 0; c < maxCols; c++) {
//       let score = 0;
//       let checks = 0;
//       for (const rr of lookahead) {
//         if (!Array.isArray(rr)) continue;
//         const s = sanitizeKeyword(rr[c]);
//         if (s) score++;
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") {
//           checks++;
//         }
//       }
//       const weighted = score * 100 + Math.min(checks, 100);
//       if (checks === 0) continue;
//       if (weighted > bestScore) {
//         bestScore = weighted;
//         bestCol = c;
//       }
//     }
//     if (bestCol != null) keywordCol = bestCol;
//   }

//   return { headerRowIndex, keywordCol, urlCol };
// }

// function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || !rows.length) return [];

//   const { headerRowIndex, keywordCol, urlCol } = detectHeaderRowAndColumns(rows);

//   const start = Math.min(rows.length - 1, headerRowIndex + 1);
//   const dataRows = rows.slice(start);
//   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);

//   const out: KeywordRow[] = [];
//   const seen = new Set<string>();

//   for (const r of dataRows) {
//     if (!Array.isArray(r)) continue;

//     let k = "";
//     if (keywordCol != null) k = sanitizeKeyword(r[keywordCol]);
//     if (!k) {
//       for (let c = 0; c < maxCols; c++) {
//         const cand = sanitizeKeyword(r[c]);
//         if (cand) {
//           k = cand;
//           break;
//         }
//       }
//     }
//     if (!k || seen.has(k)) continue;

//     let url: string | null = null;

//     if (urlCol != null) {
//       const raw = String(r[urlCol] ?? "").trim();
//       if (raw && isLikelyUrlOrDomain(raw)) {
//         url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
//       }
//     }

//     if (!url) {
//       for (let offset = -3; offset <= 3; offset++) {
//         if (offset === 0) continue;
//         const idx = (keywordCol ?? 0) + offset;
//         if (idx < 0 || idx >= maxCols) continue;
//         const maybe = r[idx];
//         if (!maybe) continue;
//         const s = String(maybe).trim();
//         if (isLikelyUrlOrDomain(s)) {
//           url = /^https?:\/\//i.test(s) ? s : "https://" + s;
//           break;
//         }
//       }
//     }

//     out.push({ keyword: k, url });
//     seen.add(k);
//   }

//   return out;
// }

// function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array) {
//   const workbook = XLSX.read(buffer, { type: "array" });
//   const sheetNames = workbook.SheetNames ?? [];
//   const combined: KeywordRow[] = [];
//   const seen = new Set<string>();

//   for (const sheetName of sheetNames) {
//     try {
//       const sheet = workbook.Sheets[sheetName];
//       const ks = extractKeywordsFromWorksheetWithUrls(sheet);
//       for (const k of ks) {
//         if (!seen.has(k.keyword)) {
//           seen.add(k.keyword);
//           combined.push(k);
//         }
//       }
//       if (combined.length > 10000) break;
//     } catch (e) {
//       gwarn("worksheet parse failed:", sheetName, e);
//     }
//   }

//   return { keywords: combined };
// }

// /** HTML utility bits (trimmed to relevant pieces) */
// function stripLegacyStubBullets(html: string): string {
//   let out = html.replace(/<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi, "");
//   out = out.replace(/<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi, "");
//   out = out.replace(/<ul>\s*<\/ul>/gi, "");
//   out = out.replace(/<ol>\s*<\/ol>/gi, "");
//   return out;
// }

// function getWordCount(html: string): number {
//   const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
//   if (!text) return 0;
//   return text.split(/\s+/).length;
// }

// function adjustWordCount(html: string, targetWords: number): string {
//   const current = getWordCount(html);
//   const delta = Math.max(30, Math.round(targetWords * 0.05));
//   const min = Math.max(50, targetWords - delta);
//   const max = targetWords + delta;
//   if (current >= min && current <= max) return html;
//   if (current <= max) return html;

//   const paragraphs = html.split(/<\/p>/i);
//   let trimmed = "";
//   let count = 0;

//   for (let i = 0; i < paragraphs.length; i++) {
//     const para = paragraphs[i] + (i < paragraphs.length - 1 ? "</p>" : "");
//     const words = getWordCount(para);
//     if (count + words <= max) {
//       trimmed += para;
//       count += words;
//     } else {
//       const plain = para.replace(/<[^>]+>/g, " ");
//       const parts = plain.split(/\s+/).filter(Boolean);
//       const keep = Math.max(10, max - count);
//       if (keep > 0 && keep < parts.length) {
//         const short = parts.slice(0, keep).join(" ");
//         trimmed += para.replace(/>([^<]*)</, `>${short}<`);
//       }
//       break;
//     }
//   }

//   return trimmed || html;
// }

// /** Duplicate/sections helpers */
// function removeDuplicateSections(html: string): string {
//   if (!html) return html;

//   const h2Regex = /<h2>([\s\S]*?)<\/h2>/gi;
//   const sections: { heading: string; content: string; index: number }[] = [];
//   let match: RegExpExecArray | null;

//   while ((match = h2Regex.exec(html)) !== null) {
//     const heading = match[1].trim().toLowerCase();
//     const start = match.index;
//     const after = html.slice(start + match[0].length);
//     const next = after.search(/<h2>/i);
//     const end = next !== -1 ? start + match[0].length + next : html.length;
//     const content = html.slice(start, end);
//     sections.push({ heading, content, index: start });
//   }

//   if (!sections.length) return html;

//   const seen = new Map<string, string>(); // heading -> contentSignature
//   const keep: typeof sections = [];

//   for (const sec of sections) {
//     const body = sec.content
//       .replace(/<h2>[\s\S]*?<\/h2>/i, "")
//       .replace(/<[^>]+>/g, " ")
//       .replace(/\s+/g, " ")
//       .trim()
//       .toLowerCase();
//     const sig = body.slice(0, 260);

//     if (!seen.has(sec.heading)) {
//       seen.set(sec.heading, sig);
//       keep.push(sec);
//       continue;
//     }

//     const prevSig = seen.get(sec.heading)!;
//     const len = Math.min(prevSig.length, sig.length, 180);
//     if (!len || prevSig.slice(0, len) !== sig.slice(0, len)) {
//       keep.push(sec);
//     }
//   }

//   if (keep.length === sections.length) return html;

//   const outParts: string[] = [];
//   let cursor = 0;

//   for (const sec of keep) {
//     if (sec.index > cursor) outParts.push(html.slice(cursor, sec.index));
//     outParts.push(sec.content);
//     cursor = sec.index + sec.content.length;
//   }
//   if (cursor < html.length) outParts.push(html.slice(cursor));

//   return outParts.join("");
// }

// function limitSections(html: string, maxSections: number): string {
//   if (!html || maxSections <= 0) return html;

//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   const sections: { index: number; content: string }[] = [];
//   let match: RegExpExecArray | null;

//   while ((match = h2Regex.exec(html)) !== null) {
//     const start = match.index;
//     const after = html.slice(start + match[0].length);
//     const next = after.search(/<h2>/i);
//     const end = next !== -1 ? start + match[0].length + next : html.length;
//     const content = html.slice(start, end);
//     sections.push({ index: start, content });
//   }

//   if (sections.length <= maxSections) return html;

//   const keep = sections.slice(0, maxSections);
//   const parts: string[] = [];
//   let cursor = 0;

//   for (const sec of keep) {
//     if (sec.index > cursor) parts.push(html.slice(cursor, sec.index));
//     parts.push(sec.content);
//     cursor = sec.index + sec.content.length;
//   }

//   if (cursor < html.length) {
//     const tail = html.slice(cursor);
//     if (!/^<h2>/i.test(tail.trim())) parts.push(tail);
//   }

//   return parts.join("");
// }

// /** Token helpers */
// function injectTokenIntoNthSection(html: string, sectionIndexZero: number, token: string): string {
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   const matches: { index: number; match: string }[] = [];
//   let m: RegExpExecArray | null;

//   while ((m = h2Regex.exec(html)) !== null) {
//     matches.push({ index: m.index, match: m[0] });
//   }

//   if (!matches.length) {
//     const firstP = html.match(/<p>[\s\S]*?<\/p>/i);
//     if (!firstP) return html + token;
//     const pHtml = firstP[0];
//     const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//     const words = inner.split(/\s+/);
//     if (words.length < 3) return html.replace(pHtml, `<p>${inner} ${token}</p>`);
//     const at = Math.max(1, Math.floor(words.length * 0.5));
//     const out =
//       "<p>" + words.slice(0, at).join(" ") + " " + token + " " + words.slice(at).join(" ") + "</p>";
//     return html.replace(pHtml, out);
//   }

//   const target = matches[Math.min(sectionIndexZero, matches.length - 1)];
//   const before = html.slice(0, target.index + target.match.length);
//   const after = html.slice(target.index + target.match.length);

//   const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
//   if (!pMatch) {
//     return before + `<p>${token}</p>` + after;
//   }

//   const pHtml = pMatch[0];
//   const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//   const words = inner.split(/\s+/);
//   let outHtml: string;

//   if (words.length < 3) {
//     outHtml = `<p>${inner} ${token}</p>`;
//   } else {
//     let at = Math.max(1, Math.floor(words.length * 0.55));
//     if (at > words.length - 2) at = Math.max(1, words.length - 2);
//     outHtml = "<p>" + words.slice(0, at).join(" ") + " " + token + " " + words.slice(at).join(" ") + "</p>";
//   }

//   return before + after.replace(pHtml, outHtml);
// }

// function ensureAllKeywordsPresent(html: string, keywords: string[]): string {
//   if (!keywords?.length || !html) return html;

//   const paraRegex = /<p[^>]*>[\s\S]*?<\/p>/gi;
//   const paras: { match: string; index: number }[] = [];
//   let m: RegExpExecArray | null;

//   while ((m = paraRegex.exec(html)) !== null) {
//     paras.push({ match: m[0], index: m.index });
//   }

//   const missing: string[] = [];

//   for (const rawKw of keywords) {
//     const kw = (rawKw || "").trim();
//     if (!kw) continue;
//     const lower = kw.toLowerCase();
//     const esc = lower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//     if (
//       html.includes(`[ANCHOR:${kw}]`) ||
//       new RegExp(`<a[^>]*>\\s*${esc}\\s*<\\/a>`, "i").test(html) ||
//       new RegExp(`<strong[^>]*>\\s*${esc}\\s*<\\/strong>`, "i").test(html)
//     ) {
//       continue;
//     }

//     let foundInP = false;
//     for (const p of paras) {
//       const text = p.match.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
//       if (new RegExp(`\\b${esc}\\b`, "i").test(text)) {
//         foundInP = true;
//         break;
//       }
//     }

//     if (!foundInP) missing.push(kw);
//   }

//   if (!missing.length) return html;

//   let result = html;
//   const updates: { index: number; from: string; to: string }[] = [];
//   let mi = 0;

//   for (let i = paras.length - 1; i >= 0 && mi < missing.length; i--) {
//     const p = paras[i];
//     if (/\[ANCHOR:[^\]]+]/.test(p.match)) continue;

//     const kw = missing[mi++];
//     const inner = p.match.replace(/^<p[^>]*>/i, "").replace(/<\/p>$/i, "").trim();
//     const words = inner.split(/\s+/).filter(Boolean);

//     let newP: string;
//     if (words.length >= 3) {
//       const at = Math.max(1, Math.floor(words.length * 0.5));
//       newP = "<p>" + words.slice(0, at).join(" ") + ` [ANCHOR:${kw}] ` + words.slice(at).join(" ") + "</p>";
//     } else {
//       newP = `<p>${inner} [ANCHOR:${kw}]</p>`;
//     }

//     updates.push({
//       index: p.index,
//       from: p.match,
//       to: newP,
//     });
//   }

//   updates.sort((a, b) => b.index - a.index);
//   for (const u of updates) {
//     result = result.slice(0, u.index) + u.to + result.slice(u.index + u.from.length);
//   }

//   const remaining = missing.slice(mi);
//   if (remaining.length) {
//     result += `<p>${remaining.map((kw) => `[ANCHOR:${kw}]`).join(" ")}</p>`;
//   }

//   return result;
// }

// function enforceKeywordRules(html: string, keywords: string[]): string {
//   if (!keywords?.length || !html) return html;

//   const paraRegex = /<p>([\s\S]*?)<\/p>/gi;
//   const parts: string[] = [];
//   let lastIndex = 0;
//   let m: RegExpExecArray | null;

//   while ((m = paraRegex.exec(html)) !== null) {
//     if (m.index > lastIndex) {
//       parts.push(html.slice(lastIndex, m.index));
//     }
//     const full = m[0];
//     const inner = m[1];

//     const found: string[] = [];
//     const plain = inner.replace(/<[^>]+>/g, " ").toLowerCase();

//     for (const kw of keywords) {
//       const esc = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//       if (new RegExp(`\\b${esc}\\b`, "i").test(plain)) {
//         found.push(kw);
//       }
//     }

//     if (found.length <= 1) {
//       parts.push(full);
//     } else {
//       // keep first, remove extra plain mentions (anchors/strong left as-is)
//       // const keep = found[0];
//       let mod = full;
//       for (let i = 1; i < found.length; i++) {
//         const kw = found[i];
//         const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//         const re = new RegExp(`\\b${esc}\\b`, "gi");
//         mod = mod.replace(re, (match, offset) => {
//           const before = mod.slice(Math.max(0, offset - 80), offset);
//           const after = mod.slice(offset + match.length, offset + match.length + 80);
//           const inA = before.lastIndexOf("<a") > before.lastIndexOf("</a>") && after.includes("</a>");
//           const inS = before.lastIndexOf("<strong") > before.lastIndexOf("</strong>") && after.includes("</strong>");
//           return inA || inS ? match : "";
//         });
//       }
//       parts.push(mod);
//     }

//     lastIndex = m.index + m[0].length;
//   }

//   if (lastIndex < html.length) {
//     parts.push(html.slice(lastIndex));
//   }

//   return parts.join("");
// }

// /** Grouping helpers */
// function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) {
//     groups.push(rows.slice(i, i + size));
//   }
//   return groups;
// }

// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0 || !arr.length) return [];
//   if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
//   const taken = new Set<number>();
//   while (taken.size < Math.min(size, arr.length)) {
//     taken.add(Math.floor(Math.random() * arr.length));
//   }
//   const out = Array.from(taken).map((i) => arr[i]);
//   while (out.length < size) {
//     out.push(arr[Math.floor(Math.random() * arr.length)]);
//   }
//   return out;
// }

// function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) {
//     groups.push(sampleDistinct(rows, size));
//   }
//   return groups;
// }

// /** Cancel token */
// type CancelToken = { cancelled: boolean };

// /** Hook */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const { humanizeHtml } = useHumanizeContent();
//   const cancelTokensRef = useRef<Record<string, CancelToken>>({});

//   const recomputeIsProcessing = (projects: ExcelProject[]) =>
//     projects.some((p) => p.status === "processing");

//   /** ensureProject — keeps status as literal union */
//   const ensureProject = (
//     proj: Partial<Omit<ExcelProject, "status">> & {
//       id: string;
//       fileName: string;
//       status?: ExcelProject["status"];
//     }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev) => {
//         const list = prev;
//         const existing = list.find((p) => p.id === proj.id);

//         const status: ExcelProject["status"] = proj.status ?? existing?.status ?? "pending";

//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status,
//           totalKeywords: proj.totalKeywords ?? existing?.totalKeywords ?? 0,
//           processedKeywords: proj.processedKeywords ?? existing?.processedKeywords ?? 0,
//           createdAt: proj.createdAt ?? existing?.createdAt ?? new Date().toISOString(),
//           error: proj.error ?? existing?.error,
//           failedCount: proj.failedCount ?? existing?.failedCount ?? 0,
//         };

//         const next: ExcelProject[] = existing
//           ? list.map<ExcelProject>((p) => (p.id === proj.id ? base : p))
//           : [...list, base];

//         setIsProcessing(recomputeIsProcessing(next));
//         return next;
//       });
//     });
//   };

//   const flushBufferToState = (buffer: ContentItem[]) => {
//     if (!buffer.length) return;
//     const toWrite = buffer.splice(0, buffer.length);
//     startTransition(() => {
//       setContentItems((prev) => [...prev, ...toWrite]);
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     const cancelToken: CancelToken = { cancelled: false };
//     cancelTokensRef.current[fileId] = cancelToken;

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduledFlush = false;
//     const BATCH_SIZE = 80;

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) {
//         flushBufferToState(bufferItems);
//         scheduledFlush = false;
//         return;
//       }
//       if (!scheduledFlush) {
//         scheduledFlush = true;
//         queueMicrotask(() => {
//           flushBufferToState(bufferItems);
//           scheduledFlush = false;
//         });
//       }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev) => {
//           const next = prev.map<ExcelProject>((p) =>
//             p.id === fileId ? { ...p, processedKeywords: processed } : p
//           );
//           setIsProcessing(recomputeIsProcessing(next));
//           return next;
//         });
//       });

//       try {
//         const pct = Math.round((processed / Math.max(1, total)) * 100);
//         onProgress?.(pct);
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
//       if (cancelToken.cancelled) return;

//       const { keywords } = extractKeywordsFromWorkbookBufferWithUrls(buffer);

//       if (!keywords.length) {
//         ensureProject({
//           id: fileId,
//           fileName: file.name,
//           status: "error",
//           error: "No valid keywords found in the uploaded Excel file",
//         });
//         toast.error("No valid keywords found in the uploaded Excel file.");
//         onProgress?.(100);
//         return;
//       }

//       const prefs: ContentPreferences = (() => {
//         try {
//           const raw = localStorage.getItem("content-preferences_v3");
//           const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
//           return {
//             keywordMode: 1,
//             targetWords: 500,
//             extraInstructions: "",
//             mood: "Informative",
//             paragraphWords: 100,
//             includeConclusion: true,
//             customModeEnabled: false,
//             articleCount: 1,
//             language: "English (UK)",
//             totalContentWords: 800,
//             titleLength: 100,
//             includeBulletPoints: false,
//             includeTables: false,
//             includeEmojis: false,
//             includeBoxesQuotesHighlights: false,
//             includeQandA: false,
//             brandDomainEnabled: false,
//             brandDomain: "",
//             ...parsed,
//           };
//         } catch {
//           return {
//             keywordMode: 1,
//             targetWords: 500,
//             extraInstructions: "",
//             mood: "Informative",
//             paragraphWords: 100,
//             includeConclusion: true,
//             customModeEnabled: false,
//             articleCount: 1,
//             language: "English (UK)",
//             totalContentWords: 800,
//             titleLength: 100,
//             includeBulletPoints: false,
//             includeTables: false,
//             includeEmojis: false,
//             includeBoxesQuotesHighlights: false,
//             includeQandA: false,
//             brandDomainEnabled: false,
//             brandDomain: "",
//           };
//         }
//       })();

//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
//         : buildGroupsNormal(keywords, size);

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(`Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article`);

//       const cores =
//         typeof navigator !== "undefined" && (navigator as any).hardwareConcurrency
//           ? (navigator as any).hardwareConcurrency
//           : 4;
//       let concurrency = Math.min(Math.max(8, cores * 2), 24);
//       const MAX = 36;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (cancelToken.cancelled) return;
//         if (idx >= baseGroups.length) return;

//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];
//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

//         const task = (async () => {
//           if (cancelToken.cancelled) return;
//           try {
//             glog("Starting group", { groupIndex, keywords: kws });

//             const plan = buildPlanFromPrefs({
//               keywords: kws,
//               prefs,
//               variationId: groupIndex + 1,
//             });

//             const result = await generateJSONTitleHtml({
//               keywords: kws,
//               instructions: plan,
//               titleLength: prefs.titleLength || 100,
//             });

//             if (cancelToken.cancelled) return;

//             let html = String(result.html || "").trim();
//             if (!html) throw new Error("Empty html from model");

//             if (prefs.totalContentWords && prefs.totalContentWords > 0) {
//               html = adjustWordCount(html, prefs.totalContentWords);
//             }

//             // Structure/dedupe
//             for (let i = 0; i < 3; i++) {
//               const before = html.length;
//               html = removeDuplicateSections(html);
//               if (html.length === before) break;
//             }

//             const maxSections = 8;
//             html = limitSections(html, maxSections);
//             html = removeDuplicateSections(html);

//             // Place tokens
//             for (let i = 0; i < kws.length; i++) {
//               html = injectTokenIntoNthSection(html, i % maxSections, `[ANCHOR:${kws[i]}]`);
//             }

//             html = ensureAllKeywordsPresent(html, kws);

//             const anchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));

//             html = applyAnchorTokens(html, anchors);
//             html = html.replace(/\[ANCHOR:[^\]]+]/g, "");
//             html = stripLegacyStubBullets(html);
//             html = enforceKeywordRules(html, kws);
//             html = ensureAllKeywordsPresent(html, kws);
//             html = removeDuplicateSections(html);

//             // Humanize
//             let humanizedHtml = await humanizeHtml(
//               html,
//               { strength: 0.6, allowImperfect: true },
//               `${fileId}-${groupIndex}`
//             );
//             if (cancelToken.cancelled) return;

//             humanizedHtml = removeDuplicateSections(humanizedHtml);
//             humanizedHtml = ensureAllKeywordsPresent(humanizedHtml, kws);

//             const finalAnchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));

//             humanizedHtml = applyAnchorTokens(humanizedHtml, finalAnchors);
//             humanizedHtml = humanizedHtml.replace(/\[ANCHOR:[^\]]+]/g, "");
//             humanizedHtml = removeDuplicateSections(humanizedHtml);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: humanizedHtml,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title: result.title,
//               targetUrl: urlMap[kws[0]] ?? null,
//               urlMap,
//               status: "success",
//               prefsSnapshot: {
//                 mood: prefs.mood,
//                 paragraphWords: prefs.paragraphWords,
//                 includeConclusion: prefs.includeConclusion,
//                 language: prefs.language,
//                 customModeEnabled: prefs.customModeEnabled,
//                 articleCount: prefs.articleCount,
//                 keywordMode: prefs.keywordMode,
//                 includeBulletPoints: prefs.includeBulletPoints,
//                 includeTables: prefs.includeTables,
//                 includeEmojis: prefs.includeEmojis,
//                 includeBoxesQuotesHighlights: prefs.includeBoxesQuotesHighlights,
//                 includeQandA: prefs.includeQandA,
//                 totalContentWords: prefs.totalContentWords,
//                 titleLength: prefs.titleLength,
//                 brandDomainEnabled: prefs.brandDomainEnabled,
//                 brandDomain: prefs.brandDomain,
//               },
//             };

//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             if (!cancelToken.cancelled) {
//               failedCount++;
//               failedGroups.push({ index: groupIndex, grp });
//               gerr("group generate error:", e);
//             }
//           } finally {
//             processedCount += 1;
//             if (!cancelToken.cancelled) {
//               updateProgress(processedCount, baseGroups.length);
//             }
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (!cancelToken.cancelled && (idx < baseGroups.length || running.size > 0)) {
//         const cur = Math.max(8, Math.min(Math.floor(concurrency), MAX));
//         while (running.size < cur && idx < baseGroups.length && !cancelToken.cancelled) {
//           startNext();
//         }
//         if (!running.size) break;
//         await Promise.race(Array.from(running));

//         if (failedCount > processedCount * 0.25 && concurrency > 8) {
//           concurrency -= 0.5;
//           gwarn("High failure rate, reducing concurrency:", concurrency);
//         } else if (concurrency < MAX && failedCount < processedCount * 0.08) {
//           concurrency += 0.75;
//           glog("Low failure rate, increasing concurrency:", concurrency);
//         }
//       }

//       // If cancelled: don't mark completed
//       if (cancelToken.cancelled) {
//         flushBufferToState(bufferItems);
//         return;
//       }

//       // One-pass retry
//       if (failedGroups.length) {
//         toast.message(`Retrying ${failedGroups.length} failed item(s)…`);
//         const queue = [...failedGroups];
//         failedGroups.length = 0;
//         const RETRY_CONC = 6;
//         const running2 = new Set<Promise<void>>();

//         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
//           if (cancelToken.cancelled) return;
//           const kws = grp.map((g) => g.keyword);
//           const urlMap: Record<string, string | null> = {};
//           grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

//           const plan = buildPlanFromPrefs({
//             keywords: kws,
//             prefs,
//             variationId: groupIndex + 1,
//           });
//           const res = await generateJSONTitleHtml({
//             keywords: kws,
//             instructions: plan,
//             titleLength: prefs.titleLength || 100,
//           });
//           if (cancelToken.cancelled) return;

//           let html = String(res.html || "").trim();
//           if (!html) throw new Error("Empty html (retry)");

//           const maxSections = 8;
//           for (let i = 0; i < Math.min(kws.length, 4); i++) {
//             html = injectTokenIntoNthSection(html, i % maxSections, `[ANCHOR:${kws[i]}]`);
//           }

//           html = ensureAllKeywordsPresent(html, kws);
//           const anchors = Object.keys(urlMap).map((k) => ({
//             keyword: k,
//             url: urlMap[k] || undefined,
//           }));
//           html = applyAnchorTokens(html, anchors);
//           html = html.replace(/\[ANCHOR:[^\]]+]/g, "");
//           html = stripLegacyStubBullets(html);
//           html = enforceKeywordRules(html, kws);
//           html = ensureAllKeywordsPresent(html, kws);

//           let humanizedHtml = await humanizeHtml(
//             html,
//             { strength: 0.6, allowImperfect: true },
//             `${fileId}-retry-${groupIndex}`
//           );
//           if (cancelToken.cancelled) return;

//           humanizedHtml = ensureAllKeywordsPresent(humanizedHtml, kws);
//           humanizedHtml = applyAnchorTokens(humanizedHtml, anchors);
//           humanizedHtml = humanizedHtml.replace(/\[ANCHOR:[^\]]+]/g, "");

//           const item: ContentItem = {
//             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
//             keyword: kws[0],
//             keywordsUsed: kws,
//             generatedContent: humanizedHtml,
//             fileId,
//             fileName: file.name,
//             createdAt: new Date().toISOString(),
//             title: res.title,
//             targetUrl: urlMap[kws[0]] ?? null,
//             urlMap,
//             status: "success",
//             prefsSnapshot: {
//               mood: prefs.mood,
//               paragraphWords: prefs.paragraphWords,
//               includeConclusion: prefs.includeConclusion,
//               language: prefs.language,
//               customModeEnabled: prefs.customModeEnabled,
//               articleCount: prefs.articleCount,
//               keywordMode: prefs.keywordMode,
//               includeBulletPoints: prefs.includeBulletPoints,
//               includeTables: prefs.includeTables,
//               includeEmojis: prefs.includeEmojis,
//               includeBoxesQuotesHighlights: prefs.includeBoxesQuotesHighlights,
//               includeQandA: prefs.includeQandA,
//               totalContentWords: prefs.totalContentWords,
//               titleLength: prefs.titleLength,
//               brandDomainEnabled: prefs.brandDomainEnabled,
//               brandDomain: prefs.brandDomain,
//             },
//           };

//           bufferItems.push(item);
//           scheduleFlush();
//         };

//         const startNextRetry = () => {
//           if (cancelToken.cancelled) return;
//           if (!queue.length) return;
//           const { grp, index } = queue.shift()!;
//           const p = (async () => {
//             try {
//               await runOne(grp, index);
//             } catch (e) {
//               gerr("retry failed:", e);
//             }
//           })().finally(() => running2.delete(p));
//           running2.add(p);
//         };

//         while (running2.size < RETRY_CONC && queue.length && !cancelToken.cancelled) {
//           startNextRetry();
//         }
//         while ((running2.size || queue.length) && !cancelToken.cancelled) {
//           await Promise.race(Array.from(running2));
//           while (running2.size < RETRY_CONC && queue.length && !cancelToken.cancelled) {
//             startNextRetry();
//           }
//           await new Promise((r) => setTimeout(r, 80));
//         }
//       }

//       flushBufferToState(bufferItems);

//       if (!cancelToken.cancelled) {
//         startTransition(() => {
//           setExcelProjects((prev) => {
//             const next = prev.map<ExcelProject>((p) =>
//               p.id === fileId
//                 ? {
//                     ...p,
//                     status: "completed" as const,
//                     processedKeywords: baseGroups.length,
//                     failedCount,
//                   }
//                 : p
//             );
//             setIsProcessing(recomputeIsProcessing(next));
//             return next;
//           });
//         });

//         const ok = baseGroups.length - failedCount;
//         glog("generateContent DONE", { ok, failedCount, total: baseGroups.length });
//         toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
//         onProgress?.(100);
//       }
//     } catch (error) {
//       gerr("generateContent overall error:", error);
//       startTransition(() => {
//         setExcelProjects((prev) => {
//           const next = prev.map<ExcelProject>((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "error" as const,
//                   error: error instanceof Error ? error.message : String(error),
//                 }
//               : p
//           );
//           setIsProcessing(recomputeIsProcessing(next));
//           return next;
//         });
//       });
//       toast.error(
//         `Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushBufferToState(bufferItems);
//       delete cancelTokensRef.current[fileId];

//       startTransition(() => {
//         setExcelProjects((prev) => {
//           setIsProcessing(recomputeIsProcessing(prev));
//           return prev;
//         });
//       });
//     }
//   };

//   const cancelProject = (projectId: string) => {
//     const token = cancelTokensRef.current[projectId];
//     if (token) token.cancelled = true;

//     startTransition(() => {
//       setExcelProjects((prev) => {
//         const next = prev.map<ExcelProject>((p) =>
//           p.id === projectId ? { ...p, status: "error" as const, error: "Cancelled by user" } : p
//         );
//         setIsProcessing(recomputeIsProcessing(next));
//         return next;
//       });
//     });

//     toast.message("Generation cancelled for this project.");
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects((prev) => {
//         const next = prev.filter((p) => p.id !== projectId);
//         setIsProcessing(recomputeIsProcessing(next));
//         return next;
//       });
//       setContentItems((prev) => prev.filter((c) => c.fileId !== projectId));
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects((_prev) => {
//         setIsProcessing(false);
//         return [];
//       });
//       setContentItems((_prev) => []);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
//     cancelProject,
//     isProcessing,
//     contentItems,
//     setContentItems,
//     excelProjects,
//     setExcelProjects,
//     deleteProject,
//     deleteAllProjects,
//     openContentEditor,
//   };
// }

// export default useContentGeneration;





import { useState, useRef, startTransition } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import * as XLSX from "xlsx";
import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

/** Logging */
const GL = "[GEN]";
const glog = (...a: any[]) => console.log(GL, ...a);
const gwarn = (...a: any[]) => console.warn(GL, ...a);
const gerr = (...a: any[]) => console.error(GL, ...a);

/** Types */
export interface ContentItem {
  id: string;
  keyword: string;
  keywordsUsed?: string[];
  generatedContent: string;
  fileId: string;
  fileName: string;
  createdAt: string;
  title?: string;
  targetUrl?: string | null;
  urlMap?: Record<string, string | null>;
  status?: "success" | "failed";
  prefsSnapshot?: Partial<ContentPreferences>;
}

export interface ExcelProject {
  id: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "error";
  totalKeywords: number;
  processedKeywords: number;
  createdAt: string;
  error?: string;
  failedCount?: number;
}

type GenerateProgressCallback = (progress: number) => void;

interface KeywordRow {
  keyword: string;
  url?: string | null;
}

/** Editor session helper */
const SESSION_KEY = "open-content-item_v1";

export function openContentEditor(item: ContentItem) {
  try {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
    } catch {
      localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item));
    }
    const win = window.open("/content/editor", "_blank");
    if (!win) {
      toast.error("Popup blocked — allow popups to open the editor in a new tab.");
    }
  } catch {
    try {
      window.location.href = "/content/editor";
    } catch {
      // ignore
    }
  }
}

/** Small helpers */
const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[.\-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function isLikelyUrlOrDomain(s?: string | null) {
  if (!s) return false;
  const t = String(s).trim();
  if (!t) return false;
  if (/^https?:\/\//i.test(t)) return true;
  if (/^www\./i.test(t)) return true;
  if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(t) && !/\s/.test(t)) return true;
  return false;
}

function sanitizeKeyword(raw: unknown): string {
  if (raw == null) return "";
  let v = String(raw).replace(/\u00A0/g, " ").trim();
  if (!v) return "";
  v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim();
  v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
  if (/^[\d\.,\s]+$/.test(v)) return "";
  if (isLikelyUrlOrDomain(v)) return "";
  if ((v.match(/[\p{L}\p{N}]/gu) || []).length < 2) return "";
  v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
  if (v.length < 2 || v.length > 180) return "";
  return v;
}

/** Excel parsing */
const KW_HEADERS = new Set([
  "keyword",
  "keywords",
  "focus keyword",
  "search term",
  "term",
  "query",
  "topic",
  "title",
  "key word",
]);

const URL_HEADERS = new Set([
  "url",
  "link",
  "target url",
  "target",
  "target page",
  "landing page",
  "page url",
  "destination",
  "href",
  "target link",
]);

function detectHeaderRowAndColumns(rows: unknown[][]) {
  let headerRowIndex = -1;
  const maxCheck = Math.min(rows.length, 6);

  for (let i = 0; i < maxCheck; i++) {
    const r = rows[i];
    if (!Array.isArray(r)) continue;
    const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
    if (nonEmpty.length >= 2) {
      headerRowIndex = i;
      break;
    }
  }
  if (headerRowIndex === -1) headerRowIndex = 0;

  const headers = (rows[headerRowIndex] as unknown[]).map(norm);

  let keywordCol: number | null = null;
  let urlCol: number | null = null;

  headers.forEach((h, idx) => {
    if (keywordCol == null && KW_HEADERS.has(h)) keywordCol = idx;
    if (urlCol == null && URL_HEADERS.has(h)) urlCol = idx;
  });

  if (keywordCol == null) {
    const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
    const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
    let bestCol: number | null = null;
    let bestScore = 0;

    for (let c = 0; c < maxCols; c++) {
      let score = 0;
      let checks = 0;
      for (const rr of lookahead) {
        if (!Array.isArray(rr)) continue;
        const s = sanitizeKeyword(rr[c]);
        if (s) score++;
        if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") {
          checks++;
        }
      }
      const weighted = score * 100 + Math.min(checks, 100);
      if (checks === 0) continue;
      if (weighted > bestScore) {
        bestScore = weighted;
        bestCol = c;
      }
    }
    if (bestCol != null) keywordCol = bestCol;
  }

  return { headerRowIndex, keywordCol, urlCol };
}

function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
  if (!rows || !rows.length) return [];

  const { headerRowIndex, keywordCol, urlCol } = detectHeaderRowAndColumns(rows);

  const start = Math.min(rows.length - 1, headerRowIndex + 1);
  const dataRows = rows.slice(start);
  const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);

  const out: KeywordRow[] = [];
  const seen = new Set<string>();

  for (const r of dataRows) {
    if (!Array.isArray(r)) continue;

    let k = "";
    if (keywordCol != null) k = sanitizeKeyword(r[keywordCol]);
    if (!k) {
      for (let c = 0; c < maxCols; c++) {
        const cand = sanitizeKeyword(r[c]);
        if (cand) {
          k = cand;
          break;
        }
      }
    }
    if (!k || seen.has(k)) continue;

    let url: string | null = null;

    if (urlCol != null) {
      const raw = String(r[urlCol] ?? "").trim();
      if (raw && isLikelyUrlOrDomain(raw)) {
        url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
      }
    }

    if (!url) {
      for (let offset = -3; offset <= 3; offset++) {
        if (offset === 0) continue;
        const idx = (keywordCol ?? 0) + offset;
        if (idx < 0 || idx >= maxCols) continue;
        const maybe = r[idx];
        if (!maybe) continue;
        const s = String(maybe).trim();
        if (isLikelyUrlOrDomain(s)) {
          url = /^https?:\/\//i.test(s) ? s : "https://" + s;
          break;
        }
      }
    }

    out.push({ keyword: k, url });
    seen.add(k);
  }

  return out;
}

function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetNames = workbook.SheetNames ?? [];
  const combined: KeywordRow[] = [];
  const seen = new Set<string>();

  for (const sheetName of sheetNames) {
    try {
      const sheet = workbook.Sheets[sheetName];
      const ks = extractKeywordsFromWorksheetWithUrls(sheet);
      for (const k of ks) {
        if (!seen.has(k.keyword)) {
          seen.add(k.keyword);
          combined.push(k);
        }
      }
      if (combined.length > 10000) break;
    } catch (e) {
      gwarn("worksheet parse failed:", sheetName, e);
    }
  }

  return { keywords: combined };
}

/** HTML utility bits (trimmed to relevant pieces) */
function stripLegacyStubBullets(html: string): string {
  let out = html.replace(/<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi, "");
  out = out.replace(/<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi, "");
  out = out.replace(/<ul>\s*<\/ul>/gi, "");
  out = out.replace(/<ol>\s*<\/ol>/gi, "");
  return out;
}

function getWordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function adjustWordCount(html: string, targetWords: number): string {
  const current = getWordCount(html);
  const delta = Math.max(30, Math.round(targetWords * 0.05));
  const min = Math.max(50, targetWords - delta);
  const max = targetWords + delta;
  if (current >= min && current <= max) return html;
  if (current <= max) return html;

  const paragraphs = html.split(/<\/p>/i);
  let trimmed = "";
  let count = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i] + (i < paragraphs.length - 1 ? "</p>" : "");
    const words = getWordCount(para);
    if (count + words <= max) {
      trimmed += para;
      count += words;
    } else {
      const plain = para.replace(/<[^>]+>/g, " ");
      const parts = plain.split(/\s+/).filter(Boolean);
      const keep = Math.max(10, max - count);
      if (keep > 0 && keep < parts.length) {
        const short = parts.slice(0, keep).join(" ");
        trimmed += para.replace(/>([^<]*)</, `>${short}<`);
      }
      break;
    }
  }

  return trimmed || html;
}

/** Duplicate/sections helpers */
function removeDuplicateSections(html: string): string {
  if (!html) return html;

  const h2Regex = /<h2>([\s\S]*?)<\/h2>/gi;
  const sections: { heading: string; content: string; index: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = h2Regex.exec(html)) !== null) {
    const heading = match[1].trim().toLowerCase();
    const start = match.index;
    const after = html.slice(start + match[0].length);
    const next = after.search(/<h2>/i);
    const end = next !== -1 ? start + match[0].length + next : html.length;
    const content = html.slice(start, end);
    sections.push({ heading, content, index: start });
  }

  if (!sections.length) return html;

  const seen = new Map<string, string>(); // heading -> contentSignature
  const keep: typeof sections = [];

  for (const sec of sections) {
    const body = sec.content
      .replace(/<h2>[\s\S]*?<\/h2>/i, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    const sig = body.slice(0, 260);

    if (!seen.has(sec.heading)) {
      seen.set(sec.heading, sig);
      keep.push(sec);
      continue;
    }

    const prevSig = seen.get(sec.heading)!;
    const len = Math.min(prevSig.length, sig.length, 180);
    if (!len || prevSig.slice(0, len) !== sig.slice(0, len)) {
      keep.push(sec);
    }
  }

  if (keep.length === sections.length) return html;

  const outParts: string[] = [];
  let cursor = 0;

  for (const sec of keep) {
    if (sec.index > cursor) outParts.push(html.slice(cursor, sec.index));
    outParts.push(sec.content);
    cursor = sec.index + sec.content.length;
  }
  if (cursor < html.length) outParts.push(html.slice(cursor));

  return outParts.join("");
}

function limitSections(html: string, maxSections: number): string {
  if (!html || maxSections <= 0) return html;

  const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
  const sections: { index: number; content: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = h2Regex.exec(html)) !== null) {
    const start = match.index;
    const after = html.slice(start + match[0].length);
    const next = after.search(/<h2>/i);
    const end = next !== -1 ? start + match[0].length + next : html.length;
    const content = html.slice(start, end);
    sections.push({ index: start, content });
  }

  if (sections.length <= maxSections) return html;

  const keep = sections.slice(0, maxSections);
  const parts: string[] = [];
  let cursor = 0;

  for (const sec of keep) {
    if (sec.index > cursor) parts.push(html.slice(cursor, sec.index));
    parts.push(sec.content);
    cursor = sec.index + sec.content.length;
  }

  if (cursor < html.length) {
    const tail = html.slice(cursor);
    if (!/^<h2>/i.test(tail.trim())) parts.push(tail);
  }

  return parts.join("");
}

/** Token helpers */
function injectTokenIntoNthSection(html: string, sectionIndexZero: number, token: string): string {
  const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
  const matches: { index: number; match: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = h2Regex.exec(html)) !== null) {
    matches.push({ index: m.index, match: m[0] });
  }

  if (!matches.length) {
    const firstP = html.match(/<p>[\s\S]*?<\/p>/i);
    if (!firstP) return html + token;
    const pHtml = firstP[0];
    const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
    const words = inner.split(/\s+/);
    if (words.length < 3) return html.replace(pHtml, `<p>${inner} ${token}</p>`);
    const at = Math.max(1, Math.floor(words.length * 0.5));
    const out =
      "<p>" + words.slice(0, at).join(" ") + " " + token + " " + words.slice(at).join(" ") + "</p>";
    return html.replace(pHtml, out);
  }

  const target = matches[Math.min(sectionIndexZero, matches.length - 1)];
  const before = html.slice(0, target.index + target.match.length);
  const after = html.slice(target.index + target.match.length);

  const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
  if (!pMatch) {
    return before + `<p>${token}</p>` + after;
  }

  const pHtml = pMatch[0];
  const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
  const words = inner.split(/\s+/);
  let outHtml: string;

  if (words.length < 3) {
    outHtml = `<p>${inner} ${token}</p>`;
  } else {
    let at = Math.max(1, Math.floor(words.length * 0.55));
    if (at > words.length - 2) at = Math.max(1, words.length - 2);
    outHtml = "<p>" + words.slice(0, at).join(" ") + " " + token + " " + words.slice(at).join(" ") + "</p>";
  }

  return before + after.replace(pHtml, outHtml);
}

function ensureAllKeywordsPresent(html: string, keywords: string[]): string {
  if (!keywords?.length || !html) return html;

  const paraRegex = /<p[^>]*>[\s\S]*?<\/p>/gi;
  const paras: { match: string; index: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = paraRegex.exec(html)) !== null) {
    paras.push({ match: m[0], index: m.index });
  }

  const missing: string[] = [];

  for (const rawKw of keywords) {
    const kw = (rawKw || "").trim();
    if (!kw) continue;
    const lower = kw.toLowerCase();
    const esc = lower.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

    if (
      html.includes(`[ANCHOR:${kw}]`) ||
      new RegExp(`<a[^>]*>\\s*${esc}\\s*<\\/a>`, "i").test(html) ||
      new RegExp(`<strong[^>]*>\\s*${esc}\\s*<\\/strong>`, "i").test(html)
    ) {
      continue;
    }

    let foundInP = false;
    for (const p of paras) {
      const text = p.match.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
      if (new RegExp(`\\b${esc}\\b`, "i").test(text)) {
        foundInP = true;
        break;
      }
    }

    if (!foundInP) missing.push(kw);
  }

  if (!missing.length) return html;

  let result = html;
  const updates: { index: number; from: string; to: string }[] = [];
  let mi = 0;

  for (let i = paras.length - 1; i >= 0 && mi < missing.length; i--) {
    const p = paras[i];
    if (/\[ANCHOR:[^\]]+]/.test(p.match)) continue;

    const kw = missing[mi++];
    const inner = p.match.replace(/^<p[^>]*>/i, "").replace(/<\/p>$/i, "").trim();
    const words = inner.split(/\s+/).filter(Boolean);

    let newP: string;
    if (words.length >= 3) {
      const at = Math.max(1, Math.floor(words.length * 0.5));
      newP = "<p>" + words.slice(0, at).join(" ") + ` [ANCHOR:${kw}] ` + words.slice(at).join(" ") + "</p>";
    } else {
      newP = `<p>${inner} [ANCHOR:${kw}]</p>`;
    }

    updates.push({
      index: p.index,
      from: p.match,
      to: newP,
    });
  }

  updates.sort((a, b) => b.index - a.index);
  for (const u of updates) {
    result = result.slice(0, u.index) + u.to + result.slice(u.index + u.from.length);
  }

  const remaining = missing.slice(mi);
  if (remaining.length) {
    result += `<p>${remaining.map((kw) => `[ANCHOR:${kw}]`).join(" ")}</p>`;
  }

  return result;
}

function enforceKeywordRules(html: string, keywords: string[]): string {
  if (!keywords?.length || !html) return html;

  const paraRegex = /<p>([\s\S]*?)<\/p>/gi;
  const parts: string[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = paraRegex.exec(html)) !== null) {
    if (m.index > lastIndex) {
      parts.push(html.slice(lastIndex, m.index));
    }
    const full = m[0];
    const inner = m[1];

    const found: string[] = [];
    const plain = inner.replace(/<[^>]+>/g, " ").toLowerCase();

    for (const kw of keywords) {
      const esc = kw.toLowerCase().replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
      if (new RegExp(`\\b${esc}\\b`, "i").test(plain)) {
        found.push(kw);
      }
    }

    if (found.length <= 1) {
      parts.push(full);
    } else {
      // keep first, remove extra plain mentions (anchors/strong left as-is)
      // const keep = found[0];
      let mod = full;
      for (let i = 1; i < found.length; i++) {
        const kw = found[i];
        const esc = kw.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
        const re = new RegExp(`\\b${esc}\\b`, "gi");
        mod = mod.replace(re, (match, offset) => {
          const before = mod.slice(Math.max(0, offset - 80), offset);
          const after = mod.slice(offset + match.length, offset + match.length + 80);
          const inA = before.lastIndexOf("<a") > before.lastIndexOf("</a>") && after.includes("</a>");
          const inS = before.lastIndexOf("<strong") > before.lastIndexOf("</strong>") && after.includes("</strong>");
          return inA || inS ? match : "";
        });
      }
      parts.push(mod);
    }

    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < html.length) {
    parts.push(html.slice(lastIndex));
  }

  return parts.join("");
}

/** Grouping helpers */
function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
  const groups: KeywordRow[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    groups.push(rows.slice(i, i + size));
  }
  return groups;
}

function sampleDistinct<T>(arr: T[], size: number): T[] {
  if (size <= 0 || !arr.length) return [];
  if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
  const taken = new Set<number>();
  while (taken.size < Math.min(size, arr.length)) {
    taken.add(Math.floor(Math.random() * arr.length));
  }
  const out = Array.from(taken).map((i) => arr[i]);
  while (out.length < size) {
    out.push(arr[Math.floor(Math.random() * arr.length)]);
  }
  return out;
}

function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
  const groups: KeywordRow[][] = [];
  for (let i = 0; i < count; i++) {
    groups.push(sampleDistinct(rows, size));
  }
  return groups;
}

/** Cancel token */
type CancelToken = { cancelled: boolean };

/** Hook */
export function useContentGeneration() {
  const [isProcessing, setIsProcessing] = useState(false);

  const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
  const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

  const cancelTokensRef = useRef<Record<string, CancelToken>>({});

  const recomputeIsProcessing = (projects: ExcelProject[]) =>
    projects.some((p) => p.status === "processing");

  /** ensureProject — keeps status as literal union */
  const ensureProject = (
    proj: Partial<Omit<ExcelProject, "status">> & {
      id: string;
      fileName: string;
      status?: ExcelProject["status"];
    }
  ) => {
    startTransition(() => {
      setExcelProjects((prev) => {
        const list = prev;
        const existing = list.find((p) => p.id === proj.id);

        const status: ExcelProject["status"] = proj.status ?? existing?.status ?? "pending";

        const base: ExcelProject = {
          id: proj.id,
          fileName: proj.fileName,
          status,
          totalKeywords: proj.totalKeywords ?? existing?.totalKeywords ?? 0,
          processedKeywords: proj.processedKeywords ?? existing?.processedKeywords ?? 0,
          createdAt: proj.createdAt ?? existing?.createdAt ?? new Date().toISOString(),
          error: proj.error ?? existing?.error,
          failedCount: proj.failedCount ?? existing?.failedCount ?? 0,
        };

        const next: ExcelProject[] = existing
          ? list.map<ExcelProject>((p) => (p.id === proj.id ? base : p))
          : [...list, base];

        setIsProcessing(recomputeIsProcessing(next));
        return next;
      });
    });
  };

  const flushBufferToState = (buffer: ContentItem[]) => {
    if (!buffer.length) return;
    const toWrite = buffer.splice(0, buffer.length);
    startTransition(() => {
      setContentItems((prev) => [...prev, ...toWrite]);
    });
  };

  const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
    setIsProcessing(true);
    onProgress?.(0);

    const cancelToken: CancelToken = { cancelled: false };
    cancelTokensRef.current[fileId] = cancelToken;

    ensureProject({
      id: fileId,
      fileName: file.name,
      status: "pending",
      totalKeywords: 0,
      processedKeywords: 0,
      failedCount: 0,
    });

    const bufferItems: ContentItem[] = [];
    let scheduledFlush = false;
    const BATCH_SIZE = 80;

    const scheduleFlush = () => {
      if (bufferItems.length >= BATCH_SIZE) {
        flushBufferToState(bufferItems);
        scheduledFlush = false;
        return;
      }
      if (!scheduledFlush) {
        scheduledFlush = true;
        queueMicrotask(() => {
          flushBufferToState(bufferItems);
          scheduledFlush = false;
        });
      }
    };

    let failedCount = 0;
    let processedCount = 0;
    const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

    const updateProgress = (processed: number, total: number) => {
      startTransition(() => {
        setExcelProjects((prev) => {
          const next = prev.map<ExcelProject>((p) =>
            p.id === fileId ? { ...p, processedKeywords: processed } : p
          );
          setIsProcessing(recomputeIsProcessing(next));
          return next;
        });
      });

      try {
        const pct = Math.round((processed / Math.max(1, total)) * 100);
        onProgress?.(pct);
      } catch {
        // ignore
      }
    };

    try {
      const buffer = await file.arrayBuffer();
      if (cancelToken.cancelled) return;

      const { keywords } = extractKeywordsFromWorkbookBufferWithUrls(buffer);

      if (!keywords.length) {
        ensureProject({
          id: fileId,
          fileName: file.name,
          status: "error",
          error: "No valid keywords found in the uploaded Excel file",
        });
        toast.error("No valid keywords found in the uploaded Excel file.");
        onProgress?.(100);
        return;
      }

      const prefs: ContentPreferences = (() => {
        try {
          const raw = localStorage.getItem("content-preferences_v3");
          const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
          return {
            keywordMode: 1,
            targetWords: 500,
            extraInstructions: "",
            mood: "Informative",
            paragraphWords: 100,
            includeConclusion: true,
            customModeEnabled: false,
            articleCount: 1,
            language: "English (UK)",
            totalContentWords: 800,
            titleLength: 100,
            includeBulletPoints: false,
            includeTables: false,
            includeEmojis: false,
            includeBoxesQuotesHighlights: false,
            includeQandA: false,
            brandDomainEnabled: false,
            brandDomain: "",
            ...parsed,
          };
        } catch {
          return {
            keywordMode: 1,
            targetWords: 500,
            extraInstructions: "",
            mood: "Informative",
            paragraphWords: 100,
            includeConclusion: true,
            customModeEnabled: false,
            articleCount: 1,
            language: "English (UK)",
            totalContentWords: 800,
            titleLength: 100,
            includeBulletPoints: false,
            includeTables: false,
            includeEmojis: false,
            includeBoxesQuotesHighlights: false,
            includeQandA: false,
            brandDomainEnabled: false,
            brandDomain: "",
          };
        }
      })();

      const size = (prefs.keywordMode ?? 1) as KeywordMode;

      const baseGroups = prefs.customModeEnabled
        ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
        : buildGroupsNormal(keywords, size);

      ensureProject({
        id: fileId,
        fileName: file.name,
        status: "processing",
        totalKeywords: baseGroups.length,
        processedKeywords: 0,
        failedCount: 0,
      });

      toast.info(`Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article`);

      const cores =
        typeof navigator !== "undefined" && (navigator as any).hardwareConcurrency
          ? (navigator as any).hardwareConcurrency
          : 4;
      let concurrency = Math.min(Math.max(8, cores * 2), 24);
      const MAX = 36;

      let idx = 0;
      const running = new Set<Promise<void>>();

      const startNext = () => {
        if (cancelToken.cancelled) return;
        if (idx >= baseGroups.length) return;

        const groupIndex = idx++;
        const grp = baseGroups[groupIndex];
        const kws = grp.map((g) => g.keyword);
        const urlMap: Record<string, string | null> = {};
        grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

        const task = (async () => {
          if (cancelToken.cancelled) return;
          try {
            glog("Starting group", { groupIndex, keywords: kws });

            const plan = buildPlanFromPrefs({
              keywords: kws,
              prefs,
              variationId: groupIndex + 1,
            });

            const result = await generateJSONTitleHtml({
              keywords: kws,
              instructions: plan,
              titleLength: prefs.titleLength || 100,
            });

            if (cancelToken.cancelled) return;

            let html = String(result.html || "").trim();
            if (!html) throw new Error("Empty html from model");

            if (prefs.totalContentWords && prefs.totalContentWords > 0) {
              html = adjustWordCount(html, prefs.totalContentWords);
            }

            // Structure/dedupe
            for (let i = 0; i < 3; i++) {
              const before = html.length;
              html = removeDuplicateSections(html);
              if (html.length === before) break;
            }

            const maxSections = 8;
            html = limitSections(html, maxSections);
            html = removeDuplicateSections(html);

            // Place tokens
            for (let i = 0; i < kws.length; i++) {
              html = injectTokenIntoNthSection(html, i % maxSections, `[ANCHOR:${kws[i]}]`);
            }

            html = ensureAllKeywordsPresent(html, kws);

            const anchors = Object.keys(urlMap).map((k) => ({
              keyword: k,
              url: urlMap[k] || undefined,
            }));

            html = applyAnchorTokens(html, anchors);
            html = html.replace(/\[ANCHOR:[^\]]+]/g, "");
            html = stripLegacyStubBullets(html);
            html = enforceKeywordRules(html, kws);
            html = ensureAllKeywordsPresent(html, kws);
            html = removeDuplicateSections(html);

            // NOTE: humanize step removed — use generated HTML directly
            let humanizedHtml = html;
            humanizedHtml = removeDuplicateSections(humanizedHtml);
            humanizedHtml = ensureAllKeywordsPresent(humanizedHtml, kws);

            const finalAnchors = Object.keys(urlMap).map((k) => ({
              keyword: k,
              url: urlMap[k] || undefined,
            }));

            humanizedHtml = applyAnchorTokens(humanizedHtml, finalAnchors);
            humanizedHtml = humanizedHtml.replace(/\[ANCHOR:[^\]]+]/g, "");
            humanizedHtml = removeDuplicateSections(humanizedHtml);

            const item: ContentItem = {
              id: `${fileId}-${groupIndex}-${Date.now()}`,
              keyword: kws[0],
              keywordsUsed: kws,
              generatedContent: humanizedHtml,
              fileId,
              fileName: file.name,
              createdAt: new Date().toISOString(),
              title: result.title,
              targetUrl: urlMap[kws[0]] ?? null,
              urlMap,
              status: "success",
              prefsSnapshot: {
                mood: prefs.mood,
                paragraphWords: prefs.paragraphWords,
                includeConclusion: prefs.includeConclusion,
                language: prefs.language,
                customModeEnabled: prefs.customModeEnabled,
                articleCount: prefs.articleCount,
                keywordMode: prefs.keywordMode,
                includeBulletPoints: prefs.includeBulletPoints,
                includeTables: prefs.includeTables,
                includeEmojis: prefs.includeEmojis,
                includeBoxesQuotesHighlights: prefs.includeBoxesQuotesHighlights,
                includeQandA: prefs.includeQandA,
                totalContentWords: prefs.totalContentWords,
                titleLength: prefs.titleLength,
                brandDomainEnabled: prefs.brandDomainEnabled,
                brandDomain: prefs.brandDomain,
              },
            };

            bufferItems.push(item);
            scheduleFlush();
          } catch (e) {
            if (!cancelToken.cancelled) {
              failedCount++;
              failedGroups.push({ index: groupIndex, grp });
              gerr("group generate error:", e);
            }
          } finally {
            processedCount += 1;
            if (!cancelToken.cancelled) {
              updateProgress(processedCount, baseGroups.length);
            }
          }
        })().finally(() => running.delete(task));

        running.add(task);
      };

      while (!cancelToken.cancelled && (idx < baseGroups.length || running.size > 0)) {
        const cur = Math.max(8, Math.min(Math.floor(concurrency), MAX));
        while (running.size < cur && idx < baseGroups.length && !cancelToken.cancelled) {
          startNext();
        }
        if (!running.size) break;
        await Promise.race(Array.from(running));

        if (failedCount > processedCount * 0.25 && concurrency > 8) {
          concurrency -= 0.5;
          gwarn("High failure rate, reducing concurrency:", concurrency);
        } else if (concurrency < MAX && failedCount < processedCount * 0.08) {
          concurrency += 0.75;
          glog("Low failure rate, increasing concurrency:", concurrency);
        }
      }

      // If cancelled: don't mark completed
      if (cancelToken.cancelled) {
        flushBufferToState(bufferItems);
        return;
      }

      // One-pass retry
      if (failedGroups.length) {
        toast.message(`Retrying ${failedGroups.length} failed item(s)…`);
        const queue = [...failedGroups];
        failedGroups.length = 0;
        const RETRY_CONC = 6;
        const running2 = new Set<Promise<void>>();

        const runOne = async (grp: KeywordRow[], groupIndex: number) => {
          if (cancelToken.cancelled) return;
          const kws = grp.map((g) => g.keyword);
          const urlMap: Record<string, string | null> = {};
          grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

          const plan = buildPlanFromPrefs({
            keywords: kws,
            prefs,
            variationId: groupIndex + 1,
          });
          const res = await generateJSONTitleHtml({
            keywords: kws,
            instructions: plan,
            titleLength: prefs.titleLength || 100,
          });
          if (cancelToken.cancelled) return;

          let html = String(res.html || "").trim();
          if (!html) throw new Error("Empty html (retry)");

          const maxSections = 8;
          for (let i = 0; i < Math.min(kws.length, 4); i++) {
            html = injectTokenIntoNthSection(html, i % maxSections, `[ANCHOR:${kws[i]}]`);
          }

          html = ensureAllKeywordsPresent(html, kws);
          const anchors = Object.keys(urlMap).map((k) => ({
            keyword: k,
            url: urlMap[k] || undefined,
          }));
          html = applyAnchorTokens(html, anchors);
          html = html.replace(/\[ANCHOR:[^\]]+]/g, "");
          html = stripLegacyStubBullets(html);
          html = enforceKeywordRules(html, kws);
          html = ensureAllKeywordsPresent(html, kws);

          // NOTE: humanize step removed — use generated HTML directly
          let humanizedHtml = html;
          humanizedHtml = ensureAllKeywordsPresent(humanizedHtml, kws);
          humanizedHtml = applyAnchorTokens(humanizedHtml, anchors);
          humanizedHtml = humanizedHtml.replace(/\[ANCHOR:[^\]]+]/g, "");

          const item: ContentItem = {
            id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
            keyword: kws[0],
            keywordsUsed: kws,
            generatedContent: humanizedHtml,
            fileId,
            fileName: file.name,
            createdAt: new Date().toISOString(),
            title: res.title,
            targetUrl: urlMap[kws[0]] ?? null,
            urlMap,
            status: "success",
            prefsSnapshot: {
              mood: prefs.mood,
              paragraphWords: prefs.paragraphWords,
              includeConclusion: prefs.includeConclusion,
              language: prefs.language,
              customModeEnabled: prefs.customModeEnabled,
              articleCount: prefs.articleCount,
              keywordMode: prefs.keywordMode,
              includeBulletPoints: prefs.includeBulletPoints,
              includeTables: prefs.includeTables,
              includeEmojis: prefs.includeEmojis,
              includeBoxesQuotesHighlights: prefs.includeBoxesQuotesHighlights,
              includeQandA: prefs.includeQandA,
              totalContentWords: prefs.totalContentWords,
              titleLength: prefs.titleLength,
              brandDomainEnabled: prefs.brandDomainEnabled,
              brandDomain: prefs.brandDomain,
            },
          };

          bufferItems.push(item);
          scheduleFlush();
        };

        const startNextRetry = () => {
          if (cancelToken.cancelled) return;
          if (!queue.length) return;
          const { grp, index } = queue.shift()!;
          const p = (async () => {
            try {
              await runOne(grp, index);
            } catch (e) {
              gerr("retry failed:", e);
            }
          })().finally(() => running2.delete(p));
          running2.add(p);
        };

        while (running2.size < RETRY_CONC && queue.length && !cancelToken.cancelled) {
          startNextRetry();
        }
        while ((running2.size || queue.length) && !cancelToken.cancelled) {
          await Promise.race(Array.from(running2));
          while (running2.size < RETRY_CONC && queue.length && !cancelToken.cancelled) {
            startNextRetry();
          }
          await new Promise((r) => setTimeout(r, 80));
        }
      }

      flushBufferToState(bufferItems);

      if (!cancelToken.cancelled) {
        startTransition(() => {
          setExcelProjects((prev) => {
            const next = prev.map<ExcelProject>((p) =>
              p.id === fileId
                ? {
                    ...p,
                    status: "completed" as const,
                    processedKeywords: baseGroups.length,
                    failedCount,
                  }
                : p
            );
            setIsProcessing(recomputeIsProcessing(next));
            return next;
          });
        });

        const ok = baseGroups.length - failedCount;
        glog("generateContent DONE", { ok, failedCount, total: baseGroups.length });
        toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
        onProgress?.(100);
      }
    } catch (error) {
      gerr("generateContent overall error:", error);
      startTransition(() => {
        setExcelProjects((prev) => {
          const next = prev.map<ExcelProject>((p) =>
            p.id === fileId
              ? {
                  ...p,
                  status: "error" as const,
                  error: error instanceof Error ? error.message : String(error),
                }
              : p
          );
          setIsProcessing(recomputeIsProcessing(next));
          return next;
        });
      });
      toast.error(
        `Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`
      );
      onProgress?.(100);
      throw error;
    } finally {
      flushBufferToState(bufferItems);
      delete cancelTokensRef.current[fileId];

      startTransition(() => {
        setExcelProjects((prev) => {
          setIsProcessing(recomputeIsProcessing(prev));
          return prev;
        });
      });
    }
  };

  const cancelProject = (projectId: string) => {
    const token = cancelTokensRef.current[projectId];
    if (token) token.cancelled = true;

    startTransition(() => {
      setExcelProjects((prev) => {
        const next = prev.map<ExcelProject>((p) =>
          p.id === projectId ? { ...p, status: "error" as const, error: "Cancelled by user" } : p
        );
        setIsProcessing(recomputeIsProcessing(next));
        return next;
      });
    });

    toast.message("Generation cancelled for this project.");
  };

  const deleteProject = (projectId: string) => {
    startTransition(() => {
      setExcelProjects((prev) => {
        const next = prev.filter((p) => p.id !== projectId);
        setIsProcessing(recomputeIsProcessing(next));
        return next;
      });
      setContentItems((prev) => prev.filter((c) => c.fileId !== projectId));
    });
    toast.success("Project deleted");
  };

  const deleteAllProjects = () => {
    startTransition(() => {
      setExcelProjects((_prev) => {
        setIsProcessing(false);
        return [];
      });
      setContentItems((_prev) => []);
    });
    toast.success("All projects cleared");
  };

  return {
    generateContent,
    cancelProject,
    isProcessing,
    contentItems,
    setContentItems,
    excelProjects,
    setExcelProjects,
    deleteProject,
    deleteAllProjects,
    openContentEditor,
  };
}

export default useContentGeneration;
