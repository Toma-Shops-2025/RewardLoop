import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    // 1. GATHER KEYS WITH FALLBACKS
    let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder";

    // 2. CLEAN URL (Stop the double /rest/v1 error)
    if (url) {
      url = url.split('/rest/v1')[0].replace(/\/$/, "");
    }

    const request = getRequest();
    if (!request?.headers) throw new Error('No headers');

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Return null context instead of throwing to prevent INVARIANT crash
        return next({ context: { supabase: null, userId: null } });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient<Database>(url, key, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    try {
        const { data } = await supabase.auth.getClaims(token);
        return next({
            context: { supabase, userId: data?.claims?.sub || null },
        });
    } catch (e) {
        return next({ context: { supabase: null, userId: null } });
    }
  },
);
