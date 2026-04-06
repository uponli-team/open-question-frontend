"use client";

import type { Problem } from "@/types/problem";
import ProblemCard from "@/components/problems/ProblemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { fadeItem, staggerContainer } from "@/components/ui/motion";

export default function ProblemList({
  problems,
  loading,
}: {
  problems: Problem[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
        <div className="text-base font-semibold text-zinc-950">
          No problems match your filters.
        </div>
        <div className="mt-2 text-sm text-zinc-600">
          Try clearing the query or picking another field.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {problems.map((p) => (
        <motion.div key={p.id} variants={fadeItem}>
          <ProblemCard problem={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}

