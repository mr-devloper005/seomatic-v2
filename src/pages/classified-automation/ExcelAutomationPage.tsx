// // excel-automation-ui-and-hook.tsx
// // Drop-in React + hook file that implements:
// // 1) ExcelAutomationPage - premium UI page to upload an Excel/CSV and launch generate+publish automation
// // 2) useGenerateContentAndPublish - hook that performs generation (using your existing LLM util) and publishes to WordPress via REST API
// //
// // Notes:
// // - This file expects these project dependencies to exist: react, xlsx, sonner (toast), shadcn/ui components used in your project.
// // - It uses your existing LLM utilities: generateJSONTitleHtml and applyAnchorTokens. Import paths assume '@/lib/llm/api' (adjust if different).
// // - CORS: publishing directly from browser to remote WP sites requires the target sites to allow CORS on the REST endpoints. If you see CORS errors, run a tiny proxy server or perform the publish from a server-side endpoint.

// import { useCallback, useEffect, useState } from "react";
// import * as XLSX from "xlsx";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import { IconPlayerPlay, IconDownload } from "@tabler/icons-react";

// // Import your LLM helpers (from the big file you provided)
// import { generateJSONTitleHtml, applyAnchorTokens } from "@/lib/llm/api";

// /* ----------------------------- Types ------------------------------ */
// export type SiteDef = {
//   value: string; // domain
//   label?: string;
//   url?: string; // REST endpoint override; if not present will use https://{value}/wp-json/wp/v2
//   username?: string;
//   password?: string; // application password or basic-auth capable
//   type?: string;
// };

// export type UploadedRow = {
//   id: string;
//   raw: Record<string, any>;
//   keywords: string[];
//   instructions: string;
//   imageUrl?: string;
//   titleHint?: string;
//   tags?: string[];
// };

// export type RunResult = {
//   jobId: string;
//   status: "running" | "done" | "error";
//   progress: number;
//   backlinks: string[]; // published URLs
//   logs: string[];
// };

// /* ------------------------- Helper constants ----------------------- */
// // Simple default list - you can replace with your ALL_SITES array or feed from props
// const FALLBACK_SITES: SiteDef[] = [
//   {
//     value: "proclassifiedads.com",
//     label: "proclassifiedads.com",
//     username: "Zoran",
//     password: "",
//   },
//   {
//     value: "classifiedsposts.com",
//     label: "classifiedsposts.com",
//     username: "Fyren",
//     password: "",
//   },
//   {
//     value: "globaladsclassifieds.com",
//     label: "globaladsclassifieds.com",
//     username: "FlowTrack",
//     password: "",
//   },
//   {
//     value: "onlineclassifiedsads.com",
//     label: "onlineclassifiedsads.com",
//     username: "Velyn",
//     password: "",
//   },
//   {
//     value: "thelocanto.com",
//     label: "thelocanto.com",
//     username: "Tarka",
//     password: "",
//   },
//   {
//     value: "true-finders.com",
//     label: "true-finders.com",
//     username: "FlowTrack",
//     password: "",
//   },
//   {
//     value: "proadvertiser.org",
//     label: "proadvertiser.org",
//     username: "FlowTrack",
//     password: "",
//   },
// ];

// /* ------------------------- Utility fn's --------------------------- */
// function uid(prefix = "id") {
//   return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
// }

// async function readFileToRows(file: File): Promise<UploadedRow[]> {
//   const buf = await file.arrayBuffer();
//   const wb = XLSX.read(buf, { type: "array" });
//   const sheet = wb.Sheets[wb.SheetNames[0]];
//   const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
//     defval: "",
//   });

//   // Expect columns: keywords (comma-separated), instructions (text), imageUrl (optional), titleHint (optional), tags (comma)
//   return json.map((r) => {
//     const keywordsRaw = (
//       r["keywords"] ??
//       r["keyword"] ??
//       r["Keywords"] ??
//       ""
//     ).toString();
//     const instructions = (
//       r["instructions"] ??
//       r["instruction"] ??
//       r["Instructions"] ??
//       ""
//     ).toString();
//     const imageUrl =
//       (r["imageUrl"] ?? r["image"] ?? r["Image"] ?? "").toString() || undefined;
//     const titleHint =
//       (r["title"] ?? r["titleHint"] ?? "").toString() || undefined;
//     const tagsRaw = (r["tags"] ?? r["Tags"] ?? "").toString();

//     const keywords: string[] = keywordsRaw
//       .split(/[\,\|\n]+/) // comma/pipe/newline
//       .map((s: string) => s.trim())
//       .filter(Boolean);

//     const tags = tagsRaw
//       .split(/[\,\|\n]+/)
//       .map((s: string) => s.trim())
//       .filter(Boolean);

//     return {
//       id: uid("row"),
//       raw: r,
//       keywords,
//       instructions,
//       imageUrl,
//       titleHint,
//       tags,
//     } as UploadedRow;
//   });
// }

// function buildWpPostsEndpoint(site: SiteDef) {
//   if (site.url) return site.url.replace(/\/$/, "");
//   return `https://${site.value}/wp-json/wp/v2/posts`;
// }
// function buildWpMediaEndpoint(site: SiteDef) {
//   if (site.url) return site.url.replace(/\/posts\/?$/, "/media");
//   return `https://${site.value}/wp-json/wp/v2/media`;
// }

// function basicAuthHeader(username?: string, password?: string) {
//   if (!username || !password) return undefined;
//   return `Basic ${btoa(`${username}:${password}`)}`;
// }

// async function tryFetchImageAsBlob(url: string): Promise<Blob | null> {
//   try {
//     const res = await fetch(url);
//     if (!res.ok) return null;
//     const blob = await res.blob();
//     return blob;
//   } catch (err) {
//     return null;
//   }
// }

// /* ------------------- Hook: useGenerateContentAndPublish ------------ */
// export function useGenerateContentAndPublish() {
//   const [runs, setRuns] = useState<RunResult[]>([]);

//   const start = useCallback(
//     async (params: {
//       rows: UploadedRow[];
//       sites: SiteDef[]; // only selected sites in order
//       defaults?: {
//         imageFile?: File | null;
//         imageUrl?: string;
//         category?: string;
//         tags?: string[];
//       };
//       onProgress?: (progress: number) => void;
//     }) => {
//       const { rows, sites, defaults, onProgress } = params;
//       const jobId = uid("job");
//       const result: RunResult = {
//         jobId,
//         status: "running",
//         progress: 0,
//         backlinks: [],
//         logs: [],
//       };
//       setRuns((r) => [result, ...r]);

//       try {
//         // Only publish up to min(rows.length, sites.length)
//         const count = Math.min(rows.length, sites.length);
//         let completed = 0;

//         for (let i = 0; i < count; i++) {
//           const row = rows[i];
//           const site = sites[i];
//           const logs: string[] = [];

//           try {
//             logs.push(
//               `Generating content for row ${i + 1} → site ${site.value}`
//             );
//             // Build prompt via your existing builder - assume generateJSONTitleHtml accepts keywords & instructions
//             const gen = await generateJSONTitleHtml({
//               keywords: row.keywords,
//               instructions: row.instructions,
//               titleLength: 90,
//             });

//             // apply anchors if user wants - example uses keywords as anchors mapping to nothing
//             const htmlWithAnchors = applyAnchorTokens(
//               gen.html,
//               row.keywords.map((k) => ({ keyword: k }))
//             );

//             // Image handling: try default file => row.imageUrl => defaults.imageUrl
//             let featuredMediaId: number | undefined;

//             // Priority: defaults.imageFile > row.imageUrl > defaults.imageUrl
//             const fileToUse = defaults?.imageFile ?? null;

//             if (fileToUse) {
//               logs.push("Uploading default image to site");
//               const mediaId = await uploadImageToSite(site, fileToUse);
//               if (mediaId) {
//                 featuredMediaId = mediaId;
//                 logs.push(`Uploaded image id ${mediaId}`);
//               } else {
//                 logs.push(
//                   "Image upload failed for default file — will continue without featured_media"
//                 );
//               }
//             } else if (row.imageUrl) {
//               // Try fetch remote image and upload as blob
//               logs.push(`Fetching remote image ${row.imageUrl}`);
//               const blob = await tryFetchImageAsBlob(row.imageUrl);
//               if (blob) {
//                 // convert blob to File
//                 const f = new File([blob], `img-${Date.now()}.jpg`, {
//                   type: blob.type || "image/jpeg",
//                 });
//                 const mediaId = await uploadImageToSite(site, f);
//                 if (mediaId) {
//                   featuredMediaId = mediaId;
//                   logs.push(`Uploaded remote image id ${mediaId}`);
//                 } else {
//                   logs.push("Remote image upload failed — continuing");
//                 }
//               } else {
//                 logs.push(
//                   "Could not fetch remote image due to CORS or network — continuing"
//                 );
//               }
//             } else if (defaults?.imageUrl) {
//               logs.push(`Fetching default image ${defaults.imageUrl}`);
//               const blob = await tryFetchImageAsBlob(defaults.imageUrl);
//               if (blob) {
//                 const f = new File([blob], `img-${Date.now()}.jpg`, {
//                   type: blob.type || "image/jpeg",
//                 });
//                 const mediaId = await uploadImageToSite(site, f);
//                 if (mediaId) {
//                   featuredMediaId = mediaId;
//                   logs.push(`Uploaded default remote image id ${mediaId}`);
//                 } else {
//                   logs.push("Default remote image upload failed — continuing");
//                 }
//               } else {
//                 logs.push(
//                   "Could not fetch default remote image due to CORS or network — continuing"
//                 );
//               }
//             }

//             // Build post payload
//             const postPayload: any = {
//               title: gen.title,
//               content: htmlWithAnchors,
//               status: "publish",
//             };
//             if (featuredMediaId) postPayload.featured_media = featuredMediaId;
//             if (defaults?.category)
//               postPayload.categories = [defaults.category];
//             if (row.tags?.length) postPayload.tags = row.tags; // note: WP expects tag IDs; to create tags we'd need extra calls - here we pass strings which may fail if WP expects ints

//             logs.push(
//               `Publishing post to ${site.value} → ${buildWpPostsEndpoint(site)}`
//             );
//             const postResp = await publishPostToSite(site, postPayload);

//             // Extract url
//             const url = extractWpPostUrl(postResp);
//             if (url) {
//               result.backlinks.push(url);
//               logs.push(`Published: ${url}`);
//             } else {
//               logs.push(
//                 `Publish returned unexpected response: ${JSON.stringify(
//                   postResp
//                 ).slice(0, 200)}`
//               );
//             }
//           } catch (err: any) {
//             logs.push(`Error for row ${i + 1}: ${String(err?.message ?? err)}`);
//           }

//           // update logs and progress
//           setRuns((prev) =>
//             prev.map((r) =>
//               r.jobId === jobId
//                 ? {
//                     ...r,
//                     logs: [...r.logs, ...logs],
//                     progress: Math.round(((i + 1) / count) * 100),
//                   }
//                 : r
//             )
//           );
//           completed++;
//           onProgress?.(Math.round((completed / count) * 100));
//         }

//         // finish
//         setRuns((prev) =>
//           prev.map((r) =>
//             r.jobId === jobId ? { ...r, status: "done", progress: 100 } : r
//           )
//         );
//         toast.success(
//           `Job ${jobId} completed with ${result.backlinks.length} backlinks`
//         );
//       } catch (err: any) {
//         setRuns((prev) =>
//           prev.map((r) =>
//             r.jobId === jobId
//               ? {
//                   ...r,
//                   status: "error",
//                   logs: [...r.logs, String(err?.message ?? err)],
//                 }
//               : r
//           )
//         );
//         toast.error(`Job ${jobId} failed: ${String(err?.message ?? err)}`);
//       }

//       return jobId;
//     },
//     []
//   );

//   const downloadRunExcel = useCallback(
//     async (jobId: string) => {
//       const run = runs.find((r) => r.jobId === jobId);
//       if (!run) return;
//       const rows = run.backlinks.map((link, idx) => ({
//         index: idx + 1,
//         url: link,
//       }));
//       const ws = XLSX.utils.json_to_sheet(rows);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "results");
//       const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//       const blob = new Blob([buf], { type: "application/octet-stream" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${jobId}-results.xlsx`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     },
//     [runs]
//   );

//   return { runs, start, downloadRunExcel };
// }

// /* ------------------- Small site interaction helpers ---------------- */
// async function uploadImageToSite(
//   site: SiteDef,
//   file: File
// ): Promise<number | null> {
//   const endpoint = buildWpMediaEndpoint(site);
//   const fd = new FormData();
//   fd.append("file", file, file.name);

//   const headers: Record<string, string> = {};
//   const auth = basicAuthHeader(site.username, site.password);
//   if (auth) headers["Authorization"] = auth;

//   try {
//     const resp = await fetch(endpoint, { method: "POST", body: fd, headers });
//     if (!resp.ok) {
//       console.warn("media upload failed", resp.status, await resp.text());
//       return null;
//     }
//     const json = await resp.json();
//     if (json?.id) return Number(json.id);
//     return null;
//   } catch (err) {
//     console.warn("media upload error", err);
//     return null;
//   }
// }

// async function publishPostToSite(site: SiteDef, payload: any): Promise<any> {
//   const endpoint = buildWpPostsEndpoint(site);
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//   };
//   const auth = basicAuthHeader(site.username, site.password);
//   if (auth) headers["Authorization"] = auth;
//   const resp = await fetch(endpoint, {
//     method: "POST",
//     headers,
//     body: JSON.stringify(payload),
//   });
//   const json = await resp.json().catch(() => null);
//   return json ?? { status: resp.status };
// }

// function extractWpPostUrl(resp: any): string | null {
//   if (!resp) return null;
//   if (typeof resp === "string") return resp;
//   if (resp?.link) return resp.link;
//   if (resp?.guid?.rendered) return resp.guid.rendered;
//   // fallback: find first string that looks like url in response
//   const s = JSON.stringify(resp);
//   const m = s.match(/https?:\/\/[^"' ]+/);
//   return m ? m[0] : null;
// }

// /* -------------------- UI Component (page) -------------------------- */
// export default function ExcelAutomationPage({
//   sites = FALLBACK_SITES,
// }: {
//   sites?: SiteDef[];
// }) {
//   const { runs, start, downloadRunExcel } = useGenerateContentAndPublish();

//   const [file, setFile] = useState<File | null>(null);
//   const [rows, setRows] = useState<UploadedRow[]>([]);
//   const [selectedSites, setSelectedSites] = useState<SiteDef[]>([]);
//   const [defaults, setDefaults] = useState<{
//     imageFile?: File | null;
//     imageUrl?: string;
//     category?: string;
//   }>({});
//   const [isRunning, setIsRunning] = useState(false);
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     // auto-trim selectedSites to rows length
//     if (rows.length === 0) setSelectedSites([]);
//     if (selectedSites.length > rows.length)
//       setSelectedSites((s) => s.slice(0, rows.length));
//   }, [rows, selectedSites.length]);

//   async function handleFileChange(f?: File | null) {
//     setFile(f ?? null);
//     if (!f) return setRows([]);
//     try {
//       const parsed = await readFileToRows(f);
//       setRows(parsed);
//       toast.success(`Loaded ${parsed.length} rows`);
//     } catch (err) {
//       console.error(err);
//       toast.error(
//         "Failed to parse file. Ensure it is a valid Excel/CSV file with headers."
//       );
//     }
//   }

//   function toggleSite(site: SiteDef) {
//     setSelectedSites((prev) => {
//       const exists = prev.find((p) => p.value === site.value);
//       if (exists) return prev.filter((p) => p.value !== site.value);
//       // only allow up to rows.length
//       if (rows.length === 0) {
//         toast.error(
//           "Upload content first (Excel) then choose same number of sites."
//         );
//         return prev;
//       }
//       if (prev.length >= rows.length) {
//         toast.error(
//           `You can select up to ${rows.length} sites (1 content → 1 site).`
//         );
//         return prev;
//       }
//       return [...prev, site];
//     });
//   }

//   async function handleStart() {
//     if (!file || rows.length === 0) {
//       toast.error("Upload an Excel with content rows first.");
//       return;
//     }
//     if (selectedSites.length === 0) {
//       toast.error(
//         "Select sites equal to number of contents you want to publish (1:1 mapping)."
//       );
//       return;
//     }

//     setIsRunning(true);
//     setProgress(0);
//     try {
//       const jobId = await start({
//         rows,
//         sites: selectedSites,
//         defaults,
//         onProgress: (p) => setProgress(p),
//       });
//       toast.success(`Started job ${jobId}`);
//     } catch (err: any) {
//       toast.error(String(err?.message ?? err));
//     } finally {
//       setIsRunning(false);
//     }
//   }

//   const canStart =
//     rows.length > 0 &&
//     selectedSites.length > 0 &&
//     selectedSites.length <= rows.length;

//   return (
//     <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
//       <div className="max-w-6xl mx-auto space-y-6">
//         <header className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-indigo-900">
//               Excel → Generate → Publish
//             </h1>
//             <p className="text-sm text-indigo-600">
//               Upload an Excel (keywords + instructions). Select sites (1 content
//               → 1 site). Click Launch.
//             </p>
//           </div>
//           <div className="flex gap-3 items-center">
//             <Label className="text-sm">Upload Excel / CSV</Label>
//             <Input
//               type="file"
//               accept=".xlsx,.xls,.csv"
//               onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
//             />
//           </div>
//         </header>

//         <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="col-span-2 space-y-4">
//             <div className="bg-white rounded-2xl p-4 shadow">
//               <div className="flex items-center justify-between">
//                 <div className="font-semibold">Parsed Rows</div>
//                 <Badge className="bg-indigo-100 text-indigo-700">
//                   {rows.length}
//                 </Badge>
//               </div>

//               <div className="mt-3 max-h-80 overflow-auto divide-y">
//                 {rows.length === 0 && (
//                   <div className="p-6 text-sm text-indigo-500">
//                     No rows yet — upload Excel with columns: keywords,
//                     instructions, imageUrl (optional), tags (optional)
//                   </div>
//                 )}
//                 {rows.map((r, idx) => (
//                   <div key={r.id} className="p-3 flex items-start gap-3">
//                     <div className="w-8 font-mono text-sm text-indigo-600">
//                       {String(idx + 1).padStart(2, "0")}
//                     </div>
//                     <div className="flex-1">
//                       <div className="font-semibold text-gray-900 truncate">
//                         {r.titleHint ?? r.keywords.join(", ")}
//                       </div>
//                       <div className="text-sm text-indigo-600 mt-1">
//                         {r.instructions.slice(0, 120)}
//                         {r.instructions.length > 120 ? "..." : ""}
//                       </div>
//                       <div className="text-xs text-gray-500 mt-2">
//                         Keywords: {r.keywords.join(", ") || "—"} | Image:{" "}
//                         {r.imageUrl ? "yes" : "—"}
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-sm text-indigo-700">
//                         Site slot: {selectedSites[idx]?.value ?? "—"}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl p-4 shadow flex items-center gap-4">
//               <div className="flex-1">
//                 <div className="font-semibold">Defaults & Image</div>
//                 <div className="text-sm text-indigo-600">
//                   Optional default image (used if row has no image). Featured
//                   image will be uploaded to each target site.
//                 </div>
//               </div>
//               <div className="w-64">
//                 <Input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) =>
//                     setDefaults((d) => ({
//                       ...d,
//                       imageFile: e.target.files?.[0] ?? undefined,
//                     }))
//                   }
//                 />
//                 <Input
//                   className="mt-2"
//                   value={defaults.imageUrl ?? ""}
//                   onChange={(e) =>
//                     setDefaults((d) => ({ ...d, imageUrl: e.target.value }))
//                   }
//                   placeholder="Default image URL (fallback)"
//                 />
//               </div>
//             </div>
//           </div>

//           <aside className="space-y-4">
//             <div className="bg-white rounded-2xl p-4 shadow">
//               <div className="font-semibold">Target Sites</div>
//               <div className="text-sm text-indigo-600 mt-2">
//                 Select sites — you must select at most the number of rows you
//                 want to publish (1 content → 1 site).
//               </div>
//               <div className="mt-3 max-h-72 overflow-auto divide-y">
//                 {sites.map((s) => (
//                   <label
//                     key={s.value}
//                     className={`flex items-center justify-between p-2 cursor-pointer ${
//                       selectedSites.find((x) => x.value === s.value)
//                         ? "bg-indigo-50/40 rounded-xl"
//                         : ""
//                     }`}>
//                     <div>
//                       <div className="font-medium">{s.label ?? s.value}</div>
//                       <div className="text-xs text-indigo-500">
//                         {s.username ?? "user"} • {s.value}
//                       </div>
//                     </div>
//                     <div>
//                       <input
//                         type="checkbox"
//                         checked={
//                           !!selectedSites.find((x) => x.value === s.value)
//                         }
//                         onChange={() => toggleSite(s)}
//                       />
//                     </div>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl p-4 shadow text-center">
//               <Button
//                 onClick={handleStart}
//                 disabled={!canStart || isRunning}
//                 className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
//                 <IconPlayerPlay className="inline mr-2" />{" "}
//                 {isRunning
//                   ? `Running… ${progress}%`
//                   : `Launch (${Math.min(rows.length, selectedSites.length)})`}
//               </Button>

//               {isRunning && <Progress value={progress} className="mt-3" />}

//               <div className="text-xs text-indigo-600 mt-2">
//                 Note: Publishing directly from browser may be blocked by CORS.
//                 If you see CORS errors, run a small proxy or use a server-side
//                 flow.
//               </div>
//             </div>
//           </aside>
//         </section>

//         <section>
//           <h2 className="text-lg font-semibold">Run History</h2>

//           <div className="mt-3 space-y-4">
//             {runs.map((r) => (
//               <div key={r.jobId} className="bg-white rounded-2xl p-4 shadow">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="font-semibold">Job {r.jobId}</div>
//                   <div className="flex items-center gap-2">
//                     <Badge>{r.status}</Badge>
//                     <Button size="sm" onClick={() => downloadRunExcel(r.jobId)}>
//                       <IconDownload className="mr-2" />
//                       Export
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="mb-3">
//                   Progress: <Progress value={r.progress} />
//                 </div>
//                 <div className="grid gap-2">
//                   {r.backlinks.length === 0 && (
//                     <div className="text-sm text-indigo-500">
//                       No backlinks yet.
//                     </div>
//                   )}
//                   {r.backlinks.map((b) => (
//                     <div key={b} className="flex items-center justify-between">
//                       <a
//                         href={b}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-indigo-700 truncate max-w-[70%]">
//                         {b}
//                       </a>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => {
//                           navigator.clipboard.writeText(b);
//                           toast.success("Copied");
//                         }}>
//                         Copy
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//                 {r.logs.length > 0 && (
//                   <details className="mt-3">
//                     <summary className="cursor-pointer text-sm text-indigo-600">
//                       View logs
//                     </summary>
//                     <pre className="mt-2 text-xs text-gray-700 max-h-48 overflow-auto p-2 bg-indigo-50 rounded">
//                       {r.logs.join("\n")}
//                     </pre>
//                   </details>
//                 )}
//               </div>
//             ))}

//             {runs.length === 0 && (
//               <div className="text-sm text-indigo-500">
//                 No runs yet. Start a job to see history and export results.
//               </div>
//             )}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
