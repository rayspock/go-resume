"use client";

import { type ResumeData, renderPreview } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  resume: ResumeData;
}

export default function ResumePreview({ resume: data }: Props) {
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serialized = useMemo(() => JSON.stringify(data), [data]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const result = await renderPreview(
          JSON.parse(serialized) as ResumeData,
        );
        setHtml(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Preview unavailable");
      }
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [serialized]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
        Preview will appear here…
      </div>
    );
  }

  // Use an iframe + srcDoc so the template's embedded <style> is fully
  // isolated from Tailwind preflight and the surrounding app styles.
  // A4: 210 mm ≈ 794 px wide, 297 mm ≈ 1123 px tall.
  return (
    <div className="flex justify-center">
      <div
        className="rounded-sm bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)]"
        style={{ width: 794 }}
      >
        <iframe
          title="Resume Preview"
          srcDoc={html}
          style={{
            width: 794,
            minHeight: 1123,
            border: "none",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
