import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/lib/supabaseClient";

export function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) return null;

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

export { isSupabaseConfigured };

