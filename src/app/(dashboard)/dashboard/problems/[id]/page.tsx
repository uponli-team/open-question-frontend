import { notFound } from "next/navigation";
import { getProblemById, getUserProfileById } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttemptWorkspace from "@/components/problems/AttemptWorkspace";
import { createServerSupabaseClient, getSupabaseAccessTokenServer } from "@/lib/supabaseServer";
import { Lock, Sparkles, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PageSearchParams = Record<string, string | string[] | undefined>;

export default async function ProblemDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<PageSearchParams> | PageSearchParams;
}>) {
  const resolvedParams =
    typeof (params as Promise<{ id: string }>).then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });
  const resolvedSearchParams =
    (await Promise.resolve(searchParams ?? {})) as PageSearchParams;

  const id = decodeURIComponent(resolvedParams.id ?? "");
  
  // Get token on server
  const token = await getSupabaseAccessTokenServer();

  // Parallel fetch problem and user profile
  const [problem, authUser] = await Promise.all([
    getProblemById(id, token),
    (async () => {
      const supabase = createServerSupabaseClient();
      if (!supabase) return null;
      const { data } = await supabase.auth.getUser();
      return data.user;
    })(),
  ]);

  if (!problem) notFound();

  const profile = authUser ? await getUserProfileById(authUser.id, token).catch(() => null) : null;
  const isSubscribed = profile?.subscription_status === "active";
  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin" || profile?.role === "owner";
  const hasFullAccess = isSubscribed || isAdmin;
  const intent = Array.isArray(resolvedSearchParams.intent)
    ? resolvedSearchParams.intent[0]
    : resolvedSearchParams.intent;
  const audienceRaw = Array.isArray(resolvedSearchParams.audience)
    ? resolvedSearchParams.audience[0]
    : resolvedSearchParams.audience;
  const audience = audienceRaw === "researchers" ? "researchers" : "students";
  const isAttemptMode = intent === "attempt";

  const created =
    problem.created_at && !Number.isNaN(Date.parse(problem.created_at))
      ? new Date(problem.created_at).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
      : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="border-b border-zinc-200 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{problem.field}</Badge>
          {created && <span className="text-sm text-zinc-500">{created}</span>}
        </div>
        <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-zinc-950 md:text-4xl">
          Problem Details
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Complete information for this open problem.
        </p>
      </div>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle>Problem statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-base leading-7 text-zinc-800">{problem.problem}</div>
        </CardContent>
      </Card>

      {isAttemptMode && <AttemptWorkspace problem={problem} audience={audience} />}

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-700">
          <div>
            <span className="font-semibold text-zinc-900">Problem ID: </span>
            <span>{problem.id}</span>
          </div>
          <div>
            <span className="font-semibold text-zinc-900">Field: </span>
            <span>{problem.field}</span>
          </div>
          {created && (
            <div>
              <span className="font-semibold text-zinc-900">Created: </span>
              <span>{created}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle>Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {problem.keywords.length > 0 ? (
              problem.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                >
                  {k}
                </span>
              ))
            ) : (
              <span className="text-sm text-zinc-500">No keywords available.</span>
            )}
          </div>
        </CardContent>
      </Card>

      {hasFullAccess ? (
        <>
          {problem.extracted_text && (
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="flex flex-row items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <CardTitle>Extracted Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                  {problem.extracted_text}
                </div>
              </CardContent>
            </Card>
          )}

          {problem.structured_summary && (
            <Card className="border-emerald-100 bg-emerald-50/20">
              <CardHeader className="flex flex-row items-center gap-2 border-b border-emerald-100">
                <BrainCircuit className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-emerald-900">AI Research Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-emerald max-w-none text-zinc-800">
                  {problem.structured_summary}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50/50" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              Premium Data Locked
            </h3>
            <p className="mt-2 max-w-xs text-sm text-zinc-600">
              Subscribe to Pro to unlock extracted text, AI-generated summaries, and advanced research metadata.
            </p>
            <Link href="/#pricing" className="mt-6">
              <Button className="rounded-xl px-8 shadow-lg shadow-emerald-500/20">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-semibold text-zinc-950">
          Source Information
        </div>
        <div className="mt-2 text-sm leading-relaxed text-zinc-600">
          {hasFullAccess 
            ? "Full source data is available for this record. Use the sections above to explore the detailed analysis."
            : "Detailed source information and citations are available for PRO members. Upgrade your plan to see the full research context."}
        </div>
      </div>
    </div>
  );
}

