"use client";

import { useEffect, useState } from "react";
import { listMCPProblems, listSolutions } from "@/lib/api";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import type { MCPProblem } from "@/types/mcp";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MCPProblemListProps {
  onSelectProblem: (problem: MCPProblem) => void;
  selectedProblemId?: string;
}

export default function MCPProblemList({ onSelectProblem, selectedProblemId }: MCPProblemListProps) {
  const [problems, setProblems] = useState<MCPProblem[]>([]);
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "solved" | "needs">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [problemsData, solutionsData] = await Promise.all([
          listMCPProblems(),
          listSolutions()
        ]);
        
        const mcpProblems = problemsData?.problems || [];
        const solvedIds = new Set(solutionsData?.map(s => s.problem_id).filter(Boolean));
        
        // --- NEW: Fetch missing problems for existing solutions ---
        let mergedProblems = [...mcpProblems];
        const missingIds = Array.from(solvedIds).filter(id => !mcpProblems.some(p => p.id === id));
        
        if (missingIds.length > 0) {
          const supabase = createBrowserSupabaseClient();
          if (supabase) {
            // Fetch missing problems from open_questions table
            const { data: missingProblems } = await supabase
              .from("open_questions")
              .select("id, title, category, created_at, extracted_text")
              .in("id", missingIds);
            
            if (missingProblems) {
              const mapped = missingProblems.map(mp => ({
                type: "problem" as const,
                id: mp.id,
                source: mp.category || "Database",
                title: mp.title,
                statement: mp.title || mp.extracted_text || "Untitled problem",
                confidence: 1.0 // Database problems are verified
              }));
              mergedProblems = [...mapped, ...mergedProblems];
            }
          }
        }
        // -----------------------------------------------------------

        setProblems(mergedProblems);
        setSolvedProblemIds(solvedIds);
      } catch (err: any) {
        setError(err.message || "Failed to load MCP problems");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const [displayLimit, setDisplayLimit] = useState(50);

  // Count how many of the CURRENT problems have solutions
  const solvedInList = problems.filter(p => solvedProblemIds.has(p.id));
  const needsInList = problems.filter(p => !solvedProblemIds.has(p.id));

  const filteredProblems = (activeTab === "solved" 
    ? solvedInList 
    : activeTab === "needs" 
      ? needsInList 
      : problems
  ).sort((a, b) => {
    if (activeTab === "all") {
      const aHas = solvedProblemIds.has(a.id) ? 1 : 0;
      const bHas = solvedProblemIds.has(b.id) ? 1 : 0;
      if (bHas !== aHas) return bHas - aHas;
    }
    return 0;
  });

  const displayedProblems = filteredProblems.slice(0, displayLimit);

  console.log("[MCP] Total unique solved IDs in DB:", solvedProblemIds.size);
  console.log("[MCP] Solved problems matching current list:", solvedInList.length);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-medium">{error}</p>
        <p className="text-xs text-red-500 mt-2">Check if Supabase RLS policies allow SELECT on 'solutions' table.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom Tabs */}
      <div className="flex p-1 bg-zinc-100 rounded-xl">
        {[
          { id: "all", label: "All" },
          { id: "solved", label: "Has Solution" },
          { id: "needs", label: "Needs Solution" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setDisplayLimit(50);
            }}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200",
              activeTab === tab.id 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {displayedProblems.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-sm font-medium text-zinc-500">No questions found in this category.</p>
            {activeTab === "solved" && solvedProblemIds.size === 0 && (
              <p className="text-xs text-zinc-400 mt-2">Make sure your Supabase 'solutions' table has a SELECT policy for authenticated users.</p>
            )}
          </div>
        ) : (
          <>
            {displayedProblems.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
              >
                <Card 
                  className={cn(
                    "group relative overflow-hidden border-zinc-200 bg-white p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-200",
                    selectedProblemId === p.id && "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500"
                  )}
                  onClick={() => onSelectProblem(p)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 font-bold text-[10px] uppercase tracking-wider">
                          {p.source?.includes(":") ? p.source.split(":")[0] : "Research Paper"}
                        </Badge>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Target className="h-3 w-3" />
                          {Math.round((p.confidence || 0) * 100)}% Confidence
                        </div>
                        {solvedProblemIds.has(p.id) && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Proposed
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 leading-snug group-hover:text-emerald-700 transition-colors">
                        {p.statement || "No statement provided"}
                      </h4>
                    </div>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center border border-zinc-100 transition-all group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500",
                      selectedProblemId === p.id ? "bg-emerald-500 text-white border-emerald-500" : "bg-zinc-50 text-zinc-400"
                    )}>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            
            {filteredProblems.length > displayLimit && (
              <button
                onClick={() => setDisplayLimit(prev => prev + 50)}
                className="w-full py-3 text-sm font-bold text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-dashed border-zinc-200 mt-4"
              >
                Load More (+50)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
