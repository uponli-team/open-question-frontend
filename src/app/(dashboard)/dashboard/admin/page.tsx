"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { z } from "zod";
import { toast } from "sonner";
import { uploadProblems } from "@/lib/api";
import FileUploader from "@/components/admin/FileUploader";
import DataPreviewTable from "@/components/admin/DataPreviewTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ProblemUploadSchema = z.object({
  problem: z.string().min(1, "Problem is required."),
  field: z.string().min(1, "Field is required."),
  keywords: z
    .array(z.string().min(1))
    .min(1, "Keywords must be a non-empty array."),
});

function getErrorMessage(err: unknown): string | null {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const maybe = (err as { message?: unknown }).message;
    if (typeof maybe === "string") return maybe;
  }
  return null;
}

function parseKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;|]/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeJsonRecord(record: unknown) {
  if (typeof record !== "object" || record === null) {
    return { problem: "", field: "", keywords: [] as string[] };
  }
  const rec = record as Record<string, unknown>;

  const problemValue = rec.problem ?? rec.question;
  const fieldValue = rec.field ?? rec.category;

  return {
    problem: typeof problemValue === "string" ? problemValue : "",
    field: typeof fieldValue === "string" ? fieldValue : "",
    keywords: parseKeywords(rec.keywords ?? rec.keywords_list),
  };
}

function normalizeCsvRow(row: Record<string, unknown>) {
  const lowered: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) lowered[k.toLowerCase()] = v;
  return {
    problem: (lowered.problem ?? lowered.question ?? "") as unknown as string,
    field: (lowered.field ?? lowered.category ?? "") as unknown as string,
    keywords: parseKeywords(lowered.keywords),
  };
}

export default function AdminPage() {
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rows, setRows] = useState<
    Array<{
      idx: number;
      problem?: string;
      field?: string;
      keywords?: string[];
      valid: boolean;
      error?: string;
    }>
  >([]);

  const validProblems = useMemo(() => {
    return rows
      .filter((r) => r.valid)
      .map((r) => ({
        problem: r.problem!,
        field: r.field!,
        keywords: r.keywords!,
      }));
  }, [rows]);

  async function parseFile(file: File) {
    setParsing(true);
    try {
      const text = await file.text();

      const ext = file.name.toLowerCase().split(".").pop();
      if (ext === "json") {
        const parsed = JSON.parse(text);
        const list: unknown[] = Array.isArray(parsed)
          ? parsed
          : Array.isArray((parsed as { problems?: unknown[] })?.problems)
            ? (parsed as { problems: unknown[] }).problems
            : [];

        const mapped = list.map((r) => normalizeJsonRecord(r));
        const nextRows = mapped.map((rec, idx) => {
          const result = ProblemUploadSchema.safeParse(rec);
          if (result.success) {
            return {
              idx,
              valid: true,
              problem: result.data.problem,
              field: result.data.field,
              keywords: result.data.keywords,
            };
          }
          return {
            idx,
            valid: false,
            problem: rec.problem,
            field: rec.field,
            keywords: rec.keywords,
            error: result.error.issues[0]?.message ?? "Invalid data",
          };
        });
        setRows(nextRows);
        toast.success(`Parsed ${nextRows.length} records.`);
        return;
      }

      if (ext === "csv") {
        const parsed = Papa.parse<Record<string, unknown>>(text, {
          header: true,
          skipEmptyLines: true,
        });

        const data = Array.isArray(parsed.data) ? parsed.data : [];
        const mapped = data.map((r) => normalizeCsvRow(r));
        const nextRows = mapped.map((rec, idx) => {
          const result = ProblemUploadSchema.safeParse(rec);
          if (result.success) {
            return {
              idx,
              valid: true,
              problem: result.data.problem,
              field: result.data.field,
              keywords: result.data.keywords,
            };
          }
          return {
            idx,
            valid: false,
            problem: rec.problem,
            field: rec.field,
            keywords: rec.keywords,
            error: result.error.issues[0]?.message ?? "Invalid data",
          };
        });
        setRows(nextRows);
        toast.success(`Parsed ${nextRows.length} records.`);
        return;
      }

      toast.error("Unsupported file type. Upload .csv or .json.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Failed to parse file.");
    } finally {
      setParsing(false);
    }
  }

  async function onUpload() {
    if (validProblems.length === 0) {
      toast.error("No valid records to upload.");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadProblems(validProblems);
      toast.success(`Upload complete. Inserted ${res.inserted} problems.`);
      setRows([]);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Admin Uploads
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Drag & drop a CSV or JSON file. We validate shape before simulating
          an API upload.
        </p>
      </div>

      <FileUploader onFileSelected={(file) => void parseFile(file)} />

      {parsing && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-semibold text-zinc-900">Parsing…</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      )}

      {!parsing && rows.length > 0 && (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-zinc-600">
              {rows.filter((r) => r.valid).length} valid out of{" "}
              <span className="font-semibold text-zinc-900">{rows.length}</span>
            </div>
            <Button
              onClick={() => void onUpload()}
              disabled={uploading || validProblems.length === 0}
              size="lg"
            >
              {uploading ? "Uploading…" : `Upload valid records (${validProblems.length})`}
            </Button>
          </div>

          <DataPreviewTable rows={rows} />
        </>
      )}
    </div>
  );
}

