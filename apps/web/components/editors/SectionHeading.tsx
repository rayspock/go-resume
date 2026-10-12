"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ResumeData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Scissors } from "lucide-react";

interface Props {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  headingKey: string;
  defaultLabel: string;
  sectionId?: string;
  hidePageBreakToggle?: boolean;
}

function isPageBreakToken(id: string): boolean {
  return (
    id === "pagebreak" ||
    id.startsWith("pagebreak-") ||
    id.startsWith("pagebreak_")
  );
}

export default function SectionHeading({
  resume,
  onChange,
  headingKey,
  defaultLabel,
  sectionId,
  hidePageBreakToggle = false,
}: Props) {
  const value = resume.headings?.[headingKey] ?? defaultLabel;

  const setHeading = (v: string) =>
    onChange({
      ...resume,
      headings: { ...resume.headings, [headingKey]: v },
    });

  const sections = resume.sections ?? [
    "templates",
    "profile",
    "skills",
    "work",
    "projects",
    "education",
    "awards",
  ];

  const secId =
    sectionId ?? (headingKey === "summary" ? "profile" : headingKey);
  const targetIndex = sections.indexOf(secId);
  const nextItem = targetIndex >= 0 ? sections[targetIndex + 1] : undefined;
  const hasPageBreak = Boolean(nextItem && isPageBreakToken(nextItem));

  const isPageBreakSupported = resume.selectedTemplate !== 2;

  const handleTogglePageBreak = (checked: boolean) => {
    if (targetIndex === -1 || !isPageBreakSupported) return;
    const nextSections = [...sections];

    if (checked && !hasPageBreak) {
      const breakId = `pagebreak-${Date.now().toString(36)}`;
      nextSections.splice(targetIndex + 1, 0, breakId);
      onChange({ ...resume, sections: nextSections });
    } else if (!checked && hasPageBreak) {
      let removeCount = 0;
      while (
        targetIndex + 1 + removeCount < nextSections.length &&
        isPageBreakToken(nextSections[targetIndex + 1 + removeCount])
      ) {
        removeCount++;
      }
      nextSections.splice(targetIndex + 1, removeCount);
      onChange({ ...resume, sections: nextSections });
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40 mb-3">
      <div className="flex flex-1 items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Section Heading"
          className="text-sm font-semibold uppercase tracking-wide h-auto py-0 px-1 border-none bg-transparent text-muted-foreground placeholder:font-normal placeholder:normal-case placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-ring"
          aria-label={`${defaultLabel} section heading`}
        />
      </div>

      {!hidePageBreakToggle && (
        <div
          className="flex items-center gap-1.5 shrink-0"
          title={
            !isPageBreakSupported
              ? "Page breaks are only supported in single-column templates (Classic)"
              : "Force a PDF page break after this section"
          }
        >
          <Label
            htmlFor={`pb-toggle-${secId}`}
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium select-none",
              !isPageBreakSupported
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-muted-foreground cursor-pointer hover:text-foreground",
            )}
          >
            <Scissors
              className={cn(
                "h-3 w-3",
                !isPageBreakSupported
                  ? "text-muted-foreground/40"
                  : hasPageBreak
                    ? "text-blue-500"
                    : "text-muted-foreground/60",
              )}
            />
            <span>Page Break</span>
          </Label>
          <Switch
            id={`pb-toggle-${secId}`}
            checked={hasPageBreak && isPageBreakSupported}
            disabled={!isPageBreakSupported}
            onCheckedChange={handleTogglePageBreak}
            aria-label={`Toggle page break after ${defaultLabel}`}
          />
        </div>
      )}
    </div>
  );
}
