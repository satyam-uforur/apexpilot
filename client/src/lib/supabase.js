import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (e) {
  console.warn('Supabase not configured, leaderboard disabled:', e.message);
  supabase = null;
}

export { supabase };
