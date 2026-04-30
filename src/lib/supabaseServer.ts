import { createServerClient } from "@supabase/ssr";
import {
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/lib/supabaseClient";

export function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) return null;

  // Use dynamic require to avoid bundling next/headers in client components 
  // if this file is accidentally referenced.
  const { cookies } = require("next/headers");

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      async get(name: string) {
        const c = await cookies();
        return c.get(name)?.value;
      },
      async set(name: string, value: string, _options: unknown) {
        void _options;
        const c = await cookies();
        c.set({ name, value });
      },
      async remove(name: string, _options: unknown) {
        void _options;
        const c = await cookies();
        c.set({ name, value: "", maxAge: 0 });
      },
    },
  });
}

export async function getSupabaseAccessTokenServer(): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export { isSupabaseConfigured };
