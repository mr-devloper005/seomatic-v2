// // import { useState } from 'react';
// // import { GoogleGenerativeAI } from '@google/generative-ai';
// // import { toast } from 'sonner';
// // import { useLocalStorage } from '@/hooks/use-local-storage';
// // import * as XLSX from 'xlsx';

// // interface ContentItem {
// //   id: string;
// //   keyword: string;
// //   generatedContent: string;
// //   fileId: string;
// //   fileName: string;
// //   createdAt: Date;
// // }

// // export function useContentGeneration() {
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>('content-items', []);

// //   // Initialize Gemini AI
// //   const genAI = new GoogleGenerativeAI('AIzaSyDMLKj8FWf0O3bbp33LV8bYXKsLbCCkky0');

// //   const generateContent = async (
// //     file: File, 
// //     fileId: string, 
// //     onProgress?: (progress: number) => void
// //   ) => {
// //     setIsProcessing(true);
    
// //     try {
// //       // Parse Excel file
// //       const data = await file.arrayBuffer();
// //       const workbook = XLSX.read(data);
// //       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
// //       const jsonData = XLSX.utils.sheet_to_json(worksheet);

// //       if (!jsonData || jsonData.length === 0) {
// //         throw new Error('No data found in Excel file');
// //       }

// //       // Extract keywords from the first column (assuming keywords are in the first column)
// //       const keywords = jsonData.map((row: any) => {
// //         const firstKey = Object.keys(row)[0];
// //         return row[firstKey]?.toString().trim();
// //       }).filter((keyword: string) => keyword && keyword.length > 0);

// //       if (keywords.length === 0) {
// //         throw new Error('No valid keywords found in Excel file');
// //       }

// //       toast.info(`Found ${keywords.length} keywords. Starting content generation...`);

// //       // Generate content for each keyword
// //       const newContentItems: ContentItem[] = [];
      
// //       for (let i = 0; i < keywords.length; i++) {
// //         const keyword = keywords[i];
// //         const progress = Math.round(((i + 1) / keywords.length) * 100);
// //         onProgress?.(progress);

// //         try {
// //           // Generate content using Gemini
// //           const generatedContent = await generateContentForKeyword(keyword);
          
// //           const contentItem: ContentItem = {
// //             id: `${fileId}-${i}-${Date.now()}`,
// //             keyword,
// //             generatedContent,
// //             fileId,
// //             fileName: file.name,
// //             createdAt: new Date(),
// //           };

// //           newContentItems.push(contentItem);
          
// //           // Add a small delay to avoid rate limiting
// //           await new Promise(resolve => setTimeout(resolve, 1000));
// //         } catch (error) {
// //           console.error(`Error generating content for keyword "${keyword}":`, error);
// //           toast.error(`Failed to generate content for keyword: ${keyword}`);
// //         }
// //       }

// //       // Save all generated content
// //       setContentItems(prev => [...prev, ...newContentItems]);
      
// //       toast.success(`Successfully generated content for ${newContentItems.length} keywords`);
      
// //     } catch (error) {
// //       console.error('Error processing Excel file:', error);
// //       throw error;
// //     } finally {
// //       setIsProcessing(false);
// //     }
// //   };

// //   const generateContentForKeyword = async (keyword: string): Promise<string> => {
// //     try {
// //       // Try different model names in order of preference
// //       const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
// //       let lastError: Error | null = null;
      
// //       for (const modelName of models) {
// //         try {
// //           const model = genAI.getGenerativeModel({ model: modelName });
          
// //           const prompt = `Role & Goal

// // You are a senior editorial copychief + subject-matter editor. Write a human-grade article that reads naturally, avoids rigid templates, and aligns with Google E-E-A-T. Prioritize real-world specifics, uneven cadence, and restrained optimization so AI detectors score low.
// // Inputs


// // TOPIC: <insert>


// // PRIMARY KEYWORDS (with exact casing/spelling):${keyword}


// // BRAND / WEBSITE (tone alignment only, no copying): <site url>


// // AUDIENCE: <who is reading>


// // TONE: Neutral, confident, practical.


// // POV: Third person.


// // LENGTH: ≥ <min words>; allow ±15% variance (never identical paragraph lengths).


// // SPECIAL RULES (if any): <e.g., keyword frequency, bolding rules, placements>


// // Output Format (Markdown)


// // A catchy, informative H1 title (60–80 characters).


// // Bold H2/H3 section headings.


// // Short paragraphs interleaved with a few longer ones (no perfect symmetry).


// // Use bullet points only if explicitly requested in SPECIAL RULES.


// // No meta commentary about the writing process in the output.


// // Opening & Thesis


// // Start with a vivid, concrete scene or brief anecdote within 25–35 words that anchors time/place or workflow reality.


// // Give a one-paragraph overview of the topic’s significance and clearly state the main argument.


// // Humanization Levers (must include, subtly):


// // Sentence-length variance: ~20–30% short (≤12 words), ~50–60% medium (13–23), ~15–20% long (24–34).


// // Include exactly 1–2 rhetorical questions across the piece.


// // Allow 1 tasteful parenthetical aside and 1 em-dash aside for rhythm (—like this).


// // Embed incidental specifics (e.g., “24-bit/48 kHz WAV,” “170–174 BPM,” “sidechain to VO bus,” “ATTACK 10 ms, RELEASE 60 ms,” file names, small numbers, micro-decisions).


// // Add 1 nuance/contradiction that shows judgment (e.g., “loops are tools, not crutches”).


// // Avoid stock phrases like “In conclusion,” “Moreover,” “Furthermore,” “In today’s world” (replace with varied, natural connectors).


// // E-E-A-T Signals (without fluff):


// // Practical, verifiable advice with small operational details (settings, checks, trade-offs, edge cases).


// // If citing facts, use commonly known, non-controversial information; no invented stats.


// // Align tone with <site url> offerings and audience expectations; do not copy wording.


// // Add one internal-link placeholder to a relevant page: [anchor text](/your-relevant-url).


// // Keyword Handling (natural, controlled):


// // Place keywords mid-paragraph, not at starts/ends.


// // Respect SPECIAL RULES for exact counts/format. Otherwise, cap each primary keyword at 2–3 natural uses; use synonyms elsewhere.


// // Never stuff; never repeat identical surrounding phrasing.


// // Structure Guide (edit as needed):


// // Hook & Why It Matters — anecdote + thesis.


// // Practical Foundations — what to check first; constraints readers face.


// // Technique & Workflow — 2–3 concrete steps with tiny parameters.


// // Use-Case / Application — where the sound/idea fits; one scenario.


// // Mix/Quality & Pitfalls — trade-offs, what to avoid, quick fixes.


// // Wrap-Up with Brand Fit — restate value; naturally mention brand mid-conclusion.


// // Style Constraints (detector-aware):


// // Vary paragraph lengths (60–140 words); do not make them equal.


// // Prefer specific nouns/verbs over adjectives; keep abstractions low.


// // Limit parallel sentence openings; rotate transitions.


// // Keep 1–2 mild imperfections that humans make (a clipped fragment for emphasis is fine).


// // No claims of personal lived experience; instead present practiced, observational guidance.


// // Final Placement Rules (important if your brief includes keywords/brand rules):


// // If a keyword must appear in Sections X/Y, place it mid-paragraph there and nowhere else beyond the requested count.


// // Mention the brand/website once in the middle of the final paragraph (bold only if the brief requires it).


// // Honor any formatting rules exactly for bold/italics.


// // Quality Checklist (perform silently before returning the article):


// // Kill repetition of rare phrases; swap at least 3 generic connectors with varied ones.


// // Ensure at least 2 incidental specifics and 1 tiny, scene-like detail remain.


// // Break one overlong sentence; merge one pair of shorts.


// // Paragraph lengths are uneven; no pattern like 90/90/90/90.


// // Keywords present as instructed; no extra occurrences.


// // No “in conclusion” phrase; ending is concrete and brand-aligned.


// // Now write the article. Do not include this prompt or any explanation in the output.`;

// //           const result = await model.generateContent(prompt);
// //           const response = await result.response;
// //           const text = response.text();
          
// //           console.log(`Successfully used model: ${modelName}`);
// //           return text;
// //         } catch (error) {
// //           console.log(`Model ${modelName} failed, trying next...`);
// //           lastError = error as Error;
// //           continue;
// //         }
// //       }
      
// //       throw lastError || new Error('All models failed');
// //     } catch (error) {
// //       console.error('Error calling Gemini API:', error);
// //       throw new Error(`Failed to generate content for keyword: ${keyword}`);
// //     }
// //   };

// //   return {
// //     generateContent,
// //     isProcessing,
// //     contentItems,
// //     setContentItems,
// //   };
// // }
















// // hooks/use-content-generation.ts
// import { useState } from "react";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";

// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string; // store as ISO string for localStorage safety
// }

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: 'pending' | 'processing' | 'completed' | 'error';
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
// }

// const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"] as const;

// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// const buildPrompt = (keyword: string) => `Role & Goal

// You are a senior editorial copychief + subject-matter editor. Write a human-grade article that reads naturally, avoids rigid templates, and aligns with Google E-E-A-T. Prioritize real-world specifics, uneven cadence, and restrained optimization so AI detectors score low.

// Inputs

// TOPIC: ${keyword}

// PRIMARY KEYWORDS (with exact casing/spelling): ${keyword}

// BRAND / WEBSITE (tone alignment only, no copying): finfx.com

// AUDIENCE: Financial traders and investors

// TONE: Neutral, confident, practical.

// POV: Third person.

// LENGTH: ≥ 300 words; allow ±15% variance (never identical paragraph lengths).

// SPECIAL RULES (if any): Include practical trading insights, market analysis, and actionable advice.

// Output Format (Markdown)

// A catchy, informative H1 title (60–80 characters).

// Bold H2/H3 section headings.

// Short paragraphs interleaved with a few longer ones (no perfect symmetry).

// Use bullet points only if explicitly requested in SPECIAL RULES.

// No meta commentary about the writing process in the output.

// Opening & Thesis

// Start with a vivid, concrete scene or brief anecdote within 25–35 words that anchors time/place or workflow reality.

// Give a one-paragraph overview of the topic's significance and clearly state the main argument.

// Humanization Levers (must include, subtly):

// Sentence-length variance: ~20–30% short (≤12 words), ~50–60% medium (13–23), ~15–20% long (24–34).

// Include exactly 1–2 rhetorical questions across the piece.

// Allow 1 tasteful parenthetical aside and 1 em-dash aside for rhythm (—like this).

// Embed incidental specifics (e.g., "24-bit/48 kHz WAV," "170–174 BPM," "sidechain to VO bus," "ATTACK 10 ms, RELEASE 60 ms," file names, small numbers, micro-decisions).

// Add 1 nuance/contradiction that shows judgment (e.g., "loops are tools, not crutches").

// Avoid stock phrases like "In conclusion," "Moreover," "Furthermore," "In today's world" (replace with varied, natural connectors).

// E-E-A-T Signals (without fluff):

// Practical, verifiable advice with small operational details (settings, checks, trade-offs, edge cases).

// If citing facts, use commonly known, non-controversial information; no invented stats.

// Align tone with finfx.com offerings and audience expectations; do not copy wording.

// Add one internal-link placeholder to a relevant page: [anchor text](/your-relevant-url).

// Keyword Handling (natural, controlled):

// Place keywords mid-paragraph, not at starts/ends.

// Respect SPECIAL RULES for exact counts/format. Otherwise, cap each primary keyword at 2–3 natural uses; use synonyms elsewhere.

// Never stuff; never repeat identical surrounding phrasing.

// Structure Guide (edit as needed):

// Hook & Why It Matters — anecdote + thesis.

// Practical Foundations — what to check first; constraints readers face.

// Technique & Workflow — 2–3 concrete steps with tiny parameters.

// Use-Case / Application — where the sound/idea fits; one scenario.

// Mix/Quality & Pitfalls — trade-offs, what to avoid, quick fixes.

// Wrap-Up with Brand Fit — restate value; naturally mention brand mid-conclusion.

// Style Constraints (detector-aware):

// Vary paragraph lengths (60–140 words); do not make them equal.

// Prefer specific nouns/verbs over adjectives; keep abstractions low.

// Limit parallel sentence openings; rotate transitions.

// Keep 1–2 mild imperfections that humans make (a clipped fragment for emphasis is fine).

// No claims of personal lived experience; instead present practiced, observational guidance.

// Final Placement Rules (important if your brief includes keywords/brand rules):

// If a keyword must appear in Sections X/Y, place it mid-paragraph there and nowhere else beyond the requested count.

// Mention the brand/website once in the middle of the final paragraph (bold only if the brief requires it).

// Honor any formatting rules exactly for bold/italics.

// Quality Checklist (perform silently before returning the article):

// Kill repetition of rare phrases; swap at least 3 generic connectors with varied ones.

// Ensure at least 2 incidental specifics and 1 tiny, scene-like detail remain.

// Break one overlong sentence; merge one pair of shorts.

// Paragraph lengths are uneven; no pattern like 90/90/90/90.

// Keywords present as instructed; no extra occurrences.

// No "in conclusion" phrase; ending is concrete and brand-aligned.

// Now write the article. Do not include this prompt or any explanation in the output.`;


// // Heuristics to extract keywords reliably from Excel
// function sanitizeKeyword(raw: unknown): string {
//   const value = raw == null ? "" : String(raw).trim();
//   if (!value) return "";

//   // Remove leading numbering patterns like "1.", "1)", "1 -", "(1)", "1:"
//   const withoutLeadingNumbers = value
//     .replace(/^\(?\s*\d+\s*[\.):-]\s*/u, "")
//     .trim();

//   // Ignore pure numbers or short numeric-like tokens
//   if (/^\d+(\.\d+)?$/.test(withoutLeadingNumbers)) return "";

//   // Ignore very short tokens that are unlikely to be keywords
//   if (withoutLeadingNumbers.length < 2) return "";

//   return withoutLeadingNumbers;
// }

// function pickKeywordColumn(rowsAsArrays: unknown[][]): number | null {
//   // Find header row (first row that has at least one non-empty cell)
//   const headerRow = rowsAsArrays.find((r) => Array.isArray(r) && r.some((c) => String(c ?? "").trim().length > 0)) as unknown[] | undefined;
//   if (!headerRow) return null;

//   // Try by header names first
//   const headerNames = headerRow.map((c) => String(c ?? "").trim().toLowerCase());
//   const preferredHeaders = ["keyword", "keywords", "topic", "title", "query", "search term", "focus keyword"]; 
//   for (let i = 0; i < headerNames.length; i++) {
//     if (preferredHeaders.includes(headerNames[i])) {
//       return i;
//     }
//   }

//   // Heuristic: choose the column with the highest count of non-numeric, non-empty strings
//   // Look at next ~50 rows after header for signal
//   const lookaheadRows = rowsAsArrays.slice(1, 51) as unknown[][];
//   let bestCol = -1;
//   let bestScore = -1;
//   const maxCols = Math.max(...rowsAsArrays.map((r) => (Array.isArray(r) ? r.length : 0)));

//   for (let col = 0; col < maxCols; col++) {
//     let score = 0;
//     for (const r of lookaheadRows) {
//       const cell = Array.isArray(r) ? r[col] : undefined;
//       const s = sanitizeKeyword(cell);
//       if (s) score += 1;
//     }
//     if (score > bestScore) {
//       bestScore = score;
//       bestCol = col;
//     }
//   }

//   return bestScore > 0 ? bestCol : null;
// }

// function extractKeywordsFromWorksheet(worksheet: XLSX.WorkSheet): string[] {
//   // Read as arrays to easily access by column index
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

//   const initialCol = pickKeywordColumn(rows);
//   if (initialCol == null) return [];
//   let selectedCol: number = initialCol;

//   // If we detected a header row, skip it and take the rest
//   const dataRows = rows.slice(1);
//   let keywords = dataRows
//     .map((r) => (Array.isArray(r) ? sanitizeKeyword(r[selectedCol]) : ""))
//     .filter((s) => s.length > 0);

//   // Fallback: if first 10 values are mostly numeric/empty after sanitize, try to auto-switch to a better column
//   const sample = keywords.slice(0, 10);
//   const mostlyBad = sample.length > 0 && sample.filter((s) => /^(\d+(\.\d+)?)$/.test(s)).length >= Math.ceil(sample.length * 0.6);
//   if (mostlyBad) {
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)));
//     let bestAltCol = selectedCol;
//     let bestAltScore = -1;
//     for (let col = 0; col < maxCols; col++) {
//       if (col === selectedCol) continue;
//       let score = 0;
//       for (const r of dataRows.slice(0, 50)) {
//         const s = sanitizeKeyword(Array.isArray(r) ? r[col] : undefined);
//         if (s && !/^(\d+(\.\d+)?)$/.test(s)) score += 1;
//       }
//       if (score > bestAltScore) {
//         bestAltScore = score;
//         bestAltCol = col;
//       }
//     }
//     if (bestAltScore > 0 && bestAltCol !== selectedCol) {
//       selectedCol = bestAltCol;
//       keywords = dataRows
//         .map((r) => (Array.isArray(r) ? sanitizeKeyword(r[selectedCol]) : ""))
//         .filter((s) => s.length > 0);
//     }
//   }

//   return keywords;
// }


// /**
//  * React hook to parse Excel, iterate keywords, and generate content with Gemini.
//  */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   // Initialize Gemini AI with the provided API key
//   const genAI = new GoogleGenerativeAI('AIzaSyDMLKj8FWf0O3bbp33LV8bYXKsLbCCkky0');

//   const generateContent = async (
//     file: File,
//     fileId: string,
//     onProgress?: (progress: number) => void
//   ) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     try {
//       // Parse Excel (first worksheet)
//       const data = await file.arrayBuffer();
//       const workbook = XLSX.read(data);
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];

//       // Robust keyword extraction
//       const keywords = extractKeywordsFromWorksheet(worksheet);

//       if (keywords.length === 0) throw new Error("No valid keywords found in Excel file");

//       // Create Excel project entry
//       const project: ExcelProject = {
//         id: fileId,
//         fileName: file.name,
//         status: 'processing',
//         totalKeywords: keywords.length,
//         processedKeywords: 0,
//         createdAt: new Date().toISOString(),
//       };

//       setExcelProjects(prev => [...prev, project]);
//       toast.info(`Found ${keywords.length} keywords. Starting content generation...`);

//       const newContentItems: ContentItem[] = [];

//       // Process keywords in batches; may reduce if repeated network failures occur
//       let batchSize = 10; // Gemini allows 10 parallel requests
//       let consecutiveTunnelFailures = 0;

//       for (let i = 0; i < keywords.length; i += batchSize) {
//         const batch = keywords.slice(i, i + batchSize);
        
//         // Process batch in parallel
//         const batchPromises = batch.map(async (keyword, batchIndex) => {
//           try {
//             const generatedContent = await generateContentForKeyword(genAI, keyword);
            
//             const contentItem: ContentItem = {
//               id: `${fileId}-${i + batchIndex}-${Date.now()}`,
//               keyword,
//               generatedContent,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//             };

//             return contentItem;
//           } catch (err) {
//             console.error(`Error generating content for keyword "${keyword}":`, err);
//             toast.error(`Failed to generate content for keyword: ${keyword}`);

//             // Detect tunnel/proxy failures to adapt concurrency
//             const msg = (err as Error)?.message?.toLowerCase() || "";
//             if (msg.includes("tunnel") || msg.includes("proxy") || msg.includes("failed to fetch")) {
//               consecutiveTunnelFailures += 1;
//             }
//             return null;
//           }
//         });

//         // Wait for batch to complete
//         const batchResults = await Promise.all(batchPromises);
//         const validResults = batchResults.filter(item => item !== null) as ContentItem[];
//         newContentItems.push(...validResults);

//         // Update project progress
//         const processedCount = Math.min(i + batch.length, keywords.length);
//         setExcelProjects(prev => 
//           prev.map(p => p.id === fileId ? { ...p, processedKeywords: processedCount } : p)
//         );

//         // Update progress
//         const progress = Math.round((processedCount / keywords.length) * 100);
//         onProgress?.(progress);

//         // Adapt concurrency on repeated tunnel errors
//         if (consecutiveTunnelFailures >= 2) {
//           batchSize = Math.max(2, Math.floor(batchSize / 2));
//           consecutiveTunnelFailures = 0; // reset after adapting
//         }

//         // Small delay between batches to avoid rate limiting / network strain
//         if (i + batchSize < keywords.length) await sleep(300);
//       }

//       // Mark project as completed
//       setExcelProjects(prev => 
//         prev.map(p => p.id === fileId ? { ...p, status: 'completed', processedKeywords: keywords.length } : p)
//       );

//       setContentItems((prev) => [...prev, ...newContentItems]);
//       toast.success(`Successfully generated content for ${newContentItems.length} keywords`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("Error processing Excel file:", error);
      
//       // Mark project as error
//       setExcelProjects(prev => 
//         prev.map(p => p.id === fileId ? { 
//           ...p, 
//           status: 'error', 
//           error: error instanceof Error ? error.message : 'Unknown error'
//         } : p)
//       );
      
//       throw error;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const generateContentForKeyword = async (client: GoogleGenerativeAI, keyword: string): Promise<string> => {
//     let lastError: unknown;

//     for (const modelName of MODELS) {
//       try {
//         const model = client.getGenerativeModel({ model: modelName });

//         // You can add generationConfig here if desired
//         const result = await model.generateContent(buildPrompt(keyword));
//         const text = result.response.text();

//         if (!text || !text.trim()) throw new Error("Empty response from model");
//         // Success on this model
//         return text.trim();
//       } catch (e) {
//         // Surface network/proxy errors clearly
//         const errMsg = (e as Error)?.message || "";
//         if (errMsg.toLowerCase().includes("tunnel") || errMsg.toLowerCase().includes("proxy") || errMsg.toLowerCase().includes("failed to fetch")) {
//           toast.error("Network error: Unable to reach Gemini API (proxy/tunnel). Please check your VPN/proxy and try again.");
//         }
//         lastError = e;

//         // Simple backoff if it looks like a rate limit
//         const msg = (e as Error)?.message || "";
//         if (msg.includes("429") || msg.toLowerCase().includes("rate")) {
//           await sleep(800);
//         }

//         // Try next model
//         continue;
//       }
//     }

//     throw lastError ?? new Error("All models failed");
//   };

//   const deleteProject = (projectId: string) => {
//     // Remove project from projects list
//     setExcelProjects(prev => prev.filter(p => p.id !== projectId));
    
//     // Remove all content items for this project
//     setContentItems(prev => prev.filter(item => item.fileId !== projectId));
    
//     toast.success('Project and its content deleted successfully');
//   };

//   const deleteAllProjects = () => {
//     setExcelProjects([]);
//     setContentItems([]);
//     toast.success('All projects and content deleted successfully');
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
//   };
// }




// // src/hooks/use-content-generation.ts
// import { useState } from "react";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";

// /**
//  * Hook: useContentGeneration
//  *
//  * Usage:
//  *   // Option A: let hook read Vite env var VITE_GEMINI_API_KEY
//  *   const { generateContent, isProcessing, contentItems, excelProjects } = useContentGeneration();
//  *
//  *   // Option B: pass key explicitly (works in any bundler)
//  *   const { generateContent } = useContentGeneration("my-api-key-here");
//  *
//  * Notes:
//  *  - This hook intentionally does NOT reference `process` at module runtime.
//  *  - It stores items/projects in localStorage via useLocalStorage hook.
//  */

// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string; // ISO string
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

// const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"] as const;

// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// /** Build the content generation prompt. Keep long prompt outside of hot loops. */
// const buildPrompt = (keyword: string) => `Role & Goal

// You are a senior editorial copychief + subject-matter editor. Write a human-grade article that reads naturally, avoids rigid templates, and aligns with Google E-E-A-T. Prioritize real-world specifics, uneven cadence, and restrained optimization so AI detectors score low.

// Inputs

// TOPIC: ${keyword}
// PRIMARY KEYWORDS (with exact casing/spelling): ${keyword}
// BRAND / WEBSITE (tone alignment only, no copying): finfx.com
// AUDIENCE: Financial traders and investors
// TONE: Neutral, confident, practical.
// POV: Third person.
// LENGTH: ≥ 300 words; allow ±15% variance.

// Output Format (Markdown)
// - A catchy H1 title (60–80 chars).
// - Bold H2/H3 headings.
// - Short paragraphs interleaved with a few longer ones.

// Now write the article using the above constraints and include practical trading insights and tiny operational specifics.
// `;

// /* ---------------------------
//    Keyword extraction helpers
//    --------------------------- */

// function sanitizeKeyword(raw: unknown): string {
//   const value = raw == null ? "" : String(raw).trim();
//   if (!value) return "";

//   // Remove common leading list numeration like "1.", "1)", "(1)", "1 -"
//   const withoutLeadingNumbers = value.replace(/^\(?\s*\d+\s*[\.\):-]\s*/u, "").trim();
//   // Ignore pure numbers
//   if (/^\d+(\.\d+)?$/.test(withoutLeadingNumbers)) return "";
//   // Minimum length
//   if (withoutLeadingNumbers.length < 2) return "";
//   return withoutLeadingNumbers;
// }

// function pickKeywordColumn(rowsAsArrays: unknown[][]): number | null {
//   // find a header row (first row with some non-empty cells)
//   const headerRow = rowsAsArrays.find((r) => Array.isArray(r) && r.some((c) => String(c ?? "").trim().length > 0)) as unknown[] | undefined;
//   if (!headerRow) return null;

//   const headerNames = headerRow.map((c) => String(c ?? "").trim().toLowerCase());
//   const preferredHeaders = ["keyword", "keywords", "topic", "title", "query", "search term", "focus keyword"];
//   for (let i = 0; i < headerNames.length; i++) {
//     if (preferredHeaders.includes(headerNames[i])) return i;
//   }

//   // fallback heuristic: choose column with most non-empty sanitized strings in next rows
//   const lookaheadRows = rowsAsArrays.slice(1, 51) as unknown[][];
//   let bestCol = -1;
//   let bestScore = -1;
//   const maxCols = Math.max(...rowsAsArrays.map((r) => (Array.isArray(r) ? r.length : 0)));

//   for (let col = 0; col < maxCols; col++) {
//     let score = 0;
//     for (const r of lookaheadRows) {
//       const cell = Array.isArray(r) ? r[col] : undefined;
//       const s = sanitizeKeyword(cell);
//       if (s) score++;
//     }
//     if (score > bestScore) {
//       bestScore = score;
//       bestCol = col;
//     }
//   }
//   return bestScore > 0 ? bestCol : null;
// }

// function extractKeywordsFromWorksheet(worksheet: XLSX.WorkSheet): string[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

//   const initialCol = pickKeywordColumn(rows);
//   if (initialCol == null) return [];

//   const dataRows = rows.slice(1);
//   let selectedCol = initialCol;

//   let keywords = dataRows
//     .map((r) => (Array.isArray(r) ? sanitizeKeyword(r[selectedCol]) : ""))
//     .filter((s) => s.length > 0);

//   // If sample looks numeric/bad, try to find an alternative column
//   const sample = keywords.slice(0, 10);
//   const mostlyBad = sample.length > 0 && sample.filter((s) => /^(\d+(\.\d+)?)$/.test(s)).length >= Math.ceil(sample.length * 0.6);
//   if (mostlyBad) {
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)));
//     let bestAltCol = selectedCol;
//     let bestAltScore = -1;
//     for (let col = 0; col < maxCols; col++) {
//       if (col === selectedCol) continue;
//       let score = 0;
//       for (const r of dataRows.slice(0, 50)) {
//         const s = sanitizeKeyword(Array.isArray(r) ? r[col] : undefined);
//         if (s && !/^(\d+(\.\d+)?)$/.test(s)) score++;
//       }
//       if (score > bestAltScore) {
//         bestAltScore = score;
//         bestAltCol = col;
//       }
//     }
//     if (bestAltScore > 0 && bestAltCol !== selectedCol) {
//       selectedCol = bestAltCol;
//       keywords = dataRows.map((r) => (Array.isArray(r) ? sanitizeKeyword(r[selectedCol]) : "")).filter((s) => s.length > 0);
//     }
//   }

//   return keywords;
// }

// /* ---------------------------
//    Hook implementation
//    --------------------------- */

//    const viteKey = typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_GEMINI_API_KEY ?? "" : "";
// console.log("Passing Gemini key present?", !!viteKey); // logs true/false only



// export function useContentGeneration(passedApiKey?: string) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   /**
//    * Resolve API key at call time. Order:
//    * 1) explicit passedApiKey param to hook (recommended)
//    * 2) Vite env var import.meta.env.VITE_GEMINI_API_KEY (if available)
//    * 3) empty string (caller will receive clear error)
//    */

  

//   function resolveApiKey(): string {
//     if (passedApiKey && passedApiKey.trim()) return passedApiKey.trim();
//     try {
//       // import.meta is available in bundlers like Vite; guard for environments where it's not present
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const meta = (typeof import.meta !== "undefined" ? (import.meta as any) : undefined);
//       if (meta?.env?.VITE_GEMINI_API_KEY) return String(meta.env.VITE_GEMINI_API_KEY).trim();
//     } catch (_e) {
//       // ignore
//     }
//     return "";
//   }

//   const generateContentForKeyword = async (keyword: string, apiKey: string): Promise<string> => {
//     // inside generateContent before using API_KEY
// const API_KEY = resolveApiKey();
// console.log("useContentGeneration resolved API key present?", !!API_KEY); // only true/false

//     let lastError: unknown;

//     if (!apiKey) {
//       throw new Error(
//         "Gemini API key not set. Pass the key to useContentGeneration(apiKey) or set VITE_GEMINI_API_KEY in your build environment."
//       );
//     }

//     // Create a fresh client per call (lightweight)
//     const client = new GoogleGenerativeAI(apiKey);

//     for (const modelName of MODELS) {
//       try {
//         const model = client.getGenerativeModel({ model: modelName as string });
//         // generateContent can accept either a string prompt or a more detailed config.
//         // We pass the built prompt string here.
//         const result = await model.generateContent(buildPrompt(keyword));
//         // API shape: result.response.text()
//         const text = result?.response?.text?.();
//         if (!text || !text.trim()) throw new Error("Empty response from model");
//         return text.trim();
//       } catch (e) {
//         // surface network/proxy guidance as toast but continue to next model
//         const errMsg = (e as Error)?.message ?? "";
//         const lowered = errMsg.toLowerCase();
//         if (lowered.includes("tunnel") || lowered.includes("proxy") || lowered.includes("failed to fetch")) {
//           toast.error("Network error communicating with Gemini (proxy/tunnel). Check network and try again.");
//         }
//         lastError = e;
//         // Respect potential rate-limit hints
//         if (lowered.includes("429") || lowered.includes("rate")) {
//           await sleep(800);
//         }
//         // try next model
//         continue;
//       }
//     }

//     throw lastError ?? new Error("All models failed");
//   };

//   /**
//    * generateContent
//    * - file: uploaded Excel file
//    * - fileId: string id used to identify project
//    * - onProgress: optional progress callback (0..100)
//    */
//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     // resolve API key at the time generation starts (safe)
//     const API_KEY = resolveApiKey();

//     try {
//       const data = await file.arrayBuffer();
//       const workbook = XLSX.read(data);
//       if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
//         throw new Error("No worksheets found in Excel file");
//       }
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const keywords = extractKeywordsFromWorksheet(worksheet);

//       if (!keywords || keywords.length === 0) {
//         throw new Error("No valid keywords found in Excel file");
//       }

//       const project: ExcelProject = {
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: keywords.length,
//         processedKeywords: 0,
//         createdAt: new Date().toISOString(),
//       };

//       setExcelProjects((prev) => {
//         // dedupe if exists
//         const exists = (prev ?? []).some((p) => p.id === project.id);
//         return exists ? prev : [...(prev ?? []), project];
//       });

//       toast.info(`Found ${keywords.length} keywords. Starting content generation...`);

//       const newContentItems: ContentItem[] = [];
//       let batchSize = 6; // conservative default concurrency
//       let consecutiveTunnelFailures = 0;

//       for (let i = 0; i < keywords.length; i += batchSize) {
//         const batch = keywords.slice(i, i + batchSize);

//         const batchPromises = batch.map(async (keyword, idx) => {
//           try {
//             const generatedContent = await generateContentForKeyword(keyword, API_KEY);
//             const contentItem: ContentItem = {
//               id: `${fileId}-${i + idx}-${Date.now()}`,
//               keyword,
//               generatedContent,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//             };
//             return contentItem;
//           } catch (err) {
//             console.error(`Failed keyword "${keyword}":`, err);
//             toast.error(`Failed: ${String(keyword)}`);
//             const msg = (err as Error)?.message?.toLowerCase() ?? "";
//             if (msg.includes("tunnel") || msg.includes("proxy") || msg.includes("failed to fetch")) {
//               consecutiveTunnelFailures += 1;
//             }
//             return null;
//           }
//         });

//         const batchResults = await Promise.all(batchPromises);
//         const valid = batchResults.filter(Boolean) as ContentItem[];
//         if (valid.length) newContentItems.push(...valid);

//         const processedCount = Math.min(i + batch.length, keywords.length);
//         setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processedCount } : p)));

//         const progress = Math.round((processedCount / keywords.length) * 100);
//         onProgress?.(progress);

//         if (consecutiveTunnelFailures >= 2) {
//           batchSize = Math.max(1, Math.floor(batchSize / 2));
//           consecutiveTunnelFailures = 0;
//           toast.warning("Network issues detected — lowering concurrency.");
//         }

//         if (i + batchSize < keywords.length) await sleep(300); // small throttle
//       }

//       // mark project completed
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length } : p)));

//       // persist content items
//       setContentItems((prev) => [...(prev ?? []), ...newContentItems]);

//       toast.success(`Generated content for ${newContentItems.length} keywords`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("Error in generateContent:", error);
//       // mark project as errored if present
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p)));
//       toast.error(`Failed to process file: ${file.name}`);
//       throw error;
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
//  * - Robust / defensive implementation that resolves API key at call-time.
//  * - Batch+concurrency, progress callbacks, strong logging, persistent storage via useLocalStorage.
//  */

// /* ---------- Types ---------- */
// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string; // ISO
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
// const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"] as const;
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// const buildPrompt = (keyword: string) => `Role & Goal

// You are a senior editorial copychief + subject-matter editor. Write a human-grade article that reads naturally, avoids rigid templates, and aligns with Google E-E-A-T. Prioritize real-world specifics, uneven cadence, and restrained optimization so AI detectors score low.

// Inputs

// TOPIC: ${keyword}
// PRIMARY KEYWORDS (with exact casing/spelling): ${keyword}
// BRAND / WEBSITE (tone alignment only, no copying): finfx.com
// AUDIENCE: Financial traders and investors
// TONE: Neutral, confident, practical.
// POV: Third person.
// LENGTH: ≥ 300 words; allow ±15% variance.

// Output Format (Markdown)
// - A catchy H1 title (60–80 chars).
// - Bold H2/H3 headings.
// - Short paragraphs interleaved with a few longer ones.

// Now write the article using the above constraints and include practical trading insights and tiny operational specifics.
// `;

// /* ---------- Excel keyword extraction helpers ---------- */
// function sanitizeKeyword(raw: unknown): string {
//   const value = raw == null ? "" : String(raw).trim();
//   if (!value) return "";
//   const withoutLeadingNumbers = value.replace(/^\(?\s*\d+\s*[\.\):-]\s*/u, "").trim();
//   if (/^\d+(\.\d+)?$/.test(withoutLeadingNumbers)) return "";
//   if (withoutLeadingNumbers.length < 2) return "";
//   return withoutLeadingNumbers;
// }

// function pickKeywordColumn(rowsAsArrays: unknown[][]): number | null {
//   const headerRow = rowsAsArrays.find((r) => Array.isArray(r) && r.some((c) => String(c ?? "").trim().length > 0)) as unknown[] | undefined;
//   if (!headerRow) return null;

//   const headerNames = headerRow.map((c) => String(c ?? "").trim().toLowerCase());
//   const preferredHeaders = ["keyword", "keywords", "topic", "title", "query", "search term", "focus keyword"];
//   for (let i = 0; i < headerNames.length; i++) {
//     if (preferredHeaders.includes(headerNames[i])) return i;
//   }

//   const lookaheadRows = rowsAsArrays.slice(1, 51) as unknown[][];
//   let bestCol = -1;
//   let bestScore = -1;
//   const maxCols = Math.max(...rowsAsArrays.map((r) => (Array.isArray(r) ? r.length : 0)));

//   for (let col = 0; col < maxCols; col++) {
//     let score = 0;
//     for (const r of lookaheadRows) {
//       const cell = Array.isArray(r) ? r[col] : undefined;
//       const s = sanitizeKeyword(cell);
//       if (s) score++;
//     }
//     if (score > bestScore) {
//       bestScore = score;
//       bestCol = col;
//     }
//   }
//   return bestScore > 0 ? bestCol : null;
// }

// function extractKeywordsFromWorksheet(worksheet: XLSX.WorkSheet): string[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

//   const initialCol = pickKeywordColumn(rows);
//   if (initialCol == null) return [];

//   const dataRows = rows.slice(1);
//   let selectedCol = initialCol;

//   let keywords = dataRows
//     .map((r) => (Array.isArray(r) ? sanitizeKeyword(r[selectedCol]) : ""))
//     .filter((s) => s.length > 0);

//   const sample = keywords.slice(0, 10);
//   const mostlyBad = sample.length > 0 && sample.filter((s) => /^(\d+(\.\d+)?)$/.test(s)).length >= Math.ceil(sample.length * 0.6);
//   if (mostlyBad) {
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)));
//     let bestAltCol = selectedCol;
//     let bestAltScore = -1;
//     for (let col = 0; col < maxCols; col++) {
//       if (col === selectedCol) continue;
//       let score = 0;
//       for (const r of dataRows.slice(0, 50)) {
//         const s = sanitizeKeyword(Array.isArray(r) ? r[col] : undefined);
//         if (s && !/^(\d+(\.\d+)?)$/.test(s)) score++;
//       }
//       if (score > bestAltScore) {
//         bestAltScore = score;
//         bestAltCol = col;
//       }
//     }
//     if (bestAltScore > 0 && bestAltCol !== selectedCol) {
//       selectedCol = bestAltCol;
//       keywords = dataRows.map((r) => (Array.isArray(r) ? sanitizeKeyword(r[selectedCol]) : "")).filter((s) => s.length > 0);
//     }
//   }

//   return keywords;
// }

// /* ---------- Hook ---------- */
// export function useContentGeneration(passedApiKey?: string) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   // resolve API key at call-time
//   function resolveApiKey(): string {
//     if (passedApiKey && passedApiKey.trim()) return passedApiKey.trim();
//     try {
//       // Vite exposes import.meta.env
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const meta = (typeof import.meta !== "undefined" ? (import.meta as any) : undefined);
//       if (meta?.env?.VITE_GEMINI_API_KEY) return String(meta.env.VITE_GEMINI_API_KEY).trim();
//     } catch (_e) {
//       // ignore
//     }
//     return "";
//   }

//   console.log("ENV →", import.meta.env);

//   // Single-keyword generation with model fallback
//   const generateContentForKeyword = async (keyword: string, apiKey: string): Promise<string> => {
//     if (!apiKey) {
//       throw new Error("Gemini API key not set. Pass the key to useContentGeneration(apiKey) or set VITE_GEMINI_API_KEY in your build environment.");
//     }

//     const client = new GoogleGenerativeAI(apiKey);
//     let lastError: unknown;

//     for (const modelName of MODELS) {
//       try {
//         const model = client.getGenerativeModel({ model: modelName as string });
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
//         // try next model
//         continue;
//       }
//     }

//     throw lastError ?? new Error("All models failed");
//   };

//   /**
//    * generateContent(file, fileId, onProgress)
//    * - Reads Excel, extracts keywords, processes in batches, persists progress & generated content.
//    */
//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     const API_KEY = resolveApiKey();
//     console.log("generateContent started for file:", file.name, "fileId:", fileId, "apiKeyPresent?", !!API_KEY);

//     // create or ensure project exists
//     const ensureProject = (proj: ExcelProject) => {
//       setExcelProjects((prev = []) => {
//         const exists = prev.some((p) => p.id === proj.id);
//         if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...proj } : p));
//         return [...prev, proj];
//       });
//     };

//     try {
//       const data = await file.arrayBuffer();
//       console.log("Excel file read (bytes):", data.byteLength);

//       const workbook = XLSX.read(data);
//       if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
//         throw new Error("No worksheets found in Excel file");
//       }

//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const keywords = extractKeywordsFromWorksheet(worksheet);
//       console.log("Extracted keywords count:", keywords.length);

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
//       const newContentItems: ContentItem[] = [];
//       let batchSize = 6;
//       let consecutiveTunnelFailures = 0;

//       for (let i = 0; i < keywords.length; i += batchSize) {
//         const batch = keywords.slice(i, i + batchSize);
//         console.log(`Processing batch ${Math.floor(i / batchSize) + 1} with ${batch.length} keywords`);

//         const batchPromises = batch.map(async (keyword, batchIndex) => {
//           try {
//             const generatedContent = await generateContentForKeyword(keyword, API_KEY);
//             const contentItem: ContentItem = {
//               id: `${fileId}-${i + batchIndex}-${Date.now()}`,
//               keyword,
//               generatedContent,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//             };
//             console.log("Generated for:", keyword);
//             return contentItem;
//           } catch (err) {
//             console.error("Keyword generation error for:", keyword, err);
//             toast.error(`Failed generating for: ${keyword}`);
//             const msg = (err as Error)?.message?.toLowerCase() ?? "";
//             if (msg.includes("tunnel") || msg.includes("proxy") || msg.includes("failed to fetch")) {
//               consecutiveTunnelFailures += 1;
//             }
//             return null;
//           }
//         });

//         const results = await Promise.all(batchPromises);
//         const successItems = results.filter(Boolean) as ContentItem[];
//         if (successItems.length) {
//           setContentItems((prev) => [...(prev ?? []), ...successItems]);
//           newContentItems.push(...successItems);
//         }

//         const processedCount = Math.min(i + batch.length, keywords.length);
//         setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processedCount } : p)));

//         const progress = Math.round((processedCount / keywords.length) * 100);
//         console.log(`Progress update: ${processedCount}/${keywords.length} (${progress}%)`);
//         onProgress?.(progress);

//         if (consecutiveTunnelFailures >= 2) {
//           batchSize = Math.max(1, Math.floor(batchSize / 2));
//           consecutiveTunnelFailures = 0;
//           toast.warning("Network issues detected — reducing concurrency.");
//         }

//         if (i + batchSize < keywords.length) await sleep(250);
//       }

//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length } : p)));

//       toast.success(`Finished. Generated content for ${newContentItems.length} keywords.`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p)));
//       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
//       onProgress?.(100);
//       throw error;
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
//   };
// }





// // src/hooks/use-content-generation.ts
// import { useState } from "react";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";

// /**
//  * useContentGeneration (updated)
//  * - Improved Excel parsing (multi-sheet, robust header detection, URL/domain filtering, fallback heuristics)
//  * - Preserves your generation logic, batching, progress callbacks, localStorage persistence.
//  */

// /* ---------- Types ---------- */
// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string; // ISO
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
// const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"] as const;
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// const buildPrompt = (keyword: string) => `Role & Goal

// You are a senior editorial copychief + subject-matter editor. Write a human-grade article that reads naturally, avoids rigid templates, and aligns with Google E-E-A-T. Prioritize real-world specifics, uneven cadence, and restrained optimization so AI detectors score low.

// Inputs

// TOPIC: ${keyword}
// PRIMARY KEYWORDS (with exact casing/spelling): ${keyword}
// BRAND / WEBSITE (tone alignment only, no copying): finfx.com
// AUDIENCE: Financial traders and investors
// TONE: Neutral, confident, practical.
// POV: Third person.
// LENGTH: ≥ 300 words; allow ±15% variance.

// Output Format (Markdown)
// - A catchy H1 title (60–80 chars).
// - Bold H2/H3 headings.
// - Short paragraphs interleaved with a few longer ones.

// Now write the article using the above constraints and include practical trading insights and tiny operational specifics.
// `;

// /* ---------- Excel parsing helpers (improved) ---------- */

// function isLikelyUrlOrDomain(s: string) {
//   const trimmed = s.trim();
//   // http(s) or www or contains typical domain pattern like example.com (single word with dot)
//   if (/^https?:\/\//i.test(trimmed)) return true;
//   if (/^www\./i.test(trimmed)) return true;
//   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(trimmed) && !/\s/.test(trimmed)) return true;
//   return false;
// }

// function sanitizeKeyword(raw: unknown): string {
//   if (raw == null) return "";
//   let v = String(raw).replace(/\u00A0/g, " ").trim(); // normalize NBSP
//   if (!v) return "";
//   // remove leading enumerators "1. " "(2) - "
//   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim();
//   // remove stray bullets
//   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();
//   // don't accept pure numbers or currency-only entries
//   if (/^[\d\.,\s]+$/.test(v)) return "";
//   // strip extremely long cells (likely full text, not a keyword)
//   if (v.length > 180) return "";
//   // reject obvious urls/domains (user reported domain like Coniler.com being treated as keyword)
//   if (isLikelyUrlOrDomain(v)) return "";
//   // must contain at least 2 alpha characters
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
//   // trim stray punctuation
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2) return "";
//   return v;
// }

// /**
//  * Try to locate the best column index that looks like keyword column.
//  * Strategy:
//  *  - If a header row exists with known names, prefer that column.
//  *  - Else score each column by count of "good" sanitized cells in lookahead rows.
//  *  - Choose column with best score and at least 2 good entries.
//  */
// function pickKeywordColumn(rows: unknown[][]): number | null {
//   if (!rows || rows.length === 0) return null;

//   // Find header row: first row where at least one cell looks like a header (string)
//   const headerCandidates = rows.slice(0, 5); // only inspect top 5 rows for header
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
//   // Build headerNames if found (else headerRowIndex=0 will be used below)
//   const headerRow = headerRowIndex >= 0 && Array.isArray(rows[headerRowIndex]) ? (rows[headerRowIndex] as unknown[]) : [];

//   const headerNames = headerRow.map((c) => String(c ?? "").trim().toLowerCase());
//   const preferredHeaders = ["keyword", "keywords", "topic", "title", "query", "search term", "focus keyword", "term", "phrase"];

//   for (let i = 0; i < headerNames.length; i++) {
//     if (preferredHeaders.includes(headerNames[i])) return i;
//   }

//   // If we didn't find by header names, score columns by how many good sanitized entries they have
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
//     // require at least some non-empty entries to avoid blank columns
//     if (total === 0) continue;
//     // use score as primary; also slightly favor columns with more total entries
//     const weighted = score * 100 + Math.min(total, 100);
//     if (weighted > bestScore) {
//       bestScore = weighted;
//       bestCol = col;
//     }
//   }

//   // Accept the column only if it has at least 2 sanitized entries
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

// /**
//  * Extract keywords from a single worksheet (worksheet = XLSX.WorkSheet)
//  * - returns array of unique sanitized keywords (preserving order of first occurrence)
//  */
// function extractKeywordsFromWorksheet(worksheet: XLSX.WorkSheet): string[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];

//   const col = pickKeywordColumn(rows);
//   if (col == null) return [];

//   // If header row was included in rows[0], we map data rows starting from row 1. Best-effort: skip only first row.
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

//   // If nothing extracted (edge case), attempt scanning all columns and rows and pick short strings
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

// /**
//  * Extract keywords from a full workbook buffer (ArrayBuffer)
//  * - tries all sheets (in order), concatenates keywords (deduped)
//  */
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
//       // stop early if we have a lot (e.g., >1000) to avoid memory bloat
//       if (combined.length > 2000) break;
//     } catch (e) {
//       // ignore sheet-level parse errors but continue
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }

//   return { keywords: combined, perSheet };
// }

// /* ---------- Hook implementation (updated) ---------- */

// console.log("ENV →", import.meta.env);

// export function useContentGeneration(passedApiKey?: string) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   function resolveApiKey(): string {
//     if (passedApiKey && passedApiKey.trim()) return passedApiKey.trim();
//     try {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const meta = (typeof import.meta !== "undefined" ? (import.meta as any) : undefined);
//       if (meta?.env?.VITE_GEMINI_API_KEY) return String(meta.env.VITE_GEMINI_API_KEY).trim();
//     } catch (_e) {
//       // ignore
//     }
//     return "";
//   }

//   try {
//     // import.meta may not exist in all runtimes; suppress TS error and fallback gracefully
//     // @ts-ignore
//     console.log("ENV →", import.meta ?? "no import.meta");
//   } catch (_e) {
//     console.log("ENV →", "no import.meta");
//   }

//   const generateContentForKeyword = async (keyword: string, apiKey: string): Promise<string> => {
//     if (!apiKey) {
//       throw new Error("Gemini API key not set. Pass the key to useContentGeneration(apiKey) or set VITE_GEMINI_API_KEY in your build environment.");
//     }

//     const client = new GoogleGenerativeAI(apiKey);
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
//         // try next model
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
//     console.log("generateContent started for file:", file.name, "fileId:", fileId, "apiKeyPresent?", !!API_KEY);

//     // Pre-create project as pending
//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       createdAt: new Date().toISOString(),
//     });

//     try {
//       const buffer = await file.arrayBuffer();
//       console.log("Read file bytes:", buffer.byteLength);

//       const { keywords, perSheet } = extractKeywordsFromWorkbookBuffer(buffer);
//       console.log("Extracted keywords:", keywords.length, perSheet);

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
//       const newContentItems: ContentItem[] = [];
//       let batchSize = 6;
//       let consecutiveTunnelFailures = 0;

//       for (let i = 0; i < keywords.length; i += batchSize) {
//         const batch = keywords.slice(i, i + batchSize);
//         console.log(`Processing batch ${Math.floor(i / batchSize) + 1} (${i}..${i + batch.length - 1})`);

//         const batchPromises = batch.map(async (keyword, batchIndex) => {
//           try {
//             const generatedContent = await generateContentForKeyword(keyword, API_KEY);
//             const contentItem: ContentItem = {
//               id: `${fileId}-${i + batchIndex}-${Date.now()}`,
//               keyword,
//               generatedContent,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//             };
//             console.log("Generated for:", keyword);
//             return contentItem;
//           } catch (err) {
//             console.error("Keyword generation error for:", keyword, err);
//             toast.error(`Failed generating for: ${keyword}`);
//             const msg = (err as Error)?.message?.toLowerCase() ?? "";
//             if (msg.includes("tunnel") || msg.includes("proxy") || msg.includes("failed to fetch")) {
//               consecutiveTunnelFailures += 1;
//             }
//             return null;
//           }
//         });

//         const results = await Promise.all(batchPromises);
//         const successItems = results.filter(Boolean) as ContentItem[];
//         if (successItems.length) {
//           setContentItems((prev) => [...(prev ?? []), ...successItems]);
//           newContentItems.push(...successItems);
//         }

//         const processedCount = Math.min(i + batch.length, keywords.length);
//         setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processedCount } : p)));

//         const progress = Math.round((processedCount / keywords.length) * 100);
//         console.log(`Progress update: ${processedCount}/${keywords.length} (${progress}%)`);
//         onProgress?.(progress);

//         if (consecutiveTunnelFailures >= 2) {
//           batchSize = Math.max(1, Math.floor(batchSize / 2));
//           consecutiveTunnelFailures = 0;
//           toast.warning("Network issues detected — reducing concurrency.");
//         }

//         if (i + batchSize < keywords.length) await sleep(250);
//       }

//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length } : p)));
//       toast.success(`Finished. Generated content for ${newContentItems.length} keywords.`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p)));
//       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
//       onProgress?.(100);
//       throw error;
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
//   };
// }




// // src/hooks/use-content-generation.ts
// import { useState } from "react";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";

// /**
//  * useContentGeneration (performance-updated)
//  * - Client reuse
//  * - Adaptive concurrency (queue)
//  * - Buffered writes + throttled UI updates
//  * - Improved Excel parsing (multi-sheet, heuristics)
//  */

// /* ---------- Types ---------- */
// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string; // ISO
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

// // Prefer lite first for speed; reorder if you want highest-quality first.
// const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"] as const;
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// const buildPrompt = (keyword: string) =>
  
  
//   `You are a seasoned British editor who actually does this work. Write like a person: specific, a bit idiosyncratic, sometimes blunt, never salesy. Prioritise clarity, lived detail, and practical judgement over polish. Do not mention prompts, AI, rules, or your process.

// Inputs

// TOPIC: ${keyword}

// DOMAIN FOCUS (stay strictly on this): {{domain_focus}}

// MAIN IDEA WORDS (use sparingly; prefer synonyms): ${keyword}

// AUDIENCE: People who already care and want practical, hands-on guidance.

// STYLE (tone guide only): human  

// What to produce

// A complete article that feels brutally human: empathetic, frank, grounded in real practice. Use British English.

// Start with a quick, vivid micro-scene tied to {{domain_focus}} (≤40 words). No greetings.

// Then state why this matters now and your core stance in plain words.

// Create 5–7 short, clear section headings. Make section lengths uneven (roughly 80–140 words each; some shorter, one longer).

// Mix sentence lengths. Use plenty of short lines for punch. Allow one natural-sounding imperfection (an aside or informal run-on) if it helps voice.

// Work in concrete, checkable specifics that practitioners recognise: measurements, tolerances, timings, file sizes, tool names, materials, costs, noise levels, etc. Include at least four tiny numbers/units (e.g., “±0.3 mm”, “190–220 gsm”, “20-minute cure”, “~500 KB”).

// Include one small anecdote (1–3 sentences) and one counter-intuitive tip that actually helps.

// Add exactly one internal-link anchor placeholder somewhere natural: [anchor text] (no URL).

// If {{brand_name}} is provided, mention it once in the final section only, first-person plural (“we provide …”), and nowhere else.

// Keep {{keywords}} usage sparse and natural; bold a target keyword only when it truly fits the sentence, not every section.

// Use a numbered list only for sequential steps or numeric checks; otherwise write in paragraphs.

// Bans & guardrails

// Stay strictly on topic: {{domain_focus}}. Do not drift into unrelated products, medical devices, or generic tech.

// Avoid these phrases anywhere: “In conclusion,” “To summarise,” “Moreover,” “Furthermore,” “At the end of the day,” “look no further,” “tailor,” “dive,” “delve,” “step into,” “seamless experience.”

// No meta-commentary about writing, AI, or detectors. No filler clichés.

// Don’t over-explain basics the audience already knows; show advanced judgement instead.

// Quality bar (do silently before returning)

// British spelling; tone is candid, practical, and lived-in.

// Sections are uneven; cadence varies; plenty of short sentences.

// one short title 

// tone like an 15 - 20 year old kid 

// the conte mus be not look like ai  

// please add human touch in content the human touch is aur priorty please generate human like words uses in daily  life simple words .

// ≥4 concrete micro-details with real numbers/units.

// [anchor text] ${keyword} appears once. Brand appears once (if provided) only in the final section.

// No topic drift; no banned phrases; no meta.
// `;

// /* ---------- Excel parsing helpers (improved) ---------- */

// function isLikelyUrlOrDomain(s: string) {
//   const trimmed = s.trim();
//   if (/^https?:\/\//i.test(trimmed)) return true;
//   if (/^www\./i.test(trimmed)) return true;
//   if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(trimmed) && !/\s/.test(trimmed)) return true;
//   return false;
// }

// function sanitizeKeyword(raw: unknown): string {
//   if (raw == null) return "";
//   let v = String(raw).replace(/\u00A0/g, " ").trim(); // normalize NBSP
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

// /* ---------- Client reuse (module-level) ---------- */
// const clientCache: Record<string, any> = {};
// function getClient(apiKey: string) {
//   if (!apiKey) throw new Error("API key required for getClient");
//   if (clientCache[apiKey]) return clientCache[apiKey];
//   clientCache[apiKey] = new GoogleGenerativeAI(apiKey);
//   return clientCache[apiKey];
// }

// /* ---------- Hook implementation (updated) ---------- */

// console.log("ENV →", typeof import.meta !== "undefined" ? (import.meta as any).env : "no import.meta");

// export function useContentGeneration(passedApiKey?: string) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   function resolveApiKey(): string {
//     if (passedApiKey && passedApiKey.trim()) return passedApiKey.trim();
//     try {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const meta = (typeof import.meta !== "undefined" ? (import.meta as any) : undefined);
//       if (meta?.env?.VITE_GEMINI_API_KEY) return String(meta.env.VITE_GEMINI_API_KEY).trim();
//     } catch (_e) { /* ignore */ }
//     return "";
//   }

//   // generation using model fallback (same logic as before but using client reuse)
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
//         continue; // try next model
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

//   /**
//    * Adaptive queue processor:
//    * - runs up to `concurrency` parallel tasks
//    * - on transient failure adjusts concurrency down
//    * - uses buffer to collect generated items and flush to localStorage state periodically
//    */
//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     const API_KEY = resolveApiKey();
//     console.log("generateContent started for file:", file.name, "fileId:", fileId, "apiKeyPresent?", !!API_KEY);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       createdAt: new Date().toISOString(),
//     });

//     // Buffering & throttling helpers
//     const contentBuffer: ContentItem[] = [];
//     let flushTimer: number | null = null;
//     const FLUSH_COUNT = 10;
//     const FLUSH_MS = 400;

//     const scheduleFlush = () => {
//       if (flushTimer != null) return;
//       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//       // @ts-ignore - window.setTimeout returns number in browser
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

//     // progress throttle
//     let lastProgress = -1;
//     let lastProgressTs = 0;
//     const PROGRESS_MIN_DIFF = 1; // percent
//     const PROGRESS_MIN_MS = 300;
//     const throttleProgress = (processed: number, total: number) => {
//       const now = Date.now();
//       const pct = Math.round((processed / Math.max(1, total)) * 100);
//       if (pct === lastProgress && now - lastProgressTs < PROGRESS_MIN_MS) return;
//       if (Math.abs(pct - lastProgress) < PROGRESS_MIN_DIFF && now - lastProgressTs < PROGRESS_MIN_MS) return;
//       lastProgress = pct;
//       lastProgressTs = now;
//       // update project processedKeywords in state (throttled)
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
//       try { onProgress?.(pct); } catch (_) { /* ignore */ }
//     };

//     try {
//       const buffer = await file.arrayBuffer();
//       console.log("Read file bytes:", buffer.byteLength);

//       const { keywords, perSheet } = extractKeywordsFromWorkbookBuffer(buffer);
//       console.log("Extracted keywords:", keywords.length, perSheet);

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

//       // Adaptive concurrency variables (tune these)
//       let concurrency = Math.min(6, Math.max(2, Math.floor(navigator.hardwareConcurrency ? navigator.hardwareConcurrency / 2 : 4)));
//       const MIN_CONCURRENCY = 1;
//       const MAX_CONCURRENCY = 8;
//       let consecutiveNetworkErrors = 0;
//       let processedCount = 0;
//       let index = 0;

//       // helper to generate single keyword with retries/backoff
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
//               // reduce concurrency when we detect network issues
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

//       // Worker loop: maintain running set up to `concurrency`
//       const running = new Set<Promise<void>>();
//       const startNext = () => {
//         if (index >= keywords.length) return;
//         const kw = keywords[index++];
//         const task = (async () => {
//           try {
//             const generated = await generateWithRetries(kw);
//             if (generated) {
//               const contentItem: ContentItem = {
//                 id: `${fileId}-${index}-${Date.now()}`,
//                 keyword: kw,
//                 generatedContent: generated,
//                 fileId,
//                 fileName: file.name,
//                 createdAt: new Date().toISOString(),
//               };
//               contentBuffer.push(contentItem);
//               if (contentBuffer.length >= FLUSH_COUNT) flushNow();
//               else scheduleFlush();
//             } else {
//               // failure for this keyword - record nothing but toast already shown in generateWithRetries
//             }
//           } catch (e) {
//             console.error("Unexpected generate error:", e);
//           } finally {
//             processedCount++;
//             throttleProgress(processedCount, keywords.length);
//             // dynamic adjustment: if many successes in a row, try to increase concurrency slowly
//             if (consecutiveNetworkErrors === 0 && concurrency < MAX_CONCURRENCY) {
//               // try to bump up concurrency occasionally
//               concurrency = Math.min(MAX_CONCURRENCY, concurrency + 0.2); // fractional bump, cast to int when starting loops
//             } else if (consecutiveNetworkErrors >= 3) {
//               concurrency = Math.max(MIN_CONCURRENCY, Math.floor(concurrency / 2));
//               consecutiveNetworkErrors = 0;
//             }
//           }
//         })().finally(() => running.delete(task));
//         running.add(task);
//       };

//       // launch initial
//       while (index < keywords.length || running.size > 0) {
//         // spawn while we have room
//         // cast concurrency to int
//         const curConcurrency = Math.max(MIN_CONCURRENCY, Math.min(MAX_CONCURRENCY, Math.floor(concurrency)));
//         while (running.size < curConcurrency && index < keywords.length) {
//           startNext();
//         }
//         if (running.size === 0 && index >= keywords.length) break;
//         // wait for any to complete
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         await Promise.race(Array.from(running));
//       }

//       // final flush
//       flushNow();

//       // mark project completed
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length } : p)));
//       toast.success(`Finished. Generated content (approx) for ${contentItems.length + contentBuffer.length} keywords.`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p)));
//       toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
//       onProgress?.(100);
//       throw error;
//     } finally {
//       // ensure buffer flush + state updates
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




// // src/hooks/use-content-generation.ts
// import { useState } from "react";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";


// console.log("🧩 ENV TEST →", {
//   keyType: typeof import.meta.env.VITE_GEMINI_API_KEY,
//   value: import.meta.env.VITE_GEMINI_API_KEY,
// });


// /**
//  * useContentGeneration
//  * - Full updated copy with robust model extraction, fallback prompt, improved logging,
//  *   excel extraction that finds optional URL in same row,
//  *   and openContentEditor() helper to open the JustPasteIt-like editor in a new tab.
//  */

// /* ---------- Types ---------- */
// export interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string; // can be plain text or HTML
//   fileId: string;
//   fileName: string;
//   createdAt: string; // ISO
//   title?: string;
//   targetUrl?: string | null; // optional hyperlink to apply to first keyword occurrence
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
// const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

// if (!apiKey || apiKey.length < 30) {
//   console.error("❌ Gemini API key missing or invalid! ENV:", import.meta.env);
//   throw new Error("Gemini API key not set");
// }


// type GenerateProgressCallback = (progressPercentage: number) => void;

// /* ---------- Constants & Prompt ---------- */
// const SESSION_KEY = "open-content-item_v1";
// const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"] as const;
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// // const buildPrompt = (keyword: string) =>
// //   `You are a seasoned British editor who actually does this work. Write like a person: specific, a bit idiosyncratic, sometimes blunt, never salesy. Prioritise clarity, lived detail, and practical judgement over polish. Do not mention prompts, AI, rules, or your process.

// // Inputs

// // TOPIC: ${keyword}

// // DOMAIN FOCUS (stay strictly on this): {{domain_focus}}
// // Main keyword is ${keyword}.

// // Title must be 60 to 70 characters long.

// // MAIN IDEA WORDS (use sparingly; prefer synonyms): ${keyword}

// // AUDIENCE: People who already care and want practical, hands-on guidance.

// // STYLE (tone guide only): human  

// // What to produce

// // A complete article that feels brutally human: empathetic, frank, grounded in real practice. Use British English.

// // Start with a quick, vivid micro-scene tied to (≤40 words). No greetings.

// // Then state why this matters now and your core stance in plain words.

// // Create 5–7 short, clear section headings. Make section lengths uneven (roughly 80–140 words each; some shorter, one longer).

// // Mix sentence lengths. Use plenty of short lines for punch. Allow one natural-sounding imperfection (an aside or informal run-on) if it helps voice.

// // Work in concrete, checkable specifics that practitioners recognise: measurements, tolerances, timings, file sizes, tool names, materials, costs, noise levels, etc. Include at least four tiny numbers/units (e.g., “±0.3 mm”, “190–220 gsm”, “20-minute cure”, “~500 KB”).

// // Include one small anecdote (1–3 sentences) and one counter-intuitive tip that actually helps.

// // Add exactly one internal-link anchor placeholder somewhere natural: [anchor text] (no URL).

// // If {{brand_name}} is provided, mention it once in the final section only, first-person plural (“we provide …”), and nowhere else.

// // Keep ${keyword} usage sparse and natural; bold a target keyword only when it truly fits the sentence, not every section.

// // Use a numbered list only for sequential steps or numeric checks; otherwise write in paragraphs.

// // Bans & guardrails

// // Stay strictly on topic: {{domain_focus}}. Do not drift into unrelated products, medical devices, or generic tech.

// // Avoid these phrases anywhere: “In conclusion,” “To summarise,” “Moreover,” “Furthermore,” “At the end of the day,” “look no further,” “tailor,” “dive,” “delve,” “step into,” “seamless experience.”

// // No meta-commentary about writing, AI, or detectors. No filler clichés.

// // Don’t over-explain basics the audience already knows; show advanced judgement instead.

// // Quality bar (do silently before returning)

// // British spelling; tone is candid, practical, and lived-in.

// // Sections are uneven; cadence varies; plenty of short sentences.

// // one short title 

// // tone like an 15 - 20 year old kid 

// // the content must be not look like ai  

// // please add human touch in content the human touch is aur priorty please generate human like words uses in daily  life simple words .

// // ≥4 concrete micro-details with real numbers/units.

// // [anchor text] ${keyword} appears once. Brand appears once (if provided) only in the final section.

// // IMPORTANT (for editor linking): Include **exactly one** machine-visible anchor marker in the HTML/text where you want the keyword hyperlinked. Use this exact token: [ANCHOR:${keyword}] (including square brackets) placed immediately before the target phrase or replacing the phrase. Example: "We recommend [ANCHOR:FDA registered hearing aids] for...". Make sure the literal text '[ANCHOR:${keyword}]' appears once in the response.


// // No topic drift; no banned phrases; no meta.`;


// const buildPrompt = (keyword: string) => `
// You are a seasoned British editor. Write like a person: specific, a bit idiosyncratic, never salesy. British spelling.

// TASK
// Return STRICT JSON only (no prose) with this exact shape:
// {
//   "title": "<60-70 characters headline>",
//   "html": "<well-structured HTML article>"
// }

// CONSTRAINTS
// - "title": 60–70 characters. No quotes in the title text itself.
// - "html": Start with a short vivid micro-scene (≤40 words).
// - Then a one-paragraph why-it-matters.
// - Then 5–7 uneven sections using <h2> and <h3>.
// - Include ≥4 concrete micro-details with real numbers/units.
// - Include one small anecdote (1–3 sentences).
// - Include one counter-intuitive, useful tip.
// - End with a <h2>Conclusion</h2> section (do NOT use the phrase "In conclusion,").
// - Use British English and natural, human tone (15–20yo vibe but clear).
// - Keep ${keyword} usage sparse and natural.
// - IMPORTANT: Include **exactly one** marker for link placement: [ANCHOR:${keyword}] in the right spot in the HTML body. Do not print the keyword elsewhere. That marker stands for the single occurrence of the keyword which we’ll hyperlink.
// - No meta talk about prompts/AI. No banned clichés (“look no further”, “step into”, etc.).
// - Output JSON ONLY. No markdown code fences.

// INPUT
// keyword: ${keyword}
// domain_focus: {{domain_focus}}
// brand_name: {{brand_name}}
// `;




// /* ---------- Excel parsing helpers (with URL detection) ---------- */
// function isLikelyUrlOrDomain(s: string | undefined | null) {
//   if (!s) return false;
//   const trimmed = String(s).trim();
//   if (!trimmed) return false;
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

// type KeywordRow = { keyword: string; url?: string | null };

// function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];
//   const col = pickKeywordColumn(rows);
//   if (col == null) return [];
//   const dataRows = rows.slice(1);
//   const found: KeywordRow[] = [];
//   const seen = new Set<string>();
//   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);

//   for (const r of dataRows) {
//     if (!Array.isArray(r)) continue;
//     const raw = r[col];
//     const k = sanitizeKeyword(raw);
//     if (!k) continue;
//     if (seen.has(k)) continue;

//     // search nearby cells for URL (offset -3..+3)
//     let url: string | undefined;
//     for (let offset = -3; offset <= 3; offset++) {
//       if (offset === 0) continue;
//       const idx = col + offset;
//       if (idx < 0 || idx >= maxCols) continue;
//       const other = r[idx];
//       if (!other) continue;
//       const s = String(other).trim();
//       if (isLikelyUrlOrDomain(s)) {
//         url = s;
//         if (!/^https?:\/\//i.test(url)) url = "https://" + url;
//         break;
//       }
//     }

//     // fallback scan whole row for any URL
//     if (!url) {
//       for (let c = 0; c < maxCols; c++) {
//         if (c === col) continue;
//         const other = r[c];
//         if (!other) continue;
//         const s = String(other).trim();
//         if (isLikelyUrlOrDomain(s)) {
//           url = s;
//           if (!/^https?:\/\//i.test(url)) url = "https://" + url;
//           break;
//         }
//       }
//     }

//     found.push({ keyword: k, url: url ?? null });
//     seen.add(k);
//   }

//   // fallback: search broadly if nothing found
//   if (found.length === 0) {
//     for (let rIdx = 1; rIdx < rows.length; rIdx++) {
//       const r = rows[rIdx];
//       if (!Array.isArray(r)) continue;
//       for (let c = 0; c < maxCols; c++) {
//         const k = sanitizeKeyword(r[c]);
//         if (k && !seen.has(k)) {
//           found.push({ keyword: k, url: null });
//           seen.add(k);
//         }
//       }
//       if (found.length > 0) break;
//     }
//   }

//   return found;
// }

// function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array): { keywords: KeywordRow[]; perSheet?: Record<string, number> } {
//   const workbook = XLSX.read(buffer, { type: "array" });
//   const sheetNames = workbook.SheetNames ?? [];
//   const combined: KeywordRow[] = [];
//   const seen = new Set<string>();
//   const perSheet: Record<string, number> = {};

//   for (const sheetName of sheetNames) {
//     try {
//       const sheet = workbook.Sheets[sheetName];
//       const sheetKeywords = extractKeywordsFromWorksheetWithUrls(sheet);
//       perSheet[sheetName] = sheetKeywords.length;
//       for (const k of sheetKeywords) {
//         if (!seen.has(k.keyword)) {
//           seen.add(k.keyword);
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
//   const cleanKey = apiKey?.trim();
//   if (!cleanKey || cleanKey.length < 30) throw new Error("API key required for getClient");
//   if (clientCache[cleanKey]) return clientCache[cleanKey];
//   clientCache[cleanKey] = new GoogleGenerativeAI(cleanKey);
//   return clientCache[cleanKey];
// }

// /* ---------- Model output extraction & fallback ---------- */
// function extractGeneratedText(result: any): string | null {
//   try {
//     if (!result) return null;

//     // Common SDK shape used earlier: result.response.text()
//     if (result?.response && typeof result.response.text === "function") {
//       const t = result.response.text();
//       if (t && String(t).trim()) return String(t).trim();
//     }

//     // candidates array
//     if (Array.isArray(result?.candidates) && result.candidates.length > 0) {
//       const cand = result.candidates[0];
//       if (typeof cand === "string" && cand.trim()) return cand.trim();
//       if (cand?.content) {
//         const c = cand.content?.text ?? cand.content;
//         if (c && String(c).trim()) return String(c).trim();
//       }
//     }

//     // older/simpler shape
//     if (result?.output_text && String(result.output_text).trim()) return String(result.output_text).trim();

//     // try some nested properties
//     const maybe = result?.text ?? result?.content ?? null;
//     if (maybe && typeof maybe === "string" && maybe.trim()) return maybe.trim();

//     // give up
//   } catch (e) {
//     console.warn("extractGeneratedText error:", e);
//   }
//   return null;
// }

// /* ---------- openContentEditor (plain function) ---------- */
// export function openContentEditor(item: ContentItem) {
//   try {
//     // store in sessionStorage if available
//     try {
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
//     } catch (e) {
//       console.warn("sessionStorage write failed for openContentEditor", e);
//       try {
//         localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item));
//       } catch (_e) {
//         // ignore
//       }
//     }

//     const win = window.open("/content/editor", "_blank");
//     if (!win) {
//       toast.error("Popup blocked — allow popups to open the editor in a new tab.");
//     }
//   } catch (e) {
//     console.error("openContentEditor error:", e);
//     try { window.location.href = "/content/editor"; } catch (_) {}
//   }
// }

// /* ---------- Hook Implementation ---------- */
// export function useContentGeneration(passedApiKey?: string) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

// console.log("ENV →", import.meta.env);

//   function resolveApiKey(): string {
//     if (passedApiKey && passedApiKey.trim()) return passedApiKey.trim();
//     try {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
//         const prompt = buildPrompt(keyword);

//         // attempt generation
//         const result = await model.generateContent(prompt);

//         // debug truncated log
//         try {
//           const head = JSON.stringify(result).slice(0, 1200);
//           console.debug(`[gen:${modelName}] result head for "${keyword}":`, head);
//         } catch { /* ignore stringify errors */ }

//         const text = extractGeneratedText(result);
//         if (!text) {
//           // attempt fallback extraction or throw to retry
//           console.warn(`[generateContentForKeyword] model=${modelName} returned empty text for "${keyword}"`);
//           throw new Error("Model returned no text");
//         }
//         return text;
//       } catch (e) {
//         lastError = e;
//         const errMsg = (e as Error)?.message ?? String(e);
//         console.error(`[generateContentForKeyword] model ${modelName} failed for "${keyword}":`, errMsg);
//         const lowered = String(errMsg).toLowerCase();
//         if (lowered.includes("tunnel") || lowered.includes("proxy") || lowered.includes("failed to fetch")) {
//           toast.error("Network error communicating with Gemini (proxy/tunnel). Check network and try again.");
//         }
//         if (lowered.includes("429") || lowered.includes("rate")) {
//           // small wait then try next model
//           await sleep(800);
//         }
//         // continue to next model
//       }
//     }
//     // all models failed; throw last error
//     throw lastError ?? new Error("All models failed");
//   };

//   const ensureProject = (proj: ExcelProject) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...proj } : p));
//       return [...prev, proj];
//     });
//   };

//   /**
//    * generateContent(file, fileId, onProgress)
//    * - extracts keywords + urls
//    * - generates content, stores ContentItem with optional targetUrl
//    */
//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     const API_KEY = resolveApiKey();
//     console.info("generateContent start:", file.name, fileId, "apiKeyPresent?", !!API_KEY);

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

//     // progress throttle
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
//       console.debug("Read file bytes:", buffer.byteLength);

//       const { keywords, perSheet } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
//       console.info("Extracted keywords:", keywords.length, perSheet);

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

//       // Adaptive concurrency
//       let concurrency = Math.min(6, Math.max(1, Math.floor(navigator.hardwareConcurrency ? navigator.hardwareConcurrency / 2 : 2)));
//       const MIN_CONCURRENCY = 1;
//       const MAX_CONCURRENCY = 8;
//       let consecutiveNetworkErrors = 0;
//       let processedCount = 0;
//       let index = 0;

//       const generateWithRetries = async (keyword: string): Promise<string | null> => {
//         let attempt = 0;
//         const MAX_ATTEMPTS = 3;
//         let backoff = 600;
//         while (attempt < MAX_ATTEMPTS) {
//           attempt++;
//           try {
//             const text = await generateContentForKeyword(keyword, API_KEY);
//             if (text && text.trim()) return text;
//             // unexpected empty -> throw to retry
//             throw new Error("Empty response text");
//           } catch (err) {
//             console.error(`[generateWithRetries] attempt ${attempt} failed for "${keyword}":`, err);
//             const msg = (err as Error)?.message?.toLowerCase() ?? "";
//             const isNetwork = msg.includes("tunnel") || msg.includes("proxy") || msg.includes("failed to fetch") || msg.includes("network");
//             if (isNetwork) {
//               consecutiveNetworkErrors++;
//               concurrency = Math.max(MIN_CONCURRENCY, Math.floor(concurrency / 2));
//               toast.warning("Network hiccup detected — reducing concurrency to " + concurrency);
//             }
//             if (attempt < MAX_ATTEMPTS) {
//               await sleep(backoff);
//               backoff *= 2;
//               continue;
//             }

//             // final fallback: try a much smaller prompt to coax output
//             try {
//               const fallbackPrompt = `Write a short human-sounding two-paragraph piece about "${keyword}". Keep it simple and natural.`;
//               const client = getClient(API_KEY);
//               const model = (client as any).getGenerativeModel({ model: MODELS[0] as string });
//               const fallbackResult = await model.generateContent(fallbackPrompt);
//               const fallbackText = extractGeneratedText(fallbackResult);
//               if (fallbackText && fallbackText.trim()) {
//                 console.warn(`[generateWithRetries] fallback succeeded for "${keyword}"`);
//                 return fallbackText.trim();
//               }
//             } catch (fallbackErr) {
//               console.error(`[generateWithRetries] fallback also failed for "${keyword}":`, fallbackErr);
//             }

//             return null;
//           }
//         }
//         return null;
//       };

//       // Worker loop
//       const running = new Set<Promise<void>>();
//       const startNext = () => {
//         if (index >= keywords.length) return;
//         const kr = keywords[index++];
//         const kw = kr.keyword;
//         const url = kr.url ?? null;
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
//                 targetUrl: url,
//                 title: kw, // default title = keyword (user can edit in editor)
//               };
//               contentBuffer.push(contentItem);
//               if (contentBuffer.length >= FLUSH_COUNT) flushNow();
//               else scheduleFlush();
//             } else {
//               console.warn("generation returned null for keyword:", kw);
//             }
//           } catch (e) {
//             console.error("Unexpected generate error:", e);
//           } finally {
//             processedCount++;
//             throttleProgress(processedCount, keywords.length);
//             // adapt concurrency
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

//       // start loop
//       while (index < keywords.length || running.size > 0) {
//         const curConcurrency = Math.max(MIN_CONCURRENCY, Math.min(MAX_CONCURRENCY, Math.floor(concurrency)));
//         while (running.size < curConcurrency && index < keywords.length) {
//           startNext();
//         }
//         if (running.size === 0 && index >= keywords.length) break;
//         // await any
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         await Promise.race(Array.from(running));
//       }

//       // finalize
//       flushNow();
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length } : p)));
//       toast.success(`Finished processing ${file.name}. Generated content for ${keywords.length} keywords (approx).`);
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
//     openContentEditor, // export helper too
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
//  * - JSON-based output (title + html)
//  * - Title (60–70 chars) from Gemini (not the keyword)
//  * - Exactly one keyword occurrence, hyperlinked with Excel URL
//  * - Structured article with Conclusion
//  * - Robust Excel parsing (optional URL from same row)
//  * - Editor launcher
//  */

// /* ---------- Types ---------- */
// export interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string; // HTML
//   fileId: string;
//   fileName: string;
//   createdAt: string; // ISO
//   title?: string;
//   targetUrl?: string | null; // hyperlink destination for the (single) keyword
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

// console.log("ENV →", import.meta.env);

// /* ---------- Constants ---------- */
// const SESSION_KEY = "open-content-item_v1";
// const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"] as const;
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// /* ---------- Prompt (returns STRICT JSON) ---------- */
// const buildPrompt = (keyword: string) => `
// You are a seasoned British editor. Natural, specific, not salesy. British spelling.

// TASK
// Return STRICT JSON only (no prose) with exactly this shape:
// {
//   "title": "<60-70 characters headline>",
//   "html": "<well-structured HTML article>"
// }

// CONSTRAINTS
// - "title": 60–70 characters. No quotes inside the title text itself.
// - "html":
//   - Start with a short vivid micro-scene (≤40 words).
//   - Then a one-paragraph “why this matters”.
//   - Then 5–7 uneven sections using <h2> and <h3>.
//   - Include ≥4 concrete micro-details with real numbers/units (e.g., “±0.3 mm”, “190–220 gsm”, “20-minute cure”, “~500 KB”).
//   - Include one small anecdote (1–3 sentences).
//   - Include one counter-intuitive, useful tip.
//   - End with a <h2>Conclusion</h2> section (do NOT start it with “In conclusion,”).
// - Use British English and a clear, human tone (15–20yo vibe but practical).
// - Keep ${keyword} usage sparse and natural.
// - IMPORTANT: Include **exactly one** marker for link placement: [ANCHOR:${keyword}] at the spot where the single visible keyword should appear. Do not use the keyword anywhere else in the text. The marker stands for the only occurrence we will hyperlink.
// - No meta talk about prompts/AI or banned clichés (“look no further”, “step into”, etc.).
// - Output JSON ONLY. No markdown fences.

// INPUT
// keyword: ${keyword}
// domain_focus: {{domain_focus}}
// brand_name: {{brand_name}}
// `;

// /* ---------- Excel parsing helpers (with URL detection) ---------- */
// function isLikelyUrlOrDomain(s: string | undefined | null) {
//   if (!s) return false;
//   const trimmed = String(s).trim();
//   if (!trimmed) return false;
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
//     if (nonEmpty) { headerRowIndex = i; break; }
//   }
//   const headerRow = headerRowIndex >= 0 && Array.isArray(rows[headerRowIndex]) ? (rows[headerRowIndex] as unknown[]) : [];
//   const headerNames = headerRow.map((c) => String(c ?? "").trim().toLowerCase());
//   const preferred = ["keyword", "keywords", "topic", "title", "query", "search term", "focus keyword", "term", "phrase"];
//   for (let i = 0; i < headerNames.length; i++) if (preferred.includes(headerNames[i])) return i;

//   const lookahead = rows.slice(Math.max(0, headerRowIndex + 1), Math.min(rows.length, (headerRowIndex + 1) + 200));
//   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//   let bestCol = -1, bestScore = 0;
//   for (let col = 0; col < maxCols; col++) {
//     let score = 0, total = 0;
//     for (const r of lookahead) {
//       const cell = Array.isArray(r) ? r[col] : undefined;
//       const s = sanitizeKeyword(cell);
//       if (s) score++;
//       if (cell !== undefined && cell !== null && String(cell).trim() !== "") total++;
//     }
//     if (total === 0) continue;
//     const weighted = score * 100 + Math.min(total, 100);
//     if (weighted > bestScore) { bestScore = weighted; bestCol = col; }
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

// type KeywordRow = { keyword: string; url?: string | null };

// function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows || rows.length === 0) return [];
//   const col = pickKeywordColumn(rows);
//   if (col == null) return [];
//   const dataRows = rows.slice(1);
//   const found: KeywordRow[] = [];
//   const seen = new Set<string>();
//   const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);

//   for (const r of dataRows) {
//     if (!Array.isArray(r)) continue;
//     const raw = r[col];
//     const k = sanitizeKeyword(raw);
//     if (!k || seen.has(k)) continue;

//     let url: string | undefined;
//     for (let offset = -3; offset <= 3; offset++) {
//       if (offset === 0) continue;
//       const idx = col + offset;
//       if (idx < 0 || idx >= maxCols) continue;
//       const other = r[idx];
//       if (!other) continue;
//       const s = String(other).trim();
//       if (isLikelyUrlOrDomain(s)) {
//         url = s;
//         if (!/^https?:\/\//i.test(url)) url = "https://" + url;
//         break;
//       }
//     }
//     if (!url) {
//       for (let c = 0; c < maxCols; c++) {
//         if (c === col) continue;
//         const other = r[c];
//         if (!other) continue;
//         const s = String(other).trim();
//         if (isLikelyUrlOrDomain(s)) {
//           url = s;
//           if (!/^https?:\/\//i.test(url)) url = "https://" + url;
//           break;
//         }
//       }
//     }
//     found.push({ keyword: k, url: url ?? null });
//     seen.add(k);
//   }

//   if (found.length === 0) {
//     for (let rIdx = 1; rIdx < rows.length; rIdx++) {
//       const r = rows[rIdx];
//       if (!Array.isArray(r)) continue;
//       for (let c = 0; c < maxCols; c++) {
//         const k = sanitizeKeyword(r[c]);
//         if (k && !seen.has(k)) { found.push({ keyword: k, url: null }); seen.add(k); }
//       }
//       if (found.length > 0) break;
//     }
//   }
//   return found;
// }
// function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array) {
//   const workbook = XLSX.read(buffer, { type: "array" });
//   const sheetNames = workbook.SheetNames ?? [];
//   const combined: KeywordRow[] = [];
//   const seen = new Set<string>();
//   const perSheet: Record<string, number> = {};

//   for (const sheetName of sheetNames) {
//     try {
//       const sheet = workbook.Sheets[sheetName];
//       const sheetKeywords = extractKeywordsFromWorksheetWithUrls(sheet);
//       perSheet[sheetName] = sheetKeywords.length;
//       for (const k of sheetKeywords) {
//         if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
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
//   const cleanKey = apiKey?.trim();
//   if (!cleanKey || cleanKey.length < 20) throw new Error("API key required for getClient");
//   if (clientCache[cleanKey]) return clientCache[cleanKey];
//   clientCache[cleanKey] = new GoogleGenerativeAI(cleanKey);
//   return clientCache[cleanKey];
// }

// /* ---------- Model output extraction & JSON parsing ---------- */
// function extractGeneratedText(result: any): string | null {
//   try {
//     if (!result) return null;
//     if (result?.response && typeof result.response.text === "function") {
//       const t = result.response.text(); if (t && String(t).trim()) return String(t).trim();
//     }
//     if (Array.isArray(result?.candidates) && result.candidates.length > 0) {
//       const cand = result.candidates[0];
//       if (typeof cand === "string" && cand.trim()) return cand.trim();
//       if (cand?.content) {
//         const c = cand.content?.text ?? cand.content;
//         if (c && String(c).trim()) return String(c).trim();
//       }
//     }
//     if (result?.output_text && String(result.output_text).trim()) return String(result.output_text).trim();
//     const maybe = result?.text ?? result?.content ?? null;
//     if (maybe && typeof maybe === "string" && maybe.trim()) return maybe.trim();
//   } catch (e) {
//     console.warn("extractGeneratedText error:", e);
//   }
//   return null;
// }
// function parseModelJson(text: string): { title?: string; html?: string } | null {
//   try {
//     const cleaned = text.trim().replace(/^```json\s*|\s*```$/g, "");
//     const obj = JSON.parse(cleaned);
//     if (obj && typeof obj === "object") return obj as any;
//   } catch {}
//   return null;
// }
// function clampTitleLen(t: string): string {
//   const s = (t || "").trim().replace(/\s+/g, " ");
//   if (s.length < 60) return (s + " ").repeat(1).slice(0, Math.max(60, s.length)).trim();
//   if (s.length > 70) return s.slice(0, 70).replace(/\s+\S*$/, "").trim();
//   return s;
// }
// function escapeHtml(s: string) {
//   return String(s)
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;");
// }
// function buildAnchoredKeywordHTML(keyword: string, url?: string | null): string {
//   const safeKw = escapeHtml(keyword);
//   if (url) {
//     const safeUrl = escapeHtml(url);
//     return `<a href="${safeUrl}" target="_blank" rel="nofollow noopener"><strong>${safeKw}</strong></a>`;
//   }
//   return `<strong>${safeKw}</strong>`;
// }
// function enforceSingleAnchoredKeyword(html: string, keyword: string, url?: string | null): string {
//   const token = `[ANCHOR:${keyword}]`;
//   let out = html || "";
//   const anchorHTML = buildAnchoredKeywordHTML(keyword, url);

//   if (out.includes(token)) {
//     out = out.replace(token, anchorHTML);
//   } else {
//     if (out.includes("</p>")) out = out.replace("</p>", ` ${anchorHTML}</p>`);
//     else if (out.includes("<h2")) out = out.replace("<h2", `${anchorHTML}<h2`);
//     else out = `${anchorHTML} ${out}`;
//   }
//   return out;
// }

// /* ---------- openContentEditor ---------- */
// export function openContentEditor(item: ContentItem) {
//   try {
//     try {
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
//     } catch (e) {
//       console.warn("sessionStorage write failed for openContentEditor", e);
//       try { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); } catch {}
//     }
//     const win = window.open("/content/editor", "_blank");
//     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
//   } catch (e) {
//     console.error("openContentEditor error:", e);
//     try { window.location.href = "/content/editor"; } catch {}
//   }
// }

// /* ---------- Hook Implementation ---------- */
// export function useContentGeneration(passedApiKey?: string) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   function resolveApiKey(): string {
//     if (passedApiKey && passedApiKey.trim()) return passedApiKey.trim();
//     try {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const meta = (typeof import.meta !== "undefined" ? (import.meta as any) : undefined);
//       if (meta?.env?.VITE_GEMINI_API_KEY) return String(meta.env.VITE_GEMINI_API_KEY).trim();
//     } catch {}
//     return "";
//   }

//   const generateContentForKeyword = async (keyword: string, apiKey: string): Promise<{ title: string; html: string }> => {
//     if (!apiKey) throw new Error("Gemini API key not set.");
//     const client = getClient(apiKey);
//     let lastError: unknown;

//     for (const modelName of MODELS) {
//       try {
//         const model = (client as any).getGenerativeModel({ model: modelName as string });
//         const prompt = buildPrompt(keyword);
//         const result = await model.generateContent(prompt);
//         const text = extractGeneratedText(result);
//         if (!text) throw new Error("Model returned no text");

//         const obj = parseModelJson(text);
//         if (obj?.html) {
//           const rawTitle = obj.title ? String(obj.title) : keyword;
//           const finalTitle = clampTitleLen(rawTitle);
//           return { title: finalTitle, html: String(obj.html) };
//         }

//         // soft fallback if the model returned plain text
//         const lines = text.split(/\r?\n/);
//         const first = lines[0]?.replace(/^["']|["']$/g, "") || keyword;
//         const body = lines.slice(1).join("\n") || `<p>${escapeHtml(keyword)}</p>`;
//         return { title: clampTitleLen(first), html: body };
//       } catch (e) {
//         lastError = e;
//         const errMsg = (e as Error)?.message ?? String(e);
//         const lowered = errMsg.toLowerCase();
//         if (lowered.includes("tunnel") || lowered.includes("proxy") || lowered.includes("failed to fetch")) {
//           toast.error("Network error communicating with Gemini. Check network and try again.");
//         }
//         if (lowered.includes("429") || lowered.includes("rate")) await sleep(800);
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

//   /**
//    * generateContent(file, fileId, onProgress)
//    * - extracts keywords + urls
//    * - generates content (JSON → title + html), stores with single linked keyword
//    */
//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     const API_KEY = resolveApiKey();
//     console.info("generateContent start:", file.name, fileId, "apiKeyPresent?", !!API_KEY);

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
//       if (flushTimer != null) { clearTimeout(flushTimer as any); flushTimer = null; }
//       if (contentBuffer.length === 0) return;
//       const toWrite = contentBuffer.splice(0, contentBuffer.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };

//     // progress throttle
//     let lastProgress = -1;
//     let lastProgressTs = 0;
//     const PROGRESS_MIN_DIFF = 1;
//     const PROGRESS_MIN_MS = 300;
//     const throttleProgress = (processed: number, total: number) => {
//       const now = Date.now();
//       const pct = Math.round((processed / Math.max(1, total)) * 100);
//       if (pct === lastProgress && now - lastProgressTs < PROGRESS_MIN_MS) return;
//       if (Math.abs(pct - lastProgress) < PROGRESS_MIN_DIFF && now - lastProgressTs < PROGRESS_MIN_MS) return;
//       lastProgress = pct; lastProgressTs = now;
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
//       try { onProgress?.(pct); } catch {}
//     };

//     try {
//       const buffer = await file.arrayBuffer();
//       console.debug("Read file bytes:", buffer.byteLength);

//       const { keywords, perSheet } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
//       console.info("Extracted keywords:", keywords.length, perSheet);

//       if (!keywords || keywords.length === 0) {
//         ensureProject({
//           id: fileId,
//           fileName: file.name,
//           status: "error",
//           totalKeywords: 0,
//           processedKeywords: 0,
//           createdAt: new Date().toISOString(),
//           error: "No valid keywords found in uploaded Excel file",
//         });
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

//       // Adaptive concurrency
//       let concurrency = Math.min(6, Math.max(1, Math.floor(navigator.hardwareConcurrency ? navigator.hardwareConcurrency / 2 : 2)));
//       const MIN_CONCURRENCY = 1;
//       const MAX_CONCURRENCY = 8;
//       let consecutiveNetworkErrors = 0;
//       let processedCount = 0;
//       let index = 0;

//       // Now returns {title, html}
//       const generateWithRetries = async (keyword: string): Promise<{ title: string; html: string } | null> => {
//         let attempt = 0;
//         const MAX_ATTEMPTS = 3;
//         let backoff = 600;
//         while (attempt < MAX_ATTEMPTS) {
//           attempt++;
//           try {
//             const obj = await generateContentForKeyword(keyword, API_KEY);
//             if (obj?.html && obj?.title) return obj;
//             throw new Error("Empty response");
//           } catch (err) {
//             console.error(`[generateWithRetries] attempt ${attempt} failed for "${keyword}":`, err);
//             const msg = (err as Error)?.message?.toLowerCase() ?? "";
//             const isNetwork = msg.includes("tunnel") || msg.includes("proxy") || msg.includes("failed to fetch") || msg.includes("network");
//             if (isNetwork) {
//               consecutiveNetworkErrors++;
//               concurrency = Math.max(MIN_CONCURRENCY, Math.floor(concurrency / 2));
//               toast.warning("Network hiccup detected — reducing concurrency to " + concurrency);
//             }
//             if (attempt < MAX_ATTEMPTS) { await sleep(backoff); backoff *= 2; continue; }

//             // final fallback: tiny HTML with anchor marker + heuristic title
//             try {
//               const fallbackTitle = clampTitleLen(`${keyword} — practical notes that actually help`);
//               const fallbackHtml =`You are a seasoned British editor who actually does this work. Write like a person: specific, a bit idiosyncratic, sometimes blunt, never salesy. Prioritise clarity, lived detail, and practical judgement over polish. Do not mention prompts, AI, rules, or your process.

// // // Inputs

// // // TOPIC: ${keyword}

// // // DOMAIN FOCUS (stay strictly on this): {{domain_focus}}
// // // Main keyword is ${keyword}.

// // // Title must be 60 to 70 characters long.

// // // MAIN IDEA WORDS (use sparingly; prefer synonyms): ${keyword}

// // // AUDIENCE: People who already care and want practical, hands-on guidance.

// // // STYLE (tone guide only): human  

// // // What to produce

// // // A complete article that feels brutally human: empathetic, frank, grounded in real practice. Use British English.

// // // Start with a quick, vivid micro-scene tied to (≤40 words). No greetings.

// // // Then state why this matters now and your core stance in plain words.

// // // Create 5–7 short, clear section headings. Make section lengths uneven (roughly 80–140 words each; some shorter, one longer).

// // // Mix sentence lengths. Use plenty of short lines for punch. Allow one natural-sounding imperfection (an aside or informal run-on) if it helps voice.

// // // Work in concrete, checkable specifics that practitioners recognise: measurements, tolerances, timings, file sizes, tool names, materials, costs, noise levels, etc. Include at least four tiny numbers/units (e.g., “±0.3 mm”, “190–220 gsm”, “20-minute cure”, “~500 KB”).

// // // Include one small anecdote (1–3 sentences) and one counter-intuitive tip that actually helps.

// // // Add exactly one internal-link anchor placeholder somewhere natural: [anchor text] (no URL).

// // // If {{brand_name}} is provided, mention it once in the final section only, first-person plural (“we provide …”), and nowhere else.

// // // Keep ${keyword} usage sparse and natural; bold a target keyword only when it truly fits the sentence, not every section.

// // // Use a numbered list only for sequential steps or numeric checks; otherwise write in paragraphs.

// // // Bans & guardrails

// // // Stay strictly on topic: {{domain_focus}}. Do not drift into unrelated products, medical devices, or generic tech.

// // // Avoid these phrases anywhere: “In conclusion,” “To summarise,” “Moreover,” “Furthermore,” “At the end of the day,” “look no further,” “tailor,” “dive,” “delve,” “step into,” “seamless experience.”

// // // No meta-commentary about writing, AI, or detectors. No filler clichés.

// // // Don’t over-explain basics the audience already knows; show advanced judgement instead.

// // // Quality bar (do silently before returning)

// // // British spelling; tone is candid, practical, and lived-in.

// // // Sections are uneven; cadence varies; plenty of short sentences.

// // // one short title 

// // // tone like an 15 - 20 year old kid 

// // // the content must be not look like ai  

// // // please add human touch in content the human touch is aur priorty please generate human like words uses in daily  life simple words .

// // // ≥4 concrete micro-details with real numbers/units.

// // // [anchor text] ${keyword} appears once. Brand appears once (if provided) only in the final section.

// // // IMPORTANT (for editor linking): Include **exactly one** machine-visible anchor marker in the HTML/text where you want the keyword hyperlinked. Use this exact token: [ANCHOR:${keyword}] (including square brackets) placed immediately before the target phrase or replacing the phrase. Example: "We recommend [ANCHOR:FDA registered hearing aids] for...". Make sure the literal text '[ANCHOR:${keyword}]' appears once in the response.


// // // No topic drift; no banned phrases; no meta.`
//               return { title: fallbackTitle, html: fallbackHtml };
//             } catch {
//               /* ignore */
//             }
//             return null;
//           }
//         }
//         return null;
//       };

//       // Worker loop
//       const running = new Set<Promise<void>>();
//       const startNext = () => {
//         if (index >= keywords.length) return;
//         const kr = keywords[index++];
//         const kw = kr.keyword;
//         const url = kr.url ?? null;
//         const curIndex = index;

//         const task = (async () => {
//           try {
//             const generated = await generateWithRetries(kw);
//             if (generated) {
//               // single, hyperlinked keyword in HTML
//               const linkedHtml = enforceSingleAnchoredKeyword(generated.html, kw, url);

//               const contentItem: ContentItem = {
//                 id: `${fileId}-${curIndex}-${Date.now()}`,
//                 keyword: kw,
//                 generatedContent: linkedHtml,
//                 fileId,
//                 fileName: file.name,
//                 createdAt: new Date().toISOString(),
//                 targetUrl: url,
//                 title: generated.title, // Gemini-made title (60–70)
//               };
//               contentBuffer.push(contentItem);
//               if (contentBuffer.length >= FLUSH_COUNT) flushNow(); else scheduleFlush();
//             } else {
//               console.warn("generation returned null for keyword:", kw);
//             }
//           } catch (e) {
//             console.error("Unexpected generate error:", e);
//           } finally {
//             processedCount++;
//             throttleProgress(processedCount, keywords.length);
//             // adapt concurrency
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
//         while (running.size < curConcurrency && index < keywords.length) startNext();
//         if (running.size === 0 && index >= keywords.length) break;
//         // @ts-ignore
//         await Promise.race(Array.from(running));
//       }

//       flushNow();
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length } : p)));
//       toast.success(`Finished processing ${file.name}. Generated content for ~${keywords.length} keywords.`);
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
//     openContentEditor,
//   };
// }









// // src/hooks/use-content-generation.ts
// import { useState } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml } from "@/lib/llm/api";
// import { useContentPreferences } from "@/hooks/use-preferences";

// /* ────────────────────────────────────────────────────────────────────────────
//    Types
// ──────────────────────────────────────────────────────────────────────────── */
// export interface ContentItem {
//   id: string;
//   keyword: string;                 // primary keyword (first of the group)
//   keywordsUsed?: string[];         // all keywords used for this item (1/2/4)
//   generatedContent: string;        // HTML
//   fileId: string;
//   fileName: string;
//   createdAt: string;               // ISO
//   title?: string;
//   targetUrl?: string | null;       // url for primary
//   urlMap?: Record<string, string | null>; // per keyword -> url|null
//   status?: "success" | "failed";
// }

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;           // total rows read
//   processedKeywords: number;       // rows attempted (not groups)
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (progressPercentage: number) => void;

// /* ────────────────────────────────────────────────────────────────────────────
//    Global verbose switch (for debugging). Enable: window.__contentVerbose = true
// ──────────────────────────────────────────────────────────────────────────── */
// declare global {
//   interface Window {
//     __contentVerbose?: boolean;
//   }
// }
// const V = () =>
//   typeof window !== "undefined" && (window as any).__contentVerbose === true;

// /* ────────────────────────────────────────────────────────────────────────────
//    Excel parsing helpers
// ──────────────────────────────────────────────────────────────────────────── */
// function isLikelyUrlOrDomain(s: string | undefined | null) {
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
//   v = v.replace(/^\(?\s*\d+[\.\):-]?\s*/u, "").trim(); // leading numbers
//   v = v.replace(/^[\u2022\-\*]\s*/, "").trim();        // bullet dots
//   if (/^[\d\.,\s]+$/.test(v)) return "";               // numeric only
//   if (v.length > 180) return "";
//   if (isLikelyUrlOrDomain(v)) return "";
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2) return "";
//   return v;
// }

// type KeywordRow = { keyword: string; url?: string | null };

// function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
//   const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
//   if (!rows?.length) return [];

//   const maxCols = Math.max(...rows.map(r => Array.isArray(r) ? r.length : 0), 0);
//   const dataRows = rows.slice(1);
//   const out: KeywordRow[] = [];
//   const seen = new Set<string>();

//   for (const r of dataRows) {
//     if (!Array.isArray(r)) continue;

//     // choose first sensible text cell as keyword
//     let picked: string | null = null;
//     let url: string | null = null;

//     for (let c = 0; c < maxCols; c++) {
//       const k = sanitizeKeyword(r[c]);
//       if (!k || seen.has(k)) continue;

//       // try near-by cells for URL
//       for (let offset = -3; offset <= 3; offset++) {
//         if (offset === 0) continue;
//         const idx = c + offset;
//         if (idx < 0 || idx >= maxCols) continue;
//         const maybe = r[idx];
//         if (!maybe) continue;
//         const s = String(maybe).trim();
//         if (isLikelyUrlOrDomain(s)) {
//           url = /^https?:\/\//i.test(s) ? s : "https://" + s;
//           break;
//         }
//       }
//       picked = k;
//       break;
//     }

//     if (picked && !seen.has(picked)) {
//       out.push({ keyword: picked, url });
//       seen.add(picked);
//     }
//   }
//   return out;
// }

// function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array) {
//   const workbook = XLSX.read(buffer, { type: "array" });
//   const sheetNames = workbook.SheetNames ?? [];
//   const combined: KeywordRow[] = [];
//   const seen = new Set<string>();
//   const perSheet: Record<string, number> = {};

//   for (const sheetName of sheetNames) {
//     try {
//       const sheet = workbook.Sheets[sheetName];
//       const ks = extractKeywordsFromWorksheetWithUrls(sheet);
//       perSheet[sheetName] = ks.length;
//       for (const k of ks) {
//         if (!seen.has(k.keyword)) {
//           seen.add(k.keyword);
//           combined.push(k);
//         }
//       }
//       if (combined.length > 4000) break;
//     } catch (e) {
//       console.warn("sheet parse fail:", sheetName, e);
//     }
//   }
//   if (V()) console.log("[CONTENT] extracted keywords:", combined.length, perSheet);
//   return { keywords: combined, perSheet };
// }

// /* ────────────────────────────────────────────────────────────────────────────
//    Keyword-grouping helpers
// ──────────────────────────────────────────────────────────────────────────── */
// function resolveGroupSize(input: any): 1 | 2 | 4 {
//   if (typeof input === "number") return input === 4 ? 4 : input === 2 ? 2 : 1;
//   const raw = (input && typeof input === "object") ? input.keywordMode : input;

//   if (typeof raw === "number") return raw === 4 ? 4 : raw === 2 ? 2 : 1;
//   if (typeof raw === "string") {
//     const s = raw.trim().toLowerCase();
//     if (/\b4\b|four|4keyword|4-?keywords/.test(s)) return 4;
//     if (/\b2\b|two|2keyword|2-?keywords/.test(s)) return 2;
//     if (/\b1\b|one|single|1-?keyword/.test(s)) return 1;
//   }
//   return 1;
// }

// /* ────────────────────────────────────────────────────────────────────────────
//    Anchor/link helpers
// ──────────────────────────────────────────────────────────────────────────── */
// function escapeHtml(s: string) {
//   return String(s)
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;");
// }

// function buildAnchorHTML(keyword: string, url?: string | null) {
//   const kw = escapeHtml(keyword);
//   if (url) {
//     const u = escapeHtml(url);
//     return `<a href="${u}" target="_blank" rel="nofollow noopener"><strong>${kw}</strong></a>`;
//   }
//   return `<strong>${kw}</strong>`;
// }

// // Try to inject anchor for a single keyword:
// // 1) Replace [ANCHOR:kw] token if present
// // 2) Else wrap first visible occurrence of the keyword (case-insensitive, word-boundary aware)
// // 3) Else inject at end of first paragraph (or prepend)
// function injectAnchorForKeyword(html: string, keyword: string, url?: string | null): string {
//   let out = html || "";
//   const token = `[ANCHOR:${keyword}]`;

//   if (out.includes(token)) {
//     return out.replace(token, buildAnchorHTML(keyword, url));
//   }

//   // Try first visible occurrence
//   const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const wordBoundary = /^\w[\w\s-]*\w$/.test(keyword);
//   const re = wordBoundary ? new RegExp(`\\b${escaped}\\b`, "i") : new RegExp(escaped, "i");

//   if (re.test(out)) {
//     return out.replace(re, buildAnchorHTML(keyword, url));
//   }

//   // Fallback inject into first paragraph
//   const anchor = buildAnchorHTML(keyword, url);
//   if (out.includes("</p>")) return out.replace("</p>", ` ${anchor}</p>`);
//   return `${anchor} ${out}`;
// }

// // Apply anchors for all keywords in the urlMap
// function applyAllAnchors(html: string, urlMap: Record<string, string | null>): string {
//   let out = html || "";
//   for (const k of Object.keys(urlMap)) {
//     out = injectAnchorForKeyword(out, k, urlMap[k]);
//   }
//   return out;
// }

// /* ────────────────────────────────────────────────────────────────────────────
//    Word-count + title helpers (target 500–600 words, title 60–70 chars)
// ──────────────────────────────────────────────────────────────────────────── */
// function htmlToPlainWords(html: string): number {
//   const text = String(html ?? "")
//     .replace(/<style[\s\S]*?<\/style>/gi, " ")
//     .replace(/<script[\s\S]*?<\/script>/gi, " ")
//     .replace(/<[^>]+>/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
//   if (!text) return 0;
//   return text.split(/\s+/).length;
// }

// function generateFillerParagraph(): string {
//   // ~110–150 words, neutral, practical, with tiny units/timings sprinkled
//   return `<p>When you put this into practice, a few small habits make a big difference. Keep a pocket checklist of measurable points — tolerances around ±0.3&nbsp;mm, file sizes near ~500&nbsp;KB for web images, curing or wait times of 15–20&nbsp;minutes, and simple budget caps in ₹500–₹1,200 per task. Note what consistently works over two weeks and drop anything that never moves the needle. Write down friction spots (slow pages, unclear labels, noisy environments at ~65–70&nbsp;dB) and fix the loudest first. Batch routine steps into 20–25&nbsp;minute blocks; stop once you hit diminishing returns. That cadence prevents over-tuning and keeps momentum. Finally, review outcomes every Friday: one paragraph on what improved, one on what didn’t, and one concrete tweak to try on Monday. It’s boring, yes — but it compounds fast.</p>`;
// }

// function ensureWordCountRange(html: string, min = 500): string {
//   let out = html || "";
//   let words = htmlToPlainWords(out);
//   if (words >= min) return out;
//   if (V()) console.log(`[CONTENT] padding from ~${words} → ≥${min} words`);

//   // add up to 3 filler paragraphs, re-check after each
//   for (let i = 0; i < 3 && words < min; i++) {
//     out += generateFillerParagraph();
//     words = htmlToPlainWords(out);
//   }
//   return out;
// }

// function clampTitleToRange(title: string, keywordsHint: string[] = [], min = 60, max = 70): string {
//   let s = (title || "").trim().replace(/\s+/g, " ");
//   if (!s) s = keywordsHint[0] || "Untitled";

//   if (s.length > max) {
//     s = s.slice(0, max).replace(/\s+\S*$/, "").trim();
//   }
//   if (s.length >= min) return s;

//   const suffixes = [
//     " — practical tips & checks",
//     " — hands-on guide",
//     " — essentials that actually help",
//     " — quick, field-tested guide",
//   ];

//   for (const suf of suffixes) {
//     if (s.length >= min) break;
//     const cap = max - s.length;
//     if (cap <= 3) break;
//     const seg = suf.slice(0, cap).replace(/\s+\S*$/, "").trim();
//     if (seg) s = s + seg;
//   }

//   if (s.length < min && keywordsHint.length) {
//     const extra = ` — ${keywordsHint.slice(0, 2).join(", ")}`;
//     const cap = max - s.length;
//     const seg = extra.slice(0, cap).replace(/\s+\S*$/, "").trim();
//     if (seg) s = s + seg;
//   }

//   // Final safety: if still below min, pad minimally within max
//   if (s.length < min) {
//     const pad = " — guide";
//     const cap = max - s.length;
//     s = s + pad.slice(0, Math.max(0, cap));
//   }
//   return s;
// }

// /* ────────────────────────────────────────────────────────────────────────────
//    Editor launcher
// ──────────────────────────────────────────────────────────────────────────── */
// const SESSION_KEY = "open-content-item_v1";

// export function openContentEditor(item: ContentItem) {
//   try {
//     try {
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
//     } catch {
//       try { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); } catch {}
//     }
//     const win = window.open("/content/editor", "_blank");
//     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
//   } catch {
//     try { window.location.href = "/content/editor"; } catch {}
//   }
// }

// /* ────────────────────────────────────────────────────────────────────────────
//    Hook Implementation
// ──────────────────────────────────────────────────────────────────────────── */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);
//   const { prefs } = useContentPreferences();

//   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       const base: ExcelProject = {
//         id: proj.id,
//         fileName: proj.fileName,
//         status: (proj as any).status ?? "pending",
//         totalKeywords: (proj as any).totalKeywords ?? 0,
//         processedKeywords: (proj as any).processedKeywords ?? 0,
//         createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//         error: (proj as any).error,
//         failedCount: (proj as any).failedCount ?? 0,
//       };
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//       return [...prev, base];
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({
//       id: fileId,
//       fileName: file.name,
//       status: "pending",
//       totalKeywords: 0,
//       processedKeywords: 0,
//       createdAt: new Date().toISOString(),
//       failedCount: 0,
//     });

//     const bufferItems: ContentItem[] = [];
//     let FLUSH_TIMER: number | null = null;
//     const flushNow = () => {
//       if (FLUSH_TIMER != null) { clearTimeout(FLUSH_TIMER as any); FLUSH_TIMER = null; }
//       if (bufferItems.length === 0) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };
//     const scheduleFlush = () => {
//       if (FLUSH_TIMER != null) return;
//       // @ts-ignore
//       FLUSH_TIMER = window.setTimeout(() => flushNow(), 300);
//     };

//     let failedCount = 0;

//     // progress updater (counts rows processed, not groups)
//     let processedCount = 0;
//     const updateProgress = (processed: number, total: number) => {
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, processedKeywords: processed } : p
//       ));
//       const pct = Math.round((processed / Math.max(1, total)) * 100);
//       try { onProgress?.(pct); } catch {}
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

//       // Group rows by user preference: 1/2/4 keywords per article
//       const size = resolveGroupSize(prefs);
//       if (V()) console.log("[CONTENT] group size =", size, "raw =", (prefs as any)?.keywordMode);

//       const groups: KeywordRow[][] = [];
//       for (let i = 0; i < keywords.length; i += size) {
//         groups.push(keywords.slice(i, i + size));
//       }
//       if (V()) console.log("[CONTENT] total groups:", groups.length);

//       ensureProject({
//         id: fileId,
//         fileName: file.name,
//         status: "processing",
//         totalKeywords: keywords.length,
//         processedKeywords: 0,
//       });
//       toast.info(`Found ${keywords.length} keywords → grouping by ${size}. Generating...`);

//       // Concurrency
//       let concurrency = Math.min(6, Math.max(1, Math.floor((navigator.hardwareConcurrency ?? 4) / 2)));
//       const MIN = 1, MAX = 8;
//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= groups.length) return;
//         const groupIndex = idx++;
//         const grp = groups[groupIndex];
//         const kws = grp.map(g => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach(g => { urlMap[g.keyword] = g.url ?? null; });

//         if (V()) console.log("[CONTENT] → generating group", groupIndex, kws);

//         const task = (async () => {
//           try {
//             // Strong instructions to enforce length + anchors:
//             const extra = [
//               "TOTAL WORD COUNT: 500–600 words (do not go below 500).",
//               "Title must be between 60–70 characters.",
//               "For EACH keyword provided, include EXACTLY ONE anchor token in the HTML like [ANCHOR:THE_KEYWORD] (no extra brackets or variants).",
//               "Use British English; natural, conversational tone; uneven cadence.",
//               "Return STRICT JSON with keys {\"title\",\"html\"}. No markdown, no commentary.",
//               (typeof (prefs as any)?.extraInstructions === "string" ? String((prefs as any).extraInstructions) : "").trim()
//             ].filter(Boolean).join(" ");

//             let result = await generateJSONTitleHtml({
//               keywords: kws,
//               instructions: extra,
//             });

//             // Title length clamp
//             const finalTitle = clampTitleToRange(result.title || kws[0], kws, 60, 70);

//             // Ensure anchors for all keywords, then pad to 500+ words
//             const withAnchors = applyAllAnchors(result.html, urlMap);
//             const finalHtml = ensureWordCountRange(withAnchors, 500);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: finalHtml,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title: finalTitle,
//               targetUrl: urlMap[kws[0]] ?? null,
//               urlMap,
//               status: "success",
//             };

//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             console.error("group generate error:", e);
//             // minimal fallback — guarantees anchors for all keywords and pads to 500
//             const tokens = kws.map(k => `[ANCHOR:${k}]`).join(" ");
//             const html = ensureWordCountRange(`<p>${tokens}</p>`, 500);
//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: applyAllAnchors(html, urlMap),
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title: clampTitleToRange(`${kws[0]} — practical notes`, kws, 60, 70),
//               targetUrl: urlMap[kws[0]] ?? null,
//               urlMap,
//               status: "failed",
//             };
//             bufferItems.push(item);
//             scheduleFlush();
//           } finally {
//             // count rows consumed
//             processedCount += grp.length;
//             updateProgress(processedCount, keywords.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < groups.length || running.size > 0) {
//         const cur = Math.max(MIN, Math.min(MAX, Math.floor(concurrency)));
//         while (running.size < cur && idx < groups.length) startNext();
//         if (!running.size && idx >= groups.length) break;
//         await Promise.race(Array.from(running));
//         // simple adaptive tweak
//         if (failedCount > 0 && concurrency > 2) concurrency -= 0.2;
//         else if (concurrency < MAX) concurrency += 0.1;
//       }

//       flushNow();
//       setExcelProjects((prev) =>
//         (prev ?? []).map((p) =>
//           p.id === fileId
//             ? { ...p, status: "completed", processedKeywords: keywords.length, failedCount }
//             : p
//         )
//       );
//       const ok = keywords.length - failedCount;
//       toast.success(`Finished ${file.name}: ✅ ${ok} • ❌ ${failedCount}`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) =>
//         (prev ?? []).map((p) =>
//           p.id === fileId
//             ? {
//                 ...p,
//                 status: "error",
//                 error: error instanceof Error ? error.message : String(error),
//               }
//             : p
//         )
//       );
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
//     openContentEditor,
//   };
// }




// import { useState } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { buildPromptInstructions } from "@/lib/llm/prompt";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { useContentPreferences } from "@/hooks/use-preferences";

// /* ---------- Types ---------- */
// export interface ContentItem {
//   id: string;
//   keyword: string;            // primary keyword (first of the group)
//   keywordsUsed?: string[];    // all keywords used in this content item (1/2/4)
//   generatedContent: string;   // HTML
//   fileId: string;
//   fileName: string;
//   createdAt: string;          // ISO
//   title?: string;
//   targetUrl?: string | null;  // url for primary
//   urlMap?: Record<string, string | null>; // per keyword urls
//   status?: "success" | "failed";
// }

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;          // total rows read
//   processedKeywords: number;      // rows attempted (sum of rows consumed)
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (progressPercentage: number) => void;

// const SESSION_KEY = "open-content-item_v1";

// /* ---------- Editor launcher ---------- */
// export function openContentEditor(item: ContentItem) {
//   try {
//     try {
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
//     } catch {
//       try { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); } catch {}
//     }
//     const win = window.open("/content/editor", "_blank");
//     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
//   } catch {
//     try { window.location.href = "/content/editor"; } catch {}
//   }
// }

// /* ---------- Excel parsing helpers (with strong header detection) ---------- */
// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }
// function isLikelyUrlOrDomain(s: string | undefined | null) {
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
//   if (v.length > 180) return "";
//   if (isLikelyUrlOrDomain(v)) return "";
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2) return "";
//   return v;
// }

// type KeywordRow = { keyword: string; url?: string | null };

// const KW_HEADERS = new Set([
//   "keyword", "keywords", "focus keyword", "search term", "term", "query", "topic", "title", "key word",
// ]);

// const URL_HEADERS = new Set([
//   "url", "link", "target url", "target", "target page", "landing page", "page url", "destination", "href", "target link",
// ]);

// function detectHeaderRowAndColumns(rows: unknown[][]) {
//   let headerRowIndex = -1;
//   const maxCheck = Math.min(rows.length, 6);
//   // pick first row that looks header-ish (many non-empty strings, not purely numeric)
//   for (let i = 0; i < maxCheck; i++) {
//     const r = rows[i];
//     if (!Array.isArray(r)) continue;
//     const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
//     const mostlyText = nonEmpty.filter((c) => /[A-Za-z]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
//     if (nonEmpty.length >= 2 && mostlyText) {
//       headerRowIndex = i;
//       break;
//     }
//   }
//   if (headerRowIndex === -1) headerRowIndex = 0;

//   const headers = (rows[headerRowIndex] as unknown[]).map(norm);
//   let keywordCol = -1;
//   let urlCol = -1;

//   // direct header match
//   headers.forEach((h, idx) => {
//     if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
//     if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
//   });

//   // heuristic if missing keywordCol
//   if (keywordCol === -1) {
//     // scan first 200 rows under header; choose column with most likely keywords
//     const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
//     const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
//     let bestCol = -1;
//     let bestScore = 0;
//     for (let c = 0; c < maxCols; c++) {
//       let score = 0, checks = 0;
//       for (const rr of lookahead) {
//         if (!Array.isArray(rr)) continue;
//         const s = sanitizeKeyword(rr[c]);
//         if (s) score++;
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       if (checks === 0) continue;
//       const weighted = score * 100 + Math.min(checks, 100);
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
//       // fallback: first valid text cell
//       for (let c = 0; c < maxCols; c++) {
//         const cand = sanitizeKeyword(r[c]);
//         if (cand) { k = cand; break; }
//       }
//     }
//     if (!k || seen.has(k)) continue;

//     let url: string | null = null;
//     // prefer explicit url column
//     if (urlCol != null) {
//       const raw = String(r[urlCol] ?? "").trim();
//       if (raw && isLikelyUrlOrDomain(raw)) url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
//     }
//     // else: scan neighbor cells
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
//   const perSheet: Record<string, number> = {};

//   for (const sheetName of sheetNames) {
//     try {
//       const sheet = workbook.Sheets[sheetName];
//       const ks = extractKeywordsFromWorksheetWithUrls(sheet);
//       perSheet[sheetName] = ks.length;
//       for (const k of ks) if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
//       if (combined.length > 5000) break;
//     } catch (e) {
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }
//   return { keywords: combined, perSheet };
// }

// /* ---------- Post-processing helpers ---------- */
// function stripTags(html: string) {
//   const tmp = document.createElement("div");
//   tmp.innerHTML = html || "";
//   return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
// }
// function wordCount(html: string) {
//   const t = stripTags(html);
//   if (!t) return 0;
//   return t.split(/\s+/).filter(Boolean).length;
// }
// function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

// function makeHeading(i: number) {
//   const bank = [
//     "What Matters Now",
//     "Practical Foundations",
//     "Tiny Checks that Save Time",
//     "Gotchas & How to Dodge Them",
//     "Real-World Tips",
//     "When to Break the Rule",
//   ];
//   return bank[i % bank.length];
// }

// function rebuildStructuredHtml(baseHtml: string, sectionsWanted = 5) {
//   // Split into paragraphs
//   const parts = (baseHtml || "")
//     .replace(/\r\n/g, "\n")
//     .split(/<\/p>/i)
//     .map((s) => s.trim())
//     .filter(Boolean)
//     .map((s) => (s.endsWith("</p>") ? s : s + "</p>"));

//   let paras: string[] = parts.length ? parts : ["<p>" + stripTags(baseHtml) + "</p>"];

//   // Ensure between 4–6 paragraphs
//   const target = clamp(sectionsWanted, 4, 6);
//   if (paras.length < target) {
//     const expanded: string[] = [];
//     for (const p of paras) {
//       const text = stripTags(p);
//       const sentences = text.split(/(?<=[.!?])\s+/);
//       if (sentences.length > 2) {
//         const mid = Math.ceil(sentences.length / 2);
//         expanded.push(`<p>${sentences.slice(0, mid).join(" ")}</p>`);
//         expanded.push(`<p>${sentences.slice(mid).join(" ")}</p>`);
//       } else {
//         expanded.push(p);
//       }
//     }
//     paras = expanded;
//   }
//   if (paras.length > 6) paras = paras.slice(0, 6);

//   // Build sections with bold H2 + paragraph
//   const sections: string[] = [];
//   for (let i = 0; i < paras.length; i++) {
//     const h = makeHeading(i);
//     sections.push(`<h2><strong>${h}</strong></h2>${paras[i]}`);
//   }
//   return sections;
// }

// function distributeAnchorTokens(htmlSections: string[], keywords: string[]) {
//   const N = htmlSections.length;
//   const map: Record<number, string | null> = {}; // sectionIndex -> keyword

//   if (keywords.length === 1) {
//     map[0] = keywords[0];
//   } else if (keywords.length === 2) {
//     map[0] = keywords[0];
//     if (N >= 3) map[2] = keywords[1]; else map[N - 1] = keywords[1];
//   } else if (keywords.length >= 4) {
//     for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i];
//   }

//   const out = htmlSections.map((secHtml, idx) => {
//     const kw = map[idx];
//     if (!kw) return secHtml;
//     // Ensure only one token in this section, append neatly if missing.
//     if (secHtml.includes(`[ANCHOR:${kw}]`)) return secHtml;
//     return secHtml.replace(/<\/p>/i, ` [ANCHOR:${kw}]</p>`);
//   });

//   // Remove any accidental extra tokens per section
//   return out.map((s) => {
//     const tokens = (s.match(/\[ANCHOR:[^\]]+\]/g) || []);
//     if (tokens.length <= 1) return s;
//     let first = true;
//     return s.replace(/\[ANCHOR:[^\]]+\]/g, () => (first ? ((first = false), tokens[0]) as any : ""));
//   });
// }

// function ensureConclusion(htmlSections: string[]) {
//   // Always end with Conclusion block (no tokens here)
//   return [
//     ...htmlSections,
//     `<h2><strong>Conclusion</strong></h2><p>Keep it practical. Apply one tiny change in the next 24 hours; then another next week. Small, repeatable moves beat perfect plans.</p>`,
//   ];
// }

// function ensureWordCountRange(html: string, targetWords: number) {
//   const MIN = Math.round(targetWords * 0.94);
//   if (wordCount(html) >= MIN) return html;
//   const need = MIN - wordCount(html);
//   const add = Math.max(1, Math.ceil(need / 80)); // ~80 words per extra paragraph
//   let extra = "";
//   for (let i = 0; i < add; i++) {
//     extra += `<h2><strong>Human Moment</strong></h2><p>Here’s the bit people skip: try it on a small scale first, write down what actually happened (times, costs, tiny measurements), and talk to one person who’s done it before. It sounds obvious, but these plain checks save hours.</p>`;
//   }
//   return html + extra;
// }

// function applyAllAnchors(html: string, urlMap: Record<string, string | null>) {
//   const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//   return applyAnchorTokens(html, anchors);
// }

// /* ---------- Hook Implementation ---------- */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);
//   const { prefs } = useContentPreferences();

//   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       const base: ExcelProject = {
//         id: proj.id,
//         fileName: proj.fileName,
//         status: (proj as any).status ?? "pending",
//         totalKeywords: (proj as any).totalKeywords ?? 0,
//         processedKeywords: (proj as any).processedKeywords ?? 0,
//         createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//         error: (proj as any).error,
//         failedCount: (proj as any).failedCount ?? 0,
//       };
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//       return [...prev, base];
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

//     const bufferItems: ContentItem[] = [];
//     let FLUSH_TIMER: number | null = null;
//     const flushNow = () => {
//       if (FLUSH_TIMER != null) { clearTimeout(FLUSH_TIMER as any); FLUSH_TIMER = null; }
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };
//     const scheduleFlush = () => { if (FLUSH_TIMER == null) FLUSH_TIMER = window.setTimeout(() => flushNow(), 250); };

//     let failedCount = 0;
//     let processedCount = 0;
//     const updateProgress = (processed: number, total: number) => {
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
//       const pct = Math.round((processed / Math.max(1, total)) * 100);
//       try { onProgress?.(pct); } catch {}
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

//       // Group rows by user preference: 1/2/4 keywords per article
//       const size = (prefs.keywordMode ?? 1) as 1 | 2 | 4;
//       const groups: KeywordRow[][] = [];
//       for (let i = 0; i < keywords.length; i += size) groups.push(keywords.slice(i, i + size));

//       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: keywords.length, processedKeywords: 0 });
//       toast.info(`Found ${keywords.length} keywords → grouping by ${size}. Generating...`);

//       // Concurrency
//       let concurrency = Math.min(6, Math.max(1, Math.floor((navigator.hardwareConcurrency ?? 4) / 2)));
//       const MIN = 1, MAX = 8;
//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= groups.length) return;
//         const groupIndex = idx++;
//         const grp = groups[groupIndex];
//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

//         const task = (async () => {
//           try {
//             // High-priority instruction for the LLM
//             const instructions = buildPromptInstructions({
//               keywords: kws,
//               targetWords: prefs.targetWords,
//               extraInstructions: prefs.extraInstructions,
//             });

//             const result = await generateJSONTitleHtml({ keywords: kws, instructions });

//             // Rebuild to 4–6 sections, apply tokens by rule, add conclusion
//             const baseSections = rebuildStructuredHtml(result.html, 5);
//             const withTokens = distributeAnchorTokens(baseSections, kws);
//             const withConclusion = ensureConclusion(withTokens);
//             let finalHtml = withConclusion.join("");

//             // Convert tokens to <a><strong>…</strong></a> using per-row target URLs
//             finalHtml = applyAllAnchors(finalHtml, urlMap);

//             // Ensure lower bound of word count per user preference
//             finalHtml = ensureWordCountRange(finalHtml, prefs.targetWords);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: finalHtml,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title: result.title,
//               targetUrl: urlMap[kws[0]] ?? null,
//               urlMap,
//               status: "success",
//             };
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += grp.length; // count rows consumed
//             updateProgress(processedCount, keywords.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < groups.length || running.size > 0) {
//         const cur = Math.max(MIN, Math.min(MAX, Math.floor(concurrency)));
//         while (running.size < cur && idx < groups.length) startNext();
//         if (!running.size && idx >= groups.length) break;
//         await Promise.race(Array.from(running));
//         if (failedCount > 0 && concurrency > 2) concurrency -= 0.2; else if (concurrency < MAX) concurrency += 0.1;
//       }

//       flushNow();
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length, failedCount } : p)));
//       const ok = keywords.length - failedCount;
//       toast.success(`Finished ${file.name}: ✅ ${ok} • ❌ ${failedCount}`);
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
//     openContentEditor,
//   };
// }



// import { useState } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { DEFAULT_PREFS, PREFS_KEY } from "@/hooks/use-preferences";

// /* ---------- Types ---------- */
// export interface ContentItem {
//   id: string;
//   keyword: string;            // primary keyword (first of the group)
//   keywordsUsed?: string[];    // all keywords used in this content item (1/2/4)
//   generatedContent: string;   // HTML (no extra H2s; paragraphs only)
//   fileId: string;
//   fileName: string;
//   createdAt: string;          // ISO
//   title?: string;
//   targetUrl?: string | null;  // url for primary
//   urlMap?: Record<string, string | null>; // per keyword urls
//   status?: "success" | "failed";
// }

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;          // total rows read
//   processedKeywords: number;      // rows attempted (sum of rows consumed)
//   createdAt: string;
//   error?: string;
//   failedCount?: number;
// }

// type GenerateProgressCallback = (progressPercentage: number) => void;

// const SESSION_KEY = "open-content-item_v1";

// /* ---------- Editor launcher ---------- */
// export function openContentEditor(item: ContentItem) {
//   try {
//     try {
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
//     } catch {
//       try { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); } catch {}
//     }
//     const win = window.open("/content/editor", "_blank");
//     if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
//   } catch {
//     try { window.location.href = "/content/editor"; } catch {}
//   }
// }

// /* ---------- Excel parsing helpers (with strong header detection) ---------- */
// function norm(s: unknown) {
//   return String(s ?? "")
//     .toLowerCase()
//     .replace(/[.\-_/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }
// function isLikelyUrlOrDomain(s: string | undefined | null) {
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
//   if (v.length > 180) return "";
//   if (isLikelyUrlOrDomain(v)) return "";
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
//   v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
//   if (v.length < 2) return "";
//   return v;
// }

// type KeywordRow = { keyword: string; url?: string | null };

// const KW_HEADERS = new Set([
//   "keyword", "keywords", "focus keyword", "search term", "term", "query", "topic", "title", "key word",
// ]);

// const URL_HEADERS = new Set([
//   "url", "link", "target url", "target", "target page", "landing page", "page url", "destination", "href", "target link",
// ]);

// function detectHeaderRowAndColumns(rows: unknown[][]) {
//   let headerRowIndex = -1;
//   const maxCheck = Math.min(rows.length, 6);
//   for (let i = 0; i < maxCheck; i++) {
//     const r = rows[i];
//     if (!Array.isArray(r)) continue;
//     const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
//     const mostlyText = nonEmpty.filter((c) => /[A-Za-z]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
//     if (nonEmpty.length >= 2 && mostlyText) {
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
//       let score = 0, checks = 0;
//       for (const rr of lookahead) {
//         if (!Array.isArray(rr)) continue;
//         const s = sanitizeKeyword(rr[c]);
//         if (s) score++;
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       if (checks === 0) continue;
//       const weighted = score * 100 + Math.min(checks, 100);
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
//   const perSheet: Record<string, number> = {};

//   for (const sheetName of sheetNames) {
//     try {
//       const sheet = workbook.Sheets[sheetName];
//       const ks = extractKeywordsFromWorksheetWithUrls(sheet);
//       perSheet[sheetName] = ks.length;
//       for (const k of ks) if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
//       if (combined.length > 5000) break;
//     } catch (e) {
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }
//   return { keywords: combined, perSheet };
// }

// /* ---------- Post-processing helpers (H1 only + 100–120 words paragraphs) ---------- */
// function stripTags(html: string) {
//   const tmp = document.createElement("div");
//   tmp.innerHTML = html || "";
//   return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
// }
// function countWords(s: string) {
//   const t = stripTags(s);
//   if (!t) return 0;
//   return t.split(/\s+/).filter(Boolean).length;
// }
// function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

// function removeHeadingsAndConclusions(rawHtml: string) {
//   let s = rawHtml || "";
//   // remove all headings (H1..H6) entirely
//   s = s.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, "");
//   // remove any 'Conclusion' words that might appear standalone
//   s = s.replace(/\bConclusion\b[:]?/gi, "");
//   return s;
// }

// function splitToParagraphs(baseHtml: string, targetWords: number, minPer = 100, maxPer = 120) {
//   const text = stripTags(removeHeadingsAndConclusions(baseHtml));
//   const words = text.split(/\s+/).filter(Boolean);

//   // How many paragraphs to aim for
//   const avg = Math.round((minPer + maxPer) / 2);
//   const wantedParas = clamp(Math.round((targetWords || 500) / avg), 3, 6);

//   const ideal = clamp(Math.round(words.length / wantedParas), minPer, maxPer);
//   const paras: string[] = [];
//   let i = 0;
//   for (let p = 0; p < wantedParas && i < words.length; p++) {
//     const count = clamp(ideal, minPer, maxPer);
//     const slice = words.slice(i, i + count);
//     paras.push(`<p>${slice.join(" ")}</p>`);
//     i += count;
//   }
//   // if not enough text, create empty shells (we'll lengthen later if needed)
//   while (paras.length < wantedParas) paras.push(`<p></p>`);
//   return paras.slice(0, wantedParas);
// }

// /** Place tokens into paragraphs: 1→p1, 2→p1 & p3, 4+→p1..p4 (once each). */
// function distributeTokensIntoParas(paras: string[], keywords: string[]) {
//   const N = paras.length;
//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) {
//     map[0] = keywords[0];
//   } else if (keywords.length === 2) {
//     map[0] = keywords[0];
//     map[Math.min(2, N - 1)] = keywords[1];
//   } else if (keywords.length >= 4) {
//     for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i];
//   } else {
//     // 3 keywords → p1, p2, p3 (if exist)
//     for (let i = 0; i < Math.min(3, N); i++) map[i] = keywords[i];
//   }

//   const out = paras.map((pHtml, idx) => {
//     const kw = map[idx];
//     if (!kw) return pHtml;
//     if (pHtml.includes(`[ANCHOR:${kw}]`)) return pHtml;
//     return pHtml.replace(/<\/p>/i, ` [ANCHOR:${kw}]</p>`);
//   });

//   // Remove accidental extra tokens per paragraph (TS-safe callback)
//   return out.map((s) => {
//     const tokens = (s.match(/\[ANCHOR:[^\]]+\]/g) ?? []) as string[];
//     if (tokens.length <= 1) return s;
//     let used = false;
//     const firstToken: string = tokens[0]!;
//     return s.replace(/\[ANCHOR:[^\]]+\]/g, (_substr: string) => {
//       if (!used) { used = true; return firstToken; }
//       return "";
//     });
//   });
// }

// function ensureWordCountLowerBound(html: string, targetWords: number) {
//   const MIN = Math.round((targetWords || 500) * 0.95);
//   if (countWords(html) >= MIN) return html;
//   const need = MIN - countWords(html);
//   const perBlock = 110; // ~110 words filler per extra block
//   const addBlocks = Math.max(1, Math.ceil(need / perBlock));
//   let extra = "";
//   for (let i = 0; i < addBlocks; i++) {
//     extra += `<p>Be specific and concrete: include tiny numbers (±0.3 mm, ~500 KB, 15–20 min), name a realistic check, and keep it human and candid. Focus on clarity and usefulness over fluff; one small actionable tip beats five vague ones.</p>`;
//   }
//   return html + extra;
// }

// function applyAllAnchors(html: string, urlMap: Record<string, string | null>) {
//   const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//   return applyAnchorTokens(html, anchors);
// }

// function readSavedPrefs() {
//   try {
//     const raw = localStorage.getItem(PREFS_KEY);
//     if (!raw) return DEFAULT_PREFS;
//     const obj = JSON.parse(raw);
//     return {
//       keywordMode: (obj?.keywordMode as 1|2|4) ?? DEFAULT_PREFS.keywordMode,
//       targetWords: (obj?.targetWords as 200|500|700|900) ?? DEFAULT_PREFS.targetWords,
//       extraInstructions: String(obj?.extraInstructions ?? ""),
//     };
//   } catch {
//     return DEFAULT_PREFS;
//   }
// }

// /* ---------- Hook Implementation ---------- */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       const base: ExcelProject = {
//         id: proj.id,
//         fileName: proj.fileName,
//         status: (proj as any).status ?? "pending",
//         totalKeywords: (proj as any).totalKeywords ?? 0,
//         processedKeywords: (proj as any).processedKeywords ?? 0,
//         createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//         error: (proj as any).error,
//         failedCount: (proj as any).failedCount ?? 0,
//       };
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//       return [...prev, base];
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);

//     const livePrefs = readSavedPrefs(); // ALWAYS read latest saved prefs at the start
//     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

//     const bufferItems: ContentItem[] = [];
//     let FLUSH_TIMER: number | null = null;
//     const flushNow = () => {
//       if (FLUSH_TIMER != null) { clearTimeout(FLUSH_TIMER as any); FLUSH_TIMER = null; }
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };
//     const scheduleFlush = () => { if (FLUSH_TIMER == null) FLUSH_TIMER = window.setTimeout(() => flushNow(), 250); };

//     let failedCount = 0;
//     let processedCount = 0;
//     const updateProgress = (processed: number, total: number) => {
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
//       const pct = Math.round((processed / Math.max(1, total)) * 100);
//       try { onProgress?.(pct); } catch {}
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

//       // Group rows by saved preference: 1/2/4 keywords per article
//       const size = (livePrefs.keywordMode ?? 1) as 1 | 2 | 4;
//       const groups: KeywordRow[][] = [];
//       for (let i = 0; i < keywords.length; i += size) groups.push(keywords.slice(i, i + size));

//       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: keywords.length, processedKeywords: 0 });
//       toast.info(`Found ${keywords.length} keywords → grouping by ${size}. Generating...`);

//       // Concurrency
//       let concurrency = Math.min(6, Math.max(1, Math.floor((navigator.hardwareConcurrency ?? 4) / 2)));
//       const MIN = 1, MAX = 8;
//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= groups.length) return;
//         const groupIndex = idx++;
//         const grp = groups[groupIndex];
//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

//         const task = (async () => {
//           try {
//             // Hard rule instructions that bias the model (we still rebuild later)
//             const instructions = [
//               `Write ONLY in English unless I explicitly specify another language.`,
//               `Keep content humanize i want to make brurtally ai free content add human content and sentences `,
//               `Keep paragraphs natural; we will enforce 100–120 words each in post-process.`,
//               `Insert tokens once each exactly: ${kws.map(k => `[ANCHOR:${k}]`).join(" ")}`,
//               livePrefs.extraInstructions ? `Extra (highest priority): ${livePrefs.extraInstructions}` : ""
//             ].filter(Boolean).join("\n");

//             // Ask LLM for {title, html}
//             const result = await generateJSONTitleHtml({ keywords: kws, instructions });

//             // Build paragraphs only (no section H2s), 100–120 words each
//             const paras = splitToParagraphs(result.html, (livePrefs.targetWords || 500), 100, 120);
//             const withTokens = distributeTokensIntoParas(paras, kws);
//             let finalHtml = withTokens.join(""); // paragraphs only, no headings

//             // Map tokens to per-keyword row URL (each token → its own URL)
//             finalHtml = applyAllAnchors(finalHtml, urlMap);

//             // Ensure lower bound on total words (~95% of target)
//             finalHtml = ensureWordCountLowerBound(finalHtml, (livePrefs.targetWords || 500));

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: finalHtml,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title: result.title,
//               targetUrl: urlMap[kws[0]] ?? null,
//               urlMap,
//               status: "success",
//             };
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += grp.length;
//             updateProgress(processedCount, keywords.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < groups.length || running.size > 0) {
//         const cur = Math.max(MIN, Math.min(MAX, Math.floor(concurrency)));
//         while (running.size < cur && idx < groups.length) startNext();
//         if (!running.size && idx >= groups.length) break;
//         await Promise.race(Array.from(running));
//         if (failedCount > 0 && concurrency > 2) concurrency -= 0.2; else if (concurrency < MAX) concurrency += 0.1;
//       }

//       flushNow();
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length, failedCount } : p)));
//       const ok = keywords.length - failedCount;
//       toast.success(`Finished ${file.name}: ✅ ${ok} • ❌ ${failedCount}`);
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
//     openContentEditor,
//   };
// }

// //  best code ----------------------------------------------------------------------------------------------------------------------------------------------
// // src/hooks/use-content-generation.ts
// import { useState } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";

// /* =========================
//    Preferences (always fresh)
//    ========================= */
// export type KeywordMode = 1 | 2 | 4;
// export type TargetWords = 200 | 500 | 700 | 900;
// export interface ContentPreferences {
//   keywordMode: KeywordMode;
//   targetWords: TargetWords;
//   extraInstructions: string;
// }
// const PREF_KEY = "content-preferences_v2";
// const DEFAULT_PREFS: ContentPreferences = { keywordMode: 1, targetWords: 500, extraInstructions: "" };
// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     if (!raw) return { ...DEFAULT_PREFS };
//     const o = JSON.parse(raw) as Partial<ContentPreferences>;
//     return {
//       keywordMode: (o.keywordMode as KeywordMode) ?? DEFAULT_PREFS.keywordMode,
//       targetWords: (o.targetWords as TargetWords) ?? DEFAULT_PREFS.targetWords,
//       extraInstructions: o.extraInstructions ?? DEFAULT_PREFS.extraInstructions,
//     };
//   } catch {
//     return { ...DEFAULT_PREFS };
//   }
// }

// /* =========================
//    Types & Editor opener
//    ========================= */
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

// /* =========================
//    Excel parsing (robust)
//    ========================= */
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
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
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
//     const mostlyText = nonEmpty.filter((c) => /[A-Za-z]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
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
//         if (s) score++;
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       if (checks === 0) continue;
//       const weighted = score * 100 + Math.min(checks, 100);
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
//       if (combined.length > 5000) break;
//     } catch (e) {
//       console.warn("worksheet parse failed:", sheetName, e);
//     }
//   }
//   return { keywords: combined };
// }

// /* =========================
//    HTML shaping & validation
//    ========================= */
// const H1_BANK = [
//   "Why This Matters",
//   "Core Features That Help",
//   "Checks That Save Time",
//   "Common Pitfalls & Fixes",
//   "Real-World Tips",
//   "Make It Stick",
// ];
// const PARA_MIN = 100;
// const PARA_MAX = 150;

// function stripTagsFast(html: string) {
//   return (html || "")
//     .replace(/<script[\s\S]*?<\/script>/gi, " ")
//     .replace(/<style[\s\S]*?<\/style>/gi, " ")
//     .replace(/<\/?[^>]+>/g, " ")
//     .replace(/&nbsp;|&#160;/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }
// function countWordsText(s: string) {
//   const t = (s || "").replace(/\s+/g, " ").trim();
//   if (!t) return 0;
//   return t.split(/\s+/).filter(Boolean).length;
// }
// function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

// function dedupeInstructionLeaks(s: string) {
//   // Drop instruction echoes and boilerplate lines
//   const lines = s.split(/\n+/).map((x) => x.trim()).filter(Boolean);
//   const out: string[] = [];
//   const drop = [
//     /^be specific and concrete/i,
//     /^in practice, aim/i,
//     /^focus on clarity/i,
//     /^do not copy or paraphrase/i,
//     /^tip:/i,
//   ];
//   const seen = new Set<string>();
//   for (const ln of lines) {
//     if (drop.some((re) => re.test(ln))) continue;
//     const key = ln.toLowerCase();
//     if (seen.has(key)) continue;
//     seen.add(key);
//     out.push(ln);
//   }
//   return out.join("\n");
// }

// function extractH1PSections(html: string) {
//   // Return pairs of <h1>...</h1> + following <p>...</p>
//   const out: { h: string; p: string }[] = [];
//   if (!html) return out;
//   const cleaned = html.replace(/\bundefined\b/gi, "");
//   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
//   let cursor = 0;
//   for (let i = 0; i < h1Matches.length; i++) {
//     const h = h1Matches[i];
//     const idx = cleaned.indexOf(h, cursor);
//     if (idx === -1) continue;
//     cursor = idx + h.length;
//     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
//     const p = pMatch ? pMatch[0] : "";
//     if (p) { out.push({ h, p }); cursor += p.length; }
//   }
//   return out;
// }

// function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number) {
//   // If valid H1+P pairs found, use them; else synthesize from text chunks
//   const pairs = extractH1PSections(rawHtml);
//   if (pairs.length >= 4) {
//     return pairs.slice(0, clamp(wantSections, 4, 6)).map(({ h, p }) => {
//       return `${h}${p}`;
//     });
//   }
//   const cleaned = dedupeInstructionLeaks(
//     rawHtml
//       .replace(/```[\s\S]*?```/g, " ")
//       .replace(/\bundefined\b/gi, " ")
//       .replace(/\[ANCHOR:[^\]]+\]/g, " ")
//   );
//   const text = stripTagsFast(cleaned);
//   const words = text.split(/\s+/).filter(Boolean);
//   const sections: string[] = [];
//   let idx = 0;
//   for (let s = 0; s < clamp(wantSections, 4, 6); s++) {
//     let take = PARA_MIN + Math.floor(Math.random() * (PARA_MAX - PARA_MIN + 1));
//     if (idx + take > words.length) take = Math.min(PARA_MAX, Math.max(PARA_MIN, words.length - idx));
//     if (take <= 0) { idx = 0; take = Math.min(PARA_MAX, Math.max(PARA_MIN, words.length)); }
//     const chunk = words.slice(idx, idx + take).join(" ").trim();
//     const h1 = H1_BANK[s % H1_BANK.length];
//     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
//     idx += take;
//   }
//   return sections;
// }

// function normalizeParagraphWordRange(html: string, minW = PARA_MIN, maxW = PARA_MAX) {
//   // Clamp every <p> to [minW, maxW] by trimming extra words; if too short, merge forward words
//   const parts: string[] = [];
//   const regex = /(<h1>[\s\S]*?<\/h1>)\s*(<p>[\s\S]*?<\/p>)/gi;
//   let m: RegExpExecArray | null;
//   let lastIndex = 0;

//   while ((m = regex.exec(html))) {
//     parts.push(html.slice(lastIndex, m.index));
//     const h = m[1];
//     let p = m[2];

//     const inner = stripTagsFast(p);
//     let ws = inner.split(/\s+/).filter(Boolean);
//     if (ws.length > maxW) ws = ws.slice(0, maxW);
//     if (ws.length < minW) {
//       // Try to borrow from next textual tail (after this paragraph) without boilerplate
//       const tail = stripTagsFast(html.slice(regex.lastIndex)).split(/\s+/).filter(Boolean);
//       const need = minW - ws.length;
//       if (tail.length >= need) ws = ws.concat(tail.slice(0, need));
//     }
//     p = `<p>${ws.join(" ")}</p>`;
//     parts.push(`${h}${p}`);
//     lastIndex = regex.lastIndex;
//   }
//   parts.push(html.slice(lastIndex));
//   return parts.join("");
// }

// function removeAllTokens(s: string) {
//   return s.replace(/\[ANCHOR:[^\]]+\]/g, "");
// }

// function distributeTokensExact(sections: string[], keywords: string[]) {
//   // Reset tokens first, then insert per mapping
//   const N = sections.length;
//   let out = sections.map(removeAllTokens);

//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) {
//     map[0] = keywords[0];
//   } else if (keywords.length === 2) {
//     map[0] = keywords[0];
//     map[Math.min(2, N - 1)] = keywords[1];
//   } else if (keywords.length >= 4) {
//     for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i];
//   }

//   out = out.map((sec, idx) => {
//     const kw = map[idx];
//     if (!kw) return sec;
//     const token = `[ANCHOR:${kw}]`;
//     return sec.replace(/<\/p>/i, ` ${token}</p>`);
//   });
//   return out;
// }

// function ensureSingleConclusion(sections: string[], minW = PARA_MIN, maxW = PARA_MAX) {
//   // Drop any existing conclusion sections and append fresh one (100–150 words)
//   const filtered = sections.filter((s) => !/^<h1>\s*Conclusion\s*<\/h1>/i.test(s));
//   const baseText =
//     "Choose one small, testable change and run it within 24 hours—then note what happened. Track the numbers (fit time, battery hours, minutes in noise, follow-up adjustments) and write down a concrete next step. Over two or three short cycles, this builds confidence and clarity without big commitments. Share the result with one person you trust and ask for specific feedback. Keep your notes short, dated, and honest; your aim is progress, not perfection. If a tweak fails, log it, adjust, and move again. Small, repeatable wins compound faster than perfect plans.";
//   let words = baseText.split(/\s+/).filter(Boolean);
//   if (words.length > maxW) words = words.slice(0, maxW);
//   while (words.length < minW) {
//     // gentle extension without boilerplate: rephrase loop (simple repeat of salient chunk)
//     words = words.concat(["Review", "your", "notes,", "tighten", "one", "setting,", "and", "try", "again", "tomorrow."]);
//   }
//   const conclusion = `<h1>Conclusion</h1><p>${words.join(" ")}</p>`;
//   return [...filtered, conclusion];
// }

// function validateHtml(html: string, keywords: string[]) {
//   const errors: string[] = [];
//   const sections = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []);
//   if (sections.length < 4 || sections.length > 7) errors.push("Sections must be 4–7 (including Conclusion).");

//   // Each paragraph between 100 and 150 words
//   const paras = (html.match(/<p>[\s\S]*?<\/p>/gi) || []);
//   paras.forEach((p) => {
//     const w = countWordsText(stripTagsFast(p));
//     if (w < PARA_MIN || w > PARA_MAX) errors.push(`Paragraph out of range (${w} words).`);
//   });

//   // Conclusion exactly once, no tokens inside conclusion
//   const conclMatches = (html.match(/<h1>\s*Conclusion\s*<\/h1>/gi) || []);
//   if (conclMatches.length !== 1) errors.push("Conclusion must appear exactly once.");
//   const concludedIdx = html.lastIndexOf("<h1>Conclusion</h1>");
//   if (concludedIdx === -1) errors.push("Missing Conclusion.");
//   else {
//     const conclSlice = html.slice(concludedIdx);
//     if (/\[ANCHOR:[^\]]+\]/.test(conclSlice)) errors.push("Tokens must not appear in Conclusion.");
//   }

//   // Tokens count per keyword exactly one
//   for (const k of keywords.slice(0, 4)) {
//     const token = `[ANCHOR:${k}]`;
//     const cnt = (html.match(new RegExp(`\\[ANCHOR:${k.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\]`, "g")) || []).length;
//     if (cnt !== 1) errors.push(`Token count for "${k}" must be exactly 1 (found ${cnt}).`);
//   }
//   return errors;
// }

// /* =========================
//    LLM plan & cache
//    ========================= */
// function buildStrictPlan(opts: { keywords: string[]; targetWords: number; extraInstructions?: string }) {
//   const { keywords, targetWords, extraInstructions } = opts;
//   // Fix 5 sections (+ Conclusion) typically fits 600–900 words; each para 100–150 words
//   const sectionCount = clamp(Math.round(targetWords / 120), 4, 6);
//   return [
//     `Return ONLY JSON with keys "title" and "html".`,
//     `British English. Do NOT copy any instruction text into "html". If you do, the answer is invalid.`,
//     `"title" ≤ 70 chars (natural, not just the keyword).`,
//     `"html": ${sectionCount} sections + a Conclusion. Each section MUST be exactly one <h1>Heading</h1> then one <p> of 100–150 words.`,
//     `Conclusion MUST be one <h1>Conclusion</h1> and one <p> of 100–150 words.`,
//     `Insert tokens exactly once each (not in Conclusion): ${keywords.map((k) => `[ANCHOR:${k}]`).join(" ")}`,
//     `Do not include markdown fences or backticks.`,
//     `Avoid meta lines like "Be specific..." or "In practice..." — they are invalid.`,
//     extraInstructions ? `Extra: ${extraInstructions}` : ``,
//   ].filter(Boolean).join("\n");
// }

// const LLM_CACHE = new Map<string, { title: string; html: string }>();
// function cacheKey(kws: string[], plan: string) {
//   return JSON.stringify({ k: kws, p: plan.slice(0, 256) });
// }
// async function callLLM(kws: string[], plan: string) {
//   const ck = cacheKey(kws, plan);
//   if (LLM_CACHE.has(ck)) return LLM_CACHE.get(ck)!;
//   const res = await generateJSONTitleHtml({ keywords: kws, instructions: plan });
//   LLM_CACHE.set(ck, res);
//   return res;
// }

// /* =========================
//    Hook (perf + reliability)
//    ========================= */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       const base: ExcelProject = {
//         id: proj.id,
//         fileName: proj.fileName,
//         status: (proj as any).status ?? "pending",
//         totalKeywords: (proj as any).totalKeywords ?? 0,
//         processedKeywords: (proj as any).processedKeywords ?? 0,
//         createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//         error: (proj as any).error,
//         failedCount: (proj as any).failedCount ?? 0,
//       };
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//       return [...prev, base];
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

//     // batched writes for perf
//     const bufferItems: ContentItem[] = [];
//     let FLUSH_TIMER: number | null = null;
//     const flushNow = () => {
//       if (FLUSH_TIMER != null) { clearTimeout(FLUSH_TIMER as any); FLUSH_TIMER = null; }
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };
//     const scheduleFlush = () => { if (FLUSH_TIMER == null) FLUSH_TIMER = window.setTimeout(() => flushNow(), 180); };

//     let failedCount = 0;
//     let processedCount = 0;
//     const updateProgress = (processed: number, total: number) => {
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
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

//       const prefs = getFreshPrefs(); // fresh read (reset respected)
//       const size = (prefs.keywordMode ?? 1) as 1 | 2 | 4;

//       // grouping
//       const groups: KeywordRow[][] = [];
//       for (let i = 0; i < keywords.length; i += size) groups.push(keywords.slice(i, i + size));

//       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: keywords.length, processedKeywords: 0, failedCount: 0 });
//       toast.info(`Found ${keywords.length} keywords → grouping by ${size}. Generating...`);

//       // adaptive pool
//       const cpu = (navigator.hardwareConcurrency ?? 4);
//       let concurrency = clamp(Math.floor(cpu / 2), 2, 8);
//       const MIN = 1, MAX = 8;
//       let idx = 0;
//       const running = new Set<Promise<void>>();

//       const startNext = () => {
//         if (idx >= groups.length) return;
//         const groupIndex = idx++;
//         const grp = groups[groupIndex];
//         const kws = grp.map((g) => g.keyword);
//         const urlMap: Record<string, string | null> = {};
//         grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

//         const task = (async () => {
//           try {
//             // Strict plan → model
//             const plan = buildStrictPlan({
//               keywords: kws,
//               targetWords: (prefs as any)?.targetWords || 500,
//               extraInstructions: (prefs as any)?.extraInstructions || "",
//             });

//             // 1st attempt
//             let result = await callLLM(kws, plan);

//             // Build sections → normalize → token placement → conclusion
//             const wantSections = clamp(Math.round(((prefs as any)?.targetWords || 500) / 120), 4, 6);
//             let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections);
//             sections = distributeTokensExact(sections, kws);
//             sections = ensureSingleConclusion(sections);

//             let finalHtml = sections.join("");
//             finalHtml = normalizeParagraphWordRange(finalHtml, PARA_MIN, PARA_MAX);

//             // Validate; if invalid, one repair attempt via stricter rewrite
//             let errs = validateHtml(finalHtml, kws);
//             if (errs.length > 0) {
//               const repairPlan = [
//                 plan,
//                 "",
//                 "REWRITE STRICTLY. Your previous output failed these checks:",
//                 ...errs.map((e) => `- ${e}`),
//                 "Return ONLY JSON with corrected 'html' and previous 'title'.",
//               ].join("\n");
//               result = await callLLM(kws, repairPlan);

//               sections = ensureH1SectionsFromAnyHtml(result.html, wantSections);
//               sections = distributeTokensExact(sections, kws);
//               sections = ensureSingleConclusion(sections);
//               finalHtml = normalizeParagraphWordRange(sections.join(""), PARA_MIN, PARA_MAX);
//               errs = validateHtml(finalHtml, kws);
//             }

//             // Per-keyword linking (only if URL present), others bolded
//             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//             finalHtml = applyAnchorTokens(finalHtml, anchors);

//             // Final clean: remove any stray tokens; ensure no tokens in conclusion
//             finalHtml = removeAllTokens(finalHtml);
//             // If any of the mapped keywords ended up not linked/strong (extreme edge), add a single bold mention at end of its mapped section
//             kws.slice(0, 4).forEach((k, i) => {
//               const kwRe = new RegExp(`(<h1>[\\s\\S]*?<\\/h1>)(\\s*<p>[\\s\\S]*?<\\/p>)`, "i");
//               const secIdx = i < sections.length ? i : sections.length - 2;
//               // lightweight presence check
//               if (!new RegExp(`>${k}<\\/strong>|>${k}<\\/a>`, "i").test(finalHtml)) {
//                 let count = -1;
//                 finalHtml = finalHtml.replace(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi, (block) => {
//                   count++;
//                   if (count !== secIdx) return block;
//                   return block.replace(/<\/p>/i, ` <strong>${k}</strong></p>`);
//                 });
//               }
//             });

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: finalHtml,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title: result.title,
//               targetUrl: urlMap[kws[0]] ?? null,
//               urlMap,
//               status: errs.length ? "failed" : "success",
//             };
//             bufferItems.push(item);
//             scheduleFlush();
//           } catch (e) {
//             failedCount++;
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += grp.length;
//             updateProgress(processedCount, keywords.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < groups.length || running.size > 0) {
//         const cur = clamp(Math.floor(concurrency), MIN, MAX);
//         while (running.size < cur && idx < groups.length) startNext();
//         if (!running.size && idx >= groups.length) break;
//         await Promise.race(Array.from(running));
//         if (failedCount > 0 && concurrency > 2) concurrency -= 0.2;
//         else if (concurrency < MAX) concurrency += 0.1;
//       }

//       flushNow();
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length, failedCount } : p
//       ));
//       const ok = keywords.length - failedCount;
//       toast.success(`Finished ${file.name}: ✅ ${ok} • ❌ ${failedCount}`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
//       ));
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
//     openContentEditor,
//   };
// }





// import { useState } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /* =========================
//    Read latest saved prefs
//    ========================= */
// const PREF_KEY = "content-preferences_v3";
// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
//   } catch { return {} as any; }
// }

// /* =========================
//    Types & Editor opener
//    ========================= */
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

// /* =========================
//    Excel parsing (keywords + optional URLs)
//    ========================= */
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
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
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
//     const mostlyText = nonEmpty.filter((c) => /[A-Za-z]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
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
//         if (s) score++;
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       if (checks === 0) continue;
//       const weighted = score * 100 + Math.min(checks, 100);
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

// /* =========================
//    HTML shaping & validation (dynamic by prefs)
//    ========================= */
// const H1_BANK = [
//   "Why This Matters",
//   "Core Features That Help",
//   "Checks That Save Time",
//   "Common Pitfalls & Fixes",
//   "Real-World Tips",
//   "Make It Stick",
// ];

// function stripTagsFast(html: string) {
//   return (html || "")
//     .replace(/<script[\s\S]*?<\/script>/gi, " ")
//     .replace(/<style[\s\S]*?<\/style>/gi, " ")
//     .replace(/<\/?[^>]+>/g, " ")
//     .replace(/&nbsp;|&#160;/g, " ")
//     .replace(/\s+/g, " ").trim();
// }
// function wordCount(s: string) {
//   const t = (s || "").replace(/\s+/g, " ").trim();
//   if (!t) return 0;
//   return t.split(/\s+/).filter(Boolean).length;
// }
// function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

// function dedupeInstructionLeaks(s: string) {
//   const lines = s.split(/\n+/).map((x) => x.trim()).filter(Boolean);
//   const out: string[] = [];
//   const drop = [
//     /^be specific and concrete/i,
//     /^in practice, aim/i,
//     /^focus on clarity/i,
//     /^do not copy or paraphrase/i,
//     /^tip:/i,
//   ];
//   const seen = new Set<string>();
//   for (const ln of lines) {
//     if (drop.some((re) => re.test(ln))) continue;
//     const key = ln.toLowerCase();
//     if (seen.has(key)) continue;
//     seen.add(key);
//     out.push(ln);
//   }
//   return out.join("\n");
// }

// function extractH1PSections(html: string) {
//   const out: { h: string; p: string }[] = [];
//   if (!html) return out;
//   const cleaned = html.replace(/\bundefined\b/gi, "");
//   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
//   let cursor = 0;
//   for (let i = 0; i < h1Matches.length; i++) {
//     const h = h1Matches[i];
//     const idx = cleaned.indexOf(h, cursor);
//     if (idx === -1) continue;
//     cursor = idx + h.length;
//     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
//     const p = pMatch ? pMatch[0] : "";
//     if (p) { out.push({ h, p }); cursor += p.length; }
//   }
//   return out;
// }

// function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number) {
//   const pairs = extractH1PSections(rawHtml);
//   if (pairs.length >= wantSections) {
//     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
//   }
//   const cleaned = dedupeInstructionLeaks(
//     rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ")
//   );
//   const words = stripTagsFast(cleaned).split(/\s+/).filter(Boolean);
//   const sections: string[] = [];
//   let idx = 0;
//   for (let s = 0; s < wantSections; s++) {
//     let take = paraMin + Math.floor(Math.random() * (paraMax - paraMin + 1));
//     if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
//     if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
//     const chunk = words.slice(idx, idx + take).join(" ").trim();
//     const h1 = H1_BANK[s % H1_BANK.length];
//     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
//     idx += take;
//   }
//   return sections;
// }

// function normalizeParagraphWordRange(html: string, minW: number, maxW: number) {
//   const parts: string[] = [];
//   const regex = /(<h1>[\s\S]*?<\/h1>)\s*(<p>[\s\S]*?<\/p>)/gi;
//   let m: RegExpExecArray | null;
//   let lastIndex = 0;

//   while ((m = regex.exec(html))) {
//     parts.push(html.slice(lastIndex, m.index));
//     const h = m[1];
//     let p = m[2];
//     const inner = stripTagsFast(p);
//     let ws = inner.split(/\s+/).filter(Boolean);
//     if (ws.length > maxW) ws = ws.slice(0, maxW);
//     if (ws.length < minW) {
//       const tail = stripTagsFast(html.slice(regex.lastIndex)).split(/\s+/).filter(Boolean);
//       const need = minW - ws.length;
//       if (tail.length >= need) ws = ws.concat(tail.slice(0, need));
//     }
//     p = `<p>${ws.join(" ")}</p>`;
//     parts.push(`${h}${p}`);
//     lastIndex = regex.lastIndex;
//   }
//   parts.push(html.slice(lastIndex));
//   return parts.join("");
// }


// function removeAllTokens(s: string) {
//   return s.replace(/\[ANCHOR:[^\]]+\]/g, "");
// }

// function distributeTokensExact(sections: string[], keywords: string[]) {
//   const N = sections.length;
//   let out = sections.map(removeAllTokens);

//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) {
//     map[0] = keywords[0];
//   } else if (keywords.length === 2) {
//     map[0] = keywords[0];
//     map[Math.min(2, N - 1)] = keywords[1];
//   } else if (keywords.length >= 4) {
//     for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i];
//   }

//   out = out.map((sec, idx) => {
//     const kw = map[idx];
//     if (!kw) return sec;
//     const token = `[ANCHOR:${kw}]`;
//     return sec.replace(/<\/p>/i, ` ${token}</p>`);
//   });
//   return out;
// }

// function applyConclusionPref(sections: string[], include: boolean, paraMin: number, paraMax: number) {
//   const noOld = sections.filter((s) => !/^<h1>\s*Conclusion\s*<\/h1>/i.test(s));
//   if (!include) return noOld;
//   const baseText = "Choose one small, testable change and run it within 24 hours—then note what happened. Track simple numbers (fit time, battery hours, minutes in noise, follow-up adjustments) and write a concrete next step. Over two or three short cycles this builds confidence without big commitments. Keep notes short, dated, and honest; aim for progress, not perfection. If a tweak fails, adjust and move again. Small, repeatable wins compound faster than perfect plans.";
//   const words = baseText.split(/\s+/).filter(Boolean);
//   const clampWords = (arr: string[]) => {
//     if (arr.length > paraMax) return arr.slice(0, paraMax);
//     if (arr.length < paraMin) {
//       const pad = Array.from({length: paraMin - arr.length}, () => "forward.");
//       return arr.concat(pad);
//     }
//     return arr;
//   };
//   const concl = `<h1>Conclusion</h1><p>${clampWords(words).join(" ")}</p>`;
//   return [...noOld, concl];
// }

// function validateHtml(html: string, keywords: string[], wantSections: number, includeConclusion: boolean, minW: number, maxW: number) {
//   const errors: string[] = [];
//   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []);
//   const conclCount = (html.match(/<h1>\s*Conclusion\s*<\/h1>/gi) || []).length;

//   const bodyCount = blocks.length - conclCount;
//   if (bodyCount !== wantSections) errors.push(`Body section count must be exactly ${wantSections} (found ${bodyCount}).`);
//   if (includeConclusion && conclCount !== 1) errors.push("Conclusion must appear exactly once.");
//   if (!includeConclusion && conclCount !== 0) errors.push("Conclusion must not be present.");

//   const paras = (html.match(/<p>[\s\S]*?<\/p>/gi) || []);
//   paras.forEach((p) => {
//     const w = wordCount(stripTagsFast(p));
//     if (w < minW || w > maxW) errors.push(`Paragraph out of range (${w} words, expected ${minW}–${maxW}).`);
//   });

//   if (includeConclusion) {
//     const ci = html.lastIndexOf("<h1>Conclusion</h1>");
//     if (ci >= 0) {
//       const slice = html.slice(ci);
//       if (/\[ANCHOR:[^\]]+\]/.test(slice)) errors.push("Tokens must not appear in Conclusion.");
//     }
//   }

//   for (const k of keywords.slice(0, 4)) {
//     const cnt = (html.match(new RegExp(`\\[ANCHOR:${k.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\]`, "g")) || []).length;
//     if (cnt !== 1) errors.push(`Token count for "${k}" must be exactly 1 (found ${cnt}).`);
//   }
//   return errors;
// }

// /* =========================
//    Grouping (normal vs custom)
//    ========================= */
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
//   // If still short (arr smaller than size), allow duplicates with replacement
//   while (out.length < size) out.push(arr[Math.floor(Math.random() * arr.length)]);
//   return out;
// }

// function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
//   const groups: KeywordRow[][] = [];
//   for (let i = 0; i < count; i++) groups.push(sampleDistinct(rows, size));
//   return groups;
// }

// /* =========================
//    Hook
//    ========================= */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       const base: ExcelProject = {
//         id: proj.id,
//         fileName: proj.fileName,
//         status: (proj as any).status ?? "pending",
//         totalKeywords: (proj as any).totalKeywords ?? 0,
//         processedKeywords: (proj as any).processedKeywords ?? 0,
//         createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//         error: (proj as any).error,
//         failedCount: (proj as any).failedCount ?? 0,
//       };
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//       return [...prev, base];
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

//     const bufferItems: ContentItem[] = [];
//     let flushTimer: number | null = null;
//     const flushNow = () => {
//       if (flushTimer != null) { clearTimeout(flushTimer as any); flushTimer = null; }
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };
//     const scheduleFlush = () => { if (flushTimer == null) flushTimer = window.setTimeout(() => flushNow(), 180); };

//     let failedCount = 0;
//     let processedCount = 0;
//     const updateProgress = (processed: number, total: number) => {
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
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

//       // Build groups
//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
//         : buildGroupsNormal(keywords, size);

//       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
//       toast.info(`Generating ${baseGroups.length} article(s) • Mode: ${size} keyword(s)/article${prefs.customModeEnabled ? " • Custom count" : ""}`);

//       // Dynamic word bounds
//       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.92);
//       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.10);
//       const wantSections = prefs.sectionCount || 5;

//       // Concurrency
//       const cpu = (navigator.hardwareConcurrency ?? 4);
//       let concurrency = clamp(Math.floor(cpu / 2), 2, 8);
//       const MIN = 1, MAX = 8;

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
//             const plan = buildPlanFromPrefs({
//               keywords: kws,
//               prefs: {
//                 ...prefs,
//                 // ensure snapshot numbers are valid
//                 sectionCount: (prefs.sectionCount as any) || 5,
//                 paragraphWords: (prefs.paragraphWords as any) || 100,
//               },
//               variationId: groupIndex + 1,
//             });

//             let result = await generateJSONTitleHtml({ keywords: kws, instructions: plan });

//             // Build → tokens → conclusion → normalize
//             let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax);
//             sections = distributeTokensExact(sections, kws);
//             sections = applyConclusionPref(sections, !!prefs.includeConclusion, paraMin, paraMax);

//             let finalHtml = normalizeParagraphWordRange(sections.join(""), paraMin, paraMax);

//             // Validate; if invalid, one repair attempt
//             let errs = validateHtml(finalHtml, kws, wantSections, !!prefs.includeConclusion, paraMin, paraMax);
//             if (errs.length > 0) {
//               const repairPlan = [
//                 plan,
//                 "",
//                 "REWRITE STRICTLY. Your previous output failed these checks:",
//                 ...errs.map((e) => `- ${e}`),
//                 "Return ONLY JSON with corrected 'html' and previous 'title'.",
//               ].join("\n");
//               result = await generateJSONTitleHtml({ keywords: kws, instructions: repairPlan });

//               sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax);
//               sections = distributeTokensExact(sections, kws);
//               sections = applyConclusionPref(sections, !!prefs.includeConclusion, paraMin, paraMax);
//               finalHtml = normalizeParagraphWordRange(sections.join(""), paraMin, paraMax);
//               errs = validateHtml(finalHtml, kws, wantSections, !!prefs.includeConclusion, paraMin, paraMax);
//             }

//             // Link tokens
//             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//             finalHtml = applyAnchorTokens(finalHtml, anchors);
//             finalHtml = removeAllTokens(finalHtml);

//             // If any keyword ended up unlinked/unbolded, enforce single bold inside its mapped section
//             kws.slice(0, 4).forEach((k, i) => {
//               if (!new RegExp(`>${k}<\\/strong>|>${k}<\\/a>`, "i").test(finalHtml)) {
//                 let count = -1;
//                 const secIdx = i < sections.length ? i : Math.max(0, sections.length - 1);
//                 finalHtml = finalHtml.replace(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi, (block) => {
//                   count++;
//                   if (count !== secIdx) return block;
//                   return block.replace(/<\/p>/i, ` <strong>${k}</strong></p>`);
//                 });
//               }
//             });

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: finalHtml,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title: result.title,
//               targetUrl: urlMap[kws[0]] ?? null,
//               urlMap,
//               status: errs.length ? "failed" : "success",
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
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = clamp(Math.floor(concurrency), MIN, MAX);
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;
//         await Promise.race(Array.from(running));
//         if (failedCount > 0 && concurrency > 2) concurrency -= 0.2;
//         else if (concurrency < MAX) concurrency += 0.1;
//       }

//       flushNow();
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
//       ));
//       const ok = baseGroups.length - failedCount;
//       toast.success(`Finished ${file.name}: ✅ ${ok} • ❌ ${failedCount}`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
//       ));
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
//     openContentEditor,
//   };
// }




// import { useState } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /* =========================
//    Read latest saved prefs
//    ========================= */
// const PREF_KEY = "content-preferences_v3";
// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
//   } catch { return {} as any; }
// }

// /* =========================
//    Types & Editor opener
//    ========================= */
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

// /* =========================
//    Excel parsing (keywords + optional URLs)
//    ========================= */
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
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
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
//     const mostlyText = nonEmpty.filter((c) => /[A-Za-z]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
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
//         if (s) score++;
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       if (checks === 0) continue;
//       const weighted = score * 100 + Math.min(checks, 100);
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

// /* =========================
//    HTML shaping & validation (dynamic by prefs)
//    ========================= */
// const H1_BANK = [
//   "Why This Matters",
//   "Core Features That Help",
//   "Checks That Save Time",
//   "Common Pitfalls & Fixes",
//   "Real-World Tips",
//   "Make It Stick",
// ];

// function stripTagsFast(html: string) {
//   return (html || "")
//     .replace(/<script[\s\S]*?<\/script>/gi, " ")
//     .replace(/<style[\s\S]*?<\/style>/gi, " ")
//     .replace(/<\/?[^>]+>/g, " ")
//     .replace(/&nbsp;|&#160;/g, " ")
//     .replace(/\s+/g, " ").trim();
// }
// function wordCount(s: string) {
//   const t = (s || "").replace(/\s+/g, " ").trim();
//   if (!t) return 0;
//   return t.split(/\s+/).filter(Boolean).length;
// }
// function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

// function dedupeInstructionLeaks(s: string) {
//   const lines = s.split(/\n+/).map((x) => x.trim()).filter(Boolean);
//   const out: string[] = [];
//   const drop = [
//     /^be specific and concrete/i,
//     /^in practice, aim/i,
//     /^focus on clarity/i,
//     /^do not copy or paraphrase/i,
//     /^tip:/i,
//   ];
//   const seen = new Set<string>();
//   for (const ln of lines) {
//     if (drop.some((re) => re.test(ln))) continue;
//     const key = ln.toLowerCase();
//     if (seen.has(key)) continue;
//     seen.add(key);
//     out.push(ln);
//   }
//   return out.join("\n");
// }

// /* --- NEW: repetition guard (kills "forward forward..." etc.) --- */
// function squashRepetition(text: string): string {
//   // 1-word stutters repeated 3+ times → keep twice
//   let out = text.replace(/(\b([a-z\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
//   // short 2–3 word phrase stutters repeated 3+ → keep twice
//   out = out.replace(/(\b[^\s<>{}]+\b(?:\s+\b[^\s<>{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
//   // trailing repeated "forward." tokens
//   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
//   return out;
// }

// /* --- helpers: language & fillers --- */
// function langCode(lang?: string): "hi" | "en" {
//   const s = (lang || "").toLowerCase();
//   if (s.includes("hi") || s.includes("hindi")) return "hi";
//   return "en";
// }
// function fillerBank(lc: "hi" | "en"): string[] {
//   return lc === "hi"
//     ? [
//         "कल अपने नोट्स दोबारा देखें।",
//         "स्थिरता रखें और थोड़ा-थोड़ा सुधार करें।",
//         "एक समय में सिर्फ़ एक बदलाव पर ध्यान दें।",
//         "थोड़ा मापें और आगे बढ़ें।",
//         "गति हल्की रखें पर जारी रखें।",
//       ]
//     : [
//         "Review your notes tomorrow.",
//         "Stay consistent and iterate.",
//         "Change only one thing at a time.",
//         "Measure briefly, then move on.",
//         "Keep momentum light but steady.",
//       ];
// }
// function conclusionSentences(lc: "hi" | "en"): string[] {
//   return lc === "hi"
//     ? [
//         "कोई एक छोटा, जाँचने योग्य बदलाव चुनें और 24 घंटे में चलाकर उसका परिणाम लिख लें।",
//         "सरल आँकड़े ट्रैक करें—फ़िट समय, बैटरी घंटे, शोर में बिताए मिनट और फ़ॉलो-अप समायोजन।",
//         "अगली ही बैठक के लिए एक ठोस अगला कदम लिखें।",
//         "दो-तीन छोटे चक्र बिना बड़े कमिटमेंट के आत्मविश्वास बनाते हैं।",
//         "नोट्स को छोटा, दिनांकित और ईमानदार रखें—लक्ष्य है प्रगति, परिपूर्णता नहीं।",
//         "अगर कोई बदलाव काम न करे, तो समायोजित करें और दोबारा प्रयास करें; छोटे-छोटे दोहराए जाने वाले जीत तेज़ी से जुड़ती हैं।",
//       ]
//     : [
//         "Choose one small, testable change and run it within 24 hours, then note what happened.",
//         "Track simple numbers like fit time, battery hours, minutes in noise, and follow-up adjustments.",
//         "Write a concrete next step for the very next session.",
//         "Two or three short cycles build confidence without big commitments.",
//         "Keep notes short, dated, and honest—aim for progress, not perfection.",
//         "If a tweak fails, adjust and try again; small repeatable wins compound quickly.",
//       ];
// }

// /* Keep H1+P pairs if present; else synthesize evenly from words (already de-noised) */
// function extractH1PSections(html: string) {
//   const out: { h: string; p: string }[] = [];
//   if (!html) return out;
//   const cleaned = html.replace(/\bundefined\b/gi, "");
//   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
//   let cursor = 0;
//   for (let i = 0; i < h1Matches.length; i++) {
//     const h = h1Matches[i];
//     const idx = cleaned.indexOf(h, cursor);
//     if (idx === -1) continue;
//     cursor = idx + h.length;
//     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
//     const p = pMatch ? pMatch[0] : "";
//     if (p) { out.push({ h, p }); cursor += p.length; }
//   }
//   return out;
// }

// function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number) {
//   const pairs = extractH1PSections(rawHtml);
//   if (pairs.length >= wantSections) {
//     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
//   }
//   const cleaned = dedupeInstructionLeaks(
//     rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ")
//   );
//   const words = stripTagsFast(squashRepetition(cleaned)).split(/\s+/).filter(Boolean);
//   const sections: string[] = [];
//   let idx = 0;
//   for (let s = 0; s < wantSections; s++) {
//     let take = paraMin + Math.floor(Math.random() * (paraMax - paraMin + 1));
//     if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
//     if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
//     const chunk = words.slice(idx, idx + take).join(" ").trim();
//     const h1 = H1_BANK[s % H1_BANK.length];
//     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
//     idx += take;
//   }
//   return sections;
// }

// /* --- FIX: normalize each paragraph locally; never borrow tail text from later sections --- */
// function normalizeParagraphWordRange(html: string, minW: number, maxW: number, language?: string) {
//   const lc = langCode(language);
//   const fillers = fillerBank(lc);
//   const parts: string[] = [];
//   const regex = /(<h1>[\s\S]*?<\/h1>)\s*(<p>[\s\S]*?<\/p>)/gi;
//   let m: RegExpExecArray | null;
//   let lastIndex = 0;

//   while ((m = regex.exec(html))) {
//     parts.push(html.slice(lastIndex, m.index));
//     const h = m[1];
//     let p = m[2];

//     // inner text, de-stutter
//     let inner = stripTagsFast(p);
//     inner = squashRepetition(inner);

//     let ws = inner.split(/\s+/).filter(Boolean);
//     if (ws.length > maxW) {
//       ws = ws.slice(0, maxW);
//     } else if (ws.length < minW) {
//       let i = 0;
//       while (ws.length < minW && i < 60) {
//         ws = ws.concat(fillers[i % fillers.length].split(/\s+/));
//         i++;
//       }
//       if (ws.length > maxW) ws = ws.slice(0, maxW);
//     }

//     p = `<p>${ws.join(" ")}</p>`;
//     parts.push(`${h}${p}`);
//     lastIndex = regex.lastIndex;
//   }
//   parts.push(html.slice(lastIndex));
//   return parts.join("");
// }

// function removeAllTokens(s: string) {
//   return s.replace(/\[ANCHOR:[^\]]+\]/g, "");
// }

// /* body sanitize: strip stray 'Conclusion/निष्कर्ष' prefixes and stutters inside body paragraphs */
// function sanitizeBodySections(sections: string[]) {
//   return sections.map((sec) => {
//     if (/^<h1>\s*Conclusion\s*<\/h1>/i.test(sec)) return sec;
//     return sec.replace(/(<p>)([\s\S]*?)(<\/p>)/i, (_m, open, inner, close) => {
//       let t = inner.replace(/^\s*(?:Conclusion|निष्कर्ष)\s*[:\-–—]?\s*/i, "");
//       t = squashRepetition(t);
//       return `${open}${t}${close}`;
//     });
//   });
// }

// /* original token distribution; we’ll compute the same map again later for enforcement */
// function distributeTokensExact(sections: string[], keywords: string[]) {
//   const N = sections.length;
//   let out = sections.map(removeAllTokens);
//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) {
//     map[0] = keywords[0];
//   } else if (keywords.length === 2) {
//     map[0] = keywords[0];
//     map[Math.min(2, N - 1)] = keywords[1];
//   } else if (keywords.length >= 4) {
//     for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i];
//   }
//   out = out.map((sec, idx) => {
//     const kw = map[idx];
//     if (!kw) return sec;
//     const token = `[ANCHOR:${kw}]`;
//     return sec.replace(/<\/p>/i, ` ${token}</p>`);
//   });
//   return out;
// }
// /* recreate the same section→keyword map used above, for enforcement */
// function computeSectionKeywordMap(N: number, keywords: string[]) {
//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) {
//     map[0] = keywords[0];
//   } else if (keywords.length === 2) {
//     map[0] = keywords[0];
//     map[Math.min(2, N - 1)] = keywords[1];
//   } else if (keywords.length >= 4) {
//     for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i];
//   }
//   return map;
// }

// /* --- NEW: build conclusion in chosen language; no "forward." padding --- */
// function applyConclusionPref(sections: string[], include: boolean, paraMin: number, paraMax: number, language?: string) {
//   const noOld = sections.filter((s) => !/^<h1>\s*Conclusion\s*<\/h1>/i.test(s));
//   if (!include) return noOld;

//   const lc = langCode(language);
//   const base = conclusionSentences(lc).join(" ");
//   const fillers = fillerBank(lc);

//   let words = squashRepetition(base).split(/\s+/).filter(Boolean);
//   let i = 0;
//   while (words.length < paraMin && i < 60) {
//     words = words.concat(fillers[i % fillers.length].split(/\s+/));
//     i++;
//   }
//   if (words.length > paraMax) words = words.slice(0, paraMax);

//   const paragraph = squashRepetition(words.join(" "));
//   const concl = `<h1>Conclusion</h1><p>${paragraph}</p>`;
//   return [...noOld, concl];
// }

// /* enforce at most one keyword anchor/bold per paragraph (others → plain text) */
// function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
//   const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
//   let idx = 0;
//   let result = html;
//   for (const block of blocks) {
//     const allowed = sectionMap[idx++] || "";
//     if (!allowed) continue;

//     let replaced = block;

//     // unwrap anchors/strong of disallowed keywords
//     for (const k of keywords) {
//       if (k === allowed) continue;
//       const aRe = new RegExp(`<a[^>]*>\\s*(${esc(k)})\\s*<\\/a>`, "gi");
//       const bRe = new RegExp(`<strong>\\s*(${esc(k)})\\s*<\\/strong>`, "gi");
//       replaced = replaced.replace(aRe, "$1").replace(bRe, "$1");
//     }

//     // if multiple anchors for allowed, keep first, unwrap the rest
//     const allowedA = new RegExp(`<a[^>]*>\\s*(${esc(allowed)})\\s*<\\/a>`, "gi");
//     let seen = 0;
//     replaced = replaced.replace(allowedA, (_m, g1) => (++seen === 1 ? _m : g1));

//     // same for <strong> of allowed
//     const allowedB = new RegExp(`<strong>\\s*(${esc(allowed)})\\s*<\\/strong>`, "gi");
//     seen = 0;
//     replaced = replaced.replace(allowedB, (_m, g1) => (++seen === 1 ? _m : g1));

//     result = result.replace(block, replaced);
//   }
//   return result;
// }

// function validateHtml(html: string, keywords: string[], wantSections: number, includeConclusion: boolean, minW: number, maxW: number) {
//   const errors: string[] = [];
//   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []);
//   const conclCount = (html.match(/<h1>\s*Conclusion\s*<\/h1>/gi) || []).length;

//   const bodyCount = blocks.length - conclCount;
//   if (bodyCount !== wantSections) errors.push(`Body section count must be exactly ${wantSections} (found ${bodyCount}).`);
//   if (includeConclusion && conclCount !== 1) errors.push("Conclusion must appear exactly once.");
//   if (!includeConclusion && conclCount !== 0) errors.push("Conclusion must not be present.");

//   const paras = (html.match(/<p>[\s\S]*?<\/p>/gi) || []);
//   paras.forEach((p) => {
//     const w = wordCount(stripTagsFast(p));
//     if (w < minW || w > maxW) errors.push(`Paragraph out of range (${w} words, expected ${minW}–${maxW}).`);
//   });

//   if (includeConclusion) {
//     const ci = html.lastIndexOf("<h1>Conclusion</h1>");
//     if (ci >= 0) {
//       const slice = stripTagsFast(html.slice(ci));
//       if (/\[ANCHOR:[^\]]+\]/.test(slice)) errors.push("Tokens must not appear in Conclusion.");
//       if (/(?:\b([a-z\u0900-\u097f]{2,})\b\.?)(?:\s+\1){2,}/i.test(slice)) {
//         errors.push("Conclusion contains repeated word stutter.");
//       }
//     }
//   }

//   for (const k of keywords.slice(0, 4)) {
//     const cnt = (html.match(new RegExp(`\\[ANCHOR:${k.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\]`, "g")) || []).length;
//     if (cnt !== 1) errors.push(`Token count for "${k}" must be exactly 1 (found ${cnt}).`);
//   }
//   return errors;
// }

// /* =========================
//    Grouping (normal vs custom)
//    ========================= */
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

// /* =========================
//    Hook
//    ========================= */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       const base: ExcelProject = {
//         id: proj.id,
//         fileName: proj.fileName,
//         status: (proj as any).status ?? "pending",
//         totalKeywords: (proj as any).totalKeywords ?? 0,
//         processedKeywords: (proj as any).processedKeywords ?? 0,
//         createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//         error: (proj as any).error,
//         failedCount: (proj as any).failedCount ?? 0,
//       };
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//       return [...prev, base];
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

//     const bufferItems: ContentItem[] = [];
//     let flushTimer: number | null = null;
//     const flushNow = () => {
//       if (flushTimer != null) { clearTimeout(flushTimer as any); flushTimer = null; }
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };
//     const scheduleFlush = () => { if (flushTimer == null) flushTimer = window.setTimeout(() => flushNow(), 180); };

//     let failedCount = 0;
//     let processedCount = 0;
//     const updateProgress = (processed: number, total: number) => {
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
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

//       // Build groups
//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
//         : buildGroupsNormal(keywords, size);

//       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
//       toast.info(`Generating ${baseGroups.length} article(s) • Mode: ${size} keyword(s)/article${prefs.customModeEnabled ? " • Custom count" : ""}`);

//       // Dynamic word bounds
//       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.92);
//       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.10);
//       const wantSections = prefs.sectionCount || 5;

//       // Concurrency
//       const cpu = (navigator.hardwareConcurrency ?? 4);
//       let concurrency = clamp(Math.floor(cpu / 2), 2, 8);
//       const MIN = 1, MAX = 8;

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
//             const plan = buildPlanFromPrefs({
//               keywords: kws,
//               prefs: {
//                 ...prefs,
//                 // ensure snapshot numbers are valid
//                 sectionCount: (prefs.sectionCount as any) || 5,
//                 paragraphWords: (prefs.paragraphWords as any) || 100,
//               },
//               variationId: groupIndex + 1,
//             });

//             let result = await generateJSONTitleHtml({ keywords: kws, instructions: plan });

//             // Build → tokens → sanitize → conclusion (localized) → normalize (localized)
//             let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax);
//             sections = distributeTokensExact(sections, kws);
//             sections = sanitizeBodySections(sections);
//             sections = applyConclusionPref(sections, !!prefs.includeConclusion, paraMin, paraMax, prefs.language);

//             let finalHtml = normalizeParagraphWordRange(sections.join(""), paraMin, paraMax, prefs.language);
//             finalHtml = squashRepetition(finalHtml);

//             // Validate; if invalid, one repair attempt
//             let errs = validateHtml(finalHtml, kws, wantSections, !!prefs.includeConclusion, paraMin, paraMax);
//             if (errs.length > 0) {
//               const repairPlan = [
//                 plan,
//                 "",
//                 "REWRITE STRICTLY. Your previous output failed these checks:",
//                 ...errs.map((e) => `- ${e}`),
//                 "Return ONLY JSON with corrected 'html' and previous 'title'.",
//               ].join("\n");
//               result = await generateJSONTitleHtml({ keywords: kws, instructions: repairPlan });

//               sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax);
//               sections = distributeTokensExact(sections, kws);
//               sections = sanitizeBodySections(sections);
//               sections = applyConclusionPref(sections, !!prefs.includeConclusion, paraMin, paraMax, prefs.language);
//               finalHtml = normalizeParagraphWordRange(sections.join(""), paraMin, paraMax, prefs.language);
//               finalHtml = squashRepetition(finalHtml);
//               errs = validateHtml(finalHtml, kws, wantSections, !!prefs.includeConclusion, paraMin, paraMax);
//             }

//             // Link tokens (only for our [ANCHOR:] placeholders)
//             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//             finalHtml = applyAnchorTokens(finalHtml, anchors);
//             finalHtml = removeAllTokens(finalHtml);

//             // Enforce one keyword anchor/bold per paragraph
//             const secMap = computeSectionKeywordMap((finalHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length - (finalHtml.match(/<h1>\s*Conclusion\s*<\/h1>/gi)?.length || 0), kws);
//             finalHtml = enforceSingleKeywordPerParagraph(finalHtml, kws, secMap);

//             // If any mapped keyword still ended up unlinked/unbolded, enforce single bold in its section
//             kws.slice(0, 4).forEach((k, i) => {
//               if (!new RegExp(`>${k}<\\/strong>|>${k}<\\/a>`, "i").test(finalHtml)) {
//                 let count = -1;
//                 const secIdx = i;
//                 finalHtml = finalHtml.replace(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi, (block) => {
//                   count++;
//                   if (count !== secIdx) return block;
//                   return block.replace(/<\/p>/i, ` <strong>${k}</strong></p>`);
//                 });
//               }
//             });

//             // Final de-stutter everywhere
//             finalHtml = squashRepetition(finalHtml);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: finalHtml,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title: result.title,
//               targetUrl: urlMap[kws[0]] ?? null,
//               urlMap,
//               status: errs.length ? "failed" : "success",
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
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = clamp(Math.floor(concurrency), MIN, MAX);
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;
//         await Promise.race(Array.from(running));
//         if (failedCount > 0 && concurrency > 2) concurrency -= 0.2;
//         else if (concurrency < MAX) concurrency += 0.1;
//       }

//       flushNow();
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
//       ));
//       const ok = baseGroups.length - failedCount;
//       toast.success(`Finished ${file.name}: ✅ ${ok} • ❌ ${failedCount}`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
//       ));
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
//     openContentEditor,
//   };
// }


// import { useState } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /* =========================
//    Read latest saved prefs
//    ========================= */
// const PREF_KEY = "content-preferences_v3";
// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
//   } catch { return {} as any; }
// }

// /* =========================
//    Types & Editor opener
//    ========================= */
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

// /* =========================
//    Excel parsing (keywords + optional URLs)
//    ========================= */
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
//   if ((v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length < 2) return "";
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
//     const mostlyText = nonEmpty.filter((c) => /[A-Za-z]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
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
//         if (s) score++;
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       if (checks === 0) continue;
//       const weighted = score * 100 + Math.min(checks, 100);
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

// /* =========================
//    HTML shaping & validation (dynamic by prefs)
//    ========================= */
// const H1_BANK = [
//   "Why This Matters",
//   "Core Features That Help",
//   "Checks That Save Time",
//   "Common Pitfalls & Fixes",
//   "Real-World Tips",
//   "Make It Stick",
// ];

// function stripTagsFast(html: string) {
//   return (html || "")
//     .replace(/<script[\s\S]*?<\/script>/gi, " ")
//     .replace(/<style[\s\S]*?<\/style>/gi, " ")
//     .replace(/<\/?[^>]+>/g, " ")
//     .replace(/&nbsp;|&#160;/g, " ")
//     .replace(/\s+/g, " ").trim();
// }
// function wordCount(s: string) {
//   const t = (s || "").replace(/\s+/g, " ").trim();
//   if (!t) return 0;
//   return t.split(/\s+/).filter(Boolean).length;
// }
// function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

// function dedupeInstructionLeaks(s: string) {
//   const lines = s.split(/\n+/).map((x) => x.trim()).filter(Boolean);
//   const out: string[] = [];
//   const drop = [
//     /^be specific and concrete/i,
//     /^in practice, aim/i,
//     /^focus on clarity/i,
//     /^do not copy or paraphrase/i,
//     /^tip:/i,
//   ];
//   const seen = new Set<string>();
//   for (const ln of lines) {
//     if (drop.some((re) => re.test(ln))) continue;
//     const key = ln.toLowerCase();
//     if (seen.has(key)) continue;
//     seen.add(key);
//     out.push(ln);
//   }
//   return out.join("\n");
// }

// /* --- NEW: repetition guard (kills "forward forward..." etc.) --- */
// function squashRepetition(text: string): string {
//   // 1-word stutters repeated 3+ times → keep twice
//   let out = text.replace(/(\b([a-z\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
//   // short 2–3 word phrase stutters repeated 3+ → keep twice
//   out = out.replace(/(\b[^\s<>{}]+\b(?:\s+\b[^\s<>{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
//   // trailing repeated "forward." tokens
//   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
//   return out;
// }

// /* Keep H1+P pairs if present; else synthesize evenly from words (already de-noised) */
// function extractH1PSections(html: string) {
//   const out: { h: string; p: string }[] = [];
//   if (!html) return out;
//   const cleaned = html.replace(/\bundefined\b/gi, "");
//   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
//   let cursor = 0;
//   for (let i = 0; i < h1Matches.length; i++) {
//     const h = h1Matches[i];
//     const idx = cleaned.indexOf(h, cursor);
//     if (idx === -1) continue;
//     cursor = idx + h.length;
//     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
//     const p = pMatch ? pMatch[0] : "";
//     if (p) { out.push({ h, p }); cursor += p.length; }
//   }
//   return out;
// }

// function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number) {
//   const pairs = extractH1PSections(rawHtml);
//   if (pairs.length >= wantSections) {
//     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
//   }
//   const cleaned = dedupeInstructionLeaks(
//     rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ")
//   );
//   const words = stripTagsFast(squashRepetition(cleaned)).split(/\s+/).filter(Boolean);
//   const sections: string[] = [];
//   let idx = 0;
//   for (let s = 0; s < wantSections; s++) {
//     let take = paraMin + Math.floor(Math.random() * (paraMax - paraMin + 1));
//     if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
//     if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
//     const chunk = words.slice(idx, idx + take).join(" ").trim();
//     const h1 = H1_BANK[s % H1_BANK.length];
//     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
//     idx += take;
//   }
//   return sections;
// }

// /* --- FIX: normalize each paragraph locally; optional padding (off for conclusion) --- */
// function langCode(lang?: string): "hi" | "en" {
//   const s = (lang || "").toLowerCase();
//   if (s.includes("hi") || s.includes("hindi")) return "hi";
//   return "en";
// }
// function fillerBank(lc: "hi" | "en"): string[] {
//   return lc === "hi"
//     ? [
//         "कल अपने नोट्स दोबारा देखें।",
//         "स्थिरता रखें और थोड़ा-थोड़ा सुधार करें।",
//         "एक समय में सिर्फ़ एक बदलाव पर ध्यान दें।",
//         "थोड़ा मापें और आगे बढ़ें।",
//         "गति हल्की रखें पर जारी रखें।",
//       ]
//     : [
//         "Review your notes tomorrow.",
//         "Stay consistent and iterate.",
//         "Change only one thing at a time.",
//         "Measure briefly, then move on.",
//         "Keep momentum light but steady.",
//       ];
// }

// function normalizeParagraphWordRange(
//   html: string,
//   minW: number,
//   maxW: number,
//   language?: string,
//   pad: boolean = true
// ) {
//   const lc = langCode(language);
//   const fillers = fillerBank(lc);
//   const parts: string[] = [];
//   const regex = /(<h1>[\s\S]*?<\/h1>)\s*(<p>[\s\S]*?<\/p>)/gi;
//   let m: RegExpExecArray | null;
//   let lastIndex = 0;

//   while ((m = regex.exec(html))) {
//     parts.push(html.slice(lastIndex, m.index));
//     const h = m[1];
//     let p = m[2];

//     // inner text, de-stutter
//     let inner = stripTagsFast(p);
//     inner = squashRepetition(inner);

//     let ws = inner.split(/\s+/).filter(Boolean);
//     if (ws.length > maxW) {
//       ws = ws.slice(0, maxW);
//     } else if (pad && ws.length < minW) {
//       let i = 0;
//       while (ws.length < minW && i < 60) {
//         ws = ws.concat(fillers[i % fillers.length].split(/\s+/));
//         i++;
//       }
//       if (ws.length > maxW) ws = ws.slice(0, maxW);
//     }
//     p = `<p>${ws.join(" ")}</p>`;
//     parts.push(`${h}${p}`);
//     lastIndex = regex.lastIndex;
//   }
//   parts.push(html.slice(lastIndex));
//   return parts.join("");
// }

// function removeAllTokens(s: string) {
//   return s.replace(/\[ANCHOR:[^\]]+\]/g, "");
// }

// /* body sanitize: strip stray 'Conclusion/निष्कर्ष' prefixes and stutters inside body paragraphs */
// function sanitizeBodySections(sections: string[]) {
//   return sections.map((sec) => {
//     if (/^<h1>\s*Conclusion\s*<\/h1>/i.test(sec)) return sec;
//     return sec.replace(/(<p>)([\s\S]*?)(<\/p>)/i, (_m, open, inner, close) => {
//       let t = inner.replace(/^\s*(?:Conclusion|निष्कर्ष|समापन)\s*[:\-–—]?\s*/i, "");
//       t = squashRepetition(t);
//       return `${open}${t}${close}`;
//     });
//   });
// }

// /* original token distribution */
// function distributeTokensExact(sections: string[], keywords: string[]) {
//   const N = sections.length;
//   let out = sections.map(removeAllTokens);

//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) {
//     map[0] = keywords[0];
//   } else if (keywords.length === 2) {
//     map[0] = keywords[0];
//     map[Math.min(2, N - 1)] = keywords[1];
//   } else if (keywords.length >= 4) {
//     for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i];
//   }

//   out = out.map((sec, idx) => {
//     const kw = map[idx];
//     if (!kw) return sec;
//     const token = `[ANCHOR:${kw}]`;
//     return sec.replace(/<\/p>/i, ` ${token}</p>`);
//   });
//   return out;
// }
// /* recreate the same section→keyword map used above, for enforcement */
// function computeSectionKeywordMap(N: number, keywords: string[]) {
//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) {
//     map[0] = keywords[0];
//   } else if (keywords.length === 2) {
//     map[0] = keywords[0];
//     map[Math.min(2, N - 1)] = keywords[1];
//   } else if (keywords.length >= 4) {
//     for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i];
//   }
//   return map;
// }

// /* --- NEW: keep LLM-provided conclusion if present (no injection) --- */
// function findModelConclusion(rawHtml: string) {
//   if (!rawHtml) return "";
//   // one <h1>Conclusion|निष्कर्ष|समापन</h1> + the first <p> after it
//   const m = rawHtml.match(/<h1>\s*(?:Conclusion|निष्कर्ष|समापन)\s*<\/h1>\s*<p>[\s\S]*?<\/p>/i);
//   return m ? squashRepetition(m[0]) : "";
// }

// /* enforce at most one keyword anchor/bold per paragraph (others → plain text) */
// function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
//   const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
//   let idx = 0;
//   let result = html;
//   for (const block of blocks) {
//     const allowed = sectionMap[idx++] || "";
//     if (!allowed) continue;

//     let replaced = block;

//     // unwrap anchors/strong of disallowed keywords
//     for (const k of keywords) {
//       if (k === allowed) continue;
//       const aRe = new RegExp(`<a[^>]*>\\s*(${esc(k)})\\s*<\\/a>`, "gi");
//       const bRe = new RegExp(`<strong>\\s*(${esc(k)})\\s*<\\/strong>`, "gi");
//       replaced = replaced.replace(aRe, "$1").replace(bRe, "$1");
//     }

//     // if multiple anchors/strong for allowed, keep first only
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

// /* --- VALIDATION: body only (no conclusion checks) --- */
// function validateHtml(
//   html: string,                // pass ONLY body sections here
//   keywords: string[],
//   wantSections: number,
//   _includeConclusion: boolean, // unused now
//   minW: number,
//   maxW: number
// ) {
//   const errors: string[] = [];
//   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []);
//   const bodyCount = blocks.length;
//   if (bodyCount !== wantSections) errors.push(`Body section count must be exactly ${wantSections} (found ${bodyCount}).`);

//   const paras = (html.match(/<p>[\s\S]*?<\/p>/gi) || []);
//   paras.forEach((p) => {
//     const w = wordCount(stripTagsFast(p));
//     if (w < minW || w > maxW) errors.push(`Paragraph out of range (${w} words, expected ${minW}–${maxW}).`);
//   });

//   for (const k of keywords.slice(0, 4)) {
//     const cnt = (html.match(new RegExp(`\\[ANCHOR:${k.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\]`, "g")) || []).length;
//     if (cnt !== 1) errors.push(`Token count for "${k}" must be exactly 1 (found ${cnt}).`);
//   }
//   return errors;
// }

// /* =========================
//    Grouping (normal vs custom)
//    ========================= */
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

// /* =========================
//    Hook
//    ========================= */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       const base: ExcelProject = {
//         id: proj.id,
//         fileName: proj.fileName,
//         status: (proj as any).status ?? "pending",
//         totalKeywords: (proj as any).totalKeywords ?? 0,
//         processedKeywords: (proj as any).processedKeywords ?? 0,
//         createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//         error: (proj as any).error,
//         failedCount: (proj as any).failedCount ?? 0,
//       };
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//       return [...prev, base];
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

//     const bufferItems: ContentItem[] = [];
//     let flushTimer: number | null = null;
//     const flushNow = () => {
//       if (flushTimer != null) { clearTimeout(flushTimer as any); flushTimer = null; }
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };
//     const scheduleFlush = () => { if (flushTimer == null) flushTimer = window.setTimeout(() => flushNow(), 180); };

//     let failedCount = 0;
//     let processedCount = 0;
//     const updateProgress = (processed: number, total: number) => {
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
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

//       // Build groups
//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
//         : buildGroupsNormal(keywords, size);

//       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
//       toast.info(`Generating ${baseGroups.length} article(s) • Mode: ${size} keyword(s)/article${prefs.customModeEnabled ? " • Custom count" : ""}`);

//       // Dynamic word bounds
//       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.92);
//       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.10);
//       const wantSections = prefs.sectionCount || 5;

//       // Concurrency
//       const cpu = (navigator.hardwareConcurrency ?? 4);
//       let concurrency = clamp(Math.floor(cpu / 2), 2, 8);
//       const MIN = 1, MAX = 8;

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
//             const plan = buildPlanFromPrefs({
//               keywords: kws,
//               prefs: {
//                 ...prefs,
//                 // ensure snapshot numbers are valid
//                 sectionCount: (prefs.sectionCount as any) || 5,
//                 paragraphWords: (prefs.paragraphWords as any) || 100,
//               },
//               variationId: groupIndex + 1,
//             });

//             let result = await generateJSONTitleHtml({ keywords: kws, instructions: plan });

//             // Build body → tokens → sanitize → normalize body (pad allowed)
//             let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax);
//             sections = distributeTokensExact(sections, kws);
//             sections = sanitizeBodySections(sections);

//             // Keep conclusion from model (optional)
//             const modelConclusion = prefs.includeConclusion ? findModelConclusion(result.html) : "";

//             // Normalize body
//             let bodyHtml = normalizeParagraphWordRange(sections.join(""), paraMin, paraMax, prefs.language, true);
//             bodyHtml = squashRepetition(bodyHtml);

//             // Validate ONLY body
//             let errs = validateHtml(bodyHtml, kws, wantSections, false, paraMin, paraMax);
//             if (errs.length > 0) {
//               const repairPlan = [
//                 plan, "",
//                 "REWRITE STRICTLY. Your previous output failed these checks:",
//                 ...errs.map((e) => `- ${e}`),
//                 "Return ONLY JSON with corrected 'html' and previous 'title'.",
//               ].join("\n");
//               result = await generateJSONTitleHtml({ keywords: kws, instructions: repairPlan });

//               // rebuild after repair
//               sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax);
//               sections = distributeTokensExact(sections, kws);
//               sections = sanitizeBodySections(sections);
//               bodyHtml = normalizeParagraphWordRange(sections.join(""), paraMin, paraMax, prefs.language, true);
//               bodyHtml = squashRepetition(bodyHtml);
//               errs = validateHtml(bodyHtml, kws, wantSections, false, paraMin, paraMax);
//             }

//             // assemble: body + (optional LLM conclusion - no padding, only trim)
//             let finalHtml = bodyHtml;
//             if (prefs.includeConclusion && modelConclusion) {
//               const normalizedConclusion = normalizeParagraphWordRange(modelConclusion, paraMin, paraMax, prefs.language, false);
//               finalHtml += normalizedConclusion;
//             }

//             // Link tokens (only for our [ANCHOR:] placeholders)
//             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//             finalHtml = applyAnchorTokens(finalHtml, anchors);
//             finalHtml = removeAllTokens(finalHtml);

//             // Enforce one keyword anchor/bold per BODY paragraph (skip conclusion)
//             const secMap = computeSectionKeywordMap(sections.length, kws);
//             finalHtml = enforceSingleKeywordPerParagraph(finalHtml, kws, secMap);

//             // If any mapped keyword still ended up unlinked/unbolded, enforce single bold in its section
//             kws.slice(0, 4).forEach((k, i) => {
//               if (!new RegExp(`>${k}<\\/strong>|>${k}<\\/a>`, "i").test(finalHtml)) {
//                 let count = -1;
//                 const secIdx = i;
//                 finalHtml = finalHtml.replace(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi, (block) => {
//                   count++;
//                   if (count !== secIdx) return block;
//                   return block.replace(/<\/p>/i, ` <strong>${k}</strong></p>`);
//                 });
//               }
//             });

//             // Final de-stutter everywhere
//             finalHtml = squashRepetition(finalHtml);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: finalHtml,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title: result.title,
//               targetUrl: urlMap[kws[0]] ?? null,
//               urlMap,
//               status: errs.length ? "failed" : "success",
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
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = clamp(Math.floor(concurrency), MIN, MAX);
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;
//         await Promise.race(Array.from(running));
//         if (failedCount > 0 && concurrency > 2) concurrency -= 0.2;
//         else if (concurrency < MAX) concurrency += 0.1;
//       }

//       flushNow();
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
//       ));
//       const ok = baseGroups.length - failedCount;
//       toast.success(`Finished ${file.name}: ✅ ${ok} • ❌ ${failedCount}`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
//       ));
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
//     openContentEditor,
//   };
// }



// import { useState } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /* =========================
//    Read latest saved prefs
//    ========================= */
// const PREF_KEY = "content-preferences_v3";
// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
//   } catch { return {} as any; }
// }

// /* =========================
//    Types & Editor opener
//    ========================= */
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

// /* =========================
//    Excel parsing (keywords + optional URLs)
//    ========================= */
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
//   if ((v.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F]/g) || []).length < 2) return "";
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
//         if (s) score++;
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       if (checks === 0) continue;
//       const weighted = score * 100 + Math.min(checks, 100);
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

// /* =========================
//    Language helpers & H1 banks
//    ========================= */
// type LangCode = "en" | "hi" | "ru";
// function lcOf(pref?: string): LangCode {
//   const t = (pref || "").toLowerCase();
//   if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
//   if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
//   return "en";
// }
// function getH1Bank(lc: LangCode): string[] {
//   if (lc === "ru") {
//     return ["Почему это важно", "Полезные особенности", "Что проверить заранее", "Типичные ошибки и решения", "Практические советы", "Как закрепить результат"];
//   }
//   if (lc === "hi") {
//     return ["क्यों यह महत्वपूर्ण है", "मदद करने वाली मुख्य बातें", "समय बचाने वाले जाँच-बिंदु", "सामान्य गलतियाँ और उपाय", "व्यावहारिक सुझाव", "सीख को स्थायी बनाएं"];
//   }
//   return ["Why This Matters","Core Features That Help","Checks That Save Time","Common Pitfalls & Fixes","Real-World Tips","Make It Stick"];
// }
// function conclusionHead(lc: LangCode): string {
//   return lc === "ru" ? "Заключение" : lc === "hi" ? "निष्कर्ष" : "Conclusion";
// }
// function stripTagsFast(html: string) {
//   return (html || "")
//     .replace(/<script[\s\S]*?<\/script>/gi, " ")
//     .replace(/<style[\s\S]*?<\/style>/gi, " ")
//     .replace(/<\/?[^>]+>/g, " ")
//     .replace(/&nbsp;|&#160;/g, " ")
//     .replace(/\s+/g, " ").trim();
// }
// function wordCount(s: string) {
//   const t = (s || "").replace(/\s+/g, " ").trim();
//   if (!t) return 0;
//   return t.split(/\s+/).filter(Boolean).length;
// }
// function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
// function dedupeInstructionLeaks(s: string) {
//   const lines = s.split(/\n+/).map((x) => x.trim()).filter(Boolean);
//   const out: string[] = [];
//   const drop = [/^be specific and concrete/i,/^in practice, aim/i,/^focus on clarity/i,/^do not copy or paraphrase/i,/^tip:/i];
//   const seen = new Set<string>();
//   for (const ln of lines) {
//     if (drop.some((re) => re.test(ln))) continue;
//     const key = ln.toLowerCase();
//     if (seen.has(key)) continue;
//     seen.add(key);
//     out.push(ln);
//   }
//   return out.join("\n");
// }

// /* =========================
//    Repetition guard
//    ========================= */
// function squashRepetition(text: string): string {
//   let out = text.replace(/(\b([a-z\u0400-\u04ff\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
//   out = out.replace(/(\b[^\s<>{}]+\b(?:\s+\b[^\s<>{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
//   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
//   return out;
// }

// /* =========================
//    Language detection (script-based, strong heuristic)
//    ========================= */
// type Script = "latin" | "cyrillic" | "devanagari";
// function detectScript(s: string): Script {
//   const t = stripTagsFast(s);
//   let lat = 0, cyr = 0, dev = 0;
//   for (const ch of t) {
//     const code = ch.charCodeAt(0);
//     if ((code >= 0x0041 && code <= 0x02AF) || (code >= 0x1E00 && code <= 0x1EFF)) lat++;
//     else if (code >= 0x0400 && code <= 0x04FF) cyr++;
//     else if (code >= 0x0900 && code <= 0x097F) dev++;
//   }
//   const total = lat + cyr + dev || 1;
//   if (cyr / total >= 0.6) return "cyrillic";
//   if (dev / total >= 0.6) return "devanagari";
//   return "latin";
// }
// function expectScript(lc: LangCode): Script {
//   return lc === "ru" ? "cyrillic" : lc === "hi" ? "devanagari" : "latin";
// }

// /* =========================
//    H1/P extraction & shaping
//    ========================= */
// function extractH1PSections(html: string) {
//   const out: { h: string; p: string }[] = [];
//   if (!html) return out;
//   const cleaned = html.replace(/\bundefined\b/gi, "");
//   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
//   let cursor = 0;
//   for (let i = 0; i < h1Matches.length; i++) {
//     const h = h1Matches[i];
//     const idx = cleaned.indexOf(h, cursor);
//     if (idx === -1) continue;
//     cursor = idx + h.length;
//     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
//     const p = pMatch ? pMatch[0] : "";
//     if (p) { out.push({ h, p }); cursor += p.length; }
//   }
//   return out;
// }

// function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number, lc: LangCode) {
//   const pairs = extractH1PSections(rawHtml);
//   if (pairs.length >= wantSections) {
//     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
//   }
//   const cleaned = dedupeInstructionLeaks(
//     rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ")
//   );
//   const words = stripTagsFast(squashRepetition(cleaned)).split(/\s+/).filter(Boolean);
//   const sections: string[] = [];
//   let idx = 0;
//   const BANK = getH1Bank(lc);
//   for (let s = 0; s < wantSections; s++) {
//     let take = paraMin + Math.floor(Math.random() * (paraMax - paraMin + 1));
//     if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
//     if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
//     const chunk = words.slice(idx, idx + take).join(" ").trim();
//     const h1 = BANK[s % BANK.length];
//     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
//     idx += take;
//   }
//   return sections;
// }

// function fillerBank(lc: LangCode): string[] {
//   if (lc === "ru") {
//     return [
//       "Завтра пересмотрите заметки.",
//       "Сохраняйте последовательность и шаг за шагом улучшайте.",
//       "Меняйте только одну вещь за раз.",
//       "Коротко измерьте результат и двигайтесь дальше.",
//       "Стабильно поддерживайте темп.",
//     ];
//   }
//   if (lc === "hi") {
//     return [
//       "कल अपने नोट्स दोबारा देखें।",
//       "स्थिरता रखें और थोड़ा-थोड़ा सुधार करें।",
//       "एक समय में सिर्फ़ एक बदलाव पर ध्यान दें।",
//       "थोड़ा मापें और आगे बढ़ें।",
//       "गति हल्की रखें पर जारी रखें।",
//     ];
//   }
//   return [
//     "Review your notes tomorrow.",
//     "Stay consistent and iterate.",
//     "Change only one thing at a time.",
//     "Measure briefly, then move on.",
//     "Keep momentum light but steady.",
//   ];
// }

// function normalizeParagraphWordRange(html: string, minW: number, maxW: number, lc: LangCode, pad: boolean) {
//   const fillers = fillerBank(lc);
//   const parts: string[] = [];
//   const regex = /(<h1>[\s\S]*?<\/h1>)\s*(<p>[\s\S]*?<\/p>)/gi;
//   let m: RegExpExecArray | null;
//   let lastIndex = 0;

//   while ((m = regex.exec(html))) {
//     parts.push(html.slice(lastIndex, m.index));
//     const h = m[1];
//     let p = m[2];

//     let inner = stripTagsFast(p);
//     inner = squashRepetition(inner);

//     let ws = inner.split(/\s+/).filter(Boolean);
//     if (ws.length > maxW) {
//       ws = ws.slice(0, maxW);
//     } else if (pad && ws.length < minW) {
//       let i = 0;
//       while (ws.length < minW && i < 60) {
//         ws = ws.concat(fillers[i % fillers.length].split(/\s+/));
//         i++;
//       }
//       if (ws.length > maxW) ws = ws.slice(0, maxW);
//     }
//     p = `<p>${ws.join(" ")}</p>`;
//     parts.push(`${h}${p}`);
//     lastIndex = regex.lastIndex;
//   }
//   parts.push(html.slice(lastIndex));
//   return parts.join("");
// }

// /* body sanitize: drop stray "Conclusion / Заключение / Вывод(ы) / निष्कर्ष / समापन" prefixes inside body paragraphs */
// function sanitizeBodySections(sections: string[], lc: LangCode) {
//   const conclAlts = lc === "ru"
//     ? /(Заключение|Выводы?|Итог)\s*[:\-–—]?\s*/i
//     : lc === "hi"
//       ? /(निष्कर्ष|समापन|उपसंहार)\s*[:\-–—]?\s*/i
//       : /(Conclusion)\s*[:\-–—]?\s*/i;

//   return sections.map((sec) => {
//     if (new RegExp(`^<h1>\\s*${conclusionHead(lc)}\\s*</h1>`, "i").test(sec)) return sec;
//     return sec.replace(/(<p>)([\s\S]*?)(<\/p>)/i, (_m, open, inner, close) => {
//       let t = inner.replace(conclAlts, "");
//       t = squashRepetition(t);
//       return `${open}${t}${close}`;
//     });
//   });
// }

// function removeAllTokens(s: string) {
//   return s.replace(/\[ANCHOR:[^\]]+\]/g, "");
// }

// function distributeTokensExact(sections: string[], keywords: string[]) {
//   const N = sections.length;
//   let out = sections.map(removeAllTokens);
//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) {
//     map[0] = keywords[0];
//   } else if (keywords.length === 2) {
//     map[0] = keywords[0];
//     map[Math.min(2, N - 1)] = keywords[1];
//   } else if (keywords.length >= 4) {
//     for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i];
//   }
//   out = out.map((sec, idx) => {
//     const kw = map[idx];
//     if (!kw) return sec;
//     const token = `[ANCHOR:${kw}]`;
//     return sec.replace(/<\/p>/i, ` ${token}</p>`);
//   });
//   return out;
// }
// function computeSectionKeywordMap(N: number, keywords: string[]) {
//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) { map[0] = keywords[0]; }
//   else if (keywords.length === 2) { map[0] = keywords[0]; map[Math.min(2, N - 1)] = keywords[1]; }
//   else if (keywords.length >= 4) { for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i]; }
//   return map;
// }

// /* Find model conclusion (<h1>…</h1><p>…</p>) in chosen language */
// function findModelConclusion(rawHtml: string, lc: LangCode) {
//   if (!rawHtml) return "";
//   const alts = lc === "ru"
//     ? "(Заключение|Выводы?|Итог)"
//     : lc === "hi"
//       ? "(निष्कर्ष|समापन|उपसंहार)"
//       : "(Conclusion)";
//   const m = rawHtml.match(new RegExp(`<h1>\\s*${alts}\\s*</h1>\\s*<p>[\\s\\S]*?<\\/p>`, "i"));
//   return m ? squashRepetition(m[0]) : "";
// }

// /* Enforce one keyword per BODY paragraph (others → plain text) */
// function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
//   const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
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

// /* Validate BODY only */
// function validateBodyHtml(
//   html: string,
//   keywords: string[],
//   wantSections: number,
//   minW: number,
//   maxW: number
// ) {
//   const errors: string[] = [];
//   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []);
//   if (blocks.length !== wantSections) errors.push(`Body section count must be exactly ${wantSections} (found ${blocks.length}).`);
//   const paras = (html.match(/<p>[\s\S]*?<\/p>/gi) || []);
//   paras.forEach((p) => {
//     const w = wordCount(stripTagsFast(p));
//     if (w < minW || w > maxW) errors.push(`Paragraph out of range (${w} words, expected ${minW}–${maxW}).`);
//   });
//   for (const k of keywords.slice(0, 4)) {
//     const cnt = (html.match(new RegExp(`\\[ANCHOR:${k.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\]`, "g")) || []).length;
//     if (cnt !== 1) errors.push(`Token count for "${k}" must be exactly 1 (found ${cnt}).`);
//   }
//   return errors;
// }

// /* =========================
//    Uniqueness guard (shingles + Jaccard)
//    ========================= */
// function shingles(text: string, n = 4): Set<string> {
//   const words = stripTagsFast(text).toLowerCase().split(/\s+/).filter(Boolean);
//   const set = new Set<string>();
//   for (let i = 0; i <= words.length - n; i++) set.add(words.slice(i, i + n).join(" "));
//   return set;
// }
// function jaccard(a: Set<string>, b: Set<string>) {
//   let inter = 0;
//   for (const x of a) if (b.has(x)) inter++;
//   return inter / Math.max(1, a.size + b.size - inter);
// }

// /* =========================
//    Grouping (normal vs custom)
//    ========================= */
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

// /* =========================
//    Hook
//    ========================= */
// export function useContentGeneration() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

//   const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
//     setExcelProjects((prev = []) => {
//       const exists = prev.some((p) => p.id === proj.id);
//       const base: ExcelProject = {
//         id: proj.id,
//         fileName: proj.fileName,
//         status: (proj as any).status ?? "pending",
//         totalKeywords: (proj as any).totalKeywords ?? 0,
//         processedKeywords: (proj as any).processedKeywords ?? 0,
//         createdAt: (proj as any).createdAt ?? new Date().toISOString(),
//         error: (proj as any).error,
//         failedCount: (proj as any).failedCount ?? 0,
//       };
//       if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...base } : p));
//       return [...prev, base];
//     });
//   };

//   const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
//     setIsProcessing(true);
//     onProgress?.(0);
//     ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

//     const bufferItems: ContentItem[] = [];
//     let flushTimer: number | null = null;
//     const flushNow = () => {
//       if (flushTimer != null) { clearTimeout(flushTimer as any); flushTimer = null; }
//       if (!bufferItems.length) return;
//       const toWrite = bufferItems.splice(0, bufferItems.length);
//       setContentItems((prev) => [...(prev ?? []), ...toWrite]);
//     };
//     const scheduleFlush = () => { if (flushTimer == null) flushTimer = window.setTimeout(() => flushNow(), 160); };

//     let failedCount = 0;
//     let processedCount = 0;
//     const updateProgress = (processed: number, total: number) => {
//       setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
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

//       // Build groups
//       const baseGroups = prefs.customModeEnabled
//         ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
//         : buildGroupsNormal(keywords, size);

//       ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
//       toast.info(`Generating ${baseGroups.length} article(s) • Mode: ${size} keyword(s)/article${prefs.customModeEnabled ? " • Custom count" : ""}`);

//       // Word bounds
//       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.92);
//       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.10);
//       const wantSections = prefs.sectionCount || 5;

//       // Concurrency
//       const cpu = (navigator.hardwareConcurrency ?? 4);
//       let concurrency = clamp(Math.floor(cpu / 2), 2, 8);
//       const MIN = 1, MAX = 8;

//       // Uniqueness state
//       const seenShingles: Set<string>[] = [];
//       const UNIQUENESS_THRESHOLD = 0.60;
//       const MAX_REPAIRS = 2;

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
//             const buildOnce = async (instructions: string) => {
//               let result = await generateJSONTitleHtml({ keywords: kws, instructions });

//               // BODY build
//               let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax, lc);
//               sections = distributeTokensExact(sections, kws);
//               sections = sanitizeBodySections(sections, lc);

//               // MODEL CONCLUSION (optional)
//               const modelConclusion = prefs.includeConclusion ? findModelConclusion(result.html, lc) : "";

//               // Normalize BODY (pad allowed), conclusion (no pad)
//               let bodyHtml = normalizeParagraphWordRange(sections.join(""), paraMin, paraMax, lc, true);
//               bodyHtml = squashRepetition(bodyHtml);

//               let finalHtml = bodyHtml;
//               if (prefs.includeConclusion && modelConclusion) {
//                 const normalizedConclusion = normalizeParagraphWordRange(modelConclusion, paraMin, paraMax, lc, false);
//                 finalHtml += normalizedConclusion;
//               }

//               return { result, bodyHtml, finalHtml };
//             };

//             const basePlan = buildPlanFromPrefs({
//               keywords: kws,
//               prefs: {
//                 ...prefs,
//                 sectionCount: (prefs.sectionCount as any) || 5,
//                 paragraphWords: (prefs.paragraphWords as any) || 100,
//               },
//               variationId: groupIndex + 1,
//             });

//             let attempt = 0;
//             let html = "";
//             let bodyHtml = "";
//             let title = "";
//             let conclusionOk = !prefs.includeConclusion;
//             let langOk = false;
//             let uniqueOk = false;

//             while (attempt < MAX_REPAIRS + 1) {
//               const { result, bodyHtml: bHtml, finalHtml } = await buildOnce(basePlan);
//               title = result.title;
//               bodyHtml = bHtml;
//               html = finalHtml;

//               // Validate BODY
//               let errs = validateBodyHtml(bodyHtml, kws, wantSections, paraMin, paraMax);

//               // Enforce language (script check)
//               const exp = expectScript(lc);
//               const scrBody = detectScript(bodyHtml);
//               langOk = scrBody === exp;

//               // Conclusion present when required
//               if (prefs.includeConclusion) {
//                 const concl = findModelConclusion(html, lc);
//                 conclusionOk = concl.length > 0 && detectScript(concl) === exp;
//                 if (!conclusionOk) errs.push("Conclusion missing or wrong language.");
//               }

//               // Uniqueness check vs. prior items (same run)
//               const sig = shingles(bodyHtml);
//               let maxSim = 0;
//               for (const prev of seenShingles) {
//                 maxSim = Math.max(maxSim, jaccard(sig, prev));
//               }
//               uniqueOk = maxSim < UNIQUENESS_THRESHOLD;
//               if (!uniqueOk) errs.push(`Body too similar to previous output (similarity ${(maxSim*100).toFixed(0)}%).`);

//               // If everything fine → break
//               if (errs.length === 0 && langOk && conclusionOk && uniqueOk) {
//                 // keep signature
//                 seenShingles.push(sig);
//                 break;
//               }

//               // Build a repair instruction
//               const repairPlan = [
//                 basePlan,
//                 "",
//                 "REWRITE STRICTLY to fix these issues:",
//                 ...errs.map((e) => `- ${e}`),
//                 lc === "ru"
//                   ? `Language enforcement: write 100% in Russian (Cyrillic). No English terms or Latin script.`
//                   : lc === "hi"
//                     ? `Language enforcement: write 100% in Hindi (Devanagari). No English terms or Latin script.`
//                     : `Language enforcement: write 100% in English.`,
//                 `Uniqueness: change persona, city, constraints, sequence of points and at least 3 numeric specifics. Do NOT reuse prior sentences.`,
//                 `Tokens: same mapping as instructed. Never put tokens in the conclusion.`,
//                 `Return ONLY JSON with corrected "title" and "html".`,
//               ].join("\n");

//               const built = await generateJSONTitleHtml({ keywords: kws, instructions: repairPlan });

//               // Re-run shaping on repaired output
//               let sections = ensureH1SectionsFromAnyHtml(built.html, wantSections, paraMin, paraMax, lc);
//               sections = distributeTokensExact(sections, kws);
//               sections = sanitizeBodySections(sections, lc);
//               bodyHtml = normalizeParagraphWordRange(sections.join(""), paraMin, paraMax, lc, true);
//               bodyHtml = squashRepetition(bodyHtml);

//               html = bodyHtml;
//               if (prefs.includeConclusion) {
//                 const concl = findModelConclusion(built.html, lc);
//                 if (concl) {
//                   const normC = normalizeParagraphWordRange(concl, paraMin, paraMax, lc, false);
//                   html += normC;
//                 }
//               }
//               title = built.title;

//               // Next loop will re-check again
//               attempt++;
//             }

//             // Link tokens
//             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//             html = applyAnchorTokens(html, anchors);
//             html = removeAllTokens(html);

//             // Enforce one keyword per BODY paragraph (skip conclusion count)
//             const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
//             const secMap = computeSectionKeywordMap(bodyCount, kws);
//             html = enforceSingleKeywordPerParagraph(html, kws, secMap);

//             // Final de-stutter
//             html = squashRepetition(html);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: html,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title,
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
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = clamp(Math.floor(concurrency), 2, 8);
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;
//         await Promise.race(Array.from(running));
//         if (failedCount > 0 && concurrency > 2) concurrency -= 0.2;
//         else if (concurrency < MAX) concurrency += 0.1;
//       }

//       flushNow();
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
//       ));
//       const ok = baseGroups.length - failedCount;
//       toast.success(`Finished ${file.name}: ✅ ${ok} • ❌ ${failedCount}`);
//       onProgress?.(100);
//     } catch (error) {
//       console.error("generateContent overall error:", error);
//       setExcelProjects((prev) => (prev ?? []).map((p) =>
//         p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
//       ));
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
//     openContentEditor,
//   };
// }




// // src/hooks/use-content.ts
// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /* =========================
//    Prefs
//    ========================= */
// const PREF_KEY = "content-preferences_v3";
// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
//   } catch { return {} as any; }
// }

// /* =========================
//    Types & Editor opener
//    ========================= */
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

// /* =========================
//    Excel parsing (keywords + optional URLs)
//    ========================= */
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
//   if ((v.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F]/g) || []).length < 2) return "";
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
//         if (s) score++;
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       if (checks === 0) continue;
//       const weighted = score * 100 + Math.min(checks, 100);
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

// /* =========================
//    Language helpers
//    ========================= */
// type LangCode = "en" | "hi" | "ru";
// function lcOf(pref?: string): LangCode {
//   const t = (pref || "").toLowerCase();
//   if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
//   if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
//   return "en";
// }
// function conclusionHead(lc: LangCode): string {
//   return lc === "ru" ? "Заключение" : lc === "hi" ? "निष्कर्ष" : "Conclusion";
// }
// function stripTagsFast(html: string) {
//   return (html || "")
//     .replace(/<script[\s\S]*?<\/script>/gi, " ")
//     .replace(/<style[\s\S]*?<\/style>/gi, " ")
//     .replace(/<\/?[^>]+>/g, " ")
//     .replace(/&nbsp;|&#160;/g, " ")
//     .replace(/\s+/g, " ").trim();
// }
// function wordCount(s: string) {
//   const t = (s || "").replace(/\s+/g, " ").trim();
//   if (!t) return 0;
//   return t.split(/\s+/).filter(Boolean).length;
// }
// function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

// /* =========================
//    De-robotize / repetition
//    ========================= */
// function squashRepetition(text: string): string {
//   let out = text.replace(/(\b([a-z\u0400-\u04ff\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
//   out = out.replace(/(\b[^\s<>{}]+\b(?:\s+\b[^\s<>{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
//   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
//   return out;
// }

// /* =========================
//    H1/P extraction & shaping
//    ========================= */
// function extractH1PSections(html: string) {
//   const out: { h: string; p: string }[] = [];
//   if (!html) return out;
//   const cleaned = html.replace(/\bundefined\b/gi, "");
//   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
//   let cursor = 0;
//   for (let i = 0; i < h1Matches.length; i++) {
//     const h = h1Matches[i];
//     const idx = cleaned.indexOf(h, cursor);
//     if (idx === -1) continue;
//     cursor = idx + h.length;
//     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
//     const p = pMatch ? pMatch[0] : "";
//     if (p) { out.push({ h, p }); cursor += p.length; }
//   }
//   return out;
// }

// function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number, lc: LangCode) {
//   const pairs = extractH1PSections(rawHtml);
//   if (pairs.length >= wantSections) {
//     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
//   }
//   const cleaned = rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ");
//   const words = stripTagsFast(squashRepetition(cleaned)).split(/\s+/).filter(Boolean);
//   const sections: string[] = [];
//   let idx = 0;
//   const BANK = lc === "ru"
//     ? ["Почему это важно","Полезные особенности","Что проверить заранее","Типичные ошибки и решения","Практические советы","Как закрепить результат"]
//     : lc === "hi"
//       ? ["क्यों यह महत्वपूर्ण है","मदद करने वाली मुख्य बातें","समय बचाने वाले जाँच-बिंदु","सामान्य गलतियाँ और उपाय","व्यावहारिक सुझाव","सीख को स्थायी बनाएं"]
//       : ["Why This Matters","Core Features That Help","Checks That Save Time","Common Pitfalls & Fixes","Real-World Tips","Make It Stick"];

//   for (let s = 0; s < wantSections; s++) {
//     let take = paraMin + Math.floor(Math.random() * (paraMax - paraMin + 1));
//     if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
//     if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
//     const chunk = words.slice(idx, idx + take).join(" ").trim();
//     const h1 = BANK[s % BANK.length];
//     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
//     idx += take;
//   }
//   return sections;
// }

// function removeAllTokens(s: string) { return s.replace(/\[ANCHOR:[^\]]+\]/g, ""); }

// /* =========================
//    Keyword enforcement helpers
//    ========================= */
// function computeSectionKeywordMap(N: number, keywords: string[]) {
//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) { map[0] = keywords[0]; }
//   else if (keywords.length === 2) { map[0] = keywords[0]; map[Math.min(2, N - 1)] = keywords[1]; }
//   else if (keywords.length >= 4) { for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i]; }
//   return map;
// }

// function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
//   const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
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

// /** Make sure no paragraph OR last sentence ends with the exact keyword. */
// function ensureNoTerminalKeyword(html: string, keywords: string[], lc: LangCode) {
//   const tails = lc === "ru"
//     ? ["как правило", "на практике", "для большинства проектов", "в итоге"]
//     : lc === "hi"
//       ? ["अक्सर", "व्यवहार में", "अधिकतर मामलों में", "आमतौर पर"]
//       : ["in practice", "for most teams", "in real use", "overall"];

//   const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
//   let out = html;

//   for (const pHtml of paragraphs) {
//     const inner = pHtml.replace(/^<p>|<\/p>$/gi, "");
//     const trimmed = inner.replace(/\s+/g, " ").trim();

//     // If ends with ...>keyword</a></p> OR ...keyword</p> OR ...<strong>keyword</strong></p>
//     let needsTail = false;
//     for (const kw of keywords) {
//       const endPlain = new RegExp(`${esc(kw)}\\s*(?:[.!?…]*)\\s*$`, "i");
//       const endAnchor = new RegExp(`>\\s*${esc(kw)}\\s*<\\/a>\\s*(?:[.!?…]*)\\s*$`, "i");
//       const endStrong = new RegExp(`>\\s*${esc(kw)}\\s*<\\/strong>\\s*(?:[.!?…]*)\\s*$`, "i");
//       if (endPlain.test(trimmed) || endAnchor.test(trimmed) || endStrong.test(trimmed)) { needsTail = true; break; }
//     }

//     if (!needsTail) continue;

//     const tail = tails[Math.floor(Math.random() * tails.length)];
//     const fixed = trimmed.replace(/\s*(?:[.!?…]*)\s*$/, `, ${tail}.`);
//     const newP = `<p>${fixed}</p>`;
//     out = out.replace(pHtml, newP);
//   }
//   return out;
// }

// /* =========================
//    Validation
//    ========================= */
// function validateBodyHtml(html: string, keywords: string[], wantSections: number, minW: number, maxW: number) {
//   const errors: string[] = [];
//   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []);
//   if (blocks.length !== wantSections) errors.push(`Body section count must be exactly ${wantSections} (found ${blocks.length}).`);
//   const paras = (html.match(/<p>[\s\S]*?<\/p>/gi) || []);
//   paras.forEach((p) => {
//     const w = wordCount(stripTagsFast(p));
//     if (w < minW || w > maxW) errors.push(`Paragraph out of range (${w} words, expected ${minW}–${maxW}).`);
//   });
//   for (const k of keywords.slice(0, 4)) {
//     const cnt = (html.match(new RegExp(`\\[ANCHOR:${k.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\]`, "g")) || []).length;
//     if (cnt !== 1) errors.push(`Token count for "${k}" must be exactly 1 (found ${cnt}).`);
//   }
//   return errors;
// }

// /* =========================
//    Uniqueness guard
//    ========================= */
// function shingles(text: string, n = 4): Set<string> {
//   const words = stripTagsFast(text).toLowerCase().split(/\s+/).filter(Boolean);
//   const set = new Set<string>();
//   for (let i = 0; i <= words.length - n; i++) set.add(words.slice(i, i + n).join(" "));
//   return set;
// }
// function jaccard(a: Set<string>, b: Set<string>) {
//   let inter = 0;
//   for (const x of a) if (b.has(x)) inter++;
//   return inter / Math.max(1, a.size + b.size - inter);
// }

// /* =========================
//    Grouping
//    ========================= */
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

// /* =========================
//    Hook
//    ========================= */
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

//     // micro-batched writes (faster than setTimeout)
//     const bufferItems: ContentItem[] = [];
//     let scheduled = false;
//     const BATCH_SIZE = 12;
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
//       toast.info(`Generating ${baseGroups.length} article(s) • Mode: ${size} keyword(s)/article${prefs.customModeEnabled ? " • Custom count" : ""}`);

//       // Word bounds
//       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.92);
//       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.10);
//       const wantSections = prefs.sectionCount || 5;

//       // Concurrency (adaptive)
//       const cpu = (navigator.hardwareConcurrency ?? 4);
//       let concurrency = clamp(Math.floor(cpu / 2) + 1, 2, 8);
//       const MAX = 8;

//       // Uniqueness state
//       const seenShingles: Set<string>[] = [];
//       const UNIQUENESS_THRESHOLD = 0.55; // a bit stricter
//       const MAX_REPAIRS = 2;

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

//             const buildOnce = async (instructions: string) => {
//               const result = await generateJSONTitleHtml({ keywords: kws, instructions });

//               // BODY build
//               let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax, lc);
//               // Put tokens into exact sections
//               sections = sections.map((s, i) => {
//                 const kw = kws[i] ?? null;
//                 if (!kw) return s;
//                 return s.replace(/<\/p>/i, ` [ANCHOR:${kw}]</p>`);
//               });

//               let bodyHtml = sections.join("");
//               bodyHtml = squashRepetition(bodyHtml);

//               // Result html may contain a model-generated conclusion — we reconstruct ourselves later if requested
//               return { result, bodyHtml };
//             };

//             let attempt = 0;
//             let bodyHtml = "";
//             let title = "";
//             let html = "";

//             while (attempt < MAX_REPAIRS + 1) {
//               const { result, bodyHtml: bHtml } = await buildOnce(basePlan);
//               title = result.title;
//               bodyHtml = bHtml;

//               // Validate BODY
//               let errs = validateBodyHtml(bodyHtml, kws, wantSections, paraMin, paraMax);

//               // Uniqueness vs prior items (same run)
//               const sig = shingles(bodyHtml);
//               let maxSim = 0;
//               for (const prev of seenShingles) maxSim = Math.max(maxSim, jaccard(sig, prev));
//               const uniqueOk = maxSim < UNIQUENESS_THRESHOLD;
//               if (!uniqueOk) errs.push(`Body too similar to previous output (similarity ${(maxSim*100).toFixed(0)}%).`);

//               if (errs.length === 0 && uniqueOk) {
//                 seenShingles.push(sig);
//                 break;
//               }

//               const repairPlan = [
//                 basePlan,
//                 "",
//                 "REWRITE STRICTLY to fix these issues:",
//                 ...errs.map((e) => `- ${e}`),
//                 lc === "ru"
//                   ? `Language enforcement: write 100% in Russian (Cyrillic). No English terms or Latin script.`
//                   : lc === "hi"
//                     ? `Language enforcement: write 100% in Hindi (Devanagari). No English terms or Latin script.`
//                     : `Language enforcement: write 100% in English.`,
//                 `Uniqueness: change persona, locale, sequence, and at least 3 numeric specifics. Do NOT reuse prior sentences.`,
//                 `Tokens: same mapping as instructed. Never put tokens in the conclusion.`,
//                 `Return ONLY JSON with corrected "title" and "html".`,
//               ].join("\n");

//               const repaired = await generateJSONTitleHtml({ keywords: kws, instructions: repairPlan });
//               let sections = ensureH1SectionsFromAnyHtml(repaired.html, wantSections, paraMin, paraMax, lc);
//               sections = sections.map((s, i) => {
//                 const kw = kws[i] ?? null;
//                 if (!kw) return s;
//                 return s.replace(/<\/p>/i, ` [ANCHOR:${kw}]</p>`);
//               });
//               bodyHtml = squashRepetition(sections.join(""));
//               title = repaired.title;

//               attempt++;
//             }

//             // Link tokens
//             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//             html = applyAnchorTokens(bodyHtml, anchors);
//             html = removeAllTokens(html);

//             // Enforce one keyword per BODY paragraph
//             const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
//             const secMap = computeSectionKeywordMap(bodyCount, kws);
//             html = enforceSingleKeywordPerParagraph(html, kws, secMap);

//             // **Do not allow paragraph/line to end with a keyword**
//             html = ensureNoTerminalKeyword(html, kws, lc);

//             // Final de-stutter
//             html = squashRepetition(html);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: html,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title,
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
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       // Run queue
//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = clamp(Math.floor(concurrency), 2, MAX);
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;
//         await Promise.race(Array.from(running));
//         // dynamic tuning
//         if (failedCount > 0 && concurrency > 2) concurrency -= 0.25;
//         else if (concurrency < MAX) concurrency += 0.1;
//       }

//       flushNow();
//       startTransition(() => {
//         setExcelProjects((prev) => (prev ?? []).map((p) =>
//           p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
//         ));
//       });
//       const ok = baseGroups.length - failedCount;
//       toast.success(`Finished ${file.name}: ✅ ${ok} • ❌ ${failedCount}`);
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




// // src/hooks/use-content.ts
// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /* ═══════════════════════════════════════════════════════════════
//    SPEED OPTIMIZED + HUMANIZATION FOCUSED
//    ═══════════════════════════════════════════════════════════════ */

// const PREF_KEY = "content-preferences_v3";
// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
//   } catch { return {} as any; }
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
//    EXCEL PARSING (Keywords + URLs) - OPTIMIZED
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
//   if ((v.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F]/g) || []).length < 2) return "";
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
//         if (s) score++;
//         if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
//       }
//       if (checks === 0) continue;
//       const weighted = score * 100 + Math.min(checks, 100);
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
//    HELPERS - OPTIMIZED FOR SPEED
//    ═══════════════════════════════════════════════════════════════ */

// type LangCode = "en" | "hi" | "ru";
// function lcOf(pref?: string): LangCode {
//   const t = (pref || "").toLowerCase();
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

// function wordCount(s: string) {
//   const t = (s || "").replace(/\s+/g, " ").trim();
//   if (!t) return 0;
//   return t.split(/\s+/).filter(Boolean).length;
// }

// function clamp(n: number, min: number, max: number) { 
//   return Math.max(min, Math.min(max, n)); 
// }

// function squashRepetition(text: string): string {
//   let out = text.replace(/(\b([a-z\u0400-\u04ff\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
//   out = out.replace(/(\b[^\s<>{}]+\b(?:\s+\b[^\s<>{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
//   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
//   return out;
// }

// function extractH1PSections(html: string) {
//   const out: { h: string; p: string }[] = [];
//   if (!html) return out;
//   const cleaned = html.replace(/\bundefined\b/gi, "");
//   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
//   let cursor = 0;
//   for (let i = 0; i < h1Matches.length; i++) {
//     const h = h1Matches[i];
//     const idx = cleaned.indexOf(h, cursor);
//     if (idx === -1) continue;
//     cursor = idx + h.length;
//     const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
//     const p = pMatch ? pMatch[0] : "";
//     if (p) { out.push({ h, p }); cursor += p.length; }
//   }
//   return out;
// }

// function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number, lc: LangCode) {
//   const pairs = extractH1PSections(rawHtml);
//   if (pairs.length >= wantSections) {
//     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
//   }
//   const cleaned = rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ");
//   const words = stripTagsFast(squashRepetition(cleaned)).split(/\s+/).filter(Boolean);
//   const sections: string[] = [];
//   let idx = 0;
//   const BANK = lc === "ru"
//     ? ["Почему это важно","Полезные особенности","Что проверить заранее","Типичные ошибки и решения","Практические советы","Как закрепить результат"]
//     : lc === "hi"
//       ? ["क्यों यह महत्वपूर्ण है","मदद करने वाली मुख्य बातें","समय बचाने वाले जाँच-बिंदु","सामान्य गलतियाँ और उपाय","व्यावहारिक सुझाव","सीख को स्थायी बनाएं"]
//       : ["Why This Matters","Core Features That Help","Checks That Save Time","Common Pitfalls & Fixes","Real-World Tips","Make It Stick"];

//   for (let s = 0; s < wantSections; s++) {
//     let take = paraMin + Math.floor(Math.random() * (paraMax - paraMin + 1));
//     if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
//     if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
//     const chunk = words.slice(idx, idx + take).join(" ").trim();
//     const h1 = BANK[s % BANK.length];
//     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
//     idx += take;
//   }
//   return sections;
// }

// function removeAllTokens(s: string) { 
//   return s.replace(/\[ANCHOR:[^\]]+\]/g, ""); 
// }

// function computeSectionKeywordMap(N: number, keywords: string[]) {
//   const map: Record<number, string | null> = {};
//   if (keywords.length === 1) { map[0] = keywords[0]; }
//   else if (keywords.length === 2) { map[0] = keywords[0]; map[Math.min(2, N - 1)] = keywords[1]; }
//   else if (keywords.length >= 4) { for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i]; }
//   return map;
// }

// function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
//   const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
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

// function ensureNoTerminalKeyword(html: string, keywords: string[], lc: LangCode) {
//   const tails = lc === "ru"
//     ? ["как правило", "на практике", "для большинства проектов", "в итоге"]
//     : lc === "hi"
//       ? ["अक्सर", "व्यवहार में", "अधिकतर मामलों में", "आमतौर पर"]
//       : ["in practice", "for most teams", "in real use", "overall"];

//   const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
//   let out = html;

//   for (const pHtml of paragraphs) {
//     const inner = pHtml.replace(/^<p>|<\/p>$/gi, "");
//     const trimmed = inner.replace(/\s+/g, " ").trim();

//     let needsTail = false;
//     for (const kw of keywords) {
//       const endPlain = new RegExp(`${esc(kw)}\\s*(?:[.!?…]*)\\s*$`, "i");
//       const endAnchor = new RegExp(`>\\s*${esc(kw)}\\s*<\\/a>\\s*(?:[.!?…]*)\\s*$`, "i");
//       const endStrong = new RegExp(`>\\s*${esc(kw)}\\s*<\\/strong>\\s*(?:[.!?…]*)\\s*$`, "i");
//       if (endPlain.test(trimmed) || endAnchor.test(trimmed) || endStrong.test(trimmed)) { needsTail = true; break; }
//     }

//     if (!needsTail) continue;

//     const tail = tails[Math.floor(Math.random() * tails.length)];
//     const fixed = trimmed.replace(/\s*(?:[.!?…]*)\s*$/, `, ${tail}.`);
//     const newP = `<p>${fixed}</p>`;
//     out = out.replace(pHtml, newP);
//   }
//   return out;
// }

// function basicValidate(html: string, keywords: string[], wantSections: number) {
//   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
//   if (blocks < wantSections - 1) return false;
  
//   for (const k of keywords.slice(0, Math.min(2, keywords.length))) {
//     if (!html.includes(k)) return false;
//   }
//   return true;
// }
// // 👇 Add near other helpers
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

// // Fallback signature from api.ts ("— draft.") + weak body detection
// function looksLikeLLMFallback(html: string) {
//   const hasDraftMarker = /—\s*draft\./i.test(html);
//   const h1Count = (html.match(/<h1>/gi) || []).length;
//   const fewWords = nonTokenWordCount(html) < 50; // practically empty body
//   return hasDraftMarker || (h1Count <= 1 && fewWords);
// }


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
//    MAIN HOOK - SPEED OPTIMIZED
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
//     const BATCH_SIZE = 20;
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
//       toast.info(`⚡ Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article • Humanized content`);

//       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.88);
//       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.15);
//       const wantSections = prefs.sectionCount || 5;

//       const cpu = (navigator.hardwareConcurrency ?? 4);
//       let concurrency = clamp(Math.floor(cpu * 0.75) + 2, 3, 12);
//       const MAX = 12;

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

//             const result = await generateJSONTitleHtml({ keywords: kws, instructions: basePlan });
//             let title = result.title;

//             let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax, lc);
//             sections = sections.map((s, i) => {
//               const kw = kws[i] ?? null;
//               if (!kw) return s;
//               return s.replace(/<\/p>/i, ` [ANCHOR:${kw}]</p>`);
//             });

//             let bodyHtml = sections.join("");
//             bodyHtml = squashRepetition(bodyHtml);

//             if (!basicValidate(bodyHtml, kws, wantSections)) {
//               throw new Error("Basic validation failed");
//             }

//             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//             let html = applyAnchorTokens(bodyHtml, anchors);
//             html = removeAllTokens(html);

//             const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
//             const secMap = computeSectionKeywordMap(bodyCount, kws);
//             html = enforceSingleKeywordPerParagraph(html, kws, secMap);
//             html = ensureNoTerminalKeyword(html, kws, lc);
//             html = squashRepetition(html);

//             const item: ContentItem = {
//               id: `${fileId}-${groupIndex}-${Date.now()}`,
//               keyword: kws[0],
//               keywordsUsed: kws,
//               generatedContent: html,
//               fileId,
//               fileName: file.name,
//               createdAt: new Date().toISOString(),
//               title,
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
//             console.error("group generate error:", e);
//           } finally {
//             processedCount += 1;
//             updateProgress(processedCount, baseGroups.length);
//           }
//         })().finally(() => running.delete(task));

//         running.add(task);
//       };

//       // Main processing loop
//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = clamp(Math.floor(concurrency), 3, MAX);
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;
//         await Promise.race(Array.from(running));
        
//         if (failedCount > processedCount * 0.3 && concurrency > 3) concurrency -= 0.5;
//         else if (concurrency < MAX && failedCount < processedCount * 0.1) concurrency += 0.2;
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







// // 

// // src/hooks/use-content.ts
// import { useState, startTransition } from "react";
// import { toast } from "sonner";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import * as XLSX from "xlsx";
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
// import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
// import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

// /* ═══════════════════════════════════════════════════════════════
//    SPEED OPTIMIZED + HUMANIZATION FOCUSED (Turbo pool-aware)
//    ═══════════════════════════════════════════════════════════════ */

// const PREF_KEY = "content-preferences_v3";
// function getFreshPrefs(): ContentPreferences {
//   try {
//     const raw = localStorage.getItem(PREF_KEY);
//     return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
//   } catch { return {} as any; }
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
//   if ((v.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F]/g) || []).length < 2) return "";
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
//         if (s) score++;
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
//    CONTENT SHAPING HELPERS
//    ═══════════════════════════════════════════════════════════════ */

// type LangCode = "en" | "hi" | "ru";
// function lcOf(pref?: string): LangCode {
//   const t = (pref || "").toLowerCase();
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
// function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
// function squashRepetition(text: string): string {
//   let out = text.replace(/(\b([a-z\u0400-\u04ff\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
//   out = out.replace(/(\b[^\s<>\{}]+\b(?:\s+\b[^\s<>\{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
//   out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
//   return out;
// }
// function extractH1PSections(html: string) {
//   const out: { h: string; p: string }[] = [];
//   if (!html) return out;
//   const cleaned = html.replace(/\bundefined\b/gi, "");
//   const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
//   let cursor = 0;
//   for (let i = 0; i < h1Matches.length; i++) {
//     const h = h1Matches[i];
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
// function looksLikeLLMFallback(html: string) {
//   const hasDraftMarker = /—\s*draft\./i.test(html);
//   const h1Count = (html.match(/<h1>/gi) || []).length;
//   const fewWords = nonTokenWordCount(html) < 50;
//   return hasDraftMarker || (h1Count <= 1 && fewWords);
// }
// function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number, lc: LangCode) {
//   const pairs = extractH1PSections(rawHtml);
//   if (pairs.length >= wantSections) {
//     return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
//   }
//   const baseWords = nonTokenWordCount(rawHtml);
//   if (baseWords < Math.max(paraMin, 50)) {
//     throw new Error("Insufficient body returned by LLM; refusing to fabricate sections.");
//   }
//   const cleaned = rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ");
//   const words = stripTagsFast(squashRepetition(cleaned)).split(/\s+/).filter(Boolean);
//   const sections: string[] = [];
//   let idx = 0;
//   const BANK = lc === "ru"
//     ? ["Почему это важно","Полезные особенности","Что проверить заранее","Типичные ошибки и решения","Практические советы","Как закрепить результат"]
//     : lc === "hi"
//       ? ["क्यों यह महत्वपूर्ण है","मदद करने वाली मुख्य बातें","समय बचाने वाले जाँच-बिंदु","सामान्य गलतियाँ और उपाय","व्यावहारिक सुझाव","सीख को स्थायी बनाएं"]
//       : ["Why This Matters","Core Features That Help","Checks That Save Time","Common Pitfalls & Fixes","Real-World Tips","Make It Stick"];
//   for (let s = 0; s < wantSections; s++) {
//     let take = Math.floor((paraMin + paraMax) / 2);
//     if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
//     if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
//     const chunk = words.slice(idx, idx + take).join(" ").trim();
//     const h1 = BANK[s % BANK.length];
//     sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
//     idx += take;
//   }
//   return sections;
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
//   const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
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
// function ensureNoTerminalKeyword(html: string, keywords: string[], lc: LangCode) {
//   const tails = lc === "ru"
//     ? ["как правило", "на практике", "для большинства проектов", "в итоге"]
//     : lc === "hi"
//       ? ["अक्सर", "व्यवहार में", "अधिकतर मामलों में", "आम तौर पर"]
//       : ["in practice", "for most teams", "in real use", "overall"];
//   const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
//   const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
//   let out = html;
//   for (const pHtml of paragraphs) {
//     const inner = pHtml.replace(/^<p>|<\/p>$/gi, "");
//     const trimmed = inner.replace(/\s+/g, " ").trim();
//     let needsTail = false;
//     for (const kw of keywords) {
//       const endPlain = new RegExp(`${esc(kw)}\\s*(?:[.!?…]*)\\s*$`, "i");
//       const endAnchor = new RegExp(`>\\s*${esc(kw)}\\s*<\\/a>\\s*(?:[.!?…]*)\\s*$`, "i");
//       const endStrong = new RegExp(`>\\s*${esc(kw)}\\s*<\\/strong>\\s*(?:[.!?…]*)\\s*$`, "i");
//       if (endPlain.test(trimmed) || endAnchor.test(trimmed) || endStrong.test(trimmed)) { needsTail = true; break; }
//     }
//     if (!needsTail) continue;
//     const tail = tails[Math.floor(Math.random() * tails.length)];
//     const fixed = trimmed.replace(/\s*(?:[.!?…]*)\s*$/, `, ${tail}.`);
//     const newP = `<p>${fixed}</p>`;
//     out = out.replace(pHtml, newP);
//   }
//   return out;
// }
// function basicValidate(html: string, keywords: string[], wantSections: number) {
//   if (looksLikeLLMFallback(html)) return false;
//   const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
//   if (blocks < wantSections - 1) return false;
//   for (const k of keywords.slice(0, Math.min(2, keywords.length))) {
//     if (!html.includes(k)) return false;
//   }
//   return true;
// }

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
//     const BATCH_SIZE = 20;
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
//       toast.info(`⚡ Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article • Humanized content`);

//       const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.88);
//       const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.15);
//       const wantSections = prefs.sectionCount || 5;

//       // 🚀 Turbo pool-aware concurrency (no CPU bottleneck)
//       let concurrency = Math.min(Math.max(6, (navigator.hardwareConcurrency ?? 4) * 2), 12);
//       const MAX = 48;

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

//             const result = await generateJSONTitleHtml({ keywords: kws, instructions: basePlan });

//             // Reject stub/fallback so it retries & never leaks to UI
//             const html0 = String(result.html || "");
//             if (/—\s*draft\./i.test(html0) || (html0.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0) < 50) {
//               throw new Error("LLM fallback/stub detected (rate-limit or non-JSON).");
//             }

//             let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax, lc);
//             sections = sections.map((s, i) => (kws[i] ? s.replace(/<\/p>/i, ` [ANCHOR:${kws[i]}]</p>`) : s));

//             let bodyHtml = sections.join("");
//             bodyHtml = squashRepetition(bodyHtml);

//             if (!basicValidate(bodyHtml, kws, wantSections)) {
//               throw new Error("Basic validation failed");
//             }

//             const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
//             let html = applyAnchorTokens(bodyHtml, anchors);
//             html = removeAllTokens(html);

//             const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
//             const secMap = computeSectionKeywordMap(bodyCount, kws);
//             html = enforceSingleKeywordPerParagraph(html, kws, secMap);
//             html = ensureNoTerminalKeyword(html, kws, lc);
//             html = squashRepetition(html);

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

//       // Main loop
//       while (idx < baseGroups.length || running.size > 0) {
//         const cur = Math.max(6, Math.min(Math.floor(concurrency), MAX));
//         while (running.size < cur && idx < baseGroups.length) startNext();
//         if (!running.size && idx >= baseGroups.length) break;
//         await Promise.race(Array.from(running));

//         // Adapt concurrency to avoid 429 bursts, but keep speed
//         if (failedCount > processedCount * 0.25 && concurrency > 6) concurrency -= 0.5;
//         else if (concurrency < MAX && failedCount < processedCount * 0.08) concurrency += 0.3;
//       }

//       // Tail retry (low & polite)
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

//           const res = await generateJSONTitleHtml({ keywords: kws, instructions: basePlan });
//           const html0b = String(res.html || "");
//           if (/—\s*draft\./i.test(html0b) || (html0b.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0b) < 50) {
//             throw new Error("LLM fallback/stub on retry");
//           }

//           let sections = ensureH1SectionsFromAnyHtml(res.html, wantSections, paraMin, paraMax, lc);
//           sections = sections.map((s, i) => (kws[i] ? s.replace(/<\/p>/i, ` [ANCHOR:${kws[i]}]</p>`) : s));

//           let bodyHtml = sections.join("");
//           bodyHtml = squashRepetition(bodyHtml);
//           if (!basicValidate(bodyHtml, kws, wantSections)) throw new Error("Basic validation failed on retry");

//           const anchors = Object.keys(urlMap).map(k => ({ keyword: k, url: urlMap[k] || undefined }));
//           let html = applyAnchorTokens(bodyHtml, anchors);
//           html = removeAllTokens(html);

//           const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
//           const secMap = computeSectionKeywordMap(bodyCount, kws);
//           html = enforceSingleKeywordPerParagraph(html, kws, secMap);
//           html = ensureNoTerminalKeyword(html, kws, lc);
//           html = squashRepetition(html);

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

//         const RETRY_CONCURRENCY = 2;
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
//           await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
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




// src/hooks/use-content.ts
import { useState, startTransition } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import * as XLSX from "xlsx";
import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";
import { buildPlanFromPrefs } from "@/lib/llm/prompt-engine";
import type { ContentPreferences, KeywordMode } from "@/hooks/use-preferences";

/* ═══════════════════════════════════════════════════════════════
   SPEED OPTIMIZED + HUMANIZATION FOCUSED (Turbo pool-aware)
   ═══════════════════════════════════════════════════════════════ */

const PREF_KEY = "content-preferences_v3";
function getFreshPrefs(): ContentPreferences {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? (JSON.parse(raw) as ContentPreferences) : ({} as any);
  } catch { return {} as any; }
}

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

const SESSION_KEY = "open-content-item_v1";
export function openContentEditor(item: ContentItem) {
  try {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(item)); }
    catch { localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item)); }
    const win = window.open("/content/editor", "_blank");
    if (!win) toast.error("Popup blocked — allow popups to open the editor in a new tab.");
  } catch {
    try { window.location.href = "/content/editor"; } catch {}
  }
}

/* ═══════════════════════════════════════════════════════════════
   EXCEL PARSING (Keywords + URLs)
   ═══════════════════════════════════════════════════════════════ */

function norm(s: unknown) {
  return String(s ?? "").toLowerCase().replace(/[.\-_/]/g, " ").replace(/\s+/g, " ").trim();
}
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
  if ((v.match(/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u0900-\u097F]/g) || []).length < 2) return "";
  v = v.replace(/^[\W_]+|[\W_]+$/g, "").trim();
  if (v.length < 2 || v.length > 180) return "";
  return v;
}

type KeywordRow = { keyword: string; url?: string | null };
const KW_HEADERS = new Set(["keyword","keywords","focus keyword","search term","term","query","topic","title","key word"]);
const URL_HEADERS = new Set(["url","link","target url","target","target page","landing page","page url","destination","href","target link"]);

function detectHeaderRowAndColumns(rows: unknown[][]) {
  let headerRowIndex = -1;
  const maxCheck = Math.min(rows.length, 6);
  for (let i = 0; i < maxCheck; i++) {
    const r = rows[i];
    if (!Array.isArray(r)) continue;
    const nonEmpty = r.filter((c) => String(c ?? "").trim().length > 0);
    const mostlyText = nonEmpty.filter((c) => /[A-Za-zА-Яа-яЁё\u0900-\u097F]/.test(String(c))).length >= Math.ceil(nonEmpty.length * 0.5);
    if (nonEmpty.length >= 2 && mostlyText) { headerRowIndex = i; break; }
  }
  if (headerRowIndex === -1) headerRowIndex = 0;

  const headers = (rows[headerRowIndex] as unknown[]).map(norm);
  let keywordCol = -1, urlCol = -1;
  headers.forEach((h, idx) => {
    if (keywordCol === -1 && KW_HEADERS.has(h)) keywordCol = idx;
    if (urlCol === -1 && URL_HEADERS.has(h)) urlCol = idx;
  });

  if (keywordCol === -1) {
    const lookahead = rows.slice(headerRowIndex + 1, headerRowIndex + 201);
    const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
    let bestCol = -1, bestScore = 0;
    for (let c = 0; c < maxCols; c++) {
      let score = 0, checks = 0;
      for (const rr of lookahead) {
        if (!Array.isArray(rr)) continue;
        const s = sanitizeKeyword(rr[c]);
        if (s) score++;
        if (rr[c] !== undefined && rr[c] !== null && String(rr[c]).trim() !== "") checks++;
      }
      const weighted = score * 100 + Math.min(checks, 100);
      if (checks === 0) continue;
      if (weighted > bestScore) { bestScore = weighted; bestCol = c; }
    }
    if (bestCol !== -1) keywordCol = bestCol;
  }
  return { headerRowIndex, keywordCol: keywordCol === -1 ? null : keywordCol, urlCol: urlCol === -1 ? null : urlCol };
}

function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
  if (!rows || rows.length === 0) return [];
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
        if (cand) { k = cand; break; }
      }
    }
    if (!k || seen.has(k)) continue;

    let url: string | null = null;
    if (urlCol != null) {
      const raw = String(r[urlCol] ?? "").trim();
      if (raw && isLikelyUrlOrDomain(raw)) url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
    }
    if (!url) {
      for (let offset = -3; offset <= 3; offset++) {
        if (offset === 0) continue;
        const idx = (keywordCol ?? 0) + offset;
        if (idx < 0 || idx >= maxCols) continue;
        const maybe = r[idx];
        if (!maybe) continue;
        const s = String(maybe).trim();
        if (isLikelyUrlOrDomain(s)) { url = /^https?:\/\//i.test(s) ? s : "https://" + s; break; }
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
      for (const k of ks) if (!seen.has(k.keyword)) { seen.add(k.keyword); combined.push(k); }
      if (combined.length > 10000) break;
    } catch (e) {
      console.warn("worksheet parse failed:", sheetName, e);
    }
  }
  return { keywords: combined };
}

/* ═══════════════════════════════════════════════════════════════
   CONTENT SHAPING HELPERS
   ═══════════════════════════════════════════════════════════════ */

type LangCode = "en" | "hi" | "ru";
function lcOf(pref?: string): LangCode {
  const t = (pref || "").toLowerCase();
  if (t.includes("hi") || t.includes("hindi") || t.includes("हिंदी")) return "hi";
  if (t.includes("ru") || t.includes("russian") || t.includes("рус")) return "ru";
  return "en";
}
function stripTagsFast(html: string) {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function squashRepetition(text: string): string {
  let out = text.replace(/(\b([a-z\u0400-\u04ff\u0900-\u097f]{2,})\b\.?)(\s+\1){2,}/gi, (_m, a) => `${a} ${a}`);
  out = out.replace(/(\b[^\s<>\{}]+\b(?:\s+\b[^\s<>\{}]+\b){0,2})([.!?])?(?:\s+\1\2?){2,}/gi, (_m, a, p = "") => `${a}${p} ${a}${p}`);
  out = out.replace(/(?:\s*\bforward\.\b){2,}\s*$/gi, "");
  return out;
}
function extractH1PSections(html: string) {
  const out: { h: string; p: string }[] = [];
  if (!html) return out;
  const cleaned = html.replace(/\bundefined\b/gi, "");
  const h1Matches = cleaned.match(/<h1>[\s\S]*?<\/h1>/gi) || [];
  let cursor = 0;
  for (let i = 0; i < h1Matches.length; i++) {
    const h = h1Matches[i];
    const idx = cleaned.indexOf(h, cursor);
    if (idx === -1) continue;
    cursor = idx + h.length;
    const pMatch = cleaned.slice(cursor).match(/<p>[\s\S]*?<\/p>/i);
    const p = pMatch ? pMatch[0] : "";
    if (p) { out.push({ h, p }); cursor += p.length; }
  }
  return out;
}
function nonTokenWordCount(html: string) {
  const noTokens = (html || "").replace(/\[ANCHOR:[^\]]+\]/g, " ");
  const text = noTokens
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(/\s+/).filter(w => w.length > 1).length : 0;
}
function looksLikeLLMFallback(html: string) {
  const hasDraftMarker = /—\s*draft\./i.test(html);
  const h1Count = (html.match(/<h1>/gi) || []).length;
  const fewWords = nonTokenWordCount(html) < 50;
  return hasDraftMarker || (h1Count <= 1 && fewWords);
}
function ensureH1SectionsFromAnyHtml(rawHtml: string, wantSections: number, paraMin: number, paraMax: number, lc: LangCode) {
  const pairs = extractH1PSections(rawHtml);
  if (pairs.length >= wantSections) {
    return pairs.slice(0, wantSections).map(({ h, p }) => `${h}${p}`);
  }
  const baseWords = nonTokenWordCount(rawHtml);
  if (baseWords < Math.max(paraMin, 50)) {
    throw new Error("Insufficient body returned by LLM; refusing to fabricate sections.");
  }
  const cleaned = rawHtml.replace(/```[\s\S]*?```/g, " ").replace(/\bundefined\b/gi, " ").replace(/\[ANCHOR:[^\]]+\]/g, " ");
  const words = stripTagsFast(squashRepetition(cleaned)).split(/\s+/).filter(Boolean);
  const sections: string[] = [];
  let idx = 0;
  const BANK = lc === "ru"
    ? ["Почему это важно","Полезные особенности","Что проверить заранее","Типичные ошибки и решения","Практические советы","Как закрепить результат"]
    : lc === "hi"
      ? ["क्यों यह महत्वपूर्ण है","मदद करने वाली मुख्य बातें","समय बचाने वाले जाँच-बिंदु","सामान्य गलतियाँ और उपाय","व्यावहारिक सुझाव","सीख को स्थायी बनाएं"]
      : ["Why This Matters","Core Features That Help","Checks That Save Time","Common Pitfalls & Fixes","Real-World Tips","Make It Stick"];
  for (let s = 0; s < wantSections; s++) {
    let take = Math.floor((paraMin + paraMax) / 2);
    if (idx + take > words.length) take = Math.min(paraMax, Math.max(paraMin, words.length - idx));
    if (take <= 0) { idx = 0; take = Math.min(paraMax, Math.max(paraMin, words.length)); }
    const chunk = words.slice(idx, idx + take).join(" ").trim();
    const h1 = BANK[s % BANK.length];
    sections.push(`<h1>${h1}</h1><p>${chunk}</p>`);
    idx += take;
  }
  return sections;
}
function removeAllTokens(s: string) { return s.replace(/\[ANCHOR:[^\]]+\]/g, ""); }
function computeSectionKeywordMap(N: number, keywords: string[]) {
  const map: Record<number, string | null> = {};
  if (keywords.length === 1) { map[0] = keywords[0]; }
  else if (keywords.length === 2) { map[0] = keywords[0]; map[Math.min(2, N - 1)] = keywords[1]; }
  else if (keywords.length >= 4) { for (let i = 0; i < 4 && i < N; i++) map[i] = keywords[i]; }
  return map;
}
function enforceSingleKeywordPerParagraph(html: string, keywords: string[], sectionMap: Record<number, string | null>) {
  const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
  const blocks = html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || [];
  let idx = 0;
  let result = html;
  for (const block of blocks) {
    const allowed = sectionMap[idx++] || "";
    if (!allowed) continue;
    let replaced = block;

    for (const k of keywords) {
      if (k === allowed) continue;
      const aRe = new RegExp(`<a[^>]*>\\s*(${esc(k)})\\s*<\\/a>`, "gi");
      const bRe = new RegExp(`<strong>\\s*(${esc(k)})\\s*<\\/strong>`, "gi");
      replaced = replaced.replace(aRe, "$1").replace(bRe, "$1");
    }

    const allowedA = new RegExp(`<a[^>]*>\\s*(${esc(allowed)})\\s*<\\/a>`, "gi");
    let seen = 0;
    replaced = replaced.replace(allowedA, (_m, g1) => (++seen === 1 ? _m : g1));

    const allowedB = new RegExp(`<strong>\\s*(${esc(allowed)})\\s*<\\/strong>`, "gi");
    seen = 0;
    replaced = replaced.replace(allowedB, (_m, g1) => (++seen === 1 ? _m : g1));

    result = result.replace(block, replaced);
  }
  return result;
}
function ensureNoTerminalKeyword(html: string, keywords: string[], lc: LangCode) {
  const tails = lc === "ru"
    ? ["как правило", "на практике", "для большинства проектов", "в итоге"]
    : lc === "hi"
      ? ["अक्सर", "व्यवहार में", "अधिकतर मामलों में", "आम तौर पर"]
      : ["in practice", "for most teams", "in real use", "overall"];
  const esc = (s: string) => s.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
  const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
  let out = html;
  for (const pHtml of paragraphs) {
    const inner = pHtml.replace(/^<p>|<\/p>$/gi, "");
    const trimmed = inner.replace(/\s+/g, " ").trim();
    let needsTail = false;
    for (const kw of keywords) {
      const endPlain = new RegExp(`${esc(kw)}\\s*(?:[.!?…]*)\\s*$`, "i");
      const endAnchor = new RegExp(`>\\s*${esc(kw)}\\s*<\\/a>\\s*(?:[.!?…]*)\\s*$`, "i");
      const endStrong = new RegExp(`>\\s*${esc(kw)}\\s*<\\/strong>\\s*(?:[.!?…]*)\\s*$`, "i");
      if (endPlain.test(trimmed) || endAnchor.test(trimmed) || endStrong.test(trimmed)) { needsTail = true; break; }
    }
    if (!needsTail) continue;
    const tail = tails[Math.floor(Math.random() * tails.length)];
    const fixed = trimmed.replace(/\s*(?:[.!?…]*)\s*$/, `, ${tail}.`);
    const newP = `<p>${fixed}</p>`;
    out = out.replace(pHtml, newP);
  }
  return out;
}
function basicValidate(html: string, keywords: string[], wantSections: number) {
  if (looksLikeLLMFallback(html)) return false;
  const blocks = (html.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
  if (blocks < wantSections - 1) return false;
  for (const k of keywords.slice(0, Math.min(2, keywords.length))) {
    if (!html.includes(k)) return false;
  }
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   ADDITIONAL HUMANIZATION POST-PROCESSING FOR AI-FREE FEEL
   ═══════════════════════════════════════════════════════════════ */

function humanizeText(text: string): string {
  // Add slight imperfections: contractions, varied punctuation, natural breaks
  text = text.replace(/ do not /g, " don't ").replace(/ is not /g, " isn't ").replace(/ it is /g, " it's ");
  text = text.replace(/\. /g, (match) => Math.random() > 0.7 ? "; " : match);
  text = text.replace(/, /g, (match) => Math.random() > 0.8 ? "— " : match);

  // Introduce minor "human errors" like repeated words or asides (rarely)
  const sentences = text.split(/([.!?])/g);
  for (let i = 0; i < sentences.length; i += 2) {
    if (Math.random() < 0.05 && sentences[i].split(" ").length > 5) {
      const words = sentences[i].split(" ");
      const insertIdx = Math.floor(Math.random() * words.length);
      words.splice(insertIdx, 0, "you know,");
      sentences[i] = words.join(" ");
    }
  }
  text = sentences.join("");

  // Vary sentence lengths more aggressively
  text = squashRepetition(text);

  return text;
}

function humanizeHtml(html: string): string {
  const paragraphs = html.match(/<p>[\s\S]*?<\/p>/gi) || [];
  let out = html;
  for (const pHtml of paragraphs) {
    const inner = pHtml.replace(/^<p>|<\/p>$/gi, "").trim();
    const humanized = humanizeText(inner);
    const newP = `<p>${humanized}</p>`;
    out = out.replace(pHtml, newP);
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════
   GROUPING
   ═══════════════════════════════════════════════════════════════ */
function buildGroupsNormal(rows: KeywordRow[], size: KeywordMode): KeywordRow[][] {
  const groups: KeywordRow[][] = [];
  for (let i = 0; i < rows.length; i += size) groups.push(rows.slice(i, i + size));
  return groups;
}
function sampleDistinct<T>(arr: T[], size: number): T[] {
  if (size <= 0) return [];
  if (arr.length === 0) return [];
  if (size === 1) return [arr[Math.floor(Math.random() * arr.length)]];
  const takenIdx = new Set<number>();
  let tries = 0;
  while (takenIdx.size < Math.min(size, arr.length) && tries < size * 8) {
    takenIdx.add(Math.floor(Math.random() * arr.length));
    tries++;
  }
  const out = Array.from(takenIdx).map(i => arr[i]);
  while (out.length < size) out.push(arr[Math.floor(Math.random() * arr.length)]);
  return out;
}
function buildGroupsCustom(rows: KeywordRow[], size: KeywordMode, count: number): KeywordRow[][] {
  const groups: KeywordRow[][] = [];
  for (let i = 0; i < count; i++) groups.push(sampleDistinct(rows, size));
  return groups;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN HOOK
   ═══════════════════════════════════════════════════════════════ */
export function useContentGeneration() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
  const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

  const ensureProject = (proj: Partial<ExcelProject> & { id: string; fileName: string }) => {
    startTransition(() => {
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
    });
  };

  const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
    setIsProcessing(true);
    onProgress?.(0);
    ensureProject({ id: fileId, fileName: file.name, status: "pending", totalKeywords: 0, processedKeywords: 0, failedCount: 0 });

    const bufferItems: ContentItem[] = [];
    let scheduled = false;
    const BATCH_SIZE = 20;
    const flushNow = () => {
      scheduled = false;
      if (!bufferItems.length) return;
      const toWrite = bufferItems.splice(0, bufferItems.length);
      startTransition(() => {
        setContentItems((prev) => [...(prev ?? []), ...toWrite]);
      });
    };
    const scheduleFlush = () => {
      if (bufferItems.length >= BATCH_SIZE) return flushNow();
      if (!scheduled) { scheduled = true; queueMicrotask(flushNow); }
    };

    let failedCount = 0;
    let processedCount = 0;
    const failedGroups: Array<{ index: number; grp: KeywordRow[] }> = [];

    const updateProgress = (processed: number, total: number) => {
      startTransition(() => {
        setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
      });
      try { onProgress?.(Math.round((processed / Math.max(1, total)) * 100)); } catch {}
    };

    try {
      const buffer = await file.arrayBuffer();
      const { keywords } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
      if (!keywords.length) {
        ensureProject({ id: fileId, fileName: file.name, status: "error", error: "No valid keywords found in the uploaded Excel file" });
        toast.error("No valid keywords found in the uploaded Excel file.");
        onProgress?.(100);
        return;
      }

      const prefs = getFreshPrefs();
      const lc = lcOf(prefs.language);
      const size = (prefs.keywordMode ?? 1) as KeywordMode;

      const baseGroups = prefs.customModeEnabled
        ? buildGroupsCustom(keywords, size, Math.max(1, Math.min(200, prefs.articleCount || 1)))
        : buildGroupsNormal(keywords, size);

      ensureProject({ id: fileId, fileName: file.name, status: "processing", totalKeywords: baseGroups.length, processedKeywords: 0, failedCount: 0 });
      toast.info(`⚡ Generating ${baseGroups.length} article(s) • ${size} keyword(s)/article • Humanized content`);

      const paraMin = Math.floor((prefs.paragraphWords || 100) * 0.88);
      const paraMax = Math.ceil((prefs.paragraphWords || 100) * 1.15);
      const wantSections = prefs.sectionCount || 5;

      // 🚀 Turbo pool-aware concurrency (increased for speed)
      let concurrency = Math.min(Math.max(12, (navigator.hardwareConcurrency ?? 4) * 3), 24);
      const MAX = 96;

      let idx = 0;
      const running = new Set<Promise<void>>();

      const startNext = () => {
        if (idx >= baseGroups.length) return;
        const groupIndex = idx++;
        const grp = baseGroups[groupIndex];
        const kws = grp.map((g) => g.keyword);
        const urlMap: Record<string, string | null> = {};
        grp.forEach((g) => { urlMap[g.keyword] = g.url ?? null; });

        const task = (async () => {
          try {
            const basePlan = buildPlanFromPrefs({
              keywords: kws,
              prefs: {
                ...prefs,
                sectionCount: (prefs.sectionCount as any) || 5,
                paragraphWords: (prefs.paragraphWords as any) || 100,
              },
              variationId: groupIndex + 1,
            });

            const result = await generateJSONTitleHtml({ keywords: kws, instructions: basePlan });

            // Reject stub/fallback so it retries & never leaks to UI
            const html0 = String(result.html || "");
            if (/—\s*draft\./i.test(html0) || (html0.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0) < 50) {
              throw new Error("LLM fallback/stub detected (rate-limit or non-JSON).");
            }

            let sections = ensureH1SectionsFromAnyHtml(result.html, wantSections, paraMin, paraMax, lc);
            sections = sections.map((s, i) => (kws[i] ? s.replace(/<\/p>/i, ` [ANCHOR:${kws[i]}]</p>`) : s));

            let bodyHtml = sections.join("");
            bodyHtml = squashRepetition(bodyHtml);

            if (!basicValidate(bodyHtml, kws, wantSections)) {
              throw new Error("Basic validation failed");
            }

            const anchors = Object.keys(urlMap).map((k) => ({ keyword: k, url: urlMap[k] || undefined }));
            let html = applyAnchorTokens(bodyHtml, anchors);
            html = removeAllTokens(html);

            const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
            const secMap = computeSectionKeywordMap(bodyCount, kws);
            html = enforceSingleKeywordPerParagraph(html, kws, secMap);
            html = ensureNoTerminalKeyword(html, kws, lc);
            html = squashRepetition(html);

            // Additional humanization for AI-free content
            html = humanizeHtml(html);

            const item: ContentItem = {
              id: `${fileId}-${groupIndex}-${Date.now()}`,
              keyword: kws[0],
              keywordsUsed: kws,
              generatedContent: html,
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
                sectionCount: prefs.sectionCount,
                includeConclusion: prefs.includeConclusion,
                language: prefs.language,
                customModeEnabled: prefs.customModeEnabled,
                articleCount: prefs.articleCount,
                keywordMode: prefs.keywordMode,
              },
            };
            bufferItems.push(item);
            scheduleFlush();
          } catch (e) {
            failedCount++;
            failedGroups.push({ index: groupIndex, grp });
            console.error("group generate error:", e);
          } finally {
            processedCount += 1;
            updateProgress(processedCount, baseGroups.length);
          }
        })().finally(() => running.delete(task));

        running.add(task);
      };

      // Main loop
      while (idx < baseGroups.length || running.size > 0) {
        const cur = Math.max(12, Math.min(Math.floor(concurrency), MAX));
        while (running.size < cur && idx < baseGroups.length) startNext();
        if (!running.size && idx >= baseGroups.length) break;
        await Promise.race(Array.from(running));

        // Adapt concurrency to avoid 429 bursts, but keep speed (more aggressive)
        if (failedCount > processedCount * 0.2 && concurrency > 12) concurrency -= 0.5;
        else if (concurrency < MAX && failedCount < processedCount * 0.05) concurrency += 0.5;
      }

      // Tail retry (low & polite)
      if (failedGroups.length) {
        toast.message(`Retrying ${failedGroups.length} failed item(s) at low speed…`);
        const again = [...failedGroups];
        failedGroups.length = 0;

        const runOne = async (grp: KeywordRow[], groupIndex: number) => {
          const kws = grp.map(g => g.keyword);
          const urlMap: Record<string, string | null> = {};
          grp.forEach(g => { urlMap[g.keyword] = g.url ?? null; });

          const basePlan = buildPlanFromPrefs({
            keywords: kws,
            prefs: {
              ...prefs,
              sectionCount: (prefs.sectionCount as any) || 5,
              paragraphWords: (prefs.paragraphWords as any) || 100,
            },
            variationId: groupIndex + 1,
          });

          const res = await generateJSONTitleHtml({ keywords: kws, instructions: basePlan });
          const html0b = String(res.html || "");
          if (/—\s*draft\./i.test(html0b) || (html0b.match(/<h1>/gi) || []).length <= 1 || nonTokenWordCount(html0b) < 50) {
            throw new Error("LLM fallback/stub on retry");
          }

          let sections = ensureH1SectionsFromAnyHtml(res.html, wantSections, paraMin, paraMax, lc);
          sections = sections.map((s, i) => (kws[i] ? s.replace(/<\/p>/i, ` [ANCHOR:${kws[i]}]</p>`) : s));

          let bodyHtml = sections.join("");
          bodyHtml = squashRepetition(bodyHtml);
          if (!basicValidate(bodyHtml, kws, wantSections)) throw new Error("Basic validation failed on retry");

          const anchors = Object.keys(urlMap).map(k => ({ keyword: k, url: urlMap[k] || undefined }));
          let html = applyAnchorTokens(bodyHtml, anchors);
          html = removeAllTokens(html);

          const bodyCount = (bodyHtml.match(/<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/gi) || []).length;
          const secMap = computeSectionKeywordMap(bodyCount, kws);
          html = enforceSingleKeywordPerParagraph(html, kws, secMap);
          html = ensureNoTerminalKeyword(html, kws, lc);
          html = squashRepetition(html);

          // Additional humanization for AI-free content
          html = humanizeHtml(html);

          const item: ContentItem = {
            id: `${fileId}-retry-${groupIndex}-${Date.now()}`,
            keyword: kws[0],
            keywordsUsed: kws,
            generatedContent: html,
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
              sectionCount: prefs.sectionCount,
              includeConclusion: prefs.includeConclusion,
              language: prefs.language,
              customModeEnabled: prefs.customModeEnabled,
              articleCount: prefs.articleCount,
              keywordMode: prefs.keywordMode,
            },
          };
          bufferItems.push(item);
          scheduleFlush();
        };

        const RETRY_CONCURRENCY = 4; // Increased for faster retries
        const queue = [...again];
        const running2 = new Set<Promise<void>>();

        const startNextRetry = () => {
          if (!queue.length) return;
          const { grp, index } = queue.shift()!;
          const p = (async () => {
            try {
              await runOne(grp, index);
            } catch (e) {
              console.error("retry group failed:", e);
            }
          })().finally(() => running2.delete(p));
          running2.add(p);
        };

        while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
        while (running2.size || queue.length) {
          await Promise.race(Array.from(running2));
          while (running2.size < RETRY_CONCURRENCY && queue.length) startNextRetry();
          await new Promise(r => setTimeout(r, 200 + Math.random() * 200)); // Reduced delay
        }
      }

      flushNow();
      startTransition(() => {
        setExcelProjects((prev) => (prev ?? []).map((p) =>
          p.id === fileId ? { ...p, status: "completed", processedKeywords: baseGroups.length, failedCount } : p
        ));
      });
      const ok = baseGroups.length - failedCount;
      toast.success(`✅ Finished ${file.name}: ${ok} articles • ${failedCount} failed`);
      onProgress?.(100);
    } catch (error) {
      console.error("generateContent overall error:", error);
      startTransition(() => {
        setExcelProjects((prev) => (prev ?? []).map((p) =>
          p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p
        ));
      });
      toast.error(`Failed processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
      onProgress?.(100);
      throw error;
    } finally {
      flushNow();
      setIsProcessing(false);
    }
  };

  const deleteProject = (projectId: string) => {
    startTransition(() => {
      setExcelProjects((prev) => (prev ?? []).filter((p) => p.id !== projectId));
      setContentItems((prev) => (prev ?? []).filter((c) => c.fileId !== projectId));
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