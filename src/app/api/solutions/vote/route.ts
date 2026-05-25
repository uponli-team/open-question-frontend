import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// POST /api/solutions/vote  — upvote or downvote a solution with "one user one vote" enforcement
export async function POST(req: NextRequest) {
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { solution_id, type, user_id } = body;

  if (!solution_id || !type || (type !== "up" && type !== "down")) {
    return NextResponse.json(
      { error: "solution_id and type ('up' or 'down') are required" },
      { status: 400 }
    );
  }

  if (!user_id) {
    return NextResponse.json({ error: "Authentication required to vote" }, { status: 401 });
  }

  // 1. Check if user already voted
  const { data: existingVote, error: checkErr } = await supabase
    .from("solution_votes")
    .select("*")
    .eq("solution_id", solution_id)
    .eq("user_id", user_id)
    .single();

  if (checkErr && checkErr.code !== "PGRST116") {
    // PGRST116 means no row found, which is fine. Other errors (like missing table) are NOT fine.
    return NextResponse.json({ 
      error: "Database configuration error. Please ensure the 'solution_votes' table exists.",
      details: checkErr.message 
    }, { status: 500 });
  }

  // 2. Fetch current solution counts
  const { data: solution, error: solErr } = await supabase
    .from("solutions")
    .select("*")
    .eq("id", solution_id)
    .single();

  if (solErr || !solution) {
    return NextResponse.json({ error: "Solution not found" }, { status: 404 });
  }

  let upDelta = 0;
  let downDelta = 0;

  if (existingVote) {
    // User already voted
    if (existingVote.vote_type === type) {
      // Same vote, ignore
      return NextResponse.json(solution);
    } else {
      // Switching vote (e.g., from up to down)
      if (type === "up") {
        upDelta = 1;
        downDelta = -1;
      } else {
        upDelta = -1;
        downDelta = 1;
      }
      
      // Update the vote record
      const { error: upErr } = await supabase
        .from("solution_votes")
        .update({ vote_type: type })
        .eq("id", existingVote.id);
        
      if (upErr) {
        return NextResponse.json({ error: "Failed to update vote record" }, { status: 500 });
      }
    }
  } else {
    // First time voting
    if (type === "up") upDelta = 1;
    else downDelta = 1;

    // Insert new vote record
    const { error: insErr } = await supabase
      .from("solution_votes")
      .insert({
        user_id,
        solution_id,
        vote_type: type
      });
      
    if (insErr) {
      return NextResponse.json({ 
        error: "Failed to record vote. Ensure the database schema is updated.",
        details: insErr.message 
      }, { status: 500 });
    }
  }

  // 3. Update solution counts
  const newUpvotes = Math.max(0, (solution.upvotes || 0) + upDelta);
  const newDownvotes = Math.max(0, (solution.downvotes || 0) + downDelta);

  const { data: updated, error: updateErr } = await supabase
    .from("solutions")
    .update({ 
      upvotes: newUpvotes,
      downvotes: newDownvotes 
    })
    .eq("id", solution_id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update solution counts" }, { status: 500 });
  }

  return NextResponse.json(updated);
}
