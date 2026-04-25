"use client";

import { cn } from "@/lib/utils";
import {
  Briefcase,
  FolderOpen,
  GraduationCap,
  LayoutTemplate,
  ListChecks,
  User,
} from "lucide-react";

export type SectionId =
  | "templates"
  | "profile"
  | "skills"
  | "work"
  | "projects"
  | "education";

const SECTIONS: {
  id: SectionId;
  label: string;
  Icon: React.ElementType;
}[] = [
  { id: "templates", label: "Template", Icon: LayoutTemplate },
  { id: "profile", label: "Profile", Icon: User },
  { id: "skills", label: "Skills", Icon: ListChecks },
  { id: "work", label: "Experience", Icon: Briefcase },
  { id: "projects", label: "Projects", Icon: FolderOpen },
  { id: "education", label: "Education", Icon: GraduationCap },
];

interface Props {
  active: SectionId;
  onChange: (id: SectionId) => void;
}

export default function SectionNav({ active, onChange }: Props) {
  return (
    <nav className="flex w-[72px] shrink-0 flex-col items-center gap-1 border-r bg-card py-3">
      {SECTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex w-full flex-col items-center gap-1 rounded-lg px-1 py-3 text-center transition-colors",
            active === id
              ? "bg-blue-50 text-blue-600"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-tight">{label}</span>
        </button>
      ))}
    </nav>
  );
}
