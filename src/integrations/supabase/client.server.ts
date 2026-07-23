import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseAdminClient() {
  let url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // AGGRESSIVE CLEANUP: Remove /rest/v1 or trailing slashes
  if (url) {
    url = url.split('/rest/v1')[0].replace(/\/$/, "");
  }

  if (!url || !key) {
    console.error("Missing Supabase Admin keys in Netlify Environment Variables.");
    // Return a dummy client to prevent critical build crashes
    return createClient<Database>("https://placeholder.supabase.co", "placeholder");
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  },
});
