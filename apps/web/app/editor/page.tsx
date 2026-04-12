"use client";

import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";
import TemplateSelector from "@/components/TemplateSelector";
import { Button } from "@/components/ui/button";
import { type ResumeData, generatePDF } from "@/lib/api";
import { FileDown, Loader2 } from "lucide-react";
import { useReducer, useState } from "react";

const INITIAL_RESUME: ResumeData = {
  selectedTemplate: 1,
  headings: { work: "Experience" },
  basics: {
    name: "",
    email: "",
    website: "",
    location: { address: "" },
    summaries: [""],
  },
  skills: [{ name: "Skills", keywords: [] }],
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

export default function EditorPage() {
  const [resume, dispatch] = useReducer(reducer, INITIAL_RESUME);
  const [loading, setLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

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

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">Resume Builder</h1>
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
            {loading ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </header>

      {/* ── Split layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — form panel */}
        <aside className="flex w-96 shrink-0 flex-col gap-4 overflow-y-auto border-r bg-zinc-50 p-5">
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
        <main className="flex-1 overflow-auto bg-zinc-100 p-6">
          <ResumePreview resume={resume} />
        </main>
      </div>
    </div>
  );
}
