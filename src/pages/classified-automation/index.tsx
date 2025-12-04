// // // // // // /pages/classified-automation/index.tsx
// // // // // import React, { useEffect, useMemo, useRef, useState } from "react";
// // // // // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // // // // import { Button } from "@/components/ui/button";
// // // // // import { Badge } from "@/components/ui/badge";
// // // // // import { Input } from "@/components/ui/input";
// // // // // import { Label } from "@/components/ui/label";
// // // // // import { Textarea } from "@/components/ui/textarea";
// // // // // import { Separator } from "@/components/ui/separator";
// // // // // import { Progress } from "@/components/ui/progress";
// // // // // import { toast } from "sonner";
// // // // // import { cn } from "@/lib/utils";

// // // // // // If you have shadcn Select in your design system, use it:
// // // // // import {
// // // // //   Select,
// // // // //   SelectContent,
// // // // //   SelectItem,
// // // // //   SelectTrigger,
// // // // //   SelectValue,
// // // // // } from "@/components/ui/select";

// // // // // import {
// // // // //   IconWorld,
// // // // //   IconListDetails,
// // // // //   IconPlayerPlay,
// // // // //   IconSparkles,
// // // // //   IconAddressBook,
// // // // //   IconTags,
// // // // //   IconKey,
// // // // //   IconMap2,
// // // // //   IconPhoto,
// // // // //   IconWorldWww,
// // // // //   IconAt,
// // // // //   IconBrandFacebook,
// // // // //   IconBrandTwitter,
// // // // //   IconBrandLinkedin,
// // // // //   IconBrandPinterest,
// // // // //   IconBrandInstagram,
// // // // //   IconBrandCpp,
// // // // //   IconBrandGoogle,
// // // // // } from "@tabler/icons-react";

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Types
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // type GeneratedItem = {
// // // // //   id: string;
// // // // //   keyword?: string | string[];
// // // // //   title?: string;
// // // // //   html?: string;               // your system sometimes stores as html
// // // // //   generatedContent?: string;   // ...or as generatedContent
// // // // //   images?: string[];
// // // // //   fileId?: string;
// // // // //   createdAt?: number | string;
// // // // // };

// // // // // type Address = {
// // // // //   country: string;
// // // // //   state: string;
// // // // //   city: string;
// // // // //   zip: string;
// // // // //   line1: string;
// // // // // };

// // // // // type Socials = {
// // // // //   facebook?: string;
// // // // //   twitter?: string;
// // // // //   linkedin?: string;
// // // // //   pinterest?: string;
// // // // //   instagram?: string;
// // // // //   yelp?: string;
// // // // //   gmb?: string; // Google Business Profile
// // // // // };

// // // // // type AutomationPayload = {
// // // // //   site: string;
// // // // //   login: { username: string; password: string };
// // // // //   profile: {
// // // // //     phone?: string;
// // // // //     website?: string;
// // // // //     email?: string;
// // // // //     socials?: Socials;
// // // // //     address?: Address;
// // // // //   };
// // // // //   listings: Array<{
// // // // //     id: string;
// // // // //     title: string;
// // // // //     contentHtml: string;
// // // // //     images: string[]; // final URLs
// // // // //     keywords: string[];
// // // // //     category?: string;
// // // // //   }>;
// // // // // };

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Constants
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // const CATEGORIES = [
// // // // //   "Electronics",
// // // // //   "Home & Garden",
// // // // //   "Vehicles",
// // // // //   "Jobs",
// // // // //   "Services",
// // // // //   "Real Estate",
// // // // //   "Pets",
// // // // //   "Books",
// // // // //   "Fashion",
// // // // //   "Sports",
// // // // // ];

// // // // // const SITES = [
// // // // //   { value: "site-1.com", label: "Site 1" },
// // // // //   { value: "site-2.com", label: "Site 2" },
// // // // //   { value: "site-3.com", label: "Site 3" },
// // // // // ];

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Helpers: load generated items from your existing store
// // // // //  * (Best-effort: localStorage / session fallback)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function loadGeneratedItems(): GeneratedItem[] {
// // // // //   const keys = [
// // // // //     "content_items_v1",
// // // // //     "content-items",
// // // // //     "seomatic_content_items",
// // // // //   ];
// // // // //   for (const k of keys) {
// // // // //     try {
// // // // //       const raw = localStorage.getItem(k);
// // // // //       if (raw) {
// // // // //         const arr = JSON.parse(raw);
// // // // //         if (Array.isArray(arr)) return arr;
// // // // //       }
// // // // //     } catch {}
// // // // //   }
// // // // //   // Single open item fallback (from your editor code)
// // // // //   try {
// // // // //     const raw =
// // // // //       sessionStorage.getItem("open-content-item_v1") ??
// // // // //       localStorage.getItem("open-content-item_v1_fallback");
// // // // //     if (raw) {
// // // // //       const it = JSON.parse(raw);
// // // // //       if (it && typeof it === "object") return [it];
// // // // //     }
// // // // //   } catch {}
// // // // //   return [];
// // // // // }

// // // // // function getItemTitle(it: GeneratedItem) {
// // // // //   return it.title ?? "";
// // // // // }
// // // // // function getItemHtml(it: GeneratedItem) {
// // // // //   return (it.html ?? it.generatedContent ?? "").toString();
// // // // // }
// // // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // // //   if (typeof it.keyword === "string") {
// // // // //     return it.keyword
// // // // //       .split(/[,\|]/)
// // // // //       .map((s) => s.trim())
// // // // //       .filter(Boolean);
// // // // //   }
// // // // //   return [];
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Tiny component: Gradient frame (matches your vibe)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function GradientFrame({ children }: { children: React.ReactNode }) {
// // // // //   return (
// // // // //     <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-gray-200 via-green-200/40 to-orange-200/40">
// // // // //       <div className="relative rounded-3xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
// // // // //         {children}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Tags Input (keywords)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function TagsInput({
// // // // //   value,
// // // // //   onChange,
// // // // //   placeholder = "Type keyword and press Enter",
// // // // // }: {
// // // // //   value: string[];
// // // // //   onChange: (tags: string[]) => void;
// // // // //   placeholder?: string;
// // // // // }) {
// // // // //   const [draft, setDraft] = useState("");

// // // // //   function addTagFromDraft() {
// // // // //     const parts = draft
// // // // //       .split(/[,\n]/)
// // // // //       .map((s) => s.trim())
// // // // //       .filter(Boolean);
// // // // //     if (parts.length) {
// // // // //       const set = new Set([...value, ...parts]);
// // // // //       onChange(Array.from(set));
// // // // //       setDraft("");
// // // // //     }
// // // // //   }

// // // // //   return (
// // // // //     <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
// // // // //       <div className="flex flex-wrap gap-2 mb-2">
// // // // //         {value.map((t) => (
// // // // //           <span
// // // // //             key={t}
// // // // //             className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs"
// // // // //           >
// // // // //             <IconTags className="h-3 w-3" />
// // // // //             {t}
// // // // //             <button
// // // // //               onClick={() => onChange(value.filter((x) => x !== t))}
// // // // //               className="ml-1 text-emerald-700 hover:text-emerald-900"
// // // // //               aria-label={`Remove ${t}`}
// // // // //             >
// // // // //               ×
// // // // //             </button>
// // // // //           </span>
// // // // //         ))}
// // // // //       </div>
// // // // //       <Input
// // // // //         value={draft}
// // // // //         onChange={(e) => setDraft(e.target.value)}
// // // // //         onKeyDown={(e) => {
// // // // //           if (e.key === "Enter") {
// // // // //             e.preventDefault();
// // // // //             addTagFromDraft();
// // // // //           }
// // // // //           if (e.key === "Backspace" && !draft && value.length) {
// // // // //             onChange(value.slice(0, -1));
// // // // //           }
// // // // //         }}
// // // // //         placeholder={placeholder}
// // // // //         className="bg-white"
// // // // //       />
// // // // //       <p className="text-xs text-gray-500 mt-1">Use Enter or comma to add</p>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Image picker (URL or File) + preview
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function ImagePicker({
// // // // //   imageUrl,
// // // // //   onImageUrlChange,
// // // // //   file,
// // // // //   onFileChange,
// // // // // }: {
// // // // //   imageUrl: string;
// // // // //   onImageUrlChange: (v: string) => void;
// // // // //   file: File | null;
// // // // //   onFileChange: (f: File | null) => void;
// // // // // }) {
// // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // //   const preview = useMemo(() => {
// // // // //     if (file) return URL.createObjectURL(file);
// // // // //     if (imageUrl) return imageUrl;
// // // // //     return "";
// // // // //   }, [file, imageUrl]);

// // // // //   return (
// // // // //     <div className="grid gap-3">
// // // // //       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// // // // //         <div>
// // // // //           <Label className="text-sm">Image URL</Label>
// // // // //           <Input
// // // // //             placeholder="https://example.com/image.jpg"
// // // // //             value={imageUrl}
// // // // //             onChange={(e) => onImageUrlChange(e.target.value)}
// // // // //             className="bg-white"
// // // // //           />
// // // // //         </div>
// // // // //         <div>
// // // // //           <Label className="text-sm">Upload Image</Label>
// // // // //           <div className="flex items-center gap-3">
// // // // //             <Input
// // // // //               ref={inputRef}
// // // // //               type="file"
// // // // //               accept="image/*"
// // // // //               className="bg-white"
// // // // //               onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
// // // // //             />
// // // // //             {file && (
// // // // //               <Badge variant="outline" className="rounded-full">
// // // // //                 {file.name}
// // // // //               </Badge>
// // // // //             )}
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //       {preview ? (
// // // // //         <div className="rounded-2xl border bg-white p-3">
// // // // //           {/* eslint-disable-next-line @next/next/no-img-element */}
// // // // //           <img
// // // // //             src={preview}
// // // // //             alt="preview"
// // // // //             className="max-h-56 w-auto rounded-xl object-cover"
// // // // //           />
// // // // //         </div>
// // // // //       ) : (
// // // // //         <div className="rounded-2xl border bg-gray-50 p-6 text-sm text-gray-500">
// // // // //           No preview
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Preset Save/Load
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // const PRESET_KEY = "classified_automation_preset_v1";
// // // // // function savePreset(data: any) {
// // // // //   localStorage.setItem(PRESET_KEY, JSON.stringify(data));
// // // // // }
// // // // // function loadPreset(): any | null {
// // // // //   try {
// // // // //     const raw = localStorage.getItem(PRESET_KEY);
// // // // //     if (!raw) return null;
// // // // //     return JSON.parse(raw);
// // // // //   } catch {
// // // // //     return null;
// // // // //   }
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Fake image upload (replace with your real implementation)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // async function uploadImageAndGetUrl(file: File): Promise<string> {
// // // // //   // TODO: Replace with your real uploader → returns public URL
// // // // //   // e.g. POST to /api/upload -> { url }
// // // // //   // For now, return a blob URL (works as preview only; backend should download or accept multipart)
// // // // //   return URL.createObjectURL(file);
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * MAIN PAGE
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // export default function ClassifiedAutomationPage() {
// // // // //   // Generated content list (pick & autofill)
// // // // //   const [items, setItems] = useState<GeneratedItem[]>([]);
// // // // //   useEffect(() => setItems(loadGeneratedItems()), []);

// // // // //   // Filter + select generated item
// // // // //   const [search, setSearch] = useState("");
// // // // //   const filtered = useMemo(() => {
// // // // //     const q = search.toLowerCase().trim();
// // // // //     if (!q) return items;
// // // // //     return items.filter((it) => {
// // // // //       const s = `${it.title ?? ""} ${getItemKeywords(it).join(" ")} ${it.keyword ?? ""}`.toLowerCase();
// // // // //       return s.includes(q);
// // // // //     });
// // // // //   }, [items, search]);

// // // // //   const [selectedId, setSelectedId] = useState<string>("");
// // // // //   const selectedItem = useMemo(
// // // // //     () => items.find((x) => x.id === selectedId),
// // // // //     [items, selectedId]
// // // // //   );

// // // // //   // Form state
// // // // //   const [title, setTitle] = useState("");
// // // // //   const [keywords, setKeywords] = useState<string[]>([]);
// // // // //   const [category, setCategory] = useState<string>("");
// // // // //   const [contentHtml, setContentHtml] = useState("");

// // // // //   // Contact / profile
// // // // //   const [phone, setPhone] = useState("");
// // // // //   const [website, setWebsite] = useState("");
// // // // //   const [email, setEmail] = useState("");

// // // // //   // Socials
// // // // //   const [facebook, setFacebook] = useState("");
// // // // //   const [twitter, setTwitter] = useState("");
// // // // //   const [linkedin, setLinkedin] = useState("");
// // // // //   const [pinterest, setPinterest] = useState("");
// // // // //   const [instagram, setInstagram] = useState("");
// // // // //   const [yelp, setYelp] = useState("");
// // // // //   const [gmb, setGmb] = useState("");

// // // // //   // Address
// // // // //   const [country, setCountry] = useState("");
// // // // //   const [state, setStateVal] = useState("");
// // // // //   const [city, setCity] = useState("");
// // // // //   const [zip, setZip] = useState("");
// // // // //   const [line1, setLine1] = useState("");

// // // // //   // Image
// // // // //   const [imageUrl, setImageUrl] = useState("");
// // // // //   const [imageFile, setImageFile] = useState<File | null>(null);

// // // // //   // Run settings
// // // // //   const [site, setSite] = useState<string>("");
// // // // //   const [username, setUsername] = useState("");
// // // // //   const [password, setPassword] = useState("");

// // // // //   // UX bits
// // // // //   const [isStarting, setIsStarting] = useState(false);
// // // // //   const [jobId, setJobId] = useState<string | null>(null);
// // // // //   const [progress, setProgress] = useState(0);

// // // // //   // Auto-fill when item changes
// // // // //   useEffect(() => {
// // // // //     if (!selectedItem) return;
// // // // //     setTitle(getItemTitle(selectedItem));
// // // // //     setContentHtml(getItemHtml(selectedItem));
// // // // //     setKeywords(getItemKeywords(selectedItem));
// // // // //     // Optional: try set image from item
// // // // //     if (selectedItem.images?.[0]) setImageUrl(selectedItem.images[0]);
// // // // //   }, [selectedItem]);

// // // // //   // Load preset
// // // // //   useEffect(() => {
// // // // //     const p = loadPreset();
// // // // //     if (p) {
// // // // //       setPhone(p.phone ?? "");
// // // // //       setWebsite(p.website ?? "");
// // // // //       setEmail(p.email ?? "");
// // // // //       setCountry(p.address?.country ?? "");
// // // // //       setStateVal(p.address?.state ?? "");
// // // // //       setCity(p.address?.city ?? "");
// // // // //       setZip(p.address?.zip ?? "");
// // // // //       setLine1(p.address?.line1 ?? "");
// // // // //       setFacebook(p.socials?.facebook ?? "");
// // // // //       setTwitter(p.socials?.twitter ?? "");
// // // // //       setLinkedin(p.socials?.linkedin ?? "");
// // // // //       setPinterest(p.socials?.pinterest ?? "");
// // // // //       setInstagram(p.socials?.instagram ?? "");
// // // // //       setYelp(p.socials?.yelp ?? "");
// // // // //       setGmb(p.socials?.gmb ?? "");
// // // // //       setSite(p.site ?? "");
// // // // //       setUsername(p.username ?? "");
// // // // //     }
// // // // //   }, []);

// // // // //   function handleSavePreset() {
// // // // //     savePreset({
// // // // //       site,
// // // // //       username,
// // // // //       phone,
// // // // //       website,
// // // // //       email,
// // // // //       address: { country, state: state, city, zip, line1 },
// // // // //       socials: { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb },
// // // // //     });
// // // // //     toast.success("Preset saved");
// // // // //   }

// // // // //   const readyToStart =
// // // // //     !!site && !!username && !!password && !!title && !!contentHtml && (imageUrl || imageFile);

// // // // //   async function handleStart() {
// // // // //     if (!readyToStart) {
// // // // //       toast.error("Fill required fields (site, login, title, content, image)");
// // // // //       return;
// // // // //     }
// // // // //     setIsStarting(true);

// // // // //     try {
// // // // //       let finalImageUrl = imageUrl.trim();
// // // // //       if (!finalImageUrl && imageFile) {
// // // // //         finalImageUrl = await uploadImageAndGetUrl(imageFile);
// // // // //       }

// // // // //       const payload: AutomationPayload = {
// // // // //         site,
// // // // //         login: { username, password },
// // // // //         profile: {
// // // // //           phone,
// // // // //           website,
// // // // //           email,
// // // // //           socials: {
// // // // //             facebook,
// // // // //             twitter,
// // // // //             linkedin,
// // // // //             pinterest,
// // // // //             instagram,
// // // // //             yelp,
// // // // //             gmb,
// // // // //           },
// // // // //           address: {
// // // // //             country,
// // // // //             state,
// // // // //             city,
// // // // //             zip,
// // // // //             line1,
// // // // //           },
// // // // //         },
// // // // //         listings: [
// // // // //           {
// // // // //             id:
// // // // //               selectedItem?.id ??
// // // // //               `listing-${Date.now().toString(36)}`,
// // // // //             title,
// // // // //             contentHtml,
// // // // //             images: finalImageUrl ? [finalImageUrl] : [],
// // // // //             keywords,
// // // // //             category: category || undefined,
// // // // //           },
// // // // //         ],
// // // // //       };

// // // // //       // POST → your backend
// // // // //       const res = await fetch("/api/automation/start", {
// // // // //         method: "POST",
// // // // //         headers: { "Content-Type": "application/json" },
// // // // //         body: JSON.stringify(payload),
// // // // //       });

// // // // //       if (!res.ok) throw new Error(`Backend error: ${res.status}`);
// // // // //       const data = await res.json(); // { jobId }
// // // // //       setJobId(data.jobId ?? null);
// // // // //       toast.success("Automation started");

// // // // //       // Optional: simple polling for progress
// // // // //       if (data.jobId) {
// // // // //         let tries = 0;
// // // // //         const t = setInterval(async () => {
// // // // //           tries++;
// // // // //           try {
// // // // //             const s = await fetch(`/api/automation/status/${data.jobId}`);
// // // // //             if (s.ok) {
// // // // //               const j = await s.json();
// // // // //               setProgress(j.progress ?? 0);
// // // // //               if (j.status === "done" || j.status === "error") {
// // // // //                 clearInterval(t);
// // // // //                 toast[j.status === "done" ? "success" : "error"](
// // // // //                   j.status === "done" ? "Completed" : "Job error"
// // // // //                 );
// // // // //               }
// // // // //             }
// // // // //           } catch {}
// // // // //           if (tries > 300) clearInterval(t); // stop after a while
// // // // //         }, 1500);
// // // // //       }
// // // // //     } catch (err: any) {
// // // // //       console.error(err);
// // // // //       toast.error(err?.message ?? "Failed to start");
// // // // //     } finally {
// // // // //       setIsStarting(false);
// // // // //     }
// // // // //   }

// // // // //   return (
// // // // //     <div className="space-y-10 p-5 bg-gradient-to-b from-neutral-50 via-white to-slate-50 text-neutral-900">
// // // // //       {/* Header */}
// // // // //       <GradientFrame>
// // // // //         <Card className="border-0 rounded-3xl">
// // // // //           <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-3xl border-b">
// // // // //             <CardTitle className="flex items-center gap-2 text-2xl text-blue-700">
// // // // //               <IconListDetails className="h-6 w-6 text-green-500" />
// // // // //               Classified Listing Automation
// // // // //             </CardTitle>
// // // // //             <CardDescription className="text-neutral-600">
// // // // //               Pick from your <b>already generated content</b> and fill the listing details. No Excel upload here.
// // // // //             </CardDescription>
// // // // //           </CardHeader>
// // // // //           <CardContent className="py-6">
// // // // //             {/* Content Picker */}
// // // // //             <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
// // // // //               <div className="grid gap-3 md:grid-cols-[1fr_300px]">
// // // // //                 <div>
// // // // //                   <Label className="text-sm">Search Generated Content</Label>
// // // // //                   <Input
// // // // //                     value={search}
// // // // //                     onChange={(e) => setSearch(e.target.value)}
// // // // //                     placeholder="Search by title / keyword…"
// // // // //                     className="bg-white"
// // // // //                   />
// // // // //                 </div>
// // // // //                 <div>
// // // // //                   <Label className="text-sm">Select Item</Label>
// // // // //                   <Select value={selectedId} onValueChange={setSelectedId}>
// // // // //                     <SelectTrigger className="bg-white">
// // // // //                       <SelectValue placeholder="Select…" />
// // // // //                     </SelectTrigger>
// // // // //                     <SelectContent>
// // // // //                       {filtered.length ? (
// // // // //                         filtered.map((it) => (
// // // // //                           <SelectItem key={it.id} value={it.id}>
// // // // //                             {getItemTitle(it)?.slice(0, 60) ||
// // // // //                               (getItemKeywords(it)[0] ?? "Untitled")}
// // // // //                           </SelectItem>
// // // // //                         ))
// // // // //                       ) : (
// // // // //                         <SelectItem value="__none" disabled>
// // // // //                           No items found
// // // // //                         </SelectItem>
// // // // //                       )}
// // // // //                     </SelectContent>
// // // // //                   </Select>
// // // // //                 </div>
// // // // //               </div>
// // // // //               <p className="text-xs text-gray-500 mt-2">
// // // // //                 Content here is loaded from your local store. Map <code>loadGeneratedItems()</code> to your real source if needed.
// // // // //               </p>
// // // // //             </div>
// // // // //           </CardContent>
// // // // //         </Card>
// // // // //       </GradientFrame>

// // // // //       {/* Body Grid */}
// // // // //       <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
// // // // //         {/* LEFT: Listing details */}
// // // // //         <div className="space-y-8">
// // // // //           <GradientFrame>
// // // // //             <Card className="border-0 rounded-3xl">
// // // // //               <CardHeader>
// // // // //                 <CardTitle className="flex items-center gap-2 text-lg text-indigo-700">
// // // // //                   <IconListDetails className="h-5 w-5 text-sky-600" />
// // // // //                   Listing Details
// // // // //                 </CardTitle>
// // // // //               </CardHeader>
// // // // //               <CardContent className="space-y-6">
// // // // //                 {/* Title */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold">Title</Label>
// // // // //                   <Input
// // // // //                     value={title}
// // // // //                     onChange={(e) => setTitle(e.target.value)}
// // // // //                     placeholder="Listing title…"
// // // // //                     className="bg-white"
// // // // //                   />
// // // // //                   <p className="text-xs text-gray-500 mt-1">
// // // // //                     Auto-filled from selected content; you can edit.
// // // // //                   </p>
// // // // //                 </section>

// // // // //                 {/* Keywords */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold">Keyword Tags</Label>
// // // // //                   <TagsInput value={keywords} onChange={setKeywords} />
// // // // //                 </section>

// // // // //                 {/* Category */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold">Category</Label>
// // // // //                   <Select value={category} onValueChange={setCategory}>
// // // // //                     <SelectTrigger className="bg-white">
// // // // //                       <SelectValue placeholder="Choose a category" />
// // // // //                     </SelectTrigger>
// // // // //                     <SelectContent>
// // // // //                       {CATEGORIES.map((c) => (
// // // // //                         <SelectItem key={c} value={c}>
// // // // //                           {c}
// // // // //                         </SelectItem>
// // // // //                       ))}
// // // // //                     </SelectContent>
// // // // //                   </Select>
// // // // //                 </section>

// // // // //                 {/* Content */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold">Content (HTML or Text)</Label>
// // // // //                   <Textarea
// // // // //                     value={contentHtml}
// // // // //                     onChange={(e) => setContentHtml(e.target.value)}
// // // // //                     placeholder="Content here…"
// // // // //                     className="min-h-[200px] bg-white"
// // // // //                   />
// // // // //                   <p className="text-xs text-gray-500 mt-1">
// // // // //                     Auto-filled from selected content; supports HTML.
// // // // //                   </p>
// // // // //                 </section>

// // // // //                 {/* Image */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                     <IconPhoto className="h-4 w-4 text-rose-500" />
// // // // //                     Image
// // // // //                   </Label>
// // // // //                   <ImagePicker
// // // // //                     imageUrl={imageUrl}
// // // // //                     onImageUrlChange={setImageUrl}
// // // // //                     file={imageFile}
// // // // //                     onFileChange={setImageFile}
// // // // //                   />
// // // // //                 </section>

// // // // //                 {/* Address */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                     <IconMap2 className="h-4 w-4 text-emerald-600" />
// // // // //                     Address
// // // // //                   </Label>
// // // // //                   <div className="grid gap-3 md:grid-cols-2">
// // // // //                     <div>
// // // // //                       <Label className="text-xs">Country</Label>
// // // // //                       <Input value={country} onChange={(e) => setCountry(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">State</Label>
// // // // //                       <Input value={state} onChange={(e) => setStateVal(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">City</Label>
// // // // //                       <Input value={city} onChange={(e) => setCity(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">ZIP Code</Label>
// // // // //                       <Input value={zip} onChange={(e) => setZip(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                   </div>
// // // // //                   <div className="mt-3">
// // // // //                     <Label className="text-xs">Address Line</Label>
// // // // //                     <Input value={line1} onChange={(e) => setLine1(e.target.value)} className="bg-white" />
// // // // //                   </div>
// // // // //                 </section>

// // // // //                 {/* Contact */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                     <IconAddressBook className="h-4 w-4 text-indigo-600" />
// // // // //                     Contact
// // // // //                   </Label>
// // // // //                   <div className="grid gap-3 md:grid-cols-3">
// // // // //                     <div>
// // // // //                       <Label className="text-xs">Phone</Label>
// // // // //                       <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">Website</Label>
// // // // //                       <div className="flex items-center">
// // // // //                         <IconWorldWww className="h-4 w-4 mr-2 text-neutral-500" />
// // // // //                         <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="bg-white" />
// // // // //                       </div>
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">Email</Label>
// // // // //                       <div className="flex items-center">
// // // // //                         <IconAt className="h-4 w-4 mr-2 text-neutral-500" />
// // // // //                         <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white" />
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </section>

// // // // //                 {/* Socials */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                     <IconWorld className="h-4 w-4 text-sky-600" />
// // // // //                     Social Profiles
// // // // //                   </Label>
// // // // //                   <div className="grid gap-3 md:grid-cols-2">
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandFacebook className="h-3 w-3" /> Facebook Page
// // // // //                       </Label>
// // // // //                       <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandTwitter className="h-3 w-3" /> Twitter / X
// // // // //                       </Label>
// // // // //                       <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandLinkedin className="h-3 w-3" /> LinkedIn
// // // // //                       </Label>
// // // // //                       <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandPinterest className="h-3 w-3" /> Pinterest
// // // // //                       </Label>
// // // // //                       <Input value={pinterest} onChange={(e) => setPinterest(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandInstagram className="h-3 w-3" /> Instagram
// // // // //                       </Label>
// // // // //                       <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandCpp className="h-3 w-3" /> Yelp
// // // // //                       </Label>
// // // // //                       <Input value={yelp} onChange={(e) => setYelp(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div className="md:col-span-2">
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandGoogle className="h-3 w-3" /> Google Business Profile
// // // // //                       </Label>
// // // // //                       <Input value={gmb} onChange={(e) => setGmb(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </section>

// // // // //                 <div className="flex items-center gap-2">
// // // // //                   <Button variant="outline" onClick={handleSavePreset} className="rounded-full">
// // // // //                     Save Preset
// // // // //                   </Button>
// // // // //                   <Badge variant="outline" className="rounded-full">
// // // // //                     {readyToStart ? "Ready" : "Fill required fields"}
// // // // //                   </Badge>
// // // // //                 </div>
// // // // //               </CardContent>
// // // // //             </Card>
// // // // //           </GradientFrame>
// // // // //         </div>

// // // // //         {/* RIGHT: Run settings */}
// // // // //         <div className="space-y-8">
// // // // //           <GradientFrame>
// // // // //             <Card className="border-0 rounded-3xl">
// // // // //               <CardHeader>
// // // // //                 <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
// // // // //                   <IconSparkles className="h-5 w-5 text-emerald-600" />
// // // // //                   Run Settings
// // // // //                 </CardTitle>
// // // // //                 <CardDescription>Select site & credentials</CardDescription>
// // // // //               </CardHeader>
// // // // //               <CardContent className="space-y-5">
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold">Site</Label>
// // // // //                   <Select value={site} onValueChange={setSite}>
// // // // //                     <SelectTrigger className="bg-white">
// // // // //                       <SelectValue placeholder="Choose site…" />
// // // // //                     </SelectTrigger>
// // // // //                     <SelectContent>
// // // // //                       {SITES.map((s) => (
// // // // //                         <SelectItem key={s.value} value={s.value}>
// // // // //                           {s.label}
// // // // //                         </SelectItem>
// // // // //                       ))}
// // // // //                     </SelectContent>
// // // // //                   </Select>
// // // // //                 </section>

// // // // //                 <section className="grid gap-3">
// // // // //                   <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                     <IconKey className="h-4 w-4 text-amber-600" />
// // // // //                     Credentials
// // // // //                   </Label>
// // // // //                   <Input
// // // // //                     placeholder="Username / Email"
// // // // //                     value={username}
// // // // //                     onChange={(e) => setUsername(e.target.value)}
// // // // //                     className="bg-white"
// // // // //                   />
// // // // //                   <Input
// // // // //                     placeholder="Password"
// // // // //                     type="password"
// // // // //                     value={password}
// // // // //                     onChange={(e) => setPassword(e.target.value)}
// // // // //                     className="bg-white"
// // // // //                   />
// // // // //                 </section>

// // // // //                 <Separator />

// // // // //                 <div className="grid gap-2">
// // // // //                   <Button
// // // // //                     onClick={handleStart}
// // // // //                     disabled={!readyToStart || isStarting}
// // // // //                     className={cn(
// // // // //                       "rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500 text-white shadow-md hover:opacity-90",
// // // // //                       !readyToStart && "opacity-60 cursor-not-allowed"
// // // // //                     )}
// // // // //                   >
// // // // //                     <IconPlayerPlay className="h-4 w-4 mr-2" />
// // // // //                     {isStarting ? "Starting…" : "Start Automation"}
// // // // //                   </Button>
// // // // //                   {jobId && (
// // // // //                     <div className="rounded-xl border bg-neutral-50 p-3">
// // // // //                       <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
// // // // //                         <span>Job: {jobId}</span>
// // // // //                         <span>{progress}%</span>
// // // // //                       </div>
// // // // //                       <Progress value={progress} className="h-2 bg-neutral-200" />
// // // // //                     </div>
// // // // //                   )}
// // // // //                 </div>
// // // // //               </CardContent>
// // // // //             </Card>
// // // // //           </GradientFrame>

// // // // //           <div className="rounded-2xl border bg-neutral-50 p-4 text-sm text-neutral-600">
// // // // //             <p className="mb-1">
// // // // //               ✅ <b>Flow:</b> Select generated content → adjust details → Start Automation
// // // // //             </p>
// // // // //             <p>
// // // // //               🧩 <b>Backend payload:</b> <code>/api/automation/start</code> with site, login, profile, and one listing.
// // // // //             </p>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // // /pages/classified-automation/index.tsx
// // // // // import React, { useEffect, useMemo, useRef, useState } from "react";
// // // // // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // // // // import { Button } from "@/components/ui/button";
// // // // // import { Badge } from "@/components/ui/badge";
// // // // // import { Input } from "@/components/ui/input";
// // // // // import { Label } from "@/components/ui/label";
// // // // // import { Textarea } from "@/components/ui/textarea";
// // // // // import { Separator } from "@/components/ui/separator";
// // // // // import { Progress } from "@/components/ui/progress";
// // // // // import { Checkbox } from "@/components/ui/checkbox";
// // // // // import { toast } from "sonner";
// // // // // import { cn } from "@/lib/utils";

// // // // // import {
// // // // //   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// // // // // } from "@/components/ui/select";

// // // // // import {
// // // // //   IconWorld,
// // // // //   IconListDetails,
// // // // //   IconPlayerPlay,
// // // // //   IconSparkles,
// // // // //   IconAddressBook,
// // // // //   IconTags,
// // // // //   IconKey,
// // // // //   IconMap2,
// // // // //   IconPhoto,
// // // // //   IconWorldWww,
// // // // //   IconAt,
// // // // //   IconBrandFacebook,
// // // // //   IconBrandTwitter,
// // // // //   IconBrandLinkedin,
// // // // //   IconBrandPinterest,
// // // // //   IconBrandInstagram,
// // // // //   IconBrandCpp, // Yelp placeholder
// // // // //   IconBrandGoogle,
// // // // //   IconChevronDown,
// // // // //   IconChevronRight,
// // // // //   IconSearch,
// // // // //   IconFolder,
// // // // //   IconCheck,
// // // // // } from "@tabler/icons-react";

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Types
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // type GeneratedItem = {
// // // // //   id: string;
// // // // //   keyword?: string | string[];
// // // // //   title?: string;
// // // // //   html?: string;
// // // // //   generatedContent?: string;
// // // // //   images?: string[];
// // // // //   fileId?: string;       // project id
// // // // //   fileName?: string;     // if present in your store
// // // // //   createdAt?: number | string;
// // // // // };

// // // // // type Address = {
// // // // //   country: string;
// // // // //   state: string;
// // // // //   city: string;
// // // // //   zip: string;
// // // // //   line1: string;
// // // // // };

// // // // // type Socials = {
// // // // //   facebook?: string;
// // // // //   twitter?: string;
// // // // //   linkedin?: string;
// // // // //   pinterest?: string;
// // // // //   instagram?: string;
// // // // //   yelp?: string;
// // // // //   gmb?: string;
// // // // // };

// // // // // type AutomationPayload = {
// // // // //   site: string;
// // // // //   login: { username: string; password: string };
// // // // //   profile: {
// // // // //     phone?: string;
// // // // //     website?: string;
// // // // //     email?: string;
// // // // //     socials?: Socials;
// // // // //     address?: Address;
// // // // //   };
// // // // //   listings: Array<{
// // // // //     id: string;
// // // // //     title: string;
// // // // //     contentHtml: string;
// // // // //     images: string[];
// // // // //     keywords: string[];
// // // // //     category?: string;
// // // // //   }>;
// // // // // };

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Constants
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // const CATEGORIES = [
// // // // //   "Electronics","Home & Garden","Vehicles","Jobs","Services",
// // // // //   "Real Estate","Pets","Books","Fashion","Sports",
// // // // // ];

// // // // // const SITES = [
// // // // //   { value: "site-1.com", label: "Site 1" },
// // // // //   { value: "site-2.com", label: "Site 2" },
// // // // //   { value: "site-3.com", label: "Site 3" },
// // // // // ];

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Helpers: load generated items from your existing store
// // // // //  * (localStorage/session best-effort)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function loadGeneratedItems(): GeneratedItem[] {
// // // // //   const keys = ["content_items_v1","content-items","seomatic_content_items"];
// // // // //   for (const k of keys) {
// // // // //     try {
// // // // //       const raw = localStorage.getItem(k);
// // // // //       if (raw) {
// // // // //         const arr = JSON.parse(raw);
// // // // //         if (Array.isArray(arr)) return arr;
// // // // //       }
// // // // //     } catch {}
// // // // //   }
// // // // //   try {
// // // // //     const raw = sessionStorage.getItem("open-content-item_v1")
// // // // //       ?? localStorage.getItem("open-content-item_v1_fallback");
// // // // //     if (raw) {
// // // // //       const it = JSON.parse(raw);
// // // // //       if (it && typeof it === "object") return [it];
// // // // //     }
// // // // //   } catch {}
// // // // //   return [];
// // // // // }

// // // // // const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// // // // // const getItemHtml = (it: GeneratedItem) => (it.html ?? it.generatedContent ?? "").toString();
// // // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // // //   if (typeof it.keyword === "string") {
// // // // //     return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean);
// // // // //   }
// // // // //   return [];
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * UI helpers
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function GradientFrame({ children }: { children: React.ReactNode }) {
// // // // //   return (
// // // // //     <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-gray-100 via-gray-100 to-gray-100">
// // // // //       <div className="relative rounded-3xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
// // // // //         {children}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // function TagsInput({
// // // // //   value, onChange, placeholder = "Type keyword and press Enter",
// // // // // }: { value: string[]; onChange: (tags: string[]) => void; placeholder?: string; }) {
// // // // //   const [draft, setDraft] = useState("");
// // // // //   function addTagFromDraft() {
// // // // //     const parts = draft.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
// // // // //     if (parts.length) {
// // // // //       const set = new Set([...value, ...parts]);
// // // // //       onChange(Array.from(set));
// // // // //       setDraft("");
// // // // //     }
// // // // //   }
// // // // //   return (
// // // // //     <div className="rounded-2xl border border-gray-200 bg-white p-3">
// // // // //       <div className="flex flex-wrap gap-2 mb-2">
// // // // //         {value.map((t) => (
// // // // //           <span key={t} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs border border-emerald-200">
// // // // //             <IconTags className="h-3 w-3" />
// // // // //             {t}
// // // // //             <button
// // // // //               onClick={() => onChange(value.filter((x) => x !== t))}
// // // // //               className="ml-1 hover:text-emerald-900"
// // // // //               aria-label={`Remove ${t}`}
// // // // //             >
// // // // //               ×
// // // // //             </button>
// // // // //           </span>
// // // // //         ))}
// // // // //       </div>
// // // // //       <Input
// // // // //         value={draft}
// // // // //         onChange={(e) => setDraft(e.target.value)}
// // // // //         onKeyDown={(e) => {
// // // // //           if (e.key === "Enter") { e.preventDefault(); addTagFromDraft(); }
// // // // //           if (e.key === "Backspace" && !draft && value.length) {
// // // // //             onChange(value.slice(0, -1));
// // // // //           }
// // // // //         }}
// // // // //         placeholder={placeholder}
// // // // //         className="bg-white"
// // // // //       />
// // // // //       <p className="text-xs text-gray-500 mt-1">Use Enter or comma to add</p>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // function ImagePicker({
// // // // //   imageUrl, onImageUrlChange, file, onFileChange,
// // // // // }: {
// // // // //   imageUrl: string;
// // // // //   onImageUrlChange: (v: string) => void;
// // // // //   file: File | null;
// // // // //   onFileChange: (f: File | null) => void;
// // // // // }) {
// // // // //   const inputRef = useRef<HTMLInputElement | null>(null);
// // // // //   const preview = useMemo(() => {
// // // // //     if (file) return URL.createObjectURL(file);
// // // // //     if (imageUrl) return imageUrl;
// // // // //     return "";
// // // // //   }, [file, imageUrl]);

// // // // //   return (
// // // // //     <div className="grid gap-3">
// // // // //       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// // // // //         <div>
// // // // //           <Label className="text-sm">Image URL</Label>
// // // // //           <Input
// // // // //             placeholder="https://example.com/image.jpg"
// // // // //             value={imageUrl}
// // // // //             onChange={(e) => onImageUrlChange(e.target.value)}
// // // // //             className="bg-white"
// // // // //           />
// // // // //         </div>
// // // // //         <div>
// // // // //           <Label className="text-sm">Upload Image</Label>
// // // // //           <div className="flex items-center gap-3">
// // // // //             <Input
// // // // //               ref={inputRef}
// // // // //               type="file"
// // // // //               accept="image/*"
// // // // //               className="bg-white"
// // // // //               onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
// // // // //             />
// // // // //             {file && (
// // // // //               <Badge variant="outline" className="rounded-full">
// // // // //                 {file.name}
// // // // //               </Badge>
// // // // //             )}
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //       {preview ? (
// // // // //         <div className="rounded-2xl border bg-white p-3">
// // // // //           {/* eslint-disable-next-line @next/next/no-img-element */}
// // // // //           <img src={preview} alt="preview" className="max-h-56 w-auto rounded-xl object-cover" />
// // // // //         </div>
// // // // //       ) : (
// // // // //         <div className="rounded-2xl border bg-gray-50 p-6 text-sm text-gray-500">No preview</div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* Preset Save/Load */
// // // // // const PRESET_KEY = "classified_automation_preset_v1";
// // // // // function savePreset(data: any) { localStorage.setItem(PRESET_KEY, JSON.stringify(data)); }
// // // // // function loadPreset(): any | null {
// // // // //   try { const raw = localStorage.getItem(PRESET_KEY); if (!raw) return null; return JSON.parse(raw); }
// // // // //   catch { return null; }
// // // // // }

// // // // // /* Fake uploader (replace with your real impl) */
// // // // // async function uploadImageAndGetUrl(file: File): Promise<string> {
// // // // //   return URL.createObjectURL(file);
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * MAIN
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // export default function ClassifiedAutomationPage() {
// // // // //   /* Load all generated items */
// // // // //   const [items, setItems] = useState<GeneratedItem[]>([]);
// // // // //   useEffect(() => setItems(loadGeneratedItems()), []);

// // // // //   /* Group by project (fileId) */
// // // // //   const projects = useMemo(() => {
// // // // //     const map = new Map<string, GeneratedItem[]>();
// // // // //     for (const it of items) {
// // // // //       const key = it.fileId ?? "__misc__";
// // // // //       if (!map.has(key)) map.set(key, []);
// // // // //       map.get(key)!.push(it);
// // // // //     }
// // // // //     return Array.from(map.entries()).map(([pid, arr]) => ({
// // // // //       id: pid,
// // // // //       name: arr[0]?.fileName || pid || "Untitled Project",
// // // // //       items: arr,
// // // // //     }));
// // // // //   }, [items]);

// // // // //   /* Search (applied to items listing view) */
// // // // //   const [search, setSearch] = useState("");

// // // // //   /* UI state: Project expansion + selection */
// // // // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // // // //   const toggleProjectExpand = (pid: string) => {
// // // // //     setExpandedProjectIds(prev => {
// // // // //       const n = new Set(prev);
// // // // //       n.has(pid) ? n.delete(pid) : n.add(pid);
// // // // //       return n;
// // // // //     });
// // // // //   };

// // // // //   /* Selection state */
// // // // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // // // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

// // // // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // // // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);

// // // // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // // // //     setSelectedProjectIds(prev => {
// // // // //       const n = new Set(prev);
// // // // //       if (checked) n.add(pid);
// // // // //       else n.delete(pid);
// // // // //       return n;
// // // // //     });
// // // // //     // project-level check toggles all items within it
// // // // //     const proj = projects.find(p => p.id === pid);
// // // // //     if (proj) {
// // // // //       setSelectedItemIds(prev => {
// // // // //         const n = new Set(prev);
// // // // //         for (const it of proj.items) {
// // // // //           if (checked) n.add(it.id);
// // // // //           else n.delete(it.id);
// // // // //         }
// // // // //         return n;
// // // // //       });
// // // // //     }
// // // // //   };

// // // // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // // // //     setSelectedItemIds(prev => {
// // // // //       const n = new Set(prev);
// // // // //       if (checked) n.add(iid);
// // // // //       else n.delete(iid);
// // // // //       return n;
// // // // //     });
// // // // //     // sync project-level tri-state
// // // // //     const proj = projects.find(p => p.id === pid);
// // // // //     if (proj) {
// // // // //       const allSelected = proj.items.every(it => selectedItemIds.has(it.id) || (it.id === iid && checked));
// // // // //       const noneSelected = proj.items.every(it => !selectedItemIds.has(it.id) && !(it.id === iid && checked));
// // // // //       setSelectedProjectIds(prev => {
// // // // //         const n = new Set(prev);
// // // // //         if (allSelected) n.add(pid);
// // // // //         else if (noneSelected) n.delete(pid);
// // // // //         return n;
// // // // //       });
// // // // //     }
// // // // //   };

// // // // //   /* Focused preview item (for Title/Content preview pane) */
// // // // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // // // //   const focusedItem = useMemo(() => items.find(x => x.id === focusedItemId), [items, focusedItemId]);

// // // // //   /* Derived: filtered items per project (by search) */
// // // // //   const filteredProjects = useMemo(() => {
// // // // //     const q = search.toLowerCase().trim();
// // // // //     if (!q) return projects;
// // // // //     return projects.map(p => {
// // // // //       const its = p.items.filter(it => {
// // // // //         const txt = `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase();
// // // // //         return txt.includes(q);
// // // // //       });
// // // // //       return { ...p, items: its };
// // // // //     }).filter(p => p.items.length > 0);
// // // // //   }, [projects, search]);

// // // // //   /* Listing defaults (apply to all selected items) */
// // // // //   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
// // // // //   const [category, setCategory] = useState<string>("");

// // // // //   // Contact / profile
// // // // //   const [phone, setPhone] = useState("");
// // // // //   const [website, setWebsite] = useState("");
// // // // //   const [email, setEmail] = useState("");

// // // // //   // Socials
// // // // //   const [facebook, setFacebook] = useState("");
// // // // //   const [twitter, setTwitter] = useState("");
// // // // //   const [linkedin, setLinkedin] = useState("");
// // // // //   const [pinterest, setPinterest] = useState("");
// // // // //   const [instagram, setInstagram] = useState("");
// // // // //   const [yelp, setYelp] = useState("");
// // // // //   const [gmb, setGmb] = useState("");

// // // // //   // Address
// // // // //   const [country, setCountry] = useState("");
// // // // //   const [state, setStateVal] = useState("");
// // // // //   const [city, setCity] = useState("");
// // // // //   const [zip, setZip] = useState("");
// // // // //   const [line1, setLine1] = useState("");

// // // // //   // Default image (used if item has no image)
// // // // //   const [imageUrl, setImageUrl] = useState("");
// // // // //   const [imageFile, setImageFile] = useState<File | null>(null);

// // // // //   // Run settings
// // // // //   const [site, setSite] = useState<string>("");
// // // // //   const [username, setUsername] = useState("");
// // // // //   const [password, setPassword] = useState("");

// // // // //   // UX bits
// // // // //   const [isStarting, setIsStarting] = useState(false);
// // // // //   const [jobId, setJobId] = useState<string | null>(null);
// // // // //   const [progress, setProgress] = useState(0);

// // // // //   // Load preset
// // // // //   useEffect(() => {
// // // // //     const p = loadPreset();
// // // // //     if (p) {
// // // // //       setPhone(p.phone ?? "");
// // // // //       setWebsite(p.website ?? "");
// // // // //       setEmail(p.email ?? "");
// // // // //       setCountry(p.address?.country ?? "");
// // // // //       setStateVal(p.address?.state ?? "");
// // // // //       setCity(p.address?.city ?? "");
// // // // //       setZip(p.address?.zip ?? "");
// // // // //       setLine1(p.address?.line1 ?? "");
// // // // //       setFacebook(p.socials?.facebook ?? "");
// // // // //       setTwitter(p.socials?.twitter ?? "");
// // // // //       setLinkedin(p.socials?.linkedin ?? "");
// // // // //       setPinterest(p.socials?.pinterest ?? "");
// // // // //       setInstagram(p.socials?.instagram ?? "");
// // // // //       setYelp(p.socials?.yelp ?? "");
// // // // //       setGmb(p.socials?.gmb ?? "");
// // // // //       setSite(p.site ?? "");
// // // // //       setUsername(p.username ?? "");
// // // // //     }
// // // // //   }, []);

// // // // //   function handleSavePreset() {
// // // // //     savePreset({
// // // // //       site, username, phone, website, email,
// // // // //       address: { country, state: state, city, zip, line1 },
// // // // //       socials: { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb },
// // // // //     });
// // // // //     toast.success("Preset saved");
// // // // //   }

// // // // //   const selectedItemsArr = useMemo(
// // // // //     () => items.filter(it => selectedItemIds.has(it.id)),
// // // // //     [items, selectedItemIds]
// // // // //   );

// // // // //   const readyToStart =
// // // // //     !!site && !!username && !!password && selectedItemsArr.length > 0;

// // // // //   async function handleStart() {
// // // // //     if (!readyToStart) {
// // // // //       toast.error("Select at least one content, and fill site + credentials.");
// // // // //       return;
// // // // //     }
// // // // //     setIsStarting(true);

// // // // //     try {
// // // // //       let defaultImageUrl = imageUrl.trim();
// // // // //       if (!defaultImageUrl && imageFile) {
// // // // //         defaultImageUrl = await uploadImageAndGetUrl(imageFile);
// // // // //       }

// // // // //       // Validate images: each item needs an image (item.images or default)
// // // // //       const missingImageFor = selectedItemsArr.filter(it => !(it.images?.length) && !defaultImageUrl);
// // // // //       if (missingImageFor.length) {
// // // // //         toast.error("Some selected items have no image. Provide a default image or deselect them.");
// // // // //         setIsStarting(false);
// // // // //         return;
// // // // //       }

// // // // //       const listings = selectedItemsArr.map((it) => {
// // // // //         const ownKeywords = getItemKeywords(it);
// // // // //         const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
// // // // //         const imgs = (it.images && it.images.length) ? it.images : (defaultImageUrl ? [defaultImageUrl] : []);
// // // // //         return {
// // // // //           id: it.id,
// // // // //           title: getItemTitle(it),
// // // // //           contentHtml: getItemHtml(it),
// // // // //           images: imgs,
// // // // //           keywords: mergedKeywords,
// // // // //           category: category || undefined,
// // // // //         };
// // // // //       });

// // // // //       const payload: AutomationPayload = {
// // // // //         site,
// // // // //         login: { username, password },
// // // // //         profile: {
// // // // //           phone,
// // // // //           website,
// // // // //           email,
// // // // //           socials: { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb },
// // // // //           address: { country, state, city, zip, line1 },
// // // // //         },
// // // // //         listings,
// // // // //       };

// // // // //       const res = await fetch("/api/automation/start", {
// // // // //         method: "POST",
// // // // //         headers: { "Content-Type": "application/json" },
// // // // //         body: JSON.stringify(payload),
// // // // //       });

// // // // //       if (!res.ok) throw new Error(`Backend error: ${res.status}`);
// // // // //       const data = await res.json();
// // // // //       setJobId(data.jobId ?? null);
// // // // //       toast.success(`Automation started for ${listings.length} item(s)`);

// // // // //       if (data.jobId) {
// // // // //         let tries = 0;
// // // // //         const t = setInterval(async () => {
// // // // //           tries++;
// // // // //           try {
// // // // //             const s = await fetch(`/api/automation/status/${data.jobId}`);
// // // // //             if (s.ok) {
// // // // //               const j = await s.json();
// // // // //               setProgress(j.progress ?? 0);
// // // // //               if (j.status === "done" || j.status === "error") {
// // // // //                 clearInterval(t);
// // // // //                 toast[j.status === "done" ? "success" : "error"](
// // // // //                   j.status === "done" ? "Completed" : "Job error"
// // // // //                 );
// // // // //               }
// // // // //             }
// // // // //           } catch {}
// // // // //           if (tries > 300) clearInterval(t);
// // // // //         }, 1500);
// // // // //       }
// // // // //     } catch (err: any) {
// // // // //       console.error(err);
// // // // //       toast.error(err?.message ?? "Failed to start");
// // // // //     } finally {
// // // // //       setIsStarting(false);
// // // // //     }
// // // // //   }

// // // // //   return (
// // // // //     <div className="space-y-8 p-6 bg-white text-neutral-900">
// // // // //       {/* Header */}
// // // // //       <GradientFrame>
// // // // //         <Card className="border-0 rounded-3xl">
// // // // //           <CardHeader className="bg-white rounded-t-3xl border-b">
// // // // //             <div className="flex items-center justify-between gap-4">
// // // // //               <div>
// // // // //                 <CardTitle className="flex items-center gap-2 text-2xl text-neutral-800">
// // // // //                   <IconListDetails className="h-6 w-6 text-neutral-600" />
// // // // //                   Classified Listing Automation
// // // // //                 </CardTitle>
// // // // //                 <CardDescription className="text-neutral-500">
// // // // //                   Choose generated content from your projects, tick items, and run automation.
// // // // //                 </CardDescription>
// // // // //               </div>
// // // // //               <div className="hidden md:flex items-center gap-2">
// // // // //                 <div className="relative">
// // // // //                   <IconSearch className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // // //                   <Input
// // // // //                     value={search}
// // // // //                     onChange={(e) => setSearch(e.target.value)}
// // // // //                     placeholder="Search by title / keywords…"
// // // // //                     className="pl-9 bg-white w-[320px]"
// // // // //                   />
// // // // //                 </div>
// // // // //                 <Badge variant="outline" className="rounded-full">
// // // // //                   Selected: {selectedItemsArr.length}
// // // // //                 </Badge>
// // // // //               </div>
// // // // //             </div>
// // // // //           </CardHeader>
// // // // //           <CardContent className="py-6">
// // // // //             <div className="md:hidden mb-3">
// // // // //               <div className="relative">
// // // // //                 <IconSearch className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // // //                 <Input
// // // // //                   value={search}
// // // // //                   onChange={(e) => setSearch(e.target.value)}
// // // // //                   placeholder="Search by title / keywords…"
// // // // //                   className="pl-9 bg-white"
// // // // //                 />
// // // // //               </div>
// // // // //             </div>
// // // // //             <p className="text-xs text-neutral-500">
// // // // //               Content is loaded locally. Map <code>loadGeneratedItems()</code> to your actual store/hook if needed.
// // // // //             </p>
// // // // //           </CardContent>
// // // // //         </Card>
// // // // //       </GradientFrame>

// // // // //       {/* 3-column layout: Projects | Listing Defaults (center) | Run Settings */}
// // // // //       <div className="grid gap-8 xl:grid-cols-[360px_1fr_380px] lg:grid-cols-[320px_1fr_360px]">
// // // // //         {/* LEFT: Projects + Items with checkboxes */}
// // // // //         <div className="space-y-6">
// // // // //           <GradientFrame>
// // // // //             <Card className="border-0 rounded-3xl">
// // // // //               <CardHeader className="pb-3">
// // // // //                 <CardTitle className="flex items-center gap-2 text-lg text-neutral-800">
// // // // //                   <IconFolder className="h-5 w-5 text-neutral-600" />
// // // // //                   Projects
// // // // //                 </CardTitle>
// // // // //                 <CardDescription className="text-neutral-500">
// // // // //                   Multi-select projects & items to post.
// // // // //                 </CardDescription>
// // // // //               </CardHeader>
// // // // //               <CardContent className="space-y-3">
// // // // //                 {filteredProjects.length === 0 && (
// // // // //                   <div className="text-sm text-neutral-500">No items found.</div>
// // // // //                 )}
// // // // //                 <div className="max-h-[560px] overflow-auto pr-1">
// // // // //                   {filteredProjects.map((p, idx) => {
// // // // //                     const expanded = expandedProjectIds.has(p.id);
// // // // //                     const projectSelected = isProjectSelected(p.id);
// // // // //                     const selectedCount = p.items.filter(it => selectedItemIds.has(it.id)).length;
// // // // //                     const total = p.items.length;

// // // // //                     return (
// // // // //                       <div key={p.id} className="rounded-2xl border border-neutral-200 bg-white mb-3">
// // // // //                         {/* Project row */}
// // // // //                         <div className="flex items-center justify-between p-3">
// // // // //                           <div className="flex items-center gap-3">
// // // // //                             <Button
// // // // //                               variant="ghost"
// // // // //                               size="icon"
// // // // //                               onClick={() => toggleProjectExpand(p.id)}
// // // // //                               className="h-7 w-7 rounded-full"
// // // // //                               aria-label={expanded ? "Collapse" : "Expand"}
// // // // //                             >
// // // // //                               {expanded ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
// // // // //                             </Button>

// // // // //                             <Checkbox
// // // // //                               checked={projectSelected}
// // // // //                               onCheckedChange={(v) => setProjectChecked(p.id, !!v)}
// // // // //                               className="mr-1"
// // // // //                               aria-label="Select project"
// // // // //                             />

// // // // //                             <span className="text-sm font-medium text-neutral-800">
// // // // //                               {idx + 1}. {p.name}
// // // // //                             </span>
// // // // //                           </div>

// // // // //                           <Badge variant="outline" className={cn("rounded-full", selectedCount ? "border-emerald-300 text-emerald-700" : "border-neutral-300 text-neutral-600")}>
// // // // //                             {selectedCount}/{total}
// // // // //                           </Badge>
// // // // //                         </div>

// // // // //                         {/* Items list */}
// // // // //                         {expanded && (
// // // // //                           <div className="border-t border-neutral-200">
// // // // //                             {p.items.map((it, iidx) => {
// // // // //                               const checked = isItemSelected(it.id);
// // // // //                               return (
// // // // //                                 <div
// // // // //                                   key={it.id}
// // // // //                                   className={cn(
// // // // //                                     "flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition",
// // // // //                                     checked && "bg-emerald-50/40"
// // // // //                                   )}
// // // // //                                 >
// // // // //                                   <div className="flex items-center gap-3 min-w-0">
// // // // //                                     <Checkbox
// // // // //                                       checked={checked}
// // // // //                                       onCheckedChange={(v) => setItemChecked(p.id, it.id, !!v)}
// // // // //                                       aria-label="Select item"
// // // // //                                     />
// // // // //                                     <button
// // // // //                                       className="text-left min-w-0"
// // // // //                                       onClick={() => setFocusedItemId(it.id)}
// // // // //                                     >
// // // // //                                       <div className="text-sm font-medium text-neutral-800 truncate max-w-[220px]">
// // // // //                                         {iidx + 1}. {getItemTitle(it) || (getItemKeywords(it)[0] ?? "Untitled")}
// // // // //                                       </div>
// // // // //                                       <div className="text-xs text-neutral-500 truncate max-w-[220px]">
// // // // //                                         {getItemKeywords(it).join(", ")}
// // // // //                                       </div>
// // // // //                                     </button>
// // // // //                                   </div>

// // // // //                                   {checked && (
// // // // //                                     <IconCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
// // // // //                                   )}
// // // // //                                 </div>
// // // // //                               );
// // // // //                             })}
// // // // //                           </div>
// // // // //                         )}
// // // // //                       </div>
// // // // //                     );
// // // // //                   })}
// // // // //                 </div>
// // // // //               </CardContent>
// // // // //             </Card>
// // // // //           </GradientFrame>
// // // // //         </div>

// // // // //         {/* CENTER: Listing defaults + focused preview */}
// // // // //         <div className="space-y-6">
// // // // //           <GradientFrame>
// // // // //             <Card className="border-0 rounded-3xl">
// // // // //               <CardHeader>
// // // // //                 <CardTitle className="flex items-center gap-2 text-lg text-neutral-800">
// // // // //                   <IconListDetails className="h-5 w-5 text-neutral-600" />
// // // // //                   Listing Defaults
// // // // //                 </CardTitle>
// // // // //                 <CardDescription className="text-neutral-500">
// // // // //                   These apply to all selected items (title/content come from each item).
// // // // //                 </CardDescription>
// // // // //               </CardHeader>
// // // // //               <CardContent className="space-y-6">
// // // // //                 {/* Keyword defaults */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold">Keyword Tags (add-on)</Label>
// // // // //                   <TagsInput value={keywordsDefaults} onChange={setKeywordsDefaults} />
// // // // //                 </section>

// // // // //                 {/* Category */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold">Category</Label>
// // // // //                   <Select value={category} onValueChange={setCategory}>
// // // // //                     <SelectTrigger className="bg-white">
// // // // //                       <SelectValue placeholder="Choose a category" />
// // // // //                     </SelectTrigger>
// // // // //                     <SelectContent>
// // // // //                       {CATEGORIES.map((c) => (
// // // // //                         <SelectItem key={c} value={c}>{c}</SelectItem>
// // // // //                       ))}
// // // // //                     </SelectContent>
// // // // //                   </Select>
// // // // //                 </section>

// // // // //                 {/* Default Image */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                     <IconPhoto className="h-4 w-4 text-rose-500" />
// // // // //                     Default Image (used if an item has none)
// // // // //                   </Label>
// // // // //                   <ImagePicker
// // // // //                     imageUrl={imageUrl}
// // // // //                     onImageUrlChange={setImageUrl}
// // // // //                     file={imageFile}
// // // // //                     onFileChange={setImageFile}
// // // // //                   />
// // // // //                 </section>

// // // // //                 {/* Address */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                     <IconMap2 className="h-4 w-4 text-emerald-600" />
// // // // //                     Address
// // // // //                   </Label>
// // // // //                   <div className="grid gap-3 md:grid-cols-2">
// // // // //                     <div>
// // // // //                       <Label className="text-xs">Country</Label>
// // // // //                       <Input value={country} onChange={(e) => setCountry(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">State</Label>
// // // // //                       <Input value={state} onChange={(e) => setStateVal(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">City</Label>
// // // // //                       <Input value={city} onChange={(e) => setCity(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">ZIP Code</Label>
// // // // //                       <Input value={zip} onChange={(e) => setZip(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                   </div>
// // // // //                   <div className="mt-3">
// // // // //                     <Label className="text-xs">Address Line</Label>
// // // // //                     <Input value={line1} onChange={(e) => setLine1(e.target.value)} className="bg-white" />
// // // // //                   </div>
// // // // //                 </section>

// // // // //                 {/* Contact */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                     <IconAddressBook className="h-4 w-4 text-indigo-600" />
// // // // //                     Contact
// // // // //                   </Label>
// // // // //                   <div className="grid gap-3 md:grid-cols-3">
// // // // //                     <div>
// // // // //                       <Label className="text-xs">Phone</Label>
// // // // //                       <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">Website</Label>
// // // // //                       <div className="flex items-center">
// // // // //                         <IconWorldWww className="h-4 w-4 mr-2 text-neutral-500" />
// // // // //                         <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="bg-white" />
// // // // //                       </div>
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">Email</Label>
// // // // //                       <div className="flex items-center">
// // // // //                         <IconAt className="h-4 w-4 mr-2 text-neutral-500" />
// // // // //                         <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white" />
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </section>

// // // // //                 {/* Socials */}
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                     <IconWorld className="h-4 w-4 text-sky-600" />
// // // // //                     Social Profiles
// // // // //                   </Label>
// // // // //                   <div className="grid gap-3 md:grid-cols-2">
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandFacebook className="h-3 w-3" /> Facebook Page
// // // // //                       </Label>
// // // // //                       <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandTwitter className="h-3 w-3" /> Twitter / X
// // // // //                       </Label>
// // // // //                       <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandLinkedin className="h-3 w-3" /> LinkedIn
// // // // //                       </Label>
// // // // //                       <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandPinterest className="h-3 w-3" /> Pinterest
// // // // //                       </Label>
// // // // //                       <Input value={pinterest} onChange={(e) => setPinterest(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandInstagram className="h-3 w-3" /> Instagram
// // // // //                       </Label>
// // // // //                       <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandCpp className="h-3 w-3" /> Yelp
// // // // //                       </Label>
// // // // //                       <Input value={yelp} onChange={(e) => setYelp(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                     <div className="md:col-span-2">
// // // // //                       <Label className="text-xs flex items-center gap-1">
// // // // //                         <IconBrandGoogle className="h-3 w-3" /> Google Business Profile
// // // // //                       </Label>
// // // // //                       <Input value={gmb} onChange={(e) => setGmb(e.target.value)} className="bg-white" />
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </section>
// // // // //               </CardContent>
// // // // //             </Card>
// // // // //           </GradientFrame>

// // // // //           {/* Focused preview (Title + Content) */}
// // // // //           <GradientFrame>
// // // // //             <Card className="border-0 rounded-3xl">
// // // // //               <CardHeader>
// // // // //                 <CardTitle className="text-lg text-neutral-800">Preview (focused item)</CardTitle>
// // // // //                 <CardDescription className="text-neutral-500">
// // // // //                   Click any item in the Projects list to preview its Title & Content.
// // // // //                 </CardDescription>
// // // // //               </CardHeader>
// // // // //               <CardContent className="space-y-4">
// // // // //                 <div>
// // // // //                   <Label className="text-sm font-semibold">Title</Label>
// // // // //                   <Input
// // // // //                     value={focusedItem ? getItemTitle(focusedItem) : ""}
// // // // //                     readOnly
// // // // //                     placeholder="Select an item to preview"
// // // // //                     className="bg-neutral-50"
// // // // //                   />
// // // // //                 </div>
// // // // //                 <div>
// // // // //                   <Label className="text-sm font-semibold">Content (HTML/Text)</Label>
// // // // //                   <Textarea
// // // // //                     value={focusedItem ? getItemHtml(focusedItem) : ""}
// // // // //                     readOnly
// // // // //                     placeholder="Select an item to preview"
// // // // //                     className="min-h-[160px] bg-neutral-50"
// // // // //                   />
// // // // //                 </div>
// // // // //               </CardContent>
// // // // //             </Card>
// // // // //           </GradientFrame>
// // // // //         </div>

// // // // //         {/* RIGHT: Run settings */}
// // // // //         <div className="space-y-6">
// // // // //           <GradientFrame>
// // // // //             <Card className="border-0 rounded-3xl">
// // // // //               <CardHeader>
// // // // //                 <CardTitle className="flex items-center gap-2 text-lg text-neutral-800">
// // // // //                   <IconSparkles className="h-5 w-5 text-neutral-600" />
// // // // //                   Run Settings
// // // // //                 </CardTitle>
// // // // //                 <CardDescription className="text-neutral-500">
// // // // //                   Select site & credentials
// // // // //                 </CardDescription>
// // // // //               </CardHeader>
// // // // //               <CardContent className="space-y-5">
// // // // //                 <section>
// // // // //                   <Label className="text-sm font-semibold">Site</Label>
// // // // //                   <Select value={site} onValueChange={setSite}>
// // // // //                     <SelectTrigger className="bg-white">
// // // // //                       <SelectValue placeholder="Choose site…" />
// // // // //                     </SelectTrigger>
// // // // //                     <SelectContent>
// // // // //                       {SITES.map((s) => (
// // // // //                         <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
// // // // //                       ))}
// // // // //                     </SelectContent>
// // // // //                   </Select>
// // // // //                 </section>

// // // // //                 <section className="grid gap-3">
// // // // //                   <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                     <IconKey className="h-4 w-4 text-neutral-600" />
// // // // //                     Credentials
// // // // //                   </Label>
// // // // //                   <Input
// // // // //                     placeholder="Username / Email"
// // // // //                     value={username}
// // // // //                     onChange={(e) => setUsername(e.target.value)}
// // // // //                     className="bg-white"
// // // // //                   />
// // // // //                   <Input
// // // // //                     placeholder="Password"
// // // // //                     type="password"
// // // // //                     value={password}
// // // // //                     onChange={(e) => setPassword(e.target.value)}
// // // // //                     className="bg-white"
// // // // //                   />
// // // // //                 </section>

// // // // //                 <Separator />

// // // // //                 <div className="grid gap-2">
// // // // //                   <Button
// // // // //                     onClick={handleStart}
// // // // //                     disabled={!readyToStart || isStarting}
// // // // //                     className={cn(
// // // // //                       "rounded-2xl bg-neutral-900 text-white shadow-md hover:bg-neutral-800",
// // // // //                       !readyToStart && "opacity-60 cursor-not-allowed"
// // // // //                     )}
// // // // //                   >
// // // // //                     <IconPlayerPlay className="h-4 w-4 mr-2" />
// // // // //                     {isStarting ? "Starting…" : `Start Automation (${selectedItemsArr.length})`}
// // // // //                   </Button>
// // // // //                   {jobId && (
// // // // //                     <div className="rounded-xl border bg-neutral-50 p-3">
// // // // //                       <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
// // // // //                         <span>Job: {jobId}</span>
// // // // //                         <span>{progress}%</span>
// // // // //                       </div>
// // // // //                       <Progress value={progress} className="h-2 bg-neutral-200" />
// // // // //                     </div>
// // // // //                   )}
// // // // //                 </div>
// // // // //               </CardContent>
// // // // //             </Card>
// // // // //           </GradientFrame>

// // // // //           <div className="rounded-2xl border bg-neutral-50 p-4 text-sm text-neutral-600">
// // // // //             <p className="mb-1">
// // // // //               ✅ <b>Flow:</b> Select projects → tick items → set defaults → Start Automation
// // // // //             </p>
// // // // //             <p>
// // // // //               🧩 <b>Payload:</b> <code>/api/automation/start</code> with site, login, profile, and multiple <code>listings[]</code>.
// // // // //             </p>
// // // // //           </div>

// // // // //           <div className="flex items-center gap-2">
// // // // //             <Button variant="outline" onClick={handleSavePreset} className="rounded-full">
// // // // //               Save Preset
// // // // //             </Button>
// // // // //             <Badge variant="outline" className="rounded-full">
// // // // //               Selected {selectedItemsArr.length} item(s)
// // // // //             </Badge>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // // /pages/classified-automation/index.tsx
// // // // // import React, { useEffect, useMemo,  useState } from "react";
// // // // // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // // // // import { Button } from "@/components/ui/button";
// // // // // import { Badge } from "@/components/ui/badge";
// // // // // import { Input } from "@/components/ui/input";
// // // // // import { Label } from "@/components/ui/label";
// // // // // import { Textarea } from "@/components/ui/textarea";
// // // // // import { Separator } from "@/components/ui/separator";
// // // // // import { Progress } from "@/components/ui/progress";
// // // // // import { Checkbox } from "@/components/ui/checkbox";
// // // // // import { toast } from "sonner";
// // // // // import { cn } from "@/lib/utils";
// // // // // import {
// // // // //   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// // // // // } from "@/components/ui/select";
// // // // // import {
// // // // //   IconWorld,
// // // // //   IconListDetails,
// // // // //   IconPlayerPlay,
// // // // //   IconSparkles,
// // // // //   IconAddressBook,
// // // // //   IconTags,
// // // // //   IconKey,
// // // // //   IconMap2,
// // // // //   IconPhoto,
// // // // //   IconWorldWww,
// // // // //   IconAt,
// // // // //   IconBrandFacebook,
// // // // //   IconBrandTwitter,
// // // // //   IconBrandLinkedin,
// // // // //   IconBrandPinterest,
// // // // //   IconBrandInstagram,
// // // // //   IconBrandCpp, // Yelp placeholder
// // // // //   IconBrandGoogle,
// // // // //   IconChevronDown,
// // // // //   IconChevronRight,
// // // // //   IconSearch,
// // // // //   IconFolder,
// // // // //   IconCheck,
// // // // //   IconCircleCheck,
// // // // //   IconCircleX,
// // // // // } from "@tabler/icons-react";

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Types
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // type GeneratedItem = {
// // // // //   id: string;
// // // // //   keyword?: string | string[];
// // // // //   title?: string;
// // // // //   html?: string;
// // // // //   generatedContent?: string;
// // // // //   images?: string[];
// // // // //   fileId?: string;       // project id
// // // // //   fileName?: string;     // optional
// // // // //   createdAt?: number | string;
// // // // // };

// // // // // type Address = { country: string; state: string; city: string; zip: string; line1: string; };
// // // // // type Socials = { facebook?: string; twitter?: string; linkedin?: string; pinterest?: string; instagram?: string; yelp?: string; gmb?: string; };

// // // // // type AutomationPayload = {
// // // // //   site: string;
// // // // //   login: { username: string; password: string };
// // // // //   profile: { phone?: string; website?: string; email?: string; socials?: Socials; address?: Address; };
// // // // //   listings: Array<{ id: string; title: string; contentHtml: string; images: string[]; keywords: string[]; category?: string; }>;
// // // // // };

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Constants
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // const CATEGORIES = ["Electronics","Home & Garden","Vehicles","Jobs","Services","Real Estate","Pets","Books","Fashion","Sports"];
// // // // // const SITES = [{ value: "site-1.com", label: "Site 1" },{ value: "site-2.com", label: "Site 2" },{ value: "site-3.com", label: "Site 3" }];

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Data helpers (local store)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function loadGeneratedItems(): GeneratedItem[] {
// // // // //   const keys = ["content_items_v1","content-items","seomatic_content_items"];
// // // // //   for (const k of keys) {
// // // // //     try {
// // // // //       const raw = localStorage.getItem(k);
// // // // //       if (raw) {
// // // // //         const arr = JSON.parse(raw);
// // // // //         if (Array.isArray(arr)) return arr;
// // // // //       }
// // // // //     } catch {}
// // // // //   }
// // // // //   try {
// // // // //     const raw = sessionStorage.getItem("open-content-item_v1")
// // // // //       ?? localStorage.getItem("open-content-item_v1_fallback");
// // // // //     if (raw) {
// // // // //       const it = JSON.parse(raw);
// // // // //       if (it && typeof it === "object") return [it];
// // // // //     }
// // // // //   } catch {}
// // // // //   return [];
// // // // // }
// // // // // const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// // // // // const getItemHtml = (it: GeneratedItem) => (it.html ?? it.generatedContent ?? "").toString();
// // // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // // //   if (typeof it.keyword === "string") {
// // // // //     return it.keyword.split(/[,\|]/).map(s => s.trim()).filter(Boolean);
// // // // //   }
// // // // //   return [];
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * UI helpers (premium white theme + symmetry)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function AccentCard({ children }: { children: React.ReactNode }) {
// // // // //   return (
// // // // //     <div className="rounded-2xl ring-1 ring-neutral-200/80 bg-white shadow-sm overflow-hidden">
// // // // //       <div className="h-1.5 bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900" />
// // // // //       {children}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
// // // // //   return (
// // // // //     <div className="flex items-center gap-2 text-[15px] font-semibold text-neutral-900">
// // // // //       {icon} {children}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // function TagsInput({
// // // // //   value, onChange, placeholder = "Type keyword and press Enter",
// // // // // }: { value: string[]; onChange: (tags: string[]) => void; placeholder?: string; }) {
// // // // //   const [draft, setDraft] = useState("");
// // // // //   function addTagFromDraft() {
// // // // //     const parts = draft.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
// // // // //     if (parts.length) {
// // // // //       const set = new Set([...value, ...parts]);
// // // // //       onChange(Array.from(set));
// // // // //       setDraft("");
// // // // //     }
// // // // //   }
// // // // //   return (
// // // // //     <div className="rounded-xl ring-1 ring-neutral-200 bg-white p-3">
// // // // //       <div className="flex flex-wrap gap-2 mb-2">
// // // // //         {value.map((t) => (
// // // // //           <span key={t} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 text-neutral-800 px-3 py-1 text-xs ring-1 ring-neutral-300">
// // // // //             <IconTags className="h-3 w-3" />
// // // // //             {t}
// // // // //             <button onClick={() => onChange(value.filter((x) => x !== t))} className="ml-1 hover:text-neutral-950" aria-label={`Remove ${t}`}>
// // // // //               ×
// // // // //             </button>
// // // // //           </span>
// // // // //         ))}
// // // // //       </div>
// // // // //       <Input
// // // // //         value={draft}
// // // // //         onChange={(e) => setDraft(e.target.value)}
// // // // //         onKeyDown={(e) => {
// // // // //           if (e.key === "Enter") { e.preventDefault(); addTagFromDraft(); }
// // // // //           if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
// // // // //         }}
// // // // //         placeholder={placeholder}
// // // // //         className="bg-white"
// // // // //       />
// // // // //       <p className="text-xs text-neutral-500 mt-1">Use Enter or comma to add</p>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // function ImagePicker({
// // // // //   imageUrl, onImageUrlChange, file, onFileChange,
// // // // // }: { imageUrl: string; onImageUrlChange: (v: string) => void; file: File | null; onFileChange: (f: File | null) => void; }) {
// // // // //   const preview = useMemo(() => (file ? URL.createObjectURL(file) : imageUrl || ""), [file, imageUrl]);
// // // // //   return (
// // // // //     <div className="grid gap-3">
// // // // //       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// // // // //         <div>
// // // // //           <Label className="text-sm">Image URL</Label>
// // // // //           <Input placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => onImageUrlChange(e.target.value)} className="bg-white" />
// // // // //         </div>
// // // // //         <div>
// // // // //           <Label className="text-sm">Upload Image</Label>
// // // // //           <div className="flex items-center gap-3">
// // // // //             <Input type="file" accept="image/*" className="bg-white" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
// // // // //             {file && <Badge variant="outline" className="rounded-full">{file.name}</Badge>}
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //       {preview ? (
// // // // //         <div className="rounded-xl ring-1 ring-neutral-200 bg-white p-3">
// // // // //           {/* eslint-disable-next-line @next/next/no-img-element */}
// // // // //           <img src={preview} alt="preview" className="max-h-56 w-auto rounded-lg object-cover" />
// // // // //         </div>
// // // // //       ) : (
// // // // //         <div className="rounded-xl ring-1 ring-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-500">No preview</div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* Preset Save/Load */
// // // // // const PRESET_KEY = "classified_automation_preset_v1";
// // // // // function savePreset(data: any) { localStorage.setItem(PRESET_KEY, JSON.stringify(data)); }
// // // // // function loadPreset(): any | null { try { const raw = localStorage.getItem(PRESET_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }

// // // // // /* Fake uploader (replace with real) */
// // // // // async function uploadImageAndGetUrl(file: File): Promise<string> { return URL.createObjectURL(file); }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * MAIN
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // export default function ClassifiedAutomationPage() {
// // // // //   /* Load all generated items */
// // // // //   const [items, setItems] = useState<GeneratedItem[]>([]);
// // // // //   useEffect(() => setItems(loadGeneratedItems()), []);

// // // // //   /* Group by project (fileId) */
// // // // //   const projects = useMemo(() => {
// // // // //     const map = new Map<string, GeneratedItem[]>();
// // // // //     for (const it of items) {
// // // // //       const key = it.fileId ?? "__misc__";
// // // // //       if (!map.has(key)) map.set(key, []);
// // // // //       map.get(key)!.push(it);
// // // // //     }
// // // // //     return Array.from(map.entries()).map(([pid, arr]) => ({
// // // // //       id: pid,
// // // // //       name: arr[0]?.fileName || pid || "Untitled Project",
// // // // //       items: arr,
// // // // //     }));
// // // // //   }, [items]);

// // // // //   /* Search (filters items inside projects) */
// // // // //   const [search, setSearch] = useState("");

// // // // //   /* Expansion + selection */
// // // // //   const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
// // // // //   const toggleProjectExpand = (pid: string) => setExpandedProjectIds(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n; });
// // // // //   const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
// // // // //   const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

// // // // //   const isProjectSelected = (pid: string) => selectedProjectIds.has(pid);
// // // // //   const isItemSelected = (iid: string) => selectedItemIds.has(iid);

// // // // //   const setProjectChecked = (pid: string, checked: boolean) => {
// // // // //     setSelectedProjectIds(prev => { const n = new Set(prev); checked ? n.add(pid) : n.delete(pid); return n; });
// // // // //     const proj = projects.find(p => p.id === pid);
// // // // //     if (proj) {
// // // // //       setSelectedItemIds(prev => {
// // // // //         const n = new Set(prev);
// // // // //         for (const it of proj.items) { checked ? n.add(it.id) : n.delete(it.id); }
// // // // //         return n;
// // // // //       });
// // // // //     }
// // // // //   };

// // // // //   const setItemChecked = (pid: string, iid: string, checked: boolean) => {
// // // // //     setSelectedItemIds(prev => { const n = new Set(prev); checked ? n.add(iid) : n.delete(iid); return n; });
// // // // //     const proj = projects.find(p => p.id === pid);
// // // // //     if (proj) {
// // // // //       const after = new Set(selectedItemIds);
// // // // //       checked ? after.add(iid) : after.delete(iid);
// // // // //       const allSelected = proj.items.every(it => after.has(it.id));
// // // // //       const noneSelected = proj.items.every(it => !after.has(it.id));
// // // // //       setSelectedProjectIds(prev => {
// // // // //         const n = new Set(prev);
// // // // //         if (allSelected) n.add(pid);
// // // // //         else if (noneSelected) n.delete(pid);
// // // // //         return n;
// // // // //       });
// // // // //     }
// // // // //   };

// // // // //   const filteredProjects = useMemo(() => {
// // // // //     const q = search.toLowerCase().trim();
// // // // //     if (!q) return projects;
// // // // //     return projects.map(p => {
// // // // //       const its = p.items.filter(it => {
// // // // //         const txt = `${getItemTitle(it)} ${getItemKeywords(it).join(" ")}`.toLowerCase();
// // // // //         return txt.includes(q);
// // // // //       });
// // // // //       return { ...p, items: its };
// // // // //     }).filter(p => p.items.length > 0);
// // // // //   }, [projects, search]);

// // // // //   const selectedItemsArr = useMemo(() => items.filter(it => selectedItemIds.has(it.id)), [items, selectedItemIds]);

// // // // //   /* Defaults (apply to all selected items) */
// // // // //   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
// // // // //   const [category, setCategory] = useState<string>("");

// // // // //   // Contact / profile
// // // // //   const [phone, setPhone] = useState("");
// // // // //   const [website, setWebsite] = useState("");
// // // // //   const [email, setEmail] = useState("");

// // // // //   // Socials
// // // // //   const [facebook, setFacebook] = useState("");
// // // // //   const [twitter, setTwitter] = useState("");
// // // // //   const [linkedin, setLinkedin] = useState("");
// // // // //   const [pinterest, setPinterest] = useState("");
// // // // //   const [instagram, setInstagram] = useState("");
// // // // //   const [yelp, setYelp] = useState("");
// // // // //   const [gmb, setGmb] = useState("");

// // // // //   // Address
// // // // //   const [country, setCountry] = useState("");
// // // // //   const [state, setStateVal] = useState("");
// // // // //   const [city, setCity] = useState("");
// // // // //   const [zip, setZip] = useState("");
// // // // //   const [line1, setLine1] = useState("");

// // // // //   // Default image (used if item has none)
// // // // //   const [imageUrl, setImageUrl] = useState("");
// // // // //   const [imageFile, setImageFile] = useState<File | null>(null);

// // // // //   // Run settings
// // // // //   const [site, setSite] = useState<string>("");
// // // // //   const [username, setUsername] = useState("");
// // // // //   const [password, setPassword] = useState("");

// // // // //   // UX bits
// // // // //   const [isStarting, setIsStarting] = useState(false);
// // // // //   const [jobId, setJobId] = useState<string | null>(null);
// // // // //   const [progress, setProgress] = useState(0);

// // // // //   // Focus preview item
// // // // //   const [focusedItemId, setFocusedItemId] = useState<string>("");
// // // // //   const focusedItem = useMemo(() => items.find(x => x.id === focusedItemId), [items, focusedItemId]);

// // // // //   // Preset load
// // // // //   useEffect(() => {
// // // // //     const p = loadPreset();
// // // // //     if (p) {
// // // // //       setPhone(p.phone ?? ""); setWebsite(p.website ?? ""); setEmail(p.email ?? "");
// // // // //       setCountry(p.address?.country ?? ""); setStateVal(p.address?.state ?? ""); setCity(p.address?.city ?? "");
// // // // //       setZip(p.address?.zip ?? ""); setLine1(p.address?.line1 ?? "");
// // // // //       setFacebook(p.socials?.facebook ?? ""); setTwitter(p.socials?.twitter ?? ""); setLinkedin(p.socials?.linkedin ?? "");
// // // // //       setPinterest(p.socials?.pinterest ?? ""); setInstagram(p.socials?.instagram ?? ""); setYelp(p.socials?.yelp ?? "");
// // // // //       setGmb(p.socials?.gmb ?? ""); setSite(p.site ?? ""); setUsername(p.username ?? "");
// // // // //     }
// // // // //   }, []);

// // // // //   function handleSavePreset() {
// // // // //     savePreset({
// // // // //       site, username, phone, website, email,
// // // // //       address: { country, state: state, city, zip, line1 },
// // // // //       socials: { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb },
// // // // //     });
// // // // //     toast.success("Preset saved");
// // // // //   }

// // // // //   const readyToStart = !!site && !!username && !!password && selectedItemsArr.length > 0;

// // // // //   async function handleStart() {
// // // // //     if (!readyToStart) {
// // // // //       toast.error("Select content and fill site + credentials.");
// // // // //       return;
// // // // //     }
// // // // //     setIsStarting(true);
// // // // //     try {
// // // // //       let defaultImageUrl = imageUrl.trim();
// // // // //       if (!defaultImageUrl && imageFile) defaultImageUrl = await uploadImageAndGetUrl(imageFile);

// // // // //       const missingImageFor = selectedItemsArr.filter(it => !(it.images?.length) && !defaultImageUrl);
// // // // //       if (missingImageFor.length) {
// // // // //         toast.error("Some selected items have no image. Add a default image or deselect them.");
// // // // //         setIsStarting(false);
// // // // //         return;
// // // // //       }

// // // // //       const listings = selectedItemsArr.map((it) => {
// // // // //         const ownKeywords = getItemKeywords(it);
// // // // //         const mergedKeywords = Array.from(new Set([...ownKeywords, ...keywordsDefaults])).filter(Boolean);
// // // // //         const imgs = (it.images && it.images.length) ? it.images : (defaultImageUrl ? [defaultImageUrl] : []);
// // // // //         return { id: it.id, title: getItemTitle(it), contentHtml: getItemHtml(it), images: imgs, keywords: mergedKeywords, category: category || undefined };
// // // // //       });

// // // // //       const payload: AutomationPayload = {
// // // // //         site,
// // // // //         login: { username, password },
// // // // //         profile: { phone, website, email,
// // // // //           socials: { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb },
// // // // //           address: { country, state, city, zip, line1 } },
// // // // //         listings,
// // // // //       };

// // // // //       const res = await fetch("/api/automation/start", {
// // // // //         method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
// // // // //       });
// // // // //       if (!res.ok) throw new Error(`Backend error: ${res.status}`);
// // // // //       const data = await res.json();
// // // // //       setJobId(data.jobId ?? null);
// // // // //       toast.success(`Automation started for ${listings.length} item(s)`);

// // // // //       if (data.jobId) {
// // // // //         let tries = 0;
// // // // //         const t = setInterval(async () => {
// // // // //           tries++;
// // // // //           try {
// // // // //             const s = await fetch(`/api/automation/status/${data.jobId}`);
// // // // //             if (s.ok) {
// // // // //               const j = await s.json();
// // // // //               setProgress(j.progress ?? 0);
// // // // //               if (j.status === "done" || j.status === "error") {
// // // // //                 clearInterval(t);
// // // // //                 toast[j.status === "done" ? "success" : "error"](j.status === "done" ? "Completed" : "Job error");
// // // // //               }
// // // // //             }
// // // // //           } catch {}
// // // // //           if (tries > 300) clearInterval(t);
// // // // //         }, 1500);
// // // // //       }
// // // // //     } catch (err: any) {
// // // // //       console.error(err);
// // // // //       toast.error(err?.message ?? "Failed to start");
// // // // //     } finally {
// // // // //       setIsStarting(false);
// // // // //     }
// // // // //   }

// // // // //   /* ───────────────────────────────────────────────────────── */
// // // // //   return (
// // // // //     <div className="min-h-screen bg-neutral-50">
// // // // //       <div className="mx-auto max-w-screen-2xl px-6 py-8">
// // // // //         {/* Top Header */}
// // // // //         <AccentCard>
// // // // //           <Card className="border-0 shadow-none">
// // // // //             <CardHeader className="pb-4">
// // // // //               <div className="flex items-center justify-between gap-4">
// // // // //                 <div>
// // // // //                   <CardTitle className="flex items-center gap-2 text-2xl text-neutral-900">
// // // // //                     <IconListDetails className="h-6 w-6 text-neutral-700" />
// // // // //                     Classified Listing Automation
// // // // //                   </CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">
// // // // //                     Symmetric layout • Premium white theme • Multi-project & multi-item selection
// // // // //                   </CardDescription>
// // // // //                 </div>
// // // // //                 <div className="hidden md:flex items-center gap-2">
// // // // //                   <div className="relative">
// // // // //                     <IconSearch className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // // //                     <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title / keywords…" className="pl-9 bg-white w-[320px]" />
// // // // //                   </div>
// // // // //                   <Badge variant="outline" className="rounded-full">Selected: {selectedItemsArr.length}</Badge>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </CardHeader>
// // // // //           </Card>
// // // // //         </AccentCard>

// // // // //         {/* 3 symmetric columns */}
// // // // //         <div className="mt-8 grid gap-8 xl:grid-cols-12">
// // // // //           {/* LEFT (xl: 4) — Projects */}
// // // // //           <div className="xl:col-span-4">
// // // // //             <div className="sticky top-6 space-y-6">
// // // // //               <AccentCard>
// // // // //                 <Card className="border-0 shadow-none">
// // // // //                   <CardHeader className="pb-3">
// // // // //                     <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
// // // // //                       <IconFolder className="h-5 w-5 text-neutral-700" />
// // // // //                       Projects
// // // // //                     </CardTitle>
// // // // //                     <CardDescription className="text-neutral-600">
// // // // //                       Tick projects or individual items to post.
// // // // //                     </CardDescription>
// // // // //                   </CardHeader>
// // // // //                   <CardContent className="space-y-3">
// // // // //                     <div className="md:hidden mb-2">
// // // // //                       <div className="relative">
// // // // //                         <IconSearch className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // // //                         <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title / keywords…" className="pl-9 bg-white" />
// // // // //                       </div>
// // // // //                     </div>

// // // // //                     <div className="flex items-center justify-between text-xs text-neutral-600">
// // // // //                       <div className="flex items-center gap-2">
// // // // //                         <Button variant="outline" size="sm" onClick={() => {
// // // // //                           const all = new Set<string>();
// // // // //                           filteredProjects.forEach(p => p.items.forEach(it => all.add(it.id)));
// // // // //                           setSelectedItemIds(all);
// // // // //                           setSelectedProjectIds(new Set(filteredProjects.map(p => p.id)));
// // // // //                         }} className="rounded-full h-7 px-3">
// // // // //                           <IconCircleCheck className="h-3.5 w-3.5 mr-1" /> Select All Visible
// // // // //                         </Button>
// // // // //                         <Button variant="outline" size="sm" onClick={() => { setSelectedItemIds(new Set()); setSelectedProjectIds(new Set()); }} className="rounded-full h-7 px-3">
// // // // //                           <IconCircleX className="h-3.5 w-3.5 mr-1" /> Clear
// // // // //                         </Button>
// // // // //                       </div>
// // // // //                       <span className="text-neutral-500">Projects: {filteredProjects.length}</span>
// // // // //                     </div>

// // // // //                     <div className="max-h-[620px] overflow-auto pr-1">
// // // // //                       {filteredProjects.length === 0 && (
// // // // //                         <div className="text-sm text-neutral-500">No items found.</div>
// // // // //                       )}

// // // // //                       {filteredProjects.map((p, idx) => {
// // // // //                         const expanded = expandedProjectIds.has(p.id);
// // // // //                         const projectSelected = isProjectSelected(p.id);
// // // // //                         const selectedCount = p.items.filter(it => selectedItemIds.has(it.id)).length;
// // // // //                         const total = p.items.length;

// // // // //                         return (
// // // // //                           <div key={p.id} className="rounded-xl ring-1 ring-neutral-200 bg-white mb-3 overflow-hidden">
// // // // //                             {/* Project row */}
// // // // //                             <div className="flex items-center justify-between p-3">
// // // // //                               <div className="flex items-center gap-3">
// // // // //                                 <Button variant="ghost" size="icon" onClick={() => toggleProjectExpand(p.id)} className="h-7 w-7 rounded-full" aria-label={expanded ? "Collapse" : "Expand"}>
// // // // //                                   {expanded ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
// // // // //                                 </Button>

// // // // //                                 <Checkbox checked={projectSelected} onCheckedChange={(v) => setProjectChecked(p.id, !!v)} className="mr-1" aria-label="Select project" />
// // // // //                                 <span className="text-sm font-medium text-neutral-900 tabular-nums">{String(idx + 1).padStart(2, "0")}.</span>
// // // // //                                 <span className="text-sm font-medium text-neutral-900">{p.name}</span>
// // // // //                               </div>

// // // // //                               <Badge variant="outline" className={cn("rounded-full", selectedCount ? "border-neutral-800 text-neutral-900" : "border-neutral-300 text-neutral-600")}>
// // // // //                                 {selectedCount}/{total}
// // // // //                               </Badge>
// // // // //                             </div>

// // // // //                             {/* Items list */}
// // // // //                             {expanded && (
// // // // //                               <div className="border-t border-neutral-200 divide-y divide-neutral-100">
// // // // //                                 {p.items.map((it, iidx) => {
// // // // //                                   const checked = isItemSelected(it.id);
// // // // //                                   return (
// // // // //                                     <div key={it.id}
// // // // //                                       className={cn("flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition",
// // // // //                                         checked && "bg-neutral-50")}
// // // // //                                     >
// // // // //                                       <div className="flex items-center gap-3 min-w-0">
// // // // //                                         <span className="text-[11px] text-neutral-500 w-6 text-right tabular-nums">{iidx + 1}</span>
// // // // //                                         <Checkbox checked={checked} onCheckedChange={(v) => setItemChecked(p.id, it.id, !!v)} aria-label="Select item" />
// // // // //                                         <button className="text-left min-w-0" onClick={() => setFocusedItemId(it.id)}>
// // // // //                                           <div className="text-sm font-medium text-neutral-900 truncate max-w-[220px]">
// // // // //                                             {getItemTitle(it) || (getItemKeywords(it)[0] ?? "Untitled")}
// // // // //                                           </div>
// // // // //                                           <div className="text-xs text-neutral-500 truncate max-w-[220px]">
// // // // //                                             {getItemKeywords(it).join(", ")}
// // // // //                                           </div>
// // // // //                                         </button>
// // // // //                                       </div>
// // // // //                                       {checked && <IconCheck className="h-4 w-4 text-neutral-900 flex-shrink-0" />}
// // // // //                                     </div>
// // // // //                                   );
// // // // //                                 })}
// // // // //                               </div>
// // // // //                             )}
// // // // //                           </div>
// // // // //                         );
// // // // //                       })}
// // // // //                     </div>
// // // // //                   </CardContent>
// // // // //                 </Card>
// // // // //               </AccentCard>
// // // // //             </div>
// // // // //           </div>

// // // // //           {/* CENTER (xl: 5) — Defaults + Preview */}
// // // // //           <div className="xl:col-span-5 space-y-6">
// // // // //             <AccentCard>
// // // // //               <Card className="border-0 shadow-none">
// // // // //                 <CardHeader className="pb-4">
// // // // //                   <CardTitle className="text-lg text-neutral-900">Listing Defaults</CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">Apply to all selected items (titles & content come from each item).</CardDescription>
// // // // //                 </CardHeader>
// // // // //                 <CardContent className="space-y-6">
// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle icon={<IconTags className="h-4 w-4 text-neutral-700" />}>Keyword Tags (add-on)</SectionTitle>
// // // // //                     <TagsInput value={keywordsDefaults} onChange={setKeywordsDefaults} />
// // // // //                   </section>

// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle>Category</SectionTitle>
// // // // //                     <Select value={category} onValueChange={setCategory}>
// // // // //                       <SelectTrigger className="bg-white"><SelectValue placeholder="Choose a category" /></SelectTrigger>
// // // // //                       <SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
// // // // //                     </Select>
// // // // //                   </section>

// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle icon={<IconPhoto className="h-4 w-4 text-neutral-700" />}>Default Image</SectionTitle>
// // // // //                     <ImagePicker imageUrl={imageUrl} onImageUrlChange={setImageUrl} file={imageFile} onFileChange={setImageFile} />
// // // // //                     <p className="text-xs text-neutral-500">Used only if an item has no image.</p>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle icon={<IconMap2 className="h-4 w-4 text-neutral-700" />}>Address</SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-2">
// // // // //                       <div><Label className="text-xs">Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">State</Label><Input value={state} onChange={(e) => setStateVal(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">ZIP Code</Label><Input value={zip} onChange={(e) => setZip(e.target.value)} className="bg-white" /></div>
// // // // //                     </div>
// // // // //                     <div><Label className="text-xs">Address Line</Label><Input value={line1} onChange={(e) => setLine1(e.target.value)} className="bg-white" /></div>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle icon={<IconAddressBook className="h-4 w-4 text-neutral-700" />}>Contact</SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-3">
// // // // //                       <div><Label className="text-xs">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">Website</Label><div className="flex items-center"><IconWorldWww className="h-4 w-4 mr-2 text-neutral-500" /><Input value={website} onChange={(e) => setWebsite(e.target.value)} className="bg-white" /></div></div>
// // // // //                       <div><Label className="text-xs">Email</Label><div className="flex items-center"><IconAt className="h-4 w-4 mr-2 text-neutral-500" /><Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white" /></div></div>
// // // // //                     </div>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle icon={<IconWorld className="h-4 w-4 text-neutral-700" />}>Social Profiles</SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-2">
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandFacebook className="h-3 w-3" /> Facebook Page</Label><Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandTwitter className="h-3 w-3" /> Twitter / X</Label><Input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandLinkedin className="h-3 w-3" /> LinkedIn</Label><Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandPinterest className="h-3 w-3" /> Pinterest</Label><Input value={pinterest} onChange={(e) => setPinterest(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandInstagram className="h-3 w-3" /> Instagram</Label><Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandCpp className="h-3 w-3" /> Yelp</Label><Input value={yelp} onChange={(e) => setYelp(e.target.value)} className="bg-white" /></div>
// // // // //                       <div className="md:col-span-2"><Label className="text-xs flex items-center gap-1"><IconBrandGoogle className="h-3 w-3" /> Google Business Profile</Label><Input value={gmb} onChange={(e) => setGmb(e.target.value)} className="bg-white" /></div>
// // // // //                     </div>
// // // // //                   </section>
// // // // //                 </CardContent>
// // // // //               </Card>
// // // // //             </AccentCard>

// // // // //             <AccentCard>
// // // // //               <Card className="border-0 shadow-none">
// // // // //                 <CardHeader className="pb-3">
// // // // //                   <CardTitle className="text-lg text-neutral-900">Preview (focused item)</CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">Click any item in Projects list to preview Title & Content.</CardDescription>
// // // // //                 </CardHeader>
// // // // //                 <CardContent className="space-y-4">
// // // // //                   <div>
// // // // //                     <Label className="text-sm font-semibold">Title</Label>
// // // // //                     <Input value={focusedItem ? getItemTitle(focusedItem) : ""} readOnly placeholder="Select an item to preview" className="bg-neutral-50" />
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <Label className="text-sm font-semibold">Content (HTML/Text)</Label>
// // // // //                     <Textarea value={focusedItem ? getItemHtml(focusedItem) : ""} readOnly placeholder="Select an item to preview" className="min-h-[160px] bg-neutral-50" />
// // // // //                   </div>
// // // // //                 </CardContent>
// // // // //               </Card>
// // // // //             </AccentCard>
// // // // //           </div>

// // // // //           {/* RIGHT (xl: 3) — Run settings */}
// // // // //           <div className="xl:col-span-3">
// // // // //             <div className="sticky top-6 space-y-6">
// // // // //               <AccentCard>
// // // // //                 <Card className="border-0 shadow-none">
// // // // //                   <CardHeader className="pb-4">
// // // // //                     <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
// // // // //                       <IconSparkles className="h-5 w-5 text-neutral-700" />
// // // // //                       Run Settings
// // // // //                     </CardTitle>
// // // // //                     <CardDescription className="text-neutral-600">Select site & credentials</CardDescription>
// // // // //                   </CardHeader>
// // // // //                   <CardContent className="space-y-5">
// // // // //                     <section>
// // // // //                       <Label className="text-sm font-semibold">Site</Label>
// // // // //                       <Select value={site} onValueChange={setSite}>
// // // // //                         <SelectTrigger className="bg-white"><SelectValue placeholder="Choose site…" /></SelectTrigger>
// // // // //                         <SelectContent>{SITES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
// // // // //                       </Select>
// // // // //                     </section>

// // // // //                     <section className="grid gap-3">
// // // // //                       <Label className="text-sm font-semibold flex items-center gap-2"><IconKey className="h-4 w-4 text-neutral-700" /> Credentials</Label>
// // // // //                       <Input placeholder="Username / Email" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-white" />
// // // // //                       <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white" />
// // // // //                     </section>

// // // // //                     <Separator />

// // // // //                     <div className="grid gap-2">
// // // // //                       <Button onClick={handleStart} disabled={!readyToStart || isStarting}
// // // // //                         className={cn("rounded-xl bg-neutral-900 text-white shadow-md hover:bg-neutral-800", !readyToStart && "opacity-60 cursor-not-allowed")}>
// // // // //                         <IconPlayerPlay className="h-4 w-4 mr-2" />
// // // // //                         {isStarting ? "Starting…" : `Start Automation (${selectedItemsArr.length})`}
// // // // //                       </Button>
// // // // //                       <div className="flex items-center justify-between text-xs text-neutral-600">
// // // // //                         <span className="flex items-center gap-1"><IconCheck className="h-3.5 w-3.5" /> Selected {selectedItemsArr.length}</span>
// // // // //                       </div>
// // // // //                       {jobId && (
// // // // //                         <div className="rounded-xl ring-1 ring-neutral-200 bg-neutral-50 p-3">
// // // // //                           <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
// // // // //                             <span>Job: {jobId}</span><span>{progress}%</span>
// // // // //                           </div>
// // // // //                           <Progress value={progress} className="h-2 bg-neutral-200" />
// // // // //                         </div>
// // // // //                       )}
// // // // //                     </div>
// // // // //                   </CardContent>
// // // // //                 </Card>
// // // // //               </AccentCard>

// // // // //               <div className="rounded-xl ring-1 ring-neutral-200 bg-white p-4 text-sm text-neutral-700">
// // // // //                 <p className="mb-1">✅ <b>Flow:</b> Select projects → tick items → set defaults → Start Automation</p>
// // // // //                 <p>🧩 <b>Payload:</b> <code>/api/automation/start</code> with site, login, profile, and multiple <code>listings[]</code>.</p>
// // // // //                 <div className="mt-3 flex items-center gap-2">
// // // // //                   <Button variant="outline" onClick={handleSavePreset} className="rounded-full">Save Preset</Button>
// // // // //                   <Badge variant="outline" className="rounded-full">Symmetric layout</Badge>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div> {/* /grid */}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // // /pages/classified-automation/index.tsx
// // // // // import React, { useEffect,  useState } from "react";
// // // // // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // // // // import { Button } from "@/components/ui/button";
// // // // // import { Badge } from "@/components/ui/badge";
// // // // // import { Input } from "@/components/ui/input";
// // // // // import { Label } from "@/components/ui/label";
// // // // // import { Textarea } from "@/components/ui/textarea";
// // // // // import { Separator } from "@/components/ui/separator";
// // // // // import { Progress } from "@/components/ui/progress";
// // // // // import { Checkbox } from "@/components/ui/checkbox";
// // // // // import { toast } from "sonner";
// // // // // import { cn } from "@/lib/utils";
// // // // // import {
// // // // //   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// // // // // } from "@/components/ui/select";

// // // // // import {
// // // // //   IconWorld,
// // // // //   IconListDetails,
// // // // //   IconPlayerPlay,
// // // // //   IconSparkles,
// // // // //   IconAddressBook,
// // // // //   IconTags,
// // // // //   IconKey,
// // // // //   IconMap2,
// // // // //   IconPhoto,
// // // // //   IconWorldWww,
// // // // //   IconAt,
// // // // //   IconBrandFacebook,
// // // // //   IconBrandTwitter,
// // // // //   IconBrandLinkedin,
// // // // //   IconBrandPinterest,
// // // // //   IconBrandInstagram,
// // // // //   IconBrandCpp, // Yelp placeholder (Tabler doesn't have Yelp)
// // // // //   IconBrandGoogle,
// // // // //   IconChevronDown,
// // // // //   IconChevronRight,
// // // // //   IconSearch,
// // // // //   IconFolder,
// // // // //   IconCheck,
// // // // //   IconCircleCheck,
// // // // //   IconCircleX,
// // // // // } from "@tabler/icons-react";

// // // // // import {
// // // // //   useListingAutomation,
// // // // //   type GeneratedItem,
// // // // //   type Socials,
// // // // // } from "./hooks/useListingAutomation";

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Constants
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // const CATEGORIES = [
// // // // //   "Electronics","Home & Garden","Vehicles","Jobs","Services",
// // // // //   "Real Estate","Pets","Books","Fashion","Sports",
// // // // // ];

// // // // // const SITES = [
// // // // //   { value: "site-1.com", label: "Site 1" },
// // // // //   { value: "site-2.com", label: "Site 2" },
// // // // //   { value: "site-3.com", label: "Site 3" },
// // // // // ];

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Local-storage loader (from your content app)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function loadGeneratedItems(): GeneratedItem[] {
// // // // //   const keys = ["content_items_v1", "content-items", "seomatic_content_items"];
// // // // //   for (const k of keys) {
// // // // //     try {
// // // // //       const raw = localStorage.getItem(k);
// // // // //       if (raw) {
// // // // //         const arr = JSON.parse(raw);
// // // // //         if (Array.isArray(arr)) return arr;
// // // // //       }
// // // // //     } catch {}
// // // // //   }
// // // // //   try {
// // // // //     const raw =
// // // // //       sessionStorage.getItem("open-content-item_v1") ??
// // // // //       localStorage.getItem("open-content-item_v1_fallback");
// // // // //     if (raw) {
// // // // //       const it = JSON.parse(raw);
// // // // //       if (it && typeof it === "object") return [it];
// // // // //     }
// // // // //   } catch {}
// // // // //   return [];
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Small UI helpers (premium white theme)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function AccentCard({ children }: { children: React.ReactNode }) {
// // // // //   return (
// // // // //     <div className="rounded-2xl ring-1 ring-neutral-200/80 bg-white shadow-sm overflow-hidden">
// // // // //       <div className="h-1.5 bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900" />
// // // // //       {children}
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // // function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
// // // // //   return <div className="flex items-center gap-2 text-[15px] font-semibold text-neutral-900">{icon}{children}</div>;
// // // // // }

// // // // // /* Tags Input */
// // // // // function TagsInput({
// // // // //   value, onChange, placeholder = "Type keyword and press Enter",
// // // // // }: { value: string[]; onChange: (tags: string[]) => void; placeholder?: string; }) {
// // // // //   const [draft, setDraft] = useState("");
// // // // //   function addTagFromDraft() {
// // // // //     const parts = draft.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
// // // // //     if (parts.length) {
// // // // //       const set = new Set([...value, ...parts]);
// // // // //       onChange(Array.from(set));
// // // // //       setDraft("");
// // // // //     }
// // // // //   }
// // // // //   return (
// // // // //     <div className="rounded-xl ring-1 ring-neutral-200 bg-white p-3">
// // // // //       <div className="flex flex-wrap gap-2 mb-2">
// // // // //         {value.map((t) => (
// // // // //           <span key={t} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 text-neutral-800 px-3 py-1 text-xs ring-1 ring-neutral-300">
// // // // //             <IconTags className="h-3 w-3" />
// // // // //             {t}
// // // // //             <button onClick={() => onChange(value.filter((x) => x !== t))} className="ml-1 hover:text-neutral-950" aria-label={`Remove ${t}`}>×</button>
// // // // //           </span>
// // // // //         ))}
// // // // //       </div>
// // // // //       <Input
// // // // //         value={draft}
// // // // //         onChange={(e) => setDraft(e.target.value)}
// // // // //         onKeyDown={(e) => {
// // // // //           if (e.key === "Enter") { e.preventDefault(); addTagFromDraft(); }
// // // // //           if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
// // // // //         }}
// // // // //         placeholder={placeholder}
// // // // //         className="bg-white"
// // // // //       />
// // // // //       <p className="text-xs text-neutral-500 mt-1">Use Enter or comma to add</p>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* Image Picker */
// // // // // function ImagePicker({
// // // // //   imageUrl, onImageUrlChange, file, onFileChange,
// // // // // }: { imageUrl: string; onImageUrlChange: (v: string) => void; file: File | null; onFileChange: (f: File | null) => void; }) {
// // // // //   const preview = React.useMemo(() => (file ? URL.createObjectURL(file) : imageUrl || ""), [file, imageUrl]);
// // // // //   return (
// // // // //     <div className="grid gap-3">
// // // // //       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// // // // //         <div>
// // // // //           <Label className="text-sm">Image URL</Label>
// // // // //           <Input placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => onImageUrlChange(e.target.value)} className="bg-white" />
// // // // //         </div>
// // // // //         <div>
// // // // //           <Label className="text-sm">Upload Image</Label>
// // // // //           <div className="flex items-center gap-3">
// // // // //             <Input type="file" accept="image/*" className="bg-white" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
// // // // //             {file && <Badge variant="outline" className="rounded-full">{file.name}</Badge>}
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //       {preview ? (
// // // // //         <div className="rounded-xl ring-1 ring-neutral-200 bg-white p-3">
// // // // //           {/* eslint-disable-next-line @next/next/no-img-element */}
// // // // //           <img src={preview} alt="preview" className="max-h-56 w-auto rounded-lg object-cover" />
// // // // //         </div>
// // // // //       ) : (
// // // // //         <div className="rounded-xl ring-1 ring-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-500">No preview</div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* Presets */
// // // // // const PRESET_KEY = "classified_automation_preset_v1";
// // // // // function savePreset(data: any) { localStorage.setItem(PRESET_KEY, JSON.stringify(data)); }
// // // // // function loadPreset(): any | null { try { const raw = localStorage.getItem(PRESET_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }

// // // // // /* Fake uploader (replace with real) */
// // // // // async function uploadImageAndGetUrl(file: File): Promise<string> { return URL.createObjectURL(file); }

// // // // // /* Tiny helpers from items */
// // // // // const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// // // // // const getItemHtml = (it: GeneratedItem) => (it.html ?? it.generatedContent ?? "").toString();
// // // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // // //   if (typeof it.keyword === "string")
// // // // //     return it.keyword.split(/[,\|]/).map((s) => s.trim()).filter(Boolean);
// // // // //   return [];
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * MAIN
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // export default function ClassifiedAutomationPage() {
// // // // //   /* Load all generated items */
// // // // //   const [items, setItems] = useState<GeneratedItem[]>([]);
// // // // //   useEffect(() => setItems(loadGeneratedItems()), []);

// // // // //   /* Hook wiring */
// // // // //   const {
// // // // //     // search & projects
// // // // //     search, setSearch, filteredProjects,
// // // // //     // expansion + selection
// // // // //     expandedProjectIds, toggleProjectExpand,
// // // // //      selectedItemIds,
// // // // //     isProjectSelected, isItemSelected,
// // // // //     setProjectChecked, setItemChecked,
// // // // //     selectAllVisible, clearSelection,
// // // // //     // preview
// // // // //  setFocusedItemId, focusedItem,
// // // // //     // selected array
// // // // //     selectedItems,
// // // // //     // automation
// // // // //     start, isStarting, jobId, progress,
// // // // //   } = useListingAutomation(items, {
// // // // //     uploadImage: uploadImageAndGetUrl,
// // // // //     statusPollIntervalMs: 1500,
// // // // //     maxPollMinutes: 15,
// // // // //   });

// // // // //   /* Defaults (apply to all selected items) */
// // // // //   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
// // // // //   const [category, setCategory] = useState<string>("");

// // // // //   // Contact / profile
// // // // //   const [phone, setPhone] = useState("");
// // // // //   const [website, setWebsite] = useState("");
// // // // //   const [email, setEmail] = useState("");

// // // // //   // Socials
// // // // //   const [facebook, setFacebook] = useState("");
// // // // //   const [twitter, setTwitter] = useState("");
// // // // //   const [linkedin, setLinkedin] = useState("");
// // // // //   const [pinterest, setPinterest] = useState("");
// // // // //   const [instagram, setInstagram] = useState("");
// // // // //   const [yelp, setYelp] = useState("");
// // // // //   const [gmb, setGmb] = useState("");

// // // // //   // Address
// // // // //   const [country, setCountry] = useState("");
// // // // //   const [state, setStateVal] = useState("");
// // // // //   const [city, setCity] = useState("");
// // // // //   const [zip, setZip] = useState("");
// // // // //   const [line1, setLine1] = useState("");

// // // // //   // Default image (used if item has none)
// // // // //   const [imageUrl, setImageUrl] = useState("");
// // // // //   const [imageFile, setImageFile] = useState<File | null>(null);

// // // // //   // Run settings
// // // // //   const [site, setSite] = useState<string>("");
// // // // //   const [username, setUsername] = useState("");
// // // // //   const [password, setPassword] = useState("");

// // // // //   // Derived state
// // // // //   const selectedCount = selectedItems.length;
// // // // //   const readyToStart = !!site && !!username && !!password && selectedCount > 0;

// // // // //   // Preset load
// // // // //   useEffect(() => {
// // // // //     const p = loadPreset();
// // // // //     if (p) {
// // // // //       setPhone(p.phone ?? ""); setWebsite(p.website ?? ""); setEmail(p.email ?? "");
// // // // //       setCountry(p.address?.country ?? ""); setStateVal(p.address?.state ?? ""); setCity(p.address?.city ?? "");
// // // // //       setZip(p.address?.zip ?? ""); setLine1(p.address?.line1 ?? "");
// // // // //       setFacebook(p.socials?.facebook ?? ""); setTwitter(p.socials?.twitter ?? ""); setLinkedin(p.socials?.linkedin ?? "");
// // // // //       setPinterest(p.socials?.pinterest ?? ""); setInstagram(p.socials?.instagram ?? ""); setYelp(p.socials?.yelp ?? "");
// // // // //       setGmb(p.socials?.gmb ?? ""); setSite(p.site ?? ""); setUsername(p.username ?? "");
// // // // //     }
// // // // //   }, []);

// // // // //   function handleSavePreset() {
// // // // //     const socials: Socials = { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb };
// // // // //     savePreset({
// // // // //       site, username, phone, website, email,
// // // // //       address: { country, state, city, zip, line1 },
// // // // //       socials,
// // // // //     });
// // // // //     toast.success("Preset saved");
// // // // //   }

// // // // //   async function handleStart() {
// // // // //     if (!readyToStart) {
// // // // //       toast.error("Select content and fill site + credentials.");
// // // // //       return;
// // // // //     }
// // // // //     try {
// // // // //       const { listings } = await start({
// // // // //         site,
// // // // //         username,
// // // // //         password,
// // // // //         defaults: {
// // // // //           category,
// // // // //           keywordsDefaults,
// // // // //           imageUrl,
// // // // //           imageFile,
// // // // //           profile: {
// // // // //             phone,
// // // // //             website,
// // // // //             email,
// // // // //             socials: { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb },
// // // // //             address: { country, state, city, zip, line1 },
// // // // //           },
// // // // //         },
// // // // //       });
// // // // //       toast.success(`Automation started for ${listings} item(s)`);
// // // // //     } catch (err: any) {
// // // // //       toast.error(err?.message ?? "Failed to start");
// // // // //     }
// // // // //   }

// // // // //   return (
// // // // //     <div className="min-h-screen bg-neutral-50">
// // // // //       <div className="mx-auto max-w-screen-2xl px-6 py-8">
// // // // //         {/* Top Header */}
// // // // //         <AccentCard>
// // // // //           <Card className="border-0 shadow-none">
// // // // //             <CardHeader className="pb-4">
// // // // //               <div className="flex items-center justify-between gap-4">
// // // // //                 <div>
// // // // //                   <CardTitle className="flex items-center gap-2 text-2xl text-neutral-900">
// // // // //                     <IconListDetails className="h-6 w-6 text-neutral-700" />
// // // // //                     Classified Listing Automation
// // // // //                   </CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">
// // // // //                     Symmetric layout • Premium white theme • Multi-project & multi-item selection
// // // // //                   </CardDescription>
// // // // //                 </div>
// // // // //                 <div className="hidden md:flex items-center gap-2">
// // // // //                   <div className="relative">
// // // // //                     <IconSearch className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // // //                     <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title / keywords…" className="pl-9 bg-white w-[320px]" />
// // // // //                   </div>
// // // // //                   <Badge variant="outline" className="rounded-full">Selected: {selectedCount}</Badge>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </CardHeader>
// // // // //           </Card>
// // // // //         </AccentCard>

// // // // //         {/* 3 symmetric columns */}
// // // // //         <div className="mt-8 grid gap-8 xl:grid-cols-12">
// // // // //           {/* LEFT (xl: 4) — Projects */}
// // // // //           <div className="xl:col-span-4">
// // // // //             <div className="sticky top-6 space-y-6">
// // // // //               <AccentCard>
// // // // //                 <Card className="border-0 shadow-none">
// // // // //                   <CardHeader className="pb-3">
// // // // //                     <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
// // // // //                       <IconFolder className="h-5 w-5 text-neutral-700" />
// // // // //                       Projects
// // // // //                     </CardTitle>
// // // // //                     <CardDescription className="text-neutral-600">
// // // // //                       Tick projects or individual items to post.
// // // // //                     </CardDescription>
// // // // //                   </CardHeader>
// // // // //                   <CardContent className="space-y-3">
// // // // //                     <div className="md:hidden mb-2">
// // // // //                       <div className="relative">
// // // // //                         <IconSearch className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // // //                         <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title / keywords…" className="pl-9 bg-white" />
// // // // //                       </div>
// // // // //                     </div>

// // // // //                     <div className="flex items-center justify-between text-xs text-neutral-600">
// // // // //                       <div className="flex items-center gap-2">
// // // // //                         <Button variant="outline" size="sm" onClick={selectAllVisible} className="rounded-full h-7 px-3">
// // // // //                           <IconCircleCheck className="h-3.5 w-3.5 mr-1" /> Select All Visible
// // // // //                         </Button>
// // // // //                         <Button variant="outline" size="sm" onClick={clearSelection} className="rounded-full h-7 px-3">
// // // // //                           <IconCircleX className="h-3.5 w-3.5 mr-1" /> Clear
// // // // //                         </Button>
// // // // //                       </div>
// // // // //                       <span className="text-neutral-500">Projects: {filteredProjects.length}</span>
// // // // //                     </div>

// // // // //                     <div className="max-h-[620px] overflow-auto pr-1">
// // // // //                       {filteredProjects.length === 0 && (
// // // // //                         <div className="text-sm text-neutral-500">No items found.</div>
// // // // //                       )}

// // // // //                       {filteredProjects.map((p, idx) => {
// // // // //                         const expanded = expandedProjectIds.has(p.id);
// // // // //                         const projectSelected = isProjectSelected(p.id);
// // // // //                         const selectedCountInProject = p.items.filter(it => selectedItemIds.has(it.id)).length;
// // // // //                         const total = p.items.length;

// // // // //                         return (
// // // // //                           <div key={p.id} className="rounded-xl ring-1 ring-neutral-200 bg-white mb-3 overflow-hidden">
// // // // //                             {/* Project row */}
// // // // //                             <div className="flex items-center justify-between p-3">
// // // // //                               <div className="flex items-center gap-3">
// // // // //                                 <Button
// // // // //                                   variant="ghost" size="icon"
// // // // //                                   onClick={() => toggleProjectExpand(p.id)}
// // // // //                                   className="h-7 w-7 rounded-full" aria-label={expanded ? "Collapse" : "Expand"}
// // // // //                                 >
// // // // //                                   {expanded ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
// // // // //                                 </Button>

// // // // //                                 <Checkbox
// // // // //                                   checked={projectSelected}
// // // // //                                   onCheckedChange={(v) => setProjectChecked(p.id, !!v)}
// // // // //                                   className="mr-1"
// // // // //                                   aria-label="Select project"
// // // // //                                 />
// // // // //                                 <span className="text-sm font-medium text-neutral-900 tabular-nums">{String(idx + 1).padStart(2, "0")}.</span>
// // // // //                                 <span className="text-sm font-medium text-neutral-900">{p.name}</span>
// // // // //                               </div>

// // // // //                               <Badge variant="outline" className={cn("rounded-full", selectedCountInProject ? "border-neutral-800 text-neutral-900" : "border-neutral-300 text-neutral-600")}>
// // // // //                                 {selectedCountInProject}/{total}
// // // // //                               </Badge>
// // // // //                             </div>

// // // // //                             {/* Items list */}
// // // // //                             {expanded && (
// // // // //                               <div className="border-t border-neutral-200 divide-y divide-neutral-100">
// // // // //                                 {p.items.map((it, iidx) => {
// // // // //                                   const checked = isItemSelected(it.id);
// // // // //                                   return (
// // // // //                                     <div
// // // // //                                       key={it.id}
// // // // //                                       className={cn(
// // // // //                                         "flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition",
// // // // //                                         checked && "bg-neutral-50"
// // // // //                                       )}
// // // // //                                     >
// // // // //                                       <div className="flex items-center gap-3 min-w-0">
// // // // //                                         <span className="text-[11px] text-neutral-500 w-6 text-right tabular-nums">{iidx + 1}</span>
// // // // //                                         <Checkbox
// // // // //                                           checked={checked}
// // // // //                                           onCheckedChange={(v) => setItemChecked(p.id, it.id, !!v)}
// // // // //                                           aria-label="Select item"
// // // // //                                         />
// // // // //                                         <button className="text-left min-w-0" onClick={() => setFocusedItemId(it.id)}>
// // // // //                                           <div className="text-sm font-medium text-neutral-900 truncate max-w-[220px]">
// // // // //                                             {getItemTitle(it) || (getItemKeywords(it)[0] ?? "Untitled")}
// // // // //                                           </div>
// // // // //                                           <div className="text-xs text-neutral-500 truncate max-w-[220px]">
// // // // //                                             {getItemKeywords(it).join(", ")}
// // // // //                                           </div>
// // // // //                                         </button>
// // // // //                                       </div>
// // // // //                                       {checked && <IconCheck className="h-4 w-4 text-neutral-900 flex-shrink-0" />}
// // // // //                                     </div>
// // // // //                                   );
// // // // //                                 })}
// // // // //                               </div>
// // // // //                             )}
// // // // //                           </div>
// // // // //                         );
// // // // //                       })}
// // // // //                     </div>
// // // // //                   </CardContent>
// // // // //                 </Card>
// // // // //               </AccentCard>
// // // // //             </div>
// // // // //           </div>

// // // // //           {/* CENTER (xl: 5) — Defaults + Preview */}
// // // // //           <div className="xl:col-span-5 space-y-6">
// // // // //             <AccentCard>
// // // // //               <Card className="border-0 shadow-none">
// // // // //                 <CardHeader className="pb-4">
// // // // //                   <CardTitle className="text-lg text-neutral-900">Listing Defaults</CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">Apply to all selected items (titles & content come from each item).</CardDescription>
// // // // //                 </CardHeader>
// // // // //                 <CardContent className="space-y-6">
// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle icon={<IconTags className="h-4 w-4 text-neutral-700" />}>Keyword Tags (add-on)</SectionTitle>
// // // // //                     <TagsInput value={keywordsDefaults} onChange={setKeywordsDefaults} />
// // // // //                   </section>

// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle>Category</SectionTitle>
// // // // //                     <Select value={category} onValueChange={setCategory}>
// // // // //                       <SelectTrigger className="bg-white"><SelectValue placeholder="Choose a category" /></SelectTrigger>
// // // // //                       <SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
// // // // //                     </Select>
// // // // //                   </section>

// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle icon={<IconPhoto className="h-4 w-4 text-neutral-700" />}>Default Image</SectionTitle>
// // // // //                     <ImagePicker imageUrl={imageUrl} onImageUrlChange={setImageUrl} file={imageFile} onFileChange={setImageFile} />
// // // // //                     <p className="text-xs text-neutral-500">Used only if an item has no image.</p>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle icon={<IconMap2 className="h-4 w-4 text-neutral-700" />}>Address</SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-2">
// // // // //                       <div><Label className="text-xs">Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">State</Label><Input value={state} onChange={(e) => setStateVal(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">ZIP Code</Label><Input value={zip} onChange={(e) => setZip(e.target.value)} className="bg-white" /></div>
// // // // //                     </div>
// // // // //                     <div><Label className="text-xs">Address Line</Label><Input value={line1} onChange={(e) => setLine1(e.target.value)} className="bg-white" /></div>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle icon={<IconAddressBook className="h-4 w-4 text-neutral-700" />}>Contact</SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-3">
// // // // //                       <div><Label className="text-xs">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">Website</Label><div className="flex items-center"><IconWorldWww className="h-4 w-4 mr-2 text-neutral-500" /><Input value={website} onChange={(e) => setWebsite(e.target.value)} className="bg-white" /></div></div>
// // // // //                       <div><Label className="text-xs">Email</Label><div className="flex items-center"><IconAt className="h-4 w-4 mr-2 text-neutral-500" /><Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white" /></div></div>
// // // // //                     </div>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle icon={<IconWorld className="h-4 w-4 text-neutral-700" />}>Social Profiles</SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-2">
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandFacebook className="h-3 w-3" /> Facebook Page</Label><Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandTwitter className="h-3 w-3" /> Twitter / X</Label><Input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandLinkedin className="h-3 w-3" /> LinkedIn</Label><Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandPinterest className="h-3 w-3" /> Pinterest</Label><Input value={pinterest} onChange={(e) => setPinterest(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandInstagram className="h-3 w-3" /> Instagram</Label><Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandCpp className="h-3 w-3" /> Yelp</Label><Input value={yelp} onChange={(e) => setYelp(e.target.value)} className="bg-white" /></div>
// // // // //                       <div className="md:col-span-2"><Label className="text-xs flex items-center gap-1"><IconBrandGoogle className="h-3 w-3" /> Google Business Profile</Label><Input value={gmb} onChange={(e) => setGmb(e.target.value)} className="bg-white" /></div>
// // // // //                     </div>
// // // // //                   </section>
// // // // //                 </CardContent>
// // // // //               </Card>
// // // // //             </AccentCard>

// // // // //             <AccentCard>
// // // // //               <Card className="border-0 shadow-none">
// // // // //                 <CardHeader className="pb-3">
// // // // //                   <CardTitle className="text-lg text-neutral-900">Preview (focused item)</CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">Click any item in Projects list to preview Title & Content.</CardDescription>
// // // // //                 </CardHeader>
// // // // //                 <CardContent className="space-y-4">
// // // // //                   <div>
// // // // //                     <Label className="text-sm font-semibold">Title</Label>
// // // // //                     <Input value={focusedItem ? getItemTitle(focusedItem) : ""} readOnly placeholder="Select an item to preview" className="bg-neutral-50" />
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <Label className="text-sm font-semibold">Content (HTML/Text)</Label>
// // // // //                     <Textarea value={focusedItem ? getItemHtml(focusedItem) : ""} readOnly placeholder="Select an item to preview" className="min-h-[160px] bg-neutral-50" />
// // // // //                   </div>
// // // // //                 </CardContent>
// // // // //               </Card>
// // // // //             </AccentCard>
// // // // //           </div>

// // // // //           {/* RIGHT (xl: 3) — Run settings */}
// // // // //           <div className="xl:col-span-3">
// // // // //             <div className="sticky top-6 space-y-6">
// // // // //               <AccentCard>
// // // // //                 <Card className="border-0 shadow-none">
// // // // //                   <CardHeader className="pb-4">
// // // // //                     <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
// // // // //                       <IconSparkles className="h-5 w-5 text-neutral-700" />
// // // // //                       Run Settings
// // // // //                     </CardTitle>
// // // // //                     <CardDescription className="text-neutral-600">Select site & credentials</CardDescription>
// // // // //                   </CardHeader>
// // // // //                   <CardContent className="space-y-5">
// // // // //                     <section>
// // // // //                       <Label className="text-sm font-semibold">Site</Label>
// // // // //                       <Select value={site} onValueChange={setSite}>
// // // // //                         <SelectTrigger className="bg-white"><SelectValue placeholder="Choose site…" /></SelectTrigger>
// // // // //                         <SelectContent>{SITES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
// // // // //                       </Select>
// // // // //                     </section>

// // // // //                     <section className="grid gap-3">
// // // // //                       <Label className="text-sm font-semibold flex items-center gap-2"><IconKey className="h-4 w-4 text-neutral-700" /> Credentials</Label>
// // // // //                       <Input placeholder="Username / Email" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-white" />
// // // // //                       <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white" />
// // // // //                     </section>

// // // // //                     <Separator />

// // // // //                     <div className="grid gap-2">
// // // // //                       <Button
// // // // //                         onClick={handleStart}
// // // // //                         disabled={!readyToStart || isStarting}
// // // // //                         className={cn("rounded-xl bg-neutral-900 text-white shadow-md hover:bg-neutral-800", !readyToStart && "opacity-60 cursor-not-allowed")}
// // // // //                       >
// // // // //                         <IconPlayerPlay className="h-4 w-4 mr-2" />
// // // // //                         {isStarting ? "Starting…" : `Start Automation (${selectedCount})`}
// // // // //                       </Button>
// // // // //                       <div className="flex items-center justify-between text-xs text-neutral-600">
// // // // //                         <span className="flex items-center gap-1"><IconCheck className="h-3.5 w-3.5" /> Selected {selectedCount}</span>
// // // // //                       </div>
// // // // //                       {jobId && (
// // // // //                         <div className="rounded-xl ring-1 ring-neutral-200 bg-neutral-50 p-3">
// // // // //                           <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
// // // // //                             <span>Job: {jobId}</span><span>{progress}%</span>
// // // // //                           </div>
// // // // //                           <Progress value={progress} className="h-2 bg-neutral-200" />
// // // // //                         </div>
// // // // //                       )}
// // // // //                     </div>
// // // // //                   </CardContent>
// // // // //                 </Card>
// // // // //               </AccentCard>

// // // // //               <div className="rounded-xl ring-1 ring-neutral-200 bg-white p-4 text-sm text-neutral-700">
// // // // //                 <p className="mb-1">✅ <b>Flow:</b> Select projects → tick items → set defaults → Start Automation</p>
// // // // //                 <p>🧩 <b>Payload:</b> <code>/api/automation/start</code> with site, login, profile, and multiple <code>listings[]</code>.</p>
// // // // //                 <div className="mt-3 flex items-center gap-2">
// // // // //                   <Button variant="outline" onClick={handleSavePreset} className="rounded-full">Save Preset</Button>
// // // // //                   <Badge variant="outline" className="rounded-full">Symmetric layout</Badge>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>{/* /grid */}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // // /pages/classified-automation/index.tsx
// // // // // import React, { useEffect, useMemo, useState } from "react";
// // // // // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // // // // import { Button } from "@/components/ui/button";
// // // // // import { Badge } from "@/components/ui/badge";
// // // // // import { Input } from "@/components/ui/input";
// // // // // import { Label } from "@/components/ui/label";
// // // // // import { Textarea } from "@/components/ui/textarea";
// // // // // import { Separator } from "@/components/ui/separator";
// // // // // import { Progress } from "@/components/ui/progress";
// // // // // import { Checkbox } from "@/components/ui/checkbox";
// // // // // import { toast } from "sonner";
// // // // // import { cn } from "@/lib/utils";
// // // // // import {
// // // // //   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// // // // // } from "@/components/ui/select";

// // // // // import {
// // // // //   IconWorld,
// // // // //   IconListDetails,
// // // // //   IconPlayerPlay,
// // // // //   IconSparkles,
// // // // //   IconAddressBook,
// // // // //   IconTags,
// // // // //   IconMap2,
// // // // //   IconPhoto,
// // // // //   IconWorldWww,
// // // // //   IconAt,
// // // // //   IconBrandFacebook,
// // // // //   IconBrandTwitter,
// // // // //   IconBrandLinkedin,
// // // // //   IconBrandPinterest,
// // // // //   IconBrandInstagram,
// // // // //   IconBrandCpp, // Yelp placeholder
// // // // //   IconBrandGoogle,
// // // // //   IconChevronDown,
// // // // //   IconChevronRight,
// // // // //   IconSearch,
// // // // //   IconFolder,
// // // // //   IconCheck,
// // // // //   IconCircleCheck,
// // // // //   IconCircleX,
// // // // //   IconGlobe,
// // // // // } from "@tabler/icons-react";

// // // // // import {
// // // // //   useListingAutomation,
// // // // //   type GeneratedItem,
// // // // //   type Socials,
// // // // // } from "./hooks/useListingAutomation";

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Constants
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // const CATEGORIES = [
// // // // //   "Electronics","Home & Garden","Vehicles","Jobs","Services",
// // // // //   "Real Estate","Pets","Books","Fashion","Sports",
// // // // // ];

// // // // // /** FIXED 7 SITES (1 site = 1 content) */
// // // // // const SITES = [
// // // // //   {
// // // // //     value: "proclassifiedads.com",
// // // // //     label: "proclassifiedads.com",
// // // // //     username: "Zoran",
// // // // //     password: "XsujZnakXKuqZ@&e(o3qSr@!",
// // // // //   },
// // // // //   {
// // // // //     value: "postyourads.org",
// // // // //     label: "postyourads.org",
// // // // //     username: "Helyn",
// // // // //     password: "lO$a6r7jrEMCoc2e5ePD%GrZ",
// // // // //   },
// // // // //   {
// // // // //     value: "classifiedsposts.com",
// // // // //     label: "classifiedsposts.com",
// // // // //     username: "Fyren",
// // // // //     password: "AEsB%COsrw#!NHp@IaDSpFXs",
// // // // //   },
// // // // //   {
// // // // //     value: "classifiedsadpost.com",
// // // // //     label: "classifiedsadpost.com",
// // // // //     username: "Thryn",
// // // // //     password: "FlMus$ki3slpEU*wOPvFVJzQ",
// // // // //   },
// // // // //   {
// // // // //     value: "globaladsclassifieds.com",
// // // // //     label: "globaladsclassifieds.com",
// // // // //     username: "Dexo",
// // // // //     password: "^BFrvFvcO0)xT*lh4B^epr4$",
// // // // //   },
// // // // //   {
// // // // //     value: "onlineclassifiedsads.com",
// // // // //     label: "onlineclassifiedsads.com",
// // // // //     username: "Velyn",
// // // // //     password: "oWujA^FC88qcteDObVP8h4FD",
// // // // //   },
// // // // //   {
// // // // //     value: "thelocanto.com",
// // // // //     label: "thelocanto.com",
// // // // //     username: "Tarka",
// // // // //     password: "08uNArlcpnHiihxRz)ubwivK",
// // // // //   },
// // // // // ];

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Local-storage loader (from your content app)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function loadGeneratedItems(): GeneratedItem[] {
// // // // //   const keys = ["content_items_v1", "content-items", "seomatic_content_items"];
// // // // //   for (const k of keys) {
// // // // //     try {
// // // // //       const raw = localStorage.getItem(k);
// // // // //       if (raw) {
// // // // //         const arr = JSON.parse(raw);
// // // // //         if (Array.isArray(arr)) return arr;
// // // // //       }
// // // // //     } catch {}
// // // // //   }
// // // // //   try {
// // // // //     const raw =
// // // // //       sessionStorage.getItem("open-content-item_v1") ??
// // // // //       localStorage.getItem("open-content-item_v1_fallback");
// // // // //     if (raw) {
// // // // //       const it = JSON.parse(raw);
// // // // //       if (it && typeof it === "object") return [it];
// // // // //     }
// // // // //   } catch {}
// // // // //   return [];
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Small UI helpers (premium white theme)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function AccentCard({ children }: { children: React.ReactNode }) {
// // // // //   return (
// // // // //     <div className="rounded-2xl ring-1 ring-neutral-200/80 bg-white shadow-sm overflow-hidden">
// // // // //       <div className="h-1.5 bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900" />
// // // // //       {children}
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // // function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
// // // // //   return <div className="flex items-center gap-2 text-[15px] font-semibold text-neutral-900">{icon}{children}</div>;
// // // // // }

// // // // // /* Tags Input */
// // // // // function TagsInput({
// // // // //   value, onChange, placeholder = "Type keyword and press Enter",
// // // // // }: { value: string[]; onChange: (tags: string[]) => void; placeholder?: string; }) {
// // // // //   const [draft, setDraft] = useState("");
// // // // //   function addTagFromDraft() {
// // // // //     const parts = draft.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
// // // // //     if (parts.length) {
// // // // //       const set = new Set([...value, ...parts]);
// // // // //       onChange(Array.from(set));
// // // // //       setDraft("");
// // // // //     }
// // // // //   }
// // // // //   return (
// // // // //     <div className="rounded-xl ring-1 ring-neutral-200 bg-white p-3">
// // // // //       <div className="flex flex-wrap gap-2 mb-2">
// // // // //         {value.map((t) => (
// // // // //           <span key={t} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 text-neutral-800 px-3 py-1 text-xs ring-1 ring-neutral-300">
// // // // //             <IconTags className="h-3 w-3" />
// // // // //             {t}
// // // // //             <button onClick={() => onChange(value.filter((x) => x !== t))} className="ml-1 hover:text-neutral-950" aria-label={`Remove ${t}`}>×</button>
// // // // //           </span>
// // // // //         ))}
// // // // //       </div>
// // // // //       <Input
// // // // //         value={draft}
// // // // //         onChange={(e) => setDraft(e.target.value)}
// // // // //         onKeyDown={(e) => {
// // // // //           if (e.key === "Enter") { e.preventDefault(); addTagFromDraft(); }
// // // // //           if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
// // // // //         }}
// // // // //         placeholder={placeholder}
// // // // //         className="bg-white"
// // // // //       />
// // // // //       <p className="text-xs text-neutral-500 mt-1">Use Enter or comma to add</p>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* Image Picker */
// // // // // function ImagePicker({
// // // // //   imageUrl, onImageUrlChange, file, onFileChange,
// // // // // }: { imageUrl: string; onImageUrlChange: (v: string) => void; file: File | null; onFileChange: (f: File | null) => void; }) {
// // // // //   const preview = React.useMemo(() => (file ? URL.createObjectURL(file) : imageUrl || ""), [file, imageUrl]);
// // // // //   return (
// // // // //     <div className="grid gap-3">
// // // // //       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// // // // //         <div>
// // // // //           <Label className="text-sm">Image URL</Label>
// // // // //           <Input placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => onImageUrlChange(e.target.value)} className="bg-white" />
// // // // //         </div>
// // // // //         <div>
// // // // //           <Label className="text-sm">Upload Image</Label>
// // // // //           <div className="flex items-center gap-3">
// // // // //             <Input type="file" accept="image/*" className="bg-white" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
// // // // //             {file && <Badge variant="outline" className="rounded-full">{file.name}</Badge>}
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //       {preview ? (
// // // // //         <div className="rounded-xl ring-1 ring-neutral-200 bg-white p-3">
// // // // //           <img src={preview} alt="preview" className="max-h-56 w-auto rounded-lg object-cover" />
// // // // //         </div>
// // // // //       ) : (
// // // // //         <div className="rounded-xl ring-1 ring-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-500">No preview</div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* Presets */
// // // // // const PRESET_KEY = "classified_automation_preset_v2";
// // // // // function savePreset(data: any) { localStorage.setItem(PRESET_KEY, JSON.stringify(data)); }
// // // // // function loadPreset(): any | null { try { const raw = localStorage.getItem(PRESET_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }

// // // // // /* Fake uploader (replace with real) */
// // // // // async function uploadImageAndGetUrl(file: File): Promise<string> { return URL.createObjectURL(file); }

// // // // // /* Tiny helpers from items */
// // // // // const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// // // // // const getItemHtml = (it: GeneratedItem) => (it.html ?? it.generatedContent ?? "").toString();
// // // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // // //   if (typeof it.keyword === "string")
// // // // //     return it.keyword.split(/[,\|]/).map((s) => s.trim()).filter(Boolean);
// // // // //   return [];
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * MAIN
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // export default function ClassifiedAutomationPage() {
// // // // //   /* Load all generated items */
// // // // //   const [items, setItems] = useState<GeneratedItem[]>([]);
// // // // //   useEffect(() => setItems(loadGeneratedItems()), []);

// // // // //   /* Hook wiring */
// // // // //   const {
// // // // //     search, setSearch, filteredProjects,
// // // // //     expandedProjectIds, toggleProjectExpand,
// // // // //      selectedItemIds,
// // // // //     isProjectSelected, isItemSelected,
// // // // //     setProjectChecked, setItemChecked,
// // // // //     selectAllVisible, clearSelection,
// // // // //     setFocusedItemId, focusedItem,
// // // // //     selectedItems,
// // // // //     start, isStarting, jobId, progress,
// // // // //   } = useListingAutomation(items, {
// // // // //     uploadImage: uploadImageAndGetUrl,
// // // // //     statusPollIntervalMs: 1500,
// // // // //     maxPollMinutes: 15,
// // // // //     maxSelectableItems: SITES.length, // ✅ max 7 contents
// // // // //     onMaxExceeded: (max) => toast.error(`Max ${max} contents only (sites limit).`),
// // // // //   });

// // // // //   /* Defaults (apply to all selected items) */
// // // // //   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
// // // // //   const [category, setCategory] = useState<string>("");

// // // // //   // Contact / profile
// // // // //   const [phone, setPhone] = useState("");
// // // // //   const [website, setWebsite] = useState("");
// // // // //   const [email, setEmail] = useState("");

// // // // //   // Socials
// // // // //   const [facebook, setFacebook] = useState("");
// // // // //   const [twitter, setTwitter] = useState("");
// // // // //   const [linkedin, setLinkedin] = useState("");
// // // // //   const [pinterest, setPinterest] = useState("");
// // // // //   const [instagram, setInstagram] = useState("");
// // // // //   const [yelp, setYelp] = useState("");
// // // // //   const [gmb, setGmb] = useState("");

// // // // //   // Address
// // // // //   const [country, setCountry] = useState("");
// // // // //   const [state, setStateVal] = useState("");
// // // // //   const [city, setCity] = useState("");
// // // // //   const [zip, setZip] = useState("");
// // // // //   const [line1, setLine1] = useState("");

// // // // //   // Default image (used if item has none)
// // // // //   const [imageUrl, setImageUrl] = useState("");
// // // // //   const [imageFile, setImageFile] = useState<File | null>(null);

// // // // //   // Sites selection (checkbox multi-select)
// // // // //   const [selectedSiteValues, setSelectedSiteValues] = useState<Set<string>>(new Set());

// // // // //   const selectedCount = selectedItems.length;

// // // // //   const selectedSites = useMemo(
// // // // //     () => SITES.filter(s => selectedSiteValues.has(s.value)),
// // // // //     [selectedSiteValues]
// // // // //   );

// // // // //   const selectedSitesCount = selectedSites.length;

// // // // //   // Auto-trim sites if items decrease
// // // // //   useEffect(() => {
// // // // //     if (selectedCount === 0) {
// // // // //       setSelectedSiteValues(new Set());
// // // // //       return;
// // // // //     }
// // // // //     if (selectedSiteValues.size <= selectedCount) return;

// // // // //     setSelectedSiteValues(prev => {
// // // // //       const arr = Array.from(prev).slice(0, selectedCount);
// // // // //       return new Set(arr);
// // // // //     });
// // // // //   }, [selectedCount]); // eslint-disable-line react-hooks/exhaustive-deps

// // // // //   function toggleSite(siteValue: string, checked: boolean) {
// // // // //     setSelectedSiteValues(prev => {
// // // // //       const n = new Set(prev);
// // // // //       if (checked) {
// // // // //         if (selectedCount === 0) {
// // // // //           toast.error("Select content first.");
// // // // //           return prev;
// // // // //         }
// // // // //         if (n.size >= selectedCount) {
// // // // //           toast.error(`You can select only ${selectedCount} site(s).`);
// // // // //           return prev;
// // // // //         }
// // // // //         n.add(siteValue);
// // // // //       } else {
// // // // //         n.delete(siteValue);
// // // // //       }
// // // // //       return n;
// // // // //     });
// // // // //   }

// // // // //   const readyToStart =
// // // // //     selectedCount > 0 &&
// // // // //     selectedSitesCount === selectedCount;

// // // // //   // Preset load
// // // // //   useEffect(() => {
// // // // //     const p = loadPreset();
// // // // //     if (p) {
// // // // //       setPhone(p.phone ?? ""); setWebsite(p.website ?? ""); setEmail(p.email ?? "");
// // // // //       setCountry(p.address?.country ?? ""); setStateVal(p.address?.state ?? ""); setCity(p.address?.city ?? "");
// // // // //       setZip(p.address?.zip ?? ""); setLine1(p.address?.line1 ?? "");
// // // // //       setFacebook(p.socials?.facebook ?? ""); setTwitter(p.socials?.twitter ?? ""); setLinkedin(p.socials?.linkedin ?? "");
// // // // //       setPinterest(p.socials?.pinterest ?? ""); setInstagram(p.socials?.instagram ?? ""); setYelp(p.socials?.yelp ?? "");
// // // // //       setGmb(p.socials?.gmb ?? "");

// // // // //       // load selected sites
// // // // //       if (Array.isArray(p.sites)) {
// // // // //         setSelectedSiteValues(new Set(p.sites));
// // // // //       }
// // // // //     }
// // // // //   }, []);

// // // // //   function handleSavePreset() {
// // // // //     const socials: Socials = { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb };
// // // // //     savePreset({
// // // // //       phone, website, email,
// // // // //       address: { country, state, city, zip, line1 },
// // // // //       socials,
// // // // //       sites: Array.from(selectedSiteValues),
// // // // //     });
// // // // //     toast.success("Preset saved");
// // // // //   }

// // // // //   async function handleStart() {
// // // // //     if (!readyToStart) {
// // // // //       toast.error("Select content first, then same number of sites.");
// // // // //       return;
// // // // //     }
// // // // //     try {
// // // // //       const { listings } = await start({
// // // // //         sites: selectedSites.map(s => ({
// // // // //           site: s.value,
// // // // //           username: s.username,
// // // // //           password: s.password,
// // // // //         })),
// // // // //         defaults: {
// // // // //           category,
// // // // //           keywordsDefaults,
// // // // //           imageUrl,
// // // // //           imageFile,
// // // // //           profile: {
// // // // //             phone,
// // // // //             website,
// // // // //             email,
// // // // //             socials: { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb },
// // // // //             address: { country, state, city, zip, line1 },
// // // // //           },
// // // // //         },
// // // // //       });
// // // // //       toast.success(`Automation started for ${listings} item(s)`);
// // // // //     } catch (err: any) {
// // // // //       toast.error(err?.message ?? "Failed to start");
// // // // //     }
// // // // //   }

// // // // //   return (
// // // // //     <div className="min-h-screen bg-neutral-50">
// // // // //       <div className="mx-auto max-w-screen-2xl px-6 py-8">
// // // // //         {/* Top Header */}
// // // // //         <AccentCard>
// // // // //           <Card className="border-0 shadow-none">
// // // // //             <CardHeader className="pb-4">
// // // // //               <div className="flex items-center justify-between gap-4">
// // // // //                 <div>
// // // // //                   <CardTitle className="flex items-center gap-2 text-2xl text-neutral-900">
// // // // //                     <IconListDetails className="h-6 w-6 text-neutral-700" />
// // // // //                     Classified Listing Automation
// // // // //                   </CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">
// // // // //                     Select content → Select same number of sites → Start
// // // // //                   </CardDescription>
// // // // //                 </div>
// // // // //                 <div className="hidden md:flex items-center gap-2">
// // // // //                   <div className="relative">
// // // // //                     <IconSearch className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // // //                     <Input
// // // // //                       value={search}
// // // // //                       onChange={(e) => setSearch(e.target.value)}
// // // // //                       placeholder="Search title / keywords…"
// // // // //                       className="pl-9 bg-white w-[320px]"
// // // // //                     />
// // // // //                   </div>
// // // // //                   <Badge variant="outline" className="rounded-full">
// // // // //                     Selected: {selectedCount}/{SITES.length}
// // // // //                   </Badge>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </CardHeader>
// // // // //           </Card>
// // // // //         </AccentCard>

// // // // //         {/* 3 symmetric columns */}
// // // // //         <div className="mt-8 grid gap-8 xl:grid-cols-12">
// // // // //           {/* LEFT (xl: 4) — Projects */}
// // // // //           <div className="xl:col-span-4">
// // // // //             <div className="sticky top-6 space-y-6">
// // // // //               <AccentCard>
// // // // //                 <Card className="border-0 shadow-none">
// // // // //                   <CardHeader className="pb-3">
// // // // //                     <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
// // // // //                       <IconFolder className="h-5 w-5 text-neutral-700" />
// // // // //                       Projects
// // // // //                     </CardTitle>
// // // // //                     <CardDescription className="text-neutral-600">
// // // // //                       Tick projects or individual items to post.
// // // // //                     </CardDescription>
// // // // //                   </CardHeader>
// // // // //                   <CardContent className="space-y-3">
// // // // //                     <div className="md:hidden mb-2">
// // // // //                       <div className="relative">
// // // // //                         <IconSearch className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // // //                         <Input
// // // // //                           value={search}
// // // // //                           onChange={(e) => setSearch(e.target.value)}
// // // // //                           placeholder="Search title / keywords…"
// // // // //                           className="pl-9 bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                     </div>

// // // // //                     <div className="flex items-center justify-between text-xs text-neutral-600">
// // // // //                       <div className="flex items-center gap-2">
// // // // //                         <Button variant="outline" size="sm" onClick={selectAllVisible} className="rounded-full h-7 px-3">
// // // // //                           <IconCircleCheck className="h-3.5 w-3.5 mr-1" /> Select All Visible
// // // // //                         </Button>
// // // // //                         <Button variant="outline" size="sm" onClick={clearSelection} className="rounded-full h-7 px-3">
// // // // //                           <IconCircleX className="h-3.5 w-3.5 mr-1" /> Clear
// // // // //                         </Button>
// // // // //                       </div>
// // // // //                       <span className="text-neutral-500">Projects: {filteredProjects.length}</span>
// // // // //                     </div>

// // // // //                     <div className="max-h-[620px] overflow-auto pr-1">
// // // // //                       {filteredProjects.length === 0 && (
// // // // //                         <div className="text-sm text-neutral-500">No items found.</div>
// // // // //                       )}

// // // // //                       {filteredProjects.map((p, idx) => {
// // // // //                         const expanded = expandedProjectIds.has(p.id);
// // // // //                         const projectSelected = isProjectSelected(p.id);
// // // // //                         const selectedCountInProject = p.items.filter(it => selectedItemIds.has(it.id)).length;
// // // // //                         const total = p.items.length;

// // // // //                         return (
// // // // //                           <div key={p.id} className="rounded-xl ring-1 ring-neutral-200 bg-white mb-3 overflow-hidden">
// // // // //                             {/* Project row */}
// // // // //                             <div className="flex items-center justify-between p-3">
// // // // //                               <div className="flex items-center gap-3">
// // // // //                                 <Button
// // // // //                                   variant="ghost" size="icon"
// // // // //                                   onClick={() => toggleProjectExpand(p.id)}
// // // // //                                   className="h-7 w-7 rounded-full" aria-label={expanded ? "Collapse" : "Expand"}
// // // // //                                 >
// // // // //                                   {expanded ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
// // // // //                                 </Button>

// // // // //                                 <Checkbox
// // // // //                                   checked={projectSelected}
// // // // //                                   onCheckedChange={(v) => setProjectChecked(p.id, !!v)}
// // // // //                                   className="mr-1"
// // // // //                                   aria-label="Select project"
// // // // //                                 />
// // // // //                                 <span className="text-sm font-medium text-neutral-900 tabular-nums">{String(idx + 1).padStart(2, "0")}.</span>
// // // // //                                 <span className="text-sm font-medium text-neutral-900">{p.name}</span>
// // // // //                               </div>

// // // // //                               <Badge variant="outline" className={cn("rounded-full", selectedCountInProject ? "border-neutral-800 text-neutral-900" : "border-neutral-300 text-neutral-600")}>
// // // // //                                 {selectedCountInProject}/{total}
// // // // //                               </Badge>
// // // // //                             </div>

// // // // //                             {/* Items list */}
// // // // //                             {expanded && (
// // // // //                               <div className="border-t border-neutral-200 divide-y divide-neutral-100">
// // // // //                                 {p.items.map((it, iidx) => {
// // // // //                                   const checked = isItemSelected(it.id);
// // // // //                                   return (
// // // // //                                     <div
// // // // //                                       key={it.id}
// // // // //                                       className={cn(
// // // // //                                         "flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition",
// // // // //                                         checked && "bg-neutral-50"
// // // // //                                       )}
// // // // //                                     >
// // // // //                                       <div className="flex items-center gap-3 min-w-0">
// // // // //                                         <span className="text-[11px] text-neutral-500 w-6 text-right tabular-nums">{iidx + 1}</span>
// // // // //                                         <Checkbox
// // // // //                                           checked={checked}
// // // // //                                           onCheckedChange={(v) => setItemChecked(p.id, it.id, !!v)}
// // // // //                                           aria-label="Select item"
// // // // //                                         />
// // // // //                                         <button className="text-left min-w-0" onClick={() => setFocusedItemId(it.id)}>
// // // // //                                           <div className="text-sm font-medium text-neutral-900 truncate max-w-[220px]">
// // // // //                                             {getItemTitle(it) || (getItemKeywords(it)[0] ?? "Untitled")}
// // // // //                                           </div>
// // // // //                                           <div className="text-xs text-neutral-500 truncate max-w-[220px]">
// // // // //                                             {getItemKeywords(it).join(", ")}
// // // // //                                           </div>
// // // // //                                         </button>
// // // // //                                       </div>
// // // // //                                       {checked && <IconCheck className="h-4 w-4 text-neutral-900 flex-shrink-0" />}
// // // // //                                     </div>
// // // // //                                   );
// // // // //                                 })}
// // // // //                               </div>
// // // // //                             )}
// // // // //                           </div>
// // // // //                         );
// // // // //                       })}
// // // // //                     </div>
// // // // //                   </CardContent>
// // // // //                 </Card>
// // // // //               </AccentCard>
// // // // //             </div>
// // // // //           </div>

// // // // //           {/* CENTER (xl: 5) — Defaults + Preview */}
// // // // //           <div className="xl:col-span-5 space-y-6">
// // // // //             <AccentCard>
// // // // //               <Card className="border-0 shadow-none">
// // // // //                 <CardHeader className="pb-4">
// // // // //                   <CardTitle className="text-lg text-neutral-900">Listing Defaults</CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">Apply to all selected items.</CardDescription>
// // // // //                 </CardHeader>
// // // // //                 <CardContent className="space-y-6">
// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle icon={<IconTags className="h-4 w-4 text-neutral-700" />}>Keyword Tags (add-on)</SectionTitle>
// // // // //                     <TagsInput value={keywordsDefaults} onChange={setKeywordsDefaults} />
// // // // //                   </section>

// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle>Category</SectionTitle>
// // // // //                     <Select value={category} onValueChange={setCategory}>
// // // // //                       <SelectTrigger className="bg-white"><SelectValue placeholder="Choose a category" /></SelectTrigger>
// // // // //                       <SelectContent>
// // // // //                         {CATEGORIES.map((c) => (
// // // // //                           <SelectItem key={c} value={c}>{c}</SelectItem>
// // // // //                         ))}
// // // // //                       </SelectContent>
// // // // //                     </Select>
// // // // //                   </section>

// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle icon={<IconPhoto className="h-4 w-4 text-neutral-700" />}>Default Image</SectionTitle>
// // // // //                     <ImagePicker imageUrl={imageUrl} onImageUrlChange={setImageUrl} file={imageFile} onFileChange={setImageFile} />
// // // // //                     <p className="text-xs text-neutral-500">Used only if an item has no image.</p>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle icon={<IconMap2 className="h-4 w-4 text-neutral-700" />}>Address</SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-2">
// // // // //                       <div><Label className="text-xs">Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">State</Label><Input value={state} onChange={(e) => setStateVal(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">ZIP Code</Label><Input value={zip} onChange={(e) => setZip(e.target.value)} className="bg-white" /></div>
// // // // //                     </div>
// // // // //                     <div><Label className="text-xs">Address Line</Label><Input value={line1} onChange={(e) => setLine1(e.target.value)} className="bg-white" /></div>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle icon={<IconAddressBook className="h-4 w-4 text-neutral-700" />}>Contact</SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-3">
// // // // //                       <div><Label className="text-xs">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs">Website</Label><div className="flex items-center"><IconWorldWww className="h-4 w-4 mr-2 text-neutral-500" /><Input value={website} onChange={(e) => setWebsite(e.target.value)} className="bg-white" /></div></div>
// // // // //                       <div><Label className="text-xs">Email</Label><div className="flex items-center"><IconAt className="h-4 w-4 mr-2 text-neutral-500" /><Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white" /></div></div>
// // // // //                     </div>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle icon={<IconWorld className="h-4 w-4 text-neutral-700" />}>Social Profiles</SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-2">
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandFacebook className="h-3 w-3" /> Facebook Page</Label><Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandTwitter className="h-3 w-3" /> Twitter / X</Label><Input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandLinkedin className="h-3 w-3" /> LinkedIn</Label><Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandPinterest className="h-3 w-3" /> Pinterest</Label><Input value={pinterest} onChange={(e) => setPinterest(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandInstagram className="h-3 w-3" /> Instagram</Label><Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="bg-white" /></div>
// // // // //                       <div><Label className="text-xs flex items-center gap-1"><IconBrandCpp className="h-3 w-3" /> Yelp</Label><Input value={yelp} onChange={(e) => setYelp(e.target.value)} className="bg-white" /></div>
// // // // //                       <div className="md:col-span-2"><Label className="text-xs flex items-center gap-1"><IconBrandGoogle className="h-3 w-3" /> Google Business Profile</Label><Input value={gmb} onChange={(e) => setGmb(e.target.value)} className="bg-white" /></div>
// // // // //                     </div>
// // // // //                   </section>
// // // // //                 </CardContent>
// // // // //               </Card>
// // // // //             </AccentCard>

// // // // //             <AccentCard>
// // // // //               <Card className="border-0 shadow-none">
// // // // //                 <CardHeader className="pb-3">
// // // // //                   <CardTitle className="text-lg text-neutral-900">Preview (focused item)</CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">Click any item in Projects list to preview.</CardDescription>
// // // // //                 </CardHeader>
// // // // //                 <CardContent className="space-y-4">
// // // // //                   <div>
// // // // //                     <Label className="text-sm font-semibold">Title</Label>
// // // // //                     <Input value={focusedItem ? getItemTitle(focusedItem) : ""} readOnly placeholder="Select an item to preview" className="bg-neutral-50" />
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <Label className="text-sm font-semibold">Content (HTML/Text)</Label>
// // // // //                     <Textarea value={focusedItem ? getItemHtml(focusedItem) : ""} readOnly placeholder="Select an item to preview" className="min-h-[160px] bg-neutral-50" />
// // // // //                   </div>
// // // // //                 </CardContent>
// // // // //               </Card>
// // // // //             </AccentCard>
// // // // //           </div>

// // // // //           {/* RIGHT (xl: 3) — Run settings */}
// // // // //           <div className="xl:col-span-3">
// // // // //             <div className="sticky top-6 space-y-6">
// // // // //               <AccentCard>
// // // // //                 <Card className="border-0 shadow-none">
// // // // //                   <CardHeader className="pb-4">
// // // // //                     <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
// // // // //                       <IconSparkles className="h-5 w-5 text-neutral-700" />
// // // // //                       Run Settings
// // // // //                     </CardTitle>
// // // // //                     <CardDescription className="text-neutral-600">
// // // // //                       Select the same number of sites as contents
// // // // //                     </CardDescription>
// // // // //                   </CardHeader>

// // // // //                   <CardContent className="space-y-5">
// // // // //                     {/* SITES CHECKBOX LIST */}
// // // // //                     <section className="space-y-2">
// // // // //                       <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                         <IconGlobe className="h-4 w-4 text-neutral-700" />
// // // // //                         Sites ({selectedSitesCount}/{selectedCount || 0})
// // // // //                       </Label>

// // // // //                       {selectedCount === 0 && (
// // // // //                         <div className="text-xs text-neutral-500">
// // // // //                           First select content from left panel.
// // // // //                         </div>
// // // // //                       )}

// // // // //                       <div className="rounded-xl ring-1 ring-neutral-200 bg-white divide-y">
// // // // //                         {SITES.map((s) => {
// // // // //                           const isChecked = selectedSiteValues.has(s.value);
// // // // //                           const disableNew =
// // // // //                             !isChecked && (selectedSitesCount >= selectedCount || selectedCount === 0);

// // // // //                           return (
// // // // //                             <label
// // // // //                               key={s.value}
// // // // //                               className={cn(
// // // // //                                 "flex items-center justify-between gap-3 px-3 py-2 cursor-pointer",
// // // // //                                 disableNew && "opacity-60 cursor-not-allowed"
// // // // //                               )}
// // // // //                             >
// // // // //                               <div className="flex items-center gap-2 min-w-0">
// // // // //                                 <Checkbox
// // // // //                                   checked={isChecked}
// // // // //                                   disabled={disableNew}
// // // // //                                   onCheckedChange={(v) => toggleSite(s.value, !!v)}
// // // // //                                 />
// // // // //                                 <span className="text-sm text-neutral-900 truncate">{s.label}</span>
// // // // //                               </div>

// // // // //                               <Badge variant="outline" className="rounded-full text-[11px]">
// // // // //                                 1 slot
// // // // //                               </Badge>
// // // // //                             </label>
// // // // //                           );
// // // // //                         })}
// // // // //                       </div>

// // // // //                       <p className="text-xs text-neutral-500">
// // // // //                         Rule: {selectedCount} content = {selectedCount} sites.
// // // // //                       </p>
// // // // //                     </section>

// // // // //                     <Separator />

// // // // //                     <div className="grid gap-2">
// // // // //                       <Button
// // // // //                         onClick={handleStart}
// // // // //                         disabled={!readyToStart || isStarting}
// // // // //                         className={cn(
// // // // //                           "rounded-xl bg-neutral-900 text-white shadow-md hover:bg-neutral-800",
// // // // //                           !readyToStart && "opacity-60 cursor-not-allowed"
// // // // //                         )}
// // // // //                       >
// // // // //                         <IconPlayerPlay className="h-4 w-4 mr-2" />
// // // // //                         {isStarting ? "Starting…" : `Start Automation (${selectedCount})`}
// // // // //                       </Button>

// // // // //                       <div className="flex items-center justify-between text-xs text-neutral-600">
// // // // //                         <span className="flex items-center gap-1">
// // // // //                           <IconCheck className="h-3.5 w-3.5" />
// // // // //                           Selected {selectedCount} content
// // // // //                         </span>
// // // // //                         <span className="flex items-center gap-1">
// // // // //                           <IconGlobe className="h-3.5 w-3.5" />
// // // // //                           Selected {selectedSitesCount} sites
// // // // //                         </span>
// // // // //                       </div>

// // // // //                       {jobId && (
// // // // //                         <div className="rounded-xl ring-1 ring-neutral-200 bg-neutral-50 p-3">
// // // // //                           <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
// // // // //                             <span>Job: {jobId}</span><span>{progress}%</span>
// // // // //                           </div>
// // // // //                           <Progress value={progress} className="h-2 bg-neutral-200" />
// // // // //                         </div>
// // // // //                       )}
// // // // //                     </div>
// // // // //                   </CardContent>
// // // // //                 </Card>
// // // // //               </AccentCard>

// // // // //               <div className="rounded-xl ring-1 ring-neutral-200 bg-white p-4 text-sm text-neutral-700">
// // // // //                 <p className="mb-1">✅ <b>Flow:</b> Select content → Select same number of sites → Start</p>
// // // // //                 <p>🧩 <b>Payload:</b> <code>/api/automation/start</code> with <code>targets[]</code> (1 listing per site).</p>
// // // // //                 <div className="mt-3 flex items-center gap-2">
// // // // //                   <Button variant="outline" onClick={handleSavePreset} className="rounded-full">Save Preset</Button>
// // // // //                   <Badge variant="outline" className="rounded-full">7 sites fixed</Badge>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>{/* /grid */}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // // /pages/classified-automation/index.tsx
// // // // // import React, { useEffect, useMemo, useState } from "react";
// // // // // import {
// // // // //   Card,
// // // // //   CardContent,
// // // // //   CardDescription,
// // // // //   CardHeader,
// // // // //   CardTitle,
// // // // // } from "@/components/ui/card";
// // // // // import { Button } from "@/components/ui/button";
// // // // // import { Badge } from "@/components/ui/badge";
// // // // // import { Input } from "@/components/ui/input";
// // // // // import { Label } from "@/components/ui/label";
// // // // // import { Textarea } from "@/components/ui/textarea";
// // // // // import { Separator } from "@/components/ui/separator";
// // // // // import { Progress } from "@/components/ui/progress";
// // // // // import { Checkbox } from "@/components/ui/checkbox";
// // // // // import { toast } from "sonner";
// // // // // import { cn } from "@/lib/utils";
// // // // // import {
// // // // //   Select,
// // // // //   SelectContent,
// // // // //   SelectItem,
// // // // //   SelectTrigger,
// // // // //   SelectValue,
// // // // // } from "@/components/ui/select";

// // // // // import {
// // // // //   IconWorld,
// // // // //   IconListDetails,
// // // // //   IconPlayerPlay,
// // // // //   IconSparkles,
// // // // //   IconAddressBook,
// // // // //   IconTags,
// // // // //   IconMap2,
// // // // //   IconPhoto,
// // // // //   IconWorldWww,
// // // // //   IconAt,
// // // // //   IconBrandFacebook,
// // // // //   IconBrandTwitter,
// // // // //   IconBrandLinkedin,
// // // // //   IconBrandPinterest,
// // // // //   IconBrandInstagram,
// // // // //   IconBrandCpp, // Yelp placeholder
// // // // //   IconBrandGoogle,
// // // // //   IconChevronDown,
// // // // //   IconChevronRight,
// // // // //   IconSearch,
// // // // //   IconFolder,
// // // // //   IconCheck,
// // // // //   IconCircleCheck,
// // // // //   IconCircleX,
// // // // //   IconGlobe,
// // // // // } from "@tabler/icons-react";

// // // // // import {
// // // // //   useListingAutomation,
// // // // //   type GeneratedItem,
// // // // //   type Socials,
// // // // // } from "./hooks/useListingAutomation";

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Constants
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // const CATEGORIES = [
// // // // //   "Electronics",
// // // // //   "Home & Garden",
// // // // //   "Vehicles",
// // // // //   "Jobs",
// // // // //   "Services",
// // // // //   "Real Estate",
// // // // //   "Pets",
// // // // //   "Books",
// // // // //   "Fashion",
// // // // //   "Sports",
// // // // // ];

// // // // // const WORDPRESS_SITES = [
// // // // //   {
// // // // //     value: "linuxpatent.com",
// // // // //     label: "linuxpatent.com (Guest Posting)",
// // // // //     username: "linuxpatent.com",
// // // // //     password: "linuxpatent.com",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "rayseries.com",
// // // // //     label: "rayseries.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "8@O!jIiuQ*NIFV3WdaBa9dsE",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "pasfait.com",
// // // // //     label: "pasfait.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "yCCH0nF$Tyo71grRnHFJ$zyt",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "scotchsavvy.com",
// // // // //     label: "scotchsavvy.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "!l!sGeKwA9^y!7UgvhV1RNnf",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "extremesportsgoons.info",
// // // // //     label: "extremesportsgoons.info (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "Vu9fe!7fmOKL#f#Xd1KjrtO8",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "creeksidereflections.com",
// // // // //     label: "creeksidereflections.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "Tj!riY$sK!IcjoxgIMk&aBGC",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "PiratesGab.com",
// // // // //     label: "PiratesGab.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "ADzQ)e32l^yVG*!7w!Sv1)r7",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "theSportchampion.com",
// // // // //     label: "theSportchampion.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "(bH31Z6BX5Z%b$7$ZGI%@V*1",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "DataDrillAmerAsia.com",
// // // // //     label: "DataDrillAmerAsia.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "A20XfpFnPjTON!(N0FpUceT&",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "htpsouthdowns.com",
// // // // //     label: "htpsouthdowns.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "IhRiyAN$1dpGJPmc#rdke%Ca",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "UsJobSandGigs.com",
// // // // //     label: "UsJobSandGigs.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "S&N8z8l31oB5z)i9l!8hJ^IE",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "VictoriesSport.com",
// // // // //     label: "VictoriesSport.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "vm9)i$yQ*0&LY@TwSrP7UbD$",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "veroniquelacoste.com",
// // // // //     label: "veroniquelacoste.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "@C@EJNa9Q!45Kr2ui8Rcf&Zz",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "missonthemove.com",
// // // // //     label: "missonthemove.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "14Iw2h*uBAXDCGvXnKfiRKaW",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "pcnfa.com",
// // // // //     label: "pcnfa.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "e4uBbiwr848sODXu7ol4H)J9",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "theangelfilm.com",
// // // // //     label: "theangelfilm.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "uqOmUOe4zsnVSqhoNlFmuSh0",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "soerq.com",
// // // // //     label: "soerq.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "S!8zG&whLv4RKFI!PmkkYUBD",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "paydayard.com",
// // // // //     label: "paydayard.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "Or0LiS$9yfpqNToahE6N(WdO",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "trekbadlands.com",
// // // // //     label: "trekbadlands.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "^z@3JoOl^5QZB)BMha%(@*g7",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "pawmeism.com",
// // // // //     label: "pawmeism.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "npNMn5(Dt33JTD2h)WA%Ib@m",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "demokore.com",
// // // // //     label: "demokore.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "EuJDo%8Mv1Oq)mFnhqItAVLN",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "moviemotives.com",
// // // // //     label: "moviemotives.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "@(@mVM5pq&v0CGsvkpd5dUc6",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "apktowns.com",
// // // // //     label: "apktowns.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "oCMtxX%rq$eWkltsntabddZ5",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "mallorcasupport.com",
// // // // //     label: "mallorcasupport.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "z*A@N$8pGPhsmuF%YbQxz27y",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "manageprinters.com",
// // // // //     label: "manageprinters.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "9waZ0Fig2&X!BaqO5LTBLAhN",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "mitchellstover.com",
// // // // //     label: "mitchellstover.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "s&j3d9mUx!G51S5#*gr^a3bO",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "fametize.com",
// // // // //     label: "fametize.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "nc)ijExdWpHRjJk^mTWolzTt",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "luocsu.com",
// // // // //     label: "luocsu.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "Vjy2fiQ@yqJmmUSenskKC#uq",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "inststagram.com",
// // // // //     label: "inststagram.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "m$w8Wq9ustuOEo#!JLUAJLeY",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "ashopear.com",
// // // // //     label: "ashopear.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "01JaDjdjieP9Qbw$DbrI%q)S",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "charles6767.com",
// // // // //     label: "charles6767.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "En4)HXb0cxTRvq%qp$PIlz*e",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "berlintype.com",
// // // // //     label: "berlintype.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "Jf2s)O0q!ig%WK(uLm)BTQDZ",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "sprintcybermonday.com",
// // // // //     label: "sprintcybermonday.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "*^dYF6Eb*bK$bBXWtR88zMA#",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "jamesvirtudazo.com",
// // // // //     label: "jamesvirtudazo.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "IUqYJiibfLJ^sQ@1j7oj*3r2",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "partyprivee.com",
// // // // //     label: "partyprivee.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "OfwUX(s%WEai&s9WPMZ!jWYj",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "launcheell.com",
// // // // //     label: "launcheell.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "nC^suIxOZ4sYPi395&$a5Nhx",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "bridge-busan.com",
// // // // //     label: "bridge-busan.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "7l%P#(NIacu&k04hPL7a9O&U",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "cruitholidayhome.com",
// // // // //     label: "cruitholidayhome.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "2p&iJ%@1A4T*J*yU5p%%TVJX",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "yhbdvideo.com",
// // // // //     label: "yhbdvideo.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "OAObx7y@dpK(2p@47iym4lhb",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "hmboot.com",
// // // // //     label: "hmboot.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "5gn%2EcPEq8Tgud9Jf*P9Dn6",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "allaboutlaptop.com",
// // // // //     label: "allaboutlaptop.com (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: ")Os91UzZlfYiFt)*ViZS7JS*",
// // // // //     type: "wordpress",
// // // // //   },
// // // // //   {
// // // // //     value: "photosdp.net",
// // // // //     label: "photosdp.net (WordPress)",
// // // // //     username: "FlowTrack",
// // // // //     password: "G7$E8mc2&Cws4opuF9ECRRIn",
// // // // //     type: "wordpress",
// // // // //   },
// // // // // ]

// // // // // /** FIXED 7 SITES (1 site = 1 content) */
// // // // // const SITES = [
// // // // //   {
// // // // //     value: "proclassifiedads.com",
// // // // //     label: "proclassifiedads.com",
// // // // //     username: "Zoran",
// // // // //     password: "XsujZnakXKuqZ@&e(o3qSr@!",
// // // // //   },
// // // // //   {
// // // // //     value: "classifiedsposts.com",
// // // // //     label: "classifiedsposts.com",
// // // // //     username: "Fyren",
// // // // //     password: "AEsB%COsrw#!NHp@IaDSpFXs",
// // // // //   },
// // // // //   {
// // // // //     value: "globaladsclassifieds.com",
// // // // //     label: "globaladsclassifieds.com",
// // // // //     username: "Dexo",
// // // // //     password: "^BFrvFvcO0)xT*lh4B^epr4$",
// // // // //   },
// // // // //   {
// // // // //     value: "onlineclassifiedsads.com",
// // // // //     label: "onlineclassifiedsads.com",
// // // // //     username: "Velyn",
// // // // //     password: "oWujA^FC88qcteDObVP8h4FD",
// // // // //   },
// // // // //   {
// // // // //     value: "thelocanto.com",
// // // // //     label: "thelocanto.com",
// // // // //     username: "Tarka",
// // // // //     password: "08uNArlcpnHiihxRz)ubwivK",
// // // // //   },
// // // // //     {
// // // // //     value: "true-finders.com",
// // // // //     label: "true-finders.com",
// // // // //     username: "FlowTrack",
// // // // //     password: "Zl^lEUbc(&)(GbcY^Nkxp@Gt",
// // // // //   },
// // // // //       {
// // // // //     value: "proadvertiser.org",
// // // // //     label: "proadvertiser.org",
// // // // //     username: "FlowTrack",
// // // // //     password: "x&w^XfmST*xino6U&FD1$fp5",
// // // // //   },
// // // // // ];

// // // // // const ALL_SITES = [...SITES, ...WORDPRESS_SITES];

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Local-storage loader (from your content app)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function loadGeneratedItems(): GeneratedItem[] {
// // // // //   const keys = ["content_items_v1", "content-items", "seomatic_content_items"];
// // // // //   for (const k of keys) {
// // // // //     try {
// // // // //       const raw = localStorage.getItem(k);
// // // // //       if (raw) {
// // // // //         const arr = JSON.parse(raw);
// // // // //         if (Array.isArray(arr)) return arr;
// // // // //       }
// // // // //     } catch {}
// // // // //   }
// // // // //   try {
// // // // //     const raw =
// // // // //       sessionStorage.getItem("open-content-item_v1") ??
// // // // //       localStorage.getItem("open-content-item_v1_fallback");
// // // // //     if (raw) {
// // // // //       const it = JSON.parse(raw);
// // // // //       if (it && typeof it === "object") return [it];
// // // // //     }
// // // // //   } catch {}
// // // // //   return [];
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * Small UI helpers (premium theme with better contrast)
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // function AccentCard({ children }: { children: React.ReactNode }) {
// // // // //   return (
// // // // //     <div className="rounded-2xl ring-1 ring-neutral-300/90 bg-neutral-100 shadow-sm overflow-hidden">
// // // // //       <div className="h-1.5 bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900" />
// // // // //       {children}
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // // function SectionTitle({
// // // // //   icon,
// // // // //   children,
// // // // // }: {
// // // // //   icon?: React.ReactNode;
// // // // //   children: React.ReactNode;
// // // // // }) {
// // // // //   return (
// // // // //     <div className="flex items-center gap-2 text-[15px] font-semibold text-neutral-900">
// // // // //       {icon}
// // // // //       {children}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* Tags Input */
// // // // // function TagsInput({
// // // // //   value,
// // // // //   onChange,
// // // // //   placeholder = "Type keyword and press Enter",
// // // // // }: {
// // // // //   value: string[];
// // // // //   onChange: (tags: string[]) => void;
// // // // //   placeholder?: string;
// // // // // }) {
// // // // //   const [draft, setDraft] = useState("");
// // // // //   function addTagFromDraft() {
// // // // //     const parts = draft
// // // // //       .split(/[,\n]/)
// // // // //       .map((s) => s.trim())
// // // // //       .filter(Boolean);
// // // // //     if (parts.length) {
// // // // //       const set = new Set([...value, ...parts]);
// // // // //       onChange(Array.from(set));
// // // // //       setDraft("");
// // // // //     }
// // // // //   }
// // // // //   return (
// // // // //     <div className="rounded-xl ring-1 ring-neutral-300 bg-neutral-50 p-3">
// // // // //       <div className="flex flex-wrap gap-2 mb-2">
// // // // //         {value.map((t) => (
// // // // //           <span
// // // // //             key={t}
// // // // //             className="inline-flex items-center gap-2 rounded-full bg-neutral-100 text-neutral-800 px-3 py-1 text-xs ring-1 ring-neutral-400"
// // // // //           >
// // // // //             <IconTags className="h-3 w-3" />
// // // // //             {t}
// // // // //             <button
// // // // //               onClick={() => onChange(value.filter((x) => x !== t))}
// // // // //               className="ml-1 hover:text-neutral-950"
// // // // //               aria-label={`Remove ${t}`}
// // // // //             >
// // // // //               ×
// // // // //             </button>
// // // // //           </span>
// // // // //         ))}
// // // // //       </div>
// // // // //       <Input
// // // // //         value={draft}
// // // // //         onChange={(e) => setDraft(e.target.value)}
// // // // //         onKeyDown={(e) => {
// // // // //           if (e.key === "Enter") {
// // // // //             e.preventDefault();
// // // // //             addTagFromDraft();
// // // // //           }
// // // // //           if (e.key === "Backspace" && !draft && value.length) {
// // // // //             onChange(value.slice(0, -1));
// // // // //           }
// // // // //         }}
// // // // //         placeholder={placeholder}
// // // // //         className="bg-white"
// // // // //       />
// // // // //       <p className="text-xs text-neutral-500 mt-1">Use Enter or comma to add</p>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* Image Picker */
// // // // // function ImagePicker({
// // // // //   imageUrl,
// // // // //   onImageUrlChange,
// // // // //   file,
// // // // //   onFileChange,
// // // // // }: {
// // // // //   imageUrl: string;
// // // // //   onImageUrlChange: (v: string) => void;
// // // // //   file: File | null;
// // // // //   onFileChange: (f: File | null) => void;
// // // // // }) {
// // // // //   const preview = React.useMemo(
// // // // //     () => (file ? URL.createObjectURL(file) : imageUrl || ""),
// // // // //     [file, imageUrl]
// // // // //   );
// // // // //   return (
// // // // //     <div className="grid gap-3">
// // // // //       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// // // // //         <div>
// // // // //           <Label className="text-sm">Image URL</Label>
// // // // //           <Input
// // // // //             placeholder="https://example.com/image.jpg"
// // // // //             value={imageUrl}
// // // // //             onChange={(e) => onImageUrlChange(e.target.value)}
// // // // //             className="bg-white"
// // // // //           />
// // // // //         </div>
// // // // //         <div>
// // // // //           <Label className="text-sm">Upload Image</Label>
// // // // //           <div className="flex items-center gap-3">
// // // // //             <Input
// // // // //               type="file"
// // // // //               accept="image/*"
// // // // //               className="bg-white"
// // // // //               onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
// // // // //             />
// // // // //             {file && (
// // // // //               <Badge variant="outline" className="rounded-full">
// // // // //                 {file.name}
// // // // //               </Badge>
// // // // //             )}
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //       {preview ? (
// // // // //         <div className="rounded-xl ring-1 ring-neutral-300 bg-neutral-50 p-3">
// // // // //           <img
// // // // //             src={preview}
// // // // //             alt="preview"
// // // // //             className="max-h-56 w-auto rounded-lg object-cover"
// // // // //           />
// // // // //         </div>
// // // // //       ) : (
// // // // //         <div className="rounded-xl ring-1 ring-neutral-300 bg-neutral-100 p-6 text-sm text-neutral-500">
// // // // //           No preview
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* Presets */
// // // // // const PRESET_KEY = "classified_automation_preset_v2";
// // // // // function savePreset(data: any) {
// // // // //   localStorage.setItem(PRESET_KEY, JSON.stringify(data));
// // // // // }
// // // // // function loadPreset(): any | null {
// // // // //   try {
// // // // //     const raw = localStorage.getItem(PRESET_KEY);
// // // // //     return raw ? JSON.parse(raw) : null;
// // // // //   } catch {
// // // // //     return null;
// // // // //   }
// // // // // }

// // // // // /* Fake uploader (replace with real) */
// // // // // async function uploadImageAndGetUrl(file: File): Promise<string> {
// // // // //   return URL.createObjectURL(file);
// // // // // }

// // // // // /* Tiny helpers from items */
// // // // // const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// // // // // const getItemHtml = (it: GeneratedItem) =>
// // // // //   (it.html ?? it.generatedContent ?? "").toString();
// // // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // // //   if (typeof it.keyword === "string")
// // // // //     return it.keyword
// // // // //       .split(/[,\|]/)
// // // // //       .map((s) => s.trim())
// // // // //       .filter(Boolean);
// // // // //   return [];
// // // // // }

// // // // // /* ─────────────────────────────────────────────────────────────
// // // // //  * MAIN
// // // // //  * ────────────────────────────────────────────────────────────*/
// // // // // export default function ClassifiedAutomationPage() {
// // // // //   /* Load all generated items */
// // // // //   const [items, setItems] = useState<GeneratedItem[]>([]);
// // // // //   useEffect(() => setItems(loadGeneratedItems()), []);

// // // // //   /* Hook wiring */
// // // // //   const {
// // // // //     search,
// // // // //     setSearch,
// // // // //     filteredProjects,
// // // // //     expandedProjectIds,
// // // // //     toggleProjectExpand,
// // // // //     selectedItemIds,
// // // // //     isProjectSelected,
// // // // //     isItemSelected,
// // // // //     setProjectChecked,
// // // // //     setItemChecked,
// // // // //     selectAllVisible,
// // // // //     clearSelection,
// // // // //     setFocusedItemId,
// // // // //     focusedItem,
// // // // //     selectedItems,
// // // // //     start,
// // // // //     isStarting,
// // // // //     jobId,
// // // // //     progress,
// // // // //   } = useListingAutomation(items, {
// // // // //     uploadImage: uploadImageAndGetUrl,
// // // // //     statusPollIntervalMs: 1500,
// // // // //     maxPollMinutes: 15,
// // // // //     maxSelectableItems: SITES.length, // ✅ max 7 contents
// // // // //     onMaxExceeded: (max) =>
// // // // //       toast.error(`Max ${max} contents only (sites limit).`),
// // // // //   });

// // // // //   /* Defaults (apply to all selected items) */
// // // // //   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
// // // // //   const [category, setCategory] = useState<string>("");

// // // // //   // Contact / profile
// // // // //   const [phone, setPhone] = useState("");
// // // // //   const [website, setWebsite] = useState("");
// // // // //   const [email, setEmail] = useState("");

// // // // //   // Socials
// // // // //   const [facebook, setFacebook] = useState("");
// // // // //   const [twitter, setTwitter] = useState("");
// // // // //   const [linkedin, setLinkedin] = useState("");
// // // // //   const [pinterest, setPinterest] = useState("");
// // // // //   const [instagram, setInstagram] = useState("");
// // // // //   const [yelp, setYelp] = useState("");
// // // // //   const [gmb, setGmb] = useState("");

// // // // //   // Address
// // // // //   const [country, setCountry] = useState("");
// // // // //   const [state, setStateVal] = useState("");
// // // // //   const [city, setCity] = useState("");
// // // // //   const [zip, setZip] = useState("");
// // // // //   const [line1, setLine1] = useState("");

// // // // //   // Default image (used if item has none)
// // // // //   const [imageUrl, setImageUrl] = useState("");
// // // // //   const [imageFile, setImageFile] = useState<File | null>(null);

// // // // //   // Sites selection (checkbox multi-select)
// // // // //   const [selectedSiteValues, setSelectedSiteValues] = useState<Set<string>>(
// // // // //     new Set()
// // // // //   );

// // // // //   const selectedCount = selectedItems.length;

// // // // // const selectedSites = useMemo(
// // // // //   () => ALL_SITES.filter((s) => selectedSiteValues.has(s.value)),
// // // // //   [selectedSiteValues]
// // // // // );

// // // // //   const selectedSitesCount = selectedSites.length;

// // // // //   // Auto-trim sites if items decrease
// // // // //   useEffect(() => {
// // // // //     if (selectedCount === 0) {
// // // // //       setSelectedSiteValues(new Set());
// // // // //       return;
// // // // //     }
// // // // //     if (selectedSiteValues.size <= selectedCount) return;

// // // // //     setSelectedSiteValues((prev) => {
// // // // //       const arr = Array.from(prev).slice(0, selectedCount);
// // // // //       return new Set(arr);
// // // // //     });
// // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // //   }, [selectedCount]);

// // // // //   function toggleSite(siteValue: string, checked: boolean) {
// // // // //     setSelectedSiteValues((prev) => {
// // // // //       const n = new Set(prev);
// // // // //       if (checked) {
// // // // //         if (selectedCount === 0) {
// // // // //           toast.error("Select content first.");
// // // // //           return prev;
// // // // //         }
// // // // //         if (n.size >= selectedCount) {
// // // // //           toast.error(`You can select only ${selectedCount} site(s).`);
// // // // //           return prev;
// // // // //         }
// // // // //         n.add(siteValue);
// // // // //       } else {
// // // // //         n.delete(siteValue);
// // // // //       }
// // // // //       return n;
// // // // //     });
// // // // //   }

// // // // //   const readyToStart = selectedCount > 0 && selectedSitesCount === selectedCount;

// // // // //   // Preset load
// // // // //   useEffect(() => {
// // // // //     const p = loadPreset();
// // // // //     if (p) {
// // // // //       setPhone(p.phone ?? "");
// // // // //       setWebsite(p.website ?? "");
// // // // //       setEmail(p.email ?? "");
// // // // //       setCountry(p.address?.country ?? "");
// // // // //       setStateVal(p.address?.state ?? "");
// // // // //       setCity(p.address?.city ?? "");
// // // // //       setZip(p.address?.zip ?? "");
// // // // //       setLine1(p.address?.line1 ?? "");
// // // // //       setFacebook(p.socials?.facebook ?? "");
// // // // //       setTwitter(p.socials?.twitter ?? "");
// // // // //       setLinkedin(p.socials?.linkedin ?? "");
// // // // //       setPinterest(p.socials?.pinterest ?? "");
// // // // //       setInstagram(p.socials?.instagram ?? "");
// // // // //       setYelp(p.socials?.yelp ?? "");
// // // // //       setGmb(p.socials?.gmb ?? "");

// // // // //       // load selected sites
// // // // //       if (Array.isArray(p.sites)) {
// // // // //         setSelectedSiteValues(new Set(p.sites));
// // // // //       }
// // // // //     }
// // // // //   }, []);

// // // // //   function handleSavePreset() {
// // // // //     const socials: Socials = {
// // // // //       facebook,
// // // // //       twitter,
// // // // //       linkedin,
// // // // //       pinterest,
// // // // //       instagram,
// // // // //       yelp,
// // // // //       gmb,
// // // // //     };
// // // // //     savePreset({
// // // // //       phone,
// // // // //       website,
// // // // //       email,
// // // // //       address: { country, state, city, zip, line1 },
// // // // //       socials,
// // // // //       sites: Array.from(selectedSiteValues),
// // // // //     });
// // // // //     toast.success("Preset saved");
// // // // //   }

// // // // //   async function handleStart() {
// // // // //     if (!readyToStart) {
// // // // //       toast.error("Select content first, then same number of sites.");
// // // // //       return;
// // // // //     }
// // // // //     try {
// // // // //       const { listings } = await start({
// // // // // sites: selectedSites.map((s: any) => ({
// // // // //   site: s.value,
// // // // //   username: s.username,
// // // // //   password: s.password,
// // // // //   type: s.type ?? "classified",
// // // // // })),

// // // // //         defaults: {
// // // // //           category,
// // // // //           keywordsDefaults,
// // // // //           imageUrl,
// // // // //           imageFile,
// // // // //           profile: {
// // // // //             phone,
// // // // //             website,
// // // // //             email,
// // // // //             socials: {
// // // // //               facebook,
// // // // //               twitter,
// // // // //               linkedin,
// // // // //               pinterest,
// // // // //               instagram,
// // // // //               yelp,
// // // // //               gmb,
// // // // //             },
// // // // //             address: { country, state, city, zip, line1 },
// // // // //           },
// // // // //         },
// // // // //       });
// // // // //       toast.success(`Automation started for ${listings} item(s)`);
// // // // //     } catch (err: any) {
// // // // //       toast.error(err?.message ?? "Failed to start");
// // // // //     }
// // // // //   }

// // // // //   return (
// // // // //     <div className="min-h-screen bg-neutral-100">
// // // // //       <div className="mx-auto max-w-screen-2xl px-6 py-8">
// // // // //         {/* Top Header */}
// // // // //         <AccentCard>
// // // // //           <Card className="border-0 shadow-none bg-transparent">
// // // // //             <CardHeader className="pb-4">
// // // // //               <div className="flex items-center justify-between gap-4">
// // // // //                 <div>
// // // // //                   <CardTitle className="flex items-center gap-2 text-2xl text-neutral-900">
// // // // //                     <IconListDetails className="h-6 w-6 text-neutral-700" />
// // // // //                     Classified Listing Automation
// // // // //                   </CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">
// // // // //                     Select content → Select same number of sites → Start
// // // // //                   </CardDescription>
// // // // //                 </div>
// // // // //                 <div className="hidden md:flex items-center gap-2">
// // // // //                   <div className="relative">
// // // // //                     <IconSearch className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // // //                     <Input
// // // // //                       value={search}
// // // // //                       onChange={(e) => setSearch(e.target.value)}
// // // // //                       placeholder="Search title / keywords…"
// // // // //                       className="pl-9 bg-white w-[320px]"
// // // // //                     />
// // // // //                   </div>
// // // // //                   <Badge variant="outline" className="rounded-full">
// // // // //                     Selected: {selectedCount}/{SITES.length}
// // // // //                   </Badge>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </CardHeader>
// // // // //           </Card>
// // // // //         </AccentCard>

// // // // //         {/* 3 symmetric columns */}
// // // // //         <div className="mt-8 grid gap-8 xl:grid-cols-12">
// // // // //           {/* LEFT (xl: 4) — Projects */}
// // // // //           <div className="xl:col-span-4">
// // // // //             <div className="sticky top-6 space-y-6">
// // // // //               <AccentCard>
// // // // //                 <Card className="border-0 shadow-none bg-transparent">
// // // // //                   <CardHeader className="pb-3">
// // // // //                     <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
// // // // //                       <IconFolder className="h-5 w-5 text-neutral-700" />
// // // // //                       Projects
// // // // //                     </CardTitle>
// // // // //                     <CardDescription className="text-neutral-600">
// // // // //                       Tick projects or individual items to post.
// // // // //                     </CardDescription>
// // // // //                   </CardHeader>
// // // // //                   <CardContent className="space-y-3">
// // // // //                     <div className="md:hidden mb-2">
// // // // //                       <div className="relative">
// // // // //                         <IconSearch className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // // //                         <Input
// // // // //                           value={search}
// // // // //                           onChange={(e) => setSearch(e.target.value)}
// // // // //                           placeholder="Search title / keywords…"
// // // // //                           className="pl-9 bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                     </div>

// // // // //                     <div className="flex items-center justify-between text-xs text-neutral-600">
// // // // //                       <div className="flex items-center gap-2">
// // // // //                         <Button
// // // // //                           variant="outline"
// // // // //                           size="sm"
// // // // //                           onClick={selectAllVisible}
// // // // //                           className="rounded-full h-7 px-3"
// // // // //                         >
// // // // //                           <IconCircleCheck className="h-3.5 w-3.5 mr-1" />{" "}
// // // // //                           Select All Visible
// // // // //                         </Button>
// // // // //                         <Button
// // // // //                           variant="outline"
// // // // //                           size="sm"
// // // // //                           onClick={clearSelection}
// // // // //                           className="rounded-full h-7 px-3"
// // // // //                         >
// // // // //                           <IconCircleX className="h-3.5 w-3.5 mr-1" /> Clear
// // // // //                         </Button>
// // // // //                       </div>
// // // // //                       <span className="text-neutral-500">
// // // // //                         Projects: {filteredProjects.length}
// // // // //                       </span>
// // // // //                     </div>

// // // // //                     <div className="max-h-[620px] overflow-auto pr-1">
// // // // //                       {filteredProjects.length === 0 && (
// // // // //                         <div className="text-sm text-neutral-500">
// // // // //                           No items found.
// // // // //                         </div>
// // // // //                       )}

// // // // //                       {filteredProjects.map((p, idx) => {
// // // // //                         const expanded = expandedProjectIds.has(p.id);
// // // // //                         const projectSelected = isProjectSelected(p.id);
// // // // //                         const selectedCountInProject = p.items.filter((it) =>
// // // // //                           selectedItemIds.has(it.id)
// // // // //                         ).length;
// // // // //                         const total = p.items.length;

// // // // //                         return (
// // // // //                           <div
// // // // //                             key={p.id}
// // // // //                             className="rounded-xl ring-1 ring-neutral-300 bg-neutral-50 mb-3 overflow-hidden"
// // // // //                           >
// // // // //                             {/* Project row */}
// // // // //                             <div className="flex items-center justify-between p-3">
// // // // //                               <div className="flex items-center gap-3">
// // // // //                                 <Button
// // // // //                                   variant="ghost"
// // // // //                                   size="icon"
// // // // //                                   onClick={() => toggleProjectExpand(p.id)}
// // // // //                                   className="h-7 w-7 rounded-full"
// // // // //                                   aria-label={
// // // // //                                     expanded ? "Collapse" : "Expand"
// // // // //                                   }
// // // // //                                 >
// // // // //                                   {expanded ? (
// // // // //                                     <IconChevronDown className="h-4 w-4" />
// // // // //                                   ) : (
// // // // //                                     <IconChevronRight className="h-4 w-4" />
// // // // //                                   )}
// // // // //                                 </Button>

// // // // //                                 <Checkbox
// // // // //                                   checked={projectSelected}
// // // // //                                   onCheckedChange={(v) =>
// // // // //                                     setProjectChecked(p.id, !!v)
// // // // //                                   }
// // // // //                                   className={cn(
// // // // //                                     "mr-1 h-4 w-4 border-neutral-500 data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900"
// // // // //                                   )}
// // // // //                                   aria-label="Select project"
// // // // //                                 />
// // // // //                                 <span className="text-sm font-medium text-neutral-800 tabular-nums">
// // // // //                                   {String(idx + 1).padStart(2, "0")}.
// // // // //                                 </span>
// // // // //                                 <span className="text-sm font-medium text-neutral-900">
// // // // //                                   {p.name}
// // // // //                                 </span>
// // // // //                               </div>

// // // // //                               <Badge
// // // // //                                 variant="outline"
// // // // //                                 className={cn(
// // // // //                                   "rounded-full text-xs",
// // // // //                                   selectedCountInProject
// // // // //                                     ? "border-neutral-800 text-neutral-900"
// // // // //                                     : "border-neutral-300 text-neutral-600"
// // // // //                                 )}
// // // // //                               >
// // // // //                                 {selectedCountInProject}/{total}
// // // // //                               </Badge>
// // // // //                             </div>

// // // // //                             {/* Items list */}
// // // // //                             {expanded && (
// // // // //                               <div className="border-t border-neutral-200 divide-y divide-neutral-100">
// // // // //                                 {p.items.map((it, iidx) => {
// // // // //                                   const checked = isItemSelected(it.id);
// // // // //                                   return (
// // // // //                                     <div
// // // // //                                       key={it.id}
// // // // //                                       className={cn(
// // // // //                                         "flex items-center justify-between px-3 py-2 hover:bg-neutral-100 transition-colors",
// // // // //                                         checked &&
// // // // //                                           "bg-neutral-100/80 ring-1 ring-inset ring-neutral-200"
// // // // //                                       )}
// // // // //                                     >
// // // // //                                       <div className="flex items-center gap-3 min-w-0">
// // // // //                                         <span className="text-[11px] text-neutral-500 w-6 text-right tabular-nums">
// // // // //                                           {iidx + 1}
// // // // //                                         </span>
// // // // //                                         <Checkbox
// // // // //                                           checked={checked}
// // // // //                                           onCheckedChange={(v) =>
// // // // //                                             setItemChecked(p.id, it.id, !!v)
// // // // //                                           }
// // // // //                                           className="h-4 w-4 border-neutral-500 data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900"
// // // // //                                           aria-label="Select item"
// // // // //                                         />
// // // // //                                         <button
// // // // //                                           className="text-left min-w-0"
// // // // //                                           onClick={() =>
// // // // //                                             setFocusedItemId(it.id)
// // // // //                                           }
// // // // //                                         >
// // // // //                                           <div className="text-sm font-medium text-neutral-900 truncate max-w-[220px]">
// // // // //                                            { (getItemTitle(it) || getItemKeywords(it)[0]) ?? "Untitled" }

// // // // //                                           </div>
// // // // //                                           <div className="text-xs text-neutral-500 truncate max-w-[220px]">
// // // // //                                             {getItemKeywords(it).join(", ")}
// // // // //                                           </div>
// // // // //                                         </button>
// // // // //                                       </div>
// // // // //                                       {checked && (
// // // // //                                         <IconCheck className="h-4 w-4 text-neutral-900 flex-shrink-0" />
// // // // //                                       )}
// // // // //                                     </div>
// // // // //                                   );
// // // // //                                 })}
// // // // //                               </div>
// // // // //                             )}
// // // // //                           </div>
// // // // //                         );
// // // // //                       })}
// // // // //                     </div>
// // // // //                   </CardContent>
// // // // //                 </Card>
// // // // //               </AccentCard>
// // // // //             </div>
// // // // //           </div>

// // // // //           {/* CENTER (xl: 5) — Defaults + Preview */}
// // // // //           <div className="xl:col-span-5 space-y-6">
// // // // //             <AccentCard>
// // // // //               <Card className="border-0 shadow-none bg-transparent">
// // // // //                 <CardHeader className="pb-4">
// // // // //                   <CardTitle className="text-lg text-neutral-900">
// // // // //                     Listing Defaults
// // // // //                   </CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">
// // // // //                     Apply to all selected items.
// // // // //                   </CardDescription>
// // // // //                 </CardHeader>
// // // // //                 <CardContent className="space-y-6">
// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle
// // // // //                       icon={
// // // // //                         <IconTags className="h-4 w-4 text-neutral-700" />
// // // // //                       }
// // // // //                     >
// // // // //                       Keyword Tags (add-on)
// // // // //                     </SectionTitle>
// // // // //                     <TagsInput
// // // // //                       value={keywordsDefaults}
// // // // //                       onChange={setKeywordsDefaults}
// // // // //                     />
// // // // //                   </section>

// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle>Category</SectionTitle>
// // // // //                     <Select value={category} onValueChange={setCategory}>
// // // // //                       <SelectTrigger className="bg-white">
// // // // //                         <SelectValue placeholder="Choose a category" />
// // // // //                       </SelectTrigger>
// // // // //                       <SelectContent>
// // // // //                         {CATEGORIES.map((c) => (
// // // // //                           <SelectItem key={c} value={c}>
// // // // //                             {c}
// // // // //                           </SelectItem>
// // // // //                         ))}
// // // // //                       </SelectContent>
// // // // //                     </Select>
// // // // //                   </section>

// // // // //                   <section className="space-y-2">
// // // // //                     <SectionTitle
// // // // //                       icon={
// // // // //                         <IconPhoto className="h-4 w-4 text-neutral-700" />
// // // // //                       }
// // // // //                     >
// // // // //                       Default Image
// // // // //                     </SectionTitle>
// // // // //                     <ImagePicker
// // // // //                       imageUrl={imageUrl}
// // // // //                       onImageUrlChange={setImageUrl}
// // // // //                       file={imageFile}
// // // // //                       onFileChange={setImageFile}
// // // // //                     />
// // // // //                     <p className="text-xs text-neutral-500">
// // // // //                       Used only if an item has no image.
// // // // //                     </p>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle
// // // // //                       icon={
// // // // //                         <IconMap2 className="h-4 w-4 text-neutral-700" />
// // // // //                       }
// // // // //                     >
// // // // //                       Address
// // // // //                     </SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-2">
// // // // //                       <div>
// // // // //                         <Label className="text-xs">Country</Label>
// // // // //                         <Input
// // // // //                           value={country}
// // // // //                           onChange={(e) => setCountry(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <Label className="text-xs">State</Label>
// // // // //                         <Input
// // // // //                           value={state}
// // // // //                           onChange={(e) => setStateVal(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <Label className="text-xs">City</Label>
// // // // //                         <Input
// // // // //                           value={city}
// // // // //                           onChange={(e) => setCity(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <Label className="text-xs">ZIP Code</Label>
// // // // //                         <Input
// // // // //                           value={zip}
// // // // //                           onChange={(e) => setZip(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                     </div>
// // // // //                     <div>
// // // // //                       <Label className="text-xs">Address Line</Label>
// // // // //                       <Input
// // // // //                         value={line1}
// // // // //                         onChange={(e) => setLine1(e.target.value)}
// // // // //                         className="bg-white"
// // // // //                       />
// // // // //                     </div>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle
// // // // //                       icon={
// // // // //                         <IconAddressBook className="h-4 w-4 text-neutral-700" />
// // // // //                       }
// // // // //                     >
// // // // //                       Contact
// // // // //                     </SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-3">
// // // // //                       <div>
// // // // //                         <Label className="text-xs">Phone</Label>
// // // // //                         <Input
// // // // //                           value={phone}
// // // // //                           onChange={(e) => setPhone(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <Label className="text-xs">Website</Label>
// // // // //                         <div className="flex items-center">
// // // // //                           <IconWorldWww className="h-4 w-4 mr-2 text-neutral-500" />
// // // // //                           <Input
// // // // //                             value={website}
// // // // //                             onChange={(e) => setWebsite(e.target.value)}
// // // // //                             className="bg-white"
// // // // //                           />
// // // // //                         </div>
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <Label className="text-xs">Email</Label>
// // // // //                         <div className="flex items-center">
// // // // //                           <IconAt className="h-4 w-4 mr-2 text-neutral-500" />
// // // // //                           <Input
// // // // //                             value={email}
// // // // //                             onChange={(e) => setEmail(e.target.value)}
// // // // //                             className="bg-white"
// // // // //                           />
// // // // //                         </div>
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </section>

// // // // //                   <section className="space-y-3">
// // // // //                     <SectionTitle
// // // // //                       icon={
// // // // //                         <IconWorld className="h-4 w-4 text-neutral-700" />
// // // // //                       }
// // // // //                     >
// // // // //                       Social Profiles
// // // // //                     </SectionTitle>
// // // // //                     <div className="grid gap-3 md:grid-cols-2">
// // // // //                       <div>
// // // // //                         <Label className="text-xs flex items-center gap-1">
// // // // //                           <IconBrandFacebook className="h-3 w-3" /> Facebook
// // // // //                           Page
// // // // //                         </Label>
// // // // //                         <Input
// // // // //                           value={facebook}
// // // // //                           onChange={(e) => setFacebook(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <Label className="text-xs flex items-center gap-1">
// // // // //                           <IconBrandTwitter className="h-3 w-3" /> Twitter / X
// // // // //                         </Label>
// // // // //                         <Input
// // // // //                           value={twitter}
// // // // //                           onChange={(e) => setTwitter(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <Label className="text-xs flex items-center gap-1">
// // // // //                           <IconBrandLinkedin className="h-3 w-3" /> LinkedIn
// // // // //                         </Label>
// // // // //                         <Input
// // // // //                           value={linkedin}
// // // // //                           onChange={(e) => setLinkedin(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <Label className="text-xs flex items-center gap-1">
// // // // //                           <IconBrandPinterest className="h-3 w-3" /> Pinterest
// // // // //                         </Label>
// // // // //                         <Input
// // // // //                           value={pinterest}
// // // // //                           onChange={(e) => setPinterest(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <Label className="text-xs flex items-center gap-1">
// // // // //                           <IconBrandInstagram className="h-3 w-3" /> Instagram
// // // // //                         </Label>
// // // // //                         <Input
// // // // //                           value={instagram}
// // // // //                           onChange={(e) => setInstagram(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                       <div>
// // // // //                         <Label className="text-xs flex items-center gap-1">
// // // // //                           <IconBrandCpp className="h-3 w-3" /> Yelp
// // // // //                         </Label>
// // // // //                         <Input
// // // // //                           value={yelp}
// // // // //                           onChange={(e) => setYelp(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                       <div className="md:col-span-2">
// // // // //                         <Label className="text-xs flex items-center gap-1">
// // // // //                           <IconBrandGoogle className="h-3 w-3" /> Google
// // // // //                           Business Profile
// // // // //                         </Label>
// // // // //                         <Input
// // // // //                           value={gmb}
// // // // //                           onChange={(e) => setGmb(e.target.value)}
// // // // //                           className="bg-white"
// // // // //                         />
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </section>
// // // // //                 </CardContent>
// // // // //               </Card>
// // // // //             </AccentCard>

// // // // //             <AccentCard>
// // // // //               <Card className="border-0 shadow-none bg-transparent">
// // // // //                 <CardHeader className="pb-3">
// // // // //                   <CardTitle className="text-lg text-neutral-900">
// // // // //                     Preview (focused item)
// // // // //                   </CardTitle>
// // // // //                   <CardDescription className="text-neutral-600">
// // // // //                     Click any item in Projects list to preview.
// // // // //                   </CardDescription>
// // // // //                 </CardHeader>
// // // // //                 <CardContent className="space-y-4">
// // // // //                   <div>
// // // // //                     <Label className="text-sm font-semibold">Title</Label>
// // // // //                     <Input
// // // // //                       value={focusedItem ? getItemTitle(focusedItem) : ""}
// // // // //                       readOnly
// // // // //                       placeholder="Select an item to preview"
// // // // //                       className="bg-neutral-50"
// // // // //                     />
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <Label className="text-sm font-semibold">
// // // // //                       Content (HTML/Text)
// // // // //                     </Label>
// // // // //                     <Textarea
// // // // //                       value={focusedItem ? getItemHtml(focusedItem) : ""}
// // // // //                       readOnly
// // // // //                       placeholder="Select an item to preview"
// // // // //                       className="min-h-[160px] bg-neutral-50"
// // // // //                     />
// // // // //                   </div>
// // // // //                 </CardContent>
// // // // //               </Card>
// // // // //             </AccentCard>
// // // // //           </div>

// // // // //           {/* RIGHT (xl: 3) — Run settings */}
// // // // //           <div className="xl:col-span-3">
// // // // //             <div className="sticky top-6 space-y-6">
// // // // //               <AccentCard>
// // // // //                 <Card className="border-0 shadow-none bg-transparent">
// // // // //                   <CardHeader className="pb-4">
// // // // //                     <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
// // // // //                       <IconSparkles className="h-5 w-5 text-neutral-700" />
// // // // //                       Run Settings
// // // // //                     </CardTitle>
// // // // //                     <CardDescription className="text-neutral-600">
// // // // //                       Select the same number of sites as contents
// // // // //                     </CardDescription>
// // // // //                   </CardHeader>

// // // // //                   <CardContent className="space-y-5">
// // // // //                     {/* SITES CHECKBOX LIST */}
// // // // //                     <section className="space-y-2">
// // // // //                       <Label className="text-sm font-semibold flex items-center gap-2">
// // // // //                         <IconGlobe className="h-4 w-4 text-neutral-700" />
// // // // //                         Sites ({selectedSitesCount}/{selectedCount || 0})
// // // // //                       </Label>

// // // // //                       {selectedCount === 0 && (
// // // // //                         <div className="text-xs text-neutral-500">
// // // // //                           First select content from left panel.
// // // // //                         </div>
// // // // //                       )}

// // // // //                       <div className="rounded-xl ring-1 ring-neutral-300 bg-neutral-50 divide-y divide-neutral-200">
// // // // //                         {ALL_SITES.map((s) => {
// // // // //                           const isChecked = selectedSiteValues.has(s.value);
// // // // //                           const disableNew =
// // // // //                             !isChecked &&
// // // // //                             (selectedSitesCount >= selectedCount ||
// // // // //                               selectedCount === 0);

// // // // //                           return (
// // // // //                             <label
// // // // //                               key={s.value}
// // // // //                               className={cn(
// // // // //                                 "flex items-center justify-between gap-3 px-3 py-2 cursor-pointer transition-colors",
// // // // //                                 isChecked &&
// // // // //                                   "bg-neutral-100/80 ring-1 ring-neutral-200",
// // // // //                                 disableNew && "opacity-60 cursor-not-allowed"
// // // // //                               )}
// // // // //                             >
// // // // //                               <div className="flex items-center gap-2 min-w-0">
// // // // //                                 <Checkbox
// // // // //                                   checked={isChecked}
// // // // //                                   disabled={disableNew}
// // // // //                                   onCheckedChange={(v) =>
// // // // //                                     toggleSite(s.value, !!v)
// // // // //                                   }
// // // // //                                   className="h-4 w-4 border-neutral-500 data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900"
// // // // //                                 />
// // // // //                                 <span className="text-sm text-neutral-900 truncate">
// // // // //                                   {s.label}
// // // // //                                 </span>
// // // // //                               </div>

// // // // //                               <Badge
// // // // //                                 variant="outline"
// // // // //                                 className="rounded-full text-[11px]"
// // // // //                               >
// // // // //                                 1 slot
// // // // //                               </Badge>
// // // // //                             </label>
// // // // //                           );
// // // // //                         })}
// // // // //                       </div>

// // // // //                       <p className="text-xs text-neutral-500">
// // // // //                         Rule: {selectedCount} content = {selectedCount} sites.
// // // // //                       </p>
// // // // //                     </section>

// // // // //                     <Separator />

// // // // //                     <div className="grid gap-2">
// // // // //                       <Button
// // // // //                         onClick={handleStart}
// // // // //                         disabled={!readyToStart || isStarting}
// // // // //                         className={cn(
// // // // //                           "rounded-xl bg-neutral-900 text-white shadow-md hover:bg-neutral-800",
// // // // //                           !readyToStart && "opacity-60 cursor-not-allowed"
// // // // //                         )}
// // // // //                       >
// // // // //                         <IconPlayerPlay className="h-4 w-4 mr-2" />
// // // // //                         {isStarting
// // // // //                           ? "Starting…"
// // // // //                           : `Start Automation (${selectedCount})`}
// // // // //                       </Button>

// // // // //                       <div className="flex items-center justify-between text-xs text-neutral-600">
// // // // //                         <span className="flex items-center gap-1">
// // // // //                           <IconCheck className="h-3.5 w-3.5" />
// // // // //                           Selected {selectedCount} content
// // // // //                         </span>
// // // // //                         <span className="flex items-center gap-1">
// // // // //                           <IconGlobe className="h-3.5 w-3.5" />
// // // // //                           Selected {selectedSitesCount} sites
// // // // //                         </span>
// // // // //                       </div>

// // // // //                       {jobId && (
// // // // //                         <div className="rounded-xl ring-1 ring-neutral-300 bg-neutral-50 p-3">
// // // // //                           <div className="flex items-center justify-between text-xs text-neutral-600 mb-2">
// // // // //                             <span>Job: {jobId}</span>
// // // // //                             <span>{progress}%</span>
// // // // //                           </div>
// // // // //                           <Progress
// // // // //                             value={progress}
// // // // //                             className="h-2 bg-neutral-200"
// // // // //                           />
// // // // //                         </div>
// // // // //                       )}
// // // // //                     </div>
// // // // //                   </CardContent>
// // // // //                 </Card>
// // // // //               </AccentCard>

// // // // //               <div className="rounded-xl ring-1 ring-neutral-300 bg-white p-4 text-sm text-neutral-700">
// // // // //                 <p className="mb-1">
// // // // //                   ✅ <b>Flow:</b> Select content → Select same number of sites →
// // // // //                   Start
// // // // //                 </p>
// // // // //                 <p>
// // // // //                   🧩 <b>Payload:</b> <code>/api/automation/start</code> with{" "}
// // // // //                   <code>targets[]</code> (1 listing per site).
// // // // //                 </p>
// // // // //                 <div className="mt-3 flex items-center gap-2">
// // // // //                   <Button
// // // // //                     variant="outline"
// // // // //                     onClick={handleSavePreset}
// // // // //                     className="rounded-full"
// // // // //                   >
// // // // //                     Save Preset
// // // // //                   </Button>
// // // // //                   <Badge variant="outline" className="rounded-full">
// // // // //                     7 sites fixed
// // // // //                   </Badge>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //         {/* /grid */}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /pages/classified-automation/index.tsx
// // // // import React, { useEffect, useMemo, useState } from "react";
// // // // import {
// // // //   Card,
// // // //   CardContent,
// // // //   CardDescription,
// // // //   CardHeader,
// // // //   CardTitle,
// // // // } from "@/components/ui/card";
// // // // import { Button } from "@/components/ui/button";
// // // // import { Badge } from "@/components/ui/badge";
// // // // import { Input } from "@/components/ui/input";
// // // // import { Label } from "@/components/ui/label";
// // // // import { Textarea } from "@/components/ui/textarea";
// // // // import { Separator } from "@/components/ui/separator";
// // // // import { Progress } from "@/components/ui/progress";
// // // // import { Checkbox } from "@/components/ui/checkbox";
// // // // import { toast } from "sonner";
// // // // import { cn } from "@/lib/utils";
// // // // import {
// // // //   Select,
// // // //   SelectContent,
// // // //   SelectItem,
// // // //   SelectTrigger,
// // // //   SelectValue,
// // // // } from "@/components/ui/select";

// // // // import {
// // // //   IconWorld,
// // // //   IconListDetails,
// // // //   IconPlayerPlay,
// // // //   IconSparkles,
// // // //   IconAddressBook,
// // // //   IconTags,
// // // //   IconMap2,
// // // //   IconPhoto,
// // // //   IconWorldWww,
// // // //   IconAt,
// // // //   IconBrandFacebook,
// // // //   IconBrandTwitter,
// // // //   IconBrandLinkedin,
// // // //   IconBrandPinterest,
// // // //   IconBrandInstagram,
// // // //   IconBrandCpp, // Yelp placeholder
// // // //   IconBrandGoogle,
// // // //   IconChevronDown,
// // // //   IconChevronRight,
// // // //   IconSearch,
// // // //   IconFolder,
// // // //   IconCheck,
// // // //   IconCircleCheck,
// // // //   IconCircleX,
// // // //   IconGlobe,
// // // // } from "@tabler/icons-react";

// // // // import {
// // // //   useListingAutomation,
// // // //   type GeneratedItem,
// // // //   type Socials,
// // // // } from "./hooks/useListingAutomation";

// // // // /* ─────────────────────────────────────────────────────────────
// // // //  * Constants
// // // //  * ────────────────────────────────────────────────────────────*/
// // // // const CATEGORIES = [
// // // //   "Electronics",
// // // //   "Home & Garden",
// // // //   "Vehicles",
// // // //   "Jobs",
// // // //   "Services",
// // // //   "Real Estate",
// // // //   "Pets",
// // // //   "Books",
// // // //   "Fashion",
// // // //   "Sports",
// // // // ];

// // // // const WORDPRESS_SITES = [
// // // //   {
// // // //     value: "linuxpatent.com",
// // // //     label: "linuxpatent.com (WordPress)",
// // // //     username: "linuxpatent.com",
// // // //     password: "linuxpatent.com",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "rayseries.com",
// // // //     label: "rayseries.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "8@O!jIiuQ*NIFV3WdaBa9dsE",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "pasfait.com",
// // // //     label: "pasfait.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "yCCH0nF$Tyo71grRnHFJ$zyt",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "scotchsavvy.com",
// // // //     label: "scotchsavvy.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "!l!sGeKwA9^y!7UgvhV1RNnf",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "extremesportsgoons.info",
// // // //     label: "extremesportsgoons.info (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "Vu9fe!7fmOKL#f#Xd1KjrtO8",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "creeksidereflections.com",
// // // //     label: "creeksidereflections.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "Tj!riY$sK!IcjoxgIMk&aBGC",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "PiratesGab.com",
// // // //     label: "PiratesGab.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "ADzQ)e32l^yVG*!7w!Sv1)r7",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "theSportchampion.com",
// // // //     label: "theSportchampion.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "(bH31Z6BX5Z%b$7$ZGI%@V*1",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "DataDrillAmerAsia.com",
// // // //     label: "DataDrillAmerAsia.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "A20XfpFnPjTON!(N0FpUceT&",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "htpsouthdowns.com",
// // // //     label: "htpsouthdowns.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "IhRiyAN$1dpGJPmc#rdke%Ca",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "UsJobSandGigs.com",
// // // //     label: "UsJobSandGigs.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "S&N8z8l31oB5z)i9l!8hJ^IE",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "VictoriesSport.com",
// // // //     label: "VictoriesSport.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "vm9)i$yQ*0&LY@TwSrP7UbD$",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "veroniquelacoste.com",
// // // //     label: "veroniquelacoste.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "@C@EJNa9Q!45Kr2ui8Rcf&Zz",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "missonthemove.com",
// // // //     label: "missonthemove.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "14Iw2h*uBAXDCGvXnKfiRKaW",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "pcnfa.com",
// // // //     label: "pcnfa.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "e4uBbiwr848sODXu7ol4H)J9",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "theangelfilm.com",
// // // //     label: "theangelfilm.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "uqOmUOe4zsnVSqhoNlFmuSh0",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "soerq.com",
// // // //     label: "soerq.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "S!8zG&whLv4RKFI!PmkkYUBD",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "paydayard.com",
// // // //     label: "paydayard.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "Or0LiS$9yfpqNToahE6N(WdO",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "trekbadlands.com",
// // // //     label: "trekbadlands.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "^z@3JoOl^5QZB)BMha%(@*g7",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "pawmeism.com",
// // // //     label: "pawmeism.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "npNMn5(Dt33JTD2h)WA%Ib@m",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "demokore.com",
// // // //     label: "demokore.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "EuJDo%8Mv1Oq)mFnhqItAVLN",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "moviemotives.com",
// // // //     label: "moviemotives.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "@(@mVM5pq&v0CGsvkpd5dUc6",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "apktowns.com",
// // // //     label: "apktowns.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "oCMtxX%rq$eWkltsntabddZ5",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "mallorcasupport.com",
// // // //     label: "mallorcasupport.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "z*A@N$8pGPhsmuF%YbQxz27y",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "manageprinters.com",
// // // //     label: "manageprinters.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "9waZ0Fig2&X!BaqO5LTBLAhN",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "mitchellstover.com",
// // // //     label: "mitchellstover.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "s&j3d9mUx!G51S5#*gr^a3bO",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "fametize.com",
// // // //     label: "fametize.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "nc)ijExdWpHRjJk^mTWolzTt",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "luocsu.com",
// // // //     label: "luocsu.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "Vjy2fiQ@yqJmmUSenskKC#uq",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "inststagram.com",
// // // //     label: "inststagram.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "m$w8Wq9ustuOEo#!JLUAJLeY",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "ashopear.com",
// // // //     label: "ashopear.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "01JaDjdjieP9Qbw$DbrI%q)S",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "charles6767.com",
// // // //     label: "charles6767.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "En4)HXb0cxTRvq%qp$PIlz*e",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "berlintype.com",
// // // //     label: "berlintype.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "Jf2s)O0q!ig%WK(uLm)BTQDZ",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "sprintcybermonday.com",
// // // //     label: "sprintcybermonday.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "*^dYF6Eb*bK$bBXWtR88zMA#",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "jamesvirtudazo.com",
// // // //     label: "jamesvirtudazo.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "IUqYJiibfLJ^sQ@1j7oj*3r2",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "partyprivee.com",
// // // //     label: "partyprivee.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "OfwUX(s%WEai&s9WPMZ!jWYj",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "launcheell.com",
// // // //     label: "launcheell.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "nC^suIxOZ4sYPi395&$a5Nhx",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "bridge-busan.com",
// // // //     label: "bridge-busan.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "7l%P#(NIacu&k04hPL7a9O&U",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "cruitholidayhome.com",
// // // //     label: "cruitholidayhome.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "2p&iJ%@1A4T*J*yU5p%%TVJX",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "yhbdvideo.com",
// // // //     label: "yhbdvideo.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "OAObx7y@dpK(2p@47iym4lhb",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "hmboot.com",
// // // //     label: "hmboot.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "5gn%2EcPEq8Tgud9Jf*P9Dn6",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "allaboutlaptop.com",
// // // //     label: "allaboutlaptop.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: ")Os91UzZlfYiFt)*ViZS7JS*",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "photosdp.net",
// // // //     label: "photosdp.net (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "G7$E8mc2&Cws4opuF9ECRRIn",
// // // //     type: "wordpress",
// // // //   },
// // // // ];

// // // // /** FIXED 7 SITES (1 site = 1 content) */
// // // // const SITES = [
// // // //   {
// // // //     value: "proclassifiedads.com",
// // // //     label: "proclassifiedads.com",
// // // //     username: "Zoran",
// // // //     password: "XsujZnakXKuqZ@&e(o3qSr@!",
// // // //   },
// // // //   {
// // // //     value: "classifiedsposts.com",
// // // //     label: "classifiedsposts.com",
// // // //     username: "Fyren",
// // // //     password: "AEsB%COsrw#!NHp@IaDSpFXs",
// // // //   },
// // // //   {
// // // //     value: "globaladsclassifieds.com",
// // // //     label: "globaladsclassifieds.com",
// // // //     username: "Dexo",
// // // //     password: "^BFrvFvcO0)xT*lh4B^epr4$",
// // // //   },
// // // //   {
// // // //     value: "onlineclassifiedsads.com",
// // // //     label: "onlineclassifiedsads.com",
// // // //     username: "Velyn",
// // // //     password: "oWujA^FC88qcteDObVP8h4FD",
// // // //   },
// // // //   {
// // // //     value: "thelocanto.com",
// // // //     label: "thelocanto.com",
// // // //     username: "Tarka",
// // // //     password: "08uNArlcpnHiihxRz)ubwivK",
// // // //   },
// // // //   {
// // // //     value: "true-finders.com",
// // // //     label: "true-finders.com",
// // // //     username: "FlowTrack",
// // // //     password: "Zl^lEUbc(&)(GbcY^Nkxp@Gt",
// // // //   },
// // // //   {
// // // //     value: "proadvertiser.org",
// // // //     label: "proadvertiser.org",
// // // //     username: "FlowTrack",
// // // //     password: "x&w^XfmST*xino6U&FD1$fp5",
// // // //   },
// // // // ];

// // // // const ALL_SITES = [...SITES, ...WORDPRESS_SITES];

// // // // /* ─────────────────────────────────────────────────────────────
// // // //  * Local-storage loader (from your content app)
// // // //  * ────────────────────────────────────────────────────────────*/
// // // // function loadGeneratedItems(): GeneratedItem[] {
// // // //   const keys = ["content_items_v1", "content-items", "seomatic_content_items"];
// // // //   for (const k of keys) {
// // // //     try {
// // // //       const raw = localStorage.getItem(k);
// // // //       if (raw) {
// // // //         const arr = JSON.parse(raw);
// // // //         if (Array.isArray(arr)) return arr;
// // // //       }
// // // //     } catch {}
// // // //   }
// // // //   try {
// // // //     const raw =
// // // //       sessionStorage.getItem("open-content-item_v1") ??
// // // //       localStorage.getItem("open-content-item_v1_fallback");
// // // //     if (raw) {
// // // //       const it = JSON.parse(raw);
// // // //       if (it && typeof it === "object") return [it];
// // // //     }
// // // //   } catch {}
// // // //   return [];
// // // // }

// // // // /* ─────────────────────────────────────────────────────────────
// // // //  * Small UI helpers (premium theme with better contrast)
// // // //  * ────────────────────────────────────────────────────────────*/
// // // // function PremiumCard({ children }: { children: React.ReactNode }) {
// // // //   return (
// // // //     <div className="rounded-3xl ring-1 ring-indigo-200/50 bg-gradient-to-br from-white via-indigo-50/30 to-white shadow-xl overflow-hidden border border-indigo-100/50">
// // // //       <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
// // // //       {children}
// // // //     </div>
// // // //   );
// // // // }
// // // // function PremiumSectionTitle({
// // // //   icon,
// // // //   children,
// // // // }: {
// // // //   icon?: React.ReactNode;
// // // //   children: React.ReactNode;
// // // // }) {
// // // //   return (
// // // //     <div className="flex items-center gap-3 text-base font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
// // // //       {icon}
// // // //       {children}
// // // //     </div>
// // // //   );
// // // // }

// // // // /* Tags Input */
// // // // function TagsInput({
// // // //   value,
// // // //   onChange,
// // // //   placeholder = "Type keyword and press Enter",
// // // // }: {
// // // //   value: string[];
// // // //   onChange: (tags: string[]) => void;
// // // //   placeholder?: string;
// // // // }) {
// // // //   const [draft, setDraft] = useState("");
// // // //   function addTagFromDraft() {
// // // //     const parts = draft
// // // //       .split(/[,\n]/)
// // // //       .map((s) => s.trim())
// // // //       .filter(Boolean);
// // // //     if (parts.length) {
// // // //       const set = new Set([...value, ...parts]);
// // // //       onChange(Array.from(set));
// // // //       setDraft("");
// // // //     }
// // // //   }
// // // //   return (
// // // //     <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // // //       <div className="flex flex-wrap gap-2 mb-3">
// // // //         {value.map((t) => (
// // // //           <span
// // // //             key={t}
// // // //             className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-800 px-3 py-1.5 text-sm ring-1 ring-indigo-300/50 shadow-sm">
// // // //             <IconTags className="h-3.5 w-3.5" />
// // // //             {t}
// // // //             <button
// // // //               onClick={() => onChange(value.filter((x) => x !== t))}
// // // //               className="ml-1 hover:text-indigo-900 transition-colors"
// // // //               aria-label={`Remove ${t}`}>
// // // //               ×
// // // //             </button>
// // // //           </span>
// // // //         ))}
// // // //       </div>
// // // //       <Input
// // // //         value={draft}
// // // //         onChange={(e) => setDraft(e.target.value)}
// // // //         onKeyDown={(e) => {
// // // //           if (e.key === "Enter") {
// // // //             e.preventDefault();
// // // //             addTagFromDraft();
// // // //           }
// // // //           if (e.key === "Backspace" && !draft && value.length) {
// // // //             onChange(value.slice(0, -1));
// // // //           }
// // // //         }}
// // // //         placeholder={placeholder}
// // // //         className="bg-white border-indigo-300"
// // // //       />
// // // //       <p className="text-xs text-indigo-600 mt-2 font-medium">
// // // //         Use Enter or comma to add
// // // //       </p>
// // // //     </div>
// // // //   );
// // // // }

// // // // /* Image Picker */
// // // // function ImagePicker({
// // // //   imageUrl,
// // // //   onImageUrlChange,
// // // //   file,
// // // //   onFileChange,
// // // // }: {
// // // //   imageUrl: string;
// // // //   onImageUrlChange: (v: string) => void;
// // // //   file: File | null;
// // // //   onFileChange: (f: File | null) => void;
// // // // }) {
// // // //   const preview = React.useMemo(
// // // //     () => (file ? URL.createObjectURL(file) : imageUrl || ""),
// // // //     [file, imageUrl]
// // // //   );
// // // //   return (
// // // //     <div className="grid gap-4">
// // // //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // // //         <div>
// // // //           <Label className="text-sm font-semibold text-gray-700">
// // // //             Image URL
// // // //           </Label>
// // // //           <Input
// // // //             placeholder="https://example.com/image.jpg"
// // // //             value={imageUrl}
// // // //             onChange={(e) => onImageUrlChange(e.target.value)}
// // // //             className="bg-white border-indigo-300"
// // // //           />
// // // //         </div>
// // // //         <div>
// // // //           <Label className="text-sm font-semibold text-gray-700">
// // // //             Upload Image
// // // //           </Label>
// // // //           <div className="flex items-center gap-3">
// // // //             <Input
// // // //               type="file"
// // // //               accept="image/*"
// // // //               className="bg-white border-indigo-300"
// // // //               onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
// // // //             />
// // // //             {file && (
// // // //               <Badge
// // // //                 variant="outline"
// // // //                 className="rounded-full bg-indigo-100 border-indigo-300 text-indigo-700">
// // // //                 {file.name}
// // // //               </Badge>
// // // //             )}
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //       {preview ? (
// // // //         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // // //           <img
// // // //             src={preview}
// // // //             alt="preview"
// // // //             className="max-h-64 w-full rounded-xl object-cover shadow-md"
// // // //           />
// // // //         </div>
// // // //       ) : (
// // // //         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-100/50 p-6 text-sm text-indigo-500 flex items-center justify-center">
// // // //           No preview available
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }

// // // // /* Presets */
// // // // const PRESET_KEY = "classified_automation_preset_v2";
// // // // function savePreset(data: any) {
// // // //   localStorage.setItem(PRESET_KEY, JSON.stringify(data));
// // // // }
// // // // function loadPreset(): any | null {
// // // //   try {
// // // //     const raw = localStorage.getItem(PRESET_KEY);
// // // //     return raw ? JSON.parse(raw) : null;
// // // //   } catch {
// // // //     return null;
// // // //   }
// // // // }

// // // // /* Fake uploader (replace with real) */
// // // // async function uploadImageAndGetUrl(file: File): Promise<string> {
// // // //   return URL.createObjectURL(file);
// // // // }

// // // // /* Tiny helpers from items */
// // // // const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// // // // const getItemHtml = (it: GeneratedItem) =>
// // // //   (it.html ?? it.generatedContent ?? "").toString();
// // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // //   if (typeof it.keyword === "string")
// // // //     return it.keyword
// // // //       .split(/[,\|]/)
// // // //       .map((s) => s.trim())
// // // //       .filter(Boolean);
// // // //   return [];
// // // // }

// // // // /* ─────────────────────────────────────────────────────────────
// // // //  * MAIN
// // // //  * ────────────────────────────────────────────────────────────*/
// // // // export default function ClassifiedAutomationPage() {
// // // //   /* Load all generated items */
// // // //   const [items, setItems] = useState<GeneratedItem[]>([]);
// // // //   useEffect(() => setItems(loadGeneratedItems()), []);

// // // //   /* Hook wiring */
// // // //   const {
// // // //     search,
// // // //     setSearch,
// // // //     filteredProjects,
// // // //     expandedProjectIds,
// // // //     toggleProjectExpand,
// // // //     selectedItemIds,
// // // //     isProjectSelected,
// // // //     isItemSelected,
// // // //     setProjectChecked,
// // // //     setItemChecked,
// // // //     selectAllVisible,
// // // //     clearSelection,
// // // //     setFocusedItemId,
// // // //     focusedItem,
// // // //     selectedItems,
// // // //     start,
// // // //     isStarting,
// // // //     jobId,
// // // //     progress,
// // // //   } = useListingAutomation(items, {
// // // //     uploadImage: uploadImageAndGetUrl,
// // // //     statusPollIntervalMs: 1500,
// // // //     maxPollMinutes: 15,
// // // //     maxSelectableItems: SITES.length, // ✅ max 7 contents
// // // //     onMaxExceeded: (max) =>
// // // //       toast.error(`Max ${max} contents only (sites limit).`),
// // // //   });

// // // //   /* Defaults (apply to all selected items) */
// // // //   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
// // // //   const [category, setCategory] = useState<string>("");

// // // //   // Contact / profile
// // // //   const [phone, setPhone] = useState("");
// // // //   const [website, setWebsite] = useState("");
// // // //   const [email, setEmail] = useState("");

// // // //   // Socials
// // // //   const [facebook, setFacebook] = useState("");
// // // //   const [twitter, setTwitter] = useState("");
// // // //   const [linkedin, setLinkedin] = useState("");
// // // //   const [pinterest, setPinterest] = useState("");
// // // //   const [instagram, setInstagram] = useState("");
// // // //   const [yelp, setYelp] = useState("");
// // // //   const [gmb, setGmb] = useState("");

// // // //   // Address
// // // //   const [country, setCountry] = useState("");
// // // //   const [state, setStateVal] = useState("");
// // // //   const [city, setCity] = useState("");
// // // //   const [zip, setZip] = useState("");
// // // //   const [line1, setLine1] = useState("");

// // // //   // Default image (used if item has none)
// // // //   const [imageUrl, setImageUrl] = useState("");
// // // //   const [imageFile, setImageFile] = useState<File | null>(null);

// // // //   // Sites selection (checkbox multi-select)
// // // //   const [selectedSiteValues, setSelectedSiteValues] = useState<Set<string>>(
// // // //     new Set()
// // // //   );

// // // //   const selectedCount = selectedItems.length;

// // // //   const selectedSites = useMemo(
// // // //     () => ALL_SITES.filter((s) => selectedSiteValues.has(s.value)),
// // // //     [selectedSiteValues]
// // // //   );

// // // //   const selectedSitesCount = selectedSites.length;

// // // //   // Auto-trim sites if items decrease
// // // //   useEffect(() => {
// // // //     if (selectedCount === 0) {
// // // //       setSelectedSiteValues(new Set());
// // // //       return;
// // // //     }
// // // //     if (selectedSiteValues.size <= selectedCount) return;

// // // //     setSelectedSiteValues((prev) => {
// // // //       const arr = Array.from(prev).slice(0, selectedCount);
// // // //       return new Set(arr);
// // // //     });
// // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, [selectedCount]);

// // // //   function toggleSite(siteValue: string, checked: boolean) {
// // // //     setSelectedSiteValues((prev) => {
// // // //       const n = new Set(prev);
// // // //       if (checked) {
// // // //         if (selectedCount === 0) {
// // // //           toast.error("Select content first.");
// // // //           return prev;
// // // //         }
// // // //         if (n.size >= selectedCount) {
// // // //           toast.error(`You can select only ${selectedCount} site(s).`);
// // // //           return prev;
// // // //         }
// // // //         n.add(siteValue);
// // // //       } else {
// // // //         n.delete(siteValue);
// // // //       }
// // // //       return n;
// // // //     });
// // // //   }

// // // //   const readyToStart =
// // // //     selectedCount > 0 && selectedSitesCount === selectedCount;

// // // //   // Preset load
// // // //   useEffect(() => {
// // // //     const p = loadPreset();
// // // //     if (p) {
// // // //       setPhone(p.phone ?? "");
// // // //       setWebsite(p.website ?? "");
// // // //       setEmail(p.email ?? "");
// // // //       setCountry(p.address?.country ?? "");
// // // //       setStateVal(p.address?.state ?? "");
// // // //       setCity(p.address?.city ?? "");
// // // //       setZip(p.address?.zip ?? "");
// // // //       setLine1(p.address?.line1 ?? "");
// // // //       setFacebook(p.socials?.facebook ?? "");
// // // //       setTwitter(p.socials?.twitter ?? "");
// // // //       setLinkedin(p.socials?.linkedin ?? "");
// // // //       setPinterest(p.socials?.pinterest ?? "");
// // // //       setInstagram(p.socials?.instagram ?? "");
// // // //       setYelp(p.socials?.yelp ?? "");
// // // //       setGmb(p.socials?.gmb ?? "");

// // // //       // load selected sites
// // // //       if (Array.isArray(p.sites)) {
// // // //         setSelectedSiteValues(new Set(p.sites));
// // // //       }
// // // //     }
// // // //   }, []);

// // // //   function handleSavePreset() {
// // // //     const socials: Socials = {
// // // //       facebook,
// // // //       twitter,
// // // //       linkedin,
// // // //       pinterest,
// // // //       instagram,
// // // //       yelp,
// // // //       gmb,
// // // //     };
// // // //     savePreset({
// // // //       phone,
// // // //       website,
// // // //       email,
// // // //       address: { country, state, city, zip, line1 },
// // // //       socials,
// // // //       sites: Array.from(selectedSiteValues),
// // // //     });
// // // //     toast.success("Preset saved");
// // // //   }

// // // //   async function handleStart() {
// // // //     if (!readyToStart) {
// // // //       toast.error("Select content first, then same number of sites.");
// // // //       return;
// // // //     }
// // // //     try {
// // // //       const { listings } = await start({
// // // //         sites: selectedSites.map((s: any) => ({
// // // //           site: s.value,
// // // //           username: s.username,
// // // //           password: s.password,
// // // //           type: s.type ?? "classified",
// // // //         })),

// // // //         defaults: {
// // // //           category,
// // // //           keywordsDefaults,
// // // //           imageUrl,
// // // //           imageFile,
// // // //           profile: {
// // // //             phone,
// // // //             website,
// // // //             email,
// // // //             socials: {
// // // //               facebook,
// // // //               twitter,
// // // //               linkedin,
// // // //               pinterest,
// // // //               instagram,
// // // //               yelp,
// // // //               gmb,
// // // //             },
// // // //             address: { country, state, city, zip, line1 },
// // // //           },
// // // //         },
// // // //       });
// // // //       toast.success(`Automation started for ${listings} item(s)`);
// // // //     } catch (err: any) {
// // // //       toast.error(err?.message ?? "Failed to start");
// // // //     }
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
// // // //       <div className="mx-auto max-w-screen-2xl px-6 py-10">
// // // //         {/* Top Header */}
// // // //         <PremiumCard>
// // // //           <Card className="border-0 shadow-none bg-transparent">
// // // //             <CardHeader className="pb-6">
// // // //               <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
// // // //                 <div className="flex-1">
// // // //                   <CardTitle className="flex items-center gap-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
// // // //                     <IconListDetails className="h-8 w-8" />
// // // //                     Classified Listing Automation
// // // //                   </CardTitle>
// // // //                   <CardDescription className="text-indigo-600 mt-1 font-medium">
// // // //                     Select content → Pick matching sites → Launch Automation
// // // //                   </CardDescription>
// // // //                 </div>
// // // //                 <div className="flex items-center gap-3 w-full lg:w-auto">
// // // //                   <div className="relative flex-1 lg:w-[350px]">
// // // //                     <IconSearch className="h-5 w-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
// // // //                     <Input
// // // //                       value={search}
// // // //                       onChange={(e) => setSearch(e.target.value)}
// // // //                       placeholder="Search by title or keywords…"
// // // //                       className="pl-12 bg-white border-indigo-300 rounded-2xl shadow-sm"
// // // //                     />
// // // //                   </div>
// // // //                   <Badge className="rounded-full bg-indigo-100 text-indigo-800 border-indigo-300 px-4 py-2 font-semibold">
// // // //                     Selected: {selectedCount}/{SITES.length}
// // // //                   </Badge>
// // // //                 </div>
// // // //               </div>
// // // //             </CardHeader>
// // // //           </Card>
// // // //         </PremiumCard>

// // // //         {/* 3-column premium layout with enhanced spacing */}
// // // //         <div className="mt-10 grid gap-10 xl:grid-cols-12">
// // // //           {/* LEFT (xl: 4) — Projects Panel */}
// // // //           <div className="xl:col-span-4">
// // // //             <div className="sticky top-8 space-y-6">
// // // //               <PremiumCard>
// // // //                 <Card className="border-0 shadow-none bg-transparent">
// // // //                   <CardHeader className="pb-4">
// // // //                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
// // // //                       <IconFolder className="h-6 w-6 text-indigo-600" />
// // // //                       Content Projects
// // // //                     </CardTitle>
// // // //                     <CardDescription className="text-indigo-600">
// // // //                       Choose projects or specific items for posting.
// // // //                     </CardDescription>
// // // //                   </CardHeader>
// // // //                   <CardContent className="space-y-4">
// // // //                     <div className="md:hidden mb-3">
// // // //                       <div className="relative">
// // // //                         <IconSearch className="h-4 w-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // //                         <Input
// // // //                           value={search}
// // // //                           onChange={(e) => setSearch(e.target.value)}
// // // //                           placeholder="Search title / keywords…"
// // // //                           className="pl-9 bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                     </div>

// // // //                     <div className="flex items-center justify-between text-sm text-indigo-600">
// // // //                       <div className="flex items-center gap-2">
// // // //                         <Button
// // // //                           variant="outline"
// // // //                           size="sm"
// // // //                           onClick={selectAllVisible}
// // // //                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
// // // //                           <IconCircleCheck className="h-4 w-4 mr-2" /> Select
// // // //                           All Visible
// // // //                         </Button>
// // // //                         <Button
// // // //                           variant="outline"
// // // //                           size="sm"
// // // //                           onClick={clearSelection}
// // // //                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
// // // //                           <IconCircleX className="h-4 w-4 mr-2" /> Clear All
// // // //                         </Button>
// // // //                       </div>
// // // //                       <span className="font-semibold">
// // // //                         {filteredProjects.length} Projects
// // // //                       </span>
// // // //                     </div>

// // // //                     <div className="max-h-[650px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300">
// // // //                       {filteredProjects.length === 0 && (
// // // //                         <div className="text-sm text-indigo-500 py-8 text-center">
// // // //                           No content found. Start generating!
// // // //                         </div>
// // // //                       )}

// // // //                       {filteredProjects.map((p, idx) => {
// // // //                         const expanded = expandedProjectIds.has(p.id);
// // // //                         const projectSelected = isProjectSelected(p.id);
// // // //                         const selectedCountInProject = p.items.filter((it) =>
// // // //                           selectedItemIds.has(it.id)
// // // //                         ).length;
// // // //                         const total = p.items.length;

// // // //                         return (
// // // //                           <div
// // // //                             key={p.id}
// // // //                             className="rounded-2xl ring-1 ring-indigo-200/50 bg-white/80 mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
// // // //                             {/* Project row */}
// // // //                             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
// // // //                               <div className="flex items-center gap-4">
// // // //                                 <Button
// // // //                                   variant="ghost"
// // // //                                   size="icon"
// // // //                                   onClick={() => toggleProjectExpand(p.id)}
// // // //                                   className="h-8 w-8 rounded-full hover:bg-indigo-100"
// // // //                                   aria-label={expanded ? "Collapse" : "Expand"}>
// // // //                                   {expanded ? (
// // // //                                     <IconChevronDown className="h-5 w-5 text-indigo-600" />
// // // //                                   ) : (
// // // //                                     <IconChevronRight className="h-5 w-5 text-indigo-600" />
// // // //                                   )}
// // // //                                 </Button>

// // // //                                 <Checkbox
// // // //                                   checked={projectSelected}
// // // //                                   onCheckedChange={(v) =>
// // // //                                     setProjectChecked(p.id, !!v)
// // // //                                   }
// // // //                                   className={cn(
// // // //                                     "mr-2 h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // // //                                   )}
// // // //                                   aria-label="Select project"
// // // //                                 />
// // // //                                 <span className="text-sm font-bold text-gray-800 tabular-nums">
// // // //                                   {String(idx + 1).padStart(2, "0")}.
// // // //                                 </span>
// // // //                                 <span className="text-sm font-bold text-gray-900">
// // // //                                   {p.name}
// // // //                                 </span>
// // // //                               </div>

// // // //                               <Badge
// // // //                                 variant="outline"
// // // //                                 className={cn(
// // // //                                   "rounded-full text-sm px-3 py-1",
// // // //                                   selectedCountInProject
// // // //                                     ? "border-indigo-600 text-indigo-700 bg-indigo-100"
// // // //                                     : "border-indigo-300 text-indigo-500"
// // // //                                 )}>
// // // //                                 {selectedCountInProject}/{total}
// // // //                               </Badge>
// // // //                             </div>

// // // //                             {/* Items list */}
// // // //                             {expanded && (
// // // //                               <div className="border-t border-indigo-100 divide-y divide-indigo-50">
// // // //                                 {p.items.map((it, iidx) => {
// // // //                                   const checked = isItemSelected(it.id);
// // // //                                   return (
// // // //                                     <div
// // // //                                       key={it.id}
// // // //                                       className={cn(
// // // //                                         "flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 transition-colors",
// // // //                                         checked &&
// // // //                                           "bg-indigo-50 ring-1 ring-indigo-200/50"
// // // //                                       )}>
// // // //                                       <div className="flex items-center gap-4 min-w-0">
// // // //                                         <span className="text-xs text-indigo-500 font-semibold w-6 text-right tabular-nums">
// // // //                                           {iidx + 1}
// // // //                                         </span>
// // // //                                         <Checkbox
// // // //                                           checked={checked}
// // // //                                           onCheckedChange={(v) =>
// // // //                                             setItemChecked(p.id, it.id, !!v)
// // // //                                           }
// // // //                                           className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // // //                                           aria-label="Select item"
// // // //                                         />
// // // //                                         <button
// // // //                                           className="text-left min-w-0 flex-1"
// // // //                                           onClick={() =>
// // // //                                             setFocusedItemId(it.id)
// // // //                                           }>
// // // //                                           <div className="text-base font-semibold text-gray-900 truncate">
// // // //                                             {(getItemTitle(it) ||
// // // //                                               getItemKeywords(it)[0]) ??
// // // //                                               "Untitled"}
// // // //                                           </div>
// // // //                                           <div className="text-sm text-indigo-600 truncate mt-1">
// // // //                                             {getItemKeywords(it).join(", ")}
// // // //                                           </div>
// // // //                                         </button>
// // // //                                       </div>
// // // //                                       {checked && (
// // // //                                         <IconCheck className="h-5 w-5 text-indigo-600 flex-shrink-0" />
// // // //                                       )}
// // // //                                     </div>
// // // //                                   );
// // // //                                 })}
// // // //                               </div>
// // // //                             )}
// // // //                           </div>
// // // //                         );
// // // //                       })}
// // // //                     </div>
// // // //                   </CardContent>
// // // //                 </Card>
// // // //               </PremiumCard>
// // // //             </div>
// // // //           </div>

// // // //           {/* CENTER (xl: 5) — Defaults + Preview */}
// // // //           <div className="xl:col-span-5 space-y-6">
// // // //             <PremiumCard>
// // // //               <Card className="border-0 shadow-none bg-transparent">
// // // //                 <CardHeader className="pb-5">
// // // //                   <CardTitle className="text-xl font-bold text-gray-900">
// // // //                     Global Listing Settings
// // // //                   </CardTitle>
// // // //                   <CardDescription className="text-indigo-600">
// // // //                     These defaults will apply across all selected contents.
// // // //                   </CardDescription>
// // // //                 </CardHeader>
// // // //                 <CardContent className="space-y-6">
// // // //                   <section className="space-y-3">
// // // //                     <PremiumSectionTitle
// // // //                       icon={<IconTags className="h-5 w-5" />}>
// // // //                       Keyword Enhancements
// // // //                     </PremiumSectionTitle>
// // // //                     <TagsInput
// // // //                       value={keywordsDefaults}
// // // //                       onChange={setKeywordsDefaults}
// // // //                     />
// // // //                   </section>

// // // //                   <section className="space-y-3">
// // // //                     <PremiumSectionTitle>Primary Category</PremiumSectionTitle>
// // // //                     <Select value={category} onValueChange={setCategory}>
// // // //                       <SelectTrigger className="bg-white border-indigo-300 rounded-2xl">
// // // //                         <SelectValue placeholder="Select a category" />
// // // //                       </SelectTrigger>
// // // //                       <SelectContent className="rounded-2xl">
// // // //                         {CATEGORIES.map((c) => (
// // // //                           <SelectItem key={c} value={c} className="rounded-xl">
// // // //                             {c}
// // // //                           </SelectItem>
// // // //                         ))}
// // // //                       </SelectContent>
// // // //                     </Select>
// // // //                   </section>

// // // //                   <section className="space-y-3">
// // // //                     <PremiumSectionTitle
// // // //                       icon={<IconPhoto className="h-5 w-5" />}>
// // // //                       Fallback Image
// // // //                     </PremiumSectionTitle>
// // // //                     <ImagePicker
// // // //                       imageUrl={imageUrl}
// // // //                       onImageUrlChange={setImageUrl}
// // // //                       file={imageFile}
// // // //                       onFileChange={setImageFile}
// // // //                     />
// // // //                     <p className="text-xs text-indigo-600 font-medium">
// // // //                       Applies only to items without their own image.
// // // //                     </p>
// // // //                   </section>

// // // //                   <section className="space-y-4">
// // // //                     <PremiumSectionTitle
// // // //                       icon={<IconMap2 className="h-5 w-5" />}>
// // // //                       Location Details
// // // //                     </PremiumSectionTitle>
// // // //                     <div className="grid gap-4 md:grid-cols-2">
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           Country
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={country}
// // // //                           onChange={(e) => setCountry(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           State/Province
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={state}
// // // //                           onChange={(e) => setStateVal(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           City
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={city}
// // // //                           onChange={(e) => setCity(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           ZIP/Postal Code
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={zip}
// // // //                           onChange={(e) => setZip(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                     </div>
// // // //                     <div>
// // // //                       <Label className="text-sm font-semibold text-gray-700">
// // // //                         Street Address
// // // //                       </Label>
// // // //                       <Input
// // // //                         value={line1}
// // // //                         onChange={(e) => setLine1(e.target.value)}
// // // //                         className="bg-white border-indigo-300 rounded-xl"
// // // //                       />
// // // //                     </div>
// // // //                   </section>

// // // //                   <section className="space-y-4">
// // // //                     <PremiumSectionTitle
// // // //                       icon={<IconAddressBook className="h-5 w-5" />}>
// // // //                       Contact Information
// // // //                     </PremiumSectionTitle>
// // // //                     <div className="grid gap-4 md:grid-cols-3">
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           Phone
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={phone}
// // // //                           onChange={(e) => setPhone(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           Website
// // // //                         </Label>
// // // //                         <div className="flex items-center">
// // // //                           <IconWorldWww className="h-5 w-5 mr-3 text-indigo-500" />
// // // //                           <Input
// // // //                             value={website}
// // // //                             onChange={(e) => setWebsite(e.target.value)}
// // // //                             className="bg-white border-indigo-300 rounded-xl flex-1"
// // // //                           />
// // // //                         </div>
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           Email
// // // //                         </Label>
// // // //                         <div className="flex items-center">
// // // //                           <IconAt className="h-5 w-5 mr-3 text-indigo-500" />
// // // //                           <Input
// // // //                             value={email}
// // // //                             onChange={(e) => setEmail(e.target.value)}
// // // //                             className="bg-white border-indigo-300 rounded-xl flex-1"
// // // //                           />
// // // //                         </div>
// // // //                       </div>
// // // //                     </div>
// // // //                   </section>

// // // //                   <section className="space-y-4">
// // // //                     <PremiumSectionTitle
// // // //                       icon={<IconWorld className="h-5 w-5" />}>
// // // //                       Social Connections
// // // //                     </PremiumSectionTitle>
// // // //                     <div className="grid gap-4 md:grid-cols-2">
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandFacebook className="h-4 w-4 text-blue-600" />{" "}
// // // //                           Facebook
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={facebook}
// // // //                           onChange={(e) => setFacebook(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandTwitter className="h-4 w-4 text-blue-400" />{" "}
// // // //                           Twitter / X
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={twitter}
// // // //                           onChange={(e) => setTwitter(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandLinkedin className="h-4 w-4 text-blue-700" />{" "}
// // // //                           LinkedIn
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={linkedin}
// // // //                           onChange={(e) => setLinkedin(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandPinterest className="h-4 w-4 text-red-500" />{" "}
// // // //                           Pinterest
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={pinterest}
// // // //                           onChange={(e) => setPinterest(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandInstagram className="h-4 w-4 text-pink-500" />{" "}
// // // //                           Instagram
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={instagram}
// // // //                           onChange={(e) => setInstagram(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandCpp className="h-4 w-4 text-yellow-600" />{" "}
// // // //                           Yelp
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={yelp}
// // // //                           onChange={(e) => setYelp(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div className="md:col-span-2">
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandGoogle className="h-4 w-4 text-red-500" />{" "}
// // // //                           Google Business
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={gmb}
// // // //                           onChange={(e) => setGmb(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                     </div>
// // // //                   </section>
// // // //                 </CardContent>
// // // //               </Card>
// // // //             </PremiumCard>

// // // //             <PremiumCard>
// // // //               <Card className="border-0 shadow-none bg-transparent">
// // // //                 <CardHeader className="pb-4">
// // // //                   <CardTitle className="text-xl font-bold text-gray-900">
// // // //                     Live Preview
// // // //                   </CardTitle>
// // // //                   <CardDescription className="text-indigo-600">
// // // //                     Select an item from the left to see a real-time preview
// // // //                     here.
// // // //                   </CardDescription>
// // // //                 </CardHeader>
// // // //                 <CardContent className="space-y-5">
// // // //                   <div>
// // // //                     <Label className="text-sm font-semibold text-gray-700">
// // // //                       Listing Title
// // // //                     </Label>
// // // //                     <Input
// // // //                       value={focusedItem ? getItemTitle(focusedItem) : ""}
// // // //                       readOnly
// // // //                       placeholder="Click an item to preview its title"
// // // //                       className="bg-indigo-50/50 border-indigo-300 rounded-xl mt-1 font-semibold"
// // // //                     />
// // // //                   </div>
// // // //                   <div>
// // // //                     <Label className="text-sm font-semibold text-gray-700">
// // // //                       Description Content
// // // //                     </Label>
// // // //                     <Textarea
// // // //                       value={focusedItem ? getItemHtml(focusedItem) : ""}
// // // //                       readOnly
// // // //                       placeholder="Click an item to preview its full content"
// // // //                       className="min-h-[200px] bg-indigo-50/50 border-indigo-300 rounded-xl mt-1"
// // // //                     />
// // // //                   </div>
// // // //                 </CardContent>
// // // //               </Card>
// // // //             </PremiumCard>
// // // //           </div>

// // // //           {/* RIGHT (xl: 3) — Automation Controls */}
// // // //           <div className="xl:col-span-3">
// // // //             <div className="sticky top-8 space-y-6">
// // // //               <PremiumCard>
// // // //                 <Card className="border-0 shadow-none bg-transparent">
// // // //                   <CardHeader className="pb-5">
// // // //                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
// // // //                       <IconSparkles className="h-6 w-6 text-purple-600" />
// // // //                       Automation Launch
// // // //                     </CardTitle>
// // // //                     <CardDescription className="text-indigo-600">
// // // //                       Match content count with site selections for seamless
// // // //                       posting.
// // // //                     </CardDescription>
// // // //                   </CardHeader>

// // // //                   <CardContent className="space-y-6">
// // // //                     {/* SITES CHECKBOX LIST */}
// // // //                     <section className="space-y-3">
// // // //                       <Label className="text-sm font-bold flex items-center gap-3 text-gray-900">
// // // //                         <IconGlobe className="h-5 w-5 text-indigo-600" />
// // // //                         Target Sites ({selectedSitesCount}/{selectedCount || 0})
// // // //                       </Label>

// // // //                       {selectedCount === 0 && (
// // // //                         <div className="text-sm text-indigo-500">
// // // //                           Begin by selecting content on the left.
// // // //                         </div>
// // // //                       )}

// // // //                       <div className="rounded-2xl ring-1 ring-indigo-200 bg-white/80 divide-y divide-indigo-50 shadow-sm overflow-hidden">
// // // //                         {ALL_SITES.map((s) => {
// // // //                           const isChecked = selectedSiteValues.has(s.value);
// // // //                           const disableNew =
// // // //                             !isChecked &&
// // // //                             (selectedSitesCount >= selectedCount ||
// // // //                               selectedCount === 0);

// // // //                           return (
// // // //                             <label
// // // //                               key={s.value}
// // // //                               className={cn(
// // // //                                 "flex items-center justify-between gap-4 px-4 py-3 cursor-pointer transition-all hover:bg-indigo-50/50",
// // // //                                 isChecked &&
// // // //                                   "bg-indigo-50/80 ring-1 ring-indigo-200/50",
// // // //                                 disableNew && "opacity-70 cursor-not-allowed"
// // // //                               )}>
// // // //                               <div className="flex items-center gap-3 min-w-0">
// // // //                                 <Checkbox
// // // //                                   checked={isChecked}
// // // //                                   disabled={disableNew}
// // // //                                   onCheckedChange={(v) =>
// // // //                                     toggleSite(s.value, !!v)
// // // //                                   }
// // // //                                   className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // // //                                 />
// // // //                                 <span className="text-base font-semibold text-gray-900 truncate">
// // // //                                   {s.label}
// // // //                                 </span>
// // // //                               </div>

// // // //                               <Badge
// // // //                                 variant="outline"
// // // //                                 className="rounded-full text-xs px-3 py-1 bg-indigo-100 border-indigo-300 text-indigo-700">
// // // //                                 1 Slot
// // // //                               </Badge>
// // // //                             </label>
// // // //                           );
// // // //                         })}
// // // //                       </div>

// // // //                       <p className="text-xs text-indigo-600 font-medium">
// // // //                         Pro Tip: {selectedCount} contents require exactly{" "}
// // // //                         {selectedCount} sites.
// // // //                       </p>
// // // //                     </section>

// // // //                     <Separator className="border-indigo-200" />

// // // //                     <div className="grid gap-4">
// // // //                       <Button
// // // //                         onClick={handleStart}
// // // //                         disabled={!readyToStart || isStarting}
// // // //                         className={cn(
// // // //                           "rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 h-12 font-bold text-lg",
// // // //                           !readyToStart && "opacity-70 cursor-not-allowed"
// // // //                         )}>
// // // //                         <IconPlayerPlay className="h-5 w-5 mr-3" />
// // // //                         {isStarting
// // // //                           ? "Launching…"
// // // //                           : `Launch Now (${selectedCount})`}
// // // //                       </Button>

// // // //                       <div className="flex items-center justify-between text-sm text-indigo-600">
// // // //                         <span className="flex items-center gap-2 font-medium">
// // // //                           <IconCheck className="h-4 w-4" />
// // // //                           {selectedCount} Contents Ready
// // // //                         </span>
// // // //                         <span className="flex items-center gap-2 font-medium">
// // // //                           <IconGlobe className="h-4 w-4" />
// // // //                           {selectedSitesCount} Sites Locked
// // // //                         </span>
// // // //                       </div>

// // // //                       {jobId && (
// // // //                         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // // //                           <div className="flex items-center justify-between text-sm text-indigo-600 mb-3 font-medium">
// // // //                             <span>Job ID: {jobId}</span>
// // // //                             <span>{progress}% Complete</span>
// // // //                           </div>
// // // //                           <Progress
// // // //                             value={progress}
// // // //                             className="h-3 bg-indigo-200 rounded-full"
// // // //                           />
// // // //                         </div>
// // // //                       )}
// // // //                     </div>
// // // //                   </CardContent>
// // // //                 </Card>
// // // //               </PremiumCard>

// // // //               <div className="rounded-2xl ring-1 ring-indigo-200 bg-white shadow-lg p-5 text-sm text-gray-800 border border-indigo-100/50">
// // // //                 <p className="mb-2 flex items-center gap-2">
// // // //                   ✅ <b>Workflow:</b> Contents → Sites → Launch
// // // //                 </p>
// // // //                 <p className="mb-4">
// // // //                   🚀 <b>API Target:</b>{" "}
// // // //                   <code className="bg-indigo-100 px-2 py-1 rounded text-indigo-800 font-mono">
// // // //                     /api/automation/start
// // // //                   </code>{" "}
// // // //                   (1 per site)
// // // //                 </p>
// // // //                 <div className="flex items-center gap-3">
// // // //                   <Button
// // // //                     variant="outline"
// // // //                     onClick={handleSavePreset}
// // // //                     className="rounded-full border-indigo-300 hover:bg-indigo-50">
// // // //                     💾 Save Config
// // // //                   </Button>
// // // //                   <Badge className="rounded-full bg-purple-100 text-purple-800 border-purple-300">
// // // //                     Premium: 7 Sites Max
// // // //                   </Badge>
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //         {/* /grid */}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // // /pages/classified-automation/index.tsx
// // // // import React, { useEffect, useMemo, useState } from "react";
// // // // import {
// // // //   Card,
// // // //   CardContent,
// // // //   CardDescription,
// // // //   CardHeader,
// // // //   CardTitle,
// // // // } from "@/components/ui/card";
// // // // import { Button } from "@/components/ui/button";
// // // // import { Badge } from "@/components/ui/badge";
// // // // import { Input } from "@/components/ui/input";
// // // // import { Label } from "@/components/ui/label";
// // // // import { Textarea } from "@/components/ui/textarea";
// // // // import { Separator } from "@/components/ui/separator";
// // // // import { Progress } from "@/components/ui/progress";
// // // // import { Checkbox } from "@/components/ui/checkbox";
// // // // import { toast } from "sonner";
// // // // import { cn } from "@/lib/utils";
// // // // import {
// // // //   Select,
// // // //   SelectContent,
// // // //   SelectItem,
// // // //   SelectTrigger,
// // // //   SelectValue,
// // // // } from "@/components/ui/select";

// // // // import {
// // // //   IconWorld,
// // // //   IconListDetails,
// // // //   IconPlayerPlay,
// // // //   IconSparkles,
// // // //   IconAddressBook,
// // // //   IconTags,
// // // //   IconMap2,
// // // //   IconPhoto,
// // // //   IconWorldWww,
// // // //   IconAt,
// // // //   IconBrandFacebook,
// // // //   IconBrandTwitter,
// // // //   IconBrandLinkedin,
// // // //   IconBrandPinterest,
// // // //   IconBrandInstagram,
// // // //   IconBrandCpp, // Yelp placeholder
// // // //   IconBrandGoogle,
// // // //   IconChevronDown,
// // // //   IconChevronRight,
// // // //   IconSearch,
// // // //   IconFolder,
// // // //   IconCheck,
// // // //   IconCircleCheck,
// // // //   IconCircleX,
// // // //   IconGlobe,
// // // // } from "@tabler/icons-react";

// // // // import {
// // // //   useListingAutomation,
// // // //   type GeneratedItem,
// // // //   type Socials,
// // // // } from "./hooks/useListingAutomation";

// // // // /* ─────────────────────────────────────────────────────────────
// // // //  * Constants
// // // //  * ────────────────────────────────────────────────────────────*/
// // // // const CATEGORIES = [
// // // //   "Electronics",
// // // //   "Home & Garden",
// // // //   "Vehicles",
// // // //   "Jobs",
// // // //   "Services",
// // // //   "Real Estate",
// // // //   "Pets",
// // // //   "Books",
// // // //   "Fashion",
// // // //   "Sports",
// // // // ];

// // // // const WORDPRESS_SITES = [
// // // //   {
// // // //     value: "linuxpatent.com",
// // // //     label: "linuxpatent.com (WordPress)",
// // // //     username: "linuxpatent.com",
// // // //     password: "linuxpatent.com",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "rayseries.com",
// // // //     label: "rayseries.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "8@O!jIiuQ*NIFV3WdaBa9dsE",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "pasfait.com",
// // // //     label: "pasfait.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "yCCH0nF$Tyo71grRnHFJ$zyt",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "scotchsavvy.com",
// // // //     label: "scotchsavvy.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "!l!sGeKwA9^y!7UgvhV1RNnf",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "extremesportsgoons.info",
// // // //     label: "extremesportsgoons.info (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "Vu9fe!7fmOKL#f#Xd1KjrtO8",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "creeksidereflections.com",
// // // //     label: "creeksidereflections.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "Tj!riY$sK!IcjoxgIMk&aBGC",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "PiratesGab.com",
// // // //     label: "PiratesGab.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "ADzQ)e32l^yVG*!7w!Sv1)r7",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "theSportchampion.com",
// // // //     label: "theSportchampion.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "(bH31Z6BX5Z%b$7$ZGI%@V*1",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "DataDrillAmerAsia.com",
// // // //     label: "DataDrillAmerAsia.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "A20XfpFnPjTON!(N0FpUceT&",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "htpsouthdowns.com",
// // // //     label: "htpsouthdowns.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "IhRiyAN$1dpGJPmc#rdke%Ca",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "UsJobSandGigs.com",
// // // //     label: "UsJobSandGigs.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "S&N8z8l31oB5z)i9l!8hJ^IE",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "VictoriesSport.com",
// // // //     label: "VictoriesSport.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "vm9)i$yQ*0&LY@TwSrP7UbD$",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "veroniquelacoste.com",
// // // //     label: "veroniquelacoste.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "@C@EJNa9Q!45Kr2ui8Rcf&Zz",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "missonthemove.com",
// // // //     label: "missonthemove.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "14Iw2h*uBAXDCGvXnKfiRKaW",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "pcnfa.com",
// // // //     label: "pcnfa.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "e4uBbiwr848sODXu7ol4H)J9",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "theangelfilm.com",
// // // //     label: "theangelfilm.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "uqOmUOe4zsnVSqhoNlFmuSh0",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "soerq.com",
// // // //     label: "soerq.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "S!8zG&whLv4RKFI!PmkkYUBD",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "paydayard.com",
// // // //     label: "paydayard.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "Or0LiS$9yfpqNToahE6N(WdO",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "trekbadlands.com",
// // // //     label: "trekbadlands.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "^z@3JoOl^5QZB)BMha%(@*g7",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "pawmeism.com",
// // // //     label: "pawmeism.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "npNMn5(Dt33JTD2h)WA%Ib@m",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "demokore.com",
// // // //     label: "demokore.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "EuJDo%8Mv1Oq)mFnhqItAVLN",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "moviemotives.com",
// // // //     label: "moviemotives.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "@(@mVM5pq&v0CGsvkpd5dUc6",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "apktowns.com",
// // // //     label: "apktowns.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "oCMtxX%rq$eWkltsntabddZ5",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "mallorcasupport.com",
// // // //     label: "mallorcasupport.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "z*A@N$8pGPhsmuF%YbQxz27y",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "manageprinters.com",
// // // //     label: "manageprinters.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "9waZ0Fig2&X!BaqO5LTBLAhN",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "mitchellstover.com",
// // // //     label: "mitchellstover.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "s&j3d9mUx!G51S5#*gr^a3bO",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "fametize.com",
// // // //     label: "fametize.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "nc)ijExdWpHRjJk^mTWolzTt",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "luocsu.com",
// // // //     label: "luocsu.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "Vjy2fiQ@yqJmmUSenskKC#uq",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "inststagram.com",
// // // //     label: "inststagram.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "m$w8Wq9ustuOEo#!JLUAJLeY",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "ashopear.com",
// // // //     label: "ashopear.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "01JaDjdjieP9Qbw$DbrI%q)S",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "charles6767.com",
// // // //     label: "charles6767.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "En4)HXb0cxTRvq%qp$PIlz*e",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "berlintype.com",
// // // //     label: "berlintype.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "Jf2s)O0q!ig%WK(uLm)BTQDZ",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "sprintcybermonday.com",
// // // //     label: "sprintcybermonday.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "*^dYF6Eb*bK$bBXWtR88zMA#",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "jamesvirtudazo.com",
// // // //     label: "jamesvirtudazo.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "IUqYJiibfLJ^sQ@1j7oj*3r2",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "partyprivee.com",
// // // //     label: "partyprivee.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "OfwUX(s%WEai&s9WPMZ!jWYj",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "launcheell.com",
// // // //     label: "launcheell.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "nC^suIxOZ4sYPi395&$a5Nhx",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "bridge-busan.com",
// // // //     label: "bridge-busan.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "7l%P#(NIacu&k04hPL7a9O&U",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "cruitholidayhome.com",
// // // //     label: "cruitholidayhome.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "2p&iJ%@1A4T*J*yU5p%%TVJX",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "yhbdvideo.com",
// // // //     label: "yhbdvideo.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "OAObx7y@dpK(2p@47iym4lhb",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "hmboot.com",
// // // //     label: "hmboot.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "5gn%2EcPEq8Tgud9Jf*P9Dn6",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "allaboutlaptop.com",
// // // //     label: "allaboutlaptop.com (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: ")Os91UzZlfYiFt)*ViZS7JS*",
// // // //     type: "wordpress",
// // // //   },
// // // //   {
// // // //     value: "photosdp.net",
// // // //     label: "photosdp.net (WordPress)",
// // // //     username: "FlowTrack",
// // // //     password: "G7$E8mc2&Cws4opuF9ECRRIn",
// // // //     type: "wordpress",
// // // //   },
// // // // ];

// // // // /** FIXED 7 SITES (1 site = 1 content) */
// // // // const SITES = [
// // // //   {
// // // //     value: "proclassifiedads.com",
// // // //     label: "proclassifiedads.com",
// // // //     username: "Zoran",
// // // //     password: "XsujZnakXKuqZ@&e(o3qSr@!",
// // // //   },
// // // //   {
// // // //     value: "classifiedsposts.com",
// // // //     label: "classifiedsposts.com",
// // // //     username: "Fyren",
// // // //     password: "AEsB%COsrw#!NHp@IaDSpFXs",
// // // //   },
// // // //   {
// // // //     value: "globaladsclassifieds.com",
// // // //     label: "globaladsclassifieds.com",
// // // //     username: "FlowTrack",
// // // //     password: "ZAe!M8TbBt$8T(xYTaL%n1yd",
// // // //   },
// // // //   {
// // // //     value: "onlineclassifiedsads.com",
// // // //     label: "onlineclassifiedsads.com",
// // // //     username: "Velyn",
// // // //     password: "oWujA^FC88qcteDObVP8h4FD",
// // // //   },
// // // //   {
// // // //     value: "thelocanto.com",
// // // //     label: "thelocanto.com",
// // // //     username: "Tarka",
// // // //     password: "08uNArlcpnHiihxRz)ubwivK",
// // // //   },
// // // //   {
// // // //     value: "true-finders.com",
// // // //     label: "true-finders.com",
// // // //     username: "FlowTrack",
// // // //     password: "Zl^lEUbc(&)(GbcY^Nkxp@Gt",
// // // //   },
// // // //   {
// // // //     value: "proadvertiser.org",
// // // //     label: "proadvertiser.org",
// // // //     username: "FlowTrack",
// // // //     password: "x&w^XfmST*xino6U&FD1$fp5",
// // // //   },
// // // // ];

// // // // const ALL_SITES = [...SITES, ...WORDPRESS_SITES];

// // // // /* ─────────────────────────────────────────────────────────────
// // // //  * Local-storage loader (from your content app)
// // // //  * ────────────────────────────────────────────────────────────*/
// // // // function loadGeneratedItems(): GeneratedItem[] {
// // // //   const keys = ["content_items_v1", "content-items", "seomatic_content_items"];
// // // //   for (const k of keys) {
// // // //     try {
// // // //       const raw = localStorage.getItem(k);
// // // //       if (raw) {
// // // //         const arr = JSON.parse(raw);
// // // //         if (Array.isArray(arr)) return arr;
// // // //       }
// // // //     } catch {}
// // // //   }
// // // //   try {
// // // //     const raw =
// // // //       sessionStorage.getItem("open-content-item_v1") ??
// // // //       localStorage.getItem("open-content-item_v1_fallback");
// // // //     if (raw) {
// // // //       const it = JSON.parse(raw);
// // // //       if (it && typeof it === "object") return [it];
// // // //     }
// // // //   } catch {}
// // // //   return [];
// // // // }

// // // // /* ─────────────────────────────────────────────────────────────
// // // //  * Small UI helpers (premium theme with better contrast)
// // // //  * ────────────────────────────────────────────────────────────*/
// // // // function PremiumCard({ children }: { children: React.ReactNode }) {
// // // //   return (
// // // //     <div className="rounded-3xl ring-1 ring-indigo-200/50 bg-gradient-to-br from-white via-indigo-50/30 to-white shadow-xl overflow-hidden border border-indigo-100/50">
// // // //       <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
// // // //       {children}
// // // //     </div>
// // // //   );
// // // // }
// // // // function PremiumSectionTitle({
// // // //   icon,
// // // //   children,
// // // // }: {
// // // //   icon?: React.ReactNode;
// // // //   children: React.ReactNode;
// // // // }) {
// // // //   return (
// // // //     <div className="flex items-center gap-3 text-base font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
// // // //       {icon}
// // // //       {children}
// // // //     </div>
// // // //   );
// // // // }

// // // // /* Tags Input */
// // // // function TagsInput({
// // // //   value,
// // // //   onChange,
// // // //   placeholder = "Type keyword and press Enter",
// // // // }: {
// // // //   value: string[];
// // // //   onChange: (tags: string[]) => void;
// // // //   placeholder?: string;
// // // // }) {
// // // //   const [draft, setDraft] = useState("");
// // // //   function addTagFromDraft() {
// // // //     const parts = draft
// // // //       .split(/[,\n]/)
// // // //       .map((s) => s.trim())
// // // //       .filter(Boolean);
// // // //     if (parts.length) {
// // // //       const set = new Set([...value, ...parts]);
// // // //       onChange(Array.from(set));
// // // //       setDraft("");
// // // //     }
// // // //   }
// // // //   return (
// // // //     <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // // //       <div className="flex flex-wrap gap-2 mb-3">
// // // //         {value.map((t) => (
// // // //           <span
// // // //             key={t}
// // // //             className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-800 px-3 py-1.5 text-sm ring-1 ring-indigo-300/50 shadow-sm">
// // // //             <IconTags className="h-3.5 w-3.5" />
// // // //             {t}
// // // //             <button
// // // //               onClick={() => onChange(value.filter((x) => x !== t))}
// // // //               className="ml-1 hover:text-indigo-900 transition-colors"
// // // //               aria-label={`Remove ${t}`}>
// // // //               ×
// // // //             </button>
// // // //           </span>
// // // //         ))}
// // // //       </div>
// // // //       <Input
// // // //         value={draft}
// // // //         onChange={(e) => setDraft(e.target.value)}
// // // //         onKeyDown={(e) => {
// // // //           if (e.key === "Enter") {
// // // //             e.preventDefault();
// // // //             addTagFromDraft();
// // // //           }
// // // //           if (e.key === "Backspace" && !draft && value.length) {
// // // //             onChange(value.slice(0, -1));
// // // //           }
// // // //         }}
// // // //         placeholder={placeholder}
// // // //         className="bg-white border-indigo-300"
// // // //       />
// // // //       <p className="text-xs text-indigo-600 mt-2 font-medium">
// // // //         Use Enter or comma to add
// // // //       </p>
// // // //     </div>
// // // //   );
// // // // }

// // // // /* Image Picker */
// // // // function ImagePicker({
// // // //   imageUrl,
// // // //   onImageUrlChange,
// // // //   file,
// // // //   onFileChange,
// // // // }: {
// // // //   imageUrl: string;
// // // //   onImageUrlChange: (v: string) => void;
// // // //   file: File | null;
// // // //   onFileChange: (f: File | null) => void;
// // // // }) {
// // // //   const preview = React.useMemo(
// // // //     () => (file ? URL.createObjectURL(file) : imageUrl || ""),
// // // //     [file, imageUrl]
// // // //   );
// // // //   return (
// // // //     <div className="grid gap-4">
// // // //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // // //         <div>
// // // //           <Label className="text-sm font-semibold text-gray-700">
// // // //             Image URL
// // // //           </Label>
// // // //           <Input
// // // //             placeholder="https://example.com/image.jpg"
// // // //             value={imageUrl}
// // // //             onChange={(e) => onImageUrlChange(e.target.value)}
// // // //             className="bg-white border-indigo-300"
// // // //           />
// // // //         </div>
// // // //         <div>
// // // //           <Label className="text-sm font-semibold text-gray-700">
// // // //             Upload Image
// // // //           </Label>
// // // //           <div className="flex items-center gap-3">
// // // //             <Input
// // // //               type="file"
// // // //               accept="image/*"
// // // //               className="bg-white border-indigo-300"
// // // //               onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
// // // //             />
// // // //             {file && (
// // // //               <Badge
// // // //                 variant="outline"
// // // //                 className="rounded-full bg-indigo-100 border-indigo-300 text-indigo-700">
// // // //                 {file.name}
// // // //               </Badge>
// // // //             )}
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //       {preview ? (
// // // //         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // // //           <img
// // // //             src={preview}
// // // //             alt="preview"
// // // //             className="max-h-64 w-full rounded-xl object-cover shadow-md"
// // // //           />
// // // //         </div>
// // // //       ) : (
// // // //         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-100/50 p-6 text-sm text-indigo-500 flex items-center justify-center">
// // // //           No preview available
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }

// // // // /* Presets */
// // // // const PRESET_KEY = "classified_automation_preset_v2";
// // // // function savePreset(data: any) {
// // // //   localStorage.setItem(PRESET_KEY, JSON.stringify(data));
// // // // }
// // // // function loadPreset(): any | null {
// // // //   try {
// // // //     const raw = localStorage.getItem(PRESET_KEY);
// // // //     return raw ? JSON.parse(raw) : null;
// // // //   } catch {
// // // //     return null;
// // // //   }
// // // // }

// // // // /* Fake uploader (replace with real) */
// // // // async function uploadImageAndGetUrl(file: File): Promise<string> {
// // // //   return URL.createObjectURL(file);
// // // // }

// // // // /* Tiny helpers from items */
// // // // const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// // // // const getItemHtml = (it: GeneratedItem) =>
// // // //   (it.html ?? it.generatedContent ?? "").toString();
// // // // function getItemKeywords(it: GeneratedItem): string[] {
// // // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // // //   if (typeof it.keyword === "string")
// // // //     return it.keyword
// // // //       .split(/[,\|]/)
// // // //       .map((s) => s.trim())
// // // //       .filter(Boolean);
// // // //   return [];
// // // // }

// // // // /* ─────────────────────────────────────────────────────────────
// // // //  * MAIN
// // // //  * ────────────────────────────────────────────────────────────*/
// // // // export default function ClassifiedAutomationPage() {
// // // //   /* Load all generated items */
// // // //   const [items, setItems] = useState<GeneratedItem[]>([]);
// // // //   useEffect(() => setItems(loadGeneratedItems()), []);

// // // //   /* Hook wiring */
// // // //   const {
// // // //     search,
// // // //     setSearch,
// // // //     filteredProjects,
// // // //     expandedProjectIds,
// // // //     toggleProjectExpand,
// // // //     selectedItemIds,
// // // //     isProjectSelected,
// // // //     isItemSelected,
// // // //     setProjectChecked,
// // // //     setItemChecked,
// // // //     selectAllVisible,
// // // //     clearSelection,
// // // //     setFocusedItemId,
// // // //     focusedItem,
// // // //     selectedItems,
// // // //     start,
// // // //     isStarting,
// // // //     jobId,
// // // //     progress,
// // // //   } = useListingAutomation(items, {
// // // //     uploadImage: uploadImageAndGetUrl,
// // // //     statusPollIntervalMs: 1500,
// // // //     maxPollMinutes: 15,
// // // //     maxSelectableItems: SITES.length, // ✅ max 7 contents
// // // //     onMaxExceeded: (max) =>
// // // //       toast.error(`Max ${max} contents only (sites limit).`),
// // // //   });

// // // //   /* Defaults (apply to all selected items) */
// // // //   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
// // // //   const [category, setCategory] = useState<string>("");

// // // //   // Contact / profile
// // // //   const [phone, setPhone] = useState("");
// // // //   const [website, setWebsite] = useState("");
// // // //   const [email, setEmail] = useState("");

// // // //   // Socials
// // // //   const [facebook, setFacebook] = useState("");
// // // //   const [twitter, setTwitter] = useState("");
// // // //   const [linkedin, setLinkedin] = useState("");
// // // //   const [pinterest, setPinterest] = useState("");
// // // //   const [instagram, setInstagram] = useState("");
// // // //   const [yelp, setYelp] = useState("");
// // // //   const [gmb, setGmb] = useState("");

// // // //   // Address
// // // //   const [country, setCountry] = useState("");
// // // //   const [state, setStateVal] = useState("");
// // // //   const [city, setCity] = useState("");
// // // //   const [zip, setZip] = useState("");
// // // //   const [line1, setLine1] = useState("");

// // // //   // Default image (used if item has none)
// // // //   const [imageUrl, setImageUrl] = useState("");
// // // //   const [imageFile, setImageFile] = useState<File | null>(null);

// // // //   // Sites selection (checkbox multi-select)
// // // //   const [selectedSiteValues, setSelectedSiteValues] = useState<Set<string>>(
// // // //     new Set()
// // // //   );

// // // //   const selectedCount = selectedItems.length;

// // // //   const selectedSites = useMemo(
// // // //     () => ALL_SITES.filter((s) => selectedSiteValues.has(s.value)),
// // // //     [selectedSiteValues]
// // // //   );

// // // //   const selectedSitesCount = selectedSites.length;

// // // //   // Auto-trim sites if items decrease
// // // //   useEffect(() => {
// // // //     if (selectedCount === 0) {
// // // //       setSelectedSiteValues(new Set());
// // // //       return;
// // // //     }
// // // //     if (selectedSiteValues.size <= selectedCount) return;

// // // //     setSelectedSiteValues((prev) => {
// // // //       const arr = Array.from(prev).slice(0, selectedCount);
// // // //       return new Set(arr);
// // // //     });
// // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, [selectedCount]);

// // // //   function toggleSite(siteValue: string, checked: boolean) {
// // // //     setSelectedSiteValues((prev) => {
// // // //       const n = new Set(prev);
// // // //       if (checked) {
// // // //         if (selectedCount === 0) {
// // // //           toast.error("Select content first.");
// // // //           return prev;
// // // //         }
// // // //         if (n.size >= selectedCount) {
// // // //           toast.error(`You can select only ${selectedCount} site(s).`);
// // // //           return prev;
// // // //         }
// // // //         n.add(siteValue);
// // // //       } else {
// // // //         n.delete(siteValue);
// // // //       }
// // // //       return n;
// // // //     });
// // // //   }

// // // //   const readyToStart =
// // // //     selectedCount > 0 && selectedSitesCount === selectedCount;

// // // //   // Preset load
// // // //   useEffect(() => {
// // // //     const p = loadPreset();
// // // //     if (p) {
// // // //       setPhone(p.phone ?? "");
// // // //       setWebsite(p.website ?? "");
// // // //       setEmail(p.email ?? "");
// // // //       setCountry(p.address?.country ?? "");
// // // //       setStateVal(p.address?.state ?? "");
// // // //       setCity(p.address?.city ?? "");
// // // //       setZip(p.address?.zip ?? "");
// // // //       setLine1(p.address?.line1 ?? "");
// // // //       setFacebook(p.socials?.facebook ?? "");
// // // //       setTwitter(p.socials?.twitter ?? "");
// // // //       setLinkedin(p.socials?.linkedin ?? "");
// // // //       setPinterest(p.socials?.pinterest ?? "");
// // // //       setInstagram(p.socials?.instagram ?? "");
// // // //       setYelp(p.socials?.yelp ?? "");
// // // //       setGmb(p.socials?.gmb ?? "");

// // // //       // load selected sites
// // // //       if (Array.isArray(p.sites)) {
// // // //         setSelectedSiteValues(new Set(p.sites));
// // // //       }
// // // //     }
// // // //   }, []);

// // // //   function handleSavePreset() {
// // // //     const socials: Socials = {
// // // //       facebook,
// // // //       twitter,
// // // //       linkedin,
// // // //       pinterest,
// // // //       instagram,
// // // //       yelp,
// // // //       gmb,
// // // //     };
// // // //     savePreset({
// // // //       phone,
// // // //       website,
// // // //       email,
// // // //       address: { country, state, city, zip, line1 },
// // // //       socials,
// // // //       sites: Array.from(selectedSiteValues),
// // // //     });
// // // //     toast.success("Preset saved");
// // // //   }

// // // //   async function handleStart() {
// // // //     if (!readyToStart) {
// // // //       toast.error("Select content first, then same number of sites.");
// // // //       return;
// // // //     }
// // // //     try {
// // // //       const { listings } = await start({
// // // //         sites: selectedSites.map((s: any) => ({
// // // //           site: s.value,
// // // //           username: s.username,
// // // //           password: s.password,
// // // //           type: s.type ?? "classified",
// // // //         })),

// // // //         defaults: {
// // // //           category,
// // // //           keywordsDefaults,
// // // //           imageUrl,
// // // //           imageFile,
// // // //           profile: {
// // // //             phone,
// // // //             website,
// // // //             email,
// // // //             socials: {
// // // //               facebook,
// // // //               twitter,
// // // //               linkedin,
// // // //               pinterest,
// // // //               instagram,
// // // //               yelp,
// // // //               gmb,
// // // //             },
// // // //             address: { country, state, city, zip, line1 },
// // // //           },
// // // //         },
// // // //       });
// // // //       toast.success(`Automation started for ${listings} item(s)`);
// // // //     } catch (err: any) {
// // // //       toast.error(err?.message ?? "Failed to start");
// // // //     }
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
// // // //       <div className="mx-auto max-w-screen-2xl px-6 py-10">
// // // //         {/* Top Header */}
// // // //         <PremiumCard>
// // // //           <Card className="border-0 shadow-none bg-transparent">
// // // //             <CardHeader className="pb-6">
// // // //               <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
// // // //                 <div className="flex-1">
// // // //                   <CardTitle className="flex items-center gap-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
// // // //                     <IconListDetails className="h-8 w-8" />
// // // //                     Classified Listing Automation
// // // //                   </CardTitle>
// // // //                   <CardDescription className="text-indigo-600 mt-1 font-medium">
// // // //                     Select content → Pick matching sites → Launch Automation
// // // //                   </CardDescription>
// // // //                 </div>
// // // //                 <div className="flex items-center gap-3 w-full lg:w-auto">
// // // //                   <div className="relative flex-1 lg:w-[350px]">
// // // //                     <IconSearch className="h-5 w-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
// // // //                     <Input
// // // //                       value={search}
// // // //                       onChange={(e) => setSearch(e.target.value)}
// // // //                       placeholder="Search by title or keywords…"
// // // //                       className="pl-12 bg-white border-indigo-300 rounded-2xl shadow-sm"
// // // //                     />
// // // //                   </div>
// // // //                   <Badge className="rounded-full bg-indigo-100 text-indigo-800 border-indigo-300 px-4 py-2 font-semibold">
// // // //                     Selected: {selectedCount}/{SITES.length}
// // // //                   </Badge>
// // // //                 </div>
// // // //               </div>
// // // //             </CardHeader>
// // // //           </Card>
// // // //         </PremiumCard>

// // // //         {/* 3-column premium layout with enhanced spacing */}
// // // //         <div className="mt-10 grid gap-10 xl:grid-cols-12">
// // // //           {/* LEFT (xl: 4) — Projects Panel */}
// // // //           <div className="xl:col-span-4">
// // // //             <div className="sticky top-8 space-y-6">
// // // //               <PremiumCard>
// // // //                 <Card className="border-0 shadow-none bg-transparent">
// // // //                   <CardHeader className="pb-4">
// // // //                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
// // // //                       <IconFolder className="h-6 w-6 text-indigo-600" />
// // // //                       Content Projects
// // // //                     </CardTitle>
// // // //                     <CardDescription className="text-indigo-600">
// // // //                       Choose projects or specific items for posting.
// // // //                     </CardDescription>
// // // //                   </CardHeader>
// // // //                   <CardContent className="space-y-4">
// // // //                     <div className="md:hidden mb-3">
// // // //                       <div className="relative">
// // // //                         <IconSearch className="h-4 w-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // // //                         <Input
// // // //                           value={search}
// // // //                           onChange={(e) => setSearch(e.target.value)}
// // // //                           placeholder="Search title / keywords…"
// // // //                           className="pl-9 bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                     </div>

// // // //                     <div className="flex items-center justify-between text-sm text-indigo-600">
// // // //                       <div className="flex items-center gap-2">
// // // //                         <Button
// // // //                           variant="outline"
// // // //                           size="sm"
// // // //                           onClick={selectAllVisible}
// // // //                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
// // // //                           <IconCircleCheck className="h-4 w-4 mr-2" /> Select
// // // //                           All Visible
// // // //                         </Button>
// // // //                         <Button
// // // //                           variant="outline"
// // // //                           size="sm"
// // // //                           onClick={clearSelection}
// // // //                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
// // // //                           <IconCircleX className="h-4 w-4 mr-2" /> Clear All
// // // //                         </Button>
// // // //                       </div>
// // // //                       <span className="font-semibold">
// // // //                         {filteredProjects.length} Projects
// // // //                       </span>
// // // //                     </div>

// // // //                     <div className="max-h-[650px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300">
// // // //                       {filteredProjects.length === 0 && (
// // // //                         <div className="text-sm text-indigo-500 py-8 text-center">
// // // //                           No content found. Start generating!
// // // //                         </div>
// // // //                       )}

// // // //                       {filteredProjects.map((p, idx) => {
// // // //                         const expanded = expandedProjectIds.has(p.id);
// // // //                         const projectSelected = isProjectSelected(p.id);
// // // //                         const selectedCountInProject = p.items.filter((it) =>
// // // //                           selectedItemIds.has(it.id)
// // // //                         ).length;
// // // //                         const total = p.items.length;

// // // //                         return (
// // // //                           <div
// // // //                             key={p.id}
// // // //                             className="rounded-2xl ring-1 ring-indigo-200/50 bg-white/80 mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
// // // //                             {/* Project row */}
// // // //                             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
// // // //                               <div className="flex items-center gap-4">
// // // //                                 <Button
// // // //                                   variant="ghost"
// // // //                                   size="icon"
// // // //                                   onClick={() => toggleProjectExpand(p.id)}
// // // //                                   className="h-8 w-8 rounded-full hover:bg-indigo-100"
// // // //                                   aria-label={expanded ? "Collapse" : "Expand"}>
// // // //                                   {expanded ? (
// // // //                                     <IconChevronDown className="h-5 w-5 text-indigo-600" />
// // // //                                   ) : (
// // // //                                     <IconChevronRight className="h-5 w-5 text-indigo-600" />
// // // //                                   )}
// // // //                                 </Button>

// // // //                                 <Checkbox
// // // //                                   checked={projectSelected}
// // // //                                   onCheckedChange={(v) =>
// // // //                                     setProjectChecked(p.id, !!v)
// // // //                                   }
// // // //                                   className={cn(
// // // //                                     "mr-2 h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // // //                                   )}
// // // //                                   aria-label="Select project"
// // // //                                 />
// // // //                                 <span className="text-sm font-bold text-gray-800 tabular-nums">
// // // //                                   {String(idx + 1).padStart(2, "0")}.
// // // //                                 </span>
// // // //                                 <span className="text-sm font-bold text-gray-900">
// // // //                                   {p.name}
// // // //                                 </span>
// // // //                               </div>

// // // //                               <Badge
// // // //                                 variant="outline"
// // // //                                 className={cn(
// // // //                                   "rounded-full text-sm px-3 py-1",
// // // //                                   selectedCountInProject
// // // //                                     ? "border-indigo-600 text-indigo-700 bg-indigo-100"
// // // //                                     : "border-indigo-300 text-indigo-500"
// // // //                                 )}>
// // // //                                 {selectedCountInProject}/{total}
// // // //                               </Badge>
// // // //                             </div>

// // // //                             {/* Items list */}
// // // //                             {expanded && (
// // // //                               <div className="border-t border-indigo-100 divide-y divide-indigo-50">
// // // //                                 {p.items.map((it, iidx) => {
// // // //                                   const checked = isItemSelected(it.id);
// // // //                                   return (
// // // //                                     <div
// // // //                                       key={it.id}
// // // //                                       className={cn(
// // // //                                         "flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 transition-colors",
// // // //                                         checked &&
// // // //                                           "bg-indigo-50 ring-1 ring-indigo-200/50"
// // // //                                       )}>
// // // //                                       <div className="flex items-center gap-4 min-w-0">
// // // //                                         <span className="text-xs text-indigo-500 font-semibold w-6 text-right tabular-nums">
// // // //                                           {iidx + 1}
// // // //                                         </span>
// // // //                                         <Checkbox
// // // //                                           checked={checked}
// // // //                                           onCheckedChange={(v) =>
// // // //                                             setItemChecked(p.id, it.id, !!v)
// // // //                                           }
// // // //                                           className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // // //                                           aria-label="Select item"
// // // //                                         />
// // // //                                         <button
// // // //                                           className="text-left min-w-0 flex-1"
// // // //                                           onClick={() =>
// // // //                                             setFocusedItemId(it.id)
// // // //                                           }>
// // // //                                           <div className="text-base font-semibold text-gray-900 truncate">
// // // //                                             {(getItemTitle(it) ||
// // // //                                               getItemKeywords(it)[0]) ??
// // // //                                               "Untitled"}
// // // //                                           </div>
// // // //                                           <div className="text-sm text-indigo-600 truncate mt-1">
// // // //                                             {getItemKeywords(it).join(", ")}
// // // //                                           </div>
// // // //                                         </button>
// // // //                                       </div>
// // // //                                       {checked && (
// // // //                                         <IconCheck className="h-5 w-5 text-indigo-600 flex-shrink-0" />
// // // //                                       )}
// // // //                                     </div>
// // // //                                   );
// // // //                                 })}
// // // //                               </div>
// // // //                             )}
// // // //                           </div>
// // // //                         );
// // // //                       })}
// // // //                     </div>
// // // //                   </CardContent>
// // // //                 </Card>
// // // //               </PremiumCard>
// // // //             </div>
// // // //           </div>

// // // //           {/* CENTER (xl: 5) — Defaults + Preview */}
// // // //           <div className="xl:col-span-5 space-y-6">
// // // //             <PremiumCard>
// // // //               <Card className="border-0 shadow-none bg-transparent">
// // // //                 <CardHeader className="pb-5">
// // // //                   <CardTitle className="text-xl font-bold text-gray-900">
// // // //                     Global Listing Settings
// // // //                   </CardTitle>
// // // //                   <CardDescription className="text-indigo-600">
// // // //                     These defaults will apply across all selected contents.
// // // //                   </CardDescription>
// // // //                 </CardHeader>
// // // //                 <CardContent className="space-y-6">
// // // //                   <section className="space-y-3">
// // // //                     <PremiumSectionTitle
// // // //                       icon={<IconTags className="h-5 w-5" />}>
// // // //                       Keyword Enhancements
// // // //                     </PremiumSectionTitle>
// // // //                     <TagsInput
// // // //                       value={keywordsDefaults}
// // // //                       onChange={setKeywordsDefaults}
// // // //                     />
// // // //                   </section>

// // // //                   <section className="space-y-3">
// // // //                     <PremiumSectionTitle>Primary Category</PremiumSectionTitle>
// // // //                     <Select value={category} onValueChange={setCategory}>
// // // //                       <SelectTrigger className="bg-white border-indigo-300 rounded-2xl">
// // // //                         <SelectValue placeholder="Select a category" />
// // // //                       </SelectTrigger>
// // // //                       <SelectContent className="rounded-2xl">
// // // //                         {CATEGORIES.map((c) => (
// // // //                           <SelectItem key={c} value={c} className="rounded-xl">
// // // //                             {c}
// // // //                           </SelectItem>
// // // //                         ))}
// // // //                       </SelectContent>
// // // //                     </Select>
// // // //                   </section>

// // // //                   <section className="space-y-3">
// // // //                     <PremiumSectionTitle
// // // //                       icon={<IconPhoto className="h-5 w-5" />}>
// // // //                       Fallback Image
// // // //                     </PremiumSectionTitle>
// // // //                     <ImagePicker
// // // //                       imageUrl={imageUrl}
// // // //                       onImageUrlChange={setImageUrl}
// // // //                       file={imageFile}
// // // //                       onFileChange={setImageFile}
// // // //                     />
// // // //                     <p className="text-xs text-indigo-600 font-medium">
// // // //                       Applies only to items without their own image.
// // // //                     </p>
// // // //                   </section>

// // // //                   <section className="space-y-4">
// // // //                     <PremiumSectionTitle
// // // //                       icon={<IconMap2 className="h-5 w-5" />}>
// // // //                       Location Details
// // // //                     </PremiumSectionTitle>
// // // //                     <div className="grid gap-4 md:grid-cols-2">
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           Country
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={country}
// // // //                           onChange={(e) => setCountry(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           State/Province
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={state}
// // // //                           onChange={(e) => setStateVal(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           City
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={city}
// // // //                           onChange={(e) => setCity(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           ZIP/Postal Code
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={zip}
// // // //                           onChange={(e) => setZip(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                     </div>
// // // //                     <div>
// // // //                       <Label className="text-sm font-semibold text-gray-700">
// // // //                         Street Address
// // // //                       </Label>
// // // //                       <Input
// // // //                         value={line1}
// // // //                         onChange={(e) => setLine1(e.target.value)}
// // // //                         className="bg-white border-indigo-300 rounded-xl"
// // // //                       />
// // // //                     </div>
// // // //                   </section>

// // // //                   <section className="space-y-4">
// // // //                     <PremiumSectionTitle
// // // //                       icon={<IconAddressBook className="h-5 w-5" />}>
// // // //                       Contact Information
// // // //                     </PremiumSectionTitle>
// // // //                     <div className="grid gap-4 md:grid-cols-3">
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           Phone
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={phone}
// // // //                           onChange={(e) => setPhone(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           Website
// // // //                         </Label>
// // // //                         <div className="flex items-center">
// // // //                           <IconWorldWww className="h-5 w-5 mr-3 text-indigo-500" />
// // // //                           <Input
// // // //                             value={website}
// // // //                             onChange={(e) => setWebsite(e.target.value)}
// // // //                             className="bg-white border-indigo-300 rounded-xl flex-1"
// // // //                           />
// // // //                         </div>
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold text-gray-700">
// // // //                           Email
// // // //                         </Label>
// // // //                         <div className="flex items-center">
// // // //                           <IconAt className="h-5 w-5 mr-3 text-indigo-500" />
// // // //                           <Input
// // // //                             value={email}
// // // //                             onChange={(e) => setEmail(e.target.value)}
// // // //                             className="bg-white border-indigo-300 rounded-xl flex-1"
// // // //                           />
// // // //                         </div>
// // // //                       </div>
// // // //                     </div>
// // // //                   </section>

// // // //                   <section className="space-y-4">
// // // //                     <PremiumSectionTitle
// // // //                       icon={<IconWorld className="h-5 w-5" />}>
// // // //                       Social Connections
// // // //                     </PremiumSectionTitle>
// // // //                     <div className="grid gap-4 md:grid-cols-2">
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandFacebook className="h-4 w-4 text-blue-600" />{" "}
// // // //                           Facebook
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={facebook}
// // // //                           onChange={(e) => setFacebook(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandTwitter className="h-4 w-4 text-blue-400" />{" "}
// // // //                           Twitter / X
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={twitter}
// // // //                           onChange={(e) => setTwitter(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandLinkedin className="h-4 w-4 text-blue-700" />{" "}
// // // //                           LinkedIn
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={linkedin}
// // // //                           onChange={(e) => setLinkedin(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandPinterest className="h-4 w-4 text-red-500" />{" "}
// // // //                           Pinterest
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={pinterest}
// // // //                           onChange={(e) => setPinterest(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandInstagram className="h-4 w-4 text-pink-500" />{" "}
// // // //                           Instagram
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={instagram}
// // // //                           onChange={(e) => setInstagram(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div>
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandCpp className="h-4 w-4 text-yellow-600" />{" "}
// // // //                           Yelp
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={yelp}
// // // //                           onChange={(e) => setYelp(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                       <div className="md:col-span-2">
// // // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // // //                           <IconBrandGoogle className="h-4 w-4 text-red-500" />{" "}
// // // //                           Google Business
// // // //                         </Label>
// // // //                         <Input
// // // //                           value={gmb}
// // // //                           onChange={(e) => setGmb(e.target.value)}
// // // //                           className="bg-white border-indigo-300 rounded-xl"
// // // //                         />
// // // //                       </div>
// // // //                     </div>
// // // //                   </section>
// // // //                 </CardContent>
// // // //               </Card>
// // // //             </PremiumCard>

// // // //             <PremiumCard>
// // // //               <Card className="border-0 shadow-none bg-transparent">
// // // //                 <CardHeader className="pb-4">
// // // //                   <CardTitle className="text-xl font-bold text-gray-900">
// // // //                     Live Preview
// // // //                   </CardTitle>
// // // //                   <CardDescription className="text-indigo-600">
// // // //                     Select an item from the left to see a real-time preview
// // // //                     here.
// // // //                   </CardDescription>
// // // //                 </CardHeader>
// // // //                 <CardContent className="space-y-5">
// // // //                   <div>
// // // //                     <Label className="text-sm font-semibold text-gray-700">
// // // //                       Listing Title
// // // //                     </Label>
// // // //                     <Input
// // // //                       value={focusedItem ? getItemTitle(focusedItem) : ""}
// // // //                       readOnly
// // // //                       placeholder="Click an item to preview its title"
// // // //                       className="bg-indigo-50/50 border-indigo-300 rounded-xl mt-1 font-semibold"
// // // //                     />
// // // //                   </div>
// // // //                   <div>
// // // //                     <Label className="text-sm font-semibold text-gray-700">
// // // //                       Description Content
// // // //                     </Label>
// // // //                     <Textarea
// // // //                       value={focusedItem ? getItemHtml(focusedItem) : ""}
// // // //                       readOnly
// // // //                       placeholder="Click an item to preview its full content"
// // // //                       className="min-h-[200px] bg-indigo-50/50 border-indigo-300 rounded-xl mt-1"
// // // //                     />
// // // //                   </div>
// // // //                 </CardContent>
// // // //               </Card>
// // // //             </PremiumCard>
// // // //           </div>

// // // //           {/* RIGHT (xl: 3) — Automation Controls */}
// // // //           <div className="xl:col-span-3">
// // // //             <div className="sticky top-8 space-y-6">
// // // //               <PremiumCard>
// // // //                 <Card className="border-0 shadow-none bg-transparent">
// // // //                   <CardHeader className="pb-5">
// // // //                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
// // // //                       <IconSparkles className="h-6 w-6 text-purple-600" />
// // // //                       Automation Launch
// // // //                     </CardTitle>
// // // //                     <CardDescription className="text-indigo-600">
// // // //                       Match content count with site selections for seamless
// // // //                       posting.
// // // //                     </CardDescription>
// // // //                   </CardHeader>

// // // //                   <CardContent className="space-y-6">
// // // //                     {/* SITES CHECKBOX LIST */}
// // // //                     <section className="space-y-3">
// // // //                       <Label className="text-sm font-bold flex items-center gap-3 text-gray-900">
// // // //                         <IconGlobe className="h-5 w-5 text-indigo-600" />
// // // //                         Target Sites ({selectedSitesCount}/{selectedCount || 0})
// // // //                       </Label>

// // // //                       {selectedCount === 0 && (
// // // //                         <div className="text-sm text-indigo-500">
// // // //                           Begin by selecting content on the left.
// // // //                         </div>
// // // //                       )}

// // // //                       <div className="rounded-2xl ring-1 ring-indigo-200 bg-white/80 divide-y divide-indigo-50 shadow-sm max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300">
// // // //                         {ALL_SITES.map((s) => {
// // // //                           const isChecked = selectedSiteValues.has(s.value);
// // // //                           const disableNew =
// // // //                             !isChecked &&
// // // //                             (selectedSitesCount >= selectedCount ||
// // // //                               selectedCount === 0);

// // // //                           return (
// // // //                             <label
// // // //                               key={s.value}
// // // //                               className={cn(
// // // //                                 "flex items-center justify-between gap-4 px-4 py-3 cursor-pointer transition-all hover:bg-indigo-50/50",
// // // //                                 isChecked &&
// // // //                                   "bg-indigo-50/80 ring-1 ring-indigo-200/50",
// // // //                                 disableNew && "opacity-70 cursor-not-allowed"
// // // //                               )}>
// // // //                               <div className="flex items-center gap-3 min-w-0">
// // // //                                 <Checkbox
// // // //                                   checked={isChecked}
// // // //                                   disabled={disableNew}
// // // //                                   onCheckedChange={(v) =>
// // // //                                     toggleSite(s.value, !!v)
// // // //                                   }
// // // //                                   className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // // //                                 />
// // // //                                 <span className="text-base font-semibold text-gray-900 truncate">
// // // //                                   {s.label}
// // // //                                 </span>
// // // //                               </div>

// // // //                               <Badge
// // // //                                 variant="outline"
// // // //                                 className="rounded-full text-xs px-3 py-1 bg-indigo-100 border-indigo-300 text-indigo-700">
// // // //                                 1 Slot
// // // //                               </Badge>
// // // //                             </label>
// // // //                           );
// // // //                         })}
// // // //                       </div>

// // // //                       <p className="text-xs text-indigo-600 font-medium">
// // // //                         Pro Tip: {selectedCount} contents require exactly{" "}
// // // //                         {selectedCount} sites.
// // // //                       </p>
// // // //                     </section>

// // // //                     <Separator className="border-indigo-200" />

// // // //                     <div className="grid gap-4">
// // // //                       <Button
// // // //                         onClick={handleStart}
// // // //                         disabled={!readyToStart || isStarting}
// // // //                         className={cn(
// // // //                           "rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 h-12 font-bold text-lg",
// // // //                           !readyToStart && "opacity-70 cursor-not-allowed"
// // // //                         )}>
// // // //                         <IconPlayerPlay className="h-5 w-5 mr-3" />
// // // //                         {isStarting
// // // //                           ? "Launching…"
// // // //                           : `Launch Now (${selectedCount})`}
// // // //                       </Button>

// // // //                       <div className="flex items-center justify-between text-sm text-indigo-600">
// // // //                         <span className="flex items-center gap-2 font-medium">
// // // //                           <IconCheck className="h-4 w-4" />
// // // //                           {selectedCount} Contents Ready
// // // //                         </span>
// // // //                         <span className="flex items-center gap-2 font-medium">
// // // //                           <IconGlobe className="h-4 w-4" />
// // // //                           {selectedSitesCount} Sites Locked
// // // //                         </span>
// // // //                       </div>

// // // //                       {jobId && (
// // // //                         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // // //                           <div className="flex items-center justify-between text-sm text-indigo-600 mb-3 font-medium">
// // // //                             <span>Job ID: {jobId}</span>
// // // //                             <span>{progress}% Complete</span>
// // // //                           </div>
// // // //                           <Progress
// // // //                             value={progress}
// // // //                             className="h-3 bg-indigo-200 rounded-full"
// // // //                           />
// // // //                         </div>
// // // //                       )}
// // // //                     </div>
// // // //                   </CardContent>
// // // //                 </Card>
// // // //               </PremiumCard>

// // // //               <div className="rounded-2xl ring-1 ring-indigo-200 bg-white shadow-lg p-5 text-sm text-gray-800 border border-indigo-100/50">
// // // //                 <p className="mb-2 flex items-center gap-2">
// // // //                   ✅ <b>Workflow:</b> Contents → Sites → Launch
// // // //                 </p>
// // // //                 <p className="mb-4">
// // // //                   🚀 <b>API Target:</b>{" "}
// // // //                   <code className="bg-indigo-100 px-2 py-1 rounded text-indigo-800 font-mono">
// // // //                     /api/automation/start
// // // //                   </code>{" "}
// // // //                   (1 per site)
// // // //                 </p>
// // // //                 <div className="flex items-center gap-3">
// // // //                   <Button
// // // //                     variant="outline"
// // // //                     onClick={handleSavePreset}
// // // //                     className="rounded-full border-indigo-300 hover:bg-indigo-50">
// // // //                     💾 Save Config
// // // //                   </Button>
// // // //                   <Badge className="rounded-full bg-purple-100 text-purple-800 border-purple-300">
// // // //                     Premium: 7 Sites Max
// // // //                   </Badge>
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //         {/* /grid */}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // import React, { useEffect, useMemo, useState } from "react";
// // // import {
// // //   Card,
// // //   CardContent,
// // //   CardDescription,
// // //   CardHeader,
// // //   CardTitle,
// // // } from "@/components/ui/card";
// // // import { Button } from "@/components/ui/button";
// // // import { Badge } from "@/components/ui/badge";
// // // import { Input } from "@/components/ui/input";
// // // import { Label } from "@/components/ui/label";
// // // import { Textarea } from "@/components/ui/textarea";
// // // import { Separator } from "@/components/ui/separator";
// // // import { Progress } from "@/components/ui/progress";
// // // import { Checkbox } from "@/components/ui/checkbox";
// // // import { toast } from "sonner";
// // // import { cn } from "@/lib/utils";
// // // import {
// // //   Select,
// // //   SelectContent,
// // //   SelectItem,
// // //   SelectTrigger,
// // //   SelectValue,
// // // } from "@/components/ui/select";

// // // import {
// // //   IconWorld,
// // //   IconListDetails,
// // //   IconPlayerPlay,
// // //   IconSparkles,
// // //   IconAddressBook,
// // //   IconTags,
// // //   IconMap2,
// // //   IconPhoto,
// // //   IconWorldWww,
// // //   IconAt,
// // //   IconBrandFacebook,
// // //   IconBrandTwitter,
// // //   IconBrandLinkedin,
// // //   IconBrandPinterest,
// // //   IconBrandInstagram,
// // //   IconBrandCpp, // Yelp placeholder
// // //   IconBrandGoogle,
// // //   IconChevronDown,
// // //   IconChevronRight,
// // //   IconSearch,
// // //   IconFolder,
// // //   IconCheck,
// // //   IconCircleCheck,
// // //   IconCircleX,
// // //   IconGlobe,
// // // } from "@tabler/icons-react";

// // // import {
// // //   useListingAutomation,
// // //   type GeneratedItem,
// // //   type Socials,
// // // } from "./hooks/useListingAutomation";

// // // /* ─────────────────────────────────────────────────────────────
// // //  * Constants
// // //  * ────────────────────────────────────────────────────────────*/
// // // const CATEGORIES = [
// // //   "Electronics",
// // //   "Home & Garden",
// // //   "Vehicles",
// // //   "Jobs",
// // //   "Services",
// // //   "Real Estate",
// // //   "Pets",
// // //   "Books",
// // //   "Fashion",
// // //   "Sports",
// // // ];

// // // const WORDPRESS_SITES = [
// // //   {
// // //     value: "linuxpatent.com",
// // //     label: "linuxpatent.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "linuxpatent.com",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "rayseries.com",
// // //     label: "rayseries.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "8@O!jIiuQ*NIFV3WdaBa9dsE",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "pasfait.com",
// // //     label: "pasfait.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "yCCH0nF$Tyo71grRnHFJ$zyt",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "scotchsavvy.com",
// // //     label: "scotchsavvy.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "!l!sGeKwA9^y!7UgvhV1RNnf",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "extremesportsgoons.info",
// // //     label: "extremesportsgoons.info (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "Vu9fe!7fmOKL#f#Xd1KjrtO8",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "creeksidereflections.com",
// // //     label: "creeksidereflections.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "Tj!riY$sK!IcjoxgIMk&aBGC",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "PiratesGab.com",
// // //     label: "PiratesGab.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "ADzQ)e32l^yVG*!7w!Sv1)r7",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "theSportchampion.com",
// // //     label: "theSportchampion.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "(bH31Z6BX5Z%b$7$ZGI%@V*1",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "DataDrillAmerAsia.com",
// // //     label: "DataDrillAmerAsia.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "A20XfpFnPjTON!(N0FpUceT&",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "htpsouthdowns.com",
// // //     label: "htpsouthdowns.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "IhRiyAN$1dpGJPmc#rdke%Ca",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "UsJobSandGigs.com",
// // //     label: "UsJobSandGigs.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "S&N8z8l31oB5z)i9l!8hJ^IE",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "VictoriesSport.com",
// // //     label: "VictoriesSport.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "vm9)i$yQ*0&LY@TwSrP7UbD$",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "veroniquelacoste.com",
// // //     label: "veroniquelacoste.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "@C@EJNa9Q!45Kr2ui8Rcf&Zz",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "missonthemove.com",
// // //     label: "missonthemove.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "14Iw2h*uBAXDCGvXnKfiRKaW",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "pcnfa.com",
// // //     label: "pcnfa.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "e4uBbiwr848sODXu7ol4H)J9",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "theangelfilm.com",
// // //     label: "theangelfilm.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "uqOmUe4zsnVSqhoNlFmuSh0",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "soerq.com",
// // //     label: "soerq.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "S!8zG&whLv4RKFI!PmkkYUBD",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "paydayard.com",
// // //     label: "paydayard.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "Or0LiS$9yfpqNToahE6N(WdO",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "trekbadlands.com",
// // //     label: "trekbadlands.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "^z@3JoOl^5QZB)BMha%(@*g7",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "pawmeism.com",
// // //     label: "pawmeism.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "npNMn5(Dt33JTD2h)WA%Ib@m",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "demokore.com",
// // //     label: "demokore.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "EuJDo%8Mv1Oq)mFnhqItAVLN",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "moviemotives.com",
// // //     label: "moviemotives.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "@(@mVM5pq&v0CGsvkpd5dUc6",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "apktowns.com",
// // //     label: "apktowns.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "oCMtxX%rq$eWkltsntabddZ5",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "mallorcasupport.com",
// // //     label: "mallorcasupport.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "z*A@N$8pGPhsmuF%YbQxz27y",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "manageprinters.com",
// // //     label: "manageprinters.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "9waZ0Fig2&X!BaqO5LTBLAhN",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "mitchellstover.com",
// // //     label: "mitchellstover.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "s&j3d9mUx!G51S5#*gr^a3bO",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "fametize.com",
// // //     label: "fametize.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "nc)ijExdWpHRjJk^mTWolzTt",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "luocsu.com",
// // //     label: "luocsu.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "Vjy2fiQ@yqJmmUSenskKC#uq",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "inststagram.com",
// // //     label: "inststagram.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "m$w8Wq9ustuOEo#!JLUAJLeY",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "ashopear.com",
// // //     label: "ashopear.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "01JaDjdjieP9Qbw$DbrI%q)S",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "charles6767.com",
// // //     label: "charles6767.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "En4)HXb0cxTRvq%qp$PIlz*e",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "berlintype.com",
// // //     label: "berlintype.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "Jf2s)O0q!ig%WK(uLm)BTQDZ",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "sprintcybermonday.com",
// // //     label: "sprintcybermonday.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "*^dYF6Eb*bK$bBXWtR88zMA#",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "jamesvirtudazo.com",
// // //     label: "jamesvirtudazo.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "IUqYJiibfLJ^sQ@1j7oj*3r2",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "partyprivee.com",
// // //     label: "partyprivee.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "OfwUX(s%WEai&s9WPMZ!jWYj",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "launcheell.com",
// // //     label: "launcheell.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "nC^suIxOZ4sYPi395&$a5Nhx",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "bridge-busan.com",
// // //     label: "bridge-busan.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "7l%P#(NIacu&k04hPL7a9O&U",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "cruitholidayhome.com",
// // //     label: "cruitholidayhome.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "2p&iJ%@1A4T*J*yU5p%%TVJX",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "yhbdvideo.com",
// // //     label: "yhbdvideo.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "OAObx7y@dpK(2p@47iym4lhb",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "hmboot.com",
// // //     label: "hmboot.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "5gn%2EcPEq8Tgud9f*P9Dn6",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "allaboutlaptop.com",
// // //     label: "allaboutlaptop.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: ")Os91UzZlfYiFt)*ViZS7JS*",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "photosdp.net",
// // //     label: "photosdp.net (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "G7$E8mc2&Cws4opuF9ECRRIn",
// // //     type: "wordpress",
// // //   },
// // // ];

// // // /** FIXED 7 SITES (1 site = 1 content) */
// // // const SITES = [
// // //   {
// // //     value: "proclassifiedads.com",
// // //     label: "proclassifiedads.com",
// // //     username: "Zoran",
// // //     password: "XsujZnakXKuqZ@&e(o3qSr@!",
// // //   },
// // //   {
// // //     value: "classifiedsposts.com",
// // //     label: "classifiedsposts.com",
// // //     username: "Fyren",
// // //     password: "AEsB%COsrw#!NHp@IaDSpFXs",
// // //   },
// // //   {
// // //     value: "globaladsclassifieds.com",
// // //     label: "globaladsclassifieds.com",
// // //     username: "FlowTrack",
// // //     password: "ZAe!M8TbBt$8T(xYTaL%n1yd",
// // //   },
// // //   {
// // //     value: "onlineclassifiedsads.com",
// // //     label: "onlineclassifiedsads.com",
// // //     username: "Velyn",
// // //     password: "oWujA^FC88qcteDObVP8h4FD",
// // //   },
// // //   {
// // //     value: "thelocanto.com",
// // //     label: "thelocanto.com",
// // //     username: "Tarka",
// // //     password: "08uNArlcpnHiihxRz)ubwivK",
// // //   },
// // //   {
// // //     value: "true-finders.com",
// // //     label: "true-finders.com",
// // //     username: "FlowTrack",
// // //     password: "Zl^lEUbc(&)(GbcY^Nkxp@Gt",
// // //   },
// // //   {
// // //     value: "proadvertiser.org",
// // //     label: "proadvertiser.org",
// // //     username: "FlowTrack",
// // //     password: "x&w^XfmST*xino6U&FD1$fp5",
// // //   },
// // // ];

// // // const ALL_SITES = [...SITES, ...WORDPRESS_SITES];

// // // /* ─────────────────────────────────────────────────────────────
// // //  * Local-storage loader (from your content app)
// // //  * ──────────────────────────────────────────────────────────*/
// // // function loadGeneratedItems(): GeneratedItem[] {
// // //   const keys = ["content_items_v1", "content-items", "seomatic_content_items"];
// // //   for (const k of keys) {
// // //     try {
// // //       const raw = localStorage.getItem(k);
// // //       if (raw) {
// // //         const arr = JSON.parse(raw);
// // //         if (Array.isArray(arr)) return arr;
// // //       }
// // //     } catch {}
// // //   }
// // //   try {
// // //     const raw =
// // //       sessionStorage.getItem("open-content-item_v1") ??
// // //       localStorage.getItem("open-content-item_v1_fallback");
// // //     if (raw) {
// // //       const it = JSON.parse(raw);
// // //       if (it && typeof it === "object") return [it];
// // //     }
// // //   } catch {}
// // //   return [];
// // // }

// // // /* ─────────────────────────────────────────────────────────────
// // //  * Small UI helpers (premium theme with better contrast)
// // //  * ──────────────────────────────────────────────────────────*/
// // // function PremiumCard({ children }: { children: React.ReactNode }) {
// // //   return (
// // //     <div className="rounded-3xl ring-1 ring-indigo-200/50 bg-gradient-to-br from-white via-indigo-50/30 to-white shadow-xl overflow-hidden border border-indigo-100/50">
// // //       <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
// // //       {children}
// // //     </div>
// // //   );
// // // }
// // // function PremiumSectionTitle({
// // //   icon,
// // //   children,
// // // }: {
// // //   icon?: React.ReactNode;
// // //   children: React.ReactNode;
// // // }) {
// // //   return (
// // //     <div className="flex items-center gap-3 text-base font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text ">
// // //       {icon}
// // //       {children}
// // //     </div>
// // //   );
// // // }

// // // /* Tags Input */
// // // function TagsInput({
// // //   value,
// // //   onChange,
// // //   placeholder = "Type keyword and press Enter",
// // // }: {
// // //   value: string[];
// // //   onChange: (tags: string[]) => void;
// // //   placeholder?: string;
// // // }) {
// // //   const [draft, setDraft] = useState("");
// // //   function addTagFromDraft() {
// // //     const parts = draft
// // //       .split(/[,\n]/)
// // //       .map((s) => s.trim())
// // //       .filter(Boolean);
// // //     if (parts.length) {
// // //       const set = new Set([...value, ...parts]);
// // //       onChange(Array.from(set));
// // //       setDraft("");
// // //     }
// // //   }
// // //   return (
// // //     <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // //       <div className="flex flex-wrap gap-2 mb-3">
// // //         {value.map((t) => (
// // //           <span
// // //             key={t}
// // //             className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-800 px-3 py-1.5 text-sm ring-1 ring-indigo-300/50 shadow-sm">
// // //             <IconTags className="h-3.5 w-3.5" />
// // //             {t}
// // //             <button
// // //               onClick={() => onChange(value.filter((x) => x !== t))}
// // //               className="ml-1 hover:text-indigo-900 transition-colors"
// // //               aria-label={`Remove ${t}`}>
// // //               ×
// // //             </button>
// // //           </span>
// // //         ))}
// // //       </div>
// // //       <Input
// // //         value={draft}
// // //         onChange={(e) => setDraft(e.target.value)}
// // //         onKeyDown={(e) => {
// // //           if (e.key === "Enter") {
// // //             e.preventDefault();
// // //             addTagFromDraft();
// // //           }
// // //           if (e.key === "Backspace" && !draft && value.length) {
// // //             onChange(value.slice(0, -1));
// // //           }
// // //         }}
// // //         placeholder={placeholder}
// // //         className="bg-white border-indigo-300"
// // //       />
// // //       <p className="text-xs text-indigo-600 mt-2 font-medium">Use Enter or comma to add</p>
// // //     </div>
// // //   );
// // // }

// // // /* Image Picker (with cleanup to avoid leaking object URLs) */
// // // function ImagePicker({
// // //   imageUrl,
// // //   onImageUrlChange,
// // //   file,
// // //   onFileChange,
// // // }: {
// // //   imageUrl: string;
// // //   onImageUrlChange: (v: string) => void;
// // //   file: File | null;
// // //   onFileChange: (f: File | null) => void;
// // // }) {
// // //   const [previewUrl, setPreviewUrl] = useState<string>("");

// // //   useEffect(() => {
// // //     if (file) {
// // //       const u = URL.createObjectURL(file);
// // //       setPreviewUrl(u);
// // //       return () => {
// // //         URL.revokeObjectURL(u);
// // //       };
// // //     }

// // //     setPreviewUrl(imageUrl || "");
// // //   }, [file, imageUrl]);

// // //   const preview = previewUrl;

// // //   return (
// // //     <div className="grid gap-4">
// // //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // //         <div>
// // //           <Label className="text-sm font-semibold text-gray-700">Image URL</Label>
// // //           <Input
// // //             placeholder="https://example.com/image.jpg"
// // //             value={imageUrl}
// // //             onChange={(e) => onImageUrlChange(e.target.value)}
// // //             className="bg-white border-indigo-300"
// // //           />
// // //         </div>
// // //         <div>
// // //           <Label className="text-sm font-semibold text-gray-700">Upload Image</Label>
// // //           <div className="flex items-center gap-3">
// // //             <Input
// // //               type="file"
// // //               accept="image/*"
// // //               className="bg-white border-indigo-300"
// // //               onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
// // //             />
// // //             {file && (
// // //               <Badge
// // //                 variant="outline"
// // //                 className="rounded-full bg-indigo-100 border-indigo-300 text-indigo-700">
// // //                 {file.name}
// // //               </Badge>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //       {preview ? (
// // //         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // //           <img
// // //             src={preview}
// // //             alt="preview"
// // //             className="max-h-64 w-full rounded-xl object-cover shadow-md"
// // //           />
// // //         </div>
// // //       ) : (
// // //         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-100/50 p-6 text-sm text-indigo-500 flex items-center justify-center">No preview available</div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // /* Presets */
// // // const PRESET_KEY = "classified_automation_preset_v2";
// // // function savePreset(data: any) {
// // //   localStorage.setItem(PRESET_KEY, JSON.stringify(data));
// // // }
// // // function loadPreset(): any | null {
// // //   try {
// // //     const raw = localStorage.getItem(PRESET_KEY);
// // //     return raw ? JSON.parse(raw) : null;
// // //   } catch {
// // //     return null;
// // //   }
// // // }

// // // /* Fake uploader (replace with real) */
// // // async function uploadImageAndGetUrl(file: File): Promise<string> {
// // //   return URL.createObjectURL(file);
// // // }

// // // /* Tiny helpers from items */
// // // const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// // // const getItemHtml = (it: GeneratedItem) => (it.html ?? it.generatedContent ?? "").toString();
// // // function getItemKeywords(it: GeneratedItem): string[] {
// // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // //   if (typeof it.keyword === "string")
// // //     return it.keyword
// // //       .split(/[,\|]/)
// // //       .map((s) => s.trim())
// // //       .filter(Boolean);
// // //   return [];
// // // }

// // // /* ─────────────────────────────────────────────────────────────
// // //  * MAIN
// // //  * ──────────────────────────────────────────────────────────*/
// // // export default function ClassifiedAutomationPage() {
// // //   /* Load all generated items */
// // //   const [items, setItems] = useState<GeneratedItem[]>([]);
// // //   useEffect(() => setItems(loadGeneratedItems()), []);

// // //   /* Hook wiring */
// // //   // const {
// // //   //   search,
// // //   //   setSearch,
// // //   //   filteredProjects,
// // //   //   expandedProjectIds,
// // //   //   toggleProjectExpand,
// // //   //   selectedItemIds,
// // //   //   isProjectSelected,
// // //   //   isItemSelected,
// // //   //   setProjectChecked,
// // //   //   setItemChecked,
// // //   //   selectAllVisible,
// // //   //   clearSelection,
// // //   //   setFocusedItemId,
// // //   //   focusedItem,
// // //   //   selectedItems,
// // //   //   start,
// // //   //   isStarting,
// // //   //   jobId,
// // //   //   progress,
// // //   // } = useListingAutomation(items, {
// // //   //   uploadImage: uploadImageAndGetUrl,
// // //   //   statusPollIntervalMs: 1500,
// // //   //   maxPollMinutes: 15,
// // //   //   maxSelectableItems: SITES.length, // ✅ max 7 contents
// // //   //   onMaxExceeded: (max) => toast.error(`Max ${max} contents only (sites limit).`),
// // //   // });

// // //   const {
// // //   search,
// // //   setSearch,
// // //   filteredProjects,
// // //   expandedProjectIds,
// // //   toggleProjectExpand,
// // //   selectedItemIds,
// // //   isProjectSelected,
// // //   isItemSelected,
// // //   setProjectChecked,
// // //   setItemChecked,
// // //   selectAllVisible,
// // //   clearSelection,
// // //   setFocusedItemId,
// // //   focusedItem,
// // //   selectedItems,
// // //   start,
// // //   isStarting,
// // //   jobId,
// // //   progress,
// // //   // status,
// // //   runs,               // <<=== NEW
// // //   // fetchRunDetails,    // <<=== NEW
// // //   downloadRunExcel,   // <<=== NEW
// // // } = useListingAutomation(items, {
// // //   uploadImage: uploadImageAndGetUrl,
// // //   statusPollIntervalMs: 1500,
// // //   maxPollMinutes: 15,
// // //   maxSelectableItems: SITES.length,
// // //   onMaxExceeded: (max) => toast.error(`Max ${max} contents only (sites limit).`),
// // // });

// // //   /* Defaults (apply to all selected items) */
// // //   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
// // //   const [category, setCategory] = useState<string>("");

// // //   // Contact / profile
// // //   const [phone, setPhone] = useState("");
// // //   const [website, setWebsite] = useState("");
// // //   const [email, setEmail] = useState("");

// // //   // Socials
// // //   const [facebook, setFacebook] = useState("");
// // //   const [twitter, setTwitter] = useState("");
// // //   const [linkedin, setLinkedin] = useState("");
// // //   const [pinterest, setPinterest] = useState("");
// // //   const [instagram, setInstagram] = useState("");
// // //   const [yelp, setYelp] = useState("");
// // //   const [gmb, setGmb] = useState("");

// // //   // Address
// // //   const [country, setCountry] = useState("");
// // //   const [state, setStateVal] = useState("");
// // //   const [city, setCity] = useState("");
// // //   const [zip, setZip] = useState("");
// // //   const [line1, setLine1] = useState("");

// // //   // Default image (used if item has none)
// // //   const [imageUrl, setImageUrl] = useState("");
// // //   const [imageFile, setImageFile] = useState<File | null>(null);

// // //   // Sites selection (checkbox multi-select)
// // //   const [selectedSiteValues, setSelectedSiteValues] = useState<Set<string>>(new Set());

// // //   const selectedCount = selectedItems.length;

// // //   const selectedSites = useMemo(() => ALL_SITES.filter((s) => selectedSiteValues.has(s.value)), [selectedSiteValues]);

// // //   const selectedSitesCount = selectedSites.length;

// // //   // Auto-trim sites if items decrease
// // //   useEffect(() => {
// // //     if (selectedCount === 0) {
// // //       setSelectedSiteValues(new Set());
// // //       return;
// // //     }
// // //     if (selectedSiteValues.size <= selectedCount) return;

// // //     setSelectedSiteValues((prev) => {
// // //       const arr = Array.from(prev).slice(0, selectedCount);
// // //       return new Set(arr);
// // //     });
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [selectedCount]);

// // //   function toggleSite(siteValue: string, checked: boolean) {
// // //     setSelectedSiteValues((prev) => {
// // //       const n = new Set(prev);
// // //       if (checked) {
// // //         if (selectedCount === 0) {
// // //           toast.error("Select content first.");
// // //           return prev;
// // //         }
// // //         if (n.size >= selectedCount) {
// // //           toast.error(`You can select only ${selectedCount} site(s).`);
// // //           return prev;
// // //         }
// // //         n.add(siteValue);
// // //       } else {
// // //         n.delete(siteValue);
// // //       }
// // //       return n;
// // //     });
// // //   }

// // //   const readyToStart = selectedCount > 0 && selectedSitesCount === selectedCount;

// // //   // Preset load
// // //   useEffect(() => {
// // //     const p = loadPreset();
// // //     if (p) {
// // //       setPhone(p.phone ?? "");
// // //       setWebsite(p.website ?? "");
// // //       setEmail(p.email ?? "");
// // //       setCountry(p.address?.country ?? "");
// // //       setStateVal(p.address?.state ?? "");
// // //       setCity(p.address?.city ?? "");
// // //       setZip(p.address?.zip ?? "");
// // //       setLine1(p.address?.line1 ?? "");
// // //       setFacebook(p.socials?.facebook ?? "");
// // //       setTwitter(p.socials?.twitter ?? "");
// // //       setLinkedin(p.socials?.linkedin ?? "");
// // //       setPinterest(p.socials?.pinterest ?? "");
// // //       setInstagram(p.socials?.instagram ?? "");
// // //       setYelp(p.socials?.yelp ?? "");
// // //       setGmb(p.socials?.gmb ?? "");

// // //       // load selected sites
// // //       if (Array.isArray(p.sites)) {
// // //         setSelectedSiteValues(new Set(p.sites));
// // //       }
// // //     }
// // //   }, []);

// // //   function handleSavePreset() {
// // //     const socials: Socials = { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb };
// // //     savePreset({
// // //       phone,
// // //       website,
// // //       email,
// // //       address: { country, state, city, zip, line1 },
// // //       socials,
// // //       sites: Array.from(selectedSiteValues),
// // //     });
// // //     toast.success("Preset saved");
// // //   }

// // //   async function handleStart() {
// // //     if (!readyToStart) {
// // //       toast.error("Select content first, then same number of sites.");
// // //       return;
// // //     }
// // //     try {
// // //       const { listings } = await start({
// // //         sites: selectedSites.map((s: any) => ({
// // //           site: s.value,
// // //           username: s.username,
// // //           password: s.password,
// // //           type: s.type ?? "classified",
// // //         })),

// // //         defaults: {
// // //           category,
// // //           keywordsDefaults,
// // //           imageUrl,
// // //           imageFile,
// // //           profile: {
// // //             phone,
// // //             website,
// // //             email,
// // //             socials: { facebook, twitter, linkedin, pinterest, instagram, yelp, gmb },
// // //             address: { country, state, city, zip, line1 },
// // //           },
// // //         },
// // //       });
// // //       toast.success(`Automation started for ${listings} item(s)`);
// // //     } catch (err: any) {
// // //       toast.error(err?.message ?? "Failed to start");
// // //     }
// // //   }

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
// // //       <div className="mx-auto max-w-screen-2xl px-6 py-10">
// // //         {/* Top Header */}
// // //         <PremiumCard>
// // //           <Card className="border-0 shadow-none bg-transparent">
// // //             <CardHeader className="pb-6">
// // //               <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
// // //                 <div className="flex-1">
// // //                   <CardTitle className="flex items-center gap-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
// // //                     <IconListDetails className="h-8 w-8" />
// // //                     Classified Listing Automation
// // //                   </CardTitle>
// // //                   <CardDescription className="text-indigo-600 mt-1 font-medium">Select content → Pick matching sites → Launch Automation</CardDescription>
// // //                 </div>
// // //                 <div className="flex items-center gap-3 w-full lg:w-auto">
// // //                   <div className="relative flex-1 lg:w-[350px]">
// // //                     <IconSearch className="h-5 w-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
// // //                     <Input
// // //                       value={search}
// // //                       onChange={(e) => setSearch(e.target.value)}
// // //                       placeholder="Search by title or keywords…"
// // //                       className="pl-12 bg-white border-indigo-300 rounded-2xl shadow-sm"
// // //                     />
// // //                   </div>
// // //                   <Badge className="rounded-full bg-indigo-100 text-indigo-800 border-indigo-300 px-4 py-2 font-semibold">Selected: {selectedCount}/{SITES.length}</Badge>
// // //                 </div>
// // //               </div>
// // //             </CardHeader>
// // //           </Card>
// // //         </PremiumCard>

// // //         {/* 3-column premium layout with enhanced spacing */}
// // //         <div className="mt-10 grid gap-10 xl:grid-cols-12">
// // //           {/* LEFT (xl: 4) — Projects Panel */}
// // //           <div className="xl:col-span-4">
// // //             <div className="sticky top-8 space-y-6">
// // //               <PremiumCard>
// // //                 <Card className="border-0 shadow-none bg-transparent">
// // //                   <CardHeader className="pb-4">
// // //                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
// // //                       <IconFolder className="h-6 w-6 text-indigo-600" />
// // //                       Content Projects
// // //                     </CardTitle>
// // //                     <CardDescription className="text-indigo-600">Choose projects or specific items for posting.</CardDescription>
// // //                   </CardHeader>
// // //                   <CardContent className="space-y-4">
// // //                     <div className="md:hidden mb-3">
// // //                       <div className="relative">
// // //                         <IconSearch className="h-4 w-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // //                         <Input
// // //                           value={search}
// // //                           onChange={(e) => setSearch(e.target.value)}
// // //                           placeholder="Search title / keywords…"
// // //                           className="pl-9 bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                     </div>

// // //                     <div className="flex items-center justify-between text-sm text-indigo-600">
// // //                       <div className="flex items-center gap-2">
// // //                         <Button
// // //                           variant="outline"
// // //                           size="sm"
// // //                           onClick={selectAllVisible}
// // //                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
// // //                           <IconCircleCheck className="h-4 w-4 mr-2" /> Select All Visible
// // //                         </Button>
// // //                         <Button
// // //                           variant="outline"
// // //                           size="sm"
// // //                           onClick={clearSelection}
// // //                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
// // //                           <IconCircleX className="h-4 w-4 mr-2" /> Clear All
// // //                         </Button>
// // //                       </div>
// // //                       <span className="font-semibold">{filteredProjects.length} Projects</span>
// // //                     </div>

// // //                     <div className="max-h-[650px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300">
// // //                       {filteredProjects.length === 0 && (
// // //                         <div className="text-sm text-indigo-500 py-8 text-center">No content found. Start generating!</div>
// // //                       )}

// // //                       {filteredProjects.map((p, idx) => {
// // //                         const expanded = expandedProjectIds.has(p.id);
// // //                         const projectSelected = isProjectSelected(p.id);
// // //                         const selectedCountInProject = p.items.filter((it) => selectedItemIds.has(it.id)).length;
// // //                         const total = p.items.length;

// // //                         return (
// // //                           <div
// // //                             key={p.id}
// // //                             className="rounded-2xl ring-1 ring-indigo-200/50 bg-white/80 mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
// // //                             {/* Project row */}
// // //                             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
// // //                               <div className="flex items-center gap-4">
// // //                                 <Button
// // //                                   variant="ghost"
// // //                                   size="icon"
// // //                                   onClick={() => toggleProjectExpand(p.id)}
// // //                                   className="h-8 w-8 rounded-full hover:bg-indigo-100"
// // //                                   aria-label={expanded ? "Collapse" : "Expand"}>
// // //                                   {expanded ? (
// // //                                     <IconChevronDown className="h-5 w-5 text-indigo-600" />
// // //                                   ) : (
// // //                                     <IconChevronRight className="h-5 w-5 text-indigo-600" />
// // //                                   )}
// // //                                 </Button>

// // //                                 <Checkbox
// // //                                   checked={projectSelected}
// // //                                   onCheckedChange={(v) => setProjectChecked(p.id, !!v)}
// // //                                   className={cn(
// // //                                     "mr-2 h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // //                                   )}
// // //                                   aria-label="Select project"
// // //                                 />
// // //                                 <span className="text-sm font-bold text-gray-800 tabular-nums">{String(idx + 1).padStart(2, "0") }.</span>
// // //                                 <span className="text-sm font-bold text-gray-900">{p.name}</span>
// // //                               </div>

// // //                               <Badge
// // //                                 variant="outline"
// // //                                 className={cn(
// // //                                   "rounded-full text-sm px-3 py-1",
// // //                                   selectedCountInProject ? "border-indigo-600 text-indigo-700 bg-indigo-100" : "border-indigo-300 text-indigo-500"
// // //                                 )}>
// // //                                 {selectedCountInProject}/{total}
// // //                               </Badge>
// // //                             </div>

// // //                             {/* Items list */}
// // //                             {expanded && (
// // //                               <div className="border-t border-indigo-100 divide-y divide-indigo-50">
// // //                                 {p.items.map((it, iidx) => {
// // //                                   const checked = isItemSelected(it.id);
// // //                                   return (
// // //                                     <div
// // //                                       key={it.id}
// // //                                       className={cn(
// // //                                         "flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 transition-colors",
// // //                                         checked && "bg-indigo-50 ring-1 ring-indigo-200/50"
// // //                                       )}>
// // //                                       <div className="flex items-center gap-4 min-w-0">
// // //                                         <span className="text-xs text-indigo-500 font-semibold w-6 text-right tabular-nums">{iidx + 1}</span>
// // //                                         <Checkbox
// // //                                           checked={checked}
// // //                                           onCheckedChange={(v) => setItemChecked(p.id, it.id, !!v)}
// // //                                           className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // //                                           aria-label="Select item"
// // //                                         />
// // //                                         <button className="text-left min-w-0 flex-1" onClick={() => setFocusedItemId(it.id)}>
// // //                                           <div className="text-base font-semibold text-gray-900 truncate">{(getItemTitle(it) || getItemKeywords(it)[0]) ?? "Untitled"}</div>
// // //                                           <div className="text-sm text-indigo-600 truncate mt-1">{getItemKeywords(it).join(", ")}</div>
// // //                                         </button>
// // //                                       </div>
// // //                                       {checked && <IconCheck className="h-5 w-5 text-indigo-600 flex-shrink-0" />}
// // //                                     </div>
// // //                                   );
// // //                                 })}
// // //                               </div>
// // //                             )}
// // //                           </div>
// // //                         );
// // //                       })}
// // //                     </div>
// // //                   </CardContent>
// // //                 </Card>
// // //               </PremiumCard>
// // //             </div>
// // //           </div>

// // //           {/* CENTER (xl: 5) — Defaults + Preview */}
// // //           <div className="xl:col-span-5 space-y-6">
// // //             <PremiumCard>
// // //               <Card className="border-0 shadow-none bg-transparent">
// // //                 <CardHeader className="pb-5">
// // //                   <CardTitle className="text-xl font-bold text-gray-900">Global Listing Settings</CardTitle>
// // //                   <CardDescription className="text-indigo-600">These defaults will apply across all selected contents.</CardDescription>
// // //                 </CardHeader>
// // //                 <CardContent className="space-y-6">
// // //                   <section className="space-y-3">
// // //                     <PremiumSectionTitle icon={<IconTags className="h-5 w-5" />}>Keyword Enhancements</PremiumSectionTitle>
// // //                     <TagsInput value={keywordsDefaults} onChange={setKeywordsDefaults} />
// // //                   </section>

// // //                   <section className="space-y-3">
// // //                     <PremiumSectionTitle>Primary Category</PremiumSectionTitle>
// // //                     <Select value={category} onValueChange={setCategory}>
// // //                       <SelectTrigger className="bg-white border-indigo-300 rounded-2xl">
// // //                         <SelectValue placeholder="Select a category" />
// // //                       </SelectTrigger>
// // //                       <SelectContent className="rounded-2xl">
// // //                         {CATEGORIES.map((c) => (
// // //                           <SelectItem key={c} value={c} className="rounded-xl">{c}</SelectItem>
// // //                         ))}
// // //                       </SelectContent>
// // //                     </Select>
// // //                   </section>

// // //                   <section className="space-y-3">
// // //                     <PremiumSectionTitle icon={<IconPhoto className="h-5 w-5" />}>Fallback Image</PremiumSectionTitle>
// // //                     <ImagePicker imageUrl={imageUrl} onImageUrlChange={setImageUrl} file={imageFile} onFileChange={setImageFile} />
// // //                     <p className="text-xs text-indigo-600 font-medium">Applies only to items without their own image.</p>
// // //                   </section>

// // //                   <section className="space-y-4">
// // //                     <PremiumSectionTitle icon={<IconMap2 className="h-5 w-5" />}>Location Details</PremiumSectionTitle>
// // //                     <div className="grid gap-4 md:grid-cols-2">
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">Country</Label>
// // //                         <Input value={country} onChange={(e) => setCountry(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">State/Province</Label>
// // //                         <Input value={state} onChange={(e) => setStateVal(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">City</Label>
// // //                         <Input value={city} onChange={(e) => setCity(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">ZIP/Postal Code</Label>
// // //                         <Input value={zip} onChange={(e) => setZip(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                     </div>
// // //                     <div>
// // //                       <Label className="text-sm font-semibold text-gray-700">Street Address</Label>
// // //                       <Input value={line1} onChange={(e) => setLine1(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                     </div>
// // //                   </section>

// // //                   <section className="space-y-4">
// // //                     <PremiumSectionTitle icon={<IconAddressBook className="h-5 w-5" />}>Contact Information</PremiumSectionTitle>
// // //                     <div className="grid gap-4 md:grid-cols-3">
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">Phone</Label>
// // //                         <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">Website</Label>
// // //                         <div className="flex items-center">
// // //                           <IconWorldWww className="h-5 w-5 mr-3 text-indigo-500" />
// // //                           <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="bg-white border-indigo-300 rounded-xl flex-1" />
// // //                         </div>
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">Email</Label>
// // //                         <div className="flex items-center">
// // //                           <IconAt className="h-5 w-5 mr-3 text-indigo-500" />
// // //                           <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-indigo-300 rounded-xl flex-1" />
// // //                         </div>
// // //                       </div>
// // //                     </div>
// // //                   </section>

// // //                   <section className="space-y-4">
// // //                     <PremiumSectionTitle icon={<IconWorld className="h-5 w-5" />}>Social Connections</PremiumSectionTitle>
// // //                     <div className="grid gap-4 md:grid-cols-2">
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700"><IconBrandFacebook className="h-4 w-4 text-blue-600" /> Facebook</Label>
// // //                         <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700"><IconBrandTwitter className="h-4 w-4 text-blue-400" /> Twitter / X</Label>
// // //                         <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700"><IconBrandLinkedin className="h-4 w-4 text-blue-700" /> LinkedIn</Label>
// // //                         <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700"><IconBrandPinterest className="h-4 w-4 text-red-500" /> Pinterest</Label>
// // //                         <Input value={pinterest} onChange={(e) => setPinterest(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700"><IconBrandInstagram className="h-4 w-4 text-pink-500" /> Instagram</Label>
// // //                         <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700"><IconBrandCpp className="h-4 w-4 text-yellow-600" /> Yelp</Label>
// // //                         <Input value={yelp} onChange={(e) => setYelp(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                       <div className="md:col-span-2">
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700"><IconBrandGoogle className="h-4 w-4 text-red-500" /> Google Business</Label>
// // //                         <Input value={gmb} onChange={(e) => setGmb(e.target.value)} className="bg-white border-indigo-300 rounded-xl" />
// // //                       </div>
// // //                     </div>
// // //                   </section>
// // //                 </CardContent>
// // //               </Card>
// // //             </PremiumCard>

// // //             <PremiumCard>
// // //               <Card className="border-0 shadow-none bg-transparent">
// // //                 <CardHeader className="pb-4">
// // //                   <CardTitle className="text-xl font-bold text-gray-900">Live Preview</CardTitle>
// // //                   <CardDescription className="text-indigo-600">Select an item from the left to see a real-time preview here.</CardDescription>
// // //                 </CardHeader>
// // //                 <CardContent className="space-y-5">
// // //                   <div>
// // //                     <Label className="text-sm font-semibold text-gray-700">Listing Title</Label>
// // //                     <Input
// // //                       value={focusedItem ? getItemTitle(focusedItem) : ""}
// // //                       readOnly
// // //                       placeholder="Click an item to preview its title"
// // //                       className="bg-indigo-50/50 border-indigo-300 rounded-xl mt-1 font-semibold"
// // //                     />
// // //                   </div>
// // //                   <div>
// // //                     <Label className="text-sm font-semibold text-gray-700">Description Content</Label>
// // //                     <Textarea
// // //                       value={focusedItem ? getItemHtml(focusedItem) : ""}
// // //                       readOnly
// // //                       placeholder="Click an item to preview its full content"
// // //                       className="min-h-[200px] bg-indigo-50/50 border-indigo-300 rounded-xl mt-1"
// // //                     />
// // //                   </div>
// // //                 </CardContent>
// // //               </Card>
// // //             </PremiumCard>
// // //           </div>

// // //           {/* RIGHT (xl: 3) — Automation Controls */}
// // //           <div className="xl:col-span-3">
// // //             <div className="sticky top-8 space-y-6">
// // //               <PremiumCard>
// // //                 <Card className="border-0 shadow-none bg-transparent">
// // //                   <CardHeader className="pb-5">
// // //                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900"><IconSparkles className="h-6 w-6 text-purple-600" /> Automation Launch</CardTitle>
// // //                     <CardDescription className="text-indigo-600">Match content count with site selections for seamless posting.</CardDescription>
// // //                   </CardHeader>

// // //                   <CardContent className="space-y-6">
// // //                     {/* SITES CHECKBOX LIST */}
// // //                     <section className="space-y-3">
// // //                       <Label className="text-sm font-bold flex items-center gap-3 text-gray-900"><IconGlobe className="h-5 w-5 text-indigo-600" /> Target Sites ({selectedSitesCount}/{selectedCount || 0})</Label>

// // //                       {selectedCount === 0 && (
// // //                         <div className="text-sm text-indigo-500">Begin by selecting content on the left.</div>
// // //                       )}

// // //                       <div className="rounded-2xl ring-1 ring-indigo-200 bg-white/80 divide-y divide-indigo-50 shadow-sm max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300">
// // //                         {ALL_SITES.map((s) => {
// // //                           const isChecked = selectedSiteValues.has(s.value);
// // //                           const disableNew = !isChecked && (selectedSitesCount >= selectedCount || selectedCount === 0);

// // //                           return (
// // //                             <label
// // //                               key={s.value}
// // //                               className={cn(
// // //                                 "flex items-center justify-between gap-4 px-4 py-3 cursor-pointer transition-all hover:bg-indigo-50/50",
// // //                                 isChecked && "bg-indigo-50/80 ring-1 ring-indigo-200/50",
// // //                                 disableNew && "opacity-70 cursor-not-allowed"
// // //                               )}>
// // //                               <div className="flex items-center gap-3 min-w-0">
// // //                                 <Checkbox
// // //                                   checked={isChecked}
// // //                                   disabled={disableNew}
// // //                                   onCheckedChange={(v) => toggleSite(s.value, !!v)}
// // //                                   className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // //                                 />
// // //                                 <span className="text-base font-semibold text-gray-900 truncate">{s.label}</span>
// // //                               </div>

// // //                               <Badge variant="outline" className="rounded-full text-xs px-3 py-1 bg-indigo-100 border-indigo-300 text-indigo-700">1 Slot</Badge>
// // //                             </label>
// // //                           );
// // //                         })}
// // //                       </div>

// // //                       <p className="text-xs text-indigo-600 font-medium">Pro Tip: {selectedCount} contents require exactly {selectedCount} sites.</p>
// // //                     </section>

// // //                     <Separator className="border-indigo-200" />

// // //                     <div className="grid gap-4">
// // //                       <Button
// // //                         onClick={handleStart}
// // //                         disabled={!readyToStart || isStarting}
// // //                         className={cn(
// // //                           "rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 h-12 font-bold text-lg",
// // //                           !readyToStart && "opacity-70 cursor-not-allowed"
// // //                         )}>
// // //                         <IconPlayerPlay className="h-5 w-5 mr-3" />
// // //                         {isStarting ? "Launching…" : `Launch Now (${selectedCount})`}
// // //                       </Button>

// // //                       <div className="flex items-center justify-between text-sm text-indigo-600">
// // //                         <span className="flex items-center gap-2 font-medium"><IconCheck className="h-4 w-4" />{selectedCount} Contents Ready</span>
// // //                         <span className="flex items-center gap-2 font-medium"><IconGlobe className="h-4 w-4" />{selectedSitesCount} Sites Locked</span>
// // //                       </div>

// // //                       {jobId && (
// // //                         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // //                           <div className="flex items-center justify-between text-sm text-indigo-600 mb-3 font-medium">
// // //                             <span>Job ID: {jobId}</span>
// // //                             <span>{progress}% Complete</span>
// // //                           </div>
// // //                           <Progress value={progress} className="h-3 bg-indigo-200 rounded-full" />
// // //                         </div>
// // //                       )}

// // //                       {/* BACKLINKS + LOGS + RUN HISTORY PANEL */}
// // // {/* BACKLINKS + LOGS + RUN HISTORY PANEL */}

// // // {/* BACKLINKS + LOGS + RUN HISTORY PANEL */}
// // // {runs.length > 0 && (
// // //   <div className="mt-6 rounded-2xl ring-1 ring-indigo-200 bg-white/80 p-4 border border-indigo-100 shadow">
// // //     <h3 className="text-lg font-bold text-gray-900 mb-3 flex justify-between items-center">
// // //       Run Results

// // //       {/* COPY ALL BUTTON */}
// // //       <Button
// // //         size="sm"
// // //         className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
// // //         onClick={() => {
// // //           const all = runs
// // //             .flatMap((r) => r.backlinks || [])
// // //             .join("\n");
// // //           navigator.clipboard.writeText(all);
// // //           toast.success("All backlinks copied!");
// // //         }}
// // //       >
// // //         Copy All
// // //       </Button>
// // //     </h3>

// // //     {runs.map((run) => (
// // //       <div
// // //         key={run.jobId}
// // //         className="mb-6 rounded-xl border border-indigo-200 p-4 bg-indigo-50/40"
// // //       >
// // //         {/* HEADER */}
// // //         <div className="flex justify-between items-center mb-3">
// // //           <div className="font-semibold text-indigo-700">
// // //             Job: {run.jobId}
// // //           </div>
// // //           <Badge
// // //             className={`rounded-full px-3 py-1 ${
// // //               run.status === "done"
// // //                 ? "bg-green-100 text-green-700 border-green-300"
// // //                 : run.status === "error"
// // //                 ? "bg-red-100 text-red-700 border-red-300"
// // //                 : "bg-indigo-100 text-indigo-700 border-indigo-300"
// // //             }`}
// // //           >
// // //             {run.status}
// // //           </Badge>
// // //         </div>

// // //         {/* PROGRESS */}
// // //         <Progress value={run.progress} className="h-2 mb-4" />

// // //         {/* ★★ NEW CLEAN BACKLINK DISPLAY ★★ */}
// // //         {(run.backlinks?.length ?? 0) > 0 && (
// // //           <div className="mb-4">
// // //             <div className="font-semibold text-gray-900 mb-2">
// // //               Backlinks (Site → URL)
// // //             </div>

// // //             <div className="space-y-2">
// // //               {run.backlinks?.map((link, idx) => {
// // //                 const url = new URL(link);
// // //                 const hostname = url.hostname.replace("www.", "");

// // //                 return (
// // //                   <div
// // //                     key={idx}
// // //                     className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-200 shadow-sm"
// // //                   >
// // //                     {/* SITE NAME */}
// // //                     <div className="font-semibold text-gray-800 text-sm">
// // //                       {hostname}
// // //                     </div>

// // //                     {/* CLICKABLE LINK */}
// // //                     <a
// // //                       href={link}
// // //                       target="_blank"
// // //                       className="text-indigo-700 underline text-sm truncate max-w-[200px]"
// // //                     >
// // //                       {link}
// // //                     </a>

// // //                     {/* COPY BUTTON */}
// // //                     <Button
// // //                       size="sm"
// // //                       variant="outline"
// // //                       className="rounded-full border-indigo-300 text-indigo-700 hover:bg-indigo-50"
// // //                       onClick={() => {
// // //                         navigator.clipboard.writeText(link);
// // //                         toast.success("Link copied!");
// // //                       }}
// // //                     >
// // //                       Copy
// // //                     </Button>
// // //                   </div>
// // //                 );
// // //               })}
// // //             </div>
// // //           </div>
// // //         )}

// // //         {/* LOGS */}
// // //         {(run.logs ?? []).length > 0 && (
// // //           <details className="mt-3">
// // //             <summary className="cursor-pointer text-sm font-semibold text-indigo-700">
// // //               View Logs
// // //             </summary>
// // //             <div className="mt-2 bg-white p-3 rounded-xl border border-indigo-200 max-h-40 overflow-auto text-xs text-gray-700 whitespace-pre-wrap">
// // //               {(run.logs ?? []).join("\n")}
// // //             </div>
// // //           </details>
// // //         )}

// // //         {/* EXPORT */}
// // //         {run.status === "done" && (
// // //           <Button
// // //             size="sm"
// // //             className="mt-4 rounded-full bg-indigo-600 hover:bg-indigo-700"
// // //             onClick={() => downloadRunExcel(run.jobId)}
// // //           >
// // //             Download Excel
// // //           </Button>
// // //         )}
// // //       </div>
// // //     ))}
// // //   </div>
// // // )}

// // //                     </div>
// // //                   </CardContent>
// // //                 </Card>
// // //               </PremiumCard>

// // //               <div className="rounded-2xl ring-1 ring-indigo-200 bg-white shadow-lg p-5 text-sm text-gray-800 border border-indigo-100/50">
// // //                 <p className="mb-2 flex items-center gap-2">✅ <b>Workflow:</b> Contents → Sites → Launch</p>
// // //                 <p className="mb-4">🚀 <b>API Target:</b> <code className="bg-indigo-100 px-2 py-1 rounded text-indigo-800 font-mono">/api/automation/start</code> (1 per site)</p>
// // //                 <div className="flex items-center gap-3">
// // //                   <Button variant="outline" onClick={handleSavePreset} className="rounded-full border-indigo-300 hover:bg-indigo-50">💾 Save Config</Button>
// // //                   <Badge className="rounded-full bg-purple-100 text-purple-800 border-purple-300">Premium: 7 Sites Max</Badge>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //         {/* /grid */}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // import React, { useEffect, useMemo, useState } from "react";
// // // import {
// // //   Card,
// // //   CardContent,
// // //   CardDescription,
// // //   CardHeader,
// // //   CardTitle,
// // // } from "@/components/ui/card";
// // // import { Button } from "@/components/ui/button";
// // // import { Badge } from "@/components/ui/badge";
// // // import { Input } from "@/components/ui/input";
// // // import { Label } from "@/components/ui/label";
// // // import { Textarea } from "@/components/ui/textarea";
// // // import { Separator } from "@/components/ui/separator";
// // // import { Progress } from "@/components/ui/progress";
// // // import { Checkbox } from "@/components/ui/checkbox";
// // // import { toast } from "sonner";
// // // import { cn } from "@/lib/utils";
// // // import {
// // //   Select,
// // //   SelectContent,
// // //   SelectItem,
// // //   SelectTrigger,
// // //   SelectValue,
// // // } from "@/components/ui/select";
// // // import {
// // //   IconWorld,
// // //   IconListDetails,
// // //   IconPlayerPlay,
// // //   IconSparkles,
// // //   IconAddressBook,
// // //   IconTags,
// // //   IconMap2,
// // //   IconPhoto,
// // //   IconWorldWww,
// // //   IconAt,
// // //   IconBrandFacebook,
// // //   IconBrandTwitter,
// // //   IconBrandLinkedin,
// // //   IconBrandPinterest,
// // //   IconBrandInstagram,
// // //   IconBrandCpp, // Yelp placeholder
// // //   IconBrandGoogle,
// // //   IconChevronDown,
// // //   IconChevronRight,
// // //   IconSearch,
// // //   IconFolder,
// // //   IconCheck,
// // //   IconCircleCheck,
// // //   IconCircleX,
// // //   IconGlobe,
// // // } from "@tabler/icons-react";
// // // import {
// // //   useListingAutomation,
// // //   type GeneratedItem,
// // //   type Socials,
// // // } from "./hooks/useListingAutomation";

// // // /* ─────────────────────────────────────────────────────────────
// // //  * Constants - Full 50+ Sites List (Merged, Dummies Added)
// // //  * ────────────────────────────────────────────────────────────*/
// // // const CATEGORIES = [
// // //   "Electronics",
// // //   "Home & Garden",
// // //   "Vehicles",
// // //   "Jobs",
// // //   "Services",
// // //   "Real Estate",
// // //   "Pets",
// // //   "Books",
// // //   "Fashion",
// // //   "Sports",
// // //   "UK",
// // //   "Rajasthan",
// // //   "Punjab",
// // //   "Maharashtra",
// // //   "Gujarat",
// // //   "Tamil Nadu",
// // //   "Kerala",
// // //   "West Bengal",
// // //   "Karnataka",
// // //   "Andhra Pradesh",
// // //   "Telangana",

// // //   "Odisha",
// // //   "Bihar",
// // //   "Chhattisgarh",
// // //   "Uttar Pradesh",
// // //   "Haryana",
// // //   "Delhi",
// // // ];

// // // const ALL_WORDPRESS_SITES = [
// // //   // Original SITES (treated as WP now)
// // //   // {
// // //   //   value: "proclassifiedads.com",
// // //   //   label: "proclassifiedads.com (Guest Posting)",
// // //   //   username: "Zoran",
// // //   //   password: "XsujZnakXKuqZ@&e(o3qSr@!",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "classifiedsposts.com",
// // //   //   label: "classifiedsposts.com (Guest Posting)",
// // //   //   username: "Fyren",
// // //   //   password: "AEsB%COsrw#!NHp@IaDSpFXs",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "globaladsclassifieds.com",
// // //   //   label: "globaladsclassifieds.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "ZAe!M8TbBt$8T(xYTaL%n1yd",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "onlineclassifiedsads.com",
// // //   //   label: "onlineclassifiedsads.com (Guest Posting)",
// // //   //   username: "Velyn",
// // //   //   password: "oWujA^FC88qcteDObVP8h4FD",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "thelocanto.com",
// // //   //   label: "thelocanto.com (Guest Posting)",
// // //   //   username: "Tarka",
// // //   //   password: "08uNArlcpnHiihxRz)ubwivK",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "true-finders.com",
// // //   //   label: "true-finders.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "Zl^lEUbc(&)(GbcY^Nkxp@Gt",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "proadvertiser.org",
// // //   //   label: "proadvertiser.org (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "x&w^XfmST*xino6U&FD1$fp5",
// // //   //   type: "wordpress",
// // //   // },
// // //   // Original WORDPRESS_SITES (kept as-is)
// // //   /* Replace your existing ALL_SITES with this complete list */

// // //   {
// // //     value: "linuxpatent.com",
// // //     label: "linuxpatent.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "vSvd cd8e aY9V E9vy EtU9 bkAi",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "rayseries.com",
// // //     label: "rayseries.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "P2kl EHRS 6gLi drVQ 4Xb0 TIlR",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "pasfait.com",
// // //     label: "pasfait.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "rYXn vala ZImc guqH jHg1 yAbF",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "scotchsavvy.com",
// // //     label: "scotchsavvy.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "pNfP EhU6 BhVi pHPC vT7u Gh7Z",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "extremesportsgoons.info",
// // //     label: "extremesportsgoons.info (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "S2ll 7cby lhda nab6 XzIG vCyk",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "creeksidereflections.com",
// // //     label: "creeksidereflections.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "Fqcl hdHo ipZ2 l4CK Sbmn Tat4",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "PiratesGab.com",
// // //     label: "PiratesGab.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "jRFw Vqoi 3Xj5 TQAy koRx 09z0",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "theSportchampion.com",
// // //     label: "theSportchampion.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "7Bjq nNmf b4Zf BX5A Lujg SQhl",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "DataDrillAmerAsia.com",
// // //     label: "DataDrillAmerAsia.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "3Zpc ouuZ 4y4q 3Txk ceC2 Hi2Y",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "htpsouthdowns.com",
// // //     label: "htpsouthdowns.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "aGzE azG9 22VN iuQC T1x3 fW8x",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "UsJobSandGigs.com",
// // //     label: "UsJobSandGigs.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "OA81 7Ime Clim kHmt 5wi7 Ezac",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "VictoriesSport.com",
// // //     label: "VictoriesSport.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "csSb IsEN Wx5b X6qm xgFC tvaH",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "veroniquelacoste.com",
// // //     label: "veroniquelacoste.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "74J7 vJxc qH5O 41a8 CeWn uDLH",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "missonthemove.com",
// // //     label: "missonthemove.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "WVU9 IFtJ Ohme L7jg 1ibA 939a",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "pcnfa.com",
// // //     label: "pcnfa.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "1h46 Esbn jy3k Dh5e l3O6 cSXQ",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "theangelfilm.com",
// // //     label: "theangelfilm.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "eU2M XhWw 3DUP um7z II8F Db1W",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "soerq.com",
// // //     label: "soerq.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "eU2M XhWw 3DUP um7z II8F Db1W",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "paydayard.com",
// // //     label: "paydayard.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "05d8 CuBb 23Iu eaU0 C165 dx9J",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "trekbadlands.com",
// // //     label: "trekbadlands.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "K01N zsGd 6Y2Z fxTo JWbL lLab",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "pawmeism.com",
// // //     label: "pawmeism.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "hDNV z0Vy rQTu PAqI 1D5A ELgv",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "demokore.com",
// // //     label: "demokore.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "q5fC VDeX 4os5 sUr6 J2RU pSxY",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "moviemotives.com",
// // //     label: "moviemotives.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "ScpA VN2X EccU iofU Aohq saoNScpA VN2X EccU iofU Aohq saoN",
// // //     type: "wordpress",
// // //   },
// // //   // {
// // //   //   value: "apktowns.com",
// // //   //   label: "apktowns.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "oCMtxX%rq$eWkltsntabddZ5",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "mallorcasupport.com",
// // //   //   label: "mallorcasupport.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "z*A@N$8pGPhsmuF%YbQxz27y",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "manageprinters.com",
// // //   //   label: "manageprinters.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "9waZ0Fig2&X!BaqO5LTBLAhN",
// // //   //   type: "wordpress",
// // //   // },
// // //   {
// // //     value: "mitchellstover.com",
// // //     label: "mitchellstover.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "GRHW uOKp XHko fco3 ae6L iQvl",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "fametize.com",
// // //     label: "fametize.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "MqSV Ap8X fI39 X50H OzcC WJmc",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "luocsu.com",
// // //     label: "luocsu.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "wgKC TTYQ mP0d cOek lSDt Ooy7",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "inststagram.com",
// // //     label: "inststagram.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "JDYO 88vG J16G ot8u PMzM od0J",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "ashopear.com",
// // //     label: "ashopear.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "zD91 Q3AR xfq1 lo2B wKDV Ad9m",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "charles6767.com",
// // //     label: "charles6767.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "N3il WPF1 XcUf HNHA ntTO ukDC",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "berlintype.com",
// // //     label: "berlintype.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "TBqx iSM7 Tc0c ige4 2tTO 958e",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "sprintcybermonday.com",
// // //     label: "sprintcybermonday.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "ZU2e xkY1 adLg JPsN MhvU pIrM",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "jamesvirtudazo.com",
// // //     label: "jamesvirtudazo.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "zDCU TmdE sh4k FHRv wwtU 4t4K",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "partyprivee.com",
// // //     label: "partyprivee.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "zqqk JFzo peli 1NuW jJoU e4eT",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "launcheell.com",
// // //     label: "launcheell.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "HVMo ezSe 9Dew GyT6 AXfK s0BG",
// // //     type: "wordpress",
// // //   },
// // //   // {
// // //   //   value: "bridge-busan.com",
// // //   //   label: "bridge-busan.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "ClOy 5Y4z 7snl JwD7 COv4 Re96",
// // //   //   type: "wordpress",
// // //   // },
// // //   {
// // //     value: "cruitholidayhome.com",
// // //     label: "cruitholidayhome.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "oNeJ n9x7 KcL3 lnJ6 xGxE CdDG",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "yhbdvideo.com",
// // //     label: "yhbdvideo.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "oNeJ n9x7 KcL3 lnJ6 xGxE CdDG",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "hmboot.com",
// // //     label: "hmboot.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "DRf7 Wh6i 5G2W gLVi 6I7J 2ZwG",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "allaboutlaptop.com",
// // //     label: "allaboutlaptop.com (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "8CfX jdb4 fFS6 McTU CyEN 1nHL",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "photosdp.net",
// // //     label: "photosdp.net (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "o02P LuIY NCIw jHjv himW 3Zqe",
// // //     type: "wordpress",
// // //   },

// // //   /* user-provided specific entries */
// // //   {
// // //     value: "melanzona.com",
// // //     label: "melanzona.com (Guest Posting)",
// // //     username: "Hal",
// // //     password: "K5Cm DGdD YNOu AsHD oP1D oUYy",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "jutzstuff.com",
// // //     label: "jutzstuff.com (Guest Posting)",
// // //     username: "Eli",
// // //     password: "fyYX RwbX Tybp jIvZ XcXo perK",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "mypracticemaxx.com",
// // //     label: "mypracticemaxx.com (Guest Posting)",
// // //     username: "Roz",
// // //     password: "EL1E qnHZ U62o HrHI 79vH DiVB",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "vuepella.com",
// // //     label: "vuepella.com (Guest Posting)",
// // //     username: "Ike",
// // //     password: "9oO1 brtb atQ4 FnjA SAKo wmWO",
// // //     type: "wordpress",
// // //   },
// // //   {
// // //     value: "tfajtrading.com",
// // //     label: "tfajtrading.com (Guest Posting)",
// // //     username: "Fay",
// // //     password: "P2VX xq4F LN5I gonc y0K2 UfsT",
// // //     type: "wordpress",
// // //   },

// // //   /* Additional dummies / fallback entries (user can replace credentials later) */
// // //   {
// // //     value: "postmyads.org",
// // //     label: "postmyads.org (Guest Posting)",
// // //     username: "FlowTrack",
// // //     password: "94FL ejV8 PYyb bKsJ 5sNj 4s3t",
// // //     type: "wordpress",
// // //   },
// // //   // {
// // //   //   value: "proclassifiedads.com",
// // //   //   label: "proclassifiedads.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "@c%g4qOpC5JCwQe8&7ebSOvQ",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "classifiedsposts.com",
// // //   //   label: "classifiedsposts.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "mL2b657fL4Tqiir7^pvPV*)R",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "classifiedsadpost.com",
// // //   //   label: "classifiedsadpost.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "$9%j34rkEMot&VNopFrfbfg9",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "globaladsclassifieds.com",
// // //   //   label: "globaladsclassifieds.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "ZAe!M8TbBt$8T(xYTaL%n1yd",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "onlineclassifiedsads.com",
// // //   //   label: "onlineclassifiedsads.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "SaN7DM7b%l&VpU^&NKhPpIa5",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "thelocanto.com",
// // //   //   label: "thelocanto.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "!K3pgzW1JfUtMSnUC1&*SAUt",
// // //   //   type: "wordpress",
// // //   // },
// // //   // {
// // //   //   value: "true-finders.com",
// // //   //   label: "true-finders.com (Guest Posting)",
// // //   //   username: "FlowTrack",
// // //   //   password: "Zl^lEUbc(&)(GbcY^Nkxp@Gt",
// // //   //   type: "wordpress",
// // //   // },

// // //   /* small set of extras kept as admin/dummy for replacement */

// // //   // Add more dummies as needed up to 50+ - truncated for brevity, replicate pattern
// // //   // e.g.
// // //   // {
// // //   //   value: "another-site.com",
// // //   //   label: "another-site.com (Guest Posting)",
// // //   //   username: "admin",
// // //   //   password: "dummy123",
// // //   //   type: "wordpress",
// // //   // },
// // // ];

// // // const ALL_SITES = ALL_WORDPRESS_SITES; // Merged into one list

// // // /* ─────────────────────────────────────────────────────────────
// // //  * Local-storage loader
// // //  * ──────────────────────────────────────────────────────────*/
// // // function loadGeneratedItems(): GeneratedItem[] {
// // //   const keys = ["content_items_v1", "content-items", "seomatic_content_items"];
// // //   for (const k of keys) {
// // //     try {
// // //       const raw = localStorage.getItem(k);
// // //       if (raw) {
// // //         const arr = JSON.parse(raw);
// // //         if (Array.isArray(arr)) return arr;
// // //       }
// // //     } catch {}
// // //   }
// // //   try {
// // //     const raw =
// // //       sessionStorage.getItem("open-content-item_v1") ??
// // //       localStorage.getItem("open-content-item_v1_fallback");
// // //     if (raw) {
// // //       const it = JSON.parse(raw);
// // //       if (it && typeof it === "object") return [it];
// // //     }
// // //   } catch {}
// // //   return [];
// // // }

// // // /* ─────────────────────────────────────────────────────────────
// // //  * UI Helpers
// // //  * ──────────────────────────────────────────────────────────*/
// // // function PremiumCard({ children }: { children: React.ReactNode }) {
// // //   return (
// // //     <div className="rounded-3xl ring-1 ring-indigo-200/50 bg-gradient-to-br from-white via-indigo-50/30 to-white shadow-xl overflow-hidden border border-indigo-100/50">
// // //       <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
// // //       {children}
// // //     </div>
// // //   );
// // // }
// // // function PremiumSectionTitle({
// // //   icon,
// // //   children,
// // // }: {
// // //   icon?: React.ReactNode;
// // //   children: React.ReactNode;
// // // }) {
// // //   return (
// // //     <div className="flex items-center gap-3 text-base font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text ">
// // //       {icon}
// // //       {children}
// // //     </div>
// // //   );
// // // }

// // // /* Tags Input */
// // // function TagsInput({
// // //   value,
// // //   onChange,
// // //   placeholder = "Type keyword and press Enter",
// // // }: {
// // //   value: string[];
// // //   onChange: (tags: string[]) => void;
// // //   placeholder?: string;
// // // }) {
// // //   const [draft, setDraft] = useState("");
// // //   function addTagFromDraft() {
// // //     const parts = draft
// // //       .split(/[,\n]/)
// // //       .map((s) => s.trim())
// // //       .filter(Boolean);
// // //     if (parts.length) {
// // //       const set = new Set([...value, ...parts]);
// // //       onChange(Array.from(set));
// // //       setDraft("");
// // //     }
// // //   }
// // //   return (
// // //     <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // //       <div className="flex flex-wrap gap-2 mb-3">
// // //         {value.map((t) => (
// // //           <span
// // //             key={t}
// // //             className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-800 px-3 py-1.5 text-sm ring-1 ring-indigo-300/50 shadow-sm">
// // //             <IconTags className="h-3.5 w-3.5" />
// // //             {t}
// // //             <button
// // //               onClick={() => onChange(value.filter((x) => x !== t))}
// // //               className="ml-1 hover:text-indigo-900 transition-colors"
// // //               aria-label={`Remove ${t}`}>
// // //               ×
// // //             </button>
// // //           </span>
// // //         ))}
// // //       </div>
// // //       <Input
// // //         value={draft}
// // //         onChange={(e) => setDraft(e.target.value)}
// // //         onKeyDown={(e) => {
// // //           if (e.key === "Enter") {
// // //             e.preventDefault();
// // //             addTagFromDraft();
// // //           }
// // //           if (e.key === "Backspace" && !draft && value.length) {
// // //             onChange(value.slice(0, -1));
// // //           }
// // //         }}
// // //         placeholder={placeholder}
// // //         className="bg-white border-indigo-300"
// // //       />
// // //       <p className="text-xs text-indigo-600 mt-2 font-medium">
// // //         Use Enter or comma to add
// // //       </p>
// // //     </div>
// // //   );
// // // }

// // // /* Image Picker */
// // // function ImagePicker({
// // //   imageUrl,
// // //   onImageUrlChange,
// // //   file,
// // //   onFileChange,
// // // }: {
// // //   imageUrl: string;
// // //   onImageUrlChange: (v: string) => void;
// // //   file: File | null;
// // //   onFileChange: (f: File | null) => void;
// // // }) {
// // //   const [previewUrl, setPreviewUrl] = useState<string>("");
// // //   useEffect(() => {
// // //     if (file) {
// // //       const u = URL.createObjectURL(file);
// // //       setPreviewUrl(u);
// // //       return () => {
// // //         URL.revokeObjectURL(u);
// // //       };
// // //     }
// // //     setPreviewUrl(imageUrl || "");
// // //   }, [file, imageUrl]);
// // //   const preview = previewUrl;
// // //   return (
// // //     <div className="grid gap-4">
// // //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // //         <div>
// // //           <Label className="text-sm font-semibold text-gray-700">
// // //             Image URL
// // //           </Label>
// // //           <Input
// // //             placeholder="https://example.com/image.jpg"
// // //             value={imageUrl}
// // //             onChange={(e) => onImageUrlChange(e.target.value)}
// // //             className="bg-white border-indigo-300"
// // //           />
// // //         </div>
// // //         <div>
// // //           <Label className="text-sm font-semibold text-gray-700">
// // //             Upload Image
// // //           </Label>
// // //           <div className="flex items-center gap-3">
// // //             <Input
// // //               type="file"
// // //               accept="image/*"
// // //               className="bg-white border-indigo-300"
// // //               onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
// // //             />
// // //             {file && (
// // //               <Badge
// // //                 variant="outline"
// // //                 className="rounded-full bg-indigo-100 border-indigo-300 text-indigo-700">
// // //                 {file.name}
// // //               </Badge>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //       {preview ? (
// // //         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // //           <img
// // //             src={preview}
// // //             alt="preview"
// // //             className="max-h-64 w-full rounded-xl object-cover shadow-md"
// // //           />
// // //         </div>
// // //       ) : (
// // //         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-100/50 p-6 text-sm text-indigo-500 flex items-center justify-center">
// // //           No preview available
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // /* Presets */
// // // const PRESET_KEY = "classified_automation_preset_v2";
// // // function savePreset(data: any) {
// // //   localStorage.setItem(PRESET_KEY, JSON.stringify(data));
// // // }
// // // function loadPreset(): any | null {
// // //   try {
// // //     const raw = localStorage.getItem(PRESET_KEY);
// // //     return raw ? JSON.parse(raw) : null;
// // //   } catch {
// // //     return null;
// // //   }
// // // }

// // // /* Fake uploader (replace with real if needed) */
// // // async function uploadImageAndGetUrl(file: File): Promise<string> {
// // //   return URL.createObjectURL(file); // Placeholder - hook handles real upload
// // // }

// // // /* Tiny helpers from items */
// // // const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// // // const getItemHtml = (it: GeneratedItem) =>
// // //   (it.html ?? it.generatedContent ?? "").toString();
// // // function getItemKeywords(it: GeneratedItem): string[] {
// // //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// // //   if (typeof it.keyword === "string")
// // //     return it.keyword
// // //       .split(/[,\|]/)
// // //       .map((s) => s.trim())
// // //       .filter(Boolean);
// // //   return [];
// // // }

// // // /* ─────────────────────────────────────────────────────────────
// // //  * MAIN
// // //  * ──────────────────────────────────────────────────────────*/
// // // export default function ClassifiedAutomationPage() {
// // //   /* Load all generated items */
// // //   const [items, setItems] = useState<GeneratedItem[]>([]);
// // //   useEffect(() => setItems(loadGeneratedItems()), []);

// // //   /* Hook wiring */
// // //   const {
// // //     search,
// // //     setSearch,
// // //     filteredProjects,
// // //     expandedProjectIds,
// // //     toggleProjectExpand,
// // //     // selectedProjectIds,
// // //     selectedItemIds,
// // //     isProjectSelected,
// // //     isItemSelected,
// // //     setProjectChecked,
// // //     setItemChecked,
// // //     selectAllVisible,
// // //     clearSelection,
// // //     setFocusedItemId,
// // //     focusedItem,
// // //     selectedItems,
// // //     start,
// // //     isStarting,
// // //     jobId,
// // //     progress,
// // //     status,
// // //     runs,
// // //     downloadRunExcel,
// // //   } = useListingAutomation(items, {
// // //     uploadImage: uploadImageAndGetUrl,
// // //     statusPollIntervalMs: 1500,
// // //     maxPollMinutes: 15,
// // //     maxSelectableItems: ALL_SITES.length,
// // //     onMaxExceeded: (max) =>
// // //       toast.error(`Max ${max} contents only (sites limit).`),
// // //   });

// // //   /* Defaults (apply to all selected items) */
// // //   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
// // //   const [category, setCategory] = useState<string>("");
// // //   // Contact / profile
// // //   const [phone, setPhone] = useState("");
// // //   const [website, setWebsite] = useState("");
// // //   const [email, setEmail] = useState("");
// // //   // Socials
// // //   const [facebook, setFacebook] = useState("");
// // //   const [twitter, setTwitter] = useState("");
// // //   const [linkedin, setLinkedin] = useState("");
// // //   const [pinterest, setPinterest] = useState("");
// // //   const [instagram, setInstagram] = useState("");
// // //   const [yelp, setYelp] = useState("");
// // //   const [gmb, setGmb] = useState("");
// // //   // Address
// // //   const [country, setCountry] = useState("");
// // //   const [state, setStateVal] = useState("");
// // //   const [city, setCity] = useState("");
// // //   const [zip, setZip] = useState("");
// // //   const [line1, setLine1] = useState("");
// // //   // Default image
// // //   const [imageUrl, setImageUrl] = useState("");
// // //   const [imageFile, setImageFile] = useState<File | null>(null);
// // //   // Sites selection
// // //   const [selectedSiteValues, setSelectedSiteValues] = useState<Set<string>>(
// // //     new Set()
// // //   );
// // //   const selectedCount = selectedItems.length;
// // //   const selectedSites = useMemo(
// // //     () => ALL_SITES.filter((s) => selectedSiteValues.has(s.value)),
// // //     [selectedSiteValues]
// // //   );
// // //   const selectedSitesCount = selectedSites.length;
// // //   // Auto-trim sites if items decrease
// // //   useEffect(() => {
// // //     if (selectedCount === 0) {
// // //       setSelectedSiteValues(new Set());
// // //       return;
// // //     }
// // //     if (selectedSiteValues.size <= selectedCount) return;
// // //     setSelectedSiteValues((prev) => {
// // //       const arr = Array.from(prev).slice(0, selectedCount);
// // //       return new Set(arr);
// // //     });
// // //   }, [selectedCount]);
// // //   function toggleSite(siteValue: string, checked: boolean) {
// // //     setSelectedSiteValues((prev) => {
// // //       const n = new Set(prev);
// // //       if (checked) {
// // //         if (selectedCount === 0) {
// // //           toast.error("Select content first.");
// // //           return prev;
// // //         }
// // //         if (n.size >= selectedCount) {
// // //           toast.error(`You can select only ${selectedCount} site(s).`);
// // //           return prev;
// // //         }
// // //         n.add(siteValue);
// // //       } else {
// // //         n.delete(siteValue);
// // //       }
// // //       return n;
// // //     });
// // //   }
// // //   const readyToStart =
// // //     selectedCount > 0 && selectedSitesCount === selectedCount;

// // //   // Preset load
// // //   useEffect(() => {
// // //     const p = loadPreset();
// // //     if (p) {
// // //       setPhone(p.phone ?? "");
// // //       setWebsite(p.website ?? "");
// // //       setEmail(p.email ?? "");
// // //       setCountry(p.address?.country ?? "");
// // //       setStateVal(p.address?.state ?? "");
// // //       setCity(p.address?.city ?? "");
// // //       setZip(p.address?.zip ?? "");
// // //       setLine1(p.address?.line1 ?? "");
// // //       setFacebook(p.socials?.facebook ?? "");
// // //       setTwitter(p.socials?.twitter ?? "");
// // //       setLinkedin(p.socials?.linkedin ?? "");
// // //       setPinterest(p.socials?.pinterest ?? "");
// // //       setInstagram(p.socials?.instagram ?? "");
// // //       setYelp(p.socials?.yelp ?? "");
// // //       setGmb(p.socials?.gmb ?? "");
// // //       if (Array.isArray(p.sites)) {
// // //         setSelectedSiteValues(new Set(p.sites));
// // //       }
// // //     }
// // //   }, []);

// // //   function handleSavePreset() {
// // //     const socials: Socials = {
// // //       facebook,
// // //       twitter,
// // //       linkedin,
// // //       pinterest,
// // //       instagram,
// // //       yelp,
// // //       gmb,
// // //     };
// // //     savePreset({
// // //       phone,
// // //       website,
// // //       email,
// // //       address: { country, state, city, zip, line1 },
// // //       socials,
// // //       sites: Array.from(selectedSiteValues),
// // //     });
// // //     toast.success("Preset saved");
// // //   }

// // //   async function handleStart() {
// // //     if (!readyToStart) {
// // //       toast.error("Select content first, then same number of sites.");
// // //       return;
// // //     }
// // //     try {
// // //       const { listings } = await start({
// // //         sites: selectedSites.map((s: any) => ({
// // //           site: s.value,
// // //           username: s.username,
// // //           password: s.password,
// // //           type: s.type ?? "wordpress",
// // //         })),
// // //         defaults: {
// // //           category,
// // //           keywordsDefaults,
// // //           imageUrl,
// // //           imageFile,
// // //           profile: {
// // //             phone,
// // //             website,
// // //             email,
// // //             socials: {
// // //               facebook,
// // //               twitter,
// // //               linkedin,
// // //               pinterest,
// // //               instagram,
// // //               yelp,
// // //               gmb,
// // //             },
// // //             address: { country, state, city, zip, line1 },
// // //           },
// // //         },
// // //       });
// // //       toast.success(`Direct WP publishing started for ${listings} item(s)`);
// // //     } catch (err: any) {
// // //       toast.error(err?.message ?? "Failed to start publishing");
// // //     }
// // //   }

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
// // //       <div className="mx-auto max-w-screen-2xl px-6 py-10">
// // //         {/* Top Header */}
// // //         <PremiumCard>
// // //           <Card className="border-0 shadow-none bg-transparent">
// // //             <CardHeader className="pb-6">
// // //               <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
// // //                 <div className="flex-1">
// // //                   <CardTitle className="flex items-center gap-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
// // //                     <IconListDetails className="h-8 w-8" />
// // //                     WP Content Publisher
// // //                   </CardTitle>
// // //                   <CardDescription className="text-indigo-600 mt-1 font-medium">
// // //                     Select content → Pick matching sites → Publish via API
// // //                   </CardDescription>
// // //                 </div>
// // //                 <div className="flex items-center gap-3 w-full lg:w-auto">
// // //                   <div className="relative flex-1 lg:w-[350px]">
// // //                     <IconSearch className="h-5 w-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
// // //                     <Input
// // //                       value={search}
// // //                       onChange={(e) => setSearch(e.target.value)}
// // //                       placeholder="Search by title or keywords…"
// // //                       className="pl-12 bg-white border-indigo-300 rounded-2xl shadow-sm"
// // //                     />
// // //                   </div>
// // //                   <Badge className="rounded-full bg-indigo-100 text-indigo-800 border-indigo-300 px-4 py-2 font-semibold">
// // //                     Selected: {selectedCount}/{ALL_SITES.length}
// // //                   </Badge>
// // //                 </div>
// // //               </div>
// // //             </CardHeader>
// // //           </Card>
// // //         </PremiumCard>
// // //         {/* 3-column layout */}
// // //         <div className="mt-10 grid gap-10 xl:grid-cols-12">
// // //           {/* LEFT — Projects Panel */}
// // //           <div className="xl:col-span-4">
// // //             <div className="sticky top-8 space-y-6">
// // //               <PremiumCard>
// // //                 <Card className="border-0 shadow-none bg-transparent">
// // //                   <CardHeader className="pb-4">
// // //                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
// // //                       <IconFolder className="h-6 w-6 text-indigo-600" />
// // //                       Content Projects
// // //                     </CardTitle>
// // //                     <CardDescription className="text-indigo-600">
// // //                       Choose projects or specific items for posting.
// // //                     </CardDescription>
// // //                   </CardHeader>
// // //                   <CardContent className="space-y-4">
// // //                     <div className="md:hidden mb-3">
// // //                       <div className="relative">
// // //                         <IconSearch className="h-4 w-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
// // //                         <Input
// // //                           value={search}
// // //                           onChange={(e) => setSearch(e.target.value)}
// // //                           placeholder="Search title / keywords…"
// // //                           className="pl-9 bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                     </div>
// // //                     <div className="flex items-center justify-between text-sm text-indigo-600">
// // //                       <div className="flex items-center gap-2">
// // //                         <Button
// // //                           variant="outline"
// // //                           size="sm"
// // //                           onClick={selectAllVisible}
// // //                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
// // //                           <IconCircleCheck className="h-4 w-4 mr-2" /> Select
// // //                           All Visible
// // //                         </Button>
// // //                         <Button
// // //                           variant="outline"
// // //                           size="sm"
// // //                           onClick={clearSelection}
// // //                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
// // //                           <IconCircleX className="h-4 w-4 mr-2" /> Clear All
// // //                         </Button>
// // //                       </div>
// // //                       <span className="font-semibold">
// // //                         {filteredProjects.length} Projects
// // //                       </span>
// // //                     </div>
// // //                     <div className="max-h-[650px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300">
// // //                       {filteredProjects.length === 0 && (
// // //                         <div className="text-sm text-indigo-500 py-8 text-center">
// // //                           No content found. Start generating!
// // //                         </div>
// // //                       )}
// // //                       {filteredProjects.map((p, idx) => {
// // //                         const expanded = expandedProjectIds.has(p.id);
// // //                         const projectSelected = isProjectSelected(p.id);
// // //                         const selectedCountInProject = p.items.filter((it) =>
// // //                           selectedItemIds.has(it.id)
// // //                         ).length;
// // //                         const total = p.items.length;
// // //                         return (
// // //                           <div
// // //                             key={p.id}
// // //                             className="rounded-2xl ring-1 ring-indigo-200/50 bg-white/80 mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
// // //                             {/* Project row */}
// // //                             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
// // //                               <div className="flex items-center gap-4">
// // //                                 <Button
// // //                                   variant="ghost"
// // //                                   size="icon"
// // //                                   onClick={() => toggleProjectExpand(p.id)}
// // //                                   className="h-8 w-8 rounded-full hover:bg-indigo-100"
// // //                                   aria-label={expanded ? "Collapse" : "Expand"}>
// // //                                   {expanded ? (
// // //                                     <IconChevronDown className="h-5 w-5 text-indigo-600" />
// // //                                   ) : (
// // //                                     <IconChevronRight className="h-5 w-5 text-indigo-600" />
// // //                                   )}
// // //                                 </Button>
// // //                                 <Checkbox
// // //                                   checked={projectSelected}
// // //                                   onCheckedChange={(v) =>
// // //                                     setProjectChecked(p.id, !!v)
// // //                                   }
// // //                                   className={cn(
// // //                                     "mr-2 h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // //                                   )}
// // //                                   aria-label="Select project"
// // //                                 />
// // //                                 <span className="text-sm font-bold text-gray-800 tabular-nums">
// // //                                   {String(idx + 1).padStart(2, "0")}.
// // //                                 </span>
// // //                                 <span className="text-sm font-bold text-gray-900">
// // //                                   {p.name}
// // //                                 </span>
// // //                               </div>
// // //                               <Badge
// // //                                 variant="outline"
// // //                                 className={cn(
// // //                                   "rounded-full text-sm px-3 py-1",
// // //                                   selectedCountInProject
// // //                                     ? "border-indigo-600 text-indigo-700 bg-indigo-100"
// // //                                     : "border-indigo-300 text-indigo-500"
// // //                                 )}>
// // //                                 {selectedCountInProject}/{total}
// // //                               </Badge>
// // //                             </div>
// // //                             {/* Items list */}
// // //                             {expanded && (
// // //                               <div className="border-t border-indigo-100 divide-y divide-indigo-50">
// // //                                 {p.items.map((it, iidx) => {
// // //                                   const checked = isItemSelected(it.id);
// // //                                   return (
// // //                                     <div
// // //                                       key={it.id}
// // //                                       className={cn(
// // //                                         "flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 transition-colors",
// // //                                         checked &&
// // //                                           "bg-indigo-50 ring-1 ring-indigo-200/50"
// // //                                       )}>
// // //                                       <div className="flex items-center gap-4 min-w-0">
// // //                                         <span className="text-xs text-indigo-500 font-semibold w-6 text-right tabular-nums">
// // //                                           {iidx + 1}
// // //                                         </span>
// // //                                         <Checkbox
// // //                                           checked={checked}
// // //                                           onCheckedChange={(v) =>
// // //                                             setItemChecked(p.id, it.id, !!v)
// // //                                           }
// // //                                           className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // //                                           aria-label="Select item"
// // //                                         />
// // //                                         <button
// // //                                           className="text-left min-w-0 flex-1"
// // //                                           onClick={() =>
// // //                                             setFocusedItemId(it.id)
// // //                                           }>
// // //                                           <div className="text-base font-semibold text-gray-900 truncate">
// // //                                             {(getItemTitle(it) ||
// // //                                               getItemKeywords(it)[0]) ??
// // //                                               "Untitled"}
// // //                                           </div>
// // //                                           <div className="text-sm text-indigo-600 truncate mt-1">
// // //                                             {getItemKeywords(it).join(", ")}
// // //                                           </div>
// // //                                         </button>
// // //                                       </div>
// // //                                       {checked && (
// // //                                         <IconCheck className="h-5 w-5 text-indigo-600 flex-shrink-0" />
// // //                                       )}
// // //                                     </div>
// // //                                   );
// // //                                 })}
// // //                               </div>
// // //                             )}
// // //                           </div>
// // //                         );
// // //                       })}
// // //                     </div>
// // //                   </CardContent>
// // //                 </Card>
// // //               </PremiumCard>
// // //             </div>
// // //           </div>
// // //           {/* CENTER — Defaults + Preview */}
// // //           <div className="xl:col-span-5 space-y-6">
// // //             <PremiumCard>
// // //               <Card className="border-0 shadow-none bg-transparent">
// // //                 <CardHeader className="pb-5">
// // //                   <CardTitle className="text-xl font-bold text-gray-900">
// // //                     Global Post Settings
// // //                   </CardTitle>
// // //                   <CardDescription className="text-indigo-600">
// // //                     These defaults apply across all selected contents (unique
// // //                     title/content per site).
// // //                   </CardDescription>
// // //                 </CardHeader>
// // //                 <CardContent className="space-y-6">
// // //                   <section className="space-y-3">
// // //                     <PremiumSectionTitle
// // //                       icon={<IconTags className="h-5 w-5" />}>
// // //                       Keywords (Same for All)
// // //                     </PremiumSectionTitle>
// // //                     <TagsInput
// // //                       value={keywordsDefaults}
// // //                       onChange={setKeywordsDefaults}
// // //                     />
// // //                   </section>
// // //                   <section className="space-y-3">
// // //                     <PremiumSectionTitle>
// // //                       Category (Same for All)
// // //                     </PremiumSectionTitle>
// // //                     <Select value={category} onValueChange={setCategory}>
// // //                       <SelectTrigger className="bg-white border-indigo-300 rounded-2xl">
// // //                         <SelectValue placeholder="Select a category" />
// // //                       </SelectTrigger>
// // //                       <SelectContent className="rounded-2xl">
// // //                         {CATEGORIES.map((c) => (
// // //                           <SelectItem key={c} value={c} className="rounded-xl">
// // //                             {c}
// // //                           </SelectItem>
// // //                         ))}
// // //                       </SelectContent>
// // //                     </Select>
// // //                   </section>
// // //                   <section className="space-y-3">
// // //                     <PremiumSectionTitle
// // //                       icon={<IconPhoto className="h-5 w-5" />}>
// // //                       Feature Image (Same for All)
// // //                     </PremiumSectionTitle>
// // //                     <ImagePicker
// // //                       imageUrl={imageUrl}
// // //                       onImageUrlChange={setImageUrl}
// // //                       file={imageFile}
// // //                       onFileChange={setImageFile}
// // //                     />
// // //                     <p className="text-xs text-indigo-600 font-medium">
// // //                       Uploaded to each site as featured image.
// // //                     </p>
// // //                   </section>
// // //                   <section className="space-y-4">
// // //                     <PremiumSectionTitle
// // //                       icon={<IconMap2 className="h-5 w-5" />}>
// // //                       Location Details
// // //                     </PremiumSectionTitle>
// // //                     <div className="grid gap-4 md:grid-cols-2">
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">
// // //                           Country
// // //                         </Label>
// // //                         <Input
// // //                           value={country}
// // //                           onChange={(e) => setCountry(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">
// // //                           State/Province
// // //                         </Label>
// // //                         <Input
// // //                           value={state}
// // //                           onChange={(e) => setStateVal(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">
// // //                           City
// // //                         </Label>
// // //                         <Input
// // //                           value={city}
// // //                           onChange={(e) => setCity(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">
// // //                           ZIP/Postal Code
// // //                         </Label>
// // //                         <Input
// // //                           value={zip}
// // //                           onChange={(e) => setZip(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                     </div>
// // //                     <div>
// // //                       <Label className="text-sm font-semibold text-gray-700">
// // //                         Street Address
// // //                       </Label>
// // //                       <Input
// // //                         value={line1}
// // //                         onChange={(e) => setLine1(e.target.value)}
// // //                         className="bg-white border-indigo-300 rounded-xl"
// // //                       />
// // //                     </div>
// // //                   </section>
// // //                   <section className="space-y-4">
// // //                     <PremiumSectionTitle
// // //                       icon={<IconAddressBook className="h-5 w-5" />}>
// // //                       Contact Information
// // //                     </PremiumSectionTitle>
// // //                     <div className="grid gap-4 md:grid-cols-3">
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">
// // //                           Phone
// // //                         </Label>
// // //                         <Input
// // //                           value={phone}
// // //                           onChange={(e) => setPhone(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">
// // //                           Website
// // //                         </Label>
// // //                         <div className="flex items-center">
// // //                           <IconWorldWww className="h-5 w-5 mr-3 text-indigo-500" />
// // //                           <Input
// // //                             value={website}
// // //                             onChange={(e) => setWebsite(e.target.value)}
// // //                             className="bg-white border-indigo-300 rounded-xl flex-1"
// // //                           />
// // //                         </div>
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold text-gray-700">
// // //                           Email
// // //                         </Label>
// // //                         <div className="flex items-center">
// // //                           <IconAt className="h-5 w-5 mr-3 text-indigo-500" />
// // //                           <Input
// // //                             value={email}
// // //                             onChange={(e) => setEmail(e.target.value)}
// // //                             className="bg-white border-indigo-300 rounded-xl flex-1"
// // //                           />
// // //                         </div>
// // //                       </div>
// // //                     </div>
// // //                   </section>
// // //                   <section className="space-y-4">
// // //                     <PremiumSectionTitle
// // //                       icon={<IconWorld className="h-5 w-5" />}>
// // //                       Social Connections
// // //                     </PremiumSectionTitle>
// // //                     <div className="grid gap-4 md:grid-cols-2">
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // //                           <IconBrandFacebook className="h-4 w-4 text-blue-600" />{" "}
// // //                           Facebook
// // //                         </Label>
// // //                         <Input
// // //                           value={facebook}
// // //                           onChange={(e) => setFacebook(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // //                           <IconBrandTwitter className="h-4 w-4 text-blue-400" />{" "}
// // //                           Twitter / X
// // //                         </Label>
// // //                         <Input
// // //                           value={twitter}
// // //                           onChange={(e) => setTwitter(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // //                           <IconBrandLinkedin className="h-4 w-4 text-blue-700" />{" "}
// // //                           LinkedIn
// // //                         </Label>
// // //                         <Input
// // //                           value={linkedin}
// // //                           onChange={(e) => setLinkedin(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // //                           <IconBrandPinterest className="h-4 w-4 text-red-500" />{" "}
// // //                           Pinterest
// // //                         </Label>
// // //                         <Input
// // //                           value={pinterest}
// // //                           onChange={(e) => setPinterest(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // //                           <IconBrandInstagram className="h-4 w-4 text-pink-500" />{" "}
// // //                           Instagram
// // //                         </Label>
// // //                         <Input
// // //                           value={instagram}
// // //                           onChange={(e) => setInstagram(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                       <div>
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // //                           <IconBrandCpp className="h-4 w-4 text-yellow-600" />{" "}
// // //                           Yelp
// // //                         </Label>
// // //                         <Input
// // //                           value={yelp}
// // //                           onChange={(e) => setYelp(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                       <div className="md:col-span-2">
// // //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// // //                           <IconBrandGoogle className="h-4 w-4 text-red-500" />{" "}
// // //                           Google Business
// // //                         </Label>
// // //                         <Input
// // //                           value={gmb}
// // //                           onChange={(e) => setGmb(e.target.value)}
// // //                           className="bg-white border-indigo-300 rounded-xl"
// // //                         />
// // //                       </div>
// // //                     </div>
// // //                   </section>
// // //                 </CardContent>
// // //               </Card>
// // //             </PremiumCard>
// // //             <PremiumCard>
// // //               <Card className="border-0 shadow-none bg-transparent">
// // //                 <CardHeader className="pb-4">
// // //                   <CardTitle className="text-xl font-bold text-gray-900">
// // //                     Live Preview
// // //                   </CardTitle>
// // //                   <CardDescription className="text-indigo-600">
// // //                     Select an item from the left to see a real-time preview
// // //                     here.
// // //                   </CardDescription>
// // //                 </CardHeader>
// // //                 <CardContent className="space-y-5">
// // //                   <div>
// // //                     <Label className="text-sm font-semibold text-gray-700">
// // //                       Unique Title
// // //                     </Label>
// // //                     <Input
// // //                       value={focusedItem ? getItemTitle(focusedItem) : ""}
// // //                       readOnly
// // //                       placeholder="Click an item to preview its title"
// // //                       className="bg-indigo-50/50 border-indigo-300 rounded-xl mt-1 font-semibold"
// // //                     />
// // //                   </div>
// // //                   <div>
// // //                     <Label className="text-sm font-semibold text-gray-700">
// // //                       Unique Content
// // //                     </Label>
// // //                     <Textarea
// // //                       value={focusedItem ? getItemHtml(focusedItem) : ""}
// // //                       readOnly
// // //                       placeholder="Click an item to preview its full content"
// // //                       className="min-h-[200px] bg-indigo-50/50 border-indigo-300 rounded-xl mt-1"
// // //                     />
// // //                   </div>
// // //                 </CardContent>
// // //               </Card>
// // //             </PremiumCard>
// // //           </div>
// // //           {/* RIGHT — Controls + Processing Box */}
// // //           <div className="xl:col-span-3">
// // //             <div className="sticky top-8 space-y-6">
// // //               <PremiumCard>
// // //                 <Card className="border-0 shadow-none bg-transparent">
// // //                   <CardHeader className="pb-5">
// // //                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
// // //                       <IconSparkles className="h-6 w-6 text-purple-600" /> API
// // //                       Publisher
// // //                     </CardTitle>
// // //                     <CardDescription className="text-indigo-600">
// // //                       Match content count with sites for unique posts.
// // //                     </CardDescription>
// // //                   </CardHeader>
// // //                   <CardContent className="space-y-6">
// // //                     {/* SITES CHECKBOX LIST */}
// // //                     <section className="space-y-3">
// // //                       <Label className="text-sm font-bold flex items-center gap-3 text-gray-900">
// // //                         <IconGlobe className="h-5 w-5 text-indigo-600" /> Target
// // //                         Sites ({selectedSitesCount}/{selectedCount || 0})
// // //                       </Label>
// // //                       {selectedCount === 0 && (
// // //                         <div className="text-sm text-indigo-500">
// // //                           Begin by selecting content on the left.
// // //                         </div>
// // //                       )}
// // //                       <div className="rounded-2xl ring-1 ring-indigo-200 bg-white/80 divide-y divide-indigo-50 shadow-sm max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300">
// // //                         {ALL_SITES.slice(0, 50).map((s) => {
// // //                           // Limit to 50 for UI
// // //                           const isChecked = selectedSiteValues.has(s.value);
// // //                           const disableNew =
// // //                             !isChecked &&
// // //                             (selectedSitesCount >= selectedCount ||
// // //                               selectedCount === 0);
// // //                           return (
// // //                             <label
// // //                               key={s.value}
// // //                               className={cn(
// // //                                 "flex items-center justify-between gap-4 px-4 py-3 cursor-pointer transition-all hover:bg-indigo-50/50",
// // //                                 isChecked &&
// // //                                   "bg-indigo-50/80 ring-1 ring-indigo-200/50",
// // //                                 disableNew && "opacity-70 cursor-not-allowed"
// // //                               )}>
// // //                               <div className="flex items-center gap-3 min-w-0">
// // //                                 <Checkbox
// // //                                   checked={isChecked}
// // //                                   disabled={disableNew}
// // //                                   onCheckedChange={(v) =>
// // //                                     toggleSite(s.value, !!v)
// // //                                   }
// // //                                   className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// // //                                 />
// // //                                 <span className="text-base font-semibold text-gray-900 truncate">
// // //                                   {s.label}
// // //                                 </span>
// // //                               </div>
// // //                               <Badge
// // //                                 variant="outline"
// // //                                 className="rounded-full text-xs px-3 py-1 bg-indigo-100 border-indigo-300 text-indigo-700">
// // //                                 1 Slot
// // //                               </Badge>
// // //                             </label>
// // //                           );
// // //                         })}
// // //                       </div>
// // //                       <p className="text-xs text-indigo-600 font-medium">
// // //                         Pro Tip: {selectedCount} contents require exactly{" "}
// // //                         {selectedCount} sites.
// // //                       </p>
// // //                     </section>
// // //                     <Separator className="border-indigo-200" />
// // //                     <div className="grid gap-4">
// // //                       <Button
// // //                         onClick={handleStart}
// // //                         disabled={!readyToStart || isStarting}
// // //                         className={cn(
// // //                           "rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 h-12 font-bold text-lg",
// // //                           !readyToStart && "opacity-70 cursor-not-allowed"
// // //                         )}>
// // //                         <IconPlayerPlay className="h-5 w-5 mr-3" />
// // //                         {isStarting
// // //                           ? "Publishing…"
// // //                           : `Publish Now (${selectedCount})`}
// // //                       </Button>
// // //                       <div className="flex items-center justify-between text-sm text-indigo-600">
// // //                         <span className="flex items-center gap-2 font-medium">
// // //                           <IconCheck className="h-4 w-4" />
// // //                           {selectedCount} Contents Ready
// // //                         </span>
// // //                         <span className="flex items-center gap-2 font-medium">
// // //                           <IconGlobe className="h-4 w-4" />
// // //                           {selectedSitesCount} Sites Locked
// // //                         </span>
// // //                       </div>
// // //                       {jobId && status === "running" && (
// // //                         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// // //                           <div className="flex items-center justify-between text-sm text-indigo-600 mb-3 font-medium">
// // //                             <span>Publishing: {jobId.slice(-6)}</span>
// // //                             <span>{progress}% Complete</span>
// // //                           </div>
// // //                           <Progress
// // //                             value={progress}
// // //                             className="h-3 bg-indigo-200 rounded-full"
// // //                           />
// // //                         </div>
// // //                       )}
// // //                     </div>
// // //                   </CardContent>
// // //                 </Card>
// // //               </PremiumCard>
// // //               {/* Processing Box - Runs/Backlinks */}
// // //               {runs.length > 0 && (
// // //                 <PremiumCard>
// // //                   <Card className="border-0 shadow-none bg-transparent">
// // //                     <CardHeader className="pb-4">
// // //                       <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
// // //                         <IconSparkles className="h-6 w-6 text-green-600" />
// // //                         Processing Results
// // //                       </CardTitle>
// // //                       <CardDescription className="text-green-600">
// // //                         Backlinks generated per project (Site - URL).
// // //                       </CardDescription>
// // //                     </CardHeader>
// // //                     <CardContent className="space-y-4">
// // //                       {/* Copy All Button */}
// // //                       <Button
// // //                         size="sm"
// // //                         className="rounded-full bg-green-600 hover:bg-green-700 text-white w-full"
// // //                         onClick={() => {
// // //                           const all = runs
// // //                             .flatMap((r) =>
// // //                               (r.backlinks || []).map((link) => {
// // //                                 const hostname = new URL(link).hostname.replace(
// // //                                   "www.",
// // //                                   ""
// // //                                 );
// // //                                 return `${hostname} - ${link}`;
// // //                               })
// // //                             )
// // //                             .join("\n");
// // //                           navigator.clipboard.writeText(all);
// // //                           toast.success("All backlinks copied!");
// // //                         }}>
// // //                         Copy All Backlinks
// // //                       </Button>
// // //                       {runs.map((run) => (
// // //                         <div
// // //                           key={run.jobId}
// // //                           className="rounded-xl border border-green-200 p-4 bg-green-50/40 space-y-3">
// // //                           {/* Header */}
// // //                           <div className="flex justify-between items-center">
// // //                             <div className="font-semibold text-green-700">
// // //                               Project:{" "}
// // //                               {run.jobId ? run.jobId.slice(-8) : "Unknown"}
// // //                             </div>
// // //                             <Badge
// // //                               className={`rounded-full px-3 py-1 ${
// // //                                 run.status === "done"
// // //                                   ? "bg-green-100 text-green-700 border-green-300"
// // //                                   : run.status === "error"
// // //                                   ? "bg-red-100 text-red-700 border-red-300"
// // //                                   : "bg-indigo-100 text-indigo-700 border-indigo-300"
// // //                               }`}>
// // //                               {run.status.toUpperCase()}
// // //                             </Badge>
// // //                           </div>
// // //                           {/* Progress */}
// // //                           <Progress value={run.progress} className="h-2" />
// // //                           {/* Backlinks List */}
// // //                           {(run.backlinks?.length ?? 0) > 0 && (
// // //                             <div className="space-y-2 max-h-48 overflow-auto">
// // //                               <div className="font-semibold text-gray-900 mb-2 flex justify-between">
// // //                                 Backlinks ({run.backlinks!.length})
// // //                                 <Button
// // //                                   size="sm"
// // //                                   variant="outline"
// // //                                   className="rounded-full border-green-300 text-green-700 hover:bg-green-50"
// // //                                   onClick={() => {
// // //                                     const projectLinks = run
// // //                                       .backlinks!.map((link) => {
// // //                                         const hostname = new URL(
// // //                                           link
// // //                                         ).hostname.replace("www.", "");
// // //                                         return `${hostname} - ${link}`;
// // //                                       })
// // //                                       .join("\n");
// // //                                     navigator.clipboard.writeText(projectLinks);
// // //                                     toast.success("Project backlinks copied!");
// // //                                   }}>
// // //                                   Copy Project
// // //                                 </Button>
// // //                               </div>
// // //                               {run.backlinks!.map((link, idx) => {
// // //                                 const url = new URL(link);
// // //                                 const hostname = url.hostname.replace(
// // //                                   "www.",
// // //                                   ""
// // //                                 );
// // //                                 return (
// // //                                   <div
// // //                                     key={idx}
// // //                                     className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200 shadow-sm text-sm">
// // //                                     <span className="font-semibold text-gray-800">
// // //                                       {hostname}
// // //                                     </span>
// // //                                     <a
// // //                                       href={link}
// // //                                       target="_blank"
// // //                                       rel="noopener noreferrer"
// // //                                       className="text-green-700 underline truncate max-w-[150px]">
// // //                                       {link}
// // //                                     </a>
// // //                                     <Button
// // //                                       size="sm"
// // //                                       variant="ghost"
// // //                                       className="h-6 w-6 p-0"
// // //                                       onClick={() => {
// // //                                         navigator.clipboard.writeText(link);
// // //                                         toast.success("Link copied!");
// // //                                       }}>
// // //                                       Copy
// // //                                     </Button>
// // //                                   </div>
// // //                                 );
// // //                               })}
// // //                             </div>
// // //                           )}
// // //                           {/* Logs */}
// // //                           {(run.logs ?? []).length > 0 && (
// // //                             <details className="mt-2">
// // //                               <summary className="cursor-pointer text-sm font-semibold text-green-700">
// // //                                 View Logs ({run.logs!.length})
// // //                               </summary>
// // //                               <div className="mt-2 bg-white p-3 rounded-xl border border-green-200 max-h-32 overflow-auto text-xs text-gray-700 whitespace-pre-wrap">
// // //                                 {run.logs!.join("\n")}
// // //                               </div>
// // //                             </details>
// // //                           )}
// // //                           {/* Export */}
// // //                           {run.status === "done" &&
// // //                             run.backlinks?.length &&
// // //                             run.jobId && (
// // //                               <Button
// // //                                 size="sm"
// // //                                 className="mt-2 rounded-full bg-green-600 hover:bg-green-700 w-full"
// // //                                 onClick={() => {
// // //                                   if (run.jobId) {
// // //                                     downloadRunExcel(
// // //                                       run.jobId,
// // //                                       `project-${run.jobId.slice(-8)}.xlsx`
// // //                                     );
// // //                                   }
// // //                                 }}>
// // //                                 Export Excel (Site - URL)
// // //                               </Button>
// // //                             )}
// // //                         </div>
// // //                       ))}
// // //                     </CardContent>
// // //                   </Card>
// // //                 </PremiumCard>
// // //               )}
// // //               <div className="rounded-2xl ring-1 ring-indigo-200 bg-white shadow-lg p-5 text-sm text-gray-800 border border-indigo-100/50">
// // //                 <p className="mb-2 flex items-center gap-2">
// // //                   ✅ <b>Workflow:</b> Select → Match → Publish (Direct WP API)
// // //                 </p>
// // //                 <p className="mb-4">
// // //                   🚀 <b>Unique per site:</b> Title + Content | Same: Image +
// // //                   Keywords + Category
// // //                 </p>
// // //                 <div className="flex items-center gap-3">
// // //                   <Button
// // //                     variant="outline"
// // //                     onClick={handleSavePreset}
// // //                     className="rounded-full border-indigo-300 hover:bg-indigo-50">
// // //                     💾 Save Config
// // //                   </Button>
// // //                   <Badge className="rounded-full bg-purple-100 text-purple-800 border-purple-300">
// // //                     50+ Sites Ready
// // //                   </Badge>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import React, { useEffect, useMemo, useState } from "react";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Separator } from "@/components/ui/separator";
// // import { Progress } from "@/components/ui/progress";
// // import { Checkbox } from "@/components/ui/checkbox";
// // import { toast } from "sonner";
// // import { cn } from "@/lib/utils";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import {
// //   IconWorld,
// //   IconListDetails,
// //   IconPlayerPlay,
// //   IconSparkles,
// //   IconAddressBook,
// //   IconTags,
// //   IconMap2,
// //   IconPhoto,
// //   IconWorldWww,
// //   IconAt,
// //   IconBrandFacebook,
// //   IconBrandTwitter,
// //   IconBrandLinkedin,
// //   IconBrandPinterest,
// //   IconBrandInstagram,
// //   IconBrandCpp, // Yelp placeholder
// //   IconBrandGoogle,
// //   IconChevronDown,
// //   IconChevronRight,
// //   IconSearch,
// //   IconFolder,
// //   IconCheck,
// //   IconCircleCheck,
// //   IconCircleX,
// //   IconGlobe,
// //   IconCopy,
// //   IconExternalLink,
// //   IconTrash,
// //   IconRefresh,
// // } from "@tabler/icons-react";
// // import {
// //   useListingAutomation,
// //   type GeneratedItem,
// //   type Socials,
// // } from "./hooks/useListingAutomation";

// // /* ─────────────────────────────────────────────────────────────
// //  * Constants - Full 50+ Sites List (Merged)
// //  * ────────────────────────────────────────────────────────────*/
// // const CATEGORIES = [
// //   "Electronics",
// //   "Home & Garden",
// //   "Vehicles",
// //   "Jobs",
// //   "Services",
// //   "Real Estate",
// //   "Pets",
// //   "Books",
// //   "Fashion",
// //   "Sports",
// //   "UK",
// //   "Rajasthan",
// //   "Punjab",
// //   "Maharashtra",
// //   "Gujarat",
// //   "Tamil Nadu",
// //   "Kerala",
// //   "West Bengal",
// //   "Karnataka",
// //   "Andhra Pradesh",
// //   "Telangana",
// //   "Odisha",
// //   "Bihar",
// //   "Chhattisgarh",
// //   "Uttar Pradesh",
// //   "Haryana",
// //   "Delhi",
// // ];

// // const ALL_WORDPRESS_SITES = [
// //   {
// //     value: "linuxpatent.com",
// //     label: "linuxpatent.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "vSvd cd8e aY9V E9vy EtU9 bkAi",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "rayseries.com",
// //     label: "rayseries.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "P2kl EHRS 6gLi drVQ 4Xb0 TIlR",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "pasfait.com",
// //     label: "pasfait.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "rYXn vala ZImc guqH jHg1 yAbF",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "scotchsavvy.com",
// //     label: "scotchsavvy.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "pNfP EhU6 BhVi pHPC vT7u Gh7Z",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "extremesportsgoons.info",
// //     label: "extremesportsgoons.info (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "S2ll 7cby lhda nab6 XzIG vCyk",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "creeksidereflections.com",
// //     label: "creeksidereflections.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "Fqcl hdHo ipZ2 l4CK Sbmn Tat4",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "PiratesGab.com",
// //     label: "PiratesGab.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "jRFw Vqoi 3Xj5 TQAy koRx 09z0",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "theSportchampion.com",
// //     label: "theSportchampion.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "7Bjq nNmf b4Zf BX5A Lujg SQhl",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "DataDrillAmerAsia.com",
// //     label: "DataDrillAmerAsia.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "3Zpc ouuZ 4y4q 3Txk ceC2 Hi2Y",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "htpsouthdowns.com",
// //     label: "htpsouthdowns.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "aGzE azG9 22VN iuQC T1x3 fW8x",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "UsJobSandGigs.com",
// //     label: "UsJobSandGigs.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "OA81 7Ime Clim kHmt 5wi7 Ezac",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "VictoriesSport.com",
// //     label: "VictoriesSport.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "csSb IsEN Wx5b X6qm xgFC tvaH",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "veroniquelacoste.com",
// //     label: "veroniquelacoste.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "74J7 vJxc qH5O 41a8 CeWn uDLH",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "missonthemove.com",
// //     label: "missonthemove.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "WVU9 IFtJ Ohme L7jg 1ibA 939a",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "pcnfa.com",
// //     label: "pcnfa.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "1h46 Esbn jy3k Dh5e l3O6 cSXQ",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "theangelfilm.com",
// //     label: "theangelfilm.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "eU2M XhWw 3DUP um7z II8F Db1W",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "soerq.com",
// //     label: "soerq.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "wog2 w87h QRen Kmud 7G98 NOOE",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "paydayard.com",
// //     label: "paydayard.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "05d8 CuBb 23Iu eaU0 C165 dx9J",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "trekbadlands.com",
// //     label: "trekbadlands.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "K01N zsGd 6Y2Z fxTo JWbL lLab",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "pawmeism.com",
// //     label: "pawmeism.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "hDNV z0Vy rQTu PAqI 1D5A ELgv",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "demokore.com",
// //     label: "demokore.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "q5fC VDeX 4os5 sUr6 J2RU pSxY",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "moviemotives.com",
// //     label: "moviemotives.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "ScpA VN2X EccU iofU Aohq saoNScpA VN2X EccU iofU Aohq saoN",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "mitchellstover.com",
// //     label: "mitchellstover.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "GRHW uOKp XHko fco3 ae6L iQvl",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "fametize.com",
// //     label: "fametize.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "MqSV Ap8X fI39 X50H OzcC WJmc",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "luocsu.com",
// //     label: "luocsu.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "wgKC TTYQ mP0d cOek lSDt Ooy7",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "inststagram.com",
// //     label: "inststagram.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "JDYO 88vG J16G ot8u PMzM od0J",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "ashopear.com",
// //     label: "ashopear.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "zD91 Q3AR xfq1 lo2B wKDV Ad9m",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "charles6767.com",
// //     label: "charles6767.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "N3il WPF1 XcUf HNHA ntTO ukDC",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "berlintype.com",
// //     label: "berlintype.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "TBqx iSM7 Tc0c ige4 2tTO 958e",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "sprintcybermonday.com",
// //     label: "sprintcybermonday.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "ZU2e xkY1 adLg JPsN MhvU pIrM",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "jamesvirtudazo.com",
// //     label: "jamesvirtudazo.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "zDCU TmdE sh4k FHRv wwtU 4t4K",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "partyprivee.com",
// //     label: "partyprivee.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "zqqk JFzo peli 1NuW jJoU e4eT",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "launcheell.com",
// //     label: "launcheell.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "HVMo ezSe 9Dew GyT6 AXfK s0BG",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "cruitholidayhome.com",
// //     label: "cruitholidayhome.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "oNeJ n9x7 KcL3 lnJ6 xGxE CdDG",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "yhbdvideo.com",
// //     label: "yhbdvideo.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "oNeJ n9x7 KcL3 lnJ6 xGxE CdDG",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "hmboot.com",
// //     label: "hmboot.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "DRf7 Wh6i 5G2W gLVi 6I7J 2ZwG",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "allaboutlaptop.com",
// //     label: "allaboutlaptop.com (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "8CfX jdb4 fFS6 McTU CyEN 1nHL",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "photosdp.net",
// //     label: "photosdp.net (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "o02P LuIY NCIw jHjv himW 3Zqe",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "melanzona.com",
// //     label: "melanzona.com (Guest Posting)",
// //     username: "Hal",
// //     password: "K5Cm DGdD YNOu AsHD oP1D oUYy",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "jutzstuff.com",
// //     label: "jutzstuff.com (Guest Posting)",
// //     username: "Eli",
// //     password: "fyYX RwbX Tybp jIvZ XcXo perK",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "mypracticemaxx.com",
// //     label: "mypracticemaxx.com (Guest Posting)",
// //     username: "Roz",
// //     password: "EL1E qnHZ U62o HrHI 79vH DiVB",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "vuepella.com",
// //     label: "vuepella.com (Guest Posting)",
// //     username: "Ike",
// //     password: "9oO1 brtb atQ4 FnjA SAKo wmWO",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "tfajtrading.com",
// //     label: "tfajtrading.com (Guest Posting)",
// //     username: "Fay",
// //     password: "P2VX xq4F LN5I gonc y0K2 UfsT",
// //     type: "wordpress",
// //   },
// //   {
// //     value: "postmyads.org",
// //     label: "postmyads.org (Guest Posting)",
// //     username: "FlowTrack",
// //     password: "94FL ejV8 PYyb bKsJ 5sNj 4s3t",
// //     type: "wordpress",
// //   },
// // ];

// // const ALL_SITES = ALL_WORDPRESS_SITES; // Merged into one list

// // /* ─────────────────────────────────────────────────────────────
// //  * Local-storage loader
// //  * ──────────────────────────────────────────────────────────*/
// // function loadGeneratedItems(): GeneratedItem[] {
// //   const keys = ["content_items_v1", "content-items", "seomatic_content_items"];
// //   for (const k of keys) {
// //     try {
// //       const raw = localStorage.getItem(k);
// //       if (raw) {
// //         const arr = JSON.parse(raw);
// //         if (Array.isArray(arr)) return arr;
// //       }
// //     } catch {}
// //   }
// //   try {
// //     const raw =
// //       sessionStorage.getItem("open-content-item_v1") ??
// //       localStorage.getItem("open-content-item_v1_fallback");
// //     if (raw) {
// //       const it = JSON.parse(raw);
// //       if (it && typeof it === "object") return [it];
// //     }
// //   } catch {}
// //   return [];
// // }

// // /* ─────────────────────────────────────────────────────────────
// //  * UI Helpers
// //  * ──────────────────────────────────────────────────────────*/
// // function PremiumCard({ children }: { children: React.ReactNode }) {
// //   return (
// //     <div className="rounded-3xl ring-1 ring-indigo-200/50 bg-gradient-to-br from-white via-indigo-50/30 to-white shadow-xl overflow-hidden border border-indigo-100/50">
// //       <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
// //       {children}
// //     </div>
// //   );
// // }
// // function PremiumSectionTitle({
// //   icon,
// //   children,
// // }: {
// //   icon?: React.ReactNode;
// //   children: React.ReactNode;
// // }) {
// //   return (
// //     <div className="flex items-center gap-3 text-base font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text ">
// //       {icon}
// //       {children}
// //     </div>
// //   );
// // }

// // /* Tags Input */
// // function TagsInput({
// //   value,
// //   onChange,
// //   placeholder = "Type keyword and press Enter",
// // }: {
// //   value: string[];
// //   onChange: (tags: string[]) => void;
// //   placeholder?: string;
// // }) {
// //   const [draft, setDraft] = useState("");
// //   function addTagFromDraft() {
// //     const parts = draft
// //       .split(/[,\n]/)
// //       .map((s) => s.trim())
// //       .filter(Boolean);
// //     if (parts.length) {
// //       const set = new Set([...value, ...parts]);
// //       onChange(Array.from(set));
// //       setDraft("");
// //     }
// //   }
// //   return (
// //     <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// //       <div className="flex flex-wrap gap-2 mb-3">
// //         {value.map((t) => (
// //           <span
// //             key={t}
// //             className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-800 px-3 py-1.5 text-sm ring-1 ring-indigo-300/50 shadow-sm">
// //             <IconTags className="h-3.5 w-3.5" />
// //             {t}
// //             <button
// //               onClick={() => onChange(value.filter((x) => x !== t))}
// //               className="ml-1 hover:text-indigo-900 transition-colors"
// //               aria-label={`Remove ${t}`}>
// //               ×
// //             </button>
// //           </span>
// //         ))}
// //       </div>
// //       <Input
// //         value={draft}
// //         onChange={(e) => setDraft(e.target.value)}
// //         onKeyDown={(e) => {
// //           if (e.key === "Enter") {
// //             e.preventDefault();
// //             addTagFromDraft();
// //           }
// //           if (e.key === "Backspace" && !draft && value.length) {
// //             onChange(value.slice(0, -1));
// //           }
// //         }}
// //         placeholder={placeholder}
// //         className="bg-white border-indigo-300"
// //       />
// //       <p className="text-xs text-indigo-600 mt-2 font-medium">
// //         Use Enter or comma to add
// //       </p>
// //     </div>
// //   );
// // }

// // /* Image Picker */
// // function ImagePicker({
// //   imageUrl,
// //   onImageUrlChange,
// //   file,
// //   onFileChange,
// // }: {
// //   imageUrl: string;
// //   onImageUrlChange: (v: string) => void;
// //   file: File | null;
// //   onFileChange: (f: File | null) => void;
// // }) {
// //   const [previewUrl, setPreviewUrl] = useState<string>("");
// //   useEffect(() => {
// //     if (file) {
// //       const u = URL.createObjectURL(file);
// //       setPreviewUrl(u);
// //       return () => {
// //         URL.revokeObjectURL(u);
// //       };
// //     }
// //     setPreviewUrl(imageUrl || "");
// //   }, [file, imageUrl]);
// //   const preview = previewUrl;
// //   return (
// //     <div className="grid gap-4">
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //         <div>
// //           <Label className="text-sm font-semibold text-gray-700">
// //             Image URL
// //           </Label>
// //           <Input
// //             placeholder="https://example.com/image.jpg"
// //             value={imageUrl}
// //             onChange={(e) => onImageUrlChange(e.target.value)}
// //             className="bg-white border-indigo-300"
// //           />
// //         </div>
// //         <div>
// //           <Label className="text-sm font-semibold text-gray-700">
// //             Upload Image
// //           </Label>
// //           <div className="flex items-center gap-3">
// //             <Input
// //               type="file"
// //               accept="image/*"
// //               className="bg-white border-indigo-300"
// //               onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
// //             />
// //             {file && (
// //               <Badge
// //                 variant="outline"
// //                 className="rounded-full bg-indigo-100 border-indigo-300 text-indigo-700">
// //                 {file.name}
// //               </Badge>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //       {preview ? (
// //         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// //           <img
// //             src={preview}
// //             alt="preview"
// //             className="max-h-64 w-full rounded-xl object-cover shadow-md"
// //           />
// //         </div>
// //       ) : (
// //         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-100/50 p-6 text-sm text-indigo-500 flex items-center justify-center">
// //           No preview available
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // /* Presets */
// // const PRESET_KEY = "classified_automation_preset_v2";
// // function savePreset(data: any) {
// //   localStorage.setItem(PRESET_KEY, JSON.stringify(data));
// // }
// // function loadPreset(): any | null {
// //   try {
// //     const raw = localStorage.getItem(PRESET_KEY);
// //     return raw ? JSON.parse(raw) : null;
// //   } catch {
// //     return null;
// //   }
// // }

// // /* Fake uploader (replace with real if needed) */
// // async function uploadImageAndGetUrl(file: File): Promise<string> {
// //   return URL.createObjectURL(file); // Placeholder - hook handles real upload
// // }

// // /* Tiny helpers from items */
// // const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// // const getItemHtml = (it: GeneratedItem) =>
// //   (it.html ?? it.generatedContent ?? "").toString();
// // function getItemKeywords(it: GeneratedItem): string[] {
// //   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
// //   if (typeof it.keyword === "string")
// //     return it.keyword
// //       .split(/[,\|]/)
// //       .map((s) => s.trim())
// //       .filter(Boolean);
// //   return [];
// // }

// // /* ─────────────────────────────────────────────────────────────
// //  * MAIN
// //  * ──────────────────────────────────────────────────────────*/
// // export default function ClassifiedAutomationPage() {
// //   /* Load all generated items */
// //   const [items, setItems] = useState<GeneratedItem[]>([]);
// //   useEffect(() => setItems(loadGeneratedItems()), []);

// //   /* Hook wiring */
// //   const {
// //     search,
// //     setSearch,
// //     filteredProjects,
// //     expandedProjectIds,
// //     toggleProjectExpand,
// //     selectedItemIds,
// //     isProjectSelected,
// //     isItemSelected,
// //     setProjectChecked,
// //     setItemChecked,
// //     selectAllVisible,
// //     clearSelection,
// //     setFocusedItemId,
// //     focusedItem,
// //     selectedItems,
// //     start,
// //     isStarting,
// //     jobId,
// //     progress,
// //     status,
// //     runs,
// //     downloadRunExcel,
// //   } = useListingAutomation(items, {
// //     uploadImage: uploadImageAndGetUrl,
// //     statusPollIntervalMs: 1500,
// //     maxPollMinutes: 15,
// //     maxSelectableItems: ALL_SITES.length,
// //     onMaxExceeded: (max) =>
// //       toast.error(`Max ${max} contents only (sites limit).`),
// //   });

// //   /* Defaults (apply to all selected items) */
// //   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
// //   const [category, setCategory] = useState<string>("");
// //   // Contact / profile
// //   const [phone, setPhone] = useState("");
// //   const [website, setWebsite] = useState("");
// //   const [email, setEmail] = useState("");
// //   // Socials
// //   const [facebook, setFacebook] = useState("");
// //   const [twitter, setTwitter] = useState("");
// //   const [linkedin, setLinkedin] = useState("");
// //   const [pinterest, setPinterest] = useState("");
// //   const [instagram, setInstagram] = useState("");
// //   const [yelp, setYelp] = useState("");
// //   const [gmb, setGmb] = useState("");
// //   // Address
// //   const [country, setCountry] = useState("");
// //   const [state, setStateVal] = useState("");
// //   const [city, setCity] = useState("");
// //   const [zip, setZip] = useState("");
// //   const [line1, setLine1] = useState("");
// //   // Default image
// //   const [imageUrl, setImageUrl] = useState("");
// //   const [imageFile, setImageFile] = useState<File | null>(null);

// //   // Sites selection
// //   const [siteSearch, setSiteSearch] = useState("");
// //   const [selectedSiteValues, setSelectedSiteValues] = useState<Set<string>>(
// //     new Set()
// //   );

// //   // Filter sites based on search
// //   const filteredSites = useMemo(() => {
// //     if (!siteSearch.trim()) return ALL_SITES;
// //     const q = siteSearch.toLowerCase();
// //     return ALL_SITES.filter(
// //       (s) =>
// //         s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)
// //     );
// //   }, [siteSearch]);

// //   const selectedCount = selectedItems.length;
// //   const selectedSites = useMemo(
// //     () => ALL_SITES.filter((s) => selectedSiteValues.has(s.value)),
// //     [selectedSiteValues]
// //   );
// //   const selectedSitesCount = selectedSites.length;

// //   // Auto-trim sites if items decrease
// //   useEffect(() => {
// //     if (selectedCount === 0) {
// //       setSelectedSiteValues(new Set());
// //       return;
// //     }
// //     if (selectedSiteValues.size <= selectedCount) return;
// //     setSelectedSiteValues((prev) => {
// //       const arr = Array.from(prev).slice(0, selectedCount);
// //       return new Set(arr);
// //     });
// //   }, [selectedCount]);

// //   function toggleSite(siteValue: string, checked: boolean) {
// //     setSelectedSiteValues((prev) => {
// //       const n = new Set(prev);
// //       if (checked) {
// //         if (selectedCount === 0) {
// //           toast.error("Select content first.");
// //           return prev;
// //         }
// //         if (n.size >= selectedCount) {
// //           toast.error(`You can select only ${selectedCount} site(s).`);
// //           return prev;
// //         }
// //         n.add(siteValue);
// //       } else {
// //         n.delete(siteValue);
// //       }
// //       return n;
// //     });
// //   }

// //   // Feature: Auto-select sites based on content count
// //   function handleAutoSelectSites() {
// //     if (selectedCount === 0) {
// //       toast.error("Please select content items from the left first.");
// //       return;
// //     }

// //     const available = filteredSites.slice(0, selectedCount);
// //     if (available.length < selectedCount) {
// //       toast.warning(
// //         `Only ${available.length} visible sites available to select.`
// //       );
// //     }

// //     const newSet = new Set<string>();
// //     available.forEach((s) => newSet.add(s.value));
// //     setSelectedSiteValues(newSet);
// //     toast.success(`Auto-selected ${newSet.size} sites.`);
// //   }

// //   const readyToStart =
// //     selectedCount > 0 && selectedSitesCount === selectedCount;

// //   // Preset load
// //   useEffect(() => {
// //     const p = loadPreset();
// //     if (p) {
// //       setPhone(p.phone ?? "");
// //       setWebsite(p.website ?? "");
// //       setEmail(p.email ?? "");
// //       setCountry(p.address?.country ?? "");
// //       setStateVal(p.address?.state ?? "");
// //       setCity(p.address?.city ?? "");
// //       setZip(p.address?.zip ?? "");
// //       setLine1(p.address?.line1 ?? "");
// //       setFacebook(p.socials?.facebook ?? "");
// //       setTwitter(p.socials?.twitter ?? "");
// //       setLinkedin(p.socials?.linkedin ?? "");
// //       setPinterest(p.socials?.pinterest ?? "");
// //       setInstagram(p.socials?.instagram ?? "");
// //       setYelp(p.socials?.yelp ?? "");
// //       setGmb(p.socials?.gmb ?? "");
// //       if (Array.isArray(p.sites)) {
// //         setSelectedSiteValues(new Set(p.sites));
// //       }
// //     }
// //   }, []);

// //   function handleSavePreset() {
// //     const socials: Socials = {
// //       facebook,
// //       twitter,
// //       linkedin,
// //       pinterest,
// //       instagram,
// //       yelp,
// //       gmb,
// //     };
// //     savePreset({
// //       phone,
// //       website,
// //       email,
// //       address: { country, state, city, zip, line1 },
// //       socials,
// //       sites: Array.from(selectedSiteValues),
// //     });
// //     toast.success("Preset saved");
// //   }

// //   async function handleStart() {
// //     if (!readyToStart) {
// //       toast.error("Select content first, then same number of sites.");
// //       return;
// //     }
// //     try {
// //       const { listings } = await start({
// //         sites: selectedSites.map((s: any) => ({
// //           site: s.value,
// //           username: s.username,
// //           password: s.password,
// //           type: s.type ?? "wordpress",
// //         })),
// //         defaults: {
// //           category,
// //           keywordsDefaults,
// //           imageUrl,
// //           imageFile,
// //           profile: {
// //             phone,
// //             website,
// //             email,
// //             socials: {
// //               facebook,
// //               twitter,
// //               linkedin,
// //               pinterest,
// //               instagram,
// //               yelp,
// //               gmb,
// //             },
// //             address: { country, state, city, zip, line1 },
// //           },
// //         },
// //       });
// //       toast.success(`Direct WP publishing started for ${listings} item(s)`);
// //     } catch (err: any) {
// //       toast.error(err?.message ?? "Failed to start publishing");
// //     }
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
// //       <div className="mx-auto max-w-screen-2xl px-6 py-10">
// //         {/* Top Header */}
// //         <PremiumCard>
// //           <Card className="border-0 shadow-none bg-transparent">
// //             <CardHeader className="pb-6">
// //               <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
// //                 <div className="flex-1">
// //                   <CardTitle className="flex items-center gap-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
// //                     <IconListDetails className="h-8 w-8" />
// //                     WP Content Publisher
// //                   </CardTitle>
// //                   <CardDescription className="text-indigo-600 mt-1 font-medium">
// //                     Select content → Pick matching sites → Publish via API
// //                   </CardDescription>
// //                 </div>
// //                 <div className="flex items-center gap-3 w-full lg:w-auto">
// //                   <div className="relative flex-1 lg:w-[350px]">
// //                     <IconSearch className="h-5 w-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
// //                     <Input
// //                       value={search}
// //                       onChange={(e) => setSearch(e.target.value)}
// //                       placeholder="Search by title or keywords…"
// //                       className="pl-12 bg-white border-indigo-300 rounded-2xl shadow-sm"
// //                     />
// //                   </div>
// //                   <Badge className="rounded-full bg-indigo-100 text-indigo-800 border-indigo-300 px-4 py-2 font-semibold">
// //                     Selected: {selectedCount}/{ALL_SITES.length}
// //                   </Badge>
// //                 </div>
// //               </div>
// //             </CardHeader>
// //           </Card>
// //         </PremiumCard>
// //         {/* 3-column layout */}
// //         <div className="mt-10 grid gap-10 xl:grid-cols-12">
// //           {/* LEFT — Projects Panel */}
// //           <div className="xl:col-span-4">
// //             <div className="sticky top-8 space-y-6">
// //               <PremiumCard>
// //                 <Card className="border-0 shadow-none bg-transparent">
// //                   <CardHeader className="pb-4">
// //                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
// //                       <IconFolder className="h-6 w-6 text-indigo-600" />
// //                       Content Projects
// //                     </CardTitle>
// //                     <CardDescription className="text-indigo-600">
// //                       Choose projects or specific items for posting.
// //                     </CardDescription>
// //                   </CardHeader>
// //                   <CardContent className="space-y-4">
// //                     <div className="md:hidden mb-3">
// //                       <div className="relative">
// //                         <IconSearch className="h-4 w-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
// //                         <Input
// //                           value={search}
// //                           onChange={(e) => setSearch(e.target.value)}
// //                           placeholder="Search title / keywords…"
// //                           className="pl-9 bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                     </div>
// //                     <div className="flex items-center justify-between text-sm text-indigo-600">
// //                       <div className="flex items-center gap-2">
// //                         <Button
// //                           variant="outline"
// //                           size="sm"
// //                           onClick={selectAllVisible}
// //                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
// //                           <IconCircleCheck className="h-4 w-4 mr-2" /> Select
// //                           All Visible
// //                         </Button>
// //                         <Button
// //                           variant="outline"
// //                           size="sm"
// //                           onClick={clearSelection}
// //                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
// //                           <IconCircleX className="h-4 w-4 mr-2" /> Clear All
// //                         </Button>
// //                       </div>
// //                       <span className="font-semibold">
// //                         {filteredProjects.length} Projects
// //                       </span>
// //                     </div>
// //                     <div className="max-h-[650px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300">
// //                       {filteredProjects.length === 0 && (
// //                         <div className="text-sm text-indigo-500 py-8 text-center">
// //                           No content found. Start generating!
// //                         </div>
// //                       )}
// //                       {filteredProjects.map((p, idx) => {
// //                         const expanded = expandedProjectIds.has(p.id);
// //                         const projectSelected = isProjectSelected(p.id);
// //                         const selectedCountInProject = p.items.filter((it) =>
// //                           selectedItemIds.has(it.id)
// //                         ).length;
// //                         const total = p.items.length;
// //                         return (
// //                           <div
// //                             key={p.id}
// //                             className="rounded-2xl ring-1 ring-indigo-200/50 bg-white/80 mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
// //                             {/* Project row */}
// //                             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
// //                               <div className="flex items-center gap-4">
// //                                 <Button
// //                                   variant="ghost"
// //                                   size="icon"
// //                                   onClick={() => toggleProjectExpand(p.id)}
// //                                   className="h-8 w-8 rounded-full hover:bg-indigo-100"
// //                                   aria-label={expanded ? "Collapse" : "Expand"}>
// //                                   {expanded ? (
// //                                     <IconChevronDown className="h-5 w-5 text-indigo-600" />
// //                                   ) : (
// //                                     <IconChevronRight className="h-5 w-5 text-indigo-600" />
// //                                   )}
// //                                 </Button>
// //                                 <Checkbox
// //                                   checked={projectSelected}
// //                                   onCheckedChange={(v) =>
// //                                     setProjectChecked(p.id, !!v)
// //                                   }
// //                                   className={cn(
// //                                     "mr-2 h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// //                                   )}
// //                                   aria-label="Select project"
// //                                 />
// //                                 <span className="text-sm font-bold text-gray-800 tabular-nums">
// //                                   {String(idx + 1).padStart(2, "0")}.
// //                                 </span>
// //                                 <span className="text-sm font-bold text-gray-900">
// //                                   {p.name}
// //                                 </span>
// //                               </div>
// //                               <Badge
// //                                 variant="outline"
// //                                 className={cn(
// //                                   "rounded-full text-sm px-3 py-1",
// //                                   selectedCountInProject
// //                                     ? "border-indigo-600 text-indigo-700 bg-indigo-100"
// //                                     : "border-indigo-300 text-indigo-500"
// //                                 )}>
// //                                 {selectedCountInProject}/{total}
// //                               </Badge>
// //                             </div>
// //                             {/* Items list */}
// //                             {expanded && (
// //                               <div className="border-t border-indigo-100 divide-y divide-indigo-50">
// //                                 {p.items.map((it, iidx) => {
// //                                   const checked = isItemSelected(it.id);
// //                                   return (
// //                                     <div
// //                                       key={it.id}
// //                                       className={cn(
// //                                         "flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 transition-colors",
// //                                         checked &&
// //                                           "bg-indigo-50 ring-1 ring-indigo-200/50"
// //                                       )}>
// //                                       <div className="flex items-center gap-4 min-w-0">
// //                                         <span className="text-xs text-indigo-500 font-semibold w-6 text-right tabular-nums">
// //                                           {iidx + 1}
// //                                         </span>
// //                                         <Checkbox
// //                                           checked={checked}
// //                                           onCheckedChange={(v) =>
// //                                             setItemChecked(p.id, it.id, !!v)
// //                                           }
// //                                           className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// //                                           aria-label="Select item"
// //                                         />
// //                                         <button
// //                                           className="text-left min-w-0 flex-1"
// //                                           onClick={() =>
// //                                             setFocusedItemId(it.id)
// //                                           }>
// //                                           <div className="text-base font-semibold text-gray-900 truncate">
// //                                             {(getItemTitle(it) ||
// //                                               getItemKeywords(it)[0]) ??
// //                                               "Untitled"}
// //                                           </div>
// //                                           <div className="text-sm text-indigo-600 truncate mt-1">
// //                                             {getItemKeywords(it).join(", ")}
// //                                           </div>
// //                                         </button>
// //                                       </div>
// //                                       {checked && (
// //                                         <IconCheck className="h-5 w-5 text-indigo-600 flex-shrink-0" />
// //                                       )}
// //                                     </div>
// //                                   );
// //                                 })}
// //                               </div>
// //                             )}
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               </PremiumCard>
// //             </div>
// //           </div>
// //           {/* CENTER — Defaults + Preview */}
// //           <div className="xl:col-span-5 space-y-6">
// //             <PremiumCard>
// //               <Card className="border-0 shadow-none bg-transparent">
// //                 <CardHeader className="pb-5">
// //                   <CardTitle className="text-xl font-bold text-gray-900">
// //                     Global Post Settings
// //                   </CardTitle>
// //                   <CardDescription className="text-indigo-600">
// //                     These defaults apply across all selected contents (unique
// //                     title/content per site).
// //                   </CardDescription>
// //                 </CardHeader>
// //                 <CardContent className="space-y-6">
// //                   <section className="space-y-3">
// //                     <PremiumSectionTitle
// //                       icon={<IconTags className="h-5 w-5" />}>
// //                       Keywords (Same for All)
// //                     </PremiumSectionTitle>
// //                     <TagsInput
// //                       value={keywordsDefaults}
// //                       onChange={setKeywordsDefaults}
// //                     />
// //                   </section>
// //                   <section className="space-y-3">
// //                     <PremiumSectionTitle>
// //                       Category (Same for All)
// //                     </PremiumSectionTitle>
// //                     <Select value={category} onValueChange={setCategory}>
// //                       <SelectTrigger className="bg-white border-indigo-300 rounded-2xl">
// //                         <SelectValue placeholder="Select a category" />
// //                       </SelectTrigger>
// //                       <SelectContent className="rounded-2xl">
// //                         {CATEGORIES.map((c) => (
// //                           <SelectItem key={c} value={c} className="rounded-xl">
// //                             {c}
// //                           </SelectItem>
// //                         ))}
// //                       </SelectContent>
// //                     </Select>
// //                   </section>
// //                   <section className="space-y-3">
// //                     <PremiumSectionTitle
// //                       icon={<IconPhoto className="h-5 w-5" />}>
// //                       Feature Image (Same for All)
// //                     </PremiumSectionTitle>
// //                     <ImagePicker
// //                       imageUrl={imageUrl}
// //                       onImageUrlChange={setImageUrl}
// //                       file={imageFile}
// //                       onFileChange={setImageFile}
// //                     />
// //                     <p className="text-xs text-indigo-600 font-medium">
// //                       Uploaded to each site as featured image.
// //                     </p>
// //                   </section>
// //                   <section className="space-y-4">
// //                     <PremiumSectionTitle
// //                       icon={<IconMap2 className="h-5 w-5" />}>
// //                       Location Details
// //                     </PremiumSectionTitle>
// //                     <div className="grid gap-4 md:grid-cols-2">
// //                       <div>
// //                         <Label className="text-sm font-semibold text-gray-700">
// //                           Country
// //                         </Label>
// //                         <Input
// //                           value={country}
// //                           onChange={(e) => setCountry(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                       <div>
// //                         <Label className="text-sm font-semibold text-gray-700">
// //                           State/Province
// //                         </Label>
// //                         <Input
// //                           value={state}
// //                           onChange={(e) => setStateVal(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                       <div>
// //                         <Label className="text-sm font-semibold text-gray-700">
// //                           City
// //                         </Label>
// //                         <Input
// //                           value={city}
// //                           onChange={(e) => setCity(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                       <div>
// //                         <Label className="text-sm font-semibold text-gray-700">
// //                           ZIP/Postal Code
// //                         </Label>
// //                         <Input
// //                           value={zip}
// //                           onChange={(e) => setZip(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                     </div>
// //                     <div>
// //                       <Label className="text-sm font-semibold text-gray-700">
// //                         Street Address
// //                       </Label>
// //                       <Input
// //                         value={line1}
// //                         onChange={(e) => setLine1(e.target.value)}
// //                         className="bg-white border-indigo-300 rounded-xl"
// //                       />
// //                     </div>
// //                   </section>
// //                   <section className="space-y-4">
// //                     <PremiumSectionTitle
// //                       icon={<IconAddressBook className="h-5 w-5" />}>
// //                       Contact Information
// //                     </PremiumSectionTitle>
// //                     <div className="grid gap-4 md:grid-cols-3">
// //                       <div>
// //                         <Label className="text-sm font-semibold text-gray-700">
// //                           Phone
// //                         </Label>
// //                         <Input
// //                           value={phone}
// //                           onChange={(e) => setPhone(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                       <div>
// //                         <Label className="text-sm font-semibold text-gray-700">
// //                           Website
// //                         </Label>
// //                         <div className="flex items-center">
// //                           <IconWorldWww className="h-5 w-5 mr-3 text-indigo-500" />
// //                           <Input
// //                             value={website}
// //                             onChange={(e) => setWebsite(e.target.value)}
// //                             className="bg-white border-indigo-300 rounded-xl flex-1"
// //                           />
// //                         </div>
// //                       </div>
// //                       <div>
// //                         <Label className="text-sm font-semibold text-gray-700">
// //                           Email
// //                         </Label>
// //                         <div className="flex items-center">
// //                           <IconAt className="h-5 w-5 mr-3 text-indigo-500" />
// //                           <Input
// //                             value={email}
// //                             onChange={(e) => setEmail(e.target.value)}
// //                             className="bg-white border-indigo-300 rounded-xl flex-1"
// //                           />
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </section>
// //                   <section className="space-y-4">
// //                     <PremiumSectionTitle
// //                       icon={<IconWorld className="h-5 w-5" />}>
// //                       Social Connections
// //                     </PremiumSectionTitle>
// //                     <div className="grid gap-4 md:grid-cols-2">
// //                       <div>
// //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// //                           <IconBrandFacebook className="h-4 w-4 text-blue-600" />{" "}
// //                           Facebook
// //                         </Label>
// //                         <Input
// //                           value={facebook}
// //                           onChange={(e) => setFacebook(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                       <div>
// //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// //                           <IconBrandTwitter className="h-4 w-4 text-blue-400" />{" "}
// //                           Twitter / X
// //                         </Label>
// //                         <Input
// //                           value={twitter}
// //                           onChange={(e) => setTwitter(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                       <div>
// //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// //                           <IconBrandLinkedin className="h-4 w-4 text-blue-700" />{" "}
// //                           LinkedIn
// //                         </Label>
// //                         <Input
// //                           value={linkedin}
// //                           onChange={(e) => setLinkedin(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                       <div>
// //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// //                           <IconBrandPinterest className="h-4 w-4 text-red-500" />{" "}
// //                           Pinterest
// //                         </Label>
// //                         <Input
// //                           value={pinterest}
// //                           onChange={(e) => setPinterest(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                       <div>
// //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// //                           <IconBrandInstagram className="h-4 w-4 text-pink-500" />{" "}
// //                           Instagram
// //                         </Label>
// //                         <Input
// //                           value={instagram}
// //                           onChange={(e) => setInstagram(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                       <div>
// //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// //                           <IconBrandCpp className="h-4 w-4 text-yellow-600" />{" "}
// //                           Yelp
// //                         </Label>
// //                         <Input
// //                           value={yelp}
// //                           onChange={(e) => setYelp(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                       <div className="md:col-span-2">
// //                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
// //                           <IconBrandGoogle className="h-4 w-4 text-red-500" />{" "}
// //                           Google Business
// //                         </Label>
// //                         <Input
// //                           value={gmb}
// //                           onChange={(e) => setGmb(e.target.value)}
// //                           className="bg-white border-indigo-300 rounded-xl"
// //                         />
// //                       </div>
// //                     </div>
// //                   </section>
// //                 </CardContent>
// //               </Card>
// //             </PremiumCard>
// //             <PremiumCard>
// //               <Card className="border-0 shadow-none bg-transparent">
// //                 <CardHeader className="pb-4">
// //                   <CardTitle className="text-xl font-bold text-gray-900">
// //                     Live Preview
// //                   </CardTitle>
// //                   <CardDescription className="text-indigo-600">
// //                     Select an item from the left to see a real-time preview
// //                     here.
// //                   </CardDescription>
// //                 </CardHeader>
// //                 <CardContent className="space-y-5">
// //                   <div>
// //                     <Label className="text-sm font-semibold text-gray-700">
// //                       Unique Title
// //                     </Label>
// //                     <Input
// //                       value={focusedItem ? getItemTitle(focusedItem) : ""}
// //                       readOnly
// //                       placeholder="Click an item to preview its title"
// //                       className="bg-indigo-50/50 border-indigo-300 rounded-xl mt-1 font-semibold"
// //                     />
// //                   </div>
// //                   <div>
// //                     <Label className="text-sm font-semibold text-gray-700">
// //                       Unique Content
// //                     </Label>
// //                     <Textarea
// //                       value={focusedItem ? getItemHtml(focusedItem) : ""}
// //                       readOnly
// //                       placeholder="Click an item to preview its full content"
// //                       className="min-h-[200px] bg-indigo-50/50 border-indigo-300 rounded-xl mt-1"
// //                     />
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             </PremiumCard>
// //           </div>
// //           {/* RIGHT — Controls + Processing Box */}
// //           <div className="xl:col-span-3">
// //             <div className="sticky top-8 space-y-6">
// //               <PremiumCard>
// //                 <Card className="border-0 shadow-none bg-transparent">
// //                   <CardHeader className="pb-5">
// //                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
// //                       <IconSparkles className="h-6 w-6 text-purple-600" /> API
// //                       Publisher
// //                     </CardTitle>
// //                     <CardDescription className="text-indigo-600">
// //                       Match content count with sites for unique posts.
// //                     </CardDescription>
// //                   </CardHeader>
// //                   <CardContent className="space-y-6">
// //                     {/* SITES CHECKBOX LIST */}
// //                     <section className="space-y-3">
// //                       <Label className="text-sm font-bold flex items-center gap-3 text-gray-900">
// //                         <IconGlobe className="h-5 w-5 text-indigo-600" /> Target
// //                         Sites ({selectedSitesCount}/{selectedCount || 0})
// //                       </Label>

// //                       {/* Site Search & Quick Actions */}
// //                       <div className="space-y-2">
// //                         <div className="relative">
// //                           <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
// //                           <Input
// //                             value={siteSearch}
// //                             onChange={(e) => setSiteSearch(e.target.value)}
// //                             placeholder="Filter sites..."
// //                             className="pl-9 bg-white border-indigo-200 rounded-xl text-sm h-9"
// //                           />
// //                         </div>
// //                         <div className="flex gap-2">
// //                           <Button
// //                             size="sm"
// //                             variant="outline"
// //                             className="flex-1 rounded-lg border-indigo-200 text-xs text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
// //                             onClick={handleAutoSelectSites}
// //                             title="Auto-select top available sites matching content count">
// //                             <IconRefresh className="h-3 w-3 mr-1.5" />
// //                             Auto-Fill Sites
// //                           </Button>
// //                           <Button
// //                             size="sm"
// //                             variant="outline"
// //                             className="rounded-lg border-red-200 text-xs text-red-600 bg-red-50/50 hover:bg-red-100"
// //                             onClick={() => setSelectedSiteValues(new Set())}
// //                             title="Clear site selection">
// //                             <IconTrash className="h-3 w-3" />
// //                           </Button>
// //                         </div>
// //                       </div>

// //                       {selectedCount === 0 && (
// //                         <div className="text-sm text-indigo-500 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
// //                           👈 Begin by selecting content on the left.
// //                         </div>
// //                       )}

// //                       <div className="rounded-2xl ring-1 ring-indigo-200 bg-white/80 divide-y divide-indigo-50 shadow-sm max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300">
// //                         {filteredSites.slice(0, 50).map((s) => {
// //                           // Limit to 50 for UI performance if list is huge
// //                           const isChecked = selectedSiteValues.has(s.value);
// //                           const disableNew =
// //                             !isChecked &&
// //                             (selectedSitesCount >= selectedCount ||
// //                               selectedCount === 0);
// //                           return (
// //                             <label
// //                               key={s.value}
// //                               className={cn(
// //                                 "flex items-center justify-between gap-4 px-4 py-3 cursor-pointer transition-all hover:bg-indigo-50/50",
// //                                 isChecked &&
// //                                   "bg-indigo-50/80 ring-1 ring-indigo-200/50",
// //                                 disableNew && "opacity-70 cursor-not-allowed"
// //                               )}>
// //                               <div className="flex items-center gap-3 min-w-0">
// //                                 <Checkbox
// //                                   checked={isChecked}
// //                                   disabled={disableNew}
// //                                   onCheckedChange={(v) =>
// //                                     toggleSite(s.value, !!v)
// //                                   }
// //                                   className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
// //                                 />
// //                                 <span className="text-sm font-semibold text-gray-900 truncate">
// //                                   {s.label}
// //                                 </span>
// //                               </div>
// //                             </label>
// //                           );
// //                         })}
// //                         {filteredSites.length === 0 && (
// //                           <div className="p-4 text-center text-sm text-gray-500">
// //                             No sites match "{siteSearch}"
// //                           </div>
// //                         )}
// //                       </div>
// //                       <p className="text-xs text-indigo-600 font-medium">
// //                         Pro Tip: {selectedCount} contents require exactly{" "}
// //                         {selectedCount} sites.
// //                       </p>
// //                     </section>
// //                     <Separator className="border-indigo-200" />
// //                     <div className="grid gap-4">
// //                       <Button
// //                         onClick={handleStart}
// //                         disabled={!readyToStart || isStarting}
// //                         className={cn(
// //                           "rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 h-12 font-bold text-lg",
// //                           !readyToStart && "opacity-70 cursor-not-allowed"
// //                         )}>
// //                         <IconPlayerPlay className="h-5 w-5 mr-3" />
// //                         {isStarting
// //                           ? "Publishing…"
// //                           : `Publish Now (${selectedCount})`}
// //                       </Button>
// //                       <div className="flex items-center justify-between text-sm text-indigo-600">
// //                         <span className="flex items-center gap-2 font-medium">
// //                           <IconCheck className="h-4 w-4" />
// //                           {selectedCount} Contents Ready
// //                         </span>
// //                         <span className="flex items-center gap-2 font-medium">
// //                           <IconGlobe className="h-4 w-4" />
// //                           {selectedSitesCount} Sites Locked
// //                         </span>
// //                       </div>
// //                       {jobId && status === "running" && (
// //                         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
// //                           <div className="flex items-center justify-between text-sm text-indigo-600 mb-3 font-medium">
// //                             <span>Publishing: {jobId.slice(-6)}</span>
// //                             <span>{progress}% Complete</span>
// //                           </div>
// //                           <Progress
// //                             value={progress}
// //                             className="h-3 bg-indigo-200 rounded-full"
// //                           />
// //                         </div>
// //                       )}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               </PremiumCard>
// //               {/* Processing Box - Runs/Backlinks */}
// //               {runs.length > 0 && (
// //                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
// //                   <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
// //                     <IconSparkles className="h-5 w-5 text-green-600" />
// //                     Publishing Results
// //                   </h3>

// //                   {runs.map((run) => (
// //                     <div
// //                       key={run.jobId}
// //                       className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
// //                       {/* Run Header */}
// //                       <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
// //                         <div className="flex flex-col">
// //                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
// //                             Job ID
// //                           </span>
// //                           <span className="text-sm font-mono text-slate-700">
// //                             {run.jobId ? run.jobId.slice(-8) : "Unknown"}
// //                           </span>
// //                         </div>
// //                         <Badge
// //                           className={cn(
// //                             "rounded-full px-3 py-1 shadow-sm",
// //                             run.status === "done"
// //                               ? "bg-green-100 text-green-700 border-green-200"
// //                               : run.status === "error"
// //                               ? "bg-red-100 text-red-700 border-red-200"
// //                               : "bg-blue-100 text-blue-700 border-blue-200"
// //                           )}>
// //                           {run.status === "done"
// //                             ? "COMPLETED"
// //                             : run.status.toUpperCase()}
// //                         </Badge>
// //                       </div>

// //                       {/* Backlinks List */}
// //                       {(run.backlinks?.length ?? 0) > 0 ? (
// //                         <div className="divide-y divide-slate-100">
// //                           {run.backlinks!.map((link, idx) => {
// //                             const url = new URL(link);
// //                             const hostname = url.hostname.replace("www.", "");
// //                             return (
// //                               <div
// //                                 key={idx}
// //                                 className="group flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
// //                                 <div className="flex flex-col min-w-0 pr-4">
// //                                   <span className="text-sm font-bold text-slate-800">
// //                                     {hostname}
// //                                   </span>
// //                                   <a
// //                                     href={link}
// //                                     target="_blank"
// //                                     rel="noopener noreferrer"
// //                                     className="text-xs text-blue-600 hover:underline truncate block">
// //                                     {link}
// //                                   </a>
// //                                 </div>
// //                                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
// //                                   <Button
// //                                     size="icon"
// //                                     variant="ghost"
// //                                     className="h-8 w-8 rounded-full bg-white border border-slate-200 hover:bg-indigo-50 text-slate-600"
// //                                     onClick={() => {
// //                                       navigator.clipboard.writeText(link);
// //                                       toast.success("Link copied!");
// //                                     }}
// //                                     title="Copy Link">
// //                                     <IconCopy className="h-4 w-4" />
// //                                   </Button>
// //                                   <a
// //                                     href={link}
// //                                     target="_blank"
// //                                     rel="noopener noreferrer">
// //                                     <Button
// //                                       size="icon"
// //                                       variant="ghost"
// //                                       className="h-8 w-8 rounded-full bg-white border border-slate-200 hover:bg-indigo-50 text-slate-600"
// //                                       title="Open Link">
// //                                       <IconExternalLink className="h-4 w-4" />
// //                                     </Button>
// //                                   </a>
// //                                 </div>
// //                               </div>
// //                             );
// //                           })}
// //                         </div>
// //                       ) : (
// //                         <div className="p-4 text-center text-sm text-slate-400 italic">
// //                           No backlinks generated yet...
// //                         </div>
// //                       )}

// //                       {/* Footer Actions */}
// //                       <div className="bg-slate-50 p-3 flex gap-2 border-t border-slate-100">
// //                         <Button
// //                           variant="outline"
// //                           size="sm"
// //                           className="flex-1 bg-white border-slate-200 hover:bg-green-50 hover:text-green-700 text-slate-600"
// //                           onClick={() => {
// //                             const all = (run.backlinks || []).join("\n");
// //                             navigator.clipboard.writeText(all);
// //                             toast.success("All links copied!");
// //                           }}>
// //                           <IconCopy className="h-3.5 w-3.5 mr-2" />
// //                           Copy All
// //                         </Button>
// //                         <Button
// //                           variant="outline"
// //                           size="sm"
// //                           className="flex-1 bg-white border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-600"
// //                           onClick={() => {
// //                             if (run.jobId) {
// //                               downloadRunExcel(
// //                                 run.jobId,
// //                                 `report-${run.jobId.slice(-6)}.xlsx`
// //                               );
// //                             }
// //                           }}>
// //                           <IconListDetails className="h-3.5 w-3.5 mr-2" />
// //                           Export Excel
// //                         </Button>
// //                       </div>

// //                       {/* Terminal-style Logs */}
// //                       {(run.logs ?? []).length > 0 && (
// //                         <details className="group border-t border-slate-100">
// //                           <summary className="cursor-pointer bg-slate-100 p-2 text-xs font-semibold text-slate-600 flex justify-between px-4 group-open:bg-slate-200">
// //                             <span>System Logs ({run.logs!.length})</span>
// //                             <IconChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
// //                           </summary>
// //                           <div className="bg-slate-900 text-green-400 p-4 text-xs font-mono max-h-40 overflow-auto whitespace-pre-wrap">
// //                             {run.logs!.map((log, i) => (
// //                               <div key={i} className="mb-1">
// //                                 <span className="text-slate-500 mr-2">
// //                                   {">"}
// //                                 </span>
// //                                 {log}
// //                               </div>
// //                             ))}
// //                           </div>
// //                         </details>
// //                       )}
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}

// //               {/* good code  */}

// //               <div className="rounded-2xl ring-1 ring-indigo-200 bg-white shadow-lg p-5 text-sm text-gray-800 border border-indigo-100/50">
// //                 <p className="mb-2 flex items-center gap-2">
// //                   ✅ <b>Workflow:</b> Select → Match → Publish (Direct WP API)
// //                 </p>
// //                 <p className="mb-4">
// //                   🚀 <b>Unique per site:</b> Title + Content | Same: Image +
// //                   Keywords + Category
// //                 </p>
// //                 <div className="flex items-center gap-3">
// //                   <Button
// //                     variant="outline"
// //                     onClick={handleSavePreset}
// //                     className="rounded-full border-indigo-300 hover:bg-indigo-50">
// //                     💾 Save Config
// //                   </Button>
// //                   <Badge className="rounded-full bg-purple-100 text-purple-800 border-purple-300">
// //                     50+ Sites Ready
// //                   </Badge>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }





// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator";
// import { Progress } from "@/components/ui/progress";
// import { Checkbox } from "@/components/ui/checkbox";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   IconWorld,
//   IconListDetails,
//   IconPlayerPlay,
//   IconSparkles,
//   IconAddressBook,
//   IconTags,
//   IconMap2,
//   IconPhoto,
//   IconWorldWww,
//   IconAt,
//   IconBrandFacebook,
//   IconBrandTwitter,
//   IconBrandLinkedin,
//   IconBrandPinterest,
//   IconBrandInstagram,
//   IconBrandCpp, // Yelp placeholder
//   IconBrandGoogle,
//   IconChevronDown,
//   IconChevronRight,
//   IconSearch,
//   IconFolder,
//   IconCheck,
//   IconCircleCheck,
//   IconCircleX,
//   IconGlobe,
//   IconCopy,
//   IconExternalLink,
//   IconTrash,
//   IconRefresh,
// } from "@tabler/icons-react";
// import {
//   useListingAutomation,
//   type GeneratedItem,
//   type Socials,
// } from "./hooks/useListingAutomation";

// /* ─────────────────────────────────────────────────────────────
//  * Constants - Full 50+ Sites List (Merged)
//  * ────────────────────────────────────────────────────────────*/
// const CATEGORIES = [
//   "Electronics",
//   "Home & Garden",
//   "Vehicles",
//   "Jobs",
//   "Services",
//   "Real Estate",
//   "Pets",
//   "Books",
//   "Fashion",
//   "Sports",
//   "UK",
//   "Rajasthan",
//   "Punjab",
//   "Maharashtra",
//   "Gujarat",
//   "Tamil Nadu",
//   "Kerala",
//   "West Bengal",
//   "Karnataka",
//   "Andhra Pradesh",
//   "Telangana",
//   "Odisha",
//   "Bihar",
//   "Chhattisgarh",
//   "Uttar Pradesh",
//   "Haryana",
//   "Delhi",
// ];

// const ALL_WORDPRESS_SITES = [
//   {
//     value: "linuxpatent.com",
//     label: "linuxpatent.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "vSvd cd8e aY9V E9vy EtU9 bkAi",
//     type: "wordpress",
//   },
//   {
//     value: "rayseries.com",
//     label: "rayseries.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "P2kl EHRS 6gLi drVQ 4Xb0 TIlR",
//     type: "wordpress",
//   },
//   {
//     value: "pasfait.com",
//     label: "pasfait.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "rYXn vala ZImc guqH jHg1 yAbF",
//     type: "wordpress",
//   },
//   {
//     value: "scotchsavvy.com",
//     label: "scotchsavvy.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "pNfP EhU6 BhVi pHPC vT7u Gh7Z",
//     type: "wordpress",
//   },
//   {
//     value: "extremesportsgoons.info",
//     label: "extremesportsgoons.info (Guest Posting)",
//     username: "FlowTrack",
//     password: "S2ll 7cby lhda nab6 XzIG vCyk",
//     type: "wordpress",
//   },
//   {
//     value: "creeksidereflections.com",
//     label: "creeksidereflections.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "Fqcl hdHo ipZ2 l4CK Sbmn Tat4",
//     type: "wordpress",
//   },
//   {
//     value: "PiratesGab.com",
//     label: "PiratesGab.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "jRFw Vqoi 3Xj5 TQAy koRx 09z0",
//     type: "wordpress",
//   },
//   {
//     value: "theSportchampion.com",
//     label: "theSportchampion.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "7Bjq nNmf b4Zf BX5A Lujg SQhl",
//     type: "wordpress",
//   },
//   {
//     value: "DataDrillAmerAsia.com",
//     label: "DataDrillAmerAsia.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "3Zpc ouuZ 4y4q 3Txk ceC2 Hi2Y",
//     type: "wordpress",
//   },
//   {
//     value: "htpsouthdowns.com",
//     label: "htpsouthdowns.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "aGzE azG9 22VN iuQC T1x3 fW8x",
//     type: "wordpress",
//   },
//   {
//     value: "UsJobSandGigs.com",
//     label: "UsJobSandGigs.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "OA81 7Ime Clim kHmt 5wi7 Ezac",
//     type: "wordpress",
//   },
//   {
//     value: "VictoriesSport.com",
//     label: "VictoriesSport.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "csSb IsEN Wx5b X6qm xgFC tvaH",
//     type: "wordpress",
//   },
//   {
//     value: "veroniquelacoste.com",
//     label: "veroniquelacoste.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "74J7 vJxc qH5O 41a8 CeWn uDLH",
//     type: "wordpress",
//   },
//   {
//     value: "missonthemove.com",
//     label: "missonthemove.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "WVU9 IFtJ Ohme L7jg 1ibA 939a",
//     type: "wordpress",
//   },
//   {
//     value: "pcnfa.com",
//     label: "pcnfa.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "1h46 Esbn jy3k Dh5e l3O6 cSXQ",
//     type: "wordpress",
//   },
//   {
//     value: "theangelfilm.com",
//     label: "theangelfilm.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "eU2M XhWw 3DUP um7z II8F Db1W",
//     type: "wordpress",
//   },
//   {
//     value: "soerq.com",
//     label: "soerq.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "wog2 w87h QRen Kmud 7G98 NOOE",
//     type: "wordpress",
//   },
//   {
//     value: "paydayard.com",
//     label: "paydayard.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "05d8 CuBb 23Iu eaU0 C165 dx9J",
//     type: "wordpress",
//   },
//   {
//     value: "trekbadlands.com",
//     label: "trekbadlands.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "K01N zsGd 6Y2Z fxTo JWbL lLab",
//     type: "wordpress",
//   },
//   {
//     value: "pawmeism.com",
//     label: "pawmeism.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "hDNV z0Vy rQTu PAqI 1D5A ELgv",
//     type: "wordpress",
//   },
//   {
//     value: "demokore.com",
//     label: "demokore.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "q5fC VDeX 4os5 sUr6 J2RU pSxY",
//     type: "wordpress",
//   },
//   {
//     value: "moviemotives.com",
//     label: "moviemotives.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "ScpA VN2X EccU iofU Aohq saoNScpA VN2X EccU iofU Aohq saoN",
//     type: "wordpress",
//   },
//   {
//     value: "mitchellstover.com",
//     label: "mitchellstover.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "GRHW uOKp XHko fco3 ae6L iQvl",
//     type: "wordpress",
//   },
//   {
//     value: "fametize.com",
//     label: "fametize.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "MqSV Ap8X fI39 X50H OzcC WJmc",
//     type: "wordpress",
//   },
//   {
//     value: "luocsu.com",
//     label: "luocsu.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "wgKC TTYQ mP0d cOek lSDt Ooy7",
//     type: "wordpress",
//   },
//   {
//     value: "inststagram.com",
//     label: "inststagram.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "JDYO 88vG J16G ot8u PMzM od0J",
//     type: "wordpress",
//   },
//   {
//     value: "ashopear.com",
//     label: "ashopear.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "zD91 Q3AR xfq1 lo2B wKDV Ad9m",
//     type: "wordpress",
//   },
//   {
//     value: "charles6767.com",
//     label: "charles6767.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "N3il WPF1 XcUf HNHA ntTO ukDC",
//     type: "wordpress",
//   },
//   {
//     value: "berlintype.com",
//     label: "berlintype.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "TBqx iSM7 Tc0c ige4 2tTO 958e",
//     type: "wordpress",
//   },
//   {
//     value: "sprintcybermonday.com",
//     label: "sprintcybermonday.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "ZU2e xkY1 adLg JPsN MhvU pIrM",
//     type: "wordpress",
//   },
//   {
//     value: "jamesvirtudazo.com",
//     label: "jamesvirtudazo.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "zDCU TmdE sh4k FHRv wwtU 4t4K",
//     type: "wordpress",
//   },
//   {
//     value: "partyprivee.com",
//     label: "partyprivee.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "zqqk JFzo peli 1NuW jJoU e4eT",
//     type: "wordpress",
//   },
//   {
//     value: "launcheell.com",
//     label: "launcheell.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "HVMo ezSe 9Dew GyT6 AXfK s0BG",
//     type: "wordpress",
//   },
//   {
//     value: "cruitholidayhome.com",
//     label: "cruitholidayhome.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "oNeJ n9x7 KcL3 lnJ6 xGxE CdDG",
//     type: "wordpress",
//   },
//   {
//     value: "yhbdvideo.com",
//     label: "yhbdvideo.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "oNeJ n9x7 KcL3 lnJ6 xGxE CdDG",
//     type: "wordpress",
//   },
//   {
//     value: "hmboot.com",
//     label: "hmboot.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "DRf7 Wh6i 5G2W gLVi 6I7J 2ZwG",
//     type: "wordpress",
//   },
//   {
//     value: "allaboutlaptop.com",
//     label: "allaboutlaptop.com (Guest Posting)",
//     username: "FlowTrack",
//     password: "8CfX jdb4 fFS6 McTU CyEN 1nHL",
//     type: "wordpress",
//   },
//   {
//     value: "photosdp.net",
//     label: "photosdp.net (Guest Posting)",
//     username: "FlowTrack",
//     password: "o02P LuIY NCIw jHjv himW 3Zqe",
//     type: "wordpress",
//   },
//   {
//     value: "melanzona.com",
//     label: "melanzona.com (Guest Posting)",
//     username: "Hal",
//     password: "K5Cm DGdD YNOu AsHD oP1D oUYy",
//     type: "wordpress",
//   },
//   {
//     value: "jutzstuff.com",
//     label: "jutzstuff.com (Guest Posting)",
//     username: "Eli",
//     password: "fyYX RwbX Tybp jIvZ XcXo perK",
//     type: "wordpress",
//   },
//   {
//     value: "mypracticemaxx.com",
//     label: "mypracticemaxx.com (Guest Posting)",
//     username: "Roz",
//     password: "EL1E qnHZ U62o HrHI 79vH DiVB",
//     type: "wordpress",
//   },
//   {
//     value: "vuepella.com",
//     label: "vuepella.com (Guest Posting)",
//     username: "Ike",
//     password: "9oO1 brtb atQ4 FnjA SAKo wmWO",
//     type: "wordpress",
//   },
//   {
//     value: "tfajtrading.com",
//     label: "tfajtrading.com (Guest Posting)",
//     username: "Fay",
//     password: "P2VX xq4F LN5I gonc y0K2 UfsT",
//     type: "wordpress",
//   },
//   {
//     value: "postmyads.org",
//     label: "postmyads.org (Guest Posting)",
//     username: "FlowTrack",
//     password: "94FL ejV8 PYyb bKsJ 5sNj 4s3t",
//     type: "wordpress",
//   },
// ];

// const ALL_SITES = ALL_WORDPRESS_SITES; // Merged into one list

// /* ─────────────────────────────────────────────────────────────
//  * Local-storage loader
//  * ──────────────────────────────────────────────────────────*/
// function loadGeneratedItems(): GeneratedItem[] {
//   const keys = ["content_items_v1", "content-items", "seomatic_content_items"];
//   for (const k of keys) {
//     try {
//       const raw = localStorage.getItem(k);
//       if (raw) {
//         const arr = JSON.parse(raw);
//         if (Array.isArray(arr)) return arr;
//       }
//     } catch {}
//   }
//   try {
//     const raw =
//       sessionStorage.getItem("open-content-item_v1") ??
//       localStorage.getItem("open-content-item_v1_fallback");
//     if (raw) {
//       const it = JSON.parse(raw);
//       if (it && typeof it === "object") return [it];
//     }
//   } catch {}
//   return [];
// }

// /* ─────────────────────────────────────────────────────────────
//  * UI Helpers
//  * ──────────────────────────────────────────────────────────*/
// function PremiumCard({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="rounded-3xl ring-1 ring-indigo-200/50 bg-gradient-to-br from-white via-indigo-50/30 to-white shadow-xl overflow-hidden border border-indigo-100/50">
//       <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
//       {children}
//     </div>
//   );
// }
// function PremiumSectionTitle({
//   icon,
//   children,
// }: {
//   icon?: React.ReactNode;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex items-center gap-3 text-base font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text ">
//       {icon}
//       {children}
//     </div>
//   );
// }

// /* Tags Input */
// function TagsInput({
//   value,
//   onChange,
//   placeholder = "Type keyword and press Enter",
// }: {
//   value: string[];
//   onChange: (tags: string[]) => void;
//   placeholder?: string;
// }) {
//   const [draft, setDraft] = useState("");
//   function addTagFromDraft() {
//     const parts = draft
//       .split(/[,\n]/)
//       .map((s) => s.trim())
//       .filter(Boolean);
//     if (parts.length) {
//       const set = new Set([...value, ...parts]);
//       onChange(Array.from(set));
//       setDraft("");
//     }
//   }
//   return (
//     <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
//       <div className="flex flex-wrap gap-2 mb-3">
//         {value.map((t) => (
//           <span
//             key={t}
//             className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-800 px-3 py-1.5 text-sm ring-1 ring-indigo-300/50 shadow-sm">
//             <IconTags className="h-3.5 w-3.5" />
//             {t}
//             <button
//               onClick={() => onChange(value.filter((x) => x !== t))}
//               className="ml-1 hover:text-indigo-900 transition-colors"
//               aria-label={`Remove ${t}`}>
//               ×
//             </button>
//           </span>
//         ))}
//       </div>
//       <Input
//         value={draft}
//         onChange={(e) => setDraft(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") {
//             e.preventDefault();
//             addTagFromDraft();
//           }
//           if (e.key === "Backspace" && !draft && value.length) {
//             onChange(value.slice(0, -1));
//           }
//         }}
//         placeholder={placeholder}
//         className="bg-white border-indigo-300"
//       />
//       <p className="text-xs text-indigo-600 mt-2 font-medium">
//         Use Enter or comma to add
//       </p>
//     </div>
//   );
// }

// /* Image Picker */
// function ImagePicker({
//   imageUrl,
//   onImageUrlChange,
//   file,
//   onFileChange,
// }: {
//   imageUrl: string;
//   onImageUrlChange: (v: string) => void;
//   file: File | null;
//   onFileChange: (f: File | null) => void;
// }) {
//   const [previewUrl, setPreviewUrl] = useState<string>("");
//   useEffect(() => {
//     if (file) {
//       const u = URL.createObjectURL(file);
//       setPreviewUrl(u);
//       return () => {
//         URL.revokeObjectURL(u);
//       };
//     }
//     setPreviewUrl(imageUrl || "");
//   }, [file, imageUrl]);
//   const preview = previewUrl;
//   return (
//     <div className="grid gap-4">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <Label className="text-sm font-semibold text-gray-700">
//             Image URL
//           </Label>
//           <Input
//             placeholder="https://example.com/image.jpg"
//             value={imageUrl}
//             onChange={(e) => onImageUrlChange(e.target.value)}
//             className="bg-white border-indigo-300"
//           />
//         </div>
//         <div>
//           <Label className="text-sm font-semibold text-gray-700">
//             Upload Image
//           </Label>
//           <div className="flex items-center gap-3">
//             <Input
//               type="file"
//               accept="image/*"
//               className="bg-white border-indigo-300"
//               onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
//             />
//             {file && (
//               <Badge
//                 variant="outline"
//                 className="rounded-full bg-indigo-100 border-indigo-300 text-indigo-700">
//                 {file.name}
//               </Badge>
//             )}
//           </div>
//         </div>
//       </div>
//       {preview ? (
//         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
//           <img
//             src={preview}
//             alt="preview"
//             className="max-h-64 w-full rounded-xl object-cover shadow-md"
//           />
//         </div>
//       ) : (
//         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-100/50 p-6 text-sm text-indigo-500 flex items-center justify-center">
//           No preview available
//         </div>
//       )}
//     </div>
//   );
// }

// /* Presets */
// const PRESET_KEY = "classified_automation_preset_v2";
// function savePreset(data: any) {
//   localStorage.setItem(PRESET_KEY, JSON.stringify(data));
// }
// function loadPreset(): any | null {
//   try {
//     const raw = localStorage.getItem(PRESET_KEY);
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// }

// /* Fake uploader (replace with real if needed) */
// async function uploadImageAndGetUrl(file: File): Promise<string> {
//   return URL.createObjectURL(file); // Placeholder - hook handles real upload
// }

// /* Tiny helpers from items */
// const getItemTitle = (it: GeneratedItem) => it.title ?? "";
// const getItemHtml = (it: GeneratedItem) =>
//   (it.html ?? it.generatedContent ?? "").toString();
// function getItemKeywords(it: GeneratedItem): string[] {
//   if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
//   if (typeof it.keyword === "string")
//     return it.keyword
//       .split(/[,\|]/)
//       .map((s) => s.trim())
//       .filter(Boolean);
//   return [];
// }

// /* ─────────────────────────────────────────────────────────────
//  * MAIN
//  * ──────────────────────────────────────────────────────────*/
// export default function ClassifiedAutomationPage() {
//   /* Load all generated items */
//   const [items, setItems] = useState<GeneratedItem[]>([]);
//   useEffect(() => setItems(loadGeneratedItems()), []);

//   /* Hook wiring */
//   const {
//     search,
//     setSearch,
//     filteredProjects,
//     expandedProjectIds,
//     toggleProjectExpand,
//     selectedItemIds,
//     isProjectSelected,
//     isItemSelected,
//     setProjectChecked,
//     setItemChecked,
//     selectAllVisible,
//     clearSelection,
//     setFocusedItemId,
//     focusedItem,
//     selectedItems,
//     start,
//     isStarting,
//     jobId,
//     progress,
//     status,
//     runs,
//     downloadRunExcel,
//   } = useListingAutomation(items, {
//     uploadImage: uploadImageAndGetUrl,
//     statusPollIntervalMs: 1500,
//     maxPollMinutes: 15,
//     maxSelectableItems: ALL_SITES.length,
//     onMaxExceeded: (max) =>
//       toast.error(`Max ${max} contents only (sites limit).`),
//   });

//   /* Defaults (apply to all selected items) */
//   const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
//   const [category, setCategory] = useState<string>("");
//   // Contact / profile
//   const [phone, setPhone] = useState("");
//   const [website, setWebsite] = useState("");
//   const [email, setEmail] = useState("");
//   // Socials
//   const [facebook, setFacebook] = useState("");
//   const [twitter, setTwitter] = useState("");
//   const [linkedin, setLinkedin] = useState("");
//   const [pinterest, setPinterest] = useState("");
//   const [instagram, setInstagram] = useState("");
//   const [yelp, setYelp] = useState("");
//   const [gmb, setGmb] = useState("");
//   // Address
//   const [country, setCountry] = useState("");
//   const [state, setStateVal] = useState("");
//   const [city, setCity] = useState("");
//   const [zip, setZip] = useState("");
//   const [line1, setLine1] = useState("");
//   // Default image
//   const [imageUrl, setImageUrl] = useState("");
//   const [imageFile, setImageFile] = useState<File | null>(null);

//   // Sites selection
//   const [siteSearch, setSiteSearch] = useState("");
//   const [selectedSiteValues, setSelectedSiteValues] = useState<Set<string>>(
//     new Set()
//   );

//   // Filter sites based on search
//   const filteredSites = useMemo(() => {
//     if (!siteSearch.trim()) return ALL_SITES;
//     const q = siteSearch.toLowerCase();
//     return ALL_SITES.filter(
//       (s) =>
//         s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)
//     );
//   }, [siteSearch]);

//   const selectedCount = selectedItems.length;
//   const selectedSites = useMemo(
//     () => ALL_SITES.filter((s) => selectedSiteValues.has(s.value)),
//     [selectedSiteValues]
//   );
//   const selectedSitesCount = selectedSites.length;

//   // Auto-trim sites if items decrease
//   useEffect(() => {
//     if (selectedCount === 0) {
//       setSelectedSiteValues(new Set());
//       return;
//     }
//     if (selectedSiteValues.size <= selectedCount) return;
//     setSelectedSiteValues((prev) => {
//       const arr = Array.from(prev).slice(0, selectedCount);
//       return new Set(arr);
//     });
//   }, [selectedCount]);

//   function toggleSite(siteValue: string, checked: boolean) {
//     setSelectedSiteValues((prev) => {
//       const n = new Set(prev);
//       if (checked) {
//         if (selectedCount === 0) {
//           toast.error("Select content first.");
//           return prev;
//         }
//         if (n.size >= selectedCount) {
//           toast.error(`You can select only ${selectedCount} site(s).`);
//           return prev;
//         }
//         n.add(siteValue);
//       } else {
//         n.delete(siteValue);
//       }
//       return n;
//     });
//   }

//   // Feature: Auto-select sites based on content count
//   function handleAutoSelectSites() {
//     if (selectedCount === 0) {
//       toast.error("Please select content items from the left first.");
//       return;
//     }

//     const available = filteredSites.slice(0, selectedCount);
//     if (available.length < selectedCount) {
//       toast.warning(
//         `Only ${available.length} visible sites available to select.`
//       );
//     }

//     const newSet = new Set<string>();
//     available.forEach((s) => newSet.add(s.value));
//     setSelectedSiteValues(newSet);
//     toast.success(`Auto-selected ${newSet.size} sites.`);
//   }

//   const readyToStart =
//     selectedCount > 0 && selectedSitesCount === selectedCount;

//   // Preset load
//   useEffect(() => {
//     const p = loadPreset();
//     if (p) {
//       setPhone(p.phone ?? "");
//       setWebsite(p.website ?? "");
//       setEmail(p.email ?? "");
//       setCountry(p.address?.country ?? "");
//       setStateVal(p.address?.state ?? "");
//       setCity(p.address?.city ?? "");
//       setZip(p.address?.zip ?? "");
//       setLine1(p.address?.line1 ?? "");
//       setFacebook(p.socials?.facebook ?? "");
//       setTwitter(p.socials?.twitter ?? "");
//       setLinkedin(p.socials?.linkedin ?? "");
//       setPinterest(p.socials?.pinterest ?? "");
//       setInstagram(p.socials?.instagram ?? "");
//       setYelp(p.socials?.yelp ?? "");
//       setGmb(p.socials?.gmb ?? "");
//       if (Array.isArray(p.sites)) {
//         setSelectedSiteValues(new Set(p.sites));
//       }
//     }
//   }, []);

//   function handleSavePreset() {
//     const socials: Socials = {
//       facebook,
//       twitter,
//       linkedin,
//       pinterest,
//       instagram,
//       yelp,
//       gmb,
//     };
//     savePreset({
//       phone,
//       website,
//       email,
//       address: { country, state, city, zip, line1 },
//       socials,
//       sites: Array.from(selectedSiteValues),
//     });
//     toast.success("Preset saved");
//   }

//   async function handleStart() {
//     if (!readyToStart) {
//       toast.error("Select content first, then same number of sites.");
//       return;
//     }
//     try {
//       const { listings } = await start({
//         sites: selectedSites.map((s: any) => ({
//           site: s.value,
//           username: s.username,
//           password: s.password,
//           type: s.type ?? "wordpress",
//         })),
//         defaults: {
//           category,
//           keywordsDefaults,
//           imageUrl,
//           imageFile,
//           profile: {
//             phone,
//             website,
//             email,
//             socials: {
//               facebook,
//               twitter,
//               linkedin,
//               pinterest,
//               instagram,
//               yelp,
//               gmb,
//             },
//             address: { country, state, city, zip, line1 },
//           },
//         },
//       });
//       toast.success(`Direct WP publishing started for ${listings} item(s)`);
//     } catch (err: any) {
//       toast.error(err?.message ?? "Failed to start publishing");
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
//       <div className="mx-auto max-w-screen-2xl px-6 py-10">
//         {/* Top Header */}
//         <PremiumCard>
//           <Card className="border-0 shadow-none bg-transparent">
//             <CardHeader className="pb-6">
//               <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
//                 <div className="flex-1">
//                   <CardTitle className="flex items-center gap-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
//                     <IconListDetails className="h-8 w-8" />
//                     WP Content Publisher
//                   </CardTitle>
//                   <CardDescription className="text-indigo-600 mt-1 font-medium">
//                     Select content → Pick matching sites → Publish via API
//                   </CardDescription>
//                 </div>
//                 <div className="flex items-center gap-3 w-full lg:w-auto">
//                   <div className="relative flex-1 lg:w-[350px]">
//                     <IconSearch className="h-5 w-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
//                     <Input
//                       value={search}
//                       onChange={(e) => setSearch(e.target.value)}
//                       placeholder="Search by title or keywords…"
//                       className="pl-12 bg-white border-indigo-300 rounded-2xl shadow-sm"
//                     />
//                   </div>
//                   <Badge className="rounded-full bg-indigo-100 text-indigo-800 border-indigo-300 px-4 py-2 font-semibold">
//                     Selected: {selectedCount}/{ALL_SITES.length}
//                   </Badge>
//                 </div>
//               </div>
//             </CardHeader>
//           </Card>
//         </PremiumCard>
//         {/* 3-column layout */}
//         <div className="mt-10 grid gap-10 xl:grid-cols-12">
//           {/* LEFT — Projects Panel */}
//           <div className="xl:col-span-4">
//             <div className="sticky top-8 space-y-6">
//               <PremiumCard>
//                 <Card className="border-0 shadow-none bg-transparent">
//                   <CardHeader className="pb-4">
//                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
//                       <IconFolder className="h-6 w-6 text-indigo-600" />
//                       Content Projects
//                     </CardTitle>
//                     <CardDescription className="text-indigo-600">
//                       Choose projects or specific items for posting.
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="md:hidden mb-3">
//                       <div className="relative">
//                         <IconSearch className="h-4 w-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
//                         <Input
//                           value={search}
//                           onChange={(e) => setSearch(e.target.value)}
//                           placeholder="Search title / keywords…"
//                           className="pl-9 bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between text-sm text-indigo-600">
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={selectAllVisible}
//                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
//                           <IconCircleCheck className="h-4 w-4 mr-2" /> Select
//                           All Visible
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={clearSelection}
//                           className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
//                           <IconCircleX className="h-4 w-4 mr-2" /> Clear All
//                         </Button>
//                       </div>
//                       <span className="font-semibold">
//                         {filteredProjects.length} Projects
//                       </span>
//                     </div>
//                     <div className="max-h-[650px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300">
//                       {filteredProjects.length === 0 && (
//                         <div className="text-sm text-indigo-500 py-8 text-center">
//                           No content found. Start generating!
//                         </div>
//                       )}
//                       {filteredProjects.map((p, idx) => {
//                         const expanded = expandedProjectIds.has(p.id);
//                         const projectSelected = isProjectSelected(p.id);
//                         const selectedCountInProject = p.items.filter((it) =>
//                           selectedItemIds.has(it.id)
//                         ).length;
//                         const total = p.items.length;
//                         return (
//                           <div
//                             key={p.id}
//                             className="rounded-2xl ring-1 ring-indigo-200/50 bg-white/80 mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//                             {/* Project row */}
//                             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
//                               <div className="flex items-center gap-4">
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   onClick={() => toggleProjectExpand(p.id)}
//                                   className="h-8 w-8 rounded-full hover:bg-indigo-100"
//                                   aria-label={expanded ? "Collapse" : "Expand"}>
//                                   {expanded ? (
//                                     <IconChevronDown className="h-5 w-5 text-indigo-600" />
//                                   ) : (
//                                     <IconChevronRight className="h-5 w-5 text-indigo-600" />
//                                   )}
//                                 </Button>
//                                 <Checkbox
//                                   checked={projectSelected}
//                                   onCheckedChange={(v) =>
//                                     setProjectChecked(p.id, !!v)
//                                   }
//                                   className={cn(
//                                     "mr-2 h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
//                                   )}
//                                   aria-label="Select project"
//                                 />
//                                 <span className="text-sm font-bold text-gray-800 tabular-nums">
//                                   {String(idx + 1).padStart(2, "0")}.
//                                 </span>
//                                 <span className="text-sm font-bold text-gray-900">
//                                   {p.name}
//                                 </span>
//                               </div>
//                               <Badge
//                                 variant="outline"
//                                 className={cn(
//                                   "rounded-full text-sm px-3 py-1",
//                                   selectedCountInProject
//                                     ? "border-indigo-600 text-indigo-700 bg-indigo-100"
//                                     : "border-indigo-300 text-indigo-500"
//                                 )}>
//                                 {selectedCountInProject}/{total}
//                               </Badge>
//                             </div>
//                             {/* Items list */}
//                             {expanded && (
//                               <div className="border-t border-indigo-100 divide-y divide-indigo-50">
//                                 {p.items.map((it, iidx) => {
//                                   const checked = isItemSelected(it.id);
//                                   return (
//                                     <div
//                                       key={it.id}
//                                       className={cn(
//                                         "flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 transition-colors",
//                                         checked &&
//                                           "bg-indigo-50 ring-1 ring-indigo-200/50"
//                                       )}>
//                                       <div className="flex items-center gap-4 min-w-0">
//                                         <span className="text-xs text-indigo-500 font-semibold w-6 text-right tabular-nums">
//                                           {iidx + 1}
//                                         </span>
//                                         <Checkbox
//                                           checked={checked}
//                                           onCheckedChange={(v) =>
//                                             setItemChecked(p.id, it.id, !!v)
//                                           }
//                                           className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
//                                           aria-label="Select item"
//                                         />
//                                         <button
//                                           className="text-left min-w-0 flex-1"
//                                           onClick={() =>
//                                             setFocusedItemId(it.id)
//                                           }>
//                                           <div className="text-base font-semibold text-gray-900 truncate">
//                                             {(getItemTitle(it) ||
//                                               getItemKeywords(it)[0]) ??
//                                               "Untitled"}
//                                           </div>
//                                           <div className="text-sm text-indigo-600 truncate mt-1">
//                                             {getItemKeywords(it).join(", ")}
//                                           </div>
//                                         </button>
//                                       </div>
//                                       {checked && (
//                                         <IconCheck className="h-5 w-5 text-indigo-600 flex-shrink-0" />
//                                       )}
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </PremiumCard>
//             </div>
//           </div>
//           {/* CENTER — Defaults + Preview */}
//           <div className="xl:col-span-5 space-y-6">
//             <PremiumCard>
//               <Card className="border-0 shadow-none bg-transparent">
//                 <CardHeader className="pb-5">
//                   <CardTitle className="text-xl font-bold text-gray-900">
//                     Global Post Settings
//                   </CardTitle>
//                   <CardDescription className="text-indigo-600">
//                     These defaults apply across all selected contents (unique
//                     title/content per site).
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <section className="space-y-3">
//                     <PremiumSectionTitle
//                       icon={<IconTags className="h-5 w-5" />}>
//                       Keywords (Same for All)
//                     </PremiumSectionTitle>
//                     <TagsInput
//                       value={keywordsDefaults}
//                       onChange={setKeywordsDefaults}
//                     />
//                   </section>
//                   <section className="space-y-3">
//                     <PremiumSectionTitle>
//                       Category (Same for All)
//                     </PremiumSectionTitle>
//                     <Select value={category} onValueChange={setCategory}>
//                       <SelectTrigger className="bg-white border-indigo-300 rounded-2xl">
//                         <SelectValue placeholder="Select a category" />
//                       </SelectTrigger>
//                       <SelectContent className="rounded-2xl">
//                         {CATEGORIES.map((c) => (
//                           <SelectItem key={c} value={c} className="rounded-xl">
//                             {c}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </section>
//                   <section className="space-y-3">
//                     <PremiumSectionTitle
//                       icon={<IconPhoto className="h-5 w-5" />}>
//                       Feature Image (Same for All)
//                     </PremiumSectionTitle>
//                     <ImagePicker
//                       imageUrl={imageUrl}
//                       onImageUrlChange={setImageUrl}
//                       file={imageFile}
//                       onFileChange={setImageFile}
//                     />
//                     <p className="text-xs text-indigo-600 font-medium">
//                       Uploaded to each site as featured image (optional).
//                     </p>
//                   </section>
//                   <section className="space-y-4">
//                     <PremiumSectionTitle
//                       icon={<IconMap2 className="h-5 w-5" />}>
//                       Location Details
//                     </PremiumSectionTitle>
//                     <div className="grid gap-4 md:grid-cols-2">
//                       <div>
//                         <Label className="text-sm font-semibold text-gray-700">
//                           Country
//                         </Label>
//                         <Input
//                           value={country}
//                           onChange={(e) => setCountry(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-sm font-semibold text-gray-700">
//                           State/Province
//                         </Label>
//                         <Input
//                           value={state}
//                           onChange={(e) => setStateVal(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-sm font-semibold text-gray-700">
//                           City
//                         </Label>
//                         <Input
//                           value={city}
//                           onChange={(e) => setCity(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-sm font-semibold text-gray-700">
//                           ZIP/Postal Code
//                         </Label>
//                         <Input
//                           value={zip}
//                           onChange={(e) => setZip(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <Label className="text-sm font-semibold text-gray-700">
//                         Street Address
//                       </Label>
//                       <Input
//                         value={line1}
//                         onChange={(e) => setLine1(e.target.value)}
//                         className="bg-white border-indigo-300 rounded-xl"
//                       />
//                     </div>
//                   </section>
//                   <section className="space-y-4">
//                     <PremiumSectionTitle
//                       icon={<IconAddressBook className="h-5 w-5" />}>
//                       Contact Information
//                     </PremiumSectionTitle>
//                     <div className="grid gap-4 md:grid-cols-3">
//                       <div>
//                         <Label className="text-sm font-semibold text-gray-700">
//                           Phone
//                         </Label>
//                         <Input
//                           value={phone}
//                           onChange={(e) => setPhone(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-sm font-semibold text-gray-700">
//                           Website
//                         </Label>
//                         <div className="flex items-center">
//                           <IconWorldWww className="h-5 w-5 mr-3 text-indigo-500" />
//                           <Input
//                             value={website}
//                             onChange={(e) => setWebsite(e.target.value)}
//                             className="bg-white border-indigo-300 rounded-xl flex-1"
//                           />
//                         </div>
//                       </div>
//                       <div>
//                         <Label className="text-sm font-semibold text-gray-700">
//                           Email
//                         </Label>
//                         <div className="flex items-center">
//                           <IconAt className="h-5 w-5 mr-3 text-indigo-500" />
//                           <Input
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="bg-white border-indigo-300 rounded-xl flex-1"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </section>
//                   <section className="space-y-4">
//                     <PremiumSectionTitle
//                       icon={<IconWorld className="h-5 w-5" />}>
//                       Social Connections
//                     </PremiumSectionTitle>
//                     <div className="grid gap-4 md:grid-cols-2">
//                       <div>
//                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
//                           <IconBrandFacebook className="h-4 w-4 text-blue-600" />{" "}
//                           Facebook
//                         </Label>
//                         <Input
//                           value={facebook}
//                           onChange={(e) => setFacebook(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
//                           <IconBrandTwitter className="h-4 w-4 text-blue-400" />{" "}
//                           Twitter / X
//                         </Label>
//                         <Input
//                           value={twitter}
//                           onChange={(e) => setTwitter(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
//                           <IconBrandLinkedin className="h-4 w-4 text-blue-700" />{" "}
//                           LinkedIn
//                         </Label>
//                         <Input
//                           value={linkedin}
//                           onChange={(e) => setLinkedin(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
//                           <IconBrandPinterest className="h-4 w-4 text-red-500" />{" "}
//                           Pinterest
//                         </Label>
//                         <Input
//                           value={pinterest}
//                           onChange={(e) => setPinterest(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
//                           <IconBrandInstagram className="h-4 w-4 text-pink-500" />{" "}
//                           Instagram
//                         </Label>
//                         <Input
//                           value={instagram}
//                           onChange={(e) => setInstagram(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
//                           <IconBrandCpp className="h-4 w-4 text-yellow-600" />{" "}
//                           Yelp
//                         </Label>
//                         <Input
//                           value={yelp}
//                           onChange={(e) => setYelp(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                       <div className="md:col-span-2">
//                         <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
//                           <IconBrandGoogle className="h-4 w-4 text-red-500" />{" "}
//                           Google Business
//                         </Label>
//                         <Input
//                           value={gmb}
//                           onChange={(e) => setGmb(e.target.value)}
//                           className="bg-white border-indigo-300 rounded-xl"
//                         />
//                       </div>
//                     </div>
//                   </section>
//                 </CardContent>
//               </Card>
//             </PremiumCard>
//             <PremiumCard>
//               <Card className="border-0 shadow-none bg-transparent">
//                 <CardHeader className="pb-4">
//                   <CardTitle className="text-xl font-bold text-gray-900">
//                     Live Preview
//                   </CardTitle>
//                   <CardDescription className="text-indigo-600">
//                     Select an item from the left to see a real-time preview
//                     here.
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-5">
//                   <div>
//                     <Label className="text-sm font-semibold text-gray-700">
//                       Unique Title
//                     </Label>
//                     <Input
//                       value={focusedItem ? getItemTitle(focusedItem) : ""}
//                       readOnly
//                       placeholder="Click an item to preview its title"
//                       className="bg-indigo-50/50 border-indigo-300 rounded-xl mt-1 font-semibold"
//                     />
//                   </div>
//                   <div>
//                     <Label className="text-sm font-semibold text-gray-700">
//                       Unique Content
//                     </Label>
//                     <Textarea
//                       value={focusedItem ? getItemHtml(focusedItem) : ""}
//                       readOnly
//                       placeholder="Click an item to preview its full content"
//                       className="min-h-[200px] bg-indigo-50/50 border-indigo-300 rounded-xl mt-1"
//                     />
//                   </div>
//                 </CardContent>
//               </Card>
//             </PremiumCard>
//           </div>
//           {/* RIGHT — Controls + Processing Box */}
//           <div className="xl:col-span-3">
//             <div className="sticky top-8 space-y-6">
//               <PremiumCard>
//                 <Card className="border-0 shadow-none bg-transparent">
//                   <CardHeader className="pb-5">
//                     <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
//                       <IconSparkles className="h-6 w-6 text-purple-600" /> API
//                       Publisher
//                     </CardTitle>
//                     <CardDescription className="text-indigo-600">
//                       Match content count with sites for unique posts.
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-6">
//                     {/* SITES CHECKBOX LIST */}
//                     <section className="space-y-3">
//                       <Label className="text-sm font-bold flex items-center gap-3 text-gray-900">
//                         <IconGlobe className="h-5 w-5 text-indigo-600" /> Target
//                         Sites ({selectedSitesCount}/{selectedCount || 0})
//                       </Label>

//                       {/* Site Search & Quick Actions */}
//                       <div className="space-y-2">
//                         <div className="relative">
//                           <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                           <Input
//                             value={siteSearch}
//                             onChange={(e) => setSiteSearch(e.target.value)}
//                             placeholder="Filter sites..."
//                             className="pl-9 bg-white border-indigo-200 rounded-xl text-sm h-9"
//                           />
//                         </div>
//                         <div className="flex gap-2">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="flex-1 rounded-lg border-indigo-200 text-xs text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
//                             onClick={handleAutoSelectSites}
//                             title="Auto-select top available sites matching content count">
//                             <IconRefresh className="h-3 w-3 mr-1.5" />
//                             Auto-Fill Sites
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="rounded-lg border-red-200 text-xs text-red-600 bg-red-50/50 hover:bg-red-100"
//                             onClick={() => setSelectedSiteValues(new Set())}
//                             title="Clear site selection">
//                             <IconTrash className="h-3 w-3" />
//                           </Button>
//                         </div>
//                       </div>

//                       {selectedCount === 0 && (
//                         <div className="text-sm text-indigo-500 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
//                           👈 Begin by selecting content on the left.
//                         </div>
//                       )}

//                       <div className="rounded-2xl ring-1 ring-indigo-200 bg-white/80 divide-y divide-indigo-50 shadow-sm max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300">
//                         {filteredSites.slice(0, 50).map((s) => {
//                           // Limit to 50 for UI performance if list is huge
//                           const isChecked = selectedSiteValues.has(s.value);
//                           const disableNew =
//                             !isChecked &&
//                             (selectedSitesCount >= selectedCount ||
//                               selectedCount === 0);
//                           return (
//                             <label
//                               key={s.value}
//                               className={cn(
//                                 "flex items-center justify-between gap-4 px-4 py-3 cursor-pointer transition-all hover:bg-indigo-50/50",
//                                 isChecked &&
//                                   "bg-indigo-50/80 ring-1 ring-indigo-200/50",
//                                 disableNew && "opacity-70 cursor-not-allowed"
//                               )}>
//                               <div className="flex items-center gap-3 min-w-0">
//                                 <Checkbox
//                                   checked={isChecked}
//                                   disabled={disableNew}
//                                   onCheckedChange={(v) =>
//                                     toggleSite(s.value, !!v)
//                                   }
//                                   className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
//                                 />
//                                 <span className="text-sm font-semibold text-gray-900 truncate">
//                                   {s.label}
//                                 </span>
//                               </div>
//                             </label>
//                           );
//                         })}
//                         {filteredSites.length === 0 && (
//                           <div className="p-4 text-center text-sm text-gray-500">
//                             No sites match "{siteSearch}"
//                           </div>
//                         )}
//                       </div>
//                       <p className="text-xs text-indigo-600 font-medium">
//                         Pro Tip: {selectedCount} contents require exactly{" "}
//                         {selectedCount} sites.
//                       </p>
//                     </section>
//                     <Separator className="border-indigo-200" />
//                     <div className="grid gap-4">
//                       <Button
//                         onClick={handleStart}
//                         disabled={!readyToStart || isStarting}
//                         className={cn(
//                           "rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 h-12 font-bold text-lg",
//                           !readyToStart && "opacity-70 cursor-not-allowed"
//                         )}>
//                         <IconPlayerPlay className="h-5 w-5 mr-3" />
//                         {isStarting
//                           ? "Publishing…"
//                           : `Publish Now (${selectedCount})`}
//                       </Button>
//                       <div className="flex items-center justify-between text-sm text-indigo-600">
//                         <span className="flex items-center gap-2 font-medium">
//                           <IconCheck className="h-4 w-4" />
//                           {selectedCount} Contents Ready
//                         </span>
//                         <span className="flex items-center gap-2 font-medium">
//                           <IconGlobe className="h-4 w-4" />
//                           {selectedSitesCount} Sites Locked
//                         </span>
//                       </div>
//                       {jobId && status === "running" && (
//                         <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
//                           <div className="flex items-center justify-between text-sm text-indigo-600 mb-3 font-medium">
//                             <span>Publishing: {jobId.slice(-6)}</span>
//                             <span>{progress}% Complete</span>
//                           </div>
//                           <Progress
//                             value={progress}
//                             className="h-3 bg-indigo-200 rounded-full"
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </PremiumCard>
//               {/* Processing Box - Runs/Backlinks */}
//               {runs.length > 0 && (
//                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
//                   <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                     <IconSparkles className="h-5 w-5 text-green-600" />
//                     Publishing Results
//                   </h3>

//                   {runs.map((run) => (
//                     <div
//                       key={run.jobId}
//                       className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
//                       {/* Run Header */}
//                       <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
//                         <div className="flex flex-col">
//                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
//                             Job ID
//                           </span>
//                           <span className="text-sm font-mono text-slate-700">
//                             {run.jobId ? run.jobId.slice(-8) : "Unknown"}
//                           </span>
//                         </div>
//                         <Badge
//                           className={cn(
//                             "rounded-full px-3 py-1 shadow-sm",
//                             run.status === "done"
//                               ? "bg-green-100 text-green-700 border-green-200"
//                               : run.status === "error"
//                               ? "bg-red-100 text-red-700 border-red-200"
//                               : "bg-blue-100 text-blue-700 border-blue-200"
//                           )}>
//                           {run.status === "done"
//                             ? "COMPLETED"
//                             : run.status.toUpperCase()}
//                         </Badge>
//                       </div>

//                       {/* Backlinks List */}
//                       {(run.backlinks?.length ?? 0) > 0 ? (
//                         <div className="divide-y divide-slate-100">
//                           {run.backlinks!.map((link, idx) => {
//                             const url = new URL(link);
//                             const hostname = url.hostname.replace("www.", "");
//                             return (
//                               <div
//                                 key={idx}
//                                 className="group flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
//                                 <div className="flex flex-col min-w-0 pr-4">
//                                   <span className="text-sm font-bold text-slate-800">
//                                     {hostname}
//                                   </span>
//                                   <a
//                                     href={link}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-xs text-blue-600 hover:underline truncate block">
//                                     {link}
//                                   </a>
//                                 </div>
//                                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                                   <Button
//                                     size="icon"
//                                     variant="ghost"
//                                     className="h-8 w-8 rounded-full bg-white border border-slate-200 hover:bg-indigo-50 text-slate-600"
//                                     onClick={() => {
//                                       navigator.clipboard.writeText(link);
//                                       toast.success("Link copied!");
//                                     }}
//                                     title="Copy Link">
//                                     <IconCopy className="h-4 w-4" />
//                                   </Button>
//                                   <a
//                                     href={link}
//                                     target="_blank"
//                                     rel="noopener noreferrer">
//                                     <Button
//                                       size="icon"
//                                       variant="ghost"
//                                       className="h-8 w-8 rounded-full bg-white border border-slate-200 hover:bg-indigo-50 text-slate-600"
//                                       title="Open Link">
//                                       <IconExternalLink className="h-4 w-4" />
//                                     </Button>
//                                   </a>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       ) : (
//                         <div className="p-4 text-center text-sm text-slate-400 italic">
//                           No backlinks generated yet...
//                         </div>
//                       )}

//                       {/* Footer Actions */}
//                       <div className="bg-slate-50 p-3 flex gap-2 border-t border-slate-100">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="flex-1 bg-white border-slate-200 hover:bg-green-50 hover:text-green-700 text-slate-600"
//                           onClick={() => {
//                             const all = (run.backlinks || []).join("\n");
//                             navigator.clipboard.writeText(all);
//                             toast.success("All links copied!");
//                           }}>
//                           <IconCopy className="h-3.5 w-3.5 mr-2" />
//                           Copy All
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="flex-1 bg-white border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-600"
//                           onClick={() => {
//                             if (run.jobId) {
//                               downloadRunExcel(
//                                 run.jobId,
//                                 `report-${run.jobId.slice(-6)}.xlsx`
//                               );
//                             }
//                           }}>
//                           <IconListDetails className="h-3.5 w-3.5 mr-2" />
//                           Export Excel
//                         </Button>
//                       </div>

//                       {/* Terminal-style Logs */}
//                       {(run.logs ?? []).length > 0 && (
//                         <details className="group border-t border-slate-100">
//                           <summary className="cursor-pointer bg-slate-100 p-2 text-xs font-semibold text-slate-600 flex justify-between px-4 group-open:bg-slate-200">
//                             <span>System Logs ({run.logs!.length})</span>
//                             <IconChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
//                           </summary>
//                           <div className="bg-slate-900 text-green-400 p-4 text-xs font-mono max-h-40 overflow-auto whitespace-pre-wrap">
//                             {run.logs!.map((log, i) => (
//                               <div key={i} className="mb-1">
//                                 <span className="text-slate-500 mr-2">
//                                   {">"}
//                                 </span>
//                                 {log}
//                               </div>
//                             ))}
//                           </div>
//                         </details>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* good code  */}

//               <div className="rounded-2xl ring-1 ring-indigo-200 bg-white shadow-lg p-5 text-sm text-gray-800 border border-indigo-100/50">
//                 <p className="mb-2 flex items-center gap-2">
//                   ✅ <b>Workflow:</b> Select → Match → Publish (Direct WP API)
//                 </p>
//                 <p className="mb-4">
//                   🚀 <b>Unique per site:</b> Title + Content | Same: Image +
//                   Keywords + Category
//                 </p>
//                 <div className="flex items-center gap-3">
//                   <Button
//                     variant="outline"
//                     onClick={handleSavePreset}
//                     className="rounded-full border-indigo-300 hover:bg-indigo-50">
//                     💾 Save Config
//                   </Button>
//                   <Badge className="rounded-full bg-purple-100 text-purple-800 border-purple-300">
//                     50+ Sites Ready
//                   </Badge>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconWorld,
  IconListDetails,
  IconPlayerPlay,
  IconSparkles,
  IconAddressBook,
  IconTags,
  IconMap2,
  IconPhoto,
  IconWorldWww,
  IconAt,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandPinterest,
  IconBrandInstagram,
  IconBrandCpp, // Yelp placeholder
  IconBrandGoogle,
  IconChevronDown,
  IconChevronRight,
  IconSearch,
  IconFolder,
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconGlobe,
  IconCopy,
  IconExternalLink,
  IconTrash,
  IconRefresh,
} from "@tabler/icons-react";
import {
  useListingAutomation,
  type GeneratedItem,
  type Socials,
} from "./hooks/useListingAutomation";

/* ─────────────────────────────────────────────────────────────
 * Constants - Categories (user provided)
 * ────────────────────────────────────────────────────────────*/
const CATEGORIES = [
  "Business",
  "Health",
  "Technology",
  "Real Estate",
  "Home Improvement",
  "Automotive",
  "Travel",
  "Blog",
  "Shopping",
  "Service",
  "Lifestyle",
  "Beauty",
  "Pet & Animal",
  "Food",
  "Furniture",
  "Electric",
  "Jobs & Payroll",
  "Finance",
  "Crypto",
  "Casino",
  "CBD",
  "Social Media",
  "Game & Sports",
  "Arts",
  "Entertainment",
  "Shipping & Transportation",
  "Education",
  "Family & Parenting",
  "Law & Legal",
  "Fashion",
  "Photography",
  "Adult",
  "Event",
  "Digital",
  "News",
  "Industry & Manufacturing",
];

/* (rest of ALL_SITES list unchanged) */
const ALL_WORDPRESS_SITES = [
  {
    value: "linuxpatent.com",
    label: "linuxpatent.com (Guest Posting)",
    username: "FlowTrack",
    password: "vSvd cd8e aY9V E9vy EtU9 bkAi",
    type: "wordpress",
  },
  {
    value: "rayseries.com",
    label: "rayseries.com (Guest Posting)",
    username: "FlowTrack",
    password: "P2kl EHRS 6gLi drVQ 4Xb0 TIlR",
    type: "wordpress",
  },
  {
    value: "pasfait.com",
    label: "pasfait.com (Guest Posting)",
    username: "FlowTrack",
    password: "rYXn vala ZImc guqH jHg1 yAbF",
    type: "wordpress",
  },
  {
    value: "scotchsavvy.com",
    label: "scotchsavvy.com (Guest Posting)",
    username: "FlowTrack",
    password: "pNfP EhU6 BhVi pHPC vT7u Gh7Z",
    type: "wordpress",
  },
  {
    value: "extremesportsgoons.info",
    label: "extremesportsgoons.info (Guest Posting)",
    username: "FlowTrack",
    password: "S2ll 7cby lhda nab6 XzIG vCyk",
    type: "wordpress",
  },
  {
    value: "creeksidereflections.com",
    label: "creeksidereflections.com (Guest Posting)",
    username: "FlowTrack",
    password: "Fqcl hdHo ipZ2 l4CK Sbmn Tat4",
    type: "wordpress",
  },
  {
    value: "PiratesGab.com",
    label: "PiratesGab.com (Guest Posting)",
    username: "FlowTrack",
    password: "jRFw Vqoi 3Xj5 TQAy koRx 09z0",
    type: "wordpress",
  },
  {
    value: "theSportchampion.com",
    label: "theSportchampion.com (Guest Posting)",
    username: "FlowTrack",
    password: "7Bjq nNmf b4Zf BX5A Lujg SQhl",
    type: "wordpress",
  },
  {
    value: "DataDrillAmerAsia.com",
    label: "DataDrillAmerAsia.com (Guest Posting)",
    username: "FlowTrack",
    password: "3Zpc ouuZ 4y4q 3Txk ceC2 Hi2Y",
    type: "wordpress",
  },
  {
    value: "htpsouthdowns.com",
    label: "htpsouthdowns.com (Guest Posting)",
    username: "FlowTrack",
    password: "aGzE azG9 22VN iuQC T1x3 fW8x",
    type: "wordpress",
  },
  {
    value: "UsJobSandGigs.com",
    label: "UsJobSandGigs.com (Guest Posting)",
    username: "FlowTrack",
    password: "OA81 7Ime Clim kHmt 5wi7 Ezac",
    type: "wordpress",
  },
  {
    value: "VictoriesSport.com",
    label: "VictoriesSport.com (Guest Posting)",
    username: "FlowTrack",
    password: "csSb IsEN Wx5b X6qm xgFC tvaH",
    type: "wordpress",
  },
  {
    value: "veroniquelacoste.com",
    label: "veroniquelacoste.com (Guest Posting)",
    username: "FlowTrack",
    password: "74J7 vJxc qH5O 41a8 CeWn uDLH",
    type: "wordpress",
  },
  {
    value: "missonthemove.com",
    label: "missonthemove.com (Guest Posting)",
    username: "FlowTrack",
    password: "WVU9 IFtJ Ohme L7jg 1ibA 939a",
    type: "wordpress",
  },
  {
    value: "pcnfa.com",
    label: "pcnfa.com (Guest Posting)",
    username: "FlowTrack",
    password: "1h46 Esbn jy3k Dh5e l3O6 cSXQ",
    type: "wordpress",
  },
  {
    value: "theangelfilm.com",
    label: "theangelfilm.com (Guest Posting)",
    username: "FlowTrack",
    password: "eU2M XhWw 3DUP um7z II8F Db1W",
    type: "wordpress",
  },
  {
    value: "soerq.com",
    label: "soerq.com (Guest Posting)",
    username: "FlowTrack",
    password: "wog2 w87h QRen Kmud 7G98 NOOE",
    type: "wordpress",
  },
  {
    value: "paydayard.com",
    label: "paydayard.com (Guest Posting)",
    username: "FlowTrack",
    password: "05d8 CuBb 23Iu eaU0 C165 dx9J",
    type: "wordpress",
  },
  {
    value: "trekbadlands.com",
    label: "trekbadlands.com (Guest Posting)",
    username: "FlowTrack",
    password: "K01N zsGd 6Y2Z fxTo JWbL lLab",
    type: "wordpress",
  },
  {
    value: "pawmeism.com",
    label: "pawmeism.com (Guest Posting)",
    username: "FlowTrack",
    password: "hDNV z0Vy rQTu PAqI 1D5A ELgv",
    type: "wordpress",
  },
  {
    value: "demokore.com",
    label: "demokore.com (Guest Posting)",
    username: "FlowTrack",
    password: "q5fC VDeX 4os5 sUr6 J2RU pSxY",
    type: "wordpress",
  },
  {
    value: "moviemotives.com",
    label: "moviemotives.com (Guest Posting)",
    username: "FlowTrack",
    password: "ScpA VN2X EccU iofU Aohq saoNScpA VN2X EccU iofU Aohq saoN",
    type: "wordpress",
  },
  {
    value: "mitchellstover.com",
    label: "mitchellstover.com (Guest Posting)",
    username: "FlowTrack",
    password: "GRHW uOKp XHko fco3 ae6L iQvl",
    type: "wordpress",
  },
  {
    value: "fametize.com",
    label: "fametize.com (Guest Posting)",
    username: "FlowTrack",
    password: "MqSV Ap8X fI39 X50H OzcC WJmc",
    type: "wordpress",
  },
  {
    value: "luocsu.com",
    label: "luocsu.com (Guest Posting)",
    username: "FlowTrack",
    password: "wgKC TTYQ mP0d cOek lSDt Ooy7",
    type: "wordpress",
  },
  {
    value: "inststagram.com",
    label: "inststagram.com (Guest Posting)",
    username: "FlowTrack",
    password: "JDYO 88vG J16G ot8u PMzM od0J",
    type: "wordpress",
  },
  {
    value: "ashopear.com",
    label: "ashopear.com (Guest Posting)",
    username: "FlowTrack",
    password: "zD91 Q3AR xfq1 lo2B wKDV Ad9m",
    type: "wordpress",
  },
  {
    value: "charles6767.com",
    label: "charles6767.com (Guest Posting)",
    username: "FlowTrack",
    password: "N3il WPF1 XcUf HNHA ntTO ukDC",
    type: "wordpress",
  },
  {
    value: "berlintype.com",
    label: "berlintype.com (Guest Posting)",
    username: "FlowTrack",
    password: "TBqx iSM7 Tc0c ige4 2tTO 958e",
    type: "wordpress",
  },
  {
    value: "sprintcybermonday.com",
    label: "sprintcybermonday.com (Guest Posting)",
    username: "FlowTrack",
    password: "ZU2e xkY1 adLg JPsN MhvU pIrM",
    type: "wordpress",
  },
  {
    value: "jamesvirtudazo.com",
    label: "jamesvirtudazo.com (Guest Posting)",
    username: "FlowTrack",
    password: "zDCU TmdE sh4k FHRv wwtU 4t4K",
    type: "wordpress",
  },
  {
    value: "partyprivee.com",
    label: "partyprivee.com (Guest Posting)",
    username: "FlowTrack",
    password: "zqqk JFzo peli 1NuW jJoU e4eT",
    type: "wordpress",
  },
  {
    value: "launcheell.com",
    label: "launcheell.com (Guest Posting)",
    username: "FlowTrack",
    password: "HVMo ezSe 9Dew GyT6 AXfK s0BG",
    type: "wordpress",
  },
  {
    value: "cruitholidayhome.com",
    label: "cruitholidayhome.com (Guest Posting)",
    username: "FlowTrack",
    password: "oNeJ n9x7 KcL3 lnJ6 xGxE CdDG",
    type: "wordpress",
  },
  {
    value: "yhbdvideo.com",
    label: "yhbdvideo.com (Guest Posting)",
    username: "FlowTrack",
    password: "oNeJ n9x7 KcL3 lnJ6 xGxE CdDG",
    type: "wordpress",
  },
  {
    value: "hmboot.com",
    label: "hmboot.com (Guest Posting)",
    username: "FlowTrack",
    password: "DRf7 Wh6i 5G2W gLVi 6I7J 2ZwG",
    type: "wordpress",
  },
  {
    value: "allaboutlaptop.com",
    label: "allaboutlaptop.com (Guest Posting)",
    username: "FlowTrack",
    password: "8CfX jdb4 fFS6 McTU CyEN 1nHL",
    type: "wordpress",
  },
  {
    value: "photosdp.net",
    label: "photosdp.net (Guest Posting)",
    username: "FlowTrack",
    password: "o02P LuIY NCIw jHjv himW 3Zqe",
    type: "wordpress",
  },
  {
    value: "melanzona.com",
    label: "melanzona.com (Guest Posting)",
    username: "Hal",
    password: "K5Cm DGdD YNOu AsHD oP1D oUYy",
    type: "wordpress",
  },
  {
    value: "jutzstuff.com",
    label: "jutzstuff.com (Guest Posting)",
    username: "Eli",
    password: "fyYX RwbX Tybp jIvZ XcXo perK",
    type: "wordpress",
  },
  {
    value: "mypracticemaxx.com",
    label: "mypracticemaxx.com (Guest Posting)",
    username: "Roz",
    password: "EL1E qnHZ U62o HrHI 79vH DiVB",
    type: "wordpress",
  },
  {
    value: "vuepella.com",
    label: "vuepella.com (Guest Posting)",
    username: "Ike",
    password: "9oO1 brtb atQ4 FnjA SAKo wmWO",
    type: "wordpress",
  },
  {
    value: "tfajtrading.com",
    label: "tfajtrading.com (Guest Posting)",
    username: "Fay",
    password: "P2VX xq4F LN5I gonc y0K2 UfsT",
    type: "wordpress",
  },
  {
    value: "postmyads.org",
    label: "postmyads.org (Guest Posting)",
    username: "FlowTrack",
    password: "94FL ejV8 PYyb bKsJ 5sNj 4s3t",
    type: "wordpress",
  },
];

const ALL_SITES = ALL_WORDPRESS_SITES; // Merged into one list

/* ─────────────────────────────────────────────────────────────
 * Local-storage loader
 * ──────────────────────────────────────────────────────────*/
function loadGeneratedItems(): GeneratedItem[] {
  const keys = ["content_items_v1", "content-items", "seomatic_content_items"];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      }
    } catch {}
  }
  try {
    const raw =
      sessionStorage.getItem("open-content-item_v1") ??
      localStorage.getItem("open-content-item_v1_fallback");
    if (raw) {
      const it = JSON.parse(raw);
      if (it && typeof it === "object") return [it];
    }
  } catch {}
  return [];
}

/* ─────────────────────────────────────────────────────────────
 * UI Helpers
 * ──────────────────────────────────────────────────────────*/
function PremiumCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl ring-1 ring-indigo-200/50 bg-gradient-to-br from-white via-indigo-50/30 to-white shadow-xl overflow-hidden border border-indigo-100/50">
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
      {children}
    </div>
  );
}
function PremiumSectionTitle({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-base font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text ">
      {icon}
      {children}
    </div>
  );
}

/* Tags Input */
function TagsInput({
  value,
  onChange,
  placeholder = "Type keyword and press Enter",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  function addTagFromDraft() {
    const parts = draft
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) {
      const set = new Set([...value, ...parts]);
      onChange(Array.from(set));
      setDraft("");
    }
  }
  return (
    <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-800 px-3 py-1.5 text-sm ring-1 ring-indigo-300/50 shadow-sm">
            <IconTags className="h-3.5 w-3.5" />
            {t}
            <button
              onClick={() => onChange(value.filter((x) => x !== t))}
              className="ml-1 hover:text-indigo-900 transition-colors"
              aria-label={`Remove ${t}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTagFromDraft();
          }
          if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder={placeholder}
        className="bg-white border-indigo-300"
      />
      <p className="text-xs text-indigo-600 mt-2 font-medium">
        Use Enter or comma to add
      </p>
    </div>
  );
}

/* Image Picker */
function ImagePicker({
  imageUrl,
  onImageUrlChange,
  file,
  onFileChange,
}: {
  imageUrl: string;
  onImageUrlChange: (v: string) => void;
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  useEffect(() => {
    if (file) {
      const u = URL.createObjectURL(file);
      setPreviewUrl(u);
      return () => {
        URL.revokeObjectURL(u);
      };
    }
    setPreviewUrl(imageUrl || "");
  }, [file, imageUrl]);
  const preview = previewUrl;
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700">
            Image URL
          </Label>
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            className="bg-white border-indigo-300"
          />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">
            Upload Image
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept="image/*"
              className="bg-white border-indigo-300"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            {file && (
              <Badge
                variant="outline"
                className="rounded-full bg-indigo-100 border-indigo-300 text-indigo-700">
                {file.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {preview ? (
        <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
          <img
            src={preview}
            alt="preview"
            className="max-h-64 w-full rounded-xl object-cover shadow-md"
          />
        </div>
      ) : (
        <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-100/50 p-6 text-sm text-indigo-500 flex items-center justify-center">
          No preview available
        </div>
      )}
    </div>
  );
}

/* Presets */
const PRESET_KEY = "classified_automation_preset_v2";
function savePreset(data: any) {
  localStorage.setItem(PRESET_KEY, JSON.stringify(data));
}
function loadPreset(): any | null {
  try {
    const raw = localStorage.getItem(PRESET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* Fake uploader (replace with real if needed) */
async function uploadImageAndGetUrl(file: File): Promise<string> {
  return URL.createObjectURL(file); // Placeholder - hook handles real upload
}

/* Tiny helpers from items */
const getItemTitle = (it: GeneratedItem) => it.title ?? "";
const getItemHtml = (it: GeneratedItem) =>
  (it.html ?? it.generatedContent ?? "").toString();
function getItemKeywords(it: GeneratedItem): string[] {
  if (Array.isArray(it.keyword)) return it.keyword.map(String).filter(Boolean);
  if (typeof it.keyword === "string")
    return it.keyword
      .split(/[,\|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

/* ─────────────────────────────────────────────────────────────
 * MAIN
 * ──────────────────────────────────────────────────────────*/
export default function ClassifiedAutomationPage() {
  /* Load all generated items */
  const [items, setItems] = useState<GeneratedItem[]>([]);
  useEffect(() => setItems(loadGeneratedItems()), []);

  /* Hook wiring */
  const {
    search,
    setSearch,
    filteredProjects,
    expandedProjectIds,
    toggleProjectExpand,
    selectedItemIds,
    isProjectSelected,
    isItemSelected,
    setProjectChecked,
    setItemChecked,
    selectAllVisible,
    clearSelection,
    setFocusedItemId,
    focusedItem,
    selectedItems,
    start,
    isStarting,
    jobId,
    progress,
    status,
    runs,
    downloadRunExcel,
  } = useListingAutomation(items, {
    uploadImage: uploadImageAndGetUrl,
    statusPollIntervalMs: 1500,
    maxPollMinutes: 15,
    maxSelectableItems: ALL_SITES.length,
    onMaxExceeded: (max) =>
      toast.error(`Max ${max} contents only (sites limit).`),
  });

  /* Defaults (apply to all selected items) */
  const [keywordsDefaults, setKeywordsDefaults] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  // Contact / profile
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  // Socials
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [pinterest, setPinterest] = useState("");
  const [instagram, setInstagram] = useState("");
  const [yelp, setYelp] = useState("");
  const [gmb, setGmb] = useState("");
  // Address
  const [country, setCountry] = useState("");
  const [state, setStateVal] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [line1, setLine1] = useState("");
  // Default image
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Sites selection
  const [siteSearch, setSiteSearch] = useState("");
  const [selectedSiteValues, setSelectedSiteValues] = useState<Set<string>>(
    new Set()
  );

  // Filter sites based on search
  const filteredSites = useMemo(() => {
    if (!siteSearch.trim()) return ALL_SITES;
    const q = siteSearch.toLowerCase();
    return ALL_SITES.filter(
      (s) =>
        s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)
    );
  }, [siteSearch]);

  const selectedCount = selectedItems.length;
  const selectedSites = useMemo(
    () => ALL_SITES.filter((s) => selectedSiteValues.has(s.value)),
    [selectedSiteValues]
  );
  const selectedSitesCount = selectedSites.length;

  // Auto-trim sites if items decrease
  useEffect(() => {
    if (selectedCount === 0) {
      setSelectedSiteValues(new Set());
      return;
    }
    if (selectedSiteValues.size <= selectedCount) return;
    setSelectedSiteValues((prev) => {
      const arr = Array.from(prev).slice(0, selectedCount);
      return new Set(arr);
    });
  }, [selectedCount]);

  function toggleSite(siteValue: string, checked: boolean) {
    setSelectedSiteValues((prev) => {
      const n = new Set(prev);
      if (checked) {
        if (selectedCount === 0) {
          toast.error("Select content first.");
          return prev;
        }
        if (n.size >= selectedCount) {
          toast.error(`You can select only ${selectedCount} site(s).`);
          return prev;
        }
        n.add(siteValue);
      } else {
        n.delete(siteValue);
      }
      return n;
    });
  }

  // Feature: Auto-select sites based on content count
  function handleAutoSelectSites() {
    if (selectedCount === 0) {
      toast.error("Please select content items from the left first.");
      return;
    }

    const available = filteredSites.slice(0, selectedCount);
    if (available.length < selectedCount) {
      toast.warning(
        `Only ${available.length} visible sites available to select.`
      );
    }

    const newSet = new Set<string>();
    available.forEach((s) => newSet.add(s.value));
    setSelectedSiteValues(newSet);
    toast.success(`Auto-selected ${newSet.size} sites.`);
  }

  const readyToStart =
    selectedCount > 0 && selectedSitesCount === selectedCount && category.trim() !== "";

  // Preset load
  useEffect(() => {
    const p = loadPreset();
    if (p) {
      setPhone(p.phone ?? "");
      setWebsite(p.website ?? "");
      setEmail(p.email ?? "");
      setCountry(p.address?.country ?? "");
      setStateVal(p.address?.state ?? "");
      setCity(p.address?.city ?? "");
      setZip(p.address?.zip ?? "");
      setLine1(p.address?.line1 ?? "");
      setFacebook(p.socials?.facebook ?? "");
      setTwitter(p.socials?.twitter ?? "");
      setLinkedin(p.socials?.linkedin ?? "");
      setPinterest(p.socials?.pinterest ?? "");
      setInstagram(p.socials?.instagram ?? "");
      setYelp(p.socials?.yelp ?? "");
      setGmb(p.socials?.gmb ?? "");
      if (Array.isArray(p.sites)) {
        setSelectedSiteValues(new Set(p.sites));
      }
    }
  }, []);

  function handleSavePreset() {
    const socials: Socials = {
      facebook,
      twitter,
      linkedin,
      pinterest,
      instagram,
      yelp,
      gmb,
    };
    savePreset({
      phone,
      website,
      email,
      address: { country, state, city, zip, line1 },
      socials,
      sites: Array.from(selectedSiteValues),
    });
    toast.success("Preset saved");
  }

  async function handleStart() {
    if (!readyToStart) {
      if (!category.trim()) {
        toast.error("Please select a category. Category is mandatory.");
        return;
      }
      toast.error("Select content first, then same number of sites.");
      return;
    }
    try {
      const { listings } = await start({
        sites: selectedSites.map((s: any) => ({
          site: s.value,
          username: s.username,
          password: s.password,
          type: s.type ?? "wordpress",
        })),
        defaults: {
          category,
          keywordsDefaults,
          imageUrl,
          imageFile,
          profile: {
            phone,
            website,
            email,
            socials: {
              facebook,
              twitter,
              linkedin,
              pinterest,
              instagram,
              yelp,
              gmb,
            },
            address: { country, state, city, zip, line1 },
          },
        },
      });
      toast.success(`Direct WP publishing started for ${listings} item(s)`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to start publishing");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-screen-2xl px-6 py-10">
        {/* Top Header */}
        <PremiumCard>
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
                    <IconListDetails className="h-8 w-8" />
                    WP Content Publisher
                  </CardTitle>
                  <CardDescription className="text-indigo-600 mt-1 font-medium">
                    Select content → Pick matching sites → Publish via API
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-[350px]">
                    <IconSearch className="h-5 w-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by title or keywords…"
                      className="pl-12 bg-white border-indigo-300 rounded-2xl shadow-sm"
                    />
                  </div>
                  <Badge className="rounded-full bg-indigo-100 text-indigo-800 border-indigo-300 px-4 py-2 font-semibold">
                    Selected: {selectedCount}/{ALL_SITES.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </PremiumCard>
        {/* 3-column layout */}
        <div className="mt-10 grid gap-10 xl:grid-cols-12">
          {/* LEFT — Projects Panel */}
          <div className="xl:col-span-4">
            <div className="sticky top-8 space-y-6">
              <PremiumCard>
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                      <IconFolder className="h-6 w-6 text-indigo-600" />
                      Content Projects
                    </CardTitle>
                    <CardDescription className="text-indigo-600">
                      Choose projects or specific items for posting.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="md:hidden mb-3">
                      <div className="relative">
                        <IconSearch className="h-4 w-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search title / keywords…"
                          className="pl-9 bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-indigo-600">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllVisible}
                          className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
                          <IconCircleCheck className="h-4 w-4 mr-2" /> Select
                          All Visible
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSelection}
                          className="rounded-full h-8 px-4 border-indigo-300 hover:bg-indigo-50">
                          <IconCircleX className="h-4 w-4 mr-2" /> Clear All
                        </Button>
                      </div>
                      <span className="font-semibold">
                        {filteredProjects.length} Projects
                      </span>
                    </div>
                    <div className="max-h-[650px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300">
                      {filteredProjects.length === 0 && (
                        <div className="text-sm text-indigo-500 py-8 text-center">
                          No content found. Start generating!
                        </div>
                      )}
                      {filteredProjects.map((p, idx) => {
                        const expanded = expandedProjectIds.has(p.id);
                        const projectSelected = isProjectSelected(p.id);
                        const selectedCountInProject = p.items.filter((it) =>
                          selectedItemIds.has(it.id)
                        ).length;
                        const total = p.items.length;
                        return (
                          <div
                            key={p.id}
                            className="rounded-2xl ring-1 ring-indigo-200/50 bg-white/80 mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Project row */}
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleProjectExpand(p.id)}
                                  className="h-8 w-8 rounded-full hover:bg-indigo-100"
                                  aria-label={expanded ? "Collapse" : "Expand"}>
                                  {expanded ? (
                                    <IconChevronDown className="h-5 w-5 text-indigo-600" />
                                  ) : (
                                    <IconChevronRight className="h-5 w-5 text-indigo-600" />
                                  )}
                                </Button>
                                <Checkbox
                                  checked={projectSelected}
                                  onCheckedChange={(v) =>
                                    setProjectChecked(p.id, !!v)
                                  }
                                  className={cn(
                                    "mr-2 h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                  )}
                                  aria-label="Select project"
                                />
                                <span className="text-sm font-bold text-gray-800 tabular-nums">
                                  {String(idx + 1).padStart(2, "0")}.
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                  {p.name}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "rounded-full text-sm px-3 py-1",
                                  selectedCountInProject
                                    ? "border-indigo-600 text-indigo-700 bg-indigo-100"
                                    : "border-indigo-300 text-indigo-500"
                                )}>
                                {selectedCountInProject}/{total}
                              </Badge>
                            </div>
                            {/* Items list */}
                            {expanded && (
                              <div className="border-t border-indigo-100 divide-y divide-indigo-50">
                                {p.items.map((it, iidx) => {
                                  const checked = isItemSelected(it.id);
                                  return (
                                    <div
                                      key={it.id}
                                      className={cn(
                                        "flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 transition-colors",
                                        checked &&
                                          "bg-indigo-50 ring-1 ring-indigo-200/50"
                                      )}>
                                      <div className="flex items-center gap-4 min-w-0">
                                        <span className="text-xs text-indigo-500 font-semibold w-6 text-right tabular-nums">
                                          {iidx + 1}
                                        </span>
                                        <Checkbox
                                          checked={checked}
                                          onCheckedChange={(v) =>
                                            setItemChecked(p.id, it.id, !!v)
                                          }
                                          className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                          aria-label="Select item"
                                        />
                                        <button
                                          className="text-left min-w-0 flex-1"
                                          onClick={() =>
                                            setFocusedItemId(it.id)
                                          }>
                                          <div className="text-base font-semibold text-gray-900 truncate">
                                            {(getItemTitle(it) ||
                                              getItemKeywords(it)[0]) ??
                                              "Untitled"}
                                          </div>
                                          <div className="text-sm text-indigo-600 truncate mt-1">
                                            {getItemKeywords(it).join(", ")}
                                          </div>
                                        </button>
                                      </div>
                                      {checked && (
                                        <IconCheck className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </PremiumCard>
            </div>
          </div>
          {/* CENTER — Defaults + Preview */}
          <div className="xl:col-span-5 space-y-6">
            <PremiumCard>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="pb-5">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Global Post Settings
                  </CardTitle>
                  <CardDescription className="text-indigo-600">
                    These defaults apply across all selected contents (unique
                    title/content per site). <span className="font-semibold">Category is mandatory.</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <section className="space-y-3">
                    <PremiumSectionTitle
                      icon={<IconTags className="h-5 w-5" />}>
                      Tags
                    </PremiumSectionTitle>
                    <TagsInput
                      value={keywordsDefaults}
                      onChange={setKeywordsDefaults}
                    />
                  </section>
                  <section className="space-y-3">
                    <PremiumSectionTitle>
                      Category (Same for All) <span className="text-xs text-red-600 ml-2">*required</span>
                    </PremiumSectionTitle>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white border-indigo-300 rounded-2xl">
                        <SelectValue placeholder="Select a category (required)" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c} className="rounded-xl">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </section>
                  <section className="space-y-3">
                    <PremiumSectionTitle
                      icon={<IconPhoto className="h-5 w-5" />}>
                      Feature Image (Same for All)
                    </PremiumSectionTitle>
                    <ImagePicker
                      imageUrl={imageUrl}
                      onImageUrlChange={setImageUrl}
                      file={imageFile}
                      onFileChange={setImageFile}
                    />
                    <p className="text-xs text-indigo-600 font-medium">
                      Uploaded to each site as featured image (optional).
                    </p>
                  </section>
                  <section className="space-y-4">
                    <PremiumSectionTitle
                      icon={<IconMap2 className="h-5 w-5" />}>
                      Location Details
                    </PremiumSectionTitle>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          Country
                        </Label>
                        <Input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          State/Province
                        </Label>
                        <Input
                          value={state}
                          onChange={(e) => setStateVal(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          City
                        </Label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          ZIP/Postal Code
                        </Label>
                        <Input
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Street Address
                      </Label>
                      <Input
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        className="bg-white border-indigo-300 rounded-xl"
                      />
                    </div>
                  </section>
                  <section className="space-y-4">
                    <PremiumSectionTitle
                      icon={<IconAddressBook className="h-5 w-5" />}>
                      Contact Information
                    </PremiumSectionTitle>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          Phone
                        </Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          Website
                        </Label>
                        <div className="flex items-center">
                          <IconWorldWww className="h-5 w-5 mr-3 text-indigo-500" />
                          <Input
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="bg-white border-indigo-300 rounded-xl flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          Email
                        </Label>
                        <div className="flex items-center">
                          <IconAt className="h-5 w-5 mr-3 text-indigo-500" />
                          <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white border-indigo-300 rounded-xl flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="space-y-4">
                    <PremiumSectionTitle
                      icon={<IconWorld className="h-5 w-5" />}>
                      Social Connections
                    </PremiumSectionTitle>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                          <IconBrandFacebook className="h-4 w-4 text-blue-600" />{" "}
                          Facebook
                        </Label>
                        <Input
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                          <IconBrandTwitter className="h-4 w-4 text-blue-400" />{" "}
                          Twitter / X
                        </Label>
                        <Input
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                          <IconBrandLinkedin className="h-4 w-4 text-blue-700" />{" "}
                          LinkedIn
                        </Label>
                        <Input
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                          <IconBrandPinterest className="h-4 w-4 text-red-500" />{" "}
                          Pinterest
                        </Label>
                        <Input
                          value={pinterest}
                          onChange={(e) => setPinterest(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                          <IconBrandInstagram className="h-4 w-4 text-pink-500" />{" "}
                          Instagram
                        </Label>
                        <Input
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                          <IconBrandCpp className="h-4 w-4 text-yellow-600" />{" "}
                          Yelp
                        </Label>
                        <Input
                          value={yelp}
                          onChange={(e) => setYelp(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                          <IconBrandGoogle className="h-4 w-4 text-red-500" />{" "}
                          Google Business
                        </Label>
                        <Input
                          value={gmb}
                          onChange={(e) => setGmb(e.target.value)}
                          className="bg-white border-indigo-300 rounded-xl"
                        />
                      </div>
                    </div>
                  </section>
                </CardContent>
              </Card>
            </PremiumCard>
            <PremiumCard>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Live Preview
                  </CardTitle>
                  <CardDescription className="text-indigo-600">
                    Select an item from the left to see a real-time preview
                    here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Unique Title
                    </Label>
                    <Input
                      value={focusedItem ? getItemTitle(focusedItem) : ""}
                      readOnly
                      placeholder="Click an item to preview its title"
                      className="bg-indigo-50/50 border-indigo-300 rounded-xl mt-1 font-semibold"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Unique Content
                    </Label>
                    <Textarea
                      value={focusedItem ? getItemHtml(focusedItem) : ""}
                      readOnly
                      placeholder="Click an item to preview its full content"
                      className="min-h-[200px] bg-indigo-50/50 border-indigo-300 rounded-xl mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </PremiumCard>
          </div>
          {/* RIGHT — Controls + Processing Box */}
          <div className="xl:col-span-3">
            <div className="sticky top-8 space-y-6">
              <PremiumCard>
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="pb-5">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                      <IconSparkles className="h-6 w-6 text-purple-600" /> API
                      Publisher
                    </CardTitle>
                    <CardDescription className="text-indigo-600">
                      Match content count with sites for unique posts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* SITES CHECKBOX LIST */}
                    <section className="space-y-3">
                      <Label className="text-sm font-bold flex items-center gap-3 text-gray-900">
                        <IconGlobe className="h-5 w-5 text-indigo-600" /> Target
                        Sites ({selectedSitesCount}/{selectedCount || 0})
                      </Label>

                      {/* Site Search & Quick Actions */}
                      <div className="space-y-2">
                        <div className="relative">
                          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            value={siteSearch}
                            onChange={(e) => setSiteSearch(e.target.value)}
                            placeholder="Filter sites..."
                            className="pl-9 bg-white border-indigo-200 rounded-xl text-sm h-9"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-lg border-indigo-200 text-xs text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
                            onClick={handleAutoSelectSites}
                            title="Auto-select top available sites matching content count">
                            <IconRefresh className="h-3 w-3 mr-1.5" />
                            Auto-Fill Sites
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-red-200 text-xs text-red-600 bg-red-50/50 hover:bg-red-100"
                            onClick={() => setSelectedSiteValues(new Set())}
                            title="Clear site selection">
                            <IconTrash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {selectedCount === 0 && (
                        <div className="text-sm text-indigo-500 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                          👈 Begin by selecting content on the left.
                        </div>
                      )}

                      <div className="rounded-2xl ring-1 ring-indigo-200 bg-white/80 divide-y divide-indigo-50 shadow-sm max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300">
                        {filteredSites.slice(0, 50).map((s) => {
                          const isChecked = selectedSiteValues.has(s.value);
                          const disableNew =
                            !isChecked &&
                            (selectedSitesCount >= selectedCount ||
                              selectedCount === 0);
                          return (
                            <label
                              key={s.value}
                              className={cn(
                                "flex items-center justify-between gap-4 px-4 py-3 cursor-pointer transition-all hover:bg-indigo-50/50",
                                isChecked &&
                                  "bg-indigo-50/80 ring-1 ring-indigo-200/50",
                                disableNew && "opacity-70 cursor-not-allowed"
                              )}>
                              <div className="flex items-center gap-3 min-w-0">
                                <Checkbox
                                  checked={isChecked}
                                  disabled={disableNew}
                                  onCheckedChange={(v) =>
                                    toggleSite(s.value, !!v)
                                  }
                                  className="h-5 w-5 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                />
                                <span className="text-sm font-semibold text-gray-900 truncate">
                                  {s.label}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                        {filteredSites.length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No sites match "{siteSearch}"
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-indigo-600 font-medium">
                        Pro Tip: {selectedCount} contents require exactly{" "}
                        {selectedCount} sites.
                      </p>
                    </section>
                    <Separator className="border-indigo-200" />
                    <div className="grid gap-4">
                      <Button
                        onClick={handleStart}
                        disabled={!readyToStart || isStarting}
                        className={cn(
                          "rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 h-12 font-bold text-lg",
                          !readyToStart && "opacity-70 cursor-not-allowed"
                        )}>
                        <IconPlayerPlay className="h-5 w-5 mr-3" />
                        {isStarting
                          ? "Publishing…"
                          : `Publish Now (${selectedCount})`}
                      </Button>
                      <div className="flex items-center justify-between text-sm text-indigo-600">
                        <span className="flex items-center gap-2 font-medium">
                          <IconCheck className="h-4 w-4" />
                          {selectedCount} Contents Ready
                        </span>
                        <span className="flex items-center gap-2 font-medium">
                          <IconGlobe className="h-4 w-4" />
                          {selectedSitesCount} Sites Locked
                        </span>
                      </div>
                      {jobId && status === "running" && (
                        <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-4 border border-indigo-100/50">
                          <div className="flex items-center justify-between text-sm text-indigo-600 mb-3 font-medium">
                            <span>Publishing: {jobId.slice(-6)}</span>
                            <span>{progress}% Complete</span>
                          </div>
                          <Progress
                            value={progress}
                            className="h-3 bg-indigo-200 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </PremiumCard>
              {/* Processing Box - Runs/Backlinks */}
              {runs.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <IconSparkles className="h-5 w-5 text-green-600" />
                    Publishing Results
                  </h3>

                  {runs.map((run) => (
                    <div
                      key={run.jobId}
                      className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
                      {/* Run Header */}
                      <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Job ID
                          </span>
                          <span className="text-sm font-mono text-slate-700">
                            {run.jobId ? run.jobId.slice(-8) : "Unknown"}
                          </span>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-1 shadow-sm",
                            run.status === "done"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : run.status === "error"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                          )}>
                          {run.status === "done"
                            ? "COMPLETED"
                            : run.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Backlinks List */}
                      {(run.backlinks?.length ?? 0) > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {run.backlinks!.map((link, idx) => {
                            const url = new URL(link);
                            const hostname = url.hostname.replace("www.", "");
                            return (
                              <div
                                key={idx}
                                className="group flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col min-w-0 pr-4">
                                  <span className="text-sm font-bold text-slate-800">
                                    {hostname}
                                  </span>
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline truncate block">
                                    {link}
                                  </a>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full bg-white border border-slate-200 hover:bg-indigo-50 text-slate-600"
                                    onClick={() => {
                                      navigator.clipboard.writeText(link);
                                      toast.success("Link copied!");
                                    }}
                                    title="Copy Link">
                                    <IconCopy className="h-4 w-4" />
                                  </Button>
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 rounded-full bg-white border border-slate-200 hover:bg-indigo-50 text-slate-600"
                                      title="Open Link">
                                      <IconExternalLink className="h-4 w-4" />
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-400 italic">
                          No backlinks generated yet...
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="bg-slate-50 p-3 flex gap-2 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white border-slate-200 hover:bg-green-50 hover:text-green-700 text-slate-600"
                          onClick={() => {
                            const all = (run.backlinks || []).join("\n");
                            navigator.clipboard.writeText(all);
                            toast.success("All links copied!");
                          }}>
                          <IconCopy className="h-3.5 w-3.5 mr-2" />
                          Copy All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-600"
                          onClick={() => {
                            if (run.jobId) {
                              downloadRunExcel(
                                run.jobId,
                                `report-${run.jobId.slice(-6)}.xlsx`
                              );
                            }
                          }}>
                          <IconListDetails className="h-3.5 w-3.5 mr-2" />
                          Export Excel
                        </Button>
                      </div>

                      {/* Terminal-style Logs */}
                      {(run.logs ?? []).length > 0 && (
                        <details className="group border-t border-slate-100">
                          <summary className="cursor-pointer bg-slate-100 p-2 text-xs font-semibold text-slate-600 flex justify-between px-4 group-open:bg-slate-200">
                            <span>System Logs ({run.logs!.length})</span>
                            <IconChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="bg-slate-900 text-green-400 p-4 text-xs font-mono max-h-40 overflow-auto whitespace-pre-wrap">
                            {run.logs!.map((log, i) => (
                              <div key={i} className="mb-1">
                                <span className="text-slate-500 mr-2">
                                  {">"}
                                </span>
                                {log}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl ring-1 ring-indigo-200 bg-white shadow-lg p-5 text-sm text-gray-800 border border-indigo-100/50">
                <p className="mb-2 flex items-center gap-2">
                  ✅ <b>Workflow:</b> Select → Match → Publish (Direct WP API)
                </p>
                <p className="mb-4">
                  🚀 <b>Unique per site:</b> Title + Content | Same: Image +
                  Keywords + Category (Category is mandatory)
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSavePreset}
                    className="rounded-full border-indigo-300 hover:bg-indigo-50">
                    💾 Save Config
                  </Button>
                  <Badge className="rounded-full bg-purple-100 text-purple-800 border-purple-300">
                    50+ Sites Ready
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}