"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

export default function FileUploader({
  onFileSelected,
}: {
  onFileSelected: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-8 transition-all duration-200 ${
        dragActive
          ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
          : "border-zinc-300 bg-white"
      }`}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelected(file);
      }}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-semibold text-zinc-950">
            Upload a CSV or JSON file
          </div>
          <div className="mt-1 text-sm text-zinc-600">
            Drag & drop, or browse. CSV uses a header row with `problem`,
            `field`, and `keywords`.
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </Button>
          <div className="text-xs text-zinc-500">
            Accepted: <span className="font-medium">.csv</span>,{" "}
            <span className="font-medium">.json</span>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json,application/json,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
    </div>
  );
}

