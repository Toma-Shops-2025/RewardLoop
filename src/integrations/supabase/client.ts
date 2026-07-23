import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseClient() {
  // Try to find the URL under any possible name
  let url = import.meta.env.VITE_SUPABASE_URL ||
            process.env.SUPABASE_URL ||
            "https://placeholder.supabase.co";

  // Try to find the Key under any possible name
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
              process.env.SUPABASE_ANON_KEY ||
              "placeholder";

  // Clean the URL
  url = url.split('/rest/v1')[0].replace(/\/$/, "");

  // RETURN A VALID CLIENT NO MATTER WHAT (Stops the Invariant Crash)
  return createClient<Database>(url, key, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
