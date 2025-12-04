// // // // // /pages/classified-automation/hooks/useListingAutomation.ts
// // // // import { useEffect, useMemo, useRef, useState } from "react";

// // // // /* ===== Types (match your page) ===== */
// // // // export type GeneratedItem = {
// // // //   id: string;
// // // //   keyword?: string | string[];
// // // //   title?: string;
// // // //   html?: string;
// // // //   generatedContent?: string;
// // // //   images?: string[];
// // // //   fileId?: string;
// // // //   fileName?: string;
// // // //   createdAt?: number | string;
// // // // };

// // // // export type Address = {
// // // //   country: string;
// // // //   state: string;
// // // //   city: string;
// // // //   zip: string;
// // // //   line1: string;
// // // // };

// // // // export type Socials = {
// // // //   facebook?: string;
// // // //   twitter?: string;
// // // //   linkedin?: string;
// // // //   pinterest?: string;
// // // //   instagram?: string;
// // // //   yelp?: string;
// // // //   gmb?: string;
// // // // };

// // // // export type AutomationListing = {
// // // //   id: string;
// // // //   title: string;
// // // //   contentHtml: string;
// // // //   images: string[];
// // // //   keywords: string[];
// // // //   category?: string;
// // // // };

// // // // export type AutomationPayload = {
// // // //   site: string;
// // // //   login: { username: string; password: string };
// // // //   profile: {
// // // //     phone?: string;
// // // //     website?: string;
// // // //     email?: string;
// // // //     socials?: Socials;
// // // //     address?: Address;
// // // //   };
// // // //   listings: AutomationListing[];
// // // // };

// // // // export type UseListingAutomationOptions = {
// // // //   /** Custom image uploader – returns a public URL for the file */
// // // //   uploadImage?: (file: File) => Promise<string>;
// // // //   /** How often to poll status endpoint (ms) */
// // // //   statusPollIntervalMs?: number;
// // // //   /** Stop polling after N minutes */
// // // //   maxPollMinutes?: number;
// // // //   /** Override endpoints if needed */
// // // //   endpoints?: {
// // // //     start?: string; // default /api/automation/start
// // // //     status?: (jobId: string) => string; // default (id)=>/api/automation/status/:id
// // // //   };
// // // // };

// // // // export type StartParams = {
// // // //   site: string;
// // // //   username: string;
// // // //   password: string;
// // // //   defaults: {
// // // //     category?: string;
// // // //     keywordsDefaults?: string[];
// // // //     imageUrl?: string;       // default image URL (used if item has none)
// // // //     imageFile?: File | null; // uploader will create URL if provided
// // // //     profile: {
// // // //       phone?: string;
// // // //       website?: string;
// // // //       email?: string;
// // // //       socials?: Socials;
// // // //       address?: Address;
// // // //     };
// // // //   };
// // // //   /** Build payload & return it without calling backend */
// // // //   dryRun?: boolean;
// // // // };

// // // // export type Project = { id: string; name: string; items: GeneratedItem[] };

// // // // function getItemTitle(it: GeneratedItem) {
// // // //   return it.title ?? "";
// // // // }
// // // // function getItemHtml(it: GeneratedItem) {
// // // //   return (it.html ?? it.generatedContent ?? "").toString();
// // // // }
// // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // //   if (typeof it.keyword === "string") {
// // // //     return it.keyword.split(/[,\|]/).map((s) => s.trim()).filter(Boolean);
// // // //   }
// // // //   return [];
// // // // }

// // // // /* ===== Hook ===== */
// // // // export function useListingAutomation(
// // // //   allItems: GeneratedItem[],
// // // //   opts: UseListingAutomationOptions = {}
// // // // ) {
// // // //   const {
// // // //     uploadImage,
// // // //     statusPollIntervalMs = 1500,
// // // //     maxPollMinutes = 10,
// // // //     endpoints,
// // // //   } = opts;


// // // //   /* Group by project */
// // // //   const projects: Project[] = useMemo(() => {
// // // //     const map = new Map<string, GeneratedItem[]>();
// // // //     for (const it of allItems) {
// // // //       const key = it.fileId ?? "__misc__";
// // // //       if (!map.has(key)) map.set(key, []);
// // // //       map.get(key)!.push(it);
// // // //     }
// // // //     return Array.from(map.entries()).map(([pid, arr]) => ({
// // // //       id: pid,
// // // //       name: arr[0]?.fileName || pid || "Untitled Project",
// // // //       items: arr,
// // // //     }));
// // // //   }, [allItems]);

// // // //   /* Search (filters items inside projects) */
// // // //   const [search, setSearch] = useState("");
// // // //   const filteredProjects: Project[] = useMemo(() => {
// // // //     const q = search.toLowerCase().trim();
// // // //     if (!q) return projects;
// // // //     return projects
// // // //       .map((p) => {
// // // //         const its = p.items.filter((it) => {
// // // //           const txt = `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase();
// // // //           return txt.includes(q);
// // // //         });
// // // //         return { ...p, items: its };
// // // //       })
// // // //       .filter((p) => p.items.length > 0);
// // // //   }, [projects, search]);

// // // //   /* Expansion + selection */
// // // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // // //   const toggleProjectExpand = (pid: string) => {
// // // //     setExpandedProjectIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       n.has(pid) ? n.delete(pid) : n.add(pid);
// // // //       return n;
// // // //     });
// // // //   };

// // // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

// // // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);

// // // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // // //     setSelectedProjectIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       checked ? n.add(pid) : n.delete(pid);
// // // //       return n;
// // // //     });
// // // //     const proj = projects.find((p) => p.id === pid);
// // // //     if (proj) {
// // // //       setSelectedItemIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         for (const it of proj.items) {
// // // //           checked ? n.add(it.id) : n.delete(it.id);
// // // //         }
// // // //         return n;
// // // //       });
// // // //     }
// // // //   };

// // // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // // //     setSelectedItemIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       checked ? n.add(iid) : n.delete(iid);
// // // //       return n;
// // // //     });
// // // //     const proj = projects.find((p) => p.id === pid);
// // // //     if (proj) {
// // // //       // compute after-state to sync project tri-state
// // // //       const after = new Set(selectedItemIds);
// // // //       checked ? after.add(iid) : after.delete(iid);
// // // //       const allSelected = proj.items.every((it) => after.has(it.id));
// // // //       const noneSelected = proj.items.every((it) => !after.has(it.id));
// // // //       setSelectedProjectIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         if (allSelected) n.add(pid);
// // // //         else if (noneSelected) n.delete(pid);
// // // //         return n;
// // // //       });
// // // //     }
// // // //   };

// // // //   const clearSelection = () => {
// // // //     setSelectedProjectIds(new Set());
// // // //     setSelectedItemIds(new Set());
// // // //   };
// // // //   const selectAllVisible = () => {
// // // //     const all = new Set<string>();
// // // //     filteredProjects.forEach((p) => p.items.forEach((it) => all.add(it.id)));
// // // //     setSelectedItemIds(all);
// // // //     setSelectedProjectIds(new Set(filteredProjects.map((p) => p.id)));
// // // //   };

// // // //   /* Focused preview */
// // // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // // //   const focusedItem = useMemo(
// // // //     () => allItems.find((x) => x.id === focusedItemId),
// // // //     [allItems, focusedItemId]
// // // //   );

// // // //   /* Selected items array */
// // // //   const selectedItems = useMemo(
// // // //     () => allItems.filter((it) => selectedItemIds.has(it.id)),
// // // //     [allItems, selectedItemIds]
// // // //   );

// // // //   /* ===== Build listings & payload ===== */
// // // //   async function resolveDefaultImageUrl(imageUrl?: string, imageFile?: File | null) {
// // // //     if (imageUrl?.trim()) return imageUrl.trim();
// // // //     if (imageFile) {
// // // //       if (uploadImage) return await uploadImage(imageFile);
// // // //       // Fallback: blob URL (only good for preview; backend should handle upload itself)
// // // //       return URL.createObjectURL(imageFile);
// // // //     }
// // // //     return "";
// // // //   }

// // // //   function buildListingsForSelected(params: {
// // // //     category?: string;
// // // //     keywordsDefaults?: string[];
// // // //     defaultImageUrl?: string;
// // // //   }): AutomationListing[] {
// // // //     const { category, keywordsDefaults = [], defaultImageUrl = "" } = params;

// // // //     const listings: AutomationListing[] = selectedItems.map((it) => {
// // // //       const ownKeywords = getItemKeywords(it);
// // // //       const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
// // // //       const hasOwnImg = it.images && it.images.length > 0;
// // // //       const images = hasOwnImg ? (it.images as string[]) : (defaultImageUrl ? [defaultImageUrl] : []);
// // // //       return {
// // // //         id: it.id,
// // // //         title: getItemTitle(it),
// // // //         contentHtml: getItemHtml(it),
// // // //         images,
// // // //         keywords: mergedKeywords,
// // // //         category: category || undefined,
// // // //       };
// // // //     });

// // // //     // Guard: ensure essential fields & images
// // // //     const bad = listings.filter((l) => !l.title || !l.contentHtml);
// // // //     if (bad.length) {
// // // //       const ids = bad.map((b) => b.id).join(", ");
// // // //       throw new Error(`Some items missing title/content: ${ids}`);
// // // //     }
// // // //     const missingImg = listings.filter((l) => l.images.length === 0);
// // // //     if (missingImg.length) {
// // // //       const ids = missingImg.map((b) => b.id).join(", ");
// // // //       throw new Error(`Some items missing image: ${ids}`);
// // // //     }

// // // //     return listings;
// // // //   }

// // // //   async function buildPayload(params: StartParams): Promise<AutomationPayload> {
// // // //     const {
// // // //       site,
// // // //       username,
// // // //       password,
// // // //       defaults: { category, keywordsDefaults, imageUrl, imageFile, profile },
// // // //     } = params;

// // // //     if (!site || !username || !password) {
// // // //       throw new Error("Site, Username, and Password are required.");
// // // //     }
// // // //     if (selectedItems.length === 0) {
// // // //       throw new Error("No items selected.");
// // // //     }

// // // //     const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile);
// // // //     const listings = buildListingsForSelected({
// // // //       category,
// // // //       keywordsDefaults,
// // // //       defaultImageUrl,
// // // //     });

// // // //     return {
// // // //       site,
// // // //       login: { username, password },
// // // //       profile,
// // // //       listings,
// // // //     };
// // // //   }

// // // //   /* ===== Start + Poll status ===== */
// // // //   const [isStarting, setIsStarting] = useState(false);
// // // //   const [jobId, setJobId] = useState<string | null>(null);
// // // //   const [progress, setProgress] = useState(0);
// // // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
// // // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // // //   const pollStartTime = useRef<number>(0);

// // // //   function cancelPolling() {
// // // //     if (pollTimer.current) {
// // // //       clearInterval(pollTimer.current);
// // // //       pollTimer.current = null;
// // // //     }
// // // //   }

// // // //   async function start(params: StartParams): Promise<{
// // // //     jobId: string | null;
// // // //     listings: number;
// // // //     payload: AutomationPayload;
// // // //   }> {
// // // //     setIsStarting(true);
// // // //     setStatus("idle");
// // // //     setProgress(0);
// // // //     setJobId(null);
// // // //     cancelPolling();

// // // //     try {
// // // //       const payload = await buildPayload(params);

// // // //       console.log("Starting automation with payload:", payload);

// // // //       if (params.dryRun) {
// // // //         // Return payload without calling backend (for preview)
// // // //         return { jobId: null, listings: payload.listings.length, payload };
// // // //       }

// // // //       const startUrl = endpoints?.start ?? "/api/automation/start";
// // // //       const res = await fetch(startUrl, {
// // // //         method: "POST",
// // // //         headers: { "Content-Type": "application/json" },
// // // //         body: JSON.stringify(payload),
// // // //       });
// // // //       if (!res.ok) throw new Error(`Backend error: ${res.status}`);
// // // //       const data = await res.json(); // { jobId }
// // // //       const jid = data.jobId ?? null;
// // // //       setJobId(jid);
// // // //       setStatus("running");

// // // //       // Poll for progress
// // // //       if (jid) {
// // // //         pollStartTime.current = Date.now();
// // // //         pollTimer.current = setInterval(async () => {
// // // //           const minutes = (Date.now() - pollStartTime.current) / 60000;
// // // //           if (minutes > maxPollMinutes) {
// // // //             cancelPolling();
// // // //             setStatus("error");
// // // //             return;
// // // //           }
// // // //           try {
// // // //             const statusUrl =
// // // //               endpoints?.status?.(jid) ?? `/api/automation/status/${jid}`;
// // // //             const s = await fetch(statusUrl);
// // // //             if (s.ok) {
// // // //               const j = await s.json(); // { progress, status }
// // // //               if (typeof j.progress === "number") {
// // // //                 setProgress(Math.max(0, Math.min(100, j.progress)));
// // // //               }
// // // //               if (j.status === "done") {
// // // //                 cancelPolling();
// // // //                 setStatus("done");
// // // //                 setProgress(100);
// // // //               } else if (j.status === "error") {
// // // //                 cancelPolling();
// // // //                 setStatus("error");
// // // //               } else {
// // // //                 // running
// // // //                 setStatus("running");
// // // //               }
// // // //             }
// // // //           } catch {
// // // //             // ignore transient poll errors
// // // //           }
// // // //         }, statusPollIntervalMs);
// // // //       }

// // // //       return { jobId: jid, listings: payload.listings.length, payload };
// // // //     } finally {
// // // //       setIsStarting(false);
// // // //     }
// // // //   }

// // // //   /* Cleanup polling on unmount */
// // // //   useEffect(() => cancelPolling, []);

// // // //   return {
// // // //     /* search + projects */
// // // //     search,
// // // //     setSearch,
// // // //     projects,
// // // //     filteredProjects,

// // // //     /* expansion + selection */
// // // //     expandedProjectIds,
// // // //     toggleProjectExpand,
// // // //     selectedProjectIds,
// // // //     selectedItemIds,
// // // //     isProjectSelected,
// // // //     isItemSelected,
// // // //     setProjectChecked,
// // // //     setItemChecked,
// // // //     selectAllVisible,
// // // //     clearSelection,

// // // //     /* focused preview */
// // // //     focusedItemId,
// // // //     setFocusedItemId,
// // // //     focusedItem,

// // // //     /* selected array */
// // // //     selectedItems,

// // // //     /* automation controls */
// // // //     buildPayload,
// // // //     start,
// // // //     cancelPolling,
// // // //     isStarting,
// // // //     jobId,
// // // //     progress,
// // // //     status,
// // // //   };
// // // // }




// // // // // /pages/classified-automation/hooks/useListingAutomation.ts
// // // // import { useEffect, useMemo, useRef, useState } from "react";

// // // // /* ===== Types (match your page) ===== */
// // // // export type GeneratedItem = {
// // // //   id: string;
// // // //   keyword?: string | string[];
// // // //   title?: string;
// // // //   html?: string;
// // // //   generatedContent?: string;
// // // //   images?: string[];
// // // //   fileId?: string;
// // // //   fileName?: string;
// // // //   createdAt?: number | string;
// // // // };

// // // // export type Address = {
// // // //   country: string;
// // // //   state: string;
// // // //   city: string;
// // // //   zip: string;
// // // //   line1: string;
// // // // };

// // // // export type Socials = {
// // // //   facebook?: string;
// // // //   twitter?: string;
// // // //   linkedin?: string;
// // // //   pinterest?: string;
// // // //   instagram?: string;
// // // //   yelp?: string;
// // // //   gmb?: string;
// // // // };

// // // // export type AutomationListing = {
// // // //   id: string;
// // // //   title: string;
// // // //   contentHtml: string;
// // // //   images: string[];
// // // //   keywords: string[];
// // // //   category?: string;
// // // // };

// // // // /** Per-site payload (1 site = 1 listing as per your rule) */
// // // // export type AutomationTargetSite = {
// // // //   site: string;
// // // //   login: { username: string; password: string };
// // // //   listings: AutomationListing[]; // will be length 1
// // // // };

// // // // /** Multi-site payload */
// // // // export type AutomationPayload = {
// // // //   profile: {
// // // //     phone?: string;
// // // //     website?: string;
// // // //     email?: string;
// // // //     socials?: Socials;
// // // //     address?: Address;
// // // //   };
// // // //   targets: AutomationTargetSite[];
// // // // };

// // // // export type UseListingAutomationOptions = {
// // // //   /** Custom image uploader – returns a public URL for the file */
// // // //   uploadImage?: (file: File) => Promise<string>;
// // // //   /** How often to poll status endpoint (ms) */
// // // //   statusPollIntervalMs?: number;
// // // //   /** Stop polling after N minutes */
// // // //   maxPollMinutes?: number;
// // // //   /** Override endpoints if needed */
// // // //   endpoints?: {
// // // //     start?: string; // default /api/automation/start
// // // //     status?: (jobId: string) => string; // default (id)=>/api/automation/status/:id
// // // //   };

// // // //   /** NEW: max total selectable items (like sites count = 7) */
// // // //   maxSelectableItems?: number;
// // // //   /** NEW: callback if user tries to exceed max */
// // // //   onMaxExceeded?: (max: number) => void;
// // // // };

// // // // export type StartParams = {
// // // //   /** NEW: multiple sites with fixed creds */
// // // //   sites: { site: string; username: string; password: string }[];
// // // //   defaults: {
// // // //     category?: string;
// // // //     keywordsDefaults?: string[];
// // // //     imageUrl?: string;
// // // //     imageFile?: File | null;
// // // //     profile: {
// // // //       phone?: string;
// // // //       website?: string;
// // // //       email?: string;
// // // //       socials?: Socials;
// // // //       address?: Address;
// // // //     };
// // // //   };
// // // //   /** Build payload & return it without calling backend */
// // // //   dryRun?: boolean;
// // // // };

// // // // export type Project = { id: string; name: string; items: GeneratedItem[] };

// // // // function getItemTitle(it: GeneratedItem) {
// // // //   return it.title ?? "";
// // // // }
// // // // function getItemHtml(it: GeneratedItem) {
// // // //   return (it.html ?? it.generatedContent ?? "").toString();
// // // // }
// // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // //   if (typeof it.keyword === "string") {
// // // //     return it.keyword.split(/[,\|]/).map((s) => s.trim()).filter(Boolean);
// // // //   }
// // // //   return [];
// // // // }

// // // // /* ===== Hook ===== */
// // // // export function useListingAutomation(
// // // //   allItems: GeneratedItem[],
// // // //   opts: UseListingAutomationOptions = {}
// // // // ) {
// // // //   const {
// // // //     uploadImage,
// // // //     statusPollIntervalMs = 1500,
// // // //     maxPollMinutes = 10,
// // // //     endpoints,
// // // //     maxSelectableItems = Infinity,
// // // //     onMaxExceeded,
// // // //   } = opts;

// // // //   /* Group by project */
// // // //   const projects: Project[] = useMemo(() => {
// // // //     const map = new Map<string, GeneratedItem[]>();
// // // //     for (const it of allItems) {
// // // //       const key = it.fileId ?? "__misc__";
// // // //       if (!map.has(key)) map.set(key, []);
// // // //       map.get(key)!.push(it);
// // // //     }
// // // //     return Array.from(map.entries()).map(([pid, arr]) => ({
// // // //       id: pid,
// // // //       name: arr[0]?.fileName || pid || "Untitled Project",
// // // //       items: arr,
// // // //     }));
// // // //   }, [allItems]);

// // // //   /* Search (filters items inside projects) */
// // // //   const [search, setSearch] = useState("");
// // // //   const filteredProjects: Project[] = useMemo(() => {
// // // //     const q = search.toLowerCase().trim();
// // // //     if (!q) return projects;
// // // //     return projects
// // // //       .map((p) => {
// // // //         const its = p.items.filter((it) => {
// // // //           const txt = `${getItemTitle(it)} ${getItemKeywords(it).join(
// // // //             " "
// // // //           )}`.toLowerCase();
// // // //           return txt.includes(q);
// // // //         });
// // // //         return { ...p, items: its };
// // // //       })
// // // //       .filter((p) => p.items.length > 0);
// // // //   }, [projects, search]);

// // // //   /* Expansion + selection */
// // // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
// // // //     new Set()
// // // //   );
// // // //   const toggleProjectExpand = (pid: string) => {
// // // //     setExpandedProjectIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       n.has(pid) ? n.delete(pid) : n.add(pid);
// // // //       return n;
// // // //     });
// // // //   };

// // // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(
// // // //     new Set()
// // // //   );
// // // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
// // // //     new Set()
// // // //   );

// // // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);

// // // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // // //     const proj = projects.find((p) => p.id === pid);
// // // //     if (!proj) return;

// // // //     if (!checked) {
// // // //       // unselect all in project
// // // //       setSelectedProjectIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         n.delete(pid);
// // // //         return n;
// // // //       });
// // // //       setSelectedItemIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         for (const it of proj.items) n.delete(it.id);
// // // //         return n;
// // // //       });
// // // //       return;
// // // //     }

// // // //     // checked = true -> select as many as capacity allows
// // // //     setSelectedItemIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       let added = 0;
// // // //       for (const it of proj.items) {
// // // //         if (n.size >= maxSelectableItems) break;
// // // //         if (!n.has(it.id)) {
// // // //           n.add(it.id);
// // // //           added++;
// // // //         }
// // // //       }
// // // //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// // // //       return n;
// // // //     });

// // // //     // project fully selected only if all items fit
// // // //     setSelectedProjectIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       const after = new Set(selectedItemIds);
// // // //       for (const it of proj.items) {
// // // //         if (after.size >= maxSelectableItems) break;
// // // //         after.add(it.id);
// // // //       }
// // // //       const allSelectedNow = proj.items.every((it) => after.has(it.id));
// // // //       if (allSelectedNow) n.add(pid);
// // // //       return n;
// // // //     });
// // // //   };

// // // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // // //     const proj = projects.find((p) => p.id === pid);

// // // //     setSelectedItemIds((prev) => {
// // // //       const n = new Set(prev);

// // // //       if (checked) {
// // // //         if (n.size >= maxSelectableItems && !n.has(iid)) {
// // // //           onMaxExceeded?.(maxSelectableItems);
// // // //           return prev; // block
// // // //         }
// // // //         n.add(iid);
// // // //       } else {
// // // //         n.delete(iid);
// // // //       }
// // // //       return n;
// // // //     });

// // // //     if (proj) {
// // // //       const after = new Set(selectedItemIds);
// // // //       checked ? after.add(iid) : after.delete(iid);
// // // //       const allSelected = proj.items.every((it) => after.has(it.id));
// // // //       const noneSelected = proj.items.every((it) => !after.has(it.id));
// // // //       setSelectedProjectIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         if (allSelected) n.add(pid);
// // // //         else if (noneSelected) n.delete(pid);
// // // //         return n;
// // // //       });
// // // //     }
// // // //   };

// // // //   const clearSelection = () => {
// // // //     setSelectedProjectIds(new Set());
// // // //     setSelectedItemIds(new Set());
// // // //   };
// // // //   const selectAllVisible = () => {
// // // //     const all = new Set<string>();
// // // //     for (const p of filteredProjects) {
// // // //       for (const it of p.items) {
// // // //         if (all.size >= maxSelectableItems) break;
// // // //         all.add(it.id);
// // // //       }
// // // //       if (all.size >= maxSelectableItems) break;
// // // //     }
// // // //     setSelectedItemIds(all);

// // // //     // Mark project selected only if all items in that project got selected
// // // //     const projIds = new Set<string>();
// // // //     for (const p of filteredProjects) {
// // // //       const allInProj = p.items.every((it) => all.has(it.id));
// // // //       if (allInProj) projIds.add(p.id);
// // // //     }
// // // //     setSelectedProjectIds(projIds);

// // // //     if (filteredProjects.flatMap((p) => p.items).length > maxSelectableItems) {
// // // //       onMaxExceeded?.(maxSelectableItems);
// // // //     }
// // // //   };

// // // //   /* Focused preview */
// // // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // // //   const focusedItem = useMemo(
// // // //     () => allItems.find((x) => x.id === focusedItemId),
// // // //     [allItems, focusedItemId]
// // // //   );

// // // //   /* Selected items array */
// // // //   const selectedItems = useMemo(
// // // //     () => allItems.filter((it) => selectedItemIds.has(it.id)),
// // // //     [allItems, selectedItemIds]
// // // //   );

// // // //   /* ===== Build listings & payload ===== */
// // // //   async function resolveDefaultImageUrl(
// // // //     imageUrl?: string,
// // // //     imageFile?: File | null
// // // //   ) {
// // // //     if (imageUrl?.trim()) return imageUrl.trim();
// // // //     if (imageFile) {
// // // //       if (uploadImage) return await uploadImage(imageFile);
// // // //       return URL.createObjectURL(imageFile);
// // // //     }
// // // //     return "";
// // // //   }

// // // //   function buildListingsForSelected(params: {
// // // //     category?: string;
// // // //     keywordsDefaults?: string[];
// // // //     defaultImageUrl?: string;
// // // //   }): AutomationListing[] {
// // // //     const { category, keywordsDefaults = [], defaultImageUrl = "" } = params;

// // // //     const listings: AutomationListing[] = selectedItems.map((it) => {
// // // //       const ownKeywords = getItemKeywords(it);
// // // //       const mergedKeywords = Array.from(
// // // //         new Set([...ownKeywords, ...keywordsDefaults])
// // // //       ).filter(Boolean);
// // // //       const hasOwnImg = it.images && it.images.length > 0;
// // // //       const images = hasOwnImg
// // // //         ? (it.images as string[])
// // // //         : defaultImageUrl
// // // //         ? [defaultImageUrl]
// // // //         : [];
// // // //       return {
// // // //         id: it.id,
// // // //         title: getItemTitle(it),
// // // //         contentHtml: getItemHtml(it),
// // // //         images,
// // // //         keywords: mergedKeywords,
// // // //         category: category || undefined,
// // // //       };
// // // //     });

// // // //     const bad = listings.filter((l) => !l.title || !l.contentHtml);
// // // //     if (bad.length) {
// // // //       const ids = bad.map((b) => b.id).join(", ");
// // // //       throw new Error(`Some items missing title/content: ${ids}`);
// // // //     }
// // // //     const missingImg = listings.filter((l) => l.images.length === 0);
// // // //     if (missingImg.length) {
// // // //       const ids = missingImg.map((b) => b.id).join(", ");
// // // //       throw new Error(`Some items missing image: ${ids}`);
// // // //     }

// // // //     return listings;
// // // //   }

// // // //   async function buildPayload(params: StartParams): Promise<AutomationPayload> {
// // // //     const {
// // // //       sites,
// // // //       defaults: { category, keywordsDefaults, imageUrl, imageFile, profile },
// // // //     } = params;

// // // //     if (!Array.isArray(sites) || sites.length === 0) {
// // // //       throw new Error("No sites selected.");
// // // //     }
// // // //     if (sites.some((s) => !s.site || !s.username || !s.password)) {
// // // //       throw new Error("Every selected site must have site + username + password.");
// // // //     }
// // // //     if (selectedItems.length === 0) {
// // // //       throw new Error("No items selected.");
// // // //     }
// // // //     if (selectedItems.length > sites.length) {
// // // //       throw new Error(
// // // //         `Select ${selectedItems.length} sites to match ${selectedItems.length} items.`
// // // //       );
// // // //     }
// // // //     if (sites.length !== selectedItems.length) {
// // // //       throw new Error(
// // // //         `Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`
// // // //       );
// // // //     }

// // // //     const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile);
// // // //     const listings = buildListingsForSelected({
// // // //       category,
// // // //       keywordsDefaults,
// // // //       defaultImageUrl,
// // // //     });

// // // //     // 1 listing per site (same order)
// // // //     const targets: AutomationTargetSite[] = sites.map((s, idx) => ({
// // // //       site: s.site,
// // // //       login: { username: s.username, password: s.password },
// // // //       listings: [listings[idx]],
// // // //     }));

// // // //     return {
// // // //       profile,
// // // //       targets,
// // // //     };
// // // //   }

// // // //   /* ===== Start + Poll status ===== */
// // // //   const [isStarting, setIsStarting] = useState(false);
// // // //   const [jobId, setJobId] = useState<string | null>(null);
// // // //   const [progress, setProgress] = useState(0);
// // // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
// // // //     "idle"
// // // //   );
// // // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // // //   const pollStartTime = useRef<number>(0);

// // // //   function cancelPolling() {
// // // //     if (pollTimer.current) {
// // // //       clearInterval(pollTimer.current);
// // // //       pollTimer.current = null;
// // // //     }
// // // //   }

// // // //   async function start(params: StartParams): Promise<{
// // // //     jobId: string | null;
// // // //     listings: number;
// // // //     payload: AutomationPayload;
// // // //   }> {
// // // //     setIsStarting(true);
// // // //     setStatus("idle");
// // // //     setProgress(0);
// // // //     setJobId(null);
// // // //     cancelPolling();

// // // //     try {
// // // //       const payload = await buildPayload(params);
// // // //       const listingsCount = payload.targets.reduce(
// // // //         (sum, t) => sum + t.listings.length,
// // // //         0
// // // //       );

// // // //       console.log("Starting automation with payload:", payload);

// // // //       if (params.dryRun) {
// // // //         return { jobId: null, listings: listingsCount, payload };
// // // //       }

// // // //       const startUrl = endpoints?.start ?? "http://localhost:8080/api/automation/start";
// // // //       const res = await fetch(startUrl, {
// // // //         method: "POST",
// // // //         headers: { "Content-Type": "application/json" },
// // // //         body: JSON.stringify(payload),
// // // //       });
// // // //       if (!res.ok) throw new Error(`Backend error: ${res.status}`);
// // // //       const data = await res.json(); // { jobId }
// // // //       const jid = data.jobId ?? null;
// // // //       setJobId(jid);
// // // //       setStatus("running");

// // // //       if (jid) {
// // // //         pollStartTime.current = Date.now();
// // // //         pollTimer.current = setInterval(async () => {
// // // //           const minutes = (Date.now() - pollStartTime.current) / 60000;
// // // //           if (minutes > maxPollMinutes) {
// // // //             cancelPolling();
// // // //             setStatus("error");
// // // //             return;
// // // //           }
// // // //           try {
// // // //             const statusUrl =
// // // //               endpoints?.status?.(jid) ?? `/api/automation/status/${jid}`;
// // // //             const s = await fetch(statusUrl);
// // // //             if (s.ok) {
// // // //               const j = await s.json(); // { progress, status }
// // // //               if (typeof j.progress === "number") {
// // // //                 setProgress(Math.max(0, Math.min(100, j.progress)));
// // // //               }
// // // //               if (j.status === "done") {
// // // //                 cancelPolling();
// // // //                 setStatus("done");
// // // //                 setProgress(100);
// // // //               } else if (j.status === "error") {
// // // //                 cancelPolling();
// // // //                 setStatus("error");
// // // //               } else {
// // // //                 setStatus("running");
// // // //               }
// // // //             }
// // // //           } catch {
// // // //             // ignore transient poll errors
// // // //           }
// // // //         }, statusPollIntervalMs);
// // // //       }

// // // //       return { jobId: jid, listings: listingsCount, payload };
// // // //     } finally {
// // // //       setIsStarting(false);
// // // //     }
// // // //   }

// // // //   /* Cleanup polling on unmount */
// // // //   useEffect(() => cancelPolling, []);

// // // //   return {
// // // //     /* search + projects */
// // // //     search,
// // // //     setSearch,
// // // //     projects,
// // // //     filteredProjects,

// // // //     /* expansion + selection */
// // // //     expandedProjectIds,
// // // //     toggleProjectExpand,
// // // //     selectedProjectIds,
// // // //     selectedItemIds,
// // // //     isProjectSelected,
// // // //     isItemSelected,
// // // //     setProjectChecked,
// // // //     setItemChecked,
// // // //     selectAllVisible,
// // // //     clearSelection,

// // // //     /* focused preview */
// // // //     focusedItemId,
// // // //     setFocusedItemId,
// // // //     focusedItem,

// // // //     /* selected array */
// // // //     selectedItems,

// // // //     /* automation controls */
// // // //     buildPayload,
// // // //     start,
// // // //     cancelPolling,
// // // //     isStarting,
// // // //     jobId,
// // // //     progress,
// // // //     status,
// // // //   };
// // // // }



// // // // // /pages/classified-automation/hooks/useListingAutomation.ts
// // // // import { useEffect, useMemo, useRef, useState } from "react";

// // // // /* ===== Types (match your page) ===== */
// // // // export type GeneratedItem = {
// // // //   id: string;
// // // //   keyword?: string | string[];
// // // //   title?: string;
// // // //   html?: string;
// // // //   generatedContent?: string;
// // // //   images?: string[];
// // // //   fileId?: string;
// // // //   fileName?: string;
// // // //   createdAt?: number | string;
// // // // };

// // // // export type Address = {
// // // //   country: string;
// // // //   state: string;
// // // //   city: string;
// // // //   zip: string;
// // // //   line1: string;
// // // // };

// // // // export type Socials = {
// // // //   facebook?: string;
// // // //   twitter?: string;
// // // //   linkedin?: string;
// // // //   pinterest?: string;
// // // //   instagram?: string;
// // // //   yelp?: string;
// // // //   gmb?: string;
// // // // };

// // // // export type AutomationListing = {
// // // //   id: string;
// // // //   title: string;
// // // //   contentHtml: string;
// // // //   images: string[];
// // // //   keywords: string[];
// // // //   category?: string;
// // // // };

// // // // /** Per-site payload (1 site = 1 listing as per your rule) */
// // // // export type AutomationTargetSite = {
// // // //   site: string;
// // // //   login: { username: string; password: string };
// // // //   listings: AutomationListing[]; // will be length 1
// // // // };

// // // // /** Multi-site payload */
// // // // export type AutomationPayload = {
// // // //   profile: {
// // // //     phone?: string;
// // // //     website?: string;
// // // //     email?: string;
// // // //     socials?: Socials;
// // // //     address?: Address;
// // // //   };
// // // //   targets: AutomationTargetSite[];
// // // // };

// // // // export type UseListingAutomationOptions = {
// // // //   /** Custom image uploader – returns a public URL for the file */
// // // //   uploadImage?: (file: File) => Promise<string>;
// // // //   /** How often to poll status endpoint (ms) */
// // // //   statusPollIntervalMs?: number;
// // // //   /** Stop polling after N minutes */
// // // //   maxPollMinutes?: number;
// // // //   /** Override endpoints if needed */
// // // //   endpoints?: {
// // // //     start?: string; // default /api/automation/start
// // // //     status?: (jobId: string) => string; // default (id)=>/api/automation/status/:id
// // // //   };

// // // //   /** NEW: max total selectable items (like sites count = 7) */
// // // //   maxSelectableItems?: number;
// // // //   /** NEW: callback if user tries to exceed max */
// // // //   onMaxExceeded?: (max: number) => void;
// // // // };

// // // // export type StartParams = {
// // // //   /** NEW: multiple sites with fixed creds */
// // // //   sites: { site: string; username: string; password: string }[];
// // // //   defaults: {
// // // //     category?: string;
// // // //     keywordsDefaults?: string[];
// // // //     imageUrl?: string;      // public direct url
// // // //     imageFile?: File | null; // local file
// // // //     profile: {
// // // //       phone?: string;
// // // //       website?: string;
// // // //       email?: string;
// // // //       socials?: Socials;
// // // //       address?: Address;
// // // //     };
// // // //   };
// // // //   /** Build payload & return it without calling backend */
// // // //   dryRun?: boolean;
// // // // };

// // // // export type Project = { id: string; name: string; items: GeneratedItem[] };

// // // // function getItemTitle(it: GeneratedItem) {
// // // //   return it.title ?? "";
// // // // }
// // // // function getItemHtml(it: GeneratedItem) {
// // // //   return (it.html ?? it.generatedContent ?? "").toString();
// // // // }
// // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // //   if (typeof it.keyword === "string") {
// // // //     return it.keyword.split(/[,\|]/).map((s) => s.trim()).filter(Boolean);
// // // //   }
// // // //   return [];
// // // // }

// // // // // ✅ only direct public image urls allowed for backend
// // // // function isDirectImageUrl(url: string) {
// // // //   return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(url);
// // // // }
// // // // function onlyPublicDirectImages(arr: string[]) {
// // // //   return arr.filter(
// // // //     (u) => /^https?:\/\//i.test(u) && isDirectImageUrl(u)
// // // //   );
// // // // }

// // // // /* ===== Hook ===== */
// // // // export function useListingAutomation(
// // // //   allItems: GeneratedItem[],
// // // //   opts: UseListingAutomationOptions = {}
// // // // ) {
// // // //   const {
// // // //     uploadImage,
// // // //     // statusPollIntervalMs = 1500,
// // // //     // maxPollMinutes = 10,
// // // //     endpoints,
// // // //     maxSelectableItems = Infinity,
// // // //     onMaxExceeded,
// // // //   } = opts;

// // // //   /* Group by project */
// // // //   const projects: Project[] = useMemo(() => {
// // // //     const map = new Map<string, GeneratedItem[]>();
// // // //     for (const it of allItems) {
// // // //       const key = it.fileId ?? "__misc__";
// // // //       if (!map.has(key)) map.set(key, []);
// // // //       map.get(key)!.push(it);
// // // //     }
// // // //     return Array.from(map.entries()).map(([pid, arr]) => ({
// // // //       id: pid,
// // // //       name: arr[0]?.fileName || pid || "Untitled Project",
// // // //       items: arr,
// // // //     }));
// // // //   }, [allItems]);

// // // //   /* Search (filters items inside projects) */
// // // //   const [search, setSearch] = useState("");
// // // //   const filteredProjects: Project[] = useMemo(() => {
// // // //     const q = search.toLowerCase().trim();
// // // //     if (!q) return projects;
// // // //     return projects
// // // //       .map((p) => {
// // // //         const its = p.items.filter((it) => {
// // // //           const txt = `${getItemTitle(it)} ${getItemKeywords(it).join(
// // // //             " "
// // // //           )}`.toLowerCase();
// // // //           return txt.includes(q);
// // // //         });
// // // //         return { ...p, items: its };
// // // //       })
// // // //       .filter((p) => p.items.length > 0);
// // // //   }, [projects, search]);

// // // //   /* Expansion + selection */
// // // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
// // // //     new Set()
// // // //   );
// // // //   const toggleProjectExpand = (pid: string) => {
// // // //     setExpandedProjectIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       n.has(pid) ? n.delete(pid) : n.add(pid);
// // // //       return n;
// // // //     });
// // // //   };

// // // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(
// // // //     new Set()
// // // //   );
// // // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
// // // //     new Set()
// // // //   );

// // // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);

// // // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // // //     const proj = projects.find((p) => p.id === pid);
// // // //     if (!proj) return;

// // // //     if (!checked) {
// // // //       // unselect all in project
// // // //       setSelectedProjectIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         n.delete(pid);
// // // //         return n;
// // // //       });
// // // //       setSelectedItemIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         for (const it of proj.items) n.delete(it.id);
// // // //         return n;
// // // //       });
// // // //       return;
// // // //     }

// // // //     // checked = true -> select as many as capacity allows
// // // //     setSelectedItemIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       let added = 0;
// // // //       for (const it of proj.items) {
// // // //         if (n.size >= maxSelectableItems) break;
// // // //         if (!n.has(it.id)) {
// // // //           n.add(it.id);
// // // //           added++;
// // // //         }
// // // //       }
// // // //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// // // //       return n;
// // // //     });

// // // //     // project fully selected only if all items fit
// // // //     setSelectedProjectIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       const after = new Set(selectedItemIds);
// // // //       for (const it of proj.items) {
// // // //         if (after.size >= maxSelectableItems) break;
// // // //         after.add(it.id);
// // // //       }
// // // //       const allSelectedNow = proj.items.every((it) => after.has(it.id));
// // // //       if (allSelectedNow) n.add(pid);
// // // //       return n;
// // // //     });
// // // //   };

// // // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // // //     const proj = projects.find((p) => p.id === pid);

// // // //     setSelectedItemIds((prev) => {
// // // //       const n = new Set(prev);

// // // //       if (checked) {
// // // //         if (n.size >= maxSelectableItems && !n.has(iid)) {
// // // //           onMaxExceeded?.(maxSelectableItems);
// // // //           return prev; // block
// // // //         }
// // // //         n.add(iid);
// // // //       } else {
// // // //         n.delete(iid);
// // // //       }
// // // //       return n;
// // // //     });

// // // //     if (proj) {
// // // //       const after = new Set(selectedItemIds);
// // // //       checked ? after.add(iid) : after.delete(iid);
// // // //       const allSelected = proj.items.every((it) => after.has(it.id));
// // // //       const noneSelected = proj.items.every((it) => !after.has(it.id));
// // // //       setSelectedProjectIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         if (allSelected) n.add(pid);
// // // //         else if (noneSelected) n.delete(pid);
// // // //         return n;
// // // //       });
// // // //     }
// // // //   };

// // // //   const clearSelection = () => {
// // // //     setSelectedProjectIds(new Set());
// // // //     setSelectedItemIds(new Set());
// // // //   };
// // // //   const selectAllVisible = () => {
// // // //     const all = new Set<string>();
// // // //     for (const p of filteredProjects) {
// // // //       for (const it of p.items) {
// // // //         if (all.size >= maxSelectableItems) break;
// // // //         all.add(it.id);
// // // //       }
// // // //       if (all.size >= maxSelectableItems) break;
// // // //     }
// // // //     setSelectedItemIds(all);

// // // //     // Mark project selected only if all items in that project got selected
// // // //     const projIds = new Set<string>();
// // // //     for (const p of filteredProjects) {
// // // //       const allInProj = p.items.every((it) => all.has(it.id));
// // // //       if (allInProj) projIds.add(p.id);
// // // //     }
// // // //     setSelectedProjectIds(projIds);

// // // //     if (filteredProjects.flatMap((p) => p.items).length > maxSelectableItems) {
// // // //       onMaxExceeded?.(maxSelectableItems);
// // // //     }
// // // //   };

// // // //   /* Focused preview */
// // // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // // //   const focusedItem = useMemo(
// // // //     () => allItems.find((x) => x.id === focusedItemId),
// // // //     [allItems, focusedItemId]
// // // //   );

// // // //   /* Selected items array */
// // // //   const selectedItems = useMemo(
// // // //     () => allItems.filter((it) => selectedItemIds.has(it.id)),
// // // //     [allItems, selectedItemIds]
// // // //   );

// // // //   /* ===== Build listings & payload ===== */
// // // //   async function resolveDefaultImageUrl(
// // // //     imageUrl?: string,
// // // //     imageFile?: File | null
// // // //   ) {
// // // //     if (imageUrl?.trim()) return imageUrl.trim();

// // // //     // ✅ IMPORTANT: do NOT return blob url
// // // //     if (imageFile) {
// // // //       if (!uploadImage) {
// // // //         throw new Error(
// // // //           "You selected an image file but uploadImage() is not provided. " +
// // // //             "Backend cannot use blob/local URLs. Please upload the image to get a public .jpg/.png URL."
// // // //         );
// // // //       }
// // // //       return await uploadImage(imageFile);
// // // //     }
// // // //     return "";
// // // //   }

// // // //   function buildListingsForSelected(params: {
// // // //     category?: string;
// // // //     keywordsDefaults?: string[];
// // // //     defaultImageUrl?: string;
// // // //   }): AutomationListing[] {
// // // //     const { category, keywordsDefaults = [], defaultImageUrl = "" } = params;

// // // //     const listings: AutomationListing[] = selectedItems.map((it) => {
// // // //       const ownKeywords = getItemKeywords(it);
// // // //       const mergedKeywords = Array.from(
// // // //         new Set([...ownKeywords, ...keywordsDefaults])
// // // //       ).filter(Boolean);

// // // //       const ownImgs = onlyPublicDirectImages(
// // // //         (it.images || []).map(String).filter(Boolean)
// // // //       );

// // // //       const images =
// // // //         ownImgs.length > 0
// // // //           ? ownImgs
// // // //           : defaultImageUrl
// // // //           ? [defaultImageUrl]
// // // //           : [];

// // // //       return {
// // // //         id: it.id,
// // // //         title: getItemTitle(it),
// // // //         contentHtml: getItemHtml(it),
// // // //         images,
// // // //         keywords: mergedKeywords,
// // // //         category: category || undefined,
// // // //       };
// // // //     });

// // // //     const bad = listings.filter((l) => !l.title || !l.contentHtml);
// // // //     if (bad.length) {
// // // //       const ids = bad.map((b) => b.id).join(", ");
// // // //       throw new Error(`Some items missing title/content: ${ids}`);
// // // //     }
// // // //     const missingImg = listings.filter((l) => l.images.length === 0);
// // // //     if (missingImg.length) {
// // // //       const ids = missingImg.map((b) => b.id).join(", ");
// // // //       throw new Error(
// // // //         `Some items missing PUBLIC direct image URL (.jpg/.png). IDs: ${ids}`
// // // //       );
// // // //     }

// // // //     return listings;
// // // //   }

// // // //   async function buildPayload(params: StartParams): Promise<AutomationPayload> {
// // // //     const {
// // // //       sites,
// // // //       defaults: { category, keywordsDefaults, imageUrl, imageFile, profile },
// // // //     } = params;

// // // //     if (!Array.isArray(sites) || sites.length === 0) {
// // // //       throw new Error("No sites selected.");
// // // //     }
// // // //     if (sites.some((s) => !s.site || !s.username || !s.password)) {
// // // //       throw new Error("Every selected site must have site + username + password.");
// // // //     }
// // // //     if (selectedItems.length === 0) {
// // // //       throw new Error("No items selected.");
// // // //     }
// // // //     if (selectedItems.length > sites.length) {
// // // //       throw new Error(
// // // //         `Select ${selectedItems.length} sites to match ${selectedItems.length} items.`
// // // //       );
// // // //     }
// // // //     if (sites.length !== selectedItems.length) {
// // // //       throw new Error(
// // // //         `Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`
// // // //       );
// // // //     }

// // // //     const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile);
// // // //     const listings = buildListingsForSelected({
// // // //       category,
// // // //       keywordsDefaults,
// // // //       defaultImageUrl,
// // // //     });

// // // //     // 1 listing per site (same order)
// // // //     const targets: AutomationTargetSite[] = sites.map((s, idx) => ({
// // // //       site: s.site,
// // // //       login: { username: s.username, password: s.password },
// // // //       listings: [listings[idx]],
// // // //     }));

// // // //     return {
// // // //       profile,
// // // //       targets,
// // // //     };
// // // //   }

// // // //   /* ===== Start + Poll status ===== */
// // // //   const [isStarting, setIsStarting] = useState(false);
// // // //   const [jobId, setJobId] = useState<string | null>(null);
// // // //   const [progress, setProgress] = useState(0);
// // // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
// // // //     "idle"
// // // //   );
// // // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // // //   const pollStartTime = useRef<number>(0);

// // // //   function cancelPolling() {
// // // //     if (pollTimer.current) {
// // // //       clearInterval(pollTimer.current);
// // // //       pollTimer.current = null;
// // // //     }
// // // //   }

// // // //   // async function start(params: StartParams): Promise<{
// // // //   //   jobId: string | null;
// // // //   //   listings: number;
// // // //   //   payload: AutomationPayload;
// // // //   // }> {
// // // //   //   setIsStarting(true);
// // // //   //   setStatus("idle");
// // // //   //   setProgress(0);
// // // //   //   setJobId(null);
// // // //   //   cancelPolling();

// // // //   //   try {
// // // //   //     const payload = await buildPayload(params);
// // // //   //     (payload as any).debug = true;
// // // //   //     const listingsCount = payload.targets.reduce(
// // // //   //       (sum, t) => sum + t.listings.length,
// // // //   //       0
// // // //   //     );

// // // //   //     console.log("Starting automation with payload:", payload);

// // // //   //     if (params.dryRun) {
// // // //   //       return { jobId: null, listings: listingsCount, payload };
// // // //   //     }

// // // //   //     const startUrl =
// // // //   //       endpoints?.start ?? "http://localhost:8080/api/automation/start";

// // // //   //     const res = await fetch(startUrl, {
// // // //   //       method: "POST",
// // // //   //       headers: { "Content-Type": "application/json" },
// // // //   //       body: JSON.stringify(payload),
// // // //   //     });

// // // //   //     if (!res.ok) {
// // // //   //       const t = await res.text().catch(() => "");
// // // //   //       throw new Error(`Backend error: ${res.status} ${t}`);
// // // //   //     }

// // // //   //     const data = await res.json(); // { jobId }
// // // //   //     const jid = data.jobId ?? null;

// // // //   //     setJobId(jid);
// // // //   //     setStatus("running");

// // // //   //     if (jid) {
// // // //   //       // ✅ poll same backend origin by default
// // // //   //       const baseOrigin = new URL(startUrl, window.location.href).origin;

// // // //   //       pollStartTime.current = Date.now();
// // // //   //       pollTimer.current = setInterval(async () => {
// // // //   //         const minutes = (Date.now() - pollStartTime.current) / 60000;
// // // //   //         if (minutes > maxPollMinutes) {
// // // //   //           cancelPolling();
// // // //   //           setStatus("error");
// // // //   //           return;
// // // //   //         }

// // // //   //         try {
// // // //   //           const statusUrl =
// // // //   //             endpoints?.status?.(jid) ??
// // // //   //             `${baseOrigin}/api/automation/status/${jid}`;

// // // //   //           const s = await fetch(statusUrl);
// // // //   //           if (s.ok) {
// // // //   //             const j = await s.json(); // { progress, status }
// // // //   //             if (typeof j.progress === "number") {
// // // //   //               setProgress(Math.max(0, Math.min(100, j.progress)));
// // // //   //             }
// // // //   //             if (j.status === "done") {
// // // //   //               cancelPolling();
// // // //   //               setStatus("done");
// // // //   //               setProgress(100);
// // // //   //             } else if (j.status === "error") {
// // // //   //               cancelPolling();
// // // //   //               setStatus("error");
// // // //   //             } else {
// // // //   //               setStatus("running");
// // // //   //             }
// // // //   //           }
// // // //   //         } catch {
// // // //   //           // ignore transient poll errors
// // // //   //         }
// // // //   //       }, statusPollIntervalMs);
// // // //   //     }

// // // //   //     return { jobId: jid, listings: listingsCount, payload };
// // // //   //   } finally {
// // // //   //     setIsStarting(false);
// // // //   //   }
// // // //   // }

// // // //   async function start(params: StartParams): Promise<{
// // // //   jobId: string | null;
// // // //   listings: number;
// // // //   payload: AutomationPayload;
// // // // }> {
// // // //   setIsStarting(true);
// // // //   setStatus("idle");
// // // //   setProgress(0);
// // // //   setJobId(null);
// // // //   cancelPolling();

// // // //   try {
// // // //     const payload = await buildPayload(params);

// // // //     // ✅ DEBUG ON (browser slow + open rahe)
// // // //     (payload as any).debug = true;

// // // //     const listingsCount = payload.targets.reduce(
// // // //       (sum, t) => sum + t.listings.length,
// // // //       0
// // // //     );

// // // //     console.log("Starting automation with payload:", payload);

// // // //     if (params.dryRun) {
// // // //       return { jobId: null, listings: listingsCount, payload };
// // // //     }

// // // //     const startUrl =
// // // //       endpoints?.start ?? "http://localhost:8080/api/automation/start";
// // // //     const res = await fetch(startUrl, {
// // // //       method: "POST",
// // // //       headers: { "Content-Type": "application/json" },
// // // //       body: JSON.stringify(payload),
// // // //     });

// // // //     if (!res.ok) throw new Error(`Backend error: ${res.status}`);
// // // //     const data = await res.json();
// // // //     const jid = data.jobId ?? null;

// // // //     setJobId(jid);
// // // //     setStatus("running");

// // // //     // polling...
// // // //     return { jobId: jid, listings: listingsCount, payload };
// // // //   } finally {
// // // //     setIsStarting(false);
// // // //   }
// // // // }


// // // //   /* Cleanup polling on unmount */
// // // //   useEffect(() => cancelPolling, []);

// // // //   return {
// // // //     /* search + projects */
// // // //     search,
// // // //     setSearch,
// // // //     projects,
// // // //     filteredProjects,

// // // //     /* expansion + selection */
// // // //     expandedProjectIds,
// // // //     toggleProjectExpand,
// // // //     selectedProjectIds,
// // // //     selectedItemIds,
// // // //     isProjectSelected,
// // // //     isItemSelected,
// // // //     setProjectChecked,
// // // //     setItemChecked,
// // // //     selectAllVisible,
// // // //     clearSelection,

// // // //     /* focused preview */
// // // //     focusedItemId,
// // // //     setFocusedItemId,
// // // //     focusedItem,

// // // //     /* selected array */
// // // //     selectedItems,

// // // //     /* automation controls */
// // // //     buildPayload,
// // // //     start,
// // // //     cancelPolling,
// // // //     isStarting,
// // // //     jobId,
// // // //     progress,
// // // //     status,
// // // //   };
// // // // }



// // // // // /pages/classified-automation/hooks/useListingAutomation.ts
// // // // import { useEffect, useMemo, useRef, useState } from "react";

// // // // /* ===== Types (match your page) ===== */
// // // // export type GeneratedItem = {
// // // //   id: string;
// // // //   keyword?: string | string[];
// // // //   title?: string;
// // // //   html?: string;
// // // //   generatedContent?: string;
// // // //   images?: string[];
// // // //   fileId?: string;
// // // //   fileName?: string;
// // // //   createdAt?: number | string;
// // // // };

// // // // export type Address = {
// // // //   country: string;
// // // //   state: string;
// // // //   city: string;
// // // //   zip: string;
// // // //   line1: string;
// // // // };

// // // // export type Socials = {
// // // //   facebook?: string;
// // // //   twitter?: string;
// // // //   linkedin?: string;
// // // //   pinterest?: string;
// // // //   instagram?: string;
// // // //   yelp?: string;
// // // //   gmb?: string;
// // // // };

// // // // export type AutomationListing = {
// // // //   id: string;
// // // //   title: string;
// // // //   contentHtml: string;
// // // //   images: string[];
// // // //   keywords: string[];
// // // //   category?: string;
// // // // };

// // // // /** Per-site payload (1 site = 1 listing) */
// // // // export type AutomationTargetSite = {
// // // //   site: string;
// // // //   login: { username: string; password: string };
// // // //   listings: AutomationListing[]; // length 1
// // // // };

// // // // /** Multi-site payload */
// // // // export type AutomationPayload = {
// // // //   profile: {
// // // //     phone?: string;
// // // //     website?: string;
// // // //     email?: string;
// // // //     socials?: Socials;
// // // //     address?: Address;
// // // //   };
// // // //   targets: AutomationTargetSite[];
// // // // };

// // // // export type UseListingAutomationOptions = {
// // // //   /** Optional custom uploader. If not provided, hook uses endpoints.upload */
// // // //   uploadImage?: (file: File) => Promise<string>;
// // // //   statusPollIntervalMs?: number;
// // // //   maxPollMinutes?: number;
// // // //   endpoints?: {
// // // //     start?: string; // default http://localhost:8080/api/automation/start
// // // //     status?: (jobId: string) => string; // default /api/automation/status/:id
// // // //     upload?: string; // default http://localhost:8080/api/upload
// // // //   };

// // // //   maxSelectableItems?: number;
// // // //   onMaxExceeded?: (max: number) => void;

// // // //   debug?: boolean;
// // // // };

// // // // export type StartParams = {
// // // //   sites: { site: string; username: string; password: string }[];
// // // //   defaults: {
// // // //     category?: string;
// // // //     keywordsDefaults?: string[];
// // // //     imageUrl?: string;      // already public url
// // // //     imageFile?: File | null; // local file (will be uploaded)
// // // //     profile: {
// // // //       phone?: string;
// // // //       website?: string;
// // // //       email?: string;
// // // //       socials?: Socials;
// // // //       address?: Address;
// // // //     };
// // // //   };
// // // //   dryRun?: boolean;
// // // // };

// // // // export type Project = { id: string; name: string; items: GeneratedItem[] };

// // // // function getItemTitle(it: GeneratedItem) {
// // // //   return it.title ?? "";
// // // // }
// // // // function getItemHtml(it: GeneratedItem) {
// // // //   return (it.html ?? it.generatedContent ?? "").toString();
// // // // }
// // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // //   if (typeof it.keyword === "string") {
// // // //     return it.keyword.split(/[,\|]/).map((s) => s.trim()).filter(Boolean);
// // // //   }
// // // //   return [];
// // // // }

// // // // /* ===== Image validation helpers ===== */
// // // // function isBlobOrDataUrl(u: string) {
// // // //   return /^blob:|^data:/i.test(u);
// // // // }
// // // // function isHttpUrl(u: string) {
// // // //   return /^https?:\/\//i.test(u);
// // // // }
// // // // function looksLikeDirectImage(u: string) {
// // // //   return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u);
// // // // }
// // // // function assertValidImageUrl(u: string, ctx: string) {
// // // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // // //   if (isBlobOrDataUrl(u)) {
// // // //     throw new Error(
// // // //       `Invalid image URL (${ctx}): ${u}\n` +
// // // //         `Frontend "blob:" / "data:" URL backend par work nahi karti.\n` +
// // // //         `Image ko pehle upload karo aur public .jpg/.png URL bhejo.`
// // // //     );
// // // //   }
// // // //   if (isHttpUrl(u) && !looksLikeDirectImage(u)) {
// // // //     throw new Error(
// // // //       `Image URL direct file nahi hai (${ctx}): ${u}\n` +
// // // //         `Direct .jpg/.png/.webp link bhejo.`
// // // //     );
// // // //   }
// // // //   if (!isHttpUrl(u) && !looksLikeDirectImage(u)) {
// // // //     throw new Error(
// // // //       `Invalid image URL (${ctx}): ${u}\n` +
// // // //         `Please send a direct public image link like https://.../img.jpg`
// // // //     );
// // // //   }
// // // // }

// // // // /* ===== Hook ===== */
// // // // export function useListingAutomation(
// // // //   allItems: GeneratedItem[],
// // // //   opts: UseListingAutomationOptions = {}
// // // // ) {
// // // //   const {
// // // //     uploadImage,
// // // //     statusPollIntervalMs = 1500,
// // // //     maxPollMinutes = 10,
// // // //     endpoints,
// // // //     maxSelectableItems = Infinity,
// // // //     onMaxExceeded,
// // // //     debug = false,
// // // //   } = opts;

// // // //   /* Group by project */
// // // //   const projects: Project[] = useMemo(() => {
// // // //     const map = new Map<string, GeneratedItem[]>();
// // // //     for (const it of allItems) {
// // // //       const key = it.fileId ?? "__misc__";
// // // //       if (!map.has(key)) map.set(key, []);
// // // //       map.get(key)!.push(it);
// // // //     }
// // // //     return Array.from(map.entries()).map(([pid, arr]) => ({
// // // //       id: pid,
// // // //       name: arr[0]?.fileName || pid || "Untitled Project",
// // // //       items: arr,
// // // //     }));
// // // //   }, [allItems]);

// // // //   /* Search */
// // // //   const [search, setSearch] = useState("");
// // // //   const filteredProjects: Project[] = useMemo(() => {
// // // //     const q = search.toLowerCase().trim();
// // // //     if (!q) return projects;
// // // //     return projects
// // // //       .map((p) => {
// // // //         const its = p.items.filter((it) => {
// // // //           const txt = `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase();
// // // //           return txt.includes(q);
// // // //         });
// // // //         return { ...p, items: its };
// // // //       })
// // // //       .filter((p) => p.items.length > 0);
// // // //   }, [projects, search]);

// // // //   /* Expansion + selection */
// // // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // // //   const toggleProjectExpand = (pid: string) => {
// // // //     setExpandedProjectIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       n.has(pid) ? n.delete(pid) : n.add(pid);
// // // //       return n;
// // // //     });
// // // //   };

// // // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

// // // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);

// // // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // // //     const proj = projects.find((p) => p.id === pid);
// // // //     if (!proj) return;

// // // //     if (!checked) {
// // // //       setSelectedProjectIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         n.delete(pid);
// // // //         return n;
// // // //       });
// // // //       setSelectedItemIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         for (const it of proj.items) n.delete(it.id);
// // // //         return n;
// // // //       });
// // // //       return;
// // // //     }

// // // //     setSelectedItemIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       let added = 0;
// // // //       for (const it of proj.items) {
// // // //         if (n.size >= maxSelectableItems) break;
// // // //         if (!n.has(it.id)) {
// // // //           n.add(it.id);
// // // //           added++;
// // // //         }
// // // //       }
// // // //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// // // //       return n;
// // // //     });

// // // //     setSelectedProjectIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       const after = new Set(selectedItemIds);
// // // //       for (const it of proj.items) {
// // // //         if (after.size >= maxSelectableItems) break;
// // // //         after.add(it.id);
// // // //       }
// // // //       const allSelectedNow = proj.items.every((it) => after.has(it.id));
// // // //       if (allSelectedNow) n.add(pid);
// // // //       return n;
// // // //     });
// // // //   };

// // // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // // //     const proj = projects.find((p) => p.id === pid);

// // // //     setSelectedItemIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       if (checked) {
// // // //         if (n.size >= maxSelectableItems && !n.has(iid)) {
// // // //           onMaxExceeded?.(maxSelectableItems);
// // // //           return prev;
// // // //         }
// // // //         n.add(iid);
// // // //       } else {
// // // //         n.delete(iid);
// // // //       }
// // // //       return n;
// // // //     });

// // // //     if (proj) {
// // // //       const after = new Set(selectedItemIds);
// // // //       checked ? after.add(iid) : after.delete(iid);
// // // //       const allSelected = proj.items.every((it) => after.has(it.id));
// // // //       const noneSelected = proj.items.every((it) => !after.has(it.id));
// // // //       setSelectedProjectIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         if (allSelected) n.add(pid);
// // // //         else if (noneSelected) n.delete(pid);
// // // //         return n;
// // // //       });
// // // //     }
// // // //   };

// // // //   const clearSelection = () => {
// // // //     setSelectedProjectIds(new Set());
// // // //     setSelectedItemIds(new Set());
// // // //   };

// // // //   const selectAllVisible = () => {
// // // //     const all = new Set<string>();
// // // //     for (const p of filteredProjects) {
// // // //       for (const it of p.items) {
// // // //         if (all.size >= maxSelectableItems) break;
// // // //         all.add(it.id);
// // // //       }
// // // //       if (all.size >= maxSelectableItems) break;
// // // //     }
// // // //     setSelectedItemIds(all);

// // // //     const projIds = new Set<string>();
// // // //     for (const p of filteredProjects) {
// // // //       const allInProj = p.items.every((it) => all.has(it.id));
// // // //       if (allInProj) projIds.add(p.id);
// // // //     }
// // // //     setSelectedProjectIds(projIds);

// // // //     if (filteredProjects.flatMap((p) => p.items).length > maxSelectableItems) {
// // // //       onMaxExceeded?.(maxSelectableItems);
// // // //     }
// // // //   };

// // // //   /* Focused preview */
// // // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // // //   const focusedItem = useMemo(
// // // //     () => allItems.find((x) => x.id === focusedItemId),
// // // //     [allItems, focusedItemId]
// // // //   );

// // // //   /* Selected items array */
// // // //   const selectedItems = useMemo(
// // // //     () => allItems.filter((it) => selectedItemIds.has(it.id)),
// // // //     [allItems, selectedItemIds]
// // // //   );

// // // //   /* ===== Upload helper (auto) ===== */
// // // //   async function autoUploadImage(file: File): Promise<string> {
// // // //     if (uploadImage) return uploadImage(file);

// // // //     const uploadUrl =
// // // //       endpoints?.upload ?? "http://localhost:8080/api/upload";

// // // //     const fd = new FormData();
// // // //     fd.append("file", file);

// // // //     const res = await fetch(uploadUrl, { method: "POST", body: fd });
// // // //     if (!res.ok) {
// // // //       const t = await res.text().catch(() => "");
// // // //       throw new Error(`Image upload failed: ${res.status} ${t}`);
// // // //     }
// // // //     const data = await res.json();
// // // //     return data.url as string;
// // // //   }

// // // //   /* ===== Build listings & payload ===== */
// // // //   async function resolveDefaultImageUrl(
// // // //     imageUrl?: string,
// // // //     imageFile?: File | null
// // // //   ) {
// // // //     if (imageUrl?.trim()) {
// // // //       const u = imageUrl.trim();
// // // //       assertValidImageUrl(u, "defaultImageUrl");
// // // //       return u;
// // // //     }
// // // //     if (imageFile) {
// // // //       const u = await autoUploadImage(imageFile);
// // // //       assertValidImageUrl(u, "uploadedDefaultImageUrl");
// // // //       return u;
// // // //     }
// // // //     return "";
// // // //   }

// // // //   function buildListingsForSelected(params: {
// // // //     category?: string;
// // // //     keywordsDefaults?: string[];
// // // //     defaultImageUrl?: string;
// // // //   }): AutomationListing[] {
// // // //     const { category, keywordsDefaults = [], defaultImageUrl = "" } = params;

// // // //     const listings: AutomationListing[] = selectedItems.map((it) => {
// // // //       const ownKeywords = getItemKeywords(it);
// // // //       const mergedKeywords = Array.from(
// // // //         new Set([...ownKeywords, ...keywordsDefaults])
// // // //       ).filter(Boolean);

// // // //       const rawImgs = (it.images || []).filter(Boolean) as string[];
// // // //       for (let i = 0; i < rawImgs.length; i++) {
// // // //         assertValidImageUrl(rawImgs[i], `item(${it.id}).images[${i}]`);
// // // //       }

// // // //       const images =
// // // //         rawImgs.length > 0
// // // //           ? rawImgs
// // // //           : defaultImageUrl
// // // //           ? [defaultImageUrl]
// // // //           : [];

// // // //       return {
// // // //         id: it.id,
// // // //         title: getItemTitle(it),
// // // //         contentHtml: getItemHtml(it),
// // // //         images,
// // // //         keywords: mergedKeywords,
// // // //         category: category || undefined,
// // // //       };
// // // //     });

// // // //     const bad = listings.filter((l) => !l.title || !l.contentHtml);
// // // //     if (bad.length) {
// // // //       throw new Error(`Some items missing title/content: ${bad.map(b => b.id).join(", ")}`);
// // // //     }
// // // //     const missingImg = listings.filter((l) => l.images.length === 0);
// // // //     if (missingImg.length) {
// // // //       throw new Error(`Some items missing image: ${missingImg.map(b => b.id).join(", ")}`);
// // // //     }

// // // //     return listings;
// // // //   }

// // // //   async function buildPayload(params: StartParams): Promise<AutomationPayload> {
// // // //     const {
// // // //       sites,
// // // //       defaults: { category, keywordsDefaults, imageUrl, imageFile, profile },
// // // //     } = params;

// // // //     if (!Array.isArray(sites) || sites.length === 0)
// // // //       throw new Error("No sites selected.");

// // // //     if (sites.some((s) => !s.site || !s.username || !s.password))
// // // //       throw new Error("Every selected site must have site + username + password.");

// // // //     if (selectedItems.length === 0)
// // // //       throw new Error("No items selected.");

// // // //     if (sites.length !== selectedItems.length)
// // // //       throw new Error(`Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`);

// // // //     const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile);

// // // //     const listings = buildListingsForSelected({
// // // //       category,
// // // //       keywordsDefaults,
// // // //       defaultImageUrl,
// // // //     });

// // // //     const targets: AutomationTargetSite[] = sites.map((s, idx) => {
// // // //       const listing = listings[idx];
// // // //       listing.images.forEach((img, i) =>
// // // //         assertValidImageUrl(img, `${s.site}.listing.images[${i}]`)
// // // //       );
// // // //       return {
// // // //         site: s.site,
// // // //         login: { username: s.username, password: s.password },
// // // //         listings: [listing],
// // // //       };
// // // //     });

// // // //     const payload: AutomationPayload = { profile, targets };

// // // //     if (debug) console.log("[ListingAutomation] Built payload:", payload);

// // // //     return payload;
// // // //   }

// // // //   /* ===== Start + Poll status ===== */
// // // //   const [isStarting, setIsStarting] = useState(false);
// // // //   const [jobId, setJobId] = useState<string | null>(null);
// // // //   const [progress, setProgress] = useState(0);
// // // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
// // // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // // //   const pollStartTime = useRef<number>(0);

// // // //   function cancelPolling() {
// // // //     if (pollTimer.current) {
// // // //       clearInterval(pollTimer.current);
// // // //       pollTimer.current = null;
// // // //     }
// // // //   }

// // // //   async function start(params: StartParams): Promise<{
// // // //     jobId: string | null;
// // // //     listings: number;
// // // //     payload: AutomationPayload;
// // // //   }> {
// // // //     setIsStarting(true);
// // // //     setStatus("idle");
// // // //     setProgress(0);
// // // //     setJobId(null);
// // // //     cancelPolling();

// // // //     try {
// // // //       const payload = await buildPayload(params);
// // // //       const listingsCount = payload.targets.reduce(
// // // //         (sum, t) => sum + t.listings.length,
// // // //         0
// // // //       );

// // // //       if (params.dryRun) {
// // // //         return { jobId: null, listings: listingsCount, payload };
// // // //       }

// // // //       const startUrl =
// // // //         endpoints?.start ?? "http://localhost:8080/api/automation/start";

// // // //       const res = await fetch(startUrl, {
// // // //         method: "POST",
// // // //         headers: { "Content-Type": "application/json" },
// // // //         body: JSON.stringify(payload),
// // // //       });

// // // //       if (!res.ok) {
// // // //         const txt = await res.text().catch(() => "");
// // // //         throw new Error(`Backend error: ${res.status} ${txt}`);
// // // //       }

// // // //       const data = await res.json();
// // // //       const jid = data.jobId ?? null;

// // // //       setJobId(jid);
// // // //       setStatus("running");

// // // //       if (jid) {
// // // //         pollStartTime.current = Date.now();
// // // //         pollTimer.current = setInterval(async () => {
// // // //           const minutes = (Date.now() - pollStartTime.current) / 60000;
// // // //           if (minutes > maxPollMinutes) {
// // // //             cancelPolling();
// // // //             setStatus("error");
// // // //             return;
// // // //           }
// // // //           try {
// // // //             const statusUrl =
// // // //               endpoints?.status?.(jid) ?? `/api/automation/status/${jid}`;
// // // //             const s = await fetch(statusUrl);
// // // //             if (s.ok) {
// // // //               const j = await s.json();
// // // //               if (typeof j.progress === "number") {
// // // //                 setProgress(Math.max(0, Math.min(100, j.progress)));
// // // //               }
// // // //               if (j.status === "done") {
// // // //                 cancelPolling();
// // // //                 setStatus("done");
// // // //                 setProgress(100);
// // // //               } else if (j.status === "error") {
// // // //                 cancelPolling();
// // // //                 setStatus("error");
// // // //               } else {
// // // //                 setStatus("running");
// // // //               }
// // // //             }
// // // //           } catch {}
// // // //         }, statusPollIntervalMs);
// // // //       }

// // // //       return { jobId: jid, listings: listingsCount, payload };
// // // //     } finally {
// // // //       setIsStarting(false);
// // // //     }
// // // //   }

// // // //   useEffect(() => cancelPolling, []);

// // // //   return {
// // // //     search,
// // // //     setSearch,
// // // //     projects,
// // // //     filteredProjects,

// // // //     expandedProjectIds,
// // // //     toggleProjectExpand,
// // // //     selectedProjectIds,
// // // //     selectedItemIds,
// // // //     isProjectSelected,
// // // //     isItemSelected,
// // // //     setProjectChecked,
// // // //     setItemChecked,
// // // //     selectAllVisible,
// // // //     clearSelection,

// // // //     focusedItemId,
// // // //     setFocusedItemId,
// // // //     focusedItem,

// // // //     selectedItems,

// // // //     buildPayload,
// // // //     start,
// // // //     cancelPolling,
// // // //     isStarting,
// // // //     jobId,
// // // //     progress,
// // // //     status,
// // // //   };
// // // // }



// // // // // /pages/classified-automation/hooks/useListingAutomation.ts
// // // // import { useEffect, useMemo, useRef, useState } from "react";

// // // // /* ===== Types (match your page) ===== */
// // // // export type GeneratedItem = {
// // // //   id: string;
// // // //   keyword?: string | string[];
// // // //   title?: string;
// // // //   html?: string;
// // // //   generatedContent?: string;
// // // //   images?: string[]; // can include http(s), blob:, data:
// // // //   fileId?: string;
// // // //   fileName?: string;
// // // //   createdAt?: number | string;
// // // // };

// // // // export type Address = {
// // // //   country: string;
// // // //   state: string;
// // // //   city: string;
// // // //   zip: string;
// // // //   line1: string;
// // // // };

// // // // export type Socials = {
// // // //   facebook?: string;
// // // //   twitter?: string;
// // // //   linkedin?: string;
// // // //   pinterest?: string;
// // // //   instagram?: string;
// // // //   yelp?: string;
// // // //   gmb?: string;
// // // // };

// // // // export type AutomationListing = {
// // // //   id: string;
// // // //   title: string;
// // // //   contentHtml: string;
// // // //   images: string[];
// // // //   keywords: string[];
// // // //   category?: string;
// // // // };

// // // // /** Per-site payload (1 site = 1 listing) */
// // // // export type AutomationTargetSite = {
// // // //   site: string;
// // // //   login: { username: string; password: string };
// // // //   type?: string; // "classified" | "wordpress"
// // // //   listings: AutomationListing[];
// // // // };


// // // // /** Multi-site payload */
// // // // export type AutomationPayload = {
// // // //   profile: {
// // // //     phone?: string;
// // // //     website?: string;
// // // //     email?: string;
// // // //     socials?: Socials;
// // // //     address?: Address;
// // // //   };
// // // //   targets: AutomationTargetSite[];
// // // // };

// // // // export type UseListingAutomationOptions = {
// // // //   /** Optional custom uploader. If not provided, hook uses endpoints.upload */
// // // //   uploadImage?: (file: File) => Promise<string>;
// // // //   statusPollIntervalMs?: number;
// // // //   maxPollMinutes?: number;
// // // //   endpoints?: {
// // // //     start?: string; // default http://localhost:8080/api/automation/start
// // // //     status?: (jobId: string) => string; // default /api/automation/status/:id
// // // //     upload?: string; // default http://localhost:8080/api/upload
// // // //   };

// // // //   maxSelectableItems?: number;
// // // //   onMaxExceeded?: (max: number) => void;

// // // //   debug?: boolean;
// // // // };

// // // // export type StartParams = {
// // // // sites: { site: string; username: string; password: string; type?: string }[];
// // // //   defaults: {
// // // //     category?: string;
// // // //     keywordsDefaults?: string[];
// // // //     imageUrl?: string;       // already public url OR blob/data (will be auto-uploaded)
// // // //     imageFile?: File | null; // local file (will be uploaded)
// // // //     profile: {
// // // //       phone?: string;
// // // //       website?: string;
// // // //       email?: string;
// // // //       socials?: Socials;
// // // //       address?: Address;
// // // //     };
// // // //   };
// // // //   dryRun?: boolean;
// // // // };

// // // // export type Project = { id: string; name: string; items: GeneratedItem[] };

// // // // function getItemTitle(it: GeneratedItem) {
// // // //   return it.title ?? "";
// // // // }
// // // // function getItemHtml(it: GeneratedItem) {
// // // //   return (it.html ?? it.generatedContent ?? "").toString();
// // // // }
// // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // //   if (typeof it.keyword === "string") {
// // // //     return it.keyword.split(/[,\|]/).map((s) => s.trim()).filter(Boolean);
// // // //   }
// // // //   return [];
// // // // }

// // // // /* ===== Image validation helpers ===== */
// // // // function isBlobOrDataUrl(u: string) {
// // // //   return /^blob:|^data:/i.test(u);
// // // // }
// // // // function isHttpUrl(u: string) {
// // // //   return /^https?:\/\//i.test(u);
// // // // }
// // // // function looksLikeDirectImage(u: string) {
// // // //   return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u);
// // // // }
// // // // function assertValidImageUrl(u: string, ctx: string) {
// // // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // // //   if (isBlobOrDataUrl(u)) {
// // // //     throw new Error(
// // // //       `Invalid image URL (${ctx}): ${u}\n` +
// // // //         `Frontend "blob:" / "data:" URL backend par work nahi karti.\n` +
// // // //         `Image ko pehle upload karo aur public .jpg/.png URL bhejo.`
// // // //     );
// // // //   }
// // // //   if (isHttpUrl(u) && !looksLikeDirectImage(u)) {
// // // //     throw new Error(
// // // //       `Image URL direct file nahi hai (${ctx}): ${u}\n` +
// // // //         `Direct .jpg/.png/.webp link bhejo.`
// // // //     );
// // // //   }
// // // //   if (!isHttpUrl(u) && !looksLikeDirectImage(u)) {
// // // //     throw new Error(
// // // //       `Invalid image URL (${ctx}): ${u}\n` +
// // // //         `Please send a direct public image link like https://.../img.jpg`
// // // //     );
// // // //   }
// // // // }

// // // // /* ===== Hook ===== */
// // // // export function useListingAutomation(
// // // //   allItems: GeneratedItem[],
// // // //   opts: UseListingAutomationOptions = {}
// // // // ) {
// // // //   const {
// // // //     uploadImage,
// // // //     statusPollIntervalMs = 1500,
// // // //     maxPollMinutes = 10,
// // // //     endpoints,
// // // //     maxSelectableItems = Infinity,
// // // //     onMaxExceeded,
// // // //     debug = false,
// // // //   } = opts;

// // // //   /* Group by project */
// // // //   const projects: Project[] = useMemo(() => {
// // // //     const map = new Map<string, GeneratedItem[]>();
// // // //     for (const it of allItems) {
// // // //       const key = it.fileId ?? "__misc__";
// // // //       if (!map.has(key)) map.set(key, []);
// // // //       map.get(key)!.push(it);
// // // //     }
// // // //     return Array.from(map.entries()).map(([pid, arr]) => ({
// // // //       id: pid,
// // // //       name: arr[0]?.fileName || pid || "Untitled Project",
// // // //       items: arr,
// // // //     }));
// // // //   }, [allItems]);

// // // //   /* Search */
// // // //   const [search, setSearch] = useState("");
// // // //   const filteredProjects: Project[] = useMemo(() => {
// // // //     const q = search.toLowerCase().trim();
// // // //     if (!q) return projects;
// // // //     return projects
// // // //       .map((p) => {
// // // //         const its = p.items.filter((it) => {
// // // //           const txt = `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase();
// // // //           return txt.includes(q);
// // // //         });
// // // //         return { ...p, items: its };
// // // //       })
// // // //       .filter((p) => p.items.length > 0);
// // // //   }, [projects, search]);

// // // //   /* Expansion + selection */
// // // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // // //   const toggleProjectExpand = (pid: string) => {
// // // //     setExpandedProjectIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       n.has(pid) ? n.delete(pid) : n.add(pid);
// // // //       return n;
// // // //     });
// // // //   };

// // // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

// // // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);

// // // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // // //     const proj = projects.find((p) => p.id === pid);
// // // //     if (!proj) return;

// // // //     if (!checked) {
// // // //       setSelectedProjectIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         n.delete(pid);
// // // //         return n;
// // // //       });
// // // //       setSelectedItemIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         for (const it of proj.items) n.delete(it.id);
// // // //         return n;
// // // //       });
// // // //       return;
// // // //     }

// // // //     setSelectedItemIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       let added = 0;
// // // //       for (const it of proj.items) {
// // // //         if (n.size >= maxSelectableItems) break;
// // // //         if (!n.has(it.id)) {
// // // //           n.add(it.id);
// // // //           added++;
// // // //         }
// // // //       }
// // // //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// // // //       return n;
// // // //     });

// // // //     setSelectedProjectIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       const after = new Set(selectedItemIds);
// // // //       for (const it of proj.items) {
// // // //         if (after.size >= maxSelectableItems) break;
// // // //         after.add(it.id);
// // // //       }
// // // //       const allSelectedNow = proj.items.every((it) => after.has(it.id));
// // // //       if (allSelectedNow) n.add(pid);
// // // //       return n;
// // // //     });
// // // //   };

// // // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // // //     const proj = projects.find((p) => p.id === pid);

// // // //     setSelectedItemIds((prev) => {
// // // //       const n = new Set(prev);
// // // //       if (checked) {
// // // //         if (n.size >= maxSelectableItems && !n.has(iid)) {
// // // //           onMaxExceeded?.(maxSelectableItems);
// // // //           return prev;
// // // //         }
// // // //         n.add(iid);
// // // //       } else {
// // // //         n.delete(iid);
// // // //       }
// // // //       return n;
// // // //     });

// // // //     if (proj) {
// // // //       const after = new Set(selectedItemIds);
// // // //       checked ? after.add(iid) : after.delete(iid);
// // // //       const allSelected = proj.items.every((it) => after.has(it.id));
// // // //       const noneSelected = proj.items.every((it) => !after.has(it.id));
// // // //       setSelectedProjectIds((prev) => {
// // // //         const n = new Set(prev);
// // // //         if (allSelected) n.add(pid);
// // // //         else if (noneSelected) n.delete(pid);
// // // //         return n;
// // // //       });
// // // //     }
// // // //   };

// // // //   const clearSelection = () => {
// // // //     setSelectedProjectIds(new Set());
// // // //     setSelectedItemIds(new Set());
// // // //   };

// // // //   const selectAllVisible = () => {
// // // //     const all = new Set<string>();
// // // //     for (const p of filteredProjects) {
// // // //       for (const it of p.items) {
// // // //         if (all.size >= maxSelectableItems) break;
// // // //         all.add(it.id);
// // // //       }
// // // //       if (all.size >= maxSelectableItems) break;
// // // //     }
// // // //     setSelectedItemIds(all);

// // // //     const projIds = new Set<string>();
// // // //     for (const p of filteredProjects) {
// // // //       const allInProj = p.items.every((it) => all.has(it.id));
// // // //       if (allInProj) projIds.add(p.id);
// // // //     }
// // // //     setSelectedProjectIds(projIds);

// // // //     if (filteredProjects.flatMap((p) => p.items).length > maxSelectableItems) {
// // // //       onMaxExceeded?.(maxSelectableItems);
// // // //     }
// // // //   };

// // // //   /* Focused preview */
// // // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // // //   const focusedItem = useMemo(
// // // //     () => allItems.find((x) => x.id === focusedItemId),
// // // //     [allItems, focusedItemId]
// // // //   );

// // // //   /* Selected items array */
// // // //   const selectedItems = useMemo(
// // // //     () => allItems.filter((it) => selectedItemIds.has(it.id)),
// // // //     [allItems, selectedItemIds]
// // // //   );

// // // //   /* ===== Upload helper (auto + fallback) ===== */
// // // //   async function autoUploadImage(file: File): Promise<string> {
// // // //     // 1) custom uploader (if provided)
// // // //     if (uploadImage) {
// // // //       const u = await uploadImage(file);
// // // //       if (u && !isBlobOrDataUrl(u)) {
// // // //         assertValidImageUrl(u, "uploadImage()");
// // // //         return u;
// // // //       }
// // // //       if (debug) {
// // // //         console.warn(
// // // //           "[ListingAutomation] uploadImage() returned blob/data, falling back to backend uploader:",
// // // //           u
// // // //         );
// // // //       }
// // // //     }

// // // //     // 2) backend uploader fallback
// // // //     const uploadUrl =
// // // //       endpoints?.upload ?? "http://localhost:3000/api/upload";

// // // //     const fd = new FormData();
// // // //     fd.append("file", file);

// // // //     const res = await fetch(uploadUrl, { method: "POST", body: fd });
// // // //     if (!res.ok) {
// // // //       const t = await res.text().catch(() => "");
// // // //       throw new Error(`Image upload failed: ${res.status} ${t}`);
// // // //     }
// // // //     const data = await res.json();
// // // //     const url = data.url as string;
// // // //     assertValidImageUrl(url, "backendUpload");
// // // //     return url;
// // // //   }

// // // //   function extFromMime(mime: string) {
// // // //     if (/png/i.test(mime)) return "png";
// // // //     if (/webp/i.test(mime)) return "webp";
// // // //     if (/gif/i.test(mime)) return "gif";
// // // //     return "jpg";
// // // //   }

// // // //   async function ensurePublicImageUrl(u: string, ctx: string): Promise<string> {
// // // //     if (!u) throw new Error(`Missing image URL (${ctx}).`);

// // // //     // already public http direct image
// // // //     if (isHttpUrl(u)) {
// // // //       assertValidImageUrl(u, ctx);
// // // //       return u;
// // // //     }

// // // //     // local path that looks like file (rare in frontend)
// // // //     if (!isBlobOrDataUrl(u) && looksLikeDirectImage(u)) {
// // // //       assertValidImageUrl(u, ctx);
// // // //       return u;
// // // //     }

// // // //     // blob/data => auto-upload
// // // //     if (isBlobOrDataUrl(u)) {
// // // //       let blob: Blob;
// // // //       try {
// // // //         const r = await fetch(u);
// // // //         blob = await r.blob();
// // // //       } catch (e: any) {
// // // //         throw new Error(
// // // //           `Cannot read local image (${ctx}). Please re-select image.\n` +
// // // //             `${e?.message || e}`
// // // //         );
// // // //       }

// // // //       const mime = blob.type || "image/jpeg";
// // // //       const ext = extFromMime(mime);
// // // //       const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime });

// // // //       const publicUrl = await autoUploadImage(file);
// // // //       assertValidImageUrl(publicUrl, ctx);
// // // //       return publicUrl;
// // // //     }

// // // //     // anything else invalid
// // // //     assertValidImageUrl(u, ctx); // will throw
// // // //     return u;
// // // //   }

// // // //   /* ===== Build listings & payload ===== */
// // // //   async function resolveDefaultImageUrl(
// // // //     imageUrl?: string,
// // // //     imageFile?: File | null
// // // //   ) {
// // // //     if (imageUrl?.trim()) {
// // // //       return await ensurePublicImageUrl(imageUrl.trim(), "defaultImageUrl");
// // // //     }
// // // //     if (imageFile) {
// // // //       const u = await autoUploadImage(imageFile);
// // // //       assertValidImageUrl(u, "uploadedDefaultImageUrl");
// // // //       return u;
// // // //     }
// // // //     return "";
// // // //   }

// // // //   async function buildListingsForSelected(params: {
// // // //     category?: string;
// // // //     keywordsDefaults?: string[];
// // // //     defaultImageUrl?: string;
// // // //   }): Promise<AutomationListing[]> {
// // // //     const { category, keywordsDefaults = [], defaultImageUrl = "" } = params;

// // // //     const listings: AutomationListing[] = [];
// // // //     for (const it of selectedItems) {
// // // //       const ownKeywords = getItemKeywords(it);
// // // //       const mergedKeywords = Array.from(
// // // //         new Set([...ownKeywords, ...keywordsDefaults])
// // // //       ).filter(Boolean);

// // // //       const rawImgs = (it.images || []).filter(Boolean) as string[];
// // // //       const publicImgs: string[] = [];

// // // //       for (let i = 0; i < rawImgs.length; i++) {
// // // //         const img = rawImgs[i];
// // // //         const pub = await ensurePublicImageUrl(img, `item(${it.id}).images[${i}]`);
// // // //         publicImgs.push(pub);
// // // //       }

// // // //       const images =
// // // //         publicImgs.length > 0
// // // //           ? publicImgs
// // // //           : defaultImageUrl
// // // //           ? [defaultImageUrl]
// // // //           : [];

// // // //       listings.push({
// // // //         id: it.id,
// // // //         title: getItemTitle(it),
// // // //         contentHtml: getItemHtml(it),
// // // //         images,
// // // //         keywords: mergedKeywords,
// // // //         category: category || undefined,
// // // //       });
// // // //     }

// // // //     const bad = listings.filter((l) => !l.title || !l.contentHtml);
// // // //     if (bad.length) {
// // // //       throw new Error(
// // // //         `Some items missing title/content: ${bad.map(b => b.id).join(", ")}`
// // // //       );
// // // //     }
// // // //     const missingImg = listings.filter((l) => l.images.length === 0);
// // // //     if (missingImg.length) {
// // // //       throw new Error(
// // // //         `Some items missing image: ${missingImg.map(b => b.id).join(", ")}`
// // // //       );
// // // //     }

// // // //     return listings;
// // // //   }

// // // //   async function buildPayload(params: StartParams): Promise<AutomationPayload> {
// // // //     const {
// // // //       sites,
// // // //       defaults: { category, keywordsDefaults, imageUrl, imageFile, profile },
// // // //     } = params;

// // // //     if (!Array.isArray(sites) || sites.length === 0)
// // // //       throw new Error("No sites selected.");

// // // //     if (sites.some((s) => !s.site || !s.username || !s.password))
// // // //       throw new Error("Every selected site must have site + username + password.");

// // // //     if (selectedItems.length === 0)
// // // //       throw new Error("No items selected.");

// // // //     if (sites.length !== selectedItems.length)
// // // //       throw new Error(
// // // //         `Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`
// // // //       );

// // // //     const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile);

// // // //     const listings = await buildListingsForSelected({
// // // //       category,
// // // //       keywordsDefaults,
// // // //       defaultImageUrl,
// // // //     });

// // // //     const targets: AutomationTargetSite[] = sites.map((s, idx) => {
// // // //       const listing = listings[idx];
// // // //       listing.images.forEach((img, i) =>
// // // //         assertValidImageUrl(img, `${s.site}.listing.images[${i}]`)
// // // //       );
// // // // return {
// // // //   site: s.site,
// // // //   login: { username: s.username, password: s.password },
// // // //   type: (s as any).type ?? "classified",
// // // //   listings: [listing],
// // // // };

// // // //     });

// // // //     const payload: AutomationPayload = { profile, targets };

// // // //     if (debug) console.log("[ListingAutomation] Built payload:", payload);

// // // //     return payload;
// // // //   }

// // // //   /* ===== Start + Poll status ===== */
// // // //   const [isStarting, setIsStarting] = useState(false);
// // // //   const [jobId, setJobId] = useState<string | null>(null);
// // // //   const [progress, setProgress] = useState(0);
// // // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
// // // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // // //   const pollStartTime = useRef<number>(0);

// // // //   function cancelPolling() {
// // // //     if (pollTimer.current) {
// // // //       clearInterval(pollTimer.current);
// // // //       pollTimer.current = null;
// // // //     }
// // // //   }

// // // //   async function start(params: StartParams): Promise<{
// // // //     jobId: string | null;
// // // //     listings: number;
// // // //     payload: AutomationPayload;
// // // //   }> {
// // // //     setIsStarting(true);
// // // //     setStatus("idle");
// // // //     setProgress(0);
// // // //     setJobId(null);
// // // //     cancelPolling();

// // // //     try {
// // // //       const payload = await buildPayload(params);
// // // //       const listingsCount = payload.targets.reduce(
// // // //         (sum, t) => sum + t.listings.length,
// // // //         0
// // // //       );

// // // //       if (debug) console.log("Starting automation with payload:", payload);

// // // //       if (params.dryRun) {
// // // //         return { jobId: null, listings: listingsCount, payload };
// // // //       }

// // // //       console.log(payload)

// // // //       const startUrl =
// // // //         endpoints?.start ?? "http://localhost:3000/api/automation/start";

// // // //         console.log(payload)

// // // //       const res = await fetch(startUrl, {
// // // //         method: "POST",
// // // //         headers: { "Content-Type": "application/json" },
// // // //         body: JSON.stringify(payload),
// // // //       });

// // // //       if (!res.ok) {
// // // //         const txt = await res.text().catch(() => "");
// // // //         throw new Error(`Backend error: ${res.status} ${txt}`);
// // // //       }

// // // //       const data = await res.json();
// // // //       const jid = data.jobId ?? null;

// // // //       setJobId(jid);
// // // //       setStatus("running");

// // // //       if (jid) {
// // // //         pollStartTime.current = Date.now();
// // // //         pollTimer.current = setInterval(async () => {
// // // //           const minutes = (Date.now() - pollStartTime.current) / 60000;
// // // //           if (minutes > maxPollMinutes) {
// // // //             cancelPolling();
// // // //             setStatus("error");
// // // //             return;
// // // //           }
// // // //           try {
// // // //         const statusUrl =
// // // //   endpoints?.status?.(jid) ?? `http://localhost:3000/api/automation/status/${jid}`;

// // // //             const s = await fetch(statusUrl);
// // // //             if (s.ok) {
// // // //               const j = await s.json();
// // // //               if (typeof j.progress === "number") {
// // // //                 setProgress(Math.max(0, Math.min(100, j.progress)));
// // // //               }
// // // //               if (j.status === "done") {
// // // //                 cancelPolling();
// // // //                 setStatus("done");
// // // //                 setProgress(100);
// // // //               } else if (j.status === "error") {
// // // //                 cancelPolling();
// // // //                 setStatus("error");
// // // //               } else {
// // // //                 setStatus("running");
// // // //               }
// // // //             }
// // // //           } catch {
// // // //             // ignore transient poll errors
// // // //           }
// // // //         }, statusPollIntervalMs);
// // // //       }

// // // //       return { jobId: jid, listings: listingsCount, payload };
// // // //     } finally {
// // // //       setIsStarting(false);
// // // //     }
// // // //   }

// // // //   useEffect(() => cancelPolling, []);

// // // //   return {
// // // //     search,
// // // //     setSearch,
// // // //     projects,
// // // //     filteredProjects,

// // // //     expandedProjectIds,
// // // //     toggleProjectExpand,
// // // //     selectedProjectIds,
// // // //     selectedItemIds,
// // // //     isProjectSelected,
// // // //     isItemSelected,
// // // //     setProjectChecked,
// // // //     setItemChecked,
// // // //     selectAllVisible,
// // // //     clearSelection,

// // // //     focusedItemId,
// // // //     setFocusedItemId,
// // // //     focusedItem,

// // // //     selectedItems,

// // // //     buildPayload,
// // // //     start,
// // // //     cancelPolling,
// // // //     isStarting,
// // // //     jobId,
// // // //     progress,
// // // //     status,
// // // //   };
// // // // }




// // // // /* Updated useListingAutomation.ts
// // // //    Drop-in replacement with improved job-run tracking, immediate backlink capture,
// // // //    frequent status polling, job history (runs), and Excel export helper.

// // // //    - Polls status endpoint for full job details (including backlinks) and updates
// // // //      hook state as backlinks arrive so UI can render them in near-real-time.
// // // //    - Exposes `runs` (history of launches) so the UI can show one-box-per-run with
// // // //      startedAt/finishedAt/progress/backlinks.
// // // //    - Provides helper `downloadRunExcel(jobId, filename)` which requests a backend
// // // //      export endpoint and triggers a client download of the returned blob.
// // // //    - Keeps all existing behavior (payload building, image upload) compatible.
// // // // */

// // // // import { useEffect, useMemo, useRef, useState } from "react";

// // // // /* ===== Types (match your page) ===== */
// // // // export type GeneratedItem = {
// // // //   id: string;
// // // //   keyword?: string | string[];
// // // //   title?: string;
// // // //   html?: string;
// // // //   generatedContent?: string;
// // // //   images?: string[];
// // // //   fileId?: string;
// // // //   fileName?: string;
// // // //   createdAt?: number | string;
// // // // };

// // // // export type Address = { country: string; state: string; city: string; zip: string; line1: string };
// // // // export type Socials = { facebook?: string; twitter?: string; linkedin?: string; pinterest?: string; instagram?: string; yelp?: string; gmb?: string };

// // // // export type AutomationListing = { id: string; title: string; contentHtml: string; images: string[]; keywords: string[]; category?: string };
// // // // export type AutomationTargetSite = { site: string; login: { username: string; password: string }; type?: string; listings: AutomationListing[] };
// // // // export type AutomationPayload = { profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address }; targets: AutomationTargetSite[] };

// // // // export type UseListingAutomationOptions = {
// // // //   uploadImage?: (file: File) => Promise<string>;
// // // //   statusPollIntervalMs?: number;
// // // //   maxPollMinutes?: number;
// // // //   endpoints?: { start?: string; status?: (jobId: string) => string; upload?: string; export?: (jobId: string) => string; job?: (jobId: string) => string };
// // // //   maxSelectableItems?: number;
// // // //   onMaxExceeded?: (max: number) => void;
// // // //   debug?: boolean;
// // // //   /** Optional callback to receive live run updates */
// // // //   onRunUpdate?: (run: JobRun) => void;
// // // // };

// // // // export type StartParams = {
// // // //   sites: { site: string; username: string; password: string; type?: string }[];
// // // //   defaults: { category?: string; keywordsDefaults?: string[]; imageUrl?: string; imageFile?: File | null; profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address } };
// // // //   dryRun?: boolean;
// // // // };

// // // // export type Project = { id: string; name: string; items: GeneratedItem[] };

// // // // /* Job run shape returned by backend status endpoints (best-effort) */
// // // // export type JobRun = {
// // // //   jobId: string | null;
// // // //   status: "queued" | "running" | "done" | "error" | "idle";
// // // //   progress: number;
// // // //   startedAt?: number;
// // // //   finishedAt?: number | null;
// // // //   backlinks?: string[]; // accumulated as they arrive
// // // //   successCount?: number;
// // // //   failCount?: number;
// // // //   logs?: string[];
// // // //   error?: string | null;
// // // // };

// // // // /* Small local helpers (reused) */
// // // // function getItemTitle(it: GeneratedItem) { return it.title ?? ""; }
// // // // function getItemHtml(it: GeneratedItem) { return (it.html ?? it.generatedContent ?? "").toString(); }
// // // // function getItemKeywords(it: GeneratedItem): string[] { if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean); if (typeof it.keyword === "string") return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean); return []; }

// // // // /* ===== Image helpers (copied / compatible) ===== */
// // // // function isBlobOrDataUrl(u: string) { return /^blob:|^data:/i.test(u); }
// // // // function isHttpUrl(u: string) { return /^https?:\/\//i.test(u); }
// // // // function looksLikeDirectImage(u: string) { return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u); }
// // // // function assertValidImageUrl(u: string, ctx: string) {
// // // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // // //   if (isBlobOrDataUrl(u)) throw new Error(`Invalid image URL (${ctx}): ${u} — blob/data URLs are not supported on backend. Upload first.`);
// // // //   if (isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Image URL is not a direct file (${ctx}): ${u}`);
// // // //   if (!isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Invalid image URL (${ctx}): ${u}`);
// // // // }

// // // // /* ===== Hook implementation (improved) ===== */
// // // // export function useListingAutomation(allItems: GeneratedItem[], opts: UseListingAutomationOptions = {}) {
// // // //   const {
// // // //     uploadImage,
// // // //     statusPollIntervalMs = 1500,
// // // //     maxPollMinutes = 10,
// // // //     endpoints,
// // // //     maxSelectableItems = Infinity,
// // // //     onMaxExceeded,
// // // //     debug = false,
// // // //     onRunUpdate,
// // // //   } = opts;

// // // //   /* Group by project */
// // // //   const projects: Project[] = useMemo(() => {
// // // //     const map = new Map<string, GeneratedItem[]>();
// // // //     for (const it of allItems) {
// // // //       const key = it.fileId ?? "__misc__";
// // // //       if (!map.has(key)) map.set(key, []);
// // // //       map.get(key)!.push(it);
// // // //     }
// // // //     return Array.from(map.entries()).map(([pid, arr]) => ({ id: pid, name: arr[0]?.fileName || pid || "Untitled Project", items: arr }));
// // // //   }, [allItems]);

// // // //   /* Search */
// // // //   const [search, setSearch] = useState("");
// // // //   const filteredProjects: Project[] = useMemo(() => {
// // // //     const q = search.toLowerCase().trim();
// // // //     if (!q) return projects;
// // // //     return projects.map(p => ({ ...p, items: p.items.filter(it => `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase().includes(q)) })).filter(p => p.items.length > 0);
// // // //   }, [projects, search]);

// // // //   /* Selection / expansion (unchanged behavior) */
// // // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // // //   const toggleProjectExpand = (pid: string) => { setExpandedProjectIds(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n; }); };

// // // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
// // // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);

// // // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // // //     const proj = projects.find(p => p.id === pid); if (!proj) return;
// // // //     if (!checked) {
// // // //       setSelectedProjectIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
// // // //       setSelectedItemIds(prev => { const n = new Set(prev); for (const it of proj.items) n.delete(it.id); return n; });
// // // //       return;
// // // //     }
// // // //     setSelectedItemIds(prev => {
// // // //       const n = new Set(prev); let added = 0;
// // // //       for (const it of proj.items) { if (n.size >= maxSelectableItems) break; if (!n.has(it.id)) { n.add(it.id); added++; } }
// // // //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// // // //       return n;
// // // //     });
// // // //     setSelectedProjectIds(prev => { const n = new Set(prev); const after = new Set(selectedItemIds); for (const it of proj.items) { if (after.size >= maxSelectableItems) break; after.add(it.id); } const allSelectedNow = proj.items.every(it => after.has(it.id)); if (allSelectedNow) n.add(pid); return n; });
// // // //   };

// // // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // // //     const proj = projects.find(p => p.id === pid);
// // // //     setSelectedItemIds(prev => { const n = new Set(prev); if (checked) { if (n.size >= maxSelectableItems && !n.has(iid)) { onMaxExceeded?.(maxSelectableItems); return prev; } n.add(iid); } else { n.delete(iid); } return n; });

// // // //     if (proj) {
// // // //       const after = new Set(selectedItemIds);
// // // //       checked ? after.add(iid) : after.delete(iid);
// // // //       const allSelected = proj.items.every(it => after.has(it.id));
// // // //       const noneSelected = proj.items.every(it => !after.has(it.id));
// // // //       setSelectedProjectIds(prev => { const n = new Set(prev); if (allSelected) n.add(pid); else if (noneSelected) n.delete(pid); return n; });
// // // //     }
// // // //   };

// // // //   const clearSelection = () => { setSelectedProjectIds(new Set()); setSelectedItemIds(new Set()); };
// // // //   const selectAllVisible = () => {
// // // //     const all = new Set<string>(); for (const p of filteredProjects) { for (const it of p.items) { if (all.size >= maxSelectableItems) break; all.add(it.id); } if (all.size >= maxSelectableItems) break; }
// // // //     setSelectedItemIds(all);
// // // //     const projIds = new Set<string>(); for (const p of filteredProjects) { const allInProj = p.items.every(it => all.has(it.id)); if (allInProj) projIds.add(p.id); }
// // // //     setSelectedProjectIds(projIds);
// // // //     if (filteredProjects.flatMap(p => p.items).length > maxSelectableItems) onMaxExceeded?.(maxSelectableItems);
// // // //   };

// // // //   /* Focused preview */
// // // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // // //   const focusedItem = useMemo(() => allItems.find(x => x.id === focusedItemId), [allItems, focusedItemId]);
// // // //   const selectedItems = useMemo(() => allItems.filter(it => selectedItemIds.has(it.id)), [allItems, selectedItemIds]);

// // // //   /* ===== Image upload helpers (same logic as before) ===== */
// // // //   async function autoUploadImage(file: File): Promise<string> {
// // // //     if (uploadImage) {
// // // //       const u = await uploadImage(file);
// // // //       if (u && !isBlobOrDataUrl(u)) { assertValidImageUrl(u, "uploadImage()"); return u; }
// // // //       if (debug) console.warn("uploadImage returned blob/data, falling back to backend uploader:", u);
// // // //     }
// // // //     const uploadUrl = endpoints?.upload ?? "/api/upload";
// // // //     const fd = new FormData(); fd.append("file", file);
// // // //     const res = await fetch(uploadUrl, { method: "POST", body: fd });
// // // //     if (!res.ok) { const t = await res.text().catch(() => ""); throw new Error(`Image upload failed: ${res.status} ${t}`); }
// // // //     const data = await res.json(); const url = data.url as string; assertValidImageUrl(url, "backendUpload"); return url;
// // // //   }

// // // //   function extFromMime(mime: string) { if (/png/i.test(mime)) return "png"; if (/webp/i.test(mime)) return "webp"; if (/gif/i.test(mime)) return "gif"; return "jpg"; }

// // // //   async function ensurePublicImageUrl(u: string, ctx: string): Promise<string> {
// // // //     if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // // //     if (isHttpUrl(u)) { assertValidImageUrl(u, ctx); return u; }
// // // //     if (!isBlobOrDataUrl(u) && looksLikeDirectImage(u)) { assertValidImageUrl(u, ctx); return u; }
// // // //     if (isBlobOrDataUrl(u)) {
// // // //       let blob: Blob; try { const r = await fetch(u); blob = await r.blob(); } catch (e: any) { throw new Error(`Cannot read local image (${ctx}). Please re-select image. ${e?.message || e}`); }
// // // //       const mime = blob.type || "image/jpeg"; const ext = extFromMime(mime); const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime }); const publicUrl = await autoUploadImage(file); assertValidImageUrl(publicUrl, ctx); return publicUrl;
// // // //     }
// // // //     assertValidImageUrl(u, ctx);
// // // //     return u;
// // // //   }

// // // //   /* ===== Build listings & payload (mostly unchanged) ===== */
// // // //   async function resolveDefaultImageUrl(imageUrl?: string, imageFile?: File | null) {
// // // //     if (imageUrl?.trim()) return await ensurePublicImageUrl(imageUrl.trim(), "defaultImageUrl");
// // // //     if (imageFile) { const u = await autoUploadImage(imageFile); assertValidImageUrl(u, "uploadedDefaultImageUrl"); return u; }
// // // //     return "";
// // // //   }

// // // //   async function buildListingsForSelected(params: { category?: string; keywordsDefaults?: string[]; defaultImageUrl?: string; }): Promise<AutomationListing[]> {
// // // //     const { category, keywordsDefaults = [], defaultImageUrl = "" } = params;
// // // //     const listings: AutomationListing[] = [];
// // // //     for (const it of selectedItems) {
// // // //       const ownKeywords = getItemKeywords(it);
// // // //       const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
// // // //       const rawImgs = (it.images || []).filter(Boolean) as string[];
// // // //       const publicImgs: string[] = [];
// // // //       for (let i = 0; i < rawImgs.length; i++) { const img = rawImgs[i]; const pub = await ensurePublicImageUrl(img, `item(${it.id}).images[${i}]`); publicImgs.push(pub); }
// // // //       const images = publicImgs.length > 0 ? publicImgs : defaultImageUrl ? [defaultImageUrl] : [];
// // // //       listings.push({ id: it.id, title: getItemTitle(it), contentHtml: getItemHtml(it), images, keywords: mergedKeywords, category: category || undefined });
// // // //     }
// // // //     const bad = listings.filter(l => !l.title || !l.contentHtml);
// // // //     if (bad.length) throw new Error(`Some items missing title/content: ${bad.map(b => b.id).join(", ")}`);
// // // //     const missingImg = listings.filter(l => l.images.length === 0);
// // // //     if (missingImg.length) throw new Error(`Some items missing image: ${missingImg.map(b => b.id).join(", ")}`);
// // // //     return listings;
// // // //   }

// // // //   async function buildPayload(params: StartParams): Promise<AutomationPayload> {
// // // //     const { sites, defaults: { category, keywordsDefaults, imageUrl, imageFile, profile } } = params;
// // // //     if (!Array.isArray(sites) || sites.length === 0) throw new Error("No sites selected.");
// // // //     if (sites.some((s) => !s.site || !s.username || !s.password)) throw new Error("Every selected site must have site + username + password.");
// // // //     if (selectedItems.length === 0) throw new Error("No items selected.");
// // // //     if (sites.length !== selectedItems.length) throw new Error(`Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`);
// // // //     const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile);
// // // //     const listings = await buildListingsForSelected({ category, keywordsDefaults, defaultImageUrl });
// // // //     const targets: AutomationTargetSite[] = sites.map((s, idx) => ({ site: s.site, login: { username: s.username, password: s.password }, type: (s as any).type ?? "classified", listings: [listings[idx]] }));
// // // //     const payload: AutomationPayload = { profile, targets };
// // // //     if (debug) console.log("[ListingAutomation] Built payload:", payload);
// // // //     return payload;
// // // //   }

// // // //   /* ===== Job runs state + polling (NEW) ===== */
// // // //   const [isStarting, setIsStarting] = useState(false);
// // // //   const [currentJobId, setCurrentJobId] = useState<string | null>(null);
// // // //   const [progress, setProgress] = useState(0);
// // // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");

// // // //   // runs history (most recent first)
// // // //   const [runs, setRuns] = useState<JobRun[]>([]);

// // // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // // //   const pollStartTime = useRef<number>(0);

// // // //   function cancelPolling() { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; } }

// // // //   async function fetchRun(jobId: string): Promise<JobRun | null> {
// // // //     const jobUrl = endpoints?.job?.(jobId) ?? endpoints?.status?.(jobId) ?? `/api/automation/status/${jobId}`;
// // // //     try {
// // // //       const res = await fetch(jobUrl, { cache: "no-store" });
// // // //       if (!res.ok) return null;
// // // //       const j = await res.json();
// // // //       // Normalize response into JobRun
// // // //       const run: JobRun = {
// // // //         jobId: j.jobId ?? jobId,
// // // //         status: j.status ?? (j.progress === 100 ? "done" : "running") as any,
// // // //         progress: typeof j.progress === "number" ? j.progress : 0,
// // // //         startedAt: j.startedAt ?? j.startedAtAt ?? undefined,
// // // //         finishedAt: j.finishedAt ?? null,
// // // //         backlinks: Array.isArray(j.backlinks) ? j.backlinks : j.backlinks ? [j.backlinks] : [],
// // // //         successCount: typeof j.successCount === "number" ? j.successCount : j.success ?? undefined,
// // // //         failCount: typeof j.failCount === "number" ? j.failCount : j.fail ?? undefined,
// // // //         logs: Array.isArray(j.logs) ? j.logs : [],
// // // //         error: j.error ?? null,
// // // //       };
// // // //       return run;
// // // //     } catch (e) {
// // // //       if (debug) console.warn("fetchRun error:", e);
// // // //       return null;
// // // //     }
// // // //   }

// // // //   function upsertRun(run: JobRun) {
// // // //     setRuns(prev => {
// // // //       const idx = prev.findIndex(r => r.jobId === run.jobId);
// // // //       if (idx === -1) return [run, ...prev];
// // // //       const copy = [...prev]; copy[idx] = { ...copy[idx], ...run }; copy.sort((a,b) => (b.startedAt||0) - (a.startedAt||0)); return copy;
// // // //     });
// // // //     onRunUpdate?.(run);
// // // //   }

// // // //   function startPollingForJob(jid: string) {
// // // //     cancelPolling();
// // // //     pollStartTime.current = Date.now();
// // // //     const intervalMs = Math.max(500, statusPollIntervalMs);
// // // //     // immediate fetch
// // // //     (async () => {
// // // //       const r = await fetchRun(jid);
// // // //       if (r) { upsertRun(r); setProgress(r.progress); setStatus(r.status === "running" ? "running" : (r.status as any)); }
// // // //     })();

// // // //     pollTimer.current = setInterval(async () => {
// // // //       const minutes = (Date.now() - pollStartTime.current) / 60000;
// // // //       if (minutes > maxPollMinutes) {
// // // //         cancelPolling();
// // // //         setStatus("error");
// // // //         return;
// // // //       }
// // // //       try {
// // // //         const r = await fetchRun(jid);
// // // //         if (r) {
// // // //           upsertRun(r);
// // // //           setProgress(r.progress ?? 0);
// // // //           setStatus((r.status as any) === "running" ? "running" : (r.status as any));
// // // //           // stop when done or error
// // // //           if (r.status === "done") { cancelPolling(); }
// // // //           if (r.status === "error") { cancelPolling(); }
// // // //         }
// // // //       } catch (e) { /* ignore transient */ }
// // // //     }, intervalMs);
// // // //   }

// // // //   /* ===== Start endpoint override (improved to create run record on client immediately) ===== */
// // // //   async function start(params: StartParams): Promise<{ jobId: string | null; listings: number; payload: AutomationPayload }>{
// // // //     setIsStarting(true);
// // // //     setStatus("idle");
// // // //     setProgress(0);
// // // //     setCurrentJobId(null);
// // // //     cancelPolling();

// // // //     try {
// // // //       const payload = await buildPayload(params);
// // // //       const listingsCount = payload.targets.reduce((sum, t) => sum + t.listings.length, 0);
// // // //       if (debug) console.log("Starting automation with payload:", payload);
// // // //       if (params.dryRun) return { jobId: null, listings: listingsCount, payload };

// // // //       const startUrl = endpoints?.start ?? "/api/automation/start";
// // // //       const res = await fetch(startUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
// // // //       if (!res.ok) { const txt = await res.text().catch(() => ""); throw new Error(`Backend error: ${res.status} ${txt}`); }
// // // //       const data = await res.json();
// // // //       const jid = data.jobId ?? null;

// // // //       // create optimistic run entry so UI shows a box immediately
// // // //       const now = Date.now();
// // // //       const optimisticRun: JobRun = { jobId: jid, status: jid ? "running" : "idle", progress: 0, startedAt: now, backlinks: [], successCount: 0, failCount: 0, logs: [] };
// // // //       upsertRun(optimisticRun);

// // // //       setCurrentJobId(jid);
// // // //       setStatus(jid ? "running" : "idle");

// // // //       if (jid) startPollingForJob(jid);

// // // //       return { jobId: jid, listings: listingsCount, payload };
// // // //     } finally {
// // // //       setIsStarting(false);
// // // //     }
// // // //   }

// // // //   useEffect(() => cancelPolling, []);

// // // //   /* Helper: fetch a saved run by id */
// // // //   async function fetchRunDetails(jobId: string) { const r = await fetchRun(jobId); if (r) upsertRun(r); return r; }

// // // //   /* Helper: download export for a run (backend must implement export endpoint that returns xlsx/csv) */
// // // //   async function downloadRunExcel(jobId: string | null, filename = "automation_run.xlsx") {
// // // //     if (!jobId) throw new Error("Missing jobId");
// // // //     const exportUrl = endpoints?.export?.(jobId) ?? `/api/automation/export/${jobId}`;
// // // //     const res = await fetch(exportUrl, { method: "GET" });
// // // //     if (!res.ok) { const txt = await res.text().catch(() => ""); throw new Error(`Export failed: ${res.status} ${txt}`); }
// // // //     const blob = await res.blob();
// // // //     // trigger download in browser
// // // //     const url = URL.createObjectURL(blob);
// // // //     const a = document.createElement("a");
// // // //     a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
// // // //     return true;
// // // //   }

// // // //   /* Exposed API */
// // // //   return {
// // // //     search,
// // // //     setSearch,
// // // //     projects,
// // // //     filteredProjects,

// // // //     expandedProjectIds,
// // // //     toggleProjectExpand,
// // // //     selectedProjectIds,
// // // //     selectedItemIds,
// // // //     isProjectSelected,
// // // //     isItemSelected,
// // // //     setProjectChecked,
// // // //     setItemChecked,
// // // //     selectAllVisible,
// // // //     clearSelection,

// // // //     focusedItemId,
// // // //     setFocusedItemId,
// // // //     focusedItem,

// // // //     selectedItems,

// // // //     buildPayload,
// // // //     start,
// // // //     cancelPolling,
// // // //     isStarting,
// // // //     jobId: currentJobId,
// // // //     progress,
// // // //     status,

// // // //     // runs history + helpers
// // // //     runs,
// // // //     fetchRunDetails,
// // // //     downloadRunExcel,
// // // //   };
// // // // }






// // // // src/hooks/useListingAutomation.ts
// // // import { useEffect, useMemo, useRef, useState } from "react";

// // // /**
// // //  * useListingAutomation.ts
// // //  * Full drop-in replacement with improved job-run tracking, immediate backlink capture,
// // //  * frequent status polling, job history (runs), and Excel export helper.
// // //  *
// // //  * Endpoint resolution:
// // //  * - Prefer NEXT_PUBLIC_API_BASE (e.g. https://your-backend.onrender.com)
// // //  * - Fallback to window.location.origin (if running in browser)
// // //  * - Final fallback uses relative /api/* paths
// // //  *
// // //  * To set Render/localhost base URL:
// // //  *   NEXT_PUBLIC_API_BASE=https://classified-backend-xyz.onrender.com
// // //  *   or
// // //  *   NEXT_PUBLIC_API_BASE=http://localhost:3000
// // //  */

// // // /* ===== Types (match your page) ===== */
// // // export type GeneratedItem = {
// // //   id: string;
// // //   keyword?: string | string[];
// // //   title?: string;
// // //   html?: string;
// // //   generatedContent?: string;
// // //   images?: string[];
// // //   fileId?: string;
// // //   fileName?: string;
// // //   createdAt?: number | string;
// // // };

// // // export type Address = { country: string; state: string; city: string; zip: string; line1: string };
// // // export type Socials = { facebook?: string; twitter?: string; linkedin?: string; pinterest?: string; instagram?: string; yelp?: string; gmb?: string };

// // // export type AutomationListing = { id: string; title: string; contentHtml: string; images: string[]; keywords: string[]; tags?: string[]; category?: string };
// // // export type AutomationTargetSite = { site: string; login: { username: string; password: string }; type?: string; listings: AutomationListing[] };
// // // export type AutomationPayload = { profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address }; targets: AutomationTargetSite[] };

// // // export type UseListingAutomationOptions = {
// // //   uploadImage?: (file: File) => Promise<string>;
// // //   statusPollIntervalMs?: number;
// // //   maxPollMinutes?: number;
// // //   endpoints?: { start?: string; status?: (jobId: string) => string; upload?: string; export?: (jobId: string) => string; job?: (jobId: string) => string };
// // //   maxSelectableItems?: number;
// // //   onMaxExceeded?: (max: number) => void;
// // //   debug?: boolean;
// // //   /** Optional callback to receive live run updates */
// // //   onRunUpdate?: (run: JobRun) => void;
// // // };

// // // export type StartParams = {
// // //   sites: { site: string; username: string; password: string; type?: string }[];
// // //   defaults: { category?: string; keywordsDefaults?: string[]; imageUrl?: string; imageFile?: File | null; profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address } };
// // //   dryRun?: boolean;
// // // };

// // // export type Project = { id: string; name: string; items: GeneratedItem[] };

// // // /* Job run shape returned by backend status endpoints (best-effort) */
// // // export type JobRun = {
// // //   jobId: string | null;
// // //   status: "queued" | "running" | "done" | "error" | "idle";
// // //   progress: number;
// // //   startedAt?: number;
// // //   finishedAt?: number | null;
// // //   backlinks?: string[]; // accumulated as they arrive
// // //   successCount?: number;
// // //   failCount?: number;
// // //   logs?: string[];
// // //   error?: string | null;
// // // };

// // // /* Small local helpers (reused) */
// // // function getItemTitle(it: GeneratedItem) { return it.title ?? ""; }
// // // function getItemHtml(it: GeneratedItem) { return (it.html ?? it.generatedContent ?? "").toString(); }
// // // function getItemKeywords(it: GeneratedItem): string[] { if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean); if (typeof it.keyword === "string") return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean); return []; }

// // // /* ===== Image helpers (copied / compatible) ===== */
// // // function isBlobOrDataUrl(u: string) { return /^blob:|^data:/i.test(u); }
// // // function isHttpUrl(u: string) { return /^https?:\/\//i.test(u); }
// // // function looksLikeDirectImage(u: string) { return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u); }
// // // function assertValidImageUrl(u: string, ctx: string) {
// // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // //   if (isBlobOrDataUrl(u)) throw new Error(`Invalid image URL (${ctx}): ${u} — blob/data URLs are not supported on backend. Upload first.`);
// // //   if (isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Image URL is not a direct file (${ctx}): ${u}`);
// // //   if (!isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Invalid image URL (${ctx}): ${u}`);
// // // }

// // // /* ===== Endpoint/Base URL resolution logic ===== */
// // // // function resolveApiBase() {
// // // //   // Priority: NEXT_PUBLIC_API_BASE -> window.location.origin -> empty (relative)
// // // //   const envBase = typeof process !== "undefined" && (process.env as any)?.NEXT_PUBLIC_API_BASE;
// // // //   if (envBase && String(envBase).trim()) return String(envBase).replace(/\/$/, "");
// // // //   if (typeof window !== "undefined" && window.location && window.location.origin) return window.location.origin.replace(/\/$/, "");
// // // //   return "";
// // // // }

// // // // function createEndpointHelpers(endpoints?: UseListingAutomationOptions["endpoints"]) {
// // // //   const API_BASE = resolveApiBase(); // '' or absolute origin
// // // //   const baseOrRelative = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

// // // //   const startUrl = () => endpoints?.start ?? baseOrRelative("/api/automation/start");
// // // //   const jobUrl = (jid: string) => {
// // // //     if (endpoints?.job) return endpoints.job(jid);
// // // //     if (endpoints?.status) return endpoints.status(jid);
// // // //     return baseOrRelative(`/api/automation/status/${jid}`);
// // // //   };
// // // //   const statusUrl = (jid: string) => {
// // // //     if (endpoints?.status) return endpoints.status(jid);
// // // //     if (endpoints?.job) return endpoints.job(jid);
// // // //     return baseOrRelative(`/api/automation/status/${jid}`);
// // // //   };
// // // //   const uploadUrl = () => endpoints?.upload ?? baseOrRelative("/api/upload");
// // // //   const exportUrl = (jid: string) => (endpoints?.export ? endpoints.export(jid) : baseOrRelative(`/api/automation/export/${jid}`));

// // // //   return { startUrl, jobUrl, statusUrl, uploadUrl, exportUrl };
// // // // }



// // // /* ===== Hook implementation (improved) ===== */
// // // export function useListingAutomation(allItems: GeneratedItem[], opts: UseListingAutomationOptions = {}) {
// // //   const {
// // //     uploadImage,
// // //     statusPollIntervalMs = 1500,
// // //     maxPollMinutes = 10,
// // //     // endpoints,
// // //     maxSelectableItems = Infinity,
// // //     onMaxExceeded,
// // //     debug = false,
// // //     onRunUpdate,
// // //   } = opts;

  
// // // const API_BASE = "http://localhost:3000";


// // //   // const ENDPOINTS = useMemo(() => createEndpointHelpers(endpoints), [endpoints]);

// // //   const ENDPOINTS = {
// // //   startUrl: () => `${API_BASE}/api/automation/start`,
// // //   jobUrl: (jid: string) => `${API_BASE}/api/automation/status/${jid}`,
// // //   statusUrl: (jid: string) => `${API_BASE}/api/automation/status/${jid}`,
// // //   uploadUrl: () => `${API_BASE}/api/upload`,
// // //   exportUrl: (jid: string) => `${API_BASE}/api/automation/export/${jid}`,
// // // };


// // //   /* Group by project */
// // //   const projects: Project[] = useMemo(() => {
// // //     const map = new Map<string, GeneratedItem[]>();
// // //     for (const it of allItems) {
// // //       const key = it.fileId ?? "__misc__";
// // //       if (!map.has(key)) map.set(key, []);
// // //       map.get(key)!.push(it);
// // //     }
// // //     return Array.from(map.entries()).map(([pid, arr]) => ({ id: pid, name: arr[0]?.fileName || pid || "Untitled Project", items: arr }));
// // //   }, [allItems]);

// // //   /* Search */
// // //   const [search, setSearch] = useState("");
// // //   const filteredProjects: Project[] = useMemo(() => {
// // //     const q = search.toLowerCase().trim();
// // //     if (!q) return projects;
// // //     return projects.map(p => ({ ...p, items: p.items.filter(it => `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase().includes(q)) })).filter(p => p.items.length > 0);
// // //   }, [projects, search]);

// // //   /* Selection / expansion (unchanged behavior) */
// // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // //   const toggleProjectExpand = (pid: string) => { setExpandedProjectIds(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n; }); };

// // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
// // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);

// // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // //     const proj = projects.find(p => p.id === pid); if (!proj) return;
// // //     if (!checked) {
// // //       setSelectedProjectIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
// // //       setSelectedItemIds(prev => { const n = new Set(prev); for (const it of proj.items) n.delete(it.id); return n; });
// // //       return;
// // //     }
// // //     setSelectedItemIds(prev => {
// // //       const n = new Set(prev); let added = 0;
// // //       for (const it of proj.items) { if (n.size >= maxSelectableItems) break; if (!n.has(it.id)) { n.add(it.id); added++; } }
// // //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// // //       return n;
// // //     });
// // //     setSelectedProjectIds(prev => { const n = new Set(prev); const after = new Set(selectedItemIds); for (const it of proj.items) { if (after.size >= maxSelectableItems) break; after.add(it.id); } const allSelectedNow = proj.items.every(it => after.has(it.id)); if (allSelectedNow) n.add(pid); return n; });
// // //   };

// // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // //     const proj = projects.find(p => p.id === pid);
// // //     setSelectedItemIds(prev => { const n = new Set(prev); if (checked) { if (n.size >= maxSelectableItems && !n.has(iid)) { onMaxExceeded?.(maxSelectableItems); return prev; } n.add(iid); } else { n.delete(iid); } return n; });

// // //     if (proj) {
// // //       const after = new Set(selectedItemIds);
// // //       checked ? after.add(iid) : after.delete(iid);
// // //       const allSelected = proj.items.every(it => after.has(it.id));
// // //       const noneSelected = proj.items.every(it => !after.has(it.id));
// // //       setSelectedProjectIds(prev => { const n = new Set(prev); if (allSelected) n.add(pid); else if (noneSelected) n.delete(pid); return n; });
// // //     }
// // //   };

// // //   const clearSelection = () => { setSelectedProjectIds(new Set()); setSelectedItemIds(new Set()); };
// // //   const selectAllVisible = () => {
// // //     const all = new Set<string>(); for (const p of filteredProjects) { for (const it of p.items) { if (all.size >= maxSelectableItems) break; all.add(it.id); } if (all.size >= maxSelectableItems) break; }
// // //     setSelectedItemIds(all);
// // //     const projIds = new Set<string>(); for (const p of filteredProjects) { const allInProj = p.items.every(it => all.has(it.id)); if (allInProj) projIds.add(p.id); }
// // //     setSelectedProjectIds(projIds);
// // //     if (filteredProjects.flatMap(p => p.items).length > maxSelectableItems) onMaxExceeded?.(maxSelectableItems);
// // //   };

// // //   /* Focused preview */
// // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // //   const focusedItem = useMemo(() => allItems.find(x => x.id === focusedItemId), [allItems, focusedItemId]);
// // //   const selectedItems = useMemo(() => allItems.filter(it => selectedItemIds.has(it.id)), [allItems, selectedItemIds]);

// // //   /* ===== Image upload helpers (same logic as before) ===== */
// // //   async function autoUploadImage(file: File): Promise<string> {
// // //     if (uploadImage) {
// // //       const u = await uploadImage(file);
// // //       if (u && !isBlobOrDataUrl(u)) { assertValidImageUrl(u, "uploadImage()"); return u; }
// // //       if (debug) console.warn("uploadImage returned blob/data, falling back to backend uploader:", u);
// // //     }
// // //     const uploadUrl = ENDPOINTS.uploadUrl();
// // //     const fd = new FormData(); fd.append("file", file);
// // //     const res = await fetch(uploadUrl, { method: "POST", body: fd });
// // //     if (!res.ok) { const t = await res.text().catch(() => ""); throw new Error(`Image upload failed: ${res.status} ${t}`); }
// // //     const data = await res.json(); const url = data.url as string; assertValidImageUrl(url, "backendUpload"); return url;
// // //   }

// // //   function extFromMime(mime: string) { if (/png/i.test(mime)) return "png"; if (/webp/i.test(mime)) return "webp"; if (/gif/i.test(mime)) return "gif"; return "jpg"; }

// // //   async function ensurePublicImageUrl(u: string, ctx: string): Promise<string> {
// // //     if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // //     if (isHttpUrl(u)) { assertValidImageUrl(u, ctx); return u; }
// // //     if (!isBlobOrDataUrl(u) && looksLikeDirectImage(u)) { assertValidImageUrl(u, ctx); return u; }
// // //     if (isBlobOrDataUrl(u)) {
// // //       let blob: Blob; try { const r = await fetch(u); blob = await r.blob(); } catch (e: any) { throw new Error(`Cannot read local image (${ctx}). Please re-select image. ${e?.message || e}`); }
// // //       const mime = blob.type || "image/jpeg"; const ext = extFromMime(mime); const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime }); const publicUrl = await autoUploadImage(file); assertValidImageUrl(publicUrl, ctx); return publicUrl;
// // //     }
// // //     assertValidImageUrl(u, ctx);
// // //     return u;
// // //   }

// // //   /* ===== Build listings & payload (mostly unchanged) ===== */
// // //   async function resolveDefaultImageUrl(imageUrl?: string, imageFile?: File | null) {
// // //     if (imageUrl?.trim()) return await ensurePublicImageUrl(imageUrl.trim(), "defaultImageUrl");
// // //     if (imageFile) { const u = await autoUploadImage(imageFile); assertValidImageUrl(u, "uploadedDefaultImageUrl"); return u; }
// // //     return "";
// // //   }

// // //   async function buildListingsForSelected(params: { category?: string; keywordsDefaults?: string[]; defaultImageUrl?: string; }): Promise<AutomationListing[]> {
// // //     const { category, keywordsDefaults = [], defaultImageUrl = "" } = params;
// // //     const listings: AutomationListing[] = [];
// // //     for (const it of selectedItems) {
// // //       const ownKeywords = getItemKeywords(it);
// // //       const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
// // //       const rawImgs = (it.images || []).filter(Boolean) as string[];
// // //       const publicImgs: string[] = [];
// // //       for (let i = 0; i < rawImgs.length; i++) { const img = rawImgs[i]; const pub = await ensurePublicImageUrl(img, `item(${it.id}).images[${i}]`); publicImgs.push(pub); }
// // //       const images = publicImgs.length > 0 ? publicImgs : defaultImageUrl ? [defaultImageUrl] : [];
// // //  listings.push({
// // //   id: it.id,
// // //   title: getItemTitle(it),
// // //   contentHtml: getItemHtml(it),
// // //   images,

// // //   // 🔥 Always send keywords AND tags
// // //   keywords: mergedKeywords,
// // //   tags: mergedKeywords,

// // //   category: category || undefined
// // // });

// // //     }
// // //     const bad = listings.filter(l => !l.title || !l.contentHtml);
// // //     if (bad.length) throw new Error(`Some items missing title/content: ${bad.map(b => b.id).join(", ")}`);
// // //     const missingImg = listings.filter(l => l.images.length === 0);
// // //     if (missingImg.length) throw new Error(`Some items missing image: ${missingImg.map(b => b.id).join(", ")}`);
// // //     return listings;
// // //   }

// // //   async function buildPayload(params: StartParams): Promise<AutomationPayload> {
// // //     const { sites, defaults: { category, keywordsDefaults, imageUrl, imageFile, profile } } = params;
// // //     if (!Array.isArray(sites) || sites.length === 0) throw new Error("No sites selected.");
// // //     if (sites.some((s) => !s.site || !s.username || !s.password)) throw new Error("Every selected site must have site + username + password.");
// // //     if (selectedItems.length === 0) throw new Error("No items selected.");
// // //     if (sites.length !== selectedItems.length) throw new Error(`Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`);
// // //     const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile);
// // //     const listings = await buildListingsForSelected({ category, keywordsDefaults, defaultImageUrl });
// // //     const targets: AutomationTargetSite[] = sites.map((s, idx) => ({ site: s.site, login: { username: s.username, password: s.password }, type: (s as any).type ?? "classified", listings: [listings[idx]] }));
// // //     const payload: AutomationPayload = { profile, targets };
// // //     if (debug) console.log("[ListingAutomation] Built payload:", payload);
// // //     return payload;
// // //   }

// // //   /* ===== Job runs state + polling (NEW) ===== */
// // //   const [isStarting, setIsStarting] = useState(false);
// // //   const [currentJobId, setCurrentJobId] = useState<string | null>(null);
// // //   const [progress, setProgress] = useState(0);
// // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");

// // //   // runs history (most recent first)
// // //   const [runs, setRuns] = useState<JobRun[]>([]);

// // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // //   const pollStartTime = useRef<number>(0);

// // //   function cancelPolling() { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; } }

// // //   async function fetchRun(jobId: string): Promise<JobRun | null> {
// // //     const jobUrl = ENDPOINTS.jobUrl(jobId);
// // //     try {
// // //       const res = await fetch(jobUrl, { cache: "no-store" });
// // //       if (!res.ok) return null;
// // //       const j = await res.json();
// // //       // Normalize response into JobRun
// // //       const run: JobRun = {
// // //         jobId: j.jobId ?? jobId,
// // //         status: j.status ?? (j.progress === 100 ? "done" : "running") as any,
// // //         progress: typeof j.progress === "number" ? j.progress : 0,
// // //         startedAt: j.startedAt ?? j.startedAtAt ?? undefined,
// // //         finishedAt: j.finishedAt ?? null,
// // //         backlinks: Array.isArray(j.backlinks) ? j.backlinks : j.backlinks ? [j.backlinks] : [],
// // //         successCount: typeof j.successCount === "number" ? j.successCount : j.success ?? undefined,
// // //         failCount: typeof j.failCount === "number" ? j.failCount : j.fail ?? undefined,
// // //         logs: Array.isArray(j.logs) ? j.logs : [],
// // //         error: j.error ?? null,
// // //       };
// // //       return run;
// // //     } catch (e) {
// // //       if (debug) console.warn("fetchRun error:", e);
// // //       return null;
// // //     }
// // //   }

// // //   function upsertRun(run: JobRun) {
// // //     setRuns(prev => {
// // //       const idx = prev.findIndex(r => r.jobId === run.jobId);
// // //       if (idx === -1) return [run, ...prev];
// // //       const copy = [...prev]; copy[idx] = { ...copy[idx], ...run }; copy.sort((a,b) => (b.startedAt||0) - (a.startedAt||0)); return copy;
// // //     });
// // //     onRunUpdate?.(run);
// // //   }

// // //   function startPollingForJob(jid: string) {
// // //     cancelPolling();
// // //     pollStartTime.current = Date.now();
// // //     const intervalMs = Math.max(500, statusPollIntervalMs);
// // //     // immediate fetch
// // //     (async () => {
// // //       const r = await fetchRun(jid);
// // //       if (r) { upsertRun(r); setProgress(r.progress); setStatus(r.status === "running" ? "running" : (r.status as any)); }
// // //     })();

// // //     pollTimer.current = setInterval(async () => {
// // //       const minutes = (Date.now() - pollStartTime.current) / 60000;
// // //       if (minutes > maxPollMinutes) {
// // //         cancelPolling();
// // //         setStatus("error");
// // //         return;
// // //       }
// // //       try {
// // //         const r = await fetchRun(jid);
// // //         if (r) {
// // //           upsertRun(r);
// // //           setProgress(r.progress ?? 0);
// // //           setStatus((r.status as any) === "running" ? "running" : (r.status as any));
// // //           // stop when done or error
// // //           if (r.status === "done") { cancelPolling(); }
// // //           if (r.status === "error") { cancelPolling(); }
// // //         }
// // //       } catch (e) { /* ignore transient */ }
// // //     }, intervalMs);
// // //   }

// // //   /* ===== Start endpoint override (improved to create run record on client immediately) ===== */
// // //   async function start(params: StartParams): Promise<{ jobId: string | null; listings: number; payload: AutomationPayload }>{
// // //     setIsStarting(true);
// // //     setStatus("idle");
// // //     setProgress(0);
// // //     setCurrentJobId(null);
// // //     cancelPolling();

// // //     try {
// // //       const payload = await buildPayload(params);
// // //       const listingsCount = payload.targets.reduce((sum, t) => sum + t.listings.length, 0);
// // //       if (debug) console.log("Starting automation with payload:", payload);
// // //       if (params.dryRun) return { jobId: null, listings: listingsCount, payload };

// // //       const startUrl = ENDPOINTS.startUrl();
// // //       const res = await fetch(startUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
// // //       if (!res.ok) { const txt = await res.text().catch(() => ""); throw new Error(`Backend error: ${res.status} ${txt}`); }
// // //       const data = await res.json();
// // //       const jid = data.jobId ?? null;

// // //       // create optimistic run entry so UI shows a box immediately
// // //       const now = Date.now();
// // //       const optimisticRun: JobRun = { jobId: jid, status: jid ? "running" : "idle", progress: 0, startedAt: now, backlinks: [], successCount: 0, failCount: 0, logs: [] };
// // //       upsertRun(optimisticRun);

// // //       setCurrentJobId(jid);
// // //       setStatus(jid ? "running" : "idle");

// // //       if (jid) startPollingForJob(jid);

// // //       return { jobId: jid, listings: listingsCount, payload };
// // //     } finally {
// // //       setIsStarting(false);
// // //     }
// // //   }

// // //   useEffect(() => cancelPolling, []);

// // //   /* Helper: fetch a saved run by id */
// // //   async function fetchRunDetails(jobId: string) { const r = await fetchRun(jobId); if (r) upsertRun(r); return r; }

// // //   /* Helper: download export for a run (backend must implement export endpoint that returns xlsx/csv) */
// // //   async function downloadRunExcel(jobId: string | null, filename = "automation_run.xlsx") {
// // //     if (!jobId) throw new Error("Missing jobId");
// // //     const exportUrl = ENDPOINTS.exportUrl(jobId);
// // //     const res = await fetch(exportUrl, { method: "GET" });
// // //     if (!res.ok) { const txt = await res.text().catch(() => ""); throw new Error(`Export failed: ${res.status} ${txt}`); }
// // //     const blob = await res.blob();
// // //     // trigger download in browser
// // //     const url = URL.createObjectURL(blob);
// // //     const a = document.createElement("a");
// // //     a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
// // //     return true;
// // //   }

// // //   /* Exposed API */
// // //   return {
// // //     search,
// // //     setSearch,
// // //     projects,
// // //     filteredProjects,

// // //     expandedProjectIds,
// // //     toggleProjectExpand,
// // //     selectedProjectIds,
// // //     selectedItemIds,
// // //     isProjectSelected,
// // //     isItemSelected,
// // //     setProjectChecked,
// // //     setItemChecked,
// // //     selectAllVisible,
// // //     clearSelection,

// // //     focusedItemId,
// // //     setFocusedItemId,
// // //     focusedItem,

// // //     selectedItems,

// // //     buildPayload,
// // //     start,
// // //     cancelPolling,
// // //     isStarting,
// // //     jobId: currentJobId,
// // //     progress,
// // //     status,

// // //     // runs history + helpers
// // //     runs,
// // //     fetchRunDetails,
// // //     downloadRunExcel,
// // //   };
// // // }


// // // /* ===== Types (match your page) ===== */
// // // export type GeneratedItem = {
// // //   id: string;
// // //   keyword?: string | string[];
// // //   title?: string;
// // //   html?: string;
// // //   generatedContent?: string;
// // //   images?: string[];
// // //   fileId?: string;
// // //   fileName?: string;
// // //   createdAt?: number | string;
// // // };
// // // export type Address = { country: string; state: string; city: string; zip: string; line1: string };
// // // export type Socials = { facebook?: string; twitter?: string; linkedin?: string; pinterest?: string; instagram?: string; yelp?: string; gmb?: string };
// // // export type AutomationListing = { id: string; title: string; contentHtml: string; images: string[]; keywords: string[]; tags?: string[]; category?: string };
// // // export type AutomationTargetSite = { site: string; login: { username: string; password: string }; type?: string; listings: AutomationListing[] };
// // // export type AutomationPayload = { profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address }; targets: AutomationTargetSite[] };
// // // export type UseListingAutomationOptions = {
// // //   uploadImage?: (file: File) => Promise<string>;
// // //   statusPollIntervalMs?: number;
// // //   maxPollMinutes?: number;
// // //   maxSelectableItems?: number;
// // //   onMaxExceeded?: (max: number) => void;
// // //   debug?: boolean;
// // //   /** Optional callback to receive live run updates */
// // //   onRunUpdate?: (run: JobRun) => void;
// // // };
// // // export type StartParams = {
// // //   sites: { site: string; username: string; password: string; type?: string }[];
// // //   defaults: { category?: string; keywordsDefaults?: string[]; imageUrl?: string; imageFile?: File | null; profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address } };
// // //   dryRun?: boolean;
// // // };
// // // export type Project = { id: string; name: string; items: GeneratedItem[] };
// // // /* Job run shape (client-side managed) */
// // // export type JobRun = {
// // //   jobId: string | null;
// // //   status: "queued" | "running" | "done" | "error" | "idle";
// // //   progress: number;
// // //   startedAt?: number;
// // //   finishedAt?: number | null;
// // //   backlinks?: string[]; // accumulated as they arrive
// // //   successCount?: number;
// // //   failCount?: number;
// // //   logs?: string[];
// // //   error?: string | null;
// // // };

// // // /* Small local helpers (reused) */
// // // function getItemTitle(it: GeneratedItem) { return it.title ?? ""; }
// // // function getItemHtml(it: GeneratedItem) { return (it.html ?? it.generatedContent ?? "").toString(); }
// // // function getItemKeywords(it: GeneratedItem): string[] { if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean); if (typeof it.keyword === "string") return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean); return []; }

// // // /* ===== Image helpers (copied / compatible) ===== */
// // // function isBlobOrDataUrl(u: string) { return /^blob:|^data:/i.test(u); }
// // // function isHttpUrl(u: string) { return /^https?:\/\//i.test(u); }
// // // function looksLikeDirectImage(u: string) { return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u); }
// // // function assertValidImageUrl(u: string, ctx: string) {
// // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // //   if (isBlobOrDataUrl(u)) throw new Error(`Invalid image URL (${ctx}): ${u} — blob/data URLs are not supported. Upload first.`);
// // //   if (isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Image URL is not a direct file (${ctx}): ${u}`);
// // //   if (!isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Invalid image URL (${ctx}): ${u}`);
// // // }

// // // /* ===== WP API Helpers (New - Direct Calls) ===== */
// // // async function getOrCreateTerm(termsUrl: string, taxonomy: 'category' | 'post_tag', name: string, authHeader: string): Promise<number> {
// // //   const searchUrl = `${termsUrl}?search=${encodeURIComponent(name)}&per_page=1`;
// // //   let res = await fetch(searchUrl, { headers: { Authorization: authHeader } });
// // //   if (!res.ok) throw new Error(`Failed to search terms: ${res.status}`);
// // //   let terms = await res.json();
// // //   if (terms.length > 0) return terms[0].id;

// // //   // Create
// // //   res = await fetch(termsUrl, {
// // //     method: 'POST',
// // //     headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
// // //     body: JSON.stringify({ name, taxonomy }),
// // //   });
// // //   if (!res.ok) throw new Error(`Failed to create term: ${res.status}`);
// // //   const term = await res.json();
// // //   return term.id;
// // // }

// // // async function uploadMedia(mediaUrl: string, imageUrl: string, authHeader: string): Promise<number> {
// // //   let blob: Blob;
// // //   if (isHttpUrl(imageUrl)) {
// // //     const imgRes = await fetch(imageUrl);
// // //     if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
// // //     blob = await imgRes.blob();
// // //   } else {
// // //     throw new Error(`Unsupported image URL: ${imageUrl}`);
// // //   }

// // //   const fd = new FormData();
// // //   fd.append('file', blob, `featured-${Date.now()}.jpg`);

// // //   const res = await fetch(mediaUrl, {
// // //     method: 'POST',
// // //     headers: { Authorization: authHeader },
// // //     body: fd,
// // //   });
// // //   if (!res.ok) throw new Error(`Media upload failed: ${res.status}`);
// // //   const media = await res.json();
// // //   return media.id;
// // // }

// // // async function createPostOnSite(site: string, login: { username: string; password: string }, listing: AutomationListing, category?: string): Promise<string> {
// // //   const apiUrl = `https://${site}/wp-json/wp/v2/posts`;
// // //   const mediaUrl = apiUrl.replace('/posts', '/media');
// // //   const catsUrl = apiUrl.replace('/posts', '/categories');
// // //   const tagsUrl = apiUrl.replace('/posts', '/tags');
// // //   const auth = btoa(`${login.username}:${login.password}`);
// // //   const authHeader = `Basic ${auth}`;
// // //   const headers = { Authorization: authHeader, 'Content-Type': 'application/json' };

// // //   // Resolve category ID
// // //   let categories: number[] = [];
// // //   if (category) {
// // //     const catId = await getOrCreateTerm(catsUrl, 'category', category, authHeader);
// // //     categories = [catId];
// // //   }

// // //   // Resolve tag IDs
// // //   const tagIds = await Promise.all(
// // //     listing.keywords.map(kw => getOrCreateTerm(tagsUrl, 'post_tag', kw, authHeader))
// // //   );

// // //   // Create post without featured media
// // //   const postData = {
// // //     title: listing.title,
// // //     content: listing.contentHtml,
// // //     status: 'publish',
// // //     categories,
// // //     tags: tagIds,
// // //   };
// // //   let res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(postData) });
// // //   if (!res.ok) throw new Error(`Post creation failed: ${res.status}`);
// // //   let post = await res.json();

// // //   // Upload and set featured image if available
// // //   if (listing.images.length > 0) {
// // //     const imgUrl = listing.images[0];
// // //     assertValidImageUrl(imgUrl, `featured for ${site}`);
// // //     const mediaId = await uploadMedia(mediaUrl, imgUrl, authHeader);
// // //     res = await fetch(`${apiUrl}/${post.id}`, {
// // //       method: 'POST',
// // //       headers,
// // //       body: JSON.stringify({ featured_media: mediaId }),
// // //     });
// // //     if (!res.ok) throw new Error(`Featured image update failed: ${res.status}`);
// // //     post = await res.json();
// // //   }

// // //   return post.link;
// // // }

// // // /* ===== Image upload helpers (for defaults) ===== */
// // // async function autoUploadImage(file: File, uploadImage?: (file: File) => Promise<string>): Promise<string> {
// // //   if (uploadImage) {
// // //     const u = await uploadImage(file);
// // //     if (u && !isBlobOrDataUrl(u)) { assertValidImageUrl(u, "uploadImage()"); return u; }
// // //   }
// // //   throw new Error("Image upload not implemented. Provide uploadImage callback.");
// // // }

// // // function extFromMime(mime: string) { if (/png/i.test(mime)) return "png"; if (/webp/i.test(mime)) return "webp"; if (/gif/i.test(mime)) return "gif"; return "jpg"; }
// // // async function ensurePublicImageUrl(u: string, ctx: string, uploadImage?: (file: File) => Promise<string>): Promise<string> {
// // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // //   if (isHttpUrl(u)) { assertValidImageUrl(u, ctx); return u; }
// // //   if (!isBlobOrDataUrl(u) && looksLikeDirectImage(u)) { assertValidImageUrl(u, ctx); return u; }
// // //   if (isBlobOrDataUrl(u)) {
// // //     let blob: Blob; try { const r = await fetch(u); blob = await r.blob(); } catch (e: any) { throw new Error(`Cannot read local image (${ctx}). Please re-select image. ${e?.message || e}`); }
// // //     const mime = blob.type || "image/jpeg"; const ext = extFromMime(mime); const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime }); const publicUrl = await autoUploadImage(file, uploadImage); assertValidImageUrl(publicUrl, ctx); return publicUrl;
// // //   }
// // //   assertValidImageUrl(u, ctx);
// // //   return u;
// // // }

// // // /* ===== Build listings & payload (unchanged) ===== */
// // // async function resolveDefaultImageUrl(imageUrl?: string, imageFile?: File | null, uploadImage?: (file: File) => Promise<string>) {
// // //   if (imageUrl?.trim()) return await ensurePublicImageUrl(imageUrl.trim(), "defaultImageUrl", uploadImage);
// // //   if (imageFile) { const u = await autoUploadImage(imageFile, uploadImage); assertValidImageUrl(u, "uploadedDefaultImageUrl"); return u; }
// // //   return "";
// // // }
// // // async function buildListingsForSelected(selectedItems: GeneratedItem[], params: { category?: string; keywordsDefaults?: string[]; defaultImageUrl?: string; }, uploadImage?: (file: File) => Promise<string>): Promise<AutomationListing[]> {
// // //   const { category, keywordsDefaults = [], defaultImageUrl = "" } = params;
// // //   const listings: AutomationListing[] = [];
// // //   for (const it of selectedItems) {
// // //     const ownKeywords = getItemKeywords(it);
// // //     const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
// // //     const rawImgs = (it.images || []).filter(Boolean) as string[];
// // //     const publicImgs: string[] = [];
// // //     for (let i = 0; i < rawImgs.length; i++) { const img = rawImgs[i]; const pub = await ensurePublicImageUrl(img, `item(${it.id}).images[${i}]`, uploadImage); publicImgs.push(pub); }
// // //     const images = publicImgs.length > 0 ? publicImgs : defaultImageUrl ? [defaultImageUrl] : [];
// // //     listings.push({
// // //       id: it.id,
// // //       title: getItemTitle(it),
// // //       contentHtml: getItemHtml(it),
// // //       images,
// // //       keywords: mergedKeywords,
// // //       tags: mergedKeywords,
// // //       category: category || undefined
// // //     });
// // //   }
// // //   const bad = listings.filter(l => !l.title || !l.contentHtml);
// // //   if (bad.length) throw new Error(`Some items missing title/content: ${bad.map(b => b.id).join(", ")}`);
// // //   const missingImg = listings.filter(l => l.images.length === 0);
// // //   if (missingImg.length) throw new Error(`Some items missing image: ${missingImg.map(b => b.id).join(", ")}`);
// // //   return listings;
// // // }
// // // async function buildPayload(params: StartParams, selectedItems: GeneratedItem[], uploadImage?: (file: File) => Promise<string>): Promise<AutomationPayload> {
// // //   const { sites, defaults: { category, keywordsDefaults, imageUrl, imageFile, profile } } = params;
// // //   if (!Array.isArray(sites) || sites.length === 0) throw new Error("No sites selected.");
// // //   if (sites.some((s) => !s.site || !s.username || !s.password)) throw new Error("Every selected site must have site + username + password.");
// // //   if (selectedItems.length === 0) throw new Error("No items selected.");
// // //   if (sites.length !== selectedItems.length) throw new Error(`Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`);
// // //   const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile, uploadImage);
// // //   const listings = await buildListingsForSelected(selectedItems, { category, keywordsDefaults, defaultImageUrl }, uploadImage);
// // //   const targets: AutomationTargetSite[] = sites.map((s, idx) => ({ site: s.site, login: { username: s.username, password: s.password }, type: (s as any).type ?? "wordpress", listings: [listings[idx]] }));
// // //   const payload: AutomationPayload = { profile, targets };
// // //   return payload;
// // // }

// // // /* ===== Hook implementation (Updated - No Backend) ===== */
// // // import { useState, useMemo, useEffect, useRef } from 'react';
// // // import * as XLSX from 'xlsx';  // Assume installed: npm i xlsx

// // // export function useListingAutomation(allItems: GeneratedItem[], opts: UseListingAutomationOptions = {}) {
// // //   const {
// // //     uploadImage,
// // //     // statusPollIntervalMs = 1500,
// // //     // maxPollMinutes = 10,
// // //     maxSelectableItems = Infinity,
// // //     onMaxExceeded,
// // //     debug = false,
// // //     onRunUpdate,
// // //   } = opts;

// // //   /* Group by project */
// // //   const projects: Project[] = useMemo(() => {
// // //     const map = new Map<string, GeneratedItem[]>();
// // //     for (const it of allItems) {
// // //       const key = it.fileId ?? "__misc__";
// // //       if (!map.has(key)) map.set(key, []);
// // //       map.get(key)!.push(it);
// // //     }
// // //     return Array.from(map.entries()).map(([pid, arr]) => ({ id: pid, name: arr[0]?.fileName || pid || "Untitled Project", items: arr }));
// // //   }, [allItems]);

// // //   /* Search */
// // //   const [search, setSearch] = useState("");
// // //   const filteredProjects: Project[] = useMemo(() => {
// // //     const q = search.toLowerCase().trim();
// // //     if (!q) return projects;
// // //     return projects.map(p => ({ ...p, items: p.items.filter(it => `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase().includes(q)) })).filter(p => p.items.length > 0);
// // //   }, [projects, search]);

// // //   /* Selection / expansion (unchanged) */
// // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // //   const toggleProjectExpand = (pid: string) => { setExpandedProjectIds(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n; }); };
// // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
// // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);
// // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // //     const proj = projects.find(p => p.id === pid); if (!proj) return;
// // //     if (!checked) {
// // //       setSelectedProjectIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
// // //       setSelectedItemIds(prev => { const n = new Set(prev); for (const it of proj.items) n.delete(it.id); return n; });
// // //       return;
// // //     }
// // //     setSelectedItemIds(prev => {
// // //       const n = new Set(prev); let added = 0;
// // //       for (const it of proj.items) { if (n.size >= maxSelectableItems) break; if (!n.has(it.id)) { n.add(it.id); added++; } }
// // //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// // //       return n;
// // //     });
// // //     setSelectedProjectIds(prev => { const n = new Set(prev); const after = new Set(selectedItemIds); for (const it of proj.items) { if (after.size >= maxSelectableItems) break; after.add(it.id); } const allSelectedNow = proj.items.every(it => after.has(it.id)); if (allSelectedNow) n.add(pid); return n; });
// // //   };
// // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // //     const proj = projects.find(p => p.id === pid);
// // //     setSelectedItemIds(prev => { const n = new Set(prev); if (checked) { if (n.size >= maxSelectableItems && !n.has(iid)) { onMaxExceeded?.(maxSelectableItems); return prev; } n.add(iid); } else { n.delete(iid); } return n; });
// // //     if (proj) {
// // //       const after = new Set(selectedItemIds);
// // //       checked ? after.add(iid) : after.delete(iid);
// // //       const allSelected = proj.items.every(it => after.has(it.id));
// // //       const noneSelected = proj.items.every(it => !after.has(it.id));
// // //       setSelectedProjectIds(prev => { const n = new Set(prev); if (allSelected) n.add(pid); else if (noneSelected) n.delete(pid); return n; });
// // //     }
// // //   };
// // //   const clearSelection = () => { setSelectedProjectIds(new Set()); setSelectedItemIds(new Set()); };
// // //   const selectAllVisible = () => {
// // //     const all = new Set<string>(); for (const p of filteredProjects) { for (const it of p.items) { if (all.size >= maxSelectableItems) break; all.add(it.id); } if (all.size >= maxSelectableItems) break; }
// // //     setSelectedItemIds(all);
// // //     const projIds = new Set<string>(); for (const p of filteredProjects) { const allInProj = p.items.every(it => all.has(it.id)); if (allInProj) projIds.add(p.id); }
// // //     setSelectedProjectIds(projIds);
// // //     if (filteredProjects.flatMap(p => p.items).length > maxSelectableItems) onMaxExceeded?.(maxSelectableItems);
// // //   };

// // //   /* Focused preview */
// // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // //   const focusedItem = useMemo(() => allItems.find(x => x.id === focusedItemId), [allItems, focusedItemId]);
// // //   const selectedItems = useMemo(() => allItems.filter(it => selectedItemIds.has(it.id)), [allItems, selectedItemIds]);

// // //   /* ===== Job runs state (client-side) ===== */
// // //   const [isStarting, setIsStarting] = useState(false);
// // //   const [currentJobId, setCurrentJobId] = useState<string | null>(null);
// // //   const [progress, setProgress] = useState(0);
// // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
// // //   const [runs, setRuns] = useState<JobRun[]>([]);
// // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // //   // const pollStartTime = useRef<number>(0);
// // //   function cancelPolling() { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; } }
// // //   function upsertRun(run: JobRun) {
// // //     setRuns(prev => {
// // //       const idx = prev.findIndex(r => r.jobId === run.jobId);
// // //       if (idx === -1) return [run, ...prev];
// // //       const copy = [...prev]; copy[idx] = { ...copy[idx], ...run }; copy.sort((a,b) => (b.startedAt||0) - (a.startedAt||0)); return copy;
// // //     });
// // //     onRunUpdate?.(run);
// // //   }

// // //   /* ===== Start (Direct WP API Calls) ===== */
// // //   async function start(params: StartParams): Promise<{ jobId: string | null; listings: number; payload: AutomationPayload }> {
// // //     setIsStarting(true);
// // //     setStatus("idle");
// // //     setProgress(0);
// // //     setCurrentJobId(null);
// // //     cancelPolling();
// // //     try {
// // //       const selectedItemsLocal = selectedItems;  // Use memoized
// // //       const payload = await buildPayload(params, selectedItemsLocal, uploadImage);
// // //       const listingsCount = payload.targets.length;
// // //       if (debug) console.log("Starting direct WP automation with payload:", payload);
// // //       if (params.dryRun) return { jobId: null, listings: listingsCount, payload };

// // //       const jobId = Date.now().toString();
// // //       const now = Date.now();
// // //       const optimisticRun: JobRun = { jobId, status: "running", progress: 0, startedAt: now, backlinks: [], successCount: 0, failCount: 0, logs: [] };
// // //       upsertRun(optimisticRun);
// // //       setCurrentJobId(jobId);
// // //       setStatus("running");

// // //       const total = payload.targets.length;
// // //       let success = 0, fail = 0;
// // //       const newBacklinks: string[] = [];
// // //       const newLogs: string[] = [];

// // //       for (let i = 0; i < total; i++) {
// // //         const target = payload.targets[i];
// // //         try {
// // //           const postUrl = await createPostOnSite(target.site, target.login, target.listings[0], params.defaults.category);
// // //           newBacklinks.push(postUrl);
// // //           success++;
// // //           newLogs.push(`Success on ${target.site}: ${postUrl}`);
// // //         } catch (e: any) {
// // //           fail++;
// // //           newLogs.push(`Failed on ${target.site}: ${e.message}`);
// // //         }

// // //         const prog = Math.round(((i + 1) / total) * 100);
// // //         setProgress(prog);
// // //         upsertRun({ ...optimisticRun, progress: prog, logs: newLogs, successCount: success, failCount: fail, backlinks: newBacklinks });
// // //       }

// // //       const finalStatus: "done" | "error" = fail === 0 ? "done" : (fail < total ? "done" : "error");
// // //       const finalRun = { ...optimisticRun, status: finalStatus, finishedAt: now + total * 1000, progress: 100, logs: newLogs, successCount: success, failCount: fail, backlinks: newBacklinks };
// // //       upsertRun(finalRun);
// // //       setStatus(finalStatus);
// // //       setProgress(100);

// // //       return { jobId, listings: listingsCount, payload };
// // //     } finally {
// // //       setIsStarting(false);
// // //     }
// // //   }

// // //   useEffect(() => cancelPolling, []);

// // //   /* Helper: fetch a saved run by id (noop now) */
// // //   async function fetchRunDetails(jobId: string) { /* Client-side only */ return null; }

// // //   /* Helper: download export (client-side XLSX) */
// // //   async function downloadRunExcel(jobId: string | null, filename = "automation_run.xlsx") {
// // //     if (!jobId) throw new Error("Missing jobId");
// // //     const run = runs.find(r => r.jobId === jobId);
// // //     if (!run?.backlinks?.length) throw new Error("No backlinks to export");

// // //     const wsData = [['SiteName', 'Post URL']];
// // //     run.backlinks.forEach(link => {
// // //       const hostname = new URL(link).hostname.replace('www.', '');
// // //       wsData.push([hostname, link]);
// // //     });

// // //     const wb = XLSX.utils.book_new();
// // //     const ws = XLSX.utils.aoa_to_sheet(wsData);
// // //     XLSX.utils.book_append_sheet(wb, ws, 'Backlinks');
// // //     XLSX.writeFile(wb, filename);
// // //     return true;
// // //   }

// // //   /* Exposed API */
// // //   return {
// // //     search,
// // //     setSearch,
// // //     projects,
// // //     filteredProjects,
// // //     expandedProjectIds,
// // //     toggleProjectExpand,
// // //     selectedProjectIds,
// // //     selectedItemIds,
// // //     isProjectSelected,
// // //     isItemSelected,
// // //     setProjectChecked,
// // //     setItemChecked,
// // //     selectAllVisible,
// // //     clearSelection,
// // //     focusedItemId,
// // //     setFocusedItemId,
// // //     focusedItem,
// // //     selectedItems,
// // //     start,
// // //     cancelPolling,
// // //     isStarting,
// // //     jobId: currentJobId,
// // //     progress,
// // //     status,
// // //     runs,
// // //     fetchRunDetails,
// // //     downloadRunExcel,
// // //   };
// // // }





// // // /* ===== Types (match your page) ===== */
// // // export type GeneratedItem = {
// // //   id: string;
// // //   keyword?: string | string[];
// // //   title?: string;
// // //   html?: string;
// // //   generatedContent?: string;
// // //   images?: string[];
// // //   fileId?: string;
// // //   fileName?: string;
// // //   createdAt?: number | string;
// // // };
// // // export type Address = { country: string; state: string; city: string; zip: string; line1: string };
// // // export type Socials = { facebook?: string; twitter?: string; linkedin?: string; pinterest?: string; instagram?: string; yelp?: string; gmb?: string };
// // // export type AutomationListing = { id: string; title: string; contentHtml: string; images: string[]; keywords: string[]; tags?: string[]; category?: string };
// // // export type AutomationTargetSite = { site: string; login: { username: string; password: string }; type?: string; listings: AutomationListing[] };
// // // export type AutomationPayload = { profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address }; targets: AutomationTargetSite[] };
// // // export type UseListingAutomationOptions = {
// // //   uploadImage?: (file: File) => Promise<string>;
// // //   statusPollIntervalMs?: number;
// // //   maxPollMinutes?: number;
// // //   maxSelectableItems?: number;
// // //   onMaxExceeded?: (max: number) => void;
// // //   debug?: boolean;
// // //   /** Optional callback to receive live run updates */
// // //   onRunUpdate?: (run: JobRun) => void;
// // // };
// // // export type StartParams = {
// // //   sites: { site: string; username: string; password: string; type?: string }[];
// // //   defaults: { category?: string; keywordsDefaults?: string[]; imageUrl?: string; imageFile?: File | null; profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address } };
// // //   dryRun?: boolean;
// // // };
// // // export type Project = { id: string; name: string; items: GeneratedItem[] };
// // // /* Job run shape (client-side managed) */
// // // export type JobRun = {
// // //   jobId: string | null;
// // //   status: "queued" | "running" | "done" | "error" | "idle";
// // //   progress: number;
// // //   startedAt?: number;
// // //   finishedAt?: number | null;
// // //   backlinks?: string[]; // accumulated as they arrive
// // //   successCount?: number;
// // //   failCount?: number;
// // //   logs?: string[];
// // //   error?: string | null;
// // // };

// // // /* Small local helpers (reused) */
// // // function getItemTitle(it: GeneratedItem) { return it.title ?? ""; }
// // // function getItemHtml(it: GeneratedItem) { return (it.html ?? it.generatedContent ?? "").toString(); }
// // // function getItemKeywords(it: GeneratedItem): string[] { if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean); if (typeof it.keyword === "string") return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean); return []; }

// // // /* ===== Image helpers (copied / compatible) ===== */
// // // function isBlobOrDataUrl(u: string) { return /^blob:|^data:/i.test(u); }
// // // function isHttpUrl(u: string) { return /^https?:\/\//i.test(u); }
// // // function looksLikeDirectImage(u: string) { return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u); }
// // // function assertValidImageUrl(u: string, ctx: string) {
// // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // //   if (isBlobOrDataUrl(u)) throw new Error(`Invalid image URL (${ctx}): ${u} — blob/data URLs are not supported. Upload first.`);
// // //   if (isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Image URL is not a direct file (${ctx}): ${u}`);
// // //   if (!isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Invalid image URL (${ctx}): ${u}`);
// // // }

// // // /* ===== WP API Helpers (New - Direct Calls) ===== */
// // // async function getOrCreateTerm(termsUrl: string, taxonomy: 'category' | 'post_tag', name: string, authHeader: string): Promise<number> {
// // //   const searchUrl = `${termsUrl}?search=${encodeURIComponent(name)}&per_page=1`;
// // //   let res = await fetch(searchUrl, { headers: { Authorization: authHeader } });
// // //   if (!res.ok) throw new Error(`Failed to search terms: ${res.status}`);
// // //   let terms = await res.json();
// // //   if (terms.length > 0) return terms[0].id;

// // //   // Create
// // //   res = await fetch(termsUrl, {
// // //     method: 'POST',
// // //     headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
// // //     body: JSON.stringify({ name, taxonomy }),
// // //   });
// // //   if (!res.ok) throw new Error(`Failed to create term: ${res.status}`);
// // //   const term = await res.json();
// // //   return term.id;
// // // }

// // // async function uploadMedia(mediaUrl: string, imageUrl: string, authHeader: string): Promise<number> {
// // //   let blob: Blob;
// // //   if (isHttpUrl(imageUrl)) {
// // //     const imgRes = await fetch(imageUrl);
// // //     if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
// // //     blob = await imgRes.blob();
// // //   } else {
// // //     throw new Error(`Unsupported image URL: ${imageUrl}`);
// // //   }

// // //   const fd = new FormData();
// // //   fd.append('file', blob, `featured-${Date.now()}.jpg`);

// // //   const res = await fetch(mediaUrl, {
// // //     method: 'POST',
// // //     headers: { Authorization: authHeader },
// // //     body: fd,
// // //   });
// // //   if (!res.ok) throw new Error(`Media upload failed: ${res.status}`);
// // //   const media = await res.json();
// // //   return media.id;
// // // }

// // // async function createPostOnSite(site: string, login: { username: string; password: string }, listing: AutomationListing, category?: string): Promise<string> {
// // //   const apiUrl = `https://${site}/wp-json/wp/v2/posts`;
// // //   const mediaUrl = apiUrl.replace('/posts', '/media');
// // //   const catsUrl = apiUrl.replace('/posts', '/categories');
// // //   const tagsUrl = apiUrl.replace('/posts', '/tags');
// // //   const auth = btoa(`${login.username}:${login.password}`);
// // //   const authHeader = `Basic ${auth}`;
// // //   const headers = { Authorization: authHeader, 'Content-Type': 'application/json' };

// // //   // Resolve category ID
// // //   let categories: number[] = [];
// // //   if (category) {
// // //     const catId = await getOrCreateTerm(catsUrl, 'category', category, authHeader);
// // //     categories = [catId];
// // //   }

// // //   // Resolve tag IDs
// // //   const tagIds = await Promise.all(
// // //     listing.keywords.map(kw => getOrCreateTerm(tagsUrl, 'post_tag', kw, authHeader))
// // //   );

// // //   // Create post without featured media
// // //   const postData = {
// // //     title: listing.title,
// // //     content: listing.contentHtml,
// // //     status: 'publish',
// // //     categories,
// // //     tags: tagIds,
// // //   };
// // //   let res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(postData) });
// // //   if (!res.ok) throw new Error(`Post creation failed: ${res.status}`);
// // //   let post = await res.json();

// // //   // Upload and set featured image if available
// // //   if (listing.images.length > 0) {
// // //     const imgUrl = listing.images[0];
// // //     assertValidImageUrl(imgUrl, `featured for ${site}`);
// // //     const mediaId = await uploadMedia(mediaUrl, imgUrl, authHeader);
// // //     res = await fetch(`${apiUrl}/${post.id}`, {
// // //       method: 'POST',
// // //       headers,
// // //       body: JSON.stringify({ featured_media: mediaId }),
// // //     });
// // //     if (!res.ok) throw new Error(`Featured image update failed: ${res.status}`);
// // //     post = await res.json();
// // //   }

// // //   return post.link;
// // // }

// // // /* ===== Image upload helpers (for defaults) ===== */
// // // async function autoUploadImage(file: File, uploadImage?: (file: File) => Promise<string>): Promise<string> {
// // //   if (uploadImage) {
// // //     const u = await uploadImage(file);
// // //     if (u && !isBlobOrDataUrl(u)) { assertValidImageUrl(u, "uploadImage()"); return u; }
// // //   }
// // //   throw new Error("Image upload not implemented. Provide uploadImage callback.");
// // // }

// // // function extFromMime(mime: string) { if (/png/i.test(mime)) return "png"; if (/webp/i.test(mime)) return "webp"; if (/gif/i.test(mime)) return "gif"; return "jpg"; }
// // // async function ensurePublicImageUrl(u: string, ctx: string, uploadImage?: (file: File) => Promise<string>): Promise<string> {
// // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // //   if (isHttpUrl(u)) { assertValidImageUrl(u, ctx); return u; }
// // //   if (!isBlobOrDataUrl(u) && looksLikeDirectImage(u)) { assertValidImageUrl(u, ctx); return u; }
// // //   if (isBlobOrDataUrl(u)) {
// // //     let blob: Blob; try { const r = await fetch(u); blob = await r.blob(); } catch (e: any) { throw new Error(`Cannot read local image (${ctx}). Please re-select image. ${e?.message || e}`); }
// // //     const mime = blob.type || "image/jpeg"; const ext = extFromMime(mime); const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime }); const publicUrl = await autoUploadImage(file, uploadImage); assertValidImageUrl(publicUrl, ctx); return publicUrl;
// // //   }
// // //   assertValidImageUrl(u, ctx);
// // //   return u;
// // // }

// // // /* ===== Build listings & payload (unchanged) ===== */
// // // async function resolveDefaultImageUrl(imageUrl?: string, imageFile?: File | null, uploadImage?: (file: File) => Promise<string>) {
// // //   if (imageUrl?.trim()) return await ensurePublicImageUrl(imageUrl.trim(), "defaultImageUrl", uploadImage);
// // //   if (imageFile) { const u = await autoUploadImage(imageFile, uploadImage); assertValidImageUrl(u, "uploadedDefaultImageUrl"); return u; }
// // //   return "";
// // // }
// // // async function buildListingsForSelected(selectedItems: GeneratedItem[], params: { category?: string; keywordsDefaults?: string[]; defaultImageUrl?: string; }, uploadImage?: (file: File) => Promise<string>): Promise<AutomationListing[]> {
// // //   const { category, keywordsDefaults = [], defaultImageUrl = "" } = params;
// // //   const listings: AutomationListing[] = [];
// // //   for (const it of selectedItems) {
// // //     const ownKeywords = getItemKeywords(it);
// // //     const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
// // //     const rawImgs = (it.images || []).filter(Boolean) as string[];
// // //     const publicImgs: string[] = [];
// // //     for (let i = 0; i < rawImgs.length; i++) { const img = rawImgs[i]; const pub = await ensurePublicImageUrl(img, `item(${it.id}).images[${i}]`, uploadImage); publicImgs.push(pub); }
// // //     const images = publicImgs.length > 0 ? publicImgs : defaultImageUrl ? [defaultImageUrl] : [];
// // //     listings.push({
// // //       id: it.id,
// // //       title: getItemTitle(it),
// // //       contentHtml: getItemHtml(it),
// // //       images,
// // //       keywords: mergedKeywords,
// // //       tags: mergedKeywords,
// // //       category: category || undefined
// // //     });
// // //   }
// // //   const bad = listings.filter(l => !l.title || !l.contentHtml);
// // //   if (bad.length) throw new Error(`Some items missing title/content: ${bad.map(b => b.id).join(", ")}`);
// // //   const missingImg = listings.filter(l => l.images.length === 0);
// // //   if (missingImg.length) throw new Error(`Some items missing image: ${missingImg.map(b => b.id).join(", ")}`);
// // //   return listings;
// // // }
// // // async function buildPayload(params: StartParams, selectedItems: GeneratedItem[], uploadImage?: (file: File) => Promise<string>): Promise<AutomationPayload> {
// // //   const { sites, defaults: { category, keywordsDefaults, imageUrl, imageFile, profile } } = params;
// // //   if (!Array.isArray(sites) || sites.length === 0) throw new Error("No sites selected.");
// // //   if (sites.some((s) => !s.site || !s.username || !s.password)) throw new Error("Every selected site must have site + username + password.");
// // //   if (selectedItems.length === 0) throw new Error("No items selected.");
// // //   if (sites.length !== selectedItems.length) throw new Error(`Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`);
// // //   const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile, uploadImage);
// // //   const listings = await buildListingsForSelected(selectedItems, { category, keywordsDefaults, defaultImageUrl }, uploadImage);
// // //   const targets: AutomationTargetSite[] = sites.map((s, idx) => ({ site: s.site, login: { username: s.username, password: s.password }, type: (s as any).type ?? "wordpress", listings: [listings[idx]] }));
// // //   const payload: AutomationPayload = { profile, targets };
// // //   return payload;
// // // }

// // // /* ===== Hook implementation (Updated - No Backend) ===== */
// // // import { useState, useMemo, useEffect, useRef } from 'react';
// // // import * as XLSX from 'xlsx';  // Assume installed: npm i xlsx

// // // export function useListingAutomation(allItems: GeneratedItem[], opts: UseListingAutomationOptions = {}) {
// // //   const {
// // //     uploadImage,
// // //     // statusPollIntervalMs = 1500,
// // //     // maxPollMinutes = 10,
// // //     maxSelectableItems = Infinity,
// // //     onMaxExceeded,
// // //     debug = false,
// // //     onRunUpdate,
// // //   } = opts;

// // //   /* Group by project */
// // //   const projects: Project[] = useMemo(() => {
// // //     const map = new Map<string, GeneratedItem[]>();
// // //     for (const it of allItems) {
// // //       const key = it.fileId ?? "__misc__";
// // //       if (!map.has(key)) map.set(key, []);
// // //       map.get(key)!.push(it);
// // //     }
// // //     return Array.from(map.entries()).map(([pid, arr]) => ({ id: pid, name: arr[0]?.fileName || pid || "Untitled Project", items: arr }));
// // //   }, [allItems]);

// // //   /* Search */
// // //   const [search, setSearch] = useState("");
// // //   const filteredProjects: Project[] = useMemo(() => {
// // //     const q = search.toLowerCase().trim();
// // //     if (!q) return projects;
// // //     return projects.map(p => ({ ...p, items: p.items.filter(it => `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase().includes(q)) })).filter(p => p.items.length > 0);
// // //   }, [projects, search]);

// // //   /* Selection / expansion (unchanged) */
// // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // //   const toggleProjectExpand = (pid: string) => { setExpandedProjectIds(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n; }); };
// // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
// // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);
// // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // //     const proj = projects.find(p => p.id === pid); if (!proj) return;
// // //     if (!checked) {
// // //       setSelectedProjectIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
// // //       setSelectedItemIds(prev => { const n = new Set(prev); for (const it of proj.items) n.delete(it.id); return n; });
// // //       return;
// // //     }
// // //     setSelectedItemIds(prev => {
// // //       const n = new Set(prev); let added = 0;
// // //       for (const it of proj.items) { if (n.size >= maxSelectableItems) break; if (!n.has(it.id)) { n.add(it.id); added++; } }
// // //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// // //       return n;
// // //     });
// // //     setSelectedProjectIds(prev => { const n = new Set(prev); const after = new Set(selectedItemIds); for (const it of proj.items) { if (after.size >= maxSelectableItems) break; after.add(it.id); } const allSelectedNow = proj.items.every(it => after.has(it.id)); if (allSelectedNow) n.add(pid); return n; });
// // //   };
// // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // //     const proj = projects.find(p => p.id === pid);
// // //     setSelectedItemIds(prev => { const n = new Set(prev); if (checked) { if (n.size >= maxSelectableItems && !n.has(iid)) { onMaxExceeded?.(maxSelectableItems); return prev; } n.add(iid); } else { n.delete(iid); } return n; });
// // //     if (proj) {
// // //       const after = new Set(selectedItemIds);
// // //       checked ? after.add(iid) : after.delete(iid);
// // //       const allSelected = proj.items.every(it => after.has(it.id));
// // //       const noneSelected = proj.items.every(it => !after.has(it.id));
// // //       setSelectedProjectIds(prev => { const n = new Set(prev); if (allSelected) n.add(pid); else if (noneSelected) n.delete(pid); return n; });
// // //     }
// // //   };
// // //   const clearSelection = () => { setSelectedProjectIds(new Set()); setSelectedItemIds(new Set()); };
// // //   const selectAllVisible = () => {
// // //     const all = new Set<string>(); for (const p of filteredProjects) { for (const it of p.items) { if (all.size >= maxSelectableItems) break; all.add(it.id); } if (all.size >= maxSelectableItems) break; }
// // //     setSelectedItemIds(all);
// // //     const projIds = new Set<string>(); for (const p of filteredProjects) { const allInProj = p.items.every(it => all.has(it.id)); if (allInProj) projIds.add(p.id); }
// // //     setSelectedProjectIds(projIds);
// // //     if (filteredProjects.flatMap(p => p.items).length > maxSelectableItems) onMaxExceeded?.(maxSelectableItems);
// // //   };

// // //   /* Focused preview */
// // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // //   const focusedItem = useMemo(() => allItems.find(x => x.id === focusedItemId), [allItems, focusedItemId]);
// // //   const selectedItems = useMemo(() => allItems.filter(it => selectedItemIds.has(it.id)), [allItems, selectedItemIds]);

// // //   /* ===== Job runs state (client-side) ===== */
// // //   const [isStarting, setIsStarting] = useState(false);
// // //   const [currentJobId, setCurrentJobId] = useState<string | null>(null);
// // //   const [progress, setProgress] = useState(0);
// // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
// // //   const [runs, setRuns] = useState<JobRun[]>([]);
// // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // //   // const pollStartTime = useRef<number>(0);
// // //   function cancelPolling() { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; } }
// // //   function upsertRun(run: JobRun) {
// // //     setRuns(prev => {
// // //       const idx = prev.findIndex(r => r.jobId === run.jobId);
// // //       if (idx === -1) return [run, ...prev];
// // //       const copy = [...prev]; copy[idx] = { ...copy[idx], ...run }; copy.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0)); return copy;
// // //     });
// // //     onRunUpdate?.(run);
// // //   }

// // //   /* ===== Start (Optimized & Resilient) ===== */
// // //   async function start(params: StartParams): Promise<{ jobId: string | null; listings: number; payload: AutomationPayload }> {
// // //     setIsStarting(true);
// // //     setStatus("idle");
// // //     setProgress(0);
// // //     setCurrentJobId(null);
// // //     cancelPolling();
// // //     try {
// // //       const selectedItemsLocal = selectedItems;  // Use memoized
// // //       const payload = await buildPayload(params, selectedItemsLocal, uploadImage);
// // //       const listingsCount = payload.targets.length;
// // //       if (debug) console.log("Starting direct WP automation with payload:", payload);
// // //       if (params.dryRun) return { jobId: null, listings: listingsCount, payload };

// // //       const jobId = Date.now().toString();
// // //       const now = Date.now();
// // //       const optimisticRun: JobRun = { jobId, status: "running", progress: 0, startedAt: now, backlinks: [], successCount: 0, failCount: 0, logs: [] };
// // //       upsertRun(optimisticRun);
// // //       setCurrentJobId(jobId);
// // //       setStatus("running");

// // //       const total = payload.targets.length;
// // //       let success = 0, fail = 0, completed = 0;
// // //       const newBacklinks: string[] = [];
// // //       const newLogs: string[] = [];

// // //       // HELPER: Concurrency Limit Executor
// // //       const CONCURRENCY_LIMIT = 5; // Adjust this number for more speed (e.g. 5 or 10)
// // //       const executing: Promise<void>[] = [];

// // //       // Define the work for each item
// // //       const tasks = payload.targets.map((target) => async () => {
// // //         try {
// // //           const postUrl = await createPostOnSite(target.site, target.login, target.listings[0], params.defaults.category);
// // //           newBacklinks.push(postUrl);
// // //           success++;
// // //           newLogs.push(`Success on ${target.site}: ${postUrl}`);
// // //         } catch (e: any) {
// // //           fail++;
// // //           // ERROR HANDLING: Log the error but DO NOT throw, so loop continues
// // //           newLogs.push(`Failed on ${target.site}: ${e.message}`);
// // //         } finally {
// // //           completed++;
// // //           const prog = Math.round((completed / total) * 100);
// // //           setProgress(prog);
// // //           // Real-time update
// // //           upsertRun({
// // //             ...optimisticRun,
// // //             progress: prog,
// // //             logs: [...newLogs], // copy to avoid ref issues
// // //             successCount: success,
// // //             failCount: fail,
// // //             backlinks: [...newBacklinks]
// // //           });
// // //         }
// // //       });

// // //       // Execute with concurrency limit
// // //       for (const task of tasks) {
// // //         const p = task().then(() => { }); // wrap to void
// // //         executing.push(p);
// // //         const clean = () => executing.splice(executing.indexOf(p), 1);
// // //         p.then(clean).catch(clean);

// // //         if (executing.length >= CONCURRENCY_LIMIT) {
// // //           await Promise.race(executing);
// // //         }
// // //       }
// // //       await Promise.all(executing); // Wait for remaining

// // //       const finalStatus: "done" | "error" = fail === 0 ? "done" : (fail < total ? "done" : "error");
// // //       const finalRun = {
// // //         ...optimisticRun,
// // //         status: finalStatus,
// // //         finishedAt: Date.now(),
// // //         progress: 100,
// // //         logs: newLogs,
// // //         successCount: success,
// // //         failCount: fail,
// // //         backlinks: newBacklinks
// // //       };
// // //       upsertRun(finalRun);
// // //       setStatus(finalStatus);
// // //       setProgress(100);

// // //       return { jobId, listings: listingsCount, payload };
// // //     } finally {
// // //       setIsStarting(false);
// // //     }
// // //   }

// // //   useEffect(() => cancelPolling, []);

// // //   /* Helper: fetch a saved run by id (noop now) */
// // //   async function fetchRunDetails(jobId: string) { /* Client-side only */ return null; }

// // //   /* Helper: download export (client-side XLSX) */
// // //   async function downloadRunExcel(jobId: string | null, filename = "automation_run.xlsx") {
// // //     if (!jobId) throw new Error("Missing jobId");
// // //     const run = runs.find(r => r.jobId === jobId);
// // //     if (!run?.backlinks?.length) throw new Error("No backlinks to export");

// // //     const wsData = [['SiteName', 'Post URL']];
// // //     run.backlinks.forEach(link => {
// // //       const hostname = new URL(link).hostname.replace('www.', '');
// // //       wsData.push([hostname, link]);
// // //     });

// // //     const wb = XLSX.utils.book_new();
// // //     const ws = XLSX.utils.aoa_to_sheet(wsData);
// // //     XLSX.utils.book_append_sheet(wb, ws, 'Backlinks');
// // //     XLSX.writeFile(wb, filename);
// // //     return true;
// // //   }

// // //   /* Exposed API */
// // //   return {
// // //     search,
// // //     setSearch,
// // //     projects,
// // //     filteredProjects,
// // //     expandedProjectIds,
// // //     toggleProjectExpand,
// // //     selectedProjectIds,
// // //     selectedItemIds,
// // //     isProjectSelected,
// // //     isItemSelected,
// // //     setProjectChecked,
// // //     setItemChecked,
// // //     selectAllVisible,
// // //     clearSelection,
// // //     focusedItemId,
// // //     setFocusedItemId,
// // //     focusedItem,
// // //     selectedItems,
// // //     start,
// // //     cancelPolling,
// // //     isStarting,
// // //     jobId: currentJobId,
// // //     progress,
// // //     status,
// // //     runs,
// // //     fetchRunDetails,
// // //     downloadRunExcel,
// // //   };
// // // }



// // // /* ===== Types (match your page) ===== */
// // // export type GeneratedItem = {
// // //   id: string;
// // //   keyword?: string | string[];
// // //   title?: string;
// // //   html?: string;
// // //   generatedContent?: string;
// // //   images?: string[];
// // //   fileId?: string;
// // //   fileName?: string;
// // //   createdAt?: number | string;
// // // };
// // // export type Address = { country: string; state: string; city: string; zip: string; line1: string };
// // // export type Socials = { facebook?: string; twitter?: string; linkedin?: string; pinterest?: string; instagram?: string; yelp?: string; gmb?: string };
// // // export type AutomationListing = { id: string; title: string; contentHtml: string; images: string[]; keywords: string[]; tags?: string[]; category?: string };
// // // export type AutomationTargetSite = { site: string; login: { username: string; password: string }; type?: string; listings: AutomationListing[] };
// // // export type AutomationPayload = { profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address }; targets: AutomationTargetSite[] };
// // // export type UseListingAutomationOptions = {
// // //   uploadImage?: (file: File) => Promise<string>;
// // //   statusPollIntervalMs?: number;
// // //   maxPollMinutes?: number;
// // //   maxSelectableItems?: number;
// // //   onMaxExceeded?: (max: number) => void;
// // //   debug?: boolean;
// // //   /** Optional callback to receive live run updates */
// // //   onRunUpdate?: (run: JobRun) => void;
// // // };
// // // export type StartParams = {
// // //   sites: { site: string; username: string; password: string; type?: string }[];
// // //   defaults: { category?: string; keywordsDefaults?: string[]; imageUrl?: string; imageFile?: File | null; profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address } };
// // //   dryRun?: boolean;
// // // };
// // // export type Project = { id: string; name: string; items: GeneratedItem[] };
// // // /* Job run shape (client-side managed) */
// // // export type JobRun = {
// // //   jobId: string | null;
// // //   status: "queued" | "running" | "done" | "error" | "idle";
// // //   progress: number;
// // //   startedAt?: number;
// // //   finishedAt?: number | null;
// // //   backlinks?: string[]; // accumulated as they arrive
// // //   successCount?: number;
// // //   failCount?: number;
// // //   logs?: string[];
// // //   error?: string | null;
// // // };

// // // /* Small local helpers (reused) */
// // // function getItemTitle(it: GeneratedItem) { return it.title ?? ""; }
// // // function getItemHtml(it: GeneratedItem) { return (it.html ?? it.generatedContent ?? "").toString(); }
// // // function getItemKeywords(it: GeneratedItem): string[] { if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean); if (typeof it.keyword === "string") return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean); return []; }

// // // /* ===== Image helpers (copied / compatible) ===== */
// // // function isBlobOrDataUrl(u: string) { return /^blob:|^data:/i.test(u); }
// // // function isHttpUrl(u: string) { return /^https?:\/\//i.test(u); }
// // // function looksLikeDirectImage(u: string) { return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u); }
// // // function assertValidImageUrl(u: string, ctx: string) {
// // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // //   if (isBlobOrDataUrl(u)) throw new Error(`Invalid image URL (${ctx}): ${u} — blob/data URLs are not supported. Upload first.`);
// // //   if (isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Image URL is not a direct file (${ctx}): ${u}`);
// // //   if (!isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Invalid image URL (${ctx}): ${u}`);
// // // }

// // // /* ===== WP API Helpers (New - Direct Calls) ===== */
// // // async function getOrCreateTerm(termsUrl: string, taxonomy: 'category' | 'post_tag', name: string, authHeader: string): Promise<number> {
// // //   const searchUrl = `${termsUrl}?search=${encodeURIComponent(name)}&per_page=1`;
// // //   let res = await fetch(searchUrl, { headers: { Authorization: authHeader } });
// // //   if (!res.ok) throw new Error(`Failed to search terms: ${res.status}`);
// // //   let terms = await res.json();
// // //   if (terms.length > 0) return terms[0].id;

// // //   // Create
// // //   res = await fetch(termsUrl, {
// // //     method: 'POST',
// // //     headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
// // //     body: JSON.stringify({ name, taxonomy }),
// // //   });
// // //   if (!res.ok) throw new Error(`Failed to create term: ${res.status}`);
// // //   const term = await res.json();
// // //   return term.id;
// // // }

// // // async function uploadMedia(mediaUrl: string, imageUrl: string, authHeader: string): Promise<number> {
// // //   let blob: Blob;
// // //   if (isHttpUrl(imageUrl)) {
// // //     const imgRes = await fetch(imageUrl);
// // //     if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
// // //     blob = await imgRes.blob();
// // //   } else {
// // //     throw new Error(`Unsupported image URL: ${imageUrl}`);
// // //   }

// // //   const fd = new FormData();
// // //   fd.append('file', blob, `featured-${Date.now()}.jpg`);

// // //   const res = await fetch(mediaUrl, {
// // //     method: 'POST',
// // //     headers: { Authorization: authHeader },
// // //     body: fd,
// // //   });
// // //   if (!res.ok) throw new Error(`Media upload failed: ${res.status}`);
// // //   const media = await res.json();
// // //   return media.id;
// // // }

// // // async function createPostOnSite(site: string, login: { username: string; password: string }, listing: AutomationListing, category?: string): Promise<string> {
// // //   const apiUrl = `https://${site}/wp-json/wp/v2/posts`;
// // //   const mediaUrl = apiUrl.replace('/posts', '/media');
// // //   const catsUrl = apiUrl.replace('/posts', '/categories');
// // //   const tagsUrl = apiUrl.replace('/posts', '/tags');
// // //   const auth = btoa(`${login.username}:${login.password}`);
// // //   const authHeader = `Basic ${auth}`;
// // //   const headers = { Authorization: authHeader, 'Content-Type': 'application/json' };

// // //   // Resolve category ID
// // //   let categories: number[] = [];
// // //   if (category) {
// // //     const catId = await getOrCreateTerm(catsUrl, 'category', category, authHeader);
// // //     categories = [catId];
// // //   }

// // //   // Resolve tag IDs
// // //   const tagIds = await Promise.all(
// // //     listing.keywords.map(kw => getOrCreateTerm(tagsUrl, 'post_tag', kw, authHeader))
// // //   );

// // //   // === FIX FOR JUSTIFY CONTENT ===
// // //   // Wrap existing content in a div with text-align: justify
// // //   const justifiedContent = `<div style="text-align: justify;">${listing.contentHtml}</div>`;

// // //   // Create post without featured media
// // //   const postData = {
// // //     title: listing.title,
// // //     content: justifiedContent, // Sending justified content
// // //     status: 'publish',
// // //     categories,
// // //     tags: tagIds,
// // //   };
  
// // //   let res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(postData) });
// // //   if (!res.ok) throw new Error(`Post creation failed: ${res.status}`);
// // //   let post = await res.json();

// // //   // Upload and set featured image if available
// // //   if (listing.images.length > 0) {
// // //     const imgUrl = listing.images[0];
// // //     assertValidImageUrl(imgUrl, `featured for ${site}`);
// // //     const mediaId = await uploadMedia(mediaUrl, imgUrl, authHeader);
// // //     res = await fetch(`${apiUrl}/${post.id}`, {
// // //       method: 'POST',
// // //       headers,
// // //       body: JSON.stringify({ featured_media: mediaId }),
// // //     });
// // //     if (!res.ok) throw new Error(`Featured image update failed: ${res.status}`);
// // //     post = await res.json();
// // //   }

// // //   return post.link;
// // // }

// // // /* ===== Image upload helpers (for defaults) ===== */
// // // async function autoUploadImage(file: File, uploadImage?: (file: File) => Promise<string>): Promise<string> {
// // //   if (uploadImage) {
// // //     const u = await uploadImage(file);
// // //     if (u && !isBlobOrDataUrl(u)) { assertValidImageUrl(u, "uploadImage()"); return u; }
// // //   }
// // //   throw new Error("Image upload not implemented. Provide uploadImage callback.");
// // // }

// // // function extFromMime(mime: string) { if (/png/i.test(mime)) return "png"; if (/webp/i.test(mime)) return "webp"; if (/gif/i.test(mime)) return "gif"; return "jpg"; }
// // // async function ensurePublicImageUrl(u: string, ctx: string, uploadImage?: (file: File) => Promise<string>): Promise<string> {
// // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // //   if (isHttpUrl(u)) { assertValidImageUrl(u, ctx); return u; }
// // //   if (!isBlobOrDataUrl(u) && looksLikeDirectImage(u)) { assertValidImageUrl(u, ctx); return u; }
// // //   if (isBlobOrDataUrl(u)) {
// // //     let blob: Blob; try { const r = await fetch(u); blob = await r.blob(); } catch (e: any) { throw new Error(`Cannot read local image (${ctx}). Please re-select image. ${e?.message || e}`); }
// // //     const mime = blob.type || "image/jpeg"; const ext = extFromMime(mime); const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime }); const publicUrl = await autoUploadImage(file, uploadImage); assertValidImageUrl(publicUrl, ctx); return publicUrl;
// // //   }
// // //   assertValidImageUrl(u, ctx);
// // //   return u;
// // // }

// // // /* ===== Build listings & payload (unchanged) ===== */
// // // async function resolveDefaultImageUrl(imageUrl?: string, imageFile?: File | null, uploadImage?: (file: File) => Promise<string>) {
// // //   if (imageUrl?.trim()) return await ensurePublicImageUrl(imageUrl.trim(), "defaultImageUrl", uploadImage);
// // //   if (imageFile) { const u = await autoUploadImage(imageFile, uploadImage); assertValidImageUrl(u, "uploadedDefaultImageUrl"); return u; }
// // //   return "";
// // // }
// // // async function buildListingsForSelected(selectedItems: GeneratedItem[], params: { category?: string; keywordsDefaults?: string[]; defaultImageUrl?: string; }, uploadImage?: (file: File) => Promise<string>): Promise<AutomationListing[]> {
// // //   const { category, keywordsDefaults = [], defaultImageUrl = "" } = params;
// // //   const listings: AutomationListing[] = [];
// // //   for (const it of selectedItems) {
// // //     const ownKeywords = getItemKeywords(it);
// // //     const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
// // //     const rawImgs = (it.images || []).filter(Boolean) as string[];
// // //     const publicImgs: string[] = [];
// // //     for (let i = 0; i < rawImgs.length; i++) { const img = rawImgs[i]; const pub = await ensurePublicImageUrl(img, `item(${it.id}).images[${i}]`, uploadImage); publicImgs.push(pub); }
// // //     const images = publicImgs.length > 0 ? publicImgs : defaultImageUrl ? [defaultImageUrl] : [];
// // //     listings.push({
// // //       id: it.id,
// // //       title: getItemTitle(it),
// // //       contentHtml: getItemHtml(it),
// // //       images,
// // //       keywords: mergedKeywords,
// // //       tags: mergedKeywords,
// // //       category: category || undefined
// // //     });
// // //   }
// // //   const bad = listings.filter(l => !l.title || !l.contentHtml);
// // //   if (bad.length) throw new Error(`Some items missing title/content: ${bad.map(b => b.id).join(", ")}`);
// // //   const missingImg = listings.filter(l => l.images.length === 0);
// // //   if (missingImg.length) throw new Error(`Some items missing image: ${missingImg.map(b => b.id).join(", ")}`);
// // //   return listings;
// // // }
// // // async function buildPayload(params: StartParams, selectedItems: GeneratedItem[], uploadImage?: (file: File) => Promise<string>): Promise<AutomationPayload> {
// // //   const { sites, defaults: { category, keywordsDefaults, imageUrl, imageFile, profile } } = params;
// // //   if (!Array.isArray(sites) || sites.length === 0) throw new Error("No sites selected.");
// // //   if (sites.some((s) => !s.site || !s.username || !s.password)) throw new Error("Every selected site must have site + username + password.");
// // //   if (selectedItems.length === 0) throw new Error("No items selected.");
// // //   if (sites.length !== selectedItems.length) throw new Error(`Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`);
// // //   const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile, uploadImage);
// // //   const listings = await buildListingsForSelected(selectedItems, { category, keywordsDefaults, defaultImageUrl }, uploadImage);
// // //   const targets: AutomationTargetSite[] = sites.map((s, idx) => ({ site: s.site, login: { username: s.username, password: s.password }, type: (s as any).type ?? "wordpress", listings: [listings[idx]] }));
// // //   const payload: AutomationPayload = { profile, targets };
// // //   return payload;
// // // }

// // // /* ===== Hook implementation (Updated - Optimized & Fault Tolerant) ===== */
// // // import { useState, useMemo, useEffect, useRef } from 'react';
// // // import * as XLSX from 'xlsx';  // Assume installed: npm i xlsx

// // // export function useListingAutomation(allItems: GeneratedItem[], opts: UseListingAutomationOptions = {}) {
// // //   const {
// // //     uploadImage,
// // //     // statusPollIntervalMs = 1500,
// // //     // maxPollMinutes = 10,
// // //     maxSelectableItems = Infinity,
// // //     onMaxExceeded,
// // //     debug = false,
// // //     onRunUpdate,
// // //   } = opts;

// // //   /* Group by project */
// // //   const projects: Project[] = useMemo(() => {
// // //     const map = new Map<string, GeneratedItem[]>();
// // //     for (const it of allItems) {
// // //       const key = it.fileId ?? "__misc__";
// // //       if (!map.has(key)) map.set(key, []);
// // //       map.get(key)!.push(it);
// // //     }
// // //     return Array.from(map.entries()).map(([pid, arr]) => ({ id: pid, name: arr[0]?.fileName || pid || "Untitled Project", items: arr }));
// // //   }, [allItems]);

// // //   /* Search */
// // //   const [search, setSearch] = useState("");
// // //   const filteredProjects: Project[] = useMemo(() => {
// // //     const q = search.toLowerCase().trim();
// // //     if (!q) return projects;
// // //     return projects.map(p => ({ ...p, items: p.items.filter(it => `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase().includes(q)) })).filter(p => p.items.length > 0);
// // //   }, [projects, search]);

// // //   /* Selection / expansion (unchanged) */
// // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // //   const toggleProjectExpand = (pid: string) => { setExpandedProjectIds(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n; }); };
// // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
// // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);
// // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // //     const proj = projects.find(p => p.id === pid); if (!proj) return;
// // //     if (!checked) {
// // //       setSelectedProjectIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
// // //       setSelectedItemIds(prev => { const n = new Set(prev); for (const it of proj.items) n.delete(it.id); return n; });
// // //       return;
// // //     }
// // //     setSelectedItemIds(prev => {
// // //       const n = new Set(prev); let added = 0;
// // //       for (const it of proj.items) { if (n.size >= maxSelectableItems) break; if (!n.has(it.id)) { n.add(it.id); added++; } }
// // //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// // //       return n;
// // //     });
// // //     setSelectedProjectIds(prev => { const n = new Set(prev); const after = new Set(selectedItemIds); for (const it of proj.items) { if (after.size >= maxSelectableItems) break; after.add(it.id); } const allSelectedNow = proj.items.every(it => after.has(it.id)); if (allSelectedNow) n.add(pid); return n; });
// // //   };
// // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // //     const proj = projects.find(p => p.id === pid);
// // //     setSelectedItemIds(prev => { const n = new Set(prev); if (checked) { if (n.size >= maxSelectableItems && !n.has(iid)) { onMaxExceeded?.(maxSelectableItems); return prev; } n.add(iid); } else { n.delete(iid); } return n; });
// // //     if (proj) {
// // //       const after = new Set(selectedItemIds);
// // //       checked ? after.add(iid) : after.delete(iid);
// // //       const allSelected = proj.items.every(it => after.has(it.id));
// // //       const noneSelected = proj.items.every(it => !after.has(it.id));
// // //       setSelectedProjectIds(prev => { const n = new Set(prev); if (allSelected) n.add(pid); else if (noneSelected) n.delete(pid); return n; });
// // //     }
// // //   };
// // //   const clearSelection = () => { setSelectedProjectIds(new Set()); setSelectedItemIds(new Set()); };
// // //   const selectAllVisible = () => {
// // //     const all = new Set<string>(); for (const p of filteredProjects) { for (const it of p.items) { if (all.size >= maxSelectableItems) break; all.add(it.id); } if (all.size >= maxSelectableItems) break; }
// // //     setSelectedItemIds(all);
// // //     const projIds = new Set<string>(); for (const p of filteredProjects) { const allInProj = p.items.every(it => all.has(it.id)); if (allInProj) projIds.add(p.id); }
// // //     setSelectedProjectIds(projIds);
// // //     if (filteredProjects.flatMap(p => p.items).length > maxSelectableItems) onMaxExceeded?.(maxSelectableItems);
// // //   };

// // //   /* Focused preview */
// // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // //   const focusedItem = useMemo(() => allItems.find(x => x.id === focusedItemId), [allItems, focusedItemId]);
// // //   const selectedItems = useMemo(() => allItems.filter(it => selectedItemIds.has(it.id)), [allItems, selectedItemIds]);

// // //   /* ===== Job runs state (client-side) ===== */
// // //   const [isStarting, setIsStarting] = useState(false);
// // //   const [currentJobId, setCurrentJobId] = useState<string | null>(null);
// // //   const [progress, setProgress] = useState(0);
// // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
// // //   const [runs, setRuns] = useState<JobRun[]>([]);
// // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // //   // const pollStartTime = useRef<number>(0);
// // //   function cancelPolling() { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; } }
// // //   function upsertRun(run: JobRun) {
// // //     setRuns(prev => {
// // //       const idx = prev.findIndex(r => r.jobId === run.jobId);
// // //       if (idx === -1) return [run, ...prev];
// // //       const copy = [...prev]; copy[idx] = { ...copy[idx], ...run }; copy.sort((a,b) => (b.startedAt||0) - (a.startedAt||0)); return copy;
// // //     });
// // //     onRunUpdate?.(run);
// // //   }

// // //   /* ===== Start (Optimized + Concurrency + Fault Tolerant) ===== */
// // //   async function start(params: StartParams): Promise<{ jobId: string | null; listings: number; payload: AutomationPayload }> {
// // //     setIsStarting(true);
// // //     setStatus("idle");
// // //     setProgress(0);
// // //     setCurrentJobId(null);
// // //     cancelPolling();
// // //     try {
// // //       const selectedItemsLocal = selectedItems;  // Use memoized
// // //       const payload = await buildPayload(params, selectedItemsLocal, uploadImage);
// // //       const listingsCount = payload.targets.length;
// // //       if (debug) console.log("Starting direct WP automation with payload:", payload);
// // //       if (params.dryRun) return { jobId: null, listings: listingsCount, payload };

// // //       const jobId = Date.now().toString();
// // //       const now = Date.now();
// // //       const optimisticRun: JobRun = { jobId, status: "running", progress: 0, startedAt: now, backlinks: [], successCount: 0, failCount: 0, logs: [] };
// // //       upsertRun(optimisticRun);
// // //       setCurrentJobId(jobId);
// // //       setStatus("running");

// // //       const total = payload.targets.length;
// // //       let successCount = 0;
// // //       let failCount = 0;
// // //       let completedCount = 0;
// // //       const newBacklinks: string[] = [];
// // //       const newLogs: string[] = [];

// // //       // CONFIGURATION: Number of simultaneous requests
// // //       const CONCURRENCY_LIMIT = 5; 

// // //       // WORKER FUNCTION: Processes one target safely
// // //       const processTarget = async (target: AutomationTargetSite) => {
// // //         try {
// // //           const postUrl = await createPostOnSite(target.site, target.login, target.listings[0], params.defaults.category);
// // //           newBacklinks.push(postUrl);
// // //           newLogs.push(`Success on ${target.site}: ${postUrl}`);
// // //           successCount++;
// // //         } catch (e: any) {
// // //           // ERROR ISOLATION: Catch here so other threads don't die
// // //           newLogs.push(`Failed on ${target.site}: ${e.message}`);
// // //           failCount++;
// // //         } finally {
// // //           completedCount++;
// // //           // Update Progress Live
// // //           const prog = Math.round((completedCount / total) * 100);
// // //           setProgress(prog);
// // //           upsertRun({ 
// // //             ...optimisticRun, 
// // //             progress: prog, 
// // //             logs: [...newLogs], // clone to trigger update
// // //             successCount, 
// // //             failCount, 
// // //             backlinks: [...newBacklinks] 
// // //           });
// // //         }
// // //       };

// // //       // CONCURRENCY QUEUE EXECUTION
// // //       let index = 0;
// // //       const targets = payload.targets;
      
// // //       const next = async (): Promise<void> => {
// // //         while (index < total) {
// // //           const currTarget = targets[index++];
// // //           if(!currTarget) break;
// // //           await processTarget(currTarget);
// // //         }
// // //       };

// // //       // Start initial pool of workers
// // //       const workers = [];
// // //       for(let i = 0; i < Math.min(CONCURRENCY_LIMIT, total); i++) {
// // //         workers.push(next());
// // //       }
      
// // //       // Wait for all workers to finish all tasks
// // //       await Promise.all(workers);

// // //       // Finalize
// // //       const finalStatus: "done" | "error" = failCount === 0 ? "done" : (failCount < total ? "done" : "error");
// // //       const finalRun = { ...optimisticRun, status: finalStatus, finishedAt: Date.now(), progress: 100, logs: newLogs, successCount, failCount, backlinks: newBacklinks };
// // //       upsertRun(finalRun);
// // //       setStatus(finalStatus);
// // //       setProgress(100);

// // //       return { jobId, listings: listingsCount, payload };
// // //     } catch (err: any) {
// // //         console.error("Critical Failure in start:", err);
// // //         setStatus("error");
// // //         throw err;
// // //     } finally {
// // //       setIsStarting(false);
// // //     }
// // //   }

// // //   useEffect(() => cancelPolling, []);

// // //   /* Helper: fetch a saved run by id (noop now) */
// // //   async function fetchRunDetails(jobId: string) { /* Client-side only */ return null; }

// // //   /* Helper: download export (client-side XLSX) */
// // //   async function downloadRunExcel(jobId: string | null, filename = "automation_run.xlsx") {
// // //     if (!jobId) throw new Error("Missing jobId");
// // //     const run = runs.find(r => r.jobId === jobId);
// // //     if (!run?.backlinks?.length) throw new Error("No backlinks to export");

// // //     const wsData = [['SiteName', 'Post URL']];
// // //     run.backlinks.forEach(link => {
// // //       const hostname = new URL(link).hostname.replace('www.', '');
// // //       wsData.push([hostname, link]);
// // //     });

// // //     const wb = XLSX.utils.book_new();
// // //     const ws = XLSX.utils.aoa_to_sheet(wsData);
// // //     XLSX.utils.book_append_sheet(wb, ws, 'Backlinks');
// // //     XLSX.writeFile(wb, filename);
// // //     return true;
// // //   }

// // //   /* Exposed API */
// // //   return {
// // //     search,
// // //     setSearch,
// // //     projects,
// // //     filteredProjects,
// // //     expandedProjectIds,
// // //     toggleProjectExpand,
// // //     selectedProjectIds,
// // //     selectedItemIds,
// // //     isProjectSelected,
// // //     isItemSelected,
// // //     setProjectChecked,
// // //     setItemChecked,
// // //     selectAllVisible,
// // //     clearSelection,
// // //     focusedItemId,
// // //     setFocusedItemId,
// // //     focusedItem,
// // //     selectedItems,
// // //     start,
// // //     cancelPolling,
// // //     isStarting,
// // //     jobId: currentJobId,
// // //     progress,
// // //     status,
// // //     runs,
// // //     fetchRunDetails,
// // //     downloadRunExcel,
// // //   };
// // // }




// // // /* ===== Types (match your page) ===== */
// // // export type GeneratedItem = {
// // //   id: string;
// // //   keyword?: string | string[];
// // //   title?: string;
// // //   html?: string;
// // //   generatedContent?: string;
// // //   images?: string[];
// // //   fileId?: string;
// // //   fileName?: string;
// // //   createdAt?: number | string;
// // // };
// // // export type Address = { country: string; state: string; city: string; zip: string; line1: string };
// // // export type Socials = { facebook?: string; twitter?: string; linkedin?: string; pinterest?: string; instagram?: string; yelp?: string; gmb?: string };
// // // export type AutomationListing = { id: string; title: string; contentHtml: string; images: string[]; keywords: string[]; tags?: string[]; category?: string };
// // // export type AutomationTargetSite = { site: string; login: { username: string; password: string }; type?: string; listings: AutomationListing[] };
// // // export type AutomationPayload = { profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address }; targets: AutomationTargetSite[] };
// // // export type UseListingAutomationOptions = {
// // //   uploadImage?: (file: File) => Promise<string>;
// // //   statusPollIntervalMs?: number;
// // //   maxPollMinutes?: number;
// // //   maxSelectableItems?: number;
// // //   onMaxExceeded?: (max: number) => void;
// // //   debug?: boolean;
// // //   /** Optional callback to receive live run updates */
// // //   onRunUpdate?: (run: JobRun) => void;
// // // };
// // // export type StartParams = {
// // //   sites: { site: string; username: string; password: string; type?: string }[];
// // //   defaults: { category?: string; keywordsDefaults?: string[]; imageUrl?: string; imageFile?: File | null; profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address } };
// // //   dryRun?: boolean;
// // // };
// // // export type Project = { id: string; name: string; items: GeneratedItem[] };
// // // /* Job run shape (client-side managed) */
// // // export type JobRun = {
// // //   jobId: string | null;
// // //   status: "queued" | "running" | "done" | "error" | "idle";
// // //   progress: number;
// // //   startedAt?: number;
// // //   finishedAt?: number | null;
// // //   backlinks?: string[]; // accumulated as they arrive
// // //   successCount?: number;
// // //   failCount?: number;
// // //   logs?: string[];
// // //   error?: string | null;
// // // };

// // // /* Small local helpers (reused) */
// // // function getItemTitle(it: GeneratedItem) { return it.title ?? ""; }
// // // function getItemHtml(it: GeneratedItem) { return (it.html ?? it.generatedContent ?? "").toString(); }
// // // function getItemKeywords(it: GeneratedItem): string[] { if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean); if (typeof it.keyword === "string") return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean); return []; }

// // // /* ===== Image helpers (copied / compatible) ===== */
// // // function isBlobOrDataUrl(u: string) { return /^blob:|^data:/i.test(u); }
// // // function isHttpUrl(u: string) { return /^https?:\/\//i.test(u); }
// // // function looksLikeDirectImage(u: string) { return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u); }
// // // function assertValidImageUrl(u: string, ctx: string) {
// // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // //   if (isBlobOrDataUrl(u)) throw new Error(`Invalid image URL (${ctx}): ${u} — blob/data URLs are not supported. Upload first.`);
// // //   if (isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Image URL is not a direct file (${ctx}): ${u}`);
// // //   if (!isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Invalid image URL (${ctx}): ${u}`);
// // // }

// // // /* ===== WP API Helpers (New - Direct Calls) ===== */
// // // async function getOrCreateTerm(termsUrl: string, taxonomy: 'category' | 'post_tag', name: string, authHeader: string): Promise<number> {
// // //   const searchUrl = `${termsUrl}?search=${encodeURIComponent(name)}&per_page=1`;
// // //   let res = await fetch(searchUrl, { headers: { Authorization: authHeader } });
// // //   if (!res.ok) throw new Error(`Failed to search terms: ${res.status}`);
// // //   let terms = await res.json();
// // //   if (terms.length > 0) return terms[0].id;

// // //   // Create
// // //   res = await fetch(termsUrl, {
// // //     method: 'POST',
// // //     headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
// // //     body: JSON.stringify({ name, taxonomy }),
// // //   });
// // //   if (!res.ok) throw new Error(`Failed to create term: ${res.status}`);
// // //   const term = await res.json();
// // //   return term.id;
// // // }

// // // async function uploadMedia(mediaUrl: string, imageUrl: string, authHeader: string): Promise<number> {
// // //   let blob: Blob;
// // //   if (isHttpUrl(imageUrl)) {
// // //     const imgRes = await fetch(imageUrl);
// // //     if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
// // //     blob = await imgRes.blob();
// // //   } else {
// // //     throw new Error(`Unsupported image URL: ${imageUrl}`);
// // //   }

// // //   const fd = new FormData();
// // //   fd.append('file', blob, `featured-${Date.now()}.jpg`);

// // //   const res = await fetch(mediaUrl, {
// // //     method: 'POST',
// // //     headers: { Authorization: authHeader },
// // //     body: fd,
// // //   });
// // //   if (!res.ok) throw new Error(`Media upload failed: ${res.status}`);
// // //   const media = await res.json();
// // //   return media.id;
// // // }

// // // async function createPostOnSite(site: string, login: { username: string; password: string }, listing: AutomationListing): Promise<string> {
// // //   const apiUrl = `https://${site}/wp-json/wp/v2/posts`;
// // //   const mediaUrl = apiUrl.replace('/posts', '/media');
// // //   // const catsUrl = apiUrl.replace('/posts', '/categories'); // NO LONGER USED
// // //   const tagsUrl = apiUrl.replace('/posts', '/tags');
// // //   const auth = btoa(`${login.username}:${login.password}`);
// // //   const authHeader = `Basic ${auth}`;
// // //   const headers = { Authorization: authHeader, 'Content-Type': 'application/json' };

// // //   // === CATEGORY LOGIC REMOVED ===
// // //   // We do not resolve or send categories anymore.
  
// // //   // Resolve tag IDs
// // //   const tagIds = await Promise.all(
// // //     listing.keywords.map(kw => getOrCreateTerm(tagsUrl, 'post_tag', kw, authHeader))
// // //   );

// // //   // === JUSTIFY CONTENT ===
// // //   const justifiedContent = `<div style="text-align: justify;">${listing.contentHtml}</div>`;

// // //   // Create post without featured media
// // //   const postData = {
// // //     title: listing.title,
// // //     content: justifiedContent,
// // //     status: 'publish',
// // //     // categories: [], // Removed: WP will assign default
// // //     tags: tagIds,
// // //   };
  
// // //   let res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(postData) });
// // //   if (!res.ok) throw new Error(`Post creation failed: ${res.status}`);
// // //   let post = await res.json();

// // //   // Upload and set featured image if available
// // //   if (listing.images.length > 0) {
// // //     const imgUrl = listing.images[0];
// // //     assertValidImageUrl(imgUrl, `featured for ${site}`);
// // //     const mediaId = await uploadMedia(mediaUrl, imgUrl, authHeader);
// // //     res = await fetch(`${apiUrl}/${post.id}`, {
// // //       method: 'POST',
// // //       headers,
// // //       body: JSON.stringify({ featured_media: mediaId }),
// // //     });
// // //     if (!res.ok) throw new Error(`Featured image update failed: ${res.status}`);
// // //     post = await res.json();
// // //   }

// // //   return post.link;
// // // }

// // // /* ===== Image upload helpers (for defaults) ===== */
// // // async function autoUploadImage(file: File, uploadImage?: (file: File) => Promise<string>): Promise<string> {
// // //   if (uploadImage) {
// // //     const u = await uploadImage(file);
// // //     if (u && !isBlobOrDataUrl(u)) { assertValidImageUrl(u, "uploadImage()"); return u; }
// // //   }
// // //   throw new Error("Image upload not implemented. Provide uploadImage callback.");
// // // }

// // // function extFromMime(mime: string) { if (/png/i.test(mime)) return "png"; if (/webp/i.test(mime)) return "webp"; if (/gif/i.test(mime)) return "gif"; return "jpg"; }
// // // async function ensurePublicImageUrl(u: string, ctx: string, uploadImage?: (file: File) => Promise<string>): Promise<string> {
// // //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// // //   if (isHttpUrl(u)) { assertValidImageUrl(u, ctx); return u; }
// // //   if (!isBlobOrDataUrl(u) && looksLikeDirectImage(u)) { assertValidImageUrl(u, ctx); return u; }
// // //   if (isBlobOrDataUrl(u)) {
// // //     let blob: Blob; try { const r = await fetch(u); blob = await r.blob(); } catch (e: any) { throw new Error(`Cannot read local image (${ctx}). Please re-select image. ${e?.message || e}`); }
// // //     const mime = blob.type || "image/jpeg"; const ext = extFromMime(mime); const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime }); const publicUrl = await autoUploadImage(file, uploadImage); assertValidImageUrl(publicUrl, ctx); return publicUrl;
// // //   }
// // //   assertValidImageUrl(u, ctx);
// // //   return u;
// // // }

// // // /* ===== Build listings & payload (unchanged) ===== */
// // // async function resolveDefaultImageUrl(imageUrl?: string, imageFile?: File | null, uploadImage?: (file: File) => Promise<string>) {
// // //   if (imageUrl?.trim()) return await ensurePublicImageUrl(imageUrl.trim(), "defaultImageUrl", uploadImage);
// // //   if (imageFile) { const u = await autoUploadImage(imageFile, uploadImage); assertValidImageUrl(u, "uploadedDefaultImageUrl"); return u; }
// // //   return "";
// // // }
// // // async function buildListingsForSelected(selectedItems: GeneratedItem[], params: { keywordsDefaults?: string[]; defaultImageUrl?: string; }, uploadImage?: (file: File) => Promise<string>): Promise<AutomationListing[]> {
// // //   const { keywordsDefaults = [], defaultImageUrl = "" } = params;
// // //   const listings: AutomationListing[] = [];
// // //   for (const it of selectedItems) {
// // //     const ownKeywords = getItemKeywords(it);
// // //     const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
// // //     const rawImgs = (it.images || []).filter(Boolean) as string[];
// // //     const publicImgs: string[] = [];
// // //     for (let i = 0; i < rawImgs.length; i++) { const img = rawImgs[i]; const pub = await ensurePublicImageUrl(img, `item(${it.id}).images[${i}]`, uploadImage); publicImgs.push(pub); }
// // //     const images = publicImgs.length > 0 ? publicImgs : defaultImageUrl ? [defaultImageUrl] : [];
// // //     listings.push({
// // //       id: it.id,
// // //       title: getItemTitle(it),
// // //       contentHtml: getItemHtml(it),
// // //       images,
// // //       keywords: mergedKeywords,
// // //       tags: mergedKeywords,
// // //       category: undefined // No category assignment
// // //     });
// // //   }
// // //   const bad = listings.filter(l => !l.title || !l.contentHtml);
// // //   if (bad.length) throw new Error(`Some items missing title/content: ${bad.map(b => b.id).join(", ")}`);
// // //   const missingImg = listings.filter(l => l.images.length === 0);
// // //   if (missingImg.length) throw new Error(`Some items missing image: ${missingImg.map(b => b.id).join(", ")}`);
// // //   return listings;
// // // }
// // // async function buildPayload(params: StartParams, selectedItems: GeneratedItem[], uploadImage?: (file: File) => Promise<string>): Promise<AutomationPayload> {
// // //   // Destructure 'category' but do not use it
// // //   const { sites, defaults: { category, keywordsDefaults, imageUrl, imageFile, profile } } = params;
  
// // //   if (!Array.isArray(sites) || sites.length === 0) throw new Error("No sites selected.");
// // //   if (sites.some((s) => !s.site || !s.username || !s.password)) throw new Error("Every selected site must have site + username + password.");
// // //   if (selectedItems.length === 0) throw new Error("No items selected.");
// // //   if (sites.length !== selectedItems.length) throw new Error(`Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`);
  
// // //   const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile, uploadImage);
  
// // //   // Removed category from params passed to buildListings
// // //   const listings = await buildListingsForSelected(selectedItems, { keywordsDefaults, defaultImageUrl }, uploadImage);
  
// // //   const targets: AutomationTargetSite[] = sites.map((s, idx) => ({ site: s.site, login: { username: s.username, password: s.password }, type: (s as any).type ?? "wordpress", listings: [listings[idx]] }));
// // //   const payload: AutomationPayload = { profile, targets };
// // //   return payload;
// // // }

// // // /* ===== Hook implementation (Updated - Optimized & Fault Tolerant) ===== */
// // // import { useState, useMemo, useEffect, useRef } from 'react';
// // // import * as XLSX from 'xlsx';  // Assume installed: npm i xlsx

// // // export function useListingAutomation(allItems: GeneratedItem[], opts: UseListingAutomationOptions = {}) {
// // //   const {
// // //     uploadImage,
// // //     maxSelectableItems = Infinity,
// // //     onMaxExceeded,
// // //     debug = false,
// // //     onRunUpdate,
// // //   } = opts;

// // //   /* Group by project */
// // //   const projects: Project[] = useMemo(() => {
// // //     const map = new Map<string, GeneratedItem[]>();
// // //     for (const it of allItems) {
// // //       const key = it.fileId ?? "__misc__";
// // //       if (!map.has(key)) map.set(key, []);
// // //       map.get(key)!.push(it);
// // //     }
// // //     return Array.from(map.entries()).map(([pid, arr]) => ({ id: pid, name: arr[0]?.fileName || pid || "Untitled Project", items: arr }));
// // //   }, [allItems]);

// // //   /* Search */
// // //   const [search, setSearch] = useState("");
// // //   const filteredProjects: Project[] = useMemo(() => {
// // //     const q = search.toLowerCase().trim();
// // //     if (!q) return projects;
// // //     return projects.map(p => ({ ...p, items: p.items.filter(it => `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase().includes(q)) })).filter(p => p.items.length > 0);
// // //   }, [projects, search]);

// // //   /* Selection / expansion (unchanged) */
// // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // //   const toggleProjectExpand = (pid: string) => { setExpandedProjectIds(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n; }); };
// // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
// // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);
// // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // //     const proj = projects.find(p => p.id === pid); if (!proj) return;
// // //     if (!checked) {
// // //       setSelectedProjectIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
// // //       setSelectedItemIds(prev => { const n = new Set(prev); for (const it of proj.items) n.delete(it.id); return n; });
// // //       return;
// // //     }
// // //     setSelectedItemIds(prev => {
// // //       const n = new Set(prev); let added = 0;
// // //       for (const it of proj.items) { if (n.size >= maxSelectableItems) break; if (!n.has(it.id)) { n.add(it.id); added++; } }
// // //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// // //       return n;
// // //     });
// // //     setSelectedProjectIds(prev => { const n = new Set(prev); const after = new Set(selectedItemIds); for (const it of proj.items) { if (after.size >= maxSelectableItems) break; after.add(it.id); } const allSelectedNow = proj.items.every(it => after.has(it.id)); if (allSelectedNow) n.add(pid); return n; });
// // //   };
// // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // //     const proj = projects.find(p => p.id === pid);
// // //     setSelectedItemIds(prev => { const n = new Set(prev); if (checked) { if (n.size >= maxSelectableItems && !n.has(iid)) { onMaxExceeded?.(maxSelectableItems); return prev; } n.add(iid); } else { n.delete(iid); } return n; });
// // //     if (proj) {
// // //       const after = new Set(selectedItemIds);
// // //       checked ? after.add(iid) : after.delete(iid);
// // //       const allSelected = proj.items.every(it => after.has(it.id));
// // //       const noneSelected = proj.items.every(it => !after.has(it.id));
// // //       setSelectedProjectIds(prev => { const n = new Set(prev); if (allSelected) n.add(pid); else if (noneSelected) n.delete(pid); return n; });
// // //     }
// // //   };
// // //   const clearSelection = () => { setSelectedProjectIds(new Set()); setSelectedItemIds(new Set()); };
// // //   const selectAllVisible = () => {
// // //     const all = new Set<string>(); for (const p of filteredProjects) { for (const it of p.items) { if (all.size >= maxSelectableItems) break; all.add(it.id); } if (all.size >= maxSelectableItems) break; }
// // //     setSelectedItemIds(all);
// // //     const projIds = new Set<string>(); for (const p of filteredProjects) { const allInProj = p.items.every(it => all.has(it.id)); if (allInProj) projIds.add(p.id); }
// // //     setSelectedProjectIds(projIds);
// // //     if (filteredProjects.flatMap(p => p.items).length > maxSelectableItems) onMaxExceeded?.(maxSelectableItems);
// // //   };

// // //   /* Focused preview */
// // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // //   const focusedItem = useMemo(() => allItems.find(x => x.id === focusedItemId), [allItems, focusedItemId]);
// // //   const selectedItems = useMemo(() => allItems.filter(it => selectedItemIds.has(it.id)), [allItems, selectedItemIds]);

// // //   /* ===== Job runs state (client-side) ===== */
// // //   const [isStarting, setIsStarting] = useState(false);
// // //   const [currentJobId, setCurrentJobId] = useState<string | null>(null);
// // //   const [progress, setProgress] = useState(0);
// // //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
// // //   const [runs, setRuns] = useState<JobRun[]>([]);
// // //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// // //   // const pollStartTime = useRef<number>(0);
// // //   function cancelPolling() { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; } }
// // //   function upsertRun(run: JobRun) {
// // //     setRuns(prev => {
// // //       const idx = prev.findIndex(r => r.jobId === run.jobId);
// // //       if (idx === -1) return [run, ...prev];
// // //       const copy = [...prev]; copy[idx] = { ...copy[idx], ...run }; copy.sort((a,b) => (b.startedAt||0) - (a.startedAt||0)); return copy;
// // //     });
// // //     onRunUpdate?.(run);
// // //   }

// // //   /* ===== Start (Optimized + Concurrency + Fault Tolerant) ===== */
// // //   async function start(params: StartParams): Promise<{ jobId: string | null; listings: number; payload: AutomationPayload }> {
// // //     setIsStarting(true);
// // //     setStatus("idle");
// // //     setProgress(0);
// // //     setCurrentJobId(null);
// // //     cancelPolling();
// // //     try {
// // //       const selectedItemsLocal = selectedItems;  // Use memoized
// // //       const payload = await buildPayload(params, selectedItemsLocal, uploadImage);
// // //       const listingsCount = payload.targets.length;
// // //       if (debug) console.log("Starting direct WP automation with payload:", payload);
// // //       if (params.dryRun) return { jobId: null, listings: listingsCount, payload };

// // //       const jobId = Date.now().toString();
// // //       const now = Date.now();
// // //       const optimisticRun: JobRun = { jobId, status: "running", progress: 0, startedAt: now, backlinks: [], successCount: 0, failCount: 0, logs: [] };
// // //       upsertRun(optimisticRun);
// // //       setCurrentJobId(jobId);
// // //       setStatus("running");

// // //       const total = payload.targets.length;
// // //       let successCount = 0;
// // //       let failCount = 0;
// // //       let completedCount = 0;
// // //       const newBacklinks: string[] = [];
// // //       const newLogs: string[] = [];

// // //       // CONFIGURATION: Number of simultaneous requests
// // //       const CONCURRENCY_LIMIT = 5; 

// // //       // WORKER FUNCTION: Processes one target safely
// // //       const processTarget = async (target: AutomationTargetSite) => {
// // //         try {
// // //           // Pass only necessary args (Category removed from logic)
// // //           const postUrl = await createPostOnSite(target.site, target.login, target.listings[0]);
// // //           newBacklinks.push(postUrl);
// // //           newLogs.push(`Success on ${target.site}: ${postUrl}`);
// // //           successCount++;
// // //         } catch (e: any) {
// // //           // ERROR ISOLATION: Catch here so other threads don't die
// // //           newLogs.push(`Failed on ${target.site}: ${e.message}`);
// // //           failCount++;
// // //         } finally {
// // //           completedCount++;
// // //           // Update Progress Live
// // //           const prog = Math.round((completedCount / total) * 100);
// // //           setProgress(prog);
// // //           upsertRun({ 
// // //             ...optimisticRun, 
// // //             progress: prog, 
// // //             logs: [...newLogs], // clone to trigger update
// // //             successCount, 
// // //             failCount, 
// // //             backlinks: [...newBacklinks] 
// // //           });
// // //         }
// // //       };

// // //       // CONCURRENCY QUEUE EXECUTION
// // //       let index = 0;
// // //       const targets = payload.targets;
      
// // //       const next = async (): Promise<void> => {
// // //         while (index < total) {
// // //           const currTarget = targets[index++];
// // //           if(!currTarget) break;
// // //           await processTarget(currTarget);
// // //         }
// // //       };

// // //       // Start initial pool of workers
// // //       const workers = [];
// // //       for(let i = 0; i < Math.min(CONCURRENCY_LIMIT, total); i++) {
// // //         workers.push(next());
// // //       }
      
// // //       // Wait for all workers to finish all tasks
// // //       await Promise.all(workers);

// // //       // Finalize
// // //       const finalStatus: "done" | "error" = failCount === 0 ? "done" : (failCount < total ? "done" : "error");
// // //       const finalRun = { ...optimisticRun, status: finalStatus, finishedAt: Date.now(), progress: 100, logs: newLogs, successCount, failCount, backlinks: newBacklinks };
// // //       upsertRun(finalRun);
// // //       setStatus(finalStatus);
// // //       setProgress(100);

// // //       return { jobId, listings: listingsCount, payload };
// // //     } catch (err: any) {
// // //         console.error("Critical Failure in start:", err);
// // //         setStatus("error");
// // //         throw err;
// // //     } finally {
// // //       setIsStarting(false);
// // //     }
// // //   }

// // //   useEffect(() => cancelPolling, []);

// // //   /* Helper: fetch a saved run by id (noop now) */
// // //   async function fetchRunDetails(jobId: string) { /* Client-side only */ return null; }

// // //   /* Helper: download export (client-side XLSX) */
// // //   async function downloadRunExcel(jobId: string | null, filename = "automation_run.xlsx") {
// // //     if (!jobId) throw new Error("Missing jobId");
// // //     const run = runs.find(r => r.jobId === jobId);
// // //     if (!run?.backlinks?.length) throw new Error("No backlinks to export");

// // //     const wsData = [['SiteName', 'Post URL']];
// // //     run.backlinks.forEach(link => {
// // //       const hostname = new URL(link).hostname.replace('www.', '');
// // //       wsData.push([hostname, link]);
// // //     });

// // //     const wb = XLSX.utils.book_new();
// // //     const ws = XLSX.utils.aoa_to_sheet(wsData);
// // //     XLSX.utils.book_append_sheet(wb, ws, 'Backlinks');
// // //     XLSX.writeFile(wb, filename);
// // //     return true;
// // //   }

// // //   /* Exposed API */
// // //   return {
// // //     search,
// // //     setSearch,
// // //     projects,
// // //     filteredProjects,
// // //     expandedProjectIds,
// // //     toggleProjectExpand,
// // //     selectedProjectIds,
// // //     selectedItemIds,
// // //     isProjectSelected,
// // //     isItemSelected,
// // //     setProjectChecked,
// // //     setItemChecked,
// // //     selectAllVisible,
// // //     clearSelection,
// // //     focusedItemId,
// // //     setFocusedItemId,
// // //     focusedItem,
// // //     selectedItems,
// // //     start,
// // //     cancelPolling,
// // //     isStarting,
// // //     jobId: currentJobId,
// // //     progress,
// // //     status,
// // //     runs,
// // //     fetchRunDetails,
// // //     downloadRunExcel,
// // //   };
// // // }





// // /* ===== Types (match your page) ===== */
// // export type GeneratedItem = {
// //   id: string;
// //   keyword?: string | string[];
// //   title?: string;
// //   html?: string;
// //   generatedContent?: string;
// //   images?: string[];
// //   fileId?: string;
// //   fileName?: string;
// //   createdAt?: number | string;
// // };
// // export type Address = { country: string; state: string; city: string; zip: string; line1: string };
// // export type Socials = { facebook?: string; twitter?: string; linkedin?: string; pinterest?: string; instagram?: string; yelp?: string; gmb?: string };
// // export type AutomationListing = { id: string; title: string; contentHtml: string; images: string[]; keywords: string[]; tags?: string[]; category?: string };
// // export type AutomationTargetSite = { site: string; login: { username: string; password: string }; type?: string; listings: AutomationListing[] };
// // export type AutomationPayload = { profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address }; targets: AutomationTargetSite[] };
// // export type UseListingAutomationOptions = {
// //   uploadImage?: (file: File) => Promise<string>;
// //   statusPollIntervalMs?: number;
// //   maxPollMinutes?: number;
// //   maxSelectableItems?: number;
// //   onMaxExceeded?: (max: number) => void;
// //   debug?: boolean;
// //   /** Optional callback to receive live run updates */
// //   onRunUpdate?: (run: JobRun) => void;
// // };
// // export type StartParams = {
// //   sites: { site: string; username: string; password: string; type?: string }[];
// //   defaults: { category?: string; keywordsDefaults?: string[]; imageUrl?: string; imageFile?: File | null; profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address } };
// //   dryRun?: boolean;
// // };
// // export type Project = { id: string; name: string; items: GeneratedItem[] };
// // /* Job run shape (client-side managed) */
// // export type JobRun = {
// //   jobId: string | null;
// //   status: "queued" | "running" | "done" | "error" | "idle";
// //   progress: number;
// //   startedAt?: number;
// //   finishedAt?: number | null;
// //   backlinks?: string[]; // accumulated as they arrive
// //   successCount?: number;
// //   failCount?: number;
// //   logs?: string[];
// //   error?: string | null;
// // };

// // /* Small local helpers (reused) */
// // function getItemTitle(it: GeneratedItem) { return it.title ?? ""; }
// // function getItemHtml(it: GeneratedItem) { return (it.html ?? it.generatedContent ?? "").toString(); }
// // function getItemKeywords(it: GeneratedItem): string[] { if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean); if (typeof it.keyword === "string") return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean); return []; }

// // /* ===== Image helpers (copied / compatible) ===== */
// // function isBlobOrDataUrl(u: string) { return /^blob:|^data:/i.test(u); }
// // function isHttpUrl(u: string) { return /^https?:\/\//i.test(u); }
// // function looksLikeDirectImage(u: string) { return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u); }
// // function assertValidImageUrl(u: string, ctx: string) {
// //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// //   if (isBlobOrDataUrl(u)) throw new Error(`Invalid image URL (${ctx}): ${u} — blob/data URLs are not supported. Upload first.`);
// //   if (isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Image URL is not a direct file (${ctx}): ${u}`);
// //   if (!isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Invalid image URL (${ctx}): ${u}`);
// // }

// // /* ===== WP API Helpers (New - Direct Calls) ===== */
// // async function getOrCreateTerm(termsUrl: string, taxonomy: 'category' | 'post_tag', name: string, authHeader: string): Promise<number> {
// //   const searchUrl = `${termsUrl}?search=${encodeURIComponent(name)}&per_page=1`;
// //   let res = await fetch(searchUrl, { headers: { Authorization: authHeader } });
// //   if (!res.ok) throw new Error(`Failed to search terms: ${res.status}`);
// //   let terms = await res.json();
// //   if (terms.length > 0) return terms[0].id;

// //   // Create
// //   res = await fetch(termsUrl, {
// //     method: 'POST',
// //     headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
// //     body: JSON.stringify({ name, taxonomy }),
// //   });
// //   if (!res.ok) throw new Error(`Failed to create term: ${res.status}`);
// //   const term = await res.json();
// //   return term.id;
// // }

// // async function uploadMedia(mediaUrl: string, imageUrl: string, authHeader: string): Promise<number> {
// //   let blob: Blob;
// //   if (isHttpUrl(imageUrl)) {
// //     const imgRes = await fetch(imageUrl);
// //     if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
// //     blob = await imgRes.blob();
// //   } else {
// //     throw new Error(`Unsupported image URL: ${imageUrl}`);
// //   }

// //   const fd = new FormData();
// //   fd.append('file', blob, `featured-${Date.now()}.jpg`);

// //   const res = await fetch(mediaUrl, {
// //     method: 'POST',
// //     headers: { Authorization: authHeader },
// //     body: fd,
// //   });
// //   if (!res.ok) throw new Error(`Media upload failed: ${res.status}`);
// //   const media = await res.json();
// //   return media.id;
// // }

// // async function createPostOnSite(site: string, login: { username: string; password: string }, listing: AutomationListing): Promise<string> {
// //   const apiUrl = `https://${site}/wp-json/wp/v2/posts`;
// //   const mediaUrl = apiUrl.replace('/posts', '/media');
// //   // const catsUrl = apiUrl.replace('/posts', '/categories'); // NO LONGER USED
// //   const tagsUrl = apiUrl.replace('/posts', '/tags');
// //   const auth = btoa(`${login.username}:${login.password}`);
// //   const authHeader = `Basic ${auth}`;
// //   const headers = { Authorization: authHeader, 'Content-Type': 'application/json' };

// //   // === CATEGORY LOGIC REMOVED ===
// //   // We do not resolve or send categories anymore.
  
// //   // Resolve tag IDs
// //   const tagIds = await Promise.all(
// //     listing.keywords.map(kw => getOrCreateTerm(tagsUrl, 'post_tag', kw, authHeader))
// //   );

// //   // === JUSTIFY CONTENT ===
// //   const justifiedContent = `<div style="text-align: justify;">${listing.contentHtml}</div>`;

// //   // Create post without featured media
// //   const postData = {
// //     title: listing.title,
// //     content: justifiedContent,
// //     status: 'publish',
// //     // categories: [], // Removed: WP will assign default
// //     tags: tagIds,
// //   };
  
// //   let res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(postData) });
// //   if (!res.ok) throw new Error(`Post creation failed: ${res.status}`);
// //   let post = await res.json();

// //   // Upload and set featured image if available
// //   if (listing.images.length > 0) {
// //     const imgUrl = listing.images[0];
// //     assertValidImageUrl(imgUrl, `featured for ${site}`);
// //     const mediaId = await uploadMedia(mediaUrl, imgUrl, authHeader);
// //     res = await fetch(`${apiUrl}/${post.id}`, {
// //       method: 'POST',
// //       headers,
// //       body: JSON.stringify({ featured_media: mediaId }),
// //     });
// //     if (!res.ok) throw new Error(`Featured image update failed: ${res.status}`);
// //     post = await res.json();
// //   }

// //   return post.link;
// // }

// // /* ===== Image upload helpers (for defaults) ===== */
// // async function autoUploadImage(file: File, uploadImage?: (file: File) => Promise<string>): Promise<string> {
// //   if (uploadImage) {
// //     const u = await uploadImage(file);
// //     if (u && !isBlobOrDataUrl(u)) { assertValidImageUrl(u, "uploadImage()"); return u; }
// //   }
// //   throw new Error("Image upload not implemented. Provide uploadImage callback.");
// // }

// // function extFromMime(mime: string) { if (/png/i.test(mime)) return "png"; if (/webp/i.test(mime)) return "webp"; if (/gif/i.test(mime)) return "gif"; return "jpg"; }
// // async function ensurePublicImageUrl(u: string, ctx: string, uploadImage?: (file: File) => Promise<string>): Promise<string> {
// //   if (!u) throw new Error(`Missing image URL (${ctx}).`);
// //   if (isHttpUrl(u)) { assertValidImageUrl(u, ctx); return u; }
// //   if (!isBlobOrDataUrl(u) && looksLikeDirectImage(u)) { assertValidImageUrl(u, ctx); return u; }
// //   if (isBlobOrDataUrl(u)) {
// //     let blob: Blob; try { const r = await fetch(u); blob = await r.blob(); } catch (e: any) { throw new Error(`Cannot read local image (${ctx}). Please re-select image. ${e?.message || e}`); }
// //     const mime = blob.type || "image/jpeg"; const ext = extFromMime(mime); const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime }); const publicUrl = await autoUploadImage(file, uploadImage); assertValidImageUrl(publicUrl, ctx); return publicUrl;
// //   }
// //   assertValidImageUrl(u, ctx);
// //   return u;
// // }

// // /* ===== Build listings & payload (unchanged) ===== */
// // async function resolveDefaultImageUrl(imageUrl?: string, imageFile?: File | null, uploadImage?: (file: File) => Promise<string>) {
// //   if (imageUrl?.trim()) return await ensurePublicImageUrl(imageUrl.trim(), "defaultImageUrl", uploadImage);
// //   if (imageFile) { const u = await autoUploadImage(imageFile, uploadImage); assertValidImageUrl(u, "uploadedDefaultImageUrl"); return u; }
// //   return "";
// // }
// // async function buildListingsForSelected(selectedItems: GeneratedItem[], params: { keywordsDefaults?: string[]; defaultImageUrl?: string; }, uploadImage?: (file: File) => Promise<string>): Promise<AutomationListing[]> {
// //   const { keywordsDefaults = [], defaultImageUrl = "" } = params;
// //   const listings: AutomationListing[] = [];
// //   for (const it of selectedItems) {
// //     const ownKeywords = getItemKeywords(it);
// //     const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
// //     const rawImgs = (it.images || []).filter(Boolean) as string[];
// //     const publicImgs: string[] = [];
// //     for (let i = 0; i < rawImgs.length; i++) { const img = rawImgs[i]; const pub = await ensurePublicImageUrl(img, `item(${it.id}).images[${i}]`, uploadImage); publicImgs.push(pub); }
// //     const images = publicImgs.length > 0 ? publicImgs : defaultImageUrl ? [defaultImageUrl] : [];
// //     listings.push({
// //       id: it.id,
// //       title: getItemTitle(it),
// //       contentHtml: getItemHtml(it),
// //       images,
// //       keywords: mergedKeywords,
// //       tags: mergedKeywords,
// //       category: undefined // No category assignment
// //     });
// //   }
// //   const bad = listings.filter(l => !l.title || !l.contentHtml);
// //   if (bad.length) throw new Error(`Some items missing title/content: ${bad.map(b => b.id).join(", ")}`);
// //   const missingImg = listings.filter(l => l.images.length === 0);
// //   if (missingImg.length) throw new Error(`Some items missing image: ${missingImg.map(b => b.id).join(", ")}`);
// //   return listings;
// // }
// // async function buildPayload(params: StartParams, selectedItems: GeneratedItem[], uploadImage?: (file: File) => Promise<string>): Promise<AutomationPayload> {
// //   // Destructure 'category' but do not use it
// //   const { sites, defaults: {  keywordsDefaults, imageUrl, imageFile, profile } } = params;
  
// //   if (!Array.isArray(sites) || sites.length === 0) throw new Error("No sites selected.");
// //   if (sites.some((s) => !s.site || !s.username || !s.password)) throw new Error("Every selected site must have site + username + password.");
// //   if (selectedItems.length === 0) throw new Error("No items selected.");
// //   if (sites.length !== selectedItems.length) throw new Error(`Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`);
  
// //   const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile, uploadImage);
  
// //   // Removed category from params passed to buildListings
// //   const listings = await buildListingsForSelected(selectedItems, { keywordsDefaults, defaultImageUrl }, uploadImage);
  
// //   const targets: AutomationTargetSite[] = sites.map((s, idx) => ({ site: s.site, login: { username: s.username, password: s.password }, type: (s as any).type ?? "wordpress", listings: [listings[idx]] }));
// //   const payload: AutomationPayload = { profile, targets };
// //   return payload;
// // }

// // /* ===== Hook implementation (Updated - Optimized & Fault Tolerant) ===== */
// // import { useState, useMemo, useEffect, useRef } from 'react';
// // import * as XLSX from 'xlsx';  // Assume installed: npm i xlsx

// // export function useListingAutomation(allItems: GeneratedItem[], opts: UseListingAutomationOptions = {}) {
// //   const {
// //     uploadImage,
// //     maxSelectableItems = Infinity,
// //     onMaxExceeded,
// //     debug = false,
// //     onRunUpdate,
// //   } = opts;

// //   /* Group by project */
// //   const projects: Project[] = useMemo(() => {
// //     const map = new Map<string, GeneratedItem[]>();
// //     for (const it of allItems) {
// //       const key = it.fileId ?? "__misc__";
// //       if (!map.has(key)) map.set(key, []);
// //       map.get(key)!.push(it);
// //     }
// //     return Array.from(map.entries()).map(([pid, arr]) => ({ id: pid, name: arr[0]?.fileName || pid || "Untitled Project", items: arr }));
// //   }, [allItems]);

// //   /* Search */
// //   const [search, setSearch] = useState("");
// //   const filteredProjects: Project[] = useMemo(() => {
// //     const q = search.toLowerCase().trim();
// //     if (!q) return projects;
// //     return projects.map(p => ({ ...p, items: p.items.filter(it => `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase().includes(q)) })).filter(p => p.items.length > 0);
// //   }, [projects, search]);

// //   /* Selection / expansion (unchanged) */
// //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// //   const toggleProjectExpand = (pid: string) => { setExpandedProjectIds(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n; }); };
// //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
// //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);
// //   const setProjectChecked = (pid: string, checked: boolean) => {
// //     const proj = projects.find(p => p.id === pid); if (!proj) return;
// //     if (!checked) {
// //       setSelectedProjectIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
// //       setSelectedItemIds(prev => { const n = new Set(prev); for (const it of proj.items) n.delete(it.id); return n; });
// //       return;
// //     }
// //     setSelectedItemIds(prev => {
// //       const n = new Set(prev); let added = 0;
// //       for (const it of proj.items) { if (n.size >= maxSelectableItems) break; if (!n.has(it.id)) { n.add(it.id); added++; } }
// //       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
// //       return n;
// //     });
// //     setSelectedProjectIds(prev => { const n = new Set(prev); const after = new Set(selectedItemIds); for (const it of proj.items) { if (after.size >= maxSelectableItems) break; after.add(it.id); } const allSelectedNow = proj.items.every(it => after.has(it.id)); if (allSelectedNow) n.add(pid); return n; });
// //   };
// //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// //     const proj = projects.find(p => p.id === pid);
// //     setSelectedItemIds(prev => { const n = new Set(prev); if (checked) { if (n.size >= maxSelectableItems && !n.has(iid)) { onMaxExceeded?.(maxSelectableItems); return prev; } n.add(iid); } else { n.delete(iid); } return n; });
// //     if (proj) {
// //       const after = new Set(selectedItemIds);
// //       checked ? after.add(iid) : after.delete(iid);
// //       const allSelected = proj.items.every(it => after.has(it.id));
// //       const noneSelected = proj.items.every(it => !after.has(it.id));
// //       setSelectedProjectIds(prev => { const n = new Set(prev); if (allSelected) n.add(pid); else if (noneSelected) n.delete(pid); return n; });
// //     }
// //   };
// //   const clearSelection = () => { setSelectedProjectIds(new Set()); setSelectedItemIds(new Set()); };
// //   const selectAllVisible = () => {
// //     const all = new Set<string>(); for (const p of filteredProjects) { for (const it of p.items) { if (all.size >= maxSelectableItems) break; all.add(it.id); } if (all.size >= maxSelectableItems) break; }
// //     setSelectedItemIds(all);
// //     const projIds = new Set<string>(); for (const p of filteredProjects) { const allInProj = p.items.every(it => all.has(it.id)); if (allInProj) projIds.add(p.id); }
// //     setSelectedProjectIds(projIds);
// //     if (filteredProjects.flatMap(p => p.items).length > maxSelectableItems) onMaxExceeded?.(maxSelectableItems);
// //   };

// //   /* Focused preview */
// //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// //   const focusedItem = useMemo(() => allItems.find(x => x.id === focusedItemId), [allItems, focusedItemId]);
// //   const selectedItems = useMemo(() => allItems.filter(it => selectedItemIds.has(it.id)), [allItems, selectedItemIds]);

// //   /* ===== Job runs state (client-side) ===== */
// //   const [isStarting, setIsStarting] = useState(false);
// //   const [currentJobId, setCurrentJobId] = useState<string | null>(null);
// //   const [progress, setProgress] = useState(0);
// //   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
// //   const [runs, setRuns] = useState<JobRun[]>([]);
// //   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
// //   // const pollStartTime = useRef<number>(0);
// //   function cancelPolling() { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; } }
// //   function upsertRun(run: JobRun) {
// //     setRuns(prev => {
// //       const idx = prev.findIndex(r => r.jobId === run.jobId);
// //       if (idx === -1) return [run, ...prev];
// //       const copy = [...prev]; copy[idx] = { ...copy[idx], ...run }; copy.sort((a,b) => (b.startedAt||0) - (a.startedAt||0)); return copy;
// //     });
// //     onRunUpdate?.(run);
// //   }

// //   /* ===== Start (Optimized + Concurrency + Fault Tolerant) ===== */
// //   async function start(params: StartParams): Promise<{ jobId: string | null; listings: number; payload: AutomationPayload }> {
// //     setIsStarting(true);
// //     setStatus("idle");
// //     setProgress(0);
// //     setCurrentJobId(null);
// //     cancelPolling();
// //     try {
// //       const selectedItemsLocal = selectedItems;  // Use memoized
// //       const payload = await buildPayload(params, selectedItemsLocal, uploadImage);
// //       const listingsCount = payload.targets.length;
// //       if (debug) console.log("Starting direct WP automation with payload:", payload);
// //       if (params.dryRun) return { jobId: null, listings: listingsCount, payload };

// //       const jobId = Date.now().toString();
// //       const now = Date.now();
// //       const optimisticRun: JobRun = { jobId, status: "running", progress: 0, startedAt: now, backlinks: [], successCount: 0, failCount: 0, logs: [] };
// //       upsertRun(optimisticRun);
// //       setCurrentJobId(jobId);
// //       setStatus("running");

// //       const total = payload.targets.length;
// //       let successCount = 0;
// //       let failCount = 0;
// //       let completedCount = 0;
// //       const newBacklinks: string[] = [];
// //       const newLogs: string[] = [];

// //       // CONFIGURATION: Number of simultaneous requests
// //       const CONCURRENCY_LIMIT = 5; 

// //       // WORKER FUNCTION: Processes one target safely
// //       const processTarget = async (target: AutomationTargetSite) => {
// //         try {
// //           // Pass only necessary args (Category removed from logic)
// //           const postUrl = await createPostOnSite(target.site, target.login, target.listings[0]);
// //           newBacklinks.push(postUrl);
// //           newLogs.push(`Success on ${target.site}: ${postUrl}`);
// //           successCount++;
// //         } catch (e: any) {
// //           // ERROR ISOLATION: Catch here so other threads don't die
// //           newLogs.push(`Failed on ${target.site}: ${e.message}`);
// //           failCount++;
// //         } finally {
// //           completedCount++;
// //           // Update Progress Live
// //           const prog = Math.round((completedCount / total) * 100);
// //           setProgress(prog);
// //           upsertRun({ 
// //             ...optimisticRun, 
// //             progress: prog, 
// //             logs: [...newLogs], // clone to trigger update
// //             successCount, 
// //             failCount, 
// //             backlinks: [...newBacklinks] 
// //           });
// //         }
// //       };

// //       // CONCURRENCY QUEUE EXECUTION
// //       let index = 0;
// //       const targets = payload.targets;
      
// //       const next = async (): Promise<void> => {
// //         while (index < total) {
// //           const currTarget = targets[index++];
// //           if(!currTarget) break;
// //           await processTarget(currTarget);
// //         }
// //       };

// //       // Start initial pool of workers
// //       const workers = [];
// //       for(let i = 0; i < Math.min(CONCURRENCY_LIMIT, total); i++) {
// //         workers.push(next());
// //       }
      
// //       // Wait for all workers to finish all tasks
// //       await Promise.all(workers);

// //       // Finalize
// //       const finalStatus: "done" | "error" = failCount === 0 ? "done" : (failCount < total ? "done" : "error");
// //       const finalRun = { ...optimisticRun, status: finalStatus, finishedAt: Date.now(), progress: 100, logs: newLogs, successCount, failCount, backlinks: newBacklinks };
// //       upsertRun(finalRun);
// //       setStatus(finalStatus);
// //       setProgress(100);

// //       return { jobId, listings: listingsCount, payload };
// //     } catch (err: any) {
// //         console.error("Critical Failure in start:", err);
// //         setStatus("error");
// //         throw err;
// //     } finally {
// //       setIsStarting(false);
// //     }
// //   }

// //   useEffect(() => cancelPolling, []);

// //   /* Helper: fetch a saved run by id (noop now) */
// //   async function fetchRunDetails() { /* Client-side only */ return null; }

// //   /* Helper: download export (client-side XLSX) */
// //   async function downloadRunExcel(jobId: string | null, filename = "automation_run.xlsx") {
// //     if (!jobId) throw new Error("Missing jobId");
// //     const run = runs.find(r => r.jobId === jobId);
// //     if (!run?.backlinks?.length) throw new Error("No backlinks to export");

// //     const wsData = [['SiteName', 'Post URL']];
// //     run.backlinks.forEach(link => {
// //       const hostname = new URL(link).hostname.replace('www.', '');
// //       wsData.push([hostname, link]);
// //     });

// //     const wb = XLSX.utils.book_new();
// //     const ws = XLSX.utils.aoa_to_sheet(wsData);
// //     XLSX.utils.book_append_sheet(wb, ws, 'Backlinks');
// //     XLSX.writeFile(wb, filename);
// //     return true;
// //   }

// //   /* Exposed API */
// //   return {
// //     search,
// //     setSearch,
// //     projects,
// //     filteredProjects,
// //     expandedProjectIds,
// //     toggleProjectExpand,
// //     selectedProjectIds,
// //     selectedItemIds,
// //     isProjectSelected,
// //     isItemSelected,
// //     setProjectChecked,
// //     setItemChecked,
// //     selectAllVisible,
// //     clearSelection,
// //     focusedItemId,
// //     setFocusedItemId,
// //     focusedItem,
// //     selectedItems,
// //     start,
// //     cancelPolling,
// //     isStarting,
// //     jobId: currentJobId,
// //     progress,
// //     status,
// //     runs,
// //     fetchRunDetails,
// //     downloadRunExcel,
// //   };
// // }



// export type GeneratedItem = {
//   id: string;
//   keyword?: string | string[];
//   title?: string;
//   html?: string;
//   generatedContent?: string;
//   images?: string[];
//   fileId?: string;
//   fileName?: string;
//   createdAt?: number | string;
// };
// export type Address = { country: string; state: string; city: string; zip: string; line1: string };
// export type Socials = { facebook?: string; twitter?: string; linkedin?: string; pinterest?: string; instagram?: string; yelp?: string; gmb?: string };
// export type AutomationListing = { id: string; title: string; contentHtml: string; images: string[]; keywords: string[]; tags?: string[]; category?: string };
// export type AutomationTargetSite = { site: string; login: { username: string; password: string }; type?: string; listings: AutomationListing[] };
// export type AutomationPayload = { profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address }; targets: AutomationTargetSite[] };
// export type UseListingAutomationOptions = {
//   uploadImage?: (file: File) => Promise<string>;
//   statusPollIntervalMs?: number;
//   maxPollMinutes?: number;
//   maxSelectableItems?: number;
//   onMaxExceeded?: (max: number) => void;
//   debug?: boolean;
//   /** Optional callback to receive live run updates */
//   onRunUpdate?: (run: JobRun) => void;
// };
// export type StartParams = {
//   sites: { site: string; username: string; password: string; type?: string }[];
//   defaults: { category?: string; keywordsDefaults?: string[]; imageUrl?: string; imageFile?: File | null; profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address } };
//   dryRun?: boolean;
// };
// export type Project = { id: string; name: string; items: GeneratedItem[] };
// /* Job run shape (client-side managed) */
// export type JobRun = {
//   jobId: string | null;
//   status: "queued" | "running" | "done" | "error" | "idle";
//   progress: number;
//   startedAt?: number;
//   finishedAt?: number | null;
//   backlinks?: string[]; // accumulated as they arrive
//   successCount?: number;
//   failCount?: number;
//   logs?: string[];
//   error?: string | null;
// };

// /* Small local helpers (reused) */
// function getItemTitle(it: GeneratedItem) { return it.title ?? ""; }
// function getItemHtml(it: GeneratedItem) { return (it.html ?? it.generatedContent ?? "").toString(); }
// function getItemKeywords(it: GeneratedItem): string[] { if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean); if (typeof it.keyword === "string") return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean); return []; }

// /* ===== Image helpers (copied / compatible) ===== */
// function isBlobOrDataUrl(u: string) { return /^blob:|^data:/i.test(u); }
// function isHttpUrl(u: string) { return /^https?:\/\//i.test(u); }
// function looksLikeDirectImage(u: string) { return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u); }
// function assertValidImageUrl(u: string, ctx: string) {
//   if (!u) throw new Error(`Missing image URL (${ctx}).`);
//   if (isBlobOrDataUrl(u)) throw new Error(`Invalid image URL (${ctx}): ${u} — blob/data URLs are not supported. Upload first.`);
//   if (isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Image URL is not a direct file (${ctx}): ${u}`);
//   if (!isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Invalid image URL (${ctx}): ${u}`);
// }

// /* ===== WP API Helpers (New - Direct Calls) ===== */
// async function getOrCreateTerm(termsUrl: string, taxonomy: 'category' | 'post_tag', name: string, authHeader: string): Promise<number> {
//   const searchUrl = `${termsUrl}?search=${encodeURIComponent(name)}&per_page=1`;
//   let res = await fetch(searchUrl, { headers: { Authorization: authHeader } });
//   if (!res.ok) throw new Error(`Failed to search terms: ${res.status}`);
//   let terms = await res.json();
//   if (terms.length > 0) return terms[0].id;

//   // Create
//   res = await fetch(termsUrl, {
//     method: 'POST',
//     headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
//     body: JSON.stringify({ name, taxonomy }),
//   });
//   if (!res.ok) throw new Error(`Failed to create term: ${res.status}`);
//   const term = await res.json();
//   return term.id;
// }

// async function uploadMedia(mediaUrl: string, imageUrl: string, authHeader: string): Promise<number> {
//   let blob: Blob;
//   if (isHttpUrl(imageUrl)) {
//     const imgRes = await fetch(imageUrl);
//     if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
//     blob = await imgRes.blob();
//   } else {
//     throw new Error(`Unsupported image URL: ${imageUrl}`);
//   }

//   const fd = new FormData();
//   fd.append('file', blob, `featured-${Date.now()}.jpg`);

//   const res = await fetch(mediaUrl, {
//     method: 'POST',
//     headers: { Authorization: authHeader },
//     body: fd,
//   });
//   if (!res.ok) throw new Error(`Media upload failed: ${res.status}`);
//   const media = await res.json();
//   return media.id;
// }

// async function createPostOnSite(site: string, login: { username: string; password: string }, listing: AutomationListing): Promise<string> {
//   const apiUrl = `https://${site}/wp-json/wp/v2/posts`;
//   const mediaUrl = apiUrl.replace('/posts', '/media');
//   // const catsUrl = apiUrl.replace('/posts', '/categories'); // NO LONGER USED
//   const tagsUrl = apiUrl.replace('/posts', '/tags');
//   const auth = btoa(`${login.username}:${login.password}`);
//   const authHeader = `Basic ${auth}`;
//   const headers = { Authorization: authHeader, 'Content-Type': 'application/json' };

//   // === CATEGORY LOGIC REMOVED ===
//   // We do not resolve or send categories anymore.
  
//   // Resolve tag IDs
//   const tagIds = await Promise.all(
//     listing.keywords.map(kw => getOrCreateTerm(tagsUrl, 'post_tag', kw, authHeader))
//   );

//   // === JUSTIFY CONTENT ===
//   const justifiedContent = `<div style="text-align: justify;">${listing.contentHtml}</div>`;

//   // Create post without featured media
//   const postData = {
//     title: listing.title,
//     content: justifiedContent,
//     status: 'publish',
//     // categories: [], // Removed: WP will assign default
//     tags: tagIds,
//   };
  
//   let res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(postData) });
//   if (!res.ok) throw new Error(`Post creation failed: ${res.status}`);
//   let post = await res.json();

//   // Upload and set featured image if available
//   if (listing.images && listing.images.length > 0) {
//     const imgUrl = listing.images[0];
//     try {
//       // Validate and upload — but if any step fails, don't fail the whole post creation.
//       assertValidImageUrl(imgUrl, `featured for ${site}`);
//       const mediaId = await uploadMedia(mediaUrl, imgUrl, authHeader);
//       // Set as featured media. Use PUT-like update using post id endpoint.
//       res = await fetch(`${apiUrl}/${post.id}`, {
//         method: 'POST',
//         headers,
//         body: JSON.stringify({ featured_media: mediaId }),
//       });
//       if (!res.ok) {
//         // non-fatal: warn and continue
//         console.warn(`Featured image update failed for ${site}: ${res.status}`);
//       } else {
//         post = await res.json();
//       }
//     } catch (e: any) {
//       // Don't throw — log and continue publishing the post without featured image
//       console.warn(`Featured image for ${site} skipped due to: ${e?.message || e}`);
//     }
//   }

//   return post.link;
// }

// /* ===== Image upload helpers (for defaults) ===== */
// async function autoUploadImage(file: File, uploadImage?: (file: File) => Promise<string>): Promise<string> {
//   if (uploadImage) {
//     const u = await uploadImage(file);
//     if (u && !isBlobOrDataUrl(u)) { assertValidImageUrl(u, "uploadImage()"); return u; }
//   }
//   throw new Error("Image upload not implemented. Provide uploadImage callback.");
// }

// function extFromMime(mime: string) { if (/png/i.test(mime)) return "png"; if (/webp/i.test(mime)) return "webp"; if (/gif/i.test(mime)) return "gif"; return "jpg"; }
// async function ensurePublicImageUrl(u: string, ctx: string, uploadImage?: (file: File) => Promise<string>): Promise<string> {
//   if (!u) throw new Error(`Missing image URL (${ctx}).`);
//   if (isHttpUrl(u)) { assertValidImageUrl(u, ctx); return u; }
//   if (!isBlobOrDataUrl(u) && looksLikeDirectImage(u)) { assertValidImageUrl(u, ctx); return u; }
//   if (isBlobOrDataUrl(u)) {
//     let blob: Blob; try { const r = await fetch(u); blob = await r.blob(); } catch (e: any) { throw new Error(`Cannot read local image (${ctx}). Please re-select image. ${e?.message || e}`); }
//     const mime = blob.type || "image/jpeg"; const ext = extFromMime(mime); const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime }); const publicUrl = await autoUploadImage(file, uploadImage); assertValidImageUrl(publicUrl, ctx); return publicUrl;
//   }
//   assertValidImageUrl(u, ctx);
//   return u;
// }

// /* ===== Build listings & payload (unchanged except image optional) ===== */
// async function resolveDefaultImageUrl(imageUrl?: string, imageFile?: File | null, uploadImage?: (file: File) => Promise<string>) {
//   if (imageUrl?.trim()) return await ensurePublicImageUrl(imageUrl.trim(), "defaultImageUrl", uploadImage);
//   if (imageFile) { const u = await autoUploadImage(imageFile, uploadImage); assertValidImageUrl(u, "uploadedDefaultImageUrl"); return u; }
//   return "";
// }
// async function buildListingsForSelected(selectedItems: GeneratedItem[], params: { keywordsDefaults?: string[]; defaultImageUrl?: string; }, uploadImage?: (file: File) => Promise<string>): Promise<AutomationListing[]> {
//   const { keywordsDefaults = [], defaultImageUrl = "" } = params;
//   const listings: AutomationListing[] = [];
//   for (const it of selectedItems) {
//     const ownKeywords = getItemKeywords(it);
//     const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
//     const rawImgs = (it.images || []).filter(Boolean) as string[];
//     const publicImgs: string[] = [];
//     for (let i = 0; i < rawImgs.length; i++) {
//       const img = rawImgs[i];
//       // ensurePublicImageUrl may throw for invalid image urls — keep that behavior for invalid urls
//       const pub = await ensurePublicImageUrl(img, `item(${it.id}).images[${i}]`, uploadImage);
//       publicImgs.push(pub);
//     }
//     const images = publicImgs.length > 0 ? publicImgs : (defaultImageUrl ? [defaultImageUrl] : []);
//     listings.push({
//       id: it.id,
//       title: getItemTitle(it),
//       contentHtml: getItemHtml(it),
//       images,
//       keywords: mergedKeywords,
//       tags: mergedKeywords,
//       category: undefined // No category assignment
//     });
//   }
//   const bad = listings.filter(l => !l.title || !l.contentHtml);
//   if (bad.length) throw new Error(`Some items missing title/content: ${bad.map(b => b.id).join(", ")}`);

//   // NOTE: Previously we threw an error if some listings had no image.
//   // That caused the frontend to mark the run as ERROR even though posts were published.
//   // Now images are optional. If you want to require images for specific flows, validate earlier in UI.
//   const missingImg = listings.filter(l => l.images.length === 0);
//   if (missingImg.length && (typeof window !== 'undefined' && (window as any).__DEV_LOG__ === true)) {
//     console.warn(`Some listings have no images: ${missingImg.map(b => b.id).join(", ")}`);
//   }
//   // Do NOT throw — allow publishing without images.
//   return listings;
// }
// async function buildPayload(params: StartParams, selectedItems: GeneratedItem[], uploadImage?: (file: File) => Promise<string>): Promise<AutomationPayload> {
//   // Destructure 'category' but do not use it
//   const { sites, defaults: {  keywordsDefaults, imageUrl, imageFile, profile } } = params;
  
//   if (!Array.isArray(sites) || sites.length === 0) throw new Error("No sites selected.");
//   if (sites.some((s) => !s.site || !s.username || !s.password)) throw new Error("Every selected site must have site + username + password.");
//   if (selectedItems.length === 0) throw new Error("No items selected.");
//   if (sites.length !== selectedItems.length) throw new Error(`Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`);
  
//   const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile, uploadImage);
  
//   // Removed category from params passed to buildListings
//   const listings = await buildListingsForSelected(selectedItems, { keywordsDefaults, defaultImageUrl }, uploadImage);
  
//   const targets: AutomationTargetSite[] = sites.map((s, idx) => ({ site: s.site, login: { username: s.username, password: s.password }, type: (s as any).type ?? "wordpress", listings: [listings[idx]] }));
//   const payload: AutomationPayload = { profile, targets };
//   return payload;
// }

// /* ===== Hook implementation (Updated - Optimized & Fault Tolerant) ===== */
// import { useState, useMemo, useEffect, useRef } from 'react';
// import * as XLSX from 'xlsx';  // Assume installed: npm i xlsx

// export function useListingAutomation(allItems: GeneratedItem[], opts: UseListingAutomationOptions = {}) {
//   const {
//     uploadImage,
//     maxSelectableItems = Infinity,
//     onMaxExceeded,
//     debug = false,
//     onRunUpdate,
//   } = opts;

//   /* Group by project */
//   const projects: Project[] = useMemo(() => {
//     const map = new Map<string, GeneratedItem[]>();
//     for (const it of allItems) {
//       const key = it.fileId ?? "__misc__";
//       if (!map.has(key)) map.set(key, []);
//       map.get(key)!.push(it);
//     }
//     return Array.from(map.entries()).map(([pid, arr]) => ({ id: pid, name: arr[0]?.fileName || pid || "Untitled Project", items: arr }));
//   }, [allItems]);

//   /* Search */
//   const [search, setSearch] = useState("");
//   const filteredProjects: Project[] = useMemo(() => {
//     const q = search.toLowerCase().trim();
//     if (!q) return projects;
//     return projects.map(p => ({ ...p, items: p.items.filter(it => `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase().includes(q)) })).filter(p => p.items.length > 0);
//   }, [projects, search]);

//   /* Selection / expansion (unchanged) */
//   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
//   const toggleProjectExpand = (pid: string) => { setExpandedProjectIds(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n; }); };
//   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
//   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
//   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
//   const isItemSelected = (iid: string) => selectedItemIds.has(iid);
//   const setProjectChecked = (pid: string, checked: boolean) => {
//     const proj = projects.find(p => p.id === pid); if (!proj) return;
//     if (!checked) {
//       setSelectedProjectIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
//       setSelectedItemIds(prev => { const n = new Set(prev); for (const it of proj.items) n.delete(it.id); return n; });
//       return;
//     }
//     setSelectedItemIds(prev => {
//       const n = new Set(prev); let added = 0;
//       for (const it of proj.items) { if (n.size >= maxSelectableItems) break; if (!n.has(it.id)) { n.add(it.id); added++; } }
//       if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
//       return n;
//     });
//     setSelectedProjectIds(prev => { const n = new Set(prev); const after = new Set(selectedItemIds); for (const it of proj.items) { if (after.size >= maxSelectableItems) break; after.add(it.id); } const allSelectedNow = proj.items.every(it => after.has(it.id)); if (allSelectedNow) n.add(pid); return n; });
//   };
//   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
//     const proj = projects.find(p => p.id === pid);
//     setSelectedItemIds(prev => { const n = new Set(prev); if (checked) { if (n.size >= maxSelectableItems && !n.has(iid)) { onMaxExceeded?.(maxSelectableItems); return prev; } n.add(iid); } else { n.delete(iid); } return n; });
//     if (proj) {
//       const after = new Set(selectedItemIds);
//       checked ? after.add(iid) : after.delete(iid);
//       const allSelected = proj.items.every(it => after.has(it.id));
//       const noneSelected = proj.items.every(it => !after.has(it.id));
//       setSelectedProjectIds(prev => { const n = new Set(prev); if (allSelected) n.add(pid); else if (noneSelected) n.delete(pid); return n; });
//     }
//   };
//   const clearSelection = () => { setSelectedProjectIds(new Set()); setSelectedItemIds(new Set()); };
//   const selectAllVisible = () => {
//     const all = new Set<string>(); for (const p of filteredProjects) { for (const it of p.items) { if (all.size >= maxSelectableItems) break; all.add(it.id); } if (all.size >= maxSelectableItems) break; }
//     setSelectedItemIds(all);
//     const projIds = new Set<string>(); for (const p of filteredProjects) { const allInProj = p.items.every(it => all.has(it.id)); if (allInProj) projIds.add(p.id); }
//     setSelectedProjectIds(projIds);
//     if (filteredProjects.flatMap(p => p.items).length > maxSelectableItems) onMaxExceeded?.(maxSelectableItems);
//   };

//   /* Focused preview */
//   const [focusedItemId, setFocusedItemId] = useState<string>("");
//   const focusedItem = useMemo(() => allItems.find(x => x.id === focusedItemId), [allItems, focusedItemId]);
//   const selectedItems = useMemo(() => allItems.filter(it => selectedItemIds.has(it.id)), [allItems, selectedItemIds]);

//   /* ===== Job runs state (client-side) ===== */
//   const [isStarting, setIsStarting] = useState(false);
//   const [currentJobId, setCurrentJobId] = useState<string | null>(null);
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
//   const [runs, setRuns] = useState<JobRun[]>([]);
//   const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
//   // const pollStartTime = useRef<number>(0);
//   function cancelPolling() { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; } }
//   function upsertRun(run: JobRun) {
//     setRuns(prev => {
//       const idx = prev.findIndex(r => r.jobId === run.jobId);
//       if (idx === -1) return [run, ...prev];
//       const copy = [...prev]; copy[idx] = { ...copy[idx], ...run }; copy.sort((a,b) => (b.startedAt||0) - (a.startedAt||0)); return copy;
//     });
//     onRunUpdate?.(run);
//   }

//   /* ===== Start (Optimized + Concurrency + Fault Tolerant) ===== */
//   async function start(params: StartParams): Promise<{ jobId: string | null; listings: number; payload: AutomationPayload }> {
//     setIsStarting(true);
//     setStatus("idle");
//     setProgress(0);
//     setCurrentJobId(null);
//     cancelPolling();
//     try {
//       const selectedItemsLocal = selectedItems;  // Use memoized
//       const payload = await buildPayload(params, selectedItemsLocal, uploadImage);
//       const listingsCount = payload.targets.length;
//       if (debug) console.log("Starting direct WP automation with payload:", payload);
//       if (params.dryRun) return { jobId: null, listings: listingsCount, payload };

//       const jobId = Date.now().toString();
//       const now = Date.now();
//       const optimisticRun: JobRun = { jobId, status: "running", progress: 0, startedAt: now, backlinks: [], successCount: 0, failCount: 0, logs: [] };
//       upsertRun(optimisticRun);
//       setCurrentJobId(jobId);
//       setStatus("running");

//       const total = payload.targets.length;
//       let successCount = 0;
//       let failCount = 0;
//       let completedCount = 0;
//       const newBacklinks: string[] = [];
//       const newLogs: string[] = [];

//       // CONFIGURATION: Number of simultaneous requests
//       const CONCURRENCY_LIMIT = 5; 

//       // WORKER FUNCTION: Processes one target safely
//       const processTarget = async (target: AutomationTargetSite) => {
//         try {
//           // Pass only necessary args (Category removed from logic)
//           const postUrl = await createPostOnSite(target.site, target.login, target.listings[0]);
//           newBacklinks.push(postUrl);
//           newLogs.push(`Success on ${target.site}: ${postUrl}`);
//           successCount++;
//         } catch (e: any) {
//           // ERROR ISOLATION: Catch here so other threads don't die
//           newLogs.push(`Failed on ${target.site}: ${e.message}`);
//           failCount++;
//         } finally {
//           completedCount++;
//           // Update Progress Live
//           const prog = Math.round((completedCount / total) * 100);
//           setProgress(prog);
//           upsertRun({ 
//             ...optimisticRun, 
//             progress: prog, 
//             logs: [...newLogs], // clone to trigger update
//             successCount, 
//             failCount, 
//             backlinks: [...newBacklinks] 
//           });
//         }
//       };

//       // CONCURRENCY QUEUE EXECUTION
//       let index = 0;
//       const targets = payload.targets;
      
//       const next = async (): Promise<void> => {
//         while (index < total) {
//           const currTarget = targets[index++];
//           if(!currTarget) break;
//           await processTarget(currTarget);
//         }
//       };

//       // Start initial pool of workers
//       const workers = [];
//       for(let i = 0; i < Math.min(CONCURRENCY_LIMIT, total); i++) {
//         workers.push(next());
//       }
      
//       // Wait for all workers to finish all tasks
//       await Promise.all(workers);

//       // Finalize
//       const finalStatus: "done" | "error" = failCount === 0 ? "done" : (failCount < total ? "done" : "error");
//       const finalRun = { ...optimisticRun, status: finalStatus, finishedAt: Date.now(), progress: 100, logs: newLogs, successCount, failCount, backlinks: newBacklinks };
//       upsertRun(finalRun);
//       setStatus(finalStatus);
//       setProgress(100);

//       return { jobId, listings: listingsCount, payload };
//     } catch (err: any) {
//         console.error("Critical Failure in start:", err);
//         setStatus("error");
//         throw err;
//     } finally {
//       setIsStarting(false);
//     }
//   }

//   useEffect(() => cancelPolling, []);

//   /* Helper: fetch a saved run by id (noop now) */
//   async function fetchRunDetails() { /* Client-side only */ return null; }

//   /* Helper: download export (client-side XLSX) */
//   async function downloadRunExcel(jobId: string | null, filename = "automation_run.xlsx") {
//     if (!jobId) throw new Error("Missing jobId");
//     const run = runs.find(r => r.jobId === jobId);
//     if (!run?.backlinks?.length) throw new Error("No backlinks to export");

//     const wsData = [['SiteName', 'Post URL']];
//     run.backlinks.forEach(link => {
//       const hostname = new URL(link).hostname.replace('www.', '');
//       wsData.push([hostname, link]);
//     });

//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.aoa_to_sheet(wsData);
//     XLSX.utils.book_append_sheet(wb, ws, 'Backlinks');
//     XLSX.writeFile(wb, filename);
//     return true;
//   }

//   /* Exposed API */
//   return {
//     search,
//     setSearch,
//     projects,
//     filteredProjects,
//     expandedProjectIds,
//     toggleProjectExpand,
//     selectedProjectIds,
//     selectedItemIds,
//     isProjectSelected,
//     isItemSelected,
//     setProjectChecked,
//     setItemChecked,
//     selectAllVisible,
//     clearSelection,
//     focusedItemId,
//     setFocusedItemId,
//     focusedItem,
//     selectedItems,
//     start,
//     cancelPolling,
//     isStarting,
//     jobId: currentJobId,
//     progress,
//     status,
//     runs,
//     fetchRunDetails,
//     downloadRunExcel,
//   };
// } 




/* ===== Types (match your page) ===== */
export type GeneratedItem = {
  id: string;
  keyword?: string | string[];
  title?: string;
  html?: string;
  generatedContent?: string;
  images?: string[];
  fileId?: string;
  fileName?: string;
  createdAt?: number | string;
};
export type Address = { country: string; state: string; city: string; zip: string; line1: string };
export type Socials = { facebook?: string; twitter?: string; linkedin?: string; pinterest?: string; instagram?: string; yelp?: string; gmb?: string };
export type AutomationListing = { id: string; title: string; contentHtml: string; images: string[]; keywords: string[]; tags?: string[]; category?: string };
export type AutomationTargetSite = { site: string; login: { username: string; password: string }; type?: string; listings: AutomationListing[] };
export type AutomationPayload = { profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address }; targets: AutomationTargetSite[] };
export type UseListingAutomationOptions = {
  uploadImage?: (file: File) => Promise<string>;
  statusPollIntervalMs?: number;
  maxPollMinutes?: number;
  maxSelectableItems?: number;
  onMaxExceeded?: (max: number) => void;
  debug?: boolean;
  /** Optional callback to receive live run updates */
  onRunUpdate?: (run: JobRun) => void;
};
export type StartParams = {
  sites: { site: string; username: string; password: string; type?: string }[];
  defaults: { category?: string; keywordsDefaults?: string[]; imageUrl?: string; imageFile?: File | null; profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address } };
  dryRun?: boolean;
};
export type Project = { id: string; name: string; items: GeneratedItem[] };
/* Job run shape (client-side managed) */
export type JobRun = {
  jobId: string | null;
  status: "queued" | "running" | "done" | "error" | "idle";
  progress: number;
  startedAt?: number;
  finishedAt?: number | null;
  backlinks?: string[]; // accumulated as they arrive
  successCount?: number;
  failCount?: number;
  logs?: string[];
  error?: string | null;
};

/* Small local helpers (reused) */
function getItemTitle(it: GeneratedItem) { return it.title ?? ""; }
function getItemHtml(it: GeneratedItem) { return (it.html ?? it.generatedContent ?? "").toString(); }
function getItemKeywords(it: GeneratedItem): string[] { if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean); if (typeof it.keyword === "string") return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean); return []; }

/* ===== Image helpers (copied / compatible) ===== */
function isBlobOrDataUrl(u: string) { return /^blob:|^data:/i.test(u); }
function isHttpUrl(u: string) { return /^https?:\/\//i.test(u); }
function looksLikeDirectImage(u: string) { return /\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(u); }
function assertValidImageUrl(u: string, ctx: string) {
  if (!u) throw new Error(`Missing image URL (${ctx}).`);
  if (isBlobOrDataUrl(u)) throw new Error(`Invalid image URL (${ctx}): ${u} — blob/data URLs are not supported. Upload first.`);
  if (isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Image URL is not a direct file (${ctx}): ${u}`);
  if (!isHttpUrl(u) && !looksLikeDirectImage(u)) throw new Error(`Invalid image URL (${ctx}): ${u}`);
}

/* ===== WP API Helpers (New - Direct Calls) ===== */
async function getOrCreateTerm(termsUrl: string, taxonomy: 'category' | 'post_tag', name: string, authHeader: string): Promise<number> {
  const searchUrl = `${termsUrl}?search=${encodeURIComponent(name)}&per_page=1`;
  let res = await fetch(searchUrl, { headers: { Authorization: authHeader } });
  if (!res.ok) throw new Error(`Failed to search terms: ${res.status}`);
  let terms = await res.json();
  if (terms.length > 0) return terms[0].id;

  // Create
  res = await fetch(termsUrl, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, taxonomy }),
  });
  if (!res.ok) throw new Error(`Failed to create term: ${res.status}`);
  const term = await res.json();
  return term.id;
}

async function uploadMedia(mediaUrl: string, imageUrl: string, authHeader: string): Promise<number> {
  let blob: Blob;
  if (isHttpUrl(imageUrl)) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
    blob = await imgRes.blob();
  } else {
    throw new Error(`Unsupported image URL: ${imageUrl}`);
  }

  const fd = new FormData();
  fd.append('file', blob, `featured-${Date.now()}.jpg`);

  const res = await fetch(mediaUrl, {
    method: 'POST',
    headers: { Authorization: authHeader },
    body: fd,
  });
  if (!res.ok) throw new Error(`Media upload failed: ${res.status}`);
  const media = await res.json();
  return media.id;
}

async function createPostOnSite(site: string, login: { username: string; password: string }, listing: AutomationListing): Promise<string> {
  const apiUrl = `https://${site}/wp-json/wp/v2/posts`;
  const mediaUrl = apiUrl.replace('/posts', '/media');
  const tagsUrl = apiUrl.replace('/posts', '/tags');
  const categoriesUrl = apiUrl.replace('/posts', '/categories');
  const auth = btoa(`${login.username}:${login.password}`);
  const authHeader = `Basic ${auth}`;
  const headers = { Authorization: authHeader, 'Content-Type': 'application/json' };

  // Resolve tag IDs
  const tagIds = await Promise.all(
    (listing.keywords || []).map(kw => getOrCreateTerm(tagsUrl, 'post_tag', kw, authHeader))
  );

  // Resolve category ID if provided
  let categoryIds: number[] = [];
  if (listing.category && listing.category.trim()) {
    try {
      const cid = await getOrCreateTerm(categoriesUrl, 'category', listing.category.trim(), authHeader);
      if (cid) categoryIds = [cid];
    } catch (e: any) {
      // Non-fatal: warn and continue without category (but we expect category to be provided upstream)
      console.warn(`Category resolution failed for ${site}: ${e?.message || e}`);
    }
  }

  // === JUSTIFY CONTENT ===
  const justifiedContent = `<div style="text-align: justify;">${listing.contentHtml}</div>`;

  // Create post
  const postData: any = {
    title: listing.title,
    content: justifiedContent,
    status: 'publish',
    tags: tagIds,
  };
  if (categoryIds.length) postData.categories = categoryIds;

  let res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(postData) });
  if (!res.ok) throw new Error(`Post creation failed: ${res.status}`);
  let post = await res.json();

  // Upload and set featured image if available (non-fatal)
  if (listing.images && listing.images.length > 0) {
    const imgUrl = listing.images[0];
    try {
      assertValidImageUrl(imgUrl, `featured for ${site}`);
      const mediaId = await uploadMedia(mediaUrl, imgUrl, authHeader);
      res = await fetch(`${apiUrl}/${post.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ featured_media: mediaId }),
      });
      if (!res.ok) {
        console.warn(`Featured image update failed for ${site}: ${res.status}`);
      } else {
        post = await res.json();
      }
    } catch (e: any) {
      console.warn(`Featured image for ${site} skipped due to: ${e?.message || e}`);
    }
  }

  return post.link;
}

/* ===== Image upload helpers (for defaults) ===== */
async function autoUploadImage(file: File, uploadImage?: (file: File) => Promise<string>): Promise<string> {
  if (uploadImage) {
    const u = await uploadImage(file);
    if (u && !isBlobOrDataUrl(u)) { assertValidImageUrl(u, "uploadImage()"); return u; }
  }
  throw new Error("Image upload not implemented. Provide uploadImage callback.");
}

function extFromMime(mime: string) { if (/png/i.test(mime)) return "png"; if (/webp/i.test(mime)) return "webp"; if (/gif/i.test(mime)) return "gif"; return "jpg"; }
async function ensurePublicImageUrl(u: string, ctx: string, uploadImage?: (file: File) => Promise<string>): Promise<string> {
  if (!u) throw new Error(`Missing image URL (${ctx}).`);
  if (isHttpUrl(u)) { assertValidImageUrl(u, ctx); return u; }
  if (!isBlobOrDataUrl(u) && looksLikeDirectImage(u)) { assertValidImageUrl(u, ctx); return u; }
  if (isBlobOrDataUrl(u)) {
    let blob: Blob; try { const r = await fetch(u); blob = await r.blob(); } catch (e: any) { throw new Error(`Cannot read local image (${ctx}). Please re-select image. ${e?.message || e}`); }
    const mime = blob.type || "image/jpeg"; const ext = extFromMime(mime); const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime }); const publicUrl = await autoUploadImage(file, uploadImage); assertValidImageUrl(publicUrl, ctx); return publicUrl;
  }
  assertValidImageUrl(u, ctx);
  return u;
}

/* ===== Build listings & payload (category mandatory, image optional) ===== */
async function resolveDefaultImageUrl(imageUrl?: string, imageFile?: File | null, uploadImage?: (file: File) => Promise<string>) {
  if (imageUrl?.trim()) return await ensurePublicImageUrl(imageUrl.trim(), "defaultImageUrl", uploadImage);
  if (imageFile) { const u = await autoUploadImage(imageFile, uploadImage); assertValidImageUrl(u, "uploadedDefaultImageUrl"); return u; }
  return "";
}
async function buildListingsForSelected(selectedItems: GeneratedItem[], params: { keywordsDefaults?: string[]; defaultImageUrl?: string; defaultCategory?: string }, uploadImage?: (file: File) => Promise<string>): Promise<AutomationListing[]> {
  const { keywordsDefaults = [], defaultImageUrl = "", defaultCategory = "" } = params;
  const listings: AutomationListing[] = [];
  for (const it of selectedItems) {
    const ownKeywords = getItemKeywords(it);
    const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
    const rawImgs = (it.images || []).filter(Boolean) as string[];
    const publicImgs: string[] = [];
    for (let i = 0; i < rawImgs.length; i++) {
      const img = rawImgs[i];
      // ensurePublicImageUrl may throw for invalid image urls — keep that behavior for invalid urls
      const pub = await ensurePublicImageUrl(img, `item(${it.id}).images[${i}]`, uploadImage);
      publicImgs.push(pub);
    }
    const images = publicImgs.length > 0 ? publicImgs : (defaultImageUrl ? [defaultImageUrl] : []);
    listings.push({
      id: it.id,
      title: getItemTitle(it),
      contentHtml: getItemHtml(it),
      images,
      keywords: mergedKeywords,
      tags: mergedKeywords,
      category: defaultCategory || undefined
    });
  }
  const bad = listings.filter(l => !l.title || !l.contentHtml);
  if (bad.length) throw new Error(`Some items missing title/content: ${bad.map(b => b.id).join(", ")}`);

  // Images are optional — do not throw when images are missing.
  return listings;
}
async function buildPayload(params: StartParams, selectedItems: GeneratedItem[], uploadImage?: (file: File) => Promise<string>): Promise<AutomationPayload> {
  const { sites, defaults: { keywordsDefaults, imageUrl, imageFile, profile, category } } = params;
  
  if (!Array.isArray(sites) || sites.length === 0) throw new Error("No sites selected.");
  if (sites.some((s) => !s.site || !s.username || !s.password)) throw new Error("Every selected site must have site + username + password.");
  if (selectedItems.length === 0) throw new Error("No items selected.");
  if (sites.length !== selectedItems.length) throw new Error(`Sites (${sites.length}) and items (${selectedItems.length}) must be equal.`);

  const defaultCategory = (category ?? "").toString().trim();
  if (!defaultCategory) throw new Error("Category is required. Please choose a category before publishing.");

  const defaultImageUrl = await resolveDefaultImageUrl(imageUrl, imageFile, uploadImage);

  const listings = await buildListingsForSelected(selectedItems, { keywordsDefaults, defaultImageUrl, defaultCategory }, uploadImage);
  
  const targets: AutomationTargetSite[] = sites.map((s, idx) => ({ site: s.site, login: { username: s.username, password: s.password }, type: (s as any).type ?? "wordpress", listings: [listings[idx]] }));
  const payload: AutomationPayload = { profile, targets };
  return payload;
}

/* ===== Hook implementation (Updated - Optimized & Fault Tolerant) ===== */
import { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';  // Assume installed: npm i xlsx

export function useListingAutomation(allItems: GeneratedItem[], opts: UseListingAutomationOptions = {}) {
  const {
    uploadImage,
    maxSelectableItems = Infinity,
    onMaxExceeded,
    debug = false,
    onRunUpdate,
  } = opts;

  /* Group by project */
  const projects: Project[] = useMemo(() => {
    const map = new Map<string, GeneratedItem[]>();
    for (const it of allItems) {
      const key = it.fileId ?? "__misc__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return Array.from(map.entries()).map(([pid, arr]) => ({ id: pid, name: arr[0]?.fileName || pid || "Untitled Project", items: arr }));
  }, [allItems]);

  /* Search */
  const [search, setSearch] = useState("");
  const filteredProjects: Project[] = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return projects;
    return projects.map(p => ({ ...p, items: p.items.filter(it => `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase().includes(q)) })).filter(p => p.items.length > 0);
  }, [projects, search]);

  /* Selection / expansion (unchanged) */
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
  const toggleProjectExpand = (pid: string) => { setExpandedProjectIds(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n; }); };
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
  const isItemSelected = (iid: string) => selectedItemIds.has(iid);
  const setProjectChecked = (pid: string, checked: boolean) => {
    const proj = projects.find(p => p.id === pid); if (!proj) return;
    if (!checked) {
      setSelectedProjectIds(prev => { const n = new Set(prev); n.delete(pid); return n; });
      setSelectedItemIds(prev => { const n = new Set(prev); for (const it of proj.items) n.delete(it.id); return n; });
      return;
    }
    setSelectedItemIds(prev => {
      const n = new Set(prev); let added = 0;
      for (const it of proj.items) { if (n.size >= maxSelectableItems) break; if (!n.has(it.id)) { n.add(it.id); added++; } }
      if (added === 0 && proj.items.length) onMaxExceeded?.(maxSelectableItems);
      return n;
    });
    setSelectedProjectIds(prev => { const n = new Set(prev); const after = new Set(selectedItemIds); for (const it of proj.items) { if (after.size >= maxSelectableItems) break; after.add(it.id); } const allSelectedNow = proj.items.every(it => after.has(it.id)); if (allSelectedNow) n.add(pid); return n; });
  };
  const setItemChecked = (pid: string, iid: string, checked: boolean) => {
    const proj = projects.find(p => p.id === pid);
    setSelectedItemIds(prev => { const n = new Set(prev); if (checked) { if (n.size >= maxSelectableItems && !n.has(iid)) { onMaxExceeded?.(maxSelectableItems); return prev; } n.add(iid); } else { n.delete(iid); } return n; });
    if (proj) {
      const after = new Set(selectedItemIds);
      checked ? after.add(iid) : after.delete(iid);
      const allSelected = proj.items.every(it => after.has(it.id));
      const noneSelected = proj.items.every(it => !after.has(it.id));
      setSelectedProjectIds(prev => { const n = new Set(prev); if (allSelected) n.add(pid); else if (noneSelected) n.delete(pid); return n; });
    }
  };
  const clearSelection = () => { setSelectedProjectIds(new Set()); setSelectedItemIds(new Set()); };
  const selectAllVisible = () => {
    const all = new Set<string>(); for (const p of filteredProjects) { for (const it of p.items) { if (all.size >= maxSelectableItems) break; all.add(it.id); } if (all.size >= maxSelectableItems) break; }
    setSelectedItemIds(all);
    const projIds = new Set<string>(); for (const p of filteredProjects) { const allInProj = p.items.every(it => all.has(it.id)); if (allInProj) projIds.add(p.id); }
    setSelectedProjectIds(projIds);
    if (filteredProjects.flatMap(p => p.items).length > maxSelectableItems) onMaxExceeded?.(maxSelectableItems);
  };

  /* Focused preview */
  const [focusedItemId, setFocusedItemId] = useState<string>("");
  const focusedItem = useMemo(() => allItems.find(x => x.id === focusedItemId), [allItems, focusedItemId]);
  const selectedItems = useMemo(() => allItems.filter(it => selectedItemIds.has(it.id)), [allItems, selectedItemIds]);

  /* ===== Job runs state (client-side) ===== */
  const [isStarting, setIsStarting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [runs, setRuns] = useState<JobRun[]>([]);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  function cancelPolling() { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; } }
  function upsertRun(run: JobRun) {
    setRuns(prev => {
      const idx = prev.findIndex(r => r.jobId === run.jobId);
      if (idx === -1) return [run, ...prev];
      const copy = [...prev]; copy[idx] = { ...copy[idx], ...run }; copy.sort((a,b) => (b.startedAt||0) - (a.startedAt||0)); return copy;
    });
    onRunUpdate?.(run);
  }

  /* ===== Start (Optimized + Concurrency + Fault Tolerant) ===== */
  async function start(params: StartParams): Promise<{ jobId: string | null; listings: number; payload: AutomationPayload }> {
    setIsStarting(true);
    setStatus("idle");
    setProgress(0);
    setCurrentJobId(null);
    cancelPolling();
    try {
      const selectedItemsLocal = selectedItems;  // Use memoized
      const payload = await buildPayload(params, selectedItemsLocal, uploadImage);
      const listingsCount = payload.targets.length;
      if (debug) console.log("Starting direct WP automation with payload:", payload);
      if (params.dryRun) return { jobId: null, listings: listingsCount, payload };

      const jobId = Date.now().toString();
      const now = Date.now();
      const optimisticRun: JobRun = { jobId, status: "running", progress: 0, startedAt: now, backlinks: [], successCount: 0, failCount: 0, logs: [] };
      upsertRun(optimisticRun);
      setCurrentJobId(jobId);
      setStatus("running");

      const total = payload.targets.length;
      let successCount = 0;
      let failCount = 0;
      let completedCount = 0;
      const newBacklinks: string[] = [];
      const newLogs: string[] = [];

      // CONFIGURATION: Number of simultaneous requests
      const CONCURRENCY_LIMIT = 5; 

      // WORKER FUNCTION: Processes one target safely
      const processTarget = async (target: AutomationTargetSite) => {
        try {
          const postUrl = await createPostOnSite(target.site, target.login, target.listings[0]);
          newBacklinks.push(postUrl);
          newLogs.push(`Success on ${target.site}: ${postUrl}`);
          successCount++;
        } catch (e: any) {
          newLogs.push(`Failed on ${target.site}: ${e?.message ?? e}`);
          failCount++;
        } finally {
          completedCount++;
          const prog = Math.round((completedCount / total) * 100);
          setProgress(prog);
          upsertRun({ 
            ...optimisticRun, 
            progress: prog, 
            logs: [...newLogs], 
            successCount, 
            failCount, 
            backlinks: [...newBacklinks] 
          });
        }
      };

      // CONCURRENCY QUEUE EXECUTION
      let index = 0;
      const targets = payload.targets;
      
      const next = async (): Promise<void> => {
        while (index < total) {
          const currTarget = targets[index++];
          if(!currTarget) break;
          await processTarget(currTarget);
        }
      };

      const workers = [];
      for(let i = 0; i < Math.min(CONCURRENCY_LIMIT, total); i++) {
        workers.push(next());
      }
      
      await Promise.all(workers);

      const finalStatus: "done" | "error" = failCount === 0 ? "done" : (failCount < total ? "done" : "error");
      const finalRun = { ...optimisticRun, status: finalStatus, finishedAt: Date.now(), progress: 100, logs: newLogs, successCount, failCount, backlinks: newBacklinks };
      upsertRun(finalRun);
      setStatus(finalStatus);
      setProgress(100);

      return { jobId, listings: listingsCount, payload };
    } catch (err: any) {
        console.error("Critical Failure in start:", err);
        setStatus("error");
        throw err;
    } finally {
      setIsStarting(false);
    }
  }

  useEffect(() => cancelPolling, []);

  /* Helper: fetch a saved run by id (noop now) */
  async function fetchRunDetails() { return null; }

  /* Helper: download export (client-side XLSX) */
  async function downloadRunExcel(jobId: string | null, filename = "automation_run.xlsx") {
    if (!jobId) throw new Error("Missing jobId");
    const run = runs.find(r => r.jobId === jobId);
    if (!run?.backlinks?.length) throw new Error("No backlinks to export");

    const wsData = [['SiteName', 'Post URL']];
    run.backlinks.forEach(link => {
      const hostname = new URL(link).hostname.replace('www.', '');
      wsData.push([hostname, link]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Backlinks');
    XLSX.writeFile(wb, filename);
    return true;
  }

  /* Exposed API */
  return {
    search,
    setSearch,
    projects,
    filteredProjects,
    expandedProjectIds,
    toggleProjectExpand,
    selectedProjectIds,
    selectedItemIds,
    isProjectSelected,
    isItemSelected,
    setProjectChecked,
    setItemChecked,
    selectAllVisible,
    clearSelection,
    focusedItemId,
    setFocusedItemId,
    focusedItem,
    selectedItems,
    start,
    cancelPolling,
    isStarting,
    jobId: currentJobId,
    progress,
    status,
    runs,
    fetchRunDetails,
    downloadRunExcel,
  };
} 