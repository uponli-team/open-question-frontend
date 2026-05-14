export interface MCPProblem {
  type: "problem";
  id: string;
  source: string;
  title: string | null;
  statement: string;
  confidence: number;
}

export interface Solution {
  id: string;
  problem_id: string;
  user_id: string;
  solution_text: string;
  status: "pending" | "approved" | "rejected";
  upvotes: number;
  downvotes: number;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
