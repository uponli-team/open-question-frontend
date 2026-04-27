"use client";

import { useState, useEffect } from "react";
import { Sparkles, Send, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeResearch } from "@/lib/api";
import { toast } from "sonner";

export default function AIResearchSynthesis() {
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Persistence: Load on mount
  useEffect(() => {
    const savedQuery = localStorage.getItem("oqd_synthesis_query");
    const savedFocus = localStorage.getItem("oqd_synthesis_focus");
    const savedResult = localStorage.getItem("oqd_synthesis_result");
    if (savedQuery) setQuery(savedQuery);
    if (savedFocus) setFocus(savedFocus);
    if (savedResult) setResult(savedResult);
    setIsInitialized(true);
  }, []);

  // Persistence: Save on change
  useEffect(() => {
    if (!isInitialized) return;
    
    localStorage.setItem("oqd_synthesis_query", query);
    localStorage.setItem("oqd_synthesis_focus", focus);
    if (result) {
      localStorage.setItem("oqd_synthesis_result", result);
    } else {
      localStorage.removeItem("oqd_synthesis_result");
    }
  }, [query, focus, result, isInitialized]);

  async function handleAnalyze() {
    if (!query.trim()) {
      toast.error("Please enter a research question or topic.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = (await analyzeResearch(query.trim(), focus.trim() || undefined)) as any;
      
      // Aggressive extraction: try to find 'analysis' or 'result' in the data object
      let synthesisResult = 
        (data as any).analysis || 
        (data as any).result || 
        (data as any).message || 
        (data as any).output || 
        (data as any).response ||
        (data as any).content ||
        (data as any).text;

      // If the result we found is a string that looks like JSON, it might be double-encoded
      if (typeof synthesisResult === "string" && synthesisResult.trim().startsWith("{")) {
        try {
          const nested = JSON.parse(synthesisResult);
          synthesisResult = nested.analysis || nested.result || nested.message || synthesisResult;
        } catch (e) {
          // Not valid JSON, continue with original string
        }
      }

      // If data itself was a string (e.g. from a failed parse in backendRequest), try parsing it here
      if (!synthesisResult && typeof data === "string" && data.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(data);
          synthesisResult = parsed.analysis || parsed.result || parsed.message || data;
        } catch (e) {
          synthesisResult = data;
        }
      }

      // Handle common AI provider formats (OpenAI, Anthropic, etc.)
      if (!synthesisResult && (data as any).choices?.[0]) {
        const choice = (data as any).choices[0];
        synthesisResult = choice.message?.content || choice.text;
      }
      
      if (!synthesisResult && (data as any).results) {
        const results = (data as any).results;
        if (Array.isArray(results) && results.length > 0) {
          synthesisResult = typeof results[0] === "string" ? results[0] : (results[0].analysis || results[0].text || results[0].result || results[0].content);
        } else if (typeof results === "string") {
          synthesisResult = results;
        }
      }

      // Final fallback
      if (!synthesisResult && data) {
        if (typeof data === "string") {
          synthesisResult = data;
        } else {
          synthesisResult = JSON.stringify(data, null, 2);
        }
      }

      if (!synthesisResult) {
        toast.error("Analysis complete, but the response was empty.");
        return;
      }

      setResult(String(synthesisResult));
      toast.success("Analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze research.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <Card className="border-zinc-200 bg-white/50 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-6 w-6" />
            AI Research Synthesis
          </CardTitle>
          <div className="flex items-center gap-2">
            <p className="text-emerald-50 text-sm opacity-90">
              Powered by NVIDIA NIM
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 rounded-xl"
              onClick={() => {
                setQuery("");
                setFocus("");
                setResult(null);
                localStorage.removeItem("oqd_synthesis_query");
                localStorage.removeItem("oqd_synthesis_focus");
                localStorage.removeItem("oqd_synthesis_result");
              }}
            >
              New Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              Research Query
              <span title="What would you like the AI to analyze?">
                <Info className="h-3 w-3 text-zinc-400 cursor-help" />
              </span>
            </label>
            <textarea
              id="synthesis-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Give me the top 5 open questions from Erdős Problems"
              className="w-full min-h-[120px] rounded-2xl border-zinc-200 bg-white p-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">
              Focus <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <input
              id="synthesis-focus"
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g., Number Theory, Graph Theory..."
              className="w-full rounded-xl border-zinc-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-lg transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Synthesizing Knowledge...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Analyze Research
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-emerald-100 bg-emerald-50/30 backdrop-blur-sm rounded-3xl shadow-lg border-2">
              <CardHeader className="border-b border-emerald-100 p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-emerald-900 font-bold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                  </div>
                  Synthesis Result
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-100 rounded-xl font-medium" onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success("Copied to clipboard!");
                  }}>
                    Copy
                  </Button>
                  <Button variant="ghost" size="sm" className="text-zinc-500 hover:bg-zinc-100 rounded-xl font-medium" onClick={() => {
                    setResult(null);
                    localStorage.removeItem("oqd_synthesis_result");
                  }}>
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 text-zinc-800 leading-relaxed">
                  {result.split("\n\n").map((paragraph, i) => {
                    const cleanParagraph = paragraph.trim().replace(/\*\*/g, "");
                    
                    // Simple check for list items (1. Item Name: Description)
                    if (cleanParagraph.match(/^\d+\.\s/)) {
                      return (
                        <ul key={i} className="space-y-4 my-6">
                          {cleanParagraph.split("\n").map((line, j) => {
                            const cleanLine = line.trim();
                            if (!cleanLine) return null;
                            
                            const listMarker = cleanLine.match(/^\d+\.\s/)?.[0] || "";
                            const contentWithoutMarker = cleanLine.replace(/^\d+\.\s/, "");
                            const lineParts = contentWithoutMarker.split(":");
                            const title = lineParts[0] || "";
                            const description = lineParts.slice(1).join(":");

                            return (
                              <li key={j} className="flex gap-4 items-start bg-white/50 p-4 rounded-2xl border border-emerald-100/50 shadow-sm transition-all hover:shadow-md">
                                <span className="font-bold text-emerald-600 shrink-0 mt-0.5">
                                  {listMarker}
                                </span>
                                <div>
                                  <strong className="text-zinc-950 font-bold block mb-1 text-lg">
                                    {title.trim()}
                                  </strong>
                                  <span className="text-zinc-700">
                                    {description ? `: ${description.trim()}` : ""}
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      );
                    }
                    
                    // Regular paragraph
                    return (
                      <p key={i} className="text-zinc-700">
                        {cleanParagraph}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
