"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  value: number;
  onChange: (id: number) => void;
}

// Add new template options here as they are created.
const TEMPLATES = [{ id: 1, label: "Classic" }];

export default function TemplateSelector({ value, onChange }: Props) {
  const selected = TEMPLATES.find((t) => t.id === value);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="template-select">Template</Label>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger id="template-select" className="w-48">
          <SelectValue placeholder="Select template">
            {selected?.label ?? "Select template"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TEMPLATES.map((t) => (
            <SelectItem key={t.id} value={String(t.id)}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
