import type { Problem } from "@/types/problem";
import {
  addMockProblems,
  deleteMockProblem,
  getMockProblemById,
  getMockProblems,
  updateMockProblem,
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
  is_active?: boolean;
  subscription_status?: string;
  created_at?: string;
};

export type AdminOverview = {
  papers: number;
  openQuestions: number;
  userProfiles: number;
};

function normalizeRoleValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function hasAdminAccess(role: unknown): boolean {
  const normalized = normalizeRoleValue(role);
  return normalized === "admin" || normalized === "superadmin" || normalized === "owner";
}

function mapAdminUserProfile(item: AdminUserProfile): AdminUserProfile {
  const rawStatus = String((item as { status?: unknown }).status ?? "").toLowerCase();
  const rawActive = (item as { active?: unknown }).active;
  const rawSub = String((item as { subscription_status?: unknown }).subscription_status ?? "").toLowerCase();

  return {
    ...item,
    role: normalizeRoleValue(item.role || "user") || "user",
    is_active:
      typeof item.is_active === "boolean"
        ? item.is_active
        : typeof rawActive === "boolean"
          ? rawActive
          : rawStatus
            ? rawStatus === "active" || rawStatus === "enabled"
            : true,
    subscription_status: item.subscription_status || rawSub || "inactive",
  };
}

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

async function fetchBackendOpenQuestions(
  query?: { [key: string]: string | number | boolean },
): Promise<Problem[]> {
  const token = await getSupabaseAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const qs = query ? `?${new URLSearchParams(query as Record<string, string>).toString()}` : "";
  const res = await fetch(`${DEPLOYED_BACKEND_BASE_URL}/api/open_questions${qs}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Backend request failed (${res.status})`);
  }
  const data = (await res.json()) as { results?: BackendOpenQuestion[] };
  const results = Array.isArray(data.results) ? data.results : [];
  return results.map(mapBackendQuestionToProblem);
}

const ACCESS_TOKEN_CACHE_TTL_MS = 15000;
let accessTokenCache:
  | { token: string; userId: string; at: number }
  | null = null;

async function getSupabaseAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const supabase = createBrowserSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? null;
  const userId = data.session?.user?.id ?? "";
  const now = Date.now();

  if (
    accessTokenCache &&
    accessTokenCache.userId === userId &&
    token &&
    now - accessTokenCache.at < ACCESS_TOKEN_CACHE_TTL_MS
  ) {
    return accessTokenCache.token;
  }

  if (token) {
    accessTokenCache = { token, userId, at: now };
  } else {
    accessTokenCache = null;
  }

  return token;
}

async function backendRequest<T>({
  path,
  method = "GET",
  body,
  requireAuth = false,
}: {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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
    const backendProblems = await fetchBackendOpenQuestions();
    // Keep locally uploaded fallback rows visible while backend sync is pending.
    const localUploads = getMockProblems().filter((p) => p.id.startsWith("user-"));
    sourceProblems = [...localUploads, ...backendProblems];
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
    const token = await getSupabaseAccessToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
      `${DEPLOYED_BACKEND_BASE_URL}/api/open_questions?id=${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers,
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
  return Array.isArray(data.results) ? data.results.map(mapAdminUserProfile) : [];
}

export async function createUserProfile(input: {
  email: string;
  role: string;
}): Promise<AdminUserProfile> {
  const created = await backendRequest<AdminUserProfile>({
    path: "/api/user_profiles",
    method: "POST",
    requireAuth: true,
    body: input,
  });
  return mapAdminUserProfile(created);
}

export async function updateUserProfileRole(input: {
  id: string;
  role: string;
}): Promise<AdminUserProfile> {
  const attempts: Array<{
    path: string;
    method: "PUT" | "PATCH";
    body: unknown;
  }> = [
    {
      path: `/api/user_profiles/${encodeURIComponent(input.id)}`,
      method: "PUT",
      body: { role: input.role },
    },
    {
      path: `/api/user_profiles?id=${encodeURIComponent(input.id)}`,
      method: "PUT",
      body: { role: input.role },
    },
    {
      path: "/api/user_profiles",
      method: "PUT",
      body: { id: input.id, role: input.role },
    },
    {
      path: `/api/user_profiles/${encodeURIComponent(input.id)}`,
      method: "PATCH",
      body: { role: input.role },
    },
    {
      path: "/api/user_profiles",
      method: "PATCH",
      body: { id: input.id, role: input.role },
    },
  ];

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      const updated = await backendRequest<AdminUserProfile>({
        path: attempt.path,
        method: attempt.method,
        requireAuth: true,
        body: attempt.body,
      });
      return mapAdminUserProfile(updated);
    } catch (err: unknown) {
      lastError = err;
      const msg =
        err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (msg.includes("404") || msg.includes("400") || msg.includes("not found") || msg.includes("bad request")) continue;
      break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to update user role.");
}

export async function updateUserProfileStatus(input: {
  id: string;
  isActive: boolean;
}): Promise<AdminUserProfile> {
  const statusValue = input.isActive ? "active" : "inactive";
  const attempts: Array<{
    path: string;
    method: "PUT" | "PATCH";
    body: unknown;
  }> = [
    {
      path: `/api/user_profiles/${encodeURIComponent(input.id)}`,
      method: "PUT",
      body: { is_active: input.isActive },
    },
    {
      path: `/api/user_profiles/${encodeURIComponent(input.id)}`,
      method: "PUT",
      body: { active: input.isActive },
    },
    {
      path: `/api/user_profiles?id=${encodeURIComponent(input.id)}`,
      method: "PUT",
      body: { is_active: input.isActive },
    },
    {
      path: `/api/user_profiles?id=${encodeURIComponent(input.id)}`,
      method: "PUT",
      body: { active: input.isActive },
    },
    {
      path: "/api/user_profiles",
      method: "PUT",
      body: { id: input.id, is_active: input.isActive },
    },
    {
      path: "/api/user_profiles",
      method: "PUT",
      body: { id: input.id, active: input.isActive },
    },
    {
      path: `/api/user_profiles/${encodeURIComponent(input.id)}`,
      method: "PATCH",
      body: { status: statusValue },
    },
    {
      path: "/api/user_profiles",
      method: "PATCH",
      body: { id: input.id, status: statusValue },
    },
  ];

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      const updated = await backendRequest<AdminUserProfile>({
        path: attempt.path,
        method: attempt.method,
        requireAuth: true,
        body: attempt.body,
      });
      return mapAdminUserProfile(updated);
    } catch (err: unknown) {
      lastError = err;
      const msg =
        err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (msg.includes("404") || msg.includes("400") || msg.includes("not found") || msg.includes("bad request")) continue;
      break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to update user status.");
}

export async function getCurrentUserProfile(): Promise<AdminUserProfile | null> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  // Fast path: fetch just this user's profile row by id.
  const direct = await getUserProfileById(user.id).catch(() => null);
  if (direct) return direct;

  // Fallback: list all profiles and match. (Only used if backend doesn't support "by id".)
  const profiles = await listUserProfiles().catch(() => []);
  return (
    profiles.find((profile) => profile.id === user.id) ??
    profiles.find(
      (profile) =>
        profile.email.toLowerCase() === (user.email ?? "").toLowerCase(),
    ) ??
    null
  );
}

export { hasAdminAccess, normalizeRoleValue };

export async function getUserProfileById(
  id: string,
): Promise<AdminUserProfile | null> {
  const attempts: Array<{ path: string; method: "GET" }> = [
    { path: `/api/user_profiles?id=${encodeURIComponent(id)}`, method: "GET" },
    { path: `/api/user_profiles/${encodeURIComponent(id)}`, method: "GET" },
  ];

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      const data = await backendRequest<unknown>({
        path: attempt.path,
        method: attempt.method,
        requireAuth: true,
      });

      if (typeof data === "object" && data !== null) {
        const maybeResults = (data as { results?: unknown }).results;
        if (Array.isArray(maybeResults) && maybeResults.length > 0) {
          return mapAdminUserProfile(maybeResults[0] as AdminUserProfile);
        }
        const maybeProfile = data as AdminUserProfile;
        if (typeof maybeProfile?.id === "string") {
          return mapAdminUserProfile(maybeProfile);
        }
      }

      return null;
    } catch (err: unknown) {
      lastError = err;
      const msg =
        err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (
        msg.includes("404") ||
        msg.includes("not found") ||
        msg.includes("400") ||
        msg.includes("bad request")
      ) {
        continue;
      }
      break;
    }
  }

  // If backend doesn't support these query shapes, return null so caller can fallback.
  if (lastError) return null;
  return null;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [papers, openQuestions, userProfiles] = await Promise.all([
    backendRequest<{ count?: number; total?: number; results?: unknown[] }>({ path: "/api/papers", method: "GET" }),
    backendRequest<{ count?: number; total?: number; results?: unknown[] }>({
      path: "/api/open_questions",
      method: "GET",
    }),
    backendRequest<{ count?: number; total?: number; results?: unknown[] }>({
      path: "/api/user_profiles",
      method: "GET",
      requireAuth: true,
    }).catch(() => ({ count: 0 })),
  ]);

  const getCount = (data: { count?: number; total?: number; results?: unknown[] }) => {
    if (typeof data.count === "number") return data.count;
    if (typeof data.total === "number") return data.total;
    if (Array.isArray(data.results)) return data.results.length;
    return 0;
  };

  return {
    papers: getCount(papers),
    openQuestions: getCount(openQuestions),
    userProfiles: getCount(userProfiles),
  };
}

export async function listProblemsForManagement(): Promise<Problem[]> {
  try {
    const backendProblems = await fetchBackendOpenQuestions();
    const localUploads = getMockProblems().filter((p) => p.id.startsWith("user-"));
    return [...localUploads, ...backendProblems].sort((a, b) => {
      const ad = a.created_at ? Date.parse(a.created_at) : 0;
      const bd = b.created_at ? Date.parse(b.created_at) : 0;
      return bd - ad;
    });
  } catch {
    return [...getMockProblems()];
  }
}

export async function listReviewQueueProblemsForManagement(): Promise<Problem[]> {
  try {
    const backendProblems = await fetchBackendOpenQuestions({
      is_resolved: false,
    });
    const localUploads = getMockProblems().filter((p) => p.id.startsWith("user-"));
    // Local uploads don't have `is_resolved`; include them so admins don't "lose" their draft.
    return [...localUploads, ...backendProblems].sort((a, b) => {
      const ad = a.created_at ? Date.parse(a.created_at) : 0;
      const bd = b.created_at ? Date.parse(b.created_at) : 0;
      return bd - ad;
    });
  } catch {
    return [...getMockProblems()];
  }
}

export async function triggerAdminArxivIngest(input?: {
  daysBack?: number;
  maxResults?: number;
}): Promise<{ message?: string }> {
  const daysBack = input?.daysBack ?? 7;
  const maxResults = input?.maxResults ?? 200;
  return backendRequest<{ message?: string }>({
    path: `/api/admin/ingest?daysBack=${encodeURIComponent(daysBack)}&maxResults=${encodeURIComponent(maxResults)}`,
    method: "POST",
    requireAuth: true,
  });
}

export async function createProblem(input: Omit<Problem, "id" | "created_at">) {
  try {
    const paper = await backendRequest<{ id: string }>({
      path: "/api/papers",
      method: "POST",
      body: { title: input.problem },
      requireAuth: true,
    });

    await backendRequest({
      path: "/api/open_questions",
      method: "POST",
      body: {
        paper_id: paper.id,
        title: input.problem,
        extracted_text: input.problem,
        category: input.field,
        source_type: "oqd-admin",
        unsolved_indicators: input.keywords,
      },
      requireAuth: true,
    });

    return { ok: true };
  } catch {
    addMockProblems([input]);
    return { ok: true };
  }
}

export async function updateProblem(
  id: string,
  updates: Partial<Omit<Problem, "id" | "created_at">>,
) {
  try {
    await backendRequest({
      path: `/api/open_questions?id=${encodeURIComponent(id)}`,
      method: "PUT",
      requireAuth: true,
      body: {
        ...(updates.problem ? { title: updates.problem, extracted_text: updates.problem } : {}),
        ...(updates.field ? { category: updates.field } : {}),
        ...(updates.keywords ? { unsolved_indicators: updates.keywords } : {}),
      },
    });
    return { ok: true };
  } catch {
    updateMockProblem(id, updates);
    return { ok: true };
  }
}

export async function deleteProblem(id: string) {
  const isLocalOnly = id.startsWith("user-");
  if (isLocalOnly) {
    deleteMockProblem(id);
    return { ok: true };
  }

  // Backend variants: some deployments accept id in query, some in path, some in body.
  const attempts: Array<{ path: string; body?: unknown }> = [
    { path: "/api/open_questions", body: { id } },
    { path: `/api/open_questions/${encodeURIComponent(id)}` },
    { path: `/api/open_questions?id=${encodeURIComponent(id)}` },
  ];

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      await backendRequest({
        path: attempt.path,
        method: "DELETE",
        requireAuth: true,
        body: attempt.body,
      });
      return { ok: true };
    } catch (err: unknown) {
      lastError = err;
      const msg =
        err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      // Keep trying for route-shape mismatches.
      if (msg.includes("404") || msg.includes("not found")) continue;
      break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to delete problem.");
}

export async function analyzeResearch(q: string, focus?: string): Promise<{ result: string }> {
  const qs = new URLSearchParams({ q });
  if (focus) qs.append("focus", focus);
  return backendRequest<{ result: string }>({
    path: `/api/analyze?${qs.toString()}`,
    method: "GET",
    requireAuth: true,
  });
}

export async function subscribeToPlan(priceId: string): Promise<{ url: string }> {
  return backendRequest<{ url: string }>({
    path: "/api/payments/subscribe",
    method: "POST",
    body: { priceId },
    requireAuth: true,
  });
}

