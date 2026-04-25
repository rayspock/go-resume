"use client";

import SkillListInput from "@/components/SkillListInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResumeData } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import SectionHeading from "./SectionHeading";

interface Props {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export default function SkillsEditor({ resume, onChange }: Props) {
  const skills = resume.skills ?? [];

  const add = () =>
    onChange({ ...resume, skills: [...skills, { name: "", keywords: [] }] });

  const update = (
    i: number,
    field: "name" | "keywords",
    value: string | string[],
  ) => {
    const next = [...skills];
    next[i] = { ...next[i], [field]: value };
    onChange({ ...resume, skills: next });
  };

  const remove = (i: number) =>
    onChange({ ...resume, skills: skills.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        resume={resume}
        onChange={onChange}
        headingKey="skills"
        defaultLabel="Skills"
      />

      {skills.map((group, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: controlled form list
        <div key={i} className="flex flex-col gap-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {group.name || `Group ${i + 1}`}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              aria-label="Remove skill group"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Input
              value={group.name}
              onChange={(e) => update(i, "name", e.target.value)}
              placeholder="Languages, Frameworks, Tools…"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Keywords</Label>
            <SkillListInput
              skills={group.keywords}
              onChange={(kw) => update(i, "keywords", kw)}
            />
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
        Add skill group
      </Button>
    </div>
  );
}
