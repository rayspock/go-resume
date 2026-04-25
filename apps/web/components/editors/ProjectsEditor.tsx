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

type Project = NonNullable<ResumeData["projects"]>[number];

export default function ProjectsEditor({ resume, onChange }: Props) {
  const projects = resume.projects ?? [];

  const add = () =>
    onChange({
      ...resume,
      projects: [
        ...projects,
        { name: "", keywords: [], description: "", url: "" },
      ],
    });

  const update = (
    i: number,
    field: keyof Project,
    value: string | string[],
  ) => {
    const next = [...projects];
    next[i] = { ...next[i], [field]: value };
    onChange({ ...resume, projects: next });
  };

  const remove = (i: number) =>
    onChange({ ...resume, projects: projects.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        resume={resume}
        onChange={onChange}
        headingKey="projects"
        defaultLabel="Projects"
      />

      {projects.map((p, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: controlled form list
        <div key={i} className="flex flex-col gap-3 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {p.name || `Project ${i + 1}`}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              aria-label="Remove project"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input
                value={p.name}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="Cool Project"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>URL</Label>
              <Input
                value={p.url}
                onChange={(e) => update(i, "url", e.target.value)}
                placeholder="https://github.com/…"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Keywords</Label>
            <Input
              value={p.keywords.join(", ")}
              onChange={(e) =>
                update(
                  i,
                  "keywords",
                  e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Go, React, Docker"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Textarea
              value={p.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="A brief description…"
              rows={2}
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
        Add project
      </Button>
    </div>
  );
}
