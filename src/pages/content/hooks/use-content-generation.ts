

// // // 

// // // src/hooks/use-content.ts
// // import { useState, startTransition } from "react";
// // import { toast } from "sonner";
// // import { useLocalStorage } from "@/hooks/use-local-storage";
// // import * as XLSX from "xlsx";
// // import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// // import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// // import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// // /* ═══════════════════════════════════════════════════════════════
// //    SPEED OPTIMIZED + HUMANIZATION FOCUSED (Turbo pool-aware)
// //    ═══════════════════════════════════════════════════════════════ */

// // const PREF_KEY = "content-preferences_v3";
// // function getFreshPrefs(): ContentPreferences {
// //   try {
// //     const raw = localStorage.getItem(PREF_KEY);
// //     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
// //   } catch { return {} as any; }
// // }

// // export interface ContentItem {
// //   id: string;
// //   keyword: string;
// //   keywordsUsed?: string[];
// //   generatedContent: string;
// //   fileId: string;
// //   fileName: string;
// //   createdAt: string;
// //   title?: string;
// //   targetUrl?: string | null;
// //   urlMap?: Record<string, string | null>;
// //   status?: "success" | "failed";
// //   prefsSnapshot?: Partial<ContentPreferences>;
// // }

// // interface ExcelProject {
// //   id: string;
// //   fileName: string;
// //   status: "pending" | "processing" | "completed" | "error";
// //   totalKeywords: number;
// //   processedKeywords: number;
// //   createdAt: string;
// //   error?: string;
// //   failedCount?: number;
// // }

// // type GenerateProgressCallback = (p: number) => void;

// // const SESSION_KEY = "open-content-item_v1";
// // export function openContentEditor(item: ContentItem) {
// //   try {
// //     try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(item)); }
// //     catch { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); }
// //     const win = window.open("/content/editor", "_blank");
// //     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
// //   } catch {
// //     try { window.location.href = "/content/editor"; } catch {}
// //   }
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    EXCEL PARSING (Keywords + URLs)
// //    ═══════════════════════════════════════════════════════════════ */

// // function norm(s: unknown) {
// //   return String(s ?? "").toLowerCase().replace(/[.\-_/]/g, " ").replace(/\s+/g, " ").trim();
// // }
// // function isLikelyUrlOrDomain(s?: string | null) {
// //   if (!s) return false;
// //   const t = String(s).trim();
// //   if (!t) return false;
// //   if (/^https?:\/\//i.test(t)) return true;
// //   if (/^www\./i.test(t)) return true;
// //   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(t) && !/\s/.test(t)) return true;
// //   return false;
// // }
// // function sanitizeKeyword(raw: unknown): string {
// //   if (raw == null) return "";
// //   let v = String(raw).replace(/\u00A0/g, " ").trim();
// //   if (!v) return "";
// //   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim();
// //   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
// //   if (/^[\d\.,\s]+$/.test(v)) return "";
// //   if (isLikelyUrlOrDomain(v)) return "";
// //   if ((v.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F]/g) || []).length < 2) return "";
// //   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
// //   if (v.length < 2 || v.length > 180) return "";
// //   return v;
// // }

// // type KeywordRow = { keyword: string; url?: string | null };
// // const KW_HEADERS = new Set(["keyword","keywords","focus keyword","search term","term","query","topic","title","key word"]);
// // const URL_HEADERS = new Set(["url","link","target url","target","target page","landing page","page url","destination","href","target link"]);

// // function detectHeaderRowAndColumns(rows: unknown[][]) {
// //   let headerRowIndex = -1;
// //   const maxCheck = Math.min(rows.length, 6);
// //   for (let i = 0; i < maxCheck; i++) {
// //     const r = rows[i];
// //     if (!Array.isArray(r)) continue;
// //     const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
// //     const mostlyText = nonEmpty.filter((c) => /[A-Za-zА-Яа-яЁё\u0900-\u097F]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
// //     if (nonEmpty.length >= 2 && mostlyText) { headerRowIndex = i; break; }
// //   }
// //   if (headerRowIndex === -1) headerRowIndex = 0;

// //   const headers = (rows[headerRowIndex] as unknown[]).map(norm);
// //   let keywordCol = -1, urlCol = -1;
// //   headers.forEach((h, idx) => {
// //     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
// //     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
// //   });

// //   if (keywordCol === -1) {
// //     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
// //     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
// //     let bestCol = -1, bestScore = 0;
// //     for (let c = 0; c < maxCols; c++) {
// //       let score = 0, checks = 0;
// //       for (const rr of lookahead) {
// //         if (!Array.isArray(rr)) continue;
// //         const s = sanitizeKeyword(rr[c]);
// //         if (s) score++;
// //         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
// //       }
// //       const weighted = score * 100 + Math.min(checks, 100);
// //       if (checks === 0) continue;
// //       if (weighted > bestScore) { bestScore = weighted; bestCol = c; }
// //     }
// //     if (bestCol !== -1) keywordCol = bestCol;
// //   }
// //   return { headerRowIndex, keywordCol: keywordCol === -1 ? null : keywordCol, urlCol: urlCol === -1 ? null : urlCol };
// // }

// // function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
// //   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
// //   if (!rows || rows.length === 0) return [];
// //   const { headerRowIndex, keywordCol, urlCol } = detectHeaderRowAndColumns(rows);
// //   const start = Math.min(rows.length - 1, headerRowIndex + 1);
// //   const dataRows = rows.slice(start);
// //   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);

// //   const out: KeywordRow[] = [];
// //   const seen = new Set<string>();

// //   for (const r of dataRows) {
// //     if (!Array.isArray(r)) continue;

// //     let k = "";
// //     if (keywordCol != null) k = sanitizeKeyword(r[keywordCol]);
// //     if (!k) {
// //       for (let c = 0; c < maxCols; c++) {
// //         const cand = sanitizeKeyword(r[c]);
// //         if (cand) { k = cand; break; }
// //       }
// //     }
// //     if (!k || seen.has(k)) continue;

// //     let url: string | null = null;
// //     if (urlCol != null) {
// //       const raw = String(r[urlCol] ?? "").trim();
// //       if (raw && isLikelyUrlOrDomain(raw)) url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
// //     }
// //     if (!url) {
// //       for (let offset = -3; offset <= 3; offset++) {
// //         if (offset === 0) continue;
// //         const idx = (keywordCol ?? 0) + offset;
// //         if (idx < 0 || idx >= maxCols) continue;
// //         const maybe = r[idx];
// //         if (!maybe) continue;
// //         const s = String(maybe).trim();
// //         if (isLikelyUrlOrDomain(s)) { url = /^https?:\/\//i.test(s) ? s : "https://" + s; break; }
// //       }
// //     }
// //     out.push({ keyword: k, url });
// //     seen.add(k);
// //   }
// //   return out;
// // }

// // function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array) {
// //   const workbook = XLSX.read(buffer, { type: "array" });
// //   const sheetNames = workbook.SheetNames ?? [];
// //   const combined: KeywordRow[] = [];
// //   const seen = new Set<string>();
// //   for (const sheetName of sheetNames) {
// //     try {
// //       const sheet = workbook.Sheets[sheetName];
// //       const ks = extractKeywordsFromWorksheetWithUrls(sheet);
// //       for (const k of ks) if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
// //       if (combined.length > 10000) break;
// //     } catch (e) {
// //       console.warn("worksheet parse failed:", sheetName, e);
// //     }
// //   }
// //   return { keywords: combined };
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    CONTENT SHAPING HELPERS
// //    ═══════════════════════════════════════════════════════════════ */

// // type LangCode = "en" | "hi" | "ru";
// // function lcOf(pref?: string): LangCode {
// //   const t = (pref || "").toLowerCase();
// //   if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
// //   if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
// //   return "en";
// // }
// // function stripTagsFast(html: string) {
// //   return (html || "")
// //     .replace(/<script[\s\S]*?<\/script>/gi, " ")
// //     .replace(/<style[\s\S]*?<\/style>/gi, " ")
// //     .replace(/<\/?[^>]+>/g, " ")
// //     .replace(/&nbsp;|&#160;/g, " ")
// //     .replace(/\s+/g, " ").trim();
// // }
// // function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
// // function squashRepetition(text: string): string {
// //   let out = text.replace(/(\b([a-z\u0400-\u04ff\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
// //   out = out.replace(/(\b[^\s<>\{}]+\b(?:\s+\b[^\s<>\{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
// //   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
// //   return out;
// // }
// // function extractH1PSections(html: string) {
// //   const out: { h: string; p: string }[] = [];
// //   if (!html) return out;
// //   const cleaned = html.replace(/\bundefined\b/gi, "");
// //   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
// //   let cursor = 0;
// //   for (let i = 0; i < h1Matches.length; i++) {
// //     const h = h1Matches[i];
// //     const idx = cleaned.indexOf(h, cursor);
// //     if (idx === -1) continue;
// //     cursor = idx + h.length;
// //     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
// //     const p = pMatch ? pMatch[0] : "";
// //     if (p) { out.push({ h, p }); cursor += p.length; }
// //   }
// //   return out;
// // }
// // function nonTokenWordCount(html: string) {
// //   const noTokens = (html || "").replace(/\[ANCHOR:[^\]]+\]/g, " ");
// //   const text = noTokens
// //     .replace(/<script[\s\S]*?<\/script>/gi, " ")
// //     .replace(/<style[\s\S]*?<\/style>/gi, " ")
// //     .replace(/<\/?[^>]+>/g, " ")
// //     .replace(/&nbsp;|&#160;/g, " ")
// //     .replace(/\s+/g, " ")
// //     .trim();
// //   return text ? text.split(/\s+/).filter(w => w.length > 1).length : 0;
// // }
// // function looksLikeLLMFallback(html: string) {
// //   const hasDraftMarker = /—\s*draft\./i.test(html);
// //   const h1Count = (html.match(/<h1>/gi) || []).length;
// //   const fewWords = nonTokenWordCount(html) < 50;
// //   return hasDraftMarker || (h1Count <= 1 && fewWords);
// // }
// // function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number, lc: LangCode) {
// //   const pairs = extractH1PSections(rawHtml);
// //   if (pairs.length >= wantSections) {
// //     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
// //   }
// //   const baseWords = nonTokenWordCount(rawHtml);
// //   if (baseWords < Math.max(paraMin, 50)) {
// //     throw new Error("Insufficient body returned by LLM; refusing to fabricate sections.");
// //   }
// //   const cleaned = rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ");
// //   const words = stripTagsFast(squashRepetition(cleaned)).split(/\s+/).filter(Boolean);
// //   const sections: string[] = [];
// //   let idx = 0;
// //   const BANK = lc === "ru"
// //     ? ["Почему это важно","Полезные особенности","Что проверить заранее","Типичные ошибки и решения","Практические советы","Как закрепить результат"]
// //     : lc === "hi"
// //       ? ["क्यों यह महत्वपूर्ण है","मदद करने वाली मुख्य बातें","समय बचाने वाले जाँच-बिंदु","सामान्य गलतियाँ और उपाय","व्यावहारिक सुझाव","सीख को स्थायी बनाएं"]
// //       : ["Why This Matters","Core Features That Help","Checks That Save Time","Common Pitfalls & Fixes","Real-World Tips","Make It Stick"];
// //   for (let s = 0; s < wantSections; s++) {
// //     let take = Math.floor((paraMin + paraMax) / 2);
// //     if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
// //     if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
// //     const chunk = words.slice(idx, idx + take).join(" ").trim();
// //     const h1 = BANK[s % BANK.length];
// //     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
// //     idx += take;
// //   }
// //   return sections;
// // }
// // function removeAllTokens(s: string) { return s.replace(/\[ANCHOR:[^\]]+\]/g, ""); }
// // function computeSectionKeywordMap(N: number, keywords: string[]) {
// //   const map: Record<number, string | null> = {};
// //   if (keywords.length === 1) { map[0] = keywords[0]; }
// //   else if (keywords.length === 2) { map[0] = keywords[0]; map[Math.min(2, N - 1)] = keywords[1]; }
// //   else if (keywords.length >= 4) { for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i]; }
// //   return map;
// // }
// // function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
// //   const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
// //   const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
// //   let idx = 0;
// //   let result = html;
// //   for (const block of blocks) {
// //     const allowed = sectionMap[idx++] || "";
// //     if (!allowed) continue;
// //     let replaced = block;

// //     for (const k of keywords) {
// //       if (k === allowed) continue;
// //       const aRe = new RegExp(`<a[^>]*>\\s*(${esc(k)})\\s*<\\/a>`, "gi");
// //       const bRe = new RegExp(`<strong>\\s*(${esc(k)})\\s*<\\/strong>`, "gi");
// //       replaced = replaced.replace(aRe, "$1").replace(bRe, "$1");
// //     }

// //     const allowedA = new RegExp(`<a[^>]*>\\s*(${esc(allowed)})\\s*<\\/a>`, "gi");
// //     let seen = 0;
// //     replaced = replaced.replace(allowedA, (_m, g1) => (++seen === 1 ? _m : g1));

// //     const allowedB = new RegExp(`<strong>\\s*(${esc(allowed)})\\s*<\\/strong>`, "gi");
// //     seen = 0;
// //     replaced = replaced.replace(allowedB, (_m, g1) => (++seen === 1 ? _m : g1));

// //     result = result.replace(block, replaced);
// //   }
// //   return result;
// // }
// // function ensureNoTerminalKeyword(html: string, keywords: string[], lc: LangCode) {
// //   const tails = lc === "ru"
// //     ? ["как правило", "на практике", "для большинства проектов", "в итоге"]
// //     : lc === "hi"
// //       ? ["अक्सर", "व्यवहार में", "अधिकतर मामलों में", "आम तौर पर"]
// //       : ["in practice", "for most teams", "in real use", "overall"];
// //   const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
// //   const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
// //   let out = html;
// //   for (const pHtml of paragraphs) {
// //     const inner = pHtml.replace(/^<p>|<\/p>$/gi, "");
// //     const trimmed = inner.replace(/\s+/g, " ").trim();
// //     let needsTail = false;
// //     for (const kw of keywords) {
// //       const endPlain = new RegExp(`${esc(kw)}\\s*(?:[.!?…]*)\\s*$`, "i");
// //       const endAnchor = new RegExp(`>\\s*${esc(kw)}\\s*<\\/a>\\s*(?:[.!?…]*)\\s*$`, "i");
// //       const endStrong = new RegExp(`>\\s*${esc(kw)}\\s*<\\/strong>\\s*(?:[.!?…]*)\\s*$`, "i");
// //       if (endPlain.test(trimmed) || endAnchor.test(trimmed) || endStrong.test(trimmed)) { needsTail = true; break; }
// //     }
// //     if (!needsTail) continue;
// //     const tail = tails[Math.floor(Math.random() * tails.length)];
// //     const fixed = trimmed.replace(/\s*(?:[.!?…]*)\s*$/, `, ${tail}.`);
// //     const newP = `<p>${fixed}</p>`;
// //     out = out.replace(pHtml, newP);
// //   }
// //   return out;
// // }
// // function basicValidate(html: string, keywords: string[], wantSections: number) {
// //   if (looksLikeLLMFallback(html)) return false;
// //   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //   if (blocks < wantSections - 1) return false;
// //   for (const k of keywords.slice(0, Math.min(2, keywords.length))) {
// //     if (!html.includes(k)) return false;
// //   }
// //   return true;
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    GROUPING
// //    ═══════════════════════════════════════════════════════════════ */
// // function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
// //   const groups: KeywordRow[][] = [];
// //   for (let i = 0; i < rows.length; i += size) groups.push(rows.slice(i, i + size));
// //   return groups;
// // }
// // function sampleDistinct<T>(arr: T[], size: number): T[] {
// //   if (size <= 0) return [];
// //   if (arr.length === 0) return [];
// //   if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
// //   const takenIdx = new Set<number>();
// //   let tries = 0;
// //   while (takenIdx.size < Math.min(size, arr.length) && tries < size * 8) {
// //     takenIdx.add(Math.floor(Math.random() * arr.length));
// //     tries++;
// //   }
// //   const out = Array.from(takenIdx).map(i => arr[i]);
// //   while (out.length < size) out.push(arr[Math.floor(Math.random() * arr.length)]);
// //   return out;
// // }
// // function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
// //   const groups: KeywordRow[][] = [];
// //   for (let i = 0; i < count; i++) groups.push(sampleDistinct(rows, size));
// //   return groups;
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    MAIN HOOK
// //    ═══════════════════════════════════════════════════════════════ */
// // export function useContentGeneration() {
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
// //   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

// //   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
// //     startTransition(() => {
// //       setExcelProjects((prev = []) => {
// //         const exists = prev.some((p) => p.id === proj.id);
// //         const base: ExcelProject = {
// //           id: proj.id,
// //           fileName: proj.fileName,
// //           status: (proj as any).status ?? "pending",
// //           totalKeywords: (proj as any).totalKeywords ?? 0,
// //           processedKeywords: (proj as any).processedKeywords ?? 0,
// //           createdAt: (proj as any).createdAt ?? new Date().toISOString(),
// //           error: (proj as any).error,
// //           failedCount: (proj as any).failedCount ?? 0,
// //         };
// //         if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
// //         return [...prev, base];
// //       });
// //     });
// //   };

// //   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
// //     setIsProcessing(true);
// //     onProgress?.(0);
// //     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

// //     const bufferItems: ContentItem[] = [];
// //     let scheduled = false;
// //     const BATCH_SIZE = 20;
// //     const flushNow = () => {
// //       scheduled = false;
// //       if (!bufferItems.length) return;
// //       const toWrite = bufferItems.splice(0, bufferItems.length);
// //       startTransition(() => {
// //         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
// //       });
// //     };
// //     const scheduleFlush = () => {
// //       if (bufferItems.length >= BATCH_SIZE) return flushNow();
// //       if (!scheduled) { scheduled = true; queueMicrotask(flushNow); }
// //     };

// //     let failedCount = 0;
// //     let processedCount = 0;
// //     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

// //     const updateProgress = (processed: number, total: number) => {
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
// //       });
// //       try { onProgress?.(Math.round((processed / Math.max(1, total)) * 100)); } catch {}
// //     };

// //     try {
// //       const buffer = await file.arrayBuffer();
// //       const { keywords } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
// //       if (!keywords.length) {
// //         ensureProject({ id: fileId, fileName: file.name, status: "error", error: "No valid keywords found in the uploaded Excel file" });
// //         toast.error("No valid keywords found in the uploaded Excel file.");
// //         onProgress?.(100);
// //         return;
// //       }

// //       const prefs = getFreshPrefs();
// //       const lc = lcOf(prefs.language);
// //       const size = (prefs.keywordMode ?? 1) as KeywordMode;

// //       const baseGroups = prefs.customModeEnabled
// //         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
// //         : buildGroupsNormal(keywords, size);

// //       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
// //       toast.info(`⚡ Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article • Humanized content`);

// //       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.88);
// //       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.15);
// //       const wantSections = prefs.sectionCount || 5;

// //       // 🚀 Turbo pool-aware concurrency (no CPU bottleneck)
// //       let concurrency = Math.min(Math.max(6, (navigator.hardwareConcurrency ?? 4) * 2), 12);
// //       const MAX = 48;

// //       let idx = 0;
// //       const running = new Set<Promise<void>>();

// //       const startNext = () => {
// //         if (idx >= baseGroups.length) return;
// //         const groupIndex = idx++;
// //         const grp = baseGroups[groupIndex];
// //         const kws = grp.map((g) => g.keyword);
// //         const urlMap: Record<string, string | null> = {};
// //         grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

// //         const task = (async () => {
// //           try {
// //             const basePlan = buildPlanFromPrefs({
// //               keywords: kws,
// //               prefs: {
// //                 ...prefs,
// //                 sectionCount: (prefs.sectionCount as any) || 5,
// //                 paragraphWords: (prefs.paragraphWords as any) || 100,
// //               },
// //               variationId: groupIndex + 1,
// //             });

// //             const result = await generateJSONTitleHtml({ 
//             //   keywords: kws, 
//             //   instructions: basePlan,
//             //   titleLength: prefs.titleLength || 100
//             // });

// //             // Reject stub/fallback so it retries & never leaks to UI
// //             const html0 = String(result.html || "");
// //             if (/—\s*draft\./i.test(html0) || (html0.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0) < 50) {
// //               throw new Error("LLM fallback/stub detected (rate-limit or non-JSON).");
// //             }

// //             let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax, lc);
// //             sections = sections.map((s, i) => (kws[i] ? s.replace(/<\/p>/i, ` [ANCHOR:${kws[i]}]</p>`) : s));

// //             let bodyHtml = sections.join("");
// //             bodyHtml = squashRepetition(bodyHtml);

// //             if (!basicValidate(bodyHtml, kws, wantSections)) {
// //               throw new Error("Basic validation failed");
// //             }

// //             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
// //             let html = applyAnchorTokens(bodyHtml, anchors);
// //             html = removeAllTokens(html);

// //             const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //             const secMap = computeSectionKeywordMap(bodyCount, kws);
// //             html = enforceSingleKeywordPerParagraph(html, kws, secMap);
// //             html = ensureNoTerminalKeyword(html, kws, lc);
// //             html = squashRepetition(html);

// //             const item: ContentItem = {
// //               id: `${fileId}-${groupIndex}-${Date.now()}`,
// //               keyword: kws[0],
// //               keywordsUsed: kws,
// //               generatedContent: html,
// //               fileId,
// //               fileName: file.name,
// //               createdAt: new Date().toISOString(),
// //               title: result.title,
// //               targetUrl: urlMap[kws[0]] ?? null,
// //               urlMap,
// //               status: "success",
// //               prefsSnapshot: {
// //                 mood: prefs.mood,
// //                 paragraphWords: prefs.paragraphWords,
// //                 sectionCount: prefs.sectionCount,
// //                 includeConclusion: prefs.includeConclusion,
// //                 language: prefs.language,
// //                 customModeEnabled: prefs.customModeEnabled,
// //                 articleCount: prefs.articleCount,
// //                 keywordMode: prefs.keywordMode,
// //               },
// //             };
// //             bufferItems.push(item);
// //             scheduleFlush();
// //           } catch (e) {
// //             failedCount++;
// //             failedGroups.push({ index: groupIndex, grp });
// //             console.error("group generate error:", e);
// //           } finally {
// //             processedCount += 1;
// //             updateProgress(processedCount, baseGroups.length);
// //           }
// //         })().finally(() => running.delete(task));

// //         running.add(task);
// //       };

// //       // Main loop
// //       while (idx < baseGroups.length || running.size > 0) {
// //         const cur = Math.max(6, Math.min(Math.floor(concurrency), MAX));
// //         while (running.size < cur && idx < baseGroups.length) startNext();
// //         if (!running.size && idx >= baseGroups.length) break;
// //         await Promise.race(Array.from(running));

// //         // Adapt concurrency to avoid 429 bursts, but keep speed
// //         if (failedCount > processedCount * 0.25 && concurrency > 6) concurrency -= 0.5;
// //         else if (concurrency < MAX && failedCount < processedCount * 0.08) concurrency += 0.3;
// //       }

// //       // Tail retry (low & polite)
// //       if (failedGroups.length) {
// //         toast.message(`Retrying ${failedGroups.length} failed item(s) at low speed…`);
// //         const again = [...failedGroups];
// //         failedGroups.length = 0;

// //         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
// //           const kws = grp.map(g => g.keyword);
// //           const urlMap: Record<string, string | null> = {};
// //           grp.forEach(g => { urlMap[g.keyword] = g.url ?? null; });

// //           const basePlan = buildPlanFromPrefs({
// //             keywords: kws,
// //             prefs: {
// //               ...prefs,
// //               sectionCount: (prefs.sectionCount as any) || 5,
// //               paragraphWords: (prefs.paragraphWords as any) || 100,
// //             },
// //             variationId: groupIndex + 1,
// //           });

// //           const res = await generateJSONTitleHtml({ 
//             keywords: kws,
//             instructions: basePlan,
//             titleLength: prefs.titleLength || 100
//           });
// //           const html0b = String(res.html || "");
// //           if (/—\s*draft\./i.test(html0b) || (html0b.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0b) < 50) {
// //             throw new Error("LLM fallback/stub on retry");
// //           }

// //           let sections = ensureH1SectionsFromAnyHtml(res.html, wantSections, paraMin, paraMax, lc);
// //           sections = sections.map((s, i) => (kws[i] ? s.replace(/<\/p>/i, ` [ANCHOR:${kws[i]}]</p>`) : s));

// //           let bodyHtml = sections.join("");
// //           bodyHtml = squashRepetition(bodyHtml);
// //           if (!basicValidate(bodyHtml, kws, wantSections)) throw new Error("Basic validation failed on retry");

// //           const anchors = Object.keys(urlMap).map(k => ({ keyword: k, url: urlMap[k] || undefined }));
// //           let html = applyAnchorTokens(bodyHtml, anchors);
// //           html = removeAllTokens(html);

// //           const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //           const secMap = computeSectionKeywordMap(bodyCount, kws);
// //           html = enforceSingleKeywordPerParagraph(html, kws, secMap);
// //           html = ensureNoTerminalKeyword(html, kws, lc);
// //           html = squashRepetition(html);

// //           const item: ContentItem = {
// //             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
// //             keyword: kws[0],
// //             keywordsUsed: kws,
// //             generatedContent: html,
// //             fileId,
// //             fileName: file.name,
// //             createdAt: new Date().toISOString(),
// //             title: res.title,
// //             targetUrl: urlMap[kws[0]] ?? null,
// //             urlMap,
// //             status: "success",
// //             prefsSnapshot: {
// //               mood: prefs.mood,
// //               paragraphWords: prefs.paragraphWords,
// //               sectionCount: prefs.sectionCount,
// //               includeConclusion: prefs.includeConclusion,
// //               language: prefs.language,
// //               customModeEnabled: prefs.customModeEnabled,
// //               articleCount: prefs.articleCount,
// //               keywordMode: prefs.keywordMode,
// //             },
// //           };
// //           bufferItems.push(item);
// //           scheduleFlush();
// //         };

// //         const RETRY_CONCURRENCY = 2;
// //         const queue = [...again];
// //         const running2 = new Set<Promise<void>>();

// //         const startNextRetry = () => {
// //           if (!queue.length) return;
// //           const { grp, index } = queue.shift()!;
// //           const p = (async () => {
// //             try {
// //               await runOne(grp, index);
// //             } catch (e) {
// //               console.error("retry group failed:", e);
// //             }
// //           })().finally(() => running2.delete(p));
// //           running2.add(p);
// //         };

// //         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
// //         while (running2.size || queue.length) {
// //           await Promise.race(Array.from(running2));
// //           while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
// //           await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
// //         }
// //       }

// //       flushNow();
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) =>
// //           p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
// //         ));
// //       });
// //       const ok = baseGroups.length - failedCount;
// //       toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
// //       onProgress?.(100);
// //     } catch (error) {
// //       console.error("generateContent overall error:", error);
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) =>
// //           p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
// //         ));
// //       });
// //       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
// //       onProgress?.(100);
// //       throw error;
// //     } finally {
// //       flushNow();
// //       setIsProcessing(false);
// //     }
// //   };

// //   const deleteProject = (projectId: string) => {
// //     startTransition(() => {
// //       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
// //       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
// //     });
// //     toast.success("Project deleted");
// //   };

// //   const deleteAllProjects = () => {
// //     startTransition(() => {
// //       setExcelProjects([]);
// //       setContentItems([]);
// //     });
// //     toast.success("All projects cleared");
// //   };

// //   return {
// //     generateContent,
// //     isProcessing,
// //     contentItems,
// //     setContentItems,
// //     excelProjects,
// //     setExcelProjects,
// //     deleteProject,
// //     deleteAllProjects,
// //     openContentEditor,
// //   };
// // }




// // // src/hooks/use-content.ts
// // import { useState, startTransition } from "react";
// // import { toast } from "sonner";
// // import { useLocalStorage } from "@/hooks/use-local-storage";
// // import * as XLSX from "xlsx";
// // import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// // import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// // import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// // /* ═══════════════════════════════════════════════════════════════
// //    SPEED OPTIMIZED + HUMANIZATION FOCUSED (Turbo pool-aware)
// //    ═══════════════════════════════════════════════════════════════ */

// // const PREF_KEY = "content-preferences_v3";
// // function getFreshPrefs(): ContentPreferences {
// //   try {
// //     const raw = localStorage.getItem(PREF_KEY);
// //     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
// //   } catch { return {} as any; }
// // }

// // export interface ContentItem {
// //   id: string;
// //   keyword: string;
// //   keywordsUsed?: string[];
// //   generatedContent: string;
// //   fileId: string;
// //   fileName: string;
// //   createdAt: string;
// //   title?: string;
// //   targetUrl?: string | null;
// //   urlMap?: Record<string, string | null>;
// //   status?: "success" | "failed";
// //   prefsSnapshot?: Partial<ContentPreferences>;
// // }

// // interface ExcelProject {
// //   id: string;
// //   fileName: string;
// //   status: "pending" | "processing" | "completed" | "error";
// //   totalKeywords: number;
// //   processedKeywords: number;
// //   createdAt: string;
// //   error?: string;
// //   failedCount?: number;
// // }

// // type GenerateProgressCallback = (p: number) => void;

// // const SESSION_KEY = "open-content-item_v1";
// // export function openContentEditor(item: ContentItem) {
// //   try {
// //     try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(item)); }
// //     catch { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); }
// //     const win = window.open("/content/editor", "_blank");
// //     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
// //   } catch {
// //     try { window.location.href = "/content/editor"; } catch {}
// //   }
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    EXCEL PARSING (Keywords + URLs)
// //    ═══════════════════════════════════════════════════════════════ */

// // function norm(s: unknown) {
// //   return String(s ?? "").toLowerCase().replace(/[.\-_/]/g, " ").replace(/\s+/g, " ").trim();
// // }
// // function isLikelyUrlOrDomain(s?: string | null) {
// //   if (!s) return false;
// //   const t = String(s).trim();
// //   if (!t) return false;
// //   if (/^https?:\/\//i.test(t)) return true;
// //   if (/^www\./i.test(t)) return true;
// //   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(t) && !/\s/.test(t)) return true;
// //   return false;
// // }
// // function sanitizeKeyword(raw: unknown): string {
// //   if (raw == null) return "";
// //   let v = String(raw).replace(/\u00A0/g, " ").trim();
// //   if (!v) return "";
// //   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim();
// //   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
// //   if (/^[\d\.,\s]+$/.test(v)) return "";
// //   if (isLikelyUrlOrDomain(v)) return "";
// //   if ((v.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F]/g) || []).length < 2) return "";
// //   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
// //   if (v.length < 2 || v.length > 180) return "";
// //   return v;
// // }

// // type KeywordRow = { keyword: string; url?: string | null };
// // const KW_HEADERS = new Set(["keyword","keywords","focus keyword","search term","term","query","topic","title","key word"]);
// // const URL_HEADERS = new Set(["url","link","target url","target","target page","landing page","page url","destination","href","target link"]);

// // function detectHeaderRowAndColumns(rows: unknown[][]) {
// //   let headerRowIndex = -1;
// //   const maxCheck = Math.min(rows.length, 6);
// //   for (let i = 0; i < maxCheck; i++) {
// //     const r = rows[i];
// //     if (!Array.isArray(r)) continue;
// //     const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
// //     const mostlyText = nonEmpty.filter((c) => /[A-Za-zА-Яа-яЁё\u0900-\u097F]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
// //     if (nonEmpty.length >= 2 && mostlyText) { headerRowIndex = i; break; }
// //   }
// //   if (headerRowIndex === -1) headerRowIndex = 0;

// //   const headers = (rows[headerRowIndex] as unknown[]).map(norm);
// //   let keywordCol = -1, urlCol = -1;
// //   headers.forEach((h, idx) => {
// //     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
// //     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
// //   });

// //   if (keywordCol === -1) {
// //     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
// //     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
// //     let bestCol = -1, bestScore = 0;
// //     for (let c = 0; c < maxCols; c++) {
// //       let score = 0, checks = 0;
// //       for (const rr of lookahead) {
// //         if (!Array.isArray(rr)) continue;
// //         const s = sanitizeKeyword(rr[c]);
// //         if (s) score++;
// //         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
// //       }
// //       const weighted = score * 100 + Math.min(checks, 100);
// //       if (checks === 0) continue;
// //       if (weighted > bestScore) { bestScore = weighted; bestCol = c; }
// //     }
// //     if (bestCol !== -1) keywordCol = bestCol;
// //   }
// //   return { headerRowIndex, keywordCol: keywordCol === -1 ? null : keywordCol, urlCol: urlCol === -1 ? null : urlCol };
// // }

// // function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
// //   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
// //   if (!rows || rows.length === 0) return [];
// //   const { headerRowIndex, keywordCol, urlCol } = detectHeaderRowAndColumns(rows);
// //   const start = Math.min(rows.length - 1, headerRowIndex + 1);
// //   const dataRows = rows.slice(start);
// //   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);

// //   const out: KeywordRow[] = [];
// //   const seen = new Set<string>();

// //   for (const r of dataRows) {
// //     if (!Array.isArray(r)) continue;

// //     let k = "";
// //     if (keywordCol != null) k = sanitizeKeyword(r[keywordCol]);
// //     if (!k) {
// //       for (let c = 0; c < maxCols; c++) {
// //         const cand = sanitizeKeyword(r[c]);
// //         if (cand) { k = cand; break; }
// //       }
// //     }
// //     if (!k || seen.has(k)) continue;

// //     let url: string | null = null;
// //     if (urlCol != null) {
// //       const raw = String(r[urlCol] ?? "").trim();
// //       if (raw && isLikelyUrlOrDomain(raw)) url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
// //     }
// //     if (!url) {
// //       for (let offset = -3; offset <= 3; offset++) {
// //         if (offset === 0) continue;
// //         const idx = (keywordCol ?? 0) + offset;
// //         if (idx < 0 || idx >= maxCols) continue;
// //         const maybe = r[idx];
// //         if (!maybe) continue;
// //         const s = String(maybe).trim();
// //         if (isLikelyUrlOrDomain(s)) { url = /^https?:\/\//i.test(s) ? s : "https://" + s; break; }
// //       }
// //     }
// //     out.push({ keyword: k, url });
// //     seen.add(k);
// //   }
// //   return out;
// // }

// // function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array) {
// //   const workbook = XLSX.read(buffer, { type: "array" });
// //   const sheetNames = workbook.SheetNames ?? [];
// //   const combined: KeywordRow[] = [];
// //   const seen = new Set<string>();
// //   for (const sheetName of sheetNames) {
// //     try {
// //       const sheet = workbook.Sheets[sheetName];
// //       const ks = extractKeywordsFromWorksheetWithUrls(sheet);
// //       for (const k of ks) if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
// //       if (combined.length > 10000) break;
// //     } catch (e) {
// //       console.warn("worksheet parse failed:", sheetName, e);
// //     }
// //   }
// //   return { keywords: combined };
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    CONTENT SHAPING HELPERS
// //    ═══════════════════════════════════════════════════════════════ */

// // type LangCode = "en" | "hi" | "ru";
// // function lcOf(pref?: string): LangCode {
// //   const t = (pref || "").toLowerCase();
// //   if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
// //   if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
// //   return "en";
// // }
// // function stripTagsFast(html: string) {
// //   return (html || "")
// //     .replace(/<script[\s\S]*?<\/script>/gi, " ")
// //     .replace(/<style[\s\S]*?<\/style>/gi, " ")
// //     .replace(/<\/?[^>]+>/g, " ")
// //     .replace(/&nbsp;|&#160;/g, " ")
// //     .replace(/\s+/g, " ").trim();
// // }

// // function squashRepetition(text: string): string {
// //   let out = text.replace(/(\b([a-z\u0400-\u04ff\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
// //   out = out.replace(/(\b[^\s<>\{}]+\b(?:\s+\b[^\s<>\{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
// //   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
// //   return out;
// // }
// // function extractH1PSections(html: string) {
// //   const out: { h: string; p: string }[] = [];
// //   if (!html) return out;
// //   const cleaned = html.replace(/\bundefined\b/gi, "");
// //   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
// //   let cursor = 0;
// //   for (let i = 0; i < h1Matches.length; i++) {
// //     const h = h1Matches[i];
// //     const idx = cleaned.indexOf(h, cursor);
// //     if (idx === -1) continue;
// //     cursor = idx + h.length;
// //     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
// //     const p = pMatch ? pMatch[0] : "";
// //     if (p) { out.push({ h, p }); cursor += p.length; }
// //   }
// //   return out;
// // }
// // function nonTokenWordCount(html: string) {
// //   const noTokens = (html || "").replace(/\[ANCHOR:[^\]]+\]/g, " ");
// //   const text = noTokens
// //     .replace(/<script[\s\S]*?<\/script>/gi, " ")
// //     .replace(/<style[\s\S]*?<\/style>/gi, " ")
// //     .replace(/<\/?[^>]+>/g, " ")
// //     .replace(/&nbsp;|&#160;/g, " ")
// //     .replace(/\s+/g, " ")
// //     .trim();
// //   return text ? text.split(/\s+/).filter(w => w.length > 1).length : 0;
// // }
// // function looksLikeLLMFallback(html: string) {
// //   const hasDraftMarker = /—\s*draft\./i.test(html);
// //   const h1Count = (html.match(/<h1>/gi) || []).length;
// //   const fewWords = nonTokenWordCount(html) < 50;
// //   return hasDraftMarker || (h1Count <= 1 && fewWords);
// // }
// // function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number, lc: LangCode) {
// //   const pairs = extractH1PSections(rawHtml);
// //   if (pairs.length >= wantSections) {
// //     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
// //   }
// //   const baseWords = nonTokenWordCount(rawHtml);
// //   if (baseWords < Math.max(paraMin, 50)) {
// //     throw new Error("Insufficient body returned by LLM; refusing to fabricate sections.");
// //   }
// //   const cleaned = rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ");
// //   const words = stripTagsFast(squashRepetition(cleaned)).split(/\s+/).filter(Boolean);
// //   const sections: string[] = [];
// //   let idx = 0;
// //   const BANK = lc === "ru"
// //     ? ["Почему это важно","Полезные особенности","Что проверить заранее","Типичные ошибки и решения","Практические советы","Как закрепить результат"]
// //     : lc === "hi"
// //       ? ["क्यों यह महत्वपूर्ण है","मदद करने वाली मुख्य बातें","समय बचाने वाले जाँच-बिंदु","सामान्य गलतियाँ और उपाय","व्यावहारिक सुझाव","सीख को स्थायी बनाएं"]
// //       : ["Why This Matters","Core Features That Help","Checks That Save Time","Common Pitfalls & Fixes","Real-World Tips","Make It Stick"];
// //   for (let s = 0; s < wantSections; s++) {
// //     let take = Math.floor((paraMin + paraMax) / 2);
// //     if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
// //     if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
// //     const chunk = words.slice(idx, idx + take).join(" ").trim();
// //     const h1 = BANK[s % BANK.length];
// //     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
// //     idx += take;
// //   }
// //   return sections;
// // }
// // function removeAllTokens(s: string) { return s.replace(/\[ANCHOR:[^\]]+\]/g, ""); }
// // function computeSectionKeywordMap(N: number, keywords: string[]) {
// //   const map: Record<number, string | null> = {};
// //   if (keywords.length === 1) { map[0] = keywords[0]; }
// //   else if (keywords.length === 2) { map[0] = keywords[0]; map[Math.min(2, N - 1)] = keywords[1]; }
// //   else if (keywords.length >= 4) { for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i]; }
// //   return map;
// // }
// // function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
// //   const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
// //   const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
// //   let idx = 0;
// //   let result = html;
// //   for (const block of blocks) {
// //     const allowed = sectionMap[idx++] || "";
// //     if (!allowed) continue;
// //     let replaced = block;

// //     for (const k of keywords) {
// //       if (k === allowed) continue;
// //       const aRe = new RegExp(`<a[^>]*>\\s*(${esc(k)})\\s*<\\/a>`, "gi");
// //       const bRe = new RegExp(`<strong>\\s*(${esc(k)})\\s*<\\/strong>`, "gi");
// //       replaced = replaced.replace(aRe, "$1").replace(bRe, "$1");
// //     }

// //     const allowedA = new RegExp(`<a[^>]*>\\s*(${esc(allowed)})\\s*<\\/a>`, "gi");
// //     let seen = 0;
// //     replaced = replaced.replace(allowedA, (_m, g1) => (++seen === 1 ? _m : g1));

// //     const allowedB = new RegExp(`<strong>\\s*(${esc(allowed)})\\s*<\\/strong>`, "gi");
// //     seen = 0;
// //     replaced = replaced.replace(allowedB, (_m, g1) => (++seen === 1 ? _m : g1));

// //     result = result.replace(block, replaced);
// //   }
// //   return result;
// // }
// // function ensureNoTerminalKeyword(html: string, keywords: string[], lc: LangCode) {
// //   const tails = lc === "ru"
// //     ? ["как правило", "на практике", "для большинства проектов", "в итоге"]
// //     : lc === "hi"
// //       ? ["अक्सर", "व्यवहार में", "अधिकतर मामलों में", "आम तौर पर"]
// //       : ["in practice", "for most teams", "in real use", "overall"];
// //   const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
// //   const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
// //   let out = html;
// //   for (const pHtml of paragraphs) {
// //     const inner = pHtml.replace(/^<p>|<\/p>$/gi, "");
// //     const trimmed = inner.replace(/\s+/g, " ").trim();
// //     let needsTail = false;
// //     for (const kw of keywords) {
// //       const endPlain = new RegExp(`${esc(kw)}\\s*(?:[.!?…]*)\\s*$`, "i");
// //       const endAnchor = new RegExp(`>\\s*${esc(kw)}\\s*<\\/a>\\s*(?:[.!?…]*)\\s*$`, "i");
// //       const endStrong = new RegExp(`>\\s*${esc(kw)}\\s*<\\/strong>\\s*(?:[.!?…]*)\\s*$`, "i");
// //       if (endPlain.test(trimmed) || endAnchor.test(trimmed) || endStrong.test(trimmed)) { needsTail = true; break; }
// //     }
// //     if (!needsTail) continue;
// //     const tail = tails[Math.floor(Math.random() * tails.length)];
// //     const fixed = trimmed.replace(/\s*(?:[.!?…]*)\s*$/, `, ${tail}.`);
// //     const newP = `<p>${fixed}</p>`;
// //     out = out.replace(pHtml, newP);
// //   }
// //   return out;
// // }
// // function basicValidate(html: string, keywords: string[], wantSections: number) {
// //   if (looksLikeLLMFallback(html)) return false;
// //   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //   if (blocks < wantSections - 1) return false;
// //   for (const k of keywords.slice(0, Math.min(2, keywords.length))) {
// //     if (!html.includes(k)) return false;
// //   }
// //   return true;
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    ADDITIONAL HUMANIZATION POST-PROCESSING FOR AI-FREE FEEL
// //    ═══════════════════════════════════════════════════════════════ */

// // function humanizeText(text: string): string {
// //   // Add slight imperfections: contractions, varied punctuation, natural breaks
// //   text = text.replace(/ do not /g, " don't ").replace(/ is not /g, " isn't ").replace(/ it is /g, " it's ");
// //   text = text.replace(/\. /g, (match) => Math.random() > 0.7 ? "; " : match);
// //   text = text.replace(/, /g, (match) => Math.random() > 0.8 ? "— " : match);

// //   // Introduce minor "human errors" like repeated words or asides (rarely)
// //   const sentences = text.split(/([.!?])/g);
// //   for (let i = 0; i < sentences.length; i += 2) {
// //     if (Math.random() < 0.05 && sentences[i].split(" ").length > 5) {
// //       const words = sentences[i].split(" ");
// //       const insertIdx = Math.floor(Math.random() * words.length);
// //       words.splice(insertIdx, 0, "you know,");
// //       sentences[i] = words.join(" ");
// //     }
// //   }
// //   text = sentences.join("");

// //   // Vary sentence lengths more aggressively
// //   text = squashRepetition(text);

// //   return text;
// // }

// // function humanizeHtml(html: string): string {
// //   const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
// //   let out = html;
// //   for (const pHtml of paragraphs) {
// //     const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
// //     const humanized = humanizeText(inner);
// //     const newP = `<p>${humanized}</p>`;
// //     out = out.replace(pHtml, newP);
// //   }
// //   return out;
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    GROUPING
// //    ═══════════════════════════════════════════════════════════════ */
// // function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
// //   const groups: KeywordRow[][] = [];
// //   for (let i = 0; i < rows.length; i += size) groups.push(rows.slice(i, i + size));
// //   return groups;
// // }
// // function sampleDistinct<T>(arr: T[], size: number): T[] {
// //   if (size <= 0) return [];
// //   if (arr.length === 0) return [];
// //   if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
// //   const takenIdx = new Set<number>();
// //   let tries = 0;
// //   while (takenIdx.size < Math.min(size, arr.length) && tries < size * 8) {
// //     takenIdx.add(Math.floor(Math.random() * arr.length));
// //     tries++;
// //   }
// //   const out = Array.from(takenIdx).map(i => arr[i]);
// //   while (out.length < size) out.push(arr[Math.floor(Math.random() * arr.length)]);
// //   return out;
// // }
// // function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
// //   const groups: KeywordRow[][] = [];
// //   for (let i = 0; i < count; i++) groups.push(sampleDistinct(rows, size));
// //   return groups;
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    MAIN HOOK
// //    ═══════════════════════════════════════════════════════════════ */
// // export function useContentGeneration() {
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
// //   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

// //   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
// //     startTransition(() => {
// //       setExcelProjects((prev = []) => {
// //         const exists = prev.some((p) => p.id === proj.id);
// //         const base: ExcelProject = {
// //           id: proj.id,
// //           fileName: proj.fileName,
// //           status: (proj as any).status ?? "pending",
// //           totalKeywords: (proj as any).totalKeywords ?? 0,
// //           processedKeywords: (proj as any).processedKeywords ?? 0,
// //           createdAt: (proj as any).createdAt ?? new Date().toISOString(),
// //           error: (proj as any).error,
// //           failedCount: (proj as any).failedCount ?? 0,
// //         };
// //         if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
// //         return [...prev, base];
// //       });
// //     });
// //   };

// //   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
// //     setIsProcessing(true);
// //     onProgress?.(0);
// //     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

// //     const bufferItems: ContentItem[] = [];
// //     let scheduled = false;
// //     const BATCH_SIZE = 20;
// //     const flushNow = () => {
// //       scheduled = false;
// //       if (!bufferItems.length) return;
// //       const toWrite = bufferItems.splice(0, bufferItems.length);
// //       startTransition(() => {
// //         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
// //       });
// //     };
// //     const scheduleFlush = () => {
// //       if (bufferItems.length >= BATCH_SIZE) return flushNow();
// //       if (!scheduled) { scheduled = true; queueMicrotask(flushNow); }
// //     };

// //     let failedCount = 0;
// //     let processedCount = 0;
// //     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

// //     const updateProgress = (processed: number, total: number) => {
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
// //       });
// //       try { onProgress?.(Math.round((processed / Math.max(1, total)) * 100)); } catch {}
// //     };

// //     try {
// //       const buffer = await file.arrayBuffer();
// //       const { keywords } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
// //       if (!keywords.length) {
// //         ensureProject({ id: fileId, fileName: file.name, status: "error", error: "No valid keywords found in the uploaded Excel file" });
// //         toast.error("No valid keywords found in the uploaded Excel file.");
// //         onProgress?.(100);
// //         return;
// //       }

// //       const prefs = getFreshPrefs();
// //       const lc = lcOf(prefs.language);
// //       const size = (prefs.keywordMode ?? 1) as KeywordMode;

// //       const baseGroups = prefs.customModeEnabled
// //         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
// //         : buildGroupsNormal(keywords, size);

// //       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
// //       toast.info(`⚡ Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article • Humanized content`);

// //       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.88);
// //       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.15);
// //       const wantSections = prefs.sectionCount || 5;

// //       // 🚀 Turbo pool-aware concurrency (increased for speed)
// //       let concurrency = Math.min(Math.max(12, (navigator.hardwareConcurrency ?? 4) * 3), 24);
// //       const MAX = 96;

// //       let idx = 0;
// //       const running = new Set<Promise<void>>();

// //       const startNext = () => {
// //         if (idx >= baseGroups.length) return;
// //         const groupIndex = idx++;
// //         const grp = baseGroups[groupIndex];
// //         const kws = grp.map((g) => g.keyword);
// //         const urlMap: Record<string, string | null> = {};
// //         grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

// //         const task = (async () => {
// //           try {
// //             const basePlan = buildPlanFromPrefs({
// //               keywords: kws,
// //               prefs: {
// //                 ...prefs,
// //                 sectionCount: (prefs.sectionCount as any) || 5,
// //                 paragraphWords: (prefs.paragraphWords as any) || 100,
// //               },
// //               variationId: groupIndex + 1,
// //             });

// //             const result = await generateJSONTitleHtml({ 
//             //   keywords: kws, 
//             //   instructions: basePlan,
//             //   titleLength: prefs.titleLength || 100
//             // });

// //             // Reject stub/fallback so it retries & never leaks to UI
// //             const html0 = String(result.html || "");
// //             if (/—\s*draft\./i.test(html0) || (html0.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0) < 50) {
// //               throw new Error("LLM fallback/stub detected (rate-limit or non-JSON).");
// //             }

// //             let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax, lc);
// //             sections = sections.map((s, i) => (kws[i] ? s.replace(/<\/p>/i, ` [ANCHOR:${kws[i]}]</p>`) : s));

// //             let bodyHtml = sections.join("");
// //             bodyHtml = squashRepetition(bodyHtml);

// //             if (!basicValidate(bodyHtml, kws, wantSections)) {
// //               throw new Error("Basic validation failed");
// //             }

// //             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
// //             let html = applyAnchorTokens(bodyHtml, anchors);
// //             html = removeAllTokens(html);

// //             const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //             const secMap = computeSectionKeywordMap(bodyCount, kws);
// //             html = enforceSingleKeywordPerParagraph(html, kws, secMap);
// //             html = ensureNoTerminalKeyword(html, kws, lc);
// //             html = squashRepetition(html);

// //             // Additional humanization for AI-free content
// //             html = humanizeHtml(html);

// //             const item: ContentItem = {
// //               id: `${fileId}-${groupIndex}-${Date.now()}`,
// //               keyword: kws[0],
// //               keywordsUsed: kws,
// //               generatedContent: html,
// //               fileId,
// //               fileName: file.name,
// //               createdAt: new Date().toISOString(),
// //               title: result.title,
// //               targetUrl: urlMap[kws[0]] ?? null,
// //               urlMap,
// //               status: "success",
// //               prefsSnapshot: {
// //                 mood: prefs.mood,
// //                 paragraphWords: prefs.paragraphWords,
// //                 sectionCount: prefs.sectionCount,
// //                 includeConclusion: prefs.includeConclusion,
// //                 language: prefs.language,
// //                 customModeEnabled: prefs.customModeEnabled,
// //                 articleCount: prefs.articleCount,
// //                 keywordMode: prefs.keywordMode,
// //               },
// //             };
// //             bufferItems.push(item);
// //             scheduleFlush();
// //           } catch (e) {
// //             failedCount++;
// //             failedGroups.push({ index: groupIndex, grp });
// //             console.error("group generate error:", e);
// //           } finally {
// //             processedCount += 1;
// //             updateProgress(processedCount, baseGroups.length);
// //           }
// //         })().finally(() => running.delete(task));

// //         running.add(task);
// //       };

// //       // Main loop
// //       while (idx < baseGroups.length || running.size > 0) {
// //         const cur = Math.max(12, Math.min(Math.floor(concurrency), MAX));
// //         while (running.size < cur && idx < baseGroups.length) startNext();
// //         if (!running.size && idx >= baseGroups.length) break;
// //         await Promise.race(Array.from(running));

// //         // Adapt concurrency to avoid 429 bursts, but keep speed (more aggressive)
// //         if (failedCount > processedCount * 0.2 && concurrency > 12) concurrency -= 0.5;
// //         else if (concurrency < MAX && failedCount < processedCount * 0.05) concurrency += 0.5;
// //       }

// //       // Tail retry (low & polite)
// //       if (failedGroups.length) {
// //         toast.message(`Retrying ${failedGroups.length} failed item(s) at low speed…`);
// //         const again = [...failedGroups];
// //         failedGroups.length = 0;

// //         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
// //           const kws = grp.map(g => g.keyword);
// //           const urlMap: Record<string, string | null> = {};
// //           grp.forEach(g => { urlMap[g.keyword] = g.url ?? null; });

// //           const basePlan = buildPlanFromPrefs({
// //             keywords: kws,
// //             prefs: {
// //               ...prefs,
// //               sectionCount: (prefs.sectionCount as any) || 5,
// //               paragraphWords: (prefs.paragraphWords as any) || 100,
// //             },
// //             variationId: groupIndex + 1,
// //           });

// //           const res = await generateJSONTitleHtml({ 
//             keywords: kws,
//             instructions: basePlan,
//             titleLength: prefs.titleLength || 100
//           });
// //           const html0b = String(res.html || "");
// //           if (/—\s*draft\./i.test(html0b) || (html0b.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0b) < 50) {
// //             throw new Error("LLM fallback/stub on retry");
// //           }

// //           let sections = ensureH1SectionsFromAnyHtml(res.html, wantSections, paraMin, paraMax, lc);
// //           sections = sections.map((s, i) => (kws[i] ? s.replace(/<\/p>/i, ` [ANCHOR:${kws[i]}]</p>`) : s));

// //           let bodyHtml = sections.join("");
// //           bodyHtml = squashRepetition(bodyHtml);
// //           if (!basicValidate(bodyHtml, kws, wantSections)) throw new Error("Basic validation failed on retry");

// //           const anchors = Object.keys(urlMap).map(k => ({ keyword: k, url: urlMap[k] || undefined }));
// //           let html = applyAnchorTokens(bodyHtml, anchors);
// //           html = removeAllTokens(html);

// //           const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //           const secMap = computeSectionKeywordMap(bodyCount, kws);
// //           html = enforceSingleKeywordPerParagraph(html, kws, secMap);
// //           html = ensureNoTerminalKeyword(html, kws, lc);
// //           html = squashRepetition(html);

// //           // Additional humanization for AI-free content
// //           html = humanizeHtml(html);

// //           const item: ContentItem = {
// //             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
// //             keyword: kws[0],
// //             keywordsUsed: kws,
// //             generatedContent: html,
// //             fileId,
// //             fileName: file.name,
// //             createdAt: new Date().toISOString(),
// //             title: res.title,
// //             targetUrl: urlMap[kws[0]] ?? null,
// //             urlMap,
// //             status: "success",
// //             prefsSnapshot: {
// //               mood: prefs.mood,
// //               paragraphWords: prefs.paragraphWords,
// //               sectionCount: prefs.sectionCount,
// //               includeConclusion: prefs.includeConclusion,
// //               language: prefs.language,
// //               customModeEnabled: prefs.customModeEnabled,
// //               articleCount: prefs.articleCount,
// //               keywordMode: prefs.keywordMode,
// //             },
// //           };
// //           bufferItems.push(item);
// //           scheduleFlush();
// //         };

// //         const RETRY_CONCURRENCY = 4; // Increased for faster retries
// //         const queue = [...again];
// //         const running2 = new Set<Promise<void>>();

// //         const startNextRetry = () => {
// //           if (!queue.length) return;
// //           const { grp, index } = queue.shift()!;
// //           const p = (async () => {
// //             try {
// //               await runOne(grp, index);
// //             } catch (e) {
// //               console.error("retry group failed:", e);
// //             }
// //           })().finally(() => running2.delete(p));
// //           running2.add(p);
// //         };

// //         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
// //         while (running2.size || queue.length) {
// //           await Promise.race(Array.from(running2));
// //           while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
// //           await new Promise(r => setTimeout(r, 200 + Math.random() * 200)); // Reduced delay
// //         }
// //       }

// //       flushNow();
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) =>
// //           p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
// //         ));
// //       });
// //       const ok = baseGroups.length - failedCount;
// //       toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
// //       onProgress?.(100);
// //     } catch (error) {
// //       console.error("generateContent overall error:", error);
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) =>
// //           p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
// //         ));
// //       });
// //       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
// //       onProgress?.(100);
// //       throw error;
// //     } finally {
// //       flushNow();
// //       setIsProcessing(false);
// //     }
// //   };

// //   const deleteProject = (projectId: string) => {
// //     startTransition(() => {
// //       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
// //       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
// //     });
// //     toast.success("Project deleted");
// //   };

// //   const deleteAllProjects = () => {
// //     startTransition(() => {
// //       setExcelProjects([]);
// //       setContentItems([]);
// //     });
// //     toast.success("All projects cleared");
// //   };

// //   return {
// //     generateContent,
// //     isProcessing,
// //     contentItems,
// //     setContentItems,
// //     excelProjects,
// //     setExcelProjects,
// //     deleteProject,
// //     deleteAllProjects,
// //     openContentEditor,
// //   };
// // }



// // // src/hooks/use-content.ts
// // import { useState, startTransition } from "react";
// // import { toast } from "sonner";
// // import { useLocalStorage } from "@/hooks/use-local-storage";
// // import * as XLSX from "xlsx";
// // import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// // import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// // import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// // /* ═══════════════════════════════════════════════════════════════
// //    SPEED OPTIMIZED + HUMANIZATION FOCUSED (Turbo pool-aware)
// //    ═══════════════════════════════════════════════════════════════ */

// // const PREF_KEY = "content-preferences_v3";
// // function getFreshPrefs(): ContentPreferences {
// //   try {
// //     const raw = localStorage.getItem(PREF_KEY);
// //     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
// //   } catch { return {} as any; }
// // }

// // export interface ContentItem {
// //   id: string;
// //   keyword: string;
// //   keywordsUsed?: string[];
// //   generatedContent: string;
// //   fileId: string;
// //   fileName: string;
// //   createdAt: string;
// //   title?: string;
// //   targetUrl?: string | null;
// //   urlMap?: Record<string, string | null>;
// //   status?: "success" | "failed";
// //   prefsSnapshot?: Partial<ContentPreferences>;
// // }

// // interface ExcelProject {
// //   id: string;
// //   fileName: string;
// //   status: "pending" | "processing" | "completed" | "error";
// //   totalKeywords: number;
// //   processedKeywords: number;
// //   createdAt: string;
// //   error?: string;
// //   failedCount?: number;
// // }

// // type GenerateProgressCallback = (p: number) => void;

// // const SESSION_KEY = "open-content-item_v1";
// // export function openContentEditor(item: ContentItem) {
// //   try {
// //     try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(item)); }
// //     catch { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); }
// //     const win = window.open("/content/editor", "_blank");
// //     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
// //   } catch {
// //     try { window.location.href = "/content/editor"; } catch {}
// //   }
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    EXCEL PARSING (Keywords + URLs)
// //    ═══════════════════════════════════════════════════════════════ */

// // function norm(s: unknown) {
// //   return String(s ?? "").toLowerCase().replace(/[.\-_/]/g, " ").replace(/\s+/g, " ").trim();
// // }
// // function isLikelyUrlOrDomain(s?: string | null) {
// //   if (!s) return false;
// //   const t = String(s).trim();
// //   if (!t) return false;
// //   if (/^https?:\/\//i.test(t)) return true;
// //   if (/^www\./i.test(t)) return true;
// //   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(t) && !/\s/.test(t)) return true;
// //   return false;
// // }
// // function sanitizeKeyword(raw: unknown): string {
// //   if (raw == null) return "";
// //   let v = String(raw).replace(/\u00A0/g, " ").trim();
// //   if (!v) return "";
// //   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim();
// //   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
// //   if (/^[\d\.,\s]+$/.test(v)) return "";
// //   if (isLikelyUrlOrDomain(v)) return "";
// //   if ((v.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F]/g) || []).length < 2) return "";
// //   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
// //   if (v.length < 2 || v.length > 180) return "";
// //   return v;
// // }

// // type KeywordRow = { keyword: string; url?: string | null };
// // const KW_HEADERS = new Set(["keyword","keywords","focus keyword","search term","term","query","topic","title","key word"]);
// // const URL_HEADERS = new Set(["url","link","target url","target","target page","landing page","page url","destination","href","target link"]);

// // function detectHeaderRowAndColumns(rows: unknown[][]) {
// //   let headerRowIndex = -1;
// //   const maxCheck = Math.min(rows.length, 6);
// //   for (let i = 0; i < maxCheck; i++) {
// //     const r = rows[i];
// //     if (!Array.isArray(r)) continue;
// //     const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
// //     const mostlyText = nonEmpty.filter((c) => /[A-Za-zА-Яа-яЁё\u0900-\u097F]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
// //     if (nonEmpty.length >= 2 && mostlyText) { headerRowIndex = i; break; }
// //   }
// //   if (headerRowIndex === -1) headerRowIndex = 0;

// //   const headers = (rows[headerRowIndex] as unknown[]).map(norm);
// //   let keywordCol = -1, urlCol = -1;
// //   headers.forEach((h, idx) => {
// //     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
// //     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
// //   });

// //   if (keywordCol === -1) {
// //     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
// //     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
// //     let bestCol = -1, bestScore = 0;
// //     for (let c = 0; c < maxCols; c++) {
// //       let score = 0, checks = 0;
// //       for (const rr of lookahead) {
// //         if (!Array.isArray(rr)) continue;
// //         const s = sanitizeKeyword(rr[c]);
// //         if (s) score++;
// //         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
// //       }
// //       const weighted = score * 100 + Math.min(checks, 100);
// //       if (checks === 0) continue;
// //       if (weighted > bestScore) { bestScore = weighted; bestCol = c; }
// //     }
// //     if (bestCol !== -1) keywordCol = bestCol;
// //   }
// //   return { headerRowIndex, keywordCol: keywordCol === -1 ? null : keywordCol, urlCol: urlCol === -1 ? null : urlCol };
// // }

// // function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
// //   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
// //   if (!rows || rows.length === 0) return [];
// //   const { headerRowIndex, keywordCol, urlCol } = detectHeaderRowAndColumns(rows);
// //   const start = Math.min(rows.length - 1, headerRowIndex + 1);
// //   const dataRows = rows.slice(start);
// //   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);

// //   const out: KeywordRow[] = [];
// //   const seen = new Set<string>();

// //   for (const r of dataRows) {
// //     if (!Array.isArray(r)) continue;

// //     let k = "";
// //     if (keywordCol != null) k = sanitizeKeyword(r[keywordCol]);
// //     if (!k) {
// //       for (let c = 0; c < maxCols; c++) {
// //         const cand = sanitizeKeyword(r[c]);
// //         if (cand) { k = cand; break; }
// //       }
// //     }
// //     if (!k || seen.has(k)) continue;

// //     let url: string | null = null;
// //     if (urlCol != null) {
// //       const raw = String(r[urlCol] ?? "").trim();
// //       if (raw && isLikelyUrlOrDomain(raw)) url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
// //     }
// //     if (!url) {
// //       for (let offset = -3; offset <= 3; offset++) {
// //         if (offset === 0) continue;
// //         const idx = (keywordCol ?? 0) + offset;
// //         if (idx < 0 || idx >= maxCols) continue;
// //         const maybe = r[idx];
// //         if (!maybe) continue;
// //         const s = String(maybe).trim();
// //         if (isLikelyUrlOrDomain(s)) { url = /^https?:\/\//i.test(s) ? s : "https://" + s; break; }
// //       }
// //     }
// //     out.push({ keyword: k, url });
// //     seen.add(k);
// //   }
// //   return out;
// // }

// // function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array) {
// //   const workbook = XLSX.read(buffer, { type: "array" });
// //   const sheetNames = workbook.SheetNames ?? [];
// //   const combined: KeywordRow[] = [];
// //   const seen = new Set<string>();
// //   for (const sheetName of sheetNames) {
// //     try {
// //       const sheet = workbook.Sheets[sheetName];
// //       const ks = extractKeywordsFromWorksheetWithUrls(sheet);
// //       for (const k of ks) if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
// //       if (combined.length > 10000) break;
// //     } catch (e) {
// //       console.warn("worksheet parse failed:", sheetName, e);
// //     }
// //   }
// //   return { keywords: combined };
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    CONTENT SHAPING HELPERS
// //    ═══════════════════════════════════════════════════════════════ */

// // type LangCode = "en" | "hi" | "ru";
// // function lcOf(pref?: string): LangCode {
// //   const t = (pref || "").toLowerCase();
// //   if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
// //   if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
// //   return "en";
// // }
// // function stripTagsFast(html: string) {
// //   return (html || "")
// //     .replace(/<script[\s\S]*?<\/script>/gi, " ")
// //     .replace(/<style[\s\S]*?<\/style>/gi, " ")
// //     .replace(/<\/?[^>]+>/g, " ")
// //     .replace(/&nbsp;|&#160;/g, " ")
// //     .replace(/\s+/g, " ").trim();
// // }

// // function squashRepetition(text: string): string {
// //   let out = text.replace(/(\b([a-z\u0400-\u04ff\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
// //   out = out.replace(/(\b[^\s<>\{}]+\b(?:\s+\b[^\s<>\{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
// //   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
// //   return out;
// // }
// // function extractH1PSections(html: string) {
// //   const out: { h: string; p: string }[] = [];
// //   if (!html) return out;
// //   const cleaned = html.replace(/\bundefined\b/gi, "");
// //   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
// //   let cursor = 0;
// //   for (let i = 0; i < h1Matches.length; i++) {
// //     const h = h1Matches[i];
// //     const idx = cleaned.indexOf(h, cursor);
// //     if (idx === -1) continue;
// //     cursor = idx + h.length;
// //     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
// //     const p = pMatch ? pMatch[0] : "";
// //     if (p) { out.push({ h, p }); cursor += p.length; }
// //   }
// //   return out;
// // }
// // function nonTokenWordCount(html: string) {
// //   const noTokens = (html || "").replace(/\[ANCHOR:[^\]]+\]/g, " ");
// //   const text = noTokens
// //     .replace(/<script[\s\S]*?<\/script>/gi, " ")
// //     .replace(/<style[\s\S]*?<\/style>/gi, " ")
// //     .replace(/<\/?[^>]+>/g, " ")
// //     .replace(/&nbsp;|&#160;/g, " ")
// //     .replace(/\s+/g, " ")
// //     .trim();
// //   return text ? text.split(/\s+/).filter(w => w.length > 1).length : 0;
// // }
// // function looksLikeLLMFallback(html: string) {
// //   const hasDraftMarker = /—\s*draft\./i.test(html);
// //   const h1Count = (html.match(/<h1>/gi) || []).length;
// //   const fewWords = nonTokenWordCount(html) < 50;
// //   return hasDraftMarker || (h1Count <= 1 && fewWords);
// // }
// // // function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number, lc: LangCode) {
// // //   const pairs = extractH1PSections(rawHtml);
// // //   if (pairs.length >= wantSections) {
// // //     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
// // //   }
// // //   const baseWords = nonTokenWordCount(rawHtml);
// // //   if (baseWords < Math.max(paraMin, 50)) {
// // //     throw new Error("Insufficient body returned by LLM; refusing to fabricate sections.");
// // //   }
// // //   const cleaned = rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ");
// // //   const words = stripTagsFast(squashRepetition(cleaned)).split(/\s+/).filter(Boolean);
// // //   const sections: string[] = [];
// // //   let idx = 0;
// // //   const BANK = lc === "ru"
// // //     ? ["Почему это важно","Полезные особенности","Что проверить заранее","Типичные ошибки и решения","Практические советы","Как закрепить результат"]
// // //     : lc === "hi"
// // //       ? ["क्यों यह महत्वपूर्ण है","मदद करने वाली मुख्य बातें","समय बचाने वाले जाँच-बिंदु","सामान्य गलतियाँ और उपाय","व्यावहारिक सुझाव","सीख को स्थायी बनाएं"]
// // //       : ["Why This Matters","Core Features That Help","Checks That Save Time","Common Pitfalls & Fixes","Real-World Tips","Make It Stick"];
// // //   for (let s = 0; s < wantSections; s++) {
// // //     let take = Math.floor((paraMin + paraMax) / 2);
// // //     if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
// // //     if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
// // //     const chunk = words.slice(idx, idx + take).join(" ").trim();
// // //     const h1 = BANK[s % BANK.length];
// // //     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
// // //     idx += take;
// // //   }
// // //   return sections;
// // // }
// // function removeAllTokens(s: string) { return s.replace(/\[ANCHOR:[^\]]+\]/g, ""); }
// // function computeSectionKeywordMap(N: number, keywords: string[]) {
// //   const map: Record<number, string | null> = {};
// //   if (keywords.length === 1) { map[0] = keywords[0]; }
// //   else if (keywords.length === 2) { map[0] = keywords[0]; map[Math.min(2, N - 1)] = keywords[1]; }
// //   else if (keywords.length >= 4) { for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i]; }
// //   return map;
// // }
// // function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
// //   const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
// //   const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
// //   let idx = 0;
// //   let result = html;
// //   for (const block of blocks) {
// //     const allowed = sectionMap[idx++] || "";
// //     if (!allowed) continue;
// //     let replaced = block;

// //     for (const k of keywords) {
// //       if (k === allowed) continue;
// //       const aRe = new RegExp(`<a[^>]*>\\s*(${esc(k)})\\s*<\\/a>`, "gi");
// //       const bRe = new RegExp(`<strong>\\s*(${esc(k)})\\s*<\\/strong>`, "gi");
// //       replaced = replaced.replace(aRe, "$1").replace(bRe, "$1");
// //     }

// //     const allowedA = new RegExp(`<a[^>]*>\\s*(${esc(allowed)})\\s*<\\/a>`, "gi");
// //     let seen = 0;
// //     replaced = replaced.replace(allowedA, (_m, g1) => (++seen === 1 ? _m : g1));

// //     const allowedB = new RegExp(`<strong>\\s*(${esc(allowed)})\\s*<\\/strong>`, "gi");
// //     seen = 0;
// //     replaced = replaced.replace(allowedB, (_m, g1) => (++seen === 1 ? _m : g1));

// //     result = result.replace(block, replaced);
// //   }
// //   return result;
// // }
// // function ensureNoTerminalKeyword(html: string, keywords: string[], lc: LangCode) {
// //   const tails = lc === "ru"
// //     ? ["как правило", "на практике", "для большинства проектов", "в итоге"]
// //     : lc === "hi"
// //       ? ["अक्सर", "व्यवहार में", "अधिकतर मामलों में", "आम तौर पर"]
// //       : ["in practice", "for most teams", "in real use", "overall"];
// //   const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
// //   const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
// //   let out = html;
// //   for (const pHtml of paragraphs) {
// //     const inner = pHtml.replace(/^<p>|<\/p>$/gi, "");
// //     const trimmed = inner.replace(/\s+/g, " ").trim();
// //     let needsTail = false;
// //     for (const kw of keywords) {
// //       const endPlain = new RegExp(`${esc(kw)}\\s*(?:[.!?…]*)\\s*$`, "i");
// //       const endAnchor = new RegExp(`>\\s*${esc(kw)}\\s*<\\/a>\\s*(?:[.!?…]*)\\s*$`, "i");
// //       const endStrong = new RegExp(`>\\s*${esc(kw)}\\s*<\\/strong>\\s*(?:[.!?…]*)\\s*$`, "i");
// //       if (endPlain.test(trimmed) || endAnchor.test(trimmed) || endStrong.test(trimmed)) { needsTail = true; break; }
// //     }
// //     if (!needsTail) continue;
// //     const tail = tails[Math.floor(Math.random() * tails.length)];
// //     const fixed = trimmed.replace(/\s*(?:[.!?…]*)\s*$/, `, ${tail}.`);
// //     const newP = `<p>${fixed}</p>`;
// //     out = out.replace(pHtml, newP);
// //   }
// //   return out;
// // }
// // function basicValidate(html: string, keywords: string[], wantSections: number) {
// //   if (looksLikeLLMFallback(html)) return false;
// //   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //   if (blocks < wantSections - 1) return false;
// //   for (const k of keywords.slice(0, Math.min(2, keywords.length))) {
// //     if (!html.includes(k)) return false;
// //   }
// //   return true;
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    ADDITIONAL HUMANIZATION POST-PROCESSING FOR AI-FREE FEEL
// //    ═══════════════════════════════════════════════════════════════ */

// // function humanizeText(text: string): string {
// //   // Add slight imperfections: contractions, varied punctuation, natural breaks
// //   text = text.replace(/ do not /g, " don't ").replace(/ is not /g, " isn't ").replace(/ it is /g, " it's ");
// //   text = text.replace(/\. /g, (match) => Math.random() > 0.7 ? "; " : match);
// //   text = text.replace(/, /g, (match) => Math.random() > 0.8 ? "— " : match);

// //   // Introduce minor "human errors" like repeated words or asides (rarely)
// //   const sentences = text.split(/([.!?])/g);
// //   for (let i = 0; i < sentences.length; i += 2) {
// //     if (Math.random() < 0.05 && sentences[i].split(" ").length > 5) {
// //       const words = sentences[i].split(" ");
// //       const insertIdx = Math.floor(Math.random() * words.length);
// //       words.splice(insertIdx, 0, "you know,");
// //       sentences[i] = words.join(" ");
// //     }
// //   }
// //   text = sentences.join("");

// //   // Vary sentence lengths more aggressively
// //   return squashRepetition(text);
// // }

// // function humanizeHtml(html: string): string {
// //   const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
// //   let out = html;
// //   for (const pHtml of paragraphs) {
// //     const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
// //     const humanized = humanizeText(inner);
// //     const newP = `<p>${humanized}</p>`;
// //     out = out.replace(pHtml, newP);
// //   }
// //   return out;
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    GROUPING
// //    ═══════════════════════════════════════════════════════════════ */
// // function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
// //   const groups: KeywordRow[][] = [];
// //   for (let i = 0; i < rows.length; i += size) groups.push(rows.slice(i, i + size));
// //   return groups;
// // }
// // function sampleDistinct<T>(arr: T[], size: number): T[] {
// //   if (size <= 0) return [];
// //   if (arr.length === 0) return [];
// //   if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
// //   const takenIdx = new Set<number>();
// //   let tries = 0;
// //   while (takenIdx.size < Math.min(size, arr.length) && tries < size * 8) {
// //     takenIdx.add(Math.floor(Math.random() * arr.length));
// //     tries++;
// //   }
// //   const out = Array.from(takenIdx).map(i => arr[i]);
// //   while (out.length < size) out.push(arr[Math.floor(Math.random() * arr.length)]);
// //   return out;
// // }
// // function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
// //   const groups: KeywordRow[][] = [];
// //   for (let i = 0; i < count; i++) groups.push(sampleDistinct(rows, size));
// //   return groups;
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    MAIN HOOK
// //    ═══════════════════════════════════════════════════════════════ */
// // export function useContentGeneration() {
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
// //   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

// //   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
// //     startTransition(() => {
// //       setExcelProjects((prev = []) => {
// //         const exists = prev.some((p) => p.id === proj.id);
// //         const base: ExcelProject = {
// //           id: proj.id,
// //           fileName: proj.fileName,
// //           status: (proj as any).status ?? "pending",
// //           totalKeywords: (proj as any).totalKeywords ?? 0,
// //           processedKeywords: (proj as any).processedKeywords ?? 0,
// //           createdAt: (proj as any).createdAt ?? new Date().toISOString(),
// //           error: (proj as any).error,
// //           failedCount: (proj as any).failedCount ?? 0,
// //         };
// //         if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
// //         return [...prev, base];
// //       });
// //     });
// //   };

// //   function splitIntoSentences(text: string): string[] {
// //   // Simple, language-friendly splitter (keeps ., !, ?, …, Devanagari danda)
// //   const cleaned = text.replace(/\s+/g, " ").trim();
// //   if (!cleaned) return [];
// //   return cleaned
// //     .split(/(?<=[\.!?…।])\s+/u)
// //     .map(s => s.trim())
// //     .filter(Boolean);
// // }

// // function buildParagraphsBySentences(rawHtml: string, paraMin: number, paraMax: number): string[] {
// //   // turn html → plain text and build paragraphs by sentence groups (no mid-sentence cuts)
// //   const plain = stripTagsFast(
// //     rawHtml
// //       .replace(/```[\s\S]*?```/g, " ")
// //       .replace(/\bundefined\b/gi, " ")
// //       .replace(/\[ANCHOR:[^\]]+\]/g, " ")
// //   );
// //   const sentences = splitIntoSentences(plain);
// //   if (sentences.length === 0) return [];

// //   const paras: string[] = [];
// //   let cur: string[] = [];
// //   let curCount = 0;

// //   const pushCur = () => {
// //     if (!cur.length) return;
// //     paras.push(cur.join(" ").trim());
// //     cur = [];
// //     curCount = 0;
// //   };

// //   for (const s of sentences) {
// //     const wc = s.split(/\s+/).filter(Boolean).length;
// //     if (curCount + wc <= paraMax) {
// //       cur.push(s);
// //       curCount += wc;
// //       if (curCount >= paraMin) pushCur();
// //     } else {
// //       // if current is empty and sentence itself is too long, hard-wrap by words
// //       if (curCount === 0 && wc > paraMax) {
// //         const words = s.split(/\s+/);
// //         let i = 0;
// //         while (i < words.length) {
// //           const take = Math.min(paraMax, Math.max(paraMin, paraMax - 3));
// //           const chunk = words.slice(i, i + take).join(" ");
// //           cur.push(chunk);
// //           curCount += chunk.split(/\s+/).length;
// //           pushCur();
// //           i += take;
// //         }
// //       } else {
// //         pushCur();
// //         cur.push(s);
// //         curCount = wc;
// //         if (curCount >= paraMin && curCount <= paraMax) pushCur();
// //       }
// //     }
// //   }
// //   pushCur();
// //   return paras;
// // }

// // // Sentence-safe fallback (replaces old ensureH1SectionsFromAnyHtml’s fallback branch)
// // function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number, lc: LangCode) {
// //   const pairs = extractH1PSections(rawHtml);
// //   if (pairs.length >= wantSections) {
// //     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
// //   }

// //   const paras = buildParagraphsBySentences(rawHtml, paraMin, paraMax);
// //   if (paras.length === 0) {
// //     throw new Error("LLM returned too little content to repair.");
// //   }

// //   const BANK = lc === "ru"
// //     ? ["Почему это важно","Полезные особенности","Что проверить заранее","Типичные ошибки и решения","Практические советы","Как закрепить результат"]
// //     : lc === "hi"
// //       ? ["क्यों यह महत्वपूर्ण है","मदद करने वाली मुख्य बातें","समय बचाने वाले जाँच-बिंदु","सामान्य गलतियाँ और उपाय","व्यावहारिक सुझाव","सीख को स्थायी बनाएं"]
// //       : ["Why This Matters","Core Features That Help","Checks That Save Time","Common Pitfalls & Fixes","Real-World Tips","Make It Stick"];

// //   const out: string[] = [];
// //   for (let i = 0; i < wantSections; i++) {
// //     const h = BANK[i % BANK.length];
// //     const p = paras[i] ?? paras[paras.length - 1];
// //     out.push(`<h1>${h}</h1><p>${p}</p>`);
// //   }
// //   return out;
// // }

// // // Insert token NOT at the end of the paragraph
// // function injectTokenMid(pHtml: string, kw: string): string {
// //   const m = pHtml.match(/<p>([\s\S]*?)<\/p>/i);
// //   if (!m) return pHtml;
// //   const inner = m[1].trim();

// //   // If keyword is already present (rare), keep as is
// //   if (new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "i").test(inner)) {
// //     return pHtml;
// //   }

// //   const words = inner.split(/\s+/);
// //   if (words.length < 8) {
// //     // very short; put after first 3 words
// //     const idx = Math.min(3, Math.max(1, words.length - 4));
// //     const before = words.slice(0, idx).join(" ");
// //     const after = words.slice(idx).join(" ");
// //     return `<p>${before} [ANCHOR:${kw}] ${after}</p>`;
// //   }

// //   // place around 55–65% of the way through, leaving ≥3 words after
// //   const minIdx = Math.max(3, Math.floor(words.length * 0.5));
// //   const maxIdx = Math.min(words.length - 4, Math.ceil(words.length * 0.65));
// //   const idx = Math.max(3, Math.min(maxIdx, Math.max(minIdx, Math.floor(words.length * 0.6))));

// //   const before = words.slice(0, idx).join(" ");
// //   const after = words.slice(idx).join(" ");
// //   return `<p>${before} [ANCHOR:${kw}] ${after}</p>`;
// // }


// //   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
// //     setIsProcessing(true);
// //     onProgress?.(0);
// //     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

// //     const bufferItems: ContentItem[] = [];
// //     let scheduled = false;
// //     const BATCH_SIZE = 20;
// //     const flushNow = () => {
// //       scheduled = false;
// //       if (!bufferItems.length) return;
// //       const toWrite = bufferItems.splice(0, bufferItems.length);
// //       startTransition(() => {
// //         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
// //       });
// //     };
// //     const scheduleFlush = () => {
// //       if (bufferItems.length >= BATCH_SIZE) return flushNow();
// //       if (!scheduled) { scheduled = true; queueMicrotask(flushNow); }
// //     };

// //     let failedCount = 0;
// //     let processedCount = 0;
// //     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

// //     const updateProgress = (processed: number, total: number) => {
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
// //       });
// //       try { onProgress?.(Math.round((processed / Math.max(1, total)) * 100)); } catch {}
// //     };

// //     try {
// //       const buffer = await file.arrayBuffer();
// //       const { keywords } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
// //       if (!keywords.length) {
// //         ensureProject({ id: fileId, fileName: file.name, status: "error", error: "No valid keywords found in the uploaded Excel file" });
// //         toast.error("No valid keywords found in the uploaded Excel file.");
// //         onProgress?.(100);
// //         return;
// //       }

// //       const prefs = getFreshPrefs();
// //       const lc = lcOf(prefs.language);
// //       const size = (prefs.keywordMode ?? 1) as KeywordMode;

// //       const baseGroups = prefs.customModeEnabled
// //         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
// //         : buildGroupsNormal(keywords, size);

// //       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
// //       toast.info(`⚡ Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article • Humanized content`);

// //       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.88);
// //       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.15);
// //       // ✅ includeConclusion now increases requested section count (so we don't slice it off)
// //       const wantSections = (prefs.sectionCount || 5) + (prefs.includeConclusion ? 1 : 0);

// //       // 🚀 Turbo pool-aware concurrency (increased for speed)
// //       let concurrency = Math.min(Math.max(12, (navigator.hardwareConcurrency ?? 4) * 3), 24);
// //       const MAX = 96;

// //       let idx = 0;
// //       const running = new Set<Promise<void>>();

// //       const startNext = () => {
// //         if (idx >= baseGroups.length) return;
// //         const groupIndex = idx++;
// //         const grp = baseGroups[groupIndex];
// //         const kws = grp.map((g) => g.keyword);
// //         const urlMap: Record<string, string | null> = {};
// //         grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

// //         const task = (async () => {
// //           try {
// //             const basePlan = buildPlanFromPrefs({
// //               keywords: kws,
// //               prefs: {
// //                 ...prefs,
// //                 sectionCount: (prefs.sectionCount as any) || 5,
// //                 paragraphWords: (prefs.paragraphWords as any) || 100,
// //               },
// //               variationId: groupIndex + 1,
// //             });

// // //             const result = await generateJSONTitleHtml({ 
// //               keywords: kws, 
// //               instructions: basePlan,
// //               titleLength: prefs.titleLength || 100
// //             });

// //             // Reject stub/fallback so it retries & never leaks to UI
// //             const html0 = String(result.html || "");
// //             if (/—\s*draft\./i.test(html0) || (html0.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0) < 50) {
// //               throw new Error("LLM fallback/stub detected (rate-limit or non-JSON).");
// //             }

// //             // ✅ keep conclusion by asking for wantSections (which includes it)
// //             let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax, lc);
// //             // Token mark first N sections (never the conclusion if present)
// //             // sections = sections.map((s, i) => (kws[i] ? s.replace(/<\/p>/i, ` [ANCHOR:${kws[i]}]</p>`) : s));

// //             sections = sections.map((s, i) => (kws[i] ? s.replace(/<h1>[\s\S]*?<\/h1>[\s\S]*?<p>[\s\S]*?<\/p>/i, (block) => {
// //   // inject inside the first <p> of this section
// //   return block.replace(/<p>[\s\S]*?<\/p>/i, (p) => injectTokenMid(p, kws[i]!));
// // }) : s));


// //             let bodyHtml = sections.join("");
// //             bodyHtml = squashRepetition(bodyHtml);

// //             if (!basicValidate(bodyHtml, kws, wantSections)) {
// //               throw new Error("Basic validation failed");
// //             }

// //             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
// //             let html = applyAnchorTokens(bodyHtml, anchors);
// //             html = removeAllTokens(html);

// //             const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //             const secMap = computeSectionKeywordMap(bodyCount, kws);
// //             html = enforceSingleKeywordPerParagraph(html, kws, secMap);
// //             html = ensureNoTerminalKeyword(html, kws, lc);
// //             html = squashRepetition(html);

// //             // Additional humanization for AI-free content
// //             html = humanizeHtml(html);

// //             const item: ContentItem = {
// //               id: `${fileId}-${groupIndex}-${Date.now()}`,
// //               keyword: kws[0],
// //               keywordsUsed: kws,
// //               generatedContent: html,
// //               fileId,
// //               fileName: file.name,
// //               createdAt: new Date().toISOString(),
// //               title: result.title,
// //               targetUrl: urlMap[kws[0]] ?? null,
// //               urlMap,
// //               status: "success",
// //               prefsSnapshot: {
// //                 mood: prefs.mood,
// //                 paragraphWords: prefs.paragraphWords,
// //                 sectionCount: prefs.sectionCount,
// //                 includeConclusion: prefs.includeConclusion,
// //                 language: prefs.language,
// //                 customModeEnabled: prefs.customModeEnabled,
// //                 articleCount: prefs.articleCount,
// //                 keywordMode: prefs.keywordMode,
// //               },
// //             };
// //             bufferItems.push(item);
// //             scheduleFlush();
// //           } catch (e) {
// //             failedCount++;
// //             failedGroups.push({ index: groupIndex, grp });
// //             console.error("group generate error:", e);
// //           } finally {
// //             processedCount += 1;
// //             updateProgress(processedCount, baseGroups.length);
// //           }
// //         })().finally(() => running.delete(task));

// //         running.add(task);
// //       };

// //       // Main loop
// //       while (idx < baseGroups.length || running.size > 0) {
// //         const cur = Math.max(12, Math.min(Math.floor(concurrency), MAX));
// //         while (running.size < cur && idx < baseGroups.length) startNext();
// //         if (!running.size && idx >= baseGroups.length) break;
// //         await Promise.race(Array.from(running));

// //         // Adapt concurrency to avoid 429 bursts, but keep speed (more aggressive)
// //         if (failedCount > processedCount * 0.2 && concurrency > 12) concurrency -= 0.5;
// //         else if (concurrency < MAX && failedCount < processedCount * 0.05) concurrency += 0.5;
// //       }

// //       // Tail retry (low & polite)
// //       if (failedGroups.length) {
// //         toast.message(`Retrying ${failedGroups.length} failed item(s) at low speed…`);
// //         const again = [...failedGroups];
// //         failedGroups.length = 0;

// //         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
// //           const kws = grp.map(g => g.keyword);
// //           const urlMap: Record<string, string | null> = {};
// //           grp.forEach(g => { urlMap[g.keyword] = g.url ?? null; });

// //           const basePlan = buildPlanFromPrefs({
// //             keywords: kws,
// //             prefs: {
// //               ...prefs,
// //               sectionCount: (prefs.sectionCount as any) || 5,
// //               paragraphWords: (prefs.paragraphWords as any) || 100,
// //             },
// //             variationId: groupIndex + 1,
// //           });

// //           const res = await generateJSONTitleHtml({ 
//             keywords: kws,
//             instructions: basePlan,
//             titleLength: prefs.titleLength || 100
//           });
// //           const html0b = String(res.html || "");
// //           if (/—\s*draft\./i.test(html0b) || (html0b.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0b) < 50) {
// //             throw new Error("LLM fallback/stub on retry");
// //           }

// //           let sections = ensureH1SectionsFromAnyHtml(res.html, wantSections, paraMin, paraMax, lc);
// //         //   sections = sections.map((s, i) => (kws[i] ? s.replace(/<\/p>/i, ` [ANCHOR:${kws[i]}]</p>`) : s));
// //                     sections = sections.map((s, i) => (kws[i] ? s.replace(/<h1>[\s\S]*?<\/h1>[\s\S]*?<p>[\s\S]*?<\/p>/i, (block) => {
// //   // inject inside the first <p> of this section
// //   return block.replace(/<p>[\s\S]*?<\/p>/i, (p) => injectTokenMid(p, kws[i]!));
// // }) : s));

// //           let bodyHtml = sections.join("");
// //           bodyHtml = squashRepetition(bodyHtml);
// //           if (!basicValidate(bodyHtml, kws, wantSections)) throw new Error("Basic validation failed on retry");

// //           const anchors = Object.keys(urlMap).map(k => ({ keyword: k, url: urlMap[k] || undefined }));
// //           let html = applyAnchorTokens(bodyHtml, anchors);
// //           html = removeAllTokens(html);

// //           const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //           const secMap = computeSectionKeywordMap(bodyCount, kws);
// //           html = enforceSingleKeywordPerParagraph(html, kws, secMap);
// //           html = ensureNoTerminalKeyword(html, kws, lc);
// //           html = squashRepetition(html);

// //           // Additional humanization for AI-free content
// //           html = humanizeHtml(html);

// //           const item: ContentItem = {
// //             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
// //             keyword: kws[0],
// //             keywordsUsed: kws,
// //             generatedContent: html,
// //             fileId,
// //             fileName: file.name,
// //             createdAt: new Date().toISOString(),
// //             title: res.title,
// //             targetUrl: urlMap[kws[0]] ?? null,
// //             urlMap,
// //             status: "success",
// //             prefsSnapshot: {
// //               mood: prefs.mood,
// //               paragraphWords: prefs.paragraphWords,
// //               sectionCount: prefs.sectionCount,
// //               includeConclusion: prefs.includeConclusion,
// //               language: prefs.language,
// //               customModeEnabled: prefs.customModeEnabled,
// //               articleCount: prefs.articleCount,
// //               keywordMode: prefs.keywordMode,
// //             },
// //           };
// //           bufferItems.push(item);
// //           scheduleFlush();
// //         };

// //         const RETRY_CONCURRENCY = 4; // Increased for faster retries
// //         const queue = [...again];
// //         const running2 = new Set<Promise<void>>();

// //         const startNextRetry = () => {
// //           if (!queue.length) return;
// //           const { grp, index } = queue.shift()!;
// //           const p = (async () => {
// //             try {
// //               await runOne(grp, index);
// //             } catch (e) {
// //               console.error("retry group failed:", e);
// //             }
// //           })().finally(() => running2.delete(p));
// //           running2.add(p);
// //         };

// //         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
// //         while (running2.size || queue.length) {
// //           await Promise.race(Array.from(running2));
// //           while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
// //           await new Promise(r => setTimeout(r, 200 + Math.random() * 200)); // Reduced delay
// //         }
// //       }

// //       flushNow();
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) =>
// //           p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
// //         ));
// //       });
// //       const ok = baseGroups.length - failedCount;
// //       toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
// //       onProgress?.(100);
// //     } catch (error) {
// //       console.error("generateContent overall error:", error);
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) =>
// //           p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
// //         ));
// //       });
// //       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
// //       onProgress?.(100);
// //       throw error;
// //     } finally {
// //       flushNow();
// //       setIsProcessing(false);
// //     }
// //   };

// //   const deleteProject = (projectId: string) => {
// //     startTransition(() => {
// //       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
// //       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
// //     });
// //     toast.success("Project deleted");
// //   };

// //   const deleteAllProjects = () => {
// //     startTransition(() => {
// //       setExcelProjects([]);
// //       setContentItems([]);
// //     });
// //     toast.success("All projects cleared");
// //   };

// //   return {
// //     generateContent,
// //     isProcessing,
// //     contentItems,
// //     setContentItems,
// //     excelProjects,
// //     setExcelProjects,
// //     deleteProject,
// //     deleteAllProjects,
// //     openContentEditor,
// //   };
// // }







// // import { useState, startTransition } from "react";
// // import { toast } from "sonner";
// // import { useLocalStorage } from "@/hooks/use-local-storage";
// // import * as XLSX from "xlsx";
// // import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// // import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// // import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// // /* ═══════════════════════════════════════════════════════════════
// //    SPEED OPTIMIZED + LANGUAGE-AGNOSTIC (no humanizer)
// //    ═══════════════════════════════════════════════════════════════ */

// // const PREF_KEY = "content-preferences_v3";
// // function getFreshPrefs(): ContentPreferences {
// //   try {
// //     const raw = localStorage.getItem(PREF_KEY);
// //     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
// //   } catch { return {} as any; }
// // }

// // export interface ContentItem {
// //   id: string;
// //   keyword: string;
// //   keywordsUsed?: string[];
// //   generatedContent: string;
// //   fileId: string;
// //   fileName: string;
// //   createdAt: string;
// //   title?: string;
// //   targetUrl?: string | null;
// //   urlMap?: Record<string, string | null>;
// //   status?: "success" | "failed";
// //   prefsSnapshot?: Partial<ContentPreferences>;
// // }

// // interface ExcelProject {
// //   id: string;
// //   fileName: string;
// //   status: "pending" | "processing" | "completed" | "error";
// //   totalKeywords: number;
// //   processedKeywords: number;
// //   createdAt: string;
// //   error?: string;
// //   failedCount?: number;
// // }

// // type GenerateProgressCallback = (p: number) => void;

// // const SESSION_KEY = "open-content-item_v1";
// // export function openContentEditor(item: ContentItem) {
// //   try {
// //     try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(item)); }
// //     catch { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); }
// //     const win = window.open("/content/editor", "_blank");
// //     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
// //   } catch {
// //     try { window.location.href = "/content/editor"; } catch {}
// //   }
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    EXCEL PARSING (Keywords + URLs)
// //    ═══════════════════════════════════════════════════════════════ */

// // function norm(s: unknown) {
// //   return String(s ?? "").toLowerCase().replace(/[.\-_/]/g, " ").replace(/\s+/g, " ").trim();
// // }
// // function isLikelyUrlOrDomain(s?: string | null) {
// //   if (!s) return false;
// //   const t = String(s).trim();
// //   if (!t) return false;
// //   if (/^https?:\/\//i.test(t)) return true;
// //   if (/^www\./i.test(t)) return true;
// //   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(t) && !/\s/.test(t)) return true;
// //   return false;
// // }
// // function sanitizeKeyword(raw: unknown): string {
// //   if (raw == null) return "";
// //   let v = String(raw).replace(/\u00A0/g, " ").trim();
// //   if (!v) return "";
// //   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim();
// //   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
// //   if (/^[\d\.,\s]+$/.test(v)) return "";
// //   if (isLikelyUrlOrDomain(v)) return "";
// //   if ((v.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F]/g) || []).length < 2) return "";
// //   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
// //   if (v.length < 2 || v.length > 180) return "";
// //   return v;
// // }

// // type KeywordRow = { keyword: string; url?: string | null };
// // const KW_HEADERS = new Set(["keyword","keywords","focus keyword","search term","term","query","topic","title","key word"]);
// // const URL_HEADERS = new Set(["url","link","target url","target","target page","landing page","page url","destination","href","target link"]);

// // function detectHeaderRowAndColumns(rows: unknown[][]) {
// //   let headerRowIndex = -1;
// //   const maxCheck = Math.min(rows.length, 6);
// //   for (let i = 0; i < maxCheck; i++) {
// //     const r = rows[i];
// //     if (!Array.isArray(r)) continue;
// //     const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
// //     const mostlyText = nonEmpty.filter((c) => /[A-Za-zА-Яа-яЁё\u0900-\u097F]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
// //     if (nonEmpty.length >= 2 && mostlyText) { headerRowIndex = i; break; }
// //   }
// //   if (headerRowIndex === -1) headerRowIndex = 0;

// //   const headers = (rows[headerRowIndex] as unknown[]).map(norm);
// //   let keywordCol = -1, urlCol = -1;
// //   headers.forEach((h, idx) => {
// //     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
// //     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
// //   });

// //   if (keywordCol === -1) {
// //     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
// //     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
// //     let bestCol = -1, bestScore = 0;
// //     for (let c = 0; c < maxCols; c++) {
// //       let score = 0, checks = 0;
// //       for (const rr of lookahead) {
// //         if (!Array.isArray(rr)) continue;
// //         const s = sanitizeKeyword(rr[c]);
// //         if (s) score++;
// //         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
// //       }
// //       const weighted = score * 100 + Math.min(checks, 100);
// //       if (checks === 0) continue;
// //       if (weighted > bestScore) { bestScore = weighted; bestCol = c; }
// //     }
// //     if (bestCol !== -1) keywordCol = bestCol;
// //   }
// //   return { headerRowIndex, keywordCol: keywordCol === -1 ? null : keywordCol, urlCol: urlCol === -1 ? null : urlCol };
// // }

// // function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
// //   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
// //   if (!rows || rows.length === 0) return [];
// //   const { headerRowIndex, keywordCol, urlCol } = detectHeaderRowAndColumns(rows);
// //   const start = Math.min(rows.length - 1, headerRowIndex + 1);
// //   const dataRows = rows.slice(start);
// //   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);

// //   const out: KeywordRow[] = [];
// //   const seen = new Set<string>();

// //   for (const r of dataRows) {
// //     if (!Array.isArray(r)) continue;

// //     let k = "";
// //     if (keywordCol != null) k = sanitizeKeyword(r[keywordCol]);
// //     if (!k) {
// //       for (let c = 0; c < maxCols; c++) {
// //         const cand = sanitizeKeyword(r[c]);
// //         if (cand) { k = cand; break; }
// //       }
// //     }
// //     if (!k || seen.has(k)) continue;

// //     let url: string | null = null;
// //     if (urlCol != null) {
// //       const raw = String(r[urlCol] ?? "").trim();
// //       if (raw && isLikelyUrlOrDomain(raw)) url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
// //     }
// //     if (!url) {
// //       for (let offset = -3; offset <= 3; offset++) {
// //         if (offset === 0) continue;
// //         const idx = (keywordCol ?? 0) + offset;
// //         if (idx < 0 || idx >= maxCols) continue;
// //         const maybe = r[idx];
// //         if (!maybe) continue;
// //         const s = String(maybe).trim();
// //         if (isLikelyUrlOrDomain(s)) { url = /^https?:\/\//i.test(s) ? s : "https://" + s; break; }
// //       }
// //     }
// //     out.push({ keyword: k, url });
// //     seen.add(k);
// //   }
// //   return out;
// // }

// // function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array) {
// //   const workbook = XLSX.read(buffer, { type: "array" });
// //   const sheetNames = workbook.SheetNames ?? [];
// //   const combined: KeywordRow[] = [];
// //   const seen = new Set<string>();
// //   for (const sheetName of sheetNames) {
// //     try {
// //       const sheet = workbook.Sheets[sheetName];
// //       const ks = extractKeywordsFromWorksheetWithUrls(sheet);
// //       for (const k of ks) if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
// //       if (combined.length > 10000) break;
// //     } catch (e) {
// //       console.warn("worksheet parse failed:", sheetName, e);
// //     }
// //   }
// //   return { keywords: combined };
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    CONTENT SHAPING HELPERS (language-agnostic)
// //    ═══════════════════════════════════════════════════════════════ */

// // type LangCode = "en" | "hi" | "ru" | "es";
// // function lcOf(pref?: string): LangCode {
// //   const t = (pref || "").toLowerCase();
// //   if (t.includes("es") || t.includes("spanish") || t.includes("español")) return "es";
// //   if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
// //   if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
// //   return "en";
// // }

// // function stripTagsFast(html: string) {
// //   return (html || "")
// //     .replace(/<script[\s\S]*?<\/script>/gi, " ")
// //     .replace(/<style[\s\S]*?<\/style>/gi, " ")
// //     .replace(/<\/?[^>]+>/g, " ")
// //     .replace(/&nbsp;|&#160;/g, " ")
// //     .replace(/\s+/g, " ").trim();
// // }

// // function squashRepetition(text: string): string {
// //   let out = text.replace(/(\b([a-z\u0400-\u04ff\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
// //   out = out.replace(/(\b[^\s<>\{}]+\b(?:\s+\b[^\s<>\{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
// //   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
// //   return out;
// // }
// // function extractH1PSections(html: string) {
// //   const out: { h: string; p: string }[] = [];
// //   if (!html) return out;
// //   const cleaned = html.replace(/\bundefined\b/gi, "");
// //   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
// //   let cursor = 0;
// //   for (let i = 0; i < h1Matches.length; i++) {
// //     const h = h1Matches[i];
// //     const idx = cleaned.indexOf(h, cursor);
// //     if (idx === -1) continue;
// //     cursor = idx + h.length;
// //     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
// //     const p = pMatch ? pMatch[0] : "";
// //     if (p) { out.push({ h, p }); cursor += p.length; }
// //   }
// //   return out;
// // }
// // function nonTokenWordCount(html: string) {
// //   const noTokens = (html || "").replace(/\[ANCHOR:[^\]]+\]/g, " ");
// //   const text = noTokens
// //     .replace(/<script[\s\S]*?<\/script>/gi, " ")
// //     .replace(/<style[\s\S]*?<\/style>/gi, " ")
// //     .replace(/<\/?[^>]+>/g, " ")
// //     .replace(/&nbsp;|&#160;/g, " ")
// //     .replace(/\s+/g, " ")
// //     .trim();
// //   return text ? text.split(/\s+/).filter(w => w.length > 1).length : 0;
// // }
// // function looksLikeLLMFallback(html: string) {
// //   const hasDraftMarker = /—\s*draft\./i.test(html);
// //   const h1Count = (html.match(/<h1>/gi) || []).length;
// //   const fewWords = nonTokenWordCount(html) < 50;
// //   return hasDraftMarker || (h1Count <= 1 && fewWords);
// // }

// // /** Sentence splitter + paragraph builder (language-agnostic) */
// // function splitIntoSentences(text: string): string[] {
// //   const cleaned = text.replace(/\s+/g, " ").trim();
// //   if (!cleaned) return [];
// //   return cleaned
// //     .split(/(?<=[\.!?…।])\s+/u)
// //     .map(s => s.trim())
// //     .filter(Boolean);
// // }
// // function buildParagraphsBySentences(rawHtml: string, paraMin: number, paraMax: number): string[] {
// //   const plain = stripTagsFast(
// //     rawHtml
// //       .replace(/```[\s\S]*?```/g, " ")
// //       .replace(/\bundefined\b/gi, " ")
// //       .replace(/\[ANCHOR:[^\]]+\]/g, " ")
// //   );
// //   const sentences = splitIntoSentences(plain);
// //   if (sentences.length === 0) return [];

// //   const paras: string[] = [];
// //   let cur: string[] = [];
// //   let curCount = 0;

// //   const pushCur = () => {
// //     if (!cur.length) return;
// //     paras.push(cur.join(" ").trim());
// //     cur = [];
// //     curCount = 0;
// //   };

// //   for (const s of sentences) {
// //     const wc = s.split(/\s+/).filter(Boolean).length;
// //     if (curCount + wc <= paraMax) {
// //       cur.push(s);
// //       curCount += wc;
// //       if (curCount >= paraMin) pushCur();
// //     } else {
// //       if (curCount === 0 && wc > paraMax) {
// //         const words = s.split(/\s+/);
// //         let i = 0;
// //         while (i < words.length) {
// //           const take = Math.min(paraMax, Math.max(paraMin, paraMax - 3));
// //           const chunk = words.slice(i, i + take).join(" ");
// //           cur.push(chunk);
// //           curCount += chunk.split(/\s+/).length;
// //           pushCur();
// //           i += take;
// //         }
// //       } else {
// //         pushCur();
// //         cur.push(s);
// //         curCount = wc;
// //         if (curCount >= paraMin && curCount <= paraMax) pushCur();
// //       }
// //     }
// //   }
// //   pushCur();
// //   return paras;
// // }

// // /** New: derive declarative headings from paragraph text (neutral) */
// // function ensureH1SectionsFromAnyHtml(
// //   rawHtml: string,
// //   wantSections: number,
// //   paraMin: number,
// //   paraMax: number,
// //   _lc: LangCode
// // ) {
// //   const pairs = extractH1PSections(rawHtml);
// //   if (pairs.length >= wantSections) {
// //     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
// //   }

// //   const paras = buildParagraphsBySentences(rawHtml, paraMin, paraMax);
// //   if (paras.length === 0) throw new Error("LLM returned too little content to repair.");

// //   const makeHeadingFromPara = (txt: string, i: number) => {
// //     const clean = String(txt || "")
// //       .replace(/\[ANCHOR:[^\]]+\]/g, " ")
// //       .replace(/\s+/g, " ")
// //       .trim()
// //       .replace(/^[¿¡\s"“”'’]+/, "")
// //       .replace(/[?¿!¡"“”'’\s]+$/, "");
// //     if (!clean) return `Section ${i + 1}`;
// //     const words = clean.split(/\s+/).slice(0, 12).join(" ");
// //     const title = words.slice(0, 60).trim();
// //     return title || `Section ${i + 1}`;
// //   };

// //   const out: string[] = [];
// //   for (let i = 0; i < wantSections; i++) {
// //     const p = paras[i] ?? paras[paras.length - 1];
// //     const h = makeHeadingFromPara(p, i);
// //     out.push(`<h1>${h}</h1><p>${p}</p>`);
// //   }
// //   return out;
// // }

// // /** Insert token NOT at the end of the paragraph */
// // function injectTokenMid(pHtml: string, kw: string): string {
// //   const m = pHtml.match(/<p>([\s\S]*?)<\/p>/i);
// //   if (!m) return pHtml;
// //   const inner = m[1].trim();
// //   if (new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "i").test(inner)) {
// //     return pHtml;
// //   }
// //   const words = inner.split(/\s+/);
// //   if (words.length < 8) {
// //     const idx = Math.min(3, Math.max(1, words.length - 4));
// //     const before = words.slice(0, idx).join(" ");
// //     const after = words.slice(idx).join(" ");
// //     return `<p>${before} [ANCHOR:${kw}] ${after}</p>`;
// //   }
// //   const minIdx = Math.max(3, Math.floor(words.length * 0.5));
// //   const maxIdx = Math.min(words.length - 4, Math.ceil(words.length * 0.65));
// //   const idx = Math.max(3, Math.min(maxIdx, Math.max(minIdx, Math.floor(words.length * 0.6))));
// //   const before = words.slice(0, idx).join(" ");
// //   const after = words.slice(idx).join(" ");
// //   return `<p>${before} [ANCHOR:${kw}] ${after}</p>`;
// // }

// // function removeAllTokens(s: string) { return s.replace(/\[ANCHOR:[^\]]+\]/g, ""); }

// // function computeSectionKeywordMap(N: number, keywords: string[]) {
// //   const map: Record<number, string | null> = {};
// //   if (keywords.length === 1) { map[0] = keywords[0]; }
// //   else if (keywords.length === 2) { map[0] = keywords[0]; map[Math.min(2, N - 1)] = keywords[1]; }
// //   else if (keywords.length >= 4) { for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i]; }
// //   return map;
// // }

// // function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
// //   const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
// //   const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
// //   let idx = 0;
// //   let result = html;
// //   for (const block of blocks) {
// //     const allowed = sectionMap[idx++] || "";
// //     if (!allowed) continue;
// //     let replaced = block;

// //     for (const k of keywords) {
// //       if (k === allowed) continue;
// //       const aRe = new RegExp(`<a[^>]*>\\s*(${esc(k)})\\s*<\\/a>`, "gi");
// //       const bRe = new RegExp(`<strong>\\s*(${esc(k)})\\s*<\\/strong>`, "gi");
// //       replaced = replaced.replace(aRe, "$1").replace(bRe, "$1");
// //     }

// //     const allowedA = new RegExp(`<a[^>]*>\\s*(${esc(allowed)})\\s*<\\/a>`, "gi");
// //     let seen = 0;
// //     replaced = replaced.replace(allowedA, (_m, g1) => (++seen === 1 ? _m : g1));

// //     const allowedB = new RegExp(`<strong>\\s*(${esc(allowed)})\\s*<\\/strong>`, "gi");
// //     seen = 0;
// //     replaced = replaced.replace(allowedB, (_m, g1) => (++seen === 1 ? _m : g1));

// //     result = result.replace(block, replaced);
// //   }
// //   return result;
// // }

// // /** Neutral sanitizer: strip only inverted marks globally */
// // function sanitizePunctuationNeutral(html: string): string {
// //   if (!html) return html;
// //   return html.replace(/[¿¡]/g, "");
// // }

// // function basicValidate(html: string, keywords: string[], wantSections: number) {
// //   if (looksLikeLLMFallback(html)) return false;
// //   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //   if (blocks < wantSections - 1) return false;
// //   for (const k of keywords.slice(0, Math.min(2, keywords.length))) {
// //     if (!html.includes(k)) return false;
// //   }
// //   return true;
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    GROUPING
// //    ═══════════════════════════════════════════════════════════════ */
// // function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
// //   const groups: KeywordRow[][] = [];
// //   for (let i = 0; i < rows.length; i += size) groups.push(rows.slice(i, i + size));
// //   return groups;
// // }
// // function sampleDistinct<T>(arr: T[], size: number): T[] {
// //   if (size <= 0) return [];
// //   if (arr.length === 0) return [];
// //   if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
// //   const takenIdx = new Set<number>();
// //   let tries = 0;
// //   while (takenIdx.size < Math.min(size, arr.length) && tries < size * 8) {
// //     takenIdx.add(Math.floor(Math.random() * arr.length));
// //     tries++;
// //   }
// //   const out = Array.from(takenIdx).map(i => arr[i]);
// //   while (out.length < size) out.push(arr[Math.floor(Math.random() * arr.length)]);
// //   return out;
// // }
// // function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
// //   const groups: KeywordRow[][] = [];
// //   for (let i = 0; i < count; i++) groups.push(sampleDistinct(rows, size));
// //   return groups;
// // }

// // /* ═══════════════════════════════════════════════════════════════
// //    MAIN HOOK
// //    ═══════════════════════════════════════════════════════════════ */
// // export function useContentGeneration() {
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
// //   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

// //   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
// //     startTransition(() => {
// //       setExcelProjects((prev = []) => {
// //         const exists = prev.some((p) => p.id === proj.id);
// //         const base: ExcelProject = {
// //           id: proj.id,
// //           fileName: proj.fileName,
// //           status: (proj as any).status ?? "pending",
// //           totalKeywords: (proj as any).totalKeywords ?? 0,
// //           processedKeywords: (proj as any).processedKeywords ?? 0,
// //           createdAt: (proj as any).createdAt ?? new Date().toISOString(),
// //           error: (proj as any).error,
// //           failedCount: (proj as any).failedCount ?? 0,
// //         };
// //         if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
// //         return [...prev, base];
// //       });
// //     });
// //   };

// //   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
// //     setIsProcessing(true);
// //     onProgress?.(0);
// //     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

// //     const bufferItems: ContentItem[] = [];
// //     let scheduled = false;
// //     const BATCH_SIZE = 20;
// //     const flushNow = () => {
// //       scheduled = false;
// //       if (!bufferItems.length) return;
// //       const toWrite = bufferItems.splice(0, bufferItems.length);
// //       startTransition(() => {
// //         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
// //       });
// //     };
// //     const scheduleFlush = () => {
// //       if (bufferItems.length >= BATCH_SIZE) return flushNow();
// //       if (!scheduled) { scheduled = true; queueMicrotask(flushNow); }
// //     };

// //     let failedCount = 0;
// //     let processedCount = 0;
// //     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

// //     const updateProgress = (processed: number, total: number) => {
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
// //       });
// //       try { onProgress?.(Math.round((processed / Math.max(1, total)) * 100)); } catch {}
// //     };

// //     try {
// //       const buffer = await file.arrayBuffer();
// //       const { keywords } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
// //       if (!keywords.length) {
// //         ensureProject({ id: fileId, fileName: file.name, status: "error", error: "No valid keywords found in the uploaded Excel file" });
// //         toast.error("No valid keywords found in the uploaded Excel file.");
// //         onProgress?.(100);
// //         return;
// //       }

// //       const prefs = getFreshPrefs();
// //       const lc = lcOf(prefs.language);
// //       const size = (prefs.keywordMode ?? 1) as KeywordMode;

// //       const baseGroups = prefs.customModeEnabled
// //         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
// //         : buildGroupsNormal(keywords, size);

// //       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
// //       toast.info(`⚡ Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article • Language-agnostic mode`);

// //       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.88);
// //       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.15);
// //       const wantSections = (prefs.sectionCount || 5) + (prefs.includeConclusion ? 1 : 0);

// //       let concurrency = Math.min(Math.max(12, (navigator.hardwareConcurrency ?? 4) * 3), 24);
// //       const MAX = 96;

// //       let idx = 0;
// //       const running = new Set<Promise<void>>();

// //       const startNext = () => {
// //         if (idx >= baseGroups.length) return;
// //         const groupIndex = idx++;
// //         const grp = baseGroups[groupIndex];
// //         const kws = grp.map((g) => g.keyword);
// //         const urlMap: Record<string, string | null> = {};
// //         grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

// //         const task = (async () => {
// //           try {
// //             const basePlan = buildPlanFromPrefs({
// //               keywords: kws,
// //               prefs: {
// //                 ...prefs,
// //                 sectionCount: (prefs.sectionCount as any) || 5,
// //                 paragraphWords: (prefs.paragraphWords as any) || 100,
// //               },
// //               variationId: groupIndex + 1,
// //             });

// //             const result = await generateJSONTitleHtml({ 
//               keywords: kws,
//               instructions: basePlan,
//               titleLength: prefs.titleLength || 100
//             });

// //             const html0 = String(result.html || "");
// //             if (/—\s*draft\./i.test(html0) || (html0.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0) < 50) {
// //               throw new Error("LLM fallback/stub detected (rate-limit or non-JSON).");
// //             }

// //             let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax, lc);
// //             sections = sections.map((s, i) => (kws[i] ? s.replace(/<h1>[\s\S]*?<\/h1>[\s\S]*?<p>[\s\S]*?<\/p>/i, (block) => {
// //               return block.replace(/<p>[\s\S]*?<\/p>/i, (p) => injectTokenMid(p, kws[i]!));
// //             }) : s));

// //             let bodyHtml = sections.join("");
// //             bodyHtml = squashRepetition(bodyHtml);

// //             if (!basicValidate(bodyHtml, kws, wantSections)) {
// //               throw new Error("Basic validation failed");
// //             }

// //             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
// //             let html = applyAnchorTokens(bodyHtml, anchors);
// //             html = removeAllTokens(html);

// //             const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //             const secMap = computeSectionKeywordMap(bodyCount, kws);
// //             html = enforceSingleKeywordPerParagraph(html, kws, secMap);
// //             html = squashRepetition(html);
// //             html = sanitizePunctuationNeutral(html);

// //             const item: ContentItem = {
// //               id: `${fileId}-${groupIndex}-${Date.now()}`,
// //               keyword: kws[0],
// //               keywordsUsed: kws,
// //               generatedContent: html,
// //               fileId,
// //               fileName: file.name,
// //               createdAt: new Date().toISOString(),
// //               title: result.title,
// //               targetUrl: urlMap[kws[0]] ?? null,
// //               urlMap,
// //               status: "success",
// //               prefsSnapshot: {
// //                 mood: prefs.mood,
// //                 paragraphWords: prefs.paragraphWords,
// //                 sectionCount: prefs.sectionCount,
// //                 includeConclusion: prefs.includeConclusion,
// //                 language: prefs.language,
// //                 customModeEnabled: prefs.customModeEnabled,
// //                 articleCount: prefs.articleCount,
// //                 keywordMode: prefs.keywordMode,
// //               },
// //             };
// //             bufferItems.push(item);
// //             scheduleFlush();
// //           } catch (e) {
// //             failedCount++;
// //             failedGroups.push({ index: groupIndex, grp });
// //             console.error("group generate error:", e);
// //           } finally {
// //             processedCount += 1;
// //             updateProgress(processedCount, baseGroups.length);
// //           }
// //         })().finally(() => running.delete(task));

// //         running.add(task);
// //       };

// //       while (idx < baseGroups.length || running.size > 0) {
// //         const cur = Math.max(12, Math.min(Math.floor(concurrency), MAX));
// //         while (running.size < cur && idx < baseGroups.length) startNext();
// //         if (!running.size && idx >= baseGroups.length) break;
// //         await Promise.race(Array.from(running));

// //         if (failedCount > processedCount * 0.2 && concurrency > 12) concurrency -= 0.5;
// //         else if (concurrency < MAX && failedCount < processedCount * 0.05) concurrency += 0.5;
// //       }

// //       if (failedGroups.length) {
// //         toast.message(`Retrying ${failedGroups.length} failed item(s) at low speed…`);
// //         const again = [...failedGroups];
// //         failedGroups.length = 0;

// //         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
// //           const kws = grp.map(g => g.keyword);
// //           const urlMap: Record<string, string | null> = {};
// //           grp.forEach(g => { urlMap[g.keyword] = g.url ?? null; });

// //           const basePlan = buildPlanFromPrefs({
// //             keywords: kws,
// //             prefs: {
// //               ...prefs,
// //               sectionCount: (prefs.sectionCount as any) || 5,
// //               paragraphWords: (prefs.paragraphWords as any) || 100,
// //             },
// //             variationId: groupIndex + 1,
// //           });

// //           const res = await generateJSONTitleHtml({ 
//             keywords: kws,
//             instructions: basePlan,
//             titleLength: prefs.titleLength || 100
//           });
// //           const html0b = String(res.html || "");
// //           if (/—\s*draft\./i.test(html0b) || (html0b.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0b) < 50) {
// //             throw new Error("LLM fallback/stub on retry");
// //           }

// //           let sections = ensureH1SectionsFromAnyHtml(res.html, wantSections, paraMin, paraMax, lc);
// //           sections = sections.map((s, i) => (kws[i] ? s.replace(/<h1>[\s\S]*?<\/h1>[\s\S]*?<p>[\s\S]*?<\/p>/i, (block) => {
// //             return block.replace(/<p>[\s\S]*?<\/p>/i, (p) => injectTokenMid(p, kws[i]!));
// //           }) : s));

// //           let bodyHtml = sections.join("");
// //           bodyHtml = squashRepetition(bodyHtml);
// //           if (!basicValidate(bodyHtml, kws, wantSections)) throw new Error("Basic validation failed on retry");

// //           const anchors = Object.keys(urlMap).map(k => ({ keyword: k, url: urlMap[k] || undefined }));
// //           let html = applyAnchorTokens(bodyHtml, anchors);
// //           html = removeAllTokens(html);

// //           const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
// //           const secMap = computeSectionKeywordMap(bodyCount, kws);
// //           html = enforceSingleKeywordPerParagraph(html, kws, secMap);
// //           html = squashRepetition(html);
// //           html = sanitizePunctuationNeutral(html);

// //           const item: ContentItem = {
// //             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
// //             keyword: kws[0],
// //             keywordsUsed: kws,
// //             generatedContent: html,
// //             fileId,
// //             fileName: file.name,
// //             createdAt: new Date().toISOString(),
// //             title: res.title,
// //             targetUrl: urlMap[kws[0]] ?? null,
// //             urlMap,
// //             status: "success",
// //             prefsSnapshot: {
// //               mood: prefs.mood,
// //               paragraphWords: prefs.paragraphWords,
// //               sectionCount: prefs.sectionCount,
// //               includeConclusion: prefs.includeConclusion,
// //               language: prefs.language,
// //               customModeEnabled: prefs.customModeEnabled,
// //               articleCount: prefs.articleCount,
// //               keywordMode: prefs.keywordMode,
// //             },
// //           };
// //           bufferItems.push(item);
// //           scheduleFlush();
// //         };

// //         const RETRY_CONCURRENCY = 4;
// //         const queue = [...again];
// //         const running2 = new Set<Promise<void>>();

// //         const startNextRetry = () => {
// //           if (!queue.length) return;
// //           const { grp, index } = queue.shift()!;
// //           const p = (async () => {
// //             try {
// //               await runOne(grp, index);
// //             } catch (e) {
// //               console.error("retry group failed:", e);
// //             }
// //           })().finally(() => running2.delete(p));
// //           running2.add(p);
// //         };

// //         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
// //         while (running2.size || queue.length) {
// //           await Promise.race(Array.from(running2));
// //           while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
// //           await new Promise(r => setTimeout(r, 200 + Math.random() * 200));
// //         }
// //       }

// //       flushNow();
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) =>
// //           p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
// //         ));
// //       });
// //       const ok = baseGroups.length - failedCount;
// //       toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
// //       onProgress?.(100);
// //     } catch (error) {
// //       console.error("generateContent overall error:", error);
// //       startTransition(() => {
// //         setExcelProjects((prev) => (prev ?? []).map((p) =>
// //           p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
// //         ));
// //       });
// //       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
// //       onProgress?.(100);
// //       throw error;
// //     } finally {
// //       flushNow();
// //       setIsProcessing(false);
// //     }
// //   };

// //   const deleteProject = (projectId: string) => {
// //     startTransition(() => {
// //       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
// //       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
// //     });
// //     toast.success("Project deleted");
// //   };

// //   const deleteAllProjects = () => {
// //     startTransition(() => {
// //       setExcelProjects([]);
// //       setContentItems([]);
// //     });
// //     toast.success("All projects cleared");
// //   };

// //   return {
// //     generateContent,
// //     isProcessing,
// //     contentItems,
// //     setContentItems,
// //     excelProjects,
// //     setExcelProjects,
// //     deleteProject,
// //     deleteAllProjects,
// //     openContentEditor,
// //   };
// // }





// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /* ═══════════════════════════════════════════════════════════════
//    SPEED OPTIMIZED + HUMANIZED (no extra '?' or '!')
//    ═══════════════════════════════════════════════════════════════ */

// const PREF_KEY = "content-preferences_v3";
// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
//     // Merge with defaults to ensure new fields exist (backward compatibility)
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       sectionCount: 5,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       ...parsed,
//     };
//   } catch { 
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       sectionCount: 5,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//     };
//   }
// }

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (p: number) => void;

// const SESSION_KEY = "open-content-item_v1";
// export function openContentEditor(item: ContentItem) {
//   try {
//     try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(item)); }
//     catch { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); }
//     const win = window.open("/content/editor", "_blank");
//     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
//   } catch {
//     try { window.location.href = "/content/editor"; } catch {}
//   }
// }

// /* ═══════════════════════════════════════════════════════════════
//    EXCEL PARSING (Keywords + URLs)
//    ═══════════════════════════════════════════════════════════════ */

// function norm(s: unknown) {
//   return String(s ?? "").toLowerCase().replace(/[.\-_/]/g, " ").replace(/\s+/g, " ").trim();
// }
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
//   if ((v.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F\u0900-\u097F]/g) || []).length < 2) return "";
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2 || v.length > 180) return "";
//   return v;
// }

// type KeywordRow = { keyword: string; url?: string | null };
// const KW_HEADERS = new Set(["keyword","keywords","focus keyword","search term","term","query","topic","title","key word"]);
// const URL_HEADERS = new Set(["url","link","target url","target","target page","landing page","page url","destination","href","target link"]);

// function detectHeaderRowAndColumns(rows: unknown[][]) {
//   let headerRowIndex = -1;
//   const maxCheck = Math.min(rows.length, 6);
//   for (let i = 0; i < maxCheck; i++) {
//     const r = rows[i];
//     if (!Array.isArray(r)) continue;
//     const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
//     const mostlyText = nonEmpty.filter((c) => /[A-Za-zА-Яа-яЁё\u0900-\u097F]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
//     if (nonEmpty.length >= 2 && mostlyText) { headerRowIndex = i; break; }
//   }
//   if (headerRowIndex === -1) headerRowIndex = 0;

//   const headers = (rows[headerRowIndex] as unknown[]).map(norm);
//   let keywordCol = -1, urlCol = -1;
//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//     let bestCol = -1, bestScore = 0;
//     for (let c = 0; c < maxCols; c++) {
//       let score = 0, checks = 0;
//       for (const rr of lookahead) {
//         if (!Array.isArray(rr)) continue;
//         const s = sanitizeKeyword(rr[c]);
//         if (s) { score++; }
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       const weighted = score * 100 + Math.min(checks, 100);
//       if (checks === 0) continue;
//       if (weighted > bestScore) { bestScore = weighted; bestCol = c; }
//     }
//     if (bestCol !== -1) keywordCol = bestCol;
//   }
//   return { headerRowIndex, keywordCol: keywordCol === -1 ? null : keywordCol, urlCol: urlCol === -1 ? null : urlCol };
// }

// function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];
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
//         if (cand) { k = cand; break; }
//       }
//     }
//     if (!k || seen.has(k)) continue;

//     let url: string | null = null;
//     if (urlCol != null) {
//       const raw = String(r[urlCol] ?? "").trim();
//       if (raw && isLikelyUrlOrDomain(raw)) url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
//     }
//     if (!url) {
//       for (let offset = -3; offset <= 3; offset++) {
//         if (offset === 0) continue;
//         const idx = (keywordCol ?? 0) + offset;
//         if (idx < 0 || idx >= maxCols) continue;
//         const maybe = r[idx];
//         if (!maybe) continue;
//         const s = String(maybe).trim();
//         if (isLikelyUrlOrDomain(s)) { url = /^https?:\/\//i.test(s) ? s : "https://" + s; break; }
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
//       for (const k of ks) if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
//       if (combined.length > 10000) break;
//     } catch (e) {
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }
//   return { keywords: combined };
// }

// /* ═══════════════════════════════════════════════════════════════
//    CONTENT SHAPING HELPERS (language-agnostic)
//    ═══════════════════════════════════════════════════════════════ */

// type LangCode = "en" | "hi" | "ru" | "es";
// function lcOf(pref?: string): LangCode {
//   const t = (pref || "").toLowerCase();
//   if (t.includes("es") || t.includes("spanish") || t.includes("español")) return "es";
//   if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
//   if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
//   return "en";
// }

// function stripTagsFast(html: string) {
//   return (html || "")
//     .replace(/<script[\s\S]*?<\/script>/gi, " ")
//     .replace(/<style[\s\S]*?<\/style>/gi, " ")
//     .replace(/<\/?[^>]+>/g, " ")
//     .replace(/&nbsp;|&#160;/g, " ")
//     .replace(/\s+/g, " ").trim();
// }

// function squashRepetition(text: string): string {
//   let out = text.replace(/(\b([a-z\u0400-\u04ff\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
//   out = out.replace(/(\b[^\s<>\{}]+\b(?:\s+\b[^\s<>\{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
//   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
//   return out;
// }
// function extractH2PSections(html: string) {
//   const out: { h: string; p: string }[] = [];
//   if (!html) return out;
//   const cleaned = html.replace(/\bundefined\b/gi, "");
//   const h2Matches = cleaned.match(/<h2>[\s\S]*?<\/h2>/gi) || [];
//   let cursor = 0;
//   for (let i = 0; i < h2Matches.length; i++) {
//     const h = h2Matches[i];
//     const idx = cleaned.indexOf(h, cursor);
//     if (idx === -1) continue;
//     cursor = idx + h.length;
//     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
//     const p = pMatch ? pMatch[0] : "";
//     if (p) { out.push({ h, p }); cursor += p.length; }
//   }
//   return out;
// }
// function nonTokenWordCount(html: string) {
//   const noTokens = (html || "").replace(/\[ANCHOR:[^\]]+\]/g, " ");
//   const text = noTokens
//     .replace(/<script[\s\S]*?<\/script>/gi, " ")
//     .replace(/<style[\s\S]*?<\/style>/gi, " ")
//     .replace(/<\/?[^>]+>/g, " ")
//     .replace(/&nbsp;|&#160;/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
//   return text ? text.split(/\s+/).filter(w => w.length > 1).length : 0;
// }
// // Removed: looksLikeLLMFallback - replaced with inline checks for speed optimization

// /** Sentence splitter + paragraph builder (language-agnostic) */
// function splitIntoSentences(text: string): string[] {
//   const cleaned = text.replace(/\s+/g, " ").trim();
//   if (!cleaned) return [];
//   return cleaned
//     .split(/(?<=[\.!?…।])\s+/u)
//     .map(s => s.trim())
//     .filter(Boolean);
// }
// function buildParagraphsBySentences(rawHtml: string, paraMin: number, paraMax: number): string[] {
//   const plain = stripTagsFast(
//     rawHtml
//       .replace(/```[\s\S]*?```/g, " ")
//       .replace(/\bundefined\b/gi, " ")
//       .replace(/\[ANCHOR:[^\]]+\]/g, " ")
//   );
//   const sentences = splitIntoSentences(plain);
//   if (sentences.length === 0) return [];

//   const paras: string[] = [];
//   let cur: string[] = [];
//   let curCount = 0;

//   const pushCur = () => {
//     if (!cur.length) return;
//     paras.push(cur.join(" ").trim());
//     cur = [];
//     curCount = 0;
//   };

//   for (const s of sentences) {
//     const wc = s.split(/\s+/).filter(Boolean).length;
//     if (curCount + wc <= paraMax) {
//       cur.push(s);
//       curCount += wc;
//       if (curCount >= paraMin) pushCur();
//     } else {
//       if (curCount === 0 && wc > paraMax) {
//         const words = s.split(/\s+/);
//         let i = 0;
//         while (i < words.length) {
//           const take = Math.min(paraMax, Math.max(paraMin, paraMax - 3));
//           const chunk = words.slice(i, i + take).join(" ");
//           cur.push(chunk);
//           curCount += chunk.split(/\s+/).length;
//           pushCur();
//           i += take;
//         }
//       } else {
//         pushCur();
//         cur.push(s);
//         curCount = wc;
//         if (curCount >= paraMin && curCount <= paraMax) pushCur();
//       }
//     }
//   }
//   pushCur();
//   return paras;
// }

// /** New: derive declarative headings from paragraph text (neutral) */
// function ensureH2SectionsFromAnyHtml(
//   rawHtml: string,
//   wantSections: number,
//   paraMin: number,
//   paraMax: number,
//   _lc: LangCode
// ) {
//   const pairs = extractH2PSections(rawHtml);
//   if (pairs.length >= wantSections) {
//     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
//   }

//   const paras = buildParagraphsBySentences(rawHtml, paraMin, paraMax);
//   if (paras.length === 0) throw new Error("LLM returned too little content to repair.");

//   const makeHeadingFromPara = (txt: string, i: number) => {
//     const clean = String(txt || "")
//       .replace(/\[ANCHOR:[^\]]+\]/g, " ")
//       .replace(/\s+/g, " ")
//       .trim()
//       .replace(/^[¿¡\s"“”'’]+/, "")
//       .replace(/[?¿!¡"“”'’\s]+$/, "");
//     if (!clean) return `Section ${i + 1}`;
//     const words = clean.split(/\s+/).slice(0, 12).join(" ");
//     const title = words.slice(0, 120).trim();
//     // Ensure no question/exclamation in heading
//     const safe = title.replace(/[?¡¿!]+/g, "").trim();
//     return safe || `Section ${i + 1}`;
//   };

//   const out: string[] = [];
//   for (let i = 0; i < wantSections; i++) {
//     const p = paras[i] ?? paras[paras.length - 1];
//     const h = makeHeadingFromPara(p, i);
//     out.push(`<h2>${h}</h2><p>${p}</p>`);
//   }
//   return out;
// }

// /** Insert token NOT at the end of the paragraph */
// function injectTokenMid(pHtml: string, kw: string): string {
//   const m = pHtml.match(/<p>([\s\S]*?)<\/p>/i);
//   if (!m) return pHtml;
//   const inner = m[1].trim();
//   if (new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "i").test(inner)) {
//     return pHtml;
//   }
//   const words = inner.split(/\s+/);
//   if (words.length < 8) {
//     const idx = Math.min(3, Math.max(1, words.length - 4));
//     const before = words.slice(0, idx).join(" ");
//     const after = words.slice(idx).join(" ");
//     return `<p>${before} [ANCHOR:${kw}] ${after}</p>`;
//   }
//   const minIdx = Math.max(3, Math.floor(words.length * 0.5));
//   const maxIdx = Math.min(words.length - 4, Math.ceil(words.length * 0.65));
//   const idx = Math.max(3, Math.min(maxIdx, Math.max(minIdx, Math.floor(words.length * 0.6))));
//   const before = words.slice(0, idx).join(" ");
//   const after = words.slice(idx).join(" ");
//   return `<p>${before} [ANCHOR:${kw}] ${after}</p>`;
// }

// function removeAllTokens(s: string) { return s.replace(/\[ANCHOR:[^\]]+\]/g, ""); }

// function computeSectionKeywordMap(N: number, keywords: string[]) {
//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) { map[0] = keywords[0]; }
//   else if (keywords.length === 2) { map[0] = keywords[0]; map[Math.min(2, N - 1)] = keywords[1]; }
//   else if (keywords.length >= 4) { for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i]; }
//   return map;
// }

// function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
//   const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
//   const blocks = html.match(/<h2>[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>/gi) || [];
//   let idx = 0;
//   let result = html;
//   for (const block of blocks) {
//     const allowed = sectionMap[idx++] || "";
//     if (!allowed) continue;
//     let replaced = block;

//     for (const k of keywords) {
//       if (k === allowed) continue;
//       const aRe = new RegExp(`<a[^>]*>\\s*(${esc(k)})\\s*<\\/a>`, "gi");
//       const bRe = new RegExp(`<strong>\\s*(${esc(k)})\\s*<\\/strong>`, "gi");
//       replaced = replaced.replace(aRe, "$1").replace(bRe, "$1");
//     }

//     const allowedA = new RegExp(`<a[^>]*>\\s*(${esc(allowed)})\\s*<\\/a>`, "gi");
//     let seen = 0;
//     replaced = replaced.replace(allowedA, (_m, g1) => (++seen === 1 ? _m : g1));

//     const allowedB = new RegExp(`<strong>\\s*(${esc(allowed)})\\s*<\\/strong>`, "gi");
//     seen = 0;
//     replaced = replaced.replace(allowedB, (_m, g1) => (++seen === 1 ? _m : g1));

//     result = result.replace(block, replaced);
//   }
//   return result;
// }

// /** Neutral sanitizer: strip inverted marks and collapse loud punctuation */
// function sanitizePunctuationNeutral(html: string): string {
//   if (!html) return html;
//   // remove inverted punctuation
//   let out = html.replace(/[¿¡]/g, "");
//   // replace sequences of exclamation marks with a period (avoid '!' in final content)
//   out = out.replace(/!{1,}/g, ".");
//   // collapse multiple question marks to a single question mark
//   out = out.replace(/\?{2,}/g, "?");
//   // replace combined ?! or !? with a single period
//   out = out.replace(/(\?\!|\!\?)/g, ".");
//   // remove trailing punctuation clusters before closing tags
//   out = out.replace(/([^\w>]){2,}(<\/p>|<\/h2>)/g, `$2`);
//   return out;
// }

// // Removed: basicValidate - replaced with lighter inline validation for speed optimization

// /* ═══════════════════════════════════════════════════════════════
//    GROUPING
//    ═══════════════════════════════════════════════════════════════ */
// function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) groups.push(rows.slice(i, i + size));
//   return groups;
// }
// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0) return [];
//   if (arr.length === 0) return [];
//   if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
//   const takenIdx = new Set<number>();
//   let tries = 0;
//   while (takenIdx.size < Math.min(size, arr.length) && tries < size * 8) {
//     takenIdx.add(Math.floor(Math.random() * arr.length));
//     tries++;
//   }
//   const out = Array.from(takenIdx).map(i => arr[i]);
//   while (out.length < size) out.push(arr[Math.floor(Math.random() * arr.length)]);
//   return out;
// }
// function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) groups.push(sampleDistinct(rows, size));
//   return groups;
// }

// /* ═══════════════════════════════════════════════════════════════
//    MAIN HOOK
//    ═══════════════════════════════════════════════════════════════ */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status: (proj as any).status ?? "pending",
//           totalKeywords: (proj as any).totalKeywords ?? 0,
//           processedKeywords: (proj as any).processedKeywords ?? 0,
//           createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount: (proj as any).failedCount ?? 0,
//         };
//         if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//         return [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 100; // Increased to 100 for ultra-fast batching
//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       startTransition(() => {
//         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//       });
//     };
//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) return flushNow();
//       if (!scheduled) { scheduled = true; queueMicrotask(flushNow); }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
//       });
//       try { onProgress?.(Math.round((processed / Math.max(1, total)) * 100)); } catch {}
//     };

//     try {
//       const buffer = await file.arrayBuffer();
//       const { keywords } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
//       if (!keywords.length) {
//         ensureProject({ id: fileId, fileName: file.name, status: "error", error: "No valid keywords found in the uploaded Excel file" });
//         toast.error("No valid keywords found in the uploaded Excel file.");
//         onProgress?.(100);
//         return;
//       }

//       const prefs = getFreshPrefs();
//       const lc = lcOf(prefs.language);
//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
//         : buildGroupsNormal(keywords, size);

//       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
//       toast.info(`⚡⚡ Ultra Turbo Mode: Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article • Maximum speed`);

//       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.88);
//       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.15);
//       const wantSections = (prefs.sectionCount || 5) + (prefs.includeConclusion ? 1 : 0);

//       // 🚀 Ultra Turbo Mode: Maximum concurrency, aggressive scaling
//       const cores = navigator.hardwareConcurrency ?? 4;
//       let concurrency = Math.min(Math.max(48, cores * 6), 96); // Start much higher: 48-96
//       const MAX = 192; // Increased from 128 to 192 for maximum speed

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length) return;
//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];
//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

//         const task = (async () => {
//           try {
//             const basePlan = buildPlanFromPrefs({
//               keywords: kws,
//               prefs: {
//                 ...prefs,
//                 sectionCount: (prefs.sectionCount as any) || 5,
//                 paragraphWords: (prefs.paragraphWords as any) || 100,
//               },
//               variationId: groupIndex + 1,
//             });

//             const result = await generateJSONTitleHtml({ 
//               keywords: kws, 
//               instructions: basePlan,
//               titleLength: prefs.titleLength || 100
//             });

//             const html0 = String(result.html || "");
//             if (/—\s*draft\./i.test(html0) || (html0.match(/<h2>/gi) || []).length <= 1 || nonTokenWordCount(html0) < 50) {
//               throw new Error("LLM fallback/stub detected (rate-limit or non-JSON).");
//             }

//             // 🚀 Ultra-optimized: Pre-compute regex, combine operations, skip redundant passes
//             const h2pRegex = /<h2>[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>/gi;
//             const h2Regex = /<h2>/gi;
//             let sections = ensureH2SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax, lc);
//             sections = sections.map((s, i) => (kws[i] ? s.replace(h2pRegex, (block) => {
//               return block.replace(/<p>[\s\S]*?<\/p>/i, (p) => injectTokenMid(p, kws[i]!));
//             }) : s));

//             let bodyHtml = sections.join("");
//             // 🚀 Single pass: combine squashRepetition with validation
//             const h2Count = (bodyHtml.match(h2Regex) || []).length;
//             if (h2Count < wantSections - 1 || !kws.some(k => bodyHtml.includes(k))) {
//               throw new Error("Basic validation failed");
//             }
            
//             bodyHtml = squashRepetition(bodyHtml); // Only squash once before processing

//             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//             let html = applyAnchorTokens(bodyHtml, anchors);
//             html = removeAllTokens(html);

//             const bodyCount = (bodyHtml.match(h2pRegex) || []).length;
//             const secMap = computeSectionKeywordMap(bodyCount, kws);
//             html = enforceSingleKeywordPerParagraph(html, kws, secMap);
//             // 🚀 Combine final operations: squash + sanitize in one pass
//             html = sanitizePunctuationNeutral(squashRepetition(html));

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: html,
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
//                 sectionCount: prefs.sectionCount,
//                 includeConclusion: prefs.includeConclusion,
//                 language: prefs.language,
//                 customModeEnabled: prefs.customModeEnabled,
//                 articleCount: prefs.articleCount,
//                 keywordMode: prefs.keywordMode,
//               },
//             };
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             failedGroups.push({ index: groupIndex, grp });
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(48, Math.min(Math.floor(concurrency), MAX)); // Start from 48 for ultra speed
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;
//         await Promise.race(Array.from(running));

//         // 🚀 Ultra aggressive concurrency adaptation for maximum speed
//         if (failedCount > processedCount * 0.3 && concurrency > 48) concurrency -= 0.2; // Minimal backoff
//         else if (concurrency < MAX && failedCount < processedCount * 0.1) concurrency += 1.2; // Very aggressive ramp-up
//       }

//       if (failedGroups.length) {
//         toast.message(`Retrying ${failedGroups.length} failed item(s) at low speed…`);
//         const again = [...failedGroups];
//         failedGroups.length = 0;

//         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
//           const kws = grp.map(g => g.keyword);
//           const urlMap: Record<string, string | null> = {};
//           grp.forEach(g => { urlMap[g.keyword] = g.url ?? null; });

//           const basePlan = buildPlanFromPrefs({
//             keywords: kws,
//             prefs: {
//               ...prefs,
//               sectionCount: (prefs.sectionCount as any) || 5,
//               paragraphWords: (prefs.paragraphWords as any) || 100,
//             },
//             variationId: groupIndex + 1,
//           });

//           const res = await generateJSONTitleHtml({ 
//             keywords: kws, 
//             instructions: basePlan,
//             titleLength: prefs.titleLength || 100
//           });
//           const html0b = String(res.html || "");
//           if (/—\s*draft\./i.test(html0b) || (html0b.match(/<h2>/gi) || []).length <= 1 || nonTokenWordCount(html0b) < 50) {
//             throw new Error("LLM fallback/stub on retry");
//           }

//           // 🚀 Ultra-optimized retry: Same optimizations as main path
//           const h2pRegex = /<h2>[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>/gi;
//           const h2Regex = /<h2>/gi;
//           let sections = ensureH2SectionsFromAnyHtml(res.html, wantSections, paraMin, paraMax, lc);
//           sections = sections.map((s, i) => (kws[i] ? s.replace(h2pRegex, (block) => {
//             return block.replace(/<p>[\s\S]*?<\/p>/i, (p) => injectTokenMid(p, kws[i]!));
//           }) : s));

//           let bodyHtml = sections.join("");
//           // Single pass: combine validation with squash
//           const h2Count = (bodyHtml.match(h2Regex) || []).length;
//           if (h2Count < wantSections - 1 || !kws.some(k => bodyHtml.includes(k))) {
//             throw new Error("Basic validation failed on retry");
//           }
//           bodyHtml = squashRepetition(bodyHtml);

//           const anchors = Object.keys(urlMap).map(k => ({ keyword: k, url: urlMap[k] || undefined }));
//           let html = applyAnchorTokens(bodyHtml, anchors);
//           html = removeAllTokens(html);

//           const bodyCount = (bodyHtml.match(h2pRegex) || []).length;
//           const secMap = computeSectionKeywordMap(bodyCount, kws);
//           html = enforceSingleKeywordPerParagraph(html, kws, secMap);
//           // Combine final operations
//           html = sanitizePunctuationNeutral(squashRepetition(html));

//           const item: ContentItem = {
//             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
//             keyword: kws[0],
//             keywordsUsed: kws,
//             generatedContent: html,
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
//               sectionCount: prefs.sectionCount,
//               includeConclusion: prefs.includeConclusion,
//               language: prefs.language,
//               customModeEnabled: prefs.customModeEnabled,
//               articleCount: prefs.articleCount,
//               keywordMode: prefs.keywordMode,
//             },
//           };
//           bufferItems.push(item);
//           scheduleFlush();
//         };

//         // 🚀 Ultra-fast retries: Maximum concurrency, minimal delays
//         const RETRY_CONCURRENCY = 16; // Increased from 8 to 16 for ultra-fast retries
//         const queue = [...again];
//         const running2 = new Set<Promise<void>>();

//         const startNextRetry = () => {
//           if (!queue.length) return;
//           const { grp, index } = queue.shift()!;
//           const p = (async () => {
//             try {
//               await runOne(grp, index);
//             } catch (e) {
//               console.error("retry group failed:", e);
//             }
//           })().finally(() => running2.delete(p));
//           running2.add(p);
//         };

//         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//         while (running2.size || queue.length) {
//           await Promise.race(Array.from(running2));
//           while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//           // Ultra-minimal delay: 50-100ms for maximum speed
//           await new Promise(r => setTimeout(r, 50 + Math.random() * 50));
//         }
//       }

//       flushNow();
//       startTransition(() => {
//         setExcelProjects((prev) => (prev ?? []).map((p) =>
//           p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
//         ));
//       });
//       const ok = baseGroups.length - failedCount;
//       toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       startTransition(() => {
//         setExcelProjects((prev) => (prev ?? []).map((p) =>
//           p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
//         ));
//       });
//       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
//       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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





// // src/hooks/use-content-generation.ts
// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Utilities
//  * ──────────────────────────────────────────────────────────── */
// const PREF_KEY = "content-preferences_v3";

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       sectionCount: 5,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       ...parsed,
//     };
//   } catch {
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       sectionCount: 5,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//     };
//   }
// }

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (p: number) => void;

// const SESSION_KEY = "open-content-item_v1";
// export function openContentEditor(item: ContentItem) {
//   try {
//     try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(item)); }
//     catch { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); }
//     const win = window.open("/content/editor", "_blank");
//     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
//   } catch {
//     try { window.location.href = "/content/editor"; } catch {}
//   }
// }

// /** ────────────────────────────────────────────────────────────
//  * Excel parsing (keywords + optional URLs)
//  * ──────────────────────────────────────────────────────────── */
// function norm(s: unknown) {
//   return String(s ?? "").toLowerCase().replace(/[.\-_/]/g, " ").replace(/\s+/g, " ").trim();
// }
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
//   // accept multiscript (Devanagari, Cyrillic, Latin, etc.)
//   if ((v.match(/[\p{L}\p{N}]/gu) || []).length < 2) return "";
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2 || v.length > 180) return "";
//   return v;
// }

// type KeywordRow = { keyword: string; url?: string | null };
// const KW_HEADERS = new Set(["keyword","keywords","focus keyword","search term","term","query","topic","title","key word"]);
// const URL_HEADERS = new Set(["url","link","target url","target","target page","landing page","page url","destination","href","target link"]);

// function detectHeaderRowAndColumns(rows: unknown[][]) {
//   let headerRowIndex = -1;
//   const maxCheck = Math.min(rows.length, 6);
//   for (let i = 0; i < maxCheck; i++) {
//     const r = rows[i];
//     if (!Array.isArray(r)) continue;
//     const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
//     if (nonEmpty.length >= 2) { headerRowIndex = i; break; }
//   }
//   if (headerRowIndex === -1) headerRowIndex = 0;

//   const headers = (rows[headerRowIndex] as unknown[]).map(norm);
//   let keywordCol = -1, urlCol = -1;
//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//     let bestCol = -1, bestScore = 0;
//     for (let c = 0; c < maxCols; c++) {
//       let score = 0, checks = 0;
//       for (const rr of lookahead) {
//         if (!Array.isArray(rr)) continue;
//         const s = sanitizeKeyword(rr[c]);
//         if (s) { score++; }
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       const weighted = score * 100 + Math.min(checks, 100);
//       if (checks === 0) continue;
//       if (weighted > bestScore) { bestScore = weighted; bestCol = c; }
//     }
//     if (bestCol !== -1) keywordCol = bestCol;
//   }
//   return { headerRowIndex, keywordCol: keywordCol === -1 ? null : keywordCol, urlCol: urlCol === -1 ? null : urlCol };
// }

// function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];
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
//         if (cand) { k = cand; break; }
//       }
//     }
//     if (!k || seen.has(k)) continue;

//     let url: string | null = null;
//     if (urlCol != null) {
//       const raw = String(r[urlCol] ?? "").trim();
//       if (raw && isLikelyUrlOrDomain(raw)) url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
//     }
//     if (!url) {
//       for (let offset = -3; offset <= 3; offset++) {
//         if (offset === 0) continue;
//         const idx = (keywordCol ?? 0) + offset;
//         if (idx < 0 || idx >= maxCols) continue;
//         const maybe = r[idx];
//         if (!maybe) continue;
//         const s = String(maybe).trim();
//         if (isLikelyUrlOrDomain(s)) { url = /^https?:\/\//i.test(s) ? s : "https://" + s; break; }
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
//       for (const k of ks) if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
//       if (combined.length > 10000) break;
//     } catch (e) {
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }
//   return { keywords: combined };
// }

// /** ────────────────────────────────────────────────────────────
//  * HTML helpers
//  * ──────────────────────────────────────────────────────────── */
// function countH2PBlocks(html: string) {
//   const blocks = html.match(/<h2>[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>/gi) || [];
//   return blocks.length;
// }

// function injectTokenIntoNthSection(html: string, sectionIndexZero: number, token: string) {
//   // Replace first <p> after the Nth <h2> with injected token (mid-paragraph)
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   let idx = -1;
//   let lastEnd = 0;
//   const pieces: string[] = [];
//   while ((match = h2Regex.exec(html)) !== null) {
//     pieces.push(html.slice(lastEnd, match.index));
//     const h2 = match[0];
//     pieces.push(h2);
//     lastEnd = match.index + h2.length;
//     idx++;
//     if (idx === sectionIndexZero) {
//       // find first <p> after this h2
//       const after = html.slice(lastEnd);
//       const p = after.match(/<p>[\s\S]*?<\/p>/i);
//       if (p) {
//         const pText = p[0];
//         const inner = pText.replace(/^<p>|<\/p>$/gi, "");
//         const words = inner.trim().split(/\s+/);
//         let insertAt = Math.max(3, Math.floor(words.length * 0.55));
//         if (insertAt > words.length - 4) insertAt = Math.max(3, words.length - 4);
//         const withToken = `<p>${words.slice(0, insertAt).join(" ")} ${token} ${words.slice(insertAt).join(" ")}</p>`;
//         const replaced = after.replace(p[0], withToken);
//         pieces.push(replaced);
//         // append rest and return
//         pieces.push(html.slice(match.index + h2.length + after.length));
//         return pieces.join("");
//       }
//     }
//   }
//   // If we didn't find the target <p>, just return original html.
//   return html;
// }

// function ensureFeatures(html: string, prefs: ContentPreferences, keywords: string[]) {
//   let out = html;

//   // Bullet lists (at least two)
//   if (prefs.includeBulletPoints) {
//     const listCount = (out.match(/<ul>/gi) || []).length;
//     if (listCount < 2) {
//       // add after section 1 and 3 if missing
//       const sample = ["Practical tip", "Common mistake", "Quick win", "Pro advice", "Next step"];
//       const ul = `<ul><li>${sample[0]}</li><li>${sample[1]}</li><li>${sample[2]}</li></ul>`;
//       out = out.replace(/(<\/p>)/i, `$1${ul}`); // after first paragraph
//       out = out.replace(/(<\/p>)(?![\s\S]*<\/p>)/i, `$1${ul}`); // after last paragraph
//     }
//   }

//   // Table (at least one)
//   if (prefs.includeTables) {
//     if (!/<table[\s>]/i.test(out)) {
//       const head = `<table><thead><tr><th>Aspect</th><th>Details</th></tr></thead><tbody>`;
//       const rows = (keywords.slice(0, 3).length ? keywords.slice(0, 3) : ["Point A","Point B","Point C"])
//         .map((k) => `<tr><td>${k}</td><td>Short, helpful note.</td></tr>`).join("");
//       const table = `${head}${rows}</tbody></table>`;
//       // insert after second paragraph if possible
//       let count = 0;
//       out = out.replace(/<\/p>/g, (m) => (++count === 2 ? m + table : m));
//       if (count < 2) out += table;
//     }
//   }

//   // Boxes / quotes (at least two)
//   if (prefs.includeBoxesQuotesHighlights) {
//     const blocks = (out.match(/<blockquote>|<div\s+style=.*border-left/gi) || []).length;
//     const callout = `<div style="background:#f6f7f9;padding:12px;border-left:4px solid #999;margin:12px 0">Quick takeaway: keep it practical and consistent.</div>`;
//     if (blocks < 2) {
//       out = out.replace(/(<\/p>)/, `$1${callout}`);
//       out = out.replace(/(<\/p>)(?![\s\S]*<\/p>)/, `$1${callout}`);
//     }
//   }

//   // Emojis (light touch)
//   if (prefs.includeEmojis) {
//     // Add to headings that lack emoji
//     out = out.replace(/<h2>(.*?)<\/h2>/g, (_m, g1) => {
//       if (/[^\u0000-\u007F]/.test(g1) && /[\p{Emoji}]/u.test(g1)) return `<h2>${g1}</h2>`;
//       if (/[\u2190-\u21FF\u2600-\u27BF\p{Emoji}]/u.test(g1)) return `<h2>${g1}</h2>`;
//       return `<h2>${g1} 🔹</h2>`;
//     });
//   }

//   // Q&A section
//   if (prefs.includeQandA) {
//     if (!/>\s*Frequently Asked Questions\s*<\//i.test(out)) {
//       const qas = [
//         ["यह विषय क्यों ज़रूरी है?", "क्योंकि यह रोज़मर्रा के निर्णयों को आसान और असरदार बनाता है।"],
//         ["शुरुआत कहाँ से करें?", "एक छोटा, स्पष्ट लक्ष्य तय करें और उसी के अनुसार कदम रखें।"],
//         ["गलतियों से कैसे बचें?", "संदर्भ समझकर छोटे-छोटे प्रयोग करें और उनसे सीखें।"],
//       ];
//       const faq = `<h2>Frequently Asked Questions</h2>` + qas.map(([q,a]) => `<h3>${q}</h3><p>${a}</p>`).join("");
//       out += faq;
//     }
//   }

//   return out;
// }

// /** ────────────────────────────────────────────────────────────
//  * Main hook
//  * ──────────────────────────────────────────────────────────── */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status: (proj as any).status ?? "pending",
//           totalKeywords: (proj as any).totalKeywords ?? 0,
//           processedKeywords: (proj as any).processedKeywords ?? 0,
//           createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount: (proj as any).failedCount ?? 0,
//         };
//         if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//         return [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 100;
//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       startTransition(() => { setContentItems((prev) => [...(prev ?? []), ...toWrite]); });
//     };
//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) return flushNow();
//       if (!scheduled) { scheduled = true; queueMicrotask(flushNow); }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
//       });
//       try { onProgress?.(Math.round((processed / Math.max(1, total)) * 100)); } catch {}
//     };

//     try {
//       const buffer = await file.arrayBuffer();
//       const { keywords } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
//       if (!keywords.length) {
//         ensureProject({ id: fileId, fileName: file.name, status: "error", error: "No valid keywords found in the uploaded Excel file" });
//         toast.error("No valid keywords found in the uploaded Excel file.");
//         onProgress?.(100);
//         return;
//       }

//       const prefs = getFreshPrefs();
//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
//         : buildGroupsNormal(keywords, size);

//       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
//       toast.info(`Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article`);

//       const wantSections = (prefs.sectionCount || 5) + (prefs.includeConclusion ? 1 : 0);

//       // Moderate concurrency to reduce truncation on multilingual
//       const cores = navigator.hardwareConcurrency ?? 4;
//       let concurrency = Math.min(Math.max(8, cores * 2), 24);
//       const MAX = 36;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length) return;
//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];
//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

//         const task = (async () => {
//           try {
//             const basePlan = buildPlanFromPrefs({ keywords: kws, prefs, variationId: groupIndex + 1 });

//             const result = await generateJSONTitleHtml({
//               keywords: kws,
//               instructions: basePlan,
//               titleLength: prefs.titleLength || 100,
//             });

//             let html = String(result.html || "").trim();
//             if (!html) throw new Error("Empty html");

//             // If the model produced fewer sections than required, derive minimally (but keep original if enough)
//             const existingBlocks = countH2PBlocks(html);
//             if (existingBlocks < Math.max(2, wantSections - 1)) {
//               // too short → soft repair: add simple sections from plain text (rare now with shorter prompt)
//               html += `<h2>More Details</h2><p>Here are a few additional practical points that help in real scenarios. Focus on clarity, small improvements, and repeatable steps so readers can quickly apply the ideas.</p>`;
//             }

//             // Token injection on first sections only (don’t destroy content)
//             const tokenTargets = Math.min(4, kws.length);
//             for (let i = 0; i < tokenTargets; i++) {
//               html = injectTokenIntoNthSection(html, i, `[ANCHOR:${kws[i]}]`);
//             }

//             // Feature enforcement (if the model forgot)
//             html = ensureFeatures(html, prefs, kws);

//             // Apply anchors
//             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//             html = applyAnchorTokens(html, anchors);
//             // Clean any leftover tokens (rare)
//             html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: html,
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
//                 sectionCount: prefs.sectionCount,
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
//               },
//             };
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             failedGroups.push({ index: groupIndex, grp });
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(8, Math.min(Math.floor(concurrency), MAX));
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;
//         await Promise.race(Array.from(running));

//         // Gentle adaptive concurrency
//         if (failedCount > processedCount * 0.25 && concurrency > 8) concurrency -= 0.5;
//         else if (concurrency < MAX && failedCount < processedCount * 0.08) concurrency += 0.75;
//       }

//       // Retry failed (slow mode)
//       if (failedGroups.length) {
//         toast.message(`Retrying ${failedGroups.length} failed item(s)…`);
//         const queue = [...failedGroups];
//         failedGroups.length = 0;

//         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
//           const kws = grp.map((g) => g.keyword);
//           const urlMap: Record<string, string | null> = {};
//           grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

//           const basePlan = buildPlanFromPrefs({ keywords: kws, prefs, variationId: groupIndex + 1 });
//           const res = await generateJSONTitleHtml({ keywords: kws, instructions: basePlan, titleLength: prefs.titleLength || 100 });

//           let html = String(res.html || "").trim();
//           if (!html) throw new Error("Empty html (retry)");
//           if (countH2PBlocks(html) < Math.max(2, wantSections - 1)) {
//             html += `<h2>More Details</h2><p>Actionable advice: start small, keep consistency, review results weekly, and adjust.</p>`;
//           }

//           // tokens + features + anchors
//           const tokenTargets = Math.min(4, kws.length);
//           for (let i = 0; i < tokenTargets; i++) {
//             html = injectTokenIntoNthSection(html, i, `[ANCHOR:${kws[i]}]`);
//           }
//           html = ensureFeatures(html, prefs, kws);
//           const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//           html = applyAnchorTokens(html, anchors);
//           html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");

//           const item: ContentItem = {
//             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
//             keyword: kws[0],
//             keywordsUsed: kws,
//             generatedContent: html,
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
//               sectionCount: prefs.sectionCount,
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
//             },
//           };
//           bufferItems.push(item);
//           scheduleFlush();
//         };

//         const RETRY_CONCURRENCY = 6;
//         const running2 = new Set<Promise<void>>();
//         const startNextRetry = () => {
//           if (!queue.length) return;
//           const { grp, index } = queue.shift()!;
//           const p = (async () => {
//             try { await runOne(grp, index); } catch (e) { console.error("retry failed:", e); }
//           })().finally(() => running2.delete(p));
//           running2.add(p);
//         };
//         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//         while (running2.size || queue.length) {
//           await Promise.race(Array.from(running2));
//           while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//           await new Promise((r) => setTimeout(r, 80));
//         }
//       }

//       flushNow();
//       startTransition(() => {
//         setExcelProjects((prev) => (prev ?? []).map((p) =>
//           p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
//         ));
//       });
//       const ok = baseGroups.length - failedCount;
//       toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       startTransition(() => {
//         setExcelProjects((prev) => (prev ?? []).map((p) =>
//           p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
//         ));
//       });
//       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
//       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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

// /** ────────────────────────────────────────────────────────────
//  * Grouping helpers (unchanged logic, cleaner)
//  * ──────────────────────────────────────────────────────────── */
// function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) groups.push(rows.slice(i, i + size));
//   return groups;
// }
// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0) return [];
//   if (arr.length === 0) return [];
//   if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
//   const takenIdx = new Set<number>();
//   while (takenIdx.size < Math.min(size, arr.length)) {
//     takenIdx.add(Math.floor(Math.random() * arr.length));
//   }
//   const out = Array.from(takenIdx).map(i => arr[i]);
//   while (out.length < size) out.push(arr[Math.floor(Math.random() * arr.length)]);
//   return out;
// }
// function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) groups.push(sampleDistinct(rows, size));
//   return groups;
// }




// // src/hooks/use-content-generation.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Preferences loader (safe defaults + localStorage merge)
//  * ──────────────────────────────────────────────────────────── */

// const PREF_KEY = "content-preferences_v3";

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       sectionCount: 5,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       ...parsed,
//     };
//   } catch {
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       sectionCount: 5,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//     };
//   }
// }

// /** ────────────────────────────────────────────────────────────
//  * Types
//  * ──────────────────────────────────────────────────────────── */

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (p: number) => void;

// /** ────────────────────────────────────────────────────────────
//  * Editor session helper
//  * ──────────────────────────────────────────────────────────── */

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

// /** ────────────────────────────────────────────────────────────
//  * Excel parsing (keywords + optional URLs)
//  * ──────────────────────────────────────────────────────────── */

// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

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
//   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim(); // remove leading numbers
//   v = v.replace(/^[\u2022\-\*]\s*/, "").trim(); // remove bullet chars
//   if (/^[\d\.,\s]+$/.test(v)) return "";
//   if (isLikelyUrlOrDomain(v)) return "";
//   // accept letters/numbers from any script; require at least 2
//   if ((v.match(/[\p{L}\p{N}]/gu) || []).length < 2) return "";
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2 || v.length > 180) return "";
//   return v;
// }

// type KeywordRow = { keyword: string; url?: string | null };

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
//   let keywordCol = -1;
//   let urlCol = -1;

//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(
//       ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//       0
//     );
//     let bestCol = -1;
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
//     if (bestCol !== -1) keywordCol = bestCol;
//   }

//   return {
//     headerRowIndex,
//     keywordCol: keywordCol === -1 ? null : keywordCol,
//     urlCol: urlCol === -1 ? null : urlCol,
//   };
// }

// function extractKeywordsFromWorksheetWithUrls(
//   worksheet: XLSX.WorkSheet
// ): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
//     header: 1,
//     raw: true,
//   }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

//   const { headerRowIndex, keywordCol, urlCol } =
//     detectHeaderRowAndColumns(rows);
//   const start = Math.min(rows.length - 1, headerRowIndex + 1);
//   const dataRows = rows.slice(start);
//   const maxCols = Math.max(
//     ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//     0
//   );

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

// function extractKeywordsFromWorkbookBufferWithUrls(
//   buffer: ArrayBuffer | Uint8Array
// ) {
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
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }

//   return { keywords: combined };
// }

// /** ────────────────────────────────────────────────────────────
//  * Small HTML helpers
//  * ──────────────────────────────────────────────────────────── */

// function countH2PBlocks(html: string): number {
//   const blocks =
//     html.match(/<h2>[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>/gi) || [];
//   return blocks.length;
// }

// /**
//  * Inject a token mid-paragraph into the first <p> after the Nth <h2>.
//  * Keeps at least a few words after the token.
//  */
// function injectTokenIntoNthSection(
//   html: string,
//   sectionIndexZero: number,
//   token: string
// ): string {
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   let idx = -1;
//   let lastEnd = 0;
//   const out: string[] = [];

//   while ((match = h2Regex.exec(html)) !== null) {
//     out.push(html.slice(lastEnd, match.index));
//     const h2 = match[0];
//     out.push(h2);
//     lastEnd = match.index + h2.length;
//     idx++;

//     if (idx === sectionIndexZero) {
//       const after = html.slice(lastEnd);
//       const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
//       if (!pMatch) {
//         out.push(after);
//         return out.join("");
//       }
//       const pHtml = pMatch[0];
//       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//       const words = inner.split(/\s+/);
//       if (words.length < 6) {
//         out.push(after);
//         return out.join("");
//       }
//       let insertAt = Math.max(3, Math.floor(words.length * 0.55));
//       if (insertAt > words.length - 4) {
//         insertAt = Math.max(3, words.length - 4);
//       }
//       const withToken =
//         "<p>" +
//         words.slice(0, insertAt).join(" ") +
//         " " +
//         token +
//         " " +
//         words.slice(insertAt).join(" ") +
//         "</p>";
//       const replaced = after.replace(pHtml, withToken);
//       out.push(replaced);
//       out.push(html.slice(match.index + h2.length + after.length));
//       return out.join("");
//     }
//   }

//   out.push(html.slice(lastEnd));
//   return out.join("");
// }

// /**
//  * Clean legacy fallback artifacts:
//  * - Remove standalone "Practical tip" / "Common mistake" / "Quick win"
//  *   if they appear as their own <p> or <li>.
//  */
// function stripLegacyStubBullets(html: string): string {
//   // const stubRe = /(Practical tip|Common mistake|Quick win)/i;

//   // Remove <li> stubs
//   let out = html.replace(
//     /<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi,
//     ""
//   );

//   // Remove <p> stubs that only contain those texts
//   out = out.replace(
//     /<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi,
//     ""
//   );

//   // Clean empty lists created by removal
//   out = out.replace(/<ul>\s*<\/ul>/gi, "");
//   out = out.replace(/<ol>\s*<\/ol>/gi, "");

//   return out;
// }

// /** ────────────────────────────────────────────────────────────
//  * Main hook
//  * ──────────────────────────────────────────────────────────── */

// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>(
//     "content-items",
//     []
//   );
//   const [excelProjects, setExcelProjects] =
//     useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (
//     proj: Partial<ExcelProject> & { id: string; fileName: string }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status: (proj as any).status ?? "pending",
//           totalKeywords: (proj as any).totalKeywords ?? 0,
//           processedKeywords: (proj as any).processedKeywords ?? 0,
//           createdAt:
//             (proj as any).createdAt ?? new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount: (proj as any).failedCount ?? 0,
//         };
//         if (exists) {
//           return prev.map((p) =>
//             p.id === proj.id ? { ...p, ...base } : p
//           );
//         }
//         return [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: GenerateProgressCallback
//   ) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 80;

//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       startTransition(() => {
//         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//       });
//     };

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) return flushNow();
//       if (!scheduled) {
//         scheduled = true;
//         queueMicrotask(flushNow);
//       }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> =
//       [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? { ...p, processedKeywords: processed }
//               : p
//           )
//         );
//       });
//       try {
//         onProgress?.(
//           Math.round((processed / Math.max(1, total)) * 100)
//         );
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
//       const { keywords } =
//         extractKeywordsFromWorkbookBufferWithUrls(buffer);

//       if (!keywords.length) {
//         ensureProject({
//           id: fileId,
//           fileName: file.name,
//           status: "error",
//           error:
//             "No valid keywords found in the uploaded Excel file",
//         });
//         toast.error(
//           "No valid keywords found in the uploaded Excel file."
//         );
//         onProgress?.(100);
//         return;
//       }

//       const prefs = getFreshPrefs();
//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(
//             keywords,
//             size,
//             Math.max(
//               1,
//               Math.min(200, prefs.articleCount || 1)
//             )
//           )
//         : buildGroupsNormal(keywords, size);

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(
//         `Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article`
//       );

//       const wantSections =
//         (prefs.sectionCount || 5) +
//         (prefs.includeConclusion ? 1 : 0);

//       const cores = navigator.hardwareConcurrency ?? 4;
//       let concurrency = Math.min(
//         Math.max(8, cores * 2),
//         24
//       );
//       const MAX = 36;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length) return;
//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];

//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => {
//           urlMap[g.keyword] = g.url ?? null;
//         });

//         const task = (async () => {
//           try {
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

//             let html = String(result.html || "").trim();
//             if (!html) throw new Error("Empty html from model");

//             // Minimal structural repair if too thin
//             const blockCount = countH2PBlocks(html);
//             if (blockCount < Math.max(2, wantSections - 1)) {
//               html +=
//                 `<h2>More Details</h2>` +
//                 `<p>Here are a few additional clarifications and practical notes so the reader gets complete, useful context without needing another source.</p>`;
//             }

//             // Inject tokens for first few sections (LLM sees rules via prompt)
//             const tokenTargets = Math.min(4, kws.length);
//             for (let i = 0; i < tokenTargets; i++) {
//               html = injectTokenIntoNthSection(
//                 html,
//                 i,
//                 `[ANCHOR:${kws[i]}]`
//               );
//             }

//             // Apply anchors
//             const anchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));
//             html = applyAnchorTokens(html, anchors);

//             // Remove leftover raw tokens if any
//             html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");

//             // Strip any legacy stub bullet artefacts
//             html = stripLegacyStubBullets(html);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: html,
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
//                 sectionCount: prefs.sectionCount,
//                 includeConclusion: prefs.includeConclusion,
//                 language: prefs.language,
//                 customModeEnabled: prefs.customModeEnabled,
//                 articleCount: prefs.articleCount,
//                 keywordMode: prefs.keywordMode,
//                 includeBulletPoints: prefs.includeBulletPoints,
//                 includeTables: prefs.includeTables,
//                 includeEmojis: prefs.includeEmojis,
//                 includeBoxesQuotesHighlights:
//                   prefs.includeBoxesQuotesHighlights,
//                 includeQandA: prefs.includeQandA,
//               },
//             };

//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             failedGroups.push({ index: groupIndex, grp });
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(
//           8,
//           Math.min(Math.floor(concurrency), MAX)
//         );
//         while (running.size < cur && idx < baseGroups.length) {
//           startNext();
//         }
//         if (!running.size && idx >= baseGroups.length) break;

//         await Promise.race(Array.from(running));

//         // light adaptive tuning
//         if (
//           failedCount > processedCount * 0.25 &&
//           concurrency > 8
//         ) {
//           concurrency -= 0.5;
//         } else if (
//           concurrency < MAX &&
//           failedCount < processedCount * 0.08
//         ) {
//           concurrency += 0.75;
//         }
//       }

//       // Retry failed groups (no hard-coded formatting)
//       if (failedGroups.length) {
//         toast.message(
//           `Retrying ${failedGroups.length} failed item(s)…`
//         );
//         const queue = [...failedGroups];
//         failedGroups.length = 0;

//         const RETRY_CONCURRENCY = 6;
//         const running2 = new Set<Promise<void>>();

//         const runOne = async (
//           grp: KeywordRow[],
//           groupIndex: number
//         ) => {
//           const kws = grp.map((g) => g.keyword);
//           const urlMap: Record<string, string | null> = {};
//           grp.forEach((g) => {
//             urlMap[g.keyword] = g.url ?? null;
//           });

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

//           let html = String(res.html || "").trim();
//           if (!html) throw new Error("Empty html (retry)");

//           if (
//             countH2PBlocks(html) <
//             Math.max(2, wantSections - 1)
//           ) {
//             html +=
//               `<h2>More Details</h2>` +
//               `<p>Short, concrete tips to make the explanation feel complete and actionable.</p>`;
//           }

//           const tokenTargets = Math.min(4, kws.length);
//           for (let i = 0; i < tokenTargets; i++) {
//             html = injectTokenIntoNthSection(
//               html,
//               i,
//               `[ANCHOR:${kws[i]}]`
//             );
//           }

//           const anchors = Object.keys(urlMap).map((k) => ({
//             keyword: k,
//             url: urlMap[k] || undefined,
//           }));
//           html = applyAnchorTokens(html, anchors);
//           html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");

//           html = stripLegacyStubBullets(html);

//           const item: ContentItem = {
//             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
//             keyword: kws[0],
//             keywordsUsed: kws,
//             generatedContent: html,
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
//               sectionCount: prefs.sectionCount,
//               includeConclusion: prefs.includeConclusion,
//               language: prefs.language,
//               customModeEnabled: prefs.customModeEnabled,
//               articleCount: prefs.articleCount,
//               keywordMode: prefs.keywordMode,
//               includeBulletPoints:
//                 prefs.includeBulletPoints,
//               includeTables: prefs.includeTables,
//               includeEmojis: prefs.includeEmojis,
//               includeBoxesQuotesHighlights:
//                 prefs.includeBoxesQuotesHighlights,
//               includeQandA: prefs.includeQandA,
//             },
//           };

//           bufferItems.push(item);
//           scheduleFlush();
//         };

//         const startNextRetry = () => {
//           if (!queue.length) return;
//           const { grp, index } = queue.shift()!;
//           const p = (async () => {
//             try {
//               await runOne(grp, index);
//             } catch (e) {
//               console.error("retry failed:", e);
//             }
//           })().finally(() => running2.delete(p));
//           running2.add(p);
//         };

//         while (
//           running2.size < RETRY_CONCURRENCY &&
//           queue.length
//         ) {
//           startNextRetry();
//         }

//         while (running2.size || queue.length) {
//           await Promise.race(Array.from(running2));
//           while (
//             running2.size < RETRY_CONCURRENCY &&
//             queue.length
//           ) {
//             startNextRetry();
//           }
//           await new Promise((r) => setTimeout(r, 80));
//         }
//       }

//       flushNow();

//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "completed",
//                   processedKeywords:
//                     baseGroups.length,
//                   failedCount,
//                 }
//               : p
//           )
//         );
//       });

//       const ok = baseGroups.length - failedCount;
//       toast.success(
//         `✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`
//       );
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "error",
//                   error:
//                     error instanceof Error
//                       ? error.message
//                       : String(error),
//                 }
//               : p
//           )
//         );
//       });
//       toast.error(
//         `Failed processing ${file.name}: ${
//           error instanceof Error
//             ? error.message
//             : String(error)
//         }`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects((prev) =>
//         (prev ?? []).filter((p) => p.id !== projectId)
//       );
//       setContentItems((prev) =>
//         (prev ?? []).filter((c) => c.fileId !== projectId)
//       );
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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

// /** ────────────────────────────────────────────────────────────
//  * Grouping helpers
//  * ──────────────────────────────────────────────────────────── */

// function buildGroupsNormal(
//   rows: KeywordRow[],
//   size: KeywordMode
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) {
//     groups.push(rows.slice(i, i + size));
//   }
//   return groups;
// }

// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0) return [];
//   if (!arr.length) return [];
//   if (size === 1) {
//     return [arr[Math.floor(Math.random() * arr.length)]];
//   }
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

// function buildGroupsCustom(
//   rows: KeywordRow[],
//   size: KeywordMode,
//   count: number
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) {
//     groups.push(sampleDistinct(rows, size));
//   }
//   return groups;
// }





// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import {
//   generateJSONTitleHtml,
//   applyAnchorTokens,
// } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type {
//   ContentPreferences,
//   KeywordMode,
// } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Preferences loader
//  * ──────────────────────────────────────────────────────────── */

// const PREF_KEY = "content-preferences_v3";

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw
//       ? (JSON.parse(raw) as Partial<ContentPreferences>)
//       : {};
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//       ...parsed,
//     };
//   } catch {
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//     };
//   }
// }

// /** ────────────────────────────────────────────────────────────
//  * Types
//  * ──────────────────────────────────────────────────────────── */

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (p: number) => void;

// /** ────────────────────────────────────────────────────────────
//  * Editor session helper
//  * ──────────────────────────────────────────────────────────── */

// const SESSION_KEY = "open-content-item_v1";

// export function openContentEditor(item: ContentItem) {
//   try {
//     try {
//       sessionStorage.setItem(
//         SESSION_KEY,
//         JSON.stringify(item)
//       );
//     } catch {
//       localStorage.setItem(
//         `${SESSION_KEY}_fallback`,
//         JSON.stringify(item)
//       );
//     }
//     const win = window.open(
//       "/content/editor",
//       "_blank"
//     );
//     if (!win) {
//       toast.error(
//         "Popup blocked — allow popups to open the editor in a new tab."
//       );
//     }
//   } catch {
//     try {
//       window.location.href = "/content/editor";
//     } catch {
//       // ignore
//     }
//   }
// }

// /** ────────────────────────────────────────────────────────────
//  * Excel parsing (keywords + optional URLs)
//  * ──────────────────────────────────────────────────────────── */

// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function isLikelyUrlOrDomain(s?: string | null) {
//   if (!s) return false;
//   const t = String(s).trim();
//   if (!t) return false;
//   if (/^https?:\/\//i.test(t)) return true;
//   if (/^www\./i.test(t)) return true;
//   if (
//     /^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(t) &&
//     !/\s/.test(t)
//   )
//     return true;
//   return false;
// }

// function sanitizeKeyword(raw: unknown): string {
//   if (raw == null) return "";
//   let v = String(raw)
//     .replace(/\u00A0/g, " ")
//     .trim();
//   if (!v) return "";
//   v = v.replace(
//     /^\(?\s*\d+[\.\):-]?\s*/u,
//     ""
//   ).trim();
//   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
//   if (/^[\d\.,\s]+$/.test(v)) return "";
//   if (isLikelyUrlOrDomain(v)) return "";
//   if (
//     (v.match(/[\p{L}\p{N}]/gu) || []).length < 2
//   )
//     return "";
//   v = v
//     .replace(/^[\W_]+|[\W_]+$/g, "")
//     .trim();
//   if (v.length < 2 || v.length > 180)
//     return "";
//   return v;
// }

// type KeywordRow = {
//   keyword: string;
//   url?: string | null;
// };

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

// function detectHeaderRowAndColumns(
//   rows: unknown[][]
// ) {
//   let headerRowIndex = -1;
//   const maxCheck = Math.min(rows.length, 6);

//   for (let i = 0; i < maxCheck; i++) {
//     const r = rows[i];
//     if (!Array.isArray(r)) continue;
//     const nonEmpty = r.filter(
//       (c) =>
//         String(c ?? "")
//           .trim()
//           .length > 0
//     );
//     if (nonEmpty.length >= 2) {
//       headerRowIndex = i;
//       break;
//     }
//   }
//   if (headerRowIndex === -1)
//     headerRowIndex = 0;

//   const headers = (rows[
//     headerRowIndex
//   ] as unknown[]).map(norm);

//   let keywordCol = -1;
//   let urlCol = -1;

//   headers.forEach((h, idx) => {
//     if (
//       keywordCol === -1 &&
//       KW_HEADERS.has(h)
//     )
//       keywordCol = idx;
//     if (
//       urlCol === -1 &&
//       URL_HEADERS.has(h)
//     )
//       urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(
//       headerRowIndex + 1,
//       headerRowIndex + 201
//     );
//     const maxCols = Math.max(
//       ...rows.map((r) =>
//         Array.isArray(r) ? r.length : 0
//       ),
//       0
//     );
//     let bestCol = -1;
//     let bestScore = 0;

//     for (let c = 0; c < maxCols; c++) {
//       let score = 0;
//       let checks = 0;
//       for (const rr of lookahead) {
//         if (!Array.isArray(rr)) continue;
//         const s = sanitizeKeyword(rr[c]);
//         if (s) score++;
//         if (
//           rr[c] !== undefined &&
//           rr[c] !== null &&
//           String(rr[c]).trim() !== ""
//         ) {
//           checks++;
//         }
//       }
//       const weighted =
//         score * 100 +
//         Math.min(checks, 100);
//       if (checks === 0) continue;
//       if (weighted > bestScore) {
//         bestScore = weighted;
//         bestCol = c;
//       }
//     }
//     if (bestCol !== -1)
//       keywordCol = bestCol;
//   }

//   return {
//     headerRowIndex,
//     keywordCol:
//       keywordCol === -1 ? null : keywordCol,
//     urlCol:
//       urlCol === -1 ? null : urlCol,
//   };
// }

// function extractKeywordsFromWorksheetWithUrls(
//   worksheet: XLSX.WorkSheet
// ): KeywordRow[] {
//   const rows =
//     XLSX.utils.sheet_to_json<unknown[]>(
//       worksheet,
//       { header: 1, raw: true }
//     ) as unknown[][];

//   if (!rows || rows.length === 0)
//     return [];

//   const {
//     headerRowIndex,
//     keywordCol,
//     urlCol,
//   } = detectHeaderRowAndColumns(rows);

//   const start = Math.min(
//     rows.length - 1,
//     headerRowIndex + 1
//   );
//   const dataRows = rows.slice(start);
//   const maxCols = Math.max(
//     ...rows.map((r) =>
//       Array.isArray(r) ? r.length : 0
//     ),
//     0
//   );

//   const out: KeywordRow[] = [];
//   const seen = new Set<string>();

//   for (const r of dataRows) {
//     if (!Array.isArray(r)) continue;

//     let k = "";
//     if (keywordCol != null)
//       k = sanitizeKeyword(
//         r[keywordCol]
//       );

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
//       const raw = String(
//         r[urlCol] ?? ""
//       ).trim();
//       if (raw && isLikelyUrlOrDomain(raw)) {
//         url = /^https?:\/\//i.test(raw)
//           ? raw
//           : "https://" + raw;
//       }
//     }

//     if (!url) {
//       for (
//         let offset = -3;
//         offset <= 3;
//         offset++
//       ) {
//         if (offset === 0) continue;
//         const idx =
//           (keywordCol ?? 0) + offset;
//         if (idx < 0 || idx >= maxCols)
//           continue;
//         const maybe = r[idx];
//         if (!maybe) continue;
//         const s = String(maybe).trim();
//         if (isLikelyUrlOrDomain(s)) {
//           url = /^https?:\/\//i.test(s)
//             ? s
//             : "https://" + s;
//           break;
//         }
//       }
//     }

//     out.push({ keyword: k, url });
//     seen.add(k);
//   }

//   return out;
// }

// function extractKeywordsFromWorkbookBufferWithUrls(
//   buffer: ArrayBuffer | Uint8Array
// ) {
//   const workbook = XLSX.read(buffer, {
//     type: "array",
//   });
//   const sheetNames =
//     workbook.SheetNames ?? [];
//   const combined: KeywordRow[] = [];
//   const seen = new Set<string>();

//   for (const sheetName of sheetNames) {
//     try {
//       const sheet =
//         workbook.Sheets[sheetName];
//       const ks =
//         extractKeywordsFromWorksheetWithUrls(
//           sheet
//         );
//       for (const k of ks) {
//         if (!seen.has(k.keyword)) {
//           seen.add(k.keyword);
//           combined.push(k);
//         }
//       }
//       if (combined.length > 10000)
//         break;
//     } catch (e) {
//       console.warn(
//         "worksheet parse failed:",
//         sheetName,
//         e
//       );
//     }
//   }

//   return { keywords: combined };
// }

// /** ────────────────────────────────────────────────────────────
//  * Small HTML helpers
//  * ──────────────────────────────────────────────────────────── */

// function stripLegacyStubBullets(
//   html: string
// ): string {
//   let out = html.replace(
//     /<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi,
//     ""
//   );
//   out = out.replace(
//     /<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi,
//     ""
//   );
//   out = out.replace(/<ul>\s*<\/ul>/gi, "");
//   out = out.replace(/<ol>\s*<\/ol>/gi, "");
//   return out;
// }

// function injectTokenIntoNthSection(
//   html: string,
//   sectionIndexZero: number,
//   token: string
// ): string {
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   let idx = -1;
//   let lastEnd = 0;
//   const out: string[] = [];

//   while ((match = h2Regex.exec(html)) !== null) {
//     out.push(html.slice(lastEnd, match.index));
//     const h2 = match[0];
//     out.push(h2);
//     lastEnd = match.index + h2.length;
//     idx++;

//     if (idx === sectionIndexZero) {
//       const after = html.slice(lastEnd);
//       const pMatch =
//         after.match(
//           /<p>[\s\S]*?<\/p>/i
//         );
//       if (!pMatch) {
//         out.push(after);
//         return out.join("");
//       }
//       const pHtml = pMatch[0];
//       const inner = pHtml
//         .replace(/^<p>|<\/p>$/gi, "")
//         .trim();
//       const words = inner.split(/\s+/);
//       if (words.length < 6) {
//         out.push(after);
//         return out.join("");
//       }
//       let insertAt = Math.max(
//         3,
//         Math.floor(
//           words.length * 0.55
//         )
//       );
//       if (insertAt > words.length - 4) {
//         insertAt = Math.max(
//           3,
//           words.length - 4
//         );
//       }
//       const withToken =
//         "<p>" +
//         words
//           .slice(0, insertAt)
//           .join(" ") +
//         " " +
//         token +
//         " " +
//         words
//           .slice(insertAt)
//           .join(" ") +
//         "</p>";
//       const replaced = after.replace(
//         pHtml,
//         withToken
//       );
//       out.push(replaced);
//       out.push(
//         html.slice(
//           match.index +
//             h2.length +
//             after.length
//         )
//       );
//       return out.join("");
//     }
//   }

//   out.push(html.slice(lastEnd));
//   return out.join("");
// }

// /** ────────────────────────────────────────────────────────────
//  * Main hook
//  * ──────────────────────────────────────────────────────────── */

// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] =
//     useState(false);

//   const [contentItems, setContentItems] =
//     useLocalStorage<ContentItem[]>(
//       "content-items",
//       []
//     );

//   const [excelProjects, setExcelProjects] =
//     useLocalStorage<ExcelProject[]>(
//       "excel-projects",
//       []
//     );

//   const ensureProject = (
//     proj: Partial<ExcelProject> & {
//       id: string;
//       fileName: string;
//     }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some(
//           (p) => p.id === proj.id
//         );
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status:
//             (proj as any).status ??
//             "pending",
//           totalKeywords:
//             (proj as any)
//               .totalKeywords ?? 0,
//           processedKeywords:
//             (proj as any)
//               .processedKeywords ?? 0,
//           createdAt:
//             (proj as any)
//               .createdAt ??
//             new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount:
//             (proj as any)
//               .failedCount ?? 0,
//         };
//         if (exists) {
//           return prev.map((p) =>
//             p.id === proj.id
//               ? { ...p, ...base }
//               : p
//           );
//         }
//         return [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: GenerateProgressCallback
//   ) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 80;

//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite =
//         bufferItems.splice(
//           0,
//           bufferItems.length
//         );
//       startTransition(() => {
//         setContentItems((prev) => [
//           ...(prev ?? []),
//           ...toWrite,
//         ]);
//       });
//     };

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE)
//         return flushNow();
//       if (!scheduled) {
//         scheduled = true;
//         queueMicrotask(flushNow);
//       }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{
//       index: number;
//       grp: KeywordRow[];
//     }> = [];

//     const updateProgress = (
//       processed: number,
//       total: number
//     ) => {
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   processedKeywords:
//                     processed,
//                 }
//               : p
//           )
//         );
//       });
//       try {
//         onProgress?.(
//           Math.round(
//             (processed /
//               Math.max(1, total)) *
//               100
//           )
//         );
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer =
//         await file.arrayBuffer();
//       const { keywords } =
//         extractKeywordsFromWorkbookBufferWithUrls(
//           buffer
//         );

//       if (!keywords.length) {
//         ensureProject({
//           id: fileId,
//           fileName: file.name,
//           status: "error",
//           error:
//             "No valid keywords found in the uploaded Excel file",
//         });
//         toast.error(
//           "No valid keywords found in the uploaded Excel file."
//         );
//         onProgress?.(100);
//         return;
//       }

//       const prefs = getFreshPrefs();
//       const size =
//         (prefs.keywordMode ??
//           1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(
//             keywords,
//             size,
//             Math.max(
//               1,
//               Math.min(
//                 200,
//                 prefs.articleCount ||
//                   1
//               )
//             )
//           )
//         : buildGroupsNormal(
//             keywords,
//             size
//           );

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords:
//           baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(
//         `Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article`
//       );

//       const cores =
//         navigator.hardwareConcurrency ??
//         4;
//       let concurrency = Math.min(
//         Math.max(8, cores * 2),
//         24
//       );
//       const MAX = 36;

//       let idx = 0;
//       const running =
//         new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length)
//           return;

//         const groupIndex = idx++;
//         const grp =
//           baseGroups[groupIndex];

//         const kws = grp.map(
//           (g) => g.keyword
//         );
//         const urlMap: Record<
//           string,
//           string | null
//         > = {};
//         grp.forEach((g) => {
//           urlMap[g.keyword] =
//             g.url ?? null;
//         });

//         const task = (async () => {
//           try {
//             const plan =
//               buildPlanFromPrefs({
//                 keywords: kws,
//                 prefs,
//                 variationId:
//                   groupIndex + 1,
//               });

//             const result =
//               await generateJSONTitleHtml(
//                 {
//                   keywords: kws,
//                   instructions:
//                     plan,
//                   titleLength:
//                     prefs
//                       .titleLength ||
//                     100,
//                 }
//               );

//             let html = String(
//               result.html || ""
//             ).trim();
//             if (!html)
//               throw new Error(
//                 "Empty html from model"
//               );

//             // Inject anchor tokens early (caller rules enforce no headings/Conclusion usage)
//             const tokenTargets = Math.min(
//               4,
//               kws.length
//             );
//             for (
//               let i = 0;
//               i < tokenTargets;
//               i++
//             ) {
//               html = injectTokenIntoNthSection(
//                 html,
//                 i,
//                 `[ANCHOR:${kws[i]}]`
//               );
//             }

//             // Apply URLs for all used keywords
//             const anchors =
//               Object.keys(urlMap).map(
//                 (k) => ({
//                   keyword: k,
//                   url:
//                     urlMap[k] ||
//                     undefined,
//                 })
//               );
//             html =
//               applyAnchorTokens(
//                 html,
//                 anchors
//               );

//             // Clean leftover tokens
//             html =
//               html.replace(
//                 /\[ANCHOR:[^\]]+\]/g,
//                 ""
//               );

//             // Remove any legacy stub bullets
//             html =
//               stripLegacyStubBullets(
//                 html
//               );

//             const item: ContentItem =
//               {
//                 id: `${fileId}-${groupIndex}-${Date.now()}`,
//                 keyword: kws[0],
//                 keywordsUsed: kws,
//                 generatedContent:
//                   html,
//                 fileId,
//                 fileName:
//                   file.name,
//                 createdAt:
//                   new Date().toISOString(),
//                 title:
//                   result.title,
//                 targetUrl:
//                   urlMap[kws[0]] ??
//                   null,
//                 urlMap,
//                 status:
//                   "success",
//                 prefsSnapshot:
//                   {
//                     mood:
//                       prefs.mood,
//                     paragraphWords:
//                       prefs.paragraphWords,
//                     includeConclusion:
//                       prefs.includeConclusion,
//                     language:
//                       prefs.language,
//                     customModeEnabled:
//                       prefs.customModeEnabled,
//                     articleCount:
//                       prefs.articleCount,
//                     keywordMode:
//                       prefs.keywordMode,
//                     includeBulletPoints:
//                       prefs.includeBulletPoints,
//                     includeTables:
//                       prefs.includeTables,
//                     includeEmojis:
//                       prefs.includeEmojis,
//                     includeBoxesQuotesHighlights:
//                       prefs.includeBoxesQuotesHighlights,
//                     includeQandA:
//                       prefs.includeQandA,
//                     totalContentWords:
//                       prefs.totalContentWords,
//                     titleLength:
//                       prefs.titleLength,
//                     brandDomainEnabled:
//                       prefs.brandDomainEnabled,
//                     brandDomain:
//                       prefs.brandDomain,
//                   },
//               };

//             bufferItems.push(
//               item
//             );
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             failedGroups.push({
//               index:
//                 groupIndex,
//               grp,
//             });
//             console.error(
//               "group generate error:",
//               e
//             );
//           } finally {
//             processedCount += 1;
//             updateProgress(
//               processedCount,
//               baseGroups.length
//             );
//           }
//         })().finally(() =>
//           running.delete(task)
//         );

//         running.add(task);
//       };

//       while (
//         idx < baseGroups.length ||
//         running.size > 0
//       ) {
//         const cur = Math.max(
//           8,
//           Math.min(
//             Math.floor(
//               concurrency
//             ),
//             MAX
//           )
//         );
//         while (
//           running.size < cur &&
//           idx < baseGroups.length
//         ) {
//           startNext();
//         }
//         if (
//           !running.size &&
//           idx >= baseGroups.length
//         )
//           break;

//         await Promise.race(
//           Array.from(running)
//         );

//         if (
//           failedCount >
//             processedCount *
//               0.25 &&
//           concurrency > 8
//         ) {
//           concurrency -= 0.5;
//         } else if (
//           concurrency < MAX &&
//           failedCount <
//             processedCount *
//               0.08
//         ) {
//           concurrency += 0.75;
//         }
//       }

//       // Retry failed groups (same strict rules, no dummy content)
//       if (failedGroups.length) {
//         toast.message(
//           `Retrying ${failedGroups.length} failed item(s)…`
//         );

//         const queue = [
//           ...failedGroups,
//         ];
//         failedGroups.length = 0;

//         const RETRY_CONCURRENCY = 6;
//         const running2 =
//           new Set<Promise<void>>();

//         const runOne = async (
//           grp: KeywordRow[],
//           groupIndex: number
//         ) => {
//           const kws = grp.map(
//             (g) => g.keyword
//           );
//           const urlMap: Record<
//             string,
//             string | null
//           > = {};
//           grp.forEach((g) => {
//             urlMap[g.keyword] =
//               g.url ?? null;
//           });

//           const plan =
//             buildPlanFromPrefs({
//               keywords: kws,
//               prefs,
//               variationId:
//                 groupIndex + 1,
//             });

//           const res =
//             await generateJSONTitleHtml(
//               {
//                 keywords: kws,
//                 instructions:
//                   plan,
//                 titleLength:
//                   prefs
//                     .titleLength ||
//                   100,
//               }
//             );

//           let html = String(
//             res.html || ""
//           ).trim();
//           if (!html)
//             throw new Error(
//               "Empty html (retry)"
//             );

//           const tokenTargets =
//             Math.min(
//               4,
//               kws.length
//             );
//           for (
//             let i = 0;
//             i < tokenTargets;
//             i++
//           ) {
//             html = injectTokenIntoNthSection(
//               html,
//               i,
//               `[ANCHOR:${kws[i]}]`
//             );
//           }

//           const anchors =
//             Object.keys(
//               urlMap
//             ).map((k) => ({
//               keyword: k,
//               url:
//                 urlMap[k] ||
//                 undefined,
//             }));
//           html =
//             applyAnchorTokens(
//               html,
//               anchors
//             );
//           html =
//             html.replace(
//               /\[ANCHOR:[^\]]+\]/g,
//               ""
//             );
//           html =
//             stripLegacyStubBullets(
//               html
//             );

//           const item: ContentItem =
//             {
//               id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent:
//                 html,
//               fileId,
//               fileName:
//                 file.name,
//               createdAt:
//                 new Date().toISOString(),
//               title:
//                 res.title,
//               targetUrl:
//                 urlMap[kws[0]] ??
//                 null,
//               urlMap,
//               status:
//                 "success",
//               prefsSnapshot:
//                 {
//                   mood:
//                     prefs.mood,
//                   paragraphWords:
//                     prefs.paragraphWords,
//                   includeConclusion:
//                     prefs.includeConclusion,
//                   language:
//                     prefs.language,
//                   customModeEnabled:
//                     prefs.customModeEnabled,
//                   articleCount:
//                     prefs.articleCount,
//                   keywordMode:
//                     prefs.keywordMode,
//                   includeBulletPoints:
//                     prefs.includeBulletPoints,
//                   includeTables:
//                     prefs.includeTables,
//                   includeEmojis:
//                     prefs.includeEmojis,
//                   includeBoxesQuotesHighlights:
//                     prefs.includeBoxesQuotesHighlights,
//                   includeQandA:
//                     prefs.includeQandA,
//                   totalContentWords:
//                     prefs.totalContentWords,
//                   titleLength:
//                     prefs.titleLength,
//                   brandDomainEnabled:
//                     prefs.brandDomainEnabled,
//                   brandDomain:
//                     prefs.brandDomain,
//                 },
//             };

//           bufferItems.push(
//             item
//           );
//           scheduleFlush();
//         };

//         const startNextRetry = () => {
//           if (!queue.length)
//             return;
//           const { grp, index } =
//             queue.shift()!;
//           const p = (async () => {
//             try {
//               await runOne(
//                 grp,
//                 index
//               );
//             } catch (e) {
//               console.error(
//                 "retry failed:",
//                 e
//               );
//             }
//           })().finally(() =>
//             running2.delete(p)
//           );
//           running2.add(p);
//         };

//         while (
//           running2.size <
//             RETRY_CONCURRENCY &&
//           queue.length
//         ) {
//           startNextRetry();
//         }

//         while (
//           running2.size ||
//           queue.length
//         ) {
//           await Promise.race(
//             Array.from(running2)
//           );
//           while (
//             running2.size <
//               RETRY_CONCURRENCY &&
//             queue.length
//           ) {
//             startNextRetry();
//           }
//           await new Promise((r) =>
//             setTimeout(r, 80)
//           );
//         }
//       }

//       flushNow();

//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status:
//                     "completed",
//                   processedKeywords:
//                     baseGroups.length,
//                   failedCount,
//                 }
//               : p
//           )
//         );
//       });

//       const ok =
//         baseGroups.length -
//         failedCount;
//       toast.success(
//         `✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`
//       );
//       onProgress?.(100);
//     } catch (error) {
//       console.error(
//         "generateContent overall error:",
//         error
//       );
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status:
//                     "error",
//                   error:
//                     error instanceof
//                     Error
//                       ? error.message
//                       : String(error),
//                 }
//               : p
//           )
//         );
//       });
//       toast.error(
//         `Failed processing ${file.name}: ${
//           error instanceof Error
//             ? error.message
//             : String(error)
//         }`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//     }
//   };

//   const deleteProject = (
//     projectId: string
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev) =>
//         (prev ?? []).filter(
//           (p) => p.id !== projectId
//         )
//       );
//       setContentItems((prev) =>
//         (prev ?? []).filter(
//           (c) => c.fileId !== projectId
//         )
//       );
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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

// /** ────────────────────────────────────────────────────────────
//  * Grouping helpers
//  * ──────────────────────────────────────────────────────────── */

// function buildGroupsNormal(
//   rows: KeywordRow[],
//   size: KeywordMode
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (
//     let i = 0;
//     i < rows.length;
//     i += size
//   ) {
//     groups.push(
//       rows.slice(i, i + size)
//     );
//   }
//   return groups;
// }

// function sampleDistinct<T>(
//   arr: T[],
//   size: number
// ): T[] {
//   if (size <= 0) return [];
//   if (!arr.length) return [];
//   if (size === 1) {
//     return [
//       arr[
//         Math.floor(
//           Math.random() *
//             arr.length
//         )
//       ],
//     ];
//   }
//   const taken =
//     new Set<number>();
//   while (
//     taken.size <
//     Math.min(size, arr.length)
//   ) {
//     taken.add(
//       Math.floor(
//         Math.random() *
//           arr.length
//       )
//     );
//   }
//   const out = Array.from(
//     taken
//   ).map((i) => arr[i]);
//   while (out.length < size) {
//     out.push(
//       arr[
//         Math.floor(
//           Math.random() *
//             arr.length
//         )
//       ]
//     );
//   }
//   return out;
// }

// function buildGroupsCustom(
//   rows: KeywordRow[],
//   size: KeywordMode,
//   count: number
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) {
//     groups.push(
//       sampleDistinct(
//         rows,
//         size
//       )
//     );
//   }
//   return groups;
// }





// // src/hooks/use-content-generation.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import {
//   generateJSONTitleHtml,
//   applyAnchorTokens,
// } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type {
//   ContentPreferences,
//   KeywordMode,
// } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Types
//  * ──────────────────────────────────────────────────────────── */

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// /** ────────────────────────────────────────────────────────────
//  * Constants & helpers
//  * ──────────────────────────────────────────────────────────── */

// const PREF_KEY = "content-preferences_v3";
// const SESSION_KEY = "open-content-item_v1";

// type KeywordRow = {
//   keyword: string;
//   url?: string | null;
// };

// /** Simple timeout wrapper:
//  *  - If LLM call hangs or errors, we return a deterministic local fallback.
//  */
// function withTimeout<T>(
//   ms: number,
//   p: Promise<T>,
//   onTimeout: () => T
// ): Promise<T> {
//   return new Promise((resolve) => {
//     let settled = false;

//     const timer = setTimeout(() => {
//       if (settled) return;
//       settled = true;
//       resolve(onTimeout());
//     }, ms);

//     p.then((value) => {
//       if (settled) return;
//       settled = true;
//       clearTimeout(timer);
//       resolve(value);
//     }).catch(() => {
//       if (settled) return;
//       settled = true;
//       clearTimeout(timer);
//       resolve(onTimeout());
//     });
//   });
// }

// function createFallbackResult(
//   kws: string[],
//   plan: string,
//   titleLength: number
// ): { title: string; html: string } {
//   const baseKeyword = kws[0] || "Untitled";
//   const title = `${baseKeyword} — draft`.slice(0, titleLength || 100);
//   const html =
//     `<h1>${title}</h1>` +
//     `<p>${(plan || "").slice(0, 220)}...</p>` +
//     `<ul>${kws.map((k) => `<li>${k}</li>`).join("")}</ul>`;
//   return { title, html };
// }

// /** ────────────────────────────────────────────────────────────
//  * Preferences loader
//  * ──────────────────────────────────────────────────────────── */

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw
//       ? (JSON.parse(raw) as Partial<ContentPreferences>)
//       : {};
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//       ...parsed,
//     };
//   } catch {
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//     };
//   }
// }

// /** ────────────────────────────────────────────────────────────
//  * Editor session helper
//  * ──────────────────────────────────────────────────────────── */

// export function openContentEditor(item: ContentItem) {
//   try {
//     try {
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
//     } catch {
//       localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item));
//     }
//     const win = window.open("/content/editor", "_blank");
//     if (!win) {
//       toast.error(
//         "Popup blocked — allow popups to open the editor in a new tab."
//       );
//     }
//   } catch {
//     try {
//       window.location.href = "/content/editor";
//     } catch {
//       // ignore
//     }
//   }
// }

// /** ────────────────────────────────────────────────────────────
//  * Excel parsing: keywords + optional URLs
//  * ──────────────────────────────────────────────────────────── */

// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

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
//     const nonEmpty = r.filter(
//       (c) => String(c ?? "").trim().length > 0
//     );
//     if (nonEmpty.length >= 2) {
//       headerRowIndex = i;
//       break;
//     }
//   }
//   if (headerRowIndex === -1) headerRowIndex = 0;

//   const headers = (rows[headerRowIndex] as unknown[]).map(norm);

//   let keywordCol = -1;
//   let urlCol = -1;

//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(
//       ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//       0
//     );
//     let bestCol = -1;
//     let bestScore = 0;

//     for (let c = 0; c < maxCols; c++) {
//       let score = 0;
//       let checks = 0;
//       for (const rr of lookahead) {
//         if (!Array.isArray(rr)) continue;
//         const s = sanitizeKeyword(rr[c]);
//         if (s) score++;
//         if (
//           rr[c] !== undefined &&
//           rr[c] !== null &&
//           String(rr[c]).trim() !== ""
//         ) {
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
//     if (bestCol !== -1) keywordCol = bestCol;
//   }

//   return {
//     headerRowIndex,
//     keywordCol: keywordCol === -1 ? null : keywordCol,
//     urlCol: urlCol === -1 ? null : urlCol,
//   };
// }

// function extractKeywordsFromWorksheetWithUrls(
//   worksheet: XLSX.WorkSheet
// ): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
//     header: 1,
//     raw: true,
//   }) as unknown[][];

//   if (!rows || rows.length === 0) return [];

//   const { headerRowIndex, keywordCol, urlCol } =
//     detectHeaderRowAndColumns(rows);

//   const start = Math.min(rows.length - 1, headerRowIndex + 1);
//   const dataRows = rows.slice(start);
//   const maxCols = Math.max(
//     ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//     0
//   );

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

// function extractKeywordsFromWorkbookBufferWithUrls(
//   buffer: ArrayBuffer | Uint8Array
// ) {
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
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }

//   return { keywords: combined };
// }

// /** ────────────────────────────────────────────────────────────
//  * Small HTML helpers
//  * ──────────────────────────────────────────────────────────── */

// function stripLegacyStubBullets(html: string): string {
//   let out = html.replace(
//     /<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi,
//     ""
//   );
//   out = out.replace(
//     /<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi,
//     ""
//   );
//   out = out.replace(/<ul>\s*<\/ul>/gi, "");
//   out = out.replace(/<ol>\s*<\/ol>/gi, "");
//   return out;
// }

// function injectTokenIntoNthSection(
//   html: string,
//   sectionIndexZero: number,
//   token: string
// ): string {
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   let idx = -1;
//   let lastEnd = 0;
//   const out: string[] = [];

//   while ((match = h2Regex.exec(html)) !== null) {
//     out.push(html.slice(lastEnd, match.index));
//     const h2 = match[0];
//     out.push(h2);
//     lastEnd = match.index + h2.length;
//     idx++;

//     if (idx === sectionIndexZero) {
//       const after = html.slice(lastEnd);
//       const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
//       if (!pMatch) {
//         out.push(after);
//         return out.join("");
//       }
//       const pHtml = pMatch[0];
//       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//       const words = inner.split(/\s+/);
//       if (words.length < 6) {
//         out.push(after);
//         return out.join("");
//       }
//       let insertAt = Math.max(3, Math.floor(words.length * 0.55));
//       if (insertAt > words.length - 4) {
//         insertAt = Math.max(3, words.length - 4);
//       }
//       const withToken =
//         "<p>" +
//         words.slice(0, insertAt).join(" ") +
//         " " +
//         token +
//         " " +
//         words.slice(insertAt).join(" ") +
//         "</p>";
//       const replaced = after.replace(pHtml, withToken);
//       out.push(replaced);
//       out.push(html.slice(match.index + h2.length + after.length));
//       return out.join("");
//     }
//   }

//   out.push(html.slice(lastEnd));
//   return out.join("");
// }

// /** ────────────────────────────────────────────────────────────
//  * Grouping helpers
//  * ──────────────────────────────────────────────────────────── */

// function buildGroupsNormal(
//   rows: KeywordRow[],
//   size: KeywordMode
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) {
//     groups.push(rows.slice(i, i + size));
//   }
//   return groups;
// }

// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0) return [];
//   if (!arr.length) return [];
//   if (size === 1) {
//     return [arr[Math.floor(Math.random() * arr.length)]];
//   }
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

// function buildGroupsCustom(
//   rows: KeywordRow[],
//   size: KeywordMode,
//   count: number
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) {
//     groups.push(sampleDistinct(rows, size));
//   }
//   return groups;
// }

// /** ────────────────────────────────────────────────────────────
//  * Main hook
//  * ──────────────────────────────────────────────────────────── */

// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [contentItems, setContentItems] =
//     useLocalStorage<ContentItem[]>("content-items", []);

//   const [excelProjects, setExcelProjects] =
//     useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (
//     proj: Partial<ExcelProject> & { id: string; fileName: string }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status: (proj as any).status ?? "pending",
//           totalKeywords: (proj as any).totalKeywords ?? 0,
//           processedKeywords: (proj as any).processedKeywords ?? 0,
//           createdAt:
//             (proj as any).createdAt ?? new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount: (proj as any).failedCount ?? 0,
//         };
//         if (exists) {
//           return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//         }
//         return [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: (p: number) => void
//   ) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 80;

//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       startTransition(() => {
//         setContentItems((prev = []) => [...prev, ...toWrite]);
//       });
//     };

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) return flushNow();
//       if (!scheduled) {
//         scheduled = true;
//         queueMicrotask(flushNow);
//       }
//     };

//     const FLUSH_INTERVAL = setInterval(flushNow, 2500);

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev = []) =>
//           prev.map((p) =>
//             p.id === fileId
//               ? { ...p, processedKeywords: processed }
//               : p
//           )
//         );
//       });
//       try {
//         onProgress?.(
//           Math.round(
//             (processed / Math.max(1, total)) * 100
//           )
//         );
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
//       const { keywords } =
//         extractKeywordsFromWorkbookBufferWithUrls(buffer);

//       if (!keywords.length) {
//         ensureProject({
//           id: fileId,
//           fileName: file.name,
//           status: "error",
//           error: "No valid keywords found in the uploaded Excel file",
//         });
//         toast.error(
//           "No valid keywords found in the uploaded Excel file."
//         );
//         onProgress?.(100);
//         return;
//       }

//       const prefs = getFreshPrefs();
//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(
//             keywords,
//             size,
//             Math.max(1, Math.min(200, prefs.articleCount || 1))
//           )
//         : buildGroupsNormal(keywords, size);

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(
//         `Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article`
//       );

//       const cores = navigator.hardwareConcurrency ?? 4;
//       let concurrency = Math.min(
//         Math.max(2, Math.floor(cores / 2)),
//         6
//       );
//       const MAX = 8;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length) return;

//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];

//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => {
//           urlMap[g.keyword] = g.url ?? null;
//         });

//         const task = (async () => {
//           try {
//             const plan = buildPlanFromPrefs({
//               keywords: kws,
//               prefs,
//               variationId: groupIndex + 1,
//             });

//             const result = await withTimeout(
//               90_000,
//               generateJSONTitleHtml({
//                 keywords: kws,
//                 instructions: plan,
//                 titleLength: prefs.titleLength || 100,
//               }),
//               () =>
//                 createFallbackResult(
//                   kws,
//                   plan,
//                   prefs.titleLength || 100
//                 )
//             );

//             let html = String(result.html || "").trim();
//             if (!html) {
//               throw new Error("Empty html from model");
//             }

//             const tokenTargets = Math.min(4, kws.length);
//             for (let i = 0; i < tokenTargets; i++) {
//               html = injectTokenIntoNthSection(
//                 html,
//                 i,
//                 `[ANCHOR:${kws[i]}]`
//               );
//             }

//             const anchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));
//             html = applyAnchorTokens(html, anchors);
//             html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//             html = stripLegacyStubBullets(html);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: html,
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
//                 includeBoxesQuotesHighlights:
//                   prefs.includeBoxesQuotesHighlights,
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
//             failedCount++;
//             failedGroups.push({ index: groupIndex, grp });
//             console.warn("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => {
//           running.delete(task);
//         });

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(
//           1,
//           Math.min(Math.floor(concurrency), MAX)
//         );

//         while (running.size < cur && idx < baseGroups.length) {
//           startNext();
//         }

//         if (!running.size && idx >= baseGroups.length) {
//           break;
//         }

//         await Promise.race(Array.from(running));

//         if (
//           processedCount > 0 &&
//           failedCount > processedCount * 0.25 &&
//           concurrency > 2
//         ) {
//           concurrency -= 0.5;
//         } else if (
//           processedCount > 0 &&
//           failedCount < processedCount * 0.08 &&
//           concurrency < MAX
//         ) {
//           concurrency += 0.5;
//         }
//       }

//       // Retry failed groups (once), still with strict rules
//       if (failedGroups.length) {
//         toast.message(
//           `Retrying ${failedGroups.length} failed item(s)…`
//         );

//         const queue = [...failedGroups];
//         failedGroups.length = 0;

//         const RETRY_CONCURRENCY = 4;
//         const running2 = new Set<Promise<void>>();

//         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
//           const kws = grp.map((g) => g.keyword);
//           const urlMap: Record<string, string | null> = {};
//           grp.forEach((g) => {
//             urlMap[g.keyword] = g.url ?? null;
//           });

//           const plan = buildPlanFromPrefs({
//             keywords: kws,
//             prefs,
//             variationId: groupIndex + 1,
//           });

//           const res = await withTimeout(
//             90_000,
//             generateJSONTitleHtml({
//               keywords: kws,
//               instructions: plan,
//               titleLength: prefs.titleLength || 100,
//             }),
//             () =>
//               createFallbackResult(
//                 kws,
//                 plan,
//                 prefs.titleLength || 100
//               )
//           );

//           let html = String(res.html || "").trim();
//           if (!html) {
//             throw new Error("Empty html (retry)");
//           }

//           const tokenTargets = Math.min(4, kws.length);
//           for (let i = 0; i < tokenTargets; i++) {
//             html = injectTokenIntoNthSection(
//               html,
//               i,
//               `[ANCHOR:${kws[i]}]`
//             );
//           }

//           const anchors = Object.keys(urlMap).map((k) => ({
//             keyword: k,
//             url: urlMap[k] || undefined,
//           }));
//           html = applyAnchorTokens(html, anchors);
//           html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//           html = stripLegacyStubBullets(html);

//           const item: ContentItem = {
//             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
//             keyword: kws[0],
//             keywordsUsed: kws,
//             generatedContent: html,
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
//               includeBoxesQuotesHighlights:
//                 prefs.includeBoxesQuotesHighlights,
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
//           if (!queue.length) return;
//           const { grp, index } = queue.shift()!;
//           const p = (async () => {
//             try {
//               await runOne(grp, index);
//             } catch (e) {
//               console.warn("retry failed:", e);
//             }
//           })().finally(() => {
//             running2.delete(p);
//           });
//           running2.add(p);
//         };

//         while (running2.size < RETRY_CONCURRENCY && queue.length) {
//           startNextRetry();
//         }

//         while (running2.size || queue.length) {
//           await Promise.race(Array.from(running2));
//           while (running2.size < RETRY_CONCURRENCY && queue.length) {
//             startNextRetry();
//           }
//           await new Promise((r) => setTimeout(r, 80));
//         }
//       }

//       flushNow();

//       startTransition(() => {
//         setExcelProjects((prev = []) =>
//           prev.map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "completed",
//                   processedKeywords: baseGroups.length,
//                   failedCount,
//                 }
//               : p
//           )
//         );
//       });

//       const ok = baseGroups.length - failedCount;
//       toast.success(
//         `✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`
//       );
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       startTransition(() => {
//         setExcelProjects((prev = []) =>
//           prev.map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "error",
//                   error:
//                     error instanceof Error
//                       ? error.message
//                       : String(error),
//                 }
//               : p
//           )
//         );
//       });
//       toast.error(
//         `Failed processing ${file.name}: ${
//           error instanceof Error ? error.message : String(error)
//         }`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       clearInterval(FLUSH_INTERVAL);
//       flushNow();
//       setIsProcessing(false);
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) =>
//         prev.filter((p) => p.id !== projectId)
//       );
//       setContentItems((prev = []) =>
//         prev.filter((c) => c.fileId !== projectId)
//       );
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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



// // src/hooks/use-content-generation.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import {
//   generateJSONTitleHtml,
//   applyAnchorTokens,
// } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type {
//   ContentPreferences,
//   KeywordMode,
// } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * DEBUG LOGGING
//  * ──────────────────────────────────────────────────────────── */

// const GEN_DEBUG =
//   (import.meta as any).env?.VITE_GEN_DEBUG === "false"
//     ? false
//     : true; // default: ON

// function glog(...args: any[]) {
//   if (GEN_DEBUG) console.log("[GEN]", ...args);
// }
// function gwarn(...args: any[]) {
//   if (GEN_DEBUG) console.warn("[GEN]", ...args);
// }
// function gerror(...args: any[]) {
//   if (GEN_DEBUG) console.error("[GEN]", ...args);
// }

// /** ────────────────────────────────────────────────────────────
//  * Preferences loader
//  * ──────────────────────────────────────────────────────────── */

// const PREF_KEY = "content-preferences_v3";

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
//     const prefs: ContentPreferences = {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//       ...parsed,
//     };
//     glog("Loaded prefs from storage:", prefs);
//     return prefs;
//   } catch (e) {
//     gwarn("Failed to load prefs, using defaults.", e);
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//     };
//   }
// }

// /** ────────────────────────────────────────────────────────────
//  * Types
//  * ──────────────────────────────────────────────────────────── */

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (p: number) => void;

// /** ────────────────────────────────────────────────────────────
//  * Editor session helper
//  * ──────────────────────────────────────────────────────────── */

// const SESSION_KEY = "open-content-item_v1";

// export function openContentEditor(item: ContentItem) {
//   try {
//     const payload = JSON.stringify(item);
//     try {
//       sessionStorage.setItem(SESSION_KEY, payload);
//     } catch {
//       localStorage.setItem(`${SESSION_KEY}_fallback`, payload);
//     }
//     glog("Opening editor for item:", {
//       id: item.id,
//       keyword: item.keyword,
//       fileId: item.fileId,
//     });
//     const win = window.open("/content/editor", "_blank");
//     if (!win) {
//       toast.error(
//         "Popup blocked — allow popups to open the editor in a new tab."
//       );
//     }
//   } catch (e) {
//     gerror("Failed to open content editor, redirecting.", e);
//     try {
//       window.location.href = "/content/editor";
//     } catch {
//       // ignore
//     }
//   }
// }

// /** ────────────────────────────────────────────────────────────
//  * Excel parsing (keywords + optional URLs)
//  * ──────────────────────────────────────────────────────────── */

// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

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

// type KeywordRow = {
//   keyword: string;
//   url?: string | null;
// };

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
//     const nonEmpty = r.filter(
//       (c) => String(c ?? "").trim().length > 0
//     );
//     if (nonEmpty.length >= 1) {
//       headerRowIndex = i;
//       break;
//     }
//   }
//   if (headerRowIndex === -1) headerRowIndex = 0;

//   const headers = (rows[headerRowIndex] as unknown[]).map(norm);
//   let keywordCol = -1;
//   let urlCol = -1;

//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     // heuristic
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(
//       ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//       0
//     );
//     let bestCol = -1;
//     let bestScore = 0;

//     for (let c = 0; c < maxCols; c++) {
//       let score = 0;
//       let checks = 0;
//       for (const rr of lookahead) {
//         if (!Array.isArray(rr)) continue;
//         const s = sanitizeKeyword(rr[c]);
//         if (s) score++;
//         if (
//           rr[c] !== undefined &&
//           rr[c] !== null &&
//           String(rr[c]).trim() !== ""
//         ) {
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
//     if (bestCol !== -1) keywordCol = bestCol;
//   }

//   glog("Detected header config:", {
//     headerRowIndex,
//     keywordCol,
//     urlCol,
//     headerRow: rows[headerRowIndex],
//   });

//   return {
//     headerRowIndex,
//     keywordCol: keywordCol === -1 ? null : keywordCol,
//     urlCol: urlCol === -1 ? null : urlCol,
//   };
// }

// function extractKeywordsFromWorksheetWithUrls(
//   worksheet: XLSX.WorkSheet
// ): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
//     header: 1,
//     raw: true,
//   }) as unknown[][];

//   if (!rows || rows.length === 0) return [];

//   const { headerRowIndex, keywordCol, urlCol } =
//     detectHeaderRowAndColumns(rows);

//   const start = Math.min(rows.length - 1, headerRowIndex + 1);
//   const dataRows = rows.slice(start);
//   const maxCols = Math.max(
//     ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//     0
//   );

//   const out: KeywordRow[] = [];
//   const seen = new Set<string>();

//   for (const r of dataRows) {
//     if (!Array.isArray(r)) continue;

//     let k = "";
//     if (keywordCol != null) {
//       k = sanitizeKeyword(r[keywordCol]);
//     }

//     if (!k) {
//       // fallback: search any column
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
//       // nearby columns
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

//   glog("Extracted keywords from sheet:", {
//     count: out.length,
//     sample: out.slice(0, 10),
//   });

//   return out;
// }

// function extractKeywordsFromWorkbookBufferWithUrls(
//   buffer: ArrayBuffer | Uint8Array
// ) {
//   const workbook = XLSX.read(buffer, { type: "array" });
//   const sheetNames = workbook.SheetNames ?? [];
//   const combined: KeywordRow[] = [];
//   const seen = new Set<string>();

//   glog("Workbook sheets:", sheetNames);

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
//       gwarn("Sheet parse failed:", sheetName, e);
//     }
//   }

//   glog("Combined keywords:", {
//     total: combined.length,
//     sample: combined.slice(0, 20),
//   });

//   return { keywords: combined };
// }

// /** ────────────────────────────────────────────────────────────
//  * HTML helpers
//  * ──────────────────────────────────────────────────────────── */

// function stripLegacyStubBullets(html: string): string {
//   let out = html.replace(
//     /<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi,
//     ""
//   );
//   out = out.replace(
//     /<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi,
//     ""
//   );
//   out = out.replace(/<ul>\s*<\/ul>/gi, "");
//   out = out.replace(/<ol>\s*<\/ol>/gi, "");
//   return out;
// }

// function injectTokenIntoNthSection(
//   html: string,
//   sectionIndexZero: number,
//   token: string
// ): string {
//   const h2Regex = /<h2[^>]*>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   let idx = -1;
//   let lastEnd = 0;
//   const out: string[] = [];

//   while ((match = h2Regex.exec(html)) !== null) {
//     out.push(html.slice(lastEnd, match.index));
//     const h2 = match[0];
//     out.push(h2);
//     lastEnd = match.index + h2.length;
//     idx++;

//     if (idx === sectionIndexZero) {
//       const after = html.slice(lastEnd);
//       const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
//       if (!pMatch) {
//         out.push(after);
//         return out.join("");
//       }
//       const pHtml = pMatch[0];
//       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//       const words = inner.split(/\s+/);
//       if (words.length < 6) {
//         out.push(after);
//         return out.join("");
//       }
//       let insertAt = Math.max(3, Math.floor(words.length * 0.55));
//       if (insertAt > words.length - 4) {
//         insertAt = Math.max(3, words.length - 4);
//       }
//       const withToken =
//         "<p>" +
//         words.slice(0, insertAt).join(" ") +
//         " " +
//         token +
//         " " +
//         words.slice(insertAt).join(" ") +
//         "</p>";
//       const replaced = after.replace(pHtml, withToken);
//       out.push(replaced);
//       out.push(html.slice(match.index + h2.length + after.length));
//       return out.join("");
//     }
//   }

//   out.push(html.slice(lastEnd));
//   return out.join("");
// }

// /** ────────────────────────────────────────────────────────────
//  * Grouping helpers
//  * ──────────────────────────────────────────────────────────── */

// function buildGroupsNormal(
//   rows: KeywordRow[],
//   size: KeywordMode
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) {
//     groups.push(rows.slice(i, i + size));
//   }
//   glog("buildGroupsNormal:", {
//     size,
//     groups: groups.length,
//   });
//   return groups;
// }

// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0) return [];
//   if (!arr.length) return [];
//   if (size === 1) {
//     return [arr[Math.floor(Math.random() * arr.length)]];
//   }
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

// function buildGroupsCustom(
//   rows: KeywordRow[],
//   size: KeywordMode,
//   count: number
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) {
//     groups.push(sampleDistinct(rows, size));
//   }
//   glog("buildGroupsCustom:", {
//     size,
//     count,
//     groups: groups.length,
//   });
//   return groups;
// }

// /** ────────────────────────────────────────────────────────────
//  * Main hook
//  * ──────────────────────────────────────────────────────────── */

// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [contentItems, setContentItems] =
//     useLocalStorage<ContentItem[]>("content-items", []);

//   const [excelProjects, setExcelProjects] =
//     useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (
//     proj: Partial<ExcelProject> & { id: string; fileName: string }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status: (proj as any).status ?? "pending",
//           totalKeywords: (proj as any).totalKeywords ?? 0,
//           processedKeywords: (proj as any).processedKeywords ?? 0,
//           createdAt:
//             (proj as any).createdAt ?? new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount: (proj as any).failedCount ?? 0,
//         };
//         if (exists) {
//           return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//         }
//         return [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: GenerateProgressCallback
//   ) => {
//     glog("generateContent START", {
//       fileId,
//       fileName: file.name,
//       size: file.size,
//       type: file.type,
//     });

//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 40;

//     const flushNow = () => {
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       glog("Flushing content items:", {
//         count: toWrite.length,
//       });
//       startTransition(() => {
//         setContentItems((prev = []) => [...prev, ...toWrite]);
//       });
//       scheduled = false;
//     };

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) {
//         flushNow();
//         return;
//       }
//       if (!scheduled) {
//         scheduled = true;
//         queueMicrotask(flushNow);
//       }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev = []) =>
//           prev.map((p) =>
//             p.id === fileId
//               ? { ...p, processedKeywords: processed }
//               : p
//           )
//         );
//       });
//       const pct = Math.round(
//         (processed / Math.max(1, total)) * 100
//       );
//       glog("Progress:", { processed, total, pct });
//       try {
//         onProgress?.(pct);
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
//       glog("File loaded into buffer.");

//       const { keywords } =
//         extractKeywordsFromWorkbookBufferWithUrls(buffer);

//       if (!keywords.length) {
//         ensureProject({
//           id: fileId,
//           fileName: file.name,
//           status: "error",
//           error: "No valid keywords found in the uploaded Excel file",
//         });
//         toast.error(
//           "No valid keywords found in the uploaded Excel file."
//         );
//         onProgress?.(100);
//         setIsProcessing(false);
//         return;
//       }

//       const prefs = getFreshPrefs();
//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups =
//         prefs.customModeEnabled
//           ? buildGroupsCustom(
//               keywords,
//               size,
//               Math.max(
//                 1,
//                 Math.min(200, prefs.articleCount || 1)
//               )
//             )
//           : buildGroupsNormal(keywords, size);

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(
//         `Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article`
//       );
//       glog("Starting generation over groups:", {
//         groups: baseGroups.length,
//         prefs,
//       });

//       const cores = navigator.hardwareConcurrency ?? 4;
//       let concurrency = Math.min(Math.max(4, cores * 2), 16);
//       const MAX = 24;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length) return;

//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];
//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => {
//           urlMap[g.keyword] = g.url ?? null;
//         });

//         glog("Start group", groupIndex, {
//           keywords: kws,
//         });

//         const task = (async () => {
//           try {
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

//             let html = String(result.html || "").trim();
//             if (!html) {
//               throw new Error("Empty html from model");
//             }

//             // Insert anchor tokens in top sections
//             const tokenTargets = Math.min(4, kws.length);
//             for (let i = 0; i < tokenTargets; i++) {
//               html = injectTokenIntoNthSection(
//                 html,
//                 i,
//                 `[ANCHOR:${kws[i]}]`
//               );
//             }

//             // Apply anchors
//             const anchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));
//             html = applyAnchorTokens(html, anchors);
//             html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//             html = stripLegacyStubBullets(html);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: html,
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
//                 includeBoxesQuotesHighlights:
//                   prefs.includeBoxesQuotesHighlights,
//                 includeQandA: prefs.includeQandA,
//                 totalContentWords: prefs.totalContentWords,
//                 titleLength: prefs.titleLength,
//                 brandDomainEnabled: prefs.brandDomainEnabled,
//                 brandDomain: prefs.brandDomain,
//               },
//             };

//             glog("Group success", {
//               groupIndex,
//               title: result.title,
//             });

//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e: any) {
//             failedCount++;
//             failedGroups.push({ index: groupIndex, grp });
//             gerror("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => {
//           running.delete(task);
//         });

//         running.add(task);
//       };

//       // Main loop
//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(
//           2,
//           Math.min(Math.floor(concurrency), MAX)
//         );

//         while (running.size < cur && idx < baseGroups.length) {
//           startNext();
//         }

//         if (!running.size && idx >= baseGroups.length) {
//           break;
//         }

//         await Promise.race(Array.from(running));

//         // Dynamic concurrency tuning
//         if (failedCount > processedCount * 0.25 && concurrency > 4) {
//           concurrency -= 0.5;
//           gwarn(
//             "High failure rate, reducing concurrency:",
//             concurrency
//           );
//         } else if (
//           concurrency < MAX &&
//           failedCount < processedCount * 0.08
//         ) {
//           concurrency += 0.5;
//           glog("Low failure rate, increasing concurrency:", concurrency);
//         }
//       }

//       // Retry failed groups (once)
//       if (failedGroups.length) {
//         toast.message(
//           `Retrying ${failedGroups.length} failed item(s)…`
//         );
//         glog("Retrying failed groups:", failedGroups.length);

//         const queue = [...failedGroups];
//         failedGroups.length = 0;

//         const RETRY_CONCURRENCY = 4;
//         const running2 = new Set<Promise<void>>();

//         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
//           const kws = grp.map((g) => g.keyword);
//           const urlMap: Record<string, string | null> = {};
//           grp.forEach((g) => {
//             urlMap[g.keyword] = g.url ?? null;
//           });

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

//           let html = String(res.html || "").trim();
//           if (!html) throw new Error("Empty html (retry)");

//           const tokenTargets = Math.min(4, kws.length);
//           for (let i = 0; i < tokenTargets; i++) {
//             html = injectTokenIntoNthSection(
//               html,
//               i,
//               `[ANCHOR:${kws[i]}]`
//             );
//           }

//           const anchors = Object.keys(urlMap).map((k) => ({
//             keyword: k,
//             url: urlMap[k] || undefined,
//           }));
//           html = applyAnchorTokens(html, anchors);
//           html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//           html = stripLegacyStubBullets(html);

//           const item: ContentItem = {
//             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
//             keyword: kws[0],
//             keywordsUsed: kws,
//             generatedContent: html,
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
//               includeBoxesQuotesHighlights:
//                 prefs.includeBoxesQuotesHighlights,
//               includeQandA: prefs.includeQandA,
//               totalContentWords: prefs.totalContentWords,
//               titleLength: prefs.titleLength,
//               brandDomainEnabled: prefs.brandDomainEnabled,
//               brandDomain: prefs.brandDomain,
//             },
//           };

//           glog("Retry group success", {
//             groupIndex,
//             title: res.title,
//           });

//           bufferItems.push(item);
//           scheduleFlush();
//         };

//         const startNextRetry = () => {
//           if (!queue.length) return;
//           const { grp, index } = queue.shift()!;
//           const p = (async () => {
//             try {
//               await runOne(grp, index);
//             } catch (e) {
//               gerror("retry failed:", e);
//             }
//           })().finally(() => running2.delete(p));
//           running2.add(p);
//         };

//         while (
//           running2.size < RETRY_CONCURRENCY &&
//           queue.length
//         ) {
//           startNextRetry();
//         }

//         while (running2.size || queue.length) {
//           await Promise.race(Array.from(running2));
//           while (
//             running2.size < RETRY_CONCURRENCY &&
//             queue.length
//           ) {
//             startNextRetry();
//           }
//           await new Promise((r) => setTimeout(r, 80));
//         }
//       }

//       flushNow();

//       startTransition(() => {
//         setExcelProjects((prev = []) =>
//           prev.map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "completed",
//                   processedKeywords: baseGroups.length,
//                   failedCount,
//                 }
//               : p
//           )
//         );
//       });

//       const ok = baseGroups.length - failedCount;
//       glog("generateContent DONE", {
//         ok,
//         failedCount,
//         total: baseGroups.length,
//       });

//       toast.success(
//         `Finished ${file.name}: ${ok} articles • ${failedCount} failed`
//       );
//       onProgress?.(100);
//     } catch (error: any) {
//       gerror("generateContent overall error:", error);

//       startTransition(() => {
//         setExcelProjects((prev = []) =>
//           prev.map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "error",
//                   error:
//                     error instanceof Error
//                       ? error.message
//                       : String(error),
//                 }
//               : p
//           )
//         );
//       });

//       toast.error(
//         `Failed processing ${file.name}: ${
//           error instanceof Error ? error.message : String(error)
//         }`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//       glog("generateContent FINALLY: isProcessing=false");
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     glog("deleteProject", projectId);
//     startTransition(() => {
//       setExcelProjects((prev = []) =>
//         prev.filter((p) => p.id !== projectId)
//       );
//       setContentItems((prev = []) =>
//         prev.filter((c) => c.fileId !== projectId)
//       );
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     glog("deleteAllProjects");
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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






  // // src/hooks/use-content-generation.ts
  // import { useState, startTransition } from "react";
  // import { toast } from "sonner";
  // import { useLocalStorage } from "@/hooks/use-local-storage";
  // import * as XLSX from "xlsx";
  // import {
  //   generateJSONTitleHtml,
  //   applyAnchorTokens,
  // } from "@/lib/llm/api";
  // import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
  // import type {
  //   ContentPreferences,
  //   KeywordMode,
  // } from "@/hooks/use-preferences";

  // /** ────────────────────────────────────────────────────────────
  //  * Logging
  //  * ──────────────────────────────────────────────────────────── */
  // const GL = "[GEN]";
  // const glog = (...a: any[]) => console.log(GL, ...a);
  // const gwarn = (...a: any[]) => console.warn(GL, ...a);
  // const gerr = (...a: any[]) => console.error(GL, ...a);

  // /** ────────────────────────────────────────────────────────────
  //  * Preferences loader
  //  * ──────────────────────────────────────────────────────────── */

  // const PREF_KEY = "content-preferences_v3";

  // function getFreshPrefs(): ContentPreferences {
  //   try {
  //     const raw = localStorage.getItem(PREF_KEY);
  //     const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
  //     return {
  //       keywordMode: 1,
  //       targetWords: 500,
  //       extraInstructions: "",
  //       mood: "Informative",
  //       paragraphWords: 100,
  //       includeConclusion: true,
  //       customModeEnabled: false,
  //       articleCount: 1,
  //       language: "English (UK)",
  //       totalContentWords: 800,
  //       titleLength: 100,
  //       includeBulletPoints: false,
  //       includeTables: false,
  //       includeEmojis: false,
  //       includeBoxesQuotesHighlights: false,
  //       includeQandA: false,
  //       brandDomainEnabled: false,
  //       brandDomain: "",
  //       ...parsed,
  //     };
  //   } catch {
  //     return {
  //       keywordMode: 1,
  //       targetWords: 500,
  //       extraInstructions: "",
  //       mood: "Informative",
  //       paragraphWords: 100,
  //       includeConclusion: true,
  //       customModeEnabled: false,
  //       articleCount: 1,
  //       language: "English (UK)",
  //       totalContentWords: 800,
  //       titleLength: 100,
  //       includeBulletPoints: false,
  //       includeTables: false,
  //       includeEmojis: false,
  //       includeBoxesQuotesHighlights: false,
  //       includeQandA: false,
  //       brandDomainEnabled: false,
  //       brandDomain: "",
  //     };
  //   }
  // }

  // /** ────────────────────────────────────────────────────────────
  //  * Types
  //  * ──────────────────────────────────────────────────────────── */

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

  // interface ExcelProject {
  //   id: string;
  //   fileName: string;
  //   status: "pending" | "processing" | "completed" | "error";
  //   totalKeywords: number;
  //   processedKeywords: number;
  //   createdAt: string;
  //   error?: string;
  //   failedCount?: number;
  // }

  // type GenerateProgressCallback = (p: number) => void;

  // /** ────────────────────────────────────────────────────────────
  //  * Editor session helper
  //  * ──────────────────────────────────────────────────────────── */

  // const SESSION_KEY = "open-content-item_v1";

  // export function openContentEditor(item: ContentItem) {
  //   try {
  //     try {
  //       sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
  //     } catch {
  //       localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item));
  //     }
  //     const win = window.open("/content/editor", "_blank");
  //     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
  //   } catch {
  //     try {
  //       window.location.href = "/content/editor";
  //     } catch {
  //       // ignore
  //     }
  //   }
  // }

  // /** ────────────────────────────────────────────────────────────
  //  * Excel parsing (keywords + optional URLs)
  //  * ──────────────────────────────────────────────────────────── */

  // function norm(s: unknown) {
  //   return String(s ?? "")
  //     .toLowerCase()
  //     .replace(/[.\-_/]/g, " ")
  //     .replace(/\s+/g, " ")
  //     .trim();
  // }

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

  // type KeywordRow = { keyword: string; url?: string | null };

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

  //   let keywordCol = -1;
  //   let urlCol = -1;

  //   headers.forEach((h, idx) => {
  //     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
  //     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
  //   });

  //   if (keywordCol === -1) {
  //     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
  //     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
  //     let bestCol = -1;
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
  //     if (bestCol !== -1) keywordCol = bestCol;
  //   }

  //   return {
  //     headerRowIndex,
  //     keywordCol: keywordCol === -1 ? null : keywordCol,
  //     urlCol: urlCol === -1 ? null : urlCol,
  //   };
  // }

  // function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
  //   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
  //   if (!rows || rows.length === 0) return [];

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

  // /** ────────────────────────────────────────────────────────────
  //  * Small HTML helpers
  //  * ──────────────────────────────────────────────────────────── */

  // function stripLegacyStubBullets(html: string): string {
  //   let out = html.replace(/<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi, "");
  //   out = out.replace(/<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi, "");
  //   out = out.replace(/<ul>\s*<\/ul>/gi, "");
  //   out = out.replace(/<ol>\s*<\/ol>/gi, "");
  //   return out;
  // }

  // function injectTokenIntoNthSection(html: string, sectionIndexZero: number, token: string): string {
  //   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
  //   let match: RegExpExecArray | null;
  //   let idx = -1;
  //   let lastEnd = 0;
  //   const out: string[] = [];

  //   while ((match = h2Regex.exec(html)) !== null) {
  //     out.push(html.slice(lastEnd, match.index));
  //     const h2 = match[0];
  //     out.push(h2);
  //     lastEnd = match.index + h2.length;
  //     idx++;

  //     if (idx === sectionIndexZero) {
  //       const after = html.slice(lastEnd);
  //       const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
  //       if (!pMatch) {
  //         out.push(after);
  //         return out.join("");
  //       }
  //       const pHtml = pMatch[0];
  //       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
  //       const words = inner.split(/\s+/);
  //       if (words.length < 6) {
  //         out.push(after);
  //         return out.join("");
  //       }
  //       let insertAt = Math.max(3, Math.floor(words.length * 0.55));
  //       if (insertAt > words.length - 4) insertAt = Math.max(3, words.length - 4);
  //       const withToken =
  //         "<p>" +
  //         words.slice(0, insertAt).join(" ") +
  //         " " +
  //         token +
  //         " " +
  //         words.slice(insertAt).join(" ") +
  //         "</p>";
  //       const replaced = after.replace(pHtml, withToken);
  //       out.push(replaced);
  //       out.push(html.slice(match.index + h2.length + after.length));
  //       return out.join("");
  //     }
  //   }

  //   out.push(html.slice(lastEnd));
  //   return out.join("");
  // }

  // /** ────────────────────────────────────────────────────────────
  //  * Main hook
  //  * ──────────────────────────────────────────────────────────── */

  // export function useContentGeneration() {
  //   const [isProcessing, setIsProcessing] = useState(false);

  //   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>(
  //     "content-items",
  //     []
  //   );
  //   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>(
  //     "excel-projects",
  //     []
  //   );

  //   const ensureProject = (
  //     proj: Partial<ExcelProject> & { id: string; fileName: string }
  //   ) => {
  //     startTransition(() => {
  //       setExcelProjects((prev = []) => {
  //         const exists = prev.some((p) => p.id === proj.id);
  //         const base: ExcelProject = {
  //           id: proj.id,
  //           fileName: proj.fileName,
  //           status: (proj as any).status ?? "pending",
  //           totalKeywords: (proj as any).totalKeywords ?? 0,
  //           processedKeywords: (proj as any).processedKeywords ?? 0,
  //           createdAt: (proj as any).createdAt ?? new Date().toISOString(),
  //           error: (proj as any).error,
  //           failedCount: (proj as any).failedCount ?? 0,
  //         };
  //         return exists ? prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p)) : [...prev, base];
  //       });
  //     });
  //   };

  //   const generateContent = async (
  //     file: File,
  //     fileId: string,
  //     onProgress?: GenerateProgressCallback
  //   ) => {
  //     setIsProcessing(true);
  //     onProgress?.(0);

  //     ensureProject({
  //       id: fileId,
  //       fileName: file.name,
  //       status: "pending",
  //       totalKeywords: 0,
  //       processedKeywords: 0,
  //       failedCount: 0,
  //     });

  //     const bufferItems: ContentItem[] = [];
  //     let scheduled = false;
  //     const BATCH_SIZE = 80;

  //     const flushNow = () => {
  //       scheduled = false;
  //       if (!bufferItems.length) return;
  //       const toWrite = bufferItems.splice(0, bufferItems.length);
  //       glog("Flushing content items:", { count: toWrite.length });
  //       startTransition(() => {
  //         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
  //       });
  //     };

  //     const scheduleFlush = () => {
  //       if (bufferItems.length >= BATCH_SIZE) return flushNow();
  //       if (!scheduled) {
  //         scheduled = true;
  //         queueMicrotask(flushNow);
  //       }
  //     };

  //     let failedCount = 0;
  //     let processedCount = 0;
  //     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

  //     const updateProgress = (processed: number, total: number) => {
  //       startTransition(() => {
  //         setExcelProjects((prev) =>
  //           (prev ?? []).map((p) =>
  //             p.id === fileId ? { ...p, processedKeywords: processed } : p
  //           )
  //         );
  //       });
  //       try {
  //         const pct = Math.round((processed / Math.max(1, total)) * 100);
  //         glog("Progress:", { processed, total, pct });
  //         onProgress?.(pct);
  //       } catch {
  //         // ignore
  //       }
  //     };

  //     try {
  //       const buffer = await file.arrayBuffer();
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

  //       const prefs = getFreshPrefs();
  //       const size = (prefs.keywordMode ?? 1) as KeywordMode;

  //       const baseGroups = prefs.customModeEnabled
  //         ? buildGroupsCustom(
  //             keywords,
  //             size,
  //             Math.max(1, Math.min(200, prefs.articleCount || 1))
  //           )
  //         : buildGroupsNormal(keywords, size);

  //       ensureProject({
  //         id: fileId,
  //         fileName: file.name,
  //         status: "processing",
  //         totalKeywords: baseGroups.length,
  //         processedKeywords: 0,
  //         failedCount: 0,
  //       });

  //       toast.info(`Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article)`);

  //       const cores = navigator.hardwareConcurrency ?? 4;
  //       let concurrency = Math.min(Math.max(8, cores * 2), 24);
  //       const MAX = 36;

  //       let idx = 0;
  //       const running = new Set<Promise<void>>();

  //       const startNext = () => {
  //         if (idx >= baseGroups.length) return;

  //         const groupIndex = idx++;
  //         const grp = baseGroups[groupIndex];

  //         const kws = grp.map((g) => g.keyword);
  //         const urlMap: Record<string, string | null> = {};
  //         grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

  //         const task = (async () => {
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

  //             let html = String(result.html || "").trim();
  //             if (!html) throw new Error("Empty html from model");

  //             // Inject anchor tokens early
  //             const tokenTargets = Math.min(4, kws.length);
  //             for (let i = 0; i < tokenTargets; i++) {
  //               html = injectTokenIntoNthSection(html, i, `[ANCHOR:${kws[i]}]`);
  //             }

  //             // Apply URLs for all used keywords
  //             const anchors = Object.keys(urlMap).map((k) => ({
  //               keyword: k,
  //               url: urlMap[k] || undefined,
  //             }));
  //             html = applyAnchorTokens(html, anchors);

  //             // Clean leftover tokens
  //             html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");

  //             // Remove any legacy stub bullets
  //             html = stripLegacyStubBullets(html);

  //             const item: ContentItem = {
  //               id: `${fileId}-${groupIndex}-${Date.now()}`,
  //               keyword: kws[0],
  //               keywordsUsed: kws,
  //               generatedContent: html,
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

  //             glog("Group success", { groupIndex, title: result.title });
  //             bufferItems.push(item);
  //             scheduleFlush();
  //           } catch (e) {
  //             failedCount++;
  //             failedGroups.push({ index: groupIndex, grp });
  //             gerr("group generate error:", e);
  //           } finally {
  //             processedCount += 1;
  //             updateProgress(processedCount, baseGroups.length);
  //           }
  //         })().finally(() => running.delete(task));

  //         running.add(task);
  //       };

  //       while (idx < baseGroups.length || running.size > 0) {
  //         const cur = Math.max(8, Math.min(Math.floor(concurrency), MAX));
  //         while (running.size < cur && idx < baseGroups.length) startNext();
  //         if (!running.size && idx >= baseGroups.length) break;

  //         await Promise.race(Array.from(running));

  //         if (failedCount > processedCount * 0.25 && concurrency > 8) {
  //           concurrency -= 0.5;
  //           gwarn("High failure rate, reducing concurrency:", concurrency);
  //         } else if (concurrency < MAX && failedCount < processedCount * 0.08) {
  //           concurrency += 0.75;
  //           glog("Low failure rate, increasing concurrency:", concurrency);
  //         }
  //       }

  //       // Retry failed once (optional)
  //       if (failedGroups.length) {
  //         toast.message(`Retrying ${failedGroups.length} failed item(s)…`);

  //         const queue = [...failedGroups];
  //         failedGroups.length = 0;

  //         const RETRY_CONCURRENCY = 6;
  //         const running2 = new Set<Promise<void>>();

  //         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
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

  //           let html = String(res.html || "").trim();
  //           if (!html) throw new Error("Empty html (retry)");

  //           const tokenTargets = Math.min(4, kws.length);
  //           for (let i = 0; i < tokenTargets; i++) {
  //             html = injectTokenIntoNthSection(html, i, `[ANCHOR:${kws[i]}]`);
  //           }

  //           const anchors = Object.keys(urlMap).map((k) => ({
  //             keyword: k,
  //             url: urlMap[k] || undefined,
  //           }));
  //           html = applyAnchorTokens(html, anchors);
  //           html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
  //           html = stripLegacyStubBullets(html);

  //           const item: ContentItem = {
  //             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
  //             keyword: kws[0],
  //             keywordsUsed: kws,
  //             generatedContent: html,
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

  //         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
  //         while (running2.size || queue.length) {
  //           await Promise.race(Array.from(running2));
  //           while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
  //           await new Promise((r) => setTimeout(r, 80));
  //         }
  //       }

  //       flushNow();

  //       startTransition(() => {
  //         setExcelProjects((prev) =>
  //           (prev ?? []).map((p) =>
  //             p.id === fileId
  //               ? {
  //                   ...p,
  //                   status: "completed",
  //                   processedKeywords: baseGroups.length,
  //                   failedCount,
  //                 }
  //               : p
  //           )
  //         );
  //       });

  //       const ok = baseGroups.length - failedCount;
  //       glog("generateContent DONE", { ok, failedCount, total: baseGroups.length });
  //       toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
  //       onProgress?.(100);
  //     } catch (error) {
  //       gerr("generateContent overall error:", error);
  //       startTransition(() => {
  //         setExcelProjects((prev) =>
  //           (prev ?? []).map((p) =>
  //             p.id === fileId
  //               ? {
  //                   ...p,
  //                   status: "error",
  //                   error: error instanceof Error ? error.message : String(error),
  //                 }
  //               : p
  //           )
  //         );
  //       });
  //       toast.error(
  //         `Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`
  //       );
  //       onProgress?.(100);
  //       throw error;
  //     } finally {
  //       flushNow();
  //       setIsProcessing(false);
  //       glog("generateContent FINALLY: isProcessing=false");
  //     }
  //   };

  //   const deleteProject = (projectId: string) => {
  //     startTransition(() => {
  //       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
  //       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
  //     });
  //     toast.success("Project deleted");
  //   };

  //   const deleteAllProjects = () => {
  //     startTransition(() => {
  //       setExcelProjects([]);
  //       setContentItems([]);
  //     });
  //     toast.success("All projects cleared");
  //   };

  //   return {
  //     generateContent,
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

  // /** ────────────────────────────────────────────────────────────
  //  * Grouping helpers
  //  * ──────────────────────────────────────────────────────────── */

  // function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
  //   const groups: KeywordRow[][] = [];
  //   for (let i = 0; i < rows.length; i += size) groups.push(rows.slice(i, i + size));
  //   return groups;
  // }

  // function sampleDistinct<T>(arr: T[], size: number): T[] {
  //   if (size <= 0) return [];
  //   if (!arr.length) return [];
  //   if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
  //   const taken = new Set<number>();
  //   while (taken.size < Math.min(size, arr.length)) {
  //     taken.add(Math.floor(Math.random() * arr.length));
  //   }
  //   const out = Array.from(taken).map((i) => arr[i]);
  //   while (out.length < size) out.push(arr[Math.floor(Math.random() * arr.length)]);
  //   return out;
  // }

  // function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
  //   const groups: KeywordRow[][] = [];
  //   for (let i = 0; i < count; i++) groups.push(sampleDistinct(rows, size));
  //   return groups;
  // }






//   // src/hooks/use-content-generation.ts
// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import {
//   generateJSONTitleHtml,
//   applyAnchorTokens,
// } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type {
//   ContentPreferences,
//   KeywordMode,
// } from "@/hooks/use-preferences";

// /** ────────────────────────────────────────────────────────────
//  * Logging
//  * ──────────────────────────────────────────────────────────── */
// const GL = "[GEN]";
// const glog = (...a: any[]) => console.log(GL, ...a);
// const gwarn = (...a: any[]) => console.warn(GL, ...a);
// const gerr = (...a: any[]) => console.error(GL, ...a);

// /** ────────────────────────────────────────────────────────────
//  * Preferences loader
//  * ──────────────────────────────────────────────────────────── */

// const PREF_KEY = "content-preferences_v3";

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//       ...parsed,
//     };
//   } catch {
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//     };
//   }
// }

// /** ────────────────────────────────────────────────────────────
//  * Types
//  * ──────────────────────────────────────────────────────────── */

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (p: number) => void;

// /** ────────────────────────────────────────────────────────────
//  * Editor session helper
//  * ──────────────────────────────────────────────────────────── */

// const SESSION_KEY = "open-content-item_v1";

// export function openContentEditor(item: ContentItem) {
//   try {
//     try {
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
//     } catch {
//       localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item));
//     }
//     const win = window.open("/content/editor", "_blank");
//     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
//   } catch {
//     try {
//       window.location.href = "/content/editor";
//     } catch {
//       // ignore
//     }
//   }
// }

// /** ────────────────────────────────────────────────────────────
//  * Excel parsing (keywords + optional URLs)
//  * ──────────────────────────────────────────────────────────── */

// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

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

// type KeywordRow = { keyword: string; url?: string | null };

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

//   let keywordCol = -1;
//   let urlCol = -1;

//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//     let bestCol = -1;
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
//     if (bestCol !== -1) keywordCol = bestCol;
//   }

//   return {
//     headerRowIndex,
//     keywordCol: keywordCol === -1 ? null : keywordCol,
//     urlCol: urlCol === -1 ? null : urlCol,
//   };
// }

// function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

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

// /** ────────────────────────────────────────────────────────────
//  * Small HTML helpers
//  * ──────────────────────────────────────────────────────────── */

// function stripLegacyStubBullets(html: string): string {
//   let out = html.replace(/<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi, "");
//   out = out.replace(/<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi, "");
//   out = out.replace(/<ul>\s*<\/ul>/gi, "");
//   out = out.replace(/<ol>\s*<\/ol>/gi, "");
//   return out;
// }

// function injectTokenIntoNthSection(html: string, sectionIndexZero: number, token: string): string {
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   let idx = -1;
//   let lastEnd = 0;
//   const out: string[] = [];

//   while ((match = h2Regex.exec(html)) !== null) {
//     out.push(html.slice(lastEnd, match.index));
//     const h2 = match[0];
//     out.push(h2);
//     lastEnd = match.index + h2.length;
//     idx++;

//     if (idx === sectionIndexZero) {
//       const after = html.slice(lastEnd);
//       const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
//       if (!pMatch) {
//         out.push(after);
//         return out.join("");
//       }
//       const pHtml = pMatch[0];
//       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//       const words = inner.split(/\s+/);
//       if (words.length < 6) {
//         out.push(after);
//         return out.join("");
//       }
//       let insertAt = Math.max(3, Math.floor(words.length * 0.55));
//       if (insertAt > words.length - 4) insertAt = Math.max(3, words.length - 4);
//       const withToken =
//         "<p>" +
//         words.slice(0, insertAt).join(" ") +
//         " " +
//         token +
//         " " +
//         words.slice(insertAt).join(" ") +
//         "</p>";
//       const replaced = after.replace(pHtml, withToken);
//       out.push(replaced);
//       out.push(html.slice(match.index + h2.length + after.length));
//       return out.join("");
//     }
//   }

//   out.push(html.slice(lastEnd));
//   return out.join("");
// }

// /** ────────────────────────────────────────────────────────────
//  * Main hook
//  * ──────────────────────────────────────────────────────────── */

// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>(
//     "content-items",
//     []
//   );
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>(
//     "excel-projects",
//     []
//   );

//   const ensureProject = (
//     proj: Partial<ExcelProject> & { id: string; fileName: string }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status: (proj as any).status ?? "pending",
//           totalKeywords: (proj as any).totalKeywords ?? 0,
//           processedKeywords: (proj as any).processedKeywords ?? 0,
//           createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount: (proj as any).failedCount ?? 0,
//         };
//         return exists ? prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p)) : [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: GenerateProgressCallback
//   ) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 80;

//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       glog("Flushing content items:", { count: toWrite.length });
//       startTransition(() => {
//         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//       });
//     };

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) return flushNow();
//       if (!scheduled) {
//         scheduled = true;
//         queueMicrotask(flushNow);
//       }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId ? { ...p, processedKeywords: processed } : p
//           )
//         );
//       });
//       try {
//         const pct = Math.round((processed / Math.max(1, total)) * 100);
//         glog("Progress:", { processed, total, pct });
//         onProgress?.(pct);
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
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

//       const prefs = getFreshPrefs();
//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(
//             keywords,
//             size,
//             Math.max(1, Math.min(200, prefs.articleCount || 1))
//           )
//         : buildGroupsNormal(keywords, size);

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(`Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article)`);

//       const cores = navigator.hardwareConcurrency ?? 4;
//       let concurrency = Math.min(Math.max(8, cores * 2), 24);
//       const MAX = 36;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length) return;

//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];

//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

//         const task = (async () => {
//           try {
//             glog("Starting group", { groupIndex, keywords: kws });

//             // Build a detailed plan for the LLM (we pass it inside prefsSnapshot so the API includes it verbatim)
//             const plan = buildPlanFromPrefs({
//               keywords: kws,
//               prefs,
//               variationId: groupIndex + 1,
//             });

//             // Extend prefs snapshot with multi-keyword context
//             const prefsSnapshotForLLM: Partial<ContentPreferences> & {
//               secondaryKeywords?: string[];
//               plan?: unknown;
//             } = {
//               ...prefs,
//               secondaryKeywords: kws.slice(1),
//               plan,
//             };

//             // ✅ Call the OpenAI Responses API wrapper with the correct shape
//             const result = await generateJSONTitleHtml({
//               keyword: kws[0], // primary keyword
//               prefsSnapshot: prefsSnapshotForLLM,
//               urlMap,
//               targetUrl: urlMap[kws[0]] ?? null,
//             });

//             let html = String(result.html || "").trim();
//             if (!html) throw new Error("Empty html from model");

//             // Inject anchor tokens early
//             const tokenTargets = Math.min(4, kws.length);
//             for (let i = 0; i < tokenTargets; i++) {
//               html = injectTokenIntoNthSection(html, i, `[ANCHOR:${kws[i]}]`);
//             }

//             // ✅ Apply URLs using the updated API signature (Record<string, string|null>)
//             html = applyAnchorTokens(html, urlMap);

//             // Clean leftover tokens
//             html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");

//             // Remove any legacy stub bullets
//             html = stripLegacyStubBullets(html);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: html,
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

//             glog("Group success", { groupIndex, title: result.title });
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             failedGroups.push({ index: groupIndex, grp });
//             gerr("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(8, Math.min(Math.floor(concurrency), MAX));
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;

//         await Promise.race(Array.from(running));

//         if (failedCount > processedCount * 0.25 && concurrency > 8) {
//           concurrency -= 0.5;
//           gwarn("High failure rate, reducing concurrency:", concurrency);
//         } else if (concurrency < MAX && failedCount < processedCount * 0.08) {
//           concurrency += 0.75;
//           glog("Low failure rate, increasing concurrency:", concurrency);
//         }
//       }

//       // Retry failed once (optional)
//       if (failedGroups.length) {
//         toast.message(`Retrying ${failedGroups.length} failed item(s)…`);

//         const queue = [...failedGroups];
//         failedGroups.length = 0;

//         const RETRY_CONCURRENCY = 6;
//         const running2 = new Set<Promise<void>>();

//         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
//           const kws = grp.map((g) => g.keyword);
//           const urlMap: Record<string, string | null> = {};
//           grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

//           const plan = buildPlanFromPrefs({
//             keywords: kws,
//             prefs,
//             variationId: groupIndex + 1,
//           });

//           const prefsSnapshotForLLM: Partial<ContentPreferences> & {
//             secondaryKeywords?: string[];
//             plan?: unknown;
//           } = {
//             ...prefs,
//             secondaryKeywords: kws.slice(1),
//             plan,
//           };

//           const res = await generateJSONTitleHtml({
//             keyword: kws[0],
//             prefsSnapshot: prefsSnapshotForLLM,
//             urlMap,
//             targetUrl: urlMap[kws[0]] ?? null,
//           });

//           let html = String(res.html || "").trim();
//           if (!html) throw new Error("Empty html (retry)");

//           const tokenTargets = Math.min(4, kws.length);
//           for (let i = 0; i < tokenTargets; i++) {
//             html = injectTokenIntoNthSection(html, i, `[ANCHOR:${kws[i]}]`);
//           }

//           html = applyAnchorTokens(html, urlMap);
//           html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//           html = stripLegacyStubBullets(html);

//           const item: ContentItem = {
//             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
//             keyword: kws[0],
//             keywordsUsed: kws,
//             generatedContent: html,
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

//         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//         while (running2.size || queue.length) {
//           await Promise.race(Array.from(running2));
//           while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//           await new Promise((r) => setTimeout(r, 80));
//         }
//       }

//       flushNow();

//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "completed",
//                   processedKeywords: baseGroups.length,
//                   failedCount,
//                 }
//               : p
//           )
//         );
//       });

//       const ok = baseGroups.length - failedCount;
//       glog("generateContent DONE", { ok, failedCount, total: baseGroups.length });
//       toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
//       onProgress?.(100);
//     } catch (error) {
//       gerr("generateContent overall error:", error);
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "error",
//                   error: error instanceof Error ? error.message : String(error),
//                 }
//               : p
//           )
//         );
//       });
//       toast.error(
//         `Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//       glog("generateContent FINALLY: isProcessing=false");
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
//       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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

// /** ────────────────────────────────────────────────────────────
//  * Grouping helpers
//  * ──────────────────────────────────────────────────────────── */

// function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) groups.push(rows.slice(i, i + size));
//   return groups;
// }

// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0) return [];
//   if (!arr.length) return [];
//   if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
//   const taken = new Set<number>();
//   while (taken.size < Math.min(size, arr.length)) {
//     taken.add(Math.floor(Math.random() * arr.length));
//   }
//   const out = Array.from(taken).map((i) => arr[i]);
//   while (out.length < size) out.push(arr[Math.floor(Math.random() * arr.length)]);
//   return out;
// }

// function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) groups.push(sampleDistinct(rows, size));
//   return groups;
// }



// // src/hooks/use-content-generation.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /** Logging */

// const GL = "[GEN]";
// const glog = (...a: any[]) => console.log(GL, ...a);
// const gwarn = (...a: any[]) => console.warn(GL, ...a);
// const gerr = (...a: any[]) => console.error(GL, ...a);

// /** Preferences loader */

// const PREF_KEY = "content-preferences_v3";

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//       ...parsed,
//     };
//   } catch {
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//     };
//   }
// }

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (p: number) => void;

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

// /** Excel parsing (keywords + optional URLs) */

// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

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

// type KeywordRow = { keyword: string; url?: string | null };

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

//   let keywordCol = -1;
//   let urlCol = -1;

//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(
//       ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//       0
//     );
//     let bestCol = -1;
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
//     if (bestCol !== -1) keywordCol = bestCol;
//   }

//   return {
//     headerRowIndex,
//     keywordCol: keywordCol === -1 ? null : keywordCol,
//     urlCol: urlCol === -1 ? null : urlCol,
//   };
// }

// function extractKeywordsFromWorksheetWithUrls(
//   worksheet: XLSX.WorkSheet
// ): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
//     header: 1,
//     raw: true,
//   }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

//   const { headerRowIndex, keywordCol, urlCol } = detectHeaderRowAndColumns(rows);

//   const start = Math.min(rows.length - 1, headerRowIndex + 1);
//   const dataRows = rows.slice(start);
//   const maxCols = Math.max(
//     ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//     0
//   );

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

// function extractKeywordsFromWorkbookBufferWithUrls(
//   buffer: ArrayBuffer | Uint8Array
// ) {
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

// /** Small HTML helpers */

// function stripLegacyStubBullets(html: string): string {
//   let out = html.replace(
//     /<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi,
//     ""
//   );
//   out = out.replace(
//     /<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi,
//     ""
//   );
//   out = out.replace(/<ul>\s*<\/ul>/gi, "");
//   out = out.replace(/<ol>\s*<\/ol>/gi, "");
//   return out;
// }

// function injectTokenIntoNthSection(
//   html: string,
//   sectionIndexZero: number,
//   token: string
// ): string {
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   let idx = -1;
//   let lastEnd = 0;
//   const out: string[] = [];

//   while ((match = h2Regex.exec(html)) !== null) {
//     out.push(html.slice(lastEnd, match.index));
//     const h2 = match[0];
//     out.push(h2);
//     lastEnd = match.index + h2.length;
//     idx++;

//     if (idx === sectionIndexZero) {
//       const after = html.slice(lastEnd);
//       const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
//       if (!pMatch) {
//         out.push(after);
//         return out.join("");
//       }
//       const pHtml = pMatch[0];
//       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//       const words = inner.split(/\s+/);
//       if (words.length < 6) {
//         out.push(after);
//         return out.join("");
//       }
//       let insertAt = Math.max(3, Math.floor(words.length * 0.55));
//       if (insertAt > words.length - 4) insertAt = Math.max(3, words.length - 4);
//       const withToken =
//         "<p>" +
//         words.slice(0, insertAt).join(" ") +
//         " " +
//         token +
//         " " +
//         words.slice(insertAt).join(" ") +
//         "</p>";
//       const replaced = after.replace(pHtml, withToken);
//       out.push(replaced);
//       out.push(html.slice(match.index + h2.length + after.length));
//       return out.join("");
//     }
//   }

//   out.push(html.slice(lastEnd));
//   return out.join("");
// }

// /** Main hook */

// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>(
//     "content-items",
//     []
//   );
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>(
//     "excel-projects",
//     []
//   );

//   const ensureProject = (
//     proj: Partial<ExcelProject> & { id: string; fileName: string }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status: (proj as any).status ?? "pending",
//           totalKeywords: (proj as any).totalKeywords ?? 0,
//           processedKeywords: (proj as any).processedKeywords ?? 0,
//           createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount: (proj as any).failedCount ?? 0,
//         };
//         return exists
//           ? prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p))
//           : [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: GenerateProgressCallback
//   ) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 80;

//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       glog("Flushing content items:", { count: toWrite.length });
//       startTransition(() => {
//         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//       });
//     };

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) return flushNow();
//       if (!scheduled) {
//         scheduled = true;
//         queueMicrotask(flushNow);
//       }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId ? { ...p, processedKeywords: processed } : p
//           )
//         );
//       });
//       try {
//         const pct = Math.round((processed / Math.max(1, total)) * 100);
//         glog("Progress:", { processed, total, pct });
//         onProgress?.(pct);
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
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

//       const prefs = getFreshPrefs();
//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(
//             keywords,
//             size,
//             Math.max(1, Math.min(200, prefs.articleCount || 1))
//           )
//         : buildGroupsNormal(keywords, size);

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(
//         `Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article)`
//       );

//       const cores = navigator.hardwareConcurrency ?? 4;
//       let concurrency = Math.min(Math.max(8, cores * 2), 24);
//       const MAX = 36;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length) return;

//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];

//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

//         const task = (async () => {
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

//             let html = String(result.html || "").trim();
//             if (!html) throw new Error("Empty html from model");

//             // Inject anchor tokens into up to first 4 sections
//             const tokenTargets = Math.min(4, kws.length);
//             for (let i = 0; i < tokenTargets; i++) {
//               html = injectTokenIntoNthSection(html, i, `[ANCHOR:${kws[i]}]`);
//             }

//             // Build AnchorConfig[]
//             const anchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));

//             html = applyAnchorTokens(html, anchors);
//             html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//             html = stripLegacyStubBullets(html);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: html,
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

//             glog("Group success", { groupIndex, title: result.title });
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             failedGroups.push({ index: groupIndex, grp });
//             gerr("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(8, Math.min(Math.floor(concurrency), MAX));
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;

//         await Promise.race(Array.from(running));

//         if (failedCount > processedCount * 0.25 && concurrency > 8) {
//           concurrency -= 0.5;
//           gwarn("High failure rate, reducing concurrency:", concurrency);
//         } else if (
//           concurrency < MAX &&
//           failedCount < processedCount * 0.08
//         ) {
//           concurrency += 0.75;
//           glog("Low failure rate, increasing concurrency:", concurrency);
//         }
//       }

//       // Retry failed once
//       if (failedGroups.length) {
//         toast.message(`Retrying ${failedGroups.length} failed item(s)…`);

//         const queue = [...failedGroups];
//         failedGroups.length = 0;

//         const RETRY_CONCURRENCY = 6;
//         const running2 = new Set<Promise<void>>();

//         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
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

//           let html = String(res.html || "").trim();
//           if (!html) throw new Error("Empty html (retry)");

//           const tokenTargets = Math.min(4, kws.length);
//           for (let i = 0; i < tokenTargets; i++) {
//             html = injectTokenIntoNthSection(html, i, `[ANCHOR:${kws[i]}]`);
//           }

//           const anchors = Object.keys(urlMap).map((k) => ({
//             keyword: k,
//             url: urlMap[k] || undefined,
//           }));

//           html = applyAnchorTokens(html, anchors);
//           html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//           html = stripLegacyStubBullets(html);

//           const item: ContentItem = {
//             id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
//             keyword: kws[0],
//             keywordsUsed: kws,
//             generatedContent: html,
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

//         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//         while (running2.size || queue.length) {
//           await Promise.race(Array.from(running2));
//           while (running2.size < RETRY_CONCURRENCY && queue.length)
//             startNextRetry();
//           await new Promise((r) => setTimeout(r, 80));
//         }
//       }

//       flushNow();

//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "completed",
//                   processedKeywords: baseGroups.length,
//                   failedCount,
//                 }
//               : p
//           )
//         );
//       });

//       const ok = baseGroups.length - failedCount;
//       glog("generateContent DONE", {
//         ok,
//         failedCount,
//         total: baseGroups.length,
//       });
//       toast.success(
//         `✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`
//       );
//       onProgress?.(100);
//     } catch (error) {
//       gerr("generateContent overall error:", error);
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "error",
//                   error:
//                     error instanceof Error
//                       ? error.message
//                       : String(error),
//                 }
//               : p
//           )
//         );
//       });
//       toast.error(
//         `Failed processing ${file.name}: ${
//           error instanceof Error ? error.message : String(error)
//         }`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//       glog("generateContent FINALLY: isProcessing=false");
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
//       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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

// /** Grouping helpers */

// function buildGroupsNormal(
//   rows: KeywordRow[],
//   size: KeywordMode
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) {
//     groups.push(rows.slice(i, i + size));
//   }
//   return groups;
// }

// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0) return [];
//   if (!arr.length) return [];
//   if (size === 1) {
//     return [arr[Math.floor(Math.random() * arr.length)]];
//   }
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

// function buildGroupsCustom(
//   rows: KeywordRow[],
//   size: KeywordMode,
//   count: number
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) {
//     groups.push(sampleDistinct(rows, size));
//   }
//   return groups;
// }




// // src/hooks/use-content-generation.ts

// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";
// import useHumanizeContent  from "@/hooks/use-humanize-content";

// /** Logging */

// const GL = "[GEN]";
// const glog = (...a: any[]) => console.log(GL, ...a);
// const gwarn = (...a: any[]) => console.warn(GL, ...a);
// const gerr = (...a: any[]) => console.error(GL, ...a);

// /** Preferences loader */

// const PREF_KEY = "content-preferences_v3";

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//       ...parsed,
//     };
//   } catch {
//     return {
//       keywordMode: 1,
//       targetWords: 500,
//       extraInstructions: "",
//       mood: "Informative",
//       paragraphWords: 100,
//       includeConclusion: true,
//       customModeEnabled: false,
//       articleCount: 1,
//       language: "English (UK)",
//       totalContentWords: 800,
//       titleLength: 100,
//       includeBulletPoints: false,
//       includeTables: false,
//       includeEmojis: false,
//       includeBoxesQuotesHighlights: false,
//       includeQandA: false,
//       brandDomainEnabled: false,
//       brandDomain: "",
//     };
//   }
// }

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (p: number) => void;

// /** Editor session helper */

// const SESSION_KEY = "open-content-item_v1";

// export default function openContentEditor(item: ContentItem) {
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

// /** Excel parsing (keywords + optional URLs) */

// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

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

// type KeywordRow = { keyword: string; url?: string | null };

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

//   let keywordCol = -1;
//   let urlCol = -1;

//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(
//       ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//       0
//     );
//     let bestCol = -1;
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
//     if (bestCol !== -1) keywordCol = bestCol;
//   }

//   return {
//     headerRowIndex,
//     keywordCol: keywordCol === -1 ? null : keywordCol,
//     urlCol: urlCol === -1 ? null : urlCol,
//   };
// }

// function extractKeywordsFromWorksheetWithUrls(
//   worksheet: XLSX.WorkSheet
// ): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
//     header: 1,
//     raw: true,
//   }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

//   const { headerRowIndex, keywordCol, urlCol } = detectHeaderRowAndColumns(rows);

//   const start = Math.min(rows.length - 1, headerRowIndex + 1);
//   const dataRows = rows.slice(start);
//   const maxCols = Math.max(
//     ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//     0
//   );

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

// function extractKeywordsFromWorkbookBufferWithUrls(
//   buffer: ArrayBuffer | Uint8Array
// ) {
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

// /** Small HTML helpers */

// function stripLegacyStubBullets(html: string): string {
//   let out = html.replace(
//     /<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi,
//     ""
//   );
//   out = out.replace(
//     /<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi,
//     ""
//   );
//   out = out.replace(/<ul>\s*<\/ul>/gi, "");
//   out = out.replace(/<ol>\s*<\/ol>/gi, "");
//   return out;
// }

// /**
//  * Calculate word count from HTML (excluding tags)
//  */
// function getWordCount(html: string): number {
//   const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
//   return text.split(/\s+/).filter(word => word.length > 0).length;
// }

// /**
//  * Adjust content to match target word count
//  */
// function adjustWordCount(html: string, targetWords: number): string {
//   const currentWords = getWordCount(html);
//   const delta = Math.max(30, Math.round(targetWords * 0.05));
//   const min = Math.max(50, targetWords - delta);
//   const max = targetWords + delta;

//   if (currentWords >= min && currentWords <= max) {
//     return html; // Already within acceptable range
//   }

//   // If too long, trim from end (remove last paragraphs if needed)
//   if (currentWords > max) {
//     const paragraphs = html.split(/<\/p>/i);
//     let trimmed = '';
//     let wordCount = 0;
    
//     for (let i = 0; i < paragraphs.length; i++) {
//       const para = paragraphs[i] + (i < paragraphs.length - 1 ? '</p>' : '');
//       const paraWords = getWordCount(para);
      
//       if (wordCount + paraWords <= max) {
//         trimmed += para;
//         wordCount += paraWords;
//       } else {
//         // Try to trim this paragraph
//         const words = para.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0);
//         const wordsToKeep = Math.max(10, max - wordCount);
//         if (wordsToKeep > 0 && wordsToKeep < words.length) {
//           const trimmedPara = words.slice(0, wordsToKeep).join(' ');
//           trimmed += para.replace(/>[^<]+</, `>${trimmedPara}<`);
//         }
//         break;
//       }
//     }
    
//     return trimmed || html;
//   }

//   // If too short, we can't easily expand, so return as-is
//   // The model should have generated enough content
//   return html;
// }

// /**
//  * Limit sections to a maximum count (remove excess sections)
//  */
// function limitSections(html: string, maxSections: number): string {
//   if (!html || maxSections <= 0) return html;
  
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   const sections: Array<{ index: number; content: string }> = [];
//   let match: RegExpExecArray | null;
  
//   while ((match = h2Regex.exec(html)) !== null) {
//     const sectionStart = match.index;
//     const afterHeading = html.slice(sectionStart + match[0].length);
//     const nextH2Match = afterHeading.match(/<h2>/i);
//     const sectionEnd = nextH2Match && nextH2Match.index !== undefined
//       ? sectionStart + match[0].length + nextH2Match.index
//       : html.length;
    
//     const sectionContent = html.slice(sectionStart, sectionEnd);
//     sections.push({
//       index: sectionStart,
//       content: sectionContent
//     });
//   }
  
//   // If we have fewer or equal sections, return as is
//   if (sections.length <= maxSections) return html;
  
//   // Keep only first maxSections sections
//   const keepSections = sections.slice(0, maxSections);
//   const parts: string[] = [];
//   let currentIndex = 0;
  
//   for (const section of keepSections) {
//     // Add content before this section
//     if (section.index > currentIndex) {
//       parts.push(html.slice(currentIndex, section.index));
//     }
//     // Add the section
//     parts.push(section.content);
//     currentIndex = section.index + section.content.length;
//   }
  
//   // Add remaining content after last kept section (but before any removed sections)
//   if (currentIndex < html.length) {
//     // Find where the last kept section ends
//     const lastKeptSection = keepSections[keepSections.length - 1];
//     const endOfLastSection = lastKeptSection.index + lastKeptSection.content.length;
//     // Only add content up to where we want to stop (don't include removed sections)
//     parts.push(html.slice(endOfLastSection, html.length).split(/<h2>/i)[0]);
//   }
  
//   return parts.join('');
// }

// /**
//  * Remove duplicate sections from HTML content
//  */
// function removeDuplicateSections(html: string): string {
//   if (!html) return html;
  
//   // Extract all H2 sections
//   const h2Regex = /<h2>([\s\S]*?)<\/h2>/gi;
//   const sections: Array<{ heading: string; content: string; fullMatch: string; index: number }> = [];
//   let match: RegExpExecArray | null;
  
//   while ((match = h2Regex.exec(html)) !== null) {
//     const heading = match[1].trim().toLowerCase();
//     const sectionStart = match.index;
    
//     // Find content after this heading until next H2 or end
//     const afterHeading = html.slice(sectionStart + match[0].length);
//     const nextH2Match = afterHeading.match(/<h2>/i);
//     const sectionEnd = nextH2Match && nextH2Match.index !== undefined
//       ? sectionStart + match[0].length + nextH2Match.index
//       : html.length;
    
//     const sectionContent = html.slice(sectionStart, sectionEnd);
//     sections.push({
//       heading,
//       content: sectionContent,
//       fullMatch: match[0],
//       index: sectionStart
//     });
//   }
  
//   // If no H2 sections found, return as is
//   if (sections.length === 0) return html;
  
//   // More aggressive duplicate detection:
//   // 1. If same heading appears multiple times, keep only the FIRST occurrence
//   // 2. Also check content similarity for different headings
//   const seenHeadings = new Set<string>();
//   const uniqueSections: typeof sections = [];
//   const headingFirstOccurrence = new Map<string, number>(); // Track first occurrence index
  
//   for (let i = 0; i < sections.length; i++) {
//     const section = sections[i];
    
//     // Normalize content for comparison (remove HTML, normalize whitespace)
//     const contentAfterHeading = section.content
//       .replace(/<h2>[\s\S]*?<\/h2>/i, '')
//       .replace(/<[^>]+>/g, ' ') // Remove HTML tags
//       .replace(/\[ANCHOR:[^\]]+\]/g, '') // Remove anchor tokens
//       .replace(/\s+/g, ' ')
//       .trim()
//       .toLowerCase();
    
//     // Extract first 300 chars for comparison (more than before)
//     const contentSignature = contentAfterHeading.slice(0, 300);
    
//     // Check 1: If we've seen this exact heading before, it's a duplicate
//     if (seenHeadings.has(section.heading)) {
//       // Check if content is similar to first occurrence
//       const firstOccurrenceIndex = headingFirstOccurrence.get(section.heading)!;
//       const firstSection = sections[firstOccurrenceIndex];
//       const firstContentSignature = firstSection.content
//         .replace(/<h2>[\s\S]*?<\/h2>/i, '')
//         .replace(/<[^>]+>/g, ' ')
//         .replace(/\[ANCHOR:[^\]]+\]/g, '')
//         .replace(/\s+/g, ' ')
//         .trim()
//         .toLowerCase()
//         .slice(0, 300);
      
//       // If content signatures match (first 200 chars), it's definitely a duplicate
//       const compareLen = Math.min(200, firstContentSignature.length, contentSignature.length);
//       if (compareLen > 50 && firstContentSignature.slice(0, compareLen) === contentSignature.slice(0, compareLen)) {
//         // Duplicate - skip it
//         continue;
//       }
      
//       // Even if content is different, if heading is same and we already have one, skip
//       // (This prevents "Colour and fabric choices" appearing 10 times)
//       continue;
//     }
    
//     // Check 2: Check if content signature matches any previous section (even with different heading)
//     let isContentDuplicate = false;
//     for (const uniqueSection of uniqueSections) {
//       const uniqueContentSignature = uniqueSection.content
//         .replace(/<h2>[\s\S]*?<\/h2>/i, '')
//         .replace(/<[^>]+>/g, ' ')
//         .replace(/\[ANCHOR:[^\]]+\]/g, '')
//         .replace(/\s+/g, ' ')
//         .trim()
//         .toLowerCase()
//         .slice(0, 300);
      
//       // Compare first 200 chars - if they match, it's likely a duplicate
//       const compareLen = Math.min(200, uniqueContentSignature.length, contentSignature.length);
//       if (compareLen > 100 && uniqueContentSignature.slice(0, compareLen) === contentSignature.slice(0, compareLen)) {
//         isContentDuplicate = true;
//         break;
//       }
//     }
    
//     if (isContentDuplicate) {
//       continue;
//     }
    
//     // This is a unique section
//     seenHeadings.add(section.heading);
//     headingFirstOccurrence.set(section.heading, i);
//     uniqueSections.push(section);
//   }
  
//   // If no duplicates found, return original
//   if (uniqueSections.length === sections.length) return html;
  
//   // Rebuild HTML with only unique sections
//   const parts: string[] = [];
//   let currentIndex = 0;
  
//   for (const section of uniqueSections) {
//     // Add content before this section
//     if (section.index > currentIndex) {
//       parts.push(html.slice(currentIndex, section.index));
//     }
//     // Add the unique section
//     parts.push(section.content);
//     currentIndex = section.index + section.content.length;
//   }
  
//   // Add remaining content after last section (but only if it's not another H2)
//   if (currentIndex < html.length) {
//     const remaining = html.slice(currentIndex);
//     // If remaining starts with H2, don't add it (it was a duplicate)
//     if (!remaining.trim().startsWith('<h2>')) {
//       parts.push(remaining);
//     }
//   }
  
//   return parts.join('');
// }

// /**
//  * Ensure all keywords are present in content, add missing ones if needed
//  */
// function ensureAllKeywordsPresent(html: string, keywords: string[]): string {
//   if (!keywords || keywords.length === 0) return html;
  
//   const htmlLower = html.toLowerCase();
//   const missingKeywords: string[] = [];
  
//   // Check which keywords are missing
//   for (const kw of keywords) {
//     const kwLower = kw.toLowerCase();
//     // Check if keyword appears anywhere (as anchor token, in anchor tag, or as plain text)
//     const hasToken = html.includes(`[ANCHOR:${kw}]`);
//     const hasAnchor = new RegExp(`<a[^>]*>.*?${kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?</a>`, 'i').test(html);
//     const hasStrong = new RegExp(`<strong>.*?${kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?</strong>`, 'i').test(html);
//     const hasPlainText = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(htmlLower);
    
//     if (!hasToken && !hasAnchor && !hasStrong && !hasPlainText) {
//       missingKeywords.push(kw);
//     }
//   }
  
//   // If all keywords are present, return as is
//   if (missingKeywords.length === 0) return html;
  
//   // Add missing keywords by injecting tokens into paragraphs
//   // Use a more robust approach: work backwards through HTML to avoid index shifting issues
//   let result = html;
//   const paraRegex = /<p>([\s\S]*?)<\/p>/gi;
//   const paragraphs: Array<{ match: string; index: number; hasKeyword: boolean }> = [];
//   let match: RegExpExecArray | null;
  
//   // Collect all paragraphs with their positions
//   while ((match = paraRegex.exec(html)) !== null) {
//     const hasKeyword = match[0].includes('[ANCHOR:');
//     paragraphs.push({ 
//       match: match[0], 
//       index: match.index,
//       hasKeyword
//     });
//   }
  
//   // If no paragraphs found, create one with all missing keywords
//   if (paragraphs.length === 0) {
//     const tokens = missingKeywords.map(kw => `[ANCHOR:${kw}]`).join(" ");
//     return html + `<p>${tokens}</p>`;
//   }
  
//   // Work backwards through paragraphs to avoid index shifting
//   const replacements: Array<{ index: number; old: string; new: string }> = [];
//   let keywordIndex = 0;
  
//   // First pass: distribute keywords to paragraphs without keywords
//   for (let i = paragraphs.length - 1; i >= 0 && keywordIndex < missingKeywords.length; i--) {
//     const para = paragraphs[i];
    
//     // Skip paragraphs that already have keywords
//     if (para.hasKeyword) continue;
    
//     const kw = missingKeywords[keywordIndex];
//     const inner = para.match.replace(/^<p>|<\/p>$/gi, "").trim();
//     const words = inner.split(/\s+/);
    
//     let newPara: string;
//     if (words.length >= 3) {
//       const insertAt = Math.max(1, Math.floor(words.length * 0.5));
//       newPara = `<p>${words.slice(0, insertAt).join(" ")} [ANCHOR:${kw}] ${words.slice(insertAt).join(" ")}</p>`;
//     } else {
//       newPara = `<p>${inner} [ANCHOR:${kw}]</p>`;
//     }
    
//     replacements.push({ index: para.index, old: para.match, new: newPara });
//     keywordIndex++;
//   }
  
//   // Apply replacements from end to start to avoid index shifting
//   replacements.sort((a, b) => b.index - a.index);
//   for (const rep of replacements) {
//     result = result.slice(0, rep.index) + rep.new + result.slice(rep.index + rep.old.length);
//   }
  
//   // If still have missing keywords, add them to the end
//   const remainingKeywords = missingKeywords.slice(keywordIndex);
//   if (remainingKeywords.length > 0) {
//     const tokens = remainingKeywords.map(kw => `[ANCHOR:${kw}]`).join(" ");
//     result = result + `<p>${tokens}</p>`;
//   }
  
//   return result;
// }

// /**
//  * Ensure only one keyword per paragraph and no repetition
//  */
// function enforceKeywordRules(html: string, keywords: string[]): string {
//   if (!keywords || keywords.length === 0) return html;

//   // Split HTML into paragraphs
//   const paraRegex = /<p>([\s\S]*?)<\/p>/gi;
//   let match: RegExpExecArray | null;
//   const paragraphs: string[] = [];
//   let lastIndex = 0;

//   while ((match = paraRegex.exec(html)) !== null) {
//     if (match.index > lastIndex) {
//       paragraphs.push(html.slice(lastIndex, match.index));
//     }
//     paragraphs.push(match[0]);
//     lastIndex = match.index + match[0].length;
//   }
//   if (lastIndex < html.length) {
//     paragraphs.push(html.slice(lastIndex));
//   }

//   const processed: string[] = [];
  
//   for (const para of paragraphs) {
//     if (!para.match(/<p>/i)) {
//       processed.push(para);
//       continue;
//     }

//     // Check for keywords in anchor tags first (these should be preserved)
//     const anchorKeywords: string[] = [];
//     const anchorRegex = /<a[^>]*>([^<]+)<\/a>/gi;
//     let anchorMatch: RegExpExecArray | null;
//     while ((anchorMatch = anchorRegex.exec(para)) !== null) {
//       const anchorText = anchorMatch[1].trim();
//       for (const kw of keywords) {
//         if (anchorText.toLowerCase() === kw.toLowerCase()) {
//           anchorKeywords.push(kw);
//         }
//       }
//     }
    
//     // Also check for keywords in strong tags
//     const strongKeywords: string[] = [];
//     const strongRegex = /<strong>([^<]+)<\/strong>/gi;
//     let strongMatch: RegExpExecArray | null;
//     while ((strongMatch = strongRegex.exec(para)) !== null) {
//       const strongText = strongMatch[1].trim();
//       for (const kw of keywords) {
//         if (strongText.toLowerCase() === kw.toLowerCase()) {
//           strongKeywords.push(kw);
//         }
//       }
//     }
    
//     // Combine anchor and strong keywords (these are the ones we want to keep)
//     const preservedKeywords = [...new Set([...anchorKeywords, ...strongKeywords])];
    
//     // Check for additional keywords in plain text (not in anchor/strong)
//     const innerText = para.replace(/<[^>]+>/g, ' ').toLowerCase();
//     const foundKeywords: string[] = [...preservedKeywords];
    
//     for (const kw of keywords) {
//       // Skip if already found in anchor/strong
//       if (preservedKeywords.includes(kw)) continue;
      
//       const kwLower = kw.toLowerCase();
//       // Check if keyword appears as plain text (as whole word)
//       const regex = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
//       if (regex.test(innerText)) {
//         foundKeywords.push(kw);
//       }
//     }

//     // If more than one distinct keyword found, keep anchor/strong keywords, remove plain text duplicates
//     if (foundKeywords.length > 1) {
//       let processedPara = para;
      
//       // Keep preserved keywords (in anchor/strong tags), remove plain text duplicates
//       const keywordsToRemove = foundKeywords.filter(kw => !preservedKeywords.includes(kw));
      
//       // Only remove if we have preserved keywords AND plain text keywords
//       // If we only have plain text keywords, keep the first one
//       if (preservedKeywords.length > 0 && keywordsToRemove.length > 0) {
//         // Remove plain text keywords that duplicate anchor/strong keywords
//         // But DON'T remove keywords that are in anchor/strong tags
//         for (const kwToRemove of keywordsToRemove) {
//           const kwEscaped = kwToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//           // Find all occurrences and check context
//           const regex = new RegExp(`\\b${kwEscaped}\\b`, 'gi');
//           processedPara = processedPara.replace(regex, (match, offset) => {
//             // Check if this match is inside an anchor or strong tag
//             const before = processedPara.slice(Math.max(0, offset - 100), offset);
//             const after = processedPara.slice(offset + match.length, offset + match.length + 100);
            
//             // Check if it's inside an anchor tag
//             const lastAnchorOpen = before.lastIndexOf('<a');
//             const lastAnchorClose = before.lastIndexOf('</a>');
//             if (lastAnchorOpen > lastAnchorClose && after.includes('</a>')) {
//               return match; // Keep it - it's in an anchor tag
//             }
            
//             // Check if it's inside a strong tag
//             const lastStrongOpen = before.lastIndexOf('<strong');
//             const lastStrongClose = before.lastIndexOf('</strong>');
//             if (lastStrongOpen > lastStrongClose && after.includes('</strong>')) {
//               return match; // Keep it - it's in a strong tag
//             }
            
//             // It's plain text, remove it
//             return '';
//           });
//         }
//       } else if (foundKeywords.length > 1 && preservedKeywords.length === 0) {
//         // All are plain text, keep first, remove others
//         for (let i = 1; i < foundKeywords.length; i++) {
//           const kwToRemove = foundKeywords[i];
//           const kwEscaped = kwToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//           const plainTextRegex = new RegExp(`\\b${kwEscaped}\\b`, 'gi');
//           // Only remove if not in anchor/strong tag
//           processedPara = processedPara.replace(plainTextRegex, (match, offset) => {
//             const before = processedPara.slice(Math.max(0, offset - 100), offset);
//             const after = processedPara.slice(offset + match.length, offset + match.length + 100);
//             // Check if it's inside an anchor or strong tag
//             const lastAnchorOpen = before.lastIndexOf('<a');
//             const lastAnchorClose = before.lastIndexOf('</a>');
//             const lastStrongOpen = before.lastIndexOf('<strong');
//             const lastStrongClose = before.lastIndexOf('</strong>');
            
//             if ((lastAnchorOpen > lastAnchorClose && after.includes('</a>')) ||
//                 (lastStrongOpen > lastStrongClose && after.includes('</strong>'))) {
//               return match; // Keep it - it's in an anchor/strong tag
//             }
//             return ''; // Remove it
//           });
//         }
//       }
      
//       processed.push(processedPara);
//     } else {
//       processed.push(para);
//     }
//   }

//   return processed.join('');
// }

// /**
//  * Remove duplicate/consecutive H2 headings at the top of content
//  * Ensures only one H2 heading appears at the start
// //  */
// // function removeDuplicateTopHeadings(html: string): string {
// //   if (!html) return html;

// //   // Trim leading whitespace to find actual start
// //   const trimmedStart = html.trimStart();
// //   const leadingWhitespace = html.length - trimmedStart.length;
  
// //   // Find all H2 headings
// //   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
// //   const matches: Array<{ match: string; index: number }> = [];
// //   let match: RegExpExecArray | null;

// //   while ((match = h2Regex.exec(html)) !== null) {
// //     matches.push({ match: match[0], index: match.index });
// //   }

// //   // If we have 2 or more H2 headings, check if they're at the start
// //   if (matches.length >= 2) {
// //     const firstH2 = matches[0];
// //     const secondH2 = matches[1];
    
// //     // Check if first H2 is at the very start (after whitespace) or within first 200 chars
// //     const firstH2AdjustedIndex = firstH2.index - leadingWhitespace;
// //     const secondH2AdjustedIndex = secondH2.index - leadingWhitespace;
    
// //     if (firstH2AdjustedIndex <= 200 && secondH2AdjustedIndex <= 500) {
// //       // Check if there's minimal content between them (just whitespace/newlines/paragraphs)
// //       const between = html.slice(firstH2.index + firstH2.match.length, secondH2.index);
// //       const betweenTrimmed = between.replace(/[\s\n\r<p><\/p>]/gi, '').trim();
      
// //       // If there's no substantial content between them (less than 100 chars of actual text), remove the second H2
// //       if (betweenTrimmed.length < 100) {
// //         html = html.slice(0, secondH2.index) + html.slice(secondH2.index + secondH2.match.length);
// //       }
// //     }
// //   }

// //   return html;
// // }

// function injectTokenIntoNthSection(
//   html: string,
//   sectionIndexZero: number,
//   token: string
// ): string {
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   let lastEnd = 0;
//   const out: string[] = [];
//   const h2Matches: Array<{ index: number; match: string }> = [];

//   // First pass: collect all H2 matches
//   while ((match = h2Regex.exec(html)) !== null) {
//     h2Matches.push({ index: match.index, match: match[0] });
//   }

//   // If no sections found, try to inject into first paragraph anywhere
//   if (h2Matches.length === 0) {
//     const firstPMatch = html.match(/<p>[\s\S]*?<\/p>/i);
//     if (firstPMatch) {
//       const pHtml = firstPMatch[0];
//       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//       const words = inner.split(/\s+/);
//       if (words.length >= 3) {
//         const insertAt = Math.max(1, Math.floor(words.length * 0.5));
//         const withToken =
//           "<p>" +
//           words.slice(0, insertAt).join(" ") +
//           " " +
//           token +
//           " " +
//           words.slice(insertAt).join(" ") +
//           "</p>";
//         return html.replace(pHtml, withToken);
//       } else {
//         // Even if very short, inject at end
//         return html.replace(pHtml, `<p>${inner} ${token}</p>`);
//       }
//     }
//     // If no paragraph found, append token at start
//     return html + " " + token;
//   }

//   // Second pass: process sections
//   for (let i = 0; i < h2Matches.length; i++) {
//     const h2Match = h2Matches[i];
//     out.push(html.slice(lastEnd, h2Match.index));
//     out.push(h2Match.match);
//     lastEnd = h2Match.index + h2Match.match.length;

//     if (i === sectionIndexZero) {
//       const after = html.slice(lastEnd);
//       const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
//       if (!pMatch) {
//         // No paragraph found, insert one with token
//         out.push(`<p>${token}</p>`);
//         out.push(after);
//         // Continue processing remaining sections
//         for (let j = i + 1; j < h2Matches.length; j++) {
//           const nextMatch = h2Matches[j];
//           out.push(html.slice(lastEnd, nextMatch.index));
//           out.push(nextMatch.match);
//           lastEnd = nextMatch.index + nextMatch.match.length;
//         }
//         out.push(html.slice(lastEnd));
//         return out.join("");
//       }
//       const pHtml = pMatch[0];
//       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//       const words = inner.split(/\s+/);
      
//       // Even if paragraph is short, inject the token
//       if (words.length >= 3) {
//         let insertAt = Math.max(1, Math.floor(words.length * 0.55));
//         if (insertAt > words.length - 2) insertAt = Math.max(1, words.length - 2);
//         const withToken =
//           "<p>" +
//           words.slice(0, insertAt).join(" ") +
//           " " +
//           token +
//           " " +
//           words.slice(insertAt).join(" ") +
//           "</p>";
//         const replaced = after.replace(pHtml, withToken);
//         out.push(replaced);
//         // Continue processing remaining sections
//         lastEnd = h2Match.index + h2Match.match.length + replaced.length;
//         for (let j = i + 1; j < h2Matches.length; j++) {
//           const nextMatch = h2Matches[j];
//           const beforeNext = html.slice(lastEnd, nextMatch.index);
//           out.push(beforeNext);
//           out.push(nextMatch.match);
//           lastEnd = nextMatch.index + nextMatch.match.length;
//         }
//         out.push(html.slice(lastEnd));
//         return out.join("");
//       } else {
//         // Very short paragraph, append token
//         const withToken = `<p>${inner} ${token}</p>`;
//         const replaced = after.replace(pHtml, withToken);
//         out.push(replaced);
//         lastEnd = h2Match.index + h2Match.match.length + replaced.length;
//         for (let j = i + 1; j < h2Matches.length; j++) {
//           const nextMatch = h2Matches[j];
//           const beforeNext = html.slice(lastEnd, nextMatch.index);
//           out.push(beforeNext);
//           out.push(nextMatch.match);
//           lastEnd = nextMatch.index + nextMatch.match.length;
//         }
//         out.push(html.slice(lastEnd));
//         return out.join("");
//       }
//     }
//   }

//   // If section index is beyond available sections, inject into last section or append
//   if (sectionIndexZero >= h2Matches.length) {
//     const lastH2 = h2Matches[h2Matches.length - 1];
//     const afterLast = html.slice(lastH2.index + lastH2.match.length);
//     const pMatch = afterLast.match(/<p>[\s\S]*?<\/p>/i);
//     if (pMatch) {
//       const pHtml = pMatch[0];
//       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//       const words = inner.split(/\s+/);
//       if (words.length >= 3) {
//         const insertAt = Math.max(1, Math.floor(words.length * 0.5));
//         const withToken =
//           "<p>" +
//           words.slice(0, insertAt).join(" ") +
//           " " +
//           token +
//           " " +
//           words.slice(insertAt).join(" ") +
//           "</p>";
//         return html.replace(pHtml, withToken);
//       } else {
//         return html.replace(pHtml, `<p>${inner} ${token}</p>`);
//       }
//     }
//     // Append at end if no paragraph found
//     return html + " " + token;
//   }

//   out.push(html.slice(lastEnd));
//   return out.join("");
// }

// /** Main hook */

// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>(
//     "content-items",
//     []
//   );
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>(
//     "excel-projects",
//     []
//   );

//   // ✅ integrate local humanizer
//   const { humanizeHtml } = useHumanizeContent();

//   const ensureProject = (
//     proj: Partial<ExcelProject> & { id: string; fileName: string }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status: (proj as any).status ?? "pending",
//           totalKeywords: (proj as any).totalKeywords ?? 0,
//           processedKeywords: (proj as any).processedKeywords ?? 0,
//           createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount: (proj as any).failedCount ?? 0,
//         };
//         return exists
//           ? prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p))
//           : [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: GenerateProgressCallback
//   ) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 80;

//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       glog("Flushing content items:", { count: toWrite.length });
//       startTransition(() => {
//         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//       });
//     };

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) return flushNow();
//       if (!scheduled) {
//         scheduled = true;
//         queueMicrotask(flushNow);
//       }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId ? { ...p, processedKeywords: processed } : p
//           )
//         );
//       });
//       try {
//         const pct = Math.round((processed / Math.max(1, total)) * 100);
//         glog("Progress:", { processed, total, pct });
//         onProgress?.(pct);
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
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

//       const prefs = getFreshPrefs();
//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(
//             keywords,
//             size,
//             Math.max(1, Math.min(200, prefs.articleCount || 1))
//           )
//         : buildGroupsNormal(keywords, size);

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(
//         `Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article)`
//       );

//       const cores = navigator.hardwareConcurrency ?? 4;
//       let concurrency = Math.min(Math.max(8, cores * 2), 24);
//       const MAX = 36;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length) return;

//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];

//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

//         const task = (async () => {
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

//             let html = String(result.html || "").trim();
//             if (!html) throw new Error("Empty html from model");

//             // Enforce word count if specified
//             if (prefs.totalContentWords && prefs.totalContentWords > 0) {
//               html = adjustWordCount(html, prefs.totalContentWords);
//             }

//             // Step 1: Remove duplicate sections FIRST (before keyword injection)
//             // Run multiple times to catch all duplicates
//             let prevLength = html.length;
//             for (let i = 0; i < 3; i++) {
//               html = removeDuplicateSections(html);
//               if (html.length === prevLength) break; // No more duplicates
//               prevLength = html.length;
//             }
            
//             // Step 2: Limit sections to reasonable count (max 8 sections) BEFORE keyword injection
//             const maxSections = 8;
//             html = limitSections(html, maxSections);
            
//             // Step 3: Remove duplicates again after limiting (in case limitSections created issues)
//             html = removeDuplicateSections(html);
            
//             // Step 4: Inject anchor tokens for ALL keywords (distribute across sections)
//             // Use all keywords, cycling through sections if needed
//             for (let i = 0; i < kws.length; i++) {
//               // Cycle through sections if we have more keywords than sections
//               const sectionIndex = i % maxSections;
//               html = injectTokenIntoNthSection(html, sectionIndex, `[ANCHOR:${kws[i]}]`);
//             }

//             // Step 5: Ensure all keywords are present (add missing ones if needed)
//             // This MUST run after token injection to catch any that failed
//             html = ensureAllKeywordsPresent(html, kws);

//             // Build AnchorConfig[] from urlMap
//             const anchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));
            
//             // Step 6: Remove duplicates again after keyword injection
//             html = removeDuplicateSections(html);
            
//             // Step 7: Apply anchors + clean
//             html = applyAnchorTokens(html, anchors);
//             html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//             html = stripLegacyStubBullets(html);

//             // Step 8: Enforce keyword rules: only one keyword per paragraph, no repetition
//             html = enforceKeywordRules(html, kws);
            
//             // Step 9: Final check - ensure all keywords are still present after all processing
//             html = ensureAllKeywordsPresent(html, kws);
            
//             // Step 10: Final duplicate removal before humanization
//             html = removeDuplicateSections(html);

//             // ✅ Auto humanize final HTML (local, deterministic-ish)
//             let humanizedHtml = await humanizeHtml(
//               html,
//               {
//                 strength: 0.6,
//                 allowImperfect: true,
//               },
//               `${fileId}-${groupIndex}`
//             );
            
//             // Step 11: Final duplicate removal AFTER humanization (humanization might create duplicates)
//             humanizedHtml = removeDuplicateSections(humanizedHtml);
            
//             // Step 12: Final keyword check AFTER humanization (humanization might modify/remove keywords)
//             humanizedHtml = ensureAllKeywordsPresent(humanizedHtml, kws);
            
//             // Re-apply anchors in case they were modified during humanization
//             humanizedHtml = applyAnchorTokens(humanizedHtml, anchors);
//             humanizedHtml = humanizedHtml.replace(/\[ANCHOR:[^\]]+\]/g, "");
            
//             // Step 13: One more duplicate check after anchor application
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

//             glog("Group success", { groupIndex, title: result.title });
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             failedGroups.push({ index: groupIndex, grp });
//             gerr("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(8, Math.min(Math.floor(concurrency), MAX));
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;

//         await Promise.race(Array.from(running));

//         if (failedCount > processedCount * 0.25 && concurrency > 8) {
//           concurrency -= 0.5;
//           gwarn("High failure rate, reducing concurrency:", concurrency);
//         } else if (
//           concurrency < MAX &&
//           failedCount < processedCount * 0.08
//         ) {
//           concurrency += 0.75;
//           glog("Low failure rate, increasing concurrency:", concurrency);
//         }
//       }

//       // Retry failed once
//       if (failedGroups.length) {
//         toast.message(`Retrying ${failedGroups.length} failed item(s)…`);

//         const queue = [...failedGroups];
//         failedGroups.length = 0;

//         const RETRY_CONCURRENCY = 6;
//         const running2 = new Set<Promise<void>>();

//         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
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

//           let html = String(res.html || "").trim();
//           if (!html) throw new Error("Empty html (retry)");

//           const tokenTargets = Math.min(4, kws.length);
//           for (let i = 0; i < tokenTargets; i++) {
//             html = injectTokenIntoNthSection(html, i, `[ANCHOR:${kws[i]}]`);
//           }

//           const anchors = Object.keys(urlMap).map((k) => ({
//             keyword: k,
//             url: urlMap[k] || undefined,
//           }));

//           html = applyAnchorTokens(html, anchors);
//           html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//           html = stripLegacyStubBullets(html);

//           const humanizedHtml = await humanizeHtml(
//             html,
//             {
//               strength: 0.6,
//               allowImperfect: true,
//             },
//             `${fileId}-retry-${groupIndex}`
//           );

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

//         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//         while (running2.size || queue.length) {
//           await Promise.race(Array.from(running2));
//           while (running2.size < RETRY_CONCURRENCY && queue.length)
//             startNextRetry();
//           await new Promise((r) => setTimeout(r, 80));
//         }
//       }

//       flushNow();

//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "completed",
//                   processedKeywords: baseGroups.length,
//                   failedCount,
//                 }
//               : p
//           )
//         );
//       });

//       const ok = baseGroups.length - failedCount;
//       glog("generateContent DONE", {
//         ok,
//         failedCount,
//         total: baseGroups.length,
//       });
//       toast.success(
//         `✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`
//       );
//       onProgress?.(100);
//     } catch (error) {
//       gerr("generateContent overall error:", error);
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "error",
//                   error:
//                     error instanceof Error
//                       ? error.message
//                       : String(error),
//                 }
//               : p
//           )
//         );
//       });
//       toast.error(
//         `Failed processing ${file.name}: ${
//           error instanceof Error ? error.message : String(error)
//         }`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//       glog("generateContent FINALLY: isProcessing=false");
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
//       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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

// /** Grouping helpers */

// function buildGroupsNormal(
//   rows: KeywordRow[],
//   size: KeywordMode
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) {
//     groups.push(rows.slice(i, i + size));
//   }
//   return groups;
// }

// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0) return [];
//   if (!arr.length) return [];
//   if (size === 1) {
//     return [arr[Math.floor(Math.random() * arr.length)]];
//   }
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

// function buildGroupsCustom(
//   rows: KeywordRow[],
//   size: KeywordMode,
//   count: number
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) {
//     groups.push(sampleDistinct(rows, size));
//   }
//   return groups;
// }




// // src/hooks/use-content-generation.ts

// import { useState, startTransition } from "react";
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

// /** Preferences loader */

// const PREF_KEY = "content-preferences_v3";

// function getDefaultPrefs(): ContentPreferences {
//   return {
//     keywordMode: 1,
//     targetWords: 500,
//     extraInstructions: "",
//     mood: "Informative",
//     paragraphWords: 100,
//     includeConclusion: true,
//     customModeEnabled: false,
//     articleCount: 1,
//     language: "English (UK)",
//     totalContentWords: 800,
//     titleLength: 100,
//     includeBulletPoints: false,
//     includeTables: false,
//     includeEmojis: false,
//     includeBoxesQuotesHighlights: false,
//     includeQandA: false,
//     brandDomainEnabled: false,
//     brandDomain: "",
//   };
// }

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
//     return { ...getDefaultPrefs(), ...parsed };
//   } catch {
//     return getDefaultPrefs();
//   }
// }

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (p: number) => void;

// /** Editor session helper */

// const SESSION_KEY = "open-content-item_v1";

// export default function openContentEditor(item: ContentItem) {
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

// /** Excel parsing (keywords + optional URLs) */

// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

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

// type KeywordRow = { keyword: string; url?: string | null };

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

//   let keywordCol = -1;
//   let urlCol = -1;

//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(
//       ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//       0
//     );
//     let bestCol = -1;
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
//     if (bestCol !== -1) keywordCol = bestCol;
//   }

//   return {
//     headerRowIndex,
//     keywordCol: keywordCol === -1 ? null : keywordCol,
//     urlCol: urlCol === -1 ? null : urlCol,
//   };
// }

// function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
//     header: 1,
//     raw: true,
//   }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

//   const { headerRowIndex, keywordCol, urlCol } = detectHeaderRowAndColumns(rows);

//   const start = Math.min(rows.length - 1, headerRowIndex + 1);
//   const dataRows = rows.slice(start);
//   const maxCols = Math.max(
//     ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//     0
//   );

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

// function extractKeywordsFromWorkbookBufferWithUrls(
//   buffer: ArrayBuffer | Uint8Array
// ) {
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

// /** Small HTML helpers */

// function stripLegacyStubBullets(html: string): string {
//   let out = html.replace(
//     /<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi,
//     ""
//   );
//   out = out.replace(
//     /<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi,
//     ""
//   );
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
//   const currentWords = getWordCount(html);
//   const delta = Math.max(30, Math.round(targetWords * 0.05));
//   const min = Math.max(50, targetWords - delta);
//   const max = targetWords + delta;

//   if (currentWords >= min && currentWords <= max) return html;

//   if (currentWords > max) {
//     const paragraphs = html.split(/<\/p>/i);
//     let trimmed = "";
//     let wordCount = 0;

//     for (let i = 0; i < paragraphs.length; i++) {
//       const para = paragraphs[i] + (i < paragraphs.length - 1 ? "</p>" : "");
//       const paraWords = getWordCount(para);

//       if (wordCount + paraWords <= max) {
//         trimmed += para;
//         wordCount += paraWords;
//       } else {
//         const words = para
//           .replace(/<[^>]+>/g, " ")
//           .split(/\s+/)
//           .filter((w) => w.length > 0);
//         const wordsToKeep = Math.max(10, max - wordCount);
//         if (wordsToKeep > 0 && wordsToKeep < words.length) {
//           const trimmedPara = words.slice(0, wordsToKeep).join(" ");
//           trimmed += para.replace(/>[^<]+</, `>${trimmedPara}<`);
//         }
//         break;
//       }
//     }

//     return trimmed || html;
//   }

//   return html;
// }

// /**
//  * Limit sections to a maximum count (remove excess sections)
//  */
// function limitSections(html: string, maxSections: number): string {
//   if (!html || maxSections <= 0) return html;

//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   const sections: Array<{ index: number; content: string }> = [];
//   let match: RegExpExecArray | null;

//   while ((match = h2Regex.exec(html)) !== null) {
//     const sectionStart = match.index;
//     const afterHeading = html.slice(sectionStart + match[0].length);
//     const nextH2Match = afterHeading.match(/<h2>/i);
//     const sectionEnd =
//       nextH2Match && nextH2Match.index !== undefined
//         ? sectionStart + match[0].length + nextH2Match.index
//         : html.length;

//     const sectionContent = html.slice(sectionStart, sectionEnd);
//     sections.push({ index: sectionStart, content: sectionContent });
//   }

//   if (sections.length <= maxSections) return html;

//   const keepSections = sections.slice(0, maxSections);
//   const parts: string[] = [];
//   let currentIndex = 0;

//   for (const section of keepSections) {
//     if (section.index > currentIndex) {
//       parts.push(html.slice(currentIndex, section.index));
//     }
//     parts.push(section.content);
//     currentIndex = section.index + section.content.length;
//   }

//   if (currentIndex < html.length) {
//     const lastKeptSection = keepSections[keepSections.length - 1];
//     const endOfLastSection =
//       lastKeptSection.index + lastKeptSection.content.length;
//     parts.push(
//       html.slice(endOfLastSection, html.length).split(/<h2>/i)[0]
//     );
//   }

//   return parts.join("");
// }

// /**
//  * Remove duplicate sections from HTML content
//  */
// function removeDuplicateSections(html: string): string {
//   if (!html) return html;

//   const h2Regex = /<h2>([\s\S]*?)<\/h2>/gi;
//   const sections: Array<{
//     heading: string;
//     content: string;
//     index: number;
//   }> = [];
//   let match: RegExpExecArray | null;

//   while ((match = h2Regex.exec(html)) !== null) {
//     const heading = match[1].trim().toLowerCase();
//     const sectionStart = match.index;
//     const afterHeading = html.slice(sectionStart + match[0].length);
//     const nextH2Match = afterHeading.match(/<h2>/i);
//     const sectionEnd =
//       nextH2Match && nextH2Match.index !== undefined
//         ? sectionStart + match[0].length + nextH2Match.index
//         : html.length;
//     const sectionContent = html.slice(sectionStart, sectionEnd);

//     sections.push({
//       heading,
//       content: sectionContent,
//       index: sectionStart,
//     });
//   }

//   if (sections.length === 0) return html;

//   const seenHeadings = new Set<string>();
//   const uniqueSections: typeof sections = [];
//   const headingFirstOccurrence = new Map<string, number>();

//   for (let i = 0; i < sections.length; i++) {
//     const section = sections[i];

//     const contentAfterHeading = section.content
//       .replace(/<h2>[\s\S]*?<\/h2>/i, "")
//       .replace(/<[^>]+>/g, " ")
//       .replace(/\[ANCHOR:[^\]]+\]/g, "")
//       .replace(/\s+/g, " ")
//       .trim()
//       .toLowerCase();

//     const contentSignature = contentAfterHeading.slice(0, 300);

//     if (seenHeadings.has(section.heading)) {
//       const firstIdx = headingFirstOccurrence.get(section.heading)!;
//       const firstSection = sections[firstIdx];
//       const firstContentSignature = firstSection.content
//         .replace(/<h2>[\s\S]*?<\/h2>/i, "")
//         .replace(/<[^>]+>/g, " ")
//         .replace(/\[ANCHOR:[^\]]+\]/g, "")
//         .replace(/\s+/g, " ")
//         .trim()
//         .toLowerCase()
//         .slice(0, 300);

//       const compareLen = Math.min(
//         200,
//         firstContentSignature.length,
//         contentSignature.length
//       );
//       if (
//         compareLen > 50 &&
//         firstContentSignature.slice(0, compareLen) ===
//           contentSignature.slice(0, compareLen)
//       ) {
//         continue;
//       }
//       continue;
//     }

//     let isContentDuplicate = false;
//     for (const uniqueSection of uniqueSections) {
//       const uniqueContentSignature = uniqueSection.content
//         .replace(/<h2>[\s\S]*?<\/h2>/i, "")
//         .replace(/<[^>]+>/g, " ")
//         .replace(/\[ANCHOR:[^\]]+\]/g, "")
//         .replace(/\s+/g, " ")
//         .trim()
//         .toLowerCase()
//         .slice(0, 300);

//       const compareLen = Math.min(
//         200,
//         uniqueContentSignature.length,
//         contentSignature.length
//       );
//       if (
//         compareLen > 100 &&
//         uniqueContentSignature.slice(0, compareLen) ===
//           contentSignature.slice(0, compareLen)
//       ) {
//         isContentDuplicate = true;
//         break;
//       }
//     }

//     if (isContentDuplicate) continue;

//     seenHeadings.add(section.heading);
//     headingFirstOccurrence.set(section.heading, i);
//     uniqueSections.push(section);
//   }

//   if (uniqueSections.length === sections.length) return html;

//   const parts: string[] = [];
//   let currentIndex = 0;

//   for (const section of uniqueSections) {
//     if (section.index > currentIndex) {
//       parts.push(html.slice(currentIndex, section.index));
//     }
//     parts.push(section.content);
//     currentIndex = section.index + section.content.length;
//   }

//   if (currentIndex < html.length) {
//     const remaining = html.slice(currentIndex);
//     if (!remaining.trim().startsWith("<h2>")) {
//       parts.push(remaining);
//     }
//   }

//   return parts.join("");
// }

// /**
//  * Ensure all keywords are present; if missing, inject [ANCHOR:kw] into paragraphs
//  */
// function ensureAllKeywordsPresent(html: string, keywords: string[]): string {
//   if (!keywords || keywords.length === 0) return html;

//   const htmlLower = html.toLowerCase();
//   const missingKeywords: string[] = [];

//   for (const kw of keywords) {
//     const kwLower = kw.toLowerCase();
//     const hasToken = html.includes(`[ANCHOR:${kw}]`);
//     const hasAnchor = new RegExp(
//       `<a[^>]*>[^<]*${kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^<]*<\\/a>`,
//       "i"
//     ).test(html);
//     const hasStrong = new RegExp(
//       `<strong>[^<]*${kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^<]*<\\/strong>`,
//       "i"
//     ).test(html);
//     const hasPlainText = new RegExp(
//       `\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
//       "i"
//     ).test(htmlLower);

//     if (!hasToken && !hasAnchor && !hasStrong && !hasPlainText) {
//       missingKeywords.push(kw);
//     }
//   }

//   if (!missingKeywords.length) return html;

//   let result = html;
//   const paraRegex = /<p>([\s\S]*?)<\/p>/gi;
//   const paragraphs: Array<{
//     match: string;
//     index: number;
//     hasKeyword: boolean;
//   }> = [];
//   let match: RegExpExecArray | null;

//   while ((match = paraRegex.exec(html)) !== null) {
//     const hasKeyword = match[0].includes("[ANCHOR:");
//     paragraphs.push({
//       match: match[0],
//       index: match.index,
//       hasKeyword,
//     });
//   }

//   if (!paragraphs.length) {
//     const tokens = missingKeywords
//       .map((kw) => `[ANCHOR:${kw}]`)
//       .join(" ");
//     return html + `<p>${tokens}</p>`;
//   }

//   const replacements: Array<{
//     index: number;
//     old: string;
//     new: string;
//   }> = [];
//   let keywordIndex = 0;

//   for (let i = paragraphs.length - 1; i >= 0 && keywordIndex < missingKeywords.length; i--) {
//     const para = paragraphs[i];
//     if (para.hasKeyword) continue;

//     const kw = missingKeywords[keywordIndex];
//     const inner = para.match.replace(/^<p>|<\/p>$/gi, "").trim();
//     const words = inner.split(/\s+/);

//     let newPara: string;
//     if (words.length >= 3) {
//       const insertAt = Math.max(1, Math.floor(words.length * 0.5));
//       newPara = `<p>${words
//         .slice(0, insertAt)
//         .join(" ")} [ANCHOR:${kw}] ${words
//         .slice(insertAt)
//         .join(" ")}</p>`;
//     } else {
//       newPara = `<p>${inner} [ANCHOR:${kw}]</p>`;
//     }

//     replacements.push({
//       index: para.index,
//       old: para.match,
//       new: newPara,
//     });
//     keywordIndex++;
//   }

//   replacements.sort((a, b) => b.index - a.index);
//   for (const rep of replacements) {
//     result =
//       result.slice(0, rep.index) +
//       rep.new +
//       result.slice(rep.index + rep.old.length);
//   }

//   const remaining = missingKeywords.slice(keywordIndex);
//   if (remaining.length > 0) {
//     const tokens = remaining
//       .map((kw) => `[ANCHOR:${kw}]`)
//       .join(" ");
//     result = result + `<p>${tokens}</p>`;
//   }

//   return result;
// }

// /**
//  * Ensure one keyword per paragraph and avoid repeats
//  */
// function enforceKeywordRules(html: string, keywords: string[]): string {
//   if (!keywords || !keywords.length) return html;

//   const paraRegex = /<p>([\s\S]*?)<\/p>/gi;
//   let match: RegExpExecArray | null;
//   const parts: string[] = [];
//   let lastIndex = 0;

//   while ((match = paraRegex.exec(html)) !== null) {
//     if (match.index > lastIndex) {
//       parts.push(html.slice(lastIndex, match.index));
//     }
//     parts.push(match[0]);
//     lastIndex = match.index + match[0].length;
//   }
//   if (lastIndex < html.length) {
//     parts.push(html.slice(lastIndex));
//   }

//   const processed: string[] = [];

//   for (const chunk of parts) {
//     if (!chunk.match(/<p>/i)) {
//       processed.push(chunk);
//       continue;
//     }

//     let para = chunk;

//     const anchorKeywords: string[] = [];
//     const anchorRegex = /<a[^>]*>([^<]+)<\/a>/gi;
//     let aMatch: RegExpExecArray | null;
//     while ((aMatch = anchorRegex.exec(para)) !== null) {
//       const t = aMatch[1].trim().toLowerCase();
//       for (const kw of keywords) {
//         if (t === kw.toLowerCase()) anchorKeywords.push(kw);
//       }
//     }

//     const strongKeywords: string[] = [];
//     const strongRegex = /<strong>([^<]+)<\/strong>/gi;
//     let sMatch: RegExpExecArray | null;
//     while ((sMatch = strongRegex.exec(para)) !== null) {
//       const t = sMatch[1].trim().toLowerCase();
//       for (const kw of keywords) {
//         if (t === kw.toLowerCase()) strongKeywords.push(kw);
//       }
//     }

//     const preserved = [...new Set([...anchorKeywords, ...strongKeywords])];

//     const plainText = para.replace(/<[^>]+>/g, " ").toLowerCase();
//     const found: string[] = [...preserved];

//     for (const kw of keywords) {
//       if (preserved.includes(kw)) continue;
//       const re = new RegExp(
//         `\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
//         "i"
//       );
//       if (re.test(plainText)) found.push(kw);
//     }

//     if (found.length <= 1) {
//       processed.push(para);
//       continue;
//     }

//     let processedPara = para;

//     if (preserved.length > 0) {
//       const toRemove = found.filter((k) => !preserved.includes(k));
//       for (const kw of toRemove) {
//         const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//         const re = new RegExp(`\\b${esc}\\b`, "gi");
//         processedPara = processedPara.replace(re, (m, offset) => {
//           const before = processedPara.slice(
//             Math.max(0, offset - 80),
//             offset
//           );
//           const after = processedPara.slice(
//             offset + m.length,
//             offset + m.length + 80
//           );
//           const inA =
//             before.lastIndexOf("<a") >
//               before.lastIndexOf("</a>") &&
//             after.includes("</a>");
//           const inS =
//             before.lastIndexOf("<strong") >
//               before.lastIndexOf("</strong>") &&
//             after.includes("</strong>");
//           return inA || inS ? m : "";
//         });
//       }
//     } else {
//       for (let i = 1; i < found.length; i++) {
//         const kw = found[i];
//         const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//         const re = new RegExp(`\\b${esc}\\b`, "gi");
//         let keptOnce = false;
//         processedPara = processedPara.replace(re, (m, offset) => {
//           if (!keptOnce) {
//             keptOnce = true;
//             return m;
//           }
//           const before = processedPara.slice(
//             Math.max(0, offset - 80),
//             offset
//           );
//           const after = processedPara.slice(
//             offset + m.length,
//             offset + m.length + 80
//           );
//           const inA =
//             before.lastIndexOf("<a") >
//               before.lastIndexOf("</a>") &&
//             after.includes("</a>");
//           const inS =
//             before.lastIndexOf("<strong") >
//               before.lastIndexOf("</strong>") &&
//             after.includes("</strong>");
//           return inA || inS ? m : "";
//         });
//       }
//     }

//     processed.push(processedPara);
//   }

//   return processed.join("");
// }

// /**
//  * Inject token into nth <h2>-section's first paragraph
//  */
// function injectTokenIntoNthSection(
//   html: string,
//   sectionIndexZero: number,
//   token: string
// ): string {
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   const h2Matches: Array<{ index: number; match: string }> = [];

//   while ((match = h2Regex.exec(html)) !== null) {
//     h2Matches.push({ index: match.index, match: match[0] });
//   }

//   if (!h2Matches.length) {
//     const firstP = html.match(/<p>[\s\S]*?<\/p>/i);
//     if (firstP) {
//       const pHtml = firstP[0];
//       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//       const words = inner.split(/\s+/);
//       if (words.length >= 3) {
//         const insertAt = Math.max(1, Math.floor(words.length * 0.5));
//         const withToken =
//           "<p>" +
//           words.slice(0, insertAt).join(" ") +
//           " " +
//           token +
//           " " +
//           words.slice(insertAt).join(" ") +
//           "</p>";
//         return html.replace(pHtml, withToken);
//       }
//       return html.replace(pHtml, `<p>${inner} ${token}</p>`);
//     }
//     return html + " " + token;
//   }

//   const maxIndex = Math.min(sectionIndexZero, h2Matches.length - 1);
//   const target = h2Matches[maxIndex];
//   const before = html.slice(0, target.index + target.match.length);
//   const after = html.slice(target.index + target.match.length);

//   const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
//   if (!pMatch) {
//     return before + `<p>${token}</p>` + after;
//   }

//   const pHtml = pMatch[0];
//   const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//   const words = inner.split(/\s+/);

//   let withToken: string;
//   if (words.length >= 3) {
//     let insertAt = Math.max(1, Math.floor(words.length * 0.55));
//     if (insertAt > words.length - 2) {
//       insertAt = Math.max(1, words.length - 2);
//     }
//     withToken =
//       "<p>" +
//       words.slice(0, insertAt).join(" ") +
//       " " +
//       token +
//       " " +
//       words.slice(insertAt).join(" ") +
//       "</p>";
//   } else {
//     withToken = `<p>${inner} ${token}</p>`;
//   }

//   const replacedAfter = after.replace(pHtml, withToken);
//   return before + replacedAfter;
// }

// /** Main hook */

// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>(
//     "content-items",
//     []
//   );
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>(
//     "excel-projects",
//     []
//   );

//   const { humanizeHtml } = useHumanizeContent();

//   const ensureProject = (
//     proj: Partial<ExcelProject> & { id: string; fileName: string }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status: (proj as any).status ?? "pending",
//           totalKeywords: (proj as any).totalKeywords ?? 0,
//           processedKeywords: (proj as any).processedKeywords ?? 0,
//           createdAt:
//             (proj as any).createdAt ?? new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount: (proj as any).failedCount ?? 0,
//         };
//         return exists
//           ? prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p))
//           : [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: GenerateProgressCallback
//   ) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 80;

//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       glog("Flushing content items:", { count: toWrite.length });
//       startTransition(() => {
//         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//       });
//     };

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) return flushNow();
//       if (!scheduled) {
//         scheduled = true;
//         queueMicrotask(flushNow);
//       }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId ? { ...p, processedKeywords: processed } : p
//           )
//         );
//       });
//       try {
//         const pct = Math.round((processed / Math.max(1, total)) * 100);
//         glog("Progress:", { processed, total, pct });
//         onProgress?.(pct);
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
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

//       const prefs = getFreshPrefs();
//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(
//             keywords,
//             size,
//             Math.max(1, Math.min(200, prefs.articleCount || 1))
//           )
//         : buildGroupsNormal(keywords, size);

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(
//         `Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article)`
//       );

//       const cores = navigator.hardwareConcurrency ?? 4;
//       let concurrency = Math.min(Math.max(8, cores * 2), 24);
//       const MAX = 36;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length) return;

//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];

//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

//         const task = (async () => {
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

//             let html = String(result.html || "").trim();
//             if (!html) throw new Error("Empty html from model");

//             if (prefs.totalContentWords && prefs.totalContentWords > 0) {
//               html = adjustWordCount(html, prefs.totalContentWords);
//             }

//             // De-dup + section control
//             let prevLen = html.length;
//             for (let i = 0; i < 3; i++) {
//               html = removeDuplicateSections(html);
//               if (html.length === prevLen) break;
//               prevLen = html.length;
//             }

//             const maxSections = 8;
//             html = limitSections(html, maxSections);
//             html = removeDuplicateSections(html);

//             // Inject anchor tokens for each keyword
//             for (let i = 0; i < kws.length; i++) {
//               const sectionIndex = i % maxSections;
//               html = injectTokenIntoNthSection(html, sectionIndex, `[ANCHOR:${kws[i]}]`);
//             }

//             // Ensure presence
//             html = ensureAllKeywordsPresent(html, kws);

//             // Initial anchor map
//             const anchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));

//             // Clean & enforce rules
//             html = removeDuplicateSections(html);
//             html = applyAnchorTokens(html, anchors);
//             html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//             html = stripLegacyStubBullets(html);
//             html = enforceKeywordRules(html, kws);
//             html = ensureAllKeywordsPresent(html, kws);
//             html = removeDuplicateSections(html);

//             // Humanize
//             let humanizedHtml = await humanizeHtml(
//               html,
//               {
//                 strength: 0.6,
//                 allowImperfect: true,
//               },
//               `${fileId}-${groupIndex}`
//             );

//             humanizedHtml = removeDuplicateSections(humanizedHtml);
//             humanizedHtml = ensureAllKeywordsPresent(humanizedHtml, kws);

//             // Re-apply anchors AFTER humanization (ensures live links)
//             const finalAnchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));
//             humanizedHtml = applyAnchorTokens(humanizedHtml, finalAnchors);
//             humanizedHtml = humanizedHtml.replace(/\[ANCHOR:[^\]]+\]/g, "");
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

//             glog("Group success", { groupIndex, title: result.title });
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             failedGroups.push({ index: groupIndex, grp });
//             gerr("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(8, Math.min(Math.floor(concurrency), MAX));
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;

//         await Promise.race(Array.from(running));

//         if (failedCount > processedCount * 0.25 && concurrency > 8) {
//           concurrency -= 0.5;
//           gwarn("High failure rate, reducing concurrency:", concurrency);
//         } else if (concurrency < MAX && failedCount < processedCount * 0.08) {
//           concurrency += 0.75;
//           glog("Low failure rate, increasing concurrency:", concurrency);
//         }
//       }

//       // Retry failed once (simplified, but keeps anchors + humanize)
//       if (failedGroups.length) {
//         toast.message(`Retrying ${failedGroups.length} failed item(s)…`);

//         const queue = [...failedGroups];
//         failedGroups.length = 0;

//         const RETRY_CONCURRENCY = 6;
//         const running2 = new Set<Promise<void>>();

//         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
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
//           html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//           html = stripLegacyStubBullets(html);
//           html = enforceKeywordRules(html, kws);
//           html = ensureAllKeywordsPresent(html, kws);

//           let humanizedHtml = await humanizeHtml(
//             html,
//             { strength: 0.6, allowImperfect: true },
//             `${fileId}-retry-${groupIndex}`
//           );

//           humanizedHtml = ensureAllKeywordsPresent(humanizedHtml, kws);
//           humanizedHtml = applyAnchorTokens(humanizedHtml, anchors);
//           humanizedHtml = humanizedHtml.replace(/\[ANCHOR:[^\]]+\]/g, "");

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

//         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//         while (running2.size || queue.length) {
//           await Promise.race(Array.from(running2));
//           while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//           await new Promise((r) => setTimeout(r, 80));
//         }
//       }

//       flushNow();

//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "completed",
//                   processedKeywords: baseGroups.length,
//                   failedCount,
//                 }
//               : p
//           )
//         );
//       });

//       const ok = baseGroups.length - failedCount;
//       glog("generateContent DONE", {
//         ok,
//         failedCount,
//         total: baseGroups.length,
//       });
//       toast.success(
//         `✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`
//       );
//       onProgress?.(100);
//     } catch (error) {
//       gerr("generateContent overall error:", error);
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "error",
//                   error: error instanceof Error ? error.message : String(error),
//                 }
//               : p
//           )
//         );
//       });
//       toast.error(
//         `Failed processing ${file.name}: ${
//           error instanceof Error ? error.message : String(error)
//         }`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//       glog("generateContent FINALLY: isProcessing=false");
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
//       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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

// /** Grouping helpers */

// function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) {
//     groups.push(rows.slice(i, i + size));
//   }
//   return groups;
// }

// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0) return [];
//   if (!arr.length) return [];
//   if (size === 1) {
//     return [arr[Math.floor(Math.random() * arr.length)]];
//   }
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

// function buildGroupsCustom(
//   rows: KeywordRow[],
//   size: KeywordMode,
//   count: number
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) {
//     groups.push(sampleDistinct(rows, size));
//   }
//   return groups;
// }






// import { useState, startTransition } from "react";
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

// /** Preferences loader */

// const PREF_KEY = "content-preferences_v3";

// function getDefaultPrefs(): ContentPreferences {
//   return {
//     keywordMode: 1,
//     targetWords: 500,
//     extraInstructions: "",
//     mood: "Informative",
//     paragraphWords: 100,
//     includeConclusion: true,
//     customModeEnabled: false,
//     articleCount: 1,
//     language: "English (UK)",
//     totalContentWords: 800,
//     titleLength: 100,
//     includeBulletPoints: false,
//     includeTables: false,
//     includeEmojis: false,
//     includeBoxesQuotesHighlights: false,
//     includeQandA: false,
//     brandDomainEnabled: false,
//     brandDomain: "",
//   };
// }

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw ? (JSON.parse(raw) as Partial<ContentPreferences>) : {};
//     return { ...getDefaultPrefs(), ...parsed };
//   } catch {
//     return getDefaultPrefs();
//   }
// }

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

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (p: number) => void;

// /** Editor session helper */

// const SESSION_KEY = "open-content-item_v1";

// export default function openContentEditor(item: ContentItem) {
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

// /** Excel parsing (keywords + optional URLs) */

// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

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

// type KeywordRow = { keyword: string; url?: string | null };

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

//   let keywordCol = -1;
//   let urlCol = -1;

//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(
//       ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//       0
//     );
//     let bestCol = -1;
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
//     if (bestCol !== -1) keywordCol = bestCol;
//   }

//   return {
//     headerRowIndex,
//     keywordCol: keywordCol === -1 ? null : keywordCol,
//     urlCol: urlCol === -1 ? null : urlCol,
//   };
// }

// function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
//     header: 1,
//     raw: true,
//   }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

//   const { headerRowIndex, keywordCol, urlCol } = detectHeaderRowAndColumns(rows);

//   const start = Math.min(rows.length - 1, headerRowIndex + 1);
//   const dataRows = rows.slice(start);
//   const maxCols = Math.max(
//     ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//     0
//   );

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

// function extractKeywordsFromWorkbookBufferWithUrls(
//   buffer: ArrayBuffer | Uint8Array
// ) {
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

// /** Small HTML helpers */

// function stripLegacyStubBullets(html: string): string {
//   let out = html.replace(
//     /<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi,
//     ""
//   );
//   out = out.replace(
//     /<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi,
//     ""
//   );
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
//   const currentWords = getWordCount(html);
//   const delta = Math.max(30, Math.round(targetWords * 0.05));
//   const min = Math.max(50, targetWords - delta);
//   const max = targetWords + delta;

//   if (currentWords >= min && currentWords <= max) return html;

//   if (currentWords > max) {
//     const paragraphs = html.split(/<\/p>/i);
//     let trimmed = "";
//     let wordCount = 0;

//     for (let i = 0; i < paragraphs.length; i++) {
//       const para = paragraphs[i] + (i < paragraphs.length - 1 ? "</p>" : "");
//       const paraWords = getWordCount(para);

//       if (wordCount + paraWords <= max) {
//         trimmed += para;
//         wordCount += paraWords;
//       } else {
//         const words = para
//           .replace(/<[^>]+>/g, " ")
//           .split(/\s+/)
//           .filter((w) => w.length > 0);
//         const wordsToKeep = Math.max(10, max - wordCount);
//         if (wordsToKeep > 0 && wordsToKeep < words.length) {
//           const trimmedPara = words.slice(0, wordsToKeep).join(" ");
//           trimmed += para.replace(/>[^<]+</, `>${trimmedPara}<`);
//         }
//         break;
//       }
//     }

//     return trimmed || html;
//   }

//   return html;
// }

// /**
//  * Limit sections to a maximum count (remove excess sections)
//  */
// function limitSections(html: string, maxSections: number): string {
//   if (!html || maxSections <= 0) return html;

//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   const sections: Array<{ index: number; content: string }> = [];
//   let match: RegExpExecArray | null;

//   while ((match = h2Regex.exec(html)) !== null) {
//     const sectionStart = match.index;
//     const afterHeading = html.slice(sectionStart + match[0].length);
//     const nextH2Match = afterHeading.match(/<h2>/i);
//     const sectionEnd =
//       nextH2Match && nextH2Match.index !== undefined
//         ? sectionStart + match[0].length + nextH2Match.index
//         : html.length;

//     const sectionContent = html.slice(sectionStart, sectionEnd);
//     sections.push({ index: sectionStart, content: sectionContent });
//   }

//   if (sections.length <= maxSections) return html;

//   const keepSections = sections.slice(0, maxSections);
//   const parts: string[] = [];
//   let currentIndex = 0;

//   for (const section of keepSections) {
//     if (section.index > currentIndex) {
//       parts.push(html.slice(currentIndex, section.index));
//     }
//     parts.push(section.content);
//     currentIndex = section.index + section.content.length;
//   }

//   if (currentIndex < html.length) {
//     const lastKeptSection = keepSections[keepSections.length - 1];
//     const endOfLastSection =
//       lastKeptSection.index + lastKeptSection.content.length;
//     parts.push(
//       html.slice(endOfLastSection, html.length).split(/<h2>/i)[0]
//     );
//   }

//   return parts.join("");
// }

// /**
//  * Remove duplicate sections from HTML content
//  */
// function removeDuplicateSections(html: string): string {
//   if (!html) return html;

//   const h2Regex = /<h2>([\s\S]*?)<\/h2>/gi;
//   const sections: Array<{
//     heading: string;
//     content: string;
//     index: number;
//   }> = [];
//   let match: RegExpExecArray | null;

//   while ((match = h2Regex.exec(html)) !== null) {
//     const heading = match[1].trim().toLowerCase();
//     const sectionStart = match.index;
//     const afterHeading = html.slice(sectionStart + match[0].length);
//     const nextH2Match = afterHeading.match(/<h2>/i);
//     const sectionEnd =
//       nextH2Match && nextH2Match.index !== undefined
//         ? sectionStart + match[0].length + nextH2Match.index
//         : html.length;
//     const sectionContent = html.slice(sectionStart, sectionEnd);

//     sections.push({
//       heading,
//       content: sectionContent,
//       index: sectionStart,
//     });
//   }

//   if (sections.length === 0) return html;

//   const seenHeadings = new Set<string>();
//   const uniqueSections: typeof sections = [];
//   const headingFirstOccurrence = new Map<string, number>();

//   for (let i = 0; i < sections.length; i++) {
//     const section = sections[i];

//     const contentAfterHeading = section.content
//       .replace(/<h2>[\s\S]*?<\/h2>/i, "")
//       .replace(/<[^>]+>/g, " ")
//       .replace(/\[ANCHOR:[^\]]+\]/g, "")
//       .replace(/\s+/g, " ")
//       .trim()
//       .toLowerCase();

//     const contentSignature = contentAfterHeading.slice(0, 300);

//     if (seenHeadings.has(section.heading)) {
//       const firstIdx = headingFirstOccurrence.get(section.heading)!;
//       const firstSection = sections[firstIdx];
//       const firstContentSignature = firstSection.content
//         .replace(/<h2>[\s\S]*?<\/h2>/i, "")
//         .replace(/<[^>]+>/g, " ")
//         .replace(/\[ANCHOR:[^\]]+\]/g, "")
//         .replace(/\s+/g, " ")
//         .trim()
//         .toLowerCase()
//         .slice(0, 300);

//       const compareLen = Math.min(
//         200,
//         firstContentSignature.length,
//         contentSignature.length
//       );
//       if (
//         compareLen > 50 &&
//         firstContentSignature.slice(0, compareLen) ===
//           contentSignature.slice(0, compareLen)
//       ) {
//         continue;
//       }
//       continue;
//     }

//     let isContentDuplicate = false;
//     for (const uniqueSection of uniqueSections) {
//       const uniqueContentSignature = uniqueSection.content
//         .replace(/<h2>[\s\S]*?<\/h2>/i, "")
//         .replace(/<[^>]+>/g, " ")
//         .replace(/\[ANCHOR:[^\]]+\]/g, "")
//         .replace(/\s+/g, " ")
//         .trim()
//         .toLowerCase()
//         .slice(0, 300);

//       const compareLen = Math.min(
//         200,
//         uniqueContentSignature.length,
//         contentSignature.length
//       );
//       if (
//         compareLen > 100 &&
//         uniqueContentSignature.slice(0, compareLen) ===
//           contentSignature.slice(0, compareLen)
//       ) {
//         isContentDuplicate = true;
//         break;
//       }
//     }

//     if (isContentDuplicate) continue;

//     seenHeadings.add(section.heading);
//     headingFirstOccurrence.set(section.heading, i);
//     uniqueSections.push(section);
//   }

//   if (uniqueSections.length === sections.length) return html;

//   const parts: string[] = [];
//   let currentIndex = 0;

//   for (const section of uniqueSections) {
//     if (section.index > currentIndex) {
//       parts.push(html.slice(currentIndex, section.index));
//     }
//     parts.push(section.content);
//     currentIndex = section.index + section.content.length;
//   }

//   if (currentIndex < html.length) {
//     const remaining = html.slice(currentIndex);
//     if (!remaining.trim().startsWith("<h2>")) {
//       parts.push(remaining);
//     }
//   }

//   return parts.join("");
// }

// /**
//  * Ensure all keywords are present in usable positions:
//  * - Count anchors / strong anywhere
//  * - Count plain text ONLY inside <p> (body), not lists/tables
//  * - If missing, inject [ANCHOR:kw] into <p> so applyAnchorTokens can link
//  */
// function ensureAllKeywordsPresent(html: string, keywords: string[]): string {
//   if (!keywords || keywords.length === 0) return html;

//   // Collect paragraph blocks once
//   const paraRegex = /<p[^>]*>[\s\S]*?<\/p>/gi;
//   const paragraphs: Array<{
//     match: string;
//     index: number;
//     hasToken: boolean;
//   }> = [];
//   let m: RegExpExecArray | null;
//   while ((m = paraRegex.exec(html)) !== null) {
//     paragraphs.push({
//       match: m[0],
//       index: m.index,
//       hasToken: m[0].includes("[ANCHOR:"),
//     });
//   }

//   const missingKeywords: string[] = [];

//   for (const kwRaw of keywords) {
//     const kw = (kwRaw || "").trim();
//     if (!kw) continue;

//     const kwLower = kw.toLowerCase();
//     const safe = kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//     // Already has explicit token?
//     const hasToken =
//       html.includes(`[ANCHOR:${kw}]`) ||
//       html.toLowerCase().includes(`[anchor:${kwLower}]`);

//     // Already linked/strong anywhere?
//     const hasAnchor = new RegExp(
//       `<a[^>]*>[^<]*${safe}[^<]*<\\/a>`,
//       "i"
//     ).test(html);
//     const hasStrong = new RegExp(
//       `<strong[^>]*>[^<]*${safe}[^<]*<\\/strong>`,
//       "i"
//     ).test(html);

//     // Plain text only counts if it's in a <p> outside <a>/<strong>
//     let hasPlainInParagraph = false;
//     if (paragraphs.length) {
//       const plainRe = new RegExp(`\\b${safe}\\b`, "i");
//       for (const p of paragraphs) {
//         const text = p.match
//           .replace(/<a[^>]*>[\s\S]*?<\/a>/gi, " ")
//           .replace(/<strong[^>]*>[\s\S]*?<\/strong>/gi, " ")
//           .replace(/<[^>]+>/g, " ")
//           .toLowerCase();
//         if (plainRe.test(text)) {
//           hasPlainInParagraph = true;
//           break;
//         }
//       }
//     }

//     if (!hasToken && !hasAnchor && !hasStrong && !hasPlainInParagraph) {
//       missingKeywords.push(kw);
//     }
//   }

//   if (!missingKeywords.length) return html;

//   let result = html;
//   const replacements: Array<{
//     index: number;
//     old: string;
//     nw: string;
//   }> = [];

//   let keywordIndex = 0;

//   // Inject tokens into paragraphs from bottom up, skipping ones that already have [ANCHOR:]
//   for (let i = paragraphs.length - 1; i >= 0 && keywordIndex < missingKeywords.length; i--) {
//     const para = paragraphs[i];
//     if (para.hasToken) continue;

//     const kw = missingKeywords[keywordIndex];
//     const inner = para.match
//       .replace(/^<p[^>]*>/i, "")
//       .replace(/<\/p>$/i, "")
//       .trim();
//     const words = inner.split(/\s+/).filter(Boolean);

//     let nw: string;
//     if (words.length >= 3) {
//       const insertAt = Math.max(1, Math.floor(words.length * 0.5));
//       nw =
//         "<p>" +
//         words.slice(0, insertAt).join(" ") +
//         ` [ANCHOR:${kw}] ` +
//         words.slice(insertAt).join(" ") +
//         "</p>";
//     } else {
//       nw = `<p>${inner} [ANCHOR:${kw}]</p>`;
//     }

//     replacements.push({
//       index: para.index,
//       old: para.match,
//       nw,
//     });
//     keywordIndex++;
//   }

//   // Apply replacements from end to start
//   replacements.sort((a, b) => b.index - a.index);
//   for (const rep of replacements) {
//     result =
//       result.slice(0, rep.index) +
//       rep.nw +
//       result.slice(rep.index + rep.old.length);
//   }

//   // If some keywords still missing, append one last paragraph with tokens
//   const remaining = missingKeywords.slice(keywordIndex);
//   if (remaining.length > 0) {
//     const tokens = remaining.map((kw) => `[ANCHOR:${kw}]`).join(" ");
//     result += `<p>${tokens}</p>`;
//   }

//   return result;
// }

// /**
//  * Ensure one keyword per paragraph and avoid repeats
//  */
// function enforceKeywordRules(html: string, keywords: string[]): string {
//   if (!keywords || !keywords.length) return html;

//   const paraRegex = /<p>([\s\S]*?)<\/p>/gi;
//   let match: RegExpExecArray | null;
//   const parts: string[] = [];
//   let lastIndex = 0;

//   while ((match = paraRegex.exec(html)) !== null) {
//     if (match.index > lastIndex) {
//       parts.push(html.slice(lastIndex, match.index));
//     }
//     parts.push(match[0]);
//     lastIndex = match.index + match[0].length;
//   }
//   if (lastIndex < html.length) {
//     parts.push(html.slice(lastIndex));
//   }

//   const processed: string[] = [];

//   for (const chunk of parts) {
//     if (!chunk.match(/<p>/i)) {
//       processed.push(chunk);
//       continue;
//     }

//     let para = chunk;

//     const anchorKeywords: string[] = [];
//     const anchorRegex = /<a[^>]*>([^<]+)<\/a>/gi;
//     let aMatch: RegExpExecArray | null;
//     while ((aMatch = anchorRegex.exec(para)) !== null) {
//       const t = aMatch[1].trim().toLowerCase();
//       for (const kw of keywords) {
//         if (t === kw.toLowerCase()) anchorKeywords.push(kw);
//       }
//     }

//     const strongKeywords: string[] = [];
//     const strongRegex = /<strong>([^<]+)<\/strong>/gi;
//     let sMatch: RegExpExecArray | null;
//     while ((sMatch = strongRegex.exec(para)) !== null) {
//       const t = sMatch[1].trim().toLowerCase();
//       for (const kw of keywords) {
//         if (t === kw.toLowerCase()) strongKeywords.push(kw);
//       }
//     }

//     const preserved = [...new Set([...anchorKeywords, ...strongKeywords])];

//     const plainText = para.replace(/<[^>]+>/g, " ").toLowerCase();
//     const found: string[] = [...preserved];

//     for (const kw of keywords) {
//       if (preserved.includes(kw)) continue;
//       const re = new RegExp(
//         `\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
//         "i"
//       );
//       if (re.test(plainText)) found.push(kw);
//     }

//     if (found.length <= 1) {
//       processed.push(para);
//       continue;
//     }

//     let processedPara = para;

//     if (preserved.length > 0) {
//       const toRemove = found.filter((k) => !preserved.includes(k));
//       for (const kw of toRemove) {
//         const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//         const re = new RegExp(`\\b${esc}\\b`, "gi");
//         processedPara = processedPara.replace(re, (m, offset) => {
//           const before = processedPara.slice(
//             Math.max(0, offset - 80),
//             offset
//           );
//           const after = processedPara.slice(
//             offset + m.length,
//             offset + m.length + 80
//           );
//           const inA =
//             before.lastIndexOf("<a") >
//               before.lastIndexOf("</a>") &&
//             after.includes("</a>");
//           const inS =
//             before.lastIndexOf("<strong") >
//               before.lastIndexOf("</strong>") &&
//             after.includes("</strong>");
//           return inA || inS ? m : "";
//         });
//       }
//     } else {
//       for (let i = 1; i < found.length; i++) {
//         const kw = found[i];
//         const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//         const re = new RegExp(`\\b${esc}\\b`, "gi");
//         let keptOnce = false;
//         processedPara = processedPara.replace(re, (m, offset) => {
//           if (!keptOnce) {
//             keptOnce = true;
//             return m;
//           }
//           const before = processedPara.slice(
//             Math.max(0, offset - 80),
//             offset
//           );
//           const after = processedPara.slice(
//             offset + m.length,
//             offset + m.length + 80
//           );
//           const inA =
//             before.lastIndexOf("<a") >
//               before.lastIndexOf("</a>") &&
//             after.includes("</a>");
//           const inS =
//             before.lastIndexOf("<strong") >
//               before.lastIndexOf("</strong>") &&
//             after.includes("</strong>");
//           return inA || inS ? m : "";
//         });
//       }
//     }

//     processed.push(processedPara);
//   }

//   return processed.join("");
// }

// /**
//  * Inject token into nth <h2>-section's first paragraph
//  */
// function injectTokenIntoNthSection(
//   html: string,
//   sectionIndexZero: number,
//   token: string
// ): string {
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   const h2Matches: Array<{ index: number; match: string }> = [];

//   while ((match = h2Regex.exec(html)) !== null) {
//     h2Matches.push({ index: match.index, match: match[0] });
//   }

//   if (!h2Matches.length) {
//     const firstP = html.match(/<p>[\s\S]*?<\/p>/i);
//     if (firstP) {
//       const pHtml = firstP[0];
//       const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//       const words = inner.split(/\s+/);
//       if (words.length >= 3) {
//         const insertAt = Math.max(1, Math.floor(words.length * 0.5));
//         const withToken =
//           "<p>" +
//           words.slice(0, insertAt).join(" ") +
//           " " +
//           token +
//           " " +
//           words.slice(insertAt).join(" ") +
//           "</p>";
//         return html.replace(pHtml, withToken);
//       }
//       return html.replace(pHtml, `<p>${inner} ${token}</p>`);
//     }
//     return html + " " + token;
//   }

//   const maxIndex = Math.min(sectionIndexZero, h2Matches.length - 1);
//   const target = h2Matches[maxIndex];
//   const before = html.slice(0, target.index + target.match.length);
//   const after = html.slice(target.index + target.match.length);

//   const pMatch = after.match(/<p>[\s\S]*?<\/p>/i);
//   if (!pMatch) {
//     return before + `<p>${token}</p>` + after;
//   }

//   const pHtml = pMatch[0];
//   const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
//   const words = inner.split(/\s+/);

//   let withToken: string;
//   if (words.length >= 3) {
//     let insertAt = Math.max(1, Math.floor(words.length * 0.55));
//     if (insertAt > words.length - 2) {
//       insertAt = Math.max(1, words.length - 2);
//     }
//     withToken =
//       "<p>" +
//       words.slice(0, insertAt).join(" ") +
//       " " +
//       token +
//       " " +
//       words.slice(insertAt).join(" ") +
//       "</p>";
//   } else {
//     withToken = `<p>${inner} ${token}</p>`;
//   }

//   const replacedAfter = after.replace(pHtml, withToken);
//   return before + replacedAfter;
// }

// /** Main hook */

// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>(
//     "content-items",
//     []
//   );
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>(
//     "excel-projects",
//     []
//   );

//   const { humanizeHtml } = useHumanizeContent();

//   const ensureProject = (
//     proj: Partial<ExcelProject> & { id: string; fileName: string }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status: (proj as any).status ?? "pending",
//           totalKeywords: (proj as any).totalKeywords ?? 0,
//           processedKeywords: (proj as any).processedKeywords ?? 0,
//           createdAt:
//             (proj as any).createdAt ?? new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount: (proj as any).failedCount ?? 0,
//         };
//         return exists
//           ? prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p))
//           : [...prev, base];
//       });
//     });
//   };

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: GenerateProgressCallback
//   ) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 80;

//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       glog("Flushing content items:", { count: toWrite.length });
//       startTransition(() => {
//         setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//       });
//     };

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE) return flushNow();
//       if (!scheduled) {
//         scheduled = true;
//         queueMicrotask(flushNow);
//       }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

//     const updateProgress = (processed: number, total: number) => {
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId ? { ...p, processedKeywords: processed } : p
//           )
//         );
//       });
//       try {
//         const pct = Math.round((processed / Math.max(1, total)) * 100);
//         glog("Progress:", { processed, total, pct });
//         onProgress?.(pct);
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
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

//       const prefs = getFreshPrefs();
//       const size = (prefs.keywordMode ?? 1) as KeywordMode;

//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(
//             keywords,
//             size,
//             Math.max(1, Math.min(200, prefs.articleCount || 1))
//           )
//         : buildGroupsNormal(keywords, size);

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(
//         `Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article)`
//       );

//       const cores = navigator.hardwareConcurrency ?? 4;
//       let concurrency = Math.min(Math.max(8, cores * 2), 24);
//       const MAX = 36;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= baseGroups.length) return;

//         const groupIndex = idx++;
//         const grp = baseGroups[groupIndex];

//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => (urlMap[g.keyword] = g.url ?? null));

//         const task = (async () => {
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

//             let html = String(result.html || "").trim();
//             if (!html) throw new Error("Empty html from model");

//             if (prefs.totalContentWords && prefs.totalContentWords > 0) {
//               html = adjustWordCount(html, prefs.totalContentWords);
//             }

//             // De-dup + section control
//             let prevLen = html.length;
//             for (let i = 0; i < 3; i++) {
//               html = removeDuplicateSections(html);
//               if (html.length === prevLen) break;
//               prevLen = html.length;
//             }

//             const maxSections = 8;
//             html = limitSections(html, maxSections);
//             html = removeDuplicateSections(html);

//             // Inject anchor tokens for each keyword into sections
//             for (let i = 0; i < kws.length; i++) {
//               const sectionIndex = i % maxSections;
//               html = injectTokenIntoNthSection(
//                 html,
//                 sectionIndex,
//                 `[ANCHOR:${kws[i]}]`
//               );
//             }

//             // Ensure presence only in good spots
//             html = ensureAllKeywordsPresent(html, kws);

//             // Initial anchors from URL map
//             const anchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));

//             // Apply anchors (pre-humanize)
//             html = removeDuplicateSections(html);
//             html = applyAnchorTokens(html, anchors);
//             html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//             html = stripLegacyStubBullets(html);
//             html = enforceKeywordRules(html, kws);
//             html = ensureAllKeywordsPresent(html, kws);
//             html = removeDuplicateSections(html);

//             // Humanize
//             let humanizedHtml = await humanizeHtml(
//               html,
//               {
//                 strength: 0.6,
//                 allowImperfect: true,
//               },
//               `${fileId}-${groupIndex}`
//             );

//             humanizedHtml = removeDuplicateSections(humanizedHtml);
//             humanizedHtml = ensureAllKeywordsPresent(humanizedHtml, kws);

//             // Re-apply anchors AFTER humanization
//             const finalAnchors = Object.keys(urlMap).map((k) => ({
//               keyword: k,
//               url: urlMap[k] || undefined,
//             }));
//             humanizedHtml = applyAnchorTokens(humanizedHtml, finalAnchors);
//             humanizedHtml = humanizedHtml.replace(/\[ANCHOR:[^\]]+\]/g, "");
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

//             glog("Group success", { groupIndex, title: result.title });
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             failedGroups.push({ index: groupIndex, grp });
//             gerr("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(8, Math.min(Math.floor(concurrency), MAX));
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;

//         await Promise.race(Array.from(running));

//         if (failedCount > processedCount * 0.25 && concurrency > 8) {
//           concurrency -= 0.5;
//           gwarn("High failure rate, reducing concurrency:", concurrency);
//         } else if (concurrency < MAX && failedCount < processedCount * 0.08) {
//           concurrency += 0.75;
//           glog("Low failure rate, increasing concurrency:", concurrency);
//         }
//       }

//       // Retry failed once (same pipeline, shortened)
//       if (failedGroups.length) {
//         toast.message(`Retrying ${failedGroups.length} failed item(s)…`);

//         const queue = [...failedGroups];
//         failedGroups.length = 0;

//         const RETRY_CONCURRENCY = 6;
//         const running2 = new Set<Promise<void>>();

//         const runOne = async (grp: KeywordRow[], groupIndex: number) => {
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

//           let html = String(res.html || "").trim();
//           if (!html) throw new Error("Empty html (retry)");

//           const maxSections = 8;
//           for (let i = 0; i < Math.min(kws.length, 4); i++) {
//             html = injectTokenIntoNthSection(
//               html,
//               i % maxSections,
//               `[ANCHOR:${kws[i]}]`
//             );
//           }

//           html = ensureAllKeywordsPresent(html, kws);

//           const anchors = Object.keys(urlMap).map((k) => ({
//             keyword: k,
//             url: urlMap[k] || undefined,
//           }));

//           html = applyAnchorTokens(html, anchors);
//           html = html.replace(/\[ANCHOR:[^\]]+\]/g, "");
//           html = stripLegacyStubBullets(html);
//           html = enforceKeywordRules(html, kws);
//           html = ensureAllKeywordsPresent(html, kws);

//           let humanizedHtml = await humanizeHtml(
//             html,
//             { strength: 0.6, allowImperfect: true },
//             `${fileId}-retry-${groupIndex}`
//           );

//           humanizedHtml = ensureAllKeywordsPresent(humanizedHtml, kws);
//           humanizedHtml = applyAnchorTokens(humanizedHtml, anchors);
//           humanizedHtml = humanizedHtml.replace(/\[ANCHOR:[^\]]+\]/g, "");

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

//         while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//         while (running2.size || queue.length) {
//           await Promise.race(Array.from(running2));
//           while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
//           await new Promise((r) => setTimeout(r, 80));
//         }
//       }

//       flushNow();

//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "completed",
//                   processedKeywords: baseGroups.length,
//                   failedCount,
//                 }
//               : p
//           )
//         );
//       });

//       const ok = baseGroups.length - failedCount;
//       glog("generateContent DONE", {
//         ok,
//         failedCount,
//         total: baseGroups.length,
//       });
//       toast.success(
//         `✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`
//       );
//       onProgress?.(100);
//     } catch (error) {
//       gerr("generateContent overall error:", error);
//       startTransition(() => {
//         setExcelProjects((prev) =>
//           (prev ?? []).map((p) =>
//             p.id === fileId
//               ? {
//                   ...p,
//                   status: "error",
//                   error:
//                     error instanceof Error ? error.message : String(error),
//                 }
//               : p
//           )
//         );
//       });
//       toast.error(
//         `Failed processing ${file.name}: ${
//           error instanceof Error ? error.message : String(error)
//         }`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//       glog("generateContent FINALLY: isProcessing=false");
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
//       setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success("All projects cleared");
//   };

//   return {
//     generateContent,
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

// /** Grouping helpers */

// function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) {
//     groups.push(rows.slice(i, i + size));
//   }
//   return groups;
// }

// function sampleDistinct<T>(arr: T[], size: number): T[] {
//   if (size <= 0) return [];
//   if (!arr.length) return [];
//   if (size === 1) {
//     return [arr[Math.floor(Math.random() * arr.length)]];
//   }
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



// function buildGroupsCustom(
//   rows: KeywordRow[],
//   size: KeywordMode,
//   count: number
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) {
//     groups.push(sampleDistinct(rows, size));
//   }
//   return groups;
// }




// // src/hooks/use-content-generation.ts

// import {
//   useState,
//   startTransition,
//   useRef,
// } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import {
//   generateJSONTitleHtml,
//   applyAnchorTokens,
// } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type {
//   ContentPreferences,
//   KeywordMode,
// } from "@/hooks/use-preferences";
// import useHumanizeContent from "@/hooks/use-humanize-content";

// /** Logging */

// const GL = "[GEN]";
// const glog = (...a: any[]) => console.log(GL, ...a);
// const gwarn = (...a: any[]) => console.warn(GL, ...a);
// const gerr = (...a: any[]) => console.error(GL, ...a);

// /** Preferences */

// const PREF_KEY = "content-preferences_v3";

// function getDefaultPrefs(): ContentPreferences {
//   return {
//     keywordMode: 1,
//     targetWords: 500,
//     extraInstructions: "",
//     mood: "Informative",
//     paragraphWords: 100,
//     includeConclusion: true,
//     customModeEnabled: false,
//     articleCount: 1,
//     language: "English (UK)",
//     totalContentWords: 800,
//     titleLength: 100,
//     includeBulletPoints: false,
//     includeTables: false,
//     includeEmojis: false,
//     includeBoxesQuotesHighlights: false,
//     includeQandA: false,
//     brandDomainEnabled: false,
//     brandDomain: "",
//   };
// }

// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     const parsed = raw
//       ? (JSON.parse(raw) as Partial<ContentPreferences>)
//       : {};
//     return { ...getDefaultPrefs(), ...parsed };
//   } catch {
//     return getDefaultPrefs();
//   }
// }

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
//   status: "pending" | "processing" | "completed" | "error" | "cancelled";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// /** Editor session helper */

// const SESSION_KEY = "open-content-item_v1";

// export default function openContentEditor(item: ContentItem) {
//   try {
//     try {
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
//     } catch {
//       localStorage.setItem(
//         `${SESSION_KEY}_fallback`,
//         JSON.stringify(item)
//       );
//     }
//     const win = window.open("/content/editor", "_blank");
//     if (!win) {
//       toast.error(
//         "Popup blocked — allow popups to open the editor in a new tab."
//       );
//     }
//   } catch {
//     try {
//       window.location.href = "/content/editor";
//     } catch {
//       // ignore
//     }
//   }
// }

// /** Keyword parsing helpers */

// type KeywordRow = { keyword: string; url?: string | null };

// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function isLikelyUrlOrDomain(s?: string | null) {
//   if (!s) return false;
//   const t = String(s).trim();
//   if (!t) return false;
//   if (/^https?:\/\//i.test(t)) return true;
//   if (/^www\./i.test(t)) return true;
//   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(t) && !/\s/.test(t))
//     return true;
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
//     const nonEmpty = r.filter(
//       (c) => String(c ?? "").trim().length > 0
//     );
//     if (nonEmpty.length >= 2) {
//       headerRowIndex = i;
//       break;
//     }
//   }
//   if (headerRowIndex === -1) headerRowIndex = 0;

//   const headers = (rows[headerRowIndex] as unknown[]).map(norm);

//   let keywordCol = -1;
//   let urlCol = -1;

//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   if (keywordCol === -1) {
//     const lookahead = rows.slice(
//       headerRowIndex + 1,
//       headerRowIndex + 201
//     );
//     const maxCols = Math.max(
//       ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//       0
//     );
//     let bestCol = -1;
//     let bestScore = 0;

//     for (let c = 0; c < maxCols; c++) {
//       let score = 0;
//       let checks = 0;
//       for (const rr of lookahead) {
//         if (!Array.isArray(rr)) continue;
//         const s = sanitizeKeyword(rr[c]);
//         if (s) score++;
//         if (
//           rr[c] !== undefined &&
//           rr[c] !== null &&
//           String(rr[c]).trim() !== ""
//         ) {
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
//     if (bestCol !== -1) keywordCol = bestCol;
//   }

//   return {
//     headerRowIndex,
//     keywordCol: keywordCol === -1 ? null : keywordCol,
//     urlCol: urlCol === -1 ? null : urlCol,
//   };
// }

// function extractKeywordsFromWorksheetWithUrls(
//   worksheet: XLSX.WorkSheet
// ): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
//     header: 1,
//     raw: true,
//   }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

//   const { headerRowIndex, keywordCol, urlCol } =
//     detectHeaderRowAndColumns(rows);

//   const start = Math.min(rows.length - 1, headerRowIndex + 1);
//   const dataRows = rows.slice(start);
//   const maxCols = Math.max(
//     ...rows.map((r) => (Array.isArray(r) ? r.length : 0)),
//     0
//   );

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

// function extractKeywordsFromWorkbookBufferWithUrls(
//   buffer: ArrayBuffer | Uint8Array
// ) {
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

// /** HTML helpers */

// function stripLegacyStubBullets(html: string): string {
//   let out = html.replace(
//     /<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi,
//     ""
//   );
//   out = out.replace(
//     /<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi,
//     ""
//   );
//   out = out.replace(/<ul>\s*<\/ul>/gi, "");
//   out = out.replace(/<ol>\s*<\/ol>/gi, "");
//   return out;
// }

// function getWordCount(html: string): number {
//   const text = html
//     .replace(/<[^>]+>/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
//   if (!text) return 0;
//   return text.split(/\s+/).length;
// }

// function adjustWordCount(html: string, targetWords: number): string {
//   const currentWords = getWordCount(html);
//   const delta = Math.max(30, Math.round(targetWords * 0.05));
//   const min = Math.max(50, targetWords - delta);
//   const max = targetWords + delta;

//   if (currentWords >= min && currentWords <= max) return html;

//   if (currentWords > max) {
//     const paragraphs = html.split(/<\/p>/i);
//     let trimmed = "";
//     let wordCount = 0;

//     for (let i = 0; i < paragraphs.length; i++) {
//       const para =
//         paragraphs[i] +
//         (i < paragraphs.length - 1 ? "</p>" : "");
//       const paraWords = getWordCount(para);

//       if (wordCount + paraWords <= max) {
//         trimmed += para;
//         wordCount += paraWords;
//       } else {
//         const words = para
//           .replace(/<[^>]+>/g, " ")
//           .split(/\s+/)
//           .filter((w) => w.length > 0);
//         const wordsToKeep = Math.max(10, max - wordCount);
//         if (
//           wordsToKeep > 0 &&
//           wordsToKeep < words.length
//         ) {
//           const trimmedPara = words
//             .slice(0, wordsToKeep)
//             .join(" ");
//           trimmed += para.replace(
//             />[^<]+</,
//             `>${trimmedPara}<`
//           );
//         }
//         break;
//       }
//     }

//     return trimmed || html;
//   }

//   return html;
// }

// function limitSections(
//   html: string,
//   maxSections: number
// ): string {
//   if (!html || maxSections <= 0) return html;

//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   const sections: Array<{ index: number; content: string }> =
//     [];
//   let match: RegExpExecArray | null;

//   while ((match = h2Regex.exec(html)) !== null) {
//     const sectionStart = match.index;
//     const afterHeading =
//       html.slice(sectionStart + match[0].length);
//     const nextH2Match = afterHeading.match(/<h2>/i);
//     const sectionEnd =
//       nextH2Match && nextH2Match.index !== undefined
//         ? sectionStart +
//           match[0].length +
//           nextH2Match.index
//         : html.length;

//     const sectionContent = html.slice(
//       sectionStart,
//       sectionEnd
//     );
//     sections.push({ index: sectionStart, content: sectionContent });
//   }

//   if (sections.length <= maxSections) return html;

//   const keepSections = sections.slice(0, maxSections);
//   const parts: string[] = [];
//   let currentIndex = 0;

//   for (const section of keepSections) {
//     if (section.index > currentIndex) {
//       parts.push(
//         html.slice(currentIndex, section.index)
//       );
//     }
//     parts.push(section.content);
//     currentIndex =
//       section.index + section.content.length;
//   }

//   if (currentIndex < html.length) {
//     const lastKeptSection =
//       keepSections[keepSections.length - 1];
//     const endOfLastSection =
//       lastKeptSection.index +
//       lastKeptSection.content.length;
//     parts.push(
//       html
//         .slice(endOfLastSection, html.length)
//         .split(/<h2>/i)[0]
//     );
//   }

//   return parts.join("");
// }

// function removeDuplicateSections(html: string): string {
//   if (!html) return html;

//   const h2Regex = /<h2>([\s\S]*?)<\/h2>/gi;
//   const sections: Array<{
//     heading: string;
//     content: string;
//     index: number;
//   }> = [];
//   let match: RegExpExecArray | null;

//   while ((match = h2Regex.exec(html)) !== null) {
//     const heading = match[1].trim().toLowerCase();
//     const sectionStart = match.index;
//     const afterHeading =
//       html.slice(sectionStart + match[0].length);
//     const nextH2Match = afterHeading.match(/<h2>/i);
//     const sectionEnd =
//       nextH2Match && nextH2Match.index !== undefined
//         ? sectionStart +
//           match[0].length +
//           nextH2Match.index
//         : html.length;
//     const sectionContent = html.slice(
//       sectionStart,
//       sectionEnd
//     );

//     sections.push({
//       heading,
//       content: sectionContent,
//       index: sectionStart,
//     });
//   }

//   if (sections.length === 0) return html;

//   const seenHeadings = new Set<string>();
//   const uniqueSections: typeof sections = [];
//   const headingFirstOccurrence = new Map<
//     string,
//     number
//   >();

//   for (let i = 0; i < sections.length; i++) {
//     const section = sections[i];

//     const contentAfterHeading = section.content
//       .replace(/<h2>[\s\S]*?<\/h2>/i, "")
//       .replace(/<[^>]+>/g, " ")
//       .replace(/\[ANCHOR:[^\]]+\]/g, "")
//       .replace(/\s+/g, " ")
//       .trim()
//       .toLowerCase();

//     const contentSignature =
//       contentAfterHeading.slice(0, 300);

//     if (seenHeadings.has(section.heading)) {
//       const firstIdx =
//         headingFirstOccurrence.get(
//           section.heading
//         )!;
//       const firstSection = sections[firstIdx];
//       const firstContentSignature =
//         firstSection.content
//           .replace(/<h2>[\s\S]*?<\/h2>/i, "")
//           .replace(/<[^>]+>/g, " ")
//           .replace(/\[ANCHOR:[^\]]+\]/g, "")
//           .replace(/\s+/g, " ")
//           .trim()
//           .toLowerCase()
//           .slice(0, 300);

//       const compareLen = Math.min(
//         200,
//         firstContentSignature.length,
//         contentSignature.length
//       );
//       if (
//         compareLen > 50 &&
//         firstContentSignature.slice(0, compareLen) ===
//           contentSignature.slice(0, compareLen)
//       ) {
//         continue;
//       }
//       continue;
//     }

//     let isContentDuplicate = false;
//     for (const uniqueSection of uniqueSections) {
//       const uniqueContentSignature =
//         uniqueSection.content
//           .replace(/<h2>[\s\S]*?<\/h2>/i, "")
//           .replace(/<[^>]+>/g, " ")
//           .replace(/\[ANCHOR:[^\]]+\]/g, "")
//           .replace(/\s+/g, " ")
//           .trim()
//           .toLowerCase()
//           .slice(0, 300);

//       const compareLen = Math.min(
//         200,
//         uniqueContentSignature.length,
//         contentSignature.length
//       );
//       if (
//         compareLen > 100 &&
//         uniqueContentSignature.slice(
//           0,
//           compareLen
//         ) === contentSignature.slice(0, compareLen)
//       ) {
//         isContentDuplicate = true;
//         break;
//       }
//     }

//     if (isContentDuplicate) continue;

//     seenHeadings.add(section.heading);
//     headingFirstOccurrence.set(section.heading, i);
//     uniqueSections.push(section);
//   }

//   if (uniqueSections.length === sections.length)
//     return html;

//   const parts: string[] = [];
//   let currentIndex = 0;

//   for (const section of uniqueSections) {
//     if (section.index > currentIndex) {
//       parts.push(
//         html.slice(currentIndex, section.index)
//       );
//     }
//     parts.push(section.content);
//     currentIndex =
//       section.index + section.content.length;
//   }

//   if (currentIndex < html.length) {
//     const remaining = html.slice(currentIndex);
//     if (!remaining.trim().startsWith("<h2>")) {
//       parts.push(remaining);
//     }
//   }

//   return parts.join("");
// }

// /** Ensure all keywords present in good spots */

// function ensureAllKeywordsPresent(
//   html: string,
//   keywords: string[]
// ): string {
//   if (!keywords || keywords.length === 0) return html;

//   const paraRegex = /<p[^>]*>[\s\S]*?<\/p>/gi;
//   const paragraphs: Array<{
//     match: string;
//     index: number;
//     hasToken: boolean;
//   }> = [];
//   let m: RegExpExecArray | null;
//   while ((m = paraRegex.exec(html)) !== null) {
//     paragraphs.push({
//       match: m[0],
//       index: m.index,
//       hasToken: m[0].includes("[ANCHOR:"),
//     });
//   }

//   const missingKeywords: string[] = [];

//   for (const kwRaw of keywords) {
//     const kw = (kwRaw || "").trim();
//     if (!kw) continue;

//     const kwLower = kw.toLowerCase();
//     const safe = kwLower.replace(
//       /[.*+?^${}()|[\]\\]/g,
//       "\\$&"
//     );

//     const hasToken =
//       html.includes(`[ANCHOR:${kw}]`) ||
//       html
//         .toLowerCase()
//         .includes(`[anchor:${kwLower}]`);

//     const hasAnchor = new RegExp(
//       `<a[^>]*>[^<]*${safe}[^<]*<\\/a>`,
//       "i"
//     ).test(html);
//     const hasStrong = new RegExp(
//       `<strong[^>]*>[^<]*${safe}[^<]*<\\/strong>`,
//       "i"
//     ).test(html);

//     let hasPlainInParagraph = false;
//     if (paragraphs.length) {
//       const plainRe = new RegExp(
//         `\\b${safe}\\b`,
//         "i"
//       );
//       for (const p of paragraphs) {
//         const text = p.match
//           .replace(/<a[^>]*>[\s\S]*?<\/a>/gi, " ")
//           .replace(
//             /<strong[^>]*>[\s\S]*?<\/strong>/gi,
//             " "
//           )
//           .replace(/<[^>]+>/g, " ")
//           .toLowerCase();
//         if (plainRe.test(text)) {
//           hasPlainInParagraph = true;
//           break;
//         }
//       }
//     }

//     if (
//       !hasToken &&
//       !hasAnchor &&
//       !hasStrong &&
//       !hasPlainInParagraph
//     ) {
//       missingKeywords.push(kw);
//     }
//   }

//   if (!missingKeywords.length) return html;

//   let result = html;
//   const replacements: Array<{
//     index: number;
//     old: string;
//     nw: string;
//   }> = [];
//   let keywordIndex = 0;

//   for (
//     let i = paragraphs.length - 1;
//     i >= 0 && keywordIndex < missingKeywords.length;
//     i--
//   ) {
//     const para = paragraphs[i];
//     if (para.hasToken) continue;

//     const kw = missingKeywords[keywordIndex];
//     const inner = para.match
//       .replace(/^<p[^>]*>/i, "")
//       .replace(/<\/p>$/i, "")
//       .trim();
//     const words = inner.split(/\s+/).filter(Boolean);

//     let nw: string;
//     if (words.length >= 3) {
//       const insertAt = Math.max(
//         1,
//         Math.floor(words.length * 0.5)
//       );
//       nw =
//         "<p>" +
//         words.slice(0, insertAt).join(" ") +
//         ` [ANCHOR:${kw}] ` +
//         words.slice(insertAt).join(" ") +
//         "</p>";
//     } else {
//       nw = `<p>${inner} [ANCHOR:${kw}]</p>`;
//     }

//     replacements.push({
//       index: para.index,
//       old: para.match,
//       nw,
//     });
//     keywordIndex++;
//   }

//   replacements.sort((a, b) => b.index - a.index);
//   for (const rep of replacements) {
//     result =
//       result.slice(0, rep.index) +
//       rep.nw +
//       result.slice(
//         rep.index + rep.old.length
//       );
//   }

//   const remaining =
//     missingKeywords.slice(keywordIndex);
//   if (remaining.length > 0) {
//     const tokens = remaining
//       .map((kw) => `[ANCHOR:${kw}]`)
//       .join(" ");
//     result += `<p>${tokens}</p>`;
//   }

//   return result;
// }

// /** Enforce one keyword per <p> */

// function enforceKeywordRules(
//   html: string,
//   keywords: string[]
// ): string {
//   if (!keywords || !keywords.length) return html;

//   const paraRegex = /<p>([\s\S]*?)<\/p>/gi;
//   let match: RegExpExecArray | null;
//   const parts: string[] = [];
//   let lastIndex = 0;

//   while ((match = paraRegex.exec(html)) !== null) {
//     if (match.index > lastIndex) {
//       parts.push(
//         html.slice(lastIndex, match.index)
//       );
//     }
//     parts.push(match[0]);
//     lastIndex =
//       match.index + match[0].length;
//   }
//   if (lastIndex < html.length) {
//     parts.push(html.slice(lastIndex));
//   }

//   const processed: string[] = [];

//   for (const chunk of parts) {
//     if (!chunk.match(/<p>/i)) {
//       processed.push(chunk);
//       continue;
//     }

//     let para = chunk;

//     const anchorKeywords: string[] = [];
//     const anchorRegex =
//       /<a[^>]*>([^<]+)<\/a>/gi;
//     let aMatch: RegExpExecArray | null;
//     while ((aMatch = anchorRegex.exec(para)) !== null) {
//       const t = aMatch[1].trim().toLowerCase();
//       for (const kw of keywords) {
//         if (t === kw.toLowerCase())
//           anchorKeywords.push(kw);
//       }
//     }

//     const strongKeywords: string[] = [];
//     const strongRegex =
//       /<strong>([^<]+)<\/strong>/gi;
//     let sMatch: RegExpExecArray | null;
//     while ((sMatch = strongRegex.exec(para)) !== null) {
//       const t = sMatch[1].trim().toLowerCase();
//       for (const kw of keywords) {
//         if (t === kw.toLowerCase())
//           strongKeywords.push(kw);
//       }
//     }

//     const preserved = [
//       ...new Set([
//         ...anchorKeywords,
//         ...strongKeywords,
//       ]),
//     ];

//     const plainText = para
//       .replace(/<[^>]+>/g, " ")
//       .toLowerCase();
//     const found: string[] = [...preserved];

//     for (const kw of keywords) {
//       if (preserved.includes(kw)) continue;
//       const re = new RegExp(
//         `\\b${kw.replace(
//           /[.*+?^${}()|[\]\\]/g,
//           "\\$&"
//         )}\\b`,
//         "i"
//       );
//       if (re.test(plainText)) found.push(kw);
//     }

//     if (found.length <= 1) {
//       processed.push(para);
//       continue;
//     }

//     let processedPara = para;

//     if (preserved.length > 0) {
//       const toRemove = found.filter(
//         (k) => !preserved.includes(k)
//       );
//       for (const kw of toRemove) {
//         const esc = kw.replace(
//           /[.*+?^${}()|[\]\\]/g,
//           "\\$&"
//         );
//         const re = new RegExp(
//           `\\b${esc}\\b`,
//           "gi"
//         );
//         processedPara = processedPara.replace(
//           re,
//           (m, offset) => {
//             const before = processedPara.slice(
//               Math.max(0, offset - 80),
//               offset
//             );
//             const after = processedPara.slice(
//               offset + m.length,
//               offset + m.length + 80
//             );
//             const inA =
//               before.lastIndexOf("<a") >
//                 before.lastIndexOf(
//                   "</a>"
//                 ) && after.includes("</a>");
//             const inS =
//               before.lastIndexOf(
//                 "<strong"
//               ) >
//                 before.lastIndexOf(
//                   "</strong>"
//                 ) && after.includes("</strong>");
//             return inA || inS ? m : "";
//           }
//         );
//       }
//     } else {
//       for (let i = 1; i < found.length; i++) {
//         const kw = found[i];
//         const esc = kw.replace(
//           /[.*+?^${}()|[\]\\]/g,
//           "\\$&"
//         );
//         const re = new RegExp(
//           `\\b${esc}\\b`,
//           "gi"
//         );
//         let keptOnce = false;
//         processedPara = processedPara.replace(
//           re,
//           (m, offset) => {
//             if (!keptOnce) {
//               keptOnce = true;
//               return m;
//             }
//             const before =
//               processedPara.slice(
//                 Math.max(0, offset - 80),
//                 offset
//               );
//             const after =
//               processedPara.slice(
//                 offset + m.length,
//                 offset +
//                   m.length +
//                   80
//               );
//             const inA =
//               before.lastIndexOf("<a") >
//                 before.lastIndexOf(
//                   "</a>"
//                 ) && after.includes("</a>");
//             const inS =
//               before.lastIndexOf(
//                 "<strong"
//               ) >
//                 before.lastIndexOf(
//                   "</strong"
//                 ) &&
//               after.includes("</strong>");
//             return inA || inS ? m : "";
//           }
//         );
//       }
//     }

//     processed.push(processedPara);
//   }

//   return processed.join("");
// }

// /** Inject token into nth <h2> section */

// function injectTokenIntoNthSection(
//   html: string,
//   sectionIndexZero: number,
//   token: string
// ): string {
//   const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
//   let match: RegExpExecArray | null;
//   const h2Matches: Array<{
//     index: number;
//     match: string;
//   }> = [];

//   while ((match = h2Regex.exec(html)) !== null) {
//     h2Matches.push({
//       index: match.index,
//       match: match[0],
//     });
//   }

//   if (!h2Matches.length) {
//     const firstP = html.match(
//       /<p>[\s\S]*?<\/p>/i
//     );
//     if (firstP) {
//       const pHtml = firstP[0];
//       const inner = pHtml
//         .replace(/^<p>|<\/p>$/gi, "")
//         .trim();
//       const words = inner
//         .split(/\s+/)
//         .filter(Boolean);
//       if (words.length >= 3) {
//         const insertAt = Math.max(
//           1,
//           Math.floor(words.length * 0.5)
//         );
//         const withToken =
//           "<p>" +
//           words.slice(0, insertAt).join(" ") +
//           " " +
//           token +
//           " " +
//           words.slice(insertAt).join(" ") +
//           "</p>";
//         return html.replace(
//           pHtml,
//           withToken
//         );
//       }
//       return html.replace(
//         pHtml,
//         `<p>${inner} ${token}</p>`
//       );
//     }
//     return html + " " + token;
//   }

//   const maxIndex = Math.min(
//     sectionIndexZero,
//     h2Matches.length - 1
//   );
//   const target = h2Matches[maxIndex];
//   const before =
//     html.slice(
//       0,
//       target.index + target.match.length
//     );
//   const after = html.slice(
//     target.index + target.match.length
//   );

//   const pMatch = after.match(
//     /<p>[\s\S]*?<\/p>/i
//   );
//   if (!pMatch) {
//     return (
//       before +
//       `<p>${token}</p>` +
//       after
//     );
//   }

//   const pHtml = pMatch[0];
//   const inner = pHtml
//     .replace(/^<p>|<\/p>$/gi, "")
//     .trim();
//   const words = inner
//     .split(/\s+/)
//     .filter(Boolean);

//   let withToken: string;
//   if (words.length >= 3) {
//     let insertAt = Math.max(
//       1,
//       Math.floor(words.length * 0.55)
//     );
//     if (insertAt > words.length - 2) {
//       insertAt = Math.max(
//         1,
//         words.length - 2
//       );
//     }
//     withToken =
//       "<p>" +
//       words.slice(0, insertAt).join(" ") +
//       " " +
//       token +
//       " " +
//       words.slice(insertAt).join(" ") +
//       "</p>";
//   } else {
//     withToken = `<p>${inner} ${token}</p>`;
//   }

//   const replacedAfter = after.replace(
//     pHtml,
//     withToken
//   );
//   return before + replacedAfter;
// }

// /** Normalize duplicate conclusions: keep only last */

// function normalizeConclusion(html: string): string {
//   if (!html) return html;

//   const re =
//     /<h2[^>]*>\s*conclusion\s*<\/h2>/gi;
//   const blocks: { start: number; end: number }[] = [];

//   let m: RegExpExecArray | null;
//   while ((m = re.exec(html)) !== null) {
//     const start = m.index;
//     const afterHeading =
//       start + m[0].length;
//     const nextH2 = html
//       .slice(afterHeading)
//       .match(/<h2[^>]*>/i);
//     const end = nextH2
//       ? afterHeading +
//         (nextH2.index as number)
//       : html.length;
//     blocks.push({ start, end });
//   }

//   if (blocks.length <= 1) return html;

//   const keep =
//     blocks[blocks.length - 1];
//   let out = "";
//   let cursor = 0;

//   for (let i = 0; i < blocks.length - 1; i++) {
//     const b = blocks[i];
//     out += html.slice(cursor, b.start);
//     cursor = b.end;
//   }

//   out += html.slice(cursor);
//   return out;
// }

// /** Grouping helpers */

// function buildGroupsNormal(
//   rows: KeywordRow[],
//   size: KeywordMode
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < rows.length; i += size) {
//     groups.push(rows.slice(i, i + size));
//   }
//   return groups;
// }

// function sampleDistinct<T>(
//   arr: T[],
//   size: number
// ): T[] {
//   if (size <= 0) return [];
//   if (!arr.length) return [];
//   if (size === 1) {
//     return [
//       arr[
//         Math.floor(
//           Math.random() * arr.length
//         )
//       ],
//     ];
//   }
//   const taken = new Set<number>();
//   while (
//     taken.size <
//     Math.min(size, arr.length)
//   ) {
//     taken.add(
//       Math.floor(
//         Math.random() * arr.length
//       )
//     );
//   }
//   const out = Array.from(taken).map(
//     (i) => arr[i]
//   );
//   while (out.length < size) {
//     out.push(
//       arr[
//         Math.floor(
//           Math.random() * arr.length
//         )
//       ]
//     );
//   }
//   return out;
// }

// function buildGroupsCustom(
//   rows: KeywordRow[],
//   size: KeywordMode,
//   count: number
// ): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) {
//     groups.push(
//       sampleDistinct(rows, size)
//     );
//   }
//   return groups;
// }

// /** Hook: useContentGeneration */

// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] =
//     useState(false);

//   const [contentItems, setContentItems] =
//     useLocalStorage<ContentItem[]>(
//       "content-items",
//       []
//     );
//   const [excelProjects, setExcelProjects] =
//     useLocalStorage<ExcelProject[]>(
//       "excel-projects",
//       []
//     );

//   const { humanizeHtml } = useHumanizeContent();
//   const cancelFlagsRef =
//     useRef<Record<string, boolean>>({});

//   const ensureProject = (
//     proj: Partial<ExcelProject> & {
//       id: string;
//       fileName: string;
//     }
//   ) => {
//     startTransition(() => {
//       setExcelProjects((prev = []) => {
//         const exists = (prev || []).some(
//           (p) => p.id === proj.id
//         );
//         const base: ExcelProject = {
//           id: proj.id,
//           fileName: proj.fileName,
//           status:
//             (proj as any).status ??
//             "pending",
//           totalKeywords:
//             (proj as any)
//               .totalKeywords ?? 0,
//           processedKeywords:
//             (proj as any)
//               .processedKeywords ?? 0,
//           createdAt:
//             (proj as any).createdAt ??
//             new Date().toISOString(),
//           error: (proj as any).error,
//           failedCount:
//             (proj as any)
//               .failedCount ?? 0,
//         };
//         return exists
//           ? (prev || []).map((p) =>
//               p.id === proj.id
//                 ? { ...p, ...base }
//                 : p
//             )
//           : [...(prev || []), base];
//       });
//     });
//   };

//   const cancelProject = (projectId: string) => {
//     cancelFlagsRef.current[projectId] =
//       true;
//     startTransition(() => {
//       setExcelProjects((prev = []) =>
//         (prev || []).map((p) =>
//           p.id === projectId
//             ? {
//                 ...p,
//                 status: "cancelled",
//               }
//             : p
//         )
//       );
//     });
//     setIsProcessing(false);
//     toast.success(
//       "Generation cancelled for this project."
//     );
//   };

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: (p: number) => void
//   ) => {
//     cancelFlagsRef.current[fileId] =
//       false;
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 80;

//     const flushNow = () => {
//       scheduled = false;
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(
//         0,
//         bufferItems.length
//       );
//       glog("Flushing content items:", {
//         count: toWrite.length,
//       });
//       startTransition(() => {
//         setContentItems(
//           (prev = []) => [
//             ...(prev || []),
//             ...toWrite,
//           ]
//         );
//       });
//     };

//     const scheduleFlush = () => {
//       if (bufferItems.length >= BATCH_SIZE)
//         return flushNow();
//       if (!scheduled) {
//         scheduled = true;
//         queueMicrotask(flushNow);
//       }
//     };

//     let failedCount = 0;
//     let processedCount = 0;
//     const failedGroups: Array<{
//       index: number;
//       grp: KeywordRow[];
//     }> = [];

//     const updateProgress = (
//       processed: number,
//       total: number
//     ) => {
//       startTransition(() => {
//         setExcelProjects(
//           (prev = []) =>
//             (prev || []).map((p) =>
//               p.id === fileId
//                 ? {
//                     ...p,
//                     processedKeywords:
//                       processed,
//                   }
//                 : p
//             )
//         );
//       });
//       try {
//         const pct = Math.round(
//           (processed /
//             Math.max(1, total)) *
//             100
//         );
//         glog("Progress:", {
//           processed,
//           total,
//           pct,
//         });
//         onProgress?.(pct);
//       } catch {
//         // ignore
//       }
//     };

//     try {
//       const buffer =
//         await file.arrayBuffer();
//       const { keywords } =
//         extractKeywordsFromWorkbookBufferWithUrls(
//           buffer
//         );

//       if (!keywords.length) {
//         ensureProject({
//           id: fileId,
//           fileName: file.name,
//           status: "error",
//           error:
//             "No valid keywords found in the uploaded Excel file",
//         });
//         toast.error(
//           "No valid keywords found in the uploaded Excel file."
//         );
//         onProgress?.(100);
//         return;
//       }

//       const prefs = getFreshPrefs();
//       const size = (prefs.keywordMode ??
//         1) as KeywordMode;

//       const baseGroups =
//         prefs.customModeEnabled
//           ? buildGroupsCustom(
//               keywords,
//               size,
//               Math.max(
//                 1,
//                 Math.min(
//                   200,
//                   prefs.articleCount ||
//                     1
//                 )
//               )
//             )
//           : buildGroupsNormal(
//               keywords,
//               size
//             );

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords:
//           baseGroups.length,
//         processedKeywords: 0,
//         failedCount: 0,
//       });

//       toast.info(
//         `Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article`
//       );

//       const cores =
//         navigator.hardwareConcurrency ??
//         4;
//       let concurrency = Math.min(
//         Math.max(8, cores * 2),
//         24
//       );
//       const MAX = 36;

//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (
//           idx >= baseGroups.length ||
//           cancelFlagsRef.current[fileId]
//         )
//           return;

//         const groupIndex = idx++;
//         const grp =
//           baseGroups[groupIndex];

//         const kws = grp.map(
//           (g) => g.keyword
//         );
//         const urlMap: Record<
//           string,
//           string | null
//         > = {};
//         grp.forEach(
//           (g) =>
//             (urlMap[g.keyword] =
//               g.url ?? null)
//         );

//         const task = (async () => {
//           if (
//             cancelFlagsRef.current[fileId]
//           )
//             return;

//           try {
//             glog("Starting group", {
//               groupIndex,
//               keywords: kws,
//             });

//             const plan =
//               buildPlanFromPrefs({
//                 keywords: kws,
//                 prefs,
//                 variationId:
//                   groupIndex + 1,
//               });

//             const result =
//               await generateJSONTitleHtml(
//                 {
//                   keywords: kws,
//                   instructions: plan,
//                   titleLength:
//                     prefs
//                       .titleLength ||
//                     100,
//                 }
//               );

//             let html = String(
//               result.html || ""
//             ).trim();
//             if (!html)
//               throw new Error(
//                 "Empty html from model"
//               );

//             if (
//               prefs.totalContentWords &&
//               prefs
//                 .totalContentWords > 0
//             ) {
//               html = adjustWordCount(
//                 html,
//                 prefs
//                   .totalContentWords
//               );
//             }

//             let prevLen =
//               html.length;
//             for (
//               let i = 0;
//               i < 3;
//               i++
//             ) {
//               html =
//                 removeDuplicateSections(
//                   html
//                 );
//               if (
//                 html.length ===
//                 prevLen
//               )
//                 break;
//               prevLen =
//                 html.length;
//             }

//             const maxSections =
//               8;
//             html = limitSections(
//               html,
//               maxSections
//             );
//             html =
//               removeDuplicateSections(
//                 html
//               );

//             for (
//               let i = 0;
//               i < kws.length;
//               i++
//             ) {
//               const sectionIndex =
//                 i %
//                 maxSections;
//               html =
//                 injectTokenIntoNthSection(
//                   html,
//                   sectionIndex,
//                   `[ANCHOR:${kws[i]}]`
//                 );
//             }

//             html =
//               ensureAllKeywordsPresent(
//                 html,
//                 kws
//               );

//             const anchors =
//               Object.keys(
//                 urlMap
//               ).map((k) => ({
//                 keyword: k,
//                 url:
//                   urlMap[k] ||
//                   undefined,
//               }));

//             html =
//               removeDuplicateSections(
//                 html
//               );
//             html =
//               applyAnchorTokens(
//                 html,
//                 anchors
//               );
//             html =
//               html.replace(
//                 /\[ANCHOR:[^\]]+\]/g,
//                 ""
//               );
//             html =
//               stripLegacyStubBullets(
//                 html
//               );
//             html =
//               enforceKeywordRules(
//                 html,
//                 kws
//               );
//             html =
//               ensureAllKeywordsPresent(
//                 html,
//                 kws
//               );
//             html =
//               removeDuplicateSections(
//                 html
//               );

//             let humanizedHtml =
//               await humanizeHtml(
//                 html,
//                 {
//                   strength: 0.6,
//                   allowImperfect:
//                     true,
//                 },
//                 `${fileId}-${groupIndex}`
//               );

//             humanizedHtml =
//               removeDuplicateSections(
//                 humanizedHtml
//               );
//             humanizedHtml =
//               ensureAllKeywordsPresent(
//                 humanizedHtml,
//                 kws
//               );

//             const finalAnchors =
//               Object.keys(
//                 urlMap
//               ).map((k) => ({
//                 keyword: k,
//                 url:
//                   urlMap[k] ||
//                   undefined,
//               }));

//             humanizedHtml =
//               applyAnchorTokens(
//                 humanizedHtml,
//                 finalAnchors
//               );
//             humanizedHtml =
//               humanizedHtml.replace(
//                 /\[ANCHOR:[^\]]+\]/g,
//                 ""
//               );
//             humanizedHtml =
//               removeDuplicateSections(
//                 humanizedHtml
//               );
//             humanizedHtml =
//               normalizeConclusion(
//                 humanizedHtml
//               );

//             if (
//               cancelFlagsRef.current[fileId]
//             )
//               return;

//             const item: ContentItem =
//               {
//                 id: `${fileId}-${groupIndex}-${Date.now()}`,
//                 keyword: kws[0],
//                 keywordsUsed: kws,
//                 generatedContent:
//                   humanizedHtml,
//                 fileId,
//                 fileName:
//                   file.name,
//                 createdAt:
//                   new Date().toISOString(),
//                 title:
//                   result.title,
//                 targetUrl:
//                   urlMap[kws[0]] ??
//                   null,
//                 urlMap,
//                 status:
//                   "success",
//                 prefsSnapshot: {
//                   mood: prefs.mood,
//                   paragraphWords:
//                     prefs.paragraphWords,
//                   includeConclusion:
//                     prefs.includeConclusion,
//                   language:
//                     prefs.language,
//                   customModeEnabled:
//                     prefs.customModeEnabled,
//                   articleCount:
//                     prefs.articleCount,
//                   keywordMode:
//                     prefs.keywordMode,
//                   includeBulletPoints:
//                     prefs.includeBulletPoints,
//                   includeTables:
//                     prefs.includeTables,
//                   includeEmojis:
//                     prefs.includeEmojis,
//                   includeBoxesQuotesHighlights:
//                     prefs
//                       .includeBoxesQuotesHighlights,
//                   includeQandA:
//                     prefs.includeQandA,
//                   totalContentWords:
//                     prefs.totalContentWords,
//                   titleLength:
//                     prefs.titleLength,
//                   brandDomainEnabled:
//                     prefs.brandDomainEnabled,
//                   brandDomain:
//                     prefs.brandDomain,
//                 },
//               };

//             glog(
//               "Group success",
//               {
//                 groupIndex,
//                 title:
//                   result.title,
//               }
//             );
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             failedGroups.push({
//               index: groupIndex,
//               grp,
//             });
//             gerr(
//               "group generate error:",
//               e
//             );
//           } finally {
//             processedCount += 1;
//             updateProgress(
//               processedCount,
//               baseGroups.length
//             );
//           }
//         })().finally(() =>
//           running.delete(task)
//         );

//         running.add(task);
//       };

//       while (
//         (idx <
//           baseGroups.length ||
//           running.size > 0) &&
//         !cancelFlagsRef.current[fileId]
//       ) {
//         const cur = Math.max(
//           8,
//           Math.min(
//             Math.floor(
//               concurrency
//             ),
//             MAX
//           )
//         );
//         while (
//           !cancelFlagsRef.current[fileId] &&
//           running.size < cur &&
//           idx <
//             baseGroups.length
//         ) {
//           startNext();
//         }
//         if (
//           !running.size &&
//           idx >= baseGroups.length
//         )
//           break;

//         await Promise.race(
//           Array.from(running)
//         );

//         if (
//           failedCount >
//             processedCount *
//               0.25 &&
//           concurrency > 8
//         ) {
//           concurrency -= 0.5;
//           gwarn(
//             "High failure rate, reducing concurrency:",
//             concurrency
//           );
//         } else if (
//           concurrency < MAX &&
//           failedCount <
//             processedCount *
//               0.08
//         ) {
//           concurrency += 0.75;
//           glog(
//             "Low failure rate, increasing concurrency:",
//             concurrency
//           );
//         }
//       }

//       // Retry failed if not cancelled
//       if (
//         failedGroups.length &&
//         !cancelFlagsRef.current[fileId]
//       ) {
//         toast.message(
//           `Retrying ${failedGroups.length} failed item(s)…`
//         );

//         const queue = [...failedGroups];
//         failedGroups.length = 0;

//         const RETRY_CONCURRENCY = 6;
//         const running2 =
//           new Set<Promise<void>>();

//         const runOne = async (
//           grp: KeywordRow[],
//           groupIndex: number
//         ) => {
//           const kws = grp.map(
//             (g) => g.keyword
//           );
//           const urlMap: Record<
//             string,
//             string | null
//           > = {};
//           grp.forEach(
//             (g) =>
//               (urlMap[g.keyword] =
//                 g.url ?? null)
//           );

//           const plan =
//             buildPlanFromPrefs({
//               keywords: kws,
//               prefs,
//               variationId:
//                 groupIndex + 1,
//             });

//           const res =
//             await generateJSONTitleHtml(
//               {
//                 keywords: kws,
//                 instructions:
//                   plan,
//                 titleLength:
//                   prefs
//                     .titleLength ||
//                   100,
//               }
//             );

//           let html = String(
//             res.html || ""
//           ).trim();
//           if (!html)
//             throw new Error(
//               "Empty html (retry)"
//             );

//           const maxSections =
//             8;
//           for (
//             let i = 0;
//             i < Math.min(
//               kws.length,
//               4
//             );
//             i++
//           ) {
//             html =
//               injectTokenIntoNthSection(
//                 html,
//                 i %
//                   maxSections,
//                 `[ANCHOR:${kws[i]}]`
//               );
//           }

//           html =
//             ensureAllKeywordsPresent(
//               html,
//               kws
//             );

//           const anchors =
//             Object.keys(
//               urlMap
//             ).map((k) => ({
//               keyword: k,
//               url:
//                 urlMap[k] ||
//                 undefined,
//             }));

//           html =
//             applyAnchorTokens(
//               html,
//               anchors
//             );
//           html =
//             html.replace(
//               /\[ANCHOR:[^\]]+\]/g,
//               ""
//             );
//           html =
//             stripLegacyStubBullets(
//               html
//             );
//           html =
//             enforceKeywordRules(
//               html,
//               kws
//             );
//           html =
//             ensureAllKeywordsPresent(
//               html,
//               kws
//             );

//           let humanizedHtml =
//             await humanizeHtml(
//               html,
//               {
//                 strength: 0.6,
//                 allowImperfect:
//                   true,
//               },
//               `${fileId}-retry-${groupIndex}`
//             );

//           humanizedHtml =
//             ensureAllKeywordsPresent(
//               humanizedHtml,
//               kws
//             );
//           humanizedHtml =
//             applyAnchorTokens(
//               humanizedHtml,
//               anchors
//             );
//           humanizedHtml =
//             humanizedHtml.replace(
//               /\[ANCHOR:[^\]]+\]/g,
//               ""
//             );
//           humanizedHtml =
//             normalizeConclusion(
//               humanizedHtml
//             );

//           if (
//             cancelFlagsRef.current[fileId]
//           )
//             return;

//           const item: ContentItem =
//             {
//               id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent:
//                 humanizedHtml,
//               fileId,
//               fileName:
//                 file.name,
//               createdAt:
//                 new Date().toISOString(),
//               title:
//                 res.title,
//               targetUrl:
//                 urlMap[kws[0]] ??
//                 null,
//               urlMap,
//               status:
//                 "success",
//               prefsSnapshot: {
//                 mood: prefs.mood,
//                 paragraphWords:
//                   prefs.paragraphWords,
//                 includeConclusion:
//                   prefs.includeConclusion,
//                 language:
//                   prefs.language,
//                 customModeEnabled:
//                   prefs.customModeEnabled,
//                 articleCount:
//                   prefs.articleCount,
//                 keywordMode:
//                   prefs.keywordMode,
//                 includeBulletPoints:
//                   prefs
//                     .includeBulletPoints,
//                 includeTables:
//                   prefs
//                     .includeTables,
//                 includeEmojis:
//                   prefs
//                     .includeEmojis,
//                 includeBoxesQuotesHighlights:
//                   prefs
//                     .includeBoxesQuotesHighlights,
//                 includeQandA:
//                   prefs
//                     .includeQandA,
//                 totalContentWords:
//                   prefs
//                     .totalContentWords,
//                 titleLength:
//                   prefs
//                     .titleLength,
//                 brandDomainEnabled:
//                   prefs
//                     .brandDomainEnabled,
//                 brandDomain:
//                   prefs
//                     .brandDomain,
//               },
//             };

//           bufferItems.push(item);
//           scheduleFlush();
//         };

//         const startNextRetry = () => {
//           if (!queue.length) return;
//           const {
//             grp,
//             index,
//           } = queue.shift()!;
//           const p = (async () => {
//             try {
//               await runOne(grp, index);
//             } catch (e) {
//               gerr(
//                 "retry failed:",
//                 e
//               );
//             }
//           })().finally(() =>
//             running2.delete(p)
//           );
//           running2.add(p);
//         };

//         while (
//           running2.size <
//             RETRY_CONCURRENCY &&
//           queue.length
//         )
//           startNextRetry();
//         while (
//           running2.size ||
//           queue.length
//         ) {
//           await Promise.race(
//             Array.from(running2)
//           );
//           while (
//             running2.size <
//               RETRY_CONCURRENCY &&
//             queue.length
//           )
//             startNextRetry();
//           await new Promise(
//             (r) =>
//               setTimeout(
//                 r,
//                 80
//               )
//           );
//         }
//       }

//       flushNow();

//       const ok =
//         baseGroups.length -
//         failedCount;

//       startTransition(() => {
//         setExcelProjects(
//           (prev = []) =>
//             (prev || []).map((p) =>
//               p.id === fileId
//                 ? {
//                     ...p,
//                     status:
//                       cancelFlagsRef
//                         .current[
//                         fileId
//                       ]
//                         ? "cancelled"
//                         : "completed",
//                     processedKeywords:
//                       baseGroups.length,
//                     failedCount,
//                   }
//                 : p
//             )
//         );
//       });

//       if (
//         cancelFlagsRef.current[fileId]
//       ) {
//         toast.message(
//           `Generation cancelled for ${file.name}. Partial results kept.`
//         );
//       } else {
//         toast.success(
//           `✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`
//         );
//       }

//       onProgress?.(100);
//     } catch (error) {
//       gerr(
//         "generateContent overall error:",
//         error
//       );
//       startTransition(() => {
//         setExcelProjects(
//           (prev = []) =>
//             (prev || []).map((p) =>
//               p.id === fileId
//                 ? {
//                     ...p,
//                     status:
//                       "error",
//                     error:
//                       error instanceof
//                       Error
//                         ? error.message
//                         : String(
//                             error
//                           ),
//                   }
//                 : p
//             )
//         );
//       });
//       toast.error(
//         `Failed processing ${file.name}: ${
//           error instanceof Error
//             ? error.message
//             : String(error)
//         }`
//       );
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//       cancelFlagsRef.current[fileId] =
//         false;
//       glog(
//         "generateContent FINALLY: isProcessing=false"
//       );
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     startTransition(() => {
//       setExcelProjects(
//         (prev = []) =>
//           (prev || []).filter(
//             (p) => p.id !== projectId
//           )
//       );
//       setContentItems(
//         (prev = []) =>
//           (prev || []).filter(
//             (c) =>
//               c.fileId !==
//               projectId
//           )
//       );
//     });
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     startTransition(() => {
//       setExcelProjects([]);
//       setContentItems([]);
//     });
//     toast.success(
//       "All projects cleared"
//     );
//   };

//   return {
//     generateContent,
//     isProcessing,
//     contentItems,
//     setContentItems,
//     excelProjects,
//     setExcelProjects,
//     deleteProject,
//     deleteAllProjects,
//     openContentEditor,
//     cancelProject,
//   };
// }





import { useState, useRef, startTransition } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import * as XLSX from "xlsx";
import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";
import useHumanizeContent from "@/hooks/use-humanize-content";

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
    const esc = lower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
      const esc = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
        const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

  const { humanizeHtml } = useHumanizeContent();
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

            // Humanize
            let humanizedHtml = await humanizeHtml(
              html,
              { strength: 0.6, allowImperfect: true },
              `${fileId}-${groupIndex}`
            );
            if (cancelToken.cancelled) return;

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

          let humanizedHtml = await humanizeHtml(
            html,
            { strength: 0.6, allowImperfect: true },
            `${fileId}-retry-${groupIndex}`
          );
          if (cancelToken.cancelled) return;

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
