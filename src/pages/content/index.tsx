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
// }



// src/pages/ContentPage/index.tsx
import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  IconUpload,
  IconDownload,
  IconCheck,
  IconClock,
  IconX,
  IconTrash,
  IconChevronRight,
  IconChevronDown,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { ContentDataTable } from "./components/content-data-table";
import { useContentGeneration } from "./hooks/use-content-generation";
import * as XLSX from "xlsx";
import { attachGlobalDebug } from "@/lib/debug/attach-global-debug";


/** ---- Local Prefs ---- */
type KeywordMode = 1 | 2 | 4;
type ContentPrefs = { keywordMode: KeywordMode; instructions: string; updatedAt?: string };
const PREFS_KEY = "content-preferences-v1";

function loadPrefs(): ContentPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { keywordMode: 1, instructions: "" };
    const obj = JSON.parse(raw) as ContentPrefs;
    const mode = (obj.keywordMode === 2 || obj.keywordMode === 4) ? obj.keywordMode : 1;
    return { keywordMode: mode, instructions: obj.instructions ?? "", updatedAt: obj.updatedAt };
  } catch {
    return { keywordMode: 1, instructions: "" };
  }
}

export default function ContentPage() {

    const fileInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    attachGlobalDebug();
  }, []);
  

  const {
    generateContent,
    isProcessing,
    excelProjects,
    deleteProject,
    deleteAllProjects,
    contentItems,
  } = useContentGeneration();

  /** Selected/expanded row */
  const [expandedProjectId, setExpandedProjectId] = useState<string | undefined>(undefined);

  /** Content preferences (UI-only, saved to localStorage) */
  const [prefs, setPrefs] = useState<ContentPrefs>(() => loadPrefs());
  const [keywordMode, setKeywordMode] = useState<KeywordMode>(prefs.keywordMode);
  const [instructions, setInstructions] = useState<string>(prefs.instructions ?? "");

  useEffect(() => {
    // keep UI in sync if localStorage changed elsewhere
    const onStorage = () => {
      const p = loadPrefs();
      setPrefs(p);
      setKeywordMode(p.keywordMode);
      setInstructions(p.instructions);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const savePrefs = () => {
    const toSave: ContentPrefs = {
      keywordMode,
      instructions: instructions.trim(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PREFS_KEY, JSON.stringify(toSave));
    setPrefs(toSave);
    toast.success("Content preferences saved.");
  };

  const resetPrefs = () => {
    const toSave: ContentPrefs = { keywordMode: 1, instructions: "", updatedAt: new Date().toISOString() };
    localStorage.setItem(PREFS_KEY, JSON.stringify(toSave));
    setKeywordMode(1);
    setInstructions("");
    setPrefs(toSave);
    toast.success("Preferences reset.");
  };

  /** ---- File Upload ---- */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filePromises: Promise<void>[] = [];
    for (const file of Array.from(files)) {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        toast.error(`File ${file.name} is not a valid Excel file`);
        continue;
      }
      const fileId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      filePromises.push(processFile(file, fileId));
    }

    try {
      await Promise.allSettled(filePromises);
      toast.success(`Completed processing ${files.length} file(s)`);
    } catch (error) {
      console.error("Error in batch processing:", error);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFile = async (file: File, fileId: string) => {
    try {
      // Preferences are saved in localStorage; hooks can read if needed.
      await generateContent(file, fileId, () => {
        /* per-file progress if you want */
      });
      toast.success(`Successfully processed ${file.name}`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error(`Failed to process ${file.name}`);
    }
  };

  /** ---- Downloads ---- */
  const handleDownloadFile = (fileId: string, fileName: string) => {
    const fileContentItems = (contentItems ?? []).filter((item) => item.fileId === fileId);
    if (fileContentItems.length === 0) {
      toast.error("No content found for this file");
      return;
    }

    const worksheetData = fileContentItems.map((item) => ({
      Keyword: item.keyword,
      Title: item.title ?? "",
      "Generated Content": item.generatedContent,
      "Created Date": new Date(item.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Content");

    const sanitizedFileName = fileName.replace(/\.(xlsx|xls)$/i, "");
    const downloadFileName = `${sanitizedFileName}-generated-content-${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`;

    XLSX.writeFile(workbook, downloadFileName);
    toast.success(`Downloaded content for ${fileName}`);
  };

  /** ---- Delete ---- */
  const handleDeleteProject = (projectId: string) => {
    if (confirm("Delete this project and all its content?")) {
      deleteProject(projectId);
      if (expandedProjectId === projectId) setExpandedProjectId(undefined);
    }
  };

  const handleDeleteAllProjects = () => {
    if (confirm("Delete ALL projects and content? This cannot be undone.")) {
      deleteAllProjects();
      setExpandedProjectId(undefined);
    }
  };

  /** ---- Status helpers with failedCount awareness ---- */
  const getStatusIcon = (
    status: "pending" | "processing" | "completed" | "error",
    failedCount?: number
  ) => {
    switch (status) {
      case "pending":
        return <IconClock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <IconClock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return (failedCount ?? 0) > 0 ? (
          <IconAlertTriangle className="h-4 w-4 text-amber-500" />
        ) : (
          <IconCheck className="h-4 w-4 text-green-600" />
        );
      case "error":
        return <IconX className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (
    status: "pending" | "processing" | "completed" | "error",
    failedCount?: number
  ) => {
    const fails = failedCount ?? 0;
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-yellow-600 text-yellow-700">Pending</Badge>;
      case "processing":
        return <Badge variant="outline" className="border-blue-600 text-blue-700">Processing</Badge>;
      case "completed":
        return fails > 0 ? (
          <Badge variant="outline" className="border-amber-600 text-amber-700">
            Completed • {fails} failed
          </Badge>
        ) : (
          <Badge variant="outline" className="border-green-600 text-green-700">Completed</Badge>
        );
      case "error":
        return <Badge variant="outline" className="border-red-600 text-red-700">Error</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-10">

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Generation</h1>
        <p className="text-muted-foreground">
          Upload Excel files to automatically generate content from keywords using AI.
        </p>
      </div>

      {/* ---------- Preferences ---------- */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Content Preferences</CardTitle>
          <CardDescription>
            Choose keyword mode and add any important instructions. Saved locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Keyword mode</div>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="keyword-mode"
                    checked={keywordMode === 1}
                    onChange={() => setKeywordMode(1)}
                    className="h-4 w-4"
                  />
                  <span>1 keyword</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="keyword-mode"
                    checked={keywordMode === 2}
                    onChange={() => setKeywordMode(2)}
                    className="h-4 w-4"
                  />
                  <span>2 keywords</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="keyword-mode"
                    checked={keywordMode === 4}
                    onChange={() => setKeywordMode(4)}
                    className="h-4 w-4"
                  />
                  <span>4 keywords</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Last saved</div>
              <div className="text-sm text-muted-foreground">
                {prefs.updatedAt ? new Date(prefs.updatedAt).toLocaleString() : "—"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Custom instructions</div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Write important editorial directions, brand tone, linking rules, etc."
              rows={4}
              className="w-full rounded-md border p-3 text-sm outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={savePrefs}>Save</Button>
            <Button variant="outline" onClick={resetPrefs}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Upload ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUpload className="h-5 w-5" />
            Upload Excel Files
          </CardTitle>
          <CardDescription>
            Upload one or more Excel files containing keywords. The system will generate content for each keyword.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                multiple
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="file-upload-native"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <IconUpload className="h-4 w-4" /> Choose Excel Files
              </Button>

              {isProcessing && (
                <Badge variant="outline" className="text-blue-600 border-blue-600 animate-pulse">
                  Processing {excelProjects?.filter((f) => f.status === "processing").length} files…
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Queue Summary ---------- */}
      {excelProjects && excelProjects.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Processing Overview</CardTitle>
                <CardDescription>
                  {excelProjects.filter((f) => f.status === "completed").length} completed,{" "}
                  {excelProjects.filter((f) => f.status === "processing").length} processing,{" "}
                  {excelProjects.filter((f) => f.status === "pending").length} pending,{" "}
                  {excelProjects.filter((f) => f.status === "error").length} errors
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAllProjects}
                  disabled={excelProjects.some((f) => f.status === "processing")}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <IconTrash className="h-4 w-4 mr-2" /> Delete All
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {excelProjects.filter((f) => f.status === "completed").length}
                </div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {excelProjects.filter((f) => f.status === "processing").length}
                </div>
                <div className="text-sm text-blue-700">Processing</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {excelProjects.filter((f) => f.status === "pending").length}
                </div>
                <div className="text-sm text-yellow-700">Pending</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {excelProjects.filter((f) => f.status === "error").length}
                </div>
                <div className="text-sm text-red-700">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- Project Rows (expand to see content) ---------- */}
      {excelProjects && excelProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Excel Projects</CardTitle>
            <CardDescription>Click a row to view generated content for that file.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {excelProjects.map((project) => {
                const isOpen = expandedProjectId === project.id;
                const fails = project.failedCount ?? 0; // requires failedCount?: number in hook's ExcelProject
                const total = project.totalKeywords ?? 0;
                const success = Math.max(0, total - fails);

                return (
                  <div key={project.id} className="rounded-lg border p-3 sm:p-4">
                    <button
                      className="w-full flex items-center justify-between gap-3 text-left"
                      onClick={() => setExpandedProjectId(isOpen ? undefined : project.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getStatusIcon(project.status, fails)}
                        <span className="font-medium truncate">{project.fileName}</span>
                        {getStatusBadge(project.status, fails)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="hidden sm:inline">
                          Keywords: <strong>{project.processedKeywords}</strong> / {total}
                        </span>
                        <span className={fails ? "text-red-600" : "text-green-600"}>
                          ✅ {success} • ❌ {fails}
                        </span>
                        {isOpen ? <IconChevronDown className="h-5 w-5" /> : <IconChevronRight className="h-5 w-5" />}
                      </div>
                    </button>

                    <div className="mt-2 text-sm text-muted-foreground flex items-center justify-between">
                      {project.status === "processing" ? (
                        <span>
                          {Math.round((project.processedKeywords / Math.max(1, total)) * 100)}% complete
                        </span>
                      ) : (
                        <span>&nbsp;</span>
                      )}
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setExpandedProjectId(project.id)}>
                          View
                        </Button>
                        {project.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadFile(project.id, project.fileName)}
                          >
                            <IconDownload className="h-4 w-4 mr-2" /> Download
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          disabled={project.status === "processing"}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {project.status === "processing" && (
                      <div className="mt-2">
                        <Progress
                          value={(project.processedKeywords / Math.max(1, total)) * 100}
                          className="h-2 transition-all duration-300"
                        />
                      </div>
                    )}

                    {/* Expand area */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {isOpen && (
                        <div className="mt-4">
                          <ContentDataTable projectId={project.id} contentItems={contentItems} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Optional: global table removed per your spec (show only on expand). */}
    </div>
  );
}
