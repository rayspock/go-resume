"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/lib/api";
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

  const setSkills = (keywords: string[]) =>
    onChange({
      ...resume,
      skills: [{ name: "Skills", keywords }],
    });

  const keywords = resume.skills[0]?.keywords ?? [];

  return (
    <div className="flex flex-col gap-4">
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkillListInput skills={keywords} onChange={setSkills} />
        </CardContent>
      </Card>
    </div>
  );
}
