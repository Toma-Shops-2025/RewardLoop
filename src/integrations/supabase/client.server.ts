import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const url = process.env.SUPABASE_URL || "https://hlofpkphdkarqdujmanh.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const cleanUrl = url.split('/rest/v1')[0].replace(/\/$/, "");

export const supabaseAdmin = createClient<Database>(cleanUrl, key || "dummy-key", {
  auth: {
    storage: undefined,
    persistSession: false,
    autoRefreshToken: false,
  }
});
