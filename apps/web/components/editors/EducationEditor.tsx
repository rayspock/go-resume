"use client";

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

type EducationEntry = NonNullable<ResumeData["education"]>[number];

export default function EducationEditor({ resume, onChange }: Props) {
  const education = resume.education ?? [];

  const add = () =>
    onChange({
      ...resume,
      education: [
        ...education,
        {
          institution: "",
          area: "",
          studyType: "",
          startDate: "",
          endDate: "",
          gpa: "",
        },
      ],
    });

  const update = (i: number, field: keyof EducationEntry, value: string) => {
    const next = [...education];
    next[i] = { ...next[i], [field]: value };
    onChange({ ...resume, education: next });
  };

  const remove = (i: number) =>
    onChange({ ...resume, education: education.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        resume={resume}
        onChange={onChange}
        headingKey="education"
        defaultLabel="Education"
      />

      {education.map((edu, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: controlled form list
        <div key={i} className="flex flex-col gap-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {edu.institution || `Education ${i + 1}`}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              aria-label="Remove education entry"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Institution</Label>
              <Input
                value={edu.institution}
                onChange={(e) => update(i, "institution", e.target.value)}
                placeholder="University of Example"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Degree</Label>
              <Input
                value={edu.studyType}
                onChange={(e) => update(i, "studyType", e.target.value)}
                placeholder="BSc"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Area</Label>
              <Input
                value={edu.area}
                onChange={(e) => update(i, "area", e.target.value)}
                placeholder="Computer Science"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>GPA</Label>
              <Input
                value={edu.gpa}
                onChange={(e) => update(i, "gpa", e.target.value)}
                placeholder="3.8 / 4.0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Start</Label>
              <Input
                value={edu.startDate}
                onChange={(e) => update(i, "startDate", e.target.value)}
                placeholder="Sep 2018"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>End</Label>
              <Input
                value={edu.endDate}
                onChange={(e) => update(i, "endDate", e.target.value)}
                placeholder="Jun 2022"
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
        Add education
      </Button>
    </div>
  );
}
