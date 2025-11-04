import React, { useRef, useState } from "react";
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

  const [expandedProjectId, setExpandedProjectId] = useState<
    string | undefined
  >();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

    const tasks = Array.from(files).map(async (file) => {
      if (!/\.(xlsx|xls)$/i.test(file.name))
        return toast.error(`${file.name} is not valid`);
      const id = `${file.name}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
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
    const name = `${fileName.replace(/\.(xlsx|xls)$/i, "")}-generated-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
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
    return (
      <Badge className={cn("rounded-full px-3 py-0.5 text-xs", styles[s])}>
        {s}
      </Badge>
    );
  };

  return (
    <div className="space-y-12 p-8 bg-gradient-to-b from-neutral-50 via-white to-slate-50 text-neutral-900">
      {/* Header */}
      <header className="rounded-3xl border bg-gradient-to-r from-fuchsia-100 via-sky-100 to-indigo-100 shadow-lg p-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600">
          Content Generation
        </h1>
        <p className="mt-2 text-sm text-neutral-600 max-w-2xl">
          Upload Excel files to create premium, human-like SEO content from your
          keyword sheets.
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
            Supports multiple Excel uploads (.xls, .xlsx). We’ll group and
            generate automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="rounded-xl px-5 py-2 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500 text-white shadow-md hover:opacity-90">
              <IconFileSpreadsheet className="h-4 w-4 mr-2" /> Select Files
            </Button>
            {isProcessing && (
              <Badge className="bg-sky-100 text-sky-700 animate-pulse rounded-full px-3 py-1">
                Processing{" "}
                {excelProjects?.filter((f) => f.status === "processing").length}
                …
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
                <CardTitle className="text-lg font-semibold text-sky-700">
                  Processing Queue
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  {excelProjects.filter((f) => f.status === "completed").length}{" "}
                  done,{" "}
                  {
                    excelProjects.filter((f) => f.status === "processing")
                      .length
                  }{" "}
                  active,{" "}
                  {excelProjects.filter((f) => f.status === "pending").length}{" "}
                  waiting
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteAllProjects}
                className="text-rose-600 border-rose-300 hover:bg-rose-100 rounded-full">
                <IconTrash className="h-4 w-4 mr-2" /> Delete All
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {excelProjects.map((p) => {
              const open = expandedProjectId === p.id;
              const success = p.processedKeywords - (p.failedCount ?? 0);
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-neutral-200 bg-white/80 shadow-sm p-4 hover:shadow-lg transition-all">
                  <button
                    onClick={() =>
                      setExpandedProjectId(open ? undefined : p.id)
                    }
                    className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(p.status)}
                      <span className="font-medium text-neutral-800 max-w-[200px] truncate">
                        {p.fileName}
                      </span>
                      {getBadge(p.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span className="hidden sm:inline">
                        {p.processedKeywords}/{p.totalKeywords}
                      </span>
                      <span
                        className={
                          p.failedCount ? "text-rose-600" : "text-emerald-600"
                        }>
                        ✅ {success} • ❌ {p.failedCount ?? 0}
                      </span>
                      {open ? (
                        <IconChevronDown className="h-4 w-4" />
                      ) : (
                        <IconChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {p.status === "processing" && (
                    <div className="mt-2">
                      <Progress
                        value={
                          (p.processedKeywords / Math.max(1, p.totalKeywords)) *
                          100
                        }
                        className="h-2 bg-neutral-200"
                      />
                    </div>
                  )}

                  {open && (
                    <div className="mt-3 rounded-xl border bg-neutral-50 p-3">
                      <ContentDataTable
                        projectId={p.id}
                        contentItems={contentItems}
                      />
                    </div>
                  )}

                  <div className="mt-3 flex justify-between text-sm text-neutral-500">
                    {p.status === "processing" ? (
                      <span>
                        {Math.round(
                          (p.processedKeywords / Math.max(1, p.totalKeywords)) *
                            100
                        )}
                        % complete
                      </span>
                    ) : (
                      <span>&nbsp;</span>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedProjectId(p.id)}
                        className="rounded-full text-sky-700 border-sky-300 hover:bg-sky-50">
                        View
                      </Button>
                      {p.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(p.id, p.fileName)}
                          className="rounded-full text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                          <IconDownload className="h-4 w-4 mr-2" /> Download
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteProject(p.id)}
                        className="rounded-full text-rose-600 border-rose-300 hover:bg-rose-50"
                        disabled={p.status === "processing"}>
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
