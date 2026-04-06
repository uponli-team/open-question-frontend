import type { Problem } from "@/types/problem";
import {
  addMockProblems,
  getMockProblemById,
  getMockProblems,
} from "@/lib/mock";

export type ListProblemsParams = {
  page: number;
  limit: number;
  query?: string;
  field?: string;
};

export type ListProblemsResult = {
  items: Problem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  fields: string[];
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function getProblemFields(): string[] {
  const fields = new Set<string>();
  for (const p of getMockProblems()) fields.add(p.field);
  return Array.from(fields).sort((a, b) => a.localeCompare(b));
}

export async function listProblems({
  page,
  limit,
  query,
  field,
}: ListProblemsParams): Promise<ListProblemsResult> {
  // Mock API: simulate network latency and backend pagination.
  await new Promise((r) => setTimeout(r, 250));

  const all = [...getMockProblems()].sort((a, b) => {
    const ad = a.created_at ? Date.parse(a.created_at) : 0;
    const bd = b.created_at ? Date.parse(b.created_at) : 0;
    return bd - ad;
  });

  const q = query ? normalize(query) : "";
  const filtered = all.filter((p) => {
    if (field && p.field !== field) return false;
    if (!q) return true;
    const haystack = [
      p.problem,
      p.field,
      ...(p.keywords ?? []),
    ].join(" ");
    return normalize(haystack).includes(q);
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  const end = start + limit;

  return {
    items: filtered.slice(start, end),
    total,
    page: safePage,
    limit,
    totalPages,
    fields: getProblemFields(),
  };
}

export async function getProblemById(id: string) {
  await new Promise((r) => setTimeout(r, 120));
  return getMockProblemById(id);
}

export async function uploadProblems(
  incoming: Array<Omit<Problem, "id" | "created_at">>,
): Promise<{ inserted: number }> {
  // Mock API: validate shape before calling this function.
  await new Promise((r) => setTimeout(r, 500));
  const inserted = addMockProblems(incoming).length;

  // Realtime fallback for local dev: notify listeners.
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("oqd:problems_updated", {
        detail: { inserted },
      }),
    );
  }

  return { inserted };
}

