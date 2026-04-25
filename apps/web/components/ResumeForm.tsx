"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import SkillListInput from "./SkillListInput";

interface Props {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export default function ResumeForm({ resume, onChange }: Props) {
  const setBasics = (key: keyof ResumeData["basics"], value: string) =>
    onChange({
      ...resume,
      basics: { ...resume.basics, [key]: value },
    });

  const setAddress = (value: string) =>
    onChange({
      ...resume,
      basics: { ...resume.basics, location: { address: value } },
    });

  const setSummary = (value: string) =>
    onChange({
      ...resume,
      basics: { ...resume.basics, summaries: [value] },
    });

  // ── Skills helpers ──
  const addSkillGroup = () =>
    onChange({
      ...resume,
      skills: [...resume.skills, { name: "", keywords: [] }],
    });

  const updateSkillGroup = (
    i: number,
    field: "name" | "keywords",
    value: string | string[],
  ) => {
    const next = [...resume.skills];
    next[i] = { ...next[i], [field]: value };
    onChange({ ...resume, skills: next });
  };

  const removeSkillGroup = (i: number) =>
    onChange({
      ...resume,
      skills: resume.skills.filter((_, idx) => idx !== i),
    });

  // ── Work helpers ──
  const addWork = () =>
    onChange({
      ...resume,
      work: [
        ...resume.work,
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

  const updateWork = (
    i: number,
    field: keyof ResumeData["work"][number],
    value: string | string[],
  ) => {
    const next = [...resume.work];
    next[i] = { ...next[i], [field]: value };
    onChange({ ...resume, work: next });
  };

  const removeWork = (i: number) =>
    onChange({ ...resume, work: resume.work.filter((_, idx) => idx !== i) });

  // ── Project helpers ──
  const addProject = () =>
    onChange({
      ...resume,
      projects: [
        ...resume.projects,
        { name: "", keywords: [], description: "", url: "" },
      ],
    });

  const updateProject = (
    i: number,
    field: keyof ResumeData["projects"][number],
    value: string | string[],
  ) => {
    const next = [...resume.projects];
    next[i] = { ...next[i], [field]: value };
    onChange({ ...resume, projects: next });
  };

  const removeProject = (i: number) =>
    onChange({
      ...resume,
      projects: resume.projects.filter((_, idx) => idx !== i),
    });

  // ── Education helpers ──
  const addEducation = () =>
    onChange({
      ...resume,
      education: [
        ...resume.education,
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

  const updateEducation = (
    i: number,
    field: keyof ResumeData["education"][number],
    value: string,
  ) => {
    const next = [...resume.education];
    next[i] = { ...next[i], [field]: value };
    onChange({ ...resume, education: next });
  };

  const removeEducation = (i: number) =>
    onChange({
      ...resume,
      education: resume.education.filter((_, idx) => idx !== i),
    });

  return (
    <div className="flex flex-col gap-4">
      {/* ── Personal Info ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Personal Info
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={resume.basics.name}
              onChange={(e) => setBasics("name", e.target.value)}
              placeholder="Alex Johnson"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={resume.basics.email}
              onChange={(e) => setBasics("email", e.target.value)}
              placeholder="alex@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={resume.basics.website}
              onChange={(e) => setBasics("website", e.target.value)}
              placeholder="example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={resume.basics.linkedin}
              onChange={(e) => setBasics("linkedin", e.target.value)}
              placeholder="linkedin.com/in/username"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={resume.basics.location.address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="London"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Summary ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={resume.basics.summaries[0] ?? ""}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A brief professional summary…"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* ── Skills ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {resume.skills.map((group, i) => (
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
                  onClick={() => removeSkillGroup(i)}
                  aria-label="Remove skill group"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Input
                  value={group.name}
                  onChange={(e) => updateSkillGroup(i, "name", e.target.value)}
                  placeholder="Languages, Frameworks, Tools…"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Keywords</Label>
                <SkillListInput
                  skills={group.keywords}
                  onChange={(kw) => updateSkillGroup(i, "keywords", kw)}
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSkillGroup}
            className="w-fit gap-1"
          >
            <Plus className="h-4 w-4" />
            Add skill group
          </Button>
        </CardContent>
      </Card>

      {/* ── Work Experience ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Work Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {resume.work.map((w, i) => (
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
                  onClick={() => removeWork(i)}
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
                    onChange={(e) => updateWork(i, "position", e.target.value)}
                    placeholder="Senior Engineer"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Company</Label>
                  <Input
                    value={w.company}
                    onChange={(e) => updateWork(i, "company", e.target.value)}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Location</Label>
                  <Input
                    value={w.location}
                    onChange={(e) => updateWork(i, "location", e.target.value)}
                    placeholder="London, UK"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label>Start</Label>
                    <Input
                      value={w.startDate}
                      onChange={(e) =>
                        updateWork(i, "startDate", e.target.value)
                      }
                      placeholder="Jan 2022"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label>End</Label>
                    <Input
                      value={w.endDate}
                      onChange={(e) => updateWork(i, "endDate", e.target.value)}
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
                    updateWork(
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
            onClick={addWork}
            className="w-fit gap-1"
          >
            <Plus className="h-4 w-4" />
            Add position
          </Button>
        </CardContent>
      </Card>

      {/* ── Projects ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {resume.projects.map((p, i) => (
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
                  onClick={() => removeProject(i)}
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
                    onChange={(e) => updateProject(i, "name", e.target.value)}
                    placeholder="Cool Project"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>URL</Label>
                  <Input
                    value={p.url}
                    onChange={(e) => updateProject(i, "url", e.target.value)}
                    placeholder="https://github.com/…"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Keywords</Label>
                <Input
                  value={p.keywords.join(", ")}
                  onChange={(e) =>
                    updateProject(
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
                  onChange={(e) =>
                    updateProject(i, "description", e.target.value)
                  }
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
            onClick={addProject}
            className="w-fit gap-1"
          >
            <Plus className="h-4 w-4" />
            Add project
          </Button>
        </CardContent>
      </Card>

      {/* ── Education ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Education
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {resume.education.map((edu, i) => (
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
                  onClick={() => removeEducation(i)}
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
                    onChange={(e) =>
                      updateEducation(i, "institution", e.target.value)
                    }
                    placeholder="University of Example"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Degree</Label>
                  <Input
                    value={edu.studyType}
                    onChange={(e) =>
                      updateEducation(i, "studyType", e.target.value)
                    }
                    placeholder="Master of Computer Science"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Area</Label>
                  <Input
                    value={edu.area}
                    onChange={(e) => updateEducation(i, "area", e.target.value)}
                    placeholder="Medical Informatics"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>GPA</Label>
                  <Input
                    value={edu.gpa}
                    onChange={(e) => updateEducation(i, "gpa", e.target.value)}
                    placeholder="3.84 / 4 GPA"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Start</Label>
                  <Input
                    value={edu.startDate}
                    onChange={(e) =>
                      updateEducation(i, "startDate", e.target.value)
                    }
                    placeholder="Sep 2010"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>End</Label>
                  <Input
                    value={edu.endDate}
                    onChange={(e) =>
                      updateEducation(i, "endDate", e.target.value)
                    }
                    placeholder="Jul 2012"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEducation}
            className="w-fit gap-1"
          >
            <Plus className="h-4 w-4" />
            Add education
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
