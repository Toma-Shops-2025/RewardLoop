import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseAdminClient() {
  let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // AGGRESSIVE CLEANUP: Remove /rest/v1 or trailing slashes
  if (url) {
    url = url.split('/rest/v1')[0].replace(/\/$/, "");
  }

  if (!url || !key) {
    console.error(`[Supabase Server] Missing Configuration! URL: ${!!url}, Key: ${!!key}. Please check your Netlify Environment Variables.`);
    return createClient<Database>("https://missing-url.supabase.co", "missing-key");
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
