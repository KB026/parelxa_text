import { createBrowserClient } from "@supabase/ssr";
import { createNoopSupabaseClient } from './noop';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing in client. Using no-op client.');
    return createNoopSupabaseClient();
  }

  const url = supabaseUrl;
  const key = supabaseAnonKey;

  return createBrowserClient(url, key);
}
