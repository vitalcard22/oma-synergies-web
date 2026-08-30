import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env.local ' +
    'and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

/**
 * Client-side Supabase client, using the publishable (anon) key.
 * Safe to use in browser code - Row Level Security policies (set up via the
 * SQL migration) are what actually restrict what each user can read/write,
 * not the secrecy of this key.
 *
 * Never use the service role key here. That key bypasses RLS entirely and
 * must only ever be used server-side (Vercel serverless functions), never
 * shipped to the browser.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
