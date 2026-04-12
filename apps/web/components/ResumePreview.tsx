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

  return (
    /* Outer container: A4 aspect ratio, scrollable */
    <div className="overflow-auto rounded-lg border bg-white shadow-sm">
      {/* Scale the A4 page (210 mm ≈ 794 px) to fit the panel */}
      {/* Render server-generated resume HTML — content is trusted (own backend) */}
      <div
        style={{ width: 794, transformOrigin: "top left" }}
        className="pointer-events-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
