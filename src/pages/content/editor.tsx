// // src/pages/content/editor.tsx
// import React, { useCallback, useEffect, useRef, useState } from "react";

// /** Editor page that reads sessionStorage/localStorage keys written by openContentEditor.
//  *  - Expects key: "open_content_item_v1_<openId>" in sessionStorage (preferred)
//  *  - Fallbacks: "open-content-item" (sessionStorage or localStorage)
//  *  - If still not found, shows friendly message and logs diagnostics; does NOT redirect to home.
//  */

// function getParam(name: string) {
//   if (typeof window === "undefined") return null;
//   const params = new URLSearchParams(window.location.search);
//   return params.get(name);
// }

// export default function ContentEditorPage(): React.ReactElement {






//   const [loading, setLoading] = useState(true);
//   const [rawItem, setRawItem] = useState<any | null>(null);
//   const [debugInfo, setDebugInfo] = useState<string[]>([]);
//   const editorRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const openId = getParam("openId");
//     const triedKeys: string[] = [];
//     // const foundSources: string[] = [];

//     // Build candidate keys
//     if (openId) triedKeys.push(`open_content_item_v1_${openId}`);
//     triedKeys.push("open-content-item");
//     if (openId) triedKeys.push(`open_content_item_v1_${openId}`);
//     // generic last chance: check any session key that starts with prefix
//     // (not allowed in some CSPs, but try to list)
//     try {
//       // Check sessionStorage first
//       for (const k of triedKeys) {
//         const v = sessionStorage.getItem(k);
//         if (v) {
//           setDebugInfo((d) => [...d, `found in sessionStorage key=${k}`]);
//           setRawItem(JSON.parse(v));
//           setLoading(false);
//           return;
//         }
//       }
//       // fallback to localStorage
//       for (const k of triedKeys) {
//         const v = localStorage.getItem(k);
//         if (v) {
//           setDebugInfo((d) => [...d, `found in localStorage key=${k}`]);
//           setRawItem(JSON.parse(v));
//           setLoading(false);
//           return;
//         }
//       }
//       // try generic prefix scan (sessionStorage) - only if available
//       const prefix = "open_content_item_v1_";
//       for (let i = 0; i < sessionStorage.length; i++) {
//         const key = sessionStorage.key(i);
//         if (!key) continue;
//         if (key.startsWith(prefix)) {
//           const v = sessionStorage.getItem(key);
//           if (v) {
//             setDebugInfo((d) => [...d, `found in sessionStorage prefix key=${key}`]);
//             setRawItem(JSON.parse(v));
//             setLoading(false);
//             return;
//           }
//         }
//       }
//     } catch (e) {
//       console.warn("editor: storage access error", e);
//       setDebugInfo((d) => [...d, `storage read error: ${(e as Error).message}`]);
//     }

//     // nothing found
//     setDebugInfo((d) => [...d, `No storage key found. Tried: ${triedKeys.join(", ")}`]);
//     setLoading(false);
//   }, []);

//   // Build initial HTML
//   const buildInitialHtml = useCallback(() => {
//     if (!rawItem) return `<div><p style="color:#666">No content loaded. Use View on a content item to open the editor.</p></div>`;
//     const title = rawItem.keyword ?? "Untitled";
//     const text = String(rawItem.generatedContent ?? "");
//     let bodyHtml = text
//       .split(/\n\s*\n/)
//       .map((p) => `<p style="margin:0 0 12px; line-height:1.6;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
//       .join("");

//     // hyperlink first occurrence if link present
//     if (rawItem.keyword && rawItem.keywordLink) {
//       const kw = rawItem.keyword;
//       const regex = new RegExp(`(${escapeRegExp(kw)})`, "i");
//       bodyHtml = bodyHtml.replace(regex, `<a href="${escapeHtmlAttr(rawItem.keywordLink)}" target="_blank" rel="noopener noreferrer"><strong>$1</strong></a>`);
//     } else if (rawItem.keyword) {
//       // optionally bold first occurrence of keyword
//       const kw = rawItem.keyword;
//       const regex = new RegExp(`(${escapeRegExp(kw)})`, "i");
//       bodyHtml = bodyHtml.replace(regex, `<strong>$1</strong>`);
//     }

//     const html = `
//       <div style="text-align:center; margin-bottom:18px;">
//         <h1 style="font-size:28px; font-weight:700; margin:0 0 8px;">${escapeHtml(title)}</h1>
//       </div>
//       <div style="text-align:justify;">
//         ${bodyHtml}
//       </div>
//     `;
//     return html;
//   }, [rawItem]);

//   useEffect(() => {
//     if (!editorRef.current) return;
//     const html = buildInitialHtml();
//     editorRef.current.innerHTML = html;
//   }, [buildInitialHtml]);

//   // exec and simple toolbar handlers
//   const exec = (command: string, value?: string) => {
//     document.execCommand(command, false, value);
//     editorRef.current?.focus();
//   };

//   const fileToDataUrl = (file: File) =>
//     new Promise<string>((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(String(reader.result));
//       reader.onerror = (err) => reject(err);
//       reader.readAsDataURL(file);
//     });

//   const insertHtmlAtCaret = (html: string) => {
//     const sel = window.getSelection();
//     if (!sel || !sel.rangeCount) {
//       editorRef.current?.insertAdjacentHTML("beforeend", html);
//       return;
//     }
//     const range = sel.getRangeAt(0);
//     range.deleteContents();
//     const el = document.createElement("div");
//     el.innerHTML = html;
//     const frag = document.createDocumentFragment();
//     let node;
//     while ((node = el.firstChild)) frag.appendChild(node);
//     range.insertNode(frag);
//     sel.removeAllRanges();
//   };

//   const handleInsertImage = async () => {
//     const url = prompt("Image URL (paste) or leave blank to upload from device:");
//     if (!url) {
//       const input = document.createElement("input");
//       input.type = "file";
//       input.accept = "image/*";
//       input.onchange = async () => {
//         if (!input.files || input.files.length === 0) return;
//         const file = input.files[0];
//         const dataurl = await fileToDataUrl(file);
//         insertHtmlAtCaret(`<img src="${dataurl}" alt="" style="max-width:100%; height:auto;" />`);
//       };
//       input.click();
//     } else {
//       insertHtmlAtCaret(`<img src="${escapeHtmlAttr(url)}" alt="" style="max-width:100%; height:auto;" />`);
//     }
//   };

//   const handleCopyHtml = async () => {
//     if (!editorRef.current) return;
//     const html = editorRef.current.innerHTML;
//     try {
//       await navigator.clipboard.writeText(html);
//       alert("HTML copied to clipboard");
//     } catch (e) {
//       console.error(e);
//       alert("Copy failed");
//     }
//   };

//   const handleCopyText = async () => {
//     if (!editorRef.current) return;
//     const txt = editorRef.current.innerText;
//     try {
//       await navigator.clipboard.writeText(txt);
//       alert("Plain text copied to clipboard");
//     } catch (e) {
//       console.error(e);
//       alert("Copy failed");
//     }
//   };

//   // drag & drop support
//   useEffect(() => {
//     const el = editorRef.current;
//     if (!el) return;
//     const onDrop = async (e: DragEvent) => {
//       e.preventDefault();
//       if (!e.dataTransfer) return;
//       const files = Array.from(e.dataTransfer.files || []);
//       for (const f of files) {
//         if (!f.type.startsWith("image/")) continue;
//         const dataurl = await fileToDataUrl(f);
//         insertHtmlAtCaret(`<img src="${dataurl}" alt="" style="max-width:100%; height:auto;" />`);
//       }
//     };
//     const onDragOver = (e: DragEvent) => e.preventDefault();
//     el.addEventListener("drop", onDrop as any);
//     el.addEventListener("dragover", onDragOver as any);
//     return () => {
//       el.removeEventListener("drop", onDrop as any);
//       el.removeEventListener("dragover", onDragOver as any);
//     };
//   }, []);

//   if (loading) return <div>Loading editor…</div>;

//   return (
//     <div className="p-6">
//       <div style={{ marginBottom: 12 }}>
//         <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
//           <button onClick={() => exec("bold")} title="Bold">Bold</button>
//           <button onClick={() => exec("italic")} title="Italic">Italic</button>
//           <button onClick={() => exec("formatBlock", "<H1>")} title="H1">H1</button>
//           <button onClick={() => exec("justifyCenter")} title="Center">Center</button>
//           <button onClick={() => exec("justifyFull")} title="Justify">Justify</button>
//           <button onClick={() => {
//             const url = prompt("URL to link to (include http:// or https://):", "https://");
//             if (url) exec("createLink", url);
//           }} title="Add link">Link</button>
//           <button onClick={handleInsertImage} title="Insert image">Image</button>
//           <button onClick={handleCopyHtml} title="Copy HTML">Copy HTML</button>
//           <button onClick={handleCopyText} title="Copy Text">Copy Text</button>
//         </div>
//       </div>

//       <div
//         ref={editorRef}
//         contentEditable
//         suppressContentEditableWarning
//         style={{
//           minHeight: 480,
//           border: "1px solid #ddd",
//           padding: 18,
//           borderRadius: 6,
//           background: "#fff",
//           overflow: "auto"
//         }}
//         aria-label="Content editor"
//       />

//       <div style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
//         <div>Tip: drag & drop images into the editor, or use the Image button to upload / paste a URL. Click "Copy HTML" to paste on other sites.</div>
//         <div style={{ marginTop: 8 }}>
//           <strong>Debug info:</strong>
//           <ul>
//             {debugInfo.map((d, i) => <li key={i} style={{ fontSize: 12, color: "#666" }}>{d}</li>)}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* helpers */
// function escapeHtml(str: string) {
//   return str
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#039;");
// }
// function escapeHtmlAttr(str: string) {
//   return escapeHtml(String(str));
// }
// function escapeRegExp(s: string) {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }



// // src/pages/content/editor.tsx
// import React, { useCallback, useEffect, useRef, useState } from "react";

// /**
//  * ContentEditorPage
//  * - Two-column responsive layout:
//  *    left column: Title editor (editable H1 area + meta + Save)
//  *    right column: Rich content editor with toolbar, drag/drop image, insert link, copy html/text.
//  * - Reads item from sessionStorage key written by openContentEditor (or localStorage fallback).
//  * - Save writes updated item back into localStorage 'content-items' replacing by id.
//  */

// const SESSION_KEY = "open-content-item_v1";
// const FALLBACK_KEY = `${SESSION_KEY}_fallback`;

// function getStoredOpenItem(): any | null {
//   try {
//     const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(FALLBACK_KEY);
//     if (!raw) return null;
//     return JSON.parse(raw);
//   } catch (e) {
//     console.warn("getStoredOpenItem parse error", e);
//     return null;
//   }
// }

// export default function ContentEditorPage(): React.ReactElement {
//   const [loading, setLoading] = useState(true);
//   const [item, setItem] = useState<any | null>(null);
//   const titleRef = useRef<HTMLDivElement | null>(null);
//   const contentRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const found = getStoredOpenItem();
//     setItem(found);
//     setLoading(false);
//   }, []);

//   // helper to escape HTML
//   const escapeHtml = (str: string) => {
//     return str
//       .replaceAll("&", "&amp;")
//       .replaceAll("<", "&lt;")
//       .replaceAll(">", "&gt;")
//       .replaceAll('"', "&quot;")
//       .replaceAll("'", "&#039;");
//   };

//   // build initial content HTML: if item has generatedContent (plaintext), wrap paragraphs.
//   const buildInitialHtml = useCallback(() => {
//     if (!item) return {
//       titleHtml: "",
//       bodyHtml: "<div></div>"
//     };
//     const title = item.title ?? item.keyword ?? "Untitled";
//     const text = String(item.generatedContent ?? "");
//     // hyperlink first occurrence of keyword if keywordLink present
//     let body = escapeHtml(text);
//     if (item.keyword && item.keywordLink) {
//       const kw = item.keyword;
//       const regex = new RegExp(`(${escapeRegExp(kw)})`, "i");
//       body = body.replace(regex, `<a href="${escapeHtmlAttr(item.keywordLink)}" target="_blank" rel="noopener noreferrer"><strong>$1</strong></a>`);
//     }
//     // paragraphs: split double newline
//     const parts = body.split(/\n\s*\n/).map(p => `<p style="margin:0 0 12px; line-height:1.6;">${p.replace(/\n/g, "<br/>")}</p>`).join("");
//     return {
//       titleHtml: escapeHtml(title),
//       bodyHtml: parts
//     };
//   }, [item]);

//   // initialize editor areas
//   useEffect(() => {
//     if (!item) return;
//     const { titleHtml, bodyHtml } = buildInitialHtml();
//     if (titleRef.current) {
//       titleRef.current.innerHTML = `<h1 style="margin:0; font-size:28px; font-weight:700; text-align:center;">${titleHtml}</h1>`;
//     }
//     if (contentRef.current) {
//       contentRef.current.innerHTML = `<div style="text-align:justify">${bodyHtml}</div>`;
//     }
//   }, [item, buildInitialHtml]);

//   // exec toolbar commands
//   const exec = (cmd: string, value?: string) => {
//     document.execCommand(cmd, false, value);
//     // ensure focus returns to content area
//     contentRef.current?.focus();
//   };

//   const handleInsertImage = async () => {
//     const url = prompt("Paste image URL (or Cancel to upload from device):");
//     if (!url) {
//       const input = document.createElement("input");
//       input.type = "file";
//       input.accept = "image/*";
//       input.onchange = async () => {
//         if (!input.files || input.files.length === 0) return;
//         const file = input.files[0];
//         const dataurl = await fileToDataUrl(file);
//         insertHtmlAtCaret(`<img src="${escapeHtmlAttr(dataurl)}" alt="" style="max-width:100%; height:auto;" />`);
//       };
//       input.click();
//       return;
//     }
//     insertHtmlAtCaret(`<img src="${escapeHtmlAttr(url)}" alt="" style="max-width:100%; height:auto;" />`);
//   };

//   const handleAddLink = () => {
//     const url = prompt("Enter URL (include http(s)://):", "https://");
//     if (!url) return;
//     exec("createLink", url);
//   };

//   const handleCopyHtml = async () => {
//     if (!contentRef.current) return;
//     const html = (titleRef.current?.innerHTML ?? "") + "\n" + contentRef.current.innerHTML;
//     try {
//       await navigator.clipboard.writeText(html);
//       alert("HTML copied to clipboard");
//     } catch (e) {
//       console.error(e);
//       alert("Copy failed");
//     }
//   };

//   const handleCopyText = async () => {
//     if (!contentRef.current) return;
//     const txt = (titleRef.current?.innerText ?? "") + "\n\n" + contentRef.current.innerText;
//     try {
//       await navigator.clipboard.writeText(txt);
//       alert("Plain text copied to clipboard");
//     } catch (e) {
//       console.error(e);
//       alert("Copy failed");
//     }
//   };

//   // Save: persist back to localStorage 'content-items' by id (replace existing)
//   const handleSave = () => {
//     if (!item) return;
//     const updatedTitle = titleRef.current?.innerText?.trim() ?? item.title ?? item.keyword;
//     const updatedHtml = contentRef.current?.innerHTML ?? item.generatedContent ?? "";
//     // keep generatedContent as HTML for "rich" saved version; also keep a plaintext copy if needed
//     try {
//       const raw = localStorage.getItem("content-items");
//       const arr = raw ? JSON.parse(raw) as any[] : [];
//       const idx = arr.findIndex((x) => x.id === item.id);
//       const updated = { ...item, title: updatedTitle, generatedContent: updatedHtml };
//       if (idx >= 0) {
//         arr[idx] = updated;
//       } else {
//         arr.push(updated);
//       }
//       localStorage.setItem("content-items", JSON.stringify(arr));
//       // also update session/local fallback so re-opening shows latest
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
//       localStorage.setItem(FALLBACK_KEY, JSON.stringify(updated));
//       setItem(updated);
//       alert("Saved locally. You can now download / view updated content.");
//     } catch (e) {
//       console.error("save error", e);
//       alert("Save failed");
//     }
//   };

//   // drag & drop images into content area
//   useEffect(() => {
//     const el = contentRef.current;
//     if (!el) return;
//     const onDrop = async (e: DragEvent) => {
//       e.preventDefault();
//       if (!e.dataTransfer) return;
//       const files = Array.from(e.dataTransfer.files || []);
//       for (const f of files) {
//         if (!f.type.startsWith("image/")) continue;
//         const dataurl = await fileToDataUrl(f);
//         insertHtmlAtCaret(`<img src="${escapeHtmlAttr(dataurl)}" alt="" style="max-width:100%; height:auto;" />`);
//       }
//     };
//     const onDragOver = (e: DragEvent) => { e.preventDefault(); };
//     el.addEventListener("drop", onDrop as any);
//     el.addEventListener("dragover", onDragOver as any);
//     return () => {
//       el.removeEventListener("drop", onDrop as any);
//       el.removeEventListener("dragover", onDragOver as any);
//     };
//   }, []);

//   if (loading) return <div>Loading editor…</div>;
//   if (!item) return <div>No content item found to edit.</div>;

//   return (
//     <div style={{ padding: 18 }}>
//       <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 2fr" }}>
//         {/* Left column: Title block */}
//         <div style={{ border: "1px solid #e6e6e6", padding: 12, borderRadius: 8, background: "#fafafa" }}>
//           <div style={{ marginBottom: 8, fontSize: 13, color: "#333" }}>Title (editable)</div>
//           <div
//             ref={titleRef}
//             contentEditable
//             suppressContentEditableWarning
//             style={{
//               minHeight: 68,
//               outline: "none",
//               padding: 8,
//               borderRadius: 6,
//               background: "#fff",
//               textAlign: "center",
//             }}
//             aria-label="Title editor"
//           />
//           <div style={{ marginTop: 12, fontSize: 13, color: "#555" }}>
//             <div><strong>Keyword:</strong> {item.keyword}</div>
//             {item.keywordLink && <div><strong>Keyword link:</strong> <a href={item.keywordLink} target="_blank" rel="noreferrer">{item.keywordLink}</a></div>}
//             <div style={{ marginTop: 10 }}>
//               <button onClick={handleSave} style={{ marginRight: 8 }}>Save</button>
//               <button onClick={() => { window.open("", "_blank"); }} title="No-op">Preview</button>
//             </div>
//           </div>
//         </div>

//         {/* Right column: Content editor + toolbar */}
//         <div style={{ border: "1px solid #e6e6e6", padding: 12, borderRadius: 8, background: "#fff" }}>
//           <div style={{ marginBottom: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
//             <button onClick={() => exec("bold")} title="Bold">Bold</button>
//             <button onClick={() => exec("italic")} title="Italic">Italic</button>
//             <button onClick={() => exec("formatBlock", "<H1>")} title="H1">H1</button>
//             <button onClick={() => exec("justifyLeft")} title="Left">Left</button>
//             <button onClick={() => exec("justifyCenter")} title="Center">Center</button>
//             <button onClick={() => exec("justifyFull")} title="Justify">Justify</button>
//             <button onClick={handleAddLink} title="Add link">Link</button>
//             <button onClick={handleInsertImage} title="Insert image">Image</button>
//             <button onClick={handleCopyHtml} title="Copy HTML">Copy HTML</button>
//             <button onClick={handleCopyText} title="Copy Text">Copy Text</button>
//           </div>

//           <div
//             ref={contentRef}
//             contentEditable
//             suppressContentEditableWarning
//             style={{
//               minHeight: 420,
//               border: "1px solid #eee",
//               padding: 12,
//               borderRadius: 6,
//               overflow: "auto",
//             }}
//             aria-label="Content editor"
//           />
//         </div>
//       </div>

//       <div style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
//         Tip: drag & drop images into the content area or use the Image button. Click Save to persist changes back to the generated content list.
//       </div>
//     </div>
//   );
// }

// /* utils */
// function insertHtmlAtCaret(html: string) {
//   const sel = window.getSelection();
//   if (!sel || !sel.rangeCount) {
//     document.execCommand("insertHTML", false, html);
//     return;
//   }
//   const range = sel.getRangeAt(0);
//   range.deleteContents();
//   const el = document.createElement("div");
//   el.innerHTML = html;
//   const frag = document.createDocumentFragment();
//   let node;
//   while ((node = el.firstChild)) {
//     frag.appendChild(node);
//   }
//   range.insertNode(frag);
//   // move caret after inserted content
//   sel.removeAllRanges();
// }

// function fileToDataUrl(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(String(reader.result));
//     reader.onerror = (err) => reject(err);
//     reader.readAsDataURL(file);
//   });
// }

// function escapeHtmlAttr(str: string) {
//   return String(str)
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#039;");
// }

// function escapeRegExp(s: string) {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }






// // src/pages/content/editor.tsx
// import React, { useCallback, useEffect, useRef, useState } from "react";
// // import dynamic from "next/dynamic"; // If you use Next; if not, remove dynamic import and import ReactQuill directly
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// /**
//  * ContentEditorPage (Quill)
//  * - Title input at top (large)
//  * - Quill editor below with toolbar + image upload handler
//  * - Auto-hyperlink & bold first occurrence of keyword (if keywordLink exists)
//  * - Save writes back to localStorage 'content-items' replacing the item by id
//  */

// const SESSION_KEY = "open-content-item_v1";
// const FALLBACK_KEY = `${SESSION_KEY}_fallback`;

// function getStoredOpenItem(): any | null {
//   try {
//     const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(FALLBACK_KEY);
//     if (!raw) return null;
//     return JSON.parse(raw);
//   } catch (e) {
//     console.warn("getStoredOpenItem parse error", e);
//     return null;
//   }
// }

// // Add image handler for toolbar (reads file and inserts base64)
// function imageHandler(quill: any) {
//   const input = document.createElement("input");
//   input.setAttribute("type", "file");
//   input.setAttribute("accept", "image/*");
//   input.click();
//   input.onchange = async () => {
//     const file = input.files ? input.files[0] : null;
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => {
//       const range = quill.getSelection(true);
//       quill.insertEmbed(range.index, "image", String(reader.result));
//       quill.setSelection(range.index + 1);
//     };
//     reader.readAsDataURL(file);
//   };
// }

// /* toolbar options */
// const modules = {
//   toolbar: {
//     container: [
//       [{ header: [1, 2, 3, false] }],
//       ["bold", "italic", "underline", "strike"],
//       [{ align: [] }],
//       [{ list: "ordered" }, { list: "bullet" }],
//       ["link", "image"],
//       ["clean"],
//     ],
//     handlers: {
//       image: function (this: any) {
//         imageHandler(this.quill);
//       },
//     },
//   },
//   clipboard: {
//     matchVisual: false,
//   },
// };

// const formats = [
//   "header",
//   "bold",
//   "italic",
//   "underline",
//   "strike",
//   "align",
//   "list",
//   "bullet",
//   "link",
//   "image",
// ];

// export default function ContentEditorPage(): React.ReactElement {
//   const [loading, setLoading] = useState(true);
//   const [item, setItem] = useState<any | null>(null);
//   const [title, setTitle] = useState("");
//   const [editorHtml, setEditorHtml] = useState("");
//   const quillRef = useRef<ReactQuill | null>(null);

//   useEffect(() => {
//     const found = getStoredOpenItem();
//     setItem(found);
//     if (found) {
//       setTitle(found.title ?? found.keyword ?? "");
//       const content = found.generatedContent ?? "";
//       // content might be plain text or HTML; store as HTML in quill
//       setEditorHtml(content);
//     }
//     setLoading(false);
//   }, []);

//   // after editor mounted and content set, perform hyperlink + bold first occurrence
//   const linkifyFirstOccurrence = useCallback(() => {
//     if (!item || !item.keyword || !item.keywordLink) return;
//     const editor = quillRef.current?.getEditor();
//     if (!editor) return;
//     const plain = editor.getText(); // includes trailing newline
//     const idx = plain.toLowerCase().indexOf(String(item.keyword).toLowerCase());
//     if (idx >= 0) {
//       // remove any pre-existing formatting on that range, then apply bold+link
//       editor.formatText(idx, item.keyword.length, "bold", true);
//       editor.formatText(idx, item.keyword.length, "link", item.keywordLink);
//     }
//   }, [item]);

//   // call linkify after html is applied to editor
//   useEffect(() => {
//     if (!quillRef.current) return;
//     // small delay to ensure content pasted
//     const t = setTimeout(() => linkifyFirstOccurrence(), 250);
//     return () => clearTimeout(t);
//   }, [editorHtml, linkifyFirstOccurrence]);

//   // Save updates to localStorage content-items (replace by id)
//   const handleSave = () => {
//     if (!item) return;
//     const editor = quillRef.current?.getEditor();
//     const html = editor ? editor.root.innerHTML : editorHtml;
//     const updated = {
//       ...item,
//       title: title?.trim() || item.title || item.keyword,
//       generatedContent: html,
//     };
//     try {
//       const raw = localStorage.getItem("content-items");
//       const arr = raw ? JSON.parse(raw) as any[] : [];
//       const idx = arr.findIndex((x) => x.id === item.id);
//       if (idx >= 0) arr[idx] = updated; else arr.push(updated);
//       localStorage.setItem("content-items", JSON.stringify(arr));
//       // update session & fallback so re-open gets new data
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
//       localStorage.setItem(FALLBACK_KEY, JSON.stringify(updated));
//       setItem(updated);
//       alert("Saved locally. Content list updated.");
//     } catch (e) {
//       console.error("save error", e);
//       alert("Save failed");
//     }
//   };

//   // Drag & drop images into the editor (base64)
//   useEffect(() => {
//     const el = quillRef.current?.editor?.root ?? document.querySelector(".ql-editor");
//     if (!el) return;
//     const onDrop = async (e: DragEvent) => {
//       e.preventDefault();
//       if (!e.dataTransfer) return;
//       const files = Array.from(e.dataTransfer.files || []);
//       for (const f of files) {
//         if (!f.type.startsWith("image/")) continue;
//         const reader = new FileReader();
//         reader.onload = () => {
//           const editor = quillRef.current?.getEditor();
//           const range = editor?.getSelection(true);
//           editor?.insertEmbed(range?.index ?? 0, "image", String(reader.result));
//         };
//         reader.readAsDataURL(f);
//       }
//     };
//     const onDragOver = (e: DragEvent) => e.preventDefault();
//     el.addEventListener("drop", onDrop as any);
//     el.addEventListener("dragover", onDragOver as any);
//     return () => {
//       el.removeEventListener("drop", onDrop as any);
//       el.removeEventListener("dragover", onDragOver as any);
//     };
//   }, []);

//   if (loading) return <div>Loading editor…</div>;
//   if (!item) return <div>No content item found to edit.</div>;

//   return (
//     <div style={{ maxWidth: 1100, margin: "18px auto", padding: 12 }}>
//       <div style={{ marginBottom: 12 }}>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Title"
//           style={{
//             width: "100%",
//             padding: "10px 12px",
//             fontSize: 20,
//             borderRadius: 6,
//             border: "1px solid #ddd",
//             boxSizing: "border-box",
//             marginBottom: 8,
//           }}
//         />
//       </div>

//       <div style={{ border: "1px solid #e6e6e6", borderRadius: 6, overflow: "hidden", background: "#fff" }}>
//         <ReactQuill
//           ref={(el) => { quillRef.current = el; }}
//           value={editorHtml}
//           onChange={(html) => setEditorHtml(html)}
//           modules={modules}
//           formats={formats}
//           placeholder="Write or paste content here..."
//           theme="snow"
//         />
//       </div>

//       <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
//         <div style={{ color: "#666", fontSize: 13 }}>
//           <div><strong>Keyword:</strong> <span style={{ fontWeight: 600 }}>{item.keyword}</span></div>
//           {item.keywordLink && (
//             <div>
//               <strong>Keyword link:</strong>{" "}
//               <a href={item.keywordLink} target="_blank" rel="noreferrer">{item.keywordLink}</a>
//             </div>
//           )}
//         </div>

//         <div style={{ display: "flex", gap: 8 }}>
//           <button onClick={handleSave} style={{ padding: "8px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6 }}>Save</button>
//           <button onClick={() => {
//             // copy HTML to clipboard (title + content)
//             const editor = quillRef.current?.getEditor();
//             const html = `<h1>${escapeHtml(title)}</h1>\n` + (editor ? editor.root.innerHTML : editorHtml);
//             navigator.clipboard.writeText(html).then(() => alert("HTML copied to clipboard")).catch(() => alert("Copy failed"));
//           }} style={{ padding: "8px 12px", borderRadius: 6 }}>Copy HTML</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* small helpers */
// function escapeHtml(s: string) {
//   return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
// }
// // function escapeRegExp(s: string) {
// //   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// // }





// src/pages/content/editor.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const SESSION_KEY = "open-content-item_v1";
const FALLBACK_KEY = `${SESSION_KEY}_fallback`;

function getStoredOpenItem(): any | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(FALLBACK_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("getStoredOpenItem parse error", e);
    return null;
  }
}

/**
 * normalizeIncomingContent
 * - If the incoming content contains headings marked with "###" (or ## / #) inside HTML paragraphs,
 *   this function splits them into proper <h3>/<h2>/<h1> elements and creates paragraph breaks.
 * - Preserves existing <a> tags.
 * - Converts multiple newlines to paragraph breaks and single newlines to <br/>.
 */
function normalizeIncomingContent(raw: string) {
  if (!raw) return "";

  let s = String(raw);

  // 1) If it's plain text (no tags), run our markdown->HTML converter
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(s);

  // Quick helper: escape HTML (used only for pure-text path)
  const escapeHtml = (t: string) =>
    t.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  if (!hasHtmlTags) {
    // convert headings and paragraphs for plain-text input
    // Replace ###, ##, # at line starts with headings
    s = s
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("### ")) return `<h3>${escapeHtml(trimmed.slice(4).trim())}</h3>`;
        if (trimmed.startsWith("## ")) return `<h2>${escapeHtml(trimmed.slice(3).trim())}</h2>`;
        if (trimmed.startsWith("# ")) return `<h1>${escapeHtml(trimmed.slice(2).trim())}</h1>`;
        if (trimmed === "") return "</p><p>"; // paragraph break marker (we'll clean later)
        return escapeHtml(line).replace(/\n/g, "<br/>");
      })
      .join("\n");
    // wrap with paragraph tags
    if (!s.startsWith("<h") && !s.startsWith("<p")) {
      s = `<p>${s}</p>`;
    }
    // fix any marker we introduced
    s = s.replace(/<\/p><p>/g, "</p><p>"); // no-op but keeps structure consistent
    // collapse possible consecutive empty paragraphs
    s = s.replace(/(<p>\s*<\/p>)+/g, "");
    return s;
  }

  // 2) If content contains HTML, we try to split paragraphs that include "### ..." markers.
  // Strategy:
  //  - Replace occurrences like "<p>... ### Heading ...</p>" with "<p>previous text</p><h3>Heading</h3>"
  //  - Also replace occurrences of plain "### Heading" (not inside tags) to <h3>.
  //  - Convert double newlines outside tags to paragraph breaks.
  //  - Finally normalize single newlines -> <br/> inside paragraphs.

  // Normalize line endings first
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Handle <p> ... ### heading ... </p> where ### appears inside the paragraph text:
  // This will split into paragraph(s) + heading(s).
  s = s.replace(
    /<p\b([^>]*)>((?:(?!<\/p>).)*?)<\/p>/gi,
    ( pAttr, inner) => {
      // If inner contains one or more "### " markers, split at them
      if (!/###\s+/i.test(inner) && !/##\s+/i.test(inner) && !/^#{1,6}\s+/m.test(inner)) {
        // ensure inner single-newlines become <br/>
        const cleanedInner = inner.replace(/\n/g, "<br/>");
        return `<p${pAttr}>${cleanedInner}</p>`;
      }
      // split by heading markers inside this paragraph
      // We'll iterate lines separated by double-newline or markers
      let fragment = inner;
      // Replace Windows newlines
      fragment = fragment.replace(/\n{2,}/g, "\n\n");
      // Break into parts where "### " (or "## ", "# ") occur
      // We'll find all headings and preceding text
      const parts: string[] = [];
      let remaining = fragment;
      // regex to find next heading marker
      const headingRegex = /(?:^|\n)(#{1,6})\s*(.+?)(?=\n|$)/i;
      while (true) {
        const m = headingRegex.exec(remaining);
        if (!m) {
          // no more headings, remaining is paragraph text
          if (remaining.trim()) parts.push(`<p>${remaining.replace(/\n/g, "<br/>").trim()}</p>`);
          break;
        }
        const marker = m[1];
        const headingText = m[2].trim();
        // text before this heading
        const idx = m.index;
        const before = remaining.slice(0, idx);
        if (before.trim()) parts.push(`<p>${before.replace(/\n/g, "<br/>").trim()}</p>`);
        const level = Math.min(6, marker.length);
        parts.push(`<h${level}>${headingText}</h${level}>`);
        // cut the processed portion
        remaining = remaining.slice(m.index + m[0].length);
      }
      return parts.join("\n");
    }
  );

  // If there are any remaining bare markdown headings outside <p> blocks, convert them
  s = s.replace(/(^|\n)#{3}\s*(.+?)(\n|$)/g, "\n<h3>$2</h3>\n");
  s = s.replace(/(^|\n)#{2}\s*(.+?)(\n|$)/g, "\n<h2>$2</h2>\n");
  s = s.replace(/(^|\n)#{1}\s*(.+?)(\n|$)/g, "\n<h1>$2</h1>\n");

  // Convert repeated blank lines into paragraph separators and ensure plain text nodes wrapped in <p>
  // We'll wrap any sequences of non-tag text (that contain letters) into <p> ... </p> if not already wrapped.
  s = s.replace(/\n{2,}/g, "</p><p>"); // coarse but helps
  // Ensure we don't accidentally create malformed tags: collapse sequences
  s = s.replace(/<\/p>\s*<p>/g, "</p><p>");
  // Now, ensure that any leftover text nodes outside tags are wrapped:
  // We'll add a wrapper for top-level stray text (very defensive)
  if (!/^<\w+/i.test(s.trim())) {
    s = `<p>${s.replace(/\n/g, "<br/>")}</p>`;
  }

  // Finally, replace single newlines inside paragraphs by <br/>
  s = s.replace(/<p\b([^>]*)>((?:(?!<\/p>).)*?)<\/p>/gi, ( pAttr, inner) => {
    const updatedInner = inner.replace(/\n/g, "<br/>");
    return `<p${pAttr}>${updatedInner}</p>`;
  });

  // Collapse any accidental empty paragraphs
  s = s.replace(/<p>\s*<\/p>/g, "");

  return s;
}

/* ---------- Quill toolbar + image handler ---------- */
function imageHandler(quill: any) {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();
  input.onchange = async () => {
    const file = input.files ? input.files[0] : null;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", String(reader.result));
      quill.setSelection(range.index + 1);
    };
    reader.readAsDataURL(file);
  };
}

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
    handlers: {
      image: function (this: any) {
        imageHandler(this.quill);
      },
    },
  },
  clipboard: { matchVisual: false },
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "align",
  "list",
  "bullet",
  "link",
  "image",
];

export default function ContentEditorPage(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const quillRef = useRef<ReactQuill | null>(null);

  useEffect(() => {
    const found = getStoredOpenItem();
    setItem(found);
    if (found) {
      setTitle(found.title ?? found.keyword ?? "");
      const raw = found.generatedContent ?? "";
      const normalized = normalizeIncomingContent(raw);
      setEditorHtml(normalized || "<p></p>");
    }
    setLoading(false);
  }, []);

  // Function to bold+link first occurrence of keyword (runs after Quill content set)
  const linkifyFirstOccurrence = useCallback(() => {
    if (!item || !item.keyword || !item.keywordLink) return;
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const plain = quill.getText(); // plain text
    const kw = String(item.keyword).trim();
    if (!kw) return;
    const escaped = escapeRegExp(kw);
    const useWordBoundary = /^\w+$/.test(kw);
    const regex = useWordBoundary ? new RegExp(`\\b${escaped}\\b`, "i") : new RegExp(escaped, "i");
    const m = plain.match(regex);
    let idx = -1;
    if (m && typeof m.index === "number") idx = m.index;
    else idx = plain.toLowerCase().indexOf(kw.toLowerCase());
    if (idx >= 0) {
      try {
        quill.formatText(idx, kw.length, "link", item.keywordLink);
        quill.formatText(idx, kw.length, "bold", true);
      } catch (e) {
        console.warn("linkify error", e);
      }
    }
  }, [item]);

  // run linkify after editorHtml set + a short delay to ensure Quill applied content
  useEffect(() => {
    const t = setTimeout(() => linkifyFirstOccurrence(), 300);
    return () => clearTimeout(t);
  }, [editorHtml, linkifyFirstOccurrence]);

  const handleSave = () => {
    if (!item) return;
    const quill = quillRef.current?.getEditor();
    const html = quill ? quill.root.innerHTML : editorHtml;
    const updated = { ...item, title: title?.trim() || item.title || item.keyword, generatedContent: html };
    try {
      const raw = localStorage.getItem("content-items");
      const arr = raw ? JSON.parse(raw) as any[] : [];
      const idx = arr.findIndex((x) => x.id === item.id);
      if (idx >= 0) arr[idx] = updated; else arr.push(updated);
      localStorage.setItem("content-items", JSON.stringify(arr));
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(updated));
      setItem(updated);
      alert("Saved locally. Content list updated.");
      try { window.dispatchEvent(new Event("storage")); } catch (_) {}
    } catch (e) {
      console.error("save error", e);
      alert("Save failed");
    }
  };

  useEffect(() => {
    // drag & drop image support
    const el = quillRef.current?.editor?.root ?? document.querySelector(".ql-editor");
    if (!el) return;
    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      if (!e.dataTransfer) return;
      const files = Array.from(e.dataTransfer.files || []);
      for (const f of files) {
        if (!f.type.startsWith("image/")) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const q = quillRef.current?.getEditor();
          const range = q?.getSelection(true);
          q?.insertEmbed(range?.index ?? 0, "image", String(reader.result));
        };
        reader.readAsDataURL(f);
      }
    };
    const onDragOver = (e: DragEvent) => e.preventDefault();
    el.addEventListener("drop", onDrop as any);
    el.addEventListener("dragover", onDragOver as any);
    return () => {
      el.removeEventListener("drop", onDrop as any);
      el.removeEventListener("dragover", onDragOver as any);


      
    };
  }, []);

  if (loading) return <div>Loading editor…</div>;
  if (!item) return <div>No content item found to edit.</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: 12 }}>
      <style>{`
        .ql-container { border: none; }
        .ql-toolbar { border: 1px solid #e6e6e6; border-bottom: none; border-radius: 6px 6px 0 0; }
        .ql-editor {
          min-height: 700px; /* increased slightly */
          padding: 18px;
          font-size: 15px;
          line-height: 1.7;
        }
        .ql-editor p { margin: 0 0 16px; } 
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { margin: 0 0 14px; font-weight:700; }
        .ql-editor img { max-width: 100%; height: auto; display: block; margin: 8px 0; }
      `}</style>

      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 22,
            borderRadius: 6,
            border: "1px solid #ddd",
            boxSizing: "border-box",
            marginBottom: 8,
            fontWeight: 700,
            textAlign: "center",
          }}
        />
      </div>

      <div style={{ border: "1px solid #e6e6e6", borderRadius: 6, overflow: "hidden", background: "#fff" }}>
        <ReactQuill
          ref={(el) => { quillRef.current = el; }}
          value={editorHtml}
          onChange={(html) => setEditorHtml(html)}
          modules={modules}
          formats={formats}
          placeholder="Write or paste content here..."
          theme="snow"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <div style={{ color: "#666", fontSize: 13 }}>
          <div><strong>Keyword:</strong> <span style={{ fontWeight: 600 }}>{item.keyword}</span></div>
          {item.keywordLink && (
            <div>
              <strong>Keyword link:</strong>{" "}
              <a href={item.keywordLink} target="_blank" rel="noreferrer">{item.keywordLink}</a>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSave} style={{ padding: "10px 14px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6 }}>Save</button>
          <button onClick={() => {
            const q = quillRef.current?.getEditor();
            const html = `<h1>${escapeHtml(title)}</h1>\n` + (q ? q.root.innerHTML : editorHtml);
            navigator.clipboard.writeText(html).then(() => alert("HTML copied to clipboard")).catch(() => alert("Copy failed"));
          }} style={{ padding: "10px 14px", borderRadius: 6 }}>Copy HTML</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function escapeHtml(s: string) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
