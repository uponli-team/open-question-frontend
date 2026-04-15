import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const modelRows = [
  { rank: "#1", system: "o3 Pro", org: "OpenAI", validated: "75 / 500", passRate: "15.0%" },
  { rank: "#2", system: "Gemini 2.5 Pro", org: "Google", validated: "25 / 500", passRate: "5.0%" },
  { rank: "#3", system: "o4 mini", org: "OpenAI", validated: "25 / 500", passRate: "5.0%" },
  { rank: "#4", system: "o3", org: "OpenAI", validated: "44 / 500", passRate: "8.8%" },
  { rank: "#5", system: "DeepSeek R1", org: "DeepSeek", validated: "11 / 500", passRate: "2.2%" },
  { rank: "#6", system: "GPT-5", org: "OpenAI", validated: "88 / 500", passRate: "17.6%" },
  { rank: "#7", system: "Claude Opus 4", org: "Anthropic", validated: "7 / 500", passRate: "1.4%" },
  { rank: "#8", system: "Claude 3.7 Sonnet", org: "Anthropic", validated: "6 / 500", passRate: "1.2%" },
  { rank: "#9", system: "K2-Think", org: "MBZUAI-IFM", validated: "0 / 498", passRate: "0.0%" },
];

const topQuestions = [
  "A proof of dim(R[x]) ≤ 2 dim(R) + 1 without prime ideals?",
  "Is there a bijection with connected forward map but not inverse?",
  "Does every ring of integers sit inside one with a power basis?",
  "If polynomials are almost surjective, is the field algebraically closed?",
  "Probability for an n×n random matrix to have only real eigenvalues",
];

export default function LeaderboardPage() {
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
            <div className="text-2xl font-bold text-zinc-900">500</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-600">Models Evaluated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">9</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-600">Solved by Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">10</div>
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
            {topQuestions.map((q) => (
              <li key={q} className="rounded-lg border border-zinc-200 px-3 py-2">
                {q}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
