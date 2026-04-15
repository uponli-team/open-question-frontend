import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseServer";

function getSafeNextPath(nextValue: string | null) {
  if (!nextValue || !nextValue.startsWith("/")) return "/dashboard";
  return nextValue;
}

export async function GET(request: NextRequest) {
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));
  const loginUrl = new URL("/auth/login", request.url);

  if (!isSupabaseConfigured()) {
    loginUrl.searchParams.set("error", "supabase_not_configured");
    return NextResponse.redirect(loginUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    loginUrl.searchParams.set("error", "missing_oauth_code");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    loginUrl.searchParams.set("error", "supabase_client_unavailable");
    return NextResponse.redirect(loginUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    loginUrl.searchParams.set("error", "oauth_exchange_failed");
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.redirect(new URL(nextPath, request.url));
}
