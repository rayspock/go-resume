"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ResumeData, isResumeData } from "@/lib/api";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ResumeData) => void;
}

export default function ImportJsonDialog({
  open,
  onOpenChange,
  onImport,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(reader.result as string);
        if (!isResumeData(parsed)) {
          setError(
            "Invalid resume format. JSON must contain basics.name and sections array.",
          );
          return;
        }
        onImport(parsed);
        onOpenChange(false);
      } catch {
        setError("Failed to parse JSON file. Please check the format.");
      }
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setError(null);
      if (inputRef.current) inputRef.current.value = "";
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Resume from JSON</DialogTitle>
          <DialogDescription>
            Upload a JSON file matching the resume format to populate the
            editor.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="json-file">JSON file</Label>
            <Input
              ref={inputRef}
              id="json-file"
              type="file"
              accept=".json,application/json"
              onChange={handleFile}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="button"
            variant="outline"
            className="w-fit gap-2"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Choose file
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
