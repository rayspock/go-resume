const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// ResumeData mirrors model/resume.go — keep in sync when adding fields.
export interface ResumeData {
  selectedTemplate: number;
  headings?: Record<string, string>;
  basics: {
    name: string;
    email: string;
    website: string;
    location: { address: string };
    summaries: string[];
  };
  skills?: Array<{ name: string; keywords: string[]; level?: string }>;
  work?: Array<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    highlights: string[];
  }>;
  projects?: Array<{
    name: string;
    keywords: string[];
    description: string;
    url: string;
  }>;
  education?: Array<{
    institution: string;
    location: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }>;
  awards?: Array<{
    title: string;
    date: string;
    summary: string;
    awarder: string;
  }>;
  sections: string[];
}

/** Runtime type guard — validates minimal shape so we don't blindly trust JSON.parse output. */
export function isResumeData(value: unknown): value is ResumeData {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.basics === "object" &&
    obj.basics !== null &&
    typeof (obj.basics as Record<string, unknown>).name === "string" &&
    Array.isArray(obj.sections)
  );
}

/** POST to /resume/pdf, then trigger a browser download of the returned blob. */
export async function generatePDF(data: ResumeData): Promise<void> {
  const res = await fetch(`${API_BASE}/resume/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`PDF generation failed: ${msg}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.pdf";
  a.click();
  URL.revokeObjectURL(url);
}

/** POST to /resume/html, returns the rendered HTML string for live preview. */
export async function renderPreview(data: ResumeData): Promise<string> {
  const res = await fetch(`${API_BASE}/resume/html`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Preview render failed: ${msg}`);
  }

  return res.text();
}
