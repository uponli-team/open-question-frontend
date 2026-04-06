import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { hasDevAuthServer } from "@/lib/devAuth.server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
    children: React.ReactNode;
  }>) {
  // If Supabase is configured, require an authenticated user.
  // If not configured yet, we fall back to mock mode so development UI still works.
  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        const hasDevAuth = await hasDevAuthServer();
        if (!hasDevAuth) redirect("/auth/login");
      }
    }
  }

  return <div className="mx-auto w-full max-w-6xl px-4 py-10">{children}</div>;
}

