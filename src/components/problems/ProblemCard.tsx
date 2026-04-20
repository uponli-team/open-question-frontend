"use client";

import Link from "next/link";
import type { Problem } from "@/types/problem";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export default function ProblemCard({
  problem,
  onSelect,
  ctaLabel = "View details",
  href,
  secondaryLabel,
  secondaryHref,
}: {
  problem: Problem;
  onSelect?: (problem: Problem) => void;
  ctaLabel?: string;
  href?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  const created = problem.created_at
    ? new Date(problem.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : null;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-zinc-200 bg-white hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3 p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{problem.field}</Badge>
            {created && <span className="text-xs text-zinc-500">{created}</span>}
          </div>
          <div className="mt-3 text-sm font-semibold text-zinc-950">
            {truncate(problem.problem, 140)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {problem.keywords.slice(0, 4).map((k) => (
              <span
                key={k}
                className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-2 p-6 pt-0">
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref}>
            <Button size="sm" variant="outline" className="w-full">
              {secondaryLabel}
            </Button>
          </Link>
        ) : null}
        {onSelect ? (
          <Button size="sm" className="w-full" onClick={() => onSelect(problem)}>
            {ctaLabel}
          </Button>
        ) : (
          <Link href={href ?? `/dashboard/problems/${problem.id}`}>
            <Button size="sm" className="w-full">
              {ctaLabel}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}

