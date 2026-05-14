"use client";

import { useState } from "react";
import ChatInterface from "@/components/ai/ChatInterface";
import MCPProblemList from "@/components/ai/MCPProblemList";
import SolutionFeed from "@/components/ai/SolutionFeed";
import type { MCPProblem } from "@/types/mcp";
import { Sparkles, BrainCircuit, Search, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function AIResearcherPage() {
  const [selectedProblem, setSelectedProblem] = useState<MCPProblem | null>(null);

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-600/20">
            <BrainCircuit className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
                AI Research Agent
              </h1>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Experimental
              </Badge>
            </div>
            <p className="text-zinc-500 mt-1">
              Collaborate with NVIDIA NIM to solve the world's most complex open questions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Problem Selection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-bold text-zinc-900">Open Questions Feed</h2>
          </div>
          <div className="h-[calc(100vh-320px)] overflow-y-auto pr-2 scrollbar-hide">
            <MCPProblemList 
              onSelectProblem={setSelectedProblem} 
              selectedProblemId={selectedProblem?.id} 
            />
          </div>
        </div>

        {/* Middle: Chat Agent */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-zinc-900">Agent Collaboration</h2>
          </div>
          <ChatInterface 
            contextProblem={selectedProblem?.statement} 
            initialMessage={selectedProblem ? `I'm interested in this problem: "${selectedProblem.statement}". Can you help me brainstorm some initial approaches?` : undefined}
          />
        </div>

        {/* Right: Solutions Feed */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-bold text-zinc-900">Research Solutions</h2>
          </div>
          <div className="h-[calc(100vh-320px)] overflow-y-auto pr-2 scrollbar-hide">
            <SolutionFeed problem={selectedProblem} />
          </div>
        </div>
      </div>
    </div>
  );
}
