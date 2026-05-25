import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET /api/solutions?problem_id=xxx  — list solutions, optionally filtered
export async function GET(req: NextRequest) {
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const problemId = req.nextUrl.searchParams.get("problem_id");
  const viewerId = req.nextUrl.searchParams.get("viewer_id");

  let query = supabase
    .from("solutions")
    .select("*")
    .order("created_at", { ascending: false });

  if (problemId) {
    query = query.eq("problem_id", problemId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let solutions = data || [];

  // If viewerId is provided, also fetch their votes and attach them
  if (viewerId && solutions.length > 0) {
    const solutionIds = solutions.map(s => s.id);
    const { data: viewerVotes } = await supabase
      .from("solution_votes")
      .select("solution_id, vote_type")
      .eq("user_id", viewerId)
      .in("solution_id", solutionIds);
    
    if (viewerVotes) {
      const voteMap = Object.fromEntries(viewerVotes.map(v => [v.solution_id, v.vote_type]));
      solutions = solutions.map(s => ({
        ...s,
        viewer_vote: voteMap[s.id] || null
      }));
    }
  }

  return NextResponse.json({ solutions });
}

// POST /api/solutions  — create a new solution
export async function POST(req: NextRequest) {
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { problem_id, solution_text, user_id } = body;

  if (!problem_id || !solution_text) {
    return NextResponse.json({ error: "problem_id and solution_text are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("solutions")
    .insert({
      problem_id,
      solution_text,
      user_id: user_id || null,
      status: "pending",
      upvotes: 0,
      downvotes: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
