"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Problem } from "@/types/problem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Audience = "students" | "researchers";

const audienceCopy: Record<
  Audience,
  {
    title: string;
    helper: string;
    promptGuide: string;
  }
> = {
  students: {
    title: "Attempt mode: Students",
    helper:
      "Use this to practice reasoning with step-by-step explanations and simple language.",
    promptGuide:
      "Solve this as a guided tutor. Keep the language simple, define unfamiliar terms, and show a step-by-step approach.",
  },
  researchers: {
    title: "Attempt mode: Researchers",
    helper:
      "Use this to brainstorm assumptions, methods, references, and open risks.",
    promptGuide:
      "Treat this as a research brainstorming task. Propose assumptions, related literature directions, promising methods, and open risks.",
  },
};

export default function AttemptWorkspace({
  problem,
  audience = "students",
}: {
  problem: Problem;
  audience?: Audience;
}) {
  const [attempt, setAttempt] = useState("");

  const prompt = useMemo(() => {
    return [
      audienceCopy[audience].promptGuide,
      "",
      `Problem ID: ${problem.id}`,
      `Field: ${problem.field}`,
      `Keywords: ${problem.keywords.join(", ") || "none"}`,
      "",
      `Problem statement: ${problem.problem}`,
      "",
      attempt
        ? `My current attempt notes:\n${attempt}`
        : "I have not added personal notes yet. Please start from first principles.",
    ].join("\n");
  }, [attempt, audience, problem]);

  return (
    <Card className="border-emerald-200 bg-emerald-50/40">
      <CardHeader>
        <CardTitle>{audienceCopy[audience].title}</CardTitle>
        <div className="text-sm text-zinc-700">{audienceCopy[audience].helper}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-zinc-900">
            Your notes / partial attempt
          </span>
          <textarea
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            placeholder="Write your attempt, ideas, or assumptions here..."
            className="mt-2 min-h-36 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void navigator.clipboard.writeText(prompt)}
          >
            Copy prompt
          </Button>
          <Link href="https://chatgpt.com/" target="_blank">
            <Button size="sm" variant="secondary" className="w-full">
              Open ChatGPT
            </Button>
          </Link>
          <Link href="https://gemini.google.com/" target="_blank">
            <Button size="sm" variant="secondary" className="w-full">
              Open Gemini
            </Button>
          </Link>
          <Link href="https://claude.ai/" target="_blank">
            <Button size="sm" variant="secondary" className="w-full">
              Open Claude
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">
            Generated prompt preview
          </div>
          <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-zinc-700">
            {prompt}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
