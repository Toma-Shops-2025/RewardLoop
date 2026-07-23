import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    let url = process.env.SUPABASE_URL || "";
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || "";

    // AGGRESSIVE CLEANUP: Remove /rest/v1 or trailing slashes
    if (url) {
      url = url.split('/rest/v1')[0].replace(/\/$/, "");
    }

    if (!url || !key) {
      console.error("[Supabase Middleware] Missing keys.");
      throw new Error("Missing Supabase environment variables. App configuration error.");
    }

    const request = getRequest();
    if (!request?.headers) throw new Error('Unauthorized: No headers');

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Unauthorized');

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient<Database>(url, key, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims || !data.claims.sub) throw new Error('Unauthorized: Invalid session');

    return next({
      context: { supabase, userId: data.claims.sub, claims: data.claims },
    });
  },
);
