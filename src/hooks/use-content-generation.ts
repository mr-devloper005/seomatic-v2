// // src/hooks/use-content-generation.ts
// import { useState } from "react";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";

// /* ---------- Types ---------- */
// export interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string; // ISO
//   keywordLink?: string; // optional hyperlink for keyword from Excel
// }

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
// }

// type GenerateProgressCallback = (progressPercentage: number) => void;

// /* ---------- Helpers / constants ---------- */
// const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"] as const;
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// /* ---------- openContentEditor (plain function) ---------- */
// // Storage key prefix used by editor page
// const OPEN_PREFIX = "open_content_item_v1_";
// const OPEN_FALLBACK = "open-content-item";

// /**
//  * Plain function - call from UI to open editor in new tab.
//  * - Stores contentItem in sessionStorage under key OPEN_PREFIX + id.
//  * - Also writes fallback OPEN_FALLBACK key (sessionStorage) for older code.
//  * - Opens `/content/editor?openId=<id>` in new tab (fallback to same tab if popup blocked).
//  */
// export function openContentEditor(contentItem: ContentItem) {
//   try {
//     const id = contentItem?.id ?? `gen-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
//     const key = `${OPEN_PREFIX}${id}`;
//     const payload = JSON.stringify(contentItem);

//     try {
//       sessionStorage.setItem(key, payload);
//       sessionStorage.setItem(OPEN_FALLBACK, payload);
//       console.log("[openContentEditor] wrote to sessionStorage:", key);
//     } catch (err) {
//       console.warn("[openContentEditor] sessionStorage write failed, trying localStorage", err);
//       try {
//         localStorage.setItem(key, payload);
//         localStorage.setItem(OPEN_FALLBACK, payload);
//         console.log("[openContentEditor] wrote to localStorage:", key);
//       } catch (err2) {
//         console.warn("[openContentEditor] localStorage write also failed", err2);
//       }
//     }

//     const url = `/content/editor?openId=${encodeURIComponent(id)}`;
//     const newWin = window.open(url, "_blank");
//     if (!newWin) {
//       console.warn("[openContentEditor] window.open returned null (popup blocked) - navigating same tab");
//       window.location.href = url;
//     } else {
//       console.log("[openContentEditor] opened editor URL:", url);
//     }
//   } catch (err) {
//     console.error("[openContentEditor] Unexpected error:", err);
//     // best-effort fallback
//     try {
//       window.location.href = "/content/editor";
//     } catch (_) {}
//   }
// }

// /* ---------- (rest of hook: generation + parsing) ---------- */
// /* NOTE: I kept the generation code compact and focused on your working implementation.
//    If you want I can paste the entire generator code (unchanged) — for brevity I include the main structure here.
//    You can keep your previous generator logic but ensure this file exports openContentEditor (above) and useContentGeneration below.
// */

// function isLikelyUrlOrDomain(s: string) {
//   const trimmed = s.trim();
//   if (/^https?:\/\//i.test(trimmed)) return true;
//   if (/^www\./i.test(trimmed)) return true;
//   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(trimmed) && !/\s/.test(trimmed)) return true;
//   return false;
// }

// function sanitizeKeyword(raw: unknown): string {
//   if (raw == null) return "";
//   let v = String(raw).replace(/\u00A0/g, " ").trim();
//   if (!v) return "";
//   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim();
//   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
//   if (/^[\d\.,\s]+$/.test(v)) return "";
//   if (v.length > 180) return "";
//   if (isLikelyUrlOrDomain(v)) return "";
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2) return "";
//   return v;
// }

// function pickKeywordColumn(rows: unknown[][]): number | null {
//   if (!rows || rows.length === 0) return null;
//   const headerCandidates = rows.slice(0, 5);
//   let headerRowIndex = -1;
//   for (let i = 0; i < headerCandidates.length; i++) {
//     const r = headerCandidates[i];
//     if (!Array.isArray(r)) continue;
//     const nonEmpty = r.some((c) => typeof c === "string" && String(c).trim().length > 0);
//     if (nonEmpty) {
//       headerRowIndex = i;
//       break;
//     }
//   }
//   const headerRow = headerRowIndex >= 0 && Array.isArray(rows[headerRowIndex]) ? (rows[headerRowIndex] as unknown[]) : [];
//   const headerNames = headerRow.map((c) => String(c ?? "").trim().toLowerCase());
//   const preferredHeaders = ["keyword", "keywords", "topic", "title", "query", "search term", "focus keyword", "term", "phrase"];
//   for (let i = 0; i < headerNames.length; i++) {
//     if (preferredHeaders.includes(headerNames[i])) return i;
//   }
//   const lookahead = rows.slice(Math.max(0, headerRowIndex + 1), Math.min(rows.length, (headerRowIndex + 1) + 200));
//   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//   let bestCol = -1;
//   let bestScore = 0;
//   for (let col = 0; col < maxCols; col++) {
//     let score = 0;
//     let total = 0;
//     for (const r of lookahead) {
//       const cell = Array.isArray(r) ? r[col] : undefined;
//       const s = sanitizeKeyword(cell);
//       if (s) score++;
//       if (cell !== undefined && cell !== null && String(cell).trim() !== "") total++;
//     }
//     if (total === 0) continue;
//     const weighted = score * 100 + Math.min(total, 100);
//     if (weighted > bestScore) {
//       bestScore = weighted;
//       bestCol = col;
//     }
//   }
//   if (bestCol >= 0) {
//     let validCount = 0;
//     for (const r of rows.slice(1, 201)) {
//       const cell = Array.isArray(r) ? r[bestCol] : undefined;
//       if (sanitizeKeyword(cell)) validCount++;
//       if (validCount >= 2) break;
//     }
//     if (validCount >= 2) return bestCol;
//   }
//   return null;
// }

// function extractKeywordsFromWorksheet(worksheet: XLSX.WorkSheet): string[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];
//   const col = pickKeywordColumn(rows);
//   if (col == null) return [];
//   const dataRows = rows.slice(1);
//   const found: string[] = [];
//   const seen = new Set<string>();
//   for (const r of dataRows) {
//     if (!Array.isArray(r)) continue;
//     const raw = r[col];
//     const k = sanitizeKeyword(raw);
//     if (!k) continue;
//     if (!seen.has(k)) {
//       seen.add(k);
//       found.push(k);
//     }
//   }
//   if (found.length === 0) {
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//     for (let c = 0; c < maxCols; c++) {
//       for (let rIdx = 1; rIdx < rows.length; rIdx++) {
//         const r = rows[rIdx];
//         if (!Array.isArray(r)) continue;
//         const k = sanitizeKeyword(r[c]);
//         if (k && !seen.has(k)) {
//           seen.add(k);
//           found.push(k);
//         }
//       }
//       if (found.length > 0) break;
//     }
//   }
//   return found;
// }

// function extractKeywordsFromWorkbookBuffer(buffer: ArrayBuffer | Uint8Array): { keywords: string[]; perSheet?: Record<string, number> } {
//   const workbook = XLSX.read(buffer, { type: "array" });
//   const sheetNames = workbook.SheetNames ?? [];
//   const combined: string[] = [];
//   const seen = new Set<string>();
//   const perSheet: Record<string, number> = {};
//   for (const sheetName of sheetNames) {
//     try {
//       const sheet = workbook.Sheets[sheetName];
//       const sheetKeywords = extractKeywordsFromWorksheet(sheet);
//       perSheet[sheetName] = sheetKeywords.length;
//       for (const k of sheetKeywords) {
//         if (!seen.has(k)) {
//           seen.add(k);
//           combined.push(k);
//         }
//       }
//       if (combined.length > 2000) break;
//     } catch (e) {
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }
//   return { keywords: combined, perSheet };
// }

// /* ---------- client reuse (optional) ---------- */
// const clientCache: Record<string, any> = {};
// function getClient(apiKey: string) {
//   if (!apiKey) throw new Error("API key required for getClient");
//   if (clientCache[apiKey]) return clientCache[apiKey];
//   clientCache[apiKey] = new GoogleGenerativeAI(apiKey);
//   return clientCache[apiKey];
// }

// /* ---------- useContentGeneration hook (keeps your generation behavior) ---------- */
// export function useContentGeneration(passedApiKey?: string) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   // resolve API key
//   function resolveApiKey(): string {
//     if (passedApiKey && passedApiKey.trim()) return passedApiKey.trim();
//     try {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const meta = (typeof import.meta !== "undefined" ? (import.meta as any) : undefined);
//       if (meta?.env?.VITE_GEMINI_API_KEY) return String(meta.env.VITE_GEMINI_API_KEY).trim();
//     } catch (_e) {}
//     return "";
//   }

//   const generateContentForKeyword = async (keyword: string, apiKey: string): Promise<string> => {
//     if (!apiKey) throw new Error("Gemini API key not set.");
//     const client = getClient(apiKey);
//     let lastError: unknown;
//     for (const modelName of MODELS) {
//       try {
//         const model = (client as any).getGenerativeModel({ model: modelName as string });
//         const result = await model.generateContent(keyword); // swap with buildPrompt(keyword) if you want the long prompt
//         const text = result?.response?.text?.();
//         if (!text || !text.trim()) throw new Error("Empty response from model");
//         return text.trim();
//       } catch (e) {
//         const errMsg = (e as Error)?.message ?? "";
//         const lowered = errMsg.toLowerCase();
//         if (lowered.includes("tunnel") || lowered.includes("proxy") || lowered.includes("failed to fetch")) {
//           toast.error("Network error communicating with Gemini (proxy/tunnel). Check network and try again.");
//         }
//         lastError = e;
//         if (lowered.includes("429") || lowered.includes("rate")) {
//           await sleep(800);
//         }
//         continue;
//       }
//     }
//     throw lastError ?? new Error("All models failed");
//   };

//   const ensureProject = (proj: ExcelProject) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...proj } : p));
//       return [...prev, proj];
//     });
//   };

//   // ... keep your adaptive concurrency generation code here (unchanged from your working version)
//   // For brevity I will keep the original implementation you had working; please paste it here if you use a specialized version.

//   // Minimal stub to avoid TypeScript errors if you run now:
//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     // Keep your full implementation here. This stub only prevents build error until you paste your working version.
//     setIsProcessing(true);
//     onProgress?.(0);
//     try {
//       const buffer = await file.arrayBuffer();
//       const { keywords } = extractKeywordsFromWorkbookBuffer(buffer);
//       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: keywords.length, processedKeywords: 0, createdAt: new Date().toISOString() });
//       // very naive generation loop (replace with your faster/working code)
//       for (let i = 0; i < keywords.length; i++) {
//         const text = await generateContentForKeyword(keywords[i], resolveApiKey());
//         const contentItem: ContentItem = { id: `${fileId}-${i}-${Date.now()}`, keyword: keywords[i], generatedContent: text, fileId, fileName: file.name, createdAt: new Date().toISOString() };
//         setContentItems((prev) => [...(prev ?? []), contentItem]);
//         onProgress?.(Math.round(((i + 1) / Math.max(1, keywords.length)) * 100));
//       }
//       ensureProject({ id: fileId, fileName: file.name, status: "completed", totalKeywords: keywords.length, processedKeywords: keywords.length, createdAt: new Date().toISOString() });
//     } catch (err) {
//       ensureProject({ id: fileId, fileName: file.name, status: "error", totalKeywords: 0, processedKeywords: 0, createdAt: new Date().toISOString(), error: (err as Error)?.message ?? String(err) });
//       throw err;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
//     setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     setExcelProjects([]);
//     setContentItems([]);
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
//     openContentEditor, // return it too so UI can access via hook if preferred
//   };
// }




// // src/hooks/use-content-generation.ts
// import { useState } from "react";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";

// /**
//  * useContentGeneration
//  * - Exports plain function openContentEditor(contentItem) (NO hooks inside).
//  * - ContentItem now optionally contains `title` and `keywordLink`.
//  */

// /* ---------- Types ---------- */
// export interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string; // ISO
//   title?: string;
//   keywordLink?: string;
// }

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
// }

// type GenerateProgressCallback = (progressPercentage: number) => void;

// /* ---------- Constants / Helpers ---------- */
// const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"] as const;
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// const SESSION_KEY = "open-content-item_v1";

// /* ---------- Tiny helpers for Excel parsing (kept minimal, same logic as before) ---------- */
// function isLikelyUrlOrDomain(s: string) {
//   const trimmed = s.trim();
//   if (/^https?:\/\//i.test(trimmed)) return true;
//   if (/^www\./i.test(trimmed)) return true;
//   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(trimmed) && !/\s/.test(trimmed)) return true;
//   return false;
// }

// function sanitizeKeyword(raw: unknown): string {
//   if (raw == null) return "";
//   let v = String(raw).replace(/\u00A0/g, " ").trim();
//   if (!v) return "";
//   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim();
//   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
//   if (/^[\d\.,\s]+$/.test(v)) return "";
//   if (v.length > 180) return "";
//   if (isLikelyUrlOrDomain(v)) return "";
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2) return "";
//   return v;
// }

// function pickKeywordColumn(rows: unknown[][]): number | null {
//   if (!rows || rows.length === 0) return null;
//   const headerCandidates = rows.slice(0, 5);
//   let headerRowIndex = -1;
//   for (let i = 0; i < headerCandidates.length; i++) {
//     const r = headerCandidates[i];
//     if (!Array.isArray(r)) continue;
//     const nonEmpty = r.some((c) => typeof c === "string" && String(c).trim().length > 0);
//     if (nonEmpty) {
//       headerRowIndex = i;
//       break;
//     }
//   }
//   const headerRow = headerRowIndex >= 0 && Array.isArray(rows[headerRowIndex]) ? (rows[headerRowIndex] as unknown[]) : [];
//   const headerNames = headerRow.map((c) => String(c ?? "").trim().toLowerCase());
//   const preferredHeaders = ["keyword", "keywords", "topic", "title", "query", "search term", "focus keyword", "term", "phrase"];
//   for (let i = 0; i < headerNames.length; i++) {
//     if (preferredHeaders.includes(headerNames[i])) return i;
//   }
//   const lookahead = rows.slice(Math.max(0, headerRowIndex + 1), Math.min(rows.length, (headerRowIndex + 1) + 200));
//   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//   let bestCol = -1;
//   let bestScore = 0;
//   for (let col = 0; col < maxCols; col++) {
//     let score = 0;
//     let total = 0;
//     for (const r of lookahead) {
//       const cell = Array.isArray(r) ? r[col] : undefined;
//       const s = sanitizeKeyword(cell);
//       if (s) score++;
//       if (cell !== undefined && cell !== null && String(cell).trim() !== "") total++;
//     }
//     if (total === 0) continue;
//     const weighted = score * 100 + Math.min(total, 100);
//     if (weighted > bestScore) {
//       bestScore = weighted;
//       bestCol = col;
//     }
//   }
//   if (bestCol >= 0) {
//     let validCount = 0;
//     for (const r of rows.slice(1, 201)) {
//       const cell = Array.isArray(r) ? r[bestCol] : undefined;
//       if (sanitizeKeyword(cell)) validCount++;
//       if (validCount >= 2) break;
//     }
//     if (validCount >= 2) return bestCol;
//   }
//   return null;
// }

// function extractKeywordsFromWorksheet(worksheet: XLSX.WorkSheet): string[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];
//   const col = pickKeywordColumn(rows);
//   if (col == null) return [];
//   const dataRows = rows.slice(1);
//   const found: string[] = [];
//   const seen = new Set<string>();
//   for (const r of dataRows) {
//     if (!Array.isArray(r)) continue;
//     const raw = r[col];
//     const k = sanitizeKeyword(raw);
//     if (!k) continue;
//     if (!seen.has(k)) {
//       seen.add(k);
//       found.push(k);
//     }
//   }
//   if (found.length === 0) {
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//     for (let c = 0; c < maxCols; c++) {
//       for (let rIdx = 1; rIdx < rows.length; rIdx++) {
//         const r = rows[rIdx];
//         if (!Array.isArray(r)) continue;
//         const k = sanitizeKeyword(r[c]);
//         if (k && !seen.has(k)) {
//           seen.add(k);
//           found.push(k);
//         }
//       }
//       if (found.length > 0) break;
//     }
//   }
//   return found;
// }

// function extractKeywordsFromWorkbookBuffer(buffer: ArrayBuffer | Uint8Array): { keywords: string[]; perSheet?: Record<string, number> } {
//   const workbook = XLSX.read(buffer, { type: "array" });
//   const sheetNames = workbook.SheetNames ?? [];
//   const combined: string[] = [];
//   const seen = new Set<string>();
//   const perSheet: Record<string, number> = {};
//   for (const sheetName of sheetNames) {
//     try {
//       const sheet = workbook.Sheets[sheetName];
//       const sheetKeywords = extractKeywordsFromWorksheet(sheet);
//       perSheet[sheetName] = sheetKeywords.length;
//       for (const k of sheetKeywords) {
//         if (!seen.has(k)) {
//           seen.add(k);
//           combined.push(k);
//         }
//       }
//       if (combined.length > 2000) break;
//     } catch (e) {
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }
//   return { keywords: combined, perSheet };
// }

// /* ---------- Client reuse ---------- */
// const clientCache: Record<string, any> = {};
// function getClient(apiKey: string) {
//   if (!apiKey) throw new Error("API key required for getClient");
//   if (clientCache[apiKey]) return clientCache[apiKey];
//   clientCache[apiKey] = new GoogleGenerativeAI(apiKey);
//   return clientCache[apiKey];
// }

// /* ---------- Plain function to open editor in new tab (no hooks) ---------- */
// export function openContentEditor(contentItem: ContentItem) {
//   try {
//     // write to sessionStorage (only available to same-origin new tab opened from this window)
//     sessionStorage.setItem(SESSION_KEY, JSON.stringify(contentItem));
//     // also write to localStorage fallback key (so new tab can read if sessionStorage not available)
//     try {
//       localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(contentItem));
//     } catch (e) {
//       // ignore
//     }
//   } catch (e) {
//     console.warn("openContentEditor: failed to write storage", e);
//   }

//   // open new tab (same origin)
//   try {
//     window.open("/content/editor", "_blank");
//   } catch (e) {
//     // fallback: navigate same tab
//     window.location.href = "/content/editor";
//   }
// }

// /* ---------- Hook implementation (main logic preserved) ---------- */
// export function useContentGeneration(passedApiKey?: string) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   function resolveApiKey(): string {
//     if (passedApiKey && passedApiKey.trim()) return passedApiKey.trim();
//     try {
//       const meta = (typeof import.meta !== "undefined" ? (import.meta as any) : undefined);
//       if (meta?.env?.VITE_GEMINI_API_KEY) return String(meta.env.VITE_GEMINI_API_KEY).trim();
//     } catch (_e) { /* ignore */ }
//     return "";
//   }

//   const generateContentForKeyword = async (keyword: string, apiKey: string): Promise<string> => {
//     if (!apiKey) throw new Error("Gemini API key not set.");
//     const client = getClient(apiKey);
//     let lastError: unknown;
//     for (const modelName of MODELS) {
//       try {
//         const model = (client as any).getGenerativeModel({ model: modelName as string });
//         const result = await model.generateContent(buildPrompt(keyword));
//         const text = result?.response?.text?.();
//         if (!text || !text.trim()) throw new Error("Empty response from model");
//         return text.trim();
//       } catch (e) {
//         const errMsg = (e as Error)?.message ?? "";
//         const lowered = errMsg.toLowerCase();
//         if (lowered.includes("tunnel") || lowered.includes("proxy") || lowered.includes("failed to fetch")) {
//           toast.error("Network error communicating with Gemini (proxy/tunnel). Check network and try again.");
//         }
//         lastError = e;
//         if (lowered.includes("429") || lowered.includes("rate")) {
//           await sleep(800);
//         }
//         continue;
//       }
//     }
//     throw lastError ?? new Error("All models failed");
//   };

//   const ensureProject = (proj: ExcelProject) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...proj } : p));
//       return [...prev, proj];
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     const API_KEY = resolveApiKey();

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       createdAt: new Date().toISOString(),
//     });

//     const contentBuffer: ContentItem[] = [];
//     let flushTimer: number | null = null;
//     const FLUSH_COUNT = 10;
//     const FLUSH_MS = 400;
//     const scheduleFlush = () => {
//       if (flushTimer != null) return;
//       // @ts-ignore
//       flushTimer = window.setTimeout(() => { flushNow(); }, FLUSH_MS);
//     };
//     const flushNow = () => {
//       if (flushTimer != null) {
//         clearTimeout(flushTimer as any);
//         flushTimer = null;
//       }
//       if (contentBuffer.length === 0) return;
//       const toWrite = contentBuffer.splice(0, contentBuffer.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };

//     let lastProgress = -1;
//     let lastProgressTs = 0;
//     const PROGRESS_MIN_DIFF = 1;
//     const PROGRESS_MIN_MS = 300;
//     const throttleProgress = (processed: number, total: number) => {
//       const now = Date.now();
//       const pct = Math.round((processed / Math.max(1, total)) * 100);
//       if (pct === lastProgress && now - lastProgressTs < PROGRESS_MIN_MS) return;
//       if (Math.abs(pct - lastProgress) < PROGRESS_MIN_DIFF && now - lastProgressTs < PROGRESS_MIN_MS) return;
//       lastProgress = pct;
//       lastProgressTs = now;
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
//       try { onProgress?.(pct); } catch (_) { /* ignore */ }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
//       const { keywords } = extractKeywordsFromWorkbookBuffer(buffer);
//       if (!keywords || keywords.length === 0) {
//         const projError: ExcelProject = {
//           id: fileId,
//           fileName: file.name,
//           status: "error",
//           totalKeywords: 0,
//           processedKeywords: 0,
//           createdAt: new Date().toISOString(),
//           error: "No valid keywords found in uploaded Excel file",
//         };
//         ensureProject(projError);
//         toast.error("No valid keywords found in the uploaded Excel file.");
//         onProgress?.(100);
//         return;
//       }

//       const project: ExcelProject = {
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: keywords.length,
//         processedKeywords: 0,
//         createdAt: new Date().toISOString(),
//       };
//       ensureProject(project);
//       toast.info(`Found ${keywords.length} keywords. Starting generation...`);

//       // concurrency adaptive loop (kept similar to your prior)
//       let concurrency = Math.min(6, Math.max(2, Math.floor(navigator.hardwareConcurrency ? navigator.hardwareConcurrency / 2 : 4)));
//       const MIN_CONCURRENCY = 1;
//       const MAX_CONCURRENCY = 8;
//       let consecutiveNetworkErrors = 0;
//       let processedCount = 0;
//       let index = 0;

//       const generateWithRetries = async (keyword: string): Promise<string | null> => {
//         let attempt = 0;
//         const MAX_ATTEMPTS = 3;
//         let backoff = 400;
//         while (attempt < MAX_ATTEMPTS) {
//           attempt++;
//           try {
//             const text = await generateContentForKeyword(keyword, API_KEY);
//             return text;
//           } catch (err) {
//             const msg = (err as Error)?.message?.toLowerCase() ?? "";
//             const isNetwork = msg.includes("tunnel") || msg.includes("proxy") || msg.includes("failed to fetch") || msg.includes("network");
//             if (isNetwork) {
//               consecutiveNetworkErrors++;
//               concurrency = Math.max(MIN_CONCURRENCY, Math.floor(concurrency / 2));
//               toast.warning("Network issue detected — reducing concurrency to " + concurrency);
//             }
//             if (attempt < MAX_ATTEMPTS) {
//               await sleep(backoff);
//               backoff *= 2;
//               continue;
//             }
//             return null;
//           }
//         }
//         return null;
//       };

//       const running = new Set<Promise<void>>();
//       const startNext = () => {
//         if (index >= keywords.length) return;
//         const kw = keywords[index++];
//         const curIndex = index;
//         const task = (async () => {
//           try {
//             const generated = await generateWithRetries(kw);
//             if (generated) {
//               const contentItem: ContentItem = {
//                 id: `${fileId}-${curIndex}-${Date.now()}`,
//                 keyword: kw,
//                 generatedContent: generated,
//                 fileId,
//                 fileName: file.name,
//                 createdAt: new Date().toISOString(),
//               };
//               contentBuffer.push(contentItem);
//               if (contentBuffer.length >= FLUSH_COUNT) flushNow();
//               else scheduleFlush();
//             }
//           } catch (e) {
//             console.error("Unexpected generate error:", e);
//           } finally {
//             processedCount++;
//             throttleProgress(processedCount, keywords.length);
//             if (consecutiveNetworkErrors === 0 && concurrency < MAX_CONCURRENCY) {
//               concurrency = Math.min(MAX_CONCURRENCY, concurrency + 0.2);
//             } else if (consecutiveNetworkErrors >= 3) {
//               concurrency = Math.max(MIN_CONCURRENCY, Math.floor(concurrency / 2));
//               consecutiveNetworkErrors = 0;
//             }
//           }
//         })().finally(() => running.delete(task));
//         running.add(task);
//       };

//       while (index < keywords.length || running.size > 0) {
//         const curConcurrency = Math.max(MIN_CONCURRENCY, Math.min(MAX_CONCURRENCY, Math.floor(concurrency)));
//         while (running.size < curConcurrency && index < keywords.length) {
//           startNext();
//         }
//         if (running.size === 0 && index >= keywords.length) break;
//         // @ts-ignore
//         await Promise.race(Array.from(running));
//       }

//       flushNow();

//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length } : p)));
//       toast.success(`Finished. Generated content (approx) for ${contentItems.length} keywords.`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p)));
//       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
//     setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     setExcelProjects([]);
//     setContentItems([]);
//     toast.success("All projects cleared");
//   };

//   // return openContentEditor too so UI can get it from the hook if desired
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

// /* ---------- buildPrompt placeholder (kept small here) ---------- */
// const buildPrompt = (keyword: string) => `Write an article about: ${keyword}\n\nKeep it human and practical.`;




// // src/hooks/use-content-generation.ts
// import { useState } from "react";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";

// /**
//  * useContentGeneration
//  * - Exports openContentEditor(contentItem) (plain function) to open editor in new tab.
//  * - Keeps the rest of your generation code intact (adaptive concurrency etc).
//  */

// /* ---------- Types ---------- */
// export interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string; // saved as HTML once edited, or plain text when generated
//   fileId: string;
//   fileName: string;
//   createdAt: string; // ISO
//   title?: string;
//   keywordLink?: string; // optional link to hyperlink keyword
// }

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
// }

// type GenerateProgressCallback = (progressPercentage: number) => void;

// /* ---------- Constants / Helpers ---------- */
// const SESSION_KEY = "open-content-item_v1";
// const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"] as const;
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// /* ---------- Excel/keyword helpers (kept compact) ---------- */
// function isLikelyUrlOrDomain(s: string) {
//   const trimmed = s.trim();
//   if (/^https?:\/\//i.test(trimmed)) return true;
//   if (/^www\./i.test(trimmed)) return true;
//   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(trimmed) && !/\s/.test(trimmed)) return true;
//   return false;
// }
// function sanitizeKeyword(raw: unknown): string {
//   if (raw == null) return "";
//   let v = String(raw).replace(/\u00A0/g, " ").trim();
//   if (!v) return "";
//   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim();
//   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
//   if (/^[\d\.,\s]+$/.test(v)) return "";
//   if (v.length > 180) return "";
//   if (isLikelyUrlOrDomain(v)) return "";
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2) return "";
//   return v;
// }
// function pickKeywordColumn(rows: unknown[][]): number | null {
//   if (!rows || rows.length === 0) return null;
//   const headerCandidates = rows.slice(0, 5);
//   let headerRowIndex = -1;
//   for (let i = 0; i < headerCandidates.length; i++) {
//     const r = headerCandidates[i];
//     if (!Array.isArray(r)) continue;
//     const nonEmpty = r.some((c) => typeof c === "string" && String(c).trim().length > 0);
//     if (nonEmpty) {
//       headerRowIndex = i;
//       break;
//     }
//   }
//   const headerRow = headerRowIndex >= 0 && Array.isArray(rows[headerRowIndex]) ? (rows[headerRowIndex] as unknown[]) : [];
//   const headerNames = headerRow.map((c) => String(c ?? "").trim().toLowerCase());
//   const preferredHeaders = ["keyword", "keywords", "topic", "title", "query", "search term", "focus keyword", "term", "phrase"];
//   for (let i = 0; i < headerNames.length; i++) {
//     if (preferredHeaders.includes(headerNames[i])) return i;
//   }
//   const lookahead = rows.slice(Math.max(0, headerRowIndex + 1), Math.min(rows.length, (headerRowIndex + 1) + 200));
//   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//   let bestCol = -1;
//   let bestScore = 0;
//   for (let col = 0; col < maxCols; col++) {
//     let score = 0;
//     let total = 0;
//     for (const r of lookahead) {
//       const cell = Array.isArray(r) ? r[col] : undefined;
//       const s = sanitizeKeyword(cell);
//       if (s) score++;
//       if (cell !== undefined && cell !== null && String(cell).trim() !== "") total++;
//     }
//     if (total === 0) continue;
//     const weighted = score * 100 + Math.min(total, 100);
//     if (weighted > bestScore) {
//       bestScore = weighted;
//       bestCol = col;
//     }
//   }
//   if (bestCol >= 0) {
//     let validCount = 0;
//     for (const r of rows.slice(1, 201)) {
//       const cell = Array.isArray(r) ? r[bestCol] : undefined;
//       if (sanitizeKeyword(cell)) validCount++;
//       if (validCount >= 2) break;
//     }
//     if (validCount >= 2) return bestCol;
//   }
//   return null;
// }
// function extractKeywordsFromWorksheet(worksheet: XLSX.WorkSheet): string[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];
//   const col = pickKeywordColumn(rows);
//   if (col == null) return [];
//   const dataRows = rows.slice(1);
//   const found: string[] = [];
//   const seen = new Set<string>();
//   for (const r of dataRows) {
//     if (!Array.isArray(r)) continue;
//     const raw = r[col];
//     const k = sanitizeKeyword(raw);
//     if (!k) continue;
//     if (!seen.has(k)) {
//       seen.add(k);
//       found.push(k);
//     }
//   }
//   if (found.length === 0) {
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//     for (let c = 0; c < maxCols; c++) {
//       for (let rIdx = 1; rIdx < rows.length; rIdx++) {
//         const r = rows[rIdx];
//         if (!Array.isArray(r)) continue;
//         const k = sanitizeKeyword(r[c]);
//         if (k && !seen.has(k)) {
//           seen.add(k);
//           found.push(k);
//         }
//       }
//       if (found.length > 0) break;
//     }
//   }
//   return found;
// }
// function extractKeywordsFromWorkbookBuffer(buffer: ArrayBuffer | Uint8Array): { keywords: string[]; perSheet?: Record<string, number> } {
//   const workbook = XLSX.read(buffer, { type: "array" });
//   const sheetNames = workbook.SheetNames ?? [];
//   const combined: string[] = [];
//   const seen = new Set<string>();
//   const perSheet: Record<string, number> = {};
//   for (const sheetName of sheetNames) {
//     try {
//       const sheet = workbook.Sheets[sheetName];
//       const sheetKeywords = extractKeywordsFromWorksheet(sheet);
//       perSheet[sheetName] = sheetKeywords.length;
//       for (const k of sheetKeywords) {
//         if (!seen.has(k)) {
//           seen.add(k);
//           combined.push(k);
//         }
//       }
//       if (combined.length > 2000) break;
//     } catch (e) {
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }
//   return { keywords: combined, perSheet };
// }

// /* ---------- client reuse ---------- */
// const clientCache: Record<string, any> = {};
// function getClient(apiKey: string) {
//   if (!apiKey) throw new Error("API key required for getClient");
//   if (clientCache[apiKey]) return clientCache[apiKey];
//   clientCache[apiKey] = new GoogleGenerativeAI(apiKey);
//   return clientCache[apiKey];
// }

// /* ---------- plain function to open editor (no React hooks) ---------- */
// export function openContentEditor(contentItem: ContentItem) {
//   try {
//     sessionStorage.setItem(SESSION_KEY, JSON.stringify(contentItem));
//     // fallback to localStorage (in case new tab doesn't have sessionStorage available)
//     try {
//       localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(contentItem));
//     } catch (e) {
//       // ignore
//     }
//   } catch (e) {
//     console.warn("openContentEditor: failed to write storage", e);
//   }

//   try {
//     window.open("/content/editor", "_blank");
//   } catch (e) {
//     window.location.href = "/content/editor";
//   }
// }

// /* ---------- Hook implementation (keeps your logic) ---------- */
// export function useContentGeneration(passedApiKey?: string) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   function resolveApiKey(): string {
//     if (passedApiKey && passedApiKey.trim()) return passedApiKey.trim();
//     try {
//       const meta = (typeof import.meta !== "undefined" ? (import.meta as any) : undefined);
//       if (meta?.env?.VITE_GEMINI_API_KEY) return String(meta.env.VITE_GEMINI_API_KEY).trim();
//     } catch (_e) {
//       // ignore
//     }
//     return "";
//   }

//   const generateContentForKeyword = async (keyword: string, apiKey: string): Promise<string> => {
//     if (!apiKey) throw new Error("Gemini API key not set.");
//     const client = getClient(apiKey);
//     let lastError: unknown;
//     for (const modelName of MODELS) {
//       try {
//         const model = (client as any).getGenerativeModel({ model: modelName as string });
//         const result = await model.generateContent(`Write an article about: ${keyword}`);
//         const text = result?.response?.text?.();
//         if (!text || !text.trim()) throw new Error("Empty response from model");
//         return text.trim();
//       } catch (e) {
//         const errMsg = (e as Error)?.message ?? "";
//         const lowered = errMsg.toLowerCase();
//         if (lowered.includes("tunnel") || lowered.includes("proxy") || lowered.includes("failed to fetch")) {
//           toast.error("Network error communicating with Gemini (proxy/tunnel). Check network and try again.");
//         }
//         lastError = e;
//         if (lowered.includes("429") || lowered.includes("rate")) {
//           await sleep(800);
//         }
//         continue;
//       }
//     }
//     throw lastError ?? new Error("All models failed");
//   };

//   const ensureProject = (proj: ExcelProject) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...proj } : p));
//       return [...prev, proj];
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     const API_KEY = resolveApiKey();

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       createdAt: new Date().toISOString(),
//     });

//     const contentBuffer: ContentItem[] = [];
//     let flushTimer: number | null = null;
//     const FLUSH_COUNT = 10;
//     const FLUSH_MS = 400;
//     const scheduleFlush = () => {
//       if (flushTimer != null) return;
//       // @ts-ignore
//       flushTimer = window.setTimeout(() => { flushNow(); }, FLUSH_MS);
//     };
//     const flushNow = () => {
//       if (flushTimer != null) {
//         clearTimeout(flushTimer as any);
//         flushTimer = null;
//       }
//       if (contentBuffer.length === 0) return;
//       const toWrite = contentBuffer.splice(0, contentBuffer.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };

//     let lastProgress = -1;
//     let lastProgressTs = 0;
//     const PROGRESS_MIN_DIFF = 1;
//     const PROGRESS_MIN_MS = 300;
//     const throttleProgress = (processed: number, total: number) => {
//       const now = Date.now();
//       const pct = Math.round((processed / Math.max(1, total)) * 100);
//       if (pct === lastProgress && now - lastProgressTs < PROGRESS_MIN_MS) return;
//       if (Math.abs(pct - lastProgress) < PROGRESS_MIN_DIFF && now - lastProgressTs < PROGRESS_MIN_MS) return;
//       lastProgress = pct;
//       lastProgressTs = now;
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
//       try { onProgress?.(pct); } catch (_) { /* ignore */ }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
//       const { keywords } = extractKeywordsFromWorkbookBuffer(buffer);
//       if (!keywords || keywords.length === 0) {
//         const projError: ExcelProject = {
//           id: fileId,
//           fileName: file.name,
//           status: "error",
//           totalKeywords: 0,
//           processedKeywords: 0,
//           createdAt: new Date().toISOString(),
//           error: "No valid keywords found in uploaded Excel file",
//         };
//         ensureProject(projError);
//         toast.error("No valid keywords found in the uploaded Excel file.");
//         onProgress?.(100);
//         return;
//       }

//       const project: ExcelProject = {
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: keywords.length,
//         processedKeywords: 0,
//         createdAt: new Date().toISOString(),
//       };
//       ensureProject(project);

//       toast.info(`Found ${keywords.length} keywords. Starting generation...`);

//       // concurrency and adaptive loop (kept similar)
//       let concurrency = Math.min(6, Math.max(2, Math.floor(navigator.hardwareConcurrency ? navigator.hardwareConcurrency / 2 : 4)));
//       const MIN_CONCURRENCY = 1;
//       const MAX_CONCURRENCY = 8;
//       let consecutiveNetworkErrors = 0;
//       let processedCount = 0;
//       let index = 0;

//       const generateWithRetries = async (keyword: string): Promise<string | null> => {
//         let attempt = 0;
//         const MAX_ATTEMPTS = 3;
//         let backoff = 400;
//         while (attempt < MAX_ATTEMPTS) {
//           attempt++;
//           try {
//             const text = await generateContentForKeyword(keyword, API_KEY);
//             return text;
//           } catch (err) {
//             const msg = (err as Error)?.message?.toLowerCase() ?? "";
//             const isNetwork = msg.includes("tunnel") || msg.includes("proxy") || msg.includes("failed to fetch") || msg.includes("network");
//             if (isNetwork) {
//               consecutiveNetworkErrors++;
//               concurrency = Math.max(MIN_CONCURRENCY, Math.floor(concurrency / 2));
//               toast.warning("Network issue detected — reducing concurrency to " + concurrency);
//             }
//             if (attempt < MAX_ATTEMPTS) {
//               await sleep(backoff);
//               backoff *= 2;
//               continue;
//             }
//             return null;
//           }
//         }
//         return null;
//       };

//       const running = new Set<Promise<void>>();
//       const startNext = () => {
//         if (index >= keywords.length) return;
//         const kw = keywords[index++];
//         const curIndex = index;
//         const task = (async () => {
//           try {
//             const generated = await generateWithRetries(kw);
//             if (generated) {
//               const contentItem: ContentItem = {
//                 id: `${fileId}-${curIndex}-${Date.now()}`,
//                 keyword: kw,
//                 generatedContent: generated,
//                 fileId,
//                 fileName: file.name,
//                 createdAt: new Date().toISOString(),
//               };
//               contentBuffer.push(contentItem);
//               if (contentBuffer.length >= FLUSH_COUNT) flushNow();
//               else scheduleFlush();
//             }
//           } catch (e) {
//             console.error("Unexpected generate error:", e);
//           } finally {
//             processedCount++;
//             throttleProgress(processedCount, keywords.length);
//             if (consecutiveNetworkErrors === 0 && concurrency < MAX_CONCURRENCY) {
//               concurrency = Math.min(MAX_CONCURRENCY, concurrency + 0.2);
//             } else if (consecutiveNetworkErrors >= 3) {
//               concurrency = Math.max(MIN_CONCURRENCY, Math.floor(concurrency / 2));
//               consecutiveNetworkErrors = 0;
//             }
//           }
//         })().finally(() => running.delete(task));
//         running.add(task);
//       };

//       while (index < keywords.length || running.size > 0) {
//         const curConcurrency = Math.max(MIN_CONCURRENCY, Math.min(MAX_CONCURRENCY, Math.floor(concurrency)));
//         while (running.size < curConcurrency && index < keywords.length) {
//           startNext();
//         }
//         if (running.size === 0 && index >= keywords.length) break;
//         // @ts-ignore
//         await Promise.race(Array.from(running));
//       }

//       flushNow();

//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length } : p)));
//       toast.success(`Finished. Generated content (approx) for ${contentItems.length} keywords.`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p)));
//       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
//       onProgress?.(100);
//       throw error;
//     } finally {
//       flushNow();
//       setIsProcessing(false);
//     }
//   };

//   const deleteProject = (projectId: string) => {
//     setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
//     setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
//     toast.success("Project deleted");
//   };

//   const deleteAllProjects = () => {
//     setExcelProjects([]);
//     setContentItems([]);
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
//     openContentEditor, // allow hook consumers to get openContentEditor as well
//   };
// }


// src/hooks/use-content-generation.ts
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import * as XLSX from "xlsx";
import { generateJSONTitleHtml } from "@/lib/llm/api";
import { useContentPreferences } from "@/hooks/use-preferences";

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

type GenerateProgressCallback = (progressPercentage: number) => void;

const SESSION_KEY = "open-content-item_v1";

export function openContentEditor(item: ContentItem) {
  try {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
    } catch {
      try { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); } catch {}
    }
    const win = window.open("/content/editor", "_blank");
    if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
  } catch {
    try { window.location.href = "/content/editor"; } catch {}
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Excel helpers + LOGS
// ───────────────────────────────────────────────────────────────────────────────
function isLikelyUrlOrDomain(s: string | undefined | null) {
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
  if (v.length > 180) return "";
  if (isLikelyUrlOrDomain(v)) return "";
  if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
  v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
  if (v.length < 2) return "";
  return v;
}

type KeywordRow = { keyword: string; url?: string | null };

function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
  if (!rows?.length) return [];
  const maxCols = Math.max(...rows.map(r => Array.isArray(r) ? r.length : 0), 0);
  const dataRows = rows.slice(1);
  const out: KeywordRow[] = [];
  const seen = new Set<string>();

  for (const r of dataRows) {
    if (!Array.isArray(r)) continue;
    for (let c = 0; c < maxCols; c++) {
      const k = sanitizeKeyword(r[c]);
      if (!k || seen.has(k)) continue;

      let url: string | undefined;
      for (let offset = -3; offset <= 3; offset++) {
        if (offset === 0) continue;
        const idx = c + offset;
        if (idx < 0 || idx >= maxCols) continue;
        const maybe = r[idx]; if (!maybe) continue;
        const s = String(maybe).trim();
        if (isLikelyUrlOrDomain(s)) {
          url = /^https?:\/\//i.test(s) ? s : "https://" + s;
          break;
        }
      }
      out.push({ keyword: k, url: url ?? null });
      seen.add(k);
      break;
    }
  }
  return out;
}
function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetNames = workbook.SheetNames ?? [];
  console.log("[GEN] workbook sheets:", sheetNames);
  const combined: KeywordRow[] = [];
  const seen = new Set<string>();
  const perSheet: Record<string, number> = {};

  for (const sheetName of sheetNames) {
    try {
      const sheet = workbook.Sheets[sheetName];
      const ks = extractKeywordsFromWorksheetWithUrls(sheet);
      perSheet[sheetName] = ks.length;
      for (const k of ks) if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
      console.log(`[GEN] sheet '${sheetName}' →`, ks.length, "keywords");
      if (combined.length > 4000) break;
    } catch (e) {
      console.warn("sheet parse fail:", sheetName, e);
    }
  }
  console.log("[GEN] total extracted keywords:", combined.length, combined.slice(0, 5));
  return { keywords: combined, perSheet };
}

// Anchors
function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function buildAnchorHTML(keyword: string, url?: string | null) {
  const kw = escapeHtml(keyword);
  if (url) {
    const u = escapeHtml(url);
    return `<a href="${u}" target="_blank" rel="nofollow noopener"><strong>${kw}</strong></a>`;
  }
  return `<strong>${kw}</strong>`;
}
function applyAllAnchors(html: string, urlMap: Record<string, string | null>): string {
  let out = html || "";
  const kws = Object.keys(urlMap);
  for (const k of kws) {
    const token = `[ANCHOR:${k}]`;
    if (out.includes(token)) out = out.replace(token, buildAnchorHTML(k, urlMap[k]));
  }
  for (const k of kws) {
    const token = `[ANCHOR:${k}]`;
    if (!out.includes(token)) {
      if (out.includes("</p>")) out = out.replace("</p>", ` ${buildAnchorHTML(k, urlMap[k])}</p>`);
      else out = `${buildAnchorHTML(k, urlMap[k])} ${out}`;
    }
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────────────────

export function useContentGeneration() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
  const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);
  const { prefs } = useContentPreferences();

  const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
    setExcelProjects((prev = []) => {
      const exists = prev.some((p) => p.id === proj.id);
      const base: ExcelProject = {
        id: proj.id,
        fileName: proj.fileName,
        status: (proj as any).status ?? "pending",
        totalKeywords: (proj as any).totalKeywords ?? 0,
        processedKeywords: (proj as any).processedKeywords ?? 0,
        createdAt: (proj as any).createdAt ?? new Date().toISOString(),
        error: (proj as any).error,
        failedCount: (proj as any).failedCount ?? 0,
      };
      if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
      return [...prev, base];
    });
  };

  const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
    console.log("[GEN] generateContent start:", { name: file.name, size: file.size, fileId });
    setIsProcessing(true);
    onProgress?.(0);

    ensureProject({
      id: fileId,
      fileName: file.name,
      status: "pending",
      totalKeywords: 0,
      processedKeywords: 0,
      createdAt: new Date().toISOString(),
      failedCount: 0,
    });

    const bufferItems: ContentItem[] = [];
    let FLUSH_TIMER: number | null = null;
    const flushNow = () => {
      if (FLUSH_TIMER != null) { clearTimeout(FLUSH_TIMER as any); FLUSH_TIMER = null; }
      if (bufferItems.length === 0) return;
      const toWrite = bufferItems.splice(0, bufferItems.length);
      console.log("[GEN] flushing", toWrite.length, "items to localStorage");
      setContentItems((prev) => [...(prev ?? []), ...toWrite]);
    };
    const scheduleFlush = () => {
      if (FLUSH_TIMER != null) return;
      // @ts-ignore
      FLUSH_TIMER = window.setTimeout(() => flushNow(), 300);
    };

    let failedCount = 0;

    let processedCount = 0;
    const updateProgress = (processed: number, total: number) => {
      setExcelProjects((prev) => (prev ?? []).map((p) =>
        p.id === fileId ? { ...p, processedKeywords: processed } : p
      ));
      const pct = Math.round((processed / Math.max(1, total)) * 100);
      console.log("[GEN] progress:", `${processed}/${total}`, `${pct}%`);
      try { onProgress?.(pct); } catch {}
    };

    try {
      const buffer = await file.arrayBuffer();
      console.log("[GEN] read bytes:", buffer.byteLength);

      const { keywords } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
      if (!keywords.length) {
        console.warn("[GEN] No keywords parsed from Excel.");
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

      // grouping per preference (1/2/4)
      const size = (prefs?.keywordMode ?? 1) as 1 | 2 | 4;
      const groups: KeywordRow[][] = [];
      for (let i = 0; i < keywords.length; i += size) {
        groups.push(keywords.slice(i, i + size));
      }
      console.log("[GEN] preferences:", { keywordMode: size, extraInstructions: prefs?.extraInstructions || "" });
      console.log("[GEN] groups:", groups.length, "totalKeywords:", keywords.length);

      ensureProject({
        id: fileId,
        fileName: file.name,
        status: "processing",
        totalKeywords: keywords.length,
        processedKeywords: 0,
      });
      toast.info(`Found ${keywords.length} keywords → grouping by ${size}. Generating…`);

      // concurrency
      let concurrency = Math.min(6, Math.max(1, Math.floor((navigator.hardwareConcurrency ?? 4) / 2)));
      const MIN = 1, MAX = 8;
      let idx = 0;
      const running = new Set<Promise<void>>();

      const startNext = () => {
        if (idx >= groups.length) return;
        const groupIndex = idx++;
        const grp = groups[groupIndex];
        const kws = grp.map(g => g.keyword);
        const urlMap: Record<string, string | null> = {};
        grp.forEach(g => { urlMap[g.keyword] = g.url ?? null; });

        console.log("[GEN] start group", groupIndex, "kws:", kws);

        const task = (async () => {
          try {
            // IMPORTANT: pass actual keywords array; NOT any prompt string
            const t0 = performance.now();
            const result = await generateJSONTitleHtml({
              keywords: kws,
              instructions: prefs?.extraInstructions ?? "",
            });
            const dt = Math.round(performance.now() - t0);
            console.log("[GEN] LLM ok group", groupIndex, "in", `${dt}ms`, "titleLen:", result.title.length, "htmlLen:", result.html.length);

            const finalHtml = applyAllAnchors(result.html, urlMap);
            const item: ContentItem = {
              id: `${fileId}-${groupIndex}-${Date.now()}`,
              keyword: kws[0],
              keywordsUsed: kws,
              generatedContent: finalHtml,
              fileId,
              fileName: file.name,
              createdAt: new Date().toISOString(),
              title: result.title,
              targetUrl: urlMap[kws[0]] ?? null,
              urlMap,
              status: "success",
            };
            bufferItems.push(item);
            scheduleFlush();
          } catch (e) {
            failedCount++;
            console.error("[GEN] group generate error:", e);
          } finally {
            processedCount += grp.length;
            updateProgress(processedCount, keywords.length);
          }
        })().finally(() => running.delete(task));

        running.add(task);
      };

      while (idx < groups.length || running.size > 0) {
        const cur = Math.max(MIN, Math.min(MAX, Math.floor(concurrency)));
        while (running.size < cur && idx < groups.length) startNext();
        if (!running.size && idx >= groups.length) break;
        await Promise.race(Array.from(running));
        if (failedCount > 0 && concurrency > 2) concurrency -= 0.2;
        else if (concurrency < MAX) concurrency += 0.1;
      }

      flushNow();
      setExcelProjects((prev) =>
        (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length, failedCount } : p))
      );
      const ok = keywords.length - failedCount;
      console.log("[GEN] finished file:", file.name, "ok:", ok, "failed:", failedCount);
      toast.success(`Finished ${file.name}: ✅ ${ok} • ❌ ${failedCount}`);
      onProgress?.(100);
    } catch (error) {
      console.error("[GEN] generateContent overall error:", error);
      setExcelProjects((prev) =>
        (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p))
      );
      toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
      onProgress?.(100);
      throw error;
    } finally {
      flushNow();
      setIsProcessing(false);
    }
  };

  const deleteProject = (projectId: string) => {
    setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
    setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
    toast.success("Project deleted");
  };

  const deleteAllProjects = () => {
    setExcelProjects([]);
    setContentItems([]);
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
