"use client";

import TemplateSelector from "@/components/TemplateSelector";
import type { ResumeData } from "@/lib/api";

interface Props {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export default function TemplatesEditor({ resume, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Template
      </h2>
      <TemplateSelector
        value={resume.selectedTemplate}
        onChange={(id) => onChange({ ...resume, selectedTemplate: id })}
      />
    </div>
  );
}
