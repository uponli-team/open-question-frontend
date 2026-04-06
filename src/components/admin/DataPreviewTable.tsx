"use client";

import ValidationBadge from "@/components/admin/ValidationBadge";

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export default function DataPreviewTable({
  rows,
}: {
  rows: Array<{
    idx: number;
    problem?: string;
    field?: string;
    keywords?: string[];
    valid: boolean;
    error?: string;
  }>;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-50">
            <tr className="text-xs font-semibold text-zinc-600">
              <th className="px-4 py-3">Problem</th>
              <th className="px-4 py-3">Field</th>
              <th className="px-4 py-3">Keywords</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.idx}
                className="border-t border-zinc-100 last:border-b"
              >
                <td className="max-w-[360px] px-4 py-3 align-top">
                  <div className="text-zinc-900">
                    {r.problem ? truncate(r.problem, 120) : "—"}
                  </div>
                  {!r.valid && r.error && (
                    <div className="mt-1 text-xs text-red-700">
                      {r.error}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-zinc-700">
                  {r.field ?? "—"}
                </td>
                <td className="px-4 py-3 align-top text-zinc-700">
                  {r.keywords && r.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {r.keywords.slice(0, 6).map((k) => (
                        <span
                          key={k}
                          className="rounded-full bg-zinc-100 px-2 py-1 text-[11px]"
                        >
                          {k}
                        </span>
                      ))}
                      {r.keywords.length > 6 && (
                        <span className="text-[11px] text-zinc-500">
                          +{r.keywords.length - 6} more
                        </span>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <ValidationBadge valid={r.valid} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

