"use client";

import { Input } from "@/components/ui/input";
import type { ResumeData } from "@/lib/api";

interface Props {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  headingKey: string;
  defaultLabel: string;
}

export default function SectionHeading({
  resume,
  onChange,
  headingKey,
  defaultLabel,
}: Props) {
  const value = resume.headings?.[headingKey] ?? defaultLabel;

  const setHeading = (v: string) =>
    onChange({
      ...resume,
      headings: { ...resume.headings, [headingKey]: v },
    });

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setHeading(e.target.value)}
        className="text-sm font-semibold uppercase tracking-wide h-auto py-0 px-1 border-none bg-transparent text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
        aria-label={`${defaultLabel} section heading`}
      />
    </div>
  );
}
