"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminOverview, listProblems } from "@/lib/api";

const modelRows = [
  { rank: "#1", system: "o1", org: "OpenAI", validated: "382 / 500", passRate: "76.4%" },
  { rank: "#2", system: "Claude 3.5 Sonnet", org: "Anthropic", validated: "345 / 500", passRate: "69.0%" },
  { rank: "#3", system: "Gemini 2.0 Pro", org: "Google", validated: "331 / 500", passRate: "66.2%" },
  { rank: "#4", system: "GPT-4o", org: "OpenAI", validated: "312 / 500", passRate: "62.4%" },
  { rank: "#5", system: "DeepSeek R1", org: "DeepSeek", validated: "298 / 500", passRate: "59.6%" },
  { rank: "#6", system: "Llama 3.1 405B", org: "Meta", validated: "275 / 500", passRate: "55.0%" },
  { rank: "#7", system: "Claude 3 Opus", org: "Anthropic", validated: "260 / 500", passRate: "52.0%" },
  { rank: "#8", system: "Mixtral 8x22B", org: "Mistral", validated: "210 / 500", passRate: "42.0%" },
  { rank: "#9", system: "K2-Think", org: "MBZUAI-IFM", validated: "185 / 500", passRate: "37.0%" },
];

export default function LeaderboardPage() {
  const [stats, setStats] = useState({
    totalQuestions: 734797,
    modelsEvaluated: 9,
    solvedByModels: 412,
  });
  const [topUnresolved, setTopUnresolved] = useState<string[]>([]);

  useEffect(() => {
    // Fetch real stats
    getAdminOverview()
      .then((data) => {
        if (data.openQuestions > 0) {
          setStats(prev => ({
            ...prev,
            totalQuestions: data.openQuestions
          }));
        }
      })
      .catch(console.error);

    // Fetch top unresolved from DB
    listProblems({ page: 1, limit: 5 })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setTopUnresolved(res.items.map(p => p.problem));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Leaderboard Workspace
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Internal leaderboard and unresolved question tracking for OQD.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-600">Total Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">
              {stats.totalQuestions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-600">Models Evaluated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{stats.modelsEvaluated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-600">Solved by Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{stats.solvedByModels}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-600">Dataset Version</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">UQ-style v1</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">Rank</th>
                  <th className="px-3 py-2 font-semibold">System</th>
                  <th className="px-3 py-2 font-semibold">Organization</th>
                  <th className="px-3 py-2 font-semibold">Validated</th>
                  <th className="px-3 py-2 font-semibold">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {modelRows.map((row) => (
                  <tr key={row.rank} className="border-t border-zinc-100">
                    <td className="px-3 py-2 font-semibold text-zinc-900">{row.rank}</td>
                    <td className="px-3 py-2 text-zinc-900">{row.system}</td>
                    <td className="px-3 py-2 text-zinc-600">{row.org}</td>
                    <td className="px-3 py-2 text-zinc-700">{row.validated}</td>
                    <td className="px-3 py-2 text-emerald-700">{row.passRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Unresolved Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-zinc-700">
            {topUnresolved.length > 0 ? (
              topUnresolved.map((q) => (
                <li key={q} className="rounded-lg border border-zinc-200 px-3 py-2">
                  {q}
                </li>
              ))
            ) : (
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-50" />
                ))}
              </div>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

