"use client";

import { isPageBreakId } from "@/components/SectionNav";
import TemplateSelector from "@/components/TemplateSelector";
import type { ResumeData } from "@/lib/api";
import { Info } from "lucide-react";

interface Props {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export default function TemplatesEditor({ resume, onChange }: Props) {
  const isClassic = resume.selectedTemplate !== 2;

  const handleTemplateChange = (id: number) => {
    let updatedSections = resume.sections;
    if (id === 2 && updatedSections) {
      updatedSections = updatedSections.filter((s) => !isPageBreakId(s));
    }
    onChange({ ...resume, selectedTemplate: id, sections: updatedSections });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Template
      </h2>
      <TemplateSelector
        value={resume.selectedTemplate}
        onChange={handleTemplateChange}
      />

      <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground flex gap-2.5 items-start">
        <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {isClassic
              ? "Classic Template (Single-Column)"
              : "Modern Template (Two-Column)"}
          </p>
          <p className="leading-relaxed">
            {isClassic
              ? "Ideal for comprehensive multi-page resumes. Supports manual page break toggles at the end of sections."
              : "Compact layout with side-by-side columns, optimized for 1-page resumes. Page breaks are disabled to preserve column alignment."}
          </p>
        </div>
      </div>
    </div>
  );
}
