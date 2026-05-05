const { createBrowserClient } = require("@supabase/ssr");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkColumns() {
  // PostgREST doesn't have a direct "list columns" but we can select one row
  const { data, error } = await supabase.from('open_questions').select('*').limit(1);
  if (error) {
    console.error("Error fetching row:", error);
  } else if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    console.log("No data in open_questions");
  }
}

checkColumns();
