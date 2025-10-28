// // src/pages/content/components/content-data-table.tsx
// import  { useMemo, useState } from "react";
// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
//   getSortedRowModel,
//   type SortingState,
//   getFilteredRowModel,
//   type ColumnFiltersState,
// } from "@tanstack/react-table";
// import * as XLSX from "xlsx";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { IconEye, IconDownload, IconSearch, IconFileSpreadsheet } from "@tabler/icons-react";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import { toast } from "sonner";

// // IMPORTANT: named import of openContentEditor (plain function)
// import { openContentEditor } from "@/hooks/use-content-generation";

// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string;
//   keywordLink?: string;
// }

// interface Props {
//   projectId?: string;
//   contentItems?: ContentItem[] | null;
// }

// export function ContentDataTable({ projectId, contentItems: propContentItems }: Props) {
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

//   // fallback to localStorage if parent didn't pass items
//   const [storedItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const allItems = propContentItems ?? storedItems ?? [];

//   const contentItems = useMemo(() => {
//     if (!projectId) return allItems;
//     return allItems.filter((i) => i.fileId === projectId);
//   }, [allItems, projectId]);

//   const columns: ColumnDef<ContentItem>[] = [
//     {
//       accessorKey: "keyword",
//       header: "Keyword",
//       cell: ({ row }) => <div className="font-medium max-w-[200px] truncate">{row.getValue("keyword")}</div>,
//     },
//     {
//       accessorKey: "generatedContent",
//       header: "Generated Content",
//       cell: ({ row }) => <div className="max-w-[300px] truncate text-muted-foreground">{row.getValue("generatedContent")}</div>,
//     },
//     {
//       accessorKey: "fileName",
//       header: "Source File",
//       cell: ({ row }) => <Badge variant="outline" className="text-xs inline-flex items-center gap-1"><IconFileSpreadsheet className="h-3 w-3" />{row.getValue("fileName")}</Badge>,
//     },
//     {
//       accessorKey: "createdAt",
//       header: "Created",
//       cell: ({ row }) => {
//         const val = row.getValue("createdAt") as string;
//         const date = val ? new Date(val) : null;
//         return <div className="text-sm text-muted-foreground">{date && !isNaN(date.getTime()) ? date.toLocaleString() : "-"}</div>;
//       },
//     },
//     {
//       id: "actions",
//       header: "Actions",
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               try {
//                 openContentEditor(row.original);
//               } catch (e) {
//                 console.error("openContentEditor failed", e);
//                 toast.error("Failed to open editor");
//               }
//             }}
//             className="flex items-center gap-2"
//           >
//             <IconEye className="h-4 w-4" /> View
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   const table = useReactTable({
//     data: contentItems ?? [],
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     getFilteredRowModel: getFilteredRowModel(),
//     state: { sorting, columnFilters },
//   });

//   const handleDownloadAll = () => {
//     if (!contentItems || contentItems.length === 0) {
//       toast.error("No content available to download");
//       return;
//     }
//     try {
//       const worksheetData = contentItems.map((item) => ({
//         Keyword: item.keyword,
//         "Generated Content": item.generatedContent,
//         "Source File": item.fileName,
//         "Created Date": new Date(item.createdAt).toLocaleString(),
//       }));
//       const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Content");
//       const fileName = `all-generated-content-${new Date().toISOString().split("T")[0]}.xlsx`;
//       XLSX.writeFile(workbook, fileName);
//       toast.success(`Downloaded ${contentItems.length} content items`);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to download file");
//     }
//   };

//   if (!contentItems || contentItems.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Generated Content</CardTitle>
//           <CardDescription>
//             {projectId ? "No content for this project yet. It will appear here as it's generated." : "Content generated from your uploaded Excel files will appear here"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8">
//             <IconFileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//             <p className="text-muted-foreground">{projectId ? "Select another project or wait for this project's processing to complete." : "No content has been generated yet. Upload an Excel file to get started."}</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between w-full">
//           <div>
//             <CardTitle>Generated Content</CardTitle>
//             <CardDescription>{contentItems.length} content items generated from Excel files</CardDescription>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button onClick={handleDownloadAll} className="flex items-center gap-2"><IconDownload className="h-4 w-4" /> Download All</Button>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex items-center gap-4">
//             <div className="relative flex-1 max-w-sm">
//               <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input placeholder="Search keywords..." value={String((table.getColumn("keyword")?.getFilterValue() as string) ?? "")}
//                 onChange={(e) => table.getColumn("keyword")?.setFilterValue(e.target.value)} className="pl-8" />
//             </div>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 {table.getHeaderGroups().map(hg => (
//                   <TableRow key={hg.id}>
//                     {hg.headers.map(h => <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
//                   </TableRow>
//                 ))}
//               </TableHeader>

//               <TableBody>
//                 {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
//                   <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
//                     {row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
//                   </TableRow>
//                 )) : (
//                   <TableRow>
//                     <TableCell colSpan={columns.length} className="h-24 text-center">No content found.</TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }














// // src/pages/content/components/content-data-table.tsx
// import  { useMemo, useState } from "react";
// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
//   getSortedRowModel,
//   type SortingState,
//   getFilteredRowModel,
//   type ColumnFiltersState,
// } from "@tanstack/react-table";
// import * as XLSX from "xlsx";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { IconEye, IconDownload, IconSearch, IconFileSpreadsheet } from "@tabler/icons-react";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import { toast } from "sonner";
// import { openContentEditor } from "@/hooks/use-content-generation";

// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string;
//   title?: string;
//   keywordLink?: string;
// }

// interface Props {
//   projectId?: string;
//   contentItems?: ContentItem[] | null;
// }

// export function ContentDataTable({ projectId, contentItems: propContentItems }: Props) {
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

//   const [storedItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const allItems = propContentItems ?? storedItems ?? [];

//   const contentItems = useMemo(() => {
//     if (!projectId) return allItems;
//     return allItems.filter((i) => i.fileId === projectId);
//   }, [allItems, projectId]);

//   const columns: ColumnDef<ContentItem>[] = [
//     {
//       accessorKey: "keyword",
//       header: "Keyword",
//       cell: ({ row }) => <div className="font-medium max-w-[200px] truncate">{row.getValue("keyword")}</div>,
//     },
//     {
//       accessorKey: "generatedContent",
//       header: "Generated Content",
//       cell: ({ row }) => <div className="max-w-[300px] truncate text-muted-foreground">{row.getValue("generatedContent")}</div>,
//     },
//     {
//       accessorKey: "fileName",
//       header: "Source File",
//       cell: ({ row }) => <Badge variant="outline" className="text-xs inline-flex items-center gap-1"><IconFileSpreadsheet className="h-3 w-3" />{row.getValue("fileName")}</Badge>,
//     },
//     {
//       accessorKey: "createdAt",
//       header: "Created",
//       cell: ({ row }) => {
//         const val = row.getValue("createdAt") as string;
//         const date = val ? new Date(val) : null;
//         return <div className="text-sm text-muted-foreground">{date && !isNaN(date.getTime()) ? date.toLocaleString() : "-"}</div>;
//       },
//     },
//     {
//       id: "actions",
//       header: "Actions",
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               try {
//                 openContentEditor(row.original);
//               } catch (e) {
//                 console.error("openContentEditor failed", e);
//                 toast.error("Failed to open editor");
//               }
//             }}
//             className="flex items-center gap-2"
//           >
//             <IconEye className="h-4 w-4" /> View
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   const table = useReactTable({
//     data: contentItems ?? [],
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     getFilteredRowModel: getFilteredRowModel(),
//     state: { sorting, columnFilters },
//   });

//   const handleDownloadAll = () => {
//     if (!contentItems || contentItems.length === 0) {
//       toast.error("No content available to download");
//       return;
//     }
//     try {
//       const worksheetData = contentItems.map((item) => ({
//         Keyword: item.keyword,
//         Title: item.title ?? "",
//         "Generated Content": item.generatedContent,
//         "Source File": item.fileName,
//         "Created Date": new Date(item.createdAt).toLocaleString(),
//       }));
//       const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Content");
//       const fileName = `all-generated-content-${new Date().toISOString().split("T")[0]}.xlsx`;
//       XLSX.writeFile(workbook, fileName);
//       toast.success(`Downloaded ${contentItems.length} content items`);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to download file");
//     }
//   };

//   if (!contentItems || contentItems.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Generated Content</CardTitle>
//           <CardDescription>
//             {projectId ? "No content for this project yet. It will appear here as it's generated." : "Content generated from your uploaded Excel files will appear here"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8">
//             <IconFileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//             <p className="text-muted-foreground">{projectId ? "Select another project or wait for this project's processing to complete." : "No content has been generated yet. Upload an Excel file to get started."}</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between w-full">
//           <div>
//             <CardTitle>Generated Content</CardTitle>
//             <CardDescription>{contentItems.length} content items generated from Excel files</CardDescription>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button onClick={handleDownloadAll} className="flex items-center gap-2"><IconDownload className="h-4 w-4" /> Download All</Button>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex items-center gap-4">
//             <div className="relative flex-1 max-w-sm">
//               <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input placeholder="Search keywords..." value={String((table.getColumn("keyword")?.getFilterValue() as string) ?? "")}
//                 onChange={(e) => table.getColumn("keyword")?.setFilterValue(e.target.value)} className="pl-8" />
//             </div>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 {table.getHeaderGroups().map(hg => (
//                   <TableRow key={hg.id}>
//                     {hg.headers.map(h => <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
//                   </TableRow>
//                 ))}
//               </TableHeader>

//               <TableBody>
//                 {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
//                   <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
//                     {row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
//                   </TableRow>
//                 )) : (
//                   <TableRow>
//                     <TableCell colSpan={columns.length} className="h-24 text-center">No content found.</TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }






// // src/pages/content/components/content-data-table.tsx
// import  { useMemo, useState } from "react";
// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
//   getSortedRowModel,
//   type SortingState,
//   getFilteredRowModel,
//   type ColumnFiltersState,
// } from "@tanstack/react-table";
// import * as XLSX from "xlsx";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { IconEye, IconDownload, IconSearch, IconFileSpreadsheet } from "@tabler/icons-react";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import { toast } from "sonner";
// import { openContentEditor } from "@/hooks/use-content-generation";

// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string;
//   title?: string;
//   keywordLink?: string;
// }

// interface Props {
//   projectId?: string;
//   contentItems?: ContentItem[] | null;
// }

// export function ContentDataTable({ projectId, contentItems: propContentItems }: Props) {
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

//   const [storedItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const allItems = propContentItems ?? storedItems ?? [];

//   const contentItems = useMemo(() => {
//     if (!projectId) return allItems;
//     return allItems.filter((i) => i.fileId === projectId);
//   }, [allItems, projectId]);

//   const columns: ColumnDef<ContentItem>[] = [
//     {
//       accessorKey: "keyword",
//       header: "Keyword",
//       cell: ({ row }) => <div className="font-medium max-w-[200px] truncate">{row.getValue("keyword")}</div>,
//     },
//     {
//       accessorKey: "generatedContent",
//       header: "Generated Content",
//       cell: ({ row }) => <div className="max-w-[300px] truncate text-muted-foreground">{row.getValue("generatedContent")}</div>,
//     },
//     {
//       accessorKey: "fileName",
//       header: "Source File",
//       cell: ({ row }) => <Badge variant="outline" className="text-xs inline-flex items-center gap-1"><IconFileSpreadsheet className="h-3 w-3" />{row.getValue("fileName")}</Badge>,
//     },
//     {
//       accessorKey: "createdAt",
//       header: "Created",
//       cell: ({ row }) => {
//         const val = row.getValue("createdAt") as string;
//         const date = val ? new Date(val) : null;
//         return <div className="text-sm text-muted-foreground">{date && !isNaN(date.getTime()) ? date.toLocaleString() : "-"}</div>;
//       },
//     },
//     {
//       id: "actions",
//       header: "Actions",
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               try {
//                 openContentEditor(row.original);
//               } catch (e) {
//                 console.error("openContentEditor failed", e);
//                 toast.error("Failed to open editor");
//               }
//             }}
//             className="flex items-center gap-2"
//           >
//             <IconEye className="h-4 w-4" /> View
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   const table = useReactTable({
//     data: contentItems ?? [],
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     getFilteredRowModel: getFilteredRowModel(),
//     state: { sorting, columnFilters },
//   });

//   const handleDownloadAll = () => {
//     if (!contentItems || contentItems.length === 0) {
//       toast.error("No content available to download");
//       return;
//     }
//     try {
//       const worksheetData = contentItems.map((item) => ({
//         Keyword: item.keyword,
//         Title: item.title ?? "",
//         "Generated Content": item.generatedContent,
//         "Source File": item.fileName,
//         "Created Date": new Date(item.createdAt).toLocaleString(),
//       }));
//       const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Content");
//       const fileName = `all-generated-content-${new Date().toISOString().split("T")[0]}.xlsx`;
//       XLSX.writeFile(workbook, fileName);
//       toast.success(`Downloaded ${contentItems.length} content items`);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to download file");
//     }
//   };

//   if (!contentItems || contentItems.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Generated Content</CardTitle>
//           <CardDescription>
//             {projectId ? "No content for this project yet. It will appear here as it's generated." : "Content generated from your uploaded Excel files will appear here"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8">
//             <IconFileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//             <p className="text-muted-foreground">{projectId ? "Select another project or wait for this project's processing to complete." : "No content has been generated yet. Upload an Excel file to get started."}</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between w-full">
//           <div>
//             <CardTitle>Generated Content</CardTitle>
//             <CardDescription>{contentItems.length} content items generated from Excel files</CardDescription>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button onClick={handleDownloadAll} className="flex items-center gap-2"><IconDownload className="h-4 w-4" /> Download All</Button>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex items-center gap-4">
//             <div className="relative flex-1 max-w-sm">
//               <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input placeholder="Search keywords..." value={String((table.getColumn("keyword")?.getFilterValue() as string) ?? "")}
//                 onChange={(e) => table.getColumn("keyword")?.setFilterValue(e.target.value)} className="pl-8" />
//             </div>
//           </div>

//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 {table.getHeaderGroups().map(hg => (
//                   <TableRow key={hg.id}>
//                     {hg.headers.map(h => <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
//                   </TableRow>
//                 ))}
//               </TableHeader>

//               <TableBody>
//                 {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
//                   <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
//                     {row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
//                   </TableRow>
//                 )) : (
//                   <TableRow>
//                     <TableCell colSpan={columns.length} className="h-24 text-center">No content found.</TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  getFilteredRowModel,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconEye, IconDownload, IconSearch, IconFileSpreadsheet, IconCheck, IconX } from "@tabler/icons-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { openContentEditor } from "../hooks/use-content-generation"

interface ContentItem {
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

interface Props {
  projectId?: string;
  contentItems?: ContentItem[] | null;
}

function stripTags(html: string) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}
function makeSnippet(html: string, n = 180) {
  const t = stripTags(html);
  if (!t) return "-";
  return t.length > n ? t.slice(0, n).trim() + "…" : t;
}

export function ContentDataTable({ projectId, contentItems: propContentItems }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [storedItems] = useLocalStorage<ContentItem[]>("content-items", []);
  const allItems = propContentItems ?? storedItems ?? [];

  const contentItems = useMemo(() => {
    if (!projectId) return allItems;
    return allItems.filter((i) => i.fileId === projectId);
  }, [allItems, projectId]);

  const columns: ColumnDef<ContentItem>[] = [
    {
      accessorKey: "keyword",
      header: "Keyword(s)",
      cell: ({ row }) => {
        const list = row.original.keywordsUsed?.length ? row.original.keywordsUsed : [row.original.keyword];
        return <div className="font-medium max-w-[240px] truncate">{list.join(", ")}</div>;
      },
    },
    {
      accessorKey: "generatedContent",
      header: "Preview",
      // Uniform snippet only (no HTML render) → faster & "only show content when clicked"
      cell: ({ row }) => <div className="max-w-[320px] text-muted-foreground">{makeSnippet(row.original.generatedContent, 50)}</div>,
    },
    {
      accessorKey: "fileName",
      header: "Source",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs inline-flex items-center gap-1">
          <IconFileSpreadsheet className="h-3 w-3" />{row.getValue("fileName")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const val = row.getValue("createdAt") as string;
        const date = val ? new Date(val) : null;
        return <div className="text-sm text-muted-foreground">{date && !isNaN(date.getTime()) ? date.toLocaleString() : "-"}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try { openContentEditor(row.original); }
              catch (e) { console.error("openContentEditor failed", e); toast.error("Failed to open editor"); }
            }}
            className="flex items-center gap-2"
          >
            <IconEye className="h-4 w-4" /> View
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: contentItems ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  const handleDownloadAll = () => {
    if (!contentItems || contentItems.length === 0) { toast.error("No content available to download"); return; }
    try {
      const worksheetData = contentItems.map((item) => ({
        "Keyword(s)": (item.keywordsUsed?.length ? item.keywordsUsed : [item.keyword]).join(", "),
        Title: item.title ?? "",
        "Generated Content": item.generatedContent,
        "Source File": item.fileName,
        "Created Date": new Date(item.createdAt).toLocaleString(),
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Content");
      const fileName = `all-generated-content-${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success(`Downloaded ${contentItems.length} content items`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download file");
    }
  };

  if (!contentItems || contentItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generated Content</CardTitle>
          <CardDescription>
            {projectId ? "No content for this file yet." : "Content generated from your uploaded Excel files will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <IconFileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {projectId ? "Select another file or wait for processing to complete." : "Upload an Excel file to get started."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>{contentItems.length} article(s)</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownloadAll} className="flex items-center gap-2"><IconDownload className="h-4 w-4" /> Download All</Button>
          </div>
        </div>
      </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search keywords..."
                  value={String((table.getColumn("keyword")?.getFilterValue() as string) ?? "")}
                  onChange={(e) => table.getColumn("keyword")?.setFilterValue(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(hg => (
                    <TableRow key={hg.id}>
                      {hg.headers.map(h => <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="transition-colors hover:bg-muted/40">
                      {row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No content found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
    </Card>
  );
}
