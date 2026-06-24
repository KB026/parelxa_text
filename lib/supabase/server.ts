import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createNoopSupabaseClient } from './noop';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase env vars at runtime. NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING', 'NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
    return createNoopSupabaseClient();
  }

  const url = supabaseUrl;
  const key = supabaseAnonKey;

  let cookieStore: ReturnType<typeof cookies>;
  try {
    cookieStore = cookies();
  } catch {
    return createNoopSupabaseClient();
  }

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try { cookieStore.set({ name, value, ...options }); } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.set({ name, value: "", ...options }); } catch {}
      },
    },
  });
}
