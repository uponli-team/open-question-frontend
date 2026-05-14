"use client";

import { useEffect, useState } from "react";
import { listSolutions, voteSolution, submitSolution } from "@/lib/api";
import type { Solution, MCPProblem } from "@/types/mcp";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, ThumbsDown, MessageSquare, Send, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SolutionFeedProps {
  problem: MCPProblem | null;
}

export default function SolutionFeed({ problem }: SolutionFeedProps) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSolutionText, setNewSolutionText] = useState("");

  useEffect(() => {
    if (!problem) return;
    loadSolutions();
  }, [problem]);

  async function loadSolutions() {
    if (!problem) return;
    setLoading(true);
    try {
      const data = await listSolutions(problem.id);
      setSolutions(data);
    } catch (err) {
      console.error("Failed to load solutions", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(id: string, type: "up" | "down") {
    try {
      const updated = await voteSolution(id, type);
      setSolutions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success(`Solution ${type}voted!`);
    } catch (err: any) {
      toast.error(err.message || "Voting failed");
    }
  }

  async function handleSubmit() {
    if (!problem || !newSolutionText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await submitSolution(problem.id, newSolutionText);
      setSolutions((prev) => [created, ...prev]);
      setNewSolutionText("");
      toast.success("Solution submitted for review!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit solution");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!problem) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
        <div className="h-20 w-20 rounded-3xl bg-zinc-100 flex items-center justify-center mb-6">
          <MessageSquare className="h-10 w-10 text-zinc-400" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900">No Problem Selected</h3>
        <p className="text-sm text-zinc-500 max-w-[280px] mt-2">Select a problem from the list to view or propose solutions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          Propose a Solution
        </h3>
        <Card className="border-emerald-100 bg-emerald-50/20 shadow-sm overflow-hidden border-2">
          <CardContent className="p-4 space-y-4">
            <textarea
              value={newSolutionText}
              onChange={(e) => setNewSolutionText(e.target.value)}
              placeholder="Describe your proposed solution or breakthrough idea..."
              className="w-full min-h-[120px] bg-white rounded-2xl border-emerald-100 p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none shadow-inner"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={!newSolutionText.trim() || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-2 shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">Community Solutions</h3>
          <Badge variant="secondary" className="bg-zinc-100 text-zinc-600">
            {solutions.length} Proposals
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : solutions.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 rounded-3xl border border-zinc-100 border-dashed">
            <p className="text-zinc-500 text-sm">Be the first to propose a solution to this problem!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {solutions.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-zinc-200 bg-white hover:border-emerald-200 transition-all duration-300 rounded-2xl overflow-hidden shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                            {s.solution_text}
                          </p>
                          <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
                                onClick={() => handleVote(s.id, "up")}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1.5" />
                                <span className="text-xs font-bold">{s.upvotes}</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 rounded-lg hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleVote(s.id, "down")}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1.5" />
                                <span className="text-xs font-bold">{s.downvotes}</span>
                              </Button>
                            </div>
                            <div className="h-4 w-px bg-zinc-100" />
                            <div className="flex flex-col">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                Proposer
                              </span>
                              <span className="text-[11px] text-zinc-600 font-medium truncate max-w-[150px]">
                                {(s as any).proposer_name || (s.user_id ? `User: ${s.user_id.slice(0, 8)}...` : "AI Agent")}
                              </span>
                            </div>
                            <div className="h-4 w-px bg-zinc-100" />
                            <div className="flex flex-col">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                Date
                              </span>
                              <span className="text-[11px] text-zinc-600 font-medium">
                                {s.created_at ? new Date(s.created_at).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <Badge className={cn(
                              "text-[10px] font-bold uppercase",
                              s.status === "pending" ? "bg-amber-100 text-amber-700" : 
                              s.status === "approved" ? "bg-emerald-100 text-emerald-700" : 
                              "bg-red-100 text-red-700"
                            )}>
                              {s.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
