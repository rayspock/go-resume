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

type WorkEntry = NonNullable<ResumeData["work"]>[number];

export default function ExperienceEditor({ resume, onChange }: Props) {
  const work = resume.work ?? [];

  const add = () =>
    onChange({
      ...resume,
      work: [
        ...work,
        {
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          highlights: [""],
        },
      ],
    });

  const update = (
    i: number,
    field: keyof WorkEntry,
    value: string | string[],
  ) => {
    const next = [...work];
    next[i] = { ...next[i], [field]: value };
    onChange({ ...resume, work: next });
  };

  const remove = (i: number) =>
    onChange({ ...resume, work: work.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        resume={resume}
        onChange={onChange}
        headingKey="work"
        defaultLabel="Experience"
      />

      {work.map((w, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: controlled form list
        <div key={i} className="flex flex-col gap-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {w.position || w.company || `Position ${i + 1}`}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              aria-label="Remove work entry"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Position</Label>
              <Input
                value={w.position}
                onChange={(e) => update(i, "position", e.target.value)}
                placeholder="Senior Engineer"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Company</Label>
              <Input
                value={w.company}
                onChange={(e) => update(i, "company", e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Location</Label>
              <Input
                value={w.location}
                onChange={(e) => update(i, "location", e.target.value)}
                placeholder="London, UK"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label>Start</Label>
                <Input
                  value={w.startDate}
                  onChange={(e) => update(i, "startDate", e.target.value)}
                  placeholder="Jan 2022"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label>End</Label>
                <Input
                  value={w.endDate}
                  onChange={(e) => update(i, "endDate", e.target.value)}
                  placeholder="Present"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Highlights</Label>
            <Textarea
              value={w.highlights.join("\n")}
              onChange={(e) =>
                update(
                  i,
                  "highlights",
                  e.target.value.split("\n").filter((l) => l.trim()),
                )
              }
              placeholder="One achievement per line…"
              rows={3}
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
        Add position
      </Button>
    </div>
  );
}
