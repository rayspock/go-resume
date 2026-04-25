"use client";

import { type ResumeData, renderPreview } from "@/lib/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

interface Props {
  resume: ResumeData;
}

export default function ResumePreview({ resume: data }: Props) {
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [iframeHeight, setIframeHeight] = useState(A4_HEIGHT);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serialized = useMemo(() => JSON.stringify(data), [data]);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const available = containerRef.current.clientWidth;
    setScale(available >= A4_WIDTH ? 1 : available / A4_WIDTH);
  }, []);

  const syncHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    const h = iframe.contentDocument.body.scrollHeight;
    setIframeHeight(Math.max(h, A4_HEIGHT));
  }, []);

  useEffect(() => {
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

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
  // The iframe is always rendered at full A4 size and scaled down via
  // CSS transform when the container is narrower.
  const scaledW = Math.round(A4_WIDTH * scale);
  const scaledH = Math.round(iframeHeight * scale);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div
        className="mx-auto overflow-hidden rounded-sm bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)]"
        style={{ width: scaledW, height: scaledH }}
      >
        <iframe
          ref={iframeRef}
          title="Resume Preview"
          srcDoc={html}
          onLoad={syncHeight}
          style={{
            width: A4_WIDTH,
            height: iframeHeight,
            border: "none",
            display: "block",
            overflow: "hidden",
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        />
      </div>
    </div>
  );
}
