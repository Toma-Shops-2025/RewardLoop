import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const url = process.env.SUPABASE_URL || "https://hlofpkphdkarqdujmanh.supabase.co";
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

    const request = getRequest();
    if (!request?.headers) throw new Error('No headers');

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient<Database>(url, key, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims || !data.claims.sub) {
        throw new Error('Unauthorized');
    }

    return next({
      context: {
        supabase,
        userId: data.claims.sub,
      },
    });
  },
);
