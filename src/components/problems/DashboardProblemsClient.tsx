"use client";

import { useEffect, useMemo, useState } from "react";
import { useRealtimeProblems } from "@/hooks/useRealtimeProblems";
import SearchBar from "@/components/problems/SearchBar";
import FilterDropdown from "@/components/problems/FilterDropdown";
import ProblemList from "@/components/problems/ProblemList";
import PaginationControls from "@/components/problems/PaginationControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";
import AIResearchSynthesis from "@/components/dashboard/AIResearchSynthesis";

const LIMIT = 12;
type Audience = "students" | "researchers";

const roleCopy: Record<
  Audience,
  {
    heading: string;
    helper: string;
  }
> = {
  students: {
    heading: "Student practice mode",
    helper:
      "Pick a problem, break it down, and practice reasoning with clear step-by-step explanations.",
  },
  researchers: {
    heading: "Research exploration mode",
    helper:
      "Pick a problem and push toward hypotheses, assumptions, candidate methods, and limitations.",
  },
};

export default function DashboardProblemsClient() {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("");
  const [page, setPage] = useState(1);
  const [audience, setAudience] = useState<Audience>("students");
  const [view, setView] = useState<"browse" | "ai-synthesis">("browse");

  useEffect(() => {
    function sync() {
      const savedAudience = localStorage.getItem("oqd_audience") as Audience;
      if (savedAudience === "students" || savedAudience === "researchers") {
        setAudience(savedAudience);
      }
      
      const savedView = localStorage.getItem("oqd_dashboard_view") as "browse" | "ai-synthesis";
      if (savedView === "browse" || savedView === "ai-synthesis") {
        setView(savedView);
      }
    }
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    localStorage.setItem("oqd_dashboard_view", view);
  }, [view]);

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
            Browse structured questions and open an attempt page as a student or
            researcher.
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
      <div className="rounded-2xl border border-zinc-200 bg-white p-2 flex gap-2">
        <Button
          size="sm"
          className="flex-1 rounded-xl"
          variant={view === "browse" ? "default" : "ghost"}
          onClick={() => setView("browse")}
        >
          <Search className="h-4 w-4 mr-2" />
          Browse Problems
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-xl"
          variant={view === "ai-synthesis" ? "default" : "ghost"}
          onClick={() => setView("ai-synthesis")}
        >
          <BrainCircuit className="h-4 w-4 mr-2" />
          AI Research Synthesis
        </Button>
      </div>

      {view === "browse" ? (
        <>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">
                  {roleCopy[audience].heading}
                </div>
                <div className="text-xs text-zinc-600">{roleCopy[audience].helper}</div>
              </div>
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

          <ProblemList
            problems={items}
            loading={loading}
            ctaLabel="Select to attempt"
            getProblemHref={(problem) =>
              `/dashboard/problems/${problem.id}?intent=attempt&audience=${audience}`
            }
            secondaryLabel="View problem"
            getSecondaryHref={(problem) => `/dashboard/problems/${problem.id}`}
          />

          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <AIResearchSynthesis />
      )}
    </div>
  );
}

