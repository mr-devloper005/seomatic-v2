

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





import { useState, startTransition } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import * as XLSX from "xlsx";
import {
  generateJSONTitleHtml,
  applyAnchorTokens,
} from "@/lib/llm/api";
import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
import type {
  ContentPreferences,
  KeywordMode,
} from "@/hooks/use-preferences";

/** ────────────────────────────────────────────────────────────
 * Preferences loader
 * ──────────────────────────────────────────────────────────── */

const PREF_KEY = "content-preferences_v3";

function getFreshPrefs(): ContentPreferences {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    const parsed = raw
      ? (JSON.parse(raw) as Partial<ContentPreferences>)
      : {};
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
}

/** ────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────── */

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

interface ExcelProject {
  id: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "error";
  totalKeywords: number;
  processedKeywords: number;
  createdAt: string;
  error?: string;
  failedCount?: number;
}

type GenerateProgressCallback = (p: number) => void;

/** ────────────────────────────────────────────────────────────
 * Editor session helper
 * ──────────────────────────────────────────────────────────── */

const SESSION_KEY = "open-content-item_v1";

export function openContentEditor(item: ContentItem) {
  try {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(item)
      );
    } catch {
      localStorage.setItem(
        `${SESSION_KEY}_fallback`,
        JSON.stringify(item)
      );
    }
    const win = window.open(
      "/content/editor",
      "_blank"
    );
    if (!win) {
      toast.error(
        "Popup blocked — allow popups to open the editor in a new tab."
      );
    }
  } catch {
    try {
      window.location.href = "/content/editor";
    } catch {
      // ignore
    }
  }
}

/** ────────────────────────────────────────────────────────────
 * Excel parsing (keywords + optional URLs)
 * ──────────────────────────────────────────────────────────── */

function norm(s: unknown) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[.\-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyUrlOrDomain(s?: string | null) {
  if (!s) return false;
  const t = String(s).trim();
  if (!t) return false;
  if (/^https?:\/\//i.test(t)) return true;
  if (/^www\./i.test(t)) return true;
  if (
    /^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(t) &&
    !/\s/.test(t)
  )
    return true;
  return false;
}

function sanitizeKeyword(raw: unknown): string {
  if (raw == null) return "";
  let v = String(raw)
    .replace(/\u00A0/g, " ")
    .trim();
  if (!v) return "";
  v = v.replace(
    /^\(?\s*\d+[\.\):-]?\s*/u,
    ""
  ).trim();
  v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
  if (/^[\d\.,\s]+$/.test(v)) return "";
  if (isLikelyUrlOrDomain(v)) return "";
  if (
    (v.match(/[\p{L}\p{N}]/gu) || []).length < 2
  )
    return "";
  v = v
    .replace(/^[\W_]+|[\W_]+$/g, "")
    .trim();
  if (v.length < 2 || v.length > 180)
    return "";
  return v;
}

type KeywordRow = {
  keyword: string;
  url?: string | null;
};

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

function detectHeaderRowAndColumns(
  rows: unknown[][]
) {
  let headerRowIndex = -1;
  const maxCheck = Math.min(rows.length, 6);

  for (let i = 0; i < maxCheck; i++) {
    const r = rows[i];
    if (!Array.isArray(r)) continue;
    const nonEmpty = r.filter(
      (c) =>
        String(c ?? "")
          .trim()
          .length > 0
    );
    if (nonEmpty.length >= 2) {
      headerRowIndex = i;
      break;
    }
  }
  if (headerRowIndex === -1)
    headerRowIndex = 0;

  const headers = (rows[
    headerRowIndex
  ] as unknown[]).map(norm);

  let keywordCol = -1;
  let urlCol = -1;

  headers.forEach((h, idx) => {
    if (
      keywordCol === -1 &&
      KW_HEADERS.has(h)
    )
      keywordCol = idx;
    if (
      urlCol === -1 &&
      URL_HEADERS.has(h)
    )
      urlCol = idx;
  });

  if (keywordCol === -1) {
    const lookahead = rows.slice(
      headerRowIndex + 1,
      headerRowIndex + 201
    );
    const maxCols = Math.max(
      ...rows.map((r) =>
        Array.isArray(r) ? r.length : 0
      ),
      0
    );
    let bestCol = -1;
    let bestScore = 0;

    for (let c = 0; c < maxCols; c++) {
      let score = 0;
      let checks = 0;
      for (const rr of lookahead) {
        if (!Array.isArray(rr)) continue;
        const s = sanitizeKeyword(rr[c]);
        if (s) score++;
        if (
          rr[c] !== undefined &&
          rr[c] !== null &&
          String(rr[c]).trim() !== ""
        ) {
          checks++;
        }
      }
      const weighted =
        score * 100 +
        Math.min(checks, 100);
      if (checks === 0) continue;
      if (weighted > bestScore) {
        bestScore = weighted;
        bestCol = c;
      }
    }
    if (bestCol !== -1)
      keywordCol = bestCol;
  }

  return {
    headerRowIndex,
    keywordCol:
      keywordCol === -1 ? null : keywordCol,
    urlCol:
      urlCol === -1 ? null : urlCol,
  };
}

function extractKeywordsFromWorksheetWithUrls(
  worksheet: XLSX.WorkSheet
): KeywordRow[] {
  const rows =
    XLSX.utils.sheet_to_json<unknown[]>(
      worksheet,
      { header: 1, raw: true }
    ) as unknown[][];

  if (!rows || rows.length === 0)
    return [];

  const {
    headerRowIndex,
    keywordCol,
    urlCol,
  } = detectHeaderRowAndColumns(rows);

  const start = Math.min(
    rows.length - 1,
    headerRowIndex + 1
  );
  const dataRows = rows.slice(start);
  const maxCols = Math.max(
    ...rows.map((r) =>
      Array.isArray(r) ? r.length : 0
    ),
    0
  );

  const out: KeywordRow[] = [];
  const seen = new Set<string>();

  for (const r of dataRows) {
    if (!Array.isArray(r)) continue;

    let k = "";
    if (keywordCol != null)
      k = sanitizeKeyword(
        r[keywordCol]
      );

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
      const raw = String(
        r[urlCol] ?? ""
      ).trim();
      if (raw && isLikelyUrlOrDomain(raw)) {
        url = /^https?:\/\//i.test(raw)
          ? raw
          : "https://" + raw;
      }
    }

    if (!url) {
      for (
        let offset = -3;
        offset <= 3;
        offset++
      ) {
        if (offset === 0) continue;
        const idx =
          (keywordCol ?? 0) + offset;
        if (idx < 0 || idx >= maxCols)
          continue;
        const maybe = r[idx];
        if (!maybe) continue;
        const s = String(maybe).trim();
        if (isLikelyUrlOrDomain(s)) {
          url = /^https?:\/\//i.test(s)
            ? s
            : "https://" + s;
          break;
        }
      }
    }

    out.push({ keyword: k, url });
    seen.add(k);
  }

  return out;
}

function extractKeywordsFromWorkbookBufferWithUrls(
  buffer: ArrayBuffer | Uint8Array
) {
  const workbook = XLSX.read(buffer, {
    type: "array",
  });
  const sheetNames =
    workbook.SheetNames ?? [];
  const combined: KeywordRow[] = [];
  const seen = new Set<string>();

  for (const sheetName of sheetNames) {
    try {
      const sheet =
        workbook.Sheets[sheetName];
      const ks =
        extractKeywordsFromWorksheetWithUrls(
          sheet
        );
      for (const k of ks) {
        if (!seen.has(k.keyword)) {
          seen.add(k.keyword);
          combined.push(k);
        }
      }
      if (combined.length > 10000)
        break;
    } catch (e) {
      console.warn(
        "worksheet parse failed:",
        sheetName,
        e
      );
    }
  }

  return { keywords: combined };
}

/** ────────────────────────────────────────────────────────────
 * Small HTML helpers
 * ──────────────────────────────────────────────────────────── */

function stripLegacyStubBullets(
  html: string
): string {
  let out = html.replace(
    /<li>\s*(Practical tip|Common mistake|Quick win)\s*<\/li>/gi,
    ""
  );
  out = out.replace(
    /<p>\s*(Practical tip|Common mistake|Quick win)\s*<\/p>/gi,
    ""
  );
  out = out.replace(/<ul>\s*<\/ul>/gi, "");
  out = out.replace(/<ol>\s*<\/ol>/gi, "");
  return out;
}

function injectTokenIntoNthSection(
  html: string,
  sectionIndexZero: number,
  token: string
): string {
  const h2Regex = /<h2>[\s\S]*?<\/h2>/gi;
  let match: RegExpExecArray | null;
  let idx = -1;
  let lastEnd = 0;
  const out: string[] = [];

  while ((match = h2Regex.exec(html)) !== null) {
    out.push(html.slice(lastEnd, match.index));
    const h2 = match[0];
    out.push(h2);
    lastEnd = match.index + h2.length;
    idx++;

    if (idx === sectionIndexZero) {
      const after = html.slice(lastEnd);
      const pMatch =
        after.match(
          /<p>[\s\S]*?<\/p>/i
        );
      if (!pMatch) {
        out.push(after);
        return out.join("");
      }
      const pHtml = pMatch[0];
      const inner = pHtml
        .replace(/^<p>|<\/p>$/gi, "")
        .trim();
      const words = inner.split(/\s+/);
      if (words.length < 6) {
        out.push(after);
        return out.join("");
      }
      let insertAt = Math.max(
        3,
        Math.floor(
          words.length * 0.55
        )
      );
      if (insertAt > words.length - 4) {
        insertAt = Math.max(
          3,
          words.length - 4
        );
      }
      const withToken =
        "<p>" +
        words
          .slice(0, insertAt)
          .join(" ") +
        " " +
        token +
        " " +
        words
          .slice(insertAt)
          .join(" ") +
        "</p>";
      const replaced = after.replace(
        pHtml,
        withToken
      );
      out.push(replaced);
      out.push(
        html.slice(
          match.index +
            h2.length +
            after.length
        )
      );
      return out.join("");
    }
  }

  out.push(html.slice(lastEnd));
  return out.join("");
}

/** ────────────────────────────────────────────────────────────
 * Main hook
 * ──────────────────────────────────────────────────────────── */

export function useContentGeneration() {
  const [isProcessing, setIsProcessing] =
    useState(false);

  const [contentItems, setContentItems] =
    useLocalStorage<ContentItem[]>(
      "content-items",
      []
    );

  const [excelProjects, setExcelProjects] =
    useLocalStorage<ExcelProject[]>(
      "excel-projects",
      []
    );

  const ensureProject = (
    proj: Partial<ExcelProject> & {
      id: string;
      fileName: string;
    }
  ) => {
    startTransition(() => {
      setExcelProjects((prev = []) => {
        const exists = prev.some(
          (p) => p.id === proj.id
        );
        const base: ExcelProject = {
          id: proj.id,
          fileName: proj.fileName,
          status:
            (proj as any).status ??
            "pending",
          totalKeywords:
            (proj as any)
              .totalKeywords ?? 0,
          processedKeywords:
            (proj as any)
              .processedKeywords ?? 0,
          createdAt:
            (proj as any)
              .createdAt ??
            new Date().toISOString(),
          error: (proj as any).error,
          failedCount:
            (proj as any)
              .failedCount ?? 0,
        };
        if (exists) {
          return prev.map((p) =>
            p.id === proj.id
              ? { ...p, ...base }
              : p
          );
        }
        return [...prev, base];
      });
    });
  };

  const generateContent = async (
    file: File,
    fileId: string,
    onProgress?: GenerateProgressCallback
  ) => {
    setIsProcessing(true);
    onProgress?.(0);

    ensureProject({
      id: fileId,
      fileName: file.name,
      status: "pending",
      totalKeywords: 0,
      processedKeywords: 0,
      failedCount: 0,
    });

    const bufferItems: ContentItem[] = [];
    let scheduled = false;
    const BATCH_SIZE = 80;

    const flushNow = () => {
      scheduled = false;
      if (!bufferItems.length) return;
      const toWrite =
        bufferItems.splice(
          0,
          bufferItems.length
        );
      startTransition(() => {
        setContentItems((prev) => [
          ...(prev ?? []),
          ...toWrite,
        ]);
      });
    };

    const scheduleFlush = () => {
      if (bufferItems.length >= BATCH_SIZE)
        return flushNow();
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(flushNow);
      }
    };

    let failedCount = 0;
    let processedCount = 0;
    const failedGroups: Array<{
      index: number;
      grp: KeywordRow[];
    }> = [];

    const updateProgress = (
      processed: number,
      total: number
    ) => {
      startTransition(() => {
        setExcelProjects((prev) =>
          (prev ?? []).map((p) =>
            p.id === fileId
              ? {
                  ...p,
                  processedKeywords:
                    processed,
                }
              : p
          )
        );
      });
      try {
        onProgress?.(
          Math.round(
            (processed /
              Math.max(1, total)) *
              100
          )
        );
      } catch {
        // ignore
      }
    };

    try {
      const buffer =
        await file.arrayBuffer();
      const { keywords } =
        extractKeywordsFromWorkbookBufferWithUrls(
          buffer
        );

      if (!keywords.length) {
        ensureProject({
          id: fileId,
          fileName: file.name,
          status: "error",
          error:
            "No valid keywords found in the uploaded Excel file",
        });
        toast.error(
          "No valid keywords found in the uploaded Excel file."
        );
        onProgress?.(100);
        return;
      }

      const prefs = getFreshPrefs();
      const size =
        (prefs.keywordMode ??
          1) as KeywordMode;

      const baseGroups = prefs.customModeEnabled
        ? buildGroupsCustom(
            keywords,
            size,
            Math.max(
              1,
              Math.min(
                200,
                prefs.articleCount ||
                  1
              )
            )
          )
        : buildGroupsNormal(
            keywords,
            size
          );

      ensureProject({
        id: fileId,
        fileName: file.name,
        status: "processing",
        totalKeywords:
          baseGroups.length,
        processedKeywords: 0,
        failedCount: 0,
      });

      toast.info(
        `Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article`
      );

      const cores =
        navigator.hardwareConcurrency ??
        4;
      let concurrency = Math.min(
        Math.max(8, cores * 2),
        24
      );
      const MAX = 36;

      let idx = 0;
      const running =
        new Set<Promise<void>>();

      const startNext = () => {
        if (idx >= baseGroups.length)
          return;

        const groupIndex = idx++;
        const grp =
          baseGroups[groupIndex];

        const kws = grp.map(
          (g) => g.keyword
        );
        const urlMap: Record<
          string,
          string | null
        > = {};
        grp.forEach((g) => {
          urlMap[g.keyword] =
            g.url ?? null;
        });

        const task = (async () => {
          try {
            const plan =
              buildPlanFromPrefs({
                keywords: kws,
                prefs,
                variationId:
                  groupIndex + 1,
              });

            const result =
              await generateJSONTitleHtml(
                {
                  keywords: kws,
                  instructions:
                    plan,
                  titleLength:
                    prefs
                      .titleLength ||
                    100,
                }
              );

            let html = String(
              result.html || ""
            ).trim();
            if (!html)
              throw new Error(
                "Empty html from model"
              );

            // Inject anchor tokens early (caller rules enforce no headings/Conclusion usage)
            const tokenTargets = Math.min(
              4,
              kws.length
            );
            for (
              let i = 0;
              i < tokenTargets;
              i++
            ) {
              html = injectTokenIntoNthSection(
                html,
                i,
                `[ANCHOR:${kws[i]}]`
              );
            }

            // Apply URLs for all used keywords
            const anchors =
              Object.keys(urlMap).map(
                (k) => ({
                  keyword: k,
                  url:
                    urlMap[k] ||
                    undefined,
                })
              );
            html =
              applyAnchorTokens(
                html,
                anchors
              );

            // Clean leftover tokens
            html =
              html.replace(
                /\[ANCHOR:[^\]]+\]/g,
                ""
              );

            // Remove any legacy stub bullets
            html =
              stripLegacyStubBullets(
                html
              );

            const item: ContentItem =
              {
                id: `${fileId}-${groupIndex}-${Date.now()}`,
                keyword: kws[0],
                keywordsUsed: kws,
                generatedContent:
                  html,
                fileId,
                fileName:
                  file.name,
                createdAt:
                  new Date().toISOString(),
                title:
                  result.title,
                targetUrl:
                  urlMap[kws[0]] ??
                  null,
                urlMap,
                status:
                  "success",
                prefsSnapshot:
                  {
                    mood:
                      prefs.mood,
                    paragraphWords:
                      prefs.paragraphWords,
                    includeConclusion:
                      prefs.includeConclusion,
                    language:
                      prefs.language,
                    customModeEnabled:
                      prefs.customModeEnabled,
                    articleCount:
                      prefs.articleCount,
                    keywordMode:
                      prefs.keywordMode,
                    includeBulletPoints:
                      prefs.includeBulletPoints,
                    includeTables:
                      prefs.includeTables,
                    includeEmojis:
                      prefs.includeEmojis,
                    includeBoxesQuotesHighlights:
                      prefs.includeBoxesQuotesHighlights,
                    includeQandA:
                      prefs.includeQandA,
                    totalContentWords:
                      prefs.totalContentWords,
                    titleLength:
                      prefs.titleLength,
                    brandDomainEnabled:
                      prefs.brandDomainEnabled,
                    brandDomain:
                      prefs.brandDomain,
                  },
              };

            bufferItems.push(
              item
            );
            scheduleFlush();
          } catch (e) {
            failedCount++;
            failedGroups.push({
              index:
                groupIndex,
              grp,
            });
            console.error(
              "group generate error:",
              e
            );
          } finally {
            processedCount += 1;
            updateProgress(
              processedCount,
              baseGroups.length
            );
          }
        })().finally(() =>
          running.delete(task)
        );

        running.add(task);
      };

      while (
        idx < baseGroups.length ||
        running.size > 0
      ) {
        const cur = Math.max(
          8,
          Math.min(
            Math.floor(
              concurrency
            ),
            MAX
          )
        );
        while (
          running.size < cur &&
          idx < baseGroups.length
        ) {
          startNext();
        }
        if (
          !running.size &&
          idx >= baseGroups.length
        )
          break;

        await Promise.race(
          Array.from(running)
        );

        if (
          failedCount >
            processedCount *
              0.25 &&
          concurrency > 8
        ) {
          concurrency -= 0.5;
        } else if (
          concurrency < MAX &&
          failedCount <
            processedCount *
              0.08
        ) {
          concurrency += 0.75;
        }
      }

      // Retry failed groups (same strict rules, no dummy content)
      if (failedGroups.length) {
        toast.message(
          `Retrying ${failedGroups.length} failed item(s)…`
        );

        const queue = [
          ...failedGroups,
        ];
        failedGroups.length = 0;

        const RETRY_CONCURRENCY = 6;
        const running2 =
          new Set<Promise<void>>();

        const runOne = async (
          grp: KeywordRow[],
          groupIndex: number
        ) => {
          const kws = grp.map(
            (g) => g.keyword
          );
          const urlMap: Record<
            string,
            string | null
          > = {};
          grp.forEach((g) => {
            urlMap[g.keyword] =
              g.url ?? null;
          });

          const plan =
            buildPlanFromPrefs({
              keywords: kws,
              prefs,
              variationId:
                groupIndex + 1,
            });

          const res =
            await generateJSONTitleHtml(
              {
                keywords: kws,
                instructions:
                  plan,
                titleLength:
                  prefs
                    .titleLength ||
                  100,
              }
            );

          let html = String(
            res.html || ""
          ).trim();
          if (!html)
            throw new Error(
              "Empty html (retry)"
            );

          const tokenTargets =
            Math.min(
              4,
              kws.length
            );
          for (
            let i = 0;
            i < tokenTargets;
            i++
          ) {
            html = injectTokenIntoNthSection(
              html,
              i,
              `[ANCHOR:${kws[i]}]`
            );
          }

          const anchors =
            Object.keys(
              urlMap
            ).map((k) => ({
              keyword: k,
              url:
                urlMap[k] ||
                undefined,
            }));
          html =
            applyAnchorTokens(
              html,
              anchors
            );
          html =
            html.replace(
              /\[ANCHOR:[^\]]+\]/g,
              ""
            );
          html =
            stripLegacyStubBullets(
              html
            );

          const item: ContentItem =
            {
              id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
              keyword: kws[0],
              keywordsUsed: kws,
              generatedContent:
                html,
              fileId,
              fileName:
                file.name,
              createdAt:
                new Date().toISOString(),
              title:
                res.title,
              targetUrl:
                urlMap[kws[0]] ??
                null,
              urlMap,
              status:
                "success",
              prefsSnapshot:
                {
                  mood:
                    prefs.mood,
                  paragraphWords:
                    prefs.paragraphWords,
                  includeConclusion:
                    prefs.includeConclusion,
                  language:
                    prefs.language,
                  customModeEnabled:
                    prefs.customModeEnabled,
                  articleCount:
                    prefs.articleCount,
                  keywordMode:
                    prefs.keywordMode,
                  includeBulletPoints:
                    prefs.includeBulletPoints,
                  includeTables:
                    prefs.includeTables,
                  includeEmojis:
                    prefs.includeEmojis,
                  includeBoxesQuotesHighlights:
                    prefs.includeBoxesQuotesHighlights,
                  includeQandA:
                    prefs.includeQandA,
                  totalContentWords:
                    prefs.totalContentWords,
                  titleLength:
                    prefs.titleLength,
                  brandDomainEnabled:
                    prefs.brandDomainEnabled,
                  brandDomain:
                    prefs.brandDomain,
                },
            };

          bufferItems.push(
            item
          );
          scheduleFlush();
        };

        const startNextRetry = () => {
          if (!queue.length)
            return;
          const { grp, index } =
            queue.shift()!;
          const p = (async () => {
            try {
              await runOne(
                grp,
                index
              );
            } catch (e) {
              console.error(
                "retry failed:",
                e
              );
            }
          })().finally(() =>
            running2.delete(p)
          );
          running2.add(p);
        };

        while (
          running2.size <
            RETRY_CONCURRENCY &&
          queue.length
        ) {
          startNextRetry();
        }

        while (
          running2.size ||
          queue.length
        ) {
          await Promise.race(
            Array.from(running2)
          );
          while (
            running2.size <
              RETRY_CONCURRENCY &&
            queue.length
          ) {
            startNextRetry();
          }
          await new Promise((r) =>
            setTimeout(r, 80)
          );
        }
      }

      flushNow();

      startTransition(() => {
        setExcelProjects((prev) =>
          (prev ?? []).map((p) =>
            p.id === fileId
              ? {
                  ...p,
                  status:
                    "completed",
                  processedKeywords:
                    baseGroups.length,
                  failedCount,
                }
              : p
          )
        );
      });

      const ok =
        baseGroups.length -
        failedCount;
      toast.success(
        `✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`
      );
      onProgress?.(100);
    } catch (error) {
      console.error(
        "generateContent overall error:",
        error
      );
      startTransition(() => {
        setExcelProjects((prev) =>
          (prev ?? []).map((p) =>
            p.id === fileId
              ? {
                  ...p,
                  status:
                    "error",
                  error:
                    error instanceof
                    Error
                      ? error.message
                      : String(error),
                }
              : p
          )
        );
      });
      toast.error(
        `Failed processing ${file.name}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      );
      onProgress?.(100);
      throw error;
    } finally {
      flushNow();
      setIsProcessing(false);
    }
  };

  const deleteProject = (
    projectId: string
  ) => {
    startTransition(() => {
      setExcelProjects((prev) =>
        (prev ?? []).filter(
          (p) => p.id !== projectId
        )
      );
      setContentItems((prev) =>
        (prev ?? []).filter(
          (c) => c.fileId !== projectId
        )
      );
    });
    toast.success("Project deleted");
  };

  const deleteAllProjects = () => {
    startTransition(() => {
      setExcelProjects([]);
      setContentItems([]);
    });
    toast.success("All projects cleared");
  };

  return {
    generateContent,
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

/** ────────────────────────────────────────────────────────────
 * Grouping helpers
 * ──────────────────────────────────────────────────────────── */

function buildGroupsNormal(
  rows: KeywordRow[],
  size: KeywordMode
): KeywordRow[][] {
  const groups: KeywordRow[][] = [];
  for (
    let i = 0;
    i < rows.length;
    i += size
  ) {
    groups.push(
      rows.slice(i, i + size)
    );
  }
  return groups;
}

function sampleDistinct<T>(
  arr: T[],
  size: number
): T[] {
  if (size <= 0) return [];
  if (!arr.length) return [];
  if (size === 1) {
    return [
      arr[
        Math.floor(
          Math.random() *
            arr.length
        )
      ],
    ];
  }
  const taken =
    new Set<number>();
  while (
    taken.size <
    Math.min(size, arr.length)
  ) {
    taken.add(
      Math.floor(
        Math.random() *
          arr.length
      )
    );
  }
  const out = Array.from(
    taken
  ).map((i) => arr[i]);
  while (out.length < size) {
    out.push(
      arr[
        Math.floor(
          Math.random() *
            arr.length
        )
      ]
    );
  }
  return out;
}

function buildGroupsCustom(
  rows: KeywordRow[],
  size: KeywordMode,
  count: number
): KeywordRow[][] {
  const groups: KeywordRow[][] = [];
  for (let i = 0; i < count; i++) {
    groups.push(
      sampleDistinct(
        rows,
        size
      )
    );
  }
  return groups;
}
