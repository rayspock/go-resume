"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface Props {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillListInput({ skills, onChange }: Props) {
  const update = (i: number, val: string) => {
    const next = [...skills];
    next[i] = val;
    onChange(next);
  };

  const remove = (i: number) => onChange(skills.filter((_, idx) => idx !== i));
  const add = () => onChange([...skills, ""]);

  return (
    <div className="flex flex-col gap-2">
      {skills.map((skill, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: controlled form list, reordering is not supported
        <div key={i} className="flex gap-2">
          <Input
            value={skill}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Skill ${i + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(i)}
            aria-label="Remove skill"
          >
            <X className="h-4 w-4" />
          </Button>
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
        Add skill
      </Button>
    </div>
  );
}
