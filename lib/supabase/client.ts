import { createBrowserClient } from "@supabase/ssr";
import { createNoopSupabaseClient } from './noop';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export function createClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing in client. Using no-op client.');
    return createNoopSupabaseClient() as unknown as SupabaseClient<Database>;
  }

  const url = supabaseUrl;
  const key = supabaseAnonKey;

  return createBrowserClient<Database>(url, key);
}

