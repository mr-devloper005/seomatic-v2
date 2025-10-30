// import React, { useMemo, useRef, useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Separator } from "@/components/ui/separator";
// import { IconUpload, IconDownload, IconFileSpreadsheet, IconCheck, IconClock, IconX, IconTrash } from "@tabler/icons-react";
// import { toast } from "sonner";
// import { ContentDataTable } from "./components/content-data-table";
// import { useContentGeneration } from "./hooks/use-content-generation";
// import * as XLSX from 'xlsx';
// import { useLocalStorage } from "@/hooks/use-local-storage";

// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string;
// }

// export default function ContentPage() {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { 
//     generateContent, 
//     isProcessing, 
//     excelProjects, 
//     deleteProject, 
//     deleteAllProjects 
//   } = useContentGeneration();
//   const [contentItems] = useLocalStorage<ContentItem[]>('content-items', []);
//   const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

//   // Read ?project=ID from URL to auto-select
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const pid = params.get('project') || undefined;
//     setSelectedProjectId(pid || undefined);
//   }, []);

//   const selectedProject = useMemo(() => {
//     return excelProjects.find(p => p.id === selectedProjectId);
//   }, [excelProjects, selectedProjectId]);

//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     // Process all files in parallel
//     const filePromises: Promise<void>[] = [];
    
//     for (const file of Array.from(files)) {
//       if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
//         toast.error(`File ${file.name} is not a valid Excel file`);
//         continue;
//       }

//       const fileId = `${file.name}-${Date.now()}-${Math.random()}`;

//       // Create a promise for each file processing
//       const filePromise = processFile(file, fileId);
//       filePromises.push(filePromise);
//     }

//     // Process all files in parallel
//     try {
//       await Promise.allSettled(filePromises);
//       toast.success(`Completed processing ${files.length} files`);
//     } catch (error) {
//       console.error('Error in batch processing:', error);
//     }

//     // Reset file input
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const processFile = async (file: File, fileId: string) => {
//     try {
//       // Start processing the file - the hook will handle project creation and status updates 
//       await generateContent(file, fileId);
//       toast.success(`Successfully processed ${file.name}`);
//     } catch (error) {
//       console.error('Error processing file:', error);
//       toast.error(`Failed to process ${file.name}`);
//     }
//   };

//   const handleDownloadFile = (fileId: string, fileName: string) => {
//     // Filter content items for this specific file
//     const fileContentItems = contentItems.filter(item => item.fileId === fileId);
    
//     if (fileContentItems.length === 0) {
//       toast.error('No content found for this file');
//       return;
//     }

//     // Create Excel file with content from this specific file
//     const worksheetData = fileContentItems.map(item => ({
//       'Keyword': item.keyword,
//       'Generated Content': item.generatedContent,
//       'Created Date': new Date(item.createdAt).toLocaleString()
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Generated Content');

//     // Download the file with a descriptive name
//     const sanitizedFileName = fileName.replace(/\.(xlsx|xls)$/i, '');
//     const downloadFileName = `${sanitizedFileName}-generated-content-${new Date().toISOString().split('T')[0]}.xlsx`;
    
//     XLSX.writeFile(workbook, downloadFileName);
//     toast.success(`Downloaded content for ${fileName}`);
//   };

//   const handleDeleteProject = (projectId: string) => {
//     if (confirm('Are you sure you want to delete this project and all its content?')) {
//       deleteProject(projectId);
//     }
//   };

//   const handleDeleteAllProjects = () => {
//     if (confirm('Are you sure you want to delete all projects and content? This action cannot be undone.')) {
//       deleteAllProjects();
//     }
//   };

//   const getStatusIcon = (status: 'pending' | 'processing' | 'completed' | 'error') => {
//     switch (status) {
//       case 'pending':
//         return <IconClock className="h-4 w-4 text-yellow-500" />;
//       case 'processing':
//         return <IconClock className="h-4 w-4 text-blue-500 animate-spin" />;
//       case 'completed':
//         return <IconCheck className="h-4 w-4 text-green-500" />;
//       case 'error':
//         return <IconX className="h-4 w-4 text-red-500" />;
//     }
//   };

//   const getStatusBadge = (status: 'pending' | 'processing' | 'completed' | 'error') => {
//     switch (status) {
//       case 'pending':
//         return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
//       case 'processing':
//         return <Badge variant="outline" className="text-blue-600 border-blue-600">Processing</Badge>;
//       case 'completed':
//         return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
//       case 'error':
//         return <Badge variant="outline" className="text-red-600 border-red-600">Error</Badge>;
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Content Generation</h1>
//         <p className="text-muted-foreground">
//           Upload Excel files to automatically generate content from keywords using AI
//         </p>
//       </div>

//       {/* Upload Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <IconUpload className="h-5 w-5" />
//             Upload Excel Files
//           </CardTitle>
//           <CardDescription>
//             Upload one or more Excel files containing keywords. The system will generate content for each keyword.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex items-center gap-4">
//               <Input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".xlsx,.xls"
//                 multiple
//                 onChange={handleFileUpload}
//                 className="hidden"
//                 id="file-upload"
//               />
//               <Button
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={isProcessing}
//                 className="flex items-center gap-2"
//               >
//                 <IconFileSpreadsheet className="h-4 w-4" />
//                 Choose Excel Files
//               </Button>
//               {isProcessing && (
//                 <Badge variant="outline" className="text-blue-600 border-blue-600">
//                   Processing {excelProjects.filter(f => f.status === 'processing').length} files...
//                 </Badge>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Processing Summary */}
//       {excelProjects.length > 0 && (
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Processing Queue</CardTitle>
//                 <CardDescription>
//                   {excelProjects.filter(f => f.status === 'completed').length} completed, {' '}
//                   {excelProjects.filter(f => f.status === 'processing').length} processing, {' '}
//                   {excelProjects.filter(f => f.status === 'pending').length} pending, {' '}
//                   {excelProjects.filter(f => f.status === 'error').length} errors
//                 </CardDescription>
//               </div>
//               <div className="flex gap-2">
//                 <Button 
//                   variant="outline" 
//                   size="sm"
//                   onClick={handleDeleteAllProjects}
//                   disabled={excelProjects.some(f => f.status === 'processing')}
//                   className="text-red-600 border-red-600 hover:bg-red-50"
//                 >
//                   <IconTrash className="h-4 w-4 mr-2" />
//                   Delete All
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-4 gap-4 text-center">
//               <div className="p-3 bg-green-50 rounded-lg">
//                 <div className="text-2xl font-bold text-green-600">
//                   {excelProjects.filter(f => f.status === 'completed').length}
//                 </div>
//                 <div className="text-sm text-green-700">Completed</div>
//               </div>
//               <div className="p-3 bg-blue-50 rounded-lg">
//                 <div className="text-2xl font-bold text-blue-600">
//                   {excelProjects.filter(f => f.status === 'processing').length}
//                 </div>
//                 <div className="text-sm text-blue-700">Processing</div>
//               </div>
//               <div className="p-3 bg-yellow-50 rounded-lg">
//                 <div className="text-2xl font-bold text-yellow-600">
//                   {excelProjects.filter(f => f.status === 'pending').length}
//                 </div>
//                 <div className="text-sm text-yellow-700">Pending</div>
//               </div>
//               <div className="p-3 bg-red-50 rounded-lg">
//                 <div className="text-2xl font-bold text-red-600">
//                   {excelProjects.filter(f => f.status === 'error').length}
//                 </div>
//                 <div className="text-sm text-red-700">Errors</div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Excel Projects List */}
//       {excelProjects.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Excel Projects</CardTitle>
//             <CardDescription>
//               Individual project processing status and management
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {excelProjects.map((project) => (
//                 <div key={project.id} className="space-y-2 p-4 border rounded-lg">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {getStatusIcon(project.status)}
//                       <span className="font-medium">{project.fileName}</span>
//                       {getStatusBadge(project.status)}
//                       {selectedProjectId === project.id && (
//                         <Badge variant="outline">Selected</Badge>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm text-muted-foreground">
//                         {new Date(project.createdAt).toLocaleTimeString()}
//                       </span>
//                       <Button 
//                         size="sm"
//                         variant="outline"
//                         onClick={() => setSelectedProjectId(project.id)}
//                       >
//                         View
//                       </Button>
//                       <Button 
//                         size="sm" 
//                         variant="outline"
//                         onClick={() => handleDeleteProject(project.id)}
//                         className="text-red-600 border-red-600 hover:bg-red-50"
//                         disabled={project.status === 'processing'}
//                       >
//                         <IconTrash className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between text-sm text-muted-foreground">
//                     <span>
//                       Keywords: {project.processedKeywords} / {project.totalKeywords}
//                     </span>
//                     {project.status === 'processing' && (
//                       <span>
//                         {Math.round((project.processedKeywords / project.totalKeywords) * 100)}% complete
//                       </span>
//                     )}
//                   </div>
                  
//                   {project.status === 'processing' && (
//                     <div className="space-y-1">
//                       <Progress 
//                         value={(project.processedKeywords / project.totalKeywords) * 100} 
//                         className="h-2" 
//                       />
//                     </div>
//                   )}
                  
//                   {project.status === 'error' && project.error && (
//                     <p className="text-sm text-red-600">{project.error}</p>
//                   )}
                  
//                   {project.status === 'completed' && (
//                     <div className="flex items-center gap-2">
//                       <Button 
//                         size="sm" 
//                         variant="outline"
//                         onClick={() => handleDownloadFile(project.id, project.fileName)}
//                       >
//                         <IconDownload className="h-4 w-4 mr-2" />
//                         Download Results
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Separator />

//       {/* Generated Content Table (filtered by selected project if any) */}
//       <ContentDataTable projectId={selectedProjectId} />
//     </div>
//   );
// }



// // src/pages/ContentPage/index.tsx
// import React, {  useRef, useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Separator } from "@/components/ui/separator";
// import { IconUpload, IconDownload, IconFileSpreadsheet, IconCheck, IconClock, IconX, IconTrash } from "@tabler/icons-react";
// import { toast } from "sonner";
// import { ContentDataTable } from "./components/content-data-table";
// import { useContentGeneration } from "./hooks/use-content-generation";
// import * as XLSX from 'xlsx';



// export default function ContentPage() {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   // NOTE: read contentItems from the hook (single source of truth)
//   const { 
//     generateContent, 
//     isProcessing, 
//     excelProjects, 
//     deleteProject, 
//     deleteAllProjects,
//     contentItems, // <-- important
//   } = useContentGeneration();

//   const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const pid = params.get('project') || undefined;
//     setSelectedProjectId(pid || undefined);
//   }, []);


//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     const filePromises: Promise<void>[] = [];
//     for (const file of Array.from(files)) {
//       if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
//         toast.error(`File ${file.name} is not a valid Excel file`);
//         continue;
//       }
//       const fileId = `${file.name}-${Date.now()}-${Math.random()}`;
//       const filePromise = processFile(file, fileId);
//       filePromises.push(filePromise);
//     }

//     try {
//       await Promise.allSettled(filePromises);
//       toast.success(`Completed processing ${files.length} files`);
//     } catch (error) {
//       console.error('Error in batch processing:', error);
//     }

//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   const processFile = async (file: File, fileId: string) => {
//     try {
//       await generateContent(file, fileId, () => {
//         // optional per-file progress callback
//       });
//       toast.success(`Successfully processed ${file.name}`);
//     } catch (error) {
//       console.error('Error processing file:', error);
//       toast.error(`Failed to process ${file.name}`);
//     }
//   };

//   const handleDownloadFile = (fileId: string, fileName: string) => {
//     const fileContentItems = (contentItems ?? []).filter(item => item.fileId === fileId);
//     if (fileContentItems.length === 0) {
//       toast.error('No content found for this file');
//       return;
//     }

//     const worksheetData = fileContentItems.map(item => ({
//       'Keyword': item.keyword,
//       'Generated Content': item.generatedContent,
//       'Created Date': new Date(item.createdAt).toLocaleString()
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Generated Content');

//     const sanitizedFileName = fileName.replace(/\.(xlsx|xls)$/i, '');
//     const downloadFileName = `${sanitizedFileName}-generated-content-${new Date().toISOString().split('T')[0]}.xlsx`;
    
//     XLSX.writeFile(workbook, downloadFileName);
//     toast.success(`Downloaded content for ${fileName}`);
//   };

//   const handleDeleteProject = (projectId: string) => {
//     if (confirm('Are you sure you want to delete this project and all its content?')) {
//       deleteProject(projectId);
//       if (selectedProjectId === projectId) setSelectedProjectId(undefined);
//     }
//   };

//   const handleDeleteAllProjects = () => {
//     if (confirm('Are you sure you want to delete all projects and content? This action cannot be undone.')) {
//       deleteAllProjects();
//       setSelectedProjectId(undefined);
//     }
//   };

//   const getStatusIcon = (status: 'pending' | 'processing' | 'completed' | 'error') => {
//     switch (status) {
//       case 'pending': return <IconClock className="h-4 w-4 text-yellow-500" />;
//       case 'processing': return <IconClock className="h-4 w-4 text-blue-500 animate-spin" />;
//       case 'completed': return <IconCheck className="h-4 w-4 text-green-500" />;
//       case 'error': return <IconX className="h-4 w-4 text-red-500" />;
//     }
//   };

//   const getStatusBadge = (status: 'pending' | 'processing' | 'completed' | 'error') => {
//     switch (status) {
//       case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
//       case 'processing': return <Badge variant="outline" className="text-blue-600 border-blue-600">Processing</Badge>;
//       case 'completed': return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
//       case 'error': return <Badge variant="outline" className="text-red-600 border-red-600">Error</Badge>;
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Content Generation</h1>
//         <p className="text-muted-foreground">Upload Excel files to automatically generate content from keywords using AI</p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <IconUpload className="h-5 w-5" />
//             Upload Excel Files
//           </CardTitle>
//           <CardDescription>Upload one or more Excel files containing keywords. The system will generate content for each keyword.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex items-center gap-4">
//               <Input ref={fileInputRef} type="file" accept=".xlsx,.xls" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
//               <Button onClick={() =>    fileInputRef.current?.click()} disabled={isProcessing} className="flex items-center gap-2">
//                 <IconFileSpreadsheet className="h-4 w-4" /> Choose Excel Files
//               </Button>

//               {isProcessing && (
//                 <Badge variant="outline" className="text-blue-600 border-blue-600">
//                   Processing {excelProjects?.filter(f => f.status === 'processing').length} files...
//                 </Badge>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {excelProjects && excelProjects.length > 0 && (
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Processing Queue</CardTitle>
//                 <CardDescription>
//                   {excelProjects.filter(f => f.status === 'completed').length} completed, {' '}
//                   {excelProjects.filter(f => f.status === 'processing').length} processing, {' '}
//                   {excelProjects.filter(f => f.status === 'pending').length} pending, {' '}
//                   {excelProjects.filter(f => f.status === 'error').length} errors
//                 </CardDescription>
//               </div>
//               <div className="flex gap-2">
//                 <Button variant="outline" size="sm" onClick={handleDeleteAllProjects}
//                   disabled={excelProjects.some((f) => f.status === 'processing')}
//                   className="text-red-600 border-red-600 hover:bg-red-50"
//                 >
//                   <IconTrash className="h-4 w-4 mr-2" /> Delete All
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-4 gap-4 text-center">
//               <div className="p-3 bg-green-50 rounded-lg">
//                 <div className="text-2xl font-bold text-green-600">{excelProjects.filter(f => f.status === 'completed').length}</div>
//                 <div className="text-sm text-green-700">Completed</div>
//               </div>
//               <div className="p-3 bg-blue-50 rounded-lg">
//                 <div className="text-2xl font-bold text-blue-600">{excelProjects.filter(f => f.status === 'processing').length}</div>
//                 <div className="text-sm text-blue-700">Processing</div>
//               </div>
//               <div className="p-3 bg-yellow-50 rounded-lg">
//                 <div className="text-2xl font-bold text-yellow-600">{excelProjects.filter(f => f.status === 'pending').length}</div>
//                 <div className="text-sm text-yellow-700">Pending</div>
//               </div>
//               <div className="p-3 bg-red-50 rounded-lg">
//                 <div className="text-2xl font-bold text-red-600">{excelProjects.filter(f => f.status === 'error').length}</div>
//                 <div className="text-sm text-red-700">Errors</div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {excelProjects && excelProjects.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Excel Projects</CardTitle>
//             <CardDescription>Individual project processing status and management</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {excelProjects.map((project) => (
//                 <div key={project.id} className="space-y-2 p-4 border rounded-lg">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {getStatusIcon(project.status)}
//                       <span className="font-medium">{project.fileName}</span>
//                       {getStatusBadge(project.status)}
//                       {selectedProjectId === project.id && <Badge variant="outline">Selected</Badge>}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm text-muted-foreground">{new Date(project.createdAt).toLocaleTimeString()}</span>
//                       <Button size="sm" variant="outline" onClick={() => setSelectedProjectId(project.id)}>View</Button>
//                       <Button size="sm" variant="outline" onClick={() => handleDeleteProject(project.id)}
//                         className="text-red-600 border-red-600 hover:bg-red-50" disabled={project.status === 'processing'}>
//                         <IconTrash className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between text-sm text-muted-foreground">
//                     <span>Keywords: {project.processedKeywords} / {project.totalKeywords}</span>
//                     {project.status === 'processing' && <span>{Math.round((project.processedKeywords / Math.max(1, project.totalKeywords)) * 100)}% complete</span>}
//                   </div>

//                   {project.status === 'processing' && (
//                     <div className="space-y-1">
//                       <Progress value={(project.processedKeywords / Math.max(1, project.totalKeywords)) * 100} className="h-2" />
//                     </div>
//                   )}

//                   {project.status === 'error' && project.error && <p className="text-sm text-red-600">{project.error}</p>}

//                   {project.status === 'completed' && (
//                     <div className="flex items-center gap-2">
//                       <Button size="sm" variant="outline" onClick={() => handleDownloadFile(project.id, project.fileName)}>
//                         <IconDownload className="h-4 w-4 mr-2" /> Download Results
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Separator />

//       {/* pass contentItems from hook so table always has latest data */}
//       <ContentDataTable projectId={selectedProjectId} contentItems={contentItems} />
//     </div>
//   );
// }





// // src/pages/ContentPage/index.tsx
// import React, { useRef, useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Separator } from "@/components/ui/separator";
// import {
//   IconUpload,
//   IconDownload,
//   IconFileSpreadsheet,
//   IconCheck,
//   IconClock,
//   IconX,
//   IconTrash,
// } from "@tabler/icons-react";
// import { toast } from "sonner";
// import { ContentDataTable } from "./components/content-data-table";
// import { useContentGeneration } from "./hooks/use-content-generation";
// import * as XLSX from "xlsx";

// export default function ContentPage() {
//   // Use a native input element (forwardRef warning avoided)
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   // NOTE: read contentItems from the hook (single source of truth)
//   const {
//     generateContent,
//     isProcessing,
//     excelProjects,
//     deleteProject,
//     deleteAllProjects,
//     contentItems, // <-- important
//   } = useContentGeneration();

//   const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const pid = params.get("project") || undefined;
//     setSelectedProjectId(pid || undefined);
//   }, []);

//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     const filePromises: Promise<void>[] = [];
//     for (const file of Array.from(files)) {
//       if (!file.name.match(/\.(xlsx|xls)$/i)) {
//         toast.error(`File ${file.name} is not a valid Excel file`);
//         continue;
//       }
//       // deterministic-ish id
//       const fileId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//       filePromises.push(processFile(file, fileId));
//     }

//     try {
//       await Promise.allSettled(filePromises);
//       toast.success(`Completed processing ${files.length} file(s)`);
//     } catch (error) {
//       console.error("Error in batch processing:", error);
//     }

//     // clear value so same file can be re-uploaded if needed
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const processFile = async (file: File, fileId: string) => {
//     try {
//       await generateContent(file, fileId, () => {
//         // optional per-file progress callback (you can show per-file progress if desired)
//       });
//       toast.success(`Successfully processed ${file.name}`);
//     } catch (error) {
//       console.error("Error processing file:", error);
//       toast.error(`Failed to process ${file.name}`);
//     }
//   };

//   const handleDownloadFile = (fileId: string, fileName: string) => {
//     const fileContentItems = (contentItems ?? []).filter((item) => item.fileId === fileId);
//     if (fileContentItems.length === 0) {
//       toast.error("No content found for this file");
//       return;
//     }

//     const worksheetData = fileContentItems.map((item) => ({
//       Keyword: item.keyword,
//       "Generated Content": item.generatedContent,
//       "Created Date": new Date(item.createdAt).toLocaleString(),
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Content");

//     const sanitizedFileName = fileName.replace(/\.(xlsx|xls)$/i, "");
//     const downloadFileName = `${sanitizedFileName}-generated-content-${new Date().toISOString().split("T")[0]}.xlsx`;

//     XLSX.writeFile(workbook, downloadFileName);
//     toast.success(`Downloaded content for ${fileName}`);
//   };

//   const handleDeleteProject = (projectId: string) => {
//     if (confirm("Are you sure you want to delete this project and all its content?")) {
//       deleteProject(projectId);
//       if (selectedProjectId === projectId) setSelectedProjectId(undefined);
//     }
//   };

//   const handleDeleteAllProjects = () => {
//     if (confirm("Are you sure you want to delete all projects and content? This action cannot be undone.")) {
//       deleteAllProjects();
//       setSelectedProjectId(undefined);
//     }
//   };

//   const getStatusIcon = (status: "pending" | "processing" | "completed" | "error") => {
//     switch (status) {
//       case "pending":
//         return <IconClock className="h-4 w-4 text-yellow-500" />;
//       case "processing":
//         return <IconClock className="h-4 w-4 text-blue-500 animate-spin" />;
//       case "completed":
//         return <IconCheck className="h-4 w-4 text-green-500" />;
//       case "error":
//         return <IconX className="h-4 w-4 text-red-500" />;
//     }
//   };

//   const getStatusBadge = (status: "pending" | "processing" | "completed" | "error") => {
//     switch (status) {
//       case "pending":
//         return (
//           <Badge variant="outline" className="text-yellow-600 border-yellow-600">
//             Pending
//           </Badge>
//         );
//       case "processing":
//         return (
//           <Badge variant="outline" className="text-blue-600 border-blue-600">
//             Processing
//           </Badge>
//         );
//       case "completed":
//         return (
//           <Badge variant="outline" className="text-green-600 border-green-600">
//             Completed
//           </Badge>
//         );
//       case "error":
//         return (
//           <Badge variant="outline" className="text-red-600 border-red-600">
//             Error
//           </Badge>
//         );
//     }
//   };

//   return (
//     <div className="space-y-6 p-10">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Content Generation</h1>
//         <p className="text-muted-foreground">
//           Upload Excel files to automatically generate content from keywords using AI
//         </p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <IconUpload className="h-5 w-5" />
//             Upload Excel Files
//           </CardTitle>
//           <CardDescription>
//             Upload one or more Excel files containing keywords. The system will generate content for each keyword.
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex items-center gap-4">
//               {/* Native hidden input to avoid forwardRef issues */}
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".xlsx,.xls"
//                 multiple
//                 onChange={handleFileUpload}
//                 style={{ display: "none" }}
//                 id="file-upload-native"
//               />

//               <Button
//                 onClick={() => {
//                   // debug log to help if file-picker doesn't open
//                   if (!fileInputRef.current) {
//                     console.warn("fileInputRef is null");
//                   }
//                   fileInputRef.current?.click();
//                 }}
//                 disabled={isProcessing}
//                 className="flex items-center gap-2"
//               >
//                 <IconFileSpreadsheet className="h-4 w-4" /> Choose Excel Files
//               </Button>

//               {isProcessing && (
//                 <Badge variant="outline" className="text-blue-600 border-blue-600">
//                   Processing {excelProjects?.filter((f) => f.status === "processing").length} files...
//                 </Badge>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {excelProjects && excelProjects.length > 0 && (
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Processing Queue</CardTitle>
//                 <CardDescription>
//                   {excelProjects.filter((f) => f.status === "completed").length} completed,{" "}
//                   {excelProjects.filter((f) => f.status === "processing").length} processing,{" "}
//                   {excelProjects.filter((f) => f.status === "pending").length} pending,{" "}
//                   {excelProjects.filter((f) => f.status === "error").length} errors
//                 </CardDescription>
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleDeleteAllProjects}
//                   disabled={excelProjects.some((f) => f.status === "processing")}
//                   className="text-red-600 border-red-600 hover:bg-red-50"
//                 >
//                   <IconTrash className="h-4 w-4 mr-2" /> Delete All
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent>
//             <div className="grid grid-cols-4 gap-4 text-center">
//               <div className="p-3 bg-green-50 rounded-lg">
//                 <div className="text-2xl font-bold text-green-600">
//                   {excelProjects.filter((f) => f.status === "completed").length}
//                 </div>
//                 <div className="text-sm text-green-700">Completed</div>
//               </div>
//               <div className="p-3 bg-blue-50 rounded-lg">
//                 <div className="text-2xl font-bold text-blue-600">
//                   {excelProjects.filter((f) => f.status === "processing").length}
//                 </div>
//                 <div className="text-sm text-blue-700">Processing</div>
//               </div>
//               <div className="p-3 bg-yellow-50 rounded-lg">
//                 <div className="text-2xl font-bold text-yellow-600">
//                   {excelProjects.filter((f) => f.status === "pending").length}
//                 </div>
//                 <div className="text-sm text-yellow-700">Pending</div>
//               </div>
//               <div className="p-3 bg-red-50 rounded-lg">
//                 <div className="text-2xl font-bold text-red-600">
//                   {excelProjects.filter((f) => f.status === "error").length}
//                 </div>
//                 <div className="text-sm text-red-700">Errors</div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {excelProjects && excelProjects.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Excel Projects</CardTitle>
//             <CardDescription>Individual project processing status and management</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {excelProjects.map((project) => (
//                 <div key={project.id} className="space-y-2 p-4 border rounded-lg">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {getStatusIcon(project.status)}
//                       <span className="font-medium">{project.fileName}</span>
//                       {getStatusBadge(project.status)}
//                       {selectedProjectId === project.id && <Badge variant="outline">Selected</Badge>}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm text-muted-foreground">
//                         {new Date(project.createdAt).toLocaleTimeString()}
//                       </span>
//                       <Button size="sm" variant="outline" onClick={() => setSelectedProjectId(project.id)}>
//                         View
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleDeleteProject(project.id)}
//                         className="text-red-600 border-red-600 hover:bg-red-50"
//                         disabled={project.status === "processing"}
//                       >
//                         <IconTrash className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between text-sm text-muted-foreground">
//                     <span>
//                       Keywords: {project.processedKeywords} / {project.totalKeywords}
//                     </span>
//                     {project.status === "processing" && (
//                       <span>{Math.round((project.processedKeywords / Math.max(1, project.totalKeywords)) * 100)}% complete</span>
//                     )}
//                   </div>

//                   {project.status === "processing" && (
//                     <div className="space-y-1">
//                       <Progress value={(project.processedKeywords / Math.max(1, project.totalKeywords)) * 100} className="h-2" />
//                     </div>
//                   )}

//                   {project.status === "error" && project.error && <p className="text-sm text-red-600">{project.error}</p>}

//                   {project.status === "completed" && (
//                     <div className="flex items-center gap-2">
//                       <Button size="sm" variant="outline" onClick={() => handleDownloadFile(project.id, project.fileName)}>
//                         <IconDownload className="h-4 w-4 mr-2" /> Download Results
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Separator />

//       {/* pass contentItems from hook so table always has latest data */}
//       <ContentDataTable projectId={selectedProjectId} contentItems={contentItems} />
//     </div>
//   );
// // }
// import React, { useRef, useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Separator } from "@/components/ui/separator";
// import {
//   IconUpload,
//   IconDownload,
//   IconFileSpreadsheet,
//   IconCheck,
//   IconClock,
//   IconX,
//   IconTrash,
//   IconChevronDown,
//   IconChevronRight,
// } from "@tabler/icons-react";
// import { toast } from "sonner";
// import { ContentDataTable } from "./components/content-data-table";
// import { useContentGeneration } from "./hooks/use-content-generation";
// import * as XLSX from "xlsx";
// import { PreferencesPanel } from "./components/PreferencesPanel";

// export default function ContentPage() {
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   const {
//     generateContent,
//     isProcessing,
//     excelProjects,
//     deleteProject,
//     deleteAllProjects,
//     contentItems,
//   } = useContentGeneration();

//   const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
//   const [expandedProjectId, setExpandedProjectId] = useState<string | undefined>(undefined);

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const pid = params.get("project") || undefined;
//     setSelectedProjectId(pid || undefined);
//   }, []);

//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     const filePromises: Promise<void>[] = [];
//     for (const file of Array.from(files)) {
//       if (!file.name.match(/\.(xlsx|xls)$/i)) {
//         toast.error(`File ${file.name} is not a valid Excel file`);
//         continue;
//       }
//       const fileId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//       filePromises.push(processFile(file, fileId));
//     }

//     await Promise.allSettled(filePromises);
//     toast.success(`Completed processing ${files.length} file(s)`);

//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const processFile = async (file: File, fileId: string) => {
//     try {
//       await generateContent(file, fileId, () => {});
//       toast.success(`Successfully processed ${file.name}`);
//     } catch (error) {
//       console.error("Error processing file:", error);
//       toast.error(`Failed to process ${file.name}`);
//     }
//   };

//   const handleDownloadFile = (fileId: string, fileName: string) => {
//     const fileContentItems = (contentItems ?? []).filter((item) => item.fileId === fileId);
//     if (fileContentItems.length === 0) { toast.error("No content found for this file"); return; }

//     const worksheetData = fileContentItems.map((item) => ({
//       Keyword: item.keyword,
//       Title: item.title ?? "",
//       "Generated Content": item.generatedContent,
//       "Created Date": new Date(item.createdAt).toLocaleString(),
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Content");

//     const sanitizedFileName = fileName.replace(/\.(xlsx|xls)$/i, "");
//     const downloadFileName = `${sanitizedFileName}-generated-content-${new Date().toISOString().split("T")[0]}.xlsx`;

//     XLSX.writeFile(workbook, downloadFileName);
//     toast.success(`Downloaded content for ${fileName}`);
//   };

//   const handleDeleteProject = (projectId: string) => {
//     if (confirm("Delete this project and its content?")) {
//       deleteProject(projectId);
//       if (selectedProjectId === projectId) setSelectedProjectId(undefined);
//     }
//   };

//   const handleDeleteAllProjects = () => {
//     if (confirm("Delete ALL projects and content? This cannot be undone.")) {
//       deleteAllProjects();
//       setSelectedProjectId(undefined);
//     }
//   };

//   const getStatusIcon = (status: "pending" | "processing" | "completed" | "error", failedCount?: number) => {
//     switch (status) {
//       case "pending": return <IconClock className="h-4 w-4 text-yellow-500" />;
//       case "processing": return <IconClock className="h-4 w-4 text-blue-500 animate-spin" />;
//       case "completed": return failedCount ? <IconCheck className="h-4 w-4 text-green-500" /> : <IconCheck className="h-4 w-4 text-green-600" />;
//       case "error": return <IconX className="h-4 w-4 text-red-500" />;
//     }
//   };

//   const getStatusBadge = (status: "pending" | "processing" | "completed" | "error", failedCount?: number) => {
//     switch (status) {
//       case "pending": return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
//       case "processing": return <Badge variant="outline" className="text-blue-600 border-blue-600">Processing</Badge>;
//       case "completed": return <Badge variant="outline" className={failedCount ? "text-emerald-700 border-emerald-700" : "text-green-600 border-green-600"}>Completed</Badge>;
//       case "error": return <Badge variant="outline" className="text-red-600 border-red-600">Error</Badge>;
//     }
//   };

//   return (
//     <div className="space-y-8 p-6 sm:p-10">
//       {/* Header with pastel gradient */}
//       <div className="relative overflow-hidden rounded-2xl">
//         <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/40 via-pink-200/40 to-indigo-200/40" />
//         <div className="relative p-6">
//           <h1 className="text-3xl font-extrabold tracking-tight">Content Generation</h1>
//           <p className="text-muted-foreground">Upload Excel files to automatically generate human-quality content from keywords using AI.</p>
//         </div>
//       </div>

//       {/* Preferences */}
//       <PreferencesPanel />

//       {/* Upload */}
//       <Card className="rounded-2xl">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2"><IconUpload className="h-5 w-5" /> Upload Excel Files</CardTitle>
//           <CardDescription>Upload one or more Excel files containing keywords. We’ll group & link according to your saved preferences and each row’s target page.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4">
//             <input ref={fileInputRef} type="file" accept=".xlsx,.xls" multiple onChange={handleFileUpload} style={{ display: "none" }} id="file-upload-native" />
//             <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="flex items-center gap-2 rounded-xl">
//               <IconFileSpreadsheet className="h-4 w-4" /> Choose Excel Files
//             </Button>
//             {isProcessing && (
//               <Badge variant="outline" className="text-blue-600 border-blue-600">Processing {excelProjects?.filter((f) => f.status === "processing").length} files…</Badge>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {excelProjects && excelProjects.length > 0 && (
//         <Card className="rounded-2xl">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Processing Queue</CardTitle>
//                 <CardDescription>
//                   {excelProjects.filter((f) => f.status === "completed").length} completed,{" "}
//                   {excelProjects.filter((f) => f.status === "processing").length} processing,{" "}
//                   {excelProjects.filter((f) => f.status === "pending").length} pending,{" "}
//                   {excelProjects.filter((f) => f.status === "error").length} errors
//                 </CardDescription>
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleDeleteAllProjects}
//                   disabled={excelProjects.some((f) => f.status === "processing")}
//                   className="text-red-600 border-red-600 hover:bg-red-50 rounded-xl"
//                 >
//                   <IconTrash className="h-4 w-4 mr-2" /> Delete All
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent>
//             <div className="space-y-3">
//               {excelProjects.map((project) => {
//                 const isOpen = expandedProjectId === project.id;
//                 const success = Math.max(0, project.processedKeywords - (project.failedCount ?? 0));
//                 return (
//                   <div key={project.id} className="rounded-lg border p-3 sm:p-4 transition-all">
//                     <button
//                       className="w-full flex items-center justify-between gap-3 text-left"
//                       onClick={() => setExpandedProjectId(isOpen ? undefined : project.id)}
//                     >
//                       <div className="flex items-center gap-3">
//                         {getStatusIcon(project.status, project.failedCount)}
//                         <span className="font-medium truncate">{project.fileName}</span>
//                         {getStatusBadge(project.status, project.failedCount)}
//                       </div>
//                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                         <span className="hidden sm:inline">
//                           Keywords: <strong>{project.processedKeywords}</strong> / {project.totalKeywords}
//                         </span>
//                         <span className={`${project.failedCount ? "text-red-600" : "text-green-600"}`}>
//                           ✅ {success} • ❌ {project.failedCount ?? 0}
//                         </span>
//                         {isOpen ? <IconChevronDown className="h-5 w-5" /> : <IconChevronRight className="h-5 w-5" />}
//                       </div>
//                     </button>

//                     <div className="mt-2 text-sm text-muted-foreground flex items-center justify-between">
//                       {project.status === "processing" ? (
//                         <span>{Math.round((project.processedKeywords / Math.max(1, project.totalKeywords)) * 100)}% complete</span>
//                       ) : <span>&nbsp;</span>}
//                       <div className="flex items-center gap-2">
//                         <Button size="sm" variant="outline" onClick={() => setExpandedProjectId(project.id)} className="rounded-xl">View</Button>
//                         {project.status === "completed" && (
//                           <Button size="sm" variant="outline" onClick={() => handleDownloadFile(project.id, project.fileName)} className="rounded-xl">
//                             <IconDownload className="h-4 w-4 mr-2" /> Download
//                           </Button>
//                         )}
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleDeleteProject(project.id)}
//                           className="text-red-600 border-red-600 hover:bg-red-50 rounded-xl"
//                           disabled={project.status === "processing"}
//                         >
//                           <IconTrash className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>

//                     {project.status === "processing" && (
//                       <div className="mt-2">
//                         <Progress value={(project.processedKeywords / Math.max(1, project.totalKeywords)) * 100} className="h-2 transition-all duration-300" />
//                       </div>
//                     )}

//                     {/* Expand area */}
//                     <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"}`}>
//                       {isOpen && (
//                         <div className="mt-4">
//                           <ContentDataTable projectId={project.id} contentItems={contentItems} />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Separator />

//       {/* pass contentItems from hook so table always has latest data */}
//       {/* <ContentDataTable projectId={selectedProjectId} contentItems={contentItems} /> */}
//     </div>
//   );
// }




import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  IconUpload,
  IconDownload,
  IconFileSpreadsheet,
  IconCheck,
  IconClock,
  IconX,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { ContentDataTable } from "./components/content-data-table";
import { useContentGeneration } from "./hooks/use-content-generation";
import * as XLSX from "xlsx";
import { PreferencesPanel } from "./components/PreferencesPanel";
import { cn } from "@/lib/utils";

export default function ContentPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    generateContent,
    isProcessing,
    excelProjects,
    deleteProject,
    deleteAllProjects,
    contentItems,
  } = useContentGeneration();

  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [expandedProjectId, setExpandedProjectId] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedProjectId(params.get("project") || undefined);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const tasks = Array.from(files).map(async (file) => {
      if (!/\.(xlsx|xls)$/i.test(file.name)) return toast.error(`${file.name} is not valid`);
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      try {
        await generateContent(file, id, () => {});
        toast.success(`Processed ${file.name}`);
      } catch {
        toast.error(`Failed ${file.name}`);
      }
    });

    await Promise.allSettled(tasks);
    toast.success(`Processed ${files.length} file(s)`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = (fileId: string, fileName: string) => {
    const rows = contentItems.filter((i) => i.fileId === fileId);
    if (!rows.length) return toast.error("No data found");

    const ws = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Keyword: r.keyword,
        Title: r.title ?? "",
        Content: r.generatedContent,
        Date: new Date(r.createdAt).toLocaleString(),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Content");
    const name = `${fileName.replace(/\.(xlsx|xls)$/i, "")}-generated-${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, name);
  };

  const getStatusIcon = (s: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <IconClock className="h-4 w-4 text-amber-500" />,
      processing: <IconClock className="h-4 w-4 text-sky-500 animate-spin" />,
      completed: <IconCheck className="h-4 w-4 text-emerald-600" />,
      error: <IconX className="h-4 w-4 text-rose-500" />,
    };
    return icons[s] ?? icons.pending;
  };

  const getBadge = (s: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      processing: "bg-sky-100 text-sky-700 animate-pulse",
      completed: "bg-emerald-100 text-emerald-700",
      error: "bg-rose-100 text-rose-700",
    };
    return <Badge className={cn("rounded-full px-3 py-0.5 text-xs", styles[s])}>{s}</Badge>;
  };

  return (
    <div className="space-y-12 p-8 bg-gradient-to-b from-neutral-50 via-white to-slate-50 text-neutral-900">
      {/* Header */}
      <header className="rounded-3xl border bg-gradient-to-r from-fuchsia-100 via-sky-100 to-indigo-100 shadow-lg p-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600">
          Content Generation
        </h1>
        <p className="mt-2 text-sm text-neutral-600 max-w-2xl">
          Upload Excel files to create premium, human-like SEO content from your keyword sheets.
        </p>
      </header>

      <PreferencesPanel />

      {/* Upload */}
      <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-white via-neutral-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-indigo-700">
            <IconUpload className="h-5 w-5 text-sky-600" /> Upload Excel Files
          </CardTitle>
          <CardDescription className="text-neutral-600">
            Supports multiple Excel uploads (.xls, .xlsx). We’ll group and generate automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" multiple onChange={handleFileUpload} className="hidden" />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="rounded-xl px-5 py-2 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500 text-white shadow-md hover:opacity-90"
            >
              <IconFileSpreadsheet className="h-4 w-4 mr-2" /> Select Files
            </Button>
            {isProcessing && (
              <Badge className="bg-sky-100 text-sky-700 animate-pulse rounded-full px-3 py-1">
                Processing {excelProjects?.filter((f) => f.status === "processing").length}…
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Queue */}
      {excelProjects?.length ? (
        <Card className="rounded-3xl shadow-md bg-gradient-to-br from-white via-slate-50 to-sky-50 border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-sky-700">Processing Queue</CardTitle>
                <CardDescription className="text-neutral-600">
                  {excelProjects.filter((f) => f.status === "completed").length} done, {excelProjects.filter((f) => f.status === "processing").length} active, {excelProjects.filter((f) => f.status === "pending").length} waiting
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteAllProjects}
                className="text-rose-600 border-rose-300 hover:bg-rose-100 rounded-full"
              >
                <IconTrash className="h-4 w-4 mr-2" /> Delete All
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {excelProjects.map((p) => {
              const open = expandedProjectId === p.id;
              const success = p.processedKeywords - (p.failedCount ?? 0);
              return (
                <div key={p.id} className="rounded-2xl border border-neutral-200 bg-white/80 shadow-sm p-4 hover:shadow-lg transition-all">
                  <button onClick={() => setExpandedProjectId(open ? undefined : p.id)} className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(p.status)}
                      <span className="font-medium text-neutral-800 max-w-[200px] truncate">{p.fileName}</span>
                      {getBadge(p.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span className="hidden sm:inline">
                        {p.processedKeywords}/{p.totalKeywords}
                      </span>
                      <span className={p.failedCount ? "text-rose-600" : "text-emerald-600"}>✅ {success} • ❌ {p.failedCount ?? 0}</span>
                      {open ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
                    </div>
                  </button>

                  {p.status === "processing" && (
                    <div className="mt-2">
                      <Progress value={(p.processedKeywords / Math.max(1, p.totalKeywords)) * 100} className="h-2 bg-neutral-200" />
                    </div>
                  )}

                  {open && (
                    <div className="mt-3 rounded-xl border bg-neutral-50 p-3">
                      <ContentDataTable projectId={p.id} contentItems={contentItems} />
                    </div>
                  )}

                  <div className="mt-3 flex justify-between text-sm text-neutral-500">
                    {p.status === "processing" ? (
                      <span>{Math.round((p.processedKeywords / Math.max(1, p.totalKeywords)) * 100)}% complete</span>
                    ) : (
                      <span>&nbsp;</span>
                    )}
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setExpandedProjectId(p.id)} className="rounded-full text-sky-700 border-sky-300 hover:bg-sky-50">
                        View
                      </Button>
                      {p.status === "completed" && (
                        <Button size="sm" variant="outline" onClick={() => handleDownload(p.id, p.fileName)} className="rounded-full text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                          <IconDownload className="h-4 w-4 mr-2" /> Download
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => deleteProject(p.id)} className="rounded-full text-rose-600 border-rose-300 hover:bg-rose-50" disabled={p.status === "processing"}>
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <Separator />
    </div>
  );
}