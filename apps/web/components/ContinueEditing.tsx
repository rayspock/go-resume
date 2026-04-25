"use client";

import { buttonVariants } from "@/components/ui/button";
import { STORAGE_KEY } from "@/lib/config";
import { cn } from "@/lib/utils";
import { PenLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ContinueEditing() {
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // Only show if the user has entered a name
        if (data?.basics?.name) setHasDraft(true);
      }
    } catch {}
  }, []);

  if (!hasDraft) return null;

  return (
    <Link
      href="/editor"
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "gap-2 px-8 text-base border-blue-500/30 text-blue-500 hover:bg-blue-500/10",
      )}
    >
      <PenLine className="h-4 w-4" />
      Continue Editing
    </Link>
  );
}
