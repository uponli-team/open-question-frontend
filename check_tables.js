const { createBrowserClient } = require("@supabase/ssr");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log("Supabase not configured in env");
  process.exit(0);
}

const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTables() {
  const tables = ['open_questions', 'user_profiles', 'papers', 'categories', 'fields'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table ${table}: Error ${error.code} - ${error.message}`);
    } else {
      console.log(`Table ${table}: Count ${count}`);
    }
  }
}

checkTables();
