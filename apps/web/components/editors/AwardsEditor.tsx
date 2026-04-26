"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import SectionHeading from "./SectionHeading";

interface Props {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

type AwardEntry = NonNullable<ResumeData["awards"]>[number];

export default function AwardsEditor({ resume, onChange }: Props) {
  const awards = resume.awards ?? [];

  const add = () =>
    onChange({
      ...resume,
      awards: [...awards, { title: "", date: "", summary: "", awarder: "" }],
    });

  const update = (i: number, field: keyof AwardEntry, value: string) => {
    const next = [...awards];
    next[i] = { ...next[i], [field]: value };
    onChange({ ...resume, awards: next });
  };

  const remove = (i: number) =>
    onChange({ ...resume, awards: awards.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        resume={resume}
        onChange={onChange}
        headingKey="awards"
        defaultLabel="Awards"
      />

      {awards.map((award, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: controlled form list
        <div key={i} className="flex flex-col gap-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {award.title || `Award ${i + 1}`}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              aria-label="Remove award entry"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Title</Label>
              <Input
                value={award.title}
                onChange={(e) => update(i, "title", e.target.value)}
                placeholder="Award or certification name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Date</Label>
              <Input
                value={award.date}
                onChange={(e) => update(i, "date", e.target.value)}
                placeholder="Jun 2022"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Awarder</Label>
              <Input
                value={award.awarder}
                onChange={(e) => update(i, "awarder", e.target.value)}
                placeholder="Issuing organization"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Summary</Label>
              <Textarea
                value={award.summary}
                onChange={(e) => update(i, "summary", e.target.value)}
                placeholder="Brief description or link to certificate"
                rows={2}
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="w-fit gap-1"
      >
        <Plus className="h-4 w-4" />
        Add award
      </Button>
    </div>
  );
}
