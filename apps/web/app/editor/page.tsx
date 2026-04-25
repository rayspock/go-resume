"use client";

import ImportJsonDialog from "@/components/ImportJsonDialog";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";
import TemplateSelector from "@/components/TemplateSelector";
import { Button } from "@/components/ui/button";
import { type ResumeData, generatePDF } from "@/lib/api";
import { APP_NAME } from "@/lib/config";
import { FileDown, FileJson, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useReducer, useState } from "react";

const INITIAL_RESUME: ResumeData = {
  selectedTemplate: 1,
  headings: { work: "Experience" },
  basics: {
    name: "",
    email: "",
    website: "",
    linkedin: "",
    location: { address: "" },
    summaries: [""],
  },
  skills: [{ name: "", keywords: [] }],
  work: [],
  projects: [],
  education: [],
  sections: ["templates", "profile", "skills", "work", "projects", "education"],
};

type Action =
  | { type: "SET_RESUME"; payload: ResumeData }
  | { type: "SET_TEMPLATE"; payload: number };

function reducer(state: ResumeData, action: Action): ResumeData {
  switch (action.type) {
    case "SET_RESUME":
      return action.payload;
    case "SET_TEMPLATE":
      return { ...state, selectedTemplate: action.payload };
  }
}

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resume, dispatch] = useReducer(reducer, INITIAL_RESUME);
  const [loading, setLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(
    searchParams.get("import") === "true",
  );

  const handleDownload = async () => {
    setLoading(true);
    setPdfError(null);
    try {
      await generatePDF(resume);
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : "Failed to generate PDF",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = () => {
    const json = JSON.stringify(resume, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (data: ResumeData) => {
    dispatch({ type: "SET_RESUME", payload: data });
    router.replace("/editor");
  };

  const handleImportOpenChange = (open: boolean) => {
    setImportOpen(open);
    if (!open) {
      router.replace("/editor");
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between border-b bg-card px-6 py-3 shadow-sm">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight hover:text-blue-500 transition-colors"
        >
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-3">
          {pdfError && (
            <span className="text-sm text-destructive">{pdfError}</span>
          )}
          <Button onClick={handleDownload} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            {loading ? "Generating…" : "PDF"}
          </Button>
          <Button
            onClick={handleExportJson}
            variant="outline"
            className="gap-2"
          >
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </header>

      {/* ── Split layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — form panel */}
        <aside className="flex w-96 shrink-0 flex-col gap-4 overflow-y-auto border-r bg-background p-5">
          <TemplateSelector
            value={resume.selectedTemplate}
            onChange={(id) => dispatch({ type: "SET_TEMPLATE", payload: id })}
          />
          <ResumeForm
            resume={resume}
            onChange={(updated) =>
              dispatch({ type: "SET_RESUME", payload: updated })
            }
          />
        </aside>

        {/* Right — preview panel */}
        <main className="flex-1 overflow-auto bg-muted p-6">
          <ResumePreview resume={resume} />
        </main>
      </div>

      <ImportJsonDialog
        open={importOpen}
        onOpenChange={handleImportOpenChange}
        onImport={handleImport}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense>
      <EditorContent />
    </Suspense>
  );
}
