// import React, { useEffect, useRef, useState } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

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

// function escapeHtml(s: string) {
//   return String(s)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");
// }

// function applyAnchorTokenOnce(html: string, keyword: string, url?: string | null) {
//   if (!html || !keyword) return html || "";
//   const token = `[ANCHOR:${keyword}]`;
//   if (html.indexOf(token) === -1) return html;

//   const safeUrl = url ? escapeHtml(url) : "";
//   const safeKw = escapeHtml(keyword);
//   const anchor = url
//     ? `<a href="${safeUrl}" target="_blank" rel="nofollow noopener"><strong>${safeKw}</strong></a>`
//     : `<strong>${safeKw}</strong>`;

//   return html.replace(token, anchor); // exactly once
// }

// function linkifyFirstOccurrenceInQuill(quill: any, keyword: string, url?: string | null) {
//   if (!quill || !keyword) return;
//   const plain = quill.getText();
//   const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const wordBoundary = /^\w+$/.test(keyword);
//   const regex = wordBoundary ? new RegExp(`\\b${escaped}\\b`, "i") : new RegExp(escaped, "i");
//   const m = plain.match(regex);
//   const idx = (m && (m as any).index !== undefined) ? (m as any).index : plain.toLowerCase().indexOf(keyword.toLowerCase());
//   if (idx >= 0) {
//     try {
//       if (url) quill.formatText(idx, keyword.length, "link", url);
//       quill.formatText(idx, keyword.length, "bold", true);
//     } catch (e) {
//       console.warn("linkify error", e);
//     }
//   }
// }

// /** Normalise model text or HTML into clean HTML for Quill */
// function normalizeIncomingContent(raw: string) {
//   if (!raw) return "";
//   let s = String(raw);
//   const hasHtml = /<\/?[a-z][\s\S]*>/i.test(s);

//   if (!hasHtml) {
//     s = s
//       .replace(/\r\n/g, "\n")
//       .replace(/\r/g, "\n")
//       .split("\n")
//       .map((line) => {
//         const trimmed = line.trim();
//         if (trimmed.startsWith("### ")) return `<h3>${escapeHtml(trimmed.slice(4).trim())}</h3>`;
//         if (trimmed.startsWith("## ")) return `<h2>${escapeHtml(trimmed.slice(3).trim())}</h2>`;
//         if (trimmed.startsWith("# ")) return `<h1>${escapeHtml(trimmed.slice(2).trim())}</h1>`;
//         if (trimmed === "") return "</p><p>";
//         return `<p>${escapeHtml(line)}</p>`;
//       })
//       .join("\n");
//     s = s.replace(/(<\/p><p>)+/g, "</p><p>").replace(/^<\/p><p>/, "<p>").replace(/<\/p><p>$/, "</p>");
//     if (!/^<p>|^<h[1-6]/i.test(s)) s = `<p>${escapeHtml(s)}</p>`;
//     return s;
//   }

//   s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
//   s = s.replace(/<p\b([^>]*)>((?:(?!<\/p>).)*?)<\/p>/gi, (_all, pAttr, inner) => {
//     const updatedInner = String(inner).replace(/\n/g, "<br/>");
//     return `<p${pAttr}>${updatedInner}</p>`;
//   });
//   s = s.replace(/<p>\s*<\/p>/g, "");
//   // Strip any leftover H2/H3 "Conclusion" blocks for consistency in editor view
//   s = s.replace(/<h[2-6][^>]*>\s*Conclusion\s*<\/h[2-6]>/gi, "");
//   return s;
// }

// /* ---------- Quill toolbar + image handler ---------- */
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
//       image: function (this: any) { imageHandler(this.quill); },
//     },
//   },
//   clipboard: { matchVisual: false },
// };

// const formats = ["header", "bold", "italic", "underline", "strike", "align", "list", "bullet", "link", "image"];

// export default function ContentEditorPage(): React.ReactElement {
//   const [loading, setLoading] = useState(true);
//   const [item, setItem] = useState<any | null>(null);
//   const [title, setTitle] = useState("");
//   const [editorHtml, setEditorHtml] = useState("");
//   const quillRef = useRef<ReactQuill | null>(null);

//   // Load item & apply anchor token before mounting Quill
//   useEffect(() => {
//     const found = getStoredOpenItem();
//     setItem(found);
//     if (found) {
//       const kw: string = found.keyword ?? "";
//       const url: string | undefined = found.targetUrl ?? found.keywordLink ?? undefined;
//       setTitle(found.title ?? kw ?? "");

//       const raw = found.generatedContent ?? "";
//       const withAnchor = applyAnchorTokenOnce(raw, kw, url);
//       const normalized = normalizeIncomingContent(withAnchor);
//       setEditorHtml(normalized || "<p></p>");
//     }
//     setLoading(false);
//   }, []);

//   // If item had no [ANCHOR:kw], try linkifying the first occurrence
//   useEffect(() => {
//     const t = setTimeout(() => {
//       const q = quillRef.current?.getEditor();
//       if (!q || !item) return;
//       const kw: string = item.keyword ?? "";
//       const url: string | undefined = item.targetUrl ?? item.keywordLink ?? undefined;

//       const html = q.root.innerHTML || "";
//       const alreadyLinked = new RegExp(
//         `<a\\s[^>]*>\\s*<strong>\\s*${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*<\\/strong>\\s*<\\/a>`,
//         "i"
//       ).test(html);

//       if (!alreadyLinked) linkifyFirstOccurrenceInQuill(q, kw, url);
//     }, 300);
//     return () => clearTimeout(t);
//   }, [editorHtml, item]);

//   const handleSave = () => {
//     if (!item) return;

//     const q = quillRef.current?.getEditor();
//     // Safely read the editor HTML; fall back to current state if needed
//     const html = q ? ((q as any).root?.innerHTML ?? editorHtml) : editorHtml;

//     const updated = {
//       ...item,
//       title: (title || "").trim() || item.title || item.keyword,
//       generatedContent: html,
//     };

//     try {
//       const raw = localStorage.getItem("content-items");
//       const arr = raw ? (JSON.parse(raw) as any[]) : [];
//       const idx = arr.findIndex((x) => x.id === item.id);
//       if (idx >= 0) arr[idx] = updated; else arr.push(updated);
//       localStorage.setItem("content-items", JSON.stringify(arr));
//       sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
//       localStorage.setItem(FALLBACK_KEY, JSON.stringify(updated));
//       setItem(updated);
//       alert("Saved locally. Content list updated.");
//       try { window.dispatchEvent(new Event("storage")); } catch {}
//     } catch (e) {
//       console.error("save error", e);
//       alert("Save failed");
//     }
//   };

//   if (loading) return <div>Loading editor…</div>;
//   if (!item) return <div>No content item found to edit.</div>;

//   const titleLen = (title || "").trim().length;
//   const titleOk = titleLen >= 60 && titleLen <= 70;

//   return (
//     <div style={{ height: "88vh", maxWidth: 1100, margin: "0 auto", padding: 12, display: "flex", flexDirection: "column" }}>
// <style>{`
//   .ql-container { border: none; }
//   .ql-toolbar { border: 1px solid #e6e6e6; border-bottom: none; border-radius: 6px 6px 0 0; }
//   .editor-shell {
//     height: calc(95vh - 210px);
//     border: 1px solid #e6e6e6;
//     border-radius: 6px;
//     overflow: hidden;
//     background: #fff;
//   }
//   .ql-container.ql-snow {
//     height: 100%;
//   }
//   .ql-editor {
//     height: 100%;
//     max-height: 100%;
//     overflow-y: auto; /* ✅ only editor scrolls */
//     padding: 18px;
//     font-size: 15px;
//     line-height: 1.7;
//     text-align: justify;
//   }
//   .ql-editor p { margin: 0 0 16px; text-align: justify; }
//   .ql-editor h1, .ql-editor h2, .ql-editor h3 { margin: 0 0 14px; font-weight:700; }
//   .ql-editor img { max-width: 100%; height: auto; display: block; margin: 8px 0; }
// `}</style>

//       <div style={{ marginBottom: 8 }}>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Title (H1, 60–70 characters)"
//           style={{
//             width: "100%",
//             padding: "12px 14px",
//             fontSize: 28,               // bigger H1 feel
//             borderRadius: 12,
//             border: "1px solid #ddd",
//             boxSizing: "border-box",
//             marginBottom: 4,
//             fontWeight: 800,
//             textAlign: "center",
//           }}
//         />
//         <div style={{ textAlign: "right", fontSize: 12, color: titleOk ? "#16a34a" : "#ef4444" }}>
//           {titleLen} / 60–70
//         </div>
//       </div>

//       {/* Make ONLY editor scroll */}
//       <div style={{ border: "1px solid #e6e6e6", borderRadius: 12, overflow: "hidden", background: "#fff", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
//         <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
//           <ReactQuill
//             ref={(el) => { quillRef.current = el; }}
//             value={editorHtml}
//             onChange={(html) => setEditorHtml(html)}
//             modules={modules as any}
//             formats={formats as any}
//             placeholder="Write or paste content here..."
//             theme="snow"
//           />
//         </div>
//       </div>

//       <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
//         <div style={{ color: "#666", fontSize: 13 }}>
//           <div><strong>Keyword:</strong> <span style={{ fontWeight: 600 }}>{item.keyword}</span></div>
//           {item.targetUrl && (
//             <div>
//               <strong>Keyword link:</strong>{" "}
//               <a href={item.targetUrl} target="_blank" rel="noreferrer">{item.targetUrl}</a>
//             </div>
//           )}
//         </div>

//         <div style={{ display: "flex", gap: 8 }}>
//           <button
//             onClick={handleSave}
//             style={{ padding: "10px 14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600 }}
//           >
//             Save
//           </button>
//           <button
//             onClick={() => {
//               const q = quillRef.current?.getEditor();
//               const html = `<h1>${escapeHtml(title)}</h1>\n` + (q ? q.root.innerHTML : editorHtml);
//               navigator.clipboard
//                 .writeText(html)
//                 .then(() => alert("HTML copied to clipboard"))
//                 .catch(() => alert("Copy failed"));
//             }}
//             style={{ padding: "10px 14px", borderRadius: 8 }}
//           >
//             Copy HTML
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

const SESSION_KEY = "open-content-item_v1";
const FALLBACK_KEY = `${SESSION_KEY}_fallback`;

/* Helpers (same as your version, with tiny edits) */
function getStoredOpenItem(): any | null {
  try {
    const raw =
      sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(FALLBACK_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("getStoredOpenItem parse error", e);
    return null;
  }
}
function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function applyAnchorTokenOnce(
  html: string,
  keyword: string,
  url?: string | null
) {
  if (!html || !keyword) return html || "";
  const token = `[ANCHOR:${keyword}]`;
  if (html.indexOf(token) === -1) return html;
  const safeUrl = url ? escapeHtml(url) : "";
  const safeKw = escapeHtml(keyword);
  const anchor = url
    ? `<a href="${safeUrl}" target="_blank" rel="nofollow noopener"><strong>${safeKw}</strong></a>`
    : `<strong>${safeKw}</strong>`;
  return html.replace(token, anchor);
}

/** demoteH1ToH2: subheadings ko h2 enforce */
function demoteH1ToH2(s: string) {
  return s.replace(/<h1(\s|>)/gi, "<h2$1").replace(/<\/h1>/gi, "</h2>");
}

function normalizeIncomingContent(raw: string) {
  if (!raw) return "";
  let s = String(raw);

  // Ensure CRLF handling + basic cleanup
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(s);
  if (!hasHtml) {
    s = s
      .split("\n")
      .map((line) => {
        const t = line.trim();
        if (t.startsWith("### "))
          return `<h3>${escapeHtml(t.slice(4).trim())}</h3>`;
        if (t.startsWith("## "))
          return `<h2>${escapeHtml(t.slice(3).trim())}</h2>`;
        if (t.startsWith("# "))
          return `<h2>${escapeHtml(t.slice(2).trim())}</h2>`; // ⬅️ markdown H1 also demoted to H2
        if (t === "") return "</p><p>";
        return `<p>${escapeHtml(line)}</p>`;
      })
      .join("\n")
      .replace(/(<\/p><p>)+/g, "</p><p>")
      .replace(/^<\/p><p>/, "<p>")
      .replace(/<\/p><p>$/, "</p>");
    if (!/^<p>|^<h[1-6]/i.test(s)) s = `<p>${escapeHtml(s)}</p>`;
    return demoteH1ToH2(s);
  }

  // HTML input path
  s = s.replace(/<p>\s*<\/p>/g, "");

  // ❌ OLD BUG (removed): This was deleting the Conclusion heading entirely.
  // s = s.replace(/<h[2-6][^>]*>\s*Conclusion\s*<\/h[2-6]>/gi, "");

  // ✅ Enforce subheadings as H2
  s = demoteH1ToH2(s);

  return s;
}

export default function ContentEditorPage(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const found = getStoredOpenItem();
    setItem(found);
    if (found) {
      const kw: string = found.keyword ?? "";
      const url: string | undefined =
        found.targetUrl ?? found.keywordLink ?? undefined;

      setTitle(found.title ?? kw ?? "");

      const raw = found.generatedContent ?? "";
      const withAnchor = applyAnchorTokenOnce(raw, kw, url);
      const normalized = normalizeIncomingContent(withAnchor);
      setEditorHtml(normalized || "<p></p>");
    }
    setLoading(false);
  }, []);

  const handleSave = () => {
    if (!item) return;
    const html = editorRef.current
      ? editorRef.current.getContent()
      : editorHtml;
    const updated = {
      ...item,
      title: (title || "").trim() || item.title || item.keyword,
      generatedContent: html,
    };
    try {
      const raw = localStorage.getItem("content-items");
      const arr = raw ? (JSON.parse(raw) as any[]) : [];
      const idx = arr.findIndex((x) => x.id === item.id);
      if (idx >= 0) arr[idx] = updated;
      else arr.push(updated);
      localStorage.setItem("content-items", JSON.stringify(arr));
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(updated));
      alert("Saved locally. Content list updated.");
      try {
        window.dispatchEvent(new Event("storage"));
      } catch {}
    } catch (e) {
      console.error("save error", e);
      alert("Save failed");
    }
  };

  if (loading) return <div>Loading editor…</div>;
  if (!item) return <div>No content item found to edit.</div>;

  const titleLen = (title || "").trim().length;
  const titleOk = titleLen >= 80 && titleLen <= 120;

  return (
    <div
      style={{
        height: "88vh",
        maxWidth: 1100,
        margin: "0 auto",
        padding: 12,
        display: "flex",
        flexDirection: "column",
      }}>
      <style>{`
        .editor-card {
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          flex: 1; min-height: 0; display: flex; flex-direction: column;
        }
        .editor-wrapper, .tox-tinymce, .tox-edit-area, .tox-edit-area__iframe { height: 100% !important; }
      `}</style>

      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (H1, 80–120 characters)"
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 28,
            borderRadius: 12,
            border: "1px solid #ddd",
            boxSizing: "border-box",
            marginBottom: 4,
            fontWeight: 800,
            textAlign: "center",
          }}
        />
        <div
          style={{
            textAlign: "right",
            fontSize: 12,
            color: titleOk ? "#16a34a" : "#ef4444",
          }}>
          {titleLen} / 80–120
        </div>
      </div>

      <div className="editor-card">
        <div className="editor-wrapper" style={{ flex: 1, minHeight: 0 }}>
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
            onInit={(_evt, editor) => (editorRef.current = editor)}
            value={editorHtml}
            onEditorChange={(content) => setEditorHtml(content)}
            init={{
              base_url: "/tinymce",
              suffix: ".min",
              height: "100%",
              menubar: false,
              plugins: [
                "lists",
                "link",
                "image",
                "table",
                "code",
                "paste",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | bold italic underline strikethrough | " +
                "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
                "link image | removeformat | code",

              /** 👇 H1 ko UI se hatao; H2/H3 ko allow karo */
              block_formats:
                "Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4",

              /** Paste pe jo bhi H1 aaye, H2 me convert */
              paste_data_images: true,
              paste_preprocess: (_plugin, args) => {
                args.content = demoteH1ToH2(args.content || "");
              },

              automatic_uploads: false,
              file_picker_types: "image",
              image_caption: true,
              image_dimensions: true,
              object_resizing: "img",

              file_picker_callback: (cb) => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    cb(String(reader.result), { title: file.name });
                  reader.readAsDataURL(file);
                };
                input.click();
              },
              images_upload_handler: async (blobInfo) => blobInfo.base64(),

              content_style: `
                body { font-family: -apple-system, Segoe UI, Roboto, Inter, sans-serif; font-size: 15px; line-height: 1.7; padding: 16px; }
                p { margin: 0 0 16px; text-align: justify; }
                h1,h2,h3 { margin: 0 0 14px; font-weight: 700; }
                img { display: block; margin: 8px 0; max-width: 100%; height: auto; }
                a { text-decoration: underline; }
              `,
              statusbar: true,
              branding: false,
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
        }}>
        <div style={{ color: "#666", fontSize: 13 }}>
          <div>
            <strong>Keyword:</strong>{" "}
            <span style={{ fontWeight: 600 }}>{item.keyword}</span>
          </div>
          {item.targetUrl && (
            <div>
              <strong>Keyword link:</strong>{" "}
              <a href={item.targetUrl} target="_blank" rel="noreferrer">
                {item.targetUrl}
              </a>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 14px",
              background: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
            }}>
            Save
          </button>
          <button
            onClick={() => {
              const html =
                `<h1>${escapeHtml(title)}</h1>\n` +
                (editorRef.current?.getContent() ?? editorHtml);
              navigator.clipboard
                .writeText(html)
                .then(() => alert("HTML copied to clipboard"))
                .catch(() => alert("Copy failed"));
            }}
            style={{ padding: "10px 14px", borderRadius: 8 }}>
            Copy HTML
          </button>
        </div>
      </div>
    </div>
  );
}
