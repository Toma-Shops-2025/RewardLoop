import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// THE BULLETPROOF CLIENT: Never throws on creation.
function createSupabaseClient() {
  let url = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
  let key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder";

  // Clean URL to prevent the rest/v1/rest/v1 double path error
  if (url && url.includes(".supabase.co")) {
    url = url.split('/rest/v1')[0].replace(/\/$/, "");
  } else {
    // If URL is garbage, use a valid-looking fake one to prevent internal library crashes
    url = "https://missing-config.supabase.co";
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

// Export as a proxy so it doesn't execute until needed
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
