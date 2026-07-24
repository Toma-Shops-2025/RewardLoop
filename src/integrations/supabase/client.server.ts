import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hardcoded production fallback
const SUPABASE_URL = "https://hlofpkphdkarqdujmanh.supabase.co";

export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL || SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "missing-key",
  {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);
