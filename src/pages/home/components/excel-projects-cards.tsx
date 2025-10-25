// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { IconFileSpreadsheet, IconDownload,  IconEye, IconClock, IconCheck, IconX } from "@tabler/icons-react";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import * as XLSX from 'xlsx';

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: 'pending' | 'processing' | 'completed' | 'error';
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
// }

// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string;
// }

// export function ExcelProjectsCards() {
//   const [excelProjects] = useLocalStorage<ExcelProject[]>('excel-projects', []);
//   const [contentItems] = useLocalStorage<ContentItem[]>('content-items', []);
//   const navigate = useNavigate();

//   const getStatusIcon = (status: ExcelProject['status']) => {
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

//   const getStatusBadge = (status: ExcelProject['status']) => {
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

//   const handleViewProject = (projectId: string) => {
//     // Navigate to content page with project filter
//     navigate(`/content?project=${projectId}`);
//   };

//   const handleDownloadProject = (project: ExcelProject) => {
//     const projectContentItems = contentItems.filter(item => item.fileId === project.id);
    
//     if (projectContentItems.length === 0) {
//       toast.error('No content found for this project');
//       return;
//     }

//     // Create Excel file with content from this specific project
//     const worksheetData = projectContentItems.map(item => ({
//       'Keyword': item.keyword,
//       'Generated Content': item.generatedContent,
//       'Created Date': new Date(item.createdAt).toLocaleString()
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Generated Content');

//     // Download the file with a descriptive name
//     const sanitizedFileName = project.fileName.replace(/\.(xlsx|xls)$/i, '');
//     const downloadFileName = `${sanitizedFileName}-generated-content-${new Date().toISOString().split('T')[0]}.xlsx`;
    
//     XLSX.writeFile(workbook, downloadFileName);
//     toast.success(`Downloaded content for ${project.fileName}`);
//   };

//   if (excelProjects.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <IconFileSpreadsheet className="h-5 w-5" />
//             Excel Projects
//           </CardTitle>
//           <CardDescription>
//             Your Excel content generation projects will appear here
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8">
//             <IconFileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//             <p className="text-muted-foreground mb-4">
//               No Excel projects found. Upload Excel files to start generating content.
//             </p>
//             <Button onClick={() => navigate('/content')}>
//               Go to Content Generation
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <IconFileSpreadsheet className="h-5 w-5" />
//           Excel Projects ({excelProjects.length})
//         </CardTitle>
//         <CardDescription>
//           Manage your Excel content generation projects
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {excelProjects.map((project) => (
//             <div key={project.id} className="p-4 border rounded-lg space-y-3">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-2">
//                   {getStatusIcon(project.status)}
//                   <div>
//                     <h4 className="font-medium text-sm truncate max-w-[150px]" title={project.fileName}>
//                       {project.fileName}
//                     </h4>
//                     <div className="flex items-center gap-2 mt-1">
//                       {getStatusBadge(project.status)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <div className="flex justify-between text-xs text-muted-foreground">
//                   <span>Keywords: {project.processedKeywords}/{project.totalKeywords}</span>
//                   <span>{new Date(project.createdAt).toLocaleDateString()}</span>
//                 </div>
                
//                 {project.status === 'processing' && (
//                   <div className="space-y-1">
//                     <Progress 
//                       value={(project.processedKeywords / project.totalKeywords) * 100} 
//                       className="h-1" 
//                     />
//                     <p className="text-xs text-muted-foreground">
//                       {Math.round((project.processedKeywords / project.totalKeywords) * 100)}% complete
//                     </p>
//                   </div>
//                 )}
                
//                 {project.status === 'error' && project.error && (
//                   <p className="text-xs text-red-600 truncate" title={project.error}>
//                     {project.error}
//                   </p>
//                 )}
//               </div>
              
//               <div className="flex gap-2">
//                 {project.status === 'completed' && (
//                   <>
//                     <Button 
//                       size="sm" 
//                       variant="outline"
//                       onClick={() => handleViewProject(project.id)}
//                       className="flex-1"
//                     >
//                       <IconEye className="h-3 w-3 mr-1" />
//                       View
//                     </Button>
//                     <Button 
//                       size="sm" 
//                       variant="outline"
//                       onClick={() => handleDownloadProject(project)}
//                     >
//                       <IconDownload className="h-3 w-3" />
//                     </Button>
//                   </>
//                 )}
//                 {project.status === 'pending' && (
//                   <Button 
//                     size="sm" 
//                     variant="outline"
//                     onClick={() => handleViewProject(project.id)}
//                     className="w-full"
//                   >
//                     <IconEye className="h-3 w-3 mr-1" />
//                     View Details
//                   </Button>
//                 )}
//                 {project.status === 'error' && (
//                   <Button 
//                     size="sm" 
//                     variant="outline"
//                     onClick={() => handleViewProject(project.id)}
//                     className="w-full"
//                   >
//                     <IconEye className="h-3 w-3 mr-1" />
//                     View Error
//                   </Button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
        
//         <div className="mt-4 pt-4 border-t">
//           <Button 
//             variant="outline" 
//             onClick={() => navigate('/content')}
//             className="w-full"
//           >
//             <IconFileSpreadsheet className="h-4 w-4 mr-2" />
//             Manage All Projects
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }





// // src/components/ExcelProjectsCards.tsx
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { IconFileSpreadsheet, IconDownload, IconEye, IconClock, IconCheck, IconX } from "@tabler/icons-react";
// import { useLocalStorage } from "@/hooks/use-local-storage";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import * as XLSX from "xlsx";

// interface ExcelProject {
//   id: string;
//   fileName: string;
//   status: "pending" | "processing" | "completed" | "error";
//   totalKeywords: number;
//   processedKeywords: number;
//   createdAt: string;
//   error?: string;
// }

// interface ContentItem {
//   id: string;
//   keyword: string;
//   generatedContent: string;
//   fileId: string;
//   fileName: string;
//   createdAt: string;
// }

// export function ExcelProjectsCards() {
//   const [excelProjects] = useLocalStorage<ExcelProject[]>("excel-projects", []);
//   const [contentItems] = useLocalStorage<ContentItem[]>("content-items", []);
//   const navigate = useNavigate();

//   const getStatusIcon = (status: ExcelProject["status"]) => {
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

//   const getStatusBadge = (status: ExcelProject["status"]) => {
//     switch (status) {
//       case "pending":
//         return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
//       case "processing":
//         return <Badge variant="outline" className="text-blue-600 border-blue-600">Processing</Badge>;
//       case "completed":
//         return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
//       case "error":
//         return <Badge variant="outline" className="text-red-600 border-red-600">Error</Badge>;
//     }
//   };

//   const handleViewProject = (projectId: string) => {
//     navigate(`/content?project=${projectId}`);
//   };

//   const handleDownloadProject = (project: ExcelProject) => {
//     const projectContentItems = (contentItems ?? []).filter((item) => item.fileId === project.id);

//     if (projectContentItems.length === 0) {
//       toast.error("No content found for this project");
//       return;
//     }

//     const worksheetData = projectContentItems.map((item) => ({
//       Keyword: item.keyword,
//       "Generated Content": item.generatedContent,
//       "Created Date": new Date(item.createdAt).toLocaleString(),
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Content");

//     const sanitizedFileName = project.fileName.replace(/\.(xlsx|xls)$/i, "");
//     const downloadFileName = `${sanitizedFileName}-generated-content-${new Date().toISOString().split("T")[0]}.xlsx`;

//     XLSX.writeFile(workbook, downloadFileName);
//     toast.success(`Downloaded content for ${project.fileName}`);
//   };

//   if (!excelProjects || excelProjects.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <IconFileSpreadsheet className="h-5 w-5" />
//             Excel Projects
//           </CardTitle>
//           <CardDescription>Your Excel content generation projects will appear here</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8">
//             <IconFileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//             <p className="text-muted-foreground mb-4">No Excel projects found. Upload Excel files to start generating content.</p>
//             <Button onClick={() => navigate("/content")}>Go to Content Generation</Button>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <IconFileSpreadsheet className="h-5 w-5" />
//           Excel Projects ({excelProjects.length})
//         </CardTitle>
//         <CardDescription>Manage your Excel content generation projects</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {excelProjects.map((project) => (
//             <div key={project.id} className="p-4 border rounded-lg space-y-3">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-2">
//                   {getStatusIcon(project.status)}
//                   <div>
//                     <h4 className="font-medium text-sm truncate max-w-[150px]" title={project.fileName}>
//                       {project.fileName}
//                     </h4>
//                     <div className="flex items-center gap-2 mt-1">{getStatusBadge(project.status)}</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex justify-between text-xs text-muted-foreground">
//                   <span>Keywords: {project.processedKeywords}/{project.totalKeywords}</span>
//                   <span>{new Date(project.createdAt).toLocaleDateString()}</span>
//                 </div>

//                 {project.status === "processing" && (
//                   <div className="space-y-1">
//                     <Progress value={(project.processedKeywords / Math.max(1, project.totalKeywords)) * 100} className="h-1" />
//                     <p className="text-xs text-muted-foreground">{Math.round((project.processedKeywords / Math.max(1, project.totalKeywords)) * 100)}% complete</p>
//                   </div>
//                 )}

//                 {project.status === "error" && project.error && (
//                   <p className="text-xs text-red-600 truncate" title={project.error}>
//                     {project.error}
//                   </p>
//                 )}
//               </div>

//               <div className="flex gap-2">
//                 {project.status === "completed" && (
//                   <>
//                     <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)} className="flex-1">
//                       <IconEye className="h-3 w-3 mr-1" />
//                       View
//                     </Button>
//                     <Button size="sm" variant="outline" onClick={() => handleDownloadProject(project)}>
//                       <IconDownload className="h-3 w-3" />
//                     </Button>
//                   </>
//                 )}

//                 {project.status === "pending" && (
//                   <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)} className="w-full">
//                     <IconEye className="h-3 w-3 mr-1" />
//                     View Details
//                   </Button>
//                 )}

//                 {project.status === "error" && (
//                   <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)} className="w-full">
//                     <IconEye className="h-3 w-3 mr-1" />
//                     View Error
//                   </Button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mt-4 pt-4 border-t">
//           <Button variant="outline" onClick={() => navigate("/content")} className="w-full">
//             <IconFileSpreadsheet className="h-4 w-4 mr-2" />
//             Manage All Projects
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
















// // src/components/ExcelProjectsCards.tsx
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { IconFileSpreadsheet, IconDownload, IconEye, IconClock, IconCheck, IconX } from "@tabler/icons-react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import * as XLSX from "xlsx";
// import { useContentGeneration } from "@/hooks/use-content-generation";

// export function ExcelProjectsCards() {
//   // Use hook as single source of truth
//   const { excelProjects, contentItems } = useContentGeneration();
//   const navigate = useNavigate();

//   const getStatusIcon = (status: any) => {
//     switch (status) {
//       case "pending": return <IconClock className="h-4 w-4 text-yellow-500" />;
//       case "processing": return <IconClock className="h-4 w-4 text-blue-500 animate-spin" />;
//       case "completed": return <IconCheck className="h-4 w-4 text-green-500" />;
//       case "error": return <IconX className="h-4 w-4 text-red-500" />;
//     }
//   };

//   const getStatusBadge = (status: any) => {
//     switch (status) {
//       case "pending": return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
//       case "processing": return <Badge variant="outline" className="text-blue-600 border-blue-600">Processing</Badge>;
//       case "completed": return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
//       case "error": return <Badge variant="outline" className="text-red-600 border-red-600">Error</Badge>;
//     }
//   };

//   const handleViewProject = (projectId: string) => navigate(`/content?project=${projectId}`);

//   const handleDownloadProject = (project: any) => {
//     const projectContentItems = (contentItems ?? []).filter((item: { fileId: string }) => item.fileId === project.id);
//     if (projectContentItems.length === 0) {
//       toast.error("No content found for this project");
//       return;
//     }

//     const worksheetData = projectContentItems.map((item) => ({
//       Keyword: item.keyword,
//       "Generated Content": item.generatedContent,
//       "Created Date": new Date(item.createdAt).toLocaleString(),
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Content");

//     const sanitizedFileName = project.fileName.replace(/\.(xlsx|xls)$/i, "");
//     const downloadFileName = `${sanitizedFileName}-generated-content-${new Date().toISOString().split("T")[0]}.xlsx`;
//     XLSX.writeFile(workbook, downloadFileName);
//     toast.success(`Downloaded content for ${project.fileName}`);
//   };

//   if (!excelProjects || excelProjects.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2"><IconFileSpreadsheet className="h-5 w-5" /> Excel Projects</CardTitle>
//           <CardDescription>Your Excel content generation projects will appear here</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8">
//             <IconFileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//             <p className="text-muted-foreground mb-4">No Excel projects found. Upload Excel files to start generating content.</p>
//             <Button onClick={() => navigate("/content")}>Go to Content Generation</Button>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2"><IconFileSpreadsheet className="h-5 w-5" /> Excel Projects ({excelProjects.length})</CardTitle>
//         <CardDescription>Manage your Excel content generation projects</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {excelProjects.map((project) => (
//             <div key={project.id} className="p-4 border rounded-lg space-y-3">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-2">
//                   {getStatusIcon(project.status)}
//                   <div>
//                     <h4 className="font-medium text-sm truncate max-w-[150px]" title={project.fileName}>{project.fileName}</h4>
//                     <div className="flex items-center gap-2 mt-1">{getStatusBadge(project.status)}</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex justify-between text-xs text-muted-foreground">
//                   <span>Keywords: {project.processedKeywords}/{project.totalKeywords}</span>
//                   <span>{new Date(project.createdAt).toLocaleDateString()}</span>
//                 </div>

//                 {project.status === "processing" && (
//                   <div className="space-y-1">
//                     <Progress value={(project.processedKeywords / Math.max(1, project.totalKeywords)) * 100} className="h-1" />
//                     <p className="text-xs text-muted-foreground">{Math.round((project.processedKeywords / Math.max(1, project.totalKeywords)) * 100)}% complete</p>
//                   </div>
//                 )}

//                 {project.status === "error" && project.error && (
//                   <p className="text-xs text-red-600 truncate" title={project.error}>{project.error}</p>
//                 )}
//               </div>

//               <div className="flex gap-2">
//                 {project.status === "completed" && (
//                   <>
//                     <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)} className="flex-1">
//                       <IconEye className="h-3 w-3 mr-1" /> View
//                     </Button>
//                     <Button size="sm" variant="outline" onClick={() => handleDownloadProject(project)}>
//                       <IconDownload className="h-3 w-3" />
//                     </Button>
//                   </>
//                 )}

//                 {project.status === "pending" && (
//                   <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)} className="w-full">
//                     <IconEye className="h-3 w-3 mr-1" /> View Details
//                   </Button>
//                 )}

//                 {project.status === "error" && (
//                   <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)} className="w-full">
//                     <IconEye className="h-3 w-3 mr-1" /> View Error
//                   </Button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mt-4 pt-4 border-t">
//           <Button variant="outline" onClick={() => navigate("/content")} className="w-full">
//             <IconFileSpreadsheet className="h-4 w-4 mr-2" /> Manage All Projects
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }






// src/components/ExcelProjectsCards.jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IconFileSpreadsheet, IconDownload, IconEye, IconClock, IconCheck, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useContentGeneration } from "../../content/hooks/use-content-generation";

export function ExcelProjectsCards() {
  // Use hook as single source of truth
  const { excelProjects, contentItems } = useContentGeneration();
  const navigate = useNavigate();

  interface ExcelProjectStatus {
    status: "pending" | "processing" | "completed" | "error";
  }

  const getStatusIcon = (status: ExcelProjectStatus["status"]): JSX.Element | null => {
    switch (status) {
      case "pending": return <IconClock className="h-4 w-4 text-yellow-500" />;
      case "processing": return <IconClock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed": return <IconCheck className="h-4 w-4 text-green-500" />;
      case "error": return <IconX className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  interface ExcelProjectStatus {
    status: "pending" | "processing" | "completed" | "error";
  }

  const getStatusBadge = (status: ExcelProjectStatus["status"]): JSX.Element | null => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case "processing": return <Badge variant="outline" className="text-blue-600 border-blue-600">Processing</Badge>;
      case "completed": return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case "error": return <Badge variant="outline" className="text-red-600 border-red-600">Error</Badge>;
      default: return null;
    }
  };

  interface HandleViewProjectFn {
    (projectId: string): void;
  }

  const handleViewProject: HandleViewProjectFn = (projectId) => navigate(`/content?project=${projectId}`);

  const handleDownloadProject = (project: { id: string; fileName: string }) => {
    const projectContentItems = (contentItems ?? []).filter((item) => item.fileId === project.id);
    if (projectContentItems.length === 0) {
      toast.error("No content found for this project");
      return;
    }

    const worksheetData = projectContentItems.map((item) => ({
      Keyword: item.keyword,
      "Generated Content": item.generatedContent,
      "Created Date": new Date(item.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Content");

    const sanitizedFileName = project.fileName.replace(/\.(xlsx|xls)$/i, "");
    const downloadFileName = `${sanitizedFileName}-generated-content-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, downloadFileName);
    toast.success(`Downloaded content for ${project.fileName}`);
  };

  if (!excelProjects || excelProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><IconFileSpreadsheet className="h-5 w-5" /> Excel Projects</CardTitle>
          <CardDescription>Your Excel content generation projects will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <IconFileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No Excel projects found. Upload Excel files to start generating content.</p>
            <Button onClick={() => navigate("/content")}>Go to Content Generation</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><IconFileSpreadsheet className="h-5 w-5" /> Excel Projects ({excelProjects.length})</CardTitle>
        <CardDescription>Manage your Excel content generation projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {excelProjects.map((project) => (
            <div key={project.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(project.status)}
                  <div>
                    <h4 className="font-medium text-sm truncate max-w-[150px]" title={project.fileName}>{project.fileName}</h4>
                    <div className="flex items-center gap-2 mt-1">{getStatusBadge(project.status)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Keywords: {project.processedKeywords}/{project.totalKeywords}</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>

                {project.status === "processing" && (
                  <div className="space-y-1">
                    <Progress value={(project.processedKeywords / Math.max(1, project.totalKeywords)) * 100} className="h-1" />
                    <p className="text-xs text-muted-foreground">{Math.round((project.processedKeywords / Math.max(1, project.totalKeywords)) * 100)}% complete</p>
                  </div>
                )}

                {project.status === "error" && project.error && (
                  <p className="text-xs text-red-600 truncate" title={project.error}>{project.error}</p>
                )}
              </div>

              <div className="flex gap-2">
                {project.status === "completed" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)} className="flex-1">
                      <IconEye className="h-3 w-3 mr-1" /> View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadProject(project)}>
                      <IconDownload className="h-3 w-3" />
                    </Button>
                  </>
                )}

                {project.status === "pending" && (
                  <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)} className="w-full">
                    <IconEye className="h-3 w-3 mr-1" /> View Details
                  </Button>
                )}

                {project.status === "error" && (
                  <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)} className="w-full">
                    <IconEye className="h-3 w-3 mr-1" /> View Error
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => navigate("/content")} className="w-full">
            <IconFileSpreadsheet className="h-4 w-4 mr-2" /> Manage All Projects
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
