import { buttonVariants } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Download, FileText, Upload, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-24">
      <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
          <FileText className="h-8 w-8" />
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            <span className="text-blue-500">{APP_NAME}</span>
            <br />
            build, preview, export PDF
          </h1>
          <p className="text-lg text-muted-foreground">
            Fill in a simple form, see a live preview, and export a
            pixel-perfect A4 PDF — powered by headless Chrome.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          <Link
            href="/editor"
            className={cn(
              buttonVariants({ size: "lg" }),
              "gap-2 px-8 text-base",
            )}
          >
            <FileText className="h-4 w-4" />
            New Resume
          </Link>
          <Link
            href="/editor?import=true"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "gap-2 px-8 text-base",
            )}
          >
            <Upload className="h-4 w-4" />
            Import JSON
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-blue-500" />
            Live preview
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 shadow-sm">
            <Download className="h-3.5 w-3.5 text-blue-500" />
            One-click PDF export
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 shadow-sm">
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            A4-ready layout
          </span>
        </div>
      </div>
    </div>
  );
}
