"use client";

import ImportJsonDialog from "@/components/ImportJsonDialog";
import ResumePreview from "@/components/ResumePreview";
import SectionNav, { type SectionId } from "@/components/SectionNav";
import EducationEditor from "@/components/editors/EducationEditor";
import ExperienceEditor from "@/components/editors/ExperienceEditor";
import ProfileEditor from "@/components/editors/ProfileEditor";
import ProjectsEditor from "@/components/editors/ProjectsEditor";
import SkillsEditor from "@/components/editors/SkillsEditor";
import TemplatesEditor from "@/components/editors/TemplatesEditor";
import { Button } from "@/components/ui/button";
import { type ResumeData, generatePDF } from "@/lib/api";
import { APP_NAME, STORAGE_KEY } from "@/lib/config";
import { FileDown, FileJson, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useReducer, useState } from "react";

const INITIAL_RESUME: ResumeData = {
  selectedTemplate: 1,
  headings: {
    summary: "Summary",
    skills: "Skills",
    work: "Experience",
    projects: "Projects",
    education: "Education",
  },
  basics: {
    name: "",
    email: "",
    website: "",
    location: { address: "" },
    summaries: [],
  },
  skills: [],
  work: [],
  projects: [],
  education: [],
  sections: ["templates", "profile", "skills", "work", "projects", "education"],
};

type Action = { type: "SET_RESUME"; payload: ResumeData };

function reducer(_state: ResumeData, action: Action): ResumeData {
  return action.payload;
}

function sectionEditor(
  section: SectionId,
  resume: ResumeData,
  onChange: (r: ResumeData) => void,
) {
  const props = { resume, onChange };
  switch (section) {
    case "templates":
      return <TemplatesEditor {...props} />;
    case "profile":
      return <ProfileEditor {...props} />;
    case "skills":
      return <SkillsEditor {...props} />;
    case "work":
      return <ExperienceEditor {...props} />;
    case "projects":
      return <ProjectsEditor {...props} />;
    case "education":
      return <EducationEditor {...props} />;
  }
}

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resume, dispatch] = useReducer(reducer, INITIAL_RESUME, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as ResumeData;
    } catch {}
    return INITIAL_RESUME;
  });
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [loading, setLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(
    searchParams.get("import") === "true",
  );

  // Auto-save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  }, [resume]);

  const update = (updated: ResumeData) =>
    dispatch({ type: "SET_RESUME", payload: updated });

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
    if (!open) router.replace("/editor");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b bg-card px-6 py-3 shadow-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-blue-500 transition-colors"
        >
          <Image
            src="/go-resume-logo.png"
            alt="Go Resume logo"
            width={28}
            height={28}
          />
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

      {/* ── Three-column body ────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Col 1 — Section nav */}
        <SectionNav active={activeSection} onChange={setActiveSection} />

        {/* Col 2 — Section editor */}
        <aside className="w-96 shrink-0 overflow-y-auto border-r bg-background p-5">
          {sectionEditor(activeSection, resume, update)}
        </aside>

        {/* Col 3 — Live preview */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted p-6">
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
