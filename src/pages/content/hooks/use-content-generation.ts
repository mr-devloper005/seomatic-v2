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




// src/hooks/use-content-generation.ts
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import * as XLSX from "xlsx";


console.log("🧩 ENV TEST →", {
  keyType: typeof import.meta.env.VITE_GEMINI_API_KEY,
  value: import.meta.env.VITE_GEMINI_API_KEY,
});


/**
 * useContentGeneration
 * - Full updated copy with robust model extraction, fallback prompt, improved logging,
 *   excel extraction that finds optional URL in same row,
 *   and openContentEditor() helper to open the JustPasteIt-like editor in a new tab.
 */

/* ---------- Types ---------- */
export interface ContentItem {
  id: string;
  keyword: string;
  generatedContent: string; // can be plain text or HTML
  fileId: string;
  fileName: string;
  createdAt: string; // ISO
  title?: string;
  targetUrl?: string | null; // optional hyperlink to apply to first keyword occurrence
}

interface ExcelProject {
  id: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "error";
  totalKeywords: number;
  processedKeywords: number;
  createdAt: string;
  error?: string;
}
const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

if (!apiKey || apiKey.length < 30) {
  console.error("❌ Gemini API key missing or invalid! ENV:", import.meta.env);
  throw new Error("Gemini API key not set");
}


type GenerateProgressCallback = (progressPercentage: number) => void;

/* ---------- Constants & Prompt ---------- */
const SESSION_KEY = "open-content-item_v1";
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"] as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const buildPrompt = (keyword: string) =>
  `You are a seasoned British editor who actually does this work. Write like a person: specific, a bit idiosyncratic, sometimes blunt, never salesy. Prioritise clarity, lived detail, and practical judgement over polish. Do not mention prompts, AI, rules, or your process.

Inputs

TOPIC: ${keyword}

DOMAIN FOCUS (stay strictly on this): {{domain_focus}}
Main keyword is ${keyword}.

Title must be 60 to 70 characters long.

MAIN IDEA WORDS (use sparingly; prefer synonyms): ${keyword}

AUDIENCE: People who already care and want practical, hands-on guidance.

STYLE (tone guide only): human  

What to produce

A complete article that feels brutally human: empathetic, frank, grounded in real practice. Use British English.

Start with a quick, vivid micro-scene tied to (≤40 words). No greetings.

Then state why this matters now and your core stance in plain words.

Create 5–7 short, clear section headings. Make section lengths uneven (roughly 80–140 words each; some shorter, one longer).

Mix sentence lengths. Use plenty of short lines for punch. Allow one natural-sounding imperfection (an aside or informal run-on) if it helps voice.

Work in concrete, checkable specifics that practitioners recognise: measurements, tolerances, timings, file sizes, tool names, materials, costs, noise levels, etc. Include at least four tiny numbers/units (e.g., “±0.3 mm”, “190–220 gsm”, “20-minute cure”, “~500 KB”).

Include one small anecdote (1–3 sentences) and one counter-intuitive tip that actually helps.

Add exactly one internal-link anchor placeholder somewhere natural: [anchor text] (no URL).

If {{brand_name}} is provided, mention it once in the final section only, first-person plural (“we provide …”), and nowhere else.

Keep {{keywords}} usage sparse and natural; bold a target keyword only when it truly fits the sentence, not every section.

Use a numbered list only for sequential steps or numeric checks; otherwise write in paragraphs.

Bans & guardrails

Stay strictly on topic: {{domain_focus}}. Do not drift into unrelated products, medical devices, or generic tech.

Avoid these phrases anywhere: “In conclusion,” “To summarise,” “Moreover,” “Furthermore,” “At the end of the day,” “look no further,” “tailor,” “dive,” “delve,” “step into,” “seamless experience.”

No meta-commentary about writing, AI, or detectors. No filler clichés.

Don’t over-explain basics the audience already knows; show advanced judgement instead.

Quality bar (do silently before returning)

British spelling; tone is candid, practical, and lived-in.

Sections are uneven; cadence varies; plenty of short sentences.

one short title 

tone like an 15 - 20 year old kid 

the conte mus be not look like ai  

please add human touch in content the human touch is aur priorty please generate human like words uses in daily  life simple words .

≥4 concrete micro-details with real numbers/units.

[anchor text] ${keyword} appears once. Brand appears once (if provided) only in the final section.

IMPORTANT (for editor linking): Include **exactly one** machine-visible anchor marker in the HTML/text where you want the keyword hyperlinked. Use this exact token: [ANCHOR:${keyword}] (including square brackets) placed immediately before the target phrase or replacing the phrase. Example: "We recommend [ANCHOR:FDA registered hearing aids] for...". Make sure the literal text '[ANCHOR:${keyword}]' appears once in the response.


No topic drift; no banned phrases; no meta.`;

/* ---------- Excel parsing helpers (with URL detection) ---------- */
function isLikelyUrlOrDomain(s: string | undefined | null) {
  if (!s) return false;
  const trimmed = String(s).trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^www\./i.test(trimmed)) return true;
  if (/^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(trimmed) && !/\s/.test(trimmed)) return true;
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

function pickKeywordColumn(rows: unknown[][]): number | null {
  if (!rows || rows.length === 0) return null;
  const headerCandidates = rows.slice(0, 5);
  let headerRowIndex = -1;
  for (let i = 0; i < headerCandidates.length; i++) {
    const r = headerCandidates[i];
    if (!Array.isArray(r)) continue;
    const nonEmpty = r.some((c) => typeof c === "string" && String(c).trim().length > 0);
    if (nonEmpty) {
      headerRowIndex = i;
      break;
    }
  }
  const headerRow = headerRowIndex >= 0 && Array.isArray(rows[headerRowIndex]) ? (rows[headerRowIndex] as unknown[]) : [];
  const headerNames = headerRow.map((c) => String(c ?? "").trim().toLowerCase());
  const preferredHeaders = ["keyword", "keywords", "topic", "title", "query", "search term", "focus keyword", "term", "phrase"];
  for (let i = 0; i < headerNames.length; i++) {
    if (preferredHeaders.includes(headerNames[i])) return i;
  }
  const lookahead = rows.slice(Math.max(0, headerRowIndex + 1), Math.min(rows.length, (headerRowIndex + 1) + 200));
  const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);
  let bestCol = -1;
  let bestScore = 0;
  for (let col = 0; col < maxCols; col++) {
    let score = 0;
    let total = 0;
    for (const r of lookahead) {
      const cell = Array.isArray(r) ? r[col] : undefined;
      const s = sanitizeKeyword(cell);
      if (s) score++;
      if (cell !== undefined && cell !== null && String(cell).trim() !== "") total++;
    }
    if (total === 0) continue;
    const weighted = score * 100 + Math.min(total, 100);
    if (weighted > bestScore) {
      bestScore = weighted;
      bestCol = col;
    }
  }
  if (bestCol >= 0) {
    let validCount = 0;
    for (const r of rows.slice(1, 201)) {
      const cell = Array.isArray(r) ? r[bestCol] : undefined;
      if (sanitizeKeyword(cell)) validCount++;
      if (validCount >= 2) break;
    }
    if (validCount >= 2) return bestCol;
  }
  return null;
}

type KeywordRow = { keyword: string; url?: string | null };

function extractKeywordsFromWorksheetWithUrls(worksheet: XLSX.WorkSheet): KeywordRow[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) as unknown[][];
  if (!rows || rows.length === 0) return [];
  const col = pickKeywordColumn(rows);
  if (col == null) return [];
  const dataRows = rows.slice(1);
  const found: KeywordRow[] = [];
  const seen = new Set<string>();
  const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 0);

  for (const r of dataRows) {
    if (!Array.isArray(r)) continue;
    const raw = r[col];
    const k = sanitizeKeyword(raw);
    if (!k) continue;
    if (seen.has(k)) continue;

    // search nearby cells for URL (offset -3..+3)
    let url: string | undefined;
    for (let offset = -3; offset <= 3; offset++) {
      if (offset === 0) continue;
      const idx = col + offset;
      if (idx < 0 || idx >= maxCols) continue;
      const other = r[idx];
      if (!other) continue;
      const s = String(other).trim();
      if (isLikelyUrlOrDomain(s)) {
        url = s;
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        break;
      }
    }

    // fallback scan whole row for any URL
    if (!url) {
      for (let c = 0; c < maxCols; c++) {
        if (c === col) continue;
        const other = r[c];
        if (!other) continue;
        const s = String(other).trim();
        if (isLikelyUrlOrDomain(s)) {
          url = s;
          if (!/^https?:\/\//i.test(url)) url = "https://" + url;
          break;
        }
      }
    }

    found.push({ keyword: k, url: url ?? null });
    seen.add(k);
  }

  // fallback: search broadly if nothing found
  if (found.length === 0) {
    for (let rIdx = 1; rIdx < rows.length; rIdx++) {
      const r = rows[rIdx];
      if (!Array.isArray(r)) continue;
      for (let c = 0; c < maxCols; c++) {
        const k = sanitizeKeyword(r[c]);
        if (k && !seen.has(k)) {
          found.push({ keyword: k, url: null });
          seen.add(k);
        }
      }
      if (found.length > 0) break;
    }
  }

  return found;
}

function extractKeywordsFromWorkbookBufferWithUrls(buffer: ArrayBuffer | Uint8Array): { keywords: KeywordRow[]; perSheet?: Record<string, number> } {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetNames = workbook.SheetNames ?? [];
  const combined: KeywordRow[] = [];
  const seen = new Set<string>();
  const perSheet: Record<string, number> = {};

  for (const sheetName of sheetNames) {
    try {
      const sheet = workbook.Sheets[sheetName];
      const sheetKeywords = extractKeywordsFromWorksheetWithUrls(sheet);
      perSheet[sheetName] = sheetKeywords.length;
      for (const k of sheetKeywords) {
        if (!seen.has(k.keyword)) {
          seen.add(k.keyword);
          combined.push(k);
        }
      }
      if (combined.length > 2000) break;
    } catch (e) {
      console.warn("worksheet parse failed:", sheetName, e);
    }
  }

  return { keywords: combined, perSheet };
}

/* ---------- Client reuse ---------- */
const clientCache: Record<string, any> = {};
function getClient(apiKey: string) {
  const cleanKey = apiKey?.trim();
  if (!cleanKey || cleanKey.length < 30) throw new Error("API key required for getClient");
  if (clientCache[cleanKey]) return clientCache[cleanKey];
  clientCache[cleanKey] = new GoogleGenerativeAI(cleanKey);
  return clientCache[cleanKey];
}

/* ---------- Model output extraction & fallback ---------- */
function extractGeneratedText(result: any): string | null {
  try {
    if (!result) return null;

    // Common SDK shape used earlier: result.response.text()
    if (result?.response && typeof result.response.text === "function") {
      const t = result.response.text();
      if (t && String(t).trim()) return String(t).trim();
    }

    // candidates array
    if (Array.isArray(result?.candidates) && result.candidates.length > 0) {
      const cand = result.candidates[0];
      if (typeof cand === "string" && cand.trim()) return cand.trim();
      if (cand?.content) {
        const c = cand.content?.text ?? cand.content;
        if (c && String(c).trim()) return String(c).trim();
      }
    }

    // older/simpler shape
    if (result?.output_text && String(result.output_text).trim()) return String(result.output_text).trim();

    // try some nested properties
    const maybe = result?.text ?? result?.content ?? null;
    if (maybe && typeof maybe === "string" && maybe.trim()) return maybe.trim();

    // give up
  } catch (e) {
    console.warn("extractGeneratedText error:", e);
  }
  return null;
}

/* ---------- openContentEditor (plain function) ---------- */
export function openContentEditor(item: ContentItem) {
  try {
    // store in sessionStorage if available
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(item));
    } catch (e) {
      console.warn("sessionStorage write failed for openContentEditor", e);
      try {
        localStorage.setItem(`${SESSION_KEY}_fallback`, JSON.stringify(item));
      } catch (_e) {
        // ignore
      }
    }

    const win = window.open("/content/editor", "_blank");
    if (!win) {
      toast.error("Popup blocked — allow popups to open the editor in a new tab.");
    }
  } catch (e) {
    console.error("openContentEditor error:", e);
    try { window.location.href = "/content/editor"; } catch (_) {}
  }
}

/* ---------- Hook Implementation ---------- */
export function useContentGeneration(passedApiKey?: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [contentItems, setContentItems] = useLocalStorage<ContentItem[]>("content-items", []);
  const [excelProjects, setExcelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);

console.log("ENV →", import.meta.env);

  function resolveApiKey(): string {
    if (passedApiKey && passedApiKey.trim()) return passedApiKey.trim();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = (typeof import.meta !== "undefined" ? (import.meta as any) : undefined);
      if (meta?.env?.VITE_GEMINI_API_KEY) return String(meta.env.VITE_GEMINI_API_KEY).trim();
    } catch (_e) { /* ignore */ }
    return "";
  }

  const generateContentForKeyword = async (keyword: string, apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("Gemini API key not set.");
    const client = getClient(apiKey);
    let lastError: unknown;

    for (const modelName of MODELS) {
      try {
        const model = (client as any).getGenerativeModel({ model: modelName as string });
        const prompt = buildPrompt(keyword);

        // attempt generation
        const result = await model.generateContent(prompt);

        // debug truncated log
        try {
          const head = JSON.stringify(result).slice(0, 1200);
          console.debug(`[gen:${modelName}] result head for "${keyword}":`, head);
        } catch { /* ignore stringify errors */ }

        const text = extractGeneratedText(result);
        if (!text) {
          // attempt fallback extraction or throw to retry
          console.warn(`[generateContentForKeyword] model=${modelName} returned empty text for "${keyword}"`);
          throw new Error("Model returned no text");
        }
        return text;
      } catch (e) {
        lastError = e;
        const errMsg = (e as Error)?.message ?? String(e);
        console.error(`[generateContentForKeyword] model ${modelName} failed for "${keyword}":`, errMsg);
        const lowered = String(errMsg).toLowerCase();
        if (lowered.includes("tunnel") || lowered.includes("proxy") || lowered.includes("failed to fetch")) {
          toast.error("Network error communicating with Gemini (proxy/tunnel). Check network and try again.");
        }
        if (lowered.includes("429") || lowered.includes("rate")) {
          // small wait then try next model
          await sleep(800);
        }
        // continue to next model
      }
    }
    // all models failed; throw last error
    throw lastError ?? new Error("All models failed");
  };

  const ensureProject = (proj: ExcelProject) => {
    setExcelProjects((prev = []) => {
      const exists = prev.some((p) => p.id === proj.id);
      if (exists) return prev.map((p) => (p.id === proj.id ? { ...p, ...proj } : p));
      return [...prev, proj];
    });
  };

  /**
   * generateContent(file, fileId, onProgress)
   * - extracts keywords + urls
   * - generates content, stores ContentItem with optional targetUrl
   */
  const generateContent = async (file: File, fileId: string, onProgress?: GenerateProgressCallback) => {
    setIsProcessing(true);
    onProgress?.(0);
    const API_KEY = resolveApiKey();
    console.info("generateContent start:", file.name, fileId, "apiKeyPresent?", !!API_KEY);

    ensureProject({
      id: fileId,
      fileName: file.name,
      status: "pending",
      totalKeywords: 0,
      processedKeywords: 0,
      createdAt: new Date().toISOString(),
    });

    const contentBuffer: ContentItem[] = [];
    let flushTimer: number | null = null;
    const FLUSH_COUNT = 10;
    const FLUSH_MS = 400;

    const scheduleFlush = () => {
      if (flushTimer != null) return;
      // @ts-ignore
      flushTimer = window.setTimeout(() => { flushNow(); }, FLUSH_MS);
    };

    const flushNow = () => {
      if (flushTimer != null) {
        clearTimeout(flushTimer as any);
        flushTimer = null;
      }
      if (contentBuffer.length === 0) return;
      const toWrite = contentBuffer.splice(0, contentBuffer.length);
      setContentItems((prev) => [...(prev ?? []), ...toWrite]);
    };

    // progress throttle
    let lastProgress = -1;
    let lastProgressTs = 0;
    const PROGRESS_MIN_DIFF = 1;
    const PROGRESS_MIN_MS = 300;
    const throttleProgress = (processed: number, total: number) => {
      const now = Date.now();
      const pct = Math.round((processed / Math.max(1, total)) * 100);
      if (pct === lastProgress && now - lastProgressTs < PROGRESS_MIN_MS) return;
      if (Math.abs(pct - lastProgress) < PROGRESS_MIN_DIFF && now - lastProgressTs < PROGRESS_MIN_MS) return;
      lastProgress = pct;
      lastProgressTs = now;
      setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, processedKeywords: processed } : p)));
      try { onProgress?.(pct); } catch (_) { /* ignore */ }
    };

    try {
      const buffer = await file.arrayBuffer();
      console.debug("Read file bytes:", buffer.byteLength);

      const { keywords, perSheet } = extractKeywordsFromWorkbookBufferWithUrls(buffer);
      console.info("Extracted keywords:", keywords.length, perSheet);

      if (!keywords || keywords.length === 0) {
        const projError: ExcelProject = {
          id: fileId,
          fileName: file.name,
          status: "error",
          totalKeywords: 0,
          processedKeywords: 0,
          createdAt: new Date().toISOString(),
          error: "No valid keywords found in uploaded Excel file",
        };
        ensureProject(projError);
        toast.error("No valid keywords found in the uploaded Excel file.");
        onProgress?.(100);
        return;
      }

      const project: ExcelProject = {
        id: fileId,
        fileName: file.name,
        status: "processing",
        totalKeywords: keywords.length,
        processedKeywords: 0,
        createdAt: new Date().toISOString(),
      };
      ensureProject(project);
      toast.info(`Found ${keywords.length} keywords. Starting generation...`);

      // Adaptive concurrency
      let concurrency = Math.min(6, Math.max(1, Math.floor(navigator.hardwareConcurrency ? navigator.hardwareConcurrency / 2 : 2)));
      const MIN_CONCURRENCY = 1;
      const MAX_CONCURRENCY = 8;
      let consecutiveNetworkErrors = 0;
      let processedCount = 0;
      let index = 0;

      const generateWithRetries = async (keyword: string): Promise<string | null> => {
        let attempt = 0;
        const MAX_ATTEMPTS = 3;
        let backoff = 600;
        while (attempt < MAX_ATTEMPTS) {
          attempt++;
          try {
            const text = await generateContentForKeyword(keyword, API_KEY);
            if (text && text.trim()) return text;
            // unexpected empty -> throw to retry
            throw new Error("Empty response text");
          } catch (err) {
            console.error(`[generateWithRetries] attempt ${attempt} failed for "${keyword}":`, err);
            const msg = (err as Error)?.message?.toLowerCase() ?? "";
            const isNetwork = msg.includes("tunnel") || msg.includes("proxy") || msg.includes("failed to fetch") || msg.includes("network");
            if (isNetwork) {
              consecutiveNetworkErrors++;
              concurrency = Math.max(MIN_CONCURRENCY, Math.floor(concurrency / 2));
              toast.warning("Network hiccup detected — reducing concurrency to " + concurrency);
            }
            if (attempt < MAX_ATTEMPTS) {
              await sleep(backoff);
              backoff *= 2;
              continue;
            }

            // final fallback: try a much smaller prompt to coax output
            try {
              const fallbackPrompt = `Write a short human-sounding two-paragraph piece about "${keyword}". Keep it simple and natural.`;
              const client = getClient(API_KEY);
              const model = (client as any).getGenerativeModel({ model: MODELS[0] as string });
              const fallbackResult = await model.generateContent(fallbackPrompt);
              const fallbackText = extractGeneratedText(fallbackResult);
              if (fallbackText && fallbackText.trim()) {
                console.warn(`[generateWithRetries] fallback succeeded for "${keyword}"`);
                return fallbackText.trim();
              }
            } catch (fallbackErr) {
              console.error(`[generateWithRetries] fallback also failed for "${keyword}":`, fallbackErr);
            }

            return null;
          }
        }
        return null;
      };

      // Worker loop
      const running = new Set<Promise<void>>();
      const startNext = () => {
        if (index >= keywords.length) return;
        const kr = keywords[index++];
        const kw = kr.keyword;
        const url = kr.url ?? null;
        const curIndex = index;
        const task = (async () => {
          try {
            const generated = await generateWithRetries(kw);
            if (generated) {
              const contentItem: ContentItem = {
                id: `${fileId}-${curIndex}-${Date.now()}`,
                keyword: kw,
                generatedContent: generated,
                fileId,
                fileName: file.name,
                createdAt: new Date().toISOString(),
                targetUrl: url,
                title: kw, // default title = keyword (user can edit in editor)
              };
              contentBuffer.push(contentItem);
              if (contentBuffer.length >= FLUSH_COUNT) flushNow();
              else scheduleFlush();
            } else {
              console.warn("generation returned null for keyword:", kw);
            }
          } catch (e) {
            console.error("Unexpected generate error:", e);
          } finally {
            processedCount++;
            throttleProgress(processedCount, keywords.length);
            // adapt concurrency
            if (consecutiveNetworkErrors === 0 && concurrency < MAX_CONCURRENCY) {
              concurrency = Math.min(MAX_CONCURRENCY, concurrency + 0.2);
            } else if (consecutiveNetworkErrors >= 3) {
              concurrency = Math.max(MIN_CONCURRENCY, Math.floor(concurrency / 2));
              consecutiveNetworkErrors = 0;
            }
          }
        })().finally(() => running.delete(task));
        running.add(task);
      };

      // start loop
      while (index < keywords.length || running.size > 0) {
        const curConcurrency = Math.max(MIN_CONCURRENCY, Math.min(MAX_CONCURRENCY, Math.floor(concurrency)));
        while (running.size < curConcurrency && index < keywords.length) {
          startNext();
        }
        if (running.size === 0 && index >= keywords.length) break;
        // await any
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await Promise.race(Array.from(running));
      }

      // finalize
      flushNow();
      setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "completed", processedKeywords: keywords.length } : p)));
      toast.success(`Finished processing ${file.name}. Generated content for ${keywords.length} keywords (approx).`);
      onProgress?.(100);
    } catch (error) {
      console.error("generateContent overall error:", error);
      setExcelProjects((prev) => (prev ?? []).map((p) => (p.id === fileId ? { ...p, status: "error", error: error instanceof Error ? error.message : String(error) } : p)));
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
    openContentEditor, // export helper too
  };
}
