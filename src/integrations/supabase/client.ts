import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseClient() {
  let url = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

  // AGGRESSIVE CLEANUP: Remove /rest/v1 or trailing slashes
  if (url) {
    url = url.split('/rest/v1')[0].replace(/\/$/, "");
  }

  if (!url || !key) {
    const errorMsg = `[Supabase Client] Missing Configuration! URL: ${!!url}, Key: ${!!key}. Please check your Netlify Environment Variables.`;
    console.error(errorMsg);
    // Don't use a dummy URL that might trigger internal invariant checks
    // Instead, return a client that will fail gracefully on network calls
    return createClient<Database>("https://missing-url.supabase.co", "missing-key");
  }

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
