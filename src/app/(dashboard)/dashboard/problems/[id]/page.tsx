import { notFound } from "next/navigation";
import { getProblemById } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttemptWorkspace from "@/components/problems/AttemptWorkspace";

export default async function ProblemDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }> | { id: string };
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}>) {
  const resolvedParams =
    typeof (params as Promise<{ id: string }>).then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });
  const resolvedSearchParams =
    typeof (searchParams as Promise<Record<string, string | string[] | undefined>>)?.then ===
    "function"
      ? await (searchParams as Promise<Record<string, string | string[] | undefined>>)
      : (searchParams ?? {});

  const id = decodeURIComponent(resolvedParams.id ?? "");
  const problem = await getProblemById(id);
  if (!problem) notFound();
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

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-semibold text-zinc-950">
          Next steps
        </div>
        <div className="mt-2 text-sm leading-relaxed text-zinc-600">
          This is a UI placeholder. When your backend is connected, OQD can
          show extracted sources, discussion threads, and model-assisted
          summaries here.
        </div>
      </div>
    </div>
  );
}

