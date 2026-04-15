import type { Problem } from "@/types/problem";
import {
  addMockProblems,
  getMockProblemById,
  getMockProblems,
} from "@/lib/mock";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

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

const DEPLOYED_BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_OPEN_QUESTION_API_BASE_URL?.trim() ||
  "https://open-question-backend.onrender.com";

type BackendOpenQuestion = {
  id: string;
  title?: string | null;
  extracted_text?: string | null;
  structured_summary?: string | null;
  category?: string | null;
  source_type?: string | null;
  unsolved_indicators?: unknown;
  croissant_metadata?: unknown;
  created_at?: string | null;
};

export type AdminUserProfile = {
  id: string;
  email: string;
  role: string;
  created_at?: string;
};

export type AdminOverview = {
  papers: number;
  openQuestions: number;
  userProfiles: number;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function keywordsFromUnknown(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim())
      .filter(Boolean);
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;|]/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function mapBackendQuestionToProblem(item: BackendOpenQuestion): Problem {
  const primaryText =
    item.title?.trim() || item.extracted_text?.trim() || "Untitled open question";
  const field =
    item.category?.trim() || item.source_type?.trim() || "Uncategorized";

  const fromIndicators = keywordsFromUnknown(item.unsolved_indicators);
  const fromMetadata = keywordsFromUnknown(item.croissant_metadata);
  const keywords = Array.from(new Set([...fromIndicators, ...fromMetadata])).slice(0, 8);

  return {
    id: item.id,
    problem: primaryText,
    field,
    keywords: keywords.length > 0 ? keywords : ["open-question"],
    created_at: item.created_at ?? undefined,
  };
}

async function fetchBackendOpenQuestions(): Promise<Problem[]> {
  const res = await fetch(`${DEPLOYED_BACKEND_BASE_URL}/api/open_questions`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Backend request failed (${res.status})`);
  }
  const data = (await res.json()) as { results?: BackendOpenQuestion[] };
  const results = Array.isArray(data.results) ? data.results : [];
  return results.map(mapBackendQuestionToProblem);
}

async function getSupabaseAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const supabase = createBrowserSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function backendRequest<T>({
  path,
  method = "GET",
  body,
  requireAuth = false,
}: {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  requireAuth?: boolean;
}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = await getSupabaseAccessToken();
    if (!token) {
      throw new Error("You must be signed in to perform this action.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${DEPLOYED_BACKEND_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let parsed: unknown = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { message: text };
  }

  if (!res.ok) {
    const msg =
      typeof parsed === "object" && parsed && "error" in parsed
        ? String((parsed as { error?: unknown }).error)
        : `Backend request failed (${res.status})`;
    throw new Error(msg);
  }

  return parsed as T;
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
  let sourceProblems: Problem[];
  try {
    sourceProblems = await fetchBackendOpenQuestions();
  } catch {
    // Fallback to local mock data when backend is unavailable.
    await new Promise((r) => setTimeout(r, 250));
    sourceProblems = [...getMockProblems()];
  }

  const all = [...sourceProblems].sort((a, b) => {
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
    fields: Array.from(new Set(all.map((p) => p.field))).sort((a, b) =>
      a.localeCompare(b),
    ),
  };
}

export async function getProblemById(id: string) {
  try {
    const res = await fetch(
      `${DEPLOYED_BACKEND_BASE_URL}/api/open_questions?id=${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );
    if (res.ok) {
      const data = (await res.json()) as { results?: BackendOpenQuestion[] };
      const first = Array.isArray(data.results) ? data.results[0] : undefined;
      if (first) return mapBackendQuestionToProblem(first);
    }
  } catch {
    // Fallback below.
  }

  await new Promise((r) => setTimeout(r, 120));
  return getMockProblemById(id);
}

export async function uploadProblems(
  incoming: Array<Omit<Problem, "id" | "created_at">>,
): Promise<{ inserted: number }> {
  let inserted = 0;
  try {
    for (const row of incoming) {
      const paper = await backendRequest<{ id: string }>({
        path: "/api/papers",
        method: "POST",
        body: { title: row.problem },
        requireAuth: true,
      });

      await backendRequest({
        path: "/api/open_questions",
        method: "POST",
        body: {
          paper_id: paper.id,
          title: row.problem,
          extracted_text: row.problem,
          category: row.field,
          source_type: "oqd-upload",
          unsolved_indicators: row.keywords,
        },
        requireAuth: true,
      });

      inserted += 1;
    }
  } catch {
    // Fallback to local mock when backend write is unavailable.
    await new Promise((r) => setTimeout(r, 400));
    inserted = addMockProblems(incoming).length;
  }

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

export async function listUserProfiles(): Promise<AdminUserProfile[]> {
  const data = await backendRequest<{ results?: AdminUserProfile[] }>({
    path: "/api/user_profiles",
    method: "GET",
    requireAuth: true,
  });
  return Array.isArray(data.results) ? data.results : [];
}

export async function createUserProfile(input: {
  email: string;
  role: string;
}): Promise<AdminUserProfile> {
  return backendRequest<AdminUserProfile>({
    path: "/api/user_profiles",
    method: "POST",
    requireAuth: true,
    body: input,
  });
}

export async function updateUserProfileRole(input: {
  id: string;
  role: string;
}): Promise<AdminUserProfile> {
  return backendRequest<AdminUserProfile>({
    path: `/api/user_profiles?id=${encodeURIComponent(input.id)}`,
    method: "PUT",
    requireAuth: true,
    body: { role: input.role },
  });
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [papers, openQuestions, userProfiles] = await Promise.all([
    backendRequest<{ count?: number }>({ path: "/api/papers", method: "GET" }),
    backendRequest<{ count?: number }>({
      path: "/api/open_questions",
      method: "GET",
    }),
    backendRequest<{ count?: number }>({
      path: "/api/user_profiles",
      method: "GET",
      requireAuth: true,
    }).catch(() => ({ count: 0 })),
  ]);

  return {
    papers: Number(papers.count ?? 0),
    openQuestions: Number(openQuestions.count ?? 0),
    userProfiles: Number(userProfiles.count ?? 0),
  };
}

