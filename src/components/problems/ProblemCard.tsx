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
    <Card className="group flex h-full flex-col overflow-hidden border-zinc-200/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="secondary" className="font-semibold">
            {problem.field}
          </Badge>
          {created && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              {created}
            </span>
          )}
        </div>

        <div className="mt-4 flex-1">
          <h3 className="text-base font-bold leading-snug text-zinc-900 group-hover:text-emerald-700 transition-colors">
            {truncate(problem.problem, 140)}
          </h3>

          {problem.keywords.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {problem.keywords.slice(0, 4).map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center rounded-full bg-emerald-50/50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100/50"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto space-y-2 p-6 pt-0">
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className="block w-full">
            <Button size="sm" variant="outline" className="w-full font-semibold">
              {secondaryLabel}
            </Button>
          </Link>
        ) : null}
        {onSelect ? (
          <Button
            size="sm"
            className="w-full font-semibold shadow-emerald-200"
            onClick={() => onSelect(problem)}
          >
            {ctaLabel}
          </Button>
        ) : (
          <Link href={href ?? `/dashboard/problems/${problem.id}`} className="block w-full">
            <Button size="sm" className="w-full font-semibold shadow-emerald-200">
              {ctaLabel}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}

