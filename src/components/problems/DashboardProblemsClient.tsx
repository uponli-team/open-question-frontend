"use client";

import { useMemo, useState } from "react";
import { useRealtimeProblems } from "@/hooks/useRealtimeProblems";
import SearchBar from "@/components/problems/SearchBar";
import FilterDropdown from "@/components/problems/FilterDropdown";
import ProblemList from "@/components/problems/ProblemList";
import PaginationControls from "@/components/problems/PaginationControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const LIMIT = 12;

export default function DashboardProblemsClient() {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("");
  const [page, setPage] = useState(1);

  const { items, total, totalPages, fields, loading, refresh } =
    useRealtimeProblems({
      page,
      limit: LIMIT,
      query,
      field,
    });

  function onQueryChange(next: string) {
    setQuery(next);
    setPage(1);
  }

  function onFieldChange(next: string) {
    setField(next);
    setPage(1);
  }

  const canReset = useMemo(() => query.length > 0 || field.length > 0, [query, field]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Problems
            </h1>
            <Badge variant="secondary">Realtime-ready</Badge>
          </div>
          <p className="mt-2 text-sm text-zinc-600">
            Browse structured questions. Search, filter, paginate, and receive
            realtime inserts (Supabase if configured).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={loading} onClick={() => void refresh()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {canReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setField("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="sticky top-20 z-20 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <SearchBar value={query} onChange={onQueryChange} />
          <FilterDropdown
            fields={fields}
            value={field}
            onChange={onFieldChange}
          />
        </div>
      </div>

      <motion.div
        className="text-sm text-zinc-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Showing{" "}
        <span className="font-semibold text-zinc-900">{items.length}</span> of{" "}
        <span className="font-semibold text-zinc-900">{total}</span>{" "}
        results
      </motion.div>
      <ProblemList problems={items} loading={loading} />

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

