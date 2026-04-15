"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck, Settings, Database, Users2, FolderKanban } from "lucide-react";
import {
  createUserProfile,
  getAdminOverview,
  listUserProfiles,
  updateUserProfileRole,
  uploadProblems,
  type AdminUserProfile,
} from "@/lib/api";
import FileUploader from "@/components/admin/FileUploader";
import DataPreviewTable from "@/components/admin/DataPreviewTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [activePanel, setActivePanel] = useState<
    "uploads" | "users" | "content" | "system"
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

  function toggleFlag(key: keyof typeof moduleFlags) {
    setModuleFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  useEffect(() => {
    void refreshOverview();
    void refreshUsers();
  }, []);

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
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-100 text-zinc-700">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {userRows.map((u) => (
                    <tr key={u.id} className="border-t border-zinc-100">
                      <td className="px-3 py-2 font-medium text-zinc-900">{u.id.slice(0, 8)}…</td>
                      <td className="px-3 py-2 text-zinc-600">{u.email}</td>
                      <td className="px-3 py-2">
                        <select
                          value={u.role}
                          onChange={(e) => void onUpdateUserRole(u.id, e.target.value)}
                          className="rounded-md border border-zinc-200 px-2 py-1 text-sm"
                        >
                          <option>Owner</option>
                          <option>Admin</option>
                          <option>Editor</option>
                          <option>Reviewer</option>
                          <option>user</option>
                        </select>
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

