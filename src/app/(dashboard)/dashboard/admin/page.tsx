"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck, Settings, Database, Users2, FolderKanban } from "lucide-react";
import {
  createProblem,
  createUserProfile,
  deleteProblem,
  getAdminOverview,
  listUserProfiles,
  listProblemsForManagement,
  listReviewQueueProblemsForManagement,
  updateUserProfileRole,
  updateProblem,
  updateUserProfileStatus,
  normalizeRoleValue,
  uploadProblems,
  type AdminUserProfile,
} from "@/lib/api";
import FileUploader from "@/components/admin/FileUploader";
import DataPreviewTable from "@/components/admin/DataPreviewTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Problem } from "@/types/problem";

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
  const [activePanel, setActivePanel] = useState<
    "uploads" | "problems" | "users" | "content" | "system"
  >("uploads");
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

  const [userRows, setUserRows] = useState<AdminUserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [overview, setOverview] = useState({
    papers: 0,
    openQuestions: 0,
    userProfiles: 0,
  });
  const [moduleFlags, setModuleFlags] = useState({
    uploads: true,
    realtime: true,
    openSignup: false,
    maintenance: false,
  });

  const [problemRows, setProblemRows] = useState<Problem[]>([]);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [problemMode, setProblemMode] = useState<"all" | "review">("all");
  const [problemForm, setProblemForm] = useState({
    problem: "",
    field: "",
    keywords: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);

  async function refreshUsers() {
    setUsersLoading(true);
    try {
      const users = await listUserProfiles();
      setUserRows(users);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  }

  async function refreshOverview() {
    try {
      const data = await getAdminOverview();
      setOverview(data);
    } catch {
      // Keep last values if endpoint is unavailable.
    }
  }

  const refreshProblems = useCallback(async () => {
    setProblemsLoading(true);
    try {
      const items =
        problemMode === "review"
          ? await listReviewQueueProblemsForManagement()
          : await listProblemsForManagement();
      setProblemRows(items);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Failed to load problems.");
    } finally {
      setProblemsLoading(false);
    }
  }, [problemMode]);

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
      void refreshOverview();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onUpdateUserRole(id: string, role: string) {
    try {
      await updateUserProfileRole({ id, role });
      setUserRows((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      toast.success("User role updated.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Failed to update user role.");
    }
  }

  async function onToggleUserStatus(user: AdminUserProfile) {
    const nextIsActive = !(user.is_active ?? true);
    try {
      await updateUserProfileStatus({ id: user.id, isActive: nextIsActive });
      setUserRows((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: nextIsActive } : u)),
      );
      toast.success(nextIsActive ? "User activated." : "User deactivated.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Failed to update user status.");
    }
  }

  async function onInviteUser() {
    if (!inviteEmail.trim()) {
      toast.error("Enter an email first.");
      return;
    }
    try {
      const created = await createUserProfile({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setUserRows((prev) => [created, ...prev]);
      setInviteEmail("");
      toast.success("User profile created.");
      void refreshOverview();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Failed to create user profile.");
    }
  }

  async function onSaveProblem() {
    const parsedKeywords = parseKeywords(problemForm.keywords);
    if (!problemForm.problem.trim() || !problemForm.field.trim() || parsedKeywords.length === 0) {
      toast.error("Problem, field, and keywords are required.");
      return;
    }

    try {
      if (editingId) {
        await updateProblem(editingId, {
          problem: problemForm.problem.trim(),
          field: problemForm.field.trim(),
          keywords: parsedKeywords,
        });
        toast.success("Problem updated.");
      } else {
        await createProblem({
          problem: problemForm.problem.trim(),
          field: problemForm.field.trim(),
          keywords: parsedKeywords,
        });
        toast.success("Problem created.");
      }

      setProblemForm({ problem: "", field: "", keywords: "" });
      setEditingId(null);
      void refreshProblems();
      void refreshOverview();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Failed to save problem.");
    }
  }

  async function onDeleteProblem(id: string) {
    try {
      await deleteProblem(id);
      toast.success("Problem deleted.");
      void refreshProblems();
      void refreshOverview();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) ?? "Failed to delete problem.");
    }
  }

  async function onDeleteSelectedProblems() {
    if (selectedProblemIds.length === 0) return;

    let successCount = 0;
    for (const id of selectedProblemIds) {
      try {
        await deleteProblem(id);
        successCount += 1;
      } catch {
        // continue deleting remaining rows
      }
    }

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} problem(s).`);
    } else {
      toast.error("Failed to delete selected problems.");
    }

    setSelectedProblemIds([]);
    setPendingBulkDelete(false);
    void refreshProblems();
    void refreshOverview();
  }

  function toggleFlag(key: keyof typeof moduleFlags) {
    setModuleFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  useEffect(() => {
    void refreshOverview();
    void refreshUsers();
  }, []);

  useEffect(() => {
    if (activePanel === "problems" && problemRows.length === 0 && !problemsLoading) {
      void refreshProblems();
    }
  }, [activePanel, problemRows.length, problemsLoading, problemMode, refreshProblems]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Admin Panel
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Manage uploads, users, content settings, and system controls from one place.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "uploads", label: "Uploads", icon: Database },
          { key: "problems", label: "Problem Management", icon: FolderKanban },
          { key: "users", label: "User Management", icon: Users2 },
          { key: "content", label: "Content Management", icon: FolderKanban },
          { key: "system", label: "System Management", icon: Settings },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActivePanel(item.key as typeof activePanel)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              activePanel === item.key
                ? "border-emerald-300 bg-emerald-50"
                : "border-zinc-200 bg-white hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-600">Papers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-zinc-900">
            {overview.papers}
          </CardContent>
        </Card>
        <Card className="border-zinc-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-600">Open Questions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-zinc-900">
            {overview.openQuestions}
          </CardContent>
        </Card>
        <Card className="border-zinc-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-600">User Profiles</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-zinc-900">
            {overview.userProfiles}
          </CardContent>
        </Card>
      </div>

      {activePanel === "uploads" && (
        <>
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
                  {uploading
                    ? "Uploading…"
                    : `Upload valid records (${validProblems.length})`}
                </Button>
              </div>
              <DataPreviewTable rows={rows} />
            </>
          )}
        </>
      )}

      {activePanel === "users" && (
        <Card className="border-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-emerald-700" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-zinc-800">Users</div>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by email or ID..."
                  className="w-full max-w-xs rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-100 text-zinc-700">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {userRows
                    .filter((u) => {
                      const q = userSearch.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        u.email.toLowerCase().includes(q) ||
                        u.id.toLowerCase().includes(q)
                      );
                    })
                    .map((u) => (
                    <tr key={u.id} className="border-t border-zinc-100">
                      <td className="px-3 py-2 font-medium text-zinc-900">{u.id.slice(0, 8)}…</td>
                      <td className="px-3 py-2 text-zinc-600">{u.email}</td>
                      <td className="px-3 py-2">
                        <select
                          value={u.role}
                          onChange={(e) => void onUpdateUserRole(u.id, normalizeRoleValue(e.target.value))}
                          className="rounded-md border border-zinc-200 px-2 py-1 text-sm"
                        >
                          <option value="owner">Owner</option>
                          <option value="superadmin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="reviewer">Reviewer</option>
                          <option value="user">User</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            (u.is_active ?? true)
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          {(u.is_active ?? true) ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void onToggleUserStatus(u)}
                        >
                          {(u.is_active ?? true) ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                      <td className="px-3 py-2 text-zinc-600">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usersLoading && <div className="text-sm text-zinc-500">Loading users...</div>}
            <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
              <input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="rounded-md border border-zinc-200 px-3 py-2 text-sm"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="rounded-md border border-zinc-200 px-2 py-2 text-sm"
              >
                <option value="user">user</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Editor">Editor</option>
                <option value="Admin">Admin</option>
              </select>
              <Button size="sm" variant="outline" onClick={() => void onInviteUser()}>
                Create profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activePanel === "problems" && (
        <>
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle>Problem Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={problemMode === "all" ? "default" : "outline"}
                    onClick={() => {
                      setProblemMode("all");
                      setProblemRows([]);
                    }}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={problemMode === "review" ? "default" : "outline"}
                    onClick={() => {
                      setProblemMode("review");
                      setProblemRows([]);
                    }}
                  >
                    Review Queue
                  </Button>
                </div>
                <div className="text-sm text-zinc-600">
                  Showing{" "}
                  <span className="font-semibold text-zinc-900">
                    {problemRows.length}
                  </span>{" "}
                  problems
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <input
                  value={problemForm.problem}
                  onChange={(e) => setProblemForm((p) => ({ ...p, problem: e.target.value }))}
                  placeholder="Problem statement"
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
                <input
                  value={problemForm.field}
                  onChange={(e) => setProblemForm((p) => ({ ...p, field: e.target.value }))}
                  placeholder="Field (e.g. Computer Science)"
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
                <input
                  value={problemForm.keywords}
                  onChange={(e) => setProblemForm((p) => ({ ...p, keywords: e.target.value }))}
                  placeholder="Keywords separated by comma"
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => void onSaveProblem()}>
                  {editingId ? "Update problem" : "Create problem"}
                </Button>
                {editingId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setProblemForm({ problem: "", field: "", keywords: "" });
                    }}
                  >
                    Cancel edit
                  </Button>
                )}
              </div>

              {problemsLoading && <div className="text-sm text-zinc-500">Loading problems...</div>}

              <div className="overflow-x-auto">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={
                        problemRows.slice(0, 50).length > 0 &&
                        selectedProblemIds.length === problemRows.slice(0, 50).length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProblemIds(problemRows.slice(0, 50).map((p) => p.id));
                        } else {
                          setSelectedProblemIds([]);
                        }
                      }}
                    />
                    Select all visible
                  </label>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={selectedProblemIds.length === 0}
                    onClick={() => setPendingBulkDelete(true)}
                  >
                    Delete selected ({selectedProblemIds.length})
                  </Button>
                </div>

                <table className="min-w-full text-left text-sm">
                  <thead className="bg-zinc-100 text-zinc-700">
                    <tr>
                      <th className="px-3 py-2">Select</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Problem</th>
                      <th className="px-3 py-2">Field</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problemRows.slice(0, 50).map((p) => (
                      <tr key={p.id} className="border-t border-zinc-100">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedProblemIds.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProblemIds((prev) => [
                                  ...new Set([...prev, p.id]),
                                ]);
                              } else {
                                setSelectedProblemIds((prev) => prev.filter((id) => id !== p.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-3 py-2 text-zinc-600">{p.id.slice(0, 8)}…</td>
                        <td className="px-3 py-2 text-zinc-900">{p.problem}</td>
                        <td className="px-3 py-2 text-zinc-600">{p.field}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(p.id);
                                setProblemForm({
                                  problem: p.problem,
                                  field: p.field,
                                  keywords: p.keywords.join(", "),
                                });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setPendingDelete({ id: p.id, label: p.problem })}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {pendingDelete && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
              <Card className="w-full max-w-md border-zinc-200">
                <CardHeader>
                  <CardTitle>Delete Problem?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-700">
                    Are you sure you want to delete this problem?
                  </p>
                  <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-900">
                    {pendingDelete.label}
                  </p>
                  <p className="text-xs text-zinc-500">This action cannot be undone.</p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setPendingDelete(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const id = pendingDelete.id;
                        setPendingDelete(null);
                        void onDeleteProblem(id);
                      }}
                    >
                      Yes, delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {pendingBulkDelete && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
              <Card className="w-full max-w-md border-zinc-200">
                <CardHeader>
                  <CardTitle>Delete Selected Problems?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-700">
                    You are about to delete {selectedProblemIds.length} selected problem(s).
                  </p>
                  <p className="text-xs text-zinc-500">This action cannot be undone.</p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPendingBulkDelete(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setPendingBulkDelete(false);
                        void onDeleteSelectedProblems();
                      }}
                    >
                      Yes, delete selected
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {activePanel === "content" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle>Taxonomy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-700">
              <p>Manage fields, keyword dictionaries, and alias mappings.</p>
              <Button size="sm" variant="outline">Edit categories</Button>
            </CardContent>
          </Card>
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle>Review Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-700">
              <p>Track pending records and assign reviewers.</p>
              <Button size="sm" variant="outline">Open review queue</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activePanel === "system" && (
        <Card className="border-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              System Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                ["uploads", "Enable uploads"],
                ["realtime", "Enable realtime listeners"],
                ["openSignup", "Allow open signup"],
                ["maintenance", "Maintenance mode"],
              ] as Array<[keyof typeof moduleFlags, string]>
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2">
                <span className="text-sm text-zinc-800">{label}</span>
                <input
                  type="checkbox"
                  checked={moduleFlags[key]}
                  onChange={() => toggleFlag(key)}
                />
              </label>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

