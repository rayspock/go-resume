"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/lib/api";
import SectionHeading from "./SectionHeading";

interface Props {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export default function ProfileEditor({ resume, onChange }: Props) {
  const defaults = {
    name: "",
    email: "",
    website: "",
    location: { address: "" },
    summaries: [""],
  };
  const basics = {
    ...defaults,
    ...resume.basics,
    location: { ...defaults.location, ...resume.basics?.location },
    summaries: resume.basics?.summaries ?? defaults.summaries,
  };

  const setBasics = (key: keyof typeof basics, value: string) =>
    onChange({ ...resume, basics: { ...basics, [key]: value } });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Personal Info
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={basics.name}
              onChange={(e) => setBasics("name", e.target.value)}
              placeholder="Alex Johnson"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={basics.email}
              onChange={(e) => setBasics("email", e.target.value)}
              placeholder="alex@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={basics.website}
              onChange={(e) => setBasics("website", e.target.value)}
              placeholder="example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={basics.location.address}
              onChange={(e) =>
                onChange({
                  ...resume,
                  basics: {
                    ...basics,
                    location: { address: e.target.value },
                  },
                })
              }
              placeholder="London"
            />
          </div>
        </div>
      </div>

      <div>
        <SectionHeading
          resume={resume}
          onChange={onChange}
          headingKey="summary"
          defaultLabel="Summary"
        />
        <Textarea
          value={basics.summaries.join("\n")}
          onChange={(e) =>
            onChange({
              ...resume,
              basics: {
                ...basics,
                summaries: e.target.value.split("\n").filter((l) => l.trim()),
              },
            })
          }
          placeholder="A brief professional summary…"
          rows={5}
        />
      </div>
    </div>
  );
}
